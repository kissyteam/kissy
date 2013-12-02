function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/contextmenu.js']) {
  _$jscoverage['/contextmenu.js'] = {};
  _$jscoverage['/contextmenu.js'].lineData = [];
  _$jscoverage['/contextmenu.js'].lineData[6] = 0;
  _$jscoverage['/contextmenu.js'].lineData[7] = 0;
  _$jscoverage['/contextmenu.js'].lineData[8] = 0;
  _$jscoverage['/contextmenu.js'].lineData[9] = 0;
  _$jscoverage['/contextmenu.js'].lineData[10] = 0;
  _$jscoverage['/contextmenu.js'].lineData[12] = 0;
  _$jscoverage['/contextmenu.js'].lineData[14] = 0;
  _$jscoverage['/contextmenu.js'].lineData[16] = 0;
  _$jscoverage['/contextmenu.js'].lineData[18] = 0;
  _$jscoverage['/contextmenu.js'].lineData[19] = 0;
  _$jscoverage['/contextmenu.js'].lineData[20] = 0;
  _$jscoverage['/contextmenu.js'].lineData[23] = 0;
  _$jscoverage['/contextmenu.js'].lineData[24] = 0;
  _$jscoverage['/contextmenu.js'].lineData[25] = 0;
  _$jscoverage['/contextmenu.js'].lineData[26] = 0;
  _$jscoverage['/contextmenu.js'].lineData[28] = 0;
  _$jscoverage['/contextmenu.js'].lineData[30] = 0;
  _$jscoverage['/contextmenu.js'].lineData[32] = 0;
  _$jscoverage['/contextmenu.js'].lineData[33] = 0;
  _$jscoverage['/contextmenu.js'].lineData[34] = 0;
  _$jscoverage['/contextmenu.js'].lineData[35] = 0;
  _$jscoverage['/contextmenu.js'].lineData[40] = 0;
  _$jscoverage['/contextmenu.js'].lineData[41] = 0;
  _$jscoverage['/contextmenu.js'].lineData[43] = 0;
  _$jscoverage['/contextmenu.js'].lineData[44] = 0;
  _$jscoverage['/contextmenu.js'].lineData[45] = 0;
  _$jscoverage['/contextmenu.js'].lineData[48] = 0;
  _$jscoverage['/contextmenu.js'].lineData[49] = 0;
  _$jscoverage['/contextmenu.js'].lineData[50] = 0;
  _$jscoverage['/contextmenu.js'].lineData[54] = 0;
  _$jscoverage['/contextmenu.js'].lineData[55] = 0;
  _$jscoverage['/contextmenu.js'].lineData[61] = 0;
  _$jscoverage['/contextmenu.js'].lineData[63] = 0;
  _$jscoverage['/contextmenu.js'].lineData[64] = 0;
  _$jscoverage['/contextmenu.js'].lineData[66] = 0;
  _$jscoverage['/contextmenu.js'].lineData[70] = 0;
  _$jscoverage['/contextmenu.js'].lineData[71] = 0;
  _$jscoverage['/contextmenu.js'].lineData[73] = 0;
  _$jscoverage['/contextmenu.js'].lineData[74] = 0;
  _$jscoverage['/contextmenu.js'].lineData[77] = 0;
  _$jscoverage['/contextmenu.js'].lineData[78] = 0;
  _$jscoverage['/contextmenu.js'].lineData[81] = 0;
  _$jscoverage['/contextmenu.js'].lineData[82] = 0;
  _$jscoverage['/contextmenu.js'].lineData[83] = 0;
  _$jscoverage['/contextmenu.js'].lineData[85] = 0;
  _$jscoverage['/contextmenu.js'].lineData[89] = 0;
  _$jscoverage['/contextmenu.js'].lineData[90] = 0;
  _$jscoverage['/contextmenu.js'].lineData[93] = 0;
  _$jscoverage['/contextmenu.js'].lineData[95] = 0;
}
if (! _$jscoverage['/contextmenu.js'].functionData) {
  _$jscoverage['/contextmenu.js'].functionData = [];
  _$jscoverage['/contextmenu.js'].functionData[0] = 0;
  _$jscoverage['/contextmenu.js'].functionData[1] = 0;
  _$jscoverage['/contextmenu.js'].functionData[2] = 0;
  _$jscoverage['/contextmenu.js'].functionData[3] = 0;
  _$jscoverage['/contextmenu.js'].functionData[4] = 0;
  _$jscoverage['/contextmenu.js'].functionData[5] = 0;
  _$jscoverage['/contextmenu.js'].functionData[6] = 0;
  _$jscoverage['/contextmenu.js'].functionData[7] = 0;
  _$jscoverage['/contextmenu.js'].functionData[8] = 0;
}
if (! _$jscoverage['/contextmenu.js'].branchData) {
  _$jscoverage['/contextmenu.js'].branchData = {};
  _$jscoverage['/contextmenu.js'].branchData['16'] = [];
  _$jscoverage['/contextmenu.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/contextmenu.js'].branchData['19'] = [];
  _$jscoverage['/contextmenu.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/contextmenu.js'].branchData['34'] = [];
  _$jscoverage['/contextmenu.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/contextmenu.js'].branchData['44'] = [];
  _$jscoverage['/contextmenu.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/contextmenu.js'].branchData['63'] = [];
  _$jscoverage['/contextmenu.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/contextmenu.js'].branchData['89'] = [];
  _$jscoverage['/contextmenu.js'].branchData['89'][1] = new BranchData();
}
_$jscoverage['/contextmenu.js'].branchData['89'][1].init(2103, 5, 'event');
function visit6_89_1(result) {
  _$jscoverage['/contextmenu.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/contextmenu.js'].branchData['63'][1].init(249, 2, '!x');
function visit5_63_1(result) {
  _$jscoverage['/contextmenu.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/contextmenu.js'].branchData['44'][1].init(21, 13, 'e.which === 1');
function visit4_44_1(result) {
  _$jscoverage['/contextmenu.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/contextmenu.js'].branchData['34'][1].init(21, 31, 'e.keyCode === Event.KeyCode.ESC');
function visit3_34_1(result) {
  _$jscoverage['/contextmenu.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/contextmenu.js'].branchData['19'][1].init(97, 5, 'event');
function visit2_19_1(result) {
  _$jscoverage['/contextmenu.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/contextmenu.js'].branchData['16'][1].init(42, 9, 'cfg || {}');
function visit1_16_1(result) {
  _$jscoverage['/contextmenu.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/contextmenu.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/contextmenu.js'].functionData[0]++;
  _$jscoverage['/contextmenu.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/contextmenu.js'].lineData[8]++;
  var Menu = require('menu');
  _$jscoverage['/contextmenu.js'].lineData[9]++;
  var focusFix = require('./focus-fix');
  _$jscoverage['/contextmenu.js'].lineData[10]++;
  var Event = require('event');
  _$jscoverage['/contextmenu.js'].lineData[12]++;
  Editor.prototype.addContextMenu = function(id, filter, cfg) {
  _$jscoverage['/contextmenu.js'].functionData[1]++;
  _$jscoverage['/contextmenu.js'].lineData[14]++;
  var self = this;
  _$jscoverage['/contextmenu.js'].lineData[16]++;
  cfg = visit1_16_1(cfg || {});
  _$jscoverage['/contextmenu.js'].lineData[18]++;
  var event = cfg.event;
  _$jscoverage['/contextmenu.js'].lineData[19]++;
  if (visit2_19_1(event)) {
    _$jscoverage['/contextmenu.js'].lineData[20]++;
    delete cfg.event;
  }
  _$jscoverage['/contextmenu.js'].lineData[23]++;
  cfg.prefixCls = self.get('prefixCls') + 'editor-';
  _$jscoverage['/contextmenu.js'].lineData[24]++;
  cfg.editor = self;
  _$jscoverage['/contextmenu.js'].lineData[25]++;
  cfg.focusable = 1;
  _$jscoverage['/contextmenu.js'].lineData[26]++;
  cfg.zIndex = Editor.baseZIndex(Editor.ZIndexManager.POPUP_MENU);
  _$jscoverage['/contextmenu.js'].lineData[28]++;
  var menu = new Menu.PopupMenu(cfg);
  _$jscoverage['/contextmenu.js'].lineData[30]++;
  focusFix.init(menu);
  _$jscoverage['/contextmenu.js'].lineData[32]++;
  menu.on('afterRenderUI', function() {
  _$jscoverage['/contextmenu.js'].functionData[2]++;
  _$jscoverage['/contextmenu.js'].lineData[33]++;
  menu.get('el').on('keydown', function(e) {
  _$jscoverage['/contextmenu.js'].functionData[3]++;
  _$jscoverage['/contextmenu.js'].lineData[34]++;
  if (visit3_34_1(e.keyCode === Event.KeyCode.ESC)) {
    _$jscoverage['/contextmenu.js'].lineData[35]++;
    menu.hide();
  }
});
});
  _$jscoverage['/contextmenu.js'].lineData[40]++;
  self.docReady(function() {
  _$jscoverage['/contextmenu.js'].functionData[4]++;
  _$jscoverage['/contextmenu.js'].lineData[41]++;
  var doc = self.get('document');
  _$jscoverage['/contextmenu.js'].lineData[43]++;
  doc.on('mousedown', function(e) {
  _$jscoverage['/contextmenu.js'].functionData[5]++;
  _$jscoverage['/contextmenu.js'].lineData[44]++;
  if (visit4_44_1(e.which === 1)) {
    _$jscoverage['/contextmenu.js'].lineData[45]++;
    menu.hide();
  }
});
  _$jscoverage['/contextmenu.js'].lineData[48]++;
  doc.delegate('contextmenu', filter, function(ev) {
  _$jscoverage['/contextmenu.js'].functionData[6]++;
  _$jscoverage['/contextmenu.js'].lineData[49]++;
  ev.halt();
  _$jscoverage['/contextmenu.js'].lineData[50]++;
  showNow(ev);
});
});
  _$jscoverage['/contextmenu.js'].lineData[54]++;
  function showNow(ev) {
    _$jscoverage['/contextmenu.js'].functionData[7]++;
    _$jscoverage['/contextmenu.js'].lineData[55]++;
    var t = S.all(ev.target);
    _$jscoverage['/contextmenu.js'].lineData[61]++;
    var x = ev.pageX, y = ev.pageY;
    _$jscoverage['/contextmenu.js'].lineData[63]++;
    if (visit5_63_1(!x)) {
      _$jscoverage['/contextmenu.js'].lineData[64]++;
      return;
    } else {
      _$jscoverage['/contextmenu.js'].lineData[66]++;
      var translate = Editor.Utils.getXY({
  left: x, 
  top: y}, self);
      _$jscoverage['/contextmenu.js'].lineData[70]++;
      x = translate.left;
      _$jscoverage['/contextmenu.js'].lineData[71]++;
      y = translate.top;
    }
    _$jscoverage['/contextmenu.js'].lineData[73]++;
    setTimeout(function() {
  _$jscoverage['/contextmenu.js'].functionData[8]++;
  _$jscoverage['/contextmenu.js'].lineData[74]++;
  menu.set('editorSelectedEl', t, {
  silent: 1});
  _$jscoverage['/contextmenu.js'].lineData[77]++;
  menu.move(x, y);
  _$jscoverage['/contextmenu.js'].lineData[78]++;
  self.fire('contextmenu', {
  contextmenu: menu});
  _$jscoverage['/contextmenu.js'].lineData[81]++;
  menu.show();
  _$jscoverage['/contextmenu.js'].lineData[82]++;
  window.focus();
  _$jscoverage['/contextmenu.js'].lineData[83]++;
  document.body.focus();
  _$jscoverage['/contextmenu.js'].lineData[85]++;
  menu.focus();
}, 30);
  }
  _$jscoverage['/contextmenu.js'].lineData[89]++;
  if (visit6_89_1(event)) {
    _$jscoverage['/contextmenu.js'].lineData[90]++;
    showNow(event);
  }
  _$jscoverage['/contextmenu.js'].lineData[93]++;
  self.addControl(id + '/contextmenu', menu);
  _$jscoverage['/contextmenu.js'].lineData[95]++;
  return menu;
};
});
