import "./OilDropletDivider.css";

type OilDropletDividerProps = {
  reducedMotion?: boolean;
};

// Keep the existing divider boundary so adjacent sections retain their layout.
export default function OilDropletDivider({
  reducedMotion = false,
}: OilDropletDividerProps) {
  return (
    <div
      className="petrolero-oil-divider"
      data-reduced-motion={reducedMotion}
      aria-hidden="true"
    >
      <span className="petrolero-oil-divider__surface" />
      <span className="petrolero-oil-divider__warmth" />
      <span className="petrolero-oil-divider__reflection" />
    </div>
  );
}
