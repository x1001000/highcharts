// Data retrieved from https://companiesmarketcap.com/
Highcharts.chart('container', {
    chart: {
        type: 'area',
        inverted: true
    },
    title: {
        text: 'Alibaba and Meta (Facebook) revenue'
    },
    accessibility: {
        keyboardNavigation: {
            seriesNavigation: {
                mode: 'serialize'
            }
        }
    },
    tooltip: {
        pointFormat: '• {series.name}: <b>${point.y} B</b>'
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -150,
        y: 100,
        floating: true,
        borderWidth: 1,
        backgroundColor: 'var(--highcharts-background-color, #ffffff)'
    },
    yAxis: {
        labels: {
            format: '${text}'
        },
        title: {
            text: 'Revenue (billions USD)'
        }
    },
    plotOptions: {
        series: {
            pointStart: 2014
        },
        area: {
            fillOpacity: 0.5
        }
    },
    series: [{
        name: 'Alibaba',
        data: [
            11.44, 14.89, 21.40, 34.03, 51.52,
            70.49, 94.46, 129.44, 127.84, 130.80
        ]
    }, {
        name: 'Meta (Facebook)',
        data: [
            11.49, 17.08, 26.88, 39.94, 55.01,
            69.65, 84.17, 117.93, 116.61, 134.90
        ]
    }]
});
