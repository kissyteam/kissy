/**
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
                    // yui3 and jquery both have
                    if (!c.crossDomain && !xhrObj.requestHeaders["X-Requested-With"]) {
                        xhrObj.requestHeaders[ "X-Requested-With" ] = "XMLHttpRequest";
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
 * 借鉴 jquery，优化使用原型替代闭包
 **/