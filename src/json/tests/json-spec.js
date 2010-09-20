describe("JSON", function() {

    var JSON = KISSY.JSON;

    it("should stringify input properly", function() {
        var stringify = JSON.stringify;

        expect(stringify({'a': true})).toBe('{"a":true}');
        expect(stringify(true)).toBe('true');
        expect(stringify(null)).toBe('null');
        expect(stringify(undefined)).toBe(undefined);
        expect(stringify(NaN)).toBe('null');
    });


    it("should parse input properly", function() {
        var parse = JSON.parse;

        expect(parse('{"a":true}').a).toBe(true);
        expect(parse('true')).toBe(true);
        expect(parse(true)).toBe(true);
        expect(parse(null)).toBe(null);
        expect(parse('null')).toBe(null);
    });
});
