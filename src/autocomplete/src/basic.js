/**
 * Provide basic api for AutoComplete
 */
KISSY.add("autocomplete/basic", function (S, UIBase, AutoComplete, AutoCompleteMenu, LocalDataSource, RemoteDataSource) {

    /**
     * Provide basic api for AutoComplete Component
     * @class
     * @name Basic
     * @memberOf AutoComplete
     * @extends AutoComplete
     */
    return UIBase.create(AutoComplete, [], {

        __CLASS:"AutoComplete.Basic",

        initializer:function () {
            var self = this,
                dataSource,
                autoCompleteMenu,
                data;
            if (!self.get("dataSource")) {
                if (data = self.get("data")) {
                    dataSource = new LocalDataSource(data);
                } else {
                    dataSource = new RemoteDataSource(self.get("xhrCfg"),
                        self.get("dataSourceCfg"));
                }
                self.__set('dataSource', dataSource);
            }

            if (!self.get("menu")) {
                autoCompleteMenu = new AutoCompleteMenu({
                    prefixCls:self.get("prefixCls")
                });
                self.__set("menu", autoCompleteMenu);
            }
        }
    }, {
        ATTRS:/**
         * @lends AutoComplete.Basic
         */
        {

            /**
             * Whether destroy menu when this destroys.Default true
             * @type Boolean
             */
            destroyMenu:{
                value:true
            },

            /**
             * Array of static data. data and xhrCfg are mutually exclusive.
             * @type Array
             */
            data:{},
            /**
             * xhrCfg IO configuration.same as {@link} IO. data and xhrCfg are mutually exclusive.
             * @type Object
             */
            xhrCfg:{},

            /**
             * Extra config for remote dataSource.<br/>
             * {String} dataSourceCfg.cache :
             * Whether server response data is cached<br/>
             * {Function} dataSource.parse :
             * Serve as a parse function to parse server
             * response to return a valid array of data for autoComplete.
             * Used for xhrCfg.<br/>
             * {String} dataSourceCfg.paramName :
             * Used as parameter name to send autoS=Complete input's value to server
             * @type Object
             */
            dataSourceCfg:{}
        }
    });

}, {
    requires:['uibase', './input', './menu', './localDataSource', './remoteDataSource']
});