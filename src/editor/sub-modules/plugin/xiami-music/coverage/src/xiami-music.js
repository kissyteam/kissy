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
            + ','src':' + jscoverage_quote(this.src)
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
  _$jscoverage['/xiami-music.js'].lineData[8] = 0;
  _$jscoverage['/xiami-music.js'].lineData[9] = 0;
  _$jscoverage['/xiami-music.js'].lineData[10] = 0;
  _$jscoverage['/xiami-music.js'].lineData[11] = 0;
  _$jscoverage['/xiami-music.js'].lineData[13] = 0;
  _$jscoverage['/xiami-music.js'].lineData[16] = 0;
  _$jscoverage['/xiami-music.js'].lineData[17] = 0;
  _$jscoverage['/xiami-music.js'].lineData[20] = 0;
  _$jscoverage['/xiami-music.js'].lineData[22] = 0;
  _$jscoverage['/xiami-music.js'].lineData[25] = 0;
  _$jscoverage['/xiami-music.js'].lineData[26] = 0;
  _$jscoverage['/xiami-music.js'].lineData[27] = 0;
  _$jscoverage['/xiami-music.js'].lineData[32] = 0;
  _$jscoverage['/xiami-music.js'].lineData[33] = 0;
  _$jscoverage['/xiami-music.js'].lineData[36] = 0;
  _$jscoverage['/xiami-music.js'].lineData[39] = 0;
  _$jscoverage['/xiami-music.js'].lineData[41] = 0;
  _$jscoverage['/xiami-music.js'].lineData[44] = 0;
  _$jscoverage['/xiami-music.js'].lineData[45] = 0;
  _$jscoverage['/xiami-music.js'].lineData[48] = 0;
  _$jscoverage['/xiami-music.js'].lineData[51] = 0;
  _$jscoverage['/xiami-music.js'].lineData[56] = 0;
  _$jscoverage['/xiami-music.js'].lineData[57] = 0;
  _$jscoverage['/xiami-music.js'].lineData[59] = 0;
  _$jscoverage['/xiami-music.js'].lineData[60] = 0;
  _$jscoverage['/xiami-music.js'].lineData[61] = 0;
  _$jscoverage['/xiami-music.js'].lineData[62] = 0;
  _$jscoverage['/xiami-music.js'].lineData[63] = 0;
  _$jscoverage['/xiami-music.js'].lineData[65] = 0;
  _$jscoverage['/xiami-music.js'].lineData[66] = 0;
  _$jscoverage['/xiami-music.js'].lineData[72] = 0;
  _$jscoverage['/xiami-music.js'].lineData[74] = 0;
  _$jscoverage['/xiami-music.js'].lineData[75] = 0;
  _$jscoverage['/xiami-music.js'].lineData[78] = 0;
  _$jscoverage['/xiami-music.js'].lineData[82] = 0;
  _$jscoverage['/xiami-music.js'].lineData[84] = 0;
  _$jscoverage['/xiami-music.js'].lineData[94] = 0;
  _$jscoverage['/xiami-music.js'].lineData[96] = 0;
  _$jscoverage['/xiami-music.js'].lineData[105] = 0;
  _$jscoverage['/xiami-music.js'].lineData[114] = 0;
  _$jscoverage['/xiami-music.js'].lineData[115] = 0;
  _$jscoverage['/xiami-music.js'].lineData[116] = 0;
  _$jscoverage['/xiami-music.js'].lineData[122] = 0;
  _$jscoverage['/xiami-music.js'].lineData[126] = 0;
  _$jscoverage['/xiami-music.js'].lineData[135] = 0;
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
  _$jscoverage['/xiami-music.js'].branchData['25'] = [];
  _$jscoverage['/xiami-music.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['33'] = [];
  _$jscoverage['/xiami-music.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['42'] = [];
  _$jscoverage['/xiami-music.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['48'] = [];
  _$jscoverage['/xiami-music.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['57'] = [];
  _$jscoverage['/xiami-music.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['59'] = [];
  _$jscoverage['/xiami-music.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['61'] = [];
  _$jscoverage['/xiami-music.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['62'] = [];
  _$jscoverage['/xiami-music.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['65'] = [];
  _$jscoverage['/xiami-music.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['74'] = [];
  _$jscoverage['/xiami-music.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['78'] = [];
  _$jscoverage['/xiami-music.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['80'] = [];
  _$jscoverage['/xiami-music.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['82'] = [];
  _$jscoverage['/xiami-music.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['94'] = [];
  _$jscoverage['/xiami-music.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['115'] = [];
  _$jscoverage['/xiami-music.js'].branchData['115'][1] = new BranchData();
}
_$jscoverage['/xiami-music.js'].branchData['115'][1].init(100, 10, 'selectedEl');
function visit17_115_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['94'][1].init(29, 103, 'flashUtils.isFlashEmbed(element) && checkXiami(element.getAttribute('src'))');
function visit16_94_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['82'][2].init(49, 86, 'c.getAttribute('value') || c.getAttribute("VALUE")');
function visit15_82_2(result) {
  _$jscoverage['/xiami-music.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['82'][1].init(38, 98, 'checkXiami(c.getAttribute('value') || c.getAttribute("VALUE"))');
function visit14_82_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['80'][1].init(102, 47, 'c.getAttribute("name").toLowerCase() == "movie"');
function visit13_80_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['78'][2].init(176, 21, 'c.nodeName == \'param\'');
function visit12_78_2(result) {
  _$jscoverage['/xiami-music.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['78'][1].init(176, 150, 'c.nodeName == \'param\' && c.getAttribute("name").toLowerCase() == "movie"');
function visit11_78_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['74'][1].init(1248, 21, 'i < childNodes.length');
function visit10_74_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['65'][1].init(203, 28, 'checkXiami(c.attributes.src)');
function visit9_65_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['62'][1].init(41, 27, '!flashUtils.isFlashEmbed(c)');
function visit8_62_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['61'][1].init(90, 21, 'c.nodeName == \'embed\'');
function visit7_61_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['59'][1].init(99, 21, 'i < childNodes.length');
function visit6_59_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['57'][1].init(329, 8, '!classId');
function visit5_57_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['48'][1].init(286, 2783, 'dataFilter && dataFilter.addRules({\n  tags: {\n  \'object\': function(element) {\n  var title = element.getAttribute('title'), i, c, classId = element.getAttribute('classid');\n  var childNodes = element.childNodes;\n  if (!classId) {\n    for (i = 0; i < childNodes.length; i++) {\n      c = childNodes[i];\n      if (c.nodeName == \'embed\') {\n        if (!flashUtils.isFlashEmbed(c)) {\n          return null;\n        }\n        if (checkXiami(c.attributes.src)) {\n          return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {\n  title: title});\n        }\n      }\n    }\n    return null;\n  }\n  for (i = 0; i < childNodes.length; i++) {\n    c = childNodes[i];\n    if (c.nodeName == \'param\' && c.getAttribute("name").toLowerCase() == "movie") {\n      if (checkXiami(c.getAttribute('value') || c.getAttribute("VALUE"))) {\n        return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {\n  title: title});\n      }\n    }\n  }\n}, \n  \'embed\': function(element) {\n  if (flashUtils.isFlashEmbed(element) && checkXiami(element.getAttribute('src'))) {\n    return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {\n  title: element.getAttribute('title')});\n  }\n}}}, 4)');
function visit4_48_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['42'][1].init(74, 41, 'dataProcessor && dataProcessor.dataFilter');
function visit3_42_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['33'][1].init(23, 12, 'config || {}');
function visit2_33_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['25'][1].init(153, 1, 'r');
function visit1_25_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/xiami-music.js'].functionData[0]++;
  _$jscoverage['/xiami-music.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/xiami-music.js'].lineData[8]++;
  var FlashBaseClass = require('./flash-common/base-class');
  _$jscoverage['/xiami-music.js'].lineData[9]++;
  var flashUtils = require('./flash-common/utils');
  _$jscoverage['/xiami-music.js'].lineData[10]++;
  var fakeObjects = require('./fake-objects');
  _$jscoverage['/xiami-music.js'].lineData[11]++;
  require('./button');
  _$jscoverage['/xiami-music.js'].lineData[13]++;
  var CLS_XIAMI = "ke_xiami", TYPE_XIAMI = "xiami-music";
  _$jscoverage['/xiami-music.js'].lineData[16]++;
  function XiamiMusic() {
    _$jscoverage['/xiami-music.js'].functionData[1]++;
    _$jscoverage['/xiami-music.js'].lineData[17]++;
    XiamiMusic.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/xiami-music.js'].lineData[20]++;
  S.extend(XiamiMusic, FlashBaseClass, {
  _updateTip: function(tipUrlEl, selectedFlash) {
  _$jscoverage['/xiami-music.js'].functionData[2]++;
  _$jscoverage['/xiami-music.js'].lineData[22]++;
  var self = this, editor = self.get('editor'), r = editor.restoreRealElement(selectedFlash);
  _$jscoverage['/xiami-music.js'].lineData[25]++;
  if (visit1_25_1(r)) {
    _$jscoverage['/xiami-music.js'].lineData[26]++;
    tipUrlEl.html(selectedFlash.attr('title'));
    _$jscoverage['/xiami-music.js'].lineData[27]++;
    tipUrlEl.attr('href', self._getFlashUrl(r));
  }
}});
  _$jscoverage['/xiami-music.js'].lineData[32]++;
  function XiamiMusicPlugin(config) {
    _$jscoverage['/xiami-music.js'].functionData[3]++;
    _$jscoverage['/xiami-music.js'].lineData[33]++;
    this.config = visit2_33_1(config || {});
  }
  _$jscoverage['/xiami-music.js'].lineData[36]++;
  S.augment(XiamiMusicPlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/xiami-music.js'].functionData[4]++;
  _$jscoverage['/xiami-music.js'].lineData[39]++;
  fakeObjects.init(editor);
  _$jscoverage['/xiami-music.js'].lineData[41]++;
  var dataProcessor = editor.htmlDataProcessor, dataFilter = visit3_42_1(dataProcessor && dataProcessor.dataFilter);
  _$jscoverage['/xiami-music.js'].lineData[44]++;
  function checkXiami(url) {
    _$jscoverage['/xiami-music.js'].functionData[5]++;
    _$jscoverage['/xiami-music.js'].lineData[45]++;
    return /xiami\.com/i.test(url);
  }
  _$jscoverage['/xiami-music.js'].lineData[48]++;
  visit4_48_1(dataFilter && dataFilter.addRules({
  tags: {
  'object': function(element) {
  _$jscoverage['/xiami-music.js'].functionData[6]++;
  _$jscoverage['/xiami-music.js'].lineData[51]++;
  var title = element.getAttribute('title'), i, c, classId = element.getAttribute('classid');
  _$jscoverage['/xiami-music.js'].lineData[56]++;
  var childNodes = element.childNodes;
  _$jscoverage['/xiami-music.js'].lineData[57]++;
  if (visit5_57_1(!classId)) {
    _$jscoverage['/xiami-music.js'].lineData[59]++;
    for (i = 0; visit6_59_1(i < childNodes.length); i++) {
      _$jscoverage['/xiami-music.js'].lineData[60]++;
      c = childNodes[i];
      _$jscoverage['/xiami-music.js'].lineData[61]++;
      if (visit7_61_1(c.nodeName == 'embed')) {
        _$jscoverage['/xiami-music.js'].lineData[62]++;
        if (visit8_62_1(!flashUtils.isFlashEmbed(c))) {
          _$jscoverage['/xiami-music.js'].lineData[63]++;
          return null;
        }
        _$jscoverage['/xiami-music.js'].lineData[65]++;
        if (visit9_65_1(checkXiami(c.attributes.src))) {
          _$jscoverage['/xiami-music.js'].lineData[66]++;
          return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
  title: title});
        }
      }
    }
    _$jscoverage['/xiami-music.js'].lineData[72]++;
    return null;
  }
  _$jscoverage['/xiami-music.js'].lineData[74]++;
  for (i = 0; visit10_74_1(i < childNodes.length); i++) {
    _$jscoverage['/xiami-music.js'].lineData[75]++;
    c = childNodes[i];
    _$jscoverage['/xiami-music.js'].lineData[78]++;
    if (visit11_78_1(visit12_78_2(c.nodeName == 'param') && visit13_80_1(c.getAttribute("name").toLowerCase() == "movie"))) {
      _$jscoverage['/xiami-music.js'].lineData[82]++;
      if (visit14_82_1(checkXiami(visit15_82_2(c.getAttribute('value') || c.getAttribute("VALUE"))))) {
        _$jscoverage['/xiami-music.js'].lineData[84]++;
        return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
  title: title});
      }
    }
  }
}, 
  'embed': function(element) {
  _$jscoverage['/xiami-music.js'].functionData[7]++;
  _$jscoverage['/xiami-music.js'].lineData[94]++;
  if (visit16_94_1(flashUtils.isFlashEmbed(element) && checkXiami(element.getAttribute('src')))) {
    _$jscoverage['/xiami-music.js'].lineData[96]++;
    return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
  title: element.getAttribute('title')});
  }
}}}, 4));
  _$jscoverage['/xiami-music.js'].lineData[105]++;
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
  _$jscoverage['/xiami-music.js'].lineData[114]++;
  var selectedEl = this.get('editorSelectedEl');
  _$jscoverage['/xiami-music.js'].lineData[115]++;
  if (visit17_115_1(selectedEl)) {
    _$jscoverage['/xiami-music.js'].lineData[116]++;
    xiamiMusic.show(selectedEl);
  }
}}});
  _$jscoverage['/xiami-music.js'].lineData[122]++;
  editor.addButton("xiamiMusic", {
  tooltip: "\u63d2\u5165\u867e\u7c73\u97f3\u4e50", 
  listeners: {
  click: function() {
  _$jscoverage['/xiami-music.js'].functionData[9]++;
  _$jscoverage['/xiami-music.js'].lineData[126]++;
  xiamiMusic.show();
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
}});
  _$jscoverage['/xiami-music.js'].lineData[135]++;
  return XiamiMusicPlugin;
});
