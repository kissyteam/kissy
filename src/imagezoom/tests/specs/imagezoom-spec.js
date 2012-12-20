/**
 * Tc for imagezoom
 * @author qiaohua@taobao.com, yiminghe@gmail.com
 */
KISSY.use("imagezoom", function (S, ImageZoom) {

    var imageWidth = 310;
    var imageHeight = 310;
    var testWidth = 400;
    var testHeight = imageHeight;
    var bigImageWidth = 600;
    var bigImageHeight = 900;
    // simulate mouse event on any element
    var simulate = function (target, type, relatedTarget) {
        jasmine.simulate(target[0], type, { relatedTarget: relatedTarget });
    };

    function isHidden(obj) {
        return obj.css('display') === 'none' || obj.css('visibility') === 'hidden';
    }

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
    describe('图片放大组件', function () {
        describe('标准模式下,', function () {

            var a = new ImageZoom({
                imageNode: "#standard",
                width: testWidth,
                align: {
                    points: ["tr", "tl"],
                    offset: [0, 0]
                },
                bigImageSrc: "http://img03.taobaocdn.com/bao/uploaded/i3/T1fftwXf8jXXX7ps79_073021.jpg",
                bigImageWidth: bigImageWidth,
                bigImageHeight: bigImageHeight
            });

            it('初始化后, 小图 DOM 结构正确', function () {
                expect(a.imageWrap).toBeDefined();
                expect(a.imageWrap.hasClass('ks-imagezoom-wrap')).toEqual(true);
            });

            it('显示放大镜图标', function () {
                runs(function () {
                    expect(a.icon).toBeDefined();
                    expect(a.icon.hasClass('ks-imagezoom-icon')).toEqual(true);
                });
            });

            it('能够正确显示大图', function () {
                var offset = a.get('imageNode').offset();

                simulate(a.get('imageNode'), "mouseover", document.body);

                waits(100);

                runs(function () {
                    a.set('currentMouse', {
                        pageX: offset.left + 100,
                        pageY: offset.top + 100
                    });
                });

                waits(100);
                runs(function () {
                    expect(isHidden(a.icon)).toEqual(true);
                    expect(a.get("el")).toBeDefined();
                    expect(a.bigImage).toBeDefined();
                    expect(isHidden(a.get("el"))).toEqual(false);
                    expect(a.bigImage.width()).toEqual(bigImageWidth);
                    expect(a.bigImage.height()).toEqual(bigImageHeight);
                    expect(a.get("el").width()).toEqual(testWidth);
                    expect(a.lens).toBeDefined();
                    expect(isHidden(a.lens)).toEqual(false);
                    expect(a.lens.width()).toBeEqual(testWidth * imageWidth / bigImageWidth);
                    expect(a.lens.height()).toBeEqual(testHeight * imageHeight / bigImageHeight);
                });
            });

            it('移动鼠标时, 设置坐标正确', function () {
                var oft = a.get('imageNode').offset();

                simulate(a.get('imageNode'), "mouseover", document.body);

                waits(100);

                runs(function () {

                    a.set('currentMouse', {
                        pageX: oft.left + 200,
                        pageY: oft.top + 200
                    });
                });

                waits(100);
                runs(function () {
                    expect(a.lensLeft).toBeEqual(oft.left + 200 -
                        (testWidth * imageWidth / bigImageWidth) / 2);
                    expect(a.bigImage.css('left'))
                        .toBeEqual(-Math.round((a.lensLeft - oft.left) * bigImageWidth / imageWidth)
                            + 'px');
                    expect(a.bigImage.css('top'))
                        .toBeEqual(-Math.round((a.lensTop - oft.top) * bigImageHeight / imageHeight)
                            + 'px');
                });
            });

            it('移动鼠标时, 边界正确', function () {
                a.hide();

                var oft = a.get('imageNode').offset();

                simulate(a.get('imageNode'), "mouseover", document.body);

                waits(100);

                runs(function () {

                    a.set('currentMouse', {
                        pageX: oft.left + testWidth - 10,
                        pageY: oft.top + 300
                    });
                });

                waits(100);
                runs(function () {
                    expect(a.lensLeft).toBeEqual(oft.left + imageWidth -
                        (testWidth * imageWidth / bigImageWidth));
                    expect(a.bigImage.css('left'))
                        .toBeEqual(testWidth - a.bigImage.width());
                    expect(a.bigImage.css('top'))
                        .toBeEqual(testHeight - a.bigImage.height());
                });
            });

            it('能够正确隐藏大图', function () {
                a.hide();
                expect(isHidden(a.icon)).toEqual(false);
                expect(isHidden(a.get("el"))).toEqual(true);
                expect(isHidden(a.lens)).toEqual(true);
            });
        });

        describe('内嵌模式下,', function () {


            var a = new ImageZoom({
                imageNode: "#inner",
                type: 'inner',
                width: testWidth,
                bigImageSrc: "http://img03.taobaocdn.com/bao/uploaded/i3/T1fftwXf8jXXX7ps79_073021.jpg",
                bigImageWidth: bigImageWidth,
                bigImageHeight: bigImageHeight
            });

            it('不会显示镜片且大图位置是在小图上', function () {

                var offset = a.get('imageNode').offset();

                simulate(a.get('imageNode'), "mouseover", document.body);

                // wait inner anim , 500ms +50 buffer
                waits(1000);

                runs(function () {
                    a.set('currentMouse', {
                        pageX: offset.left + 100,
                        pageY: offset.top + 100
                    });
                });

                waits(100);
                runs(function () {

                    var elOffset = a.get("el").offset();

                    expect(elOffset.left)
                        .toBeEqual(offset.left - (testWidth - imageWidth) / 2);

                    // 越界
                    expect(a.bigImage.css('left'))
                        .toBeEqual(Math.min((-100) * bigImageWidth / testWidth + testWidth / 2, 0));

                    expect(elOffset.top).toBeEqual(offset.top);

                    expect(a.bigImage.css('top'))
                        .toBeEqual(Math.min(-100 * bigImageHeight / imageHeight +
                            testHeight / 2, 0));
                    expect(a.lens).toBeUndefined();
                    a.hide();
                });
            });
        });

        describe('多图模式下,', function () {
            var a = new ImageZoom({
                imageNode: "#multi",
                width: testWidth,
                align: {
                    node: "#multi",
                    points: ["tr", "tl"],
                    offset: [0, 0]
                },
                bigImageWidth: bigImageWidth,
                bigImageHeight: bigImageHeight
            });

            it('初始小图显示正常', function () {

                var offset = a.get('imageNode').offset();

                simulate(a.get('imageNode'), "mouseover", document.body);

                waits(100);

                runs(function () {
                    a.set('currentMouse', {
                        pageX: offset.left + 100,
                        pageY: offset.top + 100
                    });
                });

                waits(100);

                runs(function () {
                    expect(isHidden(a.get("el"))).toEqual(false);
                });
            });

            it('改变小图src', function () {
                a.hide();
                a.set('imageSrc', 'http://img05.taobaocdn.com/imgextra/i5/T1DERIXmXsXXa26X.Z_031259.jpg_310x310.jpg');
                a.set('bigImageSrc', 'http://img05.taobaocdn.com/imgextra/i5/T1DERIXmXsXXa26X.Z_031259.jpg');
                a.set("bigImageWidth", 700);
                a.set("bigImageHeight", 700);
                simulate(a.get('imageNode'), "mouseover", document.body);

                waits(100);
                var offset = a.get('imageNode').offset();
                runs(function () {
                    a.set('currentMouse', {
                        pageX: offset.left + 100,
                        pageY: offset.top + 100
                    });
                });
                waits(100);
                runs(function () {
                    expect(isHidden(a.get("el"))).toEqual(false);
                    expect(a.bigImage.attr("src")).toEqual('http://img05.taobaocdn.com/imgextra/i5/T1DERIXmXsXXa26X.Z_031259.jpg');
                });
            });
            it('设置小图没有大图预览时, 不显示大图', function () {
                a.hide();
                a.set('hasZoom', false);

                simulate(a.get('imageNode'), "mouseover", document.body);

                waits(100);
                var offset = a.get('imageNode').offset();
                runs(function () {
                    a.set('currentMouse', {
                        pageX: offset.left + 100,
                        pageY: offset.top + 100
                    });
                });
                waits(100);
                runs(function () {
                    expect(isHidden(a.get("el"))).toEqual(true);
                    expect(isHidden(a.icon)).toEqual(true);
                    a.hide();
                });
            });
        });
    });
});