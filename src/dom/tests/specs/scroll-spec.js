/**
 * test cases for scroll sub module of dom module
 * @author yiminghe@gmail.com
 * @description: need to be completed
 */
KISSY.use("dom,core", function (S, DOM) {

    var $ = S.all;

    var tpl = '<div id="test-scroll">' +
            '<p>x</p>' +
            new Array(20).join('<p>x</p>') +
            '<div style="width:200px;' +
            'height:200px;overflow:auto;' +
            'border: 5px solid #ccc;"' +
            ' id="scroll-container">' +
            new Array(20).join('<p>x</p>') +
            '<div id="scroll-el" style="border:3px solid #9f9;">' +
            'test' +
            '</div>' +
            new Array(20).join('<p>x</p>') +
            '</div>' +
            new Array(4).join('<p>x</p>') +
            '<div id="scroll-iframe-holder"></div>' +
            new Array(20).join('<p>x</p>') +
            '</div>',

        iframeTpl = '<iframe src="../others/test-dom-offset-iframe.html"\
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
            container_height,
            node_height;

        beforeEach(function () {
            $('body').append(tpl);
            container = DOM.get('#scroll-container');
            node = DOM.get('#scroll-el');
            container_border_width = parseInt(DOM.css(container,
                "border-top-width"));
            container_height = DOM.height(container);
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
                toBeEqual: function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                }
            });
        });

        afterEach(function () {
            DOM.scrollTop(0);
            DOM.scrollTop(container, 0);
        });

        it("scroll node to container manually works", function () {

            DOM.scrollIntoView(node, container);

            var scrollTop = Math.round(DOM.scrollTop()),
                nt = Math.round(DOM.offset(node).top),
                ct = Math.round(DOM.offset(container).top);

            expect(scrollTop).toBeEqual(0);
            expect(nt - ct).toBeEqual(container_border_width);

            $('#scroll-iframe-holder')[0].innerHTML = iframeTpl;

            var iframe = S.get('#test-iframe');

            var ok = 0;

            $(iframe).on('load', function () {
                var inner = S.get('#test-inner', iframe.contentWindow.document);

                DOM.scrollIntoView(inner, iframe.contentWindow);
                nt = Math.round(DOM.offset(inner).top);
                expect(nt).toBeEqual(DOM.scrollTop(iframe.contentWindow));

                setTimeout(function () {
                    ok = 1;
                }, 100);
            });

            waitsFor(function () {
                return ok;
            });
        });

        it("scroll node to container at bottom", function () {

            waitsFor(function () {
                return node_height = node.offsetHeight;
            }, "node_height got", 10000);
            runs(function () {
                DOM.scrollIntoView(node, container, false);
                var nt = Math.round(DOM.offset(node).top);
                var ct = Math.round(DOM.offset(container).top);

                // 注意容器边框
                //  --------
                //  |      |
                //  | ---- |
                //  | |  | |
                //  | ---- |
                //  --------
                expect(nt).toBeEqual(ct +
                    container_border_width +
                    container_height -
                    node_height);
                DOM.scrollIntoView(container);
            });
        });

        if (S.UA.ios && window.frameElement) {

        } else {
            it("scroll node to bottom of window", function () {
                DOM.scrollIntoView(container);
                var ct = Math.round(DOM.offset(container).top);
                expect(ct)
                    .toBeEqual(DOM.scrollTop() +
                        document.body.clientTop +
                        document.documentElement.clientTop);
            });
        }

    });
});