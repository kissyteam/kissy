/**
 * dirty hack for ie
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie', function (S, DOM) {
    return DOM;
}, {
    requires: [
        './ie/attr',
        './ie/create',
        './ie/insertion',
        './ie/selector',
        './ie/style',
        './ie/traversal',
        './ie/input-selection'
    ]
});
