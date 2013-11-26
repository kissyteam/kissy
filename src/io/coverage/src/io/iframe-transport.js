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
  _$jscoverage['/io/iframe-transport.js'].lineData[28] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[29] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[33] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[40] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[46] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[52] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[53] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[58] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[66] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[67] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[70] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[71] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[72] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[73] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[74] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[76] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[77] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[78] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[79] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[80] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[81] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[82] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[85] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[88] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[89] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[92] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[93] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[94] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[97] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[100] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[109] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[117] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[119] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[122] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[131] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[132] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[135] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[136] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[139] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[141] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[142] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[143] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[147] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[148] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[151] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[156] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[166] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[167] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[171] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[172] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[173] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[176] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[179] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[181] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[183] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[185] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[189] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[191] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[193] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[194] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[196] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[198] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[200] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[201] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[213] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[214] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[218] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[220] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[221] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[228] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[232] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[234] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[235] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[240] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[246] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[248] = 0;
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
  _$jscoverage['/io/iframe-transport.js'].branchData['66'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['76'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['79'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['110'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['111'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['131'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['135'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['147'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['166'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['171'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['171'][2] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['171'][3] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['191'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['196'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['200'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['213'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['220'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['234'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['234'][1] = new BranchData();
}
_$jscoverage['/io/iframe-transport.js'].branchData['234'][1].init(3318, 20, 'eventType == \'error\'');
function visit63_234_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['220'][1].init(1495, 9, 'iframeDoc');
function visit62_220_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['213'][1].init(1198, 37, 'iframeDoc && iframeDoc[\'XMLDocument\']');
function visit61_213_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['200'][1].init(239, 38, 'S.startsWith(io.responseText, \'<?xml\')');
function visit60_200_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['196'][1].init(116, 27, 'iframeDoc && iframeDoc.body');
function visit59_196_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['191'][1].init(994, 19, 'eventType == \'load\'');
function visit58_191_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['171'][3].init(438, 12, 'S.UA.ie == 6');
function visit57_171_3(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['171'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['171'][2].init(414, 20, 'eventType == \'abort\'');
function visit56_171_2(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['171'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['171'][1].init(414, 36, 'eventType == \'abort\' && S.UA.ie == 6');
function visit55_171_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['166'][1].init(308, 7, '!iframe');
function visit54_166_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['147'][1].init(1433, 12, 'S.UA.ie == 6');
function visit53_147_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['135'][1].init(1110, 5, 'query');
function visit52_135_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['131'][1].init(1030, 4, 'data');
function visit51_131_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['111'][1].init(81, 30, 'Dom.attr(form, \'action\') || \'\'');
function visit50_111_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['110'][1].init(25, 30, 'Dom.attr(form, \'target\') || \'\'');
function visit49_110_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['79'][1].init(114, 25, 'isArray && serializeArray');
function visit48_79_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['76'][1].init(135, 13, 'i < vs.length');
function visit47_76_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['66'][1].init(503, 31, 'doc.body || doc.documentElement');
function visit46_66_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/iframe-transport.js'].functionData[0]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[7]++;
  var Dom = require('dom'), IO = require('./base'), Event = require('event/dom');
  _$jscoverage['/io/iframe-transport.js'].lineData[10]++;
  var doc = S.Env.host.document, OK_CODE = 200, logger = S.getLogger('s/io'), ERROR_CODE = 500, BREATH_INTERVAL = 30, iframeConverter = S.clone(IO.getConfig().converters.text);
  _$jscoverage['/io/iframe-transport.js'].lineData[28]++;
  iframeConverter.json = function(str) {
  _$jscoverage['/io/iframe-transport.js'].functionData[1]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[29]++;
  return S.parseJson(S.unEscapeHtml(str));
};
  _$jscoverage['/io/iframe-transport.js'].lineData[33]++;
  IO.setupConfig({
  converters: {
  iframe: iframeConverter, 
  text: {
  iframe: function(text) {
  _$jscoverage['/io/iframe-transport.js'].functionData[2]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[40]++;
  return text;
}}, 
  xml: {
  iframe: function(xml) {
  _$jscoverage['/io/iframe-transport.js'].functionData[3]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[46]++;
  return xml;
}}}});
  _$jscoverage['/io/iframe-transport.js'].lineData[52]++;
  function createIframe(xhr) {
    _$jscoverage['/io/iframe-transport.js'].functionData[4]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[53]++;
    var id = S.guid('io-iframe'), iframe, src = Dom.getEmptyIframeSrc();
    _$jscoverage['/io/iframe-transport.js'].lineData[58]++;
    iframe = xhr.iframe = Dom.create('<iframe ' + (src ? (' src="' + src + '" ') : '') + ' id="' + id + '"' + ' name="' + id + '"' + ' style="position:absolute;left:-9999px;top:-9999px;"/>');
    _$jscoverage['/io/iframe-transport.js'].lineData[66]++;
    Dom.prepend(iframe, visit46_66_1(doc.body || doc.documentElement));
    _$jscoverage['/io/iframe-transport.js'].lineData[67]++;
    return iframe;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[70]++;
  function addDataToForm(query, form, serializeArray) {
    _$jscoverage['/io/iframe-transport.js'].functionData[5]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[71]++;
    var ret = [], isArray, vs, i, e;
    _$jscoverage['/io/iframe-transport.js'].lineData[72]++;
    S.each(query, function(data, k) {
  _$jscoverage['/io/iframe-transport.js'].functionData[6]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[73]++;
  isArray = S.isArray(data);
  _$jscoverage['/io/iframe-transport.js'].lineData[74]++;
  vs = S.makeArray(data);
  _$jscoverage['/io/iframe-transport.js'].lineData[76]++;
  for (i = 0; visit47_76_1(i < vs.length); i++) {
    _$jscoverage['/io/iframe-transport.js'].lineData[77]++;
    e = doc.createElement('input');
    _$jscoverage['/io/iframe-transport.js'].lineData[78]++;
    e.type = 'hidden';
    _$jscoverage['/io/iframe-transport.js'].lineData[79]++;
    e.name = k + (visit48_79_1(isArray && serializeArray) ? '[]' : '');
    _$jscoverage['/io/iframe-transport.js'].lineData[80]++;
    e.value = vs[i];
    _$jscoverage['/io/iframe-transport.js'].lineData[81]++;
    Dom.append(e, form);
    _$jscoverage['/io/iframe-transport.js'].lineData[82]++;
    ret.push(e);
  }
});
    _$jscoverage['/io/iframe-transport.js'].lineData[85]++;
    return ret;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[88]++;
  function removeFieldsFromData(fields) {
    _$jscoverage['/io/iframe-transport.js'].functionData[7]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[89]++;
    Dom.remove(fields);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[92]++;
  function IframeTransport(io) {
    _$jscoverage['/io/iframe-transport.js'].functionData[8]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[93]++;
    this.io = io;
    _$jscoverage['/io/iframe-transport.js'].lineData[94]++;
    logger.info('use IframeTransport for: ' + io.config.url);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[97]++;
  S.augment(IframeTransport, {
  send: function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[9]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[100]++;
  var self = this, io = self.io, c = io.config, fields, iframe, query, data = c.data, form = Dom.get(c.form);
  _$jscoverage['/io/iframe-transport.js'].lineData[109]++;
  self.attrs = {
  target: visit49_110_1(Dom.attr(form, 'target') || ''), 
  action: visit50_111_1(Dom.attr(form, 'action') || ''), 
  encoding: Dom.attr(form, 'encoding'), 
  enctype: Dom.attr(form, 'enctype'), 
  method: Dom.attr(form, 'method')};
  _$jscoverage['/io/iframe-transport.js'].lineData[117]++;
  self.form = form;
  _$jscoverage['/io/iframe-transport.js'].lineData[119]++;
  iframe = createIframe(io);
  _$jscoverage['/io/iframe-transport.js'].lineData[122]++;
  Dom.attr(form, {
  target: iframe.id, 
  action: io._getUrlForSend(), 
  method: 'post', 
  enctype: 'multipart/form-data', 
  encoding: 'multipart/form-data'});
  _$jscoverage['/io/iframe-transport.js'].lineData[131]++;
  if (visit51_131_1(data)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[132]++;
    query = S.unparam(data);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[135]++;
  if (visit52_135_1(query)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[136]++;
    fields = addDataToForm(query, form, c.serializeArray);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[139]++;
  self.fields = fields;
  _$jscoverage['/io/iframe-transport.js'].lineData[141]++;
  function go() {
    _$jscoverage['/io/iframe-transport.js'].functionData[10]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[142]++;
    Event.on(iframe, 'load error', self._callback, self);
    _$jscoverage['/io/iframe-transport.js'].lineData[143]++;
    form.submit();
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[147]++;
  if (visit53_147_1(S.UA.ie == 6)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[148]++;
    setTimeout(go, 0);
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[151]++;
    go();
  }
}, 
  _callback: function(event) {
  _$jscoverage['/io/iframe-transport.js'].functionData[11]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[156]++;
  var self = this, form = self.form, io = self.io, eventType = event.type, iframeDoc, iframe = io.iframe;
  _$jscoverage['/io/iframe-transport.js'].lineData[166]++;
  if (visit54_166_1(!iframe)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[167]++;
    return;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[171]++;
  if (visit55_171_1(visit56_171_2(eventType == 'abort') && visit57_171_3(S.UA.ie == 6))) {
    _$jscoverage['/io/iframe-transport.js'].lineData[172]++;
    setTimeout(function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[12]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[173]++;
  Dom.attr(form, self.attrs);
}, 0);
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[176]++;
    Dom.attr(form, self.attrs);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[179]++;
  removeFieldsFromData(this.fields);
  _$jscoverage['/io/iframe-transport.js'].lineData[181]++;
  Event.detach(iframe);
  _$jscoverage['/io/iframe-transport.js'].lineData[183]++;
  setTimeout(function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[13]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[185]++;
  Dom.remove(iframe);
}, BREATH_INTERVAL);
  _$jscoverage['/io/iframe-transport.js'].lineData[189]++;
  io.iframe = null;
  _$jscoverage['/io/iframe-transport.js'].lineData[191]++;
  if (visit58_191_1(eventType == 'load')) {
    _$jscoverage['/io/iframe-transport.js'].lineData[193]++;
    try {
      _$jscoverage['/io/iframe-transport.js'].lineData[194]++;
      iframeDoc = iframe.contentWindow.document;
      _$jscoverage['/io/iframe-transport.js'].lineData[196]++;
      if (visit59_196_1(iframeDoc && iframeDoc.body)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[198]++;
        io.responseText = Dom.html(iframeDoc.body);
        _$jscoverage['/io/iframe-transport.js'].lineData[200]++;
        if (visit60_200_1(S.startsWith(io.responseText, '<?xml'))) {
          _$jscoverage['/io/iframe-transport.js'].lineData[201]++;
          io.responseText = undefined;
        }
      }
      _$jscoverage['/io/iframe-transport.js'].lineData[213]++;
      if (visit61_213_1(iframeDoc && iframeDoc['XMLDocument'])) {
        _$jscoverage['/io/iframe-transport.js'].lineData[214]++;
        io.responseXML = iframeDoc['XMLDocument'];
      } else {
        _$jscoverage['/io/iframe-transport.js'].lineData[218]++;
        io.responseXML = iframeDoc;
      }
      _$jscoverage['/io/iframe-transport.js'].lineData[220]++;
      if (visit62_220_1(iframeDoc)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[221]++;
        io._ioReady(OK_CODE, 'success');
      } else {
        _$jscoverage['/io/iframe-transport.js'].lineData[228]++;
        io._ioReady(ERROR_CODE, 'parser error');
      }
    }    catch (e) {
  _$jscoverage['/io/iframe-transport.js'].lineData[232]++;
  io._ioReady(ERROR_CODE, 'parser error');
}
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[234]++;
    if (visit63_234_1(eventType == 'error')) {
      _$jscoverage['/io/iframe-transport.js'].lineData[235]++;
      io._ioReady(ERROR_CODE, 'error');
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[14]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[240]++;
  this._callback({
  type: 'abort'});
}});
  _$jscoverage['/io/iframe-transport.js'].lineData[246]++;
  IO['setupTransport']('iframe', IframeTransport);
  _$jscoverage['/io/iframe-transport.js'].lineData[248]++;
  return IO;
});
