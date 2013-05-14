/**
 * @ignore
 * KISSY Overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/overlay-render", function (S, XTemplate, Component, Extension, Loading, OverlayTpl, CloseTpl, Mask) {
    var UA = S.UA;

    return Component.Render.extend([
        UA['ie'] === 6 ? Extension.Shim.Render : null,
        Extension.Position.Render,
        Loading,
        Mask
    ], {
        initializer: function () {
            S.mix(this.get('childrenElSelectors'), {
                contentEl: '#ks-contentbox{id}',
                closeBtn: '#ks-ext-close{id}'
            });
        },
        getChildrenContainerEl: function () {
            return this.get('contentEl');
        }
    }, {
        HTML_PARSER: {
            contentEl: function (el) {
                return el.one('.' + this.get('prefixCls') + 'contentbox')
            },
            closeBtn: function (el) {
                return el.one("." + this.get('prefixCls') + 'ext-close');
            }
        },
        ATTRS: {
            closable: {},
            contentTpl: {
                value: OverlayTpl + CloseTpl
            },
            closeTpl: {
                value: CloseTpl
            }
        }
    });

}, {
    requires: [
        'xtemplate',
        "component/base",
        'component/extension',
        './extension/loading-render',
        './overlay-tpl',
        './close-tpl',
        './extension/mask-render'
    ]
});

/**
 * @ignore
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
