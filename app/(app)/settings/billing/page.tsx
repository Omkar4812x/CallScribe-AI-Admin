"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface SubscriptionData {
  subscriptionStatus: string;
  stripeCustomerId: string | null;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const checkoutParam = searchParams.get("checkout");

  const [subData, setSubData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => { setSubData(d); setLoading(false); });

    if (checkoutParam === "stub_success") {
      setMessage("✅ Stub checkout complete! (In production this would activate Pro.)");
    }
  }, [checkoutParam]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    setMessage("");

    const res = await fetch("/api/subscription", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "upgrade" }) 
    });
    const data = await res.json();
    setUpgrading(false);

    if (data.url) {
      window.location.href = data.url;
    } else if (data.error) {
      setMessage(data.error);
    }
  };

  const handleManage = async () => {
    setMessage("Redirecting to Customer Portal...");
    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "manage" }) 
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else if (data.error) {
      setMessage(data.error);
    }
  };

  const isPro = subData?.subscriptionStatus === "pro";

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and subscription</p>
        </div>
      </div>

      {message && (
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          {message}
        </div>
      )}

      {/* Subscription card */}
      <div style={{ maxWidth: 600 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Subscription Plan</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Your current billing plan</p>
            </div>
            {loading ? (
              <div style={{ width: 60, height: 22, background: "var(--bg-surface)", borderRadius: 100, animation: "pulse 1.5s infinite" }} />
            ) : (
              <span className={`badge ${isPro ? "badge-pro" : "badge-free"}`}>
                {isPro ? "⚡ Pro" : "Free"}
              </span>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Calls per month", free: "10", pro: "Unlimited" },
              { label: "Projects", free: "3", pro: "Unlimited" },
              { label: "AI re-generation", free: "✗", pro: "✓" },
              { label: "Priority support", free: "✗", pro: "✓" },
            ].map((row) => (
              <div key={row.label} style={{ background: "var(--bg-surface)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{row.label}</div>
                <div style={{ fontWeight: 700, color: isPro ? "var(--indigo)" : "var(--text-primary)" }}>
                  {isPro ? row.pro : row.free}
                </div>
              </div>
            ))}
          </div>

          {!isPro && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--indigo-dim)", borderRadius: 12, border: "1px solid rgba(99,102,241,0.25)", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>Upgrade to Pro</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>$29/month — Unlock unlimited calls & features</div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleUpgrade}
                  disabled={upgrading}
                >
                  {upgrading ? <><span className="spinner" /> Redirecting…</> : "Upgrade →"}
                </button>
              </div>
              <div className="alert alert-info" style={{ fontSize: 12 }}>
                💡 <strong>Dev Note:</strong> Ensure your Stripe API keys are configured correctly in <code>.env.local</code>.
              </div>
            </div>
          )}

          {isPro && (
            <div style={{ padding: "16px 20px", background: "var(--indigo-dim)", borderRadius: 12, border: "1px solid rgba(99,102,241,0.25)", marginBottom: 16 }}>
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                ⚡ You're on the Pro plan. Thank you for your support!
              </div>
              <button className="btn btn-secondary" onClick={handleManage}>
                Manage Billing
              </button>
            </div>
          )}
        </div>

        {/* AI Integration card */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>AI Provider</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Currently running with a mock AI. Connect a real provider to get live summaries.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { name: "OpenAI GPT-4", desc: "Set OPENAI_API_KEY in .env.local", status: "Not connected" },
              { name: "Google Gemini", desc: "Set GEMINI_API_KEY in .env.local", status: "Not connected" },
            ].map((provider) => (
              <div
                key={provider.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: "var(--bg-surface)",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{provider.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{provider.desc}</div>
                </div>
                <span className="badge badge-free">{provider.status}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
            To connect: edit <code style={{ color: "var(--indigo)", background: "var(--indigo-dim)", padding: "1px 6px", borderRadius: 4 }}>lib/ai.ts</code> and replace the mock with your provider SDK.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading settings…</div>}>
      <SettingsContent />
    </Suspense>
  );
}
