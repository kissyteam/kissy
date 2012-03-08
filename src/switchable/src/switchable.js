/**
 * @fileOverview switchable
 */
KISSY.add("switchable", function (S, Switchable, Aria, Accordion, AAria, autoplay, autorender, Carousel, CAria, circular, countdown, effect, lazyload, Slide, SAria, Tabs, TAria) {
    var re = {
        Accordion:Accordion,
        Carousel:Carousel,
        Slide:Slide,
        Tabs:Tabs
    };
    S.mix(Switchable, re);
    return Switchable;
}, {
    requires:[
        "switchable/base",
        "switchable/aria",
        "switchable/accordion/base",
        "switchable/accordion/aria",
        "switchable/autoplay",
        "switchable/autorender",
        "switchable/carousel/base",
        "switchable/carousel/aria",
        "switchable/circular",
        "switchable/countdown",
        "switchable/effect",
        "switchable/lazyload",
        "switchable/slide/base",
        "switchable/slide/aria",
        "switchable/tabs/base",
        "switchable/tabs/aria"
    ]
});
