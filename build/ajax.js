/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: ${build.time}
*/
/**
 * a scalable client io framework
 * @author: yiminghe@gmail.com , lijing00333@163.com
 */
KISSY.add("ajax/base", function(S, JSON, Event, XhrObject) {

    var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
        rspace = /\s+/,
        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        mirror = function(s) {
            return s;
        },
        rnoContent = /^(?:GET|HEAD)$/,
        curLocation,
        curLocationParts;


    try {
        curLocation = location.href;
    } catch(e) {
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
            contentType: "application/x-www-form-urlencoded",
            async:true,

            /*
             url:"",
             context:null,
             timeout: 0,
             data: null,

             // 可取json | jsonp | script | xml | html | text | null | undefined
             dataType: null,

             username: null,
             password: null,
             cache: null,
             mimeType:null,
             headers: {},
             xhrFields:{},
             // jsonp script charset
             scriptCharset:null,
             crossdomain:false,
             forceScript:false,
             */

            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": "*/*"
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
        c = c || {};
        S.mix(c, defaultConfig, false);
        if (c.crossDomain == null) {
            var parts = rurl.exec(c.url.toLowerCase());
            c.crossDomain = !!( parts &&
                ( parts[ 1 ] != curLocationParts[ 1 ] || parts[ 2 ] != curLocationParts[ 2 ] ||
                    ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
                        ( curLocationParts[ 3 ] || ( curLocationParts[ 1 ] === "http:" ? 80 : 443 ) ) )
                );
        }

        if (c.data && !S.isString(c.data)) {
            c.data = S.param(c.data);
        }
        c.type = c.type.toUpperCase();
        c.hasContent = !rnoContent.test(c.type);

        if (!c.hasContent) {
            if (c.data) {
                c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.data;
            }
            if (c.cache === false) {
                c.url += ( /\?/.test(c.url) ? "&" : "?" ) + "_ksTS=" + (S.now() + "_" + S.guid());
            }
        }

        // 数据类型处理链，�?��步将前面的数据类型转化成�?���?��
        c.dataType = S.trim(c.dataType || "*").split(rspace);

        c.context = c.context || c;
        return c;
    }

    function fire(eventType, xhr) {
        io.fire(eventType, { ajaxConfig: xhr.config ,xhr:xhr});
    }

    function handXhr(e) {
        var xhr = this,
            c = xhr.config,
            type = e.type;
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
        }
        if (c[type]) {
            c[type].call(c.context, xhr.responseData, xhr.statusText, xhr);
        }
        fire(type, xhr);
    }

    function io(c) {
        if (!c.url) {
            return undefined;
        }
        c = setUpConfig(c);
        var xhr = new XhrObject(c);
        fire("start", xhr);
        var transportContructor = transports[c.dataType[0]] || transports["*"],
            transport = new transportContructor(xhr);
        xhr.transport = transport;

        if (c.contentType) {
            xhr.setRequestHeader("Content-Type", c.contentType);
        }
        var dataType = c.dataType[0],
            accepts = c.accepts;
        // Set the Accepts header for the server, depending on the dataType
        xhr.setRequestHeader(
            "Accept",
            dataType && accepts[dataType] ?
                accepts[ dataType ] + (dataType !== "*" ? ", */*; q=0.01" : "" ) :
                accepts[ "*" ]
        );

        // Check for headers option
        for (var i in c.headers) {
            xhr.setRequestHeader(i, c.headers[ i ]);
        }

        xhr.on("complete success error", handXhr);

        xhr.readyState = 1;

        fire("send", xhr);

        // Timeout
        if (c.async && c.timeout > 0) {
            xhr.timeoutTimer = setTimeout(function() {
                S.log("timeout!!!!!!!!!");
                xhr.abort("timeout");
            }, c.timeout);
        }

        try {
            xhr.state = 1;
            transport.send();
        } catch (e) {
            // Propagate exception as error if not done
            if (xhr.status < 2) {
                xhr.callback(-1, e);
                // Simply rethrow otherwise
            } else {
                S.error(e);
            }
        }

        return xhr;
    }

    io.__transports = transports;
    io.__defaultConfig = defaultConfig;
    S.mix(io, Event.Target);
    io.isLocal = isLocal;

    return io;
},
    {
        requires:["json","event","./xhrobject"]
    });

