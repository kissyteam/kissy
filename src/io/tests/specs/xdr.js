/**
 * test cases for cross domain io
 * @author yiminghe@gmail.com
 */

KISSY.add(function (S, UA, io, Node) {

    return {
        run: function () {
            var $ = Node.all;

            describe("Xdr IO", function () {

                var host = window.location.hostname;

                it('set domain',function(){
                    // ie6 不能设置和 hostname 一致。。。
                    document.domain = host.split('.').slice(-3).join('.');
                });

                it("should works for any domain", function () {
                    var v1;

                    var iframe = $('<iframe></iframe>');
                    iframe.on('load', function () {

                        io({
                            headers: {
                                // cross domain 设置 header ie 无效
                                // 原生 chrome.firefox 可行
                                yiminghe: 'oo'
                            },
                            cache: false,
                            dataType: 'json',
                            url: 'http://' + location.hostname + ':9999/kissy/src/' +
                                'io/tests/others/xdr/xdr.jss',
                            xhrFields: {
                                // Cannot use wildcard in Access-Control-Allow-Origin
                                // when credentials flag is true.
                                // Access-Control-Allow-Origin:http://localhost
                                // 必须设置完全 hostname 匹配

                                // firefox , chrome 携带 cookie
                                withCredentials: true
                            },
                            xdr: {
                                // 强制用 flash，ie 可携带cookie
                                // use: "flash",
                                // force to use native xhr no sub domain proxy
                                subDomain: {
                                    proxy: false
                                }
                            },
                            data: {
                                action: "x"
                            },
                            success: function (d, s, r) {
                                // body 都可读
                                expect(d.action).toBe('x');

                                // ie6-7 flash 不可读
                                // ie8-9 XDomainRequest 不可读
                                // header ie10 ,chrome, firefox 可读
                                if (UA.ie && UA.ie < 10) {
                                    expect(d.yiminghe).toBe('undefined');
                                } else {
                                    expect(d.yiminghe).toBe('oo');
                                }

                                // ie8-9 XDomainRequest 不可读
                                // header ie10 ,chrome, firefox 可读
                                // ie6-7 flash 可读
                                if (UA.ie && UA.ie >= 8 && UA.ie <= 9) {
                                    expect(d.cors).toBe('undefined');
                                } else {
                                    expect(d.cors).toBe('ok')
                                }

                                // 原生 chrome.firefox 响应头不能读
                                // ie6-7 flash 不可读
                                // ie8-9 XDomainRequest 不可读
                                // ie10 可以读
                                if (UA.ie >= 10) {
                                    expect(r.getResponseHeader("X-Powered-By")).toBe('Express');
                                } else {
                                    expect(r.getResponseHeader("X-Powered-By")).toBeNull();
                                }

                                v1 = 1;
                            }
                        });

                    });

                    iframe[0].src = 'http://' + location.hostname + ':9999/kissy/src/' +
                        'io/tests/others/xdr/set-cookie.html';
                    iframe.appendTo('body');

                    waitsFor(function () {
                        return v1 === 1;
                    }, 5000, "xdr should return!");

                    waits(100);
                    runs(function () {
                        iframe.remove();
                    });
                });


                it("should works for subdomain", function () {
                    var ok = 0,
                        ret = [];

                    io({
                        url: 'http://' + host + ':9999/kissy/src/io/tests/data/io.jss',
                        xdr: {
                            subDomain: {
                                proxy: "/kissy/src/io/tests/others/subdomain/proxy.html"
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
                    var form = $('<form>' +
                        '<input name="test" value=\'1\'/>' +
                        '<input name="test2" value=\'2\'/>' +
                        '<input type="file" name="testFile"/>' +
                        '</form>').appendTo("body");

                    var ok = 0;

                    io({
                        type: 'post',
                        form: form[0],
                        dataType: 'json',
                        url: 'http://' + host + ':9999/kissy/src/io/' +
                            'tests/others/subdomain/upload.jss',
                        success: function (data) {
                            expect(data.test).toBe('1');
                            expect(data.test2).toBe('2');
                            ok = 1;
                        },
                        error: function (_, e) {
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
        }
    };

}, {
    requires: ['ua', 'io', 'node']
});