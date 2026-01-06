
# System Logic Analysis & Reverse-Engineering: Rock Bottom Cafe POS

## 1. Executive System Overview
The "Rock Bottom Cafe" POS is a centralized restaurant management system designed for speed, accuracy, and real-time operational visibility. It transitions traditional cafe operations into a digital workflow where table status, order tracking, and financial reporting are synchronized across a cloud-based database (Firestore).

## 2. Deployment & Connection Guide

### Fixing "Permission Denied" (Security Rules)
If you see a `permission-denied` error, your Firestore database is locked. Follow these steps:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Go to **Firestore Database** > **Rules** tab.
4. Replace the existing rules with the following (Development Mode):
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
5. Click **Publish**.

### Connecting your App
Update the `firebaseConfig` object in `services/db.ts` with the keys found in **Project Settings > General > Your Apps**.

## 3. Master Firestore Schema (Extraction for DB Setup)

### Collection: `menu_items` (Auto-ID Documents)
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Primary Key |
| `name` | `string` | Item Name |
| `category` | `string` | Category (Uppercase) |
| `price` | `number` | Unit Price |
| `foodType` | `string` | "veg" or "non-veg" |

### Collection: `tables` (Manual ID Documents, e.g., "t1", "t2")
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID |
| `name` | `string` | Display Name |
| `status` | `string` | "vacant", "occupied", "billed" |
| `section` | `string` | "Main Floor", "Terrace", etc. |

### Collection: `config` (Standalone Singleton Documents)
This collection uses fixed Document IDs so the app can fetch them directly.

**Document ID: `business_profile`**
| Field Name | Type | Sample Value |
| :--- | :--- | :--- |
| `ownerName` | `string` | "Cafe Rock Bottom" |
| `ownerNumber` | `string` | "+91 98765 43210" |
| `fssai` | `string` | "12345678901234" |
| `address` | `string` | "41, Mangalmurti Sq, Nagpur" |

**Document ID: `app_settings`**
| Field Name | Type | Sample Value |
| :--- | :--- | :--- |
| `theme` | `string` | "Rock Bottom" |
| `showLogoOnBill` | `boolean` | `true` |
| `bodyFontSize` | `number` | `12` |
| `headerLines` | `array` | `[{ "id": "h1", "text": "CAFE", "size": 16, "bold": true, "align": "center" }]` |
| `footerLines` | `array` | `[{ "id": "f1", "text": "Visit Again!", "size": 10, "bold": false, "align": "center" }]` |

### Collection: `orders` (Auto-ID Documents)
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Custom ID (e.g. "ORD_1234") |
| `tableId` | `string` | Ref to tables |
| `status` | `string` | "pending", "billed", "paid" |
| `total` | `number` | Final Amount |
| `items` | `array` | List of items |
