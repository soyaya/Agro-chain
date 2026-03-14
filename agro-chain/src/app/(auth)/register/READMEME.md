# AgroChainMarketPlace

## Project Overview

+ AgroChainMarketPlace is a **digital fish supply marketplace** connecting farmers and buyers.

+ The platform introduces **cluster farmers** who aggregate supplies from smaller farmers and publish them to the marketplace.

+ The platform must be **modular, scalable, and strongly typed**.

+ The system must prioritize **component reusability and modular architecture**.

The platform contains **four roles**:

+ Farmer

+ Cluster Farmer

+ Buyer

+ Admin

The system flow:

+ Farmers produce fish

+ Farmers submit supply listings

+ Cluster Farmers approve farmer supplies

+ Approved supplies appear as **Cluster Farmer listings**

+ Buyers browse and purchase from the marketplace

+ Admin verifies cluster farmers and monitors the platform

---

# Engineering Rules

+ All logic must use **TypeScript**

+ **NO `any` types**

+ **NO unsafe casting**

+ Use **interfaces and types everywhere**

+ Code must be **modular**

+ Prefer **reusable components**

+ Avoid duplicated logic

+ Extract shared logic into hooks and utilities

The project must follow **clean architecture principles**.

---

# Tech Stack

+ TypeScript

+ React / NextJS

+ TailwindCSS

+ Framer Motion

+ React Query or Server Actions

+ Modular component architecture

Animations must use:

+ `motion`

+ `AnimatePresence`

---

# UI and Styling Rules

Follow existing design system.

Spacing must follow:





px-(--section-px) sm:px-(--section-px-sm) lg:px-(--section-px-lg)

Use the **same max width already used in the codebase**.  The UI must be **mobile-first responsive**.  Breakpoints:

sm md lg xl

Card layout:

mobile → 1 column tablet → 2 columns desktop → 4 columns

desktop → 4 columns

---  # Color System  Reusable colors must be declared in **global.css**  Example:

--primary --bg --accent --surface

Usage example:

bg-(--bg) text-(--primary) border-(--accent)

DO NOT use:

var(--color)



---

# Animations

Use **Framer Motion** to make the UI feel premium.

Animations should exist in:

+ Dashboard navigation

+ Page transitions

+ Dropdown expansion

+ Listing cards

+ Modal appearance

+ Form success states

+ Toast notifications

Use `AnimatePresence` for:

+ modal transitions

+ dynamic lists

+ alerts

+ notifications

Animations must be **smooth and subtle**.

---

# Authentication System

Users must select a **role during signup**.

Roles:

+ farmer

+ buyer

After login:



if role === "farmer" if isClusterFarmer === true redirect → /cluster-dashboard else redirect → /farmer-dashboard

if role === "buyer" redirect → /buyer-dashboard





---

# User Roles

## Farmer

Normal farmers can:

+ Create and update their profile

+ Submit fish supply listings

+ Apply to become a cluster farmer

+ View submitted listings

+ Track listing approval status

Normal farmers **cannot publish directly to marketplace**.

Their listings must be **approved by a cluster farmer**.

---

# Farmer Profile

Fields should include:

+ fullName

+ phoneNumber

+ email

+ occupation (default: Farmer)

+ farmName

+ farmAddress

+ state

+ localGovernment

+ fishType

+ farmingCapacityKg

+ yearsOfExperience

+ profileImage

+ createdAt

TypeScript interface:



interface FarmerProfile {id: stringfullName: stringphoneNumber: stringemail: stringoccupation: "Farmer"farmName: stringfarmAddress: stringstate: stringlocalGovernment: stringfishType: stringfarmingCapacityKg: numberyearsOfExperience: numberprofileImage?: stringcreatedAt: Date}





---

# Cluster Farmer Application

Inside the profile page, farmers can apply to become a cluster farmer.

Required documents:

+ KYC Identification

+ CAC Registration

+ Proof of Business Location

+ Government ID

+ Business Description

Interface:



interface ClusterApplication {id: stringfarmerId: stringkycDocument: stringcacDocument: stringbusinessLocationProof: stringbusinessDescription: stringstatus: "pending" | "approved" | "rejected"}





Flow:

+ Farmer submits application

+ Admin reviews documents

+ Admin approves or rejects

If approved:



farmer.isClusterFarmer = true redirect → /cluster-dashboard

---  # Farmer Supply Listing  Farmers can submit supply listings.  Minimum requirement:

1000kg fish and above

Fields:  + fishType + harvestDate + totalAvailableKg + packagingOptions  Example packaging:

