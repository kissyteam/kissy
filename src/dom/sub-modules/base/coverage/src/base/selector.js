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
  _$jscoverage['/base/selector.js'].lineData[8] = 0;
  _$jscoverage['/base/selector.js'].lineData[28] = 0;
  _$jscoverage['/base/selector.js'].lineData[29] = 0;
  _$jscoverage['/base/selector.js'].lineData[32] = 0;
  _$jscoverage['/base/selector.js'].lineData[33] = 0;
  _$jscoverage['/base/selector.js'].lineData[34] = 0;
  _$jscoverage['/base/selector.js'].lineData[39] = 0;
  _$jscoverage['/base/selector.js'].lineData[40] = 0;
  _$jscoverage['/base/selector.js'].lineData[41] = 0;
  _$jscoverage['/base/selector.js'].lineData[42] = 0;
  _$jscoverage['/base/selector.js'].lineData[44] = 0;
  _$jscoverage['/base/selector.js'].lineData[47] = 0;
  _$jscoverage['/base/selector.js'].lineData[48] = 0;
  _$jscoverage['/base/selector.js'].lineData[49] = 0;
  _$jscoverage['/base/selector.js'].lineData[50] = 0;
  _$jscoverage['/base/selector.js'].lineData[51] = 0;
  _$jscoverage['/base/selector.js'].lineData[52] = 0;
  _$jscoverage['/base/selector.js'].lineData[54] = 0;
  _$jscoverage['/base/selector.js'].lineData[58] = 0;
  _$jscoverage['/base/selector.js'].lineData[59] = 0;
  _$jscoverage['/base/selector.js'].lineData[60] = 0;
  _$jscoverage['/base/selector.js'].lineData[61] = 0;
  _$jscoverage['/base/selector.js'].lineData[65] = 0;
  _$jscoverage['/base/selector.js'].lineData[66] = 0;
  _$jscoverage['/base/selector.js'].lineData[67] = 0;
  _$jscoverage['/base/selector.js'].lineData[71] = 0;
  _$jscoverage['/base/selector.js'].lineData[72] = 0;
  _$jscoverage['/base/selector.js'].lineData[73] = 0;
  _$jscoverage['/base/selector.js'].lineData[78] = 0;
  _$jscoverage['/base/selector.js'].lineData[79] = 0;
  _$jscoverage['/base/selector.js'].lineData[80] = 0;
  _$jscoverage['/base/selector.js'].lineData[83] = 0;
  _$jscoverage['/base/selector.js'].lineData[84] = 0;
  _$jscoverage['/base/selector.js'].lineData[93] = 0;
  _$jscoverage['/base/selector.js'].lineData[94] = 0;
  _$jscoverage['/base/selector.js'].lineData[95] = 0;
  _$jscoverage['/base/selector.js'].lineData[96] = 0;
  _$jscoverage['/base/selector.js'].lineData[98] = 0;
  _$jscoverage['/base/selector.js'].lineData[100] = 0;
  _$jscoverage['/base/selector.js'].lineData[101] = 0;
  _$jscoverage['/base/selector.js'].lineData[104] = 0;
  _$jscoverage['/base/selector.js'].lineData[105] = 0;
  _$jscoverage['/base/selector.js'].lineData[108] = 0;
  _$jscoverage['/base/selector.js'].lineData[109] = 0;
  _$jscoverage['/base/selector.js'].lineData[110] = 0;
  _$jscoverage['/base/selector.js'].lineData[113] = 0;
  _$jscoverage['/base/selector.js'].lineData[114] = 0;
  _$jscoverage['/base/selector.js'].lineData[115] = 0;
  _$jscoverage['/base/selector.js'].lineData[118] = 0;
  _$jscoverage['/base/selector.js'].lineData[119] = 0;
  _$jscoverage['/base/selector.js'].lineData[122] = 0;
  _$jscoverage['/base/selector.js'].lineData[123] = 0;
  _$jscoverage['/base/selector.js'].lineData[129] = 0;
  _$jscoverage['/base/selector.js'].lineData[130] = 0;
  _$jscoverage['/base/selector.js'].lineData[133] = 0;
  _$jscoverage['/base/selector.js'].lineData[134] = 0;
  _$jscoverage['/base/selector.js'].lineData[138] = 0;
  _$jscoverage['/base/selector.js'].lineData[141] = 0;
  _$jscoverage['/base/selector.js'].lineData[142] = 0;
  _$jscoverage['/base/selector.js'].lineData[145] = 0;
  _$jscoverage['/base/selector.js'].lineData[146] = 0;
  _$jscoverage['/base/selector.js'].lineData[147] = 0;
  _$jscoverage['/base/selector.js'].lineData[150] = 0;
  _$jscoverage['/base/selector.js'].lineData[154] = 0;
  _$jscoverage['/base/selector.js'].lineData[155] = 0;
  _$jscoverage['/base/selector.js'].lineData[156] = 0;
  _$jscoverage['/base/selector.js'].lineData[157] = 0;
  _$jscoverage['/base/selector.js'].lineData[160] = 0;
  _$jscoverage['/base/selector.js'].lineData[161] = 0;
  _$jscoverage['/base/selector.js'].lineData[169] = 0;
  _$jscoverage['/base/selector.js'].lineData[170] = 0;
  _$jscoverage['/base/selector.js'].lineData[173] = 0;
  _$jscoverage['/base/selector.js'].lineData[174] = 0;
  _$jscoverage['/base/selector.js'].lineData[179] = 0;
  _$jscoverage['/base/selector.js'].lineData[180] = 0;
  _$jscoverage['/base/selector.js'].lineData[187] = 0;
  _$jscoverage['/base/selector.js'].lineData[188] = 0;
  _$jscoverage['/base/selector.js'].lineData[190] = 0;
  _$jscoverage['/base/selector.js'].lineData[193] = 0;
  _$jscoverage['/base/selector.js'].lineData[194] = 0;
  _$jscoverage['/base/selector.js'].lineData[197] = 0;
  _$jscoverage['/base/selector.js'].lineData[198] = 0;
  _$jscoverage['/base/selector.js'].lineData[199] = 0;
  _$jscoverage['/base/selector.js'].lineData[200] = 0;
  _$jscoverage['/base/selector.js'].lineData[201] = 0;
  _$jscoverage['/base/selector.js'].lineData[202] = 0;
  _$jscoverage['/base/selector.js'].lineData[210] = 0;
  _$jscoverage['/base/selector.js'].lineData[212] = 0;
  _$jscoverage['/base/selector.js'].lineData[215] = 0;
  _$jscoverage['/base/selector.js'].lineData[217] = 0;
  _$jscoverage['/base/selector.js'].lineData[218] = 0;
  _$jscoverage['/base/selector.js'].lineData[223] = 0;
  _$jscoverage['/base/selector.js'].lineData[224] = 0;
  _$jscoverage['/base/selector.js'].lineData[225] = 0;
  _$jscoverage['/base/selector.js'].lineData[226] = 0;
  _$jscoverage['/base/selector.js'].lineData[228] = 0;
  _$jscoverage['/base/selector.js'].lineData[231] = 0;
  _$jscoverage['/base/selector.js'].lineData[232] = 0;
  _$jscoverage['/base/selector.js'].lineData[235] = 0;
  _$jscoverage['/base/selector.js'].lineData[243] = 0;
  _$jscoverage['/base/selector.js'].lineData[244] = 0;
  _$jscoverage['/base/selector.js'].lineData[246] = 0;
  _$jscoverage['/base/selector.js'].lineData[247] = 0;
  _$jscoverage['/base/selector.js'].lineData[252] = 0;
  _$jscoverage['/base/selector.js'].lineData[256] = 0;
  _$jscoverage['/base/selector.js'].lineData[266] = 0;
  _$jscoverage['/base/selector.js'].lineData[270] = 0;
  _$jscoverage['/base/selector.js'].lineData[271] = 0;
  _$jscoverage['/base/selector.js'].lineData[272] = 0;
  _$jscoverage['/base/selector.js'].lineData[273] = 0;
  _$jscoverage['/base/selector.js'].lineData[276] = 0;
  _$jscoverage['/base/selector.js'].lineData[280] = 0;
  _$jscoverage['/base/selector.js'].lineData[305] = 0;
  _$jscoverage['/base/selector.js'].lineData[317] = 0;
  _$jscoverage['/base/selector.js'].lineData[324] = 0;
  _$jscoverage['/base/selector.js'].lineData[325] = 0;
  _$jscoverage['/base/selector.js'].lineData[326] = 0;
  _$jscoverage['/base/selector.js'].lineData[329] = 0;
  _$jscoverage['/base/selector.js'].lineData[330] = 0;
  _$jscoverage['/base/selector.js'].lineData[331] = 0;
  _$jscoverage['/base/selector.js'].lineData[332] = 0;
  _$jscoverage['/base/selector.js'].lineData[335] = 0;
  _$jscoverage['/base/selector.js'].lineData[339] = 0;
  _$jscoverage['/base/selector.js'].lineData[341] = 0;
  _$jscoverage['/base/selector.js'].lineData[342] = 0;
  _$jscoverage['/base/selector.js'].lineData[344] = 0;
  _$jscoverage['/base/selector.js'].lineData[345] = 0;
  _$jscoverage['/base/selector.js'].lineData[346] = 0;
  _$jscoverage['/base/selector.js'].lineData[347] = 0;
  _$jscoverage['/base/selector.js'].lineData[348] = 0;
  _$jscoverage['/base/selector.js'].lineData[349] = 0;
  _$jscoverage['/base/selector.js'].lineData[351] = 0;
  _$jscoverage['/base/selector.js'].lineData[356] = 0;
  _$jscoverage['/base/selector.js'].lineData[369] = 0;
  _$jscoverage['/base/selector.js'].lineData[376] = 0;
  _$jscoverage['/base/selector.js'].lineData[379] = 0;
  _$jscoverage['/base/selector.js'].lineData[380] = 0;
  _$jscoverage['/base/selector.js'].lineData[381] = 0;
  _$jscoverage['/base/selector.js'].lineData[382] = 0;
  _$jscoverage['/base/selector.js'].lineData[383] = 0;
  _$jscoverage['/base/selector.js'].lineData[384] = 0;
  _$jscoverage['/base/selector.js'].lineData[388] = 0;
  _$jscoverage['/base/selector.js'].lineData[389] = 0;
  _$jscoverage['/base/selector.js'].lineData[393] = 0;
  _$jscoverage['/base/selector.js'].lineData[394] = 0;
  _$jscoverage['/base/selector.js'].lineData[397] = 0;
  _$jscoverage['/base/selector.js'].lineData[399] = 0;
  _$jscoverage['/base/selector.js'].lineData[400] = 0;
  _$jscoverage['/base/selector.js'].lineData[401] = 0;
  _$jscoverage['/base/selector.js'].lineData[406] = 0;
  _$jscoverage['/base/selector.js'].lineData[407] = 0;
  _$jscoverage['/base/selector.js'].lineData[409] = 0;
  _$jscoverage['/base/selector.js'].lineData[412] = 0;
  _$jscoverage['/base/selector.js'].lineData[424] = 0;
  _$jscoverage['/base/selector.js'].lineData[425] = 0;
  _$jscoverage['/base/selector.js'].lineData[429] = 0;
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
  _$jscoverage['/base/selector.js'].branchData['10'] = [];
  _$jscoverage['/base/selector.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['11'] = [];
  _$jscoverage['/base/selector.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['12'] = [];
  _$jscoverage['/base/selector.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['13'] = [];
  _$jscoverage['/base/selector.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['32'] = [];
  _$jscoverage['/base/selector.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['33'] = [];
  _$jscoverage['/base/selector.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['41'] = [];
  _$jscoverage['/base/selector.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['49'] = [];
  _$jscoverage['/base/selector.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['51'] = [];
  _$jscoverage['/base/selector.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['61'] = [];
  _$jscoverage['/base/selector.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['88'] = [];
  _$jscoverage['/base/selector.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['89'] = [];
  _$jscoverage['/base/selector.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['89'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['93'] = [];
  _$jscoverage['/base/selector.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['95'] = [];
  _$jscoverage['/base/selector.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['98'] = [];
  _$jscoverage['/base/selector.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['100'] = [];
  _$jscoverage['/base/selector.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['104'] = [];
  _$jscoverage['/base/selector.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['108'] = [];
  _$jscoverage['/base/selector.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['110'] = [];
  _$jscoverage['/base/selector.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['113'] = [];
  _$jscoverage['/base/selector.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['118'] = [];
  _$jscoverage['/base/selector.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['122'] = [];
  _$jscoverage['/base/selector.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['129'] = [];
  _$jscoverage['/base/selector.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['133'] = [];
  _$jscoverage['/base/selector.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['139'] = [];
  _$jscoverage['/base/selector.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['146'] = [];
  _$jscoverage['/base/selector.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['150'] = [];
  _$jscoverage['/base/selector.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['150'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['154'] = [];
  _$jscoverage['/base/selector.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['156'] = [];
  _$jscoverage['/base/selector.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['160'] = [];
  _$jscoverage['/base/selector.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['160'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['160'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['169'] = [];
  _$jscoverage['/base/selector.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['173'] = [];
  _$jscoverage['/base/selector.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['179'] = [];
  _$jscoverage['/base/selector.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['187'] = [];
  _$jscoverage['/base/selector.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['193'] = [];
  _$jscoverage['/base/selector.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['198'] = [];
  _$jscoverage['/base/selector.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['199'] = [];
  _$jscoverage['/base/selector.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['200'] = [];
  _$jscoverage['/base/selector.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['217'] = [];
  _$jscoverage['/base/selector.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['217'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['218'] = [];
  _$jscoverage['/base/selector.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['219'] = [];
  _$jscoverage['/base/selector.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['220'] = [];
  _$jscoverage['/base/selector.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['224'] = [];
  _$jscoverage['/base/selector.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['225'] = [];
  _$jscoverage['/base/selector.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['232'] = [];
  _$jscoverage['/base/selector.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['232'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['232'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['243'] = [];
  _$jscoverage['/base/selector.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['270'] = [];
  _$jscoverage['/base/selector.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['272'] = [];
  _$jscoverage['/base/selector.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['305'] = [];
  _$jscoverage['/base/selector.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['330'] = [];
  _$jscoverage['/base/selector.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['344'] = [];
  _$jscoverage['/base/selector.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['346'] = [];
  _$jscoverage['/base/selector.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['347'] = [];
  _$jscoverage['/base/selector.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['376'] = [];
  _$jscoverage['/base/selector.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['376'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['377'] = [];
  _$jscoverage['/base/selector.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['382'] = [];
  _$jscoverage['/base/selector.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['388'] = [];
  _$jscoverage['/base/selector.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['393'] = [];
  _$jscoverage['/base/selector.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['397'] = [];
  _$jscoverage['/base/selector.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['399'] = [];
  _$jscoverage['/base/selector.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['399'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['401'] = [];
  _$jscoverage['/base/selector.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['406'] = [];
  _$jscoverage['/base/selector.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['425'] = [];
  _$jscoverage['/base/selector.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['425'][2] = new BranchData();
}
_$jscoverage['/base/selector.js'].branchData['425'][2].init(101, 64, 'Dom.filter(elements, filter, context).length === elements.length');
function visit398_425_2(result) {
  _$jscoverage['/base/selector.js'].branchData['425'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['425'][1].init(81, 85, 'elements.length && (Dom.filter(elements, filter, context).length === elements.length)');
function visit397_425_1(result) {
  _$jscoverage['/base/selector.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['406'][1].init(1311, 28, 'typeof filter === \'function\'');
function visit396_406_1(result) {
  _$jscoverage['/base/selector.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['401'][1].init(36, 25, 'getAttr(elem, \'id\') == id');
function visit395_401_1(result) {
  _$jscoverage['/base/selector.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['399'][2].init(751, 12, '!tag && !cls');
function visit394_399_2(result) {
  _$jscoverage['/base/selector.js'].branchData['399'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['399'][1].init(745, 18, 'id && !tag && !cls');
function visit393_399_1(result) {
  _$jscoverage['/base/selector.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['397'][1].init(482, 14, 'clsRe && tagRe');
function visit392_397_1(result) {
  _$jscoverage['/base/selector.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['393'][1].init(342, 3, 'cls');
function visit391_393_1(result) {
  _$jscoverage['/base/selector.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['388'][1].init(170, 3, 'tag');
function visit390_388_1(result) {
  _$jscoverage['/base/selector.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['382'][1].init(132, 3, '!id');
function visit389_382_1(result) {
  _$jscoverage['/base/selector.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['377'][1].init(49, 84, '(filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit388_377_1(result) {
  _$jscoverage['/base/selector.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['376'][2].init(207, 25, 'typeof filter == \'string\'');
function visit387_376_2(result) {
  _$jscoverage['/base/selector.js'].branchData['376'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['376'][1].init(207, 134, 'typeof filter == \'string\' && (filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit386_376_1(result) {
  _$jscoverage['/base/selector.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['347'][1].init(33, 33, 'elements[i] === elements[i - 1]');
function visit385_347_1(result) {
  _$jscoverage['/base/selector.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['346'][1].init(90, 7, 'i < len');
function visit384_346_1(result) {
  _$jscoverage['/base/selector.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['344'][1].init(126, 12, 'hasDuplicate');
function visit383_344_1(result) {
  _$jscoverage['/base/selector.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['330'][1].init(25, 6, 'a == b');
function visit382_330_1(result) {
  _$jscoverage['/base/selector.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['305'][1].init(24, 35, 'query(selector, context)[0] || null');
function visit381_305_1(result) {
  _$jscoverage['/base/selector.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['272'][1].init(59, 20, 'matches.call(n, str)');
function visit380_272_1(result) {
  _$jscoverage['/base/selector.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['270'][1].init(144, 7, 'i < len');
function visit379_270_1(result) {
  _$jscoverage['/base/selector.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['243'][1].init(21, 56, '!a.compareDocumentPosition || !b.compareDocumentPosition');
function visit378_243_1(result) {
  _$jscoverage['/base/selector.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['232'][3].init(32, 49, 'el.nodeName.toLowerCase() === value.toLowerCase()');
function visit377_232_3(result) {
  _$jscoverage['/base/selector.js'].branchData['232'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['232'][2].init(16, 12, 'value == \'*\'');
function visit376_232_2(result) {
  _$jscoverage['/base/selector.js'].branchData['232'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['232'][1].init(16, 65, 'value == \'*\' || el.nodeName.toLowerCase() === value.toLowerCase()');
function visit375_232_1(result) {
  _$jscoverage['/base/selector.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['225'][1].init(64, 20, 'ret && ret.specified');
function visit374_225_1(result) {
  _$jscoverage['/base/selector.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['224'][1].init(19, 31, 'el && el.getAttributeNode(name)');
function visit373_224_1(result) {
  _$jscoverage['/base/selector.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['220'][1].init(66, 60, '(SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit372_220_1(result) {
  _$jscoverage['/base/selector.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['219'][1].init(25, 127, '(className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit371_219_1(result) {
  _$jscoverage['/base/selector.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['218'][1].init(110, 153, 'className && (className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit370_218_1(result) {
  _$jscoverage['/base/selector.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['217'][2].init(56, 36, 'el.className || getAttr(el, \'class\')');
function visit369_217_2(result) {
  _$jscoverage['/base/selector.js'].branchData['217'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['217'][1].init(49, 44, 'el && (el.className || getAttr(el, \'class\'))');
function visit368_217_1(result) {
  _$jscoverage['/base/selector.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['200'][1].init(29, 35, 'Dom._contains(contexts[ci], tmp[i])');
function visit367_200_1(result) {
  _$jscoverage['/base/selector.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['199'][1].init(34, 16, 'ci < contextsLen');
function visit366_199_1(result) {
  _$jscoverage['/base/selector.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['198'][1].init(148, 7, 'i < len');
function visit365_198_1(result) {
  _$jscoverage['/base/selector.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['193'][1].init(935, 14, '!simpleContext');
function visit364_193_1(result) {
  _$jscoverage['/base/selector.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['187'][1].init(780, 23, 'isDomNodeList(selector)');
function visit363_187_1(result) {
  _$jscoverage['/base/selector.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['179'][1].init(477, 17, 'isArray(selector)');
function visit362_179_1(result) {
  _$jscoverage['/base/selector.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['173'][1].init(263, 23, 'selector[\'getDOMNodes\']');
function visit361_173_1(result) {
  _$jscoverage['/base/selector.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['169'][1].init(98, 46, 'selector[\'nodeType\'] || selector[\'setTimeout\']');
function visit360_169_1(result) {
  _$jscoverage['/base/selector.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['160'][3].init(260, 15, 'contextsLen > 1');
function visit359_160_3(result) {
  _$jscoverage['/base/selector.js'].branchData['160'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['160'][2].init(242, 14, 'ret.length > 1');
function visit358_160_2(result) {
  _$jscoverage['/base/selector.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['160'][1].init(242, 33, 'ret.length > 1 && contextsLen > 1');
function visit357_160_1(result) {
  _$jscoverage['/base/selector.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['156'][1].init(55, 15, 'i < contextsLen');
function visit356_156_1(result) {
  _$jscoverage['/base/selector.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['154'][1].init(2383, 4, '!ret');
function visit355_154_1(result) {
  _$jscoverage['/base/selector.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['150'][2].init(1139, 18, 'parents.length > 1');
function visit354_150_2(result) {
  _$jscoverage['/base/selector.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['150'][1].init(1128, 29, 'parents && parents.length > 1');
function visit353_150_1(result) {
  _$jscoverage['/base/selector.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['146'][1].init(558, 15, '!parents.length');
function visit352_146_1(result) {
  _$jscoverage['/base/selector.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['139'][1].init(79, 24, 'parentIndex < parentsLen');
function visit351_139_1(result) {
  _$jscoverage['/base/selector.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['133'][1].init(422, 12, 'i < partsLen');
function visit350_133_1(result) {
  _$jscoverage['/base/selector.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['129'][1].init(265, 12, 'i < partsLen');
function visit349_129_1(result) {
  _$jscoverage['/base/selector.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['122'][1].init(1013, 59, 'isSimpleSelector(selector) && supportGetElementsByClassName');
function visit348_122_1(result) {
  _$jscoverage['/base/selector.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['118'][1].init(836, 27, 'rTagSelector.test(selector)');
function visit347_118_1(result) {
  _$jscoverage['/base/selector.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['113'][1].init(626, 26, 'rIdSelector.test(selector)');
function visit346_113_1(result) {
  _$jscoverage['/base/selector.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['110'][2].init(95, 38, 'el.nodeName.toLowerCase() == RegExp.$1');
function visit345_110_2(result) {
  _$jscoverage['/base/selector.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['110'][1].init(89, 44, 'el && el.nodeName.toLowerCase() == RegExp.$1');
function visit344_110_1(result) {
  _$jscoverage['/base/selector.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['108'][1].init(380, 29, 'rTagIdSelector.test(selector)');
function visit343_108_1(result) {
  _$jscoverage['/base/selector.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['104'][1].init(179, 62, 'rClassSelector.test(selector) && supportGetElementsByClassName');
function visit342_104_1(result) {
  _$jscoverage['/base/selector.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['100'][1].init(49, 18, 'selector == \'body\'');
function visit341_100_1(result) {
  _$jscoverage['/base/selector.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['98'][1].init(57, 13, 'simpleContext');
function visit340_98_1(result) {
  _$jscoverage['/base/selector.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['95'][1].init(357, 16, 'isSelectorString');
function visit339_95_1(result) {
  _$jscoverage['/base/selector.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['93'][1].init(302, 9, '!selector');
function visit338_93_1(result) {
  _$jscoverage['/base/selector.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['89'][2].init(191, 27, '(simpleContext = 1) && [doc]');
function visit337_89_2(result) {
  _$jscoverage['/base/selector.js'].branchData['89'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['89'][1].init(149, 21, 'context !== undefined');
function visit336_89_1(result) {
  _$jscoverage['/base/selector.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['88'][1].init(97, 27, 'typeof selector == \'string\'');
function visit335_88_1(result) {
  _$jscoverage['/base/selector.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['61'][1].init(74, 35, 'match && Dom._contains(elem, match)');
function visit334_61_1(result) {
  _$jscoverage['/base/selector.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['51'][1].init(147, 8, 's == \'.\'');
function visit333_51_1(result) {
  _$jscoverage['/base/selector.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['49'][1].init(49, 8, 's == \'#\'');
function visit332_49_1(result) {
  _$jscoverage['/base/selector.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['41'][1].init(52, 5, '!name');
function visit331_41_1(result) {
  _$jscoverage['/base/selector.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['33'][1].init(17, 22, 'f(els[i], i) === false');
function visit330_33_1(result) {
  _$jscoverage['/base/selector.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['32'][1].init(88, 5, 'i < l');
function visit329_32_1(result) {
  _$jscoverage['/base/selector.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['13'][1].init(44, 71, 'docElem[\'oMatchesSelector\'] || docElem[\'msMatchesSelector\']');
function visit328_13_1(result) {
  _$jscoverage['/base/selector.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['12'][1].init(47, 116, 'docElem[\'mozMatchesSelector\'] || docElem[\'oMatchesSelector\'] || docElem[\'msMatchesSelector\']');
function visit327_12_1(result) {
  _$jscoverage['/base/selector.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['11'][1].init(30, 164, 'docElem[\'webkitMatchesSelector\'] || docElem[\'mozMatchesSelector\'] || docElem[\'oMatchesSelector\'] || docElem[\'msMatchesSelector\']');
function visit326_11_1(result) {
  _$jscoverage['/base/selector.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['10'][1].init(87, 195, 'docElem.matches || docElem[\'webkitMatchesSelector\'] || docElem[\'mozMatchesSelector\'] || docElem[\'oMatchesSelector\'] || docElem[\'msMatchesSelector\']');
function visit325_10_1(result) {
  _$jscoverage['/base/selector.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/selector.js'].functionData[0]++;
  _$jscoverage['/base/selector.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/selector.js'].lineData[8]++;
  var doc = S.Env.host.document, docElem = doc.documentElement, matches = visit325_10_1(docElem.matches || visit326_11_1(docElem['webkitMatchesSelector'] || visit327_12_1(docElem['mozMatchesSelector'] || visit328_13_1(docElem['oMatchesSelector'] || docElem['msMatchesSelector'])))), supportGetElementsByClassName = 'getElementsByClassName' in doc, isArray = S.isArray, makeArray = S.makeArray, isDomNodeList = Dom.isDomNodeList, SPACE = ' ', push = Array.prototype.push, rClassSelector = /^\.([\w-]+)$/, rIdSelector = /^#([\w-]+)$/, rTagSelector = /^([\w-])+$/, rTagIdSelector = /^([\w-]+)#([\w-]+)$/, rSimpleSelector = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/, trim = S.trim;
  _$jscoverage['/base/selector.js'].lineData[28]++;
  function query_each(f) {
    _$jscoverage['/base/selector.js'].functionData[1]++;
    _$jscoverage['/base/selector.js'].lineData[29]++;
    var els = this, l = els.length, i;
    _$jscoverage['/base/selector.js'].lineData[32]++;
    for (i = 0; visit329_32_1(i < l); i++) {
      _$jscoverage['/base/selector.js'].lineData[33]++;
      if (visit330_33_1(f(els[i], i) === false)) {
        _$jscoverage['/base/selector.js'].lineData[34]++;
        break;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[39]++;
  function checkSelectorAndReturn(selector) {
    _$jscoverage['/base/selector.js'].functionData[2]++;
    _$jscoverage['/base/selector.js'].lineData[40]++;
    var name = selector.substr(1);
    _$jscoverage['/base/selector.js'].lineData[41]++;
    if (visit331_41_1(!name)) {
      _$jscoverage['/base/selector.js'].lineData[42]++;
      throw new Error('An invalid or illegal string was specified for selector.');
    }
    _$jscoverage['/base/selector.js'].lineData[44]++;
    return name;
  }
  _$jscoverage['/base/selector.js'].lineData[47]++;
  function makeMatch(selector) {
    _$jscoverage['/base/selector.js'].functionData[3]++;
    _$jscoverage['/base/selector.js'].lineData[48]++;
    var s = selector.charAt(0);
    _$jscoverage['/base/selector.js'].lineData[49]++;
    if (visit332_49_1(s == '#')) {
      _$jscoverage['/base/selector.js'].lineData[50]++;
      return makeIdMatch(checkSelectorAndReturn(selector));
    } else {
      _$jscoverage['/base/selector.js'].lineData[51]++;
      if (visit333_51_1(s == '.')) {
        _$jscoverage['/base/selector.js'].lineData[52]++;
        return makeClassMatch(checkSelectorAndReturn(selector));
      } else {
        _$jscoverage['/base/selector.js'].lineData[54]++;
        return makeTagMatch(selector);
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[58]++;
  function makeIdMatch(id) {
    _$jscoverage['/base/selector.js'].functionData[4]++;
    _$jscoverage['/base/selector.js'].lineData[59]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[5]++;
  _$jscoverage['/base/selector.js'].lineData[60]++;
  var match = Dom._getElementById(id, doc);
  _$jscoverage['/base/selector.js'].lineData[61]++;
  return visit334_61_1(match && Dom._contains(elem, match)) ? [match] : [];
};
  }
  _$jscoverage['/base/selector.js'].lineData[65]++;
  function makeClassMatch(className) {
    _$jscoverage['/base/selector.js'].functionData[6]++;
    _$jscoverage['/base/selector.js'].lineData[66]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[7]++;
  _$jscoverage['/base/selector.js'].lineData[67]++;
  return elem.getElementsByClassName(className);
};
  }
  _$jscoverage['/base/selector.js'].lineData[71]++;
  function makeTagMatch(tagName) {
    _$jscoverage['/base/selector.js'].functionData[8]++;
    _$jscoverage['/base/selector.js'].lineData[72]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[9]++;
  _$jscoverage['/base/selector.js'].lineData[73]++;
  return elem.getElementsByTagName(tagName);
};
  }
  _$jscoverage['/base/selector.js'].lineData[78]++;
  function isSimpleSelector(selector) {
    _$jscoverage['/base/selector.js'].functionData[10]++;
    _$jscoverage['/base/selector.js'].lineData[79]++;
    var complexReg = /,|\+|=|~|\[|\]|:|>|\||\$|\^|\*|\(|\)|[\w-]+\.[\w-]+|[\w-]+#[\w-]+/;
    _$jscoverage['/base/selector.js'].lineData[80]++;
    return !selector.match(complexReg);
  }
  _$jscoverage['/base/selector.js'].lineData[83]++;
  function query(selector, context) {
    _$jscoverage['/base/selector.js'].functionData[11]++;
    _$jscoverage['/base/selector.js'].lineData[84]++;
    var ret, i, el, simpleContext, isSelectorString = visit335_88_1(typeof selector == 'string'), contexts = visit336_89_1(context !== undefined) ? query(context) : visit337_89_2((simpleContext = 1) && [doc]), contextsLen = contexts.length;
    _$jscoverage['/base/selector.js'].lineData[93]++;
    if (visit338_93_1(!selector)) {
      _$jscoverage['/base/selector.js'].lineData[94]++;
      ret = [];
    } else {
      _$jscoverage['/base/selector.js'].lineData[95]++;
      if (visit339_95_1(isSelectorString)) {
        _$jscoverage['/base/selector.js'].lineData[96]++;
        selector = trim(selector);
        _$jscoverage['/base/selector.js'].lineData[98]++;
        if (visit340_98_1(simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[100]++;
          if (visit341_100_1(selector == 'body')) {
            _$jscoverage['/base/selector.js'].lineData[101]++;
            ret = [doc.body];
          } else {
            _$jscoverage['/base/selector.js'].lineData[104]++;
            if (visit342_104_1(rClassSelector.test(selector) && supportGetElementsByClassName)) {
              _$jscoverage['/base/selector.js'].lineData[105]++;
              ret = doc.getElementsByClassName(RegExp.$1);
            } else {
              _$jscoverage['/base/selector.js'].lineData[108]++;
              if (visit343_108_1(rTagIdSelector.test(selector))) {
                _$jscoverage['/base/selector.js'].lineData[109]++;
                el = Dom._getElementById(RegExp.$2, doc);
                _$jscoverage['/base/selector.js'].lineData[110]++;
                ret = visit344_110_1(el && visit345_110_2(el.nodeName.toLowerCase() == RegExp.$1)) ? [el] : [];
              } else {
                _$jscoverage['/base/selector.js'].lineData[113]++;
                if (visit346_113_1(rIdSelector.test(selector))) {
                  _$jscoverage['/base/selector.js'].lineData[114]++;
                  el = Dom._getElementById(selector.substr(1), doc);
                  _$jscoverage['/base/selector.js'].lineData[115]++;
                  ret = el ? [el] : [];
                } else {
                  _$jscoverage['/base/selector.js'].lineData[118]++;
                  if (visit347_118_1(rTagSelector.test(selector))) {
                    _$jscoverage['/base/selector.js'].lineData[119]++;
                    ret = doc.getElementsByTagName(selector);
                  } else {
                    _$jscoverage['/base/selector.js'].lineData[122]++;
                    if (visit348_122_1(isSimpleSelector(selector) && supportGetElementsByClassName)) {
                      _$jscoverage['/base/selector.js'].lineData[123]++;
                      var parts = selector.split(/\s+/), partsLen, parents = contexts, parentIndex, parentsLen;
                      _$jscoverage['/base/selector.js'].lineData[129]++;
                      for (i = 0 , partsLen = parts.length; visit349_129_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[130]++;
                        parts[i] = makeMatch(parts[i]);
                      }
                      _$jscoverage['/base/selector.js'].lineData[133]++;
                      for (i = 0 , partsLen = parts.length; visit350_133_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[134]++;
                        var part = parts[i], newParents = [], matches;
                        _$jscoverage['/base/selector.js'].lineData[138]++;
                        for (parentIndex = 0 , parentsLen = parents.length; visit351_139_1(parentIndex < parentsLen); parentIndex++) {
                          _$jscoverage['/base/selector.js'].lineData[141]++;
                          matches = part(parents[parentIndex]);
                          _$jscoverage['/base/selector.js'].lineData[142]++;
                          newParents.push.apply(newParents, S.makeArray(matches));
                        }
                        _$jscoverage['/base/selector.js'].lineData[145]++;
                        parents = newParents;
                        _$jscoverage['/base/selector.js'].lineData[146]++;
                        if (visit352_146_1(!parents.length)) {
                          _$jscoverage['/base/selector.js'].lineData[147]++;
                          break;
                        }
                      }
                      _$jscoverage['/base/selector.js'].lineData[150]++;
                      ret = visit353_150_1(parents && visit354_150_2(parents.length > 1)) ? Dom.unique(parents) : parents;
                    }
                  }
                }
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[154]++;
        if (visit355_154_1(!ret)) {
          _$jscoverage['/base/selector.js'].lineData[155]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[156]++;
          for (i = 0; visit356_156_1(i < contextsLen); i++) {
            _$jscoverage['/base/selector.js'].lineData[157]++;
            push.apply(ret, Dom._selectInternal(selector, contexts[i]));
          }
          _$jscoverage['/base/selector.js'].lineData[160]++;
          if (visit357_160_1(visit358_160_2(ret.length > 1) && visit359_160_3(contextsLen > 1))) {
            _$jscoverage['/base/selector.js'].lineData[161]++;
            Dom.unique(ret);
          }
        }
      } else {
        _$jscoverage['/base/selector.js'].lineData[169]++;
        if (visit360_169_1(selector['nodeType'] || selector['setTimeout'])) {
          _$jscoverage['/base/selector.js'].lineData[170]++;
          ret = [selector];
        } else {
          _$jscoverage['/base/selector.js'].lineData[173]++;
          if (visit361_173_1(selector['getDOMNodes'])) {
            _$jscoverage['/base/selector.js'].lineData[174]++;
            ret = selector['getDOMNodes']();
          } else {
            _$jscoverage['/base/selector.js'].lineData[179]++;
            if (visit362_179_1(isArray(selector))) {
              _$jscoverage['/base/selector.js'].lineData[180]++;
              ret = selector;
            } else {
              _$jscoverage['/base/selector.js'].lineData[187]++;
              if (visit363_187_1(isDomNodeList(selector))) {
                _$jscoverage['/base/selector.js'].lineData[188]++;
                ret = makeArray(selector);
              } else {
                _$jscoverage['/base/selector.js'].lineData[190]++;
                ret = [selector];
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[193]++;
        if (visit364_193_1(!simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[194]++;
          var tmp = ret, ci, len = tmp.length;
          _$jscoverage['/base/selector.js'].lineData[197]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[198]++;
          for (i = 0; visit365_198_1(i < len); i++) {
            _$jscoverage['/base/selector.js'].lineData[199]++;
            for (ci = 0; visit366_199_1(ci < contextsLen); ci++) {
              _$jscoverage['/base/selector.js'].lineData[200]++;
              if (visit367_200_1(Dom._contains(contexts[ci], tmp[i]))) {
                _$jscoverage['/base/selector.js'].lineData[201]++;
                ret.push(tmp[i]);
                _$jscoverage['/base/selector.js'].lineData[202]++;
                break;
              }
            }
          }
        }
      }
    }
    _$jscoverage['/base/selector.js'].lineData[210]++;
    ret.each = query_each;
    _$jscoverage['/base/selector.js'].lineData[212]++;
    return ret;
  }
  _$jscoverage['/base/selector.js'].lineData[215]++;
  function hasSingleClass(el, cls) {
    _$jscoverage['/base/selector.js'].functionData[12]++;
    _$jscoverage['/base/selector.js'].lineData[217]++;
    var className = visit368_217_1(el && (visit369_217_2(el.className || getAttr(el, 'class'))));
    _$jscoverage['/base/selector.js'].lineData[218]++;
    return visit370_218_1(className && visit371_219_1((className = className.replace(/[\r\t\n]/g, SPACE)) && visit372_220_1((SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1)));
  }
  _$jscoverage['/base/selector.js'].lineData[223]++;
  function getAttr(el, name) {
    _$jscoverage['/base/selector.js'].functionData[13]++;
    _$jscoverage['/base/selector.js'].lineData[224]++;
    var ret = visit373_224_1(el && el.getAttributeNode(name));
    _$jscoverage['/base/selector.js'].lineData[225]++;
    if (visit374_225_1(ret && ret.specified)) {
      _$jscoverage['/base/selector.js'].lineData[226]++;
      return ret.nodeValue;
    }
    _$jscoverage['/base/selector.js'].lineData[228]++;
    return undefined;
  }
  _$jscoverage['/base/selector.js'].lineData[231]++;
  function isTag(el, value) {
    _$jscoverage['/base/selector.js'].functionData[14]++;
    _$jscoverage['/base/selector.js'].lineData[232]++;
    return visit375_232_1(visit376_232_2(value == '*') || visit377_232_3(el.nodeName.toLowerCase() === value.toLowerCase()));
  }
  _$jscoverage['/base/selector.js'].lineData[235]++;
  S.mix(Dom, {
  _compareNodeOrder: function(a, b) {
  _$jscoverage['/base/selector.js'].functionData[15]++;
  _$jscoverage['/base/selector.js'].lineData[243]++;
  if (visit378_243_1(!a.compareDocumentPosition || !b.compareDocumentPosition)) {
    _$jscoverage['/base/selector.js'].lineData[244]++;
    return a.compareDocumentPosition ? -1 : 1;
  }
  _$jscoverage['/base/selector.js'].lineData[246]++;
  var bit = a.compareDocumentPosition(b) & 4;
  _$jscoverage['/base/selector.js'].lineData[247]++;
  return bit ? -1 : 1;
}, 
  _getElementsByTagName: function(name, context) {
  _$jscoverage['/base/selector.js'].functionData[16]++;
  _$jscoverage['/base/selector.js'].lineData[252]++;
  return S.makeArray(context.querySelectorAll(name));
}, 
  _getElementById: function(id, doc) {
  _$jscoverage['/base/selector.js'].functionData[17]++;
  _$jscoverage['/base/selector.js'].lineData[256]++;
  return doc.getElementById(id);
}, 
  _getSimpleAttr: getAttr, 
  _isTag: isTag, 
  _hasSingleClass: hasSingleClass, 
  _matchesInternal: function(str, seeds) {
  _$jscoverage['/base/selector.js'].functionData[18]++;
  _$jscoverage['/base/selector.js'].lineData[266]++;
  var ret = [], i = 0, n, len = seeds.length;
  _$jscoverage['/base/selector.js'].lineData[270]++;
  for (; visit379_270_1(i < len); i++) {
    _$jscoverage['/base/selector.js'].lineData[271]++;
    n = seeds[i];
    _$jscoverage['/base/selector.js'].lineData[272]++;
    if (visit380_272_1(matches.call(n, str))) {
      _$jscoverage['/base/selector.js'].lineData[273]++;
      ret.push(n);
    }
  }
  _$jscoverage['/base/selector.js'].lineData[276]++;
  return ret;
}, 
  _selectInternal: function(str, context) {
  _$jscoverage['/base/selector.js'].functionData[19]++;
  _$jscoverage['/base/selector.js'].lineData[280]++;
  return makeArray(context.querySelectorAll(str));
}, 
  query: query, 
  get: function(selector, context) {
  _$jscoverage['/base/selector.js'].functionData[20]++;
  _$jscoverage['/base/selector.js'].lineData[305]++;
  return visit381_305_1(query(selector, context)[0] || null);
}, 
  unique: (function() {
  _$jscoverage['/base/selector.js'].functionData[21]++;
  _$jscoverage['/base/selector.js'].lineData[317]++;
  var hasDuplicate, baseHasDuplicate = true;
  _$jscoverage['/base/selector.js'].lineData[324]++;
  [0, 0].sort(function() {
  _$jscoverage['/base/selector.js'].functionData[22]++;
  _$jscoverage['/base/selector.js'].lineData[325]++;
  baseHasDuplicate = false;
  _$jscoverage['/base/selector.js'].lineData[326]++;
  return 0;
});
  _$jscoverage['/base/selector.js'].lineData[329]++;
  function sortOrder(a, b) {
    _$jscoverage['/base/selector.js'].functionData[23]++;
    _$jscoverage['/base/selector.js'].lineData[330]++;
    if (visit382_330_1(a == b)) {
      _$jscoverage['/base/selector.js'].lineData[331]++;
      hasDuplicate = true;
      _$jscoverage['/base/selector.js'].lineData[332]++;
      return 0;
    }
    _$jscoverage['/base/selector.js'].lineData[335]++;
    return Dom._compareNodeOrder(a, b);
  }
  _$jscoverage['/base/selector.js'].lineData[339]++;
  return function(elements) {
  _$jscoverage['/base/selector.js'].functionData[24]++;
  _$jscoverage['/base/selector.js'].lineData[341]++;
  hasDuplicate = baseHasDuplicate;
  _$jscoverage['/base/selector.js'].lineData[342]++;
  elements.sort(sortOrder);
  _$jscoverage['/base/selector.js'].lineData[344]++;
  if (visit383_344_1(hasDuplicate)) {
    _$jscoverage['/base/selector.js'].lineData[345]++;
    var i = 1, len = elements.length;
    _$jscoverage['/base/selector.js'].lineData[346]++;
    while (visit384_346_1(i < len)) {
      _$jscoverage['/base/selector.js'].lineData[347]++;
      if (visit385_347_1(elements[i] === elements[i - 1])) {
        _$jscoverage['/base/selector.js'].lineData[348]++;
        elements.splice(i, 1);
        _$jscoverage['/base/selector.js'].lineData[349]++;
        --len;
      } else {
        _$jscoverage['/base/selector.js'].lineData[351]++;
        i++;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[356]++;
  return elements;
};
})(), 
  filter: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[25]++;
  _$jscoverage['/base/selector.js'].lineData[369]++;
  var elems = query(selector, context), id, tag, match, cls, ret = [];
  _$jscoverage['/base/selector.js'].lineData[376]++;
  if (visit386_376_1(visit387_376_2(typeof filter == 'string') && visit388_377_1((filter = trim(filter)) && (match = rSimpleSelector.exec(filter))))) {
    _$jscoverage['/base/selector.js'].lineData[379]++;
    id = match[1];
    _$jscoverage['/base/selector.js'].lineData[380]++;
    tag = match[2];
    _$jscoverage['/base/selector.js'].lineData[381]++;
    cls = match[3];
    _$jscoverage['/base/selector.js'].lineData[382]++;
    if (visit389_382_1(!id)) {
      _$jscoverage['/base/selector.js'].lineData[383]++;
      filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[26]++;
  _$jscoverage['/base/selector.js'].lineData[384]++;
  var tagRe = true, clsRe = true;
  _$jscoverage['/base/selector.js'].lineData[388]++;
  if (visit390_388_1(tag)) {
    _$jscoverage['/base/selector.js'].lineData[389]++;
    tagRe = isTag(elem, tag);
  }
  _$jscoverage['/base/selector.js'].lineData[393]++;
  if (visit391_393_1(cls)) {
    _$jscoverage['/base/selector.js'].lineData[394]++;
    clsRe = hasSingleClass(elem, cls);
  }
  _$jscoverage['/base/selector.js'].lineData[397]++;
  return visit392_397_1(clsRe && tagRe);
};
    } else {
      _$jscoverage['/base/selector.js'].lineData[399]++;
      if (visit393_399_1(id && visit394_399_2(!tag && !cls))) {
        _$jscoverage['/base/selector.js'].lineData[400]++;
        filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[27]++;
  _$jscoverage['/base/selector.js'].lineData[401]++;
  return visit395_401_1(getAttr(elem, 'id') == id);
};
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[406]++;
  if (visit396_406_1(typeof filter === 'function')) {
    _$jscoverage['/base/selector.js'].lineData[407]++;
    ret = S.filter(elems, filter);
  } else {
    _$jscoverage['/base/selector.js'].lineData[409]++;
    ret = Dom._matchesInternal(filter, elems);
  }
  _$jscoverage['/base/selector.js'].lineData[412]++;
  return ret;
}, 
  test: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[28]++;
  _$jscoverage['/base/selector.js'].lineData[424]++;
  var elements = query(selector, context);
  _$jscoverage['/base/selector.js'].lineData[425]++;
  return visit397_425_1(elements.length && (visit398_425_2(Dom.filter(elements, filter, context).length === elements.length)));
}});
  _$jscoverage['/base/selector.js'].lineData[429]++;
  return Dom;
});
