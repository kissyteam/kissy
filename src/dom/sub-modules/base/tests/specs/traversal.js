/**
 * test cases for traversal sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom) {
    var tpl = '<div id="test-children" class="test-parent">\
        <p id="test-next"><a>1</a></p>\
    <p class="test-next-p"><a class="test-a">2</a></p>\
    <p class="test-next"><a id="test-parent3">3</a></p>\
    <p class="test-p" id="test-prev"><em class="test-em">\
        <span><a id="test-parent4">4</a></span></em></p>\
    <div id="test-contains">text node</div>\
    <div>\
    <div id="test-nested">\
    </div>\
    </div>\
    </div>';

    describe("traversal", function () {
        beforeEach(function () {
            $('body').append(tpl);
        });

        afterEach(function () {
            $('#test-children').remove();
        });

        it("parent works", function () {
            var t = Dom.get('#test-parent4');
            expect(Dom.parent(t).tagName.toLowerCase()).toBe('span');
            expect(Dom.parent(t, 4).className).toBe('test-parent');
            expect(Dom.parent(t, 'em').className).toBe('test-em');
            expect(Dom.parent(t, 'EM')).not.toBeNull();
            expect(Dom.parent(t, '.test-p').tagName.toLowerCase()).toBe('p');
            // Unsupported selector: p.test-p em
            expect(Dom.parent(t, 'p.test-p em').className).toBe('test-em');
            expect(Dom.parent(t,
                function (elem) {
                    return elem.tagName.toLowerCase() === 'p';
                }).className).toBe('test-p');

            expect(Dom.parent(document.body)).toBe(document.documentElement);

            expect(Dom.parent(t, 0)).toBe(t);

            expect(Dom.parent()).toBe(null);

            expect(Dom.parent('#test-nested', 'p')).toBe(null);
            expect(Dom.parent('#test-nested', ['p']) + "").toBe([] + "");
            // support array of filter
            expect(Dom.parent('#test-nested', ['div']).length).toBe(2);
            expect(Dom.parent('#test-nested', ['DIV']).length).toBe(2);
            expect(Dom.parent('#test-parent4', '.text-next')).toBe(null);
        });


        it("closest works", function () {
            var t = Dom.get('#test-parent4');

            // return itself
            expect(Dom.closest(t, "a")).toBe(t);

            // support array of filter
            expect(Dom.closest('#test-nested', ['div']).length).toBe(3);

            // parent works
            expect(Dom.closest(t, ".test-p")).toBe(Dom.get("#test-prev"));

            // context works
            expect(Dom.closest(t, ".test-parent", "#test-prev")).toBe(null);

            expect(Dom.closest(t, ".test-parent")).toBe(Dom.get("#test-children"));

            expect(Dom.closest(t, ".test-parent", "#test-children")).toBe(null);
        });

        it("closest works for text node", function () {
            var div = Dom.create("<div>1</div>");
            Dom.append(div, 'body');
            var text = div.firstChild;

            var d = Dom.closest(text, undefined, undefined, true);

            expect(d).toBe(text);

            d = Dom.closest(text, undefined, undefined);

            expect(d).toBe(div);

            Dom.remove(div);
        });

        it("first works for text node", function () {
            var div = Dom.create("<div>1<span></span></div>");
            Dom.append(div, 'body');
            var cs = div.childNodes;

            expect(Dom.first(div)).toBe(cs[1]);
            expect(Dom.first(div, undefined, 1)).toBe(cs[0]);

            Dom.remove(div);
        });

        it("last works for text node", function () {
            var div = Dom.create("<div>1<span></span>1</div>");
            Dom.append(div, 'body');
            var cs = div.childNodes;

            expect(Dom.last(div)).toBe(cs[1]);
            expect(Dom.last(div, undefined, 1)).toBe(cs[2]);

            Dom.remove(div);
        });

        it("next works for text node", function () {
            var div = Dom.create("<div><span></span>1<span></span></div>");
            Dom.append(div, 'body');
            var cs = div.childNodes;
            expect(Dom.next(cs[0])).toBe(cs[2]);
            expect(Dom.next(cs[0], undefined, 1)).toBe(cs[1]);
            Dom.remove(div);
        });

        it("prev works for text node", function () {
            var div = Dom.create("<div><span></span>1<span></span></div>");
            Dom.append(div, 'body');
            var cs = div.childNodes;
            expect(Dom.prev(cs[2])).toBe(cs[0]);
            expect(Dom.prev(cs[2], undefined, 1)).toBe(cs[1]);
            Dom.remove(div);
        });

        it("siblings works for text node", function () {
            var div = Dom.create("<div><span></span>1<span></span></div>");
            Dom.append(div, 'body');
            var cs = div.childNodes;
            expect(Dom.siblings(cs[2]).length).toBe(1);
            expect(Dom.siblings(cs[2], undefined, 1).length).toBe(2);
            Dom.remove(div);
        });

        it("next works", function () {
            var t = Dom.get('#test-next');

            expect(Dom.next(t).className).toBe('test-next-p');

            expect(Dom.next(t, 0)).toBe(t);

            expect(Dom.next(t, 1).className).toBe('test-next-p');
            expect(Dom.next(t, 2).className).toBe('test-next');

            expect(Dom.next(t, '.test-next').tagName.toLowerCase()).toBe('p');
            expect(Dom.next(t, '.test-none')).toBe(null);

            expect(Dom.next(t,
                function (elem) {
                    return elem.className === 'test-p';
                }).tagName.toLowerCase()).toBe('p');
        });

        it("prev works", function () {
            var t = Dom.get('#test-prev');

            expect(Dom.prev(t).className).toBe('test-next');

            expect(Dom.prev(t, 0)).toBe(t);
            expect(Dom.prev(t, 1).className).toBe('test-next');
            expect(Dom.prev(t, 2).className).toBe('test-next-p');

            expect(Dom.prev(t, '.test-none')).toBe(null);

            expect(Dom.prev(t,
                function (elem) {
                    return elem.className === 'test-next-p';
                }).tagName.toLowerCase()).toBe('p');
        });


        it("siblings works", function () {
            var t = Dom.get('#test-prev');
            // not include itself
            expect(Dom.siblings(t).length).toBe(5);

            expect(Dom.siblings(t, '.test-none').length).toBe(0);

            expect(Dom.siblings(t,
                function (elem) {
                    return elem.className === 'test-next-p';
                }).length).toBe(1);
        });

        it("children works", function () {
            var t = Dom.get('#test-children');

            expect(Dom.children(t).length).toBe(6);
            //expect(Dom.children(t, '.test-next,.test-next-p').length).toBe(2);
            //expect(Dom.children(t, 'p:first')[0].id).toBe('test-next');
            expect(Dom.children('#test-div').length).toBe(0);
        });

        it("contents works", function () {
            var div = Dom.create("<div>1<span>2</span></div>");
            Dom.append(div, 'body');
            expect(Dom.contents(div).length).toBe(2);
            Dom.remove(div);
        });


        it("contains works", function () {
            expect(Dom.contains(document, '#test-prev')).toBe(true);
            expect(Dom.contains(document.documentElement, document.body)).toBe(true);
            expect(Dom.contains(document, document.body)).toBe(true);
            expect(Dom.contains(document.body, document.documentElement)).toBe(false);

            // test text node
            var tn = Dom.get('#test-contains').firstChild;

            expect(tn.nodeType).toBe(3);

            expect(Dom.contains('#test-contains', tn)).toBe(true);

            expect(Dom.contains(document.body, document.body)).toBe(false);

            expect(Dom.contains(document, document)).toBe(false);

            expect(Dom.contains(document.body, document)).toBe(false);
        });

        // https://github.com/kissyteam/kissy/issues/183
        it("contains works for non-document node", function () {
            var newNode = Dom.create("<div><div></div></div>");

            expect(Dom.contains(document, newNode)).toBe(false);
            expect(Dom.contains(document.body, newNode)).toBe(false);

            expect(Dom.contains(document, newNode.firstChild)).toBe(false);
            expect(Dom.contains(document.body, newNode.firstChild)).toBe(false);
        });


        it('index works', function () {
            var div = Dom.create('<ul class="index-ul">' +
                '<li class="index-li">0</li>' +
                '<li class="index-li">1</li>' +
                '<li class="index-li">2</li>' +
                '</ul>');

            Dom.append(div, 'body');

            // 单个节点
            expect(Dom.index('.index-li', Dom.query('.index-li')[1])).toBe(1);

            // 取第一个节点
            expect(Dom.index('.index-li', Dom.query('.index-li'))).toBe(0);

            // 第一个节点在 parent 中找
            expect(Dom.index('.index-li')).toBe(0);

            expect(Dom.index(Dom.query('.index-li')[1])).toBe(1);

            // selector 集合中找当前第一个节点
            expect(Dom.index(Dom.query('.index-li')[1], '.index-li')).toBe(1);

            expect(Dom.index(Dom.get('body'), '.index-li')).toBe(-1);

            Dom.remove(div);
        });
    });
},{
    requires:['dom']
});