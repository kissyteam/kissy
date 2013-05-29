/**
 * include command
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('xtemplate/runtime/include-command', function (S, XTemplateRuntime) {

    var include = {

        invokeEngine: function (tpl, scopes, option) {
            return new XTemplateRuntime(tpl, S.merge(option)).render(scopes, true);
        },

        include: function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                S[option.silent ? 'log' : 'error']('include must has one param');
                return '';
            }
            var param0 = params[0], tpl;
            var subTpls = option.subTpls;
            if (!(tpl = subTpls[param0])) {
                S[option.silent ? 'log' : 'error']('does not include sub template "' + param0 + '"');
                return '';
            }
            // template file name
            option.name = param0;
            return include.invokeEngine(tpl, scopes, option)
        }

    };

    return include;

}, {
    requires: ['./base']
});