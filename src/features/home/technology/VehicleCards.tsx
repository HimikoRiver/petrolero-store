import { VEHICLE_TYPES } from "./technologyData";

function VehiclePlaceholder({ type }: { type: "car" | "moto" | "truck" }) {
  if (type === "car") {
    return <svg viewBox="0 0 160 66" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true"><path d="M17 42 28 26 51 22 67 10h43l21 21 13 5v16H17Z"/><path d="M40 24h29l10-10h25l17 18H31"/><circle cx="44" cy="51" r="10"/><circle cx="120" cy="51" r="10"/><path d="M79 15V32M13 43h15m105-3h13"/></svg>;
  }
  if (type === "moto") {
    return <svg viewBox="0 0 160 66" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true"><circle cx="32" cy="49" r="14"/><circle cx="124" cy="49" r="14"/><path d="m32 49 34-31 24 31H32l34-31 15 13h36l7 18M84 17h16l10 8-4 10M112 16h14l11 10M73 12h21M84 17l-6-8H63"/></svg>;
  }
  return <svg viewBox="0 0 160 66" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true"><path d="M13 17h90v36H13zM103 29h25l19 17v7h-44zM113 30v14h27M20 26h74M20 34h74M20 42h74"/><circle cx="36" cy="53" r="9"/><circle cx="121" cy="53" r="9"/></svg>;
}

export default function VehicleCards() {
  return (
    <div className="petrolero-tech-cards" aria-label="Выбор категории транспорта">
      {VEHICLE_TYPES.map((vehicle) => (
        <article key={vehicle.id} className="petrolero-tech-vehicle" aria-label={vehicle.title}>
          <span className="petrolero-tech-vehicle-index">{vehicle.number} / 03</span>
          <div className="petrolero-tech-vehicle-placeholder">
            <VehiclePlaceholder type={vehicle.type} />
          </div>
          <div className="petrolero-tech-vehicle-footer">
            <span>{vehicle.title}</span>
            <span className="petrolero-tech-vehicle-arrow" aria-hidden="true">↗</span>
          </div>
        </article>
      ))}
    </div>
  );
}
