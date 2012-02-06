/**
 * @fileOverview io shortcut
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax", function (S, serializer, io, XhrObject) {
    var undef = undefined;
    // some shortcut
    S.mix(io,

        /**
         * @lends io
         */
        {
            XhrObject:XhrObject,
            /**
             * form 序列化
             * @param formElement {HTMLFormElement} 将要序列化的 form 元素
             */
            serialize:serializer.serialize,

            /**
             * get 请求
             * @param url
             * @param data
             * @param callback
             * @param [dataType]
             * @param [_t]
             */
            get:function (url, data, callback, dataType, _t) {
                // data 参数可省略
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                    data = undef;
                }

                return io({
                    type:_t || "get",
                    url:url,
                    data:data,
                    success:callback,
                    dataType:dataType
                });
            },

            /**
             * post 请求
             * @param url
             * @param data
             * @param callback
             * @param [dataType]
             */
            post:function (url, data, callback, dataType) {
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                    data = undef;
                }
                return io.get(url, data, callback, dataType, "post");
            },

            /**
             * jsonp 请求
             * @param url
             * @param [data]
             * @param callback
             */
            jsonp:function (url, data, callback) {
                if (S.isFunction(data)) {
                    callback = data;
                    data = undef;
                }
                return io.get(url, data, callback, "jsonp");
            },

            // 和 S.getScript 保持一致
            // 更好的 getScript 可以用
            /*
             io({
             dataType:'script'
             });
             */
            getScript:S.getScript,

            /**
             * 获取 json 数据
             * @param url
             * @param data
             * @param callback
             */
            getJSON:function (url, data, callback) {
                if (S.isFunction(data)) {
                    callback = data;
                    data = undef;
                }
                return io.get(url, data, callback, "json");
            },

            /**
             * 无刷新上传文件
             * @param url
             * @param form
             * @param data
             * @param callback
             * @param [dataType]
             */
            upload:function (url, form, data, callback, dataType) {
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                    data = undef;
                }
                return io({
                    url:url,
                    type:'post',
                    dataType:dataType,
                    form:form,
                    data:data,
                    success:callback
                });
            }
        });

    return io;
}, {
    requires:[
        "ajax/FormSerializer",
        "ajax/base",
        "ajax/XhrObject",
        "ajax/XhrTransport",
        "ajax/ScriptTransport",
        "ajax/jsonp",
        "ajax/form",
        "ajax/IframeTransport"]
});