describe("KISSY.config('modules', {x:{requires:[]}}) ", function () {
    var S = KISSY;

    it("should solve index", function () {

        KISSY.config("modules", {
            "add_require/x/":{
                requires:['add_require/y/']
            }
        });

        expect(KISSY.Env.mods["add_require/x/"]).toBeUndefined();
        expect(KISSY.Env.mods["add_require/x/index"]).toBeDefined();
        expect(KISSY.Env.mods["add_require/y/"]).toBeUndefined();
        expect(KISSY.Env.mods["add_require/y/index"]).toBeUndefined();
        expect(KISSY.Env.mods["add_require/x/index"].requires)
            .toEqual(['add_require/y/']);

        KISSY.config('modules',{
            "add_require/a/":{
                requires:['add_require/b/']
            }
        });

        expect(KISSY.Env.mods["add_require/a/"]).toBeUndefined();
        expect(KISSY.Env.mods["add_require/a/index"]).toBeDefined();
        expect(KISSY.Env.mods["add_require/b/"]).toBeUndefined();
        expect(KISSY.Env.mods["add_require/b/index"]).toBeUndefined();
        expect(KISSY.Env.mods["add_require/a/index"].requires)
            .toEqual(['add_require/b/']);

    });

});