/**
 * test cases for scroll sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,core", function (S, DOM) {

    var $ = S.all;

    var tpl = '<div id="test-scroll" style="position:absolute;top:0;' +
            'left:0;width:300px;' +
            'background-color:white;">' +
            '<p>x</p>' +
            new Array(5).join('<p>x</p>') +
            '<div style="width:200px;' +
            'height:200px;overflow:auto;' +
            'position:relative;' +
            'border: 5px solid #ccc;"' +
            ' id="scroll-container">' +
            new Array(20).join('<p style="width:1000px;">x</p>') +
            '<div id="scroll-el" style="border:3px solid #9f9;' +
            'position:absolute;left:100px;">' +
            'test' +
            '</div>' +
            new Array(20).join('<p>x</p>') +
            '</div>' +
            new Array(4).join('<p>x</p>') +
            '<div id="scroll-iframe-holder"></div>' +
            new Array(20).join('<p>x</p>') +
            '</div>',

        iframeTpl = '<iframe src="../others/offset/test-dom-offset-iframe.html"\
        id="test-iframe"\
        style="border:1px solid black; "\
        width="200"\
        height="200"\
        frameborder="0"\
        scrolling="no"\
        ></iframe>';


    describe("scroll", function () {

        var container ,
            node , container_border_width,
            container_client_height,
            node_height;

        beforeEach(function () {
            $('body').append(tpl);
            container = DOM.get('#scroll-container');
            node = DOM.get('#scroll-el');
            container_border_width = parseInt(DOM.css(container,
                "border-top-width"));
            container_client_height = container.clientHeight;
            node_height = node.offsetHeight;
        });

        afterEach(function () {
            $('#test-scroll').remove();
        });

        beforeEach(function () {
            this.addMatchers({
                toBeAlmostEqual: function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 20;
                },
                toBeAbsEqual: function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 3;
                }
            });
        });

        afterEach(function () {
            DOM.scrollTop(0);
            DOM.scrollTop(container, 0);
        });

        describe('non-auto works', function () {
            it("scroll node to container at axis xy manually works", function () {

                var nodeOffset = DOM.offset(node),
                    containerOffset = DOM.offset(container);

                var scrollTop = nodeOffset.top - containerOffset.top - container_border_width;
                var scrollLeft = nodeOffset.left - containerOffset.left - container_border_width;

                DOM.scrollIntoView(node, container);

                nodeOffset = DOM.offset(node);
                containerOffset = DOM.offset(container);

                expect(DOM.scrollTop()).toBeAbsEqual(0);

                expect(DOM.scrollTop(container)).toBeAbsEqual(scrollTop);
                expect(DOM.scrollLeft(container)).toBeAbsEqual(scrollLeft);

                expect(nodeOffset.top - containerOffset.top).toBeAbsEqual(container_border_width);

                expect(DOM.scrollLeft()).toBeAbsEqual(0);
                expect(nodeOffset.left - containerOffset.left).toBeAbsEqual(container_border_width);
            });


            it("scroll node to container at axis y manually works", function () {
                var nodeOffset = DOM.offset(node),
                    containerOffset = DOM.offset(container);

                var scrollTop = nodeOffset.top - containerOffset.top - container_border_width;

                DOM.scrollIntoView(node, container, {
                    alignWithTop:true,
                    allowHorizontalScroll:false
                });

                nodeOffset = DOM.offset(node);
                containerOffset = DOM.offset(container);

                expect(DOM.scrollTop()).toBeAbsEqual(0);

                expect(DOM.scrollTop(container)).toBeAbsEqual(scrollTop);
                expect(DOM.scrollLeft(container)).toBeAbsEqual(0);

                expect(nodeOffset.top - containerOffset.top).toBeAbsEqual(container_border_width);

                expect(DOM.scrollLeft()).toBeAbsEqual(0);
                expect(nodeOffset.left - containerOffset.left).toBeAbsEqual(105);
            });

            it('works for iframe', function () {
                $('#scroll-iframe-holder')[0].innerHTML = iframeTpl;

                var iframe = S.get('#test-iframe');

                var ok = 0;

                $(iframe).on('load', function () {
                    var inner = S.get('#test-inner', iframe.contentWindow.document);
                    DOM.scrollIntoView(inner, iframe.contentWindow);
                    var nt = Math.round(DOM.offset(inner).top);
                    expect(nt).toBeAbsEqual(DOM.scrollTop(iframe.contentWindow));
                    setTimeout(function () {
                        ok = 1;
                    }, 100);
                });

                waitsFor(function () {
                    return ok;
                });
            });


            it("scroll node to container at bottom", function () {
                DOM.scrollIntoView(node, container, {
                    alignWithTop:false
                });
                var nt = Math.round(DOM.offset(node).top);
                var ct = Math.round(DOM.offset(container).top);

                // 注意容器边框
                //  --------
                //  |      |
                //  | ---- |
                //  | |  | |
                //  | ---- |
                //  --------
                expect(nt).toBeAbsEqual(ct +
                    container_border_width +
                    container_client_height -
                    node_height);
            });

            if (S.UA.ios && window.frameElement) {

            } else {
                it("scroll node into top view of window", function () {
                    DOM.scrollIntoView(container);
                    var ct = Math.round(DOM.offset(container).top);
                    expect(ct).toBeAbsEqual(DOM.scrollTop());
                });
            }
        });

        describe('auto works', function () {

            it('will not scroll if node is inside container', function () {

                DOM.scrollIntoView(node, container);

                DOM.scrollTop(container, DOM.scrollTop(container) - 10);

                var scrollTop = DOM.scrollTop(container);

                DOM.scrollIntoView(node, container, {
                    onlyScrollIfNeeded:true
                });

                expect(DOM.scrollTop(container)).toBe(scrollTop);

            });


            it('will scroll and adjust top to true if node is outside container', function () {

                DOM.scrollIntoView(node, container);

                var scrollTop = DOM.scrollTop(container);

                DOM.scrollTop(container, DOM.scrollTop(container) + 10);

                DOM.scrollIntoView(node, container,{
                    onlyScrollIfNeeded:true
                });

                expect(DOM.scrollTop(container)).toBe(scrollTop);

            });


            it('will scroll and adjust top to false if node is outside container', function () {

                DOM.scrollIntoView(node, container, {
                    alignWithTop:false
                });

                var scrollTop = DOM.scrollTop(container);

                DOM.scrollTop(container, DOM.scrollTop(container) - 10);

                DOM.scrollIntoView(node, container, {
                    onlyScrollIfNeeded:true
                });

                expect(DOM.scrollTop(container)).toBe(scrollTop);

            });


            it('will scroll and adjust top to true if node is outside container', function () {

                DOM.scrollIntoView(node, container, {
                    alignWithTop:true
                });

                var scrollTop = DOM.scrollTop(container);

                DOM.scrollIntoView(node, container,  {
                    alignWithTop:false
                });

                DOM.scrollTop(container, DOM.scrollTop(container) - 10);

                DOM.scrollIntoView(node, container,   {
                    alignWithTop:true,
                    onlyScrollIfNeeded:true
                });

                expect(DOM.scrollTop(container)).toBe(scrollTop);

            });


            it('will scroll to top false if node is outside container', function () {

                DOM.scrollIntoView(node, container, {
                    alignWithTop:false
                });

                var scrollTop = DOM.scrollTop(container);

                DOM.scrollIntoView(node, container, {
                    alignWithTop:true
                });

                DOM.scrollTop(container, DOM.scrollTop(container) + 10);

                DOM.scrollIntoView(node, container,{
                    alignWithTop:false,
                    onlyScrollIfNeeded:true
                });

                expect(DOM.scrollTop(container)).toBe(scrollTop);

            });

        });

    });
});