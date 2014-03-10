/**
 * @ignore
 * lang
 * @author  yiminghe@gmail.com
 *
 */
KISSY.add(function (S, require) {
    var FALSE = false,
        CLONE_MARKER = '__~ks_cloned';

    require('util/array');
    require('util/escape');
    require('util/function');
    require('util/object');
    require('util/string');
    require('util/type');
    require('util/web');

    S.mix(S, {
        /**
         * Creates a deep copy of a plain object or array. Others are returned untouched.
         * @param input
         * @member KISSY
         * @param {Function} [filter] filter function
         * @return {Object} the new cloned object
         * refer: http://www.w3.org/TR/html5/common-dom-interfaces.html#safe-passing-of-structured-data
         */
        clone: function (input, filter) {
            // 稍微改改就和规范一样了 :)
            // Let memory be an association list of pairs of objects,
            // initially empty. This is used to handle duplicate references.
            // In each pair of objects, one is called the source object
            // and the other the destination object.
            var memory = {},
                ret = cloneInternal(input, filter, memory);
            S.each(memory, function (v) {
                // 清理在源对象上做的标记
                v = v.input;
                if (v[CLONE_MARKER]) {
                    try {
                        delete v[CLONE_MARKER];
                    } catch (e) {
                        v[CLONE_MARKER] = undefined;
                    }
                }
            });
            memory = null;
            return ret;
        }
    });

    function cloneInternal(input, f, memory) {
        var destination = input,
            isArray,
            isPlainObject,
            k,
            stamp;
        if (!input) {
            return destination;
        }

        // If input is the source object of a pair of objects in memory,
        // then return the destination object in that pair of objects .
        // and abort these steps.
        if (input[CLONE_MARKER]) {
            // 对应的克隆后对象
            return memory[input[CLONE_MARKER]].destination;
        } else if (typeof input === 'object') {
            // 引用类型要先记录
            var Constructor = input.constructor;
            if (S.inArray(Constructor, [Boolean, String, Number, Date, RegExp])) {
                destination = new Constructor(input.valueOf());
            } else if ((isArray = S.isArray(input))) {
                // ImageData , File, Blob , FileList .. etc
                destination = f ? S.filter(input, f) : input.concat();
            } else if ((isPlainObject = S.isPlainObject(input))) {
                destination = {};
            }
            // Add a mapping from input (the source object)
            // to output (the destination object) to memory.
            // 做标记
            // stamp can not be
            input[CLONE_MARKER] = (stamp = S.guid('c'));
            // 存储源对象以及克隆后的对象
            memory[stamp] = {destination: destination, input: input};
        }
        // If input is an Array object or an Object object,
        // then, for each enumerable property in input,
        // add a new property to output having the same name,
        // and having a value created from invoking the internal structured cloning algorithm recursively
        // with the value of the property as the 'input' argument and memory as the 'memory' argument.
        // The order of the properties in the input and output objects must be the same.

        // clone it
        if (isArray) {
            for (var i = 0; i < destination.length; i++) {
                destination[i] = cloneInternal(destination[i], f, memory);
            }
        } else if (isPlainObject) {
            for (k in input) {

                if (k !== CLONE_MARKER &&
                    (!f || (f.call(input, input[k], k, input) !== FALSE))) {
                    destination[k] = cloneInternal(input[k], f, memory);
                }

            }
        }

        return destination;
    }

    return S;
});
