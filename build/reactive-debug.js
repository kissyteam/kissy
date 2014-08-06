/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 6 11:08
*/
/*
combined modules:
reactive
*/
KISSY.add('reactive', [], function (S, require, exports, module) {
    /**
 * Functional Reactive Programming
 * @author yiminghe@gmail.com
 */
    var reactive = module.exports = { END: {} };
    function NOP() {
    }
    function indexOf(array, item) {
        for (var i = 0, l = array.length; i < l; i++) {
            if (array[i] === item) {
                return i;
            }
        }
        return -1;
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
        this._endListeners = [];
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
        stream._event = event;
        if (!event) {
            return;
        }
        var listeners = stream._listeners.concat();
        for (var i = 0, l = listeners.length; i < l; i++) {
            event.currentTarget = stream;
            listeners[i].fn.call(listeners[i].context, event);
        }
    }
    function pushEvent(v) {
        var self = this;
        if (v === reactive.END) {
            unSubscribe(self);
            fireEnd(self);
        } else {
            v = {
                value: v,
                currentTarget: self,
                target: self
            };
            fire(self, v);
        }
    }
    function propagate(v) {
        fire(this, v);
    }
    function subscribe(stream) {
        if (stream._listeners.length) {
            return;
        }
        if (stream._subscribeFn) {
            stream._unSubscribeFn = stream._subscribeFn(stream._pushEvent);
        } else {
            stream._unSubscribeFn = NOP;
        }
        var children = stream._children;
        for (var i = 0, l = children.length; i < l; i++) {
            children[i].on(propagate, stream);
        }
    }
    function unSubscribe(stream) {
        if (stream._listeners.length) {
            return;
        }
        var children = stream._children;
        for (var i = 0, l = children.length; i < l; i++) {
            children[i].detach(propagate, stream);
        }
        stream._unSubscribeFn();
        stream._unSubscribeFn = null;
    }
    function onEnd(stream, fn) {
        stream._endListeners.push(fn);
    }
    function detachEnd(stream, fn) {
        var index = indexOf(stream._endListeners, fn);
        if (index !== -1) {
            stream._endListeners.splice(index, 1);
        }
    }
    function fireEnd(stream) {
        var _endListeners = stream._endListeners.concat();
        for (var i = 0, l = _endListeners.length; i < l; i++) {
            _endListeners[i]();
        }
    }
    function addChild(stream, child) {
        var children = stream._children;
        children.push(child);
        function onChildEnd() {
            var index = indexOf(children, child);
            if (index !== -1) {
                children.splice(index, 1);
            }    // no other children
            // no other children
            if (children.length === 0) {
                fireEnd(stream);
            }
            detachEnd(child, onChildEnd);
        }
        onEnd(child, onChildEnd);    // already start subscribe
        // already start subscribe
        if (stream._unSubscribeFn) {
            child.on(propagate, stream);
        }
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
        var self = this;
        var _events = self._events;
        var child = event.target;
        var children = self._children;
        var l = children.length;
        var i;
        for (i = 0; i < l; i++) {
            if (children[i] === child) {
                _events[i] = event;
                break;
            }
        }
        if (l !== _events.length) {
            return;
        }
        var composedValue = [];
        for (i = 0; i < l; i++) {
            if (_events[i]) {
                composedValue[i] = _events[i].value;
            } else {
                return;
            }
        }
        return {
            target: this,
            currentTarget: this,
            value: composedValue
        };
    }
    mix(EventStream.prototype, {
        isEventStream: 1,
        filter: function (fn) {
            var fin = new this.constructor();
            fin.handler = function (e) {
                var v = fn(e.value);
                if (v) {
                    return {
                        target: e.target,
                        value: e.value
                    };
                }
            };
            addChild(fin, this);
            return fin;
        },
        map: function (fn) {
            var self = this;
            var fin = new self.constructor();
            fin.handler = function (e) {
                // do not re wrap generated stream
                if (self === e.currentTarget) {
                    var value = e.value;
                    var mapped = fn(value);
                    if (mapped && mapped.isEventStream) {
                        addChild(fin, mapped);
                    } else {
                        return {
                            target: e.target,
                            value: mapped
                        };
                    }
                } else {
                    return e;
                }
            };
            addChild(fin, self);
            return fin;
        },
        startsWith: function (value) {
            var self = this;
            if (!self._event) {
                self._event = {
                    value: value,
                    currentTarget: self,
                    target: self
                };
            }
            return self;
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
            // composable
            var args = arguments;
            var fin = new Property();
            fin._events = [];
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
        constructor: Property,
        on: function (fn, context) {
            EventStream.prototype.on.apply(this, arguments);
            if (this._event) {
                fn.call(context, this._event);
            }
        }
    });
    reactive.createEventStream = function (subscribeFn) {
        return new EventStream(subscribeFn);
    };
    reactive.createProperty = function (subscribeFn) {
        return new Property(subscribeFn);
    };    /**
 * refer:
 * - http://sean.voisen.org/blog/2013/09/intro-to-functional-reactive-programming/
 * - http://stackoverflow.com/questions/1028250/what-is-functional-reactive-programming
 * - http://en.wikipedia.org/wiki/Functional_reactive_programming
 */
});
