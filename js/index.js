const country = 'assets/countryBorders.geo.json'
const point = 'assets/sumOlympics.geo.json'

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
let byX = {
    weight: 5,
    fillColor: '#37991e',
    color:'#1d3557',
    dashArray: '',
    fillOpacity: 0.7
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

$.when(countryGeo, pointGeo).done(() => {

    let countrylayer = countryGeo.responseJSON
    let pointlayer = pointGeo.responseJSON

    let lastClickedLayer = null

    let OnClickFeature = e => {
        if (lastClickedLayer !== null) {
            lastClickedLayer.setStyle(polyStyle);
           
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

    let geojson = L.geoJSON(countrylayer, {
        onEachFeature: onEachFeature,
        style: polyStyle
    })

    let geojsonPoint = L.geoJSON(pointlayer, {
        pointToLayer: IconImage
    })

    map.addLayer(geojson)
    map.addLayer(geojsonPoint)

    map.fitBounds(geojson.getBounds())

    document.getElementById('removelayer').onclick = function () {
        if (!this.checked) {
            map.removeLayer(geojsonPoint)
        } else {
            map.addLayer(geojsonPoint)
        }
    }

    let filcount = countrylayer.features.map(a =>{
        return a.properties.name
    })

    let dropdown = document.getElementById('inlineFormCustomSelectCountry')

    for(let i in filcount){
        let opt = document.createElement('option')
        opt.value = filcount[i]
        opt.innerHTML = filcount[i]
        dropdown.appendChild(opt)
    }
    
    let newLayer = null
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
            style:byX
        })
       
        newLayer = geojson

        lastClickedLayer = geojson;

        newLayer.setStyle(byX)

        map.fitBounds(geojson.getBounds())
        map.addLayer(geojson)
    }
    document.getElementById('fitbound').onclick = function () {
        map.fitBounds(geojson.getBounds())
        lastClickedLayer.setStyle(polyStyle)
        newLayer.setStyle(polyStyle)
    }
    // console.log(j)
})