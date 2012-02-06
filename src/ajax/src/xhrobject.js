/**
 * @fileOverview encapsulation of io object . as transaction object in yui3
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/XhrObject", function (S, undefined) {

    var OK_CODE = 200,
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
            _defer:new S.Defer()
        });
    }

    function spread(fn, context) {
        return function (v) {
            return fn.apply(context || this, v);
        };
    }

    S.augment(XhrObject, {
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
                self._callback(0, statusText);
                return self;
            },

            then:function (success, error) {
                var context = this.config.context;
                success = success && spread(success, context);
                error = error && spread(error, context);
                return this._defer.promise.then(success, error);
            },

            fail:function (error) {
                return this.then(null, error);
            },

            fin:function (fn) {
                var self = this;
                fn = spread(fn, self.config.context);
                return self._defer.promise.fin(fn);
            },

            _callback:function (status, statusText) {
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
});