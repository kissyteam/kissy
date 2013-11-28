/**
 * test cases for attribute sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom) {
    S.get = Dom.get;
    S.query = Dom.query;

    function trimCssText(str) {
        return str.replace(/;|\s/g, "").toLowerCase();
    }

    describe("attr", function () {
        var tpl = '<div id="test-data">\
            <input id="hidepass"/>\
            <p id="foo">' +
            '<a ' +
            'style="color:red; border-top:1px solid #333;"\
             class="link"\
             title="test" data-test="test">test link</a>\
             <input type="text" id="test-input" readonly maxlength="20" value="hello"/>\
             <input type="radio" id="test-radio"/>\
             <input type="radio" id="test-radio2" checked/>\
             <label class="test" for="test-input">label</label>\
             <button type="button" tabindex="3">Submit</button>\
             <textarea rows="2" cols="2">' +
            'test' +
            '</textarea>\
         </p>\
         <div id="test-div"></div>\
         <img id="test-img" alt="kissy"/>\
         <table id="test-table" cellspacing="10">\
             <tbody>\
                 <tr>\
                     <td rowspan="2" colspan="3">td</td>\
                 </tr>\
             </tbody>\
         </table>\
         <select id="test-select">\
             <option id="test-opt" value="1">0</option>\
             <option>2</option>\
             <option>3</option>\
         </select>\
         <select id="test-select2">\
             <option>2</option>\
         </select>\
         <select id="test-select3" multiple ' + 'autocomplete="off">\
                <option selected>1</option>\
                <option selected>2</option>\
                <option>3</option>\
            </select>\
            <br/>\
            <br/>\
            <input type="checkbox" id="test-20100728-checkbox"/>test checked\
            <br/>\
            <input type="button" id="test-20100728-disabled"/>test disabled\
        </div>';

        beforeEach(function () {
            $('body').append(tpl);
            foo = S.get('#foo');
            a = S.get('#foo a');
            img = S.get('#test-img');
            input = S.get('#foo input');
            radio = S.get('#test-radio');
            radio2 = S.get('#test-radio2');
            button = S.get('#foo button');
            label = S.get('#foo label');
            table = S.get('#test-table');
            td = S.get('#test-table td');
            select = S.get('#test-select');
            select2 = S.get('#test-select2');
            select3 = S.get('#test-select3');
            opt = S.get('#test-opt');
            div = S.get('#test-div');
            opt2 = S.query('#test-select option')[1];
            area = S.get('#foo textarea');
            disabledTest = S.get("#test-20100728-disabled");
        });

        afterEach(function () {
            $('#test-data').remove();
        });

        beforeEach(function () {
            this.addMatchers({
                toBeAlmostEqual: function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 20;
                },
                toBeEqual: function (expected) {
                    return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                }
            });
        });

        S.get = Dom.get;
        S.query = Dom.query;

        var foo ,
            a ,
            img ,
            input ,
            radio ,
            radio2 ,
            button,
            label,
            table,
            td,
            select,
            select2,
            select3 ,
            opt,
            div ,
            opt2 ,
            area ,
            disabledTest;

        describe("getter/setter", function () {
            it('works for placeholder', function () {
                var n = Dom.create('<input placeholder="haha"/>');
                Dom.append(n, 'body');
                expect(Dom.attr(n, 'placeholder')).toBe('haha');
                Dom.attr(n, 'placeholder', 'hei');
                expect(Dom.attr(n, 'placeholder')).toBe('hei');
                Dom.remove(n);
            });

            // kissy 里，对不存在的属性，统一返回 undefined
            it("should return undefined when get no-exist attribute", function () {
                expect(Dom.attr("a", "no-exist")).toBe(undefined)
            });

            it("should return correctly for readonly, checked, selected", function () {
                expect(Dom.attr(input, "readonly")).toBe("readonly");
                // same with jquery , null changed to undefined
                expect(Dom.attr(radio, 'checked')).toBe(undefined);
                expect(jQuery(radio).attr('checked')).toBe(undefined);
                // standard browser returns null
                // ie<8 return false , === radio.checked
                // expect(radio.getAttribute('checked')).toBe(undefined);
                expect(Dom.attr(input, 'value')).toBe('hello');
                expect(Dom.val(input)).toBe('hello');
                Dom.attr(input, 'value', 'zz');
                expect(Dom.val(input)).toBe('zz');
                Dom.attr(input, 'value', 'hello');
                Dom.val(input, 'hello')
            });

            it("should return style correctly", function () {
                expect(typeof (Dom.attr(a, 'style')) == 'string').toBe(true);
            });

            it("should return selected correctly", function () {
                expect(Dom.attr(opt, "selected")).toBe("selected");
                expect(Dom.prop(opt, "selected")).toBe(true);
            });

            it('should get cutom attribute correctly', function () {
                // 对于非 mapping 属性：
                // ie 下可以用 a.name 或 a['name'] 获取，其它浏览器下不能，即便有值也返回 undefined
                //alert(a['data-test']);
                //alert(a.getAttribute('data-test'));
                expect(Dom.attr(a, 'data-test')).toBe('test');
            });

            // ie bugs fix:
            it("should handle class and for correctly for ie7-", function () {
                // ie7- 要用 className
                expect(Dom.attr(label, 'class')).toBe('test');
                // ie7- 要用 htmlFor
                expect(Dom.attr(label, 'for')).toBe('test-input');
            });

            it("should get href/src/rowspan correctly", function () {
                // href - http://www.glennjones.net/Post/809/getAttributehrefbug.htm
                // alert(a.href); // 在所有浏览器下，a.href 和 a['href'] 都返回绝对地址
                // alert(a.getAttribute('href')); // ie7- 下，会返回绝对地址
                Dom.attr(a, 'href', '../kissy/');

                expect(Dom.attr(a, 'href')).toBe('../kissy/');

                Dom.attr(img, 'src', '../others/space.gif');

                expect(Dom.prop(img, 'src'))
                    .toBe(new S.Uri(location.href).resolve('../others/space.gif').toString());

                expect(Dom.attr(img, 'src')).toBe('../others/space.gif');

                // colspan / rowspan:
                expect(Dom.attr(td, 'rowspan') + '').toBe('2');
            });

            it("should get normal attribute correctly", function () {
                expect(Dom.attr(a, 'title')).toBe('test');
            });

            it("should set normal attribute correctly", function () {
                Dom.attr(a, 'data-set', 'test-xx');
                expect(Dom.attr(a, 'data-set')).toBe('test-xx');
            });

            it("should set style correctly", function () {
                // style
                Dom.attr(td, 'style', 'color:red;');
                expect(trimCssText(Dom.attr(td, 'style'))).toBe('color:red');
            });

            it("should batch execute correctly", function () {
                // batch 测试：
                expect(Dom.attr('#test-data input', 'id')).toBe('hidepass');
                Dom.attr('#test-data div', 'data-test', 'test');
                Dom.query("#test-data div").each(function (el) {
                    expect(Dom.attr(el, "data-test")).toBe("test");
                });
                Dom.attr([td], 'style', 'color:green;');
                expect(trimCssText(Dom.attr([td], 'style')))
                    .toBe('color:green');
            });

            it("should handle checked attribute correctly", function () {
                // 测试 checked 的 setter
                var checkbox2 = S.get('#test-20100728-checkbox');
                var body = document.body;
                Dom.attr(checkbox2, 'checked', true);
                expect(Dom.attr(checkbox2, 'checked')).toBe('checked');
                expect(Dom.prop(checkbox2, 'checked')).toBe(true);
                Dom.removeAttr(checkbox2, 'checked');
                expect(Dom.attr(checkbox2, 'checked')).toBe(undefined);
                expect(Dom.prop(checkbox2, 'checked')).toBe(false);
                expect(Dom.hasAttr(checkbox2, 'checked')).toBe(false);
                checkbox2.checked = true;
                Dom.attr(checkbox2, "dd", "dd");
                expect(Dom.hasAttr(checkbox2, "dd")).toBe(true);
                expect(Dom.hasProp(checkbox2, 'checked')).toBe(true);
                /**
                 * 2011-08-19 集合中，一个为true 都为true
                 */
                expect(Dom.hasAttr([body, checkbox2], "dd")).toBe(true);
                expect(Dom.hasProp([body, checkbox2], 'checked')).toBe(true);
            });

            it("should handle disabled correctly", function () {
                expect(Dom.attr(disabledTest, 'disabled')).not.toBe(true);
                Dom.attr(disabledTest, 'disabled', true);
                expect(Dom.attr(disabledTest, 'disabled')).toBe('disabled');
                expect(Dom.prop(disabledTest, 'disabled')).toBe(true);
                Dom.attr(disabledTest, 'disabled', false);
                expect(Dom.attr(disabledTest, 'disabled')).not.toBe(true);
            });

            it("should set/get correctly even encounter same input name", function () {
                var d = Dom.create("<form >	\
	        <input name='custom110829' id='custom110829' value='yy'/> \
	    </form>");
                Dom.append(d, document.body);
                Dom.attr(d, "custom110829", "xx");
                expect(Dom.attr(d, "custom110829")).toBe('xx');
                expect(Dom.val("#custom110829")).toBe("yy");
                Dom.remove(d);
            });

            // fix #100
            it("option.attr(\"value\")", function () {
                var s = Dom.create("<select><option value='1'>一</option>" +
                    "<option value=''>二</option><option>三</option></select>");
                Dom.append(s, 'body');
                var ret = [];
                S.each(Dom.query('option', s), function (o) {
                    ret.push(Dom.attr(o, 'value'));
                });
                expect(ret).toEqual(["1", "", undefined]);
                Dom.remove(s);
            });

            // https://github.com/kissyteam/kissy/issues/198
            it("do not change text when change link", function () {
                var a = Dom.create("<a href='#'>haha@haha</a>");
                Dom.attr(a, 'href', "http://www.g.cn");
                expect(Dom.attr(a, 'href')).toBe("http://www.g.cn");
                expect(Dom.html(a)).toBe("haha@haha");
            });

            it("get attribute from form correctly", function () {
                var form = Dom.create("<form " +
                    " xx='zz' " +
                    " action='http://www.taobao.com' " +
                    " name='form_name' " +
                    " title='form_title' " +
                    " onsubmit='return false;'><input name='xx' value='yy'></form>");
                expect(Dom.attr(form, "action")).toBe("http://www.taobao.com");
                expect(Dom.attr(form, "onsubmit")).toBe("return false;");
                expect(Dom.attr(form, "name")).toBe("form_name");
                expect(Dom.attr(form, 'title')).toBe("form_title");
                // prevent input shadow
                expect(Dom.attr(form, "xx")).toBe("zz");
                Dom.attr(form, "xx", "qq");
                expect(Dom.attr(form, "xx")).toBe("qq");
                expect(Dom.val(Dom.first(form))).toBe("yy");
                var button = Dom.create("<button value='xxx'>zzzz</button>");
                expect(Dom.attr(button, 'value')).toBe("xxx");
            });
        });

        describe('remove', function () {
            it("should remove attribute correctly", function () {
                // normal
                Dom.attr(label, 'test-remove', 'xx');
                expect(Dom.attr(label, 'test-remove')).toBe('xx');
                Dom.removeAttr(label, 'test-remove');
                expect(Dom.attr(label, 'test-remove')).toBe(undefined);
                // style
                Dom.removeAttr(a, 'style');
                expect(Dom.attr(a, 'style')).toBe("");
            });
        });

        describe("val", function () {
            it("should works for input", function () {
                // normal
                expect(Dom.val(input)).toBe('hello');
            });

            it("should works for input", function () {
                // area
                expect(Dom.val(area).length).toBe(4);
            });

            it("should works for options", function () {
                // option
                expect(Dom.val(opt)).toBe('1');
                expect(Dom.val(opt2)).toBe('2');
            });

            it("should works for select", function () {
                // select
                expect(Dom.val(select)).toBe('1');
                expect(Dom.val(select2)).toBe('2');
                expect(Dom.val(select3)).toEqual(['1', '2']);
            });

            it("should works for radio", function () {
                // radio
                expect(Dom.val(radio)).toBe("on");
                expect(Dom.val(radio2)).toBe("on");
            });

            it("should set value correctly", function () {
                // set value
                Dom.val(a, 'test');
                expect(Dom.val(a)).toBe('test');
                Dom.removeAttr(a, 'value');
            });

            it("should set select value correctly", function () {
                // select set value
                Dom.val(select, '3');
                expect(Dom.val(select)).toBe('3');
                // restore
                Dom.val(select, 0);
                Dom.val(select3, ['2', '3']);
                expect(Dom.val(select3)).toEqual(['2', '3']);
                //restore
                Dom.val(select3, ['1', '2']);
                Dom.val(select, '1');
            });
        });

        describe("text", function () {
            it("should set text correctly", function () {
                Dom.text(div, 'hello, are you ok?');
                expect(Dom.text(div)).toBe('hello, are you ok?');
            });

            it("should get text correctly", function () {
                Dom.html(div, '\t<p>1</p><p>2</p>\t');
                expect(Dom.text(div)).toBe('\t12\t');
            });
        });

        describe('tabindex', function () {
            it("should handle tabindex correctly", function () {
                Dom.removeAttr(select, 'tabindex');
                expect(Dom.hasAttr(select, 'tabindex')).toBe(false);
                Dom.attr(select, 'tabindex', 1);
                expect(Dom.attr(select, 'tabindex')).toBe(1);
                expect(Dom.hasAttr(select, 'tabindex')).toBe(true);
                Dom.removeAttr(select, 'tabindex');
                expect(Dom.hasAttr(select, 'tabindex')).toBe(false);

                var a = Dom.create("<a></a>");
                expect(Dom.hasAttr(a, 'tabindex')).toBe(false);

                expect(Dom.attr(a, 'tabindex')).toBe(undefined);
                expect($(a).attr('tabindex')).toBe(undefined);

                a = Dom.create("<a href='#'></a>");
                expect(Dom.hasAttr(a, 'tabindex')).toBe(false);
                expect(Dom.attr(a, 'tabindex')).toBe(0);

                a = Dom.create("<a href='#' tabindex='2'></a>");
                expect(Dom.hasAttr(a, 'tabindex')).toBe(true);
                expect(Dom.attr(a, 'tabindex')).toBe(2);
            });
        });
        describe("prop", function () {
            it("should works", function () {
                var d = Dom.create("<input type='checkbox' checked='checked'>");
                expect(Dom.prop(d, 'checked')).toBe(true);
                // undefined property
                expect(Dom.prop(d, 'checked2')).toBe(undefined);
                expect(Dom.hasProp(d, 'checked')).toBe(true);
                expect(Dom.hasProp(d, 'checked2')).toBe(false);
            });

            it('removeProp works', function () {
                var d = Dom.create("<input type='checkbox' checked='checked'>");
                Dom.prop(d, 'x', 'i');
                expect(Dom.hasProp(d,'x')).toBe(true);
                expect(Dom.prop(d, 'x')).toBe('i');
                Dom.removeProp(d,'x');
                expect(Dom.hasProp(d,'x')).toBe(false);
            });
        });
    });
}, {
    requires: ['dom']
});