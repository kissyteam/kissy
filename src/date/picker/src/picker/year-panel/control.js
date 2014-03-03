/**
 * @ignore
 * month select for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node'),
        Control = require('component/control'),
        DecadePanelRender = require('./render'),
        DecadePanel = require('../decade-panel/control');
    var tap = Node.Gesture.tap;
    var $ = Node.all;

    function goYear(self, direction) {
        var next = self.get('value').clone();
        next.addYear(direction);
        self.set('value', next);
    }

    function nextDecade(e) {
        e.preventDefault();
        goYear(this, 10);
    }

    function prevDecade(e) {
        e.preventDefault();
        goYear(this, -10);
    }

    function chooseCell(e) {
        e.preventDefault();
        var td = $(e.currentTarget);
        var tr = td.parent();
        var tdIndex = td.index();
        var trIndex = tr.index();
        var value = this.get('value').clone();
        value.setYear(this.years[trIndex][tdIndex].content);
        this.set('value', value);
        this.fire('select', {
            value: value
        });
    }

    function showDecadePanel(e) {
        e.preventDefault();
        var decadePanel = this.get('decadePanel');
        decadePanel.set('value', this.get('value'));
        decadePanel.show();
    }

    function setUpDecadePanel() {
        var self = this;
        var decadePanel = new DecadePanel({
            locale: this.get('locale'),
            render: self.get('render')
        });
        decadePanel.on('select', onDecadePanelSelect, self);
        return decadePanel;
    }

    function onDecadePanelSelect(e) {
        this.set('value', e.value);
        this.get('decadePanel').hide();
    }

    return Control.extend({
        bindUI: function () {
            var self = this;
            self.get('nextDecadeBtn').on(tap, nextDecade, self);
            self.get('previousDecadeBtn').on(tap, prevDecade, self);
            self.get('tbodyEl').delegate(
                tap,
                '.' + self.view.getBaseCssClass('cell'),
                chooseCell,
                self
            );
            self.get('decadeSelectEl').on(tap, showDecadePanel, self);
        }
    }, {
        xclass: 'date-picker-year-panel',
        ATTRS: {
            focusable: {
                value: false
            },
            value: {
                view: 1
            },
            decadePanel: {
                valueFn: setUpDecadePanel
            },
            xrender: {
                value: DecadePanelRender
            }
        }
    });
});