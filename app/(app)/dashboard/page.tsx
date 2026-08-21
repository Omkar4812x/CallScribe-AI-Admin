"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  color: string;
}

interface CallNote {
  id: string;
  title: string;
  aiSummary: string | null;
  createdAt: string;
  client: Client | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [callNotes, setCallNotes] = useState<CallNote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filterClient, setFilterClient] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/call-notes").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ]).then(([notesData, clientsData]) => {
      setCallNotes(notesData.callNotes || []);
      setClients(clientsData.clients || []);
      setLoading(false);
    });
  }, []);

  const filtered = filterClient
    ? callNotes.filter((n) => n.client?.id === filterClient)
    : callNotes;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">All your call notes in one place</p>
        </div>
        <Link href="/call/new" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Call Note
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Calls</div>
          <div className="stat-value" style={{ color: "var(--indigo)" }}>{callNotes.length}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Clients</div>
          <div className="stat-value" style={{ color: "var(--violet)" }}>{clients.length}</div>
          <div className="stat-sub">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">This Month</div>
          <div className="stat-value" style={{ color: "var(--cyan)" }}>
            {callNotes.filter((n) => {
              const d = new Date(n.createdAt);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </div>
          <div className="stat-sub">Calls analyzed</div>
        </div>
      </div>

      {/* Client Grouped Cards */}
      {loading ? (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse" style={{ height: 80 }} />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h2 className="empty-state-title">No clients yet</h2>
          <p className="empty-state-text">
            Upload or paste a call transcript to generate your first AI-powered summary and create a client.
          </p>
          <Link href="/call/new" className="btn btn-primary">
            New Call Note
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {clients.map((c) => {
            const clientNotes = callNotes.filter((n) => n.client?.id === c.id);
            const latestNote = clientNotes.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];

            return (
              <div
                key={c.id}
                className="card"
                onClick={() => router.push(`/clients/${c.id}`)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/clients/${c.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  padding: "16px 20px",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 40, height: 40,
                      background: c.color + "22",
                      border: `2px solid ${c.color}40`,
                      borderRadius: 10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    📁
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{c.name}</h3>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                      {clientNotes.length} call {clientNotes.length === 1 ? "note" : "notes"}
                    </div>
                  </div>
                </div>
                {latestNote && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                      Latest: {latestNote.title || "Untitled Note"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                      {formatDate(latestNote.createdAt)}
                    </div>
                  </div>
                )}
                {!latestNote && (
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No notes yet</div>
                )}
              </div>
            );
          })}

          {/* Render "Unassigned" notes if any exist */}
          {callNotes.filter((n) => !n.client).length > 0 && (
             <div
             className="card"
             onClick={() => router.push(`/clients/unassigned`)}
             role="link"
             tabIndex={0}
             style={{
               display: "flex", alignItems: "center", justifyContent: "space-between",
               cursor: "pointer", padding: "16px 20px"
             }}
           >
             <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
               <div style={{
                   width: 40, height: 40, background: "var(--bg-surface)",
                   border: `2px solid var(--border)`, borderRadius: 10,
                   display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
               }}>
                 📄
               </div>
               <div>
                 <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-secondary)" }}>Unassigned Notes</h3>
                 <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                   {callNotes.filter((n) => !n.client).length} call notes
                 </div>
               </div>
             </div>
           </div>
          )}
        </div>
      )}
    </div>
  );
}
