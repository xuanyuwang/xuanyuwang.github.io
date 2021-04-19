import * as ReactDOM from 'react-dom';
const renderReactPage = (reactComponent) => {
	const body = document.body;
	const root = document.createElement('div');
	root.id = 'root';
	body.appendChild(root);

	const page = reactComponent();
	ReactDOM.render(page, root);
};

export default {renderReactPage};
export { renderReactPage };