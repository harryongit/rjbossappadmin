"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Spinner,
  ErrorMsg,
  PageHeader,
  EmptyState,
} from "@/components/ui";
import { listMarkets, previewResult, bulkDeclareResults } from "@/lib/admin";

export default function ResultsPage() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [marketId, setMarketId] = useState<number | null>(null);
  const [openResult, setOpenResult] = useState("");
  const [closeResult, setCloseResult] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    listMarkets({ status: "closed" }).then(setMarkets).catch(() => setMarkets([]));
  }, []);

  async function loadPreview() {
    if (!marketId) return;
    setLoading(true);
    setError(null);
    try {
      setPreview(await previewResult(marketId));
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load preview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPreview(null);
    if (marketId) loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketId]);

  async function declare() {
    if (!marketId) return;
    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      const res = await bulkDeclareResults([
        { market_id: marketId, open_result: openResult, close_result: closeResult || null },
      ]);
      setMsg("Result declared successfully.");
      setMarketId(null);
      setOpenResult("");
      setCloseResult("");
      setPreview(null);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to declare result");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Declare Results" description="Preview pending bets and publish market results" />

      {msg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
          {msg}
        </div>
      )}
      <ErrorMsg msg={error} />

      <Card title="Select Market" subtitle="Closed markets only">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select value={marketId ?? ""} onChange={(e) => setMarketId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Select market</option>
            {markets.map((m) => (
              <option key={m.id} value={m.id}>{m.name} (#{m.id})</option>
            ))}
          </Select>
          <Input placeholder="Open result" value={openResult} onChange={(e) => setOpenResult(e.target.value)} />
          <Input placeholder="Close result (optional)" value={closeResult} onChange={(e) => setCloseResult(e.target.value)} />
        </div>
        <div className="mt-4">
          <Button onClick={declare} disabled={!marketId || !openResult || loading}>
            {loading ? "Processing..." : "Declare Result"}
          </Button>
        </div>
      </Card>

      {loading && !preview && <Spinner />}
      {preview && (
        <Card title={`Preview — Market #${preview.market_id}`}>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-xs text-slate-500">Pending bets</div>
              <div className="text-lg font-semibold text-slate-100">{preview.total_pending_bets}</div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-xs text-slate-500">Total stakes</div>
              <div className="text-lg font-semibold text-slate-100">{preview.total_stakes}</div>
            </div>
          </div>
          {preview.bets?.length ? (
            <div className="table-wrap">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2.5">Bet ID</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Number</th>
                    <th>Amount</th>
                    <th>Potential Win</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.bets.map((b: any) => (
                    <tr key={b.id} className="border-t border-white/5">
                      <td className="py-3 text-slate-500">{b.id}</td>
                      <td className="text-slate-100">{b.user_id}</td>
                      <td>{b.bet_type}</td>
                      <td>{b.selected_number}</td>
                      <td>{b.amount}</td>
                      <td>{b.potential_win}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No pending bets for this market" />
          )}
        </Card>
      )}
    </div>
  );
}
