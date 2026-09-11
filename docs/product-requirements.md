# DEBFORD — Product Requirements Document

> **DEBFORD — A complete digital ecosystem for the vehicle lifecycle.**

---

## 1. Product Vision

Debford is a production-grade automotive technology platform combining:

- Vehicle marketplace (buy/sell)
- Vehicle dealership management
- Vehicle rentals
- Commercial vehicle auctions and bidding
- Automotive services marketplace
- Spare parts marketplace
- Vehicle customization & upgrades
- Vehicle ownership management (Garage)
- Messaging
- Reviews & ratings
- Verification
- Payments
- Notifications
- Administration
- Future AI-powered automotive assistance

### Lifecycle Journey

```
Discover → Compare → Buy → Rent → Bid → Auction → Own → Maintain → Repair → Upgrade → Sell → Repeat
```

---

## 2. Core User Types

### CUSTOMER
- Browse, search, save, compare vehicles
- Contact sellers / dealers
- Buy and rent vehicles
- Participate in eligible commercial auctions
- Request and book automotive services
- Purchase parts and accessories
- Manage personal garage
- View service history
- Book maintenance and reminders
- Review service providers
- Manage membership and transactions

### PRIVATE SELLER
- Create profile
- Add and list vehicles
- Upload images
- Manage listings
- Receive and respond to inquiries and offers
- Manage sale transactions

### DEALER
- Create and manage dealership organization
- Add employees / team members
- Manage vehicle inventory
- Publish and manage listings
- Handle inquiries, offers, and sales
- View dealership analytics
- Participate in approved marketplace/auction workflows

### RENTAL PROVIDER
- Create rental listings
- Set pricing and availability
- Manage bookings (approve/reject)
- Manage vehicle availability
- Maintain rental records

### SERVICE PROFESSIONAL
Types: Mechanic, Auto Electrician, Diagnostic Specialist, Painter, Bodywork Specialist, Tire Specialist, Detailer, Customization Specialist, Performance Specialist, Parts Seller

Capabilities:
- Create professional profile
- List services and pricing
- Define service areas
- Receive and respond to requests
- Send and manage quotes
- Manage bookings and customers
- Receive and respond to reviews

### AUCTION OPERATOR
- Create and manage auction events
- Add and configure auction vehicles
- Define auction rules and eligibility
- Manage participant registration
- Monitor live bidding
- Close auctions and manage results
- Manage settlement

### ADMIN
Full platform management including:
- Users, organizations, dealers
- Vehicles, listings, sales
- Rentals, auctions, services, parts
- Memberships, payments
- Reviews, verification
- Categories, platform configuration
- Analytics and reports
- Notifications

---

## 3. Vehicle Ecosystem

### Vehicle Types
- CAR
- MOTORCYCLE
- TRUCK

### Car Categories
SUV, Crossover, Sedan, Coupe, Convertible, Hatchback, Wagon, Sports Car, Muscle Car, Luxury, Supercar, Hypercar, Off-Road, Classic/Vintage, Electric, Hybrid

### Motorcycle Categories
Sport Bike, Cruiser, Touring, Adventure, Naked/Street, Dirt Bike, Motocross, Dual Sport, Scooter, Cafe Racer, Electric Motorcycle, Classic/Vintage

### Truck Categories
Pickup, Light Duty, Medium Duty, Heavy Duty, Semi Truck, Tractor Unit, Box Truck, Dump Truck, Flatbed, Tow Truck, Tanker, Utility Truck, Off-Road Truck

> Categories are stored in the database and managed by administrators.

---

## 4. Marketplace Requirements

### Vehicle Discovery
Filters: type, category, make, model, variant, year, price, mileage, location, fuel, transmission, condition, engine, body type, features, seller type, availability

Support: search, sort, filters, saved searches, favorites, compare

### Vehicle Detail Page
- Image gallery (premium quality)
- Vehicle title, price, type, category
- Make, model, year, mileage, transmission, fuel, engine
- Location, seller/dealer info, verification status
- Features and specifications
- Description, contact CTA
- Favorite, compare, share actions
- Buy / Inquire / Rent / Bid (context-sensitive)

Priority order: **Vehicle → Trust → Key Specs → Price → CTA**

---

## 5. Transaction Systems

### Purchase Workflow
Browse → Vehicle Detail → Purchase/Inquiry → Order → Payment → Verification → Completion → Ownership Record

### Rental Workflow
Select → Date → Availability Check → Price Calculation → Book → Payment → Pickup → Inspection → Rental → Return → Inspection → Complete

### Auction Workflow
Registration → Eligibility Check → Live Auction → Bid → Highest Bid → Close → Winner → Settlement

### Service Workflow
Request → Multi-Provider Quotes → Customer Selection → Booking → Service Delivery → Completion → Review

---

## 6. Core Screens / Navigation

```
HOME
VEHICLES          → /vehicles, /vehicles/cars, /vehicles/bikes, /vehicles/trucks
RENTALS           → /rentals
AUCTIONS          → /auctions
SERVICES          → /services
PARTS             → /parts
MEMBERSHIP        → /membership
SELL              → /sell
GARAGE            → /garage
MESSAGES          → /messages
ACCOUNT           → /account
DASHBOARD         → /dashboard (seller/dealer/provider/operator)
ADMIN             → /admin
```

---

## 7. Quality Standards

Every feature must satisfy:
- [ ] Functional correctness
- [ ] Correct data persistence
- [ ] Security enforcement
- [ ] Mobile + desktop UX
- [ ] Error / loading / empty states
- [ ] Reasonable performance
- [ ] Accessibility compliance
- [ ] Documentation

---

## 8. Non-Functional Requirements

| Concern | Requirement |
|---|---|
| Security | RLS enforced at DB, never trust frontend alone |
| Performance | Pagination, lazy loading, optimized images |
| Scalability | DB indexes, connection pooling, stateless APIs |
| Accessibility | WCAG 2.1 AA, semantic HTML, keyboard nav |
| SEO | Metadata, OG tags, human-readable URLs |
| Observability | Error logging, audit logs, monitoring hooks |
| Mobile-first | 360px / 768px / 1024px / 1440px breakpoints |

---

## 9. Out of Scope (Initial MVP)

- AI automotive assistant (Phase 9)
- Advanced recommendation engine (Phase 9)
- Native mobile app (future)
- Multi-currency support (future)
- Multi-language / i18n (future)
- Insurance integrations (future)
- Third-party financing (future)

---

_Last updated: 2026-09-09_
_Status: Architecture Phase 0_
