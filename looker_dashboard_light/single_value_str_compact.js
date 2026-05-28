/**
 * Rocket Software — Single Value KPI Compact (Text)
 * Custom Looker Visualization
 *
 * Designed for: 2 horizontal tiles × 1 vertical tile
 * (~300–450 px wide, ~80–110 px tall)
 *
 * Layout:  [gradient strip] | LABEL (small)
 *                           | Some text value
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add a new visualization and paste the URL.
 *   3. In any Explore, select "Rocket — Single Value Compact (Str)" from the picker.
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
    wn:   "#F0A830",
    er:   "#F06060",
  };

  /* ─── Value color options ─────────────────────────────────────────────── */
  const VALUE_COLORS = {
    "default": T.tx,
    "blue":    T.B,
    "purple":  T.P,
    "pink":    T.K,
    "teal":    T.ok,
    "amber":   T.wn,
    "red":     T.er,
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
    .svcs-root {
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
    .svcs-strip {
      width: 4px;
      flex-shrink: 0;
      background-size: 100% 200%;
      animation: svcs-flow 5s ease-in-out infinite alternate;
    }
    @keyframes svcs-flow {
      from { background-position: 50% 0%; }
      to   { background-position: 50% 100%; }
    }

    /* Content area */
    .svcs-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 8px 30px 8px 14px;
      min-width: 0;
      box-sizing: border-box;
    }

    /* Text alignment */
    .svcs-root[data-align="center"] .svcs-body { align-items: center; text-align: center; }
    .svcs-root[data-align="center"] .svcs-value-row { justify-content: center; }
    .svcs-root[data-align="right"]  .svcs-body { align-items: flex-end; text-align: right; }
    .svcs-root[data-align="right"]  .svcs-value-row { justify-content: flex-end; }

    /* Tiny logo watermark */
    .svcs-logo {
      position: absolute;
      top: 7px;
      right: 9px;
      width: 13px;
      height: 13px;
      opacity: 0.22;
      flex-shrink: 0;
    }

    /* Field label */
    .svcs-label {
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
    .svcs-value-row {
      display: flex;
      align-items: baseline;
      gap: 3px;
      line-height: 1.15;
      flex-wrap: nowrap;
      min-width: 0;
    }

    .svcs-prefix,
    .svcs-suffix {
      font-size: 14px;
      font-weight: 400;
      color: ${T.mt};
      line-height: 1;
      flex-shrink: 0;
    }

    .svcs-value {
      font-size: 24px;
      font-weight: 600;
      color: ${T.tx};
      line-height: 1.15;
      min-width: 0;
    }

    /* Truncate (default) */
    .svcs-root[data-wrap="off"] .svcs-value {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Wrap */
    .svcs-root[data-wrap="on"] .svcs-value {
      white-space: normal;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    /* ── Height: very tight (<= 72px) — hide label, tighten padding ── */
    .svcs-root[data-h="xs"] .svcs-label  { display: none; }
    .svcs-root[data-h="xs"] .svcs-body   { padding: 6px 28px 6px 12px; }
    .svcs-root[data-h="xs"] .svcs-value  { font-size: 19px; }
    .svcs-root[data-h="xs"] .svcs-prefix,
    .svcs-root[data-h="xs"] .svcs-suffix { font-size: 12px; }

    /* ── Height: compact (72–100px) — slightly reduced value ── */
    .svcs-root[data-h="sm"] .svcs-body   { padding: 7px 30px 7px 13px; }
    .svcs-root[data-h="sm"] .svcs-value  { font-size: 21px; }
    .svcs-root[data-h="sm"] .svcs-prefix,
    .svcs-root[data-h="sm"] .svcs-suffix { font-size: 13px; }

    /* ── Width: very narrow (<= 200px) ── */
    .svcs-root[data-w="xs"] .svcs-logo { display: none; }
    .svcs-root[data-w="xs"] .svcs-body { padding-right: 12px; }
  `;

  /* ─── SVG logo mark ───────────────────────────────────────────────────── */
  const LOGO = `
    <svg class="svcs-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="svc-lg-s" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${T.B}"/>
          <stop offset="50%"  stop-color="${T.P}"/>
          <stop offset="100%" stop-color="${T.K}"/>
        </linearGradient>
      </defs>
      <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
            stroke="url(#svc-lg-s)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6 L19 6 L19 11"
            stroke="url(#svc-lg-s)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  /* ─── Helpers ─────────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function cellStr(cell) {
    if (cell == null) return "—";
    if (cell.rendered != null) return String(cell.rendered);
    if (cell.value    != null) return String(cell.value);
    return "—";
  }

  function applyBreakpoints(root, w, h) {
    root.setAttribute("data-w", w <= 200 ? "xs" : "lg");
    root.setAttribute("data-h", h <= 72 ? "xs" : h <= 100 ? "sm" : "lg");
  }

  /* ─── Looker visualization definition ────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_single_value_compact_str_light",
    label: "Rocket — Single Value Compact (Str)",

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
        label:   "Prefix",
        default: "",
        section: "Value",
        order:   2,
      },
      value_suffix: {
        type:    "string",
        label:   "Suffix",
        default: "",
        section: "Value",
        order:   3,
      },
      text_align: {
        type:    "string",
        label:   "Text alignment",
        display: "select",
        values:  [
          { "Left":   "left"   },
          { "Center": "center" },
          { "Right":  "right"  },
        ],
        default: "left",
        section: "Value",
        order:   4,
      },
      allow_wrap: {
        type:    "boolean",
        label:   "Wrap long text (off = truncate with ellipsis)",
        default: false,
        section: "Value",
        order:   5,
      },
      value_color: {
        type:    "string",
        label:   "Value color",
        display: "select",
        values: [
          { "Default": "default" },
          { "Blue":    "blue"    },
          { "Purple":  "purple"  },
          { "Pink":    "pink"    },
          { "Teal":    "teal"    },
          { "Amber":   "amber"   },
          { "Red":     "red"     },
        ],
        default: "default",
        section: "Value",
        order:   6,
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
        order:   7,
      },
    },

    /* ── Create ── */
    create: function (element, config) {
      const style = document.createElement("style");
      style.textContent = CSS;
      element.appendChild(style);
      element.insertAdjacentHTML("beforeend",
        `<div class="svcs-root" id="svcs-root" data-h="sm" data-w="lg"
              data-align="left" data-wrap="off">
           <div class="svcs-strip" id="svcs-strip"></div>
           ${LOGO}
           <div class="svcs-body" id="svcs-body"></div>
         </div>`
      );

      if (typeof ResizeObserver !== "undefined") {
        this._ro = new ResizeObserver(entries => {
          const { width, height } = entries[0].contentRect;
          const root = element.querySelector("#svcs-root");
          if (root) applyBreakpoints(root, width, height);
        });
        this._ro.observe(element);
      }
    },

    /* ── Update ── */
    updateAsync: function (data, element, config, queryResponse, details, done) {
      const root  = element.querySelector("#svcs-root");
      const strip = element.querySelector("#svcs-strip");
      const body  = element.querySelector("#svcs-body");

      if (!root || !strip || !body) { done(); return; }

      /* Accent strip */
      const gradKey = config.gradient_stop || "full";
      strip.style.background = GRAD[gradKey] || GRAD.full;

      /* Alignment & wrap */
      root.setAttribute("data-align", config.text_align || "left");
      root.setAttribute("data-wrap",  config.allow_wrap ? "on" : "off");

      /* Breakpoints */
      applyBreakpoints(root, element.offsetWidth || 320, element.offsetHeight || 90);

      /* Fields */
      const dims   = queryResponse.fields.dimensions         || [];
      const meas   = queryResponse.fields.measures           || [];
      const calcs  = queryResponse.fields.table_calculations || [];
      const allFields = [...dims, ...meas, ...calcs];

      if (allFields.length === 0 || data.length === 0) {
        body.innerHTML = `<span style="color:${T.mt};font-size:13px;">No data</span>`;
        done(); return;
      }

      const primaryField = allFields[0];
      const cell         = data[0][primaryField.name];
      const displayVal   = esc(cellStr(cell));

      const label = config.title_override ||
                    primaryField.label_short ||
                    primaryField.label ||
                    primaryField.name;

      const prefix   = esc(config.value_prefix || "");
      const suffix   = esc(config.value_suffix || "");
      const valColor = VALUE_COLORS[config.value_color || "default"] || VALUE_COLORS["default"];

      body.innerHTML = `
        <div class="svcs-label">${esc(label)}</div>
        <div class="svcs-value-row">
          ${prefix ? `<span class="svcs-prefix">${prefix}</span>` : ""}
          <span class="svcs-value" style="color:${valColor}">${displayVal}</span>
          ${suffix ? `<span class="svcs-suffix">${suffix}</span>` : ""}
        </div>
      `;

      done();
    },
  });
})();
