"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { DynamicInput, SelectInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { SubmitSecondaryButton } from "~/components/SubmitSecondaryButton";
import { FullScreenStatusModal } from "~/components/shared/FullScreenStatusModal";
import { kadunaLga } from "~/models/models";

// === Zod Schema
const registerSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  phone: z
    .string()
    .min(10, "Phone number is too short")
    .regex(/^(0|\+234)[789][01]\d{8}$/, "Invalid Nigerian phone number (+234 or 0 prefix)"),
  email: z.string().email("Invalid email address"),
  location: z.string().min(2, "Location is required").optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

type Role = "Farmer" | "Buyer";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") || "") as Role;

  const [isLga, setSelectedLga] = useState<string>("off");
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
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { location: "" },
  });

  // Sync LGA selection with form location field
  const handleLgaChange = (value: string) => {
    setSelectedLga(value);
    setValue("location", value, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterForm) => {
    setSubmitting(true);
    setStatusModal({ open: true, variant: "loading" });
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      toast.success("Account created! Redirecting...");
      setStatusModal({ open: true, variant: "success" });

      setTimeout(() => {
        router.push("/verify-identity");
      }, 2200);
    } catch (error) {
      setStatusModal({ open: false, variant: "loading" });
      const message =
        error instanceof Error ? error.message : "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormComplete = isValid && isLga !== "off";

  return (
    <>
      <div className="flex h-full default-container-max-width min-h-full w-full flex-col gap-(--section-gap)">
        <h2 className="font-ubuntu text-center text-2xl font-bold sm:text-3xl lg:text-4xl">
          Create Account {role}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-(--gap-lg)">
          <div className="flex w-full flex-col default-page-max-width gap-(--gap-base)">
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

            <div className="font-roboto-slab flex flex-col gap-(--space-md)">
              <SelectInput
                label="Location"
                value={isLga}
                onValueChange={handleLgaChange}
                options={kadunaLga}
                required
              />
            </div>
          </div>

          <div className="mt-(--submit-button-mt) max-w-sm mx-auto flex w-full flex-col">
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
      </div>

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
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex h-full min-h-full w-full items-center justify-center">Loading...</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
