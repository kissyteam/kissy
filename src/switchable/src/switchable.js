/**
 *  switchable
 */
KISSY.add("switchable", function (S, Switchable, Accordion, Carousel, Slide, Tabs) {
    var re = {
        Accordion: Accordion,
        Carousel: Carousel,
        Slide: Slide,
        Tabs: Tabs
    };
    S.mix(Switchable, re);

    S.Switchable = Switchable;

    return Switchable;
}, {
    requires: [
        "switchable/base",
        "switchable/accordion/base",
        "switchable/carousel/base",
        "switchable/slide/base",
        "switchable/tabs/base",
        "switchable/lazyload",
        "switchable/effect",
        "switchable/circular",
        "switchable/carousel/aria",
        "switchable/autoplay",
        "switchable/aria",
        "switchable/tabs/aria",
        "switchable/accordion/aria",
        "switchable/touch"
    ]
});
