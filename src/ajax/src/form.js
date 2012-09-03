/**
 * @ignore
 * @fileOverview process form config
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/form', function (S, io, DOM, FormSerializer) {

    io.on('start', function (e) {
        var io = e.io,
            form,
            d,
            enctype,
            dataType,
            formParam,
            tmpForm,
            c = io.config;
        // serialize form if needed
        if (tmpForm = c.form) {
            form = DOM.get(tmpForm);
            enctype = form['encoding'] || form.enctype;
            // 上传有其他方法
            if (enctype.toLowerCase() != 'multipart/form-data') {
                // when get need encode
                formParam = FormSerializer.getFormData(form);
                if (c.hasContent) {
                    c.query.add(formParam);
                } else {
                    // get 直接加到 url
                    c.uri.query.add(formParam);
                    // update ifModifiedKey if necessary
                    if (c.ifModifiedKeyUri) {
                        c.ifModifiedKeyUri.query.add(formParam);
                    }
                }
            } else {
                dataType = c.dataType;
                d = dataType[0];
                if (d == '*') {
                    d = 'text';
                }
                dataType.length = 2;
                dataType[0] = 'iframe';
                dataType[1] = d;
            }
        }
    });

    return io;

}, {
    requires: ['./base', 'dom', './form-serializer']
});