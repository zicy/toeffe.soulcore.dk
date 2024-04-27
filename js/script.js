const csvDataFile = "toeffe_lager.csv?v=15"

// Preload the CSV file
document.addEventListener('DOMContentLoaded', function () {

    // Pre fetch data
    localStorage.removeItem('csvData');

    const xhr = new XMLHttpRequest();
    xhr.open('GET', csvDataFile, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            const csvData = xhr.responseText;
            localStorage.setItem('csvData', csvData); // Store CSV data in localStorage
        }
    };
    xhr.send();

    // Retrieve stored divs from localStorage
    var storedPins = localStorage.getItem('savedPins');
    var storedPinsList = localStorage.getItem('savedPinsList');
    var storedPinsIds = localStorage.getItem('savedPinsIds');

    // Get references to the divs in the document
    var savedPins = document.getElementById('map-pins-saved');
    var savedPinsList = document.getElementById('map-pins-saved-list');

    // Check if both the stored divs and the corresponding divs in the document exist
    if (storedPins && storedPinsList && savedPins && savedPinsList && storedPinsIds) {

        var storedPinsIds = JSON.parse(storedPinsIds);

        // Replace the content of the divs with the stored content
        savedPins.innerHTML = storedPins;
        savedPinsList.innerHTML = storedPinsList;

        // Loop through the array
        storedPinsIds.forEach(function (marker_id) {
            // Get the element with the current ID
            var element = document.getElementById(marker_id);

            // Check if the element exists
            if (element) {
                // Add event listener to the element
                element.addEventListener('click', function () {
                    removeSavedMarker(marker_id.split('_')[0]); // Clear marker when mouse leaves the result element
                });
            } else {
                console.error("Element with ID", marker_id, "not found.");
            }
        });
    } else {
        // Handle the case where either the stored divs or the corresponding divs in the document do not exist
        console.error("Could not find one or more of the required elements.");
    }

});

function searchCSV(inputValue) {

    const csvData = localStorage.getItem('csvData');
    // Rest of your code to process CSV data...
    // This part remains unchanged from your original code
    // You can use the csvData variable here to process the CSV data
    const rows = csvData.split('\n');
    let count = 0; // Counter for limiting results
    const searchResultsContainer = document.getElementById('search-results');
    searchResultsContainer.innerHTML = ''; // Clear previous results
    for (let i = 0; i < rows.length; i++) {
        const columns = rows[i].split(',');
        let random_id = 0;
        if (columns.length >= 2 && columns[1].toLowerCase().includes(inputValue.toLowerCase())) {
            const newDiv = document.createElement('div');
            random_id = Math.floor(Math.random() * 1000000)

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
            newDiv.addEventListener('click', function () {
                saveMarker(lunch_box_letter + lunch_box_number, random_id, item_name); // Clear marker when mouse leaves the result element
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

function saveMarker(lunch_box, marker_id, marker_name) {

    var storedPinsIds = localStorage.getItem('savedPinsIds');
    if (storedPinsIds) {
        var storedPinsIds = JSON.parse(storedPinsIds);
    } else {
        var storedPinsIds = [];
    }

    // Get the parent element of the target div
    var originalParent = document.getElementById(lunch_box);

    // Array of suffixes for the elements to clone
    var suffixes = ['_marker', '_pulse', '_text'];

    // Initialize variables
    var originalElems = [];
    var copiedElems = [];

    // Loop through each suffix to get original elements and clone them
    suffixes.forEach(function (suffix) {
        var originalElem = document.getElementById(marker_id + suffix);
        if (originalElem) {
            originalElems.push(originalElem);
            var clonedElem = originalElem.cloneNode(true);
            if (suffix === '_marker') {
                // Add class to the cloned element if the suffix is "_marker"
                clonedElem.classList.add('pin-saved');
            } else if (suffix === '_pulse') {
                clonedElem.classList.add('pulse-saved');
            }

            clonedElem.classList.add('pin-pointer');
            clonedElem.addEventListener('click', function () {
                removeSavedMarker(marker_id); // Clear marker when mouse leaves the result element
            });
            copiedElems.push(clonedElem);
        }
    });

    // Check if any original element exists
    if (originalElems.length > 0) {
        // Make a copy of the parent div
        var copiedParent = originalParent.cloneNode(false); // Shallow copy without children
        copiedParent.id = copiedParent.id + '_saved';

        // Append the copied child divs to the copied parent div
        copiedElems.forEach(function (copiedElem) {
            copiedParent.appendChild(copiedElem);
        });

        // Optionally, modify the copied parent div or its attributes
        // copiedParent.id = copiedParent.id + '-saved';

        // Append the copied parent div wherever you want in the DOM
        var savedPinContainer = document.getElementById('map-pins-saved');
        savedPinContainer.appendChild(copiedParent);

        // Create a new paragraph element
        var paragraph = document.createElement('p');
        paragraph.id = marker_id + '_saved-list';

        // Set the inner HTML of the paragraph
        paragraph.innerHTML = marker_name + '<span>×</span>';

        // Get the div with the ID "map-pins-saved-list"
        var savedListDiv = document.getElementById('map-pins-saved-list');

        // Check if the div exists
        if (savedListDiv) {
            // Append the paragraph to the div
            savedListDiv.appendChild(paragraph);
            paragraph.addEventListener('click', function () {
                removeSavedMarker(marker_id); // Clear marker when mouse leaves the result element
            });
        } else {
            console.error("The div with ID 'map-pins-saved-list' doesn't exist.");
        }
    } else {
        console.error("The original parent or the original div doesn't exist.");
    }

    suffixes.push('_saved-list');
    suffixes.forEach(function (suffix) {
        storedPinsIds.push(marker_id + suffix);
    });

    localStorage.setItem('savedPinsIds', JSON.stringify(storedPinsIds));

    updateSavedMarkerStorage();
}

function removeSavedMarker(marker_id) {

    // Array of suffixes for the elements to clone
    var suffixes = ['_marker', '_pulse', '_text', '_saved-list'];

    suffixes.forEach(function (suffix) {
        var originalElem = document.getElementById(marker_id + suffix);
        if (originalElem) {
            originalElem.remove();
        }
    });

    updateSavedMarkerStorage();
}

function updateSavedMarkerStorage() {

    var savedPins = document.getElementById('map-pins-saved');
    var savedPinsList = document.getElementById('map-pins-saved-list');
    var storedPinsIds = localStorage.getItem('savedPinsIds');

    if (storedPinsIds) {
        var storedPinsIds = JSON.parse(storedPinsIds);
    } else {
        var storedPinsIds = [];
    }

    if (savedPins && savedPinsList && storedPinsIds) {

        // Create a new array to store the IDs of divs that exist
        var pinsIds = [];

        // Loop through the array of IDs
        storedPinsIds.forEach(function(id) {
            // Get the element with the current ID
            var element = document.getElementById(id);
            
            // If the element exists, add the ID to the new array
            if (element) {
                pinsIds.push(id);
            }
        });

        localStorage.setItem('savedPins', savedPins.innerHTML); // Store CSV data in localStorage
        localStorage.setItem('savedPinsList', savedPinsList.innerHTML); // Store CSV data in localStorage
        localStorage.setItem('savedPinsIds', JSON.stringify(pinsIds));


    }
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

