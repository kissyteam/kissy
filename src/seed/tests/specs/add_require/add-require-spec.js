describe("KISSY.add({x:{requires:[]}}) ", function () {
    var S = KISSY,
        ComboLoader = S.Loader.Combo;

    it("should unalias", function () {
        var combine = KISSY.config("combine");

        KISSY.config("combine", false);

        expect(KISSY.config("combine")).toBe(false);

        KISSY.add({
            "add_require/x/":{
                requires:['add_require/y/']
            }
        });

        expect(KISSY.Env.mods["add_require/x/"]).toBeUndefined();
        expect(KISSY.Env.mods["add_require/x/index"]).toBeDefined();
        expect(KISSY.Env.mods["add_require/y/"]).toBeUndefined();
        expect(KISSY.Env.mods["add_require/y/index"]).toBeDefined();
        expect(KISSY.Env.mods["add_require/x/index"].requires)
            .toEqual(['add_require/y/index']);


        KISSY.config("combine", true);

        expect(KISSY.config("combine")).toBe(true);

        KISSY.add({
            "add_require/a/":{
                requires:['add_require/b/']
            }
        });

        expect(KISSY.Env.mods["add_require/a/"]).toBeUndefined();
        expect(KISSY.Env.mods["add_require/a/index"]).toBeDefined();
        expect(KISSY.Env.mods["add_require/b/"]).toBeUndefined();
        expect(KISSY.Env.mods["add_require/b/index"]).toBeDefined();
        expect(KISSY.Env.mods["add_require/a/index"].requires)
            .toEqual(['add_require/b/index']);


        KISSY.config("combine", combine);

    });

});