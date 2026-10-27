import { apiFetch } from "~/lib/api";

// === Orders

export interface ProcurementOrderRow {
  orderId: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  farmerName: string;
  farmerLga: string;
  farmerState: string;
  itemType: "fish" | "feed";
  quantity: number;
  weightKg: number | null;
  grandTotal: number;
  status: string;
  fulfillmentStage: string;
  fulfillmentMethod: "pickup" | "delivery";
  clusterDeclined: boolean;
  hasClusterFarmer: boolean;
  procurementOfficerId: string | null;
  eligible: boolean;
  createdAt: string;
}

// === Farm records

export interface FarmPond {
  id: string;
  farmer_id: string;
  pond_type: string | null;
  pond_tank_number: string | null;
  pond_dimension_m3: number | null;
  created_at: string;
  stocking?: PondStockingRecord[];
  readings?: FarmParameterReading[];
}

export interface PondStockingRecord {
  id: string;
  pond_id: string;
  date_of_stocking: string;
  species: string | null;
  number_of_fish_stocked: number | null;
  stocking_density_per_m2: number | null;
  average_weight_stocked_g: number | null;
  total_biomass_kg: number | null;
  source_of_seedling: string | null;
  sampling?: PondSamplingEntry[];
  harvest?: PondHarvestRecord | null;
}

export interface PondSamplingEntry {
  id: string;
  date: string;
  avg_body_weight_g: number | null;
  daily_feed_fed_kg: number | null;
  cumulative_feed_fed_kg: number | null;
  feed_brand: string | null;
  feed_size: string | null;
  mortality_count: number | null;
  mortality_weight_g: number | null;
  estimated_stock_balance: number | null;
  other_management_practices: string | null;
  remarks: string | null;
}

export interface PondHarvestRecord {
  id: string;
  date_of_harvest: string;
  culture_period_days: number | null;
  actual_fish_harvested: number | null;
  survival_rate_pct: number | null;
  total_biomass_harvested_kg: number | null;
  avg_weight_harvested_g: number | null;
  mode_size_harvested: string | null;
  total_feed_consumed_kg: number | null;
  actual_fcr: number | null;
  actual_sales_price_per_kg: number | null;
  total_sales: number | null;
  total_production_cost: number;
  total_revenue: number;
  profit_loss: number;
  pond_attendant_name: string | null;
  pond_supervisor_name: string | null;
}

export interface FarmParameterType {
  id: string;
  name: string;
  unit: string | null;
  category: "water_quality" | "health";
}

export interface FarmParameterReading {
  id: string;
  value: string;
  date: string;
  notes: string | null;
  parameterType: FarmParameterType;
}

