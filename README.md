# JelantahGO - Used Cooking Oil Management System

JelantahGO is a comprehensive, web-based application designed to streamline the collection and management of used cooking oil (jelantah). It serves as a central platform for various stakeholders, including administrators, customers (restaurants, caterers), couriers, and warehouse staff.

The system provides role-based dashboards to ensure that each user has access to the tools and information they need to perform their tasks efficiently.

## Key Features

- **Role-Based Access Control:** Dedicated dashboards and functionalities for Admins, Customers, Couriers, and Warehouse personnel.
- **Order Management:** Customers can request pickups, couriers can manage their assignments, and admins can oversee the entire process from creation to completion.
- **Customer Management:** Admins can manage customer data, view collection history, and track referral networks.
- **Automated Billing:** The system automatically calculates payments for customers, fees for couriers, and commissions for affiliates based on collected oil volume and predefined price tiers.
- **Real-time Status Tracking:** All users can track the status of pickup orders as they move from 'Pending' to 'Paid'.
- **System Configuration:** Admins can easily adjust pricing tiers and other system settings through a dedicated settings panel.

## User Roles

### 1. Admin
The central administrator with full control over the system.
- **Quick Pick Up:** Rapidly create new orders for existing or new customers.
- **Order Management:** View all orders, assign couriers, and verify completed pickups.
- **Customer Management:** View, edit, and manage all customer information.
- **Billing:** Oversee all financial transactions, calculate fees, and upload proof of payment.
- **Settings:** Configure application parameters like pricing and notifications.
- **User Management:** Add, edit, and remove system users (admins, couriers, warehouse staff).

### 2. Customer
Users who provide the used cooking oil (e.g., restaurants, households).
- **Request Pickup:** Easily submit a new request for oil collection.
- **Order History:** View the status and history of all their pickup requests.
- **Profile Management:** Update their contact and payment information.
- **Referral Tracking:** View their network of referred customers (downline).

### 3. Courier
The personnel responsible for collecting the oil from customers.
- **Order Claiming:** View available orders and claim them for pickup.
- **Status Updates:** Update the status of their assigned orders (e.g., 'In Progress', 'Completed').
- **Proof of Pickup:** Upload photos as proof of collection and input the actual volume of oil collected.
- **Earnings Dashboard:** Track their total earnings, completed pickups, and volume collected.

### 4. Warehouse
The staff responsible for verifying the collected oil before it enters the billing cycle.
- **Pickup Verification:** Review details and proof of pickup submitted by couriers.
- **Approve for Billing:** Verify and approve completed orders to move them to the billing stage.
- **History:** View a history of all verified orders.

This repository contains the complete frontend source code for the JelantahGO application, built with React and TypeScript.