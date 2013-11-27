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
  _$jscoverage['/dialog.js'].lineData[8] = 0;
  _$jscoverage['/dialog.js'].lineData[9] = 0;
  _$jscoverage['/dialog.js'].lineData[11] = 0;
  _$jscoverage['/dialog.js'].lineData[76] = 0;
  _$jscoverage['/dialog.js'].lineData[77] = 0;
  _$jscoverage['/dialog.js'].lineData[80] = 0;
  _$jscoverage['/dialog.js'].lineData[82] = 0;
  _$jscoverage['/dialog.js'].lineData[86] = 0;
  _$jscoverage['/dialog.js'].lineData[87] = 0;
  _$jscoverage['/dialog.js'].lineData[88] = 0;
  _$jscoverage['/dialog.js'].lineData[89] = 0;
  _$jscoverage['/dialog.js'].lineData[92] = 0;
  _$jscoverage['/dialog.js'].lineData[95] = 0;
  _$jscoverage['/dialog.js'].lineData[96] = 0;
  _$jscoverage['/dialog.js'].lineData[99] = 0;
  _$jscoverage['/dialog.js'].lineData[104] = 0;
  _$jscoverage['/dialog.js'].lineData[105] = 0;
  _$jscoverage['/dialog.js'].lineData[113] = 0;
  _$jscoverage['/dialog.js'].lineData[114] = 0;
  _$jscoverage['/dialog.js'].lineData[115] = 0;
  _$jscoverage['/dialog.js'].lineData[116] = 0;
  _$jscoverage['/dialog.js'].lineData[118] = 0;
  _$jscoverage['/dialog.js'].lineData[119] = 0;
  _$jscoverage['/dialog.js'].lineData[120] = 0;
  _$jscoverage['/dialog.js'].lineData[121] = 0;
  _$jscoverage['/dialog.js'].lineData[123] = 0;
  _$jscoverage['/dialog.js'].lineData[124] = 0;
  _$jscoverage['/dialog.js'].lineData[125] = 0;
  _$jscoverage['/dialog.js'].lineData[126] = 0;
  _$jscoverage['/dialog.js'].lineData[130] = 0;
  _$jscoverage['/dialog.js'].lineData[132] = 0;
  _$jscoverage['/dialog.js'].lineData[134] = 0;
  _$jscoverage['/dialog.js'].lineData[135] = 0;
  _$jscoverage['/dialog.js'].lineData[137] = 0;
  _$jscoverage['/dialog.js'].lineData[138] = 0;
  _$jscoverage['/dialog.js'].lineData[139] = 0;
  _$jscoverage['/dialog.js'].lineData[140] = 0;
  _$jscoverage['/dialog.js'].lineData[142] = 0;
  _$jscoverage['/dialog.js'].lineData[152] = 0;
  _$jscoverage['/dialog.js'].lineData[156] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[160] = 0;
  _$jscoverage['/dialog.js'].lineData[161] = 0;
  _$jscoverage['/dialog.js'].lineData[162] = 0;
  _$jscoverage['/dialog.js'].lineData[163] = 0;
  _$jscoverage['/dialog.js'].lineData[165] = 0;
  _$jscoverage['/dialog.js'].lineData[167] = 0;
  _$jscoverage['/dialog.js'].lineData[169] = 0;
  _$jscoverage['/dialog.js'].lineData[174] = 0;
  _$jscoverage['/dialog.js'].lineData[178] = 0;
  _$jscoverage['/dialog.js'].lineData[182] = 0;
  _$jscoverage['/dialog.js'].lineData[183] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[189] = 0;
  _$jscoverage['/dialog.js'].lineData[190] = 0;
  _$jscoverage['/dialog.js'].lineData[194] = 0;
  _$jscoverage['/dialog.js'].lineData[197] = 0;
  _$jscoverage['/dialog.js'].lineData[198] = 0;
  _$jscoverage['/dialog.js'].lineData[199] = 0;
  _$jscoverage['/dialog.js'].lineData[200] = 0;
  _$jscoverage['/dialog.js'].lineData[201] = 0;
  _$jscoverage['/dialog.js'].lineData[202] = 0;
  _$jscoverage['/dialog.js'].lineData[203] = 0;
  _$jscoverage['/dialog.js'].lineData[205] = 0;
  _$jscoverage['/dialog.js'].lineData[206] = 0;
  _$jscoverage['/dialog.js'].lineData[207] = 0;
  _$jscoverage['/dialog.js'].lineData[208] = 0;
  _$jscoverage['/dialog.js'].lineData[209] = 0;
  _$jscoverage['/dialog.js'].lineData[214] = 0;
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
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['96'] = [];
  _$jscoverage['/dialog.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['134'] = [];
  _$jscoverage['/dialog.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['138'] = [];
  _$jscoverage['/dialog.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['145'] = [];
  _$jscoverage['/dialog.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['146'] = [];
  _$jscoverage['/dialog.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['147'] = [];
  _$jscoverage['/dialog.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['159'] = [];
  _$jscoverage['/dialog.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['160'] = [];
  _$jscoverage['/dialog.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['162'] = [];
  _$jscoverage['/dialog.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['167'] = [];
  _$jscoverage['/dialog.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['183'] = [];
  _$jscoverage['/dialog.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['197'] = [];
  _$jscoverage['/dialog.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['201'] = [];
  _$jscoverage['/dialog.js'].branchData['201'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['201'][1].init(218, 32, 'parseInt(r.style("margin")) || 0');
function visit13_201_1(result) {
  _$jscoverage['/dialog.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['197'][1].init(124, 1, 'f');
function visit12_197_1(result) {
  _$jscoverage['/dialog.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['183'][1].init(914, 15, 'ev && ev.halt()');
function visit11_183_1(result) {
  _$jscoverage['/dialog.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['167'][1].init(118, 23, 'c[\'paramName\'] || "url"');
function visit10_167_1(result) {
  _$jscoverage['/dialog.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['162'][1].init(64, 18, 'c[\'reg\'].test(url)');
function visit9_162_1(result) {
  _$jscoverage['/dialog.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['160'][1].init(33, 17, 'i < urlCfg.length');
function visit8_160_1(result) {
  _$jscoverage['/dialog.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['159'][1].init(123, 6, 'urlCfg');
function visit7_159_1(result) {
  _$jscoverage['/dialog.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['147'][1].init(190, 33, 'parseInt(self.dMargin.val()) || 0');
function visit6_147_1(result) {
  _$jscoverage['/dialog.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['146'][1].init(106, 38, 'parseInt(self.dWidth.val()) || p.width');
function visit5_146_1(result) {
  _$jscoverage['/dialog.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['145'][1].init(33, 40, 'parseInt(self.dHeight.val()) || p.height');
function visit4_145_1(result) {
  _$jscoverage['/dialog.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['138'][1].init(64, 3, '!re');
function visit3_138_1(result) {
  _$jscoverage['/dialog.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['134'][1].init(172, 2, '!p');
function visit2_134_1(result) {
  _$jscoverage['/dialog.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['96'][1].init(545, 28, 'cfg.urlTip || "\\u8bf7\\u8f93\\u5165\\u89c6\\u9891\\u64ad\\u653e\\u94fe\\u63a5..."');
function visit1_96_1(result) {
  _$jscoverage['/dialog.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/dialog.js'].lineData[8]++;
  var FlashDialog = require('../flash/dialog');
  _$jscoverage['/dialog.js'].lineData[9]++;
  var MenuButton = require('../menubutton');
  _$jscoverage['/dialog.js'].lineData[11]++;
  var CLS_VIDEO = "ke_video", TYPE_VIDEO = "video", DTIP = "\u81ea\u52a8", MARGIN_DEFAULT = 0, bodyHTML = "<div style='padding:20px 20px 0 20px'>" + "<p>" + "<label>" + "\u94fe\u63a5\uff1a " + "" + "<input " + "class='{prefixCls}editor-video-url {prefixCls}editor-input' style='width:410px;" + "'/>" + "</label>" + "</p>" + "<table " + "style='margin:10px 0 5px  40px;width:400px;'>" + "<tr><td>" + "<label>\u5bbd\u5ea6\uff1a " + " " + "<input " + " data-verify='^(" + DTIP + "|((?!0$)\\d+))?$' " + " data-warning='\u5bbd\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570' " + "class='{prefixCls}editor-video-width {prefixCls}editor-input' " + "style='width:60px;" + "' " + "/> \u50cf\u7d20" + "</label>" + "</td>" + "<td>" + "<label> \u9ad8\u5ea6\uff1a " + "" + " <input " + " data-verify='^(" + DTIP + "|((?!0$)\\d+))?$' " + " data-warning='\u9ad8\u5ea6\u8bf7\u8f93\u5165\u6b63\u6574\u6570' " + "class='{prefixCls}editor-video-height {prefixCls}editor-input' style='width:60px;" + "'/> \u50cf\u7d20" + "</label>" + "</td></tr>" + "<tr>" + "<td>" + "<label>\u5bf9\u9f50\uff1a " + "<select class='{prefixCls}editor-video-align' title='\u5bf9\u9f50'>" + "<option value='none'>\u65e0</option>" + "<option value='left'>\u5de6\u5bf9\u9f50</option>" + "<option value='right'>\u53f3\u5bf9\u9f50</option>" + "</select>" + "</td>" + "<td>" + "<label>\u95f4\u8ddd\uff1a " + "<input " + "" + " data-verify='^\\d+$' " + " data-warning='\u95f4\u8ddd\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570' " + "class='{prefixCls}editor-video-margin {prefixCls}editor-input' style='width:60px;" + "' value='" + MARGIN_DEFAULT + "'/> \u50cf\u7d20" + "</label>" + "</td></tr>" + "</table>" + "</div>", footHTML = "<div style='padding:10px 0 35px 20px;'><a " + "class='{prefixCls}editor-video-ok {prefixCls}editor-button ks-inline-block' " + "style='margin-left:40px;margin-right:20px;'>\u786e\u5b9a</button> " + "<a class='{prefixCls}editor-video-cancel {prefixCls}editor-button ks-inline-block'>\u53d6\u6d88</a></div>";
  _$jscoverage['/dialog.js'].lineData[76]++;
  function VideoDialog() {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[77]++;
    VideoDialog.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/dialog.js'].lineData[80]++;
  S.extend(VideoDialog, FlashDialog, {
  _config: function() {
  _$jscoverage['/dialog.js'].functionData[2]++;
  _$jscoverage['/dialog.js'].lineData[82]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), cfg = self.config;
  _$jscoverage['/dialog.js'].lineData[86]++;
  self._cls = CLS_VIDEO;
  _$jscoverage['/dialog.js'].lineData[87]++;
  self._type = TYPE_VIDEO;
  _$jscoverage['/dialog.js'].lineData[88]++;
  self._title = "\u89c6\u9891";
  _$jscoverage['/dialog.js'].lineData[89]++;
  self._bodyHTML = S.substitute(bodyHTML, {
  prefixCls: prefixCls});
  _$jscoverage['/dialog.js'].lineData[92]++;
  self._footHTML = S.substitute(footHTML, {
  prefixCls: prefixCls});
  _$jscoverage['/dialog.js'].lineData[95]++;
  self.urlCfg = cfg.urlCfg;
  _$jscoverage['/dialog.js'].lineData[96]++;
  self._urlTip = visit1_96_1(cfg.urlTip || "\u8bf7\u8f93\u5165\u89c6\u9891\u64ad\u653e\u94fe\u63a5...");
}, 
  _initD: function() {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[99]++;
  var self = this, d = self.dialog, editor = self.editor, prefixCls = editor.get('prefixCls'), el = d.get("el");
  _$jscoverage['/dialog.js'].lineData[104]++;
  self.dUrl = el.one("." + prefixCls + "editor-video-url");
  _$jscoverage['/dialog.js'].lineData[105]++;
  self.dAlign = MenuButton.Select.decorate(el.one("." + prefixCls + "editor-video-align"), {
  prefixCls: prefixCls + 'editor-big-', 
  width: 80, 
  menuCfg: {
  prefixCls: prefixCls + 'editor-', 
  render: el}});
  _$jscoverage['/dialog.js'].lineData[113]++;
  self.dMargin = el.one("." + prefixCls + "editor-video-margin");
  _$jscoverage['/dialog.js'].lineData[114]++;
  self.dWidth = el.one("." + prefixCls + "editor-video-width");
  _$jscoverage['/dialog.js'].lineData[115]++;
  self.dHeight = el.one("." + prefixCls + "editor-video-height");
  _$jscoverage['/dialog.js'].lineData[116]++;
  var action = el.one("." + prefixCls + "editor-video-ok"), cancel = el.one("." + prefixCls + "editor-video-cancel");
  _$jscoverage['/dialog.js'].lineData[118]++;
  action.on("click", self._gen, self);
  _$jscoverage['/dialog.js'].lineData[119]++;
  cancel.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[120]++;
  d.hide();
  _$jscoverage['/dialog.js'].lineData[121]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[123]++;
  Editor.Utils.placeholder(self.dUrl, self._urlTip);
  _$jscoverage['/dialog.js'].lineData[124]++;
  Editor.Utils.placeholder(self.dWidth, DTIP);
  _$jscoverage['/dialog.js'].lineData[125]++;
  Editor.Utils.placeholder(self.dHeight, DTIP);
  _$jscoverage['/dialog.js'].lineData[126]++;
  self.addRes(self.dAlign);
}, 
  _getDInfo: function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[130]++;
  var self = this, url = self.dUrl.val();
  _$jscoverage['/dialog.js'].lineData[132]++;
  var videoCfg = self.config, p = videoCfg.getProvider(url);
  _$jscoverage['/dialog.js'].lineData[134]++;
  if (visit2_134_1(!p)) {
    _$jscoverage['/dialog.js'].lineData[135]++;
    alert("\u4e0d\u652f\u6301\u8be5\u94fe\u63a5\u6765\u6e90!");
  } else {
    _$jscoverage['/dialog.js'].lineData[137]++;
    var re = p['detect'](url);
    _$jscoverage['/dialog.js'].lineData[138]++;
    if (visit3_138_1(!re)) {
      _$jscoverage['/dialog.js'].lineData[139]++;
      alert("\u4e0d\u652f\u6301\u8be5\u94fe\u63a5\uff0c\u8bf7\u76f4\u63a5\u8f93\u5165\u8be5\u89c6\u9891\u63d0\u4f9b\u7684\u5206\u4eab\u94fe\u63a5");
      _$jscoverage['/dialog.js'].lineData[140]++;
      return undefined;
    }
    _$jscoverage['/dialog.js'].lineData[142]++;
    return {
  url: re, 
  attrs: {
  height: visit4_145_1(parseInt(self.dHeight.val()) || p.height), 
  width: visit5_146_1(parseInt(self.dWidth.val()) || p.width), 
  style: "margin:" + (visit6_147_1(parseInt(self.dMargin.val()) || 0)) + "px;" + "float:" + self.dAlign.get("value") + ";"}};
  }
  _$jscoverage['/dialog.js'].lineData[152]++;
  return undefined;
}, 
  _gen: function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[156]++;
  var self = this, url = self.dUrl.val(), urlCfg = self.urlCfg;
  _$jscoverage['/dialog.js'].lineData[159]++;
  if (visit7_159_1(urlCfg)) {
    _$jscoverage['/dialog.js'].lineData[160]++;
    for (var i = 0; visit8_160_1(i < urlCfg.length); i++) {
      _$jscoverage['/dialog.js'].lineData[161]++;
      var c = urlCfg[i];
      _$jscoverage['/dialog.js'].lineData[162]++;
      if (visit9_162_1(c['reg'].test(url))) {
        _$jscoverage['/dialog.js'].lineData[163]++;
        self.dialog.loading();
        _$jscoverage['/dialog.js'].lineData[165]++;
        var data = {};
        _$jscoverage['/dialog.js'].lineData[167]++;
        data[visit10_167_1(c['paramName'] || "url")] = url;
        _$jscoverage['/dialog.js'].lineData[169]++;
        S.io({
  url: c.url, 
  data: data, 
  dataType: 'jsonp', 
  success: function(data) {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[174]++;
  self._dynamicUrlPrepare(data[1]);
}});
        _$jscoverage['/dialog.js'].lineData[178]++;
        return;
      }
    }
  }
  _$jscoverage['/dialog.js'].lineData[182]++;
  VideoDialog.superclass._gen.call(self);
  _$jscoverage['/dialog.js'].lineData[183]++;
  visit11_183_1(ev && ev.halt());
}, 
  _dynamicUrlPrepare: function(re) {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[187]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[188]++;
  self.dUrl.val(re);
  _$jscoverage['/dialog.js'].lineData[189]++;
  self.dialog.unloading();
  _$jscoverage['/dialog.js'].lineData[190]++;
  VideoDialog.superclass._gen.call(self);
}, 
  _updateD: function() {
  _$jscoverage['/dialog.js'].functionData[9]++;
  _$jscoverage['/dialog.js'].lineData[194]++;
  var self = this, editor = self.editor, f = self.selectedFlash;
  _$jscoverage['/dialog.js'].lineData[197]++;
  if (visit12_197_1(f)) {
    _$jscoverage['/dialog.js'].lineData[198]++;
    var r = editor.restoreRealElement(f);
    _$jscoverage['/dialog.js'].lineData[199]++;
    Editor.Utils.valInput(self.dUrl, self._getFlashUrl(r));
    _$jscoverage['/dialog.js'].lineData[200]++;
    self.dAlign.set("value", f.css("float"));
    _$jscoverage['/dialog.js'].lineData[201]++;
    self.dMargin.val(visit13_201_1(parseInt(r.style("margin")) || 0));
    _$jscoverage['/dialog.js'].lineData[202]++;
    Editor.Utils.valInput(self.dWidth, parseInt(f.css('width')));
    _$jscoverage['/dialog.js'].lineData[203]++;
    Editor.Utils.valInput(self.dHeight, parseInt(f.css("height")));
  } else {
    _$jscoverage['/dialog.js'].lineData[205]++;
    Editor.Utils.resetInput(self.dUrl);
    _$jscoverage['/dialog.js'].lineData[206]++;
    self.dAlign.set("value", "none");
    _$jscoverage['/dialog.js'].lineData[207]++;
    self.dMargin.val(MARGIN_DEFAULT);
    _$jscoverage['/dialog.js'].lineData[208]++;
    Editor.Utils.resetInput(self.dWidth);
    _$jscoverage['/dialog.js'].lineData[209]++;
    Editor.Utils.resetInput(self.dHeight);
  }
}});
  _$jscoverage['/dialog.js'].lineData[214]++;
  return VideoDialog;
});
