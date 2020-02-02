const map = d3.select("#map");

d3.json("counties-10m.json").then(function(json) {

	const geojson = topojson.feature(json, json.objects.states)

	const utah = geojson.features.find(state => state.properties.name === "Utah");

	const center = d3.geoCentroid(utah);

	const projection = d3.geoAlbers()
	.scale(24000)
	.translate([5000, 1400]),
	geoPath = d3.geoPath(projection);

	const us = map.append("g");

	us.selectAll("path")
		.data(geojson.features)
		.enter()
		.append("path")
		.attr("stroke", "red")
		.attr("d", geoPath);

	d3.json("Pavement_Condition_Utah_Roads_2004-2012.geojson").then(function(geojson) {

		const sortedRoadsObj = geojson.features.reduce((result, state) => {
			if (state.properties.surface_ty === "Asphalt") {
				result.asphalt.push(state)
			} else if (state.properties.surface_ty === "Concrete") {
				result.concrete.push(state)
			} else if (state.properties.surface_ty === "Gravel") {
				result.gravel.push(state)
			}
			return result
		}, {
			asphalt: [],
			concrete: [],
			gravel: []
		});
		const asphaltRoad = map.append("g"),
		concreteRoad = map.append("g"),
		gravelRoad = map.append("g");

		asphaltRoad.selectAll("path")
			.data(sortedRoadsObj.asphalt)
			.enter()
			.append("path")
			.attr("stroke", "green")
			.attr("d", geoPath)
			.attr("class", "road")
			.on("mouseover", function (d) {
				d3.select("h2").text(d.properties.location);
			});

		concreteRoad.selectAll("path")
			.data(sortedRoadsObj.concrete)
			.enter()
			.append("path")
			.attr("stroke", "yellow")
			.attr("d", geoPath);

		gravelRoad.selectAll("path")
			.data(sortedRoadsObj.gravel)
			.enter()
			.append("path")
			.attr("stroke", "red")
			.attr("d", geoPath);
	});
});
