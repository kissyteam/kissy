/**
 * test back-color command
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Node, Color, Editor, init) {
    var $ = Node.all;
    describe('back-color', function () {
        var editor;
        it('init', function () {
            init(function (e) {
                editor = e;
            });
        });
        it('can apply color', function () {
            editor.setData('<p>1234567</p>');
            var color = Color.parse('rgb(255, 217, 102)').toHex();
            waits(499);
            runs(function () {
                editor.focus();
            });
            waits(199);
            runs(function () {
                var editorDoc = editor.get('document');
                var p = editorDoc.one('p');
                var text = $(p[0].firstChild);
                var range = new Editor.Range(editorDoc[0]);
                range.setStart(text, 2);
                range.setEnd(text, 3);
                range.trim();
                range.select();
                editor.execCommand('backColor', color);
            });
            waits(199);
            runs(function () {
                var data = editor.getData();
                var hex = Color.parse(color).toHex();
                var rgb = Color.parse(color).toRGB();
                var expected;
                if (data.indexOf('#') != -1) {
                    expected = '<p>12<span style="background-color: ' + hex + '">3</span>4567</p>';
                } else {
                    expected = '<p>12<span style="background-color: ' + rgb + '">3</span>4567</p>';
                }

                data = data.replace('<p>&nbsp;</p>', '');
                expect(data).toBe(expected);
            });
        });
        it('can remove color', function () {

        });
    });
}, {
    requires: ['node', 'color', 'editor', './init']
});