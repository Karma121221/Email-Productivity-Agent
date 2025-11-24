// Inbox tab with email list and detail view

import { useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import useStore from '@/store/useStore';
import EmailCard from './EmailCard';
import EmailDetail from './EmailDetail';

export default function InboxTab() {
  const toast = useToast();
  const { 
    emails, 
    selectedEmail, 
    isLoadingEmails,
    setEmails, 
    setSelectedEmail, 
    setIsLoadingEmails 
  } = useStore();

  useEffect(() => {
    // Only load emails if store is empty (avoid overwriting processed data)
    if (emails.length === 0) {
      loadEmails();
    }
  }, []);

  const loadEmails = async () => {
    setIsLoadingEmails(true);
    try {
      const response = await fetch('/api/emails/load');
      const data = await response.json();
      
      if (data.success) {
        setEmails(data.emails);
        toast.success('Inbox loaded', {
          description: `${data.count} emails loaded successfully`
        });
      } else {
        throw new Error(data.error || 'Failed to load emails');
      }
    } catch (error) {
      console.error('Error loading emails:', error);
      toast.error('Failed to load emails', {
        description: error.message
      });
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleCloseDetail = () => {
    setSelectedEmail(null);
  };

  return (
    <TabsContent value="inbox" className="mt-0">
      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Email List */}
        <div className={cn(
          "border-r pr-6 overflow-auto transition-all duration-300 ease-in-out",
          selectedEmail ? "w-2/5" : "w-full"
        )}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Inbox {emails.length > 0 && `(${emails.length})`}
            </h2>
          </div>

          <div className="space-y-2">
            {isLoadingEmails ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))
            ) : emails.length > 0 ? (
              emails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  isSelected={selectedEmail?.id === email.id}
                  onClick={() => handleEmailClick(email)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No emails in inbox</p>
              </div>
            )}
          </div>
        </div>

        {/* Email Detail - Only show when email is selected */}
        {selectedEmail && (
          <div className="flex-1 overflow-auto animate-in slide-in-from-right duration-300">
            <div className="mb-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDetail}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
            <EmailDetail email={selectedEmail} />
          </div>
        )}
      </div>
    </TabsContent>
  );
}
