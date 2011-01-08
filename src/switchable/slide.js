/**
 * Tabs Widget
 * @creator     玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/slide', function(S, Switchable) {

    /**
     * 默认配置，和 Switchable 相同的部分此处未列出
     */
    var defaultConfig = {
        autoplay: true,
        circular: true
    };

    /**
     * Slide Class
     * @constructor
     */
    function Slide(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Slide)) {
            return new Slide(container, config);
        }

        Slide.superclass.constructor.call(self, container, S.merge(defaultConfig, config));
        return 0;
    }

    S.extend(Slide, Switchable);

    return Slide;

}, { requires:["switchable/base"]});
