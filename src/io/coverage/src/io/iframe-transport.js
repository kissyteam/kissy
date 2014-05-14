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
if (! _$jscoverage['/io/iframe-transport.js']) {
  _$jscoverage['/io/iframe-transport.js'] = {};
  _$jscoverage['/io/iframe-transport.js'].lineData = [];
  _$jscoverage['/io/iframe-transport.js'].lineData[6] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[7] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[8] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[11] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[12] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[13] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[31] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[32] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[36] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[43] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[49] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[55] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[56] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[61] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[69] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[70] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[73] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[74] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[75] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[76] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[77] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[79] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[80] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[81] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[82] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[83] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[84] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[85] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[88] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[91] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[92] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[95] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[96] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[97] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[100] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[103] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[112] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[120] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[122] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[125] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[134] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[135] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[138] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[139] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[142] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[144] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[145] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[146] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[150] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[151] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[154] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[159] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[169] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[170] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[174] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[175] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[176] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[179] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[182] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[184] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[186] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[188] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[192] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[194] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[196] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[197] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[199] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[201] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[203] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[204] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[216] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[217] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[220] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[222] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[223] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[230] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[234] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[236] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[237] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[242] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[248] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[250] = 0;
}
if (! _$jscoverage['/io/iframe-transport.js'].functionData) {
  _$jscoverage['/io/iframe-transport.js'].functionData = [];
  _$jscoverage['/io/iframe-transport.js'].functionData[0] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[1] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[2] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[3] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[4] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[5] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[6] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[7] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[8] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[9] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[10] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[11] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[12] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[13] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[14] = 0;
}
if (! _$jscoverage['/io/iframe-transport.js'].branchData) {
  _$jscoverage['/io/iframe-transport.js'].branchData = {};
  _$jscoverage['/io/iframe-transport.js'].branchData['69'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['79'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['82'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['113'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['114'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['134'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['138'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['150'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['169'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['174'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['174'][2] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['174'][3] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['194'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['199'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['203'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['216'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['222'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['236'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['236'][1] = new BranchData();
}
_$jscoverage['/io/iframe-transport.js'].branchData['236'][1].init(3378, 21, 'eventType === \'error\'');
function visit64_236_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['222'][1].init(1502, 9, 'iframeDoc');
function visit63_222_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['216'][1].init(1221, 34, 'iframeDoc && iframeDoc.XMLDocument');
function visit62_216_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['203'][1].init(243, 41, 'util.startsWith(io.responseText, \'<?xml\')');
function visit61_203_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['199'][1].init(119, 27, 'iframeDoc && iframeDoc.body');
function visit60_199_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['194'][1].init(1030, 20, 'eventType === \'load\'');
function visit59_194_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['174'][3].init(455, 11, 'UA.ie === 6');
function visit58_174_3(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['174'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['174'][2].init(430, 21, 'eventType === \'abort\'');
function visit57_174_2(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['174'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['174'][1].init(430, 36, 'eventType === \'abort\' && UA.ie === 6');
function visit56_174_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['169'][1].init(319, 7, '!iframe');
function visit55_169_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['150'][1].init(1485, 11, 'UA.ie === 6');
function visit54_150_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['138'][1].init(1150, 5, 'query');
function visit53_138_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['134'][1].init(1063, 4, 'data');
function visit52_134_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['114'][1].init(83, 30, 'Dom.attr(form, \'action\') || \'\'');
function visit51_114_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['113'][1].init(26, 30, 'Dom.attr(form, \'target\') || \'\'');
function visit50_113_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['82'][1].init(117, 25, 'isArray && serializeArray');
function visit49_82_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['79'][1].init(145, 13, 'i < vs.length');
function visit48_79_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['69'][1].init(520, 31, 'doc.body || doc.documentElement');
function visit47_69_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/iframe-transport.js'].functionData[0]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/io/iframe-transport.js'].lineData[8]++;
  var Dom = require('dom'), IO = require('./base'), Event = require('event/dom');
  _$jscoverage['/io/iframe-transport.js'].lineData[11]++;
  var logger = S.getLogger('s/io');
  _$jscoverage['/io/iframe-transport.js'].lineData[12]++;
  var UA = require('ua');
  _$jscoverage['/io/iframe-transport.js'].lineData[13]++;
  var doc = S.Env.host.document, OK_CODE = 200, ERROR_CODE = 500, BREATH_INTERVAL = 30, iframeConverter = util.clone(IO.getConfig().converters.text);
  _$jscoverage['/io/iframe-transport.js'].lineData[31]++;
  iframeConverter.json = function(str) {
  _$jscoverage['/io/iframe-transport.js'].functionData[1]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[32]++;
  return util.parseJson(util.unEscapeHtml(str));
};
  _$jscoverage['/io/iframe-transport.js'].lineData[36]++;
  IO.setupConfig({
  converters: {
  iframe: iframeConverter, 
  text: {
  iframe: function(text) {
  _$jscoverage['/io/iframe-transport.js'].functionData[2]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[43]++;
  return text;
}}, 
  xml: {
  iframe: function(xml) {
  _$jscoverage['/io/iframe-transport.js'].functionData[3]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[49]++;
  return xml;
}}}});
  _$jscoverage['/io/iframe-transport.js'].lineData[55]++;
  function createIframe(xhr) {
    _$jscoverage['/io/iframe-transport.js'].functionData[4]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[56]++;
    var id = util.guid('io-iframe'), iframe, src = Dom.getEmptyIframeSrc();
    _$jscoverage['/io/iframe-transport.js'].lineData[61]++;
    iframe = xhr.iframe = Dom.create('<iframe ' + (src ? (' src="' + src + '" ') : '') + ' id="' + id + '"' + ' name="' + id + '"' + ' style="position:absolute;left:-9999px;top:-9999px;"/>');
    _$jscoverage['/io/iframe-transport.js'].lineData[69]++;
    Dom.prepend(iframe, visit47_69_1(doc.body || doc.documentElement));
    _$jscoverage['/io/iframe-transport.js'].lineData[70]++;
    return iframe;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[73]++;
  function addDataToForm(query, form, serializeArray) {
    _$jscoverage['/io/iframe-transport.js'].functionData[5]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[74]++;
    var ret = [], isArray, vs, i, e;
    _$jscoverage['/io/iframe-transport.js'].lineData[75]++;
    util.each(query, function(data, k) {
  _$jscoverage['/io/iframe-transport.js'].functionData[6]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[76]++;
  isArray = util.isArray(data);
  _$jscoverage['/io/iframe-transport.js'].lineData[77]++;
  vs = util.makeArray(data);
  _$jscoverage['/io/iframe-transport.js'].lineData[79]++;
  for (i = 0; visit48_79_1(i < vs.length); i++) {
    _$jscoverage['/io/iframe-transport.js'].lineData[80]++;
    e = doc.createElement('input');
    _$jscoverage['/io/iframe-transport.js'].lineData[81]++;
    e.type = 'hidden';
    _$jscoverage['/io/iframe-transport.js'].lineData[82]++;
    e.name = k + (visit49_82_1(isArray && serializeArray) ? '[]' : '');
    _$jscoverage['/io/iframe-transport.js'].lineData[83]++;
    e.value = vs[i];
    _$jscoverage['/io/iframe-transport.js'].lineData[84]++;
    Dom.append(e, form);
    _$jscoverage['/io/iframe-transport.js'].lineData[85]++;
    ret.push(e);
  }
});
    _$jscoverage['/io/iframe-transport.js'].lineData[88]++;
    return ret;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[91]++;
  function removeFieldsFromData(fields) {
    _$jscoverage['/io/iframe-transport.js'].functionData[7]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[92]++;
    Dom.remove(fields);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[95]++;
  function IframeTransport(io) {
    _$jscoverage['/io/iframe-transport.js'].functionData[8]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[96]++;
    this.io = io;
    _$jscoverage['/io/iframe-transport.js'].lineData[97]++;
    logger.info('use IframeTransport for: ' + io.config.url);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[100]++;
  util.augment(IframeTransport, {
  send: function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[9]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[103]++;
  var self = this, io = self.io, c = io.config, fields, iframe, query, data = c.data, form = Dom.get(c.form);
  _$jscoverage['/io/iframe-transport.js'].lineData[112]++;
  self.attrs = {
  target: visit50_113_1(Dom.attr(form, 'target') || ''), 
  action: visit51_114_1(Dom.attr(form, 'action') || ''), 
  encoding: Dom.attr(form, 'encoding'), 
  enctype: Dom.attr(form, 'enctype'), 
  method: Dom.attr(form, 'method')};
  _$jscoverage['/io/iframe-transport.js'].lineData[120]++;
  self.form = form;
  _$jscoverage['/io/iframe-transport.js'].lineData[122]++;
  iframe = createIframe(io);
  _$jscoverage['/io/iframe-transport.js'].lineData[125]++;
  Dom.attr(form, {
  target: iframe.id, 
  action: io._getUrlForSend(), 
  method: 'post', 
  enctype: 'multipart/form-data', 
  encoding: 'multipart/form-data'});
  _$jscoverage['/io/iframe-transport.js'].lineData[134]++;
  if (visit52_134_1(data)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[135]++;
    query = util.unparam(data);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[138]++;
  if (visit53_138_1(query)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[139]++;
    fields = addDataToForm(query, form, c.serializeArray);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[142]++;
  self.fields = fields;
  _$jscoverage['/io/iframe-transport.js'].lineData[144]++;
  function go() {
    _$jscoverage['/io/iframe-transport.js'].functionData[10]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[145]++;
    Event.on(iframe, 'load error', self._callback, self);
    _$jscoverage['/io/iframe-transport.js'].lineData[146]++;
    form.submit();
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[150]++;
  if (visit54_150_1(UA.ie === 6)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[151]++;
    setTimeout(go, 0);
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[154]++;
    go();
  }
}, 
  _callback: function(event) {
  _$jscoverage['/io/iframe-transport.js'].functionData[11]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[159]++;
  var self = this, form = self.form, io = self.io, eventType = event.type, iframeDoc, iframe = io.iframe;
  _$jscoverage['/io/iframe-transport.js'].lineData[169]++;
  if (visit55_169_1(!iframe)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[170]++;
    return;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[174]++;
  if (visit56_174_1(visit57_174_2(eventType === 'abort') && visit58_174_3(UA.ie === 6))) {
    _$jscoverage['/io/iframe-transport.js'].lineData[175]++;
    setTimeout(function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[12]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[176]++;
  Dom.attr(form, self.attrs);
}, 0);
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[179]++;
    Dom.attr(form, self.attrs);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[182]++;
  removeFieldsFromData(this.fields);
  _$jscoverage['/io/iframe-transport.js'].lineData[184]++;
  Event.detach(iframe);
  _$jscoverage['/io/iframe-transport.js'].lineData[186]++;
  setTimeout(function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[13]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[188]++;
  Dom.remove(iframe);
}, BREATH_INTERVAL);
  _$jscoverage['/io/iframe-transport.js'].lineData[192]++;
  io.iframe = null;
  _$jscoverage['/io/iframe-transport.js'].lineData[194]++;
  if (visit59_194_1(eventType === 'load')) {
    _$jscoverage['/io/iframe-transport.js'].lineData[196]++;
    try {
      _$jscoverage['/io/iframe-transport.js'].lineData[197]++;
      iframeDoc = iframe.contentWindow.document;
      _$jscoverage['/io/iframe-transport.js'].lineData[199]++;
      if (visit60_199_1(iframeDoc && iframeDoc.body)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[201]++;
        io.responseText = Dom.html(iframeDoc.body);
        _$jscoverage['/io/iframe-transport.js'].lineData[203]++;
        if (visit61_203_1(util.startsWith(io.responseText, '<?xml'))) {
          _$jscoverage['/io/iframe-transport.js'].lineData[204]++;
          io.responseText = undefined;
        }
      }
      _$jscoverage['/io/iframe-transport.js'].lineData[216]++;
      if (visit62_216_1(iframeDoc && iframeDoc.XMLDocument)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[217]++;
        io.responseXML = iframeDoc.XMLDocument;
      } else {
        _$jscoverage['/io/iframe-transport.js'].lineData[220]++;
        io.responseXML = iframeDoc;
      }
      _$jscoverage['/io/iframe-transport.js'].lineData[222]++;
      if (visit63_222_1(iframeDoc)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[223]++;
        io._ioReady(OK_CODE, 'success');
      } else {
        _$jscoverage['/io/iframe-transport.js'].lineData[230]++;
        io._ioReady(ERROR_CODE, 'parser error');
      }
    }    catch (e) {
  _$jscoverage['/io/iframe-transport.js'].lineData[234]++;
  io._ioReady(ERROR_CODE, 'parser error');
}
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[236]++;
    if (visit64_236_1(eventType === 'error')) {
      _$jscoverage['/io/iframe-transport.js'].lineData[237]++;
      io._ioReady(ERROR_CODE, 'error');
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[14]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[242]++;
  this._callback({
  type: 'abort'});
}});
  _$jscoverage['/io/iframe-transport.js'].lineData[248]++;
  IO.setupTransport('iframe', IframeTransport);
  _$jscoverage['/io/iframe-transport.js'].lineData[250]++;
  return IO;
});
