// Drafts management tab with editor

import { useState, useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Trash2, Edit, Save, X, FileText } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import useStore from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function DraftsTab() {
  const { drafts, setDrafts, updateDraft, deleteDraft } = useStore();
  const toast = useToast();
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const response = await fetch('/api/drafts');
      const data = await response.json();
      
      if (data.success) {
        setDrafts(data.drafts);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
      toast.error('Failed to load drafts');
    }
  };

  const handleSelectDraft = (draft) => {
    setSelectedDraft(draft);
    setEditedSubject(draft.subject);
    setEditedBody(draft.body);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedSubject(selectedDraft.subject);
    setEditedBody(selectedDraft.body);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedDraft) return;

    setIsSaving(true);
    try {
      const updatedDraft = {
        ...selectedDraft,
        subject: editedSubject,
        body: editedBody,
        updatedAt: Date.now()
      };

      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDraft),
      });

      const data = await response.json();

      if (data.success) {
        updateDraft(selectedDraft.id, updatedDraft);
        setSelectedDraft(updatedDraft);
        setIsEditing(false);
        toast.success('Draft saved');
      } else {
        throw new Error(data.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft', {
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (draftId, e) => {
    e?.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this draft?')) return;

    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        deleteDraft(draftId);
        if (selectedDraft?.id === draftId) {
          setSelectedDraft(null);
        }
        toast.success('Draft deleted');
      } else {
        throw new Error(data.error || 'Failed to delete draft');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft', {
        description: error.message
      });
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <TabsContent value="drafts" className="mt-0 h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Drafts List */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Drafts</h2>
              <p className="text-sm text-muted-foreground">
                {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {drafts.length === 0 ? (
              <Card className="p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  No drafts yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Use the Chat tab to generate draft replies
                </p>
              </Card>
            ) : (
              drafts.map((draft) => (
                <Card
                  key={draft.id}
                  onClick={() => handleSelectDraft(draft)}
                  className={cn(
                    'p-4 cursor-pointer transition-all hover:shadow-md bg-slate-50 hover:bg-slate-100',
                    selectedDraft?.id === draft.id && 'border-l-4 border-l-orange-400 bg-orange-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {draft.subject}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(draft.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => handleDelete(draft.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {draft.body.substring(0, 100)}...
                  </p>
                  {draft.metadata?.category && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {draft.metadata.category}
                    </Badge>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Draft Editor */}
        <div className="md:col-span-2">
          {selectedDraft ? (
            <Card className="h-full flex flex-col bg-gray-50">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle>Draft Editor</CardTitle>
                    <CardDescription>
                      {selectedDraft.metadata?.originalSender && (
                        <span>
                          Reply to: {selectedDraft.metadata.originalSender}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(selectedDraft.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEdit}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDraft(null)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Close
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="flex-1 overflow-auto pt-6 space-y-4">
                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  {isEditing ? (
                    <input
                      id="subject"
                      type="text"
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="font-semibold">{selectedDraft.subject}</p>
                  )}
                </div>

                {/* Body */}
                <div className="space-y-2 flex-1">
                  <Label htmlFor="body">Body</Label>
                  {isEditing ? (
                    <Textarea
                      id="body"
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      className="min-h-[300px] font-mono"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 border rounded-md bg-accent/20">
                      {selectedDraft.body}
                    </div>
                  )}
                </div>

                {/* Metadata */}
                {selectedDraft.metadata && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-2">Draft Info</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {selectedDraft.metadata.originalSubject && (
                        <p>Original: {selectedDraft.metadata.originalSubject}</p>
                      )}
                      <p>Created: {formatDate(selectedDraft.createdAt)}</p>
                      {selectedDraft.updatedAt && selectedDraft.updatedAt !== selectedDraft.createdAt && (
                        <p>Updated: {formatDate(selectedDraft.updatedAt)}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Draft Selected</h3>
                <p className="text-sm text-muted-foreground">
                  Select a draft from the list to view and edit it
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </TabsContent>
  );
}
