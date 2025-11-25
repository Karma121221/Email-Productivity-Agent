import { Button } from '@/components/ui/button';
import { Waves, Loader2 } from 'lucide-react';

export default function Header({ onProcessEmails, isProcessing }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-blue-50 backdrop-blur supports-[backdrop-filter]:bg-blue-50/95">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Waves className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">Ocean AI Email Agent</h1>
        </div>
        <Button
          onClick={onProcessEmails}
          disabled={isProcessing}
          className="min-w-[140px] bg-green-600 hover:bg-green-700 text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Process Inbox'
          )}
        </Button>
      </div>
    </header>
  );
}
