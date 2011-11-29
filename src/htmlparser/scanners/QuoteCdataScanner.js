KISSY.add("htmlparser/scanners/QuoteCdataScanner", function(S, CdataScanner) {
    return {
        scan:function(tag, lexer, opts) {
            opts = opts || {};
            opts.quoteSmart = 1;
            CdataScanner.scan(tag, lexer, opts);
            opts.quoteSmart = 0;
        }
    };
}, {
    requires:["./CdataScanner"]
});