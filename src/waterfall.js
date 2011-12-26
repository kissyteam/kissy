/**
 * @fileOverview waterfall
 * @author yiminghe@gmail.com
 */
KISSY.add("waterfall", function(S, Intervein, Loader) {
    Intervein.Loader = Loader;
    return Intervein;
}, {
    requires:['waterfall/base','waterfall/loader']
});