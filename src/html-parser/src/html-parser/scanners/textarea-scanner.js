/**
 * @ignore
 * textarea data scanner
 * @author yiminghe@gmail.com
 */
KISSY.add("html-parser/scanners/textarea-scanner", function(S, CDataScanner, SpecialScanners) {
    return SpecialScanners["textarea"] = {
        scan:function(tag, lexer, opts) {
            opts = opts || {};
            CDataScanner.scan(tag, lexer, opts);
        }
    };
}, {
    requires:["./cdata-scanner","./special-scanners"]
});