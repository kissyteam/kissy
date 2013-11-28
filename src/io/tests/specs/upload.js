/**
 * advanced io tc
 * @author yiminghe@gmail.com
 **/
KISSY.add(function (S, UA,  io, Node) {
    var $ = Node.all;

    // travis-ci will not pass ...
    if (S.UA.phantomjs && S.UA.os == 'linux') {
        return;
    }

    describe("io upload", function () {

        it("should abort for form file upload", function () {
            S.log("should abort for form file upload");

            var f = $('<form id="f' + S.guid(S.now()) +
                '">' +
                '<input name="testFile" type="file"/>' +
                //php need []
                '<select name="test[]" multiple>' +
                '<option value="t1" selected>v</option>' +
                '<option value="t2" selected>v2</option>' +
                '</select>' +
                '</form>').appendTo('body');

            var re = [], ok, d;

            var xhr = io({
                url: '../others/form/upload.jss',
                form: "#" + f.prop('id'),
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
            var f = $('<form id="f' + S.guid(S.now()) + '"' +
                ' action="http://www.g.cn">' +
                '<input name="testFile" type="file"/>' +
                //php need []
                '<select name="test[]" multiple>' +
                '<option value="t1" selected>v</option>' +
                '<option value="t2" selected>v2</option>' +
                '</select>' +
                '</form>').appendTo('body');

            var re = [], ok, d;

            var xhr = io({
                url: '../others/form/upload.jss',
                form: "#" + f.prop('id'),
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

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                xhr.abort();
                expect(re.join(",")).toBe(["success", "success"].join(","));
            });
        });

        it("fileupload support xml return data", function () {

            var form = $('<form>' +
                '<input name="test" value=\'1\'/>' +
                '<input name="test2" value=\'2\'/>' +
                '<input name="testFile" type="file"/>' +
                '</form>').appendTo('body');

            var ok = 0;

            io({
                type:'post',
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

        it("fileupload support html return data", function () {

            var form = $('<form>' +
                '<input name="test" value=\'1\'/>' +
                '<input name="test2" value=\'2\'/>' +
                '<input name="testFile" type="file"/>' +
                '</form>').appendTo('body');

            var ok = 0;

            io({
                type:'post',
                form: form[0],
                dataType: 'html',
                url: '../data/html.jss',
                success: function (data) {
                    expect(data.toLowerCase()).toBe('<b>html</b>');
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

        // same with html
        it("fileupload support text return data", function () {

            var form = $('<form>' +
                '<input name="test" value=\'1\'/>' +
                '<input name="test2" value=\'2\'/>' +
                '<input name="testFile" type="file"/>' +
                '</form>').appendTo('body');

            var ok = 0;

            io({
                type:'post',
                form: form[0],
                dataType: 'text',
                url: '../data/html.jss',
                success: function (data) {
                    expect(data.toLowerCase()).toBe('<b>html</b>');
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

            var form = $('<form>' +
                '<input name="test" value=\'1\'/>' +
                '<input name="test2" value=\'2\'/>' +
                '<input name="test3" type=\'file\'/>' +
                '</form>').appendTo('body');

            var ok = 0;

            // ie upload-domain.jss 必须设置 domain
            // 否则 localhost:8888 和 localhost:9999 默认可以通信...

            // 标准浏览器是 cors 关系
            var uploadRc = 'http://' + location.hostname + ':'+SERVER_CONFIG.ports[1]+'/' +
                'kissy/src/io/tests/others/form/upload-domain.jss';

            io({
                type: 'post',
                form: form[0],
                dataType: 'json',
                url: uploadRc,
                success: function (data) {
                    ok = 0;
                },
                error: function (data, statusText) {
                    // cors 无出错信息
                    expect(statusText || 'parser error').toBe('parser error');
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
},{
    requires:['ua','io','node']
});