

var Enemy = cc.Sprite.extend({
    eID:0,
    enemyType:1,
    active:true,
    speed:200,
    bulletSpeed:MW.BULLET_SPEED.ENEMY,
    HP:15,
    bulletPowerValue:1,
    moveType:null,
    scoreValue:200,
    zOrder:1000,
    delayTime:1 + 1.2 * Math.random(),
    attackMode:MW.ENEMY_MOVE_TYPE.NORMAL,
    _hurtColorLife:0,
    ctor:function (arg) {
        this._super("#"+arg.textureName);
        if (arg.textureName !== "E4.png")
            this.flippedY = true;

        this.HP = arg.HP;
        this.moveType = arg.moveType;
        this.scoreValue = arg.scoreValue;
        this.attackMode = arg.attackMode;
        this.enemyType = arg.type;
        this.schedule(this.shoot, this.delayTime);
    },
    _timeTick:0,
    update:function (dt) {
        var x = this.x;
	    var y = this.y;
        if ((x < 0 || x > MW.WIDTH) && (y < 0 || y > MW.HEIGHT)) {
            this.active = false;
        }
        this._timeTick += dt;
        if (this._timeTick > 0.1) {
            this._timeTick = 0;
            if (this._hurtColorLife > 0) {
                this._hurtColorLife--;
            }
        }

        if (x < 0 || x > g_sharedGameLayer.screenRect.width || y < 0 || y > g_sharedGameLayer.screenRect.height || this.HP <= 0) {
            this.active = false;
            this.destroy();
        }

    },
    destroy:function () {
        MW.SCORE += this.scoreValue;

        this.visible = false;
        this.active = false;
        this.stopAllActions();
        this.unschedule(this.shoot);
        MW.ACTIVE_ENEMIES--;
    },
    shoot:function () {
        var x = this.x, y = this.y;
        var speed = -Math.sqrt(this.bulletSpeed[0]*this.bulletSpeed[0]+this.bulletSpeed[1]*this.bulletSpeed[1]);
        switch (this.attackMode) {
            case MW.ENEMY_ATTACK_MODE.NORMAL:
                var b = Bullet.getOrCreateBullet(this.bulletSpeed, "W2.png", this.attackMode, 3000, MW.UNIT_TAG.ENEMY_BULLET);
                b.x = x;
                b.y = y - this.height * 0.2;
                break;
            case MW.ENEMY_ATTACK_MODE.DISPERSAL:
                var velocity = [[-speed * 3/5, speed * 4/5], [0, speed], [speed * 3/5, speed * 4/5]];
                var b1 = Bullet.getOrCreateBullet(velocity[0], "W2.png", this.attackMode, 3000, MW.UNIT_TAG.ENEMY_BULLET);
                b1.x = x;
                b1.y = y - this.height * 0.2;
                var b2 = Bullet.getOrCreateBullet(velocity[1], "W2.png", this.attackMode, 3000, MW.UNIT_TAG.ENEMY_BULLET);
                b2.x = x;
                b2.y = y - this.height * 0.2;
                var b3 = Bullet.getOrCreateBullet(velocity[2], "W2.png", this.attackMode, 3000, MW.UNIT_TAG.ENEMY_BULLET);
                b3.x = x;
                b3.y = y - this.height * 0.2;
                break;
        }
    },
    hurt:function (dmg) {
        this._hurtColorLife = 2;
        this.HP-=dmg;
    },
    collideRect:function (x, y) {
        var w = this.width, h = this.height;
        return cc.rect(x - w / 2, y - h / 4, w, h / 2+20);
    }
});

Enemy.getOrCreateEnemy = function (arg) {
    var selChild = null;
    for (var j = 0; j < MW.CONTAINER.ENEMIES.length; j++) {
        selChild = MW.CONTAINER.ENEMIES[j];

        if (selChild.active === false && selChild.enemyType === arg.enemyType) {
            selChild.HP = arg.HP;
            selChild.active = true;
            selChild.moveType = arg.moveType;
            selChild.scoreValue = arg.scoreValue;
            selChild.attackMode = arg.attackMode;
            selChild._hurtColorLife = 0;

            selChild.schedule(selChild.shoot, selChild.delayTime);
            selChild.visible = true;
            MW.ACTIVE_ENEMIES++;
            return selChild;
        }
    }
    selChild = Enemy.create(arg);
    MW.ACTIVE_ENEMIES++;
    return selChild;
};

Enemy.create = function (arg) {
    var enemy = new Enemy(arg);
    g_sharedGameLayer.addEnemy(enemy, enemy.zOrder, MW.UNIT_TAG.ENEMY);
    MW.CONTAINER.ENEMIES.push(enemy);
    return enemy;
};

Enemy.preSet = function () {
    var enemy = null;
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < EnemyType.length; j++) {
            enemy = Enemy.create(EnemyType[j]);
            enemy.visible = false;
            enemy.active = false;
            enemy.stopAllActions();
            enemy.unscheduleAllCallbacks();
        }
    }
};
