/**
 * @ignore
 * render for dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/dialog-render", function (S, OverlayRender, DialogTpl) {

    function _setStdModRenderContent(self, part, v) {
        part = self.get(part);
        if (typeof v == 'string') {
            part.html(v);
        } else {
            part.html("")
                .append(v);
        }
    }

    return OverlayRender.extend({
        initializer: function () {
            S.mix(this.get('elAttrs'), {
                role: 'dialog',
                'aria-labelledby': 'ks-stdmod-header' + this.get('id')
            });
            S.mix(this.get('childrenElSelectors'), {
                header: '#ks-stdmod-header{id}',
                body: '#ks-stdmod-body{id}',
                footer: '#ks-stdmod-footer{id}'
            });
        },

        '_onSetBodyStyle': function (v) {
            this.get("body").css(v);
        },

        '_onSetHeaderStyle': function (v) {
            this.get("header").css(v);
        },
        '_onSetFooterStyle': function (v) {
            this.get("footer").css(v);
        },

        '_onSetBodyContent': function (v) {
            _setStdModRenderContent(this, "body", v);
        },

        '_onSetHeaderContent': function (v) {
            _setStdModRenderContent(this, "header", v);
        },

        '_onSetFooterContent': function (v) {
            _setStdModRenderContent(this, "footer", v);
        }
    }, {

        ATTRS: {
            closable: {
                value: false
            },
            contentTpl: {
                valueFn: function () {
                    return DialogTpl + this.get('closeTpl');
                }
            },
            headerContent: {
                sync: 0
            },
            bodyContent: {
                sync: 0
            },
            footerContent: {
                sync: 0
            },
            headerStyle: {
                sync: 0
            },
            bodyStyle: {
                sync: 0
            },
            footerStyle: {
                sync: 0
            },
            body: {},
            header: {},
            footer: {}
        },

        HTML_PARSER: {
            header: function (el) {
                return el.one("." + this.get('prefixCls') + "stdmod-header");
            },
            body: function (el) {
                return el.one("." + this.get('prefixCls') + "stdmod-body");
            },
            footer: function (el) {
                return el.one("." + this.get('prefixCls') + "stdmod-footer");
            },
            headerContent:function(el){
                return el.one("." + this.get('prefixCls') + "stdmod-header").html();
            },
            bodyContent:function(el){
                return el.one("." + this.get('prefixCls') + "stdmod-body").html();
            },
            footerContent:function(el){
                return el.one("." + this.get('prefixCls') + "stdmod-footer").html();
            }
        }});
}, {
    requires: ['./overlay-render', './dialog-tpl']
});