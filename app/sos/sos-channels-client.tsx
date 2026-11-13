"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconChevronRight,
  IconKeypad,
  IconPhone,
  IconShieldPin,
  IconVideo,
  IconWhatsApp,
  IconX,
  IconCheck,
  IconSparkles,
  IconMic,
  IconClock,
  IconSearch,
} from "../components/icons";
import { Translated } from "../components/citizen-translated";
import { useCitizenLocation } from "../components/use-citizen-location";
import { RevealOnScroll } from "../components/reveal-on-scroll";

interface SampleRequest {
  code: string;
  name: string;
  district: string;
  location: string;
  lat: number;
  lng: number;
  status: string;
  tone: string;
  tag: string;
}

const SAMPLE_REQUESTS: SampleRequest[] = [
  {
    code: "RIP-2026-00011",
    name: "Haleeman Bibi",
    district: "Nowshera",
    location: "Pabbi, GT Road, Nowshera",
    lat: 33.99,
    lng: 71.85,
    status: "Pending Triage",
    tone: "bg-rose-50 text-rose-700 ring-rose-200",
    tag: "Food & Shelter Needed",
  },
  {
    code: "RIP-2026-00001",
    name: "Fatima Bibi",
    district: "Rawalpindi",
    location: "Liaquat Bagh, Rawalpindi",
    lat: 33.5973,
    lng: 73.0645,
    status: "In Transit",
    tone: "bg-violet-50 text-violet-700 ring-violet-200",
    tag: "Medical & Clean Water Dispatched",
  },
  {
    code: "RIP-2026-00002",
    name: "Bashir Ahmed",
    district: "Nowshera",
    location: "Kabul River Sector, Nowshera",
    lat: 34.0153,
    lng: 71.9747,
    status: "Assigned",
    tone: "bg-sky-50 text-sky-700 ring-sky-200",
    tag: "Evacuation Boat Assigned",
  },
  {
    code: "RIP-2026-00005",
    name: "Muhammad Yousuf",
    district: "Badin",
    location: "Kadhan, Badin",
    lat: 24.6833,
    lng: 68.7667,
    status: "Pending Triage",
    tone: "bg-rose-50 text-rose-700 ring-rose-200",
    tag: "Critical Diarrhea/Fever",
  },
  {
    code: "RIP-2026-00008",
    name: "Saima",
    district: "Lahore",
    location: "Model Town, Lahore",
    lat: 31.48,
    lng: 74.32,
    status: "Resolved",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    tag: "Relief Delivered",
  },
];

