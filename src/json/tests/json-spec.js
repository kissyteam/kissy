KISSY.use("json", function(S, JSON) {


    describe('json', function() {

        describe('stringify', function() {

            it('should convert an arbitrary value to a JSON string representation', function() {

                expect(JSON.stringify({'a': true})).toBe('{"a":true}');

                expect(JSON.stringify(true)).toBe('true');
                expect(JSON.stringify(null)).toBe('null');
                expect(JSON.stringify(undefined)).toBe(undefined);
                expect(JSON.stringify(NaN)).toBe('null');
            });
        });

        describe('parse', function() {

            it('should parse a JSON string to the native JavaScript representation', function() {

                expect(JSON.parse('{"test":1}')).toEqual({test: 1});
                expect(JSON.parse('{}')).toEqual({});
                expect(JSON.parse('\n{"test":1}')).toEqual({test: 1}); // 去除空白

                expect(JSON.parse()).toBeNull();
                expect(JSON.parse(null)).toBeNull();
                expect(JSON.parse('')).toBeNull();

                expect(JSON.parse('true')).toBe(true);
                expect(JSON.parse(true)).toBe(true);
                expect(JSON.parse('null')).toBe(null);

                expect(
                      function() {
                          JSON.parse('{a:1}');
                      }).toThrow();

            });
        });
    });
});
