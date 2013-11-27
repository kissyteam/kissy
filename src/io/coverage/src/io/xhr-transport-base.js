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
if (! _$jscoverage['/io/xhr-transport-base.js']) {
  _$jscoverage['/io/xhr-transport-base.js'] = {};
  _$jscoverage['/io/xhr-transport-base.js'].lineData = [];
  _$jscoverage['/io/xhr-transport-base.js'].lineData[6] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[7] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[8] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[9] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[22] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[23] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[25] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[26] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[27] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[30] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[33] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[34] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[35] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[38] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[41] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[43] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[44] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[47] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[51] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[53] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[56] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[57] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[60] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[61] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[63] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[64] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[65] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[66] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[69] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[71] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[73] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[76] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[78] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[94] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[101] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[102] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[104] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[105] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[109] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[110] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[112] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[115] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[117] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[118] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[119] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[123] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[124] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[125] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[127] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[131] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[132] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[135] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[138] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[139] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[143] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[144] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[145] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[149] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[152] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[153] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[155] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[156] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[158] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[159] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[160] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[161] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[162] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[163] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[166] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[171] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[173] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[174] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[177] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[178] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[179] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[180] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[181] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[183] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[184] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[185] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[186] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[189] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[190] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[197] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[204] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[213] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[215] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[217] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[218] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[219] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[222] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[225] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[227] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[228] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[231] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[233] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[236] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[237] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[240] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[241] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[242] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[245] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[246] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[248] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[249] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[253] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[256] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[257] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[260] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[263] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[264] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[265] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[266] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[267] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[268] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[270] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[273] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[278] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[279] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[281] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[282] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[284] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[291] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[292] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[294] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[295] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[297] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[301] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[303] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[304] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[306] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[307] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[308] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[314] = 0;
}
if (! _$jscoverage['/io/xhr-transport-base.js'].functionData) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData = [];
  _$jscoverage['/io/xhr-transport-base.js'].functionData[0] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[1] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[2] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[3] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[4] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[5] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[6] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[7] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[8] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[9] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[10] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[11] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[12] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[13] = 0;
  _$jscoverage['/io/xhr-transport-base.js'].functionData[14] = 0;
}
if (! _$jscoverage['/io/xhr-transport-base.js'].branchData) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData = {};
  _$jscoverage['/io/xhr-transport-base.js'].branchData['13'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['13'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['27'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['35'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['43'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['47'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['57'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['63'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['65'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['87'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['94'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['101'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['104'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['109'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['115'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['117'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['118'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['131'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['138'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['143'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['149'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['152'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['155'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['161'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['173'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['173'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['177'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['215'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['215'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['217'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['225'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['227'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['236'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['240'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['245'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['248'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['256'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['263'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['265'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['267'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['291'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['291'][2] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['294'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['301'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/io/xhr-transport-base.js'].branchData['307'] = [];
  _$jscoverage['/io/xhr-transport-base.js'].branchData['307'][1] = new BranchData();
}
_$jscoverage['/io/xhr-transport-base.js'].branchData['307'][1].init(254, 6, '!abort');
function visit192_307_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['301'][1].init(23, 12, 'e.stack || e');
function visit191_301_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['294'][1].init(3225, 27, 'status === NO_CONTENT_CODE2');
function visit190_294_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['291'][2].init(2988, 28, 'IO.isLocal && !c.crossDomain');
function visit189_291_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['291'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['291'][1].init(2977, 39, '!status && IO.isLocal && !c.crossDomain');
function visit188_291_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['267'][1].init(114, 19, 'lastBodyIndex == -1');
function visit187_267_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['265'][1].init(92, 41, '(bodyIndex = text.indexOf(\'<body>\')) != -1');
function visit186_265_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['263'][1].init(1452, 15, 'c.files && text');
function visit185_263_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['256'][1].init(1169, 26, 'xml && xml.documentElement');
function visit184_256_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['248'][1].init(513, 4, 'eTag');
function visit183_248_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['245'][1].init(353, 12, 'lastModified');
function visit182_245_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['240'][1].init(385, 13, 'ifModifiedKey');
function visit181_240_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['236'][1].init(198, 38, '!isInstanceOfXDomainRequest(nativeXhr)');
function visit180_236_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['227'][1].init(72, 26, 'nativeXhr.readyState !== 4');
function visit179_227_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['225'][1].init(424, 5, 'abort');
function visit178_225_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['217'][1].init(77, 37, 'isInstanceOfXDomainRequest(nativeXhr)');
function visit177_217_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['215'][2].init(66, 25, 'nativeXhr.readyState == 4');
function visit176_215_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['215'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['215'][1].init(57, 34, 'abort || nativeXhr.readyState == 4');
function visit175_215_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['177'][1].init(64, 37, 'isInstanceOfXDomainRequest(nativeXhr)');
function visit174_177_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['173'][2].init(3450, 25, 'nativeXhr.readyState == 4');
function visit173_173_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['173'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['173'][1].init(3440, 35, '!async || nativeXhr.readyState == 4');
function visit172_173_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['161'][1].init(25, 13, 'S.isArray(vs)');
function visit171_161_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['155'][1].init(107, 19, 'originalSentContent');
function visit170_155_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['152'][1].init(2687, 5, 'files');
function visit169_152_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['149'][2].init(2593, 22, 'c.hasContent && c.data');
function visit168_149_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['149'][1].init(2593, 30, 'c.hasContent && c.data || null');
function visit167_149_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['143'][1].init(2361, 49, 'typeof nativeXhr.setRequestHeader !== \'undefined\'');
function visit166_143_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['138'][1].init(2173, 24, 'xRequestHeader === false');
function visit165_138_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['131'][1].init(1961, 38, 'mimeType && nativeXhr.overrideMimeType');
function visit164_131_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['118'][1].init(21, 12, '!supportCORS');
function visit163_118_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['117'][1].init(1532, 30, '\'withCredentials\' in xhrFields');
function visit162_117_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['115'][1].init(1493, 20, 'c[\'xhrFields\'] || {}');
function visit161_115_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['109'][1].init(1284, 24, 'username = c[\'username\']');
function visit160_109_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['104'][1].init(551, 38, 'cacheValue = eTagCached[ifModifiedKey]');
function visit159_104_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['101'][1].init(393, 46, 'cacheValue = lastModifiedCached[ifModifiedKey]');
function visit158_101_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['94'][1].init(560, 13, 'ifModifiedKey');
function visit157_94_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['87'][1].init(334, 23, 'io.requestHeaders || {}');
function visit156_87_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['65'][1].init(52, 17, 'c.cache === false');
function visit155_65_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['63'][1].init(79, 10, 'ifModified');
function visit154_63_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['57'][1].init(16, 51, '_XDomainRequest && (xhr instanceof _XDomainRequest)');
function visit153_57_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['47'][2].init(194, 53, '!IO.isLocal && createStandardXHR(crossDomain, refWin)');
function visit152_47_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['47'][1].init(194, 105, '!IO.isLocal && createStandardXHR(crossDomain, refWin) || createActiveXHR(crossDomain, refWin)');
function visit151_47_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['43'][2].init(54, 30, 'crossDomain && _XDomainRequest');
function visit150_43_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['43'][1].init(38, 46, '!supportCORS && crossDomain && _XDomainRequest');
function visit149_43_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['35'][1].init(25, 13, 'refWin || win');
function visit148_35_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['27'][1].init(25, 13, 'refWin || win');
function visit147_27_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['13'][2].init(141, 15, 'S.UA.ieMode > 7');
function visit146_13_2(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['13'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].branchData['13'][1].init(141, 40, 'S.UA.ieMode > 7 && win[\'XDomainRequest\']');
function visit145_13_1(result) {
  _$jscoverage['/io/xhr-transport-base.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/xhr-transport-base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[0]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[7]++;
  var IO = require('./base');
  _$jscoverage['/io/xhr-transport-base.js'].lineData[8]++;
  var logger = S.getLogger('s/io');
  _$jscoverage['/io/xhr-transport-base.js'].lineData[9]++;
  var OK_CODE = 200, win = S.Env.host, _XDomainRequest = visit145_13_1(visit146_13_2(S.UA.ieMode > 7) && win['XDomainRequest']), NO_CONTENT_CODE = 204, NOT_FOUND_CODE = 404, NO_CONTENT_CODE2 = 1223, XhrTransportBase = {
  proto: {}}, lastModifiedCached = {}, eTagCached = {};
  _$jscoverage['/io/xhr-transport-base.js'].lineData[22]++;
  IO.__lastModifiedCached = lastModifiedCached;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[23]++;
  IO.__eTagCached = eTagCached;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[25]++;
  function createStandardXHR(_, refWin) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[1]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[26]++;
    try {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[27]++;
      return new (visit147_27_1(refWin || win))['XMLHttpRequest']();
    }    catch (e) {
}
    _$jscoverage['/io/xhr-transport-base.js'].lineData[30]++;
    return undefined;
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[33]++;
  function createActiveXHR(_, refWin) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[2]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[34]++;
    try {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[35]++;
      return new (visit148_35_1(refWin || win))['ActiveXObject']('Microsoft.XMLHTTP');
    }    catch (e) {
}
    _$jscoverage['/io/xhr-transport-base.js'].lineData[38]++;
    return undefined;
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[41]++;
  XhrTransportBase.nativeXhr = win['ActiveXObject'] ? function(crossDomain, refWin) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[3]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[43]++;
  if (visit149_43_1(!supportCORS && visit150_43_2(crossDomain && _XDomainRequest))) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[44]++;
    return new _XDomainRequest();
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[47]++;
  return visit151_47_1(visit152_47_2(!IO.isLocal && createStandardXHR(crossDomain, refWin)) || createActiveXHR(crossDomain, refWin));
} : createStandardXHR;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[51]++;
  XhrTransportBase._XDomainRequest = _XDomainRequest;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[53]++;
  var supportCORS = XhrTransportBase.supportCORS = ('withCredentials' in XhrTransportBase.nativeXhr());
  _$jscoverage['/io/xhr-transport-base.js'].lineData[56]++;
  function isInstanceOfXDomainRequest(xhr) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[4]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[57]++;
    return visit153_57_1(_XDomainRequest && (xhr instanceof _XDomainRequest));
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[60]++;
  function getIfModifiedKey(c) {
    _$jscoverage['/io/xhr-transport-base.js'].functionData[5]++;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[61]++;
    var ifModified = c.ifModified, ifModifiedKey;
    _$jscoverage['/io/xhr-transport-base.js'].lineData[63]++;
    if (visit154_63_1(ifModified)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[64]++;
      ifModifiedKey = c.uri;
      _$jscoverage['/io/xhr-transport-base.js'].lineData[65]++;
      if (visit155_65_1(c.cache === false)) {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[66]++;
        ifModifiedKey = ifModifiedKey.clone();
        _$jscoverage['/io/xhr-transport-base.js'].lineData[69]++;
        ifModifiedKey.query.remove('_ksTS');
      }
      _$jscoverage['/io/xhr-transport-base.js'].lineData[71]++;
      ifModifiedKey = ifModifiedKey.toString();
    }
    _$jscoverage['/io/xhr-transport-base.js'].lineData[73]++;
    return ifModifiedKey;
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[76]++;
  S.mix(XhrTransportBase.proto, {
  sendInternal: function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[6]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[78]++;
  var self = this, io = self.io, c = io.config, nativeXhr = self.nativeXhr, files = c.files, type = files ? 'post' : c.type, async = c.async, username, mimeType = io.mimeType, requestHeaders = visit156_87_1(io.requestHeaders || {}), url = io._getUrlForSend(), xhrFields, ifModifiedKey = getIfModifiedKey(c), cacheValue, i;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[94]++;
  if (visit157_94_1(ifModifiedKey)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[101]++;
    if (visit158_101_1(cacheValue = lastModifiedCached[ifModifiedKey])) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[102]++;
      requestHeaders['If-Modified-Since'] = cacheValue;
    }
    _$jscoverage['/io/xhr-transport-base.js'].lineData[104]++;
    if (visit159_104_1(cacheValue = eTagCached[ifModifiedKey])) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[105]++;
      requestHeaders['If-None-Match'] = cacheValue;
    }
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[109]++;
  if (visit160_109_1(username = c['username'])) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[110]++;
    nativeXhr.open(type, url, async, username, c.password);
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[112]++;
    nativeXhr.open(type, url, async);
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[115]++;
  xhrFields = visit161_115_1(c['xhrFields'] || {});
  _$jscoverage['/io/xhr-transport-base.js'].lineData[117]++;
  if (visit162_117_1('withCredentials' in xhrFields)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[118]++;
    if (visit163_118_1(!supportCORS)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[119]++;
      delete xhrFields.withCredentials;
    }
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[123]++;
  for (i in xhrFields) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[124]++;
    try {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[125]++;
      nativeXhr[i] = xhrFields[i];
    }    catch (e) {
  _$jscoverage['/io/xhr-transport-base.js'].lineData[127]++;
  logger.error(e);
}
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[131]++;
  if (visit164_131_1(mimeType && nativeXhr.overrideMimeType)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[132]++;
    nativeXhr.overrideMimeType(mimeType);
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[135]++;
  var xRequestHeader = requestHeaders['X-Requested-With'];
  _$jscoverage['/io/xhr-transport-base.js'].lineData[138]++;
  if (visit165_138_1(xRequestHeader === false)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[139]++;
    delete requestHeaders['X-Requested-With'];
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[143]++;
  if (visit166_143_1(typeof nativeXhr.setRequestHeader !== 'undefined')) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[144]++;
    for (i in requestHeaders) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[145]++;
      nativeXhr.setRequestHeader(i, requestHeaders[i]);
    }
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[149]++;
  var sendContent = visit167_149_1(visit168_149_2(c.hasContent && c.data) || null);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[152]++;
  if (visit169_152_1(files)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[153]++;
    var originalSentContent = sendContent, data = {};
    _$jscoverage['/io/xhr-transport-base.js'].lineData[155]++;
    if (visit170_155_1(originalSentContent)) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[156]++;
      data = S.unparam(originalSentContent);
    }
    _$jscoverage['/io/xhr-transport-base.js'].lineData[158]++;
    data = S.mix(data, files);
    _$jscoverage['/io/xhr-transport-base.js'].lineData[159]++;
    sendContent = new FormData();
    _$jscoverage['/io/xhr-transport-base.js'].lineData[160]++;
    S.each(data, function(vs, k) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[7]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[161]++;
  if (visit171_161_1(S.isArray(vs))) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[162]++;
    S.each(vs, function(v) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[8]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[163]++;
  sendContent.append(k + (c.serializeArray ? '[]' : ''), v);
});
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[166]++;
    sendContent.append(k, vs);
  }
});
  }
  _$jscoverage['/io/xhr-transport-base.js'].lineData[171]++;
  nativeXhr.send(sendContent);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[173]++;
  if (visit172_173_1(!async || visit173_173_2(nativeXhr.readyState == 4))) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[174]++;
    self._callback();
  } else {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[177]++;
    if (visit174_177_1(isInstanceOfXDomainRequest(nativeXhr))) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[178]++;
      nativeXhr.onload = function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[9]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[179]++;
  nativeXhr.readyState = 4;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[180]++;
  nativeXhr.status = 200;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[181]++;
  self._callback();
};
      _$jscoverage['/io/xhr-transport-base.js'].lineData[183]++;
      nativeXhr.onerror = function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[10]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[184]++;
  nativeXhr.readyState = 4;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[185]++;
  nativeXhr.status = 500;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[186]++;
  self._callback();
};
    } else {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[189]++;
      nativeXhr.onreadystatechange = function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[11]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[190]++;
  self._callback();
};
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[12]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[197]++;
  this._callback(0, 1);
}, 
  _callback: function(event, abort) {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[13]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[204]++;
  var self = this, nativeXhr = self.nativeXhr, io = self.io, ifModifiedKey, lastModified, eTag, statusText, xml, c = io.config;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[213]++;
  try {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[215]++;
    if (visit175_215_1(abort || visit176_215_2(nativeXhr.readyState == 4))) {
      _$jscoverage['/io/xhr-transport-base.js'].lineData[217]++;
      if (visit177_217_1(isInstanceOfXDomainRequest(nativeXhr))) {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[218]++;
        nativeXhr.onerror = S.noop;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[219]++;
        nativeXhr.onload = S.noop;
      } else {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[222]++;
        nativeXhr.onreadystatechange = S.noop;
      }
      _$jscoverage['/io/xhr-transport-base.js'].lineData[225]++;
      if (visit178_225_1(abort)) {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[227]++;
        if (visit179_227_1(nativeXhr.readyState !== 4)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[228]++;
          nativeXhr.abort();
        }
      } else {
        _$jscoverage['/io/xhr-transport-base.js'].lineData[231]++;
        ifModifiedKey = getIfModifiedKey(c);
        _$jscoverage['/io/xhr-transport-base.js'].lineData[233]++;
        var status = nativeXhr.status;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[236]++;
        if (visit180_236_1(!isInstanceOfXDomainRequest(nativeXhr))) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[237]++;
          io.responseHeadersString = nativeXhr.getAllResponseHeaders();
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[240]++;
        if (visit181_240_1(ifModifiedKey)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[241]++;
          lastModified = nativeXhr.getResponseHeader('Last-Modified');
          _$jscoverage['/io/xhr-transport-base.js'].lineData[242]++;
          eTag = nativeXhr.getResponseHeader('ETag');
          _$jscoverage['/io/xhr-transport-base.js'].lineData[245]++;
          if (visit182_245_1(lastModified)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[246]++;
            lastModifiedCached[ifModifiedKey] = lastModified;
          }
          _$jscoverage['/io/xhr-transport-base.js'].lineData[248]++;
          if (visit183_248_1(eTag)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[249]++;
            eTagCached[eTag] = eTag;
          }
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[253]++;
        xml = nativeXhr.responseXML;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[256]++;
        if (visit184_256_1(xml && xml.documentElement)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[257]++;
          io.responseXML = xml;
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[260]++;
        var text = io.responseText = nativeXhr.responseText;
        _$jscoverage['/io/xhr-transport-base.js'].lineData[263]++;
        if (visit185_263_1(c.files && text)) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[264]++;
          var bodyIndex, lastBodyIndex;
          _$jscoverage['/io/xhr-transport-base.js'].lineData[265]++;
          if (visit186_265_1((bodyIndex = text.indexOf('<body>')) != -1)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[266]++;
            lastBodyIndex = text.lastIndexOf('</body>');
            _$jscoverage['/io/xhr-transport-base.js'].lineData[267]++;
            if (visit187_267_1(lastBodyIndex == -1)) {
              _$jscoverage['/io/xhr-transport-base.js'].lineData[268]++;
              lastBodyIndex = text.length;
            }
            _$jscoverage['/io/xhr-transport-base.js'].lineData[270]++;
            text = text.slice(bodyIndex + 6, lastBodyIndex);
          }
          _$jscoverage['/io/xhr-transport-base.js'].lineData[273]++;
          io.responseText = S.unEscapeHtml(text);
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[278]++;
        try {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[279]++;
          statusText = nativeXhr.statusText;
        }        catch (e) {
  _$jscoverage['/io/xhr-transport-base.js'].lineData[281]++;
  logger.error('xhr statusText error: ');
  _$jscoverage['/io/xhr-transport-base.js'].lineData[282]++;
  logger.error(e);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[284]++;
  statusText = '';
}
        _$jscoverage['/io/xhr-transport-base.js'].lineData[291]++;
        if (visit188_291_1(!status && visit189_291_2(IO.isLocal && !c.crossDomain))) {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[292]++;
          status = io.responseText ? OK_CODE : NOT_FOUND_CODE;
        } else {
          _$jscoverage['/io/xhr-transport-base.js'].lineData[294]++;
          if (visit190_294_1(status === NO_CONTENT_CODE2)) {
            _$jscoverage['/io/xhr-transport-base.js'].lineData[295]++;
            status = NO_CONTENT_CODE;
          }
        }
        _$jscoverage['/io/xhr-transport-base.js'].lineData[297]++;
        io._ioReady(status, statusText);
      }
    }
  }  catch (e) {
  _$jscoverage['/io/xhr-transport-base.js'].lineData[301]++;
  S.log(visit191_301_1(e.stack || e), 'error');
  _$jscoverage['/io/xhr-transport-base.js'].lineData[303]++;
  setTimeout(function() {
  _$jscoverage['/io/xhr-transport-base.js'].functionData[14]++;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[304]++;
  throw e;
}, 0);
  _$jscoverage['/io/xhr-transport-base.js'].lineData[306]++;
  nativeXhr.onreadystatechange = S.noop;
  _$jscoverage['/io/xhr-transport-base.js'].lineData[307]++;
  if (visit192_307_1(!abort)) {
    _$jscoverage['/io/xhr-transport-base.js'].lineData[308]++;
    io._ioReady(-1, e);
  }
}
}});
  _$jscoverage['/io/xhr-transport-base.js'].lineData[314]++;
  return XhrTransportBase;
});
