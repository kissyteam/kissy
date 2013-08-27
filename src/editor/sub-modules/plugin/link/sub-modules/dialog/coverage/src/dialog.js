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
  _$jscoverage['/dialog.js'].lineData[5] = 0;
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[46] = 0;
  _$jscoverage['/dialog.js'].lineData[47] = 0;
  _$jscoverage['/dialog.js'].lineData[48] = 0;
  _$jscoverage['/dialog.js'].lineData[49] = 0;
  _$jscoverage['/dialog.js'].lineData[50] = 0;
  _$jscoverage['/dialog.js'].lineData[53] = 0;
  _$jscoverage['/dialog.js'].lineData[55] = 0;
  _$jscoverage['/dialog.js'].lineData[69] = 0;
  _$jscoverage['/dialog.js'].lineData[70] = 0;
  _$jscoverage['/dialog.js'].lineData[72] = 0;
  _$jscoverage['/dialog.js'].lineData[73] = 0;
  _$jscoverage['/dialog.js'].lineData[74] = 0;
  _$jscoverage['/dialog.js'].lineData[75] = 0;
  _$jscoverage['/dialog.js'].lineData[77] = 0;
  _$jscoverage['/dialog.js'].lineData[78] = 0;
  _$jscoverage['/dialog.js'].lineData[79] = 0;
  _$jscoverage['/dialog.js'].lineData[80] = 0;
  _$jscoverage['/dialog.js'].lineData[82] = 0;
  _$jscoverage['/dialog.js'].lineData[86] = 0;
  _$jscoverage['/dialog.js'].lineData[87] = 0;
  _$jscoverage['/dialog.js'].lineData[90] = 0;
  _$jscoverage['/dialog.js'].lineData[91] = 0;
  _$jscoverage['/dialog.js'].lineData[93] = 0;
  _$jscoverage['/dialog.js'].lineData[94] = 0;
  _$jscoverage['/dialog.js'].lineData[100] = 0;
  _$jscoverage['/dialog.js'].lineData[101] = 0;
  _$jscoverage['/dialog.js'].lineData[106] = 0;
  _$jscoverage['/dialog.js'].lineData[111] = 0;
  _$jscoverage['/dialog.js'].lineData[112] = 0;
  _$jscoverage['/dialog.js'].lineData[113] = 0;
  _$jscoverage['/dialog.js'].lineData[114] = 0;
  _$jscoverage['/dialog.js'].lineData[115] = 0;
  _$jscoverage['/dialog.js'].lineData[117] = 0;
  _$jscoverage['/dialog.js'].lineData[118] = 0;
  _$jscoverage['/dialog.js'].lineData[119] = 0;
  _$jscoverage['/dialog.js'].lineData[120] = 0;
  _$jscoverage['/dialog.js'].lineData[123] = 0;
  _$jscoverage['/dialog.js'].lineData[126] = 0;
  _$jscoverage['/dialog.js'].lineData[127] = 0;
  _$jscoverage['/dialog.js'].lineData[128] = 0;
  _$jscoverage['/dialog.js'].lineData[131] = 0;
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
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['49'] = [];
  _$jscoverage['/dialog.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['79'] = [];
  _$jscoverage['/dialog.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['90'] = [];
  _$jscoverage['/dialog.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['111'] = [];
  _$jscoverage['/dialog.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['112'] = [];
  _$jscoverage['/dialog.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['114'] = [];
  _$jscoverage['/dialog.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['115'] = [];
  _$jscoverage['/dialog.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['119'] = [];
  _$jscoverage['/dialog.js'].branchData['119'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['119'][1].init(110, 10, 'cfg.target');
function visit8_119_1(result) {
  _$jscoverage['/dialog.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['115'][1].init(252, 38, '_selectedEl.attr("target") == "_blank"');
function visit7_115_1(result) {
  _$jscoverage['/dialog.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['114'][1].init(176, 31, '_selectedEl.attr("title") || ""');
function visit6_114_1(result) {
  _$jscoverage['/dialog.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['112'][1].init(28, 60, '_selectedEl.attr(_ke_saved_href) || _selectedEl.attr("href")');
function visit5_112_1(result) {
  _$jscoverage['/dialog.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['111'][1].init(188, 11, '_selectedEl');
function visit4_111_1(result) {
  _$jscoverage['/dialog.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['90'][1].init(144, 52, '!Editor.Utils.verifyInputs(d.get("el").all("input"))');
function visit3_90_1(result) {
  _$jscoverage['/dialog.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['79'][1].init(18, 15, 'ev && ev.halt()');
function visit2_79_1(result) {
  _$jscoverage['/dialog.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['49'][1].init(79, 10, 'config || {}');
function visit1_49_1(result) {
  _$jscoverage['/dialog.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[5]++;
KISSY.add("editor/plugin/link/dialog", function(S, Editor, Dialog4E, Utils) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[6]++;
  var _ke_saved_href = Utils._ke_saved_href, bodyHTML = "<div style='padding:20px 20px 0 20px'>" + "<p>" + "<label>" + "\u94fe\u63a5\u7f51\u5740\uff1a " + "<input " + " data-verify='^(https?://[^\\s]+)|(#.+)$' " + " data-warning='\u8bf7\u8f93\u5165\u5408\u9002\u7684\u7f51\u5740\u683c\u5f0f' " + "class='{prefixCls}editor-link-url {prefixCls}editor-input' " + "style='width:390px;" + "'" + " />" + "</label>" + "</p>" + "<p " + "style='margin: 15px 0 10px 0px;'>" + "<label>" + "\u94fe\u63a5\u540d\u79f0\uff1a " + "<input class='{prefixCls}editor-link-title {prefixCls}editor-input' style='width:100px;" + "'>" + "</label> " + "<label>" + "<input " + "class='{prefixCls}editor-link-blank' " + "style='vertical-align: middle; margin-left: 21px;' " + "type='checkbox'/>" + " &nbsp; \u5728\u65b0\u7a97\u53e3\u6253\u5f00\u94fe\u63a5" + "</label>" + "</p>" + "</div>", footHTML = "<div style='padding:5px 20px 20px;'>" + "<a " + "href='javascript:void('\u786e\u5b9a')' " + "class='{prefixCls}editor-link-ok {prefixCls}editor-button ks-inline-block' " + "style='margin-left:65px;margin-right:20px;'>\u786e\u5b9a</a> " + "<a " + "href='javascript:void('\u53d6\u6d88')' " + "class='{prefixCls}editor-link-cancel {prefixCls}editor-button ks-inline-block'>\u53d6\u6d88</a>" + "</div>";
  _$jscoverage['/dialog.js'].lineData[46]++;
  function LinkDialog(editor, config) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[47]++;
    var self = this;
    _$jscoverage['/dialog.js'].lineData[48]++;
    self.editor = editor;
    _$jscoverage['/dialog.js'].lineData[49]++;
    self.config = visit1_49_1(config || {});
    _$jscoverage['/dialog.js'].lineData[50]++;
    Editor.Utils.lazyRun(self, "_prepareShow", "_real");
  }
  _$jscoverage['/dialog.js'].lineData[53]++;
  S.augment(LinkDialog, {
  _prepareShow: function() {
  _$jscoverage['/dialog.js'].functionData[2]++;
  _$jscoverage['/dialog.js'].lineData[55]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), d = new Dialog4E({
  width: 500, 
  headerContent: "\u94fe\u63a5", 
  bodyContent: S.substitute(bodyHTML, {
  prefixCls: prefixCls}), 
  footerContent: S.substitute(footHTML, {
  prefixCls: prefixCls}), 
  mask: true}).render();
  _$jscoverage['/dialog.js'].lineData[69]++;
  self.dialog = d;
  _$jscoverage['/dialog.js'].lineData[70]++;
  var body = d.get("body"), foot = d.get("footer");
  _$jscoverage['/dialog.js'].lineData[72]++;
  d.urlEl = body.one("." + prefixCls + "editor-link-url");
  _$jscoverage['/dialog.js'].lineData[73]++;
  d.urlTitle = body.one("." + prefixCls + "editor-link-title");
  _$jscoverage['/dialog.js'].lineData[74]++;
  d.targetEl = body.one("." + prefixCls + "editor-link-blank");
  _$jscoverage['/dialog.js'].lineData[75]++;
  var cancel = foot.one("." + prefixCls + "editor-link-cancel"), ok = foot.one("." + prefixCls + "editor-link-ok");
  _$jscoverage['/dialog.js'].lineData[77]++;
  ok.on("click", self._link, self);
  _$jscoverage['/dialog.js'].lineData[78]++;
  cancel.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[79]++;
  visit2_79_1(ev && ev.halt());
  _$jscoverage['/dialog.js'].lineData[80]++;
  d.hide();
});
  _$jscoverage['/dialog.js'].lineData[82]++;
  Editor.Utils.placeholder(d.urlEl, "http://");
}, 
  _link: function(ev) {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[86]++;
  ev.halt();
  _$jscoverage['/dialog.js'].lineData[87]++;
  var self = this, d = self.dialog, url = d.urlEl.val();
  _$jscoverage['/dialog.js'].lineData[90]++;
  if (visit3_90_1(!Editor.Utils.verifyInputs(d.get("el").all("input")))) {
    _$jscoverage['/dialog.js'].lineData[91]++;
    return;
  }
  _$jscoverage['/dialog.js'].lineData[93]++;
  d.hide();
  _$jscoverage['/dialog.js'].lineData[94]++;
  var attr = {
  href: url, 
  target: d.targetEl[0].checked ? "_blank" : "_self", 
  title: S.trim(d.urlTitle.val())};
  _$jscoverage['/dialog.js'].lineData[100]++;
  setTimeout(function() {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[101]++;
  Utils.applyLink(self.editor, attr, self._selectedEl);
}, 0);
}, 
  _real: function() {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[106]++;
  var self = this, cfg = self.config, d = self.dialog, _selectedEl = self._selectedEl;
  _$jscoverage['/dialog.js'].lineData[111]++;
  if (visit4_111_1(_selectedEl)) {
    _$jscoverage['/dialog.js'].lineData[112]++;
    var url = visit5_112_1(_selectedEl.attr(_ke_saved_href) || _selectedEl.attr("href"));
    _$jscoverage['/dialog.js'].lineData[113]++;
    Editor.Utils.valInput(d.urlEl, url);
    _$jscoverage['/dialog.js'].lineData[114]++;
    d.urlTitle.val(visit6_114_1(_selectedEl.attr("title") || ""));
    _$jscoverage['/dialog.js'].lineData[115]++;
    d.targetEl[0].checked = (visit7_115_1(_selectedEl.attr("target") == "_blank"));
  } else {
    _$jscoverage['/dialog.js'].lineData[117]++;
    Editor.Utils.resetInput(d.urlEl);
    _$jscoverage['/dialog.js'].lineData[118]++;
    d.urlTitle.val("");
    _$jscoverage['/dialog.js'].lineData[119]++;
    if (visit8_119_1(cfg.target)) {
      _$jscoverage['/dialog.js'].lineData[120]++;
      d.targetEl[0].checked = true;
    }
  }
  _$jscoverage['/dialog.js'].lineData[123]++;
  d.show();
}, 
  show: function(_selectedEl) {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[126]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[127]++;
  self._selectedEl = _selectedEl;
  _$jscoverage['/dialog.js'].lineData[128]++;
  self._prepareShow();
}});
  _$jscoverage['/dialog.js'].lineData[131]++;
  return LinkDialog;
}, {
  requires: ['editor', '../dialog', './utils']});
