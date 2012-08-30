KISSY.add("template/compiler", function (S, parser, ast) {

    parser.yy = ast;

    return {
        compile: function (tpl) {
            var root = parser.parse(tpl);
            return root;
        }
    };

}, {
    requires: ['./parser', './ast']
});