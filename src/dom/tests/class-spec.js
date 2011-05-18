KISSY.use("dom", function(S, DOM) {
    S.get = DOM.get;
    S.query = DOM.query;
    describe("class", function() {

        var foo = S.get('#foo-class'),
            a = S.get('#foo-class a'),
            input = S.get('#foo-class input'),
            radio = S.get('#test-radio-class'),
            radio2 = S.get('#test-radio2-class'),
            button = S.get('#foo-class button'),
            label = S.get('#foo-class label'),
            table = S.get('#test-table'),
            td = S.get('#test-table td'),
            select = S.get('#test-select'),
            select2 = S.get('#test-select2'),
            select3 = S.get('#test-select3'),
            opt = S.get('#test-opt'),
            div = S.get('#test-div'),
            opt2 = S.query('#test-select option')[1],
            area = S.get('#foo textarea');

        describe("hasClass works", function() {

        });

    });
});