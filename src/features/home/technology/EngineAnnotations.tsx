import { ENGINE_NOTES } from "./technologyData";

export default function EngineAnnotations({ revealedCount }: { revealedCount: number }) {
  return (
    <div className="petrolero-tech-annotations" aria-label="Технологические преимущества двигателя">
      <svg className="petrolero-tech-connections" viewBox="0 0 1200 675" preserveAspectRatio="none" fill="none" aria-hidden="true">
        {ENGINE_NOTES.map((note, i) => (
          <g className={`petrolero-tech-connection ${i < revealedCount ? "is-visible" : ""}`} key={note.id}>
            <path d={note.line} pathLength="100" />
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
          <span className="petrolero-tech-note-copy"><strong>{note.title}</strong><span>{note.detail}</span></span>
        </div>
      ))}
    </div>
  );
}
