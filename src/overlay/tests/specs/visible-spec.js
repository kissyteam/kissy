KISSY.use("ua,node,overlay", function (S, UA, Node, Overlay) {
    describe("visible", function () {
        it("should not fire hide on show", function () {
            var overlay = new Overlay({
                content:"haha"
            });
            var show = 0, hide = 0;
            overlay.on("show", function () {
                show = 1;
            });
            overlay.on("hide", function () {
                hide++;
            });
            overlay.hide();
            expect(show).toBe(0);
            expect(hide).toBe(0);
            overlay.show();
            expect(show).toBe(1);
            expect(hide).toBe(0);
        });


        it("should not fire show on render", function () {
            var overlay = new Overlay({
                content:"haha"
            });
            var show = 0, hide = 0;
            overlay.on("show", function () {
                show = 1;
            });
            overlay.on("hide", function () {
                hide++;
            });
            overlay.render();
            expect(show).toBe(0);
            expect(hide).toBe(0);
        });


        it("should fire show on show", function () {
            var overlay = new Overlay({
                content:"haha"
            }),
                show = 0,
                hide = 0;
            overlay.on("show", function () {
                show = 1;
            });
            overlay.on("hide", function () {
                hide++;
            });
            overlay.show();
            expect(show).toBe(1);
            expect(hide).toBe(0);
        });
    });
});
