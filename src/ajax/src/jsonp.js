/**
 * @fileOverview jsonp transport based on script transport
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/jsonp", function (S, io) {
    var win = S.Env.host;
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
                previous = win[ jsonpCallback ];

            c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.jsonp + "=" + jsonpCallback;

            // build temporary JSONP function
            win[jsonpCallback] = function (r) {
                // 使用数组，区别：故意调用了 jsonpCallback(undefined) 与 根本没有调用
                // jsonp 返回了数组
                if (arguments.length > 1) {
                    r = S.makeArray(arguments);
                }
                response = [r];
            };

            // cleanup whether success or failure
            xhrObject.fin(function () {
                win[ jsonpCallback ] = previous;
                if (previous === undefined) {
                    try {
                        delete win[ jsonpCallback ];
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
