const hamburger_icon = document.querySelector('#menu-icon');
const nav_menu = document.querySelector('.mobile-navbar');
const parentDiv = document.querySelector('.div-container');
const enterLocationDiv = document.querySelector('.blank-1');
const  entryAddressInput = document.querySelector('#entry-address'); //change to search
const entryAddressPlaceholder = document.querySelector('#placeholder-text'); //change to input
const entryAddressForm = document.querySelector('.entry-form');
const InputAddressError = document.querySelector('.search-error');
const mapLocationDisplay = document.querySelector('#map-location-display');
//stat display
const precipitationInput = document.querySelector('#precipitation-display')
const humidityInput = document.querySelector('#humidity-display')
const uvInput = document.querySelector('#uv-display')
const windInput = document.querySelector('#wind-display')
const airInput = document.querySelector('#air-display')
//card display 
const dayDisplay = document.querySelector('#day-display');
const iconDisplay = document.querySelector('#icon-display');
const conditionsDisplay = document.querySelector('#conditions-display');
const tempDisplay = document.querySelector('#temp-display');
//tab
const tabPanel1 = document.querySelector('.tab-panel-1');
const tabPanel2 = document.querySelector('.tab-panel-2');
//footer stat display
const nightLabelText = document.querySelector('.night-label');
const morningLabelText = document.querySelector('.morning-label');
const nightCardText = document.querySelector('.night-card');
const morningCardText = document.querySelector('.morning-card');
///indv stats 
const nightPrecipitation = document.querySelector('#night-precipitation');
const nightHumidity = document.querySelector('#night-humidity');
const nightUV = document.querySelector('#night-uv');
const nightWind = document.querySelector('#night-wind');
const nightAir = document.querySelector('#night-air');
const morningPrecipitation = document.querySelector('#morning-precipitation');
const morningHumidity = document.querySelector('#morning-humidity');
const morningUV = document.querySelector('#morning-uv');
const morningWind = document.querySelector('#morning-wind');
const morningAir = document.querySelector('#morning-air');

let lat_global = null
let lng_global = null


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
        lat_global = lat;
        lng_global = lng;

        console.log(`Coordinates: ${lat}, ${lng}`);

        initMap(lat, lng, userAddress);
        let weatherData = await fetchDataFromApi(lat, lng);
        console.log('weatherData:', weatherData);
        loadStatDisplay(weatherData);
        loadCardDisplay(weatherData);
        let footWeatherData = await fetchFooterDataFromApi(lat, lng, "yesterday");
        changeFooterLabel('Yesterday')
        loadFooterDisplay(footWeatherData);
        show_page()



        // Use console.log to inspect the object


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
    initMap(pos.coords.latitude, pos.coords.longitude, `Latitude : ${pos.coords.latitude.toFixed(4)} Longitude : ${pos.coords.longitude.toFixed(4)}`)
    show_page()
}

const curOptions = { 
    enableHighAccuracy: true, // use gps if available
    timeout : 5000, // wait and stop looking for pos
    maximumAge: 0 //do not use catched pos

}

function initMap(lat, lng, userAddress='') {
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
    })

    if (userAddress !== '') {
        mapLocationDisplay.value = userAddress;
    }

}



async function fetchDataFromApi(lat, lng) {
    try {
        let response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lng}?key=ZP3RFPFC92PX6ZFAFJFWTKNPZ`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let weatherData = await response.json();
        return weatherData;
    } catch (error) {
        console.error(error);
        displayError("Failed to fetch weather data");
        return null;
    }
}

async function fetchFooterDataFromApi(lat, lng, type) {
    
    let endPoint = null;
    if (type === 'yesterday') {
        endPoint = 'yesterday';
    } else {
        endPoint = 'tomorrow';
    }
    try {
        let response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lng}/${endPoint}?key=ZP3RFPFC92PX6ZFAFJFWTKNPZ`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let weatherData = await response.json();
        return weatherData;
    } catch (error) {
        console.error(error);
        displayError("Failed to fetch weather data");
        return null;
    }
}


