/**
 * Switchable Autorender Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 * @depends  ks-core, json
 */
KISSY.add('switchable-autorender', function(S) {

    /**
     * 自动渲染 container 元素内的所有 Switchable 组件
     */
    S.Switchable.autoRender = function(container, hookPrefix, dataAttrName) {
        hookPrefix = '.' + (hookPrefix || 'KS_');
        dataAttrName = dataAttrName || 'data-ks-switchable';

        S.each(['Switchable', 'Tabs', 'Slide', 'Carousel', 'Accordion'], function(name) {
            S.each(S.query(hookPrefix + name, container), function(elem) {
                try {
                    var config = elem.getAttribute(dataAttrName);
                    if(config) config = config.replace(/'/g, '"');
                    new S[name](elem, S.JSON.parse(config));
                } catch(ex) {
                    S.log('Switchable.autoRender: ' + ex, 'warn');
                }
            });
        });
    }
});
