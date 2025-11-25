import { useState, useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import useStore from '@/store/useStore';
import PromptCard from './PromptCard';

const STORAGE_KEY = 'customPrompts';

export default function PromptsTab() {
  const { prompts, setPrompts } = useStore();
  const toast = useToast();
  const [editedPrompts, setEditedPrompts] = useState({
    categorization: { name: '', description: '', prompt: '' },
    actionExtraction: { name: '', description: '', prompt: '' },
    autoReply: { name: '', description: '', prompt: '' }
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const customPrompts = JSON.parse(stored);
        setEditedPrompts(customPrompts);
      } catch (error) {
        console.error('Error loading prompts:', error);
        toast.error('Failed to load saved prompts');
      }
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored && prompts && Object.keys(prompts).length > 0) {
      setEditedPrompts(prompts);
    }
  }, [prompts]);

  const handlePromptChange = (promptType, value) => {
    setEditedPrompts((prev) => ({
      ...prev,
      [promptType]: {
        ...prev[promptType],
        prompt: value
      }
    }));
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(editedPrompts));
      
      setPrompts(editedPrompts);
      
      toast.success('All prompts saved successfully!');
    } catch (error) {
      console.error('Error saving prompts:', error);
      toast.error('Failed to save prompts');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPrompt = async (promptType) => {
    try {
      const response = await fetch('/api/data/default_prompts.json');
      if (!response.ok) throw new Error('Failed to load defaults');
      
      const defaults = await response.json();
      
      setEditedPrompts((prev) => ({
        ...prev,
        [promptType]: defaults[promptType]
      }));
      
      toast.success(`${defaults[promptType].name} reset to default`);
    } catch (error) {
      console.error('Error resetting prompt:', error);
      toast.error('Failed to reset prompt');
    }
  };

  const handleResetAll = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/data/default_prompts.json');
      if (!response.ok) throw new Error('Failed to load defaults');
      
      const defaults = await response.json();
      
      localStorage.removeItem(STORAGE_KEY);
      
      setEditedPrompts(defaults);
      setPrompts(defaults);
      
      toast.success('All prompts reset to defaults');
    } catch (error) {
      console.error('Error resetting all prompts:', error);
      toast.error('Failed to reset prompts');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TabsContent value="prompts" className="mt-0">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Configure AI Prompts</h2>
          <p className="text-muted-foreground">
            Customize how the AI agent categorizes emails, extracts tasks, and generates replies.
            Changes are saved to your browser and will affect all future email processing.
          </p>
        </div>

        <div className="space-y-6">
          <PromptCard
            promptType="categorization"
            name={editedPrompts.categorization.name}
            description={editedPrompts.categorization.description}
            value={editedPrompts.categorization.prompt}
            onChange={handlePromptChange}
            onReset={handleResetPrompt}
          />

          <PromptCard
            promptType="actionExtraction"
            name={editedPrompts.actionExtraction.name}
            description={editedPrompts.actionExtraction.description}
            value={editedPrompts.actionExtraction.prompt}
            onChange={handlePromptChange}
            onReset={handleResetPrompt}
          />

          <PromptCard
            promptType="autoReply"
            name={editedPrompts.autoReply.name}
            description={editedPrompts.autoReply.description}
            value={editedPrompts.autoReply.prompt}
            onChange={handlePromptChange}
            onReset={handleResetPrompt}
          />
        </div>

        <Separator className="my-8" />

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleResetAll}
            disabled={isSaving}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
            Reset All to Defaults
          </Button>

          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="min-w-[150px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>💡 Tip:</strong> Prompts are stored locally in your browser. 
            Use clear, specific instructions for best results. You can always reset to defaults if needed.
          </p>
        </div>
      </div>
    </TabsContent>
  );
}
