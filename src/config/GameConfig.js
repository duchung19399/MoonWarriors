

var MW = MW || {};

//game state
MW.GAME_STATE = {
    HOME:0,
    PLAY:1,
    OVER:2
};

//keys
MW.KEYS = [];

//level
MW.LEVEL = {
    STAGE1:1,
    STAGE2:2,
    STAGE3:3
};

//life
MW.LIFE = 4;

//score
MW.SCORE = 0;

//sound
MW.SOUND = true;

//enemy move type
MW.ENEMY_MOVE_TYPE = {
    ATTACK:0,
    VERTICAL:1,
    HORIZONTAL:2,
    OVERLAP:3,
    TRIANGLE:4,
    DOUBLE:5
};

//delta x
MW.DELTA_X = -100;

//offset x
MW.OFFSET_X = -24;

//rot
MW.ROT = -5.625;

//bullet type
MW.BULLET_TYPE = {
    PLAYER:1,
    ENEMY:2
};

//weapon type
MW.WEAPON_TYPE = {
    ONE:1
};

MW.ITEM_TYPE = {
    POWER:0,
    LIFE:1,
    HEAL:2,
    BULLET:3
};

//unit tag
MW.UNIT_TAG = {
    ENEMY_BULLET:900,
    PLAYER_BULLET:901,
    ITEM:950,
    ENEMY:1000,
    PLAYER:1000
};

//attack mode
MW.ENEMY_ATTACK_MODE = {
    NORMAL:0,
    DISPERSAL:1
};

//life up sorce
MW.LIFEUP_SORCE = [50000, 100000, 150000, 200000, 250000, 300000];

//container
MW.CONTAINER = {
    ENEMIES:[],
    ENEMY_BULLETS:[],
    PLAYER_BULLETS:[],
    ITEM:[]
};

//bullet speed
MW.BULLET_SPEED = {
    ENEMY:[0,-200],
    SHIP:[0,600]
};
// the counter of active enemies
MW.ACTIVE_ENEMIES = 0;

MW.LOGOY = 350;
MW.FLAREY = 445;
MW.SCALE = 1.5;
MW.WIDTH = 480;
MW.HEIGHT = 720;
MW.FONTCOLOR = "#1f2d96";
MW.menuHeight = 36;
MW.menuWidth = 123;