import React, { useEffect } from 'react';
import * as d3 from 'd3/dist/d3';
import * as topojson from 'topojson-client';
import EarthDataJSON from './land-110m.json';

const homeCoords = [-75.695, 45.424722];
const Earth = () => {
	useEffect(() => {
		// clean the container
		const root = document.getElementById('map');
		const land = d3.select(root).select('svg g.land');
		land.html('');
		const home = d3.select(root).select('svg g.home');
		home.html('');

		const landJSON = topojson.feature(EarthDataJSON, EarthDataJSON.objects.land);

		const projection = d3.geoOrthographic();
		const geoGenerator = d3.geoPath().projection(projection);

		projection.rotate([102, -40, 0])
			.fitSize([100, 100], landJSON);

		// land
		land.selectAll('path')
			.data(landJSON.features)
			.enter()
			.append('path')
			.merge(land)
			.attr('d', geoGenerator);

		home.selectAll('path')
			.data([homeCoords].map((d) => {
				const geoCircle = d3.geoCircle().radius(5).precision(1);
				geoCircle.center(d);
				return geoCircle();
			}))
			.enter()
			.append('path')
			.attr('stroke', 'red')
			.attr('fill', 'none')
			.merge(home)
			.attr('d', geoGenerator);
	});
	return <div id='map'>
		<svg viewBox='0 0 100 100'>
			<g className='land'></g>
			<g className='home'></g>
		</svg>
	</div>
};

export default Earth;