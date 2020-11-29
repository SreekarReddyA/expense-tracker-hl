export const lineChartOptions = {
    onClick: function (event, activeElements) {
        console.log("new feature to be added here");
    },
    scales: {
        xAxes: [{
            type: 'time',
            distribution: 'series'
        }],
        yAxes: [{
            ticks: {
                callback: function (value, index, values) {
                    return new Intl.NumberFormat('en-US').format(value);
                },
                beginAtZero: true
            },
            scaleLabel: {
                display: true,
                labelString: "S$"
            }
        }]
    },
    tooltips: {
        callbacks: {
            label: function (tooltipItem, data) {
                let label = data.datasets[tooltipItem.datasetIndex].label +
                    ": S$" +
                    new Intl.NumberFormat('en-US').format(tooltipItem.value) || '';
                return label;
            },
            title: function (tooltipItem, data) {
                const options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                };
                return new Date(tooltipItem[0].label).toLocaleDateString('en-GB',
                    options);
            }
        }
    }
}