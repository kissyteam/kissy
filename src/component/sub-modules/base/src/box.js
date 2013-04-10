/**
 * @ignore
 * Box
 * @author yiminghe@gmail.com
 */
KISSY.add('component/base/box', function () {

    /**
     * Box extension class.Represent a dom element.
     * @class KISSY.Component.Extension.Box
     * @private
     */
    function Box() {

        /**
         * @event beforeVisibleChange
         * fired before visible is changed,
         * can return false to prevent this change
         * @param {KISSY.Event.CustomEventObject} e
         * @param {Boolean} e.prevVal current component 's visible value
         * @param {Boolean} e.prevVal visible value to be changed
         */

        /**
         * @event afterVisibleChange
         * fired after visible is changed
         * @param {KISSY.Event.CustomEventObject} e
         * @param {Boolean} e.prevVal current component 's previous visible value
         * @param {Boolean} e.prevVal current component 's visible value
         */

        /**
         * @event show
         * fired after current component shows
         * @param {KISSY.Event.CustomEventObject} e
         */

        /**
         * @event hide
         * fired after current component hides
         * @param {KISSY.Event.CustomEventObject} e
         */
    }

    Box.ATTRS =
    {
        /**
         * component's html content. Note: content and srcNode can not be set both!
         * @type {String|KISSY.NodeList}
         * @property content
         */
        /**
         * component's html content. Note: content and srcNode can not be set both!
         * @cfg {String|KISSY.NodeList} content
         */
        /**
         * @ignore
         */
        content: {
            view: 1
        },

        /**
         * component's width
         * @type {Number|String}
         * @property width
         */
        /**
         * component's width
         * @cfg {Number|String} width
         */
        /**
         * @ignore
         */
        width: {
            view: 1
        },

        /**
         * component's height
         * @type {Number|String}
         * @property height
         */
        /**
         * component's height
         * @cfg {Number|String} height
         */
        /**
         * @ignore
         */
        height: {
            view: 1
        },

        /**
         * css class of component's root element
         * @cfg {String} elCls
         */
        /**
         * @ignore
         */
        elCls: {
            view: 1
        },

        /**
         * name-value pair css style of component's root element
         * @cfg {Object} elStyle
         */
        /**
         * @ignore
         */
        elStyle: {
            view: 1
        },

        /**
         * name-value pair attribute of component's root element
         * @cfg {Object} elAttrs
         */
        /**
         * @ignore
         */
        elAttrs: {
            view: 1
        },

        /**
         * archor element where component insert before
         * @cfg {KISSY.NodeList} elBefore
         */
        /**
         * @ignore
         */
        elBefore: {
            // better named to renderBefore, too late !
            view: 1
        },

        /**
         * root element of current component
         * @type {KISSY.NodeList}
         * @readonly
         * @property el
         */
        /**
         * @ignore
         */
        el: {
            view: 1,
            setter: function (v) {
                if (!v.isNodeList)
                    v = $(v);
                return v;
            }
        },

        /**
         * content element of current component.
         * usually it is same with el.
         * except eg: overlay, submenu
         * @type {KISSY.NodeList}
         * @readonly
         * @property contentEl
         */
        /**
         * @ignore
         */
        contentEl: {
            view:1
        },

        /**
         * archor element where component append to
         * @cfg {KISSY.NodeList} render
         */
        /**
         * @ignore
         */
        render: {
            view: 1
        },

        /**
         * whether this component is visible after created.
         *
         * will add css class {prefix}{component}-hidden
         * or {prefix}{component}-shown to component's root el.
         *
         * @cfg {Boolean} visible
         */
        /**
         * whether this component is visible.
         *
         * will add css class {prefix}{component}-hidden
         * or {prefix}{component}-shown to component's root el.
         *
         * @type {Boolean}
         * @property visible
         */
        /**
         * @ignore
         */
        visible: {
            value: true,
            view: 1
        },

        /**
         * kissy node or css selector to find the first match node
         *
         * parsed for configuration values,
         * passed to component's HTML_PARSER definition
         * @cfg {KISSY.NodeList|String} srcNode
         *
         */
        /**
         * @ignore
         */
        srcNode: {
            view: 1
        }
    };

    // for augment, no need constructor
    Box.prototype = {

        _onSetVisible: function (v) {
            // do not fire event at render phrase
            if (this.get('rendered')) {
                this.fire(v ? "show" : "hide");
            }
        },

        /**
         * show component
         * @chainable
         */
        show: function () {
            var self = this;
            self.render();
            self.set("visible", true);
            return self;
        },

        /**
         * hide component
         * @chainable
         */
        hide: function () {
            var self = this;
            self.set("visible", false);
            return self;
        }
    };

    return Box;
});
