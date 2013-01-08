/**
 * advanced ajax tc
 * @author yiminghe@gmail.com
 **/
KISSY.use("ua,json,ajax,node", function (S, UA, JSON, io, Node) {
    var $ = Node.all;

    // travis-ci will not pass ...
    if (S.UA.phantomjs && S.UA.os == 'linux') {
        return;
    }

    describe("io upload", function () {

        it("should abort for form file upload", function () {
            S.log("should abort for form file upload");

            var f = $('<form id="f' + S.guid(S.now()) +
                '" method="post" enctype="multipart/form-data">' +
                //php need []
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
                    "test2": ["t2", "t3"]
                },
                error: function (d, s) {
                    re.push(s);
                },
                success: function (data, s) {
                    d = data;
                    re.push(s);
                },
                complete: function (d, s) {
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

            waits(1000);
        });

        it("nothing happens if abort after form file upload", function () {
            S.log("nothing happens if abort after form file upload");

            // error !
            var f = $('<form id="f' + S.guid(S.now()) + '" method="post" ' +
                'enctype="multipart/form-data" ' +
                'action="http://www.g.cn">' +
                //php need []
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
                    "test2": ["t2", "t3"]
                },
                error: function (d, s) {
                    re.push(s);
                },
                success: function (data, s) {
                    d = data;
                    re.push(s);
                },
                complete: function (d, s) {
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

        it("fileupload support xml return data", function () {

            S.log("fileupload support xml return data");

            var form = $('<form enctype="multipart/form-data">' +
                '<input name="test" value=\'1\'/>' +
                '<input name="test2" value=\'2\'/>' +
                '</form>').appendTo("body");

            var ok = 0;

            io({
                form: form[0],
                dataType: 'xml',
                url: '../data/xml.jss',
                success: function (data) {
                    expect(data.nodeType).toBe(9);
                    expect(data.documentElement.nodeType).toBe(1);
                    ok = 1;
                }
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                form.remove();
            });
        });

        it('should error when upload to a cross domain page', function () {


            S.log("should error when upload to a cross domain page");

            var form = $('<form enctype="multipart/form-data">' +
                '<input name="test" value=\'1\'/>' +
                '<input name="test2" value=\'2\'/>' +
                '</form>').appendTo("body");

            var ok = 0;

            // ie upload-domain.jss 必须设置 domain
            // 否则 localhost:8888 和 localhost:9999 默认可以通信...
            var uploadRc = 'http://'+location.hostname+':9999/' +
                'kissy/src/ajax/tests/others/form/upload-domain.jss';

            io({
                form: form[0],
                dataType: 'json',
                url: uploadRc,
                success: function (data) {
                    ok = 0;
                },
                error: function (data, statusText) {
                    expect(statusText).toBe('parser error');
                    ok = 1;
                }
            });


            waitsFor(function () {
                return ok;
            });

            runs(function () {
                form.remove();
            });


        });

    });
});