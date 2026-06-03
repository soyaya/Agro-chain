// Central type definitions for AgroChainMarketPlace
// All interfaces follow strict TypeScript rules - NO any types

import type { LucideIcon } from "lucide-react";

// ============================================
// COMMON TYPES
// ============================================

export type UserRole = "farmer" | "buyer" | "admin";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type ListingStatus = "pending" | "approved" | "rejected";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export type DeliveryType = "pickup" | "delivery";

// ============================================
// NAVIGATION & UI
// ============================================

export interface NavLink {
  label: string;
  href: string;
  icon?: LucideIcon;
  color?: string;
}

export interface DashboardNavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  submenu?: DashboardNavLink[];
}

export interface DashboardConfig {
  title: string;
  description: string;
  navLinks: DashboardNavLink[];
}

// ============================================
// ENHANCED DASHBOARD CONFIGURATION
// ============================================

/**
 * Enhanced dashboard configuration that extends the base DashboardConfig
 * to support financial services for farmer dashboards
 */
export interface EnhancedDashboardConfig extends DashboardConfig {
  financialServices?: FinancialServicesConfig;
}

/**
 * Provider interface for financial navigation functionality
 * Used to generate and manage financial service navigation items
 */
export interface FinancialNavProvider {
  getLoanNavigationItems(): DashboardNavLink[];
  getCreditNavigationItems(): DashboardNavLink[];
  getFinancialProfileItems(): DashboardNavLink[];
  isFeatureEnabled(feature: FinancialFeature): boolean;
}

/**
 * Configuration for financial services features
 * Controls which financial services are enabled for a dashboard
 */
export interface FinancialServicesConfig {
  enabled: boolean;
  loanServices: LoanServiceConfig;
  creditServices: CreditServiceConfig;
}

/**
 * Configuration for loan-related services
 */
export interface LoanServiceConfig {
  applicationEnabled: boolean;
  trackingEnabled: boolean;
  historyEnabled: boolean;
}

/**
 * Configuration for credit purchase services
 */
export interface CreditServiceConfig {
  purchaseEnabled: boolean;
  catalogEnabled: boolean;
  paymentTrackingEnabled: boolean;
}

/**
 * Dashboard type identifier for different user roles
 */
export type DashboardType = "farmer" | "cluster-farmer" | "buyer" | "admin";

/**
 * Return type for the useDashboardNav hook
 * Provides navigation state and helper functions for dashboard navigation
 */
export interface UseDashboardNavReturn {
  config: DashboardConfig | EnhancedDashboardConfig;
  activeItem: string;
  activeFinancialItem: string;
  navigationItems: DashboardNavLink[];
  financialItems: DashboardNavLink[];
  financialBadges: Record<string, string>;
  isFinancialFeatureEnabled: (feature: FinancialFeature) => boolean;
  isFinancialNavItemVisible: (itemHref: string) => boolean;
  hasFinancialServices: boolean;
  shouldShowFinancialServices: boolean;
}

// ============================================
// FINANCIAL SERVICES TYPES
// ============================================

export type FinancialFeature = 'loans' | 'credit' | 'payments' | 'profile';

export type LoanType = 'equipment' | 'seed' | 'fertilizer' | 'expansion' | 'emergency';

export type LoanApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed';

export type CreditPurchaseStatus = 'pending' | 'approved' | 'shipped' | 'delivered' | 'completed';

export type ProductCategory = 'seeds' | 'fertilizers' | 'pesticides' | 'equipment' | 'tools';

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'on_time' | 'late' | 'missed';

export type RiskLevel = 'low' | 'medium' | 'high';

export type RiskImpact = 'positive' | 'negative' | 'neutral';

export interface SelectOption {
  label: string;
  value: string;
}

// ============================================
// USER & AUTHENTICATION
// ============================================

export interface BaseUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser extends BaseUser {
  isClusterFarmer: boolean;
  profileComplete: boolean;
}

// ============================================
// FARMER PROFILE
// ============================================

