/**
 * test cases for style sub module of dom module
 * @author:yiminghe@gmail.com
 */
KISSY.use("dom,ua", function(S, DOM, UA) {
    describe("style", function() {
        beforeEach(function() {
            this.addMatchers({
                    toBeAlmostEqual: function(expected) {
                        return Math.abs(parseInt(this.actual) - parseInt(expected)) < 20;
                    },


                    toBeEqual: function(expected) {
                        return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                    },

                    toBeArrayEq:function(expected) {
                        var actual = this.actual;
                        if (expected.length != actual.length) return false;
                        for (var i = 0; i < expected.length; i++) {
                            if (expected[i] != actual[i]) return false;
                        }
                        return true;
                    }
                });
        });
        it("css works", function() {

            var elem = DOM.create(' <div id="test-div" ' +
                'style="padding-left: 2pt; ' +
                'background: transparent; ' +
                '' +
                'float: left; ' +
                'border: 5px solid rgb(0,0,0);">x</div>');

            document.body.appendChild(elem);

            // getter
            expect(DOM.css(elem, 'float')).toBe('left');

            expect(DOM.css(elem, 'position')).toBe('static');

            expect(DOM.css(elem, 'backgroundColor')).toBe('transparent');

            expect(DOM.css(elem, 'backgroundPosition')).toBe('0% 0%');

            expect(DOM.css(elem, 'fontSize')).toBe('16px');

            expect(DOM.css(elem, 'border-right-width')).toBe('5px');

            expect(DOM.css(elem, 'paddingLeft')).toBe('2pt');

            expect(DOM.css(elem, 'padding-left')).toBe('2pt');

            expect(DOM.css(elem, 'padding-right')).toBe('0px');

            expect(DOM.css(elem, 'opacity')).toBe('1');

            // 不加入 dom 节点，ie9,firefox 返回 auto by computedStyle
            // ie7,8 返回负数，offsetHeight 返回0
            //alert(elem.currentStyle.height);== auto
            expect(parseInt(DOM.css(elem, 'height'))).toBeEqual(19);

            DOM.css(elem, 'float', 'right');

            expect(DOM.css(elem, 'float')).toBe('right');

            DOM.css(elem, 'font-size', '100%');

            expect(DOM.css(elem, 'font-size')).toBe('100%');

            DOM.css(elem, 'opacity', '0.2');

            expect(DOM.css(elem, 'opacity')).toBe('0.2');

            DOM.css(elem, 'border', '2px dashed red');

            expect(DOM.css(elem, 'borderWidth')).toBe('2px');


            DOM.css(elem, {
                    marginLeft: '20px',
                    opacity: '0.8',
                    border: '2px solid #ccc'
                });
            expect(DOM.css(elem, 'opacity')).toBe('0.8');

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

            DOM.remove([elem,test_filter]);

        });


        it("width/height works", function() {
            var elem = DOM.create(' <div id="test-div" ' +
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

        it("show/hide works", function() {
            var elem = DOM.create(' <div id="test-div" ' +
                'style="padding-left: 2pt; ' +
                'background: transparent; ' +
                '' +
                'float: left; ' +
                'border: 5px solid rgb(0,0,0);">x</div>');
            document.body.appendChild(elem);

            DOM.css(elem, 'display', 'none');
            DOM.show(elem);
            expect(DOM.css(elem, 'display')).not.toBe('none');

            DOM.removeAttr(elem, 'style');

            DOM.hide(elem);

            expect(DOM.css(elem, 'display')).toBe('none');

            DOM.removeAttr(elem, 'style');

            DOM.remove(elem);
        });


        it("toggle works", function() {
            var elem = DOM.create(' <div id="test-div" ' +
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


        it("addStyleSheet works", function() {
            var elem = DOM.create("<div class='addStyleSheet'>");
            document.body.appendChild(elem);
            DOM.addStyleSheet(".addStyleSheet {width:100px}");
            expect(DOM.css(elem, "width")).toBe("100px");
            DOM.remove(elem);
        });
    });
});