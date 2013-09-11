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
if (! _$jscoverage['/xiami-music.js']) {
  _$jscoverage['/xiami-music.js'] = {};
  _$jscoverage['/xiami-music.js'].lineData = [];
  _$jscoverage['/xiami-music.js'].lineData[6] = 0;
  _$jscoverage['/xiami-music.js'].lineData[7] = 0;
  _$jscoverage['/xiami-music.js'].lineData[10] = 0;
  _$jscoverage['/xiami-music.js'].lineData[11] = 0;
  _$jscoverage['/xiami-music.js'].lineData[14] = 0;
  _$jscoverage['/xiami-music.js'].lineData[16] = 0;
  _$jscoverage['/xiami-music.js'].lineData[19] = 0;
  _$jscoverage['/xiami-music.js'].lineData[20] = 0;
  _$jscoverage['/xiami-music.js'].lineData[21] = 0;
  _$jscoverage['/xiami-music.js'].lineData[26] = 0;
  _$jscoverage['/xiami-music.js'].lineData[27] = 0;
  _$jscoverage['/xiami-music.js'].lineData[30] = 0;
  _$jscoverage['/xiami-music.js'].lineData[33] = 0;
  _$jscoverage['/xiami-music.js'].lineData[35] = 0;
  _$jscoverage['/xiami-music.js'].lineData[38] = 0;
  _$jscoverage['/xiami-music.js'].lineData[39] = 0;
  _$jscoverage['/xiami-music.js'].lineData[42] = 0;
  _$jscoverage['/xiami-music.js'].lineData[45] = 0;
  _$jscoverage['/xiami-music.js'].lineData[50] = 0;
  _$jscoverage['/xiami-music.js'].lineData[51] = 0;
  _$jscoverage['/xiami-music.js'].lineData[53] = 0;
  _$jscoverage['/xiami-music.js'].lineData[54] = 0;
  _$jscoverage['/xiami-music.js'].lineData[55] = 0;
  _$jscoverage['/xiami-music.js'].lineData[56] = 0;
  _$jscoverage['/xiami-music.js'].lineData[57] = 0;
  _$jscoverage['/xiami-music.js'].lineData[59] = 0;
  _$jscoverage['/xiami-music.js'].lineData[60] = 0;
  _$jscoverage['/xiami-music.js'].lineData[66] = 0;
  _$jscoverage['/xiami-music.js'].lineData[68] = 0;
  _$jscoverage['/xiami-music.js'].lineData[69] = 0;
  _$jscoverage['/xiami-music.js'].lineData[72] = 0;
  _$jscoverage['/xiami-music.js'].lineData[76] = 0;
  _$jscoverage['/xiami-music.js'].lineData[78] = 0;
  _$jscoverage['/xiami-music.js'].lineData[88] = 0;
  _$jscoverage['/xiami-music.js'].lineData[90] = 0;
  _$jscoverage['/xiami-music.js'].lineData[99] = 0;
  _$jscoverage['/xiami-music.js'].lineData[108] = 0;
  _$jscoverage['/xiami-music.js'].lineData[109] = 0;
  _$jscoverage['/xiami-music.js'].lineData[110] = 0;
  _$jscoverage['/xiami-music.js'].lineData[116] = 0;
  _$jscoverage['/xiami-music.js'].lineData[120] = 0;
  _$jscoverage['/xiami-music.js'].lineData[129] = 0;
}
if (! _$jscoverage['/xiami-music.js'].functionData) {
  _$jscoverage['/xiami-music.js'].functionData = [];
  _$jscoverage['/xiami-music.js'].functionData[0] = 0;
  _$jscoverage['/xiami-music.js'].functionData[1] = 0;
  _$jscoverage['/xiami-music.js'].functionData[2] = 0;
  _$jscoverage['/xiami-music.js'].functionData[3] = 0;
  _$jscoverage['/xiami-music.js'].functionData[4] = 0;
  _$jscoverage['/xiami-music.js'].functionData[5] = 0;
  _$jscoverage['/xiami-music.js'].functionData[6] = 0;
  _$jscoverage['/xiami-music.js'].functionData[7] = 0;
  _$jscoverage['/xiami-music.js'].functionData[8] = 0;
  _$jscoverage['/xiami-music.js'].functionData[9] = 0;
}
if (! _$jscoverage['/xiami-music.js'].branchData) {
  _$jscoverage['/xiami-music.js'].branchData = {};
  _$jscoverage['/xiami-music.js'].branchData['19'] = [];
  _$jscoverage['/xiami-music.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['27'] = [];
  _$jscoverage['/xiami-music.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['36'] = [];
  _$jscoverage['/xiami-music.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['42'] = [];
  _$jscoverage['/xiami-music.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['51'] = [];
  _$jscoverage['/xiami-music.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['53'] = [];
  _$jscoverage['/xiami-music.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['55'] = [];
  _$jscoverage['/xiami-music.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['56'] = [];
  _$jscoverage['/xiami-music.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['59'] = [];
  _$jscoverage['/xiami-music.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['68'] = [];
  _$jscoverage['/xiami-music.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['72'] = [];
  _$jscoverage['/xiami-music.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['72'][2] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['74'] = [];
  _$jscoverage['/xiami-music.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['76'] = [];
  _$jscoverage['/xiami-music.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['88'] = [];
  _$jscoverage['/xiami-music.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['109'] = [];
  _$jscoverage['/xiami-music.js'].branchData['109'][1] = new BranchData();
}
_$jscoverage['/xiami-music.js'].branchData['109'][1].init(102, 10, 'selectedEl');
function visit17_109_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['88'][1].init(30, 104, 'flashUtils.isFlashEmbed(element) && checkXiami(element.getAttribute("src"))');
function visit16_88_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['76'][2].init(51, 87, 'c.getAttribute("value") || c.getAttribute("VALUE")');
function visit15_76_2(result) {
  _$jscoverage['/xiami-music.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['76'][1].init(40, 99, 'checkXiami(c.getAttribute("value") || c.getAttribute("VALUE"))');
function visit14_76_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['74'][1].init(104, 47, 'c.getAttribute("name").toLowerCase() == "movie"');
function visit13_74_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['72'][2].init(180, 21, 'c.nodeName == \'param\'');
function visit12_72_2(result) {
  _$jscoverage['/xiami-music.js'].branchData['72'][2].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['72'][1].init(180, 152, 'c.nodeName == \'param\' && c.getAttribute("name").toLowerCase() == "movie"');
function visit11_72_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['68'][1].init(1272, 21, 'i < childNodes.length');
function visit10_68_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['59'][1].init(207, 28, 'checkXiami(c.attributes.src)');
function visit9_59_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['56'][1].init(42, 27, '!flashUtils.isFlashEmbed(c)');
function visit8_56_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['55'][1].init(92, 21, 'c.nodeName == \'embed\'');
function visit7_55_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['53'][1].init(101, 21, 'i < childNodes.length');
function visit6_53_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['51'][1].init(336, 8, '!classId');
function visit5_51_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['42'][1].init(297, 2838, 'dataFilter && dataFilter.addRules({\n  tags: {\n  \'object\': function(element) {\n  var title = element.getAttribute("title"), i, c, classId = element.getAttribute("classid");\n  var childNodes = element.childNodes;\n  if (!classId) {\n    for (i = 0; i < childNodes.length; i++) {\n      c = childNodes[i];\n      if (c.nodeName == \'embed\') {\n        if (!flashUtils.isFlashEmbed(c)) {\n          return null;\n        }\n        if (checkXiami(c.attributes.src)) {\n          return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {\n  title: title});\n        }\n      }\n    }\n    return null;\n  }\n  for (i = 0; i < childNodes.length; i++) {\n    c = childNodes[i];\n    if (c.nodeName == \'param\' && c.getAttribute("name").toLowerCase() == "movie") {\n      if (checkXiami(c.getAttribute("value") || c.getAttribute("VALUE"))) {\n        return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {\n  title: title});\n      }\n    }\n  }\n}, \n  \'embed\': function(element) {\n  if (flashUtils.isFlashEmbed(element) && checkXiami(element.getAttribute("src"))) {\n    return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {\n  title: element.getAttribute("title")});\n  }\n}}}, 4)');
function visit4_42_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['36'][1].init(75, 41, 'dataProcessor && dataProcessor.dataFilter');
function visit3_36_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['27'][1].init(24, 12, 'config || {}');
function visit2_27_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['19'][1].init(157, 1, 'r');
function visit1_19_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].lineData[6]++;
KISSY.add("editor/plugin/xiami-music", function(S, Editor, FlashBaseClass, flashUtils, fakeObjects) {
  _$jscoverage['/xiami-music.js'].functionData[0]++;
  _$jscoverage['/xiami-music.js'].lineData[7]++;
  var CLS_XIAMI = "ke_xiami", TYPE_XIAMI = "xiami-music";
  _$jscoverage['/xiami-music.js'].lineData[10]++;
  function XiamiMusic() {
    _$jscoverage['/xiami-music.js'].functionData[1]++;
    _$jscoverage['/xiami-music.js'].lineData[11]++;
    XiamiMusic.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/xiami-music.js'].lineData[14]++;
  S.extend(XiamiMusic, FlashBaseClass, {
  _updateTip: function(tipUrlEl, selectedFlash) {
  _$jscoverage['/xiami-music.js'].functionData[2]++;
  _$jscoverage['/xiami-music.js'].lineData[16]++;
  var self = this, editor = self.get("editor"), r = editor.restoreRealElement(selectedFlash);
  _$jscoverage['/xiami-music.js'].lineData[19]++;
  if (visit1_19_1(r)) {
    _$jscoverage['/xiami-music.js'].lineData[20]++;
    tipUrlEl.html(selectedFlash.attr("title"));
    _$jscoverage['/xiami-music.js'].lineData[21]++;
    tipUrlEl.attr("href", self._getFlashUrl(r));
  }
}});
  _$jscoverage['/xiami-music.js'].lineData[26]++;
  function XiamiMusicPlugin(config) {
    _$jscoverage['/xiami-music.js'].functionData[3]++;
    _$jscoverage['/xiami-music.js'].lineData[27]++;
    this.config = visit2_27_1(config || {});
  }
  _$jscoverage['/xiami-music.js'].lineData[30]++;
  S.augment(XiamiMusicPlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/xiami-music.js'].functionData[4]++;
  _$jscoverage['/xiami-music.js'].lineData[33]++;
  fakeObjects.init(editor);
  _$jscoverage['/xiami-music.js'].lineData[35]++;
  var dataProcessor = editor.htmlDataProcessor, dataFilter = visit3_36_1(dataProcessor && dataProcessor.dataFilter);
  _$jscoverage['/xiami-music.js'].lineData[38]++;
  function checkXiami(url) {
    _$jscoverage['/xiami-music.js'].functionData[5]++;
    _$jscoverage['/xiami-music.js'].lineData[39]++;
    return /xiami\.com/i.test(url);
  }
  _$jscoverage['/xiami-music.js'].lineData[42]++;
  visit4_42_1(dataFilter && dataFilter.addRules({
  tags: {
  'object': function(element) {
  _$jscoverage['/xiami-music.js'].functionData[6]++;
  _$jscoverage['/xiami-music.js'].lineData[45]++;
  var title = element.getAttribute("title"), i, c, classId = element.getAttribute("classid");
  _$jscoverage['/xiami-music.js'].lineData[50]++;
  var childNodes = element.childNodes;
  _$jscoverage['/xiami-music.js'].lineData[51]++;
  if (visit5_51_1(!classId)) {
    _$jscoverage['/xiami-music.js'].lineData[53]++;
    for (i = 0; visit6_53_1(i < childNodes.length); i++) {
      _$jscoverage['/xiami-music.js'].lineData[54]++;
      c = childNodes[i];
      _$jscoverage['/xiami-music.js'].lineData[55]++;
      if (visit7_55_1(c.nodeName == 'embed')) {
        _$jscoverage['/xiami-music.js'].lineData[56]++;
        if (visit8_56_1(!flashUtils.isFlashEmbed(c))) {
          _$jscoverage['/xiami-music.js'].lineData[57]++;
          return null;
        }
        _$jscoverage['/xiami-music.js'].lineData[59]++;
        if (visit9_59_1(checkXiami(c.attributes.src))) {
          _$jscoverage['/xiami-music.js'].lineData[60]++;
          return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
  title: title});
        }
      }
    }
    _$jscoverage['/xiami-music.js'].lineData[66]++;
    return null;
  }
  _$jscoverage['/xiami-music.js'].lineData[68]++;
  for (i = 0; visit10_68_1(i < childNodes.length); i++) {
    _$jscoverage['/xiami-music.js'].lineData[69]++;
    c = childNodes[i];
    _$jscoverage['/xiami-music.js'].lineData[72]++;
    if (visit11_72_1(visit12_72_2(c.nodeName == 'param') && visit13_74_1(c.getAttribute("name").toLowerCase() == "movie"))) {
      _$jscoverage['/xiami-music.js'].lineData[76]++;
      if (visit14_76_1(checkXiami(visit15_76_2(c.getAttribute("value") || c.getAttribute("VALUE"))))) {
        _$jscoverage['/xiami-music.js'].lineData[78]++;
        return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
  title: title});
      }
    }
  }
}, 
  'embed': function(element) {
  _$jscoverage['/xiami-music.js'].functionData[7]++;
  _$jscoverage['/xiami-music.js'].lineData[88]++;
  if (visit16_88_1(flashUtils.isFlashEmbed(element) && checkXiami(element.getAttribute("src")))) {
    _$jscoverage['/xiami-music.js'].lineData[90]++;
    return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
  title: element.getAttribute("title")});
  }
}}}, 4));
  _$jscoverage['/xiami-music.js'].lineData[99]++;
  var xiamiMusic = new XiamiMusic({
  editor: editor, 
  cls: CLS_XIAMI, 
  type: TYPE_XIAMI, 
  bubbleId: "xiami", 
  pluginConfig: this.config, 
  contextMenuId: "xiami", 
  contextMenuHandlers: {
  "\u867e\u7c73\u5c5e\u6027": function() {
  _$jscoverage['/xiami-music.js'].functionData[8]++;
  _$jscoverage['/xiami-music.js'].lineData[108]++;
  var selectedEl = this.get("editorSelectedEl");
  _$jscoverage['/xiami-music.js'].lineData[109]++;
  if (visit17_109_1(selectedEl)) {
    _$jscoverage['/xiami-music.js'].lineData[110]++;
    xiamiMusic.show(selectedEl);
  }
}}});
  _$jscoverage['/xiami-music.js'].lineData[116]++;
  editor.addButton("xiamiMusic", {
  tooltip: "\u63d2\u5165\u867e\u7c73\u97f3\u4e50", 
  listeners: {
  click: function() {
  _$jscoverage['/xiami-music.js'].functionData[9]++;
  _$jscoverage['/xiami-music.js'].lineData[120]++;
  xiamiMusic.show();
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
}});
  _$jscoverage['/xiami-music.js'].lineData[129]++;
  return XiamiMusicPlugin;
}, {
  requires: ['editor', './flash-common/base-class', './flash-common/utils', './fake-objects']});
