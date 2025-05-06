document.addEventListener('DOMContentLoaded', () => {
  console.log('payments.js has loaded!');

  // Tab switching functionality (remains the same)
  const cashTabButton = document.getElementById('cash-tab');
  const creditTabButton = document.getElementById('credit-tab');
  const tabButtons = document.querySelectorAll('#salesTabs button');
  const tabPanes = document.querySelectorAll('#salesTabsContent .tab-pane');

  function showTab(tabId) {
      tabButtons.forEach(button => {
          button.classList.remove('active');
          button.setAttribute('aria-selected', 'false');
      });
      tabPanes.forEach(pane => {
          pane.classList.remove('show', 'active');
      });

      const activeButton = document.querySelector(`#salesTabs button[data-target="#${tabId}"]`);
      const activePane = document.getElementById(tabId);

      if (activeButton && activePane) {
          activeButton.classList.add('active');
          activeButton.setAttribute('aria-selected', 'true');
          activePane.classList.add('show', 'active');
      }
  }

  if (cashTabButton && creditTabButton) {
      cashTabButton.addEventListener('click', () => {
          showTab('cashSales');
      });

      creditTabButton.addEventListener('click', () => {
          showTab('creditSales');
      });
  }

  const activeTabButton = document.querySelector('#salesTabs button.active');
  if (activeTabButton) {
      showTab(activeTabButton.getAttribute('data-target').substring(1));
  }

  // Local price list (Ugandan Shillings per kg)
  const pricesPerKg = {
      beans: 4000,
      gnuts: 2500,
      soybeans: 3000,
      "cow-peas": 4000,
      maize: 2000,
      
  };

  // Function to get the cost per kilo from the local list
  function getCostPerKilo(produceName) {
      return pricesPerKg[produceName ? produceName.toLowerCase().trim() : ''] || 0; // Default to 0 if not found
  }

  // Function to auto-calculate the amount
  function calculateAmount(formId, tonnageFieldId, amountFieldId, productFieldId) {
      const tonnageInput = document.getElementById(tonnageFieldId);
      const amountInput = document.getElementById(amountFieldId);
      const productInput = document.getElementById(productFieldId);

      if (tonnageInput && amountInput && productInput) {
          tonnageInput.addEventListener('input', () => {
              const tonnage = parseFloat(tonnageInput.value) || 0;
              const produceName = productInput.value;
              const costPerKilo = getCostPerKilo(produceName);
              amountInput.value = (tonnage * costPerKilo).toFixed(2);
          });

          productInput.addEventListener('change', () => {
              const tonnage = parseFloat(tonnageInput.value) || 0;
              const produceName = productInput.value;
              const costPerKilo = getCostPerKilo(produceName);
              amountInput.value = (tonnage * costPerKilo).toFixed(2);
          });
      }
  }

  // Apply auto-calculation to cash and credit forms
  calculateAmount('cashSalesForm', 'cashTonnage', 'cashAmount', 'cashProduct');
  calculateAmount('creditSalesForm', 'creditTonnage', 'creditAmount', 'creditProduct');

  // Auto-populate the date and time (East African Time)
  const cashDateField = document.getElementById('cashDate');
  const creditDispatchDateField = document.getElementById('creditDispatchDate');

  function updateDateTime() {
      const now = new Date();
      const options = {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
          timeZone: 'Africa/Kampala',
          hour12: false
      };

      const dateFormatter = new Intl.DateTimeFormat('en-UG', {
          year: 'numeric', month: '2-digit', day: '2-digit'
      });
      const timeFormatter = new Intl.DateTimeFormat('en-UG', {
          hour: '2-digit', minute: '2-digit', hour12: false
      });

      const formattedDate = dateFormatter.format(now).split('/').reverse().join('-'); // yyyy-MM-dd
      const formattedTime = timeFormatter.format(now); // HH:mm

      const formattedDateTimeLocal = `${formattedDate}T${formattedTime}`;

      if (cashDateField) {
          cashDateField.value = formattedDateTimeLocal;
      }
      if (creditDispatchDateField) {
          creditDispatchDateField.value = formattedDate;
      }
  }

  updateDateTime();

  // Form submission logic
  const cashSalesFormElement = document.getElementById('cashSalesForm');
  if (cashSalesFormElement) {
      cashSalesFormElement.addEventListener('submit', function(event) {
    
      });
  }

  const creditSalesFormElement = document.getElementById('creditSalesForm');
  if (creditSalesFormElement) {
      creditSalesFormElement.addEventListener('submit', function(event) {
        
      });
  }
});