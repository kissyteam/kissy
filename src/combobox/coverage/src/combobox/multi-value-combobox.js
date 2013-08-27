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
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[8] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[11] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[12] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[15] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[16] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[17] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[26] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[29] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[31] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[32] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[33] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[34] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[40] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[49] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[50] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[51] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[54] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[58] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[59] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[62] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[67] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[79] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[80] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[81] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[82] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[84] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[87] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[88] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[90] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[91] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[92] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[94] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[98] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[100] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[102] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[103] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[107] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[110] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[113] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[114] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[173] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[174] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[189] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[190] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[191] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[192] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[193] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[196] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[197] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[198] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[200] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[202] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[207] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[208] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[209] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[211] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[212] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[213] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[214] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[215] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[216] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[217] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[219] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[221] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[222] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[224] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[225] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[228] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[232] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[233] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[237] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[238] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[241] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[244] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[245] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[247] = 0;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[249] = 0;
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
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['12'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['12'][2] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['16'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['16'][2] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['31'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['49'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['50'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['58'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['58'][2] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['76'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['79'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['81'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['82'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['90'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['92'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['183'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['189'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['191'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['192'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['196'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['200'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['207'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['208'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['213'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['214'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['216'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['221'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['232'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['237'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['241'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['244'] = [];
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['244'][2] = new BranchData();
}
_$jscoverage['/combobox/multi-value-combobox.js'].branchData['244'][2].init(58, 23, 'separatorType == SUFFIX');
function visit106_244_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['244'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['244'][1].init(58, 56, 'separatorType == SUFFIX && strContainsChar(separator, c)');
function visit105_244_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['241'][1].init(2137, 16, 'tokenIndex == -1');
function visit104_241_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['237'][1].init(2063, 14, '!tokens.length');
function visit103_237_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['232'][1].init(1961, 12, 'cache.length');
function visit102_232_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['221'][1].init(26, 12, 'cache.length');
function visit101_221_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['216'][1].init(62, 12, 'cache.length');
function visit100_216_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['214'][1].init(22, 23, 'separatorType == SUFFIX');
function visit99_214_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['213'][1].init(780, 29, 'strContainsChar(separator, c)');
function visit98_213_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['208'][1].init(22, 12, 'cache.length');
function visit97_208_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['207'][1].init(529, 55, 'allowWhitespaceAsStandaloneToken && rWhitespace.test(c)');
function visit96_207_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['200'][1].init(303, 19, 'i == cursorPosition');
function visit95_200_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['196'][1].init(199, 9, 'inLiteral');
function visit94_196_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['192'][1].init(22, 12, 'c == literal');
function visit93_192_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['191'][1].init(55, 7, 'literal');
function visit92_191_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['189'][1].init(560, 19, 'i < inputVal.length');
function visit91_189_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['183'][1].init(379, 23, 'separatorType != SUFFIX');
function visit90_183_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['92'][1].init(293, 21, 'separator.length == 1');
function visit89_92_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['90'][1].init(149, 43, 'strContainsChar(separator, token.charAt(l))');
function visit88_90_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['82'][1].init(180, 5, 'value');
function visit87_82_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['81'][1].init(93, 50, 'nextToken && rWhitespace.test(nextToken.charAt(0))');
function visit86_81_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['79'][1].init(569, 23, 'separatorType != SUFFIX');
function visit85_79_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['76'][1].init(448, 28, 'tokens[tokenIndex + 1] || ""');
function visit84_76_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['58'][2].init(762, 23, 'separatorType == SUFFIX');
function visit83_58_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['58'][1].init(762, 70, 'separatorType == SUFFIX && strContainsChar(separator, token.charAt(l))');
function visit82_58_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['50'][1].init(26, 43, 'strContainsChar(separator, token.charAt(0))');
function visit81_50_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['49'][1].init(429, 23, 'separatorType != SUFFIX');
function visit80_49_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['31'][1].init(83, 27, 'self.get(\'alignWithCursor\')');
function visit79_31_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['16'][2].init(26, 28, 'e.target == this.get(\'menu\')');
function visit78_16_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['16'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['16'][1].init(14, 40, 'e.newVal && e.target == this.get(\'menu\')');
function visit77_16_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['12'][2].init(22, 20, 'str.indexOf(c) != -1');
function visit76_12_2(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['12'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].branchData['12'][1].init(17, 25, 'c && str.indexOf(c) != -1');
function visit75_12_1(result) {
  _$jscoverage['/combobox/multi-value-combobox.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/multi-value-combobox.js'].lineData[6]++;
KISSY.add("combobox/multi-value-combobox", function(S, getCursor, ComboBox) {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[0]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[8]++;
  var SUFFIX = 'suffix', rWhitespace = /\s|\xa0/;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[11]++;
  function strContainsChar(str, c) {
    _$jscoverage['/combobox/multi-value-combobox.js'].functionData[1]++;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[12]++;
    return visit75_12_1(c && visit76_12_2(str.indexOf(c) != -1));
  }
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[15]++;
  function beforeVisibleChange(e) {
    _$jscoverage['/combobox/multi-value-combobox.js'].functionData[2]++;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[16]++;
    if (visit77_16_1(e.newVal && visit78_16_2(e.target == this.get('menu')))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[17]++;
      this.alignWithCursor();
    }
  }
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[26]++;
  return ComboBox.extend({
  syncUI: function() {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[3]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[29]++;
  var self = this, menu;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[31]++;
  if (visit79_31_1(self.get('alignWithCursor'))) {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[32]++;
    menu = self.get('menu');
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[33]++;
    menu.setInternal('align', null);
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[34]++;
    menu.on('beforeVisibleChange', beforeVisibleChange, this);
  }
}, 
  getValueForAutocomplete: function() {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[4]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[40]++;
  var self = this, inputDesc = getInputDesc(self), tokens = inputDesc.tokens, tokenIndex = inputDesc.tokenIndex, separator = self.get("separator"), separatorType = self.get("separatorType"), token = tokens[tokenIndex], l = token.length - 1;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[49]++;
  if (visit80_49_1(separatorType != SUFFIX)) {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[50]++;
    if (visit81_50_1(strContainsChar(separator, token.charAt(0)))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[51]++;
      token = token.slice(1);
    } else {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[54]++;
      return undefined;
    }
  } else {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[58]++;
    if (visit82_58_1(visit83_58_2(separatorType == SUFFIX) && strContainsChar(separator, token.charAt(l)))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[59]++;
      token = token.slice(0, l);
    }
  }
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[62]++;
  return token;
}, 
  setValueFromAutocomplete: function(value, setCfg) {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[5]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[67]++;
  var self = this, input = self.get("input"), inputDesc = getInputDesc(self), tokens = inputDesc.tokens, tokenIndex = Math.max(0, inputDesc.tokenIndex), separator = self.get("separator"), cursorPosition, l, separatorType = self.get("separatorType"), nextToken = visit84_76_1(tokens[tokenIndex + 1] || ""), token = tokens[tokenIndex];
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[79]++;
  if (visit85_79_1(separatorType != SUFFIX)) {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[80]++;
    tokens[tokenIndex] = token.charAt(0) + value;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[81]++;
    if (visit86_81_1(nextToken && rWhitespace.test(nextToken.charAt(0)))) {
    } else {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[82]++;
      if (visit87_82_1(value)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[84]++;
        tokens[tokenIndex] += ' ';
      }
    }
  } else {
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[87]++;
    tokens[tokenIndex] = value;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[88]++;
    l = token.length - 1;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[90]++;
    if (visit88_90_1(strContainsChar(separator, token.charAt(l)))) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[91]++;
      tokens[tokenIndex] += token.charAt(l);
    } else {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[92]++;
      if (visit89_92_1(separator.length == 1)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[94]++;
        tokens[tokenIndex] += separator;
      }
    }
  }
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[98]++;
  cursorPosition = tokens.slice(0, tokenIndex + 1).join("").length;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[100]++;
  self.set('value', tokens.join(""), setCfg);
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[102]++;
  input.prop("selectionStart", cursorPosition);
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[103]++;
  input.prop("selectionEnd", cursorPosition);
}, 
  'alignWithCursor': function() {
  _$jscoverage['/combobox/multi-value-combobox.js'].functionData[6]++;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[107]++;
  var self = this;
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[110]++;
  var menu = self.get("menu"), cursorOffset, input = self.get("input");
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[113]++;
  cursorOffset = getCursor(input);
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[114]++;
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
  _$jscoverage['/combobox/multi-value-combobox.js'].lineData[173]++;
  function getInputDesc(self) {
    _$jscoverage['/combobox/multi-value-combobox.js'].functionData[7]++;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[174]++;
    var input = self.get("input"), inputVal = self.get('value'), tokens = [], cache = [], literal = self.get("literal"), separator = self.get("separator"), separatorType = self.get("separatorType"), inLiteral = false, allowWhitespaceAsStandaloneToken = visit90_183_1(separatorType != SUFFIX), cursorPosition = input.prop('selectionStart'), i, c, tokenIndex = -1;
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[189]++;
    for (i = 0; visit91_189_1(i < inputVal.length); i++) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[190]++;
      c = inputVal.charAt(i);
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[191]++;
      if (visit92_191_1(literal)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[192]++;
        if (visit93_192_1(c == literal)) {
          _$jscoverage['/combobox/multi-value-combobox.js'].lineData[193]++;
          inLiteral = !inLiteral;
        }
      }
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[196]++;
      if (visit94_196_1(inLiteral)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[197]++;
        cache.push(c);
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[198]++;
        continue;
      }
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[200]++;
      if (visit95_200_1(i == cursorPosition)) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[202]++;
        tokenIndex = tokens.length;
      }
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[207]++;
      if (visit96_207_1(allowWhitespaceAsStandaloneToken && rWhitespace.test(c))) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[208]++;
        if (visit97_208_1(cache.length)) {
          _$jscoverage['/combobox/multi-value-combobox.js'].lineData[209]++;
          tokens.push(cache.join(""));
        }
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[211]++;
        cache = [];
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[212]++;
        cache.push(c);
      } else {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[213]++;
        if (visit98_213_1(strContainsChar(separator, c))) {
          _$jscoverage['/combobox/multi-value-combobox.js'].lineData[214]++;
          if (visit99_214_1(separatorType == SUFFIX)) {
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[215]++;
            cache.push(c);
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[216]++;
            if (visit100_216_1(cache.length)) {
              _$jscoverage['/combobox/multi-value-combobox.js'].lineData[217]++;
              tokens.push(cache.join(""));
            }
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[219]++;
            cache = [];
          } else {
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[221]++;
            if (visit101_221_1(cache.length)) {
              _$jscoverage['/combobox/multi-value-combobox.js'].lineData[222]++;
              tokens.push(cache.join(""));
            }
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[224]++;
            cache = [];
            _$jscoverage['/combobox/multi-value-combobox.js'].lineData[225]++;
            cache.push(c);
          }
        } else {
          _$jscoverage['/combobox/multi-value-combobox.js'].lineData[228]++;
          cache.push(c);
        }
      }
    }
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[232]++;
    if (visit102_232_1(cache.length)) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[233]++;
      tokens.push(cache.join(""));
    }
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[237]++;
    if (visit103_237_1(!tokens.length)) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[238]++;
      tokens.push('');
    }
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[241]++;
    if (visit104_241_1(tokenIndex == -1)) {
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[244]++;
      if (visit105_244_1(visit106_244_2(separatorType == SUFFIX) && strContainsChar(separator, c))) {
        _$jscoverage['/combobox/multi-value-combobox.js'].lineData[245]++;
        tokens.push('');
      }
      _$jscoverage['/combobox/multi-value-combobox.js'].lineData[247]++;
      tokenIndex = tokens.length - 1;
    }
    _$jscoverage['/combobox/multi-value-combobox.js'].lineData[249]++;
    return {
  tokens: tokens, 
  cursorPosition: cursorPosition, 
  tokenIndex: tokenIndex};
  }
}, {
  requires: ['./cursor', './control']});
