#!/usr/bin/env python
# coding: utf-8

# In[1]:


get_ipython().system('pip install snowflake -U')
get_ipython().system('pip install flask')
get_ipython().system('pip install flask-cors')
get_ipython().system('pip install snowflake.core')
get_ipython().system('pip install snowflake-snowpark-python')
get_ipython().system('pip install --upgrade sqlalchemy snowflake-sqlalchemy snowflake-connector-python')
get_ipython().system('pip install fastapi uvicorn snowflake-snowpark-python pandas')


# In[3]:


import os
import json
import pandas as pd
from snowflake.core import Root
from snowflake.snowpark import Session

# Snowflake connection parameters
CONNECTION_PARAMETERS = {
    "account": "ip73283.ap-south-1.aws",
    "user": "Analytx4tlab",
    "password": "Analytx4tlab@Amit",
    "role": "accountadmin",
    "database": "tenwave_db",
    "warehouse": "tenwave_cortex_analyst_wh",
    "schema": "data",
}

# Default configuration values
NUM_CHUNKS = 3  # Number of chunks provided as context
CORTEX_SEARCH_DATABASE = "TENWAVE_DB"  # Update these values based on your actual setup
CORTEX_SEARCH_SCHEMA = "DATA"
CORTEX_SEARCH_SERVICE = "CC_SEARCH_SERVICE_CS"  # Update with your actual service name

# Columns to query in the service
COLUMNS = [
    "chunk",
    "relative_path",
    "category"
]

class DocumentAssistant:
    def __init__(self):
        # Initialize Snowflake session
        self.session = Session.builder.configs(CONNECTION_PARAMETERS).create()
        self.root = Root(self.session)
        
        # Set up Cortex search service
        try:
            self.svc = self.root.databases[CORTEX_SEARCH_DATABASE].schemas[CORTEX_SEARCH_SCHEMA].cortex_search_services[CORTEX_SEARCH_SERVICE]
            print(f"Successfully connected to search service: {CORTEX_SEARCH_SERVICE}")
        except Exception as e:
            print(f"Error connecting to search service: {e}")
            self.svc = None
            
        # Set up pandas display options
        pd.set_option("max_colwidth", None)

    def get_available_documents(self):
        """Returns a list of available documents in the document store"""
        try:
            docs_available = self.session.sql("ls @docs").collect()
            list_docs = [doc["name"] for doc in docs_available]
            return list_docs
        except Exception as e:
            print(f"Error retrieving documents: {e}")
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
            print(f"Error retrieving categories: {e}")
            return ['ALL']

    def get_similar_chunks(self, query, category="ALL", num_chunks=NUM_CHUNKS):
        """Retrieves similar chunks from the document corpus using Cortex Search Service"""
        if not self.svc:
            return json.dumps({"error": "Search service not available", "results": []})
            
        try:
            if category == "ALL":
                response = self.svc.search(query, COLUMNS, limit=num_chunks)
            else: 
                filter_obj = {"@eq": {"category": category}}
                response = self.svc.search(query, COLUMNS, filter=filter_obj, limit=num_chunks)
                
            return response.json()
        except Exception as e:
            print(f"Error retrieving similar chunks: {e}")
            return json.dumps({"error": str(e), "results": []})

    def create_prompt(self, question, use_rag=True, category="ALL"):
        """Creates a prompt for Cortex complete API with or without RAG context"""
        if use_rag:
            try:
                prompt_context = self.get_similar_chunks(question, category)
                
                prompt = f"""
                You are an expert chat assistant that extracts information from the CONTEXT provided
                between <context> and </context> tags.
                When answering the question contained between <question> and </question> tags
                be concise and do not hallucinate. 
                If you don't have the information just say so.
                Only answer the question if you can extract it from the CONTEXT provided.
                
                Do not mention the CONTEXT used in your answer.
        
                <context>          
                {prompt_context}
                </context>
                <question>  
                {question}
                </question>
                Answer: 
                """

                json_data = json.loads(prompt_context) if isinstance(prompt_context, str) else prompt_context
                relative_paths = set(item.get('relative_path', '') for item in json_data.get('results', []))
                
            except Exception as e:
                print(f"Error creating RAG prompt: {e}")
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

    def get_answer(self, question, model_name="llama3.1-8b", use_rag=True, category="ALL"):
        """Process a question and return an answer using Cortex complete API"""
        try:
            prompt, relative_paths = self.create_prompt(question, use_rag, category)
            
            cmd = """
                select snowflake.cortex.complete(?, ?) as response
            """
            
            df_response = self.session.sql(cmd, params=[model_name, prompt]).collect()
            response_text = df_response[0].RESPONSE
            
            return {
                "answer": response_text,
                "related_documents": list(relative_paths)
            }
        except Exception as e:
            print(f"Error getting answer: {e}")
            return {
                "answer": f"Error processing your question: {str(e)}",
                "related_documents": []
            }
    
    def get_document_url(self, document_path, expiration_seconds=360):
        """Generate a presigned URL for a document"""
        try:
            cmd = f"select GET_PRESIGNED_URL(@docs, '{document_path}', {expiration_seconds}) as URL_LINK from directory(@docs)"
            df_url_link = self.session.sql(cmd).to_pandas()
            url_link = df_url_link._get_value(0, 'URL_LINK')
            return url_link
        except Exception as e:
            print(f"Error generating document URL: {e}")
            return None
            
    def close(self):
        """Close the Snowflake session"""
        if self.session:
            self.session.close()


