/**
 *  auto render
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('autorender', function(S) {

    /**
     * 自动渲染 container 元素内的所有 Overlay 组件
     * 默认钩子：<div class="KS_Widget" data-widget-type="Popup" data-widget-config="{...}">
     */
    S.Overlay.autoRender = function(hook, container) {
        hook = '.' + (hook || 'KS_Widget');

        S.query(hook, container).each(function(elem) {
            var type = elem.getAttribute('data-widget-type'), config;

            if (type && ('Dialog Popup'.indexOf(type) > -1)) {
                try {
                    config = elem.getAttribute('data-widget-config');
                    if (config) config = config.replace(/'/g, '"');
                    new S[type](elem, S.JSON.parse(config));
                } catch(ex) {
                    S.log('Overlay.autoRender: ' + ex, 'warn');
                }
            }
        });
    }

}, { host: 'overlay' } );
