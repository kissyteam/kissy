/**
 * LinkedBuffer of generate content from xtemplate
 * @author yiminghe@gmail.com
 */

var undef;
var util = require('util');

function Buffer(list) {
    this.list = list;
    this.init();
}

Buffer.prototype = {
    constructor: Buffer,

    isBuffer: 1,

    init: function () {
        this.data = '';
    },

    append: function (data) {
        this.data += data;
    },

    write: function (data, escape) {
        if (data || data === 0) {
            this.append(escape ? util.escapeHtml(data) : data);
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
            callback(reason, undef);
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

function LinkedBuffer(callback, config) {
    var self = this;
    self.config = config;
    self.head = new Buffer(self);
    self.callback = callback;
    this.init();
}

LinkedBuffer.prototype = {
    constructor: LinkedBuffer,

    init: function () {
        this.data = '';
    },

    append: function (data) {
        this.data += data;
    },

    end: function () {
        this.callback(null, this.data);
    },

    flush: function () {
        var self = this;
        var fragment = self.head;
        while (fragment) {
            if (fragment.ready) {
                this.append(fragment.data);
            } else {
                return;
            }
            fragment = fragment.next;
            self.head = fragment;
        }
        self.end();
    }
};

LinkedBuffer.Buffer = Buffer;

module.exports = LinkedBuffer;

/**
 * 2014-06-19 yiminghe@gmail.com
 * string concat is faster than array join: 85ms<-> 131ms
 */