export function SosChannelsClient() {
  const router = useRouter();
  const { coords, districtName } = useCitizenLocation();
  const [ussdOpen, setUssdOpen] = useState(false);
  const [ussdStep, setUssdStep] = useState<"menu" | "people" | "submitting" | "done">("menu");
  const [ussdSelectedNeed, setUssdSelectedNeed] = useState("Medical & Clean Water");
  const [ussdPeople, setUssdPeople] = useState(4);
  const [ussdResultCode, setUssdResultCode] = useState("");

  const handleUssdSubmit = async () => {
    setUssdStep("submitting");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenName: "USSD Citizen (Keypad *313#)",
          phone: "0300 0003130",
          lat: coords?.lat ?? 33.5651,
          lng: coords?.lng ?? 73.0169,
          district: districtName?.split(",")[0]?.trim() || "Rawalpindi",
          needs: [ussdSelectedNeed, "No Clean Water"],
          peopleCount: ussdPeople,
          type: "water",
          priority: "critical",
        }),
      });
      const data = await res.json();
      if (data.request?.code) {
        localStorage.setItem("citizen_last_request", data.request.code);
        setUssdResultCode(data.request.code);
        setUssdStep("done");
      } else {
        setUssdStep("menu");
      }
    } catch {
      setUssdStep("menu");
    }
  };

  return (
    <>
      <RevealOnScroll className="mt-7 flex flex-col gap-3 px-5" aria-label="Ways to send an SOS">
        {/* Video SOS */}
        <Link
          href="/sos/video"
          className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <IconVideo className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="flex items-center gap-2">
              <Translated k="sendSosVideo" as="span" className="font-display text-[15px] font-bold text-ink" />
              <Translated
                k="recommended"
                as="span"
                className="rounded-full bg-sky-100 px-2 py-[3px] text-[9px] font-bold uppercase tracking-wide text-sky-700"
              />
            </span>
            <Translated k="recordVideoDesc" as="span" className="mt-1 block text-[12px] text-slate-500" />
          </span>
          <IconChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
        </Link>

        {/* In-App Voice Note (Audio SOS - 7 Regional Languages) */}
        <Link
          href="/sos/audio"
          className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <IconMic className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="flex items-center gap-2">
              <Translated k="sendVoiceNote" as="span" className="font-display text-[15px] font-bold text-ink" />
              <span className="rounded-full bg-emerald-100 px-2 py-[3px] text-[9px] font-bold text-emerald-800">
                7 Languages AI
              </span>
            </span>
            <Translated k="voiceNoteDesc" as="span" className="mt-1 block text-[12px] text-slate-500" />
            <span className="mt-1 block text-[11px] font-semibold text-emerald-700">Urdu · Sindhi · Pashto · Punjabi · Balochi · Hindko · English</span>
          </span>
          <IconChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
        </Link>

        {/* USSD Keypad Simulator */}
        <button
          type="button"
          onClick={() => {
            setUssdOpen(true);
            setUssdStep("menu");
          }}
          className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
            <IconKeypad className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="flex items-center gap-2">
              <Translated k="ussd" as="span" className="font-display text-[15px] font-bold text-ink" />
              <span className="rounded-full bg-orange-100 px-2 py-[3px] text-[9px] font-bold text-orange-700">
                Dial *313#
              </span>
            </span>
            <Translated k="ussdDesc" as="span" className="mt-1 block text-[12px] text-slate-500" />
            <Translated k="noInternet" as="span" className="mt-1 block text-[11px] font-medium text-slate-400" />
          </span>
          <IconChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
        </button>

        {/* Toll-Free Hotline */}
        <a
          href="tel:0800444488"
          className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
            <IconPhone className="h-[22px] w-[22px]" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <Translated k="callForHelp" as="span" className="font-display text-[15px] font-bold text-ink" />
            <Translated k="callDesc" as="span" className="mt-1 block text-[12px] text-slate-500" />
            <span className="mt-1 block text-[12.5px] font-semibold text-violet-600">0800 44 44 88</span>
          </span>
          <IconChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
        </a>
      </RevealOnScroll>

      {/* Track SOS Request Quick-Launcher */}
      <RevealOnScroll className="mt-4 px-5">
        <Link
          href="/status"
          className="flex items-center gap-3.5 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/90 via-sky-50/40 to-white p-4 shadow-sm transition hover:border-sky-300 active:scale-[0.99] group"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-white shadow-sm group-hover:bg-channel transition">
            <IconClock className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="flex items-center gap-2">
              <span className="font-display text-[15px] font-bold text-ink">Track My Request</span>
              <span className="rounded-full bg-emerald-100 px-2 py-[3px] text-[9.5px] font-bold text-emerald-800">
                Live Status
              </span>
            </span>
            <span className="mt-1 block text-[12px] text-slate-500">
              Already submitted an SOS? Track live dispatch, rescue route &amp; volunteer
            </span>
          </span>
          <IconChevronRight className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-channel transition" />
        </Link>
      </RevealOnScroll>

      {/* Sample Live Requests Quick-Selector */}
      <RevealOnScroll className="mt-4 px-5">
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-white to-sky-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <IconSparkles className="h-4 w-4 text-channel" />
              <p className="font-display text-[13px] font-bold text-ink">Sample Live Requests</p>
            </div>
            <span className="text-[10.5px] font-semibold text-slate-400">1-Tap to Inspect</span>
          </div>

          <div className="mt-3 space-y-2">
            {SAMPLE_REQUESTS.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() =>
                  router.push(
                    `/status?code=${encodeURIComponent(s.code)}&district=${encodeURIComponent(s.district)}&lat=${s.lat}&lng=${s.lng}`
                  )
                }
                className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-xs transition-all hover:border-sky-300 hover:bg-sky-50/40 active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12.5px] font-bold text-ink">{s.code}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ${s.tone}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {s.name} · <span className="font-semibold text-slate-700">{s.location}</span> · <span className="font-medium text-channel">{s.tag}</span>
                  </p>
                </div>
                <IconChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      </RevealOnScroll>

      {/* USSD Keypad Interactive Dialog */}
      {ussdOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[380px] rounded-3xl bg-slate-900 p-5 text-white shadow-2xl ring-1 ring-slate-700">
            {/* USSD Screen Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping motion-reduce:animate-none" />
                <p className="font-mono text-[12px] font-bold text-emerald-400">USSD *313# (Alkhidmat SOS)</p>
              </div>
              <button
                type="button"
                onClick={() => setUssdOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* Step: Menu */}
            {ussdStep === "menu" && (
              <div className="mt-4 space-y-3 font-mono text-[13px]">
                <p className="text-slate-300">Select Emergency Help needed:</p>
                <div className="space-y-1.5">
                  {[
                    { key: "1", label: "1. Medical & Water (Diarrhea/Fever)" },
                    { key: "2", label: "2. Clean Drinking Water" },
                    { key: "3", label: "3. Food Ration Pack" },
                    { key: "4", label: "4. Emergency Boat Rescue / Evac" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setUssdSelectedNeed(label);
                        setUssdStep("people");
                      }}
                      className="w-full rounded-xl bg-slate-800/80 p-2.5 text-left text-cyan-300 hover:bg-slate-700"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step: People count */}
            {ussdStep === "people" && (
              <div className="mt-4 space-y-3 font-mono text-[13px]">
                <p className="text-slate-300">How many people need relief?</p>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 5, 8].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setUssdPeople(n)}
                      className={`rounded-xl py-2.5 text-center font-bold ${
                        ussdPeople === n ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-white"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleUssdSubmit}
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-emerald-500 font-bold text-slate-950 shadow-lg shadow-emerald-500/20"
                >
                  Send USSD Distress Signal
                </button>
              </div>
            )}

            {/* Step: Submitting */}
            {ussdStep === "submitting" && (
              <div className="mt-6 py-6 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent motion-reduce:animate-none" />
                <p className="mt-3 font-mono text-[12.5px] text-slate-300">
                  Transmitting USSD packet to nearest base camp...
                </p>
              </div>
            )}

            {/* Step: Done */}
            {ussdStep === "done" && (
              <div className="mt-4 text-center font-mono space-y-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <IconCheck className="h-6 w-6" strokeWidth={3} />
                </span>
                <p className="font-bold text-[14px] text-emerald-400">Distress Signal Received!</p>
                <p className="text-[11.5px] text-slate-300">
                  Your SOS Code: <span className="font-bold text-white">{ussdResultCode}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Tower location triangulated. 5 AI Agents routed request to nearest camp.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUssdOpen(false);
                      const dist = districtName?.split(",")[0]?.trim() || "Rawalpindi";
                      const la = coords?.lat ?? 33.5651;
                      const ln = coords?.lng ?? 73.0169;
                      router.push(`/status?code=${encodeURIComponent(ussdResultCode)}&district=${encodeURIComponent(dist)}&lat=${la}&lng=${ln}`);
                    }}
                    className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-[12px] font-bold text-slate-950"
                  >
                    Track Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setUssdOpen(false)}
                    className="flex-1 rounded-xl bg-slate-800 py-2.5 text-[12px] font-bold text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
