// Inbox tab with email list and detail view

import { useEffect, useState, useMemo } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/contexts/ToastContext';
import { X, Search, Filter } from 'lucide-react';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = ['Important', 'To-Do', 'Newsletter', 'Spam'];

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

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
  };

  // Filtered emails based on search and category filters
  const filteredEmails = useMemo(() => {
    let filtered = emails;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(query) ||
        email.senderName.toLowerCase().includes(query) ||
        email.sender.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query)
      );
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(email => 
        selectedCategories.includes(email.category)
      );
    }

    return filtered;
  }, [emails, searchQuery, selectedCategories]);

  const hasActiveFilters = searchQuery.trim() || selectedCategories.length > 0;

  return (
    <TabsContent value="inbox" className="mt-0">
      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Email List */}
        <div className={cn(
          "border-r pr-6 overflow-auto transition-all duration-300 ease-in-out",
          selectedEmail ? "w-2/5" : "w-full"
        )}>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">
                Inbox {emails.length > 0 && `(${emails.length})`}
              </h2>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-1 text-xs"
                >
                  <X className="h-3 w-3" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedCategories.includes(category) && "shadow-sm"
                    )}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Results Count */}
            {hasActiveFilters && (
              <p className="text-xs text-muted-foreground mb-2">
                Showing {filteredEmails.length} of {emails.length} emails
              </p>
            )}
          </div>

          <div className="space-y-2">
            {isLoadingEmails ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))
            ) : filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  isSelected={selectedEmail?.id === email.id}
                  onClick={() => handleEmailClick(email)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>{emails.length === 0 ? 'No emails in inbox' : 'No emails match your filters'}</p>
                {hasActiveFilters && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Email Detail - Only show when email is selected */}
        {selectedEmail && (
          <div className="flex-1 overflow-auto animate-in slide-in-from-right duration-300 pr-3 scrollbar-hide">
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
