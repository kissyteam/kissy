/**
 * @ignore
 * non-refresh upload file with form by iframe
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var Dom = require('dom'),
        IO = require('./base'),
        Event = require('event/dom');
    var   logger = S.getLogger('s/io');
    var doc = S.Env.host.document,
        OK_CODE = 200,

        ERROR_CODE = 500,
        BREATH_INTERVAL = 30,
        iframeConverter = S.clone(IO.getConfig().converters.text);

    // https://github.com/kissyteam/kissy/issues/304
    // returned data must be escaped by server for json dataType
    // as data
    // eg:
    // <body>
    // {
    //    "&lt;a&gt;xx&lt;/a&gt;"
    // }
    // </body>
    // text or html dataType is of same effect.
    // same as normal ajax or html5 FileData
    iframeConverter.json = function (str) {
        return S.parseJson(S.unEscapeHtml(str));
    };

    // iframe 内的内容就是 body.innerText
    IO.setupConfig({
        converters: {
            // iframe 到其他类型的转化和 text 一样
            iframe: iframeConverter,
            text: {
                // fake type, just mirror
                iframe: function (text) {
                    return text;
                }
            },
            xml: {
                // fake type, just mirror
                iframe: function (xml) {
                    return xml;
                }
            }
        }
    });

    function createIframe(xhr) {
        var id = S.guid('io-iframe'),
            iframe,
        // empty src, so no history
            src = Dom.getEmptyIframeSrc();

        iframe = xhr.iframe = Dom.create('<iframe ' +
            // ie6 need this when cross domain
            (src ? (' src="' + src + '" ') : '') +
            ' id="' + id + '"' +
            // need name for target of form
            ' name="' + id + '"' +
            ' style="position:absolute;left:-9999px;top:-9999px;"/>');

        Dom.prepend(iframe, doc.body || doc.documentElement);
        return iframe;
    }

    function addDataToForm(query, form, serializeArray) {
        var ret = [], isArray, vs, i, e;
        S.each(query, function (data, k) {
            isArray = S.isArray(data);
            vs = S.makeArray(data);
            // 数组和原生一样对待，创建多个同名输入域
            for (i = 0; i < vs.length; i++) {
                e = doc.createElement('input');
                e.type = 'hidden';
                e.name = k + (isArray && serializeArray ? '[]' : '');
                e.value = vs[i];
                Dom.append(e, form);
                ret.push(e);
            }
        });
        return ret;
    }

    function removeFieldsFromData(fields) {
        Dom.remove(fields);
    }

    function IframeTransport(io) {
        this.io = io;
        logger.info('use IframeTransport for: ' + io.config.url);
    }

    S.augment(IframeTransport, {
        send: function () {

            var self = this,
                io = self.io,
                c = io.config,
                fields,
                iframe,
                query,
                data = c.data,
                form = Dom.get(c.form);

            self.attrs = {
                target: Dom.attr(form, 'target') || '',
                action: Dom.attr(form, 'action') || '',
                // enctype 区分 iframe 与 serialize
                encoding: Dom.attr(form, 'encoding'),
                enctype: Dom.attr(form, 'enctype'),
                method: Dom.attr(form, 'method')
            };
            self.form = form;

            iframe = createIframe(io);

            // set target to iframe to avoid main page refresh
            Dom.attr(form, {
                target: iframe.id,
                action: io._getUrlForSend(),
                method: 'post',
                enctype: 'multipart/form-data',
                encoding: 'multipart/form-data'
            });

            // unparam to kv map
            if (data) {
                query = S.unparam(data);
            }

            if (query) {
                fields = addDataToForm(query, form, c.serializeArray);
            }

            self.fields = fields;

            function go() {
                Event.on(iframe, 'load error', self._callback, self);
                form.submit();
            }

            // ie6 need a breath
            if (S.UA.ie === 6) {
                setTimeout(go, 0);
            } else {
                // can not setTimeout or else chrome will submit to top window
                go();
            }
        },

        _callback: function (event/*, abort*/) {
            var self = this,
                form = self.form,
                io = self.io,
                eventType = /**
                 @type String
                 @ignore*/event.type,
                iframeDoc,
                iframe = io.iframe;

            // 防止重复调用 , 成功后 abort
            if (!iframe) {
                return;
            }

            // ie6 立即设置 action 设置为空导致白屏
            if (eventType === 'abort' && S.UA.ie === 6) {
                setTimeout(function () {
                    Dom.attr(form, self.attrs);
                }, 0);
            } else {
                Dom.attr(form, self.attrs);
            }

            removeFieldsFromData(this.fields);

            Event.detach(iframe);

            setTimeout(function () {
                // firefox will keep loading if not set timeout
                Dom.remove(iframe);
            }, BREATH_INTERVAL);

            // nullify to prevent memory leak?
            io.iframe = null;

            if (eventType === 'load') {

                try {
                    iframeDoc = iframe.contentWindow.document;
                    // ie<9
                    if (iframeDoc && iframeDoc.body) {
                        // https://github.com/kissyteam/kissy/issues/304
                        io.responseText = Dom.html(iframeDoc.body);
                        // ie still can retrieve xml 's responseText
                        if (S.startsWith(io.responseText, '<?xml')) {
                            io.responseText = undefined;
                        }
                    }
                    // ie<9
                    // http://help.dottoro.com/ljbcjfot.php
                    // http://msdn.microsoft.com/en-us/library/windows/desktop/ms766512(v=vs.85).aspx
                    /*
                     In Internet Explorer, XML documents can also be embedded into HTML documents with the xml HTML elements.
                     To get an XMLDocument object that represents the embedded XML data island,
                     use the XMLDocument property of the xml element.
                     Note that the support for the XMLDocument property has been removed in Internet Explorer 9.
                     */
                    if (iframeDoc && iframeDoc.XMLDocument) {
                        io.responseXML = iframeDoc.XMLDocument;
                    }
                    // ie9 firefox chrome
                    else {
                        io.responseXML = iframeDoc;
                    }
                    if (iframeDoc) {
                        io._ioReady(OK_CODE, 'success');
                    } else {
                        // chrome does not throw exception:
                        // Unsafe JavaScript attempt to access frame with URL upload.jss from frame with URL test.html.
                        // Domains, protocols and ports must match.
                        // chrome will get iframeDoc to null
                        // so this error is parser error to normalize all browsers
                        io._ioReady(ERROR_CODE, 'parser error');
                    }
                } catch (e) {
                    // #245 submit to a  cross domain page except chrome
                    io._ioReady(ERROR_CODE, 'parser error');
                }
            } else if (eventType === 'error') {
                io._ioReady(ERROR_CODE, 'error');
            }
        },

        abort: function () {
            this._callback({
                type: 'abort'
            });
        }
    });

    IO.setupTransport('iframe', IframeTransport);

    return IO;
});