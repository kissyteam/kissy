/**
 * Simple TC for KISSY ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.use("combobox", function (S, ComboBox) {

    window.focus();
    document.body.focus();

    var $ = S.all, ua = S.UA;

    describe("simple combobox", function () {

        beforeEach(function () {
            this.addMatchers({
                toBeNearEqual: function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                }
            });
        });

        var data = ["1", "21", "31"];
        var DOM = S.DOM;
        var Event = S.Event;
        var KeyCodes = Event.KeyCodes;

        var comboBox = new ComboBox({
            width: 200,
            render: '#container',
            dataSource: new ComboBox.LocalDataSource({
                data: data
            }),
            inputValue: '2',
            format: function (q, data) {
                var ret = [];
                S.each(data, function (d) {
                    ret.push({
                        content: d.replace(new RegExp(S.escapeRegExp(q), "g"), "<b>$&</b>"),
                        textContent: d
                    })
                });
                return ret;
            }
        });
        comboBox.render();

        var t = comboBox.get("input")[0];

        it('show autocomplete menu when press down key', function () {

            expect(t.value).toBe("2");

            jasmine.simulate(t, "keydown", {
                keyCode: KeyCodes.DOWN
            });


            waits(100);
            runs(function () {
                var menu = comboBox.get("menu");
                expect(menu.get).not.toBeFalsy();
                var children = menu.get("children");
                expect(children.length).toBe(1);
                expect(children[0].get('textContent')).toBe('21');
                expect(S.indexOf(menu.get("highlightedItem"), children)).toBe(-1);
                document.body.focus();
            });
            waits(100);
        });

        it("show menu with right alignment when input value " +
            "and hide when lose focus", function () {

            t.value = "";

            t.focus();

            // ios can simulate keydown??
            jasmine.simulate(t, "keydown");
            waits(100);
            runs(function () {
                t.value = "1";
            });
            waits(100);

            runs(function () {
                jasmine.simulate(t, "keyup");
            });

            waits(100);

            runs(function () {
                var menuEl = comboBox.get("menu").get("el");
                expect(comboBox.get("menu").get("visible")).toBe(true);
                var offsetT = comboBox.get("el").offset();
                // var width=DOM.outerWidth(t);
                var height = comboBox.get("el").outerHeight();
                var expectLeft = offsetT.left;
                var expectTop = offsetT.top + height;
                var menuElOffset = menuEl.offset();
                expect(menuElOffset.left).toBeNearEqual(expectLeft);
                expect(menuElOffset.top).toBeNearEqual(expectTop);
                // must focus again in firefox
                t.focus();
            });

            waits(300);

            runs(function () {
                // firefox will not trigger blur event??
                // $(t).fire("blur");
                t.blur();
            });

            waits(100);

            runs(function () {
                expect(comboBox.get("menu").get("visible")).toBe(false);
            });

            waits(100);

        });

        it("should filter static data by default", function () {
            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");
            waits(100);
            runs(function () {
                t.value = "2";
            });
            waits(100);

            runs(function () {
                jasmine.simulate(t, "keyup");
            });

            waits(100);

            runs(function () {
                var menu = comboBox.get("menu");
                var children = menu.get("children");
                expect(children.length).toBe(1);
                expect(children[0].get("content")).toBe("<b>2</b>1");
                expect(children[0].get("textContent")).toBe("21");
                expect(children[0].get("value")).toBe("21");
                // 输入项和提示项 textContent 不一样，默认不高亮
                expect(menu.get("highlightedItem")).toBeFalsy();
                t.blur();
            });
            waits(100);
        });

        it("should format and select item right initially", function () {
            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");
            waits(100);
            runs(function () {
                t.value = "1";
            });
            waits(100);

            runs(function () {
                jasmine.simulate(t, "keyup");
            });

            waits(100);

            runs(function () {
                var menu = comboBox.get("menu");
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
                expect(S.indexOf(menu.get("highlightedItem"), menu.get('children')))
                    .toBe(0);
            });

            waits(100);

            runs(function () {
                t.blur();
            });

            waits(100);
        });


        it("should response to keyboard and update input", function () {

            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");
            waits(100);
            runs(function () {
                t.value = "1";
            });
            waits(100);

            runs(function () {
                jasmine.simulate(t, "keyup");
            });

            waits(100);

            runs(function () {
                var menu = comboBox.get("menu");
                var children = menu.get("children");
                // 第一个高亮
                expect(S.indexOf(menu.get("highlightedItem"), children)).toBe(0);

                jasmine.simulate(t, "keydown", {
                    keyCode: KeyCodes.DOWN
                });

            });
            waits(100);
            runs(function () {
                var menu = comboBox.get("menu");
                var children = menu.get("children");
                // 第二个高亮
                expect(S.indexOf(menu.get("highlightedItem"), children)).toBe(1);

                // 先把 textContent 放到里面
                expect(t.value).toBe(children[1].get("textContent"));

                jasmine.simulate(t, "keydown", {
                    keyCode: KeyCodes.DOWN
                });
            });

            waits(100);
            runs(function () {
                var menu = comboBox.get("menu");
                var children = menu.get("children");
                // 第3个高亮
                expect(S.indexOf(menu.get("highlightedItem"), children)).toBe(2);
                jasmine.simulate(t, "keydown", {
                    keyCode: KeyCodes.DOWN
                });
            });
            waits(100);
            // wrap
            runs(function () {
                var menu = comboBox.get("menu");
                var children = menu.get("children");
                // 第1个高亮
                expect(S.indexOf(menu.get("highlightedItem"), children)).toBe(0);
                t.blur();
            });
            waits(100);
        });


        if (!S.UA.ios && !S.UA.android) {
            it("should response to mouse", function () {

                t.value = "";

                t.focus();

                jasmine.simulate(t, "keydown");
                waits(100);
                runs(function () {
                    t.value = "1";
                });
                waits(100);

                runs(function () {
                    jasmine.simulate(t, "keyup");
                });

                waits(100);

                runs(function () {
                    var menu = comboBox.get("menu");
                    var children = menu.get("children");
                    // 第一个高亮
                    expect(S.indexOf(menu.get("highlightedItem"), children)).toBe(0);

                    jasmine.simulate(children[1].get("el")[0], "mouseover", {
                        relatedTarget: children[0].get("el")[0]
                    });

                });
                waits(100);
                runs(function () {
                    var menu = comboBox.get("menu");
                    var children = menu.get("children");
                    // 第二个高亮
                    expect(S.indexOf(menu.get("highlightedItem"), children)).toBe(1);
                    t.blur();
                });
                waits(100);
            });
        }


        it("should update selectedItem and hide menu", function () {

            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");
            waits(100);
            runs(function () {
                t.value = "1";
            });
            waits(100);

            runs(function () {
                jasmine.simulate(t, "keyup");
            });

            waits(100);

            runs(function () {
                var menu = comboBox.get("menu");
                var children = menu.get("children");
                jasmine.simulate(t, "keydown", {
                    keyCode: KeyCodes.DOWN
                });

            });
            waits(100);
            runs(function () {
                var menu = comboBox.get("menu");
                var children = menu.get("children");
                // 第二个高亮
                expect(S.indexOf(menu.get("highlightedItem"), children)).toBe(1);

                jasmine.simulate(t, "keydown", {
                    keyCode: KeyCodes.ENTER
                });
            });

            waits(100);

            runs(function () {
                var menu = comboBox.get("menu");
                var children = menu.get("children");
                expect(t.value).toBe(children[1].get("textContent"));
                expect(menu.get('visible')).toBe(false);
            });
        });

        it("esc should restore value to original and hide menu", function () {

            t.value = "";

            t.focus();

            jasmine.simulate(t, "keydown");
            waits(100);
            runs(function () {
                t.value = "1";
            });
            waits(100);

            runs(function () {
                jasmine.simulate(t, "keyup");
            });

            waits(100);

            runs(function () {
                var menu = comboBox.get("menu");
                var children = menu.get("children");
                jasmine.simulate(t, "keydown", {
                    keyCode: KeyCodes.DOWN
                });

            });
            waits(100);
            runs(function () {
                var menu = comboBox.get("menu");
                var children = menu.get("children");
                // 第二个高亮
                expect(S.indexOf(menu.get("highlightedItem"), children)).toBe(1);
                expect(t.value).toBe(children[1].get("textContent"));
                jasmine.simulate(t, "keydown", {
                    keyCode: KeyCodes.ESC
                });
            });

            waits(100);
            runs(function () {
                var menu = comboBox.get("menu");
                var children = menu.get("children");
                expect(t.value).toBe("1");
                expect(menu.get('visible')).toBe(false);
            });
        });

    });
});