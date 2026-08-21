"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [callNotes, setCallNotes] = useState<CallNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id === "unassigned") {
      // Special view for unassigned notes
      setClient({ id: "unassigned", name: "Unassigned Notes", color: "#6b7280" });
      fetch(`/api/call-notes`)
        .then((r) => r.json())
        .then((d) => {
          setCallNotes((d.callNotes || []).filter((n: any) => !n.client));
          setLoading(false);
        });
      return;
    }

    fetch(`/api/clients/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        setClient(d.client);
        // Also fetch notes for this client
        return fetch("/api/call-notes");
      })
      .then((r) => r.json())
      .then((d) => {
        setCallNotes((d.callNotes || []).filter((n: any) => n.client?.id === params.id));
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  }, [params.id]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div className="card animate-pulse" style={{ width: 300, height: 60 }} />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title">Client not found</h2>
        <Link href="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link href="/dashboard" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none", marginBottom: 16, display: "inline-block" }}>
        ← Back to Dashboard
      </Link>
      <div className="page-header" style={{ alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48, height: 48,
              background: client.color + "22",
              border: `2px solid ${client.color}40`,
              borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
            }}
          >
            📁
          </div>
          <div>
            <h1 className="page-title">{client.name}</h1>
            <p className="page-subtitle">{callNotes.length} call notes</p>
          </div>
        </div>
        <Link href={`/call/new?clientId=${client.id}`} className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Record Note
        </Link>
      </div>

      {callNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎙️</div>
          <h2 className="empty-state-title">No notes for {client.name}</h2>
          <p className="empty-state-text">Add your first call note to get started.</p>
        </div>
      ) : (
        <div className="call-note-grid">
          {callNotes.map((note) => (
            <div
              key={note.id}
              className="call-note-card"
              onClick={() => router.push(`/call-notes/${note.id}`)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/call-notes/${note.id}`)}
            >
              <div className="call-note-title">{note.title}</div>
              {note.aiSummary && (
                <p className="call-note-preview">
                  {note.aiSummary.replace(/\*\*/g, "").replace(/^[-•]\s/gm, "").slice(0, 120)}…
                </p>
              )}
              <div className="call-note-meta" style={{ justifyContent: "space-between" }}>
                <span>{formatDate(note.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
