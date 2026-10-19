const radioType = document.querySelectorAll('input[name="expenseOrIncome"]');
const dynamicFields = document.querySelector('.dynamicFields');
const today = new Date().toLocaleDateString("en-CA");


radioType.forEach(radio => {
    radio.addEventListener("change", (e) => {
        if (e.target.value === "expense") {
            dynamicFields.innerHTML = `
                <label>Description
                <input type="text" id="description"></input>
                <small id="description-error"></small>
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
            `
        }
        else {
            dynamicFields.innerHTML = `
                <label>Category
                    <select id="category">
                        <option value="salary">Salary</option>
                        <option value="business">Business</option>
                        <option value="other">Other</option>
                    </select>
                </label>

                <div id="otherDescription"></div>


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

            `

            const otherDescription = document.getElementById('otherDescription');
            const category = document.getElementById("category")

            category.addEventListener("change", (e) => {
                if (e.target.value === "other") {
                    otherDescription.innerHTML = `
                    <label>Description
                       <input type="text" id="description"></input>
                       <small id="description-error"></small>
                    </label>
                `
                }
                else {
                    otherDescription.innerHTML = ``
                }
            })
        }
    })
})


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

    if (transaction.type === "expense" && !transaction.description) {
        if (descError) {
            descError.textContent = "Description must be filled";
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
    updateMonthlySpending();

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

transactions.forEach(transaction => {
    transactionList.innerHTML += `
        <div class="transaction ${transaction.type}">
            <label>${transaction.type === "expense" ? "-" : "+"}&#8377 ${transaction.amount}</label>
            <label>${transaction.category ? transaction.category : transaction.description}</label>
            <label>${transaction.date}</label>
        </div>
    
    `
})



const expenses = transactions.filter(transaction => transaction.type === "expense")
const spending = transactions.filter(transaction => transaction.type === "income");

const totalSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0)
const totalEarn = spending.reduce((sum, spend) => sum + spend.amount, 0)

amountSpend.textContent = totalSpend
amountEarn.textContent = totalEarn
amountBalance.textContent =totalEarn-totalSpend


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

function updateMonthlySpending() {
    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousDate = new Date(
        currentYear,
        currentMonth - 1,
        1
    );

    const previousMonth = previousDate.getMonth();
    const previousYear = previousDate.getFullYear();

    let currentTotal = 0;
    let previousTotal = 0;

    //for expense
    transactions.forEach(transaction => {
        // Count expenses only, not income
        if (transaction.type !== "expense") return;

        const amount = Number(transaction.amount);

        if (!Number.isFinite(amount) || amount < 0) return;

        // Your stored date format is YYYY-MM-DD
        const [year, month] = transaction.date
            .split("-")
            .map(Number);

        if (
            year === currentYear &&
            month === currentMonth + 1
        ) {
            currentTotal += amount;
        }

        if (
            year === previousYear &&
            month === previousMonth + 1
        ) {
            previousTotal += amount;
        }
    });

    const icon = document.getElementById("changeIcon");
    const percentageText = document.getElementById("changePercentage");
    const change = document.getElementById("spendingChange");

    change.classList.remove("increase", "decrease", "no-change");

    if (previousTotal === 0) {
        icon.setAttribute("data-lucide", "minus");
        percentageText.textContent = "No previous data";
        change.classList.add("no-change");
    } else {
        const difference = currentTotal - previousTotal;
        const percentage = (difference / previousTotal) * 100;

        if (difference > 0) {
            icon.setAttribute("data-lucide", "trending-up");
            percentageText.textContent = `+${percentage.toFixed(1)}%`;
            change.classList.add("increase");
        } else if (difference < 0) {
            icon.setAttribute("data-lucide", "trending-down");
            percentageText.textContent = `${percentage.toFixed(1)}%`;
            change.classList.add("decrease");
        } else {
            icon.setAttribute("data-lucide", "minus");
            percentageText.textContent = "0%";
            change.classList.add("no-change");
        }
    }

    lucide.createIcons();
}

updateMonthlySpending();
