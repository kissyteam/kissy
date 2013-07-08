/**
 * dirty hack for ie
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie', function (S, Dom) {
    return Dom;
}, {
    requires: [
        './ie/attr',
        './ie/create',
        './ie/insertion',
        './ie/style',
        './ie/traversal',
        './ie/input-selection'
    ]
});