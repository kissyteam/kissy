describe('ajax', function() {

    var S = KISSY, IO = S.io, JSON = S.JSON;

    describe('get', function() {

        xit('能正确获取 callback 参数', function() {
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

        xit('能正确处理 data 参数', function() {
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
        });

        it('能正确处理 dataType 为 jsonp 的情况', function() {
            var ok, o;

            runs(function() {
                ok = false;

                // 注：此处的处理方式和 jQuery 不同。jQuery 会依旧调用 xhr 处理，并未真正实现 jsonp 回调。
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

        xit('当请求为 404/301 时，不触发回调', function() {

            IO.get('404.php', function() {
                expect('此处').toBe('不运行');
            });

            IO.get('301.php', function() {
                expect('此处').toBe('不运行');
            });

            waits(300);
        });

        xit('当 url 参数非法时，抛异常', function() {
            try {
                IO.get('');
                IO.get();
                IO.get(null);
                expect('此处').toBe('不运行');
            } catch(ex) {
            }
        });

    });

});
