/*
 digital clock emulation
 @author yiminghe@gmail.com(chengyu)
 */
KISSY.add("digital-clock", function (S, undefined) {
    //clock number markup
    var CLOCK_NUMBER = ('<div class="Kcontainer">'
        + '<div class="Kelement  Kvertical Ke1">'
        + '<s class="Kfirst"></s>'
        + '<div class="Kbar"></div>'
        + '<b class="Klast"></b>'
        + '</div>'
        + '<div class="Kelement Kvertical Ke2">'
        + '<s class="Kfirst"></s>'
        + '<div class="Kbar"></div>'
        + '<b class="Klast"></b>'
        + '</div>'
        + '<div class="Kelement Khorizonal Ke3">'
        + '<s class="Kfirst"></s>'
        + '<div class="Kbar"></div>'
        + '<b class="Klast"></b>'
        + '</div>'
        + '<div class="Kelement  Kvertical Ke4">'
        + '<s class="Kfirst"></s>'
        + '<div class="Kbar"></div>'
        + '<b class="Klast"></b>'
        + '</div>'
        + '<div class="Kelement Kvertical Ke5">'
        + '<s class="Kfirst"></s>'
        + '<div class="Kbar"></div>'
        + '<b class="Klast"></b>'
        + '</div>'
        + '<div class="Kelement Khorizonal Ke6">'
        + '<s class="Kfirst"></s>' + '<div class="Kbar"></div>' +
        '<b class="Klast"></b>' + '</div>' + '<div class="Kelement Khorizonal Kex">' +
        '<s class="Kfirst"></s>' + '<div class="Kbar"></div>' + '<b class="Klast"></b>' +
        '</div>' + '</div>').replace(/K/g, "ks-digitalclock-"),
        N2 = function (str) {
            return parseInt(str, 2);
        }
        //colon markup
        ,
        COLON = ('<div class="Kcontainer">' + '<div class="Kcolon1">' + '<s class="Kcolon-top">' + '</s>' + '<b class="Kcolon-bottom">' + '</b>' + '</div>' + '<div class="Kcolon2">' + '<s class="Kcolon-top">' + '</s>' + '<b class="Kcolon-bottom">' + '</b>' + '</div>' + '</div>').replace(/K/g, "ks-digitalclock-")
        //clock container markup
        ,
        CLOCK_BORDER = "<div class='ks-digitalclock-border clearfix'>" + "</div>",
        Node = S.Node,
        //clock region
        C_WIDTH = 120,
        C_HEIGHT = 200,
        BORDER_L = 10,
        BORDER_S = 5,
        COLON_WIDTH = 30,
        COLON_LEFT = 0,
        COLON1_TOP = 60,
        COLON2_TOP = 90,
        KS_WIDTH = 710,
        S_ZOOM = 0.4,
        BG_COLOR = "#565656",
        //property shortcut for compression
        ks_digitalclock_first = ".ks-digitalclock-first",
        ks_digitalclock_last = ".ks-digitalclock-last",
        ks_digitalclock_element = ".ks-digitalclock-element",

        border_width = "border-width",
        ks_digitalclock_colon1 = ".ks-digitalclock-colon1",
        ks_digitalclock_colon2 = ".ks-digitalclock-colon2",
        WIDTH = "width",
        HEIGHT = "height",

        TOP = "top",
        LEFT = "left",
        ks_digitalclock_colon_top = ".ks-digitalclock-colon-top",
        ks_digitalclock_colon_bottom = ".ks-digitalclock-colon-bottom",
        VALUE = "value",
        //电子钟组成部分和相应div的对照
        DIGITAL_CONFIG = {
            0: N2("01111110"),
            1: N2("0110000"),
            2: N2("11101100"),
            3: N2("11111000"),
            4: N2("10110010"),
            5: N2("11011010"),
            6: N2("11011110"),
            7: N2("01110010"),
            8: N2("11111111"),
            9: N2("11111011")
        };
    //clock number attributes
    ClockNumber.ATTRS = {
        /*
         clock number value
         @default 0
         */
        value: {
            value: 8
        },
        zoomLimit: {
            value: 0.2
        },
        /*
         clock zoom value
         @default 1
         */
        zoom: 1
    };
    function ClockNumber(cfg) {
        var self = this;
        ClockNumber.superclass.constructor.call(self, cfg);
        self._domNode = new Node(CLOCK_NUMBER);
        self._bars = self._domNode.children();
        for (var i = 0; i < self._bars.length; i++) {
            self._bars[i] = new Node(self._bars[i]);
        }
        self.on("afterValueChange", self.repaint, self);
        self.on("afterZoomChange", self.zoom, self);
    }

    S.extend(ClockNumber, S.Base, {
        /**
         append this number to a clock container
         @param container {HTMLElement} clock container
         @return this for chain
         */
        appendTo: function (container) {
            var self = this;
            self._domNode.appendTo(container[0]);
            return self;
        },
        //internal use ,zoom number
        zoom: function (e) {
            var z = e.newVal;
            var self = this;
            self._domNode.css(WIDTH, C_WIDTH * z + "px");
            self._domNode.css(HEIGHT, C_HEIGHT * z + "px");
            //if zoom too small ,then triangle disappear !
            if (z >= this.get("zoomLimit")) {
                self._domNode.all(ks_digitalclock_element).each(function (node) {
                    node.css("background-color", "transparent");
                });
                self._domNode.all(ks_digitalclock_last).each(function (node) {
                    node.css(border_width, BORDER_L * z + "px");
                });
                self._domNode.all(ks_digitalclock_first).each(function (node) {
                    node.css(border_width, BORDER_L * z + "px");
                });
                self._bars[0].one(ks_digitalclock_first).css(border_width, BORDER_L * z + "px");
                self._bars[4].one(ks_digitalclock_first).css(border_width, BORDER_L * z + "px");
                self._bars[0].one(ks_digitalclock_last).css(border_width, BORDER_S * z + "px" + " " + BORDER_L * z + "px");
                self._bars[1].one(ks_digitalclock_first).css(border_width, BORDER_S * z + "px" + " " + BORDER_L * z + "px");
                self._bars[1].one(ks_digitalclock_last).css(border_width, BORDER_L * z + "px");
                self._bars[3].one(ks_digitalclock_last).css(border_width, BORDER_L * z + "px");
                self._bars[3].one(ks_digitalclock_first).css(border_width, BORDER_S * z + "px" + " " + BORDER_L * z + "px");
                self._bars[4].one(ks_digitalclock_last).css(border_width, BORDER_S * z + "px" + " " + BORDER_L * z + "px");
            } else {
                self._domNode.all(ks_digitalclock_element).each(function (node) {
                    node.css("background-color", BG_COLOR);
                });
            }
        },
        //internal use ,synchronize data with ui
        repaint: function (e) {
            var self = this,
                v = DIGITAL_CONFIG[e.newVal],
                preV = DIGITAL_CONFIG[e.preVal],
                diff = v ^ preV;
            //console.log(e.newVal,e.preVal,v.toString(2),preV.toString(2),diff.toString(2));
            for (var i = 0; i < self._bars.length; i++) {
                v = v >> 1;
                diff = diff >> 1;
                var node = self._bars[i],
                    b = v & 1,
                    diffB = diff & 1;
                if (b && diffB) {
                    node.css("display", "");
                } else if (diffB) {
                    node.css("display", "none");
                } else {
                    //console.log("unchanged");
                }
            }
        }
    });
    DigitalClock.ATTRS = {
        /*
         clock time
         @default now
         */
        date: {
            value: new Date()
        },
        zoom: {
            value: 1
        },
        /*
         trangle will disappear when lower enough
         @default 0.2
         */
        zoomLimit: {
            value: 0.2
        },
        /*
         clock container to append
         @default body
         */
        container: {
            valueFn: function () {
                return document.body;
            }
        }
    };

    function DigitalClock(cfg) {
        var self = this,
            i;
        DigitalClock.superclass.constructor.call(self, cfg);
        self._ns = [];
        self._container = new Node(CLOCK_BORDER);
        for (i = 0; i < 2; i++) {
            self._ns.push(new ClockNumber({
                zoomLimit: this.get("zoomLimit")
            }).appendTo(self._container));
        }
        self._colon = new Node(COLON).appendTo(self._container[0]);
        self._colonVisible = true;
        for (i = 0; i < 2; i++) {
            self._ns.push(new ClockNumber({
                zoomLimit: this.get("zoomLimit")
            }).appendTo(self._container));
        }
        for (i = 0; i < 2; i++) {
            var second = new ClockNumber({
                zoomLimit: this.get("zoomLimit")
            });
            second._domNode.addClass("ks-digitalclock-seconds").appendTo(self._container[0]);
            self._ns.push(second);
        }
        self._container.appendTo(self.get("container"));
        self.repaint({
            newVal: self.get("date")
        });
        self.zoom({
            newVal: self.get("zoom")
        });
        self.on("afterDateChange", self.repaint, self);
        self.on("afterZoomChange", self.zoom, self);
    }

    S.extend(DigitalClock, S.Base, {
        zoom: function (e) {
            var self = this;
            var z = e.newVal,
                i;
            for (i = 0; i < 4; i++)
                self._ns[i].set("zoom", z);
            for (i = 4; i < 6; i++)
                self._ns[i].set("zoom", z * S_ZOOM);
            self._colon.css(WIDTH, COLON_WIDTH * z + "px");
            self._colon.css(HEIGHT, C_HEIGHT * z + "px");
            self._colon.all(ks_digitalclock_colon_top).each(function (node) {
                node.css(border_width, BORDER_L * z + "px");
            });
            self._colon.all(ks_digitalclock_colon_bottom).each(function (node) {
                node.css(border_width, BORDER_L * z + "px");
            });
            self._container.css(WIDTH, KS_WIDTH * z + "px");
        },
        //internal use ,repaint its numbers and colon
        repaint: function (e) {
            var self = this;
            var d = e.newVal,
                h = d.getHours(),
                m = d.getMinutes(),
                s = d.getSeconds();
            //console.log(h,m,s);
            //h = 88,
            //    m = 88,
            //    s = 88;
            self._ns[0].set(VALUE, Math.floor(h / 10));
            self._ns[1].set(VALUE, Math.floor(h % 10));
            self._ns[2].set(VALUE, Math.floor(m / 10));
            self._ns[3].set(VALUE, Math.floor(m % 10));
            self._ns[4].set(VALUE, Math.floor(s / 10));
            self._ns[5].set(VALUE, Math.floor(s % 10));
            self._colonVisible = !self._colonVisible;
            self._colon.css("visibility", self._colonVisible ? "visible" : "hidden");
        }
    });
    S.DigitalClock = DigitalClock;
});