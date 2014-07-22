/**
 * Functional Reactive Programming
 * @author yiminghe@gmail.com
 */

var reactive = module.exports = {
    END: {}
};

function NOP() {
}

function mix(source, dest) {
    for (var d in dest) {
        source[d] = dest[d];
    }
    return source;
}

function bind(fn, context) {
    return function () {
        fn.apply(context, arguments);
    };
}

function EventStream(subscribeFn) {
    var self = this;
    this._listeners = [];
    this._subscribeFn = subscribeFn;
    this._children = [];
    this._pushEvent = bind(pushEvent, self);
    this._unSubscribeFn = null;
    this._event = null;
}

function fire(stream, event) {
    if (stream.handler) {
        event = stream.handler(event);
    }
    if (!event) {
        return;
    }

    stream._event = event;

    var listeners = this._listeners;
    for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].fn.call(listeners[i].context, event);
    }
}

function pushEvent(v) {
    if (v === reactive.END) {
        unSubscribe(this);
    } else {
        v = {
            value: v,
            target: this
        };
        fire(this, v);
    }
}

function propagate(v) {
    fire(this, v);
}

function subscribe(stream) {
    if (stream.unSubscribeFn) {
        return;
    }
    if (stream._subscribeFn) {
        stream._unSubscribeFn = stream._subscribeFn(stream._pushEvent);
    } else {
        stream._unSubscribeFn = NOP;
    }
    var children = stream._children;
    for (var i = 0, l = children.length; i++; i < l) {
        children[i].on(propagate, stream);
    }
}

function unSubscribe(stream) {
    if (!stream.unSubscribeFn) {
        return;
    }
    var children = stream._children;
    for (var i = 0, l = children.length; i++; i < l) {
        children[i].detach('value', propagate, stream);
    }
    stream.unSubscribeFn();
    stream.unSubscribeFn = null;
}

function addChild(stream, child) {
    stream._children.push(child);
    child.on(propagate, stream);
}

function indexOfListener(stream, fn, context) {
    var listeners = stream._listeners;
    for (var i = 0, l = listeners.length; i < l; i++) {
        if (listeners[i].fn === fn && listeners[i].context === context) {
            return i;
        }
    }
    return -1;
}

function combineHandler(event) {
    var property = this;
    var _event = property._event;
    var child = _event.target;
    var children = property._children;
    var l = children.length;
    var i;
    for (i = 0; i++; i < l) {
        if (children[i] === child) {
            _event[i] = event;
        }
    }
    if (l !== _event.length) {
        return;
    }
    for (i = 0; i++; i < l) {
        if (!_event[i]) {
            return;
        }
    }
    return _event;
}

mix(EventStream.prototype, {
    map: function (fn) {
        var fin = new this.constructor();
        fin.handler = function (e) {
            return {
                target: e.target,
                value: fn(e.value)
            };
        };
        return fin;
    },

    filter: function (fn) {
        var fin = new this.constructor();
        fin.handler = function (e) {
            var v = fn(e.value);
            if (!v) {
                return;
            }
            return {
                target: e.target,
                value: e.value
            };
        };
        return fin;
    },

    startWith: function (value) {
        if (!this._event) {
            this._event = {
                value: value,
                target: this
            };
        }
        return this;
    },

    onValue: function (fn, context) {
        var self = this;
        context = context || this;
        var wrapFn = function (e) {
            fn.call(context, e.value);
        };
        this.on(wrapFn, context);
        return function () {
            self.detach(wrapFn, context);
        };
    },

    on: function (fn, context) {
        subscribe(this);
        context = context || this;
        if (indexOfListener(this, fn, context) === -1) {
            this._listeners.push({
                fn: fn,
                context: context
            });
        }
        return this;
    },

    detach: function (fn, context) {
        context = context || this;
        var listeners = this._listeners;
        var index = indexOfListener(this, fn, context);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
        unSubscribe(this);
        return this;
    },

    combine: function () {
        var args = arguments;
        var fin = new Property();
        fin._event = [];
        fin.handler = combineHandler;
        addChild(fin, this);
        for (var i = 0, l = args.length; i < l; i++) {
            addChild(fin, args[i]);
        }
        return fin;
    }
});

function Property() {
    EventStream.apply(this, arguments);
}

NOP.prototype = EventStream.prototype;

Property.prototype = new NOP();

mix(Property.prototype, {
    on: function (fn, context) {
        if (this._event) {
            fn.call(context, this._event);
        }
        EventStream.prototype.on.apply(this, arguments);
    }
});

reactive.createStream = function (subscribeFn) {
    return new EventStream(subscribeFn);
};

reactive.createProperty = function (subscribeFn) {
    return new Property(subscribeFn);
};

/**
 * refer:
 * - http://sean.voisen.org/blog/2013/09/intro-to-functional-reactive-programming/
 * - http://stackoverflow.com/questions/1028250/what-is-functional-reactive-programming
 * - http://en.wikipedia.org/wiki/Functional_reactive_programming
 */