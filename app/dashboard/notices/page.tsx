"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Textarea,
  Spinner,
  ErrorMsg,
  PageHeader,
  Badge,
  EmptyState,
} from "@/components/ui";
import { listNotices, createNotice, updateNotice } from "@/lib/admin";

const priorityColor: Record<string, any> = { high: "red", low: "slate", normal: "blue" };

export default function NoticesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", message: "", priority: "normal", expiry_date: "", scheduled_at: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listNotices());
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load notices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function reset() {
    setForm({ title: "", message: "", priority: "normal", expiry_date: "", scheduled_at: "" });
    setEditingId(null);
  }

  function edit(n: any) {
    setEditingId(n.id);
    setForm({
      title: n.title,
      message: n.message,
      priority: n.priority,
      expiry_date: n.expiry_date ? n.expiry_date.slice(0, 16) : "",
      scheduled_at: n.scheduled_at ? n.scheduled_at.slice(0, 16) : "",
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      title: form.title,
      message: form.message,
      priority: form.priority,
      expiry_date: form.expiry_date ? new Date(form.expiry_date).toISOString() : null,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
    };
    if (editingId) {
      await updateNotice(editingId, payload);
    } else {
      await createNotice(payload);
    }
    reset();
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notices" description="Broadcast announcements to your users" />

      <ErrorMsg msg={error} />

      <Card title={editingId ? "Edit Notice" : "Broadcast Notice"}>
        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </Select>
            <Input type="datetime-local" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
            <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? "Update" : "Broadcast"}</Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={reset}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      <Card title={`${items.length} notices`}>
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState title="No notices yet" />
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-ink-900/50 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-100">{n.title}</span>
                    <Badge color={priorityColor[n.priority] ?? "slate"}>{n.priority}</Badge>
                  </div>
                  <div className="mt-1 text-sm text-slate-400">{n.message}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => edit(n)}>Edit</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
