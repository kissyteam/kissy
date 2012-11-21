/**
 * Tc for imagezoom
 * @author qiaohua@taobao.com, yiminghe@gmail.com
 */
KISSY.use("imagezoom", function (S, ImageZoom) {

    // simulate mouse event on any element
    var simulate = function (target, type, relatedTarget) {
        jasmine.simulate(target[0], type, { relatedTarget: relatedTarget });
    };

    function isHidden(obj) {
        return obj.css('display') === 'none' || obj.css('visibility') === 'hidden';
    }

    beforeEach(function () {
        this.addMatchers({
            toBeHidden: function () {
                var obj = this.actual;
                return obj.css('display') === 'none' || obj.css('visibility') === 'hidden';
            }
        });
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
                align: {
                    points: ["tr", "tl"],
                    offset: [0, 0]
                },
                bigImageSrc: "http://img03.taobaocdn.com/bao/uploaded/i3/T1fftwXf8jXXX7ps79_073021.jpg",
                bigImageWidth: 900,
                bigImageHeight: 900
            });

            it('初始化后, 小图 DOM 结构正确', function () {
                waitsFor(function () {
                    return a.imageWrap;
                });
                runs(function () {
                    expect(a.image).toBeDefined();
                    expect(a.imageWrap).toBeDefined();
                    expect(a.imageWrap.hasClass('ks-imagezoom-wrap')).toEqual(true);
                });
            });

            it('显示放大镜图标', function () {
                runs(function () {
                    expect(a.icon).toBeDefined();
                    expect(a.icon.hasClass('ks-imagezoom-icon')).toEqual(true);
                });
            });

            it('能够正确显示大图', function () {
                var offset = a.image.offset();

                simulate(a.image, "mouseover", document.body);

                waits(500);

                runs(function () {
                    a.set('currentMouse', {
                        pageX: offset.left + 100,
                        pageY: offset.top + 100
                    });
                });

                waits(500);
                runs(function () {
                    expect(isHidden(a.icon)).toEqual(true);
                    expect(a.get("el")).toBeDefined();
                    expect(a.bigImage).toBeDefined();
                    expect(isHidden(a.get("el"))).toEqual(false);
                    expect(a.bigImage.width()).toEqual(900);
                    expect(a.bigImage.height()).toEqual(900);
                    expect(a.get("el").width()).toEqual(310);
                    //expect(a.get("el").height()).toEqual(310);
                    //expect(a.get("el").css('height')).toEqual('310px');
                    expect(a.lens).toBeDefined();
                    expect(isHidden(a.lens)).toEqual(false);
                    expect(a.lens.width()).toEqual(107);
                    expect(Math.abs(a.lens.height() - 107)).toBeLessThan(5);
                });
            });

            it('移动鼠标时, 设置坐标正确', function () {
                var oft = a.image.offset();

                simulate(a.image, "mouseover", document.body);

                waits(500);

                runs(function () {

                    a.set('currentMouse', {
                        pageX: oft.left + 200,
                        pageY: oft.top + 200
                    });
                });

                waits(500);
                runs(function () {
                    var lenOffset = {
                        left: a.get("lensLeft"),
                        top: a.get("lensTop")
                    };
                    expect(a.bigImage.css('left'))
                        .toBeEqual(-Math.round((lenOffset.left - oft.left) * 900 / 310) + 'px');
                    expect(a.bigImage.css('top'))
                        .toBeEqual(-Math.round((lenOffset.top - oft.top) * 900 / 310) + 'px');
                });
            });

            it('能够正确隐藏大图', function () {
                a.hide();

                waits(500);

                runs(function () {
                    expect(isHidden(a.icon)).toEqual(false);
                    expect(isHidden(a.get("el"))).toEqual(true);
                    expect(isHidden(a.lens)).toEqual(true);
                });
            });
        });

        describe('内嵌模式下,', function () {
            var a = new ImageZoom({
                imageNode: "#inner",
                type: 'inner',
                bigImageSrc: "http://img03.taobaocdn.com/bao/uploaded/i3/T1fftwXf8jXXX7ps79_073021.jpg",
                bigImageWidth: 900,
                bigImageHeight: 900
            });

            it('不会显示镜片且大图位置是在小图上', function () {

                waitsFor(function () {
                    return a.imageWrap;
                });

                var offset = a.image.offset();

                simulate(a.image, "mouseover", document.body);

                waits(500);

                runs(function () {
                    a.set('currentMouse', {
                        pageX: offset.left + 100,
                        pageY: offset.top + 100
                    });
                });

                waits(500);
                runs(function () {
                    expect(a.get("el").offset().left).toBeEqual(a.image.offset().left);
                    expect(a.lens).toBeUndefined();
                });
            });
        });

        describe('多图模式下,', function () {
            var a = new ImageZoom({
                imageNode: "#multi",
                align: {
                    node: "#multi",
                    points: ["tr", "tl"],
                    offset: [0, 0]
                },
                bigImageWidth: 900,
                bigImageHeight: 900
            });

            it('初始小图显示正常', function () {

                waitsFor(function () {
                    return a.imageWrap;
                });

                var offset = a.image.offset();

                simulate(a.image, "mouseover", document.body);

                waits(500);

                runs(function () {
                    a.set('currentMouse', {
                        pageX: offset.left + 100,
                        pageY: offset.top + 100
                    });
                });

                waits(500);

                runs(function () {
                    expect(isHidden(a.get("el"))).toEqual(false);
                });
            });

            it('改变小图src', function () {
                a.hide();
                a.changeImageSrc('http://img05.taobaocdn.com/imgextra/i5/T1DERIXmXsXXa26X.Z_031259.jpg_310x310.jpg');
                a.set('bigImageSrc', 'http://img05.taobaocdn.com/imgextra/i5/T1DERIXmXsXXa26X.Z_031259.jpg');
                a.set("bigImageWidth", 700);
                a.set("bigImageHeight", 700);
                simulate(a.image, "mouseover", document.body);

                waits(500);
                var offset = a.image.offset();
                runs(function () {
                    a.set('currentMouse', {
                        pageX: offset.left + 100,
                        pageY: offset.top + 100
                    });
                });
                waits(500);
                runs(function () {
                    expect(isHidden(a.get("el"))).toEqual(false);
                    expect(a.bigImage.attr("src")).toEqual('http://img05.taobaocdn.com/imgextra/i5/T1DERIXmXsXXa26X.Z_031259.jpg');
                });
            });
            it('设置小图没有大图预览时, 不显示大图', function () {
                a.hide();
                a.set('hasZoom', false);

                simulate(a.image, "mouseover", document.body);

                waits(500);
                var offset = a.image.offset();
                runs(function () {
                    a.set('currentMouse', {
                        pageX: offset.left + 100,
                        pageY: offset.top + 100
                    });
                });
                waits(500);
                runs(function () {
                    expect(isHidden(a.get("el"))).toEqual(true);
                    expect(isHidden(a.icon)).toEqual(true);

                    a.set('hasZoom', true);
                });
            });
        });
    });
});