function loadStatDisplay(weatherData) {

    precipitationInput.value = weatherData.days[0].precipprob
    humidityInput.value = weatherData.days[0].humidity
    uvInput.value = weatherData.days[0].uvindex
    windInput.value = weatherData.days[0].windspeed
    airInput.value = weatherData.days[0].dew
}

function loadCardDisplay(weatherData) {
    dayDisplay.innerHTML = weatherData.days[0].datetime;
    conditionsDisplay.innerHTML = weatherData.days[0].conditions;
    tempDisplay.innerHTML = weatherData.days[0].temp + '°F';
}

function changeSection1Content(e) {
    if (e.target.classList.contains('tablinks')) {
        let parentDiv = e.target.parentElement;
        for (let child of parentDiv.children) {
            if (child.classList.contains('tabactive')) {
                child.classList.remove('tabactive');
            }
        }
        e.target.classList.add('tabactive');
    } 
}


function changeSection2Content(e) {
    if (e.target.classList.contains('tablinks')) {
        let parentDiv = e.target.parentElement;
        for (let child of parentDiv.children) {
            if (child.classList.contains('tabactive')) {
                child.classList.remove('tabactive');
            }
        }

        if (e.target.classList.contains('yesterday')) {
            changeFooterLabel('Yesterday');
            let footWeatherData = fetchFooterDataFromApi(lat_global, lng_global, 'yesterday')

            console.log(footWeatherData);
            
            loadFooterDisplay(footWeatherData)

        } else {
            changeFooterLabel('Tomorrow');
            let footWeatherData = fetchFooterDataFromApi(lat_global, lng_global, 'tomorrow')
            
            console.log(footWeatherData);
            
            loadFooterDisplay(footWeatherData)
        }
        
        e.target.classList.add('tabactive');
    } 
}
function loadFooterDisplay(footWeatherData) {
 // Morning
    morningCardText.textContent = footWeatherData.days[0].datetime + ' - ' + footWeatherData.days[0].hours[9].conditions + ' - ' + footWeatherData.days[0].hours[9].temp + '°F';
    morningPrecipitation.textContent = 'Precipitation: ' + footWeatherData.days[0].hours[9].precipprob;
    morningHumidity.textContent = 'Humidity: ' + footWeatherData.days[0].hours[9].humidity;
    morningUV.textContent = 'Uv Index: ' + footWeatherData.days[0].hours[9].uvindex;
    morningWind.textContent = 'Wind Speed: ' + footWeatherData.days[0].hours[9].windspeed;
    morningAir.textContent = 'Air Quality: ' + footWeatherData.days[0].hours[9].dew;

// Night
    nightCardText.textContent = footWeatherData.days[0].datetime + ' - ' + footWeatherData.days[0].hours[20].conditions + ' - ' + footWeatherData.days[0].hours[20].temp + '°F';
    nightPrecipitation.textContent = 'Precipitation: ' + footWeatherData.days[0].hours[20].precipprob;
    nightHumidity.textContent = 'Humidity: ' + footWeatherData.days[0].hours[20].humidity;
    nightUV.textContent = 'Uv Index: ' + footWeatherData.days[0].hours[20].uvindex;
    nightWind.textContent = 'Wind Speed: ' + footWeatherData.days[0].hours[20].windspeed;
    nightAir.textContent = 'Air Quality: ' + footWeatherData.days[0].hours[20].dew;
}

function changeFooterLabel(type) {
    morningLabelText.textContent = type + ' ' + 'Morning'
    nightLabelText.textContent = type + ' ' + 'Night'
}


function init() {
    hamburger_icon.addEventListener('click', showNavMenu)
    navigator.geolocation.getCurrentPosition(curSuccess, curFailure, curOptions);
    entryAddressInput.addEventListener('input', detectGeolocation)
    entryAddressForm.addEventListener('submit', submitGeoLocation)
    tabPanel1.addEventListener('click', changeSection1Content)
    tabPanel2.addEventListener('click', changeSection2Content)

}

 
document.addEventListener('DOMContentLoaded', init);
