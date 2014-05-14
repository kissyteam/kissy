/**
 * request data structure. instance passed to router callbacks
 * @author yiminghe@gmail.com
 */
KISSY.add(function () {
    function Request(data) {
        for (var d in data) {
            this[d] = data[d];
        }
    }

    Request.prototype = {
        param: function (name) {
            var self = this;
            if (name in self.params) {
                return self.params[name];
            }
            return self.query[name];
        }
    };
    return Request;
});