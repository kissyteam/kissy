/**
 * @ignore
 * KISSY Overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/overlay-render", function (S, Container, ContentRenderExtension, ShimRenderExtension, CloseTpl) {

    return Container.ATTRS.xrender.value.extend([
        ContentRenderExtension,
        ShimRenderExtension
    ], {
        createDom: function () {
            this.controller.get('contentEl').append(this.renderTpl(CloseTpl));
            this.fillChildrenElsBySelectors({
                closeBtn: '#ks-ext-close-{id}'
            });
        }
    }, {
        HTML_PARSER: {
            closeBtn: function (el) {
                return el.one("." + this.getBaseCssClass('close'));
            }
        }
    });

}, {
    requires: [
        "component/container",
        'component/extension/content-render',
        'component/extension/shim-render',
        './close-tpl'
    ]
});

/**
 * @ignore
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
