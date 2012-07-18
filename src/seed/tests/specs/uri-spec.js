/**
 * Uri spec for kissy.
 * @author yiminghe@gmail.com
 */
describe("uri", function () {
    var Uri = KISSY.Uri;


    it("create works", function () {
        var base = new Uri("http://my:sd@a/b/c/d;p?q#w");
        expect(base.getScheme()).toBe("http");
        expect(base.getHostname()).toBe("a");
        expect(base.getUserInfo()).toBe("my:sd");
        expect(base.getPath()).toBe("/b/c/d;p");
        expect(base.getQuery().toString()).toBe("q");
        expect(base.getFragment()).toBe("w");
    });

    it('query works', function () {
        var query = new Uri.Query("x=1&y=2");

        expect(query.toString()).toBe("x=1&y=2");

        query.set("x", "3");

        expect(query.toString()).toBe("x=3&y=2");

        query.set("z", "5");

        expect(query.toString()).toBe("x=3&y=2&z=5");

        query.remove("x");

        expect(query.toString()).toBe("y=2&z=5");

        query.set({
            x:6,
            y:7
        });

        expect(query.toString()).toBe("y=7&z=5&x=6");

        expect(query.count()).toBe(3);

        query.add({
            x:61,
            y:71
        });

        expect(query.toString(false)).toBe("y=7&y=71&z=5&x=6&x=61");

        expect(query.count()).toBe(5);

        var q2=new Uri.Query("x1=1&y1=2");

        query.reset("x1=3&y1=4");

        query.add(q2);

        expect(query.toString(false)).toBe("x1=3&x1=1&y1=4&y1=2");

        expect(query.count()).toBe(4);

        query.set(q2);

        expect(query.toString(false)).toBe("x1=1&y1=2");

        expect(query.count()).toBe(2);

    });

    it("resolve works", function () {
        var base = new Uri("http://a/b/c/d;p?q");

        // Normal Examples
        expect(base.resolve(new Uri("g:h")).toString()).toBe("g:h");

        expect(base.resolve(new Uri("g")).toString()).toBe("http://a/b/c/g");
        expect(base.resolve(new Uri("./g")).toString()).toBe("http://a/b/c/g");
        expect(base.resolve(new Uri("g/")).toString()).toBe("http://a/b/c/g/");
        expect(base.resolve(new Uri("/g")).toString()).toBe("http://a/g");
        expect(base.resolve(new Uri("//g")).toString()).toBe("http://g");
        expect(base.resolve(new Uri("?y")).toString()).toBe("http://a/b/c/d;p?y");
        expect(base.resolve(new Uri("g?y")).toString()).toBe("http://a/b/c/g?y");

        expect(base.resolve(new Uri("#s")).toString()).toBe("http://a/b/c/d;p?q#s");
        expect(base.resolve(new Uri("g#s")).toString()).toBe("http://a/b/c/g#s");
        expect(base.resolve(new Uri("g?y#s")).toString()).toBe("http://a/b/c/g?y#s");
        expect(base.resolve(new Uri(";x")).toString()).toBe("http://a/b/c/;x");
        expect(base.resolve(new Uri("g;x")).toString()).toBe("http://a/b/c/g;x");
        expect(base.resolve(new Uri("")).toString()).toBe("http://a/b/c/d;p?q");

        expect(base.resolve(new Uri(".")).toString()).toBe("http://a/b/c");

        expect(base.resolve(new Uri("./")).toString()).toBe("http://a/b/c/");
        expect(base.resolve(new Uri("..")).toString()).toBe("http://a/b");

        expect(base.resolve(new Uri("../")).toString()).toBe("http://a/b/");
        expect(base.resolve(new Uri("../g")).toString()).toBe("http://a/b/g");
        expect(base.resolve(new Uri("../..")).toString()).toBe("http://a/");
        expect(base.resolve(new Uri("../../")).toString()).toBe("http://a/");
        expect(base.resolve(new Uri("../../g")).toString()).toBe("http://a/g");

        // Abnormal Examples
        expect(base.resolve(new Uri("../../../g")).toString()).toBe("http://a/g");
        expect(base.resolve(new Uri("../../../../g")).toString()).toBe("http://a/g");

        //others
        expect(base.resolve(new Uri("/./g")).toString()).toBe("http://a/g");
        expect(base.resolve(new Uri("/../g")).toString()).toBe("http://a/g");
        expect(base.resolve(new Uri("g.")).toString()).toBe("http://a/b/c/g.");
        expect(base.resolve(new Uri(".g")).toString()).toBe("http://a/b/c/.g");
        expect(base.resolve(new Uri("g..")).toString()).toBe("http://a/b/c/g..");
        expect(base.resolve(new Uri("..g")).toString()).toBe("http://a/b/c/..g");


        expect(base.resolve(new Uri("./../g")).toString()).toBe("http://a/b/g");
        expect(base.resolve(new Uri("./g/.")).toString()).toBe("http://a/b/c/g");
        expect(base.resolve(new Uri("g/./h")).toString()).toBe("http://a/b/c/g/h");
        expect(base.resolve(new Uri("g/../h")).toString()).toBe("http://a/b/c/h");

        expect(base.resolve(new Uri("g;x=1/./y")).toString()).toBe("http://a/b/c/g;x=1/y");
        expect(base.resolve(new Uri("g;x=1/../y")).toString()).toBe("http://a/b/c/y");


        //expect(base.resolve(new Uri("g?y/./x")).toString()).toBe("http://a/b/c/g?y/./x");
        //expect(base.resolve(new Uri("g?y/../x")).toString()).toBe("http://a/b/c/g?y/../x");

        expect(base.resolve(new Uri("g?y")).toString()).toBe("http://a/b/c/g?y");

        expect(base.resolve(new Uri("g#s/./x")).toString()).toBe("http://a/b/c/g#s/./x");
        expect(base.resolve(new Uri("g#s/../x")).toString()).toBe("http://a/b/c/g#s/../x");


        //loophole
        // path=="g" or hostname=="g" ??
        expect(base.resolve(new Uri("http:g")).toString()).toBe("http:g");
    });
});
/**
 * Refer
 *  - http://www.ietf.org/rfc/rfc3986.txt 5.4
 */