describe('web.js', function() {

    var S = KISSY,
        host = S.__HOST,
        fn = function() {
        };

    it("S.escapeHTML", function() {
        expect(S.escapeHTML("<")).toBe("&lt;");
        expect(S.escapeHTML(">")).toBe("&gt;");
        expect(S.escapeHTML("&")).toBe("&amp;");
        expect(S.escapeHTML('"')).toBe("&quot;");
    });


    it("S.unEscapeHTML", function() {
        expect(S.unEscapeHTML("&lt;")).toBe("<");
        expect(S.unEscapeHTML("&gt;")).toBe(">");
        expect(S.unEscapeHTML("&amp;")).toBe("&");
        expect(S.unEscapeHTML('&quot;')).toBe('"');
        expect(S.unEscapeHTML('&#' + "b".charCodeAt(0) + ';')).toBe('b');
    });

    it('S.isWindow', function() {
        expect(S.isWindow(host)).toBe(true);
        expect(S.isWindow({})).toBe(false);
        expect(S.isWindow(document)).toBe(false);
        expect(S.isWindow(document.documentElement.firstChild)).toBe(false);
    });

    it('S.makeArray', function() {
        var o;

        // 普通对象(无 length 属性)转换为 [obj]
        o = {a:1};
        expect(S.makeArray(o)[0]).toBe(o);

        // string 转换为 [str]
        expect(S.makeArray('test')[0]).toBe('test');

        // function 转换为 [fn]
        o = fn;
        expect(S.makeArray(o)[0]).toBe(o);

        // array-like 对象，转换为数组
        expect(S.makeArray({'0': 0, '1': 1, length: 2}).length).toBe(2);
        expect(S.makeArray({'0': 0, '1': 1, length: 2})[1]).toBe(1);

        // nodeList 转换为普通数组
        o = document.getElementsByTagName('body');
        expect(S.makeArray(o).length).toBe(1);
        expect(S.makeArray(o)[0]).toBe(o[0]);
        expect('slice' in S.makeArray(o)).toBe(true);

        // arguments 转换为普通数组
        o = arguments;
        expect(S.makeArray(o).length).toBe(0);

        // 伪 array-like 对象
        o = S.makeArray({a:1,b:2,length:2});
        expect(o.length).toBe(2);
        expect(o[0]).toBe(undefined);
        expect(o[1]).toBe(undefined);
    });

    it('S.param', function() {
        expect(S.param({foo:1, bar:2})).toBe('foo=1&bar=2');
        expect(S.param({foo:1, bar:[2,3]})).toBe('foo=1&bar%5B%5D=2&bar%5B%5D=3');

        expect(S.param({'&#': '!#='})).toBe('%26%23=!%23%3D');

        expect(S.param({foo:1, bar:[]})).toBe('foo=1');
        expect(S.param({foo:{}, bar:2})).toBe('bar=2');
        expect(S.param({foo:function() {
        }, bar:2})).toBe('bar=2');

        expect(S.param({foo:undefined, bar:2})).toBe('foo=undefined&bar=2');
        expect(S.param({foo:null, bar:2})).toBe('foo=null&bar=2');
        expect(S.param({foo:true, bar:2})).toBe('foo=true&bar=2');
        expect(S.param({foo:false, bar:2})).toBe('foo=false&bar=2');
        expect(S.param({foo:'', bar:2})).toBe('foo=&bar=2');
        expect(S.param({foo:NaN, bar:2})).toBe('foo=NaN&bar=2');
    });

    it('S.unparam', function() {
        expect(S.unparam('foo=1&bar=2').foo).toBe('1');
        expect(S.unparam('foo=1&bar=2').bar).toBe('2');

        expect(S.unparam('foo').foo).toBe('');
        expect(S.unparam('foo=').foo).toBe('');

        expect(S.unparam('foo=1&bar[]=2&bar[]=3').bar[0]).toBe('2');
        expect(S.unparam('foo=1&bar[]=2&bar[]=3').bar[1]).toBe('3');

        expect(S.unparam('foo=null&bar=2').foo).toBe('null');
        expect(S.unparam('foo=&bar=2').foo).toBe('');
        expect(S.unparam('foo&bar=2').foo).toBe('');

        expect(S.unparam('foo=1&bar=2&foo=3').foo).toBe('3');
    });

    it('S.globalEval', function() {
        S.globalEval('var globalEvalTest = 1;');
        expect(host['globalEvalTest']).toBe(1);
    });

    it('S.later', function() {
        var ok = false;

        S.later(function(data) {
            ok = true;
            expect(data.n).toBe(1);
        }, 20, false, null, { n: 1 });

        waitsFor(function() {
            return ok;
        });
        ok = false;

        var i = 1;
        var timer = S.later(function(data) {
            expect(data.n).toBe(1);
            if (i++ === 3) {
                timer.cancel();
                ok = true;
            }
        }, 500, true, null, { n: 1 });

        waitsFor(function() {
            return ok;
        });
        ok = false;
    });

    it('S.ready', function() {

    });

    it('S.available', function() {
        var ret, t;

        t = document.createElement('DIV');
        t.id = 'test-available';
        document.body.appendChild(t);

        ret = 0;
        S.available('#test-available', function() {
            ret = 1;
        });
        expect(ret).toBe(0);

        S.later(function() {
            t = document.createElement('DIV');
            t.id = 'test-available2';
            document.body.appendChild(t);
        }, 100);

        ret = 0;
        S.available('test-available2', function() {
            ret = 1;
        });
        expect(ret).toBe(0);

        // 下面的语句不抛异常
        S.available();
        S.available('xxx');
    });
});
