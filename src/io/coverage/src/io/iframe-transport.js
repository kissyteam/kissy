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
  _$jscoverage['/io/iframe-transport.js'].lineData[24] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[25] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[29] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[36] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[42] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[48] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[49] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[54] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[62] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[63] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[66] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[67] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[68] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[69] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[70] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[72] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[73] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[74] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[75] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[76] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[77] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[78] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[81] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[84] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[85] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[88] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[89] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[90] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[93] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[96] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[105] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[113] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[115] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[118] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[127] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[128] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[131] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[132] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[135] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[137] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[138] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[139] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[143] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[144] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[147] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[152] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[162] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[163] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[167] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[168] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[169] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[172] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[175] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[177] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[179] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[181] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[185] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[187] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[189] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[190] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[192] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[194] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[196] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[197] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[209] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[210] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[214] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[216] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[217] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[224] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[228] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[230] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[231] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[236] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[242] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[244] = 0;
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
  _$jscoverage['/io/iframe-transport.js'].branchData['62'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['72'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['75'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['106'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['107'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['127'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['131'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['143'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['162'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['167'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['167'][2] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['167'][3] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['187'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['192'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['196'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['209'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['216'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['230'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['230'][1] = new BranchData();
}
_$jscoverage['/io/iframe-transport.js'].branchData['230'][1].init(3397, 20, 'eventType == \'error\'');
function visit65_230_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['216'][1].init(1522, 9, 'iframeDoc');
function visit64_216_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['209'][1].init(1218, 37, 'iframeDoc && iframeDoc[\'XMLDocument\']');
function visit63_209_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['196'][1].init(243, 38, 'S.startsWith(io.responseText, \'<?xml\')');
function visit62_196_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['192'][1].init(119, 27, 'iframeDoc && iframeDoc.body');
function visit61_192_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['187'][1].init(1030, 19, 'eventType == \'load\'');
function visit60_187_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['167'][3].init(454, 12, 'S.UA.ie == 6');
function visit59_167_3(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['167'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['167'][2].init(430, 20, 'eventType == \'abort\'');
function visit58_167_2(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['167'][1].init(430, 36, 'eventType == \'abort\' && S.UA.ie == 6');
function visit57_167_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['162'][1].init(319, 7, '!iframe');
function visit56_162_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['143'][1].init(1478, 12, 'S.UA.ie == 6');
function visit55_143_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['131'][1].init(1143, 5, 'query');
function visit54_131_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['127'][1].init(1059, 4, 'data');
function visit53_127_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['107'][1].init(83, 30, 'Dom.attr(form, \'action\') || \'\'');
function visit52_107_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['106'][1].init(26, 30, 'Dom.attr(form, \'target\') || \'\'');
function visit51_106_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['75'][1].init(117, 25, 'isArray && serializeArray');
function visit50_75_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['72'][1].init(139, 13, 'i < vs.length');
function visit49_72_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['62'][1].init(517, 31, 'doc.body || doc.documentElement');
function visit48_62_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].lineData[6]++;
KISSY.add('io/iframe-transport', function(S, Dom, Event, IO) {
  _$jscoverage['/io/iframe-transport.js'].functionData[0]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[7]++;
  var doc = S.Env.host.document, OK_CODE = 200, ERROR_CODE = 500, BREATH_INTERVAL = 30, iframeConverter = S.clone(IO.getConfig().converters.text);
  _$jscoverage['/io/iframe-transport.js'].lineData[24]++;
  iframeConverter.json = function(str) {
  _$jscoverage['/io/iframe-transport.js'].functionData[1]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[25]++;
  return S.parseJson(S.unEscapeHtml(str));
};
  _$jscoverage['/io/iframe-transport.js'].lineData[29]++;
  IO.setupConfig({
  converters: {
  iframe: iframeConverter, 
  text: {
  iframe: function(text) {
  _$jscoverage['/io/iframe-transport.js'].functionData[2]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[36]++;
  return text;
}}, 
  xml: {
  iframe: function(xml) {
  _$jscoverage['/io/iframe-transport.js'].functionData[3]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[42]++;
  return xml;
}}}});
  _$jscoverage['/io/iframe-transport.js'].lineData[48]++;
  function createIframe(xhr) {
    _$jscoverage['/io/iframe-transport.js'].functionData[4]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[49]++;
    var id = S.guid('io-iframe'), iframe, src = Dom.getEmptyIframeSrc();
    _$jscoverage['/io/iframe-transport.js'].lineData[54]++;
    iframe = xhr.iframe = Dom.create('<iframe ' + (src ? (' src="' + src + '" ') : '') + ' id="' + id + '"' + ' name="' + id + '"' + ' style="position:absolute;left:-9999px;top:-9999px;"/>');
    _$jscoverage['/io/iframe-transport.js'].lineData[62]++;
    Dom.prepend(iframe, visit48_62_1(doc.body || doc.documentElement));
    _$jscoverage['/io/iframe-transport.js'].lineData[63]++;
    return iframe;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[66]++;
  function addDataToForm(query, form, serializeArray) {
    _$jscoverage['/io/iframe-transport.js'].functionData[5]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[67]++;
    var ret = [], isArray, vs, i, e;
    _$jscoverage['/io/iframe-transport.js'].lineData[68]++;
    S.each(query, function(data, k) {
  _$jscoverage['/io/iframe-transport.js'].functionData[6]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[69]++;
  isArray = S.isArray(data);
  _$jscoverage['/io/iframe-transport.js'].lineData[70]++;
  vs = S.makeArray(data);
  _$jscoverage['/io/iframe-transport.js'].lineData[72]++;
  for (i = 0; visit49_72_1(i < vs.length); i++) {
    _$jscoverage['/io/iframe-transport.js'].lineData[73]++;
    e = doc.createElement('input');
    _$jscoverage['/io/iframe-transport.js'].lineData[74]++;
    e.type = 'hidden';
    _$jscoverage['/io/iframe-transport.js'].lineData[75]++;
    e.name = k + (visit50_75_1(isArray && serializeArray) ? '[]' : '');
    _$jscoverage['/io/iframe-transport.js'].lineData[76]++;
    e.value = vs[i];
    _$jscoverage['/io/iframe-transport.js'].lineData[77]++;
    Dom.append(e, form);
    _$jscoverage['/io/iframe-transport.js'].lineData[78]++;
    ret.push(e);
  }
});
    _$jscoverage['/io/iframe-transport.js'].lineData[81]++;
    return ret;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[84]++;
  function removeFieldsFromData(fields) {
    _$jscoverage['/io/iframe-transport.js'].functionData[7]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[85]++;
    Dom.remove(fields);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[88]++;
  function IframeTransport(io) {
    _$jscoverage['/io/iframe-transport.js'].functionData[8]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[89]++;
    this.io = io;
    _$jscoverage['/io/iframe-transport.js'].lineData[90]++;
    S.log('use IframeTransport for: ' + io.config.url);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[93]++;
  S.augment(IframeTransport, {
  send: function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[9]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[96]++;
  var self = this, io = self.io, c = io.config, fields, iframe, query, data = c.data, form = Dom.get(c.form);
  _$jscoverage['/io/iframe-transport.js'].lineData[105]++;
  self.attrs = {
  target: visit51_106_1(Dom.attr(form, 'target') || ''), 
  action: visit52_107_1(Dom.attr(form, 'action') || ''), 
  encoding: Dom.attr(form, 'encoding'), 
  enctype: Dom.attr(form, 'enctype'), 
  method: Dom.attr(form, 'method')};
  _$jscoverage['/io/iframe-transport.js'].lineData[113]++;
  self.form = form;
  _$jscoverage['/io/iframe-transport.js'].lineData[115]++;
  iframe = createIframe(io);
  _$jscoverage['/io/iframe-transport.js'].lineData[118]++;
  Dom.attr(form, {
  target: iframe.id, 
  action: io._getUrlForSend(), 
  method: 'post', 
  enctype: 'multipart/form-data', 
  encoding: 'multipart/form-data'});
  _$jscoverage['/io/iframe-transport.js'].lineData[127]++;
  if (visit53_127_1(data)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[128]++;
    query = S.unparam(data);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[131]++;
  if (visit54_131_1(query)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[132]++;
    fields = addDataToForm(query, form, c.serializeArray);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[135]++;
  self.fields = fields;
  _$jscoverage['/io/iframe-transport.js'].lineData[137]++;
  function go() {
    _$jscoverage['/io/iframe-transport.js'].functionData[10]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[138]++;
    Event.on(iframe, 'load error', self._callback, self);
    _$jscoverage['/io/iframe-transport.js'].lineData[139]++;
    form.submit();
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[143]++;
  if (visit55_143_1(S.UA.ie == 6)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[144]++;
    setTimeout(go, 0);
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[147]++;
    go();
  }
}, 
  _callback: function(event) {
  _$jscoverage['/io/iframe-transport.js'].functionData[11]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[152]++;
  var self = this, form = self.form, io = self.io, eventType = event.type, iframeDoc, iframe = io.iframe;
  _$jscoverage['/io/iframe-transport.js'].lineData[162]++;
  if (visit56_162_1(!iframe)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[163]++;
    return;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[167]++;
  if (visit57_167_1(visit58_167_2(eventType == 'abort') && visit59_167_3(S.UA.ie == 6))) {
    _$jscoverage['/io/iframe-transport.js'].lineData[168]++;
    setTimeout(function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[12]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[169]++;
  Dom.attr(form, self.attrs);
}, 0);
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[172]++;
    Dom.attr(form, self.attrs);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[175]++;
  removeFieldsFromData(this.fields);
  _$jscoverage['/io/iframe-transport.js'].lineData[177]++;
  Event.detach(iframe);
  _$jscoverage['/io/iframe-transport.js'].lineData[179]++;
  setTimeout(function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[13]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[181]++;
  Dom.remove(iframe);
}, BREATH_INTERVAL);
  _$jscoverage['/io/iframe-transport.js'].lineData[185]++;
  io.iframe = null;
  _$jscoverage['/io/iframe-transport.js'].lineData[187]++;
  if (visit60_187_1(eventType == 'load')) {
    _$jscoverage['/io/iframe-transport.js'].lineData[189]++;
    try {
      _$jscoverage['/io/iframe-transport.js'].lineData[190]++;
      iframeDoc = iframe.contentWindow.document;
      _$jscoverage['/io/iframe-transport.js'].lineData[192]++;
      if (visit61_192_1(iframeDoc && iframeDoc.body)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[194]++;
        io.responseText = Dom.html(iframeDoc.body);
        _$jscoverage['/io/iframe-transport.js'].lineData[196]++;
        if (visit62_196_1(S.startsWith(io.responseText, '<?xml'))) {
          _$jscoverage['/io/iframe-transport.js'].lineData[197]++;
          io.responseText = undefined;
        }
      }
      _$jscoverage['/io/iframe-transport.js'].lineData[209]++;
      if (visit63_209_1(iframeDoc && iframeDoc['XMLDocument'])) {
        _$jscoverage['/io/iframe-transport.js'].lineData[210]++;
        io.responseXML = iframeDoc['XMLDocument'];
      } else {
        _$jscoverage['/io/iframe-transport.js'].lineData[214]++;
        io.responseXML = iframeDoc;
      }
      _$jscoverage['/io/iframe-transport.js'].lineData[216]++;
      if (visit64_216_1(iframeDoc)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[217]++;
        io._ioReady(OK_CODE, 'success');
      } else {
        _$jscoverage['/io/iframe-transport.js'].lineData[224]++;
        io._ioReady(ERROR_CODE, 'parser error');
      }
    }    catch (e) {
  _$jscoverage['/io/iframe-transport.js'].lineData[228]++;
  io._ioReady(ERROR_CODE, 'parser error');
}
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[230]++;
    if (visit65_230_1(eventType == 'error')) {
      _$jscoverage['/io/iframe-transport.js'].lineData[231]++;
      io._ioReady(ERROR_CODE, 'error');
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[14]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[236]++;
  this._callback({
  type: 'abort'});
}});
  _$jscoverage['/io/iframe-transport.js'].lineData[242]++;
  IO['setupTransport']('iframe', IframeTransport);
  _$jscoverage['/io/iframe-transport.js'].lineData[244]++;
  return IO;
}, {
  requires: ['dom', 'event', './base']});
