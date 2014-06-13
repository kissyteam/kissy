/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:49
*/
/*
combined modules:
editor/plugin/table/dialog
*/
KISSY.add('editor/plugin/table/dialog', [
    'util',
    'editor',
    '../dialog',
    '../menubutton',
    'ua',
    'node',
    'dom'
], function (S, require, exports, module) {
    /**
 * @ignore
 * table dialog
 * @author yiminghe@gmail.com
 */
    /*global alert*/
    var util = require('util');
    var Editor = require('editor');
    var Dialog4E = require('../dialog');
    var MenuButton = require('../menubutton');
    var OLD_IE = require('ua').ieMode < 11;
    var $ = require('node'), Dom = require('dom'), trim = util.trim, showBorderClassName = 'ke_show_border', collapseTableClass = 'k-e-collapse-table', IN_SIZE = 6, alignStyle = 'margin:0 5px 0 0;', TABLE_HTML = '<div style="padding:20px 20px 10px 20px;">' + '<table class="{prefixCls}editor-table-config" style="width:100%">' + '<tr>' + '<td>' + '<label>\u884C\u6570\uFF1A ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u884C\u6570\u8BF7\u8F93\u5165\u6B63\u6574\u6570" ' + ' value="2" ' + ' class="{prefixCls}editor-table-rows {prefixCls}editor-table-create-only {prefixCls}editor-input" ' + 'style="' + alignStyle + '"' + ' size="' + IN_SIZE + '"' + ' />' + '</label>' + '</td>' + '<td>' + '<label>\u5BBD&nbsp;&nbsp;&nbsp;\u5EA6\uFF1A ' + '</label> ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u5BBD\u5EA6\u8BF7\u8F93\u5165\u6B63\u6574\u6570" ' + 'value="200" ' + 'style="' + alignStyle + '" ' + 'class="{prefixCls}editor-table-width {prefixCls}editor-input" ' + 'size="' + IN_SIZE + '"/>' + '<select class="{prefixCls}editor-table-width-unit" title="\u5BBD\u5EA6\u5355\u4F4D">' + '<option value="px">\u50CF\u7D20</option>' + '<option value="%">\u767E\u5206\u6BD4</option>' + '</select>' + '</td>' + '</tr>' + '<tr>' + '<td>' + '<label>\u5217\u6570\uFF1A ' + '<input ' + ' data-verify="^(?!0$)\\d+$" ' + ' data-warning="\u5217\u6570\u8BF7\u8F93\u5165\u6B63\u6574\u6570" ' + 'class="{prefixCls}editor-table-cols {prefixCls}editor-table-create-only {prefixCls}editor-input" ' + 'style="' + alignStyle + '"' + 'value="3" ' + 'size="' + IN_SIZE + '"/>' + '</label>' + '</td>' + '<td>' + '<label>' + '\u9AD8&nbsp;&nbsp;&nbsp;\u5EA6\uFF1A ' + '</label>' + '<input ' + ' data-verify="^((?!0$)\\d+)?$" ' + ' data-warning="\u9AD8\u5EA6\u8BF7\u8F93\u5165\u6B63\u6574\u6570" ' + 'value="" ' + 'style="' + alignStyle + '"' + 'class="{prefixCls}editor-table-height {prefixCls}editor-input" ' + 'size="' + IN_SIZE + '"/>' + ' &nbsp;\u50CF\u7D20' + '</td>' + '</tr>' + '<tr>' + '<td>' + '<label>\u5BF9\u9F50\uFF1A </label>' + '<select class="{prefixCls}editor-table-align" title="\u5BF9\u9F50">' + '<option value="">\u65E0</option>' + '<option value="left">\u5DE6\u5BF9\u9F50</option>' + '<option value="right">\u53F3\u5BF9\u9F50</option>' + '<option value="center">\u4E2D\u95F4\u5BF9\u9F50</option>' + '</select>' + '</td>' + '<td>' + '<label>\u6807\u9898\u683C\uFF1A</label> ' + '<select class="{prefixCls}editor-table-head {prefixCls}editor-table-create-only" title="\u6807\u9898\u683C">' + '<option value="">\u65E0</option>' + '<option value="1">\u6709</option>' + '</select>' + '</td>' + '</tr>' + '<tr>' + '<td>' + '<label>\u8FB9\u6846\uFF1A ' + '<input ' + ' data-verify="^\\d+$" ' + ' data-warning="\u8FB9\u6846\u8BF7\u8F93\u5165\u975E\u8D1F\u6574\u6570" ' + 'value="1" ' + 'style="' + alignStyle + '"' + 'class="{prefixCls}editor-table-border {prefixCls}editor-input" ' + 'size="' + IN_SIZE + '"/>' + '</label> &nbsp;\u50CF\u7D20' + ' ' + '<label><input ' + 'type="checkbox" ' + 'style="vertical-align: middle; margin-left: 5px;" ' + 'class="{prefixCls}editor-table-collapse" ' + '/> \u5408\u5E76\u8FB9\u6846' + '</label>' + '</td>' + '<td>' + '<label ' + 'class="{prefixCls}editor-table-cellpadding-holder"' + '>\u8FB9&nbsp;&nbsp;&nbsp;\u8DDD\uFF1A ' + '<input ' + ' data-verify="^(\\d+)?$" ' + ' data-warning="\u8FB9\u6846\u8BF7\u8F93\u5165\u975E\u8D1F\u6574\u6570" ' + 'value="0" ' + 'style="' + alignStyle + '"' + 'class="{prefixCls}editor-table-cellpadding {prefixCls}editor-input" ' + 'size="' + IN_SIZE + '"/>' + ' &nbsp;\u50CF\u7D20</label>' + '</td>' + '</tr>' + '<tr>' + '<td colspan="2">' + '<label>' + '\u6807\u9898\uFF1A ' + '<input ' + 'class="{prefixCls}editor-table-caption {prefixCls}editor-input" ' + 'style="width:380px;' + alignStyle + '">' + '</label>' + '</td>' + '</tr>' + '</table>' + '</div>', footHTML = '<div style="padding:5px 20px 20px;">' + '<a ' + 'class="{prefixCls}editor-table-ok {prefixCls}editor-button ks-inline-block" ' + 'style="margin-right:20px;">\u786E\u5B9A</a> ' + '<a ' + 'class="{prefixCls}editor-table-cancel {prefixCls}editor-button ks-inline-block">\u53D6\u6D88</a>' + '</div>', addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;
    function replacePrefix(str, prefix) {
        return util.substitute(str, { prefixCls: prefix });
    }
    function valid(str) {
        return trim(str).length !== 0;
    }
    function TableDialog(editor) {
        var self = this;
        self.editor = editor;
        Editor.Utils.lazyRun(self, '_prepareTableShow', '_realTableShow');
    }
    util.augment(TableDialog, {
        _tableInit: function () {
            var self = this, prefixCls = self.editor.get('prefixCls'), d = new Dialog4E({
                    width: '500px',
                    mask: true,
                    headerContent: '\u8868\u683C',
                    //属性',
                    bodyContent: replacePrefix(TABLE_HTML, prefixCls),
                    footerContent: replacePrefix(footHTML, prefixCls)
                }).render(), dbody = d.get('body'), foot = d.get('footer');
            d.twidth = dbody.one(replacePrefix('.{prefixCls}editor-table-width', prefixCls));
            d.theight = dbody.one(replacePrefix('.{prefixCls}editor-table-height', prefixCls));
            d.tborder = dbody.one(replacePrefix('.{prefixCls}editor-table-border', prefixCls));
            d.tcaption = dbody.one(replacePrefix('.{prefixCls}editor-table-caption', prefixCls));
            d.talign = MenuButton.Select.decorate(dbody.one(replacePrefix('.{prefixCls}editor-table-align', prefixCls)), {
                prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls),
                width: 80,
                menuCfg: {
                    prefixCls: replacePrefix('{prefixCls}editor-', prefixCls),
                    render: dbody
                }
            });
            d.trows = dbody.one(replacePrefix('.{prefixCls}editor-table-rows', prefixCls));
            d.tcols = dbody.one(replacePrefix('.{prefixCls}editor-table-cols', prefixCls));
            d.thead = MenuButton.Select.decorate(dbody.one(replacePrefix('.{prefixCls}editor-table-head', prefixCls)), {
                prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls),
                width: 80,
                menuCfg: {
                    prefixCls: replacePrefix('{prefixCls}editor-', prefixCls),
                    render: dbody
                }
            });
            d.cellpaddingHolder = dbody.one(replacePrefix('.{prefixCls}editor-table-cellpadding-holder', prefixCls));
            d.cellpadding = dbody.one(replacePrefix('.{prefixCls}editor-table-cellpadding', prefixCls));
            d.tcollapse = dbody.one(replacePrefix('.{prefixCls}editor-table-collapse', prefixCls));
            var tok = foot.one(replacePrefix('.{prefixCls}editor-table-ok', prefixCls)), tclose = foot.one(replacePrefix('.{prefixCls}editor-table-cancel', prefixCls));
            d.twidthunit = MenuButton.Select.decorate(dbody.one(replacePrefix('.{prefixCls}editor-table-width-unit', prefixCls)), {
                prefixCls: replacePrefix('{prefixCls}editor-big-', prefixCls),
                width: 80,
                menuCfg: {
                    prefixCls: replacePrefix('{prefixCls}editor-', prefixCls),
                    render: dbody
                }
            });
            self.dialog = d;
            tok.on('click', self._tableOk, self);
            tclose.on('click', function (ev) {
                ev.halt();
                d.hide();
            });
            addRes.call(self, d, d.twidthunit, tok, tclose);
        },
        _tableOk: function (ev) {
            ev.halt();
            var self = this, tableDialog = self.dialog, inputs = tableDialog.get('el').all('input');
            if (tableDialog.twidthunit.get('value') === '%') {
                var tw = parseInt(tableDialog.twidth.val(), 10);
                if (!tw || (tw > 100 || tw < 0)) {
                    alert('\u5BBD\u5EA6\u767E\u5206\u6BD4\uFF1A' + '\u8BF7\u8F93\u51651-100\u4E4B\u95F4');
                    return;
                }
            }
            var re = Editor.Utils.verifyInputs(inputs);
            if (!re) {
                return;
            }
            self.dialog.hide();
            setTimeout(function () {
                if (!self.selectedTable) {
                    self._genTable();
                } else {
                    self._modifyTable();
                }
            }, 0);
        },
        _modifyTable: function () {
            var self = this, d = self.dialog, selectedTable = self.selectedTable, caption = selectedTable.one('caption'), talignVal = d.talign.get('value'), tborderVal = d.tborder.val();
            if (valid(talignVal)) {
                selectedTable.attr('align', trim(talignVal));
            } else {
                selectedTable.removeAttr('align');
            }
            if (valid(tborderVal)) {
                selectedTable.attr('border', trim(tborderVal));
            } else {
                selectedTable.removeAttr('border');
            }
            if (!valid(tborderVal) || tborderVal === '0') {
                selectedTable.addClass(showBorderClassName, undefined);
            } else {
                selectedTable.removeClass(showBorderClassName, undefined);
            }
            if (valid(d.twidth.val())) {
                selectedTable.css('width', trim(d.twidth.val()) + d.twidthunit.get('value'));
            } else {
                selectedTable.css('width', '');
            }
            if (valid(d.theight.val())) {
                selectedTable.css('height', trim(d.theight.val()));
            } else {
                selectedTable.css('height', '');
            }
            if (d.tcollapse[0].checked) {
                selectedTable.addClass(collapseTableClass, undefined);
            } else {
                selectedTable.removeClass(collapseTableClass, undefined);
            }
            d.cellpadding.val(parseInt(d.cellpadding.val(), 10) || 0);
            if (self.selectedTd) {
                self.selectedTd.css('padding', d.cellpadding.val());
            }
            if (valid(d.tcaption.val())) {
                var tcv = util.escapeHtml(trim(d.tcaption.val()));
                if (caption && caption[0]) {
                    caption.html(tcv);
                } else {
                    //不能使用dom操作了, ie6 table 报错
                    //http://msdn.microsoft.com/en-us/library/ms532998(VS.85).aspx
                    var c = selectedTable[0].createCaption();
                    Dom.html(c, '<span>' + tcv + '</span>');    // new Node('<caption><span>' + tcv + '</span></caption>');
                                                                // .insertBefore(selectedTable[0].firstChild);
                }
            } else // new Node('<caption><span>' + tcv + '</span></caption>');
            // .insertBefore(selectedTable[0].firstChild);
            if (caption) {
                caption.remove();
            }
        },
        _genTable: function () {
            var self = this, d = self.dialog, html = '<table ', i, cols = parseInt(d.tcols.val(), 10) || 1, rows = parseInt(d.trows.val(), 10) || 1,
                //firefox 需要 br 才能得以放置焦点
                //cellPad = UA.ie ? '&nbsp;' : '&nbsp;<br/>',
                cellPad = OLD_IE ? '' : '<br/>', editor = self.editor;
            if (valid(d.talign.get('value'))) {
                html += 'align="' + trim(d.talign.get('value')) + '" ';
            }
            if (valid(d.tborder.val())) {
                html += 'border="' + trim(d.tborder.val()) + '" ';
            }
            var styles = [];
            if (valid(d.twidth.val())) {
                styles.push('width:' + trim(d.twidth.val()) + d.twidthunit.get('value') + ';');
            }
            if (valid(d.theight.val())) {
                styles.push('height:' + trim(d.theight.val()) + 'px;');
            }
            if (styles.length) {
                html += 'style="' + styles.join('') + '" ';
            }
            var classes = [];
            if (!valid(d.tborder.val()) || String(trim(d.tborder.val())) === '0') {
                classes.push(showBorderClassName);
            }
            if (d.tcollapse[0].checked) {
                classes.push(collapseTableClass);
            }
            if (classes.length) {
                html += 'class="' + classes.join(' ') + '" ';
            }
            html += '>';
            if (valid(d.tcaption.val())) {
                html += '<caption><span>' + util.escapeHtml(trim(d.tcaption.val())) + '</span></caption>';
            }
            if (d.thead.get('value')) {
                html += '<thead>';
                html += '<tr>';
                for (i = 0; i < cols; i++) {
                    html += '<th>' + cellPad + '</th>';
                }
                html += '</tr>';
                html += '</thead>';
                rows -= 1;
            }
            html += '<tbody>';
            for (var r = 0; r < rows; r++) {
                html += '<tr>';
                for (i = 0; i < cols; i++) {
                    html += '<td>' + cellPad + '</td>';
                }
                html += '</tr>';
            }
            html += '</tbody>';
            html += '</table>';
            var table = $(html, editor.get('document')[0]);
            editor.insertElement(table);
        },
        _fillTableDialog: function () {
            var self = this, d = self.dialog, selectedTable = self.selectedTable, caption = selectedTable.one('caption');
            if (self.selectedTd) {
                d.cellpadding.val(parseInt(self.selectedTd.css('padding'), 10) || '0');
            }
            d.talign.set('value', selectedTable.attr('align') || '');
            d.tborder.val(selectedTable.attr('border') || '0');
            var w = selectedTable.style('width') || '' + selectedTable.width();
            d.tcollapse[0].checked = selectedTable.hasClass(collapseTableClass, undefined);    //忽略pt单位
            //忽略pt单位
            d.twidth.val(w.replace(/px|%|(.*pt)/i, ''));
            if (w.indexOf('%') !== -1) {
                d.twidthunit.set('value', '%');
            } else {
                d.twidthunit.set('value', 'px');
            }
            d.theight.val((selectedTable.style('height') || '').replace(/px|%/i, ''));
            var c = '';
            if (caption) {
                c = caption.text();
            }
            d.tcaption.val(c);
            var head = selectedTable.first('thead'), rowLength = (selectedTable.one('tbody') ? selectedTable.one('tbody').children().length : 0) + (head ? head.children('tr').length : 0);
            d.trows.val(rowLength);
            d.tcols.val(selectedTable.one('tr') ? selectedTable.one('tr').children().length : 0);
            d.thead.set('value', head ? '1' : '');
        },
        _realTableShow: function () {
            var self = this, prefixCls = self.editor.get('prefixCls'), d = self.dialog;
            if (self.selectedTable) {
                self._fillTableDialog();
                d.get('el').all(replacePrefix('.{prefixCls}editor-table-create-only', prefixCls)).attr('disabled', 'disabled');
                d.thead.set('disabled', true);
            } else {
                d.get('el').all(replacePrefix('.{prefixCls}editor-table-create-only', prefixCls)).removeAttr('disabled');
                d.thead.set('disabled', false);
            }
            if (self.selectedTd) {
                d.cellpaddingHolder.show();
            } else {
                d.cellpaddingHolder.hide();
            }
            self.dialog.show();
        },
        _prepareTableShow: function () {
            var self = this;
            self._tableInit();
        },
        show: function (cfg) {
            var self = this;
            util.mix(self, cfg);
            self._prepareTableShow();
        },
        destroy: function () {
            destroyRes.call(this);
        }
    });
    module.exports = TableDialog;
});






