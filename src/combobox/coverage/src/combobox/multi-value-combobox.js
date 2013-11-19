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
if (! _$jscoverage['/combobox/multi-value-combobox.js']) {
  _$jscoverage['/combobox/multi-value-combobox.js'] = {};
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[6] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[7] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[10] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[11] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[12] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[14] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[15] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[18] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[19] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[20] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[29] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[32] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[34] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[35] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[36] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[37] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[43] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[52] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[53] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[54] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[57] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[61] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[62] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[65] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[70] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[82] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[83] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[84] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[85] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[87] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[90] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[91] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[93] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[94] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[95] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[97] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[101] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[103] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[105] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[106] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[110] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[113] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[116] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[117] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[176] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[177] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[192] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[193] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[194] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[195] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[196] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[199] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[200] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[201] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[203] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[205] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[210] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[211] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[212] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[214] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[215] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[216] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[217] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[218] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[219] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[220] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[222] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[224] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[225] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[227] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[228] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[231] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[235] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[236] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[240] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[241] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[244] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[247] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[248] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[250] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[252] = 0;
}
if (! _$jscoverage['/combobox/multi-value-combobox.js'].functionData) {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[0] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[1] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[2] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[3] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[4] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[5] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[6] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[7] = 0;
}
if (! _$jscoverage['/combobox/multi-value-combobox.js'].branchData) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData = {};
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['15'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['19'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['19'][2] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['34'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['52'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['53'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['61'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['79'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['82'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['84'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['85'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['93'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['95'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['186'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['192'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['194'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['195'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['199'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['203'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['210'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['211'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['216'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['217'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['219'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['224'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['235'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['240'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['244'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['247'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['247'][2] = new BranchData();
}
_$jscoverage['/combobox/multi-value-combobox.js'].branchData['247'][2].init(55, 23, 'separatorType == SUFFIX');
function visit106_247_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['247'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['247'][1].init(55, 56, 'separatorType == SUFFIX && strContainsChar(separator, c)');
function visit105_247_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['244'][1].init(2069, 16, 'tokenIndex == -1');
function visit104_244_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['240'][1].init(1999, 14, '!tokens.length');
function visit103_240_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['235'][1].init(1902, 12, 'cache.length');
function visit102_235_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['224'][1].init(25, 12, 'cache.length');
function visit101_224_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['219'][1].init(60, 12, 'cache.length');
function visit100_219_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['217'][1].init(21, 23, 'separatorType == SUFFIX');
function visit99_217_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['216'][1].init(756, 29, 'strContainsChar(separator, c)');
function visit98_216_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['211'][1].init(21, 12, 'cache.length');
function visit97_211_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['210'][1].init(511, 55, 'allowWhitespaceAsStandaloneToken && rWhitespace.test(c)');
function visit96_210_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['203'][1].init(292, 19, 'i == cursorPosition');
function visit95_203_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['199'][1].init(192, 9, 'inLiteral');
function visit94_199_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['195'][1].init(21, 12, 'c == literal');
function visit93_195_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['194'][1].init(53, 7, 'literal');
function visit92_194_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['192'][1].init(544, 19, 'i < inputVal.length');
function visit91_192_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['186'][1].init(370, 23, 'separatorType != SUFFIX');
function visit90_186_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['95'][1].init(287, 21, 'separator.length == 1');
function visit89_95_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['93'][1].init(145, 43, 'strContainsChar(separator, token.charAt(l))');
function visit88_93_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['85'][1].init(177, 5, 'value');
function visit87_85_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['84'][1].init(91, 50, 'nextToken && rWhitespace.test(nextToken.charAt(0))');
function visit86_84_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['82'][1].init(556, 23, 'separatorType != SUFFIX');
function visit85_82_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['79'][1].init(439, 28, 'tokens[tokenIndex + 1] || ""');
function visit84_79_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['61'][2].init(742, 23, 'separatorType == SUFFIX');
function visit83_61_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['61'][1].init(742, 70, 'separatorType == SUFFIX && strContainsChar(separator, token.charAt(l))');
function visit82_61_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['53'][1].init(25, 43, 'strContainsChar(separator, token.charAt(0))');
function visit81_53_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['52'][1].init(418, 23, 'separatorType != SUFFIX');
function visit80_52_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['34'][1].init(80, 27, 'self.get(\'alignWithCursor\')');
function visit79_34_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['19'][2].init(25, 28, 'e.target == this.get(\'menu\')');
function visit78_19_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['19'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['19'][1].init(13, 40, 'e.newVal && e.target == this.get(\'menu\')');
function visit77_19_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['15'][2].init(21, 20, 'str.indexOf(c) != -1');
function visit76_15_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['15'][1].init(16, 25, 'c && str.indexOf(c) != -1');
function visit75_15_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].lineData[6]++;
KISSY.add(function() {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[0]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[7]++;
  var SUFFIX = 'suffix', rWhitespace = /\s|\xa0/;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[10]++;
  var module = this;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[11]++;
  var getCursor = module.require('./cursor');
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[12]++;
  var ComboBox = module.require('./control');
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[14]++;
  function strContainsChar(str, c) {
    _$jscoverage['/combobox/multi-value-combobox.js'].functionData[1]++;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[15]++;
    return visit75_15_1(c && visit76_15_2(str.indexOf(c) != -1));
  }
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[18]++;
  function beforeVisibleChange(e) {
    _$jscoverage['/combobox/multi-value-combobox.js'].functionData[2]++;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[19]++;
    if (visit77_19_1(e.newVal && visit78_19_2(e.target == this.get('menu')))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[20]++;
      this.alignWithCursor();
    }
  }
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[29]++;
  return ComboBox.extend({
  syncUI: function() {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[3]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[32]++;
  var self = this, menu;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[34]++;
  if (visit79_34_1(self.get('alignWithCursor'))) {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[35]++;
    menu = self.get('menu');
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[36]++;
    menu.setInternal('align', null);
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[37]++;
    menu.on('beforeVisibleChange', beforeVisibleChange, this);
  }
}, 
  getValueForAutocomplete: function() {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[4]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[43]++;
  var self = this, inputDesc = getInputDesc(self), tokens = inputDesc.tokens, tokenIndex = inputDesc.tokenIndex, separator = self.get("separator"), separatorType = self.get("separatorType"), token = tokens[tokenIndex], l = token.length - 1;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[52]++;
  if (visit80_52_1(separatorType != SUFFIX)) {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[53]++;
    if (visit81_53_1(strContainsChar(separator, token.charAt(0)))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[54]++;
      token = token.slice(1);
    } else {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[57]++;
      return undefined;
    }
  } else {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[61]++;
    if (visit82_61_1(visit83_61_2(separatorType == SUFFIX) && strContainsChar(separator, token.charAt(l)))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[62]++;
      token = token.slice(0, l);
    }
  }
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[65]++;
  return token;
}, 
  setValueFromAutocomplete: function(value, setCfg) {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[5]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[70]++;
  var self = this, input = self.get("input"), inputDesc = getInputDesc(self), tokens = inputDesc.tokens, tokenIndex = Math.max(0, inputDesc.tokenIndex), separator = self.get("separator"), cursorPosition, l, separatorType = self.get("separatorType"), nextToken = visit84_79_1(tokens[tokenIndex + 1] || ""), token = tokens[tokenIndex];
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[82]++;
  if (visit85_82_1(separatorType != SUFFIX)) {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[83]++;
    tokens[tokenIndex] = token.charAt(0) + value;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[84]++;
    if (visit86_84_1(nextToken && rWhitespace.test(nextToken.charAt(0)))) {
    } else {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[85]++;
      if (visit87_85_1(value)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[87]++;
        tokens[tokenIndex] += ' ';
      }
    }
  } else {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[90]++;
    tokens[tokenIndex] = value;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[91]++;
    l = token.length - 1;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[93]++;
    if (visit88_93_1(strContainsChar(separator, token.charAt(l)))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[94]++;
      tokens[tokenIndex] += token.charAt(l);
    } else {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[95]++;
      if (visit89_95_1(separator.length == 1)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[97]++;
        tokens[tokenIndex] += separator;
      }
    }
  }
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[101]++;
  cursorPosition = tokens.slice(0, tokenIndex + 1).join("").length;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[103]++;
  self.set('value', tokens.join(""), setCfg);
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[105]++;
  input.prop("selectionStart", cursorPosition);
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[106]++;
  input.prop("selectionEnd", cursorPosition);
}, 
  'alignWithCursor': function() {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[6]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[110]++;
  var self = this;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[113]++;
  var menu = self.get("menu"), cursorOffset, input = self.get("input");
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[116]++;
  cursorOffset = getCursor(input);
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[117]++;
  menu.move(cursorOffset.left, cursorOffset.top);
}}, {
  ATTRS: {
  separator: {
  value: ",;"}, 
  separatorType: {
  value: SUFFIX}, 
  literal: {
  value: "\""}, 
  alignWithCursor: {}}, 
  xclass: 'multi-value-combobox'});
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[176]++;
  function getInputDesc(self) {
    _$jscoverage['/combobox/multi-value-combobox.js'].functionData[7]++;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[177]++;
    var input = self.get("input"), inputVal = self.get('value'), tokens = [], cache = [], literal = self.get("literal"), separator = self.get("separator"), separatorType = self.get("separatorType"), inLiteral = false, allowWhitespaceAsStandaloneToken = visit90_186_1(separatorType != SUFFIX), cursorPosition = input.prop('selectionStart'), i, c, tokenIndex = -1;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[192]++;
    for (i = 0; visit91_192_1(i < inputVal.length); i++) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[193]++;
      c = inputVal.charAt(i);
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[194]++;
      if (visit92_194_1(literal)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[195]++;
        if (visit93_195_1(c == literal)) {
          _$jscoverage['/combobox/multi-value-combobox.js'].lineData[196]++;
          inLiteral = !inLiteral;
        }
      }
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[199]++;
      if (visit94_199_1(inLiteral)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[200]++;
        cache.push(c);
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[201]++;
        continue;
      }
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[203]++;
      if (visit95_203_1(i == cursorPosition)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[205]++;
        tokenIndex = tokens.length;
      }
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[210]++;
      if (visit96_210_1(allowWhitespaceAsStandaloneToken && rWhitespace.test(c))) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[211]++;
        if (visit97_211_1(cache.length)) {
          _$jscoverage['/combobox/multi-value-combobox.js'].lineData[212]++;
          tokens.push(cache.join(""));
        }
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[214]++;
        cache = [];
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[215]++;
        cache.push(c);
      } else {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[216]++;
        if (visit98_216_1(strContainsChar(separator, c))) {
          _$jscoverage['/combobox/multi-value-combobox.js'].lineData[217]++;
          if (visit99_217_1(separatorType == SUFFIX)) {
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[218]++;
            cache.push(c);
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[219]++;
            if (visit100_219_1(cache.length)) {
              _$jscoverage['/combobox/multi-value-combobox.js'].lineData[220]++;
              tokens.push(cache.join(""));
            }
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[222]++;
            cache = [];
          } else {
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[224]++;
            if (visit101_224_1(cache.length)) {
              _$jscoverage['/combobox/multi-value-combobox.js'].lineData[225]++;
              tokens.push(cache.join(""));
            }
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[227]++;
            cache = [];
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[228]++;
            cache.push(c);
          }
        } else {
          _$jscoverage['/combobox/multi-value-combobox.js'].lineData[231]++;
          cache.push(c);
        }
      }
    }
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[235]++;
    if (visit102_235_1(cache.length)) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[236]++;
      tokens.push(cache.join(""));
    }
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[240]++;
    if (visit103_240_1(!tokens.length)) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[241]++;
      tokens.push('');
    }
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[244]++;
    if (visit104_244_1(tokenIndex == -1)) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[247]++;
      if (visit105_247_1(visit106_247_2(separatorType == SUFFIX) && strContainsChar(separator, c))) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[248]++;
        tokens.push('');
      }
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[250]++;
      tokenIndex = tokens.length - 1;
    }
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[252]++;
    return {
  tokens: tokens, 
  cursorPosition: cursorPosition, 
  tokenIndex: tokenIndex};
  }
});
