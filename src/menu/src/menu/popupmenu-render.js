/**
 * @ignore
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var ContentRenderExtension = require('component/extension/content-render');
    var MenuRender = require('./menu-render');
    return MenuRender.extend([
        ContentRenderExtension
    ]);
});