# Usage example
if __name__ == "__main__":
    assistant = DocumentAssistant()
 
    
    # Example: Answer a question with RAG
    question = "how to rajister new patients?"
    result = assistant.get_answer(
        question=question,
        model_name="llama3.3-70b",
        use_rag=True,
        category="ALL"
    )
    
    print(f"Question: {question}")
    print(f"Answer: {result['answer']}")
    
    # Close the session
    assistant.close()


# In[2]:


import streamlit as st
import pandas as pd
import json
import os
import atexit
from snowflake.core import Root
from snowflake.snowpark import Session

# Snowflake connection parameters
CONNECTION_PARAMETERS = {
    "account": "of68662.ap-south-1.aws",
    "user": "Analytx4tlab",
    "password": "Analytx4tlab@Amit",
    "role": "accountadmin",
    "database": "tenwave_db",
    "warehouse": "tenwave_warehouse",
    "schema": "data",
}

# Default configuration values
NUM_CHUNKS = 3  # Number of chunks provided as context
CORTEX_SEARCH_DATABASE = "TENWAVE_DB"  # Update these values based on your actual setup
CORTEX_SEARCH_SCHEMA = "DATA"
CORTEX_SEARCH_SERVICE = "CC_SEARCH_SERVICE_CS"  # Update with your actual service name

# Columns to query in the service
COLUMNS = [
    "chunk",
    "relative_path",
    "category"
]

class DocumentAssistant:
    def __init__(self):
        # Initialize Snowflake session
        self.session = Session.builder.configs(CONNECTION_PARAMETERS).create()
        self.root = Root(self.session)
        
        # Set up Cortex search service
        try:
            self.svc = self.root.databases[CORTEX_SEARCH_DATABASE].schemas[CORTEX_SEARCH_SCHEMA].cortex_search_services[CORTEX_SEARCH_SERVICE]
            print(f"Successfully connected to search service: {CORTEX_SEARCH_SERVICE}")
        except Exception as e:
            print(f"Error connecting to search service: {e}")
            self.svc = None
            
        # Set up pandas display options
        pd.set_option("max_colwidth", None)

    def get_available_documents(self):
        """Returns a list of available documents in the document store"""
        try:
            docs_available = self.session.sql("ls @docs").collect()
            list_docs = [doc["name"] for doc in docs_available]
            return list_docs
        except Exception as e:
            print(f"Error retrieving documents: {e}")
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
            print(f"Error retrieving categories: {e}")
            return ['ALL']

    def get_similar_chunks(self, query, category="ALL", num_chunks=NUM_CHUNKS):
        """Retrieves similar chunks from the document corpus using Cortex Search Service"""
        if not self.svc:
            return json.dumps({"error": "Search service not available", "results": []})
            
        try:
            if category == "ALL":
                response = self.svc.search(query, COLUMNS, limit=num_chunks)
            else: 
                filter_obj = {"@eq": {"category": category}}
                response = self.svc.search(query, COLUMNS, filter=filter_obj, limit=num_chunks)
                
            return response.json()
        except Exception as e:
            print(f"Error retrieving similar chunks: {e}")
            return json.dumps({"error": str(e), "results": []})

    def create_prompt(self, question, use_rag=True, category="ALL"):
        """Creates a prompt for Cortex complete API with or without RAG context"""
        if use_rag:
            try:
                prompt_context = self.get_similar_chunks(question, category)
                
                prompt = f"""
                You are an expert chat assistant that extracts information from the CONTEXT provided
                between <context> and </context> tags.
                When answering the question contained between <question> and </question> tags
                be concise and do not hallucinate. 
                If you don't have the information just say so.
                Only answer the question if you can extract it from the CONTEXT provided.
                
                Do not mention the CONTEXT used in your answer.
        
                <context>          
                {prompt_context}
                </context>
                <question>  
                {question}
                </question>
                Answer: 
                """

                json_data = json.loads(prompt_context) if isinstance(prompt_context, str) else prompt_context
                relative_paths = set(item.get('relative_path', '') for item in json_data.get('results', []))
                
            except Exception as e:
                print(f"Error creating RAG prompt: {e}")
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

    def get_answer(self, question, model_name="llama3.1-8b", use_rag=True, category="ALL"):
        """Process a question and return an answer using Cortex complete API"""
        try:
            prompt, relative_paths = self.create_prompt(question, use_rag, category)
            
            cmd = """
                select snowflake.cortex.complete(?, ?) as response
            """
            
            df_response = self.session.sql(cmd, params=[model_name, prompt]).collect()
            response_text = df_response[0].RESPONSE
            
            return {
                "answer": response_text,
                "related_documents": list(relative_paths)
            }
        except Exception as e:
            print(f"Error getting answer: {e}")
            return {
                "answer": f"Error processing your question: {str(e)}",
                "related_documents": []
            }
    
    def get_document_url(self, document_path, expiration_seconds=360):
        """Generate a presigned URL for a document"""
        try:
            cmd = f"select GET_PRESIGNED_URL(@docs, '{document_path}', {expiration_seconds}) as URL_LINK from directory(@docs)"
            df_url_link = self.session.sql(cmd).to_pandas()
            url_link = df_url_link._get_value(0, 'URL_LINK')
            return url_link
        except Exception as e:
            print(f"Error generating document URL: {e}")
            return None
            
    def close(self):
        """Close the Snowflake session"""
        if self.session:
            self.session.close()

