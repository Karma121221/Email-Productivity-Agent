from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os

# Import services with absolute imports for Vercel compatibility
import sys
sys.path.insert(0, os.path.dirname(__file__))

from services.email_processor import process_emails_batch
from services.chat_service import process_chat_query

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
DRAFTS_FILE = os.path.join(DATA_DIR, 'drafts.json')

# Pydantic models
class EmailProcessRequest(BaseModel):
    emails: List[Dict[str, Any]]
    prompts: Dict[str, Any]

class ChatQueryRequest(BaseModel):
    query: str
    emailId: Optional[str] = None
    emails: Optional[List[Dict[str, Any]]] = None
    prompts: Optional[Dict[str, Any]] = None

class DraftRequest(BaseModel):
    id: Optional[str] = None
    emailId: Optional[str] = None
    to: str
    subject: str
    body: str
    timestamp: Optional[str] = None

# Routes
@app.get("/api/")
@app.get("/api/hello")
async def hello():
    return {
        'message': 'Hello from Ocean AI Backend!',
        'status': 'success'
    }

@app.get("/api/status")
async def status():
    return {
        'status': 'online',
        'version': '1.0.0'
    }

@app.get("/api/data/default_prompts.json")
async def get_default_prompts():
    try:
        with open(os.path.join(DATA_DIR, 'default_prompts.json'), 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/mock_inbox.json")
async def get_mock_inbox():
    try:
        with open(os.path.join(DATA_DIR, 'mock_inbox.json'), 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/emails/load")
async def load_emails():
    try:
        with open(os.path.join(DATA_DIR, 'mock_inbox.json'), 'r', encoding='utf-8') as f:
            emails = json.load(f)
        return {
            'success': True,
            'emails': emails,
            'count': len(emails)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={'success': False, 'error': str(e)})

@app.post("/api/emails/process")
async def process_emails(request: EmailProcessRequest):
    """
    Process emails with LLM categorization and action extraction
    """
    try:
        if not request.emails:
            raise HTTPException(status_code=400, detail={'success': False, 'error': 'No emails provided'})
        
        result = process_emails_batch(request.emails, request.prompts)
        return result
    
    except Exception as e:
        print(f"Error in process_emails endpoint: {e}")
        raise HTTPException(status_code=500, detail={
            'success': False,
            'error': str(e)
        })

@app.post("/api/chat/query")
async def chat_query(request: ChatQueryRequest):
    """
    Process a chat query from the user
    """
    try:
        if not request.query:
            raise HTTPException(status_code=400, detail={'success': False, 'error': 'No query provided'})
        
        email = None
        if request.emailId and request.emails:
            email = next((e for e in request.emails if e.get('id') == request.emailId), None)
        
        result = process_chat_query(
            request.query,
            email,
            request.emails or [],
            request.prompts or {}
        )
        
        if result.get('draft'):
            draft = result['draft']
            _save_draft(draft)
        
        return result
    
    except Exception as e:
        print(f"Error in chat_query endpoint: {e}")
        raise HTTPException(status_code=500, detail={
            'success': False,
            'error': str(e),
            'response': 'An error occurred processing your request.'
        })

@app.get("/api/drafts")
async def get_drafts():
    """Get all saved drafts"""
    try:
        if os.path.exists(DRAFTS_FILE):
            with open(DRAFTS_FILE, 'r', encoding='utf-8') as f:
                drafts = json.load(f)
        else:
            drafts = []
        
        return {
            'success': True,
            'drafts': drafts,
            'count': len(drafts)
        }
    except Exception as e:
        print(f"Error loading drafts: {e}")
        raise HTTPException(status_code=500, detail={'success': False, 'error': str(e)})

@app.post("/api/drafts")
async def save_draft(draft: DraftRequest):
    """Save a new draft or update existing"""
    try:
        draft_dict = draft.dict()
        _save_draft(draft_dict)
        
        return {
            'success': True,
            'message': 'Draft saved successfully',
            'draft': draft_dict
        }
    except Exception as e:
        print(f"Error saving draft: {e}")
        raise HTTPException(status_code=500, detail={'success': False, 'error': str(e)})

@app.delete("/api/drafts/{draft_id}")
async def delete_draft(draft_id: str):
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
        
        return {
            'success': True,
            'message': 'Draft deleted successfully'
        }
    except Exception as e:
        print(f"Error deleting draft: {e}")
        raise HTTPException(status_code=500, detail={'success': False, 'error': str(e)})

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
