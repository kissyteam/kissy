/**
 * @fileOverview constrain extension for kissy
 * @author yiminghe@gmail.com, qiaohua@taobao.com
 */
KISSY.add("uibase/constrain", function (S, DOM, Node) {

    /**
     * Constrain extension class.
     * Constrain component to specified region
     * @class
     * @memberOf UIBase
     */
    function Constrain() {

    }

    Constrain.ATTRS =
    /**
     * @lends UIBase.Constrain.prototype
     */
    {
        /**
         * Config constrain region.
         * True: viewport
         * Node: specified element.
         * false: no constrain region.
         * @type NodeList|Boolean
         */
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
        var ret = null;
        if (!constrain) {
            return ret;
        }
        var el = this.get("el");
        if (constrain !== true) {
            constrain = Node.one(constrain);
            ret = constrain.offset();
            S.mix(ret, {
                maxLeft:ret.left + constrain.outerWidth() - el.outerWidth(),
                maxTop:ret.top + constrain.outerHeight() - el.outerHeight()
            });
        }
        // 没有指定 constrain, 表示受限于可视区域
        else {
            ret = {
                left:DOM.scrollLeft(),
                top:DOM.scrollTop()
            };
            S.mix(ret, {
                maxLeft:ret.left + DOM.viewportWidth() - el.outerWidth(),
                maxTop:ret.top + DOM.viewportHeight() - el.outerHeight()
            });
        }

        return ret;
    }

    Constrain.prototype = {

        __renderUI:function () {
            var self = this,
                attrs = self.getAttrs(),
                xAttr = attrs["x"],
                yAttr = attrs["y"],
                oriXSetter = xAttr["setter"],
                oriYSetter = yAttr["setter"];
            xAttr.setter = function (v) {
                var r = oriXSetter && oriXSetter.call(self, v);
                if (r === undefined) {
                    r = v;
                }
                if (!self.get("constrain")) {
                    return r;
                }
                var _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
                return Math.min(Math.max(r,
                    _ConstrainExtRegion.left),
                    _ConstrainExtRegion.maxLeft);
            };
            yAttr.setter = function (v) {
                var r = oriYSetter && oriYSetter.call(self, v);
                if (r === undefined) {
                    r = v;
                }
                if (!self.get("constrain")) {
                    return r;
                }
                var _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
                return Math.min(Math.max(r,
                    _ConstrainExtRegion.top),
                    _ConstrainExtRegion.maxTop);
            };
            self.addAttr("x", xAttr);
            self.addAttr("y", yAttr);
        }
    };


    return Constrain;

}, {
    requires:["dom", "node"]
});