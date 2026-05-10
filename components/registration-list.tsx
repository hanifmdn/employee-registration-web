"use client";

import { useMemo, useState } from "react";
import { RegistrationItem } from "@/lib/registration";
import { RegistrationCard } from "@/components/registration-card";

type RegistrationListProps = {
  registrations: RegistrationItem[];
};

export function RegistrationList({ registrations }: RegistrationListProps) {
  const [items, setItems] = useState<RegistrationItem[]>(registrations);
  const [deletingId, setDeletingId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const isEmpty = useMemo(() => items.length === 0, [items]);

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm("Yakin ingin menghapus data ini?");
    if (!isConfirmed) {
      return;
    }

    setDeletingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/register/${id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Gagal menghapus data.");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setMessage(payload.message ?? "Data berhasil dihapus.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus data.";
      setMessage(text);
    } finally {
      setDeletingId("");
    }
  };

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
        Belum ada data yang tersimpan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <p className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
          {message}
        </p>
      )}

      <div className="grid gap-4">
      {items.map((item) => (
        <RegistrationCard
          key={item.id}
          id={item.id}
          fullName={item.fullName}
          email={item.email}
          imageUrl={item.imageUrl}
          cvUrl={item.cvUrl}
          createdAt={item.createdAt}
          onDelete={handleDelete}
          isDeleting={deletingId === item.id}
        />
      ))}
      </div>
    </div>
  );
}
