KISSY.add("switchable", function(S, Switchable, Accordion, autoplay, autorender, Carousel, circular, countdown, effect, lazyload, Slide, Tabs) {
    S.Switchable = Switchable
    var re = {
        Accordion:Accordion,
        Carousel:Carousel,
        Slide:Slide,
        Tabs:Tabs
    };
    S.mix(S, re);
    S.mix(Switchable, re);
    return Switchable;
}, {
    requires:["switchable/base",
        "switchable/accordion",
        "switchable/autoplay",
        "switchable/autorender",
        "switchable/carousel",
        "switchable/circular",
        "switchable/countdown",
        "switchable/effect",
        "switchable/lazyload",
        "switchable/slide",
        "switchable/tabs",
        "switchable/tabs-aria"]
});