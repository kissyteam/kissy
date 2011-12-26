/**
 * @fileOverview Tabs Widget
 * @creator  lifesinger@gmail.com
 */
KISSY.add('switchable/slide/base', function(S, Switchable) {



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
    }

    Slide.Config={
        autoplay: true,
        circular: true
    };

    Slide.Plugins=[];

    S.extend(Slide, Switchable);

    return Slide;

}, { requires:["../base"]});

/**
 * 承玉：2011.06.02 review switchable
 */
