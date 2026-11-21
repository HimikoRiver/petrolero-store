"use client";

import { useEffect, useRef } from "react";
import "./GoldenThreadsOrb.css";

/**
 * A lightweight SVG kinetic sculpture for the empty space to the right
 * of the login form. Independent orbit animations run on the compositor:
 * no WebGL, heavy video, or frame-by-frame React re-renders.
 */
export default function GoldenThreadsOrb() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reduceMotion.matches) return;

    let frame = 0;
    const update = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const bounds = root.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
        const xShift = Math.round(x * 10);
        const yShift = Math.round(y * 7);
        root.style.setProperty("--threads-x", xShift + "px");
        root.style.setProperty("--threads-y", yShift + "px");
        root.style.setProperty("--threads-tilt-x", (-y * 6).toFixed(2) + "deg");
        root.style.setProperty("--threads-tilt-y", (x * 8).toFixed(2) + "deg");
      });
    };

    window.addEventListener("pointermove", update, { passive: true });
    return () => {
      window.removeEventListener("pointermove", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="golden-threads-orb" aria-hidden="true">
      <div className="golden-threads-orb__float">
        <div className="golden-threads-orb__halo" />
        <svg
          className="golden-threads-orb__art"
          viewBox="0 0 560 560"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
        >
          <defs>
            <linearGradient id="threads-rich" x1="52" y1="89" x2="475" y2="470" gradientUnits="userSpaceOnUse">
              <stop stopColor="#B36E2C" stopOpacity=".12" />
              <stop offset=".16" stopColor="#FFE7B4" stopOpacity=".91" />
              <stop offset=".33" stopColor="#B87835" stopOpacity=".43" />
              <stop offset=".53" stopColor="#F3BD6F" stopOpacity=".8" />
              <stop offset=".71" stopColor="#8C511E" stopOpacity=".24" />
              <stop offset=".9" stopColor="#FFDB98" stopOpacity=".94" />
              <stop offset="1" stopColor="#BD7D35" stopOpacity=".18" />
            </linearGradient>
            <linearGradient id="threads-soft" x1="490" y1="72" x2="130" y2="490" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFEBC7" stopOpacity=".9" />
              <stop offset=".22" stopColor="#C78638" stopOpacity=".18" />
              <stop offset=".43" stopColor="#F3C98B" stopOpacity=".88" />
              <stop offset=".63" stopColor="#8C551F" stopOpacity=".16" />
              <stop offset=".82" stopColor="#EFC27D" stopOpacity=".73" />
              <stop offset="1" stopColor="#FFE3A8" stopOpacity=".11" />
            </linearGradient>
            <radialGradient id="threads-core">
              <stop stopColor="#FFF4D7" stopOpacity=".85" />
              <stop offset=".24" stopColor="#F5BD63" stopOpacity=".5" />
              <stop offset="1" stopColor="#D88832" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="threads-spark">
              <stop stopColor="#FFF9E5" />
              <stop offset=".32" stopColor="#FDD596" />
              <stop offset="1" stopColor="#CB7C29" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="280" cy="280" r="90" fill="url(#threads-core)" opacity=".1" />

          <g className="golden-threads-orb__orbit golden-threads-orb__orbit--1">
            <ellipse cx="280" cy="280" rx="199" ry="66" stroke="url(#threads-rich)" strokeWidth="1.9" />
            <ellipse cx="280" cy="280" rx="195" ry="63" stroke="url(#threads-soft)" strokeWidth=".55" opacity=".55" />
          </g>
          <g className="golden-threads-orb__orbit golden-threads-orb__orbit--2">
            <ellipse cx="280" cy="280" rx="193" ry="77" stroke="url(#threads-soft)" strokeWidth="1.45" />
          </g>
          <g className="golden-threads-orb__orbit golden-threads-orb__orbit--3">
            <ellipse cx="280" cy="280" rx="208" ry="89" stroke="url(#threads-rich)" strokeWidth="1.3" />
            <ellipse cx="280" cy="280" rx="204" ry="86" stroke="url(#threads-soft)" strokeWidth=".6" opacity=".35" />
          </g>
          <g className="golden-threads-orb__orbit golden-threads-orb__orbit--4">
            <ellipse cx="280" cy="280" rx="176" ry="69" stroke="url(#threads-soft)" strokeWidth="1.9" />
          </g>
          <g className="golden-threads-orb__orbit golden-threads-orb__orbit--5">
            <ellipse cx="280" cy="280" rx="157" ry="56" stroke="url(#threads-rich)" strokeWidth="1.2" />
          </g>
          <g className="golden-threads-orb__orbit golden-threads-orb__orbit--6">
            <ellipse cx="280" cy="280" rx="187" ry="103" stroke="url(#threads-soft)" strokeWidth=".9" />
          </g>
          <g className="golden-threads-orb__orbit golden-threads-orb__orbit--7">
            <ellipse cx="280" cy="280" rx="145" ry="62" stroke="url(#threads-rich)" strokeWidth="1.45" />
          </g>
          <g className="golden-threads-orb__orbit golden-threads-orb__orbit--8">
            <ellipse cx="280" cy="280" rx="213" ry="95" stroke="url(#threads-soft)" strokeWidth=".8" opacity=".65" />
          </g>

          <g className="golden-threads-orb__orbit golden-threads-orb__orbit--9">
            <path
              d="M93 280 C128 156 423 159 467 280 C425 402 132 407 93 280Z"
              stroke="url(#threads-rich)"
              strokeWidth=".75"
              opacity=".55"
            />
          </g>

          <circle className="golden-threads-orb__spark golden-threads-orb__spark--1" cx="474" cy="280" r="4" fill="url(#threads-spark)" />
          <circle className="golden-threads-orb__spark golden-threads-orb__spark--2" cx="104" cy="280" r="3.5" fill="url(#threads-spark)" />
          <circle className="golden-threads-orb__spark golden-threads-orb__spark--3" cx="280" cy="143" r="2.8" fill="url(#threads-spark)" />
          <circle className="golden-threads-orb__spark golden-threads-orb__spark--4" cx="280" cy="418" r="3.3" fill="url(#threads-spark)" />

          <circle cx="280" cy="280" r="10" fill="url(#threads-core)" opacity=".34" />
        </svg>
      </div>
    </div>
  );
}
