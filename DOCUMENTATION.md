
# System Logic Analysis & Reverse-Engineering: Rock Bottom Cafe POS

## 1. Executive System Overview
The "Rock Bottom Cafe" POS is a centralized restaurant management system designed for speed, accuracy, and real-time operational visibility. It transitions traditional cafe operations into a digital workflow where table status, order tracking, and financial reporting are synchronized across a cloud-based database (Firestore).

## 2. Module-by-Module Logic Breakdown

### Dashboard (Analytics Hub)
- **Purpose**: Real-time business health monitoring.
- **Logic**: Aggregates `orders` collection data to calculate sums of `totalAmount` filtered by `paymentMethod` and `status == 'paid'`.
- **Dependencies**: Order History, Payment Module.

### Dine In (Floor Plan)
- **Purpose**: Interactive table management and ordering.
- **Logic**: Renders `tables` collection. Each table card state is derived from its current `orderId`. Transition logic: Vacant (Green) -> Occupied (Red, Order Attached) -> Billed (Yellow, Invoice Generated) -> Paid (Back to Vacant).
- **Dependencies**: Table Setup, Menu Items.

### Menu Management
- **Purpose**: CRUD for catalog items.
- **Logic**: Direct interface to `menu_items` collection. Includes "Bulk Upload" (CSV/JSON parsing) and "Export" functionality.
- **Dependencies**: None.

### Order History
- **Purpose**: Audit trail and post-order actions.
- **Logic**: paginated/filtered read from `orders` collection. Supports "Reprint" and "Void" operations.
- **Dependencies**: Dine In.

## 3. UI Element → Logic Mapping (Sample)

| UI Element | Screen | Action | Frontend Logic | Backend Logic (Firestore/Functions) |
| :--- | :--- | :--- | :--- | :--- |
| **Table Card** | Dine In | Click | Open Order Modal | Fetch active order if status != 'vacant' |
| **Add Item** | Menu Mgmt | Submit | Validate inputs | `setDoc` to `menu_items` |
| **Pay Button** | Order Modal | Click | Trigger Payment Flow | Transaction: Update Order Status + Free Table |
| **EOD Report** | Reports | Click | Aggregate daily totals | Cloud Function: Generate summary snapshot |

## 4. Data Models (Firestore Schemas)

### `business_profile` (Document: `cafe_settings`)
```json
{
  "ownerName": "string",
  "contact": "string",
  "fssai": "string",
  "address": "string",
  "settings": {
    "theme": "rock-bottom | midnight | eco | modern",
    "taxRate": 0.05,
    "invoiceHeader": "string"
  }
}
```

### `menu_items` (Collection)
```json
{
  "id": "string",
  "name": "string",
  "category": "string",
  "price": "number",
  "foodType": "veg | non-veg"
}
```

### `tables` (Collection)
```json
{
  "id": "string",
  "name": "string",
  "status": "vacant | occupied | billed",
  "currentOrderId": "string | null",
  "orderValue": "number"
}
```

### `orders` (Collection)
```json
{
  "id": "string",
  "tableId": "string",
  "tableName": "string",
  "items": [{ "id": "id", "qty": 1, "price": 100 }],
  "subtotal": "number",
  "tax": "number",
  "discount": "number",
  "total": "number",
  "status": "pending | billed | paid",
  "paymentMethod": "UPI | Cash | Card | Split",
  "createdAt": "timestamp"
}
```

## 5. End-to-End Workflow: New Order Creation
1. **Trigger**: User clicks a "Vacant" table in **Dine In**.
2. **Action**: `TableModal` opens. User selects items from a list populated by `menu_items`.
3. **Data Mutation**: On "Punch Order", a new document is created in `orders` and the `tables` document is updated with `status: 'occupied'` and the `orderId`.
4. **Outcome**: Table turns Red on the floor plan.

## 6. Serverless Re-Architecture Plan
- **Frontend**: React + Tailwind (Netlify).
- **Database**: Firestore with Real-time Listeners for Floor Plan.
- **Logic**: Clients handle UI state; Cloud Functions used for EOD PDF generation and secure payment webhooks.
- **Auth**: Firebase Auth with "Manager" and "Staff" custom claims.
