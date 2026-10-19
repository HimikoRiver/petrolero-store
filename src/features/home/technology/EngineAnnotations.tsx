import Image from "next/image";
import { ENGINE_NOTES } from "./technologyData";

const ENGINE_ICON_SRC = {
  protection: "/home/images/icons/3.webp",
  innovation: "/home/images/icons/2.webp",
  efficiency: "/home/images/icons/4.webp",
  stability: "/home/images/icons/1.webp",
} as const;

export default function EngineAnnotations({ revealedCount }: { revealedCount: number }) {
  return (
    <div className="petrolero-tech-annotations" aria-label="Технологические преимущества двигателя">
      <svg className="petrolero-tech-connections" viewBox="0 0 1200 675" preserveAspectRatio="none" fill="none" aria-hidden="true">
        {ENGINE_NOTES.map((note, i) => (
          <g className={`petrolero-tech-connection ${i < revealedCount ? "is-visible" : ""}`} key={note.id}>
            <path className="petrolero-tech-connection-path--wide" d={note.line} pathLength="100" />
            <path className="petrolero-tech-connection-path--compact" d={note.compactLine} pathLength="100" />
            <circle className="petrolero-tech-dot-glow" cx={note.dotX} cy={note.dotY} r="7" />
            <circle className="petrolero-tech-dot" cx={note.dotX} cy={note.dotY} r="3.1" />
          </g>
        ))}
      </svg>
      {ENGINE_NOTES.map((note, i) => (
        <div
          className={`petrolero-tech-note petrolero-tech-note--${note.side}-${note.position} ${i < revealedCount ? "is-visible" : ""}`}
          key={note.id}
        >
          <span className="petrolero-tech-note-icon"><Image className="petrolero-tech-note-icon-image" src={ENGINE_ICON_SRC[note.id]} width={96} height={96} alt="" /></span>
          <span className="petrolero-tech-note-copy"><strong>{note.title}</strong><span>{note.detail}</span></span>
        </div>
      ))}
    </div>
  );
}
