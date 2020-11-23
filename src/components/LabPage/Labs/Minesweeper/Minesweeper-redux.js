import { createStore } from 'redux';

// Constants

const BOARD_SIZES = {
	SMALL: 'small',
	MEDIUM: 'meidum',
	LARGE: 'large'
};
const BOARD_SIZE_SPECS = {
	[BOARD_SIZES.SMALL]: {
		row: 9,
		col: 9,
		totalMines: 10
	},
	[BOARD_SIZES.MEDIUM]: {
		row: 16,
		col: 16,
		totalMines: 40
	},
	[BOARD_SIZES.LARGE]: {
		row: 16,
		col: 30,
		totalMines: 99
	}
};
const GAME_STATUS = {
	INIT: 'initial',
	PLAYING: 'playing',
	WIN: 'win',
	FAIL: 'fail'
};
const CELL_STATUS = {
	COVERED: 'covered',
	FLAGGED: 'flagged',
	UNCOVERED: 'uncovered'
};

// Initial states
/**
 * state = {
 * 	BoardRow,
 *  BoardCol,
 *  TotalMines,
 *  GameStatus,
 * 	Cells: [...{
 * 		surroundingMines,
 * 		displayValue,
 * 		status,
 * 		cellRow,
 * 		cellCol,
 * 		cellKey,
 * 		cellOrder
 * 	}]
 * }
 */
const buildInitialState = () => {
	const state = {};
	const defaultBoardSizeSpec = BOARD_SIZE_SPECS[BOARD_SIZES.SMALL];
	state.BoardRow = defaultBoardSizeSpec.row;
	state.BoardCol = defaultBoardSizeSpec.col;
	state.TotalMines = defaultBoardSizeSpec.totalMines;
	state.GameStatus = GAME_STATUS.INIT;

	const locateMines = (row, col, totalMines) => {
		const mineIndices = [];
		let cellIndices = [];
		for (let i = 0; i < row * col; i++) {
			cellIndices.push(i);
		}
		while (mineIndices.length < totalMines) {
			const index = Math.floor(Math.random() * cellIndices.length);
			const cellOrder = cellIndices[index];
			mineIndices.push({ row: Math.floor(cellOrder / col), col: cellOrder % row, order: cellOrder });
			cellIndices.splice(index, 1);
		}
		return mineIndices;
	};
	const buildCells = (mineIndices, boardRow, boardCol) => {
		const mineCount = [];
		for (let i = 0; i < boardRow; i++) {
			for (let j = 0; j < boardCol; j++) {
				mineCount.push({
					surroundingMines: 0,
					displayValue: '',
					status: CELL_STATUS.COVERED,
					cellRow: i,
					cellCol: j,
					cellKey: `${i} ${j}`,
					cellOrder: i * boardRow + j
				});
			}
		}
		mineIndices.forEach((mineIndex) => {
			const { row: mineRow, col: mineCol } = mineIndex;
			const neighbors = [
				[mineRow + 1, mineCol], // above
				[mineRow - 1, mineCol], // below
				[mineRow, mineCol + 1], // right
				[mineRow, mineCol - 1], // left
				[mineRow - 1, mineCol - 1], // top left
				[mineRow - 1, mineCol + 1], // top right
				[mineRow + 1, mineCol - 1], // bottom left
				[mineRow + 1, mineCol + 1] // bottom right
			];
			neighbors.forEach((neighbor) => {
				if (neighbor[0] >= 0 &&
					neighbor[0] < boardRow &&
					neighbor[1] >= 0 &&
					neighbor[1] < boardCol
				) {
					const neighborIndex = neighbor[0] * boardCol + neighbor[1];
					mineCount[neighborIndex].surroundingMines += 1;
				}
			});
		});
		mineIndices.forEach((mineIndex) => {
			const { row: mineRow, col: mineCol } = mineIndex;
			mineCount[mineRow * boardCol + mineCol].surroundingMines = -1;
		})

		return mineCount;
	};
	const mineIndices = locateMines(state.BoardRow, state.BoardCol, state.TotalMines);
	state.Cells = buildCells(mineIndices, state.BoardRow, state.BoardCol);

	return state;
};
const INIT_STATE = buildInitialState();

// Actions
const ACTIONS = {
	REVEAL_CELL: 'REVEAL_CELL',
	FLAG_CELL: 'FLAG_CELL',
	EXPAND: 'EXPAND',
	NEW_GAME: 'NEW_GAME'
};

const RevealCell = (cell) => {
	return {
		type: ACTIONS.REVEAL_CELL,
		payload: {
			cell
		}
	};
};

const FlagCell = (cell) => {
	return {
		type: ACTIONS.FLAG_CELL,
		payload: {
			cell
		}
	};
};

