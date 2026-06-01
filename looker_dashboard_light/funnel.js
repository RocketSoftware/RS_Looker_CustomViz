/**
 * Rocket Software — Funnel Chart
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add the URL.
 *   3. Select "Rocket — Funnel (Light)" from the visualization picker.
 *
 * Expects:
 *   - One dimension  (segment label)
 *   - One measure    (segment value)
 *
 * Features:
 *   - Inverted triangle funnel with proportional band heights
 *   - Left-side labels with connector lines
 *   - Hover highlight + tooltip
 *   - Optional sort descending, percentage display
 *   - Fully responsive
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

  /* ─── CSS ─────────────────────────────────────────────────────────────── */
  const CSS = `
    .rfn-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      background: ${T.bg};
      overflow: hidden;
      box-sizing: border-box;
    }
    .rfn-topbar {
      background: ${T.surf};
      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo};
      display: flex; align-items: center; gap: 9px;
      flex-shrink: 0;
    }
    .rfn-logo  { width: 20px; height: 20px; flex-shrink: 0; opacity: .85; }
    .rfn-title {
      font-size: 15px; font-weight: 500; color: ${T.tx};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rfn-gline {
      height: 2px;
      background: linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K});
      background-size: 200% 100%;
      flex-shrink: 0;
      animation: rfn-flow 5s ease-in-out infinite alternate;
    }
    @keyframes rfn-flow {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }
    .rfn-body {
      flex: 1; min-height: 0;
      position: relative; overflow: hidden;
    }
    .rfn-svg { display: block; width: 100%; height: 100%; }

    /* ── Funnel segments ── */
    .rfn-seg {
      cursor: pointer;
      transition: filter .15s;
    }
    .rfn-seg:hover        { filter: brightness(1.12); }
    .rfn-seg.rfn-dimmed   { opacity: .35; }
    .rfn-seg.rfn-pinned   { filter: brightness(1.18) drop-shadow(0 0 4px rgba(0,0,0,0.22)); }

    /* ── Labels ── */
    .rfn-label-text {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13px;
      fill: ${T.tx};
    }
    .rfn-label-val {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      fill: ${T.mt};
    }
    .rfn-connector {
      stroke: ${T.bo};
      stroke-width: 1;
      fill: none;
    }

    /* ── Title (inside SVG) ── */
    .rfn-chart-title {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 600;
      fill: ${T.tx};
    }

    /* ── Tooltip ── */
    .rfn-tooltip {
      position: fixed;
      pointer-events: none;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: rgba(255,255,255,0.98);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(0,0,0,0.09);
      border-radius: 10px;
      overflow: hidden;
      z-index: 9999;
      opacity: 0;
      transform: translateY(6px) scale(0.97);
      transition: opacity .15s ease, transform .15s ease;
      box-shadow: 0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04);
      min-width: 160px; max-width: 220px;
    }
    .rfn-tooltip.visible { opacity: 1; transform: translateY(0) scale(1); }
    .rfn-tt-accent  { height: 3px; }
    .rfn-tt-body    { padding: 10px 14px 12px; }
    .rfn-tt-label   { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6B6B7B; margin-bottom: 6px; }
    .rfn-tt-value   { font-size: 22px; font-weight: 600; color: ${T.tx}; letter-spacing: -.3px; line-height: 1; margin-bottom: 3px; font-variant-numeric: tabular-nums; }
    .rfn-tt-pct     { font-size: 13px; color: ${T.mt}; }

    /* ── State overlay ── */
    .rfn-state {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      color: ${T.mt}; font-size: 14px; pointer-events: none;
    }
  `;

  /* ─── Logo SVG ────────────────────────────────────────────────────────── */
  const LOGO_SVG = `<svg class="rfn-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rfn-lg" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%"   stop-color="${T.B}"/>
        <stop offset="50%"  stop-color="${T.P}"/>
        <stop offset="100%" stop-color="${T.K}"/>
      </linearGradient>
    </defs>
    <path d="M3 18 Q6 13 10 15 Q14 8 19 6" stroke="url(#rfn-lg)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M14 6 L19 6 L19 11"           stroke="url(#rfn-lg)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  </svg>`;

  /* ─── Helpers ─────────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function fmtNumber(v) {
    if (v == null || v === "") return "—";
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
    if (isNaN(n)) return String(v);
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    if (Number.isInteger(n)) return n.toLocaleString();
    return n.toFixed(2);
  }

  /**
   * Interpolate a color through the brand gradient:
   *   t=0 → #5040F5 (blue)
   *   t=0.5 → #8638CA (purple)
   *   t=1 → #C038B5 (pink)
   */
  function brandColor(t) {
    t = Math.max(0, Math.min(1, t));
    const stops = [
      [0x50, 0x40, 0xF5],
      [0x73, 0x3A, 0xD7],
      [0x86, 0x38, 0xCA],
      [0xA9, 0x38, 0xBD],
      [0xC0, 0x38, 0xB5],
    ];
    const seg  = t * (stops.length - 1);
    const i    = Math.min(Math.floor(seg), stops.length - 2);
    const f    = seg - i;
    const a    = stops[i];
    const b    = stops[i + 1];
    const r    = Math.round(a[0] + (b[0] - a[0]) * f);
    const g    = Math.round(a[1] + (b[1] - a[1]) * f);
    const bl   = Math.round(a[2] + (b[2] - a[2]) * f);
    return `rgb(${r},${g},${bl})`;
  }

  /* ─── Viz definition ──────────────────────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_funnel_light",
    label: "Rocket — Funnel (Light)",

    options: {
      title_override: {
        type: "string", label: "Chart title", default: "",
        placeholder: "Leave blank to use field label",
        section: "Value", order: 1,
      },
      value_prefix: {
        type: "string", label: "Value prefix (e.g. $)", default: "",
        section: "Value", order: 2,
      },
      value_suffix: {
        type: "string", label: "Value suffix (e.g. %)", default: "",
        section: "Value", order: 3,
      },
      show_percentage: {
        type: "boolean", label: "Show % of total alongside value", default: true,
        section: "Value", order: 4,
      },
      sort_descending: {
        type: "boolean", label: "Sort largest value to top", default: false,
        section: "Value", order: 5,
      },
      min_tip_width: {
        type: "string", label: "Funnel tip width",
        display: "select",
        values: [
          { "Point (0px)":  "0"  },
          { "Narrow (20px)": "20" },
          { "Medium (40px)": "40" },
        ],
        default: "0", section: "Style", order: 6,
      },
    },

    /* ── create ─────────────────────────────────────────────────────────── */
    create(el, config) {
      if (!document.getElementById("rfn-styles")) {
        const st = document.createElement("style");
        st.id = "rfn-styles";
        st.textContent = CSS;
        document.head.appendChild(st);
      }

      el.innerHTML = "";

      const root = document.createElement("div");
      root.className = "rfn-root";
      el.appendChild(root);
      this._root = root;

      // Topbar
      const topbar = document.createElement("div");
      topbar.className = "rfn-topbar";
      topbar.innerHTML = LOGO_SVG + `<span class="rfn-title">Funnel</span>`;
      root.appendChild(topbar);
      this._titleEl = topbar.querySelector(".rfn-title");

      // Gradient line
      const gline = document.createElement("div");
      gline.className = "rfn-gline";
      root.appendChild(gline);

      // Body
      const body = document.createElement("div");
      body.className = "rfn-body";
      root.appendChild(body);
      this._body = body;

      // SVG
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "rfn-svg");
      body.appendChild(svg);
      this._svg = svg;

      // State overlay
      const stateEl = document.createElement("div");
      stateEl.className = "rfn-state";
      body.appendChild(stateEl);
      this._stateEl = stateEl;

      // Tooltip
      const tip = document.createElement("div");
      tip.className = "rfn-tooltip";
      tip.innerHTML = `<div class="rfn-tt-accent"></div><div class="rfn-tt-body">
        <div class="rfn-tt-label"></div>
        <div class="rfn-tt-value"></div>
        <div class="rfn-tt-pct"></div>
      </div>`;
      document.body.appendChild(tip);
      this._tip = tip;

      this._pinned  = null;
      this._hovered = null;

      // ResizeObserver
      this._debounce = null;
      const self = this;
      if (typeof ResizeObserver !== "undefined") {
        this._ro = new ResizeObserver(function() {
          clearTimeout(self._debounce);
          self._debounce = setTimeout(function() {
            if (self._lastArgs) self._draw.apply(self, self._lastArgs);
          }, 80);
        });
        this._ro.observe(body);
      }
    },

    /* ── updateAsync ─────────────────────────────────────────────────────── */
    updateAsync(data, el, config, qr, details, done) {
      const dims  = qr.fields.dimensions         || [];
      const meass = qr.fields.measures           || [];
      const calcs = qr.fields.table_calculations || [];
      const allM  = [...meass, ...calcs];

      const dimF  = dims[0];
      const measF = allM[0];

      this._titleEl.textContent =
        config.title_override ||
        (measF ? measF.label_short || measF.label : "Funnel");

      if (!dimF || !measF || data.length === 0) {
        this._stateEl.textContent = "Add one dimension and one measure.";
        this._stateEl.style.display = "flex";
        this._svg.innerHTML = "";
        done(); return;
      }
      this._stateEl.style.display = "none";

      // Parse rows
      let segments = data.map(function(row) {
        const dCell = row[dimF.name];
        const mCell = row[measF.name];
        const label = dCell ? (dCell.rendered != null ? dCell.rendered : String(dCell.value ?? "")) : "";
        const raw   = mCell ? mCell.value : null;
        const value = raw != null ? parseFloat(String(raw).replace(/[^0-9.\-]/g, "")) : 0;
        const rendered = mCell ? (mCell.rendered != null ? mCell.rendered : null) : null;
        return { label, value: isNaN(value) ? 0 : value, rendered };
      }).filter(function(s) { return s.value >= 0; });

      if (config.sort_descending) {
        segments = segments.slice().sort(function(a, b) { return b.value - a.value; });
      }

      this._lastArgs = [segments, el, config, done];
      this._draw(segments, el, config, done);
    },

    /* ── _draw ───────────────────────────────────────────────────────────── */
    _draw(segments, el, config, done) {
      const body = this._body;
      const svg  = this._svg;
      const W    = body.clientWidth  || 400;
      const H    = body.clientHeight || 300;

      svg.innerHTML = "";
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.setAttribute("width",  W);
      svg.setAttribute("height", H);

      const n     = segments.length;
      const total = segments.reduce(function(s, d) { return s + d.value; }, 0);
      if (n === 0 || total === 0) {
        this._stateEl.textContent = "No data to display.";
        this._stateEl.style.display = "flex";
        if (done) done(); return;
      }

      const prefix  = config.value_prefix || "";
      const suffix  = config.value_suffix || "";
      const showPct = config.show_percentage !== false;
      const minTip  = parseInt(config.min_tip_width || "0", 10);

      /* ── Layout constants ── */
      const LABEL_W   = Math.min(160, W * 0.32); // left label zone
      const RIGHT_PAD = 16;
      const TOP_PAD   = 16;
      const BOT_PAD   = 12;

      const funnelX  = LABEL_W;                      // funnel left origin
      const funnelW  = W - LABEL_W - RIGHT_PAD;      // max funnel width
      const funnelH  = H - TOP_PAD - BOT_PAD;        // funnel height

      /* ── Geometry helpers ── */
      // Width of the funnel at a given y (0 = top, funnelH = bottom)
      function funnelHalfW(y) {
        const t = y / funnelH;
        return ((funnelW - minTip) * (1 - t) + minTip) / 2;
      }

      // Center x of the funnel
      const cx = funnelX + funnelW / 2;

      /* ── Compute segment y positions ── */
      let yOffset = TOP_PAD;
      const segs = segments.map(function(s) {
        const segH = (s.value / total) * funnelH;
        const yStart = yOffset;
        const yEnd   = yOffset + segH;
        yOffset = yEnd;
        return Object.assign({}, s, { yStart, yEnd, segH });
      });

      /* ── Assign colors ── */
      segs.forEach(function(s, i) {
        s.color = brandColor(n <= 1 ? 0 : i / (n - 1));
      });

      const self = this;

      /* ── Draw segments ── */
      const segEls = [];

      segs.forEach(function(s, i) {
        const hw0 = funnelHalfW(s.yStart - TOP_PAD); // half-width at top edge
        const hw1 = funnelHalfW(s.yEnd   - TOP_PAD); // half-width at bottom edge

        const x1 = cx - hw0;  // top-left
        const x2 = cx + hw0;  // top-right
        const x3 = cx + hw1;  // bottom-right
        const x4 = cx - hw1;  // bottom-left

        const pts = `${x1.toFixed(1)},${s.yStart.toFixed(1)} ` +
                    `${x2.toFixed(1)},${s.yStart.toFixed(1)} ` +
                    `${x3.toFixed(1)},${s.yEnd.toFixed(1)} ` +
                    `${x4.toFixed(1)},${s.yEnd.toFixed(1)}`;

        const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        poly.setAttribute("class", "rfn-seg");
        poly.setAttribute("points", pts);
        poly.setAttribute("fill", s.color);
        poly.dataset.idx = i;

        svg.appendChild(poly);
        segEls.push(poly);

        /* ── Label + connector ── */
        const midY  = (s.yStart + s.yEnd) / 2;
        const labX  = LABEL_W - 8;            // label right edge
        const anchorX = x1;                   // left edge of this segment at midY
        // Anchor is the left edge at midpoint Y
        const anchorHW = funnelHalfW(midY - TOP_PAD);
        const anchorXmid = cx - anchorHW;

        // Connector line: from anchorXmid,midY → labX,midY
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("class", "rfn-connector");
        line.setAttribute("x1", anchorXmid.toFixed(1));
        line.setAttribute("y1", midY.toFixed(1));
        line.setAttribute("x2", labX.toFixed(1));
        line.setAttribute("y2", midY.toFixed(1));
        svg.appendChild(line);

        // Label name
        const rawVal  = prefix + fmtNumber(s.value) + suffix;
        const pctTxt  = showPct ? " (" + (s.value / total * 100).toFixed(1) + "%)" : "";

        // Only show label text if segment is tall enough
        if (s.segH >= 14) {
          const txtName = document.createElementNS("http://www.w3.org/2000/svg", "text");
          txtName.setAttribute("class", "rfn-label-text");
          txtName.setAttribute("x", (labX - 4).toFixed(1));
          txtName.setAttribute("y", (midY - (s.segH >= 30 ? 3 : 0)).toFixed(1));
          txtName.setAttribute("text-anchor", "end");
          txtName.setAttribute("dominant-baseline", s.segH >= 30 ? "auto" : "middle");
          txtName.textContent = s.label;
          svg.appendChild(txtName);

          if (s.segH >= 30) {
            const txtVal = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txtVal.setAttribute("class", "rfn-label-val");
            txtVal.setAttribute("x", (labX - 4).toFixed(1));
            txtVal.setAttribute("y", (midY + 13).toFixed(1));
            txtVal.setAttribute("text-anchor", "end");
            txtVal.textContent = rawVal + pctTxt;
            svg.appendChild(txtVal);
          }
        }

        /* ── Mouse events ── */
        poly.addEventListener("mouseenter", function(e) {
          self._onHover(i, e, s);
        });
        poly.addEventListener("mousemove", function(e) {
          self._moveTip(e);
        });
        poly.addEventListener("mouseleave", function() {
          self._onLeave(i);
        });
        poly.addEventListener("click", function(e) {
          e.stopPropagation();
          self._onPin(i);
        });
      });

      // Click canvas to clear pin
      svg.addEventListener("click", function() {
        self._pinned = null;
        self._applyStates(segEls);
        self._hideTip();
      });

      this._segEls = segEls;
      this._segs   = segs;
      this._total  = total;
      this._prefix = prefix;
      this._suffix = suffix;
      this._showPct = showPct;

      this._applyStates(segEls);
      if (done) done();
    },

    /* ── Interaction ─────────────────────────────────────────────────────── */
    _onHover(i, e, seg) {
      this._hovered = i;
      this._applyStates(this._segEls);
      this._showTip(e, seg, i);
    },

    _onLeave(i) {
      this._hovered = null;
      this._applyStates(this._segEls);
      if (this._pinned === null) this._hideTip();
    },

    _onPin(i) {
      if (this._pinned === i) {
        this._pinned = null;
        this._hideTip();
      } else {
        this._pinned = i;
        const seg = this._segs[i];
        const body = this._body.getBoundingClientRect();
        const midY = (seg.yStart + seg.yEnd) / 2;
        this._showTip({ clientX: body.right - 20, clientY: body.top + midY }, seg, i);
      }
      this._applyStates(this._segEls);
    },

    _applyStates(segEls) {
      const pinned  = this._pinned;
      const hovered = this._hovered;
      const hasPinned = pinned !== null;
      segEls.forEach(function(el, i) {
        el.classList.remove("rfn-pinned", "rfn-dimmed");
        if (hasPinned) {
          if (i === pinned) el.classList.add("rfn-pinned");
          else              el.classList.add("rfn-dimmed");
        } else if (i === hovered) {
          el.classList.add("rfn-pinned");
        }
      });
    },

    _showTip(e, seg, i) {
      const tip   = this._tip;
      const total = this._total || 1;
      const pct   = (seg.value / total * 100).toFixed(1) + "%";
      const disp  = this._prefix + fmtNumber(seg.value) + this._suffix;

      tip.querySelector(".rfn-tt-accent").style.background = seg.color;
      tip.querySelector(".rfn-tt-label").textContent = seg.label;
      tip.querySelector(".rfn-tt-value").textContent = disp;
      tip.querySelector(".rfn-tt-pct").textContent   = this._showPct ? pct + " of total" : "";

      tip.classList.add("visible");
      this._moveTip(e);
    },

    _moveTip(e) {
      const tip    = this._tip;
      const offset = 14;
      const tw = tip.offsetWidth  || 180;
      const th = tip.offsetHeight || 80;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let tx = e.clientX + offset;
      let ty = e.clientY - th / 2;
      if (tx + tw > vw - 8) tx = e.clientX - tw - offset;
      if (ty < 8)            ty = 8;
      if (ty + th > vh - 8)  ty = vh - th - 8;
      tip.style.left = tx + "px";
      tip.style.top  = ty + "px";
    },

    _hideTip() {
      this._tip.classList.remove("visible");
    },

    destroy() {
      if (this._ro)  this._ro.disconnect();
      if (this._tip) this._tip.remove();
      clearTimeout(this._debounce);
    },
  });
})();
