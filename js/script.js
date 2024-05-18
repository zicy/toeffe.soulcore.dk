const csvDataFile = "toeffe_lager.csv"



function searchCSV(inputValue) {
    const csvData = localStorage.getItem('csvData');
    if (!csvData) {
        console.error('CSV data not found in localStorage.');
        return;
    }

    const rows = csvData.split('\n');
    const searchResultsContainer = document.getElementById('search-results');
    searchResultsContainer.innerHTML = '';

    let count = 0;

    for (let i = 0; i < rows.length; i++) {
        const columns = rows[i].split(',');
        if (columns.length >= 2 && columns[1].toLowerCase().includes(inputValue.toLowerCase())) {
            const random_id = Math.floor(Math.random() * 1000000);
            const resultDiv = createResultDiv(columns, random_id, count);
            searchResultsContainer.appendChild(resultDiv);
            count++;
        }
    }

    if (count === 0) {
        const resultDiv = createNotFoundDiv(inputValue);
        searchResultsContainer.appendChild(resultDiv);
    }
}

function createResultDiv(columns, random_id, count) {
    const [row_id, item_name, lunch_box, lunch_box_row, lunch_box_position, image_name] = columns;
    const lunch_box_letter = lunch_box.match(/[^\d]+/)[0];
    const lunch_box_number = parseInt(lunch_box.match(/\d+/)[0]);
    const formatted_name = image_name.length <= 1 ? item_name.toLowerCase().replace(/ /g, '_') : image_name;

    const newDiv = document.createElement('div');
    newDiv.innerHTML = `
        <img class="color-${lunch_box_letter}" src="images/block_icons/${formatted_name}.png" alt="${item_name}" >
        <div class="result-name">${item_name}</div>
        <div class="result-extra-info">
            <div>Lunchbox <span class="">${lunch_box}</span></div>
            <div>Row <span class="">${lunch_box_row}</span></div>
            <div>Position <span class="">${lunch_box_position}</span></div>
        </div>
    `;
    newDiv.classList.add('result', 'pop-in');
    newDiv.style.animationDelay = `${count * 0.1}s`;

    // Add event listeners
    newDiv.addEventListener('mouseenter', () => hideOtherMarkers(random_id));
    newDiv.addEventListener('mouseleave', showOtherMarkers);
    newDiv.addEventListener('click', () => saveMarker(`${lunch_box_letter}${lunch_box_number}`, random_id, item_name));

    // Add map marker
    addMarker(item_name, lunch_box_letter, lunch_box_number, lunch_box_row, lunch_box_position, random_id); // Pass latitude and longitude

    return newDiv;
}

function createNotFoundDiv(inputValue) {
    const newDiv = document.createElement('div');
    newDiv.innerHTML = `
        <img class="" src="images/MissingTextureBlock.png" >
        <div class="result-name">Not found: ${inputValue}</div>
        <div class="result-extra-info">
            <div>Lunchbox <span class="">n/a</span></div>
            <div>Row <span class="">n/a</span></div>
            <div>Position <span class="">n/a</span></div>
        </div>
    `;
    newDiv.classList.add('result', 'pop-in');
    newDiv.style.animationDelay = '0s'; // No delay for not found items

    return newDiv;
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
    var storedPinsIds = JSON.parse(localStorage.getItem('savedPinsIds')) || [];

    var originalParent = document.getElementById(lunch_box);
    if (!originalParent) {
        console.error("The original parent with ID '" + lunch_box + "' doesn't exist.");
        return;
    }

    var suffixes = ['_marker', '_pulse', '_text'];
    var originalElems = [];
    var copiedElems = [];

    suffixes.forEach(function (suffix) {
        var originalElem = document.getElementById(marker_id + suffix);
        if (originalElem) {
            originalElems.push(originalElem);
            var clonedElem = originalElem.cloneNode(true);
            if (suffix === '_marker') {
                clonedElem.classList.add('pin-saved');
            } else if (suffix === '_pulse') {
                clonedElem.classList.add('pulse-saved');
            }
            clonedElem.classList.add('pin-pointer');
            clonedElem.addEventListener('click', function () {
                removeSavedMarker(marker_id);
            });
            copiedElems.push(clonedElem);
        }
    });

    if (originalElems.length > 0) {
        var copiedParent = originalParent.cloneNode(false);
        copiedParent.id = copiedParent.id + '_saved';

        copiedElems.forEach(function (copiedElem) {
            copiedParent.appendChild(copiedElem);
        });

        var savedPinContainer = document.getElementById('map-pins-saved');
        if (savedPinContainer) {
            savedPinContainer.appendChild(copiedParent);
        } else {
            console.error("The div with ID 'map-pins-saved' doesn't exist.");
            return;
        }

        var paragraph = document.createElement('p');
        paragraph.id = marker_id + '_saved-list';
        paragraph.innerHTML = marker_name + '<span>×</span>';

        var savedListDiv = document.getElementById('map-pins-saved-list');
        if (savedListDiv) {
            savedListDiv.appendChild(paragraph);
            paragraph.addEventListener('click', function () {
                removeSavedMarker(marker_id);
            });
        } else {
            console.error("The div with ID 'map-pins-saved-list' doesn't exist.");
            return;
        }
    } else {
        console.error("The original parent or the original div doesn't exist.");
        return;
    }

    suffixes.push('_saved-list');
    suffixes.forEach(function (suffix) {
        storedPinsIds.push(marker_id + suffix);
    });

    localStorage.setItem('savedPinsIds', JSON.stringify(storedPinsIds));

    updateSavedMarkerStorage();
}

