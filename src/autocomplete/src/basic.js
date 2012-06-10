/**
 * @fileOverview Provide basic api for AutoComplete.
 * @author yiminghe@gmail.com
 */
KISSY.add("autocomplete/basic", function (S, AutoComplete, AutoCompleteMenu, LocalDataSource, RemoteDataSource) {

    /**
     * Provide basic api for AutoComplete Component
     * @class
     * @name Basic
     * @memberOf AutoComplete
     * @extends AutoComplete
     */
    return AutoComplete.extend({

        initializer:function () {
            var self = this,
                dataSource,
                data;
            if (!self.get("dataSource")) {
                if (data = self.get("data")) {
                    dataSource = new LocalDataSource({
                        data:data,
                        dataSourceCfg:self.get("dataSourceCfg")
                    });
                } else {
                    dataSource = new RemoteDataSource({
                        xhrCfg:self.get("xhrCfg"),
                        dataSourceCfg:self.get("dataSourceCfg")
                    });
                }
                self.__set('dataSource', dataSource);
            }
        }
    }, {
        ATTRS:/**
         * @lends AutoComplete.Basic
         */
        {

            /**
             * Array of static data. data and xhrCfg are mutually exclusive.
             * @type Array
             */
            data:{},
            /**
             * xhrCfg IO configuration.same as {@link} IO. data and xhrCfg are mutually exclusive.
             * @type Object
             */
            xhrCfg:{
                value:{}
            },

            /**
             * Extra config for remote dataSource.<br/>
             * {String} dataSourceCfg.cache :
             * Whether server response data is cached<br/>
             * {Function} dataSource.parse :
             * Serve as a parse function to parse server
             * response to return a valid array of data for autoComplete.
             * Used for xhrCfg.<br/>
             * {String} dataSourceCfg.paramName :
             * Used as parameter name to send autoS=Complete input's value to server<br/>
             * {Boolean} dataSourceCfg.allowEmpty <br/>
             * static data:whether return all data when input is empty.default:true<br/>
             * whether send empty to server when input val is empty.default:false
             * @type Object
             */
            dataSourceCfg:{
                value:{}
            }
        }
    }, {
        "xclass":'autocomplete-basic',
        priority:30
    });

}, {
    requires:['./input', './menu', './localDataSource', './remoteDataSource']
});