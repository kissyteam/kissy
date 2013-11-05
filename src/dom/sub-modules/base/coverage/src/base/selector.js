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
if (! _$jscoverage['/base/selector.js']) {
  _$jscoverage['/base/selector.js'] = {};
  _$jscoverage['/base/selector.js'].lineData = [];
  _$jscoverage['/base/selector.js'].lineData[6] = 0;
  _$jscoverage['/base/selector.js'].lineData[7] = 0;
  _$jscoverage['/base/selector.js'].lineData[27] = 0;
  _$jscoverage['/base/selector.js'].lineData[28] = 0;
  _$jscoverage['/base/selector.js'].lineData[31] = 0;
  _$jscoverage['/base/selector.js'].lineData[32] = 0;
  _$jscoverage['/base/selector.js'].lineData[33] = 0;
  _$jscoverage['/base/selector.js'].lineData[38] = 0;
  _$jscoverage['/base/selector.js'].lineData[39] = 0;
  _$jscoverage['/base/selector.js'].lineData[40] = 0;
  _$jscoverage['/base/selector.js'].lineData[41] = 0;
  _$jscoverage['/base/selector.js'].lineData[43] = 0;
  _$jscoverage['/base/selector.js'].lineData[46] = 0;
  _$jscoverage['/base/selector.js'].lineData[47] = 0;
  _$jscoverage['/base/selector.js'].lineData[48] = 0;
  _$jscoverage['/base/selector.js'].lineData[49] = 0;
  _$jscoverage['/base/selector.js'].lineData[50] = 0;
  _$jscoverage['/base/selector.js'].lineData[51] = 0;
  _$jscoverage['/base/selector.js'].lineData[53] = 0;
  _$jscoverage['/base/selector.js'].lineData[57] = 0;
  _$jscoverage['/base/selector.js'].lineData[58] = 0;
  _$jscoverage['/base/selector.js'].lineData[59] = 0;
  _$jscoverage['/base/selector.js'].lineData[60] = 0;
  _$jscoverage['/base/selector.js'].lineData[64] = 0;
  _$jscoverage['/base/selector.js'].lineData[65] = 0;
  _$jscoverage['/base/selector.js'].lineData[66] = 0;
  _$jscoverage['/base/selector.js'].lineData[70] = 0;
  _$jscoverage['/base/selector.js'].lineData[71] = 0;
  _$jscoverage['/base/selector.js'].lineData[72] = 0;
  _$jscoverage['/base/selector.js'].lineData[77] = 0;
  _$jscoverage['/base/selector.js'].lineData[78] = 0;
  _$jscoverage['/base/selector.js'].lineData[79] = 0;
  _$jscoverage['/base/selector.js'].lineData[82] = 0;
  _$jscoverage['/base/selector.js'].lineData[83] = 0;
  _$jscoverage['/base/selector.js'].lineData[92] = 0;
  _$jscoverage['/base/selector.js'].lineData[93] = 0;
  _$jscoverage['/base/selector.js'].lineData[94] = 0;
  _$jscoverage['/base/selector.js'].lineData[95] = 0;
  _$jscoverage['/base/selector.js'].lineData[97] = 0;
  _$jscoverage['/base/selector.js'].lineData[99] = 0;
  _$jscoverage['/base/selector.js'].lineData[100] = 0;
  _$jscoverage['/base/selector.js'].lineData[103] = 0;
  _$jscoverage['/base/selector.js'].lineData[104] = 0;
  _$jscoverage['/base/selector.js'].lineData[107] = 0;
  _$jscoverage['/base/selector.js'].lineData[108] = 0;
  _$jscoverage['/base/selector.js'].lineData[109] = 0;
  _$jscoverage['/base/selector.js'].lineData[112] = 0;
  _$jscoverage['/base/selector.js'].lineData[113] = 0;
  _$jscoverage['/base/selector.js'].lineData[114] = 0;
  _$jscoverage['/base/selector.js'].lineData[117] = 0;
  _$jscoverage['/base/selector.js'].lineData[118] = 0;
  _$jscoverage['/base/selector.js'].lineData[121] = 0;
  _$jscoverage['/base/selector.js'].lineData[122] = 0;
  _$jscoverage['/base/selector.js'].lineData[128] = 0;
  _$jscoverage['/base/selector.js'].lineData[129] = 0;
  _$jscoverage['/base/selector.js'].lineData[132] = 0;
  _$jscoverage['/base/selector.js'].lineData[133] = 0;
  _$jscoverage['/base/selector.js'].lineData[137] = 0;
  _$jscoverage['/base/selector.js'].lineData[140] = 0;
  _$jscoverage['/base/selector.js'].lineData[141] = 0;
  _$jscoverage['/base/selector.js'].lineData[144] = 0;
  _$jscoverage['/base/selector.js'].lineData[145] = 0;
  _$jscoverage['/base/selector.js'].lineData[146] = 0;
  _$jscoverage['/base/selector.js'].lineData[149] = 0;
  _$jscoverage['/base/selector.js'].lineData[153] = 0;
  _$jscoverage['/base/selector.js'].lineData[154] = 0;
  _$jscoverage['/base/selector.js'].lineData[155] = 0;
  _$jscoverage['/base/selector.js'].lineData[156] = 0;
  _$jscoverage['/base/selector.js'].lineData[159] = 0;
  _$jscoverage['/base/selector.js'].lineData[160] = 0;
  _$jscoverage['/base/selector.js'].lineData[168] = 0;
  _$jscoverage['/base/selector.js'].lineData[169] = 0;
  _$jscoverage['/base/selector.js'].lineData[172] = 0;
  _$jscoverage['/base/selector.js'].lineData[173] = 0;
  _$jscoverage['/base/selector.js'].lineData[178] = 0;
  _$jscoverage['/base/selector.js'].lineData[179] = 0;
  _$jscoverage['/base/selector.js'].lineData[186] = 0;
  _$jscoverage['/base/selector.js'].lineData[187] = 0;
  _$jscoverage['/base/selector.js'].lineData[189] = 0;
  _$jscoverage['/base/selector.js'].lineData[192] = 0;
  _$jscoverage['/base/selector.js'].lineData[193] = 0;
  _$jscoverage['/base/selector.js'].lineData[196] = 0;
  _$jscoverage['/base/selector.js'].lineData[197] = 0;
  _$jscoverage['/base/selector.js'].lineData[198] = 0;
  _$jscoverage['/base/selector.js'].lineData[199] = 0;
  _$jscoverage['/base/selector.js'].lineData[200] = 0;
  _$jscoverage['/base/selector.js'].lineData[201] = 0;
  _$jscoverage['/base/selector.js'].lineData[209] = 0;
  _$jscoverage['/base/selector.js'].lineData[211] = 0;
  _$jscoverage['/base/selector.js'].lineData[214] = 0;
  _$jscoverage['/base/selector.js'].lineData[216] = 0;
  _$jscoverage['/base/selector.js'].lineData[217] = 0;
  _$jscoverage['/base/selector.js'].lineData[222] = 0;
  _$jscoverage['/base/selector.js'].lineData[223] = 0;
  _$jscoverage['/base/selector.js'].lineData[224] = 0;
  _$jscoverage['/base/selector.js'].lineData[225] = 0;
  _$jscoverage['/base/selector.js'].lineData[227] = 0;
  _$jscoverage['/base/selector.js'].lineData[230] = 0;
  _$jscoverage['/base/selector.js'].lineData[231] = 0;
  _$jscoverage['/base/selector.js'].lineData[234] = 0;
  _$jscoverage['/base/selector.js'].lineData[242] = 0;
  _$jscoverage['/base/selector.js'].lineData[243] = 0;
  _$jscoverage['/base/selector.js'].lineData[245] = 0;
  _$jscoverage['/base/selector.js'].lineData[246] = 0;
  _$jscoverage['/base/selector.js'].lineData[251] = 0;
  _$jscoverage['/base/selector.js'].lineData[255] = 0;
  _$jscoverage['/base/selector.js'].lineData[265] = 0;
  _$jscoverage['/base/selector.js'].lineData[269] = 0;
  _$jscoverage['/base/selector.js'].lineData[270] = 0;
  _$jscoverage['/base/selector.js'].lineData[271] = 0;
  _$jscoverage['/base/selector.js'].lineData[272] = 0;
  _$jscoverage['/base/selector.js'].lineData[275] = 0;
  _$jscoverage['/base/selector.js'].lineData[279] = 0;
  _$jscoverage['/base/selector.js'].lineData[304] = 0;
  _$jscoverage['/base/selector.js'].lineData[316] = 0;
  _$jscoverage['/base/selector.js'].lineData[323] = 0;
  _$jscoverage['/base/selector.js'].lineData[324] = 0;
  _$jscoverage['/base/selector.js'].lineData[325] = 0;
  _$jscoverage['/base/selector.js'].lineData[328] = 0;
  _$jscoverage['/base/selector.js'].lineData[329] = 0;
  _$jscoverage['/base/selector.js'].lineData[330] = 0;
  _$jscoverage['/base/selector.js'].lineData[331] = 0;
  _$jscoverage['/base/selector.js'].lineData[334] = 0;
  _$jscoverage['/base/selector.js'].lineData[338] = 0;
  _$jscoverage['/base/selector.js'].lineData[340] = 0;
  _$jscoverage['/base/selector.js'].lineData[341] = 0;
  _$jscoverage['/base/selector.js'].lineData[343] = 0;
  _$jscoverage['/base/selector.js'].lineData[344] = 0;
  _$jscoverage['/base/selector.js'].lineData[345] = 0;
  _$jscoverage['/base/selector.js'].lineData[346] = 0;
  _$jscoverage['/base/selector.js'].lineData[347] = 0;
  _$jscoverage['/base/selector.js'].lineData[348] = 0;
  _$jscoverage['/base/selector.js'].lineData[350] = 0;
  _$jscoverage['/base/selector.js'].lineData[355] = 0;
  _$jscoverage['/base/selector.js'].lineData[368] = 0;
  _$jscoverage['/base/selector.js'].lineData[375] = 0;
  _$jscoverage['/base/selector.js'].lineData[378] = 0;
  _$jscoverage['/base/selector.js'].lineData[379] = 0;
  _$jscoverage['/base/selector.js'].lineData[380] = 0;
  _$jscoverage['/base/selector.js'].lineData[381] = 0;
  _$jscoverage['/base/selector.js'].lineData[382] = 0;
  _$jscoverage['/base/selector.js'].lineData[383] = 0;
  _$jscoverage['/base/selector.js'].lineData[387] = 0;
  _$jscoverage['/base/selector.js'].lineData[388] = 0;
  _$jscoverage['/base/selector.js'].lineData[392] = 0;
  _$jscoverage['/base/selector.js'].lineData[393] = 0;
  _$jscoverage['/base/selector.js'].lineData[396] = 0;
  _$jscoverage['/base/selector.js'].lineData[398] = 0;
  _$jscoverage['/base/selector.js'].lineData[399] = 0;
  _$jscoverage['/base/selector.js'].lineData[400] = 0;
  _$jscoverage['/base/selector.js'].lineData[405] = 0;
  _$jscoverage['/base/selector.js'].lineData[406] = 0;
  _$jscoverage['/base/selector.js'].lineData[408] = 0;
  _$jscoverage['/base/selector.js'].lineData[411] = 0;
  _$jscoverage['/base/selector.js'].lineData[423] = 0;
  _$jscoverage['/base/selector.js'].lineData[424] = 0;
  _$jscoverage['/base/selector.js'].lineData[428] = 0;
}
if (! _$jscoverage['/base/selector.js'].functionData) {
  _$jscoverage['/base/selector.js'].functionData = [];
  _$jscoverage['/base/selector.js'].functionData[0] = 0;
  _$jscoverage['/base/selector.js'].functionData[1] = 0;
  _$jscoverage['/base/selector.js'].functionData[2] = 0;
  _$jscoverage['/base/selector.js'].functionData[3] = 0;
  _$jscoverage['/base/selector.js'].functionData[4] = 0;
  _$jscoverage['/base/selector.js'].functionData[5] = 0;
  _$jscoverage['/base/selector.js'].functionData[6] = 0;
  _$jscoverage['/base/selector.js'].functionData[7] = 0;
  _$jscoverage['/base/selector.js'].functionData[8] = 0;
  _$jscoverage['/base/selector.js'].functionData[9] = 0;
  _$jscoverage['/base/selector.js'].functionData[10] = 0;
  _$jscoverage['/base/selector.js'].functionData[11] = 0;
  _$jscoverage['/base/selector.js'].functionData[12] = 0;
  _$jscoverage['/base/selector.js'].functionData[13] = 0;
  _$jscoverage['/base/selector.js'].functionData[14] = 0;
  _$jscoverage['/base/selector.js'].functionData[15] = 0;
  _$jscoverage['/base/selector.js'].functionData[16] = 0;
  _$jscoverage['/base/selector.js'].functionData[17] = 0;
  _$jscoverage['/base/selector.js'].functionData[18] = 0;
  _$jscoverage['/base/selector.js'].functionData[19] = 0;
  _$jscoverage['/base/selector.js'].functionData[20] = 0;
  _$jscoverage['/base/selector.js'].functionData[21] = 0;
  _$jscoverage['/base/selector.js'].functionData[22] = 0;
  _$jscoverage['/base/selector.js'].functionData[23] = 0;
  _$jscoverage['/base/selector.js'].functionData[24] = 0;
  _$jscoverage['/base/selector.js'].functionData[25] = 0;
  _$jscoverage['/base/selector.js'].functionData[26] = 0;
  _$jscoverage['/base/selector.js'].functionData[27] = 0;
  _$jscoverage['/base/selector.js'].functionData[28] = 0;
}
if (! _$jscoverage['/base/selector.js'].branchData) {
  _$jscoverage['/base/selector.js'].branchData = {};
  _$jscoverage['/base/selector.js'].branchData['9'] = [];
  _$jscoverage['/base/selector.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['10'] = [];
  _$jscoverage['/base/selector.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['11'] = [];
  _$jscoverage['/base/selector.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['12'] = [];
  _$jscoverage['/base/selector.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['31'] = [];
  _$jscoverage['/base/selector.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['32'] = [];
  _$jscoverage['/base/selector.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['40'] = [];
  _$jscoverage['/base/selector.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['48'] = [];
  _$jscoverage['/base/selector.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['50'] = [];
  _$jscoverage['/base/selector.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['60'] = [];
  _$jscoverage['/base/selector.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['87'] = [];
  _$jscoverage['/base/selector.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['88'] = [];
  _$jscoverage['/base/selector.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['88'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['92'] = [];
  _$jscoverage['/base/selector.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['94'] = [];
  _$jscoverage['/base/selector.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['97'] = [];
  _$jscoverage['/base/selector.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['99'] = [];
  _$jscoverage['/base/selector.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['103'] = [];
  _$jscoverage['/base/selector.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['107'] = [];
  _$jscoverage['/base/selector.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['109'] = [];
  _$jscoverage['/base/selector.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['112'] = [];
  _$jscoverage['/base/selector.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['117'] = [];
  _$jscoverage['/base/selector.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['121'] = [];
  _$jscoverage['/base/selector.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['128'] = [];
  _$jscoverage['/base/selector.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['132'] = [];
  _$jscoverage['/base/selector.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['138'] = [];
  _$jscoverage['/base/selector.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['145'] = [];
  _$jscoverage['/base/selector.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['149'] = [];
  _$jscoverage['/base/selector.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['153'] = [];
  _$jscoverage['/base/selector.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['155'] = [];
  _$jscoverage['/base/selector.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['159'] = [];
  _$jscoverage['/base/selector.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['159'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['159'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['168'] = [];
  _$jscoverage['/base/selector.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['172'] = [];
  _$jscoverage['/base/selector.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['178'] = [];
  _$jscoverage['/base/selector.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['186'] = [];
  _$jscoverage['/base/selector.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['192'] = [];
  _$jscoverage['/base/selector.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['197'] = [];
  _$jscoverage['/base/selector.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['198'] = [];
  _$jscoverage['/base/selector.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['199'] = [];
  _$jscoverage['/base/selector.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['216'] = [];
  _$jscoverage['/base/selector.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['216'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['217'] = [];
  _$jscoverage['/base/selector.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['218'] = [];
  _$jscoverage['/base/selector.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['219'] = [];
  _$jscoverage['/base/selector.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['223'] = [];
  _$jscoverage['/base/selector.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['224'] = [];
  _$jscoverage['/base/selector.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['231'] = [];
  _$jscoverage['/base/selector.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['231'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['231'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['242'] = [];
  _$jscoverage['/base/selector.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['269'] = [];
  _$jscoverage['/base/selector.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['271'] = [];
  _$jscoverage['/base/selector.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['304'] = [];
  _$jscoverage['/base/selector.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['329'] = [];
  _$jscoverage['/base/selector.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['343'] = [];
  _$jscoverage['/base/selector.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['345'] = [];
  _$jscoverage['/base/selector.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['346'] = [];
  _$jscoverage['/base/selector.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['375'] = [];
  _$jscoverage['/base/selector.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['375'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['376'] = [];
  _$jscoverage['/base/selector.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['381'] = [];
  _$jscoverage['/base/selector.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['387'] = [];
  _$jscoverage['/base/selector.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['392'] = [];
  _$jscoverage['/base/selector.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['396'] = [];
  _$jscoverage['/base/selector.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['398'] = [];
  _$jscoverage['/base/selector.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['398'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['400'] = [];
  _$jscoverage['/base/selector.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['405'] = [];
  _$jscoverage['/base/selector.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['424'] = [];
  _$jscoverage['/base/selector.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['424'][2] = new BranchData();
}
_$jscoverage['/base/selector.js'].branchData['424'][2].init(103, 64, 'Dom.filter(elements, filter, context).length === elements.length');
function visit399_424_2(result) {
  _$jscoverage['/base/selector.js'].branchData['424'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['424'][1].init(83, 85, 'elements.length && (Dom.filter(elements, filter, context).length === elements.length)');
function visit398_424_1(result) {
  _$jscoverage['/base/selector.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['405'][1].init(1349, 28, 'typeof filter === \'function\'');
function visit397_405_1(result) {
  _$jscoverage['/base/selector.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['400'][1].init(37, 25, 'getAttr(elem, \'id\') == id');
function visit396_400_1(result) {
  _$jscoverage['/base/selector.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['398'][2].init(772, 12, '!tag && !cls');
function visit395_398_2(result) {
  _$jscoverage['/base/selector.js'].branchData['398'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['398'][1].init(766, 18, 'id && !tag && !cls');
function visit394_398_1(result) {
  _$jscoverage['/base/selector.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['396'][1].init(496, 14, 'clsRe && tagRe');
function visit393_396_1(result) {
  _$jscoverage['/base/selector.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['392'][1].init(352, 3, 'cls');
function visit392_392_1(result) {
  _$jscoverage['/base/selector.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['387'][1].init(175, 3, 'tag');
function visit391_387_1(result) {
  _$jscoverage['/base/selector.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['381'][1].init(136, 3, '!id');
function visit390_381_1(result) {
  _$jscoverage['/base/selector.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['376'][1].init(50, 85, '(filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit389_376_1(result) {
  _$jscoverage['/base/selector.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['375'][2].init(215, 25, 'typeof filter == \'string\'');
function visit388_375_2(result) {
  _$jscoverage['/base/selector.js'].branchData['375'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['375'][1].init(215, 136, 'typeof filter == \'string\' && (filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit387_375_1(result) {
  _$jscoverage['/base/selector.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['346'][1].init(34, 33, 'elements[i] === elements[i - 1]');
function visit386_346_1(result) {
  _$jscoverage['/base/selector.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['345'][1].init(92, 7, 'i < len');
function visit385_345_1(result) {
  _$jscoverage['/base/selector.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['343'][1].init(131, 12, 'hasDuplicate');
function visit384_343_1(result) {
  _$jscoverage['/base/selector.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['329'][1].init(26, 6, 'a == b');
function visit383_329_1(result) {
  _$jscoverage['/base/selector.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['304'][1].init(25, 35, 'query(selector, context)[0] || null');
function visit382_304_1(result) {
  _$jscoverage['/base/selector.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['271'][1].init(61, 20, 'matches.call(n, str)');
function visit381_271_1(result) {
  _$jscoverage['/base/selector.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['269'][1].init(149, 7, 'i < len');
function visit380_269_1(result) {
  _$jscoverage['/base/selector.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['242'][1].init(22, 56, '!a.compareDocumentPosition || !b.compareDocumentPosition');
function visit379_242_1(result) {
  _$jscoverage['/base/selector.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['231'][3].init(33, 49, 'el.nodeName.toLowerCase() === value.toLowerCase()');
function visit378_231_3(result) {
  _$jscoverage['/base/selector.js'].branchData['231'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['231'][2].init(17, 12, 'value == \'*\'');
function visit377_231_2(result) {
  _$jscoverage['/base/selector.js'].branchData['231'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['231'][1].init(17, 65, 'value == \'*\' || el.nodeName.toLowerCase() === value.toLowerCase()');
function visit376_231_1(result) {
  _$jscoverage['/base/selector.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['224'][1].init(66, 20, 'ret && ret.specified');
function visit375_224_1(result) {
  _$jscoverage['/base/selector.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['223'][1].init(20, 31, 'el && el.getAttributeNode(name)');
function visit374_223_1(result) {
  _$jscoverage['/base/selector.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['219'][1].init(67, 60, '(SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit373_219_1(result) {
  _$jscoverage['/base/selector.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['218'][1].init(26, 128, '(className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit372_218_1(result) {
  _$jscoverage['/base/selector.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['217'][1].init(113, 155, 'className && (className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit371_217_1(result) {
  _$jscoverage['/base/selector.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['216'][2].init(58, 36, 'el.className || getAttr(el, \'class\')');
function visit370_216_2(result) {
  _$jscoverage['/base/selector.js'].branchData['216'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['216'][1].init(51, 44, 'el && (el.className || getAttr(el, \'class\'))');
function visit369_216_1(result) {
  _$jscoverage['/base/selector.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['199'][1].init(30, 35, 'Dom._contains(contexts[ci], tmp[i])');
function visit368_199_1(result) {
  _$jscoverage['/base/selector.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['198'][1].init(35, 16, 'ci < contextsLen');
function visit367_198_1(result) {
  _$jscoverage['/base/selector.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['197'][1].init(153, 7, 'i < len');
function visit366_197_1(result) {
  _$jscoverage['/base/selector.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['192'][1].init(962, 14, '!simpleContext');
function visit365_192_1(result) {
  _$jscoverage['/base/selector.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['186'][1].init(801, 23, 'isDomNodeList(selector)');
function visit364_186_1(result) {
  _$jscoverage['/base/selector.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['178'][1].init(490, 17, 'isArray(selector)');
function visit363_178_1(result) {
  _$jscoverage['/base/selector.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['172'][1].init(270, 23, 'selector[\'getDOMNodes\']');
function visit362_172_1(result) {
  _$jscoverage['/base/selector.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['168'][1].init(101, 46, 'selector[\'nodeType\'] || selector[\'setTimeout\']');
function visit361_168_1(result) {
  _$jscoverage['/base/selector.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['159'][3].init(266, 15, 'contextsLen > 1');
function visit360_159_3(result) {
  _$jscoverage['/base/selector.js'].branchData['159'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['159'][2].init(248, 14, 'ret.length > 1');
function visit359_159_2(result) {
  _$jscoverage['/base/selector.js'].branchData['159'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['159'][1].init(248, 33, 'ret.length > 1 && contextsLen > 1');
function visit358_159_1(result) {
  _$jscoverage['/base/selector.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['155'][1].init(57, 15, 'i < contextsLen');
function visit357_155_1(result) {
  _$jscoverage['/base/selector.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['153'][1].init(2442, 4, '!ret');
function visit356_153_1(result) {
  _$jscoverage['/base/selector.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['149'][2].init(1167, 18, 'parents.length > 1');
function visit355_149_2(result) {
  _$jscoverage['/base/selector.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['149'][1].init(1156, 29, 'parents && parents.length > 1');
function visit354_149_1(result) {
  _$jscoverage['/base/selector.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['145'][1].init(571, 15, '!parents.length');
function visit353_145_1(result) {
  _$jscoverage['/base/selector.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['138'][1].init(80, 24, 'parentIndex < parentsLen');
function visit352_138_1(result) {
  _$jscoverage['/base/selector.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['132'][1].init(433, 12, 'i < partsLen');
function visit351_132_1(result) {
  _$jscoverage['/base/selector.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['128'][1].init(272, 12, 'i < partsLen');
function visit350_128_1(result) {
  _$jscoverage['/base/selector.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['121'][1].init(1037, 59, 'isSimpleSelector(selector) && supportGetElementsByClassName');
function visit349_121_1(result) {
  _$jscoverage['/base/selector.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['117'][1].init(856, 27, 'rTagSelector.test(selector)');
function visit348_117_1(result) {
  _$jscoverage['/base/selector.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['112'][1].init(641, 26, 'rIdSelector.test(selector)');
function visit347_112_1(result) {
  _$jscoverage['/base/selector.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['109'][2].init(97, 38, 'el.nodeName.toLowerCase() == RegExp.$1');
function visit346_109_2(result) {
  _$jscoverage['/base/selector.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['109'][1].init(91, 44, 'el && el.nodeName.toLowerCase() == RegExp.$1');
function visit345_109_1(result) {
  _$jscoverage['/base/selector.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['107'][1].init(390, 29, 'rTagIdSelector.test(selector)');
function visit344_107_1(result) {
  _$jscoverage['/base/selector.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['103'][1].init(185, 62, 'rClassSelector.test(selector) && supportGetElementsByClassName');
function visit343_103_1(result) {
  _$jscoverage['/base/selector.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['99'][1].init(51, 18, 'selector == \'body\'');
function visit342_99_1(result) {
  _$jscoverage['/base/selector.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['97'][1].init(60, 13, 'simpleContext');
function visit341_97_1(result) {
  _$jscoverage['/base/selector.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['94'][1].init(369, 16, 'isSelectorString');
function visit340_94_1(result) {
  _$jscoverage['/base/selector.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['92'][1].init(312, 9, '!selector');
function visit339_92_1(result) {
  _$jscoverage['/base/selector.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['88'][2].init(196, 27, '(simpleContext = 1) && [doc]');
function visit338_88_2(result) {
  _$jscoverage['/base/selector.js'].branchData['88'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['88'][1].init(154, 21, 'context !== undefined');
function visit337_88_1(result) {
  _$jscoverage['/base/selector.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['87'][1].init(101, 27, 'typeof selector == \'string\'');
function visit336_87_1(result) {
  _$jscoverage['/base/selector.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['60'][1].init(76, 35, 'match && Dom._contains(elem, match)');
function visit335_60_1(result) {
  _$jscoverage['/base/selector.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['50'][1].init(151, 8, 's == \'.\'');
function visit334_50_1(result) {
  _$jscoverage['/base/selector.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['48'][1].init(51, 8, 's == \'#\'');
function visit333_48_1(result) {
  _$jscoverage['/base/selector.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['40'][1].init(54, 5, '!name');
function visit332_40_1(result) {
  _$jscoverage['/base/selector.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['32'][1].init(18, 22, 'f(els[i], i) === false');
function visit331_32_1(result) {
  _$jscoverage['/base/selector.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['31'][1].init(92, 5, 'i < l');
function visit330_31_1(result) {
  _$jscoverage['/base/selector.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['12'][1].init(45, 72, 'docElem[\'oMatchesSelector\'] || docElem[\'msMatchesSelector\']');
function visit329_12_1(result) {
  _$jscoverage['/base/selector.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['11'][1].init(48, 118, 'docElem[\'mozMatchesSelector\'] || docElem[\'oMatchesSelector\'] || docElem[\'msMatchesSelector\']');
function visit328_11_1(result) {
  _$jscoverage['/base/selector.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['10'][1].init(31, 167, 'docElem[\'webkitMatchesSelector\'] || docElem[\'mozMatchesSelector\'] || docElem[\'oMatchesSelector\'] || docElem[\'msMatchesSelector\']');
function visit327_10_1(result) {
  _$jscoverage['/base/selector.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['9'][1].init(89, 199, 'docElem.matches || docElem[\'webkitMatchesSelector\'] || docElem[\'mozMatchesSelector\'] || docElem[\'oMatchesSelector\'] || docElem[\'msMatchesSelector\']');
function visit326_9_1(result) {
  _$jscoverage['/base/selector.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].lineData[6]++;
KISSY.add('dom/base/selector', function(S, Dom, undefined) {
  _$jscoverage['/base/selector.js'].functionData[0]++;
  _$jscoverage['/base/selector.js'].lineData[7]++;
  var doc = S.Env.host.document, docElem = doc.documentElement, matches = visit326_9_1(docElem.matches || visit327_10_1(docElem['webkitMatchesSelector'] || visit328_11_1(docElem['mozMatchesSelector'] || visit329_12_1(docElem['oMatchesSelector'] || docElem['msMatchesSelector'])))), supportGetElementsByClassName = 'getElementsByClassName' in doc, isArray = S.isArray, makeArray = S.makeArray, isDomNodeList = Dom.isDomNodeList, SPACE = ' ', push = Array.prototype.push, rClassSelector = /^\.([\w-]+)$/, rIdSelector = /^#([\w-]+)$/, rTagSelector = /^([\w-])+$/, rTagIdSelector = /^([\w-]+)#([\w-]+)$/, rSimpleSelector = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/, trim = S.trim;
  _$jscoverage['/base/selector.js'].lineData[27]++;
  function query_each(f) {
    _$jscoverage['/base/selector.js'].functionData[1]++;
    _$jscoverage['/base/selector.js'].lineData[28]++;
    var els = this, l = els.length, i;
    _$jscoverage['/base/selector.js'].lineData[31]++;
    for (i = 0; visit330_31_1(i < l); i++) {
      _$jscoverage['/base/selector.js'].lineData[32]++;
      if (visit331_32_1(f(els[i], i) === false)) {
        _$jscoverage['/base/selector.js'].lineData[33]++;
        break;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[38]++;
  function checkSelectorAndReturn(selector) {
    _$jscoverage['/base/selector.js'].functionData[2]++;
    _$jscoverage['/base/selector.js'].lineData[39]++;
    var name = selector.substr(1);
    _$jscoverage['/base/selector.js'].lineData[40]++;
    if (visit332_40_1(!name)) {
      _$jscoverage['/base/selector.js'].lineData[41]++;
      throw new Error('An invalid or illegal string was specified for selector.');
    }
    _$jscoverage['/base/selector.js'].lineData[43]++;
    return name;
  }
  _$jscoverage['/base/selector.js'].lineData[46]++;
  function makeMatch(selector) {
    _$jscoverage['/base/selector.js'].functionData[3]++;
    _$jscoverage['/base/selector.js'].lineData[47]++;
    var s = selector.charAt(0);
    _$jscoverage['/base/selector.js'].lineData[48]++;
    if (visit333_48_1(s == '#')) {
      _$jscoverage['/base/selector.js'].lineData[49]++;
      return makeIdMatch(checkSelectorAndReturn(selector));
    } else {
      _$jscoverage['/base/selector.js'].lineData[50]++;
      if (visit334_50_1(s == '.')) {
        _$jscoverage['/base/selector.js'].lineData[51]++;
        return makeClassMatch(checkSelectorAndReturn(selector));
      } else {
        _$jscoverage['/base/selector.js'].lineData[53]++;
        return makeTagMatch(selector);
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[57]++;
  function makeIdMatch(id) {
    _$jscoverage['/base/selector.js'].functionData[4]++;
    _$jscoverage['/base/selector.js'].lineData[58]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[5]++;
  _$jscoverage['/base/selector.js'].lineData[59]++;
  var match = Dom._getElementById(id, doc);
  _$jscoverage['/base/selector.js'].lineData[60]++;
  return visit335_60_1(match && Dom._contains(elem, match)) ? [match] : [];
};
  }
  _$jscoverage['/base/selector.js'].lineData[64]++;
  function makeClassMatch(className) {
    _$jscoverage['/base/selector.js'].functionData[6]++;
    _$jscoverage['/base/selector.js'].lineData[65]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[7]++;
  _$jscoverage['/base/selector.js'].lineData[66]++;
  return elem.getElementsByClassName(className);
};
  }
  _$jscoverage['/base/selector.js'].lineData[70]++;
  function makeTagMatch(tagName) {
    _$jscoverage['/base/selector.js'].functionData[8]++;
    _$jscoverage['/base/selector.js'].lineData[71]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[9]++;
  _$jscoverage['/base/selector.js'].lineData[72]++;
  return elem.getElementsByTagName(tagName);
};
  }
  _$jscoverage['/base/selector.js'].lineData[77]++;
  function isSimpleSelector(selector) {
    _$jscoverage['/base/selector.js'].functionData[10]++;
    _$jscoverage['/base/selector.js'].lineData[78]++;
    var complexReg = /,|\+|=|~|\[|\]|:|>|\||\$|\^|\*|\(|\)|[\w-]+\.[\w-]+|[\w-]+#[\w-]+/;
    _$jscoverage['/base/selector.js'].lineData[79]++;
    return !selector.match(complexReg);
  }
  _$jscoverage['/base/selector.js'].lineData[82]++;
  function query(selector, context) {
    _$jscoverage['/base/selector.js'].functionData[11]++;
    _$jscoverage['/base/selector.js'].lineData[83]++;
    var ret, i, el, simpleContext, isSelectorString = visit336_87_1(typeof selector == 'string'), contexts = visit337_88_1(context !== undefined) ? query(context) : visit338_88_2((simpleContext = 1) && [doc]), contextsLen = contexts.length;
    _$jscoverage['/base/selector.js'].lineData[92]++;
    if (visit339_92_1(!selector)) {
      _$jscoverage['/base/selector.js'].lineData[93]++;
      ret = [];
    } else {
      _$jscoverage['/base/selector.js'].lineData[94]++;
      if (visit340_94_1(isSelectorString)) {
        _$jscoverage['/base/selector.js'].lineData[95]++;
        selector = trim(selector);
        _$jscoverage['/base/selector.js'].lineData[97]++;
        if (visit341_97_1(simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[99]++;
          if (visit342_99_1(selector == 'body')) {
            _$jscoverage['/base/selector.js'].lineData[100]++;
            ret = [doc.body];
          } else {
            _$jscoverage['/base/selector.js'].lineData[103]++;
            if (visit343_103_1(rClassSelector.test(selector) && supportGetElementsByClassName)) {
              _$jscoverage['/base/selector.js'].lineData[104]++;
              ret = doc.getElementsByClassName(RegExp.$1);
            } else {
              _$jscoverage['/base/selector.js'].lineData[107]++;
              if (visit344_107_1(rTagIdSelector.test(selector))) {
                _$jscoverage['/base/selector.js'].lineData[108]++;
                el = Dom._getElementById(RegExp.$2, doc);
                _$jscoverage['/base/selector.js'].lineData[109]++;
                ret = visit345_109_1(el && visit346_109_2(el.nodeName.toLowerCase() == RegExp.$1)) ? [el] : [];
              } else {
                _$jscoverage['/base/selector.js'].lineData[112]++;
                if (visit347_112_1(rIdSelector.test(selector))) {
                  _$jscoverage['/base/selector.js'].lineData[113]++;
                  el = Dom._getElementById(selector.substr(1), doc);
                  _$jscoverage['/base/selector.js'].lineData[114]++;
                  ret = el ? [el] : [];
                } else {
                  _$jscoverage['/base/selector.js'].lineData[117]++;
                  if (visit348_117_1(rTagSelector.test(selector))) {
                    _$jscoverage['/base/selector.js'].lineData[118]++;
                    ret = doc.getElementsByTagName(selector);
                  } else {
                    _$jscoverage['/base/selector.js'].lineData[121]++;
                    if (visit349_121_1(isSimpleSelector(selector) && supportGetElementsByClassName)) {
                      _$jscoverage['/base/selector.js'].lineData[122]++;
                      var parts = selector.split(/\s+/), partsLen, parents = contexts, parentIndex, parentsLen;
                      _$jscoverage['/base/selector.js'].lineData[128]++;
                      for (i = 0 , partsLen = parts.length; visit350_128_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[129]++;
                        parts[i] = makeMatch(parts[i]);
                      }
                      _$jscoverage['/base/selector.js'].lineData[132]++;
                      for (i = 0 , partsLen = parts.length; visit351_132_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[133]++;
                        var part = parts[i], newParents = [], matches;
                        _$jscoverage['/base/selector.js'].lineData[137]++;
                        for (parentIndex = 0 , parentsLen = parents.length; visit352_138_1(parentIndex < parentsLen); parentIndex++) {
                          _$jscoverage['/base/selector.js'].lineData[140]++;
                          matches = part(parents[parentIndex]);
                          _$jscoverage['/base/selector.js'].lineData[141]++;
                          newParents.push.apply(newParents, S.makeArray(matches));
                        }
                        _$jscoverage['/base/selector.js'].lineData[144]++;
                        parents = newParents;
                        _$jscoverage['/base/selector.js'].lineData[145]++;
                        if (visit353_145_1(!parents.length)) {
                          _$jscoverage['/base/selector.js'].lineData[146]++;
                          break;
                        }
                      }
                      _$jscoverage['/base/selector.js'].lineData[149]++;
                      ret = visit354_149_1(parents && visit355_149_2(parents.length > 1)) ? Dom.unique(parents) : parents;
                    }
                  }
                }
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[153]++;
        if (visit356_153_1(!ret)) {
          _$jscoverage['/base/selector.js'].lineData[154]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[155]++;
          for (i = 0; visit357_155_1(i < contextsLen); i++) {
            _$jscoverage['/base/selector.js'].lineData[156]++;
            push.apply(ret, Dom._selectInternal(selector, contexts[i]));
          }
          _$jscoverage['/base/selector.js'].lineData[159]++;
          if (visit358_159_1(visit359_159_2(ret.length > 1) && visit360_159_3(contextsLen > 1))) {
            _$jscoverage['/base/selector.js'].lineData[160]++;
            Dom.unique(ret);
          }
        }
      } else {
        _$jscoverage['/base/selector.js'].lineData[168]++;
        if (visit361_168_1(selector['nodeType'] || selector['setTimeout'])) {
          _$jscoverage['/base/selector.js'].lineData[169]++;
          ret = [selector];
        } else {
          _$jscoverage['/base/selector.js'].lineData[172]++;
          if (visit362_172_1(selector['getDOMNodes'])) {
            _$jscoverage['/base/selector.js'].lineData[173]++;
            ret = selector['getDOMNodes']();
          } else {
            _$jscoverage['/base/selector.js'].lineData[178]++;
            if (visit363_178_1(isArray(selector))) {
              _$jscoverage['/base/selector.js'].lineData[179]++;
              ret = selector;
            } else {
              _$jscoverage['/base/selector.js'].lineData[186]++;
              if (visit364_186_1(isDomNodeList(selector))) {
                _$jscoverage['/base/selector.js'].lineData[187]++;
                ret = makeArray(selector);
              } else {
                _$jscoverage['/base/selector.js'].lineData[189]++;
                ret = [selector];
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[192]++;
        if (visit365_192_1(!simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[193]++;
          var tmp = ret, ci, len = tmp.length;
          _$jscoverage['/base/selector.js'].lineData[196]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[197]++;
          for (i = 0; visit366_197_1(i < len); i++) {
            _$jscoverage['/base/selector.js'].lineData[198]++;
            for (ci = 0; visit367_198_1(ci < contextsLen); ci++) {
              _$jscoverage['/base/selector.js'].lineData[199]++;
              if (visit368_199_1(Dom._contains(contexts[ci], tmp[i]))) {
                _$jscoverage['/base/selector.js'].lineData[200]++;
                ret.push(tmp[i]);
                _$jscoverage['/base/selector.js'].lineData[201]++;
                break;
              }
            }
          }
        }
      }
    }
    _$jscoverage['/base/selector.js'].lineData[209]++;
    ret.each = query_each;
    _$jscoverage['/base/selector.js'].lineData[211]++;
    return ret;
  }
  _$jscoverage['/base/selector.js'].lineData[214]++;
  function hasSingleClass(el, cls) {
    _$jscoverage['/base/selector.js'].functionData[12]++;
    _$jscoverage['/base/selector.js'].lineData[216]++;
    var className = visit369_216_1(el && (visit370_216_2(el.className || getAttr(el, 'class'))));
    _$jscoverage['/base/selector.js'].lineData[217]++;
    return visit371_217_1(className && visit372_218_1((className = className.replace(/[\r\t\n]/g, SPACE)) && visit373_219_1((SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1)));
  }
  _$jscoverage['/base/selector.js'].lineData[222]++;
  function getAttr(el, name) {
    _$jscoverage['/base/selector.js'].functionData[13]++;
    _$jscoverage['/base/selector.js'].lineData[223]++;
    var ret = visit374_223_1(el && el.getAttributeNode(name));
    _$jscoverage['/base/selector.js'].lineData[224]++;
    if (visit375_224_1(ret && ret.specified)) {
      _$jscoverage['/base/selector.js'].lineData[225]++;
      return ret.nodeValue;
    }
    _$jscoverage['/base/selector.js'].lineData[227]++;
    return undefined;
  }
  _$jscoverage['/base/selector.js'].lineData[230]++;
  function isTag(el, value) {
    _$jscoverage['/base/selector.js'].functionData[14]++;
    _$jscoverage['/base/selector.js'].lineData[231]++;
    return visit376_231_1(visit377_231_2(value == '*') || visit378_231_3(el.nodeName.toLowerCase() === value.toLowerCase()));
  }
  _$jscoverage['/base/selector.js'].lineData[234]++;
  S.mix(Dom, {
  _compareNodeOrder: function(a, b) {
  _$jscoverage['/base/selector.js'].functionData[15]++;
  _$jscoverage['/base/selector.js'].lineData[242]++;
  if (visit379_242_1(!a.compareDocumentPosition || !b.compareDocumentPosition)) {
    _$jscoverage['/base/selector.js'].lineData[243]++;
    return a.compareDocumentPosition ? -1 : 1;
  }
  _$jscoverage['/base/selector.js'].lineData[245]++;
  var bit = a.compareDocumentPosition(b) & 4;
  _$jscoverage['/base/selector.js'].lineData[246]++;
  return bit ? -1 : 1;
}, 
  _getElementsByTagName: function(name, context) {
  _$jscoverage['/base/selector.js'].functionData[16]++;
  _$jscoverage['/base/selector.js'].lineData[251]++;
  return S.makeArray(context.querySelectorAll(name));
}, 
  _getElementById: function(id, doc) {
  _$jscoverage['/base/selector.js'].functionData[17]++;
  _$jscoverage['/base/selector.js'].lineData[255]++;
  return doc.getElementById(id);
}, 
  _getSimpleAttr: getAttr, 
  _isTag: isTag, 
  _hasSingleClass: hasSingleClass, 
  _matchesInternal: function(str, seeds) {
  _$jscoverage['/base/selector.js'].functionData[18]++;
  _$jscoverage['/base/selector.js'].lineData[265]++;
  var ret = [], i = 0, n, len = seeds.length;
  _$jscoverage['/base/selector.js'].lineData[269]++;
  for (; visit380_269_1(i < len); i++) {
    _$jscoverage['/base/selector.js'].lineData[270]++;
    n = seeds[i];
    _$jscoverage['/base/selector.js'].lineData[271]++;
    if (visit381_271_1(matches.call(n, str))) {
      _$jscoverage['/base/selector.js'].lineData[272]++;
      ret.push(n);
    }
  }
  _$jscoverage['/base/selector.js'].lineData[275]++;
  return ret;
}, 
  _selectInternal: function(str, context) {
  _$jscoverage['/base/selector.js'].functionData[19]++;
  _$jscoverage['/base/selector.js'].lineData[279]++;
  return makeArray(context.querySelectorAll(str));
}, 
  query: query, 
  get: function(selector, context) {
  _$jscoverage['/base/selector.js'].functionData[20]++;
  _$jscoverage['/base/selector.js'].lineData[304]++;
  return visit382_304_1(query(selector, context)[0] || null);
}, 
  unique: (function() {
  _$jscoverage['/base/selector.js'].functionData[21]++;
  _$jscoverage['/base/selector.js'].lineData[316]++;
  var hasDuplicate, baseHasDuplicate = true;
  _$jscoverage['/base/selector.js'].lineData[323]++;
  [0, 0].sort(function() {
  _$jscoverage['/base/selector.js'].functionData[22]++;
  _$jscoverage['/base/selector.js'].lineData[324]++;
  baseHasDuplicate = false;
  _$jscoverage['/base/selector.js'].lineData[325]++;
  return 0;
});
  _$jscoverage['/base/selector.js'].lineData[328]++;
  function sortOrder(a, b) {
    _$jscoverage['/base/selector.js'].functionData[23]++;
    _$jscoverage['/base/selector.js'].lineData[329]++;
    if (visit383_329_1(a == b)) {
      _$jscoverage['/base/selector.js'].lineData[330]++;
      hasDuplicate = true;
      _$jscoverage['/base/selector.js'].lineData[331]++;
      return 0;
    }
    _$jscoverage['/base/selector.js'].lineData[334]++;
    return Dom._compareNodeOrder(a, b);
  }
  _$jscoverage['/base/selector.js'].lineData[338]++;
  return function(elements) {
  _$jscoverage['/base/selector.js'].functionData[24]++;
  _$jscoverage['/base/selector.js'].lineData[340]++;
  hasDuplicate = baseHasDuplicate;
  _$jscoverage['/base/selector.js'].lineData[341]++;
  elements.sort(sortOrder);
  _$jscoverage['/base/selector.js'].lineData[343]++;
  if (visit384_343_1(hasDuplicate)) {
    _$jscoverage['/base/selector.js'].lineData[344]++;
    var i = 1, len = elements.length;
    _$jscoverage['/base/selector.js'].lineData[345]++;
    while (visit385_345_1(i < len)) {
      _$jscoverage['/base/selector.js'].lineData[346]++;
      if (visit386_346_1(elements[i] === elements[i - 1])) {
        _$jscoverage['/base/selector.js'].lineData[347]++;
        elements.splice(i, 1);
        _$jscoverage['/base/selector.js'].lineData[348]++;
        --len;
      } else {
        _$jscoverage['/base/selector.js'].lineData[350]++;
        i++;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[355]++;
  return elements;
};
})(), 
  filter: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[25]++;
  _$jscoverage['/base/selector.js'].lineData[368]++;
  var elems = query(selector, context), id, tag, match, cls, ret = [];
  _$jscoverage['/base/selector.js'].lineData[375]++;
  if (visit387_375_1(visit388_375_2(typeof filter == 'string') && visit389_376_1((filter = trim(filter)) && (match = rSimpleSelector.exec(filter))))) {
    _$jscoverage['/base/selector.js'].lineData[378]++;
    id = match[1];
    _$jscoverage['/base/selector.js'].lineData[379]++;
    tag = match[2];
    _$jscoverage['/base/selector.js'].lineData[380]++;
    cls = match[3];
    _$jscoverage['/base/selector.js'].lineData[381]++;
    if (visit390_381_1(!id)) {
      _$jscoverage['/base/selector.js'].lineData[382]++;
      filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[26]++;
  _$jscoverage['/base/selector.js'].lineData[383]++;
  var tagRe = true, clsRe = true;
  _$jscoverage['/base/selector.js'].lineData[387]++;
  if (visit391_387_1(tag)) {
    _$jscoverage['/base/selector.js'].lineData[388]++;
    tagRe = isTag(elem, tag);
  }
  _$jscoverage['/base/selector.js'].lineData[392]++;
  if (visit392_392_1(cls)) {
    _$jscoverage['/base/selector.js'].lineData[393]++;
    clsRe = hasSingleClass(elem, cls);
  }
  _$jscoverage['/base/selector.js'].lineData[396]++;
  return visit393_396_1(clsRe && tagRe);
};
    } else {
      _$jscoverage['/base/selector.js'].lineData[398]++;
      if (visit394_398_1(id && visit395_398_2(!tag && !cls))) {
        _$jscoverage['/base/selector.js'].lineData[399]++;
        filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[27]++;
  _$jscoverage['/base/selector.js'].lineData[400]++;
  return visit396_400_1(getAttr(elem, 'id') == id);
};
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[405]++;
  if (visit397_405_1(typeof filter === 'function')) {
    _$jscoverage['/base/selector.js'].lineData[406]++;
    ret = S.filter(elems, filter);
  } else {
    _$jscoverage['/base/selector.js'].lineData[408]++;
    ret = Dom._matchesInternal(filter, elems);
  }
  _$jscoverage['/base/selector.js'].lineData[411]++;
  return ret;
}, 
  test: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[28]++;
  _$jscoverage['/base/selector.js'].lineData[423]++;
  var elements = query(selector, context);
  _$jscoverage['/base/selector.js'].lineData[424]++;
  return visit398_424_1(elements.length && (visit399_424_2(Dom.filter(elements, filter, context).length === elements.length)));
}});
  _$jscoverage['/base/selector.js'].lineData[428]++;
  return Dom;
}, {
  requires: ['./api']});
