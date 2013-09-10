/**
 * @ignore
 * declare and initiate sub scanners
 * @author yiminghe@gmail.com
 */
KISSY.add('html-parser/scanner', function(S, TagScanner, SpecialScanners) {
    return {
        getScanner:function(nodeName) {
            return SpecialScanners[nodeName] || TagScanner;
        }
    };
}, {
    requires:[
        './scanners/tag-scanner',
        './scanners/special-scanners',
        './scanners/quote-cdata-scanner',
        './scanners/textarea-scanner'
    ]
});