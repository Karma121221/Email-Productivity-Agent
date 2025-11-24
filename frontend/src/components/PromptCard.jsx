import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';

export default function PromptCard({ 
  promptType, 
  name, 
  description, 
  value, 
  onChange, 
  onReset 
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReset(promptType)}
            className="ml-4"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={promptType}>Prompt Text</Label>
            <Badge variant="secondary" className="text-xs">
              {value?.length || 0} characters
            </Badge>
          </div>
          <Textarea
            id={promptType}
            value={value || ''}
            onChange={(e) => onChange(promptType, e.target.value)}
            placeholder={`Enter your ${name.toLowerCase()} prompt...`}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
