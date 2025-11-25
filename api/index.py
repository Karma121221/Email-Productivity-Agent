from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from services.email_processor import process_emails_batch
from services.chat_service import process_chat_query

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
DRAFTS_FILE = os.path.join(DATA_DIR, 'drafts.json')

@app.route('/api/hello')
def hello():
    return jsonify({
        'message': 'Hello from Ocean AI Backend!',
        'status': 'success'
    })

@app.route('/api/status')
def status():
    return jsonify({
        'status': 'online',
        'version': '1.0.0'
    })

@app.route('/api/data/default_prompts.json')
def get_default_prompts():
    try:
        with open(os.path.join(DATA_DIR, 'default_prompts.json'), 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/data/mock_inbox.json')
def get_mock_inbox():
    try:
        with open(os.path.join(DATA_DIR, 'mock_inbox.json'), 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/emails/load')
def load_emails():
    try:
        with open(os.path.join(DATA_DIR, 'mock_inbox.json'), 'r', encoding='utf-8') as f:
            emails = json.load(f)
        return jsonify({
            'success': True,
            'emails': emails,
            'count': len(emails)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/emails/process', methods=['POST'])
def process_emails():
    """
    Process emails with LLM categorization and action extraction
    
    Request body:
        {
            "emails": [...],
            "prompts": {
                "categorization": {...},
                "actionExtraction": {...}
            }
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        emails = data.get('emails', [])
        prompts = data.get('prompts', {})
        
        if not emails:
            return jsonify({'success': False, 'error': 'No emails provided'}), 400
        
        result = process_emails_batch(emails, prompts)
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error in process_emails endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/chat/query', methods=['POST'])
def chat_query():
    """
    Process a chat query from the user
    
    Request body:
        {
            "query": "Summarize this email",
            "emailId": "email-001" (optional),
            "emails": [...] (optional, for general queries),
            "prompts": {...} (optional)
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({'success': False, 'error': 'No query provided'}), 400
        
        query = data.get('query')
        email_id = data.get('emailId')
        emails = data.get('emails', [])
        prompts = data.get('prompts', {})
        
        email = None
        if email_id and emails:
            email = next((e for e in emails if e.get('id') == email_id), None)
        
        result = process_chat_query(query, email, emails, prompts)
        
        if result.get('draft'):
            draft = result['draft']
            _save_draft(draft)
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error in chat_query endpoint: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'response': 'An error occurred processing your request.'
        }), 500

@app.route('/api/drafts', methods=['GET'])
def get_drafts():
    """Get all saved drafts"""
    try:
        if os.path.exists(DRAFTS_FILE):
            with open(DRAFTS_FILE, 'r', encoding='utf-8') as f:
                drafts = json.load(f)
        else:
            drafts = []
        
        return jsonify({
            'success': True,
            'drafts': drafts,
            'count': len(drafts)
        })
    except Exception as e:
        print(f"Error loading drafts: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/drafts', methods=['POST'])
def save_draft():
    """Save a new draft or update existing"""
    try:
        draft = request.get_json()
        
        if not draft:
            return jsonify({'success': False, 'error': 'No draft provided'}), 400
        
        _save_draft(draft)
        
        return jsonify({
            'success': True,
            'message': 'Draft saved successfully',
            'draft': draft
        })
    except Exception as e:
        print(f"Error saving draft: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/drafts/<draft_id>', methods=['DELETE'])
def delete_draft(draft_id):
    """Delete a specific draft"""
    try:
        if os.path.exists(DRAFTS_FILE):
            with open(DRAFTS_FILE, 'r', encoding='utf-8') as f:
                drafts = json.load(f)
        else:
            drafts = []
        
        drafts = [d for d in drafts if d.get('id') != draft_id]
        
        with open(DRAFTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(drafts, f, indent=2)
        
        return jsonify({
            'success': True,
            'message': 'Draft deleted successfully'
        })
    except Exception as e:
        print(f"Error deleting draft: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

def _save_draft(draft):
    """Helper function to save a draft to the JSON file"""
    if os.path.exists(DRAFTS_FILE):
        with open(DRAFTS_FILE, 'r', encoding='utf-8') as f:
            drafts = json.load(f)
    else:
        drafts = []
    
    existing_index = next((i for i, d in enumerate(drafts) if d.get('id') == draft.get('id')), None)
    
    if existing_index is not None:
        drafts[existing_index] = draft
    else:
        drafts.append(draft)
    
    with open(DRAFTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(drafts, f, indent=2)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
