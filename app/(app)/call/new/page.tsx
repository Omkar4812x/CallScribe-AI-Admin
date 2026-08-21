"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  color: string;
}

interface ActionItem {
  task: string;
  owner: string;
  dueDate: string;
}

interface Insights {
  aiSummary: string;
  aiActionItems: ActionItem[];
  aiFollowUpEmail: string;
}

type Step = "input" | "loading" | "results";

export default function AnalyzePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [transcript, setTranscript] = useState("");
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "actions" | "email">("summary");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => setClients(d.clients || []));
  }, []);

  const handleGenerate = async () => {
    if (!transcript.trim() || transcript.trim().length < 10) {
      setError("Please paste a transcript with at least 10 characters.");
      return;
    }
    setError("");
    setStep("loading");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawTranscript: transcript }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setInsights(data.insights);
      setStep("results");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStep("input");
    }
  };

  const handleSave = async () => {
    if (!insights) return;
    setSaving(true);

    let finalClientId = clientId;

    if (isNewClient && newClientName.trim()) {
      try {
        const resClient = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newClientName, color: "#6366f1" }),
        });
        if (resClient.ok) {
          const clientData = await resClient.json();
          finalClientId = clientData.client.id;
        }
      } catch (err) {
        console.error("Failed to implicitly create client", err);
      }
    }

    const res = await fetch("/api/call-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || `Call – ${new Date().toLocaleDateString()}`,
        rawTranscript: transcript,
        aiSummary: insights.aiSummary,
        aiActionItems: JSON.stringify(insights.aiActionItems),
        aiFollowUpEmail: insights.aiFollowUpEmail,
        clientId: finalClientId || undefined,
      }),
    });

    setSaving(false);

    if (res.ok) {
      const d = await res.json();
      router.push(`/call-notes/${d.callNote.id}`);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Failed to save. Please try again.");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatSummary = (text: string) =>
    text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("- ")) {
        return <li key={i} style={{ marginBottom: 6 }}>{line.slice(2)}</li>;
      }
      return line ? <p key={i} style={{ marginBottom: 6 }}>{line}</p> : null;
    });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Call Note</h1>
          <p className="page-subtitle">Paste your call transcript and get instant insights</p>
        </div>
      </div>

      {step === "input" && (
        <div style={{ maxWidth: 720 }}>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {error && (
              <div className="alert alert-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="title">Call Title (optional)</label>
              <input
                id="title"
                type="text"
                className="form-input"
                placeholder="e.g. Q2 Strategy Call with Acme Corp"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="client">Assign to Client (optional)</label>
              <select
                id="client"
                className="form-input"
                value={isNewClient ? "NEW" : clientId}
                onChange={(e) => {
                  if (e.target.value === "NEW") {
                    setIsNewClient(true);
                    setClientId("");
                  } else {
                    setIsNewClient(false);
                    setClientId(e.target.value);
                  }
                }}
              >
                <option value="">— No client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="NEW">+ Create new client</option>
              </select>
              {isNewClient && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: 8 }}
                  placeholder="Enter new client name…"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  autoFocus
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="transcript">
                Call Transcript <span style={{ color: "var(--rose)" }}>*</span>
              </label>
              <textarea
                id="transcript"
                className="form-input"
                placeholder="Paste your Zoom, Google Meet, or any transcript here…"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                style={{ minHeight: 280 }}
              />
              <span className="text-muted" style={{ fontSize: 12 }}>
                {transcript.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={!transcript.trim()}
              style={{ alignSelf: "flex-start" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Generate Insights
            </button>
          </div>
        </div>
      )}

      {step === "loading" && (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <div
            style={{
              width: 64, height: 64,
              background: "linear-gradient(135deg, var(--indigo), var(--violet))",
              borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 24px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            🤖
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Analyzing your transcript…</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Generating summary, action items, and follow-up email
          </p>
        </div>
      )}

      {step === "results" && insights && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>
          <div className="alert alert-success">
            ✅ Analysis complete! Review the results below and save when ready.
          </div>

          {/* Title + project row */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="save-title">Call Title</label>
              <input
                id="save-title"
                type="text"
                className="form-input"
                value={title || `Call – ${new Date().toLocaleDateString()}`}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ minWidth: 200 }}>
              <label className="form-label" htmlFor="save-client">Client</label>
              <select
                id="save-client"
                className="form-input"
                value={isNewClient ? "NEW" : clientId}
                onChange={(e) => {
                  if (e.target.value === "NEW") {
                    setIsNewClient(true);
                    setClientId("");
                  } else {
                    setIsNewClient(false);
                    setClientId(e.target.value);
                  }
                }}
              >
                <option value="">— No client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="NEW">+ Create new client</option>
              </select>
               {isNewClient && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: 8 }}
                  placeholder="Enter new client name…"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="tabs" style={{ marginBottom: 16 }}>
              {(["summary", "actions", "email"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "summary" && "📝 Summary"}
                  {tab === "actions" && "✅ Action Items"}
                  {tab === "email" && "📧 Email Draft"}
                </button>
              ))}
            </div>

            <div className="card">
              {activeTab === "summary" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Meeting Summary</span>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleCopy(insights.aiSummary)}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="prose">
                    <ul style={{ padding: 0, listStyle: "none" }}>
                      {formatSummary(insights.aiSummary)}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "actions" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      {insights.aiActionItems.length} Action Items
                    </span>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() =>
                        handleCopy(
                          insights.aiActionItems
                            .map((a) => `• ${a.task} [${a.owner}] — ${a.dueDate}`)
                            .join("\n")
                        )
                      }
                    >
                      {copied ? "Copied!" : "Copy All"}
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {insights.aiActionItems.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          padding: "14px 16px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            width: 24, height: 24,
                            background: "var(--indigo-dim)",
                            borderRadius: 6,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, color: "var(--indigo)",
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                            {item.task}
                          </p>
                          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
                            <span>👤 {item.owner}</span>
                            <span>📅 {item.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "email" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Follow-up Email Draft</span>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleCopy(insights.aiFollowUpEmail)}
                    >
                      {copied ? "Copied!" : "Copy Email"}
                    </button>
                  </div>
                  <pre
                    style={{
                      fontFamily: "inherit",
                      fontSize: 13,
                      lineHeight: 1.75,
                      color: "var(--text-secondary)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {insights.aiFollowUpEmail}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <><span className="spinner" /> Saving…</> : "💾 Save to Dashboard"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setStep("input");
                setInsights(null);
              }}
            >
              ← Start Over
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{error}</span>
              {error.includes("Free plan limit reached") && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => router.push("/settings/billing")}
                  style={{ whiteSpace: "nowrap" }}
                >
                  Manage Billing
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
