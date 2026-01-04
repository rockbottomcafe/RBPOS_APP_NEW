
import { MenuItem, Table, BusinessProfile, AppSettings } from './types.ts';

export const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'Veggie Wrap', category: 'San', price: 149, foodType: 'veg' },
  { id: '2', name: 'Mexican Elote (Cheese Corn Balls)', category: 'STARTERS', price: 199, foodType: 'veg' },
  { id: '3', name: 'Arancini balls', category: 'STARTERS', price: 249, foodType: 'veg' },
  { id: '4', name: 'One Pan Garlic mushroom', category: 'STARTERS', price: 199, foodType: 'veg' },
  { id: '5', name: 'One Pan Garlic chicken', category: 'STARTERS', price: 299, foodType: 'non-veg' },
  { id: '6', name: 'Honey Chili potato', category: 'STARTERS', price: 309, foodType: 'veg' },
  { id: '7', name: 'Melting paneer', category: 'STARTERS', price: 249, foodType: 'veg' },
  { id: '8', name: 'Malaysian mango chicken', category: 'STARTERS', price: 339, foodType: 'non-veg' },
  { id: '9', name: 'Potato Wedges', category: 'STARTERS', price: 129, foodType: 'veg' },
  { id: '10', name: 'Cajun Potato Veggies', category: 'STARTERS', price: 149, foodType: 'veg' },
  { id: '11', name: 'Paneer Popcorn', category: 'STARTERS', price: 269, foodType: 'veg' },
  { id: '12', name: 'Chicken Popcorn', category: 'STARTERS', price: 220, foodType: 'non-veg' },
  { id: '13', name: 'Lemon Garlic chicken', category: 'STARTERS', price: 310, foodType: 'non-veg' },
  { id: '14', name: 'Chicken Florentine', category: 'STARTERS', price: 349, foodType: 'non-veg' },
  { id: '15', name: 'Chicken Demi-Glace', category: 'STARTERS', price: 310, foodType: 'non-veg' },
  { id: '16', name: 'Paneer Chimichurri', category: 'STARTERS', price: 249, foodType: 'veg' },
  { id: '17', name: 'Chicken Chimichurri', category: 'STARTERS', price: 269, foodType: 'non-veg' },
  { id: '18', name: 'Chicken Nuggets', category: 'STARTERS', price: 149, foodType: 'non-veg' },
  { id: '19', name: 'Punjabi Tadka Maggi', category: 'MAGGI', price: 139, foodType: 'veg' },
  { id: '20', name: 'Veggie-Soupy Maggi', category: 'MAGGI', price: 119, foodType: 'veg' },
  { id: '21', name: 'Cheese Corn Maggi', category: 'MAGGI', price: 119, foodType: 'veg' },
  { id: '22', name: 'Chicken Maggi', category: 'MAGGI', price: 149, foodType: 'non-veg' },
  { id: '23', name: 'Double Masala Maggi', category: 'MAGGI', price: 99, foodType: 'veg' },
  { id: '24', name: 'Schezwan Maggi', category: 'MAGGI', price: 110, foodType: 'veg' },
  { id: '25', name: 'Paneer Schezwan Maggi', category: 'MAGGI', price: 129, foodType: 'veg' },
];

export const INITIAL_TABLES: Table[] = [
  { id: 't1', name: 'T1', status: 'vacant', section: 'Main Floor' },
  { id: 't2', name: 'T2', status: 'vacant', section: 'Main Floor' },
  { id: 't3', name: 'T3', status: 'vacant', section: 'Main Floor' },
  { id: 't4', name: 'T4', status: 'vacant', section: 'Main Floor' },
  { id: 't5', name: 'T5', status: 'vacant', section: 'Terrace' },
  { id: 't6', name: 'T6', status: 'vacant', section: 'Terrace' },
  { id: 't7', name: 'T7', status: 'vacant', section: 'Terrace' },
  { id: 't8', name: 'T8', status: 'vacant', section: 'Terrace' },
  { id: 'c1', name: 'C1', status: 'vacant', section: 'Lounge' },
  { id: 'c2', name: 'C2', status: 'vacant', section: 'Lounge' },
];

export const INITIAL_PROFILE: BusinessProfile = {
  ownerName: 'Cafe Rock Bottom',
  ownerNumber: '+91 98765 43210',
  fssai: '12345678901234',
  address: '41, Mangalmurti Sq, Jaitala Road, Nagpur-440022'
};

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'Rock Bottom',
  showLogoOnBill: true,
  showAddressOnBill: true,
  invoiceHeader: 'Cafe Rock Bottom',
  invoiceFooter: 'Visit Again! Follow us @caferockbottom',
  gstEnabled: false,
  gstPercentage: 5
};
