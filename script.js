
$.getJSON( "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json", function( geojson ) {

//setup and map parameters
var projection = d3.geoAlbers()
var path = d3.geoPath(projection);

//geoJSON data
geojson = topojson.feature(geojson, geojson.objects.states)
console.log(geojson);

var svg = d3.select("#map");
svg.selectAll("path")
.data(geojson.features)
.enter()
.append("path")
.attr("stroke","red")
.attr("d", path);
});

var ctx = document.getElementById('chart');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        responsive: true
    }
});
