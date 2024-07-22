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

initMap();