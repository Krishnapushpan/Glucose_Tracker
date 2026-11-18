import {
  ArrowRight,
  BarChart3,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import GlucoseChartsSection from '../components/GlucoseChartsSection';
import glucometerHeroImg from '../assets/glucometer-hero.jpg';

const HIGHLIGHTS = [
  {
    icon: Clock,
    title: 'Simple Daily Logging',
    description:
      'Record up to four structured glucose checks each day — fasting and post-meal — in seconds.',
  },
  {
    icon: BarChart3,
    title: 'Clear Pattern Insights',
    description:
      'Review daily, month-to-date, and monthly summaries to spot trends before your next checkup.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by Design',
    description:
      'Your health readings stay personal, organized, and accessible whenever you need them.',
  },
];

export default function LandingPage({ onOpenLogin }) {
  return (
    <div className="bg-paper-grain relative flex min-h-screen flex-col overflow-x-clip bg-[#f1f6f3] text-[#2d4742]">
      {/* Unified Header + Hero wrapper so there is no separation */}
      <div className="relative overflow-hidden">
        {/* Soft mint radial glow accents matching reference image */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#9ad2c3]/45 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#b5dfd3]/40 blur-3xl"
        />

        {/* Signature sage-teal circle with seamless glucometer illustration (desktop) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-1/2 mt-4 hidden h-[430px] w-[430px] -translate-y-1/2 lg:block xl:right-12 xl:h-[490px] xl:w-[490px] 2xl:right-20 2xl:h-[530px] 2xl:w-[530px]"
        >
          <div className="relative h-full w-full overflow-hidden rounded-full bg-[#48a992] shadow-lg shadow-[#1e6355]/10">
            <img
              src={glucometerHeroImg}
              alt=""
              className="h-full w-full object-cover object-center"
            />
            <div className="bg-halftone absolute inset-0 opacity-35" />
          </div>

          {/* Small decorative heart on the right side of the round */}
          <svg
            viewBox="0 0 32 30"
            fill="none"
            className="absolute -right-2 bottom-12 h-6 w-6 rotate-12 text-[#48a992] xl:-right-4 xl:bottom-14"
          >
            <path
              d="M16 27.5C16 27.5 3 19.6 3 10.4C3 6.2 6.2 3 10.2 3C12.7 3 14.9 4.3 16 6.3C17.1 4.3 19.3 3 21.8 3C25.8 3 29 6.2 29 10.4C29 19.6 16 27.5 16 27.5Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <Navbar onOpenLogin={onOpenLogin} />

        {/* Hero Section */}
        <section className="relative flex items-center lg:min-h-[590px] xl:min-h-[650px]">
          {/* Decorative tilted test tube (top-left, like image) */}
          <svg
            viewBox="0 0 70 130"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 top-28 hidden h-28 w-16 -rotate-12 opacity-90 xl:block"
          >
            <rect x="16" y="8" width="38" height="22" rx="4" fill="#EC4D43" />
            <path
              d="M23 10V28M30 10V28M37 10V28M44 10V28"
              stroke="#FAF7F4"
              strokeWidth="1.5"
              opacity="0.55"
            />
            <rect x="20" y="30" width="30" height="88" rx="15" fill="#48A992" />
            <rect x="25" y="54" width="20" height="58" rx="10" fill="#FAF7F4" />
          </svg>

          {/* Decorative small teal hearts */}
          <svg
            viewBox="0 0 32 30"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute left-14 top-24 hidden h-6 w-6 text-[#48a992] lg:block"
          >
            <path
              d="M16 27.5C16 27.5 3 19.6 3 10.4C3 6.2 6.2 3 10.2 3C12.7 3 14.9 4.3 16 6.3C17.1 4.3 19.3 3 21.8 3C25.8 3 29 6.2 29 10.4C29 19.6 16 27.5 16 27.5Z"
              fill="currentColor"
            />
          </svg>
          <svg
            viewBox="0 0 32 30"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute bottom-20 left-[46%] hidden h-6 w-6 rotate-12 text-[#48a992] lg:block"
          >
            <path
              d="M16 27.5C16 27.5 3 19.6 3 10.4C3 6.2 6.2 3 10.2 3C12.7 3 14.9 4.3 16 6.3C17.1 4.3 19.3 3 21.8 3C25.8 3 29 6.2 29 10.4C29 19.6 16 27.5 16 27.5Z"
              fill="currentColor"
            />
          </svg>

          {/* Decorative minimal line-art cloud outlines */}
          <svg
            viewBox="0 0 180 90"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute left-[38%] top-20 hidden h-20 w-40 text-[#48a992]/75 lg:block"
          >
            <path
              d="M10 74C28 70 46 69 70 72C100 76 134 78 168 84M28 71C28 57 38 49 48 52C50 26 70 12 92 14C115 16 127 36 124 55C136 53 149 62 149 77"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <svg
            viewBox="0 0 160 80"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 left-6 hidden h-20 w-36 text-[#48a992]/70 lg:block"
          >
            <path
              d="M8 68C48 58 106 58 152 68M32 63C31 50 40 43 49 46C51 24 68 14 86 17C103 20 112 36 109 52C120 50 129 56 129 64"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Decorative tilted medicine bottle (bottom-center, like image) */}
          <svg
            viewBox="0 0 110 110"
            fill="none"
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-5 left-[38%] hidden h-24 w-24 rotate-[28deg] opacity-90 lg:block"
          >
            <rect x="28" y="8" width="54" height="16" rx="4" fill="#EC4D43" />
            <rect x="22" y="24" width="66" height="76" rx="12" fill="#48A992" />
            <path
              d="M66 24H76C82.6 24 88 29.4 88 36V88C88 94.6 82.6 100 76 100H66V24Z"
              fill="#1E6355"
            />
            <rect x="22" y="42" width="44" height="42" fill="#EC4D43" />
          </svg>

          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-24 lg:pt-32">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
              {/* Left Copy */}
              <div className="text-center lg:col-span-6 lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#48a992]/40 bg-[#fafcf9]/90 px-4 py-1.5 text-xs font-semibold text-[#267464] shadow-sm">
                  <Sparkles
                    className="h-3.5 w-3.5 text-[#ec4d43]"
                    aria-hidden="true"
                  />
                  <span>Personal Blood Glucose Companion</span>
                </div>

                <h1 className="font-display mt-6 text-5xl font-bold tracking-tight text-[#48a992] sm:text-6xl lg:text-7xl">
                  Sweetly
                </h1>

                <p className="font-display mt-3 text-xl font-semibold tracking-tight text-[#267464] sm:text-2xl">
                  Smart Glucose Tracking Made Simple
                </p>

                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#45605a] sm:text-lg lg:mx-0">
                  Take control of your health with effortless glucose tracking.
                  Monitor your readings, understand your patterns, and stay
                  informed about your health journey — all in one place.
                </p>

                <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#48a992] bg-[#48a992] px-8 py-3.5 text-base font-semibold text-[#faf7f4] shadow-md shadow-[#267464]/15 transition-all duration-150 hover:border-[#267464] hover:bg-[#267464] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#267464] focus-visible:ring-offset-2 sm:w-auto"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#4e6b64] lg:justify-start">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#48a992]" />
                    4 daily meal slots
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ec4d43]" />
                    Daily &amp; monthly summaries
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#267464]" />
                    Calm, distraction-free UI
                  </span>
                </div>
              </div>

              {/* Mobile / Tablet Circular Illustration */}
              <div className="lg:hidden">
                <div className="relative mx-auto aspect-square w-full max-w-[290px] sm:max-w-[330px]">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-[#48a992] shadow-xl shadow-[#1e6355]/15">
                    <img
                      src={glucometerHeroImg}
                      alt="Illustrated hand and digital blood glucose meter showing a 98 mg/dL reading"
                      className="h-full w-full object-cover object-center"
                    />
                    <div className="bg-halftone pointer-events-none absolute inset-0 opacity-35" />
                  </div>
                  <svg
                    viewBox="0 0 32 30"
                    fill="none"
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 bottom-8 h-5 w-5 rotate-12 text-[#48a992]"
                  >
                    <path
                      d="M16 27.5C16 27.5 3 19.6 3 10.4C3 6.2 6.2 3 10.2 3C12.7 3 14.9 4.3 16 6.3C17.1 4.3 19.3 3 21.8 3C25.8 3 29 6.2 29 10.4C29 19.6 16 27.5 16 27.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Daily & Monthly Glucose Charts + Feature Highlights */}
      <main className="relative z-10 flex-1">
        <GlucoseChartsSection />

        <section
          aria-label="Key benefits"
          className="border-t border-[#48a992]/20 bg-[#e9f3ee]/65 py-14 sm:py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-[#48a992]/20 bg-[#fafcf9] p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#48a992]/45 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e3f1eb] text-[#267464]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="font-display mt-4 text-lg font-bold text-[#267464]">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#4e6b64]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#48a992]/20 bg-[#f1f6f3] py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-[#5b7670] sm:flex-row sm:px-6 lg:px-8">
          <p className="font-semibold text-[#267464]">
            Sweetly — Smart Glucose Tracking Made Simple
          </p>
          <p>Designed for calm, everyday blood glucose care.</p>
        </div>
      </footer>
    </div>
  );
}
