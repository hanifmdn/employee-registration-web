import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RegistrationList } from "@/components/registration-list";
import type { RegistrationItem } from "@/lib/registration";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const registrations = await prisma.registration.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const typedRegistrations: RegistrationItem[] = registrations;

  return (
    <main className="min-h-screen w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl rounded-2xl border border-white/70 bg-slate-950 p-5 text-slate-100 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Admin Panel</p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Data Pendaftaran Masuk</h1>
            <p className="mt-2 text-sm text-slate-400">Halaman ini menampilkan semua item yang sudah diupload.</p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            Kembali ke Form
          </Link>
        </div>

        <RegistrationList registrations={typedRegistrations} />
      </div>
    </main>
  );
}
