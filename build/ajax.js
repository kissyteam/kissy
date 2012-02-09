/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Feb 9 18:01
*/
/**
 * @fileOverview form data  serialization util
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/FormSerializer", function(S, DOM) {
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
            S.each(DOM.query(forms),function(el) {
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
});/**
 * @fileOverview non-refresh upload file with form by iframe
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/IframeTransport", function (S, DOM, Event, io) {

    var doc = document,
        OK_CODE = 200,
        ERROR_CODE = 500,
        BREATH_INTERVAL = 30;

    // iframe 内的内容就是 body.innerText
    io.setupConfig({
        converters:{
            // iframe 到其他类型的转化和 text 一样
            iframe:io.getConfig().converters.text,
            text:{
                iframe:function (text) {
                    return text;
                }
            }
        }
    });

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

    function IframeTransport(xhrObject) {
        this.xhrObject = xhrObject;
    }

    S.augment(IframeTransport, {
        send:function () {

            var self = this,
                xhrObject = self.xhrObject,
                c = xhrObject.config,
                fields,
                form = DOM.get(c.form);

            self.attrs = {
                target:DOM.attr(form, "target") || "",
                action:DOM.attr(form, "action") || ""
            };
            self.form = form;

            createIframe(xhrObject);

            // set target to iframe to avoid main page refresh
            DOM.attr(form, {
                "target":xhrObject.iframeId,
                "action":c.url
            });

            if (c.data) {
                fields = addDataToForm(c.data, form, c.serializeArray);
            }

            self.fields = fields;

            var iframe = xhrObject.iframe;

            Event.on(iframe, "load error", self._callback, self);

            form.submit();

        },

        _callback:function (event, abort) {
            //debugger
            var self=this,
                form = self.form,
                xhrObject = self.xhrObject,
                eventType = event.type,
                iframe = xhrObject.iframe;

            // 防止重复调用 , 成功后 abort
            if (!iframe) {
                return;
            }

            DOM.attr(form, self.attrs);

            if (eventType == "load") {
                var iframeDoc = iframe.contentWindow.document;
                xhrObject.responseXML = iframeDoc;
                xhrObject.responseText = DOM.text(iframeDoc.body);
                xhrObject._xhrReady(OK_CODE, "success");
            } else if (eventType == 'error') {
                xhrObject._xhrReady(ERROR_CODE, "error");
            }

            removeFieldsFromData(this.fields);

            Event.detach(iframe);

            setTimeout(function () {
                // firefox will keep loading if not settimeout
                DOM.remove(iframe);
            }, BREATH_INTERVAL);

            // nullify to prevent memory leak?
            xhrObject.iframe = null;
        },

        abort:function () {
            this._callback({}, 1);
        }
    });

    io.setupTransport("iframe", IframeTransport);

    return io;

}, {
    requires:["dom", "event", "./base"]
});/**
 * @fileOverview script transport for kissy io
 * @description: modified version of S.getScript , add abort ability
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/ScriptTransport", function (S, io) {

    var doc = document,
        OK_CODE = 200,
        ERROR_CODE = 500;

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
                script:function (text) {
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
        send:function () {
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
                    script.onreadystatechange = function (e) {
                        e = e || window.event;
                        // firefox onerror 没有 type ?!
                        self._callback((e.type || "error").toLowerCase());
                    };

            head.insertBefore(script, head.firstChild);
        },

        _callback:function (event, abort) {
            var script = this.script,
                xhrObj = this.xhrObj,
                head = this.head;

            // 防止重复调用,成功后 abort
            if (!script) {
                return;
            }

            if (
                abort ||
                    !script.readyState ||
                    /loaded|complete/.test(script.readyState) ||
                    event == "error"
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
                    xhrObj._xhrReady(OK_CODE, "success");
                }
                // 非 ie<9 可以判断出来
                else if (event == "error") {
                    xhrObj._xhrReady(ERROR_CODE, "scripterror");
                }
            }
        },

        abort:function () {
            this._callback(0, 1);
        }
    });

    io.setupTransport("script", ScriptTransport);

    return io;

}, {
    requires:['./base', './XhrTransport']
});/**
 * @fileOverview solve io between sub domains using proxy page
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/SubDomainTransport", function (S, XhrTransportBase, Event, DOM) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        PROXY_PAGE = "/sub_domain_proxy.html",
        doc = document,
        iframeMap = {
            // hostname:{iframe: , ready:}
        };

    function SubDomainTransport(xhrObj) {
        var self = this,
            c = xhrObj.config;
        self.xhrObj = xhrObj;
        var m = c.url.match(rurl);
        self.hostname = m[2];
        self.protocol = m[1];
        c.crossDomain = false;
    }


    S.augment(SubDomainTransport, XhrTransportBase.proto, {
        // get nativeXhr from iframe document
        // not from current document directly like XhrTransport
        send:function () {
            var self = this,
                c = self.xhrObj.config,
                hostname = self.hostname,
                iframe,
                iframeDesc = iframeMap[hostname];

            var proxy = PROXY_PAGE;

            if (c['xdr'] && c['xdr']['subDomain'] && c['xdr']['subDomain'].proxy) {
                proxy = c['xdr']['subDomain'].proxy;
            }

            if (iframeDesc && iframeDesc.ready) {
                self.nativeXhr = XhrTransportBase.nativeXhr(0, iframeDesc.iframe.contentWindow);
                if (self.nativeXhr) {
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
                iframe.src = self.protocol + "//" + hostname + proxy;
            } else {
                iframe = iframeDesc.iframe;
            }

            Event.on(iframe, "load", _onLoad, self);

        }
    });

    function _onLoad() {
        var self = this,
            hostname = self.hostname,
            iframeDesc = iframeMap[hostname];
        iframeDesc.ready = 1;
        Event.detach(iframeDesc.iframe, "load", _onLoad, self);
        self.send();
    }

    return SubDomainTransport;

}, {
    requires:['./XhrTransportBase', 'event', 'dom']
});/**
 * @fileOverview use flash to accomplish cross domain request , usage scenario ? why not jsonp ?
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/XdrFlashTransport", function (S, io, DOM) {

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
            '&host=KISSY.require(\'ajax\')" />' +
            '<param name="allowScriptAccess" value="always" />' +
            '</object>',
            c = doc.createElement('div');
        DOM.prepend(c, doc.body || doc.documentElement);
        c.innerHTML = o;
    }

    function XdrFlashTransport(xhrObj) {
        S.log("use flash xdr");
        this.xhrObj = xhrObj;
    }

    S.augment(XdrFlashTransport, {
        // rewrite send to support flash xdr
        send:function () {
            var self = this,
                xhrObj = self.xhrObj,
                c = xhrObj.config;
            var xdr = c['xdr'] || {};
            // 不提供则使用 cdn 默认的 flash
            _swf(xdr.src || (S.Config.base + "ajax/io.swf"), 1, 1);
            // 简便起见，用轮训
            if (!flash) {
                // S.log("detect xdr flash");
                setTimeout(function () {
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

        abort:function () {
            flash.abort(this._uid);
        },

        _xdrResponse:function (e, o) {
            S.log(e);
            var self = this,
                ret,
                xhrObj = self.xhrObj;

            // need decodeURI to get real value from flash returned value
            xhrObj.responseText = decodeURI(o.c.responseText);

            switch (e) {
                case 'success':
                    ret = { status:200, statusText:"success" };
                    delete maps[o.id];
                    break;
                case 'abort':
                    delete maps[o.id];
                    break;
                case 'timeout':
                case 'transport error':
                case 'failure':
                    delete maps[o.id];
                    ret = { status:500, statusText:e };
                    break;
            }
            if (ret) {
                xhrObj._xhrReady(ret.status, ret.statusText);
            }
        }
    });

    /*called by flash*/
    io['applyTo'] = function (_, cmd, args) {
        // S.log(cmd + " execute");
        var cmds = cmd.split(".").slice(1),
            func = io;
        S.each(cmds, function (c) {
            func = func[c];
        });
        func.apply(null, args);
    };

    // when flash is loaded
    io['xdrReady'] = function () {
        flash = doc.getElementById(ID);
    };

    /**
     * when response is returned from server
     * @param e response status
     * @param o internal data
     * @param c internal data
     */
    io['xdrResponse'] = function (e, o, c) {
        var xhr = maps[o.uid];
        xhr && xhr._xdrResponse(e, o, c);
    };

    return XdrFlashTransport;

}, {
    requires:["./base", 'dom']
});/**
 * @fileOverview encapsulation of io object . as transaction object in yui3
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/XhrObject", function (S, undefined) {

    var OK_CODE = 200,
        Promise = S.Promise,
        MULTIPLE_CHOICES = 300,
        NOT_MODIFIED = 304,
        // get individual response header from responseheader str
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;

    function handleResponseData(xhrObject) {

        // text xml 是否原生转化支持
        var text = xhrObject.responseText,
            xml = xhrObject.responseXML,
            c = xhrObject.config,
            cConverts = c.converters,
            xConverts = xhrObject.converters || {},
            type,
            responseData,
            contents = c.contents,
            dataType = c.dataType;

        // 例如 script 直接是js引擎执行，没有返回值，不需要自己处理初始返回值
        // jsonp 时还需要把 script 转换成 json，后面还得自己来
        if (text || xml) {

            var contentType = xhrObject.mimeType || xhrObject.getResponseHeader("Content-Type");

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
                // 看能否从 text xml 转换到合适数据，并设置起始类型为 text/xml
                S.each(["text", "xml"], function (prevType) {
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

        xhrObject.responseData = responseData;
    }

    /**
     * @class 请求对象类型
     * @memberOf io
     * @param c 请求发送配置选项
     */
    function XhrObject(c) {
        Promise.call(this);
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
            transport:null,
            _defer:new S.Defer(this)
        });
    }

    S.extend(XhrObject, Promise, {
            // Caches the header
            setRequestHeader:function (name, value) {
                var self = this;
                self.requestHeaders[ name ] = value;
                return self;
            },

            // Raw string
            getAllResponseHeaders:function () {
                var self = this;
                return self.state === 2 ? self.responseHeadersString : null;
            },

            // Builds headers hashtable if needed
            getResponseHeader:function (key) {
                var match, self = this;
                if (self.state === 2) {
                    if (!self.responseHeaders) {
                        self.responseHeaders = {};
                        while (( match = rheaders.exec(self.responseHeadersString) )) {
                            self.responseHeaders[ match[1] ] = match[ 2 ];
                        }
                    }
                    match = self.responseHeaders[ key];
                }
                return match === undefined ? null : match;
            },

            // Overrides response content-type header
            overrideMimeType:function (type) {
                var self = this;
                if (!self.state) {
                    self.mimeType = type;
                }
                return self;
            },

            // Cancel the request
            abort:function (statusText) {
                var self = this;
                statusText = statusText || "abort";
                if (self.transport) {
                    self.transport.abort(statusText);
                }
                self._xhrReady(0, statusText);
                return self;
            },

            _xhrReady:function (status, statusText) {
                var self = this;
                // 只能执行一次，防止重复执行
                // 例如完成后，调用 abort

                // 到这要么成功，调用success
                // 要么失败，调用 error
                // 最终都会调用 complete
                if (self.state == 2) {
                    return;
                }
                self.state = 2;
                self.readyState = 4;
                var isSuccess;
                if (status >= OK_CODE && status < MULTIPLE_CHOICES || status == NOT_MODIFIED) {

                    if (status == NOT_MODIFIED) {
                        statusText = "notmodified";
                        isSuccess = true;
                    } else {
                        try {
                            handleResponseData(self);
                            statusText = "success";
                            isSuccess = true;
                        } catch (e) {
                            statusText = "parsererror : " + e;
                        }
                    }

                } else {
                    if (status < 0) {
                        status = 0;
                    }
                }

                self.status = status;
                self.statusText = statusText;

                var defer = self._defer;
                defer[isSuccess ? "resolve" : "reject"]([self.responseData, self.statusText, self]);
                self.transport = undefined;
            }
        }
    );

    return XhrObject;
});/**
 * @fileOverview ajax xhr transport class , route subdomain , xdr
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/XhrTransport", function (S, io, XhrTransportBase, SubDomainTransport, XdrFlashTransport, undefined) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        _XDomainRequest = window['XDomainRequest'],
        detectXhr = XhrTransportBase.nativeXhr();

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
                    return new SubDomainTransport(xhrObj);
                }

                /**
                 * ie>7 强制使用 flash xdr
                 */
                if (!("withCredentials" in detectXhr) &&
                    (String(xdrCfg.use) === "flash" || !_XDomainRequest)) {
                    return new XdrFlashTransport(xhrObj);
                }
            }

            this.xhrObj = xhrObj;

            return undefined;
        }

        S.augment(XhrTransport, XhrTransportBase.proto, {

            send:function () {
                var self = this,
                    xhrObj = self.xhrObj,
                    c = xhrObj.config;
                self.nativeXhr = XhrTransportBase.nativeXhr(c.crossDomain);
                self.sendInternal();
            }

        });

        io.setupTransport("*", XhrTransport);
    }

    return io;
}, {
    requires:["./base", './XhrTransportBase', './SubDomainTransport', "./XdrFlashTransport"]
});

