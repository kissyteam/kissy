KISSY.add(function(S,Cookie) {
    describe('cookie', function() {

        if (location.protocol === 'file:') {
            return;
        }

        describe('get', function() {
            document.cookie = '_ks_test_1=1';
            document.cookie = '_ks_test_2=';
            document.cookie = '_ks_test_3=';

            it('should return the cookie value for the given name', function() {
                expect(Cookie.get('_ks_test_1')).toBe('1');
                expect(Cookie.get('_ks_test_2')).toBe('');
                expect(Cookie.get('_ks_test_3')).toBe('');

            });

            it('should return undefined for non-existing name', function() {

                expect(Cookie.get('_ks_test_none')).toBeUndefined();
                expect(Cookie.get(true)).toBeUndefined();
                expect(Cookie.get({})).toBeUndefined();
                expect(Cookie.get(null)).toBeUndefined();

            });
        });

        describe('set', function() {

            it('should set a cookie with a given name and value', function() {

                Cookie.set('_ks_test_11', 'xx');
                expect(Cookie.get('_ks_test_11')).toBe('xx');

                Cookie.set('_ks_test_12', 'xx', 0);
                expect(Cookie.get('_ks_test_12')).toBeUndefined();

                Cookie.set('_ks_test_13', '1', new Date(2099, 1, 1), '', '/');
                Cookie.set('_ks_test_13', '2', new Date(2099, 1, 1), '', '/');
                expect(Cookie.get('_ks_test_13')).toBe('2');

                Cookie.remove('_ks_test_14');
                Cookie.set('_ks_test_14', '4', 1, document.domain, '/', true);
                expect(Cookie.get('_ks_test_14')).toBeUndefined();
            });
        });

        describe('remove', function() {

            it('should remove a cookie from the machine', function() {

                Cookie.set('_ks_test_21', 'xx');
                Cookie.remove('_ks_test_21');
                expect(Cookie.get('_ks_test_21')).toBeUndefined();

                Cookie.set('_ks_test_22', 'xx', new Date(2099, 1, 1), '', '/');
                Cookie.remove('_ks_test_22', '', '/');
                expect(Cookie.get('_ks_test_22')).toBeUndefined();

            });
        });
    });
},{
    requires:['cookie']
});