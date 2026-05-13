// === File upload utility
// Sends a file to /api/upload which proxies to Cloudinary.
// Returns the secure_url string on success.

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: form,
    credentials: "include",
  });

  const data = (await response.json()) as {
    status: string;
    message?: string;
    data?: { secure_url: string };
  };

  if (!response.ok || data.status !== "success") {
    throw new Error(data.message ?? "File upload failed");
  }

  return data.data!.secure_url;
}