/**
 * 借鉴 jquery，优化使用原型替代闭包
 **//**
 * @fileOverview base for xhr and subdomain
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/XhrTransportBase", function (S, io) {
    var OK_CODE = 200,
        win = window,
        // http://msdn.microsoft.com/en-us/library/cc288060(v=vs.85).aspx
        _XDomainRequest = win['XDomainRequest'],
        NO_CONTENT_CODE = 204,
        NOT_FOUND_CODE = 404,
        NO_CONTENT_CODE2 = 1223,
        XhrTransportBase = {
            proto:{}
        };

    function createStandardXHR(_, refWin) {
        try {
            return new (refWin || win)['XMLHttpRequest']();
        } catch (e) {
            //S.log("createStandardXHR error");
        }
        return undefined;
    }

    function createActiveXHR(_, refWin) {
        try {
            return new (refWin || win)['ActiveXObject']("Microsoft.XMLHTTP");
        } catch (e) {
            S.log("createActiveXHR error");
        }
        return undefined;
    }

    XhrTransportBase.nativeXhr = win.ActiveXObject ? function (crossDomain, refWin) {
        if (crossDomain && _XDomainRequest) {
            return new _XDomainRequest();
        }
        // ie7 XMLHttpRequest 不能访问本地文件
        return !io.isLocal && createStandardXHR(crossDomain, refWin) || createActiveXHR(crossDomain, refWin);
    } : createStandardXHR;

    function isInstanceOfXDomainRequest(xhr) {
        return _XDomainRequest && (xhr instanceof _XDomainRequest);
    }

    S.mix(XhrTransportBase.proto, {
        sendInternal:function () {

            var self = this,
                xhrObj = self.xhrObj,
                c = xhrObj.config;

            var nativeXhr = self.nativeXhr,
                xhrFields,
                i;

            if (c['username']) {
                nativeXhr.open(c.type, c.url, c.async, c['username'], c.password)
            } else {
                nativeXhr.open(c.type, c.url, c.async);
            }

            if (xhrFields = c['xhrFields']) {
                for (i in xhrFields) {
                    if (xhrFields.hasOwnProperty(i)) {
                        nativeXhr[ i ] = xhrFields[ i ];
                    }
                }
            }

            // Override mime type if supported
            if (xhrObj.mimeType && nativeXhr.overrideMimeType) {
                nativeXhr.overrideMimeType(xhrObj.mimeType);
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
                        nativeXhr.setRequestHeader(i, xhrObj.requestHeaders[ i ]);
                    }
                }
            } catch (e) {
                S.log("setRequestHeader in xhr error : ");
                S.log(e);
            }

            nativeXhr.send(c.hasContent && c.data || null);

            if (!c.async || nativeXhr.readyState == 4) {
                self._callback();
            } else {
                // _XDomainRequest 单独的回调机制
                if (isInstanceOfXDomainRequest(nativeXhr)) {
                    nativeXhr.onload = function () {
                        nativeXhr.readyState = 4;
                        nativeXhr.status = 200;
                        self._callback();
                    };
                    nativeXhr.onerror = function () {
                        nativeXhr.readyState = 4;
                        nativeXhr.status = 500;
                        self._callback();
                    };
                } else {
                    nativeXhr.onreadystatechange = function () {
                        self._callback();
                    };
                }
            }
        },
        // 由 xhrObj.abort 调用，自己不可以调用 xhrObj.abort
        abort:function () {
            this._callback(0, 1);
        },

        _callback:function (event, abort) {
            // Firefox throws exceptions when accessing properties
            // of an xhr when a network error occured
            // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
            try {
                var self = this,
                    nativeXhr = self.nativeXhr,
                    xhrObj = self.xhrObj,
                    c = xhrObj.config;
                //abort or complete
                if (abort || nativeXhr.readyState == 4) {

                    // ie6 ActiveObject 设置不恰当属性导致出错
                    if (isInstanceOfXDomainRequest(nativeXhr)) {
                        nativeXhr.onerror = S.noop;
                        nativeXhr.onload = S.noop;
                    } else {
                        // ie6 ActiveObject 只能设置，不能读取这个属性，否则出错！
                        nativeXhr.onreadystatechange = S.noop;
                    }

                    if (abort) {
                        // 完成以后 abort 不要调用
                        if (nativeXhr.readyState !== 4) {
                            nativeXhr.abort();
                        }
                    } else {
                        var status = nativeXhr.status;

                        // _XDomainRequest 不能获取响应头
                        if (!isInstanceOfXDomainRequest(nativeXhr)) {
                            xhrObj.responseHeadersString = nativeXhr.getAllResponseHeaders();
                        }

                        var xml = nativeXhr.responseXML;

                        // Construct response list
                        if (xml && xml.documentElement /* #4958 */) {
                            xhrObj.responseXML = xml;
                        }
                        xhrObj.responseText = nativeXhr.responseText;

                        // Firefox throws an exception when accessing
                        // statusText for faulty cross-domain requests
                        try {
                            var statusText = nativeXhr.statusText;
                        } catch (e) {
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

                        xhrObj._xhrReady(status, statusText);

                    }
                }
            } catch (firefoxAccessException) {
                nativeXhr.onreadystatechange = S.noop;
                if (!abort) {
                    xhrObj._xhrReady(-1, firefoxAccessException);
                }
            }
        }
    });

    return XhrTransportBase;
}, {
    requires:['./base']
});/**
 * @fileOverview io shortcut
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax", function (S, serializer, io, XhrObject) {
    var undef = undefined;
    // some shortcut
    S.mix(io,

        /**
         * @lends io
         */
        {
            XhrObject:XhrObject,
            /**
             * form 序列化
             * @param formElement {HTMLFormElement} 将要序列化的 form 元素
             */
            serialize:serializer.serialize,

            /**
             * get 请求
             * @param url
             * @param data
             * @param callback
             * @param [dataType]
             * @param [_t]
             */
            get:function (url, data, callback, dataType, _t) {
                // data 参数可省略
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                    data = undef;
                }

                return io({
                    type:_t || "get",
                    url:url,
                    data:data,
                    success:callback,
                    dataType:dataType
                });
            },

            /**
             * post 请求
             * @param url
             * @param data
             * @param callback
             * @param [dataType]
             */
            post:function (url, data, callback, dataType) {
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                    data = undef;
                }
                return io.get(url, data, callback, dataType, "post");
            },

            /**
             * jsonp 请求
             * @param url
             * @param [data]
             * @param callback
             */
            jsonp:function (url, data, callback) {
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

            /**
             * 获取 json 数据
             * @param url
             * @param data
             * @param callback
             */
            getJSON:function (url, data, callback) {
                if (S.isFunction(data)) {
                    callback = data;
                    data = undef;
                }
                return io.get(url, data, callback, "json");
            },

            /**
             * 无刷新上传文件
             * @param url
             * @param form
             * @param data
             * @param callback
             * @param [dataType]
             */
            upload:function (url, form, data, callback, dataType) {
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

    S.mix(S, {
        "Ajax":io,
        "IO":io,
        ajax:io,
        io:io,
        jsonp:io.jsonp
    });

    return io;
}, {
    requires:[
        "ajax/FormSerializer",
        "ajax/base",
        "ajax/XhrObject",
        "ajax/XhrTransport",
        "ajax/ScriptTransport",
        "ajax/jsonp",
        "ajax/form",
        "ajax/IframeTransport"]
});/**
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
            // deep mix,exclude context!
            var context = c.context;
            delete c.context;
            c = S.mix(S.clone(defaultConfig), c || {}, undefined, undefined, true);
            c.context = context;

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
 **//**
 * @fileOverview process form config
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/form", function(S, io, DOM, FormSerializer) {

    io.on("start", function(e) {
        var xhrObject = e.xhr,
            c = xhrObject.config;
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
        requires:['./base',"dom","./FormSerializer"]
    });/**
 * @fileOverview jsonp transport based on script transport
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/jsonp", function (S, io) {

    io.setupConfig({
        jsonp:"callback",
        jsonpCallback:function () {
            // 不使用 now() ，极端情况下可能重复
            return S.guid("jsonp");
        }
    });

    io.on("start", function (e) {
        var xhrObject = e.xhr,
            c = xhrObject.config;
        if (c.dataType[0] == "jsonp") {
            var response,
                cJsonpCallback = c.jsonpCallback,
                jsonpCallback = S.isFunction(cJsonpCallback) ?
                    cJsonpCallback() :
                    cJsonpCallback,
                previous = window[ jsonpCallback ];

            c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.jsonp + "=" + jsonpCallback;

            // build temporary JSONP function
            window[jsonpCallback] = function (r) {
                // 使用数组，区别：故意调用了 jsonpCallback(undefined) 与 根本没有调用
                // jsonp 返回了数组
                if (arguments.length > 1) {
                    r = S.makeArray(arguments);
                }
                response = [r];
            };

            // cleanup whether success or failure
            xhrObject.fin(function () {
                window[ jsonpCallback ] = previous;
                if (previous === undefined) {
                    try {
                        delete window[ jsonpCallback ];
                    } catch (e) {
                        //S.log("delete window variable error : ");
                        //S.log(e);
                    }
                } else if (response) {
                    // after io success handler called
                    // then call original existed jsonpcallback
                    previous(response[0]);
                }
            });

            xhrObject.converters = xhrObject.converters || {};
            xhrObject.converters.script = xhrObject.converters.script || {};

            // script -> jsonp ,jsonp need to see json not as script
            // if ie onload a 404 file or all browsers onload an invalid script
            // 404/invalid will be caught here
            // because response is undefined( jsonp callback is never called)
            // error throwed will be caught in conversion step
            // and KISSY will notify user by error callback
            xhrObject.converters.script.json = function () {
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
