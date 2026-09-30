"use client";

import { toast } from "sonner";

interface InviteCredentialsCardProps {
  loginUrl: string;
  tempPassword: string;
}

/** Shown right after an invite (or a resend) so the inviter can copy/share
 * the login link and temp password manually if the email never arrives. */
export function InviteCredentialsCard({ loginUrl, tempPassword }: InviteCredentialsCardProps) {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied.`);
    } catch {
      toast.error(`Couldn't copy ${label.toLowerCase()} — copy it manually.`);
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-(--border-gray) bg-(--bg-pink) p-4">
      <p className="font-roboto-slab mb-2 text-sm font-medium text-(--heading-colour)">
        In case the email doesn&apos;t arrive, share these directly:
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 rounded-lg bg-(--white) px-3 py-2">
          <span className="font-roboto-slab truncate text-sm text-(--text-colour)">{loginUrl}</span>
          <button
            type="button"
            onClick={() => copyToClipboard(loginUrl, "Login link")}
            className="font-roboto-slab shrink-0 text-xs font-medium text-(--theme-green-dark) hover:underline"
          >
            Copy
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg bg-(--white) px-3 py-2">
          <span className="font-roboto-slab text-sm text-(--text-colour)">
            Temp password: <strong>{tempPassword}</strong>
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(tempPassword, "Temporary password")}
            className="font-roboto-slab shrink-0 text-xs font-medium text-(--theme-green-dark) hover:underline"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
