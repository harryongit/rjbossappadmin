"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  Input,
  Spinner,
  ErrorMsg,
  PageHeader,
} from "@/components/ui";
import { getSettings, updateSetting, getCommission, updateGlobalCommission } from "@/lib/admin";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [commission, setCommission] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, c] = await Promise.all([getSettings(), getCommission()]);
      setSettings(s);
      const active = c.find((m: any) => m.market_id);
      setCommission(active ? String(active.commission) : "");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveSetting(key: string, value: string, description?: string) {
    setMsg(null);
    try {
      await updateSetting(key, value, description);
      setMsg(`Saved ${key}`);
      load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to save");
    }
  }

  async function saveCommission() {
    setMsg(null);
    try {
      await updateGlobalCommission(parseFloat(commission));
      setMsg("Global commission updated");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to update commission");
    }
  }

  if (loading) return <Spinner className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Platform-wide configuration and commission" />

      <ErrorMsg msg={error} />
      {msg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
          {msg}
        </div>
      )}

      <Card title="Global Commission" subtitle="Applied to active markets">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Commission</label>
            <Input type="number" step="0.1" value={commission} onChange={(e) => setCommission(e.target.value)} />
          </div>
          <Button onClick={saveCommission}>Update Commission</Button>
        </div>
      </Card>

      <Card title={`${settings.length} system settings`}>
        <div className="space-y-3">
          {settings.map((s) => (
            <SettingRow key={s.key} setting={s} onSave={(value, desc) => saveSetting(s.key, value, desc)} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function SettingRow({
  setting,
  onSave,
}: {
  setting: any;
  onSave: (value: string, description?: string) => void;
}) {
  const [value, setValue] = useState(setting.value);
  const [desc, setDesc] = useState(setting.description || "");
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium text-slate-100">{setting.key}</span>
        <Button size="sm" variant="success" onClick={() => onSave(value, desc)}>Save</Button>
      </div>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Input className="mt-2" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
    </div>
  );
}
