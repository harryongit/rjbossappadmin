"use client";

import React, { useEffect, useState } from "react";
import { Card, Select, Spinner, ErrorMsg, StatCard, PageHeader, Badge, DataTable } from "@/components/ui";
import {
  getOverviewStats,
  getRevenueReport,
  getMarketSummaries,
  getTopBettors,
  getUserGrowth,
} from "@/lib/admin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
} from "recharts";

const fmt = (n: any) => {
  if (n === undefined || n === null) return "—";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const tooltipStyle = {
  background: "#0f1626",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
} as const;

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [topBettors, setTopBettors] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any[]>([]);
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, r, m, t, g] = await Promise.all([
        getOverviewStats(),
        getRevenueReport(period),
        getMarketSummaries(),
        getTopBettors(5),
        getUserGrowth(30),
      ]);
      setStats(s);
      setRevenue(Array.isArray(r) ? r : []);
      setMarkets(m);
      setTopBettors(t);
      setGrowth(g);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  if (loading && !stats) return <Spinner className="min-h-[60vh]" />;

  const cards = [
    { label: "Total Users", value: stats?.total_users, icon: "👥", accent: "sky" as const },
    { label: "Active (24h)", value: stats?.active_users_24h, icon: "⚡", accent: "emerald" as const },
    { label: "Bets Today", value: stats?.total_bets_today, icon: "🎯", accent: "violet" as const },
    { label: "Revenue", value: fmt(stats?.total_revenue), icon: "💰", accent: "brand" as const },
    { label: "Deposits", value: fmt(stats?.total_deposits), icon: "⬇", accent: "emerald" as const },
    { label: "Withdrawals", value: fmt(stats?.total_withdrawals), icon: "⬆", accent: "amber" as const },
    { label: "Pending Withdrawals", value: stats?.pending_withdrawals, icon: "⏳", accent: "amber" as const },
    { label: "Net P/L", value: fmt(stats?.net_pl), icon: "📊", accent: "violet" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your platform"
        actions={
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-400 sm:inline">Revenue period</span>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-32">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </div>
        }
      />

      <ErrorMsg msg={error} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value ?? "—"} icon={c.icon} accent={c.accent} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card title="Revenue Report" subtitle={`Grouped by ${period}`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#9f1239" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="period" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="amount" fill="url(#rev)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="User Growth" subtitle="New users over last 30 days">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card title="Top Bettors" subtitle="Highest net profit/loss">
          <DataTable
            getRowKey={(b) => b.user_id}
            rows={topBettors}
            columns={[
              { key: "username", header: "User", render: (b) => <span className="font-medium text-slate-100">{b.username}</span> },
              { key: "wagered", header: "Wagered", render: (b) => fmt(b.total_wagered) },
              { key: "won", header: "Won", render: (b) => fmt(b.total_won) },
              {
                key: "net", header: "Net P/L", render: (b) => (
                  <span className={b.net_pl >= 0 ? "text-emerald-400" : "text-red-400"}>{fmt(b.net_pl)}</span>
                ),
              },
            ]}
          />
        </Card>

        <Card title="Market Performance" subtitle="Top markets by activity">
          <DataTable
            getRowKey={(m) => m.market_id}
            rows={markets.slice(0, 8)}
            columns={[
              { key: "name", header: "Market", render: (m) => <span className="font-medium text-slate-100">{m.market_name}</span> },
              { key: "bets", header: "Bets", render: (m) => m.total_bets },
              { key: "stakes", header: "Stakes", render: (m) => fmt(m.total_stakes) },
              {
                key: "net", header: "Net P/L", render: (m) => (
                  <span className={m.net_pl >= 0 ? "text-emerald-400" : "text-red-400"}>{fmt(m.net_pl)}</span>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
