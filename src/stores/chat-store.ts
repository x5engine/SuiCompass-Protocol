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
  timestamp: number
}

export interface Conversation {
  id: string
  title: string
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
  messages: ChatMessage[]
  suggestions: Suggestion[]
  loading: boolean
  currentUser: any | null
  isOffline: boolean
  
  unsubscribeConversations: Unsubscribe | null
  unsubscribeMessages: Unsubscribe | null
  
  initialize: () => void
  setOfflineMode: (isOffline: boolean) => void
  createConversation: () => Promise<string>
  selectConversation: (id: string) => void
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>
  setSuggestions: (suggestions: Suggestion[]) => void
  deleteConversation: (id: string) => Promise<void>
}

// Helper to get local data
const getLocalConversations = () => {
    try {
        return JSON.parse(localStorage.getItem('local_conversations') || '[]');
    } catch { return []; }
};

const getLocalMessages = (id: string) => {
    try {
        return JSON.parse(localStorage.getItem(`local_messages_${id}`) || '[]');
    } catch { return []; }
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  suggestions: [],
  loading: false,
  currentUser: null,
  isOffline: false,
  unsubscribeConversations: null,
  unsubscribeMessages: null,

  initialize: () => {
    auth.onAuthStateChanged((user: User | null) => {
      if (!user) {
        // If no user, we might be offline or just not logged in yet.
        // The useAuth hook will eventually call setOfflineMode if anon auth fails.
        return;
      }

      set({ currentUser: user, isOffline: false });
      
      if (get().unsubscribeConversations) get().unsubscribeConversations!();

      // Subscribe to Firestore
      const q = query(collection(db, `users/${user.uid}/conversations`), orderBy('updatedAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        const conversations = snapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title || 'New Chat',
            createdAt: doc.data().createdAt?.toMillis() || Date.now(),
            updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
        })) as Conversation[];
        set({ conversations });
      }, (error) => {
          console.warn("Firestore subscription failed (likely auth), switching to offline:", error);
          get().setOfflineMode(true);
      });
      set({ unsubscribeConversations: unsub });
    });
  },

  setOfflineMode: (isOffline) => {
      set({ isOffline });
      if (isOffline) {
          // Load from Local Storage
          const conversations = getLocalConversations();
          set({ conversations });
          console.log("Chat Store switched to Offline Mode");
      }
  },

  createConversation: async () => {
    const { currentUser, isOffline } = get();
    
    // OFFLINE MODE
    if (isOffline || !currentUser) {
        const newConv = {
            id: 'local-' + Date.now(),
            title: 'New Chat',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        const convs = [newConv, ...getLocalConversations()];
        localStorage.setItem('local_conversations', JSON.stringify(convs));
        set({ conversations: convs });
        get().selectConversation(newConv.id);
        return newConv.id;
    }

    // ONLINE MODE
    try {
      const newConvRef = await addDoc(collection(db, `users/${currentUser.uid}/conversations`), {
        title: 'New Chat',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      get().selectConversation(newConvRef.id);
      return newConvRef.id;
    } catch (error) {
      console.error("Create conversation failed, falling back to offline:", error);
      get().setOfflineMode(true);
      return get().createConversation(); // Retry in offline mode
    }
  },

  selectConversation: (id) => {
    const { currentUser, isOffline } = get();
    set({ currentConversationId: id, loading: true, messages: [], suggestions: [] });

    if (isOffline || !currentUser || id.startsWith('local-')) {
        const messages = getLocalMessages(id);
        set({ messages, loading: false });
        return;
    }

    if (get().unsubscribeMessages) get().unsubscribeMessages!();
    
    const q = query(collection(db, `users/${currentUser.uid}/conversations/${id}/messages`), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        role: doc.data().role,
        content: doc.data().content,
        timestamp: doc.data().timestamp?.toMillis() || Date.now()
      })) as ChatMessage[];
      set({ messages, loading: false });
    });
    set({ unsubscribeMessages: unsub });
  },

  addMessage: async (conversationId, message) => {
    const { currentUser, isOffline } = get();
    
    if (message.role === 'user') playSound('click');
    else playSound('success');

    if (isOffline || !currentUser || conversationId.startsWith('local-')) {
        const newMessage: ChatMessage = {
            id: 'msg-' + Date.now(),
            role: message.role,
            content: message.content,
            timestamp: Date.now()
        };
        const messages = [...getLocalMessages(conversationId), newMessage];
        localStorage.setItem(`local_messages_${conversationId}`, JSON.stringify(messages));
        set({ messages });
        
        // Update title if needed
        const convs = getLocalConversations();
        const convIndex = convs.findIndex((c: any) => c.id === conversationId);
        if (convIndex >= 0) {
            convs[convIndex].updatedAt = Date.now();
            if (convs[convIndex].title === 'New Chat' && message.role === 'user') {
                convs[convIndex].title = message.content.slice(0, 30);
            }
            localStorage.setItem('local_conversations', JSON.stringify(convs));
            set({ conversations: convs });
        }
        return;
    }

    try {
        await addDoc(collection(db, `users/${currentUser.uid}/conversations/${conversationId}/messages`), {
          role: message.role,
          content: message.content,
          timestamp: serverTimestamp()
        });
        const convRef = doc(db, `users/${currentUser.uid}/conversations/${conversationId}`);
        await updateDoc(convRef, { updatedAt: serverTimestamp() });
    } catch (e) {
        console.error("Add message failed:", e);
    }
  },

  setSuggestions: (suggestions) => set({ suggestions }),
  
  deleteConversation: async (id) => {
      // Implementation omitted for brevity, but similar logic applies
      playSound('click');
      const { isOffline, currentUser } = get();
      if(isOffline || id.startsWith('local-')) {
          const convs = getLocalConversations().filter((c: any) => c.id !== id);
          localStorage.setItem('local_conversations', JSON.stringify(convs));
          set({ conversations: convs, currentConversationId: null, messages: [] });
      } else if (currentUser) {
          await deleteDoc(doc(db, `users/${currentUser.uid}/conversations/${id}`));
      }
  }
}));
