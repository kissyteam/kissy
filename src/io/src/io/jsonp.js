/**
 * @ignore
 * jsonp transport based on script transport
 * @author yiminghe@gmail.com
 */
KISSY.add('io/jsonp', function (S, IO) {
    var win = S.Env.host;
    IO.setupConfig({
        jsonp: 'callback',
        jsonpCallback: function () {
            // 不使用 now() ，极端情况下可能重复
            return S.guid('jsonp');
        }
    });

    IO.on('start', function (e) {
        var io = e.io,
            c = io.config,
            dataType = c.dataType;
        if (dataType[0] == 'jsonp') {
            // jsonp does not need contentType.
            // https://github.com/kissyteam/kissy/issues/394
            delete c.contentType;
            var response,
                cJsonpCallback = c.jsonpCallback,
                converters,
                jsonpCallback = S.isFunction(cJsonpCallback) ?
                    cJsonpCallback() :
                    cJsonpCallback,
                previous = win[ jsonpCallback ];

            c.uri.query.set(c.jsonp, jsonpCallback);

            // build temporary JSONP function
            win[jsonpCallback] = function (r) {
                // 使用数组，区别：故意调用了 jsonpCallback(undefined) 与 根本没有调用
                // jsonp 返回了数组
                if (arguments.length > 1) {
                    r = S.makeArray(arguments);
                }
                // 先存在内存里, onload 后再读出来处理
                response = [r];
            };

            // cleanup whether success or failure
            io.fin(function () {
                win[ jsonpCallback ] = previous;
                if (previous === undefined) {
                    try {
                        delete win[ jsonpCallback ];
                    } catch (e) {
                        //S.log('delete window variable error : ');
                        //S.log(e);
                    }
                } else if (response) {
                    // after io success handler called
                    // then call original existed jsonpcallback
                    previous(response[0]);
                }
            });

            converters = c.converters;
            converters.script = converters.script || {};

            // script -> jsonp ,jsonp need to see json not as script
            // if ie onload a 404/500 file or all browsers onload an invalid script
            // 404/invalid will be caught here
            // because response is undefined( jsonp callback is never called)
            // error throwed will be caught in conversion step
            // and KISSY will notify user by error callback
            converters.script.json = function () {
                if (!response) {
                    S.error(' not call jsonpCallback: ' + jsonpCallback)
                }
                return response[0];
            };

            dataType.length = 2;
            // 利用 script transport 发送 script 请求
            dataType[0] = 'script';
            dataType[1] = 'json';
        }
    });

    return IO;
}, {
    requires: ['./base']
});
