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
if (! _$jscoverage['/promise.js']) {
  _$jscoverage['/promise.js'] = {};
  _$jscoverage['/promise.js'].lineData = [];
  _$jscoverage['/promise.js'].lineData[6] = 0;
  _$jscoverage['/promise.js'].lineData[7] = 0;
  _$jscoverage['/promise.js'].lineData[14] = 0;
  _$jscoverage['/promise.js'].lineData[15] = 0;
  _$jscoverage['/promise.js'].lineData[16] = 0;
  _$jscoverage['/promise.js'].lineData[25] = 0;
  _$jscoverage['/promise.js'].lineData[27] = 0;
  _$jscoverage['/promise.js'].lineData[29] = 0;
  _$jscoverage['/promise.js'].lineData[30] = 0;
  _$jscoverage['/promise.js'].lineData[33] = 0;
  _$jscoverage['/promise.js'].lineData[38] = 0;
  _$jscoverage['/promise.js'].lineData[39] = 0;
  _$jscoverage['/promise.js'].lineData[42] = 0;
  _$jscoverage['/promise.js'].lineData[43] = 0;
  _$jscoverage['/promise.js'].lineData[49] = 0;
  _$jscoverage['/promise.js'].lineData[50] = 0;
  _$jscoverage['/promise.js'].lineData[51] = 0;
  _$jscoverage['/promise.js'].lineData[62] = 0;
  _$jscoverage['/promise.js'].lineData[63] = 0;
  _$jscoverage['/promise.js'].lineData[64] = 0;
  _$jscoverage['/promise.js'].lineData[65] = 0;
  _$jscoverage['/promise.js'].lineData[73] = 0;
  _$jscoverage['/promise.js'].lineData[74] = 0;
  _$jscoverage['/promise.js'].lineData[77] = 0;
  _$jscoverage['/promise.js'].lineData[86] = 0;
  _$jscoverage['/promise.js'].lineData[88] = 0;
  _$jscoverage['/promise.js'].lineData[89] = 0;
  _$jscoverage['/promise.js'].lineData[93] = 0;
  _$jscoverage['/promise.js'].lineData[94] = 0;
  _$jscoverage['/promise.js'].lineData[95] = 0;
  _$jscoverage['/promise.js'].lineData[96] = 0;
  _$jscoverage['/promise.js'].lineData[97] = 0;
  _$jscoverage['/promise.js'].lineData[98] = 0;
  _$jscoverage['/promise.js'].lineData[100] = 0;
  _$jscoverage['/promise.js'].lineData[108] = 0;
  _$jscoverage['/promise.js'].lineData[115] = 0;
  _$jscoverage['/promise.js'].lineData[116] = 0;
  _$jscoverage['/promise.js'].lineData[117] = 0;
  _$jscoverage['/promise.js'].lineData[123] = 0;
  _$jscoverage['/promise.js'].lineData[124] = 0;
  _$jscoverage['/promise.js'].lineData[134] = 0;
  _$jscoverage['/promise.js'].lineData[135] = 0;
  _$jscoverage['/promise.js'].lineData[137] = 0;
  _$jscoverage['/promise.js'].lineData[138] = 0;
  _$jscoverage['/promise.js'].lineData[140] = 0;
  _$jscoverage['/promise.js'].lineData[141] = 0;
  _$jscoverage['/promise.js'].lineData[145] = 0;
  _$jscoverage['/promise.js'].lineData[158] = 0;
  _$jscoverage['/promise.js'].lineData[159] = 0;
  _$jscoverage['/promise.js'].lineData[161] = 0;
  _$jscoverage['/promise.js'].lineData[168] = 0;
  _$jscoverage['/promise.js'].lineData[169] = 0;
  _$jscoverage['/promise.js'].lineData[171] = 0;
  _$jscoverage['/promise.js'].lineData[179] = 0;
  _$jscoverage['/promise.js'].lineData[188] = 0;
  _$jscoverage['/promise.js'].lineData[189] = 0;
  _$jscoverage['/promise.js'].lineData[191] = 0;
  _$jscoverage['/promise.js'].lineData[207] = 0;
  _$jscoverage['/promise.js'].lineData[209] = 0;
  _$jscoverage['/promise.js'].lineData[210] = 0;
  _$jscoverage['/promise.js'].lineData[211] = 0;
  _$jscoverage['/promise.js'].lineData[217] = 0;
  _$jscoverage['/promise.js'].lineData[227] = 0;
  _$jscoverage['/promise.js'].lineData[233] = 0;
  _$jscoverage['/promise.js'].lineData[244] = 0;
  _$jscoverage['/promise.js'].lineData[245] = 0;
  _$jscoverage['/promise.js'].lineData[246] = 0;
  _$jscoverage['/promise.js'].lineData[248] = 0;
  _$jscoverage['/promise.js'].lineData[249] = 0;
  _$jscoverage['/promise.js'].lineData[250] = 0;
  _$jscoverage['/promise.js'].lineData[251] = 0;
  _$jscoverage['/promise.js'].lineData[253] = 0;
  _$jscoverage['/promise.js'].lineData[256] = 0;
  _$jscoverage['/promise.js'].lineData[260] = 0;
  _$jscoverage['/promise.js'].lineData[261] = 0;
  _$jscoverage['/promise.js'].lineData[265] = 0;
  _$jscoverage['/promise.js'].lineData[266] = 0;
  _$jscoverage['/promise.js'].lineData[267] = 0;
  _$jscoverage['/promise.js'].lineData[274] = 0;
  _$jscoverage['/promise.js'].lineData[275] = 0;
  _$jscoverage['/promise.js'].lineData[279] = 0;
  _$jscoverage['/promise.js'].lineData[280] = 0;
  _$jscoverage['/promise.js'].lineData[281] = 0;
  _$jscoverage['/promise.js'].lineData[288] = 0;
  _$jscoverage['/promise.js'].lineData[289] = 0;
  _$jscoverage['/promise.js'].lineData[293] = 0;
  _$jscoverage['/promise.js'].lineData[294] = 0;
  _$jscoverage['/promise.js'].lineData[295] = 0;
  _$jscoverage['/promise.js'].lineData[296] = 0;
  _$jscoverage['/promise.js'].lineData[298] = 0;
  _$jscoverage['/promise.js'].lineData[299] = 0;
  _$jscoverage['/promise.js'].lineData[300] = 0;
  _$jscoverage['/promise.js'].lineData[302] = 0;
  _$jscoverage['/promise.js'].lineData[303] = 0;
  _$jscoverage['/promise.js'].lineData[306] = 0;
  _$jscoverage['/promise.js'].lineData[307] = 0;
  _$jscoverage['/promise.js'].lineData[308] = 0;
  _$jscoverage['/promise.js'].lineData[309] = 0;
  _$jscoverage['/promise.js'].lineData[310] = 0;
  _$jscoverage['/promise.js'].lineData[312] = 0;
  _$jscoverage['/promise.js'].lineData[314] = 0;
  _$jscoverage['/promise.js'].lineData[317] = 0;
  _$jscoverage['/promise.js'].lineData[322] = 0;
  _$jscoverage['/promise.js'].lineData[325] = 0;
  _$jscoverage['/promise.js'].lineData[327] = 0;
  _$jscoverage['/promise.js'].lineData[341] = 0;
  _$jscoverage['/promise.js'].lineData[342] = 0;
  _$jscoverage['/promise.js'].lineData[347] = 0;
  _$jscoverage['/promise.js'].lineData[348] = 0;
  _$jscoverage['/promise.js'].lineData[349] = 0;
  _$jscoverage['/promise.js'].lineData[351] = 0;
  _$jscoverage['/promise.js'].lineData[423] = 0;
  _$jscoverage['/promise.js'].lineData[424] = 0;
  _$jscoverage['/promise.js'].lineData[425] = 0;
  _$jscoverage['/promise.js'].lineData[427] = 0;
  _$jscoverage['/promise.js'].lineData[428] = 0;
  _$jscoverage['/promise.js'].lineData[429] = 0;
  _$jscoverage['/promise.js'].lineData[430] = 0;
  _$jscoverage['/promise.js'].lineData[431] = 0;
  _$jscoverage['/promise.js'].lineData[432] = 0;
  _$jscoverage['/promise.js'].lineData[435] = 0;
  _$jscoverage['/promise.js'].lineData[440] = 0;
  _$jscoverage['/promise.js'].lineData[444] = 0;
  _$jscoverage['/promise.js'].lineData[452] = 0;
  _$jscoverage['/promise.js'].lineData[453] = 0;
  _$jscoverage['/promise.js'].lineData[455] = 0;
  _$jscoverage['/promise.js'].lineData[456] = 0;
  _$jscoverage['/promise.js'].lineData[458] = 0;
  _$jscoverage['/promise.js'].lineData[459] = 0;
  _$jscoverage['/promise.js'].lineData[461] = 0;
  _$jscoverage['/promise.js'].lineData[463] = 0;
  _$jscoverage['/promise.js'].lineData[464] = 0;
  _$jscoverage['/promise.js'].lineData[466] = 0;
  _$jscoverage['/promise.js'].lineData[469] = 0;
  _$jscoverage['/promise.js'].lineData[470] = 0;
  _$jscoverage['/promise.js'].lineData[473] = 0;
  _$jscoverage['/promise.js'].lineData[474] = 0;
  _$jscoverage['/promise.js'].lineData[477] = 0;
  _$jscoverage['/promise.js'].lineData[481] = 0;
}
if (! _$jscoverage['/promise.js'].functionData) {
  _$jscoverage['/promise.js'].functionData = [];
  _$jscoverage['/promise.js'].functionData[0] = 0;
  _$jscoverage['/promise.js'].functionData[1] = 0;
  _$jscoverage['/promise.js'].functionData[2] = 0;
  _$jscoverage['/promise.js'].functionData[3] = 0;
  _$jscoverage['/promise.js'].functionData[4] = 0;
  _$jscoverage['/promise.js'].functionData[5] = 0;
  _$jscoverage['/promise.js'].functionData[6] = 0;
  _$jscoverage['/promise.js'].functionData[7] = 0;
  _$jscoverage['/promise.js'].functionData[8] = 0;
  _$jscoverage['/promise.js'].functionData[9] = 0;
  _$jscoverage['/promise.js'].functionData[10] = 0;
  _$jscoverage['/promise.js'].functionData[11] = 0;
  _$jscoverage['/promise.js'].functionData[12] = 0;
  _$jscoverage['/promise.js'].functionData[13] = 0;
  _$jscoverage['/promise.js'].functionData[14] = 0;
  _$jscoverage['/promise.js'].functionData[15] = 0;
  _$jscoverage['/promise.js'].functionData[16] = 0;
  _$jscoverage['/promise.js'].functionData[17] = 0;
  _$jscoverage['/promise.js'].functionData[18] = 0;
  _$jscoverage['/promise.js'].functionData[19] = 0;
  _$jscoverage['/promise.js'].functionData[20] = 0;
  _$jscoverage['/promise.js'].functionData[21] = 0;
  _$jscoverage['/promise.js'].functionData[22] = 0;
  _$jscoverage['/promise.js'].functionData[23] = 0;
  _$jscoverage['/promise.js'].functionData[24] = 0;
  _$jscoverage['/promise.js'].functionData[25] = 0;
  _$jscoverage['/promise.js'].functionData[26] = 0;
  _$jscoverage['/promise.js'].functionData[27] = 0;
  _$jscoverage['/promise.js'].functionData[28] = 0;
  _$jscoverage['/promise.js'].functionData[29] = 0;
  _$jscoverage['/promise.js'].functionData[30] = 0;
  _$jscoverage['/promise.js'].functionData[31] = 0;
  _$jscoverage['/promise.js'].functionData[32] = 0;
  _$jscoverage['/promise.js'].functionData[33] = 0;
  _$jscoverage['/promise.js'].functionData[34] = 0;
  _$jscoverage['/promise.js'].functionData[35] = 0;
  _$jscoverage['/promise.js'].functionData[36] = 0;
  _$jscoverage['/promise.js'].functionData[37] = 0;
  _$jscoverage['/promise.js'].functionData[38] = 0;
  _$jscoverage['/promise.js'].functionData[39] = 0;
  _$jscoverage['/promise.js'].functionData[40] = 0;
  _$jscoverage['/promise.js'].functionData[41] = 0;
}
if (! _$jscoverage['/promise.js'].branchData) {
  _$jscoverage['/promise.js'].branchData = {};
  _$jscoverage['/promise.js'].branchData['15'] = [];
  _$jscoverage['/promise.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['27'] = [];
  _$jscoverage['/promise.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['38'] = [];
  _$jscoverage['/promise.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['42'] = [];
  _$jscoverage['/promise.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['49'] = [];
  _$jscoverage['/promise.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['64'] = [];
  _$jscoverage['/promise.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['73'] = [];
  _$jscoverage['/promise.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['88'] = [];
  _$jscoverage['/promise.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['124'] = [];
  _$jscoverage['/promise.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['138'] = [];
  _$jscoverage['/promise.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['158'] = [];
  _$jscoverage['/promise.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['168'] = [];
  _$jscoverage['/promise.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['209'] = [];
  _$jscoverage['/promise.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['214'] = [];
  _$jscoverage['/promise.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['245'] = [];
  _$jscoverage['/promise.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['250'] = [];
  _$jscoverage['/promise.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['274'] = [];
  _$jscoverage['/promise.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['288'] = [];
  _$jscoverage['/promise.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['294'] = [];
  _$jscoverage['/promise.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['298'] = [];
  _$jscoverage['/promise.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['306'] = [];
  _$jscoverage['/promise.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['308'] = [];
  _$jscoverage['/promise.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['327'] = [];
  _$jscoverage['/promise.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['328'] = [];
  _$jscoverage['/promise.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['330'] = [];
  _$jscoverage['/promise.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['330'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['334'] = [];
  _$jscoverage['/promise.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['342'] = [];
  _$jscoverage['/promise.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['343'] = [];
  _$jscoverage['/promise.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['343'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['424'] = [];
  _$jscoverage['/promise.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['428'] = [];
  _$jscoverage['/promise.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['432'] = [];
  _$jscoverage['/promise.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['463'] = [];
  _$jscoverage['/promise.js'].branchData['463'][1] = new BranchData();
}
_$jscoverage['/promise.js'].branchData['463'][1].init(288, 11, 'result.done');
function visit35_463_1(result) {
  _$jscoverage['/promise.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['432'][1].init(74, 13, '--count === 0');
function visit34_432_1(result) {
  _$jscoverage['/promise.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['428'][1].init(172, 19, 'i < promises.length');
function visit33_428_1(result) {
  _$jscoverage['/promise.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['424'][1].init(58, 6, '!count');
function visit32_424_1(result) {
  _$jscoverage['/promise.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['343'][2].init(49, 35, 'obj[PROMISE_PENDINGS] === undefined');
function visit31_343_2(result) {
  _$jscoverage['/promise.js'].branchData['343'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['343'][1].init(30, 90, '(obj[PROMISE_PENDINGS] === undefined) && (obj[PROMISE_VALUE] instanceof Reject)');
function visit30_343_1(result) {
  _$jscoverage['/promise.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['342'][1].init(16, 121, 'isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (obj[PROMISE_VALUE] instanceof Reject)');
function visit29_342_1(result) {
  _$jscoverage['/promise.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['334'][1].init(-1, 203, '!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE])');
function visit28_334_1(result) {
  _$jscoverage['/promise.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['330'][2].init(149, 35, 'obj[PROMISE_PENDINGS] === undefined');
function visit27_330_2(result) {
  _$jscoverage['/promise.js'].branchData['330'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['330'][1].init(62, 397, '(obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit26_330_1(result) {
  _$jscoverage['/promise.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['328'][1].init(31, 460, 'isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit25_328_1(result) {
  _$jscoverage['/promise.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['327'][1].init(51, 492, '!isRejected(obj) && isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit24_327_1(result) {
  _$jscoverage['/promise.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['308'][1].init(21, 4, 'done');
function visit23_308_1(result) {
  _$jscoverage['/promise.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['306'][1].init(1411, 25, 'value instanceof Promise');
function visit22_306_1(result) {
  _$jscoverage['/promise.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['298'][1].init(138, 24, 'value instanceof Promise');
function visit21_298_1(result) {
  _$jscoverage['/promise.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['294'][1].init(17, 4, 'done');
function visit20_294_1(result) {
  _$jscoverage['/promise.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['288'][1].init(81, 12, 'e.stack || e');
function visit19_288_1(result) {
  _$jscoverage['/promise.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['274'][1].init(164, 12, 'e.stack || e');
function visit18_274_1(result) {
  _$jscoverage['/promise.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['250'][1].init(155, 38, 'self[PROMISE_VALUE] instanceof Promise');
function visit17_250_1(result) {
  _$jscoverage['/promise.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['245'][1].init(13, 24, 'reason instanceof Reject');
function visit16_245_1(result) {
  _$jscoverage['/promise.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['214'][1].init(274, 21, 'fulfilled || rejected');
function visit15_214_1(result) {
  _$jscoverage['/promise.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['209'][1].init(27, 12, 'e.stack || e');
function visit14_209_1(result) {
  _$jscoverage['/promise.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['168'][1].init(17, 32, 'this[PROMISE_PROGRESS_LISTENERS]');
function visit13_168_1(result) {
  _$jscoverage['/promise.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['158'][1].init(17, 16, 'progressListener');
function visit12_158_1(result) {
  _$jscoverage['/promise.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['138'][1].init(121, 15, 'v === undefined');
function visit11_138_1(result) {
  _$jscoverage['/promise.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['124'][1].init(17, 29, 'obj && obj instanceof Promise');
function visit10_124_1(result) {
  _$jscoverage['/promise.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['88'][1].init(83, 39, '!(pendings = promise[PROMISE_PENDINGS])');
function visit9_88_1(result) {
  _$jscoverage['/promise.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['73'][1].init(333, 24, 'promise || new Promise()');
function visit8_73_1(result) {
  _$jscoverage['/promise.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['64'][1].init(38, 24, '!(self instanceof Defer)');
function visit7_64_1(result) {
  _$jscoverage['/promise.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['49'][1].init(203, 9, 'fulfilled');
function visit6_49_1(result) {
  _$jscoverage['/promise.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['42'][1].init(324, 12, 'isPromise(v)');
function visit5_42_1(result) {
  _$jscoverage['/promise.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['38'][1].init(180, 8, 'pendings');
function visit4_38_1(result) {
  _$jscoverage['/promise.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['27'][1].init(45, 25, 'promise instanceof Reject');
function visit3_27_1(result) {
  _$jscoverage['/promise.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['15'][2].init(13, 30, 'typeof console !== \'undefined\'');
function visit2_15_2(result) {
  _$jscoverage['/promise.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['15'][1].init(13, 47, 'typeof console !== \'undefined\' && console.error');
function visit1_15_1(result) {
  _$jscoverage['/promise.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/promise.js'].functionData[0]++;
  _$jscoverage['/promise.js'].lineData[7]++;
  var PROMISE_VALUE = '__promise_value', undefined = undefined, processImmediate = S.setImmediate, logger = S.getLogger('s/promise'), PROMISE_PROGRESS_LISTENERS = '__promise_progress_listeners', PROMISE_PENDINGS = '__promise_pendings';
  _$jscoverage['/promise.js'].lineData[14]++;
  function logError(str) {
    _$jscoverage['/promise.js'].functionData[1]++;
    _$jscoverage['/promise.js'].lineData[15]++;
    if (visit1_15_1(visit2_15_2(typeof console !== 'undefined') && console.error)) {
      _$jscoverage['/promise.js'].lineData[16]++;
      console.error(str);
    }
  }
  _$jscoverage['/promise.js'].lineData[25]++;
  function promiseWhen(promise, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[2]++;
    _$jscoverage['/promise.js'].lineData[27]++;
    if (visit3_27_1(promise instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[29]++;
      processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[3]++;
  _$jscoverage['/promise.js'].lineData[30]++;
  rejected.call(promise, promise[PROMISE_VALUE]);
});
    } else {
      _$jscoverage['/promise.js'].lineData[33]++;
      var v = promise[PROMISE_VALUE], pendings = promise[PROMISE_PENDINGS];
      _$jscoverage['/promise.js'].lineData[38]++;
      if (visit4_38_1(pendings)) {
        _$jscoverage['/promise.js'].lineData[39]++;
        pendings.push([fulfilled, rejected]);
      } else {
        _$jscoverage['/promise.js'].lineData[42]++;
        if (visit5_42_1(isPromise(v))) {
          _$jscoverage['/promise.js'].lineData[43]++;
          promiseWhen(v, fulfilled, rejected);
        } else {
          _$jscoverage['/promise.js'].lineData[49]++;
          if (visit6_49_1(fulfilled)) {
            _$jscoverage['/promise.js'].lineData[50]++;
            processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[4]++;
  _$jscoverage['/promise.js'].lineData[51]++;
  fulfilled.call(promise, v);
});
          }
        }
      }
    }
  }
  _$jscoverage['/promise.js'].lineData[62]++;
  function Defer(promise) {
    _$jscoverage['/promise.js'].functionData[5]++;
    _$jscoverage['/promise.js'].lineData[63]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[64]++;
    if (visit7_64_1(!(self instanceof Defer))) {
      _$jscoverage['/promise.js'].lineData[65]++;
      return new Defer(promise);
    }
    _$jscoverage['/promise.js'].lineData[73]++;
    self.promise = visit8_73_1(promise || new Promise());
    _$jscoverage['/promise.js'].lineData[74]++;
    self.promise.defer = self;
  }
  _$jscoverage['/promise.js'].lineData[77]++;
  Defer.prototype = {
  constructor: Defer, 
  resolve: function(value) {
  _$jscoverage['/promise.js'].functionData[6]++;
  _$jscoverage['/promise.js'].lineData[86]++;
  var promise = this.promise, pendings;
  _$jscoverage['/promise.js'].lineData[88]++;
  if (visit9_88_1(!(pendings = promise[PROMISE_PENDINGS]))) {
    _$jscoverage['/promise.js'].lineData[89]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[93]++;
  promise[PROMISE_VALUE] = value;
  _$jscoverage['/promise.js'].lineData[94]++;
  pendings = [].concat(pendings);
  _$jscoverage['/promise.js'].lineData[95]++;
  promise[PROMISE_PENDINGS] = undefined;
  _$jscoverage['/promise.js'].lineData[96]++;
  promise[PROMISE_PROGRESS_LISTENERS] = undefined;
  _$jscoverage['/promise.js'].lineData[97]++;
  S.each(pendings, function(p) {
  _$jscoverage['/promise.js'].functionData[7]++;
  _$jscoverage['/promise.js'].lineData[98]++;
  promiseWhen(promise, p[0], p[1]);
});
  _$jscoverage['/promise.js'].lineData[100]++;
  return value;
}, 
  reject: function(reason) {
  _$jscoverage['/promise.js'].functionData[8]++;
  _$jscoverage['/promise.js'].lineData[108]++;
  return this.resolve(new Reject(reason));
}, 
  notify: function(message) {
  _$jscoverage['/promise.js'].functionData[9]++;
  _$jscoverage['/promise.js'].lineData[115]++;
  S.each(this.promise[PROMISE_PROGRESS_LISTENERS], function(listener) {
  _$jscoverage['/promise.js'].functionData[10]++;
  _$jscoverage['/promise.js'].lineData[116]++;
  processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[11]++;
  _$jscoverage['/promise.js'].lineData[117]++;
  listener(message);
});
});
}};
  _$jscoverage['/promise.js'].lineData[123]++;
  function isPromise(obj) {
    _$jscoverage['/promise.js'].functionData[12]++;
    _$jscoverage['/promise.js'].lineData[124]++;
    return visit10_124_1(obj && obj instanceof Promise);
  }
  _$jscoverage['/promise.js'].lineData[134]++;
  function Promise(v) {
    _$jscoverage['/promise.js'].functionData[13]++;
    _$jscoverage['/promise.js'].lineData[135]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[137]++;
    self[PROMISE_VALUE] = v;
    _$jscoverage['/promise.js'].lineData[138]++;
    if (visit11_138_1(v === undefined)) {
      _$jscoverage['/promise.js'].lineData[140]++;
      self[PROMISE_PENDINGS] = [];
      _$jscoverage['/promise.js'].lineData[141]++;
      self[PROMISE_PROGRESS_LISTENERS] = [];
    }
  }
  _$jscoverage['/promise.js'].lineData[145]++;
  Promise.prototype = {
  constructor: Promise, 
  then: function(fulfilled, rejected, progressListener) {
  _$jscoverage['/promise.js'].functionData[14]++;
  _$jscoverage['/promise.js'].lineData[158]++;
  if (visit12_158_1(progressListener)) {
    _$jscoverage['/promise.js'].lineData[159]++;
    this.progress(progressListener);
  }
  _$jscoverage['/promise.js'].lineData[161]++;
  return when(this, fulfilled, rejected);
}, 
  progress: function(progressListener) {
  _$jscoverage['/promise.js'].functionData[15]++;
  _$jscoverage['/promise.js'].lineData[168]++;
  if (visit13_168_1(this[PROMISE_PROGRESS_LISTENERS])) {
    _$jscoverage['/promise.js'].lineData[169]++;
    this[PROMISE_PROGRESS_LISTENERS].push(progressListener);
  }
  _$jscoverage['/promise.js'].lineData[171]++;
  return this;
}, 
  fail: function(rejected) {
  _$jscoverage['/promise.js'].functionData[16]++;
  _$jscoverage['/promise.js'].lineData[179]++;
  return when(this, 0, rejected);
}, 
  fin: function(callback) {
  _$jscoverage['/promise.js'].functionData[17]++;
  _$jscoverage['/promise.js'].lineData[188]++;
  return when(this, function(value) {
  _$jscoverage['/promise.js'].functionData[18]++;
  _$jscoverage['/promise.js'].lineData[189]++;
  return callback(value, true);
}, function(reason) {
  _$jscoverage['/promise.js'].functionData[19]++;
  _$jscoverage['/promise.js'].lineData[191]++;
  return callback(reason, false);
});
}, 
  done: function(fulfilled, rejected) {
  _$jscoverage['/promise.js'].functionData[20]++;
  _$jscoverage['/promise.js'].lineData[207]++;
  var self = this, onUnhandledError = function(e) {
  _$jscoverage['/promise.js'].functionData[21]++;
  _$jscoverage['/promise.js'].lineData[209]++;
  S.log(visit14_209_1(e.stack || e), 'error');
  _$jscoverage['/promise.js'].lineData[210]++;
  setTimeout(function() {
  _$jscoverage['/promise.js'].functionData[22]++;
  _$jscoverage['/promise.js'].lineData[211]++;
  throw e;
}, 0);
}, promiseToHandle = visit15_214_1(fulfilled || rejected) ? self.then(fulfilled, rejected) : self;
  _$jscoverage['/promise.js'].lineData[217]++;
  promiseToHandle.fail(onUnhandledError);
}, 
  isResolved: function() {
  _$jscoverage['/promise.js'].functionData[23]++;
  _$jscoverage['/promise.js'].lineData[227]++;
  return isResolved(this);
}, 
  isRejected: function() {
  _$jscoverage['/promise.js'].functionData[24]++;
  _$jscoverage['/promise.js'].lineData[233]++;
  return isRejected(this);
}};
  _$jscoverage['/promise.js'].lineData[244]++;
  function Reject(reason) {
    _$jscoverage['/promise.js'].functionData[25]++;
    _$jscoverage['/promise.js'].lineData[245]++;
    if (visit16_245_1(reason instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[246]++;
      return reason;
    }
    _$jscoverage['/promise.js'].lineData[248]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[249]++;
    Promise.apply(self, arguments);
    _$jscoverage['/promise.js'].lineData[250]++;
    if (visit17_250_1(self[PROMISE_VALUE] instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[251]++;
      logger.error('assert.not(this.__promise_value instanceof promise) in Reject constructor');
    }
    _$jscoverage['/promise.js'].lineData[253]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[256]++;
  S.extend(Reject, Promise);
  _$jscoverage['/promise.js'].lineData[260]++;
  function when(value, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[26]++;
    _$jscoverage['/promise.js'].lineData[261]++;
    var defer = new Defer(), done = 0;
    _$jscoverage['/promise.js'].lineData[265]++;
    function _fulfilled(value) {
      _$jscoverage['/promise.js'].functionData[27]++;
      _$jscoverage['/promise.js'].lineData[266]++;
      try {
        _$jscoverage['/promise.js'].lineData[267]++;
        return fulfilled ? fulfilled.call(this, value) : value;
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[274]++;
  logError(visit18_274_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[275]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[279]++;
    function _rejected(reason) {
      _$jscoverage['/promise.js'].functionData[28]++;
      _$jscoverage['/promise.js'].lineData[280]++;
      try {
        _$jscoverage['/promise.js'].lineData[281]++;
        return rejected ? rejected.call(this, reason) : new Reject(reason);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[288]++;
  logError(visit19_288_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[289]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[293]++;
    function finalFulfill(value) {
      _$jscoverage['/promise.js'].functionData[29]++;
      _$jscoverage['/promise.js'].lineData[294]++;
      if (visit20_294_1(done)) {
        _$jscoverage['/promise.js'].lineData[295]++;
        logger.error('already done at fulfilled');
        _$jscoverage['/promise.js'].lineData[296]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[298]++;
      if (visit21_298_1(value instanceof Promise)) {
        _$jscoverage['/promise.js'].lineData[299]++;
        logger.error('assert.not(value instanceof Promise) in when');
        _$jscoverage['/promise.js'].lineData[300]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[302]++;
      done = 1;
      _$jscoverage['/promise.js'].lineData[303]++;
      defer.resolve(_fulfilled.call(this, value));
    }
    _$jscoverage['/promise.js'].lineData[306]++;
    if (visit22_306_1(value instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[307]++;
      promiseWhen(value, finalFulfill, function(reason) {
  _$jscoverage['/promise.js'].functionData[30]++;
  _$jscoverage['/promise.js'].lineData[308]++;
  if (visit23_308_1(done)) {
    _$jscoverage['/promise.js'].lineData[309]++;
    logger.error('already done at rejected');
    _$jscoverage['/promise.js'].lineData[310]++;
    return;
  }
  _$jscoverage['/promise.js'].lineData[312]++;
  done = 1;
  _$jscoverage['/promise.js'].lineData[314]++;
  defer.resolve(_rejected.call(this, reason));
});
    } else {
      _$jscoverage['/promise.js'].lineData[317]++;
      finalFulfill(value);
    }
    _$jscoverage['/promise.js'].lineData[322]++;
    return defer.promise;
  }
  _$jscoverage['/promise.js'].lineData[325]++;
  function isResolved(obj) {
    _$jscoverage['/promise.js'].functionData[31]++;
    _$jscoverage['/promise.js'].lineData[327]++;
    return visit24_327_1(!isRejected(obj) && visit25_328_1(isPromise(obj) && visit26_330_1((visit27_330_2(obj[PROMISE_PENDINGS] === undefined)) && (visit28_334_1(!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))))));
  }
  _$jscoverage['/promise.js'].lineData[341]++;
  function isRejected(obj) {
    _$jscoverage['/promise.js'].functionData[32]++;
    _$jscoverage['/promise.js'].lineData[342]++;
    return visit29_342_1(isPromise(obj) && visit30_343_1((visit31_343_2(obj[PROMISE_PENDINGS] === undefined)) && (obj[PROMISE_VALUE] instanceof Reject)));
  }
  _$jscoverage['/promise.js'].lineData[347]++;
  KISSY.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[348]++;
  KISSY.Promise = Promise;
  _$jscoverage['/promise.js'].lineData[349]++;
  Promise.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[351]++;
  S.mix(Promise, {
  when: when, 
  isPromise: isPromise, 
  isResolved: isResolved, 
  isRejected: isRejected, 
  all: function(promises) {
  _$jscoverage['/promise.js'].functionData[33]++;
  _$jscoverage['/promise.js'].lineData[423]++;
  var count = promises.length;
  _$jscoverage['/promise.js'].lineData[424]++;
  if (visit32_424_1(!count)) {
    _$jscoverage['/promise.js'].lineData[425]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[427]++;
  var defer = Defer();
  _$jscoverage['/promise.js'].lineData[428]++;
  for (var i = 0; visit33_428_1(i < promises.length); i++) {
    _$jscoverage['/promise.js'].lineData[429]++;
    (function(promise, i) {
  _$jscoverage['/promise.js'].functionData[34]++;
  _$jscoverage['/promise.js'].lineData[430]++;
  when(promise, function(value) {
  _$jscoverage['/promise.js'].functionData[35]++;
  _$jscoverage['/promise.js'].lineData[431]++;
  promises[i] = value;
  _$jscoverage['/promise.js'].lineData[432]++;
  if (visit34_432_1(--count === 0)) {
    _$jscoverage['/promise.js'].lineData[435]++;
    defer.resolve(promises);
  }
}, function(r) {
  _$jscoverage['/promise.js'].functionData[36]++;
  _$jscoverage['/promise.js'].lineData[440]++;
  defer.reject(r);
});
})(promises[i], i);
  }
  _$jscoverage['/promise.js'].lineData[444]++;
  return defer.promise;
}, 
  async: function(generatorFunc) {
  _$jscoverage['/promise.js'].functionData[37]++;
  _$jscoverage['/promise.js'].lineData[452]++;
  return function() {
  _$jscoverage['/promise.js'].functionData[38]++;
  _$jscoverage['/promise.js'].lineData[453]++;
  var generator = generatorFunc.apply(this, arguments);
  _$jscoverage['/promise.js'].lineData[455]++;
  function doAction(action, arg) {
    _$jscoverage['/promise.js'].functionData[39]++;
    _$jscoverage['/promise.js'].lineData[456]++;
    var result;
    _$jscoverage['/promise.js'].lineData[458]++;
    try {
      _$jscoverage['/promise.js'].lineData[459]++;
      result = generator[action](arg);
    }    catch (e) {
  _$jscoverage['/promise.js'].lineData[461]++;
  return new Reject(e);
}
    _$jscoverage['/promise.js'].lineData[463]++;
    if (visit35_463_1(result.done)) {
      _$jscoverage['/promise.js'].lineData[464]++;
      return result.value;
    }
    _$jscoverage['/promise.js'].lineData[466]++;
    return when(result.value, next, throwEx);
  }
  _$jscoverage['/promise.js'].lineData[469]++;
  function next(v) {
    _$jscoverage['/promise.js'].functionData[40]++;
    _$jscoverage['/promise.js'].lineData[470]++;
    return doAction('next', v);
  }
  _$jscoverage['/promise.js'].lineData[473]++;
  function throwEx(e) {
    _$jscoverage['/promise.js'].functionData[41]++;
    _$jscoverage['/promise.js'].lineData[474]++;
    return doAction('throw', e);
  }
  _$jscoverage['/promise.js'].lineData[477]++;
  return next();
};
}});
  _$jscoverage['/promise.js'].lineData[481]++;
  return Promise;
});
