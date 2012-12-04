/**
 * test cases for cross domain ajax
 * @author yiminghe@gmail.com
 */



KISSY.use("ua,json,ajax,node", function (S, UA, JSON, io, Node) {
    var $ = Node.all;

    describe("Xdr IO", function () {

        var host = window.location.hostname;
        // ie6 不能设置和 hostname 一致。。。
        document.domain = host.split('.').slice(-3).join('.');

        it("should works for any domain", function () {
            var v1, v2;
            io({
                headers: {
                    // cross domain 设置 header ie 无效
                    // flash 也不行

                    // 原生 chrome.firefox 也不行，响应头也不能读
                    // yiminghe:1
                },
                // force to not use sub domain
                xdr: {
                    subDomain: {
                        proxy: false
                    }
                },
                dataType: 'json',
                url: 'http://' + host + ':9999/kissy/src/' +
                    'ajax/tests/others/xdr/xdr.jss',
                xhrFields: {
                    // Cannot use wildcard in Access-Control-Allow-Origin
                    // when credentials flag is true.
                    // withCredentials:true
                },
                data: {
                    action: "x"
                },
                success: function (d, s, r) {
                    v1 = d.x;
                }
            });


            waitsFor(function () {
                return v1 === 1;
            }, 5000, "xdr should return!");
        });


        it("should works for subdomain", function () {
            var ok = 0,
                ret = [];

            io({
                url: 'http://' + host + ':9999/kissy/src/ajax/tests/data/ajax.jss',
                xdr: {
                    subDomain: {
                        proxy: "/kissy/src/ajax/tests/others/subdomain/proxy.html"
                    }
                },
                success: function () {
                    ret.push('s');
                    //S.log("success");
                },
                error: function (d, s) {
                    ret.push('e');
                    //S.log(s || "error");
                },
                complete: function () {
                    ret.push('c');
                    ok = 1;
                    //S.log("complete");
                }
            });

            waitsFor(function () {
                return ok;
            }, 10000);

            runs(function () {
                expect(ret).toEqual(['s', 'c']);
            });

        });


        it("should support cross subdomain fileupload", function () {
            var form = $('<form enctype="multipart/form-data">' +
                '<input name="test" value=\'1\'/>' +
                '<input name="test2" value=\'2\'/>' +
                '</form>').appendTo("body");

            var ok = 0;

            io({
                form: form[0],
                dataType: 'json',
                url: 'http://' + host + ':9999/kissy/src/ajax/' +
                    'tests/others/subdomain/upload.jss',
                success: function (data) {
                    expect(data.test).toBe('1');
                    expect(data.test2).toBe('2');
                    ok = 1;
                },
                error:function(_,e){
                    alert(e.message);
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