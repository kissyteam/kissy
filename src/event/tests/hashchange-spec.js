/**
 * hashchange spec
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,event", function(S, DOM, Event) {
    describe("hashchange event", function() {

        it("should works", function() {
            location.hash = "#";
            var hash;
            Event.on(window, "hashchange", function() {
                hash = location.hash;
            });
            // 等待 iframe 建立成功，存储当前 hash "#"
            waits(100);

            runs(function() {
                location.hash = "#a";
            });

            waits(100);

            runs(function() {
                expect(hash).toBe("#a");
            });

            waits(100);

            runs(function() {
                location.hash = "#b";
            });

            waits(100);

            runs(function() {
                expect(hash).toBe("#b");
            });

            waits(100);

            runs(function() {
                location.hash = "#a";
            });

            waits(100);

            runs(function() {
                expect(hash).toBe("#a");
            });

            waits(100);

            runs(function() {
                location.hash = "#b";
            });

            waits(100);

            runs(function() {
                expect(hash).toBe("#b");
            });

            waits(100);
            runs(function() {
                history.back();
            });
            waits(100);

            runs(function() {
                expect(hash).toBe("#a");
            });

            runs(function() {
                history.back();
            });
            waits(100);

            runs(function() {
                expect(hash).toBe("#b");
            });

            runs(function() {
                history.back();
            });
            waits(100);

            runs(function() {
                expect(hash).toBe("#a");
            });
            runs(function() {
                history.back();
            });
            waits(100);

            runs(function() {
                // non-ie 返回 ""
                // expect(hash).toBe("#");
                expect(hash.replace(/^#/, "")).toBe("");
            });
        });

    });
});