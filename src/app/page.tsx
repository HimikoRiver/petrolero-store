
import dynamic from "next/dynamic";

const PetroleroHero = dynamic(
  () => import("@/components/PetroleroHero"),
  {
    loading: () => (
      <main className="flex h-dvh items-center justify-center bg-[#050505]">
        <span className="text-xs tracking-[0.3em] text-[#d5b179]">
          PETROLERO · ЗАГРУЗКА
        </span>
      </main>
    ),
  },
);

export default function Home() {
  return (
    <main className="h-dvh w-full overflow-hidden bg-[#050505]">
      <PetroleroHero />
    </main>
  );
}
