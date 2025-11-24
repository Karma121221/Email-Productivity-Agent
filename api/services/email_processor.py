"""
Email Processor - Categorizes emails and extracts action items using LLM
"""

from typing import Dict, List, Any
from .llm_service import GeminiService, parse_category


def process_email(email: Dict[str, Any], prompts: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process a single email with categorization and action extraction
    
    Args:
        email: Email object with id, subject, body, sender, etc.
        prompts: Dictionary containing prompt objects with 'prompt' field
    
    Returns:
        {
            'id': email_id,
            'category': 'Important|Newsletter|Spam|To-Do|Uncategorized',
            'actionItems': [
                {'task': '...', 'deadline': '...', 'priority': '...'}
            ],
            'error': Optional error message if processing failed
        }
    """
    llm_service = GeminiService()
    result = {
        'id': email.get('id'),
        'category': 'Uncategorized',
        'actionItems': [],
        'error': None
    }
    
    try:
        # Build email context
        email_context = f"""Sender: {email.get('senderName', 'Unknown')} <{email.get('sender', '')}>
Subject: {email.get('subject', 'No subject')}

Body:
{email.get('body', '')}"""
        
        # Step 1: Categorize email
        cat_prompt_text = prompts.get('categorization', {}).get('prompt', '')
        if cat_prompt_text:
            full_prompt = f"{cat_prompt_text}\n\nEmail:\n{email_context}"
            category_response = llm_service.generate_text(full_prompt)
            
            if category_response:
                result['category'] = parse_category(category_response)
                print(f"✓ Email {email.get('id')}: Category = {result['category']}")
            else:
                result['error'] = 'Failed to categorize email'
                print(f"✗ Email {email.get('id')}: Failed to get category response")
        
        # Step 2: Extract action items (only for Important or To-Do emails)
        if result['category'] in ['Important', 'To-Do']:
            action_prompt_text = prompts.get('actionExtraction', {}).get('prompt', '')
            if action_prompt_text:
                full_prompt = f"{action_prompt_text}\n\nEmail:\n{email_context}"
                action_items = llm_service.generate_json(full_prompt)
                
                # Validate action items structure
                if isinstance(action_items, list):
                    result['actionItems'] = [
                        item for item in action_items
                        if isinstance(item, dict) and 'task' in item
                    ]
        
    except Exception as e:
        print(f"Error processing email {email.get('id')}: {e}")
        result['error'] = str(e)
    
    return result


def process_emails_batch(emails: List[Dict[str, Any]], prompts: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process multiple emails in batch - OPTIMIZED to use only 2 API calls instead of 30+
    
    Strategy:
    1. Batch categorize ALL emails in ONE API call
    2. Batch extract action items for Important/To-Do emails in ONE API call
    
    Args:
        emails: List of email objects
        prompts: Dictionary containing prompt objects
    
    Returns:
        {
            'success': bool,
            'processed': int,
            'failed': int,
            'results': List of processed email results,
            'errors': List of error messages
        }
    """
    llm_service = GeminiService()
    results = []
    errors = []
    
    try:
        # ============================================================
        # STEP 1: Batch Categorization (1 API call for ALL emails)
        # ============================================================
        print(f"🚀 Starting batch categorization for {len(emails)} emails...")
        
        cat_prompt_text = prompts.get('categorization', {}).get('prompt', '')
        if not cat_prompt_text:
            raise Exception("Categorization prompt not found")
        
        # Build batch categorization prompt
        batch_prompt = f"""{cat_prompt_text}

IMPORTANT: You must categorize ALL of the following emails. Return a JSON array with one object per email.
Format: [{{"emailId": "email-001", "category": "Important"}}, {{"emailId": "email-002", "category": "Newsletter"}}, ...]

Valid categories: Important, Newsletter, Spam, To-Do, Uncategorized

Here are the emails to categorize:
"""
        
        for email in emails:
            email_id = email.get('id', 'unknown')
            batch_prompt += f"""
---
Email ID: {email_id}
Sender: {email.get('senderName', 'Unknown')} <{email.get('sender', '')}>
Subject: {email.get('subject', 'No subject')}
Body:
{email.get('body', '')}
---
"""
        
        # Call LLM once for all categories
        categories_response = llm_service.generate_json(batch_prompt)
        
        if not isinstance(categories_response, list):
            raise Exception(f"Expected JSON array, got: {type(categories_response)}")
        
        # Map categories back to emails
        category_map = {}
        for item in categories_response:
            if isinstance(item, dict) and 'emailId' in item and 'category' in item:
                category_map[item['emailId']] = parse_category(item['category'])
        
        print(f"✓ Batch categorization complete: {len(category_map)} emails categorized")
        
        # Initialize results with categories
        for email in emails:
            email_id = email.get('id')
            results.append({
                'id': email_id,
                'category': category_map.get(email_id, 'Uncategorized'),
                'actionItems': [],
                'error': None
            })
        
        # ============================================================
        # STEP 2: Batch Action Extraction (1 API call for Important/To-Do emails only)
        # ============================================================
        emails_needing_actions = [
            email for email in emails 
            if category_map.get(email.get('id')) in ['Important', 'To-Do']
        ]
        
        if emails_needing_actions:
            print(f"🚀 Starting batch action extraction for {len(emails_needing_actions)} emails...")
            
            action_prompt_text = prompts.get('actionExtraction', {}).get('prompt', '')
            if not action_prompt_text:
                print("⚠️  Action extraction prompt not found, skipping action items")
            else:
                # Build batch action extraction prompt
                action_batch_prompt = f"""{action_prompt_text}

IMPORTANT: Extract action items from ALL of the following emails. Return a JSON array with one object per email.
Format: [{{"emailId": "email-001", "actionItems": [{{"task": "...", "deadline": "...", "priority": "..."}}]}}, ...]

Here are the emails:
"""
                
                for email in emails_needing_actions:
                    email_id = email.get('id', 'unknown')
                    action_batch_prompt += f"""
---
Email ID: {email_id}
Sender: {email.get('senderName', 'Unknown')} <{email.get('sender', '')}>
Subject: {email.get('subject', 'No subject')}
Body:
{email.get('body', '')}
---
"""
                
                # Call LLM once for all action items
                actions_response = llm_service.generate_json(action_batch_prompt)
                
                if isinstance(actions_response, list):
                    # Map action items back to results
                    for item in actions_response:
                        if isinstance(item, dict) and 'emailId' in item:
                            email_id = item['emailId']
                            action_items = item.get('actionItems', [])
                            
                            # Validate action items structure
                            if isinstance(action_items, list):
                                validated_items = [
                                    ai for ai in action_items 
                                    if isinstance(ai, dict) and 'task' in ai
                                ]
                                
                                # Update the corresponding result
                                for result in results:
                                    if result['id'] == email_id:
                                        result['actionItems'] = validated_items
                                        break
                    
                    print(f"✓ Batch action extraction complete")
                else:
                    print(f"⚠️  Expected JSON array for actions, got: {type(actions_response)}")
        else:
            print("ℹ️  No emails need action extraction (none are Important/To-Do)")
        
    except Exception as e:
        print(f"❌ Batch processing failed: {e}")
        errors.append(f"Batch processing error: {str(e)}")
        
        # Fallback: at least return uncategorized results
        if not results:
            results = [{
                'id': email.get('id'),
                'category': 'Uncategorized',
                'actionItems': [],
                'error': str(e)
            } for email in emails]
    
    processed_count = len([r for r in results if not r.get('error')])
    
    print(f"📊 Batch processing summary: {processed_count}/{len(emails)} emails processed successfully")
    
    return {
        'success': len(errors) == 0,
        'processed': processed_count,
        'failed': len(errors),
        'results': results,
        'errors': errors
    }
