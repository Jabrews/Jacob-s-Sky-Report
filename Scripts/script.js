const hamburger_icon = document.querySelector('#menu-icon')
const nav_menu = document.querySelector('.mobile-navbar')


function showNavMenu() {
    if (nav_menu.style.display === 'none') {
        nav_menu.style.display = 'block';
    } else {
        nav_menu.style.display = 'none';
    }

}


async function initMap() {

    const options = {
        zoom : 16,
        center : {lat: 37.321347083373055, lng: -79.90428347255302}
    } 


    let map = await new google.maps.Map(
        document.getElementById('map'), //grabbed both the div and the options
        options 

    )
    
    // let marker = await new google.maps.Marker(
    //     {
    //         position : {lat: 37.321347083373055, lng: -79.90428347255302},
    //         map : map,
    //         icon : 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
    //     }
    // )


};


function curSuccess(pos) {
    const coord = pos.coords;
    

    console.log(`Latitude: ${coord.latitude}, longitude: ${coord.longitude}`)
}

function curError(err) {
    console.log(`error:' ${err.code}`)
}

const curOptions = { 
    enableHighAccuracy: true, // use gps if available
    timeout : 5000, // wait and stop looking for pos
    maximumAge: 0 //do not use catched pos

}

function init() {
    initMap()
    hamburger_icon.addEventListener('click', showNavMenu)
    navigator.geolocation.getCurrentPosition(curSuccess, curError, curOptions);

}

document.addEventListener('DOMContentLoaded', init);