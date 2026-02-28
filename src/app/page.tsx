import FileUpload from "@/components/FileUpload";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Notes from "@/components/Notes";
import InstallPWA from "@/components/InstallPWA";
import Image from "next/image";

export default function Home() {
  return (
    <main className="page-container page-fade">
      {/* Content */}
      <div className="page-content px-5 py-6">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <header className="text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-17 mb-3 rounded-xl bg-(--surface) border border-(--border) overflow-hidden">
              <Image src="/logo.png" alt="Nocturne" width={68} height={68} priority />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight mb-1">
              Nocturne
            </h1>

            <p className="text-(--muted) text-m">Read without distraction</p>
          </header>

          {/* Upload Area */}
          <div className="animate-fade-in-up stagger-1">
            <FileUpload compact />
          </div>

          {/* Notes Section */}
          <div className="animate-fade-in-up stagger-2">
            <div className="surface p-4">
              <Notes compact />
            </div>
          </div>

          {/* Install PWA Button */}
          <div className="animate-fade-in-up stagger-3">
            <InstallPWA />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="page-footer px-5 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <p className="text-sm text-(--muted)">Nocturne · Offline</p>
          <ThemeSwitcher />
        </div>
      </footer>
    </main>
  );
}
