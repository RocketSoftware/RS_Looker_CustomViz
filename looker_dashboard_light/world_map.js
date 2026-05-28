/**
 * Rocket Software — World Map (Choropleth / Heatmap)
 * Custom Looker Visualization
 *
 * To install:
 *   1. Host this file at a publicly accessible URL.
 *   2. In Looker Admin → Visualizations, add the URL.
 *   3. Select "Rocket — World Map (Light)" from the visualization picker.
 *
 * Expects:
 *   - One dimension containing country identifiers
 *     (ISO alpha-2, ISO alpha-3, ISO numeric, or country name)
 *   - One measure (numeric) used as the heatmap value
 *
 * Features:
 *   - D3 geoNaturalEarth1 projection, fully responsive
 *   - Heatmap: higher value → more opaque / more vivid
 *   - Hover: country highlight + rich tooltip
 *   - Click-to-pin: dims other countries, keeps tooltip
 *   - Gradient legend bar overlaid on the map
 *   - Same brand topbar / gradient accent line as other Rocket vizzes
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
    B: "#6040EC",
    P: "#813CDD",
    K: "#B038C8",
    ok:   "#2DD4A0",
    wn:   "#F0A830",
    er:   "#F06060",
  };

  /* ─── Heatmap color stops (blue → purple → pink) ─────────────────────── */
  const HEAT_STOPS = ["#DFD9FB", "#6040EC", "#813CDD", "#B038C8"];

  /* ─── ISO alpha-2 → ISO numeric (3-digit string) ─────────────────────── */
  /* Covers all 249 UN M.49 territories recognised by world-atlas             */
  const ISO2_NUM = {
    AF:"004",AX:"008",AL:"008",DZ:"012",AS:"016",AD:"020",AO:"024",
    AI:"660",AQ:"010",AG:"028",AR:"032",AM:"051",AW:"533",AU:"036",
    AT:"040",AZ:"031",BS:"044",BH:"048",BD:"050",BB:"052",BY:"112",
    BE:"056",BZ:"084",BJ:"204",BM:"060",BT:"064",BO:"068",BQ:"535",
    BA:"070",BW:"072",BV:"074",BR:"076",IO:"086",BN:"096",BG:"100",
    BF:"854",BI:"108",CV:"132",KH:"116",CM:"120",CA:"124",KY:"136",
    CF:"140",TD:"148",CL:"152",CN:"156",CX:"162",CC:"166",CO:"170",
    KM:"174",CG:"178",CD:"180",CK:"184",CR:"188",CI:"384",HR:"191",
    CU:"192",CW:"531",CY:"196",CZ:"203",DK:"208",DJ:"262",DM:"212",
    DO:"214",EC:"218",EG:"818",SV:"222",GQ:"226",ER:"232",EE:"233",
    SZ:"748",ET:"231",FK:"238",FO:"234",FJ:"242",FI:"246",FR:"250",
    GF:"254",PF:"258",TF:"260",GA:"266",GM:"270",GE:"268",DE:"276",
    GH:"288",GI:"292",GR:"300",GL:"304",GD:"308",GP:"312",GU:"316",
    GT:"320",GG:"831",GN:"324",GW:"624",GY:"328",HT:"332",HM:"334",
    VA:"336",HN:"340",HK:"344",HU:"348",IS:"352",IN:"356",ID:"360",
    IR:"364",IQ:"368",IE:"372",IM:"833",IL:"376",IT:"380",JM:"388",
    JP:"392",JE:"832",JO:"400",KZ:"398",KE:"404",KI:"296",KP:"408",
    KR:"410",KW:"414",KG:"417",LA:"418",LV:"428",LB:"422",LS:"426",
    LR:"430",LY:"434",LI:"438",LT:"440",LU:"442",MO:"446",MG:"450",
    MW:"454",MY:"458",MV:"462",ML:"466",MT:"470",MH:"584",MQ:"474",
    MR:"478",MU:"480",YT:"175",MX:"484",FM:"583",MD:"498",MC:"492",
    MN:"496",ME:"499",MS:"500",MA:"504",MZ:"508",MM:"104",NA:"516",
    NR:"520",NP:"524",NL:"528",NC:"540",NZ:"554",NI:"558",NE:"562",
    NG:"566",NU:"570",NF:"574",MK:"807",MP:"580",NO:"578",OM:"512",
    PK:"586",PW:"585",PS:"275",PA:"591",PG:"598",PY:"600",PE:"604",
    PH:"608",PN:"612",PL:"616",PT:"620",PR:"630",QA:"634",RE:"638",
    RO:"642",RU:"643",RW:"646",BL:"652",SH:"654",KN:"659",LC:"662",
    MF:"663",PM:"666",VC:"670",WS:"882",SM:"674",ST:"678",SA:"682",
    SN:"686",RS:"688",SC:"690",SL:"694",SG:"702",SX:"534",SK:"703",
    SI:"705",SB:"090",SO:"706",ZA:"710",GS:"239",SS:"728",ES:"724",
    LK:"144",SD:"729",SR:"740",SJ:"744",SE:"752",CH:"756",SY:"760",
    TW:"158",TJ:"762",TZ:"834",TH:"764",TL:"626",TG:"768",TK:"772",
    TO:"776",TT:"780",TN:"788",TR:"792",TM:"795",TC:"796",TV:"798",
    UG:"800",UA:"804",AE:"784",GB:"826",US:"840",UM:"581",UY:"858",
    UZ:"860",VU:"548",VE:"862",VN:"704",VG:"092",VI:"850",WF:"876",
    EH:"732",YE:"887",ZM:"894",ZW:"716",
    // Frequently used extra codes
    XK:"383",  // Kosovo (non-standard)
  };

  /* ─── ISO alpha-3 → ISO numeric ──────────────────────────────────────── */
  const ISO3_NUM = {
    AFG:"004",ALB:"008",DZA:"012",ASM:"016",AND:"020",AGO:"024",
    ATG:"028",ARG:"032",ARM:"051",AUS:"036",AUT:"040",AZE:"031",
    BHS:"044",BHR:"048",BGD:"050",BRB:"052",BLR:"112",BEL:"056",
    BLZ:"084",BEN:"204",BTN:"064",BOL:"068",BIH:"070",BWA:"072",
    BRA:"076",BRN:"096",BGR:"100",BFA:"854",BDI:"108",CPV:"132",
    KHM:"116",CMR:"120",CAN:"124",CAF:"140",TCD:"148",CHL:"152",
    CHN:"156",COL:"170",COM:"174",COG:"178",COD:"180",CRI:"188",
    CIV:"384",HRV:"191",CUB:"192",CYP:"196",CZE:"203",DNK:"208",
    DJI:"262",DMA:"212",DOM:"214",ECU:"218",EGY:"818",SLV:"222",
    GNQ:"226",ERI:"232",EST:"233",SWZ:"748",ETH:"231",FJI:"242",
    FIN:"246",FRA:"250",GAB:"266",GMB:"270",GEO:"268",DEU:"276",
    GHA:"288",GRC:"300",GRD:"308",GTM:"320",GIN:"324",GNB:"624",
    GUY:"328",HTI:"332",HND:"340",HUN:"348",ISL:"352",IND:"356",
    IDN:"360",IRN:"364",IRQ:"368",IRL:"372",ISR:"376",ITA:"380",
    JAM:"388",JPN:"392",JOR:"400",KAZ:"398",KEN:"404",KIR:"296",
    PRK:"408",KOR:"410",KWT:"414",KGZ:"417",LAO:"418",LVA:"428",
    LBN:"422",LSO:"426",LBR:"430",LBY:"434",LIE:"438",LTU:"440",
    LUX:"442",MDG:"450",MWI:"454",MYS:"458",MDV:"462",MLI:"466",
    MLT:"470",MHL:"584",MRT:"478",MUS:"480",MEX:"484",FSM:"583",
    MDA:"498",MCO:"492",MNG:"496",MNE:"499",MAR:"504",MOZ:"508",
    MMR:"104",NAM:"516",NRU:"520",NPL:"524",NLD:"528",NZL:"554",
    NIC:"558",NER:"562",NGA:"566",MKD:"807",NOR:"578",OMN:"512",
    PAK:"586",PLW:"585",PSE:"275",PAN:"591",PNG:"598",PRY:"600",
    PER:"604",PHL:"608",POL:"616",PRT:"620",QAT:"634",ROU:"642",
    RUS:"643",RWA:"646",KNA:"659",LCA:"662",VCT:"670",WSM:"882",
    SMR:"674",STP:"678",SAU:"682",SEN:"686",SRB:"688",SYC:"690",
    SLE:"694",SGP:"702",SVK:"703",SVN:"705",SLB:"090",SOM:"706",
    ZAF:"710",SSD:"728",ESP:"724",LKA:"144",SDN:"729",SUR:"740",
    SWE:"752",CHE:"756",SYR:"760",TWN:"158",TJK:"762",TZA:"834",
    THA:"764",TLS:"626",TGO:"768",TON:"776",TTO:"780",TUN:"788",
    TUR:"792",TKM:"795",TUV:"798",UGA:"800",UKR:"804",ARE:"784",
    GBR:"826",USA:"840",URY:"858",UZB:"860",VUT:"548",VEN:"862",
    VNM:"704",YEM:"887",ZMB:"894",ZWE:"716",
  };

  /* ─── Normalised name → numeric (used as name-based fallback) ─────────── */
  const NAME_NUM = {
    "united states":"840","united states of america":"840","usa":"840",
    "united kingdom":"826","great britain":"826","uk":"826",
    "russia":"643","russian federation":"643",
    "china":"156","people's republic of china":"156",
    "taiwan":"158","taiwan, province of china":"158",
    "south korea":"410","korea, republic of":"410",
    "north korea":"408","korea, democratic people's republic of":"408",
    "iran":"364","iran, islamic republic of":"364",
    "syria":"760","syrian arab republic":"760",
    "vietnam":"704","viet nam":"704",
    "bolivia":"068","plurinational state of bolivia":"068",
    "venezuela":"862","bolivarian republic of venezuela":"862",
    "tanzania":"834","united republic of tanzania":"834",
    "moldova":"498","republic of moldova":"498",
    "laos":"418","lao pdr":"418",
    "congo":"178","republic of the congo":"178",
    "democratic republic of the congo":"180","dr congo":"180","drc":"180",
    "ivory coast":"384","côte d'ivoire":"384","cote d'ivoire":"384",
    "czechia":"203","czech republic":"203",
    "north macedonia":"807","macedonia":"807",
    "myanmar":"104","burma":"104",
    "eswatini":"748","swaziland":"748",
    "cabo verde":"132","cape verde":"132",
    "timor-leste":"626","east timor":"626",
    "palestine":"275","state of palestine":"275",
    "south sudan":"728",
    "kosovo":"383",
    // Standard names
    "afghanistan":"004","albania":"008","algeria":"012","angola":"024",
    "argentina":"032","armenia":"051","australia":"036","austria":"040",
    "azerbaijan":"031","bahrain":"048","bangladesh":"050","belarus":"112",
    "belgium":"056","belize":"084","benin":"204","bhutan":"064",
    "bosnia and herzegovina":"070","botswana":"072","brazil":"076",
    "brunei":"096","bulgaria":"100","burkina faso":"854","burundi":"108",
    "cambodia":"116","cameroon":"120","canada":"124",
    "central african republic":"140","chad":"148","chile":"152",
    "colombia":"170","comoros":"174","costa rica":"188","croatia":"191",
    "cuba":"192","cyprus":"196","denmark":"208","djibouti":"262",
    "dominica":"212","dominican republic":"214","ecuador":"218",
    "egypt":"818","el salvador":"222","equatorial guinea":"226",
    "eritrea":"232","estonia":"233","ethiopia":"231","fiji":"242",
    "finland":"246","france":"250","gabon":"266","gambia":"270",
    "georgia":"268","germany":"276","ghana":"288","greece":"300",
    "grenada":"308","guatemala":"320","guinea":"324",
    "guinea-bissau":"624","guyana":"328","haiti":"332","honduras":"340",
    "hungary":"348","iceland":"352","india":"356","indonesia":"360",
    "iraq":"368","ireland":"372","israel":"376","italy":"380",
    "jamaica":"388","japan":"392","jordan":"400","kazakhstan":"398",
    "kenya":"404","kiribati":"296","kuwait":"414","kyrgyzstan":"417",
    "latvia":"428","lebanon":"422","lesotho":"426","liberia":"430",
    "libya":"434","liechtenstein":"438","lithuania":"440",
    "luxembourg":"442","madagascar":"450","malawi":"454",
    "malaysia":"458","maldives":"462","mali":"466","malta":"470",
    "mauritania":"478","mauritius":"480","mexico":"484",
    "micronesia":"583","monaco":"492","mongolia":"496",
    "montenegro":"499","morocco":"504","mozambique":"508",
    "namibia":"516","nauru":"520","nepal":"524","netherlands":"528",
    "new zealand":"554","nicaragua":"558","niger":"562","nigeria":"566",
    "norway":"578","oman":"512","pakistan":"586","palau":"585",
    "panama":"591","papua new guinea":"598","paraguay":"600",
    "peru":"604","philippines":"608","poland":"616","portugal":"620",
    "qatar":"634","romania":"642","rwanda":"646",
    "saint kitts and nevis":"659","saint lucia":"662",
    "saint vincent and the grenadines":"670","samoa":"882",
    "san marino":"674","saudi arabia":"682","senegal":"686",
    "serbia":"688","seychelles":"690","sierra leone":"694",
    "singapore":"702","slovakia":"703","slovenia":"705",
    "solomon islands":"090","somalia":"706","south africa":"710",
    "spain":"724","sri lanka":"144","sudan":"729","suriname":"740",
    "sweden":"752","switzerland":"756","tajikistan":"762",
    "thailand":"764","togo":"768","tonga":"776",
    "trinidad and tobago":"780","tunisia":"788","turkey":"792",
    "turkmenistan":"795","tuvalu":"798","uganda":"800","ukraine":"804",
    "united arab emirates":"784","uruguay":"858","uzbekistan":"860",
    "vanuatu":"548","yemen":"887","zambia":"894","zimbabwe":"716",
  };

  /* ─── CSS ─────────────────────────────────────────────────────────────── */
  const CSS = `
    .rwm-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      background: ${T.bg};
      overflow: hidden;
      box-sizing: border-box;
      position: relative;
    }

    /* ── Topbar ── */
    .rwm-topbar {
      background: ${T.surf};
      padding: 10px 14px;
      border-bottom: 1px solid ${T.bo};
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      flex-shrink: 0;
    }
    .rwm-topbar-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .rwm-logo  { width: 20px; height: 20px; flex-shrink: 0; opacity: .85; }
    .rwm-title {
      font-size: 15px; font-weight: 500; color: ${T.tx};
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rwm-subtitle { font-size: 13px; color: ${T.mt}; white-space: nowrap; flex-shrink: 0; }

    /* ── Gradient accent line ── */
    .rwm-gline {
      height: 2px;
      background: linear-gradient(90deg, ${T.B}, ${T.P}, ${T.K});
      background-size: 200% 100%;
      flex-shrink: 0;
      animation: rwm-grad-flow 5s ease-in-out infinite alternate;
    }
    @keyframes rwm-grad-flow {
      from { background-position: 0% 50%; }
      to   { background-position: 100% 50%; }
    }

    /* ── Body ── */
    .rwm-body {
      flex: 1;
      min-height: 0;
      position: relative;
      overflow: hidden;
    }

    /* ── Map SVG fills body entirely ── */
    .rwm-svg {
      display: block;
      width: 100%; height: 100%;
      overflow: hidden;
    }

    /* ── Countries ── */
    .rwm-country {
      cursor: pointer;
      transition: stroke .12s, stroke-width .12s, opacity .18s;
      stroke: rgba(0,0,0,0.08);
      stroke-width: 0.4;
    }
    .rwm-country.hovered {
      stroke: rgba(0,0,0,0.65);
      stroke-width: 1.2;
    }
    .rwm-country.pinned {
      stroke: #1C1C1E;
      stroke-width: 1.6;
    }
    .rwm-country.dimmed {
      opacity: .22;
    }

    /* ── Country borders (mesh lines between neighbours) ── */
    .rwm-borders {
      fill: none;
      stroke: rgba(255,255,255,0.85);
      stroke-width: 0.6;
      pointer-events: none;
    }

    /* ── Graticule ── */
    .rwm-graticule {
      fill: none;
      stroke: rgba(0,0,0,0.08);
      stroke-width: 0.35;
      pointer-events: none;
    }

    /* ── Sphere (background) ── */
    .rwm-sphere {
      fill: #EDF2FA;
      pointer-events: none;
    }

    /* ── Legend bar ── */
    .rwm-legend {
      pointer-events: none;
    }
    .rwm-legend-bg {
      fill: rgba(255,255,255,0.96);
      rx: 6; ry: 6;
      stroke: #E5E5EA;
      stroke-width: 0.5;
    }
    .rwm-legend-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      fill: ${T.mt};
    }
    .rwm-legend-title {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      font-weight: 600;
      fill: ${T.tx};
      text-transform: uppercase;
      letter-spacing: .8px;
    }
    .rwm-nodata-label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 12px;
      fill: ${T.mt};
    }

    /* ── Tooltip ── */
    .rwm-tooltip {
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
      min-width: 160px; max-width: 240px;
    }
    .rwm-tooltip.visible { opacity: 1; transform: translateY(0) scale(1); }
    .rwm-tt-accent { height: 3px; background: ${T.P}; }
    .rwm-tt-body   { padding: 10px 14px 13px; }
    .rwm-tt-header { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
    .rwm-tt-swatch {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
      border: 1.5px solid rgba(0,0,0,0.15);
    }
    .rwm-tt-label  { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.1px; color: #6B6B7B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rwm-tt-value  { font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; color: ${T.tx}; letter-spacing: -0.5px; line-height: 1; margin-bottom: 3px; }
    .rwm-tt-pct    { font-size: 13px; color: ${T.mt}; letter-spacing: .2px; }
    .rwm-tt-nodata { font-size: 13px; color: ${T.mt}; padding: 4px 0 2px; }

    /* ── Loading / Empty states ── */
    .rwm-state {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      color: ${T.mt}; font-size: 14px;
      pointer-events: none;
    }

    /* ── Responsive ── */
    .rwm-root[data-w="xs"] .rwm-topbar  { padding: 7px 10px; }
    .rwm-root[data-w="xs"] .rwm-title   { font-size: 13px; }
    .rwm-root[data-w="xs"] .rwm-subtitle { display: none; }
    .rwm-root[data-w="sm"] .rwm-subtitle { display: none; }
    .rwm-root[data-h="xs"] .rwm-topbar  { display: none; }
    .rwm-root[data-h="xs"] .rwm-gline   { display: none; }
    .rwm-root[data-h="xs"] .rwm-body    { padding: 3px 6px; }
    .rwm-root[data-h="sm"] .rwm-topbar  { padding: 6px 12px; }
  `;

  /* ─── Logo SVG ────────────────────────────────────────────────────────── */
  const LOGO_SVG = `
    <svg class="rwm-logo" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rwm-lg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stop-color="${T.B}"/>
          <stop offset="50%"  stop-color="${T.P}"/>
          <stop offset="100%" stop-color="${T.K}"/>
        </linearGradient>
      </defs>
      <path d="M3 18 Q6 13 10 15 Q14 8 19 6"
            stroke="url(#rwm-lg)" stroke-width="2.4" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 6 L19 6 L19 11"
            stroke="url(#rwm-lg)" stroke-width="2.4" fill="none"
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

  /**
   * Given a raw dimension string from Looker, return the ISO numeric code
   * as a 3-digit zero-padded string (e.g. "840"), or null if unrecognised.
   */
  function resolveIsoNum(raw) {
    if (raw == null) return null;
    const s = String(raw).trim();

    // Already numeric or numeric-string?
    const n = parseInt(s, 10);
    if (!isNaN(n) && s.match(/^\d+$/)) {
      return String(n).padStart(3, "0");
    }

    const up = s.toUpperCase();

    // ISO2
    if (up.length === 2 && ISO2_NUM[up]) return ISO2_NUM[up];

    // ISO3
    if (up.length === 3 && ISO3_NUM[up]) return ISO3_NUM[up];

    // Name-based (normalised lowercase)
    const lo = s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    if (NAME_NUM[lo]) return NAME_NUM[lo];

    return null;
  }

  /** Linear interpolation between two hex colours at position t (0-1) */
  function lerpColor(hexA, hexB, t) {
    const parse = h => [
      parseInt(h.slice(1,3),16),
      parseInt(h.slice(3,5),16),
      parseInt(h.slice(5,7),16),
    ];
    const [r1,g1,b1] = parse(hexA);
    const [r2,g2,b2] = parse(hexB);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r},${g},${b})`;
  }

  /** Map t ∈ [0,1] through HEAT_STOPS colour ramp */
  function heatColor(t) {
    t = Math.max(0, Math.min(1, t));
    const stops = HEAT_STOPS;
    const seg = (stops.length - 1) * t;
    const i = Math.floor(seg);
    const frac = seg - i;
    if (i >= stops.length - 1) return stops[stops.length - 1];
    return lerpColor(stops[i], stops[i + 1], frac);
  }

  /** Full opacity — color scale handles light→dark encoding */
  function heatOpacity(t) {
    return 1.0;
  }

  /** Dynamically load a script and resolve when ready */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load: " + src));
      document.head.appendChild(s);
    });
  }

  /* ─── Viz definition ──────────────────────────────────────────────────── */
  looker.plugins.visualizations.add({
    id:    "rocket_world_map_light",
    label: "Rocket — World Map (Light)",

    options: {
      title: {
        type: "string", label: "Chart title", default: "",
        section: "Style", order: 1,
      },
      show_graticule: {
        type: "boolean", label: "Show grid lines", default: false,
        section: "Style", order: 2,
      },
      show_legend: {
        type: "boolean", label: "Show legend", default: true,
        section: "Style", order: 3,
      },
      legend_position: {
        type: "string", label: "Legend position", display: "select",
        values: [
          { "Bottom-left":  "bl" },
          { "Bottom-right": "br" },
          { "Top-left":     "tl" },
          { "Top-right":    "tr" },
        ],
        default: "bl", section: "Style", order: 4,
      },
    },

    /* ── create ─────────────────────────────────────────────────────────── */
    create(el, config) {
      // Inject styles once
      if (!document.getElementById("rwm-light-styles")) {
        const st = document.createElement("style");
        st.id = "rwm-light-styles";
        st.textContent = CSS;
        document.head.appendChild(st);
      }

      // Root container
      el.innerHTML = "";
      const root = document.createElement("div");
      root.className = "rwm-root";
      el.appendChild(root);
      this._root = root;

      // Topbar
      const topbar = document.createElement("div");
      topbar.className = "rwm-topbar";
      topbar.innerHTML = `
        <div class="rwm-topbar-left">
          ${LOGO_SVG}
          <span class="rwm-title">World Map</span>
        </div>
        <span class="rwm-subtitle"></span>`;
      root.appendChild(topbar);
      this._titleEl    = topbar.querySelector(".rwm-title");
      this._subtitleEl = topbar.querySelector(".rwm-subtitle");

      // Gradient accent line
      const gline = document.createElement("div");
      gline.className = "rwm-gline";
      root.appendChild(gline);

      // Map body
      const body = document.createElement("div");
      body.className = "rwm-body";
      root.appendChild(body);
      this._body = body;

      // SVG (populated in updateAsync)
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "rwm-svg");
      body.appendChild(svg);
      this._svg = svg;

      // State overlay
      const stateEl = document.createElement("div");
      stateEl.className = "rwm-state";
      stateEl.textContent = "Loading map data…";
      body.appendChild(stateEl);
      this._stateEl = stateEl;

      // Tooltip
      const tip = document.createElement("div");
      tip.className = "rwm-tooltip";
      tip.innerHTML = `<div class="rwm-tt-accent"></div><div class="rwm-tt-body"></div>`;
      document.body.appendChild(tip);
      this._tip = tip;

      // Internal state
      this._pinnedId  = null;
      this._hoveredId = null;

      // Load D3 + TopoJSON then world-atlas once; cache as a promise
      this._ready = Promise.all([
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js"),
      ]).then(() =>
        fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
          .then(r => r.json())
      );

      // ResizeObserver → re-render
      this._debounceTimer = null;
      this._ro = new ResizeObserver(() => {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
          if (this._lastArgs) {
            const [data, elem, cfg, qr, details, done] = this._lastArgs;
            this._render(data, elem, cfg, qr, details, done);
          }
        }, 120);
      });
      this._ro.observe(body);
    },

    /* ── updateAsync ─────────────────────────────────────────────────────── */
    updateAsync(data, el, config, queryResponse, details, done) {
      this._lastArgs = [data, el, config, queryResponse, details, done];
      this._render(data, el, config, queryResponse, details, done);
    },

    /* ── _render ─────────────────────────────────────────────────────────── */
    _render(data, el, config, queryResponse, details, done) {
      const root       = this._root;
      const body       = this._body;
      const svg        = this._svg;
      const stateEl    = this._stateEl;
      const titleEl    = this._titleEl;
      const subtitleEl = this._subtitleEl;

      /* ── Dimensions ── */
      const W = body.clientWidth  || 600;
      const H = body.clientHeight || 360;
      applyBreakpoints(root, W, H);

      /* ── Title ── */
      const dims  = queryResponse.fields.dimensions || [];
      const meass = queryResponse.fields.measures   || [];
      const tcs   = queryResponse.fields.table_calculations || [];
      const allMeas = [...meass, ...tcs];

      const dimField  = dims[0];
      const measField = allMeas[0];

      titleEl.textContent =
        config.title ||
        (dimField  ? dimField.label_short  || dimField.label  : "World Map");
      subtitleEl.textContent =
        measField ? (measField.label_short || measField.label) : "";

      /* ── Validate ── */
      if (!dimField || !measField) {
        stateEl.textContent = "Add one dimension (country) and one measure.";
        stateEl.style.display = "flex";
        svg.innerHTML = "";
        done();
        return;
      }

      /* ── Parse rows ── */
      // Map: isoNum → { label, value }
      const countryMap = new Map();
      let total = 0;

      data.forEach(row => {
        const rawDim = row[dimField.name];
        const label  = rawDim ? (rawDim.rendered || String(rawDim.value || "")) : "";
        const isoNum = resolveIsoNum(rawDim ? rawDim.value : null);
        const cell   = row[measField.name];
        const value  = cell ? parseFloat(String(cell.value).replace(/[^0-9.\-]/g, "")) : null;

        if (isoNum && value != null && !isNaN(value)) {
          const prev = countryMap.get(isoNum);
          const combined = prev ? prev.value + value : value;
          countryMap.set(isoNum, { label: label || isoNum, value: combined });
          total += prev ? value : value;  // add only delta
        }
      });

      // Recalculate total correctly
      total = 0;
      countryMap.forEach(d => { total += d.value; });

      /* ── Wait for topology then draw ── */
      stateEl.style.display = countryMap.size === 0 ? "flex" : "none";
      stateEl.textContent = "Loading map data…";

      this._ready.then(world => {
        this._drawMap(world, W, H, countryMap, total, config, done);
      }).catch(err => {
        stateEl.textContent = "Failed to load map data.";
        stateEl.style.display = "flex";
        console.error("[rocket_world_map]", err);
        done();
      });
    },

    /* ── _drawMap ────────────────────────────────────────────────────────── */
    _drawMap(world, W, H, countryMap, total, config, done) {
      const svg     = this._svg;
      const stateEl = this._stateEl;

      /* ── Feature + mesh extraction ── */
      const features = topojson.feature(world, world.objects.countries).features;
      const borders  = topojson.mesh(world, world.objects.countries,
                                     (a, b) => a !== b);

      /* ── Projection ── */
      const proj = d3.geoNaturalEarth1()
        .fitSize([W, H], { type: "Sphere" });
      const pathGen = d3.geoPath().projection(proj);

      /* ── Value stats ── */
      let minVal = Infinity, maxVal = -Infinity;
      countryMap.forEach(d => {
        if (d.value < minVal) minVal = d.value;
        if (d.value > maxVal) maxVal = d.value;
      });
      if (!isFinite(minVal)) minVal = 0;
      if (!isFinite(maxVal)) maxVal = 1;
      const valRange = maxVal - minVal || 1;

      function tForValue(v) {
        return (v - minVal) / valRange;
      }

      /* ── SVG rebuild ── */
      svg.innerHTML = "";
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.setAttribute("width",  W);
      svg.setAttribute("height", H);

      // Define gradient for legend
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `
        <linearGradient id="rwm-heat-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${HEAT_STOPS[0]}" stop-opacity="1"/>
          <stop offset="33%"  stop-color="${HEAT_STOPS[1]}" stop-opacity="1"/>
          <stop offset="67%"  stop-color="${HEAT_STOPS[2]}" stop-opacity="1"/>
          <stop offset="100%" stop-color="${HEAT_STOPS[3]}" stop-opacity="1"/>
        </linearGradient>
        <linearGradient id="rwm-heat-grad-opaque" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="${HEAT_STOPS[0]}"/>
          <stop offset="33%"  stop-color="${HEAT_STOPS[1]}"/>
          <stop offset="67%"  stop-color="${HEAT_STOPS[2]}"/>
          <stop offset="100%" stop-color="${HEAT_STOPS[3]}"/>
        </linearGradient>`;
      svg.appendChild(defs);

      // Sphere background
      const spherePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      spherePath.setAttribute("class", "rwm-sphere");
      spherePath.setAttribute("d", pathGen({ type: "Sphere" }));
      svg.appendChild(spherePath);

      // Graticule
      if (config.show_graticule) {
        const grat = d3.geoGraticule()();
        const gratPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        gratPath.setAttribute("class", "rwm-graticule");
        gratPath.setAttribute("d", pathGen(grat));
        svg.appendChild(gratPath);
      }

      /* ── Country paths ── */
      const countriesG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      countriesG.setAttribute("class", "rwm-countries");
      svg.appendChild(countriesG);

      const self = this;

      features.forEach(feat => {
        const isoNum = String(feat.id).padStart(3, "0");
        const info   = countryMap.get(isoNum);
        const hasData = !!info;

        const t     = hasData ? tForValue(info.value) : null;
        const color = hasData ? heatColor(t)   : "#DFE2E9";
        const alpha = hasData ? heatOpacity(t) : 1;

        const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathEl.setAttribute("class", "rwm-country");
        pathEl.setAttribute("d", pathGen(feat) || "");
        pathEl.style.fill        = color;
        pathEl.style.fillOpacity = String(alpha);
        pathEl.dataset.id        = isoNum;
        pathEl.dataset.hasData   = hasData ? "1" : "0";

        // Store for interaction
        pathEl._isoNum  = isoNum;
        pathEl._feat    = feat;
        pathEl._info    = info;

        countriesG.appendChild(pathEl);

        // ── Mouse events ──
        pathEl.addEventListener("mouseenter", function (e) {
          self._onHover(isoNum, e, info, t !== null ? heatColor(t) : null);
        });
        pathEl.addEventListener("mousemove", function (e) {
          self._moveTip(e);
        });
        pathEl.addEventListener("mouseleave", function () {
          self._onLeave(isoNum);
        });
        pathEl.addEventListener("click", function (e) {
          e.stopPropagation();
          self._onPin(isoNum);
        });
      });

      // Border mesh on top
      const borderPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      borderPath.setAttribute("class", "rwm-borders");
      borderPath.setAttribute("d", pathGen(borders));
      svg.appendChild(borderPath);

      // SVG click-to-clear
      svg.addEventListener("click", () => {
        self._pinnedId = null;
        self._applyStates();
        self._hideTip();
      });

      /* ── Legend ── */
      if (config.show_legend !== false) {
        this._drawLegend(svg, W, H, minVal, maxVal, config.legend_position || "bl");
      }

      /* ── Initial state ── */
      this._features    = features;
      this._countryMap  = countryMap;
      this._total       = total;
      this._minVal      = minVal;
      this._maxVal      = maxVal;
      this._countriesG  = countriesG;

      stateEl.style.display = countryMap.size === 0 ? "flex" : "none";
      if (countryMap.size === 0) stateEl.textContent = "No data matched to countries.";

      this._applyStates();
      done();
    },

    /* ── _drawLegend ─────────────────────────────────────────────────────── */
    _drawLegend(svg, W, H, minVal, maxVal, pos) {
      const LW = Math.min(160, W * 0.28);
      const LH = 8;
      const PAD = 12;
      const TOTAL_H = 36;

      let lx, ly;
      if      (pos === "bl") { lx = PAD;          ly = H - PAD - TOTAL_H; }
      else if (pos === "br") { lx = W - PAD - LW; ly = H - PAD - TOTAL_H; }
      else if (pos === "tl") { lx = PAD;          ly = PAD + 4; }
      else                   { lx = W - PAD - LW; ly = PAD + 4; }  // tr

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "rwm-legend");
      g.setAttribute("transform", `translate(${lx}, ${ly})`);

      // Background pill
      const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bg.setAttribute("class", "rwm-legend-bg");
      bg.setAttribute("x", -6); bg.setAttribute("y", -4);
      bg.setAttribute("width", LW + 12); bg.setAttribute("height", TOTAL_H + 4);
      bg.setAttribute("rx", 6); bg.setAttribute("ry", 6);
      g.appendChild(bg);

      // Title
      const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
      title.setAttribute("class", "rwm-legend-title");
      title.setAttribute("x", 0); title.setAttribute("y", 0);
      title.textContent = "Value";
      g.appendChild(title);

      // Gradient bar
      const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bar.setAttribute("x", 0); bar.setAttribute("y", 8);
      bar.setAttribute("width", LW); bar.setAttribute("height", LH);
      bar.setAttribute("rx", 3); bar.setAttribute("ry", 3);
      bar.setAttribute("fill", "url(#rwm-heat-grad-opaque)");
      bar.setAttribute("opacity", "0.9");
      g.appendChild(bar);

      // Min label
      const minLab = document.createElementNS("http://www.w3.org/2000/svg", "text");
      minLab.setAttribute("class", "rwm-legend-label");
      minLab.setAttribute("x", 0); minLab.setAttribute("y", 8 + LH + 11);
      minLab.setAttribute("text-anchor", "start");
      minLab.textContent = fmtNumber(minVal);
      g.appendChild(minLab);

      // Max label
      const maxLab = document.createElementNS("http://www.w3.org/2000/svg", "text");
      maxLab.setAttribute("class", "rwm-legend-label");
      maxLab.setAttribute("x", LW); maxLab.setAttribute("y", 8 + LH + 11);
      maxLab.setAttribute("text-anchor", "end");
      maxLab.textContent = fmtNumber(maxVal);
      g.appendChild(maxLab);

      // No-data swatch
      const ndG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      ndG.setAttribute("transform", `translate(${LW - 48}, ${8 + LH + 13})`);

      const ndR = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      ndR.setAttribute("width", 8); ndR.setAttribute("height", 8);
      ndR.setAttribute("rx", 1); ndR.setAttribute("ry", 1);
      ndR.setAttribute("fill", "#DFE2E9");
      ndR.setAttribute("stroke", "rgba(0,0,0,0.18)");
      ndR.setAttribute("stroke-width", "0.5");
      ndG.appendChild(ndR);

      const ndT = document.createElementNS("http://www.w3.org/2000/svg", "text");
      ndT.setAttribute("class", "rwm-nodata-label");
      ndT.setAttribute("x", 11); ndT.setAttribute("y", 7);
      ndT.textContent = "No data";
      ndG.appendChild(ndT);

      g.appendChild(ndG);

      svg.appendChild(g);
    },

    /* ── Tooltip helpers ─────────────────────────────────────────────────── */
    _showTip(isoNum, e, info, color) {
      const tip  = this._tip;
      const body = tip.querySelector(".rwm-tt-body");
      const total = this._total || 1;

      const isPinned = this._pinnedId === isoNum;

      if (info) {
        const pct = total > 0 ? ((info.value / total) * 100).toFixed(1) + "%" : "—";
        body.innerHTML = `
          <div class="rwm-tt-header">
            <div class="rwm-tt-swatch" style="background:${esc(color || T.P)}"></div>
            <span class="rwm-tt-label">${esc(info.label)}</span>
          </div>
          <div class="rwm-tt-value">${esc(fmtNumber(info.value))}</div>
          <div class="rwm-tt-pct">${esc(pct)} of total${isPinned ? " · pinned" : ""}</div>`;
      } else {
        // Look up name from feature
        const feat = this._features
          ? this._features.find(f => String(f.id).padStart(3,"0") === isoNum)
          : null;
        const name = feat && feat.properties && feat.properties.name
          ? feat.properties.name
          : isoNum;
        body.innerHTML = `
          <div class="rwm-tt-header">
            <div class="rwm-tt-swatch" style="background:#DFE2E9; border-color:rgba(0,0,0,0.15)"></div>
            <span class="rwm-tt-label">${esc(name)}</span>
          </div>
          <div class="rwm-tt-nodata">No data available</div>`;
      }

      tip.classList.add("visible");
      this._moveTip(e);
    },

    _moveTip(e) {
      const tip = this._tip;
      const mx = e.clientX, my = e.clientY;
      const tw = tip.offsetWidth  || 200;
      const th = tip.offsetHeight || 80;
      const vw = window.innerWidth, vh = window.innerHeight;
      const offset = 14;

      let tx = mx + offset;
      let ty = my - th / 2;

      if (tx + tw > vw - 8) tx = mx - tw - offset;
      if (ty < 8)             ty = 8;
      if (ty + th > vh - 8)   ty = vh - th - 8;

      tip.style.left = tx + "px";
      tip.style.top  = ty + "px";
    },

    _hideTip() {
      this._tip.classList.remove("visible");
    },

    /* ── Interaction handlers ────────────────────────────────────────────── */
    _onHover(isoNum, e, info, color) {
      // If something is pinned, only update tooltip style
      this._hoveredId = isoNum;
      this._applyStates();
      this._showTip(isoNum, e, info, color);
    },

    _onLeave(isoNum) {
      this._hoveredId = null;
      this._applyStates();
      if (!this._pinnedId) {
        this._hideTip();
      }
    },

    _onPin(isoNum) {
      if (this._pinnedId === isoNum) {
        // Unpin
        this._pinnedId = null;
        this._hideTip();
      } else {
        this._pinnedId = isoNum;
        // Keep tooltip showing with pinned info
        const info  = this._countryMap ? this._countryMap.get(isoNum) : null;
        const feat  = this._features
          ? this._features.find(f => String(f.id).padStart(3,"0") === isoNum)
          : null;
        const t = info && this._minVal != null
          ? (info.value - this._minVal) / ((this._maxVal - this._minVal) || 1)
          : null;
        const color = t !== null ? heatColor(t) : null;
        // Synthesise a fake event near center of SVG body
        const rect = this._body.getBoundingClientRect();
        const fakeE = { clientX: rect.left + rect.width  * 0.75,
                        clientY: rect.top  + rect.height * 0.55 };
        this._showTip(isoNum, fakeE, info, color);
      }
      this._applyStates();
    },

    _applyStates() {
      if (!this._countriesG) return;
      const pinned  = this._pinnedId;
      const hovered = this._hoveredId;
      const hasPinned = !!pinned;

      this._countriesG.querySelectorAll(".rwm-country").forEach(el => {
        const id = el._isoNum;
        el.classList.remove("hovered", "pinned", "dimmed");

        if (hasPinned) {
          if (id === pinned) {
            el.classList.add("pinned");
          } else {
            el.classList.add("dimmed");
          }
        } else if (id === hovered) {
          el.classList.add("hovered");
        }
      });
    },

    /* ── destroy ─────────────────────────────────────────────────────────── */
    destroy() {
      if (this._ro)  this._ro.disconnect();
      if (this._tip) this._tip.remove();
      clearTimeout(this._debounceTimer);
    },
  });

})();
