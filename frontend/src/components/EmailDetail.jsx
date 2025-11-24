// Displays the full email detail with all content and metadata

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Paperclip, ClipboardList, MessageSquare } from 'lucide-react';
import useStore from '@/store/useStore';

export default function EmailDetail({ email }) {
  const { setActiveTab } = useStore();

  const handleGenerateReply = () => {
    // Store the query intent and switch to chat tab
    // The ChatTab will pick this up and auto-send
    sessionStorage.setItem('autoSendQuery', 'Draft a reply to this email');
    setActiveTab('chat');
  };
  if (!email) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select an email to view details</p>
      </div>
    );
  }

  const getCategoryClass = (category) => {
    const classes = {
      'Important': 'badge-important',
      'To-Do': 'badge-todo',
      'Newsletter': 'badge-newsletter',
      'Spam': 'badge-spam'
    };
    return classes[category] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col bg-gray-50">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl mb-3">{email.subject}</CardTitle>
              <CardDescription className="flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-gray-100/80 px-3 py-2 rounded-md w-fit">
                  <span className="font-semibold">{email.senderName}</span>
                  <span className="text-muted-foreground">&lt;{email.sender}&gt;</span>
                </div>
                <span className="text-xs bg-gray-100/80 px-3 py-1.5 rounded-md w-fit">{formatDate(email.timestamp)}</span>
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {email.category && (
                <Badge className={`border ${getCategoryClass(email.category)}`}>
                  {email.category}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateReply}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Generate Reply
              </Button>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="flex-1 overflow-auto pt-6">
          <div className="whitespace-pre-wrap text-sm leading-relaxed mb-6">
            {email.body}
          </div>

          {email.hasAttachments && (
            <div className="mb-6">
              <Badge variant="outline" className="text-xs gap-1">
                <Paperclip className="h-3 w-3" />
                Has Attachments
              </Badge>
            </div>
          )}

          {email.actionItems && email.actionItems.length > 0 && (
            <div className="mt-6 bg-blue-100/70 p-4 rounded-lg">
              <Accordion type="single" collapsible defaultValue="action-items">
                <AccordionItem value="action-items">
                  <AccordionTrigger className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Action Items ({email.actionItems.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {email.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground">•</span>
                          <div className="flex-1">
                            <p>{item.task}</p>
                            {item.deadline && item.deadline !== 'none' && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Deadline: {item.deadline}
                              </p>
                            )}
                            {item.priority && (
                              <Badge 
                                variant={item.priority === 'high' ? 'destructive' : 'outline'}
                                className="mt-1 text-xs"
                              >
                                {item.priority}
                              </Badge>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </CardContent>

        <Separator />

        <div className="p-4 flex gap-2">
          <Button>Reply</Button>
          <Button variant="outline">Archive</Button>
          <Button variant="outline">More</Button>
        </div>
      </Card>
    </div>
  );
}
