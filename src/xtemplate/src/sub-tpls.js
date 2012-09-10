/**
 * sub templates holder
 * @author yiminghe@gmail.com
 */
KISSY.add('xtemplate/sub-tpls', function (S, XTemplate) {

    var subTpls = {};

    XTemplate.subTpls = subTpls;

    XTemplate.addSubTpl = function (tplName, def) {
        subTpls[tplName] = def;
    };

    return subTpls;

}, {
    requires: ['./base']
});