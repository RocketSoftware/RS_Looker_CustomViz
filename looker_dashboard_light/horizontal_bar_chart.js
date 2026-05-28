/**
 * Rocket Software — Horizontal Bar Chart
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add the URL.
 *   3. Select "Rocket — Horizontal Bar Chart" from the visualization picker.
 *
 * Supports:
 *   - One dimension + one measure              → single-series horizontal bar
 *   - One dimension + multiple measures        → each measure = one series
 *   - One dimension + one measure + pivot      → each pivot value = one series
 *   - Grouped or stacked layout
 *   - Negative values (bars extend left of zero)
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
    tx:   "#1C1C1E",
    mt:   "#8E8E93",
    B: "#6040EC",
    P: "#813CDD",
    K: "#B038C8",
  };

  /* ─── Color palette — blue → purple → pink brand family ─────────────── */
    const PALETTE = [
  "#6040EC",
  "#673FE9",
  "#6D3FE6",
  "#743EE3",
  "#7A3DE0",
  "#813CDD",
  "#883CDA",
  "#903BD7",
  "#983AD3",
  "#A039CF",
  "#A839CC",
  "#B038C8",
];

  /* ─── CSS ─────────────────────────────────────────────────────────────── */
  const CSS = `
    .rhb-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      background: ${T.bg};
      overflow: hidden;
      box-sizing: border-box;
      position: relative;
    }

    .rhb-topbar {
      background: ${T.surf};
      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo};
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      flex-shrink: 0;
    }
    .rhb-topbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .rhb-logo        { width: 20px; height: 20px; flex-shrink: 0; opacity: .85; }
    .rhb-title {
      font-size: 15px; font-weight: 500; color: ${T.tx};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rhb-subtitle { font-size: 13px; color: ${T.mt}; white-space: nowrap; flex-shrink: 0; }

    .rhb-gline {
      height: 2px;
      background: linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K});
      background-size: 200% 100%;
      flex-shrink: 0;
      animation: rhb-grad-flow 5s ease-in-out infinite alternate;
    }
    @keyframes rhb-grad-flow {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }

    .rhb-body {
      flex: 1; display: flex; flex-direction: column;
      min-height: 0; overflow: hidden;
      padding: 10px 14px 10px;
      box-sizing: border-box;
      gap: 6px;
    }

    /* ── Legend ── */
    .rhb-legend {
      display: flex; flex-wrap: wrap;
      gap: 4px 12px;
      flex-shrink: 0;
    }
    .rhb-leg-item {
      display: flex; align-items: center; gap: 6px;
      cursor: pointer;
      padding: 2px 6px 2px 0;
      border-radius: 4px;
      transition: background .12s;
    }
    .rhb-leg-item:hover  { background: rgba(0,0,0,0.05); }
    .rhb-leg-item.dimmed { opacity: .3; }
    .rhb-leg-item.pinned { background: rgba(0,0,0,0.06) !important; }
    .rhb-leg-item.pinned .rhb-leg-name { color: ${T.tx}; font-weight: 600; }
    .rhb-leg-dot  { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
    .rhb-leg-name { font-size: 13px; color: #8E8E93; white-space: nowrap; }

    /* ── Chart area ── */
    .rhb-chart-wrap {
      flex: 1; min-height: 0;
      position: relative;
      overflow: hidden;
    }
    .rhb-chart-wrap svg { display: block; overflow: visible; }

    /* ── Axes ── */
    .rhb-axis-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      fill: ${T.mt};
    }
    .rhb-gridline  { stroke: rgba(0,0,0,0.06); stroke-width: 1; }
    .rhb-zeroline  { stroke: #DDDDE5; stroke-width: 1; }
    .rhb-axis-line { stroke: #DDDDE5; stroke-width: 1; }

    /* ── Bars ── */
    .rhb-bar {
      cursor: pointer;
      transition: filter .15s, opacity .15s;
    }
    .rhb-bar:hover { filter: brightness(1.2) drop-shadow(0 0 4px rgba(255,255,255,.12)); }
    .rhb-bar.dimmed { opacity: .22; }
    .rhb-bar.pinned { filter: brightness(1.25) drop-shadow(0 0 7px rgba(255,255,255,.2)); }

    /* Entrance animation — grows from left (zero line for positive bars) */
    @keyframes rhb-grow {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
    .rhb-bar rect {
      transform-origin: left;
      animation: rhb-grow .45s cubic-bezier(.4,0,.2,1) both;
    }
    /* Negative bars grow from right (their right edge is the zero line) */
    .rhb-bar.negative rect {
      transform-origin: right;
    }

    /* ── Value labels on bars ── */
    .rhb-val-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      fill: #8E8E93;
      dominant-baseline: middle;
      pointer-events: none;
    }

    /* ── Tooltip ── */
    .rhb-tooltip {
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
    .rhb-tooltip.visible { opacity: 1; transform: translateY(0) scale(1); }
    .rhb-tt-accent { height: 3px; background: ${T.P}; }
    .rhb-tt-body   { padding: 10px 14px 13px; }
    .rhb-tt-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
    .rhb-tt-dot    { width: 8px; height: 8px; border-radius: 2px; background: ${T.P}; flex-shrink: 0; }
    .rhb-tt-group  { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.1px; color: #6B6B7B; }
    .rhb-tt-label  { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.1px; color: #6B6B7B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rhb-tt-value  { font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; color: ${T.tx}; letter-spacing: -0.5px; line-height: 1; margin-bottom: 3px; }
    .rhb-tt-pct    { font-size: 13px; color: ${T.mt}; letter-spacing: .2px; }

    /* ── Empty ── */
    .rhb-empty { color: ${T.mt}; font-size: 14px; text-align: center; padding: 20px; width: 100%; }

    /* ── Responsive ── */
    .rhb-root[data-w="xs"] .rhb-topbar   { padding: 7px 10px; }
    .rhb-root[data-w="xs"] .rhb-title    { font-size: 13px; }
    .rhb-root[data-w="xs"] .rhb-subtitle { display: none; }
    .rhb-root[data-w="xs"] .rhb-body     { padding: 5px 7px; }
    .rhb-root[data-w="xs"] .rhb-legend   { display: none; }
    .rhb-root[data-w="sm"] .rhb-subtitle { display: none; }
    .rhb-root[data-h="xs"] .rhb-topbar   { display: none; }
    .rhb-root[data-h="xs"] .rhb-gline    { display: none; }
    .rhb-root[data-h="xs"] .rhb-legend   { display: none; }
    .rhb-root[data-h="xs"] .rhb-body     { padding: 3px 6px; }
    .rhb-root[data-h="sm"] .rhb-topbar   { padding: 6px 12px; }
    .rhb-root[data-h="sm"] .rhb-body     { padding: 5px 10px 4px; }
  `;

  /* ─── Logo ────────────────────────────────────────────────────────────── */
  const LOGO_SVG = `
    <svg class="rhb-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rhb-lg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${T.B}"/>
          <stop offset="50%"  stop-color="${T.P}"/>
          <stop offset="100%" stop-color="${T.K}"/>
        </linearGradient>
      </defs>
      <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
            stroke="url(#rhb-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6 L19 6 L19 11"
            stroke="url(#rhb-lg)" stroke-width="2.4" fill="none"
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
    const mag  = Math.pow(10, Math.floor(Math.log10(rawMax)));
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
    id:    "rocket_horizontal_bar_light",
    label: "Rocket — Horizontal Bar Chart",

    options: {
      chart_type: {
        type: "string", label: "Bar layout", display: "select",
        values: [{ "Stacked": "stacked" }, { "Grouped": "grouped" }],
        default: "stacked", section: "Style", order: 1,
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
      x_axis_label: {
        type: "string", label: "X-axis label override", default: "",
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
        <div class="rhb-root" id="rhb-root" data-w="lg" data-h="lg">
          <div class="rhb-topbar">
            <div class="rhb-topbar-left">
              ${LOGO_SVG}
              <span class="rhb-title" id="rhb-title">Chart</span>
            </div>
            <span class="rhb-subtitle" id="rhb-subtitle"></span>
          </div>
          <div class="rhb-gline" id="rhb-gline"></div>
          <div class="rhb-body" id="rhb-body">
            <div class="rhb-empty">Loading…</div>
          </div>
        </div>
        <div class="rhb-tooltip" id="rhb-tooltip">
          <div class="rhb-tt-accent" id="rhb-tt-accent"></div>
          <div class="rhb-tt-body">
            <div class="rhb-tt-header">
              <span class="rhb-tt-dot" id="rhb-tt-dot"></span>
              <div>
                <div class="rhb-tt-group" id="rhb-tt-group"></div>
                <div class="rhb-tt-label" id="rhb-tt-label"></div>
              </div>
            </div>
            <div class="rhb-tt-value" id="rhb-tt-value"></div>
            <div class="rhb-tt-pct"   id="rhb-tt-pct"></div>
          </div>
        </div>
      `);

      /* Tooltip follow-mouse */
      element.addEventListener("mousemove", (e) => {
        const tt = element.querySelector(".rhb-tooltip");
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
          const root = element.querySelector("#rhb-root");
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

      const root    = element.querySelector("#rhb-root");
      const body    = element.querySelector("#rhb-body");
      const gline   = element.querySelector("#rhb-gline");
      const tooltip = element.querySelector("#rhb-tooltip");
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
      const dims    = queryResponse.fields.dimensions         || [];
      const meas    = queryResponse.fields.measures           || [];
      const calcs   = queryResponse.fields.table_calculations || [];
      const pivots  = queryResponse.pivots                    || [];
      const allMeasures = [...meas, ...calcs];

      if (!dims.length || !allMeasures.length || !data.length) {
        body.innerHTML = `<div class="rhb-empty">Add one dimension and one measure to display a chart.</div>`;
        done(); return;
      }

      const dimField  = dims[0];
      const measField = allMeasures[0];

      /* ── Build series (same three modes as vertical bar chart) ── */
      let series = [];
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
          key: measField.name,
          label: measField.label_short || measField.label || measField.name,
          color: PALETTE[0],
          values,
        });
      }

      /* ── Chart metadata ── */
      const measLabel  = measField.label_short || measField.label || measField.name;
      const dimLabel   = dimField.label_short  || dimField.label  || dimField.name;
      const chartTitle = config.title_override || (measLabel + " by " + dimLabel);
      element.querySelector("#rhb-title").textContent    = chartTitle;
      element.querySelector("#rhb-subtitle").textContent =
        groups.length + " groups · " + series.length + " series";

      const isStacked  = config.chart_type !== "grouped";
      const showLegend = config.show_legend !== false;
      const showValues = config.show_values === true;
      const vis        = this;

      /* ── Layout math ── */
      const headerH = element.querySelector(".rhb-topbar")?.offsetHeight || 40;
      const glineH  = parseInt(config.line_thickness || "2");
      const legendH = (showLegend && series.length > 1) ? 24 : 0;
      const availH  = tileH - headerH - glineH - 20 - legendH;
      const availW  = tileW - 28;

      /* Left margin: estimate from longest group label (~6.2px per char) */
      const maxLabelChars = groups.reduce((mx, g) => Math.max(mx, g.length), 0);
      const ML = Math.min(130, Math.max(55, Math.ceil(maxLabelChars * 6.2) + 10));
      const MR = 16;
      const MT = 8;
      const MB = 26; /* x-axis tick labels at bottom */

      const chartW = Math.max(40, availW - ML - MR);
      const chartH = Math.max(20, availH - MT - MB);
      const svgW   = availW;
      const svgH   = availH;

      /* ── X-scale (value axis — horizontal) ── */
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
      const xMax   = rawMax >= 0 ? niceMax(rawMax * 1.08 || 1) :  0;
      const xMin   = rawMin <  0 ? -niceMax(Math.abs(rawMin) * 1.08) : 0;
      const xRange = xMax - xMin || 1;
      /* xScale: value → pixel offset within chart area (0 = left edge) */
      const xScale = v => ((v - xMin) / xRange) * chartW;
      const xZero  = ML + xScale(0); /* SVG x-coordinate of the zero baseline */
      const hasNeg = rawMin < 0;

      /* ── Y-scale (group axis — vertical) ── */
      const rowH   = chartH / groups.length;
      const rowPad = Math.max(2, Math.min(6, rowH * 0.12));
      /* Bar thickness per series in grouped mode */
      const barThick = isStacked
        ? rowH - rowPad * 2
        : Math.max(2, (rowH - rowPad * 2) / series.length - 1);

      /* ── Tick count for x-axis ── */
      const tickCount = Math.min(6, Math.max(2, Math.floor(chartW / 50)));

      /* ── SVG construction ── */

      /* X-axis gridlines + labels (vertical lines, labels at bottom) */
      let gridLines = "";
      for (let ti = 0; ti <= tickCount; ti++) {
        const v  = xMin + (xMax - xMin) * (ti / tickCount);
        const x  = ML + xScale(v);
        const vr = Math.round(v * 1e9) / 1e9;
        gridLines += `
          <line class="rhb-gridline" x1="${x.toFixed(1)}" y1="${MT}" x2="${x.toFixed(1)}" y2="${MT + chartH}"/>
          <text class="rhb-axis-label" x="${x.toFixed(1)}" y="${(MT + chartH + 14).toFixed(1)}" text-anchor="middle">${fmtAxis(vr)}</text>`;
      }
      /* Explicit zero line when chart spans negatives */
      if (hasNeg) {
        gridLines += `
          <line class="rhb-zeroline" x1="${xZero.toFixed(1)}" y1="${MT}" x2="${xZero.toFixed(1)}" y2="${MT + chartH}"/>`;
      }

      /* Y-axis group labels */
      let yLabels = "";
      const maxCharsForML = Math.floor((ML - 8) / 6.2);
      groups.forEach((g, gi) => {
        const cy = MT + gi * rowH + rowH / 2;
        const truncated = g.length > maxCharsForML
          ? g.slice(0, maxCharsForML - 1) + "…"
          : g;
        yLabels += `<text class="rhb-axis-label" x="${(ML - 7).toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="end" dominant-baseline="middle">${esc(truncated)}</text>`;
      });

      /* X-axis title */
      const xAxisTitle   = config.x_axis_label || measLabel;
      const xAxisLabelEl = xAxisTitle
        ? `<text class="rhb-axis-label"
                 x="${(ML + chartW / 2).toFixed(1)}" y="${(svgH - 2).toFixed(1)}"
                 text-anchor="middle"
                 style="font-size:12px">${esc(xAxisTitle)}</text>`
        : "";

      /* Bar rects + interaction groups */
      let barGroups = "";
      series.forEach((se, si) => {
        se.values.forEach((val, gi) => {
          if (val === 0) return;
          const isNeg = val < 0;
          let bx, by, bw, bh;

          /* Vertical position within row */
          if (isStacked) {
            by = MT + gi * rowH + rowPad;
            bh = rowH - rowPad * 2;
          } else {
            by = MT + gi * rowH + rowPad + si * (barThick + 1);
            bh = barThick;
          }

          if (isStacked) {
            if (!isNeg) {
              const posBase = series.slice(0, si).reduce((s, ps) => {
                const pv = ps.values[gi]; return s + (pv > 0 ? pv : 0);
              }, 0);
              bx = ML + xScale(posBase);
              bw = Math.max(1, xScale(posBase + val) - xScale(posBase));
            } else {
              const negBase = series.slice(0, si).reduce((s, ps) => {
                const pv = ps.values[gi]; return s + (pv < 0 ? pv : 0);
              }, 0);
              bx = ML + xScale(negBase + val);
              bw = Math.max(1, xScale(negBase) - xScale(negBase + val));
            }
          } else {
            /* Grouped */
            if (!isNeg) {
              bx = xZero;
              bw = Math.max(1, xScale(val) - xScale(0));
            } else {
              bx = ML + xScale(val);
              bw = Math.max(1, xScale(0) - xScale(val));
            }
          }

          bh = Math.max(2, bh);
          const barKey = `${si}-${gi}`;
          const delay  = (gi * 0.035 + si * 0.012).toFixed(3);
          const radius = Math.min(3, bh / 3, bw / 2);

          /* Value label: right of positive bars, left of negative bars */
          const labelX  = isNeg ? (bx - 3).toFixed(1) : (bx + bw + 3).toFixed(1);
          const labelAnchor = isNeg ? "end" : "start";
          const labelCY = (by + bh / 2).toFixed(1);

          barGroups += `
            <g class="rhb-bar${isNeg ? ' negative' : ''}" data-si="${si}" data-gi="${gi}">
              <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}"
                    width="${bw.toFixed(1)}" height="${bh.toFixed(1)}"
                    fill="${se.color}" fill-opacity="0.85"
                    rx="${radius}"
                    style="animation-delay:${delay}s"/>
              ${showValues && bw > 22 ? `
              <text class="rhb-val-label"
                    x="${labelX}" y="${labelCY}"
                    text-anchor="${labelAnchor}">${fmtNumber(val)}</text>` : ""}
            </g>`;
        });
      });

      /* Axis lines */
      const axisLines = `
        <line class="rhb-axis-line" x1="${ML}" y1="${MT}" x2="${ML}" y2="${MT + chartH}"/>
        <line class="rhb-axis-line" x1="${ML}" y1="${MT + chartH}" x2="${ML + chartW}" y2="${MT + chartH}"/>`;

      /* Legend HTML */
      const legendHTML = (showLegend && series.length > 1)
        ? `<div class="rhb-legend" id="rhb-legend">
             ${series.map((se, si) => `
               <div class="rhb-leg-item" data-si="${si}">
                 <span class="rhb-leg-dot" style="background:${se.color}"></span>
                 <span class="rhb-leg-name">${esc(se.label)}</span>
               </div>`).join("")}
           </div>`
        : "";

      /* ── Render ── */
      body.innerHTML = `
        ${legendHTML}
        <div class="rhb-chart-wrap" id="rhb-chart-wrap">
          <svg id="rhb-svg"
               width="${svgW}" height="${svgH}"
               viewBox="0 0 ${svgW} ${svgH}"
               xmlns="http://www.w3.org/2000/svg"
               role="img"
               aria-label="${esc(chartTitle)}">
            ${gridLines}
            ${barGroups}
            ${axisLines}
            ${yLabels}
            ${xAxisLabelEl}
          </svg>
        </div>
      `;

      /* ── Interactions ── */
      const svgEl    = body.querySelector("#rhb-svg");
      const ttDot    = tooltip?.querySelector("#rhb-tt-dot");
      const ttAccent = tooltip?.querySelector("#rhb-tt-accent");
      const ttGroup  = tooltip?.querySelector("#rhb-tt-group");
      const ttLabel  = tooltip?.querySelector("#rhb-tt-label");
      const ttValue  = tooltip?.querySelector("#rhb-tt-value");
      const ttPct    = tooltip?.querySelector("#rhb-tt-pct");

      /* Group totals for tooltip percentage */
      const groupTotals = groups.map((_, gi) =>
        series.reduce((s, se) => s + Math.abs(se.values[gi]), 0));

      function showTooltip(si, gi) {
        const se  = series[si];
        const val = se.values[gi];
        const grp = groups[gi];
        const pct = groupTotals[gi] > 0
          ? ((Math.abs(val) / groupTotals[gi]) * 100).toFixed(1) + "% of group"
          : "";
        if (ttDot)    ttDot.style.background    = se.color;
        if (ttAccent) ttAccent.style.background = se.color;
        if (ttGroup)  ttGroup.textContent = grp;
        if (ttLabel)  ttLabel.textContent = se.label;
        if (ttValue)  ttValue.textContent = fmtNumber(val);
        if (ttPct)    ttPct.textContent   = pct;
        tooltip?.classList.add("visible");
      }

      function hideTooltip() { tooltip?.classList.remove("visible"); }

      function applyPinState() {
        const pk = vis._pinnedKey;
        body.querySelectorAll(".rhb-bar").forEach(g => {
          const key      = `${g.dataset.si}-${g.dataset.gi}`;
          const isPinned = pk !== null && (key === pk || pk === `_s${g.dataset.si}`);
          const isDimmed = pk !== null && !isPinned;
          g.classList.toggle("dimmed", isDimmed);
          g.classList.toggle("pinned", isPinned);
        });
        body.querySelectorAll(".rhb-leg-item").forEach(li => {
          const si          = parseInt(li.dataset.si, 10);
          const isSeriesPin = pk !== null && pk === `_s${si}`;
          const isDimmed    = pk !== null && !isSeriesPin && !pk?.startsWith(`${si}-`);
          li.classList.toggle("dimmed", isDimmed);
          li.classList.toggle("pinned", isSeriesPin);
        });
      }

      function togglePin(key) {
        vis._pinnedKey = (vis._pinnedKey === key) ? null : key;
        applyPinState();
      }

      svgEl?.querySelectorAll(".rhb-bar").forEach(g => {
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
      body.querySelectorAll(".rhb-leg-item").forEach(li => {
        const si = parseInt(li.dataset.si, 10);
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          const seriesKey  = `_s${si}`;
          const alreadyPin = vis._pinnedKey === seriesKey;
          vis._pinnedKey   = alreadyPin ? null : seriesKey;
          body.querySelectorAll(".rhb-bar").forEach(g => {
            const bsi = parseInt(g.dataset.si, 10);
            g.classList.toggle("dimmed", !alreadyPin && bsi !== si);
            g.classList.toggle("pinned", !alreadyPin && bsi === si);
          });
          body.querySelectorAll(".rhb-leg-item").forEach(l => {
            const lsi = parseInt(l.dataset.si, 10);
            l.classList.toggle("dimmed", !alreadyPin && lsi !== si);
            l.classList.toggle("pinned", !alreadyPin && lsi === si);
          });
          if (!alreadyPin) hideTooltip();
        });
      });

      /* Click outside to clear pin */
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
