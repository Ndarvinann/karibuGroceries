// Simple script to highlight low stock items
document.addEventListener("DOMContentLoaded", function () {
    //find all input feilds with adjust as a class
    const stockInputs = document.querySelectorAll(".adjust-input");
    //loop through each input feild found.
    stockInputs.forEach((input) => {
      //event listener that triggers when the value changes
      input.addEventListener("change", function () {
        //find the closest tr containing this input
        const row = this.closest("tr");
        //convert this value into an integer
        const value = parseInt(this.value);
        //find the badge within this row
        const badge = row.querySelector(".badge-stock");
  
        // Remove all stock classes
        //remove all the color coding and reset the appearance.
        row.classList.remove("stock-high", "stock-medium", "stock-low");
        badge.classList.remove("badge-high", "badge-medium", "badge-low");
  
        // Add appropriate class based on value
        if (value <= 30) {
          //for values less than or equal to 70kg
          row.classList.add("stock-low"); // mark this as low stock
          badge.classList.add("badge-low");
          //log
          badge.textContent = value + " kg (Low)"; //log the input value and kg(low)
        } //repeat as above but for medium and high
        else if (value <= 200) {
          row.classList.add("stock-medium");
          badge.classList.add("badge-medium");
          badge.textContent = value + " kg(Medium)";
        } else {
          //notice that 201 is high?
          row.classList.add("stock-high");
          badge.classList.add("badge-high");
          badge.textContent = value + " kg(High)";
        }
      });
    });
  
    // Event listener for the "Apply Bulk Adjustments" button
    const applyBulkAdjustmentButton = document.getElementById("applyBulkAdjustment");
    if (applyBulkAdjustmentButton) {
      applyBulkAdjustmentButton.addEventListener("click", function () {
        try {
          const productToAdjustSelect = document.getElementById("bulkAdjustProduct");
          const adjustmentQuantityInput = document.getElementById("bulkAdjustQuantity");
          const adjustmentReasonSelect = document.getElementById("bulkAdjustReason");
  
          // Validate elements exist
          if (!productToAdjustSelect) throw new Error("Product dropdown not found");
          if (!adjustmentQuantityInput) throw new Error("Quantity input not found");
          if (!adjustmentReasonSelect) throw new Error("Reason dropdown not found");
          
          //define Values
          const product = productToAdjustSelect.value;
          const quantity = parseFloat(adjustmentQuantityInput.value);
          const reason = adjustmentReasonSelect.value;
          
          //Validate these values
          if (!product) throw new Error("Please select a product");
          if (isNaN(quantity)) throw new Error("Please enter a valid quantity");
          if (!reason) throw new Error("Please select a reason");
  
          //if a product and quantity is a number,
          const bulkAdjustmentData = {
            produce: product.toLowerCase(), // Ensure consistency with your schema
            kilos: quantity,
            reason: reason,
            adjustedBy: "Manager", //to work on this to make sure its whoever is logged in to make these changes.
          };
          
          fetch("/api/bulkAdjust", {
            // Define your backend API endpoint
            method: "POST",
            headers: {
              "Content-Type": "application/json", //tell the server i am sending a json file.
            },
            body: JSON.stringify(bulkAdjustmentData), //convert the js object coming through to Json string.
          })
            .then((response) => {
                if (!response.ok) {
                    // Get the actual error message from the response
                    return response.json().then(err => {
                      throw new Error(err.message || "Adjustment failed");
                    });
                  }
                  return response.json();
                })

            .then((data) => {
              if (!data.success) throw new Error(data.message || "Adjustment failed");
              alert("Bulk adjustment applied successfully!");
              location.reload(); // Refresh to show changes
            })
            .catch(error => {
              console.error("Error:", error);
              alert("Error: " + error.message);
            });
  
        } catch (error) {
          console.error("Bulk adjustment error:", error);
          alert(error.message);
        }
      });
    }
  
    // Individual Save Buttons
    document.addEventListener("click", function(e) {
      if (e.target.classList.contains("btn-outline-success") && 
          e.target.textContent.trim() === "Save") {
        
        const button = e.target;
        const row = button.closest("tr");
        
        try {
          // Get elements
          const product = row.querySelector("td strong").textContent.trim();
          const newStockInput = row.querySelector(".adjust-input");
          const currentStock = parseFloat(newStockInput.dataset.currentValue || newStockInput.value);
          const newStock = parseFloat(newStockInput.value);
          const adjustmentReasonSelect = document.getElementById("bulkAdjustReason");
          
          // Validate
          if (!adjustmentReasonSelect) throw new Error("Reason dropdown not found");
          const adjustmentReason = adjustmentReasonSelect.value;
          
          if (isNaN(newStock)) throw new Error("Please enter a valid number");
          if (newStock < 0) throw new Error("Stock cannot be negative");
          if (newStock === currentStock) throw new Error("Please change the stock value before saving");
          if (!adjustmentReason) throw new Error("Please select an adjustment reason");
  
          // Prepare data
          const adjustmentData = {
            product: product.toLowerCase(),
            oldStock: currentStock,
            newStock: newStock,
            reason: adjustmentReason,
            adjustedBy: "Manager"
          };
  
          // Send to server
          fetch('/api/adjustStock', {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
             },
            body: JSON.stringify(adjustmentData)
          })
          .then(response => response.json())
          .then(data => {
            if (!data.success) throw new Error(data.message || "Adjustment failed");
            
            // Update UI
            button.textContent = "Saved!";
            button.classList.replace("btn-outline-success", "btn-success");
            newStockInput.dataset.currentValue = newStock;
            
            // Update badge
            const badge = row.querySelector(".badge-stock");
            badge.textContent = `${newStock} kg`;
            
            // Update styling
            updateStockLevelStyling(row, newStock);
            
            setTimeout(() => {
              button.textContent = "Save";
              button.classList.replace("btn-success", "btn-outline-success");
            }, 2000);
          })
          .catch(error => {
            throw error;
          });
  
        } catch (error) {
          console.error("Save error:", error);
          alert("Error: " + error.message);
          if (row.querySelector(".adjust-input")) {
            row.querySelector(".adjust-input").value = currentStock;
          }
        }
      }
    });
  
    // Initialize current values
    document.querySelectorAll(".adjust-input").forEach(input => {
      input.dataset.currentValue = input.value;
    });
  
    // Helper function
    function updateStockLevelStyling(row, value) {
      const badge = row.querySelector(".badge-stock");
      row.classList.remove("stock-high", "stock-medium", "stock-low");
      badge.classList.remove("badge-high", "badge-medium", "badge-low");
  
      if (value <= 30) {
        row.classList.add("stock-low");
        badge.classList.add("badge-low");
      } else if (value <= 200) {
        row.classList.add("stock-medium");
        badge.classList.add("badge-medium");
      } else {
        row.classList.add("stock-high");
        badge.classList.add("badge-high");
      }
    }
  });