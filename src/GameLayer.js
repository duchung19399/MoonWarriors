

STATE_PLAYING = 0;
STATE_GAMEOVER = 1;
MAX_CONTAINT_WIDTH = 40;
MAX_CONTAINT_HEIGHT = 40;

var g_sharedGameLayer;

var GameLayer = cc.Layer.extend({
    _time:null,
    _ship:null,
    _backSky:null,
    _backSkyHeight:0,
    _backSkyRe:null,
    _levelManager:null,
    _tmpScore:0,
    _isBackSkyReload:false,
    _isBackTileReload:false,
    lbScore:null,
    lbHP:null,
    screenRect:null,
    explosionAnimation:[],
    _beginPos:cc.p(0, 0),
    _state:STATE_PLAYING,
    _explosions:null,
    _texOpaqueBatch:null,
    _texTransparentBatch:null,

    ctor:function(){
        this._super();
        this.init();
    },
    init:function () {
        cc.spriteFrameCache.addSpriteFrames(res.textureOpaquePack_plist);
        cc.spriteFrameCache.addSpriteFrames(res.b01_plist);

        // reset global values
        MW.CONTAINER.ENEMIES = [];
        MW.CONTAINER.ENEMY_BULLETS = [];
        MW.CONTAINER.PLAYER_BULLETS = [];
        MW.CONTAINER.ITEM = [];

        MW.ACTIVE_ENEMIES = 0;

        MW.SCORE = 0;
        MW.LIFE = 4;
        this._state = STATE_PLAYING;

        // OpaqueBatch
        var texOpaque = cc.textureCache.addImage(res.textureOpaquePack_png);
        this._texOpaqueBatch = new cc.SpriteBatchNode(texOpaque);
        this.addChild(this._texOpaqueBatch);

        // TransparentBatch
        var texTransparent = cc.textureCache.addImage(res.textureTransparentPack_png);
        this._texTransparentBatch = new cc.SpriteBatchNode(texTransparent);
        this.addChild(this._texTransparentBatch);

        winSize = cc.director.getWinSize();
        this._levelManager = new LevelManager(this);

        //Thể hiện vùng máy máy bay có thể bay, khi bay ra ngoài -> phá hủy máy bay
        this.screenRect = cc.rect(0, 0, winSize.width, winSize.height + 10);

        // score
        this.lbScore = new cc.LabelBMFont("Score: 0", res.arial_14_fnt);
        this.lbScore.attr({
            anchorX: 1,
            anchorY: 0,
            x: winSize.width - 5,
            y: winSize.height - 30,
            scale: MW.SCALE
        });
        this.lbScore.textAlign = cc.TEXT_ALIGNMENT_LEFT;
        this.addChild(this.lbScore, 1000);

        // ship life
        var life = new cc.Sprite("#ship03.png");
        life.attr({
            scale: 0.6,
            x: 30,
            y: MW.HEIGHT - 30
        });
        this._texTransparentBatch.addChild(life, 1, 5);

        // ship Life/hp count
        this.lbLife = new cc.LabelTTF("LIFE: 0", "Arial", 18);
        this.lbLife.attr({
            anchorX:0,
            anchorY:0,
            x:75,
            y: MW.HEIGHT - 35,
            color: cc.color(0,255,0)
        });
        this.addChild(this.lbLife, 1000);

        this.lbHP = new cc.LabelTTF("HP: 0", "Arial", 18);
        this.lbHP.attr({
            anchorX:0,
            anchorY:0,
            x:75,
            y: MW.HEIGHT - 55,
            color: cc.color(0,255,0)
        });
        this.addChild(this.lbHP, 1000);

        // ship
        this._ship = new Ship();
        this._texTransparentBatch.addChild(this._ship, this._ship.zOrder, MW.UNIT_TAG.PLAYER);

        this.addTouchListener();
        this.addKeyboardListener();

        // schedule
        this.scheduleUpdate();
        this.schedule(this.scoreCounter, 1);

        g_sharedGameLayer = this;

        //pre set
        Bullet.preSet();
        Enemy.preSet();
        Item.preSet();

        this.initBackground();

        return true;
    },
    addTouchListener:function(){
        var self = this;
        cc.eventManager.addListener({
            preTouchId:-1,
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesMoved: function (touches, event) {
                cc.log("touch moved!", touches[0].getDelta().x, touches[0].getDelta().y);
                var moved = touches[0].getDelta();
                self._ship.x += moved.x;
                self._ship.y += moved.y;
            }
        }, this);
    },
    addKeyboardListener:function(){
        if(cc.sys.capabilities.hasOwnProperty('keyboard'))
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    MW.KEYS[key] = true;
                },
                onKeyReleased: function (key, event) {
                    MW.KEYS[key] = false;
                }
            },this);
    },
    scoreCounter:function () {
        if (this._state === STATE_PLAYING) {
            this._time++;
            this._levelManager.loadLevelResource(this._time, this._tmpScore);
        }
    },


    update:function (dt) {
        if (this._state == STATE_PLAYING) {
            this.checkIsCollide();
            this.removeInactiveUnit(dt);
            this.checkIsReborn();
            this.updateUI();
        }
    },
    checkIsCollide:function () {
        var selChild, bulletChild;
        // check collide
        var i, locShip =this._ship;
        for (i = 0; i < MW.CONTAINER.ENEMIES.length; i++) {
            selChild = MW.CONTAINER.ENEMIES[i];
            if (!selChild.active)
                continue;

            for (var j = 0; j < MW.CONTAINER.PLAYER_BULLETS.length; j++) {
                bulletChild = MW.CONTAINER.PLAYER_BULLETS[j];
                if (bulletChild.active && this.collide(selChild, bulletChild)) {
                    bulletChild.hurt();
                    selChild.hurt(this._ship.bulletPowerValue);
                }
            }
            if (this.collide(selChild, locShip)) {
                if (locShip.active) {
                    selChild.hurt();
                    locShip.hurt();
                }
            }
        }

        for (i = 0; i < MW.CONTAINER.ENEMY_BULLETS.length; i++) {
            selChild = MW.CONTAINER.ENEMY_BULLETS[i];
            if (selChild.active && this.collide(selChild, locShip)) {
                if (locShip.active) {
                    selChild.hurt();
                    locShip.hurt();
                }
            }
        }
        for (i = 0; i < MW.CONTAINER.ITEM.length; i++) {
            selChild = MW.CONTAINER.ITEM[i];
            if (selChild.active && this.collide(selChild, locShip)) {
                if(locShip.active) {
                    selChild.destroy();
                    locShip.boost(selChild.itemType);
                }
            }
        }
    },
    removeInactiveUnit:function (dt) {
        var i, selChild, children = this._texOpaqueBatch.children;
        for (i in children) {
            selChild = children[i];
            if (selChild && selChild.active)
                selChild.update(dt);
        }

        children = this._texTransparentBatch.children;
        for (i in children) {
            selChild = children[i];
            if (selChild && selChild.active)
                selChild.update(dt);
        }
    },
    checkIsReborn:function () {
        var locShip = this._ship;
        if (MW.LIFE > 0 && !locShip.active) {
            locShip.born();
        } else if (MW.LIFE <= 0 && !locShip.active) {
            this._state = STATE_GAMEOVER;
            this._ship = null;
            this.runAction(cc.sequence(
                cc.delayTime(0.2),
                cc.callFunc(this.onGameOver, this)
            ));
        }
    },
    updateUI:function () {
        //Diem tang dan dan
        if (this._tmpScore < MW.SCORE) {
            this._tmpScore += 1;
        }
        this.lbLife.setString("LIFE: " + MW.LIFE + '');
        this.lbHP.setString("HP: " + this._ship.HP);
        this.lbScore.setString("Score: " + this._tmpScore);
    },
    collide:function (a, b) {
	    var ax = a.x, ay = a.y, bx = b.x, by = b.y;
        if (Math.abs(ax - bx) > MAX_CONTAINT_WIDTH || Math.abs(ay - by) > MAX_CONTAINT_HEIGHT)
            return false;

        var aRect = a.collideRect(ax, ay);
        var bRect = b.collideRect(bx, by);
        return cc.rectIntersectsRect(aRect, bRect);
    },
    initBackground:function () {
        var sp = new cc.Sprite(res.loading_png);
        sp.attr({
            anchorX:0,
            anchorY:0,
            scale:MW.SCALE
        });
        this.addChild(sp,-1,5);
    },

    onGameOver:function () {
        var scene = new cc.Scene();
        scene.addChild(new GameOver());
	    cc.director.runScene(new cc.TransitionFade(1.2, scene));
    }
});

GameLayer.scene = function () {
    var scene = new cc.Scene();
    var layer = new GameLayer();
    scene.addChild(layer, 1);
    return scene;
};

GameLayer.prototype.addEnemy = function (enemy, z, tag) {
    this._texTransparentBatch.addChild(enemy, z, tag);
};

GameLayer.prototype.addBullet = function (bullet, zOrder, mode) {
    this._texOpaqueBatch.addChild(bullet, zOrder, mode);
};

GameLayer.prototype.addItem = function (item, zOrder, mode) {
    this.addChild(item,zOrder,mode);
};
