/**
 * Provide basic api for AutoComplete
 */
KISSY.add("autocomplete/basic", function (S, AutoComplete, AutoCompleteMenu, LocalDataSource, RemoteDataSource) {

    /**
     * Provide basic api for AutoComplete Component
     * @class
     * @memberOf AutoComplete
     * @extends AutoComplete
     */
    function Basic() {
        var self = this,
            dataSource,
            autoCompleteMenu,
            data;

        Basic.superclass.constructor.apply(self, arguments);

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

    S.extend(Basic, AutoComplete, {

            __CLASS:"AutoComplete.Basic"

        },
        {
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
                 * maxItemCount max count of data to be shown
                 * @type Number
                 */
                maxItemCount:{},
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
                dataSourceCfg:{},

                /**
                 * Format function to return array of html from array of data.
                 * @type {Function}
                 */
                formatHtml:{},
                /**
                 * Format function to return array of text from array of data.
                 * @type {Function}
                 */
                formatText:{},

                /**
                 * Same as {@link AutoComplete#menuCfg}
                 * @type Object
                 */
                menuCfg:{}
            }
        });

    return Basic;

}, {
    requires:['./input', './menu', './localDataSource', './remoteDataSource']
});