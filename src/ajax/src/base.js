/**
 * @fileOverview a scalable client io framework
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/base", function (S, JSON, Event, XhrObject, undefined) {

    var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
        rspace = /\s+/,
        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        mirror = function (s) {
            return s;
        },
        HTTP_PORT = 80,
        HTTPS_PORT = 443,
        rnoContent = /^(?:GET|HEAD)$/,
        curLocation,
        doc = S.Env.host.document,
        curLocationParts;

    try {
        curLocation = location.href;
    } catch (e) {
        S.log("ajax/base get curLocation error : ");
        S.log(e);
        // Use the href attribute of an A element
        // since IE will modify it given document.location
        curLocation = doc.createElement("a");
        curLocation.href = "";
        curLocation = curLocation.href;
    }

    // fix on nodejs , curLocation == "/xx/yy/kissy-nodejs.js"
    curLocationParts = rurl.exec(curLocation) || ["", "", "", ""];

    var isLocal = rlocalProtocol.test(curLocationParts[1]),
        transports = {},
        defaultConfig = {
            type:"GET",
            contentType:"application/x-www-form-urlencoded; charset=UTF-8",
            async:true,
            serializeArray:true,
            processData:true,
            accepts:{
                xml:"application/xml, text/xml",
                html:"text/html",
                text:"text/plain",
                json:"application/json, text/javascript",
                "*":"*/*"
            },
            converters:{
                text:{
                    json:JSON.parse,
                    html:mirror,
                    text:mirror,
                    xml:S.parseXML
                }
            },
            contents:{
                xml:/xml/,
                html:/html/,
                json:/json/
            }
        };

    defaultConfig.converters.html = defaultConfig.converters.text;

    function setUpConfig(c) {
        // deep mix,exclude context!
        var context = c.context;
        delete c.context;
        c = S.mix(S.clone(defaultConfig), c || {}, undefined, undefined, true);
        c.context = context;

        if (!("crossDomain" in c)) {
            var parts = rurl.exec(c.url.toLowerCase());
            c.crossDomain = !!( parts &&
                ( parts[ 1 ] != curLocationParts[ 1 ] || parts[ 2 ] != curLocationParts[ 2 ] ||
                    ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? HTTP_PORT : HTTPS_PORT ) )
                        !=
                        ( curLocationParts[ 3 ] || ( curLocationParts[ 1 ] === "http:" ? HTTP_PORT : HTTPS_PORT ) ) )
                );
        }

        if (c.processData && c.data && !S.isString(c.data)) {
            // 必须 encodeURIComponent 编码 utf-8
            c.data = S.param(c.data, undefined, undefined, c.serializeArray);
        }

        // fix #90 ie7 about "//x.htm"
        c.url = c.url.replace(/^\/\//, curLocationParts[1] + "//");
        c.type = c.type.toUpperCase();
        c.hasContent = !rnoContent.test(c.type);

        // 数据类型处理链，一步步将前面的数据类型转化成最后一个
        c.dataType = S.trim(c.dataType || "*").split(rspace);

        if (!("cache" in c) && S.inArray(c.dataType[0], ["script", "jsonp"])) {
            c.cache = false;
        }

        if (!c.hasContent) {
            if (c.data) {
                c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.data;
                delete c.data;
            }
            if (c.cache === false) {
                c.url += ( /\?/.test(c.url) ? "&" : "?" ) + "_ksTS=" + (S.now() + "_" + S.guid());
            }
        }

        c.context = c.context || c;
        return c;
    }

    function fire(eventType, xhrObject) {
        /**
         * @name IO#complete
         * @description fired after request completes (success or error)
         * @event
         * @param {Event.Object} e
         * @param {Object} e.ajaxConfig current request 's config
         * @param {IO.XhrObject} e.xhr current xhr object
         */

        /**
         * @name IO#success
         * @description  fired after request succeeds
         * @event
         * @param {Event.Object} e
         * @param {Object} e.ajaxConfig current request 's config
         * @param {IO.XhrObject} e.xhr current xhr object
         */

        /**
         * @name IO#error
         * @description fired after request occurs error
         * @event
         * @param {Event.Object} e
         * @param {Object} e.ajaxConfig current request 's config
         * @param {IO.XhrObject} e.xhr current xhr object
         */
        io.fire(eventType, { ajaxConfig:xhrObject.config, xhr:xhrObject});
    }

    /**
     * @name IO
     * @namespace Provides utility that brokers HTTP requests through a simplified interface
     * @function
     *
     * @param {Object} c <br/>name-value of object to config this io request.<br/>
     *  all values are optional.<br/>
     *  default value can be set through {@link io.setupConfig}<br/>
     *
     * @param {String} c.url <br/>request destination
     *
     * @param {String} c.type <br/>request type.
     * eg: "get","post"<br/>
     * Default: "get"<br/>
     *
     * @param {String} c.contentType <br/>
     * Default: "application/x-www-form-urlencoded; charset=UTF-8"<br/>
     * Data will always be transmitted to the server using UTF-8 charset<br/>
     *
     * @param {Object} c.accepts <br/>
     * Default: depends on DataType.<br/>
     * The content type sent in request header that tells the server<br/>
     * what kind of response it will accept in return.<br/>
     * It is recommended to do so once in the {@link io.setupConfig}
     *
     * @param {Boolean} c.async <br/>
     * Default: true<br/>
     * whether request is sent asynchronously<br/>
     *
     * @param {Boolean} c.cache <br/>
     * Default: true ,false for dataType "script" and "jsonp"<br/>
     * if set false,will append _ksTs=Date.now() to url automatically<br/>
     *
     * @param {Object} c.contents <br/>
     * a name-regexp map to determine request data's dataType<br/>
     * It is recommended to do so once in the {@link io.setupConfig}<br/>
     *
     * @param {Object} c.context <br/>
     * specify the context of this request's callback (success,error,complete)
     *
     * @param {Object} c.converters <br/>
     * Default:{text:{json:JSON.parse,html:mirror,text:mirror,xml:KISSY.parseXML}}<br/>
     * specified how to transform one dataType to another dataType<br/>
     * It is recommended to do so once in the {@link io.setupConfig}
     *
     * @param {Boolean} c.crossDomain <br/>
     * Default: false for same-domain request,true for cross-domain request<br/>
     * if server-side jsonp redirect to another domain ,you should set this to true
     *
     * @param {Object} c.data <br/>
     * Data sent to server.if processData is true,data will be serialized to String type.<br/>
     * if value if an Array, serialization will be based on serializeArray.
     *
     * @param {String} c.dataType <br/>
     * return data as a specified type<br/>
     * Default: Based on server contentType header<br/>
     * "xml" : a XML document<br/>
     * "text"/"html": raw server data <br/>
     * "script": evaluate the return data as script<br/>
     * "json": parse the return data as json and return the result as final data<br/>
     * "jsonp": load json data via jsonp
     *
     * @param {Object} c.headers <br/>
     * additional name-value header to send along with this request.
     *
     * @param {String} c.jsonp <br/>
     * Default: "callback"<br/>
     * Override the callback function name in a jsonp request. eg:<br/>
     * set "callback2" , then jsonp url will append  "callback2=?".
     *
     * @param {String} c.jsonpCallback <br/>
     * Specify the callback function name for a jsonp request.<br/>
     * set this value will replace the auto generated function name.<br/>
     * eg:<br/>
     * set "customCall" , then jsonp url will append "callback=customCall"
     *
     * @param {String} c.mimeType <br/>
     * override xhr's mime type
     *
     * @param {Boolean} c.processData <br/>
     * Default: true<br/>
     * whether data will be serialized as String
     *
     * @param {String} c.scriptCharset <br/>
     * only for dataType "jsonp" and "script" and "get" type.<br/>
     * force the script to certain charset.
     *
     * @param {Function} c.beforeSend <br/>
     * beforeSend(xhrObject,config)<br/>
     * callback function called before the request is sent.this function has 2 arguments<br/>
     * 1. current KISSY xhrObject<br/>
     * 2. current io config<br/>
     * note: can be used for add progress event listener for native xhr's upload attribute
     * see <a href="http://www.w3.org/TR/XMLHttpRequest/#event-xhr-progress">XMLHttpRequest2</a>
     *
     * @param {Function} c.success <br/>
     * success(data,textStatus,xhr)<br/>
     * callback function called if the request succeeds.this function has 3 arguments<br/>
     * 1. data returned from this request with type specified by dataType<br/>
     * 2. status of this request with type String<br/>
     * 3. XhrObject of this request , for details {@link IO.XhrObject}
     *
     * @param {Function} c.error <br/>
     * success(data,textStatus,xhr) <br/>
     * callback function called if the request occurs error.this function has 3 arguments<br/>
     * 1. null value<br/>
     * 2. status of this request with type String,such as "timeout","Not Found","parsererror:..."<br/>
     * 3. XhrObject of this request , for details {@link IO.XhrObject}
     *
     * @param {Function} c.complete <br/>
     * success(data,textStatus,xhr)<br/>
     * callback function called if the request finished(success or error).this function has 3 arguments<br/>
     * 1. null value if error occurs or data returned from server<br/>
     * 2. status of this request with type String,such as success:"ok",
     * error:"timeout","Not Found","parsererror:..."<br/>
     * 3. XhrObject of this request , for details {@link IO.XhrObject}
     *
     * @param {Number} c.timeout <br/>
     * Set a timeout(in seconds) for this request.if will call error when timeout
     *
     * @param {Boolean} c.serializeArray <br/>
     * whether add [] to data's name when data's value is array in serialization
     *
     * @param {Object} c.xhrFields <br/>
     * name-value to set to native xhr.set as xhrFields:{withCredentials:true}
     *
     * @param {String} c.username <br/>
     * a username tobe used in response to HTTP access authentication request
     *
     * @param {String} c.password <br/>
     * a password tobe used in response to HTTP access authentication request
     *
     * @param {Object} c.xdr <br/>
     * cross domain request config object
     *
     * @param {String} c.xdr.src <br/>
     * Default: kissy's flash url
     * flash sender url
     *
     * @param {String} c.xdr.use <br/>
     * if set to "use", it will always use flash for cross domain request even in chrome/firefox
     *
     * @param {Object} c.xdr.subDomain <br/>
     * cross sub domain request config object
     *
     * @param {String} c.xdr.subDomain.proxy <br/>
     * proxy page,eg:<br/>
     * a.t.cn/a.htm send request to b.t.cn/b.htm: <br/>
     * 1. a.htm set document.domain='t.cn'<br/>
     * 2. b.t.cn/proxy.htm 's content is &lt;script>document.domain='t.cn'&lt;/script><br/>
     * 3. in a.htm , call io({xdr:{subDomain:{proxy:'/proxy.htm'}}})
     *
     * @returns {IO.XhrObject} current request object
     */
    function io(c) {

        if (!c.url) {
            return undefined;
        }

        c = setUpConfig(c);

        var xhrObject = new XhrObject(c);

        /**
         * @name IO#start
         * @description fired before generating request object
         * @event
         * @param {Event.Object} e
         * @param {Object} e.ajaxConfig current request 's config
         * @param {IO.XhrObject} e.xhr current xhr object
         */

        fire("start", xhrObject);

        var transportContructor = transports[c.dataType[0]] || transports["*"],
            transport = new transportContructor(xhrObject);
        xhrObject.transport = transport;

        if (c.contentType) {
            xhrObject.setRequestHeader("Content-Type", c.contentType);
        }
        var dataType = c.dataType[0],
            accepts = c.accepts;
        // Set the Accepts header for the server, depending on the dataType
        xhrObject.setRequestHeader(
            "Accept",
            dataType && accepts[dataType] ?
                accepts[ dataType ] + (dataType === "*" ? "" : ", */*; q=0.01"  ) :
                accepts[ "*" ]
        );

        // Check for headers option
        for (var i in c.headers) {
            xhrObject.setRequestHeader(i, c.headers[ i ]);
        }


        // allow setup native listener
        // such as xhr.upload.addEventListener('progress', function (ev) {})
        if (c.beforeSend && ( c.beforeSend.call(c.context || c, xhrObject, c) === false)) {
            return undefined;
        }

        function genHandler(handleStr) {
            return function (v) {
                if (xhrObject.timeoutTimer) {
                    clearTimeout(xhrObject.timeoutTimer);
                    xhrObject.timeoutTimer = 0;
                }
                var h = c[handleStr];
                h && h.apply(c.context, v);
                fire(handleStr, xhrObject);
            };
        }

        xhrObject.then(genHandler("success"), genHandler("error"));

        xhrObject.fin(genHandler("complete"));

        xhrObject.readyState = 1;

        /**
         * @name IO#send
         * @description fired before sending request
         * @event
         * @param {Event.Object} e
         * @param {Object} e.ajaxConfig current request 's config
         * @param {IO.XhrObject} e.xhr current xhr object
         */

        fire("send", xhrObject);

        // Timeout
        if (c.async && c.timeout > 0) {
            xhrObject.timeoutTimer = setTimeout(function () {
                xhrObject.abort("timeout");
            }, c.timeout * 1000);
        }

        try {
            // flag as sending
            xhrObject.state = 1;
            transport.send();
        } catch (e) {
            // Propagate exception as error if not done
            if (xhrObject.state < 2) {
                xhrObject._xhrReady(-1, e);
                // Simply rethrow otherwise
            } else {
                S.error(e);
            }
        }

        return xhrObject;
    }

    S.mix(io, Event.Target);

    S.mix(io,
        /**
         * @lends IO
         */
        {
            /**
             * whether current application is a local application
             * (protocal is file://,widget://,about://)
             * @type Boolean
             * @field
             */
            isLocal:isLocal,
            /**
             * name-value object that set default config value for io request
             * @param {Object} setting for details see {@link io}
             */
            setupConfig:function (setting) {
                S.mix(defaultConfig, setting, undefined, undefined, true);
            },
            /**
             * @private
             */
            setupTransport:function (name, fn) {
                transports[name] = fn;
            },
            /**
             * @private
             */
            getTransport:function (name) {
                return transports[name];
            },
            /**
             * get default config value for io request
             * @returns {Object}
             */
            getConfig:function () {
                return defaultConfig;
            }
        });

    return io;
}, {
    requires:["json", "event", "./XhrObject"]
});

/**
 * 2012-2-07 yiminghe@gmail.com:
 *
 *  返回 Promise 类型对象，可以链式操作啦！
 *
 * 借鉴 jquery，优化减少闭包使用
 *
 * TODO:
 *  ifModified mode 是否需要？
 *  优点：
 *      不依赖浏览器处理，ajax 请求浏览不会自动加 If-Modified-Since If-None-Match ??
 *  缺点：
 *      内存占用
 **/