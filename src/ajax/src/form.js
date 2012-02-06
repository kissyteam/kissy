/**
 * @fileOverview process form config
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/form", function(S, io, DOM, FormSerializer) {

    io.on("start", function(e) {
        var xhrObject = e.xhr,
            c = xhrObject.config;
        // serialize form if needed
        if (c.form) {
            var form = DOM.get(c.form),
                enctype = form['encoding'] || form.enctype;
            // 上传有其他方法
            if (enctype.toLowerCase() != "multipart/form-data") {
                // when get need encode
                var formParam = FormSerializer.serialize(form);

                if (formParam) {
                    if (c.hasContent) {
                        // post 加到 data 中
                        c.data = c.data || "";
                        if (c.data) {
                            c.data += "&";
                        }
                        c.data += formParam;
                    } else {
                        // get 直接加到 url
                        c.url += ( /\?/.test(c.url) ? "&" : "?" ) + formParam;
                    }
                }
            } else {
                var d = c.dataType[0];
                if (d == "*") {
                    d = "text";
                }
                c.dataType.length = 2;
                c.dataType[0] = "iframe";
                c.dataType[1] = d;
            }
        }
    });

    return io;

}, {
        requires:['./base',"dom","./FormSerializer"]
    });