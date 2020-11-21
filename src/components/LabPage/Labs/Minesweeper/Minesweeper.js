import React, { useState, useEffect } from 'react';
import Container from '@material-ui/core/Container';

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

function locateMines(size) {
	const {row, col, mines } = size;
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

const useCellNumbers = (mineIndices, boardRow, boardCol) => {
	const mineCount = [];
	for (let i = 0; i < boardRow * boardCol; i++) {
		mineCount.push(0);
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
				mineCount[neighborIndex] += 1;
			}
		});
	});
	mineIndices.forEach((mineIndex) => {
		const { row: mineRow, col: mineCol } = mineIndex;
		mineCount[mineRow * boardCol + mineCol] = -1;
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
		number,
		cellSize,
		setMarkedMines,
		setRemainCells,
		setStepOnMine
	} = props;
	const isMine = number === -1;
	const [cellStatus, setCellStatus] = useState(CELL_STATUS.COVERED);
	const className = `cell ${(row + col) % 2 === 0 ? 'odd' : 'even'}`;
	let displayValue = '';
	if (cellStatus === CELL_STATUS.FLAGGED) {
		displayValue = 'F';
	} else if (cellStatus === CELL_STATUS.UNCOVERED) {
		if (isMine) {
			displayValue = 'b';
		} else {
			displayValue = number;
		}
	}
	return <div
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
			setCellStatus(CELL_STATUS.UNCOVERED);
			setRemainCells((number) => {
				return number - 1
			});
			if (isMine) {
				setStepOnMine(true);
			}
		}}
		onContextMenu={(event) => {
			event.preventDefault();
			if (cellStatus === CELL_STATUS.COVERED) {
				setCellStatus(CELL_STATUS.FLAGGED);
				if (isMine) {
					setMarkedMines((number) => {
						return number + 1;
					});
				}
			} else if (cellStatus === CELL_STATUS.FLAGGED) {
				setCellStatus(CELL_STATUS.COVERED);
			}
		}}
	>
		<div>
			{displayValue}
		</div>
	</div>;
};
const Board = (props) => {
	const { size, setGameStatus } = props;
	const {row, col, mines } = size;

	const [mineIndices] = useState(locateMines(size));
	const cellNumbers = useCellNumbers(mineIndices, row, col);

	const [markedMines, setMarkedMines] = useState(0);
	const [remainCells, setRemainCells] = useState(row * col);
	const [stepOnMine, setStepOnMine] = useState(false);

	useEffect(() => {
		if(remainCells < row * col && !stepOnMine){
			setGameStatus(GAME_STATUS.PLAYING);
		}else if(stepOnMine){
			setGameStatus(GAME_STATUS.FAIL);
		}else if(markedMines === mines && remainCells === 0 ){
			setGameStatus(GAME_STATUS.WIN);
		}
	});

	const cells = [];
	const cellSize = 32;
	for (let i = 0; i < row; i++) {
		for (let j = 0; j < col; j++) {
			cells.push(Cell({
				row: i,
				col: j,
				number: cellNumbers[i * row + j],
				cellSize,
				setMarkedMines,
				setRemainCells,
				setStepOnMine
			}));
		}
	}
	return <Container className='board' style={{
		width: `${col * cellSize}px`,
		height: `${row * cellSize}px`,
		gridTemplateColumns: `repeat(${col}, ${cellSize}px)`,
		gridTemplateRows: `repeat(${row} ${cellSize}px)`
	}}>
		{cells}
	</Container>;
};
const Game = () => {
	const [size, setSize] = useState(getBoardSpec());
	const [gameStatus, setGameStatus] = useState(GAME_STATUS.INIT);
	return <Container
		className='game'
	>
		{StatusBar({ gameStatus })}
		{Board({ size, setGameStatus })}
	</Container>;
};
const MineSweeper = () => {
	const game = Game();
	return <Container className='minesweeper'>
		{game}
	</Container>;
};

export default MineSweeper;