/**
 * 借鉴 jquery，优化减少闭包使�?
 *
 * TODO:
 *  ifModified mode 是否�?���?
 *  优点�?
 *      不依赖浏览器处理，ajax 请求浏览不会自动�?If-Modified-Since If-None-Match ??
 *  缺点�?
 *      内存占用
 **//**
 * encapsulation of io object
 * @author: yiminghe@gmail.com
 */
KISSY.add("ajax/xhrobject", function(S, Event) {

    var // get individual response header from responseheader str
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;

    function handleResponseData(xhr) {

        // text xml 是否原生转化支持
        var text = xhr.responseText,
            xml = xhr.responseXML,
            c = xhr.config,
            cConverts = c.converters,
            xConverts = xhr.converters || {},
            type,
            responseData,
            contents = c.contents,
            dataType = c.dataType;

        // 例如 script 直接是js引擎执行，没有返回�?，不�?��自己处理初始返回�?
        // jsonp 时还�?���?script 转换�?json，后面还得自己来
        if (text || xml) {

            var contentType = xhr.mimeType || xhr.getResponseHeader("Content-Type");

            // 去除无用的�?用格�?
            while (dataType[0] == "*") {
                dataType.shift();
            }

            if (!dataType.length) {
                // 获取源数据格式，放在第一�?
                for (type in contents) {
                    if (contents[type].test(contentType)) {
                        if (dataType[0] != type) {
                            dataType.unshift(type);
                        }
                        break;
                    }
                }
            }
            // 服务器端没有告知（并且客户端没有mimetype）默�?text 类型
            dataType[0] = dataType[0] || "text";

            //获得合�?的初始数�?
            if (dataType[0] == "text" && text != undefined) {
                responseData = text;
            }
            // �?xml 值才直接取，否则可能还要�?xml �?
            else if (dataType[0] == "xml" && xml != undefined) {
                responseData = xml;
            } else {
                // 看能否从 text xml 转换到合适数�?
                S.each(["text","xml"], function(prevType) {
                    var type = dataType[0],
                        converter = xConverts[prevType] && xConverts[prevType][type] ||
                            cConverts[prevType] && cConverts[prevType][type];
                    if (converter) {
                        dataType.unshift(prevType);
                        responseData = prevType == "text" ? text : xml;
                        return false;
                    }
                });
            }
        }
        var prevType = dataType[0];

        // 按照转化链把初始数据转换成我们想要的数据类型
        for (var i = 1; i < dataType.length; i++) {
            type = dataType[i];

            var converter = xConverts[prevType] && xConverts[prevType][type] ||
                cConverts[prevType] && cConverts[prevType][type];

            if (!converter) {
                throw "no covert for " + prevType + " => " + type;
            }
            responseData = converter(responseData);

            prevType = type;
        }

        xhr.responseData = responseData;
    }

    function XhrObject(c) {
        S.mix(this, {
                // 结构化数据，�?json
                responseData:null,
                config:c || {},
                timeoutTimer:null,
                responseText:null,
                responseXML:null,
                responseHeadersString:"",
                responseHeaders:null,
                requestHeaders:{},
                readyState:0,
                //internal state
                state:0,
                statusText:null,
                status:0,
                transport:null
            });
    }

    S.augment(XhrObject, Event.Target, {
            // Caches the header
            setRequestHeader: function(name, value) {
                this.requestHeaders[ name ] = value;
                return this;
            },

            // Raw string
            getAllResponseHeaders: function() {
                return this.state === 2 ? this.responseHeadersString : null;
            },

            // Builds headers hashtable if needed
            getResponseHeader: function(key) {
                var match;
                if (this.state === 2) {
                    if (!this.responseHeaders) {
                        this.responseHeaders = {};
                        while (( match = rheaders.exec(this.responseHeadersString) )) {
                            this.responseHeaders[ match[1] ] = match[ 2 ];
                        }
                    }
                    match = this.responseHeaders[ key];
                }
                return match === undefined ? null : match;
            },

            // Overrides response content-type header
            overrideMimeType: function(type) {
                if (!this.state) {
                    this.mimeType = type;
                }
                return this;
            },

            // Cancel the request
            abort: function(statusText) {
                statusText = statusText || "abort";
                if (this.transport) {
                    this.transport.abort(statusText);
                }
                this.callback(0, statusText);
                return this;
            },

            callback:function(status, statusText) {
                // debugger
                var xhr = this;
                // 只能执行�?��，防止重复执�?
                // 例如完成后，调用 abort
                if (xhr.state == 2) {
                    return;
                }
                xhr.state = 2;
                xhr.readyState = 4;
                var isSuccess;
                if (status >= 200 && status < 300 || status == 304) {

                    if (status == 304) {
                        statusText = "notmodified";
                        isSuccess = true;
                    } else {
                        try {
                            handleResponseData(xhr);
                            statusText = "success";
                            isSuccess = true;
                        } catch(e) {
                            statusText = "parsererror : " + e;
                        }
                    }

                } else {
                    if (status < 0) {
                        status = 0;
                    }
                }

                xhr.status = status;
                xhr.statusText = statusText;

                if (isSuccess) {
                    xhr.fire("success");
                } else {
                    xhr.fire("error");
                }
                xhr.fire("complete");
                xhr.transport = undefined;
            }
        }
    );

    return XhrObject;
}, {
        requires:["event"]
    });/**
 * ajax xhr tranport class
 * @author: yiminghe@gmail.com
 */
