/* ╔══════════════════════════════════════════════════════════╗
   ║              ★  CONFIGURATION — EDIT HERE  ★            ║
   ╚══════════════════════════════════════════════════════════╝ */
var CONFIG = {

  title: "Election Live Polling",
  subtitle: "Nusrath School · Student Parliament 2026–27",

  booths: [
    {
      name: "Booth 3",
      url:  "https://script.google.com/macros/s/AKfycbwfAoYZrKSaqYq9gA5YBgOGbjyqlngt1-7tzo6etU_7IcnBHCrq14IcJCLpAzWSpUKMhw/exec?page=polling"
    },
    {
      name: "Booth 2",
      url:  "https://script.google.com/macros/s/AKfycbyViynneHWRuBHKmXNPPs7C5MRarBhZRRkzHh7pp9sNXUT9WQGAVdHljIfj13euCXV6/exec?page=polling"
    },
    {
      name: "Booth 1",
      url:  "https://script.google.com/macros/s/AKfycbzIJVC0akr45t3C-DfiCtyvKtf0kt-VeRioxj22sGZz-Bkv3pbUXPShkBrdQKNR33Z5/exec?page=polling"
    }
  ],

  apiUrl: "https://script.google.com/macros/s/AKfycbwKuQNcvjMq366W320HdW1vRrgTJhn_HAZREPOEucrRpruSQh4Ke1IsxLmZFSduS0pP/exec",
  pollInterval: 15,
  autoRefreshMinutes: 3

};
/* ╔══════════════════════════════════════════════════════════╗
   ║            END OF CONFIGURATION — DO NOT EDIT BELOW     ║
   ╚══════════════════════════════════════════════════════════╝ */

var COLORS = ["#27ae60","#e67e22","#3498db","#e74c3c","#9b59b6",
              "#1abc9c","#f1c40f","#e84393","#2ecc71","#5d8aa8"];
var CAT_LABELS = { normal:"INFO", urgent:"⚡ URGENT", closed:"CLOSED", alees:"★ LATEST" };

/* Per-booth data store: { polled, total, status, name } */
var boothData = [];

document.getElementById("electionTitle").textContent = CONFIG.title;
document.getElementById("electionSub").textContent   = CONFIG.subtitle;
document.title = CONFIG.title;

/* ── Fullscreen ── */
document.getElementById("fsBtn").addEventListener("click", function(){
  if (!document.fullscreenElement)
    document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
  else
    document.exitFullscreen && document.exitFullscreen();
});
document.addEventListener("fullscreenchange", function(){
  document.getElementById("fsIcon").className =
    document.fullscreenElement ? "ti ti-minimize" : "ti ti-maximize";
});

/* ── SVG donut helper ── */
function makeDonut(polled, total, color, size) {
  size = size || 72;
  var r    = (size - 10) / 2;
  var cx   = size / 2, cy = size / 2;
  var circ = 2 * Math.PI * r;
  var pct  = total > 0 ? polled / total : 0;
  var dash = pct * circ;
  var gap  = circ - dash;

  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#1e2a40" stroke-width="9"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none"' +
      ' stroke="' + color + '" stroke-width="9"' +
      ' stroke-dasharray="' + dash.toFixed(2) + ' ' + gap.toFixed(2) + '"' +
      ' stroke-linecap="round"' +
      ' transform="rotate(-90 ' + cx + ' ' + cy + ')"' +
      ' style="transition:stroke-dasharray .8s ease"/>' +
  '</svg>';
}

