KISSY.use("editor", function (S, Editor) {

    var Style = Editor.Style;
    var Selection = Editor.Selection;
    var Range = Editor.Range;
    var $ = S.all;
    var UA = S.UA;

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

            it('can process collapsed range in content strong', function () {
                var p = $('<p>' +
                    '1234<strong>56</strong></p>').appendTo('body');
                var strong = p.one('strong');
                var range = new Range(document);
                range.setEnd(strong, 1);
                range.select();
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

                    if (UA.webkit) {
                        expect(p[0].childNodes.length).toBe(3);
                        lastChild = p[0].lastChild;
                        expect(p[0].childNodes[2].nodeValue).toBe('\u200b');
                    } else {
                        expect(p[0].childNodes.length).toBe(2);
                    }

                    var range = selection.getRanges()[0];

                    if (UA.webkit) {
                        // http://code.google.com/p/chromium/issues/detail?id=149894
                        expect(range.startContainer[0]).toBe(lastChild);
                        expect(range.endContainer[0]).toBe(lastChild);
                        expect(range.startOffset).toBe(1);
                        expect(range.endOffset).toBe(1);
                    } else {
                        expect(range.startContainer[0]).toBe(p[0]);
                        expect(range.endContainer[0]).toBe(p[0]);
                        expect(range.startOffset).toBe(2);
                        expect(range.endOffset).toBe(2);
                    }
                });

                runs(function () {
                    p.remove();
                });
            });


            it('can process collapsed range in empty strong', function () {
                var p = $('<p>' +
                    '1234<strong>\u200b</strong></p>').appendTo('body');
                var strong = p.one('strong');
                var range = new Range(document);
                range.setEnd(strong, 1);
                range.select();
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


                    expect(p[0].childNodes.length).toBe(1);
                    lastChild = p[0].lastChild;
                    expect(lastChild.nodeValue).toBe('1234');


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

                runs(function () {
                    p.remove();
                });
            });
        });


    });

});