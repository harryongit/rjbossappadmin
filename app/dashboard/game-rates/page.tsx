"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Spinner,
  ErrorMsg,
  PageHeader,
  Badge,
} from "@/components/ui";
import { listGameRates, createGameRate, updateGameRate, listMarkets } from "@/lib/admin";

const betColor: Record<string, any> = {
  single: "brand",
  jodi: "violet",
  single_patti: "sky",
  double_patti: "emerald",
  triple_patti: "amber",
};

export default function GameRatesPage() {
  const [rates, setRates] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ market_id: "", bet_type: "", rate: "", valid_from: "", valid_to: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, m] = await Promise.all([listGameRates(), listMarkets()]);
      setRates(r);
      setMarkets(m);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load game rates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function reset() {
    setForm({ market_id: "", bet_type: "", rate: "", valid_from: "", valid_to: "" });
    setEditingId(null);
  }

  function edit(r: any) {
    setEditingId(r.id);
    setForm({
      market_id: r.market_id ?? "",
      bet_type: r.bet_type,
      rate: String(r.rate),
      valid_from: r.valid_from ? r.valid_from.slice(0, 16) : "",
      valid_to: r.valid_to ? r.valid_to.slice(0, 16) : "",
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: any = {
      bet_type: form.bet_type,
      rate: parseFloat(form.rate),
      market_id: form.market_id ? Number(form.market_id) : null,
      valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
      valid_to: form.valid_to ? new Date(form.valid_to).toISOString() : null,
    };
    if (editingId) {
      await updateGameRate(editingId, payload);
    } else {
      await createGameRate(payload);
    }
    reset();
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Game Rates" description="Configure payout multipliers per bet type" />

      <ErrorMsg msg={error} />

      <Card title={editingId ? "Edit Game Rate" : "New Game Rate"}>
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={form.market_id} onChange={(e) => setForm({ ...form, market_id: e.target.value })}>
            <option value="">Global (no market)</option>
            {markets.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
          <Select value={form.bet_type} onChange={(e) => setForm({ ...form, bet_type: e.target.value })} required>
            <option value="">Bet type…</option>
            <option value="single">single</option>
            <option value="jodi">jodi</option>
            <option value="single_patti">single_patti</option>
            <option value="double_patti">double_patti</option>
            <option value="triple_patti">triple_patti</option>
          </Select>
          <Input type="number" step="0.1" placeholder="Rate" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} required />
          <Input type="datetime-local" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
          <Input type="datetime-local" value={form.valid_to} onChange={(e) => setForm({ ...form, valid_to: e.target.value })} />
          <div className="sm:col-span-2 lg:col-span-5 flex gap-2">
            <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={reset}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      <Card title={`${rates.length} rates`} bodyClassName="p-0">
        {loading ? (
          <div className="p-4"><Spinner /></div>
        ) : (
          <div className="table-wrap">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2.5">ID</th>
                  <th>Market</th>
                  <th>Bet Type</th>
                  <th>Rate</th>
                  <th>Valid From</th>
                  <th>Valid To</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 text-slate-500">{r.id}</td>
                    <td className="font-medium text-slate-100">{r.market_id ?? "Global"}</td>
                    <td><Badge color={betColor[r.bet_type] ?? "slate"}>{r.bet_type}</Badge></td>
                    <td className="font-semibold text-slate-100">{r.rate}</td>
                    <td className="text-slate-400">{r.valid_from || "—"}</td>
                    <td className="text-slate-400">{r.valid_to || "—"}</td>
                    <td className="text-right">
                      <Button size="sm" variant="outline" onClick={() => edit(r)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
