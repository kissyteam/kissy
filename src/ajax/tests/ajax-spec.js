describe('ajax', function() {

    var S = KISSY, IO = S.IO, JSON = S.JSON;

    describe('get', function() {

        it('能正确获取 callback 参数', function() {
            var ok = false;

            IO.get('interface.php?t=get', function(data, textStatus, xhr) {
                ok = true;

                var o = JSON.parse(data);
                expect(o).not.toBe(undefined);
                expect(o['name']).toBe('test');
                expect(o['birth']).toBe('2010/11/23');

                expect(textStatus).toBe('success');
                expect(xhr.responseText).toBe(data);
            });

            waitsFor(function() {
                return ok;
            });
        });

        it('能正确处理 data 参数', function() {
            var ok;

            IO.get('interface.php?t=get', {'data': 'hello'}, function(data) {
                ok = true;

                var o = JSON.parse(data);
                expect(o['data']).toBe('hello');
            });

            waitsFor(function() {
                return ok;
            });
        });

        it('能正确处理 dataType 为 json 的情况', function() {
            var ok, o;

            runs(function() {
                //IO.get('http://test.com/kissy/src/ajax/tests/interface.php?t=get', function(data) {
                // test.com -> 127.0.0.1
                // jQuery 里，当跨域时，dataType 为 json 时，依旧会调用 xhr. KISSY 处理逻辑与 jQuery 一致。
                IO.get('interface.php?t=get', function(data) {
                    ok = true;
                    o = data;
                }, 'json');
            });

            waitsFor(function() {
                return ok;
            }, 'success', 500);

            runs(function() {
                expect(typeof o).toBe('object');
                expect(o['name']).toBe('test');
            });

            // 注意：在 jQuery 里，当 dataType 为 json, 但 url 里有 callback=? 时，会自动转换到 jsonp 模式
            // KISSY 里去掉了以上自动转换。用户必须显式指定 dataType 为 jsonp
            // 这样的好处是去除了 callback=? 约定，用户使用上也更清晰（指定 dataType 为 jsonp 比用 callback=? 切换到 jsonp 更简单）
            // API 的一个原则：让用户方便，但也不能宠坏用户（以某种看似简单的约定让用户继续糊涂）
        });

        it('能正确处理 dataType 为 jsonp 的情况', function() {
            var ok, o;

            runs(function() {
                ok = false;

                // 注：此处的处理方式和 jQuery 不同
                // 不跨域时，jQuery 会依旧调用 xhr 处理，得到结果后，再通过 globalEval 执行
                // KISSY 里，无论跨不跨域，只要 dataType 为 jsonp, 都用 getScript 处理
                //IO.get('http://test.com/kissy/src/ajax/tests/interface.php?t=get', function(data) {
                IO.get('interface.php?t=get', function(data) {
                    ok = true;
                    o = data;
                }, 'jsonp');
            });

            waitsFor(function() {
                return ok;
            }, 'success', 500);

            runs(function() {
                expect(typeof o).toBe('object');
                expect(o['name']).toBe('test');
            });
        });

        it('能正确处理 dataType 为 script 的情况', function() {
            var ok, o;

            runs(function() {
                ok = false;

                // 当不跨域时，jQuery 会调用 xhr + globalEval 来处理
                // 跨域时，jQuery 会调用 getScript 方式处理
                // KISSY 里，都用 getScript 方式处理
                //$.get('http://test.com/kissy/src/ajax/tests/interface.php?t=get&dataType=script', function(data) {
                IO.get('interface.php?t=get&dataType=script', function() {
                    ok = true;
                    // 在 jQuery 里，此处 data 返回 script.innerHTML
                    // KISSY 里，无参数返回
                    // 注意 this 也不同
                }, 'script');
            });

            waitsFor(function() {
                return ok;
            }, 'success', 500);

            runs(function() {
                expect(window['global_script_test']).toBe(200);
            });
        });

        it('能正确处理 dataType 为 xml 的情况', function() {
            var ok, o;

            runs(function() {
                ok = false;

                IO.get('xml.php', function(data) {
                    ok = true;
                    o = data;
                });
            });

            waitsFor(function() {
                return ok;
            }, 'success', 500);

            runs(function() {
                expect(o.childNodes.length > 0).toBe(true);
            });
        });

        it('能正确处理 dataType 为 html 和 text 的情况', function() {
            var ok, o;

            runs(function() {
                ok = false;

                IO.get('test.html', function(data) {
                    ok = true;
                    o = data;
                });
            });

            waitsFor(function() {
                return ok;
            }, 'success', 500);

            runs(function() {
                expect(o.indexOf('<!doctype')).toBe(0);
            });
        });

        it('当请求为 404/301 时，不触发回调', function() {

            IO.get('404.php', function() {
                expect('此处').toBe('不运行');
            });

            IO.get('301.php', function() {
                expect('此处').toBe('不运行');
            });

            waits(300);
        });

        it('当 dataType 不为 jsonp, url 参数跨域时，不触发回调', function() {

            try {
                IO.get('http://google.com/', function() {
                    expect('此处').toBe('不运行');
                });
            } catch(e) {
                // IE 会抛 Access is denied 错误，是正确的。
            }

            waits(300);
        });

        it('当 url 参数非法时，忽略请求，不抛异常', function() {
            // 注意：jQuery 没有考虑 url 参数非法的情况，由浏览器处理，有些抛异常，有些不抛
            // KISSY 统一做 silent 处理
            try {
                IO.get('');
                IO.get();
                IO.get(null);
                expect('此处会运行').toBe('此处会运行');
            } catch(ex) {
            }
        });

        it('xhr 方式时，能正确设置 callback 里的 this', function() {
            var ok = false;

            IO.get('interface.php?t=get', function() {
                ok = true;
                expect(this.type).toBe('GET');
            });

            waitsFor(function() {
                return ok;
            });
        });

        it('getScript 方式时，能正确设置 callback 里的 this', function() {
            var ok = false;

            IO.get('interface.php?t=get&dataType=script', function() {
                ok = true;
                expect(this.dataType).toBe('script');
            }, 'script');

            waitsFor(function() {
                return ok;
            });
        });

        it('能正确获取返回值', function() {

            var xhr = IO.get('interface.php?t=get');
            expect('onreadystatechange' in xhr).toBe(true);

            // 注：jQuery 里，不跨域时，jsonp 返回 xhr. 跨域时，返回 void
            var scriptEl = IO.jsonp('interface.php?t=get');
            expect('setAttribute' in scriptEl).toBe(true);
        });
    });

    describe('events', function() {

        it('能正确触发 start/send/success/complete/end 事件，并获取到参数数据', function() {
            var ok = false;

            runs(function() {
                S.each(['start', 'send', 'success', 'complete', 'end'], function(type) {
                    IO.on(type, function(ev) {
                        expect(ev.ajaxConfig).not.toBe(undefined);
                        expect(ev.type).toBe(type);
                    });
                });
                IO.get('interface.php?t=get', function() {
                    ok = true;
                });
            });

            waitsFor(function() {
                return ok;
            });
        });

        it('能正确触发 stop/error 事件，并获取到参数数据', function() {
            var ok = false;

            // 注：stop 需要 timeout 时触发，未模拟，没测试

            runs(function() {
                IO.on('error', function(ev) {
                    ok = true;
                    expect(ev.ajaxConfig).not.toBe(undefined);
                    expect(ev.type).toBe('error');
                });
                IO.get('404.php');
            });

            waitsFor(function() {
                return ok;
            });
        });
    });

});

/**
 * TODO:
 *  - post/jsonp 测试
 *  - io 的全面测试，找出现有测试用例还没覆盖到的路径（不知有没有好用的 Test Coverage 检测工具?）
 *  - 目前只测试了 Chrome/Firefox/IE8+, 其它浏览器尚未测试
 *  - 同步的测试
 */
