/***
 * @module  ajax
 * @author  拔赤<lijing00333@163.com>
 */
KISSY.add('ajax', function(S, undef) {

    var win = window,
        noop = function() {
        },

        GET = 'GET', POST = 'POST',
        JSON = 'json', JSONP = JSON + 'p', SCRIPT = 'script',
        CALLBACK = 'callback', EMPTY = '',
        SUCCESS = 'success', COMPLETE = 'complete',
        ERROR = 'error', TIMEOUT = 'timeout', PARSERERR = 'parsererror',
        START = 'start', SEND = 'send', STOP = 'stop',
        jsre = /=\?(&|$)/,

        // 默认配置
        // 参数含义和 jQuery 保持一致：http://api.jquery.com/jQuery.ajax/
        defaultConfig = {
            type: GET,
            url: EMPTY,
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
            complete: function() {
            },
            success: function() {
            },
            error: function() {
            },
            jsonp: CALLBACK
            // dataType
            // headers
            // jsonpCallback
        };

    function io(s) {
        s = S.merge(defaultConfig, s);
        if (s.data && !S.isString(s.data)) s.data = S.param(s.data);

        var jsonp, status = SUCCESS, data, type = s.type.toUpperCase();

        // Handle JSONP, 参照 jQuery, 保留 callback=? 的约定
        if (s.dataType === JSONP) {
            if (type === GET) {
                if (!jsre.test(s.url)) {
                    s.url = addQuery(s.url, s.jsonp + '=?');
                }
            } else if (!s.data || !jsre.test(s.data)) {
                s.data = (s.data ? s.data + '&' : EMPTY) + s.jsonp + '=?';
            }
            s.dataType = JSON;
        }

        // Build temporary JSONP function
        if (s.dataType === JSON && (s.data && jsre.test(s.data) || jsre.test(s.url))) {
            jsonp = s['jsonpCallback'] || JSONP + S.now();

            // Replace the =? sequence both in the query string and the data
            if (s.data) {
                s.data = (s.data + EMPTY).replace(jsre, '=' + jsonp + '$1');
            }

            s.url = s.url.replace(jsre, '=' + jsonp + '$1');
            s.dataType = SCRIPT;

            // Handle JSONP-style loading
            var customJsonp = win[jsonp];

            win[jsonp] = function(data) {
                if (S.isFunction(customJsonp)) {
                    customJsonp(data);
                } else {
                    // Garbage collect
                    win[jsonp] = undef;
                    try {
                        delete win[jsonp];
                    } catch(e) {
                    }
                }
                handleEvent([SUCCESS, COMPLETE], data, status, xhr, s);
            };
        }

        if (s.data && type === GET) {
            s.url = addQuery(s.url, s.data);
        }

        if (s.dataType === SCRIPT) {
            io.fire(START);
            S.getScript(s.url, jsonp ? function() {
                handleEvent([SUCCESS, COMPLETE], EMPTY, status, xhr, s);
            } : null);
            io.fire(SEND);
            return; // 结束 json/jsonp/script 的流程
        }


        // 开始 XHR 之旅
        var requestDone = false, xhr = s.xhr();

        io.fire(START, { xhr: xhr });
        xhr.open(type, s.url, s.async);

        // Need an extra try/catch for cross domain requests in Firefox 3
        try {
            // Set the correct header, if data is being sent
            if (s.data || s.contentType) {
                xhr.setRequestHeader('Content-Type', s.contentType);
            }

            // Set the Accepts header for the server, depending on the dataType
            xhr.setRequestHeader('Accept', s.dataType && s.accepts[s.dataType] ?
                s.accepts[ s.dataType ] + ", */*" :
                s.accepts._default);
        } catch(e) {
        }

        // Wait for a response to come back
        xhr.onreadystatechange = function(isTimeout) {
            // 请求中止
            if (!xhr || xhr.readyState === 0 || isTimeout === 'abort') {
                // Opera doesn't call onreadystatechange before this point
                // so we simulate the call
                if (!requestDone) {
                    handleEvent(COMPLETE, null, ERROR, xhr, s);
                }

                requestDone = true;
                if (xhr) {
                    xhr.onreadystatechange = noop;
                }
            } else
            // 请求成功，数据可用，或请求超时
            if (!requestDone && xhr && (xhr.readyState === 4 || isTimeout === TIMEOUT)) {
                requestDone = true;
                xhr.onreadystatechange = noop;

                status = isTimeout === TIMEOUT ? TIMEOUT :
                    !xhrSuccessful(xhr) ? ERROR : SUCCESS;

                // Watch for, and catch, XML document parse errors
                try {
                    // process the data (runs the xml through httpData regardless of callback)
                    data = httpData(xhr, s.dataType);
                } catch(e) {
                    status = PARSERERR;
                }

                // Make sure that the request was successful or notmodified
                if (status === SUCCESS) {
                    // JSONP handles its own success callback
                    if (!jsonp) {
                        handleEvent(SUCCESS, data, status, xhr, s);
                    }
                } else {
                    handleEvent(ERROR, data, status, xhr, s);
                }

                // Fire the complete handlers
                handleEvent(COMPLETE, data, status, xhr, s);

                if (isTimeout === TIMEOUT) {
                    xhr.abort();
                    io.fire(STOP, { xhr: xhr });
                }

                // Stop memory leaks
                if (s.async) {
                    xhr = null;
                }
            }
        };

        io.fire(SEND, { xhr: xhr });
        xhr.send(type === POST ? s.data : null);

        // return XMLHttpRequest to allow aborting the request etc.
        if (!s.async) {
            io.fire(COMPLETE, { xhr: xhr });
        }
        return xhr;
    }

    // 事件支持
    S.mix(io, S.EventTarget);

    // 定制各种快捷操作
    S.mix(io, {

        get: function(url, data, callback, dataType, _t) {
            // data 参数可省略
            if(S.isFunction(data)) {
                dataType = callback;
                callback = data;
            }

            io({
                type: _t || GET,
                url: url,
                data: data,
                success: function(data, textStatus, xhr) {
                    if (S.isFunction(callback)) callback(data, textStatus, xhr);
                },
                dataType: dataType
            });

            return this;
        },

        post: function(url, data, callback, dataType) {
            // data 参数可省略
            if(S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = null;
            }
            return io.get(url, data, callback, dataType, POST);
        },

        getJSON: function(url, data, callback) {
            // data 参数可省略
            if(S.isFunction(data)) {
                callback = data;
            }
            return io.get(url, data, callback, JSON);
        }
    });

    // shortcuts
    io.getScript = S.getScript;
    S.ajax = S.io = io;
    S.getJSON = io.getJSON;

    //检测 xhr 是否成功
    function xhrSuccessful(xhr) {
        try {
            // ref: http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
            return (xhr.status >= 200 && xhr.status < 300) ||
                // Opera returns 0 when status is 304
                xhr.status === 304 || xhr.status === 0 || xhr.status === 1223;
        } catch(e) {
        }
        return false;
    }

    function addQuery(url, params) {
        return url + (url.indexOf('?') === -1 ? '?' : '&') + params;
    }

    function handleEvent(type, data, status, xhr, s) {
        if (S.isArray(type)) {
            S.each(type, function(t) {
                handleEvent(t, data, status, xhr, s);
            });
        } else {
            // 只调用与 status 匹配的 s.type, 比如成功时才调 s.complete
            if(status === type) s[type](data, status, xhr);
            io.fire(type, { xhr: xhr });
        }
    }

    function httpData(xhr, type) {
        var ct = xhr.getResponseHeader('content-type') || EMPTY,
            xml = type === 'xml' || !type && ct.indexOf('xml') >= 0,
            data = xml ? xhr.responseXML : xhr.responseText;

        if (xml && data.documentElement.nodeName === PARSERERR) {
            S.error(PARSERERR);
        }

        // The filter can actually parse the response
        if (S.isString(data)) {
            // Get the JavaScript object, if JSON is used.
            if (type === JSON || !type && ct.indexOf(JSONP) >= 0) {
                data = S.JSON.parse(data);
            } else
            // If the type is "script", eval it in global context
            if (type === SCRIPT || !type && ct.indexOf('javascript') >= 0) {
                S.globalEval(data);
            }
        }
        return data;
    }

});

/**
 * NOTES:
 *  2010.07
 *   - 实现常用功实现常用功实现常用功实现常用功,get,post以及类jquery的jsonp，
 *     考虑是否继续实现iframe-upload和flash xdr，代码借鉴jquery-ajax，api形状借鉴yui3-io
 *     基本格式依照 callback(id,xhr,args)
 *   - 没有经过严格测试，包括jsonp里的内存泄漏的测试
 *     对xml,json的格式的回调支持是否必要
 * 2010.11
 *   - 实现了S.io.get/post/jsonp/getJSON
 *   - 实现了onComplete/onError/onSend/onStart/onStop/onSucess的ajax状态的处理
 *   - [玉伯] 在拔赤的代码基础上重构，调整了部分 public api
 *   - 增加Jasmine单元测试
 */
