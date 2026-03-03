"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Switch } from "~/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DynamicInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";

// ── Zod Schema (Nigeria phone friendly)
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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") || "") as Role;

  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // ── Geolocation effect (clean - no direct set inside without deps)
  useEffect(() => {
    if (!useCurrentLocation) return;

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
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
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
      { timeout: 10000, maximumAge: 0 }
    );

    return () => {
      mounted = false;
    };
  }, [useCurrentLocation, setValue]);

  // Reset location when toggle off
  useEffect(() => {
    if (!useCurrentLocation) {
      setValue("location", "", { shouldValidate: true });
    }
  }, [useCurrentLocation, setValue]);

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    try {
      // TODO: real POST /api/auth/register
      console.log("Register payload:", { ...data, role });
      await new Promise((r) => setTimeout(r, 1400)); // simulate
      toast.success("Account created! Redirecting...");
      router.push("/verify-identity");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormComplete = isValid && (locationValue?.trim() || !useCurrentLocation);

  return (
    <Card className="border shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create Account ({role})</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium">Use current location</label>
            <div className="flex items-center gap-3">
              {loadingLocation && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              <Switch checked={useCurrentLocation} onCheckedChange={setUseCurrentLocation} />
            </div>
          </div>

          <DynamicInput
            label="Location"
            error={errors.location?.message}
            {...register("location")}
            placeholder="Lagos, Ikeja or coordinates"
            disabled={useCurrentLocation}
          />

          {isFormComplete ? (
            <SubmitPrimaryButton loading={submitting} type="submit">
              Create Account
            </SubmitPrimaryButton>
          ) : (
            <SubmitSecondaryButton disabled type="button">
              Create Account
            </SubmitSecondaryButton>
          )}
        </form>
      </CardContent>
    </Card>
  );
}