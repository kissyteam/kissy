/**
 * Simple TC for KISSY AutoComplete
 * @author yiminghe@gmail.com
 */
KISSY.use("autocomplete", function (S, AutoComplete) {


    describe("simple autocomplete", function () {

        beforeEach(function () {
            this.addMatchers({
                toBeNearEqual:function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                }
            });
        });

        var data = ["1", "21", "31"];
        var DOM = S.DOM;
        var Event = S.Event;
        var KeyCodes = Event.KeyCodes;

        var autoComplete = new AutoComplete.Basic({
            srcNode:'#t',
            data:data,
            format:function (q, data) {
                var ret = [];
                S.each(data, function (d) {
                    ret.push({
                        content:d.replace(new RegExp(S.escapeRegExp(q), "g"), "<b>$&</b>"),
                        textContent:d
                    })
                });
                return ret;
            }
        });
        autoComplete.render();

        var t = S.get("#t");

        it("show menu with right alignment when input value " +
            "and hide when lose focus", function () {

            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");
            t.value = "1";

            jasmine.simulate(t, "keyup");

            waits(100);

            runs(function () {
                var menuEl = autoComplete.get("menu").get("el");
                expect(autoComplete.get("menu").get("visible")).toBe(true);
                var offsetT = DOM.offset(t);
                // var width=DOM.outerWidth(t);
                var height = DOM.outerHeight(t);
                var expectLeft = offsetT.left;
                var expectTop = offsetT.top + height;
                var menuElOffset = menuEl.offset();
                expect(menuElOffset.left).toBeNearEqual(expectLeft);
                expect(menuElOffset.top).toBeNearEqual(expectTop);

            });

            waits(30);

            runs(function () {
                t.blur();
            });

            waits(100);

            runs(function () {
                expect(autoComplete.get("menu").get("visible")).toBe(false);
            });

            waits(100);

        });

        it("should filter static data by default", function () {
            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");
            t.value = "2";

            jasmine.simulate(t, "keyup");

            waits(100);

            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                expect(children.length).toBe(1);
                expect(children[0].get("content")).toBe("<b>2</b>1");
                expect(children[0].get("textContent")).toBe("21");
                expect(children[0].get("value")).toBe("21");
                // 输入项和提示项 textContent 不一样，默认不高亮
                expect(menu.get("activeItem")).toBe(undefined);
                t.blur();
            });
            waits(100);
        });

        it("should format and select item right initially", function () {
            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");
            t.value = "1";

            jasmine.simulate(t, "keyup");

            waits(100);

            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");

                expect(children[0].get("content")).toBe("<b>1</b>");
                expect(children[1].get("content")).toBe("2<b>1</b>");
                expect(children[2].get("content")).toBe("3<b>1</b>");

                expect(children[0].get("textContent")).toBe("1");
                expect(children[1].get("textContent")).toBe("21");
                expect(children[2].get("textContent")).toBe("31");

                expect(children[0].get("value")).toBe("1");
                expect(children[1].get("value")).toBe("21");
                expect(children[2].get("value")).toBe("31");

                // 入项和第一个提示项 textContent 一样，那么第一个高亮
                expect(menu.get("activeItem")).toBe(children[0]);

            });

            waits(10);

            runs(function () {
                t.blur();
            });

            waits(100);
        });


        it("should response to keyboard and update input", function () {

            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");
            t.value = "1";

            jasmine.simulate(t, "keyup");

            waits(100);

            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                // 第一个高亮
                expect(menu.get("activeItem")).toBe(children[0]);

                jasmine.simulate(t, "keydown", {
                    keyCode:KeyCodes.DOWN
                });

            });
            waits(10);
            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                // 第二个高亮
                expect(menu.get("activeItem")).toBe(children[1]);

                // 先把 textContent 放到里面
                expect(t.value).toBe(children[1].get("textContent"));


                jasmine.simulate(t, "keydown", {
                    keyCode:KeyCodes.DOWN
                });
            });

            waits(10);
            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                // 第3个高亮
                expect(menu.get("activeItem")).toBe(children[2]);
                jasmine.simulate(t, "keydown", {
                    keyCode:KeyCodes.DOWN
                });
            });
            waits(10);
            // wrap
            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                // 第1个高亮
                expect(menu.get("activeItem")).toBe(children[0]);
                t.blur();
            });
            waits(100);
        });


        it("should response to mouse", function () {

            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");
            t.value = "1";

            jasmine.simulate(t, "keyup");

            waits(100);

            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                // 第一个高亮
                expect(menu.get("activeItem")).toBe(children[0]);

                jasmine.simulate(children[1].get("el")[0], "mouseover", {
                    relatedTarget:children[0].get("el")[0]
                });

            });
            waits(10);
            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                // 第二个高亮
                expect(menu.get("activeItem")).toBe(children[1]);
                t.blur();
            });
            waits(100);
        });


        it("should update selectedItem and hide menu", function () {

            autoComplete.__set("selectedItem", null);

            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");
            t.value = "1";

            jasmine.simulate(t, "keyup");

            waits(100);

            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                jasmine.simulate(t, "keydown", {
                    keyCode:KeyCodes.DOWN
                });

            });
            waits(10);
            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                // 第二个高亮
                expect(menu.get("activeItem")).toBe(children[1]);

                expect(autoComplete.get("selectedItem")).toBe(null);

                jasmine.simulate(t, "keydown", {
                    keyCode:KeyCodes.ENTER
                });
            });

            waits(10);

            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                expect(autoComplete.get("selectedItem")).toBe(children[1]);
                expect(menu.get('visible')).toBe(false);
            });
        });

        it("esc should restore value to original and hide menu", function () {

            autoComplete.__set("selectedItem", null);

            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");
            t.value = "1";

            jasmine.simulate(t, "keyup");

            waits(100);

            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                jasmine.simulate(t, "keydown", {
                    keyCode:KeyCodes.DOWN
                });

            });
            waits(10);
            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                // 第二个高亮
                expect(menu.get("activeItem")).toBe(children[1]);
                expect(autoComplete.get("selectedItem")).toBe(null);
                expect(t.value).toBe(children[1].get("textContent"));
                jasmine.simulate(t, "keydown", {
                    keyCode:KeyCodes.ESC
                });
            });

            waits(10);
            runs(function () {
                var menu = autoComplete.get("menu");
                var children = menu.get("children");
                expect(autoComplete.get("selectedItem")).toBe(null);
                expect(t.value).toBe("1");
                expect(menu.get('visible')).toBe(false);
            });
        });

    });
});