/**
 * test cases for traversal sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,core", function (S, DOM) {

    var $ = S.all;

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
            var t = DOM.get('#test-parent4');
            expect(DOM.parent(t).tagName.toLowerCase()).toBe('span');
            expect(DOM.parent(t, 4).className).toBe('test-parent');
            expect(DOM.parent(t, 'em').className).toBe('test-em');
            expect(DOM.parent(t, 'EM')).not.toBeNull();
            expect(DOM.parent(t, '.test-p').tagName.toLowerCase()).toBe('p');
            // Unsupported selector: p.test-p em
            expect(DOM.parent(t, 'p.test-p em').className).toBe('test-em');
            expect(DOM.parent(t,
                function (elem) {
                    return elem.tagName.toLowerCase() === 'p';
                }).className).toBe('test-p');

            expect(DOM.parent(document.body)).toBe(document.documentElement);

            expect(DOM.parent(t, 0)).toBe(t);

            expect(DOM.parent()).toBe(null);

            expect(DOM.parent('#test-nested', 'p')).toBe(null);
            expect(DOM.parent('#test-nested', ['p']) + "").toBe([] + "");
            // support array of filter
            expect(DOM.parent('#test-nested', ['div']).length).toBe(2);
            expect(DOM.parent('#test-nested', ['DIV']).length).toBe(2);
            expect(DOM.parent('#test-parent4', '.text-next')).toBe(null);
        });


        it("closest works", function () {
            var t = DOM.get('#test-parent4');

            // return itself
            expect(DOM.closest(t, "a")).toBe(t);

            // support array of filter
            expect(DOM.closest('#test-nested', ['div']).length).toBe(3);

            // parent works
            expect(DOM.closest(t, ".test-p")).toBe(DOM.get("#test-prev"));

            // context works
            expect(DOM.closest(t, ".test-parent", "#test-prev")).toBe(null);

            expect(DOM.closest(t, ".test-parent")).toBe(DOM.get("#test-children"));

            expect(DOM.closest(t, ".test-parent", "#test-children")).toBe(null);
        });


        it("closest works for text node", function () {
            var div = DOM.create("<div>1</div>");
            DOM.append(div, "body");
            var text = div.firstChild;

            var d = DOM.closest(text, undefined, undefined, true);

            expect(d).toBe(text);

            d = DOM.closest(text, undefined, undefined);

            expect(d).toBe(div);

            DOM.remove(div);
        });

        it("first works for text node", function () {
            var div = DOM.create("<div>1<span></span></div>");
            DOM.append(div, "body");
            var cs = div.childNodes;

            expect(DOM.first(div)).toBe(cs[1]);
            expect(DOM.first(div, undefined, 1)).toBe(cs[0]);

            DOM.remove(div);
        });

        it("last works for text node", function () {
            var div = DOM.create("<div>1<span></span>1</div>");
            DOM.append(div, "body");
            var cs = div.childNodes;

            expect(DOM.last(div)).toBe(cs[1]);
            expect(DOM.last(div, undefined, 1)).toBe(cs[2]);

            DOM.remove(div);
        });

        it("next works for text node", function () {
            var div = DOM.create("<div><span></span>1<span></span></div>");
            DOM.append(div, "body");
            var cs = div.childNodes;

            expect(DOM.next(cs[0])).toBe(cs[2]);
            expect(DOM.next(cs[0], undefined, 1)).toBe(cs[1]);

            DOM.remove(div);
        });


        it("prev works for text node", function () {
            var div = DOM.create("<div><span></span>1<span></span></div>");
            DOM.append(div, "body");
            var cs = div.childNodes;

            expect(DOM.prev(cs[2])).toBe(cs[0]);
            expect(DOM.prev(cs[2], undefined, 1)).toBe(cs[1]);

            DOM.remove(div);
        });


        it("siblings works for text node", function () {
            var div = DOM.create("<div><span></span>1<span></span></div>");
            DOM.append(div, "body");
            var cs = div.childNodes;

            expect(DOM.siblings(cs[2]).length).toBe(1);
            expect(DOM.siblings(cs[2], undefined, 1).length).toBe(2);

            DOM.remove(div);
        });

        it("next works", function () {
            var t = DOM.get('#test-next');

            expect(DOM.next(t).className).toBe('test-next-p');

            expect(DOM.next(t, 0)).toBe(t);

            expect(DOM.next(t, 1).className).toBe('test-next-p');
            expect(DOM.next(t, 2).className).toBe('test-next');

            expect(DOM.next(t, '.test-next').tagName.toLowerCase()).toBe('p');
            expect(DOM.next(t, '.test-none')).toBe(null);

            expect(DOM.next(t,
                function (elem) {
                    return elem.className === 'test-p';
                }).tagName.toLowerCase()).toBe("p");
        });

        it("prev works", function () {
            var t = DOM.get('#test-prev');

            expect(DOM.prev(t).className).toBe('test-next');

            expect(DOM.prev(t, 0)).toBe(t);
            expect(DOM.prev(t, 1).className).toBe('test-next');
            expect(DOM.prev(t, 2).className).toBe('test-next-p');

            expect(DOM.prev(t, '.test-none')).toBe(null);

            expect(DOM.prev(t,
                function (elem) {
                    return elem.className === 'test-next-p';
                }).tagName.toLowerCase()).toBe("p");
        });


        it("siblings works", function () {
            var t = DOM.get('#test-prev');
            // not include itself
            expect(DOM.siblings(t).length).toBe(5);

            expect(DOM.siblings(t, '.test-none').length).toBe(0);

            expect(DOM.siblings(t,
                function (elem) {
                    return elem.className === 'test-next-p';
                }).length).toBe(1);
        });

        it("children works", function () {
            var t = DOM.get('#test-children');

            expect(DOM.children(t).length).toBe(6);
            //expect(DOM.children(t, '.test-next,.test-next-p').length).toBe(2);
            //expect(DOM.children(t, 'p:first')[0].id).toBe('test-next');
            expect(DOM.children('#test-div').length).toBe(0);
        });

        it("contents works", function () {
            var div = DOM.create("<div>1<span>2</span></div>");
            DOM.append(div, "body");
            expect(DOM.contents(div).length).toBe(2);
            DOM.remove(div);
        });


        it("contains works", function () {
            expect(DOM.contains(document, '#test-prev')).toBe(true);
            expect(DOM.contains(document.documentElement, document.body)).toBe(true);
            expect(DOM.contains(document, document.body)).toBe(true);
            expect(DOM.contains(document.body, document.documentElement)).toBe(false);

            // test text node
            var tn = DOM.get('#test-contains').firstChild;

            expect(tn.nodeType).toBe(3);

            expect(DOM.contains('#test-contains', tn)).toBe(true);

            expect(DOM.contains(document.body, document.body)).toBe(false);

            expect(DOM.contains(document, document)).toBe(false);

            expect(DOM.contains(document.body, document)).toBe(false);
        });

        // https://github.com/kissyteam/kissy/issues/183
        it("contains works for non-document node", function () {
            var newNode = DOM.create("<div><div></div></div>");

            expect(DOM.contains(document, newNode)).toBe(false);
            expect(DOM.contains(document.body, newNode)).toBe(false);

            expect(DOM.contains(document, newNode.firstChild)).toBe(false);
            expect(DOM.contains(document.body, newNode.firstChild)).toBe(false);
        });


        it('index works', function () {
            var div = DOM.create('<ul class="index-ul">' +
                '<li class="index-li">0</li>' +
                '<li class="index-li">1</li>' +
                '<li class="index-li">2</li>' +
                '</ul>');

            DOM.append(div, 'body');

            // 单个节点
            expect(DOM.index('.index-li', DOM.query('.index-li')[1])).toBe(1);

            // 取第一个节点
            expect(DOM.index('.index-li', DOM.query('.index-li'))).toBe(0);

            // 第一个节点在 parent 中找
            expect(DOM.index('.index-li')).toBe(0);

            expect(DOM.index(DOM.query('.index-li')[1])).toBe(1);

            // selector 集合中找当前第一个节点
            expect(DOM.index(DOM.query('.index-li')[1], '.index-li')).toBe(1);

            expect(DOM.index(DOM.get('body'), '.index-li')).toBe(-1);

            DOM.remove(div);

        });

    });
});