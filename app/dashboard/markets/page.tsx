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
} from "@/components/ui";
import {
  listMarkets,
  updateMarketStatus,
  softDeleteMarket,
  createMarket,
  updateMarket,
} from "@/lib/admin";

const STATUSES = ["upcoming", "open", "closed", "result_declared"];
const statusColor: Record<string, any> = {
  upcoming: "slate",
  open: "green",
  closed: "amber",
  result_declared: "blue",
};

export default function MarketsPage() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [edit, setEdit] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    market_type: "regular",
    open_time: "",
    close_time: "",
    schedules: [] as { result_time: string; session_label: string }[],
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      setMarkets(await listMarkets(params));
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load markets");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setFormData({
      name: "",
      market_type: "regular",
      open_time: "",
      close_time: "",
      schedules: [],
    });
    setEdit({ isNew: true });
  }

  function openEdit(m: any) {
    setFormData({
      name: m.name || "",
      market_type: m.market_type || "regular",
      open_time: m.open_time || "",
      close_time: m.close_time || "",
      schedules: m.schedules || [],
    });
    setEdit(m);
  }

  async function saveMarket(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        market_type: formData.market_type,
        open_time: formData.open_time,
        close_time: formData.close_time,
      };
      if (formData.market_type === "starline") {
        payload.schedules = formData.schedules;
      }

      if (edit?.isNew) {
        await createMarket(payload);
      } else {
        await updateMarket(edit.id, payload);
      }
      setEdit(null);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Error saving market");
    }
  }

  async function confirmRemove() {
    if (!confirmDelete) return;
    await softDeleteMarket(confirmDelete.id);
    setConfirmDelete(null);
    load();
  }

  function addSchedule() {
    setFormData({
      ...formData,
      schedules: [...formData.schedules, { result_time: "", session_label: "" }],
    });
  }

  function removeSchedule(idx: number) {
    const newSchedules = [...formData.schedules];
    newSchedules.splice(idx, 1);
    setFormData({ ...formData, schedules: newSchedules });
  }

  function updateSchedule(idx: number, field: string, val: string) {
    const newSchedules = [...formData.schedules];
    (newSchedules[idx] as any)[field] = val;
    setFormData({ ...formData, schedules: newSchedules });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Markets"
        description="Manage market schedules and status"
        actions={
          <div className="flex gap-3">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Button onClick={openCreate} className="gap-2">
              <span>+</span> Create Market
            </Button>
          </div>
        }
      />
      <ErrorMsg msg={error} />

      <Card title={`${markets.length} markets`} bodyClassName="p-0">
        {loading ? (
          <div className="p-4"><Spinner /></div>
        ) : (
          <div className="table-wrap">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2.5">ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Open / Close</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((m) => (
                  <tr key={m.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 text-slate-500">{m.id}</td>
                    <td className="font-medium text-slate-100">{m.name}</td>
                    <td>
                      <Badge color={m.market_type === "starline" ? "violet" : "slate"}>
                        {m.market_type}
                      </Badge>
                    </td>
                    <td>
                      <div className="text-xs text-slate-400">
                        {m.open_time} - {m.close_time}
                      </div>
                    </td>
                    <td>
                      <Badge color={statusColor[m.status] ?? "slate"}>{m.status}</Badge>
                    </td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => openEdit(m)}>Edit</Button>
                        <Button size="sm" variant="secondary" onClick={() => updateMarketStatus(m.id, m.status === "open" ? "closed" : "open")}>
                          {m.status === "open" ? "Close" : "Open"}
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setConfirmDelete(m)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.isNew ? "Create Market" : `Edit Market: ${edit?.name || ""}`}>
        {edit && (
          <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-2">
            <form onSubmit={saveMarket} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Name</label>
                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Market Name" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Type</label>
                <Select value={formData.market_type} onChange={(e) => setFormData({ ...formData, market_type: e.target.value })}>
                  <option value="regular">Regular</option>
                  <option value="starline">Starline</option>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Open Time (HH:MM)</label>
                  <Input required value={formData.open_time} onChange={(e) => setFormData({ ...formData, open_time: e.target.value })} placeholder="10:00" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Close Time (HH:MM)</label>
                  <Input required value={formData.close_time} onChange={(e) => setFormData({ ...formData, close_time: e.target.value })} placeholder="12:00" />
                </div>
              </div>

              {formData.market_type === "starline" && (
                <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-200">Schedules</div>
                    <Button size="sm" type="button" onClick={addSchedule}>+ Add Schedule</Button>
                  </div>
                  {formData.schedules.length === 0 && (
                    <div className="text-xs text-slate-400 italic">No schedules added.</div>
                  )}
                  {formData.schedules.map((sch, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={sch.session_label} onChange={(e) => updateSchedule(i, "session_label", e.target.value)} placeholder="Label (e.g. 10 AM)" className="flex-1" />
                      <Input required value={sch.result_time} onChange={(e) => updateSchedule(i, "result_time", e.target.value)} placeholder="Time (HH:MM)" className="w-32" />
                      <Button variant="danger" type="button" size="sm" onClick={() => removeSchedule(i)}>
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button type="submit" className="w-full">Save Market</Button>
            </form>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Market"
        description={confirmDelete?.name}
      >
        <p className="text-sm text-slate-300">
          This will soft-delete the market. Are you sure you want to continue?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmRemove}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