KISSY.add("ajax/xhr", function(S, io) {

    var transports = io.__transports;

    function createStandardXHR() {
        try {
            return new window.XMLHttpRequest();
        } catch(e) {
        }
        return undefined;
    }

    function createActiveXHR() {
        try {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
        } catch(e) {
        }
        return undefined;
    }

    io.xhr = window.ActiveXObject ? function(forceStandard) {
        var xhr;
        // ie7 XMLHttpRequest 不能访问本地文件
        if (io.isLocal && !forceStandard) {
            xhr = createActiveXHR();
        }
        return xhr || createStandardXHR();
    } : createStandardXHR;

    var detectXhr = io.xhr(),
        allowCrossDomain = false;

    if (detectXhr) {

        if ("withCredentials" in detectXhr) {
            allowCrossDomain = true;
        }

        function XhrTransport(xhrObj) {
            this.xhrObj = xhrObj;
        }

        S.augment(XhrTransport, {
                send:function() {
                    var self = this,
                        xhrObj = self.xhrObj,
                        c = xhrObj.config;

                    if (c.crossDomain && !allowCrossDomain) {
                        S.error("do not allow crossdomain xhr !");
                        return;
                    }

                    var xhr = io.xhr(),
                        xhrFields,
                        i;

                    self.xhr = xhr;

                    if (c['username']) {
                        xhr.open(c.type, c.url, c.async, c['username'], c.password)
                    } else {
                        xhr.open(c.type, c.url, c.async);
                    }

                    if (xhrFields = c['xhrFields']) {
                        for (i in xhrFields) {
                            xhr[ i ] = xhrFields[ i ];
                        }
                    }

                    // Override mime type if supported
                    if (xhrObj.mimeType && xhr.overrideMimeType) {
                        xhr.overrideMimeType(xhrObj.mimeType);
                    }
                    try {
                        for (i in xhrObj.requestHeaders) {
                            xhr.setRequestHeader(i, xhrObj.requestHeaders[ i ]);
                        }
                    } catch(e) {
                    }

                    xhr.send(c.hasContent && c.data || null);

                    if (!c.async || xhr.readyState == 4) {
                        self._callback();
                    } else {
                        xhr.onreadystatechange = function() {
                            self._callback();
                        }
                    }
                },
                // �?xhrObj.abort 调用，自己不可以调用 xhrObj.abort
                abort:function() {
                    this._callback(0, 1);
                },

                _callback:function(event, abort) {

                    // Firefox throws exceptions when accessing properties
                    // of an xhr when a network error occured
                    // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
                    try {
                        var self = this,
                            xhr = self.xhr,
                            xhrObj = self.xhrObj,
                            c = xhrObj.config;
                        //abort or complete
                        if (abort || xhr.readyState == 4) {
                            xhr.onreadystatechange = S.noop;


                            if (abort) {
                                // 完成以后 abort 不要调用
                                if (xhr.readyState !== 4) {
                                    xhr.abort();
                                }
                            } else {
                                var status = xhr.status;
                                xhrObj.responseHeadersString = xhr.getAllResponseHeaders();

                                var xml = xhr.responseXML;

                                // Construct response list
                                if (xml && xml.documentElement /* #4958 */) {
                                    xhrObj.responseXML = xml;
                                }
                                xhrObj.responseText = xhr.responseText;

                                // Firefox throws an exception when accessing
                                // statusText for faulty cross-domain requests
                                try {
                                    var statusText = xhr.statusText;
                                } catch(e) {
                                    // We normalize with Webkit giving an empty statusText
                                    statusText = "";
                                }

                                // Filter status for non standard behaviors
                                // If the request is local and we have data: assume a success
                                // (success with no data won't get notified, that's the best we
                                // can do given current implementations)
                                if (!status && io.isLocal && !c.crossDomain) {
                                    status = xhrObj.responseText ? 200 : 404;
                                    // IE - #1450: sometimes returns 1223 when it should be 204
                                } else if (status === 1223) {
                                    status = 204;
                                }

                                xhrObj.callback(status, statusText);
                            }
                        }
                    } catch (firefoxAccessException) {
                        xhr.onreadystatechange = S.noop;
                        if (!abort) {
                            xhrObj.callback(-1, firefoxAccessException);
                        }
                    }
                }


            });

        transports["*"] = XhrTransport;
        return io;
    }
}, {
        requires:["./base"]
    });

