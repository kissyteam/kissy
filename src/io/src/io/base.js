/**
 * @ignore
 * a scalable client io framework
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var CustomEvent = require('event/custom'),
        Promise = require('promise');
    var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget)$/,
        rspace = /\s+/,
        mirror = function (s) {
            return s;
        },
        rnoContent = /^(?:GET|HEAD)$/,
        win = S.Env.host,
        location = win.location || {},
        simulatedLocation = /**
         @type KISSY.Uri
         @ignore*/new S.Uri(location.href),
        isLocal = simulatedLocation && rlocalProtocol.test(simulatedLocation.getScheme()),
        transports = {},
        defaultConfig = {
            type: 'GET',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            async: true,
            serializeArray: true,
            processData: true,
            accepts: {
                xml: 'application/xml, text/xml',
                html: 'text/html',
                text: 'text/plain',
                json: 'application/json, text/javascript',
                '*': '*/*'
            },
            converters: {
                text: {
                    json: S.parseJson,
                    html: mirror,
                    text: mirror,
                    xml: S.parseXML
                }
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            }
        };

    defaultConfig.converters.html = defaultConfig.converters.text;

    function setUpConfig(c) {

        // deep mix,exclude context!
        var context = c.context;
        delete c.context;
        c = S.mix(S.clone(defaultConfig), c, {
            deep: true
        });
        c.context = context || c;

        var data, uri,
            type = c.type,
            dataType = c.dataType;

        uri = c.uri = simulatedLocation.resolve(c.url);

        // see method _getUrlForSend
        c.uri.setQuery('');

        if (!('crossDomain' in c)) {
            c.crossDomain = !c.uri.isSameOriginAs(simulatedLocation);
        }

        type = c.type = type.toUpperCase();
        c.hasContent = !rnoContent.test(type);

        if (c.processData && (data = c.data) && typeof data !== 'string') {
            // normalize to string
            c.data = S.param(data, undefined, undefined, c.serializeArray);
        }

        // 数据类型处理链，一步步将前面的数据类型转化成最后一个
        dataType = c.dataType = S.trim(dataType || '*').split(rspace);

        if (!('cache' in c) && S.inArray(dataType[0], ['script', 'jsonp'])) {
            c.cache = false;
        }

        if (!c.hasContent) {
            if (c.data) {
                uri.query.add(S.unparam(c.data));
            }
            if (c.cache === false) {
                uri.query.set('_ksTS', (S.now() + '_' + S.guid()));
            }
        }
        return c;
    }

    /**
     * Return a io object and send request by config.
     *
     * @class KISSY.IO
     * @extends KISSY.Promise
     *
     * @cfg {String} url
     * request destination
     *
     * @cfg {String} type request type.
     * eg: 'get','post'
     * Default to: 'get'
     *
     * @cfg {String} contentType
     * Default to: 'application/x-www-form-urlencoded; charset=UTF-8'
     * Data will always be transmitted to the server using UTF-8 charset
     *
     * @cfg {Object} accepts
     * Default to: depends on DataType.
     * The content type sent in request header that tells the server
     * what kind of response it will accept in return.
     * It is recommended to do so once in the {@link KISSY.IO#method-setupConfig}
     *
     * @cfg {Boolean} async
     * Default to: true
     * whether request is sent asynchronously
     *
     * @cfg {Boolean} cache
     * Default to: true ,false for dataType 'script' and 'jsonp'
     * if set false,will append _ksTs=Date.now() to url automatically
     *
     * @cfg {Object} contents
     * a name-regexp map to determine request data's dataType
     * It is recommended to do so once in the {@link KISSY.IO#method-setupConfig}
     *
     * @cfg {Object} context
     * specify the context of this request 's callback (success,error,complete)
     *
     * @cfg {Object} converters
     * Default to: {text:{json:Json.parse,html:mirror,text:mirror,xml:KISSY.parseXML}}
     * specified how to transform one dataType to another dataType
     * It is recommended to do so once in the {@link KISSY.IO#method-setupConfig}
     *
     * @cfg {Boolean} crossDomain
     * Default to: false for same-domain request,true for cross-domain request
     * if server-side jsonp redirect to another domain, you should set this to true.
     * if you want use script for jsonp for same domain request, you should set this to true.
     *
     * @cfg {Object} data
     * Data sent to server.if processData is true,data will be serialized to String type.
     * if value if an Array, serialization will be based on serializeArray.
     *
     * @cfg {String} dataType
     * return data as a specified type
     * Default to: Based on server contentType header
     * 'xml' : a XML document
     * 'text'/'html': raw server data
     * 'script': evaluate the return data as script
     * 'json': parse the return data as json and return the result as final data
     * 'jsonp': load json data via jsonp
     *
     * @cfg {Object} headers
     * additional name-value header to send along with this request.
     *
     * @cfg {String} jsonp
     * Default to: 'callback'
     * Override the callback function name in a jsonp request. eg:
     * set 'callback2' , then jsonp url will append  'callback2=?'.
     *
     * @cfg {String} jsonpCallback
     * Specify the callback function name for a jsonp request.
     * set this value will replace the auto generated function name.
     * eg:
     * set 'customCall' , then jsonp url will append 'callback=customCall'
     *
     * @cfg {String} mimeType
     * override xhr 's mime type
     *
     * @cfg {String} ifModified
     * whether enter if modified mode.
     * Defaults to false.
     *
     * @cfg {Boolean} processData
     * Default to: true
     * whether data will be serialized as String
     *
     * @cfg {String} scriptCharset
     * only for dataType 'jsonp' and 'script' and 'get' type.
     * force the script to certain charset.
     *
     * @cfg {Function} beforeSend
     * beforeSend(io,config)
     * callback function called before the request is sent.this function has 2 arguments
     *
     * 1. current KISSY io object
     *
     * 2. current io config
     *
     * note: can be used for add progress event listener for native xhr's upload attribute
     * see <a href='http://www.w3.org/TR/XMLHttpRequest/#event-xhr-progress'>XMLHttpRequest2</a>
     *
     * @cfg {Function} success
     * success(data,textStatus,xhr)
     * callback function called if the request succeeds.this function has 3 arguments
     *
     * 1. data returned from this request with type specified by dataType
     *
     * 2. status of this request with type String
     *
     * 3. io object of this request , for details {@link KISSY.IO}
     *
     * @cfg {Function} error
     * success(data,textStatus,xhr)
     * callback function called if the request occurs error.this function has 3 arguments
     *
     * 1. null value
     *
     * 2. status of this request with type String,such as 'timeout','Not Found','parsererror:...'
     *
     * 3. io object of this request , for details {@link KISSY.IO}
     *
     * @cfg {Function} complete
     * success(data,textStatus,xhr)
     * callback function called if the request finished(success or error).this function has 3 arguments
     *
     * 1. null value if error occurs or data returned from server
     *
     * 2. status of this request with type String,such as success:'ok',
     * error:'timeout','Not Found','parsererror:...'
     *
     * 3. io object of this request , for details {@link KISSY.IO}
     *
     * @cfg {Number} timeout
     * Set a timeout(in seconds) for this request.if will call error when timeout
     *
     * @cfg {Boolean} serializeArray
     * whether add [] to data's name when data's value is array in serialization
     *
     * @cfg {Object} xhrFields
     * name-value to set to native xhr.set as xhrFields:{withCredentials:true}
     * note: withCredentials defaults to true.
     *
     * @cfg {String} username
     * a username tobe used in response to HTTP access authentication request
     *
     * @cfg {String} password
     * a password tobe used in response to HTTP access authentication request
     *
     * @cfg {Object} xdr
     * cross domain request config object, contains sub config:
     *
     * xdr.src
     * Default to: KISSY 's flash url
     * flash sender url
     *
     * xdr.use
     * if set to 'use', it will always use flash for cross domain request even in chrome/firefox
     *
     * xdr.subDomain
     * cross sub domain request config object
     *
     * xdr.subDomain.proxy
     * proxy page,eg:     *
     * a.t.cn/a.htm send request to b.t.cn/b.htm:
     *
     * 1. a.htm set <code> document.domain='t.cn' </code>
     *
     * 2. b.t.cn/proxy.htm 's content is <code> &lt;script>document.domain='t.cn'&lt;/script> </code>
     *
     * 3. in a.htm , call <code> IO({xdr:{subDomain:{proxy:'/proxy.htm'}}}) </code>
     *
     */
    function IO(c) {
        var self = this;

        if (!(self instanceof IO)) {
            return new IO(c);
        }

        Promise.call(self);

        c = setUpConfig(c);

        S.mix(self, {
            // 结构化数据，如 json
            responseData: null,
            /**
             * config of current IO instance.
             * @member KISSY.IO
             * @property config
             * @type Object
             */
            config: c || {},
            timeoutTimer: null,

            /**
             * String typed data returned from server
             * @type String
             */
            responseText: null,
            /**
             * xml typed data returned from server
             * @type String
             */
            responseXML: null,
            responseHeadersString: '',
            responseHeaders: null,
            requestHeaders: {},
            /**
             * readyState of current request
             * 0: initialized
             * 1: send
             * 4: completed
             * @type Number
             */
            readyState: 0,
            state: 0,
            /**
             * HTTP statusText of current request
             * @type String
             */
            statusText: null,
            /**
             * HTTP Status Code of current request
             * eg:
             * 200: ok
             * 404: Not Found
             * 500: Server Error
             * @type String
             */
            status: 0,
            transport: null
        });

        Promise.Defer(self);

        var TransportConstructor,
            transport;

        /**
         * fired before generating request object
         * @event start
         * @member KISSY.IO
         * @static
         * @param {KISSY.Event.CustomEvent.Object} e
         * @param {KISSY.IO} e.io current io
         */
        IO.fire('start', {
            // 兼容
            ajaxConfig: c,
            io: self
        });

        TransportConstructor = transports[c.dataType[0]] || transports['*'];
        transport = new TransportConstructor(self);

        self.transport = transport;

        if (c.contentType) {
            self.setRequestHeader('Content-Type', c.contentType);
        }

        var dataType = c.dataType[0],
            i,
            timeout = c.timeout,
            context = c.context,
            headers = c.headers,
            accepts = c.accepts;

        // Set the Accepts header for the server, depending on the dataType
        self.setRequestHeader(
            'Accept',
                dataType && accepts[dataType] ?
                accepts[ dataType ] + (dataType === '*' ? '' : ', */*; q=0.01'  ) :
                accepts[ '*' ]
        );

        // Check for headers option
        for (i in headers) {
            self.setRequestHeader(i, headers[ i ]);
        }


        // allow setup native listener
        // such as xhr.upload.addEventListener('progress', function (ev) {})
        if (c.beforeSend && ( c.beforeSend.call(context, self, c) === false)) {
            return self;
        }

        self.readyState = 1;

        /**
         * fired before sending request
         * @event send
         * @member KISSY.IO
         * @static
         * @param {KISSY.Event.CustomEvent.Object} e
         * @param {KISSY.IO} e.io current io
         */

        IO.fire('send', {
            // 兼容
            ajaxConfig: c,
            io: self
        });

        // Timeout
        if (c.async && timeout > 0) {
            self.timeoutTimer = setTimeout(function () {
                self.abort('timeout');
            }, timeout * 1000);
        }

        try {
            // flag as sending
            self.state = 1;
            transport.send();
        } catch (e) {
            // Propagate exception as error if not done
            if (self.state < 2) {
                S.log(e.stack || e, 'error');
                if ('@DEBUG@') {
                    setTimeout(function () {
                        throw e;
                    }, 0);
                }
                self._ioReady(-1, e.message || 'send error');
                // Simply rethrow otherwise
            } else {
                S.error(e);
            }
        }

        return self;
    }

    S.mix(IO, CustomEvent.Target);

    S.mix(IO, {
        /**
         * whether current application is a local application
         * (protocal is file://,widget://,about://)
         * @type {Boolean}
         * @member KISSY.IO
         * @static
         */
        isLocal: isLocal,
        /**
         * name-value object that set default config value for io class
         * @param {Object} setting
         * @member KISSY.IO
         * @static
         */
        setupConfig: function (setting) {
            S.mix(defaultConfig, setting, {
                deep: true
            });
        },
        /**
         * @private
         * @member KISSY.IO
         * @static
         */
        'setupTransport': function (name, fn) {
            transports[name] = fn;
        },
        /**
         * @private
         * @member KISSY.IO
         * @static
         */
        'getTransport': function (name) {
            return transports[name];
        },
        /**
         * get default config value for io request
         * @return {Object}
         * @member KISSY.IO
         * @static
         */
        getConfig: function () {
            return defaultConfig;
        }
    });

    return IO;
});

/*

 // !TODO
 // 去除 event/custom 依赖，用户不载入就不能监听
 // 载入后通过 custom.on(IO,type) 监听


 2012-08-16
 - transform IO to class, remove XhrObject class.
 - support ifModified
 - http://bugs.jquery.com/ticket/8394
 - http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
 - https://github.com/kissyteam/kissy/issues/203

 2012-07-18 yiminghe@gmail.com
 - refactor by KISSY.Uri

 2012-2-07 yiminghe@gmail.com
 - 返回 Promise 类型对象，可以链式操作啦！

 2011 yiminghe@gmail.com
 - 借鉴 jquery，优化减少闭包使用

 */