/**
 * @fileOverview UIBase.Box
 * @author yiminghe@gmail.com
 */
KISSY.add('component/uibase/box', function () {

    /**
     * Box extension class.
     * Represent a dom element.
     * @class Component.UIBase.Box
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
         * @type {String|KISSY.NodeList}
         */
        content: {
            view: 1
        },
        /**
         * component's width
         * @type {Number|String}
         */
        width: {
            view: 1
        },
        /**
         * component's height
         * @type {Number|String}
         */
        height: {
            view: 1
        },
        /**
         * css class of component's root element
         * @type {String}
         */
        elCls: {
            view: 1
        },
        /**
         * name-value pair css style of component's root element
         * @type {Object}
         */
        elStyle: {
            view: 1
        },
        /**
         * name-value pair attribute of component's root element
         * @type {Object}
         */
        elAttrs: {
            view: 1
        },
        /**
         * archor element where component insert before
         * @type {KISSY.NodeList}
         */
        elBefore: {
            // better named to renderBefore, too late !
            view: 1
        },
        /**
         * readonly. root element of current component
         * @type {KISSY.NodeList}
         */
        el: {
            view: 1
        },

        /**
         * archor element where component append to
         * @type {KISSY.NodeList}
         */
        render: {
            view: 1
        },

        /**
         * component's visibleMode,use css "display" or "visibility" to show this component
         * @type {String}
         */
        visibleMode: {
            view: 1
        },

        /**
         * whether this component is visible
         * @type {Boolean}
         * @default true
         */
        visible: {
            value: true,
            view: 1
        },

        /**
         * the node to parse for configuration values,passed to component's HTML_PARSER definition
         * @type {KISSY.NodeList}
         */
        srcNode: {
            view: 1
        }
    };

    Box.prototype =
    {

        _uiSetVisible: function (v) {
            // do not fire event at render phrase
            if (this.get('rendered')) {
                this.fire(v ? "show" : "hide");
            }
        },

        /**
         * show component
         */
        show: function () {
            var self = this;
            self.render();
            self.set("visible", true);
            return self;
        },

        /**
         * hide component
         */
        hide: function () {
            var self = this;
            self.set("visible", false);
            return self;
        }
    };

    return Box;
});
