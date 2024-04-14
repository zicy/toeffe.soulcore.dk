function searchCSV(inputValue) {
    const csvFile = 'toeffe_lager.csv?v=5'; // Path to your CSV file
    const xhr = new XMLHttpRequest();
    xhr.open('GET', csvFile, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            const csvData = xhr.responseText;
            const rows = csvData.split('\n');
            let random_id = 0;
            let result = '';
            let count = 0; // Counter for limiting results
            const searchResultsContainer = document.getElementById('search-results');
            searchResultsContainer.innerHTML = ''; // Clear previous results
            for (let i = 0; i < rows.length; i++) {
                const columns = rows[i].split(',');
                if (columns.length >= 2 && columns[1].toLowerCase().includes(inputValue.toLowerCase())) {
                    const newDiv = document.createElement('div');
                    let random_id = Math.floor(Math.random() * 1000000)

                    const item_name = columns[1];
                    const lunch_box = columns[2];
                    const lunch_box_row = columns[3];
                    const lunch_box_position = columns[4];
                    const image_name = columns[5];

                    // Get lunch box information
                    const lunch_box_letter = columns[2].match(/[^\d]+/)[0];
                    const lunch_box_number = parseInt(columns[2].match(/\d+/)[0]);

                    var formatted_name = "";
                    if (image_name.length <= 1) {
                        formatted_name = item_name.toLowerCase().replace(/ /g, '_');
                    } else {
                        formatted_name = image_name;
                    }

                    newDiv.innerHTML = `<img class="color-${lunch_box_letter}" src="images/block_icons/${formatted_name}.png" onerror="this.onerror=null; this.src='images/MissingTextureBlock.png'" ><div class="result-name">${item_name} </div><div class="result-extra-info"><div>Lunchbox <span class="">${lunch_box}</span></div> <div>Row <span class="">${lunch_box_row}</span></div> <div>Position <span class="">${lunch_box_position}</span></div></div>`;
                    newDiv.classList.add('result', 'pop-in'); // Add classes 'result' and 'pop-in' to each div
                    newDiv.style.animationDelay = `${count * 0.1}s`; // Adjust delay time as needed
                    searchResultsContainer.appendChild(newDiv); // Append new result div
                    // Add marker to map
                    addMarker(item_name, lunch_box_letter, lunch_box_number, lunch_box_row, lunch_box_position, random_id); // Pass latitude and longitude

                    // Add event listeners to the dynamically created div
                    newDiv.addEventListener('mouseenter', function () {
                        hideOtherMarkers(random_id); // Call function to hide other markers
                    });
                    newDiv.addEventListener('mouseleave', function () {
                        showOtherMarkers(); // Clear marker when mouse leaves the result element
                    });

                    count++; // Increment counter
                }
            }
            if (count === 0) {
                const newDiv = document.createElement('div');

                newDiv.innerHTML = `<img class="" src="images/MissingTextureBlock.png" ><div class="result-name">Not found: ${inputValue} </div><div class="result-extra-info"><div>Lunchbox <span class="">n/a</span></div> <div>Row <span class="">n/a</span></div> <div>Position <span class="">n/a</span></div></div>`;
                newDiv.classList.add('result', 'pop-in'); // Add classes 'result' and 'pop-in' to each div
                newDiv.style.animationDelay = `${count * 0.1}s`; // Adjust delay time as needed
                searchResultsContainer.appendChild(newDiv); // Append new result div
            }
        }
    };
    xhr.send();
}

function hideOtherMarkers(random_id) {
    const mapContainer = document.getElementById('map-pins');
    const mapPins = mapContainer.querySelectorAll('.mapmarker');
    mapPins.forEach(pin => {
        if (!pin.id.includes(random_id)) {
            pin.style.display = 'none'; // Hide pin
        }
    });
}


function showOtherMarkers() {
    const mapContainer = document.getElementById('map-pins');
    const mapPins = mapContainer.querySelectorAll('.mapmarker');
    mapPins.forEach(pin => {
        pin.style.display = 'unset'; // Hide pin
    });
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

function addMarker(name, lunch_box_letter, lunch_box_number, level, position, random_id) {
    const totalItems = 32;

    const mapContainer = document.getElementById(lunch_box_letter + lunch_box_number);
    const marker = document.createElement('div');
    const markerPulse = document.createElement('div');
    const markerText = document.createElement('div');

    // Generate unique identifiers
    const markerId = random_id + "_marker";
    const markerPulseId = random_id + "_pulse";
    const markerTextId = random_id + "_text";

    // Set unique identifiers
    marker.id = markerId;
    markerPulse.id = markerPulseId;
    markerText.id = markerTextId;

    // Calculate position inside div
    if (lunch_box_number >= 4) {
        percentage = ((totalItems - position + 1) / totalItems) * 100 + "%";
    } else {
        percentage = ((position / totalItems) * 100) + "%";
    }

    if (level <= 2) {
        front = "0%"
    } else {
        front = "100%"
    }

    // calculate anti spin class
    let anti_spin_class = "";

    switch (lunch_box_letter) {
        case 'I':
            anti_spin_class = "";
            break;
        case 'G':
            anti_spin_class = "lunch-box-G-AntiRotate lunch-box-G-text";
            break;
        case 'B':
            anti_spin_class = "lunch-box-B-AntiRotate lunch-box-B-text";
            break;
        case 'L':
            anti_spin_class = "lunch-box-L-AntiRotate lunch-box-L-text";
            break;
        default:
            console.log('Unknown fruit.');
            anti_spin_class = "";
    }

    marker.className = 'mapmarker pin';
    // Adjust marker position based on latitude and longitude
    marker.style.top = front; // You need to calculate this based on your image dimensions
    marker.style.left = percentage; // You need to calculate this based on your image dimensions

    markerPulse.className = 'mapmarker pulse';
    // Adjust marker position based on latitude and longitude
    markerPulse.style.top = front; // You need to calculate this based on your image dimensions
    markerPulse.style.left = percentage; // You need to calculate this based on your image dimensions

    markerText.className = 'mapmarker text ' + anti_spin_class;
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
        if (inputValue === '' || inputValue.length < 3) {
            searchResultsContainer.innerHTML = ''; // Clear search results if input is empty
            searchResultsContainer.classList.remove('results');
            event.target.classList.remove('filled'); // Remove 'filled' class if input is empty
            inputBoxIcon.classList.remove('filled2'); // Remove 'filled' class if input is empty

        } else {
            searchCSV(inputValue); // Search CSV for input value
            searchResultsContainer.classList.add('results');
            event.target.classList.add('filled'); // Add 'filled' class if input has content
            inputBoxIcon.classList.add('filled2'); // Add 'filled' class if input has content
        }
    });
});

function clear_input(event2) {
    const inputBox = document.getElementById('search-input-field');
    var event = new KeyboardEvent('keyup', {
        key: 'Backspace',           // Specify the key you want to simulate
        code: 'Backspace',       // Specify the code of the key (optional)
        keyCode: 83,        // Specify the key code (optional)
        which: 83,          // Specify the key code (optional)
        bubbles: true       // Allow the event to bubble up (optional)
    });
    inputBox.value = '';
    inputBox.dispatchEvent(event);
}

