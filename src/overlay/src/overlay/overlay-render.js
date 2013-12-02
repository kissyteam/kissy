/**
 * @ignore
 * KISSY Overlay
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Container = require('component/container');
    var OverlayTpl = require('./overlay-xtpl');
    var ContentRenderExtension = require('component/extension/content-render');

    return Container.getDefaultRender().extend([
        ContentRenderExtension
    ], {
        createDom: function () {
            this.fillChildrenElsBySelectors({
                closeBtn: '#ks-overlay-close-{id}'
            });
        }
    }, {
        ATTRS: {
            contentTpl: {
                value: OverlayTpl
            }
        },
        HTML_PARSER: {
            closeBtn: function (el) {
                return el.one('.' + this.getBaseCssClass('close'));
            }
        }
    });
});

/**
 * @ignore
 * 2010-11-09 2010-11-10 yiminghe@gmail.com 重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
