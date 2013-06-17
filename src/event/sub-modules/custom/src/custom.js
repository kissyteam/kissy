/**
 * @ignore
 * custom facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom', function (S, Target) {

    return {
        Target: Target
    };

}, {
    requires: ['./custom/target']
});