/* ── Render donut card ── */
function renderDonutCard(card, idx) {
  var color    = COLORS[idx % COLORS.length];
  var data     = boothData[idx] || { polled: 0, total: 0, status: "live" };
  var polled   = data.polled || 0;
  var total    = data.total  || 0;
  var remain   = Math.max(0, total - polled);
  var pct      = total > 0 ? Math.round(polled / total * 100) : 0;
  var status = data.status || "live";
  var statusBg, statusCol, statusText;
  if (status === "closed") {
    statusBg = "#3a1a1a"; statusCol = "#f87171"; statusText = "CLOSED";
  } else if (status === "paused") {
    statusBg = "#2a2000"; statusCol = "#fbbf24"; statusText = "⏸ PAUSED";
  } else {
    statusBg = "#0d2a14"; statusCol = "#4ade80"; statusText = "OPEN";
  }

  card.innerHTML =
    /* Donut + stats row */
    '<div class="donut-row">' +
      '<div class="donut-svg-wrap">' +
        makeDonut(polled, total, color, 80) +
        '<div class="donut-center">' +
          '<div class="donut-pct">' + pct + '%</div>' +
          '<div class="donut-sub">polled</div>' +
        '</div>' +
      '</div>' +
      '<div class="donut-stats">' +
        '<div class="d-stat"><span class="d-dot" style="background:' + color + '"></span>' +
          '<span class="d-label">Voted</span><span class="d-val">' + polled + '</span></div>' +
        '<div class="d-stat"><span class="d-dot" style="background:#1e2a40;border:1px solid #3a5070"></span>' +
          '<span class="d-label">Remaining</span><span class="d-val">' + remain + '</span></div>' +
        '<div class="d-stat"><span class="d-dot" style="background:#f4d35e"></span>' +
          '<span class="d-label">Total</span><span class="d-val">' + total + '</span></div>' +
        '<div class="booth-status-row">' +
          '<span class="booth-status-pill" style="background:' + statusBg + ';color:' + statusCol + '">' + statusText + '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    /* Thin progress bar */
    '<div class="donut-bar-row">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:2px">' +
        '<span style="color:#5a7090;font-size:10px">Progress</span>' +
        '<span style="color:#94aacf;font-size:10px">' + pct + '%</span>' +
      '</div>' +
      '<div class="donut-bar-track"><div class="donut-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
    '</div>';
}

/* ── Grid ── */
function isMobile() { return window.innerWidth <= 600; }

function gridDimensions(n) {
  if (isMobile()) return { cols: 1, rows: n };
  if (n <= 3) return { cols: n, rows: 1 };
  var cols = Math.ceil(Math.sqrt(n));
  return { cols: cols, rows: Math.ceil(n / cols) };
}

var refreshTimers = [];

function buildGrid() {
  refreshTimers.forEach(clearInterval);
  refreshTimers = [];

  var grid = document.getElementById("grid");
  grid.innerHTML = "";
  var n   = CONFIG.booths.length;
  var dim = gridDimensions(n);
  grid.style.gridTemplateColumns = "repeat(" + dim.cols + ", 1fr)";
  grid.style.gridTemplateRows    = "repeat(" + dim.rows + ", 1fr)";

  CONFIG.booths.forEach(function(booth, i) {
    var color = COLORS[i % COLORS.length];
    var el    = document.createElement("div");
    el.className = "booth";
    el.style.borderTopColor = color;

    el.innerHTML =
      '<div class="booth-header">' +
        '<div class="booth-left">' +
          '<span class="booth-dot" style="background:' + color + '"></span>' +
          '<span class="booth-name">' + (booth.name || "Booth "+(i+1)) + '</span>' +
        '</div>' +
        '<div class="booth-right">' +
          '<span class="offline-tag">OFFLINE</span>' +
          '<span class="booth-status" style="background:' + color + '"></span>' +
        '</div>' +
      '</div>' +
      '<div class="frame-wrap">' +
        (booth.url
          ? '<iframe data-src="' + booth.url + '" title="' + booth.name + '" ' +
            'sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>'
          : '<div class="no-url"><i class="ti ti-layout-board"></i><p>No URL configured</p></div>') +
      '</div>' +
      '<div class="donut-card" id="donut-' + i + '"></div>';

    grid.appendChild(el);

    /* Render initial donut */
    renderDonutCard(el.querySelector("#donut-" + i), i);

    var iframe   = el.querySelector("iframe");
    var statusEl = el.querySelector(".booth-status");
    if (iframe) {
      iframe.src = iframe.dataset.src;
      armHeartbeat(iframe, el, statusEl);
      if (CONFIG.autoRefreshMinutes > 0) {
        var t = setInterval(function(iframe, el, statusEl) {
          return function() {
            el.classList.add("offline");
            statusEl.style.animation = "none";
            iframe.src = iframe.dataset.src +
              (iframe.dataset.src.indexOf("?") > -1 ? "&" : "?") + "_r=" + Date.now();
            armHeartbeat(iframe, el, statusEl);
          };
        }(iframe, el, statusEl), CONFIG.autoRefreshMinutes * 60000);
        refreshTimers.push(t);
      }
    }
  });
}

