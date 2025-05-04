document.addEventListener('DOMContentLoaded', function() {
    // Store chart instance globally
    let salesChart = null;

    // Update Time
    const timeElement = document.getElementById('update-time');
    if (timeElement) {
        function updateTime() {
            const now = new Date();
            timeElement.textContent = `Welcome, Mr. Orban | Last Updated: ${now.toLocaleString()}`;
        }
        updateTime();
        setInterval(updateTime, 1000);
    }

    // Fetch Dashboard Statistics
    async function fetchDashboardStats() {
        try {
            const response = await fetch('/api/stats');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            const totalSalesElement = document.getElementById('total-sales');
            const totalProcurementElement = document.getElementById('total-procurement');
            const salesTrendElement = document.getElementById('sales-trend');
            
            if (totalSalesElement) totalSalesElement.textContent = data.totalSales.toLocaleString();
            if (totalProcurementElement) totalProcurementElement.textContent = data.totalProcurement.toLocaleString();
            if (salesTrendElement) salesTrendElement.textContent = data.salesTrend;
        } catch (error) {
            console.error('Dashboard stats error:', error);
        }
    }

    // Fetch and Initialize Chart
    async function initializeChart() {
        try {
            const chartElement = document.getElementById('salesChart');
            if (!chartElement) {
                console.warn('Sales chart canvas not found');
                return;
            }

            // Destroy existing chart if it exists
            if (salesChart) {
                salesChart.destroy();
            }

            const response = await fetch('/api/chart');
            if (!response.ok) throw new Error('Network response was not ok');
            const chartData = await response.json();

            const ctx = chartElement.getContext('2d');
            salesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Monthly Sales',
                        data: chartData.data,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.2)',
                        borderWidth: 2,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'UGX ' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Sales: UGX ' + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing chart:', error);
        }
    }

    // Initial load
    fetchDashboardStats();
    initializeChart();

    // Report Filtering
    const filterButtons = document.querySelectorAll('.filter-button');
    const customDateRange = document.getElementById('custom-date-range');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const applyDateFilterButton = document.getElementById('apply-date-filter');

    if (filterButtons && filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                if (filter === 'custom' && customDateRange) {
                    customDateRange.style.display = 'block';
                } else if (customDateRange) {
                    customDateRange.style.display = 'none';
                    fetchFilteredData(filter);
                }
            });
        });
    }

    async function fetchFilteredData(filter, customDates) {
        try {
            let url = `/api/stats?filter=${filter}`;
            if (customDates) {
                url += `&startDate=${customDates.startDate}&endDate=${customDates.endDate}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            const totalSalesElement = document.getElementById('total-sales');
            const totalProcurementElement = document.getElementById('total-procurement');
            const salesTrendElement = document.getElementById('sales-trend');
            
            if (totalSalesElement) totalSalesElement.textContent = data.totalSales.toLocaleString();
            if (totalProcurementElement) totalProcurementElement.textContent = data.totalProcurement.toLocaleString();
            if (salesTrendElement) salesTrendElement.textContent = data.salesTrend;

            // Refresh chart with new data
            initializeChart();
        } catch (error) {
            console.error('Error fetching filtered data:', error);
        }
    }

    if (applyDateFilterButton && startDateInput && endDateInput) {
        applyDateFilterButton.addEventListener('click', function() {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            if (startDate && endDate) {
                fetchFilteredData('custom', { startDate, endDate });
            }
        });
    }

    // PDF Generation Functions
    function generateSalesPDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Sales Report', 14, 20);
        
        // Add date
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        
        // Add summary
        doc.text(`Total Sales: UGX ${data.total.toLocaleString()}`, 14, 40);
        doc.text(`Total Transactions: ${data.count}`, 14, 50);
        
        // Save the PDF
        doc.save('sales-report.pdf');
    }

    function generateProcurementPDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Procurement Report', 14, 20);
        
        // Add date
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        
        // Add summary
        doc.text(`Total Procurement: UGX ${data.total.toLocaleString()}`, 14, 40);
        doc.text(`Total Items: ${data.count}`, 14, 50);
        
        // Save the PDF
        doc.save('procurement-report.pdf');
    }

    // Report Generation with PDF Export
    const generateSalesReportButton = document.querySelector('.generate-sales-report');
    const generateProcurementReportButton = document.querySelector('.generate-procurement-report');
    const salesReportDisplay = document.getElementById('sales-report-display');
    const procurementReportDisplay = document.getElementById('procurement-report-display');

    if (generateSalesReportButton) {
        generateSalesReportButton.addEventListener('click', async function() {
            try {
                const response = await fetch('/api/reports/sales');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                if (salesReportDisplay) {
                    salesReportDisplay.textContent = 
                        `Total Sales: ${data.total.toLocaleString()} | Transactions: ${data.count}`;
                }
                generateSalesPDF(data);
            } catch (error) {
                console.error('Error generating sales report:', error);
            }
        });
    }

    if (generateProcurementReportButton) {
        generateProcurementReportButton.addEventListener('click', async function() {
            try {
                const response = await fetch('/api/reports/procurement');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                if (procurementReportDisplay) {
                    procurementReportDisplay.textContent = 
                        `Total Procurement: ${data.total.toLocaleString()} | Items: ${data.count}`;
                }
                generateProcurementPDF(data);
            } catch (error) {
                console.error('Error generating procurement report:', error);
            }
        });
    }
});