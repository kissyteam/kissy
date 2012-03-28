/**
 * @fileOverview UIBase.Box
 * @author yiminghe@gmail.com
 */
KISSY.add('uibase/box', function (S) {

    /**
     * Box Implementation
     * @class
     * @memberOf UIBase
     * @namespace
     */
    function Box() {
    }

    Box.ATTRS =
    /**
     * @lends UIBase.Box.prototype
     */
    {
        /**
         * component's html content
         * @type String
         */
        html:{
            view:true
        },
        /**
         * component's width
         * @type Number|String
         */
        width:{
            // 没有 _uiSetWidth，所以不需要设置 sync:false
            view:true
        },
        /**
         * component's height
         * @type Number|String
         */
        height:{
            view:true
        },
        /**
         * css class of component's root element
         * @type String
         */
        elCls:{
            view:true
        },
        /**
         * name-value pair css style of component's root element
         * @type Object
         */
        elStyle:{
            view:true
        },
        /**
         * name-value pair attribute of component's root element
         * @type Object
         */
        elAttrs:{
            view:true
        },
        /**
         * archor element where component insert before
         * @type NodeList
         */
        elBefore:{
            view:true
        },
        /**
         * readonly. root element of current component
         * @type NodeList
         */
        el:{
            view:true
        },

        /**
         * archor element where component append to
         * @type NodeList
         */
        render:{
            view:true
        },

        /**
         * component's visibleMode,use css "display" or "visibility" to show this component
         * @type String
         */
        visibleMode:{
            value:"display",
            view:true
        },

        /**
         * whether this component is visible
         * @type Boolean
         */
        visible:{
            view:true
        },

        /**
         * the node to parse for configuration values,passed to component's HTML_PARSER definition
         * @type NodeList
         */
        srcNode:{
            view:true
        }
    };


    Box.HTML_PARSER =
    /**
     * @private
     */
    {
        el:function (srcNode) {
            /**
             * 如果需要特殊的对现有元素的装饰行为
             */
            var self = this;
            if (self.decorateInternal) {
                self.decorateInternal(S.one(srcNode));
            }
            return srcNode;
        }
    };

    Box.prototype =
    /**
     * @lends UIBase.Box#
     */
    {
        /**
         * @private
         */
        _uiSetVisible:function (isVisible) {
            this.fire(isVisible ? "show" : "hide");
        },

        /**
         * show component
         */
        show:function () {
            var self = this;
            if (!self.get("rendered")) {
                // 防止初始设置 false，导致触发 hide 事件
                // show 里面的初始一定是 true，触发 show 事件
                // 2012-03-28 : 用 set 而不是 __set :
                // - 如果 show 前调用了 hide 和 create，view 已经根据 false 建立起来了
                // - 也要设置 view
                self.set("visible", true);
                self.render();
            } else {
                self.set("visible", true);
            }
        },

        /**
         * hide component
         */
        hide:function () {
            this.set("visible", false);
        }
    };

    return Box;
});
