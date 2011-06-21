/**
 * a scalable client io framework
 * @author: yiminghe@gmail.com , lijing00333@163.com
 */
KISSY.add("ajax/base", function(S, JSON, Event, XhrObject) {

    var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        rquery = /\?/,
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

    var defaultConfig = {
        isLocal:rlocalProtocol.test(curLocationParts[1]),
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
        coverters:{
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

        if (c.data && !S.isString(S.data)) {
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

        c.context = c.context || c;
        return c;
    }

    function fire(eventType, c, xhr) {
        io.fire(eventType, { ajaxConfig: c ,xhr:xhr});
    }

    function handleResponseData(xhr, response) {
        // text html 特殊处理
        var text = response.responseText,xml = response.responseXML;
        xhr.responseText = text;
        xhr.responseXML = xml;
        if (!text && !xml) {
            return;
        }
        var contentType,
            c = xhr.config,
            contents = c.contents,
            dataType = c.dataType;

        if (!dataType) {
            contentType = xhr.mimeType || xhr.getResponseHeader("Content-Type");
            for (var i in contents) {
                if (contents[i].test(contentType)) {
                    dataType = i;
                    break;
                }
            }
        }
        if (!dataType) {
            xhr.data = xml || text;
        }


    }

    function done(status, statusText, responses, headers, xhr) {
        if (xhr.status == 2) {
            return;
        }
        xhr.status = 2;
        xhr.transport = undefined;
        xhr.responseHeadersString = headers || "";
        xhr.readyState = 4;
        handleResponseData(xhr, responses);

    }

    function handXhr(e) {
        var xhr = this,c = xhr.config;
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
        }
        var type = e.type;
        if (c[type]) {
            c[type].call(c.context, xhr.data, xhr.statusText, xhr);
        }
        fire(type, c, xhr);
    }

    var transports = {};
    var io = S.mix({
            __transports:transports,
            ajax:function(c) {
                c = setUpConfig(c);
                var xhr = new XhrObject();
                fire("start", c, xhr);
                var transport = transports[c.dataType] && transports[c.dataType]();
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
                        done(-1, e);
                        // Simply rethrow otherwise
                    } else {
                        S.error(e);
                    }
                }

                return xhr;
            }

        }, Event.Target);


    return io;
}, {
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