/**
 * css3 selector tc modified from Sizzle
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, engine, Dom) {

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
                var node = null;
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

        it('can deal with third-party iframe', function () {
            var iframe = Dom.create('<iframe src="http://www.google.com" id="t"></iframe>');
            document.body.appendChild(iframe);
            ///console.log(iframe.getAttribute('type'));
            //console.log(iframe.getAttributeNode('type')&&iframe.getAttributeNode('type').value);
            expect(select('iframe[src*="google"]').length).toBe(1);
            Dom.remove(iframe);
        });

        it('works for fragment', function () {
            var node = Dom.create('<div><i id="i"></i></div><div><b id="b"></b></div>');
            expect(select('#i', node).length).toBe(1);
            expect(select('i', node).length).toBe(1);
        });

        it('works for detached node', function () {
            var node = Dom.create('<div><i id="i"></i></div>');
            expect(select('#i', node).length).toBe(1);
            expect(select('i', node).length).toBe(1);
        });


        it('works for in dom node', function () {
            var node = Dom.create('<div><i id="i"></i></div>');
            var holder = Dom.create('<div id="holder"><b id="b"></b></div>');
            document.body.appendChild(node);
            document.body.appendChild(holder);

            expect(select('#i', node).length).toBe(1);
            expect(select('i', node).length).toBe(1);

            expect(select('#b', node).length).toBe(0);
            expect(select('b', node).length).toBe(0);
            Dom.remove(node);
            Dom.remove(holder);
        });

    });
}, {
    requires: ['dom/selector', 'dom']
});