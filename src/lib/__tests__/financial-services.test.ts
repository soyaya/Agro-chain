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

    it('should return true for enhanced dashboard config (key present, even though disabled)', () => {
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

    it('should return false for farmer config (farmers ignore loans/financial services)', () => {
      expect(isFinancialFeatureEnabled(enhancedFarmerDashboardConfig, 'loans')).toBe(false);
      expect(isFinancialFeatureEnabled(enhancedFarmerDashboardConfig, 'credit')).toBe(false);
      expect(isFinancialFeatureEnabled(enhancedFarmerDashboardConfig, 'payments')).toBe(false);
      expect(isFinancialFeatureEnabled(enhancedFarmerDashboardConfig, 'profile')).toBe(false);
    });
  });

  describe('getFinancialNavigationItems', () => {
    it('should return empty array for regular dashboard config', () => {
      const items = getFinancialNavigationItems(buyerDashboardConfig);
      expect(items).toHaveLength(0);
    });

    it('should return empty array for farmer config (no Financial Services nav item)', () => {
      const items = getFinancialNavigationItems(enhancedFarmerDashboardConfig);
      expect(items).toHaveLength(0);
    });
  });

  describe('shouldShowFinancialServices', () => {
    it('should return false for farmer dashboard paths (farmers ignore loans)', () => {
      expect(shouldShowFinancialServices('/farmers-dashboard')).toBe(false);
      expect(shouldShowFinancialServices('/farmers-dashboard/profile')).toBe(false);
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
