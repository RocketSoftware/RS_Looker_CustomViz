/**
 * Rocket Software — Custom Looker Visualization
 * Accounts Table with Brand Styling
 *
 * To install:
 *   1. Host this file on a publicly accessible URL (or use Looker's Marketplace file hosting).
 *   2. In Looker Admin → Visualizations, add a new visualization and paste the URL.
 *   3. In any Explore, select "Rocket — Accounts Table" from the visualization picker.
 *
 * Supported field types: dimensions, measures, table calculations.
 * Health badge auto-detection works on any string field — configure keywords in viz options.
 * Fully responsive: adapts padding, toolbar layout, and chrome across tile sizes.
 *
 * Version: 1.1.0  |  May 2025
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
      cursor: pointer;
      user-select: none;
      transition: color .15s;
    }
    .rkt-table th:hover { color: ${T.tx}; }
    .rkt-table th.sort-asc::after  { content: ' ↑'; color: ${T.P}; }
    .rkt-table th.sort-desc::after { content: ' ↓'; color: ${T.P}; }
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

    /* Narrow: < 340px — compact everything, stack toolbar, hide non-essentials */
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

    /* Small: 340–520px — condensed but still functional */
    .rkt-wrap[data-w="sm"] .rkt-topbar { padding: 9px 12px; }
    .rkt-wrap[data-w="sm"] .rkt-title  { font-size: 14px; }
    .rkt-wrap[data-w="sm"] .rkt-count  { display: none; }
    .rkt-wrap[data-w="sm"] .rkt-toolbar { padding: 7px 12px; gap: 6px; }
    .rkt-wrap[data-w="sm"] .rkt-pg-info { display: none; }
    .rkt-wrap[data-w="sm"] .rkt-table th { padding: 8px 10px; }
    .rkt-wrap[data-w="sm"] .rkt-table td { padding: 8px 10px; max-width: 160px; }

    /* Medium: 520–760px — show most chrome but compact */
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
    if (cell.value  == null)   return "";
    const v = cell.value;
    if (typeof v === "number") return v.toLocaleString();
    return String(v);
  }

  /** Returns a badge CSS class based on the cell's string value and config keywords. */
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

  /** Guess whether a field looks like a health/status field by name. */
  function isLikelyHealthField(name) {
    const n = name.toLowerCase();
    return ["health","status","stage","state","risk","flag","tier"].some(k => n.includes(k));
  }

  /** Guess whether a field is numeric (measure or number dimension). */
  function isNumeric(field) {
    return field.type === "number" || field.category === "measure";
  }

  /** Apply width breakpoint attribute to the root element. */
  function applyBreakpoint(root, w) {
    root.setAttribute("data-w",
      w < 340 ? "xs" : w < 520 ? "sm" : w < 760 ? "md" : "lg"
    );
  }

  /* ─── Looker visualization definition ────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_accounts_table",
    label: "Rocket — Data Table",

    options: {
      title: {
        type:        "string",
        label:       "Table title",
        default:     "",
        placeholder: "Leave blank to derive from field names",
        section:     "Style",
        order:       1,
      },
      rows_per_page: {
        type:    "number",
        label:   "Rows per page",
        default: 10,
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
        default:     "healthy,green,expanding,active,on track",
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
        default:     "critical,red,error,churned,lost",
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

    /* Called once — set up the DOM skeleton and inject styles. */
    create: function (element, config) {
      const styleEl = document.createElement("style");
      styleEl.textContent = CSS;
      element.appendChild(styleEl);

      element.innerHTML += `<div class="rkt-wrap rkt-diag-bg" id="rkt-root" data-w="lg">
        <div class="rkt-topbar">
          <div class="rkt-topbar-left">
            ${LOGO_SVG}
            <span class="rkt-title" id="rkt-title">Data</span>
          </div>
          <span class="rkt-count" id="rkt-count"></span>
        </div>
        <div class="rkt-gline"></div>
        <div class="rkt-toolbar" id="rkt-toolbar" style="display:none">
          <input class="rkt-search" id="rkt-search" type="text" placeholder="Search…"/>
          <span class="rkt-pg-info" id="rkt-pg-info"></span>
          <button class="rkt-pg-btn" id="rkt-prev">‹ Prev</button>
          <button class="rkt-pg-btn" id="rkt-next">Next ›</button>
        </div>
        <div class="rkt-table-wrap" id="rkt-table-wrap">
          <div class="rkt-empty">Loading…</div>
        </div>
      </div>`;

      /* State attached to the element for cross-call persistence. */
      this._state = { page: 0, sortCol: null, sortDir: 1, query: "" };

      /* ResizeObserver: update breakpoint attribute whenever tile is resized */
      if (typeof ResizeObserver !== "undefined") {
        this._ro = new ResizeObserver(entries => {
          const { width } = entries[0].contentRect;
          const root = element.querySelector("#rkt-root");
          if (root) applyBreakpoint(root, width);
        });
        this._ro.observe(element);
      }
    },

    /* Called on every data update. */
    updateAsync: function (data, element, config, queryResponse, details, done) {
      const state   = this._state;
      const perPage = Math.max(1, config.rows_per_page || 10);

      /* Seed breakpoint from current width */
      const root = element.querySelector("#rkt-root");
      if (root) applyBreakpoint(root, element.offsetWidth || 600);

      /* ── Collect all fields in display order ── */
      const allFields = [
        ...(queryResponse.fields.dimensions         || []),
        ...(queryResponse.fields.measures           || []),
        ...(queryResponse.fields.table_calculations || []),
      ];

      /* ── Update title — derive from first field name when no override is set.
            Treat the legacy default "Accounts" as blank for backward compat. ── */
      const derivedTitle = allFields.length > 0
        ? (allFields[0].label_short || allFields[0].label || allFields[0].name)
        : "Data";
      const titleOverride = (config.title && config.title !== "Accounts") ? config.title : null;
      document.getElementById("rkt-title").textContent = titleOverride || derivedTitle;

      /* ── Toggle toolbar ── */
      const toolbar = document.getElementById("rkt-toolbar");
      toolbar.style.display = (config.show_search !== false) ? "flex" : "none";

      /* ── Wire search ── */
      const searchInput = document.getElementById("rkt-search");
      searchInput.oninput = () => {
        state.query = searchInput.value.toLowerCase();
        state.page  = 0;
        render();
      };

      /* ── Wire paging ── */
      document.getElementById("rkt-prev").onclick = () => { state.page--; render(); };
      document.getElementById("rkt-next").onclick = () => { state.page++; render(); };

      /* ── Render function (re-runs on sort / search / page) ── */
      const render = () => {
        /* Filter */
        let rows = data.filter(row => {
          if (!state.query) return true;
          return allFields.some(f => {
            const cell = row[f.name];
            return cell && String(cell.rendered || cell.value || "").toLowerCase().includes(state.query);
          });
        });

        /* Sort */
        if (state.sortCol !== null) {
          const field = allFields[state.sortCol];
          rows = rows.slice().sort((a, b) => {
            const av = a[field.name]?.value ?? "";
            const bv = b[field.name]?.value ?? "";
            if (av < bv) return -state.sortDir;
            if (av > bv) return  state.sortDir;
            return 0;
          });
        }

        /* Page bounds */
        const total   = rows.length;
        const maxPage = Math.max(0, Math.ceil(total / perPage) - 1);
        state.page    = Math.min(Math.max(0, state.page), maxPage);
        const slice   = rows.slice(state.page * perPage, (state.page + 1) * perPage);

        /* Determine current width breakpoint for inline decisions */
        const tileW = element.offsetWidth || 600;

        /* Count badge */
        document.getElementById("rkt-count").textContent =
          total + (total !== data.length ? " of " + data.length : "") + " records";

        /* Paging info */
        const start = total ? state.page * perPage + 1 : 0;
        const end   = Math.min((state.page + 1) * perPage, total);
        document.getElementById("rkt-pg-info").textContent =
          total ? `${start}–${end} of ${total}` : "No results";
        document.getElementById("rkt-prev").disabled = state.page === 0;
        document.getElementById("rkt-next").disabled = state.page >= maxPage;

        /* Build table */
        if (allFields.length === 0) {
          document.getElementById("rkt-table-wrap").innerHTML =
            '<div class="rkt-empty">Add dimensions or measures to see data.</div>';
          return;
        }

        if (total === 0) {
          document.getElementById("rkt-table-wrap").innerHTML =
            '<div class="rkt-empty">No matching records found.</div>';
          return;
        }

        /* Header */
        const thCells = allFields.map((f, i) => {
          const sortClass =
            state.sortCol === i ? (state.sortDir === 1 ? "sort-asc" : "sort-desc") : "";
          return `<th class="${sortClass}" data-col="${i}">${escHtml(f.label_short || f.label || f.name)}</th>`;
        }).join("");

        /* Body */
        const tbRows = slice.map(row => {
          const tds = allFields.map(f => {
            const cell = row[f.name];
            const raw  = cell?.value;
            const disp = formatValue(cell);

            /* Try to render as a health badge */
            const hCls = isLikelyHealthField(f.name) ? healthClass(raw, config) : null;

            if (hCls) {
              return `<td><span class="rkt-badge ${hCls}">${escHtml(disp)}</span></td>`;
            }

            /* Right-align numbers */
            const align = isNumeric(f) ? ' style="text-align:right"' : "";
            return `<td class="rkt-number"${align} title="${escHtml(disp)}">${escHtml(disp)}</td>`;
          }).join("");
          return `<tr>${tds}</tr>`;
        }).join("");

        document.getElementById("rkt-table-wrap").innerHTML = `
          <table class="rkt-table">
            <thead><tr>${thCells}</tr></thead>
            <tbody>${tbRows}</tbody>
          </table>`;

        /* Bind sort headers */
        document.querySelectorAll(".rkt-table th[data-col]").forEach(th => {
          th.onclick = () => {
            const col = parseInt(th.dataset.col, 10);
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

      render();
      done();
    },
  });
})();