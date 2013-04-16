/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:20
*/
/**
 * Add table plugin for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/table", function (S, Editor, DialogLoader) {

    var UA = S.UA,
        DOM = S.DOM,
        Node = S.Node,
        tableRules = ["tr", "th", "td", "tbody", "table"],
        cellNodeRegex = /^(?:td|th)$/;

    function getSelectedCells(selection) {
        // Walker will try to split text nodes, which will make the current selection
        // invalid. So save bookmarks before doing anything.
        var bookmarks = selection.createBookmarks(),
            ranges = selection.getRanges(),
            retval = [],
            database = {};

        function moveOutOfCellGuard(node) {
            // Apply to the first cell only.
            if (retval.length > 0) {
                return;
            }
            // If we are exiting from the first </td>, then the td should definitely be
            // included.
            if (node[0].nodeType == DOM.NodeType.ELEMENT_NODE &&
                cellNodeRegex.test(node.nodeName()) &&
                !node.data('selected_cell')) {
                node._4e_setMarker(database, 'selected_cell', true, undefined);
                retval.push(node);
            }
        }

        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[ i ];

            if (range.collapsed) {
                // Walker does not handle collapsed ranges yet - fall back to old API.
                var startNode = range.getCommonAncestor(),
                    nearestCell = startNode.closest('td', undefined) ||
                        startNode.closest('th', undefined);
                if (nearestCell)
                    retval.push(nearestCell);
            } else {
                var walker = new Walker(range),
                    node;
                walker.guard = moveOutOfCellGuard;

                while (( node = walker.next() )) {
                    // If may be possible for us to have a range like this:
                    // <td>^1</td><td>^2</td>
                    // The 2nd td shouldn't be included.
                    //
                    // So we have to take care to include a td we've entered only when we've
                    // walked into its children.

                    var parent = node.parent();
                    if (parent && cellNodeRegex.test(parent.nodeName()) &&
                        !parent.data('selected_cell')) {
                        parent._4e_setMarker(database, 'selected_cell', true, undefined);
                        retval.push(parent);
                    }
                }
            }
        }

        Editor.Utils.clearAllMarkers(database);
        // Restore selection position.
        selection.selectBookmarks(bookmarks);

        return retval;
    }

    function clearRow($tr) {
        // Get the array of row's cells.
        var $cells = $tr.cells;
        // Empty all cells.
        for (var i = 0; i < $cells.length; i++) {
            $cells[ i ].innerHTML = '';
            if (!UA['ie'])
                ( new Node($cells[ i ]) )._4e_appendBogus(undefined);
        }
    }

    function insertRow(selection, insertBefore) {
        // Get the row where the selection is placed in.
        var row = selection.getStartElement().parent('tr');
        if (!row)
            return;

        // Create a clone of the row.
        var newRow = row.clone(true);
        // Insert the new row before of it.
        newRow.insertBefore(row);
        // Clean one of the rows to produce the illusion of
        // inserting an empty row
        // before or after.
        clearRow(insertBefore ? newRow[0] : row[0]);
    }

    function deleteRows(selectionOrRow) {
        if (selectionOrRow instanceof Editor.Selection) {
            var cells = getSelectedCells(selectionOrRow),
                cellsCount = cells.length,
                rowsToDelete = [],
                cursorPosition,
                previousRowIndex,
                nextRowIndex;

            // Queue up the rows - it's possible and
            // likely that we have duplicates.
            for (var i = 0; i < cellsCount; i++) {
                var row = cells[ i ].parent(),
                    rowIndex = row[0].rowIndex;

                !i && ( previousRowIndex = rowIndex - 1 );
                rowsToDelete[ rowIndex ] = row;
                i == cellsCount - 1 && ( nextRowIndex = rowIndex + 1 );
            }

            var table = row.parent('table'),
                rows = table[0].rows,
                rowCount = rows.length;

            // Where to put the cursor after rows been deleted?
            // 1. Into next sibling row if any;
            // 2. Into previous sibling row if any;
            // 3. Into table's parent element if it's the very last row.
            cursorPosition = new Node(
                nextRowIndex < rowCount && table[0].rows[ nextRowIndex ] ||
                    previousRowIndex > 0 && table[0].rows[ previousRowIndex ] ||
                    table[0].parentNode);

            for (i = rowsToDelete.length; i >= 0; i--) {
                if (rowsToDelete[ i ])
                    deleteRows(rowsToDelete[ i ]);
            }

            return cursorPosition;
        }
        else if (selectionOrRow instanceof Node) {
            table = selectionOrRow.parent('table');

            if (table[0].rows.length == 1)
                table.remove();
            else
                selectionOrRow.remove();
        }

        return 0;
    }

    function insertColumn(selection, insertBefore) {
        // Get the cell where the selection is placed in.
        var startElement = selection.getStartElement(),
            cell = startElement.closest('td', undefined) ||
                startElement.closest('th', undefined);

        if (!cell) {
            return;
        }

        // Get the cell's table.
        var table = cell.parent('table'),
            cellIndex = cell[0].cellIndex;
        // Loop through all rows available in the table.
        for (var i = 0; i < table[0].rows.length; i++) {
            var $row = table[0].rows[ i ];
            // If the row doesn't have enough cells, ignore it.
            if ($row.cells.length < ( cellIndex + 1 ))
                continue;
            cell = new Node($row.cells[ cellIndex ].cloneNode(undefined));

            if (!UA['ie'])
                cell._4e_appendBogus(undefined);
            // Get back the currently selected cell.
            var baseCell = new Node($row.cells[ cellIndex ]);
            if (insertBefore)
                cell.insertBefore(baseCell);
            else
                cell.insertAfter(baseCell);
        }
    }

    function getFocusElementAfterDelCols(cells) {
        var cellIndexList = [],
            table = cells[ 0 ] && cells[ 0 ].parent('table'),
            i, length,
            targetIndex, targetCell;

        // get the cellIndex list of delete cells
        for (i = 0, length = cells.length; i < length; i++) {
            cellIndexList.push(cells[i][0].cellIndex);
        }

        // get the focusable column index
        cellIndexList.sort();
        for (i = 1, length = cellIndexList.length;
             i < length; i++) {
            if (cellIndexList[ i ] - cellIndexList[ i - 1 ] > 1) {
                targetIndex = cellIndexList[ i - 1 ] + 1;
                break;
            }
        }

        if (!targetIndex) {
            targetIndex = cellIndexList[ 0 ] > 0 ? ( cellIndexList[ 0 ] - 1 )
                : ( cellIndexList[ cellIndexList.length - 1 ] + 1 );
        }

        // scan row by row to get the target cell
        var rows = table[0].rows;
        for (i = 0, length = rows.length;
             i < length; i++) {
            targetCell = rows[ i ].cells[ targetIndex ];
            if (targetCell) {
                break;
            }
        }

        return targetCell ? new Node(targetCell) : table.prev();
    }

    function deleteColumns(selectionOrCell) {
        if (selectionOrCell instanceof Editor.Selection) {
            var colsToDelete = getSelectedCells(selectionOrCell),
                elementToFocus = getFocusElementAfterDelCols(colsToDelete);

            for (var i = colsToDelete.length - 1; i >= 0; i--) {
                //某一列已经删除？？这一列的cell再做？ !table判断处理
                if (colsToDelete[ i ]) {
                    deleteColumns(colsToDelete[i]);
                }
            }

            return elementToFocus;
        } else if (selectionOrCell instanceof Node) {
            // Get the cell's table.
            var table = selectionOrCell.parent('table');

            //该单元格所属的列已经被删除了
            if (!table)
                return null;

            // Get the cell index.
            var cellIndex = selectionOrCell[0].cellIndex;

            /*
             * Loop through all rows from down to up,
             *  coz it's possible that some rows
             * will be deleted.
             */
            for (i = table[0].rows.length - 1; i >= 0; i--) {
                // Get the row.
                var row = new Node(table[0].rows[ i ]);

                // If the cell to be removed is the first one and
                //  the row has just one cell.
                if (!cellIndex && row[0].cells.length == 1) {
                    deleteRows(row);
                    continue;
                }

                // Else, just delete the cell.
                if (row[0].cells[ cellIndex ])
                    row[0].removeChild(row[0].cells[ cellIndex ]);
            }
        }

        return null;
    }

    function placeCursorInCell(cell, placeAtEnd) {
        var range = new Editor.Range(cell[0].ownerDocument);
        if (!range['moveToElementEditablePosition'](cell,
            placeAtEnd ? true : undefined)) {
            range.selectNodeContents(cell);
            range.collapse(placeAtEnd ? false : true);
        }
        range.select(true);
    }

    function getSel(editor) {
        var selection = editor.getSelection(),
            startElement = selection && selection.getStartElement(),
            table = startElement && startElement.closest('table', undefined);
        if (!table)
            return undefined;
        var td = startElement.closest(function (n) {
            var name = DOM.nodeName(n);
            return table.contains(n) && (name == "td" || name == "th");
        }, undefined);
        var tr = startElement.closest(function (n) {
            var name = DOM.nodeName(n);
            return table.contains(n) && name == "tr";
        }, undefined);
        return {
            table:table,
            td:td,
            tr:tr
        };
    }

    function ensureTd(editor) {
        var info = getSel(editor);
        return info && info.td;

    }

    function ensureTr(editor) {
        var info = getSel(editor);
        return info && info.tr;
    }

    var statusChecker = {
        "表格属性":getSel,
        "删除表格":ensureTd,
        "删除列":ensureTd,
        "删除行":ensureTr,
        '在上方插入行':ensureTr,
        '在下方插入行':ensureTr,
        '在左侧插入列':ensureTd,
        '在右侧插入列':ensureTd
    };

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

        cssStyleText = cssTemplate.replace(/%2/g, showBorderClassName),

        extraDataFilter = {
            tags:{
                'table':function (element) {
                    var cssClass = element.getAttribute("class"),
                        border = parseInt(element.getAttribute("border"), 10);

                    if (!border || border <= 0) {
                        element.setAttribute("class", S.trim((cssClass || "") +
                            ' ' + showBorderClassName));
                    }
                }
            }
        },

        extraHTMLFilter = {
            tags:{
                'table':function (table) {
                    var cssClass = table.getAttribute("class"), v;

                    if (cssClass) {
                        v = S.trim(cssClass.replace(showBorderClassName, ""));
                        if (v) {
                            table.setAttribute("class", v);
                        } else {
                            table.removeAttribute("class");
                        }
                    }


                }

            }
        };

    function TablePlugin(config) {
        this.config = config || {};
    }

    S.augment(TablePlugin, {
        pluginRenderUI:function (editor) {
            /**
             * 动态加入显表格 border css，便于编辑
             */
            editor.addCustomStyle(cssStyleText);

            var dataProcessor = editor.htmlDataProcessor,
                dataFilter = dataProcessor && dataProcessor.dataFilter,
                htmlFilter = dataProcessor && dataProcessor.htmlFilter;

            dataFilter.addRules(extraDataFilter);
            htmlFilter.addRules(extraHTMLFilter);

            var self = this,
                handlers = {

                    "表格属性":function () {
                        this.hide();
                        var info = getSel(editor);
                        if (info) {
                            DialogLoader.useDialog(editor, "table",
                                self.config,
                                {
                                    selectedTable:info.table,
                                    selectedTd:info.td
                                });
                        }
                    },

                    "删除表格":function () {
                        this.hide();
                        var selection = editor.getSelection(),
                            startElement = selection && selection.getStartElement(),
                            table = startElement && startElement.closest('table', undefined);

                        if (!table) {
                            return;
                        }

                        editor.execCommand("save");

                        // Maintain the selection point at where the table was deleted.
                        selection.selectElement(table);
                        var range = selection.getRanges()[0];
                        range.collapse();
                        selection.selectRanges([ range ]);

                        // If the table's parent has only one child,
                        // remove it,except body,as well.( #5416 )
                        var parent = table.parent();
                        if (parent[0].childNodes.length == 1 &&
                            parent.nodeName() != 'body' &&
                            parent.nodeName() != 'td') {
                            parent.remove();
                        } else {
                            table.remove();
                        }
                        editor.execCommand("save");
                    },

                    '删除行 ':function () {
                        this.hide();
                        editor.execCommand("save");
                        var selection = editor.getSelection();
                        placeCursorInCell(deleteRows(selection), undefined);
                        editor.execCommand("save");
                    },

                    '删除列 ':function () {
                        this.hide();
                        editor.execCommand("save");
                        var selection = editor.getSelection(),
                            element = deleteColumns(selection);
                        element && placeCursorInCell(element, true);
                        editor.execCommand("save");
                    },

                    '在上方插入行':function () {
                        this.hide();
                        editor.execCommand("save");
                        var selection = editor.getSelection();
                        insertRow(selection, true);
                        editor.execCommand("save");
                    },

                    '在下方插入行':function () {
                        this.hide();
                        editor.execCommand("save");
                        var selection = editor.getSelection();
                        insertRow(selection, undefined);
                        editor.execCommand("save");
                    },

                    '在左侧插入列':function () {
                        this.hide();
                        editor.execCommand("save");
                        var selection = editor.getSelection();
                        insertColumn(selection, true);
                        editor.execCommand("save");
                    },

                    '在右侧插入列':function () {
                        this.hide();
                        editor.execCommand("save");
                        var selection = editor.getSelection();
                        insertColumn(selection, undefined);
                        editor.execCommand("save");
                    }
                };

            var children = [];
            S.each(handlers, function (h, name) {
                children.push({
                    content:name
                });
            });

            editor.addContextMenu("table", function (node) {
                if (S.inArray(DOM.nodeName(node), tableRules)) {
                    return true;
                }
            }, {
                width:"120px",
                children:children,
                listeners:{
                    click:function (e) {
                        var content = e.target.get("content");
                        if (handlers[content]) {
                            handlers[content].apply(this);
                        }

                    },
                    beforeVisibleChange:function (e) {
                        if (e.newVal) {
                            var self = this, children = self.get("children");
                            var editor = self.get("editor");
                            S.each(children, function (c) {
                                var content = c.get("content");
                                if (!statusChecker[content] ||
                                    statusChecker[content].call(self, editor)) {
                                    c.set("disabled", false);
                                } else {
                                    c.set("disabled", true);
                                }
                            });

                        }
                    }
                }
            });

            editor.addButton("table", {
                mode:Editor.Mode.WYSIWYG_MODE,
                listeners:{
                    click:function () {
                        DialogLoader.useDialog(editor, "table",
                            self.config,
                            {
                                selectedTable:0,
                                selectedTd:0
                            });

                    }
                },
                tooltip:"插入表格"
            });

        }
    });

    return TablePlugin;
}, {
    requires:['editor', './dialog-loader', './contextmenu']
});
