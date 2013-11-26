/**
 * test cases for input-selection
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom) {
    describe("input-selection", function () {
        it("works for ie", function () {
            var textarea = Dom.create("<textarea></textarea>");
            Dom.append(textarea, document.body);

            textarea.value = "1\n2\n3";
            // \n will be "\r\n" in ie<9
            // alert(textarea.value.length);

            var docMode = S.UA.ieMode;

            if (docMode < 9) {

                waits(100);
                runs(function () {
                    textarea.focus();
                });

                waits(100);
                // "1\r\n2\r\n3\r\n";
                runs(function () {
                    Dom.prop(textarea, "selectionStart", 1);
                    Dom.prop(textarea, "selectionEnd", 4);
                    expect(document.selection.createRange().text).toBe("\r\n2");
                });

                waits(1000);
                runs(function () {
                    Dom.prop(textarea, "selectionStart", 6);
                    expect(document.selection.createRange().text).toBe("");
                    expect(Dom.prop(textarea, "selectionStart")).toBe(6);
                    expect(Dom.prop(textarea, "selectionEnd")).toBe(6);
                });
                waits(1000);
                runs(function () {
                    Dom.prop(textarea, "selectionEnd", 3);
                    expect(document.selection.createRange().text).toBe("");
                    expect(Dom.prop(textarea, "selectionStart")).toBe(3);
                    expect(Dom.prop(textarea, "selectionEnd")).toBe(3);
                });
            } else {
                expect('other ok').toBe('other ok');
            }
            waits(1000);
            runs(function () {
                Dom.remove(textarea);
            });
        });
    });
},{
    requires:['dom']
});