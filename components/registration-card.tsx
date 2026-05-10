type RegistrationCardProps = {
  id: string;
  fullName: string;
  email: string;
  imageUrl: string;
  cvUrl: string;
  createdAt: Date | string;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
};

export function RegistrationCard({
  id,
  fullName,
  email,
  imageUrl,
  cvUrl,
  createdAt,
  onDelete,
  isDeleting,
}: RegistrationCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
      <div className="grid gap-4 p-4 sm:grid-cols-[160px_1fr]">
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          <img src={imageUrl} alt={fullName} className="h-40 w-full object-cover" />
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold text-white">{fullName}</h2>
            <p className="text-sm text-slate-400">{email}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
            >
              Buka Gambar
            </a>
            <a
              href={cvUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
            >
              Buka CV PDF
            </a>
            <button
              type="button"
              onClick={() => void onDelete(id)}
              disabled={isDeleting}
              className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>

          <p className="text-xs text-slate-500">Tersimpan pada {new Date(createdAt).toLocaleString("id-ID")}</p>
        </div>
      </div>
    </article>
  );
}
