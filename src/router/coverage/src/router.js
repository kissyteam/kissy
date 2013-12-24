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
if (! _$jscoverage['/router.js']) {
  _$jscoverage['/router.js'] = {};
  _$jscoverage['/router.js'].lineData = [];
  _$jscoverage['/router.js'].lineData[5] = 0;
  _$jscoverage['/router.js'].lineData[6] = 0;
  _$jscoverage['/router.js'].lineData[7] = 0;
  _$jscoverage['/router.js'].lineData[8] = 0;
  _$jscoverage['/router.js'].lineData[9] = 0;
  _$jscoverage['/router.js'].lineData[10] = 0;
  _$jscoverage['/router.js'].lineData[11] = 0;
  _$jscoverage['/router.js'].lineData[12] = 0;
  _$jscoverage['/router.js'].lineData[13] = 0;
  _$jscoverage['/router.js'].lineData[14] = 0;
  _$jscoverage['/router.js'].lineData[15] = 0;
  _$jscoverage['/router.js'].lineData[16] = 0;
  _$jscoverage['/router.js'].lineData[17] = 0;
  _$jscoverage['/router.js'].lineData[18] = 0;
  _$jscoverage['/router.js'].lineData[19] = 0;
  _$jscoverage['/router.js'].lineData[21] = 0;
  _$jscoverage['/router.js'].lineData[24] = 0;
  _$jscoverage['/router.js'].lineData[25] = 0;
  _$jscoverage['/router.js'].lineData[26] = 0;
  _$jscoverage['/router.js'].lineData[27] = 0;
  _$jscoverage['/router.js'].lineData[28] = 0;
  _$jscoverage['/router.js'].lineData[29] = 0;
  _$jscoverage['/router.js'].lineData[31] = 0;
  _$jscoverage['/router.js'].lineData[35] = 0;
  _$jscoverage['/router.js'].lineData[36] = 0;
  _$jscoverage['/router.js'].lineData[37] = 0;
  _$jscoverage['/router.js'].lineData[39] = 0;
  _$jscoverage['/router.js'].lineData[40] = 0;
  _$jscoverage['/router.js'].lineData[41] = 0;
  _$jscoverage['/router.js'].lineData[42] = 0;
  _$jscoverage['/router.js'].lineData[44] = 0;
  _$jscoverage['/router.js'].lineData[45] = 0;
  _$jscoverage['/router.js'].lineData[46] = 0;
  _$jscoverage['/router.js'].lineData[47] = 0;
  _$jscoverage['/router.js'].lineData[48] = 0;
  _$jscoverage['/router.js'].lineData[49] = 0;
  _$jscoverage['/router.js'].lineData[50] = 0;
  _$jscoverage['/router.js'].lineData[51] = 0;
  _$jscoverage['/router.js'].lineData[52] = 0;
  _$jscoverage['/router.js'].lineData[54] = 0;
  _$jscoverage['/router.js'].lineData[59] = 0;
  _$jscoverage['/router.js'].lineData[62] = 0;
  _$jscoverage['/router.js'].lineData[63] = 0;
  _$jscoverage['/router.js'].lineData[64] = 0;
  _$jscoverage['/router.js'].lineData[66] = 0;
  _$jscoverage['/router.js'].lineData[67] = 0;
  _$jscoverage['/router.js'].lineData[68] = 0;
  _$jscoverage['/router.js'].lineData[69] = 0;
  _$jscoverage['/router.js'].lineData[70] = 0;
  _$jscoverage['/router.js'].lineData[71] = 0;
  _$jscoverage['/router.js'].lineData[72] = 0;
  _$jscoverage['/router.js'].lineData[73] = 0;
  _$jscoverage['/router.js'].lineData[74] = 0;
  _$jscoverage['/router.js'].lineData[75] = 0;
  _$jscoverage['/router.js'].lineData[76] = 0;
  _$jscoverage['/router.js'].lineData[77] = 0;
  _$jscoverage['/router.js'].lineData[79] = 0;
  _$jscoverage['/router.js'].lineData[80] = 0;
  _$jscoverage['/router.js'].lineData[81] = 0;
  _$jscoverage['/router.js'].lineData[85] = 0;
  _$jscoverage['/router.js'].lineData[87] = 0;
  _$jscoverage['/router.js'].lineData[92] = 0;
  _$jscoverage['/router.js'].lineData[95] = 0;
  _$jscoverage['/router.js'].lineData[96] = 0;
  _$jscoverage['/router.js'].lineData[97] = 0;
  _$jscoverage['/router.js'].lineData[98] = 0;
  _$jscoverage['/router.js'].lineData[99] = 0;
  _$jscoverage['/router.js'].lineData[101] = 0;
  _$jscoverage['/router.js'].lineData[102] = 0;
  _$jscoverage['/router.js'].lineData[108] = 0;
  _$jscoverage['/router.js'].lineData[111] = 0;
  _$jscoverage['/router.js'].lineData[119] = 0;
  _$jscoverage['/router.js'].lineData[120] = 0;
  _$jscoverage['/router.js'].lineData[121] = 0;
  _$jscoverage['/router.js'].lineData[122] = 0;
  _$jscoverage['/router.js'].lineData[124] = 0;
  _$jscoverage['/router.js'].lineData[136] = 0;
  _$jscoverage['/router.js'].lineData[137] = 0;
  _$jscoverage['/router.js'].lineData[138] = 0;
  _$jscoverage['/router.js'].lineData[140] = 0;
  _$jscoverage['/router.js'].lineData[141] = 0;
  _$jscoverage['/router.js'].lineData[142] = 0;
  _$jscoverage['/router.js'].lineData[146] = 0;
  _$jscoverage['/router.js'].lineData[148] = 0;
  _$jscoverage['/router.js'].lineData[149] = 0;
  _$jscoverage['/router.js'].lineData[151] = 0;
  _$jscoverage['/router.js'].lineData[153] = 0;
  _$jscoverage['/router.js'].lineData[156] = 0;
  _$jscoverage['/router.js'].lineData[157] = 0;
  _$jscoverage['/router.js'].lineData[165] = 0;
  _$jscoverage['/router.js'].lineData[166] = 0;
  _$jscoverage['/router.js'].lineData[167] = 0;
  _$jscoverage['/router.js'].lineData[170] = 0;
  _$jscoverage['/router.js'].lineData[171] = 0;
  _$jscoverage['/router.js'].lineData[172] = 0;
  _$jscoverage['/router.js'].lineData[173] = 0;
  _$jscoverage['/router.js'].lineData[176] = 0;
  _$jscoverage['/router.js'].lineData[179] = 0;
  _$jscoverage['/router.js'].lineData[180] = 0;
  _$jscoverage['/router.js'].lineData[181] = 0;
  _$jscoverage['/router.js'].lineData[182] = 0;
  _$jscoverage['/router.js'].lineData[187] = 0;
  _$jscoverage['/router.js'].lineData[188] = 0;
  _$jscoverage['/router.js'].lineData[189] = 0;
  _$jscoverage['/router.js'].lineData[197] = 0;
  _$jscoverage['/router.js'].lineData[198] = 0;
  _$jscoverage['/router.js'].lineData[199] = 0;
  _$jscoverage['/router.js'].lineData[200] = 0;
  _$jscoverage['/router.js'].lineData[203] = 0;
  _$jscoverage['/router.js'].lineData[215] = 0;
  _$jscoverage['/router.js'].lineData[216] = 0;
  _$jscoverage['/router.js'].lineData[218] = 0;
  _$jscoverage['/router.js'].lineData[219] = 0;
  _$jscoverage['/router.js'].lineData[223] = 0;
  _$jscoverage['/router.js'].lineData[224] = 0;
  _$jscoverage['/router.js'].lineData[225] = 0;
  _$jscoverage['/router.js'].lineData[227] = 0;
  _$jscoverage['/router.js'].lineData[231] = 0;
  _$jscoverage['/router.js'].lineData[232] = 0;
  _$jscoverage['/router.js'].lineData[238] = 0;
  _$jscoverage['/router.js'].lineData[239] = 0;
  _$jscoverage['/router.js'].lineData[241] = 0;
  _$jscoverage['/router.js'].lineData[242] = 0;
  _$jscoverage['/router.js'].lineData[244] = 0;
  _$jscoverage['/router.js'].lineData[253] = 0;
  _$jscoverage['/router.js'].lineData[254] = 0;
  _$jscoverage['/router.js'].lineData[255] = 0;
  _$jscoverage['/router.js'].lineData[260] = 0;
  _$jscoverage['/router.js'].lineData[261] = 0;
  _$jscoverage['/router.js'].lineData[262] = 0;
  _$jscoverage['/router.js'].lineData[266] = 0;
  _$jscoverage['/router.js'].lineData[268] = 0;
  _$jscoverage['/router.js'].lineData[273] = 0;
  _$jscoverage['/router.js'].lineData[274] = 0;
  _$jscoverage['/router.js'].lineData[276] = 0;
  _$jscoverage['/router.js'].lineData[277] = 0;
  _$jscoverage['/router.js'].lineData[281] = 0;
  _$jscoverage['/router.js'].lineData[282] = 0;
  _$jscoverage['/router.js'].lineData[285] = 0;
  _$jscoverage['/router.js'].lineData[286] = 0;
  _$jscoverage['/router.js'].lineData[287] = 0;
}
if (! _$jscoverage['/router.js'].functionData) {
  _$jscoverage['/router.js'].functionData = [];
  _$jscoverage['/router.js'].functionData[0] = 0;
  _$jscoverage['/router.js'].functionData[1] = 0;
  _$jscoverage['/router.js'].functionData[2] = 0;
  _$jscoverage['/router.js'].functionData[3] = 0;
  _$jscoverage['/router.js'].functionData[4] = 0;
  _$jscoverage['/router.js'].functionData[5] = 0;
  _$jscoverage['/router.js'].functionData[6] = 0;
  _$jscoverage['/router.js'].functionData[7] = 0;
  _$jscoverage['/router.js'].functionData[8] = 0;
  _$jscoverage['/router.js'].functionData[9] = 0;
  _$jscoverage['/router.js'].functionData[10] = 0;
  _$jscoverage['/router.js'].functionData[11] = 0;
  _$jscoverage['/router.js'].functionData[12] = 0;
  _$jscoverage['/router.js'].functionData[13] = 0;
  _$jscoverage['/router.js'].functionData[14] = 0;
  _$jscoverage['/router.js'].functionData[15] = 0;
  _$jscoverage['/router.js'].functionData[16] = 0;
  _$jscoverage['/router.js'].functionData[17] = 0;
}
if (! _$jscoverage['/router.js'].branchData) {
  _$jscoverage['/router.js'].branchData = {};
  _$jscoverage['/router.js'].branchData['19'] = [];
  _$jscoverage['/router.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['25'] = [];
  _$jscoverage['/router.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['27'] = [];
  _$jscoverage['/router.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['41'] = [];
  _$jscoverage['/router.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['45'] = [];
  _$jscoverage['/router.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['68'] = [];
  _$jscoverage['/router.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['75'] = [];
  _$jscoverage['/router.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['80'] = [];
  _$jscoverage['/router.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['101'] = [];
  _$jscoverage['/router.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['120'] = [];
  _$jscoverage['/router.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['137'] = [];
  _$jscoverage['/router.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['140'] = [];
  _$jscoverage['/router.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['141'] = [];
  _$jscoverage['/router.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['149'] = [];
  _$jscoverage['/router.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['156'] = [];
  _$jscoverage['/router.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['171'] = [];
  _$jscoverage['/router.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['172'] = [];
  _$jscoverage['/router.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['180'] = [];
  _$jscoverage['/router.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['181'] = [];
  _$jscoverage['/router.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['198'] = [];
  _$jscoverage['/router.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['199'] = [];
  _$jscoverage['/router.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['216'] = [];
  _$jscoverage['/router.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['218'] = [];
  _$jscoverage['/router.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['219'] = [];
  _$jscoverage['/router.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['223'] = [];
  _$jscoverage['/router.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['231'] = [];
  _$jscoverage['/router.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['232'] = [];
  _$jscoverage['/router.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['238'] = [];
  _$jscoverage['/router.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['239'] = [];
  _$jscoverage['/router.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['253'] = [];
  _$jscoverage['/router.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['261'] = [];
  _$jscoverage['/router.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['273'] = [];
  _$jscoverage['/router.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['276'] = [];
  _$jscoverage['/router.js'].branchData['276'][1] = new BranchData();
}
_$jscoverage['/router.js'].branchData['276'][1].init(742, 12, 'opts.success');
function visit48_276_1(result) {
  _$jscoverage['/router.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['273'][1].init(660, 17, 'opts.triggerRoute');
function visit47_273_1(result) {
  _$jscoverage['/router.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['261'][1].init(18, 40, 'useNativeHistory && supportNativeHistory');
function visit46_261_1(result) {
  _$jscoverage['/router.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['253'][1].init(882, 42, '!utils.equalsIgnoreSlash(locPath, urlRoot)');
function visit45_253_1(result) {
  _$jscoverage['/router.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['239'][1].init(26, 41, 'utils.equalsIgnoreSlash(locPath, urlRoot)');
function visit44_239_1(result) {
  _$jscoverage['/router.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['238'][1].init(216, 11, 'hashIsValid');
function visit43_238_1(result) {
  _$jscoverage['/router.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['232'][1].init(18, 20, 'supportNativeHistory');
function visit42_232_1(result) {
  _$jscoverage['/router.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['231'][1].init(464, 16, 'useNativeHistory');
function visit41_231_1(result) {
  _$jscoverage['/router.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['223'][1].init(186, 18, 'opts.urlRoot || \'\'');
function visit40_223_1(result) {
  _$jscoverage['/router.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['219'][1].init(21, 42, 'opts.success && opts.success.call(exports)');
function visit39_219_1(result) {
  _$jscoverage['/router.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['218'][1].init(44, 7, 'started');
function visit38_218_1(result) {
  _$jscoverage['/router.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['216'][1].init(17, 10, 'opts || {}');
function visit37_216_1(result) {
  _$jscoverage['/router.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['199'][1].init(18, 23, 'routes[i].path === path');
function visit36_199_1(result) {
  _$jscoverage['/router.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['198'][1].init(45, 5, 'i < l');
function visit35_198_1(result) {
  _$jscoverage['/router.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['181'][1].init(18, 23, 'routes[i].path === path');
function visit34_181_1(result) {
  _$jscoverage['/router.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['180'][1].init(42, 6, 'i >= 0');
function visit33_180_1(result) {
  _$jscoverage['/router.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['172'][1].init(18, 21, 'routes[i].match(path)');
function visit32_172_1(result) {
  _$jscoverage['/router.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['171'][1].init(45, 5, 'i < l');
function visit31_171_1(result) {
  _$jscoverage['/router.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['156'][1].init(928, 25, 'opts && opts.triggerRoute');
function visit30_156_1(result) {
  _$jscoverage['/router.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['149'][1].init(69, 14, 'replaceHistory');
function visit29_149_1(result) {
  _$jscoverage['/router.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['141'][1].init(18, 40, 'useNativeHistory && supportNativeHistory');
function visit28_141_1(result) {
  _$jscoverage['/router.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['140'][1].init(122, 26, 'getUrlForRouter() !== path');
function visit27_140_1(result) {
  _$jscoverage['/router.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['137'][1].init(17, 10, 'opts || {}');
function visit26_137_1(result) {
  _$jscoverage['/router.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['120'][1].init(14, 26, 'typeof prefix !== \'string\'');
function visit25_120_1(result) {
  _$jscoverage['/router.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['101'][1].init(189, 21, 'uri.toString() || \'/\'');
function visit24_101_1(result) {
  _$jscoverage['/router.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['80'][1].init(80, 30, 'callbackIndex !== callbacksLen');
function visit23_80_1(result) {
  _$jscoverage['/router.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['75'][1].init(30, 17, 'cause === \'route\'');
function visit22_75_1(result) {
  _$jscoverage['/router.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['68'][1].init(40, 13, 'index !== len');
function visit21_68_1(result) {
  _$jscoverage['/router.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['45'][1].init(76, 53, 'S.startsWith(request.path + \'/\', middleware[0] + \'/\')');
function visit20_45_1(result) {
  _$jscoverage['/router.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['41'][1].init(40, 13, 'index === len');
function visit19_41_1(result) {
  _$jscoverage['/router.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['27'][1].init(84, 40, 'useNativeHistory && supportNativeHistory');
function visit18_27_1(result) {
  _$jscoverage['/router.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['25'][1].init(16, 20, 'url || location.href');
function visit17_25_1(result) {
  _$jscoverage['/router.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['19'][1].init(495, 28, 'history && history.pushState');
function visit16_19_1(result) {
  _$jscoverage['/router.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].lineData[5]++;
KISSY.add(function(S, require, exports) {
  _$jscoverage['/router.js'].functionData[0]++;
  _$jscoverage['/router.js'].lineData[6]++;
  var middlewares = [];
  _$jscoverage['/router.js'].lineData[7]++;
  var routes = [];
  _$jscoverage['/router.js'].lineData[8]++;
  var utils = require('./router/utils');
  _$jscoverage['/router.js'].lineData[9]++;
  var Route = require('./router/route');
  _$jscoverage['/router.js'].lineData[10]++;
  var Uri = require('uri');
  _$jscoverage['/router.js'].lineData[11]++;
  var Request = require('./router/request');
  _$jscoverage['/router.js'].lineData[12]++;
  var DomEvent = require('event/dom');
  _$jscoverage['/router.js'].lineData[13]++;
  var started = false;
  _$jscoverage['/router.js'].lineData[14]++;
  var useNativeHistory;
  _$jscoverage['/router.js'].lineData[15]++;
  var urlRoot;
  _$jscoverage['/router.js'].lineData[16]++;
  var win = S.Env.host;
  _$jscoverage['/router.js'].lineData[17]++;
  var history = win.history;
  _$jscoverage['/router.js'].lineData[18]++;
  var supportNativeHashChange = S.Features.isHashChangeSupported();
  _$jscoverage['/router.js'].lineData[19]++;
  var supportNativeHistory = !!(visit16_19_1(history && history.pushState));
  _$jscoverage['/router.js'].lineData[21]++;
  var BREATH_INTERVAL = 100;
  _$jscoverage['/router.js'].lineData[24]++;
  function getUrlForRouter(url) {
    _$jscoverage['/router.js'].functionData[1]++;
    _$jscoverage['/router.js'].lineData[25]++;
    url = visit17_25_1(url || location.href);
    _$jscoverage['/router.js'].lineData[26]++;
    var uri = new Uri(url);
    _$jscoverage['/router.js'].lineData[27]++;
    if (visit18_27_1(useNativeHistory && supportNativeHistory)) {
      _$jscoverage['/router.js'].lineData[28]++;
      var query = uri.query;
      _$jscoverage['/router.js'].lineData[29]++;
      return uri.getPath().substr(urlRoot.length) + (query.has() ? ('?' + query.toString()) : '');
    } else {
      _$jscoverage['/router.js'].lineData[31]++;
      return utils.getHash(uri);
    }
  }
  _$jscoverage['/router.js'].lineData[35]++;
  function fireMiddleWare(request, response, cb) {
    _$jscoverage['/router.js'].functionData[2]++;
    _$jscoverage['/router.js'].lineData[36]++;
    var index = -1;
    _$jscoverage['/router.js'].lineData[37]++;
    var len = middlewares.length;
    _$jscoverage['/router.js'].lineData[39]++;
    function next() {
      _$jscoverage['/router.js'].functionData[3]++;
      _$jscoverage['/router.js'].lineData[40]++;
      index++;
      _$jscoverage['/router.js'].lineData[41]++;
      if (visit19_41_1(index === len)) {
        _$jscoverage['/router.js'].lineData[42]++;
        cb(request, response);
      } else {
        _$jscoverage['/router.js'].lineData[44]++;
        var middleware = middlewares[index];
        _$jscoverage['/router.js'].lineData[45]++;
        if (visit20_45_1(S.startsWith(request.path + '/', middleware[0] + '/'))) {
          _$jscoverage['/router.js'].lineData[46]++;
          var prefixLen = middleware[0].length;
          _$jscoverage['/router.js'].lineData[47]++;
          request.url = request.url.slice(prefixLen);
          _$jscoverage['/router.js'].lineData[48]++;
          var path = request.path;
          _$jscoverage['/router.js'].lineData[49]++;
          request.path = request.path.slice(prefixLen);
          _$jscoverage['/router.js'].lineData[50]++;
          middleware[1](request, next);
          _$jscoverage['/router.js'].lineData[51]++;
          request.url = request.originalUrl;
          _$jscoverage['/router.js'].lineData[52]++;
          request.path = path;
        } else {
          _$jscoverage['/router.js'].lineData[54]++;
          next();
        }
      }
    }
    _$jscoverage['/router.js'].lineData[59]++;
    next();
  }
  _$jscoverage['/router.js'].lineData[62]++;
  function fireRoutes(request, response) {
    _$jscoverage['/router.js'].functionData[4]++;
    _$jscoverage['/router.js'].lineData[63]++;
    var index = -1;
    _$jscoverage['/router.js'].lineData[64]++;
    var len = routes.length;
    _$jscoverage['/router.js'].lineData[66]++;
    function next() {
      _$jscoverage['/router.js'].functionData[5]++;
      _$jscoverage['/router.js'].lineData[67]++;
      index++;
      _$jscoverage['/router.js'].lineData[68]++;
      if (visit21_68_1(index !== len)) {
        _$jscoverage['/router.js'].lineData[69]++;
        var route = routes[index];
        _$jscoverage['/router.js'].lineData[70]++;
        if ((request.params = route.match(request.path))) {
          _$jscoverage['/router.js'].lineData[71]++;
          var callbackIndex = -1;
          _$jscoverage['/router.js'].lineData[72]++;
          var callbacks = route.callbacks;
          _$jscoverage['/router.js'].lineData[73]++;
          var callbacksLen = callbacks.length;
          _$jscoverage['/router.js'].lineData[74]++;
          var nextCallback = function(cause) {
  _$jscoverage['/router.js'].functionData[6]++;
  _$jscoverage['/router.js'].lineData[75]++;
  if (visit22_75_1(cause === 'route')) {
    _$jscoverage['/router.js'].lineData[76]++;
    nextCallback = null;
    _$jscoverage['/router.js'].lineData[77]++;
    next();
  } else {
    _$jscoverage['/router.js'].lineData[79]++;
    callbackIndex++;
    _$jscoverage['/router.js'].lineData[80]++;
    if (visit23_80_1(callbackIndex !== callbacksLen)) {
      _$jscoverage['/router.js'].lineData[81]++;
      callbacks[callbackIndex](request, response, nextCallback);
    }
  }
};
          _$jscoverage['/router.js'].lineData[85]++;
          nextCallback('');
        } else {
          _$jscoverage['/router.js'].lineData[87]++;
          next();
        }
      }
    }
    _$jscoverage['/router.js'].lineData[92]++;
    next();
  }
  _$jscoverage['/router.js'].lineData[95]++;
  function dispatch() {
    _$jscoverage['/router.js'].functionData[7]++;
    _$jscoverage['/router.js'].lineData[96]++;
    var url = getUrlForRouter();
    _$jscoverage['/router.js'].lineData[97]++;
    var uri = new S.Uri(url);
    _$jscoverage['/router.js'].lineData[98]++;
    var query = uri.query.get();
    _$jscoverage['/router.js'].lineData[99]++;
    uri.query.reset();
    _$jscoverage['/router.js'].lineData[101]++;
    var path = visit24_101_1(uri.toString() || '/');
    _$jscoverage['/router.js'].lineData[102]++;
    var request = new Request({
  query: query, 
  path: path, 
  url: url, 
  originalUrl: url});
    _$jscoverage['/router.js'].lineData[108]++;
    var response = {
  redirect: exports.navigate};
    _$jscoverage['/router.js'].lineData[111]++;
    fireMiddleWare(request, response, fireRoutes);
  }
  _$jscoverage['/router.js'].lineData[119]++;
  exports.use = function(prefix, callback) {
  _$jscoverage['/router.js'].functionData[8]++;
  _$jscoverage['/router.js'].lineData[120]++;
  if (visit25_120_1(typeof prefix !== 'string')) {
    _$jscoverage['/router.js'].lineData[121]++;
    callback = prefix;
    _$jscoverage['/router.js'].lineData[122]++;
    prefix = '';
  }
  _$jscoverage['/router.js'].lineData[124]++;
  middlewares.push([prefix, callback]);
};
  _$jscoverage['/router.js'].lineData[136]++;
  exports.navigate = function(path, opts) {
  _$jscoverage['/router.js'].functionData[9]++;
  _$jscoverage['/router.js'].lineData[137]++;
  opts = visit26_137_1(opts || {});
  _$jscoverage['/router.js'].lineData[138]++;
  var replaceHistory = opts.replaceHistory, normalizedPath;
  _$jscoverage['/router.js'].lineData[140]++;
  if (visit27_140_1(getUrlForRouter() !== path)) {
    _$jscoverage['/router.js'].lineData[141]++;
    if (visit28_141_1(useNativeHistory && supportNativeHistory)) {
      _$jscoverage['/router.js'].lineData[142]++;
      history[replaceHistory ? 'replaceState' : 'pushState']({}, '', utils.getFullPath(path, urlRoot));
      _$jscoverage['/router.js'].lineData[146]++;
      dispatch();
    } else {
      _$jscoverage['/router.js'].lineData[148]++;
      normalizedPath = '#!' + path;
      _$jscoverage['/router.js'].lineData[149]++;
      if (visit29_149_1(replaceHistory)) {
        _$jscoverage['/router.js'].lineData[151]++;
        location.replace(normalizedPath + (supportNativeHashChange ? '' : DomEvent.REPLACE_HISTORY));
      } else {
        _$jscoverage['/router.js'].lineData[153]++;
        location.hash = normalizedPath;
      }
    }
  } else {
    _$jscoverage['/router.js'].lineData[156]++;
    if (visit30_156_1(opts && opts.triggerRoute)) {
      _$jscoverage['/router.js'].lineData[157]++;
      dispatch();
    }
  }
};
  _$jscoverage['/router.js'].lineData[165]++;
  exports.get = function(path) {
  _$jscoverage['/router.js'].functionData[10]++;
  _$jscoverage['/router.js'].lineData[166]++;
  var callbacks = S.makeArray(arguments).slice(1);
  _$jscoverage['/router.js'].lineData[167]++;
  routes.push(new Route(path, callbacks));
};
  _$jscoverage['/router.js'].lineData[170]++;
  exports.matchRoute = function(path) {
  _$jscoverage['/router.js'].functionData[11]++;
  _$jscoverage['/router.js'].lineData[171]++;
  for (var i = 0, l = routes.length; visit31_171_1(i < l); i++) {
    _$jscoverage['/router.js'].lineData[172]++;
    if (visit32_172_1(routes[i].match(path))) {
      _$jscoverage['/router.js'].lineData[173]++;
      return routes[i];
    }
  }
  _$jscoverage['/router.js'].lineData[176]++;
  return false;
};
  _$jscoverage['/router.js'].lineData[179]++;
  exports.removeRoute = function(path) {
  _$jscoverage['/router.js'].functionData[12]++;
  _$jscoverage['/router.js'].lineData[180]++;
  for (var i = routes.length - 1; visit33_180_1(i >= 0); i--) {
    _$jscoverage['/router.js'].lineData[181]++;
    if (visit34_181_1(routes[i].path === path)) {
      _$jscoverage['/router.js'].lineData[182]++;
      routes.splice(i, 1);
    }
  }
};
  _$jscoverage['/router.js'].lineData[187]++;
  exports.clearRoutes = function() {
  _$jscoverage['/router.js'].functionData[13]++;
  _$jscoverage['/router.js'].lineData[188]++;
  middlewares = [];
  _$jscoverage['/router.js'].lineData[189]++;
  routes = [];
};
  _$jscoverage['/router.js'].lineData[197]++;
  exports.hasRoute = function(path) {
  _$jscoverage['/router.js'].functionData[14]++;
  _$jscoverage['/router.js'].lineData[198]++;
  for (var i = 0, l = routes.length; visit35_198_1(i < l); i++) {
    _$jscoverage['/router.js'].lineData[199]++;
    if (visit36_199_1(routes[i].path === path)) {
      _$jscoverage['/router.js'].lineData[200]++;
      return routes[i];
    }
  }
  _$jscoverage['/router.js'].lineData[203]++;
  return false;
};
  _$jscoverage['/router.js'].lineData[215]++;
  exports.start = function(opts) {
  _$jscoverage['/router.js'].functionData[15]++;
  _$jscoverage['/router.js'].lineData[216]++;
  opts = visit37_216_1(opts || {});
  _$jscoverage['/router.js'].lineData[218]++;
  if (visit38_218_1(started)) {
    _$jscoverage['/router.js'].lineData[219]++;
    return visit39_219_1(opts.success && opts.success.call(exports));
  }
  _$jscoverage['/router.js'].lineData[223]++;
  opts.urlRoot = (visit40_223_1(opts.urlRoot || '')).replace(/\/$/, '');
  _$jscoverage['/router.js'].lineData[224]++;
  useNativeHistory = opts.useNativeHistory;
  _$jscoverage['/router.js'].lineData[225]++;
  urlRoot = opts.urlRoot;
  _$jscoverage['/router.js'].lineData[227]++;
  var locPath = location.pathname, hash = getUrlForRouter(), hashIsValid = location.hash.match(/#!.+/);
  _$jscoverage['/router.js'].lineData[231]++;
  if (visit41_231_1(useNativeHistory)) {
    _$jscoverage['/router.js'].lineData[232]++;
    if (visit42_232_1(supportNativeHistory)) {
      _$jscoverage['/router.js'].lineData[238]++;
      if (visit43_238_1(hashIsValid)) {
        _$jscoverage['/router.js'].lineData[239]++;
        if (visit44_239_1(utils.equalsIgnoreSlash(locPath, urlRoot))) {
          _$jscoverage['/router.js'].lineData[241]++;
          history.replaceState({}, '', utils.getFullPath(hash, urlRoot));
          _$jscoverage['/router.js'].lineData[242]++;
          opts.triggerRoute = 1;
        } else {
          _$jscoverage['/router.js'].lineData[244]++;
          S.error('router: location path must be same with urlRoot!');
        }
      }
    } else {
      _$jscoverage['/router.js'].lineData[253]++;
      if (visit45_253_1(!utils.equalsIgnoreSlash(locPath, urlRoot))) {
        _$jscoverage['/router.js'].lineData[254]++;
        location.replace(utils.addEndSlash(urlRoot) + '#!' + hash);
        _$jscoverage['/router.js'].lineData[255]++;
        return undefined;
      }
    }
  }
  _$jscoverage['/router.js'].lineData[260]++;
  setTimeout(function() {
  _$jscoverage['/router.js'].functionData[16]++;
  _$jscoverage['/router.js'].lineData[261]++;
  if (visit46_261_1(useNativeHistory && supportNativeHistory)) {
    _$jscoverage['/router.js'].lineData[262]++;
    DomEvent.on(win, 'popstate', dispatch);
  } else {
    _$jscoverage['/router.js'].lineData[266]++;
    DomEvent.on(win, 'hashchange', dispatch);
    _$jscoverage['/router.js'].lineData[268]++;
    opts.triggerRoute = 1;
  }
  _$jscoverage['/router.js'].lineData[273]++;
  if (visit47_273_1(opts.triggerRoute)) {
    _$jscoverage['/router.js'].lineData[274]++;
    dispatch();
  }
  _$jscoverage['/router.js'].lineData[276]++;
  if (visit48_276_1(opts.success)) {
    _$jscoverage['/router.js'].lineData[277]++;
    opts.success();
  }
}, BREATH_INTERVAL);
  _$jscoverage['/router.js'].lineData[281]++;
  started = true;
  _$jscoverage['/router.js'].lineData[282]++;
  return exports;
};
  _$jscoverage['/router.js'].lineData[285]++;
  exports.stop = function() {
  _$jscoverage['/router.js'].functionData[17]++;
  _$jscoverage['/router.js'].lineData[286]++;
  started = false;
  _$jscoverage['/router.js'].lineData[287]++;
  DomEvent.detach(win, 'popstate hashchange', dispatch);
};
});
