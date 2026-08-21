export const PLAYER_TEXTURE_KEY =
  "cozy-world-player";

export const PLAYER_ASSET_PATH =
  "/cozy-world/player/player.svg";

export const PLAYER_TEXTURE_WIDTH = 48;
export const PLAYER_TEXTURE_HEIGHT = 64;
export const PLAYER_COLLIDER_RADIUS = 18;
export const PLAYER_COLLIDER_OFFSET_X = 6;
export const PLAYER_COLLIDER_OFFSET_Y = 27;

export const COTTAGE_TEXTURE_KEY =
  "cozy-world-cottage";

export const COTTAGE_ASSET_PATH =
  "/cozy-world/scenery/cottage.svg";

export const TREE_TEXTURE_KEY =
  "cozy-world-autumn-tree";

export const TREE_ASSET_PATH =
  "/cozy-world/scenery/autumn-tree.svg";

export const COTTAGE_RUG_TEXTURE_KEY =
  "cozy-world-cottage-rug";

export const COTTAGE_RUG_ASSET_PATH =
  "/cozy-world/scenery/cottage-rug.svg";

export const COTTAGE_TABLE_TEXTURE_KEY =
  "cozy-world-cottage-table";

export const COTTAGE_TABLE_ASSET_PATH =
  "/cozy-world/scenery/cottage-table.svg";

export const DEBUG_PHYSICS = import.meta.env.DEV;
export const UI_DEPTH = 2000;

export const WORLD_WIDTH = 1200;
export const WORLD_HEIGHT = 800;

export const COTTAGE_X = WORLD_WIDTH / 2;
export const COTTAGE_Y = WORLD_HEIGHT / 2;
export const COTTAGE_BASE_Y = COTTAGE_Y + 55;

export const CLEARING_SCENE_KEY = "clearing";
export const COTTAGE_SCENE_KEY = "cottage";

export const COTTAGE_ENTRANCE_WIDTH = 70;
export const COTTAGE_ENTRANCE_HEIGHT = 48;
export const COTTAGE_ENTRANCE_Y = COTTAGE_Y + 115;

export const LEFT_TREE_X = COTTAGE_X - 300;
export const LEFT_TREE_TRUNK_Y = COTTAGE_Y - 100;
export const LEFT_TREE_BASE_Y = LEFT_TREE_TRUNK_Y + 50;
export const RIGHT_TREE_X = COTTAGE_X + 260;
export const RIGHT_TREE_TRUNK_Y = COTTAGE_Y - 100;
export const RIGHT_TREE_BASE_Y = RIGHT_TREE_TRUNK_Y + 55;

const PLAYER_COLLIDER_TOP_FROM_FEET =
  PLAYER_TEXTURE_HEIGHT - PLAYER_COLLIDER_OFFSET_Y;

const COTTAGE_RETURN_CLEARANCE = 24;

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
  PLAYER_COLLIDER_TOP_FROM_FEET +
  COTTAGE_RETURN_CLEARANCE;
