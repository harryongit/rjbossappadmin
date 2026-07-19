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
import { listWithdrawals, processWithdrawal, bulkApproveWithdrawals } from "@/lib/admin";

const STATUSES = ["pending", "approved", "rejected", "processed"];
const statusColor: Record<string, any> = {
  approved: "green",
  rejected: "red",
  processed: "blue",
  pending: "amber",
};

export default function WithdrawalsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");
  const [selected, setSelected] = useState<number[]>([]);
  const [confirm, setConfirm] = useState<{ id: number; action: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (status) params.status = status;
      setItems(await listWithdrawals(params));
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function openConfirm(id: number, action: string) {
    setConfirm({ id, action });
  }

  async function doProcess() {
    if (!confirm) return;
    await processWithdrawal(confirm.id, confirm.action);
    setConfirm(null);
    load();
  }

  async function bulkApprove() {
    if (selected.length === 0) return;
    await bulkApproveWithdrawals(selected);
    setSelected([]);
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdrawals"
        description="Approve, process or reject payout requests"
        actions={
          <>
            <Button onClick={bulkApprove} disabled={selected.length === 0 || status !== "pending"}>
              Bulk Approve ({selected.length})
            </Button>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </>
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
                  <th className="py-2.5">
                    <input
                      type="checkbox"
                      className="accent-brand-600"
                      onChange={(e) =>
                        setSelected(e.target.checked ? items.map((i) => i.id) : [])
                      }
                    />
                  </th>
                  <th>ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((w) => (
                  <tr key={w.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3">
                      <input
                        type="checkbox"
                        className="accent-brand-600"
                        checked={selected.includes(w.id)}
                        onChange={() => toggle(w.id)}
                      />
                    </td>
                    <td className="text-slate-500">{w.id}</td>
                    <td className="font-medium text-slate-100">{w.user_id}</td>
                    <td>{Number(w.amount).toFixed(2)}</td>
                    <td>
                      <Badge color={statusColor[w.status] ?? "slate"}>{w.status}</Badge>
                    </td>
                    <td className="text-slate-400">
                      {new Date(w.requested_at).toLocaleString()}
                    </td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button size="sm" variant="success" onClick={() => openConfirm(w.id, "approve")}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openConfirm(w.id, "process")}>
                          Process
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => openConfirm(w.id, "reject")}>
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
        title={`${confirm?.action === "approve" ? "Approve" : confirm?.action === "process" ? "Process" : "Reject"} withdrawal`}
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to <b>{confirm?.action}</b> withdrawal request #{confirm?.id}?
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
