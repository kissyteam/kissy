KISSY.add("htmlparser/scanners/TextareaScanner", function(S, CdataScanner) {
    return {
        scan:function(tag, lexer, opts) {
            opts = opts || {};
            CdataScanner.scan(tag, lexer, opts);
        }
    };
}, {
    requires:["./CdataScanner"]
});