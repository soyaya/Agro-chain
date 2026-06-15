import { NextResponse } from "next/server";

// === Cloudinary unsigned upload
// Uses Cloudinary's unsigned upload preset - no server-side secret needed.
// The upload preset must be set to "unsigned" in your Cloudinary dashboard.
// Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env

export async function POST(req: Request) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
      },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid form data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { status: "error", message: "No file provided." },
      { status: 400 },
    );
  }

  // Forward to Cloudinary unsigned upload endpoint
  const cloudinaryForm = new FormData();
  cloudinaryForm.append("file", file);
  cloudinaryForm.append("upload_preset", uploadPreset);
  cloudinaryForm.append("folder", "agrochain/documents");

  let cloudinaryResponse: Response;
  try {
    cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: "POST", body: cloudinaryForm },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to reach Cloudinary.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }

  const result = (await cloudinaryResponse.json()) as Record<string, unknown>;

  if (!cloudinaryResponse.ok) {
    return NextResponse.json(
      {
        status: "error",
        message:
          (result.error as { message?: string })?.message ?? "Upload failed.",
      },
      { status: cloudinaryResponse.status },
    );
  }

  return NextResponse.json({
    status: "success",
    data: {
      secure_url: result.secure_url as string,
      public_id: result.public_id as string,
    },
  });
}
