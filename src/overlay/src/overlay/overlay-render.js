/**
 * @ignore
 * KISSY Overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/overlay-render", function (S, Container, ContentRenderExtension, CloseTpl) {

    return Container.getDefaultRender().extend([
        ContentRenderExtension
    ], {
        createDom: function () {
            var self = this;
            if (self.control.get('closable')) {
                self.control.$contentEl
                    .append(self.renderTpl(CloseTpl));
                self.fillChildrenElsBySelectors({
                    closeBtn: '#ks-overlay-close-{id}'
                });
            }
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
        './close-tpl'
    ]
});

/**
 * @ignore
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
