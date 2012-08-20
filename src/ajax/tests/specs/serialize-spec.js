/**
 * test cases for form serialization
 * @author yiminghe@gmail.com
 */
KISSY.use("node,ajax", function (S, Node, io) {
    var $ = Node.all;


    describe("Form serialize", function () {

        it("works in single condition", function () {
            var html = '<form>' +
                    '<div><input type="text" name="a" value="1" id="a" /></div>' +
                    '<div><input type="text" name="b" value="2" id="b" /></div>' +
                    '<div><input type="hidden" name="c" value="3" id="c" /></div>' +
                    '<div>' +
                    '<textarea name="d" rows="8" cols="40">4</textarea>' +
                    '</div>' +
                    '<div>' +
                    '<select name="e">' +
                    '<option value="5" selected="selected">5</option>' +
                    '<option value="6">6</option>' +
                    '<option value="7">7</option>' +
                    '</select>' +
                    '</div>' +
                    '<div>' +
                    '<input type="checkbox" name="f" value="8" id="f" />' +
                    '</div>' +
                    '<div>' +
                    '<input type="submit" name="g" value="Submit" id="g" />' +
                    '</div>' +
                    '</form>',
                form = $(html).appendTo("body"),
                ret = io.serialize(form);

            expect(ret).toBe("a=1&b=2&c=3&d=4&e=5");

            expect(io.serialize(form.all("input"))).toBe("a=1&b=2&c=3");

            expect(io.serialize(form.all("input"), true)).toBe("a=1&b=2&c=3");

            form.remove();
        });

        it("works in multiple condition", function () {

            var html = ' <form>' +
                    '<select name="single">' +
                    ' <option>Single</option>' +
                    '<option>Single2</option>' +
                    ' </select>' +
                    '   <br />' +
                    ' <select name="multiple" multiple="multiple">' +
                    '<option selected="selected">Multiple</option>' +
                    ' <option>Multiple2</option>' +
                    ' <option selected="selected">Multiple3</option>' +
                    '   </select>' +
                    '   <br/>' +
                    '  <input type="checkbox" name="check" value="check1" checked="checked" id="ch1"/>' +
                    '<label for="ch1">check1</label>' +
                    ' <input type="checkbox" name="check" value="check2" checked="checked" id="ch2"/>' +
                    ' <label for="ch2">check2</label>' +
                    '  <br />' +
                    '<input type="radio" name="radio" value="radio1" checked="checked" id="r1"/>' +
                    '<label for="r1">radio1</label>' +
                    ' <input type="radio" name="radio" value="radio2" id="r2"/>' +
                    ' <label for="r2">radio2</label>' +
                    '  </form>',
                form = $(html).appendTo("body"),
                ret = io.serialize(form);

            expect(ret).toBe("single=Single&multiple=Multiple&multiple=Multiple3" +
                "&check=check1&check=check2&radio=radio1");

            ret = io.serialize(form, true);

            var kuo = encodeURIComponent("[]");

            expect(ret).toBe("single=Single&multiple" + kuo +
                "=Multiple&multiple" + kuo +
                "=Multiple3" +
                "&check" + kuo +
                "=check1&check" + kuo +
                "=check2&radio=radio1");

            form.remove();


        });
    });
});