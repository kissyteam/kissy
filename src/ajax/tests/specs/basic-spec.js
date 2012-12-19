/**
 * basic test cases for kissy ajax
 * @author lijing00333@163.com, yiminghe@gmail.com
 */
KISSY.use("json,ajax", function (S, JSON, IO) {

    describe('IO', function () {


        describe('404/301', function () {

            it('404 get error', function () {
                var ret404, o404 = 0;

                IO({
                    url: '../data/404',
                    cache: false,
                    success: function () {
                        //var args = S.makeArray(arguments);
                        ret404 = 1;
                    },
                    error: function () {
                        //var args = S.makeArray(arguments);
                        ret404 = 0;
                    },
                    complete: function () {
                        o404 = 1;
                    }
                });

                waitsFor(function () {
                    return o404 == 1;
                });

                runs(function () {
                    expect(ret404).toBe(0);
                });
            });


            it('301 get success', function () {

                var ret301, o301;

                IO({
                    url: '../data/301.jss',
                    cache: false,
                    success: function (p) {
                        //var args = S.makeArray(arguments);
                        expect(p.name).toBe('kissy');
                        ret301 = 1;
                    },
                    error: function (_, s, io) {
                        expect(io.status).toBe(0);
                        //var args = S.makeArray(arguments);
                        ret301 = 0;
                    },
                    complete: function () {
                        o301 = 1;
                    }
                });

                waitsFor(function () {
                    // 301 浏览器自动跳转
                    return o301 == 1;
                });

                runs(function () {
                    expect(ret301).toBe(1);
                });
            });

            it('404 post error', function () {
                var ret404, o404 = 0;

                IO({
                    url: '../data/404',
                    type: 'post',
                    cache: false,
                    success: function () {
                        //var args = S.makeArray(arguments);
                        ret404 = 1;
                    },
                    error: function () {
                        //var args = S.makeArray(arguments);
                        ret404 = 0;
                    },
                    complete: function () {
                        o404 = 1;
                    }
                });

                waitsFor(function () {
                    return o404 == 1;
                });

                runs(function () {
                    expect(ret404).toBe(0);
                });
            });


            it('301 post success', function () {


                var ret301, o301;

                IO({
                    url: '../data/301.jss',
                    cache: false,
                    type: 'post',
                    success: function (p) {
                        //var args = S.makeArray(arguments);
                        expect(p.name).toBe('kissy');
                        ret301 = 1;
                    },
                    error: function (_, s, io) {
                        expect(io.status).toBe(0);
                        //var args = S.makeArray(arguments);
                        ret301 = 0;
                    },
                    complete: function () {
                        o301 = 1;
                    }
                });

                waitsFor(function () {
                    // 301 浏览器自动跳转
                    return o301 == 1;
                });

                runs(function () {
                    expect(ret301).toBe(1);
                });
            });

            it('404时，jsonp不触发回调', function () {
                var ret404;
                IO({
                    url: '../data/404',
                    dataType: 'jsonp',
                    success: function () {
                        //var args = S.makeArray(arguments);
                        ret404 = 1;
                    },
                    error: function () {
                        var args = S.makeArray(arguments);
                        expect(args[1]).toBe("Not Found");
                        ret404 = 0;
                    }
                });

                waitsFor(function () {
                    return ret404 == 0;
                });
            });

            it('404时，cross domain jsonp不触发回调', function () {
                var ret404;
                IO({
                    url: '../data/404',
                    dataType: 'jsonp',
                    crossDomain: true,
                    success: function () {
                        //var args = S.makeArray(arguments);
                        ret404 = 1;
                    },
                    error: function () {
                        var args = S.makeArray(arguments);
                        expect(S.inArray(args[1], [
                            "script error",
                            "parser error"
                        ]))
                            .toBe(true);
                        ret404 = 0;
                    }
                });

                waitsFor(function () {
                    return ret404 == 0;
                });
            });

        });

        describe('jsonp', function () {

            it('自定义callback', function () {
                var ok = false;
                runs(function () {
                    window['customCallback'] = function (data) {
                        ok = true;
                        expect(typeof data).toBe('object');
                        expect(data.callback).toBe('customCallback');
                    };
                    S.getScript('../data/interface.jss?callback=customCallback');
                });

                waitsFor(function () {
                    return ok;
                });

                runs(function () {
                    try {
                        delete window['customCallback'];
                    } catch (e) {
                        window['customCallback'] = undefined;
                    }
                })

            });

            it('自定义callbackName', function () {
                var ok = false;
                runs(function () {
                    IO({
                        url: '../data/interface.jss?t=get',
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

            it('不带参数请求jsonp', function () {

                var ok = 0;

                runs(function () {
                    IO.jsonp('../data/interface.jss', function (data) {
                        ok = true;
                        expect(typeof data).toBe('object');

                    });
                });

                waitsFor(function () {
                    return ok;
                });

            });

            it('带参数提交jsonp，获取回调参数', function () {
                var ok = 0;
                IO.jsonp('../data/interface.jss?sleep=0', {
                    my_param: 'taobao'
                }, function (data) {
                    expect(typeof data).toBe('object');
                    expect(data).not.toBe(undefined);
                    expect(data['my_param']).toBe('taobao');
                    ok = 1;
                });
                waitsFor(function () {
                    return ok;
                });
            });

            // https://github.com/kissyteam/kissy/issues/187
            it("can ignore protocol", function () {
                var ok = 0;
                IO.jsonp('//' + location.hostname + ':9999/kissy/src/ajax/tests/data/interface.jss', {
                    my_param: 'taobao'
                }, function (data) {
                    expect(typeof data).toBe('object');
                    expect(data).not.toBe(undefined);
                    expect(data['my_param']).toBe('taobao');
                    ok = 1;
                });
                waitsFor(function () {
                    return ok;
                });
            });

        });

        describe('同步请求的test case', function () {

            it('get 同步加载,等待2秒钟继续执行', function () {
                var d = 0;
                IO({
                    type: 'get',
                    // 根据 content-type 自动 parse
                    url: '../data/interface.jss?sleep=1&contentType=text/json',
                    async: false,
                    success: function (o) {
                        d = o;
                    }
                });
                expect(d['name']).toBe('test');
            });

            it('post 同步加载,等待2秒钟继续执行', function () {
                runs(function () {
                    var d = 0;
                    IO({
                        type: 'post',
                        url: '../data/interface.jss?sleep=1&contentType=text/json',
                        async: false,
                        success: function (o) {
                            d = o;
                        }
                    });
                    expect(d['name']).toBe('test');
                });
            });


        });


        describe('post', function () {

            it('能正确发起post 请求，无参数,正确获取回调参数，类型是text/json', function () {

                var ok = false;
                IO.post('../data/interface.jss?t=post&contentType=text/json', function (data) {
                    ok = true;
                    expect(typeof data).toBe('object');
                    expect(data).not.toBe(undefined);
                    expect(data['name']).toBe('test');
                });

                waitsFor(function () {
                    return ok;
                });

            });

            it('能正确发起 post 请求，无参数,正确获取回调参数', function () {

                var ok = false;
                IO.post('../data/interface.jss?t=post', function (data, status, xhr) {
                    ok = true;
                    expect(typeof data).toBe('string');
                    var o = JSON.parse(data);
                    expect(o).not.toBe(undefined);
                    expect(o['name']).toBe('test');
                    expect(xhr.responseText).toBe(data);
                });

                waitsFor(function () {
                    return ok;
                });

            });


            it('能正确发起 post 请求, 参数为json，并正确获取参数', function () {

                var ok = false;
                IO.post('../data/interface.jss?t=post', {
                    type: 'post',
                    name: 'test',
                    company: 'www.taobao.com',
                    exp: '>,?/\%."`~'
                }, function (data, textStatus, xhr) {
                    ok = true;
                    var o = JSON.parse(data);
                    expect(o).not.toBe(undefined);
                    expect(o['name']).toBe('test');
                    expect(o['company']).toBe('www.taobao.com');

                    expect(textStatus).toBe('success');
                    expect(xhr.responseText).toBe(data);
                });
                waitsFor(function () {
                    return ok;
                });

            });

            it('能正确发起 post 请求 参数为string，并正确获取参数', function () {

                var ok = false;
                IO.post('../data/interface.jss?t=post',
                    'name=test&company=www.taobao.com&exp=' +
                        encodeURIComponent('>,?/\\%."`~'),
                    function (data, textStatus, xhr) {
                        ok = true;

                        var o = JSON.parse(data);
                        expect(o).not.toBe(undefined);
                        expect(o['name']).toBe('test');
                        expect(o['company']).toBe('www.taobao.com');

                        expect(textStatus).toBe('success');
                        expect(xhr.responseText).toBe(data);
                    });
                waitsFor(function () {
                    return ok;
                });

            });

            it('正确处理 dataType 为 json 的情况', function () {

                var ok, o;

                runs(function () {
                    IO.post('../data/interface.jss?contentType=text/json',
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
                    expect(o['name']).toBe('test');
                });

            });

            it('json 参数 可以覆盖url参数', function () {
                var ok = false;
                IO.post('../data/interface.jss?foo=sk1', {
                    foo: 'sk2'
                }, function (data) {
                    ok = true;
                    expect(typeof data).toBe('object');
                    expect(data['foo']).toBe('sk2');
                }, 'json');

                waitsFor(function () {
                    return ok;
                }, 'success', 5000);

            });

            it('正确处理 dataType 为 jsonp 的情况', function () {
                var ok, o;

                runs(function () {
                    ok = false;

                    IO.post('../data/interface.jss', function (data) {
                        ok = true;
                        o = data;
                    }, 'jsonp');
                });

                waitsFor(function () {
                    return ok;
                });

                runs(function () {
                    expect(typeof o).toBe('object');
                    expect(o['name']).toBe('test');
                });


            });

            it('正确处理 dataType 为 script 的情况', function () {

                var ok = false;

                runs(function () {
                    // 这里和get的处理一致
                    IO.post('../data/interface.jss?type=post&dataType=script',
                        function (data) {
                            ok = true;
                            expect(data).toBe("var global_script_test = 500;");
                        }, 'script');
                });

                waitsFor(function () {
                    return ok;
                });

                runs(function () {
                    expect(window['global_script_test']).toBe(500);
                    try {
                        delete window['global_script_test'];
                    } catch (e) {
                        window['global_script_test'] = undefined;
                    }
                });

            });

            it('正确处理 dataType 为 script 的情况，并且 contentType 设置正确', function () {

                var ok = false;

                runs(function () {
                    // 这里和get的处理一致
                    IO.post('../data/interface.jss?type=post' +
                        '&dataType=script' +
                        '&contentType=text/javascript',
                        function (data) {
                            ok = true;
                            expect(data).toBe("var global_script_test = 500;");
                        });
                });

                waitsFor(function () {
                    return ok;
                });

                runs(function () {
                    expect(window['global_script_test']).toBe(500);
                    try {
                        delete window['global_script_test'];
                    } catch (e) {
                        window['global_script_test'] = undefined;
                    }
                });

            });

            it('正确处理 dataType 为 xml 的情况,回调参数为 xml 对象', function () {
                var ok = false, o;

                runs(function () {

                    //这里'xml'的参数可以省略
                    IO.post('../data/xml.jss', function (data) {
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


            it('正确处理 dataType 为 xml 的情况,回调参数为json对象', function () {
                var ok = false, o;

                runs(function () {

                    // 可以么？ content-type 为 xml
                    // 但实际内容也为 json ，需要自动转换成 json
                    IO.post('../data/xml-json.jss', function (data) {
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

            it('当 dataType 不为 jsonp, url 参数跨域时，不触发回调', function () {
                var ret = 0;
                IO({
                    url: 'http://www.g.cn/',
                    type: 'post',
                    error: function () {
                        var args = S.makeArray(arguments);
                        // security error
                        expect(args[2].status).toBe(0);
                        expect(S.inArray(args[1], ['', 'Security Violation.'])).toBe(true);
                        ret = 1;
                    }
                });

                waitsFor(function () {
                    return ret;
                });
            });

            it('xhr 方式时，能正确设置 callback 里的 this', function () {

                var ok = false;

                IO.post('../data/interface.jss', function () {
                    ok = true;
                    // this === config
                    expect(this.type).toBe('POST');
                });

                waitsFor(function () {
                    return ok;
                });

            });
            it('getScript 方式时，能正确设置 callback 里的 this', function () {
                var ok = false;

                IO.post('../data/interface.jss?t=get&dataType=script', function () {
                    ok = true;
                    expect(this.type).toBe('POST');
                }, 'script');

                waitsFor(function () {
                    return ok;
                });

            });
            it('能正确获取返回值', function () {
                var xhr = IO.post('../data/interface.jss');
                expect('abort' in xhr).toBe(true);

                // 注：jQuery 里，不跨域时，jsonp 返回 xhr. 跨域时，返回 void
                xhr = IO.jsonp('../data/interface.jss');
                expect('abort' in xhr).toBe(true);
            });

        });


        describe('get', function () {

            it('能正确处理 dataType 为 html 和 text 的情况', function () {

                var ok, o;

                runs(function () {
                    ok = false;
                    IO.get('test.html', function (data) {
                        ok = true;
                        o = data;
                    });
                });

                waitsFor(function () {
                    return ok;
                });

                runs(function () {
                    expect(o.indexOf('<!doctype')).toBe(0);
                });

            });

            it('能正确获取 callback 参数', function () {
                var ok = false;

                IO.get('../data/interface.jss?t=get', function (data, textStatus, xhr) {
                    ok = true;

                    var o = JSON.parse(data);
                    expect(o).not.toBe(undefined);
                    expect(o['t']).toBe('get');
                    expect(o['name']).toBe('test');
                    expect(o['birth']).toBe('2010/11/23');

                    expect(textStatus).toBe('success');
                    expect(xhr.responseText).toBe(data);
                });

                waitsFor(function () {
                    return ok;
                });
            });


            it('能正确处理 data 参数', function () {
                var ok;

                IO.get('../data/interface.jss?t=get', {'data': 'hello'}, function (data) {
                    ok = true;
                    var o = JSON.parse(data);
                    expect(o['data']).toBe('hello');
                });

                waitsFor(function () {
                    return ok;
                });
            });

            it('能正确处理 dataType 为 json 的情况', function () {
                var ok, o;

                runs(function () {
                    //IO.get('http://test.com/kissy/src/ajax/tests/interface.jss?t=get', function(data) {
                    // test.com -> 127.0.0.1
                    // jQuery 里，当跨域时，dataType 为 json 时，依旧会调用 xhr. KISSY 处理逻辑与 jQuery 一致。
                    IO.get('../data/interface.jss?t=get', function (data) {
                        ok = true;
                        o = data;
                    }, 'json');
                });

                waitsFor(function () {
                    return ok;
                }, 'success', 500);

                runs(function () {
                    expect(typeof o).toBe('object');
                    expect(o['name']).toBe('test');
                });

                // 注意：在 jQuery 里，当 dataType 为 json, 但 url 里有 callback=? 时，会自动转换到 jsonp 模式
                // KISSY 里去掉了以上自动转换。用户必须显式指定 dataType 为 jsonp
                // 这样的好处是去除了 callback=? 约定，用户使用上也更清晰（指定 dataType 为 jsonp 比用 callback=? 切换到 jsonp 更简单）
                // API 的一个原则：让用户方便，但也不能宠坏用户（以某种看似简单的约定让用户继续糊涂）
            });

            it('能正确处理 dataType 为 jsonp 的情况', function () {
                var ok, o;

                runs(function () {
                    ok = false;

                    // 注：此处的处理方式和 jQuery 不同
                    // 不跨域时，jQuery 会依旧调用 xhr 处理，得到结果后，再通过 globalEval 执行
                    // KISSY 里，无论跨不跨域，只要 dataType 为 jsonp, 都用 getScript 处理
                    // 1.2 修正，和 jquery 保持一致，ie 下可以有出错处理，也方便 abort
                    //IO.get('http://test.com/kissy/src/ajax/tests/interface.jss?t=get', function(data) {
                    IO.get('../data/interface.jss?t=get', function (data) {
                        ok = true;
                        o = data;
                    }, 'jsonp');
                });

                waitsFor(function () {
                    return ok;
                }, 'success', 500);

                runs(function () {
                    expect(typeof o).toBe('object');
                    expect(o['name']).toBe('test');
                });
            });

            it('能正确处理 dataType 为 script 的情况', function () {
                var ok;

                window['global_script_test'] = 0;

                runs(function () {
                    ok = false;

                    IO.get('../data/interface.jss?t=get&dataType=script', function (d) {
                        ok = true;
                        expect(d).toBe("var global_script_test = 200;");
                    }, 'script');
                });

                waitsFor(function () {
                    return ok;
                }, 'success', 500);

                runs(function () {
                    expect(window['global_script_test']).toBe(200);
                });
            });

            it('能正确处理 dataType 为 xml 的情况', function () {
                var ok, o;

                runs(function () {
                    ok = false;

                    IO.get('../data/xml.jss', function (data) {
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

            it('当 dataType 不为 jsonp, url 参数跨域时，不触发回调', function () {

                var ret = 0;

                IO({
                    url: 'http://www.g.cn/',
                    type: 'get',
                    error: function () {
                        var args = S.makeArray(arguments);
                        // security error
                        expect(args[2].status).toBe(0);
                        expect(S.inArray(args[1], ['', 'Security Violation.'])).toBe(true);
                        ret = 1;
                    }
                });

                waitsFor(function () {
                    return ret;
                });

            });

            it('xhr 方式时，能正确设置 callback 里的 this', function () {
                var ok = false;

                IO.get('../data/interface.jss?t=get', function () {
                    ok = true;
                    expect(this.type).toBe('GET');
                });

                waitsFor(function () {
                    return ok;
                });
            });

            it('getScript 方式时，能正确设置 callback 里的 this', function () {
                var ok = false;

                IO.get('../data/interface.jss?t=get&dataType=script', function () {
                    ok = true;
                    expect(this.type).toBe('GET');
                }, 'script');

                waitsFor(function () {
                    return ok;
                });
            });

        });

        describe('events', function () {

            it('能正确触发 start/send/success/complete/end 事件，并获取到参数数据', function () {
                var ok = false, called = [];

                runs(function () {
                    S.each(['start', 'send', 'success', 'complete'], function (type) {
                        IO.on(type, function (ev) {
                            called.push(ev.type);
                            expect(ev.ajaxConfig).not.toBe(undefined);
                            expect(ev.type).toBe(type);
                        });
                    });
                    IO.get('../data/interface.jss?t=' + S.now(), function () {
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

            it('能正确触发 stop/error 事件，并获取到参数数据', function () {
                var ok = false;

                // 注：stop 需要 timeout 时触发，未模拟，没测试
                runs(function () {
                    IO.on('error', function (ev) {
                        ok = true;
                        expect(ev.ajaxConfig).not.toBe(undefined);
                        expect(ev.type).toBe('error');
                    });
                    IO.get('../data/404?t=' + S.now());
                });

                waitsFor(function () {
                    return ok;
                });
            });
        });

    });
});
