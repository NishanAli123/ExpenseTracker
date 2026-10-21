const radioType = document.querySelectorAll('input[name="expenseOrIncome"]');
const dynamicFields = document.querySelector('.dynamicFields');
const today = new Date().toLocaleDateString("en-CA");


const categories = {
    expense: ["food", "transport", "bills", "shopping", "other"],
    income: ["salary", "business", "other"]
};

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function renderFields(type) {
    const options = categories[type]
        .map(c => `<option value="${c}">${capitalize(c)}</option>`)
        .join("");

    dynamicFields.innerHTML = `
        <label>Category
            <select id="category">${options}</select>
        </label>

        <label>Description (optional)
            <input type="text" id="description"></input>
        </label>

        <label>Amount
            <input type="number" id="amount"></input>
            <small id="amount-error"></small>
        </label>

        <label>Date
            <input type="date" value="${today}" id="date"></input>
        </label>

        <label for="paymentMode">Payment Mode
            <select id="paymentMode">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
            </select>
        </label>
    `;
}

radioType.forEach(radio => {
    radio.addEventListener("change", (e) => {
        renderFields(e.target.value);
    });
});


const transactions = JSON.parse(localStorage.getItem("transactions")) || []
const addBtn = document.getElementById("addBtn");
const amountSpend = document.getElementById("amount-spend")
const amountEarn = document.getElementById("amount-earn")
const amountBalance = document.getElementById("amount-balance")

addBtn.addEventListener("click", (e) => {

    e.preventDefault();
    const description = document.getElementById("description");
    const category = document.getElementById("category")
    const amount = document.getElementById("amount")
    const date = document.getElementById("date")
    const paymentmode = document.getElementById("paymentMode")
    const selectedType = document.querySelector('input[name="expenseOrIncome"]:checked');


    const transaction = {
        type: selectedType.value,
        category: category?.value,
        description: description?.value,
        amount: Number(amount?.value),
        date: date?.value,
        paymentmode: paymentmode?.value
    }

    /* Form validation */
    const descError = document.getElementById("description-error");
    const amountError = document.getElementById("amount-error");

    if (descError) descError.textContent = "";
    if (amountError) amountError.textContent = "";

    if (!transaction.amount || transaction.amount <= 0) {
        if (amountError) {
            amountError.textContent = "Enter a valid amount";
        }
        return;
    }

    if (
        transaction.type === "income" &&
        transaction.category === "other" &&
        !transaction.description
    ) {
        if (descError) {
            descError.textContent = "Description must be filled";
        }
        return;
    }

    transactions.push(transaction)

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    )

    // Update monthly spending comparison
    updateMonthlyComparison();

    //update piecharts
    updateCharts();

    /*transaction List*/
    const transactionList = document.querySelector(".transaction-list");

    transactionList.innerHTML += `
        <div class="transaction ${transaction.type}">
            <label>${transaction.type === "expense" ? "-" : "+"}&#8377 ${transaction.amount}</label>
            <label>${transaction.type === "expense" ? transaction.description : transaction.category === "other" ? transaction.description : transaction.category}</label>
            <label>${transaction.date}</label>
        </div>
    
    `

    transactionList.scrollTop = transactionList.scrollHeight;




    /*card updating*/
    const expenses = transactions.filter(transaction => transaction.type === "expense")
    const spending = transactions.filter(transaction => transaction.type === "income");

    const totalSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalEarn = spending.reduce((sum, spend) => sum + spend.amount, 0)

    amountSpend.textContent = totalSpend
    amountEarn.textContent = totalEarn


    // Empty the form fields
    selectedType.dispatchEvent(new Event("change", { bubbles: true }));
})

/*Loading the page*/
const transactionList = document.querySelector(".transaction-list");

// transactions.forEach(transaction => {
//     transactionList.innerHTML += `
//         <div class="transaction ${transaction.type}">
//             <label>${transaction.type === "expense" ? "-" : "+"}&#8377 ${transaction.amount}</label>
//             <label>${transaction.category ? transaction.category : transaction.description}</label>
//             <label>${transaction.date}</label>
//         </div>

//     `
// })



const expenses = transactions.filter(transaction => transaction.type === "expense")
const spending = transactions.filter(transaction => transaction.type === "income");

const totalSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0)
const totalEarn = spending.reduce((sum, spend) => sum + spend.amount, 0)

amountSpend.textContent = totalSpend
amountEarn.textContent = totalEarn
amountBalance.textContent = totalEarn - totalSpend


