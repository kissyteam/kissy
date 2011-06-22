/**
 * a scalable client io framework
 * @author: yiminghe@gmail.com , lijing00333@163.com
 */
KISSY.add("ajax/base", function(S, JSON, Event, XhrObject) {

    var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
        rspace = /\s+/,
        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        rquery = /\?/,
        mirror = function(s) {
            return s;
        },
        rnoContent = /^(?:GET|HEAD)$/,
        curLocation,
        curLocationParts,
        isLocal = rlocalProtocol.test(curLocationParts[1]),
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
             dataType: null,
             username: null,
             password: null,
             cache: null,
             mimeType:null,
             headers: {},
             crossdomain:false,
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
                    xml:S.parseXML
                }
            },
            contents:{
                xml:/xml/,
                html:/html/,
                json:/json/
            }
        };

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
                c.url += ( rquery.test(c.url) ? "&" : "?" ) + c.data;
            }
            if (c.cache === false) {
                c.url += ( rquery.test(c.url) ? "&" : "?" ) + "_ksTS=" + (S.now() + "_" + S.guid());
            }
        }

        // 数据类型处理链，一步步将前面的数据类型转化成最后一个
        c.dataType = S.trim(c.dataType || "*").split(rspace);

        c.context = c.context || c;
        return c;
    }

    function fire(eventType, c, xhr) {
        io.fire(eventType, { ajaxConfig: c ,xhr:xhr});
    }

    function handleResponseData(xhr) {
        // text html 特殊处理
        var text = xhr.responseText,
            xml = xhr.responseXML;

        if (!text && !xml) {
            return;
        }
        var contentType = xhr.mimeType || xhr.getResponseHeader("Content-Type"),
            c = xhr.config,
            cConverts = c.converters,
            xConverts = xhr.converters,
            type,
            responseData,
            contents = c.contents,
            dataType = c.dataType;

        // 去除无用的通用格式
        while (dataType[0] == "*") {
            dataType.shift();
        }

        if (!dataType.length) {
            // 获取源数据格式，放在第一个
            for (type in contents) {
                if (contents[type].test(contentType)) {
                    if (dataType[0] != type) {
                        dataType.unshift(type);
                    }
                    break;
                }
            }
        }
        // 服务器端没有告知（并且客户端没有mimetype）默认 text 类型
        dataType[0] = dataType[0] || "text";

        //获得合适的初始数据
        if (dataType[0] == "text") {
            responseData = text;
        } else if (dataType[0] == "xml") {
            responseData = xml;
        } else {
            // 看能否从 text xml 转换到合适数据
            var ok = false;
            S.each(["text","xml"], function(prevType) {
                var type = dataType[0];
                var converter = xConverts[prevType] && xConverts[prevType][type] ||
                    cConverts[prevType] && cConverts[prevType][type];
                if (converter) {
                    responseData = converter(prevType == "text" ? text : xml);
                    ok = true;
                    return false;
                }
            });
            if (!ok) {
                throw " no covert for text|xml => " + dataType[0];
            }
        }

        var prevType = dataType[0];

        // 把初始数据转换成我们想要的数据类型
        for (var i = 1; i < dataType.length; i++) {
            type = dataType[i];

            var converter = xConverts[prevType] && xConverts[prevType][type] ||
                cConverts[prevType] && cConverts[prevType][type];

            if (!converter) {
                throw "no covert for " + prevType + " => " + type;
            }
            responseData = converter(responseData);
        }

        xhr.responseData = responseData;
    }

    function done(status, statusText, xhr) {
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
        fire(type, c, xhr);
    }

    var transports = {},
        io = S.mix({
                __transports:transports,
                ajax:function(c) {
                    c = setUpConfig(c);
                    var xhr = new XhrObject();
                    fire("start", c, xhr);
                    var transport = transports[c.dataType] && new transports[c.dataType](c);
                    if (!transport) return;
                    xhr.transport = transport;

                    if (c.contentType) {
                        xhr.setRequestHeader("Content-Type", c.contentType);
                    }
                    var dataType = c.dataType,
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

                    fire("send", c, xhr);

                    // Timeout
                    if (c.async && c.timeout > 0) {
                        xhr.timeoutTimer = setTimeout(function() {
                            xhr.abort("timeout");
                        }, c.timeout);
                    }

                    try {
                        xhr.state = 1;
                        transport.send(xhr, done);
                    } catch (e) {
                        // Propagate exception as error if not done
                        if (xhr.status < 2) {
                            done(-1, e, xhr);
                            // Simply rethrow otherwise
                        } else {
                            S.error(e);
                        }
                    }

                    return xhr;
                }

            }, Event.Target);

    io.isLocal = isLocal;
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