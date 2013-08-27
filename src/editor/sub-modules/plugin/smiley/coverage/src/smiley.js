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
if (! _$jscoverage['/smiley.js']) {
  _$jscoverage['/smiley.js'] = {};
  _$jscoverage['/smiley.js'].lineData = [];
  _$jscoverage['/smiley.js'].lineData[5] = 0;
  _$jscoverage['/smiley.js'].lineData[6] = 0;
  _$jscoverage['/smiley.js'].lineData[7] = 0;
  _$jscoverage['/smiley.js'].lineData[8] = 0;
  _$jscoverage['/smiley.js'].lineData[12] = 0;
  _$jscoverage['/smiley.js'].lineData[14] = 0;
  _$jscoverage['/smiley.js'].lineData[17] = 0;
  _$jscoverage['/smiley.js'].lineData[20] = 0;
  _$jscoverage['/smiley.js'].lineData[22] = 0;
  _$jscoverage['/smiley.js'].lineData[27] = 0;
  _$jscoverage['/smiley.js'].lineData[28] = 0;
  _$jscoverage['/smiley.js'].lineData[30] = 0;
  _$jscoverage['/smiley.js'].lineData[31] = 0;
  _$jscoverage['/smiley.js'].lineData[37] = 0;
  _$jscoverage['/smiley.js'].lineData[38] = 0;
  _$jscoverage['/smiley.js'].lineData[39] = 0;
  _$jscoverage['/smiley.js'].lineData[40] = 0;
  _$jscoverage['/smiley.js'].lineData[50] = 0;
  _$jscoverage['/smiley.js'].lineData[51] = 0;
  _$jscoverage['/smiley.js'].lineData[53] = 0;
  _$jscoverage['/smiley.js'].lineData[55] = 0;
  _$jscoverage['/smiley.js'].lineData[59] = 0;
  _$jscoverage['/smiley.js'].lineData[62] = 0;
  _$jscoverage['/smiley.js'].lineData[63] = 0;
  _$jscoverage['/smiley.js'].lineData[66] = 0;
  _$jscoverage['/smiley.js'].lineData[74] = 0;
  _$jscoverage['/smiley.js'].lineData[76] = 0;
  _$jscoverage['/smiley.js'].lineData[80] = 0;
  _$jscoverage['/smiley.js'].lineData[81] = 0;
  _$jscoverage['/smiley.js'].lineData[91] = 0;
}
if (! _$jscoverage['/smiley.js'].functionData) {
  _$jscoverage['/smiley.js'].functionData = [];
  _$jscoverage['/smiley.js'].functionData[0] = 0;
  _$jscoverage['/smiley.js'].functionData[1] = 0;
  _$jscoverage['/smiley.js'].functionData[2] = 0;
  _$jscoverage['/smiley.js'].functionData[3] = 0;
  _$jscoverage['/smiley.js'].functionData[4] = 0;
  _$jscoverage['/smiley.js'].functionData[5] = 0;
  _$jscoverage['/smiley.js'].functionData[6] = 0;
  _$jscoverage['/smiley.js'].functionData[7] = 0;
  _$jscoverage['/smiley.js'].functionData[8] = 0;
  _$jscoverage['/smiley.js'].functionData[9] = 0;
}
if (! _$jscoverage['/smiley.js'].branchData) {
  _$jscoverage['/smiley.js'].branchData = {};
  _$jscoverage['/smiley.js'].branchData['7'] = [];
  _$jscoverage['/smiley.js'].branchData['7'][1] = new BranchData();
  _$jscoverage['/smiley.js'].branchData['31'] = [];
  _$jscoverage['/smiley.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/smiley.js'].branchData['38'] = [];
  _$jscoverage['/smiley.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/smiley.js'].branchData['39'] = [];
  _$jscoverage['/smiley.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/smiley.js'].branchData['53'] = [];
  _$jscoverage['/smiley.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/smiley.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/smiley.js'].branchData['76'] = [];
  _$jscoverage['/smiley.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/smiley.js'].branchData['80'] = [];
  _$jscoverage['/smiley.js'].branchData['80'][1] = new BranchData();
}
_$jscoverage['/smiley.js'].branchData['80'][1].init(30, 11, 'this.smiley');
function visit8_80_1(result) {
  _$jscoverage['/smiley.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/smiley.js'].branchData['76'][1].init(30, 33, 'self.smiley && self.smiley.hide()');
function visit7_76_1(result) {
  _$jscoverage['/smiley.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/smiley.js'].branchData['53'][2].init(157, 19, 't.nodeName() == "a"');
function visit6_53_2(result) {
  _$jscoverage['/smiley.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/smiley.js'].branchData['53'][1].init(157, 92, 't.nodeName() == "a" && (icon = t.attr("data-icon"))');
function visit5_53_1(result) {
  _$jscoverage['/smiley.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/smiley.js'].branchData['39'][1].init(34, 23, '!(smiley = self.smiley)');
function visit4_39_1(result) {
  _$jscoverage['/smiley.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/smiley.js'].branchData['38'][1].init(111, 7, 'checked');
function visit3_38_1(result) {
  _$jscoverage['/smiley.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/smiley.js'].branchData['31'][1].init(34, 33, 'self.smiley && self.smiley.hide()');
function visit2_31_1(result) {
  _$jscoverage['/smiley.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/smiley.js'].branchData['7'][1].init(96, 7, 'i <= 98');
function visit1_7_1(result) {
  _$jscoverage['/smiley.js'].branchData['7'][1].ranCondition(result);
  return result;
}_$jscoverage['/smiley.js'].lineData[5]++;
KISSY.add("editor/plugin/smiley", function(S, Editor, Overlay4E) {
  _$jscoverage['/smiley.js'].functionData[0]++;
  _$jscoverage['/smiley.js'].lineData[6]++;
  var smiley_markup = "<div class='{prefixCls}editor-smiley-sprite'>";
  _$jscoverage['/smiley.js'].lineData[7]++;
  for (var i = 0; visit1_7_1(i <= 98); i++) {
    _$jscoverage['/smiley.js'].lineData[8]++;
    smiley_markup += "<a href='javascript:void(0)' " + "data-icon='http://a.tbcdn.cn/sys/wangwang/smiley/48x48/" + i + ".gif'>" + "</a>";
  }
  _$jscoverage['/smiley.js'].lineData[12]++;
  smiley_markup += "</div>";
  _$jscoverage['/smiley.js'].lineData[14]++;
  function Smiley() {
    _$jscoverage['/smiley.js'].functionData[1]++;
  }
  _$jscoverage['/smiley.js'].lineData[17]++;
  S.augment(Smiley, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/smiley.js'].functionData[2]++;
  _$jscoverage['/smiley.js'].lineData[20]++;
  var prefixCls = editor.get('prefixCls');
  _$jscoverage['/smiley.js'].lineData[22]++;
  editor.addButton("smiley", {
  tooltip: "\u63d2\u5165\u8868\u60c5", 
  checkable: true, 
  listeners: {
  afterSyncUI: function() {
  _$jscoverage['/smiley.js'].functionData[3]++;
  _$jscoverage['/smiley.js'].lineData[27]++;
  var self = this;
  _$jscoverage['/smiley.js'].lineData[28]++;
  self.on("blur", function() {
  _$jscoverage['/smiley.js'].functionData[4]++;
  _$jscoverage['/smiley.js'].lineData[30]++;
  setTimeout(function() {
  _$jscoverage['/smiley.js'].functionData[5]++;
  _$jscoverage['/smiley.js'].lineData[31]++;
  visit2_31_1(self.smiley && self.smiley.hide());
}, 150);
});
}, 
  click: function() {
  _$jscoverage['/smiley.js'].functionData[6]++;
  _$jscoverage['/smiley.js'].lineData[37]++;
  var self = this, smiley, checked = self.get("checked");
  _$jscoverage['/smiley.js'].lineData[38]++;
  if (visit3_38_1(checked)) {
    _$jscoverage['/smiley.js'].lineData[39]++;
    if (visit4_39_1(!(smiley = self.smiley))) {
      _$jscoverage['/smiley.js'].lineData[40]++;
      smiley = self.smiley = new Overlay4E({
  content: S.substitute(smiley_markup, {
  prefixCls: prefixCls}), 
  focus4e: false, 
  width: 300, 
  elCls: prefixCls + "editor-popup", 
  zIndex: Editor.baseZIndex(Editor.zIndexManager.POPUP_MENU), 
  mask: false}).render();
      _$jscoverage['/smiley.js'].lineData[50]++;
      smiley.get("el").on("click", function(ev) {
  _$jscoverage['/smiley.js'].functionData[7]++;
  _$jscoverage['/smiley.js'].lineData[51]++;
  var t = new S.Node(ev.target), icon;
  _$jscoverage['/smiley.js'].lineData[53]++;
  if (visit5_53_1(visit6_53_2(t.nodeName() == "a") && (icon = t.attr("data-icon")))) {
    _$jscoverage['/smiley.js'].lineData[55]++;
    var img = new S.Node("<img " + "alt='' src='" + icon + "'/>", null, editor.get("document")[0]);
    _$jscoverage['/smiley.js'].lineData[59]++;
    editor.insertElement(img);
  }
});
      _$jscoverage['/smiley.js'].lineData[62]++;
      smiley.on("hide", function() {
  _$jscoverage['/smiley.js'].functionData[8]++;
  _$jscoverage['/smiley.js'].lineData[63]++;
  self.set("checked", false);
});
    }
    _$jscoverage['/smiley.js'].lineData[66]++;
    smiley.set("align", {
  node: this.get("el"), 
  points: ["bl", "tl"], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}});
    _$jscoverage['/smiley.js'].lineData[74]++;
    smiley.show();
  } else {
    _$jscoverage['/smiley.js'].lineData[76]++;
    visit7_76_1(self.smiley && self.smiley.hide());
  }
}, 
  destroy: function() {
  _$jscoverage['/smiley.js'].functionData[9]++;
  _$jscoverage['/smiley.js'].lineData[80]++;
  if (visit8_80_1(this.smiley)) {
    _$jscoverage['/smiley.js'].lineData[81]++;
    this.smiley.destroy();
  }
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
}});
  _$jscoverage['/smiley.js'].lineData[91]++;
  return Smiley;
}, {
  requires: ['editor', './overlay']});
