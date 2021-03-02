import { Manifest } from './Manifest';
import { createStore } from 'redux';

// Actions
const Actions = {
	SWITCH_PAGE: 'SWITCH_PAGE'
};
const switchPage = (payload) => {
	return {
		type: Actions.SWITCH_PAGE,
		payload
	};
};

// Reducer
const InitialState = {
	page: Manifest.StarterPage
};
const RootReducer = (state = InitialState, action) => {
	let result = Object.assign({}, state);
	switch (action.type) {
	case Actions.SWITCH_PAGE:
		result.page = action.payload.page;
		break;
	default:
		result = state;
		break;
	}
	return result;
};

// Store
const RootStore = createStore(RootReducer);

export { RootStore};
export {switchPage};