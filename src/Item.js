

var Item = cc.Sprite.extend({
    active: true,
    itemType:0,
    HP:1,
    zOrder:1000,
    scoreValue:400,
    ctor:function (arg) {
        this._super(arg.texture);
        this.itemType=arg.itemType;
    },
    update:function (dt) {
        var x = this.x;
        var y = this.y;
        if ((x < 0 || x > MW.WIDTH) && (y < 0 || y > MW.HEIGHT)) {
            this.active = false;
        }
        if (x < 0 || x > g_sharedGameLayer.screenRect.width || y < 0 || y > g_sharedGameLayer.screenRect.height || this.HP <= 0) {
            this.active = false;
            this.destroy();
        }
    },
    destroy:function () {
        this.active = false;
        this.visible = false;
    },
    hurt:function () {
      this.HP--;
    },
    collideRect:function (x, y) {
        var w = this.width, h = this.height;
        return cc.rect(x -w/2, y -w/2, w , h);
    }
});
Item.getOrCreateItem = function (arg) {
    var selChild = null;
    for (var i = 0; i < MW.CONTAINER.ITEM.length; i++) {
        selChild = MW.CONTAINER.ITEM[i];

        if(selChild.active == false && selChild.itemType == arg.itemType) {
            selChild.visible = true;
            selChild.HP = 1;
            selChild.active = true;
            return selChild;
        }
    }
    selChild= Item.create(arg);
    return selChild;
};

Item.create = function (arg) {
    var item = new Item(arg);
    g_sharedGameLayer.addItem(item, item.zOrder, MW.UNIT_TAG.ITEM);
    MW.CONTAINER.ITEM.push(item);
    return item;
};

Item.preSet = function () {
    var item = null;
    for (var i = 0; i<2; i++) {
        for (var j = 0; j < ItemType.length; j++) {
            item = Item.create(ItemType[j]);
            item.visible = false;
            item.active = false;
            item.stopAllActions();
            item.unscheduleAllCallbacks();
        }
    }
};