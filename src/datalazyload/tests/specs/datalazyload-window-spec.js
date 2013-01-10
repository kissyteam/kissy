KISSY.use('datalazyload,dom,node', function (S, DataLazyload, DOM, Node) {
    var $ = Node.all;
    describe('datalazyload', function () {

        describe('simple number diff', function () {
            it('support window as container', function () {

                window.scrollTo(0, 0);

                waits(300);

                runs(function () {

                    $('<div style="width:9999px;height:9999px"></div>')
                        .appendTo('body');

                    var realSrc = 'http://img02.taobaocdn.com/tps/i2/T157UWXehXXXXrf6ny-500-190.jpg';
                    var step=5;
                    var diff = 200;
                    var viewportHeight = DOM.viewportHeight();


                    var img = $('<img style="position:absolute;">').appendTo('body');
                    img.css({
                        top: viewportHeight + diff+step
                    });

                    img.attr('data-ks-lazyload', realSrc);

                    var newImg = new Image();
                    newImg.src = 'http://a.tbcdn.cn/kissy/1.0.0/build/imglazyload/spaceball.gif';

                    var d = new DataLazyload({
                        diff: diff
                    });

                    waitsFor(function () {
                        return !!newImg.complete;
                    });

                    runs(function () {
                        expect(img.attr('src')).not.toBe(realSrc);
                        expect(d._destroyed).toBeFalsy();
                    });

                    runs(function () {
                        window.scrollTo(0, step);
                    });

                    // need 300ms to fire scroll event
                    waits(300);

                    runs(function () {
                        expect(img.attr('src')).toBe(realSrc);
                        expect(d._destroyed).toBeTruthy();
                    });

                });

            });
        });

    });
});