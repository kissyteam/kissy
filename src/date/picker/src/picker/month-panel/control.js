/**
 * @ignore
 * month panel for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S,require){
    var Node = require('node'),
        Control = require('component/control'),
        YearPanel = require('../year-panel/control'),
        MonthPanelRender = require('./render');

    var tap = Node.Gesture.tap;
    var $ = Node.all;

    function goYear(self, direction) {
        var next = self.get('value').clone();
        next.addYear( direction);
        self.set('value',next);
    }

    function nextYear(e) {
        e.preventDefault();
        goYear(this, 1);
    }

    function prevYear(e) {
        e.preventDefault();
        goYear(this, -1);
    }

    function chooseCell(e) {
        e.preventDefault();
        var td = $(e.currentTarget);
        var tr = td.parent();
        var tdIndex = td.index();
        var trIndex = tr.index();
        var value=this.get('value').clone();
        value.setMonth(trIndex*4+tdIndex);
        this.fire('select',{
            value:value
        });
    }
    
    function showYearPanel(e) {
        e.preventDefault();
        var yearPanel = this.get('yearPanel');
        yearPanel.set('value', this.get('value'));
        yearPanel.show();
    }

    function setUpYearPanel() {
        var self = this;
        var yearPanel = new YearPanel({
            locale:this.get('locale'),
            render: self.get('render')
        });
        yearPanel.on('select', onYearPanelSelect, self);
        return yearPanel;
    }

    function onYearPanelSelect(e) {
        this.set('value', e.value);
        this.get('yearPanel').hide();
    }

    return Control.extend({
        bindUI: function () {
            var self = this;
            self.get('nextYearBtn').on(tap, nextYear, self);
            self.get('previousYearBtn').on(tap, prevYear, self);
            self.get('tbodyEl').delegate(
                tap,
                '.' + self.view.getBaseCssClass('cell'),
                chooseCell,
                self
            );
            self.get('yearSelectEl').on(tap,showYearPanel,self);
        }
    },{
        xclass:'date-picker-month-panel',
        ATTRS:{
            focusable:{
                value:false
            },
            value:{
                view:1
            },
            yearPanel: {
                valueFn: setUpYearPanel
            },
            xrender:{
                value:MonthPanelRender
            }
        }
    });
});