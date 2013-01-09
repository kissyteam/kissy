/**
 *  textarea data scanner
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/scanners/TextareaScanner", function(S, CdataScanner, SpecialScanners) {
    return SpecialScanners["textarea"] = {
        scan:function(tag, lexer, opts) {
            opts = opts || {};
            CdataScanner.scan(tag, lexer, opts);
        }
    };
}, {
    requires:["./CdataScanner","./SpecialScanners"]
});