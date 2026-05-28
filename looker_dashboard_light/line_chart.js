/**
 * Rocket Software — Line Chart
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add the URL.
 *   3. Select "Rocket — Line Chart (Light)" from the visualization picker.
 *
 * Supports:
 *   - One dimension + one measure              → single-series line
 *   - One dimension + multiple measures        → each measure = one line
 *   - One dimension + one measure + pivot      → each pivot value = one line
 *   - Straight or smooth (cubic-bezier) lines
 *   - Value labels on every point
 *   - Hover highlights and tooltip
 *   - Click-to-pin selection
 *   - Fully responsive via ResizeObserver
 *
 * Version: 1.0.0  |  May 2025
 */

(function () {
  "use strict";

  /* ─── Brand tokens ────────────────────────────────────────────────────── */
  const T = {
    bg:   "#FFFFFF",
    surf: "#F8F8FA",
    bo:   "#E5E5EA",
    bo2:  "#EBEBF0",
    tx:   "#1C1C1E",
    mt:   "#8E8E93",
    dm:   "#F2F2F7",
    B: "#5040F5",
    P: "#7C39D0",
    K: "#C038B5",
    ok:   "#2DD4A0",
    wn:   "#F0A830",
    er:   "#F06060",
  };

  /* ─── Color palette ───────────────────────────────────────────────────── */
    const PALETTE = [
  "#5040F5",
  "#593FEE",
  "#613DE6",
  "#6A3CDF",
  "#733AD7",
  "#7C39D0",
  "#8638CA",
  "#9138C6",
  "#9D38C2",
  "#A938BD",
  "#B438B9",
  "#C038B5",
];

  /* ─── CSS ─────────────────────────────────────────────────────────────── */
  const CSS = `
    .rlc-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      background: ${T.bg};
      overflow: hidden;
      box-sizing: border-box;
      position: relative;
    }

    .rlc-topbar {
      background: ${T.surf};
      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo};
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      flex-shrink: 0;
    }
    .rlc-topbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .rlc-logo  { width: 20px; height: 20px; flex-shrink: 0; opacity: .85; }
    .rlc-title {
      font-size: 15px; font-weight: 500; color: ${T.tx};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rlc-subtitle { font-size: 13px; color: ${T.mt}; white-space: nowrap; flex-shrink: 0; }

    .rlc-gline {
      height: 2px;
      background: linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K});
      background-size: 200% 100%;
      flex-shrink: 0;
      animation: rlc-grad-flow 5s ease-in-out infinite alternate;
    }
    @keyframes rlc-grad-flow {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }

    .rlc-body {
      flex: 1; display: flex; flex-direction: column;
      min-height: 0; overflow: hidden;
      padding: 10px 14px 10px;
      box-sizing: border-box;
      gap: 6px;
    }

    /* ── Legend ── */
    .rlc-legend {
      display: flex; flex-wrap: wrap;
      gap: 4px 12px;
      flex-shrink: 0;
    }
    .rlc-leg-item {
      display: flex; align-items: center; gap: 6px;
      cursor: pointer;
      padding: 2px 6px 2px 0;
      border-radius: 4px;
      transition: background .12s;
    }
    .rlc-leg-item:hover  { background: rgba(0,0,0,0.05); }
    .rlc-leg-item.dimmed { opacity: .3; }
    .rlc-leg-item.pinned { background: rgba(0,0,0,0.06) !important; }
    .rlc-leg-item.pinned .rlc-leg-name { color: ${T.tx}; font-weight: 600; }
    .rlc-leg-swatch {
      width: 18px; height: 3px;
      border-radius: 2px; flex-shrink: 0;
    }
    .rlc-leg-name { font-size: 13px; color: ${T.mt}; white-space: nowrap; }

    /* ── Chart area ── */
    .rlc-chart-wrap {
      flex: 1; min-height: 0;
      position: relative;
      overflow: hidden;
    }
    .rlc-chart-wrap svg { display: block; overflow: visible; }

    /* ── Axes ── */
    .rlc-axis-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      fill: ${T.mt};
    }
    .rlc-gridline  { stroke: rgba(0,0,0,0.07); stroke-width: 1; }
    .rlc-axis-line { stroke: #DDDDE5; stroke-width: 1; }
    .rlc-zeroline  { stroke: #DDDDE5; stroke-width: 1; stroke-dasharray: 3 3; }

    /* ── Lines ── */
    .rlc-line {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: opacity .16s;
    }
    .rlc-line.dimmed { opacity: .12; }

    /* ── Area fill under line ── */
    .rlc-area {
      transition: opacity .16s;
    }
    .rlc-area.dimmed { opacity: .04; }

    /* ── Data points ── */
    .rlc-point {
      cursor: pointer;
      transition: r .14s, opacity .16s;
    }
    .rlc-point:hover { filter: brightness(1.2); }
    .rlc-point.dimmed { opacity: .12; }
    .rlc-point.pinned { filter: brightness(1.3) drop-shadow(0 0 5px rgba(0,0,0,.18)); }

    /* ── Value labels ── */
    .rlc-val-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      fill: ${T.tx};
      text-anchor: middle;
      pointer-events: none;
      font-weight: 500;
    }

    /* ── Tooltip ── */
    .rlc-tooltip {
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
      min-width: 148px; max-width: 240px;
    }
    .rlc-tooltip.visible { opacity: 1; transform: translateY(0) scale(1); }
    .rlc-tt-accent { height: 3px; }
    .rlc-tt-body   { padding: 10px 14px 13px; }
    .rlc-tt-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
    .rlc-tt-dot    { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .rlc-tt-group  { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.1px; color: #6B6B7B; }
    .rlc-tt-label  { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.1px; color: #6B6B7B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rlc-tt-value  { font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; color: ${T.tx}; letter-spacing: -0.5px; line-height: 1; margin-bottom: 3px; }
    .rlc-tt-delta  { font-size: 13px; color: ${T.mt}; letter-spacing: .2px; }

    /* ── Empty ── */
    .rlc-empty { color: ${T.mt}; font-size: 14px; text-align: center; padding: 20px; width: 100%; }

    /* ── Entrance animation ── */
    @keyframes rlc-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .rlc-line  { animation: rlc-fade-in .5s ease both; }
    .rlc-area  { animation: rlc-fade-in .5s ease both; }
    .rlc-point { animation: rlc-fade-in .4s ease both; }

    /* ── Responsive ── */
    .rlc-root[data-w="xs"] .rlc-topbar   { padding: 7px 10px; }
    .rlc-root[data-w="xs"] .rlc-title    { font-size: 13px; }
    .rlc-root[data-w="xs"] .rlc-subtitle { display: none; }
    .rlc-root[data-w="xs"] .rlc-body     { padding: 5px 7px; }
    .rlc-root[data-w="xs"] .rlc-legend   { display: none; }
    .rlc-root[data-w="sm"] .rlc-subtitle { display: none; }
    .rlc-root[data-h="xs"] .rlc-topbar   { display: none; }
    .rlc-root[data-h="xs"] .rlc-gline    { display: none; }
    .rlc-root[data-h="xs"] .rlc-legend   { display: none; }
    .rlc-root[data-h="xs"] .rlc-body     { padding: 3px 6px; }
    .rlc-root[data-h="sm"] .rlc-topbar   { padding: 6px 12px; }
    .rlc-root[data-h="sm"] .rlc-body     { padding: 5px 10px 4px; }
  `;

  /* ─── Logo ────────────────────────────────────────────────────────────── */
  const LOGO_SVG = `
    <svg class="rlc-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rlc-lg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${T.B}"/>
          <stop offset="50%"  stop-color="${T.P}"/>
          <stop offset="100%" stop-color="${T.K}"/>
        </linearGradient>
      </defs>
      <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
            stroke="url(#rlc-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6 L19 6 L19 11"
            stroke="url(#rlc-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  /* ─── Helpers ─────────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function cellVal(cell) {
    if (cell == null) return null;
    return cell.value;
  }

  function fmtNumber(v) {
    if (v == null || v === "") return "—";
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
    if (isNaN(n)) return String(v);
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    if (Number.isInteger(n)) return n.toLocaleString();
    return n.toFixed(2);
  }

  function fmtAxis(v) {
    if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(0) + "B";
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(0) + "M";
    if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(0) + "K";
    return v % 1 === 0 ? v.toString() : v.toFixed(1);
  }

  function niceMax(rawMax) {
    if (rawMax <= 0) return 1;
    const mag = Math.pow(10, Math.floor(Math.log10(rawMax)));
    const norm = rawMax / mag;
    const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
    return nice * mag;
  }

  function applyBreakpoints(root, w, h) {
    root.setAttribute("data-w", w < 240 ? "xs" : w < 380 ? "sm" : w < 560 ? "md" : "lg");
    root.setAttribute("data-h", h < 100 ? "xs" : h < 180 ? "sm" : "lg");
  }

  /** Build SVG path string for a polyline through points [{x,y},...].
   *  smooth=true uses cubic-bezier tangents for a gentle curve. */
  function buildLinePath(pts, smooth) {
    if (pts.length === 0) return "";
    if (!smooth || pts.length < 3) {
      return "M " + pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
    }
    // Catmull-Rom → cubic bezier conversion
    let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const tension = 0.35;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  }

  /** Closed area path: line from first to last, then close along baseline. */
  function buildAreaPath(pts, baseY, smooth) {
    if (pts.length === 0) return "";
    const linePart = buildLinePath(pts, smooth);
    return `${linePart} L ${pts[pts.length - 1].x.toFixed(1)},${baseY.toFixed(1)} L ${pts[0].x.toFixed(1)},${baseY.toFixed(1)} Z`;
  }

  function hexAlpha(hex, a) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ─── Viz definition ──────────────────────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_line_chart_light",
    label: "Rocket — Line Chart (Light)",

    options: {
      title_override: {
        type: "string", label: "Chart title override", default: "",
        placeholder: "Leave blank to derive from fields",
        section: "Style", order: 1,
      },
      smooth_lines: {
        type: "boolean", label: "Smooth curves", default: false,
        section: "Style", order: 2,
      },
      show_area: {
        type: "boolean", label: "Show area fill", default: false,
        section: "Style", order: 3,
      },
      show_values: {
        type: "boolean", label: "Show value labels", default: true,
        section: "Style", order: 4,
      },
      point_radius: {
        type: "string", label: "Point size", display: "select",
        values: [
          { "Small (3px)": "3" }, { "Default (5px)": "5" },
          { "Large (7px)": "7" }, { "None": "0" },
        ],
        default: "5", section: "Style", order: 5,
      },
      line_width: {
        type: "string", label: "Line width", display: "select",
        values: [
          { "Thin (1.5px)": "1.5" }, { "Default (2px)": "2" },
          { "Medium (2.5px)": "2.5" }, { "Bold (3px)": "3" },
        ],
        default: "2", section: "Style", order: 6,
      },
      show_legend: {
        type: "boolean", label: "Show legend", default: true,
        section: "Legend", order: 7,
      },
      y_axis_label: {
        type: "string", label: "Y-axis label override", default: "",
        placeholder: "Leave blank to use measure label",
        section: "Style", order: 8,
      },
    },

    /* ── Create ── */
    create: function (element) {
      const style = document.createElement("style");
      style.textContent = CSS;
      element.appendChild(style);

      element.insertAdjacentHTML("beforeend", `
        <div class="rlc-root" id="rlc-root" data-w="lg" data-h="lg">
          <div class="rlc-topbar">
            <div class="rlc-topbar-left">
              ${LOGO_SVG}
              <span class="rlc-title" id="rlc-title">Line Chart</span>
            </div>
            <span class="rlc-subtitle" id="rlc-subtitle"></span>
          </div>
          <div class="rlc-gline" id="rlc-gline"></div>
          <div class="rlc-body" id="rlc-body">
            <div class="rlc-empty">Loading…</div>
          </div>
        </div>
        <div class="rlc-tooltip" id="rlc-tooltip">
          <div class="rlc-tt-accent" id="rlc-tt-accent"></div>
          <div class="rlc-tt-body">
            <div class="rlc-tt-header">
              <span class="rlc-tt-dot"   id="rlc-tt-dot"></span>
              <div>
                <div class="rlc-tt-group" id="rlc-tt-group"></div>
                <div class="rlc-tt-label" id="rlc-tt-label"></div>
              </div>
            </div>
            <div class="rlc-tt-value" id="rlc-tt-value"></div>
            <div class="rlc-tt-delta" id="rlc-tt-delta"></div>
          </div>
        </div>
      `);

      /* Tooltip follow-mouse */
      element.addEventListener("mousemove", (e) => {
        const tt = element.querySelector(".rlc-tooltip");
        if (!tt) return;
        const pad = 14, tw = tt.offsetWidth || 148, th = tt.offsetHeight || 60;
        let tx = e.clientX + pad, ty = e.clientY + pad;
        if (tx + tw > window.innerWidth  - 8) tx = e.clientX - tw - pad;
        if (ty + th > window.innerHeight - 8) ty = e.clientY - th - pad;
        tt.style.left = tx + "px";
        tt.style.top  = ty + "px";
      });

      if (this._pinnedKey === undefined) this._pinnedKey = null;

      /* ResizeObserver */
      if (typeof ResizeObserver !== "undefined") {
        this._ro = new ResizeObserver(entries => {
          const { width, height } = entries[0].contentRect;
          const root = element.querySelector("#rlc-root");
          if (root) applyBreakpoints(root, width, height);
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
      this._lastRenderArgs = [data, element, config, queryResponse, details, () => {}];

      const root    = element.querySelector("#rlc-root");
      const body    = element.querySelector("#rlc-body");
      const tooltip = element.querySelector("#rlc-tooltip");
      if (!root || !body) { done(); return; }

      const tileW = element.offsetWidth  || 500;
      const tileH = element.offsetHeight || 320;
      applyBreakpoints(root, tileW, tileH);

      /* ── Collect fields ── */
      const dims   = queryResponse.fields.dimensions         || [];
      const meas   = queryResponse.fields.measures           || [];
      const calcs  = queryResponse.fields.table_calculations || [];
      const pivots = queryResponse.pivots                    || [];
      const allMeasures = [...meas, ...calcs];

      if (!dims.length || !allMeasures.length || !data.length) {
        body.innerHTML = `<div class="rlc-empty">Add one dimension and one measure to display a chart.</div>`;
        done(); return;
      }

      const dimField  = dims[0];
      const measField = allMeasures[0];

      /* ── Build series ── */
      let series = []; // [{key, label, color, values:[number]}]
      const groups = data.map(row => String(cellVal(row[dimField.name]) ?? "—"));

      if (pivots.length > 0) {
        pivots.forEach((p, si) => {
          const pivotLabel = p.data
            ? String(Object.values(p.data)[0] ?? p.key)
            : p.key;
          const values = data.map(row => {
            const cell = row[measField.name]?.[p.key];
            return parseFloat(cell?.value) || 0;
          });
          series.push({ key: p.key, label: pivotLabel, color: PALETTE[si % PALETTE.length], values });
        });
      } else if (allMeasures.length > 1) {
        allMeasures.forEach((mf, si) => {
          const label  = mf.label_short || mf.label || mf.name;
          const values = data.map(row => parseFloat(row[mf.name]?.value) || 0);
          series.push({ key: mf.name, label, color: PALETTE[si % PALETTE.length], values });
        });
      } else {
        const values = data.map(row => parseFloat(row[measField.name]?.value) || 0);
        series.push({
          key:    measField.name,
          label:  measField.label_short || measField.label || measField.name,
          color:  PALETTE[0],
          values,
        });
      }

      /* ── Chart title & subtitle ── */
      const measLabel  = measField.label_short || measField.label || measField.name;
      const dimLabel   = dimField.label_short  || dimField.label  || dimField.name;
      const chartTitle = config.title_override || (measLabel + " by " + dimLabel);
      element.querySelector("#rlc-title").textContent    = chartTitle;
      element.querySelector("#rlc-subtitle").textContent =
        groups.length + " points · " + series.length + " " + (series.length === 1 ? "series" : "series");

      /* ── Config options ── */
      const smooth      = config.smooth_lines === true;
      const showArea    = config.show_area    === true;
      const showValues  = config.show_values !== false;
      const ptRadius    = parseFloat(config.point_radius ?? "5") || 0;
      const lineW       = parseFloat(config.line_width   ?? "2") || 2;
      const showLegend  = config.show_legend !== false;
      const vis         = this;

      /* ── Layout math ── */
      const headerH = element.querySelector(".rlc-topbar")?.offsetHeight || 40;
      const glineH  = 2;
      const legendH = (showLegend && series.length > 1) ? 24 : 0;
      const availH  = tileH - headerH - glineH - 20 - legendH;
      const availW  = tileW - 28;

      /* Extra top margin for value labels above first points */
      const valueLabelH = showValues ? 18 : 0;
      const ML = 50, MR = 16, MT = valueLabelH + 8, MB = 36;
      const chartW = Math.max(40, availW - ML - MR);
      const chartH = Math.max(20, availH - MT - MB);
      const svgW   = availW;
      const svgH   = availH;

      /* ── Y scale ── */
      let rawMax = -Infinity, rawMin = Infinity;
      series.forEach(se => se.values.forEach(v => {
        rawMax = Math.max(rawMax, v);
        rawMin = Math.min(rawMin, v);
      }));
      if (!isFinite(rawMax)) rawMax = 1;
      if (!isFinite(rawMin)) rawMin = 0;

      // Always include 0 in y range for clean baseline
      rawMin = Math.min(rawMin, 0);

      const yMax   = niceMax(rawMax * 1.08 || 1);
      const yMin   = rawMin < 0 ? -niceMax(Math.abs(rawMin) * 1.08) : 0;
      const yRange = yMax - yMin || 1;
      const yScale = v => chartH * (1 - (v - yMin) / yRange);
      const zeroY  = MT + yScale(0);
      const hasNeg = rawMin < 0;

      /* ── X scale ── */
      const n = groups.length;
      // Space points evenly across chart width
      const xScale = gi => n <= 1 ? ML + chartW / 2 : ML + (gi / (n - 1)) * chartW;

      /* ── Grid & axes ── */
      const tickCount = Math.min(6, Math.max(2, Math.floor(chartH / 35)));
      let gridLines = "";
      for (let ti = 0; ti <= tickCount; ti++) {
        const v  = yMin + (yMax - yMin) * (ti / tickCount);
        const y  = MT + yScale(v);
        const vr = Math.round(v * 1e9) / 1e9;
        gridLines += `
          <line class="rlc-gridline" x1="${ML}" y1="${y.toFixed(1)}" x2="${ML + chartW}" y2="${y.toFixed(1)}"/>
          <text class="rlc-axis-label" x="${ML - 7}" y="${y.toFixed(1)}" text-anchor="end" dominant-baseline="middle">${fmtAxis(vr)}</text>`;
      }
      if (hasNeg) {
        gridLines += `<line class="rlc-zeroline" x1="${ML}" y1="${zeroY.toFixed(1)}" x2="${ML + chartW}" y2="${zeroY.toFixed(1)}"/>`;
      }

      /* X-axis labels — wrap long labels across two lines if needed */
      let xLabels = "";
      const maxLabelW = Math.max(20, n > 1 ? (chartW / (n - 1)) - 4 : chartW);
      groups.forEach((g, gi) => {
        const cx  = xScale(gi);
        const y   = MT + chartH + 16;
        // Break on hyphen or slash for compact period labels like "2025-Q2"
        const parts = g.split(/(?<=[\/\-])/).map(p => p.trim()).filter(Boolean);
        if (parts.length > 1 && (g.length * 7) > maxLabelW) {
          xLabels += `
            <text class="rlc-axis-label" x="${cx.toFixed(1)}" y="${y}" text-anchor="middle">
              <tspan x="${cx.toFixed(1)}" dy="0">${esc(parts[0])}</tspan>
              <tspan x="${cx.toFixed(1)}" dy="14">${esc(parts[1])}</tspan>
            </text>`;
        } else {
          const trunc = g.length > Math.floor(maxLabelW / 6.5)
            ? g.slice(0, Math.floor(maxLabelW / 6.5) - 1) + "…"
            : g;
          xLabels += `<text class="rlc-axis-label" x="${cx.toFixed(1)}" y="${y}" text-anchor="middle">${esc(trunc)}</text>`;
        }
      });

      /* Axis lines */
      const axisLines = `
        <line class="rlc-axis-line" x1="${ML}" y1="${MT}" x2="${ML}" y2="${MT + chartH}"/>
        <line class="rlc-axis-line" x1="${ML}" y1="${MT + chartH}" x2="${ML + chartW}" y2="${MT + chartH}"/>`;

      /* Y-axis title */
      const yAxisTitle = config.y_axis_label || measLabel;
      const yAxisLabelEl = yAxisTitle
        ? `<text class="rlc-axis-label"
                 x="${-(MT + chartH / 2)}" y="11"
                 text-anchor="middle"
                 transform="rotate(-90)"
                 style="font-size:12px">${esc(yAxisTitle)}</text>`
        : "";

      /* ── Build per-series SVG elements ── */
      let areaEls = "", lineEls = "", pointEls = "", labelEls = "";

      series.forEach((se, si) => {
        const pts = se.values.map((v, gi) => ({
          x: xScale(gi),
          y: MT + yScale(v),
          v,
          gi,
        }));

        const delay = (si * 0.08).toFixed(2);

        /* Area fill */
        if (showArea) {
          const areaPath = buildAreaPath(pts, zeroY, smooth);
          areaEls += `<path class="rlc-area" data-si="${si}"
            d="${areaPath}"
            fill="${hexAlpha(se.color, 0.10)}"
            style="animation-delay:${delay}s"/>`;
        }

        /* Line */
        const linePath = buildLinePath(pts, smooth);
        lineEls += `<path class="rlc-line" data-si="${si}"
          d="${linePath}"
          stroke="${se.color}"
          stroke-width="${lineW}"
          style="animation-delay:${delay}s"/>`;

        /* Points + value labels */
        pts.forEach((pt, gi) => {
          const ptDelay = (si * 0.08 + gi * 0.03).toFixed(2);

          if (ptRadius > 0) {
            pointEls += `
              <circle class="rlc-point" data-si="${si}" data-gi="${gi}"
                cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${ptRadius}"
                fill="${se.color}" stroke="${T.bg}" stroke-width="2"
                style="animation-delay:${ptDelay}s"/>`;
          }

          if (showValues) {
            // Decide label offset: above the point (or below if near top)
            const labelY = pt.y - ptRadius - 5;
            labelEls += `
              <text class="rlc-val-label" data-si="${si}" data-gi="${gi}"
                x="${pt.x.toFixed(1)}" y="${labelY.toFixed(1)}"
                dominant-baseline="auto"
                style="animation-delay:${ptDelay}s">${fmtNumber(pt.v)}</text>`;
          }
        });
      });

      /* Legend HTML */
      const legendHTML = (showLegend && series.length > 1)
        ? `<div class="rlc-legend" id="rlc-legend">
             ${series.map((se, si) => `
               <div class="rlc-leg-item" data-si="${si}">
                 <span class="rlc-leg-swatch" style="background:${se.color}"></span>
                 <span class="rlc-leg-name">${esc(se.label)}</span>
               </div>`).join("")}
           </div>`
        : "";

      /* ── Render ── */
      body.innerHTML = `
        ${legendHTML}
        <div class="rlc-chart-wrap" id="rlc-chart-wrap">
          <svg id="rlc-svg"
               width="${svgW}" height="${svgH}"
               viewBox="0 0 ${svgW} ${svgH}"
               xmlns="http://www.w3.org/2000/svg"
               role="img"
               aria-label="${esc(chartTitle)}">
            ${gridLines}
            ${areaEls}
            ${lineEls}
            ${labelEls}
            ${pointEls}
            ${axisLines}
            ${xLabels}
            ${yAxisLabelEl}
          </svg>
        </div>
      `;

      /* ── Interactions ── */
      const svgEl   = body.querySelector("#rlc-svg");
      const ttDot   = tooltip?.querySelector("#rlc-tt-dot");
      const ttAccent= tooltip?.querySelector("#rlc-tt-accent");
      const ttGroup = tooltip?.querySelector("#rlc-tt-group");
      const ttLabel = tooltip?.querySelector("#rlc-tt-label");
      const ttValue = tooltip?.querySelector("#rlc-tt-value");
      const ttDelta = tooltip?.querySelector("#rlc-tt-delta");

      function showTooltip(si, gi) {
        const se   = series[si];
        const val  = se.values[gi];
        const grp  = groups[gi];
        // Delta from previous point in same series
        let delta  = "";
        if (gi > 0) {
          const prev = se.values[gi - 1];
          const diff = val - prev;
          const sign = diff >= 0 ? "▲" : "▼";
          delta = `${sign} ${fmtNumber(Math.abs(diff))} vs prev`;
        }
        if (ttDot)    ttDot.style.background    = se.color;
        if (ttAccent) ttAccent.style.background  = se.color;
        if (ttGroup)  ttGroup.textContent = grp;
        if (ttLabel)  ttLabel.textContent = se.label;
        if (ttValue)  ttValue.textContent = fmtNumber(val);
        if (ttDelta)  ttDelta.textContent = delta;
        tooltip.classList.add("visible");
      }

      function hideTooltip() { tooltip?.classList.remove("visible"); }

      function applyPinState() {
        const pk = vis._pinnedKey;
        svgEl?.querySelectorAll(".rlc-point").forEach(c => {
          const key = `${c.dataset.si}-${c.dataset.gi}`;
          c.classList.toggle("dimmed",  pk !== null && key !== pk);
          c.classList.toggle("pinned",  pk !== null && key === pk);
        });
        svgEl?.querySelectorAll(".rlc-line, .rlc-area").forEach(el => {
          const si = el.dataset.si;
          const pk_si = pk ? pk.split("-")[0] : null;
          el.classList.toggle("dimmed", pk !== null && si !== pk_si);
        });
        body.querySelectorAll(".rlc-leg-item").forEach(li => {
          const si = li.dataset.si;
          const pk_si = pk ? pk.split("-")[0] : null;
          li.classList.toggle("dimmed", pk !== null && si !== pk_si);
          li.classList.toggle("pinned", pk !== null && si === pk_si);
        });
      }

      svgEl?.querySelectorAll(".rlc-point").forEach(c => {
        const si  = parseInt(c.dataset.si, 10);
        const gi  = parseInt(c.dataset.gi, 10);
        const key = `${si}-${gi}`;
        c.addEventListener("mouseenter", () => {
          if (vis._pinnedKey === null) { c.setAttribute("r", ptRadius + 2); showTooltip(si, gi); }
        });
        c.addEventListener("mouseleave", () => {
          if (vis._pinnedKey === null) { c.setAttribute("r", ptRadius); hideTooltip(); }
        });
        c.addEventListener("click", (e) => {
          e.stopPropagation();
          vis._pinnedKey = (vis._pinnedKey === key) ? null : key;
          applyPinState();
          if (vis._pinnedKey === key) showTooltip(si, gi);
          else hideTooltip();
        });
      });

      /* Legend series toggle */
      body.querySelectorAll(".rlc-leg-item").forEach(li => {
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          const si = li.dataset.si;
          const already = vis._pinnedKey?.startsWith(si + "-") || vis._pinnedKey === `_s${si}`;
          vis._pinnedKey = already ? null : `_s${si}`;
          svgEl?.querySelectorAll(".rlc-line, .rlc-area").forEach(el => {
            el.classList.toggle("dimmed", vis._pinnedKey !== null && el.dataset.si !== si);
          });
          svgEl?.querySelectorAll(".rlc-point").forEach(c => {
            c.classList.toggle("dimmed", vis._pinnedKey !== null && c.dataset.si !== si);
          });
          body.querySelectorAll(".rlc-leg-item").forEach(l => {
            l.classList.toggle("dimmed", vis._pinnedKey !== null && l.dataset.si !== si);
            l.classList.toggle("pinned", vis._pinnedKey !== null && l.dataset.si === si);
          });
          if (vis._pinnedKey !== null) hideTooltip();
        });
      });

      svgEl?.addEventListener("click", () => {
        if (vis._pinnedKey !== null) {
          vis._pinnedKey = null;
          applyPinState();
          hideTooltip();
        }
      });

      applyPinState();
      done();
    },

    destroy: function () {
      if (this._ro) this._ro.disconnect();
      clearTimeout(this._resizeTimer);
    },
  });
})();
