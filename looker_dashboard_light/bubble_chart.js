/**
 * Rocket Software — Bubble Chart
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add the URL.
 *   3. Select "Rocket — Bubble Chart (Light)" from the visualization picker.
 *
 * Field mapping (in order):
 *   dimensions[0]  → bubble label + color group  (optional)
 *   measures[0]    → X axis value
 *   measures[1]    → Y axis value
 *   measures[2]    → bubble size                 (optional — uniform if absent)
 *
 *   Table calculations count as additional measures in the same order.
 *
 * Version: 1.0.0  |  May 2025
 */

(function () {
  "use strict";

  /* ─── Brand tokens ────────────────────────────────────────────────────── */
  const T = {
    bg:   "#F7F7FF",
    surf: "#EEEEF8",
    bo:   "rgba(100,65,210,.22)",
    bo2:  "rgba(100,65,210,.11)",
    tx:   "#1A1A3A",
    mt:   "#7070A0",
    dm:   "#CECEF0",
    B:    "#3B7EF6",
    P:    "#7B3FE4",
    K:    "#D9349A",
    ok:   "#2DD4A0",
    wn:   "#F0A830",
    er:   "#F06060",
  };

  /* ─── Color palette — blue → purple → pink brand family ─────────────── */
  const PALETTE = [
    "#3B7EF6", "#5B5EF4", "#7B3FE4", "#9B30D0",
    "#B838B8", "#D9349A", "#2495CC", "#4355E8",
    "#6B28C8", "#A020A8", "#CC2888", "#E03070",
  ];

  /* ─── CSS ─────────────────────────────────────────────────────────────── */
  const CSS = `
    .rbu-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      background: ${T.bg};
      background-image:
        repeating-linear-gradient(135deg, rgba(100,65,210,.04) 0, rgba(100,65,210,.04) 1px, transparent 1px, transparent 18px),
        repeating-linear-gradient(45deg,  rgba(59,126,246,.03) 0, rgba(59,126,246,.03) 1px, transparent 1px, transparent 18px);
      overflow: hidden;
      box-sizing: border-box;
      border-radius: 10px;
      border: 1px solid ${T.bo};
      position: relative;
    }

    /* ── Topbar ── */
    .rbu-topbar {
      background: ${T.surf};
      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo};
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      flex-shrink: 0;
    }
    .rbu-topbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .rbu-logo  { width: 20px; height: 20px; flex-shrink: 0; opacity: .85; }
    .rbu-title {
      font-size: 14px; font-weight: 500; color: ${T.tx};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rbu-subtitle { font-size: 11px; color: ${T.mt}; white-space: nowrap; flex-shrink: 0; }

    /* ── Gradient accent line ── */
    .rbu-gline {
      height: 2px;
      background: linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K});
      background-size: 200% 100%;
      flex-shrink: 0;
      animation: rbu-grad-flow 5s ease-in-out infinite alternate;
    }
    @keyframes rbu-grad-flow {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }

    /* ── Body ── */
    .rbu-body {
      flex: 1; display: flex; flex-direction: column;
      min-height: 0; overflow: hidden;
      padding: 10px 14px 10px;
      box-sizing: border-box;
      gap: 6px;
    }

    /* ── Legend ── */
    .rbu-legend {
      display: flex; flex-wrap: wrap;
      gap: 4px 12px;
      flex-shrink: 0;
    }
    .rbu-leg-item {
      display: flex; align-items: center; gap: 6px;
      cursor: pointer;
      padding: 2px 6px 2px 0;
      border-radius: 4px;
      transition: background .12s;
    }
    .rbu-leg-item:hover  { background: rgba(123,63,228,.10); }
    .rbu-leg-item.dimmed { opacity: .3; }
    .rbu-leg-item.pinned { background: rgba(123,63,228,.16) !important; }
    .rbu-leg-item.pinned .rbu-leg-name { color: ${T.tx}; font-weight: 600; }
    .rbu-leg-dot  { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
    .rbu-leg-name { font-size: 11px; color: #9898C8; white-space: nowrap; }

    /* ── Chart area ── */
    .rbu-chart-wrap {
      flex: 1; min-height: 0;
      position: relative;
      overflow: hidden;
    }
    .rbu-chart-wrap svg { display: block; overflow: visible; }

    /* ── Axes ── */
    .rbu-axis-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10px;
      fill: ${T.mt};
    }
    .rbu-axis-title {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 500;
      fill: #7878A8;
    }
    .rbu-gridline { stroke: rgba(89,89,133,.18); stroke-width: 1; }
    .rbu-axis-line { stroke: rgba(100,100,160,.32); stroke-width: 1; }

    /* ── Bubbles ── */
    .rbu-bubble {
      cursor: pointer;
      transition: opacity .15s, filter .15s;
    }
    .rbu-bubble circle {
      transition: filter .15s;
    }
    .rbu-bubble:hover circle {
      filter: brightness(1.3) drop-shadow(0 0 6px rgba(255,255,255,.18));
    }
    .rbu-bubble.dimmed { opacity: .15; }
    .rbu-bubble.pinned circle {
      filter: brightness(1.35) drop-shadow(0 0 9px rgba(255,255,255,.25));
    }

    /* ── Bubble entrance animation ── */
    @keyframes rbu-pop {
      from { transform: scale(0); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
    .rbu-bubble circle {
      transform-origin: center;
      animation: rbu-pop .4s cubic-bezier(.34,1.56,.64,1) both;
    }

    /* ── Bubble labels ── */
    .rbu-bubble-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 9px;
      fill: rgba(226,226,255,.85);
      text-anchor: middle;
      dominant-baseline: middle;
      pointer-events: none;
    }

    /* ── Tooltip ── */
    .rbu-tooltip {
      position: fixed;
      pointer-events: none;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: rgba(248,248,255,0.97);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(100,65,210,.38);
      border-radius: 10px;
      padding: 0;
      overflow: hidden;
      z-index: 9999;
      opacity: 0;
      transform: translateY(6px) scale(0.97);
      transition: opacity .15s ease, transform .15s ease;
      box-shadow: 0 8px 32px rgba(80,80,160,.18), 0 0 0 1px rgba(123,63,228,.08);
      min-width: 152px; max-width: 240px;
    }
    .rbu-tooltip.visible { opacity: 1; transform: translateY(0) scale(1); }
    .rbu-tt-accent { height: 3px; }
    .rbu-tt-body   { padding: 10px 14px 13px; }
    .rbu-tt-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
    .rbu-tt-dot    { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .rbu-tt-label  { font-size: 10px; font-weight: 600; text-transform: uppercase;
                     letter-spacing: 1.1px; color: #7878A8;
                     white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rbu-tt-row    { display: flex; justify-content: space-between; align-items: baseline;
                     gap: 10px; margin-bottom: 3px; }
    .rbu-tt-key    { font-size: 10px; color: ${T.mt}; white-space: nowrap; }
    .rbu-tt-val    { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums;
                     color: ${T.tx}; letter-spacing: -0.3px; }

    /* ── Empty ── */
    .rbu-empty { color: ${T.mt}; font-size: 13px; text-align: center; padding: 20px; }

    /* ── Responsive ── */
    .rbu-root[data-w="xs"] .rbu-topbar  { padding: 7px 10px; }
    .rbu-root[data-w="xs"] .rbu-title   { font-size: 12px; }
    .rbu-root[data-w="xs"] .rbu-subtitle { display: none; }
    .rbu-root[data-w="xs"] .rbu-body    { padding: 4px 6px; }
    .rbu-root[data-w="xs"] .rbu-legend  { display: none; }
    .rbu-root[data-w="sm"] .rbu-subtitle { display: none; }
    .rbu-root[data-h="xs"] .rbu-topbar  { display: none; }
    .rbu-root[data-h="xs"] .rbu-gline   { display: none; }
    .rbu-root[data-h="xs"] .rbu-legend  { display: none; }
    .rbu-root[data-h="xs"] .rbu-body    { padding: 3px 6px; }
    .rbu-root[data-h="sm"] .rbu-topbar  { padding: 6px 12px; }
    .rbu-root[data-h="sm"] .rbu-body    { padding: 5px 10px 4px; }
  `;

  /* ─── Logo SVG ────────────────────────────────────────────────────────── */
  const LOGO_SVG = `
    <svg class="rbu-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rbu-lg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${T.B}"/>
          <stop offset="50%"  stop-color="${T.P}"/>
          <stop offset="100%" stop-color="${T.K}"/>
        </linearGradient>
      </defs>
      <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
            stroke="url(#rbu-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6 L19 6 L19 11"
            stroke="url(#rbu-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  /* ─── Helpers ─────────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function numVal(cell) {
    if (cell == null) return null;
    const v = parseFloat(String(cell.value ?? "").replace(/[^0-9.\-]/g, ""));
    return isNaN(v) ? null : v;
  }

  function fmtNumber(v) {
    if (v == null) return "—";
    if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(2);
  }

  function fmtAxis(v) {
    if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(0) + "B";
    if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(0) + "M";
    if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(0) + "K";
    return v % 1 === 0 ? String(v) : v.toFixed(1);
  }

  function niceRange(rawMin, rawMax, ticks = 6) {
    if (rawMin === rawMax) { rawMin -= 1; rawMax += 1; }
    const span = rawMax - rawMin;
    const mag  = Math.pow(10, Math.floor(Math.log10(span / ticks)));
    const nice = [1, 2, 2.5, 5, 10].find(n => (n * mag * ticks) >= span) || 10;
    const step = nice * mag;
    const lo   = Math.floor(rawMin / step) * step;
    const hi   = Math.ceil(rawMax  / step) * step;
    const pts  = [];
    for (let v = lo; v <= hi + step * 0.001; v += step) pts.push(+v.toFixed(10));
    return { lo, hi, step, pts };
  }

  function applyBreakpoints(root, w, h) {
    root.setAttribute("data-w", w < 240 ? "xs" : w < 380 ? "sm" : w < 560 ? "md" : "lg");
    root.setAttribute("data-h", h < 100 ? "xs" : h < 180 ? "sm" : "lg");
  }

  function svgEl(tag, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, String(v)));
    return el;
  }

  /* ─── Viz definition ──────────────────────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_bubble_chart_light",
    label: "Rocket — Bubble Chart (Light)",

    options: {
      title: {
        type: "string", label: "Chart title", default: "",
        section: "Style", order: 1,
      },
      x_label: {
        type: "string", label: "X axis label (overrides field name)", default: "",
        section: "Style", order: 2,
      },
      y_label: {
        type: "string", label: "Y axis label (overrides field name)", default: "",
        section: "Style", order: 3,
      },
      max_bubble_radius: {
        type: "number", label: "Max bubble radius (px)", default: 40,
        section: "Style", order: 4,
      },
      min_bubble_radius: {
        type: "number", label: "Min bubble radius (px)", default: 5,
        section: "Style", order: 5,
      },
      show_bubble_labels: {
        type: "boolean", label: "Show labels on bubbles", default: false,
        section: "Style", order: 6,
      },
    },

    /* ── create ─────────────────────────────────────────────────────────── */
    create(el, config) {
      if (!document.getElementById("rbu-styles")) {
        const st = document.createElement("style");
        st.id = "rbu-styles";
        st.textContent = CSS;
        document.head.appendChild(st);
      }

      el.innerHTML = "";
      const root = document.createElement("div");
      root.className = "rbu-root";
      el.appendChild(root);
      this._root = root;

      // Topbar
      const topbar = document.createElement("div");
      topbar.className = "rbu-topbar";
      topbar.innerHTML = `
        <div class="rbu-topbar-left">
          ${LOGO_SVG}
          <span class="rbu-title">Bubble Chart</span>
        </div>
        <span class="rbu-subtitle"></span>`;
      root.appendChild(topbar);
      this._titleEl    = topbar.querySelector(".rbu-title");
      this._subtitleEl = topbar.querySelector(".rbu-subtitle");

      // Gradient accent line
      const gline = document.createElement("div");
      gline.className = "rbu-gline";
      root.appendChild(gline);

      // Body
      const body = document.createElement("div");
      body.className = "rbu-body";
      root.appendChild(body);
      this._body = body;

      // Legend
      const legend = document.createElement("div");
      legend.className = "rbu-legend";
      body.appendChild(legend);
      this._legendEl = legend;

      // Chart wrap
      const wrap = document.createElement("div");
      wrap.className = "rbu-chart-wrap";
      body.appendChild(wrap);
      this._wrap = wrap;

      // Tooltip
      const tip = document.createElement("div");
      tip.className = "rbu-tooltip";
      tip.innerHTML = `<div class="rbu-tt-accent"></div><div class="rbu-tt-body"></div>`;
      document.body.appendChild(tip);
      this._tip = tip;

      // State
      this._pinnedKey = null;

      // ResizeObserver
      this._debounceTimer = null;
      this._ro = new ResizeObserver(() => {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
          if (this._lastArgs) {
            const [d, e, c, qr, det, done] = this._lastArgs;
            this._render(d, e, c, qr, det, done);
          }
        }, 120);
      });
      this._ro.observe(wrap);
    },

    /* ── updateAsync ─────────────────────────────────────────────────────── */
    updateAsync(data, el, config, queryResponse, details, done) {
      this._lastArgs = [data, el, config, queryResponse, details, done];
      this._render(data, el, config, queryResponse, details, done);
    },

    /* ── _render ─────────────────────────────────────────────────────────── */
    _render(data, el, config, queryResponse, details, done) {
      const wrap       = this._wrap;
      const root       = this._root;
      const titleEl    = this._titleEl;
      const subtitleEl = this._subtitleEl;
      const legendEl   = this._legendEl;

      const W = wrap.clientWidth  || 600;
      const H = wrap.clientHeight || 360;
      applyBreakpoints(root, W, H);

      /* ── Fields ── */
      const dims    = queryResponse.fields.dimensions         || [];
      const meass   = queryResponse.fields.measures           || [];
      const tcs     = queryResponse.fields.table_calculations || [];
      const measAll = [...meass, ...tcs];

      const dimField   = dims[0]    || null;   // label / color grouping
      const xField     = measAll[0] || null;
      const yField     = measAll[1] || null;
      const sizeField  = measAll[2] || null;   // optional third measure

      // Title
      titleEl.textContent = config.title ||
        (xField && yField ? `${xField.label_short || xField.label} vs ${yField.label_short || yField.label}` : "Bubble Chart");
      subtitleEl.textContent = dimField ? (dimField.label_short || dimField.label) : "";

      /* ── Validate ── */
      if (!xField || !yField) {
        wrap.innerHTML = `<div class="rbu-empty">Add at least 2 measures — X axis, Y axis, and optionally a size measure.</div>`;
        legendEl.innerHTML = "";
        done();
        return;
      }

      /* ── Parse data into point objects ── */
      const colorMap = new Map();  // label → PALETTE color
      let paletteIdx = 0;

      const points = [];
      data.forEach((row, ri) => {
        const xv = numVal(row[xField.name]);
        const yv = numVal(row[yField.name]);
        if (xv == null || yv == null) return;

        const sv    = sizeField ? numVal(row[sizeField.name]) : null;
        const label = dimField
          ? (row[dimField.name]?.rendered ?? String(row[dimField.name]?.value ?? ""))
          : null;

        // Assign palette color per unique label
        const key = label ?? "__single__";
        if (!colorMap.has(key)) {
          colorMap.set(key, PALETTE[paletteIdx++ % PALETTE.length]);
        }

        points.push({ xv, yv, sv, label, color: colorMap.get(key), key, rowIdx: ri });
      });

      if (points.length === 0) {
        wrap.innerHTML = `<div class="rbu-empty">No data to display.</div>`;
        legendEl.innerHTML = "";
        done();
        return;
      }

      /* ── Axes / scales ── */
      const rMax = Math.max(5, Math.min(60, config.max_bubble_radius || 40));
      const rMin = Math.max(2, Math.min(rMax - 1, config.min_bubble_radius || 5));

      // X range with padding for bubbles
      const xVals   = points.map(p => p.xv);
      const xNice   = niceRange(Math.min(...xVals), Math.max(...xVals));
      const yVals   = points.map(p => p.yv);
      const yNice   = niceRange(Math.min(...yVals), Math.max(...yVals));

      // Size scale: area proportional (radius = sqrt of normalized value)
      const sVals   = points.map(p => p.sv).filter(v => v != null);
      const sMin    = sVals.length ? Math.min(...sVals) : 0;
      const sMax    = sVals.length ? Math.max(...sVals) : 1;
      const sRange  = sMax - sMin || 1;

      function bubbleRadius(sv) {
        if (sv == null || !sizeField) return (rMin + rMax) / 2;
        const t = Math.sqrt(Math.max(0, sv - sMin) / sRange);
        return rMin + (rMax - rMin) * t;
      }

      /* ── Chart margins ── */
      const MT = 16 + rMax;   // top  — room for tallest bubble
      const MR = 12 + rMax;   // right
      const MB = 46;           // bottom — X labels + axis title
      const ML = 54;           // left   — Y labels + axis title

      const chartW = W - ML - MR;
      const chartH = H - MT - MB;

      if (chartW < 40 || chartH < 40) { done(); return; }

      // Pixel scales
      const xScale = v => ML + (v - xNice.lo) / (xNice.hi - xNice.lo) * chartW;
      const yScale = v => MT + chartH - (v - yNice.lo) / (yNice.hi - yNice.lo) * chartH;

      /* ── Legend (only when a dimension is present and has multiple values) ── */
      if (dimField && colorMap.size > 1) {
        legendEl.style.display = "";
        const entries = [...colorMap.entries()];
        legendEl.innerHTML = entries.map(([lbl, col]) =>
          `<div class="rbu-leg-item" data-key="${esc(lbl)}">
            <div class="rbu-leg-dot" style="background:${esc(col)}"></div>
            <span class="rbu-leg-name">${esc(lbl)}</span>
          </div>`
        ).join("");

        legendEl.querySelectorAll(".rbu-leg-item").forEach(item => {
          item.addEventListener("click", e => {
            e.stopPropagation();
            const k = item.dataset.key;
            this._pinnedKey = this._pinnedKey === k ? null : k;
            this._applyStates();
          });
        });
      } else {
        legendEl.style.display = "none";
        legendEl.innerHTML = "";
      }

      /* ── SVG ── */
      wrap.innerHTML = "";
      const svg = svgEl("svg", { width: W, height: H,
        viewBox: `0 0 ${W} ${H}`, style: "display:block;" });
      wrap.appendChild(svg);

      /* ── Y gridlines + tick labels ── */
      yNice.pts.forEach(v => {
        const y = yScale(v);
        // Gridline
        svg.appendChild(svgEl("line", {
          class: "rbu-gridline",
          x1: ML, y1: y, x2: ML + chartW, y2: y,
        }));
        // Tick label
        const txt = svgEl("text", {
          class: "rbu-axis-label",
          x: ML - 6, y: y,
          "text-anchor": "end",
          "dominant-baseline": "middle",
        });
        txt.textContent = fmtAxis(v);
        svg.appendChild(txt);
      });

      /* ── X gridlines + tick labels ── */
      xNice.pts.forEach(v => {
        const x = xScale(v);
        svg.appendChild(svgEl("line", {
          class: "rbu-gridline",
          x1: x, y1: MT, x2: x, y2: MT + chartH,
        }));
        const txt = svgEl("text", {
          class: "rbu-axis-label",
          x: x, y: MT + chartH + 14,
          "text-anchor": "middle",
        });
        txt.textContent = fmtAxis(v);
        svg.appendChild(txt);
      });

      /* ── Axis lines ── */
      svg.appendChild(svgEl("line", {
        class: "rbu-axis-line",
        x1: ML, y1: MT, x2: ML, y2: MT + chartH,
      }));
      svg.appendChild(svgEl("line", {
        class: "rbu-axis-line",
        x1: ML, y1: MT + chartH, x2: ML + chartW, y2: MT + chartH,
      }));

      /* ── Axis titles ── */
      const xLabelText = config.x_label || (xField.label_short || xField.label);
      const yLabelText = config.y_label || (yField.label_short || yField.label);

      const xTitle = svgEl("text", {
        class: "rbu-axis-title",
        x: ML + chartW / 2,
        y: H - 6,
        "text-anchor": "middle",
      });
      xTitle.textContent = xLabelText;
      svg.appendChild(xTitle);

      const yTitle = svgEl("text", {
        class: "rbu-axis-title",
        x: 0, y: 0,
        "text-anchor": "middle",
        transform: `translate(13, ${MT + chartH / 2}) rotate(-90)`,
      });
      yTitle.textContent = yLabelText;
      svg.appendChild(yTitle);

      /* ── Bubbles ── */
      // Sort by radius descending so smaller bubbles render on top
      const sorted = [...points].sort((a, b) =>
        bubbleRadius(b.sv) - bubbleRadius(a.sv)
      );

      const self = this;
      this._bubbleEls = new Map();

      sorted.forEach((pt, pi) => {
        const cx = xScale(pt.xv);
        const cy = yScale(pt.yv);
        const r  = bubbleRadius(pt.sv);

        const g = svgEl("g", {
          class: "rbu-bubble",
          "data-key": pt.key,
          "data-row": pt.rowIdx,
          style: `animation-delay: ${pi * 18}ms`,
        });

        const circle = svgEl("circle", {
          cx, cy, r,
          fill: pt.color,
          "fill-opacity": "0.78",
        });
        // transform-origin for animation
        circle.style.transformOrigin = `${cx}px ${cy}px`;
        g.appendChild(circle);

        // Optional bubble label
        if (config.show_bubble_labels && pt.label && r >= 12) {
          const lbl = svgEl("text", {
            class: "rbu-bubble-label",
            x: cx, y: cy,
          });
          lbl.textContent = pt.label.length > 10 ? pt.label.slice(0, 9) + "…" : pt.label;
          g.appendChild(lbl);
        }

        svg.appendChild(g);
        this._bubbleEls.set(pt.key + "::" + pt.rowIdx, g);

        // Events
        g.addEventListener("mouseenter", e => {
          self._showTip(pt, xField, yField, sizeField, e);
          if (!self._pinnedKey) self._hoverGroup(pt.key);
        });
        g.addEventListener("mousemove",  e => { self._moveTip(e); });
        g.addEventListener("mouseleave", ()  => {
          if (!self._pinnedKey) {
            self._clearHover();
            self._hideTip();
          }
        });
        g.addEventListener("click", e => {
          e.stopPropagation();
          self._pinnedKey = self._pinnedKey === (pt.key + "::" + pt.rowIdx)
            ? null : pt.key + "::" + pt.rowIdx;
          if (self._pinnedKey) {
            self._showTip(pt, xField, yField, sizeField, e);
            self._hoverGroup(pt.key);
          } else {
            self._clearHover();
            self._hideTip();
          }
          self._applyStates();
        });
      });

      // Background click → clear
      svg.addEventListener("click", () => {
        self._pinnedKey = null;
        self._clearHover();
        self._hideTip();
        self._applyStates();
      });

      this._points = points;
      this._applyStates();
      done();
    },

    /* ── Tooltip ─────────────────────────────────────────────────────────── */
    _showTip(pt, xField, yField, sizeField, e) {
      const tip    = this._tip;
      const accent = tip.querySelector(".rbu-tt-accent");
      const body   = tip.querySelector(".rbu-tt-body");

      accent.style.background = pt.color;

      const xLabel = xField.label_short || xField.label;
      const yLabel = yField.label_short || yField.label;
      const rows   = [
        `<div class="rbu-tt-row"><span class="rbu-tt-key">${esc(xLabel)}</span><span class="rbu-tt-val">${esc(fmtNumber(pt.xv))}</span></div>`,
        `<div class="rbu-tt-row"><span class="rbu-tt-key">${esc(yLabel)}</span><span class="rbu-tt-val">${esc(fmtNumber(pt.yv))}</span></div>`,
      ];
      if (sizeField && pt.sv != null) {
        const sLabel = sizeField.label_short || sizeField.label;
        rows.push(`<div class="rbu-tt-row"><span class="rbu-tt-key">${esc(sLabel)}</span><span class="rbu-tt-val">${esc(fmtNumber(pt.sv))}</span></div>`);
      }

      body.innerHTML = `
        <div class="rbu-tt-header">
          <div class="rbu-tt-dot" style="background:${esc(pt.color)}"></div>
          <span class="rbu-tt-label">${esc(pt.label || "Value")}</span>
        </div>
        ${rows.join("")}`;

      tip.classList.add("visible");
      this._moveTip(e);
    },

    _moveTip(e) {
      const tip = this._tip;
      const mx = e.clientX, my = e.clientY;
      const tw = tip.offsetWidth  || 200;
      const th = tip.offsetHeight || 80;
      const vw = window.innerWidth, vh = window.innerHeight;
      const off = 14;
      let tx = mx + off, ty = my - th / 2;
      if (tx + tw > vw - 8) tx = mx - tw - off;
      if (ty < 8)            ty = 8;
      if (ty + th > vh - 8)  ty = vh - th - 8;
      tip.style.left = tx + "px";
      tip.style.top  = ty + "px";
    },

    _hideTip() { this._tip.classList.remove("visible"); },

    /* ── Interactions ────────────────────────────────────────────────────── */
    _hoverGroup(key) {
      if (!this._bubbleEls) return;
      this._bubbleEls.forEach((g, k) => {
        const gKey = k.split("::")[0];
        g.classList.toggle("dimmed", gKey !== key);
      });
      // Legend
      this._legendEl.querySelectorAll(".rbu-leg-item").forEach(item => {
        item.classList.toggle("dimmed", item.dataset.key !== key);
      });
    },

    _clearHover() {
      if (!this._bubbleEls) return;
      this._bubbleEls.forEach(g => g.classList.remove("dimmed", "pinned"));
      this._legendEl.querySelectorAll(".rbu-leg-item").forEach(item => {
        item.classList.remove("dimmed", "pinned");
      });
    },

    _applyStates() {
      if (!this._pinnedKey) { this._clearHover(); return; }
      // Pinned key is either a group key (from legend click) or "group::rowIdx"
      const groupKey = this._pinnedKey.includes("::")
        ? this._pinnedKey.split("::")[0]
        : this._pinnedKey;
      this._hoverGroup(groupKey);
      // Mark pinned bubble specifically
      if (this._bubbleEls) {
        const el = this._bubbleEls.get(this._pinnedKey);
        if (el) el.classList.add("pinned");
      }
    },

    /* ── destroy ─────────────────────────────────────────────────────────── */
    destroy() {
      if (this._ro)  this._ro.disconnect();
      if (this._tip) this._tip.remove();
      clearTimeout(this._debounceTimer);
    },
  });

})();
