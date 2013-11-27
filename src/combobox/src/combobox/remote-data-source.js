/**
 * @ignore
 * Remote datasource for ComboBox
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var IO = require('io');
    var Attribute = require('attribute');
    /**
     * dataSource which wrap {@link KISSY.IO} utility.
     * @class KISSY.ComboBox.RemoteDataSource
     * @extends KISSY.Base
     */
    return Attribute.extend({
        /**
         * Data source interface. How to get data for comboBox
         * @param {String} inputVal current active input's value
         * @param {Function} callback callback to notify comboBox when data is ready
         * @param {Object} context callback 's execution context
         */
        fetchData: function (inputVal, callback, context) {
            var self = this,
                v,
                paramName = self.get('paramName'),
                parse = self.get('parse'),
                cache = self.get('cache'),
                allowEmpty = self.get('allowEmpty');
            self.caches = self.caches || {};
            if (self.io) {
                // abort previous request
                self.io.abort();
                self.io = null;
            }
            if (!inputVal && allowEmpty !== true) {
                return callback.call(context, []);
            }
            if (cache) {
                if ((v = self.caches[inputVal])) {
                    return callback.call(context, v);
                }
            }
            var xhrCfg = self.get('xhrCfg');
            xhrCfg.data = xhrCfg.data || {};
            xhrCfg.data[paramName] = inputVal;
            xhrCfg.success = function (data) {
                if (parse) {
                    data = parse(inputVal, data);
                }
                self.setInternal('data', data);
                if (cache) {
                    self.caches[inputVal] = data;
                }
                callback.call(context, data);
            };
            self.io = IO(xhrCfg);
            return undefined;
        }
    }, {
        ATTRS: {

            /**
             * Used as parameter name to send combobox input's value to server.
             * Defaults to: 'q'
             * @cfg  {String} paramName
             */
            /**
             * @ignore
             */
            paramName: {
                value: 'q'
            },
            /**
             * whether send empty to server when input val is empty.
             * Defaults to: false
             * @cfg {Boolean} allowEmpty
             */
            /**
             * @ignore
             */
            allowEmpty: {},
            /**
             * Whether server response data is cached.
             * Defaults to: false
             * @cfg {Boolean} cache
             */
            /**
             * @ignore
             */
            cache: {},
            /**
             * Serve as a parse function to parse server
             * response to return a valid array of data for comboBox.
             * @cfg {Function} parse
             */
            /**
             * @ignore
             */
            parse: {},
            /**
             * IO configuration.same as {@link KISSY.IO}
             * @cfg {Object} xhrCfg
             */
            /**
             * @ignore
             */
            xhrCfg: {
                value: {}
            }
        }
    });
});