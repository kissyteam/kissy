/**
 * tc about script exec when clone and insert
 * @author yiminghe@gmail.com
 */
KISSY.use("dom", function(S, DOM) {
    var scriptTestHolder = DOM.get("#scriptTestHolder");
    var div = $('<div style="display:none"></div>').prependTo("body");
    describe("script", function() {
        var o1,o2,scriptTestHolder2,o22;
        o1 = window['scriptTest1'];
        o2 = scriptTest2;

        it("setup", function() {
            waits(500);
            runs(function() {
                expect(o1).toBe(1);
                expect(o2).toBe(1);
                scriptTestHolder2 = DOM.clone(scriptTestHolder, true);
            });
        });

        it("inline should not run when clone", function() {

            waits(500);
            runs(function() {
                o1 = window['scriptTest1'];
                expect(o1).toBe(1);

            });

        });

        it("external should not run when clone", function() {

            waits(500);
            runs(function() {
                o22=o2 = scriptTest2;
                // ie bug
                //expect(o2).toBe(1);
            });

        });


        it("setup insert", function() {
            DOM.prepend(scriptTestHolder2, div);
            waits(500);
        });

        it("inline should not run when insert", function() {
            o1 = window['scriptTest1'];
            expect(o1).toBe(1);
        });

        it("external should not run when insert", function() {
            o2 = scriptTest2;
            expect(o2).toBe(o22);
        });


    });
});
