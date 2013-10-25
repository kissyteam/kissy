/**
 * test style operation for editor
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Editor, init) {

    var Style = Editor.Style;
    var Selection = Editor.Selection;
    var Range = Editor.Range;
    var $ = S.all;
    var UA = S.UA;
    var editor;

    describe('Style', function () {

        describe('bold', function () {

            var BOLD_STYLE = new Editor.Style({
                element: 'strong',
                overrides: [
                    {
                        element: 'b'
                    },
                    {
                        element: 'span',
                        attributes: {
                            style: 'font-weight: bold;'
                        }
                    }
                ]
            });

            it('setup', function () {
                init(function (e) {
                    editor = e;
                });
            });

            it('can process collapsed range in content strong', function () {
                var p;
                var document;
                runs(function () {
                    editor.setData('<p>' +
                        '1234<strong>56</strong></p>');
                });
                waits(500);
                runs(function () {
                    p = editor.get('document').one('p');
                    var strong = p.one('strong');
                    document = editor.get('document')[0];
                    var range = new Range(document);
                    range.setEnd(strong, 1);
                    range.select();
                    BOLD_STYLE.remove(document);
                });
                waits(500);
                runs(function () {
                    var selection = new Selection(document);
                    var startElement = selection.getStartElement(),
                        currentPath = new Editor.ElementPath(startElement);
                    expect(BOLD_STYLE.checkActive(currentPath)).toBe(false);
                    var lastChild;

                    if (UA.webkit || UA.firefox) {
                        expect(p[0].childNodes.length).toBe(3);
                        if (UA.webkit) {
                            lastChild = p[0].lastChild;
                            expect(p[0].childNodes[2].nodeValue).toBe('\u200b');
                        }
                    } else {
                        expect(p[0].childNodes.length).toBe(2);
                    }

                    var range2 = selection.getRanges()[0];
                    if (UA.webkit) {
                        // http://code.google.com/p/chromium/issues/detail?id=149894
                        expect(range2.startContainer[0]).toBe(lastChild);
                        expect(range2.endContainer[0]).toBe(lastChild);
                        expect(range2.startOffset).toBe(1);
                        expect(range2.endOffset).toBe(1);
                    } else {
                        expect(range2.startContainer[0]).toBe(p[0]);
                        expect(range2.endContainer[0]).toBe(p[0]);
                        expect(range2.startOffset).toBe(2);
                        expect(range2.endOffset).toBe(2);
                    }
                });
            });


            it('can process collapsed range in empty strong', function () {
                runs(function () {
                    editor.setData('<p>' +
                        '1234<strong>\u200b</strong></p>');
                });
                waits(500);
                var document, p;
                runs(function () {
                    p = editor.get('document').one('p');
                    var strong = p.one('strong');
                    document = editor.get('document')[0];
                    var range = new Range(document);
                    range.setEnd(strong, 1);
                    range.select();
                });
                waits(500);
                runs(function () {
                    BOLD_STYLE.remove(document);
                });
                waits(500);
                runs(function () {

                    var selection = new Selection(document);

                    var startElement = selection.getStartElement(),
                        currentPath = new Editor.ElementPath(startElement);
                    expect(BOLD_STYLE.checkActive(currentPath)).toBe(false);
                    var lastChild;

                    // TODO firefox??
                    if(!UA.firefox){
                        expect(p[0].childNodes.length).toBe(1);
                        lastChild = p[0].lastChild;
                        expect(lastChild.nodeValue).toBe('1234');
                    }

                    var range = selection.getRanges()[0];

                    if (UA.webkit) {
                        // http://code.google.com/p/chromium/issues/detail?id=149894
                        expect(range.startContainer[0]).toBe(lastChild);
                        expect(range.endContainer[0]).toBe(lastChild);
                        expect(range.startOffset).toBe(4);
                        expect(range.endOffset).toBe(4);
                    } else {
                        expect(range.startContainer[0]).toBe(p[0]);
                        expect(range.endContainer[0]).toBe(p[0]);
                        expect(range.startOffset).toBe(1);
                        expect(range.endOffset).toBe(1);
                    }
                });
            });
        });


    });

}, {
    requires: ['editor', './init']
});