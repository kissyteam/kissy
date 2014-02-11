/**
 * Path spec for kissy
 * @author yiminghe@gmail.com
 */
describe("path", function () {
    var Path = KISSY.Path;

    it("resolve works", function () {
        expect(Path.resolve('x', 'y', "..", "z", ".")).toBe("x/z");

        expect(Path.resolve('x',"./y")).toBe("x/y");

        expect(Path.resolve("/x","./y")).toBe("/x/y");
    });

    it("normalize works", function () {

        expect(Path.normalize("x/y/z/../q/./")).toBe("x/y/q/");

        expect(Path.normalize("x/y/z/../q/.")).toBe("x/y/q");

    });

    it("join works", function () {
        expect(Path.join('x', 'y', "..", "z", ".")).toBe("x/z");
    });

    it("relative works", function () {
        expect(Path.relative("x/y/z", "x/y")).toBe("..");

        expect(Path.relative("x/y/", "x/y/z/q")).toBe("z/q");

        expect(Path.relative("x/y", "x/y/z/q")).toBe("z/q");

        expect(Path.relative("x/y", "x/y/z/q/")).toBe("z/q");
    });

    it("basename works", function () {
        expect(Path.basename("x/y")).toBe('y');
        expect(Path.basename("x/")).toBe("x/");
        expect(Path.basename('x')).toBe('x');
        expect(Path.basename("x.htm")).toBe("x.htm");
        expect(Path.basename("x.htm", ".htm")).toBe('x');
    });

    it("dirname works", function () {
        expect(Path.dirname("x/y")).toBe('x');
        expect(Path.dirname("x/")).toBe(".");
        expect(Path.dirname("/x/")).toBe("/");
    });

    it("extname works", function () {
        expect(Path.extname("x.htm")).toBe(".htm");
        expect(Path.extname('x')).toBe("");
    });

});