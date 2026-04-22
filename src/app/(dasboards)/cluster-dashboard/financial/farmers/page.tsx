"use client";

import { motion } from "framer-motion";
import { Users, Phone, MapPin, Search, Package } from "lucide-react";
import Image from "next/image";
import { FADE_IN_VARIANT, STAGGER_CONTAINER_VARIANT } from "~/types/constants";
import { useState } from "react";

// Mock data
const mockFarmers = [
  {
    id: "farmer-1",
    fullName: "Adebayo Johnson",
    farmName: "Sunrise Fisheries",
    state: "Lagos",
    localGovernment: "Epe",
    phoneNumber: "08012345678",
    fishType: "Catfish",
    farmingCapacityKg: 5000,
    profileImage: "/images/placeholder-avatar.jpg", // Using a standard placeholder route
  },
  {
    id: "farmer-2",
    fullName: "Chinedu Okafor",
    farmName: "Eastern Waves Aquaculture",
    state: "Ogun",
    localGovernment: "Ijebu Ode",
    phoneNumber: "09098765432",
    fishType: "Tilapia",
    farmingCapacityKg: 3500,
    profileImage: "/images/placeholder-avatar.jpg",
  },
  {
    id: "farmer-3",
    fullName: "Fatima Yusuf",
    farmName: "Northern Flow Farms",
    state: "Kaduna",
    localGovernment: "Kaduna South",
    phoneNumber: "07011223344",
    fishType: "Mackerel",
    farmingCapacityKg: 8000,
    profileImage: "/images/placeholder-avatar.jpg",
  },
];

export default function ClusterFarmersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFarmers = mockFarmers.filter(farmer => 
    farmer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-(--section-gap)">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-ubuntu mb-2 text-3xl font-bold text-(--heading-colour)">
            My Cluster Farmers
          </h1>
          <p className="font-roboto-slab text-(--text-colour)">
            Manage and view the profiles of farmers under your cluster
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, farm, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-roboto-slab h-10 w-full rounded-xl border border-(--border-input) pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <motion.div variants={FADE_IN_VARIANT} className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-green-50 p-3">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
          <p className="font-ubuntu text-3xl font-bold text-(--heading-colour)">{mockFarmers.length}</p>
          <p className="font-roboto-slab text-sm text-(--text-colour)">Total Farmers</p>
        </motion.div>
        
        <motion.div variants={FADE_IN_VARIANT} className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-blue-50 p-3">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="font-ubuntu text-3xl font-bold text-(--heading-colour)">
            {mockFarmers.reduce((sum, f) => sum + f.farmingCapacityKg, 0).toLocaleString()} kg
          </p>
          <p className="font-roboto-slab text-sm text-(--text-colour)">Total Capacity</p>
        </motion.div>

        <motion.div variants={FADE_IN_VARIANT} className="rounded-2xl border border-(--border-gray) bg-(--white) p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-purple-50 p-3">
              <MapPin size={24} className="text-purple-600" />
            </div>
          </div>
          <p className="font-ubuntu text-3xl font-bold text-(--heading-colour)">
            {new Set(mockFarmers.map(f => f.state)).size}
          </p>
          <p className="font-roboto-slab text-sm text-(--text-colour)">States Covered</p>
        </motion.div>
      </motion.div>

      {/* Grid of Farmers */}
      <motion.div
        variants={STAGGER_CONTAINER_VARIANT}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredFarmers.map((farmer) => (
          <motion.div
            key={farmer.id}
            variants={FADE_IN_VARIANT}
            className="flex flex-col gap-4 rounded-3xl border border-(--border-gray) bg-(--white) p-6 shadow-sm transition hover:shadow-md"
          >
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-100 border-2 border-green-100">
                {/* Fallback to initials if no image */}
                <span className="absolute inset-0 flex items-center justify-center font-ubuntu text-xl font-bold text-gray-400">
                  {farmer.fullName.substring(0, 2).toUpperCase()}
                </span>
                <Image 
                  src={farmer.profileImage}
                  alt={farmer.fullName}
                  fill
                  className="object-cover relative z-10"
                  // Using unoptimized if it's an external placeholder URL.
                />
              </div>
              <div className="flex flex-col">
                <h3 className="font-ubuntu text-lg font-bold text-(--heading-colour)">{farmer.fullName}</h3>
                <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 w-fit">
                  {farmer.fishType} Farmer
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-gray-100 my-2"></div>

            {/* Farm Details */}
            <div className="flex flex-col gap-3">
              <div>
                <p className="font-roboto-slab text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Farm Name</p>
                <p className="font-roboto-slab text-sm font-medium text-gray-900">{farmer.farmName}</p>
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <span>{farmer.localGovernment}, {farmer.state}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} className="text-gray-400 shrink-0" />
                <span>{farmer.phoneNumber}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package size={16} className="text-gray-400 shrink-0" />
                <span>Capacity: <span className="font-medium text-gray-900">{farmer.farmingCapacityKg.toLocaleString()} kg</span></span>
              </div>
            </div>
            
            {/* Action button */}
            <div className="mt-2 pt-4 border-t border-gray-100">
              <button className="w-full rounded-xl bg-(--bg-pink) py-2.5 text-sm font-semibold text-(--theme-green-dark) transition-colors hover:bg-green-50">
                View Full Profile
              </button>
            </div>
          </motion.div>
        ))}

        {filteredFarmers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No farmers found</p>
            <p className="text-sm">Try adjusting your search terms</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
