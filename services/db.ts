
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  getDoc, 
  query, 
  orderBy, 
  Timestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { MenuItem, Table, Order, BusinessProfile, AppSettings } from '../types.ts';
import { INITIAL_MENU, INITIAL_TABLES, INITIAL_PROFILE, INITIAL_SETTINGS } from '../constants.tsx';

/**
 * Firebase Configuration
 * These values are injected via process.env. 
 * If you are running locally, ensure these match your Firebase Project.
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyB-cPRYfJPeFmFSoxa3l9HyhJX1tmoaoFs", 
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "myrbpos.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "myrbpos",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "myrbpos.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_SENDER_ID || "29530955620",
  appId: process.env.FIREBASE_APP_ID || "1:29530955620:web:cf22aa54c4952a8a786471"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

class FirestoreService {
  /**
   * Tests if the connection to Firestore is established and authorized.
   */
  async testConnection(): Promise<boolean> {
    try {
      // Check for a specific config doc. If Project ID is 'YOUR_PROJECT_ID', this will fail.
      if (firebaseConfig.projectId.includes("YOUR_PROJECT_ID") || firebaseConfig.projectId.includes("your-project-id")) {
        console.error("Firestore Error: You are still using placeholder Project IDs. Please update services/db.ts with your Firebase keys.");
        return false;
      }
      
      const testDoc = await getDoc(doc(firestore, 'config', 'app_settings'));
      return true;
    } catch (e: any) {
      if (e.code === 'permission-denied') {
        console.error("Firestore Error: Permission Denied. Please update your Firestore Security Rules in the Firebase Console.");
      } else {
        console.error("Firestore Connection Error:", e);
      }
      return false;
    }
  }

  // --- MENU ITEMS ---
  
  subscribeToMenu(callback: (items: MenuItem[]) => void) {
    const q = query(collection(firestore, 'menu_items'), orderBy('category'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as MenuItem));
      if (items.length === 0) callback(INITIAL_MENU);
      else callback(items);
    }, (err) => console.error("Menu Subscription Error:", err));
  }

  async updateMenu(items: MenuItem[]) {
    for (const item of items) {
      await setDoc(doc(firestore, 'menu_items', item.id), item);
    }
  }

  // --- TABLES ---

  subscribeToTables(callback: (tables: Table[]) => void) {
    return onSnapshot(collection(firestore, 'tables'), (snapshot) => {
      const tables = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Table));
      if (tables.length === 0) callback(INITIAL_TABLES);
      else callback(tables);
    }, (err) => console.error("Table Subscription Error:", err));
  }

  async setTables(tables: Table[]) {
    for (const table of tables) {
      await setDoc(doc(firestore, 'tables', table.id), table);
    }
  }

  async updateTable(id: string, updates: Partial<Table>) {
    await updateDoc(doc(firestore, 'tables', id), updates);
  }

  // --- ORDERS ---

  subscribeToOrders(callback: (orders: Order[]) => void) {
    const q = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Order));
      callback(orders);
    }, (err) => console.error("Orders Subscription Error:", err));
  }

  async createOrder(order: Order) {
    const docId = order.id.startsWith('ORD_') ? order.id : `ORD_${order.id.replace('#', '')}`;
    await setDoc(doc(firestore, 'orders', docId), {
      ...order,
      id: docId,
      serverTimestamp: Timestamp.now()
    });
  }

  // --- CONFIG (SINGLETONS) ---

  subscribeToSettings(callback: (settings: AppSettings) => void) {
    return onSnapshot(doc(firestore, 'config', 'app_settings'), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as AppSettings);
      } else {
        this.updateSettings(INITIAL_SETTINGS);
        callback(INITIAL_SETTINGS);
      }
    });
  }

  async updateSettings(settings: AppSettings) {
    await setDoc(doc(firestore, 'config', 'app_settings'), settings);
  }

  async getProfile(): Promise<BusinessProfile | null> {
    const snap = await getDoc(doc(firestore, 'config', 'business_profile'));
    if (snap.exists()) return snap.data() as BusinessProfile;
    await this.updateProfile(INITIAL_PROFILE);
    return INITIAL_PROFILE;
  }

  async updateProfile(profile: BusinessProfile) {
    await setDoc(doc(firestore, 'config', 'business_profile'), profile);
  }
}

export const db = new FirestoreService();
