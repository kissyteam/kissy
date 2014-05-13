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
if (! _$jscoverage['/data-structure.js']) {
  _$jscoverage['/data-structure.js'] = {};
  _$jscoverage['/data-structure.js'].lineData = [];
  _$jscoverage['/data-structure.js'].lineData[6] = 0;
  _$jscoverage['/data-structure.js'].lineData[7] = 0;
  _$jscoverage['/data-structure.js'].lineData[16] = 0;
  _$jscoverage['/data-structure.js'].lineData[17] = 0;
  _$jscoverage['/data-structure.js'].lineData[25] = 0;
  _$jscoverage['/data-structure.js'].lineData[26] = 0;
  _$jscoverage['/data-structure.js'].lineData[27] = 0;
  _$jscoverage['/data-structure.js'].lineData[30] = 0;
  _$jscoverage['/data-structure.js'].lineData[34] = 0;
  _$jscoverage['/data-structure.js'].lineData[43] = 0;
  _$jscoverage['/data-structure.js'].lineData[51] = 0;
  _$jscoverage['/data-structure.js'].lineData[58] = 0;
  _$jscoverage['/data-structure.js'].lineData[66] = 0;
  _$jscoverage['/data-structure.js'].lineData[74] = 0;
  _$jscoverage['/data-structure.js'].lineData[82] = 0;
  _$jscoverage['/data-structure.js'].lineData[86] = 0;
  _$jscoverage['/data-structure.js'].lineData[93] = 0;
  _$jscoverage['/data-structure.js'].lineData[94] = 0;
  _$jscoverage['/data-structure.js'].lineData[98] = 0;
  _$jscoverage['/data-structure.js'].lineData[103] = 0;
  _$jscoverage['/data-structure.js'].lineData[108] = 0;
  _$jscoverage['/data-structure.js'].lineData[113] = 0;
  _$jscoverage['/data-structure.js'].lineData[116] = 0;
  _$jscoverage['/data-structure.js'].lineData[118] = 0;
  _$jscoverage['/data-structure.js'].lineData[120] = 0;
  _$jscoverage['/data-structure.js'].lineData[122] = 0;
  _$jscoverage['/data-structure.js'].lineData[123] = 0;
  _$jscoverage['/data-structure.js'].lineData[124] = 0;
  _$jscoverage['/data-structure.js'].lineData[125] = 0;
  _$jscoverage['/data-structure.js'].lineData[128] = 0;
  _$jscoverage['/data-structure.js'].lineData[129] = 0;
  _$jscoverage['/data-structure.js'].lineData[133] = 0;
  _$jscoverage['/data-structure.js'].lineData[136] = 0;
  _$jscoverage['/data-structure.js'].lineData[142] = 0;
  _$jscoverage['/data-structure.js'].lineData[143] = 0;
  _$jscoverage['/data-structure.js'].lineData[144] = 0;
  _$jscoverage['/data-structure.js'].lineData[146] = 0;
  _$jscoverage['/data-structure.js'].lineData[147] = 0;
  _$jscoverage['/data-structure.js'].lineData[151] = 0;
  _$jscoverage['/data-structure.js'].lineData[155] = 0;
  _$jscoverage['/data-structure.js'].lineData[159] = 0;
  _$jscoverage['/data-structure.js'].lineData[163] = 0;
  _$jscoverage['/data-structure.js'].lineData[164] = 0;
  _$jscoverage['/data-structure.js'].lineData[166] = 0;
  _$jscoverage['/data-structure.js'].lineData[174] = 0;
  _$jscoverage['/data-structure.js'].lineData[176] = 0;
  _$jscoverage['/data-structure.js'].lineData[177] = 0;
  _$jscoverage['/data-structure.js'].lineData[178] = 0;
  _$jscoverage['/data-structure.js'].lineData[180] = 0;
  _$jscoverage['/data-structure.js'].lineData[182] = 0;
  _$jscoverage['/data-structure.js'].lineData[184] = 0;
  _$jscoverage['/data-structure.js'].lineData[188] = 0;
  _$jscoverage['/data-structure.js'].lineData[192] = 0;
  _$jscoverage['/data-structure.js'].lineData[194] = 0;
  _$jscoverage['/data-structure.js'].lineData[195] = 0;
  _$jscoverage['/data-structure.js'].lineData[197] = 0;
  _$jscoverage['/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/data-structure.js'].lineData[200] = 0;
  _$jscoverage['/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/data-structure.js'].lineData[203] = 0;
  _$jscoverage['/data-structure.js'].lineData[204] = 0;
  _$jscoverage['/data-structure.js'].lineData[205] = 0;
  _$jscoverage['/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/data-structure.js'].lineData[209] = 0;
  _$jscoverage['/data-structure.js'].lineData[211] = 0;
  _$jscoverage['/data-structure.js'].lineData[216] = 0;
  _$jscoverage['/data-structure.js'].lineData[217] = 0;
  _$jscoverage['/data-structure.js'].lineData[221] = 0;
  _$jscoverage['/data-structure.js'].lineData[222] = 0;
  _$jscoverage['/data-structure.js'].lineData[223] = 0;
  _$jscoverage['/data-structure.js'].lineData[225] = 0;
  _$jscoverage['/data-structure.js'].lineData[226] = 0;
  _$jscoverage['/data-structure.js'].lineData[228] = 0;
  _$jscoverage['/data-structure.js'].lineData[236] = 0;
  _$jscoverage['/data-structure.js'].lineData[237] = 0;
  _$jscoverage['/data-structure.js'].lineData[238] = 0;
  _$jscoverage['/data-structure.js'].lineData[240] = 0;
  _$jscoverage['/data-structure.js'].lineData[248] = 0;
  _$jscoverage['/data-structure.js'].lineData[256] = 0;
  _$jscoverage['/data-structure.js'].lineData[257] = 0;
  _$jscoverage['/data-structure.js'].lineData[258] = 0;
  _$jscoverage['/data-structure.js'].lineData[262] = 0;
  _$jscoverage['/data-structure.js'].lineData[263] = 0;
  _$jscoverage['/data-structure.js'].lineData[264] = 0;
  _$jscoverage['/data-structure.js'].lineData[267] = 0;
  _$jscoverage['/data-structure.js'].lineData[269] = 0;
  _$jscoverage['/data-structure.js'].lineData[278] = 0;
  _$jscoverage['/data-structure.js'].lineData[279] = 0;
  _$jscoverage['/data-structure.js'].lineData[287] = 0;
  _$jscoverage['/data-structure.js'].lineData[288] = 0;
  _$jscoverage['/data-structure.js'].lineData[292] = 0;
  _$jscoverage['/data-structure.js'].lineData[293] = 0;
  _$jscoverage['/data-structure.js'].lineData[294] = 0;
  _$jscoverage['/data-structure.js'].lineData[296] = 0;
  _$jscoverage['/data-structure.js'].lineData[297] = 0;
  _$jscoverage['/data-structure.js'].lineData[298] = 0;
  _$jscoverage['/data-structure.js'].lineData[300] = 0;
  _$jscoverage['/data-structure.js'].lineData[304] = 0;
  _$jscoverage['/data-structure.js'].lineData[305] = 0;
  _$jscoverage['/data-structure.js'].lineData[306] = 0;
  _$jscoverage['/data-structure.js'].lineData[308] = 0;
  _$jscoverage['/data-structure.js'].lineData[309] = 0;
  _$jscoverage['/data-structure.js'].lineData[313] = 0;
  _$jscoverage['/data-structure.js'].lineData[314] = 0;
  _$jscoverage['/data-structure.js'].lineData[315] = 0;
  _$jscoverage['/data-structure.js'].lineData[317] = 0;
  _$jscoverage['/data-structure.js'].lineData[318] = 0;
  _$jscoverage['/data-structure.js'].lineData[322] = 0;
  _$jscoverage['/data-structure.js'].lineData[326] = 0;
  _$jscoverage['/data-structure.js'].lineData[327] = 0;
  _$jscoverage['/data-structure.js'].lineData[333] = 0;
  _$jscoverage['/data-structure.js'].lineData[334] = 0;
  _$jscoverage['/data-structure.js'].lineData[344] = 0;
  _$jscoverage['/data-structure.js'].lineData[348] = 0;
  _$jscoverage['/data-structure.js'].lineData[350] = 0;
  _$jscoverage['/data-structure.js'].lineData[354] = 0;
  _$jscoverage['/data-structure.js'].lineData[357] = 0;
  _$jscoverage['/data-structure.js'].lineData[361] = 0;
  _$jscoverage['/data-structure.js'].lineData[363] = 0;
  _$jscoverage['/data-structure.js'].lineData[365] = 0;
  _$jscoverage['/data-structure.js'].lineData[366] = 0;
  _$jscoverage['/data-structure.js'].lineData[367] = 0;
  _$jscoverage['/data-structure.js'].lineData[369] = 0;
  _$jscoverage['/data-structure.js'].lineData[370] = 0;
  _$jscoverage['/data-structure.js'].lineData[372] = 0;
  _$jscoverage['/data-structure.js'].lineData[374] = 0;
  _$jscoverage['/data-structure.js'].lineData[375] = 0;
  _$jscoverage['/data-structure.js'].lineData[377] = 0;
  _$jscoverage['/data-structure.js'].lineData[382] = 0;
  _$jscoverage['/data-structure.js'].lineData[383] = 0;
  _$jscoverage['/data-structure.js'].lineData[384] = 0;
  _$jscoverage['/data-structure.js'].lineData[385] = 0;
  _$jscoverage['/data-structure.js'].lineData[386] = 0;
  _$jscoverage['/data-structure.js'].lineData[387] = 0;
  _$jscoverage['/data-structure.js'].lineData[388] = 0;
  _$jscoverage['/data-structure.js'].lineData[389] = 0;
  _$jscoverage['/data-structure.js'].lineData[392] = 0;
  _$jscoverage['/data-structure.js'].lineData[395] = 0;
  _$jscoverage['/data-structure.js'].lineData[396] = 0;
  _$jscoverage['/data-structure.js'].lineData[397] = 0;
  _$jscoverage['/data-structure.js'].lineData[398] = 0;
  _$jscoverage['/data-structure.js'].lineData[399] = 0;
  _$jscoverage['/data-structure.js'].lineData[401] = 0;
  _$jscoverage['/data-structure.js'].lineData[404] = 0;
  _$jscoverage['/data-structure.js'].lineData[405] = 0;
  _$jscoverage['/data-structure.js'].lineData[408] = 0;
  _$jscoverage['/data-structure.js'].lineData[409] = 0;
  _$jscoverage['/data-structure.js'].lineData[411] = 0;
  _$jscoverage['/data-structure.js'].lineData[412] = 0;
  _$jscoverage['/data-structure.js'].lineData[414] = 0;
  _$jscoverage['/data-structure.js'].lineData[415] = 0;
  _$jscoverage['/data-structure.js'].lineData[416] = 0;
  _$jscoverage['/data-structure.js'].lineData[418] = 0;
  _$jscoverage['/data-structure.js'].lineData[421] = 0;
  _$jscoverage['/data-structure.js'].lineData[424] = 0;
}
if (! _$jscoverage['/data-structure.js'].functionData) {
  _$jscoverage['/data-structure.js'].functionData = [];
  _$jscoverage['/data-structure.js'].functionData[0] = 0;
  _$jscoverage['/data-structure.js'].functionData[1] = 0;
  _$jscoverage['/data-structure.js'].functionData[2] = 0;
  _$jscoverage['/data-structure.js'].functionData[3] = 0;
  _$jscoverage['/data-structure.js'].functionData[4] = 0;
  _$jscoverage['/data-structure.js'].functionData[5] = 0;
  _$jscoverage['/data-structure.js'].functionData[6] = 0;
  _$jscoverage['/data-structure.js'].functionData[7] = 0;
  _$jscoverage['/data-structure.js'].functionData[8] = 0;
  _$jscoverage['/data-structure.js'].functionData[9] = 0;
  _$jscoverage['/data-structure.js'].functionData[10] = 0;
  _$jscoverage['/data-structure.js'].functionData[11] = 0;
  _$jscoverage['/data-structure.js'].functionData[12] = 0;
  _$jscoverage['/data-structure.js'].functionData[13] = 0;
  _$jscoverage['/data-structure.js'].functionData[14] = 0;
  _$jscoverage['/data-structure.js'].functionData[15] = 0;
  _$jscoverage['/data-structure.js'].functionData[16] = 0;
  _$jscoverage['/data-structure.js'].functionData[17] = 0;
  _$jscoverage['/data-structure.js'].functionData[18] = 0;
  _$jscoverage['/data-structure.js'].functionData[19] = 0;
  _$jscoverage['/data-structure.js'].functionData[20] = 0;
  _$jscoverage['/data-structure.js'].functionData[21] = 0;
  _$jscoverage['/data-structure.js'].functionData[22] = 0;
  _$jscoverage['/data-structure.js'].functionData[23] = 0;
  _$jscoverage['/data-structure.js'].functionData[24] = 0;
  _$jscoverage['/data-structure.js'].functionData[25] = 0;
  _$jscoverage['/data-structure.js'].functionData[26] = 0;
  _$jscoverage['/data-structure.js'].functionData[27] = 0;
  _$jscoverage['/data-structure.js'].functionData[28] = 0;
  _$jscoverage['/data-structure.js'].functionData[29] = 0;
  _$jscoverage['/data-structure.js'].functionData[30] = 0;
  _$jscoverage['/data-structure.js'].functionData[31] = 0;
  _$jscoverage['/data-structure.js'].functionData[32] = 0;
  _$jscoverage['/data-structure.js'].functionData[33] = 0;
  _$jscoverage['/data-structure.js'].functionData[34] = 0;
  _$jscoverage['/data-structure.js'].functionData[35] = 0;
  _$jscoverage['/data-structure.js'].functionData[36] = 0;
  _$jscoverage['/data-structure.js'].functionData[37] = 0;
  _$jscoverage['/data-structure.js'].functionData[38] = 0;
  _$jscoverage['/data-structure.js'].functionData[39] = 0;
  _$jscoverage['/data-structure.js'].functionData[40] = 0;
}
if (! _$jscoverage['/data-structure.js'].branchData) {
  _$jscoverage['/data-structure.js'].branchData = {};
  _$jscoverage['/data-structure.js'].branchData['143'] = [];
  _$jscoverage['/data-structure.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['176'] = [];
  _$jscoverage['/data-structure.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['177'] = [];
  _$jscoverage['/data-structure.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['194'] = [];
  _$jscoverage['/data-structure.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['199'] = [];
  _$jscoverage['/data-structure.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['202'] = [];
  _$jscoverage['/data-structure.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['204'] = [];
  _$jscoverage['/data-structure.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['204'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['208'] = [];
  _$jscoverage['/data-structure.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['222'] = [];
  _$jscoverage['/data-structure.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['237'] = [];
  _$jscoverage['/data-structure.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['257'] = [];
  _$jscoverage['/data-structure.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['263'] = [];
  _$jscoverage['/data-structure.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['263'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['267'] = [];
  _$jscoverage['/data-structure.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['279'] = [];
  _$jscoverage['/data-structure.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['288'] = [];
  _$jscoverage['/data-structure.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['305'] = [];
  _$jscoverage['/data-structure.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['314'] = [];
  _$jscoverage['/data-structure.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['326'] = [];
  _$jscoverage['/data-structure.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['338'] = [];
  _$jscoverage['/data-structure.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['348'] = [];
  _$jscoverage['/data-structure.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['365'] = [];
  _$jscoverage['/data-structure.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['370'] = [];
  _$jscoverage['/data-structure.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['384'] = [];
  _$jscoverage['/data-structure.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['388'] = [];
  _$jscoverage['/data-structure.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['396'] = [];
  _$jscoverage['/data-structure.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['398'] = [];
  _$jscoverage['/data-structure.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['408'] = [];
  _$jscoverage['/data-structure.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['411'] = [];
  _$jscoverage['/data-structure.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['415'] = [];
  _$jscoverage['/data-structure.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['418'] = [];
  _$jscoverage['/data-structure.js'].branchData['418'][1] = new BranchData();
}
_$jscoverage['/data-structure.js'].branchData['418'][1].init(405, 52, 'alias || [pluginAlias(name)]');
function visit145_418_1(result) {
  _$jscoverage['/data-structure.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['415'][1].init(298, 17, 'packageInfo.alias');
function visit144_415_1(result) {
  _$jscoverage['/data-structure.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['411'][1].init(197, 5, 'alias');
function visit143_411_1(result) {
  _$jscoverage['/data-structure.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['408'][1].init(102, 25, 'typeof alias === \'string\'');
function visit142_408_1(result) {
  _$jscoverage['/data-structure.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['398'][1].init(96, 5, 'i < l');
function visit141_398_1(result) {
  _$jscoverage['/data-structure.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['396'][1].init(21, 14, 'requires || []');
function visit140_396_1(result) {
  _$jscoverage['/data-structure.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['388'][1].init(176, 12, 'Plugin.alias');
function visit139_388_1(result) {
  _$jscoverage['/data-structure.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['384'][1].init(54, 12, 'index !== -1');
function visit138_384_1(result) {
  _$jscoverage['/data-structure.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['370'][1].init(315, 8, 'self.cjs');
function visit137_370_1(result) {
  _$jscoverage['/data-structure.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['365'][1].init(156, 19, 'status >= ATTACHING');
function visit136_365_1(result) {
  _$jscoverage['/data-structure.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['348'][1].init(987, 21, 'exports !== undefined');
function visit135_348_1(result) {
  _$jscoverage['/data-structure.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['338'][1].init(36, 27, 'requires && requires.length');
function visit134_338_1(result) {
  _$jscoverage['/data-structure.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['326'][1].init(117, 29, 'typeof factory === \'function\'');
function visit133_326_1(result) {
  _$jscoverage['/data-structure.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['314'][1].init(48, 20, 'self.requiredModules');
function visit132_314_1(result) {
  _$jscoverage['/data-structure.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['305'][1].init(48, 30, 'self.normalizedRequiredModules');
function visit131_305_1(result) {
  _$jscoverage['/data-structure.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['288'][1].init(51, 46, 'self.charset || self.getPackage().getCharset()');
function visit130_288_1(result) {
  _$jscoverage['/data-structure.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['279'][1].init(51, 38, 'self.tag || self.getPackage().getTag()');
function visit129_279_1(result) {
  _$jscoverage['/data-structure.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['267'][1].init(408, 32, 'packages[pName] || packages.core');
function visit128_267_1(result) {
  _$jscoverage['/data-structure.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['263'][2].init(69, 23, 'p.length > pName.length');
function visit127_263_2(result) {
  _$jscoverage['/data-structure.js'].branchData['263'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['263'][1].init(26, 66, 'Utils.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit126_263_1(result) {
  _$jscoverage['/data-structure.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['257'][1].init(48, 17, '!self.packageInfo');
function visit125_257_1(result) {
  _$jscoverage['/data-structure.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['237'][1].init(48, 9, '!self.url');
function visit124_237_1(result) {
  _$jscoverage['/data-structure.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['222'][1].init(48, 22, 'self.normalizedModules');
function visit123_222_1(result) {
  _$jscoverage['/data-structure.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['208'][1].init(210, 11, 'normalAlias');
function visit122_208_1(result) {
  _$jscoverage['/data-structure.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['204'][2].init(86, 18, 'aliasItem !== name');
function visit121_204_2(result) {
  _$jscoverage['/data-structure.js'].branchData['204'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['204'][1].init(73, 31, 'aliasItem && aliasItem !== name');
function visit120_204_1(result) {
  _$jscoverage['/data-structure.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['202'][1].init(52, 5, 'i < l');
function visit119_202_1(result) {
  _$jscoverage['/data-structure.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['199'][1].init(260, 17, 'alias[0] === name');
function visit118_199_1(result) {
  _$jscoverage['/data-structure.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['194'][1].init(83, 20, 'self.normalizedAlias');
function visit117_194_1(result) {
  _$jscoverage['/data-structure.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['177'][1].init(22, 33, 'Utils.endsWith(self.name, \'.css\')');
function visit116_177_1(result) {
  _$jscoverage['/data-structure.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['176'][1].init(80, 2, '!v');
function visit115_176_1(result) {
  _$jscoverage['/data-structure.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['143'][1].init(69, 26, 'resolveCache[relativeName]');
function visit114_143_1(result) {
  _$jscoverage['/data-structure.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/data-structure.js'].functionData[0]++;
  _$jscoverage['/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Config = S.Config, Status = Loader.Status, ATTACHED = Status.ATTACHED, ATTACHING = Status.ATTACHING, Utils = Loader.Utils, createModule = Utils.createModule, mix = Utils.mix;
  _$jscoverage['/data-structure.js'].lineData[16]++;
  function checkGlobalIfNotExist(self, property) {
    _$jscoverage['/data-structure.js'].functionData[1]++;
    _$jscoverage['/data-structure.js'].lineData[17]++;
    return property in self ? self[property] : Config[property];
  }
  _$jscoverage['/data-structure.js'].lineData[25]++;
  function Package(cfg) {
    _$jscoverage['/data-structure.js'].functionData[2]++;
    _$jscoverage['/data-structure.js'].lineData[26]++;
    this.filter = '';
    _$jscoverage['/data-structure.js'].lineData[27]++;
    mix(this, cfg);
  }
  _$jscoverage['/data-structure.js'].lineData[30]++;
  Package.prototype = {
  constructor: Package, 
  reset: function(cfg) {
  _$jscoverage['/data-structure.js'].functionData[3]++;
  _$jscoverage['/data-structure.js'].lineData[34]++;
  mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[4]++;
  _$jscoverage['/data-structure.js'].lineData[43]++;
  return checkGlobalIfNotExist(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[5]++;
  _$jscoverage['/data-structure.js'].lineData[51]++;
  return this.name;
}, 
  getBase: function() {
  _$jscoverage['/data-structure.js'].functionData[6]++;
  _$jscoverage['/data-structure.js'].lineData[58]++;
  return this.base;
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[7]++;
  _$jscoverage['/data-structure.js'].lineData[66]++;
  return checkGlobalIfNotExist(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/data-structure.js'].functionData[8]++;
  _$jscoverage['/data-structure.js'].lineData[74]++;
  return checkGlobalIfNotExist(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/data-structure.js'].functionData[9]++;
  _$jscoverage['/data-structure.js'].lineData[82]++;
  return checkGlobalIfNotExist(this, 'group');
}};
  _$jscoverage['/data-structure.js'].lineData[86]++;
  Loader.Package = Package;
  _$jscoverage['/data-structure.js'].lineData[93]++;
  function Module(cfg) {
    _$jscoverage['/data-structure.js'].functionData[10]++;
    _$jscoverage['/data-structure.js'].lineData[94]++;
    var self = this;
    _$jscoverage['/data-structure.js'].lineData[98]++;
    self.exports = undefined;
    _$jscoverage['/data-structure.js'].lineData[103]++;
    self.status = Status.INIT;
    _$jscoverage['/data-structure.js'].lineData[108]++;
    self.name = undefined;
    _$jscoverage['/data-structure.js'].lineData[113]++;
    self.factory = undefined;
    _$jscoverage['/data-structure.js'].lineData[116]++;
    self.cjs = 1;
    _$jscoverage['/data-structure.js'].lineData[118]++;
    mix(self, cfg);
    _$jscoverage['/data-structure.js'].lineData[120]++;
    self.waits = {};
    _$jscoverage['/data-structure.js'].lineData[122]++;
    self.require = function(moduleName) {
  _$jscoverage['/data-structure.js'].functionData[11]++;
  _$jscoverage['/data-structure.js'].lineData[123]++;
  var requiresModule = createModule(self.resolve(moduleName));
  _$jscoverage['/data-structure.js'].lineData[124]++;
  Utils.attachModules(requiresModule.getNormalizedModules());
  _$jscoverage['/data-structure.js'].lineData[125]++;
  return requiresModule.getExports();
};
    _$jscoverage['/data-structure.js'].lineData[128]++;
    self.require.resolve = function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[12]++;
  _$jscoverage['/data-structure.js'].lineData[129]++;
  return self.resolve(relativeName);
};
    _$jscoverage['/data-structure.js'].lineData[133]++;
    self.resolveCache = {};
  }
  _$jscoverage['/data-structure.js'].lineData[136]++;
  Module.prototype = {
  kissy: 1, 
  constructor: Module, 
  resolve: function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[13]++;
  _$jscoverage['/data-structure.js'].lineData[142]++;
  var resolveCache = this.resolveCache;
  _$jscoverage['/data-structure.js'].lineData[143]++;
  if (visit114_143_1(resolveCache[relativeName])) {
    _$jscoverage['/data-structure.js'].lineData[144]++;
    return resolveCache[relativeName];
  }
  _$jscoverage['/data-structure.js'].lineData[146]++;
  resolveCache[relativeName] = Utils.normalizePath(this.name, relativeName);
  _$jscoverage['/data-structure.js'].lineData[147]++;
  return resolveCache[relativeName];
}, 
  add: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[14]++;
  _$jscoverage['/data-structure.js'].lineData[151]++;
  this.waits[loader.id] = loader;
}, 
  remove: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[15]++;
  _$jscoverage['/data-structure.js'].lineData[155]++;
  delete this.waits[loader.id];
}, 
  contains: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[16]++;
  _$jscoverage['/data-structure.js'].lineData[159]++;
  return this.waits[loader.id];
}, 
  flush: function() {
  _$jscoverage['/data-structure.js'].functionData[17]++;
  _$jscoverage['/data-structure.js'].lineData[163]++;
  Utils.each(this.waits, function(loader) {
  _$jscoverage['/data-structure.js'].functionData[18]++;
  _$jscoverage['/data-structure.js'].lineData[164]++;
  loader.flush();
});
  _$jscoverage['/data-structure.js'].lineData[166]++;
  this.waits = {};
}, 
  getType: function() {
  _$jscoverage['/data-structure.js'].functionData[19]++;
  _$jscoverage['/data-structure.js'].lineData[174]++;
  var self = this, v = self.type;
  _$jscoverage['/data-structure.js'].lineData[176]++;
  if (visit115_176_1(!v)) {
    _$jscoverage['/data-structure.js'].lineData[177]++;
    if (visit116_177_1(Utils.endsWith(self.name, '.css'))) {
      _$jscoverage['/data-structure.js'].lineData[178]++;
      v = 'css';
    } else {
      _$jscoverage['/data-structure.js'].lineData[180]++;
      v = 'js';
    }
    _$jscoverage['/data-structure.js'].lineData[182]++;
    self.type = v;
  }
  _$jscoverage['/data-structure.js'].lineData[184]++;
  return v;
}, 
  getExports: function() {
  _$jscoverage['/data-structure.js'].functionData[20]++;
  _$jscoverage['/data-structure.js'].lineData[188]++;
  return this.getNormalizedModules()[0].exports;
}, 
  getAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[21]++;
  _$jscoverage['/data-structure.js'].lineData[192]++;
  var self = this, name = self.name;
  _$jscoverage['/data-structure.js'].lineData[194]++;
  if (visit117_194_1(self.normalizedAlias)) {
    _$jscoverage['/data-structure.js'].lineData[195]++;
    return self.normalizedAlias;
  }
  _$jscoverage['/data-structure.js'].lineData[197]++;
  var alias = getShallowAlias(self);
  _$jscoverage['/data-structure.js'].lineData[198]++;
  var ret = [];
  _$jscoverage['/data-structure.js'].lineData[199]++;
  if (visit118_199_1(alias[0] === name)) {
    _$jscoverage['/data-structure.js'].lineData[200]++;
    ret = alias;
  } else {
    _$jscoverage['/data-structure.js'].lineData[202]++;
    for (var i = 0, l = alias.length; visit119_202_1(i < l); i++) {
      _$jscoverage['/data-structure.js'].lineData[203]++;
      var aliasItem = alias[i];
      _$jscoverage['/data-structure.js'].lineData[204]++;
      if (visit120_204_1(aliasItem && visit121_204_2(aliasItem !== name))) {
        _$jscoverage['/data-structure.js'].lineData[205]++;
        aliasItem = pluginAlias(aliasItem);
        _$jscoverage['/data-structure.js'].lineData[206]++;
        var mod = createModule(aliasItem);
        _$jscoverage['/data-structure.js'].lineData[207]++;
        var normalAlias = mod.getAlias();
        _$jscoverage['/data-structure.js'].lineData[208]++;
        if (visit122_208_1(normalAlias)) {
          _$jscoverage['/data-structure.js'].lineData[209]++;
          ret.push.apply(ret, normalAlias);
        } else {
          _$jscoverage['/data-structure.js'].lineData[211]++;
          ret.push(aliasItem);
        }
      }
    }
  }
  _$jscoverage['/data-structure.js'].lineData[216]++;
  self.normalizedAlias = ret;
  _$jscoverage['/data-structure.js'].lineData[217]++;
  return ret;
}, 
  getNormalizedModules: function() {
  _$jscoverage['/data-structure.js'].functionData[22]++;
  _$jscoverage['/data-structure.js'].lineData[221]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[222]++;
  if (visit123_222_1(self.normalizedModules)) {
    _$jscoverage['/data-structure.js'].lineData[223]++;
    return self.normalizedModules;
  }
  _$jscoverage['/data-structure.js'].lineData[225]++;
  self.normalizedModules = Utils.map(self.getAlias(), function(alias) {
  _$jscoverage['/data-structure.js'].functionData[23]++;
  _$jscoverage['/data-structure.js'].lineData[226]++;
  return createModule(alias);
});
  _$jscoverage['/data-structure.js'].lineData[228]++;
  return self.normalizedModules;
}, 
  getUrl: function() {
  _$jscoverage['/data-structure.js'].functionData[24]++;
  _$jscoverage['/data-structure.js'].lineData[236]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[237]++;
  if (visit124_237_1(!self.url)) {
    _$jscoverage['/data-structure.js'].lineData[238]++;
    self.url = S.Config.resolveModFn(self);
  }
  _$jscoverage['/data-structure.js'].lineData[240]++;
  return self.url;
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[25]++;
  _$jscoverage['/data-structure.js'].lineData[248]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/data-structure.js'].functionData[26]++;
  _$jscoverage['/data-structure.js'].lineData[256]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[257]++;
  if (visit125_257_1(!self.packageInfo)) {
    _$jscoverage['/data-structure.js'].lineData[258]++;
    var packages = Config.packages, modNameSlash = self.name + '/', pName = '', p;
    _$jscoverage['/data-structure.js'].lineData[262]++;
    for (p in packages) {
      _$jscoverage['/data-structure.js'].lineData[263]++;
      if (visit126_263_1(Utils.startsWith(modNameSlash, p + '/') && visit127_263_2(p.length > pName.length))) {
        _$jscoverage['/data-structure.js'].lineData[264]++;
        pName = p;
      }
    }
    _$jscoverage['/data-structure.js'].lineData[267]++;
    self.packageInfo = visit128_267_1(packages[pName] || packages.core);
  }
  _$jscoverage['/data-structure.js'].lineData[269]++;
  return self.packageInfo;
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[27]++;
  _$jscoverage['/data-structure.js'].lineData[278]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[279]++;
  return visit129_279_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[28]++;
  _$jscoverage['/data-structure.js'].lineData[287]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[288]++;
  return visit130_288_1(self.charset || self.getPackage().getCharset());
}, 
  setRequiresModules: function(requires) {
  _$jscoverage['/data-structure.js'].functionData[29]++;
  _$jscoverage['/data-structure.js'].lineData[292]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[293]++;
  var requiredModules = self.requiredModules = Utils.map(normalizeRequires(requires, self), function(m) {
  _$jscoverage['/data-structure.js'].functionData[30]++;
  _$jscoverage['/data-structure.js'].lineData[294]++;
  return createModule(m);
});
  _$jscoverage['/data-structure.js'].lineData[296]++;
  var normalizedRequiredModules = [];
  _$jscoverage['/data-structure.js'].lineData[297]++;
  Utils.each(requiredModules, function(mod) {
  _$jscoverage['/data-structure.js'].functionData[31]++;
  _$jscoverage['/data-structure.js'].lineData[298]++;
  normalizedRequiredModules.push.apply(normalizedRequiredModules, mod.getNormalizedModules());
});
  _$jscoverage['/data-structure.js'].lineData[300]++;
  self.normalizedRequiredModules = normalizedRequiredModules;
}, 
  getNormalizedRequiredModules: function() {
  _$jscoverage['/data-structure.js'].functionData[32]++;
  _$jscoverage['/data-structure.js'].lineData[304]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[305]++;
  if (visit131_305_1(self.normalizedRequiredModules)) {
    _$jscoverage['/data-structure.js'].lineData[306]++;
    return self.normalizedRequiredModules;
  }
  _$jscoverage['/data-structure.js'].lineData[308]++;
  self.setRequiresModules(self.requires);
  _$jscoverage['/data-structure.js'].lineData[309]++;
  return self.normalizedRequiredModules;
}, 
  getRequiredModules: function() {
  _$jscoverage['/data-structure.js'].functionData[33]++;
  _$jscoverage['/data-structure.js'].lineData[313]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[314]++;
  if (visit132_314_1(self.requiredModules)) {
    _$jscoverage['/data-structure.js'].lineData[315]++;
    return self.requiredModules;
  }
  _$jscoverage['/data-structure.js'].lineData[317]++;
  self.setRequiresModules(self.requires);
  _$jscoverage['/data-structure.js'].lineData[318]++;
  return self.requiredModules;
}, 
  attachSelf: function() {
  _$jscoverage['/data-structure.js'].functionData[34]++;
  _$jscoverage['/data-structure.js'].lineData[322]++;
  var self = this, factory = self.factory, exports;
  _$jscoverage['/data-structure.js'].lineData[326]++;
  if (visit133_326_1(typeof factory === 'function')) {
    _$jscoverage['/data-structure.js'].lineData[327]++;
    self.exports = {};
    _$jscoverage['/data-structure.js'].lineData[333]++;
    var requires = self.requires;
    _$jscoverage['/data-structure.js'].lineData[334]++;
    exports = factory.apply(self, (self.cjs ? [S, visit134_338_1(requires && requires.length) ? self.require : undefined, self.exports, self] : [S].concat(Utils.map(self.getRequiredModules(), function(m) {
  _$jscoverage['/data-structure.js'].functionData[35]++;
  _$jscoverage['/data-structure.js'].lineData[344]++;
  return m.getExports();
}))));
    _$jscoverage['/data-structure.js'].lineData[348]++;
    if (visit135_348_1(exports !== undefined)) {
      _$jscoverage['/data-structure.js'].lineData[350]++;
      self.exports = exports;
    }
  } else {
    _$jscoverage['/data-structure.js'].lineData[354]++;
    self.exports = factory;
  }
  _$jscoverage['/data-structure.js'].lineData[357]++;
  self.status = ATTACHED;
}, 
  attach: function() {
  _$jscoverage['/data-structure.js'].functionData[36]++;
  _$jscoverage['/data-structure.js'].lineData[361]++;
  var self = this, status;
  _$jscoverage['/data-structure.js'].lineData[363]++;
  status = self.status;
  _$jscoverage['/data-structure.js'].lineData[365]++;
  if (visit136_365_1(status >= ATTACHING)) {
    _$jscoverage['/data-structure.js'].lineData[366]++;
    self.status = ATTACHED;
    _$jscoverage['/data-structure.js'].lineData[367]++;
    return;
  }
  _$jscoverage['/data-structure.js'].lineData[369]++;
  self.status = ATTACHING;
  _$jscoverage['/data-structure.js'].lineData[370]++;
  if (visit137_370_1(self.cjs)) {
    _$jscoverage['/data-structure.js'].lineData[372]++;
    self.attachSelf();
  } else {
    _$jscoverage['/data-structure.js'].lineData[374]++;
    Utils.each(self.getNormalizedRequiredModules(), function(m) {
  _$jscoverage['/data-structure.js'].functionData[37]++;
  _$jscoverage['/data-structure.js'].lineData[375]++;
  m.attach();
});
    _$jscoverage['/data-structure.js'].lineData[377]++;
    self.attachSelf();
  }
}};
  _$jscoverage['/data-structure.js'].lineData[382]++;
  function pluginAlias(name) {
    _$jscoverage['/data-structure.js'].functionData[38]++;
    _$jscoverage['/data-structure.js'].lineData[383]++;
    var index = name.indexOf('!');
    _$jscoverage['/data-structure.js'].lineData[384]++;
    if (visit138_384_1(index !== -1)) {
      _$jscoverage['/data-structure.js'].lineData[385]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/data-structure.js'].lineData[386]++;
      name = name.substring(index + 1);
      _$jscoverage['/data-structure.js'].lineData[387]++;
      var Plugin = createModule(name).attach();
      _$jscoverage['/data-structure.js'].lineData[388]++;
      if (visit139_388_1(Plugin.alias)) {
        _$jscoverage['/data-structure.js'].lineData[389]++;
        name = Plugin.alias(S, name, pluginName);
      }
    }
    _$jscoverage['/data-structure.js'].lineData[392]++;
    return name;
  }
  _$jscoverage['/data-structure.js'].lineData[395]++;
  function normalizeRequires(requires, self) {
    _$jscoverage['/data-structure.js'].functionData[39]++;
    _$jscoverage['/data-structure.js'].lineData[396]++;
    requires = visit140_396_1(requires || []);
    _$jscoverage['/data-structure.js'].lineData[397]++;
    var l = requires.length;
    _$jscoverage['/data-structure.js'].lineData[398]++;
    for (var i = 0; visit141_398_1(i < l); i++) {
      _$jscoverage['/data-structure.js'].lineData[399]++;
      requires[i] = self.resolve(requires[i]);
    }
    _$jscoverage['/data-structure.js'].lineData[401]++;
    return requires;
  }
  _$jscoverage['/data-structure.js'].lineData[404]++;
  function getShallowAlias(mod) {
    _$jscoverage['/data-structure.js'].functionData[40]++;
    _$jscoverage['/data-structure.js'].lineData[405]++;
    var name = mod.name, packageInfo, alias = mod.alias;
    _$jscoverage['/data-structure.js'].lineData[408]++;
    if (visit142_408_1(typeof alias === 'string')) {
      _$jscoverage['/data-structure.js'].lineData[409]++;
      mod.alias = alias = [alias];
    }
    _$jscoverage['/data-structure.js'].lineData[411]++;
    if (visit143_411_1(alias)) {
      _$jscoverage['/data-structure.js'].lineData[412]++;
      return alias;
    }
    _$jscoverage['/data-structure.js'].lineData[414]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/data-structure.js'].lineData[415]++;
    if (visit144_415_1(packageInfo.alias)) {
      _$jscoverage['/data-structure.js'].lineData[416]++;
      alias = packageInfo.alias(name);
    }
    _$jscoverage['/data-structure.js'].lineData[418]++;
    alias = mod.alias = visit145_418_1(alias || [pluginAlias(name)]);
    _$jscoverage['/data-structure.js'].lineData[421]++;
    return alias;
  }
  _$jscoverage['/data-structure.js'].lineData[424]++;
  Loader.Module = Module;
})(KISSY);
