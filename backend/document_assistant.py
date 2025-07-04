import os
import json
import pandas as pd
from datetime import datetime
from snowflake.core import Root
from snowflake.snowpark import Session
from snowflake.snowpark.exceptions import SnowparkSQLException # ADDED THIS LINE
import logging # ADDED THIS LINE

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s') # ADDED THIS LINE

# Default configuration values
NUM_CHUNKS = 3  # Number of chunks provided as context
CORTEX_SEARCH_DATABASE = "CC_QUICKSTART_CORTEX_SEARCH_DOCS"
CORTEX_SEARCH_SCHEMA = "DATA"
CORTEX_SEARCH_SERVICE = "CC_SEARCH_SERVICE_CS"
DEFAULT_MODEL = "llama3.3-70b"
MIN_SUGGESTED_QUESTIONS = 4  # Minimum number of suggested questions
CHAT_HISTORY_TABLE = "CHAT_HISTORY"  # Table to store chat history

# Columns to query in the service
COLUMNS = [
    "chunk",
    "relative_path",
    "category"
]

class DocumentAssistant:
    def __init__(self):
        # Define CONNECTION_PARAMETERS INSIDE __init__ to ensure .env is loaded
        CONNECTION_PARAMETERS = {
            "account": os.environ.get("SNOWFLAKE_ACCOUNT"),
            "user": os.environ.get("SNOWFLAKE_USER"),
            "password": os.environ.get("SNOWFLAKE_PASSWORD"),
            "role": os.environ.get("SNOWFLAKE_ROLE"),
            "database": os.environ.get("SNOWFLAKE_DATABASE"),
            "warehouse": os.environ.get("SNOWFLAKE_WAREHOUSE"),
            "schema": os.environ.get("SNOWFLAKE_SCHEMA"),
        }
        # Initialize Snowflake session
        self.session = Session.builder.configs(CONNECTION_PARAMETERS).create()
        self.root = Root(self.session)

        # Set up Cortex search service
        try:
            self.svc = self.root.databases[CORTEX_SEARCH_DATABASE].schemas[CORTEX_SEARCH_SCHEMA].cortex_search_services[CORTEX_SEARCH_SERVICE]
            logging.info(f"Successfully connected to search service: {CORTEX_SEARCH_SERVICE}")
        except Exception as e:
            logging.exception(f"Error connecting to search service: {e}")
            self.svc = None

        # Set up pandas display options
        pd.set_option("max_colwidth", None)

    def _reinitialize_session_and_svc(self):
        """Re-establishes the Snowflake session and Cortex Search Service connection."""
        logging.info("Re-initializing Snowflake session and Cortex Search Service due to expired token.")
        try:
            # Define CONNECTION_PARAMETERS INSIDE this method to ensure it's fresh
            CONNECTION_PARAMETERS = {
                "account": os.environ.get("SNOWFLAKE_ACCOUNT"),
                "user": os.environ.get("SNOWFLAKE_USER"),
                "password": os.environ.get("SNOWFLAKE_PASSWORD"),
                "role": os.environ.get("SNOWFLAKE_ROLE"),
                "database": os.environ.get("SNOWFLAKE_DATABASE"),
                "warehouse": os.environ.get("SNOWFLAKE_WAREHOUSE"),
                "schema": os.environ.get("SNOWFLAKE_SCHEMA"),
            }
            self.session = Session.builder.configs(CONNECTION_PARAMETERS).create()
            self.root = Root(self.session)
            self.svc = self.root.databases[CORTEX_SEARCH_DATABASE].schemas[CORTEX_SEARCH_SCHEMA].cortex_search_services[CORTEX_SEARCH_SERVICE]
            logging.info("Successfully re-initialized session and search service.")
            return True
        except Exception as e:
            logging.exception(f"Failed to re-initialize session or search service: {e}")
            self.svc = None
            return False

    def _ensure_chat_history_table_exists(self):
        """Check if chat history table exists"""
        try:
            # Instead of creating the table, just check if it exists
            check_table_sql = f"""
            SELECT COUNT(*) AS table_exists
            FROM information_schema.tables
            WHERE table_catalog = '{CORTEX_SEARCH_DATABASE}'
              AND table_schema = '{CORTEX_SEARCH_SCHEMA}'
              AND table_name = '{CHAT_HISTORY_TABLE}'
            """
            result = self.session.sql(check_table_sql).collect()
            if result and result[0]['TABLE_EXISTS'] > 0:
                logging.info(f"Chat history table {CHAT_HISTORY_TABLE} exists")
                return True
            else:
                logging.info(f"Chat history table {CHAT_HISTORY_TABLE} does not exist")
                return False
        except Exception as e:
            logging.exception(f"Error checking chat history table: {e}")
            return False

    def get_available_documents(self):
        """Returns a list of available documents in the document store"""
        try:
            docs_available = self.session.sql("ls @docs").collect()
            list_docs = [doc["name"] for doc in docs_available]
            return list_docs
        except Exception as e:
            logging.exception(f"Error retrieving documents: {e}")
            return []

    def get_available_categories(self):
        """Returns a list of available document categories"""
        try:
            categories = self.session.sql("select category from docs_chunks_table group by category").collect()
            cat_list = ['ALL']
            for cat in categories:
                cat_list.append(cat.CATEGORY)
            return cat_list
        except Exception as e:
            logging.exception(f"Error retrieving categories: {e}")
            return ['ALL']

    def get_similar_chunks(self, query, category="ALL", num_chunks=NUM_CHUNKS):
        """Retrieves similar chunks from the document corpus using Cortex Search Service"""
        if not self.svc:
            logging.error("Search service not available, cannot retrieve chunks.")
            return json.dumps({"error": "Search service not available", "results": []})

        try:
            if category == "ALL":
                response = self.svc.search(query, COLUMNS, limit=num_chunks)
            else:
                filter_obj = {"@eq": {"category": category}}
                response = self.svc.search(query, COLUMNS, filter=filter_obj, limit=num_chunks)

            return response.json()
        except Exception as e:
            logging.exception(f"Error retrieving similar chunks: {e}")
            return json.dumps({"error": str(e), "results": []})

    def create_prompt(self, question, use_rag=True, category="ALL", user_id=None, org_id=None):
        """Creates a prompt for Cortex complete API with or without RAG context"""
        if use_rag:
            try:
                prompt_context = self.get_similar_chunks(question, category)

                # Include user_id and org_id in the prompt if provided
                user_context = ""
                if user_id or org_id:
                    user_context = f"""
                    Additional context:
                    User ID: {user_id if user_id else 'Not provided'}
                    Organization ID: {org_id if org_id else 'Not provided'}
                    """

                # Include previous interaction context if available
                chat_history_context = ""
                if user_id:
                    previous_interactions = self.get_recent_chat_history(user_id, org_id, limit=3)
                    if previous_interactions:
                        chat_history_context = "\nPrevious interactions:\n"
                        for idx, interaction in enumerate(previous_interactions, 1):
                            chat_history_context += f"Q{idx}: {interaction['question']}\nA{idx}: {interaction['answer']}\n\n"

                prompt = f"""
               You are a specialized medical assistant designed to assist healthcare providers in extracting and analyzing patient information from medical records, discharge summaries, clinical notes, and external lab reports. Your goal is to provide accurate, concise medical information based solely on the data within the <context> and </context> tags, while considering prior interactions in the <chat_history> and </chat_history> tags.

        ### Guidelines for Answering
        - Respond directly to the query using precise medical terminology where appropriate.
        - Extract and organize patient information from the provided context efficiently.
        - For queries with multiple clinical questions, address each part separately in clear, labeled sections.
        - If the query asks for a complete summary (e.g., "everything in that report"), provide all available details from the context, organized by categories such as patient demographics, medical history, diagnoses, treatments, procedures, lab results, and clinical notes.
        - Use bullet points, short paragraphs, or tables for readability, emphasizing key findings, diagnoses, treatments, and recommendations.
        - If information is missing, state: "The patient record does not contain information about that specific question."
        - Avoid speculation, external knowledge, or excessive elaboration unless a full summary is requested.

        ### Patient Context Awareness
        - Identify the patient in the query and confirm if it matches the context or differs from chat history.
        - If the query references a new patient (by name, ID, or case), use only the current context for that patient.
        - If no matching information is found for a queried patient, respond: "I don’t have information about that patient in the current records. The information I have is for [current patient name/ID]."
        - If patient identity is unclear, note: "Patient identity is unclear in the context; using available data for [current patient name/ID if determinable]."
        - Never mix data from different patients.

        ### External Lab Reports Integration
        - Match lab reports to the patient using:
          * Unique Health ID (UHID) as the primary identifier
          * Patient name (allow for minor spelling variations)
          * Age, gender, referring doctor, and test date (if aligned with treatment timeline)
        - Correlate lab findings with clinical history and current presentation, noting the source (e.g., "Per external lab report").
        - If internal and external lab results conflict, present both clearly, attributing each source.
        - If lab data is incomplete or unmatchable, state: "External lab report data is incomplete or does not match the patient reliably."

        ### Response Structure
        - Confirm the patient identity (name/ID) if available in the context.
        - Break down complex queries into components and address each in a logical, clinical order.
        - For comprehensive summary requests (e.g., "everything in that report"), structure the response with clear sections:
          * Patient Demographics: Name, ID, age, gender, etc.
          * Medical History: Past conditions, surgeries, allergies, etc.
          * Diagnoses: Current and past diagnoses from the context.
          * Treatments: Medications, therapies, interventions, etc.
          * Procedures: Surgeries, interventions, or other procedures.
          * Lab Results: Internal and external lab findings, with sources.
          * Clinical Notes: Key observations, progress notes, etc.
        - Prioritize recent data from the context over older chat history if discrepancies arise.

        <chat_history>
        {chat_history_context}
        </chat_history>

        <context>
        {prompt_context}
        </context>

        <question>
        {question}
        </question>

                """

                json_data = json.loads(prompt_context) if isinstance(prompt_context, str) else prompt_context
                relative_paths = set(item.get('relative_path', '') for item in json_data.get('results', []))

            except Exception as e:
                logging.exception(f"Error creating RAG prompt: {e}")
                prompt = f"""[0]
                'Question:
                {question}
                Answer: '
                """
                relative_paths = set()
        else:
            prompt = f"""[0]
            'Question:
            {question}
            Answer: '
            """
            relative_paths = set()

        return prompt, relative_paths

    def get_answer(self, question, model_name=DEFAULT_MODEL, use_rag=True, category="ALL", user_id=None, org_id=None):
        """Process a question and return an answer using Cortex complete API"""
        max_retries = 1 # Allow one retry after re-authentication
        for attempt in range(max_retries + 1):
            try:
                prompt, relative_paths = self.create_prompt(question, use_rag, category, user_id, org_id)

                cmd = """
                    select snowflake.cortex.complete(?, ?) as response
                """

                df_response = self.session.sql(cmd, params=[model_name, prompt]).collect()
                response_text = df_response[0].RESPONSE

                # Generate suggested questions based on the original question
                suggested_questions = self.get_suggested_questions_from_kb(question, category)

                # Store interaction in chat history
                if user_id:
                    self.store_chat_history(
                        user_id=user_id,
                        org_id=org_id,
                        question=question,
                        answer=response_text,
                        model_name=model_name,
                        category=category,
                        related_documents=list(relative_paths),
                        suggested_questions=suggested_questions
                    )

                return {
                    "answer": response_text,
                    "related_documents": list(relative_paths),
                    "suggested_questions": suggested_questions
                }
            except SnowparkSQLException as e:
                if "Authentication token has expired" in str(e) and attempt < max_retries:
                    logging.warning("Snowflake authentication token expired. Attempting to re-authenticate...")
                    if self._reinitialize_session_and_svc():
                        continue # Retry the operation
                    else:
                        logging.error("Failed to re-authenticate. Cannot proceed with query.")
                        return {
                            "answer": f"I'm unable to answer that question at the moment due to a connection issue. Please try again later.",
                            "related_documents": [],
                            "suggested_questions": self.generate_fallback_questions()
                        }
                else:
                    logging.exception(f"Error getting answer: {e}")
                    return {
                        "answer": f"I'm unable to answer that question at the moment. Please try again later.",
                        "related_documents": [],
                        "suggested_questions": self.generate_fallback_questions()
                    }
            except Exception as e:
                logging.exception(f"Error getting answer: {e}")
                return {
                    "answer": f"I'm unable to answer that question at the moment. Please try again later.",
                    "related_documents": [],
                    "suggested_questions": self.generate_fallback_questions()
                }

    def store_chat_history(self, user_id, org_id, question, answer, model_name, category, related_documents=None, suggested_questions=None):
        """Store chat interaction in the history table"""
        try:
            # Check if table exists
            table_exists = self._ensure_chat_history_table_exists()
            if not table_exists:
                logging.info("Chat history table doesn't exist, skipping storage")
                return False

            # Convert lists to JSON strings for storage
            related_docs_str = json.dumps(related_documents if related_documents else [])
            suggested_questions_str = json.dumps(suggested_questions if suggested_questions else [])

            # Create a direct SQL string with the JSON values inline
            # This avoids using PARSE_JSON in the VALUES clause
            insert_sql = f"""
            INSERT INTO {CORTEX_SEARCH_DATABASE}.{CORTEX_SEARCH_SCHEMA}.{CHAT_HISTORY_TABLE}
            (user_id, org_id, question, answer, model_name, category, related_documents, suggested_questions)
            SELECT ?, ?, ?, ?, ?, ?,
                PARSE_JSON('{related_docs_str}'),
                PARSE_JSON('{suggested_questions_str}')
            """

            self.session.sql(
                insert_sql,
                params=[
                    user_id,
                    org_id if org_id else None,
                    question,
                    answer,
                    model_name,
                    category
                ]
            ).collect()

            logging.info(f"Stored chat history for user_id: {user_id}, org_id: {org_id}")
            return True
        except Exception as e:
            logging.exception(f"Error storing chat history: {e}")
            return False

    def get_recent_chat_history(self, user_id, org_id=None, limit=5):
        """Retrieve recent chat history for a user"""
        try:
            # Check if table exists
            table_exists = self._ensure_chat_history_table_exists()
            if not table_exists:
                logging.info("Chat history table doesn't exist, returning empty history")
                return []

            # Query with or without org_id filter
            if org_id:
                query = f"""
                SELECT question, answer, timestamp, category
                FROM {CORTEX_SEARCH_DATABASE}.{CORTEX_SEARCH_SCHEMA}.{CHAT_HISTORY_TABLE}
                WHERE user_id = ? AND org_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
                """
                df = self.session.sql(query, params=[user_id, org_id, limit]).collect()
            else:
                query = f"""
                SELECT question, answer, timestamp, category
                FROM {CORTEX_SEARCH_DATABASE}.{CORTEX_SEARCH_SCHEMA}.{CHAT_HISTORY_TABLE}
                WHERE user_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
                """
                df = self.session.sql(query, params=[user_id, limit]).collect()

            # Convert to list of dictionaries
            history = []
            for row in df:
                history.append({
                    "question": row.QUESTION,
                    "answer": row.ANSWER,
                    "timestamp": row.TIMESTAMP.isoformat() if row.TIMESTAMP else None,
                    "category": row.CATEGORY
                })

            return history
        except Exception as e:
            logging.exception(f"Error retrieving chat history: {e}")
            return []

    def get_user_stats(self, user_id, org_id=None):
        """Get statistics about user's interactions"""
        try:
            # Check if table exists
            table_exists = self._ensure_chat_history_table_exists()
            if not table_exists:
                logging.info("Chat history table doesn't exist, returning empty stats")
                return {
                    "total_questions": 0,
                    "first_interaction": None,
                    "last_interaction": None,
                    "categories_count": 0,
                    "categories": []
                }

            # Build query based on available filters
            if org_id:
                query = f"""
                SELECT
                    COUNT(*) as total_questions,
                    MIN(timestamp) as first_interaction,
                    MAX(timestamp) as last_interaction,
                    COUNT(DISTINCT category) as categories_count,
                    ARRAY_AGG(DISTINCT category) as categories
                FROM {CORTEX_SEARCH_DATABASE}.{CORTEX_SEARCH_SCHEMA}.{CHAT_HISTORY_TABLE}
                WHERE user_id = ? AND org_id = ?
                """
                df = self.session.sql(query, params=[user_id, org_id]).collect()
            else:
                query = f"""
                SELECT
                    COUNT(*) as total_questions,
                    MIN(timestamp) as first_interaction,
                    MAX(timestamp) as last_interaction,
                    COUNT(DISTINCT category) as categories_count,
                    ARRAY_AGG(DISTINCT category) as categories
                FROM {CORTEX_SEARCH_DATABASE}.{CORTEX_SEARCH_SCHEMA}.{CHAT_HISTORY_TABLE}
                WHERE user_id = ?
                """
                df = self.session.sql(query, params=[user_id]).collect()

            if df and len(df) > 0:
                stats = {
                    "total_questions": df[0].TOTAL_QUESTIONS,
                    "first_interaction": df[0].FIRST_INTERACTION.isoformat() if df[0].FIRST_INTERACTION else None,
                    "last_interaction": df[0].LAST_INTERACTION.isoformat() if df[0].LAST_INTERACTION else None,
                    "categories_count": df[0].CATEGORIES_COUNT,
                    "categories": df[0].CATEGORIES
                }
                return stats
            else:
                return {
                    "total_questions": 0,
                    "first_interaction": None,
                    "last_interaction": None,
                    "categories_count": 0,
                    "categories": []
                }
        except Exception as e:
            logging.exception(f"Error retrieving user stats: {e}")
            return {
                "error": str(e),
                "total_questions": 0
            }

    def get_suggested_questions_from_kb(self, question, category="ALL", min_questions=MIN_SUGGESTED_QUESTIONS):
        """Get suggested questions from knowledge base stored in stage docs"""
        try:
            # Instead of using vector search, query specifically for questions in docs
            if category != "ALL":
                query = """
                    SELECT chunk FROM docs_chunks_table
                    WHERE category = ?
                    AND CONTAINS(chunk, '?')  -- Look for question marks in the content
                    LIMIT 50
                """
                df_chunks = self.session.sql(query, params=[category]).collect()
            else:
                query = """
                    SELECT chunk FROM docs_chunks_table
                    WHERE CONTAINS(chunk, '?')  -- Look for question marks in the content
                    LIMIT 50
                """
                df_chunks = self.session.sql(query).collect()

            # Extract questions from the results
            suggested_questions = []
            for row in df_chunks:
                chunk_text = row.CHUNK
                # Split by sentence endings and question marks
                for sentence in self._split_into_sentences(chunk_text):
                    sentence = sentence.strip()
                    if sentence.endswith("?") and len(sentence) > 10 and len(sentence) < 100:
                        # Check if this is a reasonable question and not too similar to existing ones
                        if not any(self._is_similar_question(sentence, q) for q in suggested_questions):
                            suggested_questions.append(sentence)
                            if len(suggested_questions) >= min_questions:
                                break
                if len(suggested_questions) >= min_questions:
                    break

            # If we don't have enough questions, use fallback
            if len(suggested_questions) < min_questions:
                suggested_questions.extend(self.generate_fallback_questions()[:min_questions-len(suggested_questions)])

            return suggested_questions[:min_questions]
        except Exception as e:
            logging.exception(f"Error generating suggested questions from KB: {e}")
            return self.generate_fallback_questions()

    def _generate_questions_from_kb(self, question, category="ALL", num_questions=4):
        """Generate questions from knowledge base using the LLM"""
        try:
            # Get relevant chunks from the knowledge base
            context_data = self.get_similar_chunks(question, category, num_chunks=5)

            # Parse the context
            if isinstance(context_data, str):
                context_data = json.loads(context_data)

            context_text = ""
            for item in context_data.get('results', []):
                chunk = item.get('chunk', '')
                if chunk:
                    context_text += chunk + "\n\n"

            # Create a prompt to generate questions based on the knowledge base
            prompt = f"""
            Based on the following context from the knowledge base, generate {num_questions} concise questions
            that users might ask related to this content. The questions should be directly related to
            healthcare management system scenarios and user queries found in the knowledge base.

            Context:
            {context_text}

            Original Query: {question}

            Rules for questions:
            1. Each question must be concise (less than 100 characters)
            2. Each question must end with a question mark
            3. Questions must be related to healthcare management system scenarios
            4. Questions should be directly answerable from the knowledge base

            Format your answer as a simple list of questions, one per line.
            """

            cmd = """
                select snowflake.cortex.complete(?, ?) as response
            """

            df_response = self.session.sql(cmd, params=[DEFAULT_MODEL, prompt]).collect()
            response_text = df_response[0].RESPONSE

            # Process response to extract questions
            questions = []
            for line in response_text.strip().split('\n'):
                # Remove common list prefixes and clean up
                clean_line = line.strip()
                for prefix in ['- ', '* ', '1. ', '2. ', '3. ', '4. ', '5. ', '• ']:
                    if clean_line.startswith(prefix):
                        clean_line = clean_line[len(prefix):]
                        break

                if clean_line and clean_line not in questions and '?' in clean_line and len(clean_line) < 100:
                    questions.append(clean_line)

            return questions
        except Exception as e:
            logging.exception(f"Error generating questions from KB: {e}")
            return []

    def _split_into_sentences(self, text):
        """Split text into sentences, handling question marks properly"""
        # Split by common sentence endings
        raw_sentences = []
        # Look for sentence endings followed by spaces
        for splitter in ['. ', '? ', '! ', '.\n', '?\n', '!\n']:
            parts = text.split(splitter)
            if len(parts) > 1:
                for i in range(len(parts) - 1):
                    raw_sentences.append(parts[i] + splitter[0])
                raw_sentences.append(parts[-1])
                break

        # If no sentence endings found, treat as one sentence
        if not raw_sentences:
            raw_sentences = [text]

        return raw_sentences

    def _is_similar_question(self, q1, q2):
        """Check if two questions are similar based on word overlap"""
        words1 = set(q1.lower().split())
        words2 = set(q2.lower().split())
        overlap = len(words1.intersection(words2))
        return overlap > min(len(words1), len(words2)) * 0.7

    def generate_fallback_questions(self):
        """Generate generic healthcare-related questions as fallback"""
        return [
            "How to create a new patient registration?",
            "How to assign a bed to a patient?",
            "How to view items present in the inventory store?",
            "How to generate a hospital bill?"
        ]

    def get_document_url(self, document_path, expiration_seconds=360):
        """Generate a presigned URL for a document"""
        try:
            cmd = f"select GET_PRESIGNED_URL(@docs, '{document_path}', {expiration_seconds}) as URL_LINK from directory(@docs)"
            df_url_link = self.session.sql(cmd).to_pandas()
            url_link = df_url_link._get_value(0, 'URL_LINK')
            return url_link
        except Exception as e:
            logging.exception(f"Error generating document URL: {e}")
            return None

    def close(self):
        """Close the Snowflake session"""
        if self.session:
            self.session.close()
