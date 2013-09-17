/**
 * @ignore
 * KISSY Overlay
 * @author yiminghe@gmail.com
 */
KISSY.add('overlay/overlay-render', function (S, Container,OverlayTpl, ContentRenderExtension) {
    return Container.getDefaultRender().extend([
        ContentRenderExtension
    ], {
    }, {
        ATTRS:{
          contentTpl:{
              value:OverlayTpl
          }
        },
        HTML_PARSER: {
            closeBtn: function (el) {
                return el.one("." + this.getBaseCssClass('close'));
            }
        }
    });
}, {
    requires: [
        'component/container',
        './overlay-xtpl',
        'component/extension/content-render',
        './close-xtpl'
    ]
});

/**
 * @ignore
 * 2010-11-09 2010-11-10 yiminghe@gmail.com重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
