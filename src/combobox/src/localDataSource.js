/**
 * @fileOverview Local dataSource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/LocalDataSource", function (S, Component) {

    /**
     * Local dataSource for comboBox
     * @memberOf ComboBox
     * @class
     * @param {Object} cfg config
     * @param {Array} cfg.data array of static data for comboBox
     * @param {Function} cfg.parse parse data
     */
    function LocalDataSource(cfg) {
        LocalDataSource.superclass.constructor.apply(this, arguments);
    }

    function parser(inputVal, data) {
        var ret = [],
            count = 0;
        if (!inputVal) {
            return data;
        }
        S.each(data, function (d) {
            if (d.indexOf(inputVal) != -1) {
                ret.push(d);
            }
            count++;
        });

        return ret;
    }

    LocalDataSource.ATTRS = {
        data:{
            value:[]
        },
        parse:{
            value:parser
        }
    };

    S.extend(LocalDataSource, S.Base, {
        /**
         * Datasource interface. How to get data for comboBox
         * @function
         * @name ComboBox.LocalDataSource#fetchData
         * @param {String} inputVal current active input's value
         * @param {Function} callback callback to notify comboBox when data is ready
         * @param {Object} context callback's execution context
         */
        fetchData:function (inputVal, callback, context) {
            var parse = this.get("parse"),
                data = this.get("data");
            data = parse(inputVal, data);
            callback.call(context, data);
        }
    });

    Component.Manager.setConstructorByXClass("combobox-LocalDataSource", LocalDataSource);

    return LocalDataSource;
}, {
    requires:['component']
});