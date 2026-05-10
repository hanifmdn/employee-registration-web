"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type FormState = {
  fullName: string;
  email: string;
  imageFile: File | null;
  cvFile: File | null;
};

type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

export function RegistrationForm() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    imageFile: null,
    cvFile: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [message, setMessage] = useState<MessageState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messageClassName =
    message?.type === "success"
      ? "rounded-lg px-3 py-2 text-sm border border-emerald-200 bg-emerald-50 text-emerald-700"
      : "rounded-lg px-3 py-2 text-sm border border-rose-200 bg-rose-50 text-rose-700";

  const isFormFilled = useMemo(() => {
    return Boolean(form.fullName.trim() && form.email.trim() && form.imageFile && form.cvFile);
  }, [form]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validate = (): Partial<Record<keyof FormState, string>> => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Nama lengkap wajib diisi.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email wajib diisi.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Format email tidak valid.";
    }

    if (!form.imageFile) {
      nextErrors.imageFile = "Silakan unggah file gambar.";
    } else if (!form.imageFile.type.startsWith("image/")) {
      nextErrors.imageFile = "File harus berupa gambar.";
    }

    if (!form.cvFile) {
      nextErrors.cvFile = "Silakan unggah file CV.";
    } else if (form.cvFile.type !== "application/pdf") {
      nextErrors.cvFile = "File CV harus bertipe PDF.";
    }

    return nextErrors;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setMessage(null);
    setErrors((prev) => ({ ...prev, imageFile: undefined }));

    if (!file) {
      setForm((prev) => ({ ...prev, imageFile: null }));
      setPreviewUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setForm((prev) => ({ ...prev, imageFile: null }));
      setPreviewUrl("");
      setErrors((prev) => ({ ...prev, imageFile: "File harus berupa gambar." }));
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageFile: file }));
    setPreviewUrl(nextPreviewUrl);
  };

  const handleCvChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setMessage(null);
    setErrors((prev) => ({ ...prev, cvFile: undefined }));

    if (!file) {
      setForm((prev) => ({ ...prev, cvFile: null }));
      return;
    }

    if (file.type !== "application/pdf") {
      setForm((prev) => ({ ...prev, cvFile: null }));
      setErrors((prev) => ({ ...prev, cvFile: "File CV harus bertipe PDF." }));
      return;
    }

    setForm((prev) => ({ ...prev, cvFile: file }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setMessage({ type: "error", text: "Periksa kembali data yang diisi." });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName.trim());
      formData.append("email", form.email.trim());

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      if (form.cvFile) {
        formData.append("cv", form.cvFile);
      }

      const response = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Submit gagal. Silakan coba lagi.");
      }

      setMessage({ type: "success", text: "Pendaftaran berhasil dikirim." });
      setErrors({});
      setForm({ fullName: "", email: "", imageFile: null, cvFile: null });

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl("");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Terjadi kesalahan.";
      setMessage({ type: "error", text });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Portal Pendaftaran</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Form Pendaftaran Pegawai</h1>
            <p className="mt-2 text-sm text-slate-600">Lengkapi data berikut dan unggah gambar serta CV sebelum mengirim form.</p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Buka Halaman Admin
          </Link>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">
              Nama Lengkap
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Contoh: Hanif Maulana"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-cyan-100"
              value={form.fullName}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, fullName: event.target.value }));
                setErrors((prev) => ({ ...prev, fullName: undefined }));
                setMessage(null);
              }}
            />
            {errors.fullName && <p className="mt-2 text-xs text-rose-600">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="nama@email.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-cyan-100"
              value={form.email}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, email: event.target.value }));
                setErrors((prev) => ({ ...prev, email: undefined }));
                setMessage(null);
              }}
            />
            {errors.email && <p className="mt-2 text-xs text-rose-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="imageFile" className="mb-2 block text-sm font-medium text-slate-700">
              Upload File Gambar
            </label>
            <label
              htmlFor="imageFile"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-cyan-400 hover:bg-cyan-50"
            >
              <span className="text-sm font-medium text-slate-700">Klik untuk pilih gambar</span>
              <span className="text-xs text-slate-500">PNG, JPG, JPEG, WEBP</span>
            </label>
            <input
              id="imageFile"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
            {errors.imageFile && <p className="mt-2 text-xs text-rose-600">{errors.imageFile}</p>}
          </div>

          <div>
            <label htmlFor="cvFile" className="mb-2 block text-sm font-medium text-slate-700">
              Upload File CV (PDF)
            </label>
            <label
              htmlFor="cvFile"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-cyan-400 hover:bg-cyan-50"
            >
              <span className="text-sm font-medium text-slate-700">Klik untuk pilih CV</span>
              <span className="text-xs text-slate-500">PDF only</span>
              {form.cvFile && <span className="text-xs font-semibold text-emerald-600">✓ {form.cvFile.name}</span>}
            </label>
            <input
              id="cvFile"
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              onChange={handleCvChange}
            />
            {errors.cvFile && <p className="mt-2 text-xs text-rose-600">{errors.cvFile}</p>}
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Preview Gambar</p>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <img src={previewUrl} alt="Preview gambar" className="h-56 w-full object-cover" />
              </div>
            </div>
          )}

          {message && <p className={messageClassName}>{message.text}</p>}

          <button
            type="submit"
            disabled={!isFormFilled || isSubmitting}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Mengirim..." : "Submit"}
          </button>
        </form>
      </div>
    </main>
  );
}
