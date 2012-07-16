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
                    realStep = Math.floor(viewSize[0] / (offsetXX = DOM.outerWidth(panels[0], true)));
                } else if (effect == 'scrolly') {
                    prop = "top";
                    realStep = Math.floor(viewSize[1] / (offsetXX = DOM.outerHeight(panels[0], true)));
                }

                if (realStep <= config.steps) {
                    return;
                }

                totalXX = offsetXX * panels.length;
                lastIndex = panels.length - realStep + 1;

                self.on("beforeSwitch", function (e) {
                    var toIndex = e.toIndex,
                        gap, v = {
                            "position":"relative"
                        };
                    if (toIndex >= lastIndex) {
                        gap = Math.abs(toIndex - lastIndex);
                        v[prop] = totalXX;
                        DOM.css(panels[gap], v);
                    } else if (!toIndex) {
                        v[prop] = totalXX;
                        DOM.css(panels[realStep - 1], v);
                    }
                });

                self.on("switch", function (e) {
                    if (e.currentIndex == 0) {
                        var i, v = {
                            position:''
                        };
                        v[prop] = "";
                        for (i = 1; i < realStep; i++) {
                            DOM.css(panels[i], v);
                        }
                    }
                });
            }
        }
    });
}, {
    requires:['dom', './base']
});