function removeSavedMarker(marker_id) {
    var suffixes = ['_marker', '_pulse', '_text', '_saved-list'];

    suffixes.forEach(function (suffix) {
        var element = document.getElementById(marker_id + suffix);
        if (element) {
            element.remove();
        }
    });

    updateSavedMarkerStorage();
}

function updateSavedMarkerStorage() {
    var savedPins = document.getElementById('map-pins-saved');
    var savedPinsList = document.getElementById('map-pins-saved-list');
    var storedPinsIds = JSON.parse(localStorage.getItem('savedPinsIds')) || [];

    if (savedPins && savedPinsList && storedPinsIds.length > 0) {
        var pinsIds = storedPinsIds.filter(function (id) {
            return document.getElementById(id);
        });

        localStorage.setItem('savedPins', savedPins.innerHTML);
        localStorage.setItem('savedPinsList', savedPinsList.innerHTML);
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





// Preload the CSV file
document.addEventListener('DOMContentLoaded', async function () {
    // Check for localStorage support
    if (!localStorage) {
        console.error('LocalStorage is not supported in this browser.');
        return;
    }


    // Pre-fetch data
    localStorage.removeItem('csvData');
    try {
        const response = await fetch(csvDataFile);
        if (!response.ok) {
            throw new Error('Failed to fetch CSV data');
        }
        const csvData = await response.text();
        localStorage.setItem('csvData', csvData);
    } catch (error) {
        console.error('Error fetching CSV data:', error);
    }

    // Restore saved pins

    // Retrieve stored divs from localStorage
    const storedPins = localStorage.getItem('savedPins');
    const storedPinsList = localStorage.getItem('savedPinsList');
    const storedPinsIds = localStorage.getItem('savedPinsIds');

    // Get references to the divs in the document
    const savedPins = document.getElementById('map-pins-saved');
    const savedPinsList = document.getElementById('map-pins-saved-list');

    // Check if both the stored divs and the corresponding divs in the document exist
    if (storedPins && storedPinsList && savedPins && savedPinsList && storedPinsIds) {
        try {
            const storedPinsIdsArray = JSON.parse(storedPinsIds);

            savedPins.innerHTML = storedPins;
            savedPinsList.innerHTML = storedPinsList;

            storedPinsIdsArray.forEach(markerId => {
                const element = document.getElementById(markerId);
                if (element) {
                    element.addEventListener('click', () => {
                        removeSavedMarker(markerId.split('_')[0]);
                    });
                } else {
                    console.error('Element with ID', markerId, 'not found.');
                }
            });
        } catch (error) {
            console.error('Error parsing storedPinsIds:', error);
        }
    } else {
        console.error('Could not find one or more of the required elements.');
    }

    // Setup search box
    const inputBox = document.getElementById('search-input-field');
    const inputBoxIcon = document.getElementById('search-input-icon');
    const searchResultsContainer = document.getElementById('search-results');

    // Event listener for input event
    inputBox.addEventListener('keyup', function (event) {
        const inputValue = event.target.value.trim(); // Trim whitespace
        clearMarker();
        if (inputValue === '' || inputValue.length < 3) {
            searchResultsContainer.innerHTML = ''; // Clear search results if input is empty
            searchResultsContainer.classList.add('overflow-hidden');
            event.target.classList.remove('filled'); // Remove 'filled' class if input is empty
            inputBoxIcon.classList.remove('filled2'); // Remove 'filled' class if input is empty

        } else {
            searchCSV(inputValue); // Search CSV for input value
            searchResultsContainer.classList.remove('overflow-hidden');
            event.target.classList.add('filled'); // Add 'filled' class if input has content
            inputBoxIcon.classList.add('filled2'); // Add 'filled' class if input has content
        }
    });


    // Site background
    images_path = "/images/background/"
    var img_array = [
        "url('" + images_path + "mine_1.png')",
        "url('" + images_path + "nether_1.png')",
        "url('" + images_path + "nether_2.png')",
        "url('" + images_path + "the_end_1.png')",
        "url('" + images_path + "ancient_city_1.png')",
    ];

    var random = Math.floor(Math.random() * img_array.length) + 0;
    document.getElementById("background").style.backgroundImage = img_array[random];


    // Map background
    images_path = "/images/maps/"
    var img_array = [
        // { image: images_path + "test.png", seconds_image: 1, image2: images_path + "pedro.gif" },
        { image: images_path + "Astro.png", seconds_image: 0, image2: "" },
        { image: images_path + "Astro1.png", seconds_image: 0, image2: "" },
        { image: images_path + "Astro2.png", seconds_image: 0, image2: "" },
        { image: images_path + "Jimmi.png", seconds_image: 0, image2: "" },
        { image: images_path + "Jimmi1.png", seconds_image: 0, image2: "" },
        { image: images_path + "Kim.png", seconds_image: 0, image2: "" },
        { image: images_path + "Mallar.png", seconds_image: 0, image2: "" },
        { image: images_path + "Mallar1.png", seconds_image: 0, image2: "" },
        { image: images_path + "pitti.png", seconds_image: 0, image2: "" },
        { image: images_path + "pitti1.png", seconds_image: 0, image2: "" },
        { image: images_path + "Toeffe.png", seconds_image: 0, image2: "" },
        { image: images_path + "Toeffe1.png", seconds_image: 0, image2: "" },
        { image: images_path + "Toeffe2.png", seconds_image: 1, image2: images_path + "Pedro.gif" },
        { image: images_path + "map_v5.png", seconds_image: 0, image2: images_path + "Pedro.gif" },
        { image: images_path + "map_v5.png", seconds_image: 1, image2: images_path + "Pedro.gif" },
    ];

    var random = Math.floor(Math.random() * img_array.length) + 0;
    document.getElementById("map").src = img_array[random].image;

    if (img_array[random].seconds_image) {
        let mapElement = document.getElementById("map-container");
        let referenceNode = document.getElementById("map-pins-saved-list");

        divElement = document.createElement("div");
        divElement.style = "height: 100%; width: 100%; position: absolute; display: flex;";

        divElement2 = document.createElement("div");
        divElement2.style = "margin: auto;";

        imgElement = document.createElement("img");
        imgElement.src = img_array[random].image2; // Optional: Set alt text for accessibility
        imgElement.style = "height: 17vh; /* width: 20vh; */";

        divElement.appendChild(divElement2);
        divElement2.appendChild(imgElement);
        mapElement.insertBefore(divElement, referenceNode);
    }

    // Darkness reader
    var darknessValue = parseFloat(localStorage.getItem('darkness')) * 100 || 0;
    var darknessInput = document.getElementById('darkness');
    const darkness_setting = document.getElementById('darkness-setting');
    var moon_phase = "2";

    function updateDarkness(value) {
        document.body.style.backgroundColor = 'rgba(0, 0, 0, ' + value / 100 + ')';

        darkness_setting.innerHTML = getMoonPhase(value)[0];
        darkness_setting.style = getMoonPhase(value)[1];
        localStorage.setItem('darkness', value / 100);
    }

    function getMoonPhase(value) {
        let moon_phase = [];
        if (value >= 0 && value <= 20) {
            moon_phase[0] = "🌕";
            moon_phase[1] = "transform: scale(1, 1);"
        } else if (value >= 21 && value <= 40) {
            moon_phase[0] = "🌖";
            moon_phase[1] = "transform: scale(1, 1);"
        } else if (value >= 41 && value <= 60) {
            moon_phase[0] = "🌗";
            moon_phase[1] = "transform: scale(1, 1);"
        } else if (value >= 61 && value <= 80) {
            moon_phase[0] = "🌒";
            moon_phase[1] = "transform: scale(-1, 1);"
        } else if (value >= 81 && value <= 100) {
            moon_phase[0] = "🌑";
            moon_phase[1] = "transform: scale(1, 1);"
        } else {
            moon_phase = "Invalid value";
        }


        return moon_phase;
    }

    // Initialize darkness value
    darknessInput.value = darknessValue;
    updateDarkness(darknessValue);

    // Add an event listener to detect changes in the input value
    darknessInput.addEventListener('input', function () {
        updateDarkness(darknessInput.value);
    });

    /* Player heads on map */
    var player_map = document.getElementById("map-heads");

    // Top-left and bottom-right coordinates of the map
    const map_top_x = { left: 15906, right: 15575 };
    const map_top_z = { top: 1350, bottom: 1679 };

    // Function to fetch data and update map
    function fetchDataAndUpdateMap() {
        fetch('https://map.slimblokken.dk/tiles/players.json')
            .then(response => response.json())
            .then(data => {
                // Filter players in the overworld
                // const playersInOverworld = data.players.filter(player => player.world === 'minecraft_overworld' && (player.name === 'astroperne' || player.name === 'Toeffe'));
                const playersInOverworld = data.players.filter(player => player.world === 'minecraft_overworld');

                // Add markers to the map for players in the overworld
                playersInOverworld.forEach(player => {
                    const player_cords = { x: Math.abs(player.x), z: player.z };
                    const percentage_x = calculatePercentage(player_cords.x, map_top_x.left, map_top_x.right);
                    const percentage_y = calculatePercentage(player_cords.z, map_top_z.top, map_top_z.bottom);
                    const position = { x: percentage_x, y: percentage_y };
                    const markerElement = createMarkerElement(position, player, player_map);

                });
            })
            .catch(error => console.error('Error fetching the markers:', error));
    }

    // Call fetchDataAndUpdateMap initially
    fetchDataAndUpdateMap();

    // Call fetchDataAndUpdateMap every 2 seconds
    setInterval(fetchDataAndUpdateMap, 1000);

    function calculatePercentage(input, lowerBound, upperBound) {
        const range = upperBound - lowerBound;
        const distanceFromLowerBound = input - lowerBound;
        const percentage = (distanceFromLowerBound / range) * 100;

        return percentage;
    }

    // Function to create marker element
    function createMarkerElement(position, player, map) {
        let markerElement = document.getElementById(player.uuid);

        // Check if element already exists
        if (!markerElement) {
            // If element doesn't exist, create a new one
            markerElement = document.createElement("div");
            markerElement.id = player.uuid;
            markerElement.className = "player_head";

            // Create an img element
            const imgElement = document.createElement("img");
            imgElement.alt = player.display_name; // Optional: Set alt text for accessibility
            markerElement.appendChild(imgElement);

            // Append the markerElement to some container in your HTML
            document.body.appendChild(markerElement);
            map.appendChild(markerElement);
        }

        // Update position
        markerElement.style.left = position.x + "%";
        markerElement.style.top = position.y + "%";
        // Update image source
        markerElement.querySelector('img').src = "https://mc-heads.net/avatar/" + player.uuid + "/16";


        return markerElement;
    }
});