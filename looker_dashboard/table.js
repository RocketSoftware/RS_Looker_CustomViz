/**
 * Rocket Software — Custom Looker Visualization
 * Accounts Table with Brand Styling
 *
 * To install:
 *   1. Host this file on a publicly accessible URL (or use Looker's Marketplace file hosting).
 *   2. In Looker Admin → Visualizations, add a new visualization and paste the URL.
 *   3. In any Explore, select "Rocket — Accounts Table" from the visualization picker.
 *
 * Supported field types: dimensions, measures, table calculations — with and without pivots.
 *
 * Pivot support:
 *   When a pivot is applied, the table renders a two-row header:
 *     Row 1 — dimension columns (rowspan=2) | pivot-value groups (colspan = # measures each)
 *     Row 2 — measure / table-calc names repeated under each pivot group
 *   Sorting, search, and pagination all work across pivot columns.
 *
 * Version: 1.2.0  |  May 2025
 */

(function () {
  "use strict";

  /* ─── Brand tokens ────────────────────────────────────────────────────── */
  const T = {
    bg:      "#05050E",
    surf:    "#09091C",
    card:    "#0D0D22",
    card2:   "#121230",
    bo:      "rgba(100,65,210,.22)",
    bo2:     "rgba(100,65,210,.11)",
    tx:      "#E2E2FF",
    mt:      "#595985",
    dm:      "#2A2A52",
    B:       "#3B7EF6",
    P:       "#7B3FE4",
    K:       "#D9349A",
    ok:      "#2DD4A0",
    wn:      "#F0A830",
    er:      "#F06060",
    okBg:    "rgba(45,212,160,.12)",
    wnBg:    "rgba(240,168,48,.12)",
    erBg:    "rgba(240,96,96,.12)",
    bBg:     "rgba(59,126,246,.15)",
    bTx:     "#7FAAFF",
    pBg:     "rgba(123,63,228,.15)",
    pTx:     "#B890FF",
  };

  /* ─── Injected CSS ────────────────────────────────────────────────────── */
  const CSS = `
    .rkt-wrap {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: ${T.bg};
      color: ${T.tx};
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: 10px;
      border: 1px solid ${T.bo};
      box-sizing: border-box;
    }
    .rkt-topbar {
      background: ${T.surf};
      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo};
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      flex-shrink: 0;
    }
    .rkt-topbar-left { display: flex; align-items: center; gap: 9px; min-width: 0; }
    .rkt-logo { width: 22px; height: 22px; flex-shrink: 0; }
    .rkt-title {
      font-size: 15px; font-weight: 500; color: ${T.tx};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rkt-count { font-size: 12px; color: #A8A8D0; white-space: nowrap; }
    .rkt-gline {
      height: 2px;
      background: linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K});
      background-size: 200% 100%;
      flex-shrink: 0;
      animation: rkt-grad-flow 5s ease-in-out infinite alternate;
    }
    @keyframes rkt-grad-flow {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }
    .rkt-toolbar {
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: ${T.surf};
      border-bottom: 1px solid ${T.bo2};
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    .rkt-search {
      flex: 1;
      min-width: 80px;
      background: ${T.card};
      border: 1px solid ${T.bo2};
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 13px;
      color: #EDEDFF;
      outline: none;
      transition: border-color .15s;
    }
    .rkt-search::placeholder { color: #7878A8; }
    .rkt-search:focus { border-color: rgba(123,63,228,.5); }
    .rkt-pg-info { font-size: 12px; color: #A8A8D0; white-space: nowrap; }
    .rkt-pg-btn {
      background: ${T.card};
      border: 1px solid ${T.bo2};
      border-radius: 5px;
      color: #C8C8EE;
      font-size: 12px;
      padding: 5px 11px;
      cursor: pointer;
      transition: all .15s;
      white-space: nowrap;
    }
    .rkt-pg-btn:hover:not(:disabled) { border-color: rgba(123,63,228,.45); color: ${T.tx}; }
    .rkt-pg-btn:disabled { opacity: .35; cursor: default; }
    .rkt-table-wrap { flex: 1; overflow-y: auto; overflow-x: auto; }
    .rkt-table-wrap::-webkit-scrollbar { width: 5px; height: 5px; }
    .rkt-table-wrap::-webkit-scrollbar-track { background: ${T.bg}; }
    .rkt-table-wrap::-webkit-scrollbar-thumb { background: rgba(123,63,228,.3); border-radius: 3px; }
    .rkt-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      table-layout: auto;
    }
    .rkt-table thead { position: sticky; top: 0; z-index: 2; }

    /* ── Base header cell ── */
    .rkt-table th {
      background: ${T.surf};
      color: #7878A8;
      font-weight: 500;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .6px;
      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo2};
      border-right: 1px solid rgba(100,65,210,.1);
      text-align: left;
      white-space: nowrap;
      user-select: none;
      transition: color .15s;
    }

    /* ── Sortable header cells (dimension + leaf measure under pivot) ── */
    .rkt-table th.rkt-sortable {
      cursor: pointer;
    }
    .rkt-table th.rkt-sortable:hover { color: ${T.tx}; }
    .rkt-table th.sort-asc::after    { content: ' ↑'; color: ${T.P}; }
    .rkt-table th.sort-desc::after   { content: ' ↓'; color: ${T.P}; }

    /* ── Pivot group header (first header row, spans multiple measures) ── */
    .rkt-table th.rkt-th-pivot {
      text-align: center;
      background: ${T.card};
      color: ${T.tx};
      font-size: 11px;
      font-weight: 600;
      letter-spacing: .5px;
      border-bottom: 1px solid rgba(100,65,210,.25);
      /* Left border marks the start of each pivot group */
    }
    .rkt-table th.rkt-th-pivot-start {
      border-left: 1px solid rgba(100,65,210,.28);
    }

    /* ── Measure sub-header (second header row under pivot group) ── */
    .rkt-table th.rkt-th-measure {
      background: ${T.surf};
      color: #7878A8;
      font-size: 10px;
    }
    .rkt-table th.rkt-th-measure.rkt-col-start {
      border-left: 1px solid rgba(100,65,210,.18);
    }

    /* ── Data cells that start a pivot group get a subtle left border ── */
    .rkt-table td.rkt-col-start {
      border-left: 1px solid rgba(100,65,210,.18);
    }

    .rkt-table td {
      padding: 10px 14px;
      border-bottom: 1px solid rgba(100,65,210,.06);
      border-right: 1px solid rgba(100,65,210,.1);
      color: ${T.tx};
      white-space: nowrap;
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rkt-table tr:last-child td { border-bottom: none; }
    .rkt-table th:last-child,
    .rkt-table td:last-child { border-right: none; }
    .rkt-table tbody tr { transition: background .12s; }
    .rkt-table tbody tr:hover td { background: ${T.card2}; }
    .rkt-badge {
      font-size: 11px;
      padding: 3px 9px;
      border-radius: 4px;
      display: inline-block;
      letter-spacing: .3px;
      font-weight: 400;
    }
    .rkt-badge-ok   { background: ${T.okBg}; color: ${T.ok}; }
    .rkt-badge-warn { background: ${T.wnBg}; color: ${T.wn}; }
    .rkt-badge-err  { background: ${T.erBg}; color: ${T.er}; }
    .rkt-badge-blue { background: ${T.bBg};  color: ${T.bTx}; }
    .rkt-badge-purp { background: ${T.pBg};  color: ${T.pTx}; }
    .rkt-badge-neu  { background: rgba(100,65,210,.12); color: ${T.mt}; }
    .rkt-empty {
      padding: 40px 20px;
      text-align: center;
      color: #A8A8D0;
      font-size: 14px;
    }
    .rkt-number { font-variant-numeric: tabular-nums; }
    .rkt-diag-bg {
      background-image:
        repeating-linear-gradient(135deg, rgba(100,65,210,.025) 0, rgba(100,65,210,.025) 1px, transparent 1px, transparent 18px),
        repeating-linear-gradient(45deg,  rgba(59,126,246,.02)  0, rgba(59,126,246,.02)  1px, transparent 1px, transparent 18px);
    }

    /* ── Responsive: width breakpoints via data-w on rkt-wrap ── */
    .rkt-wrap[data-w="xs"] .rkt-topbar { padding: 8px 10px; }
    .rkt-wrap[data-w="xs"] .rkt-title  { font-size: 13px; }
    .rkt-wrap[data-w="xs"] .rkt-count  { display: none; }
    .rkt-wrap[data-w="xs"] .rkt-logo   { display: none; }
    .rkt-wrap[data-w="xs"] .rkt-toolbar { flex-direction: column; align-items: stretch; padding: 6px 10px; gap: 6px; }
    .rkt-wrap[data-w="xs"] .rkt-pg-info { display: none; }
    .rkt-wrap[data-w="xs"] .rkt-pg-btn { padding: 4px 8px; font-size: 11px; }
    .rkt-wrap[data-w="xs"] .rkt-table  { font-size: 11px; }
    .rkt-wrap[data-w="xs"] .rkt-table th { padding: 7px 9px; font-size: 10px; letter-spacing: .3px; }
    .rkt-wrap[data-w="xs"] .rkt-table td { padding: 7px 9px; max-width: 120px; }
    .rkt-wrap[data-w="xs"] .rkt-badge  { font-size: 10px; padding: 2px 7px; }

    .rkt-wrap[data-w="sm"] .rkt-topbar { padding: 9px 12px; }
    .rkt-wrap[data-w="sm"] .rkt-title  { font-size: 14px; }
    .rkt-wrap[data-w="sm"] .rkt-count  { display: none; }
    .rkt-wrap[data-w="sm"] .rkt-toolbar { padding: 7px 12px; gap: 6px; }
    .rkt-wrap[data-w="sm"] .rkt-pg-info { display: none; }
    .rkt-wrap[data-w="sm"] .rkt-table th { padding: 8px 10px; }
    .rkt-wrap[data-w="sm"] .rkt-table td { padding: 8px 10px; max-width: 160px; }

    .rkt-wrap[data-w="md"] .rkt-table th { padding: 9px 12px; }
    .rkt-wrap[data-w="md"] .rkt-table td { padding: 9px 12px; }
  `;

  /* ─── SVG logo mark ───────────────────────────────────────────────────── */
  const LOGO_SVG = `<svg class="rkt-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rkt-lg" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%"   stop-color="${T.B}"/>
        <stop offset="50%"  stop-color="${T.P}"/>
        <stop offset="100%" stop-color="${T.K}"/>
      </linearGradient>
    </defs>
    <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
          stroke="url(#rkt-lg)" stroke-width="2.4" fill="none"
          stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 6 L19 6 L19 11"
          stroke="url(#rkt-lg)" stroke-width="2.4" fill="none"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  /* ─── Helpers ─────────────────────────────────────────────────────────── */
  function escHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function formatValue(cell) {
    if (cell == null) return "";
    if (cell.rendered != null) return cell.rendered;
    if (cell.value    == null) return "";
    const v = cell.value;
    if (typeof v === "number") return v.toLocaleString();
    return String(v);
  }

  function healthClass(rawVal, cfg) {
    if (rawVal == null) return null;
    const v = String(rawVal).toLowerCase().trim();
    const okWords   = (cfg.green_vals  || "healthy,green,expanding,on track,active").toLowerCase().split(",").map(s => s.trim());
    const warnWords = (cfg.warn_vals   || "at risk,warning,yellow,behind,renewing").toLowerCase().split(",").map(s => s.trim());
    const errWords  = (cfg.err_vals    || "critical,red,error,churned,lost").toLowerCase().split(",").map(s => s.trim());
    const blueWords = (cfg.blue_vals   || "new,prospect,qualified").toLowerCase().split(",").map(s => s.trim());
    const purpWords = (cfg.purple_vals || "renewing,proposal,negotiating").toLowerCase().split(",").map(s => s.trim());
    if (errWords.some(w  => w && v.includes(w))) return "rkt-badge-err";
    if (warnWords.some(w => w && v.includes(w))) return "rkt-badge-warn";
    if (okWords.some(w   => w && v.includes(w))) return "rkt-badge-ok";
    if (blueWords.some(w => w && v.includes(w))) return "rkt-badge-blue";
    if (purpWords.some(w => w && v.includes(w))) return "rkt-badge-purp";
    return null;
  }

  function isLikelyHealthField(name) {
    const n = name.toLowerCase();
    return ["health","status","stage","state","risk","flag","tier"].some(k => n.includes(k));
  }

  function isNumeric(field) {
    return field.type === "number" || field.category === "measure";
  }

  function applyBreakpoint(root, w) {
    root.setAttribute("data-w",
      w < 340 ? "xs" : w < 520 ? "sm" : w < 760 ? "md" : "lg"
    );
  }

  /**
   * Return a human-readable label for a pivot value.
   * Handles single and multi-field pivots.
   */
  function pivotLabel(pivot) {
    if (!pivot.data || Object.keys(pivot.data).length === 0) return pivot.key || "";
    return Object.values(pivot.data)
      .map(c => {
        if (c == null) return "";
        return c.rendered != null ? c.rendered : (c.value != null ? String(c.value) : "");
      })
      .filter(s => s !== "")
      .join(" / ") || pivot.key || "";
  }

  /**
   * Build the flat column descriptor array.
   *
   * Each column is one of:
   *   { type: "dimension",     field, idx }
   *   { type: "measure",       field, idx }          ← no-pivot path
   *   { type: "pivot_measure", field, pivot, idx, pivotGroupStart }
   *
   * `idx` is the flat integer used as the sort key.
   * `pivotGroupStart` marks the first measure column in each pivot group.
   */
  function buildColumns(queryResponse) {
    const dims    = queryResponse.fields.dimensions         || [];
    const meass   = queryResponse.fields.measures           || [];
    const tcs     = queryResponse.fields.table_calculations || [];
    const measAll = [...meass, ...tcs];
    const pivots  = queryResponse.pivots || [];

    const columns = [];
    let idx = 0;

    // Dimension columns are always flat
    dims.forEach(f => {
      columns.push({ type: "dimension", field: f, idx: idx++ });
    });

    if (pivots.length > 0) {
      // Pivot path: for each pivot value, add one sub-column per measure
      pivots.forEach(pv => {
        measAll.forEach((mf, mi) => {
          columns.push({
            type: "pivot_measure",
            field: mf,
            pivot: pv,
            idx: idx++,
            pivotGroupStart: mi === 0,  // first measure of this pivot group
          });
        });
      });
    } else {
      // Flat path: measures and table calculations as plain columns
      measAll.forEach(f => {
        columns.push({ type: "measure", field: f, idx: idx++ });
      });
    }

    return { columns, dims, measAll, pivots };
  }

  /**
   * Build the <thead> HTML string.
   * Returns a single <tr> when not pivoted; two <tr>s when pivoted.
   */
  function buildHeader(columns, dims, measAll, pivots, state) {
    const isPivoted = pivots.length > 0;

    function sortClass(col) {
      if (state.sortCol !== col.idx) return "";
      return state.sortDir === 1 ? "sort-asc" : "sort-desc";
    }

    if (!isPivoted) {
      // Single header row
      const cells = columns.map(col => {
        const label = col.field.label_short || col.field.label || col.field.name;
        const sc    = sortClass(col);
        return `<th class="rkt-sortable ${sc}" data-col="${col.idx}">${escHtml(label)}</th>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    }

    // ── Two-row pivot header ──
    const numMeas = measAll.length;

    // Row 1: dimension placeholders (rowspan=2) + pivot group headers (colspan=numMeas)
    let row1 = "";

    // Dimension cells span both header rows
    dims.forEach(f => {
      const label  = f.label_short || f.label || f.name;
      // Use name-based matching — object references can differ across updateAsync calls
      const dimCol = columns.find(c => c.type === "dimension" && c.field.name === f.name);
      const colIdx = dimCol ? dimCol.idx : "";
      row1 += `<th rowspan="2" class="rkt-sortable" data-col="${colIdx}">${escHtml(label)}</th>`;
    });

    // Pivot group cells
    pivots.forEach((pv, pi) => {
      const label = pivotLabel(pv);
      const startClass = "rkt-th-pivot rkt-th-pivot-start";
      row1 += `<th colspan="${numMeas}" class="${startClass}">${escHtml(label)}</th>`;
    });

    // Row 2: measure sub-headers under each pivot group
    let row2 = "";
    pivots.forEach((pv, pi) => {
      measAll.forEach((mf, mi) => {
        const label   = mf.label_short || mf.label || mf.name;
        const col     = columns.find(c => c.type === "pivot_measure" && c.field.name === mf.name && c.pivot.key === pv.key);
        const sc      = col ? sortClass(col) : "";
        const startCl = mi === 0 ? " rkt-col-start" : "";
        const sortIdx = col ? col.idx : "";
        row2 += `<th class="rkt-th-measure rkt-sortable${startCl} ${sc}" data-col="${sortIdx}">${escHtml(label)}</th>`;
      });
    });

    return `<tr>${row1}</tr><tr>${row2}</tr>`;
  }

  /**
   * Get the comparable value for a row + column descriptor (for sorting).
   */
  function sortValue(row, col) {
    if (col.type === "dimension" || col.type === "measure") {
      const cell = row[col.field.name];
      return cell ? (cell.value ?? "") : "";
    }
    // pivot_measure
    const pivotCells = row[col.field.name];
    if (!pivotCells) return "";
    const cell = pivotCells[col.pivot.key];
    return cell ? (cell.value ?? "") : "";
  }

  /**
   * Get the display string for a row + column (for search).
   */
  function displayValue(row, col) {
    if (col.type === "dimension" || col.type === "measure") {
      const cell = row[col.field.name];
      return cell ? String(cell.rendered ?? cell.value ?? "") : "";
    }
    const pivotCells = row[col.field.name];
    if (!pivotCells) return "";
    const cell = pivotCells[col.pivot.key];
    return cell ? String(cell.rendered ?? cell.value ?? "") : "";
  }

  /**
   * Build a single <td> HTML string.
   */
  function buildCell(row, col, config) {
    let cell;
    if (col.type === "dimension" || col.type === "measure") {
      cell = row[col.field.name] || null;
    } else {
      // pivot_measure
      const pivotCells = row[col.field.name];
      cell = (pivotCells && pivotCells[col.pivot.key]) ? pivotCells[col.pivot.key] : null;
    }

    const raw  = cell ? cell.value : null;
    const disp = formatValue(cell);

    // Pivot group start gets a visual separator
    const startClass = (col.type === "pivot_measure" && col.pivotGroupStart) ? " rkt-col-start" : "";

    // Health badges on dimension/measure cells
    const hCls = (col.type !== "pivot_measure") && isLikelyHealthField(col.field.name)
      ? healthClass(raw, config)
      : null;

    if (hCls) {
      return `<td class="${startClass.trim()}"><span class="rkt-badge ${hCls}">${escHtml(disp)}</span></td>`;
    }

    const align = isNumeric(col.field) ? ' style="text-align:right"' : "";
    return `<td class="rkt-number${startClass}"${align} title="${escHtml(disp)}">${escHtml(disp)}</td>`;
  }

  /* ─── Looker visualization definition ────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_accounts_table",
    label: "Rocket — Accounts Table",

    options: {
      title: {
        type:    "string",
        label:   "Table title",
        default: "Accounts",
        section: "Style",
        order:   1,
      },
      rows_per_page: {
        type:    "number",
        label:   "Rows per page",
        default: 100,
        section: "Display",
        order:   2,
      },
      show_search: {
        type:    "boolean",
        label:   "Show search bar",
        default: true,
        section: "Display",
        order:   3,
      },
      green_vals: {
        type:        "string",
        label:       "Healthy / green keywords",
        default:     "healthy,green,expanding,active,on track,yes",
        placeholder: "Comma-separated, case-insensitive",
        section:     "Health badges",
        order:       4,
      },
      warn_vals: {
        type:        "string",
        label:       "Warning / amber keywords",
        default:     "at risk,warning,yellow,behind",
        placeholder: "Comma-separated, case-insensitive",
        section:     "Health badges",
        order:       5,
      },
      err_vals: {
        type:        "string",
        label:       "Critical / red keywords",
        default:     "critical,red,error,inactive,churned,lost,no",
        placeholder: "Comma-separated, case-insensitive",
        section:     "Health badges",
        order:       6,
      },
      blue_vals: {
        type:        "string",
        label:       "Info / blue keywords",
        default:     "new,prospect,qualified",
        placeholder: "Comma-separated, case-insensitive",
        section:     "Health badges",
        order:       7,
      },
      purple_vals: {
        type:        "string",
        label:       "Neutral / purple keywords",
        default:     "renewing,proposal,negotiating",
        placeholder: "Comma-separated, case-insensitive",
        section:     "Health badges",
        order:       8,
      },
    },

    /* ── create ─────────────────────────────────────────────────────────── */
    create: function (element, config) {
      // Inject styles into <head> once (keyed so duplicates are skipped)
      if (!document.getElementById("rkt-styles-v2")) {
        const styleEl = document.createElement("style");
        styleEl.id = "rkt-styles-v2";
        styleEl.textContent = CSS;
        document.head.appendChild(styleEl);
      }

      // Build DOM with createElement so no existing nodes are destroyed
      element.innerHTML = "";

      const root = document.createElement("div");
      root.className = "rkt-wrap rkt-diag-bg";
      root.setAttribute("data-w", "lg");

      // — topbar —
      const topbar = document.createElement("div");
      topbar.className = "rkt-topbar";

      const topLeft = document.createElement("div");
      topLeft.className = "rkt-topbar-left";
      topLeft.innerHTML = LOGO_SVG;

      const titleEl = document.createElement("span");
      titleEl.className = "rkt-title";
      titleEl.textContent = "Accounts";
      topLeft.appendChild(titleEl);

      const countEl = document.createElement("span");
      countEl.className = "rkt-count";

      topbar.appendChild(topLeft);
      topbar.appendChild(countEl);

      // — gradient line —
      const gline = document.createElement("div");
      gline.className = "rkt-gline";

      // — toolbar —
      const toolbar = document.createElement("div");
      toolbar.className = "rkt-toolbar";
      toolbar.style.display = "none";

      const searchEl = document.createElement("input");
      searchEl.className = "rkt-search";
      searchEl.type = "text";
      searchEl.placeholder = "Search…";

      const pgInfo = document.createElement("span");
      pgInfo.className = "rkt-pg-info";

      const prevBtn = document.createElement("button");
      prevBtn.className = "rkt-pg-btn";
      prevBtn.textContent = "‹ Prev";

      const nextBtn = document.createElement("button");
      nextBtn.className = "rkt-pg-btn";
      nextBtn.textContent = "Next ›";

      toolbar.appendChild(searchEl);
      toolbar.appendChild(pgInfo);
      toolbar.appendChild(prevBtn);
      toolbar.appendChild(nextBtn);

      // — table wrap —
      const tableWrap = document.createElement("div");
      tableWrap.className = "rkt-table-wrap";
      tableWrap.innerHTML = '<div class="rkt-empty">Loading…</div>';

      root.appendChild(topbar);
      root.appendChild(gline);
      root.appendChild(toolbar);
      root.appendChild(tableWrap);
      element.appendChild(root);

      // Store scoped refs for use in updateAsync
      this._root      = root;
      this._titleEl   = titleEl;
      this._countEl   = countEl;
      this._toolbar   = toolbar;
      this._searchEl  = searchEl;
      this._pgInfo    = pgInfo;
      this._prevBtn   = prevBtn;
      this._nextBtn   = nextBtn;
      this._tableWrap = tableWrap;

      this._state = { page: 0, sortCol: null, sortDir: 1, query: "" };

      if (typeof ResizeObserver !== "undefined") {
        this._ro = new ResizeObserver(entries => {
          const { width } = entries[0].contentRect;
          applyBreakpoint(this._root, width);
        });
        this._ro.observe(element);
      }
    },

    /* ── updateAsync ─────────────────────────────────────────────────────── */
    updateAsync: function (data, element, config, queryResponse, details, done) {
      const state   = this._state;
      const perPage = Math.max(1, config.rows_per_page || 10);

      // Use scoped refs stored in create() — never touch document.getElementById
      const titleEl   = this._titleEl;
      const countEl   = this._countEl;
      const toolbar   = this._toolbar;
      const searchEl  = this._searchEl;
      const pgInfo    = this._pgInfo;
      const prevBtn   = this._prevBtn;
      const nextBtn   = this._nextBtn;
      const tableWrap = this._tableWrap;

      applyBreakpoint(this._root, element.offsetWidth || 600);

      /* ── Build column model ── */
      const { columns, dims, measAll, pivots } = buildColumns(queryResponse);

      /* ── Update title ── */
      titleEl.textContent = config.title || "Accounts";

      /* ── Toggle toolbar ── */
      toolbar.style.display = (config.show_search !== false) ? "flex" : "none";

      /* ── Wire search ── */
      searchEl.oninput = () => {
        state.query = searchEl.value.toLowerCase();
        state.page  = 0;
        render();
      };

      /* ── Wire paging ── */
      prevBtn.onclick = () => { state.page--; render(); };
      nextBtn.onclick = () => { state.page++; render(); };

      /* ── Render ── */
      const render = () => {
        /* Filter: match any displayed value across all columns */
        let rows = data.filter(row => {
          if (!state.query) return true;
          return columns.some(col =>
            displayValue(row, col).toLowerCase().includes(state.query)
          );
        });

        /* Sort */
        if (state.sortCol !== null) {
          const col = columns.find(c => c.idx === state.sortCol);
          if (col) {
            rows = rows.slice().sort((a, b) => {
              const av = sortValue(a, col);
              const bv = sortValue(b, col);
              if (av < bv) return -state.sortDir;
              if (av > bv) return  state.sortDir;
              return 0;
            });
          }
        }

        /* Page bounds */
        const total   = rows.length;
        const maxPage = Math.max(0, Math.ceil(total / perPage) - 1);
        state.page    = Math.min(Math.max(0, state.page), maxPage);
        const slice   = rows.slice(state.page * perPage, (state.page + 1) * perPage);

        /* Count badge */
        countEl.textContent =
          total + (total !== data.length ? " of " + data.length : "") + " records";

        /* Paging info */
        const start = total ? state.page * perPage + 1 : 0;
        const end   = Math.min((state.page + 1) * perPage, total);
        pgInfo.textContent  = total ? `${start}–${end} of ${total}` : "No results";
        prevBtn.disabled    = state.page === 0;
        nextBtn.disabled    = state.page >= maxPage;

        /* Empty states */
        if (columns.length === 0) {
          tableWrap.innerHTML = '<div class="rkt-empty">Add dimensions or measures to see data.</div>';
          return;
        }
        if (total === 0) {
          tableWrap.innerHTML = '<div class="rkt-empty">No matching records found.</div>';
          return;
        }

        /* Build thead HTML */
        const theadHtml = buildHeader(columns, dims, measAll, pivots, state);

        /* Build tbody HTML */
        const tbRows = slice.map(row => {
          const tds = columns.map(col => buildCell(row, col, config)).join("");
          return `<tr>${tds}</tr>`;
        }).join("");

        tableWrap.innerHTML = `
          <table class="rkt-table">
            <thead>${theadHtml}</thead>
            <tbody>${tbRows}</tbody>
          </table>`;

        /* Bind sort headers — scoped to this tile's tableWrap only */
        tableWrap.querySelectorAll("th[data-col]").forEach(th => {
          th.onclick = () => {
            const col = parseInt(th.dataset.col, 10);
            if (isNaN(col)) return;
            if (state.sortCol === col) {
              state.sortDir = state.sortDir === 1 ? -1 : 1;
            } else {
              state.sortCol = col;
              state.sortDir = 1;
            }
            state.page = 0;
            render();
          };
        });
      };

      try {
        render();
      } catch (e) {
        console.error("[rocket_accounts_table] render error:", e);
        tableWrap.innerHTML = `<div class="rkt-empty">Error rendering table — check browser console.</div>`;
      }
      done();
    },
  });
})();
