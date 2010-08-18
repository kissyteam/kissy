/**
 * Tabs Widget
 * @creator     玉伯<lifesinger@gmail.com>
 */
KISSY.add('slide', function(S) {

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
    }

    S.extend(Slide, S.Switchable);
    S.Slide = Slide;

}, { host: 'switchable' } );
