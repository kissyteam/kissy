/**
 * basic test cases for kissy io
 */

var io = require('io');
var util = require('util');
/*jshint quotmark:false*/
describe('io', function () {
    describe('404/301', function () {
        it('404 get error', function () {
            var ret404,
                o404 = 0;

            io({
                url: '/kissy/src/io/tests/data/404',
                cache: false,
                success: function () {
                    //var args = util.makeArray(arguments);
                    ret404 = 1;
                },
                error: function () {
                    //var args = util.makeArray(arguments);
                    ret404 = 0;
                },
                complete: function () {
                    o404 = 1;
                }
            });

            waitsFor(function () {
                return o404 === 1;
            });

            runs(function () {
                expect(ret404).toBe(0);
            });
        });

        it('301 get success', function () {
            var ret301, o301;

            io({
                url: '/kissy/src/io/tests/data/301.jss',
                cache: false,
                success: function (p) {
                    //var args = util.makeArray(arguments);
                    expect(p.name).toBe('kissy');
                    ret301 = 1;
                },
                error: function (_, s, io) {
                    expect(io.status).toBe(0);
                    //var args = util.makeArray(arguments);
                    ret301 = 0;
                },
                complete: function () {
                    o301 = 1;
                }
            });

            waitsFor(function () {
                // 301 浏览器自动跳转
                return o301 === 1;
            });

            runs(function () {
                expect(ret301).toBe(1);
            });
        });

        it('404 post error', function () {
            var ret404, o404 = 0;

            io({
                url: '/kissy/src/io/tests/data/404',
                type: 'post',
                cache: false,
                success: function () {
                    //var args = util.makeArray(arguments);
                    ret404 = 1;
                },
                error: function () {
                    //var args = util.makeArray(arguments);
                    ret404 = 0;
                },
                complete: function () {
                    o404 = 1;
                }
            });

            waitsFor(function () {
                return o404 === 1;
            });

            runs(function () {
                expect(ret404).toBe(0);
            });
        });

        it('301 post success', function () {
            var ret301, o301;

            io({
                url: '/kissy/src/io/tests/data/301.jss',
                cache: false,
                type: 'post',
                success: function (p) {
                    //var args = util.makeArray(arguments);
                    expect(p.name).toBe('kissy');
                    ret301 = 1;
                },
                error: function (_, s, io) {
                    expect(io.status).toBe(0);
                    //var args = util.makeArray(arguments);
                    ret301 = 0;
                },
                complete: function () {
                    o301 = 1;
                }
            });

            waitsFor(function () {
                // 301 浏览器自动跳转
                return o301 === 1;
            });

            runs(function () {
                expect(ret301).toBe(1);
            });
        });

        it('404 jsonp does not call success', function () {
            var ret404;
            io({
                url: '/kissy/src/io/tests/data/404',
                dataType: 'jsonp',
                success: function () {
                    //var args = util.makeArray(arguments);
                    ret404 = 1;
                },
                error: function () {
                    var args = util.makeArray(arguments);
                    expect(args[1]).toBe("Not Found");
                    ret404 = 0;
                }
            });

            waitsFor(function () {
                return ret404 === 0;
            });
        });

        it('404 cross domain jsonp does not call success', function () {
            var ret404;
            io({
                url: '/kissy/src/io/tests/data/404',
                dataType: 'jsonp',
                crossDomain: true,
                success: function () {
                    //var args = util.makeArray(arguments);
                    ret404 = 1;
                },
                error: function () {
                    var args = util.makeArray(arguments);
                    expect(util.inArray(args[1], [
                        "script error",
                        "parser error"
                    ]))
                        .toBe(true);
                    ret404 = 0;
                }
            });

            waitsFor(function () {
                return ret404 === 0;
            });
        });
    });

    describe('jsonp', function () {
        it('custom callback', function () {
            var ok = false;
            runs(function () {
                window.customCallback = function (data) {
                    ok = true;
                    expect(typeof data).toBe('object');
                    expect(data.callback).toBe('customCallback');
                };
                io.getScript('/kissy/src/io/tests/data/interface.jss?callback=customCallback');
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                try {
                    delete window.customCallback;
                } catch (e) {
                    window.customCallback = undefined;
                }
            });
        });

        it('does not have content-type', function () {
            var ok = false;
            runs(function () {
                io({
                    url: '/kissy/src/io/tests/data/interface.jss?t=get',
                    success: function (data) {
                        expect(data.contentType).toBe(undefined);
                        ok = 1;
                    },
                    dataType: 'jsonp'
                });
            });

            waitsFor(function () {
                return ok;
            });

        });

        it('custom callbackName', function () {
            var ok = false;
            runs(function () {
                io({
                    url: '/kissy/src/io/tests/data/interface.jss?t=get',
                    success: function (data) {
                        ok = true;
                        expect(typeof data).toBe('object');
                    },
                    dataType: 'jsonp',
                    jsonp: 'customCallback'
                });

            });

            waitsFor(function () {
                return ok;
            });

        });

        it('jsonp without params', function () {

            var ok = 0;

            runs(function () {
                io.jsonp('/kissy/src/io/tests/data/interface.jss', function (data) {
                    ok = true;
                    expect(typeof data).toBe('object');

                });
            });

            waitsFor(function () {
                return ok;
            });

        });

        it('jsonp with params', function () {
            var ok = 0;
            io.jsonp('/kissy/src/io/tests/data/interface.jss?sleep=0', {
                myParam: 'taobao'
            }, function (data) {
                expect(typeof data).toBe('object');
                expect(data).not.toBe(undefined);
                expect(data.myParam).toBe('taobao');
                ok = 1;
            });
            waitsFor(function () {
                return ok;
            });
        });

        // https://github.com/kissyteam/kissy/issues/187
        it("can ignore protocol", function () {
            var ok = 0;
            var url = location.hostname;
            if (url !== 'dev.kissyui.com') {
                url += ':' + window.SERVER_CONFIG.ports[1];
            }
            io.jsonp('//' + url + '/kissy/src/io/tests/data/interface.jss', {
                myParam: 'taobao'
            }, function (data) {
                expect(typeof data).toBe('object');
                expect(data).not.toBe(undefined);
                expect(data.myParam).toBe('taobao');
                ok = 1;
            });
            waitsFor(function () {
                return ok;
            }, 1000000);
        });

    });

    describe('sync test case', function () {
        it('get sync', function () {
            var d = 0;
            io({
                type: 'get',
                // 根据 content-type 自动 parse
                url: '/kissy/src/io/tests/data/interface.jss?sleep=1&contentType=text/json',
                async: false,
                success: function (o) {
                    d = o;
                }
            });
            expect(d.name).toBe('test');
        });

        it('post sync', function () {
            runs(function () {
                var d = 0;
                io({
                    type: 'post',
                    url: '/kissy/src/io/tests/data/interface.jss?sleep=1&contentType=text/json',
                    async: false,
                    success: function (o) {
                        d = o;
                    }
                });
                expect(d.name).toBe('test');
            });
        });
    });

    describe('post', function () {
        it('post get text/json data', function () {

            var ok = false;
            io.post('/kissy/src/io/tests/data/interface.jss?t=post&contentType=text/json', function (data) {
                ok = true;
                expect(typeof data).toBe('object');
                expect(data).not.toBe(undefined);
                expect(data.name).toBe('test');
            });

            waitsFor(function () {
                return ok;
            });

        });

        it('post get string data', function () {
            var ok = false;
            io.post('/kissy/src/io/tests/data/interface.jss?t=post', function (data, status, xhr) {
                ok = true;
                expect(typeof data).toBe('string');
                var o = util.parseJson(data);
                expect(o).not.toBe(undefined);
                expect(o.name).toBe('test');
                expect(xhr.responseText).toBe(data);
            });

            waitsFor(function () {
                return ok;
            });
        });

        it('post get json data', function () {

            var ok = false;
            io.post('/kissy/src/io/tests/data/interface.jss?t=post', {
                type: 'post',
                name: 'test',
                company: 'www.taobao.com',
                exp: '>,?/%."`~'
            }, function (data, textStatus, xhr) {
                ok = true;
                var o = util.parseJson(data);
                expect(o).not.toBe(undefined);
                expect(o.name).toBe('test');
                expect(o.company).toBe('www.taobao.com');

                expect(textStatus).toBe('success');
                expect(xhr.responseText).toBe(data);
            });
            waitsFor(function () {
                return ok;
            });

        });

        it('post get string data', function () {
            var ok = false;
            io.post('/kissy/src/io/tests/data/interface.jss?t=post',
                    'name=test&company=www.taobao.com&exp=' +
                    encodeURIComponent('>,?/\\%."`~'),
                function (data, textStatus, xhr) {
                    ok = true;

                    var o = util.parseJson(data);
                    expect(o).not.toBe(undefined);
                    expect(o.name).toBe('test');
                    expect(o.company).toBe('www.taobao.com');

                    expect(textStatus).toBe('success');
                    expect(xhr.responseText).toBe(data);
                });
            waitsFor(function () {
                return ok;
            });

        });

        it('dataType json', function () {
            var ok, o;

            runs(function () {
                io.post('/kissy/src/io/tests/data/interface.jss?contentType=text/json',
                    function (data) {
                        ok = true;
                        o = data;
                    }, 'json');
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                expect(typeof o).toBe('object');
                expect(o.name).toBe('test');
            });

        });

        it('data override url', function () {
            var ok = false;
            io.post('/kissy/src/io/tests/data/interface.jss?foo=sk1', {
                foo: 'sk2'
            }, function (data) {
                ok = true;
                expect(typeof data).toBe('object');
                expect(data.foo).toBe('sk2');
            }, 'json');

            waitsFor(function () {
                return ok;
            }, 'success', 5000);

        });

        it('dataType jsonp', function () {
            var ok, o;

            runs(function () {
                ok = false;

                io.post('/kissy/src/io/tests/data/interface.jss', function (data) {
                    ok = true;
                    o = data;
                }, 'jsonp');
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                expect(typeof o).toBe('object');
                expect(o.name).toBe('test');
            });


        });

        it('dataType script', function () {

            var ok = false;

            runs(function () {
                // 这里和get的处理一致
                io.post('/kissy/src/io/tests/data/interface.jss?type=post&dataType=script',
                    function (data) {
                        ok = true;
                        expect(data).toBe("var globalScriptTest = 500;");
                    }, 'script');
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                expect(window.globalScriptTest).toBe(500);
                try {
                    delete window.globalScriptTest;
                } catch (e) {
                    window.globalScriptTest = undefined;
                }
            });

        });

        it('data type script', function () {

            var ok = false;

            runs(function () {
                // 这里和get的处理一致
                io.post('/kissy/src/io/tests/data/interface.jss?type=post' +
                        '&dataType=script' +
                        '&contentType=text/javascript',
                    function (data) {
                        ok = true;
                        expect(data).toBe("var globalScriptTest = 500;");
                    });
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                expect(window.globalScriptTest).toBe(500);
                try {
                    delete window.globalScriptTest;
                } catch (e) {
                    window.globalScriptTest = undefined;
                }
            });

        });

        it('datatype xml', function () {
            var ok = false, o;

            runs(function () {

                //这里'xml'的参数可以省略
                io.post('/kissy/src/io/tests/data/xml.jss', function (data) {
                    ok = true;
                    o = data;
                }, 'xml');
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                expect(o.childNodes.length > 0).toBe(true);
            });
        });

        it('dataType xml but return data format json', function () {
            var ok = false, o;

            runs(function () {

                // 可以么？ content-type 为 xml
                // 但实际内容也为 json  需要自动转换成 json
                io.post('/kissy/src/io/tests/data/xml-json.jss', function (data) {
                    ok = true;
                    o = data;
                }, 'json');
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                expect(o.x).toBe(1);
            });

        });

        it('cross domain post', function () {
            var ret = 0;

            // get post
            // chrome/ff send 不报异常 status 0 statusText ''
            // ie7 send 不报异常 status 0 statusText Security Violation
            // ie 9 10 send 报异常 error: 未指明错误
            // ch
            io({
                url: 'http://www.alibaba.com/',
                type: 'post',
                error: function () {
                    var args = util.makeArray(arguments);
                    expect(args[2].status || 500).toBe(500);
                    ret = 1;
                }
            });

            waitsFor(function () {
                return ret;
            }, 10000);
        });

        it('cross domain get', function () {
            var ret = 0;

            io({
                url: 'http://www.alibaba.com/',
                type: 'get',
                error: function () {
                    var args = util.makeArray(arguments);
                    // chrome status 0
                    // security error
                    // ie10 throw error when send status 未指明的错误
                    expect(args[2].status || 500).toBe(500);
                    ret = 1;
                }
            });

            waitsFor(function () {
                return ret;
            }, 10000);
        });

        it('post context', function () {

            var ok = false;

            io.post('/kissy/src/io/tests/data/interface.jss', function () {
                ok = true;
                // this === config
                expect(this.type).toBe('POST');
            });

            waitsFor(function () {
                return ok;
            });

        });
        it('getScript context', function () {
            var ok = false;

            io.post('/kissy/src/io/tests/data/interface.jss?t=get&dataType=script', function () {
                ok = true;
                expect(this.type).toBe('POST');
            }, 'script');

            waitsFor(function () {
                return ok;
            });

        });
        it('return value', function () {
            var xhr = io.post('/kissy/src/io/tests/data/interface.jss');
            expect('abort' in xhr).toBe(true);

            // 注：jQuery 里 不跨域时 jsonp 返回 xhr. 跨域时 返回 void
            xhr = io.jsonp('/kissy/src/io/tests/data/interface.jss');
            expect('abort' in xhr).toBe(true);
        });

    });

    describe('get', function () {
        it('datatype html text', function () {
            var ok, o;

            runs(function () {
                ok = false;
                io.get('/kissy/src/io/tests/data/html.jss', function (data) {
                    ok = true;
                    o = data;
                });
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                expect(o.toLowerCase().indexOf('<html')).toBe(0);
            });

        });

        it('get callback params', function () {
            var ok = false;

            io.get('/kissy/src/io/tests/data/interface.jss?t=get', function (data, textStatus, xhr) {
                ok = true;

                var o = util.parseJson(data);
                expect(o).not.toBe(undefined);
                expect(o.t).toBe('get');
                expect(o.name).toBe('test');
                expect(o.birth).toBe('2010/11/23');

                expect(textStatus).toBe('success');
                expect(xhr.responseText).toBe(data);
            });

            waitsFor(function () {
                return ok;
            });
        });


        it('data works', function () {
            var ok;

            io.get('/kissy/src/io/tests/data/interface.jss?t=get', {'data': 'hello'}, function (data) {
                ok = true;
                var o = util.parseJson(data);
                expect(o.data).toBe('hello');
            });

            waitsFor(function () {
                return ok;
            });
        });

        it('dataType json', function () {
            var ok, o;

            runs(function () {
                //io.get('http://test.com/kissy/src/io/tests/interface.jss?t=get', function(data) {
                // test.com -> 127.0.0.1
                // jQuery 里 当跨域时 dataType 为 json 时 依旧会调用 xhr. KISSY 处理逻辑与 jQuery 一致。
                io.get('/kissy/src/io/tests/data/interface.jss?t=get', function (data) {
                    ok = true;
                    o = data;
                }, 'json');
            });

            waitsFor(function () {
                return ok;
            }, 'success', 500);

            runs(function () {
                expect(typeof o).toBe('object');
                expect(o.name).toBe('test');
            });

            // 注意：在 jQuery 里 当 dataType 为 json, 但 url 里有 callback=? 时 会自动转换到 jsonp 模式
            // KISSY 里去掉了以上自动转换。用户必须显式指定 dataType 为 jsonp
            // 这样的好处是去除了 callback=? 约定 用户使用上也更清晰（指定 dataType 为 jsonp 比用 callback=? 切换到 jsonp 更简单）
            // API 的一个原则：让用户方便 但也不能宠坏用户（以某种看似简单的约定让用户继续糊涂）
        });

        it('dataType jsonp', function () {
            var ok, o;

            runs(function () {
                ok = false;

                // 注：此处的处理方式和 jQuery 不同
                // 不跨域时 jQuery 会依旧调用 xhr 处理 得到结果后 再通过 globalEval 执行
                // KISSY 里 无论跨不跨域 只要 dataType 为 jsonp, 都用 getScript 处理
                // 1.2 修正 和 jquery 保持一致 ie 下可以有出错处理 也方便 abort
                //io.get('http://test.com/kissy/src/io/tests/interface.jss?t=get', function(data) {
                io.get('/kissy/src/io/tests/data/interface.jss?t=get', function (data) {
                    ok = true;
                    o = data;
                }, 'jsonp');
            });

            waitsFor(function () {
                return ok;
            }, 'success', 500);

            runs(function () {
                expect(typeof o).toBe('object');
                expect(o.name).toBe('test');
            });
        });

        it('dataType script', function () {
            var ok;

            window.globalScriptTest = 0;

            runs(function () {
                ok = false;

                io.get('/kissy/src/io/tests/data/interface.jss?t=get&dataType=script', function (d) {
                    ok = true;
                    expect(d).toBe("var globalScriptTest = 200;");
                }, 'script');
            });

            waitsFor(function () {
                return ok;
            }, 'success', 500);

            runs(function () {
                expect(window.globalScriptTest).toBe(200);
            });
        });

        it('dataType xml', function () {
            var ok, o;

            runs(function () {
                ok = false;

                io.get('/kissy/src/io/tests/data/xml.jss', function (data) {
                    ok = true;
                    o = data;
                });
            });

            waitsFor(function () {
                return ok;
            }, 'success', 500);

            runs(function () {
                expect(o.childNodes.length > 0).toBe(true);
            });
        });


        it('xhr this', function () {
            var ok = false;

            io.get('/kissy/src/io/tests/data/interface.jss?t=get', function () {
                ok = true;
                expect(this.type).toBe('GET');
            });

            waitsFor(function () {
                return ok;
            });
        });

        it('getScript this', function () {
            var ok = false;

            io.get('/kissy/src/io/tests/data/interface.jss?t=get&dataType=script', function () {
                ok = true;
                expect(this.type).toBe('GET');
            }, 'script');

            waitsFor(function () {
                return ok;
            });
        });

    });

    describe('events', function () {

        it('start/send/success/complete/end event', function () {
            var ok = false, called = [];

            runs(function () {
                util.each(['start', 'send', 'success', 'complete'], function (type) {
                    io.on(type, function x(ev) {
                        io.detach(type, x);
                        called.push(ev.type);
                        expect(ev.ajaxConfig).not.toBe(undefined);
                        expect(ev.type).toBe(type);
                    });
                });
                io.get('/kissy/src/io/tests/data/interface.jss?t=' + (+new Date()), function () {
                    ok = true;
                });
            });

            waitsFor(function () {
                return ok;
            });

            runs(function () {
                expect(called).toEqual(['start', 'send', 'success', 'complete']);
            });
        });

        it('stop/error event', function () {
            var ok = false;

            // 注：stop 需要 timeout 时触发 未模拟 没测试
            runs(function () {
                io.on('error', function x(ev) {
                    io.detach('error', x);
                    ok = true;
                    expect(ev.ajaxConfig).not.toBe(undefined);
                    expect(ev.type).toBe('error');
                });
                io.get('/kissy/src/io/tests/data/404?t=' + (+new Date()));
            });

            waitsFor(function () {
                return ok;
            });
        });
    });
});