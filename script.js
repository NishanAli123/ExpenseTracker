const radioType = document.querySelectorAll('input[name="expenseOrIncome"]');
const dynamicFields = document.querySelector('.dynamicFields');
const today = new Date().toLocaleDateString("en-CA");


radioType.forEach(radio => {
    radio.addEventListener("change", (e) => {
        if (e.target.value === "expense") {
            dynamicFields.innerHTML = `
                <label>Description
                <input type="text" id="description"></input>
                </label>

                <label>Amount
                <input type="number" id="amount"></input>
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

            category.addEventListener("change",(e)=>{
                if(e.target.value ==="other"){
                      otherDescription.innerHTML =`
                    <label>Description
                       <input type="text" id="description"></input>
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

addBtn.addEventListener("click",(e)=>{

    e.preventDefault();
    const description = document.getElementById("description");
    const category = document.getElementById("category")
    const amount = document.getElementById("amount")
    const date = document.getElementById("date")
    const paymentmode = document.getElementById("paymentMode")
    const selectedType = document.querySelector('input[name="expenseOrIncome"]:checked');

   /* console.log(description?.value)
    console.log(category?.value)
    console.log(amount?.value)
    console.log(date?.value)
    console.log(paymentmode?.value)
    console.log(selectedType?.value)
    */

    const transaction ={
        type : selectedType.value,
        category : category?.value,
        description : description?.value,
        amount : Number(amount?.value),
        date : date?.value,
        paymentmode : paymentmode?.value
    }

    transactions.push(transaction)
    

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    )


    const expenses = transactions.filter(transaction=>transaction.type==="expense")
    const spending =transactions.filter(transaction=>transaction.type==="income");

    const totalSpend = expenses.reduce((sum,expense)=>sum+expense.amount,0)
    const totalEarn =spending.reduce ((sum,spend)=>sum+spend.amount,0)

    amountSpend.textContent = totalSpend
    amountEarn.textContent = totalEarn




    const transactionList = document.querySelector(".transaction-list");

    transactionList.innerHTML +=`
        <div class="transaction ${transaction.type}">
            <label>${transaction.type ==="expense" ? "-":"+"}&#8377 ${transaction.amount}</label>
            <label>${transaction.category?transaction.category:transaction.description}</label>
            <label>${transaction.date}</label>
        </div>
    
    `

    transactionList.scrollTop = transactionList.scrollHeight;

})


const transactionList = document.querySelector(".transaction-list");

transactions.forEach(transaction=>{
    transactionList.innerHTML +=`
        <div class="transaction ${transaction.type}">
            <label>${transaction.type ==="expense" ? "-":"+"}&#8377 ${transaction.amount}</label>
            <label>${transaction.category?transaction.category:transaction.description}</label>
            <label>${transaction.date}</label>
        </div>
    
    `
})



const expenses = transactions.filter(transaction=>transaction.type==="expense")
    const spending =transactions.filter(transaction=>transaction.type==="income");

    const totalSpend = expenses.reduce((sum,expense)=>sum+expense.amount,0)
    const totalEarn =spending.reduce ((sum,spend)=>sum+spend.amount,0)

    amountSpend.textContent = totalSpend
    amountEarn.textContent = totalEarn



