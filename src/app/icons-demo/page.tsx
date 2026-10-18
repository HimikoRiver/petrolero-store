"use client";

import { useState } from "react";
import FuelEconomyIcon from "@/components/icons/FuelEconomyIcon";

export default function IconsDemoPage() {
  const [playing, setPlaying] = useState(true);

  return (
    <main className="min-h-svh bg-[#080808] px-6 py-10 text-[#f1e7d8] sm:px-12">
      <div className="mx-auto max-w-[1160px]">
        <header className="mb-12 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="mb-3 text-[11px] font-bold tracking-[.25em] text-[#d7b47c]">
              PETROLERO / ПРЕИМУЩЕСТВА
            </p>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
              Иконка 01
            </h1>
            <p className="mt-4 max-w-[580px] text-sm leading-7 text-white/65">
              Снижение расхода топлива. Векторные молекулы, капля масла,
              золотые связи и индикатор экономии.
            </p>
          </div>
          <button
            type="button"
            className="border border-[#d7b47c]/60 px-6 py-3 text-xs font-semibold uppercase tracking-[.13em] text-[#edca97] hover:bg-[#d7b47c]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d7b47c]"
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? "Остановить анимацию" : "Включить анимацию"}
          </button>
        </header>

        <div className="grid gap-6 md:grid-cols-[1.2fr_.8fr]">
          <section className="flex min-h-[420px] flex-col items-center justify-center gap-6 border border-[#e2bc7a]/20 bg-[radial-gradient(ellipse_at_50%_40%,#222017_0%,#0d0d0c_68%)] p-6">
            <FuelEconomyIcon
              animated={playing}
              width={280}
              height={280}
            />
            <span className="text-[10px] uppercase tracking-[.24em] text-[#d7b47c]/70">Большой размер</span>
          </section>
          <section className="flex min-h-[420px] flex-col items-center justify-center gap-6 border border-[#e2bc7a]/20 bg-[#151819] p-6">
            <FuelEconomyIcon
              animated={playing}
              width={108}
              height={108}
            />
            <h2 className="text-center text-base font-bold uppercase tracking-tight">
              Снижение расхода топлива
            </h2>
            <span className="text-[10px] uppercase tracking-[.24em] text-[#d7b47c]/70">Размер карточки</span>
          </section>
        </div>
        <p className="mt-7 text-xs leading-6 text-white/45">
          Это только отдельный предпросмотр. Третий блок главной страницы не изменён.
        </p>
      </div>
    </main>
  );
}
