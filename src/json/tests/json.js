describe('json', function() {
    
    var JSON = KISSY.JSON;

    describe('stringify', function() {
        var stringify = JSON.stringify;

        it('should convert an arbitrary value to a JSON string representation', function() {
            expect(stringify({'a': true})).toBe('{"a":true}');
            expect(stringify(true)).toBe('true');
            expect(stringify(null)).toBe('null');
            expect(stringify(undefined)).toBe(undefined);
            expect(stringify(NaN)).toBe('null');
        });
    });

    describe('parse', function() {
        var parse = JSON.parse;

        it('should parse a JSON string to the native JavaScript representation', function() {
            expect(parse('{"a":true}').a).toBe(true);
            expect(parse('true')).toBe(true);
            expect(parse(true)).toBe(true);
            expect(parse(null)).toBe(null);
            expect(parse('null')).toBe(null);
        });
    });
});
