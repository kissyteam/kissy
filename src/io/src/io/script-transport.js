/**
 * @ignore
 * script transport for kissy io,
 * modified version of S.getScript,
 * add abort ability
 * @author yiminghe@gmail.com
 */
KISSY.add('io/script-transport', function (S, IO, _, undefined) {

    var win = S.Env.host,
        doc = win.document,
        OK_CODE = 200,
        ERROR_CODE = 500;

    IO.setupConfig({
        accepts: {
            script: 'text/javascript, ' +
                'application/javascript, ' +
                'application/ecmascript, ' +
                'application/x-ecmascript'
        },

        contents: {
            script: /javascript|ecmascript/
        },
        converters: {
            text: {
                // 如果以 xhr+eval 需要下面的，
                // 否则直接 script node 不需要，引擎自己执行了，
                // 不需要手动 eval
                script: function (text) {
                    S.globalEval(text);
                    return text;
                }
            }
        }
    });

    function ScriptTransport(io) {
        var config = io.config;
        // 优先使用 xhr+eval 来执行脚本, ie 下可以探测到（更多）失败状态
        if (!config.crossDomain) {
            return new (IO['getTransport']('*'))(io);
        }
        this.io = io;
        S.log('use ScriptTransport for: ' + config.url);
        return this;
    }

    S.augment(ScriptTransport, {
        send: function () {
            var self = this,
                script,
                io = self.io,
                c = io.config,
                head = doc['head'] ||
                    doc.getElementsByTagName('head')[0] ||
                    doc.documentElement;

            self.head = head;
            script = doc.createElement('script');
            self.script = script;
            script.async = true;

            if (c['scriptCharset']) {
                script.charset = c['scriptCharset'];
            }

            script.src = io._getUrlForSend();

            script.onerror =
                script.onload =
                    script.onreadystatechange = function (e) {
                        e = e || win.event;
                        // firefox onerror 没有 type ?!
                        self._callback((e.type || 'error').toLowerCase());
                    };

            head.insertBefore(script, head.firstChild);
        },

        _callback: function (event, abort) {
            var self = this,
                script = self.script,
                io = self.io,
                head = self.head;

            // 防止重复调用,成功后 abort
            if (!script) {
                return;
            }

            if (
                abort ||
                    !script.readyState ||
                    /loaded|complete/.test(script.readyState) ||
                    event == 'error'
                ) {

                script['onerror'] = script.onload = script.onreadystatechange = null;

                // Remove the script
                if (head && script.parentNode) {
                    // ie 报错载入无效 js
                    // 怎么 abort ??
                    // script.src = '#';
                    head.removeChild(script);
                }

                self.script = undefined;
                self.head = undefined;

                // Callback if not abort
                if (!abort && event != 'error') {
                    io._ioReady(OK_CODE, 'success');
                }
                // 非 ie<9 可以判断出来
                else if (event == 'error') {
                    io._ioReady(ERROR_CODE, 'script error');
                }
            }
        },

        abort: function () {
            this._callback(0, 1);
        }
    });

    IO['setupTransport']('script', ScriptTransport);

    return IO;

}, {
    requires: ['./base', './xhr-transport']
});