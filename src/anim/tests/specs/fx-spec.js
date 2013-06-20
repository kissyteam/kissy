/**
 * test case for anim fx config
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,anim,node", function (S, Dom, Anim, Node) {
    var $ = Node.all;

    describe('anim-fx config', function () {

        it('support fx extension', function () {

            if (!S.UA.webkit) {
                return;
            }

            var div = $('<div></div>')
                .prependTo('body');

            div.animate({
                '-webkit-transform': {
                    easing: 'linear',
                    fx: {
                        frame: function (anim, fx) {
                            div.css(fx.prop, 'translate(' +
                                (100 * fx.pos) + 'px,' +
                                (100 * fx.pos) + 'px' + ')');
                        }
                    }
                }
            }, {
                duration: 2
            });

            waits(1000);

            runs(function () {
                var m = div.style('-webkit-transform')
                    .match(/translate\(([\d.]+)px\s*,\s*([\d.]+)px\)/);
                expect(Math.abs(50 - parseFloat(m[1]))).toBeLessThan(2);
                expect(Math.abs(50 - parseFloat(m[2]))).toBeLessThan(2);
            });

            waits(1500);

            runs(function () {
                div.remove();
            });

        });
    });
});