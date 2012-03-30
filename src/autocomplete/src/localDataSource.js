/**
 * local dataSource
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/localDataSource", function (S) {

    /**
     * Local dataSource for autoComplete
     * @memberOf AutoComplete
     * @class
     * @param {Array} data array of static data for autoComplete
     * @param {Object} dataSourceCfg dataSource config
     * @param {Function} dataSourceCfg.parse parse data
     * @param {Boolean} dataSourceCfg.allowEmpty whether return all data when input is empty.default:true
     */
    function LocalDataSource(data, dataSourceCfg) {
        this.data = data;
        this.dataSourceCfg = dataSourceCfg || {};
    }

    function parser(inputVal, data) {
        var ret = [],
            count = 0;

        S.each(data, function (d) {
            if (d.indexOf(inputVal) != -1) {
                ret.push(d);
            }
            count++;
        });

        return ret;
    }

    /**
     * Datasource interface. How to get data for autoComplete
     * @function
     * @name AutoComplete.LocalDataSource#fetchData
     * @param {String} inputVal current active input's value
     * @param {Function} callback callback to notify autoComplete when data is ready
     * @param {Object} context callback's execution context
     */
    LocalDataSource.prototype.fetchData = function (inputVal, callback, context) {
        var parse = this.dataSourceCfg.parse || parser,
            data = [],
            allowEmpty = this.dataSourceCfg.allowEmpty;
        if (allowEmpty === false && !inputVal) {
        } else if (!inputVal && allowEmpty !== false) {
            data = this.data;
        } else {
            data = parse(inputVal, this.data);
        }
        callback.call(context, data);
    };

    return LocalDataSource;
});