const map = d3.select('#map')

const locations = [
  {
    name: '801 Labs',
    coords: [-111.8828485, 40.7653521]
  },
  {
    name: 'WAVE (Wireless Advanced Vehicle Electrification), Inc.',
    coords: [-112.0066724, 40.7409764]
  }
]

const margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 40
}
const width = 300 - margin.top - margin.bottom
const height = 300 - margin.top - margin.bottom

const x = d3.scaleBand()
  .range([0, width])
  .padding(0.1);
const y = d3.scaleLinear()
  .range([height, 0])

const graph = d3.select('#graph')
  .append('g')
  .attr('transform',
    'translate(' + margin.left + ',' + margin.top + ')')

d3.json('counties-10m.json').then(function (json) {
  const geojson = topojson.feature(json, json.objects.counties)

  const geoPath = d3.geoPath()

  const utah = geojson.features.find(state => state.properties.name === 'Salt Lake')

  const utahCenter = geoPath.centroid(utah)

  const projection = d3.geoMercator()
    .scale(60000)
    .translate([150, 250])
    .center(utahCenter)
  geoPath.projection(projection)

  const us = map.append('g')

  us.selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('stroke', 'red')
    .attr('d', geoPath)
    .on('mousedown', getCoords)

  function getCoords () {
	  console.log('x,y', projection.invert(d3.mouse(this)))
  }

	  d3.json('Local_parks_in_Utah.geojson').then(function (geojson) {
			const parks = map.append('g')

			parks.selectAll('path')
				.data(geojson.features)
				.enter()
				.append('path')
				.attr('fill', 'green')
				.attr('stroke', 'green')
				.attr('d', geoPath)
				.attr('class', d => {
					return d.properties.type.toLowerCase()
				})
		})

  d3.json('Pavement_Condition_Utah_Roads_2004-2012.geojson').then(function (geojson) {
    const data = [{
      surfaceType: 'Gravel',
      SurfaceAmount: 0
    },
    {
      surfaceType: 'Concrete',
      SurfaceAmount: 0
    },
    {
      surfaceType: 'Asphalt',
      SurfaceAmount: 0
    }
    ]

    geojson.features.forEach((state) => {
      switch (state.properties.surface_ty){
        case 'Asphalt':
        data[2].SurfaceAmount++;
        break;
        case 'Concrete':
        data[1].SurfaceAmount++;
        break;
        case 'Gravel':
        data[0].SurfaceAmount++;
        break;
      }
    })
    const road = map.append('g')

    road.selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', geoPath)
			.attr('class', d => {
				return d.properties.surface_ty.toLowerCase()
			})
      .on('mouseover', d => {
        d3.select('h2').text(d.properties.location)
      })

    data.forEach(function (d) {
      d.SurfaceAmount = +d.SurfaceAmount
    })

    x.domain(data.map(function (d) {
      return d.surfaceType
    }))
    y.domain([0, d3.max(data, function (d) {
      return d.SurfaceAmount
    })])

    graph.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', function (d) {
        return x(d.surfaceType)
      })
      .attr('width', x.bandwidth())
      .attr('y', function (d) {
        return y(d.SurfaceAmount)
      })
      .attr('height', function (d) {
        return height - y(d.SurfaceAmount)
      })

    graph.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))

    graph.append('g')
      .call(d3.axisLeft(y))

    const places = map.append('g')

    places.selectAll('circle')
      .data(locations).enter()
      .append('circle')
      .attr('cx', d => projection(d.coords)[0])
      .attr('cy', d => projection(d.coords)[1])
      .attr('r', '8px')
      .attr('fill', 'red')
      .on('mouseover', function (d) {
        d3.select('h2').text(d.name)
      })

    const car = map.append('g')

    car.selectAll('circle')
      .data([locations[0]]).enter()
      .append('circle')
      .attr('cx', d => projection(d.coords)[0])
      .attr('cy', d => projection(d.coords)[1])
      .attr('r', '4px')
			.attr('stroke', 'black')
      .attr('fill', 'blue')
      .on('mouseover', function (d) {
        d3.select('h2').text('You drove from ' + d.name)
      })

    const carLocations = [
      [-111.89099517345123, 40.727830376976804],
      [-111.88980151137802, 40.70053668000986],
      [-111.92561137357372, 40.69999370844943],
      [-111.97646137789157, 40.69782177794881],
      [-111.98290715308679, 40.727136864475355],
      locations[1].coords].map(coords=>projection(coords))
    let currentLocation = 0
    const counter = setInterval(timer, 1000)

    function timer () {
      if (!carLocations[currentLocation]) {
        d3.select('h2').text('You have reached your destination!')
        car.selectAll('circle')
          .attr('fill', 'purple')
        clearInterval(counter)
      } else {
				const x = carLocations[currentLocation][0]
				const y = carLocations[currentLocation][1]
				car.selectAll('circle')
					.attr('cx', d => x)
					.attr('cy', d => y)
					currentLocation += 1;

			}
    }
  })
})
