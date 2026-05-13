/**
 * Rocket Software — Single Value KPI Component (Text)
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add a new visualization and paste the URL.
 *   3. In any Explore, select "Rocket — Single Value (Text)" from the visualization picker.
 *
 * Supports:
 *   - Any dimension or string measure → displayed as text
 *   - Optional prefix / suffix flanking the value
 *   - Configurable text alignment (left / center / right)
 *   - Configurable value color (brand palette or default white)
 *   - Wrap or truncate long strings
 *   - Fully responsive: adapts padding, font size, and chrome at any tile size
 *
 * Version: 1.0.0  |  May 2025
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
      margin-bottom: 4px;
      line-height: 1.15;
    }

    /* Text alignment — set via data-align on sv-root */
    .sv-root[data-align="center"] .sv-body { align-items: center; text-align: center; }
    .sv-root[data-align="center"] .sv-value-row { justify-content: center; }
    .sv-root[data-align="right"]  .sv-body { align-items: flex-end; text-align: right; }
    .sv-root[data-align="right"]  .sv-value-row { justify-content: flex-end; }

    .sv-prefix,
    .sv-suffix {
      font-weight: 400;
      color: ${T.mt};
      line-height: 1;
      flex-shrink: 0;
    }

    .sv-value {
      font-weight: 500;
      color: ${T.tx};          /* overridden inline by value_color option */
      line-height: 1.15;
    }

    /* Truncate mode (default) */
    .sv-root[data-wrap="off"] .sv-value {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    /* Wrap mode */
    .sv-root[data-wrap="on"] .sv-value {
      white-space: normal;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    /* Fixed size tiers driven by data-size on sv-root */
    .sv-root[data-size="sm"]  .sv-value  { font-size: 36px; }
    .sv-root[data-size="sm"]  .sv-prefix,
    .sv-root[data-size="sm"]  .sv-suffix { font-size: 20px; }
    .sv-root[data-size="md"]  .sv-value  { font-size: 52px; }
    .sv-root[data-size="md"]  .sv-prefix,
    .sv-root[data-size="md"]  .sv-suffix { font-size: 28px; }
    .sv-root[data-size="lg"]  .sv-value  { font-size: 68px; }
    .sv-root[data-size="lg"]  .sv-prefix,
    .sv-root[data-size="lg"]  .sv-suffix { font-size: 36px; }
    .sv-root[data-size="xl"]  .sv-value  { font-size: 88px; }
    .sv-root[data-size="xl"]  .sv-prefix,
    .sv-root[data-size="xl"]  .sv-suffix { font-size: 46px; }

    /* Auto size: driven by CSS custom property set by ResizeObserver */
    .sv-root[data-size="auto"] .sv-value {
      font-size: var(--sv-auto-fs, 52px);
    }
    .sv-root[data-size="auto"] .sv-prefix,
    .sv-root[data-size="auto"] .sv-suffix {
      font-size: var(--sv-auto-pre, 28px);
    }

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
    .sv-root[data-w="xs"] .sv-body  { padding: 14px 16px 12px; }
    .sv-root[data-w="xs"] .sv-label { font-size: 9px; letter-spacing: 0.7px; margin-bottom: 8px; }
    .sv-root[data-w="xs"] .sv-logo  { width: 14px; height: 14px; top: 10px; right: 12px; }
    .sv-root[data-w="xs"] .sv-value-row { margin-bottom: 0; }

    /* Small: 260–380px wide */
    .sv-root[data-w="sm"] .sv-body  { padding: 20px 22px 16px; }
    .sv-root[data-w="sm"] .sv-label { font-size: 10px; margin-bottom: 10px; }
    .sv-root[data-w="sm"] .sv-value-row { margin-bottom: 4px; }

    /* Medium: 380–560px wide */
    .sv-root[data-w="md"] .sv-body { padding: 24px 28px 18px; }

    /* ── Responsive: height breakpoints via data-h on sv-root ── */

    /* Very short: < 110px tall — show only the value */
    .sv-root[data-h="xs"] .sv-label { display: none; }
    .sv-root[data-h="xs"] .sv-body  { padding: 8px 16px; justify-content: center; }
    .sv-root[data-h="xs"] .sv-value-row { margin-bottom: 0; }

    /* Short: 110–160px tall */
    .sv-root[data-h="sm"] .sv-body { padding: 12px 24px 10px; }
    .sv-root[data-h="sm"] .sv-value-row { margin-bottom: 4px; }
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
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /**
   * Extract the best display string from a Looker cell.
   * Prefers the rendered value; falls back to raw value as a string.
   */
  function cellStr(cell) {
    if (cell == null) return "—";
    if (cell.rendered != null) return String(cell.rendered);
    if (cell.value   != null) return String(cell.value);
    return "—";
  }

  /**
   * Compute auto font size from container dimensions.
   * For text we use a tighter scale than numerics to avoid
   * very large glyphs on short strings.
   * Returns [valueFontSize, prefixSuffixFontSize] in px.
   */
  function autoSize(w, h) {
    const base = Math.min(w * 0.36, h * 0.36);
    const fs   = Math.max(18, Math.min(72, Math.round(base)));
    return [fs, Math.round(fs * 0.52)];
  }

  /**
   * Apply width/height breakpoint attributes and (if auto) font-size
   * custom properties. Called by ResizeObserver.
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

  /* ─── Looker visualization definition ────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_single_value_str",
    label: "Rocket — Single Value (Text)",

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
      font_size: {
        type:    "string",
        label:   "Value size",
        display: "select",
        values:  [
          { "Auto (fills tile)": "auto" },
          { "Small":             "sm"   },
          { "Medium":            "md"   },
          { "Large":             "lg"   },
          { "Extra large":       "xl"   },
        ],
        default: "auto",
        section: "Value",
        order:   4,
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
        order:   5,
      },
      allow_wrap: {
        type:    "boolean",
        label:   "Wrap long text (off = truncate with ellipsis)",
        default: false,
        section: "Value",
        order:   6,
      },
      value_color: {
        type:    "string",
        label:   "Value color",
        display: "select",
        values:  [
          { "Default (white)": "default" },
          { "Blue":            "blue"    },
          { "Purple":          "purple"  },
          { "Pink":            "pink"    },
          { "Teal":            "teal"    },
          { "Amber":           "amber"   },
          { "Red":             "red"     },
        ],
        default: "default",
        section: "Value",
        order:   7,
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
        order:   8,
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
        order:   9,
      },
    },

    /* ── Create ── */
    create: function (element, config) {
      const style = document.createElement("style");
      style.textContent = CSS;
      element.appendChild(style);
      element.insertAdjacentHTML("beforeend",
        `<div class="sv-root" id="sv-root" data-size="auto" data-w="lg" data-h="lg"
              data-align="left" data-wrap="off">
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

      /* ── Text alignment ── */
      root.setAttribute("data-align", config.text_align || "left");

      /* ── Wrap mode ── */
      root.setAttribute("data-wrap", config.allow_wrap ? "on" : "off");

      /* Apply breakpoints from current dimensions */
      const w = element.offsetWidth  || 300;
      const h = element.offsetHeight || 200;
      applyBreakpoints(root, w, h);

      /* ── Collect fields — prefer dimensions, then measures, then calcs ── */
      const dims  = queryResponse.fields.dimensions         || [];
      const meas  = queryResponse.fields.measures           || [];
      const calcs = queryResponse.fields.table_calculations || [];
      const allFields = [...dims, ...meas, ...calcs];

      if (allFields.length === 0 || data.length === 0) {
        body.innerHTML = `<div style="color:${T.mt};font-size:14px;padding:20px 0;">
          Add at least one field to display a value.</div>`;
        done();
        return;
      }

      /* ── Pick primary field and extract string value ── */
      const primaryField = allFields[0];
      const cell         = data[0][primaryField.name];
      const displayVal   = esc(cellStr(cell));

      /* ── Label ── */
      const label = config.title_override ||
                    primaryField.label_short ||
                    primaryField.label ||
                    primaryField.name;

      /* ── Prefix / suffix ── */
      const prefix = esc(config.value_prefix || "");
      const suffix = esc(config.value_suffix || "");

      /* ── Value color ── */
      const colorKey = config.value_color || "default";
      const valColor = VALUE_COLORS[colorKey] || VALUE_COLORS["default"];

      /* ── Render ── */
      body.innerHTML = `
        <div class="sv-label">${esc(label)}</div>
        <div class="sv-value-row">
          ${prefix ? `<span class="sv-prefix">${prefix}</span>` : ""}
          <span class="sv-value" style="color:${valColor}">${displayVal}</span>
          ${suffix ? `<span class="sv-suffix">${suffix}</span>` : ""}
        </div>
      `;

      done();
    },
  });
})();