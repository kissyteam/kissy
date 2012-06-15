/**
 * @fileOverview Local dataSource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/LocalDataSource", function (S, Component) {

    /**
     * @name LocalDataSource
     * @memberOf ComboBox
     * @extends Base
     * @class
     * Local dataSource for comboBox.
     * xclass: 'combobox-LocalDataSource'.
     */
    function LocalDataSource() {
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

    LocalDataSource.ATTRS =
    /**
     * @lends ComboBox.LocalDataSource#
     */
    {
        /**
         * array of static data for comboBox
         * @type Object[]
         */
        data:{
            value:[]
        },
        /**
         * parse data function.
         * Default: index of match.
         * @type Function
         */
        parse:{
            value:parser
        }
    };

    S.extend(LocalDataSource, S.Base,
        /**
         * @lends ComboBox.LocalDataSource#
         */
        {
        /**
         * Data source interface. How to get data for comboBox
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