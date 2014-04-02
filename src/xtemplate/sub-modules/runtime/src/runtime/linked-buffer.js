/**
 * LinkedBuffer of generate content from xtemplate
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, undefined) {
    function Buffer(list) {
        this.list = list;
        this.data = '';
    }

    Buffer.prototype = {
        constructor: Buffer,

        isBuffer: 1,

        write: function (data, escape) {
            if (data || data === 0) {
                this.data += escape ? S.escapeHtml(data) : data;
            }
            return this;
        },

        async: function (fn) {
            var self = this;
            var list = self.list;
            var asyncFragment = new Buffer(list);
            var nextFragment = new Buffer(list);
            nextFragment.next = self.next;
            asyncFragment.next = nextFragment;
            self.next = asyncFragment;
            self.ready = true;
            fn(asyncFragment);
            return nextFragment;
        },

        error: function (reason) {
            var callback = this.list.callback;
            if (callback) {
                callback(reason, undefined);
                this.list.callback = null;
            }
        },

        end: function (data, escape) {
            var self = this;
            if (self.list.callback) {
                self.write(data, escape);
                self.ready = true;
                self.list.flush();
            }
            return self;
        }
    };

    function LinkedBuffer(callback) {
        var self = this;
        self.head = new Buffer(self);
        self.callback = callback;
        self.data = '';
    }

    LinkedBuffer.prototype = {
        constructor: LinkedBuffer,

        flush: function () {
            var self = this;
            var fragment = self.head;
            while (fragment) {
                if (fragment.ready) {
                    self.data += fragment.data;
                } else {
                    return;
                }
                fragment = fragment.next;
                self.head = fragment;
            }
            self.callback(null, self.data);
        }
    };

    LinkedBuffer.Buffer = Buffer;

    return LinkedBuffer;
});