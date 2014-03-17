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
if (! _$jscoverage['/compiler.js']) {
  _$jscoverage['/compiler.js'] = {};
  _$jscoverage['/compiler.js'].lineData = [];
  _$jscoverage['/compiler.js'].lineData[6] = 0;
  _$jscoverage['/compiler.js'].lineData[7] = 0;
  _$jscoverage['/compiler.js'].lineData[8] = 0;
  _$jscoverage['/compiler.js'].lineData[9] = 0;
  _$jscoverage['/compiler.js'].lineData[10] = 0;
  _$jscoverage['/compiler.js'].lineData[11] = 0;
  _$jscoverage['/compiler.js'].lineData[12] = 0;
  _$jscoverage['/compiler.js'].lineData[13] = 0;
  _$jscoverage['/compiler.js'].lineData[14] = 0;
  _$jscoverage['/compiler.js'].lineData[16] = 0;
  _$jscoverage['/compiler.js'].lineData[17] = 0;
  _$jscoverage['/compiler.js'].lineData[20] = 0;
  _$jscoverage['/compiler.js'].lineData[21] = 0;
  _$jscoverage['/compiler.js'].lineData[26] = 0;
  _$jscoverage['/compiler.js'].lineData[28] = 0;
  _$jscoverage['/compiler.js'].lineData[34] = 0;
  _$jscoverage['/compiler.js'].lineData[35] = 0;
  _$jscoverage['/compiler.js'].lineData[38] = 0;
  _$jscoverage['/compiler.js'].lineData[39] = 0;
  _$jscoverage['/compiler.js'].lineData[41] = 0;
  _$jscoverage['/compiler.js'].lineData[42] = 0;
  _$jscoverage['/compiler.js'].lineData[44] = 0;
  _$jscoverage['/compiler.js'].lineData[48] = 0;
  _$jscoverage['/compiler.js'].lineData[49] = 0;
  _$jscoverage['/compiler.js'].lineData[50] = 0;
  _$jscoverage['/compiler.js'].lineData[53] = 0;
  _$jscoverage['/compiler.js'].lineData[56] = 0;
  _$jscoverage['/compiler.js'].lineData[59] = 0;
  _$jscoverage['/compiler.js'].lineData[62] = 0;
  _$jscoverage['/compiler.js'].lineData[63] = 0;
  _$jscoverage['/compiler.js'].lineData[66] = 0;
  _$jscoverage['/compiler.js'].lineData[67] = 0;
  _$jscoverage['/compiler.js'].lineData[75] = 0;
  _$jscoverage['/compiler.js'].lineData[76] = 0;
  _$jscoverage['/compiler.js'].lineData[77] = 0;
  _$jscoverage['/compiler.js'].lineData[78] = 0;
  _$jscoverage['/compiler.js'].lineData[79] = 0;
  _$jscoverage['/compiler.js'].lineData[80] = 0;
  _$jscoverage['/compiler.js'].lineData[81] = 0;
  _$jscoverage['/compiler.js'].lineData[82] = 0;
  _$jscoverage['/compiler.js'].lineData[83] = 0;
  _$jscoverage['/compiler.js'].lineData[85] = 0;
  _$jscoverage['/compiler.js'].lineData[87] = 0;
  _$jscoverage['/compiler.js'].lineData[94] = 0;
  _$jscoverage['/compiler.js'].lineData[95] = 0;
  _$jscoverage['/compiler.js'].lineData[96] = 0;
  _$jscoverage['/compiler.js'].lineData[98] = 0;
  _$jscoverage['/compiler.js'].lineData[103] = 0;
  _$jscoverage['/compiler.js'].lineData[104] = 0;
  _$jscoverage['/compiler.js'].lineData[105] = 0;
  _$jscoverage['/compiler.js'].lineData[106] = 0;
  _$jscoverage['/compiler.js'].lineData[109] = 0;
  _$jscoverage['/compiler.js'].lineData[110] = 0;
  _$jscoverage['/compiler.js'].lineData[111] = 0;
  _$jscoverage['/compiler.js'].lineData[112] = 0;
  _$jscoverage['/compiler.js'].lineData[113] = 0;
  _$jscoverage['/compiler.js'].lineData[114] = 0;
  _$jscoverage['/compiler.js'].lineData[115] = 0;
  _$jscoverage['/compiler.js'].lineData[116] = 0;
  _$jscoverage['/compiler.js'].lineData[117] = 0;
  _$jscoverage['/compiler.js'].lineData[120] = 0;
  _$jscoverage['/compiler.js'].lineData[123] = 0;
  _$jscoverage['/compiler.js'].lineData[125] = 0;
  _$jscoverage['/compiler.js'].lineData[129] = 0;
  _$jscoverage['/compiler.js'].lineData[130] = 0;
  _$jscoverage['/compiler.js'].lineData[131] = 0;
  _$jscoverage['/compiler.js'].lineData[132] = 0;
  _$jscoverage['/compiler.js'].lineData[133] = 0;
  _$jscoverage['/compiler.js'].lineData[134] = 0;
  _$jscoverage['/compiler.js'].lineData[135] = 0;
  _$jscoverage['/compiler.js'].lineData[138] = 0;
  _$jscoverage['/compiler.js'].lineData[139] = 0;
  _$jscoverage['/compiler.js'].lineData[140] = 0;
  _$jscoverage['/compiler.js'].lineData[143] = 0;
  _$jscoverage['/compiler.js'].lineData[144] = 0;
  _$jscoverage['/compiler.js'].lineData[145] = 0;
  _$jscoverage['/compiler.js'].lineData[154] = 0;
  _$jscoverage['/compiler.js'].lineData[157] = 0;
  _$jscoverage['/compiler.js'].lineData[158] = 0;
  _$jscoverage['/compiler.js'].lineData[159] = 0;
  _$jscoverage['/compiler.js'].lineData[160] = 0;
  _$jscoverage['/compiler.js'].lineData[163] = 0;
  _$jscoverage['/compiler.js'].lineData[164] = 0;
  _$jscoverage['/compiler.js'].lineData[170] = 0;
  _$jscoverage['/compiler.js'].lineData[171] = 0;
  _$jscoverage['/compiler.js'].lineData[176] = 0;
  _$jscoverage['/compiler.js'].lineData[177] = 0;
  _$jscoverage['/compiler.js'].lineData[179] = 0;
  _$jscoverage['/compiler.js'].lineData[180] = 0;
  _$jscoverage['/compiler.js'].lineData[181] = 0;
  _$jscoverage['/compiler.js'].lineData[183] = 0;
  _$jscoverage['/compiler.js'].lineData[186] = 0;
  _$jscoverage['/compiler.js'].lineData[187] = 0;
  _$jscoverage['/compiler.js'].lineData[188] = 0;
  _$jscoverage['/compiler.js'].lineData[189] = 0;
  _$jscoverage['/compiler.js'].lineData[190] = 0;
  _$jscoverage['/compiler.js'].lineData[191] = 0;
  _$jscoverage['/compiler.js'].lineData[192] = 0;
  _$jscoverage['/compiler.js'].lineData[194] = 0;
  _$jscoverage['/compiler.js'].lineData[197] = 0;
  _$jscoverage['/compiler.js'].lineData[198] = 0;
  _$jscoverage['/compiler.js'].lineData[199] = 0;
  _$jscoverage['/compiler.js'].lineData[200] = 0;
  _$jscoverage['/compiler.js'].lineData[201] = 0;
  _$jscoverage['/compiler.js'].lineData[202] = 0;
  _$jscoverage['/compiler.js'].lineData[203] = 0;
  _$jscoverage['/compiler.js'].lineData[205] = 0;
  _$jscoverage['/compiler.js'].lineData[208] = 0;
  _$jscoverage['/compiler.js'].lineData[214] = 0;
  _$jscoverage['/compiler.js'].lineData[228] = 0;
  _$jscoverage['/compiler.js'].lineData[229] = 0;
  _$jscoverage['/compiler.js'].lineData[238] = 0;
  _$jscoverage['/compiler.js'].lineData[245] = 0;
  _$jscoverage['/compiler.js'].lineData[252] = 0;
  _$jscoverage['/compiler.js'].lineData[259] = 0;
  _$jscoverage['/compiler.js'].lineData[264] = 0;
  _$jscoverage['/compiler.js'].lineData[265] = 0;
  _$jscoverage['/compiler.js'].lineData[267] = 0;
  _$jscoverage['/compiler.js'].lineData[268] = 0;
  _$jscoverage['/compiler.js'].lineData[270] = 0;
  _$jscoverage['/compiler.js'].lineData[272] = 0;
  _$jscoverage['/compiler.js'].lineData[279] = 0;
  _$jscoverage['/compiler.js'].lineData[287] = 0;
  _$jscoverage['/compiler.js'].lineData[289] = 0;
  _$jscoverage['/compiler.js'].lineData[290] = 0;
  _$jscoverage['/compiler.js'].lineData[291] = 0;
  _$jscoverage['/compiler.js'].lineData[295] = 0;
  _$jscoverage['/compiler.js'].lineData[297] = 0;
  _$jscoverage['/compiler.js'].lineData[302] = 0;
  _$jscoverage['/compiler.js'].lineData[303] = 0;
  _$jscoverage['/compiler.js'].lineData[308] = 0;
  _$jscoverage['/compiler.js'].lineData[314] = 0;
  _$jscoverage['/compiler.js'].lineData[322] = 0;
  _$jscoverage['/compiler.js'].lineData[331] = 0;
  _$jscoverage['/compiler.js'].lineData[333] = 0;
  _$jscoverage['/compiler.js'].lineData[334] = 0;
  _$jscoverage['/compiler.js'].lineData[335] = 0;
  _$jscoverage['/compiler.js'].lineData[337] = 0;
  _$jscoverage['/compiler.js'].lineData[338] = 0;
  _$jscoverage['/compiler.js'].lineData[341] = 0;
  _$jscoverage['/compiler.js'].lineData[343] = 0;
  _$jscoverage['/compiler.js'].lineData[344] = 0;
  _$jscoverage['/compiler.js'].lineData[345] = 0;
  _$jscoverage['/compiler.js'].lineData[348] = 0;
  _$jscoverage['/compiler.js'].lineData[349] = 0;
  _$jscoverage['/compiler.js'].lineData[353] = 0;
  _$jscoverage['/compiler.js'].lineData[358] = 0;
  _$jscoverage['/compiler.js'].lineData[365] = 0;
  _$jscoverage['/compiler.js'].lineData[372] = 0;
  _$jscoverage['/compiler.js'].lineData[374] = 0;
  _$jscoverage['/compiler.js'].lineData[375] = 0;
  _$jscoverage['/compiler.js'].lineData[377] = 0;
  _$jscoverage['/compiler.js'].lineData[378] = 0;
  _$jscoverage['/compiler.js'].lineData[380] = 0;
  _$jscoverage['/compiler.js'].lineData[383] = 0;
  _$jscoverage['/compiler.js'].lineData[391] = 0;
  _$jscoverage['/compiler.js'].lineData[398] = 0;
  _$jscoverage['/compiler.js'].lineData[405] = 0;
  _$jscoverage['/compiler.js'].lineData[413] = 0;
  _$jscoverage['/compiler.js'].lineData[422] = 0;
  _$jscoverage['/compiler.js'].lineData[423] = 0;
  _$jscoverage['/compiler.js'].lineData[434] = 0;
  _$jscoverage['/compiler.js'].lineData[435] = 0;
  _$jscoverage['/compiler.js'].lineData[436] = 0;
  _$jscoverage['/compiler.js'].lineData[445] = 0;
  _$jscoverage['/compiler.js'].lineData[446] = 0;
  _$jscoverage['/compiler.js'].lineData[447] = 0;
  _$jscoverage['/compiler.js'].lineData[449] = 0;
  _$jscoverage['/compiler.js'].lineData[459] = 0;
}
if (! _$jscoverage['/compiler.js'].functionData) {
  _$jscoverage['/compiler.js'].functionData = [];
  _$jscoverage['/compiler.js'].functionData[0] = 0;
  _$jscoverage['/compiler.js'].functionData[1] = 0;
  _$jscoverage['/compiler.js'].functionData[2] = 0;
  _$jscoverage['/compiler.js'].functionData[3] = 0;
  _$jscoverage['/compiler.js'].functionData[4] = 0;
  _$jscoverage['/compiler.js'].functionData[5] = 0;
  _$jscoverage['/compiler.js'].functionData[6] = 0;
  _$jscoverage['/compiler.js'].functionData[7] = 0;
  _$jscoverage['/compiler.js'].functionData[8] = 0;
  _$jscoverage['/compiler.js'].functionData[9] = 0;
  _$jscoverage['/compiler.js'].functionData[10] = 0;
  _$jscoverage['/compiler.js'].functionData[11] = 0;
  _$jscoverage['/compiler.js'].functionData[12] = 0;
  _$jscoverage['/compiler.js'].functionData[13] = 0;
  _$jscoverage['/compiler.js'].functionData[14] = 0;
  _$jscoverage['/compiler.js'].functionData[15] = 0;
  _$jscoverage['/compiler.js'].functionData[16] = 0;
  _$jscoverage['/compiler.js'].functionData[17] = 0;
  _$jscoverage['/compiler.js'].functionData[18] = 0;
  _$jscoverage['/compiler.js'].functionData[19] = 0;
  _$jscoverage['/compiler.js'].functionData[20] = 0;
  _$jscoverage['/compiler.js'].functionData[21] = 0;
  _$jscoverage['/compiler.js'].functionData[22] = 0;
  _$jscoverage['/compiler.js'].functionData[23] = 0;
  _$jscoverage['/compiler.js'].functionData[24] = 0;
  _$jscoverage['/compiler.js'].functionData[25] = 0;
}
if (! _$jscoverage['/compiler.js'].branchData) {
  _$jscoverage['/compiler.js'].branchData = {};
  _$jscoverage['/compiler.js'].branchData['21'] = [];
  _$jscoverage['/compiler.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['41'] = [];
  _$jscoverage['/compiler.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['49'] = [];
  _$jscoverage['/compiler.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['80'] = [];
  _$jscoverage['/compiler.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['80'][2] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['80'][3] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['81'] = [];
  _$jscoverage['/compiler.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['95'] = [];
  _$jscoverage['/compiler.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['103'] = [];
  _$jscoverage['/compiler.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['104'] = [];
  _$jscoverage['/compiler.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['109'] = [];
  _$jscoverage['/compiler.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['111'] = [];
  _$jscoverage['/compiler.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['114'] = [];
  _$jscoverage['/compiler.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['133'] = [];
  _$jscoverage['/compiler.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['134'] = [];
  _$jscoverage['/compiler.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['158'] = [];
  _$jscoverage['/compiler.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['159'] = [];
  _$jscoverage['/compiler.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['179'] = [];
  _$jscoverage['/compiler.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['186'] = [];
  _$jscoverage['/compiler.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['197'] = [];
  _$jscoverage['/compiler.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['267'] = [];
  _$jscoverage['/compiler.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['289'] = [];
  _$jscoverage['/compiler.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['295'] = [];
  _$jscoverage['/compiler.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['295'][2] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['295'][3] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['302'] = [];
  _$jscoverage['/compiler.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['333'] = [];
  _$jscoverage['/compiler.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['343'] = [];
  _$jscoverage['/compiler.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['348'] = [];
  _$jscoverage['/compiler.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['377'] = [];
  _$jscoverage['/compiler.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['445'] = [];
  _$jscoverage['/compiler.js'].branchData['445'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['445'][1].init(20, 39, 'name || (\'xtemplate\' + (xtemplateId++))');
function visit77_445_1(result) {
  _$jscoverage['/compiler.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['377'][1].init(399, 6, 'escape');
function visit76_377_1(result) {
  _$jscoverage['/compiler.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['348'][1].init(954, 26, 'idString in nativeCommands');
function visit75_348_1(result) {
  _$jscoverage['/compiler.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['343'][1].init(754, 19, 'programNode.inverse');
function visit74_343_1(result) {
  _$jscoverage['/compiler.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['333'][1].init(358, 17, 'commandConfigCode');
function visit73_333_1(result) {
  _$jscoverage['/compiler.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['302'][1].init(896, 26, 'idString in nativeCommands');
function visit72_302_1(result) {
  _$jscoverage['/compiler.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['295'][3].init(567, 21, 'idString === \'extend\'');
function visit71_295_3(result) {
  _$jscoverage['/compiler.js'].branchData['295'][3].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['295'][2].init(541, 22, 'idString === \'include\'');
function visit70_295_2(result) {
  _$jscoverage['/compiler.js'].branchData['295'][2].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['295'][1].init(541, 47, 'idString === \'include\' || idString === \'extend\'');
function visit69_295_1(result) {
  _$jscoverage['/compiler.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['289'][1].init(328, 17, 'commandConfigCode');
function visit68_289_1(result) {
  _$jscoverage['/compiler.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['267'][1].init(370, 8, 'newParts');
function visit67_267_1(result) {
  _$jscoverage['/compiler.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['197'][1].init(820, 4, 'hash');
function visit66_197_1(result) {
  _$jscoverage['/compiler.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['186'][1].init(345, 6, 'params');
function visit65_186_1(result) {
  _$jscoverage['/compiler.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['179'][1].init(164, 14, 'params || hash');
function visit64_179_1(result) {
  _$jscoverage['/compiler.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['159'][1].init(54, 7, 'i < len');
function visit63_159_1(result) {
  _$jscoverage['/compiler.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['158'][1].init(537, 10, 'statements');
function visit62_158_1(result) {
  _$jscoverage['/compiler.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['134'][1].init(54, 7, 'i < len');
function visit61_134_1(result) {
  _$jscoverage['/compiler.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['133'][1].init(121, 10, 'statements');
function visit60_133_1(result) {
  _$jscoverage['/compiler.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['114'][1].init(100, 10, 'idPartType');
function visit59_114_1(result) {
  _$jscoverage['/compiler.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['111'][1].init(71, 5, 'i < l');
function visit58_111_1(result) {
  _$jscoverage['/compiler.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['109'][1].init(360, 5, 'check');
function visit57_109_1(result) {
  _$jscoverage['/compiler.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['104'][1].init(17, 15, 'idParts[i].type');
function visit56_104_1(result) {
  _$jscoverage['/compiler.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['103'][1].init(225, 5, 'i < l');
function visit55_103_1(result) {
  _$jscoverage['/compiler.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['95'][1].init(13, 20, 'idParts.length === 1');
function visit54_95_1(result) {
  _$jscoverage['/compiler.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['81'][1].init(34, 13, 'type === \'&&\'');
function visit53_81_1(result) {
  _$jscoverage['/compiler.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['80'][3].init(440, 13, 'type === \'||\'');
function visit52_80_3(result) {
  _$jscoverage['/compiler.js'].branchData['80'][3].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['80'][2].init(423, 13, 'type === \'&&\'');
function visit51_80_2(result) {
  _$jscoverage['/compiler.js'].branchData['80'][2].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['80'][1].init(423, 30, 'type === \'&&\' || type === \'||\'');
function visit50_80_1(result) {
  _$jscoverage['/compiler.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['49'][1].init(13, 6, 'isCode');
function visit49_49_1(result) {
  _$jscoverage['/compiler.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['41'][1].init(87, 12, 'm.length % 2');
function visit48_41_1(result) {
  _$jscoverage['/compiler.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['21'][1].init(28, 27, 'S.indexOf(t, keywords) > -1');
function visit47_21_1(result) {
  _$jscoverage['/compiler.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/compiler.js'].functionData[0]++;
  _$jscoverage['/compiler.js'].lineData[7]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/compiler.js'].lineData[8]++;
  var parser = require('./compiler/parser');
  _$jscoverage['/compiler.js'].lineData[9]++;
  parser.yy = require('./compiler/ast');
  _$jscoverage['/compiler.js'].lineData[10]++;
  var nativeCode = '';
  _$jscoverage['/compiler.js'].lineData[11]++;
  var t;
  _$jscoverage['/compiler.js'].lineData[12]++;
  var keywords = ['if', 'with', 'debugger'];
  _$jscoverage['/compiler.js'].lineData[13]++;
  var nativeCommands = XTemplateRuntime.nativeCommands;
  _$jscoverage['/compiler.js'].lineData[14]++;
  var nativeUtils = XTemplateRuntime.utils;
  _$jscoverage['/compiler.js'].lineData[16]++;
  for (t in nativeUtils) {
    _$jscoverage['/compiler.js'].lineData[17]++;
    nativeCode += t + 'Util = utils.' + t + ',';
  }
  _$jscoverage['/compiler.js'].lineData[20]++;
  for (t in nativeCommands) {
    _$jscoverage['/compiler.js'].lineData[21]++;
    nativeCode += t + (visit47_21_1(S.indexOf(t, keywords) > -1) ? ('Command = nativeCommands["' + t + '"]') : ('Command = nativeCommands.' + t)) + ',';
  }
  _$jscoverage['/compiler.js'].lineData[26]++;
  nativeCode = nativeCode.slice(0, -1);
  _$jscoverage['/compiler.js'].lineData[28]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
  _$jscoverage['/compiler.js'].lineData[34]++;
  function guid(str) {
    _$jscoverage['/compiler.js'].functionData[1]++;
    _$jscoverage['/compiler.js'].lineData[35]++;
    return str + (variableId++);
  }
  _$jscoverage['/compiler.js'].lineData[38]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/compiler.js'].functionData[2]++;
    _$jscoverage['/compiler.js'].lineData[39]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/compiler.js'].functionData[3]++;
  _$jscoverage['/compiler.js'].lineData[41]++;
  if (visit48_41_1(m.length % 2)) {
    _$jscoverage['/compiler.js'].lineData[42]++;
    m = '\\' + m;
  }
  _$jscoverage['/compiler.js'].lineData[44]++;
  return m;
});
  }
  _$jscoverage['/compiler.js'].lineData[48]++;
  function escapeString(str, isCode) {
    _$jscoverage['/compiler.js'].functionData[4]++;
    _$jscoverage['/compiler.js'].lineData[49]++;
    if (visit49_49_1(isCode)) {
      _$jscoverage['/compiler.js'].lineData[50]++;
      str = escapeSingleQuoteInCodeString(str, 0);
    } else {
      _$jscoverage['/compiler.js'].lineData[53]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/compiler.js'].lineData[56]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/compiler.js'].lineData[59]++;
    return str;
  }
  _$jscoverage['/compiler.js'].lineData[62]++;
  function pushToArray(to, from) {
    _$jscoverage['/compiler.js'].functionData[5]++;
    _$jscoverage['/compiler.js'].lineData[63]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/compiler.js'].lineData[66]++;
  function opExpression(e) {
    _$jscoverage['/compiler.js'].functionData[6]++;
    _$jscoverage['/compiler.js'].lineData[67]++;
    var source = [], type = e.opType, exp1, exp2, code1Source, code2Source, code1 = xtplAstToJs[e.op1.type](e.op1), code2 = xtplAstToJs[e.op2.type](e.op2);
    _$jscoverage['/compiler.js'].lineData[75]++;
    exp1 = code1.exp;
    _$jscoverage['/compiler.js'].lineData[76]++;
    exp2 = code2.exp;
    _$jscoverage['/compiler.js'].lineData[77]++;
    code1Source = code1.source;
    _$jscoverage['/compiler.js'].lineData[78]++;
    code2Source = code2.source;
    _$jscoverage['/compiler.js'].lineData[79]++;
    pushToArray(source, code1Source);
    _$jscoverage['/compiler.js'].lineData[80]++;
    if (visit50_80_1(visit51_80_2(type === '&&') || visit52_80_3(type === '||'))) {
      _$jscoverage['/compiler.js'].lineData[81]++;
      source.push('if(' + (visit53_81_1(type === '&&') ? '' : '!') + '(' + exp1 + ')){');
      _$jscoverage['/compiler.js'].lineData[82]++;
      pushToArray(source, code2Source);
      _$jscoverage['/compiler.js'].lineData[83]++;
      source.push('}');
    } else {
      _$jscoverage['/compiler.js'].lineData[85]++;
      pushToArray(source, code2Source);
    }
    _$jscoverage['/compiler.js'].lineData[87]++;
    return {
  exp: '(' + exp1 + ')' + type + '(' + exp2 + ')', 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[94]++;
  function getIdStringFromIdParts(source, idParts) {
    _$jscoverage['/compiler.js'].functionData[7]++;
    _$jscoverage['/compiler.js'].lineData[95]++;
    if (visit54_95_1(idParts.length === 1)) {
      _$jscoverage['/compiler.js'].lineData[96]++;
      return null;
    }
    _$jscoverage['/compiler.js'].lineData[98]++;
    var i, l, idPart, idPartType, check = 0, nextIdNameCode;
    _$jscoverage['/compiler.js'].lineData[103]++;
    for (i = 0 , l = idParts.length; visit55_103_1(i < l); i++) {
      _$jscoverage['/compiler.js'].lineData[104]++;
      if (visit56_104_1(idParts[i].type)) {
        _$jscoverage['/compiler.js'].lineData[105]++;
        check = 1;
        _$jscoverage['/compiler.js'].lineData[106]++;
        break;
      }
    }
    _$jscoverage['/compiler.js'].lineData[109]++;
    if (visit57_109_1(check)) {
      _$jscoverage['/compiler.js'].lineData[110]++;
      var ret = [];
      _$jscoverage['/compiler.js'].lineData[111]++;
      for (i = 0 , l = idParts.length; visit58_111_1(i < l); i++) {
        _$jscoverage['/compiler.js'].lineData[112]++;
        idPart = idParts[i];
        _$jscoverage['/compiler.js'].lineData[113]++;
        idPartType = idPart.type;
        _$jscoverage['/compiler.js'].lineData[114]++;
        if (visit59_114_1(idPartType)) {
          _$jscoverage['/compiler.js'].lineData[115]++;
          nextIdNameCode = xtplAstToJs[idPartType](idPart);
          _$jscoverage['/compiler.js'].lineData[116]++;
          pushToArray(source, nextIdNameCode.source);
          _$jscoverage['/compiler.js'].lineData[117]++;
          ret.push(nextIdNameCode.exp);
        } else {
          _$jscoverage['/compiler.js'].lineData[120]++;
          ret.push('"' + idPart + '"');
        }
      }
      _$jscoverage['/compiler.js'].lineData[123]++;
      return ret;
    } else {
      _$jscoverage['/compiler.js'].lineData[125]++;
      return null;
    }
  }
  _$jscoverage['/compiler.js'].lineData[129]++;
  function genFunction(statements) {
    _$jscoverage['/compiler.js'].functionData[8]++;
    _$jscoverage['/compiler.js'].lineData[130]++;
    var source = [];
    _$jscoverage['/compiler.js'].lineData[131]++;
    source.push('function(scope) {');
    _$jscoverage['/compiler.js'].lineData[132]++;
    source.push('var buffer = "";');
    _$jscoverage['/compiler.js'].lineData[133]++;
    if (visit60_133_1(statements)) {
      _$jscoverage['/compiler.js'].lineData[134]++;
      for (var i = 0, len = statements.length; visit61_134_1(i < len); i++) {
        _$jscoverage['/compiler.js'].lineData[135]++;
        pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
      }
    }
    _$jscoverage['/compiler.js'].lineData[138]++;
    source.push('return buffer;');
    _$jscoverage['/compiler.js'].lineData[139]++;
    source.push('}');
    _$jscoverage['/compiler.js'].lineData[140]++;
    return source;
  }
  _$jscoverage['/compiler.js'].lineData[143]++;
  function genTopFunction(statements) {
    _$jscoverage['/compiler.js'].functionData[9]++;
    _$jscoverage['/compiler.js'].lineData[144]++;
    var source = [];
    _$jscoverage['/compiler.js'].lineData[145]++;
    source.push('var buffer = "",' + 'engine = this,' + 'moduleWrap,' + 'escapeHtml = S.escapeHtml,' + 'nativeCommands = engine.nativeCommands,' + 'utils = engine.utils;');
    _$jscoverage['/compiler.js'].lineData[154]++;
    source.push('if (typeof module !== "undefined" && module.kissy) {' + 'moduleWrap = module;' + '}');
    _$jscoverage['/compiler.js'].lineData[157]++;
    source.push('var ' + nativeCode + ';');
    _$jscoverage['/compiler.js'].lineData[158]++;
    if (visit62_158_1(statements)) {
      _$jscoverage['/compiler.js'].lineData[159]++;
      for (var i = 0, len = statements.length; visit63_159_1(i < len); i++) {
        _$jscoverage['/compiler.js'].lineData[160]++;
        pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
      }
    }
    _$jscoverage['/compiler.js'].lineData[163]++;
    source.push('return buffer;');
    _$jscoverage['/compiler.js'].lineData[164]++;
    return {
  params: ['scope', 'S', 'payload', 'undefined'], 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[170]++;
  function genOptionFromCommand(command) {
    _$jscoverage['/compiler.js'].functionData[10]++;
    _$jscoverage['/compiler.js'].lineData[171]++;
    var source = [], optionName, params, hash;
    _$jscoverage['/compiler.js'].lineData[176]++;
    params = command.params;
    _$jscoverage['/compiler.js'].lineData[177]++;
    hash = command.hash;
    _$jscoverage['/compiler.js'].lineData[179]++;
    if (visit64_179_1(params || hash)) {
      _$jscoverage['/compiler.js'].lineData[180]++;
      optionName = guid('option');
      _$jscoverage['/compiler.js'].lineData[181]++;
      source.push('var ' + optionName + ' = {};');
    } else {
      _$jscoverage['/compiler.js'].lineData[183]++;
      return null;
    }
    _$jscoverage['/compiler.js'].lineData[186]++;
    if (visit65_186_1(params)) {
      _$jscoverage['/compiler.js'].lineData[187]++;
      var paramsName = guid('params');
      _$jscoverage['/compiler.js'].lineData[188]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/compiler.js'].lineData[189]++;
      S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[190]++;
  var nextIdNameCode = xtplAstToJs[param.type](param);
  _$jscoverage['/compiler.js'].lineData[191]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/compiler.js'].lineData[192]++;
  source.push(paramsName + '.push(' + nextIdNameCode.exp + ');');
});
      _$jscoverage['/compiler.js'].lineData[194]++;
      source.push(optionName + '.params=' + paramsName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[197]++;
    if (visit66_197_1(hash)) {
      _$jscoverage['/compiler.js'].lineData[198]++;
      var hashName = guid('hash');
      _$jscoverage['/compiler.js'].lineData[199]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/compiler.js'].lineData[200]++;
      S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[201]++;
  var nextIdNameCode = xtplAstToJs[v.type](v);
  _$jscoverage['/compiler.js'].lineData[202]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/compiler.js'].lineData[203]++;
  source.push(hashName + '["' + key + '"] = ' + nextIdNameCode.exp + ';');
});
      _$jscoverage['/compiler.js'].lineData[205]++;
      source.push(optionName + '.hash=' + hashName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[208]++;
    return {
  exp: optionName, 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[214]++;
  var xtplAstToJs = {
  'conditionalOrExpression': opExpression, 
  'conditionalAndExpression': opExpression, 
  'relationalExpression': opExpression, 
  'equalityExpression': opExpression, 
  'additiveExpression': opExpression, 
  'multiplicativeExpression': opExpression, 
  'unaryExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[13]++;
  _$jscoverage['/compiler.js'].lineData[228]++;
  var code = xtplAstToJs[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[229]++;
  return {
  exp: e.unaryType + '(' + code.exp + ')', 
  source: code.source};
}, 
  'string': function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[238]++;
  return {
  exp: "'" + escapeString(e.value, true) + "'", 
  source: []};
}, 
  'number': function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[245]++;
  return {
  exp: e.value, 
  source: []};
}, 
  'boolean': function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[252]++;
  return {
  exp: e.value, 
  source: []};
}, 
  'id': function(idNode) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[259]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id');
  _$jscoverage['/compiler.js'].lineData[264]++;
  var newParts = getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[265]++;
  var depthParam = depth ? (',' + depth) : '';
  _$jscoverage['/compiler.js'].lineData[267]++;
  if (visit67_267_1(newParts)) {
    _$jscoverage['/compiler.js'].lineData[268]++;
    source.push('var ' + idName + ' = scope.resolve([' + newParts.join(',') + ']' + depthParam + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[270]++;
    source.push('var ' + idName + ' = scope.resolve(["' + idParts.join('","') + '"]' + depthParam + ');');
  }
  _$jscoverage['/compiler.js'].lineData[272]++;
  return {
  exp: idName, 
  source: source};
}, 
  'command': function(command) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[279]++;
  var source = [], idNode = command.id, optionName, idString = idNode.string, commandConfigCode, idName = guid('id');
  _$jscoverage['/compiler.js'].lineData[287]++;
  commandConfigCode = genOptionFromCommand(command);
  _$jscoverage['/compiler.js'].lineData[289]++;
  if (visit68_289_1(commandConfigCode)) {
    _$jscoverage['/compiler.js'].lineData[290]++;
    optionName = commandConfigCode.exp;
    _$jscoverage['/compiler.js'].lineData[291]++;
    pushToArray(source, commandConfigCode.source);
  }
  _$jscoverage['/compiler.js'].lineData[295]++;
  if (visit69_295_1(visit70_295_2(idString === 'include') || visit71_295_3(idString === 'extend'))) {
    _$jscoverage['/compiler.js'].lineData[297]++;
    source.push('if(moduleWrap) {re' + 'quire("' + command.params[0].value + '");' + optionName + '.params[0] = moduleWrap.resolveByName(' + optionName + '.params[0]);' + '}');
  }
  _$jscoverage['/compiler.js'].lineData[302]++;
  if (visit72_302_1(idString in nativeCommands)) {
    _$jscoverage['/compiler.js'].lineData[303]++;
    source.push('var ' + idName + ' = ' + idString + 'Command.call(engine,scope,' + optionName + ',payload);');
  } else {
    _$jscoverage['/compiler.js'].lineData[308]++;
    source.push('var ' + idName + ' = callCommandUtil(engine,scope,' + optionName + ',"' + idString + '",' + idNode.lineNumber + ');');
  }
  _$jscoverage['/compiler.js'].lineData[314]++;
  return {
  exp: idName, 
  source: source};
}, 
  'blockStatement': function(block) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[322]++;
  var programNode = block.program, source = [], command = block.command, commandConfigCode, optionName, id = command.id, idString = id.string, inverseFn;
  _$jscoverage['/compiler.js'].lineData[331]++;
  commandConfigCode = genOptionFromCommand(command);
  _$jscoverage['/compiler.js'].lineData[333]++;
  if (visit73_333_1(commandConfigCode)) {
    _$jscoverage['/compiler.js'].lineData[334]++;
    optionName = commandConfigCode.exp;
    _$jscoverage['/compiler.js'].lineData[335]++;
    pushToArray(source, commandConfigCode.source);
  } else {
    _$jscoverage['/compiler.js'].lineData[337]++;
    optionName = guid('option');
    _$jscoverage['/compiler.js'].lineData[338]++;
    source.push('var ' + optionName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[341]++;
  source.push(optionName + '.fn=' + genFunction(programNode.statements).join('\n') + ';');
  _$jscoverage['/compiler.js'].lineData[343]++;
  if (visit74_343_1(programNode.inverse)) {
    _$jscoverage['/compiler.js'].lineData[344]++;
    inverseFn = genFunction(programNode.inverse).join('\n');
    _$jscoverage['/compiler.js'].lineData[345]++;
    source.push(optionName + '.inverse=' + inverseFn + ';');
  }
  _$jscoverage['/compiler.js'].lineData[348]++;
  if (visit75_348_1(idString in nativeCommands)) {
    _$jscoverage['/compiler.js'].lineData[349]++;
    source.push('buffer += ' + idString + 'Command.call(engine, scope, ' + optionName + ',payload);');
  } else {
    _$jscoverage['/compiler.js'].lineData[353]++;
    source.push('buffer += callCommandUtil(engine, scope, ' + optionName + ', ' + '"' + idString + '", ' + id.lineNumber + ');');
  }
  _$jscoverage['/compiler.js'].lineData[358]++;
  return {
  exp: '', 
  source: source};
}, 
  'expressionStatement': function(expressionStatement) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[365]++;
  var source = [], escape = expressionStatement.escape, code, expression = expressionStatement.value, type = expression.type, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[372]++;
  code = xtplAstToJs[type](expression);
  _$jscoverage['/compiler.js'].lineData[374]++;
  pushToArray(source, code.source);
  _$jscoverage['/compiler.js'].lineData[375]++;
  expressionOrVariable = code.exp;
  _$jscoverage['/compiler.js'].lineData[377]++;
  if (visit76_377_1(escape)) {
    _$jscoverage['/compiler.js'].lineData[378]++;
    source.push('buffer += escapeHtml(' + expressionOrVariable + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[380]++;
    source.push('buffer += normalizeOutputUtil(' + expressionOrVariable + ');');
  }
  _$jscoverage['/compiler.js'].lineData[383]++;
  return {
  exp: '', 
  source: source};
}, 
  'contentStatement': function(contentStatement) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[391]++;
  return {
  exp: '', 
  source: ["buffer += '" + escapeString(contentStatement.value, 0) + "';"]};
}};
  _$jscoverage['/compiler.js'].lineData[398]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[405]++;
  compiler = {
  parse: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[413]++;
  return parser.parse(name, tpl);
}, 
  compileToStr: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[422]++;
  var func = compiler.compile(tpl, name);
  _$jscoverage['/compiler.js'].lineData[423]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[434]++;
  var root = compiler.parse(name, tpl);
  _$jscoverage['/compiler.js'].lineData[435]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[436]++;
  return genTopFunction(root.statements);
}, 
  compileToFn: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[445]++;
  name = visit77_445_1(name || ('xtemplate' + (xtemplateId++)));
  _$jscoverage['/compiler.js'].lineData[446]++;
  var code = compiler.compile(tpl, name);
  _$jscoverage['/compiler.js'].lineData[447]++;
  var sourceURL = 'sourceURL=' + name + '.js';
  _$jscoverage['/compiler.js'].lineData[449]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
  _$jscoverage['/compiler.js'].lineData[459]++;
  return compiler;
});
