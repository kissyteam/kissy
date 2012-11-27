/**
 * test cases for style sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,ua,core", function (S, DOM, UA) {

    var $ = S.all;

    describe("style", function () {
        beforeEach(function () {

            this.addMatchers({

                toBeAlmostEqual: function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 20;
                },

                toBeEqual: function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                },

                toBeExactEqual: function (expected) {
                    return Math.abs(Number(this.actual) - Number(expected)) < 1e-6;
                }

            });

        });
        it("css works", function () {

            var elem = DOM.create('<div id="test-div" ' +
                'style="padding-left: 2px; ' +
                'background: transparent; ' +
                '' +
                'float: left; ' +
                'border: 5px solid rgb(0,0,0);">x</div>');

            document.body.appendChild(elem);

            // getter
            expect(DOM.css(elem, 'float')).toBe('left');


            expect(DOM.css(elem, 'position')).toBe('static');

            if (UA.webkit) {
                expect(DOM.css(elem, 'backgroundColor')).toBe('rgba(0, 0, 0, 0)');
            } else {
                expect(DOM.css(elem, 'backgroundColor')).toBe('transparent');
            }

            // expect($(elem).css("backgroundPosition")).toBe('0% 0%');

            if (UA.webkit) {
                expect(DOM.css(elem, "backgroundPosition")).toBe('0% 0%');
            } else {
                expect(DOM.style(elem, 'backgroundPosition')).toBe('0% 0%');
            }

            expect(DOM.css(elem, 'fontSize')).toBeEqual('16px');

            expect(DOM.css(elem, 'border-right-width')).toBe('5px');

            expect(DOM.css(elem, 'paddingLeft')).toBe('2px');

            expect(DOM.css(elem, 'padding-left')).toBe('2px');

            expect(DOM.css(elem, 'padding-right')).toBe('0px');

            expect(DOM.css(elem, 'opacity')).toBeExactEqual('1');

            // 不加入 dom 节点，ie9,firefox 返回 auto by computedStyle
            // ie7,8 返回负数，offsetHeight 返回0
            //alert(elem.currentStyle.height);== auto
            expect(parseInt(DOM.css(elem, 'height'))).toBeEqual(19);

            DOM.css(elem, 'float', 'right');

            expect(DOM.css(elem, 'float')).toBe('right');

            DOM.css(elem, 'font-size', '100%');

            expect(DOM.css(elem, 'font-size')).toBeEqual('16px');

            DOM.css(elem, 'opacity', '0.2');

            expect(DOM.css(elem, 'opacity')).toBeExactEqual('0.2');

            DOM.css(elem, 'border', '2px dashed red');

            expect(DOM.css(elem, 'borderTopWidth')).toBe('2px');


            DOM.css(elem, {
                marginLeft: '20px',
                opacity: '0.8',
                border: '2px solid #ccc'
            });
            expect(DOM.css(elem, 'opacity')).toBeExactEqual('0.8');

            DOM.addStyleSheet(".shadow {\
                background-color: #fff;\
                -moz-box-shadow: rgba(0, 0, 0, 0.2) 2px 3px 3px;\
                -webkit-box-shadow: rgba(0, 0, 0, 0.2) 2px 3px 3px;\
                filter: progid:DXImageTransform.Microsoft.Shadow(direction = 155, Color = #dadada, Strength = 3)," +
                " progid:DXImageTransform.Microsoft.DropShadow(Color = #22aaaaaa, OffX = -2, OffY = -2);\
                }");

            var test_filter = DOM.create(' <div ' +
                'id="test-filter"' +
                ' class="shadow" ' +
                'style="height: 80px; ' +
                'width: 120px; ' +
                'border:1px solid #ccc;"></div>');
            document.body.appendChild(test_filter);
            // test filter  #issue5

            DOM.css(test_filter, 'opacity', .5);
            if (UA.ie < 9) {
                // 不加入 dom 节点取不到 class 定义的样式
                expect(test_filter.currentStyle.filter).toBe("progid:DXImageTransform.Microsoft.Shadow(direction = 155, Color = #dadada, Strength = 3), progid:DXImageTransform.Microsoft.DropShadow(Color = #22aaaaaa, OffX = -2, OffY = -2), alpha(opacity=50)");
            }

            DOM.remove([elem, test_filter]);

        });


        it("width/height works", function () {
            var elem = DOM.create('<div id="test-div" ' +
                'style="padding-left: 2pt; ' +
                'background: transparent; ' +
                '' +
                'float: left; ' +
                'border: 5px solid rgb(0,0,0);">x</div>');

            document.body.appendChild(elem);

            expect(Math.round(DOM.width(elem))).toBeEqual(7);
            expect(Math.round(DOM.height(elem))).toBeEqual(19);

            DOM.remove(elem);
        });


        it("inner/outer width/height works", function () {
            var elem = DOM.create('<div ' +
                'style="' +
                'position:absolute;' +
                'margin:9px; ' +
                'background: transparent; ' +
                'padding:3px;' +
                'border: 5px solid rgb(0,0,0);"><div ' +
                'style="padding: 0;margin: 0;' +
                'width:44px;height:44px;font-size:0;line-height:0;"></div>' +
                '</div>');

            document.body.appendChild(elem);

            expect(Math.round(DOM.width(elem))).toBeEqual(44);
            expect(Math.round(DOM.height(elem))).toBeEqual(44);

            expect(Math.round(DOM.innerWidth(elem))).toBeEqual(44 + 3 * 2);
            expect(Math.round(DOM.innerHeight(elem))).toBeEqual(44 + 3 * 2);

            expect(Math.round(DOM.outerWidth(elem))).toBeEqual(44 + 3 * 2 + 5 * 2);
            expect(Math.round(DOM.outerWidth(elem))).toBeEqual(44 + 3 * 2 + 5 * 2);


            expect(Math.round(DOM.outerWidth(elem, true))).toBeEqual(44 + 3 * 2 + 5 * 2 + 9 * 2);
            expect(Math.round(DOM.outerHeight(elem, true))).toBeEqual(44 + 3 * 2 + 5 * 2 + 9 * 2);

            DOM.remove(elem);
        });


        it("show/hide works", function () {

            var elem = DOM.create('<div id="test-div" ' +
                'style="padding-left: 2pt; ' +
                'background: transparent; ' +
                '' +
                'float: left; ' +
                'border: 5px solid rgb(0,0,0);">x</div>');

            document.body.appendChild(elem);

            DOM.css(elem, 'display', 'none');


            DOM.show(elem);
            expect(DOM.css(elem, 'display')).toBe('block');

            DOM.removeAttr(elem, 'style');

            DOM.hide(elem);

            expect(DOM.css(elem, 'display')).toBe('none');

            DOM.removeAttr(elem, 'style');

            DOM.remove(elem);

        });


        it("toggle works", function () {
            var elem = DOM.create('<div id="test-div" ' +
                'style="padding-left: 2pt; ' +
                'background: transparent; ' +
                '' +
                'float: left; ' +
                'border: 5px solid rgb(0,0,0);">x</div>');
            document.body.appendChild(elem);
            DOM.toggle(elem);
            expect(DOM.css(elem, 'display')).toBe('none');

            DOM.toggle(elem);

            expect(DOM.css(elem, 'display')).not.toBe('none');

            DOM.removeAttr(elem, 'style');


            DOM.remove(elem);
        });


        it("addStyleSheet works", function () {
            var elem = DOM.create("<div class='addStyleSheet'>12</div>");
            document.body.appendChild(elem);
            DOM.addStyleSheet(".addStyleSheet {width:100px}");
            expect(DOM.css(elem, "width")).toBe("100px");
            DOM.remove(elem);
        });


        it("float works inline or from stylehsheet", function () {

            var tag = S.guid("float");
            DOM.addStyleSheet("." + tag + " {float:left}")

            var d = DOM.create("<div class='" + tag + "' style='float:right'><" + "/div>")
            DOM.append(d, document.body);
            expect(DOM.css(d, "float")).toBe("right");
            expect(DOM.style(d, "float")).toBe("right");
            DOM.css(d, "float", "");

            expect(DOM.css(d, "float")).toBe("left");
            expect(DOM.style(d, "float")).toBe("");

            DOM.remove(d);
        });


        it("float works inline or from stylehsheet", function () {

            var tag = S.guid("float");
            DOM.addStyleSheet("." + tag + " {float:left}");

            var d = DOM.create("<div class='" + tag + "' style='float:right'><" + "/div>")
            DOM.append(d, document.body);
            expect(DOM.css(d, "float")).toBe("right");
            expect(DOM.style(d, "float")).toBe("right");
            DOM.css(d, "float", "");

            expect(DOM.css(d, "float")).toBe("left");
            expect(DOM.style(d, "float")).toBe("");


            DOM.css(d, "float", "right");

            expect(DOM.css(d, "float")).toBe("right");
            expect(DOM.style(d, "float")).toBe("right");

            DOM.remove(d);
        });

        it("opacity works inline or from stylesheet", function () {
            var tag = S.guid("opacity");
            DOM.addStyleSheet("." + tag + " {opacity:0.55;filter:alpha(opacity=55); }");

            var d = DOM.create("<div class='" + tag + "' style='" +
                "opacity:0.66;filter:Alpha(opacity=66); '>" +
                "<" + "/div>");
            DOM.append(d, document.body);
            expect(DOM.css(d, "opacity")).toBeExactEqual("0.66");
            expect(DOM.style(d, "opacity")).toBeExactEqual("0.66");

            DOM.css(d, "opacity", "");

            // https://github.com/kissyteam/kissy/issues/231
            expect(DOM.css(d, "opacity")).toBeExactEqual("0.55");

            expect(DOM.style(d, "opacity")).toBe("");

            DOM.css(d, "opacity", 0.66);

            expect(DOM.css(d, "opacity")).toBeExactEqual("0.66");
            expect(DOM.style(d, "opacity")).toBeExactEqual("0.66");
            DOM.remove(d);
        });

        it('does not leave empty style', function () {
            var d = DOM.create('<div><div></div></div>');
            DOM.append(d, 'body');
            DOM.css(d.firstChild, 'height', '');
            expect(d.innerHTML.toLowerCase()).toBe('<div></div>');
        });

        it("left works for auto in", function () {
            var div = DOM.create("<div style='position:absolute;'></div>");
            DOM.append(div, document.body);
            expect(DOM.css(div, "left"))
                .toBe((div.offsetLeft - document.documentElement.clientLeft) + "px");
            DOM.remove(div);
        });


        it("solve #80", function () {
            var div = DOM.create("<div></div>");
            DOM.append(div, document.body);
            DOM.css(div, "font-family", "宋体");
            DOM.css(div, "font-family", "");
            expect(div.style.cssText).toBe("");
            div.removeAttribute("style");
            DOM.remove(div);
        });

        // #119 : https://github.com/kissyteam/kissy/issues/119
        it("outerWidth should works for display:none", function () {
            var div = DOM.create("<div style='display:none;'>" +
                "<div style='width:100px;'></div>" +
                "</div>");
            DOM.append(div, document.body);
            expect(DOM.innerWidth(div)).toBe(100);
            expect(DOM.outerWidth(div)).toBe(100);
            expect(DOM.width(div)).toBe(100);
            DOM.remove(div);
        });

        it("css works for element not added to document yet for ie<9", function () {
            var ret = 0;
            try {
                DOM.css(document.createElement("span"), "display");
                ret = 1;
            } catch (e) {
            }
            expect(ret).toBe(1);
        });

        it('css works for margin-right for safari 5.1', function () {

            var div = DOM.create('<div style="width:100px;">' +
                '<div style="margin-left:10%"></div></div>');

            DOM.append(div, document.body);

//            var t=div.firstChild;
//            t.style.left='10%';
//            alert(t.style.pixelLeft);
            // ie6 not pass! see above
            if (UA.ie != 6) {
                expect(DOM.css(div.firstChild, 'margin-left')).toBe('10px');
            }
            DOM.remove(div);

        });

    });
});