// ---- 1. Adjust these to match your app -------------------------------------
var TH_STORAGE_KEY = "transactions";   // your localStorage key
var TH_CURRENCY = "₹";                 // e.g. "₹"
function thAmount(t) { return Number(t.amount) || 0; }
function thType(t) { return t.type === "income" ? "income" : "expense"; }
function thCategory(t) { return String(t.category || "uncategorized").trim().toLowerCase(); }
function thTitle(t) { return t.title || t.description || t.name || thCap(thCategory(t)); }
function thDateOf(t) {                 // t.date like "2026-10-22"
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(t.date));
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(t.date);
}
var TH_ICONS = {                       // category -> emoji, add your own
  food: "🍔", transport: "🚗", bills: "🧾", shopping: "🛍️", health: "💊",
  entertainment: "🎬", education: "📚", rent: "🏠", travel: "✈️", groceries: "🛒",
  salary: "💼", business: "🏢", gift: "🎁", other: "📦", uncategorized: "📦"
};
// -----------------------------------------------------------------------------

var TH_PERIODS = [
  ["today", "Today"], ["week", "This Week"], ["month", "This Month"],
  ["lastMonth", "Last Month"], ["3months", "Last 3 Months"],
  ["year", "This Year"], ["all", "All Time"]
];
var thState = { period: "month", type: "all" };

function thCap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
function thEsc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function thLoad() {
  try { return JSON.parse(localStorage.getItem(TH_STORAGE_KEY)) || []; }
  catch (e) { return []; }
}
function thDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

function thInPeriod(d, period) {
  var now = new Date(), today = thDay(now);
  if (period === "all") return true;
  if (period === "today") return +thDay(d) === +today;
  if (period === "week") {
    var start = new Date(today);
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
    return d >= start && d <= now;
  }
  if (period === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (period === "lastMonth") {
    var lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth();
  }
  if (period === "3months") {
    var from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return d >= from && d <= now;
  }
  if (period === "year") return d.getFullYear() === now.getFullYear();
  return true;
}

function thGroupLabel(d) {
  var today = thDay(new Date()), diff = Math.round((today - thDay(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function thListHtml() {
  var rows = thLoad().map(function (t, i) { return { t: t, d: thDateOf(t), i: i }; })
    .filter(function (r) { return !isNaN(r.d) && thAmount(r.t) > 0; })
    .filter(function (r) { return thInPeriod(r.d, thState.period); })
    .filter(function (r) { return thState.type === "all" || thType(r.t) === thState.type; })
    .sort(function (a, b) { return b.d - a.d; });

  if (!rows.length) return '<div class="th-empty">No transactions for this filter.</div>';

  var html = "", last = "";
  rows.forEach(function (r) {
    var label = thGroupLabel(r.d), type = thType(r.t), cat = thCategory(r.t);
    if (label !== last) { html += '<div class="th-group">' + thEsc(label) + "</div>"; last = label; }
    html += '<div class="th-row">' +
      '<div class="th-ico ' + type + '">' + (TH_ICONS[cat] || "📦") + "</div>" +
      '<div class="th-info"><div class="th-name">' + thEsc(thTitle(r.t)) + "</div>" +
      '<div class="th-sub">' + (type === "income" ? "↙ Received" : "↗ Paid") + " · " + thEsc(thCap(cat)) + "</div></div>" +
      '<div class="th-amt ' + type + '">' + (type === "income" ? "+" : "-") + TH_CURRENCY +
      thAmount(r.t).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</div>" +
      '<button class="th-del" data-index="' + r.i + '" aria-label="Delete transaction" title="Delete">' +
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>' +
      "</button></div>";
  });
  return html;
}

function renderTransactionHistory() {
  var root = document.getElementById("transaction-history");
  if (!root) return;
  var prevList = root.querySelector(".th-list");
  var prevScroll = prevList ? prevList.scrollTop : 0;

  root.innerHTML = '<div class="th-card">' +
    '<div class="th-head"><div class="th-title"><i>🕘</i>Transaction History</div>' +
    '<select class="th-filter" aria-label="Period">' +
    TH_PERIODS.map(function (p) {
      return '<option value="' + p[0] + '"' + (p[0] === thState.period ? " selected" : "") + ">" + p[1] + "</option>";
    }).join("") + "</select></div>" +
    '<div class="th-tabs">' +
    [["all", "All"], ["expense", "Expenses"], ["income", "Income"]].map(function (t) {
      return '<button class="th-tab' + (t[0] === thState.type ? " on" : "") + '" data-type="' + t[0] + '">' + t[1] + "</button>";
    }).join("") + "</div>" +
    '<div class="th-list">' + thListHtml() + "</div></div>";

  var list = root.querySelector(".th-list");
  list.scrollTop = prevScroll;

  list.onclick = function (e) {
    var btn = e.target.closest(".th-del");
    if (!btn) return;
    if (!confirm("Delete this transaction?")) return;
    if (typeof deleteTransaction === "function") deleteTransaction(Number(btn.dataset.index));
  };
  root.querySelector(".th-filter").onchange = function () {
    thState.period = this.value;
    list.innerHTML = thListHtml();
    list.scrollTop = 0;
  };
  root.querySelectorAll(".th-tab").forEach(function (b) {
    b.onclick = function () {
      thState.type = b.dataset.type;
      root.querySelectorAll(".th-tab").forEach(function (x) { x.classList.toggle("on", x === b); });
      list.innerHTML = thListHtml();
      list.scrollTop = 0;
    };
  });
}

document.addEventListener("DOMContentLoaded", renderTransactionHistory);
