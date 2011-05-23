KISSY.use("dom,node", function(S, DOM, Node) {
    S.get = DOM.get;
    S.query = DOM.query;
    //DOM 已经测试通过，通过 DOM 测 Node
    describe("node", function() {

        it("should create correctly", function() {

            var n = new Node("<div id='testDiv'>ok</div>").appendTo(document.body);
            expect(S.get("#testDiv")).not.toBe(null);
            expect(S.get("#testDiv2")).toBe(null);
            n.remove();

        });


    });

});