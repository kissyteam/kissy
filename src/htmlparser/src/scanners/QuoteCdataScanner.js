/**
 *  scanner cdata (script/textarea/style) with quote smart
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/scanners/QuoteCdataScanner", function(S, CdataScanner, Dtd, SpecialScanners) {
    var ret = {
        scan:function(tag, lexer, opts) {
            opts = opts || {};
            opts.quoteSmart = 1;
            CdataScanner.scan(tag, lexer, opts);
            opts.quoteSmart = 0;
        }
    };
    // script/style
    for (var t in Dtd.$cdata) {
        SpecialScanners[t] = ret;
    }
    return ret;
}, {
    requires:["./CdataScanner",'../dtd','./SpecialScanners']
});