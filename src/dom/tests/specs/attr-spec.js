/**
 * test cases for attribute sub module of dom module
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,core", function (S, DOM) {

    var $= S.all;
    S.get = DOM.get;
    S.query = DOM.query;

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

        S.get = DOM.get;
        S.query = DOM.query;

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

            // kissy 里，对不存在的属性，统一返回 undefined
            it("should return undefined when get no-exist attribute", function () {
                expect(DOM.attr("a", "no-exist")).toBe(undefined)
            });

            it("should return correctly for readonly, checked, selected", function () {
                expect(DOM.attr(input, "readonly")).toBe("readonly");
                // same with jquery , null changed to undefined
                expect(DOM.attr(radio, 'checked')).toBe(undefined);
                expect(jQuery(radio).attr('checked')).toBe(undefined);
                // standard browser returns null
                // ie<8 return false , === radio.checked
                // expect(radio.getAttribute("checked")).toBe(undefined);
                expect(DOM.attr(input, 'value')).toBe('hello');
                expect(DOM.val(input)).toBe('hello');
                DOM.attr(input, 'value', 'zz');
                expect(DOM.val(input)).toBe('zz');

                DOM.attr(input, 'value', 'hello');
                DOM.val(input, 'hello')
            });

            it("should return style correctly", function () {
                expect(typeof (DOM.attr(a, "style")) == 'string').toBe(true);
            });

            it("should return selected correctly", function () {
                expect(DOM.attr(opt, "selected")).toBe("selected");
                expect(DOM.prop(opt, "selected")).toBe(true);
            });


            it('should get cutom attribute correctly', function () {
                // 对于非 mapping 属性：
                // ie 下可以用 a.name 或 a['name'] 获取，其它浏览器下不能，即便有值也返回 undefined
                //alert(a['data-test']);
                //alert(a.getAttribute('data-test'));
                expect(DOM.attr(a, 'data-test')).toBe('test');
            });

            // ie bugs fix:
            it("should handle class and for correctly for ie7-", function () {
                // ie7- 要用 className
                expect(DOM.attr(label, 'class')).toBe('test');
                // ie7- 要用 htmlFor
                expect(DOM.attr(label, 'for')).toBe('test-input');
            });

            it("should get href/src/rowspan correctly", function () {
                // href - http://www.glennjones.net/Post/809/getAttributehrefbug.htm
                // alert(a.href); // 在所有浏览器下，a.href 和 a['href'] 都返回绝对地址
                // alert(a.getAttribute('href')); // ie7- 下，会返回绝对地址

                DOM.attr(a, 'href', '../kissy/');

                expect(DOM.attr(a, 'href')).toBe('../kissy/');

                DOM.attr(img, 'src', '../others/logo.png');

                expect(DOM.prop(img, 'src'))
                    .toBe(new S.Uri(location.href).resolve('../others/logo.png').toString());

                expect(DOM.attr(img, 'src')).toBe('../others/logo.png');

                // colspan / rowspan:
                expect(DOM.attr(td, 'rowspan') + '').toBe('2');
            });

            it("should get normal attribute correctly", function () {
                expect(DOM.attr(a, 'title')).toBe('test');
            });

            it("should set normal attribute correctly", function () {
                DOM.attr(a, 'data-set', 'test-xx');
                expect(DOM.attr(a, 'data-set')).toBe('test-xx');
            });

            it("should set style correctly", function () {
                // style
                DOM.attr(td, 'style', 'color:red;');
                expect(trimCssText(DOM.attr(td, 'style'))).toBe('color:red');
            });


            it("should batch execute correctly", function () {
                // batch 测试：
                expect(DOM.attr('#test-data input', 'id')).toBe('hidepass');
                DOM.attr('#test-data div', 'data-test', 'test');
                DOM.query("#test-data div").each(function (el) {
                    expect(DOM.attr(el, "data-test")).toBe("test");
                });
                DOM.attr([td], 'style', 'color:green;');
                expect(trimCssText(DOM.attr([td], 'style')))
                    .toBe('color:green');
            });

            it("should handle checked attribute correctly", function () {
                // 测试 checked 的 setter
                var checkbox2 = S.get('#test-20100728-checkbox');
                var body = document.body;
                DOM.attr(checkbox2, 'checked', true);
                expect(DOM.attr(checkbox2, 'checked')).toBe('checked');
                expect(DOM.prop(checkbox2, 'checked')).toBe(true);
                DOM.removeAttr(checkbox2, 'checked');
                expect(DOM.attr(checkbox2, 'checked')).toBe(undefined);
                expect(DOM.prop(checkbox2, 'checked')).toBe(false);
                expect(DOM.hasAttr(checkbox2, "checked")).toBe(false);

                checkbox2.checked = true;
                DOM.attr(checkbox2, "dd", "dd");
                expect(DOM.hasAttr(checkbox2, "dd")).toBe(true);
                expect(DOM.hasProp(checkbox2, "checked")).toBe(true);

                /**
                 * 2011-08-19 集合中，一个为true 都为true
                 */
                expect(DOM.hasAttr([body, checkbox2], "dd")).toBe(true);
                expect(DOM.hasProp([body, checkbox2], "checked")).toBe(true);

            });


            it("should handle disabled correctly", function () {

                expect(DOM.attr(disabledTest, "disabled")).not.toBe(true);

                DOM.attr(disabledTest, "disabled", true);

                expect(DOM.attr(disabledTest, "disabled")).toBe("disabled");
                expect(DOM.prop(disabledTest, "disabled")).toBe(true);

                DOM.attr(disabledTest, "disabled", false);

                expect(DOM.attr(disabledTest, "disabled")).not.toBe(true);
            });

            it("should set/get correctly even encouter same input name", function () {
                var d = DOM.create("<form >	\
	        <input name='custom110829' id='custom110829' value='yy'/> \
	    </form>");
                DOM.append(d, document.body);
                DOM.attr(d, "custom110829", "xx");
                expect(DOM.attr(d, "custom110829")).toBe('xx');
                expect(DOM.val("#custom110829")).toBe("yy");
                DOM.remove(d);
            });
        });


        describe("remove", function () {
            it("should remove attribute correctly", function () {

                // normal
                DOM.attr(label, 'test-remove', 'xx');
                expect(DOM.attr(label, 'test-remove')).toBe('xx');
                DOM.removeAttr(label, 'test-remove');
                expect(DOM.attr(label, 'test-remove')).toBe(undefined);

                // style
                DOM.removeAttr(a, 'style');
                expect(DOM.attr(a, "style")).toBe("");

            });
        });


        describe("val", function () {

            it("should works for input", function () {
                // normal
                expect(DOM.val(input)).toBe('hello');
            });

            it("should works for input", function () {
                // area
                expect(DOM.val(area).length).toBe(4);
            });

            it("should works for options", function () {
                // option
                expect(DOM.val(opt)).toBe('1');
                expect(DOM.val(opt2)).toBe('2');
            });

            it("should works for select", function () {
                // select
                expect(DOM.val(select)).toBe('1');
                expect(DOM.val(select2)).toBe('2');
                expect(DOM.val(select3)).toEqual(['1', '2']);
            });

            it("should works for radio", function () {
                // radio
                expect(DOM.val(radio)).toBe("on");
                expect(DOM.val(radio2)).toBe("on");
            });

            it("should set value correctly", function () {
                // set value
                DOM.val(a, 'test');
                expect(DOM.val(a)).toBe('test');
                DOM.removeAttr(a, 'value');
            });

            it("should set select value correctly", function () {
                // select set value
                DOM.val(select, '3');
                expect(DOM.val(select)).toBe('3');
                // restore
                DOM.val(select, 0);
                DOM.val(select3, ['2', '3']);
                expect(DOM.val(select3)).toEqual(['2', '3']);

                //restore
                DOM.val(select3, ['1', '2']);
                DOM.val(select, '1');
            });

        });


        describe("text", function () {
            it("should set text correctly", function () {
                DOM.text(div, 'hello, are you ok?');
                expect(DOM.text(div)).toBe('hello, are you ok?');
            });
        });


        describe("tabindex", function () {
            it("should handle tabindex correctly", function () {
                DOM.removeAttr(select, "tabindex");
                expect(DOM.hasAttr(select, "tabindex")).toBe(false);
                DOM.attr(select, 'tabindex', 1);
                expect(DOM.attr(select, "tabindex")).toBe(1);
                expect(DOM.hasAttr(select, "tabindex")).toBe(true);
                DOM.removeAttr(select, "tabindex");
                expect(DOM.hasAttr(select, "tabindex")).toBe(false);

                var a = DOM.create("<a></a>");
                expect(DOM.hasAttr(a, "tabindex")).toBe(false);

                expect(DOM.attr(a, "tabindex")).toBe(undefined);
                expect($(a).attr("tabindex")).toBe(undefined);

                a = DOM.create("<a href='#'></a>");
                expect(DOM.hasAttr(a, "tabindex")).toBe(false);
                expect(DOM.attr(a, "tabindex")).toBe(0);

                a = DOM.create("<a href='#' tabindex='2'></a>");
                expect(DOM.hasAttr(a, "tabindex")).toBe(true);
                expect(DOM.attr(a, "tabindex")).toBe(2);

            });
        });

        describe("form/name/button/event works for ie6/7", function () {
            it("get attribute from form correctly", function () {
                var form = DOM.create("<form " +
                    " xx='zz' " +
                    " action='http://www.taobao.com' " +
                    " name='form_name' " +
                    " title='form_title' " +
                    " onsubmit='return false;'><input name='xx' value='yy'></form>");
                expect(DOM.attr(form, "action")).toBe("http://www.taobao.com");
                expect(DOM.attr(form, "onsubmit")).toBe("return false;");
                expect(DOM.attr(form, "name")).toBe("form_name");
                expect(DOM.attr(form, "title")).toBe("form_title");
                // prevent input shadow
                expect(DOM.attr(form, "xx")).toBe("zz");
                DOM.attr(form, "xx", "qq");
                expect(DOM.attr(form, "xx")).toBe("qq");
                expect(DOM.val(DOM.first(form))).toBe("yy");

                var button = DOM.create("<button value='xxx'>zzzz</button>");
                expect(DOM.attr(button, "value")).toBe("xxx");
            });
        });


        describe("prop", function () {
            it("should works", function () {
                var d = DOM.create("<input type='checkbox' checked='checked'>");
                expect(DOM.prop(d, 'checked')).toBe(true);
                // undefined property
                expect(DOM.prop(d, 'checked2')).toBe(undefined);
                expect(DOM.hasProp(d, 'checked')).toBe(true);
                expect(DOM.hasProp(d, 'checked2')).toBe(false);
            });
        });


        // fix #100
        it("option.attr(\"value\")", function () {

            var s = DOM.create("<select><option value='1'>一</option>" +
                "<option value=''>二</option><option>三</option></select>");
            DOM.append(s, "body");
            var ret = [];
            S.each(DOM.query('option', s), function (o) {
                ret.push(DOM.attr(o, "value"));
            });
            expect(ret).toEqual(["1", "", undefined]);
            DOM.remove(s);
        });

        // https://github.com/kissyteam/kissy/issues/198
        it("do not change text when change link", function () {
            var a = DOM.create("<a href='#'>haha@haha</a>");
            DOM.attr(a, "href", "http://www.g.cn");
            expect(DOM.attr(a, "href")).toBe("http://www.g.cn");
            expect(DOM.html(a)).toBe("haha@haha");
        });
    });


});