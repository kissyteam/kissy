/*
Copyright 2011, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
/***
 * @module  ajax
 * @author  拔赤<lijing00333@163.com>
 */
KISSY.add('ajax/impl', function(S, EventTarget, S_JSON, undef) {

    var win = window,
        noop = function() {
        },
        GET = 'GET', POST = 'POST',
        CONTENT_TYPE = 'Content-Type',
        JSON = 'json', JSONP = JSON + 'p', SCRIPT = 'script',
        CALLBACK = 'callback', EMPTY = '',
        START = 'start', SEND = 'send', STOP = 'stop',
        SUCCESS = 'success', COMPLETE = 'complete',
        ERROR = 'error', TIMEOUT = 'timeout', PARSERERR = 'parsererror',

        // 默认配置
        // 参数含义和 jQuery 保持一致：http://api.jquery.com/jQuery.ajax/
        defaultConfig = {
            type: GET,
            url: EMPTY,
            contentType: 'application/x-www-form-urlencoded',
            async: true,
            data: null,
            xhr: win.ActiveXObject ?
                 function() {
                     if (win.XmlHttpRequest) {
                         try {
                             return new win.XMLHttpRequest();
                         } catch(xhrError) {
                         }
                     }

                     try {
                         return new win.ActiveXObject('Microsoft.XMLHTTP');
                     } catch(activeError) {
                     }
                 } :
                 function() {
                     return new win.XMLHttpRequest();
                 },
            accepts: {
                xml: 'application/xml, text/xml',
                html: 'text/html',
                script: 'text/javascript, application/javascript',
                json: 'application/json, text/javascript',
                text: 'text/plain',
                _default: '*/*'
            },
            //complete: fn,
            //success: fn,
            //error: fn,
            jsonp: CALLBACK
            // jsonpCallback
            // dataType: 可以取 json | jsonp | script | xml | html | text
            // headers
            // context
        };

    function io(c) {
        c = S.merge(defaultConfig, c);
        if (!c.url) return undef;
        if (c.data && !S['isString'](c.data)) c.data = S.param(c.data);
        c.context = c.context || c;

        var jsonp, status = SUCCESS, data, type = c.type.toUpperCase(), scriptEl;

        // handle JSONP
        if (c.dataType === JSONP) {
            jsonp = c['jsonpCallback'] || JSONP + S.now();
            c.url = addQuery(c.url, c.jsonp + '=' + jsonp);
            c.dataType = SCRIPT;

            // build temporary JSONP function
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
                handleEvent([SUCCESS, COMPLETE], data, status, xhr, c);
            };
        }

        if (c.data && type === GET) {
            c.url = addQuery(c.url, c.data);
        }

        if (c.dataType === SCRIPT) {
            fire(START, c);
            // jsonp 有自己的回调处理
            scriptEl = S.getScript(c.url, jsonp ? null : function() {
                handleEvent([SUCCESS, COMPLETE], EMPTY, status, xhr, c);
            });
            fire(SEND, c);
            return scriptEl;
        }


        // 开始 XHR 之旅
        var requestDone = false, xhr = c.xhr();

        fire(START, c);
        xhr.open(type, c.url, c.async);

        // Need an extra try/catch for cross domain requests in Firefox 3
        try {
            // Set the correct header, if data is being sent
            if (c.data || c.contentType) {
                xhr.setRequestHeader(CONTENT_TYPE, c.contentType);
            }

            // Set the Accepts header for the server, depending on the dataType
            xhr.setRequestHeader('Accept', c.dataType && c.accepts[c.dataType] ?
                c.accepts[c.dataType] + ', */*; q=0.01' :
                c.accepts._default);
        } catch(e) {
        }

        // Wait for a response to come back
        xhr.onreadystatechange = function(isTimeout) {
            // The request was aborted
            if (!xhr || xhr.readyState === 0 || isTimeout === 'abort') {
                // Opera doesn't call onreadystatechange before this point
                // so we simulate the call
                if (!requestDone) {
                    handleEvent(COMPLETE, null, ERROR, xhr, c);
                }
                requestDone = true;
                if (xhr) {
                    xhr.onreadystatechange = noop;
                }
            } else
            // The transfer is complete and the data is available, or the request timed out
            if (!requestDone && xhr && (xhr.readyState === 4 || isTimeout === TIMEOUT)) {
                requestDone = true;
                xhr.onreadystatechange = noop;
                status = (isTimeout === TIMEOUT) ? TIMEOUT :
                    xhrSuccessful(xhr) ? SUCCESS : ERROR;

                // Watch for, and catch, XML document parse errors
                try {
                    // process the data (runs the xml through httpData regardless of callback)
                    data = parseData(xhr, c.dataType);

                    //alert(xhr);
                    //S.log(data,'warn');
                } catch(e) {
                    status = PARSERERR;
                }

                // fire events
                handleEvent([status === SUCCESS ? SUCCESS : ERROR, COMPLETE], data, status, xhr, c);

                if (isTimeout === TIMEOUT) {
                    xhr.abort();
                    fire(STOP, c);
                }

                // Stop memory leaks
                if (c.async) {
                    xhr = null;
                }
            }
        };

        fire(SEND, c);
        try {
            xhr.send(type === POST ? c.data : null);
        } catch(e) {
            handleEvent([ERROR, COMPLETE], data, ERROR, xhr, c);
        }

        // return XMLHttpRequest to allow aborting the request etc.
        if (!c.async) {
            fire(COMPLETE, c);
        }
        return xhr;
    }

    // 事件支持
    S.mix(io, EventTarget);

    // 定制各种快捷操作
    S.mix(io, {

        get: function(url, data, callback, dataType, _t) {
            // data 参数可省略
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
            }

            return io({
                type: _t || GET,
                url: url,
                data: data,
                success: function(data, textStatus, xhr) {
                    callback && callback.call(this, data, textStatus, xhr);
                },
                dataType: dataType
            });
        },

        post: function(url, data, callback, dataType) {
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, dataType, POST);
        },

        jsonp: function(url, data, callback) {
            if (S.isFunction(data)) {
                callback = data;
                data = null; // 占位符
            }
            return io.get(url, data, callback, JSONP);
        }
    });

    // 所有方法在 IO 下都可调 IO.ajax/get/post/getScript/jsonp
    // S 下有便捷入口 S.io/ajax/getScript/jsonp

    //检测 xhr 是否成功
    function xhrSuccessful(xhr) {
        try {
            // IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
            // ref: http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
            // IE 中如果请求一个缓存住的页面，会出现如下状况 (jQuery 中未考虑,此处也不作处理)：
            // 		请求一个页面成功，但头输出为 404, ie6/8 下检测为 200, ie7/ff/chrome/opera 检测为 404
            // 		请求一个不存在的页面，ie 均检测为 200 ,ff/chrome/opera检测为 404
            // 		请求一个不存在的页面，ie6/7 的 statusText为 'Not Found'，ie8 的为 'OK', statusText 是可以被程序赋值的
            return xhr.status >= 200 && xhr.status < 300 ||
                xhr.status === 304 || xhr.status === 1223;
        } catch(e) {
        }
        return false;
    }

    function addQuery(url, params) {
        return url + (url.indexOf('?') === -1 ? '?' : '&') + params;
    }

    function handleEvent(type, data, status, xhr, c) {
        if (S.isArray(type)) {
            S.each(type, function(t) {
                handleEvent(t, data, status, xhr, c);
            });
        } else {
            // 只调用与 status 匹配的 c.type, 比如成功时才调 c.success
            if (status === type && c[type]) c[type].call(c.context, data, status, xhr);
            fire(type, c);
        }
    }

    function fire(type, config) {
        io.fire(type, { ajaxConfig: config });
    }

    function parseData(xhr, type) {
        var ct = EMPTY, xml, data = xhr;

        // xhr 可以直接是 data
        if (!S['isString'](data)) {
            ct = xhr.getResponseHeader(CONTENT_TYPE) || EMPTY;
            xml = type === 'xml' || !type && ct.indexOf('xml') >= 0;
            data = xml ? xhr.responseXML : xhr.responseText;

            if (xml && data.documentElement.nodeName === PARSERERR) {
                throw PARSERERR;
            }
        }

        if (S['isString'](data)) {
            if (type === JSON || !type && ct.indexOf(JSON) >= 0) {
                data = S_JSON.parse(data);
            }
        }

        return data;
    }

    return io;

}, {
    requires:["event","json"]
});

/**
 * TODO:
 *   - 给 Node 增加 load 方法?
 *   - 请求缓存资源的状态的判断（主要针对404）？
 *
 * NOTES:
 *  2010.07
 *   - 实现常用功实现常用功实现常用功实现常用功,get,post以及类jquery的jsonp
 *     考虑是否继续实现iframe-upload和flash xdr，代码借鉴jquery-ajax，api形状借鉴yui3-io
 *     基本格式依照 callback(id,xhr,args)
 *   - 没有经过严格测试，包括jsonp里的内存泄漏的测试
 *     对xml,json的格式的回调支持是否必要
 * 2010.11
 *   - 实现了get/post/jsonp/getJSON
 *   - 实现了onComplete/onError/onSend/onStart/onStop/onSucess的ajax状态的处理
 *   - [玉伯] 在拔赤的代码基础上重构，调整了部分 public api
 *   - [玉伯] 增加部分 Jasmine 单元测试
 *   - [玉伯] 去掉 getJSON 接口，增加 jsonp 接口
 */
KISSY.add("ajax", function(S, io) {
    return io;
}, {
    requires:["ajax/impl"]
});
