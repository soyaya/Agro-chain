"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DynamicInput } from "~/components/dynamic-input";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { authService } from "~/lib/services/auth.service";
import { useAuth } from "~/lib/auth-context";

const setPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SetPasswordForm = z.infer<typeof setPasswordSchema>;

export default function SetPasswordPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SetPasswordForm>({
    resolver: zodResolver(setPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SetPasswordForm) => {
    setLoading(true);
    try {
      await authService.setPassword(data.newPassword);
      toast.success("Password set. Redirecting to your dashboard...");
      if (user) updateUser({ ...user, mustSetPassword: false });

      let destination = "/buyers-dashboard";
      if (user?.role === "rider") destination = "/rider-dashboard";
      else if (user?.isClusterFarmer) destination = "/cluster-dashboard";
      else if (user?.role === "farmer") destination = "/farmers-dashboard";

      setTimeout(() => {
        window.location.href = destination;
      }, 800);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="default-container-max-width flex min-h-screen flex-col gap-(--section-gap)">
      <h2 className="font-ubuntu text-center text-2xl font-bold sm:text-3xl lg:text-4xl">
        Set Your Password
      </h2>
      <p className="text-center text-sm text-(--text-colour)">
        You signed in with a temporary password. Choose a new password to continue to your dashboard.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="default-page-max-width flex w-full flex-col gap-(--gap-lg)"
      >
        <DynamicInput
          fieldType="password"
          label="New Password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
          required
          disabled={loading}
        />
        <DynamicInput
          fieldType="password"
          label="Confirm New Password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
          required
          disabled={loading}
        />

        <SubmitPrimaryButton loading={loading} disabled={!isValid || loading} type="submit">
          Set Password & Continue
        </SubmitPrimaryButton>
      </form>
    </div>
  );
}
