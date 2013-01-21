/**
 * @ignore
 * process form config
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/form', function (S, IO, DOM, FormSerializer) {

    IO.on('start', function (e) {
        var io = e.io,
            form,
            d,
            enctype,
            dataType,
            formParam,
            data,
            tmpForm,
            c = io.config;
        // serialize form if needed
        if (tmpForm = c.form) {
            form = DOM.get(tmpForm);
            enctype = form['encoding'] || form.enctype;
            data = c.data;
            // 上传有其他方法
            if (enctype.toLowerCase() != 'multipart/form-data') {
                // when get need encode
                formParam = FormSerializer.getFormData(form);
                if (c.hasContent) {
                    formParam = S.param(formParam, undefined, undefined, c.serializeArray);
                    if (data) {
                        c.data += '&' + formParam;
                    } else {
                        c.data = formParam;
                    }
                } else {
                    // get 直接加到 url
                    c.uri.query.add(formParam);
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

    return IO;

}, {
    requires: ['./base', 'dom', './form-serializer']
});