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
if (! _$jscoverage['/dialog.js']) {
  _$jscoverage['/dialog.js'] = {};
  _$jscoverage['/dialog.js'].lineData = [];
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[7] = 0;
  _$jscoverage['/dialog.js'].lineData[72] = 0;
  _$jscoverage['/dialog.js'].lineData[73] = 0;
  _$jscoverage['/dialog.js'].lineData[74] = 0;
  _$jscoverage['/dialog.js'].lineData[75] = 0;
  _$jscoverage['/dialog.js'].lineData[76] = 0;
  _$jscoverage['/dialog.js'].lineData[77] = 0;
  _$jscoverage['/dialog.js'].lineData[80] = 0;
  _$jscoverage['/dialog.js'].lineData[84] = 0;
  _$jscoverage['/dialog.js'].lineData[87] = 0;
  _$jscoverage['/dialog.js'].lineData[88] = 0;
  _$jscoverage['/dialog.js'].lineData[89] = 0;
  _$jscoverage['/dialog.js'].lineData[90] = 0;
  _$jscoverage['/dialog.js'].lineData[91] = 0;
  _$jscoverage['/dialog.js'].lineData[92] = 0;
  _$jscoverage['/dialog.js'].lineData[95] = 0;
  _$jscoverage['/dialog.js'].lineData[101] = 0;
  _$jscoverage['/dialog.js'].lineData[102] = 0;
  _$jscoverage['/dialog.js'].lineData[109] = 0;
  _$jscoverage['/dialog.js'].lineData[110] = 0;
  _$jscoverage['/dialog.js'].lineData[115] = 0;
  _$jscoverage['/dialog.js'].lineData[116] = 0;
  _$jscoverage['/dialog.js'].lineData[121] = 0;
  _$jscoverage['/dialog.js'].lineData[126] = 0;
  _$jscoverage['/dialog.js'].lineData[130] = 0;
  _$jscoverage['/dialog.js'].lineData[131] = 0;
  _$jscoverage['/dialog.js'].lineData[132] = 0;
  _$jscoverage['/dialog.js'].lineData[133] = 0;
  _$jscoverage['/dialog.js'].lineData[135] = 0;
  _$jscoverage['/dialog.js'].lineData[136] = 0;
  _$jscoverage['/dialog.js'].lineData[138] = 0;
  _$jscoverage['/dialog.js'].lineData[139] = 0;
  _$jscoverage['/dialog.js'].lineData[141] = 0;
  _$jscoverage['/dialog.js'].lineData[142] = 0;
  _$jscoverage['/dialog.js'].lineData[143] = 0;
  _$jscoverage['/dialog.js'].lineData[145] = 0;
  _$jscoverage['/dialog.js'].lineData[146] = 0;
  _$jscoverage['/dialog.js'].lineData[147] = 0;
  _$jscoverage['/dialog.js'].lineData[148] = 0;
  _$jscoverage['/dialog.js'].lineData[149] = 0;
  _$jscoverage['/dialog.js'].lineData[153] = 0;
  _$jscoverage['/dialog.js'].lineData[154] = 0;
  _$jscoverage['/dialog.js'].lineData[155] = 0;
  _$jscoverage['/dialog.js'].lineData[161] = 0;
  _$jscoverage['/dialog.js'].lineData[166] = 0;
  _$jscoverage['/dialog.js'].lineData[167] = 0;
  _$jscoverage['/dialog.js'].lineData[168] = 0;
  _$jscoverage['/dialog.js'].lineData[169] = 0;
  _$jscoverage['/dialog.js'].lineData[178] = 0;
  _$jscoverage['/dialog.js'].lineData[179] = 0;
  _$jscoverage['/dialog.js'].lineData[181] = 0;
  _$jscoverage['/dialog.js'].lineData[182] = 0;
  _$jscoverage['/dialog.js'].lineData[183] = 0;
  _$jscoverage['/dialog.js'].lineData[184] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[194] = 0;
  _$jscoverage['/dialog.js'].lineData[195] = 0;
  _$jscoverage['/dialog.js'].lineData[211] = 0;
  _$jscoverage['/dialog.js'].lineData[212] = 0;
  _$jscoverage['/dialog.js'].lineData[217] = 0;
  _$jscoverage['/dialog.js'].lineData[218] = 0;
  _$jscoverage['/dialog.js'].lineData[220] = 0;
  _$jscoverage['/dialog.js'].lineData[221] = 0;
  _$jscoverage['/dialog.js'].lineData[222] = 0;
  _$jscoverage['/dialog.js'].lineData[224] = 0;
  _$jscoverage['/dialog.js'].lineData[225] = 0;
  _$jscoverage['/dialog.js'].lineData[227] = 0;
  _$jscoverage['/dialog.js'].lineData[229] = 0;
  _$jscoverage['/dialog.js'].lineData[231] = 0;
  _$jscoverage['/dialog.js'].lineData[235] = 0;
  _$jscoverage['/dialog.js'].lineData[239] = 0;
}
if (! _$jscoverage['/dialog.js'].functionData) {
  _$jscoverage['/dialog.js'].functionData = [];
  _$jscoverage['/dialog.js'].functionData[0] = 0;
  _$jscoverage['/dialog.js'].functionData[1] = 0;
  _$jscoverage['/dialog.js'].functionData[2] = 0;
  _$jscoverage['/dialog.js'].functionData[3] = 0;
  _$jscoverage['/dialog.js'].functionData[4] = 0;
  _$jscoverage['/dialog.js'].functionData[5] = 0;
  _$jscoverage['/dialog.js'].functionData[6] = 0;
  _$jscoverage['/dialog.js'].functionData[7] = 0;
  _$jscoverage['/dialog.js'].functionData[8] = 0;
  _$jscoverage['/dialog.js'].functionData[9] = 0;
  _$jscoverage['/dialog.js'].functionData[10] = 0;
  _$jscoverage['/dialog.js'].functionData[11] = 0;
  _$jscoverage['/dialog.js'].functionData[12] = 0;
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['75'] = [];
  _$jscoverage['/dialog.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['106'] = [];
  _$jscoverage['/dialog.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['130'] = [];
  _$jscoverage['/dialog.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['132'] = [];
  _$jscoverage['/dialog.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['135'] = [];
  _$jscoverage['/dialog.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['138'] = [];
  _$jscoverage['/dialog.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['143'] = [];
  _$jscoverage['/dialog.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['146'] = [];
  _$jscoverage['/dialog.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['147'] = [];
  _$jscoverage['/dialog.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['184'] = [];
  _$jscoverage['/dialog.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['201'] = [];
  _$jscoverage['/dialog.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['211'] = [];
  _$jscoverage['/dialog.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['215'] = [];
  _$jscoverage['/dialog.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['216'] = [];
  _$jscoverage['/dialog.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['217'] = [];
  _$jscoverage['/dialog.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['221'] = [];
  _$jscoverage['/dialog.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['227'] = [];
  _$jscoverage['/dialog.js'].branchData['227'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['227'][1].init(630, 18, 'self.selectedFlash');
function visit17_227_1(result) {
  _$jscoverage['/dialog.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['221'][1].init(410, 3, '!re');
function visit16_221_1(result) {
  _$jscoverage['/dialog.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['217'][1].init(258, 6, '!dinfo');
function visit15_217_1(result) {
  _$jscoverage['/dialog.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['216'][1].init(174, 20, 'dinfo && dinfo.attrs');
function visit14_216_1(result) {
  _$jscoverage['/dialog.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['215'][1].init(121, 26, 'dinfo && S.trim(dinfo.url)');
function visit13_215_1(result) {
  _$jscoverage['/dialog.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['211'][1].init(14, 15, 'ev && ev.halt()');
function visit12_211_1(result) {
  _$jscoverage['/dialog.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['201'][1].init(37, 33, 'parseInt(self.dMargin.val()) || 0');
function visit11_201_1(result) {
  _$jscoverage['/dialog.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['184'][1].init(45, 15, 'ev && ev.halt()');
function visit10_184_1(result) {
  _$jscoverage['/dialog.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['147'][1].init(149, 26, 'cfg[\'defaultHeight\'] || ""');
function visit9_147_1(result) {
  _$jscoverage['/dialog.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['146'][1].init(87, 25, 'cfg[\'defaultWidth\'] || ""');
function visit8_146_1(result) {
  _$jscoverage['/dialog.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['143'][1].init(544, 32, 'parseInt(r.style("margin")) || 0');
function visit7_143_1(result) {
  _$jscoverage['/dialog.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['138'][1].init(274, 15, 'f.css("height")');
function visit6_138_1(result) {
  _$jscoverage['/dialog.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['135'][1].init(152, 14, 'f.css("width")');
function visit5_135_1(result) {
  _$jscoverage['/dialog.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['132'][1].init(77, 2, '!r');
function visit4_132_1(result) {
  _$jscoverage['/dialog.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['130'][1].init(164, 1, 'f');
function visit3_130_1(result) {
  _$jscoverage['/dialog.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['106'][1].init(164, 30, 'self._config_dwidth || "500px"');
function visit2_106_1(result) {
  _$jscoverage['/dialog.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['75'][1].init(81, 12, 'config || {}');
function visit1_75_1(result) {
  _$jscoverage['/dialog.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add("editor/plugin/flash/dialog", function(S, Editor, flashUtils, Dialog4E, MenuButton) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[7]++;
  var CLS_FLASH = 'ke_flash', TYPE_FLASH = 'flash', TIP = "\u8bf7\u8f93\u5165\u5982 http://www.xxx.com/xxx.swf", bodyHTML = "<div style='padding:20px 20px 0 20px'>" + "<p>" + "<label>\u7f51\u5740\uff1a " + "<input " + " data-verify='^https?://[^\\s]+$' " + " data-warning='\u7f51\u5740\u683c\u5f0f\u4e3a\uff1ahttp://' " + "class='{prefixCls}editor-flash-url {prefixCls}editor-input' style='width:300px;" + "' />" + "</label>" + "</p>" + "<table style='margin:10px 0 5px  40px;width:300px;'>" + "<tr>" + "<td>" + "<label>\u5bbd\u5ea6\uff1a " + "<input " + " data-verify='^(?!0$)\\d+$' " + " data-warning='\u5bbd\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570' " + "class='{prefixCls}editor-flash-width {prefixCls}editor-input' style='width:60px;" + "' /> \u50cf\u7d20 </label>" + "</td>" + "<td>" + "<label>\u9ad8\u5ea6\uff1a " + "<input " + " data-verify='^(?!0$)\\d+$' " + " data-warning='\u9ad8\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570' " + "class='{prefixCls}editor-flash-height {prefixCls}editor-input' " + "style='width:60px;" + "' /> \u50cf\u7d20 " + "</label>" + "</td>" + "</tr>" + "<tr>" + "<td>" + "<label>" + "\u5bf9\u9f50\uff1a " + "</label>" + "<select class='{prefixCls}editor-flash-align' title='\u5bf9\u9f50'>" + "<option value='none'>\u65e0</option>" + "<option value='left'>\u5de6\u5bf9\u9f50</option>" + "<option value='right'>\u53f3\u5bf9\u9f50</option>" + "</select>" + "</td>" + "<td>" + "<label>\u95f4\u8ddd\uff1a " + "</label>" + "<input " + " data-verify='^\\d+$' " + " data-warning='\u95f4\u8ddd\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570' " + "class='{prefixCls}editor-flash-margin {prefixCls}editor-input' " + "style='width:60px;" + "' value='" + 5 + "'/> \u50cf\u7d20" + "</td></tr>" + "</table>" + "</div>", footHTML = "<div style='padding:10px 0 35px 20px;'>" + "<a " + "class='{prefixCls}editor-flash-ok {prefixCls}editor-button ks-inline-block' " + "style='margin-left:40px;margin-right:20px;'>\u786e\u5b9a</a> " + "<a class='{prefixCls}editor-flash-cancel {prefixCls}editor-button ks-inline-block'>\u53d6\u6d88</a></div>";
  _$jscoverage['/dialog.js'].lineData[72]++;
  function FlashDialog(editor, config) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[73]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[74]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[75]++;
    self.config = visit1_75_1(config || {});
    _$jscoverage['/dialog.js'].lineData[76]++;
    Editor.Utils.lazyRun(self, "_prepareShow", "_realShow");
    _$jscoverage['/dialog.js'].lineData[77]++;
    self._config();
  }
  _$jscoverage['/dialog.js'].lineData[80]++;
  S.augment(FlashDialog, {
  addRes: Editor.Utils.addRes, 
  destroyRes: Editor.Utils.destroyRes, 
  _config: function() {
  _$jscoverage['/dialog.js'].functionData[2]++;
  _$jscoverage['/dialog.js'].lineData[84]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[87]++;
  self._urlTip = TIP;
  _$jscoverage['/dialog.js'].lineData[88]++;
  self._type = TYPE_FLASH;
  _$jscoverage['/dialog.js'].lineData[89]++;
  self._cls = CLS_FLASH;
  _$jscoverage['/dialog.js'].lineData[90]++;
  self._config_dwidth = "400px";
  _$jscoverage['/dialog.js'].lineData[91]++;
  self._title = "Flash";
  _$jscoverage['/dialog.js'].lineData[92]++;
  self._bodyHTML = S.substitute(bodyHTML, {
  prefixCls: prefixCls});
  _$jscoverage['/dialog.js'].lineData[95]++;
  self._footHTML = S.substitute(footHTML, {
  prefixCls: prefixCls});
}, 
  _prepareShow: function() {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[101]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[102]++;
  self.dialog = new Dialog4E({
  headerContent: self._title, 
  bodyContent: self._bodyHTML, 
  footerContent: self._footHTML, 
  width: visit2_106_1(self._config_dwidth || "500px"), 
  mask: true}).render();
  _$jscoverage['/dialog.js'].lineData[109]++;
  self.addRes(self.dialog);
  _$jscoverage['/dialog.js'].lineData[110]++;
  self._initD();
}, 
  _realShow: function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[115]++;
  this._updateD();
  _$jscoverage['/dialog.js'].lineData[116]++;
  this.dialog.show();
}, 
  _getFlashUrl: function(r) {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[121]++;
  return flashUtils.getUrl(r);
}, 
  _updateD: function() {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[126]++;
  var self = this, editor = self.editor, cfg = self.config, f = self.selectedFlash;
  _$jscoverage['/dialog.js'].lineData[130]++;
  if (visit3_130_1(f)) {
    _$jscoverage['/dialog.js'].lineData[131]++;
    var r = editor.restoreRealElement(f);
    _$jscoverage['/dialog.js'].lineData[132]++;
    if (visit4_132_1(!r)) {
      _$jscoverage['/dialog.js'].lineData[133]++;
      return;
    }
    _$jscoverage['/dialog.js'].lineData[135]++;
    if (visit5_135_1(f.css("width"))) {
      _$jscoverage['/dialog.js'].lineData[136]++;
      self.dWidth.val(parseInt(f.css("width")));
    }
    _$jscoverage['/dialog.js'].lineData[138]++;
    if (visit6_138_1(f.css("height"))) {
      _$jscoverage['/dialog.js'].lineData[139]++;
      self.dHeight.val(parseInt(f.css("height")));
    }
    _$jscoverage['/dialog.js'].lineData[141]++;
    self.dAlign.set("value", f.css("float"));
    _$jscoverage['/dialog.js'].lineData[142]++;
    Editor.Utils.valInput(self.dUrl, self._getFlashUrl(r));
    _$jscoverage['/dialog.js'].lineData[143]++;
    self.dMargin.val(visit7_143_1(parseInt(r.style("margin")) || 0));
  } else {
    _$jscoverage['/dialog.js'].lineData[145]++;
    Editor.Utils.resetInput(self.dUrl);
    _$jscoverage['/dialog.js'].lineData[146]++;
    self.dWidth.val(visit8_146_1(cfg['defaultWidth'] || ""));
    _$jscoverage['/dialog.js'].lineData[147]++;
    self.dHeight.val(visit9_147_1(cfg['defaultHeight'] || ""));
    _$jscoverage['/dialog.js'].lineData[148]++;
    self.dAlign.set("value", "none");
    _$jscoverage['/dialog.js'].lineData[149]++;
    self.dMargin.val("5");
  }
}, 
  show: function(_selectedEl) {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[153]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[154]++;
  self.selectedFlash = _selectedEl;
  _$jscoverage['/dialog.js'].lineData[155]++;
  self._prepareShow();
}, 
  _initD: function() {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[161]++;
  var self = this, d = self.dialog, editor = self.editor, prefixCls = editor.get('prefixCls'), el = d.get("el");
  _$jscoverage['/dialog.js'].lineData[166]++;
  self.dHeight = el.one("." + prefixCls + "editor-flash-height");
  _$jscoverage['/dialog.js'].lineData[167]++;
  self.dWidth = el.one("." + prefixCls + "editor-flash-width");
  _$jscoverage['/dialog.js'].lineData[168]++;
  self.dUrl = el.one("." + prefixCls + "editor-flash-url");
  _$jscoverage['/dialog.js'].lineData[169]++;
  self.dAlign = MenuButton.Select.decorate(el.one("." + prefixCls + "editor-flash-align"), {
  prefixCls: prefixCls + 'editor-big-', 
  width: 80, 
  menuCfg: {
  prefixCls: prefixCls + 'editor-', 
  render: el}});
  _$jscoverage['/dialog.js'].lineData[178]++;
  self.dMargin = el.one("." + prefixCls + "editor-flash-margin");
  _$jscoverage['/dialog.js'].lineData[179]++;
  var action = el.one("." + prefixCls + "editor-flash-ok"), cancel = el.one("." + prefixCls + "editor-flash-cancel");
  _$jscoverage['/dialog.js'].lineData[181]++;
  action.on("click", self._gen, self);
  _$jscoverage['/dialog.js'].lineData[182]++;
  cancel.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[183]++;
  d.hide();
  _$jscoverage['/dialog.js'].lineData[184]++;
  visit10_184_1(ev && ev.halt());
});
  _$jscoverage['/dialog.js'].lineData[187]++;
  Editor.Utils.placeholder(self.dUrl, self._urlTip);
  _$jscoverage['/dialog.js'].lineData[188]++;
  self.addRes(self.dAlign);
}, 
  _getDInfo: function() {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[194]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[195]++;
  return {
  url: self.dUrl.val(), 
  attrs: {
  width: self.dWidth.val(), 
  height: self.dHeight.val(), 
  style: "margin:" + (visit11_201_1(parseInt(self.dMargin.val()) || 0)) + "px;" + "float:" + self.dAlign.get("value") + ";"}};
}, 
  _gen: function(ev) {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[211]++;
  visit12_211_1(ev && ev.halt());
  _$jscoverage['/dialog.js'].lineData[212]++;
  var self = this, editor = self.editor, dinfo = self._getDInfo(), url = visit13_215_1(dinfo && S.trim(dinfo.url)), attrs = visit14_216_1(dinfo && dinfo.attrs);
  _$jscoverage['/dialog.js'].lineData[217]++;
  if (visit15_217_1(!dinfo)) {
    _$jscoverage['/dialog.js'].lineData[218]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[220]++;
  var re = Editor.Utils.verifyInputs(self.dialog.get("el").all("input"));
  _$jscoverage['/dialog.js'].lineData[221]++;
  if (visit16_221_1(!re)) {
    _$jscoverage['/dialog.js'].lineData[222]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[224]++;
  self.dialog.hide();
  _$jscoverage['/dialog.js'].lineData[225]++;
  var substitute = flashUtils.insertFlash(editor, url, attrs, self._cls, self._type);
  _$jscoverage['/dialog.js'].lineData[227]++;
  if (visit17_227_1(self.selectedFlash)) {
    _$jscoverage['/dialog.js'].lineData[229]++;
    editor.getSelection().selectElement(substitute);
  }
  _$jscoverage['/dialog.js'].lineData[231]++;
  editor.notifySelectionChange();
}, 
  destroy: function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[235]++;
  this.destroyRes();
}});
  _$jscoverage['/dialog.js'].lineData[239]++;
  return FlashDialog;
}, {
  requires: ['editor', '../flash-common/utils', '../dialog', '../menubutton']});
