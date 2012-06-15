/**
 * @fileOverview UIBase.Box
 * @author yiminghe@gmail.com
 */
KISSY.add('component/uibase/box', function (S) {

    /**
     * @name Box
     * @memberOf Component.UIBase
     * @class
     * Box extension class.
     * Represent a dom element.
     */
    function Box() {
    }

    Box.ATTRS =
    /**
     * @lends Component.UIBase.Box.prototype
     */
    {
        /**
         * component's html content.
         * Note: content and srcNode can not be set both!
         * @type String|NodeList
         */
        content:{
            view:1,
            sync:false
        },
        /**
         * component's width
         * @type Number|String
         */
        width:{
            // 没有 _uiSetWidth，所以不需要设置 sync:false
            view:1,
            sync:false
        },
        /**
         * component's height
         * @type Number|String
         */
        height:{
            sync:false,
            view:1
        },
        /**
         * css class of component's root element
         * @type String
         */
        elCls:{
            sync:false,
            view:1
        },
        /**
         * name-value pair css style of component's root element
         * @type Object
         */
        elStyle:{
            sync:false,
            view:1
        },
        /**
         * name-value pair attribute of component's root element
         * @type Object
         */
        elAttrs:{
            sync:false,
            view:1
        },
        /**
         * archor element where component insert before
         * @type NodeList
         */
        elBefore:{
            sync:false,
            view:1
        },
        /**
         * readonly. root element of current component
         * @type NodeList
         */
        el:{
            view:1
        },

        /**
         * archor element where component append to
         * @type NodeList
         */
        render:{
            view:1
        },

        /**
         * component's visibleMode,use css "display" or "visibility" to show this component
         * @type String
         */
        visibleMode:{
            view:1
        },

        /**
         * whether this component is visible
         * @type Boolean
         */
        visible:{
            view:1
        },

        /**
         * the node to parse for configuration values,passed to component's HTML_PARSER definition
         * @type NodeList
         */
        srcNode:{
            view:1
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
     * @lends Component.UIBase.Box#
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
            var self = this, view;
            if (!self.get("rendered")) {
                // 防止初始设置 false，导致触发 hide 事件
                // show 里面的初始一定是 true，触发 show 事件
                // 2012-03-28 : 用 set 而不是 __set :
                // - 如果 show 前调用了 hide 和 create，view 已经根据 false 建立起来了
                // - 也要设置 view
                // self.set("visible", true);
                // 2012-06-07 ，不能 set
                // 初始监听 visible ，得不到 el

                // 2012-06-12
                // 复位 undefined，防止之前设置过
                self.__set("visible", undefined);
                if (view = self.get("view")) {
                    view.__set("visible", undefined);
                }
                self.render();
            }
            self.set("visible", true);
            return self;
        },

        /**
         * hide component
         */
        hide:function () {
            var self = this;
            self.set("visible", false);
            return self;
        }
    };

    return Box;
});
