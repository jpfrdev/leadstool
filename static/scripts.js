// JavaScript code for handling the form submission
document.getElementById("searchForm").addEventListener("submit", function (event) {
    let isFetchingData = false;
    event.preventDefault();
    const formData = new FormData(event.target);
    const searchValue = formData.get("searchLeads");

    if (isFetchingData) {
        return;
    }

    const inputBox = document.getElementById('searchLeads');
    const submitInputButton = document.getElementById('submitSearchLeads');
    inputBox.setAttribute('disabled', true);
    submitInputButton.setAttribute('disabled', true);

    // Make AJAX request using Fetch API
    isFetchingData = true;
    const loading = document.getElementById('loading')
    loading.style.visibility = 'visible'
    fetch(`/leadstool/tool?q=${searchValue}`)
        .then(response => response.json())
        .then(data => {
            // Build the table and populate the results
            const table = createTable(data);
            document.getElementById("resultsTable").innerHTML = "";
            createTotalResults(data['results'])
            createExportButton(data['results'])
            document.getElementById("resultsTable").appendChild(table);
            inputBox.removeAttribute('disabled');
            submitInputButton.removeAttribute('disabled');
            isFetchingData = false;
            loading.style.visibility = 'hidden'
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            inputBox.removeAttribute('disabled');
            submitInputButton.removeAttribute('disabled');
            isFetchingData = false;
            loading.style.visibility = 'hidden'
        });
});


function convertToCsv(data) {
    const csvRows = [];
    
    // Get the headers from the first object
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(',')); // Add headers to CSV rows
    
    // Loop through each object and create a row of CSV data
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            const escapedValue = typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            return escapedValue;
        });
        csvRows.push(values.join(','));
    }
    
    // Combine rows into a single CSV string
    return csvRows.join('\n');
}





// Helper function to create the table and populate the results
function createTable(data) {
    const results = data['results']
    const table = document.createElement("table");
    table.className = "table px-0 text-wrap";

    if (results.length === 0) {
        const noResultsRow = table.insertRow();
        const noResultsCell = noResultsRow.insertCell();
        noResultsCell.textContent = "No results found.";
        return table;
    }

    // Create the table header
    const tableHeader = document.createElement('thead');
    tableHeader.className ='table-dark'
    const tableHeaderRow = tableHeader.insertRow()
    table.appendChild(tableHeader)
    for (const key in results[0]) {
        const th = document.createElement("th");
        th.textContent = key.replace(key[0], key[0].toUpperCase());
        th.className = 'text-nowrap tbg-primary text-white'
        tableHeaderRow.appendChild(th);
    }

    // Populate the table rows with data
    const tableBody = document.createElement('tbody')
    table.appendChild(tableBody)
    for (const item of results) {
        const row = tableBody.insertRow();
        for (const key in item) {
            const cell = row.insertCell();
            cell.className = 'text-nowrap'
            cell.textContent = item[key];
        }
    }

    return table;
}


function createExportButton(results) {
    const btnContainer = document.getElementById("exportButtonContainer")
    let btn = document.getElementById("exportButton")
    if (btn !== null) {
        btnContainer.removeChild(btn)
    }
    if(results.length === 0){
        return
    }
    const button = document.createElement("button")
    button.className = "export-btn btn btn-outline-primary col-md-2"
    button.id = "exportButton"
    button.type = "button"
    button.textContent = "Export to CSV"
    document.getElementById("exportButtonContainer").appendChild(button)
    document.getElementById('exportButton').addEventListener("click", function(event) {
        const csv = convertToCsv(results)
        var hiddenElement = document.createElement('a');  
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);  
        hiddenElement.target = '_blank';      
        hiddenElement.download = 'leads.csv';  
        hiddenElement.click(); 
    })
}


function createTotalResults(totalResults) {
    const resultsContainer = document.getElementById("totalResultsContainer")
    let results = document.getElementById("totalResults")
    if (results !== null) {
        resultsContainer.removeChild(results)
    }
    if(totalResults.length === 0){
        return
    }
    results = document.createElement("span")
    results.className = "px-0 fs-3 text-center"
    results.id = "totalResults"
    results.textContent = "Total results: " + totalResults.length
    resultsContainer.appendChild(results)

}