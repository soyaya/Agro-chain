"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { farmerService } from "~/lib/services/farmer.service";
import type { FarmPond } from "~/lib/services/procurement.service";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

export default function FarmRecordsPage() {
  const [ponds, setPonds] = useState<FarmPond[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    farmerService
      .getMyPonds()
      .then((res) => {
        if (mounted) setPonds(res.data.ponds);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Failed to load farm records");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState message="Loading your farm records..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">Farm Records</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Logged by your procurement officer during consultancy visits — read-only.
        </p>
      </motion.div>

      {ponds.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No records yet"
          description="Once a procurement officer logs a visit, your pond history will show up here."
          size="lg"
        />
      ) : (
        <div className="flex flex-col gap-(--gap-lg)">
          {ponds.map((pond) => (
            <div key={pond.id} className="rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-lg) shadow-sm">
              <p className="font-ubuntu text-lg font-semibold text-(--heading-colour)">
                {pond.pond_type ?? "Pond"} {pond.pond_tank_number ? `#${pond.pond_tank_number}` : ""}
              </p>
              <p className="font-roboto-slab text-sm text-(--text-colour)">
                {pond.pond_dimension_m3 ? `${pond.pond_dimension_m3} m³` : "Dimension not set"}
              </p>

              {(pond.stocking ?? []).length === 0 ? (
                <p className="font-roboto-slab mt-(--gap-base) text-sm text-(--text-colour)">No stocking cycles yet.</p>
              ) : (
                <div className="mt-(--gap-base) flex flex-col gap-(--gap-base)">
                  {pond.stocking!.map((s) => (
                    <div key={s.id} className="rounded-xl bg-(--gray-bg) p-(--space-md)">
                      <p className="font-ubuntu text-sm font-semibold text-(--heading-colour)">
                        Stocked {new Date(s.date_of_stocking).toLocaleDateString()} — {s.species ?? "species n/a"}
                      </p>
                      <p className="font-roboto-slab text-xs text-(--text-colour)">
                        {s.number_of_fish_stocked ?? "?"} fish, avg {s.average_weight_stocked_g ?? "?"}g
                      </p>

                      {(s.sampling ?? []).length > 0 && (
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-(--text-colour)">
                                <th className="pr-3">Date</th>
                                <th className="pr-3">Avg wt (g)</th>
                                <th className="pr-3">Feed/day (kg)</th>
                                <th className="pr-3">Mortality</th>
                              </tr>
                            </thead>
                            <tbody>
                              {s.sampling!.map((entry) => (
                                <tr key={entry.id}>
                                  <td className="pr-3">{new Date(entry.date).toLocaleDateString()}</td>
                                  <td className="pr-3">{entry.avg_body_weight_g ?? "—"}</td>
                                  <td className="pr-3">{entry.daily_feed_fed_kg ?? "—"}</td>
                                  <td className="pr-3">{entry.mortality_count ?? "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {s.harvest && (
                        <div className="mt-2 rounded-lg bg-(--white) p-2 text-xs">
                          <p>
                            Harvested {new Date(s.harvest.date_of_harvest).toLocaleDateString()} —{" "}
                            {s.harvest.total_biomass_harvested_kg ?? "?"}kg, survival {s.harvest.survival_rate_pct ?? "?"}%
                          </p>
                          <p className={Number(s.harvest.profit_loss) >= 0 ? "text-green-700" : "text-red-700"}>
                            Profit/Loss: ₦{Number(s.harvest.profit_loss).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(pond.readings ?? []).length > 0 && (
                <div className="mt-(--gap-base)">
                  <p className="font-ubuntu text-sm font-semibold text-(--heading-colour)">Water/health readings</p>
                  <div className="mt-1 flex flex-col gap-1">
                    {pond.readings!.map((r) => (
                      <p key={r.id} className="font-roboto-slab text-xs text-(--text-colour)">
                        {new Date(r.date).toLocaleDateString()} — {r.parameterType.name}: {r.value}
                        {r.parameterType.unit ? ` ${r.parameterType.unit}` : ""}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
