// Simple verification script for dashboard configuration
const { 
  farmerDashboardConfig, 
  enhancedFarmerDashboardConfig,
  clusterFarmerDashboardConfig,
  enhancedClusterFarmerDashboardConfig,
  buyerDashboardConfig,
  adminDashboardConfig 
} = require('./src/models/models.ts');

console.log('🔍 Verifying Dashboard Configurations...\n');

// Check that farmer configs are now enhanced
console.log('✅ Farmer Dashboard Config:');
console.log('  - Has financial services:', 'financialServices' in farmerDashboardConfig);
console.log('  - Financial services enabled:', farmerDashboardConfig.financialServices?.enabled);
console.log('  - Navigation items count:', farmerDashboardConfig.navLinks.length);

console.log('\n✅ Enhanced Farmer Dashboard Config:');
console.log('  - Has financial services:', 'financialServices' in enhancedFarmerDashboardConfig);
console.log('  - Financial services enabled:', enhancedFarmerDashboardConfig.financialServices?.enabled);
console.log('  - Navigation items count:', enhancedFarmerDashboardConfig.navLinks.length);

// Check financial navigation items
const financialNavItem = enhancedFarmerDashboardConfig.navLinks.find(item => 
  item.label === 'Financial Services'
);
console.log('  - Has Financial Services nav item:', !!financialNavItem);
console.log('  - Financial submenu items:', financialNavItem?.submenu?.length || 0);

console.log('\n✅ Cluster Farmer Dashboard Config:');
console.log('  - Has financial services:', 'financialServices' in clusterFarmerDashboardConfig);
console.log('  - Financial services enabled:', clusterFarmerDashboardConfig.financialServices?.enabled);

console.log('\n✅ Buyer Dashboard Config (should not have financial services):');
console.log('  - Has financial services:', 'financialServices' in buyerDashboardConfig);

console.log('\n✅ Admin Dashboard Config (should not have financial services):');
console.log('  - Has financial services:', 'financialServices' in adminDashboardConfig);

console.log('\n🎉 Configuration verification complete!');