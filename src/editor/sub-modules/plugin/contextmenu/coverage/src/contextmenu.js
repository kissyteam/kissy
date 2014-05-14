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
  _$jscoverage['/contextmenu.js'].lineData[11] = 0;
  _$jscoverage['/contextmenu.js'].lineData[13] = 0;
  _$jscoverage['/contextmenu.js'].lineData[15] = 0;
  _$jscoverage['/contextmenu.js'].lineData[17] = 0;
  _$jscoverage['/contextmenu.js'].lineData[19] = 0;
  _$jscoverage['/contextmenu.js'].lineData[20] = 0;
  _$jscoverage['/contextmenu.js'].lineData[21] = 0;
  _$jscoverage['/contextmenu.js'].lineData[24] = 0;
  _$jscoverage['/contextmenu.js'].lineData[25] = 0;
  _$jscoverage['/contextmenu.js'].lineData[26] = 0;
  _$jscoverage['/contextmenu.js'].lineData[27] = 0;
  _$jscoverage['/contextmenu.js'].lineData[29] = 0;
  _$jscoverage['/contextmenu.js'].lineData[31] = 0;
  _$jscoverage['/contextmenu.js'].lineData[33] = 0;
  _$jscoverage['/contextmenu.js'].lineData[34] = 0;
  _$jscoverage['/contextmenu.js'].lineData[35] = 0;
  _$jscoverage['/contextmenu.js'].lineData[36] = 0;
  _$jscoverage['/contextmenu.js'].lineData[41] = 0;
  _$jscoverage['/contextmenu.js'].lineData[42] = 0;
  _$jscoverage['/contextmenu.js'].lineData[44] = 0;
  _$jscoverage['/contextmenu.js'].lineData[45] = 0;
  _$jscoverage['/contextmenu.js'].lineData[46] = 0;
  _$jscoverage['/contextmenu.js'].lineData[49] = 0;
  _$jscoverage['/contextmenu.js'].lineData[50] = 0;
  _$jscoverage['/contextmenu.js'].lineData[51] = 0;
  _$jscoverage['/contextmenu.js'].lineData[55] = 0;
  _$jscoverage['/contextmenu.js'].lineData[56] = 0;
  _$jscoverage['/contextmenu.js'].lineData[62] = 0;
  _$jscoverage['/contextmenu.js'].lineData[64] = 0;
  _$jscoverage['/contextmenu.js'].lineData[65] = 0;
  _$jscoverage['/contextmenu.js'].lineData[67] = 0;
  _$jscoverage['/contextmenu.js'].lineData[71] = 0;
  _$jscoverage['/contextmenu.js'].lineData[72] = 0;
  _$jscoverage['/contextmenu.js'].lineData[74] = 0;
  _$jscoverage['/contextmenu.js'].lineData[75] = 0;
  _$jscoverage['/contextmenu.js'].lineData[78] = 0;
  _$jscoverage['/contextmenu.js'].lineData[79] = 0;
  _$jscoverage['/contextmenu.js'].lineData[82] = 0;
  _$jscoverage['/contextmenu.js'].lineData[83] = 0;
  _$jscoverage['/contextmenu.js'].lineData[84] = 0;
  _$jscoverage['/contextmenu.js'].lineData[86] = 0;
  _$jscoverage['/contextmenu.js'].lineData[90] = 0;
  _$jscoverage['/contextmenu.js'].lineData[91] = 0;
  _$jscoverage['/contextmenu.js'].lineData[94] = 0;
  _$jscoverage['/contextmenu.js'].lineData[96] = 0;
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
  _$jscoverage['/contextmenu.js'].branchData['17'] = [];
  _$jscoverage['/contextmenu.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/contextmenu.js'].branchData['20'] = [];
  _$jscoverage['/contextmenu.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/contextmenu.js'].branchData['35'] = [];
  _$jscoverage['/contextmenu.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/contextmenu.js'].branchData['45'] = [];
  _$jscoverage['/contextmenu.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/contextmenu.js'].branchData['64'] = [];
  _$jscoverage['/contextmenu.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/contextmenu.js'].branchData['90'] = [];
  _$jscoverage['/contextmenu.js'].branchData['90'][1] = new BranchData();
}
_$jscoverage['/contextmenu.js'].branchData['90'][1].init(2176, 5, 'event');
function visit6_90_1(result) {
  _$jscoverage['/contextmenu.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/contextmenu.js'].branchData['64'][1].init(254, 2, '!x');
function visit5_64_1(result) {
  _$jscoverage['/contextmenu.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/contextmenu.js'].branchData['45'][1].init(22, 13, 'e.which === 1');
function visit4_45_1(result) {
  _$jscoverage['/contextmenu.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/contextmenu.js'].branchData['35'][1].init(22, 31, 'e.keyCode === Event.KeyCode.ESC');
function visit3_35_1(result) {
  _$jscoverage['/contextmenu.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/contextmenu.js'].branchData['20'][1].init(104, 5, 'event');
function visit2_20_1(result) {
  _$jscoverage['/contextmenu.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/contextmenu.js'].branchData['17'][1].init(46, 9, 'cfg || {}');
function visit1_17_1(result) {
  _$jscoverage['/contextmenu.js'].branchData['17'][1].ranCondition(result);
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
  var Event = require('event/dom');
  _$jscoverage['/contextmenu.js'].lineData[11]++;
  var $ = require('node').all;
  _$jscoverage['/contextmenu.js'].lineData[13]++;
  Editor.prototype.addContextMenu = function(id, filter, cfg) {
  _$jscoverage['/contextmenu.js'].functionData[1]++;
  _$jscoverage['/contextmenu.js'].lineData[15]++;
  var self = this;
  _$jscoverage['/contextmenu.js'].lineData[17]++;
  cfg = visit1_17_1(cfg || {});
  _$jscoverage['/contextmenu.js'].lineData[19]++;
  var event = cfg.event;
  _$jscoverage['/contextmenu.js'].lineData[20]++;
  if (visit2_20_1(event)) {
    _$jscoverage['/contextmenu.js'].lineData[21]++;
    delete cfg.event;
  }
  _$jscoverage['/contextmenu.js'].lineData[24]++;
  cfg.prefixCls = self.get('prefixCls') + 'editor-';
  _$jscoverage['/contextmenu.js'].lineData[25]++;
  cfg.editor = self;
  _$jscoverage['/contextmenu.js'].lineData[26]++;
  cfg.focusable = 1;
  _$jscoverage['/contextmenu.js'].lineData[27]++;
  cfg.zIndex = Editor.baseZIndex(Editor.ZIndexManager.POPUP_MENU);
  _$jscoverage['/contextmenu.js'].lineData[29]++;
  var menu = new Menu.PopupMenu(cfg);
  _$jscoverage['/contextmenu.js'].lineData[31]++;
  focusFix.init(menu);
  _$jscoverage['/contextmenu.js'].lineData[33]++;
  menu.on('afterRenderUI', function() {
  _$jscoverage['/contextmenu.js'].functionData[2]++;
  _$jscoverage['/contextmenu.js'].lineData[34]++;
  menu.get('el').on('keydown', function(e) {
  _$jscoverage['/contextmenu.js'].functionData[3]++;
  _$jscoverage['/contextmenu.js'].lineData[35]++;
  if (visit3_35_1(e.keyCode === Event.KeyCode.ESC)) {
    _$jscoverage['/contextmenu.js'].lineData[36]++;
    menu.hide();
  }
});
});
  _$jscoverage['/contextmenu.js'].lineData[41]++;
  self.docReady(function() {
  _$jscoverage['/contextmenu.js'].functionData[4]++;
  _$jscoverage['/contextmenu.js'].lineData[42]++;
  var doc = self.get('document');
  _$jscoverage['/contextmenu.js'].lineData[44]++;
  doc.on('mousedown', function(e) {
  _$jscoverage['/contextmenu.js'].functionData[5]++;
  _$jscoverage['/contextmenu.js'].lineData[45]++;
  if (visit4_45_1(e.which === 1)) {
    _$jscoverage['/contextmenu.js'].lineData[46]++;
    menu.hide();
  }
});
  _$jscoverage['/contextmenu.js'].lineData[49]++;
  doc.delegate('contextmenu', filter, function(ev) {
  _$jscoverage['/contextmenu.js'].functionData[6]++;
  _$jscoverage['/contextmenu.js'].lineData[50]++;
  ev.halt();
  _$jscoverage['/contextmenu.js'].lineData[51]++;
  showNow(ev);
});
});
  _$jscoverage['/contextmenu.js'].lineData[55]++;
  function showNow(ev) {
    _$jscoverage['/contextmenu.js'].functionData[7]++;
    _$jscoverage['/contextmenu.js'].lineData[56]++;
    var t = $(ev.target);
    _$jscoverage['/contextmenu.js'].lineData[62]++;
    var x = ev.pageX, y = ev.pageY;
    _$jscoverage['/contextmenu.js'].lineData[64]++;
    if (visit5_64_1(!x)) {
      _$jscoverage['/contextmenu.js'].lineData[65]++;
      return;
    } else {
      _$jscoverage['/contextmenu.js'].lineData[67]++;
      var translate = Editor.Utils.getXY({
  left: x, 
  top: y}, self);
      _$jscoverage['/contextmenu.js'].lineData[71]++;
      x = translate.left;
      _$jscoverage['/contextmenu.js'].lineData[72]++;
      y = translate.top;
    }
    _$jscoverage['/contextmenu.js'].lineData[74]++;
    setTimeout(function() {
  _$jscoverage['/contextmenu.js'].functionData[8]++;
  _$jscoverage['/contextmenu.js'].lineData[75]++;
  menu.set('editorSelectedEl', t, {
  silent: 1});
  _$jscoverage['/contextmenu.js'].lineData[78]++;
  menu.move(x, y);
  _$jscoverage['/contextmenu.js'].lineData[79]++;
  self.fire('contextmenu', {
  contextmenu: menu});
  _$jscoverage['/contextmenu.js'].lineData[82]++;
  menu.show();
  _$jscoverage['/contextmenu.js'].lineData[83]++;
  window.focus();
  _$jscoverage['/contextmenu.js'].lineData[84]++;
  document.body.focus();
  _$jscoverage['/contextmenu.js'].lineData[86]++;
  menu.focus();
}, 30);
  }
  _$jscoverage['/contextmenu.js'].lineData[90]++;
  if (visit6_90_1(event)) {
    _$jscoverage['/contextmenu.js'].lineData[91]++;
    showNow(event);
  }
  _$jscoverage['/contextmenu.js'].lineData[94]++;
  self.addControl(id + '/contextmenu', menu);
  _$jscoverage['/contextmenu.js'].lineData[96]++;
  return menu;
};
});
