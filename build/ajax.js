/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Oct 17 17:51
*/
/**
 * a scalable client io framework
 * @author  yiminghe@gmail.com , lijing00333@163.com
 */
KISSY.add("ajax/base", function(S, JSON, Event, XhrObject) {

        var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
            rspace = /\s+/,
            rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
            mirror = function(s) {
                return s;
            },
            HTTP_PORT = 80,
            HTTPS_PORT = 443,
            rnoContent = /^(?:GET|HEAD)$/,
            curLocation,
            curLocationParts;


        try {
            curLocation = location.href;
        } catch(e) {
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
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
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
                 }
                 },
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
                    accepts[ dataType ] + (dataType === "*" ? "" : ", */*; q=0.01"  ) :
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
                }, c.timeout * 1000);
            }

            try {
                // flag as sending
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
 **//**
 * form data  serialization util
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/form-serializer", function(S, DOM) {
    var rselectTextarea = /^(?:select|textarea)/i,
        rCRLF = /\r?\n/g,
        rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;
    return {
        /**
         * 序列化表单元素
         * @param {String|HTMLElement[]|HTMLElement|Node} forms
         */
        serialize:function(forms) {
            var elements = [],data = {};
            DOM.query(forms).each(function(el) {
                // form 取其表单元素集合
                // 其他直接取自身
                var subs = el.elements ? S.makeArray(el.elements) : [el];
                elements.push.apply(elements, subs);
            });
            // 对表单元素进行过滤，具备有效值的才保留
            elements = S.filter(elements, function(el) {
                // 有名字
                return el.name &&
                    // 不被禁用
                    !el.disabled &&
                    (
                        // radio,checkbox 被选择了
                        el.checked ||
                            // select 或者 textarea
                            rselectTextarea.test(el.nodeName) ||
                            // input 类型
                            rinput.test(el.type)
                        );

                // 这样子才取值
            });
            S.each(elements, function(el) {
                var val = DOM.val(el),vs;
                // 字符串换行平台归一化
                val = S.map(S.makeArray(val), function(v) {
                    return v.replace(rCRLF, "\r\n");
                });
                // 全部搞成数组，防止同名
                vs = data[el.name] = data[el.name] || [];
                vs.push.apply(vs, val);
            });
            // 名值键值对序列化,数组元素名字前不加 []
            return S.param(data, undefined, undefined, false);
        }
    };
}, {
    requires:['dom']
});KISSY.add("ajax/form", function(S, io, DOM, FormSerializer) {

    io.on("start", function(e) {
        var xhr = e.xhr,
            c = xhr.config;
        // serialize form if needed
        if (c.form) {
            var form = DOM.get(c.form),
                enctype = form['encoding'] || form.enctype;
            // 上传有其他方法
            if (enctype.toLowerCase() != "multipart/form-data") {
                // when get need encode
                var formParam = FormSerializer.serialize(form);

                if (formParam) {
                    if (c.hasContent) {
                        // post 加到 data 中
                        c.data = c.data || "";
                        if (c.data) {
                            c.data += "&";
                        }
                        c.data += formParam;
                    } else {
                        // get 直接加到 url
                        c.url += ( /\?/.test(c.url) ? "&" : "?" ) + formParam;
                    }
                }
            } else {
                var d = c.dataType[0];
                if (d == "*") {
                    d = "text";
                }
                c.dataType.length = 2;
                c.dataType[0] = "iframe";
                c.dataType[1] = d;
            }
        }
    });

    return io;

}, {
        requires:['./base',"dom","./form-serializer"]
    });/**
 * non-refresh upload file with form by iframe
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/iframe-upload", function(S, DOM, Event, io) {

    var doc = document;

    var OK_CODE = 200,ERROR_CODE = 500,BREATH_INTERVAL = 30;

    // iframe 内的内容就是 body.innerText
    io.setupConfig({
        converters:{
            // iframe 到其他类型的转化和 text 一样
            iframe:io.getConfig().converters.text,
            text:{
                iframe:function(text) {
                    return text;
                }
            }}});

    function createIframe(xhr) {
        var id = S.guid("ajax-iframe");
        xhr.iframe = DOM.create("<iframe " +
            " id='" + id + "'" +
            // need name for target of form
            " name='" + id + "'" +
            " style='position:absolute;left:-9999px;top:-9999px;'/>");
        xhr.iframeId = id;
        DOM.prepend(xhr.iframe, doc.body || doc.documentElement);
    }

    function addDataToForm(data, form, serializeArray) {
        data = S.unparam(data);
        var ret = [];
        for (var d in data) {
            var isArray = S.isArray(data[d]),
                vs = S.makeArray(data[d]);
            // 数组和原生一样对待，创建多个同名输入域
            for (var i = 0; i < vs.length; i++) {
                var e = doc.createElement("input");
                e.type = 'hidden';
                e.name = d + (isArray && serializeArray ? "[]" : "");
                e.value = vs[i];
                DOM.append(e, form);
                ret.push(e);
            }
        }
        return ret;
    }


    function removeFieldsFromData(fields) {
        DOM.remove(fields);
    }

    function IframeTransport(xhr) {
        this.xhr = xhr;
    }

    S.augment(IframeTransport, {
        send:function() {
            //debugger
            var xhr = this.xhr,
                c = xhr.config,
                fields,
                form = DOM.get(c.form);

            this.attrs = {
                target:DOM.attr(form, "target") || "",
                action:DOM.attr(form, "action") || ""
            };
            this.form = form;

            createIframe(xhr);

            // set target to iframe to avoid main page refresh
            DOM.attr(form, {"target": xhr.iframeId,"action": c.url});

            if (c.data) {
                fields = addDataToForm(c.data, form, c.serializeArray);
            }

            this.fields = fields;

            var iframe = xhr.iframe;

            Event.on(iframe, "load error", this._callback, this);

            form.submit();

        },

        _callback:function(event
                           //, abort
            ) {
            //debugger
            var form = this.form,
                xhr = this.xhr,
                eventType = event.type,
                iframe = xhr.iframe;
            // 防止重复调用 , 成功后 abort
            if (!iframe) {
                return;
            }

            DOM.attr(form, this.attrs);

            if (eventType == "load") {
                var iframeDoc = iframe.contentWindow.document;
                xhr.responseXML = iframeDoc;
                xhr.responseText = DOM.text(iframeDoc.body);
                xhr.callback(OK_CODE, "success");
            } else if (eventType == 'error') {
                xhr.callback(ERROR_CODE, "error");
            }

            removeFieldsFromData(this.fields);


            Event.detach(iframe);

            setTimeout(function() {
                // firefox will keep loading if not settimeout
                DOM.remove(iframe);
            }, BREATH_INTERVAL);

            // nullify to prevent memory leak?
            xhr.iframe = null;
        },

        abort:function() {
            this._callback(0, 1);
        }
    });

    io.setupTransport("iframe", IframeTransport);

    return io;

}, {
    requires:["dom","event","./base"]
});/**
 * jsonp transport based on script transport
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/jsonp", function(S, io) {

    io.setupConfig({
        jsonp:"callback",
        jsonpCallback:function() {
            //不使用 now() ，极端情况下可能重复
            return S.guid("jsonp");
        }
    });

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
                // 使用数组，区别：故意调用了 jsonpCallback(undefined) 与 根本没有调用
                // jsonp 返回了数组
                if (arguments.length > 1) {
                    r = S.makeArray(arguments);
                }
                response = [r];
            };

            // cleanup whether success or failure
            xhr.on("complete", function() {
                window[ jsonpCallback ] = previous;
                if (previous === undefined) {
                    try {
                        delete window[ jsonpCallback ];
                    } catch(e) {
                        //S.log("delete window variable error : ");
                        //S.log(e);
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
            // 利用 script transport 发送 script 请求
            c.dataType[0] = 'script';
            c.dataType[1] = 'json';
        }
    });

    return io;
}, {
    requires:['./base']
});
/**
 * script transport for kissy io
 * @description: modified version of S.getScript , add abort ability
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/script", function(S, io) {

    var doc = document;

    var OK_CODE = 200,ERROR_CODE = 500;

    io.setupConfig({
        accepts:{
            script:"text/javascript, " +
                "application/javascript, " +
                "application/ecmascript, " +
                "application/x-ecmascript"
        },

        contents:{
            script:/javascript|ecmascript/
        },
        converters:{
            text:{
                // 如果以 xhr+eval 需要下面的，
                // 否则直接 script node 不需要，引擎自己执行了，
                // 不需要手动 eval
                script:function(text) {
                    S.globalEval(text);
                    return text;
                }
            }
        }
    });

    function ScriptTransport(xhrObj) {
        // 优先使用 xhr+eval 来执行脚本, ie 下可以探测到（更多）失败状态
        if (!xhrObj.config.crossDomain &&
            !xhrObj.config['forceScript']) {
            return new (io.getTransport("*"))(xhrObj);
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
                head = doc['head'] ||
                    doc.getElementsByTagName("head")[0] ||
                    doc.documentElement;
            self.head = head;
            script = doc.createElement("script");
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

            // 防止重复调用,成功后 abort
            if (!script) {
                return;
            }

            if (abort ||
                !script.readyState ||
                /loaded|complete/.test(script.readyState)
                || event == "error"
                ) {

                script['onerror'] = script.onload = script.onreadystatechange = null;

                // Remove the script
                if (head && script.parentNode) {
                    // ie 报错载入无效 js
                    // 怎么 abort ??
                    // script.src = "#";
                    head.removeChild(script);
                }

                this.script = undefined;
                this.head = undefined;

                // Callback if not abort
                if (!abort && event != "error") {
                    xhrObj.callback(OK_CODE, "success");
                }
                // 非 ie<9 可以判断出来
                else if (event == "error") {
                    xhrObj.callback(ERROR_CODE, "scripterror");
                }
            }
        },

        abort:function() {
            this._callback(0, 1);
        }
    });

    io.setupTransport("script", ScriptTransport);

    return io;

}, {
    requires:['./base','./xhr']
});/**
 * solve io between sub domains using proxy page
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/subdomain", function(S, XhrBase, Event, DOM) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

    var PROXY_PAGE = "/sub_domain_proxy.html";

    var doc = document;

    var iframeMap = {
        // hostname:{iframe: , ready:}
    };

    function SubDomain(xhrObj) {
        var self = this,
            c = xhrObj.config;
        self.xhrObj = xhrObj;
        var m = c.url.match(rurl);
        self.__hostname = m[2];
        self.__protocol = m[1];
        c.crossDomain = false;
    }


    S.augment(SubDomain, XhrBase.proto, {
        send:function() {
            var self = this,
                c = self.xhrObj.config,
                hostname = self.__hostname,
                iframe,
                iframeDesc = iframeMap[hostname];

            var proxy = PROXY_PAGE;

            if (c['xdr'] && c['xdr']['subDomain'] && c['xdr']['subDomain'].proxy) {
                proxy = c['xdr']['subDomain'].proxy;
            }

            if (iframeDesc && iframeDesc.ready) {
                self.xhr = XhrBase.xhr(0, iframeDesc.iframe.contentWindow);
                if (self.xhr) {
                    self.sendInternal();
                } else {
                    S.error("document.domain not set correctly!");
                }
                return;
            }
            if (!iframeDesc) {
                iframeDesc = iframeMap[hostname] = {};
                iframe = iframeDesc.iframe = document.createElement("iframe");
                DOM.css(iframe, {
                    position:'absolute',
                    left:'-9999px',
                    top:'-9999px'
                });
                DOM.prepend(iframe, doc.body || doc.documentElement);
                iframe.src = self.__protocol + "//" + hostname + proxy;
            } else {
                iframe = iframeDesc.iframe;
            }

            Event.on(iframe, "load", self._onLoad, self);

        },

        _onLoad:function() {
            var self = this,
                hostname = self.__hostname,
                iframeDesc = iframeMap[hostname];
            iframeDesc.ready = 1;
            Event.detach(iframeDesc.iframe, "load", self._onLoad, self);
            self.send();
        }
    });

    return SubDomain;

}, {
    requires:['./xhrbase','event','dom']
});/**
 * use flash to accomplish cross domain request , usage scenario ? why not jsonp ?
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xdr", function(S, io, DOM) {

    var // current running request instances
        maps = {},
        ID = "io_swf",
        // flash transporter
        flash,
        doc = document,
        // whether create the flash transporter
        init = false;

    // create the flash transporter
    function _swf(uri, _, uid) {
        if (init) {
            return;
        }
        init = true;
        var o = '<object id="' + ID +
            '" type="application/x-shockwave-flash" data="' +
            uri + '" width="0" height="0">' +
            '<param name="movie" value="' +
            uri + '" />' +
            '<param name="FlashVars" value="yid=' +
            _ + '&uid=' +
            uid +
            '&host=KISSY.io" />' +
            '<param name="allowScriptAccess" value="always" />' +
            '</object>',
            c = doc.createElement('div');
        DOM.prepend(c, doc.body || doc.documentElement);
        c.innerHTML = o;
    }

    function XdrTransport(xhrObj) {
        S.log("use flash xdr");
        this.xhrObj = xhrObj;
    }

    S.augment(XdrTransport, {
        // rewrite send to support flash xdr
        send:function() {
            var self = this,
                xhrObj = self.xhrObj,
                c = xhrObj.config;
            var xdr = c['xdr'] || {};
            // 不提供则使用 cdn 默认的 flash
            _swf(xdr.src || (S.Config.base + "ajax/io.swf"), 1, 1);
            // 简便起见，用轮训
            if (!flash) {
                // S.log("detect xdr flash");
                setTimeout(function() {
                    self.send();
                }, 200);
                return;
            }
            self._uid = S.guid();
            maps[self._uid] = self;

            // ie67 send 出错？
            flash.send(c.url, {
                id:self._uid,
                uid:self._uid,
                method:c.type,
                data:c.hasContent && c.data || {}
            });
        },

        abort:function() {
            flash.abort(this._uid);
        },

        _xdrResponse:function(e, o) {
            // S.log(e);
            var self = this,
                ret,
                xhrObj = self.xhrObj;

            // need decodeURI to get real value from flash returned value
            xhrObj.responseText = decodeURI(o.c.responseText);

            switch (e) {
                case 'success':
                    ret = { status: 200, statusText: "success" };
                    delete maps[o.id];
                    break;
                case 'abort':
                    delete maps[o.id];
                    break;
                case 'timeout':
                case 'transport error':
                case 'failure':
                    delete maps[o.id];
                    ret = { status: 500, statusText: e };
                    break;
            }
            if (ret) {
                xhrObj.callback(ret.status, ret.statusText);
            }
        }
    });

    /*called by flash*/
    io['applyTo'] = function(_, cmd, args) {
        // S.log(cmd + " execute");
        var cmds = cmd.split("."),
            func = S;
        S.each(cmds, function(c) {
            func = func[c];
        });
        func.apply(null, args);
    };

    // when flash is loaded
    io['xdrReady'] = function() {
        flash = doc.getElementById(ID);
    };

    /**
     * when response is returned from server
     * @param e response status
     * @param o internal data
     * @param c internal data
     */
    io['xdrResponse'] = function(e, o, c) {
        var xhr = maps[o.uid];
        xhr && xhr._xdrResponse(e, o, c);
    };

    // export io for flash to call
    S.io = io;

    return XdrTransport;

}, {
    requires:["./base",'dom']
});/**
 * ajax xhr transport class , route subdomain , xdr
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhr", function(S, io, XhrBase, SubDomain, XdrTransport) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

    var _XDomainRequest = window['XDomainRequest'];

    var detectXhr = XhrBase.xhr();

    if (detectXhr) {

        // slice last two pars
        // xx.taobao.com => taobao.com
        function getMainDomain(host) {
            var t = host.split('.');
            if (t.length < 2) {
                return t.join(".");
            } else {
                return t.reverse().slice(0, 2).reverse().join('.');
            }
        }

        function XhrTransport(xhrObj) {
            var c = xhrObj.config,
                xdrCfg = c['xdr'] || {};

            if (c.crossDomain) {

                var parts = c.url.match(rurl);

                // 跨子域
                if (getMainDomain(location.hostname) == getMainDomain(parts[2])) {
                    return new SubDomain(xhrObj);
                }

                /**
                 * ie>7 强制使用 flash xdr
                 */
                if (!("withCredentials" in detectXhr) &&
                    (String(xdrCfg.use) === "flash" || !_XDomainRequest)) {
                    return new XdrTransport(xhrObj);
                }
            }

            this.xhrObj = xhrObj;

            return undefined;
        }

        S.augment(XhrTransport, XhrBase.proto, {

            send:function() {
                var self = this,
                    xhrObj = self.xhrObj,
                    c = xhrObj.config;
                self.xhr = XhrBase.xhr(c.crossDomain);
                self.sendInternal();
            }

        });

        io.setupTransport("*", XhrTransport);
    }

    return io;
}, {
    requires:["./base",'./xhrbase','./subdomain',"./xdr"]
});

