/**
 * ajax xhr transport class
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhr", function(S, io, XdrTransport) {


    var OK_CODE = 200,
        // http://msdn.microsoft.com/en-us/library/cc288060(v=vs.85).aspx
        _XDomainRequest = window['XDomainRequest'],
        NO_CONTENT_CODE = 204,
        NOT_FOUND_CODE = 404,
        NO_CONTENT_CODE2 = 1223;


    function createStandardXHR() {
        try {
            return new window.XMLHttpRequest();
        } catch(e) {
            S.log("createStandardXHR error");
            //S.log(e);
        }
        return undefined;
    }

    function createActiveXHR() {
        try {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
        } catch(e) {
            S.log("createActiveXHR error");
            // S.log(e);
        }
        return undefined;
    }

    function isInstanceOfXDomainRequest(xhr) {
        return _XDomainRequest && (xhr instanceof _XDomainRequest);
    }

    io.xhr = window.ActiveXObject ? function(crossDomain) {
        if (crossDomain && _XDomainRequest) {
            return new _XDomainRequest();
        }
        // ie7 XMLHttpRequest 不能访问本地文件
        return !io.isLocal && createStandardXHR() || createActiveXHR();
    } : createStandardXHR;

    var detectXhr = io.xhr();

    if (detectXhr) {

        function XhrTransport(xhrObj) {
            var c = xhrObj.config,
                xdrCfg = c['xdr'] || {};

            if (c.crossDomain) {
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

        S.augment(XhrTransport, {
            send:function() {

                var self = this,
                    xhrObj = self.xhrObj,
                    c = xhrObj.config;

                var xhr = io.xhr(c.crossDomain),
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
                    if (_XDomainRequest && (xhr instanceof _XDomainRequest)) {
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

        io.setupTransport("*", XhrTransport);

        return io;
    }
}, {
    requires:["./base","./xdr"]
});

/**
 * 借鉴 jquery，优化使用原型替代闭包
 **/