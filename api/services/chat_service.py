"""
Chat Service - Handles intelligent email agent queries
"""

from typing import Dict, List, Any, Optional
from .llm_service import GeminiService


def process_chat_query(
    query: str,
    email: Optional[Dict[str, Any]] = None,
    emails: Optional[List[Dict[str, Any]]] = None,
    prompts: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Process a chat query from the user about emails
    
    Args:
        query: User's question/command
        email: Optional selected email for context
        emails: Optional list of all emails for general queries
        prompts: Dictionary containing prompt objects
    
    Returns:
        {
            'response': str,
            'draft': Optional[Dict] if draft was generated,
            'success': bool,
            'error': Optional[str]
        }
    """
    llm_service = GeminiService()
    query_lower = query.lower()
    
    result = {
        'response': '',
        'draft': None,
        'success': False,
        'error': None
    }
    
    try:
        draft_keywords = ['draft', 'reply', 'respond', 'write back', 'compose', 'generate reply']
        
        if any(keyword in query_lower for keyword in draft_keywords):
            if not email:
                result['response'] = "Please select an email first to draft a reply."
                result['success'] = True
                return result
            
            draft = _generate_draft(email, prompts, llm_service, query)
            result['draft'] = draft
            result['response'] = f"I've generated a draft reply:\n\n**Subject:** {draft['subject']}\n\n**Body:**\n{draft['body']}\n\nYou can find this draft in the Drafts tab for editing."
            result['success'] = True
            return result
        
        if any(word in query_lower for word in ['summarize', 'summary', 'tldr', 'brief']):
            if not email:
                result['response'] = "Please select an email first to summarize it."
                result['success'] = True
                return result
            
            response = _summarize_email(email, llm_service)
            result['response'] = response
            result['success'] = True
            return result
        
        task_keywords = ['what tasks', 'show tasks', 'list tasks', 'action items', 'to-do', 'need to do', 'what do i need']
        if any(keyword in query_lower for keyword in task_keywords):
            if email:
                action_items = email.get('actionItems', [])
                if action_items:
                    tasks_text = "\n".join([
                        f"• {item['task']}" + 
                        (f" (Deadline: {item['deadline']})" if item.get('deadline') and item['deadline'] != 'none' else "") +
                        (f" [{item['priority'].upper()}]" if item.get('priority') else "")
                        for item in action_items
                    ])
                    result['response'] = f"Here are the action items from this email:\n\n{tasks_text}"
                else:
                    result['response'] = "No action items found in this email."
            elif emails:
                all_tasks = []
                for e in emails:
                    if e.get('actionItems'):
                        for item in e['actionItems']:
                            all_tasks.append(f"• {item['task']} (from: {e.get('senderName', 'Unknown')})")
                
                if all_tasks:
                    result['response'] = f"Here are all action items from your inbox ({len(all_tasks)} total):\n\n" + "\n".join(all_tasks)
                else:
                    result['response'] = "No action items found in your inbox."
            else:
                result['response'] = "No email context available. Please select an email or load your inbox."
            
            result['success'] = True
            return result
        
        show_keywords = ['show', 'list', 'get', 'find', 'display', 'give me', 'get me']
        category_keywords = ['urgent', 'important', 'spam', 'newsletter']
        
        is_list_request = any(show in query_lower for show in show_keywords) and any(cat in query_lower for cat in category_keywords)
        
        if is_list_request:
            if not emails:
                result['response'] = "No inbox data available."
                result['success'] = True
                return result
            
            category = None
            if 'important' in query_lower or 'urgent' in query_lower:
                category = 'Important'
            elif 'spam' in query_lower:
                category = 'Spam'
            elif 'newsletter' in query_lower:
                category = 'Newsletter'
            
            if category:
                filtered = [e for e in emails if e.get('category') == category]
                if filtered:
                    email_list = "\n".join([
                        f"• {e.get('subject', 'No subject')} (from {e.get('senderName', 'Unknown')})"
                        for e in filtered
                    ])
                    result['response'] = f"Found {len(filtered)} {category} email(s):\n\n{email_list}"
                else:
                    result['response'] = f"No {category} emails found in your inbox."
            else:
                result['response'] = "I can help you filter emails by: Important, Spam, or Newsletter."
            
            result['success'] = True
            return result
        
        response = _handle_general_query(query, email, emails, llm_service)
        result['response'] = response
        result['success'] = True
        return result
    
    except Exception as e:
        print(f"Error processing chat query: {e}")
        result['error'] = str(e)
        result['response'] = "I encountered an error processing your request. Please try again."
        return result


def _summarize_email(email: Dict[str, Any], llm_service: GeminiService) -> str:
    """Generate a concise summary of an email"""
    prompt = f"""Summarize this email in 2-3 sentences. Focus on the key points and any action items.

From: {email.get('senderName', 'Unknown')} <{email.get('sender', '')}>
Subject: {email.get('subject', 'No subject')}

{email.get('body', '')}

Provide a brief, helpful summary:"""
    
    response = llm_service.generate_text(prompt)
    return response if response else "Unable to generate summary at this time."


def _generate_draft(
    email: Dict[str, Any],
    prompts: Optional[Dict[str, Any]],
    llm_service: GeminiService,
    user_instruction: str = ""
) -> Dict[str, Any]:
    """Generate a draft reply to an email"""
    
    auto_reply_prompt = ""
    if prompts and 'autoReply' in prompts:
        auto_reply_prompt = prompts['autoReply'].get('prompt', '')
    
    email_context = f"""Original Email:
From: {email.get('senderName', 'Unknown')} <{email.get('sender', '')}>
Subject: {email.get('subject', 'No subject')}

{email.get('body', '')}"""
    
    full_prompt = f"""{auto_reply_prompt if auto_reply_prompt else 'Draft a professional and helpful reply to this email.'}

{email_context}

Additional instruction: {user_instruction}

Generate a reply with:
1. Subject line (start with "Re: " if replying)
2. Email body (professional tone, clear and concise)

Format your response as:
Subject: [subject line]

[email body]"""
    
    response = llm_service.generate_text(full_prompt)
    
    if not response:
        return {
            'id': f"draft-{email.get('id')}-{int(time.time() * 1000)}",
            'originalEmailId': email.get('id'),
            'subject': f"Re: {email.get('subject', 'No subject')}",
            'body': "Failed to generate draft. Please try again.",
            'createdAt': None,
            'metadata': {}
        }
    
    subject = f"Re: {email.get('subject', 'No subject')}"
    body = response
    
    if 'subject:' in response.lower():
        parts = response.split('\n', 1)
        subject_line = parts[0].replace('Subject:', '').replace('subject:', '').strip()
        if subject_line:
            subject = subject_line
        if len(parts) > 1:
            body = parts[1].strip()
    
    import time
    
    return {
        'id': f"draft-{email.get('id')}-{int(time.time() * 1000)}",
        'originalEmailId': email.get('id'),
        'subject': subject,
        'body': body,
        'createdAt': time.time(),
        'metadata': {
            'originalSender': email.get('senderName'),
            'originalSubject': email.get('subject'),
            'category': email.get('category', 'Uncategorized')
        }
    }


def _handle_general_query(
    query: str,
    email: Optional[Dict[str, Any]],
    emails: Optional[List[Dict[str, Any]]],
    llm_service: GeminiService
) -> str:
    """Handle general queries about inbox or email"""
    
    context = "You are an email productivity assistant. Answer the user's question helpfully.\n\n"
    
    if email:
        context += f"""Selected Email:
From: {email.get('senderName', 'Unknown')}
Subject: {email.get('subject', 'No subject')}
Category: {email.get('category', 'Uncategorized')}
Body: {email.get('body', '')[:200]}...

"""
    
    if emails:
        context += f"User has {len(emails)} emails in their inbox.\n"
        categories = {}
        for e in emails:
            cat = e.get('category', 'Uncategorized')
            categories[cat] = categories.get(cat, 0) + 1
        context += f"Categories breakdown: {categories}\n\n"
    
    full_prompt = f"{context}User Question: {query}\n\nProvide a helpful answer:"
    
    response = llm_service.generate_text(full_prompt)
    return response if response else "I'm not sure how to help with that. Try asking about summarizing emails, viewing tasks, or drafting replies."
