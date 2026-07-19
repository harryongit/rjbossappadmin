import client, { getToken, setToken, clearToken } from "./api";

export interface LoginResult {
  access_token: string;
  token_type: string;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  const res = await client.post<LoginResult>("/auth/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  setToken(res.data.access_token);
  return res.data;
}

export function logout() {
  clearToken();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/* ---------------- Admin: Stats ---------------- */

export async function getOverviewStats(dateFrom?: string, dateTo?: string) {
  const params: any = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  const res = await client.get("/admin/stats/overview", { params });
  return res.data;
}

export async function getRevenueReport(period: string, dateFrom?: string, dateTo?: string) {
  const params: any = { period };
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  const res = await client.get("/admin/stats/revenue", { params });
  return res.data;
}

export async function getMarketSummaries() {
  const res = await client.get("/admin/stats/markets");
  return res.data;
}

export async function getTopBettors(limit = 10) {
  const res = await client.get("/admin/stats/top-bettors", { params: { limit } });
  return res.data;
}

export async function getUserGrowth(days = 30) {
  const res = await client.get("/admin/stats/user-growth", { params: { days } });
  return res.data;
}

/* ---------------- Admin: Users ---------------- */

export async function listUsers(params: any = {}) {
  const res = await client.get("/admin/users", { params });
  return res.data;
}

export async function getUser(userId: number) {
  const res = await client.get(`/admin/users/${userId}`);
  return res.data;
}

export async function getUserDetailed(userId: number) {
  const res = await client.get(`/admin/users/${userId}/detailed`);
  return res.data;
}

export async function updateUser(userId: number, data: any) {
  const res = await client.put(`/admin/users/${userId}`, data);
  return res.data;
}

export async function toggleUserActive(userId: number) {
  const res = await client.put(`/admin/users/${userId}/toggle-active`);
  return res.data;
}

export async function updateUserVip(userId: number, vipLevel: number) {
  const res = await client.put(`/admin/users/${userId}/vip`, null, {
    params: { vip_level: vipLevel },
  });
  return res.data;
}

export async function addUserBonus(userId: number, amount: number, description: string) {
  const res = await client.post(
    `/admin/users/${userId}/bonus`,
    { user_id: userId, amount, description },
    { params: {} }
  );
  return res.data;
}

export async function resetUserPassword(userId: number, newPassword: string) {
  const res = await client.put(`/admin/users/${userId}/reset-password`, null, {
    params: { new_password: newPassword },
  });
  return res.data;
}

/* ---------------- Admin: Markets ---------------- */

export async function listMarkets(params: any = {}) {
  const res = await client.get("/admin/markets", { params });
  return res.data;
}

export async function updateMarketStatus(marketId: number, status: string) {
  const res = await client.put(`/admin/markets/${marketId}/status`, null, {
    params: { status },
  });
  return res.data;
}

export async function softDeleteMarket(marketId: number) {
  const res = await client.delete(`/admin/markets/${marketId}`);
  return res.data;
}

export async function cloneMarket(marketId: number, newName: string) {
  const res = await client.post(`/admin/markets/${marketId}/clone`, null, {
    params: { new_name: newName },
  });
  return res.data;
}

export async function createMarket(data: any) {
  const res = await client.post("/admin/markets", data);
  return res.data;
}

export async function updateMarket(marketId: number, data: any) {
  const res = await client.put(`/admin/markets/${marketId}`, data);
  return res.data;
}

export async function bulkUpdateOdds(marketId: number, odds: Record<string, number>) {
  const res = await client.put(`/admin/markets/${marketId}/odds/bulk`, { odds });
  return res.data;
}

/* ---------------- Admin: Results ---------------- */

export async function previewResult(marketId: number) {
  const res = await client.get(`/admin/results/${marketId}/preview`);
  return res.data;
}

export async function bulkDeclareResults(results: any[]) {
  const res = await client.post("/admin/results/bulk-declare", { results });
  return res.data;
}

/* ---------------- Admin: Withdrawals ---------------- */

export async function listWithdrawals(params: any = {}) {
  const res = await client.get("/admin/withdrawals", { params });
  return res.data;
}

export async function processWithdrawal(requestId: number, action: string) {
  const res = await client.post(`/admin/withdrawals/${requestId}/${action}`);
  return res.data;
}

export async function bulkApproveWithdrawals(requestIds: number[]) {
  const res = await client.post("/admin/withdrawals/bulk-approve", {
    request_ids: requestIds,
  });
  return res.data;
}

/* ---------------- Admin: Deposits ---------------- */

export async function listDeposits(params: any = {}) {
  const res = await client.get("/admin/deposits", { params });
  return res.data;
}

export async function processDeposit(txnId: string, action: string) {
  const res = await client.post(`/admin/deposits/${txnId}/${action}`);
  return res.data;
}

/* ---------------- Admin: Bids ---------------- */

export async function listBids(params: any = {}) {
  const res = await client.get("/admin/bids", { params });
  return res.data;
}

/* ---------------- Admin: Game Rates ---------------- */

export async function listGameRates(marketId?: number) {
  const params: any = {};
  if (marketId) params.market_id = marketId;
  const res = await client.get("/admin/game-rates", { params });
  return res.data;
}

export async function createGameRate(data: any) {
  const res = await client.post("/admin/game-rates", data);
  return res.data;
}

export async function updateGameRate(rateId: number, data: any) {
  const res = await client.put(`/admin/game-rates/${rateId}`, data);
  return res.data;
}

/* ---------------- Admin: VIP ---------------- */

export async function listVipLevels() {
  const res = await client.get("/admin/vip");
  return res.data;
}

export async function createVipLevel(data: any) {
  const res = await client.post("/admin/vip", data);
  return res.data;
}

export async function updateVipLevel(levelId: number, data: any) {
  const res = await client.put(`/admin/vip/${levelId}`, data);
  return res.data;
}

export async function deleteVipLevel(levelId: number) {
  const res = await client.delete(`/admin/vip/${levelId}`);
  return res.data;
}

/* ---------------- Admin: Commission ---------------- */

export async function getCommission() {
  const res = await client.get("/admin/commission");
  return res.data;
}

export async function updateGlobalCommission(commission: number) {
  const res = await client.put("/admin/commission", { commission });
  return res.data;
}

/* ---------------- Admin: Settings ---------------- */

export async function getSettings() {
  const res = await client.get("/admin/settings");
  return res.data;
}

export async function updateSetting(key: string, value: string, description?: string) {
  const res = await client.put("/admin/settings", { key, value, description });
  return res.data;
}

/* ---------------- Admin: Notices ---------------- */

export async function listNotices(params: any = {}) {
  const res = await client.get("/admin/notices", { params });
  return res.data;
}

export async function createNotice(data: any) {
  const res = await client.post("/admin/notices", data);
  return res.data;
}

export async function updateNotice(noticeId: number, data: any) {
  const res = await client.put(`/admin/notices/${noticeId}`, data);
  return res.data;
}

/* ---------------- Admin: Audit Logs ---------------- */

export async function getAuditLogs(params: any = {}) {
  const res = await client.get("/admin/audit-logs", { params });
  return res.data;
}
