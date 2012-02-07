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
            curLocationParts;


        try {
            curLocation = location.href;
        } catch (e) {
            S.log("ajax/base get curLocation error : ");
            S.log(e);
            // Use the href attribute of an A element
            // since IE will modify it given document.location
            curLocation = document.createElement("a");
            curLocation.href = "";
            curLocation = curLocation.href;
        }

        curLocationParts = rurl.exec(curLocation);

        var isLocal = rlocalProtocol.test(curLocationParts[1]),
            transports = {},
            defaultConfig = {
                // isLocal:isLocal,
                type:"GET",
                // only support utf-8 when post, encoding can not be changed actually
                contentType:"application/x-www-form-urlencoded; charset=UTF-8",
                async:true,
                // whether add []
                serializeArray:true,
                // whether param data
                processData:true,

                /*
                 url:"",
                 context:null,
                 // 单位秒!!
                 timeout: 0,
                 data: null,
                 // 可取json | jsonp | script | xml | html | text | null | undefined
                 dataType: null,
                 username: null,
                 password: null,
                 cache: null,
                 mimeType:null,
                 xdr:{
                 subDomain:{
                 proxy:'http://xx.t.com/proxy.html'
                 },
                 src:''
                 },
                 headers: {},
                 xhrFields:{},
                 // jsonp script charset
                 scriptCharset:null,
                 crossdomain:false,
                 forceScript:false,
                 */

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
            // deep mix
            c = S.mix(S.clone(defaultConfig), c || {}, undefined, undefined, true);
            if (!S.isBoolean(c.crossDomain)) {
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

            if (!c.hasContent) {
                if (c.data) {
                    c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.data;
                    delete c.data;
                }
                if (c.cache === false) {
                    c.url += ( /\?/.test(c.url) ? "&" : "?" ) + "_ksTS=" + (S.now() + "_" + S.guid());
                }
            }

            // 数据类型处理链，一步步将前面的数据类型转化成最后一个
            c.dataType = S.trim(c.dataType || "*").split(rspace);

            c.context = c.context || c;
            return c;
        }

        function fire(eventType, xhrObject) {
            /**
             * @name io#complete
             * @description 请求完成（成功或失败）后触发
             * @event
             * @param {Event.Object} e
             * @param {Object} e.ajaxConfig 当前请求的配置
             * @param {io.XhrObject} e.xhr 当前请求对象
             */

            /**
             * @name io#success
             * @description 请求成功后触发
             * @event
             * @param {Event.Object} e
             * @param {Object} e.ajaxConfig 当前请求的配置
             * @param {io.XhrObject} e.xhr 当前请求对象
             */

            /**
             * @name io#error
             * @description 请求失败后触发
             * @event
             * @param {Event.Object} e
             * @param {Object} e.ajaxConfig 当前请求的配置
             * @param {io.XhrObject} e.xhr 当前请求对象
             */
            io.fire(eventType, { ajaxConfig:xhrObject.config, xhr:xhrObject});
        }

        /**
         * @name io
         * @description kissy io framework
         * @namespace io framework
         * @function
         * @param {Object} c 发送请求配置选项
         * @param {String} c.url 请求地址
         */
        function io(c) {
            if (!c.url) {
                return undefined;
            }
            c = setUpConfig(c);
            var xhrObject = new XhrObject(c);


            /**
             * @name io#start
             * @description 生成请求对象前触发
             * @event
             * @param {Event.Object} e
             * @param {Object} e.ajaxConfig 当前请求的配置
             * @param {io.XhrObject} e.xhr 当前请求对象
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
             * @name io#send
             * @description 发送请求前触发
             * @event
             * @param {Event.Object} e
             * @param {Object} e.ajaxConfig 当前请求的配置
             * @param {io.XhrObject} xhr 当前请求对象
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
                if (xhrObject.status < 2) {
                    xhrObject._xhrReady(-1, e);
                    // Simply rethrow otherwise
                } else {
                    S.error(e);
                }
            }

            return xhrObject;
        }

        S.mix(io, Event.Target);

        S.mix(io, {
            isLocal:isLocal,
            setupConfig:function (setting) {
                S.mix(defaultConfig, setting, undefined, undefined, true);
            },
            setupTransport:function (name, fn) {
                transports[name] = fn;
            },
            getTransport:function (name) {
                return transports[name];
            },
            getConfig:function () {
                return defaultConfig;
            }
        });

        return io;
    },
    {
        requires:["json", "event", "./XhrObject"]
    });

/**
 * 借鉴 jquery，优化减少闭包使用
 *
 * TODO:
 *  ifModified mode 是否需要？
 *  优点：
 *      不依赖浏览器处理，ajax 请求浏览不会自动加 If-Modified-Since If-None-Match ??
 *  缺点：
 *      内存占用
 **/