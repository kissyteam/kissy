KISSY.use("dom,anim", function(S, DOM, Anim) {

    describe("queue", function() {
        it("should not exist memory leak", function() {
            var test = $('#test2');
            test.hide(1);
            waits(100);
            runs(function() {
                test.stop();
                var anims = test.data(ANIM_KEY);
                // stop 后清空
                expect(test.hasData(ANIM_KEY)).toBe(false);
                expect(anims).toBe(undefined);
            });
            runs(function() {
                test.hide(0.5);
            });

            waits(1000);

            runs(function() {
                var anims = test.data(ANIM_KEY);
                // stop 后清空
                expect(test.hasData(ANIM_KEY)).toBe(false);
                expect(anims).toBe(undefined);
            });
        });
    });
});