KISSY.add("htmlparser/scanners/TextareaScanner", function(S, CdataScanner) {
    return {
        scan:function(tag, lexer, stack) {
            return CdataScanner.scan(tag, lexer, stack, false);
        }
    };
}, {
    requires:["./CdataScanner"]
});