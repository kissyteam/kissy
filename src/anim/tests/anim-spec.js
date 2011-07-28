/**
 * testcase for kissy.anim
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,anim", function(S, DOM, Anim) {

    function padding(s) {
        if (s.length == 1)
            return "0" + s;
        return s;
    }

    function normalizeColor(c) {
        if (c.toLowerCase().lastIndexOf("rgb(") == 0) {
            var x = [];
            c.replace(/\d+/g, function(m) {
                x.push(padding(Number(m).toString(16)));
            });
            c = "#" + x.join("");
        } else if (c.length == 4) {
            c = c.replace(/[^#]/g, function(c) {
                return c + c;
            });
        }
        return c;
    }

    /**
     * test for css anim native support
     */
    var transitionName = Anim.supportTransition();
    if (transitionName) {
        transitionName += "Property";
    }


    describe("anim", function() {

        it("setup", function() {
            var textarea = DOM.get("textarea");
            DOM.append(DOM.create(DOM.val(textarea)), "body");
            DOM.hide(textarea);
        });

        it("should start and end anim properly", function() {

            var test1 = DOM.get("#test1");
            DOM.css(test1, {
                    //'border-color':"#000",
                    width:10,
                    height:20,
                    left:120,
                    top:20,
                    color:"#000"
                });
            var initColor = normalizeColor(DOM.css(test1, "border-color"));

            var anim = Anim(
                '#test1',
                {
                    'background-color':'#fcc',
                    //'border': '5px dashed #999',
                    'border-wdith':'5px',
                    'border-color':"#999999",
                    'border-style':"dashed",
                    'width': '100px',
                    'height': '50px',
                    'left': '900px',
                    'top': '285px',
                    'opacity': '.5',
                    'font-size': '48px',
                    'padding': '30px 0',
                    'color': '#FF3333'
                },
                2
            );

            anim.run();

            waits(100);

            runs(function() {

                if (transitionName) {
                    //if native supported , just set css property directly
                    expect(DOM.css(test1, transitionName)).toBe("all");
                    expect(DOM.css(test1, "width")).toBe("100px");
                    expect(DOM.css(test1, "height")).toBe("50px");
                    expect(DOM.css(test1, "left")).toBe("900px");
                    expect(DOM.css(test1, "top")).toBe("285px");
                } else {
                    expect(normalizeColor(DOM.css(test1, "borderTopColor")))
                        .not.toBe(initColor);
                    expect(DOM.css(test1, "width")).not.toBe("10px");
                    expect(DOM.css(test1, "height")).not.toBe("20px");
                    expect(DOM.css(test1, "left")).not.toBe("120px");
                    expect(DOM.css(test1, "top")).not.toBe("20px");
                }

            });

            waits(2500);
            runs(function() {
                if (transitionName) {
                    expect(DOM.css(test1, transitionName)).toBe("none");
                }
                expect(normalizeColor(DOM.css(test1, "border-color")))
                    .toBe("#999999");
                expect(DOM.css(test1, "width")).toBe("100px");
                expect(DOM.css(test1, "height")).toBe("50px");
                expect(DOM.css(test1, "left")).toBe("900px");
                expect(DOM.css(test1, "top")).toBe("285px");
            });

        });

        it("should animate scroll correctly", function() {

            var test = DOM.get("#test8");
            test.scrollLeft = 500;
            var scrollLimit = test.scrollLeft;
            test.scrollLeft = 0;
            S.log(scrollLimit);
            Anim(test, {
                    scrollLeft:scrollLimit
                }, 2).run();
            waits(100);
            runs(function() {
                expect(test.scrollLeft).not.toBe(0);
            });
            waits(2000);
            runs(function() {
                expect(test.scrollLeft).toBe(scrollLimit);
            });

        });
    });
});