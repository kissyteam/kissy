/**
 * test cases for class sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,core", function (S, DOM) {
    var $= S.all;
    S.get = DOM.get;
    S.query = DOM.query;
    describe("class", function () {

        var tpl = '<div id="test-data-class">\
            <p id="foo-class">' +
            '<a ' + 'href="../kissy/" style="color:red" class="link" title="test"' +
            'data-test="test">test link</a>\
            <input type="text" id="test-input-class" readonly maxlength="20" value="hello"/>\
            <input type="radio" id="test-radio-class"/>\
            <input type="radio" id="test-radio2-class" checked/>\
            <label class="test">label</label>\
        <button type="button" tabindex="3">Submit</button>\
        <textarea rows="2" cols="2">\
        test\
        </textarea>\
        </p>\
        <div id="test-div-class"></div>\
        <table id="test-table-class" cellspacing="10">\
            <tbody>\
                <tr>\
                    <td rowspan="2" colspan="3">td</td>\
                </tr>\
            </tbody>\
            </table>\
        <select id="test-select-class">\
            <option id="test-opt-class" value="1">0</option>\
            <option>2</option>\
            <option>3</option>\
        </select>\
        <select id="test-select2-class">\
            <option>2</option>\
            </select>\
        <select id="test-select3-class" multiple autocomplete="off">\
            <option selected>1</option>\
            <option selected>2</option>\
            <option>3</option>\
        </select>\
        </div>';

        beforeEach(function () {
            $('body').append(tpl);
            foo = S.get('#foo-class');
            a = S.get('#foo-class a');
            input = S.get('#foo-class input');
            radio = S.get('#test-radio-class');
            radio2 = S.get('#test-radio2-class');
            button = S.get('#foo-class button');
            label = S.get('#foo-class label');
            table = S.get('#test-table');
            td = S.get('#test-table td');
            select = S.get('#test-select');
            select2 = S.get('#test-select2');
            select3 = S.get('#test-select3');
            opt = S.get('#test-opt');
            div = S.get('#test-div');
            opt2 = S.query('#test-select option')[1];
            area = S.get('#foo textarea');
        });

        afterEach(function () {
            $('#test-data-class').remove();
        });

        var foo ,
            a ,
            input ,
            radio,
            radio2 ,
            button,
            label ,
            table ,
            td ,
            select ,
            select2,
            select3,
            opt,
            div,
            opt2,
            area;

        it("hasClass works", function () {
            a.className = 'link link2\t' + 'link9 link3';
            expect(DOM.hasClass(a, 'link')).toBe(true);
            expect(DOM.hasClass(a, '.link')).toBe(true);
            expect(DOM.hasClass(a, 'link4')).toBe(false);
            expect(DOM.hasClass(a, 'link link3')).toBe(true);
            expect(DOM.hasClass(a, '.link .link3')).toBe(true);
            expect(DOM.hasClass(a, 'link link4')).toBe(false);
            expect(DOM.hasClass(a, 'link link4')).toBe(false);
            expect(DOM.hasClass(a, '.link .link4')).toBe(false);
            expect(DOM.hasClass(a, 'link9')).toBe(true);
        });

        it("addClass works", function () {
            DOM.addClass(a, 'link-added');
            expect(DOM.hasClass(a, 'link-added')).toBe(true);
            DOM.addClass(a, '.cls-a cls-b');
            expect(DOM.hasClass(a, 'cls-a')).toBe(true);
            expect(DOM.hasClass(a, 'cls-b')).toBe(true);
        });

        it("removeClass works", function () {
            a.className = 'link link2 link3 link4 link5';

            DOM.removeClass(a, 'link');
            expect(DOM.hasClass(a, 'link')).toBe(false);
            DOM.removeClass(a, 'link2 link4');
            DOM.removeClass(a, '.link3');
            expect(a.className).toBe('link5');
        });


        it("replaceClass works", function () {
            a.className = 'link link3';
            // oldCls 有的话替换
            DOM.replaceClass(a, '.link', 'link2');
            expect(DOM.hasClass(a, 'link')).toBe(false);
            expect(DOM.hasClass(a, 'link2')).toBe(true);

            // oldCls 没有的话，仅添加
            DOM.replaceClass(a, 'link4', 'link');

            expect(a.className).toBe('link3 link2 link');
        });


        it("toggleClass works", function () {
            a.className = 'link link2';

            DOM.toggleClass(a, 'link2');
            expect(DOM.hasClass(a, 'link2')).toBe(false);

            DOM.toggleClass(a, '.link2');
            expect(DOM.hasClass(a, 'link2')).toBe(true);
        });
    });
});