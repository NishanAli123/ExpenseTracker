const radioType = document.querySelectorAll('input[name="expenseOrIncome"]');
const dynamicFields = document.querySelector('.dynamicFields');
const today = new Date().toLocaleDateString("en-CA");


radioType.forEach(radio => {
    radio.addEventListener("change", (e) => {
        if (e.target.value === "expense") {
            dynamicFields.innerHTML = `
                <label>Description
                <input type="text"></input>
                </label>

                <label>Amount
                <input type="number"></input>
                </label>

                <label>Date
                <input type="date" value="${today}"></input>
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
                <input type="number"></input>
                </label>

                <label>Date
                <input type="date" value="${today}"></input>
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
                       <input type="text"></input>
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


