/**
 * simple selector test
 * @author lifesinger@gmail.com,yiminghe@gmail.com
 */
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

        it("support .cls", function() {
            expect(S.get(".test-selector").id).toBe("test-selector-1");
            expect(S.query(".test-selector").length).toBe(4);
        });

        it("support #id tag", function() {
            expect(S.get("#test-selector s").id).toBe("test-selector-tag");
            expect(S.get("#test-selector-2 s").id).toBe("");

            expect(S.query("#test-selector s").length).toBe(2);
            expect(S.query("#test-selector-2 s").length).toBe(1);
        });


        it("support #id .cls", function() {
            expect(S.get("#test-selector-1 .test-selector").tagName.toLowerCase()).toBe("div");
            expect(S.get("#test-selector-2 .test-selector").tagName.toLowerCase()).toBe("p");
            expect(S.query("#test-selector-1 .test-selector").length).toBe(1);
            expect(S.query("#test-selector .test-selector").length).toBe(4);
        });

        it("support tag.cls", function() {
            expect(S.get("div.test-selector").id).toBe("test-selector-1");
            expect(S.query("div.test-selector").length).toBe(3);
            expect(S.get("p.test-selector").tagName.toLowerCase()).toBe("p");
            expect(S.query("p.test-selector").length).toBe(1);
        });


        it("support #id tag.cls", function() {
            expect(S.get("#test-selector-1 p.test-selector")).toBe(null);
            expect(S.get("#test-selector-2 p.test-selector").tagName.toLowerCase()).toBe("p");
        });
    });
});