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
  _$jscoverage['/io/iframe-transport.js'].lineData[25] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[26] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[30] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[37] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[43] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[49] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[50] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[55] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[63] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[64] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[67] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[68] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[69] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[70] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[71] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[73] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[74] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[75] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[76] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[77] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[78] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[79] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[82] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[85] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[86] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[89] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[90] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[91] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[94] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[97] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[106] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[114] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[116] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[119] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[128] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[129] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[132] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[133] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[136] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[138] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[139] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[140] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[144] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[145] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[148] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[153] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[163] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[164] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[168] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[169] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[170] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[173] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[176] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[178] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[180] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[182] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[186] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[188] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[190] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[191] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[193] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[195] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[197] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[198] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[210] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[211] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[215] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[217] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[218] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[225] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[229] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[231] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[232] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[237] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[243] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[245] = 0;
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
  _$jscoverage['/io/iframe-transport.js'].branchData['63'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['73'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['76'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['107'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['108'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['128'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['132'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['144'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['163'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['168'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['168'][2] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['168'][3] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['188'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['193'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['197'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['210'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['217'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['231'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['231'][1] = new BranchData();
}
_$jscoverage['/io/iframe-transport.js'].branchData['231'][1].init(3397, 20, 'eventType == \'error\'');
function visit65_231_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['217'][1].init(1522, 9, 'iframeDoc');
function visit64_217_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['210'][1].init(1218, 37, 'iframeDoc && iframeDoc[\'XMLDocument\']');
function visit63_210_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['197'][1].init(243, 38, 'S.startsWith(io.responseText, \'<?xml\')');
function visit62_197_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['193'][1].init(119, 27, 'iframeDoc && iframeDoc.body');
function visit61_193_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['188'][1].init(1030, 19, 'eventType == \'load\'');
function visit60_188_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['168'][3].init(454, 12, 'S.UA.ie == 6');
function visit59_168_3(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['168'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['168'][2].init(430, 20, 'eventType == \'abort\'');
function visit58_168_2(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['168'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['168'][1].init(430, 36, 'eventType == \'abort\' && S.UA.ie == 6');
function visit57_168_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['163'][1].init(319, 7, '!iframe');
function visit56_163_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['144'][1].init(1478, 12, 'S.UA.ie == 6');
function visit55_144_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['132'][1].init(1143, 5, 'query');
function visit54_132_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['128'][1].init(1059, 4, 'data');
function visit53_128_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['108'][1].init(83, 30, 'Dom.attr(form, \'action\') || \'\'');
function visit52_108_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['107'][1].init(26, 30, 'Dom.attr(form, \'target\') || \'\'');
function visit51_107_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['76'][1].init(117, 25, 'isArray && serializeArray');
function visit50_76_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['73'][1].init(139, 13, 'i < vs.length');
function visit49_73_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['63'][1].init(517, 31, 'doc.body || doc.documentElement');
function visit48_63_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].lineData[6]++;
KISSY.add('io/iframe-transport', function(S, Dom, Event, IO) {
  _$jscoverage['/io/iframe-transport.js'].functionData[0]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[7]++;
  var doc = S.Env.host.document, OK_CODE = 200, logger = S.getLogger('s/io'), ERROR_CODE = 500, BREATH_INTERVAL = 30, iframeConverter = S.clone(IO.getConfig().converters.text);
  _$jscoverage['/io/iframe-transport.js'].lineData[25]++;
  iframeConverter.json = function(str) {
  _$jscoverage['/io/iframe-transport.js'].functionData[1]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[26]++;
  return S.parseJson(S.unEscapeHtml(str));
};
  _$jscoverage['/io/iframe-transport.js'].lineData[30]++;
  IO.setupConfig({
  converters: {
  iframe: iframeConverter, 
  text: {
  iframe: function(text) {
  _$jscoverage['/io/iframe-transport.js'].functionData[2]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[37]++;
  return text;
}}, 
  xml: {
  iframe: function(xml) {
  _$jscoverage['/io/iframe-transport.js'].functionData[3]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[43]++;
  return xml;
}}}});
  _$jscoverage['/io/iframe-transport.js'].lineData[49]++;
  function createIframe(xhr) {
    _$jscoverage['/io/iframe-transport.js'].functionData[4]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[50]++;
    var id = S.guid('io-iframe'), iframe, src = Dom.getEmptyIframeSrc();
    _$jscoverage['/io/iframe-transport.js'].lineData[55]++;
    iframe = xhr.iframe = Dom.create('<iframe ' + (src ? (' src="' + src + '" ') : '') + ' id="' + id + '"' + ' name="' + id + '"' + ' style="position:absolute;left:-9999px;top:-9999px;"/>');
    _$jscoverage['/io/iframe-transport.js'].lineData[63]++;
    Dom.prepend(iframe, visit48_63_1(doc.body || doc.documentElement));
    _$jscoverage['/io/iframe-transport.js'].lineData[64]++;
    return iframe;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[67]++;
  function addDataToForm(query, form, serializeArray) {
    _$jscoverage['/io/iframe-transport.js'].functionData[5]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[68]++;
    var ret = [], isArray, vs, i, e;
    _$jscoverage['/io/iframe-transport.js'].lineData[69]++;
    S.each(query, function(data, k) {
  _$jscoverage['/io/iframe-transport.js'].functionData[6]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[70]++;
  isArray = S.isArray(data);
  _$jscoverage['/io/iframe-transport.js'].lineData[71]++;
  vs = S.makeArray(data);
  _$jscoverage['/io/iframe-transport.js'].lineData[73]++;
  for (i = 0; visit49_73_1(i < vs.length); i++) {
    _$jscoverage['/io/iframe-transport.js'].lineData[74]++;
    e = doc.createElement('input');
    _$jscoverage['/io/iframe-transport.js'].lineData[75]++;
    e.type = 'hidden';
    _$jscoverage['/io/iframe-transport.js'].lineData[76]++;
    e.name = k + (visit50_76_1(isArray && serializeArray) ? '[]' : '');
    _$jscoverage['/io/iframe-transport.js'].lineData[77]++;
    e.value = vs[i];
    _$jscoverage['/io/iframe-transport.js'].lineData[78]++;
    Dom.append(e, form);
    _$jscoverage['/io/iframe-transport.js'].lineData[79]++;
    ret.push(e);
  }
});
    _$jscoverage['/io/iframe-transport.js'].lineData[82]++;
    return ret;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[85]++;
  function removeFieldsFromData(fields) {
    _$jscoverage['/io/iframe-transport.js'].functionData[7]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[86]++;
    Dom.remove(fields);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[89]++;
  function IframeTransport(io) {
    _$jscoverage['/io/iframe-transport.js'].functionData[8]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[90]++;
    this.io = io;
    _$jscoverage['/io/iframe-transport.js'].lineData[91]++;
    logger.info('use IframeTransport for: ' + io.config.url);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[94]++;
  S.augment(IframeTransport, {
  send: function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[9]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[97]++;
  var self = this, io = self.io, c = io.config, fields, iframe, query, data = c.data, form = Dom.get(c.form);
  _$jscoverage['/io/iframe-transport.js'].lineData[106]++;
  self.attrs = {
  target: visit51_107_1(Dom.attr(form, 'target') || ''), 
  action: visit52_108_1(Dom.attr(form, 'action') || ''), 
  encoding: Dom.attr(form, 'encoding'), 
  enctype: Dom.attr(form, 'enctype'), 
  method: Dom.attr(form, 'method')};
  _$jscoverage['/io/iframe-transport.js'].lineData[114]++;
  self.form = form;
  _$jscoverage['/io/iframe-transport.js'].lineData[116]++;
  iframe = createIframe(io);
  _$jscoverage['/io/iframe-transport.js'].lineData[119]++;
  Dom.attr(form, {
  target: iframe.id, 
  action: io._getUrlForSend(), 
  method: 'post', 
  enctype: 'multipart/form-data', 
  encoding: 'multipart/form-data'});
  _$jscoverage['/io/iframe-transport.js'].lineData[128]++;
  if (visit53_128_1(data)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[129]++;
    query = S.unparam(data);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[132]++;
  if (visit54_132_1(query)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[133]++;
    fields = addDataToForm(query, form, c.serializeArray);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[136]++;
  self.fields = fields;
  _$jscoverage['/io/iframe-transport.js'].lineData[138]++;
  function go() {
    _$jscoverage['/io/iframe-transport.js'].functionData[10]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[139]++;
    Event.on(iframe, 'load error', self._callback, self);
    _$jscoverage['/io/iframe-transport.js'].lineData[140]++;
    form.submit();
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[144]++;
  if (visit55_144_1(S.UA.ie == 6)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[145]++;
    setTimeout(go, 0);
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[148]++;
    go();
  }
}, 
  _callback: function(event) {
  _$jscoverage['/io/iframe-transport.js'].functionData[11]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[153]++;
  var self = this, form = self.form, io = self.io, eventType = event.type, iframeDoc, iframe = io.iframe;
  _$jscoverage['/io/iframe-transport.js'].lineData[163]++;
  if (visit56_163_1(!iframe)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[164]++;
    return;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[168]++;
  if (visit57_168_1(visit58_168_2(eventType == 'abort') && visit59_168_3(S.UA.ie == 6))) {
    _$jscoverage['/io/iframe-transport.js'].lineData[169]++;
    setTimeout(function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[12]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[170]++;
  Dom.attr(form, self.attrs);
}, 0);
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[173]++;
    Dom.attr(form, self.attrs);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[176]++;
  removeFieldsFromData(this.fields);
  _$jscoverage['/io/iframe-transport.js'].lineData[178]++;
  Event.detach(iframe);
  _$jscoverage['/io/iframe-transport.js'].lineData[180]++;
  setTimeout(function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[13]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[182]++;
  Dom.remove(iframe);
}, BREATH_INTERVAL);
  _$jscoverage['/io/iframe-transport.js'].lineData[186]++;
  io.iframe = null;
  _$jscoverage['/io/iframe-transport.js'].lineData[188]++;
  if (visit60_188_1(eventType == 'load')) {
    _$jscoverage['/io/iframe-transport.js'].lineData[190]++;
    try {
      _$jscoverage['/io/iframe-transport.js'].lineData[191]++;
      iframeDoc = iframe.contentWindow.document;
      _$jscoverage['/io/iframe-transport.js'].lineData[193]++;
      if (visit61_193_1(iframeDoc && iframeDoc.body)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[195]++;
        io.responseText = Dom.html(iframeDoc.body);
        _$jscoverage['/io/iframe-transport.js'].lineData[197]++;
        if (visit62_197_1(S.startsWith(io.responseText, '<?xml'))) {
          _$jscoverage['/io/iframe-transport.js'].lineData[198]++;
          io.responseText = undefined;
        }
      }
      _$jscoverage['/io/iframe-transport.js'].lineData[210]++;
      if (visit63_210_1(iframeDoc && iframeDoc['XMLDocument'])) {
        _$jscoverage['/io/iframe-transport.js'].lineData[211]++;
        io.responseXML = iframeDoc['XMLDocument'];
      } else {
        _$jscoverage['/io/iframe-transport.js'].lineData[215]++;
        io.responseXML = iframeDoc;
      }
      _$jscoverage['/io/iframe-transport.js'].lineData[217]++;
      if (visit64_217_1(iframeDoc)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[218]++;
        io._ioReady(OK_CODE, 'success');
      } else {
        _$jscoverage['/io/iframe-transport.js'].lineData[225]++;
        io._ioReady(ERROR_CODE, 'parser error');
      }
    }    catch (e) {
  _$jscoverage['/io/iframe-transport.js'].lineData[229]++;
  io._ioReady(ERROR_CODE, 'parser error');
}
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[231]++;
    if (visit65_231_1(eventType == 'error')) {
      _$jscoverage['/io/iframe-transport.js'].lineData[232]++;
      io._ioReady(ERROR_CODE, 'error');
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[14]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[237]++;
  this._callback({
  type: 'abort'});
}});
  _$jscoverage['/io/iframe-transport.js'].lineData[243]++;
  IO['setupTransport']('iframe', IframeTransport);
  _$jscoverage['/io/iframe-transport.js'].lineData[245]++;
  return IO;
}, {
  requires: ['dom', 'event', './base']});
