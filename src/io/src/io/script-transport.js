/**
 * @ignore
 * script transport for kissy io,
 * modified version of S.getScript,
 * add abort ability
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var IO = require('./base');
    var logger = S.getLogger('s/io');
    var OK_CODE = 200,
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
        var config = io.config,
            self = this;
        // 优先使用 xhr+eval 来执行脚本, ie 下可以探测到（更多）失败状态
        if (!config.crossDomain) {
            return new (IO.getTransport('*'))(io);
        }
        self.io = io;
        logger.info('use ScriptTransport for: ' + config.url);
        return self;
    }

    S.augment(ScriptTransport, {
        send: function () {
            var self = this,
                io = self.io,
                c = io.config;
            self.script = S.getScript(io._getUrlForSend(), {
                charset: c.scriptCharset,
                success: function () {
                    self._callback('success');
                },
                error: function () {
                    self._callback('error');
                }
            });
        },

        _callback: function (event, abort) {
            var self = this,
                script = self.script,
                io = self.io;
            // 防止重复调用,成功后 abort
            if (!script) {
                return;
            }
            self.script = undefined;
            if (abort) {
                return;
            }
            // Callback if not abort
            if (event !== 'error') {
                io._ioReady(OK_CODE, 'success');
            }
            // 非 ie<9 可以判断出来
            else if (event === 'error') {
                io._ioReady(ERROR_CODE, 'script error');
            }
        },

        abort: function () {
            this._callback(0, 1);
        }
    });

    IO.setupTransport('script', ScriptTransport);

    return IO;
});