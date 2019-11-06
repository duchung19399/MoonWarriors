

var Ship = cc.Sprite.extend({
    speed:220,
    bulletSpeed:MW.BULLET_SPEED.SHIP,
    HP:5,
    bulletTypeValue:1,
    bulletPowerValue:1,
    numberBulletLine:1,
    canBeAttack:true,
    zOrder:3000,
    maxBulletPowerValue:4,
    maxNumberBulletLine:3,
    appearPosition:cc.p(160, 60),
    _hurtColorLife:0,
    active:true,
    bornSprite:null,
    ctor:function () {
        this._super("#ship01.png");
        this.tag = this.zOrder;
        this.x = this.appearPosition.x;
	    this.y = this.appearPosition.y;

        // set frame
        var frame0 = cc.spriteFrameCache.getSpriteFrame("ship01.png");
        var frame1 = cc.spriteFrameCache.getSpriteFrame("ship02.png");

        var animFrames = [];
        animFrames.push(frame0);
        animFrames.push(frame1);

        // ship animate
        var animation = new cc.Animation(animFrames, 0.1);
        var animate = cc.animate(animation);
        this.runAction(animate.repeatForever());
        this.schedule(this.shoot, 1 / 6);

        this.initBornSprite();
        this.born();
    },
    update:function (dt) {
        this.updateMove(dt);

        if (this.HP <= 0) {
            this.active = false;
            this.destroy();
        }
        this._timeTick += dt;
        if (this._timeTick > 0.1) {
            this._timeTick = 0;
            if (this._hurtColorLife > 0) {
                this._hurtColorLife--;
            }
        }
    },
    updateMove:function(dt)
    {
        if ((MW.KEYS[cc.KEY.w] || MW.KEYS[cc.KEY.up]) && this.y <= winSize.height) {
            this.y += dt * this.speed;
        }
        if ((MW.KEYS[cc.KEY.s] || MW.KEYS[cc.KEY.down]) && this.y >= 0) {
            this.y -= dt * this.speed;
        }
        if ((MW.KEYS[cc.KEY.a] || MW.KEYS[cc.KEY.left]) && this.x >= 0) {
            this.x -= dt * this.speed;
        }
        if ((MW.KEYS[cc.KEY.d] || MW.KEYS[cc.KEY.right]) && this.x <= winSize.width) {
            this.x += dt * this.speed;
        }
    },
    shoot:function () {
        var offset = 27;
        switch (this.numberBulletLine) {
            case 1:
                var a = Bullet.getOrCreateBullet(this.bulletSpeed, "W1.png", MW.ENEMY_ATTACK_MODE.NORMAL, 3000, MW.UNIT_TAG.PLAYER_BULLET);
                a.x = this.x ;
                a.y = this.y + 3 + this.height * 0.3;
                break;

            case 2:
                var b0 = Bullet.getOrCreateBullet(this.bulletSpeed, "W1.png", MW.ENEMY_ATTACK_MODE.NORMAL, 3000, MW.UNIT_TAG.PLAYER_BULLET);
                b0.x = this.x + offset;
                b0.y = this.y + 3 + this.height * 0.3;

                var b1 = Bullet.getOrCreateBullet(this.bulletSpeed, "W1.png", MW.ENEMY_ATTACK_MODE.NORMAL, 3000, MW.UNIT_TAG.PLAYER_BULLET);
                b1.x = this.x - offset;
                b1.y = this.y + 3 + this.height * 0.3;

                break;
            case 3:
                var c0 = Bullet.getOrCreateBullet(this.bulletSpeed, "W1.png", MW.ENEMY_ATTACK_MODE.NORMAL, 3000, MW.UNIT_TAG.PLAYER_BULLET);
                c0.x = this.x + offset;
                c0.y = this.y + 3 + this.height * 0.3;

                var c1 = Bullet.getOrCreateBullet(this.bulletSpeed, "W1.png", MW.ENEMY_ATTACK_MODE.NORMAL, 3000, MW.UNIT_TAG.PLAYER_BULLET);
                c1.x = this.x - offset;
                c1.y = this.y + 3 + this.height * 0.3;

                var c2 = Bullet.getOrCreateBullet(this.bulletSpeed, "W1.png", MW.ENEMY_ATTACK_MODE.NORMAL, 3000, MW.UNIT_TAG.PLAYER_BULLET);
                c2.x = this.x ;
                c2.y = this.y + 3 + this.height * 0.3;

                break;

        }
    },
    destroy:function () {
        MW.LIFE--;
    },
    hurt:function () {
        if (this.canBeAttack) {
            this._hurtColorLife = 2;
            this.HP--;
        }
    },
    boost:function (itemType) {
        switch (itemType) {
            case MW.ITEM_TYPE.HEAL:
                this.HP++;
                break;
            case MW.ITEM_TYPE.LIFE:
                MW.LIFE++;
                break;
            case MW.ITEM_TYPE.POWER:
                if(this.bulletPowerValue< this.maxBulletPowerValue){
                    this.bulletPowerValue++;
                }
                break;
            case MW.ITEM_TYPE.BULLET:
                if(this.numberBulletLine< this.maxNumberBulletLine){
                    this.numberBulletLine++;
                }
                break;
        }
    },
    collideRect:function (x, y) {
        var w = this.width, h = this.height;
        return cc.rect(x - w / 2, y - h / 2, w, h / 2);
    },
    initBornSprite:function () {
        this.bornSprite = new cc.Sprite("#ship03.png");
        this.bornSprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE);
        this.bornSprite.x = this.width / 2;
	    this.bornSprite.y = this.height / 2;
        this.bornSprite.visible = true;
        this.addChild(this.bornSprite, 3000, 99999);
    },
    born:function () {
        //revive effect
        this.canBeAttack = false;
        this.bornSprite.visible = true;
        this.bornSprite.scale = 8;
        this.bornSprite.runAction(cc.scaleTo(0.5, 1, 1));

        var blinks = cc.blink(3, 9); //3s 9 times
        var makeBeAttack = cc.callFunc(function (t) {
            t.canBeAttack = true;
            t.visible = true;
            t.bornSprite.visible = false;
        }.bind(this));
        this.runAction(cc.sequence(cc.delayTime(0.5), blinks, makeBeAttack));

        this.HP = 5;
        this._hurtColorLife = 0;
        this.active = true;
    }
});
