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
 * Features:
 *   - Per-column label overrides: dynamic input fields appear in "Column Labels" config section
 *   - Row grouping: group by first dimension with expand/collapse
 *   - Pivot support: two-row header with group columns
 *   - Search, sort, pagination
 *   - Health/status badges, URL cells, big-number abbreviation
 *
 * Version: 1.3.0  |  May 2025
 */

(function () {
  "use strict";

  /* ─── Brand tokens ────────────────────────────────────────────────────── */
  const T = {
    bg:   "#FFFFFF",
    surf: "#F8F8FA",
    card:    "#F8F8FA",
    card2:   "#FFFFFF",
    bo:   "#E5E5EA",
    bo2:  "#EBEBF0",
    tx:   "#1C1C1E",
    mt:   "#8E8E93",
    dm:   "#F2F2F7",
    B: "#5040F5",
    P: "#8638CA",
    K: "#C038B5",
    ok:      "#2DD4A0",
    wn:      "#F0A830",
    er:      "#F06060",
    okBg:    "rgba(45,212,160,.12)",
    wnBg:    "rgba(240,168,48,.12)",
    erBg:    "rgba(240,96,96,.12)",
    bBg:     "rgba(59,126,246,.15)",
    bTx:     "#2E6BE6",
    pBg:     "rgba(123,63,228,.15)",
    pTx:     "#6B2FD4",
  };

  /* ─── Static options (also passed to registerOptions each update) ─────── */
  const STATIC_OPTIONS = {
    title: {
      type:    "string",
      label:   "Table title",
      default: "Accounts",
      section: "Style",
      order:   1,
    },
    rows_per_page: {
      type:        "string",
      label:       "Rows per page",
      default:     "100",
      placeholder: "100",
      section:     "Display",
      order:       2,
    },
    max_rows: {
      type:        "string",
      label:       "Maximum rows to fetch",
      default:     "500",
      placeholder: "500",
      section:     "Display",
      order:       3,
    },
    show_search: {
      type:    "boolean",
      label:   "Show search bar",
      default: true,
      section: "Display",
      order:   3,
    },
    enable_grouping: {
      type:    "boolean",
      label:   "Group rows by first dimension",
      default: false,
      section: "Display",
      order:   4,
    },
    group_default_expanded: {
      type:    "boolean",
      label:   "Start with all groups expanded",
      default: false,
      section: "Display",
      order:   5,
    },
    show_totals: {
      type:    "boolean",
      label:   "Show grand totals row",
      default: false,
      section: "Display",
      order:   6,
    },
    // fmt_number_cols removed — per-column abbreviation toggles are now
    // injected dynamically via registerOptions (see updateAsync)
    green_vals: {
      type:        "string",
      label:       "Healthy / green keywords",
      default:     "healthy,green,expanding,active,on track,yes",
      placeholder: "Comma-separated, case-insensitive",
      section:     "Health badges",
      order:       10,
    },
    warn_vals: {
      type:        "string",
      label:       "Warning / amber keywords",
      default:     "at risk,warning,yellow,behind",
      placeholder: "Comma-separated, case-insensitive",
      section:     "Health badges",
      order:       11,
    },
    err_vals: {
      type:        "string",
      label:       "Critical / red keywords",
      default:     "critical,red,error,inactive,churned,lost,no",
      placeholder: "Comma-separated, case-insensitive",
      section:     "Health badges",
      order:       12,
    },
    blue_vals: {
      type:        "string",
      label:       "Info / blue keywords",
      default:     "new,prospect,qualified",
      placeholder: "Comma-separated, case-insensitive",
      section:     "Health badges",
      order:       13,
    },
    purple_vals: {
      type:        "string",
      label:       "Neutral / purple keywords",
      default:     "renewing,proposal,negotiating",
      placeholder: "Comma-separated, case-insensitive",
      section:     "Health badges",
      order:       14,
    },
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
    .rkt-topbar-left  { display: flex; align-items: center; gap: 9px; min-width: 0; }
    .rkt-topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .rkt-logo { width: 22px; height: 22px; flex-shrink: 0; }
    .rkt-title {
      font-size: 16px; font-weight: 500; color: ${T.tx};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rkt-count { font-size: 13px; color: #8E8E93; white-space: nowrap; }
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
      font-size: 14px;
      color: ${T.tx};
      outline: none;
      transition: border-color .15s;
    }
    .rkt-search::placeholder { color: #6B6B7B; }
    .rkt-search:focus { border-color: rgba(59,126,246,0.50); }
    .rkt-pg-info { font-size: 13px; color: #8E8E93; white-space: nowrap; }
    .rkt-pg-btn, .rkt-expand-btn {
      background: ${T.card};
      border: 1px solid ${T.bo2};
      border-radius: 5px;
      color: ${T.tx};
      font-size: 13px;
      padding: 5px 11px;
      cursor: pointer;
      transition: all .15s;
      white-space: nowrap;
    }
    .rkt-pg-btn:hover:not(:disabled),
    .rkt-expand-btn:hover { border-color: rgba(0,0,0,0.20); }
    .rkt-pg-btn:disabled  { opacity: .35; cursor: default; }
    .rkt-table-wrap { flex: 1; overflow-y: auto; overflow-x: auto; }
    .rkt-table-wrap::-webkit-scrollbar { width: 5px; height: 5px; }
    .rkt-table-wrap::-webkit-scrollbar-track { background: ${T.bg}; }
    .rkt-table-wrap::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
    .rkt-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      table-layout: auto;
    }
    .rkt-table thead { position: sticky; top: 0; z-index: 2; }

    /* ── Base header cell ── */
    .rkt-table th {
      background: ${T.surf};
      color: #6B6B7B;
      font-weight: 500;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: .6px;
      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo2};
      border-right: 1px solid rgba(0,0,0,0.06);
      text-align: left;
      white-space: nowrap;
      user-select: none;
      transition: color .15s;
    }
    .rkt-table th.rkt-sortable { cursor: pointer; }
    .rkt-table th.rkt-sortable:hover { color: ${T.tx}; }
    .rkt-table th.sort-asc::after  { content: ' ↑'; color: ${T.P}; }
    .rkt-table th.sort-desc::after { content: ' ↓'; color: ${T.P}; }

    /* ── Pivot headers ── */
    .rkt-table th.rkt-th-pivot {
      text-align: center;
      background: ${T.card};
      color: ${T.tx};
      font-size: 13px;
      font-weight: 600;
      letter-spacing: .5px;
      border-bottom: 1px solid #DDDDE5;
    }
    .rkt-table th.rkt-th-pivot-start { border-left: 1px solid rgba(0,0,0,0.11); }
    .rkt-table th.rkt-th-measure {
      background: ${T.surf};
      color: #6B6B7B;
      font-size: 12px;
    }
    .rkt-table th.rkt-th-measure.rkt-col-start { border-left: 1px solid rgba(0,0,0,0.06); }
    .rkt-table td.rkt-col-start { border-left: 1px solid rgba(0,0,0,0.06); }

    /* ── Data cells ── */
    .rkt-table td {
      padding: 10px 14px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      border-right: 1px solid rgba(0,0,0,0.06);
      color: ${T.tx};
      white-space: nowrap;
      max-width: 220px;
      overflow-x: auto;
    }
    .rkt-table td::-webkit-scrollbar { height: 3px; }
    .rkt-table td::-webkit-scrollbar-track { background: transparent; }
    .rkt-table td::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); border-radius: 2px; }
    .rkt-table tr:last-child td { border-bottom: none; }
    .rkt-table th:last-child,
    .rkt-table td:last-child { border-right: none; }
    .rkt-table tbody tr { transition: background .12s; }
    .rkt-table tbody tr:hover td { background: ${T.card2}; }

    /* ── Group rows (expand/collapse) ── */
    .rkt-group-row td {
      background: ${T.dm} !important;
      font-weight: 600;
      font-size: 13px;
      color: ${T.tx};
      cursor: pointer;
      user-select: none;
      border-bottom: 1px solid ${T.bo};
      padding: 9px 14px;
    }
    .rkt-group-row:hover td { background: #E8E8F0 !important; }
    .rkt-group-toggle {
      display: inline-block;
      width: 14px;
      font-size: 10px;
      margin-right: 7px;
      color: ${T.mt};
    }
    .rkt-group-count {
      margin-left: 9px;
      font-size: 11px;
      font-weight: 400;
      color: ${T.mt};
      background: rgba(0,0,0,0.06);
      padding: 1px 7px;
      border-radius: 10px;
      vertical-align: middle;
    }
    .rkt-sub-row td:first-child { padding-left: 30px; }

    /* ── Badges / URLs ── */
    a.rkt-cell-url {
      color: ${T.B};
      text-decoration: underline;
      text-underline-offset: 2px;
      cursor: pointer;
    }
    a.rkt-cell-url:hover { color: ${T.P}; }
    .rkt-badge {
      font-size: 13px; padding: 3px 9px;
      border-radius: 4px; display: inline-block;
      letter-spacing: .3px; font-weight: 400;
    }
    .rkt-badge-ok   { background: ${T.okBg}; color: ${T.ok}; }
    .rkt-badge-warn { background: ${T.wnBg}; color: ${T.wn}; }
    .rkt-badge-err  { background: ${T.erBg}; color: ${T.er}; }
    .rkt-badge-blue { background: ${T.bBg};  color: ${T.bTx}; }
    .rkt-badge-purp { background: ${T.pBg};  color: ${T.pTx}; }
    .rkt-badge-neu  { background: rgba(0,0,0,0.06); color: ${T.mt}; }
    .rkt-empty { padding: 40px 20px; text-align: center; color: #8E8E93; font-size: 15px; }
    .rkt-number { font-variant-numeric: tabular-nums; }

    /* ── Grand totals row ── */
    .rkt-totals-row td {
      background: ${T.surf} !important;
      font-weight: 600;
      font-size: 13px;
      color: ${T.tx};
      border-top: 2px solid ${T.bo};
      border-bottom: none;
      position: sticky;
      bottom: 0;
      z-index: 1;
    }
    .rkt-totals-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .6px;
      color: ${T.mt};
    }

    /* ── Responsive ── */
    .rkt-wrap[data-w="xs"] .rkt-topbar  { padding: 8px 10px; }
    .rkt-wrap[data-w="xs"] .rkt-title   { font-size: 14px; }
    .rkt-wrap[data-w="xs"] .rkt-count   { display: none; }
    .rkt-wrap[data-w="xs"] .rkt-logo    { display: none; }
    .rkt-wrap[data-w="xs"] .rkt-toolbar { flex-direction: column; align-items: stretch; padding: 6px 10px; gap: 6px; }
    .rkt-wrap[data-w="xs"] .rkt-pg-info { display: none; }
    .rkt-wrap[data-w="xs"] .rkt-pg-btn  { padding: 4px 8px; font-size: 13px; }
    .rkt-wrap[data-w="xs"] .rkt-table   { font-size: 13px; }
    .rkt-wrap[data-w="xs"] .rkt-table th { padding: 7px 9px; font-size: 12px; letter-spacing: .3px; }
    .rkt-wrap[data-w="xs"] .rkt-table td { padding: 7px 9px; max-width: 120px; }
    .rkt-wrap[data-w="xs"] .rkt-badge   { font-size: 12px; padding: 2px 7px; }
    .rkt-wrap[data-w="sm"] .rkt-topbar  { padding: 9px 12px; }
    .rkt-wrap[data-w="sm"] .rkt-title   { font-size: 15px; }
    .rkt-wrap[data-w="sm"] .rkt-count   { display: none; }
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

  function fmtNumber(n) {
    const abs  = Math.abs(n);
    const sign = n < 0 ? "-" : "";
    if (abs >= 1e9) return sign + (abs / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (abs >= 1e4) return sign + (abs / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return n.toLocaleString();
  }

  function formatValue(cell, forceNumFmt) {
    if (cell == null) return "";
    if (forceNumFmt) {
      let n = null;
      const raw = cell.value;
      if (typeof raw === "number" && !isNaN(raw)) {
        n = raw;
      } else if (raw != null) {
        const cleaned = String(raw).replace(/[$€£¥%\s]/g, "").replace(/,/g, "").trim();
        const parsed  = parseFloat(cleaned);
        if (!isNaN(parsed) && cleaned !== "") n = parsed;
      }
      if (n === null && cell.rendered != null) {
        const cleaned = String(cell.rendered).replace(/[$€£¥%\s]/g, "").replace(/,/g, "").trim();
        const parsed  = parseFloat(cleaned);
        if (!isNaN(parsed) && /^-?[\d.]+[KMB]?$/.test(cleaned)) n = parsed;
      }
      if (n !== null) return fmtNumber(n);
    }
    if (cell.rendered != null) return cell.rendered;
    if (cell.value    == null) return "";
    const v = cell.value;
    if (typeof v === "number") return fmtNumber(v);
    return String(v);
  }

  function extractUrl(cell) {
    if (!cell) return null;
    if (Array.isArray(cell.links)) {
      const link = cell.links.find(function(l) { return l.url && /^https?:\/\//i.test(l.url); });
      if (link) return link.url;
    }
    const v = cell.value;
    if (typeof v === "string" && /^https?:\/\//i.test(v.trim())) return v.trim();
    return null;
  }

  function healthClass(rawVal, cfg) {
    if (rawVal == null) return null;
    const v = String(rawVal).toLowerCase().trim();
    const okWords   = (cfg.green_vals  || "healthy,green,expanding,on track,active").toLowerCase().split(",").map(function(s) { return s.trim(); });
    const warnWords = (cfg.warn_vals   || "at risk,warning,yellow,behind,renewing").toLowerCase().split(",").map(function(s) { return s.trim(); });
    const errWords  = (cfg.err_vals    || "critical,red,error,churned,lost").toLowerCase().split(",").map(function(s) { return s.trim(); });
    const blueWords = (cfg.blue_vals   || "new,prospect,qualified").toLowerCase().split(",").map(function(s) { return s.trim(); });
    const purpWords = (cfg.purple_vals || "renewing,proposal,negotiating").toLowerCase().split(",").map(function(s) { return s.trim(); });
    if (errWords.some(function(w)  { return w && v.includes(w); })) return "rkt-badge-err";
    if (warnWords.some(function(w) { return w && v.includes(w); })) return "rkt-badge-warn";
    if (okWords.some(function(w)   { return w && v.includes(w); })) return "rkt-badge-ok";
    if (blueWords.some(function(w) { return w && v.includes(w); })) return "rkt-badge-blue";
    if (purpWords.some(function(w) { return w && v.includes(w); })) return "rkt-badge-purp";
    return null;
  }

  function isLikelyHealthField(name) {
    const n = name.toLowerCase();
    return ["health","status","stage","state","risk","flag","tier"].some(function(k) { return n.includes(k); });
  }

  function isNumeric(field) {
    return field.type === "number" || field.category === "measure";
  }

  function applyBreakpoint(root, w) {
    root.setAttribute("data-w",
      w < 340 ? "xs" : w < 520 ? "sm" : w < 760 ? "md" : "lg"
    );
  }

  function pivotLabel(pivot) {
    if (!pivot.data || Object.keys(pivot.data).length === 0) return pivot.key || "";
    return Object.values(pivot.data)
      .map(function(c) {
        if (c == null) return "";
        return c.rendered != null ? c.rendered : (c.value != null ? String(c.value) : "");
      })
      .filter(function(s) { return s !== ""; })
      .join(" / ") || pivot.key || "";
  }

  /**
   * Return the display label for a column.
   * Checks config["col_label_N"] (set via dynamic registerOptions inputs) first,
   * then falls back to the field's own label.
   */
  function colLabel(col, config) {
    const override = config["col_label_" + col.idx];
    if (override && String(override).trim()) return String(override).trim();
    return col.field.label_short || col.field.label || col.field.name;
  }

  /**
   * Sum the numeric values of a column across a set of rows.
   * Returns the numeric total, or null if no numeric values were found.
   */
  function sumColumn(rows, col) {
    let total = 0;
    let count = 0;
    rows.forEach(function(row) {
      var cell;
      if (col.type === "dimension" || col.type === "measure") {
        cell = row[col.field.name] || null;
      } else {
        var pc = row[col.field.name];
        cell = pc && pc[col.pivot.key] ? pc[col.pivot.key] : null;
      }
      if (!cell) return;
      var n = null;
      var raw = cell.value;
      if (typeof raw === "number" && !isNaN(raw)) {
        n = raw;
      } else if (raw != null) {
        var s = String(raw).replace(/[$€£¥%\s,]/g, "").trim();
        var p = parseFloat(s);
        if (!isNaN(p) && s !== "") n = p;
      }
      if (n !== null) { total += n; count++; }
    });
    return count > 0 ? total : null;
  }

  /**
   * Group an array of rows by the value of a given field name.
   * Returns a Map<groupKey, rows[]> preserving insertion order.
   */
  function groupRows(rows, fieldName) {
    const groups = new Map();
    rows.forEach(function(row) {
      const cell = row[fieldName];
      const key  = cell != null
        ? String(cell.rendered != null ? cell.rendered : (cell.value != null ? cell.value : ""))
        : "";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    });
    return groups;
  }

  /* ─── Column model ────────────────────────────────────────────────────── */
  function buildColumns(queryResponse) {
    const dims    = queryResponse.fields.dimensions         || [];
    const meass   = queryResponse.fields.measures           || [];
    const tcs     = queryResponse.fields.table_calculations || [];
    const measAll = [...meass, ...tcs];
    const pivots  = queryResponse.pivots || [];

    const columns = [];
    let idx = 0;

    dims.forEach(function(f) {
      columns.push({ type: "dimension", field: f, idx: idx++ });
    });

    if (pivots.length > 0) {
      pivots.forEach(function(pv) {
        measAll.forEach(function(mf, mi) {
          columns.push({
            type: "pivot_measure",
            field: mf,
            pivot: pv,
            idx: idx++,
            pivotGroupStart: mi === 0,
          });
        });
      });
    } else {
      measAll.forEach(function(f) {
        columns.push({ type: "measure", field: f, idx: idx++ });
      });
    }

    return { columns, dims, measAll, pivots };
  }

  /* ─── Header builder ──────────────────────────────────────────────────── */
  function buildHeader(columns, dims, measAll, pivots, state, config) {
    const isPivoted = pivots.length > 0;

    function sortClass(col) {
      if (state.sortCol !== col.idx) return "";
      return state.sortDir === 1 ? "sort-asc" : "sort-desc";
    }

    if (!isPivoted) {
      const cells = columns.map(function(col) {
        const label = colLabel(col, config);
        const sc    = sortClass(col);
        return `<th class="rkt-sortable ${sc}" data-col="${col.idx}">${escHtml(label)}</th>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    }

    const numMeas = measAll.length;
    let row1 = "";

    dims.forEach(function(f) {
      const dimCol = columns.find(function(c) { return c.type === "dimension" && c.field.name === f.name; });
      const label  = dimCol ? colLabel(dimCol, config) : (f.label_short || f.label || f.name);
      const colIdx = dimCol ? dimCol.idx : "";
      row1 += `<th rowspan="2" class="rkt-sortable" data-col="${colIdx}">${escHtml(label)}</th>`;
    });

    pivots.forEach(function(pv) {
      const label = pivotLabel(pv);
      row1 += `<th colspan="${numMeas}" class="rkt-th-pivot rkt-th-pivot-start">${escHtml(label)}</th>`;
    });

    let row2 = "";
    pivots.forEach(function(pv) {
      measAll.forEach(function(mf, mi) {
        const col     = columns.find(function(c) { return c.type === "pivot_measure" && c.field.name === mf.name && c.pivot.key === pv.key; });
        const label   = col ? colLabel(col, config) : (mf.label_short || mf.label || mf.name);
        const sc      = col ? sortClass(col) : "";
        const startCl = mi === 0 ? " rkt-col-start" : "";
        const sortIdx = col ? col.idx : "";
        row2 += `<th class="rkt-th-measure rkt-sortable${startCl} ${sc}" data-col="${sortIdx}">${escHtml(label)}</th>`;
      });
    });

    return `<tr>${row1}</tr><tr>${row2}</tr>`;
  }

  /* ─── Sort / display value helpers ───────────────────────────────────── */
  function sortValue(row, col) {
    if (col.type === "dimension" || col.type === "measure") {
      const cell = row[col.field.name];
      return cell ? (cell.value ?? "") : "";
    }
    const pivotCells = row[col.field.name];
    if (!pivotCells) return "";
    const cell = pivotCells[col.pivot.key];
    return cell ? (cell.value ?? "") : "";
  }

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

  /* ─── Cell builder ────────────────────────────────────────────────────── */
  function buildCell(row, col, config) {
    let cell;
    if (col.type === "dimension" || col.type === "measure") {
      cell = row[col.field.name] || null;
    } else {
      const pivotCells = row[col.field.name];
      cell = (pivotCells && pivotCells[col.pivot.key]) ? pivotCells[col.pivot.key] : null;
    }

    const raw = cell ? cell.value : null;

    const forceNumFmt = config["col_abbr_" + col.idx] === true;

    const disp    = formatValue(cell, forceNumFmt);
    const rawDisp = (cell && cell.value != null) ? String(cell.value) : disp;
    const startClass = (col.type === "pivot_measure" && col.pivotGroupStart) ? " rkt-col-start" : "";

    const hCls = (col.type !== "pivot_measure") && isLikelyHealthField(col.field.name)
      ? healthClass(raw, config)
      : null;

    if (hCls) {
      return `<td class="${startClass.trim()}"><span class="rkt-badge ${hCls}">${escHtml(disp)}</span></td>`;
    }

    const url = extractUrl(cell);
    if (url) {
      return `<td class="${startClass.trim()}" title="${escHtml(url)}"><a class="rkt-cell-url" href="${escHtml(url)}" target="_blank" rel="noopener noreferrer">${escHtml(disp || url)}</a></td>`;
    }

    const align = isNumeric(col.field) ? ' style="text-align:right"' : "";
    return `<td class="rkt-number${startClass}"${align} title="${escHtml(rawDisp)}">${escHtml(disp)}</td>`;
  }

  /* ─── Looker visualization definition ────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_accounts_table_light",
    label: "Rocket — Accounts Table",

    options: STATIC_OPTIONS,

    /* ── create ─────────────────────────────────────────────────────────── */
    create: function (element, config) {
      if (!document.getElementById("rkt-styles-v3")) {
        const styleEl = document.createElement("style");
        styleEl.id = "rkt-styles-v3";
        styleEl.textContent = CSS;
        document.head.appendChild(styleEl);
      }

      element.innerHTML = "";

      const root = document.createElement("div");
      root.className = "rkt-wrap";
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

      const topRight = document.createElement("div");
      topRight.className = "rkt-topbar-right";

      // Expand / Collapse all button (shown only when grouping is active)
      const expandBtn = document.createElement("button");
      expandBtn.className = "rkt-expand-btn";
      expandBtn.textContent = "Expand all";
      expandBtn.style.display = "none";
      topRight.appendChild(expandBtn);
      topRight.appendChild(countEl);

      topbar.appendChild(topLeft);
      topbar.appendChild(topRight);

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

      const pgInfo  = document.createElement("span");
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

      this._root      = root;
      this._titleEl   = titleEl;
      this._countEl   = countEl;
      this._expandBtn = expandBtn;
      this._toolbar   = toolbar;
      this._searchEl  = searchEl;
      this._pgInfo    = pgInfo;
      this._prevBtn   = prevBtn;
      this._nextBtn   = nextBtn;
      this._tableWrap = tableWrap;

      this._state = {
        page:           0,
        sortCol:        null,
        sortDir:        1,
        query:          "",
        expandedGroups: new Set(),
        allExpanded:    false,
      };

      if (typeof ResizeObserver !== "undefined") {
        this._ro = new ResizeObserver(function(entries) {
          applyBreakpoint(root, entries[0].contentRect.width);
        });
        this._ro.observe(element);
      }
    },

    /* ── updateAsync ─────────────────────────────────────────────────────── */
    updateAsync: function (data, element, config, queryResponse, details, done) {
      const self    = this;
      const state   = this._state;

      /* ── Row limit — only trigger when the value actually changes.
       * Calling trigger("limit") causes Looker to re-execute the query and
       * call updateAsync again. Triggering unconditionally every call creates
       * an infinite reload loop. ── */
      const _maxRows = parseInt(config.max_rows, 10);
      const maxRows  = (!isNaN(_maxRows) && _maxRows > 0) ? _maxRows : 500;
      if (this._appliedLimit !== maxRows) {
        this._appliedLimit = maxRows;
        try { this.trigger("limit", [maxRows]); } catch (e) { /* not supported */ }
        done();
        return; /* Looker will re-call updateAsync with the new row data */
      }

      const _rpp = parseInt(config.rows_per_page, 10);
      const perPage = (!isNaN(_rpp) && _rpp > 0) ? _rpp : 100;

      const titleEl   = this._titleEl;
      const countEl   = this._countEl;
      const expandBtn = this._expandBtn;
      const toolbar   = this._toolbar;
      const searchEl  = this._searchEl;
      const pgInfo    = this._pgInfo;
      const prevBtn   = this._prevBtn;
      const nextBtn   = this._nextBtn;
      const tableWrap = this._tableWrap;

      applyBreakpoint(this._root, element.offsetWidth || 600);

      /* ── Build column model ── */
      const { columns, dims, measAll, pivots } = buildColumns(queryResponse);

      /* ── Register dynamic column-label options ──
       * Only re-register when the column structure changes (different fields or
       * pivots). Calling registerOptions on every render can cause Looker to
       * treat it as a config change and trigger another updateAsync cycle. ── */
      const colSig = columns.map(function(c) {
        return c.field.name + (c.pivot ? ":" + c.pivot.key : "");
      }).join("|");

      if (this._lastColSig !== colSig) {
        this._lastColSig = colSig;
        try {
          const dynOpts = {};
          columns.forEach(function(col) {
            const defaultLabel = col.field.label_short || col.field.label || col.field.name;
            dynOpts["col_label_" + col.idx] = {
              type:        "string",
              label:       defaultLabel,
              default:     "",
              placeholder: defaultLabel,
              section:     "Column Labels",
              order:       100 + col.idx * 2,
            };
            dynOpts["col_abbr_" + col.idx] = {
              type:    "boolean",
              label:   "Abbreviate numbers (K / M / B)",
              default: false,
              section: "Column Labels",
              order:   100 + col.idx * 2 + 1,
            };
          });
          const allOpts = Object.assign({}, STATIC_OPTIONS, dynOpts);
          this.trigger("registerOptions", allOpts);
        } catch (e) { /* registerOptions unavailable */ }
      }

      /* ── Title + toolbar ── */
      titleEl.textContent  = config.title || "Accounts";
      toolbar.style.display = (config.show_search !== false) ? "flex" : "none";

      /* ── Grouping setup ── */
      const canGroup   = config.enable_grouping && dims.length >= 1;
      const firstDim   = dims[0];
      expandBtn.style.display = canGroup ? "inline-block" : "none";

      /* ── Wire search ── */
      searchEl.oninput = function() {
        state.query = searchEl.value.toLowerCase();
        state.page  = 0;
        render();
      };

      /* ── Wire paging ── */
      prevBtn.onclick = function() { state.page--; render(); };
      nextBtn.onclick = function() { state.page++; render(); };

      /* ── Wire expand/collapse all ── */
      expandBtn.onclick = function() {
        state.allExpanded = !state.allExpanded;
        expandBtn.textContent = state.allExpanded ? "Collapse all" : "Expand all";
        // Sync expandedGroups to all-or-nothing
        if (state.allExpanded) {
          data.forEach(function(row) {
            const cell = row[firstDim.name];
            const key  = cell != null
              ? String(cell.rendered != null ? cell.rendered : (cell.value != null ? cell.value : ""))
              : "";
            state.expandedGroups.add(key);
          });
        } else {
          state.expandedGroups.clear();
        }
        render();
      };

      /* ── Render ── */
      function render() {
        /* Filter */
        let rows = data.filter(function(row) {
          if (!state.query) return true;
          return columns.some(function(col) {
            return displayValue(row, col).toLowerCase().includes(state.query);
          });
        });

        /* Sort */
        if (state.sortCol !== null) {
          const col = columns.find(function(c) { return c.idx === state.sortCol; });
          if (col) {
            rows = rows.slice().sort(function(a, b) {
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

        /* Count + paging info */
        countEl.textContent =
          total + (total !== data.length ? " of " + data.length : "") + " records";
        const start = total ? state.page * perPage + 1 : 0;
        const end   = Math.min((state.page + 1) * perPage, total);
        pgInfo.textContent = total ? `${start}–${end} of ${total}` : "No results";
        prevBtn.disabled   = state.page === 0;
        nextBtn.disabled   = state.page >= maxPage;

        /* Empty states */
        if (columns.length === 0) {
          tableWrap.innerHTML = '<div class="rkt-empty">Add dimensions or measures to see data.</div>';
          return;
        }
        if (total === 0) {
          tableWrap.innerHTML = '<div class="rkt-empty">No matching records found.</div>';
          return;
        }

        /* thead */
        const theadHtml = buildHeader(columns, dims, measAll, pivots, state, config);

        /* tbody */
        let tbRows;

        if (canGroup) {
          /* ── Grouped rendering ── */
          const groups = groupRows(slice, firstDim.name);
          const parts  = [];

          groups.forEach(function(groupRowsList, groupKey) {
            const isExpanded = state.expandedGroups.has(groupKey);
            const toggle     = isExpanded ? "▾" : "▸";

            // Build one cell per column: toggle+label in first dim, sums in measures
            const groupCells = columns.map(function(col) {
              const startClass = (col.type === "pivot_measure" && col.pivotGroupStart)
                ? " rkt-col-start" : "";

              // First dimension — toggle + group key + count badge
              if (col.type === "dimension" && col.field.name === firstDim.name) {
                return `<td class="${startClass.trim()}">` +
                  `<span class="rkt-group-toggle">${toggle}</span>` +
                  `${escHtml(groupKey || "—")}` +
                  `<span class="rkt-group-count">${groupRowsList.length}</span>` +
                  `</td>`;
              }

              // Other dimension columns — empty
              if (col.type === "dimension") {
                return `<td class="${startClass.trim()}"></td>`;
              }

              // Measure / pivot measure — show sum of inner rows
              const sum = sumColumn(groupRowsList, col);
              if (sum === null) {
                return `<td class="${startClass.trim()}"></td>`;
              }
              const useAbbr = config["col_abbr_" + col.idx] === true;
              const dispSum = useAbbr
                ? fmtNumber(sum)
                : (Number.isInteger(sum) ? sum.toLocaleString() : sum.toFixed(2));
              return `<td class="rkt-number${startClass}" style="text-align:right;font-weight:600;" ` +
                `title="${escHtml(String(sum))}">${escHtml(dispSum)}</td>`;
            }).join("");

            parts.push(
              `<tr class="rkt-group-row" data-group-key="${escHtml(groupKey)}">` +
              groupCells +
              `</tr>`
            );

            groupRowsList.forEach(function(row) {
              const tds = columns.map(function(col) { return buildCell(row, col, config); }).join("");
              parts.push(
                `<tr class="rkt-sub-row" data-sub-group="${escHtml(groupKey)}" style="${isExpanded ? "" : "display:none"}">` +
                tds +
                `</tr>`
              );
            });
          });

          tbRows = parts.join("");
        } else {
          /* ── Flat rendering ── */
          tbRows = slice.map(function(row) {
            const tds = columns.map(function(col) { return buildCell(row, col, config); }).join("");
            return `<tr>${tds}</tr>`;
          }).join("");
        }

        /* Grand totals row — computed from ALL filtered rows (not just current page) */
        let tfoot = "";
        if (config.show_totals) {
          const totalCells = columns.map(function(col) {
            const startClass = (col.type === "pivot_measure" && col.pivotGroupStart)
              ? " rkt-col-start" : "";

            // First column: "Grand Total" label
            if (col.idx === 0) {
              return `<td class="${startClass.trim()}"><span class="rkt-totals-label">Grand Total</span></td>`;
            }

            // Dimension columns: empty
            if (col.type === "dimension") {
              return `<td class="${startClass.trim()}"></td>`;
            }

            // Measure / pivot-measure: sum across all filtered rows
            const sum = sumColumn(rows, col);
            if (sum === null) return `<td class="${startClass.trim()}"></td>`;

            const useAbbr  = config["col_abbr_" + col.idx] === true;
            const dispSum  = useAbbr
              ? fmtNumber(sum)
              : (Number.isInteger(sum) ? sum.toLocaleString() : sum.toFixed(2));
            return `<td class="rkt-number${startClass}" style="text-align:right;" title="${escHtml(String(sum))}">${escHtml(dispSum)}</td>`;
          }).join("");

          tfoot = `<tfoot><tr class="rkt-totals-row">${totalCells}</tr></tfoot>`;
        }

        tableWrap.innerHTML =
          `<table class="rkt-table">` +
          `<thead>${theadHtml}</thead>` +
          `<tbody>${tbRows}</tbody>` +
          tfoot +
          `</table>`;

        /* Bind sort headers */
        tableWrap.querySelectorAll("th[data-col]").forEach(function(th) {
          th.onclick = function() {
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

        /* Bind group row toggles */
        if (canGroup) {
          tableWrap.querySelectorAll("tr.rkt-group-row").forEach(function(tr) {
            tr.onclick = function() {
              const key = tr.getAttribute("data-group-key");
              if (state.expandedGroups.has(key)) {
                state.expandedGroups.delete(key);
              } else {
                state.expandedGroups.add(key);
              }
              render();
            };
          });
        }
      }

      try {
        render();
      } catch (e) {
        console.error("[rocket_accounts_table] render error:", e);
        tableWrap.innerHTML = `<div class="rkt-empty">Error rendering table — check browser console.</div>`;
      }
      done();
    },

    destroy: function() {
      if (this._ro) this._ro.disconnect();
    },
  });
})();
