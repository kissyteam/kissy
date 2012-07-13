/**
 * Path spec for kissy
 * @author yiminghe@gmail.com
 */
describe("path", function () {
    var Path = KISSY.Path;

    it("resolve works", function () {
        expect(Path.resolve("x", "y", "..", "z", ".")).toBe("x/z")
    });

    it("normalize works", function () {

        expect(Path.normalize("x/y/z/../q/./")).toBe("x/y/q/");

        expect(Path.normalize("x/y/z/../q/.")).toBe("x/y/q");

    });

    it("join works", function () {
        expect(Path.join("x", "y", "..", "z", ".")).toBe("x/z");
    });

    it("relative works", function () {
        expect(Path.relative("x/y/z", "x/y")).toBe("..");

        expect(Path.relative("x/y/", "x/y/z/q")).toBe("z/q");

        expect(Path.relative("x/y", "x/y/z/q")).toBe("z/q");

        expect(Path.relative("x/y", "x/y/z/q/")).toBe("z/q");
    });
});