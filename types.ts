
export type FoodType = 'veg' | 'non-veg';
export type TableStatus = 'vacant' | 'occupied' | 'billed';
export type OrderStatus = 'pending' | 'billed' | 'paid';
export type PaymentMethod = 'UPI' | 'Cash' | 'Card' | 'Split' | '-';
export type ThemeType = 'Rock Bottom' | 'Midnight' | 'Eco-Green' | 'Modern Minimalist';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  foodType: FoodType;
}

export interface Table {
  id: string;
  name: string;
  status: TableStatus;
  section: string;
  currentOrderId?: string;
  orderValue?: number;
  sessionStartTime?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: number;
  cashAmount?: number;
  upiAmount?: number;
}

export interface BusinessProfile {
  ownerName: string;
  ownerNumber: string;
  fssai: string;
  address: string;
}

export interface AppSettings {
  theme: ThemeType;
  logoUrl?: string;
  showLogoOnBill: boolean;
  showAddressOnBill: boolean;
  invoiceHeader: string;
  invoiceFooter: string;
  gstEnabled: boolean;
  gstPercentage: number;
}
