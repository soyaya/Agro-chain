"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, FlaskConical, X } from "lucide-react";
import { toast } from "sonner";
import {
  procurementService,
  type FarmPond,
  type FarmParameterType,
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

function AddPondModal({ farmerId, onClose, onAdded }: { farmerId: string; onClose: () => void; onAdded: () => void }) {
  const [pondType, setPondType] = useState("");
  const [pondTankNumber, setPondTankNumber] = useState("");
  const [pondDimensionM3, setPondDimensionM3] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await procurementService.createPond(farmerId, {
        pondType: pondType || undefined,
        pondTankNumber: pondTankNumber || undefined,
        pondDimensionM3: pondDimensionM3 ? Number(pondDimensionM3) : undefined,
      });
      toast.success("Pond added.");
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add pond");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-(--white) p-(--space-xl) shadow-xl">
        <div className="mb-(--gap-base) flex items-center justify-between">
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">Add a pond</h3>
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
            {saving ? "Saving..." : "Add pond"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StockingModal({ pondId, onClose, onAdded }: { pondId: string; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({
    dateOfStocking: "",
    species: "",
    numberOfFishStocked: "",
    stockingDensityPerM2: "",
    averageWeightStockedG: "",
    totalBiomassKg: "",
    sourceOfSeedling: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.dateOfStocking) {
      toast.error("Date of stocking is required.");
      return;
    }
    setSaving(true);
    try {
      await procurementService.createStockingRecord(pondId, {
        dateOfStocking: form.dateOfStocking,
        species: form.species || undefined,
        numberOfFishStocked: form.numberOfFishStocked ? Number(form.numberOfFishStocked) : undefined,
        stockingDensityPerM2: form.stockingDensityPerM2 ? Number(form.stockingDensityPerM2) : undefined,
        averageWeightStockedG: form.averageWeightStockedG ? Number(form.averageWeightStockedG) : undefined,
        totalBiomassKg: form.totalBiomassKg ? Number(form.totalBiomassKg) : undefined,
        sourceOfSeedling: form.sourceOfSeedling || undefined,
      });
      toast.success("Stocking cycle started.");
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start stocking cycle");
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
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">New stocking cycle</h3>
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
            {saving ? "Saving..." : "Start cycle"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SamplingModal({ stockingId, onClose, onAdded }: { stockingId: string; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({
    date: "",
    avgBodyWeightG: "",
    dailyFeedFedKg: "",
    cumulativeFeedFedKg: "",
    feedBrand: "",
    feedSize: "",
    mortalityCount: "",
    mortalityWeightG: "",
    estimatedStockBalance: "",
    otherManagementPractices: "",
    remarks: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.date) {
      toast.error("Date is required.");
      return;
    }
    setSaving(true);
    try {
      await procurementService.createSamplingEntry(stockingId, {
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
      });
      toast.success("Sampling entry added.");
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add sampling entry");
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
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">Weekly sampling entry</h3>
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
            {saving ? "Saving..." : "Add entry"}
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

function HarvestModal({ stockingId, onClose, onAdded }: { stockingId: string; onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState<Record<string, string>>({ dateOfHarvest: "", totalSales: "" });
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
      await procurementService.createHarvestRecord(stockingId, payload);
      toast.success("Harvest record saved.");
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
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">Harvest record</h3>
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
          {saving ? "Saving..." : "Save harvest record"}
        </button>
      </div>
    </div>
  );
}

function ParameterModal({ pondId, onClose, onAdded }: { pondId: string; onClose: () => void; onAdded: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FarmParameterType[]>([]);
  const [selected, setSelected] = useState<FarmParameterType | null>(null);
  const [newCategory, setNewCategory] = useState<"water_quality" | "health">("water_quality");
  const [newUnit, setNewUnit] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
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
      toast.error(error instanceof Error ? error.message : "Failed to add reading");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-(--white) p-(--space-xl) shadow-xl">
        <div className="mb-(--gap-base) flex items-center justify-between">
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">Water/health parameter reading</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-(--text-colour)" />
          </button>
        </div>
        <div className="flex flex-col gap-(--gap-base)">
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
            {saving ? "Saving..." : "Add reading"}
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

  const [addPondOpen, setAddPondOpen] = useState(false);
  const [stockingPondId, setStockingPondId] = useState<string | null>(null);
  const [samplingStockingId, setSamplingStockingId] = useState<string | null>(null);
  const [harvestStockingId, setHarvestStockingId] = useState<string | null>(null);
  const [parameterPondId, setParameterPondId] = useState<string | null>(null);

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
          Log weekly consultancy visits — stocking, sampling, harvest, and water/health parameters — per pond.
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
              onClick={() => setAddPondOpen(true)}
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
                return (
                  <div key={pond.id} className="rounded-xl border border-(--border-gray) p-(--space-md)">
                    <div className="flex items-center justify-between">
                      <p className="font-ubuntu font-semibold text-(--heading-colour)">
                        {pond.pond_type ?? "Pond"} {pond.pond_tank_number ? `#${pond.pond_tank_number}` : ""}
                      </p>
                      <button
                        onClick={() => setParameterPondId(pond.id)}
                        className="font-roboto-slab text-xs font-medium text-(--theme-green-dark) hover:underline"
                      >
                        + Water/health reading
                      </button>
                    </div>
                    <p className="font-roboto-slab text-xs text-(--text-colour)">
                      {pond.readings?.length ?? 0} parameter reading(s) logged
                    </p>

                    {activeStocking ? (
                      <div className="mt-2 flex flex-col gap-1">
                        <p className="font-roboto-slab text-sm text-(--text-colour)">
                          Stocked {new Date(activeStocking.date_of_stocking).toLocaleDateString()} —{" "}
                          {activeStocking.species ?? "species n/a"}
                          {activeStocking.harvest ? " (harvested)" : ""}
                        </p>
                        <p className="font-roboto-slab text-xs text-(--text-colour)">
                          {activeStocking.sampling?.length ?? 0} sampling entries
                        </p>
                        {!activeStocking.harvest && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSamplingStockingId(activeStocking.id)}
                              className="font-roboto-slab rounded-lg border border-(--border-gray) px-3 py-1.5 text-xs font-medium text-(--heading-colour) transition hover:bg-(--gray-bg)"
                            >
                              + Sampling entry
                            </button>
                            <button
                              onClick={() => setHarvestStockingId(activeStocking.id)}
                              className="font-roboto-slab rounded-lg border border-(--border-gray) px-3 py-1.5 text-xs font-medium text-(--heading-colour) transition hover:bg-(--gray-bg)"
                            >
                              Close with harvest
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setStockingPondId(pond.id)}
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

      {addPondOpen && farmer && (
        <AddPondModal farmerId={farmer.id} onClose={() => setAddPondOpen(false)} onAdded={() => loadPonds(farmer.id)} />
      )}
      {stockingPondId && (
        <StockingModal
          pondId={stockingPondId}
          onClose={() => setStockingPondId(null)}
          onAdded={() => farmer && loadPonds(farmer.id)}
        />
      )}
      {samplingStockingId && (
        <SamplingModal
          stockingId={samplingStockingId}
          onClose={() => setSamplingStockingId(null)}
          onAdded={() => farmer && loadPonds(farmer.id)}
        />
      )}
      {harvestStockingId && (
        <HarvestModal
          stockingId={harvestStockingId}
          onClose={() => setHarvestStockingId(null)}
          onAdded={() => farmer && loadPonds(farmer.id)}
        />
      )}
      {parameterPondId && (
        <ParameterModal
          pondId={parameterPondId}
          onClose={() => setParameterPondId(null)}
          onAdded={() => farmer && loadPonds(farmer.id)}
        />
      )}
    </div>
  );
}
