import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFileToGCS } from "@/lib/gcs";

const emailRegex = /^\S+@\S+\.\S+$/;

function getBucketName(): string {
  const bucketName = process.env.GCS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("GCS_BUCKET_NAME belum diatur di environment variable.");
  }

  return bucketName;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const image = formData.get("image");
    const cv = formData.get("cv");

    if (!fullName) {
      return NextResponse.json(
        { success: false, message: "Nama lengkap wajib diisi." },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (!(image instanceof File)) {
      return NextResponse.json(
        { success: false, message: "File gambar wajib diunggah." },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "File harus berupa gambar." },
        { status: 400 }
      );
    }

    if (!(cv instanceof File)) {
      return NextResponse.json(
        { success: false, message: "File CV wajib diunggah." },
        { status: 400 }
      );
    }

    if (cv.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "File CV harus bertipe PDF." },
        { status: 400 }
      );
    }

    const bucketName = getBucketName();
    
    // Upload gambar ke GCS
    const safeImageFileName = image.name.replace(/\s+/g, "-").toLowerCase() || "image-upload";
    const imageDestinationPath = `registrations/${Date.now()}-${safeImageFileName}`;
    const imageUrl = await uploadFileToGCS(image, bucketName, imageDestinationPath);

    // Upload CV ke GCS
    const safeCvFileName = cv.name.replace(/\s+/g, "-").toLowerCase() || "cv-upload";
    const cvDestinationPath = `registrations/${Date.now()}-${safeCvFileName}`;
    const cvUrl = await uploadFileToGCS(cv, bucketName, cvDestinationPath);

    // Simpan ke database
    const registration = await prisma.registration.create({
      data: {
        fullName,
        email,
        imageUrl,
        cvUrl,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil disimpan.",
        data: registration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/register error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: registrations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/register error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data registrasi.",
      },
      { status: 500 }
    );
  }
}
