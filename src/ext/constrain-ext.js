KISSY.add("ext-constrain", function(S) {
    S.namespace("Ext");

    var DOM = S.DOM,
        Node = S.Node;

    function ConstrainExt() {
        S.log("constrain init");
        var self = this;
        self.on("bindUI", self._bindUIConstrain, self);
        self.on("renderUI", self._renderUIConstrain, self);
        self.on("syncUI", self._syncUIConstrain, self);
    }

    ConstrainExt.ATTRS = {
        constrain:{
            //不限制
            //true:viewport限制
            //node:限制在节点范围
            value:false
        }
    };

    /**
     * 获取受限区域的宽高, 位置
     * @return {Object | undefined} {left: 0, top: 0, maxLeft: 100, maxTop: 100}
     */
    function _getConstrainRegion(constrain) {
        var ret = undefined;
        if (!constrain) return ret;
        var el = this.get("el");
        if (constrain !== true) {
            constrain = S.one(constrain);
            ret = constrain.offset();
            S.mix(ret, {
                maxLeft: ret.left + constrain[0].offsetWidth - el[0].offsetWidth,
                maxTop: ret.top + constrain[0].offsetHeight - el[0].offsetHeight
            });
        }
        // 没有指定 constrain, 表示受限于可视区域
        else {
            var vWidth = document.documentElement.clientWidth;
            ret = { left: DOM.scrollLeft(), top: DOM.scrollTop() };

            S.mix(ret, {
                maxLeft: ret.left + vWidth - el[0].offsetWidth,
                maxTop: ret.top + DOM.viewportHeight() - el[0].offsetHeight
            });
        }
        return ret;
    }

    ConstrainExt.prototype = {
        _bindUIConstrain:function() {
            S.log("_bindUIConstrain");

        },
        _renderUIConstrain:function() {
            S.log("_renderUIConstrain");
            var self = this,
                attrs = self.getDefAttrs(),
                xAttr = attrs["x"],
                yAttr = attrs["y"],
                oriXSetter = xAttr["setter"],
                oriYSetter = yAttr["setter"];
            xAttr.setter = function(v) {                
                var r = oriXSetter && oriXSetter(v);
                if (r === undefined) {
                    r = v;
                }
                if (!self.get("constrain")) return r;
                var _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
                return Math.min(Math.max(r,
                    _ConstrainExtRegion.left),
                    _ConstrainExtRegion.maxLeft);
            };
            yAttr.setter = function(v) {
                var r = oriYSetter && oriYSetter(v);
                if (r === undefined) {
                    r = v;
                }
                if (!self.get("constrain")) return r;
                var _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
                return Math.min(Math.max(r,
                    _ConstrainExtRegion.top),
                    _ConstrainExtRegion.maxTop);
            };
            self.addAttr("x", xAttr);
            self.addAttr("y", yAttr);
        },

        _syncUIConstrain:function() {
            S.log("_syncUIConstrain");
        },
        __destructor:function() {
            S.log("constrain-ext __destructor");
        }

    };


    S.Ext.Constrain = ConstrainExt;

});