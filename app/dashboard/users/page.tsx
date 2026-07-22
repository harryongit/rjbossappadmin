"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  Spinner,
  ErrorMsg,
  PageHeader,
  DataTable,
  EmptyState,
  Field,
} from "@/components/ui";
import {
  listUsers,
  toggleUserActive,
  addUserBonus,
  resetUserPassword,
  getUserDetailed,
} from "@/lib/admin";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ username: "", phone: "", is_active: "" });

  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);

  const [bonusUser, setBonusUser] = useState<any>(null);
  const [bonusAmount, setBonusAmount] = useState("0");
  const [bonusDesc, setBonusDesc] = useState("Bonus credited");
  const [resetUser, setResetUser] = useState<any>(null);
  const [resetPw, setResetPw] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filters.username) params.username = filters.username;
      if (filters.phone) params.phone = filters.phone;
      if (filters.is_active !== "") params.is_active = filters.is_active === "true";
      const data = await listUsers(params);
      setUsers(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function openDetail(user: any) {
    setSelected(user);
    setDetail(null);
    try {
      const d = await getUserDetailed(user.id);
      setDetail(d);
    } catch {
      // ignore
    }
  }

  async function handleToggle(user: any) {
    await toggleUserActive(user.id);
    load();
  }

  async function submitBonus() {
    if (!bonusUser) return;
    await addUserBonus(bonusUser.id, parseFloat(bonusAmount), bonusDesc);
    setBonusUser(null);
    setActionMsg("Bonus credited successfully");
    load();
  }

  async function submitReset() {
    if (!resetUser) return;
    try {
      await resetUserPassword(resetUser.id, resetPw);
      setResetUser(null);
      setResetPw("");
      setActionMsg("Password reset successfully");
    } catch (e: any) {
      setActionError(e?.response?.data?.detail || "Failed to reset password");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage accounts, balances and access" />

      <ErrorMsg msg={error} />
      {actionMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
          {actionMsg}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Username"
            value={filters.username}
            onChange={(e) => setFilters({ ...filters, username: e.target.value })}
          />
          <Input
            placeholder="Phone"
            value={filters.phone}
            onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
          />
          <Select
            value={filters.is_active}
            onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
          >
            <option value="">All status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
          <Button onClick={load} className="w-full sm:w-auto">
            Search
          </Button>
        </div>
      </Card>

      <Card title={`${users.length} users`} bodyClassName="p-0">
        {loading ? (
          <div className="p-4">
            <Spinner />
          </div>
        ) : (
          <DataTable
            getRowKey={(u) => u.id}
            rows={users}
            columns={[
              { key: "id", header: "ID", className: "w-12 text-slate-500" },
              {
                key: "username",
                header: "Username",
                render: (u) => (
                  <span className="font-medium text-slate-100">
                    {u.username}
                    {u.username === "admin" && <Badge color="brand" className="ml-2">Owner</Badge>}
                  </span>
                ),
              },
              { key: "phone", header: "Phone" },
              { key: "balance", header: "Balance", render: (u) => Number(u.wallet_balance).toFixed(2) },
              {
                key: "status",
                header: "Status",
                render: (u) => (
                  <Badge color={u.is_active ? "green" : "red"}>
                    {u.is_active ? "Active" : "Inactive"}
                  </Badge>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                render: (u) => (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => openDetail(u)}>View</Button>
                    <Button size="sm" variant="secondary" onClick={() => handleToggle(u)}>
                      {u.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => { setBonusAmount("0"); setBonusDesc("Bonus credited"); setBonusUser(u); }}>
                      Bonus
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => { setResetPw(""); setResetUser(u); }}>
                      Reset PW
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>

      {/* Detail */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="User Details" description={selected?.username}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Username" value={selected.username} />
              <Field label="Phone" value={selected.phone} />
              <Field label="Balance" value={Number(selected.wallet_balance).toFixed(2)} />
              <Field label="Admin" value={selected.username === "admin" ? "Yes" : "No"} />
              <Field label="Active" value={selected.is_active ? "Yes" : "No"} />
            </div>
            {detail && (
              <div className="rounded-xl border border-white/5 bg-ink-900/60 p-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Activity
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Total Bets" value={detail.total_bets} />
                  <Field label="Total Wins" value={Number(detail.total_wins).toFixed(2)} />
                  <Field label="Deposits" value={Number(detail.total_deposits).toFixed(2)} />
                  <Field label="Withdrawals" value={Number(detail.total_withdrawals).toFixed(2)} />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Bonus modal */}
      <Modal open={!!bonusUser} onClose={() => setBonusUser(null)} title={`Add Bonus — ${bonusUser?.username ?? ""}`}>
        <div className="space-y-4">
          <Field label="Amount">
            <Input type="number" value={bonusAmount} onChange={(e) => setBonusAmount(e.target.value)} />
          </Field>
          <Field label="Description">
            <Input value={bonusDesc} onChange={(e) => setBonusDesc(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setBonusUser(null)}>Cancel</Button>
            <Button onClick={submitBonus}>Credit</Button>
          </div>
        </div>
      </Modal>

      {/* Reset password modal */}
      <Modal open={!!resetUser} onClose={() => setResetUser(null)} title={`Reset Password — ${resetUser?.username ?? ""}`}>
        <div className="space-y-4">
          <ErrorMsg msg={actionError} />
          <Field label="New Password">
            <Input value={resetPw} onChange={(e) => setResetPw(e.target.value)} placeholder="Enter new password" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setResetUser(null)}>Cancel</Button>
            <Button variant="danger" onClick={submitReset}>Reset</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
