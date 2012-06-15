/**
 * @fileOverview Remote datasource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add("combobox/RemoteDataSource", function (S, IO, Component) {

    /**
     * @name RemoteDataSource
     * @class
     * dataSource which wrap {@link IO} utility.
     * xclass: 'combobox-RemoteDataSource'.
     * @extends Base
     * @memberOf ComboBox
     */
    function RemoteDataSource() {
        var self = this;
        RemoteDataSource.superclass.constructor.apply(self, arguments);
        self.io = null;
        self.caches = {};
    }

    RemoteDataSource.ATTRS =
    /**
     * @lends ComboBox.RemoteDataSource#
     */
    {
        /**
         * Used as parameter name to send combobox input's value to server
         * @type String
         */
        paramName:{},
        /**
         * whether send empty to server when input val is empty.default:false
         * @type Boolean
         */
        allowEmpty:{},
        /**
         * Whether server response data is cached.default:false
         * @type Boolean
         */
        cache:{},
        /**
         * Serve as a parse function to parse server
         * response to return a valid array of data for comboBox.
         * @type Function
         */
        parse:{},
        /**
         * IO configuration.same as {@link} IO
         * @type Object
         */
        xhrCfg:{
            value:{}
        }
    };

    S.extend(RemoteDataSource, S.Base,
        /**
         * @lends ComboBox.RemoteDataSource#
         */{
            /**
             * Data source interface. How to get data for comboBox
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