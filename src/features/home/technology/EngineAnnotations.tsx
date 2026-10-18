import { ENGINE_NOTES } from "./technologyData";

type EngineNote = (typeof ENGINE_NOTES)[number];

function NoteIcon({ name }: { name: EngineNote["icon"] }) {
  if (name === "shield") return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M16 3 27 7v9c0 6-5 11-11 14C10 27 5 22 5 16V7L16 3Z"/><path d="m11 16 4 4 7-8"/></svg>;
  if (name === "gear") return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M14 3h4l1 4 4 2 4-2 3 4-3 3v5l3 2-3 4-4-2-4 2-1 4h-4l-1-4-4-2-4 2-3-4 3-3v-4l-3-3 3-4 4 2 4-2 1-4Z"/><circle cx="16" cy="16" r="5.3"/></svg>;
  if (name === "gauge") return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 24a13 13 0 1 1 22 0H5Z"/><path d="m16 21 8-10"/><circle cx="16" cy="21" r="2"/><path d="M7 16h4M16 7v4m8 5h3"/></svg>;
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M16 3C12 10 7 16 7 21a9 9 0 0 0 18 0c0-5-5-11-9-18Z"/><path d="M12 21c0 3 2 5 5 5"/></svg>;
}

export default function EngineAnnotations({ revealedCount }: { revealedCount: number }) {
  return (
    <div className="petrolero-tech-annotations" aria-label="Технологические преимущества двигателя">
      <svg className="petrolero-tech-connections" viewBox="0 0 1200 620" preserveAspectRatio="none" fill="none" aria-hidden="true">
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
          <span className="petrolero-tech-note-icon"><NoteIcon name={note.icon} /></span>
          <span className="petrolero-tech-note-copy"><strong>{note.title}</strong><span>{note.detail}</span></span>
        </div>
      ))}
    </div>
  );
}
