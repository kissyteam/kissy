/**
 * default sync for model
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/sync", function(S, io) {
    var methodMap = {
        'create': 'POST',
        'update': 'POST', //'PUT'
        'delete': 'POST', //'DELETE'
        'read'  : 'GET'
    };

    function sync(self, method, options) {
        var type = methodMap[method],
            ioParam = S.merge({
                type:type,
                dataType:'json'
            }, options);

        var data = ioParam.data = ioParam.data || {};
        data['_method'] = method;

        if (!ioParam.url) {
            ioParam.url = S.isString(self.get("url")) ?
                self.get("url") :
                self.get("url").call(self);
        }

        if (method == 'create' || method == 'update') {
            data.model = self.toJSON();
        }

        return io(ioParam);
    }

    return sync;
}, {
    requires:['ajax']
});