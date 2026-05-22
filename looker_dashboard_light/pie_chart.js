/**
 * Rocket Software — Pie / Donut Chart
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add a new visualization and paste the URL.
 *   3. In any Explore, select "Rocket — Pie Chart (Light)" from the visualization picker.
 *
 * Supports:
 *   - One dimension + one measure  → standard pie / donut
 *   - One dimension + two measures → first measure sizes slices, second drives tooltip detail
 *   - Fully responsive: adapts layout, legend placement, and font sizes at any tile size
 *   - Interactive: hover highlights, animated entrance, click-to-drill
 *
 * Version: 1.0.0  |  May 2025
 */

(function () {
  "use strict";

  /* ─── Brand tokens ────────────────────────────────────────────────────── */
  const T = {
    bg:   "#FFFFFF",
    surf: "#F8F8FA",
    card:    "#F8F8FA",
    bo:   "#E5E5EA",
    bo2:  "#EBEBF0",
    tx:   "#1C1C1E",
    mt:   "#8E8E93",
    dm:   "#F2F2F7",
    B:     "#3B7EF6",
    P:     "#7B3FE4",
    K:     "#D9349A",
    ok:    "#2DD4A0",
    wn:    "#F0A830",
    er:    "#F06060",
  };

  /* ─── Slice color palette — blue → purple → pink brand family ────────── */
  const PALETTE = [
    "#3B7EF6",   // brand blue
    "#5B5EF4",   // blue-indigo
    "#7B3FE4",   // brand purple
    "#9B30D0",   // purple-violet
    "#B838B8",   // violet-magenta
    "#D9349A",   // brand pink
    "#2495CC",   // sky blue
    "#4355E8",   // cobalt
    "#6B28C8",   // deep purple
    "#A020A8",   // magenta-purple
    "#CC2888",   // deep pink
    "#E03070",   // crimson-pink
  ];

  /* ─── Injected CSS ────────────────────────────────────────────────────── */
  const CSS = `
    .rpc-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: ${T.bg};
      overflow: hidden;
      box-sizing: border-box;
      border-radius: 10px;
      border: 1px solid ${T.bo};
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.08);
      position: relative;
    }

    /* ── Top bar ── */
    .rpc-topbar {
      background: ${T.surf};
      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo};
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-shrink: 0;
    }
    .rpc-topbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .rpc-logo        { width: 20px; height: 20px; flex-shrink: 0; opacity: .85; }
    .rpc-title {
      font-size: 14px;
      font-weight: 500;
      color: ${T.tx};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rpc-subtitle {
      font-size: 11px;
      color: ${T.mt};
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* ── Animated gradient line ── */
    .rpc-gline {
      height: 2px;
      background: linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K});
      background-size: 200% 100%;
      flex-shrink: 0;
      animation: rpc-grad-flow 5s ease-in-out infinite alternate;
    }
    @keyframes rpc-grad-flow {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }

    /* ── Chart body: SVG + legend side-by-side or stacked ── */
    .rpc-body {
      flex: 1;
      display: flex;
      align-items: stretch;
      justify-content: center;
      gap: 0;
      overflow: visible;
      min-height: 0;
      padding: 12px 16px 10px;
      box-sizing: border-box;
      position: relative;
    }
    .rpc-body.stacked {
      flex-direction: column;
    }

    /* ── SVG canvas wrapper ── */
    .rpc-svg-wrap {
      flex-shrink: 0;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: center;
    }
    .rpc-svg-wrap svg {
      display: block;
      overflow: visible;
    }

    /* ── Donut center text ── */
    .rpc-center-label {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
      line-height: 1.2;
    }
    .rpc-center-value {
      font-size: 22px;
      font-weight: 500;
      color: ${T.tx};
      font-variant-numeric: tabular-nums;
      display: block;
    }
    .rpc-center-label-text {
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1.1px;
      color: ${T.mt};
      display: block;
      margin-top: 3px;
    }

    /* ── Legend ── */
    .rpc-legend {
      display: flex;
      flex-direction: column;
      gap: 5px;
      overflow-y: auto;
      overflow-x: hidden;
      min-height: 0;
      align-self: stretch;
      min-width: 100px;
      padding: 2px 0 2px 16px;
      box-sizing: border-box;
      flex-shrink: 1;
    }
    .rpc-body.stacked .rpc-legend {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      padding: 8px 0 2px;
      max-height: 80px;
      gap: 4px 10px;
    }
    .rpc-legend::-webkit-scrollbar { width: 4px; }
    .rpc-legend::-webkit-scrollbar-track { background: transparent; }
    .rpc-legend::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 2px; }

    .rpc-legend-item {
      display: flex;
      align-items: center;
      gap: 7px;
      cursor: pointer;
      padding: 3px 6px 3px 0;
      border-radius: 5px;
      transition: background .12s;
      min-width: 0;
    }
    .rpc-legend-item:hover { background: rgba(0,0,0,0.05); }
    .rpc-legend-item.dimmed { opacity: .35; }

    .rpc-legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .rpc-legend-name {
      font-size: 12px;
      color: #6B6B7B;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 130px;
    }
    .rpc-legend-pct {
      font-size: 11px;
      color: ${T.mt};
      white-space: nowrap;
      margin-left: auto;
      padding-left: 6px;
      font-variant-numeric: tabular-nums;
    }
    .rpc-body.stacked .rpc-legend-pct { display: none; }

    /* ── Tooltip ── */
    .rpc-tooltip {
      position: fixed;
      pointer-events: none;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: rgba(255,255,255,0.98);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(0,0,0,0.09);
      border-radius: 10px;
      padding: 0;
      overflow: hidden;
      z-index: 9999;
      opacity: 0;
      transform: translateY(6px) scale(0.97);
      transition: opacity .15s ease, transform .15s ease;
      box-shadow: 0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04);
      min-width: 148px;
      max-width: 240px;
    }
    .rpc-tooltip.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    .rpc-tt-accent {
      height: 3px;
      background: ${T.P};
      flex-shrink: 0;
    }
    .rpc-tt-body {
      padding: 10px 14px 13px;
    }
    .rpc-tt-header {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-bottom: 8px;
    }
    .rpc-tt-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${T.P};
      flex-shrink: 0;
    }
    .rpc-tooltip-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.1px;
      color: #6B6B7B;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rpc-tooltip-value {
      font-size: 24px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      color: ${T.tx};
      letter-spacing: -0.5px;
      line-height: 1;
      margin-bottom: 5px;
    }
    .rpc-tooltip-pct {
      font-size: 11px;
      color: ${T.mt};
      letter-spacing: .2px;
    }

    /* ── Slice interaction ── */
    .rpc-slice {
      cursor: pointer;
      transition: filter .15s, opacity .15s;
    }
    .rpc-slice:hover {
      filter: brightness(1.18) drop-shadow(0 0 6px rgba(255,255,255,.15));
    }
    .rpc-slice.dimmed { opacity: .28; }
    .rpc-slice.pinned {
      filter: brightness(1.2) drop-shadow(0 0 9px rgba(255,255,255,.22));
    }
    .rpc-slice.pinned path {
      stroke: rgba(255,255,255,0.55) !important;
      stroke-width: 3 !important;
      /* Override the entrance-animation dash state so the full perimeter is stroked */
      stroke-dasharray: none !important;
      stroke-dashoffset: 0 !important;
    }
    .rpc-legend-item.pinned {
      background: rgba(0,0,0,0.06) !important;
    }
    .rpc-legend-item.pinned .rpc-legend-name {
      color: #E2E2FF;
      font-weight: 600;
    }

    /* ── Empty / error state ── */
    .rpc-empty {
      color: ${T.mt};
      font-size: 13px;
      text-align: center;
      padding: 20px;
      width: 100%;
    }

    /* ── Responsive width breakpoints via data-w on rpc-root ── */
    .rpc-root[data-w="xs"] .rpc-topbar  { padding: 7px 10px; }
    .rpc-root[data-w="xs"] .rpc-title   { font-size: 12px; }
    .rpc-root[data-w="xs"] .rpc-subtitle { display: none; }
    .rpc-root[data-w="xs"] .rpc-body    { padding: 6px 8px 5px; }
    .rpc-root[data-w="xs"] .rpc-legend  { display: none; }
    .rpc-root[data-w="xs"] .rpc-center-value { font-size: 16px; }

    .rpc-root[data-w="sm"] .rpc-subtitle { display: none; }
    .rpc-root[data-w="sm"] .rpc-legend-name { max-width: 80px; }

    /* ── Responsive height breakpoints ── */
    .rpc-root[data-h="xs"] .rpc-topbar   { display: none; }
    .rpc-root[data-h="xs"] .rpc-gline    { display: none; }
    .rpc-root[data-h="xs"] .rpc-legend   { display: none; }
    .rpc-root[data-h="xs"] .rpc-body     { padding: 4px; }

    .rpc-root[data-h="sm"] .rpc-topbar   { padding: 6px 12px; }
    .rpc-root[data-h="sm"] .rpc-body     { padding: 6px 12px 4px; }

    /* ── Entrance animation ── */
    @keyframes rpc-spin-in {
      from { stroke-dashoffset: var(--rpc-dash-total); }
      to   { stroke-dashoffset: var(--rpc-dash-offset); }
    }
    .rpc-slice path {
      stroke-dasharray: var(--rpc-dash-total);
      stroke-dashoffset: var(--rpc-dash-total);
      animation: rpc-spin-in .55s cubic-bezier(.4,0,.2,1) forwards;
    }
  `;

  /* ─── SVG logo mark ───────────────────────────────────────────────────── */
  const LOGO_SVG = `
    <svg class="rpc-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rpc-lg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${T.B}"/>
          <stop offset="50%"  stop-color="${T.P}"/>
          <stop offset="100%" stop-color="${T.K}"/>
        </linearGradient>
      </defs>
      <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
            stroke="url(#rpc-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6 L19 6 L19 11"
            stroke="url(#rpc-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  /* ─── Helpers ─────────────────────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function cellVal(cell) {
    if (cell == null) return null;
    return cell.rendered != null ? cell.rendered : cell.value;
  }

  function fmtNumber(v) {
    if (v == null || v === "") return "—";
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
    if (isNaN(n)) return esc(String(v));
    if (Math.abs(n) >= 1e9)  return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (Math.abs(n) >= 1e6)  return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (Math.abs(n) >= 1e3)  return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    if (Number.isInteger(n)) return n.toLocaleString();
    return n.toFixed(2);
  }

  /**
   * Compute an SVG arc path for a pie/donut slice.
   * cx, cy  — center
   * r       — outer radius
   * ir      — inner radius (0 for pie, >0 for donut)
   * start   — start angle in radians
   * end     — end angle in radians
   */
  function arcPath(cx, cy, r, ir, start, end) {
    const pad   = 0.012; // small gap between slices (radians)
    const s     = start + pad;
    const e     = end   - pad;
    const large = (e - s) > Math.PI ? 1 : 0;

    const ox1 = cx + r  * Math.cos(s);
    const oy1 = cy + r  * Math.sin(s);
    const ox2 = cx + r  * Math.cos(e);
    const oy2 = cy + r  * Math.sin(e);
    const ix1 = cx + ir * Math.cos(e);
    const iy1 = cy + ir * Math.sin(e);
    const ix2 = cx + ir * Math.cos(s);
    const iy2 = cy + ir * Math.sin(s);

    if (ir === 0) {
      return `M ${cx} ${cy} L ${ox1} ${oy1} A ${r} ${r} 0 ${large} 1 ${ox2} ${oy2} Z`;
    }
    return [
      `M ${ox1} ${oy1}`,
      `A ${r}  ${r}  0 ${large} 1 ${ox2} ${oy2}`,
      `L ${ix1} ${iy1}`,
      `A ${ir} ${ir} 0 ${large} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");
  }

  /** Lighten a hex color by mixing with white at the given ratio (0–1). */
  function lighten(hex, ratio) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    const mix = (c) => Math.round(c + (255 - c) * ratio);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
  }

  function applyBreakpoints(root, w, h) {
    root.setAttribute("data-w",
      w < 240 ? "xs" : w < 380 ? "sm" : w < 560 ? "md" : "lg"
    );
    root.setAttribute("data-h",
      h < 100 ? "xs" : h < 180 ? "sm" : "lg"
    );
  }

  /* ─── Looker visualization definition ────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_pie_chart_light",
    label: "Rocket — Pie Chart (Light)",

    options: {
      chart_type: {
        type:    "string",
        label:   "Chart style",
        display: "select",
        values:  [
          { "Donut":      "donut" },
          { "Pie":        "pie"   },
        ],
        default: "donut",
        section: "Style",
        order:   1,
      },
      inner_radius_pct: {
        type:    "number",
        label:   "Donut hole size (10–80)",
        default: 58,
        section: "Style",
        order:   2,
      },
      show_center_total: {
        type:    "boolean",
        label:   "Show total in donut center",
        default: true,
        section: "Style",
        order:   3,
      },
      center_label_override: {
        type:        "string",
        label:       "Center label override",
        default:     "",
        placeholder: "Leave blank to use measure label",
        section:     "Style",
        order:       4,
      },
      title_override: {
        type:        "string",
        label:       "Chart title override",
        default:     "",
        placeholder: "Leave blank to use field label",
        section:     "Style",
        order:       5,
      },
      show_legend: {
        type:    "boolean",
        label:   "Show legend",
        default: true,
        section: "Legend",
        order:   6,
      },
      legend_position: {
        type:    "string",
        label:   "Legend position",
        display: "select",
        values:  [
          { "Right (auto)": "auto"   },
          { "Right":        "right"  },
          { "Bottom":       "bottom" },
        ],
        default: "auto",
        section: "Legend",
        order:   7,
      },
      max_slices: {
        type:    "number",
        label:   "Max slices (0 = show all)",
        default: 500,
        section: "Data",
        order:   8,
      },
      gradient_stop: {
        type:    "string",
        label:   "Accent line color",
        display: "select",
        values:  [
          { "Full gradient (blue → pink)": "full"        },
          { "Blue":                        "blue"        },
          { "Blue → Purple":               "blue-purple" },
          { "Purple":                      "purple"      },
          { "Purple → Pink":               "purple-pink" },
          { "Pink":                        "pink"        },
        ],
        default: "full",
        section: "Style",
        order:   9,
      },
      line_thickness: {
        type:    "string",
        label:   "Accent line thickness",
        display: "select",
        values:  [
          { "Thin (1px)":    "1" },
          { "Default (2px)": "2" },
          { "Medium (3px)":  "3" },
          { "Bold (4px)":    "4" },
        ],
        default: "2",
        section: "Style",
        order:   10,
      },
    },

    /* ── Create ── */
    create: function (element, config) {
      const style = document.createElement("style");
      style.textContent = CSS;
      element.appendChild(style);

      element.insertAdjacentHTML("beforeend", `
        <div class="rpc-root" id="rpc-root" data-w="lg" data-h="lg">
          <div class="rpc-topbar">
            <div class="rpc-topbar-left">
              ${LOGO_SVG}
              <span class="rpc-title" id="rpc-title">Chart</span>
            </div>
            <span class="rpc-subtitle" id="rpc-subtitle"></span>
          </div>
          <div class="rpc-gline" id="rpc-gline"></div>
          <div class="rpc-body" id="rpc-body">
            <div class="rpc-empty">Loading…</div>
          </div>
        </div>
        <div class="rpc-tooltip" id="rpc-tooltip">
          <div class="rpc-tt-accent" id="rpc-tt-accent"></div>
          <div class="rpc-tt-body">
            <div class="rpc-tt-header">
              <span class="rpc-tt-dot" id="rpc-tt-dot"></span>
              <span class="rpc-tooltip-label" id="rpc-tt-label"></span>
            </div>
            <div class="rpc-tooltip-value" id="rpc-tt-value"></div>
            <div class="rpc-tooltip-pct"   id="rpc-tt-pct"></div>
          </div>
        </div>
      `);

      /* Tooltip follow-mouse */
      element.addEventListener("mousemove", (e) => {
        const tt = element.querySelector(".rpc-tooltip");
        if (tt) {
          const pad = 14;
          const tw  = tt.offsetWidth  || 140;
          const th  = tt.offsetHeight || 60;
          let tx = e.clientX + pad;
          let ty = e.clientY + pad;
          if (tx + tw > window.innerWidth  - 8) tx = e.clientX - tw - pad;
          if (ty + th > window.innerHeight - 8) ty = e.clientY - th - pad;
          tt.style.left = tx + "px";
          tt.style.top  = ty + "px";
        }
      });

      /* Pin state — persists across re-renders */
      if (this._pinnedIdx === undefined) this._pinnedIdx = null;

      /* ResizeObserver */
      if (typeof ResizeObserver !== "undefined") {
        this._ro = new ResizeObserver(entries => {
          const { width, height } = entries[0].contentRect;
          const root = element.querySelector("#rpc-root");
          if (root) applyBreakpoints(root, width, height);
          /* Re-render on resize (debounced) */
          if (this._resizeTimer) clearTimeout(this._resizeTimer);
          this._resizeTimer = setTimeout(() => {
            if (this._lastRenderArgs) {
              const [d, el, cfg, qr, det, done] = this._lastRenderArgs;
              this.updateAsync(d, el, cfg, qr, det, done);
            }
          }, 120);
        });
        this._ro.observe(element);
      }
    },

    /* ── Update ── */
    updateAsync: function (data, element, config, queryResponse, details, done) {
      /* Cache args for resize re-render */
      this._lastRenderArgs = [data, element, config, queryResponse, details, () => {}];

      const root    = element.querySelector("#rpc-root");
      const body    = element.querySelector("#rpc-body");
      const gline   = element.querySelector("#rpc-gline");
      const tooltip = element.querySelector("#rpc-tooltip");

      if (!root || !body) { done(); return; }

      /* ── Accent line ── */
      const GRAD_MAP = {
        "blue":         T.B,
        "blue-purple":  `linear-gradient(90deg, ${T.B}, #6040EC)`,
        "purple":       T.P,
        "purple-pink":  `linear-gradient(90deg, ${T.P}, #B038C8)`,
        "pink":         T.K,
        "full":         `linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K})`,
      };
      if (gline) {
        const gradKey = config.gradient_stop || "full";
        gline.style.height          = (config.line_thickness || "2") + "px";
        gline.style.backgroundImage = GRAD_MAP[gradKey] || GRAD_MAP.full;
      }

      /* ── Breakpoints ── */
      const tileW = element.offsetWidth  || 400;
      const tileH = element.offsetHeight || 300;
      applyBreakpoints(root, tileW, tileH);

      /* ── Collect fields ── */
      const dims  = queryResponse.fields.dimensions         || [];
      const meas  = queryResponse.fields.measures           || [];
      const calcs = queryResponse.fields.table_calculations || [];
      const allMeasures = [...meas, ...calcs];

      if (!dims.length || !allMeasures.length || !data.length) {
        body.innerHTML = `<div class="rpc-empty">Add one dimension and one measure to display a chart.</div>`;
        done();
        return;
      }

      const dimField  = dims[0];
      const measField = allMeasures[0];
      const measField2 = allMeasures[1] || null;

      /* ── Build raw slices ── */
      let rawSlices = data.map((row, i) => {
        const label = String(cellVal(row[dimField.name]) ?? "—");
        const raw   = row[measField.name]?.value;
        const val   = parseFloat(raw) || 0;
        const rend  = row[measField.name]?.rendered;
        const rend2 = measField2 ? row[measField2.name]?.rendered : null;
        return { label, val, rend, rend2, idx: i };
      }).filter(s => s.val > 0);

      if (!rawSlices.length) {
        body.innerHTML = `<div class="rpc-empty">No positive values to display.</div>`;
        done();
        return;
      }

      /* Sort descending */
      rawSlices.sort((a, b) => b.val - a.val);

      /* Cap to maxSlices if configured; default shows all */
      const maxSlices = Math.max(2, config.max_slices || 500);
      let slices = rawSlices;
      if (rawSlices.length > maxSlices) {
        const top   = rawSlices.slice(0, maxSlices - 1);
        const other = rawSlices.slice(maxSlices - 1);
        const otherVal = other.reduce((sum, s) => sum + s.val, 0);
        top.push({ label: "Other", val: otherVal, rend: fmtNumber(otherVal), rend2: null, idx: -1 });
        slices = top;
      }

      const total = slices.reduce((sum, s) => sum + s.val, 0);

      /* Assign colors */
      slices.forEach((s, i) => { s.color = PALETTE[i % PALETTE.length]; });

      /* Guard: if data changed and pinned index is now out of range, clear it */
      if (this._pinnedIdx !== null && this._pinnedIdx >= slices.length) {
        this._pinnedIdx = null;
      }
      const vis = this; // capture for event listener closures

      /* ── Chart title ── */
      const measLabel = measField.label_short || measField.label || measField.name;
      const dimLabel  = dimField.label_short  || dimField.label  || dimField.name;
      const chartTitle = config.title_override ||
                         (measLabel + " by " + dimLabel);
      element.querySelector("#rpc-title").textContent = chartTitle;

      const subtitle = rawSlices.length + " segments";
      element.querySelector("#rpc-subtitle").textContent = subtitle;

      /* ── Determine layout ── */
      const isDonut = (config.chart_type !== "pie");
      const showLegend = config.show_legend !== false;

      /* Figure out how wide the tile header+body area is */
      const bodyEl    = body;
      const headerH   = element.querySelector(".rpc-topbar")?.offsetHeight || 40;
      const glineH    = 2;
      const availH    = tileH - headerH - glineH - 24; // padding
      const availW    = tileW - 32;

      /* Legend placement */
      let stackLegend = false;
      const legendPos = config.legend_position || "auto";
      if (legendPos === "bottom") {
        stackLegend = true;
      } else if (legendPos === "right") {
        stackLegend = false;
      } else {
        // auto: stack if tile is wider than tall (landscape) and wide enough
        stackLegend = (availH > availW * 0.9 || tileW < 320);
      }

      /* Compute SVG size */
      const legendW       = stackLegend ? 0   : Math.min(180, availW * 0.36);
      const legendH       = stackLegend ? Math.min(80, availH * 0.28) : 0;
      const chartAreaW    = stackLegend ? availW : availW - legendW - 8;
      const chartAreaH    = stackLegend ? availH - legendH - 4 : availH;
      const svgSize       = Math.max(60, Math.min(chartAreaW, chartAreaH, 320));
      const cx            = svgSize / 2;
      const cy            = svgSize / 2;
      const outerR        = svgSize / 2 - 6;
      const holePct       = isDonut ? Math.max(10, Math.min(80, config.inner_radius_pct || 58)) : 0;
      const innerR        = isDonut ? outerR * holePct / 100 : 0;

      /* ── Build SVG slices ── */
      let angle = -Math.PI / 2; // start at top
      const circumference = 2 * Math.PI * ((outerR + innerR) / 2);

      const slicePaths = slices.map((s, i) => {
        const sweep     = (s.val / total) * 2 * Math.PI;
        const startAng  = angle;
        const endAng    = angle + sweep;
        angle           = endAng;

        const path          = arcPath(cx, cy, outerR, innerR, startAng, endAng);
        const dashTotal     = circumference.toFixed(2);
        const dashOffset    = (circumference * (1 - s.val / total)).toFixed(2);
        const delay         = (i * 0.048).toFixed(3);

        return `
          <g class="rpc-slice${s.dimmed ? ' dimmed' : ''}"
             data-idx="${i}"
             style="--rpc-dash-total:${dashTotal}; --rpc-dash-offset:${dashOffset};">
            <path d="${path}"
                  fill="${s.color}"
                  fill-opacity="0.88"
                  stroke="${T.bg}"
                  stroke-width="1.5"
                  style="animation-delay:${delay}s"
            />
          </g>`;
      }).join("");

      /* ── Donut center text ── */
      const showCenter = isDonut && config.show_center_total !== false;
      const centerLabelText = config.center_label_override ||
                              measLabel;

      /* ── Build legend items ── */
      const legendItems = slices.map((s, i) => {
        const pct = ((s.val / total) * 100).toFixed(1) + "%";
        return `
          <div class="rpc-legend-item" data-idx="${i}">
            <span class="rpc-legend-dot" style="background:${s.color}"></span>
            <span class="rpc-legend-name" title="${esc(s.label)}">${esc(s.label)}</span>
            <span class="rpc-legend-pct">${pct}</span>
          </div>`;
      }).join("");

      /* ── Render HTML ── */
      body.className = "rpc-body" + (stackLegend ? " stacked" : "");
      body.innerHTML = `
        <div class="rpc-svg-wrap" style="width:${svgSize}px;height:${svgSize}px;">
          <svg width="${svgSize}" height="${svgSize}"
               viewBox="0 0 ${svgSize} ${svgSize}"
               xmlns="http://www.w3.org/2000/svg"
               id="rpc-svg"
               role="img"
               aria-label="${esc(chartTitle)}">
            <defs>
              <filter id="rpc-glow">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
            </defs>
            ${slicePaths}
          </svg>
          ${showCenter ? `
          <div class="rpc-center-label">
            <span class="rpc-center-value" id="rpc-cv">${fmtNumber(total)}</span>
            <span class="rpc-center-label-text" id="rpc-cl">${esc(centerLabelText)}</span>
          </div>` : ""}
        </div>
        ${showLegend && root.getAttribute("data-w") !== "xs" ? `
        <div class="rpc-legend" id="rpc-legend"
             style="${stackLegend
               ? ""
               : "max-width:" + legendW + "px; max-height:" + availH + "px;"}">
          ${legendItems}
        </div>` : ""}
      `;

      /* ── Wire interactions ── */
      const svgEl = body.querySelector("#rpc-svg");
      if (!svgEl || !tooltip) { done(); return; }

      const ttLabel  = tooltip.querySelector("#rpc-tt-label");
      const ttValue  = tooltip.querySelector("#rpc-tt-value");
      const ttPct    = tooltip.querySelector("#rpc-tt-pct");
      const ttDot    = tooltip.querySelector("#rpc-tt-dot");
      const ttAccent = tooltip.querySelector("#rpc-tt-accent");
      const cvEl     = body.querySelector("#rpc-cv");
      const clEl     = body.querySelector("#rpc-cl");

      /* ── Helper: show tooltip with formatted number + percentage ── */
      function showTooltip(s) {
        const valDisp = fmtNumber(s.val);   // always K / M / B notation
        const pct     = ((s.val / total) * 100).toFixed(1) + "%";
        if (ttDot)    ttDot.style.background    = s.color;
        if (ttAccent) ttAccent.style.background = s.color;
        if (ttLabel)  ttLabel.textContent = s.label;
        if (ttValue)  ttValue.textContent = valDisp;
        if (ttPct)    ttPct.textContent   = valDisp + "  ·  " + pct + " of total";
        tooltip.classList.add("visible");
        return valDisp;
      }

      function hideTooltip() {
        tooltip.classList.remove("visible");
      }

      /* ── Helper: apply or clear the pinned-selection state ── */
      function applyPinState() {
        const pi = vis._pinnedIdx;
        const allSlices      = svgEl.querySelectorAll(".rpc-slice");
        const allLegendItems = body.querySelectorAll(".rpc-legend-item");

        if (pi !== null && slices[pi]) {
          const ps      = slices[pi];
          const valDisp = fmtNumber(ps.val);   // always K / M / B notation
          allSlices.forEach(g => {
            const gi = parseInt(g.dataset.idx, 10);
            g.classList.toggle("dimmed", gi !== pi);
            g.classList.toggle("pinned", gi === pi);
          });
          allLegendItems.forEach(l => {
            const li = parseInt(l.dataset.idx, 10);
            l.classList.toggle("dimmed", li !== pi);
            l.classList.toggle("pinned", li === pi);
          });
          if (cvEl) cvEl.textContent = valDisp;
          if (clEl) clEl.textContent = ps.label;
        } else {
          allSlices.forEach(g => { g.classList.remove("dimmed"); g.classList.remove("pinned"); });
          allLegendItems.forEach(l => { l.classList.remove("dimmed"); l.classList.remove("pinned"); });
          if (cvEl) cvEl.textContent = fmtNumber(total);
          if (clEl) clEl.textContent = centerLabelText;
        }
      }

      /* ── Shared activate / deactivate logic used by both slice and legend ── */
      function activateHover(idx, s) {
        svgEl.querySelectorAll(".rpc-slice").forEach(g => {
          const gi = parseInt(g.dataset.idx, 10);
          g.classList.toggle("dimmed", gi !== idx);
          g.classList.remove("pinned");
        });
        body.querySelectorAll(".rpc-legend-item").forEach(l => {
          l.classList.toggle("dimmed", parseInt(l.dataset.idx, 10) !== idx);
          l.classList.remove("pinned");
        });
        const valDisp = showTooltip(s);
        if (cvEl) cvEl.textContent = valDisp;
        if (clEl) clEl.textContent = s.label;
      }

      function deactivateHover() {
        applyPinState();
        hideTooltip();
      }

      function togglePin(idx) {
        vis._pinnedIdx = (vis._pinnedIdx === idx) ? null : idx;
        applyPinState();
      }

      /* ── Slice events ── */
      svgEl.querySelectorAll(".rpc-slice").forEach(g => {
        const idx = parseInt(g.dataset.idx, 10);
        const s   = slices[idx];
        if (!s) return;

        g.addEventListener("mouseenter", () => activateHover(idx, s));
        g.addEventListener("mouseleave", () => deactivateHover());
        g.addEventListener("click", (e) => {
          e.stopPropagation();
          togglePin(idx);
        });
      });

      /* ── Legend events ── */
      body.querySelectorAll(".rpc-legend-item").forEach(li => {
        const idx = parseInt(li.dataset.idx, 10);
        const s   = slices[idx];
        if (!s) return;

        li.addEventListener("mouseenter", () => activateHover(idx, s));
        li.addEventListener("mouseleave", () => deactivateHover());
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          togglePin(idx);
        });
      });

      /* Click on empty chart area clears pin */
      svgEl.addEventListener("click", () => {
        if (vis._pinnedIdx !== null) {
          vis._pinnedIdx = null;
          applyPinState();
        }
      });

      /* Restore pin state after any re-render */
      applyPinState();

      done();
    },
  });
})();