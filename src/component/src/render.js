/**
 * @fileOverview render base class for kissy
 * @author yiminghe@gmail.com
 * @see http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/render", function (S, UIBase, UIStore) {

    function tagFunc(self, classes, tag) {
        return self.getCls(classes.split(/\s+/).join(tag + " ") + tag);
    }

    return UIBase.create([UIBase.Box.Render], {

        __CLASS:"Component.Render",

        _completeClasses:function (classes, tag) {
            return tagFunc(this, classes, tag);
        },

        /**
         * @protected
         */
        _renderCls:function (componentCls) {
            var self = this;
            self.get("el").addClass(self.getCls(componentCls));
        },

        getCls:UIStore.getCls,

        getKeyEventTarget:function () {
            return this.get("el");
        },

        getContentElement:function () {
            return this.get("contentEl") || this.get("el");
        },

        /**
         * @protected
         */
        _uiSetFocusable:function (v) {
            var el = this.getKeyEventTarget(),
                tabindex = el.attr("tabindex");
            if (tabindex >= 0 && !v) {
                el.attr("tabindex", -1);
            } else if (!(tabindex >= 0) && v) {
                el.attr("tabindex", 0);
            }
        },

        /**
         * @protected
         */
        _setHighlighted:function (v, componentCls) {
            var self = this, el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](tagFunc(self, componentCls, "-hover"));
        },

        /**
         * @protected
         */
        _setDisabled:function (v, componentCls) {
            var self = this, el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](tagFunc(self, componentCls, "-disabled"))
                //不能被 tab focus 到
                //support aria
                .attr({
                    "tabindex":v ? -1 : 0,
                    "aria-disabled":v
                });

        },
        /**
         * @protected
         */
        _setActive:function (v, componentCls) {
            var self = this;
            self.get("el")[v ? 'addClass' : 'removeClass'](tagFunc(self, componentCls, "-active"))
                .attr("aria-pressed", !!v);
        },
        /**
         * @protected
         */
        _setFocused:function (v, componentCls) {
            var self = this, el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](tagFunc(self, componentCls, "-focused"));
        }

    }, {
        ATTRS:{
            /**
             *  screen state
             */
            prefixCls:{},
            focusable:{}
        }
    });
}, {
    requires:['uibase', './uistore']
});