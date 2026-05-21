/**
 * Rocket Software — Tree Map
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add the URL.
 *   3. Select "Rocket — Tree Map" from the visualization picker.
 *
 * Supports:
 *   - One dimension + one measure  → flat treemap by dimension
 *   - Squarified layout for optimal aspect ratios
 *   - Responsive labels (hidden when tile is too small)
 *   - Hover highlights and tooltip
 *   - Click-to-pin selection
 *
 * Version: 1.0.0  |  May 2025
 */

(function () {
  "use strict";

  /* ─── Brand tokens ────────────────────────────────────────────────────── */
  const T = {
    bg:   "transparent",
    surf: "rgba(120,120,200,.10)",
    bo:   "rgba(100,65,210,.22)",
    tx:   "#E2E2FF",
    mt:   "#9898C8",
    B:    "#3B7EF6",
    P:    "#7B3FE4",
    K:    "#D9349A",
    ok:   "#2DD4A0",
    wn:   "#F0A830",
    er:   "#F06060",
  };

  /* ─── Color palette — blue → purple → pink brand family ─────────────── */
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

  /* ─── CSS ─────────────────────────────────────────────────────────────── */
  const CSS = `
    .rtm-root {
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

    .rtm-topbar {
      background: ${T.surf};
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);

      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo};
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      flex-shrink: 0;
    }
    .rtm-topbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .rtm-logo        { width: 20px; height: 20px; flex-shrink: 0; opacity: .85; }
    .rtm-title {
      font-size: 14px; font-weight: 500; color: ${T.tx};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rtm-subtitle { font-size: 11px; color: ${T.mt}; white-space: nowrap; flex-shrink: 0; }

    .rtm-gline {
      height: 2px;
      background: linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K});
      background-size: 200% 100%;
      flex-shrink: 0;
      animation: rtm-grad-flow 5s ease-in-out infinite alternate;
    }
    @keyframes rtm-grad-flow {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }

    .rtm-body {
      flex: 1; min-height: 0;
      padding: 8px 10px 8px;
      box-sizing: border-box;
      overflow: hidden;
    }
    .rtm-body svg { display: block; border-radius: 6px; overflow: hidden; }

    /* ── Tiles ── */
    .rtm-tile {
      cursor: pointer;
      transition: filter .15s, opacity .15s;
    }
    .rtm-tile rect {
      transition: fill-opacity .15s;
    }
    .rtm-tile:hover rect { fill-opacity: 1 !important; }
    .rtm-tile.dimmed { opacity: .25; }
    .rtm-tile.pinned rect {
      fill-opacity: 1 !important;
      stroke: rgba(255,255,255,0.5) !important;
      stroke-width: 2 !important;
    }

    /* Tile label text */
    .rtm-tile-label {
      font-family: 'Inter', system-ui, sans-serif;
      pointer-events: none;
      dominant-baseline: middle;
      text-anchor: middle;
    }
    .rtm-tile-name { fill: rgba(255,255,255,.92); font-weight: 500; }
    .rtm-tile-val  { fill: rgba(255,255,255,.55); }
    .rtm-tile-pct  { fill: rgba(255,255,255,.45); }

    /* ── Tooltip ── */
    .rtm-tooltip {
      position: fixed;
      pointer-events: none;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: rgba(13,13,34,0.94);
      border: 1px solid rgba(100,65,210,.38);
      border-radius: 10px;
      padding: 0;
      overflow: hidden;
      z-index: 9999;
      opacity: 0;
      transform: translateY(6px) scale(0.97);
      transition: opacity .15s ease, transform .15s ease;
      box-shadow: 0 8px 32px rgba(0,0,0,.40), 0 0 0 1px rgba(123,63,228,.08);
      min-width: 148px; max-width: 240px;
    }
    .rtm-tooltip.visible { opacity: 1; transform: translateY(0) scale(1); }
    .rtm-tt-accent { height: 3px; background: ${T.P}; }
    .rtm-tt-body   { padding: 10px 14px 13px; }
    .rtm-tt-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
    .rtm-tt-dot    { width: 8px; height: 8px; border-radius: 2px; background: ${T.P}; flex-shrink: 0; }
    .rtm-tt-label  { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.1px; color: #7878A8; }
    .rtm-tt-value  { font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; color: ${T.tx}; letter-spacing: -0.5px; line-height: 1; margin-bottom: 3px; }
    .rtm-tt-pct    { font-size: 11px; color: ${T.mt}; }
    .rtm-tt-sep    { height: 1px; background: rgba(100,65,210,.2); margin: 7px 0 5px; }
    .rtm-tt-row    { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 3px; }
    .rtm-tt-key    { font-size: 10px; color: ${T.mt}; white-space: nowrap; }
    .rtm-tt-xval   { font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; color: ${T.tx}; }

    /* ── Empty ── */
    .rtm-empty { color: ${T.mt}; font-size: 13px; text-align: center; padding: 20px; }

    /* ── Responsive ── */
    .rtm-root[data-w="xs"] .rtm-topbar   { padding: 7px 10px; }
    .rtm-root[data-w="xs"] .rtm-title    { font-size: 12px; }
    .rtm-root[data-w="xs"] .rtm-subtitle { display: none; }
    .rtm-root[data-w="xs"] .rtm-body     { padding: 4px 5px; }
    .rtm-root[data-w="sm"] .rtm-subtitle { display: none; }
    .rtm-root[data-h="xs"] .rtm-topbar   { display: none; }
    .rtm-root[data-h="xs"] .rtm-gline    { display: none; }
    .rtm-root[data-h="xs"] .rtm-body     { padding: 2px 3px; }
    .rtm-root[data-h="sm"] .rtm-topbar   { padding: 6px 12px; }
  


    /* ─── Light-mode override (prefers-color-scheme: light) ────────────── */
    @media (prefers-color-scheme: light) {
      .rtm-title { color: #1A1A3A; }
      .rtm-subtitle,
      .rtm-empty { color: #6060A0; }
    }
  
  `;

  /* ─── Logo ────────────────────────────────────────────────────────────── */
  const LOGO_SVG = `
    <svg class="rtm-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rtm-lg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${T.B}"/>
          <stop offset="50%"  stop-color="${T.P}"/>
          <stop offset="100%" stop-color="${T.K}"/>
        </linearGradient>
      </defs>
      <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
            stroke="url(#rtm-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6 L19 6 L19 11"
            stroke="url(#rtm-lg)" stroke-width="2.4" fill="none"
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

  function applyBreakpoints(root, w, h) {
    root.setAttribute("data-w", w < 240 ? "xs" : w < 380 ? "sm" : w < 560 ? "md" : "lg");
    root.setAttribute("data-h", h < 100 ? "xs" : h < 180 ? "sm" : "lg");
  }

  /**
   * Squarified treemap layout.
   * Returns [{...item, x, y, w, h}] for all items.
   */
  function squarify(items, x0, y0, w0, h0) {
    const results = [];
    if (!items.length || w0 <= 0 || h0 <= 0) return results;

    const totalVal = items.reduce((s, d) => s + d.val, 0);
    if (totalVal <= 0) return results;

    /* Normalize areas to fit exactly in w0*h0 */
    const scale = (w0 * h0) / totalVal;
    const norm  = items.slice().sort((a, b) => b.val - a.val)
                        .map(d => ({ ...d, _a: d.val * scale }));

    function worst(row, side) {
      const s   = row.reduce((a, d) => a + d._a, 0);
      const mx  = row.reduce((a, d) => Math.max(a, d._a), 0);
      const mn  = row.reduce((a, d) => Math.min(a, d._a), Infinity);
      if (mn <= 0) return Infinity;
      return Math.max(
        (side * side * mx) / (s * s),
        (s * s) / (side * side * mn)
      );
    }

    function flushRow(row, cx, cy, cw, ch) {
      const rowArea = row.reduce((a, d) => a + d._a, 0);
      if (cw <= ch) {
        /* Tall rectangle → lay a horizontal strip across the full width,
           items placed left-to-right inside it.                          */
        const stripH = cw > 0 ? rowArea / cw : 0;
        let rx = cx;
        row.forEach(d => {
          const dw = stripH > 0 ? d._a / stripH : 0;
          results.push({ ...d, x: rx, y: cy, w: dw, h: stripH });
          rx += dw;
        });
        return { nx: cx, ny: cy + stripH, nw: cw, nh: ch - stripH };
      } else {
        /* Wide rectangle → lay a vertical strip down the full height,
           items placed top-to-bottom inside it.                          */
        const stripW = ch > 0 ? rowArea / ch : 0;
        let ry = cy;
        row.forEach(d => {
          const dh = stripW > 0 ? d._a / stripW : 0;
          results.push({ ...d, x: cx, y: ry, w: stripW, h: dh });
          ry += dh;
        });
        return { nx: cx + stripW, ny: cy, nw: cw - stripW, nh: ch };
      }
    }

    let cx = x0, cy = y0, cw = w0, ch = h0;
    let row = [];
    let i   = 0;

    while (i < norm.length) {
      const side = Math.min(cw, ch);
      if (side <= 0) break;
      const item   = norm[i];
      const newRow = [...row, item];

      if (row.length === 0 || worst(newRow, side) <= worst(row, side)) {
        row.push(item);
        i++;
      } else {
        const { nx, ny, nw, nh } = flushRow(row, cx, cy, cw, ch);
        cx = nx; cy = ny; cw = nw; ch = nh;
        row = [];
      }
    }
    if (row.length) flushRow(row, cx, cy, cw, ch);
    return results;
  }

  /* ─── Viz definition ──────────────────────────────────────────────────── */


  looker.plugins.visualizations.add({
    id:    "rocket_treemap_tr",
    label: "Rocket — Tree Map",

    options: {
      title_override: {
        type: "string", label: "Chart title override", default: "",
        placeholder: "Leave blank to derive from fields",
        section: "Style", order: 1,
      },
      show_labels: {
        type: "boolean", label: "Show labels in tiles",
        default: true, section: "Style", order: 2,
      },
      show_percentages: {
        type: "boolean", label: "Show percentage in tiles",
        default: true, section: "Style", order: 3,
      },
      show_values: {
        type: "boolean", label: "Show values in tiles",
        default: true, section: "Style", order: 4,
      },
      label_min_size: {
        type: "number", label: "Min tile size to show label (px)",
        default: 32, section: "Style", order: 5,
      },
      tile_gap: {
        type: "number", label: "Gap between tiles (px)",
        default: 2, section: "Style", order: 6,
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
        default: "full", section: "Style", order: 7,
      },
      line_thickness: {
        type: "string", label: "Accent line thickness", display: "select",
        values: [
          { "Thin (1px)": "1" }, { "Default (2px)": "2" },
          { "Medium (3px)": "3" }, { "Bold (4px)": "4" },
        ],
        default: "2", section: "Style", order: 8,
      },
    },

    /* ── Create ── */
    create: function (element) {
      const style = document.createElement("style");
      style.textContent = CSS;
      element.appendChild(style);

      element.insertAdjacentHTML("beforeend", `
        <div class="rtm-root" id="rtm-root" data-w="lg" data-h="lg">
          <div class="rtm-topbar">
            <div class="rtm-topbar-left">
              ${LOGO_SVG}
              <span class="rtm-title" id="rtm-title">Chart</span>
            </div>
            <span class="rtm-subtitle" id="rtm-subtitle"></span>
          </div>
          <div class="rtm-gline" id="rtm-gline"></div>
          <div class="rtm-body" id="rtm-body">
            <div class="rtm-empty">Loading…</div>
          </div>
        </div>
        <div class="rtm-tooltip" id="rtm-tooltip">
          <div class="rtm-tt-accent" id="rtm-tt-accent"></div>
          <div class="rtm-tt-body">
            <div class="rtm-tt-header">
              <span class="rtm-tt-dot" id="rtm-tt-dot"></span>
              <span class="rtm-tt-label" id="rtm-tt-label"></span>
            </div>
            <div class="rtm-tt-value" id="rtm-tt-value"></div>
            <div class="rtm-tt-pct"   id="rtm-tt-pct"></div>
            <div id="rtm-tt-extras" style="display:none"></div>
          </div>
        </div>
      `);

      /* Tooltip follow-mouse */
      element.addEventListener("mousemove", (e) => {
        const tt = element.querySelector(".rtm-tooltip");
        if (!tt) return;
        const pad = 14, tw = tt.offsetWidth || 140, th = tt.offsetHeight || 60;
        let tx = e.clientX + pad, ty = e.clientY + pad;
        if (tx + tw > window.innerWidth  - 8) tx = e.clientX - tw - pad;
        if (ty + th > window.innerHeight - 8) ty = e.clientY - th - pad;
        tt.style.left = tx + "px";
        tt.style.top  = ty + "px";
      });

      if (this._pinnedIdx === undefined) this._pinnedIdx = null;

      /* ResizeObserver */
      if (typeof ResizeObserver !== "undefined") {
        this._ro = new ResizeObserver(entries => {
          const { width, height } = entries[0].contentRect;
          const root = element.querySelector("#rtm-root");
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

      const root    = element.querySelector("#rtm-root");
      const body    = element.querySelector("#rtm-body");
      const gline   = element.querySelector("#rtm-gline");
      const tooltip = element.querySelector("#rtm-tooltip");
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

      /* ── Fields ── */
      const dims  = queryResponse.fields.dimensions         || [];
      const meas  = queryResponse.fields.measures           || [];
      const calcs = queryResponse.fields.table_calculations || [];
      const allMeasures = [...meas, ...calcs];

      if (!dims.length || !allMeasures.length || !data.length) {
        body.innerHTML = `<div class="rtm-empty">Add one dimension and one measure to display a treemap.</div>`;
        done(); return;
      }

      const dimField  = dims[0];
      const measField = allMeasures[0];

      /* ── Build raw items ── */
      const extraFields = allMeasures.slice(1); // measures beyond the sizing one
      let items = data.map((row, i) => {
        const label  = String(cellVal(row[dimField.name]) ?? "—");
        const val    = parseFloat(row[measField.name]?.value) || 0;
        const extras = extraFields.map(mf => {
          const cell = row[mf.name];
          const disp = cell
            ? (cell.rendered != null ? cell.rendered : (cell.value != null ? fmtNumber(parseFloat(cell.value)) : "—"))
            : "—";
          return { label: mf.label_short || mf.label || mf.name, disp };
        });
        return { label, val, idx: i, extras };
      }).filter(d => d.val > 0);

      if (!items.length) {
        body.innerHTML = `<div class="rtm-empty">No positive values to display.</div>`;
        done(); return;
      }

      const total = items.reduce((s, d) => s + d.val, 0);

      /* Assign colors */
      items.sort((a, b) => b.val - a.val);
      items.forEach((d, i) => { d.color = PALETTE[i % PALETTE.length]; });

      /* Guard pinned index */
      if (this._pinnedIdx !== null && this._pinnedIdx >= items.length) {
        this._pinnedIdx = null;
      }
      const vis = this;

      /* ── Title ── */
      const measLabel  = measField.label_short || measField.label || measField.name;
      const dimLabel   = dimField.label_short  || dimField.label  || dimField.name;
      const chartTitle = config.title_override || (measLabel + " by " + dimLabel);
      element.querySelector("#rtm-title").textContent    = chartTitle;
      element.querySelector("#rtm-subtitle").textContent = items.length + " segments";

      /* ── Layout ── */
      const headerH = element.querySelector(".rtm-topbar")?.offsetHeight || 40;
      const glineH  = parseInt(config.line_thickness || "2");
      const bodyPad = 16;
      const svgW    = Math.max(40, tileW  - bodyPad);
      const svgH    = Math.max(20, tileH  - headerH - glineH - bodyPad);

      const gap         = Math.max(0, Math.min(4, config.tile_gap ?? 2));
      const showLabels  = config.show_labels !== false;
      const showPct     = config.show_percentages !== false;
      const showVals    = config.show_values !== false;
      const labelMinSz  = Math.max(10, config.label_min_size || 32);

      /* Run squarify */
      const tiles = squarify(items, 0, 0, svgW, svgH);

      /* ── SVG construction ── */
      let tileEls = "";
      tiles.forEach((t, i) => {
        const rx = t.x + gap / 2;
        const ry = t.y + gap / 2;
        const rw = Math.max(0, t.w - gap);
        const rh = Math.max(0, t.h - gap);
        const pct = ((t.val / total) * 100).toFixed(1) + "%";
        const cx  = rx + rw / 2;

        /* Decide which labels to show based on available space */
        const showName = showLabels && rw >= labelMinSz && rh >= labelMinSz * 0.7;
        const showVal  = showVals   && showName && rh > labelMinSz * 1.4 && rw > 40;
        const showPctEl= showPct    && showName && rh > labelMinSz * 1.9 && rw > 40;

        /* Vertical centering based on how many lines we're showing */
        const lineCount = (showName ? 1 : 0) + (showVal ? 1 : 0) + (showPctEl ? 1 : 0);
        const lineH     = 13;
        const totalTH   = lineCount * lineH;
        const startY    = ry + rh / 2 - totalTH / 2 + lineH / 2;

        /* Name font size scales with tile size */
        const nameFontSz = Math.max(9, Math.min(13, Math.floor(Math.min(rw / 8, rh / 3))));
        const maxNameChars = Math.max(3, Math.floor(rw / (nameFontSz * 0.62)));
        const truncName    = t.label.length > maxNameChars
          ? t.label.slice(0, maxNameChars - 1) + "…"
          : t.label;

        let labels = "";
        let ly = startY;
        if (showName) {
          labels += `<text class="rtm-tile-label rtm-tile-name"
                          x="${cx.toFixed(1)}" y="${ly.toFixed(1)}"
                          font-size="${nameFontSz}"
                          >${esc(truncName)}</text>`;
          ly += lineH;
        }
        if (showVal) {
          labels += `<text class="rtm-tile-label rtm-tile-val"
                          x="${cx.toFixed(1)}" y="${ly.toFixed(1)}"
                          font-size="9">${fmtNumber(t.val)}</text>`;
          ly += lineH;
        }
        if (showPctEl) {
          labels += `<text class="rtm-tile-label rtm-tile-pct"
                          x="${cx.toFixed(1)}" y="${ly.toFixed(1)}"
                          font-size="9">${pct}</text>`;
        }

        tileEls += `
          <g class="rtm-tile" data-idx="${i}"
             style="animation: rtm-fade-in .4s ease ${(i * 0.025).toFixed(3)}s both">
            <rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}"
                  width="${rw.toFixed(1)}" height="${rh.toFixed(1)}"
                  fill="${t.color}" fill-opacity="0.83"
                  rx="3" stroke="none"/>
            ${labels}
          </g>`;
      });

      /* ── Render ── */
      body.innerHTML = `
        <svg id="rtm-svg"
             width="${svgW}" height="${svgH}"
             viewBox="0 0 ${svgW} ${svgH}"
             xmlns="http://www.w3.org/2000/svg"
             role="img"
             aria-label="${esc(chartTitle)}">
          <style>
            @keyframes rtm-fade-in { from { opacity:0; } to { opacity:1; } }
          </style>
          ${tileEls}
        </svg>
      `;

      /* ── Interactions ── */
      const svgEl   = body.querySelector("#rtm-svg");
      const ttDot    = tooltip?.querySelector("#rtm-tt-dot");
      const ttAccent = tooltip?.querySelector("#rtm-tt-accent");
      const ttLabel  = tooltip?.querySelector("#rtm-tt-label");
      const ttValue  = tooltip?.querySelector("#rtm-tt-value");
      const ttPct    = tooltip?.querySelector("#rtm-tt-pct");
      const ttExtras = tooltip?.querySelector("#rtm-tt-extras");

      function showTooltip(item) {
        const pct = ((item.val / total) * 100).toFixed(1) + "%";
        if (ttDot)    ttDot.style.background    = item.color;
        if (ttAccent) ttAccent.style.background = item.color;
        if (ttLabel)  ttLabel.textContent = item.label;
        if (ttValue)  ttValue.textContent = fmtNumber(item.val);
        if (ttPct)    ttPct.textContent   = fmtNumber(item.val) + "  ·  " + pct + " of total";
        if (ttExtras) {
          if (item.extras && item.extras.length) {
            ttExtras.innerHTML = `<div class="rtm-tt-sep"></div>` +
              item.extras.map(e =>
                `<div class="rtm-tt-row">
                  <span class="rtm-tt-key">${esc(e.label)}</span>
                  <span class="rtm-tt-xval">${esc(String(e.disp))}</span>
                </div>`
              ).join("");
            ttExtras.style.display = "";
          } else {
            ttExtras.innerHTML = "";
            ttExtras.style.display = "none";
          }
        }
        tooltip?.classList.add("visible");
      }

      function hideTooltip() { tooltip?.classList.remove("visible"); }

      function applyPinState() {
        const pi = vis._pinnedIdx;
        svgEl?.querySelectorAll(".rtm-tile").forEach(g => {
          const gi = parseInt(g.dataset.idx, 10);
          g.classList.toggle("dimmed", pi !== null && gi !== pi);
          g.classList.toggle("pinned", pi !== null && gi === pi);
        });
        if (pi === null) hideTooltip();
        else if (items[pi]) showTooltip(items[pi]);
      }

      function togglePin(idx) {
        vis._pinnedIdx = (vis._pinnedIdx === idx) ? null : idx;
        applyPinState();
      }

      svgEl?.querySelectorAll(".rtm-tile").forEach(g => {
        const idx  = parseInt(g.dataset.idx, 10);
        const item = items[idx];
        if (!item) return;

        g.addEventListener("mouseenter", () => {
          if (vis._pinnedIdx === null) {
            svgEl.querySelectorAll(".rtm-tile").forEach(t => {
              t.classList.toggle("dimmed", parseInt(t.dataset.idx, 10) !== idx);
            });
            showTooltip(item);
          }
        });
        g.addEventListener("mouseleave", () => {
          if (vis._pinnedIdx === null) {
            svgEl.querySelectorAll(".rtm-tile").forEach(t => t.classList.remove("dimmed"));
            hideTooltip();
          }
        });
        g.addEventListener("click", (e) => {
          e.stopPropagation();
          togglePin(idx);
        });
      });

      svgEl?.addEventListener("click", () => {
        if (vis._pinnedIdx !== null) {
          vis._pinnedIdx = null;
          applyPinState();
        }
      });

      applyPinState();
      done();
    },
  });
})();
