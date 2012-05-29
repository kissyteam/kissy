/**
 * basic testcases for kissy ajax
 * @author  lijing00333@163.com
 */
KISSY.use("json,ajax", function (S, JSON, IO) {

    describe('ajax', function () {


        describe('404s/301s', function () {

            it('当请求为 404/301 时，get不触发回调', function () {

                //如果不带随机数，ie下会从缓存中取，会认为链接状态为200，从而执行回调
                IO.get('404_none.php?t=' + S.now(), function () {
                    expect('此处').toBe('不运行');
                });

                IO.get('301.php', function () {
                    expect('此处').toBe('不运行');
                });

                waits(300);
            });

            it('当请求为404/301时，post不触发回调', function () {

                IO.post('404_none.php?t=' + S.now(), function () {
                    expect('此处').toBe('不运行');
                });

                IO.post('301.php', function () {
                    expect('此处').toBe('不运行');
                });

                waits(300);

            });

            it('404/301时，jsonp不触发回调', function () {

                IO.jsonp('404_none.php?t=' + S.now(), function () {
                    expect('此处').toBe('不运行');
                });

                waits(300);
            });


        });

        describe('jsonp', function () {

            it('请求错误的jsonp,不触发回调', function () {
                IO.jsonp('');
                IO.jsonp();
                IO.jsonp(null);
                expect('此处会运行').toBe('此处会运行');
            });

            it('自定义callback', function () {
                var ok = false;
                runs(function () {
                    window['customCallback'] = function (data) {
                        ok = true;
                        expect(typeof data).toBe('object');
                        expect(data.callback).toBe('customCallback');
                    };
                    S.getScript('interface.php?callback=customCallback');
                });

                waitsFor(function () {
                    return ok;
                });

            });

            it('自定义callbackName', function () {
                var ok = false;
                runs(function () {
                    IO({
                        url:'interface.php?t=get',
                        success:function (data) {
                            ok = true;
                            expect(typeof data).toBe('object');
                        },
                        dataType:'jsonp',
                        jsonp:'customCallback'
                    });

                });

                waitsFor(function () {
                    return ok;
                });

            });

            it('不带参数请求jsonp', function () {
                var ok = false;
                runs(function () {
                    IO.jsonp('interface.php', function (data) {
                        ok = true;
                        expect(typeof data).toBe('object');

                    });
                });

                waitsFor(function () {
                    return ok;
                });

            });

            it('带参数提交jsonp，获取回调参数', function () {

                IO.jsonp('interface.php?sleep=0', {
                    myparam:'taobao'
                }, function (data) {
                    expect(typeof data).toBe('object');
                    expect(data).not.toBe(undefined);
                    expect(data['myparam']).toBe('taobao');

                });

            });


        });

        describe('同步请求的test case', function () {

            it('get 同步加载,等待2秒钟继续执行', function () {
                runs(function () {
                    var d;
                    IO({
                        type:'get',
                        // 根据 content-type 自动 parse
                        url:'interface.php?sleep=1&contype=text/json',
                        async:false,
                        success:function (o) {
                            d = o;
                        }
                    });
                    expect(d['name']).toBe('test');
                });
            });

            it('post 同步加载,等待2秒钟继续执行', function () {
                runs(function () {
                    var d;
                    IO({
                        type:'post',
                        url:'interface.php?sleep=1&contype=text/json',
                        async:false,
                        success:function (o) {
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
                IO.post('interface.php?t=post&contype=text/json', function (data) {
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
                IO.post('interface.php?t=post', function (data, status, xhr) {
                    ok = true;
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
                IO.post('interface.php?t=post', {
                    type:'post',
                    name:'test',
                    company:'www.taobao.com',
                    exp:'>,?/\%."`~'
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
                IO.post('interface.php?t=post',
                    'name=test&company=www.taobao.com&exp=>,?/\%."`~',
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
                    IO.post('interface.php?contype=text/json', function (data) {
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
                IO.post('interface.php?foo=sk1', {
                    foo:'sk2'
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

                    IO.post('interface.php', function (data) {
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
                    IO.post('interface.php?type=post&dataType=script', function (data) {
                        ok = true;
                        expect(data).toBe("var global_script_test = 500;");
                    }, 'script');
                });

                waitsFor(function () {
                    return ok;
                });

                runs(function () {
                    expect(window['global_script_test']).toBe(500);
                });


            });

            it('正确处理 dataType 为 xml 的情况,回调参数为 xml 对象', function () {
                var ok = false, o;

                runs(function () {

                    //这里'xml'的参数可以省略
                    IO.post('xml.php', function (data) {
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
                    // 但 实际内容也为 json ，需要自动转换成 json
                    IO.get('xml-json.php', function (data) {
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


            it('能正确处理 dataType 为 html 和 text 的情况', function () {
                var ok, o;

                runs(function () {
                    ok = false;

                    IO.post('test.html', function (data) {
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

            it('当 dataType 不为 jsonp, url 参数跨域时，不触发回调', function () {
                try {
                    IO.post('http://www.g.cn/', function () {
                        expect('此处').toBe('不运行');
                    });
                } catch (e) {
                    // IE 会抛 Access is denied 错误，是正确的。
                }

                waits(300);
            });
            it('当 url 参数非法时，忽略请求，不抛异常', function () {
                // 这里的处理和get一致
                try {
                    IO.post('');
                    IO.post();
                    IO.post(null);
                    expect('此处会运行').toBe('此处会运行');
                } catch (ex) {
                    expect('此处').toBe('不会运行');
                }

            });

            it('xhr 方式时，能正确设置 callback 里的 this', function () {

                var ok = false;

                IO.post('interface.php', function () {
                    ok = true;
                    expect(this.type).toBe('POST');
                });

                waitsFor(function () {
                    return ok;
                });

            });
            it('getScript 方式时，能正确设置 callback 里的 this', function () {
                var ok = false;

                IO.post('interface.php?t=get&dataType=script', function () {
                    ok = true;
                    expect(this.type).toBe('POST');
                }, 'script');

                waitsFor(function () {
                    return ok;
                });

            });
            it('能正确获取返回值', function () {
                var xhr = IO.post('interface.php');
                expect('abort' in xhr).toBe(true);

                // 注：jQuery 里，不跨域时，jsonp 返回 xhr. 跨域时，返回 void
                xhr = IO.jsonp('interface.php');
                expect('abort' in xhr).toBe(true);
            });


        });


        describe('get', function () {

            it('能正确获取 callback 参数', function () {
                var ok = false;

                IO.get('interface.php?t=get', function (data, textStatus, xhr) {
                    ok = true;

                    var o = JSON.parse(data);
                    expect(o).not.toBe(undefined);
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

                IO.get('interface.php?t=get', {'data':'hello'}, function (data) {
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
                    //IO.get('http://test.com/kissy/src/ajax/tests/interface.php?t=get', function(data) {
                    // test.com -> 127.0.0.1
                    // jQuery 里，当跨域时，dataType 为 json 时，依旧会调用 xhr. KISSY 处理逻辑与 jQuery 一致。
                    IO.get('interface.php?t=get', function (data) {
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
                    //IO.get('http://test.com/kissy/src/ajax/tests/interface.php?t=get', function(data) {
                    IO.get('interface.php?t=get', function (data) {
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

                runs(function () {
                    ok = false;

                    // 当不跨域时，jQuery 会调用 xhr + globalEval 来处理
                    // 跨域时，jQuery 会调用 getScript 方式处理
                    // KISSY 里，都用 getScript 方式处理
                    // 1.2 使用 xhr
                    //$.get('http://test.com/kissy/src/ajax/tests/interface.php?t=get&dataType=script', function(data) {
                    IO.get('interface.php?t=get&dataType=script', function () {
                        ok = true;
                        // 在 jQuery 里，此处 data 返回 script.innerHTML
                        // KISSY 里，无参数返回
                        // 注意 this 也不同
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

                    IO.get('xml.php', function (data) {
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
                }, 'success', 500);

                runs(function () {
                    expect(o.indexOf('<!doctype')).toBe(0);
                });
            });


            it('当 dataType 不为 jsonp, url 参数跨域时，不触发回调', function () {

                try {
                    IO.get('http://www.google.com/', function () {
                        expect('此处').toBe('不运行');
                    });
                } catch (e) {
                    // IE 会抛 Access is denied 错误，是正确的。
                }

                waits(300);
            });

            it('当 url 参数非法时，忽略请求，不抛异常', function () {
                // 注意：jQuery 没有考虑 url 参数非法的情况，由浏览器处理，有些抛异常，有些不抛
                // KISSY 统一做 silent 处理
                try {
                    IO.get('');
                    IO.get();
                    IO.get(null);
                    expect('此处会运行').toBe('此处会运行');
                } catch (ex) {
                }
            });

            it('xhr 方式时，能正确设置 callback 里的 this', function () {
                var ok = false;

                IO.get('interface.php?t=get', function () {
                    ok = true;
                    expect(this.type).toBe('GET');
                });

                waitsFor(function () {
                    return ok;
                });
            });

            it('getScript 方式时，能正确设置 callback 里的 this', function () {
                var ok = false;

                IO.get('interface.php?t=get&dataType=script', function () {
                    ok = true;
                    expect(this.type).toBe('GET');
                }, 'script');

                waitsFor(function () {
                    return ok;
                });
            });

            it('能正确获取返回值', function () {
                //如果不加时间戳，ie下会从缓存中取数据，得不到预期的xhr
                var xhr = IO.get('interface.php?t=' + S.now());
                expect('responseText' in xhr).toBe(true);
            });
        });

        describe('events', function () {

            it('能正确触发 start/send/success/complete/end 事件，并获取到参数数据', function () {
                var ok = false;

                runs(function () {
                    S.each(['start', 'send', 'success', 'complete', 'end'], function (type) {
                        IO.on(type, function (ev) {
                            expect(ev.ajaxConfig).not.toBe(undefined);
                            expect(ev.type).toBe(type);
                        });
                    });
                    IO.get('interface.php?t=' + S.now(), function () {
                        ok = true;
                    });
                });

                waitsFor(function () {
                    return ok;
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
                    IO.get('404_none.php?t=' + S.now());
                });

                waitsFor(function () {
                    return ok;
                });
            });
        });

    });
});
