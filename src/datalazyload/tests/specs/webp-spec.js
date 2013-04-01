KISSY.use('datalazyload,dom,node', function (S, DataLazyload, DOM, Node) {
    var $ = Node.all;

    if (!S.UA.chrome) {
        return;
    }

    describe('datalazyload', function () {

        describe('should load webp image in chrome&opera', function () {
            it('should load webp image', function () {

                window.scrollTo(0, 0);

                waits(300);

                runs(function () {
                    $('<div style="width:9999px;height:9999px"></div>')
                        .appendTo('body');

                    var realSrc = 'http://img02.taobaocdn.com/tps/i2/T157UWXehXXXXrf6ny-500-190.jpg';
                    var realWebpSrc = realSrc + '_.webp';
                    var step = 5;
                    var diff = 200;
                    var viewportHeight = DOM.viewportHeight();

                    var img = $('<img style="position:absolute;">').appendTo('body');
                    img.css({
                        top: viewportHeight + diff + step
                    });
                    img.attr('data-ks-lazyload', realSrc);

                    var img2 = img.clone().appendTo('body');
                    var img2Src = 'http://i.mmcdn.cn/simba/img/T1DspSXrNeXXb1upjX.jpg';
                    img2.attr('data-ks-lazyload', img2Src);

                    var newImg = new Image();
                    newImg.src = 'http://a.tbcdn.cn/kissy/1.0.0/build/imglazyload/spaceball.gif';

                    var d = new DataLazyload({
                        diff: diff,
                        webpFilter: [
                            [/^(.+?(?:taobaocdn.com).+?)\.(png|jpg)$/, '$1.$2_.webp']
                        ]
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
                        // 根据支持情况 expect
                        DataLazyload.checkWebpSupport(function (isSupportWebp) {
                            if (isSupportWebp) {
                                expect(img.attr('src')).toBe(realWebpSrc);
                            } else {
                                expect(img.attr('src')).toBe(realSrc);
                            }
                            expect(img2.attr('src')).toBe(img2Src);

                            expect(d._destroyed).toBeTruthy();
                        });
                    });

                });

            });


            it('should load gif image', function () {
                window.scrollTo(0, 0);

                waits(300);

                runs(function () {
                    var step = 5;
                    var diff = 200;
                    var viewportHeight = DOM.viewportHeight();
                    var gifRealSrc = 'http://img01.taobaocdn.com/tps/i1/T1Pk2NXe8hXXXH_oTs-96-96.gif';

                    var gifImg = $('<img style="position:absolute;">').appendTo('body');
                    gifImg.css({
                        top: viewportHeight + diff + step * 2
                    });
                    gifImg.attr('data-ks-lazyload', gifRealSrc);

                    var newImg = new Image();
                    newImg.src = 'http://a.tbcdn.cn/kissy/1.0.0/build/imglazyload/spaceball.gif';

                    var d = new DataLazyload({
                        diff: diff,
                        webpFilter: function (dataSrc) {
                            var ret = '';
                            // 处理 taobaocdn 下 .jpg&.png 图片
                            if (dataSrc.indexOf('taobaocdn.com') != -1 &&
                                (dataSrc.indexOf('.jpg') != -1 || dataSrc.indexOf('.png') != -1)) {
                                ret = dataSrc + '_.webp';
                            } else {
                                ret = dataSrc;
                            }

                            return ret;
                        }
                    });

                    waitsFor(function () {
                        return !!newImg.complete;
                    });

                    runs(function () {
                        window.scrollTo(0, step * 2);
                    });

                    // need 300ms to fire scroll event
                    waits(300);

                    runs(function () {
                        expect(gifImg.attr('src')).toBe(gifRealSrc);
                        expect(d._destroyed).toBeTruthy();
                    })
                });
            });
        });

    });
});

