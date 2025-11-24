// Zustand store for global state management of emails, prompts, drafts, and UI state

import { create } from 'zustand';

const useStore = create((set) => ({
  // Email state
  emails: [],
  selectedEmail: null,
  isLoadingEmails: false,
  isProcessingEmails: false,

  // Prompts state (full objects with name, description, prompt)
  prompts: {
    categorization: { name: '', description: '', prompt: '' },
    actionExtraction: { name: '', description: '', prompt: '' },
    autoReply: { name: '', description: '', prompt: '' },
  },

  // Drafts state
  drafts: [],

  // Chat state
  chatMessages: [],
  isChatLoading: false,

  // UI state
  activeTab: 'inbox',

  // Email actions
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

  // Prompts actions
  setPrompts: (prompts) => set({ prompts }),
  updatePrompt: (promptType, promptText) =>
    set((state) => ({
      prompts: { ...state.prompts, [promptType]: promptText },
    })),

  // Drafts actions
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

  // Chat actions
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  clearChatMessages: () => set({ chatMessages: [] }),
  setIsChatLoading: (isLoading) => set({ isChatLoading: isLoading }),

  // UI actions
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useStore;
