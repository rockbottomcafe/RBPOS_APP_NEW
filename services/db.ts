import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  getDoc, 
  updateDoc, 
  query, 
  orderBy, 
  getDocs,
  writeBatch,
  deleteDoc,
  Firestore
} from 'firebase/firestore';
import { MenuItem, Table, Order, BusinessProfile, AppSettings } from '../types.ts';
import { INITIAL_MENU, INITIAL_TABLES, INITIAL_PROFILE, INITIAL_SETTINGS } from '../constants.tsx';

/**
 * FIREBASE CONFIGURATION
 * Connected to project: rbpos-2d01e
 */
const firebaseConfig = {
  apiKey: "AIzaSyCMbqjkw-v2g1z93RsGqe7h3YS8CMcWWEQ",
  authDomain: "rbpos-2d01e.firebaseapp.com",
  projectId: "rbpos-2d01e",
  storageBucket: "rbpos-2d01e.firebasestorage.app",
  messagingSenderId: "311698066496",
  appId: "1:311698066496:web:b9648f5dd28a2c2ebf63a5",
  measurementId: "G-8BWN8XP8XD"
};

// Initialize Firebase only if not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

class FirestoreService {
  private db: Firestore = firestore;

  constructor() {
    this.checkConfigAndSeed();
  }

  private async checkConfigAndSeed() {
    // Prevent seeding or operations if config hasn't been updated
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_")) {
      console.warn("Firebase configuration is not set correctly.");
      return;
    }
    await this.seedInitialData();
  }

  private async seedInitialData() {
    try {
      const menuSnap = await getDocs(collection(this.db, 'menu_items'));
      if (menuSnap.empty) {
        console.log("Seeding initial menu items to Firestore...");
        const batch = writeBatch(this.db);
        INITIAL_MENU.forEach(item => {
          const ref = doc(collection(this.db, 'menu_items'), item.id);
          batch.set(ref, item);
        });
        await batch.commit();
      }

      const tablesSnap = await getDocs(collection(this.db, 'tables'));
      if (tablesSnap.empty) {
        console.log("Seeding initial tables to Firestore...");
        const batch = writeBatch(this.db);
        INITIAL_TABLES.forEach(table => {
          const ref = doc(collection(this.db, 'tables'), table.id);
          batch.set(ref, table);
        });
        await batch.commit();
      }

      const configCol = collection(this.db, 'config');
      
      const profileRef = doc(configCol, 'business_profile');
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        await setDoc(profileRef, INITIAL_PROFILE);
      }

      const settingsRef = doc(configCol, 'app_settings');
      const settingsSnap = await getDoc(settingsRef);
      if (!settingsSnap.exists()) {
        await setDoc(settingsRef, INITIAL_SETTINGS);
      }
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }

  subscribeToMenu(callback: (items: MenuItem[]) => void) {
    const q = query(collection(this.db, 'menu_items'), orderBy('category', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as MenuItem);
      callback(items);
    }, (error) => {
      console.error("Menu subscription error:", error);
      callback([]); // Allow UI to proceed with empty list
    });
  }

  async updateMenu(items: MenuItem[]) {
    const batch = writeBatch(this.db);
    items.forEach(item => {
      const ref = doc(collection(this.db, 'menu_items'), item.id);
      batch.set(ref, item);
    });
    return batch.commit();
  }

  async deleteMenuItem(id: string) {
    return deleteDoc(doc(this.db, 'menu_items', id));
  }

  subscribeToTables(callback: (tables: Table[]) => void) {
    return onSnapshot(collection(this.db, 'tables'), (snapshot) => {
      const tables = snapshot.docs.map(doc => doc.data() as Table);
      callback(tables);
    }, (error) => {
      console.error("Tables subscription error:", error);
      callback([]); // Allow UI to proceed with empty list
    });
  }

  async setTables(tables: Table[]) {
    const batch = writeBatch(this.db);
    tables.forEach(table => {
      const ref = doc(collection(this.db, 'tables'), table.id);
      batch.set(ref, table);
    });
    return batch.commit();
  }

  async updateTable(id: string, updates: Partial<Table>) {
    const ref = doc(this.db, 'tables', id);
    return updateDoc(ref, updates);
  }

  subscribeToOrders(callback: (orders: Order[]) => void) {
    const q = query(collection(this.db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => doc.data() as Order);
      callback(orders);
    }, (error) => {
      console.error("Orders subscription error:", error);
      callback([]); // Allow UI to proceed with empty list
    });
  }

  async createOrder(order: Order) {
    const docId = order.id.replace('#', 'ORD_');
    const ref = doc(this.db, 'orders', docId);
    return setDoc(ref, {
      ...order,
      createdAt: order.createdAt || Date.now()
    });
  }

  subscribeToSettings(callback: (settings: AppSettings) => void) {
    return onSnapshot(doc(this.db, 'config', 'app_settings'), (snap) => {
      if (snap.exists()) {
        callback(snap.data() as AppSettings);
      }
    }, (error) => {
      console.error("Settings subscription error:", error);
    });
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const snap = await getDoc(doc(this.db, 'config', 'app_settings'));
      return snap.exists() ? (snap.data() as AppSettings) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  async updateSettings(settings: AppSettings) {
    return setDoc(doc(this.db, 'config', 'app_settings'), settings);
  }

  async getProfile(): Promise<BusinessProfile> {
    try {
      const snap = await getDoc(doc(this.db, 'config', 'business_profile'));
      return snap.exists() ? (snap.data() as BusinessProfile) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  }

  async updateProfile(profile: BusinessProfile) {
    return setDoc(doc(this.db, 'config', 'business_profile'), profile);
  }

  async testConnection(): Promise<boolean> {
    try {
      const q = query(collection(this.db, 'tables'), orderBy('name'));
      await getDocs(q);
      return true;
    } catch (e) {
      console.error("Firestore connection test failed:", e);
      return false;
    }
  }
}

export const db = new FirestoreService();