"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Calendar, Fish, Briefcase } from "lucide-react";
import type { FarmerProfile } from "~/types";
import { FADE_IN_VARIANT } from "~/types/constants";

interface ProfileDetailsProps {
  profile: FarmerProfile;
}

interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

function DetailItem({ icon: Icon, label, value }: DetailItemProps) {
  return (
    <motion.div
      variants={FADE_IN_VARIANT}
      className="flex items-start gap-(--gap-base)"
    >
      <div className="bg-gray-bg flex h-10 w-10 items-center justify-center rounded-full">
        <Icon size={20} className="text-text-colour" />
      </div>
      <div className="flex flex-col">
        <span className="text-text-colour text-sm">{label}</span>
        <span className="font-roboto-slab text-heading-colour text-base">
          {value}
        </span>
      </div>
    </motion.div>
  );
}

export function ProfileDetails({ profile }: ProfileDetailsProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid grid-cols-1 gap-(--gap-lg) md:grid-cols-2"
    >
      <DetailItem icon={Mail} label="Email" value={profile.email} />
      <DetailItem icon={Phone} label="Phone" value={profile.phoneNumber} />
      <DetailItem
        icon={MapPin}
        label="Location"
        value={`${profile.localGovernment}, ${profile.state}`}
      />
      <DetailItem icon={Briefcase} label="Farm Name" value={profile.farmName} />
      <DetailItem icon={Fish} label="Fish Type" value={profile.fishType} />
      <DetailItem
        icon={Calendar}
        label="Experience"
        value={`${profile.yearsOfExperience} years`}
      />
      <DetailItem
        icon={Briefcase}
        label="Capacity"
        value={`${profile.farmingCapacityKg} kg`}
      />
      <DetailItem
        icon={MapPin}
        label="Farm Address"
        value={profile.farmAddress}
      />
    </motion.div>
  );
}
