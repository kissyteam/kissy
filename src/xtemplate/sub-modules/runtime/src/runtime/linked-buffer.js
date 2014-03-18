/**
 * LinkedBuffer of generate content from xtemplate
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
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
            asyncFragment.ready = false;
            fn(asyncFragment);
            return nextFragment;
        },

        end: function (data, escape) {
            this.write(data, escape);
            this.ready = true;
            this.list.flush();
            return this;
        }
    };

    function LinkedBuffer(callback) {
        this.current = this.head = new Buffer(this);
        this.callback = callback;
        this.data = '';
    }

    LinkedBuffer.prototype = {
        constructor: LinkedBuffer,

        flush: function () {
            var fragment = this.head;
            while (fragment) {
                if (fragment.ready) {
                    this.data += fragment.data;
                } else {
                    return;
                }
                fragment = fragment.next;
                this.head = fragment;
            }
            this.callback(null, this.data);
        }
    };

    LinkedBuffer.Buffer = Buffer;

    return LinkedBuffer;
});