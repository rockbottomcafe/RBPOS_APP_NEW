
import { MenuItem, Table, Order, BusinessProfile, AppSettings } from '../types';
import { INITIAL_MENU, INITIAL_TABLES, INITIAL_PROFILE, INITIAL_SETTINGS } from '../constants';

class SimplifiedFirestore {
  private listeners: { [key: string]: Array<(data: any) => void> } = {
    menu: [],
    tables: [],
    orders: [],
    settings: []
  };

  constructor() {
    if (!localStorage.getItem('menu_items')) {
      localStorage.setItem('menu_items', JSON.stringify(INITIAL_MENU));
    }
    if (!localStorage.getItem('tables')) {
      localStorage.setItem('tables', JSON.stringify(INITIAL_TABLES));
    }
    if (!localStorage.getItem('profile')) {
      localStorage.setItem('profile', JSON.stringify(INITIAL_PROFILE));
    }
    if (!localStorage.getItem('orders')) {
      localStorage.setItem('orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('app_settings')) {
      localStorage.setItem('app_settings', JSON.stringify(INITIAL_SETTINGS));
    }
  }

  private notify(key: string, data: any) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => cb(data));
    }
  }

  private getData(key: string) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return null;
    }
  }

  private setData(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      const listenerKey = key === 'menu_items' ? 'menu' : (key === 'app_settings' ? 'settings' : key);
      this.notify(listenerKey, data);
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  subscribeToMenu(callback: (items: MenuItem[]) => void) {
    this.listeners.menu.push(callback);
    callback(this.getData('menu_items') || []);
    return () => {
      this.listeners.menu = this.listeners.menu.filter(c => c !== callback);
    };
  }

  subscribeToTables(callback: (tables: Table[]) => void) {
    this.listeners.tables.push(callback);
    callback(this.getData('tables') || []);
    return () => {
      this.listeners.tables = this.listeners.tables.filter(c => c !== callback);
    };
  }

  subscribeToOrders(callback: (orders: Order[]) => void) {
    this.listeners.orders.push(callback);
    callback(this.getData('orders') || []);
    return () => {
      this.listeners.orders = this.listeners.orders.filter(c => c !== callback);
    };
  }

  subscribeToSettings(callback: (settings: AppSettings) => void) {
    this.listeners.settings.push(callback);
    callback(this.getData('app_settings') || INITIAL_SETTINGS);
    return () => {
      this.listeners.settings = this.listeners.settings.filter(c => c !== callback);
    };
  }

  async deleteMenuItem(id: string) {
    const current = this.getData('menu_items') || [];
    const items = current.filter((i: MenuItem) => i.id !== id);
    this.setData('menu_items', items);
  }

  async updateMenu(items: MenuItem[]) {
    this.setData('menu_items', items);
  }

  async setTables(tables: Table[]) {
    this.setData('tables', tables);
  }

  async createOrder(order: Order) {
    const orders = this.getData('orders') || [];
    const newOrder = { ...order, createdAt: order.createdAt || Date.now() };
    orders.unshift(newOrder);
    this.setData('orders', orders);
  }

  async updateTable(id: string, updates: Partial<Table>) {
    const tables = this.getData('tables') || [];
    const idx = tables.findIndex((t: Table) => t.id === id);
    if (idx !== -1) {
      tables[idx] = { ...tables[idx], ...updates };
      this.setData('tables', tables);
    }
  }

  async getProfile(): Promise<BusinessProfile> {
    return this.getData('profile') || INITIAL_PROFILE;
  }

  async updateProfile(p: BusinessProfile) {
    this.setData('profile', p);
  }

  async getSettings(): Promise<AppSettings> {
    return this.getData('app_settings') || INITIAL_SETTINGS;
  }

  async updateSettings(s: AppSettings) {
    this.setData('app_settings', s);
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
}

export const db = new SimplifiedFirestore();
