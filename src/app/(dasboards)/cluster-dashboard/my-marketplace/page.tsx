"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Store, Plus, Trash2, Pencil, X, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  clusterService,
  type EligibleMarketplaceListing,
  type ClusterMarketplaceRow,
  type ClusterBuyer,
} from "~/lib/services/cluster.service";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { LoadingState } from "~/components/ui/LoadingState";
import { EmptyState } from "~/components/ui/EmptyState";

function AddListingModal({
  listing,
  onClose,
  onAdded,
}: {
  listing: EligibleMarketplaceListing;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [price, setPrice] = useState(String(listing.basePricePerFish));
  const [submitting, setSubmitting] = useState(false);

  const markup = Math.max(0, Number(price) - listing.basePricePerFish);

  const handleSubmit = async () => {
    const value = Number(price);
    if (!(value >= listing.basePricePerFish)) {
      toast.error("Your price can't be lower than the base price.");
      return;
    }
    setSubmitting(true);
    try {
      await clusterService.addToMyMarketplace(listing.id, value);
      toast.success("Added to your marketplace.");
      onAdded();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-(--white) p-(--space-xl) shadow-xl">
        <div className="mb-(--gap-base) flex items-center justify-between">
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">Add to my marketplace</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-(--text-colour)" />
          </button>
        </div>

        <p className="font-roboto-slab mb-1 text-sm text-(--text-colour)">
          {listing.farmerName} — {listing.fishType}
        </p>
        <p className="font-roboto-slab mb-(--gap-base) text-sm text-(--text-colour)">
          Base price: <span className="font-semibold text-(--heading-colour)">₦{listing.basePricePerFish.toLocaleString()}</span>
        </p>

        <label className="font-roboto-slab mb-1 block text-sm font-medium text-(--heading-colour)">
          Your price (₦)
        </label>
        <input
          type="number"
          min={listing.basePricePerFish}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mb-(--gap-base) w-full rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
        />

        <div className="mb-(--gap-base) rounded-xl bg-(--gray-bg) p-(--space-md) text-sm">
          <p className="text-(--text-colour)">Your markup: <span className="font-semibold text-(--heading-colour)">₦{markup.toLocaleString()}</span></p>
          <p className="mt-1 text-xs text-(--text-colour)">
            The platform takes a commission off this markup; the rest is your earning on top of what you already earn selling your own stock.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="font-roboto-slab w-full rounded-xl bg-(--theme-green-dark) py-(--space-md) text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add to my marketplace"}
        </button>
      </div>
    </div>
  );
}

function InviteBuyerModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ referralUrl: string; emailSent: boolean } | null>(null);

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Email is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await clusterService.sendBuyerReferral(email);
      setResult({ referralUrl: res.data.referralUrl, emailSent: res.data.emailSent });
      onInvited();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send referral");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-(--white) p-(--space-xl) shadow-xl">
        <div className="mb-(--gap-base) flex items-center justify-between">
          <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">Invite a buyer</h3>
          <button onClick={onClose} aria-label="Close">
            <X size={20} className="text-(--text-colour)" />
          </button>
        </div>

        {result ? (
          <div className="flex flex-col gap-(--gap-base)">
            <p className="font-roboto-slab text-sm text-(--text-colour)">
              {result.emailSent
                ? "Referral sent! They'll sign up like any other buyer — once they do, they'll see your marketplace."
                : "Couldn't send the email — share this signup link directly:"}
            </p>
            {!result.emailSent && (
              <div className="rounded-xl bg-(--gray-bg) p-(--space-md) text-sm break-all">
                <span className="font-mono">{result.referralUrl}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="font-roboto-slab rounded-xl bg-(--theme-green-dark) py-(--space-md) text-sm font-semibold text-white transition hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-(--gap-base)">
            <p className="font-roboto-slab text-sm text-(--text-colour)">
              They'll sign up with their own email, OTP, and password — just like any other buyer. The only
              difference is they'll see your marketplace, not the general one.
            </p>
            <input
              placeholder="Their email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-(--border-gray) px-(--space-md) py-(--space-md) outline-none focus:border-(--theme-green-dark)"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="font-roboto-slab rounded-xl bg-(--theme-green-dark) py-(--space-md) text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send referral"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyMarketplacePage() {
  const [eligible, setEligible] = useState<EligibleMarketplaceListing[]>([]);
  const [storefront, setStorefront] = useState<ClusterMarketplaceRow[]>([]);
  const [buyers, setBuyers] = useState<ClusterBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalListing, setAddModalListing] = useState<EligibleMarketplaceListing | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [eligibleRes, storefrontRes, buyersRes] = await Promise.all([
        clusterService.getEligibleMarketplaceListings(),
        clusterService.getMyMarketplace(),
        clusterService.getMyBuyers(),
      ]);
      setEligible(eligibleRes.data.listings);
      setStorefront(storefrontRes.data.listings);
      setBuyers(buyersRes.data.buyers);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load your marketplace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const handleRemove = async (id: string) => {
    setBusyId(id);
    try {
      await clusterService.removeFromMyMarketplace(id);
      setStorefront((prev) => prev.filter((r) => r.id !== id));
      toast.success("Removed from your marketplace.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove listing");
    } finally {
      setBusyId(null);
    }
  };

  const handleEditPrice = async (row: ClusterMarketplaceRow) => {
    const input = window.prompt(`New price (base ₦${row.basePricePerFish.toLocaleString()})`, String(row.markedUpPricePerFish));
    if (input == null) return;
    const value = Number(input);
    if (!(value >= row.basePricePerFish)) {
      toast.error("Price can't be lower than the base price.");
      return;
    }
    setBusyId(row.id);
    try {
      await clusterService.updateMyMarketplaceListing(row.id, { markedUpPrice: value });
      setStorefront((prev) => prev.map((r) => (r.id === row.id ? { ...r, markedUpPricePerFish: value } : r)));
      toast.success("Price updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update price");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <LoadingState message="Loading your marketplace..." size="lg" />;

  return (
    <div className="flex flex-col gap-(--section-gap)">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">My Marketplace</h1>
        <p className="font-roboto-slab text-(--text-colour)">
          Curate your own storefront from your cluster's listings, set your own price, and invite buyers who will only see your prices.
        </p>
      </motion.div>

      {/* Invited buyers */}
      <div>
        <div className="mb-(--gap-base) flex items-center justify-between">
          <h2 className="font-ubuntu text-xl font-bold text-(--heading-colour)">Invited Buyers</h2>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="font-roboto-slab flex items-center gap-2 rounded-xl bg-(--theme-green-dark) px-(--space-lg) py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <UserPlus size={16} />
            Invite a buyer
          </button>
        </div>
        {buyers.length > 0 ? (
          <div className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2 lg:grid-cols-3">
            {buyers.map((b) => (
              <div key={b.id} className="rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-lg) shadow-sm">
                <p className="font-ubuntu font-semibold text-(--heading-colour)">{b.fullName}</p>
                <p className="font-roboto-slab text-sm text-(--text-colour)">{b.email}</p>
                <p className="font-roboto-slab text-sm text-(--text-colour)">{b.phoneNumber}</p>
                <p className="font-roboto-slab mt-1 text-xs text-(--text-colour)">
                  Customer since {new Date(b.createdAt).toLocaleDateString()}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    b.active ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {b.active ? "Active" : "Pending verification"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={UserPlus} title="No buyers invited yet" description="Invite a buyer to see your private marketplace." size="md" />
        )}
      </div>

      {/* My storefront */}
      <div>
        <h2 className="font-ubuntu mb-(--gap-base) text-xl font-bold text-(--heading-colour)">My Storefront</h2>
        {storefront.length > 0 ? (
          <motion.div
            variants={STAGGER_CONTAINER_VARIANT}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-(--gap-lg) md:grid-cols-2 lg:grid-cols-3"
          >
            {storefront.map((row) => (
              <motion.div
                key={row.id}
                variants={FADE_IN_VARIANT}
                className="flex flex-col gap-(--gap-base) rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-lg) shadow-sm"
              >
                <div>
                  <p className="font-ubuntu font-semibold text-(--heading-colour)">{row.farmerName} — {row.fishType}</p>
                  <p className="font-roboto-slab text-sm text-(--text-colour)">
                    Base ₦{row.basePricePerFish.toLocaleString()} → You charge ₦{row.markedUpPricePerFish.toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-(--gap-base)">
                  <button
                    onClick={() => handleEditPrice(row)}
                    disabled={busyId === row.id}
                    className="font-roboto-slab flex h-10 items-center justify-center gap-2 rounded-xl border border-(--border-gray) text-sm font-medium text-(--heading-colour) transition hover:bg-(--gray-bg) disabled:opacity-50"
                  >
                    <Pencil size={16} />
                    Edit price
                  </button>
                  <button
                    onClick={() => handleRemove(row.id)}
                    disabled={busyId === row.id}
                    className="font-roboto-slab flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState icon={Store} title="Your storefront is empty" description="Add a listing from below to start selling." size="md" />
        )}
      </div>

      {/* Eligible listings to add */}
      <div>
        <h2 className="font-ubuntu mb-(--gap-base) text-xl font-bold text-(--heading-colour)">Add Listings</h2>
        {eligible.length > 0 ? (
          <div className="grid grid-cols-1 gap-(--gap-base) md:grid-cols-2 lg:grid-cols-3">
            {eligible.map((listing) => (
              <div key={listing.id} className="flex flex-col gap-(--gap-base) rounded-2xl border border-(--border-gray) bg-(--white) p-(--space-lg) shadow-sm">
                <p className="font-ubuntu font-semibold text-(--heading-colour)">{listing.farmerName} — {listing.fishType}</p>
                <p className="font-roboto-slab text-sm text-(--text-colour)">Base price: ₦{listing.basePricePerFish.toLocaleString()}</p>
                <button
                  onClick={() => setAddModalListing(listing)}
                  className="font-roboto-slab flex h-10 items-center justify-center gap-2 rounded-xl bg-(--theme-green-dark) text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Plus size={16} />
                  Add to my marketplace
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Plus} title="No listings to add" description="Approved listings from your cluster's farmers will appear here." size="md" />
        )}
      </div>

      {addModalListing && (
        <AddListingModal
          listing={addModalListing}
          onClose={() => setAddModalListing(null)}
          onAdded={() => void loadAll()}
        />
      )}
      {inviteModalOpen && (
        <InviteBuyerModal onClose={() => setInviteModalOpen(false)} onInvited={() => void loadAll()} />
      )}
    </div>
  );
}
