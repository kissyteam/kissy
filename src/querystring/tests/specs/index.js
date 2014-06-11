
    var querystring = require('querystring');
    describe('querystring',function(){
        it('querystring.stringify', function () {
            expect(querystring.stringify({foo: 1, bar: 2})).toBe('foo=1&bar=2');
            expect(querystring.stringify({foo: 1, bar: [2, 3]}, '&', '=', false)).toBe('foo=1&bar=2&bar=3');
            expect(querystring.stringify({'&#': '!#='})).toBe('%26%23=!%23%3D');

            expect(querystring.stringify({foo: 1, bar: []})).toBe('foo=1');
            expect(querystring.stringify({foo: {}, bar: 2})).toBe('bar=2');
            expect(querystring.stringify({foo: function () {
            }, bar: 2})).toBe('bar=2');

            expect(querystring.stringify({foo: undefined, bar: 2})).toBe('foo&bar=2');
            expect(querystring.stringify({foo: null, bar: 2})).toBe('foo=null&bar=2');
            expect(querystring.stringify({foo: true, bar: 2})).toBe('foo=true&bar=2');
            expect(querystring.stringify({foo: false, bar: 2})).toBe('foo=false&bar=2');
            expect(querystring.stringify({foo: '', bar: 2})).toBe('foo=&bar=2');
            expect(querystring.stringify({foo: NaN, bar: 2})).toBe('foo=NaN&bar=2');

            expect(querystring.stringify({b: [2, 3]})).toBe('b%5B%5D=2&b%5B%5D=3');

            expect(querystring.stringify({b: undefined})).toBe('b');

            expect(querystring.stringify({
                nodeType: 1
            })).toBe('nodeType=1');
        });

        it('querystring.parse', function () {
            expect(querystring.parse('foo=1&bar=2').foo).toBe('1');
            expect(querystring.parse('foo=1&bar=2').bar).toBe('2');

            expect(querystring.parse('foo').foo).toBe(undefined);
            expect(querystring.parse('foo=').foo).toBe('');

            expect(querystring.parse('foo=1&bar=2&bar=3').bar[0]).toBe('2');
            expect(querystring.parse('foo=1&bar=2&bar=3').bar[1]).toBe('3');

            expect(querystring.parse('foo=null&bar=2').foo).toBe('null');
            expect(querystring.parse('foo=&bar=2').foo).toBe('');
            expect(querystring.parse('foo&bar=2').foo).toBe(undefined);

            expect(querystring.parse('foo=1&bar=2&foo=3').foo[1]).toBe('3');

            expect(querystring.parse('foo=1&bar[]=2&bar[]=3').bar[0]).toBe('2');

            expect(querystring.parse('foo=1&bar=2=6').bar).toBe('2=6');
        });
    });