/**
 * @ignore
 * KISSY Overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/overlay-render", function (S, Controller, ContentRenderExtension, ShimRenderExtension, Loading, CloseTpl, Mask) {

    return Controller.ATTRS.xrender.value.extend([
        ContentRenderExtension,
        ShimRenderExtension,
        Loading,
        Mask
    ], {
        beforeCreateDom: function (renderData, childrenElSelectors) {
            S.mix(childrenElSelectors, {
                closeBtn: '#ks-ext-close-{id}'
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
                value: CloseTpl + ContentRenderExtension.ContentTpl
            }
        }
    });

}, {
    requires: [
        "component/controller",
        'component/extension/content-render',
        'component/extension/shim-render',
        './extension/loading-render',
        './close-tpl',
        './extension/mask-render'
    ]
});

/**
 * @ignore
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
