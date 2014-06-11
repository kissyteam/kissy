/**
 * url spec for kissy
 * @author yiminghe@gmail.com
 */

    var url = require('url');

    /*jshint quotmark:false*/
    describe("url", function () {
        it("create works", function () {
            var base = url.parse("http://my:sd@a/b/c/d;p?q#w");
            expect(base.protocol).toBe("http:");
            expect(base.host).toBe("a");
            expect(base.auth).toBe("my:sd");
            expect(base.pathname).toBe("/b/c/d;p");
            expect(base.query).toBe("q");
            expect(base.hash).toBe("#w");
        });

        it("invalid http:g", function () {
            var base = url.parse("http:g");
            expect(base.protocol).toBe("http:");
            expect(base.host).toBeFalsy();
            expect(base.auth).toBeFalsy();
            expect(base.pathname).toBe("g");
            expect(base.query).toBeFalsy();
            expect(base.hash).toBeFalsy();
        });

        it("will lowercase ", function () {
            var base = url.parse("HTTP://MY:SD@A/B/C");
            expect(base.protocol).toBe("http:");
            expect(base.host).toBe("a");
            expect(base.pathname).toBe("/B/C");
            expect(base.query).toBeFalsy();
            expect(base.hash).toBeFalsy();
        });

        it("create and parse query works", function () {
            var base = url.parse("http://my:sd@a/b/c/d;p?q=1#w", true);
            expect(base.protocol).toBe("http:");
            expect(base.host).toBe("a");
            expect(base.auth).toBe("my:sd");
            expect(base.pathname).toBe("/b/c/d;p");
            expect(base.query).toEqual({q: '1'});
            expect(base.hash).toBe("#w");
        });

        it('works for file:', function () {
            var base = url.parse("file:d:/x.png", true);
            expect(base.protocol).toBe("file:");
            expect(base.host).toBeFalsy();
            expect(base.pathname).toBe("d:/x.png");
            expect(base.href).toBe('file:d:/x.png');
            expect(url.format(base)).toBe("file:d:/x.png");
        });

        it('set hash works', function () {
            var u = url.parse('http://www.g.cn#heihei');

            expect(u.hash).toBe('#heihei');

            u.hash = 'haha';

            expect(url.format(u)).toBe('http://www.g.cn/#haha');
        });

        it('set hash works -2', function () {
            var u = url.parse('http://www.g.cn/#heihei');

            expect(u.hash).toBe('#heihei');

            u.hash = ('haha');

            expect(url.format(u)).toBe('http://www.g.cn/#haha');
        });

        describe('query', function () {
            it('allow special attribute name', function () {
                var u = url.parse('http://www.g.cn/?q=1', true);
                u.query.nodeType = 1;
                u.search = undefined;
                expect(url.format(u)).toBe('http://www.g.cn/?q=1&nodeType=1');
            });
        });

        it("resolve works", function () {
            var base = ("http://a/b/c/d;p?q");

            // Normal Examples
            expect(url.resolve(base, "g:h")).toBe("g:h");

            expect(url.resolve(base, ("g"))).toBe("http://a/b/c/g");
            expect(url.resolve(base, ("./g"))).toBe("http://a/b/c/g");
            expect(url.resolve(base, ("g/"))).toBe("http://a/b/c/g/");
            expect(url.resolve(base, ("/g"))).toBe("http://a/g");

            expect(url.resolve(base, ("//g"))).toBe("http://g/");
            expect(url.resolve(base, ("?y"))).toBe("http://a/b/c/d;p?y");
            expect(url.resolve(base, ("g?y"))).toBe("http://a/b/c/g?y");

            expect(url.resolve(base, ("#s"))).toBe("http://a/b/c/d;p?q#s");
            expect(url.resolve(base, ("g#s"))).toBe("http://a/b/c/g#s");
            expect(url.resolve(base, ("g?y#s"))).toBe("http://a/b/c/g?y#s");
            expect(url.resolve(base, (";x"))).toBe("http://a/b/c/;x");
            expect(url.resolve(base, ("g;x"))).toBe("http://a/b/c/g;x");
            expect(url.resolve(base, (""))).toBe("http://a/b/c/d;p?q");

            expect(url.resolve(base, ("."))).toBe("http://a/b/c/");
            expect(url.resolve(base, ("x/."))).toBe("http://a/b/c/x/");
            expect(url.resolve(base, ("x/y/.."))).toBe("http://a/b/c/x/");

            expect(url.resolve(base, ("./"))).toBe("http://a/b/c/");
            expect(url.resolve(base, (".."))).toBe("http://a/b/");

            expect(url.resolve(base, ("../"))).toBe("http://a/b/");
            expect(url.resolve(base, ("../g"))).toBe("http://a/b/g");
            expect(url.resolve(base, ("../.."))).toBe("http://a/");
            expect(url.resolve(base, ("../../"))).toBe("http://a/");
            expect(url.resolve(base, ("../../g"))).toBe("http://a/g");

            // Abnormal Examples
            expect(url.resolve(base, ("../../../g"))).toBe("http://a/g");
            expect(url.resolve(base, ("../../../../g"))).toBe("http://a/g");

            //others
            expect(url.resolve(base, ("/./g"))).toBe("http://a/g");
            expect(url.resolve(base, ("/../g"))).toBe("http://a/g");
            expect(url.resolve(base, ("g."))).toBe("http://a/b/c/g.");
            expect(url.resolve(base, (".g"))).toBe("http://a/b/c/.g");
            expect(url.resolve(base, ("g.."))).toBe("http://a/b/c/g..");
            expect(url.resolve(base, ("..g"))).toBe("http://a/b/c/..g");

            expect(url.resolve(base, ("./../g"))).toBe("http://a/b/g");
            expect(url.resolve(base, ("./g/."))).toBe("http://a/b/c/g/");
            expect(url.resolve(base, ("g/./h"))).toBe("http://a/b/c/g/h");
            expect(url.resolve(base, ("g/../h"))).toBe("http://a/b/c/h");

            expect(url.resolve(base, ("g;x=1/./y"))).toBe("http://a/b/c/g;x=1/y");
            expect(url.resolve(base, ("g;x=1/../y"))).toBe("http://a/b/c/y");

            expect(url.resolve(base, ("g?y"))).toBe("http://a/b/c/g?y");

            expect(url.resolve(base, ("g#s/./x"))).toBe("http://a/b/c/g#s/./x");
            expect(url.resolve(base, ("g#s/../x"))).toBe("http://a/b/c/g#s/../x");

            // loophole
            // path=="g" or hostname=="g" ??
            expect(url.resolve(base, ("http:g"))).toBe("http://a/b/c/g");

            expect(url.resolve('http://g.cn?t', ("http://g.cn#t"))).toBe("http://g.cn/#t");

            expect(url.resolve('http://x:n@g.cn/x?t', ("http://g.cn"))).toBe("http://x:n@g.cn/");
        });
    });
    /**
     * Refer
     *  - http://www.ietf.org/rfc/rfc3986.txt 5.4
     */
