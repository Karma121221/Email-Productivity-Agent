"""
LLM Service - Google Gemini API Integration
Handles all interactions with the Gemini API for text generation
"""

import os
import json
import time
from typing import Optional, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()


class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.mock_mode = os.getenv('MOCK_LLM', 'false').lower() == 'true'
        
        if not self.api_key and not self.mock_mode:
            print("⚠️  Warning: GEMINI_API_KEY not found. Using mock mode.")
            self.mock_mode = True
        
        if not self.mock_mode and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                print("✓ Gemini API initialized successfully")
            except Exception as e:
                print(f"✗ Failed to initialize Gemini API: {e}")
                print("  Falling back to mock mode")
                self.mock_mode = True
    
    def generate_text(self, prompt: str, max_retries: int = 3) -> Optional[str]:
        """
        Generate text response from LLM
        
        Args:
            prompt: The prompt to send to the LLM
            max_retries: Number of retry attempts on failure
        
        Returns:
            Generated text or None on failure
        """
        if self.mock_mode:
            return self._mock_generate_text(prompt)
        
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                return response.text
            except Exception as e:
                print(f"Attempt {attempt + 1}/{max_retries} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    print("All retry attempts failed. Returning None.")
                    return None
        
        return None
    
    def generate_json(self, prompt: str, max_retries: int = 3) -> Any:
        """
        Generate JSON response from LLM
        
        Args:
            prompt: The prompt to send to the LLM
            max_retries: Number of retry attempts on failure
        
        Returns:
            Parsed JSON object or empty list on failure
        """
        if self.mock_mode:
            return self._mock_generate_json(prompt)
        
        response_text = self.generate_text(prompt, max_retries)
        
        if not response_text:
            return []
        
        # Clean up response (remove code block markers)
        response_text = response_text.strip()
        response_text = response_text.replace('```json', '').replace('```', '').strip()
        
        try:
            parsed = json.loads(response_text)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON response: {e}")
            print(f"Response was: {response_text[:200]}...")
            return []
    
    def _mock_generate_text(self, prompt: str) -> str:
        """Mock text generation for development without API key"""
        prompt_lower = prompt.lower()
        
        # Check if this is a categorization request
        if 'categorize' in prompt_lower or 'category' in prompt_lower:
            # Extract the email section (after "Email:" or "email:")
            email_section = ''
            if 'email:' in prompt_lower:
                email_section = prompt[prompt_lower.find('email:'):]
            else:
                email_section = prompt
            
            email_lower = email_section.lower()
            
            # Apply categorization rules based on email content only
            # Check for Important: URGENT or CEO in subject, or from sarah@company.com
            if 'urgent' in email_lower and 'subject:' in email_lower:
                # Check if URGENT is in the subject line specifically
                subject_start = email_lower.find('subject:')
                subject_end = email_lower.find('\n', subject_start)
                subject_line = email_lower[subject_start:subject_end] if subject_end > 0 else email_lower[subject_start:]
                if 'urgent' in subject_line or 'ceo' in subject_line:
                    return 'Important'
            
            if 'sarah@company.com' in email_lower:
                return 'Important'
            
            # Check for Newsletter: newsletter, weekly, or update
            if 'newsletter' in email_lower or 'weekly' in email_lower or 'week in' in email_lower:
                return 'Newsletter'
            if 'update' in email_lower and 'subject:' in email_lower:
                subject_start = email_lower.find('subject:')
                subject_end = email_lower.find('\n', subject_start)
                subject_line = email_lower[subject_start:subject_end] if subject_end > 0 else email_lower[subject_start:]
                if 'update' in subject_line:
                    return 'Newsletter'
            
            # Check for Spam: sale, discount, or limited
            if 'sale' in email_lower or 'discount' in email_lower or 'limited' in email_lower:
                return 'Spam'
            if '70%' in email_section or 'off everything' in email_lower:
                return 'Spam'
            
            # Everything else is To-Do
            return 'To-Do'
        
        return 'Uncategorized'
    
    def _mock_generate_json(self, prompt: str) -> list:
        """Mock JSON generation for development without API key - supports batch processing"""
        prompt_lower = prompt.lower()
        
        # Detect batch categorization request (multiple "Email ID:" markers)
        if 'categorize' in prompt_lower and prompt.count('Email ID:') > 1:
            print(f"🔧 Mock: Detected batch categorization request")
            results = []
            
            # Extract all email IDs and their content
            import re
            email_sections = prompt.split('---')
            
            for section in email_sections:
                if 'Email ID:' not in section:
                    continue
                
                # Extract email ID
                id_match = re.search(r'Email ID:\s*(\S+)', section)
                if not id_match:
                    continue
                
                email_id = id_match.group(1)
                section_lower = section.lower()
                
                # Apply categorization rules (same as _mock_generate_text)
                category = 'To-Do'  # Default
                
                if 'urgent' in section_lower or 'ceo' in section_lower:
                    if 'subject:' in section_lower:
                        subject_start = section_lower.find('subject:')
                        subject_end = section_lower.find('\n', subject_start)
                        subject_line = section_lower[subject_start:subject_end] if subject_end > 0 else section_lower[subject_start:]
                        if 'urgent' in subject_line or 'ceo' in subject_line:
                            category = 'Important'
                
                if 'sarah@company.com' in section_lower:
                    category = 'Important'
                
                if 'newsletter' in section_lower or 'weekly' in section_lower or 'week in' in section_lower:
                    category = 'Newsletter'
                
                if 'update' in section_lower and 'subject:' in section_lower:
                    subject_start = section_lower.find('subject:')
                    subject_end = section_lower.find('\n', subject_start)
                    subject_line = section_lower[subject_start:subject_end] if subject_end > 0 else section_lower[subject_start:]
                    if 'update' in subject_line:
                        category = 'Newsletter'
                
                if 'sale' in section_lower or 'discount' in section_lower or 'limited' in section_lower:
                    category = 'Spam'
                if '70%' in section or 'off everything' in section_lower:
                    category = 'Spam'
                
                results.append({
                    'emailId': email_id,
                    'category': category
                })
            
            print(f"🔧 Mock: Returning {len(results)} categorized emails")
            return results
        
        # Detect batch action extraction request
        if 'action' in prompt_lower and 'extract' in prompt_lower and prompt.count('Email ID:') > 1:
            print(f"🔧 Mock: Detected batch action extraction request")
            results = []
            
            # Extract all email IDs
            import re
            email_sections = prompt.split('---')
            
            for section in email_sections:
                if 'Email ID:' not in section:
                    continue
                
                # Extract email ID
                id_match = re.search(r'Email ID:\s*(\S+)', section)
                if not id_match:
                    continue
                
                email_id = id_match.group(1)
                section_lower = section.lower()
                
                # Generate action items based on content
                action_items = []
                
                if 'meeting' in section_lower:
                    action_items = [
                        {"task": "Review agenda and prepare materials", "deadline": "none", "priority": "high"},
                        {"task": "Confirm attendance", "deadline": "none", "priority": "medium"}
                    ]
                elif 'review' in section_lower or 'proposal' in section_lower:
                    action_items = [
                        {"task": "Review document and provide feedback", "deadline": "none", "priority": "high"}
                    ]
                elif 'update' in section_lower or 'report' in section_lower:
                    action_items = [
                        {"task": "Read update and acknowledge", "deadline": "none", "priority": "low"}
                    ]
                elif 'urgent' in section_lower or 'action required' in section_lower:
                    action_items = [
                        {"task": "Take required action", "deadline": "none", "priority": "high"}
                    ]
                
                if action_items:
                    results.append({
                        'emailId': email_id,
                        'actionItems': action_items
                    })
            
            print(f"🔧 Mock: Returning action items for {len(results)} emails")
            return results
        
        # Single email action extraction (legacy support)
        if 'meeting' in prompt_lower:
            return [
                {
                    "task": "Review agenda and prepare materials",
                    "deadline": "none",
                    "priority": "high"
                },
                {
                    "task": "Confirm attendance",
                    "deadline": "none",
                    "priority": "medium"
                }
            ]
        elif 'review' in prompt_lower or 'proposal' in prompt_lower:
            return [
                {
                    "task": "Review document and provide feedback",
                    "deadline": "none",
                    "priority": "high"
                }
            ]
        elif 'update' in prompt_lower or 'report' in prompt_lower:
            return [
                {
                    "task": "Read update and acknowledge",
                    "deadline": "none",
                    "priority": "low"
                }
            ]
        
        return []


def parse_category(response: str) -> str:
    """
    Parse category from LLM response
    
    Args:
        response: Raw text response from LLM
    
    Returns:
        Valid category name or 'Uncategorized'
    """
    if not response:
        return 'Uncategorized'
    
    response = response.strip()
    
    # Check for valid categories (case-insensitive)
    categories = ['Important', 'Newsletter', 'Spam', 'To-Do']
    for category in categories:
        if category.lower() in response.lower():
            return category
    
    return 'Uncategorized'
