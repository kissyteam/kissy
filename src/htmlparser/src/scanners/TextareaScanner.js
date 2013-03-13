/**
 * textarea data scanner
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/scanners/TextareaScanner", function(S, CDataScanner, SpecialScanners) {
    return SpecialScanners["textarea"] = {
        scan:function(tag, lexer, opts) {
            opts = opts || {};
            CDataScanner.scan(tag, lexer, opts);
        }
    };
}, {
    requires:["./CDataScanner","./SpecialScanners"]
});