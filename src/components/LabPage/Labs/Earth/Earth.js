import React, { useState, useEffect } from 'react';
import * as d3 from 'd3/dist/d3';
import * as topojson from 'topojson-client';
import EarthDataJSON from './land-110m.json';

const homeCoords = [-75.695, 45.424722];
const initAngles = [102, -40, 0];
const Earth = () => {
	const [angles, setAngles] = useState(initAngles);
	const [startPoint, setStartPoint] = useState({x: 0, y: 0});
	useEffect(() => {
		// clean the container
		const rootNode = document.getElementById('map');
		const root = d3.select(rootNode);
		const land = root.select('svg g.land');
		land.html('');
		const home = root.select('svg g.home');
		home.html('');

		// set up event listeners
		const drag = d3.drag();
		root.call(drag.on('start', (event, d) => {
			setStartPoint({x: event.x, y: event.y});
		}));
		root.call(drag.on('drag', (event, d) => {
			const {x, y} = event;
			const dx = x - startPoint.x;
			const dy = y - startPoint.y;
			const dYaw = dx / 100; // every 5 pixel is 1 angle
			const dPitch = - dy / 100; // every 5 picel is 1 angle
			setAngles((prevAngles) => {
				return [prevAngles[0] + dYaw, prevAngles[1], prevAngles[2] + dPitch];
			});
		}));

		const landJSON = topojson.feature(EarthDataJSON, EarthDataJSON.objects.land);

		const projection = d3.geoOrthographic();
		const geoGenerator = d3.geoPath().projection(projection);

		projection.rotate(angles)
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