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


        function XhrTransport(c) {
            this.c = c;
        }

        S.augment(XhrTransport, {
                send:function(xhrObj, done) {
                    var c = this.c;

                    if (c.crossDomain && !allowCrossDomain) {
                        S.error("do not allow crossdomain xhr !");
                        return;
                    }

                    var xhr = io.xhr(),
                        xhrFields,
                        i;
                    this.xhr = xhr;
                    this.xhrObj = xhrObj;
                    this._done = done;
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

                },
                // _xhr == xhr except ie ?
                _callback:function(xhr, abort) {

                    // Firefox throws exceptions when accessing properties
                    // of an xhr when a network error occured
                    // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
                    try {
                        var xhrObj = this.xhrObj,
                            c = this.c,
                            done = this._done;
                        //abort or complete
                        if (abort || xhr.readyState == 4) {
                            xhr.onreadystatechange = S.noop;


                            if (abort) {
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

                                done(status, statusText, xhrObj);
                            }
                        }
                    } catch (firefoxAccessException) {
                        xhr.onreadystatechange = S.noop;
                        if (!abort) {
                            done(-1, firefoxAccessException, xhrObj);
                        }
                    }
                }


            });

        transports["json"] = XhrTransport;

    }
}, {
        requires:["./base"]
    });

/**
 * 借鉴 jquery，优化使用原型替代闭包
 **/