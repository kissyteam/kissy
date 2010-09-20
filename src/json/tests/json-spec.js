
describe("JSON", function() {

    var JSON = KISSY.JSON;

    describe("JSON.stringify", function() {
        var stringify = JSON.stringify;

        it("should stringify input properly", function() {

            expect(stringify({'a': true})).toBe('{"a":true}');

            expect(stringify(true)).toBe('true');
            expect(stringify(null)).toBe('null');
            expect(stringify(undefined)).toBe(undefined);
            expect(stringify(NaN)).toBe('null');
        });
    });
    
    describe("JSON.parse", function() {
        var parse = JSON.parse;

        it("should parse input properly", function() {

            expect(parse('{"a":true}').a).toBe(true);

            expect(parse('true')).toBe(true);
            expect(parse(true)).toBe(true);

            expect(parse(null)).toBe(null);
            expect(parse('null')).toBe(null);
        });
    });
});
