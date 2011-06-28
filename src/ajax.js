KISSY.add("ajax", function(S, io) {

    // some shortcut
    S.mix(io, {
            get: function(url, data, callback, dataType, _t) {
                // data 参数可省略
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                }

                return io({
                        type: _t || "get",
                        url: url,
                        data: data,
                        success: callback,
                        dataType: dataType
                    });
            },

            post: function(url, data, callback, dataType) {
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                    data = undefined;
                }
                return io.get(url, data, callback, dataType, "post");
            },

            jsonp: function(url, data, callback) {
                if (S.isFunction(data)) {
                    callback = data;
                    data = null; // 占位符
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

            getJSON: function(url, data, callback) {
                return io.get(url, data, callback, "json");
            },

            upload:function(url, form, data, callback, dataType) {
                if (S.isFunction(data)) {
                    callback = data;
                    data = null; // 占位符
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
        requires:["ajax/base",
            "ajax/xhrobject",
            "ajax/xhr",
            "ajax/script",
            "ajax/jsonp",
            "ajax/form",
            "ajax/iframe-upload"]
    });