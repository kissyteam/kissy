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
if (! _$jscoverage['/control/render.js']) {
  _$jscoverage['/control/render.js'] = {};
  _$jscoverage['/control/render.js'].lineData = [];
  _$jscoverage['/control/render.js'].lineData[7] = 0;
  _$jscoverage['/control/render.js'].lineData[8] = 0;
  _$jscoverage['/control/render.js'].lineData[9] = 0;
  _$jscoverage['/control/render.js'].lineData[10] = 0;
  _$jscoverage['/control/render.js'].lineData[11] = 0;
  _$jscoverage['/control/render.js'].lineData[12] = 0;
  _$jscoverage['/control/render.js'].lineData[13] = 0;
  _$jscoverage['/control/render.js'].lineData[14] = 0;
  _$jscoverage['/control/render.js'].lineData[16] = 0;
  _$jscoverage['/control/render.js'].lineData[25] = 0;
  _$jscoverage['/control/render.js'].lineData[26] = 0;
  _$jscoverage['/control/render.js'].lineData[27] = 0;
  _$jscoverage['/control/render.js'].lineData[29] = 0;
  _$jscoverage['/control/render.js'].lineData[32] = 0;
  _$jscoverage['/control/render.js'].lineData[33] = 0;
  _$jscoverage['/control/render.js'].lineData[38] = 0;
  _$jscoverage['/control/render.js'].lineData[39] = 0;
  _$jscoverage['/control/render.js'].lineData[41] = 0;
  _$jscoverage['/control/render.js'].lineData[43] = 0;
  _$jscoverage['/control/render.js'].lineData[44] = 0;
  _$jscoverage['/control/render.js'].lineData[45] = 0;
  _$jscoverage['/control/render.js'].lineData[49] = 0;
  _$jscoverage['/control/render.js'].lineData[50] = 0;
  _$jscoverage['/control/render.js'].lineData[53] = 0;
  _$jscoverage['/control/render.js'].lineData[54] = 0;
  _$jscoverage['/control/render.js'].lineData[59] = 0;
  _$jscoverage['/control/render.js'].lineData[60] = 0;
  _$jscoverage['/control/render.js'].lineData[61] = 0;
  _$jscoverage['/control/render.js'].lineData[63] = 0;
  _$jscoverage['/control/render.js'].lineData[64] = 0;
  _$jscoverage['/control/render.js'].lineData[66] = 0;
  _$jscoverage['/control/render.js'].lineData[69] = 0;
  _$jscoverage['/control/render.js'].lineData[70] = 0;
  _$jscoverage['/control/render.js'].lineData[75] = 0;
  _$jscoverage['/control/render.js'].lineData[76] = 0;
  _$jscoverage['/control/render.js'].lineData[77] = 0;
  _$jscoverage['/control/render.js'].lineData[78] = 0;
  _$jscoverage['/control/render.js'].lineData[80] = 0;
  _$jscoverage['/control/render.js'].lineData[83] = 0;
  _$jscoverage['/control/render.js'].lineData[84] = 0;
  _$jscoverage['/control/render.js'].lineData[87] = 0;
  _$jscoverage['/control/render.js'].lineData[88] = 0;
  _$jscoverage['/control/render.js'].lineData[89] = 0;
  _$jscoverage['/control/render.js'].lineData[94] = 0;
  _$jscoverage['/control/render.js'].lineData[95] = 0;
  _$jscoverage['/control/render.js'].lineData[98] = 0;
  _$jscoverage['/control/render.js'].lineData[99] = 0;
  _$jscoverage['/control/render.js'].lineData[107] = 0;
  _$jscoverage['/control/render.js'].lineData[115] = 0;
  _$jscoverage['/control/render.js'].lineData[118] = 0;
  _$jscoverage['/control/render.js'].lineData[120] = 0;
  _$jscoverage['/control/render.js'].lineData[122] = 0;
  _$jscoverage['/control/render.js'].lineData[127] = 0;
  _$jscoverage['/control/render.js'].lineData[142] = 0;
  _$jscoverage['/control/render.js'].lineData[143] = 0;
  _$jscoverage['/control/render.js'].lineData[144] = 0;
  _$jscoverage['/control/render.js'].lineData[145] = 0;
  _$jscoverage['/control/render.js'].lineData[149] = 0;
  _$jscoverage['/control/render.js'].lineData[150] = 0;
  _$jscoverage['/control/render.js'].lineData[151] = 0;
  _$jscoverage['/control/render.js'].lineData[152] = 0;
  _$jscoverage['/control/render.js'].lineData[154] = 0;
  _$jscoverage['/control/render.js'].lineData[155] = 0;
  _$jscoverage['/control/render.js'].lineData[157] = 0;
  _$jscoverage['/control/render.js'].lineData[158] = 0;
  _$jscoverage['/control/render.js'].lineData[160] = 0;
  _$jscoverage['/control/render.js'].lineData[161] = 0;
  _$jscoverage['/control/render.js'].lineData[164] = 0;
  _$jscoverage['/control/render.js'].lineData[165] = 0;
  _$jscoverage['/control/render.js'].lineData[168] = 0;
  _$jscoverage['/control/render.js'].lineData[169] = 0;
  _$jscoverage['/control/render.js'].lineData[170] = 0;
  _$jscoverage['/control/render.js'].lineData[172] = 0;
  _$jscoverage['/control/render.js'].lineData[173] = 0;
  _$jscoverage['/control/render.js'].lineData[175] = 0;
  _$jscoverage['/control/render.js'].lineData[177] = 0;
  _$jscoverage['/control/render.js'].lineData[178] = 0;
  _$jscoverage['/control/render.js'].lineData[180] = 0;
  _$jscoverage['/control/render.js'].lineData[185] = 0;
  _$jscoverage['/control/render.js'].lineData[186] = 0;
  _$jscoverage['/control/render.js'].lineData[195] = 0;
  _$jscoverage['/control/render.js'].lineData[197] = 0;
  _$jscoverage['/control/render.js'].lineData[198] = 0;
  _$jscoverage['/control/render.js'].lineData[199] = 0;
  _$jscoverage['/control/render.js'].lineData[200] = 0;
  _$jscoverage['/control/render.js'].lineData[204] = 0;
  _$jscoverage['/control/render.js'].lineData[206] = 0;
  _$jscoverage['/control/render.js'].lineData[207] = 0;
  _$jscoverage['/control/render.js'].lineData[209] = 0;
  _$jscoverage['/control/render.js'].lineData[210] = 0;
  _$jscoverage['/control/render.js'].lineData[211] = 0;
  _$jscoverage['/control/render.js'].lineData[215] = 0;
  _$jscoverage['/control/render.js'].lineData[220] = 0;
  _$jscoverage['/control/render.js'].lineData[221] = 0;
  _$jscoverage['/control/render.js'].lineData[223] = 0;
  _$jscoverage['/control/render.js'].lineData[224] = 0;
  _$jscoverage['/control/render.js'].lineData[225] = 0;
  _$jscoverage['/control/render.js'].lineData[226] = 0;
  _$jscoverage['/control/render.js'].lineData[228] = 0;
  _$jscoverage['/control/render.js'].lineData[234] = 0;
  _$jscoverage['/control/render.js'].lineData[235] = 0;
  _$jscoverage['/control/render.js'].lineData[236] = 0;
  _$jscoverage['/control/render.js'].lineData[237] = 0;
  _$jscoverage['/control/render.js'].lineData[238] = 0;
  _$jscoverage['/control/render.js'].lineData[239] = 0;
  _$jscoverage['/control/render.js'].lineData[240] = 0;
  _$jscoverage['/control/render.js'].lineData[241] = 0;
  _$jscoverage['/control/render.js'].lineData[242] = 0;
  _$jscoverage['/control/render.js'].lineData[244] = 0;
  _$jscoverage['/control/render.js'].lineData[252] = 0;
  _$jscoverage['/control/render.js'].lineData[253] = 0;
  _$jscoverage['/control/render.js'].lineData[258] = 0;
  _$jscoverage['/control/render.js'].lineData[262] = 0;
  _$jscoverage['/control/render.js'].lineData[268] = 0;
  _$jscoverage['/control/render.js'].lineData[270] = 0;
  _$jscoverage['/control/render.js'].lineData[271] = 0;
  _$jscoverage['/control/render.js'].lineData[272] = 0;
  _$jscoverage['/control/render.js'].lineData[273] = 0;
  _$jscoverage['/control/render.js'].lineData[275] = 0;
  _$jscoverage['/control/render.js'].lineData[278] = 0;
  _$jscoverage['/control/render.js'].lineData[283] = 0;
  _$jscoverage['/control/render.js'].lineData[284] = 0;
  _$jscoverage['/control/render.js'].lineData[285] = 0;
  _$jscoverage['/control/render.js'].lineData[286] = 0;
  _$jscoverage['/control/render.js'].lineData[287] = 0;
  _$jscoverage['/control/render.js'].lineData[300] = 0;
  _$jscoverage['/control/render.js'].lineData[302] = 0;
  _$jscoverage['/control/render.js'].lineData[303] = 0;
  _$jscoverage['/control/render.js'].lineData[304] = 0;
  _$jscoverage['/control/render.js'].lineData[306] = 0;
  _$jscoverage['/control/render.js'].lineData[310] = 0;
  _$jscoverage['/control/render.js'].lineData[311] = 0;
  _$jscoverage['/control/render.js'].lineData[312] = 0;
  _$jscoverage['/control/render.js'].lineData[314] = 0;
  _$jscoverage['/control/render.js'].lineData[318] = 0;
  _$jscoverage['/control/render.js'].lineData[319] = 0;
  _$jscoverage['/control/render.js'].lineData[320] = 0;
  _$jscoverage['/control/render.js'].lineData[321] = 0;
  _$jscoverage['/control/render.js'].lineData[323] = 0;
  _$jscoverage['/control/render.js'].lineData[326] = 0;
  _$jscoverage['/control/render.js'].lineData[327] = 0;
  _$jscoverage['/control/render.js'].lineData[336] = 0;
  _$jscoverage['/control/render.js'].lineData[337] = 0;
  _$jscoverage['/control/render.js'].lineData[343] = 0;
  _$jscoverage['/control/render.js'].lineData[344] = 0;
  _$jscoverage['/control/render.js'].lineData[346] = 0;
  _$jscoverage['/control/render.js'].lineData[356] = 0;
  _$jscoverage['/control/render.js'].lineData[369] = 0;
  _$jscoverage['/control/render.js'].lineData[373] = 0;
  _$jscoverage['/control/render.js'].lineData[377] = 0;
  _$jscoverage['/control/render.js'].lineData[381] = 0;
  _$jscoverage['/control/render.js'].lineData[382] = 0;
  _$jscoverage['/control/render.js'].lineData[384] = 0;
  _$jscoverage['/control/render.js'].lineData[385] = 0;
  _$jscoverage['/control/render.js'].lineData[390] = 0;
  _$jscoverage['/control/render.js'].lineData[393] = 0;
  _$jscoverage['/control/render.js'].lineData[394] = 0;
  _$jscoverage['/control/render.js'].lineData[396] = 0;
  _$jscoverage['/control/render.js'].lineData[404] = 0;
  _$jscoverage['/control/render.js'].lineData[407] = 0;
  _$jscoverage['/control/render.js'].lineData[414] = 0;
  _$jscoverage['/control/render.js'].lineData[419] = 0;
  _$jscoverage['/control/render.js'].lineData[420] = 0;
  _$jscoverage['/control/render.js'].lineData[422] = 0;
  _$jscoverage['/control/render.js'].lineData[429] = 0;
  _$jscoverage['/control/render.js'].lineData[432] = 0;
  _$jscoverage['/control/render.js'].lineData[438] = 0;
  _$jscoverage['/control/render.js'].lineData[441] = 0;
  _$jscoverage['/control/render.js'].lineData[445] = 0;
  _$jscoverage['/control/render.js'].lineData[467] = 0;
  _$jscoverage['/control/render.js'].lineData[470] = 0;
  _$jscoverage['/control/render.js'].lineData[471] = 0;
  _$jscoverage['/control/render.js'].lineData[472] = 0;
  _$jscoverage['/control/render.js'].lineData[475] = 0;
  _$jscoverage['/control/render.js'].lineData[476] = 0;
  _$jscoverage['/control/render.js'].lineData[478] = 0;
  _$jscoverage['/control/render.js'].lineData[479] = 0;
  _$jscoverage['/control/render.js'].lineData[483] = 0;
  _$jscoverage['/control/render.js'].lineData[485] = 0;
  _$jscoverage['/control/render.js'].lineData[486] = 0;
  _$jscoverage['/control/render.js'].lineData[487] = 0;
  _$jscoverage['/control/render.js'].lineData[494] = 0;
  _$jscoverage['/control/render.js'].lineData[502] = 0;
  _$jscoverage['/control/render.js'].lineData[509] = 0;
  _$jscoverage['/control/render.js'].lineData[510] = 0;
  _$jscoverage['/control/render.js'].lineData[513] = 0;
  _$jscoverage['/control/render.js'].lineData[516] = 0;
}
if (! _$jscoverage['/control/render.js'].functionData) {
  _$jscoverage['/control/render.js'].functionData = [];
  _$jscoverage['/control/render.js'].functionData[0] = 0;
  _$jscoverage['/control/render.js'].functionData[1] = 0;
  _$jscoverage['/control/render.js'].functionData[2] = 0;
  _$jscoverage['/control/render.js'].functionData[3] = 0;
  _$jscoverage['/control/render.js'].functionData[4] = 0;
  _$jscoverage['/control/render.js'].functionData[5] = 0;
  _$jscoverage['/control/render.js'].functionData[6] = 0;
  _$jscoverage['/control/render.js'].functionData[7] = 0;
  _$jscoverage['/control/render.js'].functionData[8] = 0;
  _$jscoverage['/control/render.js'].functionData[9] = 0;
  _$jscoverage['/control/render.js'].functionData[10] = 0;
  _$jscoverage['/control/render.js'].functionData[11] = 0;
  _$jscoverage['/control/render.js'].functionData[12] = 0;
  _$jscoverage['/control/render.js'].functionData[13] = 0;
  _$jscoverage['/control/render.js'].functionData[14] = 0;
  _$jscoverage['/control/render.js'].functionData[15] = 0;
  _$jscoverage['/control/render.js'].functionData[16] = 0;
  _$jscoverage['/control/render.js'].functionData[17] = 0;
  _$jscoverage['/control/render.js'].functionData[18] = 0;
  _$jscoverage['/control/render.js'].functionData[19] = 0;
  _$jscoverage['/control/render.js'].functionData[20] = 0;
  _$jscoverage['/control/render.js'].functionData[21] = 0;
  _$jscoverage['/control/render.js'].functionData[22] = 0;
  _$jscoverage['/control/render.js'].functionData[23] = 0;
  _$jscoverage['/control/render.js'].functionData[24] = 0;
  _$jscoverage['/control/render.js'].functionData[25] = 0;
  _$jscoverage['/control/render.js'].functionData[26] = 0;
  _$jscoverage['/control/render.js'].functionData[27] = 0;
  _$jscoverage['/control/render.js'].functionData[28] = 0;
  _$jscoverage['/control/render.js'].functionData[29] = 0;
  _$jscoverage['/control/render.js'].functionData[30] = 0;
  _$jscoverage['/control/render.js'].functionData[31] = 0;
  _$jscoverage['/control/render.js'].functionData[32] = 0;
  _$jscoverage['/control/render.js'].functionData[33] = 0;
  _$jscoverage['/control/render.js'].functionData[34] = 0;
  _$jscoverage['/control/render.js'].functionData[35] = 0;
  _$jscoverage['/control/render.js'].functionData[36] = 0;
  _$jscoverage['/control/render.js'].functionData[37] = 0;
  _$jscoverage['/control/render.js'].functionData[38] = 0;
  _$jscoverage['/control/render.js'].functionData[39] = 0;
}
if (! _$jscoverage['/control/render.js'].branchData) {
  _$jscoverage['/control/render.js'].branchData = {};
  _$jscoverage['/control/render.js'].branchData['26'] = [];
  _$jscoverage['/control/render.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['41'] = [];
  _$jscoverage['/control/render.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['44'] = [];
  _$jscoverage['/control/render.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['49'] = [];
  _$jscoverage['/control/render.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['53'] = [];
  _$jscoverage['/control/render.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['60'] = [];
  _$jscoverage['/control/render.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['63'] = [];
  _$jscoverage['/control/render.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['75'] = [];
  _$jscoverage['/control/render.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['87'] = [];
  _$jscoverage['/control/render.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['95'] = [];
  _$jscoverage['/control/render.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['118'] = [];
  _$jscoverage['/control/render.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['144'] = [];
  _$jscoverage['/control/render.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['154'] = [];
  _$jscoverage['/control/render.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['157'] = [];
  _$jscoverage['/control/render.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['160'] = [];
  _$jscoverage['/control/render.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['164'] = [];
  _$jscoverage['/control/render.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['172'] = [];
  _$jscoverage['/control/render.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['175'] = [];
  _$jscoverage['/control/render.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['177'] = [];
  _$jscoverage['/control/render.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['206'] = [];
  _$jscoverage['/control/render.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['220'] = [];
  _$jscoverage['/control/render.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['223'] = [];
  _$jscoverage['/control/render.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['225'] = [];
  _$jscoverage['/control/render.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['242'] = [];
  _$jscoverage['/control/render.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['252'] = [];
  _$jscoverage['/control/render.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['268'] = [];
  _$jscoverage['/control/render.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['272'] = [];
  _$jscoverage['/control/render.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['284'] = [];
  _$jscoverage['/control/render.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['285'] = [];
  _$jscoverage['/control/render.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['302'] = [];
  _$jscoverage['/control/render.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['311'] = [];
  _$jscoverage['/control/render.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['318'] = [];
  _$jscoverage['/control/render.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['320'] = [];
  _$jscoverage['/control/render.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['323'] = [];
  _$jscoverage['/control/render.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['343'] = [];
  _$jscoverage['/control/render.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['384'] = [];
  _$jscoverage['/control/render.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['393'] = [];
  _$jscoverage['/control/render.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['420'] = [];
  _$jscoverage['/control/render.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['471'] = [];
  _$jscoverage['/control/render.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['472'] = [];
  _$jscoverage['/control/render.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['476'] = [];
  _$jscoverage['/control/render.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['502'] = [];
  _$jscoverage['/control/render.js'].branchData['502'][1] = new BranchData();
}
_$jscoverage['/control/render.js'].branchData['502'][1].init(28, 26, 'scope.get(\'content\') || \'\'');
function visit53_502_1(result) {
  _$jscoverage['/control/render.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['476'][1].init(25, 3, 'ext');
function visit52_476_1(result) {
  _$jscoverage['/control/render.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['472'][1].init(275, 21, 'S.isArray(extensions)');
function visit51_472_1(result) {
  _$jscoverage['/control/render.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['471'][1].init(230, 27, 'NewClass[HTML_PARSER] || {}');
function visit50_471_1(result) {
  _$jscoverage['/control/render.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['420'][1].init(288, 24, 'control.get(\'focusable\')');
function visit49_420_1(result) {
  _$jscoverage['/control/render.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['393'][1].init(139, 7, 'visible');
function visit48_393_1(result) {
  _$jscoverage['/control/render.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['384'][1].init(138, 31, '!this.get(\'allowTextSelection\')');
function visit47_384_1(result) {
  _$jscoverage['/control/render.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['343'][1].init(330, 5, 'i < l');
function visit46_343_1(result) {
  _$jscoverage['/control/render.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['323'][1].init(161, 80, 'constructor.superclass && constructor.superclass.constructor');
function visit45_323_1(result) {
  _$jscoverage['/control/render.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['320'][1].init(66, 6, 'xclass');
function visit44_320_1(result) {
  _$jscoverage['/control/render.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['318'][1].init(296, 65, 'constructor && !constructor.prototype.hasOwnProperty(\'isControl\')');
function visit43_318_1(result) {
  _$jscoverage['/control/render.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['311'][1].init(46, 24, 'self.componentCssClasses');
function visit42_311_1(result) {
  _$jscoverage['/control/render.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['302'][1].init(86, 3, 'cls');
function visit41_302_1(result) {
  _$jscoverage['/control/render.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['285'][1].init(115, 37, 'renderCommands || self.renderCommands');
function visit40_285_1(result) {
  _$jscoverage['/control/render.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['284'][1].init(55, 29, 'renderData || self.renderData');
function visit39_284_1(result) {
  _$jscoverage['/control/render.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['272'][1].init(80, 30, 'typeof selector === \'function\'');
function visit38_272_1(result) {
  _$jscoverage['/control/render.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['268'][1].init(189, 47, 'childrenElSelectors || self.childrenElSelectors');
function visit37_268_1(result) {
  _$jscoverage['/control/render.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['252'][1].init(17, 8, 'this.$el');
function visit36_252_1(result) {
  _$jscoverage['/control/render.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['242'][1].init(172, 28, 'attrCfg.view && attrChangeFn');
function visit35_242_1(result) {
  _$jscoverage['/control/render.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['225'][1].init(239, 6, 'render');
function visit34_225_1(result) {
  _$jscoverage['/control/render.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['223'][1].init(133, 12, 'renderBefore');
function visit33_223_1(result) {
  _$jscoverage['/control/render.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['220'][1].init(170, 23, '!control.get(\'srcNode\')');
function visit32_220_1(result) {
  _$jscoverage['/control/render.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['206'][1].init(86, 19, '!srcNode.attr(\'id\')');
function visit31_206_1(result) {
  _$jscoverage['/control/render.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['177'][1].init(60, 13, 'UA.ieMode < 9');
function visit30_177_1(result) {
  _$jscoverage['/control/render.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['175'][1].init(1499, 24, 'control.get(\'focusable\')');
function visit29_175_1(result) {
  _$jscoverage['/control/render.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['172'][1].init(1380, 26, 'control.get(\'highlighted\')');
function visit28_172_1(result) {
  _$jscoverage['/control/render.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['164'][1].init(1092, 8, '!visible');
function visit27_164_1(result) {
  _$jscoverage['/control/render.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['160'][1].init(1006, 6, 'zIndex');
function visit26_160_1(result) {
  _$jscoverage['/control/render.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['157'][1].init(915, 6, 'height');
function visit25_157_1(result) {
  _$jscoverage['/control/render.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['154'][1].init(827, 5, 'width');
function visit24_154_1(result) {
  _$jscoverage['/control/render.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['144'][1].init(54, 9, 'attr.view');
function visit23_144_1(result) {
  _$jscoverage['/control/render.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['118'][1].init(102, 7, 'srcNode');
function visit22_118_1(result) {
  _$jscoverage['/control/render.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['95'][1].init(51, 28, 'options && options.params[0]');
function visit21_95_1(result) {
  _$jscoverage['/control/render.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['87'][1].init(85, 25, 'e.target === self.control');
function visit20_87_1(result) {
  _$jscoverage['/control/render.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['75'][1].init(150, 5, 'i < l');
function visit19_75_1(result) {
  _$jscoverage['/control/render.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['63'][1].init(73, 26, 'typeof extras === \'string\'');
function visit18_63_1(result) {
  _$jscoverage['/control/render.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['60'][1].init(13, 7, '!extras');
function visit17_60_1(result) {
  _$jscoverage['/control/render.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['53'][1].init(471, 20, 'S.isArray(v) && v[0]');
function visit16_53_1(result) {
  _$jscoverage['/control/render.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['49'][1].init(333, 21, 'typeof v === \'string\'');
function visit15_49_1(result) {
  _$jscoverage['/control/render.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['44'][1].init(100, 17, 'ret !== undefined');
function visit14_44_1(result) {
  _$jscoverage['/control/render.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['41'][1].init(62, 23, 'typeof v === \'function\'');
function visit13_41_1(result) {
  _$jscoverage['/control/render.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['26'][1].init(13, 21, 'typeof v === \'number\'');
function visit12_26_1(result) {
  _$jscoverage['/control/render.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].lineData[7]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control/render.js'].functionData[0]++;
  _$jscoverage['/control/render.js'].lineData[8]++;
  var Base = require('base');
  _$jscoverage['/control/render.js'].lineData[9]++;
  var __getHook = Base.prototype.__getHook;
  _$jscoverage['/control/render.js'].lineData[10]++;
  var noop = S.noop;
  _$jscoverage['/control/render.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/control/render.js'].lineData[12]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/control/render.js'].lineData[13]++;
  var RenderTpl = require('./render-xtpl');
  _$jscoverage['/control/render.js'].lineData[14]++;
  var Manager = require('component/manager');
  _$jscoverage['/control/render.js'].lineData[16]++;
  var ON_SET = '_onSet', trim = S.trim, $ = Node.all, UA = S.UA, startTpl = RenderTpl, endTpl = '</div>', doc = S.Env.host.document, HTML_PARSER = 'HTML_PARSER';
  _$jscoverage['/control/render.js'].lineData[25]++;
  function pxSetter(v) {
    _$jscoverage['/control/render.js'].functionData[1]++;
    _$jscoverage['/control/render.js'].lineData[26]++;
    if (visit12_26_1(typeof v === 'number')) {
      _$jscoverage['/control/render.js'].lineData[27]++;
      v += 'px';
    }
    _$jscoverage['/control/render.js'].lineData[29]++;
    return v;
  }
  _$jscoverage['/control/render.js'].lineData[32]++;
  function applyParser(srcNode, parser, control) {
    _$jscoverage['/control/render.js'].functionData[2]++;
    _$jscoverage['/control/render.js'].lineData[33]++;
    var view = this, p, v, ret;
    _$jscoverage['/control/render.js'].lineData[38]++;
    for (p in parser) {
      _$jscoverage['/control/render.js'].lineData[39]++;
      v = parser[p];
      _$jscoverage['/control/render.js'].lineData[41]++;
      if (visit13_41_1(typeof v === 'function')) {
        _$jscoverage['/control/render.js'].lineData[43]++;
        ret = v.call(view, srcNode);
        _$jscoverage['/control/render.js'].lineData[44]++;
        if (visit14_44_1(ret !== undefined)) {
          _$jscoverage['/control/render.js'].lineData[45]++;
          control.setInternal(p, ret);
        }
      } else {
        _$jscoverage['/control/render.js'].lineData[49]++;
        if (visit15_49_1(typeof v === 'string')) {
          _$jscoverage['/control/render.js'].lineData[50]++;
          control.setInternal(p, srcNode.one(v));
        } else {
          _$jscoverage['/control/render.js'].lineData[53]++;
          if (visit16_53_1(S.isArray(v) && v[0])) {
            _$jscoverage['/control/render.js'].lineData[54]++;
            control.setInternal(p, srcNode.all(v[0]));
          }
        }
      }
    }
  }
  _$jscoverage['/control/render.js'].lineData[59]++;
  function normalExtras(extras) {
    _$jscoverage['/control/render.js'].functionData[3]++;
    _$jscoverage['/control/render.js'].lineData[60]++;
    if (visit17_60_1(!extras)) {
      _$jscoverage['/control/render.js'].lineData[61]++;
      extras = [''];
    }
    _$jscoverage['/control/render.js'].lineData[63]++;
    if (visit18_63_1(typeof extras === 'string')) {
      _$jscoverage['/control/render.js'].lineData[64]++;
      extras = extras.split(/\s+/);
    }
    _$jscoverage['/control/render.js'].lineData[66]++;
    return extras;
  }
  _$jscoverage['/control/render.js'].lineData[69]++;
  function prefixExtra(prefixCls, componentCls, extras) {
    _$jscoverage['/control/render.js'].functionData[4]++;
    _$jscoverage['/control/render.js'].lineData[70]++;
    var cls = '', i = 0, l = extras.length, e, prefix = prefixCls + componentCls;
    _$jscoverage['/control/render.js'].lineData[75]++;
    for (; visit19_75_1(i < l); i++) {
      _$jscoverage['/control/render.js'].lineData[76]++;
      e = extras[i];
      _$jscoverage['/control/render.js'].lineData[77]++;
      e = e ? ('-' + e) : e;
      _$jscoverage['/control/render.js'].lineData[78]++;
      cls += ' ' + prefix + e;
    }
    _$jscoverage['/control/render.js'].lineData[80]++;
    return cls;
  }
  _$jscoverage['/control/render.js'].lineData[83]++;
  function onSetAttrChange(e) {
    _$jscoverage['/control/render.js'].functionData[5]++;
    _$jscoverage['/control/render.js'].lineData[84]++;
    var self = this, method;
    _$jscoverage['/control/render.js'].lineData[87]++;
    if (visit20_87_1(e.target === self.control)) {
      _$jscoverage['/control/render.js'].lineData[88]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/control/render.js'].lineData[89]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/control/render.js'].lineData[94]++;
  function getBaseCssClassesCmd(_, options) {
    _$jscoverage['/control/render.js'].functionData[6]++;
    _$jscoverage['/control/render.js'].lineData[95]++;
    return this.config.view.getBaseCssClasses(visit21_95_1(options && options.params[0]));
  }
  _$jscoverage['/control/render.js'].lineData[98]++;
  function getBaseCssClassCmd() {
    _$jscoverage['/control/render.js'].functionData[7]++;
    _$jscoverage['/control/render.js'].lineData[99]++;
    return this.config.view.getBaseCssClass(arguments[1].params[0]);
  }
  _$jscoverage['/control/render.js'].lineData[107]++;
  return Base.extend({
  bindInternal: noop, 
  syncInternal: noop, 
  isRender: true, 
  create: function() {
  _$jscoverage['/control/render.js'].functionData[8]++;
  _$jscoverage['/control/render.js'].lineData[115]++;
  var self = this, srcNode = self.control.get('srcNode');
  _$jscoverage['/control/render.js'].lineData[118]++;
  if (visit22_118_1(srcNode)) {
    _$jscoverage['/control/render.js'].lineData[120]++;
    self.decorateDom(srcNode);
  } else {
    _$jscoverage['/control/render.js'].lineData[122]++;
    self.createDom();
  }
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/control/render.js'].functionData[9]++;
  _$jscoverage['/control/render.js'].lineData[127]++;
  var self = this, control = self.control, width, height, visible, elAttrs = control.get('elAttrs'), cls = control.get('elCls'), disabled, attrs = control.getAttrs(), a, attr, elStyle = control.get('elStyle'), zIndex, elCls = control.get('elCls');
  _$jscoverage['/control/render.js'].lineData[142]++;
  for (a in attrs) {
    _$jscoverage['/control/render.js'].lineData[143]++;
    attr = attrs[a];
    _$jscoverage['/control/render.js'].lineData[144]++;
    if (visit23_144_1(attr.view)) {
      _$jscoverage['/control/render.js'].lineData[145]++;
      renderData[a] = control.get(a);
    }
  }
  _$jscoverage['/control/render.js'].lineData[149]++;
  width = renderData.width;
  _$jscoverage['/control/render.js'].lineData[150]++;
  height = renderData.height;
  _$jscoverage['/control/render.js'].lineData[151]++;
  visible = renderData.visible;
  _$jscoverage['/control/render.js'].lineData[152]++;
  zIndex = renderData.zIndex;
  _$jscoverage['/control/render.js'].lineData[154]++;
  if (visit24_154_1(width)) {
    _$jscoverage['/control/render.js'].lineData[155]++;
    elStyle.width = pxSetter(width);
  }
  _$jscoverage['/control/render.js'].lineData[157]++;
  if (visit25_157_1(height)) {
    _$jscoverage['/control/render.js'].lineData[158]++;
    elStyle.height = pxSetter(height);
  }
  _$jscoverage['/control/render.js'].lineData[160]++;
  if (visit26_160_1(zIndex)) {
    _$jscoverage['/control/render.js'].lineData[161]++;
    elStyle['z-index'] = zIndex;
  }
  _$jscoverage['/control/render.js'].lineData[164]++;
  if (visit27_164_1(!visible)) {
    _$jscoverage['/control/render.js'].lineData[165]++;
    elCls.push(self.getBaseCssClasses('hidden'));
  }
  _$jscoverage['/control/render.js'].lineData[168]++;
  if ((disabled = control.get('disabled'))) {
    _$jscoverage['/control/render.js'].lineData[169]++;
    cls.push(self.getBaseCssClasses('disabled'));
    _$jscoverage['/control/render.js'].lineData[170]++;
    elAttrs['aria-disabled'] = 'true';
  }
  _$jscoverage['/control/render.js'].lineData[172]++;
  if (visit28_172_1(control.get('highlighted'))) {
    _$jscoverage['/control/render.js'].lineData[173]++;
    cls.push(self.getBaseCssClasses('hover'));
  }
  _$jscoverage['/control/render.js'].lineData[175]++;
  if (visit29_175_1(control.get('focusable'))) {
    _$jscoverage['/control/render.js'].lineData[177]++;
    if (visit30_177_1(UA.ieMode < 9)) {
      _$jscoverage['/control/render.js'].lineData[178]++;
      elAttrs.hideFocus = 'true';
    }
    _$jscoverage['/control/render.js'].lineData[180]++;
    elAttrs.tabindex = disabled ? '-1' : '0';
  }
}, 
  createDom: function() {
  _$jscoverage['/control/render.js'].functionData[10]++;
  _$jscoverage['/control/render.js'].lineData[185]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[186]++;
  self.beforeCreateDom(self.renderData = {}, self.childrenElSelectors = {}, self.renderCommands = {
  getBaseCssClasses: getBaseCssClassesCmd, 
  getBaseCssClass: getBaseCssClassCmd});
  _$jscoverage['/control/render.js'].lineData[195]++;
  var control = self.control, html;
  _$jscoverage['/control/render.js'].lineData[197]++;
  html = self.renderTpl(startTpl) + self.renderTpl(self.get('contentTpl')) + endTpl;
  _$jscoverage['/control/render.js'].lineData[198]++;
  control.setInternal('el', self.$el = $(html));
  _$jscoverage['/control/render.js'].lineData[199]++;
  self.el = self.$el[0];
  _$jscoverage['/control/render.js'].lineData[200]++;
  self.fillChildrenElsBySelectors();
}, 
  decorateDom: function(srcNode) {
  _$jscoverage['/control/render.js'].functionData[11]++;
  _$jscoverage['/control/render.js'].lineData[204]++;
  var self = this, control = self.control;
  _$jscoverage['/control/render.js'].lineData[206]++;
  if (visit31_206_1(!srcNode.attr('id'))) {
    _$jscoverage['/control/render.js'].lineData[207]++;
    srcNode.attr('id', control.get('id'));
  }
  _$jscoverage['/control/render.js'].lineData[209]++;
  applyParser.call(self, srcNode, self.constructor.HTML_PARSER, control);
  _$jscoverage['/control/render.js'].lineData[210]++;
  control.setInternal('el', self.$el = srcNode);
  _$jscoverage['/control/render.js'].lineData[211]++;
  self.el = srcNode[0];
}, 
  renderUI: function() {
  _$jscoverage['/control/render.js'].functionData[12]++;
  _$jscoverage['/control/render.js'].lineData[215]++;
  var self = this, control = self.control, el = self.$el;
  _$jscoverage['/control/render.js'].lineData[220]++;
  if (visit32_220_1(!control.get('srcNode'))) {
    _$jscoverage['/control/render.js'].lineData[221]++;
    var render = control.get('render'), renderBefore = control.get('elBefore');
    _$jscoverage['/control/render.js'].lineData[223]++;
    if (visit33_223_1(renderBefore)) {
      _$jscoverage['/control/render.js'].lineData[224]++;
      el.insertBefore(renderBefore, undefined);
    } else {
      _$jscoverage['/control/render.js'].lineData[225]++;
      if (visit34_225_1(render)) {
        _$jscoverage['/control/render.js'].lineData[226]++;
        el.appendTo(render, undefined);
      } else {
        _$jscoverage['/control/render.js'].lineData[228]++;
        el.appendTo(doc.body, undefined);
      }
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/control/render.js'].functionData[13]++;
  _$jscoverage['/control/render.js'].lineData[234]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[235]++;
  var control = self.control;
  _$jscoverage['/control/render.js'].lineData[236]++;
  var attrs = control.getAttrs();
  _$jscoverage['/control/render.js'].lineData[237]++;
  var attrName, attrCfg;
  _$jscoverage['/control/render.js'].lineData[238]++;
  for (attrName in attrs) {
    _$jscoverage['/control/render.js'].lineData[239]++;
    attrCfg = attrs[attrName];
    _$jscoverage['/control/render.js'].lineData[240]++;
    var ucName = S.ucfirst(attrName);
    _$jscoverage['/control/render.js'].lineData[241]++;
    var attrChangeFn = self[ON_SET + ucName];
    _$jscoverage['/control/render.js'].lineData[242]++;
    if (visit35_242_1(attrCfg.view && attrChangeFn)) {
      _$jscoverage['/control/render.js'].lineData[244]++;
      control.on('after' + ucName + 'Change', onSetAttrChange, self);
    }
  }
}, 
  syncUI: noop, 
  destructor: function() {
  _$jscoverage['/control/render.js'].functionData[14]++;
  _$jscoverage['/control/render.js'].lineData[252]++;
  if (visit36_252_1(this.$el)) {
    _$jscoverage['/control/render.js'].lineData[253]++;
    this.$el.remove();
  }
}, 
  $: function(selector) {
  _$jscoverage['/control/render.js'].functionData[15]++;
  _$jscoverage['/control/render.js'].lineData[258]++;
  return this.$el.all(selector);
}, 
  fillChildrenElsBySelectors: function(childrenElSelectors) {
  _$jscoverage['/control/render.js'].functionData[16]++;
  _$jscoverage['/control/render.js'].lineData[262]++;
  var self = this, el = self.$el, control = self.control, childName, selector;
  _$jscoverage['/control/render.js'].lineData[268]++;
  childrenElSelectors = visit37_268_1(childrenElSelectors || self.childrenElSelectors);
  _$jscoverage['/control/render.js'].lineData[270]++;
  for (childName in childrenElSelectors) {
    _$jscoverage['/control/render.js'].lineData[271]++;
    selector = childrenElSelectors[childName];
    _$jscoverage['/control/render.js'].lineData[272]++;
    if (visit38_272_1(typeof selector === 'function')) {
      _$jscoverage['/control/render.js'].lineData[273]++;
      control.setInternal(childName, selector(el));
    } else {
      _$jscoverage['/control/render.js'].lineData[275]++;
      control.setInternal(childName, self.$(S.substitute(selector, self.renderData)));
    }
    _$jscoverage['/control/render.js'].lineData[278]++;
    delete childrenElSelectors[childName];
  }
}, 
  renderTpl: function(tpl, renderData, renderCommands) {
  _$jscoverage['/control/render.js'].functionData[17]++;
  _$jscoverage['/control/render.js'].lineData[283]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[284]++;
  renderData = visit39_284_1(renderData || self.renderData);
  _$jscoverage['/control/render.js'].lineData[285]++;
  renderCommands = visit40_285_1(renderCommands || self.renderCommands);
  _$jscoverage['/control/render.js'].lineData[286]++;
  var XTemplate = self.get('xtemplate');
  _$jscoverage['/control/render.js'].lineData[287]++;
  return new XTemplate(tpl, {
  control: self.control, 
  view: self, 
  commands: renderCommands}).render(renderData);
}, 
  getComponentConstructorByNode: function(prefixCls, childNode) {
  _$jscoverage['/control/render.js'].functionData[18]++;
  _$jscoverage['/control/render.js'].lineData[300]++;
  var cls = childNode[0].className;
  _$jscoverage['/control/render.js'].lineData[302]++;
  if (visit41_302_1(cls)) {
    _$jscoverage['/control/render.js'].lineData[303]++;
    cls = cls.replace(new RegExp('\\b' + prefixCls, 'ig'), '');
    _$jscoverage['/control/render.js'].lineData[304]++;
    return Manager.getConstructorByXClass(cls);
  }
  _$jscoverage['/control/render.js'].lineData[306]++;
  return null;
}, 
  getComponentCssClasses: function() {
  _$jscoverage['/control/render.js'].functionData[19]++;
  _$jscoverage['/control/render.js'].lineData[310]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[311]++;
  if (visit42_311_1(self.componentCssClasses)) {
    _$jscoverage['/control/render.js'].lineData[312]++;
    return self.componentCssClasses;
  }
  _$jscoverage['/control/render.js'].lineData[314]++;
  var control = self.control, constructor = control.constructor, xclass, re = [];
  _$jscoverage['/control/render.js'].lineData[318]++;
  while (visit43_318_1(constructor && !constructor.prototype.hasOwnProperty('isControl'))) {
    _$jscoverage['/control/render.js'].lineData[319]++;
    xclass = constructor.xclass;
    _$jscoverage['/control/render.js'].lineData[320]++;
    if (visit44_320_1(xclass)) {
      _$jscoverage['/control/render.js'].lineData[321]++;
      re.push(xclass);
    }
    _$jscoverage['/control/render.js'].lineData[323]++;
    constructor = visit45_323_1(constructor.superclass && constructor.superclass.constructor);
  }
  _$jscoverage['/control/render.js'].lineData[326]++;
  self.componentCssClasses = re;
  _$jscoverage['/control/render.js'].lineData[327]++;
  return re;
}, 
  getBaseCssClasses: function(extras) {
  _$jscoverage['/control/render.js'].functionData[20]++;
  _$jscoverage['/control/render.js'].lineData[336]++;
  extras = normalExtras(extras);
  _$jscoverage['/control/render.js'].lineData[337]++;
  var componentCssClasses = this.getComponentCssClasses(), i = 0, control = this.get('control'), cls = '', l = componentCssClasses.length, prefixCls = control.get('prefixCls');
  _$jscoverage['/control/render.js'].lineData[343]++;
  for (; visit46_343_1(i < l); i++) {
    _$jscoverage['/control/render.js'].lineData[344]++;
    cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
  }
  _$jscoverage['/control/render.js'].lineData[346]++;
  return trim(cls);
}, 
  getBaseCssClass: function(extras) {
  _$jscoverage['/control/render.js'].functionData[21]++;
  _$jscoverage['/control/render.js'].lineData[356]++;
  return trim(prefixExtra(this.control.get('prefixCls'), this.getComponentCssClasses()[0], normalExtras(extras)));
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/control/render.js'].functionData[22]++;
  _$jscoverage['/control/render.js'].lineData[369]++;
  return this.$el;
}, 
  '_onSetWidth': function(w) {
  _$jscoverage['/control/render.js'].functionData[23]++;
  _$jscoverage['/control/render.js'].lineData[373]++;
  this.$el.width(w);
}, 
  _onSetHeight: function(h) {
  _$jscoverage['/control/render.js'].functionData[24]++;
  _$jscoverage['/control/render.js'].lineData[377]++;
  this.$el.height(h);
}, 
  '_onSetContent': function(c) {
  _$jscoverage['/control/render.js'].functionData[25]++;
  _$jscoverage['/control/render.js'].lineData[381]++;
  var el = this.$el;
  _$jscoverage['/control/render.js'].lineData[382]++;
  el.html(c);
  _$jscoverage['/control/render.js'].lineData[384]++;
  if (visit47_384_1(!this.get('allowTextSelection'))) {
    _$jscoverage['/control/render.js'].lineData[385]++;
    el.unselectable();
  }
}, 
  _onSetVisible: function(visible) {
  _$jscoverage['/control/render.js'].functionData[26]++;
  _$jscoverage['/control/render.js'].lineData[390]++;
  var self = this, el = self.$el, hiddenCls = self.getBaseCssClasses('hidden');
  _$jscoverage['/control/render.js'].lineData[393]++;
  if (visit48_393_1(visible)) {
    _$jscoverage['/control/render.js'].lineData[394]++;
    el.removeClass(hiddenCls);
  } else {
    _$jscoverage['/control/render.js'].lineData[396]++;
    el.addClass(hiddenCls);
  }
}, 
  _onSetHighlighted: function(v) {
  _$jscoverage['/control/render.js'].functionData[27]++;
  _$jscoverage['/control/render.js'].lineData[404]++;
  var self = this, componentCls = self.getBaseCssClasses('hover'), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[407]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/control/render.js'].functionData[28]++;
  _$jscoverage['/control/render.js'].lineData[414]++;
  var self = this, control = self.control, componentCls = self.getBaseCssClasses('disabled'), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[419]++;
  el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-disabled', v);
  _$jscoverage['/control/render.js'].lineData[420]++;
  if (visit49_420_1(control.get('focusable'))) {
    _$jscoverage['/control/render.js'].lineData[422]++;
    self.getKeyEventTarget().attr('tabindex', v ? -1 : 0);
  }
}, 
  '_onSetActive': function(v) {
  _$jscoverage['/control/render.js'].functionData[29]++;
  _$jscoverage['/control/render.js'].lineData[429]++;
  var self = this, componentCls = self.getBaseCssClasses('active');
  _$jscoverage['/control/render.js'].lineData[432]++;
  self.$el[v ? 'addClass' : 'removeClass'](componentCls).attr('aria-pressed', !!v);
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/control/render.js'].functionData[30]++;
  _$jscoverage['/control/render.js'].lineData[438]++;
  var self = this, el = self.$el, componentCls = self.getBaseCssClasses('focused');
  _$jscoverage['/control/render.js'].lineData[441]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  '_onSetZIndex': function(x) {
  _$jscoverage['/control/render.js'].functionData[31]++;
  _$jscoverage['/control/render.js'].lineData[445]++;
  this.$el.css('z-index', x);
}}, {
  __hooks__: {
  createDom: __getHook('__createDom'), 
  renderUI: __getHook('__renderUI'), 
  bindUI: __getHook('__bindUI'), 
  syncUI: __getHook('__syncUI'), 
  decorateDom: __getHook('__decorateDom'), 
  beforeCreateDom: __getHook('__beforeCreateDom')}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/control/render.js'].functionData[32]++;
  _$jscoverage['/control/render.js'].lineData[467]++;
  var SuperClass = this, NewClass, parsers = {};
  _$jscoverage['/control/render.js'].lineData[470]++;
  NewClass = Base.extend.apply(SuperClass, arguments);
  _$jscoverage['/control/render.js'].lineData[471]++;
  NewClass[HTML_PARSER] = visit50_471_1(NewClass[HTML_PARSER] || {});
  _$jscoverage['/control/render.js'].lineData[472]++;
  if (visit51_472_1(S.isArray(extensions))) {
    _$jscoverage['/control/render.js'].lineData[475]++;
    S.each(extensions.concat(NewClass), function(ext) {
  _$jscoverage['/control/render.js'].functionData[33]++;
  _$jscoverage['/control/render.js'].lineData[476]++;
  if (visit52_476_1(ext)) {
    _$jscoverage['/control/render.js'].lineData[478]++;
    S.each(ext.HTML_PARSER, function(v, name) {
  _$jscoverage['/control/render.js'].functionData[34]++;
  _$jscoverage['/control/render.js'].lineData[479]++;
  parsers[name] = v;
});
  }
});
    _$jscoverage['/control/render.js'].lineData[483]++;
    NewClass[HTML_PARSER] = parsers;
  }
  _$jscoverage['/control/render.js'].lineData[485]++;
  S.mix(NewClass[HTML_PARSER], SuperClass[HTML_PARSER], false);
  _$jscoverage['/control/render.js'].lineData[486]++;
  NewClass.extend = extend;
  _$jscoverage['/control/render.js'].lineData[487]++;
  return NewClass;
}, 
  ATTRS: {
  control: {
  setter: function(v) {
  _$jscoverage['/control/render.js'].functionData[35]++;
  _$jscoverage['/control/render.js'].lineData[494]++;
  this.control = v;
}}, 
  xtemplate: {
  value: XTemplateRuntime}, 
  contentTpl: {
  value: function(scope) {
  _$jscoverage['/control/render.js'].functionData[36]++;
  _$jscoverage['/control/render.js'].lineData[502]++;
  return visit53_502_1(scope.get('content') || '');
}}}, 
  HTML_PARSER: {
  id: function(el) {
  _$jscoverage['/control/render.js'].functionData[37]++;
  _$jscoverage['/control/render.js'].lineData[509]++;
  var id = el[0].id;
  _$jscoverage['/control/render.js'].lineData[510]++;
  return id ? id : undefined;
}, 
  content: function(el) {
  _$jscoverage['/control/render.js'].functionData[38]++;
  _$jscoverage['/control/render.js'].lineData[513]++;
  return el.html();
}, 
  disabled: function(el) {
  _$jscoverage['/control/render.js'].functionData[39]++;
  _$jscoverage['/control/render.js'].lineData[516]++;
  return el.hasClass(this.getBaseCssClass('disabled'));
}}, 
  name: 'render'});
});
