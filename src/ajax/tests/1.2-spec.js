/**
 * 1.2 new testcases
 * @author  yiminghe@gmail.com
 **/
KISSY.use("json,ajax,node", function(S, JSON, io, Node) {
    var $ = Node.all;
    describe("ajax@1.2", function() {

        it("should abort for xhr", function() {
            var re = [];
            var xhr = io({
                    url:'ajax.php',
                    cache:false,
                    success:function(data, status) {
                        var args = S.makeArray(arguments);
                        re.push(status);
                    },
                    error:function(data, status) {
                        var args = S.makeArray(arguments);
                        re.push(status);
                    },
                    complete:function(data, status) {
                        var args = S.makeArray(arguments);
                        re.push(status);
                    }
                });

            xhr.abort();

            expect(re.toString()).toBe(["abort","abort"].toString());

        });

        it("timeout should work for xhr", function() {

            var re = [],ok;
            var xhr = io({
                    url:'ajax.php',
                    // ie 默认会缓存，可能直接触发 success
                    // fiddler 看不到请求，自带网络捕获为 304
                    cache:false,
                    dataType:'json',
                    timeout:100,
                    success:function(d, status, r) {
                        var args = S.makeArray(arguments);
                        re.push(status);
                    },
                    error:function(data, status) {
                        var args = S.makeArray(arguments);
                        re.push(status);
                    },
                    complete:function(data, status) {
                        ok = true;
                        var args = S.makeArray(arguments);
                        re.push(status);
                    }
                });

            waitsFor(function() {
                return ok;
            }, 10000);

            runs(function() {
                expect(re.toString()).toBe(["timeout","timeout"].toString());
            });
        });


        it("should works for form file upload", function() {

            var f = $('<form id="f" method="post" enctype="multipart/form-data">' +
                //php need []
                '<select name="test[]" multiple>' +
                '<option value="t1" selected>v</option>' +
                '<option value="t2" selected>v2</option>' +
                '</select>' +
                '</form>').appendTo("body");


            var re = [],ok,d;
            var xhr = io({
                    url:'upload.php',
                    form:"#" + f.prop("id"),
                    type:'post',
                    dataType:'json',
                    data:{
                        "test2":["t2","t3"]
                    },
                    success:function(data) {
                        ok = true;
                        d = data;
                    },
                    complete:function() {
                        ok = true
                    }
                });

            expect(xhr.iframe.nodeName.toLowerCase()).toBe("iframe");

            waitsFor(function() {
                return ok;
            });

            runs(function() {
                expect(d.test + "").toBe(["t1","t2"] + "");
                expect(d.test2 + "").toBe(["t2","t3"] + "");
            });
        });


        it("should works for common form", function() {

            var f = $('<form id="f2">' +
                '<select name="test[]" multiple>' +
                '<option value="t1" selected>v</option>' +
                '<option value="t2" selected>v2</option>' +
                '</select>' +
                '</form>').appendTo("body");

            var re = [],ok,d;
            var xhr = io({
                    url:'upload.php',
                    form:"#" + f.prop("id"),
                    type:'post',
                    dataType:'json',
                    data:{
                        "test2":["t2","t3"]
                    },
                    success:function(data) {
                        ok = true;
                        d = data;
                    },
                    complete:function() {
                        ok = true
                    }
                });

            waitsFor(function() {
                return ok;
            });

            runs(function() {
                expect(d.test + "").toBe(["t1","t2"] + "");
                expect(d.test2 + "").toBe(["t2","t3"] + "");
            });
        });
    });
});
