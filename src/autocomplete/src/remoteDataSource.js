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
     * @param {Function} dataSourceCfg.parse Serve as a parse function to parse server
     * response to return a valid array of data for autoComplete.
     */
    function RemoteDataSource(xhrCfg, dataSourceCfg) {
        var self = this;
        xhrCfg.data = xhrCfg.data || {};
        self.xhrCfg = xhrCfg;
        self.dataSourceCfg = dataSourceCfg || {};
        self.io = null;
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
            dataSourceCfg = self.dataSourceCfg;
        if (self.io) {
            // abort previous request
            self.io.abort();
            self.io = null;
        }
        if (!inputVal) {
            return callback.call(context, []);
        }
        var xhrCfg = S.clone(self.xhrCfg);
        xhrCfg.data[dataSourceCfg['paramName']] = inputVal;
        xhrCfg.success = function (data) {
            if (dataSourceCfg.parse) {
                data = dataSourceCfg.parse(data);
            }
            setTimeout(function () {
                callback.call(context, data);
            }, 0);

        };
        self.io = IO(xhrCfg);
    };

    return RemoteDataSource;
}, {
    requires:['ajax']
});