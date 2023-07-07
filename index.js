let markers = [];
let clusterSourceId = 'clusters';
let clusterLayers = ['clusters-count', 'cluster-count'];

map.on('style.load', function () {
    // Add cluster source to the map
    map.addSource(clusterSourceId, {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    });

    // Add cluster count layer to the map
    map.addLayer({
        id: 'clusters-count',
        type: 'circle',
        source: clusterSourceId,
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                40,
                750,
                60
            ]
        }
    });

    // Add cluster count text layer to the map
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: clusterSourceId,
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        },
        paint: {
            'text-color': '#ffffff'
        }
    });

    function updateMap() {
        console.log("Updating map with realtime data");
        fetch("./data.json")
            .then(response => response.json())
            .then(rsp => {
                // // Clear existing markers
                // markers.forEach(marker => marker.remove());
                // markers = [];

                // Update cluster source data
                var geojson = {
                    type: 'FeatureCollection',
                    features: []
                };

                rsp.data.forEach(element => {
                    latitude = element.latitude;
                    longitude = element.longitude;
                    recovered = element.recovered;

                    cases = element.infected;
                    if (cases > 255) {
                        color = "rgb(255, 0, 0)";
                    } else {
                        color = `rgb(${cases}, 0, 0)`;
                    }

                    // Create a GeoJSON feature for each location
                    var feature = {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude]
                        },
                        properties: {
                            recovered: recovered
                        }
                    };

                    geojson.features.push(feature);

                    // Create a marker for each location
                    var marker = new maplibregl.Marker({
                        draggable: false,
                        color: color
                    }).setLngLat([longitude, latitude]);

                    markers.push(marker);
                });

                // Update cluster source data
                map.getSource(clusterSourceId).setData(geojson);

                // Add unclustered markers to the map
                markers.forEach(marker => marker.addTo(map));
            })
            .catch(error => {
                console.log("Error fetching data:", error);
            });
    }

    let interval = 20000;
    setInterval(updateMap, interval);

    // Event listeners for mouseenter and mouseleave
    map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
    });
});
