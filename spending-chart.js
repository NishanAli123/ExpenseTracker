// ---- 1. Adjust these to match your app -------------------------------------
var SH_STORAGE_KEY = "transactions";            // your localStorage key
var SH_COLORS = ["#2547c9", "#2f6bff", "#4f90ff", "#8bb4ff"]; // one per category
function shIsExpense(t) { return t.type === "expense"; }      // how you mark expenses
function shAmount(t) { return Number(t.amount) || 0; }
function shCategory(t) {
  var c = String(t.category || "Other").trim();
  if (!c) return "Other";
  return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
}
function shDate(t) { return new Date(t.date); }          // t.date like "2026-10-21"
// -----------------------------------------------------------------------------

var SH_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var SH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var SH_MAX_BAR = 150; // tallest bar in px
var shState = { year: new Date().getFullYear(), active: new Date().getMonth() };

function shEsc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function shLoad() {
  try { return JSON.parse(localStorage.getItem(SH_STORAGE_KEY)) || []; }
  catch (e) { return []; }
}

// Build { years, cats, months[12] = { catName: amount } } for the chosen year
function shBuild(all, year) {
  var expenses = all.filter(shIsExpense).filter(function (t) { return !isNaN(shDate(t)); });
  var years = {};
  expenses.forEach(function (t) { years[shDate(t).getFullYear()] = true; });
  years[new Date().getFullYear()] = true;

  var inYear = expenses.filter(function (t) { return shDate(t).getFullYear() === year; });

  // top 3 categories by yearly total; everything else becomes "Other"
  var totals = {};
  inYear.forEach(function (t) { totals[shCategory(t)] = (totals[shCategory(t)] || 0) + shAmount(t); });
  var ranked = Object.keys(totals)
    .filter(function (c) { return c !== "Other"; })
    .sort(function (a, b) { return totals[b] - totals[a]; });
  var top = ranked.slice(0, 3);
  var hasOther = ranked.length > 3 || totals["Other"] > 0;
  var cats = hasOther ? top.concat(["Other"]) : top;

  var months = [];
  for (var m = 0; m < 12; m++) months.push({});
  inYear.forEach(function (t) {
    var c = shCategory(t);
    if (top.indexOf(c) === -1) c = "Other";
    var o = months[shDate(t).getMonth()];
    o[c] = (o[c] || 0) + shAmount(t);
  });

  return {
    years: Object.keys(years).map(Number).sort(function (a, b) { return b - a; }),
    cats: cats,
    months: months
  };
}

function shMoney(n) { return "$" + Math.round(n).toLocaleString(); } // change currency symbol here

function renderSpendingChart() {
  var root = document.getElementById("spending-chart");
  if (!root) return;
  var d = shBuild(shLoad(), shState.year);
  var sums = d.months.map(function (o) {
    return d.cats.reduce(function (s, c) { return s + (o[c] || 0); }, 0);
  });
  var max = Math.max.apply(null, sums.concat([1]));

  var html = '<div class="sh-card">' +
    '<div class="sh-head"><div class="sh-title">Annual Spending History</div>' +
    '<select class="sh-filter" aria-label="Year">' +
    d.years.map(function (y) {
      return '<option value="' + y + '"' + (y === shState.year ? " selected" : "") + ">" + y + "</option>";
    }).join("") + "</select></div>";

  if (!d.cats.length) {
    html += '<div class="sh-empty">No expenses recorded for ' + shState.year + ".</div>";
  } else {
    html += '<div class="sh-chart"><div class="sh-cols">';
    d.months.forEach(function (o, i) {
      html += '<div class="sh-col" tabindex="0" data-i="' + i + '" aria-label="' + SH_FULL[i] + ": " + shMoney(sums[i]) + '">' +
        '<div class="sh-bar"><div class="sh-stack">';
      d.cats.forEach(function (c, j) {
        var v = o[c] || 0;
        if (v > 0) {
          html += '<div class="sh-seg" style="background:' + SH_COLORS[j % SH_COLORS.length] +
            ";height:" + Math.max(14, (v / max) * SH_MAX_BAR) + 'px"></div>';
        }
      });
      html += '</div></div><div class="sh-mo">' + SH_MONTHS[i] + "</div></div>";
    });
    html += '</div><div class="sh-tip"></div></div>';
  }

  html += '<div class="sh-foot"><div>*This chart shows data for ' + shState.year + "</div>" +
    '<div class="sh-legend">' + d.cats.map(function (c, j) {
      return '<span><i style="background:' + SH_COLORS[j % SH_COLORS.length] + '"></i>' + shEsc(c) + "</span>";
    }).join("") + "</div></div></div>";

  root.innerHTML = html;

  root.querySelector(".sh-filter").onchange = function () {
    shState.year = Number(this.value);
    renderSpendingChart();
  };

  var cols = root.querySelectorAll(".sh-col");
  var tip = root.querySelector(".sh-tip");
  var chart = root.querySelector(".sh-chart");

  function setActive(i) {
    tip.classList.add("show");
    shState.active = i;
    cols.forEach(function (c, k) { c.classList.toggle("on", k === i); });
    var o = d.months[i];
    tip.innerHTML = "<h4>" + SH_FULL[i] + " " + shState.year + "</h4>" +
      '<div class="sh-row total"><span>Total:</span><b>' + shMoney(sums[i]) + "</b></div>" +
      d.cats.map(function (c) {
        return '<div class="sh-row"><span>' + shEsc(c) + ":</span><b>" + shMoney(o[c] || 0) + "</b></div>";
      }).join("");
    var cr = cols[i].getBoundingClientRect(), pr = chart.getBoundingClientRect();
    var left = cr.left - pr.left + cr.width / 2 + 28;
    if (left + 176 > pr.width) left = cr.left - pr.left + cr.width / 2 - 28 - 176;
    tip.style.left = Math.max(0, left) + "px";
  }

  if (cols.length) {
    cols.forEach(function (c, i) {
      c.addEventListener("mouseenter", function () { setActive(i); });
      c.addEventListener("focus", function () { setActive(i); });
      c.addEventListener("click", function () { setActive(i); });
    });
    root.querySelector(".sh-cols").addEventListener("mouseleave", function () {
      tip.classList.remove("show");
      cols.forEach(function (c) { c.classList.remove("on"); });
    });
  }
}

window.addEventListener("resize", function () {
  var on = document.querySelector("#spending-chart .sh-col.on");
  if (on) on.dispatchEvent(new Event("mouseenter"));
});
document.addEventListener("DOMContentLoaded", renderSpendingChart);