export interface FarmerProfile {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  occupation: "Farmer";
  farmName: string;
  farmAddress: string;
  state: string;
  localGovernment: string;
  fishType: string;
  farmingCapacityKg: number;
  yearsOfExperience: number;
  profileImage?: string;
  isClusterFarmer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CLUSTER FARMER
// ============================================

export interface ClusterFarmerProfile extends FarmerProfile {
  businessName: string;
  cacNumber: string;
  warehouseLocation: string;
  distributionCapacity: number;
  logisticsAvailable: boolean;
  verificationStatus: ApplicationStatus;
}

export interface ClusterApplication {
  id: string;
  farmerId: string;
  kycDocument: string;
  cacDocument: string;
  businessLocationProof: string;
  governmentId: string;
  businessDescription: string;
  businessName: string;
  cacNumber: string;
  warehouseLocation: string;
  distributionCapacity: number;
  logisticsAvailable: boolean;
  status: ApplicationStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// BUYER PROFILE
// ============================================

export interface BuyerProfile {
  id: string;
  userId: string;
  fullName: string;
  companyName?: string;
  phoneNumber: string;
  email: string;
  deliveryAddress: string;
  state: string;
  localGovernment: string;
  businessType: string;
  purchaseVolumeEstimate?: number;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SUPPLY LISTING & PACKAGING
// ============================================

export interface PackagingOption {
  weightKg: number;
  quantity: number;
  pricePerUnit?: number;   // Backend-computed on marketplace responses; absent on farmer-side listing data
}

export interface FarmerSupplyListing {
  id: string;
  farmerId: string;
  farmerName: string;
  fishType: string;
  harvestDate: Date;
  totalAvailableKg: number;
  packaging: PackagingOption[];
  status: ListingStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClusterFarmerListing {
  id: string;
  clusterFarmerId: string;
  clusterFarmerName: string;
  businessName: string;
  originalFarmerListingId?: string;
  fishType: string;
  harvestDate: Date;
  totalAvailableKg: number;
  packaging: PackagingOption[];
  location: string;
  state: string;
  localGovernment: string;
  pricePerKg: number;
  deliveryOptions: string[];
  visibleOnMarketplace: boolean;
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// FINANCIAL SERVICES DATA MODELS
// ============================================

/**
 * Loan application data model
 * Represents a farmer's loan application with all required details
 */
export interface LoanApplication {
  id: string;
  farmerId: string;
  applicationNumber: string;
  loanType: LoanType;
  requestedAmount: number;
  purpose: string;
  farmDetails: FarmCollateralDetails;
  status: LoanApplicationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  approvedAmount?: number;
  interestRate?: number;
  repaymentTerms?: RepaymentTerms;
  documents: LoanDocument[];
}

/**
 * Farm collateral details for loan applications
 * Contains information about the farm used as collateral
 */
export interface FarmCollateralDetails {
  farmSize: number;
  cropTypes: string[];
  estimatedYield: number;
  farmValue: number;
  equipment: EquipmentItem[];
}

export interface EquipmentItem {
  name: string;
  type: string;
  value: number;
  condition: 'new' | 'good' | 'fair' | 'poor';
  purchaseDate?: Date;
}

/**
 * Repayment terms for approved loans
 */
export interface RepaymentTerms {
  durationMonths: number;
  monthlyPayment: number;
  totalAmount: number;
  startDate: Date;
}

export interface LoanDocument {
  id: string;
  type: string;
  filename: string;
  url: string;
  uploadedAt: Date;
  verified: boolean;
}

/**
 * Credit purchase data model
 * Represents a farmer's credit-based purchase of agricultural supplies
 */
export interface CreditPurchase {
  id: string;
  farmerId: string;
  orderNumber: string;
  items: CreditPurchaseItem[];
  totalAmount: number;
  creditTerms: CreditTerms;
  status: CreditPurchaseStatus;
  createdAt: Date;
  deliveryAddress: string;
  paymentSchedule: PaymentSchedule[];
}

export interface CreditPurchaseItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplier: string;
}

/**
 * Credit terms for credit purchases
 */
export interface CreditTerms {
  creditLimit: number;
  interestRate: number;
  paymentPeriodDays: number;
  latePaymentFee: number;
}

export interface PaymentSchedule {
  dueDate: Date;
  amount: number;
  status: PaymentStatus;
  paidAt?: Date;
}

/**
 * Farmer financial profile
 * Contains credit score, limits, and financial history
 */
export interface FarmerFinancialProfile {
  farmerId: string;
  creditScore: number;
  creditLimit: number;
  availableCredit: number;
  totalLoansActive: number;
  totalCreditPurchases: number;
  paymentHistory: PaymentHistoryRecord[];
  riskAssessment: RiskAssessment;
  lastUpdated: Date;
}

export interface PaymentHistoryRecord {
  date: Date;
  type: 'loan_payment' | 'credit_payment';
  amount: number;
  status: PaymentStatus;
  referenceId: string;
}

/**
 * Risk assessment for farmer financial profile
 */
export interface RiskAssessment {
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  lastAssessment: Date;
  nextReview: Date;
}

export interface RiskFactor {
  factor: string;
  impact: RiskImpact;
  weight: number;
}

// ============================================
// MARKETPLACE & ORDERS
// ============================================

export interface MarketplaceListing extends ClusterFarmerListing {
  clusterFarmerContact: string;
  warehouseLocation: string;
  logisticsAvailable: boolean;
}

export interface OrderItem {
  listingId: string;
  fishType: string;
  variant?: string;
  processed?: boolean;
  weightKg: number;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  clusterFarmerId: string;
  clusterFarmerName: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee?: number;
  deliveryType?: DeliveryType;
  deliveryAddress: string;
  deliveryOption: string;
  status: OrderStatus;
  deliveryConfirmed?: boolean;
  buyerConfirmedAt?: Date;
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ADMIN
// ============================================

export interface AdminProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "admin";
  permissions: string[];
  createdAt: Date;
}

export interface PlatformAnalytics {
  totalFarmers: number;
  totalClusterFarmers: number;
  totalBuyers: number;
  totalListings: number;
  totalOrders: number;
  totalRevenue: number;
  pendingApplications: number;
  activeListings: number;
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// ============================================
// FORM TYPES
// ============================================

export interface FarmerProfileFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  farmName: string;
  farmAddress: string;
  state: string;
  localGovernment: string;
  fishType: string;
  farmingCapacityKg: number;
  yearsOfExperience: number;
  profileImage?: File;
  isClusterFarmer?: boolean;
  businessName?: string;
  cacNumber?: string;
  warehouseLocation?: string;
  distributionCapacity?: number;
  logisticsAvailable?: boolean;
}

export interface BuyerProfileFormData {
  fullName: string;
  companyName?: string;
  phoneNumber: string;
  email: string;
  deliveryAddress: string;
  state: string;
  localGovernment: string;
  businessType: string;
  purchaseVolumeEstimate?: number;
  profileImage?: File;
}

export interface SupplyListingFormData {
  fishType: string;
  harvestDate: Date;
  totalAvailableKg: number;
  weightKg: number;   // Weight per fish in kg - replaces packaging array
}

export interface ClusterApplicationFormData {
  businessName: string;
  cacNumber: string;
  warehouseLocation: string;
  distributionCapacity: number;
  logisticsAvailable: boolean;
  businessDescription: string;
  kycDocument: File;
  cacDocument: File;
  businessLocationProof: File;
  governmentId: File;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface MarketplaceFilters {
  search?: string;
  fishType?: string;
  minPrice?: number;
  maxPrice?: number;
  state?: string;
  localGovernment?: string;
  minQuantity?: number;
  sortBy?: "price" | "quantity" | "date";
  sortOrder?: "asc" | "desc";
}

export interface ListingFilters {
  status?: ListingStatus;
  fishType?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
