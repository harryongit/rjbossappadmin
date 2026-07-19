"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Select,
  Badge,
  Spinner,
  ErrorMsg,
  PageHeader,
  Modal,
} from "@/components/ui";
import { listDeposits, processDeposit } from "@/lib/admin";
import type { DepositRequest } from "@/lib/types";

const STATUSES = ["pending", "completed", "rejected"];
const statusColor: Record<string, any> = {
  pending: "amber",
  completed: "green",
  rejected: "red",
};

export default function DepositsPage() {
  const [items, setItems] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");
  const [confirm, setConfirm] = useState<{ txn: string; action: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (status) params.status = status;
      setItems(await listDeposits(params));
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load deposits");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  function openConfirm(txn: string, action: string) {
    setConfirm({ txn, action });
  }

  async function doProcess() {
    if (!confirm) return;
    await processDeposit(confirm.txn, confirm.action);
    setConfirm(null);
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deposits"
        description="Approve or reject user deposit requests"
        actions={
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        }
      />
      <ErrorMsg msg={error} />

      <Card title={`${items.length} requests`} bodyClassName="p-0">
        {loading ? (
          <div className="p-4"><Spinner /></div>
        ) : (
          <div className="table-wrap">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th>Txn ID</th>
                  <th>User</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 font-medium text-slate-100">{d.txn_id}</td>
                    <td className="text-slate-500">{d.user_id}</td>
                    <td className="text-slate-400">{d.method}</td>
                    <td>{Number(d.amount).toFixed(2)}</td>
                    <td>
                      <Badge color={statusColor[d.status] ?? "slate"}>{d.status}</Badge>
                    </td>
                    <td className="text-slate-400">
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button size="sm" variant="success" disabled={d.status !== "pending"} onClick={() => openConfirm(d.txn_id, "approve")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" disabled={d.status !== "pending"} onClick={() => openConfirm(d.txn_id, "reject")}>
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={`${confirm?.action === "approve" ? "Approve" : "Reject"} deposit`}
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to <b>{confirm?.action}</b> deposit {confirm?.txn}?
          {confirm?.action === "approve" && " This will credit the user's wallet."}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant={confirm?.action === "reject" ? "danger" : "success"} onClick={doProcess}>
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}
