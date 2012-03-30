/**
 * remote datasource
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/remoteDataSource", function (S, IO) {

    /**
     * dataSource which wrap {@link IO} utility.
     * @class
     * @memberOf AutoComplete
     * @param {Object} xhrCfg IO configuration.same as {@link} IO
     * @param {Object} dataSourceCfg dataSource configs
     * @param {String} dataSourceCfg.paramName
     * Used as parameter name to send autoS=Complete input's value to server
     * @param {String} dataSourceCfg.cache Whether server response data is cached
     * @param {Boolean} dataSourceCfg.allowEmpty whether send empty to server when input val is empty.default:false
     * @param {Function} dataSourceCfg.parse Serve as a parse function to parse server
     * response to return a valid array of data for autoComplete.
     */
    function RemoteDataSource(xhrCfg, dataSourceCfg) {
        var self = this;
        xhrCfg.data = xhrCfg.data || {};
        self.xhrCfg = xhrCfg;
        self.dataSourceCfg = dataSourceCfg || {};
        self.io = null;
        self.caches = {};
    }


    /**
     * Datasource interface. How to get data for autoComplete
     * @function
     * @name AutoComplete.RemoteDataSource#fetchData
     * @param {String} inputVal current active input's value
     * @param {Function} callback callback to notify autoComplete when data is ready
     * @param {Object} context callback's execution context
     */
    RemoteDataSource.prototype.fetchData = function (inputVal, callback, context) {
        var self = this,
            v,
            dataSourceCfg = self.dataSourceCfg;
        if (self.io) {
            // abort previous request
            self.io.abort();
            self.io = null;
        }
        if (!inputVal && dataSourceCfg.allowEmpty!==true) {
            return callback.call(context, []);
        }
        if (dataSourceCfg.cache) {
            if (v = self.caches[inputVal]) {
                return callback.call(context, v);
            }
        }
        var xhrCfg = S.clone(self.xhrCfg);
        xhrCfg.data[dataSourceCfg['paramName']] = inputVal;
        xhrCfg.success = function (data) {
            if (dataSourceCfg.parse) {
                data = dataSourceCfg.parse(inputVal, data);
            }
            if (dataSourceCfg.cache) {
                self.caches[inputVal] = data;
            }
            callback.call(context, data);
        };
        self.io = IO(xhrCfg);
    };

    return RemoteDataSource;
}, {
    requires:['ajax']
});