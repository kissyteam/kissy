/**
 * TC for XTemplate
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    require('./error');
    require('./feature');
    if (S.UA.nodejs) {
        require('./node');
    }
    require('./sub-template');
    require('./extend');
});