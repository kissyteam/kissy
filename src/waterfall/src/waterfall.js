/**
 *  waterfall
 * @author yiminghe@gmail.com
 */
KISSY.add("waterfall", function (S, Waterfall, Loader) {
    Waterfall.Loader = Loader;
    return Waterfall;
}, {
    requires:['waterfall/base', 'waterfall/loader']
});