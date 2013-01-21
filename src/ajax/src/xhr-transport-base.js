/**
 * @ignore
 * base for xhr and subdomain
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/xhr-transport-base', function (S, IO) {
        var OK_CODE = 200,
            win = S.Env.host,
        // http://msdn.microsoft.com/en-us/library/cc288060(v=vs.85).aspx
            _XDomainRequest = S.UA.ie > 7 && win['XDomainRequest'],
            NO_CONTENT_CODE = 204,
            NOT_FOUND_CODE = 404,
            NO_CONTENT_CODE2 = 1223,
            XhrTransportBase = {
                proto: {}
            }, lastModifiedCached = {},
            eTagCached = {};

        IO.__lastModifiedCached = lastModifiedCached;
        IO.__eTagCached = eTagCached;

        function createStandardXHR(_, refWin) {
            try {
                return new (refWin || win)['XMLHttpRequest']();
            } catch (e) {
                S.log('createStandardXHR error: ' + _);
            }
            return undefined;
        }

        function createActiveXHR(_, refWin) {
            try {
                return new (refWin || win)['ActiveXObject']('Microsoft.XMLHTTP');
            } catch (e) {
                S.log('createActiveXHR error: ' + _);
            }
            return undefined;
        }

        XhrTransportBase.nativeXhr = win['ActiveXObject'] ? function (crossDomain, refWin) {
            // consider ie10
            if (!XhrTransportBase.supportCORS && crossDomain && _XDomainRequest) {
                return new _XDomainRequest();
            }
            // ie7 XMLHttpRequest 不能访问本地文件
            return !IO.isLocal && createStandardXHR(crossDomain, refWin) ||
                createActiveXHR(crossDomain, refWin);
        } : createStandardXHR;

        XhrTransportBase._XDomainRequest = _XDomainRequest;
        XhrTransportBase.supportCORS = ('withCredentials' in XhrTransportBase.nativeXhr());
        function isInstanceOfXDomainRequest(xhr) {
            return _XDomainRequest && (xhr instanceof _XDomainRequest);
        }

        function getIfModifiedKey(c) {
            var ifModified = c.ifModified,
                ifModifiedKey;
            if (ifModified) {
                ifModifiedKey = c.uri;
                if (c.cache === false) {
                    ifModifiedKey = ifModifiedKey.clone();
                    // remove random timestamp
                    // random timestamp is forced to fetch code file from server
                    ifModifiedKey.query.remove('_ksTS');
                }
                ifModifiedKey = ifModifiedKey.toString();
            }
            return ifModifiedKey;
        }

        S.mix(XhrTransportBase.proto, {
            sendInternal: function () {
                var self = this,
                    io = self.io,
                    c = io.config,
                    nativeXhr = self.nativeXhr,
                    type = c.type,
                    async = c.async,
                    username,
                    mimeType = io.mimeType,
                    requestHeaders = io.requestHeaders || {},
                    url = io._getUrlForSend(),
                    xhrFields,
                    ifModifiedKey = getIfModifiedKey(c),
                    cacheValue,
                    i;

                if (ifModifiedKey) {
                    // if io want a conditional load
                    // (response status is 304 and responseText is null)
                    // u need to set if-modified-since manually!
                    // or else
                    // u will always get response status 200 and full responseText
                    // which is also conditional load but process transparently by browser
                    if (cacheValue = lastModifiedCached[ifModifiedKey]) {
                        requestHeaders['If-Modified-Since'] = cacheValue;
                    }
                    if (cacheValue = eTagCached[ifModifiedKey]) {
                        requestHeaders['If-None-Match'] = cacheValue;
                    }
                }

                if (username = c['username']) {
                    nativeXhr.open(type, url, async, username, c.password)
                } else {
                    nativeXhr.open(type, url, async);
                }

                if (xhrFields = c['xhrFields']) {
                    for (i in xhrFields) {
                        nativeXhr[ i ] = xhrFields[ i ];
                    }
                }

                // Override mime type if supported
                if (mimeType && nativeXhr.overrideMimeType) {
                    nativeXhr.overrideMimeType(mimeType);
                }

                // set header event cross domain, eg: phonegap
                if (!requestHeaders['X-Requested-With']) {
                    requestHeaders[ 'X-Requested-With' ] = 'XMLHttpRequest';
                }


                // ie<10 XDomainRequest does not support setRequestHeader
                if (typeof nativeXhr.setRequestHeader !== 'undefined') {
                    for (i in requestHeaders) {
                        nativeXhr.setRequestHeader(i, requestHeaders[ i ]);
                    }
                }

                nativeXhr.send(c.hasContent && c.data || null);

                if (!async || nativeXhr.readyState == 4) {
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
            // 由 io.abort 调用，自己不可以调用 io.abort
            abort: function () {
                this._callback(0, 1);
            },

            _callback: function (event, abort) {
                // Firefox throws exceptions when accessing properties
                // of an xhr when a network error occurred
                // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
                var self = this,
                    nativeXhr = self.nativeXhr,
                    io = self.io,
                    ifModifiedKey,
                    lastModified,
                    eTag,
                    statusText,
                    xml,
                    c = io.config;
                try {
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
                            ifModifiedKey = getIfModifiedKey(c);

                            var status = nativeXhr.status;

                            // _XDomainRequest 不能获取响应头
                            if (!isInstanceOfXDomainRequest(nativeXhr)) {
                                io.responseHeadersString = nativeXhr.getAllResponseHeaders();
                            }

                            if (ifModifiedKey) {
                                lastModified = nativeXhr.getResponseHeader('Last-Modified');
                                eTag = nativeXhr.getResponseHeader('ETag');
                                // if u want to set if-modified-since manually
                                // u need to save last-modified after the first request
                                if (lastModified) {
                                    lastModifiedCached[ifModifiedKey] = lastModified;
                                }
                                if (eTag) {
                                    eTagCached[eTag] = eTag;
                                }
                            }

                            xml = nativeXhr.responseXML;

                            // Construct response list
                            if (xml && xml.documentElement /* #4958 */) {
                                io.responseXML = xml;
                            }
                            io.responseText = nativeXhr.responseText;

                            // Firefox throws an exception when accessing
                            // statusText for faulty cross-domain requests
                            try {
                                statusText = nativeXhr.statusText;
                            } catch (e) {
                                S.log('xhr statusText error: ');
                                S.log(e);
                                // We normalize with Webkit giving an empty statusText
                                statusText = '';
                            }

                            // Filter status for non standard behaviors
                            // If the request is local and we have data: assume a success
                            // (success with no data won't get notified, that's the best we
                            // can do given current implementations)
                            if (!status && IO.isLocal && !c.crossDomain) {
                                status = io.responseText ? OK_CODE : NOT_FOUND_CODE;
                                // IE - #1450: sometimes returns 1223 when it should be 204
                            } else if (status === NO_CONTENT_CODE2) {
                                status = NO_CONTENT_CODE;
                            }

                            io._ioReady(status, statusText);
                        }
                    }
                } catch (firefoxAccessException) {
                    nativeXhr.onreadystatechange = S.noop;
                    if (!abort) {
                        io._ioReady(-1, firefoxAccessException);
                    }
                }
            }
        })
        ;

        return XhrTransportBase;
    },
    {
        requires: ['./base']
    }
)
;