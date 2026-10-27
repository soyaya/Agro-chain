"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, FlaskConical, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  procurementService,
  type FarmPond,
  type PondStockingRecord,
  type PondSamplingEntry,
  type PondHarvestRecord,
  type FarmParameterType,
  type FarmParameterReading,
} from "~/lib/services/procurement.service";
import { EmptyState } from "~/components/ui/EmptyState";

type FoundFarmer = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  farm_name: string | null;
  location_lga: string;
  location_state: string;
};

function PondModal({
  farmerId,
  pond,
  onClose,
  onAdded,
}: {
  farmerId: string;
  pond?: FarmPond;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [pondType, setPondType] = useState(pond?.pond_type ?? "");
  const [pondTankNumber, setPondTankNumber] = useState(pond?.pond_tank_number ?? "");
  const [pondDimensionM3, setPondDimensionM3] = useState(pond?.pond_dimension_m3?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        pondType: pondType || undefined,
        pondTankNumber: pondTankNumber || undefined,
        pondDimensionM3: pondDimensionM3 ? Number(pondDimensionM3) : undefined,
      };
      if (pond) {
        await procurementService.updatePond(pond.id, data);
        toast.success("Pond updated.");
      } else {
        await procurementService.createPond(farmerId, data);
        toast.success("Pond added.");
      }
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save pond");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-(--white) p-(--space-xl) shadow-xl">
        <div className="mb-(--gap-base) flex items-center justify-between">
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">{pond ? "Edit pond" : "Add a pond"}</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-(--text-colour)" />
          </button>
        </div>
        <div className="flex flex-col gap-(--gap-base)">
          <input
            placeholder="Pond type (e.g. Earthen, Tank)"
            value={pondType}
            onChange={(e) => setPondType(e.target.value)}
            className="w-full rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
          />
          <input
            placeholder="Pond/Tank number"
            value={pondTankNumber}
            onChange={(e) => setPondTankNumber(e.target.value)}
            className="w-full rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
          />
          <input
            placeholder="Pond dimension (m³)"
            type="number"
            value={pondDimensionM3}
            onChange={(e) => setPondDimensionM3(e.target.value)}
            className="w-full rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="font-roboto-slab rounded-xl bg-(--theme-green-dark) py-(--space-md) text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : pond ? "Save changes" : "Add pond"}
          </button>
        </div>
      </div>
    </div>
  );
}