function armHeartbeat(iframe, boothEl, statusEl) {
  var timer = setTimeout(function() {
    boothEl.classList.add("offline");
    statusEl.style.animation = "none";
  }, 12000);
  iframe.addEventListener("load", function onLoad() {
    clearTimeout(timer);
    boothEl.classList.remove("offline");
    statusEl.style.animation = "";
    iframe.removeEventListener("load", onLoad);
  });
}

/* ── Ticker ── */
function showTicker(msg, cat, speed) {
  cat = cat || "normal"; speed = speed || "normal";
  var wrap  = document.getElementById("tickerWrap");
  var track = document.getElementById("tickerTrack");
  var badge = document.getElementById("tickerBadge");
  if (!msg || !msg.trim()) { wrap.classList.remove("show"); return; }
  document.getElementById("tickerA").textContent = msg;
  document.getElementById("tickerB").textContent = msg;
  badge.textContent = CAT_LABELS[cat] || "INFO";
  wrap.className = "ticker-wrap show cat-" + cat;
  var speedMap = { slow:.38, normal:.22, fast:.12 };
  var secs = Math.max(8, msg.length * (speedMap[speed] || .22));
  track.style.animation = "ticker-scroll " + secs + "s linear infinite";
}

/* ── API polling ── */
function pollApi() {
  if (!CONFIG.apiUrl) return;
  var base = CONFIG.apiUrl;
  var sep  = base.indexOf("?") > -1 ? "&" : "?";
  var t    = Date.now();

  /* Ticker */
  fetch(base + sep + "action=get&t=" + t, { cache:"no-store" })
    .then(function(r){ return r.json(); })
    .then(function(d){
      var msg = d.message || "", cat = d.category || "normal";
      if (Array.isArray(d.scheduled)) {
        var now  = new Date();
        var hhmm = now.getHours().toString().padStart(2,"0") + ":" +
                   now.getMinutes().toString().padStart(2,"0");
        var hit  = d.scheduled.find(function(s){ return s.at === hhmm; });
        if (hit) { msg = hit.message || msg; cat = hit.category || cat; }
      }
      showTicker(msg, cat);
    }).catch(function(){});

  /* Aggregation totals (driven from booth data now; kept for display) */
  fetch(base + sep + "action=totals&t=" + t, { cache:"no-store" })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if (typeof d.polled !== "number" || typeof d.total !== "number") return;
      var pct = d.total > 0 ? Math.round(d.polled / d.total * 100) : 0;
      document.getElementById("aggPolled").textContent    = d.polled;
      document.getElementById("aggRemaining").textContent = Math.max(0, d.total - d.polled);
      document.getElementById("aggTotal").textContent     = d.total;
      document.getElementById("aggPct").textContent       = pct + "% Polled";
      document.getElementById("aggFill").style.width      = pct + "%";
      document.getElementById("aggBar").classList.remove("hidden");
    }).catch(function(){});

  /* ── Per-booth totals — independent donut data from remote control ── */
  fetch(base + sep + "action=booth_totals&t=" + t, { cache:"no-store" })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if (!Array.isArray(d) || d.length === 0) return;
      /* Update each booth donut independently with its own remote-control values */
      d.forEach(function(item, i) {
        boothData[i] = item;
        var card = document.getElementById("donut-" + i);
        if (card) renderDonutCard(card, i);
      });
    }).catch(function(){
      /* If booth_totals not available, leave existing boothData alone */
    });
}

/* ── Boot ── */
buildGrid();
window.addEventListener("resize", function(){
  clearTimeout(window._rt);
  window._rt = setTimeout(buildGrid, 200);
});
if (CONFIG.apiUrl) {
  pollApi();
  setInterval(pollApi, CONFIG.pollInterval * 1000);
}