export const procurementService = {
  getOrders(page = 1, limit = 20) {
    return apiFetch<{
      status: string;
      data: { orders: ProcurementOrderRow[]; pagination: { total: number; page: number; limit: number; totalPages: number } };
    }>(`/procurement/orders?page=${page}&limit=${limit}`);
  },

  claimOrder(orderId: string) {
    return apiFetch(`/procurement/orders/${orderId}/claim`, { method: "POST" });
  },

  receiveOrder(orderId: string) {
    return apiFetch(`/procurement/orders/${orderId}/receive`, { method: "PATCH" });
  },

  markReadyForPickup(orderId: string) {
    return apiFetch(`/procurement/orders/${orderId}/ready-for-pickup`, { method: "PATCH" });
  },

  escalateToRider(orderId: string, riderId: string) {
    return apiFetch(`/procurement/orders/${orderId}/escalate`, {
      method: "PATCH",
      body: JSON.stringify({ riderId }),
    });
  },

  // --- Farm records ---

  findFarmerByEmail(email: string) {
    return apiFetch<{
      status: string;
      data: {
        farmer: {
          id: string;
          full_name: string;
          email: string;
          phone_number: string;
          farm_name: string | null;
          location_lga: string;
          location_state: string;
        };
      };
    }>(`/procurement/farmers/lookup?email=${encodeURIComponent(email)}`);
  },

  getFarmerPonds(farmerId: string) {
    return apiFetch<{ status: string; data: { ponds: FarmPond[] } }>(`/procurement/farmers/${farmerId}/ponds`);
  },

  createPond(farmerId: string, data: { pondType?: string; pondTankNumber?: string; pondDimensionM3?: number }) {
    return apiFetch<{ status: string; data: { pond: FarmPond } }>(`/procurement/farmers/${farmerId}/ponds`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updatePond(pondId: string, data: { pondType?: string; pondTankNumber?: string; pondDimensionM3?: number }) {
    return apiFetch(`/procurement/ponds/${pondId}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  createStockingRecord(
    pondId: string,
    data: {
      dateOfStocking: string;
      species?: string;
      numberOfFishStocked?: number;
      stockingDensityPerM2?: number;
      averageWeightStockedG?: number;
      totalBiomassKg?: number;
      sourceOfSeedling?: string;
    },
  ) {
    return apiFetch(`/procurement/ponds/${pondId}/stocking`, { method: "POST", body: JSON.stringify(data) });
  },

  updateStockingRecord(
    stockingId: string,
    data: {
      dateOfStocking?: string;
      species?: string;
      numberOfFishStocked?: number;
      stockingDensityPerM2?: number;
      averageWeightStockedG?: number;
      totalBiomassKg?: number;
      sourceOfSeedling?: string;
    },
  ) {
    return apiFetch(`/procurement/stocking/${stockingId}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  createSamplingEntry(
    stockingId: string,
    data: {
      date: string;
      avgBodyWeightG?: number;
      dailyFeedFedKg?: number;
      cumulativeFeedFedKg?: number;
      feedBrand?: string;
      feedSize?: string;
      mortalityCount?: number;
      mortalityWeightG?: number;
      estimatedStockBalance?: number;
      otherManagementPractices?: string;
      remarks?: string;
    },
  ) {
    return apiFetch(`/procurement/stocking/${stockingId}/sampling`, { method: "POST", body: JSON.stringify(data) });
  },

  updateSamplingEntry(
    samplingId: string,
    data: {
      date?: string;
      avgBodyWeightG?: number;
      dailyFeedFedKg?: number;
      cumulativeFeedFedKg?: number;
      feedBrand?: string;
      feedSize?: string;
      mortalityCount?: number;
      mortalityWeightG?: number;
      estimatedStockBalance?: number;
      otherManagementPractices?: string;
      remarks?: string;
    },
  ) {
    return apiFetch(`/procurement/sampling/${samplingId}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  createHarvestRecord(stockingId: string, data: Record<string, unknown>) {
    return apiFetch(`/procurement/stocking/${stockingId}/harvest`, { method: "POST", body: JSON.stringify(data) });
  },

  updateHarvestRecord(harvestId: string, data: Record<string, unknown>) {
    return apiFetch(`/procurement/harvest/${harvestId}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  getParameterTypes(q?: string) {
    return apiFetch<{ status: string; data: { parameterTypes: FarmParameterType[] } }>(
      `/procurement/parameter-types${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    );
  },

  createParameterType(data: { name: string; unit?: string; category: "water_quality" | "health" }) {
    return apiFetch<{ status: string; data: { parameterType: FarmParameterType } }>("/procurement/parameter-types", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  createParameterReading(pondId: string, data: { parameterTypeId: string; value: string; date: string; notes?: string }) {
    return apiFetch(`/procurement/ponds/${pondId}/parameter-readings`, { method: "POST", body: JSON.stringify(data) });
  },

  updateParameterReading(readingId: string, data: { value?: string; date?: string; notes?: string }) {
    return apiFetch(`/procurement/parameter-readings/${readingId}`, { method: "PATCH", body: JSON.stringify(data) });
  },
};
