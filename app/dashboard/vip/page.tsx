"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Input,
  Spinner,
  ErrorMsg,
  PageHeader,
  Modal,
  EmptyState,
} from "@/components/ui";
import { listVipLevels, createVipLevel, updateVipLevel, deleteVipLevel } from "@/lib/admin";

export default function VipPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ level: "", name: "", benefits: "", min_deposit: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listVipLevels());
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load VIP levels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function reset() {
    setForm({ level: "", name: "", benefits: "", min_deposit: "" });
    setEditingId(null);
  }

  function edit(v: any) {
    setEditingId(v.id);
    setForm({
      level: String(v.level),
      name: v.name,
      benefits: v.benefits || "",
      min_deposit: String(v.min_deposit),
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      level: parseInt(form.level, 10),
      name: form.name,
      benefits: form.benefits,
      min_deposit: parseFloat(form.min_deposit || "0"),
    };
    if (editingId) {
      await updateVipLevel(editingId, payload);
    } else {
      await createVipLevel(payload);
    }
    reset();
    load();
  }

  async function confirmRemove() {
    if (!confirmDelete) return;
    await deleteVipLevel(confirmDelete.id);
    setConfirmDelete(null);
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="VIP Levels" description="Define tiers, perks and deposit thresholds" />

      <ErrorMsg msg={error} />

      <Card title={editingId ? "Edit VIP Level" : "New VIP Level"}>
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input type="number" placeholder="Level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} required />
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input type="number" step="0.1" placeholder="Min Deposit" value={form.min_deposit} onChange={(e) => setForm({ ...form, min_deposit: e.target.value })} />
          <Input placeholder="Benefits" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
          <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
            <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={reset}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      <Card title={`${items.length} levels`} bodyClassName="p-0">
        {loading ? (
          <div className="p-4"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState title="No VIP levels yet" />
        ) : (
          <div className="table-wrap">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2.5">Level</th>
                  <th>Name</th>
                  <th>Min Deposit</th>
                  <th>Benefits</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((v) => (
                  <tr key={v.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 font-semibold text-slate-100">{v.level}</td>
                    <td className="font-medium text-slate-100">{v.name}</td>
                    <td>{v.min_deposit}</td>
                    <td className="text-slate-400">{v.benefits || "—"}</td>
                    <td className="text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => edit(v)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => setConfirmDelete(v)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete VIP Level" description={confirmDelete?.name}>
        <p className="text-sm text-slate-300">Are you sure you want to delete this VIP level?</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmRemove}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