function toDateInputValue(value: string | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

function StockingModal({
  pondId,
  stocking,
  onClose,
  onAdded,
}: {
  pondId: string;
  stocking?: PondStockingRecord;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({
    dateOfStocking: toDateInputValue(stocking?.date_of_stocking),
    species: stocking?.species ?? "",
    numberOfFishStocked: stocking?.number_of_fish_stocked?.toString() ?? "",
    stockingDensityPerM2: stocking?.stocking_density_per_m2?.toString() ?? "",
    averageWeightStockedG: stocking?.average_weight_stocked_g?.toString() ?? "",
    totalBiomassKg: stocking?.total_biomass_kg?.toString() ?? "",
    sourceOfSeedling: stocking?.source_of_seedling ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.dateOfStocking) {
      toast.error("Date of stocking is required.");
      return;
    }
    setSaving(true);
    try {
      const data = {
        dateOfStocking: form.dateOfStocking,
        species: form.species || undefined,
        numberOfFishStocked: form.numberOfFishStocked ? Number(form.numberOfFishStocked) : undefined,
        stockingDensityPerM2: form.stockingDensityPerM2 ? Number(form.stockingDensityPerM2) : undefined,
        averageWeightStockedG: form.averageWeightStockedG ? Number(form.averageWeightStockedG) : undefined,
        totalBiomassKg: form.totalBiomassKg ? Number(form.totalBiomassKg) : undefined,
        sourceOfSeedling: form.sourceOfSeedling || undefined,
      };
      if (stocking) {
        await procurementService.updateStockingRecord(stocking.id, data);
        toast.success("Stocking cycle updated.");
      } else {
        await procurementService.createStockingRecord(pondId, data);
        toast.success("Stocking cycle started.");
      }
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save stocking cycle");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <input
      placeholder={label}
      type={type}
      value={form[key]}
      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
      className="w-full rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-(--white) p-(--space-xl) shadow-xl">
        <div className="mb-(--gap-base) flex items-center justify-between">
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">
            {stocking ? "Edit stocking cycle" : "New stocking cycle"}
          </h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-(--text-colour)" />
          </button>
        </div>
        <div className="flex flex-col gap-(--gap-base)">
          {field("dateOfStocking", "Date of stocking", "date")}
          {field("species", "Species")}
          {field("numberOfFishStocked", "Number of fish stocked", "number")}
          {field("stockingDensityPerM2", "Stocking density (No./m²)", "number")}
          {field("averageWeightStockedG", "Avg weight stocked (g)", "number")}
          {field("totalBiomassKg", "Total biomass (kg)", "number")}
          {field("sourceOfSeedling", "Source of seedling")}
          <button
            onClick={handleSave}
            disabled={saving}
            className="font-roboto-slab rounded-xl bg-(--theme-green-dark) py-(--space-md) text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : stocking ? "Save changes" : "Start cycle"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SamplingModal({
  stockingId,
  entry,
  onClose,
  onAdded,
}: {
  stockingId: string;
  entry?: PondSamplingEntry;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [form, setForm] = useState({
    date: toDateInputValue(entry?.date),
    avgBodyWeightG: entry?.avg_body_weight_g?.toString() ?? "",
    dailyFeedFedKg: entry?.daily_feed_fed_kg?.toString() ?? "",
    cumulativeFeedFedKg: entry?.cumulative_feed_fed_kg?.toString() ?? "",
    feedBrand: entry?.feed_brand ?? "",
    feedSize: entry?.feed_size ?? "",
    mortalityCount: entry?.mortality_count?.toString() ?? "",
    mortalityWeightG: entry?.mortality_weight_g?.toString() ?? "",
    estimatedStockBalance: entry?.estimated_stock_balance?.toString() ?? "",
    otherManagementPractices: entry?.other_management_practices ?? "",
    remarks: entry?.remarks ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.date) {
      toast.error("Date is required.");
      return;
    }
    setSaving(true);
    try {
      const data = {
        date: form.date,
        avgBodyWeightG: form.avgBodyWeightG ? Number(form.avgBodyWeightG) : undefined,
        dailyFeedFedKg: form.dailyFeedFedKg ? Number(form.dailyFeedFedKg) : undefined,
        cumulativeFeedFedKg: form.cumulativeFeedFedKg ? Number(form.cumulativeFeedFedKg) : undefined,
        feedBrand: form.feedBrand || undefined,
        feedSize: form.feedSize || undefined,
        mortalityCount: form.mortalityCount ? Number(form.mortalityCount) : undefined,
        mortalityWeightG: form.mortalityWeightG ? Number(form.mortalityWeightG) : undefined,
        estimatedStockBalance: form.estimatedStockBalance ? Number(form.estimatedStockBalance) : undefined,
        otherManagementPractices: form.otherManagementPractices || undefined,
        remarks: form.remarks || undefined,
      };
      if (entry) {
        await procurementService.updateSamplingEntry(entry.id, data);
        toast.success("Sampling entry updated.");
      } else {
        await procurementService.createSamplingEntry(stockingId, data);
        toast.success("Sampling entry added.");
      }
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save sampling entry");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <input
      placeholder={label}
      type={type}
      value={form[key]}
      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
      className="w-full rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-(--white) p-(--space-xl) shadow-xl">
        <div className="mb-(--gap-base) flex items-center justify-between">
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">
            {entry ? "Edit sampling entry" : "Weekly sampling entry"}
          </h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-(--text-colour)" />
          </button>
        </div>
        <div className="flex flex-col gap-(--gap-base)">
          {field("date", "Date", "date")}
          {field("avgBodyWeightG", "Avg body weight sampling (g)", "number")}
          {field("dailyFeedFedKg", "Daily feed fed (kg)", "number")}
          {field("cumulativeFeedFedKg", "Cumulative feed fed (kg)", "number")}
          {field("feedBrand", "Feed brand")}
          {field("feedSize", "Feed size")}
          {field("mortalityCount", "Mortality (No.)", "number")}
          {field("mortalityWeightG", "Mortality weight (g)", "number")}
          {field("estimatedStockBalance", "Estimated stock balance", "number")}
          {field("otherManagementPractices", "Other management practices (medication, sorting etc)")}
          {field("remarks", "Remarks")}
          <button
            onClick={handleSave}
            disabled={saving}
            className="font-roboto-slab rounded-xl bg-(--theme-green-dark) py-(--space-md) text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : entry ? "Save changes" : "Add entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

const COST_FIELD_KEYS = [
  ["costOfSeedlings", "Cost of Seedlings"],
  ["totalCostOfFeeds", "Total Cost of Feeds"],
  ["energyCost", "Energy Cost"],
  ["medicationCost", "Medication Cost"],
  ["salariesAndWages", "Salaries and Wages"],
  ["utilityAndLogisticsCost", "Utility and Logistics Cost"],
  ["administrativeCost", "Administrative Cost"],
  ["pondMaintenanceCost", "Pond Maintenance Cost"],
  ["depreciationOfCapitalCost", "Depreciation of Capital Cost"],
] as const;

function harvestInitialForm(harvest?: PondHarvestRecord): Record<string, string> {
  if (!harvest) return { dateOfHarvest: "", totalSales: "" };
  const costSource: Record<string, number | null> = {
    costOfSeedlings: null,
    totalCostOfFeeds: null,
    energyCost: null,
    medicationCost: null,
    salariesAndWages: null,
    utilityAndLogisticsCost: null,
    administrativeCost: null,
    pondMaintenanceCost: null,
    depreciationOfCapitalCost: null,
  };
  const h = harvest as unknown as Record<string, unknown>;
  const snakeMap: Record<string, string> = {
    costOfSeedlings: "cost_of_seedlings",
    totalCostOfFeeds: "total_cost_of_feeds",
    energyCost: "energy_cost",
    medicationCost: "medication_cost",
    salariesAndWages: "salaries_and_wages",
    utilityAndLogisticsCost: "utility_and_logistics_cost",
    administrativeCost: "administrative_cost",
    pondMaintenanceCost: "pond_maintenance_cost",
    depreciationOfCapitalCost: "depreciation_of_capital_cost",
  };
  Object.keys(costSource).forEach((k) => {
    costSource[k] = (h[snakeMap[k]] as number | null | undefined) ?? null;
  });
  return {
    dateOfHarvest: toDateInputValue(harvest.date_of_harvest),
    culturePeriodDays: harvest.culture_period_days?.toString() ?? "",
    actualFishHarvested: harvest.actual_fish_harvested?.toString() ?? "",
    survivalRatePct: harvest.survival_rate_pct?.toString() ?? "",
    totalBiomassHarvestedKg: harvest.total_biomass_harvested_kg?.toString() ?? "",
    avgWeightHarvestedG: harvest.avg_weight_harvested_g?.toString() ?? "",
    modeSizeHarvested: harvest.mode_size_harvested ?? "",
    totalFeedConsumedKg: harvest.total_feed_consumed_kg?.toString() ?? "",
    actualFcr: harvest.actual_fcr?.toString() ?? "",
    actualSalesPricePerKg: harvest.actual_sales_price_per_kg?.toString() ?? "",
    totalSales: harvest.total_sales?.toString() ?? "",
    pondAttendantName: harvest.pond_attendant_name ?? "",
    pondSupervisorName: harvest.pond_supervisor_name ?? "",
    ...Object.fromEntries(Object.entries(costSource).map(([k, v]) => [k, v != null ? String(v) : ""])),
  };
}

function HarvestModal({
  stockingId,
  harvest,
  onClose,
  onAdded,
}: {
  stockingId: string;
  harvest?: PondHarvestRecord;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [form, setForm] = useState<Record<string, string>>(harvestInitialForm(harvest));
  const [saving, setSaving] = useState(false);

  const totalCost = COST_FIELD_KEYS.reduce((sum, [key]) => sum + (Number(form[key]) || 0), 0);
  const profitLoss = (Number(form.totalSales) || 0) - totalCost;

  const handleSave = async () => {
    if (!form.dateOfHarvest) {
      toast.error("Date of harvest is required.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { dateOfHarvest: form.dateOfHarvest };
      Object.entries(form).forEach(([k, v]) => {
        if (v && k !== "dateOfHarvest") payload[k] = Number(v) || v;
      });
      if (harvest) {
        await procurementService.updateHarvestRecord(harvest.id, payload);
        toast.success("Harvest record updated.");
      } else {
        await procurementService.createHarvestRecord(stockingId, payload);
        toast.success("Harvest record saved.");
      }
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save harvest record");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: string, label: string, type = "text") => (
    <input
      placeholder={label}
      type={type}
      value={form[key] ?? ""}
      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
      className="w-full rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-lg rounded-2xl bg-(--white) p-(--space-xl) shadow-xl">
        <div className="mb-(--gap-base) flex items-center justify-between">
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">
            {harvest ? "Edit harvest record" : "Harvest record"}
          </h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-(--text-colour)" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
          {field("dateOfHarvest", "Date of harvest", "date")}
          {field("culturePeriodDays", "Culture period (DOC, days)", "number")}
          {field("actualFishHarvested", "Actual no. fish harvested", "number")}
          {field("survivalRatePct", "Survival rate (%)", "number")}
          {field("totalBiomassHarvestedKg", "Total biomass harvested (kg)", "number")}
          {field("avgWeightHarvestedG", "Avg weight harvested (g)", "number")}
          {field("modeSizeHarvested", "Mode size of fish harvested")}
          {field("totalFeedConsumedKg", "Total feed consumed (kg)", "number")}
          {field("actualFcr", "Actual FCR", "number")}
          {field("actualSalesPricePerKg", "Actual sales price/kg", "number")}
          {field("totalSales", "Total sales", "number")}
          {field("pondAttendantName", "Pond attendant name")}
          {field("pondSupervisorName", "Pond supervisor name")}
        </div>

        <h4 className="font-ubuntu mt-(--gap-lg) mb-(--gap-base) text-sm font-semibold text-(--heading-colour)">
          Costs
        </h4>
        <div className="grid grid-cols-1 gap-(--gap-base) sm:grid-cols-2">
          {COST_FIELD_KEYS.map(([key, label]) => field(key, label, "number"))}
        </div>

        <div className="mt-(--gap-base) rounded-xl bg-(--gray-bg) p-(--space-md) text-sm">
          <p>Total production cost: <strong>₦{totalCost.toLocaleString()}</strong></p>
          <p>
            Profit/Loss:{" "}
            <strong className={profitLoss >= 0 ? "text-green-700" : "text-red-700"}>
              ₦{profitLoss.toLocaleString()}
            </strong>
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="font-roboto-slab mt-(--gap-base) w-full rounded-xl bg-(--theme-green-dark) py-(--space-md) text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : harvest ? "Save changes" : "Save harvest record"}
        </button>
      </div>
    </div>
  );
}

function ParameterModal({
  pondId,
  reading,
  onClose,
  onAdded,
}: {
  pondId: string;
  reading?: FarmParameterReading;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [query, setQuery] = useState(reading?.parameterType.name ?? "");
  const [results, setResults] = useState<FarmParameterType[]>([]);
  const [selected, setSelected] = useState<FarmParameterType | null>(reading?.parameterType ?? null);
  const [newCategory, setNewCategory] = useState<"water_quality" | "health">("water_quality");
  const [newUnit, setNewUnit] = useState("");
  const [value, setValue] = useState(reading?.value ?? "");
  const [date, setDate] = useState(toDateInputValue(reading?.date));
  const [saving, setSaving] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    setSelected(null);
    if (!q) {
      setResults([]);
      return;
    }
    try {
      const res = await procurementService.getParameterTypes(q);
      setResults(res.data.parameterTypes);
    } catch {
      // non-fatal
    }
  };

  const handleSave = async () => {
    if (!value || !date) {
      toast.error("Value and date are required.");
      return;
    }
    setSaving(true);
    try {
      if (reading) {
        await procurementService.updateParameterReading(reading.id, { value, date });
        toast.success("Reading updated.");
        onAdded();
        onClose();
        return;
      }

      let parameterType = selected;
      if (!parameterType) {
        if (!query) {
          toast.error("Pick or type a parameter name.");
          setSaving(false);
          return;
        }
        const res = await procurementService.createParameterType({
          name: query,
          unit: newUnit || undefined,
          category: newCategory,
        });
        parameterType = res.data.parameterType;
      }
      await procurementService.createParameterReading(pondId, {
        parameterTypeId: parameterType.id,
        value,
        date,
      });
      toast.success("Reading added.");
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save reading");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-(--white) p-(--space-xl) shadow-xl">
        <div className="mb-(--gap-base) flex items-center justify-between">
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">
            {reading ? "Edit parameter reading" : "Water/health parameter reading"}
          </h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-(--text-colour)" />
          </button>
        </div>
        <div className="flex flex-col gap-(--gap-base)">
          {reading ? (
            <p className="font-roboto-slab text-sm text-(--text-colour)">
              {reading.parameterType.name} {reading.parameterType.unit ? `(${reading.parameterType.unit})` : ""}
            </p>
          ) : (
            <>
              <input
                placeholder="Parameter name (e.g. Nitrite) — type a new one if not listed"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
              />
              {results.length > 0 && !selected && (
                <div className="rounded-xl border border-(--border-gray)">
                  {results.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setSelected(r);
                        setQuery(r.name);
                        setResults([]);
                      }}
                      className="font-roboto-slab block w-full px-(--space-md) py-2 text-left text-sm hover:bg-(--gray-bg)"
                    >
                      {r.name} {r.unit ? `(${r.unit})` : ""} — {r.category.replace("_", " ")}
                    </button>
                  ))}
                </div>
              )}
              {!selected && query && results.length === 0 && (
                <div className="flex gap-2">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as "water_quality" | "health")}
                    className="rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md)"
                  >
                    <option value="water_quality">Water quality</option>
                    <option value="health">Health</option>
                  </select>
                  <input
                    placeholder="Unit (optional, e.g. mg/L)"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="flex-1 rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
                  />
                </div>
              )}
            </>
          )}
          <input
            placeholder="Value (e.g. 0.5, or Positive/Negative)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="font-roboto-slab rounded-xl bg-(--theme-green-dark) py-(--space-md) text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : reading ? "Save changes" : "Add reading"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FarmerRecordsPage() {
  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [farmer, setFarmer] = useState<FoundFarmer | null>(null);
  const [ponds, setPonds] = useState<FarmPond[]>([]);
  const [loadingPonds, setLoadingPonds] = useState(false);

  const [pondModal, setPondModal] = useState<{ mode: "add" } | { mode: "edit"; pond: FarmPond } | null>(null);
  const [stockingModal, setStockingModal] = useState<
    { pondId: string; stocking?: PondStockingRecord } | null
  >(null);
  const [samplingModal, setSamplingModal] = useState<
    { stockingId: string; entry?: PondSamplingEntry } | null
  >(null);
  const [harvestModal, setHarvestModal] = useState<
    { stockingId: string; harvest?: PondHarvestRecord } | null
  >(null);
  const [parameterModal, setParameterModal] = useState<
    { pondId: string; reading?: FarmParameterReading } | null
  >(null);
  const [expandedPondId, setExpandedPondId] = useState<string | null>(null);

  const loadPonds = async (farmerId: string) => {
    setLoadingPonds(true);
    try {
      const res = await procurementService.getFarmerPonds(farmerId);
      setPonds(res.data.ponds);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load ponds");
    } finally {
      setLoadingPonds(false);
    }
  };

  const handleSearch = async () => {
    if (!email) return;
    setSearching(true);
    try {
      const res = await procurementService.findFarmerByEmail(email);
      setFarmer(res.data.farmer);
      void loadPonds(res.data.farmer.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Farmer not found");
      setFarmer(null);
      setPonds([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">Farmer Records</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Log weekly consultancy visits — stocking, sampling, harvest, and water/health parameters — per pond. Every
          entry can be corrected later if something was logged wrong.
        </p>
      </motion.div>

      <div className="flex gap-(--gap-base)">
        <input
          placeholder="Farmer's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="font-roboto-slab flex items-center gap-2 rounded-xl bg-(--theme-green-dark) px-(--space-lg) py-(--space-md) text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <Search size={16} />
          Find farmer
        </button>
      </div>

      {farmer && (
        <div className="rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-lg) shadow-sm">
          <p className="font-ubuntu font-semibold text-(--heading-colour)">{farmer.full_name}</p>
          <p className="font-roboto-slab text-sm text-(--text-colour)">
            {farmer.farm_name ?? "No farm name set"} — {farmer.location_lga}, {farmer.location_state}
          </p>
          <p className="font-roboto-slab text-sm text-(--text-colour)">{farmer.phone_number}</p>

          <div className="mt-(--gap-base) flex items-center justify-between">
            <h2 className="font-ubuntu text-lg font-semibold text-(--heading-colour)">Ponds</h2>
            <button
              onClick={() => setPondModal({ mode: "add" })}
              className="font-roboto-slab flex items-center gap-1 rounded-lg bg-(--theme-green-dark) px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
            >
              <Plus size={14} />
              Add pond
            </button>
          </div>

          {loadingPonds ? (
            <p className="font-roboto-slab mt-(--gap-base) text-sm text-(--text-colour)">Loading ponds...</p>
          ) : ponds.length === 0 ? (
            <EmptyState icon={FlaskConical} title="No ponds yet" description="Add this farmer's first pond to begin logging visits." size="md" />
          ) : (
            <div className="mt-(--gap-base) flex flex-col gap-(--gap-base)">
              {ponds.map((pond) => {
                const activeStocking = pond.stocking?.find((s) => !s.harvest) ?? pond.stocking?.[0];
                const expanded = expandedPondId === pond.id;
                return (
                  <div key={pond.id} className="rounded-xl border border-(--border-gray) p-(--space-md)">
                    <div className="flex items-center justify-between">
                      <p className="font-ubuntu font-semibold text-(--heading-colour)">
                        {pond.pond_type ?? "Pond"} {pond.pond_tank_number ? `#${pond.pond_tank_number}` : ""}
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPondModal({ mode: "edit", pond })}
                          className="font-roboto-slab flex items-center gap-1 text-xs font-medium text-(--heading-colour) hover:underline"
                        >
                          <Pencil size={12} />
                          Edit pond
                        </button>
                        <button
                          onClick={() => setParameterModal({ pondId: pond.id })}
                          className="font-roboto-slab text-xs font-medium text-(--theme-green-dark) hover:underline"
                        >
                          + Water/health reading
                        </button>
                      </div>
                    </div>

                    {(pond.readings?.length ?? 0) > 0 && (
                      <button
                        onClick={() => setExpandedPondId(expanded ? null : pond.id)}
                        className="font-roboto-slab mt-1 text-xs text-(--theme-green-dark) hover:underline"
                      >
                        {pond.readings?.length} parameter reading(s) logged — {expanded ? "hide" : "view & edit"}
                      </button>
                    )}
                    {expanded && (
                      <div className="mt-2 flex flex-col gap-1 rounded-lg bg-(--gray-bg) p-2">
                        {pond.readings?.map((r) => (
                          <div key={r.id} className="flex items-center justify-between text-xs">
                            <span className="font-roboto-slab text-(--text-colour)">
                              {new Date(r.date).toLocaleDateString()} — {r.parameterType.name}: {r.value}
                              {r.parameterType.unit ? ` ${r.parameterType.unit}` : ""}
                            </span>
                            <button
                              onClick={() => setParameterModal({ pondId: pond.id, reading: r })}
                              className="font-roboto-slab flex items-center gap-1 text-(--heading-colour) hover:underline"
                            >
                              <Pencil size={11} />
                              Edit
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeStocking ? (
                      <div className="mt-2 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p className="font-roboto-slab text-sm text-(--text-colour)">
                            Stocked {new Date(activeStocking.date_of_stocking).toLocaleDateString()} —{" "}
                            {activeStocking.species ?? "species n/a"}
                            {activeStocking.harvest ? " (harvested)" : ""}
                          </p>
                          <button
                            onClick={() => setStockingModal({ pondId: pond.id, stocking: activeStocking })}
                            className="font-roboto-slab flex items-center gap-1 text-xs font-medium text-(--heading-colour) hover:underline"
                          >
                            <Pencil size={11} />
                            Edit
                          </button>
                        </div>

                        {(activeStocking.sampling?.length ?? 0) > 0 && (
                          <div className="flex flex-col gap-1 rounded-lg bg-(--gray-bg) p-2">
                            {activeStocking.sampling?.map((s) => (
                              <div key={s.id} className="flex items-center justify-between text-xs">
                                <span className="font-roboto-slab text-(--text-colour)">
                                  {new Date(s.date).toLocaleDateString()}
                                  {s.avg_body_weight_g != null ? ` — ${s.avg_body_weight_g}g avg` : ""}
                                </span>
                                <button
                                  onClick={() => setSamplingModal({ stockingId: activeStocking.id, entry: s })}
                                  className="font-roboto-slab flex items-center gap-1 text-(--heading-colour) hover:underline"
                                >
                                  <Pencil size={11} />
                                  Edit
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {activeStocking.harvest ? (
                          <button
                            onClick={() =>
                              setHarvestModal({ stockingId: activeStocking.id, harvest: activeStocking.harvest! })
                            }
                            className="font-roboto-slab mt-1 flex w-fit items-center gap-1 rounded-lg border border-(--border-gray) px-3 py-1.5 text-xs font-medium text-(--heading-colour) transition hover:bg-(--gray-bg)"
                          >
                            <Pencil size={11} />
                            Edit harvest record
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSamplingModal({ stockingId: activeStocking.id })}
                              className="font-roboto-slab rounded-lg border border-(--border-gray) px-3 py-1.5 text-xs font-medium text-(--heading-colour) transition hover:bg-(--gray-bg)"
                            >
                              + Sampling entry
                            </button>
                            <button
                              onClick={() => setHarvestModal({ stockingId: activeStocking.id })}
                              className="font-roboto-slab rounded-lg border border-(--border-gray) px-3 py-1.5 text-xs font-medium text-(--heading-colour) transition hover:bg-(--gray-bg)"
                            >
                              Close with harvest
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setStockingModal({ pondId: pond.id })}
                        className="font-roboto-slab mt-2 rounded-lg border border-(--border-gray) px-3 py-1.5 text-xs font-medium text-(--heading-colour) transition hover:bg-(--gray-bg)"
                      >
                        Start stocking cycle
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {pondModal && farmer && (
        <PondModal
          farmerId={farmer.id}
          pond={pondModal.mode === "edit" ? pondModal.pond : undefined}
          onClose={() => setPondModal(null)}
          onAdded={() => loadPonds(farmer.id)}
        />
      )}
      {stockingModal && (
        <StockingModal
          pondId={stockingModal.pondId}
          stocking={stockingModal.stocking}
          onClose={() => setStockingModal(null)}
          onAdded={() => farmer && loadPonds(farmer.id)}
        />
      )}
      {samplingModal && (
        <SamplingModal
          stockingId={samplingModal.stockingId}
          entry={samplingModal.entry}
          onClose={() => setSamplingModal(null)}
          onAdded={() => farmer && loadPonds(farmer.id)}
        />
      )}
      {harvestModal && (
        <HarvestModal
          stockingId={harvestModal.stockingId}
          harvest={harvestModal.harvest}
          onClose={() => setHarvestModal(null)}
          onAdded={() => farmer && loadPonds(farmer.id)}
        />
      )}
      {parameterModal && (
        <ParameterModal
          pondId={parameterModal.pondId}
          reading={parameterModal.reading}
          onClose={() => setParameterModal(null)}
          onAdded={() => farmer && loadPonds(farmer.id)}
        />
      )}
    </div>
  );
}
