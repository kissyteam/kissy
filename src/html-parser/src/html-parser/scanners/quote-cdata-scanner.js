/**
 * scanner cdata (script/textarea/style) with quote smart
 * @author yiminghe@gmail.com
 */
KISSY.add("html-parser/scanners/quote-cdata-scanner", function(S, CDataScanner, Dtd, SpecialScanners) {
    var ret = {
        scan:function(tag, lexer, opts) {
            opts = opts || {};
            opts.quoteSmart = 1;
            CDataScanner.scan(tag, lexer, opts);
            opts.quoteSmart = 0;
        }
    };
    // script/style
    for (var t in Dtd.$cdata) {
        SpecialScanners[t] = ret;
    }
    return ret;
}, {
    requires:["./cdata-scanner",'../dtd','./special-scanners']
});