/*pop up window */

const modal = document.getElementById("modal");
const openBtn = document.getElementById("openForm");
const closeBtn = document.getElementById("closeForm");

openBtn.addEventListener("click", () => {
    modal.classList.add("active");
});

closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
});

// Close when clicking outside the form
modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.classList.remove("active");
    }
});

// Close with Escape key
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        modal.classList.remove("active");
    }
});


//increment or decrement symbol displaying

function getMonthlyTotals(type) {
    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousDate = new Date(currentYear, currentMonth - 1, 1);
    const previousMonth = previousDate.getMonth();
    const previousYear = previousDate.getFullYear();

    let currentTotal = 0;
    let previousTotal = 0;

    transactions.forEach(transaction => {
        if (transaction.type !== type) return;
        if (!transaction.date) return;

        const amount = Number(transaction.amount);
        if (!Number.isFinite(amount) || amount < 0) return;

        const [year, month] = transaction.date.split("-").map(Number);

        if (year === currentYear && month === currentMonth + 1) {
            currentTotal += amount;
        }

        if (year === previousYear && month === previousMonth + 1) {
            previousTotal += amount;
        }
    });

    return { currentTotal, previousTotal };
}

function renderChange(type, ids) {
    const { currentTotal, previousTotal } = getMonthlyTotals(type);

    const iconBox = document.getElementById(ids.icon);
    const percentageText = document.getElementById(ids.text);
    const change = document.getElementById(ids.box);
    const tooltip = document.getElementById(ids.tooltip)

    change.classList.remove("increase", "decrease", "no-change");

    let iconName = "minus";

    if (previousTotal === 0) {
        percentageText.textContent = "No previous data";
        change.classList.add("no-change");
        tooltip.style.display = "none"
    } else {
        const difference = currentTotal - previousTotal;
        const percentage = (difference / previousTotal) * 100;

        if (difference > 0) {
            iconName = "trending-up";
            percentageText.textContent = `+${percentage.toFixed(1)}%`;
            change.classList.add("increase");
            tooltip.textContent = `${percentage.toFixed(1)}% increment compared to last month`;
        } else if (difference < 0) {
            iconName = "trending-down";
            percentageText.textContent = `${percentage.toFixed(1)}%`;
            change.classList.add("decrease");
            tooltip.textContent = `${percentage.toFixed(1)}% decrement compared to last month`;
        } else {
            percentageText.textContent = "0%";
            change.classList.add("no-change");
        }
    }

    iconBox.innerHTML = `<i data-lucide="${iconName}"></i>`;
}

function updateMonthlyComparison() {
    renderChange("expense", {
        box: "spendingChange",
        icon: "changeIcon",
        text: "changePercentage",
        tooltip: "spendingTooltip"
    });

    renderChange("income", {
        box: "earningChange",
        icon: "earningIcon",
        text: "earningPercentage",
        tooltip: "earningTooltip"
    });

    lucide.createIcons();
}

updateMonthlyComparison();


//pie charts

const charts = {};

const categoryColors = {
    // expense
    food: "#F87171",
    transport: "#EF4444",
    bills: "#DC2626",
    shopping: "#991B1B",
    // income
    salary: "#86EFAC",
    business: "#4ADE80",
    // shared
    other: "#16A34A",
    uncategorized: "#FCA5A5"
};

function renderPie(type, canvasId) {
    const totals = {};

    transactions.forEach(t => {
        if (t.type !== type) return;

        const amount = Number(t.amount);
        if (!Number.isFinite(amount) || amount <= 0) return;

        const key = t.category || "uncategorized";
        totals[key] = (totals[key] || 0) + amount;
    });

    const keys = Object.keys(totals);
    const labels = keys.map(capitalize);
    const data = Object.values(totals);
    const colors = keys.map(key => categoryColors[key] || "#999999");

    // If the chart already exists, just update it
    if (charts[canvasId]) {
        const chart = charts[canvasId];
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].backgroundColor = colors;
        chart.update();
        return;
    }

    // Otherwise create it
    charts[canvasId] = new Chart(document.getElementById(canvasId), {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: "#000000",
                borderWidth: 3
            }]
        },
        options: {
            plugins: { legend: { position: "bottom" } }
        }
    });
}

function updateCharts() {
    renderPie("expense", "expenseChart");
    renderPie("income", "incomeChart");
}

updateCharts();
