// Main application component with tab-based navigation and state management

import { useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import useStore from './store/useStore';
import Layout from './components/Layout';
import InboxTab from './components/InboxTab';
import PromptsTab from './components/PromptsTab';
import ChatTab from './components/ChatTab';
import DraftsTab from './components/DraftsTab';

function App() {
  const toast = useToast();
  const { 
    activeTab, 
    setActiveTab, 
    isProcessingEmails, 
    setIsProcessingEmails,
    emails,
    prompts,
    updateEmailCategory,
    updateEmailActionItems
  } = useStore();

  useEffect(() => {
    const loadDefaultPrompts = async () => {
      try {
        const response = await fetch('/api/data/default_prompts.json');
        const data = await response.json();
        // Store full prompt objects (name, description, prompt)
        useStore.setState({ prompts: data });
      } catch (error) {
        console.error('Failed to load default prompts:', error);
      }
    };

    loadDefaultPrompts();
  }, []);

  const handleProcessEmails = async () => {
    setIsProcessingEmails(true);
    
    try {
      // Call backend API to process emails with LLM
      const response = await fetch('/api/emails/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          prompts
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update each email with category and action items
        data.results.forEach((result) => {
          if (result.category) {
            updateEmailCategory(result.id, result.category);
          }
          if (result.actionItems && result.actionItems.length > 0) {
            updateEmailActionItems(result.id, result.actionItems);
          }
        });

        toast.success(`Processed ${data.processed} emails!`, {
          description: data.failed > 0 
            ? `${data.failed} emails failed to process` 
            : 'All emails categorized successfully',
        });

        // Show errors if any
        if (data.errors && data.errors.length > 0) {
          console.warn('Processing errors:', data.errors);
        }
      } else {
        toast.error('Failed to process emails', {
          description: data.error || 'Unknown error occurred',
        });
      }
    } catch (error) {
      console.error('Error processing emails:', error);
      toast.error('Failed to process emails', {
        description: error.message || 'Network error',
      });
    } finally {
      setIsProcessingEmails(false);
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onProcessEmails={handleProcessEmails}
      isProcessing={isProcessingEmails}
    >
      <InboxTab />
      <PromptsTab />
      <ChatTab />
      <DraftsTab />
    </Layout>
  );
}

export default App;
