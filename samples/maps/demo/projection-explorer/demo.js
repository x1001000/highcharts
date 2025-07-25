(async () => {

    // Get random data for this sample
    function getRandomData(topology) {
        return topology.objects.default.geometries.map(() =>
            Math.round(Math.random() * 100)
        );
    }

    const topology = await fetch(
        'https://code.highcharts.com/mapdata/custom/world.topo.json'
    ).then(response => response.json());

    const antarctica = await fetch(
        'https://code.highcharts.com/mapdata/custom/antarctica.topo.json'
    ).then(response => response.json());

    const data = getRandomData(topology);

    // Get geometries for parallels
    function getParallelsGeometries(parallels) {
        return parallels.map(lat => {
            const coordinates = [];
            for (let lon = -180; lon <= 180; lon += 5) {
                coordinates.push([lon, lat]);
            }
            return {
                geometry: {
                    type: 'LineString',
                    coordinates
                },
                lineWidth: lat === 0 ? 2 : undefined
            };
        });
    }

    function getGraticule() {
        const data = [];

        // Meridians
        for (let x = -180; x <= 180; x += 15) {
            data.push({
                geometry: {
                    type: 'LineString',
                    coordinates: x % 90 === 0 ? [
                        [x, -90],
                        [x, 0],
                        [x, 90]
                    ] : [
                        [x, -80],
                        [x, 80]
                    ]
                }
            });
        }

        // Parallels
        const parallels = [];
        for (let y = -90; y <= 90; y += 10) {
            parallels.push(y);
        }
        data.push(...getParallelsGeometries(parallels));

        return data;
    }

    let chart, smallChart;

    const drawMap = projectionKey => {

        // Apply projection
        const projection = Highcharts.merge({
            name: undefined
        }, {
            equalearth: {
                name: 'EqualEarth',
                projectedBounds: 'world'
            },
            lcc: {
                name: 'LambertConformalConic',
                parallels: [30, 40],
                projectedBounds: { x1: -200, y1: -200, x2: 200, y2: 200 }
            },
            miller: {
                name: 'Miller',
                projectedBounds: 'world'
            },
            ortho: {
                name: 'Orthographic',
                projectedBounds: 'world'
            },
            webmerc: {
                name: 'WebMercator',
                projectedBounds: 'world'
            }
        }[projectionKey] || {});

        projection.rotation = [
            document.getElementById('rotation-lambda').value,
            document.getElementById('rotation-phi').value,
            document.getElementById('rotation-gamma').value
        ].map(Number);

        // Initialize the chart
        if (!chart) {

            console.time('@mapChart');

            chart = Highcharts.mapChart('container', {
                chart: {
                    height: '65%',
                    spacing: [10, 1, 10, 1]
                },

                title: {
                    text: undefined
                },

                legend: {
                    enabled: false
                },

                mapNavigation: {
                    enabled: true,
                    enableDoubleClickZoomTo: true,
                    buttonOptions: {
                        verticalAlign: 'bottom'
                    }
                },

                mapView: {
                    projection
                    /*
                    projection: {
                        name: 'WebMercator'
                    },
                    zoom: 4,
                    center: [6.5, 61]
                    */
                },

                colorAxis: {
                    tickPixelInterval: 100,
                    minColor: '#F1EEF6',
                    maxColor: '#900037'
                },

                tooltip: {
                    pointFormat: '{point.name}: {point.value}'
                },

                plotOptions: {
                    series: {
                        animationLimit: 500,
                        states: {
                            inactive: {
                                opacity: 1
                            }
                        }
                    },
                    mapline: {
                        enableMouseTracking: false
                    }
                },

                series: [{
                    name: 'Graticule',
                    type: 'mapline',
                    data: getGraticule(),
                    nullColor: '#aaa6',
                    color: '#aaa6'
                }, {
                    data,
                    mapData: topology,
                    joinBy: null,
                    name: 'Random data',
                    dataLabels: {
                        enabled: false,
                        format: '{point.name}'
                    },
                    clip: false
                }, {
                    mapData: antarctica,
                    allAreas: true,
                    name: 'Antarctica',
                    clip: false,
                    opacity: 0.75
                }, {
                    type: 'mapline',
                    data: [{
                        geometry: {
                            type: 'LineString',
                            coordinates: [
                                [4.90, 53.38], // Amsterdam
                                [-118.24, 34.05] // Los Angeles
                            ]
                        },
                        color: '#2caffe'
                    }],
                    lineWidth: 2
                }, {
                    type: 'mappoint',
                    data: [{
                        geometry: {
                            type: 'Point',
                            coordinates: [4.90, 53.38]
                        },
                        name: 'Amsterdam'
                    }, {
                        geometry: {
                            type: 'Point',
                            coordinates: [-118.24, 34.05]
                        },
                        name: 'LA'
                    }],
                    color: '#2caffe'
                }]
            });
            console.timeEnd('@mapChart');

        } else {
            chart.update({
                mapView: {
                    projection
                }
            });
        }


        if (projection.name === 'LambertConformalConic') {
            smallChart = Highcharts.mapChart('small-world-container', {
                chart: {
                    backgroundColor: 'transparent'
                },

                title: {
                    text: undefined
                },

                credits: {
                    enabled: false
                },

                legend: {
                    enabled: false
                },

                exporting: {
                    enabled: false
                },

                mapView: {
                    projection: {
                        name: 'Orthographic',
                        rotation: [0, -10, 0]
                    }
                },

                plotOptions: {
                    series: {
                        enableMouseTracking: false
                    },
                    map: {
                        animationLimit: 500,
                        allAreas: true,
                        clip: false,
                        nullColor: '#8888',
                        borderColor: 'var(--highcharts-background-color, #fff)',
                        borderWidth: 0.25
                    },
                    mapline: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },

                series: [{
                    name: 'Graticule',
                    type: 'mapline',
                    data: getGraticule(),
                    color: '#aaa6'
                }, {
                    mapData: topology
                }, {
                    mapData: antarctica
                }, {
                    data: getParallelsGeometries(projection.parallels),
                    type: 'mapline',
                    id: 'parallels'
                }]
            });
        }

        // Toggle buttons
        document.querySelectorAll('#projection-buttons button').forEach(btn =>
            btn.classList.remove('active')
        );
        const button = document.querySelector(
            `#projection-buttons #${projectionKey}`
        );
        button.classList.add('active');

        // Toggle descriptions
        document.querySelectorAll('#descriptions div').forEach(div => {
            div.style.display = 'none';
        });
        const div = document.querySelector(
            `#descriptions #description-${projectionKey}`
        );
        div.style.display = 'block';


        // Toggle projection-dependent panels
        const panels = (button.getAttribute('data-panels') || '').split(',');
        document.querySelectorAll('.toggle-panel').forEach(panel => {
            panel.style.display = panels.includes(panel.id) ? '' : 'none';
        });


    };


    const enableInputs = () => {

        document.querySelectorAll('#projection-buttons button').forEach(btn =>
            btn.addEventListener('click', e => drawMap(e.target.id))
        );

        document.querySelectorAll('.rotation').forEach(input => {
            input.addEventListener('input', () => {
                const rotation = [
                    document.getElementById('rotation-lambda').value,
                    document.getElementById('rotation-phi').value,
                    document.getElementById('rotation-gamma').value
                ].map(Number);

                document.getElementById('rotation-lambda-output')
                    .innerText = rotation[0];
                document.getElementById('rotation-phi-output')
                    .innerText = rotation[1];
                document.getElementById('rotation-gamma-output')
                    .innerText = rotation[2];

                chart.mapView.update({
                    projection: {
                        rotation
                    }
                }, true, false);
            });
        });

        document.querySelectorAll('.preset-rotations a').forEach(input => {
            input.addEventListener('click', () => {
                const rotation = input.getAttribute('data-rotation')
                    .split(',')
                    .map(Number);
                rotation.push(0);

                // Get the distance between the current rotation and the new one
                // with 1000 steps so that we can animate it using the built-in
                // easing functions.
                const distance = Highcharts.Projection.distance(
                        chart.mapView.projection.options.rotation,
                        rotation
                    ),
                    stepDistance = distance / 1000,
                    geodesic = Highcharts.Projection.geodesic(
                        chart.mapView.projection.options.rotation,
                        rotation,
                        true,
                        stepDistance
                    );

                // Use a custom animator property. For each step of the
                // animation, get the point along the animation trajectory and
                // update the projection with it.
                if (geodesic.length === 1000) {
                    chart.renderer.boxWrapper.animator = 0;
                    Highcharts.animate(
                        chart.renderer.boxWrapper,
                        { animator: 999 }, {
                            duration: 1000,
                            step: now => {
                                const rotation = geodesic[Math.round(now)];
                                chart.mapView.update({
                                    projection: {
                                        rotation
                                    }
                                }, true, false);

                                rotation.forEach((value, i) => {
                                    const name = ['lambda', 'phi', 'gamma'][i];
                                    document.getElementById(`rotation-${name}`)
                                        .value = Math.round(value);
                                    document.getElementById(
                                        `rotation-${name}-output`
                                    ).innerText = Math.round(value);
                                });
                            }
                        }
                    );
                }
            });
        });

        document.querySelectorAll('.parallels').forEach(input => {
            input.addEventListener('input', () => {
                const parallels = [
                    Number(document.getElementById('parallels-0').value),
                    Number(document.getElementById('parallels-1').value)
                ];
                chart.mapView.update({
                    projection: {
                        parallels
                    }
                }, true, false);
                document.getElementById('parallels-0-output')
                    .innerText = parallels[0];
                document.getElementById('parallels-1-output')
                    .innerText = parallels[1];

                if (smallChart) {
                    smallChart.get('parallels').remove();
                    smallChart.addSeries({
                        data: getParallelsGeometries(parallels),
                        type: 'mapline',
                        id: 'parallels'
                    }, true, false);
                }
            });
        });
    };

    drawMap('equalearth');

    enableInputs();
})();