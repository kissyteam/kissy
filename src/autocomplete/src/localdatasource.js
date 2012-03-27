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
     * @param {Number} maxItemCount max count of data to be shown
     */
    function LocalDataSource(data, maxItemCount) {
        this.data = data;
        this.maxItemCount = maxItemCount || 10;
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
        var data = [], count = 0, maxItemCount = this.maxItemCount;
        if (inputVal) {
            S.each(this.data, function (d) {
                if (d.indexOf(inputVal) != -1) {
                    data.push(d);
                }
                count++;
                if (count == maxItemCount) {
                    return false;
                }
            })
        } else {
            // return all static data
            data = this.data;
        }
        callback.call(context, data);
    };

    return LocalData;
});