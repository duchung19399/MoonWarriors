
var LevelManager = cc.Class.extend({
    _currentLevel:null,
    _gameLayer:null,
    ctor:function(gameLayer){
        if(!gameLayer){
            throw "gameLayer must be non-nil";
        }
        this._currentLevel = Level1;
        this._gameLayer = gameLayer;
        this.setLevel(this._currentLevel);
    },
    // Format time from str -> int
    setLevel:function(level){
        var locCurrentLevelEnemies = this._currentLevel.enemies;
        for(var i = 0; i< level.enemies.length; i++)
            locCurrentLevelEnemies[i].ShowTime = this._minuteToSecond(locCurrentLevelEnemies[i].ShowTime);
    },
    _minuteToSecond:function(minuteStr){
        if(!minuteStr)
            return 0;
        if(typeof(minuteStr) !=  "number"){
            var mins = minuteStr.split(':');
            if(mins.length == 1){
                return parseInt(mins[0],10);
            }else {
                return parseInt(mins[0],10 )* 60 + parseInt(mins[1],10);
            }
        }
        return minuteStr;
    },

    loadLevelResource:function(deltaTime, score){
        if(MW.ACTIVE_ENEMIES>= this._currentLevel.enemyMax){
            return;
        }
        //load enemy
        var locCurrentLevel = this._currentLevel;
        for(var i = 0; i< locCurrentLevel.enemies.length; i++){
            var selEnemy = locCurrentLevel.enemies[i];
            if(selEnemy){
                if(selEnemy.ShowType === "Once"){
                    if(selEnemy.ShowTime == deltaTime){
                        for(var tIndex = 0; tIndex < selEnemy.Types.length;tIndex++ ){
                            this.addEnemyToGameLayer(selEnemy.Types[tIndex]);
                        }
                    }
                }else if(selEnemy.ShowType === "Repeate"){
                    if(deltaTime % selEnemy.ShowTime === 0){
                        for(var rIndex = 0; rIndex < selEnemy.Types.length;rIndex++ ){
                            this.addEnemyToGameLayer(selEnemy.Types[rIndex]);
                        }
                    }
                }
            }
        }

        for(var j = 0; j< locCurrentLevel.items.length; j++){
            var selItem= locCurrentLevel.items[j];
            if(selItem){
                if(selItem.ShowType === "Repeate_time"){
                    if(deltaTime % selItem.ShowTime === 0){
                        for(var t = 0; t < selItem.Types.length; t++ ){
                            this.addItemToGameLayer(selItem.Types[t]);
                        }
                    }
                }
            }else if(selItem.ShowType === "Repeate_score"){
                if(score % selItem.ShowTime === 0){
                    for(var a = 0; a < selItem.Types.length; a++ ){
                        this.addItemToGameLayer(selItem.Types[a]);
                    }
                }
            }else if(selItem.ShowType === "Repeate_once"){
                if(selItem.ShowTime === deltaTime ){
                    for(var b = 0; b < selItem.Types.length; b++ ){
                        this.addItemToGameLayer(selItem.Types[b]);
                    }
                }
            }
        }

    },

    addEnemyToGameLayer:function(enemyType){
		var addEnemy = Enemy.getOrCreateEnemy(EnemyType[enemyType]);
		if(addEnemy.moveType == MW.ENEMY_MOVE_TYPE.TRIANGLE){
		    addEnemy.x = winSize.width/2;
        } else {
            addEnemy.x = 80 + (winSize.width - 160) * Math.random();
        }
	    addEnemy.y = winSize.height;

        var offset, tmpAction;
        var a0=0;
        var a1=0;
        switch (addEnemy.moveType) {
            case MW.ENEMY_MOVE_TYPE.ATTACK: //Di chuyển thẳng đến vị trí hiện tại của tàu
                tmpAction = cc.moveTo(3, cc.p(this._gameLayer._ship.x, this._gameLayer._ship.y));
                break;
            case MW.ENEMY_MOVE_TYPE.VERTICAL: //Dâm thẳng xuống cuối
                offset = cc.p(0, -winSize.height - addEnemy.height);
                tmpAction = cc.moveBy(4, offset);
                break;
            case MW.ENEMY_MOVE_TYPE.HORIZONTAL:
                offset = cc.p(0, -100 - 200 * Math.random());
                a0 = cc.moveBy(0.5, offset);
                a1 = cc.moveBy(1, cc.p(-50 - 100 * Math.random(), 0));
                var onComplete = cc.callFunc(function (pSender) {
                    var a2 = cc.delayTime(1);
                    var a3 = cc.moveBy(1, cc.p(100 + 100 * Math.random(), 0));
                    pSender.runAction(cc.sequence(a2, a3, a2.clone(), a3.reverse()).repeatForever());
                }.bind(addEnemy) );
                tmpAction = cc.sequence(a0, a1, onComplete);
                break;
            case MW.ENEMY_MOVE_TYPE.OVERLAP:
                var diffX = winSize.width*0.5;
                var diffY = winSize.height*0.3;
                var newX = (addEnemy.x <= winSize.width/2)? diffX : -diffX;
                a0 = cc.moveBy(2,cc.p(newX,-diffY));
                a1 = cc.moveBy(2,cc.p(-newX, -diffY));
                var a2 = cc.moveBy(2, cc.p(newX,0));
                var a3 = cc.moveBy(2, cc.p(-newX, diffY));
                var a4 = cc.moveBy(2, cc.p(newX, diffY));
                var b0 = cc.sequence(a0, a1, a2, a3, a4);
                var b1 = b0.reverse();
                tmpAction = cc.sequence(b0,b1).repeatForever();
                break;
            case MW.ENEMY_MOVE_TYPE.TRIANGLE:
                offset = cc.p(0, -120);
                a0 = cc.moveBy(1, offset);
                var onComplete = cc.callFunc(function (pSender) {
                    a1 = cc.moveBy(1, cc.p(160,0));
                    var a2 = cc.moveBy(1, cc.p(-160, -160));
                    var a3 = cc.moveBy(1, cc.p(-160, 160));
                    var a4 = cc.moveBy(1, cc.p(160,0));
                    var a = cc.delayTime(0.8);
                    pSender.runAction(cc.sequence(a1, a, a2, a, a3, a, a4).repeatForever());
                }.bind(addEnemy));
                tmpAction = cc.sequence(a0, cc.delayTime(1), onComplete);
                break;
        }
        addEnemy.runAction(tmpAction);

    },
    addItemToGameLayer:function (itemType) {
        var item = Item.getOrCreateItem(ItemType[itemType]);
        item.x = (winSize.width-50)*Math.random() + 50;
        item.y = winSize.height;

        var offset = cc.p(0, -winSize.height - item.height);
        var tmpAction = cc.moveBy(2.5, offset);

        item.runAction(tmpAction);
    }
});
