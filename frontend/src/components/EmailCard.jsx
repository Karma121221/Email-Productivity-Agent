// Displays individual email item in the inbox list as a card

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmailCard({ email, isSelected, onClick }) {
  const getCategoryClass = (category) => {
    const classes = {
      'Important': 'badge-important',
      'To-Do': 'badge-todo',
      'Newsletter': 'badge-newsletter',
      'Spam': 'badge-spam'
    };
    return classes[category] || 'bg-gray-100 text-gray-700 border-gray-300';
  };
  
  const getCardBorderClass = (category) => {
    const classes = {
      'Important': 'border-l-red-400',
      'To-Do': 'border-l-green-400',
      'Newsletter': 'border-l-blue-400',
      'Spam': 'border-l-orange-400'
    };
    return classes[category] || '';
  };

  const getRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const preview = email.body.substring(0, 100) + (email.body.length > 100 ? '...' : '');

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-md border-l-4',
        isSelected ? getCardBorderClass(email.category) : 'border-l-gray-400',
        isSelected && 'bg-blue-50/50',
        !email.isRead && 'bg-gray-50'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              'text-sm truncate',
              !email.isRead ? 'font-bold' : 'font-semibold'
            )}>
              {email.subject}
            </h3>
            {email.category && (
              <Badge className={cn("shrink-0 border", getCategoryClass(email.category))}>
                {email.category}
              </Badge>
            )}
          </div>
          <span className={cn(
            'text-sm text-muted-foreground truncate',
            !email.isRead && 'font-medium'
          )}>
            From: {email.senderName}
          </span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {getRelativeTime(email.timestamp)}
        </span>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
        {preview}
      </p>

      {email.actionItems && email.actionItems.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ClipboardList className="h-3 w-3" />
          <span>{email.actionItems.length} task{email.actionItems.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </Card>
  );
}
