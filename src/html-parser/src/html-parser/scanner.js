/**
 * @ignore
 * declare and initiate sub scanners
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var TagScanner = require('./scanners/tag-scanner');
    var SpecialScanners = require('./scanners/special-scanners');
    require('./scanners/quote-cdata-scanner');
    require('./scanners/textarea-scanner');

    return {
        getScanner: function (nodeName) {
            return SpecialScanners[nodeName] || TagScanner;
        }
    };
});