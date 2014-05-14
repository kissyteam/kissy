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
  _$jscoverage['/data-structure.js'].lineData[50] = 0;
  _$jscoverage['/data-structure.js'].lineData[58] = 0;
  _$jscoverage['/data-structure.js'].lineData[66] = 0;
  _$jscoverage['/data-structure.js'].lineData[74] = 0;
  _$jscoverage['/data-structure.js'].lineData[78] = 0;
  _$jscoverage['/data-structure.js'].lineData[85] = 0;
  _$jscoverage['/data-structure.js'].lineData[86] = 0;
  _$jscoverage['/data-structure.js'].lineData[90] = 0;
  _$jscoverage['/data-structure.js'].lineData[95] = 0;
  _$jscoverage['/data-structure.js'].lineData[100] = 0;
  _$jscoverage['/data-structure.js'].lineData[105] = 0;
  _$jscoverage['/data-structure.js'].lineData[108] = 0;
  _$jscoverage['/data-structure.js'].lineData[110] = 0;
  _$jscoverage['/data-structure.js'].lineData[112] = 0;
  _$jscoverage['/data-structure.js'].lineData[114] = 0;
  _$jscoverage['/data-structure.js'].lineData[115] = 0;
  _$jscoverage['/data-structure.js'].lineData[116] = 0;
  _$jscoverage['/data-structure.js'].lineData[117] = 0;
  _$jscoverage['/data-structure.js'].lineData[120] = 0;
  _$jscoverage['/data-structure.js'].lineData[121] = 0;
  _$jscoverage['/data-structure.js'].lineData[125] = 0;
  _$jscoverage['/data-structure.js'].lineData[128] = 0;
  _$jscoverage['/data-structure.js'].lineData[134] = 0;
  _$jscoverage['/data-structure.js'].lineData[135] = 0;
  _$jscoverage['/data-structure.js'].lineData[136] = 0;
  _$jscoverage['/data-structure.js'].lineData[138] = 0;
  _$jscoverage['/data-structure.js'].lineData[139] = 0;
  _$jscoverage['/data-structure.js'].lineData[143] = 0;
  _$jscoverage['/data-structure.js'].lineData[147] = 0;
  _$jscoverage['/data-structure.js'].lineData[151] = 0;
  _$jscoverage['/data-structure.js'].lineData[155] = 0;
  _$jscoverage['/data-structure.js'].lineData[156] = 0;
  _$jscoverage['/data-structure.js'].lineData[158] = 0;
  _$jscoverage['/data-structure.js'].lineData[166] = 0;
  _$jscoverage['/data-structure.js'].lineData[168] = 0;
  _$jscoverage['/data-structure.js'].lineData[169] = 0;
  _$jscoverage['/data-structure.js'].lineData[170] = 0;
  _$jscoverage['/data-structure.js'].lineData[172] = 0;
  _$jscoverage['/data-structure.js'].lineData[174] = 0;
  _$jscoverage['/data-structure.js'].lineData[176] = 0;
  _$jscoverage['/data-structure.js'].lineData[180] = 0;
  _$jscoverage['/data-structure.js'].lineData[184] = 0;
  _$jscoverage['/data-structure.js'].lineData[186] = 0;
  _$jscoverage['/data-structure.js'].lineData[187] = 0;
  _$jscoverage['/data-structure.js'].lineData[189] = 0;
  _$jscoverage['/data-structure.js'].lineData[190] = 0;
  _$jscoverage['/data-structure.js'].lineData[191] = 0;
  _$jscoverage['/data-structure.js'].lineData[192] = 0;
  _$jscoverage['/data-structure.js'].lineData[194] = 0;
  _$jscoverage['/data-structure.js'].lineData[195] = 0;
  _$jscoverage['/data-structure.js'].lineData[196] = 0;
  _$jscoverage['/data-structure.js'].lineData[197] = 0;
  _$jscoverage['/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/data-structure.js'].lineData[200] = 0;
  _$jscoverage['/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/data-structure.js'].lineData[212] = 0;
  _$jscoverage['/data-structure.js'].lineData[213] = 0;
  _$jscoverage['/data-structure.js'].lineData[214] = 0;
  _$jscoverage['/data-structure.js'].lineData[216] = 0;
  _$jscoverage['/data-structure.js'].lineData[217] = 0;
  _$jscoverage['/data-structure.js'].lineData[219] = 0;
  _$jscoverage['/data-structure.js'].lineData[227] = 0;
  _$jscoverage['/data-structure.js'].lineData[228] = 0;
  _$jscoverage['/data-structure.js'].lineData[229] = 0;
  _$jscoverage['/data-structure.js'].lineData[231] = 0;
  _$jscoverage['/data-structure.js'].lineData[239] = 0;
  _$jscoverage['/data-structure.js'].lineData[240] = 0;
  _$jscoverage['/data-structure.js'].lineData[241] = 0;
  _$jscoverage['/data-structure.js'].lineData[245] = 0;
  _$jscoverage['/data-structure.js'].lineData[246] = 0;
  _$jscoverage['/data-structure.js'].lineData[247] = 0;
  _$jscoverage['/data-structure.js'].lineData[250] = 0;
  _$jscoverage['/data-structure.js'].lineData[252] = 0;
  _$jscoverage['/data-structure.js'].lineData[261] = 0;
  _$jscoverage['/data-structure.js'].lineData[262] = 0;
  _$jscoverage['/data-structure.js'].lineData[270] = 0;
  _$jscoverage['/data-structure.js'].lineData[271] = 0;
  _$jscoverage['/data-structure.js'].lineData[275] = 0;
  _$jscoverage['/data-structure.js'].lineData[276] = 0;
  _$jscoverage['/data-structure.js'].lineData[277] = 0;
  _$jscoverage['/data-structure.js'].lineData[279] = 0;
  _$jscoverage['/data-structure.js'].lineData[280] = 0;
  _$jscoverage['/data-structure.js'].lineData[281] = 0;
  _$jscoverage['/data-structure.js'].lineData[283] = 0;
  _$jscoverage['/data-structure.js'].lineData[287] = 0;
  _$jscoverage['/data-structure.js'].lineData[288] = 0;
  _$jscoverage['/data-structure.js'].lineData[289] = 0;
  _$jscoverage['/data-structure.js'].lineData[291] = 0;
  _$jscoverage['/data-structure.js'].lineData[292] = 0;
  _$jscoverage['/data-structure.js'].lineData[296] = 0;
  _$jscoverage['/data-structure.js'].lineData[297] = 0;
  _$jscoverage['/data-structure.js'].lineData[298] = 0;
  _$jscoverage['/data-structure.js'].lineData[300] = 0;
  _$jscoverage['/data-structure.js'].lineData[301] = 0;
  _$jscoverage['/data-structure.js'].lineData[305] = 0;
  _$jscoverage['/data-structure.js'].lineData[309] = 0;
  _$jscoverage['/data-structure.js'].lineData[310] = 0;
  _$jscoverage['/data-structure.js'].lineData[316] = 0;
  _$jscoverage['/data-structure.js'].lineData[317] = 0;
  _$jscoverage['/data-structure.js'].lineData[327] = 0;
  _$jscoverage['/data-structure.js'].lineData[331] = 0;
  _$jscoverage['/data-structure.js'].lineData[333] = 0;
  _$jscoverage['/data-structure.js'].lineData[337] = 0;
  _$jscoverage['/data-structure.js'].lineData[340] = 0;
  _$jscoverage['/data-structure.js'].lineData[344] = 0;
  _$jscoverage['/data-structure.js'].lineData[346] = 0;
  _$jscoverage['/data-structure.js'].lineData[348] = 0;
  _$jscoverage['/data-structure.js'].lineData[349] = 0;
  _$jscoverage['/data-structure.js'].lineData[350] = 0;
  _$jscoverage['/data-structure.js'].lineData[352] = 0;
  _$jscoverage['/data-structure.js'].lineData[353] = 0;
  _$jscoverage['/data-structure.js'].lineData[355] = 0;
  _$jscoverage['/data-structure.js'].lineData[357] = 0;
  _$jscoverage['/data-structure.js'].lineData[358] = 0;
  _$jscoverage['/data-structure.js'].lineData[360] = 0;
  _$jscoverage['/data-structure.js'].lineData[362] = 0;
  _$jscoverage['/data-structure.js'].lineData[366] = 0;
  _$jscoverage['/data-structure.js'].lineData[367] = 0;
  _$jscoverage['/data-structure.js'].lineData[368] = 0;
  _$jscoverage['/data-structure.js'].lineData[369] = 0;
  _$jscoverage['/data-structure.js'].lineData[370] = 0;
  _$jscoverage['/data-structure.js'].lineData[371] = 0;
  _$jscoverage['/data-structure.js'].lineData[372] = 0;
  _$jscoverage['/data-structure.js'].lineData[373] = 0;
  _$jscoverage['/data-structure.js'].lineData[376] = 0;
  _$jscoverage['/data-structure.js'].lineData[379] = 0;
  _$jscoverage['/data-structure.js'].lineData[380] = 0;
  _$jscoverage['/data-structure.js'].lineData[381] = 0;
  _$jscoverage['/data-structure.js'].lineData[382] = 0;
  _$jscoverage['/data-structure.js'].lineData[383] = 0;
  _$jscoverage['/data-structure.js'].lineData[385] = 0;
  _$jscoverage['/data-structure.js'].lineData[388] = 0;
  _$jscoverage['/data-structure.js'].lineData[389] = 0;
  _$jscoverage['/data-structure.js'].lineData[392] = 0;
  _$jscoverage['/data-structure.js'].lineData[393] = 0;
  _$jscoverage['/data-structure.js'].lineData[395] = 0;
  _$jscoverage['/data-structure.js'].lineData[396] = 0;
  _$jscoverage['/data-structure.js'].lineData[398] = 0;
  _$jscoverage['/data-structure.js'].lineData[399] = 0;
  _$jscoverage['/data-structure.js'].lineData[400] = 0;
  _$jscoverage['/data-structure.js'].lineData[402] = 0;
  _$jscoverage['/data-structure.js'].lineData[405] = 0;
  _$jscoverage['/data-structure.js'].lineData[408] = 0;
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
}
if (! _$jscoverage['/data-structure.js'].branchData) {
  _$jscoverage['/data-structure.js'].branchData = {};
  _$jscoverage['/data-structure.js'].branchData['135'] = [];
  _$jscoverage['/data-structure.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['168'] = [];
  _$jscoverage['/data-structure.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['169'] = [];
  _$jscoverage['/data-structure.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['186'] = [];
  _$jscoverage['/data-structure.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['191'] = [];
  _$jscoverage['/data-structure.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['194'] = [];
  _$jscoverage['/data-structure.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['196'] = [];
  _$jscoverage['/data-structure.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['196'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['199'] = [];
  _$jscoverage['/data-structure.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['213'] = [];
  _$jscoverage['/data-structure.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['228'] = [];
  _$jscoverage['/data-structure.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['240'] = [];
  _$jscoverage['/data-structure.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['246'] = [];
  _$jscoverage['/data-structure.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['246'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['250'] = [];
  _$jscoverage['/data-structure.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['262'] = [];
  _$jscoverage['/data-structure.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['271'] = [];
  _$jscoverage['/data-structure.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['288'] = [];
  _$jscoverage['/data-structure.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['297'] = [];
  _$jscoverage['/data-structure.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['309'] = [];
  _$jscoverage['/data-structure.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['321'] = [];
  _$jscoverage['/data-structure.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['331'] = [];
  _$jscoverage['/data-structure.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['348'] = [];
  _$jscoverage['/data-structure.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['353'] = [];
  _$jscoverage['/data-structure.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['368'] = [];
  _$jscoverage['/data-structure.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['371'] = [];
  _$jscoverage['/data-structure.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['372'] = [];
  _$jscoverage['/data-structure.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['380'] = [];
  _$jscoverage['/data-structure.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['382'] = [];
  _$jscoverage['/data-structure.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['392'] = [];
  _$jscoverage['/data-structure.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['395'] = [];
  _$jscoverage['/data-structure.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['399'] = [];
  _$jscoverage['/data-structure.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['402'] = [];
  _$jscoverage['/data-structure.js'].branchData['402'][1] = new BranchData();
}
_$jscoverage['/data-structure.js'].branchData['402'][1].init(405, 52, 'alias || [pluginAlias(name)]');
function visit146_402_1(result) {
  _$jscoverage['/data-structure.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['399'][1].init(298, 17, 'packageInfo.alias');
function visit145_399_1(result) {
  _$jscoverage['/data-structure.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['395'][1].init(197, 5, 'alias');
function visit144_395_1(result) {
  _$jscoverage['/data-structure.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['392'][1].init(102, 25, 'typeof alias === \'string\'');
function visit143_392_1(result) {
  _$jscoverage['/data-structure.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['382'][1].init(96, 5, 'i < l');
function visit142_382_1(result) {
  _$jscoverage['/data-structure.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['380'][1].init(21, 14, 'requires || []');
function visit141_380_1(result) {
  _$jscoverage['/data-structure.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['372'][1].init(196, 12, 'Plugin.alias');
function visit140_372_1(result) {
  _$jscoverage['/data-structure.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['371'][1].init(130, 47, 'createModule(pluginName).attach().exports || {}');
function visit139_371_1(result) {
  _$jscoverage['/data-structure.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['368'][1].init(54, 12, 'index !== -1');
function visit138_368_1(result) {
  _$jscoverage['/data-structure.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['353'][1].init(315, 8, 'self.cjs');
function visit137_353_1(result) {
  _$jscoverage['/data-structure.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['348'][1].init(156, 19, 'status >= ATTACHING');
function visit136_348_1(result) {
  _$jscoverage['/data-structure.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['331'][1].init(987, 21, 'exports !== undefined');
function visit135_331_1(result) {
  _$jscoverage['/data-structure.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['321'][1].init(36, 27, 'requires && requires.length');
function visit134_321_1(result) {
  _$jscoverage['/data-structure.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['309'][1].init(117, 29, 'typeof factory === \'function\'');
function visit133_309_1(result) {
  _$jscoverage['/data-structure.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['297'][1].init(48, 20, 'self.requiredModules');
function visit132_297_1(result) {
  _$jscoverage['/data-structure.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['288'][1].init(48, 30, 'self.normalizedRequiredModules');
function visit131_288_1(result) {
  _$jscoverage['/data-structure.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['271'][1].init(51, 46, 'self.charset || self.getPackage().getCharset()');
function visit130_271_1(result) {
  _$jscoverage['/data-structure.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['262'][1].init(51, 38, 'self.tag || self.getPackage().getTag()');
function visit129_262_1(result) {
  _$jscoverage['/data-structure.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['250'][1].init(408, 32, 'packages[pName] || packages.core');
function visit128_250_1(result) {
  _$jscoverage['/data-structure.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['246'][2].init(69, 23, 'p.length > pName.length');
function visit127_246_2(result) {
  _$jscoverage['/data-structure.js'].branchData['246'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['246'][1].init(26, 66, 'Utils.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit126_246_1(result) {
  _$jscoverage['/data-structure.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['240'][1].init(48, 17, '!self.packageInfo');
function visit125_240_1(result) {
  _$jscoverage['/data-structure.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['228'][1].init(48, 9, '!self.url');
function visit124_228_1(result) {
  _$jscoverage['/data-structure.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['213'][1].init(48, 22, 'self.normalizedModules');
function visit123_213_1(result) {
  _$jscoverage['/data-structure.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['199'][1].init(149, 11, 'normalAlias');
function visit122_199_1(result) {
  _$jscoverage['/data-structure.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['196'][2].init(86, 18, 'aliasItem !== name');
function visit121_196_2(result) {
  _$jscoverage['/data-structure.js'].branchData['196'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['196'][1].init(73, 31, 'aliasItem && aliasItem !== name');
function visit120_196_1(result) {
  _$jscoverage['/data-structure.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['194'][1].init(52, 5, 'i < l');
function visit119_194_1(result) {
  _$jscoverage['/data-structure.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['191'][1].init(260, 17, 'alias[0] === name');
function visit118_191_1(result) {
  _$jscoverage['/data-structure.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['186'][1].init(83, 20, 'self.normalizedAlias');
function visit117_186_1(result) {
  _$jscoverage['/data-structure.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['169'][1].init(22, 33, 'Utils.endsWith(self.name, \'.css\')');
function visit116_169_1(result) {
  _$jscoverage['/data-structure.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['168'][1].init(80, 2, '!v');
function visit115_168_1(result) {
  _$jscoverage['/data-structure.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['135'][1].init(69, 26, 'resolveCache[relativeName]');
function visit114_135_1(result) {
  _$jscoverage['/data-structure.js'].branchData['135'][1].ranCondition(result);
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
  getBase: function() {
  _$jscoverage['/data-structure.js'].functionData[5]++;
  _$jscoverage['/data-structure.js'].lineData[50]++;
  return this.base;
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[6]++;
  _$jscoverage['/data-structure.js'].lineData[58]++;
  return checkGlobalIfNotExist(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/data-structure.js'].functionData[7]++;
  _$jscoverage['/data-structure.js'].lineData[66]++;
  return checkGlobalIfNotExist(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/data-structure.js'].functionData[8]++;
  _$jscoverage['/data-structure.js'].lineData[74]++;
  return checkGlobalIfNotExist(this, 'group');
}};
  _$jscoverage['/data-structure.js'].lineData[78]++;
  Loader.Package = Package;
  _$jscoverage['/data-structure.js'].lineData[85]++;
  function Module(cfg) {
    _$jscoverage['/data-structure.js'].functionData[9]++;
    _$jscoverage['/data-structure.js'].lineData[86]++;
    var self = this;
    _$jscoverage['/data-structure.js'].lineData[90]++;
    self.exports = undefined;
    _$jscoverage['/data-structure.js'].lineData[95]++;
    self.status = Status.INIT;
    _$jscoverage['/data-structure.js'].lineData[100]++;
    self.name = undefined;
    _$jscoverage['/data-structure.js'].lineData[105]++;
    self.factory = undefined;
    _$jscoverage['/data-structure.js'].lineData[108]++;
    self.cjs = 1;
    _$jscoverage['/data-structure.js'].lineData[110]++;
    mix(self, cfg);
    _$jscoverage['/data-structure.js'].lineData[112]++;
    self.waits = {};
    _$jscoverage['/data-structure.js'].lineData[114]++;
    self.require = function(moduleName) {
  _$jscoverage['/data-structure.js'].functionData[10]++;
  _$jscoverage['/data-structure.js'].lineData[115]++;
  var requiresModule = createModule(self.resolve(moduleName));
  _$jscoverage['/data-structure.js'].lineData[116]++;
  Utils.attachModules(requiresModule.getNormalizedModules());
  _$jscoverage['/data-structure.js'].lineData[117]++;
  return requiresModule.getExports();
};
    _$jscoverage['/data-structure.js'].lineData[120]++;
    self.require.resolve = function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[11]++;
  _$jscoverage['/data-structure.js'].lineData[121]++;
  return self.resolve(relativeName);
};
    _$jscoverage['/data-structure.js'].lineData[125]++;
    self.resolveCache = {};
  }
  _$jscoverage['/data-structure.js'].lineData[128]++;
  Module.prototype = {
  kissy: 1, 
  constructor: Module, 
  resolve: function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[12]++;
  _$jscoverage['/data-structure.js'].lineData[134]++;
  var resolveCache = this.resolveCache;
  _$jscoverage['/data-structure.js'].lineData[135]++;
  if (visit114_135_1(resolveCache[relativeName])) {
    _$jscoverage['/data-structure.js'].lineData[136]++;
    return resolveCache[relativeName];
  }
  _$jscoverage['/data-structure.js'].lineData[138]++;
  resolveCache[relativeName] = Utils.normalizePath(this.name, relativeName);
  _$jscoverage['/data-structure.js'].lineData[139]++;
  return resolveCache[relativeName];
}, 
  add: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[13]++;
  _$jscoverage['/data-structure.js'].lineData[143]++;
  this.waits[loader.id] = loader;
}, 
  remove: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[14]++;
  _$jscoverage['/data-structure.js'].lineData[147]++;
  delete this.waits[loader.id];
}, 
  contains: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[15]++;
  _$jscoverage['/data-structure.js'].lineData[151]++;
  return this.waits[loader.id];
}, 
  flush: function() {
  _$jscoverage['/data-structure.js'].functionData[16]++;
  _$jscoverage['/data-structure.js'].lineData[155]++;
  Utils.each(this.waits, function(loader) {
  _$jscoverage['/data-structure.js'].functionData[17]++;
  _$jscoverage['/data-structure.js'].lineData[156]++;
  loader.flush();
});
  _$jscoverage['/data-structure.js'].lineData[158]++;
  this.waits = {};
}, 
  getType: function() {
  _$jscoverage['/data-structure.js'].functionData[18]++;
  _$jscoverage['/data-structure.js'].lineData[166]++;
  var self = this, v = self.type;
  _$jscoverage['/data-structure.js'].lineData[168]++;
  if (visit115_168_1(!v)) {
    _$jscoverage['/data-structure.js'].lineData[169]++;
    if (visit116_169_1(Utils.endsWith(self.name, '.css'))) {
      _$jscoverage['/data-structure.js'].lineData[170]++;
      v = 'css';
    } else {
      _$jscoverage['/data-structure.js'].lineData[172]++;
      v = 'js';
    }
    _$jscoverage['/data-structure.js'].lineData[174]++;
    self.type = v;
  }
  _$jscoverage['/data-structure.js'].lineData[176]++;
  return v;
}, 
  getExports: function() {
  _$jscoverage['/data-structure.js'].functionData[19]++;
  _$jscoverage['/data-structure.js'].lineData[180]++;
  return this.getNormalizedModules()[0].exports;
}, 
  getAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[20]++;
  _$jscoverage['/data-structure.js'].lineData[184]++;
  var self = this, name = self.name;
  _$jscoverage['/data-structure.js'].lineData[186]++;
  if (visit117_186_1(self.normalizedAlias)) {
    _$jscoverage['/data-structure.js'].lineData[187]++;
    return self.normalizedAlias;
  }
  _$jscoverage['/data-structure.js'].lineData[189]++;
  var alias = getShallowAlias(self);
  _$jscoverage['/data-structure.js'].lineData[190]++;
  var ret = [];
  _$jscoverage['/data-structure.js'].lineData[191]++;
  if (visit118_191_1(alias[0] === name)) {
    _$jscoverage['/data-structure.js'].lineData[192]++;
    ret = alias;
  } else {
    _$jscoverage['/data-structure.js'].lineData[194]++;
    for (var i = 0, l = alias.length; visit119_194_1(i < l); i++) {
      _$jscoverage['/data-structure.js'].lineData[195]++;
      var aliasItem = alias[i];
      _$jscoverage['/data-structure.js'].lineData[196]++;
      if (visit120_196_1(aliasItem && visit121_196_2(aliasItem !== name))) {
        _$jscoverage['/data-structure.js'].lineData[197]++;
        var mod = createModule(aliasItem);
        _$jscoverage['/data-structure.js'].lineData[198]++;
        var normalAlias = mod.getAlias();
        _$jscoverage['/data-structure.js'].lineData[199]++;
        if (visit122_199_1(normalAlias)) {
          _$jscoverage['/data-structure.js'].lineData[200]++;
          ret.push.apply(ret, normalAlias);
        } else {
          _$jscoverage['/data-structure.js'].lineData[202]++;
          ret.push(aliasItem);
        }
      }
    }
  }
  _$jscoverage['/data-structure.js'].lineData[207]++;
  self.normalizedAlias = ret;
  _$jscoverage['/data-structure.js'].lineData[208]++;
  return ret;
}, 
  getNormalizedModules: function() {
  _$jscoverage['/data-structure.js'].functionData[21]++;
  _$jscoverage['/data-structure.js'].lineData[212]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[213]++;
  if (visit123_213_1(self.normalizedModules)) {
    _$jscoverage['/data-structure.js'].lineData[214]++;
    return self.normalizedModules;
  }
  _$jscoverage['/data-structure.js'].lineData[216]++;
  self.normalizedModules = Utils.map(self.getAlias(), function(alias) {
  _$jscoverage['/data-structure.js'].functionData[22]++;
  _$jscoverage['/data-structure.js'].lineData[217]++;
  return createModule(alias);
});
  _$jscoverage['/data-structure.js'].lineData[219]++;
  return self.normalizedModules;
}, 
  getUrl: function() {
  _$jscoverage['/data-structure.js'].functionData[23]++;
  _$jscoverage['/data-structure.js'].lineData[227]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[228]++;
  if (visit124_228_1(!self.url)) {
    _$jscoverage['/data-structure.js'].lineData[229]++;
    self.url = S.Config.resolveModFn(self);
  }
  _$jscoverage['/data-structure.js'].lineData[231]++;
  return self.url;
}, 
  getPackage: function() {
  _$jscoverage['/data-structure.js'].functionData[24]++;
  _$jscoverage['/data-structure.js'].lineData[239]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[240]++;
  if (visit125_240_1(!self.packageInfo)) {
    _$jscoverage['/data-structure.js'].lineData[241]++;
    var packages = Config.packages, modNameSlash = self.name + '/', pName = '', p;
    _$jscoverage['/data-structure.js'].lineData[245]++;
    for (p in packages) {
      _$jscoverage['/data-structure.js'].lineData[246]++;
      if (visit126_246_1(Utils.startsWith(modNameSlash, p + '/') && visit127_246_2(p.length > pName.length))) {
        _$jscoverage['/data-structure.js'].lineData[247]++;
        pName = p;
      }
    }
    _$jscoverage['/data-structure.js'].lineData[250]++;
    self.packageInfo = visit128_250_1(packages[pName] || packages.core);
  }
  _$jscoverage['/data-structure.js'].lineData[252]++;
  return self.packageInfo;
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[25]++;
  _$jscoverage['/data-structure.js'].lineData[261]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[262]++;
  return visit129_262_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[26]++;
  _$jscoverage['/data-structure.js'].lineData[270]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[271]++;
  return visit130_271_1(self.charset || self.getPackage().getCharset());
}, 
  setRequiresModules: function(requires) {
  _$jscoverage['/data-structure.js'].functionData[27]++;
  _$jscoverage['/data-structure.js'].lineData[275]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[276]++;
  var requiredModules = self.requiredModules = Utils.map(normalizeRequires(requires, self), function(m) {
  _$jscoverage['/data-structure.js'].functionData[28]++;
  _$jscoverage['/data-structure.js'].lineData[277]++;
  return createModule(m);
});
  _$jscoverage['/data-structure.js'].lineData[279]++;
  var normalizedRequiredModules = [];
  _$jscoverage['/data-structure.js'].lineData[280]++;
  Utils.each(requiredModules, function(mod) {
  _$jscoverage['/data-structure.js'].functionData[29]++;
  _$jscoverage['/data-structure.js'].lineData[281]++;
  normalizedRequiredModules.push.apply(normalizedRequiredModules, mod.getNormalizedModules());
});
  _$jscoverage['/data-structure.js'].lineData[283]++;
  self.normalizedRequiredModules = normalizedRequiredModules;
}, 
  getNormalizedRequiredModules: function() {
  _$jscoverage['/data-structure.js'].functionData[30]++;
  _$jscoverage['/data-structure.js'].lineData[287]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[288]++;
  if (visit131_288_1(self.normalizedRequiredModules)) {
    _$jscoverage['/data-structure.js'].lineData[289]++;
    return self.normalizedRequiredModules;
  }
  _$jscoverage['/data-structure.js'].lineData[291]++;
  self.setRequiresModules(self.requires);
  _$jscoverage['/data-structure.js'].lineData[292]++;
  return self.normalizedRequiredModules;
}, 
  getRequiredModules: function() {
  _$jscoverage['/data-structure.js'].functionData[31]++;
  _$jscoverage['/data-structure.js'].lineData[296]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[297]++;
  if (visit132_297_1(self.requiredModules)) {
    _$jscoverage['/data-structure.js'].lineData[298]++;
    return self.requiredModules;
  }
  _$jscoverage['/data-structure.js'].lineData[300]++;
  self.setRequiresModules(self.requires);
  _$jscoverage['/data-structure.js'].lineData[301]++;
  return self.requiredModules;
}, 
  attachSelf: function() {
  _$jscoverage['/data-structure.js'].functionData[32]++;
  _$jscoverage['/data-structure.js'].lineData[305]++;
  var self = this, factory = self.factory, exports;
  _$jscoverage['/data-structure.js'].lineData[309]++;
  if (visit133_309_1(typeof factory === 'function')) {
    _$jscoverage['/data-structure.js'].lineData[310]++;
    self.exports = {};
    _$jscoverage['/data-structure.js'].lineData[316]++;
    var requires = self.requires;
    _$jscoverage['/data-structure.js'].lineData[317]++;
    exports = factory.apply(self, (self.cjs ? [S, visit134_321_1(requires && requires.length) ? self.require : undefined, self.exports, self] : [S].concat(Utils.map(self.getRequiredModules(), function(m) {
  _$jscoverage['/data-structure.js'].functionData[33]++;
  _$jscoverage['/data-structure.js'].lineData[327]++;
  return m.getExports();
}))));
    _$jscoverage['/data-structure.js'].lineData[331]++;
    if (visit135_331_1(exports !== undefined)) {
      _$jscoverage['/data-structure.js'].lineData[333]++;
      self.exports = exports;
    }
  } else {
    _$jscoverage['/data-structure.js'].lineData[337]++;
    self.exports = factory;
  }
  _$jscoverage['/data-structure.js'].lineData[340]++;
  self.status = ATTACHED;
}, 
  attach: function() {
  _$jscoverage['/data-structure.js'].functionData[34]++;
  _$jscoverage['/data-structure.js'].lineData[344]++;
  var self = this, status;
  _$jscoverage['/data-structure.js'].lineData[346]++;
  status = self.status;
  _$jscoverage['/data-structure.js'].lineData[348]++;
  if (visit136_348_1(status >= ATTACHING)) {
    _$jscoverage['/data-structure.js'].lineData[349]++;
    self.status = ATTACHED;
    _$jscoverage['/data-structure.js'].lineData[350]++;
    return;
  }
  _$jscoverage['/data-structure.js'].lineData[352]++;
  self.status = ATTACHING;
  _$jscoverage['/data-structure.js'].lineData[353]++;
  if (visit137_353_1(self.cjs)) {
    _$jscoverage['/data-structure.js'].lineData[355]++;
    self.attachSelf();
  } else {
    _$jscoverage['/data-structure.js'].lineData[357]++;
    Utils.each(self.getNormalizedRequiredModules(), function(m) {
  _$jscoverage['/data-structure.js'].functionData[35]++;
  _$jscoverage['/data-structure.js'].lineData[358]++;
  m.attach();
});
    _$jscoverage['/data-structure.js'].lineData[360]++;
    self.attachSelf();
  }
  _$jscoverage['/data-structure.js'].lineData[362]++;
  return self;
}};
  _$jscoverage['/data-structure.js'].lineData[366]++;
  function pluginAlias(name) {
    _$jscoverage['/data-structure.js'].functionData[36]++;
    _$jscoverage['/data-structure.js'].lineData[367]++;
    var index = name.indexOf('!');
    _$jscoverage['/data-structure.js'].lineData[368]++;
    if (visit138_368_1(index !== -1)) {
      _$jscoverage['/data-structure.js'].lineData[369]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/data-structure.js'].lineData[370]++;
      name = name.substring(index + 1);
      _$jscoverage['/data-structure.js'].lineData[371]++;
      var Plugin = visit139_371_1(createModule(pluginName).attach().exports || {});
      _$jscoverage['/data-structure.js'].lineData[372]++;
      if (visit140_372_1(Plugin.alias)) {
        _$jscoverage['/data-structure.js'].lineData[373]++;
        name = Plugin.alias(S, name, pluginName);
      }
    }
    _$jscoverage['/data-structure.js'].lineData[376]++;
    return name;
  }
  _$jscoverage['/data-structure.js'].lineData[379]++;
  function normalizeRequires(requires, self) {
    _$jscoverage['/data-structure.js'].functionData[37]++;
    _$jscoverage['/data-structure.js'].lineData[380]++;
    requires = visit141_380_1(requires || []);
    _$jscoverage['/data-structure.js'].lineData[381]++;
    var l = requires.length;
    _$jscoverage['/data-structure.js'].lineData[382]++;
    for (var i = 0; visit142_382_1(i < l); i++) {
      _$jscoverage['/data-structure.js'].lineData[383]++;
      requires[i] = self.resolve(requires[i]);
    }
    _$jscoverage['/data-structure.js'].lineData[385]++;
    return requires;
  }
  _$jscoverage['/data-structure.js'].lineData[388]++;
  function getShallowAlias(mod) {
    _$jscoverage['/data-structure.js'].functionData[38]++;
    _$jscoverage['/data-structure.js'].lineData[389]++;
    var name = mod.name, packageInfo, alias = mod.alias;
    _$jscoverage['/data-structure.js'].lineData[392]++;
    if (visit143_392_1(typeof alias === 'string')) {
      _$jscoverage['/data-structure.js'].lineData[393]++;
      mod.alias = alias = [alias];
    }
    _$jscoverage['/data-structure.js'].lineData[395]++;
    if (visit144_395_1(alias)) {
      _$jscoverage['/data-structure.js'].lineData[396]++;
      return alias;
    }
    _$jscoverage['/data-structure.js'].lineData[398]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/data-structure.js'].lineData[399]++;
    if (visit145_399_1(packageInfo.alias)) {
      _$jscoverage['/data-structure.js'].lineData[400]++;
      alias = packageInfo.alias(name);
    }
    _$jscoverage['/data-structure.js'].lineData[402]++;
    alias = mod.alias = visit146_402_1(alias || [pluginAlias(name)]);
    _$jscoverage['/data-structure.js'].lineData[405]++;
    return alias;
  }
  _$jscoverage['/data-structure.js'].lineData[408]++;
  Loader.Module = Module;
})(KISSY);
