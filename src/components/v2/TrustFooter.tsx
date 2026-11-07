export function TrustFooter() {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 2,
        marginTop: -36,
        background: "#FFFFFF",
        borderRadius: "36px 36px 0 0",
        color: "#0A0A0A",
        paddingTop: 90,
      }}
    >
      <div id="trust" style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px 100px", textAlign: "center", boxSizing: "border-box" }}>
        <div style={{ borderTop: "1px solid rgba(10,10,10,0.08)", borderBottom: "1px solid rgba(10,10,10,0.08)", padding: "56px 0" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 500, letterSpacing: "-0.7px", lineHeight: 1.2 }}>
            <span style={{ color: "#6B6B6B" }}>Built in South Africa,</span>{" "}
            <span style={{ fontWeight: 700 }}>for South African freelancers.</span>
          </h3>
          <p style={{ margin: "0 auto", maxWidth: 480, fontSize: 14.5, color: "#6B6B6B", lineHeight: 1.65 }}>
            Vetted professionals across the trades, tech and finance are already on the platform.
          </p>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 40px 44px",
          boxSizing: "border-box",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p style={{ margin: 0, fontSize: 12, color: "#9A9A9A" }}>© 2026 Elev8U. A Nexarc Technologies company.</p>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="/privacy" style={{ fontSize: 12.5, color: "#6B6B6B" }}>
            Privacy
          </a>
          <a href="mailto:hello@elev8u.co.za" style={{ fontSize: 12.5, color: "#6B6B6B" }}>
            hello@elev8u.co.za
          </a>
        </div>
      </div>
    </div>
  );
}
