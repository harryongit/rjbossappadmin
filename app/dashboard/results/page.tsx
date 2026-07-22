"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Spinner,
  ErrorMsg,
  PageHeader,
  EmptyState,
} from "@/components/ui";
import { listMarkets, listResults, previewResult, bulkDeclareResults } from "@/lib/admin";

const statusColor: Record<string, any> = {
  upcoming: "slate",
  open: "green",
  closed: "amber",
  result_declared: "blue",
};

export default function ResultsPage() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [declaredResults, setDeclaredResults] = useState<any[]>([]);
  const [marketId, setMarketId] = useState<number | null>(null);
  const [openResult, setOpenResult] = useState("");
  const [closeResult, setCloseResult] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingResults, setLoadingResults] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const loadMarkets = useCallback(async () => {
    try {
      const data = await listMarkets({});
      setMarkets(data.filter((m: any) => m.is_active && m.status !== "result_declared"));
    } catch {
      setMarkets([]);
    }
  }, []);

  const loadResults = useCallback(async () => {
    setLoadingResults(true);
    try {
      setDeclaredResults(await listResults());
    } catch {
      setDeclaredResults([]);
    } finally {
      setLoadingResults(false);
    }
  }, []);

  useEffect(() => {
    loadMarkets();
    loadResults();
  }, [loadMarkets, loadResults]);

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
    if (!marketId || !openResult) return;
    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      const res = await bulkDeclareResults([
        { market_id: marketId, open_result: openResult, close_result: closeResult || null },
      ]);
      const first = res.results?.[0];
      if (first?.status === "error") {
        setError(first.detail || "Failed to declare result");
      } else {
        setMsg(first?.status === "updated" ? "Result updated successfully." : "Result declared successfully.");
        setMarketId(null);
        setOpenResult("");
        setCloseResult("");
        setPreview(null);
        loadResults();
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to declare result");
    } finally {
      setLoading(false);
    }
  }

  const selectedMarket = markets.find((m: any) => m.id === marketId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Declare Results"
        description="View scraped results and declare or override market results"
      />

      {msg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
          {msg}
        </div>
      )}
      <ErrorMsg msg={error} />

      <Card title="Declare Result" subtitle="Select any active market to declare or override result">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            value={marketId ?? ""}
            onChange={(e) => setMarketId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Select market</option>
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.status} ({m.open_time?.slice(0, 5)}–{m.close_time?.slice(0, 5)})
              </option>
            ))}
          </Select>
          <Input
            placeholder="Open result (e.g. 123-4)"
            value={openResult}
            onChange={(e) => setOpenResult(e.target.value)}
          />
          <Input
            placeholder="Close result (optional, e.g. 5-678)"
            value={closeResult}
            onChange={(e) => setCloseResult(e.target.value)}
          />
        </div>
        {selectedMarket && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
            <span>Type: <span className="text-slate-200">{selectedMarket.market_type}</span></span>
            <span>Open: <span className="text-slate-200">{selectedMarket.open_time?.slice(0, 5)}</span></span>
            <span>Close: <span className="text-slate-200">{selectedMarket.close_time?.slice(0, 5)}</span></span>
            <span>Status: <Badge color={statusColor[selectedMarket.status] || "slate"}>{selectedMarket.status}</Badge></span>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
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

      <Card
        title="All Declared Results"
        subtitle={`${declaredResults.length} result(s) — including scraper-imported`}
      >
        {loadingResults ? (
          <Spinner />
        ) : declaredResults.length === 0 ? (
          <EmptyState title="No results declared yet" />
        ) : (
          <div className="table-wrap">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2.5">Market</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Open Result</th>
                  <th>Close Result</th>
                  <th>Source</th>
                  <th>Declared At</th>
                </tr>
              </thead>
              <tbody>
                {declaredResults.map((r: any) => (
                  <tr key={r.id} className="border-t border-white/5">
                    <td className="py-3 text-slate-100">{r.market_name} <span className="text-slate-500">#{r.market_id}</span></td>
                    <td>{r.market_type}</td>
                    <td><Badge color={statusColor[r.market_status] || "slate"}>{r.market_status}</Badge></td>
                    <td className="font-mono text-slate-200">{r.open_result || "—"}</td>
                    <td className="font-mono text-slate-200">{r.close_result || "—"}</td>
                    <td>
                      {r.source === "scraper" ? (
                        <Badge color="violet">Scraper</Badge>
                      ) : (
                        <Badge color="green">{r.declared_by_name}</Badge>
                      )}
                    </td>
                    <td className="text-slate-400 text-xs">{r.declared_at ? new Date(r.declared_at).toLocaleString() : "—"}</td>
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
