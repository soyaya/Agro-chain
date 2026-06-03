"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, User } from "lucide-react";
import { cn } from "~/lib/utils";

interface ProfileAvatarProps {
  imageUrl?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onImageChange?: (file: File) => void;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

const iconSizes = {
  sm: 24,
  md: 32,
  lg: 40,
};

export function ProfileAvatar({
  imageUrl,
  name,
  size = "md",
  editable = false,
  onImageChange,
}: ProfileAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <motion.div
        className={cn(
          "border-gray-border relative overflow-hidden rounded-full border-2",
          sizeClasses[size],
        )}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="bg-gray-bg flex h-full w-full items-center justify-center">
            {initials ? (
              <span className="font-ubuntu text-heading-colour text-lg font-bold">{initials}</span>
            ) : (
              <User size={iconSizes[size]} className="text-text-colour" />
            )}
          </div>
        )}

        {editable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-(--black)"
          >
            <Camera size={20} className="text-white" />
          </motion.div>
        )}
      </motion.div>

      {editable && (
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      )}
    </div>
  );
}
