"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X,
  FileText,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Package,
  Truck,
} from "lucide-react";
import { adminService, type AdminClusterApplication } from "~/lib/services/admin.service";
import { STAGGER_CONTAINER_VARIANT, SLIDE_UP_VARIANT } from "~/types/constants";

const DOC_LABELS: { key: keyof AdminClusterApplication; label: string }[] = [
  { key: "bvn_doc_url", label: "BVN Verification" },
  { key: "proof_of_address_url", label: "Proof of Address" },
  { key: "cac_registration_url", label: "CAC Registration" },
  { key: "business_license_url", label: "Business License" },
  { key: "tax_clearance_url", label: "Tax Clearance" },
];

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-text-colour text-xs">{label}</span>
      <span className="font-roboto-slab text-heading-colour text-sm font-medium">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
      </span>
    </div>
  );
}

function ApplicationDrawer({
  application,
  onClose,
  onAction,
}: {
  application: AdminClusterApplication;
  onClose: () => void;
  onAction: (id: string, action: "approve" | "reject") => Promise<void>;
}) {
  const [acting, setActing] = useState<"approve" | "reject" | null>(null);

  const handle = async (action: "approve" | "reject") => {
    setActing(action);
    await onAction(application.id, action);
    setActing(null);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="relative flex h-full w-full max-w-lg flex-col overflow-hidden bg-(--white) shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-input-border flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-ubuntu text-heading-colour text-xl font-bold">
              {application.full_name}
            </h2>
            <p className="font-roboto-slab text-text-colour text-sm">Cluster Farmer Application</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X size={20} className="text-text-colour" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
          {/* Personal Info */}
          <section className="flex flex-col gap-3">
            <h3 className="font-ubuntu text-text-colour text-sm font-semibold tracking-wide uppercase">
              Personal Information
            </h3>
            <div className="border-input-border grid grid-cols-2 gap-4 rounded-xl border bg-gray-50 p-4">
              <div className="col-span-2 flex items-center gap-2">
                <User size={14} className="text-text-colour" />
                <DetailRow label="Full Name" value={application.full_name} />
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-text-colour" />
                <DetailRow label="Email" value={application.email} />
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-text-colour" />
                <DetailRow label="Phone" value={application.phone_number} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <MapPin size={14} className="text-text-colour" />
                <DetailRow
                  label="Location"
                  value={`${application.location_lga}, ${application.location_state}`}
                />
              </div>
              {application.location_address && application.location_address !== "N/A" && (
                <div className="col-span-2">
                  <DetailRow label="Address" value={application.location_address} />
                </div>
              )}
            </div>
          </section>

          {/* Farming Info */}
          <section className="flex flex-col gap-3">
            <h3 className="font-ubuntu text-text-colour text-sm font-semibold tracking-wide uppercase">
              Farming Details
            </h3>
            <div className="border-input-border grid grid-cols-2 gap-4 rounded-xl border bg-gray-50 p-4">
              <DetailRow label="Fish Type" value={application.fish_type_preference} />
              <DetailRow
                label="Farming Capacity"
                value={
                  application.farming_capacity_kg ? `${application.farming_capacity_kg} kg` : null
                }
              />
              <DetailRow
                label="Years of Experience"
                value={
                  application.years_of_experience ? `${application.years_of_experience} yrs` : null
                }
              />
            </div>
          </section>

          {/* Business Info */}
          <section className="flex flex-col gap-3">
            <h3 className="font-ubuntu text-text-colour text-sm font-semibold tracking-wide uppercase">
              Business Details
            </h3>
            <div className="border-input-border grid grid-cols-2 gap-4 rounded-xl border bg-gray-50 p-4">
              <div className="col-span-2 flex items-center gap-2">
                <Briefcase size={14} className="text-text-colour" />
                <DetailRow label="Business Name" value={application.business_name} />
              </div>
              <DetailRow label="CAC Number" value={application.cac_number} />
              <div className="col-span-2 flex items-center gap-2">
                <MapPin size={14} className="text-text-colour" />
                <DetailRow label="Warehouse Location" value={application.warehouse_location} />
              </div>
              <div className="flex items-center gap-2">
                <Package size={14} className="text-text-colour" />
                <DetailRow
                  label="Distribution Capacity"
                  value={
                    application.distribution_capacity
                      ? `${application.distribution_capacity} kg`
                      : null
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-text-colour" />
                <DetailRow label="Has Logistics" value={application.logistics_available} />
              </div>
            </div>
          </section>

          {/* Documents */}
          <section className="flex flex-col gap-3">
            <h3 className="font-ubuntu text-text-colour text-sm font-semibold tracking-wide uppercase">
              Uploaded Documents
            </h3>
            <div className="flex flex-col gap-2">
              {DOC_LABELS.map(({ key, label }) => {
                const url = application[key] as string | null;
                return (
                  <div
                    key={key}
                    className="border-input-border flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} className={url ? "text-green-600" : "text-gray-400"} />
                      <span className="font-roboto-slab text-heading-colour text-sm">{label}</span>
                    </div>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-roboto-slab text-theme-green-dark text-xs underline underline-offset-2 hover:opacity-80"
                      >
                        View
                      </a>
                    ) : (
                      <span className="font-roboto-slab text-xs text-gray-400">Not uploaded</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <p className="font-roboto-slab text-text-colour text-xs">
            Applied:{" "}
            {new Date(application.created_at).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="border-input-border flex gap-3 border-t px-6 py-4">
          <button
            onClick={() => void handle("reject")}
            disabled={!!acting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <XCircle size={16} />
            {acting === "reject" ? "Rejecting..." : "Reject"}
          </button>
          <button
            onClick={() => void handle("approve")}
            disabled={!!acting}
            className="bg-theme-green-dark flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <CheckCircle size={16} />
            {acting === "approve" ? "Approving..." : "Approve"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminClusterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminClusterApplication | null>(null);

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
      setApplications((prev) => prev.filter((a) => a.id !== id));
      toast.success(action === "approve" ? "Application approved" : "Application rejected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  };

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <div>
        <h1 className="font-ubuntu text-heading-colour text-3xl font-bold">Cluster Applications</h1>
        <p className="font-roboto-slab text-text-colour">
          Review and decide on new cluster farmer applications.
        </p>
      </div>

      {loading ? (
        <div className="border-gray-border text-text-colour rounded-2xl border bg-(--white) p-6">
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="border-gray-border text-text-colour rounded-2xl border bg-(--white) p-6">
          No pending applications.
        </div>
      ) : (
        <motion.div
          variants={STAGGER_CONTAINER_VARIANT}
          initial="hidden"
          animate="visible"
          className="grid gap-3"
        >
          {applications.map((application) => {
            const initials = application.full_name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() ?? "")
              .join("");
            const appliedDate = new Date(application.created_at).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <motion.div
                key={application.id}
                variants={SLIDE_UP_VARIANT}
                onClick={() => setSelected(application)}
                className="border-gray-border hover:border-theme-green-dark cursor-pointer rounded-2xl border bg-(--white) p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-semibold text-green-800">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="font-ubuntu text-heading-colour text-base font-semibold">
                          {application.full_name}
                        </h2>
                        <p className="font-roboto-slab text-text-colour text-sm">
                          {application.phone_number} · {application.location_lga},{" "}
                          {application.location_state}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        Pending
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      {application.business_name && (
                        <span className="font-roboto-slab text-theme-green-dark text-sm font-medium">
                          {application.business_name}
                        </span>
                      )}
                      {application.fish_type_preference && (
                        <span className="font-roboto-slab text-text-colour text-xs">
                          {application.fish_type_preference}
                        </span>
                      )}
                      <span className="font-roboto-slab text-text-colour text-xs">
                        Applied {appliedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                  <span className="font-roboto-slab text-text-colour mr-auto text-xs">
                    Click card to view full details
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleAction(application.id, "approve");
                    }}
                    className="bg-theme-green-dark rounded-xl px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleAction(application.id, "reject");
                    }}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {selected && (
          <ApplicationDrawer
            application={selected}
            onClose={() => setSelected(null)}
            onAction={handleAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
