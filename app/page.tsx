import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--bg-base)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.18), transparent)",
          pointerEvents: "none",
        }}
      />

      <div style={{ textAlign: "center", maxWidth: 640, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div
          style={{
            width: 64,
            height: 64,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            margin: "0 auto 24px",
            boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
          }}
        >
          🎙️
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 800,
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            marginBottom: 20,
            background: "linear-gradient(135deg, #f1f2f5 0%, #9ca3af 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Turn call recordings into actionable insights
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          Paste your Zoom or Google Meet transcript and get a concise summary,
          action items with owners, and a ready-to-send follow-up email — in seconds.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth/signup" className="btn btn-primary btn-lg">
            Get Started Free
          </Link>
          <Link href="/auth/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 48,
          }}
        >
          {[
            "📝 Smart Summaries",
            "✅ Action Items",
            "📧 Follow-up Emails",
            "📁 Project Grouping",
          ].map((f) => (
            <span
              key={f}
              style={{
                padding: "8px 16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 100,
                fontSize: 13,
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