const Expand = (cell) => {
	return {
		type: ACTIONS.EXPAND,
		payload: {
			cell
		}
	};
};

// reducer
// reducer helpers
const updateGameStatus = (state) => {
	const { Cells } = state;
	let flagged = 0;
	let covered = 0;
	let uncovered = 0;
	let foundMines = 0;
	let stepOnMine = false;
	Cells.forEach((cell) => {
		if (cell.status === CELL_STATUS.FLAGGED) {
			flagged += 1;
			if (cell.surroundingMines === -1) {
				foundMines += 1;
			}
		} else if (cell.status === CELL_STATUS.COVERED) {
			covered += 1;
		} else if (cell.status === CELL_STATUS.UNCOVERED) {
			uncovered += 1;
			if (cell.surroundingMines === -1) {
				stepOnMine = true;
			}
		}
	});
	if (stepOnMine) {
		state.GameStatus = GAME_STATUS.FAIL;
	} else {
		if (covered === 0) {
			if (foundMines === state.TotalMines && flagged === state.TotalMines) {
				state.GameStatus = GAME_STATUS.WIN;
			}
		} else if (covered > 0 && covered < state.BoardRow * state.BoardCol) {
			state.GameStatus = GAME_STATUS.PLAYING;
		} else if (covered === state.BoardRow * state.BoardCol) {
			state.GameStatus = GAME_STATUS.INIT;
		}
	}
};
const revealCellDerivation = (payload, state) => {
	const { cell } = payload;
	const updateList = [];
	const processList = [];
	const processed = new Set();

	if (cell.status === CELL_STATUS.COVERED) {
		processList.push(cell);
		while (processList.length > 0) {
			const head = processList.shift();
			if (head.surroundingMines === 0) {
				[
					[0, 0],
					[0, -1], [0, 1], // left, right
					[-1, 0], [1, 0], // above, below
					[-1, -1], [-1, 1], // top-left, top-right
					[1, -1], [1, 1], // bottom-left, bottom-right
				].forEach((diff) => {
					const neighborRow = head.cellRow + diff[0];
					const neighborCol = head.cellCol + diff[1];
					const valid = neighborRow >= 0 && neighborRow < state.BoardRow
						&& neighborCol >= 0 && neighborCol < state.BoardCol;
					if (valid && !processed.has(`${neighborRow} ${neighborCol}`)) {
						const neighborOrder = neighborRow * state.BoardRow + neighborCol;
						const neighbor = state.Cells[neighborOrder];
						if (neighbor.surroundingMines === 0) {
							neighbor.displayValue = '';
							neighbor.status = CELL_STATUS.UNCOVERED;

							updateList.push(neighbor);
							processList.push(neighbor);
							processed.add(neighbor.cellKey);
						} else if (neighbor.surroundingMines > 0) {
							neighbor.displayValue = neighbor.surroundingMines;
							neighbor.status = CELL_STATUS.UNCOVERED;

							updateList.push(neighbor);
						}
					}
				});
			} else {
				head.displayValue = head.surroundingMines;
				head.status = CELL_STATUS.UNCOVERED;

				updateList.push(head);
			}
		}
	}

	updateList.forEach((newCell) => {
		state.Cells[newCell.cellOrder] = newCell;
	});

	updateGameStatus(state);

	const newState = JSON.parse(JSON.stringify(state));
	return newState;
};
const flagCellDerivation = (payload, state) => {
	const { cell } = payload;
	if (cell.status === CELL_STATUS.COVERED) {
		state.Cells[cell.cellOrder].displayValue = 'F';
		state.Cells[cell.cellOrder].status = CELL_STATUS.FLAGGED;
	} else if (cell.status === CELL_STATUS.FLAGGED) {
		state.Cells[cell.cellOrder].displayValue = '';
		state.Cells[cell.cellOrder].status = CELL_STATUS.COVERED;
	}

	updateGameStatus(state);

	return JSON.parse(JSON.stringify(state));
};
const rootReducer = (state = INIT_STATE, action) => {
	let newState = JSON.parse(JSON.stringify(state));
	if (action.type === ACTIONS.REVEAL_CELL && (state.GameStatus === GAME_STATUS.INIT || state.GameStatus === GAME_STATUS.PLAYING)) {
		newState = revealCellDerivation(action.payload, state);
	} else if (action.type === ACTIONS.FLAG_CELL && (state.GameStatus === GAME_STATUS.INIT || state.GameStatus === GAME_STATUS.PLAYING)) {
		newState = flagCellDerivation(action.payload, state);
	} else {
	}

	return newState;
};

const store = createStore(rootReducer);

export default store;
export { CELL_STATUS, RevealCell, FlagCell };