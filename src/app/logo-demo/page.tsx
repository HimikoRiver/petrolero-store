"use client";

import { useState } from "react";
import PetroleroLogo from "@/components/PetroleroLogo";

export default function LogoDemoPage() {
  const [iteration, setIteration] = useState(0);

  return (
    <main className="min-h-svh bg-[#0b0b0b] px-5 py-9 text-white sm:px-10 sm:py-12">
      <div className="mx-auto max-w-[1180px]">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d7b47c]">
              PETROLERO / VECTOR IDENTITY
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Живой логотип
            </h1>
            <p className="mt-3 max-w-[600px] text-sm leading-6 text-white/60">
              Фирменный знак и надпись плавно появляются. Используется
              оригинальный SVG с сайта Petrolero.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIteration((previous) => previous + 1)}
            className="rounded-full border border-[#d7b47c]/65 px-6 py-3 text-xs font-semibold tracking-wider text-[#f0d1a0] transition-colors hover:bg-[#d7b47c]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d7b47c]"
          >
            Повторить анимацию ↻
          </button>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <section
            className="flex min-h-[400px] flex-col items-center justify-center gap-12 rounded-2xl bg-[#e2e1df] p-9"
            aria-label="Оригинальная тёмная версия логотипа"
          >
            <PetroleroLogo
              key={`ink-${iteration}`}
              variant="original"
              animated
              className="max-w-[420px]"
            />
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#192630]/55">
              ORIGINAL / DARK INK
            </span>
          </section>

          <section
            className="flex min-h-[400px] flex-col items-center justify-center gap-12 rounded-2xl border border-[#bd8b4e]/25 bg-[radial-gradient(ellipse_at_55%_42%,#302115_0%,#0b0b0b_68%)] p-9"
            aria-label="Золотистая версия логотипа"
          >
            <PetroleroLogo
              key={`gold-${iteration}`}
              variant="gold"
              animated
              className="max-w-[420px]"
            />
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#d7b47c]/65">
              PREMIUM / WARM GOLD
            </span>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-xs text-white/55">
          <a href="/liquid-demo" className="underline decoration-[#d7b47c] underline-offset-4 hover:text-white">
            Посмотреть в интро масла ↗
          </a>
          <a href="https://petrolero.ru/upload/iblock/35e/jgc65bilqftol5pq129e204e9ngvhlj3/logo.svg" target="_blank" rel="noreferrer" className="underline decoration-[#d7b47c] underline-offset-4 hover:text-white">
            Открыть самостоятельный SVG ↗
          </a>
        </div>
      </div>
    </main>
  );
}
