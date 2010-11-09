/**
 * position and visible extension，可定位的隐藏层
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-position", function(S) {
    S.namespace("Ext");

    var doc = document ,
        Event = S.Event,
        KEYDOWN = "keydown";

    function PositionExt() {
        var self = this;
        self.on("bindUI", self._bindUIPosition, self);
        self.on("renderUI", self._renderUIPosition, self);
    }

    PositionExt.ATTRS = {
        x: {
            // 水平方向绝对位置
        },
        y: {
            // 垂直方向绝对位置
        },
        xy: {
            // 相对 page 定位, 有效值为 [n, m], 为 null 时, 选 align 设置
            setter: function(v) {
                var self = this,
                    xy = S.makeArray(v);

                if (xy.length) {
                    xy[0] && self.set(X, xy[0]);
                    xy[1] && self.set(Y, xy[1]);
                }
                return v;
            }
        },
        zIndex: {
            value: 9999
        },
        visible:{
            value:false
        }
    };


    PositionExt.prototype = {
        _renderUIPosition:function() {
            this.get("el").css("display", "");
        },
        _bindUIPosition:function() {

        },
        _uiSetZIndex:function(x) {
            if (x !== undefined)
                this.get("el").css("z-index", x);
        },
        _uiSetX:function(x) {
            if (x !== undefined)
                this.get("el").offset({
                    left:x
                });
        },
        _uiSetY:function(y) {
            if (y !== undefined)
                this.get("el").offset({
                    top:y
                });
        },
        _uiSetVisible:function(isVisible) {
            var self = this,
                el = self.get("el");
            el.css("visibility", isVisible ? "" : "hidden");
            self[isVisible ? "_bindKey" : "_unbindKey" ]();
            self.fire(isVisible ? "show" : "hide");
        },
        /**
         * 显示/隐藏时绑定的事件
         */
        _bindKey: function() {
            Event.on(doc, KEYDOWN, this._esc, this);
        },

        _unbindKey: function() {
            Event.remove(doc, KEYDOWN, this._esc, this);
        },

        _esc: function(e) {
            if (e.keyCode === 27) this.hide();
        },
        /**
         * 移动到绝对位置上, move(x, y) or move(x) or move([x, y])
         * @param {number|Array.<number>} x
         * @param {number=} y
         */
        move: function(x, y) {
            var self = this;
            if (S.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            self.set("xy", [x,y]);
        },

        /**
         * 显示 Overlay
         */
        show: function() {
            this._firstShow();
        },

        /**
         * 第一次显示时, 需要构建 DOM, 设置位置
         */
        _firstShow: function() {
            var self = this;
            self.renderer();
            self._realShow();
            self._firstShow = self._realShow;
        },


        _realShow: function() {
            this.set("visible", true);
        },

        /**
         * 隐藏
         */
        hide: function() {
            this.set("visible", false);
        }

    };

    S.Ext.Position = PositionExt;
});