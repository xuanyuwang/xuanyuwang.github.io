import React from 'react';
import Container from '@material-ui/core/Container';
import Tooltip from '@material-ui/core/Tooltip';

import { connect, Provider } from 'react-redux';
import MineSweeperStore from './Minesweeper-redux';
import { CELL_STATUS, RevealCell, FlagCell } from './Minesweeper-redux';

import './Minesweeper.scss';

const ConnectedStatusBar = ({ GameStatus }) => {
	return <Container className='status-bar'>
		<div className='flag'>
			{/* <Container className='flag-content'>
				<Container className='flag-icon'>Flag: </Container>
				<Container className='flag-number'>{flags}</Container>
			</Container> */}
		</div>
		<Container className='game-status'>
			{GameStatus}
		</Container>
	</Container>;
};
const StatusBar = connect((state) => {
	return { ...state };
})(ConnectedStatusBar);

const Cell = (props) => {
	const {
		cell,
		RevealCell,
		FlagCell,
		cellSize,
	} = props;
	const {
		surroundingMines,
		cellRow: row,
		cellCol: col,
		status,
		displayValue: value
	} = cell;
	let className = `cell ${(row + col) % 2 === 0 ? 'odd' : 'even'}`;
	className += status === CELL_STATUS.COVERED ? '' : ' touched';
	const element = <div
		row={row + 1}
		col={col + 1}
		key={`${row} ${col}`}
		ismine={surroundingMines === -1 ? 'true' : 'false'}
		surroundingmines={surroundingMines}
		className={className}
		style={{
			gridColumn: col + 1,
			gridRow: row + 1,
			width: `${cellSize}px`,
			height: `${cellSize}px`
		}}
		onClick={(event) => {
			event.preventDefault();
			RevealCell(cell);
		}}
		onContextMenu={(event) => {
			event.preventDefault();
			FlagCell(cell);
		}}
	>
		<div>
			{value}
		</div>
	</div>;
	return <div>{element}</div>;
	// return <Tooltip title={ surroundingMines === -1 ? 'true' : 'false'} key={`${row} ${col}`}>
	// 	{element}
	// </Tooltip>;
};
const ConnectedBoard = (props) => {
	const { BoardRow, BoardCol, Cells, RevealCell, FlagCell } = props;
	const cellSize = 32;
	const cells = Cells.map((cell) => {
		return Cell({ cellSize: 32, RevealCell, FlagCell, cell });
	});

	return <div>
		<Container className='board' style={{
			width: `${BoardCol * cellSize}px`,
			height: `${BoardRow * cellSize}px`,
			gridTemplateColumns: `repeat(${BoardCol}, ${cellSize}px)`,
			gridTemplateRows: `repeat(${BoardRow} ${cellSize}px)`
		}}>
			{cells}
		</Container>
		{/* <div>{
			`remain cells: ${remainCells}, marked mines: ${markedMines}`
		}</div> */}
	</div>;
};
const Board = connect((state) => {
	return { ...state };
}, {
	RevealCell,
	FlagCell
})(ConnectedBoard);

const MineSweeper = () => {
	return <Provider store={MineSweeperStore}>
		<Container className='minesweeper'>
			<StatusBar/>
			<Board/>
		</Container>
	</Provider>;
};

export default MineSweeper;