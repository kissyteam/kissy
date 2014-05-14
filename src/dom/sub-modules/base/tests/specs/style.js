/**
 * test cases for style sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom) {
    var UA = S.UA;

    describe('style', function () {
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
            var elem = Dom.create('<div id="test-div" ' +
                'style="padding-left: 2px; ' +
                'background: transparent; ' +
                '' +
                'float: left; ' +
                'border: 5px solid rgb(0,0,0);">x</div>');

            document.body.appendChild(elem);

            // getter
            expect(Dom.css(elem, 'float')).toBe('left');

            expect(Dom.css(elem, 'position')).toBe('static');

            if (UA.webkit) {
                expect(Dom.css(elem, 'backgroundColor')).toBe('rgba(0, 0, 0, 0)');
            } else {
                expect(Dom.css(elem, 'backgroundColor')).toBe('transparent');
            }

            expect(S.indexOf(Dom.css(elem, "backgroundPosition"), ['left 0% top 0%', '0% 0%']))
                .not.toBe(-1);

            expect(Dom.css(elem, 'fontSize')).toBeEqual('16px');

            expect(Dom.css(elem, 'border-right-width')).toBe('5px');

            expect(Dom.css(elem, 'paddingLeft')).toBe('2px');

            expect(Dom.css(elem, 'padding-left')).toBe('2px');

            expect(Dom.css(elem, 'padding-right')).toBe('0px');

            expect(Dom.css(elem, 'opacity')).toBeExactEqual('1');

            // 不加入 dom 节点，ie9,firefox 返回 auto by computedStyle
            // ie7,8 返回负数，offsetHeight 返回0
            //alert(elem.currentStyle.height);== auto
            expect(parseInt(Dom.css(elem, 'height'))).toBeEqual(19);

            Dom.css(elem, 'float', 'right');

            expect(Dom.css(elem, 'float')).toBe('right');

            Dom.css(elem, 'font-size', '100%');

            expect(Dom.css(elem, 'font-size')).toBeEqual('16px');

            Dom.css(elem, 'opacity', '0.2');

            expect(Dom.css(elem, 'opacity')).toBeExactEqual('0.2');

            Dom.css(elem, 'border', '2px dashed red');

            expect(Dom.css(elem, 'borderTopWidth')).toBe('2px');

            Dom.css(elem, {
                marginLeft: '20px',
                opacity: '0.8',
                border: '2px solid #ccc'
            });
            expect(Dom.css(elem, 'opacity')).toBeExactEqual('0.8');

            Dom.addStyleSheet(".shadow {\
                background-color: #fff;\
                -moz-box-shadow: rgba(0, 0, 0, 0.2) 2px 3px 3px;\
                -webkit-box-shadow: rgba(0, 0, 0, 0.2) 2px 3px 3px;\
                filter: progid:DXImageTransform.Microsoft.Shadow(direction = 155, Color = #dadada, Strength = 3)," +
                " progid:DXImageTransform.Microsoft.DropShadow(Color = #22aaaaaa, OffX = -2, OffY = -2);\
                }");

            var test_filter = Dom.create(' <div ' +
                'id="test-filter"' +
                ' class="shadow" ' +
                'style="height: 80px; ' +
                'width: 120px; ' +
                'border:1px solid #ccc;"></div>');
            document.body.appendChild(test_filter);
            // test filter  #issue5

            Dom.css(test_filter, 'opacity', .5);
            if (UA.ieMode < 9) {
                // 不加入 dom 节点取不到 class 定义的样式
                expect(test_filter.currentStyle.filter).toBe("progid:DXImageTransform.Microsoft.Shadow(direction = 155, Color = #dadada, Strength = 3), progid:DXImageTransform.Microsoft.DropShadow(Color = #22aaaaaa, OffX = -2, OffY = -2), alpha(opacity=50)");
            }

            Dom.remove([elem, test_filter]);
        });

        it("width/height works", function () {
            var elem = Dom.create('<div id="test-div" ' +
                'style="padding-left: 2pt; ' +
                'background: transparent; ' +
                '' +
                'float: left; ' +
                'border: 5px solid rgb(0,0,0);">x</div>');

            document.body.appendChild(elem);

            expect(Math.round(Dom.width(elem))).toBeEqual(7);
            expect(Math.round(Dom.height(elem))).toBeEqual(19);

            Dom.remove(elem);
        });

        it("show/hide works", function () {
            var elem = Dom.create('<div id="test-div" ' +
                'style="padding-left: 2pt; ' +
                'background: transparent; ' +
                '' +
                'float: left; ' +
                'border: 5px solid rgb(0,0,0);">x</div>');

            document.body.appendChild(elem);

            Dom.css(elem, 'display', 'none');

            Dom.show(elem);
            expect(Dom.css(elem, 'display')).toBe('block');

            Dom.removeAttr(elem, 'style');

            Dom.hide(elem);

            expect(Dom.css(elem, 'display')).toBe('none');

            Dom.removeAttr(elem, 'style');

            Dom.remove(elem);
        });

        it('show hide can precede css', function () {
            var id = S.guid('test-css');
            Dom.addStyleSheet('#' + id + ' {display:none}', 'xx-style' + id);
            var elem = Dom.create('<div></div>');
            elem.id = id;
            Dom.append(elem, document.body);
            Dom.show(elem);
            expect(Dom.css(elem, 'display')).toBe('block');
            Dom.remove(elem);
            Dom.remove('#' + 'xx-style' + id);
        });

        it("toggle works", function () {
            var elem = Dom.create('<div id="test-div" ' +
                'style="padding-left: 2pt; ' +
                'background: transparent; ' +
                '' +
                'float: left; ' +
                'border: 5px solid rgb(0,0,0);">x</div>');
            document.body.appendChild(elem);
            Dom.toggle(elem);
            expect(Dom.css(elem, 'display')).toBe('none');

            Dom.toggle(elem);

            expect(Dom.css(elem, 'display')).not.toBe('none');

            Dom.removeAttr(elem, 'style');

            Dom.remove(elem);
        });

        it("addStyleSheet works", function () {
            var elem = Dom.create("<div class='addStyleSheet'>12</div>");
            document.body.appendChild(elem);
            Dom.addStyleSheet(".addStyleSheet {width:100px}");
            expect(Dom.css(elem, 'width')).toBe("100px");
            Dom.remove(elem);
        });

        it("float works inline or from stylehsheet", function () {
            var tag = S.guid("float");
            Dom.addStyleSheet("." + tag + " {float:left}", tag + 'style');
            var d = Dom.create("<div class='" + tag + "' style='float:right'><" + "/div>")
            Dom.append(d, document.body);
            expect(Dom.css(d, "float")).toBe('right');
            expect(Dom.style(d, "float")).toBe('right');
            Dom.css(d, "float", "");

            expect(Dom.css(d, "float")).toBe('left');
            expect(Dom.style(d, "float")).toBe("");

            Dom.remove(d);
            Dom.remove('#' + tag + 'style');
        });

        // also test prop api
        it("float works inline or from stylehsheet", function () {
            var tag = S.guid("float");
            Dom.addStyleSheet("." + tag + " {float:left}", tag + 'style');

            var d = Dom.create("<div class='" + tag + "' style='float:right'><" + "/div>")
            Dom.append(d, document.body);
            expect(Dom.css(d, "float")).toBe('right');
            expect(Dom.style(d, "float")).toBe('right');
            // test style array
            Dom.style([d], "float", "");

            expect(Dom.css(d, "float")).toBe('left');
            expect(Dom.style(d, "float")).toBe("");


            // test style obj
            Dom.style([d], {"float": 'right'});

            expect(Dom.css(d, "float")).toBe('right');
            expect(Dom.style(d, "float")).toBe('right');

            Dom.remove(d);
            Dom.remove('#' + tag + 'style');
        });

        it("opacity works inline or from stylesheet", function () {
            var tag = S.guid("opacity");
            Dom.addStyleSheet("." + tag + " {opacity:0.55;filter:alpha(opacity=55); }", tag + 'style');

            var d = Dom.create("<div class='" + tag + "' style='" +
                "opacity:0.66;filter:Alpha(opacity=66); '>" +
                "<" + "/div>");
            Dom.append(d, document.body);
            expect(Dom.css(d, "opacity")).toBeExactEqual("0.66");
            expect(Dom.style(d, "opacity")).toBeExactEqual("0.66");

            Dom.css(d, "opacity", "");

            // https://github.com/kissyteam/kissy/issues/231
            expect(Dom.css(d, "opacity")).toBeExactEqual("0.55");

            expect(Dom.style(d, "opacity")).toBe("");

            Dom.css(d, "opacity", 0.66);

            expect(Dom.css(d, "opacity")).toBeExactEqual("0.66");
            expect(Dom.style(d, "opacity")).toBeExactEqual("0.66");
            Dom.remove(d);
            Dom.remove('#' + tag + 'style');
        });

        it('does not leave empty style', function () {
            var d = Dom.create('<div><div></div></div>');
            Dom.append(d, 'body');
            Dom.css(d.firstChild, 'height', '');
            expect(d.innerHTML.toLowerCase()).toBe('<div></div>');
        });

        it("left works for auto", function () {
            var el = $("<div style='position: relative;padding: 20px;'>" +
                "<div style='position: absolute'></div><span></span>" +
                "<s style='position: fixed'></s></div>").appendTo('body')[0];
            expect(Dom.css(el, 'left')).toBe('0px');
            expect(Math.round(parseFloat(Dom.css(Dom.get('div', el), "top")))).toBe(20);
            expect(Dom.css(Dom.get('span', el), "top")).toBe('auto');
            expect(parseInt(Dom.css(Dom.get('s', el), "top")) || 1)
                .toBe(parseInt(Dom.get('s', el).getBoundingClientRect().top) || 0);
        });

        it("solve #80", function () {
            var div = Dom.create("<div></div>");
            Dom.append(div, document.body);
            Dom.css(div, "font-family", "宋体");
            Dom.css(div, "font-family", "");
            expect(div.style.cssText).toBe("");
            div.removeAttribute('style');
            Dom.remove(div);
        });

        describe('outerWidth/height', function () {
            // #119 : https://github.com/kissyteam/kissy/issues/119
            it("outerWidth should works for display:none", function () {
                var div = Dom.create("<div style='width:100px;display:none;'>" +
                    "</div>");
                Dom.append(div, document.body);
                expect(Dom.innerWidth(div)).toBe(100);
                expect(Dom.outerWidth(div)).toBe(100);
                expect(Dom.width(div)).toBe(100);
                Dom.remove(div);
            });

            it("outerWidth should works for display:none !important", function () {
                var id = S.guid('test-id');
                var div = Dom.create("<div style='width:100px;' id='" + id + "' style='display:none;'>" +
                    "</div>");
                Dom.addStyleSheet('#' + id + '{display:none !important;}', id + 'style');
                Dom.append(div, document.body);
                expect(Dom.innerWidth(div)).toBe(100);
                expect(Dom.outerWidth(div)).toBe(100);
                expect(Dom.width(div)).toBe(100);
                Dom.remove(div);
                Dom.remove('#' + id + 'style');
            });

            it("inner/outer width/height works", function () {
                var elem = Dom.create('<div ' +
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

                expect(Math.round(Dom.width(elem))).toBeEqual(44);
                expect(Math.round(Dom.height(elem))).toBeEqual(44);

                expect(Math.round(Dom.innerWidth(elem))).toBeEqual(44 + 3 * 2);
                expect(Math.round(Dom.innerHeight(elem))).toBeEqual(44 + 3 * 2);

                expect(Math.round(Dom.outerWidth(elem))).toBeEqual(44 + 3 * 2 + 5 * 2);
                expect(Math.round(Dom.outerWidth(elem))).toBeEqual(44 + 3 * 2 + 5 * 2);


                expect(Math.round(Dom.outerWidth(elem, true))).toBeEqual(44 + 3 * 2 + 5 * 2 + 9 * 2);
                expect(Math.round(Dom.outerHeight(elem, true))).toBeEqual(44 + 3 * 2 + 5 * 2 + 9 * 2);

                Dom.remove(elem);
            });
        });

        it("css works for element not added to document yet for ie<9", function () {
            var ret = 0;
            try {
                Dom.css(document.createElement("span"), "display");
                ret = 1;
            } catch (e) {
            }
            expect(ret).toBe(1);
        });

        it('css works for margin-right for safari 5.1', function () {
            var div = Dom.create('<div style="width:100px;">' +
                '<div style="margin-left:10%"></div></div>');

            Dom.append(div, document.body);

//            var t=div.firstChild;
//            t.style.left='10%';
//            alert(t.style.pixelLeft);
            // ie6 not pass! see above
            if (UA.ie != 6) {
                expect(Dom.css(div.firstChild, 'margin-left')).toBe('10px');
            }
            Dom.remove(div);
        });

        it('support box-sizing border-box', function () {
            var div = Dom.create('<div style="' +
                'width:100px;height:101px;' +
                'margin: 10px 11px;padding: 7px 8px;' +
                'border: 3px solid #000000;' +
                'border-left-width:4px;"></div>');
            Dom.css(div, 'box-sizing', 'border-box');
            Dom.append(div, document.body);
            if (div.offsetWidth !== 100) {
                return;
            }

            var $div=$(div);

            expect(Dom.css(div, 'width')).toBe($div.css('width'));
            expect(Dom.css(div, 'height')).toBe($div.css('height'));
            expect(Dom.width(div)).toBe($div.width());
            expect(Dom.height(div)).toBe($div.height());
            expect(Dom.innerWidth(div)).toBe($div.innerWidth());
            expect(Dom.innerHeight(div)).toBe($div.innerHeight());
            expect(Dom.outerWidth(div)).toBe($div.outerWidth());
            expect(Dom.outerHeight(div)).toBe($div.outerHeight());
            expect(Dom.outerWidth(div, true)).toBe($div.outerWidth(true));
            expect(Dom.outerHeight(div, true)).toBe($div.outerHeight(true));

            Dom.width(div,100);
            Dom.height(div,104);

            expect(Dom.css(div, 'width')).toBe($div.css('width'));
            expect(Dom.css(div, 'height')).toBe($div.css('height'));
            expect(Dom.width(div)).toBe($div.width());
            expect(Dom.height(div)).toBe($div.height());
            expect(Dom.innerWidth(div)).toBe($div.innerWidth());
            expect(Dom.innerHeight(div)).toBe($div.innerHeight());
            expect(Dom.outerWidth(div)).toBe($div.outerWidth());
            expect(Dom.outerHeight(div)).toBe($div.outerHeight());
            expect(Dom.outerWidth(div, true)).toBe($div.outerWidth(true));
            expect(Dom.outerHeight(div, true)).toBe($div.outerHeight(true));

            Dom.remove(div);
        });
    });
}, {
    requires: ['dom']
});