# Aviation Inventory Management System - Complete Documentation

## 📋 Project Overview

**Goal:** Replace AirData with a modern web-based aviation inventory management system
**Database:** MySQL with comprehensive aviation-specific features
**Current Status:** Database structure complete, web application in development

---

## 🗄️ Database Structure & Current State

### Core Tables

#### **customers_vendors** (Combined entity table)

- **Purpose:** Single table for both customers and vendors (entities can be both)
- **Key Fields:** cv_id, business_name, address fields, is_vendor, is_customer, certification
- **Current Records:** 9 sample companies including Asia Pacific Airlines, OnlineMetal.com, etc.
- **Aviation Features:** FAA/EASA certification tracking

#### **aircraft_parts** (Master parts catalog)

- **Purpose:** Central catalog of all aviation parts
- **Key Fields:** part_id, part_number (unique), description, manufacturer, aircraft_model, category, unit_price
- **Current Records:** 31 sample parts including blades, valve assemblies, aluminum sheets, hardware
- **Aviation Features:** Part types (C/R/S), aircraft compatibility, shelf life tracking

#### **inventory** (Part-level summaries)

- **Purpose:** High-level quantity tracking per part
- **Key Fields:** part_id, total_quantity, quantity_reserved, reorder_point
- **Auto-maintained:** Triggers update totals when inventory_items change

#### **inventory_items** (Individual item tracking)

- **Purpose:** Serial number level tracking with full traceability
- **Key Fields:** item_id, part_id, serial_number, condition_code, bin_location, owner_id
- **Condition Codes:** NS, RP, AR, OH, SV, NE (New Serviceable, Repairable, As Removed, etc.)
- **Current Records:** 9 sample items in various locations

### Document Management Tables

#### **Purchase Order System**

- **purchase_orders:** PO headers with vendor, dates, status, totals
- **purchase_order_items:** Line items with part details, quantities, pricing
- **Current Records:** 6 sample POs from various vendors

#### **Quote System**

- **rfqs & rfq_items:** Request for Quote workflow
- **vendor_quotes & quote_items:** Vendor responses to RFQs
- **customer_quotes & customer_quote_items:** Sales quotes to customers

#### **Invoice System**

- **vendor_invoices & vendor_invoice_items:** Supplier billing
- **customer_invoices & customer_invoice_items:** Customer billing

#### **Repair Orders**

- **repair_orders & repair_order_items:** Maintenance/repair tracking
- **Current Records:** 2 sample repair orders

#### **stock_movements** (Audit Trail)

- **Purpose:** Complete transaction log for regulatory compliance
- **Tracks:** Every inventory movement (RECEIVE, ISSUE, TRANSFER, etc.)
- **Aviation Compliance:** Required for FAA traceability

### Smart Features

#### **Automated Triggers**

- Auto-update inventory totals when items added/removed
- Auto-create inventory records for new parts
- Auto-calculate PO/invoice totals
- Auto-create stock movement records

#### **Useful Views**

- `v_current_inventory`: Real-time stock levels with reorder alerts
- `v_inventory_items`: Detailed item view with expiry status
- `v_purchase_orders`: PO details with vendor information
- `v_outstanding_po_items`: Items pending delivery

---

## 🎯 Your Current Plan & Requirements

### **Immediate Goals**

1. **Replace AirData completely** - Build web app with all current functionality
2. **Modern Interface** - Clean, intuitive design superior to legacy system
3. **Real-time Data** - Live updates, no refresh required
4. **Mobile Responsive** - Work on tablets/phones in warehouse

### **Core Functionality Needed** (Based on AirData screenshots)

#### **Browse & Search**

- ✅ Vendor Quotes/RFQs with filtering
- ✅ Purchase Orders with status tracking
- ✅ Repair Orders with customer details
- ✅ Invoices (both vendor and customer)
- ✅ Inventory with location/condition filtering
- ✅ Customer/Vendor management

#### **Detail Views**

- ✅ Quote details with line items and totals
- ✅ PO details with item tracking and receiving
- ✅ Repair order details with part conditions
- ✅ Invoice details with payment tracking
- ✅ Inventory item details with history

#### **Aviation-Specific Features**

- ✅ Serial number tracking throughout lifecycle
- ✅ Condition code management (NS, RP, AR, OH, SV, NE)
- ✅ Bin location tracking
- ✅ Owner/consignment inventory
- ✅ Tag dates and overhaul shop tracking
- ✅ Expiry date management for time-limited parts
- ✅ FAA compliance audit trails

