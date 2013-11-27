/**
 * @ignore
 * filter select from combobox
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require,exports,module) {
    var Combobox =require('./control');

    function valInAutoCompleteList(inputVal, _saveData) {
        var valid = false;
        if (_saveData) {
            for (var i = 0; i < _saveData.length; i++) {
                if (_saveData[i].textContent === inputVal) {
                    return _saveData[i];
                }
            }
        }
        return valid;
    }

    /**
     * validate combobox input by dataSource
     * @class KISSY.ComboBox.FilterSelect
     * @extends KISSY.ComboBox
     */
    module.exports = Combobox.extend({
        validate: function (callback) {
            var self = this;
            self.callSuper(function (error, val) {
                if (!error) {
                    self.get('dataSource').fetchData(val, function (data) {
                        var d = valInAutoCompleteList(val, self.normalizeData(data));
                        callback(d ? '' : self.get('invalidMessage'), val, d);
                    });
                } else {
                    callback(error, val);
                }
            });
        }
    }, {
        ATTRS: {
            /**
             * when does not match show invalidMessage
             * @cfg {String} invalidMessage
             */
            /**
             * @ignore
             */
            invalidMessage: {
                value: 'invalid input'
            }
        }
    });
});