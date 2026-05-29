/**
 * Rocket Software — Section Header
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add a new visualization and paste the URL.
 *   3. In any Explore, add the visualization to a dashboard tile and size it to
 *      1–2 tile rows tall spanning the desired column width.
 *
 * Usage:
 *   - Place as a divider / label between dashboard sections.
 *   - Title and subtitle are set via visualization options (no data required).
 *   - Accent line matches the brand gradient used across all Rocket vizzes.
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
    B:    "#5040F5",
    P:    "#8638CA",
    K:    "#C038B5",
    ok:   "#2DD4A0",
    wn:   "#F0A830",
    er:   "#F06060",
  };

  /* ─── Title color options ─────────────────────────────────────────────── */
  const TITLE_COLORS = {
    "default": T.tx,
    "muted":   T.mt,
    "blue":    T.B,
    "purple":  T.P,
    "pink":    T.K,
    "teal":    T.ok,
    "amber":   T.wn,
    "red":     T.er,
  };

  /* ─── Gradient presets ────────────────────────────────────────────────── */
  const GRAD = {
    "blue":         T.B,
    "blue-purple":  `linear-gradient(90deg, ${T.B}, #6040EC)`,
    "purple":       T.P,
    "purple-pink":  `linear-gradient(90deg, ${T.P}, #B038C8)`,
    "pink":         T.K,
    "full":         `linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K})`,
    "none":         "transparent",
  };

  /* ─── Injected CSS ────────────────────────────────────────────────────── */
  const CSS = `
    .sh-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: ${T.bg};
      overflow: hidden;
      position: relative;
      box-sizing: border-box;
    }

    /* ── Left strip variant ── */
    .sh-root[data-accent="left"] {
      flex-direction: row;
    }

    .sh-strip {
      display: none;
      width: 4px;
      flex-shrink: 0;
      background-size: 100% 200%;
      animation: sh-flow 5s ease-in-out infinite alternate;
    }

    .sh-root[data-accent="left"] .sh-strip {
      display: block;
    }

    /* ── Body ── */
    .sh-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 14px 24px 12px;
      box-sizing: border-box;
      min-width: 0;
    }

    /* ── Logo ── */
    .sh-logo {
      position: absolute;
      top: 50%;
      right: 18px;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      opacity: 0.22;
      flex-shrink: 0;
    }

    /* ── Title ── */
    .sh-title {
      font-weight: 600;
      color: ${T.tx};
      line-height: 1.15;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: -0.01em;
    }

    /* Size tiers */
    .sh-root[data-size="xs"] .sh-title { font-size: 13px; }
    .sh-root[data-size="sm"] .sh-title { font-size: 16px; }
    .sh-root[data-size="md"] .sh-title { font-size: 20px; }
    .sh-root[data-size="lg"] .sh-title { font-size: 26px; }
    .sh-root[data-size="xl"] .sh-title { font-size: 34px; }

    /* ── Subtitle ── */
    .sh-subtitle {
      font-size: 12px;
      font-weight: 400;
      color: ${T.mt};
      margin-top: 4px;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Divider line ── */
    .sh-divider {
      height: 1px;
      width: 100%;
      background: ${T.bo};
      margin-top: 10px;
      flex-shrink: 0;
    }

    /* ── Bottom accent line ── */
    .sh-line {
      height: 2px;
      width: 100%;
      flex-shrink: 0;
      background-size: 200% 100%;
      animation: sh-flow 5s ease-in-out infinite alternate;
    }

    .sh-root[data-accent="left"] .sh-line,
    .sh-root[data-accent="none"] .sh-line {
      display: none;
    }

    @keyframes sh-flow {
      from { background-position: 0% 50%;   }
      to   { background-position: 100% 50%; }
    }

    /* ── Alignment ── */
    .sh-root[data-align="center"] .sh-body { align-items: center; text-align: center; }
    .sh-root[data-align="right"]  .sh-body { align-items: flex-end; text-align: right; }

    /* ── Background variants ── */
    .sh-root[data-bg="surface"] { background: ${T.surf}; }
    .sh-root[data-bg="none"]    { background: transparent; }

    /* ── Responsive adjustments ── */
    @media (max-width: 260px) {
      .sh-body { padding: 10px 14px 8px; }
      .sh-subtitle { display: none; }
    }
  `;

  /* ─── SVG logo mark ───────────────────────────────────────────────────── */
  const LOGO = `
    <svg class="sh-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sh-lg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${T.B}"/>
          <stop offset="50%"  stop-color="${T.P}"/>
          <stop offset="100%" stop-color="${T.K}"/>
        </linearGradient>
      </defs>
      <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
            stroke="url(#sh-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6 L19 6 L19 11"
            stroke="url(#sh-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  /* ─── Helper ──────────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ─── Looker visualization definition ────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_section_header_light",
    label: "Rocket — Section Header (Light)",

    options: {
      /* ── Content ─────────────────────────────────────────────────────── */
      title_text: {
        type:        "string",
        label:       "Title",
        default:     "Section Title",
        placeholder: "Enter section title",
        section:     "Content",
        order:       1,
      },
      subtitle_text: {
        type:        "string",
        label:       "Subtitle",
        default:     "",
        placeholder: "Optional supporting text",
        section:     "Content",
        order:       2,
      },
      show_divider: {
        type:    "boolean",
        label:   "Show divider line below text",
        default: false,
        section: "Content",
        order:   3,
      },

      /* ── Style ───────────────────────────────────────────────────────── */
      title_size: {
        type:    "string",
        label:   "Title size",
        display: "select",
        values:  [
          { "Extra small (13px)": "xs" },
          { "Small (16px)":       "sm" },
          { "Medium (20px)":      "md" },
          { "Large (26px)":       "lg" },
          { "Extra large (34px)": "xl" },
        ],
        default: "md",
        section: "Style",
        order:   4,
      },
      text_align: {
        type:    "string",
        label:   "Alignment",
        display: "select",
        values:  [
          { "Left":   "left"   },
          { "Center": "center" },
          { "Right":  "right"  },
        ],
        default: "left",
        section: "Style",
        order:   5,
      },
      title_color: {
        type:    "string",
        label:   "Title color",
        display: "select",
        values:  [
          { "Default (dark)": "default" },
          { "Muted (grey)":   "muted"   },
          { "Blue":           "blue"    },
          { "Purple":         "purple"  },
          { "Pink":           "pink"    },
          { "Teal":           "teal"    },
          { "Amber":          "amber"   },
          { "Red":            "red"     },
        ],
        default: "default",
        section: "Style",
        order:   6,
      },
      background: {
        type:    "string",
        label:   "Background",
        display: "select",
        values:  [
          { "White":       "white"   },
          { "Surface":     "surface" },
          { "Transparent": "none"    },
        ],
        default: "white",
        section: "Style",
        order:   7,
      },
      show_logo: {
        type:    "boolean",
        label:   "Show Rocket logo mark",
        default: false,
        section: "Style",
        order:   8,
      },

      /* ── Accent ──────────────────────────────────────────────────────── */
      accent_position: {
        type:    "string",
        label:   "Accent position",
        display: "select",
        values:  [
          { "Bottom line": "bottom" },
          { "Left strip":  "left"   },
          { "None":        "none"   },
        ],
        default: "bottom",
        section: "Accent",
        order:   9,
      },
      gradient_stop: {
        type:    "string",
        label:   "Accent color",
        display: "select",
        values:  [
          { "Full gradient (blue → pink)": "full"        },
          { "Blue":                        "blue"        },
          { "Blue → Purple":               "blue-purple" },
          { "Purple":                      "purple"      },
          { "Purple → Pink":               "purple-pink" },
          { "Pink":                        "pink"        },
          { "None":                        "none"        },
        ],
        default: "full",
        section: "Accent",
        order:   10,
      },
      line_thickness: {
        type:    "string",
        label:   "Accent thickness",
        display: "select",
        values:  [
          { "Thin (1px)":    "1" },
          { "Default (2px)": "2" },
          { "Medium (3px)":  "3" },
          { "Bold (4px)":    "4" },
        ],
        default: "2",
        section: "Accent",
        order:   11,
      },
    },

    /* ── Create ── */
    create: function (element, config) {
      const style = document.createElement("style");
      style.textContent = CSS;
      element.appendChild(style);
      element.insertAdjacentHTML("beforeend",
        `<div class="sh-root" id="sh-root"
              data-size="md" data-align="left" data-accent="bottom" data-bg="white">
           <div class="sh-strip" id="sh-strip"></div>
           <div class="sh-body"  id="sh-body"></div>
           <div class="sh-line"  id="sh-line"></div>
         </div>`
      );
    },

    /* ── Update ── */
    updateAsync: function (data, element, config, queryResponse, details, done) {
      const root  = element.querySelector("#sh-root");
      const body  = element.querySelector("#sh-body");
      const line  = element.querySelector("#sh-line");
      const strip = element.querySelector("#sh-strip");

      if (!root || !body) { done(); return; }

      /* ── Accent gradient ── */
      const gradKey   = config.gradient_stop   || "full";
      const thickness = config.line_thickness  || "2";
      const accent    = config.accent_position || "bottom";
      const grad      = GRAD[gradKey] || GRAD.full;

      root.setAttribute("data-accent", accent);
      root.setAttribute("data-size",   config.title_size || "md");
      root.setAttribute("data-align",  config.text_align || "left");
      root.setAttribute("data-bg",     config.background || "white");

      /* Bottom line */
      if (line) {
        line.style.height          = thickness + "px";
        line.style.backgroundImage = grad;
      }

      /* Left strip — vertical gradient */
      if (strip) {
        strip.style.background = grad.replace
          ? grad.replace(/90deg/g, "180deg")
          : grad;
        strip.style.width = thickness + "px";
      }

      /* ── Content ── */
      const titleText    = config.title_text    || "";
      const subtitleText = config.subtitle_text || "";
      const showDivider  = config.show_divider  === true;
      const showLogo     = config.show_logo     === true;

      const colorKey  = config.title_color || "default";
      const titleColor = TITLE_COLORS[colorKey] || TITLE_COLORS["default"];

      let html = showLogo ? LOGO : "";

      html += `<span class="sh-title" style="color:${titleColor}">${esc(titleText)}</span>`;

      if (subtitleText) {
        html += `<span class="sh-subtitle">${esc(subtitleText)}</span>`;
      }

      if (showDivider) {
        html += `<div class="sh-divider"></div>`;
      }

      body.innerHTML = html;

      done();
    },
  });
})();
