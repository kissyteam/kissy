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
            ret = { left: DOM.scrollLeft(), top: DOM.scrollTop() };

            S.mix(ret, {
                maxLeft: ret.left + DOM.viewportWidth() - el[0].offsetWidth,
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

        },
        _constrainX:function(ev) {
            var self=this;
            var v = ev.newVal,
                _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
            if (!_ConstrainExtRegion) return;
            if (v >= _ConstrainExtRegion.maxLeft
                || v <= _ConstrainExtRegion.left) return false;
        },
        _constrainY:function(ev) {
            var self=this;
            var v = ev.newVal,
                _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
            if (!_ConstrainExtRegion) return;
            if (v >= _ConstrainExtRegion.maxTop
                || v <= _ConstrainExtRegion.top) return false;
        },
        _syncUIConstrain:function() {
            S.log("_syncUIConstrain");
        },

        _uiSetConstrain:function(v) {
            S.log("_uiSetConstrain");
            var self = this;
            if (v) {
                self.detach("beforeXChange", self._constrainX, self);
                self.detach("beforeYChange", self._constrainY, self);
                self.on("beforeXChange", self._constrainX, self);
                self.on("beforeYChange", self._constrainY, self);
            } else {
                self.detach("beforeXChange", self._constrainX, self);
                self.detach("beforeYChange", self._constrainY, self);
            }
        },
        __destructor:function() {
            S.log("constrain-ext __destructor");
        }

    };


    S.Ext.Constrain = ConstrainExt;

});