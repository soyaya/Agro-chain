"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicInput } from "~/components/dynamic-input";
import { Button } from "~/components/ui/button";
import { SubmitPrimaryButton } from "~/components/SubmitPrimaryButton";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function VerifyIdentity() {
  const router = useRouter();
  const [bvn, setBvn] = useState("");
  const [creditCheck, setCreditCheck] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    // TODO: call real BVN API
    await new Promise((r) => setTimeout(r, 1800));
    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 2400);
  };

  const handleSkip = () => {
    setSkipped(true);
    setTimeout(() => router.push("/dashboard"), 1800);
  };

  if (success || skipped) {
    return (
      <div className="text-center space-y-6 py-12">
        {success ? <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" /> : null}
        <h2 className="text-2xl font-bold">Great job!</h2>
        <p className="text-muted-foreground">
          Your verification is {skipped ? "skipped" : "successful"}. Let&apos;s head to your dashboard!
        </p>
        <p className="text-sm text-muted-foreground">Redirecting in a few seconds...</p>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="text-center space-y-6 py-20">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">We&apos;re verifying your identity</h2>
        <p className="text-sm text-muted-foreground">This usually takes a few seconds...</p>
      </div>
    );
  }

  return (
    <Card className="border shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Verify Identity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DynamicInput
          label="Bank Verification Number (BVN)"
          value={bvn}
          onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
          maxLength={11}
          placeholder="Enter 11-digit BVN"
        />
        <DynamicInput
          label="Credit Check Consent"
          value={creditCheck}
          onChange={(e) => setCreditCheck(e.target.value)}
          placeholder="e.g. I consent to credit check"
        />

        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button variant="outline" onClick={handleSkip} className="h-14 rounded-full">
            Skip for now
          </Button>
          <SubmitPrimaryButton onClick={handleVerify} disabled={!bvn.trim()}>
            Verify
          </SubmitPrimaryButton>
        </div>
      </CardContent>
    </Card>
  );
}