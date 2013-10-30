KISSY.add(function (S, Menu, Node) {
    var KeyCode = Node.KeyCode;
    return Menu.Item.extend({
        handleKeyDownInternal: function (e) {
            if (e.keyCode == KeyCode.LEFT) {
                S.log('left');
            } else if (e.keyCode == KeyCode.RIGHT) {
                S.log('right');
            } else {
                this.callSuper(e);
            }
        },
        handleMouseEnterInternal: function (e) {
            var superCall = S.bind(this.callSuper, arguments.callee, this);
            this._lazyTimeout = setTimeout(function () {
                superCall(e);
            }, 100);
        },
        handleMouseLeaveInternal: function (e) {
            this.callSuper(e);
            if (this._lazyTimeout) {
                clearTimeout(this._lazyTimeout);
                this._lazyTimeout = 0;
            }
        }
    }, {
        xclass: 'search-menuitem'
    });
}, {
    requires: ['menu', 'node']
});