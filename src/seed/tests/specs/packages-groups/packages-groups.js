describe("modules and groups", function()
{
    var S = KISSY, ComboLoader = S.Loader.ComboLoader;

    it("combo packages", function()
    {
        waits(10);
        runs(function()
        {
            S.clearLoader();
            var waitingModules = new S.Loader.WaitingModules(function () {
            });
            var l = new S.Loader.ComboLoader(S, waitingModules);
            
            KISSY.config(
            {
                packages:
                {
                    "pkg-a":
                    {
                        group: "my",
                        base: "../specs/packages-groups"
                    },
                    "pkg-b":
                    {
                        group: "my",
                        base: "../specs/packages-groups"
                    },
                    "pkg-c":
                    {
                        base: "../specs/packages-groups"
                    }
                },
                modules:
                {
                    "pkg-a/a":
                    {
                        requires: ["pkg-b/b"]
                    }
                }
            });

            var r = S.keys(l.calculate(["pkg-a/a", "pkg-c/c"]));
            S.Loader.Utils.createModulesInfo(S, r);
            var c = l.getComboUrls(r);
            var js = c.js['myutf-8'];
            expect(js.length).toBe(1);
            expect(js[0].fullpath.substring(js[0].fullpath.indexOf('??'))).toBe("??pkg-a/a.js,pkg-b/b.js?t=" + S.Config.tag + ".js");
            js = c.js['pkg-c'];
            expect(js.length).toBe(1);
            expect(js[0].fullpath.substring(js[0].fullpath.indexOf('??'))).toBe("??c.js?t=" + S.Config.tag + ".js");
        });
    });
    
    it("combo packages which have no combo prefix", function()
    {
        waits(10);
        runs(function()
        {
            S.clearLoader();
            var waitingModules = new S.Loader.WaitingModules(function () {
            });
            var l = new S.Loader.ComboLoader(S, waitingModules);
            
            KISSY.config(
            {
                packages:
                {
                    "pkg-a":
                    {
                        group: "my",
                        base: "../specs/packages-groups"
                    },
                    "test":
                    {
                        group: "my",
                        base: "http://g.tbcdn.cn"
                    }
                },
                modules:
                {
                    "pkg-a/a": {},
                    "test/x": {}
                }
            });

            var r = S.keys(l.calculate(["pkg-a/a", "test/x"]));
            S.Loader.Utils.createModulesInfo(S, r);
            var c = l.getComboUrls(r);
            var js = c.js['myutf-8'];
            expect(js.length).toBe(1);
            expect(js[0].fullpath.substring(js[0].fullpath.indexOf('??'))).toBe("??a.js?t=" + S.Config.tag + ".js");
            var js = c.js['test'];
            expect(js.length).toBe(1);
            expect(js[0].fullpath).toBe("http://g.tbcdn.cn/test/??x.js?t=" + S.Config.tag + ".js");
        });
    });

    it("combo packages with different charset", function()
    {
        waits(10);
        runs(function()
        {
            S.clearLoader();
            var waitingModules = new S.Loader.WaitingModules(function () {
            });
            var l = new S.Loader.ComboLoader(S, waitingModules);
            
            KISSY.config(
            {
                packages:
                {
                    "pkg-a":
                    {
                        group: "my",
                        charset: "utf-8",
                        base: "../specs/packages-groups"
                    },
                    "pkg-b":
                    {
                        group: "my",
                        charset: "gbk",
                        base: "../specs/packages-groups"
                    }
                },
                modules:
                {
                    "pkg-a/a":
                    {
                        requires: ["pkg-b/b"]
                    }
                }
            });

            var r = S.keys(l.calculate(["pkg-a/a"]));
            S.Loader.Utils.createModulesInfo(S, r);
            var c = l.getComboUrls(r);
            var js = c.js['myutf-8'];
            expect(js.length).toBe(1);
            expect(js[0].fullpath.substring(js[0].fullpath.indexOf('??'))).toBe("??a.js?t=" + S.Config.tag + ".js");
            js = c.js['mygbk'];
            expect(js.length).toBe(1);
            expect(js[0].fullpath.substring(js[0].fullpath.indexOf('??'))).toBe("??b.js?t=" + S.Config.tag + ".js");
        });
    });
});