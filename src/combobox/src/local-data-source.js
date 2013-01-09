/**
 * @ignore
 *  Local dataSource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/LocalDataSource", function (S) {

    /**
     * Local dataSource for comboBox.
     * xclass: 'combobox-LocalDataSource'.
     * @extends KISSY.Base
     * @class KISSY.ComboBox.LocalDataSource
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

    LocalDataSource.ATTRS = {
        /**
         * array of static data for comboBox
         * @cfg {Object[]} data
         */
        /**
         * @ignore
         */
        data:{
            value:[]
        },
        /**
         * parse data function.
         * Defaults to: index of match.
         * @cfg {Function} parse
         */
        parse:{
            value:parser
        }
    };

    S.extend(LocalDataSource, S.Base,{
        /**
         * Data source interface. How to get data for comboBox.
         * @param {String} inputVal current active input's value
         * @param {Function} callback callback to notify comboBox when data is ready
         * @param {Object} context callback 's execution context
         */
        fetchData:function (inputVal, callback, context) {
            var parse = this.get("parse"),
                data = this.get("data");
            data = parse(inputVal, data);
            callback.call(context, data);
        }
    });

    return LocalDataSource;
}, {
    requires:['component/base']
});