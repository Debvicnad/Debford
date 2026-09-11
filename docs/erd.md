# DEBFORD — Entity Relationship Diagram

---

## Core Domain Relationships

```
auth.users
    │ (1:1)
    ▼
profiles ──────────────────────────────────────────────────────────────────────┐
    │                                                                          │
    │ (1:many)                                                                 │
    ▼                                                                          │
organizations                                                                  │
    │                                                                          │
    │ (1:many via organization_members)                                        │
    ▼                                                                          │
organization_members ◄── profiles                                              │
    │                                                                          │
    └──────────────────────────────────────────────────────────────────────────┘
```

---

## Vehicle Domain

```
vehicle_types (car/motorcycle/truck)
    │
    │ (1:many)
    ▼
vehicle_categories
    │
    ├────────────────────────────────┐
    │                               │
    ▼                               ▼
vehicle_makes                   vehicles ◄─── profiles (owner_id)
    │                               │         organizations (org_id)
    │ (1:many)                      │
    ▼                               ├── vehicle_images
vehicle_models                      ├── vehicle_features
    │                               ├── vehicle_documents
    │ (1:many)                      ├── vehicle_history
    ▼                               └── vehicle_history
vehicle_variants
    │
    └──────────────────────────────► vehicles (variant_id)
```

---

## Marketplace Domain

```
vehicles
    │
    ├──────────────────────────────────────────────────────────────────────────┐
    │ (1:many)                                                                 │
    ▼                                                                         │
sale_listings ◄─── profiles (seller_id)                                       │
    │              organizations (org_id)                                      │
    │                                                                          │
    ├── listing_favorites ◄─── profiles (profile_id)                          │
    ├── listing_inquiries ◄─── profiles (buyer_id)                            │
    └── offers ◄─────────────── profiles (buyer_id, seller_id)               │
                                                                               │
vehicles                                                                       │
    │ (1:many)                                                                 │
    ▼                                                                         │
rental_listings ◄─── profiles (provider_id)                                   │
    │                organizations (org_id)                                    │
    │                                                                          │
    └── rental_bookings ◄─── profiles (renter_id)                            │
            │                                                                  │
            ├── rental_contracts                                               │
            └── rental_inspections                                             │
                                                                               │
vehicles (back to top level)                                                   │
    │ (1:many)                                                                 │
    ▼                                                                         │
auction_items ◄─── auctions ◄─── profiles (operator_id)                      │
    │               │              organizations                               │
    │               └── auction_participants ◄─── profiles                    │
    │                                                                          │
    └── bids ◄─── profiles (bidder_id)   [IMMUTABLE]                         │
    └── auction_results                                                        │
```

---

## Transaction Domain

```
sale_listings / rental_bookings / service_bookings / auction_results
    │ (reference_id + reference_table polymorphic)
    ▼
orders ◄─── profiles (buyer_id, seller_id)
    │
    └── transactions ◄─── payment_intents
            │
            └── payment_events [webhook records]
```

---

## Services Domain

```
service_categories (tree: parent_id → children)
    │
    ▼
service_provider_services ◄─── service_providers ◄─── profiles
                                    │                   organizations
                                    │
service_requests ◄─── profiles (customer_id)
    │           └── vehicles
    │
    └── service_quotes ◄─── service_providers
            │
            └── service_bookings ◄─── profiles (customer_id)
                    │
                    └── vehicle_service_history (in garage)
```

---

## Garage Domain

```
profiles
    │
    └── user_vehicles ◄─── vehicles (optional link)
            │
            ├── vehicle_service_history ◄─── service_bookings
            ├── maintenance_reminders
            └── vehicle_expenses
```

---

## Parts Domain

```
part_categories (tree: parent_id → children)
    │
    ▼
parts ◄─── profiles (seller_id)
    │       organizations
    │
    ├── part_compatibility ◄─── vehicle_makes / models / variants
    └── part_images
```

---

## Communication Domain

```
profiles ◄─── conversation_participants
    │                 │
    │                 ▼
    │          conversations
    │                 │
    │                 └── messages ◄─── profiles (sender_id)
    │                         │
    │                         └── message_attachments
    │
    └── notifications
```

---

## Review Domain

```
profiles (reviewer_id)
    │
    └── reviews ──────────────────────────────────────────────────────────────┐
            │         target_type: dealer/seller/rental_provider/service_pro  │
            │         target_id: (polymorphic reference)                      │
            │                                                                  │
            └── review_responses ◄─── profiles (responder_id)                │
                                                                               │
organizations / service_providers / profiles (targets) ◄─────────────────────┘
```

---

## Membership Domain

```
membership_plans
    │
    └── memberships ◄─── profiles
            │
            └── membership_payments ◄─── transactions
```

---

## Verification Domain

```
profiles ◄─── verification_requests
organizations                │
                             └── verification_documents
                             └── reviewed by: profiles (admin)
```

---

## Key Polymorphic Relationships

These tables use `(reference_type, reference_id)` patterns for flexibility:

| Table | reference_type values |
|---|---|
| `orders` | `sale_listing`, `rental_booking`, `service_booking`, `auction_result`, `membership`, `part` |
| `conversations` | `sale_listing`, `service_request`, `rental_booking` |
| `reviews` | `dealer`, `seller`, `rental_provider`, `service_provider`, `part_seller` |
| `notifications` | `listing`, `bid`, `booking`, `message`, `offer`, `review` |

---

## Foreign Key Summary (Key Relationships)

```
profiles.id             → auth.users.id
organizations.owner_id  → profiles.id
org_members.profile_id  → profiles.id
org_members.org_id      → organizations.id
vehicles.owner_id       → profiles.id
vehicles.org_id         → organizations.id
vehicles.type_id        → vehicle_types.id
vehicles.make_id        → vehicle_makes.id
vehicles.model_id       → vehicle_models.id
sale_listings.vehicle_id → vehicles.id
sale_listings.seller_id  → profiles.id
rental_bookings.listing_id → rental_listings.id
rental_bookings.renter_id  → profiles.id
bids.auction_item_id    → auction_items.id
bids.bidder_id          → profiles.id
auction_items.vehicle_id → vehicles.id
auction_items.auction_id → auctions.id
service_requests.customer_id → profiles.id
service_quotes.provider_id   → service_providers.id
service_bookings.quote_id    → service_quotes.id
user_vehicles.owner_id       → profiles.id
user_vehicles.vehicle_id     → vehicles.id (optional)
orders.buyer_id              → profiles.id
transactions.order_id        → orders.id
messages.conversation_id     → conversations.id
messages.sender_id           → profiles.id
reviews.reviewer_id          → profiles.id
notifications.profile_id     → profiles.id
memberships.profile_id       → profiles.id
memberships.plan_id          → membership_plans.id
```

---

_Last updated: 2026-09-09_
_Status: Architecture Phase 0_
