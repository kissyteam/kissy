/**
 * @ignore
 * KISSY Overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/overlay-render", function (S, XTemplate, Component, Extension, Loading, CloseTpl, Mask) {

    return Component.Render.extend([
        Extension.ContentRender,
        Extension.ShimRender,
        Extension.PositionRender,
        Loading,
        Mask
    ], {
        initializer: function () {
            S.mix(this.get('childrenElSelectors'), {
                closeBtn: '#ks-ext-close{id}'
            });
        }
    }, {
        HTML_PARSER: {
            closeBtn: function (el) {
                return el.one("." + this.getBaseCssClass('close'));
            }
        },
        ATTRS: {
            closable: {},
            contentTpl: {
                value: CloseTpl + Extension.ContentRender.ContentTpl
            }
        }
    });

}, {
    requires: [
        'xtemplate',
        "component/base",
        'component/extension',
        './extension/loading-render',
        './close-tpl',
        './extension/mask-render'
    ]
});

/**
 * @ignore
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
