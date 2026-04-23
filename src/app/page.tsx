import Image from "next/image";
import FileUpload from "@/components/FileUpload";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import InstallPWA from "@/components/InstallPWA";
import ContinueReading from "@/components/ContinueReading";

export default function Home() {
  return (
    <main
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      className="page-fade"
    >
      {/* Scrollable content area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "360px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Header */}
          <div className="animate-fade-in-up" style={{ marginBottom: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Nocturne"
                  width={44}
                  height={44}
                  priority
                />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "var(--text)",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}
                >
                  Nocturne
                </h1>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--muted)",
                    lineHeight: 1,
                  }}
                >
                  Read without distraction
                </p>
              </div>
            </div>
          </div>

          {/* Continue Reading */}
          <div className="animate-fade-in-up stagger-1">
            <ContinueReading />
          </div>

          {/* Upload - explicit background so it's always visible */}
          <div className="animate-fade-in-up stagger-2">
            <FileUpload />
          </div>

          {/* Install - mobile only */}
          <div className="animate-fade-in-up stagger-3 sm:hidden">
            <InstallPWA />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          flexShrink: 0,
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg)",
          padding: "12px 20px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            maxWidth: "360px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p style={{ fontSize: "12px", color: "var(--muted)" }}>
            Nocturne · Offline ready
          </p>
          <ThemeSwitcher />
        </div>
      </div>
    </main>
  );
}