/**
 * 借鉴 jquery，优化使用原型替代闭�?
 **//**
 * script transport for kissy io
 * @description: modified version of S.getScript , add abort ability
 * @author: yiminghe@gmail.com
 */
KISSY.add("ajax/script", function(S, io) {

    var transports = io.__transports,
        defaultConfig = io.__defaultConfig;

    defaultConfig.accepts.script = "text/javascript, " +
        "application/javascript, " +
        "application/ecmascript, " +
        "application/x-ecmascript";

    defaultConfig.contents.script = /javascript|ecmascript/;
    // 如果�?xhr+eval �?��下面的，否则直接 script node 不需要，引擎自己执行了，不需要手�?eval
    defaultConfig.converters.text.script = function(text) {
        S.globalEval(text);
        return text;
    };


    function ScriptTransport(xhrObj) {
        // 优先使用 xhr+eval 来执行脚�? ie 下可以探测到（更多）失败状�?
        if (!xhrObj.config.crossDomain &&
            !xhrObj.config['forceScript']) {
            return new transports["*"](xhrObj);
        }
        this.xhrObj = xhrObj;
        return 0;
    }

    S.augment(ScriptTransport, {
            send:function() {
                var self = this,
                    script,
                    xhrObj = this.xhrObj,
                    c = xhrObj.config,
                    head = document['head'] ||
                        document.getElementsByTagName("head")[0] ||
                        document.documentElement;
                self.head = head;
                script = document.createElement("script");
                self.script = script;
                script.async = "async";

                if (c['scriptCharset']) {
                    script.charset = c['scriptCharset'];
                }

                script.src = c.url;

                script.onerror =
                    script.onload =
                        script.onreadystatechange = function(e) {
                            e = e || window.event;
                            // firefox onerror 没有 type ?!
                            self._callback((e.type || "error").toLowerCase());
                        };

                head.insertBefore(script, head.firstChild);
            },

            _callback:function(event, abort) {
                var script = this.script,
                    xhrObj = this.xhrObj,
                    head = this.head;

                if (abort ||
                    !script.readyState ||
                    /loaded|complete/.test(script.readyState)
                    || event == "error"
                    ) {

                    script['onerror'] = script.onload = script.onreadystatechange = null;

                    // Remove the script
                    if (head && script.parentNode) {
                        head.removeChild(script);
                    }

                    this.script = undefined;
                    this.head = undefined;

                    // Callback if not abort
                    if (!abort && event != "error") {
                        xhrObj.callback(200, "success");
                    }
                    // �?ie<9 可以判断出来
                    else if (event == "error") {
                        xhrObj.callback(500, "scripterror");
                    }
                }
            },

            abort:function() {
                this._callback(0, 1);
            }
        });

    transports["script"] = ScriptTransport;

    return io;

}, {
        requires:['./base','./xhr']
    });/**
 * jsonp transport based on script transport
 */
