/***
 * @module  ajax
 * @author  拔赤<lijing00333@163.com>
 */
KISSY.add('ajax', function(S, undef) {

    var win = window,

        transactionid = 0, // 通讯序列号
        id = function() {  // 获得新的通讯序列号
            return transactionid++;
        },

        eventCenter = S.mix({}, S.EventTarget),

        //检测 xhr 是否成功
        xhrSuccessful = function(xhr) {
            try {
                // ref: http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
                return (xhr.status >= 200 && xhr.status < 300) ||
                    // Opera returns 0 when status is 304
                    xhr.status === 304 || xhr.status === 0 || xhr.status === 1223;
            } catch(e) {
            }
            return false;
        },

        GET = 'GET',
        JSON = 'json', JSONP = JSON + 'p', CALLBACK = 'callback',

        jsre = /=\?(&|$)/,
        rquery = /\?/,

        // 默认配置
        // 参数含义和 jQuery 保持一致：http://api.jquery.com/jQuery.ajax/
        defaultConfig = {
            type: GET,
            url: '',
            global: true,
            contentType: 'application/x-www-form-urlencoded',
            async: true,
            data: null,
            xhr: win.XMLHttpRequest ?
                function() {
                    return new window.XMLHttpRequest();
                } :
                function() {
                    try {
                        return new window.ActiveXObject('Microsoft.XMLHTTP');
                    } catch(e) {
                    }
                },
            accepts: {
                xml: 'application/xml, text/xml',
                html: 'text/html',
                script: 'text/javascript, application/javascript',
                json: 'application/json, text/javascript',
                text: 'text/plain',
                _default: '*/*'
            },
            complete: function() {},
            success: function() {},
            error: function() {}
            // dataType
            // headers
        };

    S.io = function(s) {
        S.mix(s, defaultConfig);
        var jsonp, status, type = s.type.toUpperCase();

        // convert data if not already a string
        if (s.data && !S.isString(s.data)) {
            s.data = S.param(s.data);
        }

        // Handle JSONP Parameter Callbacks, 参照 jQuery, 保留 callback=? 的约定
        if (s.dataType === JSONP) {
            if (type === GET) {
                if (!jsre.test(s.url)) {
                    s.url += (rquery.test(s.url) ? "&" : "?") + (s.jsonp || "callback") + "=?";
                }
            } else if (!s.data || !jsre.test(s.data)) {
                s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
            }
            s.dataType = "json";

            jsonp = "jsonp" + S.now();

            // Replace the =? sequence both in the query string and the data
            if (s.data) {
                s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
            }

            s.url = s.url.replace(jsre, "=" + jsonp + "$1");

            s.dataType = "script";

            // Handle JSONP-style loading
            window[ jsonp ] = window[ jsonp ] || function(data) {
                s.success(id(), data, s.args);
                eventCenter.fire('success', {
                    xhr:xhr
                });
                s.complete(id(), data, s.args);
                eventCenter.fire('complete', {
                    xhr:xhr
                });
                /*
                 //是否需要delete，需要经过测试
                 window[ jsonp ] = undefined;
                 try {
                 delete window[ jsonp ];
                 } catch(e) {}
                 */
            };
        }

        if (s.data && type === "GET") {
            s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
        }

        //
        if (s.dataType === "script") {
            if (!jsonp) {
                S.getScript(s.url, function() {
                    s.complete(id(), s.args);
                    eventCenter.fire('complete', {
                        xhr:xhr
                    });
                    s.success(id(), s.args);
                    eventCenter.fire('success', {
                        xhr:xhr
                    });
                });

            } else {
                eventCenter.fire('start', {
                    xhr:xhr
                });
                S.getScript(s.url, function() {
                });
                eventCenter.fire('send', {
                    xhr:xhr
                });
            }

            return undef;
        }


        var requestDone = false;

        var xhr = s.xhr();

        eventCenter.fire('start', {
            xhr:xhr
        });
        xhr.open(type, s.url, s.async);

        // Need an extra try/catch for cross domain requests in Firefox 3
        try {
            // Set the correct header, if data is being sent
            if (s.data || s && s.contentType) {
                xhr.setRequestHeader("Content-Type", s.contentType);
            }

            // Set the Accepts header for the server, depending on the dataType
            xhr.setRequestHeader("Accept", s.dataType && s.accepts[ s.dataType ] ?
                s.accepts[ s.dataType ] + ", */*" :
                s.accepts._default);
        } catch(e) {
        }

        // Wait for a response to come back
        xhr.onreadystatechange = function(isTimeout) {
            //请求中止
            if (!xhr || xhr.readyState === 0 || isTimeout === "abort") {
                // Opera doesn't call onreadystatechange before this point
                // so we simulate the call
                if (!requestDone) {
                    s.complete(id(), xhr, s.args);
                    eventCenter.fire('complete', {
                        xhr:xhr
                    });
                }

                //请求完成，onreadystatechange值空
                requestDone = true;
                if (xhr) {
                    xhr.onreadystatechange = function() {
                    };
                }

                //请求成功，数据可用，或者请求超时
            } else if (!requestDone && xhr && (xhr.readyState === 4 || isTimeout === "timeout")) {
                requestDone = true;
                xhr.onreadystatechange = function() {
                };

                status = isTimeout === "timeout" ?
                    "timeout" :
                    !xhrSuccessful(xhr) ?
                        "error" :
                        "success";

                // Make sure that the request was successful or notmodified
                if (status === "success") {
                    // JSONP handles its own success callback
                    if (!jsonp) {
                        s.success(id(), xhr, s.args);
                        eventCenter.fire('success', {
                            xhr:xhr
                        });
                    }
                } else {
                    s.failure(id(), xhr, s.args);
                    eventCenter.fire('error', {
                        xhr:xhr
                    });
                }

                // Fire the complete handlers
                s.complete(id(), xhr, s.args);
                eventCenter.fire('complete', {
                    xhr:xhr
                });

                if (isTimeout === "timeout") {
                    xhr.abort();
                    eventCenter.fire('stop', {
                        xhr:xhr
                    });
                }

                // Stop memory leaks
                if (s.async) {
                    xhr = null;
                }
            }
        };

        eventCenter.fire('send', {
            xhr:xhr
        });
        xhr.send(type === "POST" ? s.data : null);

        // return XMLHttpRequest to allow aborting the request etc.
        if (!s.async) {
            eventCenter.fire('complete', {
                xhr:xhr
            });
        }
        return xhr;
    };

    // 定制各种快捷操作
    S.mix(S.io, {
        /**
         * Sends an HTTP request to a remote server.
         */
        get: function(url, data, callback, dataType) {
            //get(url)
            if (typeof data == 'undefined') {
                var data = null,
                    callback = function() {
                    },
                    dateType = '_default';
            }
            //get(url,callback)
            //get(url,callback,type)
            if (typeof data == 'function') {
                var dataType = callback || '_default',
                    callback = data,
                    data = null;
            }
            //get(url,data)
            if (typeof callback == 'undefined') {
                var callback = function() {
                },
                    dataType = '_default';
            }
            //get(url,data,callback,type)

            S.io({
                type:'get',
                url:url,
                data:data,
                complete:function(id, data, args) {
                    callback(data, args);
                },
                dataType:dataType
            });

        },

        post: function(url, data, callback, dataType) {
            //post(url)
            if (typeof data == 'undefined') {
                var data = null,
                    callback = function() {
                    },
                    dateType = '_default';
            }
            //post(url,callback)
            //post(url,callback,type)
            if (typeof data == 'function') {
                var dataType = callback || '_default',
                    callback = data,
                    data = null;
            }
            //post(url,data)
            if (typeof callback == 'undefined') {
                var callback = function() {
                },
                    dataType = '_default';
            }
            //post(url,data,callback,type)
            S.io({
                type:'post',
                url:url,
                complete:function(id, data, args) {
                    callback(data, args);
                },
                data:data,
                dataType:dataType
            });
        },

        jsonp: function(url, data, callback) {
            //jsonp(url)
            if (typeof data == 'undefined') {
                var data = null,
                    callback = function() {
                    };
            }
            //jsonp(url,callback)
            if (typeof data == 'function') {
                var callback = data,
                    data = null;
            }
            //jsonp(url,data)
            if (typeof callback == 'undefined') {
                var callback = function() {
                };
            }
            //jsonp(url,data,callback)
            S.io({
                dataType:'jsonp',
                url:url,
                complete:function(id, data, args) {
                    callback(data, args);
                },
                data:data
            });


        },

        getJSON:function(url, data, callback) {
            //getJSON(url)
            if (typeof data == 'undefined') {
                var data = null,
                    callback = function() {
                    };
            }
            //getJSON(url,callback)
            if (typeof data == 'function') {
                var callback = data,
                    data = null;
            }
            //getJSON(url,data)
            if (typeof callback == 'undefined') {
                var callback = function() {
                };
            }
            //getJSON(url,data,callback)
            S.Ajax({
                dataType:'json',
                url:url,
                complete:function(id, xhr, args) {
                    callback(S.JSON.parse(xhr.responseText), args);
                },
                data:data
            });

        },
        onComplete:function(callback) {
            eventCenter.on('complete', callback);
        },
        onError:function(callback) {
            eventCenter.on('error', callback);
        },
        onSend:function(callback) {
            eventCenter.on('send', callback);
        },
        onStart:function(callback) {
            eventCenter.on('start', callback);
        },
        onStop:function(callback) {
            eventCenter.on('stop', callback);
        },
        onSuccess:function(callback) {
            eventCenter.on('success', callback);
        }
    });

    // alias
    S.ajax = S.io;
});

/**
 * NOTES:
 *  2010.07
 *   - 实现常用功实现常用功实现常用功实现常用功,get,post以及类jquery的jsonp，
 *     考虑是否继续实现iframe-upload和flash xdr，代码借鉴jquery-ajax，api形状借鉴yui3-io
 *     基本格式依照 callback(id,xhr,args)
 *   - 没有经过严格测试，包括jsonp里的内存泄漏的测试
 *     对xml,json的格式的回调支持是否必要？
 * 2010.11
 *   - 实现了S.io.get/post/jsonp/getJSON
 *   - 实现了onComplete/onError/onSend/onStart/onStop/onSucess的ajax状态的处理
 */
