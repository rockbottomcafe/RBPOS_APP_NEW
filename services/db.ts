import { MenuItem, Table, Order, BusinessProfile, AppSettings } from '../types.ts';
import { INITIAL_MENU, INITIAL_TABLES, INITIAL_PROFILE, INITIAL_SETTINGS } from '../constants.tsx';

/**
 * FirestoreService handles data persistence.
 * Note: Collections are created automatically in Firestore on the first write.
 */
class FirestoreService {
  private getData<T>(key: string, initial: T): T {
    const data = localStorage.getItem(key);
    try {
      return data ? JSON.parse(data) : initial;
    } catch (error) {
      console.error(`Error parsing LocalStorage key "${key}":`, error);
      return initial;
    }
  }

  private setData(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('db-update', { detail: { key } }));
  }

  constructor() {
    this.seedInitialData();
  }

  private async seedInitialData() {
    if (!localStorage.getItem('menu_items')) this.setData('menu_items', INITIAL_MENU);
    if (!localStorage.getItem('tables')) this.setData('tables', INITIAL_TABLES);
    if (!localStorage.getItem('business_profile')) this.setData('business_profile', INITIAL_PROFILE);
    if (!localStorage.getItem('app_settings')) this.setData('app_settings', INITIAL_SETTINGS);
    if (!localStorage.getItem('orders')) this.setData('orders', []);
  }

  async testConnection(): Promise<boolean> {
    return true; // LocalStorage is always available
  }

  subscribeToMenu(callback: (items: MenuItem[]) => void) {
    const handler = (event: any) => {
      if (!event.detail || event.detail.key === 'menu_items') {
        callback(this.getData('menu_items', INITIAL_MENU));
      }
    };
    window.addEventListener('db-update' as any, handler);
    callback(this.getData('menu_items', INITIAL_MENU));
    return () => window.removeEventListener('db-update' as any, handler);
  }

  async updateMenu(items: MenuItem[]) {
    this.setData('menu_items', items);
  }

  subscribeToTables(callback: (tables: Table[]) => void) {
    const handler = (event: any) => {
      if (!event.detail || event.detail.key === 'tables') {
        callback(this.getData('tables', INITIAL_TABLES));
      }
    };
    window.addEventListener('db-update' as any, handler);
    callback(this.getData('tables', INITIAL_TABLES));
    return () => window.removeEventListener('db-update' as any, handler);
  }

  async setTables(tables: Table[]) {
    this.setData('tables', tables);
  }

  async updateTable(id: string, updates: Partial<Table>) {
    const tables = this.getData<Table[]>('tables', INITIAL_TABLES);
    const updated = tables.map(t => t.id === id ? { ...t, ...updates } : t);
    this.setData('tables', updated);
  }

  subscribeToOrders(callback: (orders: Order[]) => void) {
    const handler = (event: any) => {
      if (!event.detail || event.detail.key === 'orders') {
        callback(this.getData('orders', []));
      }
    };
    window.addEventListener('db-update' as any, handler);
    callback(this.getData('orders', []));
    return () => window.removeEventListener('db-update' as any, handler);
  }

  async createOrder(order: Order) {
    const orders = this.getData<Order[]>('orders', []);
    const docId = order.id.startsWith('ORD_') ? order.id : `ORD_${order.id.replace('#', '')}`;
    const filtered = orders.filter(o => o.id !== order.id && o.id !== docId);
    this.setData('orders', [{ ...order, id: docId }, ...filtered]);
  }

  subscribeToSettings(callback: (settings: AppSettings) => void) {
    const handler = (event: any) => {
      if (!event.detail || event.detail.key === 'app_settings') {
        callback(this.getData('app_settings', INITIAL_SETTINGS));
      }
    };
    window.addEventListener('db-update' as any, handler);
    callback(this.getData('app_settings', INITIAL_SETTINGS));
    return () => window.removeEventListener('db-update' as any, handler);
  }

  async updateSettings(settings: AppSettings) {
    this.setData('app_settings', settings);
  }

  async getProfile(): Promise<BusinessProfile | null> {
    return this.getData('business_profile', INITIAL_PROFILE);
  }

  async updateProfile(profile: BusinessProfile) {
    this.setData('business_profile', profile);
  }
}

export const db = new FirestoreService();