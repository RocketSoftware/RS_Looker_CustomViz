/**
 * Rocket Software — Single Value KPI Component (Numeric)
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add a new visualization and paste the URL.
 *   3. In any Explore, select "Rocket — Single Value (Number)" from the visualization picker.
 *
 * Supports:
 *   - Single measure → value only
 *   - Two measures   → first = value, second = comparison (delta computed automatically)
 *   - Table calc     → auto-detected as delta if it contains "%" or "change" in its name
 *   - Date dimension + measure → sparkline rendered in bottom-right corner
 *   - Fully responsive: adapts padding, font size, and chrome at any tile size
 *
 * Version: 1.1.0  |  May 2025
 */

(function () {
  "use strict";

  /* ─── Brand tokens ────────────────────────────────────────────────────── */
  const T = {
    bg:   "#05050E",
    surf: "#09091C",
    bo:   "rgba(100,65,210,.22)",
    tx:   "#E2E2FF",
    mt:   "#595985",
    B:    "#3B7EF6",
    P:    "#7B3FE4",
    K:    "#D9349A",
    ok:   "#2DD4A0",
    er:   "#F06060",
  };

  /* ─── Gradient presets for the accent line ────────────────────────────── */
  const GRAD = {
    "blue":         T.B,
    "blue-purple":  `linear-gradient(90deg, ${T.B}, #6040EC)`,
    "purple":       T.P,
    "purple-pink":  `linear-gradient(90deg, ${T.P}, #B038C8)`,
    "pink":         T.K,
    "full":         `linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K})`,
  };

  /* ─── Injected CSS ────────────────────────────────────────────────────── */
  const CSS = `
    .sv-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: ${T.bg};
      background-image:
        repeating-linear-gradient(
          135deg,
          rgba(100,65,210,.03) 0,
          rgba(100,65,210,.03) 1px,
          transparent 1px,
          transparent 18px
        ),
        repeating-linear-gradient(
          45deg,
          rgba(59,126,246,.025) 0,
          rgba(59,126,246,.025) 1px,
          transparent 1px,
          transparent 18px
        );
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
    }

    .sv-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 28px 32px 22px;
      position: relative;
      box-sizing: border-box;
    }

    .sv-logo {
      position: absolute;
      top: 18px;
      right: 22px;
      width: 20px;
      height: 20px;
      opacity: 0.28;
      flex-shrink: 0;
    }

    .sv-label {
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1.3px;
      color: ${T.mt};
      margin-bottom: 14px;
      line-height: 1;
    }

    .sv-value-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 14px;
      line-height: 1;
    }

    .sv-prefix,
    .sv-suffix {
      font-weight: 400;
      color: ${T.mt};
      line-height: 1;
    }

    .sv-value {
      font-weight: 500;
      color: ${T.tx};
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    /* Fixed size tiers driven by data-size on sv-root */
    .sv-root[data-size="sm"]   .sv-value { font-size: 36px; }
    .sv-root[data-size="sm"]   .sv-prefix,
    .sv-root[data-size="sm"]   .sv-suffix { font-size: 20px; }
    .sv-root[data-size="md"]   .sv-value { font-size: 52px; }
    .sv-root[data-size="md"]   .sv-prefix,
    .sv-root[data-size="md"]   .sv-suffix { font-size: 28px; }
    .sv-root[data-size="lg"]   .sv-value { font-size: 68px; }
    .sv-root[data-size="lg"]   .sv-prefix,
    .sv-root[data-size="lg"]   .sv-suffix { font-size: 36px; }
    .sv-root[data-size="xl"]   .sv-value { font-size: 88px; }
    .sv-root[data-size="xl"]   .sv-prefix,
    .sv-root[data-size="xl"]   .sv-suffix { font-size: 46px; }

    /* Auto size: driven by CSS custom property set by ResizeObserver */
    .sv-root[data-size="auto"] .sv-value {
      font-size: var(--sv-auto-fs, 52px);
    }
    .sv-root[data-size="auto"] .sv-prefix,
    .sv-root[data-size="auto"] .sv-suffix {
      font-size: var(--sv-auto-pre, 28px);
    }

    .sv-delta {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 13px;
      line-height: 1;
    }

    .sv-arrow-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 9px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: 500;
    }

    .sv-arrow-badge.up-good   { background: rgba(45,212,160,.14); color: ${T.ok}; }
    .sv-arrow-badge.up-bad    { background: rgba(240,96,96,.14);  color: ${T.er}; }
    .sv-arrow-badge.down-good { background: rgba(45,212,160,.14); color: ${T.ok}; }
    .sv-arrow-badge.down-bad  { background: rgba(240,96,96,.14);  color: ${T.er}; }
    .sv-arrow-badge.neutral   { background: rgba(100,65,210,.14); color: #A8A8D0; }

    .sv-delta-label {
      font-size: 12px;
      color: ${T.mt};
    }

    .sv-sparkline-wrap {
      position: absolute;
      right: 24px;
      bottom: 28px;
      line-height: 0;
    }

    .sv-sparkline-wrap svg { display: block; }

    .sv-line {
      height: 2px;
      width: 100%;
      flex-shrink: 0;
      background-size: 200% 100%;
      animation: sv-grad-flow 5s ease-in-out infinite alternate;
    }

    @keyframes sv-grad-flow {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }

    /* ── Responsive: width breakpoints via data-w on sv-root ── */

    /* Narrow: < 260px wide */
    .sv-root[data-w="xs"] .sv-body { padding: 14px 16px 12px; }
    .sv-root[data-w="xs"] .sv-label { font-size: 9px; letter-spacing: 0.7px; margin-bottom: 8px; }
    .sv-root[data-w="xs"] .sv-delta { display: none; }
    .sv-root[data-w="xs"] .sv-sparkline-wrap { display: none; }
    .sv-root[data-w="xs"] .sv-logo { width: 14px; height: 14px; top: 10px; right: 12px; }
    .sv-root[data-w="xs"] .sv-value-row { margin-bottom: 0; }

    /* Small: 260–380px wide */
    .sv-root[data-w="sm"] .sv-body { padding: 20px 22px 16px; }
    .sv-root[data-w="sm"] .sv-label { font-size: 10px; margin-bottom: 10px; }
    .sv-root[data-w="sm"] .sv-sparkline-wrap { display: none; }
    .sv-root[data-w="sm"] .sv-value-row { margin-bottom: 10px; }

    /* Medium: 380–560px wide */
    .sv-root[data-w="md"] .sv-body { padding: 24px 28px 18px; }

    /* ── Responsive: height breakpoints via data-h on sv-root ── */

    /* Very short: < 110px tall — show only the value */
    .sv-root[data-h="xs"] .sv-label { display: none; }
    .sv-root[data-h="xs"] .sv-delta { display: none; }
    .sv-root[data-h="xs"] .sv-sparkline-wrap { display: none; }
    .sv-root[data-h="xs"] .sv-body { padding: 8px 16px; justify-content: center; }
    .sv-root[data-h="xs"] .sv-value-row { margin-bottom: 0; }

    /* Short: 110–160px tall — hide comparison label text */
    .sv-root[data-h="sm"] .sv-delta-label { display: none; }
    .sv-root[data-h="sm"] .sv-sparkline-wrap { display: none; }
    .sv-root[data-h="sm"] .sv-body { padding: 12px 24px 10px; }
    .sv-root[data-h="sm"] .sv-value-row { margin-bottom: 8px; }
    .sv-root[data-h="sm"] .sv-label { margin-bottom: 8px; }
  `;

  /* ─── SVG logo mark ───────────────────────────────────────────────────── */
  const LOGO = `
    <svg class="sv-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sv-lg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${T.B}"/>
          <stop offset="50%"  stop-color="${T.P}"/>
          <stop offset="100%" stop-color="${T.K}"/>
        </linearGradient>
      </defs>
      <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
            stroke="url(#sv-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6 L19 6 L19 11"
            stroke="url(#sv-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  /* ─── Helpers ─────────────────────────────────────────────────────────── */

  /** Escape HTML entities. */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  /** Extract the best display string from a Looker cell. */
  function cellVal(cell) {
    if (cell == null) return null;
    return cell.rendered != null ? cell.rendered : cell.value;
  }

  /** Format a raw number with optional prefix/suffix. */
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

  /** Detect whether a field looks like a percentage change/delta. */
  function isDeltaLike(field) {
    const n = (field.name + " " + (field.label || "")).toLowerCase();
    return n.includes("change") || n.includes("delta") || n.includes("diff") ||
           n.includes("growth") || n.includes("vs") || n.includes("prior") ||
           n.includes("percent") || field.value_format === "%";
  }

  /**
   * Compute auto font size from container dimensions.
   * Returns [valueFontSize, prefixSuffixFontSize] in px.
   */
  function autoSize(w, h) {
    // Scale to fill roughly 40% of the shorter axis, clamped to a readable range
    const base = Math.min(w * 0.42, h * 0.42);
    const fs   = Math.max(22, Math.min(112, Math.round(base)));
    return [fs, Math.round(fs * 0.52)];
  }

  /**
   * Apply width/height breakpoint attributes and (if auto) font-size custom properties.
   * Called by ResizeObserver.
   */
  function applyBreakpoints(root, w, h) {
    root.setAttribute("data-w",
      w < 260 ? "xs" : w < 380 ? "sm" : w < 560 ? "md" : "lg"
    );
    root.setAttribute("data-h",
      h < 110 ? "xs" : h < 160 ? "sm" : "lg"
    );
    if (root.getAttribute("data-size") === "auto") {
      const [fs, pre] = autoSize(w, h);
      root.style.setProperty("--sv-auto-fs",  fs  + "px");
      root.style.setProperty("--sv-auto-pre", pre + "px");
    }
  }

  /** Build a compact SVG sparkline from an array of numbers. */
  function buildSparkline(values, w, h, strokeColor) {
    if (!values || values.length < 2) return "";
    const nums = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (nums.length < 2) return "";
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const range = max - min || 1;
    const pad = 3;
    const pts = nums.map((v, i) => {
      const x = pad + (i / (nums.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const areaBottom = h - pad;
    const areaPath = `M${pts[0]} L${pts.join(" L")} L${pts[pts.length - 1].split(",")[0]},${areaBottom} L${pts[0].split(",")[0]},${areaBottom} Z`;

    return `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"
           xmlns="http://www.w3.org/2000/svg"
           role="img" aria-label="Sparkline trend">
        <defs>
          <linearGradient id="sv-spk-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="${strokeColor}" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="sv-spk-s" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stop-color="${T.B}"/>
            <stop offset="50%"  stop-color="${T.P}"/>
            <stop offset="100%" stop-color="${T.K}"/>
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#sv-spk-g)"/>
        <polyline
          points="${pts.join(" ")}"
          fill="none"
          stroke="url(#sv-spk-s)"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"/>
        <circle
          cx="${pts[pts.length-1].split(",")[0]}"
          cy="${pts[pts.length-1].split(",")[1]}"
          r="2.5"
          fill="${T.K}"/>
      </svg>`;
  }

  /* ─── Looker visualization definition ────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_single_value",
    label: "Rocket — Single Value (Number)",

    options: {
      title_override: {
        type:        "string",
        label:       "Label override",
        default:     "",
        placeholder: "Leave blank to use field label",
        section:     "Value",
        order:       1,
      },
      value_prefix: {
        type:    "string",
        label:   "Prefix (e.g. $)",
        default: "",
        section: "Value",
        order:   2,
      },
      value_suffix: {
        type:    "string",
        label:   "Suffix (e.g. M, %)",
        default: "",
        section: "Value",
        order:   3,
      },
      auto_format: {
        type:    "boolean",
        label:   "Auto-format large numbers (K / M / B)",
        default: true,
        section: "Value",
        order:   4,
      },
      font_size: {
        type:    "string",
        label:   "Value size",
        display: "select",
        values:  [
          { "Auto (fills tile)": "auto" },
          { Small:               "sm"   },
          { Medium:              "md"   },
          { Large:               "lg"   },
          { "Extra large":       "xl"   },
        ],
        default: "auto",
        section: "Value",
        order:   5,
      },
      comparison_label: {
        type:        "string",
        label:       "Comparison label",
        default:     "vs. prior period",
        placeholder: "e.g. vs. last quarter",
        section:     "Comparison",
        order:       6,
      },
      positive_is_good: {
        type:    "boolean",
        label:   "Positive change = good (green up arrow)",
        default: true,
        section: "Comparison",
        order:   7,
      },
      show_comparison: {
        type:    "boolean",
        label:   "Show delta / comparison row",
        default: true,
        section: "Comparison",
        order:   8,
      },
      show_sparkline: {
        type:    "boolean",
        label:   "Show sparkline (requires date dimension + measure)",
        default: true,
        section: "Sparkline",
        order:   9,
      },
      gradient_stop: {
        type:    "string",
        label:   "Accent line color",
        display: "select",
        values:  [
          { "Full gradient (blue → pink)": "full" },
          { "Blue":          "blue"         },
          { "Blue → Purple": "blue-purple"  },
          { "Purple":        "purple"       },
          { "Purple → Pink": "purple-pink"  },
          { "Pink":          "pink"         },
        ],
        default: "full",
        section: "Style",
        order:   10,
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
        order:   11,
      },
    },

    /* ── Create ── */
    create: function (element, config) {
      const style = document.createElement("style");
      style.textContent = CSS;
      element.appendChild(style);
      element.insertAdjacentHTML("beforeend",
        `<div class="sv-root" id="sv-root" data-size="auto" data-w="lg" data-h="lg">
           ${LOGO}
           <div class="sv-body" id="sv-body"></div>
           <div class="sv-line" id="sv-line"></div>
         </div>`
      );

      /* ResizeObserver: update breakpoint attributes whenever tile is resized */
      if (typeof ResizeObserver !== "undefined") {
        this._ro = new ResizeObserver(entries => {
          const { width, height } = entries[0].contentRect;
          const root = element.querySelector("#sv-root");
          if (root) applyBreakpoints(root, width, height);
        });
        this._ro.observe(element);
      }
    },

    /* ── Update ── */
    updateAsync: function (data, element, config, queryResponse, details, done) {
      const root = element.querySelector("#sv-root");
      const body = element.querySelector("#sv-body");
      const line = element.querySelector("#sv-line");

      if (!root || !body || !line) { done(); return; }

      /* ── Accent line ── */
      const thickness = config.line_thickness || "2";
      const gradKey   = config.gradient_stop  || "full";
      line.style.height          = thickness + "px";
      line.style.backgroundImage = GRAD[gradKey] || GRAD.full;

      /* ── Font size mode ── */
      const sizeMode = config.font_size || "auto";
      root.setAttribute("data-size", sizeMode);

      /* For auto mode, seed CSS vars immediately from current dimensions */
      if (sizeMode === "auto") {
        const w = element.offsetWidth  || 300;
        const h = element.offsetHeight || 200;
        applyBreakpoints(root, w, h);
      } else {
        /* For fixed modes, still apply layout breakpoints */
        const w = element.offsetWidth  || 300;
        const h = element.offsetHeight || 200;
        root.setAttribute("data-w",
          w < 260 ? "xs" : w < 380 ? "sm" : w < 560 ? "md" : "lg"
        );
        root.setAttribute("data-h",
          h < 110 ? "xs" : h < 160 ? "sm" : "lg"
        );
      }

      /* ── Collect fields ── */
      const dims     = queryResponse.fields.dimensions         || [];
      const meas     = queryResponse.fields.measures           || [];
      const calcs    = queryResponse.fields.table_calculations || [];
      const allMeasures = [...meas, ...calcs];

      if (allMeasures.length === 0 || data.length === 0) {
        body.innerHTML = `<div style="color:${T.mt};font-size:14px;padding:20px 0;">
          Add at least one measure to display a value.</div>`;
        done();
        return;
      }

      /* ── Primary measure ── */
      const primaryField = allMeasures[0];

      /* ── Delta field ── */
      let deltaField = null;
      if (allMeasures.length > 1) {
        const explicit = allMeasures.slice(1).find(f => isDeltaLike(f));
        deltaField = explicit || allMeasures[1];
      }

      /* ── Primary value ── */
      let primaryRaw      = null;
      let primaryRendered = null;

      if (data.length === 1) {
        const cell   = data[0][primaryField.name];
        primaryRaw      = cell?.value;
        primaryRendered = cell?.rendered;
      } else {
        const nums = data.map(r => r[primaryField.name]?.value)
                         .filter(v => v != null && !isNaN(parseFloat(v)));
        primaryRaw = nums.reduce((a, b) => a + parseFloat(b), 0);
      }

      /* ── Delta value ── */
      let deltaRaw      = null;
      let deltaRendered = null;
      if (deltaField && data.length >= 1) {
        const cell    = data[data.length - 1][deltaField.name];
        deltaRaw      = cell?.value;
        deltaRendered = cell?.rendered;
      }

      /* ── Sparkline data ── */
      const hasDateDim = dims.some(d =>
        d.type === "date" || d.type === "date_time" ||
        (d.name || "").toLowerCase().includes("date") ||
        (d.name || "").toLowerCase().includes("month") ||
        (d.name || "").toLowerCase().includes("week")
      );
      const sparkValues = (hasDateDim && data.length > 2)
        ? data.map(r => r[primaryField.name]?.value).filter(v => v != null)
        : [];

      /* ── Label ── */
      const label = config.title_override ||
                    primaryField.label_short ||
                    primaryField.label ||
                    primaryField.name;

      /* ── Format value ── */
      let displayVal;
      if (config.auto_format !== false && typeof primaryRaw === "number") {
        displayVal = fmtNumber(primaryRaw);
      } else {
        displayVal = primaryRendered != null
          ? esc(primaryRendered)
          : fmtNumber(primaryRaw);
      }

      const prefix = esc(config.value_prefix || "");
      const suffix = esc(config.value_suffix || "");

      /* ── Format delta ── */
      let deltaHtml = "";
      if (config.show_comparison !== false && deltaField && deltaRaw != null) {
        const dNum  = parseFloat(String(deltaRaw).replace(/[^0-9.\-]/g, ""));
        const isUp  = !isNaN(dNum) ? dNum >= 0 : true;
        const arrow = isUp ? "▲" : "▼";

        let badgeCls;
        if (isNaN(dNum)) {
          badgeCls = "neutral";
        } else if (config.positive_is_good !== false) {
          badgeCls = isUp ? "up-good" : "down-bad";
        } else {
          badgeCls = isUp ? "up-bad" : "down-good";
        }

        const dDisp = deltaRendered != null
          ? esc(deltaRendered)
          : (!isNaN(dNum) ? (isUp ? "+" : "") + dNum.toFixed(1) + "%" : esc(String(deltaRaw)));

        const compLabel = esc(config.comparison_label || "vs. prior period");

        deltaHtml = `
          <div class="sv-delta">
            <span class="sv-arrow-badge ${badgeCls}">
              <span>${arrow}</span>
              <span>${dDisp}</span>
            </span>
            <span class="sv-delta-label">${compLabel}</span>
          </div>`;
      }

      /* ── Sparkline (scales with container) ── */
      let sparkHtml = "";
      if (config.show_sparkline !== false && sparkValues.length > 2) {
        const containerW = element.offsetWidth  || 300;
        const containerH = element.offsetHeight || 200;
        const spkW = Math.round(Math.min(100, Math.max(56, containerW * 0.26)));
        const spkH = Math.round(Math.min(44,  Math.max(24, containerH * 0.18)));
        const spk  = buildSparkline(sparkValues, spkW, spkH, T.P);
        if (spk) {
          sparkHtml = `<div class="sv-sparkline-wrap">${spk}</div>`;
        }
      }

      /* ── Render ── */
      body.innerHTML = `
        <div class="sv-label">${esc(label)}</div>
        <div class="sv-value-row">
          ${prefix ? `<span class="sv-prefix">${prefix}</span>` : ""}
          <span class="sv-value">${displayVal}</span>
          ${suffix ? `<span class="sv-suffix">${suffix}</span>` : ""}
        </div>
        ${deltaHtml}
        ${sparkHtml}
      `;

      done();
    },
  });
})();