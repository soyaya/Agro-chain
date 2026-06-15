"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  X,
  CheckCircle,
  XCircle,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { adminService, type AdminUser } from "~/lib/services/admin.service";
import { FADE_IN_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

// === Role badge

const ROLE_STYLES: Record<string, string> = {
  farmer: "bg-green-tint text-theme-green-dark border-gray-border",
  cluster: "bg-blue-50 text-blue-700 border-blue-200",
  buyer: "bg-purple-50 text-purple-700 border-purple-200",
  admin: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-gray-bg text-text-colour border-gray-border",
};

const VERIFICATION_STYLES: Record<string, string> = {
  verified: "text-theme-green-dark",
  pending: "text-yellow-600",
  unverified: "text-muted-text",
  rejected: "text-red-600",
};

// === Detail Slide-over

interface UserDetailProps {
  user: AdminUser | null;
  onClose: () => void;
  onToggleActive: (id: string, current: boolean) => void;
  toggling: boolean;
}

function UserDetailSlideOver({
  user,
  onClose,
  onToggleActive,
  toggling,
}: UserDetailProps) {
  return (
    <AnimatePresence>
      {user && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-(--white) shadow-2xl"
          >
            {/* Header */}
            <div className="border-gray-border flex items-center justify-between border-b p-(--space-xl)">
              <h2 className="font-ubuntu text-heading-colour text-xl font-bold">
                User Profile
              </h2>
              <button
                onClick={onClose}
                className="text-muted-text hover:bg-gray-bg rounded-full p-1 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-(--space-xl)">
              {/* Name + role */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-ubuntu text-heading-colour text-2xl font-bold">
                    {user.full_name}
                  </h3>
                  <p className="font-roboto-slab text-text-colour text-sm">
                    {user.phone_number}
                  </p>
                  {user.email && (
                    <p className="font-roboto-slab text-text-colour text-sm">
                      {user.email}
                    </p>
                  )}
                </div>
                <span
                  className={`font-roboto-slab rounded-full border px-3 py-1 text-xs font-medium capitalize ${ROLE_STYLES[user.role] ?? ROLE_STYLES.pending}`}
                >
                  {user.role}
                </span>
              </div>

              {/* Details grid */}
              <div className="border-gray-border grid grid-cols-2 gap-4 rounded-2xl border p-4">
                {[
                  ["Location", `${user.location_lga}, ${user.location_state}`],
                  ["Verification", user.verification_status],
                  ["Farm Name", user.farm_name ?? "-"],
                  ["Business Name", user.business_name ?? "-"],
                  ["Cluster Farmer", user.is_cluster_farmer ? "Yes" : "No"],
                  ["Cluster Approved", user.cluster_approved ? "Yes" : "No"],
                  [
                    "Joined",
                    new Date(user.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  ],
                  ["Status", user.is_active ? "Active" : "Inactive"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="font-roboto-slab text-muted-text text-xs">
                      {label}
                    </p>
                    <p
                      className={`font-roboto-slab text-sm font-medium capitalize ${
                        label === "Verification"
                          ? VERIFICATION_STYLES[value ?? "unverified"]
                          : "text-heading-colour"
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Toggle active */}
              <button
                onClick={() => onToggleActive(user.id, user.is_active)}
                disabled={toggling}
                className={`font-roboto-slab flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                  user.is_active
                    ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-gray-border bg-green-tint text-theme-green-dark hover:bg-green-tint border"
                }`}
              >
                {user.is_active ? (
                  <ToggleLeft size={18} />
                ) : (
                  <ToggleRight size={18} />
                )}
                {toggling
                  ? "Updating..."
                  : user.is_active
                    ? "Deactivate Account"
                    : "Activate Account"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// === Page

type RoleFilter = "all" | "farmer" | "cluster" | "buyer";

export default function AdminFarmersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response = await adminService.getFarmers();
        if (mounted) setUsers(response.data.users ?? []);
      } catch (error) {
        if (mounted)
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load users",
          );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    setToggling(true);
    try {
      await adminService.toggleUserActive(id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, is_active: !currentlyActive } : u,
        ),
      );
      if (selectedUser?.id === id)
        setSelectedUser((prev) =>
          prev ? { ...prev, is_active: !currentlyActive } : null,
        );
      toast.success(
        currentlyActive ? "Account deactivated." : "Account activated.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update account",
      );
    } finally {
      setToggling(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch =
      !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone_number.includes(search) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = {
    all: users.length,
    farmer: users.filter((u) => u.role === "farmer").length,
    cluster: users.filter((u) => u.role === "cluster").length,
    buyer: users.filter((u) => u.role === "buyer").length,
  };

  if (loading) return <LoadingState message="Loading users..." size="lg" />;

  if (errorMessage) {
    return (
      <EmptyState
        icon={Users}
        title="Unable to load users"
        description={errorMessage}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
        size="lg"
      />
    );
  }

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-ubuntu text-heading-colour mb-2 text-3xl font-bold">
            User Management
          </h1>
          <p className="font-roboto-slab text-text-colour">
            View and manage all platform users.
          </p>
        </div>
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search
            size={16}
            className="text-muted-text absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="font-roboto-slab focus:border-gray-border border-input-border h-10 w-full rounded-xl border pr-4 pl-9 text-sm transition outline-none"
          />
        </div>
      </motion.div>

      {/* Role filter tabs */}
      <motion.div
        variants={FADE_IN_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-(--gap-base) sm:grid-cols-4"
      >
        {(["all", "farmer", "cluster", "buyer"] as const).map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`flex flex-col gap-1 rounded-2xl border p-(--space-md) transition-all duration-200 ${
              roleFilter === role
                ? "border-theme-green-dark bg-green-tint"
                : "border-gray-border hover:bg-pink-bg bg-(--white)"
            }`}
          >
            <span className="font-ubuntu text-heading-colour text-xl font-bold">
              {counts[role]}
            </span>
            <span className="font-roboto-slab text-text-colour text-xs capitalize">
              {role === "all"
                ? "All Users"
                : role === "cluster"
                  ? "Cluster Farmers"
                  : role + "s"}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Table */}
      {filtered.length > 0 ? (
        <motion.div
          variants={FADE_IN_VARIANT}
          initial="hidden"
          animate="visible"
          className="border-gray-border overflow-hidden rounded-2xl border bg-(--white) shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-gray-border bg-pink-bg border-b">
                <tr>
                  {[
                    "Name",
                    "Phone",
                    "Role",
                    "Location",
                    "Verification",
                    "Status",
                    "Joined",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="font-roboto-slab text-text-colour px-4 py-3 text-left text-xs font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-border-gray divide-y">
                {filtered.map((user) => (
                  <motion.tr
                    key={user.id}
                    variants={FADE_IN_VARIANT}
                    className="hover:bg-pink-bg transition"
                  >
                    <td className="px-4 py-3">
                      <p className="font-roboto-slab text-heading-colour text-sm font-medium">
                        {user.full_name}
                      </p>
                      {user.email && (
                        <p className="font-roboto-slab text-muted-text text-xs">
                          {user.email}
                        </p>
                      )}
                    </td>
                    <td className="font-roboto-slab text-text-colour px-4 py-3 text-sm">
                      {user.phone_number}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-roboto-slab rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${ROLE_STYLES[user.role] ?? ROLE_STYLES.pending}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="font-roboto-slab text-text-colour px-4 py-3 text-sm">
                      {user.location_lga}, {user.location_state}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-roboto-slab text-xs font-medium capitalize ${VERIFICATION_STYLES[user.verification_status]}`}
                      >
                        {user.verification_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-roboto-slab flex w-fit items-center gap-1 text-xs font-medium ${user.is_active ? "text-theme-green-dark" : "text-muted-text"}`}
                      >
                        {user.is_active ? (
                          <CheckCircle size={13} />
                        ) : (
                          <XCircle size={13} />
                        )}
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="font-roboto-slab text-muted-text px-4 py-3 text-xs">
                      {new Date(user.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="font-roboto-slab border-gray-border text-heading-colour hover:bg-pink-bg flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition"
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <EmptyState
          icon={Users}
          title="No users found"
          description={
            search
              ? "No users match your search."
              : `No ${roleFilter === "all" ? "" : roleFilter} users yet.`
          }
          size="lg"
        />
      )}

      <UserDetailSlideOver
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onToggleActive={handleToggleActive}
        toggling={toggling}
      />
    </div>
  );
}
