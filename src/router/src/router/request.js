/**
 * request data structure. instance passed to router callbacks
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
    function Request(data) {
        S.mix(this, data);
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