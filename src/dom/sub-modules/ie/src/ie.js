/**
 * @ignore
 * dirty hack for ie
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    require('./ie/create');
    require('./ie/insertion');
    require('./ie/style');
    require('./ie/traversal');
    require('./ie/transform');
    require('./ie/input-selection');
    return require('./ie/attr');
});