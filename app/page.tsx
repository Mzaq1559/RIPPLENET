import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBrain,
  IconChevronRight,
  IconClipboardCheck,
  IconClipboardList,
  IconClock,
  IconGlobe,
  IconHeart,
  IconHome,
  IconMapPin,
  IconMic,
  IconNavigation,
  IconPackage,
  IconShield,
  IconSignalHigh,
  IconSparkles,
  IconTarget,
  IconTruck,
  IconUser,
  IconUsers,
} from "./components/icons";
import { Logo } from "./components/logo";
import { LiveImpactSection } from "./components/live-impact-section";
import { RevealOnScroll } from "./components/reveal-on-scroll";
import { LazyReliefOrbit } from "./components/lazy-relief-orbit";

const features = [
  { label: "No Data for Others", Icon: IconShield },
  { label: "Low Connectivity Friendly", Icon: IconSignalHigh },
  { label: "Multi-Language Support", Icon: IconGlobe },
] as const;

const workflowSteps = [
  {
    step: 1,
    title: "Inspect",
    desc: "SOS via Voice Note, Video or USSD",
    Icon: IconMic,
    tone: "bg-sky-50 text-sky-600",
  },
  {
    step: 2,
    title: "Analyze",
    desc: "AI & Agents analyze risk, needs, routes, and resources",
    Icon: IconSparkles,
    tone: "bg-cyan-50 text-cyan-600",
  },
  {
    step: 3,
    title: "Decide",
    desc: "Data-ranked decisions with full justification",
    Icon: IconTarget,
    tone: "bg-teal-50 text-teal-600",
  },
  {
    step: 4,
    title: "Dispatch",
    desc: "Nearest teams and volunteers with supplies",
    Icon: IconTruck,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    step: 5,
    title: "Deliver",
    desc: "Help reaches the victims on time",
    Icon: IconHeart,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    step: 6,
    title: "Record",
    desc: "Every action logged for transparency and trust",
    Icon: IconClipboardCheck,
    tone: "bg-slate-100 text-slate-600",
  },
] as const;


function AppHeader() {
  return (
    <header className="flex items-center gap-3 px-5 pt-1">
      <Logo className="h-11 w-11" />
      <div className="leading-tight">
        <p className="font-display text-[17px] font-bold text-ink">RippleNet AI</p>
        <p className="text-[11px] font-medium text-slate-500">AI for Humanitarian Impact</p>
      </div>
    </header>
  );
}

