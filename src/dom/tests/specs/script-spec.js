/**
 * tc about script exec when clone and insert
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,core", function (S, DOM) {
    var $= S.all;
    var div = $('<div style="display:none"></div>').prependTo("body");

    describe("script", function () {

        var o1, o2, scriptTestHolder2, o22;

        div[0].innerHTML = '<div id="scriptTestHolder">\
            <script>\
        if (!window.scriptTest1) {\
            window.scriptTest1 = 1;\
        } else {\
            window.scriptTest1++;\
        }\
        </script>\
            <script src="../others/scripts-exec/clone-ie-tc.js"></script>\
        </div>';

        o1 = window.scriptTest1 = 1;
        o2 = window.scriptTest2 = 1;

        var scriptTestHolder = DOM.get("#scriptTestHolder");

        it("behave right", function () {

            expect(o1).toBe(1);
            expect(o2).toBe(1);
            scriptTestHolder2 = DOM.clone(scriptTestHolder, true);

            waits(10);

            runs(function () {
                // inline should not run when clone
                o1 = window['scriptTest1'];
                expect(o1).toBe(1);

                // external should not run when clone
                o22 = o2 = scriptTest2;
                // ie9 bug
                if (S.UA.ie != 9) {
                    expect(o2).toBe(1);
                }
            });

            runs(function () {
                // div.prepend(scriptTestHolder2);
                DOM.prepend(scriptTestHolder2, div);
            });

            waits(10);
            runs(function () {
                // "inline should not run when insert"
                o1 = window['scriptTest1'];
                expect(o1).toBe(1);

                // external should not run when insert
                o2 = scriptTest2;
                expect(o2).toBe(o22);

                div.remove();
            });

        });

    });
});
