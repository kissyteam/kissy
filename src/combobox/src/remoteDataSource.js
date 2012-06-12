/**
 * @fileOverview Remote datasource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/RemoteDataSource", function (S, IO, Component) {

    /**
     * dataSource which wrap {@link IO} utility.
     * @class
     * @memberOf ComboBox
     * @param {Object} cfg configs
     * @param {Object} cfg.xhrCfg IO configuration.same as {@link} IO
     * @param {String} cfg.paramName
     * Used as parameter name to send autoS=Complete input's value to server
     * @param {String} cfg.cache Whether server response data is cached
     * @param {Boolean} cfg.allowEmpty whether send empty to server when input val is empty.default:false
     * @param {Function} cfg.parse Serve as a parse function to parse server
     * response to return a valid array of data for comboBox.
     */
    function RemoteDataSource(cfg) {
        var self = this;
        RemoteDataSource.superclass.constructor.apply(self, arguments);
        self.io = null;
        self.caches = {};
    }

    RemoteDataSource.ATTRS = {
        paramName:{},
        allowEmpty:{},
        cache:{},
        parse:{},
        xhrCfg:{
            value:{}
        }
    };

    S.extend(RemoteDataSource, S.Base, {
        /**
         * Datasource interface. How to get data for comboBox
         * @function
         * @name ComboBox.RemoteDataSource#fetchData
         * @param {String} inputVal current active input's value
         * @param {Function} callback callback to notify comboBox when data is ready
         * @param {Object} context callback 's execution context
         */
        fetchData:function (inputVal, callback, context) {
            var self = this,
                v,
                paramName = self.get("paramName"),
                parse = self.get("parse"),
                cache = self.get("cache"),
                allowEmpty = self.get("allowEmpty");
            if (self.io) {
                // abort previous request
                self.io.abort();
                self.io = null;
            }
            if (!inputVal && allowEmpty !== true) {
                return callback.call(context, []);
            }
            if (cache) {
                if (v = self.caches[inputVal]) {
                    return callback.call(context, v);
                }
            }
            var xhrCfg = self.get("xhrCfg");
            xhrCfg.data = xhrCfg.data || {};
            xhrCfg.data[paramName] = inputVal;
            xhrCfg.success = function (data) {
                if (parse) {
                    data = parse(inputVal, data);
                }
                self.__set("data", data);
                if (cache) {
                    self.caches[inputVal] = data;
                }
                callback.call(context, data);
            };
            self.io = IO(xhrCfg);
        }
    });

    Component.Manager.setConstructorByXClass("combobox-RemoteDataSource", RemoteDataSource);

    return RemoteDataSource;
}, {
    requires:['ajax', 'component']
});