/**
 * 借鉴 jquery，优化使用原型替代闭包
 **//**
 * base for xhr and subdomain
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhrbase", function(S, io) {
    var OK_CODE = 200,
        win = window,
        // http://msdn.microsoft.com/en-us/library/cc288060(v=vs.85).aspx
        _XDomainRequest = win['XDomainRequest'],
        NO_CONTENT_CODE = 204,
        NOT_FOUND_CODE = 404,
        NO_CONTENT_CODE2 = 1223,
        XhrBase = {
            proto:{}
        };

    function createStandardXHR(_, refWin) {
        try {
            return new (refWin || win)['XMLHttpRequest']();
        } catch(e) {
            S.log("createStandardXHR error");
        }
        return undefined;
    }

    function createActiveXHR(_, refWin) {
        try {
            return new (refWin || win)['ActiveXObject']("Microsoft.XMLHTTP");
        } catch(e) {
            S.log("createActiveXHR error");
        }
        return undefined;
    }

    XhrBase.xhr = win.ActiveXObject ? function(crossDomain, refWin) {
        if (crossDomain && _XDomainRequest) {
            return new _XDomainRequest();
        }
        // ie7 XMLHttpRequest 不能访问本地文件
        return !io.isLocal && createStandardXHR(crossDomain, refWin) || createActiveXHR(crossDomain, refWin);
    } : createStandardXHR;

    function isInstanceOfXDomainRequest(xhr) {
        return _XDomainRequest && (xhr instanceof _XDomainRequest);
    }

    S.mix(XhrBase.proto, {
        sendInternal:function() {

            var self = this,
                xhrObj = self.xhrObj,
                c = xhrObj.config;

            var xhr = self.xhr,
                xhrFields,
                i;

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
            // yui3 and jquery both have
            if (!c.crossDomain && !xhrObj.requestHeaders["X-Requested-With"]) {
                xhrObj.requestHeaders[ "X-Requested-With" ] = "XMLHttpRequest";
            }
            try {
                // 跨域时，不能设，否则请求变成
                // OPTIONS /xhr/r.php HTTP/1.1
                if (!c.crossDomain) {
                    for (i in xhrObj.requestHeaders) {
                        xhr.setRequestHeader(i, xhrObj.requestHeaders[ i ]);
                    }
                }
            } catch(e) {
                S.log("setRequestHeader in xhr error : ");
                S.log(e);
            }

            xhr.send(c.hasContent && c.data || null);

            if (!c.async || xhr.readyState == 4) {
                self._callback();
            } else {
                // _XDomainRequest 单独的回调机制
                if (isInstanceOfXDomainRequest(xhr)) {
                    xhr.onload = function() {
                        xhr.readyState = 4;
                        xhr.status = 200;
                        self._callback();
                    };
                    xhr.onerror = function() {
                        xhr.readyState = 4;
                        xhr.status = 500;
                        self._callback();
                    };
                } else {
                    xhr.onreadystatechange = function() {
                        self._callback();
                    };
                }
            }
        },
        // 由 xhrObj.abort 调用，自己不可以调用 xhrObj.abort
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

                    // ie6 ActiveObject 设置不恰当属性导致出错
                    if (isInstanceOfXDomainRequest(xhr)) {
                        xhr.onerror = S.noop;
                        xhr.onload = S.noop;
                    } else {
                        // ie6 ActiveObject 只能设置，不能读取这个属性，否则出错！
                        xhr.onreadystatechange = S.noop;
                    }

                    if (abort) {
                        // 完成以后 abort 不要调用
                        if (xhr.readyState !== 4) {
                            xhr.abort();
                        }
                    } else {
                        var status = xhr.status;

                        // _XDomainRequest 不能获取响应头
                        if (!isInstanceOfXDomainRequest(xhr)) {
                            xhrObj.responseHeadersString = xhr.getAllResponseHeaders();
                        }

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
                            S.log("xhr statustext error : ");
                            S.log(e);
                            // We normalize with Webkit giving an empty statusText
                            statusText = "";
                        }

                        // Filter status for non standard behaviors
                        // If the request is local and we have data: assume a success
                        // (success with no data won't get notified, that's the best we
                        // can do given current implementations)
                        if (!status && io.isLocal && !c.crossDomain) {
                            status = xhrObj.responseText ? OK_CODE : NOT_FOUND_CODE;
                            // IE - #1450: sometimes returns 1223 when it should be 204
                        } else if (status === NO_CONTENT_CODE2) {
                            status = NO_CONTENT_CODE;
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

    return XhrBase;
}, {
    requires:['./base']
});/**
 * encapsulation of io object . as transaction object in yui3
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhrobject", function(S, Event) {

    var OK_CODE = 200,
        MULTIPLE_CHOICES = 300,
        NOT_MODIFIED = 304,
        // get individual response header from responseheader str
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

        // 例如 script 直接是js引擎执行，没有返回值，不需要自己处理初始返回值
        // jsonp 时还需要把 script 转换成 json，后面还得自己来
        if (text || xml) {

            var contentType = xhr.mimeType || xhr.getResponseHeader("Content-Type");

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
            if (dataType[0] == "text" && text !== undefined) {
                responseData = text;
            }
            // 有 xml 值才直接取，否则可能还要从 xml 转
            else if (dataType[0] == "xml" && xml !== undefined) {
                responseData = xml;
            } else {
                // 看能否从 text xml 转换到合适数据
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
            // 结构化数据，如 json
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
                //debugger
                var xhr = this;
                // 只能执行一次，防止重复执行
                // 例如完成后，调用 abort

                // 到这要么成功，调用success
                // 要么失败，调用 error
                // 最终都会调用 complete
                if (xhr.state == 2) {
                    return;
                }
                xhr.state = 2;
                xhr.readyState = 4;
                var isSuccess;
                if (status >= OK_CODE && status < MULTIPLE_CHOICES || status == NOT_MODIFIED) {

                    if (status == NOT_MODIFIED) {
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
});KISSY.add("ajax", function(S, serializer, io) {
    var undef = undefined;
    // some shortcut
    S.mix(io, {

        /**
         * form 序列化
         * @param formElement {HTMLFormElement} 将要序列化的 form 元素
         */
        serialize:serializer.serialize,

        get: function(url, data, callback, dataType, _t) {
            // data 参数可省略
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
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
                data = undef;
            }
            return io.get(url, data, callback, dataType, "post");
        },

        jsonp: function(url, data, callback) {
            if (S.isFunction(data)) {
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, "jsonp");
        },

        // 和 S.getScript 保持一致
        // 更好的 getScript 可以用
        /*
         io({
         dataType:'script'
         });
         */
        getScript:S.getScript,

        getJSON: function(url, data, callback) {
            if (S.isFunction(data)) {
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, "json");
        },

        upload:function(url, form, data, callback, dataType) {
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }
            return io({
                url:url,
                type:'post',
                dataType:dataType,
                form:form,
                data:data,
                success:callback
            });
        }
    });

    return io;
}, {
    requires:[
        "ajax/form-serializer",
        "ajax/base",
        "ajax/xhrobject",
        "ajax/xhr",
        "ajax/script",
        "ajax/jsonp",
        "ajax/form",
        "ajax/iframe-upload"]
});
