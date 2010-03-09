/**
 * Carousel Widget
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     kissy, yui-base
 */
KISSY.add('carousel', function(S) {

        /**
         * 默认配置，和 Switchable 相同的部分此处未列出
         */
        var defaultConfig = {
            circular: true
        };

    /**
     * Carousel Class
     * @constructor
     */
    function Carousel(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Carousel)) {
            return new Carousel(container, config);
        }

        config = S.merge(defaultConfig, config || { });
        Carousel.superclass.constructor.call(self, container, config);
    }

    S.extend(Carousel, S.Switchable);
    S.Carousel = Carousel;
});
