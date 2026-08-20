export const DEBUG_PHYSICS = import.meta.env.DEV;

export const WORLD_WIDTH = 1200;
export const WORLD_HEIGHT = 800;

export const COTTAGE_X = WORLD_WIDTH / 2;
export const COTTAGE_Y = WORLD_HEIGHT / 2;

export const CLEARING_SCENE_KEY = "clearing";
export const COTTAGE_SCENE_KEY = "cottage";

export const COTTAGE_ENTRANCE_WIDTH = 70;
export const COTTAGE_ENTRANCE_HEIGHT = 48;
export const COTTAGE_ENTRANCE_Y = COTTAGE_Y + 115;

export const LEFT_TREE_X = COTTAGE_X - 300;
export const LEFT_TREE_TRUNK_Y = COTTAGE_Y - 100;
export const RIGHT_TREE_X = COTTAGE_X + 260;
export const RIGHT_TREE_TRUNK_Y = COTTAGE_Y - 100;

export const PLAYER_RADIUS = 18;

export const COTTAGE_ROOM_WIDTH = 720;
export const COTTAGE_ROOM_HEIGHT = 520;
export const COTTAGE_ROOM_CENTER_X = COTTAGE_ROOM_WIDTH / 2;
export const COTTAGE_ROOM_CENTER_Y = COTTAGE_ROOM_HEIGHT / 2;

export const COTTAGE_PLAYER_SPAWN_X = COTTAGE_ROOM_CENTER_X;
export const COTTAGE_PLAYER_SPAWN_Y =
  COTTAGE_ROOM_CENTER_Y + 120;

export const COTTAGE_EXIT_WIDTH = 90;
export const COTTAGE_EXIT_HEIGHT = 36;
export const COTTAGE_EXIT_Y =
  COTTAGE_ROOM_HEIGHT - COTTAGE_EXIT_HEIGHT / 2;

export const CLEARING_RETURN_X = COTTAGE_X;
export const CLEARING_RETURN_Y =
  COTTAGE_ENTRANCE_Y +
  COTTAGE_ENTRANCE_HEIGHT / 2 +
  PLAYER_RADIUS +
  24;
