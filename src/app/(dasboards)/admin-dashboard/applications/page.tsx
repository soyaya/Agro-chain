"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { adminService, type AdminClusterApplication } from "~/lib/services/admin.service";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminClusterApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await adminService.getClusterApplications();
        if (mounted) setApplications(response.data.applications);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load applications");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await adminService.approveClusterApplication(id);
      } else {
        await adminService.rejectClusterApplication(id);
      }
      setApplications((prev) => prev.filter((application) => application.id !== id));
      toast.success(action === "approve" ? "Application approved" : "Application rejected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  };

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <div>
        <h1 className="font-ubuntu text-3xl font-bold text-(--heading-colour)">Cluster Applications</h1>
        <p className="font-roboto-slab text-(--text-colour)">Review and decide on new cluster farmer applications.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 text-(--text-colour)">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 text-(--text-colour)">No pending applications.</div>
      ) : (
        <motion.div variants={STAGGER_CONTAINER_VARIANT} initial="hidden" animate="visible" className="grid gap-4">
          {applications.map((application) => (
            <motion.div key={application.id} variants={SLIDE_UP_VARIANT} className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-ubuntu text-xl font-semibold text-(--heading-colour)">{application.full_name}</h2>
                  <p className="text-sm text-(--text-colour)">{application.phone_number}</p>
                  <p className="text-sm text-(--text-colour)">{application.location_lga}, {application.location_state}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => void handleAction(application.id, "approve")} className="rounded-xl bg-(--theme-green-dark) px-4 py-2 text-sm text-white">Approve</button>
                  <button onClick={() => void handleAction(application.id, "reject")} className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600">Reject</button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
