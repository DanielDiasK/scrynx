import { useEffect, useState } from "react";
import {
  FolderOpen,
  ShieldCheck,
  UserRoundPlus,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FolderCheck,
} from "lucide-react";
import { useI18n } from "../i18n";
import { LogoMark } from "./Logo";
import { LangToggle } from "./LangToggle";
import { ThemeToggle } from "./ThemeToggle";
import { inTauri, pickFolder } from "../lib/bridge";

export interface OnboardingResult {
  captureDir: string;
  accountMode: "none" | "local";
  name: string;
  email: string;
}

interface OnboardingProps {
  initialDir: string;
  onDone: (result: OnboardingResult) => void;
}

async function ensureDir(dir: string): Promise<boolean> {
  try {
    if (!inTauri) return true;
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("ensure_capture_dir", { dir });
    return true;
  } catch {
    return false;
  }
}

export function Onboarding({ initialDir, onDone }: OnboardingProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(initialDir);
  const [dirError, setDirError] = useState(false);
  const [accountMode, setAccountMode] = useState<"none" | "local">("none");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<"name" | "email" | null>(null);
  const [checking, setChecking] = useState(false);

  // Pre-validate the folder whenever it changes (native only)
  useEffect(() => {
    if (step !== 1) return;
    setChecking(true);
    const handle = window.setTimeout(async () => {
      const ok = await ensureDir(dir.trim());
      setDirError(!ok);
      setChecking(false);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [dir, step]);

  const browse = async () => {
    const picked = await pickFolder(t.onboarding.step1Browse);
    if (picked) setDir(picked);
  };

  const canContinueFolder = dir.trim().length > 0 && !dirError && !checking;

  const submitAccount = () => {
    if (accountMode === "local") {
      if (name.trim().length === 0) {
        setFormError("name");
        return;
      }
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
        setFormError("email");
        return;
      }
    }
    setFormError(null);
    setStep(3);
  };

  const finish = () => {
    onDone({
      captureDir: dir.trim(),
      accountMode,
      name: name.trim(),
      email: email.trim(),
    });
  };

  const dots = [0, 1, 2, 3];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background">
      {/* Ambient backdrop — soft gold glow, very subtle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-1/4 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,hsl(var(--gold)/0.14),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,hsl(var(--purple)/0.12),transparent_70%)] blur-2xl"
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between p-5">
        <div className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="font-display text-lg font-extrabold tracking-tight">scrynx</span>
        </div>
        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Progress dots */}
      <div className="relative z-10 flex items-center justify-center gap-2 pb-2">
        {dots.map((d) => (
          <span
            key={d}
            className={`h-2 rounded-full transition-all duration-300 ${
              d === step ? "w-7 bg-gold" : d < step ? "w-2 bg-foreground" : "w-2 bg-line"
            }`}
          />
        ))}
      </div>

      {/* Body */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-5">
        <div key={step} className="animate-toast-in w-full max-w-xl">
          {/* ============ STEP 0 — Welcome ============ */}
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center">
                <LogoMark size={96} />
              </div>
              <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tight">
                {t.onboarding.welcomeTitle}
              </h1>
              <p className="mx-auto mt-4 max-w-md text-[15px] font-medium leading-relaxed text-muted-foreground">
                {t.onboarding.welcomeDesc}
              </p>
              <button
                onClick={() => setStep(1)}
                className="btn btn-gold mx-auto mt-8 px-10 py-4 text-base uppercase tracking-wide"
              >
                {t.onboarding.start}
                <ArrowRight size={18} strokeWidth={2.75} />
              </button>
            </div>
          )}

          {/* ============ STEP 1 — Capture folder ============ */}
          {step === 1 && (
            <div className="card p-7">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-gold">
                01 / 02
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
                {t.onboarding.step1Title}
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                {t.onboarding.step1Desc}
              </p>

              <div className="card-inset mt-6 flex items-center gap-4 p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold text-[#1a1710]">
                  <FolderOpen size={22} strokeWidth={2.2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[8px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                    {t.onboarding.step1Default}
                  </span>
                  <span className="mt-1 block truncate font-mono text-[12px] font-bold" title={dir}>
                    {dir}
                  </span>
                </span>
                {!dirError && dir.trim() && (
                  <FolderCheck size={20} strokeWidth={2.4} className="shrink-0 text-positive" />
                )}
              </div>
              {dirError && (
                <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-wider text-coral">
                  {t.onboarding.invalidFolder}
                </p>
              )}

              <button onClick={browse} className="btn btn-tonal mt-4 px-5 py-3 text-[12px] uppercase tracking-wide">
                <FolderOpen size={16} strokeWidth={2.4} />
                {t.onboarding.step1Browse}
              </button>

              <div className="mt-7 flex items-center justify-between">
                <button onClick={() => setStep(0)} className="btn btn-tonal px-5 py-3 text-[11px] uppercase tracking-wide">
                  <ArrowLeft size={15} strokeWidth={2.5} />
                  {t.onboarding.back}
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!canContinueFolder}
                  className="btn btn-gold px-7 py-3 text-[12px] uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.onboarding.next}
                  <ArrowRight size={15} strokeWidth={2.75} />
                </button>
              </div>
            </div>
          )}

          {/* ============ STEP 2 — Account ============ */}
          {step === 2 && (
            <div className="card p-7">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-gold">
                02 / 02
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
                {t.onboarding.step2Title}
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                {t.onboarding.step2Desc}
              </p>

              <div className="mt-6 grid gap-3">
                {/* Option A — no account */}
                <button
                  onClick={() => setAccountMode("none")}
                  aria-pressed={accountMode === "none"}
                  className={`flex items-start gap-4 rounded-2xl p-4 text-left transition-all ${
                    accountMode === "none"
                      ? "bg-gold text-[#16130c] shadow-[var(--shadow-sm)]"
                      : "bg-card-2 text-foreground hover:bg-card-2/70"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      accountMode === "none" ? "bg-[#16130c] text-gold" : "bg-card text-gold"
                    }`}
                  >
                    <ShieldCheck size={20} strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[13px] font-extrabold">
                      {t.onboarding.optionNoneTitle}
                      {accountMode === "none" && <Check size={14} strokeWidth={3.5} />}
                    </span>
                    <span
                      className={`mt-1 block text-[11px] font-medium leading-snug ${
                        accountMode === "none" ? "text-[#16130c]/80" : "text-muted-foreground"
                      }`}
                    >
                      {t.onboarding.optionNoneDesc}
                    </span>
                  </span>
                </button>

                {/* Option B — local profile */}
                <button
                  onClick={() => setAccountMode("local")}
                  aria-pressed={accountMode === "local"}
                  className={`rounded-2xl p-4 text-left transition-all ${
                    accountMode === "local"
                      ? "bg-gold text-[#16130c] shadow-[var(--shadow-sm)]"
                      : "bg-card-2 text-foreground hover:bg-card-2/70"
                  }`}
                >
                  <span className="flex items-start gap-4">
                    <span
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        accountMode === "local" ? "bg-[#16130c] text-gold" : "bg-card text-gold"
                      }`}
                    >
                      <UserRoundPlus size={20} strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-[13px] font-extrabold">
                        {t.onboarding.optionProfileTitle}
                        {accountMode === "local" && <Check size={14} strokeWidth={3.5} />}
                      </span>
                      <span
                        className={`mt-1 block text-[11px] font-medium leading-snug ${
                          accountMode === "local" ? "text-[#16130c]/80" : "text-muted-foreground"
                        }`}
                      >
                        {t.onboarding.optionProfileDesc}
                      </span>
                    </span>
                  </span>

                  {accountMode === "local" && (
                    <span className="mt-4 grid gap-2" onClick={(e) => e.stopPropagation()}>
                      <span>
                        <label htmlFor="onb-name" className="font-mono text-[8px] font-black uppercase tracking-[0.25em] text-[#16130c]/70">
                          {t.onboarding.nameLabel}
                        </label>
                        <input
                          id="onb-name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setFormError(null);
                          }}
                          placeholder={t.onboarding.namePlaceholder}
                          autoFocus
                          className="mt-1 h-11 w-full rounded-xl border-2 border-[#16130c]/15 bg-white/60 px-4 text-sm font-semibold text-[#16130c] outline-none placeholder:text-[#16130c]/40 focus:border-[#16130c]"
                        />
                        {formError === "name" && (
                          <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-coral">
                            {t.onboarding.nameRequired}
                          </span>
                        )}
                      </span>
                      <span>
                        <label htmlFor="onb-email" className="font-mono text-[8px] font-black uppercase tracking-[0.25em] text-[#16130c]/70">
                          {t.onboarding.emailLabel}
                        </label>
                        <input
                          id="onb-email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setFormError(null);
                          }}
                          placeholder={t.onboarding.emailPlaceholder}
                          type="email"
                          className="mt-1 h-11 w-full rounded-xl border-2 border-[#16130c]/15 bg-white/60 px-4 text-sm font-semibold text-[#16130c] outline-none placeholder:text-[#16130c]/40 focus:border-[#16130c]"
                        />
                        {formError === "email" && (
                          <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-coral">
                            {t.onboarding.invalidEmail}
                          </span>
                        )}
                      </span>
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-7 flex items-center justify-between">
                <button onClick={() => setStep(1)} className="btn btn-tonal px-5 py-3 text-[11px] uppercase tracking-wide">
                  <ArrowLeft size={15} strokeWidth={2.5} />
                  {t.onboarding.back}
                </button>
                <button onClick={submitAccount} className="btn btn-gold px-7 py-3 text-[12px] uppercase tracking-wide">
                  {t.onboarding.next}
                  <ArrowRight size={15} strokeWidth={2.75} />
                </button>
              </div>
            </div>
          )}

          {/* ============ STEP 3 — Done ============ */}
          {step === 3 && (
            <div className="text-center">
              <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-lime shadow-[var(--shadow-sm)]">
                <CheckCircle2 size={52} strokeWidth={2.4} className="text-[#1a2410]" />
              </span>
              <h2 className="mt-6 font-display text-4xl font-extrabold tracking-tight">
                {t.onboarding.doneTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[15px] font-medium leading-relaxed text-muted-foreground">
                {t.onboarding.doneDesc}
              </p>
              <div className="mt-5 flex items-center justify-center gap-1.5">
                <kbd className="kbd text-[13px]">Ctrl</kbd>
                <span className="text-lg font-black text-muted-foreground">+</span>
                <kbd className="kbd text-[13px]">Shift</kbd>
                <span className="text-lg font-black text-muted-foreground">+</span>
                <kbd className="kbd text-[13px]">S</kbd>
              </div>
              <button
                onClick={finish}
                className="btn btn-gold mx-auto mt-8 px-10 py-4 text-base uppercase tracking-wide"
              >
                {t.onboarding.doneCta}
                <ArrowRight size={18} strokeWidth={2.75} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