KISSY.add("ajax/jsonp", function(S, io) {

    var defaultConfig = io.__defaultConfig;

    defaultConfig.jsonp = "callback";
    defaultConfig.jsonpCallback = function() {
        //不使�?now() ，极端情况下可能重复
        return S.guid("jsonp");
    };

    io.on("start", function(e) {
        var xhr = e.xhr,c = xhr.config;
        if (c.dataType[0] == "jsonp") {
            var response,
                cJsonpCallback = c.jsonpCallback,
                jsonpCallback = S.isFunction(cJsonpCallback) ?
                    cJsonpCallback() :
                    cJsonpCallback,
                previous = window[ jsonpCallback ];

            c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.jsonp + "=" + jsonpCallback;

            // build temporary JSONP function
            window[jsonpCallback] = function(r) {
                //debugger
                // 使用数组，区别：故意调用�?jsonpCallback(undefined) �?根本没有调用
                response = [r];
            };

            // cleanup whether success or failure
            xhr.on("complete", function() {
                window[ jsonpCallback ] = previous;
                if (previous === undefined) {
                    try {
                        delete window[ jsonpCallback ];
                    } catch(e) {
                    }
                } else if (response) {
                    // after io success handler called
                    // then call original existed jsonpcallback
                    previous(response[0]);
                }
            });

            xhr.converters = xhr.converters || {};
            xhr.converters.script = xhr.converters.script || {};

            // script -> jsonp ,jsonp need to see json not as script
            xhr.converters.script.json = function() {
                if (!response) {
                    S.error(" not call jsonpCallback : " + jsonpCallback)
                }
                return response[0];
            };

            c.dataType.length = 2;
            // 利用 script transport 发�? script 请求
            c.dataType[0] = 'script';
            c.dataType[1] = 'json';
        }
    });

    return io;
}, {
        requires:['./base']
    });KISSY.add("ajax", function(S, io) {

    // some shortcut
    S.mix(io, {
            get: function(url, data, callback, dataType, _t) {
                // data 参数可省�?
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                }

                return io({
                        type: _t || "get",
                        url: url,
                        data: data,
                        success: callback,
                        dataType: dataType
                    });
            },

            post: function(url, data, callback, dataType) {
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                    data = undefined;
                }
                return io.get(url, data, callback, dataType, "post");
            },

            jsonp: function(url, data, callback) {
                if (S.isFunction(data)) {
                    callback = data;
                    data = null; // 占位�?
                }
                return io.get(url, data, callback, "jsonp");
            },

            // �?S.getScript 保持�?��
            // 更好�?getScript 可以�?
            /*
             io({
             dataType:'script'
             });
             */
            getScript:S.getScript,

            getJSON: function(url, data, callback) {
                return io.get(url, data, callback, "json");
            }
        });

    return io;
}, {
        requires:["ajax/base",
            "ajax/xhrobject",
            "ajax/xhr",
            "ajax/script",
            "ajax/jsonp"]
    });
