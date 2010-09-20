describe("Cookie", function() {

    var Cookie = KISSY.Cookie,
        get = Cookie.get,
        set = Cookie.set;

    beforeEach(function(){
        document.cookie = 'test0';
        document.cookie = 'test1=1test0';
        document.cookie = 'test02=2';
        document.cookie = 'xtest0=x';
        document.cookie = 'test3 t   =   ';
    });

    it("should get cookies properly", function() {
        expect(get('test0')).toBe('');
        expect(get('test1')).toBe('1test0');
        expect(get('test3 t')).toBe('');
        expect(get('test02')).toBe('2');
        expect(get('xtest0')).toBe('x');
        expect(get('xtest0')).toBe('x');

        expect(get('test4')).toBe(undefined);
        expect(get(true)).toBe(undefined);
        expect(get({})).toBe(undefined);
        expect(get(null)).toBe(undefined);
    });

    it("should set cookies properly", function(){
        set('set-test', 'xx');
        expect(get('set-test')).toBe('xx');

        set('set-test2', 'xx', 0);
        expect(get('set-test2')).toBe(undefined);

        set('set-test3', '1', new Date(2099, 1, 1), '', '/');
        set('set-test3', '2', new Date(2099, 1, 1), '', '/');
        expect(get('set-test3')).toBe('2');
    });

    it("should remove cookies properly", function(){
        // path 相同
        Cookie.remove('set-test');

        expect(get('set-test')).toBe(undefined);

        // path 不同
        set('set-test3', '3', new Date(2099, 1, 1), '', '/');
        Cookie.remove('set-test3', '', '/');
        expect(get('set-test3')).toBe(undefined);
    });
});

