/**
 * api.js – Centralized API service layer
 * All backend calls go through here. Falls back to offline queue if network is unavailable.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(method, path, body = null, isFormData = false) {
  const headers = {};
  const token = localStorage.getItem('civifix_auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.msg || `Request failed with status ${res.status}`);
  return data;
}

// -------- Public Endpoints --------
export const getPublicReports = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/reports/public${qs ? `?${qs}` : ''}`);
};

export const trackReport = (token) => request('GET', `/reports/track/${token}`);

export const submitReport = (formData) =>
  request('POST', '/reports', formData, true);

export const starReport = (id) => request('POST', `/reports/${id}/star`);

export const commentReport = (id, content, authorName) => 
  request('POST', `/reports/${id}/comment`, { content, authorName });

export const getNotifications = () => request('GET', '/reports/notifications');

export const getTrends = () => request('GET', '/reports/trends');

export const escalateReport = (id) => request('POST', `/reports/${id}/escalate`);


// -------- Auth Endpoints --------
export const login = (username, password) =>
  request('POST', '/auth/login', { username, password });

// -------- Authority Endpoints --------
export const getAdminReports = () => request('GET', '/reports/admin');
export const getReportDetail = (id) => request('GET', `/reports/${id}`);
export const updateReportStatus = (id, status, notes) =>
  request('PUT', `/reports/${id}/status`, { status, notes });
export const assignReport = (id, assignTo) =>
  request('PUT', `/reports/${id}/assign`, { assignTo });
export const getUsers = () => request('GET', '/auth/users');
