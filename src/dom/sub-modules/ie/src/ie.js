/**
 * @ignore
 * dirty hack for ie
 * @author yiminghe@gmail.com
 */
KISSY.add(function () {
    var module = this;
    module.require('./ie/create');
    module.require('./ie/insertion');
    module.require('./ie/style');
    module.require('./ie/traversal');
    module.require('./ie/transform');
    module.require('./ie/input-selection');
    return module.require('./ie/attr');
});