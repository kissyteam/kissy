/**
 *  Switchable autorender Plugin
 * @author lifesinger@gmail.com
 */
KISSY.add('switchable/autorender', function (S, DOM, JSON, Switchable) {

    /**
     * 自动渲染 container 元素内的所有 Switchable 组件
     * 默认钩子：<div class="KS_Widget" data-widget-type="Tabs" data-widget-config="{...}">
     */
    Switchable.autoRender = function (hook, container) {
        hook = '.' + (hook || 'KS_Widget');

        S.each(DOM.query(hook, container), function (elem) {
            var type = elem.getAttribute('data-widget-type'),
                config;
            if (type && ('Switchable Tabs Slide Carousel Accordion'.indexOf(type) > -1)) {
                try {
                    config = elem.getAttribute('data-widget-config');
                    if (config) {
                        config = config.replace(/'/g, '"');
                    }
                    new (type == "Switchable" ? Switchable : Switchable[type])(elem, JSON.parse(config));
                } catch (ex) {
                    S.log('Switchable.autoRender: ' + ex, 'warn');
                }
            }
        });
    }

}, { requires:["dom", "json", "./base"]});