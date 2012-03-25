/**
 * local datasource
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/localdatasource", function (S) {
    function LocalData(data, maxItemCount) {
        this.data = data;
        this.maxItemCount = maxItemCount || 10;
    }

    LocalData.prototype.fetchData = function (inputVal, callback, context) {
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
        }
        callback.call(context, data);
    };

    return LocalData;
});