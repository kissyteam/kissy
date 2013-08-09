/**
 * month panel for date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/picker/month-panel/control',function(S,
                                                     Node,
                                                     GregorianCalendar,
                                                     Control,
                                                     MonthPanelRender){
    var tap = Node.Gesture.tap;
    var $ = Node.all;

    function goYear(self, direction) {
        var next = self.get('value').clone();
        next.add(GregorianCalendar.YEAR, direction);
        self.set('value', next);
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
        value.set(GregorianCalendar.MONTH,trIndex*4+tdIndex);
        this.set('value', value);
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
        }
    },{
        xclass:'date-picker-month-panel',
        ATTRS:{
            value:{
                view:1
            },
            xrender:{
                value:MonthPanelRender
            }
        }
    })
},{
    requires:['node','date/gregorian','component/control','./render']
});