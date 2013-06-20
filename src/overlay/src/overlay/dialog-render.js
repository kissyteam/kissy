/**
 * @ignore
 * render for dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/dialog-render", function (S, OverlayRender, DialogTpl) {

    function _setStdModRenderContent(self, part, v) {
        part = self.controller.get(part);
        part.html(v);
    }

    return OverlayRender.extend({

        beforeCreateDom: function (renderData) {
            S.mix(renderData.elAttrs, {
                role: 'dialog',
                'aria-labelledby': 'ks-stdmod-header' + this.get('id')
            });
        },

        createDom: function () {
            this.controller.get('contentEl').append(this.renderTpl(DialogTpl));
            // sentinel
            this.el.append('<div tabindex="0"></div>');
            this.fillChildrenElsBySelectors({
                header: '#ks-stdmod-header-{id}',
                body: '#ks-stdmod-body-{id}',
                footer: '#ks-stdmod-footer-{id}'
            });
        },

        getChildrenContainerEl: function () {
            return this.controller.get('body');
        },

        '_onSetBodyStyle': function (v) {
            this.controller.get("body").css(v);
        },

        '_onSetHeaderStyle': function (v) {
            this.controller.get("header").css(v);
        },
        '_onSetFooterStyle': function (v) {
            this.controller.get("footer").css(v);
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
        HTML_PARSER: {
            header: function (el) {
                return el.one("." + this.getBaseCssClass('header'));
            },
            body: function (el) {
                return el.one("." + this.getBaseCssClass('body'));
            },
            footer: function (el) {
                return el.one("." + this.getBaseCssClass('footer'));
            },
            headerContent: function (el) {
                return el.one("." + this.getBaseCssClass('header')).html();
            },
            bodyContent: function (el) {
                return el.one("." + this.getBaseCssClass('body')).html();
            },
            footerContent: function (el) {
                var footer = el.one("." + this.getBaseCssClass('footer'));
                return footer && footer.html();
            }
        }
    });
}, {
    requires: ['./overlay-render', './dialog-tpl', './close-tpl']
});