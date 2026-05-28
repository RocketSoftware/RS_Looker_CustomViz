/**
 * Rocket Software — Single Value KPI Compact (Numeric)
 * Custom Looker Visualization
 *
 * Designed for: 2 horizontal tiles × 1 vertical tile
 * (~300–450 px wide, ~80–110 px tall)
 *
 * Layout:  [gradient strip] | LABEL (small)
 *                           | $1.2M  ▲ +8.3%
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add a new visualization and paste the URL.
 *   3. In any Explore, select "Rocket — Single Value Compact (Num)" from the picker.
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
    B: "#5040F5",
    P: "#8638CA",
    K: "#C038B5",
    ok:   "#2DD4A0",
    er:   "#F06060",
  };

  /* ─── Gradient presets for the left accent strip ─────────────────────── */
  const GRAD = {
    "full":        `linear-gradient(180deg, ${T.B}, ${T.P}, ${T.K})`,
    "blue":        T.B,
    "blue-purple": `linear-gradient(180deg, ${T.B}, ${T.P})`,
    "purple":      T.P,
    "purple-pink": `linear-gradient(180deg, ${T.P}, ${T.K})`,
    "pink":        T.K,
  };

  /* ─── Injected CSS ────────────────────────────────────────────────────── */
  const CSS = `
    .svc-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      align-items: stretch;
      background: ${T.bg};
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
    }

    /* Vertical gradient accent strip on the left */
    .svc-strip {
      width: 4px;
      flex-shrink: 0;
      background-size: 100% 200%;
      animation: svc-flow 5s ease-in-out infinite alternate;
    }
    @keyframes svc-flow {
      from { background-position: 50% 0%; }
      to   { background-position: 50% 100%; }
    }

    /* Content area */
    .svc-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 8px 30px 8px 14px;
      min-width: 0;
      box-sizing: border-box;
    }

    /* Tiny logo watermark */
    .svc-logo {
      position: absolute;
      top: 7px;
      right: 9px;
      width: 13px;
      height: 13px;
      opacity: 0.22;
      flex-shrink: 0;
    }

    /* Field label */
    .svc-label {
      font-size: 9px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1.1px;
      color: ${T.mt};
      line-height: 1;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Value + prefix/suffix row */
    .svc-value-row {
      display: flex;
      align-items: baseline;
      gap: 3px;
      line-height: 1;
      flex-wrap: nowrap;
      min-width: 0;
    }

    .svc-prefix,
    .svc-suffix {
      font-size: 14px;
      font-weight: 400;
      color: ${T.mt};
      line-height: 1;
      flex-shrink: 0;
    }

    .svc-value {
      font-size: 28px;
      font-weight: 600;
      color: ${T.tx};
      line-height: 1;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    /* Comparison / delta row — inline with value */
    .svc-delta {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 5px;
      line-height: 1;
    }

    .svc-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      white-space: nowrap;
    }
    .svc-badge.up-good   { background: rgba(45,212,160,.14); color: ${T.ok}; }
    .svc-badge.up-bad    { background: rgba(240,96,96,.14);  color: ${T.er}; }
    .svc-badge.down-good { background: rgba(45,212,160,.14); color: ${T.ok}; }
    .svc-badge.down-bad  { background: rgba(240,96,96,.14);  color: ${T.er}; }
    .svc-badge.neutral   { background: rgba(0,0,0,0.06);     color: ${T.mt}; }

    .svc-comp-label {
      font-size: 10px;
      color: ${T.mt};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Height: very tight (<= 72px) — hide label, compress everything ── */
    .svc-root[data-h="xs"] .svc-label  { display: none; }
    .svc-root[data-h="xs"] .svc-body   { padding: 6px 28px 6px 12px; }
    .svc-root[data-h="xs"] .svc-value  { font-size: 22px; }
    .svc-root[data-h="xs"] .svc-prefix,
    .svc-root[data-h="xs"] .svc-suffix { font-size: 12px; }
    .svc-root[data-h="xs"] .svc-delta  { display: none; }

    /* ── Height: compact (72–100px) — keep label, reduce value size ── */
    .svc-root[data-h="sm"] .svc-body   { padding: 7px 30px 7px 13px; }
    .svc-root[data-h="sm"] .svc-value  { font-size: 24px; }
    .svc-root[data-h="sm"] .svc-prefix,
    .svc-root[data-h="sm"] .svc-suffix { font-size: 13px; }

    /* ── Width: very narrow (<= 200px) — hide delta label text ── */
    .svc-root[data-w="xs"] .svc-comp-label { display: none; }
    .svc-root[data-w="xs"] .svc-logo       { display: none; }
    .svc-root[data-w="xs"] .svc-body       { padding-right: 12px; }
  `;

  /* ─── SVG logo mark ───────────────────────────────────────────────────── */
  const LOGO = `
    <svg class="svc-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="svc-lg-n" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${T.B}"/>
          <stop offset="50%"  stop-color="${T.P}"/>
          <stop offset="100%" stop-color="${T.K}"/>
        </linearGradient>
      </defs>
      <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
            stroke="url(#svc-lg-n)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6 L19 6 L19 11"
            stroke="url(#svc-lg-n)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  /* ─── Helpers ─────────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function fmtNumber(v) {
    if (v == null || v === "") return "—";
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
    if (isNaN(n)) return esc(String(v));
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    if (Number.isInteger(n)) return n.toLocaleString();
    return n.toFixed(2);
  }

  function isDeltaLike(field) {
    const n = (field.name + " " + (field.label || "")).toLowerCase();
    return n.includes("change") || n.includes("delta") || n.includes("diff") ||
           n.includes("growth") || n.includes("vs")    || n.includes("prior") ||
           n.includes("percent") || field.value_format === "%";
  }

  function applyBreakpoints(root, w, h) {
    root.setAttribute("data-w", w <= 200 ? "xs" : "lg");
    root.setAttribute("data-h", h <= 72 ? "xs" : h <= 100 ? "sm" : "lg");
  }

  /* ─── Looker visualization definition ────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_single_value_compact_num_light",
    label: "Rocket — Single Value Compact (Num)",

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
        label:   "Suffix (e.g. %)",
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
      show_comparison: {
        type:    "boolean",
        label:   "Show delta / comparison row",
        default: true,
        section: "Comparison",
        order:   5,
      },
      positive_is_good: {
        type:    "boolean",
        label:   "Positive change = good (green up arrow)",
        default: true,
        section: "Comparison",
        order:   6,
      },
      comparison_label: {
        type:        "string",
        label:       "Comparison label",
        default:     "vs. prior period",
        placeholder: "e.g. vs. last quarter",
        section:     "Comparison",
        order:       7,
      },
      gradient_stop: {
        type:    "string",
        label:   "Accent strip color",
        display: "select",
        values: [
          { "Full gradient (blue → pink)": "full"        },
          { "Blue":                        "blue"        },
          { "Blue → Purple":               "blue-purple" },
          { "Purple":                      "purple"      },
          { "Purple → Pink":               "purple-pink" },
          { "Pink":                        "pink"        },
        ],
        default: "full",
        section: "Style",
        order:   8,
      },
    },

    /* ── Create ── */
    create: function (element, config) {
      const style = document.createElement("style");
      style.textContent = CSS;
      element.appendChild(style);
      element.insertAdjacentHTML("beforeend",
        `<div class="svc-root" id="svc-root-n" data-h="sm" data-w="lg">
           <div class="svc-strip" id="svc-strip-n"></div>
           ${LOGO}
           <div class="svc-body" id="svc-body-n"></div>
         </div>`
      );

      if (typeof ResizeObserver !== "undefined") {
        this._ro = new ResizeObserver(entries => {
          const { width, height } = entries[0].contentRect;
          const root = element.querySelector("#svc-root-n");
          if (root) applyBreakpoints(root, width, height);
        });
        this._ro.observe(element);
      }
    },

    /* ── Update ── */
    updateAsync: function (data, element, config, queryResponse, details, done) {
      const root  = element.querySelector("#svc-root-n");
      const strip = element.querySelector("#svc-strip-n");
      const body  = element.querySelector("#svc-body-n");

      if (!root || !strip || !body) { done(); return; }

      /* Accent strip */
      const gradKey = config.gradient_stop || "full";
      strip.style.background = GRAD[gradKey] || GRAD.full;

      /* Breakpoints from current size */
      applyBreakpoints(root, element.offsetWidth || 320, element.offsetHeight || 90);

      /* Fields */
      const meas     = queryResponse.fields.measures           || [];
      const calcs    = queryResponse.fields.table_calculations || [];
      const allMeas  = [...meas, ...calcs];

      if (allMeas.length === 0 || data.length === 0) {
        body.innerHTML = `<span style="color:${T.mt};font-size:13px;">No data</span>`;
        done(); return;
      }

      const primaryField = allMeas[0];

      /* Delta field */
      let deltaField = null;
      if (allMeas.length > 1) {
        deltaField = allMeas.slice(1).find(f => isDeltaLike(f)) || allMeas[1];
      }

      /* Primary value */
      let primaryRaw = null, primaryRendered = null;
      if (data.length === 1) {
        const cell      = data[0][primaryField.name];
        primaryRaw      = cell?.value;
        primaryRendered = cell?.rendered;
      } else {
        const nums = data.map(r => r[primaryField.name]?.value)
                        .filter(v => v != null && !isNaN(parseFloat(v)));
        primaryRaw = nums.reduce((a, b) => a + parseFloat(b), 0);
      }

      /* Delta value */
      let deltaRaw = null, deltaRendered = null;
      if (deltaField) {
        const cell    = data[data.length - 1][deltaField.name];
        deltaRaw      = cell?.value;
        deltaRendered = cell?.rendered;
      }

      /* Label */
      const label = config.title_override ||
                    primaryField.label_short ||
                    primaryField.label ||
                    primaryField.name;

      /* Format primary value */
      let displayVal;
      if (config.auto_format !== false && typeof primaryRaw === "number") {
        displayVal = fmtNumber(primaryRaw);
      } else {
        displayVal = primaryRendered != null ? esc(primaryRendered) : fmtNumber(primaryRaw);
      }

      const prefix = esc(config.value_prefix || "");
      const suffix = esc(config.value_suffix || "");

      /* Delta HTML */
      let deltaHtml = "";
      if (config.show_comparison !== false && deltaField && deltaRaw != null) {
        const dNum = parseFloat(String(deltaRaw).replace(/[^0-9.\-]/g, ""));
        const isUp = !isNaN(dNum) ? dNum >= 0 : true;
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
          <div class="svc-delta">
            <span class="svc-badge ${badgeCls}">${arrow} ${dDisp}</span>
            <span class="svc-comp-label">${compLabel}</span>
          </div>`;
      }

      /* Render */
      body.innerHTML = `
        <div class="svc-label">${esc(label)}</div>
        <div class="svc-value-row">
          ${prefix ? `<span class="svc-prefix">${prefix}</span>` : ""}
          <span class="svc-value">${displayVal}</span>
          ${suffix ? `<span class="svc-suffix">${suffix}</span>` : ""}
        </div>
        ${deltaHtml}
      `;

      done();
    },
  });
})();
