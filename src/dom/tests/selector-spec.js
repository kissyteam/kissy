KISSY.use("dom", function(S, DOM) {
    S.get = DOM.get;
    S.query = DOM.query;
    describe("selector", function() {

        it("support #id", function() {

            expect(S.get("#test-selector").id).toBe("test-selector");
            expect(S.query("#test-selector").length).toBe(1);

            expect(S.get("#test-selector-xx")).toBe(null);
            expect(S.query("#test-selector-xx").length).toBe(0);

        });

        it("support tag", function() {
            expect(S.get("s").id).toBe("test-selector-tag");
            expect(S.query("s").length).toBe(2);

            expect(S.get("sub")).toBe(null);
            expect(S.query("sub").length).toBe(0);
        });
    });
});