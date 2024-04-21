const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Feature Group to store editable layers
const editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);

const drawPluginOptions = {
    position: 'topright',
    draw: {
        polygon: {
            allowIntersection: false,
            drawError: {
                color: '#e1e100',
                message: '<strong>Error:<strong> you can\'t draw that!'
            },
            shapeOptions: {
                color: '#97009c'
            }
        },
        polyline: {},
        circle: false,
        rectangle: {},
        marker: {},
    },
    edit: {
        featureGroup: editableLayers,
        remove: true
    }
};

const drawControl = new L.Control.Draw(drawPluginOptions);
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, (e) => {
    const { layer } = e;

    // Show modal for multi-line input
    document.getElementById('multiLineTextModal').style.opacity = 1;
    document.getElementById('multiLineTextModal').style.zIndex= 1000;

    window.tempLayer = layer;
});

const saveFeatureText = () => {
    const inputText = document.getElementById('featureText').value;
    if (inputText.trim() !== '') {
        // Bind the input text as a popup to the layer
        const formattedText = inputText.replace(/\n/g, '<br>');
        window.tempLayer.bindPopup(formattedText);
        editableLayers.addLayer(window.tempLayer);
    }

    // Hide the modal and clear temporary layer reference
    document.getElementById('multiLineTextModal').style.opacity = 0;
    document.getElementById('multiLineTextModal').style.zIndex= 0;
    document.getElementById('featureText').value = '';
    delete window.tempLayer;
}

const searchFeatures = () => {
    event.preventDefault();
    const searchText = document.getElementById('searchInput').value;
    const query = searchText.replace(/\n/g, '<br>');
    editableLayers.eachLayer(function(layer) {
        var content = layer.getPopup() ? layer.getPopup().getContent() : '';
        if (content.includes(query)) {
            if (layer instanceof L.Marker) {
                map.setView(layer.getLatLng(), 14);
            } else if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
                map.fitBounds(layer.getBounds());
            }
            layer.openPopup();
        }
    });
}