// Main layout wrapper component with header and tab navigation

import Header from './Header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Layout({ children, activeTab, onTabChange, onProcessEmails, isProcessing }) {
  return (
    <div className="min-h-screen bg-background">
      <Header onProcessEmails={onProcessEmails} isProcessing={isProcessing} />
      <div className="container px-6 py-6">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
          {children}
        </Tabs>
      </div>
    </div>
  );
}
