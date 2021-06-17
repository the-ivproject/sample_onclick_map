const country = 'assets/countryBorders.geo.json'
const point = 'assets/sumOlympics.geo.json'
const snowflake = 'assets/winOlympics.geo.json'

let polyStyle = {
    fillColor: '#37991e',
    fillOpacity: 0.2,
    weight: 2,
    color: '#023047',
    opacity: 1
}

let polyStyleOnclick = {
    weight: 5,
    color: '#1d3557',
    dashArray: '',
    fillOpacity: 0.7
}

let defaultDropdownStyle = {
    weight: 5,
    fillColor: '#37991e',
    color: '#1d3557',
    dashArray: '',
    fillOpacity: 0.5
}

let geojsonMarkerOptions = {
    radius: 5,
    fillColor: "#e63946",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 1
};

let iconImage = {
    iconUrl: 'assets/icon/gold-medal.png',
    iconSize: [25, 25], // width and height of the image in pixels
    shadowSize: [35, 20], // width, height of optional shadow image
    iconAnchor: [15, 15], // point of the icon which will correspond to marker's location
    shadowAnchor: [12, 6], // anchor point of the shadow. should be offset
    popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
}

let iconImageSnow = {
    iconUrl: 'assets/icon/snowflake.png',
    iconSize: [25, 25], // width and height of the image in pixels
    shadowSize: [35, 20], // width, height of optional shadow image
    iconAnchor: [15, 15], // point of the icon which will correspond to marker's location
    shadowAnchor: [12, 6], // anchor point of the shadow. should be offset
    popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
}

let countryGeo = $.ajax({
    url: country,
    dataType: "json",
    success: console.log("Country data successfully loaded."),
    error: function (xhr) {
        alert(xhr.statusText)
    }
})

let pointGeo = $.ajax({
    url: point,
    dataType: "json",
    success: console.log("Point data successfully loaded."),
    error: function (xhr) {
        alert(xhr.statusText)
    }
})

let pointGeoSnow = $.ajax({
    url: snowflake,
    dataType: "json",
    success: console.log("Point data successfully loaded."),
    error: function (xhr) {
        alert(xhr.statusText)
    }
})
$.when(countryGeo, pointGeo, pointGeoSnow).done(() => {
    let mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
    let mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    let grayscale = L.tileLayer(mbUrl, { id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr })

    let map = L.map('map', {
        center: [39.73, -104.99],
        zoom: 10,
        layers: [grayscale]
    });

    
    function ZoomIn() {
        map.zoomIn();
    }
    
    function ZoomOut() {
        map.zoomOut();
    }
    ap.zoomControl.disable()
    let lastClickedLayer = null
    let newLayer = null
    let OnClickFeature = e => {
        if (lastClickedLayer !== null) {
            lastClickedLayer.setStyle(polyStyle);  

        }
        if(newLayer !== null){
            map.removeLayer(newLayer)
        }

        map.fitBounds(e.target.getBounds());
        let countrylayer = e.target;

        lastClickedLayer = countrylayer;

        countrylayer.setStyle(polyStyleOnclick);

        let popup = L.popup()
            .setContent(`Country: ${countrylayer.feature.properties.name}`);

        countrylayer.bindPopup(popup).openPopup();
    }

    function onEachFeature(feature, layer) {
        layer.on({
            click: OnClickFeature
        });
    }

    let circleStyle = (feature, latlng) => {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }

    let IconImage = (feature, latlng) => {
        let myIcon = L.icon(iconImage)
        return L.marker(latlng, {
            icon: myIcon
        })
    }

    let IconImageSnow = (feature, latlng) => {
        let myIcon = L.icon(iconImageSnow)
        return L.marker(latlng, {
            icon: myIcon
        })
    }

    let geojson = L.geoJSON(countrylayer, {
        onEachFeature: onEachFeature,
        style: polyStyle
    })

    let geojsonPoint = L.geoJSON(pointlayer, {
        pointToLayer: IconImage
    })

    let geojsonPointSnow = L.geoJSON(pointlayerSnow, {
        pointToLayer: IconImageSnow
    })

    let group = L.layerGroup([geojsonPoint,geojsonPointSnow])
    var clusterGroup = L.markerClusterGroup();
    map.addLayer(geojson)
    map.addLayer(group)
    map.fitBounds(geojson.getBounds())

    document.getElementById('removelayer').onclick = function () {
        if (!this.checked) {
            map.removeLayer(geojsonPoint)
        } else {
            map.addLayer(geojsonPoint)
        }
    }
    document.getElementById('removelayerSnow').onclick = function () {
        if (!this.checked) {
            map.removeLayer(geojsonPointSnow)
        } else {
            map.addLayer(geojsonPointSnow)
        }
    }

    let filcount = countrylayer.features.map(a =>{
        return a.properties.name
    })

    filcount.sort()

    let dropdown = document.getElementById('inlineFormCustomSelectCountry')

    for(let i in filcount){
        let opt = document.createElement('option')
        opt.value = filcount[i]
        opt.innerHTML = filcount[i]
        dropdown.appendChild(opt)
    }

    document.getElementById('inlineFormCustomSelectCountry').onchange = function() {
        if (lastClickedLayer !== null) {
            lastClickedLayer.setStyle(polyStyle);
        }

        if (newLayer !== null) {
            newLayer.setStyle(polyStyle);
            map.removeLayer(newLayer)
        }

        let countFilter = countrylayer.features.filter(a => {
            return a.properties.name == this.value
        })

        let geojson = L.geoJSON(countFilter,{
            onEachFeature: onEachFeature,

        })

        newLayer = geojson

        lastClickedLayer = geojson;

        newLayer.setStyle(defaultDropdownStyle)

        map.fitBounds(geojson.getBounds())
        map.addLayer(geojson)
    }

    document.getElementById('fitbound').onclick = function () {
        map.fitBounds(geojson.getBounds())
        lastClickedLayer.setStyle(polyStyle)
        newLayer.setStyle(polyStyle)
    }
})