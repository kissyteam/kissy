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
  _$jscoverage['/io/iframe-transport.js'].lineData[10] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[11] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[29] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[30] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[34] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[41] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[47] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[53] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[54] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[59] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[67] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[68] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[71] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[72] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[73] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[74] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[75] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[77] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[78] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[79] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[80] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[81] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[82] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[83] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[86] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[89] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[90] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[93] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[94] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[95] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[98] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[101] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[110] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[118] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[120] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[123] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[132] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[133] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[136] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[137] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[140] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[142] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[143] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[144] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[148] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[149] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[152] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[157] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[167] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[168] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[172] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[173] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[174] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[177] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[180] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[182] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[184] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[186] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[190] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[192] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[194] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[195] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[197] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[199] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[201] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[202] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[214] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[215] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[219] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[221] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[222] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[229] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[233] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[235] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[236] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[241] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[247] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[249] = 0;
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
  _$jscoverage['/io/iframe-transport.js'].branchData['67'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['77'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['80'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['111'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['112'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['132'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['136'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['148'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['167'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['172'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['172'][3] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['192'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['197'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['201'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['214'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['221'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['235'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['235'][1] = new BranchData();
}
_$jscoverage['/io/iframe-transport.js'].branchData['235'][1].init(3315, 21, 'eventType === \'error\'');
function visit65_235_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['221'][1].init(1489, 9, 'iframeDoc');
function visit64_221_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['214'][1].init(1198, 34, 'iframeDoc && iframeDoc.XMLDocument');
function visit63_214_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['201'][1].init(239, 38, 'S.startsWith(io.responseText, \'<?xml\')');
function visit62_201_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['197'][1].init(116, 27, 'iframeDoc && iframeDoc.body');
function visit61_197_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['192'][1].init(996, 20, 'eventType === \'load\'');
function visit60_192_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['172'][3].init(439, 13, 'S.UA.ie === 6');
function visit59_172_3(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['172'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['172'][2].init(414, 21, 'eventType === \'abort\'');
function visit58_172_2(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['172'][1].init(414, 38, 'eventType === \'abort\' && S.UA.ie === 6');
function visit57_172_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['167'][1].init(308, 7, '!iframe');
function visit56_167_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['148'][1].init(1433, 13, 'S.UA.ie === 6');
function visit55_148_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['136'][1].init(1110, 5, 'query');
function visit54_136_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['132'][1].init(1030, 4, 'data');
function visit53_132_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['112'][1].init(81, 30, 'Dom.attr(form, \'action\') || \'\'');
function visit52_112_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['111'][1].init(25, 30, 'Dom.attr(form, \'target\') || \'\'');
function visit51_111_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['80'][1].init(114, 25, 'isArray && serializeArray');
function visit50_80_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['77'][1].init(135, 13, 'i < vs.length');
function visit49_77_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['67'][1].init(503, 31, 'doc.body || doc.documentElement');
function visit48_67_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/iframe-transport.js'].functionData[0]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[7]++;
  var Dom = require('dom'), IO = require('./base'), Event = require('event/dom');
  _$jscoverage['/io/iframe-transport.js'].lineData[10]++;
  var logger = S.getLogger('s/io');
  _$jscoverage['/io/iframe-transport.js'].lineData[11]++;
  var doc = S.Env.host.document, OK_CODE = 200, ERROR_CODE = 500, BREATH_INTERVAL = 30, iframeConverter = S.clone(IO.getConfig().converters.text);
  _$jscoverage['/io/iframe-transport.js'].lineData[29]++;
  iframeConverter.json = function(str) {
  _$jscoverage['/io/iframe-transport.js'].functionData[1]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[30]++;
  return S.parseJson(S.unEscapeHtml(str));
};
  _$jscoverage['/io/iframe-transport.js'].lineData[34]++;
  IO.setupConfig({
  converters: {
  iframe: iframeConverter, 
  text: {
  iframe: function(text) {
  _$jscoverage['/io/iframe-transport.js'].functionData[2]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[41]++;
  return text;
}}, 
  xml: {
  iframe: function(xml) {
  _$jscoverage['/io/iframe-transport.js'].functionData[3]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[47]++;
  return xml;
}}}});
  _$jscoverage['/io/iframe-transport.js'].lineData[53]++;
  function createIframe(xhr) {
    _$jscoverage['/io/iframe-transport.js'].functionData[4]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[54]++;
    var id = S.guid('io-iframe'), iframe, src = Dom.getEmptyIframeSrc();
    _$jscoverage['/io/iframe-transport.js'].lineData[59]++;
    iframe = xhr.iframe = Dom.create('<iframe ' + (src ? (' src="' + src + '" ') : '') + ' id="' + id + '"' + ' name="' + id + '"' + ' style="position:absolute;left:-9999px;top:-9999px;"/>');
    _$jscoverage['/io/iframe-transport.js'].lineData[67]++;
    Dom.prepend(iframe, visit48_67_1(doc.body || doc.documentElement));
    _$jscoverage['/io/iframe-transport.js'].lineData[68]++;
    return iframe;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[71]++;
  function addDataToForm(query, form, serializeArray) {
    _$jscoverage['/io/iframe-transport.js'].functionData[5]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[72]++;
    var ret = [], isArray, vs, i, e;
    _$jscoverage['/io/iframe-transport.js'].lineData[73]++;
    S.each(query, function(data, k) {
  _$jscoverage['/io/iframe-transport.js'].functionData[6]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[74]++;
  isArray = S.isArray(data);
  _$jscoverage['/io/iframe-transport.js'].lineData[75]++;
  vs = S.makeArray(data);
  _$jscoverage['/io/iframe-transport.js'].lineData[77]++;
  for (i = 0; visit49_77_1(i < vs.length); i++) {
    _$jscoverage['/io/iframe-transport.js'].lineData[78]++;
    e = doc.createElement('input');
    _$jscoverage['/io/iframe-transport.js'].lineData[79]++;
    e.type = 'hidden';
    _$jscoverage['/io/iframe-transport.js'].lineData[80]++;
    e.name = k + (visit50_80_1(isArray && serializeArray) ? '[]' : '');
    _$jscoverage['/io/iframe-transport.js'].lineData[81]++;
    e.value = vs[i];
    _$jscoverage['/io/iframe-transport.js'].lineData[82]++;
    Dom.append(e, form);
    _$jscoverage['/io/iframe-transport.js'].lineData[83]++;
    ret.push(e);
  }
});
    _$jscoverage['/io/iframe-transport.js'].lineData[86]++;
    return ret;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[89]++;
  function removeFieldsFromData(fields) {
    _$jscoverage['/io/iframe-transport.js'].functionData[7]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[90]++;
    Dom.remove(fields);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[93]++;
  function IframeTransport(io) {
    _$jscoverage['/io/iframe-transport.js'].functionData[8]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[94]++;
    this.io = io;
    _$jscoverage['/io/iframe-transport.js'].lineData[95]++;
    logger.info('use IframeTransport for: ' + io.config.url);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[98]++;
  S.augment(IframeTransport, {
  send: function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[9]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[101]++;
  var self = this, io = self.io, c = io.config, fields, iframe, query, data = c.data, form = Dom.get(c.form);
  _$jscoverage['/io/iframe-transport.js'].lineData[110]++;
  self.attrs = {
  target: visit51_111_1(Dom.attr(form, 'target') || ''), 
  action: visit52_112_1(Dom.attr(form, 'action') || ''), 
  encoding: Dom.attr(form, 'encoding'), 
  enctype: Dom.attr(form, 'enctype'), 
  method: Dom.attr(form, 'method')};
  _$jscoverage['/io/iframe-transport.js'].lineData[118]++;
  self.form = form;
  _$jscoverage['/io/iframe-transport.js'].lineData[120]++;
  iframe = createIframe(io);
  _$jscoverage['/io/iframe-transport.js'].lineData[123]++;
  Dom.attr(form, {
  target: iframe.id, 
  action: io._getUrlForSend(), 
  method: 'post', 
  enctype: 'multipart/form-data', 
  encoding: 'multipart/form-data'});
  _$jscoverage['/io/iframe-transport.js'].lineData[132]++;
  if (visit53_132_1(data)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[133]++;
    query = S.unparam(data);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[136]++;
  if (visit54_136_1(query)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[137]++;
    fields = addDataToForm(query, form, c.serializeArray);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[140]++;
  self.fields = fields;
  _$jscoverage['/io/iframe-transport.js'].lineData[142]++;
  function go() {
    _$jscoverage['/io/iframe-transport.js'].functionData[10]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[143]++;
    Event.on(iframe, 'load error', self._callback, self);
    _$jscoverage['/io/iframe-transport.js'].lineData[144]++;
    form.submit();
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[148]++;
  if (visit55_148_1(S.UA.ie === 6)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[149]++;
    setTimeout(go, 0);
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[152]++;
    go();
  }
}, 
  _callback: function(event) {
  _$jscoverage['/io/iframe-transport.js'].functionData[11]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[157]++;
  var self = this, form = self.form, io = self.io, eventType = event.type, iframeDoc, iframe = io.iframe;
  _$jscoverage['/io/iframe-transport.js'].lineData[167]++;
  if (visit56_167_1(!iframe)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[168]++;
    return;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[172]++;
  if (visit57_172_1(visit58_172_2(eventType === 'abort') && visit59_172_3(S.UA.ie === 6))) {
    _$jscoverage['/io/iframe-transport.js'].lineData[173]++;
    setTimeout(function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[12]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[174]++;
  Dom.attr(form, self.attrs);
}, 0);
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[177]++;
    Dom.attr(form, self.attrs);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[180]++;
  removeFieldsFromData(this.fields);
  _$jscoverage['/io/iframe-transport.js'].lineData[182]++;
  Event.detach(iframe);
  _$jscoverage['/io/iframe-transport.js'].lineData[184]++;
  setTimeout(function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[13]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[186]++;
  Dom.remove(iframe);
}, BREATH_INTERVAL);
  _$jscoverage['/io/iframe-transport.js'].lineData[190]++;
  io.iframe = null;
  _$jscoverage['/io/iframe-transport.js'].lineData[192]++;
  if (visit60_192_1(eventType === 'load')) {
    _$jscoverage['/io/iframe-transport.js'].lineData[194]++;
    try {
      _$jscoverage['/io/iframe-transport.js'].lineData[195]++;
      iframeDoc = iframe.contentWindow.document;
      _$jscoverage['/io/iframe-transport.js'].lineData[197]++;
      if (visit61_197_1(iframeDoc && iframeDoc.body)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[199]++;
        io.responseText = Dom.html(iframeDoc.body);
        _$jscoverage['/io/iframe-transport.js'].lineData[201]++;
        if (visit62_201_1(S.startsWith(io.responseText, '<?xml'))) {
          _$jscoverage['/io/iframe-transport.js'].lineData[202]++;
          io.responseText = undefined;
        }
      }
      _$jscoverage['/io/iframe-transport.js'].lineData[214]++;
      if (visit63_214_1(iframeDoc && iframeDoc.XMLDocument)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[215]++;
        io.responseXML = iframeDoc.XMLDocument;
      } else {
        _$jscoverage['/io/iframe-transport.js'].lineData[219]++;
        io.responseXML = iframeDoc;
      }
      _$jscoverage['/io/iframe-transport.js'].lineData[221]++;
      if (visit64_221_1(iframeDoc)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[222]++;
        io._ioReady(OK_CODE, 'success');
      } else {
        _$jscoverage['/io/iframe-transport.js'].lineData[229]++;
        io._ioReady(ERROR_CODE, 'parser error');
      }
    }    catch (e) {
  _$jscoverage['/io/iframe-transport.js'].lineData[233]++;
  io._ioReady(ERROR_CODE, 'parser error');
}
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[235]++;
    if (visit65_235_1(eventType === 'error')) {
      _$jscoverage['/io/iframe-transport.js'].lineData[236]++;
      io._ioReady(ERROR_CODE, 'error');
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[14]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[241]++;
  this._callback({
  type: 'abort'});
}});
  _$jscoverage['/io/iframe-transport.js'].lineData[247]++;
  IO.setupTransport('iframe', IframeTransport);
  _$jscoverage['/io/iframe-transport.js'].lineData[249]++;
  return IO;
});
