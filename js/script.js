// Function to search for input value in CSV
function searchCSV(inputValue) {
    const csvFile = 'toeffe_lager.csv'; // Path to your CSV file
    const xhr = new XMLHttpRequest();
    xhr.open('GET', csvFile, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            const csvData = xhr.responseText;
            const rows = csvData.split('\n');
            let result = '';
            let count = 0; // Counter for limiting results
            const searchResultsContainer = document.getElementById('search-results');
            searchResultsContainer.innerHTML = ''; // Clear previous results
            for (let i = 0; i < rows.length && count < 10; i++) {
                const columns = rows[i].split(',');
                if (columns.length >= 2 && columns[1].toLowerCase().includes(inputValue.toLowerCase())) {
                    const newDiv = document.createElement('div');
                    newDiv.innerHTML = `<span><img src="images/MissingTextureBlock.png" ></span><p>Name: ${columns[1]}, Location-1: ${columns[2]}, Location-2: ${columns[3]}, Location-3: ${columns[4]}</p>`;
                    newDiv.classList.add('result', 'pop-in'); // Add classes 'result' and 'pop-in' to each div
                    newDiv.style.animationDelay = `${count * 0.1}s`; // Adjust delay time as needed
                    searchResultsContainer.appendChild(newDiv); // Append new result div
                    // Add marker to map
                    addMarker(columns[1], columns[2], columns[3], columns[4]); // Pass latitude and longitude
                    count++; // Increment counter
                }
            }
            if (count === 0) {
                const newDiv = document.createElement('div');
                newDiv.textContent = 'Not found';
                searchResultsContainer.appendChild(newDiv); // Append "Not found" message if no results found
            }
        }
    };
    xhr.send();
}


function clearMarker() {
    const mapContainer = document.getElementById('map-pins');
    const mapPins = mapContainer.querySelectorAll('div'); // Select all div elements under map-pins
    mapPins.forEach(pin => {
        // Update innerHTML for each child div
        pin.innerHTML = ''; // You can set any content you want here
    });
    // mapContainer.innerHTML = '';
}

// L1 = lunchbox
// Tæller fra middergang 
// 32 items per række


// række
// 1 = top
// 2 = bottom
// 3 = top begved
// 4 = bund bagved

function addMarker(name, lunch_box, level, position) {
    const totalItems = 32;

    const mapContainer = document.getElementById(lunch_box);
    const marker = document.createElement('div');
    const markerPulse = document.createElement('div');
    const markerText = document.createElement('div');

    // Calculate position inside div
    let lunch_box_number = parseInt(lunch_box.match(/\d+/)[0]);
    if (lunch_box_number >=4) {
        percentage = ((totalItems - position + 1) / totalItems) * 100 + "%";
    } else {
        percentage = ((position / totalItems) * 100) + "%";
    }

    if (level <=2) {
        front = "0%"
    } else {
        front = "100%"
    }

    marker.className = 'pin';
    // Adjust marker position based on latitude and longitude
    marker.style.top = front; // You need to calculate this based on your image dimensions
    marker.style.left = percentage; // You need to calculate this based on your image dimensions
    
    markerPulse.className = 'pulse';
    // Adjust marker position based on latitude and longitude
    markerPulse.style.top = front; // You need to calculate this based on your image dimensions
    markerPulse.style.left = percentage; // You need to calculate this based on your image dimensions

    markerText.className = 'text';
    // Adjust marker position based on latitude and longitude
    markerText.innerHTML = name;
    markerText.style.top = front; // You need to calculate this based on your image dimensions
    markerText.style.left = percentage; // You need to calculate this based on your image dimensions
    mapContainer.appendChild(marker);
    mapContainer.appendChild(markerPulse);
    mapContainer.appendChild(markerText);
}

document.addEventListener('DOMContentLoaded', function () {
    const inputBox = document.getElementById('search-input-field');
    const inputBoxIcon = document.getElementById('search-input-icon');
    const searchResultsContainer = document.getElementById('search-results');

    // Event listener for input event
    inputBox.addEventListener('keyup', function (event) {
        const inputValue = event.target.value.trim(); // Trim whitespace
        clearMarker();
        if (inputValue === '') {
            searchResultsContainer.innerHTML = ''; // Clear search results if input is empty
            event.target.classList.remove('filled'); // Remove 'filled' class if input is empty
            inputBoxIcon.classList.remove('filled2'); // Remove 'filled' class if input is empty
        } else {
            searchCSV(inputValue); // Search CSV for input value
            event.target.classList.add('filled'); // Add 'filled' class if input has content
            inputBoxIcon.classList.add('filled2'); // Add 'filled' class if input has content
        }
    });
});