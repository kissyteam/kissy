/**
 * table edit plugin for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("table", function(editor) {
    editor.addPlugin("table", function() {
        var S = KISSY,
            KE = S.Editor,
            UA = S.UA,
            trim = S.trim;

        /**
         * table 编辑模式下显示虚线边框便于编辑
         */
        var showBorderClassName = 'ke_show_border',
            cssTemplate =
                // IE6 don't have child selector support,
                // where nested table cells could be incorrect.
                ( UA['ie'] === 6 ?
                    [
                        'table.%2,',
                        'table.%2 td, table.%2 th,',
                        '{',
                        'border : #d3d3d3 1px dotted',
                        '}'
                    ] :
                    [
                        ' table.%2,',
                        ' table.%2 > tr > td,  table.%2 > tr > th,',
                        ' table.%2 > tbody > tr > td,  table.%2 > tbody > tr > th,',
                        ' table.%2 > thead > tr > td,  table.%2 > thead > tr > th,',
                        ' table.%2 > tfoot > tr > td,  table.%2 > tfoot > tr > th',
                        '{',
                        'border : #d3d3d3 1px dotted',
                        '}'
                    ] ).join(''),
            cssStyleText = cssTemplate.replace(/%2/g, showBorderClassName);
        var dataProcessor = editor.htmlDataProcessor,
            dataFilter = dataProcessor && dataProcessor.dataFilter,
            htmlFilter = dataProcessor && dataProcessor.htmlFilter;
        if (dataFilter) {
            dataFilter.addRules({
                elements :  {
                    'table' : function(element) {
                        var attributes = element.attributes,
                            cssClass = attributes[ 'class' ],
                            border = parseInt(attributes.border, 10);

                        if (!border || border <= 0)
                            attributes[ 'class' ] = ( cssClass || '' ) + ' ' +
                                showBorderClassName;
                    }
                }
            });
        }

        if (htmlFilter) {
            htmlFilter.addRules({
                elements :            {
                    'table' : function(table) {
                        var attributes = table.attributes,
                            cssClass = attributes[ 'class' ];

                        if (cssClass) {
                            attributes[ 'class' ] =
                                trim(cssClass.replace(showBorderClassName, "").replace(/\s{2}/, " "));
                        }
                    }

                }
            });
        }


        var context = editor.addButton("table", {
            contentCls:"ke-toolbar-table",
            mode:KE.WYSIWYG_MODE,
            title:"插入表格",
            loading:true
        });
        KE.use("table/support", function() {
            var tableUI = new KE.TableUI(editor);
            context.reload({
                offClick:function() {
                    tableUI._tableShow();
                },
                destroy:function() {
                    tableUI.destroy();
                }
            });
        });
        this.destroy = function() {
            context.destroy();
        };
        /**
         * 动态加入显表格border css，便于编辑
         */
        editor.addCustomStyle(cssStyleText);
    });
}, {
    attach:false
});
