/**
 * css3 selector tc modified from Sizzle
 * @author yiminghe@gmail.com
 */
KISSY.use('dom/selector', function (S, engine) {

    var select = engine.select;

    describe('css3 selector', function () {
        var str = [
            '.x>.y div.z',
            '.x>.y>.q .y>div.z',
            '.x>.y div.z',
            '.x>.y .x>.y div.z',
            '.y>div.z',
            '.y div.z',
            '.x .y .x>.y div.z',
            '.x .y .x>.y div.z'
        ];
        S.each(str, function (s, index) {
            index++;
            it(s, function () {
                var node;
                jQuery.ajax({
                    url: '../specs/data/h' + index + '.html',
                    async: false,
                    success: function (data) {
                        node = jQuery(data).appendTo('body');
                    }
                });
                var context = document.getElementById('hard' + index);
                expect(select(s, context)).toEqual(Sizzle(s, context));
                node.remove();
            });
        });
    });
});