function OverlayCard({
  className,
  icon,
  iconClass,
  label,
  value,
  sub,
  danger = false,
}: {
  className: string;
  icon: ReactNode;
  iconClass: string;
  label: string;
  value: string;
  sub: ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={`absolute flex items-center gap-2.5 rounded-2xl px-3 py-2.5 shadow-xl backdrop-blur-sm ${
        danger ? "bg-terracotta/95 text-white" : "bg-white/95 text-ink"
      } ${className}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
        {icon}
      </span>
      <span className="min-w-0 leading-tight">
        <span
          className={`block text-[9px] font-semibold uppercase tracking-[0.08em] ${
            danger ? "text-white/70" : "text-slate-400"
          }`}
        >
          {label}
        </span>
        <span className="block font-display text-[16px] font-bold tabular-nums">{value}</span>
        <span className={`block text-[9.5px] font-medium ${danger ? "text-white/75" : "text-slate-400"}`}>
          {sub}
        </span>
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] bg-paper shadow-xl">
      <AppHeader />

      <main className="pb-8">
        <RevealOnScroll className="relative isolate px-5 pt-5" trigger="mount">
          <div className="pointer-events-none absolute -right-7 -top-8 z-0 h-44 w-44 opacity-35">
            <LazyReliefOrbit />
          </div>
          <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-[7px] text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-pop" />
            AI-Powered Flood Response
          </span>
          <h1 className="mt-4 font-display text-[28px] font-extrabold leading-[1.16] tracking-tight text-ink">
            Right Help. Right Time.
            <br />
            <span className="text-cyan-pop">Every Life Matters.</span>
          </h1>
          <p className="mt-3 text-[13.5px] leading-[1.65] text-slate-500">
            RippleNet AI turns every SOS into a smart, defensible decision—so Alkhidmat
            reaches more people across Pakistan&apos;s flood zones.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="#how-it-works"
              className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink text-[13.5px] font-semibold text-white shadow-lg shadow-ink/25 transition active:scale-[0.98]"
            >
              See How It Works
              <IconArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/demo"
              className="flex h-12 flex-1 items-center justify-center rounded-full border-[1.5px] border-[#c4dbe8] bg-white text-[13.5px] font-semibold text-ink transition active:scale-[0.98]"
            >
              Request Demo
            </Link>
          </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="mt-6 px-5" aria-label="Live response overview">
          <div className="relative aspect-[1141/1379] w-full overflow-hidden rounded-[24px] shadow-xl shadow-ink/10">
            <Image
              src="/images/hero_section.png"
              alt="Alkhidmat responders in a motorboat delivering aid across floodwaters"
              fill
              priority
              sizes="(max-width: 480px) 100vw, 480px"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 335 405"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <g
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 7"
                opacity="0.9"
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}
              >
                <line x1="150" y1="84" x2="177" y2="206" />
                <line x1="190" y1="176" x2="180" y2="208" />
                <line x1="150" y1="322" x2="177" y2="222" />
              </g>
            </svg>

            <div className="absolute" style={{ left: "53.5%", top: "52.5%" }}>
              <span className="absolute inset-0 m-auto h-3 w-3 animate-ping rounded-full bg-white/50 motion-reduce:animate-none" />
              <span className="relative block h-3 w-3 rounded-full bg-terracotta shadow-md ring-[3px] ring-white" />
            </div>

            <OverlayCard
              className="left-[3.5%] top-[3.2%] w-[46%]"
              icon={<IconAlertTriangle className="h-[18px] w-[18px]" />}
              iconClass="bg-white/20 text-white"
              label="High Risk"
              value="9.2/10"
              sub="Flood Severity"
              danger
            />
            <OverlayCard
              className="right-[3.5%] top-[26%] w-[46%]"
              icon={<IconClock className="h-[18px] w-[18px]" />}
              iconClass="bg-sky-50 text-channel"
              label="ETA"
              value="1h 25m"
              sub="via Safe Route"
            />
            <OverlayCard
              className="bottom-[3.2%] left-[3.5%] w-[47%]"
              icon={<IconHome className="h-[18px] w-[18px]" />}
              iconClass="bg-emerald-50 text-emerald-600"
              label="Health Camp"
              value="3.6 km Away"
              sub={
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Available
                </span>
              }
            />
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="mt-7 px-5">
          <div className="grid grid-cols-3 gap-2">
            {features.map(({ label, Icon }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-channel">
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <p className="mt-2 text-[11px] font-semibold leading-snug text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="mt-9 px-5" id="how-it-works">
          <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">
            How RippleNet AI Works
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {workflowSteps.map(({ step, title, desc, Icon, tone }) => (
              <div
                key={step}
                className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full ${tone}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="font-display text-[13px] font-bold tabular-nums text-slate-200">
                    {step}
                  </span>
                </div>
                <h3 className="mt-2.5 font-display text-[12.5px] font-bold text-ink">{title}</h3>
                <p className="mt-1 text-[10px] leading-[1.5] text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        <LiveImpactSection />

        <RevealOnScroll className="mt-9 px-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">
              Nearby Relief Camps
            </h2>
            <Link href="/camps" className="flex items-center text-[13px] font-semibold text-channel">
              View Map
              <IconChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Link
            href="/camps"
            className="relative mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition active:scale-[0.98]"
          >
            <Image
              src="/images/camp_card.png"
              alt="Alkhidmat Relief Camp tent with people seated outside"
              width={84}
              height={84}
              className="h-[84px] w-[84px] shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-display text-[14px] font-bold text-ink">
                Alkhidmat Relief Camp
              </h3>
              <p className="mt-1 flex items-center gap-1 text-[12px] text-slate-500">
                <IconMapPin className="h-3 w-3 shrink-0 text-slate-400" />
                Chakdara, KPK
              </p>
              <p className="mt-0.5 text-[12px] text-slate-400">1.2 km away</p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-[3px] text-[10px] font-bold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Open
              </span>
            </div>
            <span
              aria-hidden="true"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-sky-400 text-white shadow-md shadow-sky-300/60"
            >
              <IconNavigation className="h-[18px] w-[18px]" />
            </span>
          </Link>
        </RevealOnScroll>

        <RevealOnScroll className="mt-8 px-5">
          <Link
            href="/demo"
            className="flex items-center gap-3.5 rounded-3xl border border-cyan-200 bg-gradient-to-r from-ink to-channel p-4 text-white shadow-xl shadow-ink/20 transition active:scale-[0.98]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-cyan-pop shadow-inner">
              <IconBrain className="h-6 w-6 animate-pulse motion-reduce:animate-none" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-display text-[15px] font-bold">5 AI Agents Interactive Sandbox</span>
                <span className="rounded-full bg-cyan-pop px-2 py-0.5 text-[9px] font-extrabold uppercase text-ink">
                  Launch
                </span>
              </div>
              <p className="mt-1 text-[11.5px] text-white/80">
                Simulate flood disaster scenarios with live reasoning from Flood, Health, Logistics, Route &amp; Resource agents.
              </p>
            </div>
            <IconChevronRight className="h-5 w-5 shrink-0 text-white/60" />
          </Link>
        </RevealOnScroll>

        <RevealOnScroll className="mt-9 px-5" aria-label="Choose your role">
          <h2 className="font-display text-[19px] font-bold tracking-tight text-ink">
            Choose Your Role
          </h2>
          <p className="mt-1 text-[12px] font-medium text-slate-500">
            Select a role to explore the demo
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/sos"
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:scale-[0.98]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-channel">
                <IconUser className="h-6 w-6" />
              </span>
              <p className="text-[12px] font-bold text-ink">Citizen</p>
              <p className="text-[9.5px] text-slate-400">Report SOS & track requests</p>
            </Link>
            <Link
              href="/login"
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:scale-[0.98]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <IconClipboardList className="h-6 w-6" />
              </span>
              <p className="text-[12px] font-bold text-ink">Camp Manager</p>
              <p className="text-[9.5px] text-slate-400">Manage camps & queues</p>
            </Link>
            <Link
              href="/volunteer/login"
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:scale-[0.98]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <IconHeart className="h-6 w-6" />
              </span>
              <p className="text-[12px] font-bold text-ink">Volunteer</p>
              <p className="text-[9.5px] text-slate-400">View tasks & deliver aid</p>
            </Link>
            <Link
              href="/admin/login"
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:scale-[0.98]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <IconShield className="h-6 w-6" />
              </span>
              <p className="text-[12px] font-bold text-ink">Admin</p>
              <p className="text-[9.5px] text-slate-400">Oversee all operations</p>
            </Link>
          </div>
        </RevealOnScroll>
      </main>
    </div>
  );
}
