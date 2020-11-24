import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { connect, Provider } from 'react-redux';
import MineSweeperStore, {
	CELL_STATUS,
	MINE,
	FLAG,
	ActionBuilders,
	BOARD_SIZES,
	GAME_STATUS
} from './Minesweeper-redux';

import './Minesweeper.scss';

const CELL_DISPLAY_VALUE = {
	1: '1️⃣',
	2: '2️⃣',
	3: '3️⃣',
	4: '4️⃣',
	5: '5️⃣',
	6: '6️⃣',
	7: '7️⃣',
	8: '8️⃣'
};
CELL_DISPLAY_VALUE[MINE] = '💣';
CELL_DISPLAY_VALUE[FLAG] = '🚩';

const GAME_STATUS_DISPLAY_VALUE = {};
GAME_STATUS_DISPLAY_VALUE[GAME_STATUS.INIT] = '🟢';
GAME_STATUS_DISPLAY_VALUE[GAME_STATUS.PLAYING] = '🟢 Playing';
GAME_STATUS_DISPLAY_VALUE[GAME_STATUS.WIN] = '🕊 Win!';
GAME_STATUS_DISPLAY_VALUE[GAME_STATUS.FAIL] = ' 😱 Fail';

const ConnectedStatusBar = ({ Flagged, GameStatus, NewGame, ChangeBoardSize }) => {
	const [changeSizeMenuAnchor, setChangeSizeMenuAnchor] = useState(null);
	return <Container className='status-bar'>
		<Container className='game-status'>
			<div className='flag'>
				<Container className='flag-content'>
					{`🚩: ${Flagged}`}
				</Container>
			</div>
			{GAME_STATUS_DISPLAY_VALUE[GameStatus]}
		</Container>
		<Container className='game-controls'>
			<Button color='primary' onClick={() => {
				NewGame();
			}}>
				🔄 New Game
		</Button>
			<Button onClick={(event) => {
				setChangeSizeMenuAnchor(event.currentTarget);
			}}>
				Change game size
		</Button>
			<Menu keepMounted anchorEl={changeSizeMenuAnchor} open={Boolean(changeSizeMenuAnchor)}>
				<MenuItem onClick={() => {
					ChangeBoardSize(BOARD_SIZES.SMALL);
					setChangeSizeMenuAnchor(null);
				}}>Small</MenuItem>
				<MenuItem onClick={() => {
					ChangeBoardSize(BOARD_SIZES.MEDIUM);
					setChangeSizeMenuAnchor(null);
				}}>Medium</MenuItem>
				<MenuItem onClick={() => {
					ChangeBoardSize(BOARD_SIZES.LARGE);
					setChangeSizeMenuAnchor(null);
				}}>Large</MenuItem>
			</Menu>
		</Container>
	</Container>;
};
const StatusBar = connect((state) => {
	return { ...state };
}, {
	NewGame: ActionBuilders.NewGame,
	ChangeBoardSize: ActionBuilders.ChangeBoardSize
})(ConnectedStatusBar);

const Cell = (props) => {
	const {
		cell,
		RevealCell,
		FlagCell,
		cellSize
	} = props;
	const {
		surroundingMines,
		cellRow: row,
		cellCol: col,
		status,
		displayValue
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
			{CELL_DISPLAY_VALUE[displayValue]}
		</div>
	</div>;
	return <div>{element}</div>;

	/*
	 * return <Tooltip title={ surroundingMines === -1 ? 'true' : 'false'} key={`${row} ${col}`}>
	 * 	{element}
	 * </Tooltip>;
	 */
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
	RevealCell: ActionBuilders.RevealCell,
	FlagCell: ActionBuilders.FlagCell
})(ConnectedBoard);

const MineSweeper = () => {
	return <Provider store={MineSweeperStore}>
		<Container className='minesweeper'>
			<StatusBar />
			<Board />
		</Container>
	</Provider>;
};

export default MineSweeper;