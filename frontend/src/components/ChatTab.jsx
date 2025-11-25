import { useState, useEffect, useRef } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Loader2, Bot, User, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import useStore from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function ChatTab() {
  const toast = useToast();
  const { 
    chatMessages, 
    addChatMessage, 
    clearChatMessages,
    isChatLoading, 
    setIsChatLoading,
    selectedEmail,
    setSelectedEmail,
    emails,
    prompts,
    addDraft
  } = useStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const hasAutoSent = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    const autoQuery = sessionStorage.getItem('autoSendQuery');
    if (autoQuery && !hasAutoSent.current) {
      sessionStorage.removeItem('autoSendQuery');
      hasAutoSent.current = true;
      setInput(autoQuery);
      setTimeout(() => {
        sendQuery(autoQuery);
      }, 100);
    }
  }, []);

  const sendQuery = async (queryText) => {
    if (!queryText.trim() || isChatLoading) return;

    const userMessage = {
      role: 'user',
      content: queryText.trim(),
      timestamp: Date.now()
    };

    addChatMessage(userMessage);
    setInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryText.trim(),
          emailId: selectedEmail?.id,
          emails: emails,
          prompts: prompts
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: Date.now()
        };
        addChatMessage(assistantMessage);

        if (data.draft) {
          addDraft(data.draft);
          toast.success('Draft saved', {
            description: 'You can find it in the Drafts tab'
          });
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: Date.now()
      };
      addChatMessage(errorMessage);
      toast.error('Chat error', {
        description: error.message
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSend = async () => {
    sendQuery(input);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQueries = [
    'Summarize this email',
    'What tasks do I need to do?',
    'Draft a reply to this email',
    'Show me all important emails',
  ];

  const handleSuggestionClick = (query) => {
    setInput(query);
  };

  return (
    <TabsContent value="chat" className="h-full flex flex-col p-0 m-0">
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-green-900">Email Agent Chat</h2>
              <p className="text-sm text-green-700">
                Ask questions about your inbox or specific emails
              </p>
            </div>
            {chatMessages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearChatMessages();
                  toast.success('Chat cleared');
                }}
              >
                Clear Chat
              </Button>
            )}
          </div>
        </div>

        {/* Selected Email Context */}
        {selectedEmail && (
          <div className="px-6 py-3 bg-blue-100/60 border-b">
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Context</Badge>
                <span className="text-muted-foreground">
                  Discussing: <span className="font-medium text-foreground">{selectedEmail.subject}</span>
                </span>
                <span className="text-muted-foreground">
                  from <span className="font-medium text-foreground">{selectedEmail.senderName}</span>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEmail(null)}
                className="h-6 w-6 p-0 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Bot className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                {selectedEmail 
                  ? 'Ask me anything about the selected email or your inbox!'
                  : 'Select an email from the Inbox tab, or ask general questions about your emails.'}
              </p>
              
              {/* Suggested Queries */}
              <div className="flex flex-col gap-2 w-full max-w-md">
                <p className="text-xs text-muted-foreground mb-1">Try asking:</p>
                {suggestedQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(query)}
                    className="justify-start text-left"
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 max-w-[80%] border shadow-sm',
                      message.role === 'user'
                        ? 'bg-blue-100 text-blue-900 border-blue-200'
                        : 'bg-gray-100 text-gray-900 border-gray-200'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-60 mt-1 block">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t px-6 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedEmail ? "Ask about this email..." : "Ask about your inbox..."}
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isChatLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isChatLoading}
              size="icon"
            >
              {isChatLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </TabsContent>
  );
}