1kg → 1000 pieces 3kg → 250 pieces 5kg → 100 pieces



Interfaces:

interface PackagingOption { weightKg: number quantity: number }

interface FarmerSupplyListing { id: string farmerId: string fishType: string harvestDate: Date totalAvailableKg: number packaging: PackagingOption[] status: "pending" | "approved" | "rejected" }

When created:

status = "pending"



Cluster farmers will see these listings.

---

# Cluster Farmer

Cluster farmers act as **supply aggregators**.

They can:

+ Approve farmer listings

+ Reject farmer listings

+ Create their own listings

+ View farmers under them

+ Aggregate supply

+ Publish listings to marketplace

When cluster farmer approves listing:





listing.owner = clusterFarmerlisting.visibleOnMarketplace = true





Thus the listing appears **as if created by the cluster farmer**.

---

# Cluster Farmer Dashboard

Features:

+ Dashboard statistics

+ Pending farmer listings

+ Approved listings

+ Create listing

+ Farmers under cluster

+ Profile settings

Cluster farmer profile includes additional fields:

+ businessName

+ CACNumber

+ warehouseLocation

+ distributionCapacity

+ logisticsAvailable

---

# Marketplace

Marketplace route:







Only **cluster farmer listings appear here**.

Listing card must show:

+ Fish Type

+ Available Quantity

+ Packaging Options

+ Cluster Farmer Name

+ Location

+ Price per Kg

+ Delivery options

Cards must have **hover animations**.

---

# Buyer Role

Buyers interact with the marketplace.

Buyers can:

+ Create profile

+ Browse marketplace

+ Filter listings

+ Purchase fish

+ Track orders

+ Save listings

+ Contact cluster farmers

Buyer profile:

+ fullName

+ companyName

+ phoneNumber

+ email

+ deliveryAddress

+ businessType

+ purchaseVolumeEstimate

Interface:



interface BuyerProfile {id: stringfullName: stringcompanyName?: stringphoneNumber: stringemail: stringdeliveryAddress: stringbusinessType: stringpurchaseVolumeEstimate?: number}



---

# Buyer Dashboard

Features:

+ Order history

+ Active orders

+ Saved listings

+ Profile settings

+ Notifications

---

# Admin Dashboard

Admin capabilities:

+ Approve cluster farmer applications

+ Reject cluster farmer applications

+ View all farmers

+ View cluster farmers

+ Monitor listings

+ Remove fraudulent listings

+ Platform analytics

Admin actions:



approveClusterFarmer() rejectClusterFarmer() suspendFarmer() approveListing() removeListing()

---  # Routing Structure

/login /signup

/farmer-dashboard /farmer-dashboard/profile /farmer-dashboard/listings

/cluster-dashboard /cluster-dashboard/profile /cluster-dashboard/farmers /cluster-dashboard/listings /cluster-dashboard/pending-approvals

/buyer-dashboard /buyer-dashboard/orders /buyer-dashboard/profile /buyer-dashboard/saved

/marketplace

/admin-dashboard





---

# Modular Component Architecture

The project must be **component driven**.

Prefer **small reusable components**.

Examples:

### Profile Components

+ ProfileForm

+ ProfileAvatar

+ ProfileDetails

Reusable between **farmer and buyer**.

---

### Listing Components

+ ListingForm

+ ListingCard

+ ListingTable

+ PackagingSelector

Reusable between:

+ farmer

+ cluster farmer

+ marketplace

---

### Dashboard Components

+ DashboardLayout

+ DashboardSidebar

+ DashboardHeader

+ DashboardStats

Reusable across all dashboards.

---

# Hooks Architecture

Extract reusable logic into hooks.

Examples:



useAuth() useUserProfile() useListings() useMarketplace() useOrders()

---  # Folder Structure



src

components

dashboard

profile

listings

marketplace

ui

features

farmers

clusterFarmers

buyers

admin

hooks

types

services

api

auth

listings

orders

utils

app

dashboards

marketplace

auth





---

# UX Enhancements

Include:

+ Skeleton loading states

+ Toast notifications

+ Smooth transitions

+ Animated dropdowns

+ Interactive modals

+ Optimistic UI updates

---

# Final Goal

Build a **premium digital fish supply marketplace** where:

+ Farmers produce fish

+ Cluster farmers aggregate supply

+ Buyers purchase fish

+ Admin governs the platform

The platform must emphasize:

+ modular architecture

+ reusable components

+ strong typing

+ smooth animations

+ responsive design

+ clean engineering structure

