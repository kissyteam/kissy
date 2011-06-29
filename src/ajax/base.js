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
            // only support utf-8 when post, encoding can not be changed actually
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            async:true,
            // whether add []
            serializeArray:true,
            // whether param data
            processData:true,
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
        // deep mix
        c = S.mix(S.clone(defaultConfig), c || {}, undefined, undefined, true);
        if (c.crossDomain == null) {
            var parts = rurl.exec(c.url.toLowerCase());
            c.crossDomain = !!( parts &&
                ( parts[ 1 ] != curLocationParts[ 1 ] || parts[ 2 ] != curLocationParts[ 2 ] ||
                    ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
                        ( curLocationParts[ 3 ] || ( curLocationParts[ 1 ] === "http:" ? 80 : 443 ) ) )
                );
        }

        if (c.processData && c.data && !S.isString(c.data)) {
            // 必须 encodeURIComponent 编码 utf-8
            c.data = S.param(c.data, undefined, undefined, c.serializeArray);
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

        // 数据类型处理链，一步步将前面的数据类型转化成最后一个
        c.dataType = S.trim(c.dataType || "*").split(rspace);

        c.context = c.context || c;
        return c;
    }

    function fire(eventType, xhr) {
        io.fire(eventType, { ajaxConfig: xhr.config ,xhr:xhr});
    }

    function handleXhrEvent(e) {
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

        xhr.on("complete success error", handleXhrEvent);

        xhr.readyState = 1;

        fire("send", xhr);

        // Timeout
        if (c.async && c.timeout > 0) {
            xhr.timeoutTimer = setTimeout(function() {
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

    S.mix(io, Event.Target);
    S.mix(io, {
            isLocal:isLocal,
            setupConfig:function(setting) {
                S.mix(defaultConfig, setting, undefined, undefined, true);
            },
            setupTransport:function(name, fn) {
                transports[name] = fn;
            },
            getTransport:function(name) {
                return transports[name];
            },
            getConfig:function() {
                return defaultConfig;
            }
        });


    return io;
},
    {
        requires:["json","event","./xhrobject"]
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