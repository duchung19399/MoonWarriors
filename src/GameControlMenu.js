

var GameControlMenu = cc.Layer.extend({
    ctor:function(){
        this._super();
        this.init();
    },
    init:function () {
        cc.MenuItemFont.setFontSize(24);
        cc.MenuItemFont.setFontName("Arial");
        var systemMenu = new cc.MenuItemFont("Main Menu", this.onSysMenu);
        systemMenu.setColor(cc.color(MW.FONTCOLOR));
        var menu = new cc.Menu(systemMenu);
        menu.x = 0;
        menu.y = 0;
        systemMenu.attr({
            x: winSize.width-125,
            y: 5,
            anchorX: 0,
            anchorY: 0
        });
        this.addChild(menu, 1, 2);

        return true;
    },
    onSysMenu:function (pSender) {
        var scene = new cc.Scene();
        scene.addChild(new SysMenu());
	    cc.director.runScene(new cc.TransitionFade(1.2,scene));
    }
});
