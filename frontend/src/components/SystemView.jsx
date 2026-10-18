import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, CheckCircle2, AlertCircle, RefreshCw, Code, Shield } from 'lucide-react';
import { api } from '../services/api';

export default function SystemView({ apiHealthy, onRefreshAll }) {
  const [healthData, setHealthData] = useState(null);
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState(new Date().toLocaleTimeString());

  const fetchHealth = async () => {
    setChecking(true);
    try {
      const data = await api.getHealth();
      setHealthData(data);
      setLastCheck(new Date().toLocaleTimeString());
    } catch (err) {
      setHealthData({ status: 'offline', error: err.message });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const endpoints = [
    { method: 'GET', path: '/api/health', desc: 'System health check and database connectivity' },
    { method: 'GET', path: '/api/dashboard/stats', desc: 'Summary metrics, course distributions, and recent additions' },
    { method: 'GET', path: '/api/students', desc: 'Paginated student records with search, filter, and sorting' },
    { method: 'GET', path: '/api/students/:id', desc: 'Fetch single student profile by Student ID' },
    { method: 'POST', path: '/api/students', desc: 'Enroll new student with server validation and auto-generated ID' },
    { method: 'PUT', path: '/api/students/:id', desc: 'Update student profile with duplicate-email prevention' },
    { method: 'DELETE', path: '/api/students/:id', desc: 'Permanently remove student record after confirmation' }
  ];

  return (
    <div className="system-view-container">
      {/* Top Status Card */}
      <div className="system-status-card">
        <div className="system-status-header">
          <div className="status-title-wrap">
            <Activity size={24} className="text-primary" />
            <div>
              <h2>System Health & Diagnostics</h2>
              <p>Real-time monitor of Express backend server, SQLite storage, and REST APIs</p>
            </div>
          </div>
          <button 
            onClick={() => { fetchHealth(); onRefreshAll(); }} 
            className="btn-secondary"
            disabled={checking}
          >
            <RefreshCw size={16} className={checking ? 'spinning' : ''} />
            <span>Re-verify Connection</span>
          </button>
        </div>

        <div className="system-cards-grid">
          <div className="system-metric-box">
            <div className="metric-box-top">
              <Server size={20} color="#3b82f6" />
              <span className={`badge ${apiHealthy ? 'badge-active' : 'badge-inactive'}`}>
                {apiHealthy ? 'Online' : 'Unreachable'}
              </span>
            </div>
            <div className="metric-box-label">Express Backend API</div>
            <div className="metric-box-sub">Port 5000 • Node.js Runtime</div>
          </div>

          <div className="system-metric-box">
            <div className="metric-box-top">
              <Database size={20} color="#10b981" />
              <span className={`badge ${healthData?.database === 'healthy' ? 'badge-active' : 'badge-inactive'}`}>
                {healthData?.database === 'healthy' ? 'Healthy (WAL)' : 'Unknown'}
              </span>
            </div>
            <div className="metric-box-label">SQLite Database Engine</div>
            <div className="metric-box-sub">students.db • Persistent Storage</div>
          </div>

          <div className="system-metric-box">
            <div className="metric-box-top">
              <Shield size={20} color="#8b5cf6" />
              <span className="badge badge-active">Active</span>
            </div>
            <div className="metric-box-label">Data Security & CORS</div>
            <div className="metric-box-sub">Parameterized SQL • Strict Origin</div>
          </div>
        </div>

        <div className="system-meta-footer">
          <span>Last automated heartbeat verification: <strong>{lastCheck}</strong></span>
        </div>
      </div>

      {/* REST Endpoints Reference Card */}
      <div className="api-endpoints-card">
        <div className="api-card-header">
          <Code size={20} />
          <h3>Documented Backend REST Endpoints</h3>
        </div>

        <div className="endpoints-table-wrap">
          <table className="endpoints-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Method</th>
                <th style={{ width: '220px' }}>Endpoint</th>
                <th>Description</th>
                <th style={{ width: '120px' }}>Access</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep) => (
                <tr key={ep.method + ep.path}>
                  <td>
                    <span className={`method-badge method-${ep.method.toLowerCase()}`}>
                      {ep.method}
                    </span>
                  </td>
                  <td>
                    <code className="endpoint-code">{ep.path}</code>
                  </td>
                  <td>
                    <span className="endpoint-desc">{ep.desc}</span>
                  </td>
                  <td>
                    <span className="endpoint-tag">Admin</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
