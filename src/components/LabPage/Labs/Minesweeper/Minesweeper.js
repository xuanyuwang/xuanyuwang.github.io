import React, { useState, useEffect } from 'react';
import Container from '@material-ui/core/Container';
import Tooltip from '@material-ui/core/Tooltip';

import './Minesweeper.scss';

const BOARD_SIZES = {
	SMALL: 'small',
	MEDIUM: 'meidum',
	LARGE: 'large'
};
const getBoardSpec = (size) => {
	const specs = {
		[BOARD_SIZES.SMALL]: {
			row: 9,
			col: 9,
			mines: 10
		},
		[BOARD_SIZES.MEDIUM]: {
			row: 16,
			col: 16,
			mines: 40
		},
		[BOARD_SIZES.LARGE]: {
			row: 16,
			col: 30,
			mines: 99
		}
	};
	return size && BOARD_SIZES[size] ? specs[size] : specs[BOARD_SIZES.SMALL];
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

const ACTIONS = {
	LEFT_CLICK: 'left-click',
	RIGHT_CLICK: 'right-click'
};
function locateMines(size) {
	const { row, col, mines } = size;
	const mineIndices = [];
	let cellIndices = [];
	for (let i = 0; i < row * col; i++) {
		cellIndices.push(i);
	}
	while (mineIndices.length < mines) {
		const index = Math.floor(Math.random() * cellIndices.length);
		const cellOrder = cellIndices[index];
		mineIndices.push({ row: Math.floor(cellOrder / col), col: cellOrder % row, order: cellOrder });
		cellIndices.splice(index, 1);
	}
	return mineIndices;
};

const useCellsInfo = (mineIndices, boardRow, boardCol) => {
	const mineCount = [];
	for (let i = 0; i < boardRow * boardCol; i++) {
		mineCount.push({
			surrondingMines: 0,
			displayValue: '',
			status: CELL_STATUS.COVERED
		});
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
				mineCount[neighborIndex].surrondingMines += 1;
			}
		});
	});
	mineIndices.forEach((mineIndex) => {
		const { row: mineRow, col: mineCol } = mineIndex;
		mineCount[mineRow * boardCol + mineCol].surrondingMines = -1;
	})

	return mineCount;
};
const StatusBar = (props) => {
	const { flags, gameStatus } = props;
	return <Container className='status-bar'>
		<div className='flag'>
			{/* <Container className='flag-content'>
				<Container className='flag-icon'>Flag: </Container>
				<Container className='flag-number'>{flags}</Container>
			</Container> */}
		</div>
		<Container className='game-status'>
			{gameStatus}
		</Container>
	</Container>;
};
const Cell = (props) => {
	const {
		row,
		col,
		value,
		isMine,
		cellSize,
		status,
		onAction
	} = props;
	let className = `cell ${(row + col) % 2 === 0 ? 'odd' : 'even'}`;
	className += status === CELL_STATUS.COVERED ? '' : ' touched';
	return <Tooltip title={isMine ? 'true' : 'false'} key={`${row} ${col}`}>
		<div
			row={row + 1}
			col={col + 1}
			ismine={isMine ? 'true' : 'false'}
			key={`${row} ${col}`}
			className={className}
			style={{
				gridColumn: col + 1,
				gridRow: row + 1,
				width: `${cellSize}px`,
				height: `${cellSize}px`
			}}
			onClick={(event) => {
				event.preventDefault();
				onAction(row, col, ACTIONS.LEFT_CLICK);
			}}
			onContextMenu={(event) => {
				event.preventDefault();
				onAction(row, col, ACTIONS.RIGHT_CLICK);
			}}
		>
			<div>
				{value}
			</div>
		</div>
	</Tooltip>;
};
const Board = (props) => {
	const { size, gameStatus, setGameStatus } = props;
	const { row, col, mines } = size;

	const [mineIndices] = useState(locateMines(size));
	// { surrondingMines, displayValue, status }
	const [cellsInfo, setCellsInfo] = useState(useCellsInfo(mineIndices, row, col));

	const [markedMines, setMarkedMines] = useState(0);
	const [remainCells, setRemainCells] = useState(row * col);
	const [stepOnMine, setStepOnMine] = useState(false);

	useEffect(() => {
		if (stepOnMine){
			if (gameStatus !== GAME_STATUS.FAIL){
				setGameStatus(GAME_STATUS.FAIL);
			}
		} else if (markedMines === mines && remainCells === 0) {
			if (gameStatus !== GAME_STATUS.WIN) {
				setGameStatus(GAME_STATUS.WIN);
			}
		}else if (remainCells < row * col && !stepOnMine) {
			if (gameStatus !== GAME_STATUS.PLAYING) {
				setGameStatus(GAME_STATUS.PLAYING);
			}
		}else{
			if (gameStatus !== GAME_STATUS.INIT){
				setGameStatus(GAME_STATUS.INIT);
			}
		}
	});

	const onAction = (cellRow, cellCol, action) => {
		if (gameStatus === GAME_STATUS.FAIL || gameStatus === GAME_STATUS.WIN){
			return;
		}
		const cellOrder = cellRow * row + cellCol;
		const cellInfo = cellsInfo[cellOrder];
		if (action === ACTIONS.LEFT_CLICK){
			if (cellInfo.status === CELL_STATUS.COVERED){
				const newCellInfo = {};
				if (cellInfo.surrondingMines === -1){
					newCellInfo.displayValue = 'm';
				}else{
					if (cellInfo.surrondingMines === 0){
						cellInfo.displayValue = '';
					}else{
						cellInfo.displayValue = cellInfo.surrondingMines;
					}
				}
				newCellInfo.status = CELL_STATUS.UNCOVERED;

				setCellsInfo(() => {
					Object.assign(cellsInfo[cellOrder], newCellInfo);
					return cellsInfo;
				});

				setRemainCells(() => {
					return remainCells - 1;
				});
				
				if (newCellInfo.displayValue === 'm'){
					setStepOnMine(true);
				}
			}
		} else if (action === ACTIONS.RIGHT_CLICK){
			if (cellInfo.status === CELL_STATUS.COVERED){
				const newCellInfo = {};
				newCellInfo.displayValue = 'f';
				newCellInfo.status = CELL_STATUS.FLAGGED;

				setCellsInfo(() => {
					Object.assign(cellsInfo[cellOrder], newCellInfo);
					return cellsInfo;
				});

				setRemainCells(() => {
					return remainCells - 1;
				});

				if (cellInfo.surrondingMines === -1){
					setMarkedMines(() => {
						return markedMines - 1;
					});
				}
			}
		}
	};

	const cells = [];
	const cellSize = 32;
	for (let i = 0; i < row; i++) {
		for (let j = 0; j < col; j++) {
			const cellInfo = cellsInfo[i * row + j];
			cells.push(Cell({
				row: i,
				col: j,
				value: cellInfo.displayValue,
				isMine: cellInfo.surrondingMines === -1,
				cellSize,
				status: cellInfo.status,
				onAction
			}));
		}
	}
	return <div>
		<Container className='board' style={{
			width: `${col * cellSize}px`,
			height: `${row * cellSize}px`,
			gridTemplateColumns: `repeat(${col}, ${cellSize}px)`,
			gridTemplateRows: `repeat(${row} ${cellSize}px)`
		}}>
			{cells}
		</Container>
		{/* <div>{
			`remain cells: ${remainCells}, marked mines: ${markedMines}`
		}</div> */}
	</div>;
};
const Game = () => {
	const [size, setSize] = useState(getBoardSpec());
	const [gameStatus, setGameStatus] = useState(GAME_STATUS.INIT);
	return <Container
		className='game'
	>
		{StatusBar({ gameStatus })}
		{Board({ size, gameStatus, setGameStatus })}
	</Container>;
};
const MineSweeper = () => {
	const game = Game();
	return <Container className='minesweeper'>
		{game}
	</Container>;
};

export default MineSweeper;