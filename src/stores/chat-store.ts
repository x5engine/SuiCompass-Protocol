import { create } from 'zustand'
import { db, auth } from '../../firebaseConfig.js'
import { User } from 'firebase/auth'
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  Unsubscribe
} from 'firebase/firestore'
import { playSound } from '../utils/sound-effects'

// Define the Message type
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string 
  timestamp: number // Local timestamp, Firestore converts to Timestamp
}

export interface Conversation {
  id: string
  title: string
  // Messages are fetched on demand
  createdAt: number
  updatedAt: number
}

export interface Suggestion {
    text: string
    icon: string
    type: string
}

interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null
  messages: ChatMessage[] // Messages for the *current* conversation
  suggestions: Suggestion[] // Context-aware suggestions from the AI
  loading: boolean
  currentUser: any | null
  
  // Subscription Cleanup
  unsubscribeConversations: Unsubscribe | null
  unsubscribeMessages: Unsubscribe | null
  
  // Actions
  initialize: () => void
  createConversation: () => Promise<string>
  selectConversation: (id: string) => void
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>
  setSuggestions: (suggestions: Suggestion[]) => void
  deleteConversation: (id: string) => Promise<void>
  updateTitle: (id: string, title: string) => Promise<void>
  clearAll: () => void
  
  // Transaction Logging (USDsui / SUI)
  logTransaction: (tx: any) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  suggestions: [], // Initial suggestions empty
  loading: false,
  currentUser: null,
  unsubscribeConversations: null,
  unsubscribeMessages: null,

  initialize: () => {
    // Listen to Auth State
    auth.onAuthStateChanged((user: User | null) => {
      // The new AuthLoader in App.tsx ensures this only runs *after* a user is available.
      if (!user) {
        console.log("No user session found. Clearing stores.");
        // Cleanup previous listeners
        if (get().unsubscribeConversations) get().unsubscribeConversations!();
        if (get().unsubscribeMessages) get().unsubscribeMessages!();
        set({ conversations: [], messages: [], currentConversationId: null, currentUser: null, unsubscribeConversations: null, unsubscribeMessages: null });
        return;
      }

      set({ currentUser: user });
      
      // Cleanup previous listeners if any (e.g., from a quick logout/login)
      if (get().unsubscribeConversations) get().unsubscribeConversations!();
      if (get().unsubscribeMessages) get().unsubscribeMessages!();

      // Subscribe to Conversations
      const q = query(
        collection(db, `users/${user.uid}/conversations`),
        orderBy('updatedAt', 'desc')
      );
      
      const unsub = onSnapshot(q, (snapshot) => {
        const conversations = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'New Chat',
            createdAt: data.createdAt?.toMillis() || Date.now(),
            updatedAt: data.updatedAt?.toMillis() || Date.now(),
          };
        }) as Conversation[];
        
        set({ conversations });
        
      });
      
      set({ unsubscribeConversations: unsub });
    });
  },

  createConversation: async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not logged in trying to create conversation");
      throw new Error("Must be logged in to create a conversation.");
    }
    
    playSound('click'); // SFX

    try {
      const newConvRef = await addDoc(collection(db, `users/${user.uid}/conversations`), {
        title: 'New Chat',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      get().selectConversation(newConvRef.id);
      return newConvRef.id;
    } catch (error) {
      console.error("Failed to create Firestore conversation document:", error);
      throw error;
    }
  },

  selectConversation: (id) => {
    const user = auth.currentUser;
    if (!user) return;
    
    // Cleanup previous message listener
    if (get().unsubscribeMessages) get().unsubscribeMessages!();
    
    set({ currentConversationId: id, loading: true, messages: [], suggestions: [] });
    
    // Subscribe to Messages for this conversation
    const q = query(
      collection(db, `users/${user.uid}/conversations/${id}/messages`),
      orderBy('timestamp', 'asc')
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role,
          content: data.content,
          timestamp: data.timestamp?.toMillis() || Date.now()
        };
      }) as ChatMessage[];
      
      set({ messages, loading: false });
    });
    
    set({ unsubscribeMessages: unsub });
  },

  setSuggestions: (suggestions) => {
      set({ suggestions });
  },

  addMessage: async (conversationId, message) => {
    let user = auth.currentUser;
    
    // Retry logic: Wait for auth if not ready immediately
    if (!user) {
        console.log("Waiting for user auth...");
        for (let i = 0; i < 10; i++) { // Wait up to 1s
            await new Promise(resolve => setTimeout(resolve, 100));
            user = auth.currentUser;
            if (user) break;
        }
    }

    if (!user) {
        console.warn("addMessage called but user is not logged in yet (timed out).");
        return;
    }
    
    // Play SFX immediately
    if (message.role === 'user') {
        playSound('click');
    } else {
        playSound('success'); 
    }

    try {
        // Add Message to Subcollection
        await addDoc(collection(db, `users/${user.uid}/conversations/${conversationId}/messages`), {
          role: message.role,
          content: message.content,
          timestamp: serverTimestamp()
        });
        
        // Update Conversation metadata
        const convRef = doc(db, `users/${user.uid}/conversations/${conversationId}`);
        const updateData: any = { updatedAt: serverTimestamp() };
        
        // Auto-title logic
        const currentTitle = get().conversations.find(c => c.id === conversationId)?.title;
        if (currentTitle === 'New Chat' && message.role === 'user') {
           updateData.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
        }
        
        await updateDoc(convRef, updateData);
    } catch (e) {
        console.error("Error adding message:", e);
        playSound('error');
    }
  },

  deleteConversation: async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    
    playSound('click');
    
    await deleteDoc(doc(db, `users/${user.uid}/conversations/${id}`));
    
    const current = get().currentConversationId;
    if (current === id) {
       set({ currentConversationId: null, messages: [], suggestions: [] });
    }
  },

  updateTitle: async (id, title) => {
    const user = auth.currentUser;
    if (!user) return;
    
    await updateDoc(doc(db, `users/${user.uid}/conversations/${id}`), {
      title
    });
  },

  clearAll: async () => {
      console.warn("Clear All not implemented for Firestore yet due to safety.");
  },
  
  logTransaction: async (tx) => {
      const user = auth.currentUser;
      if (!user) return;
      
      await addDoc(collection(db, `users/${user.uid}/transactions`), {
          ...tx,
          timestamp: serverTimestamp(),
          status: 'confirmed'
      });
      
      console.log("Transaction logged to Firestore:", tx);
  }

}));