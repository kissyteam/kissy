/**
 * hashchange spec
 * @author yiminghe@gmail.com
 */
KISSY.add(
    function (S, Dom, Event) {
    describe("hashchange event", function () {

        function getHash() {
            // 不能 location.hash
            // http://xx.com/#yy?z=1
            // ie6 => location.hash = #yy
            // 其他浏览器 => location.hash = #yy?z=1
            var url = location.href;
            return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
        }

        it("should works", function () {

            location.hash = "";

            var hash;
            Event.on(window, "hashchange", function () {
                hash = getHash();
            });
            // 等待 iframe 建立成功，存储当前 hash ""
            waits(100);

            runs(function () {
                location.hash = "a";
            });

            waits(100);

            runs(function () {
                expect(hash).toBe("#a");
            });

            waits(100);

            runs(function () {
                location.hash = "b";
            });

            waits(100);

            runs(function () {
                expect(hash).toBe("#b");
            });

            waits(100);

            runs(function () {
                location.hash = "a";
            });

            waits(100);

            runs(function () {
                expect(hash).toBe("#a");
            });

            waits(100);

            runs(function () {
                location.hash = "b";
            });

            waits(100);

            runs(function () {
                expect(hash).toBe("#b");
            });

            waits(100);

            if (S.UA.ieMode == 8) {
                // ie8 iframe 内的历史和外层一样了
                return;
            }

            runs(function () {
                history.back();
            });
            waits(100);

            runs(function () {
                expect(hash).toBe("#a");
            });

            runs(function () {
                history.back();
            });
            waits(100);

            runs(function () {
                expect(hash).toBe("#b");
            });

            runs(function () {
                history.back();
            });
            waits(100);

            runs(function () {
                expect(hash).toBe("#a");
            });

            runs(function () {
                history.back();
            });
            waits(100);

            runs(function () {
                // non-ie 返回 ""
                // expect(hash).toBe("");
                expect(hash.replace(/^#/, "")).toBe("");
            });
        });

        // https://github.com/kissyteam/kissy/issues/132
        it("no xss!", function () {
            location.hash = "x=<script>parent.HASH_XSS=1;</script>";
            waits(200);
            runs(function () {
                expect(window.HASH_XSS).toBeUndefined();
            });
        });

    });
},{
        requires:['dom','event/dom']
    });