/**
 * Tabs Widget
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/slide/base', function(S, Switchable) {


    Switchable=S.Switchable;
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

    S.Slide=Slide;
    
    return Slide;

});
