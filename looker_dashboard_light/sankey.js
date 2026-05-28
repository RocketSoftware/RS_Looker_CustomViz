/**
 * Rocket Software — Sankey / Flow Diagram
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add the URL.
 *   3. Select "Rocket — Sankey (Light)" from the visualization picker.
 *
 * Expects:
 *   - Two or more dimensions forming a flow chain:
 *       dim[0] → dim[1] → dim[2] → …
 *   - One measure (numeric) for the flow volume
 *
 * Features:
 *   - Self-contained layout (no external Sankey library)
 *   - Proportional node heights, flow bands with cubic-bezier curves
 *   - Node coloured by PALETTE (first-column nodes), links inherit source colour
 *   - Hover highlight + tooltip for nodes and links
 *   - Click-to-pin: highlights a node and all connected flows
 *   - Fully responsive via ResizeObserver
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
    bo2:  "#EBEBF0",
    tx:   "#1C1C1E",
    mt:   "#8E8E93",
    dm:   "#F2F2F7",
    B:    "#6040EC",
    P:    "#843CDC",
    K:    "#B038C8",
    ok:   "#2DD4A0",
    wn:   "#F0A830",
    er:   "#F06060",
  };

  /* ─── Color palette — blue → purple → pink brand family ─────────────── */
    const PALETTE = [
    "#6040EC", "#673FE9", "#6F3FE5", "#763EE2",
    "#7D3DDF", "#843CDC", "#8C3CD8", "#933BD5",
    "#9A3AD2", "#A139CF", "#A939CB", "#B038C8",
  ];

  /* ─── CSS ─────────────────────────────────────────────────────────────── */
  const CSS = `
    .rsk-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      background: ${T.bg};
      overflow: hidden;
      box-sizing: border-box;
      position: relative;
    }

    /* ── Topbar ── */
    .rsk-topbar {
      background: ${T.surf};
      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo};
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      flex-shrink: 0;
    }
    .rsk-topbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .rsk-logo  { width: 20px; height: 20px; flex-shrink: 0; opacity: .85; }
    .rsk-title {
      font-size: 15px; font-weight: 500; color: ${T.tx};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rsk-subtitle { font-size: 13px; color: ${T.mt}; white-space: nowrap; flex-shrink: 0; }

    /* ── Gradient accent line ── */
    .rsk-gline {
      height: 2px;
      background: linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K});
      background-size: 200% 100%;
      flex-shrink: 0;
      animation: rsk-grad-flow 5s ease-in-out infinite alternate;
    }
    @keyframes rsk-grad-flow {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }

    /* ── Body ── */
    .rsk-body {
      flex: 1; display: flex; flex-direction: column;
      min-height: 0; overflow: hidden;
      padding: 10px 14px 12px;
      box-sizing: border-box;
    }

    /* ── Chart wrap ── */
    .rsk-chart-wrap {
      flex: 1; min-height: 0;
      position: relative;
      overflow: hidden;
    }
    .rsk-chart-wrap svg { display: block; overflow: visible; }

    /* ── Nodes ── */
    .rsk-node {
      cursor: pointer;
      transition: filter .14s, opacity .16s;
    }
    .rsk-node rect {
      transition: filter .14s;
    }
    .rsk-node:hover rect { filter: brightness(1.25) drop-shadow(0 0 5px rgba(255,255,255,.15)); }
    .rsk-node.dimmed { opacity: .15; }
    .rsk-node.pinned rect { filter: brightness(1.3) drop-shadow(0 0 8px rgba(255,255,255,.22)); }

    /* ── Node labels ── */
    .rsk-node-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13px;
      fill: ${T.tx};
      pointer-events: none;
      dominant-baseline: middle;
    }
    .rsk-node-label.small { font-size: 12px; }
    .rsk-node-val {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      fill: ${T.mt};
      pointer-events: none;
      dominant-baseline: middle;
    }

    /* ── Links ── */
    .rsk-link {
      cursor: pointer;
      transition: opacity .16s;
    }
    .rsk-link path {
      transition: opacity .14s;
    }
    .rsk-link:hover path { opacity: .88 !important; }
    .rsk-link.dimmed { opacity: .08; }
    .rsk-link.highlighted path { opacity: .82 !important; }

    /* ── Column headers ── */
    .rsk-col-header {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.1px;
      fill: #7878AA;
      text-anchor: middle;
    }

    /* ── Tooltip ── */
    .rsk-tooltip {
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
      min-width: 152px; max-width: 248px;
    }
    .rsk-tooltip.visible { opacity: 1; transform: translateY(0) scale(1); }
    .rsk-tt-accent { height: 3px; }
    .rsk-tt-body   { padding: 10px 14px 13px; }
    .rsk-tt-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
    .rsk-tt-dot    { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
    .rsk-tt-label  { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.1px; color: #C0C0F0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rsk-tt-sub    { font-size: 13px; color: #8E8E93; margin-bottom: 6px; }
    .rsk-tt-value  { font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; color: ${T.tx}; letter-spacing: -0.5px; line-height: 1; margin-bottom: 3px; }
    .rsk-tt-pct    { font-size: 13px; color: #8E8E93; letter-spacing: .2px; }
    .rsk-tt-flow-arrow { color: #8888CC; font-size: 13px; }

    /* ── Empty ── */
    .rsk-empty { color: ${T.mt}; font-size: 14px; text-align: center; padding: 20px; width: 100%; }

    /* ── Entrance animation ── */
    @keyframes rsk-fade-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .rsk-node { animation: rsk-fade-in .35s ease both; }
    .rsk-link { animation: rsk-fade-in .45s ease both; }

    /* ── Responsive ── */
    .rsk-root[data-w="xs"] .rsk-topbar   { padding: 7px 10px; }
    .rsk-root[data-w="xs"] .rsk-title    { font-size: 13px; }
    .rsk-root[data-w="xs"] .rsk-subtitle { display: none; }
    .rsk-root[data-w="xs"] .rsk-body     { padding: 5px 7px; }
    .rsk-root[data-w="sm"] .rsk-subtitle { display: none; }
    .rsk-root[data-h="xs"] .rsk-topbar   { display: none; }
    .rsk-root[data-h="xs"] .rsk-gline    { display: none; }
    .rsk-root[data-h="xs"] .rsk-body     { padding: 3px 6px; }
    .rsk-root[data-h="sm"] .rsk-topbar   { padding: 6px 12px; }
    .rsk-root[data-h="sm"] .rsk-body     { padding: 5px 10px 4px; }
  `;

  /* ─── Logo SVG ────────────────────────────────────────────────────────── */
  const LOGO_SVG = `
    <svg class="rsk-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rsk-lg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${T.B}"/>
          <stop offset="50%"  stop-color="${T.P}"/>
          <stop offset="100%" stop-color="${T.K}"/>
        </linearGradient>
      </defs>
      <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
            stroke="url(#rsk-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6 L19 6 L19 11"
            stroke="url(#rsk-lg)" stroke-width="2.4" fill="none"
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

  /** Parse a hex colour into [r, g, b] */
  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }

  /** Return rgba(...) string for a hex colour at given alpha */
  function hexAlpha(hex, a) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ─── Sankey layout ───────────────────────────────────────────────────── */

  /**
   * Build nodes and links from a flat list of { source, target, value } triples.
   * Returns { nodes, links, columns }.
   *
   * nodes[i] = { id, label, column, color, value, x, y, h,
   *              sourceLinks[], targetLinks[] }
   * links[j] = { source (idx), target (idx), value,
   *              y0, y1,          ← center-Y at source / target side
   *              h,               ← pixel height of band
   *              color }
   * columns   = array of node-index arrays
   */
  function computeLayout(triples, W, H, nodeW, nodePad, colPad) {
    /* ── 1. Build node index ── */
    const nodeIds = [];
    const nodeIdx = new Map();

    function ensureNode(label) {
      if (!nodeIdx.has(label)) {
        nodeIdx.set(label, nodeIds.length);
        nodeIds.push(label);
      }
      return nodeIdx.get(label);
    }

    triples.forEach(t => { ensureNode(t.source); ensureNode(t.target); });

    const N = nodeIds.length;
    const nodes = nodeIds.map((label, i) => ({
      id: i, label,
      column: -1, color: "", value: 0,
      x: 0, y: 0, h: 0,
      sourceLinks: [], targetLinks: [],
    }));

    /* ── 2. Build links ── */
    // Aggregate duplicate source-target pairs
    const linkKey = new Map();
    triples.forEach(t => {
      const si = nodeIdx.get(t.source);
      const ti = nodeIdx.get(t.target);
      const k  = `${si}::${ti}`;
      if (linkKey.has(k)) {
        linkKey.get(k).value += t.value;
      } else {
        const lk = { source: si, target: ti, value: t.value, y0: 0, y1: 0, h: 0, color: "" };
        linkKey.set(k, lk);
        nodes[si].sourceLinks.push(lk);
        nodes[ti].targetLinks.push(lk);
      }
    });
    const links = [...linkKey.values()];

    /* ── 3. Assign columns (BFS from source-only nodes) ── */
    // A node's column = max(column of predecessors) + 1
    // Initialise: nodes with no incoming links → column 0
    const inDegree = new Array(N).fill(0);
    links.forEach(lk => inDegree[lk.target]++);

    const queue = [];
    nodes.forEach((nd, i) => {
      if (inDegree[i] === 0) { nd.column = 0; queue.push(i); }
    });

    let qi = 0;
    while (qi < queue.length) {
      const i = queue[qi++];
      nodes[i].sourceLinks.forEach(lk => {
        const j = lk.target;
        nodes[j].column = Math.max(nodes[j].column, nodes[i].column + 1);
        inDegree[j]--;
        if (inDegree[j] === 0) queue.push(j);
      });
    }

    // Any node still at -1 (cycle) → assign to column 0
    nodes.forEach(nd => { if (nd.column < 0) nd.column = 0; });

    const numCols = Math.max(...nodes.map(nd => nd.column)) + 1;

    // Push every sink (no outgoing links) to the last column
    nodes.forEach(nd => {
      if (nd.sourceLinks.length === 0) nd.column = numCols - 1;
    });

    /* ── 4. Group into columns ── */
    const columns = Array.from({ length: numCols }, () => []);
    nodes.forEach((nd, i) => columns[nd.column].push(i));

    /* ── 5. Compute node total values ── */
    nodes.forEach(nd => {
      const inFlow  = nd.targetLinks.reduce((s, lk) => s + lk.value, 0);
      const outFlow = nd.sourceLinks.reduce((s, lk) => s + lk.value, 0);
      nd.value = Math.max(inFlow, outFlow);
    });

    /* ── 6. Assign X positions ── */
    const usableW = W - 2 * colPad;
    const colW    = numCols > 1 ? (usableW - nodeW) / (numCols - 1) : usableW / 2;

    nodes.forEach(nd => {
      nd.x = colPad + nd.column * colW;
    });

    /* ── 7. Compute node heights using a global px/unit scale ── */
    // Find the column with the most total flow to set the scale
    let maxColFlow = 0;
    columns.forEach(col => {
      const ct = col.reduce((s, i) => s + nodes[i].value, 0);
      if (ct > maxColFlow) maxColFlow = ct;
    });
    const maxColNodes = Math.max(...columns.map(col => col.length));
    // Scale padding down so nodes never overflow the chart height.
    // Reserve at most 35% of H for gaps; the rest goes to proportional node heights.
    const effectivePad = maxColNodes > 1
      ? Math.min(nodePad, Math.max(2, Math.floor((H * 0.35) / (maxColNodes - 1))))
      : 0;
    const totalPadMax = effectivePad * (maxColNodes - 1);
    const pxPerUnit   = maxColFlow > 0 ? (H - totalPadMax) / maxColFlow : 1;

    nodes.forEach(nd => {
      nd.h = Math.max(2, nd.value * pxPerUnit);
    });

    /* ── 8a. Initial column sort (value descending) ── */
    function repositionCol(col) {
      // Stack nodes with padding, then vertically center the whole group
      const totalH = col.reduce((s, i) => s + nodes[i].h, 0)
                   + effectivePad * (col.length - 1);
      const startY = Math.max(0, (H - totalH) / 2);
      let cursor = startY;
      col.forEach(i => {
        nodes[i].y = cursor;
        cursor += nodes[i].h + effectivePad;
      });
    }

    columns.forEach(col => {
      col.sort((a, b) => nodes[b].value - nodes[a].value);
      repositionCol(col);
    });

    /* ── 8b. Barycenter crossing minimisation (3 forward + 3 backward passes) ── */
    function barycenters(col, dir) {
      // dir: "forward" = use source node positions, "backward" = use target node positions
      col.forEach(i => {
        const nd = nodes[i];
        const links = dir === "forward" ? nd.targetLinks : nd.sourceLinks;
        if (links.length === 0) {
          nd._bary = nodes[i].y + nodes[i].h / 2;  // keep current position
          return;
        }
        nd._bary = links.reduce((s, lk) => {
          const other = nodes[dir === "forward" ? lk.source : lk.target];
          return s + other.y + other.h / 2;
        }, 0) / links.length;
      });
      col.sort((a, b) => nodes[a]._bary - nodes[b]._bary);
      repositionCol(col);
    }

    for (let pass = 0; pass < 3; pass++) {
      // Forward: columns L→R, sort by mean source Y
      for (let c = 1; c < numCols; c++) barycenters(columns[c], "forward");
      // Backward: columns R→L, sort by mean target Y
      for (let c = numCols - 2; c >= 0; c--) barycenters(columns[c], "backward");
    }

    /* ── 8. Assign colours ── */
    // Each unique source-column node gets a palette colour
    // Colours propagate to downstream nodes via majority-input link
    const colourMap = new Map();
    let paletteIdx = 0;

    // Assign colours column by column
    for (let c = 0; c < numCols; c++) {
      columns[c].forEach(i => {
        const nd = nodes[i];
        if (c === 0 || nd.targetLinks.length === 0) {
          // Root nodes or unreachable: assign from palette
          nd.color = PALETTE[paletteIdx % PALETTE.length];
          paletteIdx++;
        } else {
          // Inherit colour from the largest incoming link's source
          let bestLink = nd.targetLinks[0];
          nd.targetLinks.forEach(lk => {
            if (lk.value > bestLink.value) bestLink = lk;
          });
          nd.color = nodes[bestLink.source].color || PALETTE[paletteIdx++ % PALETTE.length];
        }
        colourMap.set(nd.id, nd.color);
      });
    }

    /* ── 9. Assign link Y offsets ── */
    // Sort each node's port lists by the Y position of the connected node.
    // This makes bands leave/arrive in the same vertical order as their
    // partner nodes, eliminating local crossings within each node's fan.
    nodes.forEach(nd => {
      nd.sourceLinks.sort((a, b) => nodes[a.target].y - nodes[b.target].y);
      nd.targetLinks.sort((a, b) => nodes[a.source].y - nodes[b.source].y);
    });

    const srcOffset = new Array(N).fill(0);
    const tgtOffset = new Array(N).fill(0);

    // Walk links column by column in source-node Y order
    const sortedLinks = [...links].sort((a, b) => {
      const colA = nodes[a.source].column;
      const colB = nodes[b.source].column;
      if (colA !== colB) return colA - colB;
      // Within the same column, walk by source node top-to-bottom,
      // then by target node top-to-bottom (same ordering as port sort above)
      if (nodes[a.source].y !== nodes[b.source].y)
        return nodes[a.source].y - nodes[b.source].y;
      return nodes[a.target].y - nodes[b.target].y;
    });

    sortedLinks.forEach(lk => {
      const si  = lk.source, ti = lk.target;
      const snd = nodes[si],  tnd = nodes[ti];
      const pxH = Math.max(1, lk.value * pxPerUnit);
      lk.h = pxH;

      lk.y0 = snd.y + srcOffset[si] + pxH / 2;
      srcOffset[si] += pxH;

      lk.y1 = tnd.y + tgtOffset[ti] + pxH / 2;
      tgtOffset[ti] += pxH;

      lk.color = snd.color;
    });

    return { nodes, links, columns, numCols };
  }

  /* ─── SVG creation helpers ───────────────────────────────────────────── */

  function svgEl(tag, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  /**
   * Build cubic-bezier band path between two vertical edges.
   * Returns an SVG path `d` string for a filled band.
   */
  function bandPath(x0, y0, x1, y1, h0, h1) {
    const mx = (x0 + x1) / 2;
    const top0 = y0 - h0 / 2, bot0 = y0 + h0 / 2;
    const top1 = y1 - h1 / 2, bot1 = y1 + h1 / 2;
    return [
      `M ${x0} ${top0}`,
      `C ${mx} ${top0}, ${mx} ${top1}, ${x1} ${top1}`,
      `L ${x1} ${bot1}`,
      `C ${mx} ${bot1}, ${mx} ${bot0}, ${x0} ${bot0}`,
      "Z",
    ].join(" ");
  }

  /* ─── Viz definition ──────────────────────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_sankey_light",
    label: "Rocket — Sankey (Light)",

    options: {
      title: {
        type: "string", label: "Chart title", default: "",
        section: "Style", order: 1,
      },
      node_width: {
        type: "number", label: "Node width (px)", default: 14,
        section: "Style", order: 2,
      },
      node_padding: {
        type: "number", label: "Node gap (px)", default: 18,
        section: "Style", order: 3,
      },
      show_col_headers: {
        type: "boolean", label: "Show column headers", default: true,
        section: "Style", order: 4,
      },
      link_opacity: {
        type: "number", label: "Link opacity (0–1)", default: 0.38,
        section: "Style", order: 5,
      },
    },

    /* ── create ─────────────────────────────────────────────────────────── */
    create(el, config) {
      if (!document.getElementById("rsk-light-styles")) {
        const st = document.createElement("style");
        st.id = "rsk-light-styles";
        st.textContent = CSS;
        document.head.appendChild(st);
      }

      el.innerHTML = "";
      const root = document.createElement("div");
      root.className = "rsk-root";
      el.appendChild(root);
      this._root = root;

      // Topbar
      const topbar = document.createElement("div");
      topbar.className = "rsk-topbar";
      topbar.innerHTML = `
        <div class="rsk-topbar-left">
          ${LOGO_SVG}
          <span class="rsk-title">Sankey</span>
        </div>
        <span class="rsk-subtitle"></span>`;
      root.appendChild(topbar);
      this._titleEl    = topbar.querySelector(".rsk-title");
      this._subtitleEl = topbar.querySelector(".rsk-subtitle");

      // Gradient accent line
      const gline = document.createElement("div");
      gline.className = "rsk-gline";
      root.appendChild(gline);

      // Body
      const body = document.createElement("div");
      body.className = "rsk-body";
      root.appendChild(body);
      this._body = body;

      // Chart wrap
      const wrap = document.createElement("div");
      wrap.className = "rsk-chart-wrap";
      body.appendChild(wrap);
      this._wrap = wrap;

      // Tooltip
      const tip = document.createElement("div");
      tip.className = "rsk-tooltip";
      tip.innerHTML = `<div class="rsk-tt-accent"></div><div class="rsk-tt-body"></div>`;
      document.body.appendChild(tip);
      this._tip = tip;

      // State
      this._pinnedId  = null;  // node id or link key
      this._pinnedType = null; // "node" | "link"

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
      const root       = this._root;
      const wrap       = this._wrap;
      const titleEl    = this._titleEl;
      const subtitleEl = this._subtitleEl;

      const W = wrap.clientWidth  || 600;
      const H = wrap.clientHeight || 340;
      applyBreakpoints(root, W, H);

      /* ── Fields ── */
      const dims  = queryResponse.fields.dimensions || [];
      const meass = queryResponse.fields.measures   || [];
      const tcs   = queryResponse.fields.table_calculations || [];
      const allMeas = [...meass, ...tcs];

      const measField = allMeas[0];

      titleEl.textContent    = config.title || "Sankey";
      subtitleEl.textContent = measField
        ? (measField.label_short || measField.label)
        : "";

      /* ── Validate ── */
      if (dims.length < 2 || !measField) {
        wrap.innerHTML =
          `<div class="rsk-empty">Add at least 2 dimensions (source → target) and 1 measure.</div>`;
        done();
        return;
      }

      /* ── Build triples from chained dimensions ── */
      const triples = [];

      data.forEach(row => {
        const val = row[measField.name];
        const v   = val ? parseFloat(String(val.value).replace(/[^0-9.\-]/g, "")) : null;
        if (v == null || isNaN(v) || v <= 0) return;

        // Each consecutive pair of dims creates a link
        for (let i = 0; i < dims.length - 1; i++) {
          const srcCell = row[dims[i].name];
          const tgtCell = row[dims[i + 1].name];
          const src = srcCell ? (srcCell.rendered || String(srcCell.value || "")) : "(none)";
          const tgt = tgtCell ? (tgtCell.rendered || String(tgtCell.value || "")) : "(none)";
          if (src && tgt) {
            triples.push({ source: src, target: tgt, value: v });
          }
        }
      });

      if (triples.length === 0) {
        wrap.innerHTML = `<div class="rsk-empty">No data to display.</div>`;
        done();
        return;
      }

      /* ── Layout constants ── */
      const nodeW   = Math.max(6, config.node_width   || 14);
      const nodePad = Math.max(4, config.node_padding  || 18);
      const colPad  = 14;
      const HEADER_H = 0;  // column headers removed — they cluttered the top of the chart
      const chartH   = Math.max(60, H - HEADER_H);
      const linkAlpha = Math.max(0.05, Math.min(0.9, config.link_opacity != null ? config.link_opacity : 0.38));

      /* ── Compute layout ── */
      const layout = computeLayout(triples, W, chartH, nodeW, nodePad, colPad);
      const { nodes, links, columns, numCols } = layout;

      /* ── Compute label clearance from actual label lengths ── */
      const CH = 5.8;  // avg px per char at 11px Inter
      // Left column nodes have no labels → use minimal left margin
      const leftLabW  = colPad;
      const rightMaxChars = Math.max(0, ...columns[numCols - 1].map(i => nodes[i].label.length));
      const rightLabW = Math.min(260, Math.max(80, Math.ceil(rightMaxChars * CH) + 20));

      // Recompute X positions with label margins
      const innerW  = W - leftLabW - rightLabW;
      const colSpan = numCols > 1 ? (innerW - nodeW) / (numCols - 1) : innerW / 2;

      nodes.forEach(nd => {
        nd.x = leftLabW + nd.column * colSpan;
      });

      /* ── SVG ── */
      wrap.innerHTML = "";
      const svg = svgEl("svg", {
        width: W, height: H,
        viewBox: `0 0 ${W} ${H}`,
        class: "rsk-svg",
        style: "display:block; overflow:visible;",
      });
      wrap.appendChild(svg);

      /* ── Links layer ── */
      const linksG = svgEl("g", { class: "rsk-links" });
      svg.appendChild(linksG);

      const self = this;

      links.forEach((lk, li) => {
        const snd = nodes[lk.source];
        const tnd = nodes[lk.target];
        const x0  = snd.x + nodeW;
        const x1  = tnd.x;
        const y0  = HEADER_H + lk.y0;
        const y1  = HEADER_H + lk.y1;
        const d   = bandPath(x0, y0, x1, y1, lk.h, lk.h);
        const key = `lk_${li}`;

        const g = svgEl("g", { class: "rsk-link", "data-key": key });
        g.style.animationDelay = `${li * 12}ms`;

        const path = svgEl("path", { d, fill: hexAlpha(lk.color, linkAlpha) });
        g.appendChild(path);
        linksG.appendChild(g);

        lk._key   = key;
        lk._el    = g;
        lk._path  = path;
        lk._alpha = linkAlpha;

        g.addEventListener("mouseenter", (e) => {
          self._showLinkTip(lk, snd, tnd, e);
          if (!self._pinnedId) {
            path.style.setProperty("fill", hexAlpha(lk.color, Math.min(0.95, linkAlpha * 2)));
          }
        });
        g.addEventListener("mousemove",  (e) => { self._moveTip(e); });
        g.addEventListener("mouseleave", ()  => {
          if (!self._pinnedId) {
            path.style.removeProperty("fill");
            self._hideTip();
          }
        });
        g.addEventListener("click", (e) => {
          e.stopPropagation();
          self._onPinLink(key, lk, snd, tnd, e);
        });
      });

      /* ── Nodes layer ── */
      const nodesG = svgEl("g", { class: "rsk-nodes" });
      svg.appendChild(nodesG);

      // Compute total flow for % calculation
      const grandTotal = links.reduce((s, lk) => s + lk.value, 0) || 1;

      nodes.forEach((nd, ni) => {
        const x = nd.x;
        const y = HEADER_H + nd.y;
        const g = svgEl("g", {
          class: "rsk-node",
          "data-id": nd.id,
          transform: `translate(${x}, ${y})`,
        });
        g.style.animationDelay = `${ni * 20}ms`;

        // Label placement flags — needed before we decide what to render
        const isFirst = nd.column === 0;
        const isLast  = nd.column === numCols - 1;
        const midY    = nd.h / 2;

        // First-column (source) nodes: no visible bar — flows just emanate from the left.
        // All other nodes: render the colored rectangle.
        if (!isFirst) {
          const rect = svgEl("rect", {
            x: 0, y: 0,
            width: nodeW, height: nd.h,
            rx: 3, ry: 3,
            fill: nd.color,
          });
          g.appendChild(rect);
        }
        nodesG.appendChild(g);

        nd._el = g;

        // Labels are added to a dedicated layer after this loop (see labelsG below).

        // Events
        g.addEventListener("mouseenter", (e) => {
          self._showNodeTip(nd, grandTotal, e);
          if (!self._pinnedId) self._hoverNode(nd.id);
        });
        g.addEventListener("mousemove",  (e) => { self._moveTip(e); });
        g.addEventListener("mouseleave", ()  => {
          if (!self._pinnedId) {
            self._clearHover();
            self._hideTip();
          }
        });
        g.addEventListener("click", (e) => {
          e.stopPropagation();
          self._onPinNode(nd.id, nd, grandTotal, e);
        });
      });

      /* ── Labels layer (on top of everything, absolute SVG coords) ── */
      // Rendered after nodes/links so they're never clipped by group transforms.
      const labelsG = svgEl("g", { class: "rsk-labels", "pointer-events": "none" });
      svg.appendChild(labelsG);

      const maxChars = Math.max(10, Math.floor(rightLabW / CH) - 1);

      nodes.forEach(nd => {
        if (nd.column === 0) return;          // no labels for source column
        const absX = nd.x + nodeW + 6;        // absolute SVG x (right of bar)
        const absY = HEADER_H + nd.y + nd.h / 2;  // vertical centre of node

        const maxC = Math.max(10, Math.floor((W - absX - 4) / CH));
        const lbl  = nd.label.length > maxC ? nd.label.slice(0, maxC - 1) + "…" : nd.label;

        const nameTxt = svgEl("text", {
          class: nd.h < 14 ? "rsk-node-label small" : "rsk-node-label",
          x: absX, y: absY - (nd.h >= 18 ? 5 : 0),
          "text-anchor": "start",
        });
        nameTxt.textContent = lbl;
        labelsG.appendChild(nameTxt);

        // Value — always shown on a second line when there is vertical room,
        // or inline when node is tiny (< 14 px tall)
        const valTxt = svgEl("text", {
          class: "rsk-node-val",
          x: absX,
          y: nd.h >= 18 ? absY + 7 : absY + 10,
          "text-anchor": "start",
        });
        valTxt.textContent = fmtNumber(nd.value);
        labelsG.appendChild(valTxt);
      });

      // SVG background click → clear pin
      svg.addEventListener("click", () => {
        self._pinnedId   = null;
        self._pinnedType = null;
        self._clearHover();
        self._hideTip();
      });

      // Store for interaction
      this._nodes      = nodes;
      this._links      = links;
      this._grandTotal = grandTotal;

      this._applyStates();
      done();
    },

    /* ── Tooltip ─────────────────────────────────────────────────────────── */
    _showNodeTip(nd, grandTotal, e) {
      const tip    = this._tip;
      const accent = tip.querySelector(".rsk-tt-accent");
      const body   = tip.querySelector(".rsk-tt-body");
      const pct    = grandTotal > 0
        ? ((nd.value / grandTotal) * 100).toFixed(1) + "%"
        : "—";

      accent.style.background = nd.color;
      body.innerHTML = `
        <div class="rsk-tt-header">
          <div class="rsk-tt-dot" style="background:${esc(nd.color)}"></div>
          <span class="rsk-tt-label">${esc(nd.label)}</span>
        </div>
        <div class="rsk-tt-value">${esc(fmtNumber(nd.value))}</div>
        <div class="rsk-tt-pct">${esc(pct)} of total</div>`;

      tip.classList.add("visible");
      this._moveTip(e);
    },

    _showLinkTip(lk, snd, tnd, e) {
      const tip    = this._tip;
      const accent = tip.querySelector(".rsk-tt-accent");
      const body   = tip.querySelector(".rsk-tt-body");
      const grandTotal = this._grandTotal || 1;
      const pct    = ((lk.value / grandTotal) * 100).toFixed(1) + "%";

      accent.style.background = lk.color;
      body.innerHTML = `
        <div class="rsk-tt-header">
          <div class="rsk-tt-dot" style="background:${esc(lk.color)}"></div>
          <span class="rsk-tt-label">${esc(snd.label)}</span>
        </div>
        <div class="rsk-tt-sub">
          <span class="rsk-tt-flow-arrow">→</span> ${esc(tnd.label)}
        </div>
        <div class="rsk-tt-value">${esc(fmtNumber(lk.value))}</div>
        <div class="rsk-tt-pct">${esc(pct)} of total</div>`;

      tip.classList.add("visible");
      this._moveTip(e);
    },

    _moveTip(e) {
      const tip    = this._tip;
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

    _hideTip() {
      this._tip.classList.remove("visible");
    },

    /* ── Interactions ────────────────────────────────────────────────────── */
    _hoverNode(nodeId) {
      if (!this._nodes) return;
      const connectedLinks = new Set();
      this._links.forEach((lk, li) => {
        if (lk.source === nodeId || lk.target === nodeId) {
          connectedLinks.add(li);
        }
      });
      this._nodes.forEach(nd => {
        if (!nd._el) return;
        nd._el.classList.toggle("dimmed", nd.id !== nodeId);
      });
      this._links.forEach((lk, li) => {
        if (!lk._el) return;
        const active = connectedLinks.has(li);
        lk._el.classList.toggle("dimmed",       !active);
        lk._el.classList.toggle("highlighted",   active);
      });
    },

    _hoverLink(linkKey) {
      if (!this._links) return;
      this._links.forEach(lk => {
        if (!lk._el) return;
        const active = lk._key === linkKey;
        lk._el.classList.toggle("dimmed",      !active);
        lk._el.classList.toggle("highlighted",  active);
      });
      // dim all nodes slightly
      this._nodes.forEach(nd => {
        if (!nd._el) return;
        nd._el.classList.add("dimmed");
      });
    },

    _clearHover() {
      if (this._nodes) this._nodes.forEach(nd => {
        if (nd._el) nd._el.classList.remove("dimmed", "pinned");
      });
      if (this._links) this._links.forEach(lk => {
        if (lk._el) lk._el.classList.remove("dimmed", "highlighted");
      });
    },

    _onPinNode(nodeId, nd, grandTotal, e) {
      if (this._pinnedId === nodeId && this._pinnedType === "node") {
        this._pinnedId   = null;
        this._pinnedType = null;
        this._clearHover();
        this._hideTip();
      } else {
        this._pinnedId   = nodeId;
        this._pinnedType = "node";
        this._hoverNode(nodeId);
        nd._el && nd._el.classList.add("pinned");
        this._showNodeTip(nd, grandTotal, e);
      }
    },

    _onPinLink(key, lk, snd, tnd, e) {
      if (this._pinnedId === key && this._pinnedType === "link") {
        this._pinnedId   = null;
        this._pinnedType = null;
        this._clearHover();
        this._hideTip();
      } else {
        this._pinnedId   = key;
        this._pinnedType = "link";
        this._hoverLink(key);
        this._showLinkTip(lk, snd, tnd, e);
      }
    },

    _applyStates() {
      // Fresh render — ensure clean state
      this._clearHover();
      if (this._pinnedId && this._pinnedType === "node") {
        const nd = this._nodes ? this._nodes.find(n => n.id === this._pinnedId) : null;
        if (nd) {
          this._hoverNode(this._pinnedId);
          nd._el && nd._el.classList.add("pinned");
        }
      } else if (this._pinnedId && this._pinnedType === "link") {
        this._hoverLink(this._pinnedId);
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
