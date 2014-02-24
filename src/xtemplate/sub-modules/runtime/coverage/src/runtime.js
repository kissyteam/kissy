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
if (! _$jscoverage['/runtime.js']) {
  _$jscoverage['/runtime.js'] = {};
  _$jscoverage['/runtime.js'].lineData = [];
  _$jscoverage['/runtime.js'].lineData[6] = 0;
  _$jscoverage['/runtime.js'].lineData[7] = 0;
  _$jscoverage['/runtime.js'].lineData[8] = 0;
  _$jscoverage['/runtime.js'].lineData[9] = 0;
  _$jscoverage['/runtime.js'].lineData[10] = 0;
  _$jscoverage['/runtime.js'].lineData[11] = 0;
  _$jscoverage['/runtime.js'].lineData[13] = 0;
  _$jscoverage['/runtime.js'].lineData[14] = 0;
  _$jscoverage['/runtime.js'].lineData[15] = 0;
  _$jscoverage['/runtime.js'].lineData[19] = 0;
  _$jscoverage['/runtime.js'].lineData[20] = 0;
  _$jscoverage['/runtime.js'].lineData[23] = 0;
  _$jscoverage['/runtime.js'].lineData[24] = 0;
  _$jscoverage['/runtime.js'].lineData[25] = 0;
  _$jscoverage['/runtime.js'].lineData[26] = 0;
  _$jscoverage['/runtime.js'].lineData[27] = 0;
  _$jscoverage['/runtime.js'].lineData[28] = 0;
  _$jscoverage['/runtime.js'].lineData[29] = 0;
  _$jscoverage['/runtime.js'].lineData[30] = 0;
  _$jscoverage['/runtime.js'].lineData[33] = 0;
  _$jscoverage['/runtime.js'].lineData[36] = 0;
  _$jscoverage['/runtime.js'].lineData[37] = 0;
  _$jscoverage['/runtime.js'].lineData[38] = 0;
  _$jscoverage['/runtime.js'].lineData[39] = 0;
  _$jscoverage['/runtime.js'].lineData[40] = 0;
  _$jscoverage['/runtime.js'].lineData[41] = 0;
  _$jscoverage['/runtime.js'].lineData[42] = 0;
  _$jscoverage['/runtime.js'].lineData[44] = 0;
  _$jscoverage['/runtime.js'].lineData[46] = 0;
  _$jscoverage['/runtime.js'].lineData[50] = 0;
  _$jscoverage['/runtime.js'].lineData[51] = 0;
  _$jscoverage['/runtime.js'].lineData[53] = 0;
  _$jscoverage['/runtime.js'].lineData[58] = 0;
  _$jscoverage['/runtime.js'].lineData[59] = 0;
  _$jscoverage['/runtime.js'].lineData[60] = 0;
  _$jscoverage['/runtime.js'].lineData[61] = 0;
  _$jscoverage['/runtime.js'].lineData[62] = 0;
  _$jscoverage['/runtime.js'].lineData[63] = 0;
  _$jscoverage['/runtime.js'].lineData[67] = 0;
  _$jscoverage['/runtime.js'].lineData[69] = 0;
  _$jscoverage['/runtime.js'].lineData[72] = 0;
  _$jscoverage['/runtime.js'].lineData[74] = 0;
  _$jscoverage['/runtime.js'].lineData[75] = 0;
  _$jscoverage['/runtime.js'].lineData[76] = 0;
  _$jscoverage['/runtime.js'].lineData[77] = 0;
  _$jscoverage['/runtime.js'].lineData[78] = 0;
  _$jscoverage['/runtime.js'].lineData[79] = 0;
  _$jscoverage['/runtime.js'].lineData[80] = 0;
  _$jscoverage['/runtime.js'].lineData[81] = 0;
  _$jscoverage['/runtime.js'].lineData[82] = 0;
  _$jscoverage['/runtime.js'].lineData[84] = 0;
  _$jscoverage['/runtime.js'].lineData[86] = 0;
  _$jscoverage['/runtime.js'].lineData[87] = 0;
  _$jscoverage['/runtime.js'].lineData[88] = 0;
  _$jscoverage['/runtime.js'].lineData[90] = 0;
  _$jscoverage['/runtime.js'].lineData[91] = 0;
  _$jscoverage['/runtime.js'].lineData[93] = 0;
  _$jscoverage['/runtime.js'].lineData[95] = 0;
  _$jscoverage['/runtime.js'].lineData[96] = 0;
  _$jscoverage['/runtime.js'].lineData[99] = 0;
  _$jscoverage['/runtime.js'].lineData[100] = 0;
  _$jscoverage['/runtime.js'].lineData[101] = 0;
  _$jscoverage['/runtime.js'].lineData[103] = 0;
  _$jscoverage['/runtime.js'].lineData[105] = 0;
  _$jscoverage['/runtime.js'].lineData[109] = 0;
  _$jscoverage['/runtime.js'].lineData[110] = 0;
  _$jscoverage['/runtime.js'].lineData[112] = 0;
  _$jscoverage['/runtime.js'].lineData[116] = 0;
  _$jscoverage['/runtime.js'].lineData[120] = 0;
  _$jscoverage['/runtime.js'].lineData[123] = 0;
  _$jscoverage['/runtime.js'].lineData[124] = 0;
  _$jscoverage['/runtime.js'].lineData[125] = 0;
  _$jscoverage['/runtime.js'].lineData[127] = 0;
  _$jscoverage['/runtime.js'].lineData[157] = 0;
  _$jscoverage['/runtime.js'].lineData[158] = 0;
  _$jscoverage['/runtime.js'].lineData[159] = 0;
  _$jscoverage['/runtime.js'].lineData[160] = 0;
  _$jscoverage['/runtime.js'].lineData[161] = 0;
  _$jscoverage['/runtime.js'].lineData[162] = 0;
  _$jscoverage['/runtime.js'].lineData[163] = 0;
  _$jscoverage['/runtime.js'].lineData[165] = 0;
  _$jscoverage['/runtime.js'].lineData[167] = 0;
  _$jscoverage['/runtime.js'].lineData[168] = 0;
  _$jscoverage['/runtime.js'].lineData[170] = 0;
  _$jscoverage['/runtime.js'].lineData[171] = 0;
  _$jscoverage['/runtime.js'].lineData[176] = 0;
  _$jscoverage['/runtime.js'].lineData[190] = 0;
  _$jscoverage['/runtime.js'].lineData[191] = 0;
  _$jscoverage['/runtime.js'].lineData[202] = 0;
  _$jscoverage['/runtime.js'].lineData[203] = 0;
  _$jscoverage['/runtime.js'].lineData[208] = 0;
  _$jscoverage['/runtime.js'].lineData[227] = 0;
  _$jscoverage['/runtime.js'].lineData[228] = 0;
  _$jscoverage['/runtime.js'].lineData[229] = 0;
  _$jscoverage['/runtime.js'].lineData[231] = 0;
  _$jscoverage['/runtime.js'].lineData[235] = 0;
  _$jscoverage['/runtime.js'].lineData[236] = 0;
  _$jscoverage['/runtime.js'].lineData[237] = 0;
  _$jscoverage['/runtime.js'].lineData[238] = 0;
  _$jscoverage['/runtime.js'].lineData[239] = 0;
  _$jscoverage['/runtime.js'].lineData[247] = 0;
  _$jscoverage['/runtime.js'].lineData[248] = 0;
  _$jscoverage['/runtime.js'].lineData[250] = 0;
  _$jscoverage['/runtime.js'].lineData[259] = 0;
  _$jscoverage['/runtime.js'].lineData[260] = 0;
  _$jscoverage['/runtime.js'].lineData[262] = 0;
  _$jscoverage['/runtime.js'].lineData[271] = 0;
  _$jscoverage['/runtime.js'].lineData[272] = 0;
  _$jscoverage['/runtime.js'].lineData[273] = 0;
  _$jscoverage['/runtime.js'].lineData[274] = 0;
  _$jscoverage['/runtime.js'].lineData[276] = 0;
  _$jscoverage['/runtime.js'].lineData[277] = 0;
  _$jscoverage['/runtime.js'].lineData[278] = 0;
  _$jscoverage['/runtime.js'].lineData[279] = 0;
  _$jscoverage['/runtime.js'].lineData[281] = 0;
  _$jscoverage['/runtime.js'].lineData[282] = 0;
  _$jscoverage['/runtime.js'].lineData[286] = 0;
  _$jscoverage['/runtime.js'].lineData[291] = 0;
  _$jscoverage['/runtime.js'].lineData[293] = 0;
}
if (! _$jscoverage['/runtime.js'].functionData) {
  _$jscoverage['/runtime.js'].functionData = [];
  _$jscoverage['/runtime.js'].functionData[0] = 0;
  _$jscoverage['/runtime.js'].functionData[1] = 0;
  _$jscoverage['/runtime.js'].functionData[2] = 0;
  _$jscoverage['/runtime.js'].functionData[3] = 0;
  _$jscoverage['/runtime.js'].functionData[4] = 0;
  _$jscoverage['/runtime.js'].functionData[5] = 0;
  _$jscoverage['/runtime.js'].functionData[6] = 0;
  _$jscoverage['/runtime.js'].functionData[7] = 0;
  _$jscoverage['/runtime.js'].functionData[8] = 0;
  _$jscoverage['/runtime.js'].functionData[9] = 0;
  _$jscoverage['/runtime.js'].functionData[10] = 0;
  _$jscoverage['/runtime.js'].functionData[11] = 0;
  _$jscoverage['/runtime.js'].functionData[12] = 0;
  _$jscoverage['/runtime.js'].functionData[13] = 0;
  _$jscoverage['/runtime.js'].functionData[14] = 0;
  _$jscoverage['/runtime.js'].functionData[15] = 0;
  _$jscoverage['/runtime.js'].functionData[16] = 0;
  _$jscoverage['/runtime.js'].functionData[17] = 0;
}
if (! _$jscoverage['/runtime.js'].branchData) {
  _$jscoverage['/runtime.js'].branchData = {};
  _$jscoverage['/runtime.js'].branchData['27'] = [];
  _$jscoverage['/runtime.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['29'] = [];
  _$jscoverage['/runtime.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['39'] = [];
  _$jscoverage['/runtime.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['40'] = [];
  _$jscoverage['/runtime.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['50'] = [];
  _$jscoverage['/runtime.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['62'] = [];
  _$jscoverage['/runtime.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['76'] = [];
  _$jscoverage['/runtime.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['77'] = [];
  _$jscoverage['/runtime.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['78'] = [];
  _$jscoverage['/runtime.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['80'] = [];
  _$jscoverage['/runtime.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['87'] = [];
  _$jscoverage['/runtime.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['90'] = [];
  _$jscoverage['/runtime.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['109'] = [];
  _$jscoverage['/runtime.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['112'] = [];
  _$jscoverage['/runtime.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['124'] = [];
  _$jscoverage['/runtime.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['160'] = [];
  _$jscoverage['/runtime.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['161'] = [];
  _$jscoverage['/runtime.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['167'] = [];
  _$jscoverage['/runtime.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['170'] = [];
  _$jscoverage['/runtime.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['190'] = [];
  _$jscoverage['/runtime.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['202'] = [];
  _$jscoverage['/runtime.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['228'] = [];
  _$jscoverage['/runtime.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['247'] = [];
  _$jscoverage['/runtime.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['259'] = [];
  _$jscoverage['/runtime.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['273'] = [];
  _$jscoverage['/runtime.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['273'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['276'] = [];
  _$jscoverage['/runtime.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['281'] = [];
  _$jscoverage['/runtime.js'].branchData['281'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['281'][1].init(408, 13, 'extendTplName');
function visit94_281_1(result) {
  _$jscoverage['/runtime.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['276'][1].init(178, 13, 'payload || {}');
function visit93_276_1(result) {
  _$jscoverage['/runtime.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['273'][2].init(77, 20, 'root && root.isScope');
function visit92_273_2(result) {
  _$jscoverage['/runtime.js'].branchData['273'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['273'][1].init(75, 23, '!(root && root.isScope)');
function visit91_273_1(result) {
  _$jscoverage['/runtime.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['259'][1].init(17, 26, 'this.commands === commands');
function visit90_259_1(result) {
  _$jscoverage['/runtime.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['247'][1].init(17, 26, 'this.commands === commands');
function visit89_247_1(result) {
  _$jscoverage['/runtime.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['228'][1].init(62, 4, '!tpl');
function visit88_228_1(result) {
  _$jscoverage['/runtime.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['202'][1].init(17, 8, 'commands');
function visit87_202_1(result) {
  _$jscoverage['/runtime.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['190'][1].init(24, 14, 'commands || {}');
function visit86_190_1(result) {
  _$jscoverage['/runtime.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['170'][1].init(312, 27, 'config.silent !== undefined');
function visit85_170_1(result) {
  _$jscoverage['/runtime.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['167'][1].init(226, 11, 'config.name');
function visit84_167_1(result) {
  _$jscoverage['/runtime.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['161'][1].init(17, 15, 'config.commands');
function visit83_161_1(result) {
  _$jscoverage['/runtime.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['160'][1].init(62, 6, 'config');
function visit82_160_1(result) {
  _$jscoverage['/runtime.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['124'][1].init(165, 8, 'ret.find');
function visit81_124_1(result) {
  _$jscoverage['/runtime.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['112'][1].init(97, 13, 'escape && exp');
function visit80_112_1(result) {
  _$jscoverage['/runtime.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['109'][1].init(17, 17, 'exp === undefined');
function visit79_109_1(result) {
  _$jscoverage['/runtime.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['90'][1].init(523, 28, 'typeof property === \'object\'');
function visit78_90_1(result) {
  _$jscoverage['/runtime.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['87'][1].init(399, 19, 'S.isArray(property)');
function visit77_87_1(result) {
  _$jscoverage['/runtime.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['80'][1].init(81, 18, 'property === false');
function visit76_80_1(result) {
  _$jscoverage['/runtime.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['78'][1].init(21, 32, '!options.params && !options.hash');
function visit75_78_1(result) {
  _$jscoverage['/runtime.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['77'][1].init(184, 8, '!command');
function visit74_77_1(result) {
  _$jscoverage['/runtime.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['76'][1].init(127, 39, 'commands && findCommand(commands, name)');
function visit73_76_1(result) {
  _$jscoverage['/runtime.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['62'][1].init(129, 14, 'tmp2 === false');
function visit72_62_1(result) {
  _$jscoverage['/runtime.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['50'][1].init(449, 11, 'onlyCommand');
function visit71_50_1(result) {
  _$jscoverage['/runtime.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['40'][1].init(134, 8, 'command1');
function visit70_40_1(result) {
  _$jscoverage['/runtime.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['39'][1].init(81, 39, 'commands && findCommand(commands, name)');
function visit69_39_1(result) {
  _$jscoverage['/runtime.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['29'][1].init(50, 4, '!cmd');
function visit68_29_1(result) {
  _$jscoverage['/runtime.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['27'][1].init(122, 7, 'i < len');
function visit67_27_1(result) {
  _$jscoverage['/runtime.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/runtime.js'].functionData[0]++;
  _$jscoverage['/runtime.js'].lineData[7]++;
  var nativeCommands = require('./runtime/commands');
  _$jscoverage['/runtime.js'].lineData[8]++;
  var commands = {};
  _$jscoverage['/runtime.js'].lineData[9]++;
  var Scope = require('./runtime/scope');
  _$jscoverage['/runtime.js'].lineData[10]++;
  var escapeHtml = S.escapeHtml;
  _$jscoverage['/runtime.js'].lineData[11]++;
  var logger = S.getLogger('s/xtemplate');
  _$jscoverage['/runtime.js'].lineData[13]++;
  function merge(from, to) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[14]++;
    for (var i in to) {
      _$jscoverage['/runtime.js'].lineData[15]++;
      from[i] = to[i];
    }
  }
  _$jscoverage['/runtime.js'].lineData[19]++;
  function info(s) {
    _$jscoverage['/runtime.js'].functionData[2]++;
    _$jscoverage['/runtime.js'].lineData[20]++;
    logger.info(s);
  }
  _$jscoverage['/runtime.js'].lineData[23]++;
  function findCommand(commands, name) {
    _$jscoverage['/runtime.js'].functionData[3]++;
    _$jscoverage['/runtime.js'].lineData[24]++;
    var parts = name.split('.');
    _$jscoverage['/runtime.js'].lineData[25]++;
    var cmd = commands;
    _$jscoverage['/runtime.js'].lineData[26]++;
    var len = parts.length;
    _$jscoverage['/runtime.js'].lineData[27]++;
    for (var i = 0; visit67_27_1(i < len); i++) {
      _$jscoverage['/runtime.js'].lineData[28]++;
      cmd = cmd[parts[i]];
      _$jscoverage['/runtime.js'].lineData[29]++;
      if (visit68_29_1(!cmd)) {
        _$jscoverage['/runtime.js'].lineData[30]++;
        break;
      }
    }
    _$jscoverage['/runtime.js'].lineData[33]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[36]++;
  function runInlineCommand(engine, scope, options, name, line, onlyCommand) {
    _$jscoverage['/runtime.js'].functionData[4]++;
    _$jscoverage['/runtime.js'].lineData[37]++;
    var id0;
    _$jscoverage['/runtime.js'].lineData[38]++;
    var commands = engine.commands;
    _$jscoverage['/runtime.js'].lineData[39]++;
    var command1 = visit69_39_1(commands && findCommand(commands, name));
    _$jscoverage['/runtime.js'].lineData[40]++;
    if (visit70_40_1(command1)) {
      _$jscoverage['/runtime.js'].lineData[41]++;
      try {
        _$jscoverage['/runtime.js'].lineData[42]++;
        id0 = command1.call(engine, scope, options);
      }      catch (e) {
  _$jscoverage['/runtime.js'].lineData[44]++;
  S.error(e.message + ': "' + name + '" at line ' + line);
}
      _$jscoverage['/runtime.js'].lineData[46]++;
      return {
  find: true, 
  value: id0};
    } else {
      _$jscoverage['/runtime.js'].lineData[50]++;
      if (visit71_50_1(onlyCommand)) {
        _$jscoverage['/runtime.js'].lineData[51]++;
        S.error('can not find command: ' + name + '" at line ' + line);
      }
    }
    _$jscoverage['/runtime.js'].lineData[53]++;
    return {
  find: false};
  }
  _$jscoverage['/runtime.js'].lineData[58]++;
  function getProperty(engine, scope, name, depth, line) {
    _$jscoverage['/runtime.js'].functionData[5]++;
    _$jscoverage['/runtime.js'].lineData[59]++;
    var id0;
    _$jscoverage['/runtime.js'].lineData[60]++;
    var logFn = engine.silent ? info : S.error;
    _$jscoverage['/runtime.js'].lineData[61]++;
    var tmp2 = scope.resolve(name, depth);
    _$jscoverage['/runtime.js'].lineData[62]++;
    if (visit72_62_1(tmp2 === false)) {
      _$jscoverage['/runtime.js'].lineData[63]++;
      logFn('can not find property: "' + name + '" at line ' + line, 'warn');
    } else {
      _$jscoverage['/runtime.js'].lineData[67]++;
      id0 = tmp2[0];
    }
    _$jscoverage['/runtime.js'].lineData[69]++;
    return id0;
  }
  _$jscoverage['/runtime.js'].lineData[72]++;
  var utils = {
  'runBlockCommand': function(engine, scope, options, name, line) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[74]++;
  var logFn = engine.silent ? info : S.error;
  _$jscoverage['/runtime.js'].lineData[75]++;
  var commands = engine.commands;
  _$jscoverage['/runtime.js'].lineData[76]++;
  var command = visit73_76_1(commands && findCommand(commands, name));
  _$jscoverage['/runtime.js'].lineData[77]++;
  if (visit74_77_1(!command)) {
    _$jscoverage['/runtime.js'].lineData[78]++;
    if (visit75_78_1(!options.params && !options.hash)) {
      _$jscoverage['/runtime.js'].lineData[79]++;
      var property = scope.resolve(name);
      _$jscoverage['/runtime.js'].lineData[80]++;
      if (visit76_80_1(property === false)) {
        _$jscoverage['/runtime.js'].lineData[81]++;
        logFn('can not find property: "' + name + '" at line ' + line);
        _$jscoverage['/runtime.js'].lineData[82]++;
        property = '';
      } else {
        _$jscoverage['/runtime.js'].lineData[84]++;
        property = property[0];
      }
      _$jscoverage['/runtime.js'].lineData[86]++;
      command = commands['if'];
      _$jscoverage['/runtime.js'].lineData[87]++;
      if (visit77_87_1(S.isArray(property))) {
        _$jscoverage['/runtime.js'].lineData[88]++;
        command = commands.each;
      } else {
        _$jscoverage['/runtime.js'].lineData[90]++;
        if (visit78_90_1(typeof property === 'object')) {
          _$jscoverage['/runtime.js'].lineData[91]++;
          command = commands['with'];
        }
      }
      _$jscoverage['/runtime.js'].lineData[93]++;
      options.params = [property];
    } else {
      _$jscoverage['/runtime.js'].lineData[95]++;
      S.error('can not find command: ' + name + '" at line ' + line);
      _$jscoverage['/runtime.js'].lineData[96]++;
      return '';
    }
  }
  _$jscoverage['/runtime.js'].lineData[99]++;
  var ret;
  _$jscoverage['/runtime.js'].lineData[100]++;
  try {
    _$jscoverage['/runtime.js'].lineData[101]++;
    ret = command.call(engine, scope, options);
  }  catch (e) {
  _$jscoverage['/runtime.js'].lineData[103]++;
  S.error(e.message + ': "' + name + '" at line ' + line);
}
  _$jscoverage['/runtime.js'].lineData[105]++;
  return ret;
}, 
  'renderOutput': function(exp, escape) {
  _$jscoverage['/runtime.js'].functionData[7]++;
  _$jscoverage['/runtime.js'].lineData[109]++;
  if (visit79_109_1(exp === undefined)) {
    _$jscoverage['/runtime.js'].lineData[110]++;
    exp = '';
  }
  _$jscoverage['/runtime.js'].lineData[112]++;
  return visit80_112_1(escape && exp) ? escapeHtml(exp) : exp;
}, 
  'getProperty': function(engine, scope, name, depth, line) {
  _$jscoverage['/runtime.js'].functionData[8]++;
  _$jscoverage['/runtime.js'].lineData[116]++;
  return getProperty(engine, scope, name, depth, line);
}, 
  'runInlineCommand': function(engine, scope, options, name, line) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[120]++;
  var id0 = '', ret;
  _$jscoverage['/runtime.js'].lineData[123]++;
  ret = runInlineCommand(engine, scope, options, name, line);
  _$jscoverage['/runtime.js'].lineData[124]++;
  if (visit81_124_1(ret.find)) {
    _$jscoverage['/runtime.js'].lineData[125]++;
    id0 = ret.value;
  }
  _$jscoverage['/runtime.js'].lineData[127]++;
  return id0;
}};
  _$jscoverage['/runtime.js'].lineData[157]++;
  function XTemplateRuntime(tpl, config) {
    _$jscoverage['/runtime.js'].functionData[10]++;
    _$jscoverage['/runtime.js'].lineData[158]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[159]++;
    self.tpl = tpl;
    _$jscoverage['/runtime.js'].lineData[160]++;
    if (visit82_160_1(config)) {
      _$jscoverage['/runtime.js'].lineData[161]++;
      if (visit83_161_1(config.commands)) {
        _$jscoverage['/runtime.js'].lineData[162]++;
        self.commands = config.commands;
        _$jscoverage['/runtime.js'].lineData[163]++;
        merge(self.commands, commands);
      } else {
        _$jscoverage['/runtime.js'].lineData[165]++;
        self.commands = commands;
      }
      _$jscoverage['/runtime.js'].lineData[167]++;
      if (visit84_167_1(config.name)) {
        _$jscoverage['/runtime.js'].lineData[168]++;
        self.name = config.name;
      }
      _$jscoverage['/runtime.js'].lineData[170]++;
      if (visit85_170_1(config.silent !== undefined)) {
        _$jscoverage['/runtime.js'].lineData[171]++;
        self.silent = config.silent;
      }
    }
  }
  _$jscoverage['/runtime.js'].lineData[176]++;
  S.mix(XTemplateRuntime, {
  nativeCommands: nativeCommands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[11]++;
  _$jscoverage['/runtime.js'].lineData[190]++;
  commands = visit86_190_1(commands || {});
  _$jscoverage['/runtime.js'].lineData[191]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[202]++;
  if (visit87_202_1(commands)) {
    _$jscoverage['/runtime.js'].lineData[203]++;
    delete commands[commandName];
  }
}});
  _$jscoverage['/runtime.js'].lineData[208]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  name: 'unspecified', 
  silent: true, 
  commands: commands, 
  nativeCommands: nativeCommands, 
  utils: utils, 
  load: function(subTplName) {
  _$jscoverage['/runtime.js'].functionData[13]++;
  _$jscoverage['/runtime.js'].lineData[227]++;
  var tpl = S.require(subTplName);
  _$jscoverage['/runtime.js'].lineData[228]++;
  if (visit88_228_1(!tpl)) {
    _$jscoverage['/runtime.js'].lineData[229]++;
    S.error('template "' + subTplName + '" does not exist, ' + 'need to be required or used first!');
  }
  _$jscoverage['/runtime.js'].lineData[231]++;
  return this.derive(subTplName, tpl);
}, 
  derive: function(name, tpl) {
  _$jscoverage['/runtime.js'].functionData[14]++;
  _$jscoverage['/runtime.js'].lineData[235]++;
  var engine = new this.constructor(tpl);
  _$jscoverage['/runtime.js'].lineData[236]++;
  engine.name = name;
  _$jscoverage['/runtime.js'].lineData[237]++;
  engine.commands = this.commands;
  _$jscoverage['/runtime.js'].lineData[238]++;
  engine.silent = this.silent;
  _$jscoverage['/runtime.js'].lineData[239]++;
  return engine;
}, 
  'removeCommand': function(commandName) {
  _$jscoverage['/runtime.js'].functionData[15]++;
  _$jscoverage['/runtime.js'].lineData[247]++;
  if (visit89_247_1(this.commands === commands)) {
    _$jscoverage['/runtime.js'].lineData[248]++;
    this.commands = merge({}, this.commands);
  }
  _$jscoverage['/runtime.js'].lineData[250]++;
  delete this.commands[commandName];
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[16]++;
  _$jscoverage['/runtime.js'].lineData[259]++;
  if (visit90_259_1(this.commands === commands)) {
    _$jscoverage['/runtime.js'].lineData[260]++;
    this.commands = merge({}, this.commands);
  }
  _$jscoverage['/runtime.js'].lineData[262]++;
  this.commands[commandName] = fn;
}, 
  render: function(data, payload) {
  _$jscoverage['/runtime.js'].functionData[17]++;
  _$jscoverage['/runtime.js'].lineData[271]++;
  var root = data;
  _$jscoverage['/runtime.js'].lineData[272]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[273]++;
  if (visit91_273_1(!(visit92_273_2(root && root.isScope)))) {
    _$jscoverage['/runtime.js'].lineData[274]++;
    root = new Scope(data);
  }
  _$jscoverage['/runtime.js'].lineData[276]++;
  payload = visit93_276_1(payload || {});
  _$jscoverage['/runtime.js'].lineData[277]++;
  payload.extendTplName = null;
  _$jscoverage['/runtime.js'].lineData[278]++;
  var html = self.tpl(root, S, payload);
  _$jscoverage['/runtime.js'].lineData[279]++;
  var extendTplName = payload.extendTplName;
  _$jscoverage['/runtime.js'].lineData[281]++;
  if (visit94_281_1(extendTplName)) {
    _$jscoverage['/runtime.js'].lineData[282]++;
    return nativeCommands.include.call(self, root, {
  params: [extendTplName]}, payload);
  } else {
    _$jscoverage['/runtime.js'].lineData[286]++;
    return html;
  }
}};
  _$jscoverage['/runtime.js'].lineData[291]++;
  XTemplateRuntime.Scope = Scope;
  _$jscoverage['/runtime.js'].lineData[293]++;
  return XTemplateRuntime;
});
