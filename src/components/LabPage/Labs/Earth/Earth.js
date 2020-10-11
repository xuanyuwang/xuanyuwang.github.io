import React, { useState, useEffect } from 'react';
import * as d3 from 'd3/dist/d3';
import * as topojson from 'topojson-client';
import * as versor from 'versor';
import EarthDataJSON from './land-110m.json';

const homeCoords = [-75.695, 45.424722];
const initAngles = [102, -40, 0];
const landJSON = topojson.feature(EarthDataJSON, EarthDataJSON.objects.land);
const Earth = () => {
	const [angles, setAngles] = useState(initAngles);
	useEffect(() => {
		// clean the container
		const rootNode = document.getElementById('map');
		const root = d3.select(rootNode);
		const land = root.select('svg g.land');
		land.html('');
		const home = root.select('svg g.home');
		home.html('');

		const projection = d3.geoOrthographic();
		const geoGenerator = d3.geoPath().projection(projection);
		projection.rotate(angles);

		// set up event listeners
		let startPoint;
		const drag = d3.drag();
		root.call(drag.on('start', (event, d) => {
			startPoint = [event.x, event.y];
		}));
		root.call(drag.on('drag', (event, d) => {
			const {x, y} = event;
			const ll_start = projection.invert(startPoint);
			const ll_end = projection.invert([x, y]);
			const c_start = versor.cartesian(ll_start);
			const c_end = versor.cartesian(ll_end);
			const deltaQuaternion = versor.delta(c_start, c_end);
			const currentQuaternion = versor(projection.rotate());
			const finalQuaternion = versor.multiply(currentQuaternion, deltaQuaternion);
			const finalAngle = versor.rotation(finalQuaternion);
			setAngles(finalAngle);
		}));

		// land
		land.selectAll('path')
			.data(landJSON.features)
			.enter()
			.append('path')
			.merge(land)
			.attr('d', geoGenerator);

		home.selectAll('path')
			.data([homeCoords].map((d) => {
				const geoCircle = d3.geoCircle().radius(2).precision(1);
				geoCircle.center(d);
				return geoCircle();
			}))
			.enter()
			.append('path')
			.attr('stroke', 'red')
			.attr('fill', 'none')
			.merge(home)
			.attr('d', geoGenerator);
		
		const svgNode = rootNode.firstChild;
		const bbox = svgNode.getBBox();
		svgNode.setAttribute('width', bbox.width + 2 * bbox.x);
		svgNode.setAttribute('height', bbox.height + 2 * bbox.y);
	});
	return <div id='map'>
		<svg>
			<g className='land'></g>
			<g className='home'></g>
		</svg>
	</div>
};

export default Earth;