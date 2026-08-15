import { describe, it, expect } from 'vitest';
import {
  hasFinancialServices,
  isFinancialFeatureEnabled,
  getFinancialNavigationItems,
  shouldShowFinancialServices
} from '../financial-services';
import {
  farmerDashboardConfig,
  enhancedFarmerDashboardConfig,
  buyerDashboardConfig
} from '../../models/models';

describe('Financial Services Utilities', () => {
  describe('hasFinancialServices', () => {
    it('should return false for regular dashboard config', () => {
      expect(hasFinancialServices(buyerDashboardConfig)).toBe(false);
    });

    it('should return true for enhanced dashboard config', () => {
      expect(hasFinancialServices(enhancedFarmerDashboardConfig)).toBe(true);
    });

    it('should return true for farmer dashboard config (now enhanced)', () => {
      expect(hasFinancialServices(farmerDashboardConfig)).toBe(true);
    });
  });

  describe('isFinancialFeatureEnabled', () => {
    it('should return false for regular dashboard config', () => {
      expect(isFinancialFeatureEnabled(buyerDashboardConfig, 'loans')).toBe(false);
      expect(isFinancialFeatureEnabled(buyerDashboardConfig, 'credit')).toBe(false);
    });

    it('should return true for enabled features in enhanced config', () => {
      expect(isFinancialFeatureEnabled(enhancedFarmerDashboardConfig, 'loans')).toBe(true);
      expect(isFinancialFeatureEnabled(enhancedFarmerDashboardConfig, 'credit')).toBe(true);
      expect(isFinancialFeatureEnabled(enhancedFarmerDashboardConfig, 'payments')).toBe(true);
      expect(isFinancialFeatureEnabled(enhancedFarmerDashboardConfig, 'profile')).toBe(true);
    });
  });

  describe('getFinancialNavigationItems', () => {
    it('should return empty array for regular dashboard config', () => {
      const items = getFinancialNavigationItems(buyerDashboardConfig);
      expect(items).toHaveLength(0);
    });

    it('should return financial navigation items for enhanced config', () => {
      const items = getFinancialNavigationItems(enhancedFarmerDashboardConfig);
      expect(items.length).toBeGreaterThan(0);

      // Should return the submenu items from Financial Services
      expect(items.some(item => item.label === 'Loan Applications')).toBe(true);
      expect(items.some(item => item.label === 'Credit Purchases')).toBe(true);
      expect(items.some(item => item.label === 'Payment History')).toBe(true);
      expect(items.some(item => item.label === 'Financial Profile')).toBe(true);
    });
  });

  describe('shouldShowFinancialServices', () => {
    it('should return true for farmer dashboard paths', () => {
      expect(shouldShowFinancialServices('/farmers-dashboard')).toBe(true);
      expect(shouldShowFinancialServices('/farmers-dashboard/profile')).toBe(true);
    });

    it('should return true for cluster dashboard paths', () => {
      expect(shouldShowFinancialServices('/cluster-dashboard')).toBe(true);
      expect(shouldShowFinancialServices('/cluster-dashboard/farmers')).toBe(true);
    });

    it('should return false for other dashboard paths', () => {
      expect(shouldShowFinancialServices('/buyers-dashboard')).toBe(false);
      expect(shouldShowFinancialServices('/admin-dashboard')).toBe(false);
      expect(shouldShowFinancialServices('/marketplace')).toBe(false);
    });
  });
});