### **Advanced Features Planned**

- **Workflow Management:** Quote → PO → Receipt → Invoice flow
- **Automated Alerts:** Low stock, expiring parts, overdue POs
- **Reporting:** Inventory valuation, sales reports, compliance reports
- **Barcode Integration:** Quick scanning for receiving/issuing
- **Document Generation:** POs, quotes, invoices as PDFs
- **API Integration:** Connect with suppliers for real-time pricing

---

## 🚀 Development Progress

### **Completed**

- ✅ Complete database schema with all tables
- ✅ Sample data matching your AirData system
- ✅ Foreign key relationships and constraints
- ✅ Automated triggers for data consistency
- ✅ Useful views for common queries
- ✅ Basic web application framework started

### **In Progress**

- 🔄 Web application user interface
- 🔄 Database connection and API layer
- 🔄 CRUD operations for all entities

### **Next Steps**

1. **Complete Basic CRUD** - Add/Edit/Delete for all major entities
2. **Search & Filtering** - Powerful search across all modules
3. **Workflow Implementation** - Quote-to-PO-to-Invoice processes
4. **Reporting Dashboard** - Key metrics and alerts
5. **Mobile Optimization** - Warehouse-friendly mobile interface

---

## 🔧 Technical Architecture

### **Database Layer**

- **Engine:** MySQL 8.0+
- **Schema:** `aviation_inventory` (or your current `genparts`)
- **Backup Strategy:** Daily automated backups
- **Performance:** Indexed for fast searches on part numbers, serial numbers

### **Application Layer** (Planned)

- **Backend:** Node.js + Express (or Python + Flask/Django)
- **Database ORM:** Sequelize (Node.js) or SQLAlchemy (Python)
- **API:** RESTful API for all operations
- **Authentication:** Role-based access control

### **Frontend Layer**

- **Framework:** Modern HTML5/CSS3/JavaScript (possibly React later)
- **Design:** Responsive, mobile-first approach
- **UX:** Clean, intuitive interface inspired by modern inventory systems

---

## 📊 Current Data Summary

### **Sample Data Loaded**

- **Vendors/Customers:** 9 companies including Asia Pacific Airlines, OnlineMetal.com
- **Parts Catalog:** 31 aviation parts (blades, valves, sheets, hardware)
- **Purchase Orders:** 6 POs with various statuses
- **Inventory Items:** 9 items with serial numbers and locations
- **Quotes:** 2 RFQs and 2 vendor quotes
- **Customer Sales:** 2 customer quotes and invoices

### **Key Metrics** (Current Sample Data)

- Total Parts in Catalog: 31
- Total Inventory Items: 9
- Active Purchase Orders: 6
- Registered Vendors: 7
- Registered Customers: 3

---

## 🎯 Success Criteria

### **Phase 1: Basic Replacement**

- [ ] All AirData browse screens replicated
- [ ] All detail views functional
- [ ] Basic add/edit/delete operations
- [ ] Search and filtering working

### **Phase 2: Enhanced Features**

- [ ] Automated workflows (Quote→PO→Receipt)
- [ ] Real-time inventory updates
- [ ] Mobile-optimized interface
- [ ] Basic reporting dashboard

### **Phase 3: Advanced Features**

- [ ] Barcode scanning integration
- [ ] Advanced analytics and reporting
- [ ] API integrations with suppliers
- [ ] Document generation (PDF quotes/POs)

---

## 💭 Notes & Considerations

### **Data Migration**

- Plan needed to migrate existing AirData to new system
- May need data cleaning/normalization during migration
- Consider running parallel systems during transition

### **User Training**

- Current AirData users will need training on new interface
- Should maintain similar workflows to minimize disruption
- Consider creating user documentation/videos

### **Compliance**

- System must maintain FAA traceability requirements
- Audit trail must be comprehensive and tamper-proof
- Regular backups essential for compliance

### **Performance**

- Database should handle 100k+ parts and millions of transactions
- Search must be fast (<2 seconds for any query)
- Interface should load quickly on warehouse computers/tablets

---

## 📞 Questions for You

1. **Timeline:** What's your target date for replacing AirData?
2. **Users:** How many people will use the system simultaneously?
3. **Data Volume:** Approximate number of parts/transactions in current AirData?
4. **Integration:** Any other systems that need to connect to this?
5. **Hardware:** What devices will be used (computers, tablets, scanners)?
6. **Backup Current System:** Do you have AirData export capability for migration?

---

_Last Updated: July 15, 2025_
_Status: Database Complete, Web App In Development_
