const hamburger_icon = document.querySelector('#menu-icon');
const nav_menu = document.querySelector('.mobile-navbar');
const parentDiv = document.querySelector('.div-container');
const enterLocationDiv = document.querySelector('.blank-1');
const  entryAddressInput = document.querySelector('#entry-address'); //change to search
const entryAddressPlaceholder = document.querySelector('#placeholder-text') //change to input
const entryAddressForm = document.querySelector('.entry-form')
const InputAddressError = document.querySelector('.search-error')

function showNavMenu() {
    if (nav_menu.style.display === 'none') {
        nav_menu.style.display = 'block';
    } else {
        nav_menu.style.display = 'none';
    }

}

function detectGeolocation(e) {

    e.preventDefault();

    let request = {
        query: e.target.value,
        fields: ['formatted_address']
    };

    let service = new google.maps.places.PlacesService(map);

    console.log(e.target.value);
    if (e.target.value.length > 4) {
        // Make the placeholder visible
        entryAddressPlaceholder.style.color = 'black';

        //Request if address is valid and if it is return results 
        service.findPlaceFromQuery(request, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                let inputText = e.target.value.toLowerCase();
                let addressText = results[0].formatted_address.toLowerCase();
                console.log(results[0].formatted_address.toLowerCase())           
                // Check if the result address contains the input text
                entryAddressPlaceholder.value = results[0].formatted_address.toLowerCase();
            } else {
                entryAddressPlaceholder.value = ''
            }
        });
    } 
};

async function submitGeoLocation(e) {
    e.preventDefault();

    let userAddress = entryAddressPlaceholder.value;
    console.log(`submitted: ${userAddress}`);

    try {
        let coords = await getCoordsFromAddress(userAddress);
        let lat = coords.lat;
        let lng = coords.lng;

        console.log(`Coordinates: ${lat}, ${lng}`);

        initMap(lat, lng)
        show_page()

    } catch (error) {
        console.error(error);
        curFailure();
        displayError(`Results failed: ${userAddress}`);
    }
}

async function getCoordsFromAddress(UserAddress) {
    let request = {
        query: UserAddress,
        fields: ['formatted_address', 'geometry']
    };

    let service = new google.maps.places.PlacesService(map);

    return new Promise((resolve, reject) => {
        service.findPlaceFromQuery(request, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                let location = results[0].geometry.location;
                let lat = location.lat();
                let lng = location.lng();
                resolve({ lat, lng });
            } else {
                reject("Geocoding failed: " + status);
            }
        });
    });
}

function curFailure(err) {

    const divs = parentDiv.children;
        
        for (let i = 0; i < divs.length; i++) {
            divs[i].style.display = 'none';
        }


}

function displayError(Errormessage) {
    InputAddressError.style.display = 'block';
    InputAddressError.textContent = Errormessage;

    setTimeout( function() {
        InputAddressError.style.display = 'none';
    } , 5000);    
}

//change func name to initialze content
function show_page() {


    const divs = parentDiv.children;
        
        for (let i = 0; i < divs.length; i++) {
            divs[i].style.display = 'block';
        }

}

function curSuccess(pos) {
    const coord = pos.coords;
    
    console.log(`Latitude: ${coord.latitude}, longitude: ${coord.longitude}`)
}

const curOptions = { 
    enableHighAccuracy: true, // use gps if available
    timeout : 5000, // wait and stop looking for pos
    maximumAge: 0 //do not use catched pos

}

function initMap(lat, lng) {
    // The location we want to center the map on

    // Create the map, centered at myLatLng
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 17,
        center: {lat: lat, lng: lng},
    });

    // Add a marker at myLatLng
    const marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map,
    });
}


function init() {
    hamburger_icon.addEventListener('click', showNavMenu)
    navigator.geolocation.getCurrentPosition(curSuccess, curFailure, curOptions);
    entryAddressInput.addEventListener('input', detectGeolocation)
    entryAddressForm.addEventListener('submit', submitGeoLocation)
}

 
document.addEventListener('DOMContentLoaded', init);