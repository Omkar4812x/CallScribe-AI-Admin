"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface ActionItem {
  task: string;
  owner: string;
  dueDate: string;
}

interface CallNote {
  id: string;
  title: string;
  rawTranscript: string;
  aiSummary: string | null;
  aiActionItems: string | null;
  aiFollowUpEmail: string | null;
  createdAt: string;
  client: { id: string; name: string; color: string } | null;
}

export default function CallNoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<CallNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "actions" | "email" | "transcript">("summary");
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/call-notes/${id}`)
      .then((r) => r.json())
      .then((d) => { setNote(d.callNote); setLoading(false); });
  }, [id]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDelete = async () => {
    if (!confirm("Delete this call note? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/call-notes/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
      Loading…
    </div>
  );

  if (!note) return (
    <div className="empty-state">
      <div className="empty-state-icon">🔍</div>
      <h2 className="empty-state-title">Note not found</h2>
      <button className="btn btn-secondary" onClick={() => router.back()}>Go Back</button>
    </div>
  );

  const actionItems: ActionItem[] = note.aiActionItems ? JSON.parse(note.aiActionItems) : [];
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 8, padding: "4px 0", color: "var(--text-muted)" }}
          >
            ← Back
          </button>
          <h1 className="page-title">{note.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{formatDate(note.createdAt)}</span>
            {note.client && (
              <Link
                href={`/clients/${note.client.id}`}
                className="badge hover-lift"
                style={{
                  background: note.client.color + "22",
                  color: note.client.color,
                  border: `1px solid ${note.client.color}40`,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <span className="project-dot" style={{ background: note.client.color }} />
                {note.client.name}
              </Link>
            )}
          </div>
        </div>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "🗑 Delete"}
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {(["summary", "actions", "email", "transcript"] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "summary" && "📝 Summary"}
            {tab === "actions" && `✅ Actions (${actionItems.length})`}
            {tab === "email" && "📧 Email Draft"}
            {tab === "transcript" && "🎙 Transcript"}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === "summary" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>Meeting Summary</span>
              {note.aiSummary && (
                <button className="btn btn-sm btn-secondary" onClick={() => handleCopy(note.aiSummary!)}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            {note.aiSummary ? (
              <div className="prose" style={{ whiteSpace: "pre-line" }}>{note.aiSummary}</div>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>No summary available.</p>
            )}
          </div>
        )}

        {activeTab === "actions" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>{actionItems.length} Action Items</span>
              {actionItems.length > 0 && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleCopy(actionItems.map((a) => `• ${a.task} [${a.owner}] — ${a.dueDate}`).join("\n"))}
                >
                  {copied ? "Copied!" : "Copy All"}
                </button>
              )}
            </div>
            {actionItems.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No action items recorded.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {actionItems.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      display: "flex", gap: 12, alignItems: "flex-start",
                    }}
                  >
                    <span style={{ width: 24, height: 24, background: "var(--indigo-dim)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--indigo)", flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.task}</p>
                      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
                        <span>👤 {item.owner}</span>
                        <span>📅 {item.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "email" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>Follow-up Email Draft</span>
              {note.aiFollowUpEmail && (
                <button className="btn btn-sm btn-secondary" onClick={() => handleCopy(note.aiFollowUpEmail!)}>
                  {copied ? "Copied!" : "Copy Email"}
                </button>
              )}
            </div>
            {note.aiFollowUpEmail ? (
              <pre style={{ fontFamily: "inherit", fontSize: 13, lineHeight: 1.75, color: "var(--text-secondary)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {note.aiFollowUpEmail}
              </pre>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>No email draft available.</p>
            )}
          </div>
        )}

        {activeTab === "transcript" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>Original Transcript</span>
              <button className="btn btn-sm btn-secondary" onClick={() => handleCopy(note.rawTranscript)}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre style={{ fontFamily: "inherit", fontSize: 13, lineHeight: 1.75, color: "var(--text-secondary)", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 500, overflowY: "auto" }}>
              {note.rawTranscript}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
