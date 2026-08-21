"use client";

import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  color: string;
  _count: { callNotes: number };
}

const COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#f43f5e", "#ec4899", "#84cc16",
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", color: "#6366f1" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadClients = () => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => { setClients(d.clients || []); setLoading(false); });
  };

  useEffect(() => { loadClients(); }, []);

  const openCreate = () => {
    setEditClient(null);
    setForm({ name: "", color: "#6366f1" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (p: Client) => {
    setEditClient(p);
    setForm({ name: p.name, color: p.color });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Client name is required"); return; }
    setSaving(true);
    setError("");

    const url = editClient ? `/api/clients/${editClient.id}` : "/api/clients";
    const method = editClient ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.ok) {
      setShowModal(false);
      loadClients();
    } else {
      const d = await res.json();
      setError(d.error || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client? Call notes will keep their content but lose the client link.")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    loadClients();
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Organize your call notes by client or engagement</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Client
        </button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="card animate-pulse" style={{ height: 100 }} />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h2 className="empty-state-title">No clients yet</h2>
          <p className="empty-state-text">Create a client to organize your call notes by client or engagement.</p>
          <button className="btn btn-primary" onClick={openCreate}>Create First Client</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {clients.map((p) => (
            <div key={p.id} className="card" style={{ position: "relative" }}>
              <div
                style={{
                  width: 40, height: 40,
                  background: p.color + "22",
                  border: `2px solid ${p.color}40`,
                  borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, marginBottom: 12,
                }}
              >
                📁
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                {p._count.callNotes} call {p._count.callNotes === 1 ? "note" : "notes"}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0, left: 0, right: 0,
                  height: 3,
                  background: p.color,
                  borderRadius: "0 0 16px 16px",
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sm btn-secondary" onClick={() => openEdit(p)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2 className="modal-title">{editClient ? "Edit Client" : "New Client"}</h2>

            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Client Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Acme Corp Rebrand"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: 32, height: 32,
                      borderRadius: 8,
                      background: c,
                      border: form.color === c ? "3px solid white" : "3px solid transparent",
                      outline: form.color === c ? `2px solid ${c}` : "none",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner" /> Saving…</> : "Save Client"}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
