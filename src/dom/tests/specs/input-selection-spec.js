/**
 * test cases for input-selection
 * @author yiminghe@gmail.com
 */
KISSY.use("dom", function (S, DOM) {
    describe("input-selection", function () {

        it("works for ie", function () {
            var textarea = DOM.create("<textarea></textarea>");
            DOM.append(textarea, document.body);

            textarea.value = "1\n2\n3";
            // \n will be "\r\n" in ie<9
            // alert(textarea.value.length);

            var docMode = document.documentMode;

            if (docMode && docMode < 9) {

                waits(100);
                runs(function () {
                    textarea.focus();
                });

                waits(100);
                // "1\r\n2\r\n3\r\n";
                runs(function () {
                    DOM.prop(textarea, "selectionStart", 1);
                    DOM.prop(textarea, "selectionEnd", 4);
                    expect(document.selection.createRange().text).toBe("\r\n2");
                });

                waits(1000);
                runs(function () {
                    DOM.prop(textarea, "selectionStart", 6);
                    expect(document.selection.createRange().text).toBe("");
                    expect(DOM.prop(textarea, "selectionStart")).toBe(6);
                    expect(DOM.prop(textarea, "selectionEnd")).toBe(6);
                });
                waits(1000);
                runs(function () {
                    DOM.prop(textarea, "selectionEnd", 3);
                    expect(document.selection.createRange().text).toBe("");
                    expect(DOM.prop(textarea, "selectionStart")).toBe(3);
                    expect(DOM.prop(textarea, "selectionEnd")).toBe(3);
                });
            } else {
                expect('other ok').toBe('other ok');
            }
            waits(1000);
            runs(function () {
                DOM.remove(textarea);
            });

        });
    });
});