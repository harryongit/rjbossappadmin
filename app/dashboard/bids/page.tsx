"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Select,
  Badge,
  Spinner,
  ErrorMsg,
  PageHeader,
} from "@/components/ui";
import { listBids } from "@/lib/admin";
import type { Bid } from "@/lib/types";

const STATUSES = ["pending", "won", "lost", "cancelled"];
const statusColor: Record<string, any> = {
  pending: "amber",
  won: "green",
  lost: "red",
  cancelled: "slate",
};

export default function BidsPage() {
  const [items, setItems] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [marketId, setMarketId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (status) params.status = status;
      if (marketId) params.market_id = Number(marketId);
      setItems(await listBids(params));
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load bids");
    } finally {
      setLoading(false);
    }
  }, [status, marketId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bids"
        description="View all placed bets across markets"
        actions={
          <div className="flex gap-2">
            <Select value={marketId} onChange={(e) => setMarketId(e.target.value)} className="w-40">
              <option value="">All markets</option>
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
        }
      />
      <ErrorMsg msg={error} />

      <Card title={`${items.length} bids`} bodyClassName="p-0">
        {loading ? (
          <div className="p-4"><Spinner /></div>
        ) : (
          <div className="table-wrap">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th>ID</th>
                  <th>User</th>
                  <th>Market</th>
                  <th>Type</th>
                  <th>Number</th>
                  <th>Amount</th>
                  <th>Potential Win</th>
                  <th>Status</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 text-slate-500">{b.id}</td>
                    <td className="font-medium text-slate-100">{b.username || b.user_id}</td>
                    <td>{b.market_name}</td>
                    <td className="text-slate-400">{b.bet_type}</td>
                    <td>{b.selected_number}</td>
                    <td>{Number(b.amount).toFixed(2)}</td>
                    <td>{Number(b.potential_win).toFixed(2)}</td>
                    <td>
                      <Badge color={statusColor[b.status] ?? "slate"}>{b.status}</Badge>
                    </td>
                    <td className="text-slate-400">
                      {new Date(b.placed_at).toLocaleString()}
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
