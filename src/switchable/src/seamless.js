/**
 * @fileOverview Seamless support for switchable
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/seamless", function (S, DOM, Switchable) {
    Switchable.addPlugin({
        name:'seamless',

        priority:5,

        init:function (self) {
            var config = self.config,
                panels = self.panels,
                container = self.container,
                effect = config.effect;

            if (config.steps == 1 && panels.length && config.circular) {
                var realStep = 1,
                    offsetXX,
                    prop,
                    lastIndex,
                    viewSize = [DOM.width(container), DOM.height(container)],
                    totalXX;

                if (effect == 'scrollx') {
                    prop = "left";
                    realStep = Math.floor(viewSize[0] / (offsetXX = panels[0].offsetWidth));
                } else if (effect == 'scrolly') {
                    prop = "top";
                    realStep = Math.floor(viewSize[1] / (offsetXX = panels[0].offsetHeight));
                }

                if (realStep <= config.steps) {
                    return;
                }

                totalXX = offsetXX * panels.length;
                lastIndex = panels.length - realStep + 1;

                self.on("beforeSwitch", function (e) {
                    var toIndex = e.toIndex;
                    if (toIndex >= lastIndex) {
                        var gap = Math.abs(toIndex - lastIndex);
                        DOM.css(panels[gap], "position", "relative");
                        DOM.css(panels[gap], prop, totalXX);
                    } else if (!toIndex) {
                        DOM.css(panels[realStep - 1], {
                            position:"relative"
                        });
                        DOM.css(panels[realStep - 1], prop, totalXX);
                    }
                });

                self.on("switch", function (e) {
                    if (e.currentIndex == 0) {
                        for (var i = 1; i < realStep; i++) {
                            DOM.css(panels[i], {
                                position:""
                            });
                            DOM.css(panels[i], prop, "");
                        }
                    }
                });
            }
        }
    });
}, {
    requires:['dom', './base']
});