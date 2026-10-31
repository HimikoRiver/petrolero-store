import "./OilDropletDivider.css";

type OilDropletDividerProps = {
  reducedMotion?: boolean;
};

/**
 * A single sculpted oil surface bridges the technology and contacts sections.
 * SVG is decorative and static; only the reflected light is animated.
 */
export default function OilDropletDivider({
  reducedMotion = false,
}: OilDropletDividerProps) {
  return (
    <div
      className="petrolero-oil-divider"
      data-reduced-motion={reducedMotion}
      aria-hidden="true"
    >
      <svg
        className="petrolero-oil-divider__art"
        viewBox="0 0 1600 220"
        preserveAspectRatio="none"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="petrolero-oil-depth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#050505" />
            <stop offset=".23" stopColor="#151719" />
            <stop offset=".42" stopColor="#45484a" />
            <stop offset=".52" stopColor="#181918" />
            <stop offset=".72" stopColor="#080808" />
            <stop offset="1" stopColor="#050505" />
          </linearGradient>
          <linearGradient id="petrolero-oil-sheen" x1="0" y1="0" x2="1" y2=".17">
            <stop offset="0" stopColor="#111213" />
            <stop offset=".2" stopColor="#333838" />
            <stop offset=".38" stopColor="#8e918d" />
            <stop offset=".53" stopColor="#434544" />
            <stop offset=".75" stopColor="#6b5e4e" />
            <stop offset=".88" stopColor="#b58346" />
            <stop offset="1" stopColor="#332314" />
          </linearGradient>
          <linearGradient id="petrolero-oil-ridge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#54585a" stopOpacity="0" />
            <stop offset=".22" stopColor="#abb0ae" stopOpacity=".7" />
            <stop offset=".38" stopColor="#d6d2c7" stopOpacity=".5" />
            <stop offset=".6" stopColor="#a6a19a" stopOpacity=".5" />
            <stop offset=".86" stopColor="#edba74" stopOpacity=".85" />
            <stop offset="1" stopColor="#a56125" stopOpacity=".1" />
          </linearGradient>
          <linearGradient id="petrolero-oil-ribbon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c7c3b7" stopOpacity=".06" />
            <stop offset=".25" stopColor="#f7eee0" stopOpacity=".44" />
            <stop offset=".36" stopColor="#6f706d" stopOpacity=".25" />
            <stop offset=".6" stopColor="#171818" stopOpacity=".73" />
            <stop offset="1" stopColor="#080808" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="petrolero-oil-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#be965e" stopOpacity="0" />
            <stop offset=".63" stopColor="#b37f43" stopOpacity=".12" />
            <stop offset=".8" stopColor="#f4ba65" stopOpacity=".68" />
            <stop offset=".94" stopColor="#b17932" stopOpacity=".4" />
            <stop offset="1" stopColor="#cf9243" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="petrolero-oil-glow" cx="79%" cy="53%" r="49%">
            <stop offset="0" stopColor="#a16c33" stopOpacity=".3" />
            <stop offset=".4" stopColor="#73502b" stopOpacity=".13" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path
          d="M-40 129 C164 157 290 103 451 99 C590 95 635 139 806 124 C973 106 1050 82 1232 87 C1389 92 1506 62 1640 35 L1640 198 C1450 186 1320 166 1184 170 C1016 178 882 184 726 166 C518 140 347 190 170 175 C80 167 16 175 -40 172 Z"
          fill="url(#petrolero-oil-depth)"
          opacity=".95"
        />
        <path
          d="M-50 135 C163 155 275 111 447 104 C601 97 636 147 804 131 C982 114 1045 84 1228 94 C1415 101 1537 57 1650 42 L1650 95 C1474 109 1390 127 1228 121 C1074 118 964 145 807 151 C635 163 563 127 432 132 C269 139 145 178 -50 157 Z"
          fill="url(#petrolero-oil-ribbon)"
          opacity=".94"
        />
        <path
          d="M-20 151 C175 170 297 134 448 123 C623 110 649 157 824 140 C999 123 1066 93 1250 103 C1392 111 1512 70 1618 59"
          stroke="url(#petrolero-oil-ridge)"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
          opacity=".78"
        />
        <path
          d="M-30 165 C216 174 295 153 450 146 C620 139 672 176 837 164 C997 153 1105 121 1270 137 C1405 153 1548 95 1635 82 L1635 161 C1394 200 1284 170 1100 178 C922 185 838 207 650 185 C475 165 225 214 -30 189 Z"
          fill="url(#petrolero-oil-sheen)"
          opacity=".63"
        />
        <path
          d="M575 149 C724 186 846 154 1020 131 C1124 117 1224 104 1338 115 C1448 121 1509 89 1640 73 L1640 138 C1490 151 1432 148 1332 140 C1198 125 1112 154 998 168 C808 194 694 184 575 149 Z"
          fill="url(#petrolero-oil-gold)"
          opacity=".9"
        />
        <path
          d="M100 171 C355 193 469 154 659 168 C801 181 891 173 1059 148 C1241 119 1371 153 1569 100"
          stroke="url(#petrolero-oil-ridge)"
          strokeWidth="1.1"
          fill="none"
          opacity=".25"
        />
        <rect
          x="0"
          y="0"
          width="1600"
          height="220"
          fill="url(#petrolero-oil-glow)"
          opacity=".4"
        />
      </svg>
      <span className="petrolero-oil-divider__reflection" />
    </div>
  );
}
