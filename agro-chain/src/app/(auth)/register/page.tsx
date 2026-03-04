"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DynamicInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";
import { FullScreenStatusModal } from "~/components/shared/FullScreenStatusModal";

// === Zod Schema (Nigeria phone friendly)
const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(10, "Phone number is too short")
    .regex(/^(0|\+234)[789][01]\d{8}$/, "Invalid Nigerian phone number (+234 or 0 prefix)"),
  email: z.string().email("Invalid email address"),
  location: z.string().min(2, "Location is required").optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

type Role = "Farmer" | "Buyer";
type LocationSwitch = "on" | "off";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") || "") as Role;

  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationMode, setLocationMode] = useState<LocationSwitch>("off");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    variant: "loading" | "success";
  }>({
    open: false,
    variant: "loading",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { location: "" },
  });

  const locationValue = watch("location");

  //=== Geolocation effect (clean - no direct set inside without deps)
  useEffect(() => {
    if (!useCurrentLocation) return;

    if (locationMode === "on") {
      setUseCurrentLocation(true);
    } else {
      setUseCurrentLocation(false);
    }

    let mounted = true;
    setLoadingLocation(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      setUseCurrentLocation(false);
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (!mounted) return;
        const { latitude, longitude } = pos.coords;

        try {
          // BigDataCloud free reverse geocoding (no key needed for basic use)
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          if (!res.ok) throw new Error();
          const data = await res.json();
          const city =
            data.city ||
            data.locality ||
            data.countryName ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          setValue("location", city, { shouldValidate: true });
        } catch {
          setValue("location", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast.warning("Could not get city name — using coordinates instead");
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        if (!mounted) return;
        toast.error("Location access denied: " + err.message);
        setUseCurrentLocation(false);
        setLoadingLocation(false);
      },
      { timeout: 10000, maximumAge: 0 },
    );

    return () => {
      mounted = false;
    };
  }, [useCurrentLocation, setValue, locationMode]);

  //=== Reset location when toggle off
  useEffect(() => {
    if (!useCurrentLocation) {
      setValue("location", "", { shouldValidate: true });
    }
  }, [useCurrentLocation, setValue]);

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    setStatusModal({ open: true, variant: "loading" });
    try {
      //=== TODO: real POST /api/auth/register
      console.log("Register payload:", { ...data, role });
      await new Promise((r) => setTimeout(r, 1400)); // simulate
      toast.success("Account created! Redirecting...");
      await new Promise((r) => setTimeout(r, 1600));

      setStatusModal({ open: true, variant: "success" });

      setTimeout(() => {
        router.push("/verify-identity");
      }, 2200);
    } catch (error: unknown) {
      setStatusModal({ open: false, variant: "loading" });
      let message = "Registration failed. Please try again.";

      if (error instanceof Error) {
        message = error.message;
        console.log("Error submitting:", error.message);
      } else {
        console.log("Unexpected error:", error);
      }

      toast.error(message);
      console.log("Error submitting: ", message);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormComplete = isValid && (locationValue?.trim() || !useCurrentLocation);

  return (
    <>
      <div className="flex h-full min-h-full w-full flex-col gap-(--section-gap)">
        <h2 className="font-ubuntu text-center text-2xl font-bold sm:text-3xl lg:text-4xl">
          Create Account {role}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-(--gap-lg)">
          <div className="flex w-full flex-col gap-(--gap-base) lg:grid lg:grid-cols-2">
            <DynamicInput
              label="Full Name"
              error={errors.fullName?.message}
              {...register("fullName")}
              required
            />

            <DynamicInput
              fieldType="tel"
              label="Phone Number"
              error={errors.phone?.message}
              {...register("phone")}
              placeholder="08012345678 or +2348012345678"
              required
            />

            <DynamicInput
              fieldType="email"
              label="Email Address"
              error={errors.email?.message}
              {...register("email")}
              required
            />

            {/* When OFF -> Show Label + Select */}
            {locationMode === "off" && (
              <div className="flex flex-col gap-(--space-md) font-roboto-slab">
                <label className="text-sm">Use current location?</label>

                <Select
                  value={locationMode}
                  onValueChange={(value: "on" | "off") => setLocationMode(value)}
                >
                  <SelectTrigger className="w-full cursor-pointer rounded-full py-(--space-lg) text-base">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>

                  <SelectContent className="overflow-hidden border border-(--border-gray) p-(--space-sm)">
                    <SelectItem value="on" className="cursor-pointer border-b py-3">
                      On
                    </SelectItem>
                    <SelectItem value="off" className="cursor-pointer py-3">
                      Off
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* When ON -> Show Loader OR Input */}
            {locationMode === "on" && (
              <div className="flex flex-col gap-2">
                {loadingLocation ? (
                  <Loader2 className="text-primary h-5 w-5 animate-spin" />
                ) : (
                  <DynamicInput
                    label="Location"
                    error={errors.location?.message}
                    {...register("location")}
                    disabled
                  />
                )}
              </div>
            )}
          </div>

          <div className="mt-(--submit-button-mt) flex w-full flex-col">
            {isFormComplete ? (
              <SubmitPrimaryButton loading={submitting} type="submit">
                Create Account
              </SubmitPrimaryButton>
            ) : (
              <SubmitSecondaryButton disabled type="button">
                Create Account
              </SubmitSecondaryButton>
            )}
          </div>
        </form>

        <FullScreenStatusModal
          open={statusModal.open}
          variant={statusModal.variant}
          title={
            statusModal.variant === "loading"
              ? "Creating your account..."
              : "Account Created Successfully!"
          }
          description={
            statusModal.variant === "success" ? "We're preparing your dashboard now." : undefined
          }
        />
      </div>
    </>
  );
}
