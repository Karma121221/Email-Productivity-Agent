import { create } from 'zustand';

const useStore = create((set) => ({
  emails: [],
  selectedEmail: null,
  isLoadingEmails: false,
  isProcessingEmails: false,

  prompts: {
    categorization: { name: '', description: '', prompt: '' },
    actionExtraction: { name: '', description: '', prompt: '' },
    autoReply: { name: '', description: '', prompt: '' },
  },

  drafts: [],

  chatMessages: [],
  isChatLoading: false,

  activeTab: 'inbox',

  setEmails: (emails) => set({ emails }),
  setSelectedEmail: (email) => set({ selectedEmail: email }),
  setIsLoadingEmails: (isLoading) => set({ isLoadingEmails: isLoading }),
  setIsProcessingEmails: (isProcessing) => set({ isProcessingEmails: isProcessing }),
  
  updateEmailCategory: (emailId, category) =>
    set((state) => ({
      emails: state.emails.map((email) =>
        email.id === emailId ? { ...email, category } : email
      ),
    })),

  updateEmailActionItems: (emailId, actionItems) =>
    set((state) => ({
      emails: state.emails.map((email) =>
        email.id === emailId ? { ...email, actionItems } : email
      ),
    })),

  setPrompts: (prompts) => set({ prompts }),
  updatePrompt: (promptType, promptText) =>
    set((state) => ({
      prompts: { ...state.prompts, [promptType]: promptText },
    })),

  setDrafts: (drafts) => set({ drafts }),
  
  addDraft: (draft) =>
    set((state) => ({
      drafts: [...state.drafts, draft],
    })),

  updateDraft: (draftId, updatedDraft) =>
    set((state) => ({
      drafts: state.drafts.map((draft) =>
        draft.id === draftId ? { ...draft, ...updatedDraft } : draft
      ),
    })),

  deleteDraft: (draftId) =>
    set((state) => ({
      drafts: state.drafts.filter((draft) => draft.id !== draftId),
    })),

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  clearChatMessages: () => set({ chatMessages: [] }),
  setIsChatLoading: (isLoading) => set({ isChatLoading: isLoading }),

  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useStore;
