from flask import Flask, request, jsonify
import os
import json
from document_assistant import DocumentAssistant
from flask_cors import CORS # Import CORS
from dotenv import load_dotenv
import traceback
import logging

load_dotenv()
print("DEBUG: SNOWFLAKE_ACCOUNT from .env: {os.environ.get('SNOWFLAKE_ACCOUNT')}")
logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
frontend_urls_str = os.environ.get("FRONTEND_URL", "http://localhost:8080")
allowed_origins = [url.strip() for url in frontend_urls_str.split(',')]
# Add the specific IP address if it's not already included
if "http://192.168.29.128:8080" not in allowed_origins:
    allowed_origins.append("http://192.168.29.128:8080")
CORS(app, resources={r"/api/*": {"origins": allowed_origins}}) # Configure CORS for /api routes

# Initialize the DocumentAssistant
assistant = DocumentAssistant()

@app.route('/api/search', methods=['POST'])
def search():
    """
    Endpoint to search for answers based on user queries
    Request body should contain:
    - question: The user's question (required)
    - category: Category to search in (default: "ALL")
    - user_id: Optional user identifier 
    - org_id: Optional organization identifier
    
    Optional parameters:
    - use_rag: Boolean indicating whether to use RAG context (default: True)
    - model_name: Model to use for inference (default: "llama3.3-70b")
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Missing request body"}), 400
            
        # Check for required parameter
        if 'question' not in data:
            return jsonify({"error": "Missing 'question' parameter"}), 400
        
        # Extract parameters
        query = data['question']
        category = data.get('category', 'ALL')
        user_id = data.get('user_id')
        org_id = data.get('org_id')
        use_rag = data.get('use_rag', True)
        model_name = data.get('model_name', 'llama3.3-70b')  # Using llama3.3-70b
        
        # Get answer from DocumentAssistant
        result = assistant.get_answer(
            question=query,
            model_name=model_name,
            use_rag=use_rag,
            category=category,
            user_id=user_id,
            org_id=org_id
        )
        
        # Format the response according to requirements
        response = {
            "answer": result["answer"],
            "suggested_questions": result["suggested_questions"]
        }
        
        # Optionally include document URLs if needed
        if result.get('related_documents') and request.args.get('include_urls') == 'true':
            doc_urls = {}
            for doc_path in result['related_documents']:
                url = assistant.get_document_url(doc_path)
                if url:
                    doc_urls[doc_path] = url
            response['document_urls'] = doc_urls
            
        return jsonify(response)
    
    except Exception as e:
        traceback.print_exc()
        # Return formatted error response with fallback suggested questions
        fallback_questions = assistant.generate_fallback_questions()
        return jsonify({
            "answer": "I'm unable to answer that question at the moment. Please try again later.",
            "suggested_questions": fallback_questions
        }), 200  # Return 200 even for errors to maintain expected response format

@app.route('/api/suggest_questions', methods=['POST'])
def suggest_questions():
    """
    Endpoint to get suggested questions from the knowledge base
    based on an input question
    """
    try:
        data = request.json
        if not data or 'question' not in data:
            return jsonify({"error": "Missing 'question' parameter"}), 400
        
        question = data['question']
        category = data.get('category', 'ALL')
        
        # Get suggested questions directly from the knowledge base
        suggested_questions = assistant.get_suggested_questions_from_kb(question, category)
        return jsonify({"suggested_questions": suggested_questions})
    except Exception as e:
        # Return fallback questions even in case of error
        fallback_questions = assistant.generate_fallback_questions()
        return jsonify({"suggested_questions": fallback_questions}), 200

@app.route('/api/documents', methods=['GET'])
def get_documents():
    """Endpoint to retrieve all available documents"""
    try:
        documents = assistant.get_available_documents()
        return jsonify({"documents": documents})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Endpoint to retrieve all available document categories"""
    try:
        categories = assistant.get_available_categories()
        return jsonify({"categories": categories})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/document_url/<path:document_path>', methods=['GET'])
def get_document_url(document_path):
    """Endpoint to get a presigned URL for a specific document"""
    try:
        expiration = request.args.get('expiration', 360, type=int)
        url = assistant.get_document_url(document_path, expiration)
        if url:
            return jsonify({"url": url})
        else:
            return jsonify({"error": "Could not generate URL"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/raw_context', methods=['POST'])
def get_raw_context():
    """Endpoint to get raw context chunks for a query without generating an answer"""
    try:
        data = request.json
        if not data or ('query' not in data and 'question' not in data):
            return jsonify({"error": "Missing 'query' or 'question' parameter"}), 400
        
        # Support both 'query' and 'question' for compatibility
        query = data.get('query', data.get('question'))
        category = data.get('category', 'ALL')
        num_chunks = data.get('num_chunks', 3)
        
        context = assistant.get_similar_chunks(query, category, num_chunks)
        return jsonify({"context": json.loads(context) if isinstance(context, str) else context})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Chat history endpoints

@app.route('/api/chat/history', methods=['GET'])
def get_chat_history():
    """
    Endpoint to retrieve chat history for a specific user
    
    Query parameters:
    - user_id: User identifier (required)
    - org_id: Organization identifier (optional)
    - limit: Maximum number of records to return (default: 10)
    """
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "Missing 'user_id' parameter"}), 400
            
        org_id = request.args.get('org_id')
        limit = request.args.get('limit', 10, type=int)
        
        # Get chat history from assistant
        history = assistant.get_recent_chat_history(user_id, org_id, limit)
        
        return jsonify({"history": history})
    except Exception as e:
        return jsonify({"error": str(e), "history": []}), 500

@app.route('/api/chat/stats', methods=['GET'])
def get_user_stats():
    """
    Endpoint to retrieve usage statistics for a specific user
    
    Query parameters:
    - user_id: User identifier (required)
    - org_id: Organization identifier (optional)
    """
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "Missing 'user_id' parameter"}), 400
            
        org_id = request.args.get('org_id')
        
        # Get user stats from assistant
        stats = assistant.get_user_stats(user_id, org_id)
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e), "total_questions": 0}), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Server error: " + str(e)}), 500

# Add a cleanup handler to close the Snowflake session when the app is shut down
import atexit
atexit.register(lambda: assistant.close())

if __name__ == '__main__':
    # Get port from environment variable or use 8000 as default
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)
