/**
 * default sync for model
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc/sync", function (S, io, Json) {
    var methodMap = {
        'create': 'POST',
        'update': 'POST', //'PUT'
        'delete': 'POST', //'DELETE'
        'read': 'GET'
    };

    /**
     * Default sync mechanism.
     * Sync data with server using {@link IO} .
     * @member MVC
     * @param {MVC.Model|MVC.Collection} self Model or Collection instance to sync with server.
     * @param {String} method Create or update or delete or read.
     * @param {Object} options IO options
     */
    function sync(self, method, options) {
        var type = methodMap[method],
            ioParam = S.merge({
                type: type,
                dataType: 'json'
            }, options),
            data,
            url;

        data = ioParam.data = ioParam.data || {};
        data['_method'] = method;

        if (!ioParam.url) {
            url = self.get("url");
            ioParam.url = (typeof url == 'string') ?
                url :
                url.call(self);
        }

        if (method == 'create' || method == 'update') {
            data.model = Json.stringify(self.toJSON());
        }

        return io(ioParam);
    }

    return sync;
}, {
    requires: ['io', 'json']
});