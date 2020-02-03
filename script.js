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
  .padding(0.1); const y = d3.scaleLinear()
  .range([height, 0])

const graph = d3.select('#graph')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform',
    'translate(' + margin.left + ',' + margin.top + ')')

d3.json('counties-10m.json').then(function (json) {
  const geojson = topojson.feature(json, json.objects.states)

  const projection = d3.geoAlbers()
    .scale(24000)
    .translate([5000, 1400])
  const geoPath = d3.geoPath(projection)

  const us = map.append('g')

  us.selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('stroke', 'red')
    .attr('d', geoPath)

  d3.json('Pavement_Condition_Utah_Roads_2004-2012.geojson').then(function (geojson) {
    const sortedRoadsObj = geojson.features.reduce((result, state) => {
      if (state.properties.surface_ty === 'Asphalt') {
        result.asphalt.push(state)
      } else if (state.properties.surface_ty === 'Concrete') {
        result.concrete.push(state)
      } else if (state.properties.surface_ty === 'Gravel') {
        result.gravel.push(state)
      }
      return result
    }, {
      asphalt: [],
      concrete: [],
      gravel: []
    })
    const asphaltRoad = map.append('g')
    const concreteRoad = map.append('g')
    const gravelRoad = map.append('g')

    asphaltRoad.selectAll('path')
      .data(sortedRoadsObj.asphalt)
      .enter()
      .append('path')
      .attr('stroke', 'green')
      .attr('d', geoPath)
      .on('mouseover', function (d) {
        d3.select('h2').text(d.properties.location)
      })

    concreteRoad.selectAll('path')
      .data(sortedRoadsObj.concrete)
      .enter()
      .append('path')
      .attr('stroke', 'yellow')
      .attr('d', geoPath)
      .on('mouseover', function (d) {
        d3.select('h2').text(d.properties.location)
      })

    gravelRoad.selectAll('path')
      .data(sortedRoadsObj.gravel)
      .enter()
      .append('path')
      .attr('stroke', 'red')
      .attr('d', geoPath)
      .on('mouseover', function (d) {
        d3.select('h2').text(d.properties.location)
      })

    const data = [{
      surfaceType: 'Gravel',
      SurfaceAmount: sortedRoadsObj.gravel.length
    },
    {
      surfaceType: 'Concrete',
      SurfaceAmount: sortedRoadsObj.concrete.length
    },
    {
      surfaceType: 'Asphalt',
      SurfaceAmount: sortedRoadsObj.asphalt.length
    }
    ]

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
  })
})
