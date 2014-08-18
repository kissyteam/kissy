/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:26
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 editor/plugin/table
*/

KISSY.add("editor/plugin/table", ["editor", "./dialog-loader", "./contextmenu", "./button"], function(S, require) {
  var Editor = require("editor");
  var OLD_IE = S.UA.ieMode < 11;
  var Walker = Editor.Walker;
  var DialogLoader = require("./dialog-loader");
  require("./contextmenu");
  require("./button");
  var UA = S.UA, Dom = S.DOM, Node = S.Node, tableRules = ["tr", "th", "td", "tbody", "table"], cellNodeRegex = /^(?:td|th)$/;
  function getSelectedCells(selection) {
    var bookmarks = selection.createBookmarks(), ranges = selection.getRanges(), retval = [], database = {};
    function moveOutOfCellGuard(node) {
      if(retval.length > 0) {
        return
      }
      if(node[0].nodeType === Dom.NodeType.ELEMENT_NODE && cellNodeRegex.test(node.nodeName()) && !node.data("selected_cell")) {
        node._4eSetMarker(database, "selected_cell", true, undefined);
        retval.push(node)
      }
    }
    for(var i = 0;i < ranges.length;i++) {
      var range = ranges[i];
      if(range.collapsed) {
        var startNode = range.getCommonAncestor(), nearestCell = startNode.closest("td", undefined) || startNode.closest("th", undefined);
        if(nearestCell) {
          retval.push(nearestCell)
        }
      }else {
        var walker = new Walker(range), node;
        walker.guard = moveOutOfCellGuard;
        while(node = walker.next()) {
          var parent = node.parent();
          if(parent && cellNodeRegex.test(parent.nodeName()) && !parent.data("selected_cell")) {
            parent._4eSetMarker(database, "selected_cell", true, undefined);
            retval.push(parent)
          }
        }
      }
    }
    Editor.Utils.clearAllMarkers(database);
    selection.selectBookmarks(bookmarks);
    return retval
  }
  function clearRow($tr) {
    var $cells = $tr.cells;
    for(var i = 0;i < $cells.length;i++) {
      $cells[i].innerHTML = "";
      if(!OLD_IE) {
        (new Node($cells[i]))._4eAppendBogus(undefined)
      }
    }
  }
  function insertRow(selection, insertBefore) {
    var row = selection.getStartElement().parent("tr");
    if(!row) {
      return
    }
    var newRow = row.clone(true);
    newRow.insertBefore(row);
    clearRow(insertBefore ? newRow[0] : row[0])
  }
  function deleteRows(selectionOrRow) {
    var table;
    if(selectionOrRow instanceof Editor.Selection) {
      var cells = getSelectedCells(selectionOrRow), cellsCount = cells.length, rowsToDelete = [], cursorPosition, previousRowIndex, row, nextRowIndex;
      for(var i = 0;i < cellsCount;i++) {
        row = cells[i].parent();
        var rowIndex = row[0].rowIndex;
        if(!i) {
          previousRowIndex = rowIndex - 1
        }
        rowsToDelete[rowIndex] = row;
        if(i === cellsCount - 1) {
          nextRowIndex = rowIndex + 1
        }
      }
      table = row.parent("table");
      var rows = table[0].rows, rowCount = rows.length;
      cursorPosition = new Node(nextRowIndex < rowCount && table[0].rows[nextRowIndex] || previousRowIndex > 0 && table[0].rows[previousRowIndex] || table[0].parentNode);
      for(i = rowsToDelete.length;i >= 0;i--) {
        if(rowsToDelete[i]) {
          deleteRows(rowsToDelete[i])
        }
      }
      return cursorPosition
    }else {
      if(selectionOrRow instanceof Node) {
        table = selectionOrRow.parent("table");
        if(table[0].rows.length === 1) {
          table.remove()
        }else {
          selectionOrRow.remove()
        }
      }
    }
    return 0
  }
  function insertColumn(selection, insertBefore) {
    var startElement = selection.getStartElement(), cell = startElement.closest("td", undefined) || startElement.closest("th", undefined);
    if(!cell) {
      return
    }
    var table = cell.parent("table"), cellIndex = cell[0].cellIndex;
    for(var i = 0;i < table[0].rows.length;i++) {
      var $row = table[0].rows[i];
      if($row.cells.length < cellIndex + 1) {
        continue
      }
      cell = new Node($row.cells[cellIndex].cloneNode(undefined));
      if(!OLD_IE) {
        cell._4eAppendBogus(undefined)
      }
      var baseCell = new Node($row.cells[cellIndex]);
      if(insertBefore) {
        cell.insertBefore(baseCell)
      }else {
        cell.insertAfter(baseCell)
      }
    }
  }
  function getFocusElementAfterDelCols(cells) {
    var cellIndexList = [], table = cells[0] && cells[0].parent("table"), i, length, targetIndex, targetCell;
    for(i = 0, length = cells.length;i < length;i++) {
      cellIndexList.push(cells[i][0].cellIndex)
    }
    cellIndexList.sort();
    for(i = 1, length = cellIndexList.length;i < length;i++) {
      if(cellIndexList[i] - cellIndexList[i - 1] > 1) {
        targetIndex = cellIndexList[i - 1] + 1;
        break
      }
    }
    if(!targetIndex) {
      targetIndex = cellIndexList[0] > 0 ? cellIndexList[0] - 1 : cellIndexList[cellIndexList.length - 1] + 1
    }
    var rows = table[0].rows;
    for(i = 0, length = rows.length;i < length;i++) {
      targetCell = rows[i].cells[targetIndex];
      if(targetCell) {
        break
      }
    }
    return targetCell ? new Node(targetCell) : table.prev()
  }
  function deleteColumns(selectionOrCell) {
    var i;
    if(selectionOrCell instanceof Editor.Selection) {
      var colsToDelete = getSelectedCells(selectionOrCell), elementToFocus = getFocusElementAfterDelCols(colsToDelete);
      for(i = colsToDelete.length - 1;i >= 0;i--) {
        if(colsToDelete[i]) {
          deleteColumns(colsToDelete[i])
        }
      }
      return elementToFocus
    }else {
      if(selectionOrCell instanceof Node) {
        var table = selectionOrCell.parent("table");
        if(!table) {
          return null
        }
        var cellIndex = selectionOrCell[0].cellIndex;
        for(i = table[0].rows.length - 1;i >= 0;i--) {
          var row = new Node(table[0].rows[i]);
          if(!cellIndex && row[0].cells.length === 1) {
            deleteRows(row);
            continue
          }
          if(row[0].cells[cellIndex]) {
            row[0].removeChild(row[0].cells[cellIndex])
          }
        }
      }
    }
    return null
  }
  function placeCursorInCell(cell, placeAtEnd) {
    var range = new Editor.Range(cell[0].ownerDocument);
    if(!range.moveToElementEditablePosition(cell, placeAtEnd ? true : undefined)) {
      range.selectNodeContents(cell);
      range.collapse(placeAtEnd ? false : true)
    }
    range.select(true)
  }
  function getSel(editor) {
    var selection = editor.getSelection(), startElement = selection && selection.getStartElement(), table = startElement && startElement.closest("table", undefined);
    if(!table) {
      return undefined
    }
    var td = startElement.closest(function(n) {
      var name = Dom.nodeName(n);
      return table.contains(n) && (name === "td" || name === "th")
    }, undefined);
    var tr = startElement.closest(function(n) {
      var name = Dom.nodeName(n);
      return table.contains(n) && name === "tr"
    }, undefined);
    return{table:table, td:td, tr:tr}
  }
  function ensureTd(editor) {
    var info = getSel(editor);
    return info && info.td
  }
  function ensureTr(editor) {
    var info = getSel(editor);
    return info && info.tr
  }
  var statusChecker = {"\u8868\u683c\u5c5e\u6027":getSel, "\u5220\u9664\u8868\u683c":ensureTd, "\u5220\u9664\u5217":ensureTd, "\u5220\u9664\u884c":ensureTr, "\u5728\u4e0a\u65b9\u63d2\u5165\u884c":ensureTr, "\u5728\u4e0b\u65b9\u63d2\u5165\u884c":ensureTr, "\u5728\u5de6\u4fa7\u63d2\u5165\u5217":ensureTd, "\u5728\u53f3\u4fa7\u63d2\u5165\u5217":ensureTd};
  var showBorderClassName = "ke_show_border", cssTemplate = (UA.ie === 6 ? ["table.%2,", "table.%2 td, table.%2 th,", "{", "border : #d3d3d3 1px dotted", "}"] : [" table.%2,", " table.%2 > tr > td,  table.%2 > tr > th,", " table.%2 > tbody > tr > td, " + " table.%2 > tbody > tr > th,", " table.%2 > thead > tr > td,  table.%2 > thead > tr > th,", " table.%2 > tfoot > tr > td,  table.%2 > tfoot > tr > th", "{", "border : #d3d3d3 1px dotted", "}"]).join(""), cssStyleText = cssTemplate.replace(/%2/g, 
  showBorderClassName), extraDataFilter = {tags:{table:function(element) {
    var cssClass = element.getAttribute("class"), border = parseInt(element.getAttribute("border"), 10);
    if(!border || border <= 0) {
      element.setAttribute("class", S.trim((cssClass || "") + " " + showBorderClassName))
    }
  }}}, extraHTMLFilter = {tags:{table:function(table) {
    var cssClass = table.getAttribute("class"), v;
    if(cssClass) {
      v = S.trim(cssClass.replace(showBorderClassName, ""));
      if(v) {
        table.setAttribute("class", v)
      }else {
        table.removeAttribute("class")
      }
    }
  }}};
  function TablePlugin(config) {
    this.config = config || {}
  }
  S.augment(TablePlugin, {pluginRenderUI:function(editor) {
    editor.addCustomStyle(cssStyleText);
    var dataProcessor = editor.htmlDataProcessor, dataFilter = dataProcessor && dataProcessor.dataFilter, htmlFilter = dataProcessor && dataProcessor.htmlFilter;
    dataFilter.addRules(extraDataFilter);
    htmlFilter.addRules(extraHTMLFilter);
    var self = this, handlers = {"\u8868\u683c\u5c5e\u6027":function() {
      this.hide();
      var info = getSel(editor);
      if(info) {
        DialogLoader.useDialog(editor, "table", self.config, {selectedTable:info.table, selectedTd:info.td})
      }
    }, "\u5220\u9664\u8868\u683c":function() {
      this.hide();
      var selection = editor.getSelection(), startElement = selection && selection.getStartElement(), table = startElement && startElement.closest("table", undefined);
      if(!table) {
        return
      }
      editor.execCommand("save");
      selection.selectElement(table);
      var range = selection.getRanges()[0];
      range.collapse();
      selection.selectRanges([range]);
      var parent = table.parent();
      if(parent[0].childNodes.length === 1 && parent.nodeName() !== "body" && parent.nodeName() !== "td") {
        parent.remove()
      }else {
        table.remove()
      }
      editor.execCommand("save")
    }, "\u5220\u9664\u884c ":function() {
      this.hide();
      editor.execCommand("save");
      var selection = editor.getSelection();
      placeCursorInCell(deleteRows(selection), undefined);
      editor.execCommand("save")
    }, "\u5220\u9664\u5217 ":function() {
      this.hide();
      editor.execCommand("save");
      var selection = editor.getSelection(), element = deleteColumns(selection);
      if(element) {
        placeCursorInCell(element, true)
      }
      editor.execCommand("save")
    }, "\u5728\u4e0a\u65b9\u63d2\u5165\u884c":function() {
      this.hide();
      editor.execCommand("save");
      var selection = editor.getSelection();
      insertRow(selection, true);
      editor.execCommand("save")
    }, "\u5728\u4e0b\u65b9\u63d2\u5165\u884c":function() {
      this.hide();
      editor.execCommand("save");
      var selection = editor.getSelection();
      insertRow(selection, undefined);
      editor.execCommand("save")
    }, "\u5728\u5de6\u4fa7\u63d2\u5165\u5217":function() {
      this.hide();
      editor.execCommand("save");
      var selection = editor.getSelection();
      insertColumn(selection, true);
      editor.execCommand("save")
    }, "\u5728\u53f3\u4fa7\u63d2\u5165\u5217":function() {
      this.hide();
      editor.execCommand("save");
      var selection = editor.getSelection();
      insertColumn(selection, undefined);
      editor.execCommand("save")
    }};
    var children = [];
    S.each(handlers, function(h, name) {
      children.push({content:name})
    });
    editor.addContextMenu("table", function(node) {
      if(S.inArray(Dom.nodeName(node), tableRules)) {
        return true
      }
    }, {width:"120px", children:children, listeners:{click:function(e) {
      var content = e.target.get("content");
      if(handlers[content]) {
        handlers[content].apply(this)
      }
    }, beforeVisibleChange:function(e) {
      if(e.newVal) {
        var self = this, children = self.get("children");
        var editor = self.get("editor");
        S.each(children, function(c) {
          var content = c.get("content");
          if(!statusChecker[content] || statusChecker[content].call(self, editor)) {
            c.set("disabled", false)
          }else {
            c.set("disabled", true)
          }
        })
      }
    }}});
    editor.addButton("table", {mode:Editor.Mode.WYSIWYG_MODE, listeners:{click:function() {
      DialogLoader.useDialog(editor, "table", self.config, {selectedTable:0, selectedTd:0})
    }}, tooltip:"\u63d2\u5165\u8868\u683c"})
  }});
  return TablePlugin
});