# ============= STREAMLIT APP CODE =============

# Page configuration
st.set_page_config(
    page_title="Document Assistant",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main {
        padding: 2rem;
    }
    .stTextInput > div > div > input {
        padding: 0.5rem;
    }
    .stButton > button {
        width: 100%;
        padding: 0.5rem;
    }
    .response-area {
        background-color: #f8f9fa;
        border-radius: 0.5rem;
        padding: 1rem;
        margin-top: 1rem;
    }
    .doc-link {
        background-color: #e9ecef;
        border-radius: 0.3rem;
        padding: 0.5rem;
        margin: 0.2rem;
        display: inline-block;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'assistant' not in st.session_state:
    st.session_state.assistant = DocumentAssistant()
    
if 'history' not in st.session_state:
    st.session_state.history = []

# Function to add to history
def add_to_history(question, answer, related_docs=None):
    st.session_state.history.append({
        "question": question,
        "answer": answer,
        "related_docs": related_docs or []
    })

# Sidebar
with st.sidebar:
    st.title("📚 Document Assistant")
    st.markdown("---")
    
    # Get available categories
    categories = st.session_state.assistant.get_available_categories()
    
    # Settings
    st.subheader("Search Settings")
    
    selected_category = st.selectbox(
        "Select Document Category",
        options=categories,
        index=0  # Default to 'ALL'
    )
    
    use_rag = st.checkbox("Use RAG Context", value=True)
    
    model_options = ["llama3.1-8b", "llama3.1-70b", "mistral-7b"]
    selected_model = st.selectbox(
        "Select Model",
        options=model_options,
        index=0  # Default to llama3.1-8b
    )
    
    num_chunks = st.slider(
        "Number of Context Chunks",
        min_value=1,
        max_value=10,
        value=3
    )
    
    st.markdown("---")
    
    # Advanced options (collapsible)
    with st.expander("Advanced Options"):
        view_raw_context = st.checkbox("View Raw Context", value=False)
    
    # Document list section
    st.subheader("Available Documents")
    if st.button("Refresh Document List"):
        with st.spinner("Fetching documents..."):
            documents = st.session_state.assistant.get_available_documents()
            st.session_state.documents = documents
    
    if 'documents' in st.session_state:
        for doc in st.session_state.documents:
            st.markdown(f"- {doc}")
    else:
        with st.spinner("Fetching documents..."):
            documents = st.session_state.assistant.get_available_documents()
            st.session_state.documents = documents
            for doc in documents:
                st.markdown(f"- {doc}")
    
    # Clear history button
    st.markdown("---")
    if st.button("Clear History"):
        st.session_state.history = []

# Main area
st.title("Document Search & Question Answering")
st.markdown("Ask any question about your documents and get answers powered by Snowflake Cortex Search.")

# User input
query = st.text_area("Enter your question:", height=100)
col1, col2 = st.columns([1, 5])

with col1:
    if st.button("Submit"):
        if query:
            with st.spinner("Processing your question..."):
                # Get raw context if requested
                if view_raw_context:
                    raw_context = st.session_state.assistant.get_similar_chunks(
                        query=query,
                        category=selected_category,
                        num_chunks=num_chunks
                    )
                    
                # Get answer
                result = st.session_state.assistant.get_answer(
                    question=query,
                    model_name=selected_model,
                    use_rag=use_rag,
                    category=selected_category
                )
                
                # Add to history
                add_to_history(
                    question=query, 
                    answer=result["answer"], 
                    related_docs=result["related_documents"]
                )

# Display conversation history
st.markdown("---")
st.subheader("Conversation History")

for i, item in enumerate(reversed(st.session_state.history)):
    # Question
    st.markdown(f"**Question {len(st.session_state.history) - i}**: {item['question']}")
    
    # Answer in a nice box
    st.markdown("<div class='response-area'>", unsafe_allow_html=True)
    st.markdown(f"{item['answer']}")
    st.markdown("</div>", unsafe_allow_html=True)
    
    # Related documents
    if item['related_docs']:
        st.markdown("**Related Documents:**")
        col1, col2 = st.columns([3, 1])
        
        with col1:
            for doc in item['related_docs']:
                st.markdown(f"- {doc}")
        
        with col2:
            if st.button(f"Get URLs #{len(st.session_state.history) - i}", key=f"url_btn_{i}"):
                doc_urls = {}
                for doc_path in item['related_docs']:
                    url = st.session_state.assistant.get_document_url(doc_path)
                    if url:
                        doc_urls[doc_path] = url
                
                # Display URLs
                for doc_path, url in doc_urls.items():
                    st.markdown(f"[{doc_path}]({url})")
    
    # Display raw context if requested
    if view_raw_context and i == 0:
        with st.expander("View Raw Context"):
            try:
                # Parse the JSON if it's a string
                if isinstance(raw_context, str):
                    context_data = json.loads(raw_context)
                else:
                    context_data = raw_context
                
                # Display each chunk
                for idx, result in enumerate(context_data.get('results', [])):
                    st.markdown(f"**Chunk {idx+1}:**")
                    st.markdown(f"- **Document**: {result.get('relative_path', 'Unknown')}")
                    st.markdown(f"- **Category**: {result.get('category', 'Unknown')}")
                    st.markdown(f"- **Content**: {result.get('chunk', 'No content')}")
                    st.markdown("---")
            except Exception as e:
                st.error(f"Error displaying raw context: {str(e)}")
    
    st.markdown("---")

# Handle session cleanup when the app is closed
def cleanup():
    if 'assistant' in st.session_state:
        st.session_state.assistant.close()

# Register the cleanup function to be called when the app is closed
atexit.register(cleanup)

# Main execution
if __name__ == "__main__":
    # The Streamlit app is already running at this point
    # This is just a placeholder for any additional code you might want to run
    pass


# In[5]:


# document_assistant.py
import json
import logging
from typing import Dict, List, Optional, Set, Tuple, Union, Any

import pandas as pd
from snowflake.core import Root
from snowflake.snowpark import Session

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("document_assistant")

class DocumentAssistant:
    """
    A class that provides RAG-based document search and question answering
    capabilities using Snowflake's Cortex features.
    """
    
    # Constants
    DEFAULT_NUM_CHUNKS = 3
    DEFAULT_MODEL = "llama3.1-8b"
    DEFAULT_CATEGORY = "ALL"
    DEFAULT_EXPIRATION = 360  # seconds
    
    # Columns to query in the search service
    SEARCH_COLUMNS = [
        "chunk",
        "relative_path",
        "category"
    ]

    def __init__(self, connection_parameters: Dict[str, str]) -> None:
        """
        Initialize the DocumentAssistant with Snowflake connection parameters.
        
        Args:
            connection_parameters: Dictionary with Snowflake connection details
        """
        self.connection_parameters = connection_parameters
        self.session = None
        self.root = None
        self.search_service = None
        
        # Initialize connections
        self._initialize_connections()
        
        # Set up pandas display options
        pd.set_option("max_colwidth", None)

    def _initialize_connections(self) -> None:
        """
        Initialize Snowflake session and search service connections.
        """
        try:
            # Create Snowflake session
            self.session = Session.builder.configs(self.connection_parameters).create()
            logger.info("Successfully connected to Snowflake")
            
            # Create Root object
            self.root = Root(self.session)
            
            # Set up Cortex search service
            db_name = self.connection_parameters.get("database", "")
            schema_name = self.connection_parameters.get("schema", "")
            service_name = self.connection_parameters.get("search_service", "CC_SEARCH_SERVICE_CS")
            
            self.search_service = self.root.databases[db_name].schemas[schema_name].cortex_search_services[service_name]
            logger.info(f"Successfully connected to search service: {service_name}")
            
        except Exception as e:
            logger.error(f"Error initializing connections: {str(e)}")
            if self.session:
                self.session.close()
                self.session = None
            raise

    def get_available_documents(self) -> List[str]:
        """
        Returns a list of available documents in the document store.
        
        Returns:
            List of document names
        """
        try:
            docs_available = self.session.sql("ls @docs").collect()
            document_list = [doc["name"] for doc in docs_available]
            logger.info(f"Retrieved {len(document_list)} available documents")
            return document_list
        except Exception as e:
            logger.error(f"Error retrieving documents: {str(e)}")
            return []

    def get_available_categories(self) -> List[str]:
        """
        Returns a list of available document categories.
        
        Returns:
            List of categories with 'ALL' as the first option
        """
        try:
            categories = self.session.sql(
                "SELECT category FROM docs_chunks_table GROUP BY category"
            ).collect()
            
            # Start with 'ALL' option and add remaining categories
            category_list = ['ALL']
            for cat in categories:
                category_list.append(cat.CATEGORY)
                
            logger.info(f"Retrieved {len(category_list)-1} document categories")
            return category_list
        except Exception as e:
            logger.error(f"Error retrieving categories: {str(e)}")
            return ['ALL']

    def get_similar_chunks(self, 
                          query: str, 
                          category: str = DEFAULT_CATEGORY, 
                          num_chunks: int = DEFAULT_NUM_CHUNKS) -> Dict[str, Any]:
        """
        Retrieves similar chunks from the document corpus using Cortex Search Service.
        
        Args:
            query: The search query
            category: Document category to filter by (or 'ALL' for no filtering)
            num_chunks: Number of chunks to retrieve
            
        Returns:
            Dictionary with search results
        """
        if not self.search_service:
            logger.error("Search service not available")
            return {"error": "Search service not available", "results": []}
            
        try:
            if category == self.DEFAULT_CATEGORY:
                response = self.search_service.search(
                    query, 
                    self.SEARCH_COLUMNS, 
                    limit=num_chunks
                )
            else: 
                filter_obj = {"@eq": {"category": category}}
                response = self.search_service.search(
                    query, 
                    self.SEARCH_COLUMNS, 
                    filter=filter_obj, 
                    limit=num_chunks
                )
                
            result = response.json()
            logger.info(f"Retrieved {len(result.get('results', []))} chunks for query: '{query}'")
            return result
        except Exception as e:
            error_msg = f"Error retrieving similar chunks: {str(e)}"
            logger.error(error_msg)
            return {"error": error_msg, "results": []}

    def create_prompt(self, 
                     question: str, 
                     use_rag: bool = True, 
                     category: str = DEFAULT_CATEGORY) -> Tuple[str, Set[str]]:
        """
        Creates a prompt for Cortex complete API with or without RAG context.
        
        Args:
            question: The user's question
            use_rag: Whether to use RAG context
            category: Document category to search in
            
        Returns:
            Tuple of (prompt, set of related document paths)
        """
        relative_paths = set()
        
        if use_rag:
            try:
                context_result = self.get_similar_chunks(question, category)
                
                # Extract document paths
                if isinstance(context_result, str):
                    context_result = json.loads(context_result)
                
                for item in context_result.get('results', []):
                    if 'relative_path' in item and item['relative_path']:
                        relative_paths.add(item['relative_path'])
                
                prompt = f"""
                You are an expert chat assistant that extracts information from the CONTEXT provided
                between <context> and </context> tags.
                When answering the question contained between <question> and </question> tags
                be concise and do not hallucinate. 
                If you don't have the information just say so.
                Only answer the question if you can extract it from the CONTEXT provided.
                
                Do not mention the CONTEXT used in your answer.
        
                <context>          
                {json.dumps(context_result, indent=2)}
                </context>
                <question>  
                {question}
                </question>
                Answer: 
                """
                logger.info(f"Created RAG prompt with {len(relative_paths)} related documents")
                
            except Exception as e:
                error_msg = f"Error creating RAG prompt: {str(e)}"
                logger.error(error_msg)
                prompt = f"""
                Question:  
                {question} 
                Answer: 
                """
        else:     
            prompt = f"""
            Question:  
            {question} 
            Answer: 
            """
            logger.info("Created non-RAG prompt")
                
        return prompt, relative_paths

    def get_answer(self, 
                  question: str, 
                  model_name: str = DEFAULT_MODEL, 
                  use_rag: bool = True, 
                  category: str = DEFAULT_CATEGORY) -> Dict[str, Any]:
        """
        Process a question and return an answer using Cortex complete API.
        
        Args:
            question: The user's question
            model_name: Name of the LLM model to use
            use_rag: Whether to use RAG context
            category: Document category to search in
            
        Returns:
            Dictionary with answer and related documents information
        """
        try:
            prompt, relative_paths = self.create_prompt(question, use_rag, category)
            
            # Call the Cortex complete function
            cmd = """
                SELECT snowflake.cortex.complete(?, ?) AS response
            """
            
            df_response = self.session.sql(cmd, params=[model_name, prompt]).collect()
            response_text = df_response[0].RESPONSE
            
            logger.info(f"Generated answer using model '{model_name}'")
            return {
                "answer": response_text,
                "related_documents": list(relative_paths)
            }
        except Exception as e:
            error_msg = f"Error getting answer: {str(e)}"
            logger.error(error_msg)
            return {
                "answer": f"Error processing your question: {error_msg}",
                "related_documents": []
            }
    
    def get_document_url(self, 
                        document_path: str, 
                        expiration_seconds: int = DEFAULT_EXPIRATION) -> Optional[str]:
        """
        Generate a presigned URL for a document.
        
        Args:
            document_path: Path to the document in Snowflake
            expiration_seconds: URL expiration time in seconds
            
        Returns:
            Presigned URL or None if error
        """
        try:
            # Use parameterized query to avoid SQL injection
            cmd = """
                SELECT GET_PRESIGNED_URL(@docs, ?, ?) AS URL_LINK 
                FROM directory(@docs)
            """
            df_url_link = self.session.sql(
                cmd, 
                params=[document_path, expiration_seconds]
            ).to_pandas()
            
            url_link = df_url_link._get_value(0, 'URL_LINK')
            logger.info(f"Generated presigned URL for document: {document_path}")
            return url_link
        except Exception as e:
            logger.error(f"Error generating document URL for {document_path}: {str(e)}")
            return None
            
    def close(self) -> None:
        """
        Close the Snowflake session.
        """
        if self.session:
            try:
                self.session.close()
                logger.info("Snowflake session closed")
            except Exception as e:
                logger.error(f"Error closing Snowflake session: {str(e)}")
            finally:
                self.session = None
```

# app.py
import os
import json
import logging
from typing import Dict, Any
from functools import wraps

from flask import Flask, request, jsonify, Response
from flask_cors import CORS

from document_assistant import DocumentAssistant

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("document_assistant_api")

# Load configuration from environment or file
def load_config() -> Dict[str, Any]:
    """Load configuration from environment variables or config file"""
    # Priority: environment variables > config file
    
    # Check for config file
    config_path = os.environ.get('CONFIG_PATH', 'config.json')
    try:
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
                logger.info(f"Configuration loaded from {config_path}")
                return config
    except Exception as e:
        logger.error(f"Error loading config file: {str(e)}")
    
    # Fall back to environment variables
    return {
        "snowflake": {
            "account": os.environ.get('SF_ACCOUNT', ''),
            "user": os.environ.get('SF_USER', ''),
            "password": os.environ.get('SF_PASSWORD', ''),
            "role": os.environ.get('SF_ROLE', 'accountadmin'),
            "database": os.environ.get('SF_DATABASE', 'tenwave_db'),
            "warehouse": os.environ.get('SF_WAREHOUSE', 'tenwave_warehouse'),
            "schema": os.environ.get('SF_SCHEMA', 'data'),
            "search_service": os.environ.get('SF_SEARCH_SERVICE', 'CC_SEARCH_SERVICE_CS')
        }
    }

# Error handling decorator
def handle_exceptions(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}")
            return jsonify({"error": str(e)}), 500
    return decorated_function

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load configuration
config = load_config()

# Connection parameters
connection_parameters = config.get('snowflake', {})

# Initialize DocumentAssistant
try:
    assistant = DocumentAssistant(connection_parameters)
    logger.info("DocumentAssistant initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize DocumentAssistant: {str(e)}")
    assistant = None

@app.route('/api/health', methods=['GET'])
def health_check() -> Response:
    """Health check endpoint to verify the API is running"""
    status = "ok" if assistant and assistant.session else "error"
    return jsonify({
        "status": status,
        "version": "1.0.0"
    })

@app.route('/api/search', methods=['POST'])
@handle_exceptions
def search() -> Response:
    """
    Endpoint to search for answers based on user queries
    
    Request body should contain:
    - query: The user's question
    - use_rag: Boolean indicating whether to use RAG context (default: True)
    - category: Category to search in (default: "ALL")
    - model_name: Model to use for inference (default: "llama3.1-8b")
    """
    if not assistant:
        return jsonify({"error": "DocumentAssistant not available"}), 503
        
    # Validate request
    data = request.json
    if not data or 'query' not in data:
        return jsonify({"error": "Missing 'query' parameter"}), 400
    
    # Extract parameters with defaults
    query = data['query']
    use_rag = data.get('use_rag', True)
    category = data.get('category', assistant.DEFAULT_CATEGORY)
    model_name = data.get('model_name', assistant.DEFAULT_MODEL)
    
    # Log the request
    logger.info(f"Search request: query='{query}', use_rag={use_rag}, category='{category}', model='{model_name}'")
    
    # Get answer
    result = assistant.get_answer(
        question=query,
        model_name=model_name,
        use_rag=use_rag,
        category=category
    )
    
    # Generate URLs for related documents if any
    if result['related_documents']:
        doc_urls = {}
        for doc_path in result['related_documents']:
            url = assistant.get_document_url(doc_path)
            if url:
                doc_urls[doc_path] = url
        result['document_urls'] = doc_urls
        
    return jsonify(result)

@app.route('/api/documents', methods=['GET'])
@handle_exceptions
def get_documents() -> Response:
    """Endpoint to retrieve all available documents"""
    if not assistant:
        return jsonify({"error": "DocumentAssistant not available"}), 503
        
    documents = assistant.get_available_documents()
    logger.info(f"Retrieved {len(documents)} documents")
    return jsonify({"documents": documents})

@app.route('/api/categories', methods=['GET'])
@handle_exceptions
def get_categories() -> Response:
    """Endpoint to retrieve all available document categories"""
    if not assistant:
        return jsonify({"error": "DocumentAssistant not available"}), 503
        
    categories = assistant.get_available_categories()
    logger.info(f"Retrieved {len(categories)} categories")
    return jsonify({"categories": categories})

@app.route('/api/document_url/<path:document_path>', methods=['GET'])
@handle_exceptions
def get_document_url(document_path: str) -> Response:
    """Endpoint to get a presigned URL for a specific document"""
    if not assistant:
        return jsonify({"error": "DocumentAssistant not available"}), 503
        
    # Get expiration from query parameters with default
    try:
        expiration = int(request.args.get('expiration', assistant.DEFAULT_EXPIRATION))
    except ValueError:
        expiration = assistant.DEFAULT_EXPIRATION
    
    logger.info(f"Generating URL for document: {document_path}")
    url = assistant.get_document_url(document_path, expiration)
    
    if url:
        return jsonify({"url": url})
    else:
        return jsonify({"error": "Could not generate URL"}), 404

@app.route('/api/raw_context', methods=['POST'])
@handle_exceptions
def get_raw_context() -> Response:
    """Endpoint to get raw context chunks for a query without generating an answer"""
    if not assistant:
        return jsonify({"error": "DocumentAssistant not available"}), 503
        
    # Validate request
    data = request.json
    if not data or 'query' not in data:
        return jsonify({"error": "Missing 'query' parameter"}), 400
    
    # Extract parameters with defaults
    query = data['query']
    category = data.get('category', assistant.DEFAULT_CATEGORY)
    num_chunks = data.get('num_chunks', assistant.DEFAULT_NUM_CHUNKS)
    
    logger.info(f"Raw context request: query='{query}', category='{category}', num_chunks={num_chunks}")
    context = assistant.get_similar_chunks(query, category, num_chunks)
    
    return jsonify({
        "context": context,
        "query": query,
        "category": category
    })

@app.errorhandler(404)
def not_found(e) -> Response:
    """Handle 404 errors"""
    logger.warning(f"404 Not Found: {request.path}")
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(e) -> Response:
    """Handle 500 errors"""
    logger.error(f"500 Server Error: {str(e)}")
    return jsonify({"error": f"Server error: {str(e)}"}), 500

# Add a cleanup handler to close the Snowflake session when the app is shut down
import atexit
def cleanup():
    """Clean up resources when the application shuts down"""
    if assistant:
        assistant.close()
        logger.info("Application shutdown: Resources cleaned up")

atexit.register(cleanup)

if __name__ == '__main__':
    # Get port from environment variable or use 5000 as default
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 't')
    
    if not assistant:
        logger.critical("Cannot start server: DocumentAssistant initialization failed")
        exit(1)
        
    logger.info(f"Starting server on port {port}, debug={debug}")
    app.run(host='0.0.0.0', port=port, debug=debug)


# In[7]:


import os
from snowflake.core import Root
from snowflake.snowpark import Session

CONNECTION_PARAMETERS = {
    "account": "of68662.ap-south-1.aws",
    "user": "Analytx4tlab",
    "password": "Analytx4tlab@Amit",
    "role": "accountadmin",
    "database": "tenwave_db",
    "warehouse": "tenwave_warehouse",
    "schema": "data",
}

session = Session.builder.configs(CONNECTION_PARAMETERS).create()
root = Root(session)

# fetch service
my_service = (root
  .databases["tenwave_db"]
  .schemas["data"]
  .cortex_search_services["CC_SEARCH_SERVICE_CS"]
)

# query service
resp = my_service.search(
  query="How can setup OPD consultation charges on Insurance ?",
  columns = [
    "chunk",
    "relative_path",
    "category"])


# In[1]:


import os
from snowflake.core import Root
from snowflake.snowpark import Session

CONNECTION_PARAMETERS = {
    "account": "of68662.ap-south-1.aws",
    "user": "Analytx4tlab",
    "password": "Analytx4tlab@Amit",
    "role": "accountadmin",
    "database": "tenwave_db",
    "warehouse": "tenwave_warehouse",
    "schema": "data",
}

session = Session.builder.configs(CONNECTION_PARAMETERS).create()
root = Root(session)


# In[8]:


# fetch service
my_service = (root
  .databases["tenwave_db"]
  .schemas["data"]
  .cortex_search_services["CC_SEARCH_SERVICE_CS"]
)

# query service
resp = my_service.search(
  query="How can setup OPD consultation charges on Insurance ?",
  columns = [
    "chunk",
    "relative_path",
    "category"],
  limit=5)

print(resp.to_str)


# In[4]:


type(resp)


# In[11]:


import os
from flask import Flask, request, jsonify
from snowflake.core import Root
from snowflake.snowpark import Session
from flask_cors import CORS

# This enables CORS for all routes

app = Flask(__name__)
CORS(app)  

# Snowflake connection parameters
CONNECTION_PARAMETERS = {
    "account": "of68662.ap-south-1.aws",
    "user": "Analytx4tlab",
    "password": "Analytx4tlab@Amit",
    "role": "accountadmin",
    "database": "tenwave_db",
    "warehouse": "tenwave_warehouse",
    "schema": "data",
}

def get_snowflake_session():
    """Create and return a Snowflake session."""
    return Session.builder.configs(CONNECTION_PARAMETERS).create()

@app.route('/search', methods=['POST'])
def search():
    """
    Endpoint to perform Cortex search in Snowflake.
    
    Expected JSON payload:
    {
        "query": "Your search query here"
    }
    
    Optional parameters:
    {
        "columns": ["column1", "column2", ...],
        "limit": 10
    }
    """
    try:
        # Get data from request
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({"error": "Missing required parameter: query"}), 400
        
        query = data['query']
        columns = data.get('columns', ["chunk", "relative_path", "category"])
        limit = data.get('limit', 10)
        
        # Create Snowflake session
        session = get_snowflake_session()
        root = Root(session)
        
        # Fetch service
        my_service = (root
            .databases["tenwave_db"]
            .schemas["data"]
            .cortex_search_services["CC_SEARCH_SERVICE_CS"]
        )
        
        # Query service
        resp = my_service.search(
            query=query,
            columns=columns,
            limit=limit
        )
        
        # Convert response to JSON
        results = resp.to_json()
        
        # Close the session
        session.close()
        
        return jsonify({"results": results})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "healthy"}), 200


if __name__ == '__main__':
    # For production, consider using a proper WSGI server like gunicorn
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)


# In[ ]:




