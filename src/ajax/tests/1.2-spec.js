/**
 * 1.2 new testcases
 * @author  yiminghe@gmail.com
 **/
KISSY.use("ua,json,ajax,node", function (S, UA, JSON, io, Node) {
    var $ = Node.all;
    describe("ajax@1.2", function () {

        it("should jsonp with array arguments", function () {
            var re = false, data;
            io.jsonp("jsonp-array.php", function (d, status, xhr) {
                re = true;
                data = d;
            });

            waitsFor(function () {
                return re;
            });

            runs(function () {
                expect(data.join(",")).toBe([1, 2].join(","));
            });
        });

        it("should abort for xhr", function () {
            var re = [];
            var xhr = io({
                url:'ajax.php',
                cache:false,
                success:function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                error:function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                complete:function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                }
            });

            xhr.abort();

            waits(100);

            runs(function () {
                expect(re.toString()).toBe(["abort", "abort"].toString());
            });
        });


        it("nothing happens if abort xhr after complete", function () {
            var re = [], ok = false;

            var xhr = io({
                url:'ajax.php',
                cache:false,
                success:function (data, status) {
                    ok = true;
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                error:function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                complete:function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                }
            });

            waitsFor(function () {
                return ok;
            }, 10000);


            runs(function () {
                // 成功后 abort 无影响
                xhr.abort();
                expect(re.toString()).toBe(["success", "success"].toString());
            });

        });


        it("should abort for jsonp", function () {

            var re = [];
            var xhr = io({
                forceScript:!(UA.ie == 6),
                dataType:'jsonp',
                url:'jsonp.php',
                cache:false,
                success:function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                error:function (data, status) {
                    re.push(status);
                    var args = S.makeArray(arguments);
                },
                complete:function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                }
            });

            xhr.abort();

            waits(100);

            runs(function () {
                expect(re.toString()).toBe(["abort", "abort"].toString());
            });
        });


        it("nothing happens if abort jsonp after complete", function () {
            var re = [], ok;

            var xhr = io({
                forceScript:!(UA.ie == 6),
                url:'ajax.php',
                cache:false,
                success:function (data, status) {
                    ok = true;
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                error:function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                complete:function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                }
            });


            waitsFor(function () {
                return ok;
            }, 10000);

            runs(function () {
                // 成功后 abort 无影响
                xhr.abort();
                expect(re.toString()).toBe(["success", "success"].toString());
            });

        });

        it("timeout should work for xhr", function () {

            var re = [], ok;
            var xhr = io({
                url:'ajax.php',
                // ie 默认会缓存，可能直接触发 success
                // fiddler 看不到请求，自带网络捕获为 304
                cache:false,
                dataType:'json',
                timeout:0.1,
                success:function (d, status, r) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                error:function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                complete:function (data, status) {
                    ok = true;
                    var args = S.makeArray(arguments);
                    re.push(status);
                }
            });

            waitsFor(function () {
                return ok;
            }, 10000);

            runs(function () {
                expect(re.toString()).toBe(["timeout", "timeout"].toString());
            });
        });


        it("should works for form file upload", function () {

            var f = $('<form id="f" method="post" enctype="multipart/form-data">' +
                //php need []
                '<input name="test4[]" value="t6"/>' +
                '<input name="test4[]" value="t7"/>' +
                '<input name="test5" value="t8"/>' +
                '<select name="test[]" multiple>' +
                '<option value="t1" selected>v</option>' +
                '<option value="t2" selected>v2</option>' +
                '</select>' +
                '</form>').appendTo("body");


            var re = [], ok, d;
            var xhr = io({
                url:'form/upload.php',
                form:"#" + f.prop("id"),
                type:'post',
                dataType:'json',
                data:{
                    "test2":["t2", "t3"],
                    "test3":"t4"
                },
                success:function (data) {
                    ok = true;
                    d = data;
                },
                complete:function () {
                    ok = true
                }
            });

            expect(xhr.iframe.nodeName.toLowerCase()).toBe("iframe");

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                expect(d.test + "").toBe(["t1", "t2"] + "");
                expect(d.test4 + "").toBe(["t6", "t7"] + "");
                expect(d.test2 + "").toBe(["t2", "t3"] + "");
                expect(d.test3 + "").toBe("t4");
                expect(d.test5 + "").toBe("t8");
            });
        });


        it("should works for common form", function () {

            var f = $('<form id="f2">' +
                '<input name="test4[]" value="t6"/>' +
                '<input name="test4[]" value="t7"/>' +
                '<input name="test5" value="t8"/>' +
                '<select name="test[]" multiple>' +
                '<option value="t1" selected>v</option>' +
                '<option value="t2" selected>v2</option>' +
                '</select>' +
                '</form>').appendTo("body");

            var re = [], ok, d;
            var xhr = io({
                url:'form/upload.php',
                form:"#" + f.prop("id"),
                type:'post',
                dataType:'json',
                data:{
                    "test2":["t2", "t3"],
                    "test3":"t4"
                },
                success:function (data) {
                    ok = true;
                    d = data;
                },
                complete:function () {
                    ok = true
                }
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                expect(d.test + "").toBe(["t1", "t2"] + "");
                expect(d.test4 + "").toBe(["t6", "t7"] + "");
                expect(d.test2 + "").toBe(["t2", "t3"] + "");
                expect(d.test3 + "").toBe("t4");
                expect(d.test5 + "").toBe("t8");
            });
        });

        it("should abort for form file upload", function () {

            var f = $('<form id="f" method="post" enctype="multipart/form-data">' +
                //php need []
                '<select name="test[]" multiple>' +
                '<option value="t1" selected>v</option>' +
                '<option value="t2" selected>v2</option>' +
                '</select>' +
                '</form>').appendTo("body");

            var re = [], ok, d;

            var xhr = io({
                url:'form/upload.php',
                form:"#" + f.prop("id"),
                type:'post',
                dataType:'json',
                data:{
                    "test2":["t2", "t3"]
                },
                error:function (d, s) {
                    re.push(s);
                },
                success:function (data, s) {
                    d = data;
                    re.push(s);
                },
                complete:function (d, s) {
                    ok = true;
                    re.push(s);
                }
            });

            expect(xhr.iframe.nodeName.toLowerCase()).toBe("iframe");

            xhr.abort();

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                expect(re.join(",")).toBe(["abort", "abort"].join(","));
            });
        });


        it("nothing happens if abort after form file upload", function () {

            var f = $('<form id="f" method="post" enctype="multipart/form-data">' +
                //php need []
                '<select name="test[]" multiple>' +
                '<option value="t1" selected>v</option>' +
                '<option value="t2" selected>v2</option>' +
                '</select>' +
                '</form>').appendTo("body");

            var re = [], ok, d;

            var xhr = io({
                url:'form/upload.php',
                form:"#" + f.prop("id"),
                type:'post',
                dataType:'json',
                data:{
                    "test2":["t2", "t3"]
                },
                error:function (d, s) {
                    re.push(s);
                },
                success:function (data, s) {
                    d = data;
                    re.push(s);
                },
                complete:function (d, s) {
                    ok = true;
                    re.push(s);
                }
            });

            expect(xhr.iframe.nodeName.toLowerCase()).toBe("iframe");

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                xhr.abort();
                expect(re.join(",")).toBe(["success", "success"].join(","));
            });
        });


    });
});
