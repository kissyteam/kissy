/**
 * advanced ajax tc
 * @author yiminghe@gmail.com
 **/
KISSY.use("ua,json,ajax,node", function (S, UA, JSON, io, Node) {
    var $ = Node.all;

    var pageUri = new S.Uri(location.href);

    describe("Advanced IO", function () {

        console.log("Advanced IO");

        it('support custom contentType', function () {
            var done = 0, ok = 0;
            io({
                url: '../data/receive-json.jss',
                dataType: 'json',
                type: 'post',
                contentType: 'application/json',
                data: S.JSON.stringify({
                    x: 1
                }),
                success: function (t) {
                    expect(t.x).toBe(1);
                    ok = 1;
                },
                complete: function () {
                    done = 1;
                }
            });

            waitsFor(function () {
                return done;
            });

            runs(function () {
                expect(ok).toBe(1);
            });

        });

        it("should support last-modified from server", function () {

            console.log("should support last-modified from server");

            var ok = 0;

            io({
                url: '../data/ifModified.jss',
                dataType: "text",
                success: function (data, status, xhr) {
                    expect(data).toBe("haha");
                    expect(status).toBe("success");
                    expect(xhr.status).toBe(200);
                    io({
                        url: '../data/ifModified.jss',
                        dataType: "text",
                        success: function (data, status, xhr) {
                            expect(data).toBe("haha");
                            expect(status).toBe("success");
                            expect(xhr.status).toBe(200);


                            expect(S.isEmptyObject(
                                io.__lastModifiedCached)).toBe(true);


                            ok = 1;
                        }
                    });
                }
            });

            waitsFor(function () {
                return ok;
            });

        });


        it("should support ifModified config", function () {

            console.log("should support ifModified config");

            var ok = 0;

            io({
                url: '../data/ifModified.jss',
                dataType: "text",
                cache: false,
                ifModified: true,
                success: function (data, status, xhr) {
                    expect(data).toBe("haha");
                    expect(status).toBe("success");
                    expect(xhr.status).toBe(200);
                    io({
                        url: '../data/ifModified.jss',
                        dataType: "text",
                        cache: false,
                        ifModified: true,
                        success: function (data, status, xhr) {
                            expect(data).toBe(null);
                            expect(xhr.status).toBe(304);
                            expect(status).toBe("not modified");

                            expect(io.__lastModifiedCached[
                                pageUri.resolve('../data/ifModified.jss').toString()
                                ])
                                .toBe('Thu, 18 Jul 2002 15:48:32 GMT');

                            ok = 1;
                        }
                    });
                }
            });

            waitsFor(function () {
                return ok;
            });

        });


        it("should support ifModified config for form", function () {

            console.log("should support ifModified config for form");

            var ok = 0;

            var form = $("<form><input name='t' value='t'/></form>").appendTo("body");

            io({
                url: '../data/ifModified.jss',
                dataType: "text",
                cache: false,
                ifModified: true,
                form: form,
                success: function (data, status, xhr) {
                    expect(data).toBe("haha");
                    expect(status).toBe("success");
                    expect(xhr.status).toBe(200);
                    io({
                        url: '../data/ifModified.jss',
                        dataType: "text",
                        cache: false,
                        form: form,
                        ifModified: true,
                        success: function (data, status, xhr) {
                            expect(data).toBe(null);
                            expect(xhr.status).toBe(304);
                            expect(status).toBe("not modified");

                            var uri = pageUri.resolve('../data/ifModified.jss');
                            uri.query.add("t", "t");

                            expect(io.__lastModifiedCached[
                                uri.toString()
                                ]).toBe('Thu, 18 Jul 2002 15:48:32 GMT');

                            ok = 1;
                        }
                    });
                }
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                form.remove();
            });

        });

        it("should jsonp with array arguments", function () {

            console.log("should jsonp with array arguments");

            var re = false, data;

            io.jsonp("../data/jsonp-array.jss", function (d, status, xhr) {
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

            console.log("should abort for xhr");

            var re = [];
            var xhr = io({
                url: '../data/ajax.jss',
                cache: false,
                success: function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                error: function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                complete: function (data, status) {
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

            console.log("nothing happens if abort xhr after complete");

            var re = [], ok = false;

            var xhr = io({
                url: '../data/ajax.jss',
                cache: false,
                success: function (data, status) {
                    ok = true;
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                error: function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                complete: function (data, status) {
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

            console.log("should abort for jsonp");

            var re = [];

            var xhr = io({
                forceScript: !(UA.ie == 6),
                dataType: 'jsonp',
                url: '../data/jsonp.jss',
                cache: false,
                success: function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                error: function (data, status) {
                    re.push(status);
                    var args = S.makeArray(arguments);
                },
                complete: function (data, status) {
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

            console.log("nothing happens if abort jsonp after complete");

            var re = [], ok;

            var xhr = io({
                forceScript: !(UA.ie == 6),
                url: '../data/ajax.jss',
                cache: false,
                success: function (data, status) {
                    ok = true;
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                error: function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                complete: function (data, status) {
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

            console.log("timeout should work for xhr");

            var re = [], ok;
            var xhr = io({
                url: '../data/ajax.jss',
                // ie 默认会缓存，可能直接触发 success
                // fiddler 看不到请求，自带网络捕获为 304
                cache: false,
                dataType: 'json',
                timeout: 0.01,
                success: function (d, status, r) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                error: function (data, status) {
                    var args = S.makeArray(arguments);
                    re.push(status);
                },
                complete: function (data, status) {
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

            console.log("should works for form file upload");

            var f = $('<form id="f' + S.guid(S.now()) + '" method="post" enctype="multipart/form-data">' +
                //php need []
                '<input name="test4[]" value="t6"/>' +
                '<input name="test4[]" value="t7"/>' +
                '<input name="test5" value="t8"/>' +
                '<select name="test[]" multiple>' +
                '<option value="t1" selected>v</option>' +
                '<option value="t2" selected>v2</option>' +
                '</select>' +
                '</form>').appendTo("body");


            var ok, d;

            var xhr = io({
                url: '../others/form/upload.jss',
                form: "#" + f.prop("id"),
                type: 'post',
                dataType: 'json',
                data: {
                    "test2": ["t2", "t3"],
                    "test3": "t4"
                },
                success: function (data) {
                    ok = true;
                    d = data;
                },
                complete: function () {
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

            console.log("should works for common form");

            var f = $('<form id="f' + S.guid(S.now()) + '">' +
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
                url: '../others/form/upload.jss',
                form: "#" + f.prop("id"),
                type: 'post',
                dataType: 'json',
                data: {
                    "test2": ["t2", "t3"],
                    "test3": "t4"
                },
                success: function (data) {
                    ok = true;
                    d = data;
                },
                complete: function () {
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
    });
});
