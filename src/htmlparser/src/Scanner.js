/**
 *  declare and initiate sub scanners
 * @author yiminghe@gmail.com
 */
KISSY.add('htmlparser/Scanner', function(S, TagScanner, SpecialScanners) {
    return {
        getScanner:function(nodeName) {
            return SpecialScanners[nodeName] || TagScanner;
        }
    };
}, {
    requires:[
        './scanners/TagScanner',
        './scanners/SpecialScanners',
        './scanners/QuoteCdataScanner',
        './scanners/TextareaScanner'
    ]
})