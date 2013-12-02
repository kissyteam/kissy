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
  _$jscoverage['/xiami-music.js'].lineData[49] = 0;
  _$jscoverage['/xiami-music.js'].lineData[52] = 0;
  _$jscoverage['/xiami-music.js'].lineData[57] = 0;
  _$jscoverage['/xiami-music.js'].lineData[58] = 0;
  _$jscoverage['/xiami-music.js'].lineData[60] = 0;
  _$jscoverage['/xiami-music.js'].lineData[61] = 0;
  _$jscoverage['/xiami-music.js'].lineData[62] = 0;
  _$jscoverage['/xiami-music.js'].lineData[63] = 0;
  _$jscoverage['/xiami-music.js'].lineData[64] = 0;
  _$jscoverage['/xiami-music.js'].lineData[66] = 0;
  _$jscoverage['/xiami-music.js'].lineData[67] = 0;
  _$jscoverage['/xiami-music.js'].lineData[73] = 0;
  _$jscoverage['/xiami-music.js'].lineData[75] = 0;
  _$jscoverage['/xiami-music.js'].lineData[76] = 0;
  _$jscoverage['/xiami-music.js'].lineData[79] = 0;
  _$jscoverage['/xiami-music.js'].lineData[83] = 0;
  _$jscoverage['/xiami-music.js'].lineData[85] = 0;
  _$jscoverage['/xiami-music.js'].lineData[95] = 0;
  _$jscoverage['/xiami-music.js'].lineData[97] = 0;
  _$jscoverage['/xiami-music.js'].lineData[108] = 0;
  _$jscoverage['/xiami-music.js'].lineData[117] = 0;
  _$jscoverage['/xiami-music.js'].lineData[118] = 0;
  _$jscoverage['/xiami-music.js'].lineData[119] = 0;
  _$jscoverage['/xiami-music.js'].lineData[125] = 0;
  _$jscoverage['/xiami-music.js'].lineData[129] = 0;
  _$jscoverage['/xiami-music.js'].lineData[138] = 0;
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
  _$jscoverage['/xiami-music.js'].branchData['58'] = [];
  _$jscoverage['/xiami-music.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['60'] = [];
  _$jscoverage['/xiami-music.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['62'] = [];
  _$jscoverage['/xiami-music.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['63'] = [];
  _$jscoverage['/xiami-music.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['66'] = [];
  _$jscoverage['/xiami-music.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['75'] = [];
  _$jscoverage['/xiami-music.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['79'] = [];
  _$jscoverage['/xiami-music.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['79'][2] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['81'] = [];
  _$jscoverage['/xiami-music.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['83'] = [];
  _$jscoverage['/xiami-music.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['95'] = [];
  _$jscoverage['/xiami-music.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/xiami-music.js'].branchData['118'] = [];
  _$jscoverage['/xiami-music.js'].branchData['118'][1] = new BranchData();
}
_$jscoverage['/xiami-music.js'].branchData['118'][1].init(100, 10, 'selectedEl');
function visit17_118_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['95'][1].init(33, 107, 'flashUtils.isFlashEmbed(element) && checkXiami(element.getAttribute(\'src\'))');
function visit16_95_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['83'][2].init(53, 90, 'c.getAttribute(\'value\') || c.getAttribute(\'VALUE\')');
function visit15_83_2(result) {
  _$jscoverage['/xiami-music.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['83'][1].init(42, 102, 'checkXiami(c.getAttribute(\'value\') || c.getAttribute(\'VALUE\'))');
function visit14_83_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['81'][1].init(111, 48, 'c.getAttribute(\'name\').toLowerCase() === \'movie\'');
function visit13_81_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['79'][2].init(192, 22, 'c.nodeName === \'param\'');
function visit12_79_2(result) {
  _$jscoverage['/xiami-music.js'].branchData['79'][2].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['79'][1].init(192, 160, 'c.nodeName === \'param\' && c.getAttribute(\'name\').toLowerCase() === \'movie\'');
function visit11_79_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['75'][1].init(1345, 21, 'i < childNodes.length');
function visit10_75_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['66'][1].init(219, 28, 'checkXiami(c.attributes.src)');
function visit9_66_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['63'][1].init(45, 27, '!flashUtils.isFlashEmbed(c)');
function visit8_63_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['62'][1].init(98, 22, 'c.nodeName === \'embed\'');
function visit7_62_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['60'][1].init(107, 21, 'i < childNodes.length');
function visit6_60_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['58'][1].init(357, 8, '!classId');
function visit5_58_1(result) {
  _$jscoverage['/xiami-music.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/xiami-music.js'].branchData['48'][1].init(291, 10, 'dataFilter');
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
  var CLS_XIAMI = 'ke_xiami', TYPE_XIAMI = 'xiami-music';
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
    return (/xiami\.com/i).test(url);
  }
  _$jscoverage['/xiami-music.js'].lineData[48]++;
  if (visit4_48_1(dataFilter)) {
    _$jscoverage['/xiami-music.js'].lineData[49]++;
    dataFilter.addRules({
  tags: {
  'object': function(element) {
  _$jscoverage['/xiami-music.js'].functionData[6]++;
  _$jscoverage['/xiami-music.js'].lineData[52]++;
  var title = element.getAttribute('title'), i, c, classId = element.getAttribute('classid');
  _$jscoverage['/xiami-music.js'].lineData[57]++;
  var childNodes = element.childNodes;
  _$jscoverage['/xiami-music.js'].lineData[58]++;
  if (visit5_58_1(!classId)) {
    _$jscoverage['/xiami-music.js'].lineData[60]++;
    for (i = 0; visit6_60_1(i < childNodes.length); i++) {
      _$jscoverage['/xiami-music.js'].lineData[61]++;
      c = childNodes[i];
      _$jscoverage['/xiami-music.js'].lineData[62]++;
      if (visit7_62_1(c.nodeName === 'embed')) {
        _$jscoverage['/xiami-music.js'].lineData[63]++;
        if (visit8_63_1(!flashUtils.isFlashEmbed(c))) {
          _$jscoverage['/xiami-music.js'].lineData[64]++;
          return null;
        }
        _$jscoverage['/xiami-music.js'].lineData[66]++;
        if (visit9_66_1(checkXiami(c.attributes.src))) {
          _$jscoverage['/xiami-music.js'].lineData[67]++;
          return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
  title: title});
        }
      }
    }
    _$jscoverage['/xiami-music.js'].lineData[73]++;
    return null;
  }
  _$jscoverage['/xiami-music.js'].lineData[75]++;
  for (i = 0; visit10_75_1(i < childNodes.length); i++) {
    _$jscoverage['/xiami-music.js'].lineData[76]++;
    c = childNodes[i];
    _$jscoverage['/xiami-music.js'].lineData[79]++;
    if (visit11_79_1(visit12_79_2(c.nodeName === 'param') && visit13_81_1(c.getAttribute('name').toLowerCase() === 'movie'))) {
      _$jscoverage['/xiami-music.js'].lineData[83]++;
      if (visit14_83_1(checkXiami(visit15_83_2(c.getAttribute('value') || c.getAttribute('VALUE'))))) {
        _$jscoverage['/xiami-music.js'].lineData[85]++;
        return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
  title: title});
      }
    }
  }
}, 
  'embed': function(element) {
  _$jscoverage['/xiami-music.js'].functionData[7]++;
  _$jscoverage['/xiami-music.js'].lineData[95]++;
  if (visit16_95_1(flashUtils.isFlashEmbed(element) && checkXiami(element.getAttribute('src')))) {
    _$jscoverage['/xiami-music.js'].lineData[97]++;
    return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
  title: element.getAttribute('title')});
  }
}}}, 4);
  }
  _$jscoverage['/xiami-music.js'].lineData[108]++;
  var xiamiMusic = new XiamiMusic({
  editor: editor, 
  cls: CLS_XIAMI, 
  type: TYPE_XIAMI, 
  bubbleId: 'xiami', 
  pluginConfig: this.config, 
  contextMenuId: 'xiami', 
  contextMenuHandlers: {
  '\u867e\u7c73\u5c5e\u6027': function() {
  _$jscoverage['/xiami-music.js'].functionData[8]++;
  _$jscoverage['/xiami-music.js'].lineData[117]++;
  var selectedEl = this.get('editorSelectedEl');
  _$jscoverage['/xiami-music.js'].lineData[118]++;
  if (visit17_118_1(selectedEl)) {
    _$jscoverage['/xiami-music.js'].lineData[119]++;
    xiamiMusic.show(selectedEl);
  }
}}});
  _$jscoverage['/xiami-music.js'].lineData[125]++;
  editor.addButton('xiamiMusic', {
  tooltip: '\u63d2\u5165\u867e\u7c73\u97f3\u4e50', 
  listeners: {
  click: function() {
  _$jscoverage['/xiami-music.js'].functionData[9]++;
  _$jscoverage['/xiami-music.js'].lineData[129]++;
  xiamiMusic.show();
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
}});
  _$jscoverage['/xiami-music.js'].lineData[138]++;
  return XiamiMusicPlugin;
});
