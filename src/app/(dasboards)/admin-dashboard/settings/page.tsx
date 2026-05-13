"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Shield, Bell } from "lucide-react";
import { toast } from "sonner";
import { authService, type BackendUser } from "~/lib/services/auth.service";
import { DynamicInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { LoadingState } from "~/components/ui/LoadingState";
import { FADE_IN_VARIANT } from "~/types/constants";

export default function AdminSettingsPage() {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await authService.getMe();
        if (mounted) setUser(res.data.user);
      } catch {
        // silently fail — settings still renders
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState message="Loading settings..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">Settings</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Manage your admin account and platform configuration.
        </p>
      </motion.div>

      {/* Admin Profile */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
            <User size={20} className="text-(--theme-green-dark)" />
          </div>
          <h2 className="font-ubuntu text-xl font-semibold text-(--heading-colour)">
            Admin Profile
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DynamicInput label="Full Name" value={user?.full_name ?? ""} disabled />
          <DynamicInput label="Email" fieldType="email" value={user?.email ?? ""} disabled />
          <DynamicInput label="Phone" fieldType="tel" value={user?.phone_number ?? ""} disabled />
          <div className="flex flex-col gap-1.5">
            <label className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
              Role
            </label>
            <div className="flex h-10 items-center rounded-lg border border-(--border-input) bg-gray-50 px-3">
              <span className="font-roboto-slab text-sm text-(--text-colour) capitalize">
                {user?.role ?? "admin"}
              </span>
            </div>
          </div>
        </div>

        <p className="font-roboto-slab mt-4 text-xs text-gray-400">
          Admin profile updates are managed directly in the database. Contact a super admin to make
          changes.
        </p>
      </motion.div>

      {/* Platform Config */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <Settings size={20} className="text-blue-600" />
          </div>
          <h2 className="font-ubuntu text-xl font-semibold text-(--heading-colour)">
            Platform Configuration
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            ["OTP Expiry", "10 minutes"],
            ["Session Duration", "7 days"],
            ["Payout Delay", "48 hours after delivery confirmation"],
            ["Max Resend Attempts", "2 per OTP"],
            ["Cluster Re-application Window", "6 months"],
            ["Listing Expiry", "30 days"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-(--border-gray) p-4">
              <p className="font-roboto-slab text-xs text-gray-400">{label}</p>
              <p className="font-roboto-slab mt-1 text-sm font-medium text-(--heading-colour)">
                {value}
              </p>
            </div>
          ))}
        </div>

        <p className="font-roboto-slab mt-4 text-xs text-gray-400">
          These values are currently hardcoded in the backend. A configuration API endpoint is
          needed to make them editable here.
        </p>
      </motion.div>

      {/* Security */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-xl) shadow-sm"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <Shield size={20} className="text-red-600" />
          </div>
          <h2 className="font-ubuntu text-xl font-semibold text-(--heading-colour)">Security</h2>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl border border-(--border-gray) p-4">
            <div>
              <p className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                Active Sessions
              </p>
              <p className="font-roboto-slab text-xs text-gray-400">
                Manage all active login sessions for your account
              </p>
            </div>
            <button
              onClick={() => toast.info("Session management coming soon.")}
              className="font-roboto-slab rounded-xl border border-(--border-gray) px-4 py-2 text-sm text-(--text-colour) transition hover:bg-(--bg-pink)"
            >
              View Sessions
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">
            <div>
              <p className="font-roboto-slab text-sm font-medium text-red-800">
                Logout All Devices
              </p>
              <p className="font-roboto-slab text-xs text-red-600">
                Invalidates all active sessions across all devices
              </p>
            </div>
            <button
              onClick={() => toast.info("Use the logout button in the nav to log out.")}
              className="font-roboto-slab rounded-xl border border-red-200 bg-(--white) px-4 py-2 text-sm text-red-600 transition hover:bg-red-100"
            >
              Logout All
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
