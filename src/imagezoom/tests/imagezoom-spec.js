KISSY.use("imagezoom", function(S, ImageZoom) {

    // simulate mouse event on any element
    var simulate = function(target, type, relatedTarget) {
        jasmine.simulate(target[0], type, { relatedTarget: relatedTarget });
    };
    
    function isHidden(obj) {
        return obj.css('display') === 'none' || obj.css('visibility') === 'hidden';
    }

    beforeEach(function() {
        this.addMatchers({
            toBeHidden: function() {
                var obj = this.actual;
                return obj.css('display') === 'none' || obj.css('visibility') === 'hidden';
            }
        });
    });
    describe('图片放大组件', function() {
        describe('标准模式下,', function() {
            var a = new ImageZoom({
                imageNode: "#standard",
                align:{
                    node: "#standard",
                    points: ["tr","tl"],
                    offset: [0, 0]
                },
                bigImageSrc: "http://img03.taobaocdn.com/bao/uploaded/i3/T1fftwXf8jXXX7ps79_073021.jpg",
                bigImageWidth: 900,
                bigImageHeight: 900
            });

            it('初始化后, 小图 DOM 结构正确', function() {
                waits(500);
                runs(function() {
                    expect(a.image).toBeDefined();
                    expect(a.imageWrap).toBeDefined();
                    expect(a.imageWrap.hasClass('ks-imagezoom-wrap')).toEqual(true);
                });
            });

            it('显示放大镜图标', function() {
                waits(500);
                runs(function() {
                    expect(a.icon).toBeDefined();
                    expect(a.icon.hasClass('ks-imagezoom-icon')).toEqual(true);
                });
            });

            it('能够正确显示大图', function() {
                var offset = a.image.offset();
                a.set('currentMouse', {
                    pageX: offset.left + 100,
                    pageY: offset.top + 100
                });
                a.show();

                waits(500);
                runs(function() {
                    expect(isHidden(a.icon)).toEqual(true);
                    expect(a.viewer).toBeDefined();
                    expect(a.bigImage).toBeDefined();
                    expect(isHidden(a.viewer)).toEqual(false);
                    expect(a.bigImage.width()).toEqual(900);
                    expect(a.bigImage.height()).toEqual(900);
                    expect(a.viewer.width()).toEqual(310);
                    //expect(a.viewer.height()).toEqual(310);
                    //expect(a.viewer.css('height')).toEqual('310px');
                    expect(a.lens).toBeDefined();
                    expect(isHidden(a.lens)).toEqual(false);
                    expect(a.lens.width()).toEqual(107);
                    expect(a.lens.height()).toEqual(107);
                });
            });

            it('移动鼠标时, 设置坐标正确', function() {
                var oft = a.image.offset();

                a.set('currentMouse', {
                    pageX: oft.left + 200,
                    pageY: oft.top + 200
                });
                waits(500);
                runs(function() {
                    var lenOffset = a.lens.offset();
                    expect(a.bigImage.css('left')).toEqual(- Math.round((lenOffset.left - oft.left) * 900 / 310) - 1 + 'px');
                    expect(a.bigImage.css('top')).toEqual(- Math.round((lenOffset.top - oft.top) * 900 / 310) - 1 + 'px');
                });
            });

            it('能够正确隐藏大图', function() {
                a.hide();

                waits(500);
                runs(function() {
                    expect(isHidden(a.icon)).toEqual(false);
                    expect(isHidden(a.viewer)).toEqual(true);
                    expect(isHidden(a.lens)).toEqual(true);
                });
            });
        });

        describe('内嵌模式下,', function() {
            var a = new ImageZoom({
                imageNode: "#inner",
                type: 'inner',
                bigImageSrc: "http://img03.taobaocdn.com/bao/uploaded/i3/T1fftwXf8jXXX7ps79_073021.jpg",
                bigImageWidth: 900,
                bigImageHeight: 900
            });

            it('不会显示镜片且大图位置是在小图上', function() {
                var offset = a.image.offset();
                a.set('currentMouse', {
                    pageX: offset.left + 100,
                    pageY: offset.top + 100
                });
                a.show();

                waits(500);
                runs(function() {
                    expect(a.viewer.offset().left).toEqual(a.image.offset().left);
                    expect(a.lens).not.toBeDefined();
                });
            });
        });

        describe('多图模式下,', function() {
            var a = new ImageZoom({
                imageNode: "#multi",
                align:{
                    node: "#multi",
                    points: ["tr","tl"],
                    offset: [0, 0]
                },
                bigImageWidth: 900,
                bigImageHeight: 900
            });

            it('初始小图显示正常', function() {
                var offset = a.image.offset();
                a.set('currentMouse', {
                    pageX: offset.left + 100,
                    pageY: offset.top + 100
                });
                a.show();

                waits(500);
                runs(function() {
                    expect(isHidden(a.viewer)).toEqual(false);
                });
            });

            it('改变小图src', function() {
                a.changeImageSrc('http://img05.taobaocdn.com/imgextra/i5/T1DERIXmXsXXa26X.Z_031259.jpg_310x310.jpg');
                a.set('bigImageSrc', 'http://img05.taobaocdn.com/imgextra/i5/T1DERIXmXsXXa26X.Z_031259.jpg');
                a.show();
                waits(500);
                runs(function() {
                    expect(isHidden(a.viewer)).toEqual(false);
                    expect(a.get('bigImageSrc')).toEqual('http://img05.taobaocdn.com/imgextra/i5/T1DERIXmXsXXa26X.Z_031259.jpg');
                });
            });
            it('设置小图没有大图预览时, 不显示大图', function() {
                a.hide();
                a.set('hasZoom', false);
                simulate(a.image, 'mouseenter');
                waits(500);
                runs(function() {
                    expect(isHidden(a.viewer)).toEqual(true);
                    expect(isHidden(a.icon)).toEqual(true);
                });
            });
        });
    });
});