/**
 * Tabs Widget
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/slide/base', function(S, Switchable) {

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

        Slide.superclass.constructor.apply(self, arguments);
        return 0;
    }

    Slide.Config={
        autoplay: true,
        circular: true
    };

    Slide.Plugins=[];

    S.extend(Slide, Switchable);

    return Slide;

}, { requires:["../base"]});
