// document.addEventListener('DOMContentLoaded', () => {
//     const produceSelect = document.getElementById('produceName');
//     const kilosInput = document.getElementById('tonnage');
//     const costInput = document.getElementById('cost');
//     const priceInput = document.getElementById('priceToSell');
//     const costPerKgDisplay = document.getElementById('costPerKgDisplay');
//     const dateInput = document.getElementById('dateTime');

//     const costPerKg = {
//         gnuts: 3500,
//         maize: 2500,
//         beans: 4000,
//         "cow-peas": 3200,
//         Soybeans: 4200,
//     };

//     if (dateInput) {
//         const now = new Date();
//         now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
//         dateInput.value = now.toISOString().slice(0,16);
//     }

    

//     if (produceSelect) {
//         produceSelect.addEventListener('change', () => {
//             updateCalculations();
//         });
//     }

//     if (kilosInput) {
//         kilosInput.addEventListener('input', () => {
//             updateCalculations();
//         });
//     }

//     function updateCalculations() {
//         const selectedProduce = produceSelect.value;
//         const kilos = parseFloat(kilosInput.value);

//         if (costPerKg[selectedProduce]) {
//             const costPerKilo = costPerKg[selectedProduce];

//             if (costPerKgDisplay) {
//                 costPerKgDisplay.textContent = `Cost per kg: UgX ${costPerKilo.toLocaleString()}`;
//             }

//             if (!isNaN(kilos) && kilos > 0) {
//                 const totalCost = Math.round(costPerKilo * kilos);
//                 const sellingPrice = Math.round(costPerKilo * 1.3);

//                 costInput.value = totalCost;
//                 priceInput.value = sellingPrice;
//             }
//         }
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
    const produceSelect = document.getElementById('produceName');
    const kilosInput = document.getElementById('tonnage');
    const costInput = document.getElementById('cost');
    const priceInput = document.getElementById('priceToSell');
    const costPerKgDisplay = document.getElementById('costPerKgDisplay');
    const dateInput = document.getElementById('dateTime');
    const form = document.getElementById('procurementForm');

    const costPerKg = {
        gnuts: 3500,
        maize: 2500,
        beans: 4000,
        "cow-peas": 3200,
        soybeans: 4200,
    };

    // Set current date and time
    if (dateInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dateInput.value = now.toISOString().slice(0,16);
    }

    // Update calculations when produce is selected
    if (produceSelect) {
        produceSelect.addEventListener('change', () => {
            updateCalculations();
        });
    }

    // Update calculations when kilos change
    if (kilosInput) {
        kilosInput.addEventListener('input', () => {
            updateCalculations();
        });
    }

    function updateCalculations() {
        const selectedProduce = produceSelect.value;
        const kilos = parseFloat(kilosInput.value);

        if (costPerKg[selectedProduce]) {
            const costPerKilo = costPerKg[selectedProduce];

            if (costPerKgDisplay) {
                costPerKgDisplay.textContent = `Cost per kg: UgX ${costPerKilo.toLocaleString()}`;
            }

            if (!isNaN(kilos) && kilos > 0) {
                const totalCost = Math.round(costPerKilo * kilos);
                const sellingPrice = Math.round(costPerKilo * 1.3); // 30% markup

                costInput.value = totalCost;
                priceInput.value = sellingPrice;
            }
        }
    }

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('/procurement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Procurement record added successfully!');
                form.reset();
                costPerKgDisplay.textContent = 'Cost per kg: -';
                
                // Reset date input to current time
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                dateInput.value = now.toISOString().slice(0,16);
            } else {
                const error = await response.text();
                alert('Error: ' + error);
            }
        } catch (error) {
            alert('Error submitting form: ' + error.message);
        }
    });
});