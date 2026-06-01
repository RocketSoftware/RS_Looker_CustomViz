/**
 * Rocket Software — Grouped / Stacked Bar Chart
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add the URL.
 *   3. Select "Rocket — Bar Chart (Light)" from the visualization picker.
 *
 * Supports:
 *   - One dimension + one measure              → single-series bar chart
 *   - One dimension + multiple measures        → each measure = one series
 *   - One dimension + one measure + pivot      → each pivot value = one series
 *   - Grouped or stacked layout
 *   - Fully responsive with animated entrance
 *   - Hover highlights and tooltip
 *   - Click-to-pin selection
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
    P: "#8638CA",
    K: "#C038B5",
    ok:   "#2DD4A0",
    wn:   "#F0A830",
    er:   "#F06060",
  };

  /* ─── Color palette — blue → purple → pink brand family ─────────────── */
    const PALETTE = [
  "#5040F5",
  "#8638CA",
  "#593FEE",
  "#9138C6",
  "#613DE6",
  "#9D38C2",
  "#6A3CDF",
  "#A938BD",
  "#733AD7",
  "#B438B9",
  "#7C39D0",
  "#C038B5",
];

  /* ─── CSS ─────────────────────────────────────────────────────────────── */
  const CSS = `
    .rbc-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      background: ${T.bg};
      overflow: hidden;
      box-sizing: border-box;
      position: relative;
    }

    .rbc-topbar {
      background: ${T.surf};
      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo};
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      flex-shrink: 0;
    }
    .rbc-topbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .rbc-logo        { width: 20px; height: 20px; flex-shrink: 0; opacity: .85; }
    .rbc-title {
      font-size: 15px; font-weight: 500; color: ${T.tx};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rbc-subtitle { font-size: 13px; color: ${T.mt}; white-space: nowrap; flex-shrink: 0; }

    .rbc-gline {
      height: 2px;
      background: linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K});
      background-size: 200% 100%;
      flex-shrink: 0;
      animation: rbc-grad-flow 5s ease-in-out infinite alternate;
    }
    @keyframes rbc-grad-flow {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }

    .rbc-body {
      flex: 1; display: flex; flex-direction: column;
      min-height: 0; overflow: hidden;
      padding: 10px 14px 10px;
      box-sizing: border-box;
      gap: 6px;
    }

    /* ── Legend ── */
    .rbc-legend {
      display: flex; flex-wrap: wrap;
      gap: 4px 12px;
      flex-shrink: 0;
    }
    .rbc-leg-item {
      display: flex; align-items: center; gap: 6px;
      cursor: pointer;
      padding: 2px 6px 2px 0;
      border-radius: 4px;
      transition: background .12s;
    }
    .rbc-leg-item:hover  { background: rgba(0,0,0,0.05); }
    .rbc-leg-item.dimmed { opacity: .3; }
    .rbc-leg-item.pinned { background: rgba(0,0,0,0.06) !important; }
    .rbc-leg-item.pinned .rbc-leg-name { color: ${T.tx}; font-weight: 600; }
    .rbc-leg-dot  { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
    .rbc-leg-name { font-size: 13px; color: #8E8E93; white-space: nowrap; }

    /* ── Chart area ── */
    .rbc-chart-wrap {
      flex: 1; min-height: 0;
      position: relative;
      overflow: hidden;
    }
    .rbc-chart-wrap svg { display: block; overflow: visible; }

    /* ── Axes ── */
    .rbc-axis-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      fill: ${T.mt};
    }
    .rbc-gridline { stroke: rgba(0,0,0,0.06); stroke-width: 1; }
    .rbc-axis-line { stroke: #DDDDE5; stroke-width: 1; }

    /* ── Bars ── */
    .rbc-bar {
      cursor: pointer;
      transition: filter .15s, opacity .15s;
    }
    .rbc-bar:hover { filter: brightness(1.2) drop-shadow(0 0 4px rgba(255,255,255,.12)); }
    .rbc-bar.dimmed { opacity: .22; }
    .rbc-bar.pinned { filter: brightness(1.25) drop-shadow(0 0 7px rgba(255,255,255,.2)); }

    /* ── Bar entrance animation ── */
    @keyframes rbc-grow {
      from { transform: scaleY(0); }
      to   { transform: scaleY(1); }
    }
    .rbc-bar rect {
      transform-origin: bottom;
      animation: rbc-grow .45s cubic-bezier(.4,0,.2,1) both;
    }
    /* Negative bars grow downward — origin flips to top */
    .rbc-bar.negative rect {
      transform-origin: top;
    }

    /* ── Zero baseline (shown when chart spans negative values) ── */
    .rbc-zeroline { stroke: #DDDDE5; stroke-width: 1; }

    /* ── Value labels on bars ── */
    .rbc-val-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      fill: #8E8E93;
      text-anchor: middle;
      pointer-events: none;
    }
    /* White label centered inside each stacked segment */
    .rbc-seg-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 500;
      fill: rgba(255,255,255,0.92);
      text-anchor: middle;
      dominant-baseline: middle;
      pointer-events: none;
    }
    /* Grand total above the whole stacked bar */
    .rbc-total-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 600;
      fill: ${T.tx};
      text-anchor: middle;
      pointer-events: none;
    }

    /* ── Tooltip ── */
    .rbc-tooltip {
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
    .rbc-tooltip.visible { opacity: 1; transform: translateY(0) scale(1); }
    .rbc-tt-accent { height: 3px; background: ${T.P}; }
    .rbc-tt-body   { padding: 10px 14px 13px; }
    .rbc-tt-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
    .rbc-tt-dot    { width: 8px; height: 8px; border-radius: 2px; background: ${T.P}; flex-shrink: 0; }
    .rbc-tt-group  { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.1px; color: #6B6B7B; }
    .rbc-tt-label  { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.1px; color: #6B6B7B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rbc-tt-value  { font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; color: ${T.tx}; letter-spacing: -0.5px; line-height: 1; margin-bottom: 3px; }
    .rbc-tt-pct    { font-size: 13px; color: ${T.mt}; letter-spacing: .2px; }

    /* ── Empty ── */
    .rbc-empty { color: ${T.mt}; font-size: 14px; text-align: center; padding: 20px; width: 100%; }

    /* ── Responsive ── */
    .rbc-root[data-w="xs"] .rbc-topbar  { padding: 7px 10px; }
    .rbc-root[data-w="xs"] .rbc-title   { font-size: 13px; }
    .rbc-root[data-w="xs"] .rbc-subtitle { display: none; }
    .rbc-root[data-w="xs"] .rbc-body    { padding: 5px 7px; }
    .rbc-root[data-w="xs"] .rbc-legend  { display: none; }
    .rbc-root[data-w="sm"] .rbc-subtitle { display: none; }
    .rbc-root[data-h="xs"] .rbc-topbar  { display: none; }
    .rbc-root[data-h="xs"] .rbc-gline   { display: none; }
    .rbc-root[data-h="xs"] .rbc-legend  { display: none; }
    .rbc-root[data-h="xs"] .rbc-body    { padding: 3px 6px; }
    .rbc-root[data-h="sm"] .rbc-topbar  { padding: 6px 12px; }
    .rbc-root[data-h="sm"] .rbc-body    { padding: 5px 10px 4px; }
  `;

  /* ─── Logo ────────────────────────────────────────────────────────────── */
  const LOGO_SVG = `
    <svg class="rbc-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rbc-lg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${T.B}"/>
          <stop offset="50%"  stop-color="${T.P}"/>
          <stop offset="100%" stop-color="${T.K}"/>
        </linearGradient>
      </defs>
      <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
            stroke="url(#rbc-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6 L19 6 L19 11"
            stroke="url(#rbc-lg)" stroke-width="2.4" fill="none"
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

  /* ─── Viz definition ──────────────────────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_bar_chart_light",
    label: "Rocket — Bar Chart (Light)",

    options: {
      chart_type: {
        type: "string", label: "Bar layout", display: "select",
        values: [{ "Grouped": "grouped" }, { "Stacked": "stacked" }],
        default: "grouped", section: "Style", order: 1,
      },
      title_override: {
        type: "string", label: "Chart title override", default: "",
        placeholder: "Leave blank to derive from fields",
        section: "Style", order: 2,
      },
      show_values: {
        type: "boolean", label: "Show values on bars",
        default: false, section: "Style", order: 3,
      },
      y_axis_label: {
        type: "string", label: "Y-axis label override", default: "",
        placeholder: "Leave blank to use measure label",
        section: "Style", order: 4,
      },
      show_legend: {
        type: "boolean", label: "Show legend", default: true,
        section: "Legend", order: 5,
      },
      gradient_stop: {
        type: "string", label: "Accent line color", display: "select",
        values: [
          { "Full gradient (blue → pink)": "full"        },
          { "Blue":                        "blue"        },
          { "Blue → Purple":               "blue-purple" },
          { "Purple":                      "purple"      },
          { "Purple → Pink":               "purple-pink" },
          { "Pink":                        "pink"        },
        ],
        default: "full", section: "Style", order: 6,
      },
      line_thickness: {
        type: "string", label: "Accent line thickness", display: "select",
        values: [
          { "Thin (1px)": "1" }, { "Default (2px)": "2" },
          { "Medium (3px)": "3" }, { "Bold (4px)": "4" },
        ],
        default: "2", section: "Style", order: 7,
      },
    },

    /* ── Create ── */
    create: function (element) {
      const style = document.createElement("style");
      style.textContent = CSS;
      element.appendChild(style);

      element.insertAdjacentHTML("beforeend", `
        <div class="rbc-root" id="rbc-root" data-w="lg" data-h="lg">
          <div class="rbc-topbar">
            <div class="rbc-topbar-left">
              ${LOGO_SVG}
              <span class="rbc-title" id="rbc-title">Chart</span>
            </div>
            <span class="rbc-subtitle" id="rbc-subtitle"></span>
          </div>
          <div class="rbc-gline" id="rbc-gline"></div>
          <div class="rbc-body" id="rbc-body">
            <div class="rbc-empty">Loading…</div>
          </div>
        </div>
        <div class="rbc-tooltip" id="rbc-tooltip">
          <div class="rbc-tt-accent" id="rbc-tt-accent"></div>
          <div class="rbc-tt-body">
            <div class="rbc-tt-header">
              <span class="rbc-tt-dot" id="rbc-tt-dot"></span>
              <div>
                <div class="rbc-tt-group" id="rbc-tt-group"></div>
                <div class="rbc-tt-label" id="rbc-tt-label"></div>
              </div>
            </div>
            <div class="rbc-tt-value" id="rbc-tt-value"></div>
            <div class="rbc-tt-pct"   id="rbc-tt-pct"></div>
          </div>
        </div>
      `);

      /* Tooltip follow-mouse */
      element.addEventListener("mousemove", (e) => {
        const tt = element.querySelector(".rbc-tooltip");
        if (!tt) return;
        const pad = 14, tw = tt.offsetWidth || 140, th = tt.offsetHeight || 60;
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
          const root = element.querySelector("#rbc-root");
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

      const root    = element.querySelector("#rbc-root");
      const body    = element.querySelector("#rbc-body");
      const gline   = element.querySelector("#rbc-gline");
      const tooltip = element.querySelector("#rbc-tooltip");
      if (!root || !body) { done(); return; }

      /* Accent line */
      const GRAD_MAP = {
        "blue":        T.B,
        "blue-purple": `linear-gradient(90deg, ${T.B}, #6040EC)`,
        "purple":      T.P,
        "purple-pink": `linear-gradient(90deg, ${T.P}, #B038C8)`,
        "pink":        T.K,
        "full":        `linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K})`,
      };
      if (gline) {
        const gradKey = config.gradient_stop || "full";
        gline.style.height          = (config.line_thickness || "2") + "px";
        gline.style.backgroundImage = GRAD_MAP[gradKey] || GRAD_MAP.full;
      }

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
        body.innerHTML = `<div class="rbc-empty">Add one dimension and one measure to display a chart.</div>`;
        done(); return;
      }

      const dimField  = dims[0];
      const measField = allMeasures[0];

      /* ── Build series ──
         Three modes:
           a) Pivoted: pivots.length > 0  → one series per pivot value
           b) Multi-measure: multiple measures → one series per measure
           c) Single series: one dimension + one measure
      */
      let series = []; // [{key, label, color, values:[{group, val}]}]
      const groups = data.map(row => String(cellVal(row[dimField.name]) ?? "—"));

      if (pivots.length > 0) {
        /* Pivoted mode */
        const pivotDimField = queryResponse.fields.pivots[0];
        pivots.forEach((p, si) => {
          const pivotLabel = p.data
            ? String(Object.values(p.data)[0] ?? p.key)
            : p.key;
          const values = data.map(row => {
            const cell = row[measField.name]?.[p.key];
            return parseFloat(cell?.value) || 0;
          });
          series.push({
            key: p.key,
            label: pivotLabel,
            color: PALETTE[si % PALETTE.length],
            values,
          });
        });
      } else if (allMeasures.length > 1) {
        /* Multi-measure mode */
        allMeasures.forEach((mf, si) => {
          const label = mf.label_short || mf.label || mf.name;
          const values = data.map(row => parseFloat(row[mf.name]?.value) || 0);
          series.push({
            key: mf.name,
            label,
            color: PALETTE[si % PALETTE.length],
            values,
          });
        });
      } else {
        /* Single-series mode */
        const values = data.map(row => parseFloat(row[measField.name]?.value) || 0);
        series.push({
          key: measField.name,
          label: measField.label_short || measField.label || measField.name,
          color: PALETTE[0],
          values,
        });
      }

      /* ── Chart title ── */
      const measLabel = measField.label_short || measField.label || measField.name;
      const dimLabel  = dimField.label_short  || dimField.label  || dimField.name;
      const chartTitle = config.title_override ||
                         (measLabel + " by " + dimLabel);
      element.querySelector("#rbc-title").textContent = chartTitle;

      const seriesWord = series.length === 1 ? "series" : "series";
      element.querySelector("#rbc-subtitle").textContent =
        groups.length + " groups · " + series.length + " " + seriesWord;

      const isStacked   = config.chart_type === "stacked";
      const showLegend  = config.show_legend !== false;
      const showValues  = config.show_values === true;
      const vis         = this;

      /* ── Layout math ── */
      const headerH  = element.querySelector(".rbc-topbar")?.offsetHeight || 40;
      const glineH   = parseInt(config.line_thickness || "2");
      const legendH  = (showLegend && series.length > 1) ? 24 : 0;
      const availH   = tileH - headerH - glineH - 20 - legendH;
      const availW   = tileW - 28;

      /* Margin for axes */
      const ML = 46, MR = 12, MT = 12, MB = 32;
      const chartW = Math.max(40, availW - ML - MR);
      const chartH = Math.max(20, availH - MT - MB);
      const svgW   = availW;
      const svgH   = availH;

      /* Y-scale — track true min AND max to support negative values */
      let rawMax = 0, rawMin = 0;
      if (isStacked) {
        groups.forEach((_, gi) => {
          let posSum = 0, negSum = 0;
          series.forEach(se => {
            const v = se.values[gi];
            if (v >= 0) posSum += v; else negSum += v;
          });
          rawMax = Math.max(rawMax, posSum);
          rawMin = Math.min(rawMin, negSum);
        });
      } else {
        series.forEach(se => se.values.forEach(v => {
          rawMax = Math.max(rawMax, v);
          rawMin = Math.min(rawMin, v);
        }));
      }
      const yMax   = rawMax >= 0 ? niceMax(rawMax * 1.08 || 1) :  0;
      const yMin   = rawMin <  0 ? -niceMax(Math.abs(rawMin) * 1.08) : 0;
      const yRange = yMax - yMin || 1;
      /* yScale: value → pixel offset from top of chart area */
      const yScale = v => chartH * (1 - (v - yMin) / yRange);
      const zeroY  = MT + yScale(0);  // SVG y-coordinate of the zero baseline
      const hasNeg = rawMin < 0;

      /* X-scale */
      const groupW  = chartW / groups.length;
      const barPad  = Math.max(3, groupW * 0.12);
      const innerW  = groupW - barPad * 2;
      const barW    = isStacked ? innerW : Math.max(2, innerW / series.length - 1);
      const groupX  = gi => ML + gi * groupW + barPad;

      /* Y-axis tick count */
      const tickCount = Math.min(6, Math.max(2, Math.floor(chartH / 30)));

      /* ── SVG construction ── */
      const svgNS = "http://www.w3.org/2000/svg";

      /* Y-axis gridlines + labels (evenly spaced from yMin → yMax) */
      let gridLines = "";
      for (let ti = 0; ti <= tickCount; ti++) {
        const v   = yMin + (yMax - yMin) * (ti / tickCount);
        const y   = MT + yScale(v);
        const lx  = ML - 6;
        /* Round floating-point drift at tick boundaries */
        const vr  = Math.round(v * 1e9) / 1e9;
        gridLines += `
          <line class="rbc-gridline" x1="${ML}" y1="${y.toFixed(1)}" x2="${ML + chartW}" y2="${y.toFixed(1)}"/>
          <text class="rbc-axis-label" x="${lx}" y="${y.toFixed(1)}" text-anchor="end" dominant-baseline="middle">${fmtAxis(vr)}</text>`;
      }
      /* Explicit zero line when chart spans negatives */
      if (hasNeg) {
        gridLines += `
          <line class="rbc-zeroline" x1="${ML}" y1="${zeroY.toFixed(1)}" x2="${ML + chartW}" y2="${zeroY.toFixed(1)}"/>`;
      }

      /* X-axis labels (always at bottom of chart area) */
      let xLabels = "";
      const maxLabelW = Math.max(20, groupW - 4);
      groups.forEach((g, gi) => {
        const cx = groupX(gi) + (isStacked ? innerW / 2 : (series.length * barW + (series.length - 1)) / 2);
        const y  = MT + chartH + 14;
        const truncated = g.length > Math.floor(maxLabelW / 6.5)
          ? g.slice(0, Math.floor(maxLabelW / 6.5) - 1) + "…"
          : g;
        xLabels += `<text class="rbc-axis-label" x="${cx}" y="${y}" text-anchor="middle">${esc(truncated)}</text>`;
      });

      /* Bar rects + interaction groups */
      let barGroups = "";
      series.forEach((se, si) => {
        se.values.forEach((val, gi) => {
          if (val === 0) return;
          const isNeg = val < 0;
          let bx, by, bh;

          if (isStacked) {
            if (!isNeg) {
              /* Positive: stack upward from zero (or from positive base) */
              const posBase = series.slice(0, si).reduce((s, ps) => {
                const pv = ps.values[gi]; return s + (pv > 0 ? pv : 0);
              }, 0);
              by = MT + yScale(posBase + val);
              bh = Math.max(1, yScale(posBase) - yScale(posBase + val));
            } else {
              /* Negative: stack downward from zero (or from negative base) */
              const negBase = series.slice(0, si).reduce((s, ps) => {
                const pv = ps.values[gi]; return s + (pv < 0 ? pv : 0);
              }, 0);
              by = MT + yScale(negBase);
              bh = Math.max(1, yScale(negBase + val) - yScale(negBase));
            }
            bx = groupX(gi);
          } else {
            /* Grouped */
            bx = groupX(gi) + si * (barW + 1);
            if (!isNeg) {
              bh = Math.max(1, yScale(0) - yScale(val));
              by = MT + yScale(val);
            } else {
              bh = Math.max(1, yScale(val) - yScale(0));
              by = zeroY;
            }
          }

          const barKey = `${si}-${gi}`;
          const delay  = (gi * 0.04 + si * 0.015).toFixed(3);
          const radius = Math.min(3, barW / 3, bh / 2);
          /* Value label placement */
          const labelY = isNeg ? (by + bh + 10).toFixed(1) : (by - 3).toFixed(1);
          const cx     = (bx + barW / 2).toFixed(1);

          let valueLabelHtml = "";
          if (showValues) {
            if (isStacked && bh >= 18) {
              /* White label centered inside the stacked segment */
              valueLabelHtml = `<text class="rbc-seg-label" x="${cx}" y="${(by + bh / 2).toFixed(1)}">${fmtNumber(val)}</text>`;
            } else if (!isStacked && bh > 14) {
              /* Muted label above grouped bars */
              valueLabelHtml = `<text class="rbc-val-label" x="${cx}" y="${labelY}">${fmtNumber(val)}</text>`;
            }
          }

          barGroups += `
            <g class="rbc-bar${isNeg ? ' negative' : ''}" data-si="${si}" data-gi="${gi}" data-key="${esc(barKey)}">
              <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}"
                    width="${barW.toFixed(1)}" height="${bh.toFixed(1)}"
                    fill="${se.color}" fill-opacity="0.85"
                    rx="${radius}"
                    style="animation-delay:${delay}s"/>
              ${valueLabelHtml}
            </g>`;
        });
      });

      /* Grand total labels above stacked bars */
      let totalLabels = "";
      if (isStacked && showValues) {
        groups.forEach(function(g, gi) {
          const posTotal = series.reduce(function(s, se) {
            const v = se.values[gi]; return s + (v > 0 ? v : 0);
          }, 0);
          if (posTotal === 0) return;
          const cx = (groupX(gi) + innerW / 2).toFixed(1);
          const ty = (MT + yScale(posTotal) - 5).toFixed(1);
          totalLabels += `<text class="rbc-total-label" x="${cx}" y="${ty}">${fmtNumber(posTotal)}</text>`;
        });
      }

      /* Axis lines */
      const axisLines = `
        <line class="rbc-axis-line" x1="${ML}" y1="${MT}" x2="${ML}" y2="${MT + chartH}"/>
        <line class="rbc-axis-line" x1="${ML}" y1="${MT + chartH}" x2="${ML + chartW}" y2="${MT + chartH}"/>`;


      /* Y-axis title */
      const yAxisTitle = config.y_axis_label || measLabel;
      const yAxisLabelEl = yAxisTitle
        ? `<text class="rbc-axis-label"
                 x="${-(MT + chartH / 2)}" y="10"
                 text-anchor="middle"
                 transform="rotate(-90)"
                 style="font-size:12px">${esc(yAxisTitle)}</text>`
        : "";

      /* Legend HTML */
      const legendHTML = (showLegend && series.length > 1)
        ? `<div class="rbc-legend" id="rbc-legend">
             ${series.map((se, si) => `
               <div class="rbc-leg-item" data-si="${si}">
                 <span class="rbc-leg-dot" style="background:${se.color}"></span>
                 <span class="rbc-leg-name">${esc(se.label)}</span>
               </div>`).join("")}
           </div>`
        : "";

      /* ── Render ── */
      body.innerHTML = `
        ${legendHTML}
        <div class="rbc-chart-wrap" id="rbc-chart-wrap">
          <svg id="rbc-svg"
               width="${svgW}" height="${svgH}"
               viewBox="0 0 ${svgW} ${svgH}"
               xmlns="${svgNS}"
               role="img"
               aria-label="${esc(chartTitle)}">
            ${gridLines}
            ${barGroups}
            ${totalLabels}
            ${axisLines}
            ${xLabels}
            ${yAxisLabelEl}
          </svg>
        </div>
      `;

      /* ── Interactions ── */
      const svgEl   = body.querySelector("#rbc-svg");
      const ttDot   = tooltip?.querySelector("#rbc-tt-dot");
      const ttAccent= tooltip?.querySelector("#rbc-tt-accent");
      const ttGroup = tooltip?.querySelector("#rbc-tt-group");
      const ttLabel = tooltip?.querySelector("#rbc-tt-label");
      const ttValue = tooltip?.querySelector("#rbc-tt-value");
      const ttPct   = tooltip?.querySelector("#rbc-tt-pct");

      /* Compute group total for stacked pct */
      const groupTotals = groups.map((_, gi) =>
        series.reduce((s, se) => s + se.values[gi], 0));

      function showTooltip(si, gi) {
        const se    = series[si];
        const val   = se.values[gi];
        const grp   = groups[gi];
        const total = groupTotals[gi];

        let pctHtml = "";
        if (isStacked && total > 0) {
          const pct = ((val / total) * 100).toFixed(1) + "%";
          pctHtml = `${pct} of total &nbsp;·&nbsp; <span style="font-weight:600;color:${T.tx}">Total: ${fmtNumber(total)}</span>`;
        } else if (!isStacked && total > 0) {
          pctHtml = ((val / total) * 100).toFixed(1) + "% of group";
        }

        if (ttDot)    ttDot.style.background    = se.color;
        if (ttAccent) ttAccent.style.background = se.color;
        if (ttGroup)  ttGroup.textContent = grp;
        if (ttLabel)  ttLabel.textContent = se.label;
        if (ttValue)  ttValue.textContent = fmtNumber(val);
        if (ttPct)    ttPct.innerHTML     = pctHtml;
        tooltip.classList.add("visible");
      }

      function hideTooltip() { tooltip?.classList.remove("visible"); }

      function applyPinState() {
        const pk = vis._pinnedKey;
        body.querySelectorAll(".rbc-bar").forEach(g => {
          const key = `${g.dataset.si}-${g.dataset.gi}`;
          const isPinned = (pk !== null && key === pk);
          const isDimmed = (pk !== null && !isPinned);
          g.classList.toggle("dimmed", isDimmed);
          g.classList.toggle("pinned", isPinned);
        });
        body.querySelectorAll(".rbc-leg-item").forEach(li => {
          const si = parseInt(li.dataset.si, 10);
          const isDimmedSeries = pk !== null && !pk.startsWith(si + "-");
          li.classList.toggle("dimmed", isDimmedSeries);
          li.classList.toggle("pinned", false);
        });
      }

      function togglePin(key) {
        vis._pinnedKey = (vis._pinnedKey === key) ? null : key;
        applyPinState();
      }

      svgEl?.querySelectorAll(".rbc-bar").forEach(g => {
        const si  = parseInt(g.dataset.si, 10);
        const gi  = parseInt(g.dataset.gi, 10);
        const key = `${si}-${gi}`;
        g.addEventListener("mouseenter", () => {
          if (vis._pinnedKey === null) showTooltip(si, gi);
        });
        g.addEventListener("mouseleave", () => {
          if (vis._pinnedKey === null) hideTooltip();
        });
        g.addEventListener("click", (e) => {
          e.stopPropagation();
          togglePin(key);
          if (vis._pinnedKey === key) showTooltip(si, gi);
          else hideTooltip();
        });
      });

      /* Legend series toggle */
      body.querySelectorAll(".rbc-leg-item").forEach(li => {
        const si = parseInt(li.dataset.si, 10);
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          /* Pin all bars in this series */
          const firstKey = `${si}-0`;
          const sameSeries = vis._pinnedKey?.startsWith(si + "-");
          vis._pinnedKey = sameSeries ? null : firstKey.replace("-0", "-_series_" + si);
          /* For series pin we use a special key prefix */
          vis._pinnedKey = sameSeries ? null : `_s${si}`;
          body.querySelectorAll(".rbc-bar").forEach(g => {
            const bsi = parseInt(g.dataset.si, 10);
            const pinned = !sameSeries && bsi === si;
            g.classList.toggle("dimmed", !sameSeries && bsi !== si);
            g.classList.toggle("pinned", pinned);
          });
          body.querySelectorAll(".rbc-leg-item").forEach(l => {
            const lsi = parseInt(l.dataset.si, 10);
            l.classList.toggle("dimmed", !sameSeries && lsi !== si);
            l.classList.toggle("pinned", !sameSeries && lsi === si);
          });
          if (!sameSeries) hideTooltip();
        });
      });

      /* Click outside to clear */
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
  });
})();
