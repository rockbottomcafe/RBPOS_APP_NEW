
import { MenuItem, Table, Order, BusinessProfile, AppSettings } from '../types';
import { INITIAL_MENU, INITIAL_TABLES, INITIAL_PROFILE, INITIAL_SETTINGS } from '../constants';

class MockDatabase {
  private getData<T>(key: string, initial: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initial;
  }

  private setData(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Business Profile
  getProfile(): BusinessProfile { return this.getData('profile', INITIAL_PROFILE); }
  updateProfile(p: BusinessProfile) { this.setData('profile', p); }

  // Settings
  getSettings(): AppSettings { return this.getData('settings', INITIAL_SETTINGS); }
  updateSettings(s: AppSettings) { this.setData('settings', s); }

  // Menu Items
  getMenuItems(): MenuItem[] { return this.getData('menu', INITIAL_MENU); }
  setMenuItems(m: MenuItem[]) { this.setData('menu', m); }

  // Tables
  getTables(): Table[] { return this.getData('tables', INITIAL_TABLES); }
  setTables(t: Table[]) { this.setData('tables', t); }

  // Orders
  getOrders(): Order[] { return this.getData('orders', []); }
  setOrders(o: Order[]) { this.setData('orders', o); }

  createOrder(order: Order) {
    const orders = this.getOrders();
    orders.unshift(order);
    this.setOrders(orders);
  }

  updateOrder(updated: Order) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === updated.id);
    if (idx !== -1) {
      orders[idx] = updated;
      this.setOrders(orders);
    }
  }
}

export const db = new MockDatabase();
