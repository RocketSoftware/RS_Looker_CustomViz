/**
 * Rocket Software — Semicircular Gauge
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add the URL.
 *   3. Select "Rocket — Gauge" from the visualization picker.
 *
 * Supports:
 *   - One measure  → current value (required)
 *   - Second measure (optional) → dynamic max value
 *   - config: min_value, max_value, title override, decimal places
 *   - Gradient arc: brand blue → purple → pink
 *   - Responsive via ResizeObserver
 *
 * Version: 1.0.0  |  May 2025
 */

(function () {
  "use strict";

  /* ─── Unique-ID counter (safe for multi-tile dashboards) ───────────────── */
  let _instCount = 0;

  /* ─── Brand tokens ─────────────────────────────────────────────────────── */
  const T = {
    bg:   "#05050E",
    surf: "#09091C",
    bo:   "rgba(100,65,210,.22)",
    bo2:  "rgba(100,65,210,.11)",
    tx:   "#E2E2FF",
    mt:   "#595985",
    dm:   "#2A2A52",
    B:    "#3B7EF6",
    P:    "#7B3FE4",
    K:    "#D9349A",
    track:"rgba(89,89,133,.22)",
  };

  /* ─── CSS ──────────────────────────────────────────────────────────────── */
  const CSS = `
    .rgg-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      background: ${T.bg};
      background-image:
        repeating-linear-gradient(135deg, rgba(100,65,210,.03) 0, rgba(100,65,210,.03) 1px, transparent 1px, transparent 18px),
        repeating-linear-gradient(45deg,  rgba(59,126,246,.025) 0, rgba(59,126,246,.025) 1px, transparent 1px, transparent 18px);
      overflow: hidden;
      box-sizing: border-box;
      border-radius: 10px;
      border: 1px solid ${T.bo};
      position: relative;
    }

    .rgg-topbar {
      background: ${T.surf};
      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo};
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      flex-shrink: 0;
    }
    .rgg-topbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .rgg-logo        { width: 20px; height: 20px; flex-shrink: 0; opacity: .85; }
    .rgg-title {
      font-size: 14px; font-weight: 500; color: ${T.tx};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .rgg-gline {
      height: 2px;
      background: linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K});
      background-size: 200% 100%;
      flex-shrink: 0;
      animation: rgg-grad-flow 5s ease-in-out infinite alternate;
    }
    @keyframes rgg-grad-flow {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }

    .rgg-body {
      flex: 1; display: flex; align-items: center; justify-content: center;
      min-height: 0; overflow: hidden;
      padding: 8px 12px 12px;
      box-sizing: border-box;
    }

    .rgg-svg-wrap {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
    }

    .rgg-svg {
      overflow: visible;
      display: block;
    }

    /* Track arc */
    .rgg-track {
      fill: none;
      stroke: ${T.track};
      stroke-linecap: round;
    }

    /* Filled arc */
    .rgg-arc {
      fill: none;
      stroke-linecap: round;
      transition: stroke-dashoffset .6s cubic-bezier(.4,0,.2,1);
    }

    /* Center text */
    .rgg-center-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 11px;
      fill: ${T.mt};
      text-anchor: middle;
      dominant-baseline: auto;
    }
    .rgg-center-value {
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 700;
      fill: ${T.tx};
      text-anchor: middle;
      dominant-baseline: auto;
    }

    /* Min / max endpoint labels */
    .rgg-endpoint {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 11px;
      fill: ${T.mt};
    }
  `;

  /* ─── SVG arc helper ────────────────────────────────────────────────────── */
  /**
   * Returns the SVG path `d` attribute for a circular arc.
   * @param {number} cx      - center x
   * @param {number} cy      - center y
   * @param {number} r       - radius
   * @param {number} startDeg - start angle in degrees (0 = right, 90 = bottom)
   * @param {number} endDeg   - end angle in degrees
   */
  function arcPath(cx, cy, r, startDeg, endDeg) {
    const toRad = (d) => (d * Math.PI) / 180;
    const sx = cx + r * Math.cos(toRad(startDeg));
    const sy = cy + r * Math.sin(toRad(startDeg));
    const ex = cx + r * Math.cos(toRad(endDeg));
    const ey = cy + r * Math.sin(toRad(endDeg));
    const span = ((endDeg - startDeg) % 360 + 360) % 360;
    const large = span > 180 ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
  }

  /* ─── Number formatter ─────────────────────────────────────────────────── */
  function fmt(val, decimals) {
    if (val === null || val === undefined || isNaN(val)) return "—";
    const d = Number.isInteger(decimals) ? decimals : 0;
    if (Math.abs(val) >= 1e9)  return (val / 1e9).toFixed(d)  + "B";
    if (Math.abs(val) >= 1e6)  return (val / 1e6).toFixed(d)  + "M";
    if (Math.abs(val) >= 1e3)  return (val / 1e3).toFixed(d)  + "K";
    return val.toFixed(d);
  }

  /* ─── Looker viz registration ───────────────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_gauge",
    label: "Rocket — Gauge",

    options: {
      title: {
        type:    "string",
        label:   "Title override",
        default: "",
        section: "Style",
        order:   1,
      },
      min_value: {
        type:    "number",
        label:   "Min value",
        default: 0,
        section: "Data",
        order:   2,
      },
      max_value: {
        type:    "number",
        label:   "Max value (overridden by 2nd measure if present)",
        default: 14,
        section: "Data",
        order:   3,
      },
      decimals: {
        type:    "number",
        label:   "Decimal places",
        default: 0,
        section: "Data",
        order:   4,
      },
      stroke_width: {
        type:    "number",
        label:   "Arc thickness (px at 300px radius)",
        default: 22,
        section: "Style",
        order:   5,
      },
    },

    /* ── create(): build static DOM once ─────────────────────────────────── */
    create(element, config) {
      const instId = ++_instCount;
      this._instId = instId;

      /* Inject CSS (once per page) */
      const styleId = "rgg-style";
      if (!document.getElementById(styleId)) {
        const s = document.createElement("style");
        s.id = styleId;
        s.textContent = CSS;
        document.head.appendChild(s);
      }

      /* Root */
      const root = document.createElement("div");
      root.className = "rgg-root";
      element.appendChild(root);
      this._root = root;

      /* Topbar */
      const topbar = document.createElement("div");
      topbar.className = "rgg-topbar";
      root.appendChild(topbar);

      const topLeft = document.createElement("div");
      topLeft.className = "rgg-topbar-left";
      topbar.appendChild(topLeft);

      /* Rocket logo SVG */
      const logoSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      logoSvg.setAttribute("viewBox", "0 0 24 24");
      logoSvg.setAttribute("class", "rgg-logo");
      logoSvg.setAttribute("fill", "none");
      logoSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      logoSvg.innerHTML = `
        <defs>
          <linearGradient id="rgg-logo-grad-${instId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stop-color="${T.B}"/>
            <stop offset="50%"  stop-color="${T.P}"/>
            <stop offset="100%" stop-color="${T.K}"/>
          </linearGradient>
        </defs>
        <path d="M12 2C12 2 7 6 7 13H17C17 6 12 2 12 2Z"
              fill="url(#rgg-logo-grad-${instId})"/>
        <path d="M9 13C9 13 7 15 7 17H17C17 15 15 13 15 13H9Z"
              fill="url(#rgg-logo-grad-${instId})" opacity=".7"/>
        <rect x="10" y="17" width="4" height="3" rx="1"
              fill="url(#rgg-logo-grad-${instId})" opacity=".5"/>
      `;
      topLeft.appendChild(logoSvg);

      const titleEl = document.createElement("div");
      titleEl.className = "rgg-title";
      titleEl.textContent = "Gauge";
      topLeft.appendChild(titleEl);
      this._titleEl = titleEl;

      /* Gradient line */
      const gline = document.createElement("div");
      gline.className = "rgg-gline";
      root.appendChild(gline);

      /* Body */
      const body = document.createElement("div");
      body.className = "rgg-body";
      root.appendChild(body);
      this._body = body;

      /* SVG wrapper */
      const svgWrap = document.createElement("div");
      svgWrap.className = "rgg-svg-wrap";
      body.appendChild(svgWrap);
      this._svgWrap = svgWrap;

      /* ResizeObserver → re-render on size change */
      let _rszTimer = null;
      this._resizeObserver = new ResizeObserver(() => {
        clearTimeout(_rszTimer);
        _rszTimer = setTimeout(() => this._redraw(), 100);
      });
      this._resizeObserver.observe(svgWrap);

      /* Store last render params so redraw can replay them */
      this._lastRender = null;
    },

    /* ── updateAsync(): receive data, store params, trigger draw ─────────── */
    updateAsync(data, element, config, queryResponse, details, done) {
      const measures = queryResponse.fields.measure_like || [];
      if (!measures.length || !data.length) {
        this._titleEl.textContent = config.title || "Gauge";
        this._svgWrap.innerHTML   = "";
        done();
        return;
      }

      const valField = measures[0].name;
      const maxField = measures.length > 1 ? measures[1].name : null;

      const rawVal = data[0][valField];
      const value  = rawVal && rawVal.value !== undefined ? rawVal.value : rawVal;

      let maxVal = parseFloat(config.max_value) || 100;
      if (maxField) {
        const rawMax = data[0][maxField];
        const mv = rawMax && rawMax.value !== undefined ? rawMax.value : rawMax;
        if (mv !== null && mv !== undefined && !isNaN(mv)) maxVal = parseFloat(mv);
      }

      const minVal    = parseFloat(config.min_value) || 0;
      const decimals  = parseInt(config.decimals, 10) || 0;
      const strokeW   = parseFloat(config.stroke_width) || 22;
      const label     = config.title || measures[0].label_short || measures[0].label || "Value";

      this._titleEl.textContent = label;

      this._lastRender = { value, minVal, maxVal, decimals, strokeW, label, instId: this._instId };
      this._redraw();
      done();
    },

    /* ── _redraw(): compute layout and repaint SVG ─────────────────────────*/
    _redraw() {
      if (!this._lastRender) return;
      const { value, minVal, maxVal, decimals, strokeW, label, instId } = this._lastRender;

      const wrap = this._svgWrap;
      const W = wrap.clientWidth  || 300;
      const H = wrap.clientHeight || 220;

      /* Gauge geometry: semicircle from 210° → 330° (bottom-left to bottom-right)
         i.e. 240° total sweep, the open gap faces downward.
         Standard angle convention: 0°=right, 90°=bottom, 180°=left, 270°=top */
      const START_DEG = 210;  /* bottom-left */
      const END_DEG   = 330;  /* bottom-right */
      const SWEEP     = 240;  /* total degrees */

      /* Radius: fit inside available space with padding for stroke and labels */
      const pad       = strokeW / 2 + 6;
      const labelPad  = 22; /* extra room below for min/max labels */

      /* The arc center should sit slightly above the widget center so the
         label area below feels balanced. For a semicircle the bounding box
         height = r (top of circle to center) + a bit below center line. */
      const maxR      = Math.min(W / 2, H * 0.88) - pad - labelPad;
      const r         = Math.max(30, maxR);

      /* Center point — push up a bit so there's room for endpoint labels */
      const cx = W / 2;
      const cy = H / 2 + r * 0.14;

      /* Compute arc lengths for stroke-dasharray trick */
      const circumference = 2 * Math.PI * r;
      const arcLen        = (SWEEP / 360) * circumference;

      /* Clamp value to [min, max] */
      const clamped  = Math.min(maxVal, Math.max(minVal, value == null ? minVal : value));
      const fraction = maxVal > minVal ? (clamped - minVal) / (maxVal - minVal) : 0;
      const filled   = fraction * arcLen;

      /* Gradient stop positions along the arc */
      /* We'll use a linearGradient approximating the arc sweep.
         userSpaceOnUse coords: start point of arc → end point of arc */
      const toRad = (d) => (d * Math.PI) / 180;
      const gx1   = cx + r * Math.cos(toRad(START_DEG));
      const gy1   = cy + r * Math.sin(toRad(START_DEG));
      const gx2   = cx + r * Math.cos(toRad(END_DEG));
      const gy2   = cy + r * Math.sin(toRad(END_DEG));

      /* Track path */
      const trackD = arcPath(cx, cy, r, START_DEG, END_DEG);
      /* Filled arc — same path, masked by dasharray */
      const arcD   = trackD;

      /* Font sizes scale with radius */
      const valFontSize   = Math.max(18, Math.min(52, r * 0.32));
      const labelFontSize = Math.max(10, Math.min(18, r * 0.12));
      const endFontSize   = Math.max(9,  Math.min(14, r * 0.10));

      /* Min/max label positions (just outside arc endpoints) */
      const epOffset = strokeW / 2 + endFontSize + 2;
      const minLx    = cx + (r + epOffset) * Math.cos(toRad(START_DEG));
      const minLy    = cy + (r + epOffset) * Math.sin(toRad(START_DEG));
      const maxLx    = cx + (r + epOffset) * Math.cos(toRad(END_DEG));
      const maxLy    = cy + (r + epOffset) * Math.sin(toRad(END_DEG));

      /* Center value Y positions */
      const centerValY   = cy + valFontSize * 0.35;
      const centerLabelY = cy - valFontSize * 0.55;

      /* Build SVG */
      const gradId  = `rgg-arc-grad-${instId}`;
      const maskId  = `rgg-arc-mask-${instId}`;

      const svgNS = "http://www.w3.org/2000/svg";
      const svg   = document.createElementNS(svgNS, "svg");
      svg.setAttribute("class",   "rgg-svg");
      svg.setAttribute("width",   W);
      svg.setAttribute("height",  H);
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

      svg.innerHTML = `
        <defs>
          <!-- Gradient runs from arc start to arc end -->
          <linearGradient id="${gradId}"
            gradientUnits="userSpaceOnUse"
            x1="${gx1}" y1="${gy1}"
            x2="${gx2}" y2="${gy2}">
            <stop offset="0%"    stop-color="${T.B}"/>
            <stop offset="45%"   stop-color="${T.P}"/>
            <stop offset="100%"  stop-color="${T.K}"/>
          </linearGradient>
        </defs>

        <!-- Track (full arc, gray) -->
        <path
          class="rgg-track"
          d="${trackD}"
          stroke-width="${strokeW}"
        />

        <!-- Filled arc (gradient, dasharray trick) -->
        <path
          class="rgg-arc"
          d="${arcD}"
          stroke="url(#${gradId})"
          stroke-width="${strokeW}"
          stroke-dasharray="${arcLen}"
          stroke-dashoffset="${arcLen - filled}"
        />

        <!-- Center label (measure name) -->
        <text class="rgg-center-label"
          x="${cx}" y="${centerLabelY}"
          font-size="${labelFontSize}">
          ${esc(label)}
        </text>

        <!-- Center value -->
        <text class="rgg-center-value"
          x="${cx}" y="${centerValY}"
          font-size="${valFontSize}">
          ${fmt(clamped, decimals)}
        </text>

        <!-- Min label -->
        <text class="rgg-endpoint"
          x="${minLx}" y="${minLy}"
          text-anchor="middle"
          font-size="${endFontSize}">
          ${fmt(minVal, decimals)}
        </text>

        <!-- Max label -->
        <text class="rgg-endpoint"
          x="${maxLx}" y="${maxLy}"
          text-anchor="middle"
          font-size="${endFontSize}">
          ${fmt(maxVal, decimals)}
        </text>
      `;

      wrap.innerHTML = "";
      wrap.appendChild(svg);
    },
  });

  /* ─── HTML escape helper ────────────────────────────────────────────────── */
  function esc(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

})();
