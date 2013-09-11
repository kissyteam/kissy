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
if (! _$jscoverage['/cmd.js']) {
  _$jscoverage['/cmd.js'] = {};
  _$jscoverage['/cmd.js'].lineData = [];
  _$jscoverage['/cmd.js'].lineData[6] = 0;
  _$jscoverage['/cmd.js'].lineData[8] = 0;
  _$jscoverage['/cmd.js'].lineData[19] = 0;
  _$jscoverage['/cmd.js'].lineData[20] = 0;
  _$jscoverage['/cmd.js'].lineData[23] = 0;
  _$jscoverage['/cmd.js'].lineData[33] = 0;
  _$jscoverage['/cmd.js'].lineData[37] = 0;
  _$jscoverage['/cmd.js'].lineData[38] = 0;
  _$jscoverage['/cmd.js'].lineData[39] = 0;
  _$jscoverage['/cmd.js'].lineData[40] = 0;
  _$jscoverage['/cmd.js'].lineData[42] = 0;
  _$jscoverage['/cmd.js'].lineData[43] = 0;
  _$jscoverage['/cmd.js'].lineData[44] = 0;
  _$jscoverage['/cmd.js'].lineData[47] = 0;
  _$jscoverage['/cmd.js'].lineData[48] = 0;
  _$jscoverage['/cmd.js'].lineData[49] = 0;
  _$jscoverage['/cmd.js'].lineData[50] = 0;
  _$jscoverage['/cmd.js'].lineData[51] = 0;
  _$jscoverage['/cmd.js'].lineData[53] = 0;
  _$jscoverage['/cmd.js'].lineData[54] = 0;
  _$jscoverage['/cmd.js'].lineData[55] = 0;
  _$jscoverage['/cmd.js'].lineData[57] = 0;
  _$jscoverage['/cmd.js'].lineData[58] = 0;
  _$jscoverage['/cmd.js'].lineData[60] = 0;
  _$jscoverage['/cmd.js'].lineData[61] = 0;
  _$jscoverage['/cmd.js'].lineData[65] = 0;
  _$jscoverage['/cmd.js'].lineData[72] = 0;
  _$jscoverage['/cmd.js'].lineData[74] = 0;
  _$jscoverage['/cmd.js'].lineData[75] = 0;
  _$jscoverage['/cmd.js'].lineData[77] = 0;
  _$jscoverage['/cmd.js'].lineData[78] = 0;
  _$jscoverage['/cmd.js'].lineData[82] = 0;
  _$jscoverage['/cmd.js'].lineData[84] = 0;
  _$jscoverage['/cmd.js'].lineData[85] = 0;
  _$jscoverage['/cmd.js'].lineData[91] = 0;
  _$jscoverage['/cmd.js'].lineData[92] = 0;
  _$jscoverage['/cmd.js'].lineData[94] = 0;
  _$jscoverage['/cmd.js'].lineData[95] = 0;
  _$jscoverage['/cmd.js'].lineData[96] = 0;
  _$jscoverage['/cmd.js'].lineData[97] = 0;
  _$jscoverage['/cmd.js'].lineData[99] = 0;
  _$jscoverage['/cmd.js'].lineData[103] = 0;
  _$jscoverage['/cmd.js'].lineData[104] = 0;
  _$jscoverage['/cmd.js'].lineData[107] = 0;
  _$jscoverage['/cmd.js'].lineData[110] = 0;
  _$jscoverage['/cmd.js'].lineData[112] = 0;
  _$jscoverage['/cmd.js'].lineData[113] = 0;
  _$jscoverage['/cmd.js'].lineData[114] = 0;
  _$jscoverage['/cmd.js'].lineData[118] = 0;
  _$jscoverage['/cmd.js'].lineData[119] = 0;
  _$jscoverage['/cmd.js'].lineData[121] = 0;
  _$jscoverage['/cmd.js'].lineData[122] = 0;
  _$jscoverage['/cmd.js'].lineData[123] = 0;
  _$jscoverage['/cmd.js'].lineData[125] = 0;
  _$jscoverage['/cmd.js'].lineData[128] = 0;
  _$jscoverage['/cmd.js'].lineData[129] = 0;
  _$jscoverage['/cmd.js'].lineData[131] = 0;
  _$jscoverage['/cmd.js'].lineData[132] = 0;
  _$jscoverage['/cmd.js'].lineData[134] = 0;
  _$jscoverage['/cmd.js'].lineData[141] = 0;
  _$jscoverage['/cmd.js'].lineData[145] = 0;
  _$jscoverage['/cmd.js'].lineData[146] = 0;
  _$jscoverage['/cmd.js'].lineData[147] = 0;
  _$jscoverage['/cmd.js'].lineData[148] = 0;
  _$jscoverage['/cmd.js'].lineData[149] = 0;
  _$jscoverage['/cmd.js'].lineData[150] = 0;
  _$jscoverage['/cmd.js'].lineData[151] = 0;
  _$jscoverage['/cmd.js'].lineData[154] = 0;
  _$jscoverage['/cmd.js'].lineData[156] = 0;
  _$jscoverage['/cmd.js'].lineData[157] = 0;
  _$jscoverage['/cmd.js'].lineData[158] = 0;
  _$jscoverage['/cmd.js'].lineData[159] = 0;
  _$jscoverage['/cmd.js'].lineData[165] = 0;
  _$jscoverage['/cmd.js'].lineData[168] = 0;
  _$jscoverage['/cmd.js'].lineData[169] = 0;
  _$jscoverage['/cmd.js'].lineData[171] = 0;
  _$jscoverage['/cmd.js'].lineData[172] = 0;
  _$jscoverage['/cmd.js'].lineData[174] = 0;
  _$jscoverage['/cmd.js'].lineData[175] = 0;
  _$jscoverage['/cmd.js'].lineData[177] = 0;
  _$jscoverage['/cmd.js'].lineData[181] = 0;
  _$jscoverage['/cmd.js'].lineData[184] = 0;
  _$jscoverage['/cmd.js'].lineData[186] = 0;
  _$jscoverage['/cmd.js'].lineData[187] = 0;
  _$jscoverage['/cmd.js'].lineData[194] = 0;
  _$jscoverage['/cmd.js'].lineData[198] = 0;
  _$jscoverage['/cmd.js'].lineData[199] = 0;
  _$jscoverage['/cmd.js'].lineData[200] = 0;
  _$jscoverage['/cmd.js'].lineData[201] = 0;
  _$jscoverage['/cmd.js'].lineData[205] = 0;
  _$jscoverage['/cmd.js'].lineData[209] = 0;
  _$jscoverage['/cmd.js'].lineData[210] = 0;
  _$jscoverage['/cmd.js'].lineData[213] = 0;
  _$jscoverage['/cmd.js'].lineData[216] = 0;
  _$jscoverage['/cmd.js'].lineData[218] = 0;
  _$jscoverage['/cmd.js'].lineData[222] = 0;
  _$jscoverage['/cmd.js'].lineData[224] = 0;
  _$jscoverage['/cmd.js'].lineData[225] = 0;
  _$jscoverage['/cmd.js'].lineData[227] = 0;
  _$jscoverage['/cmd.js'].lineData[231] = 0;
  _$jscoverage['/cmd.js'].lineData[232] = 0;
  _$jscoverage['/cmd.js'].lineData[234] = 0;
  _$jscoverage['/cmd.js'].lineData[235] = 0;
  _$jscoverage['/cmd.js'].lineData[237] = 0;
  _$jscoverage['/cmd.js'].lineData[240] = 0;
  _$jscoverage['/cmd.js'].lineData[242] = 0;
  _$jscoverage['/cmd.js'].lineData[245] = 0;
  _$jscoverage['/cmd.js'].lineData[246] = 0;
  _$jscoverage['/cmd.js'].lineData[248] = 0;
  _$jscoverage['/cmd.js'].lineData[251] = 0;
  _$jscoverage['/cmd.js'].lineData[262] = 0;
  _$jscoverage['/cmd.js'].lineData[264] = 0;
  _$jscoverage['/cmd.js'].lineData[272] = 0;
  _$jscoverage['/cmd.js'].lineData[274] = 0;
  _$jscoverage['/cmd.js'].lineData[275] = 0;
  _$jscoverage['/cmd.js'].lineData[276] = 0;
  _$jscoverage['/cmd.js'].lineData[278] = 0;
  _$jscoverage['/cmd.js'].lineData[279] = 0;
  _$jscoverage['/cmd.js'].lineData[280] = 0;
  _$jscoverage['/cmd.js'].lineData[282] = 0;
  _$jscoverage['/cmd.js'].lineData[283] = 0;
  _$jscoverage['/cmd.js'].lineData[287] = 0;
  _$jscoverage['/cmd.js'].lineData[288] = 0;
  _$jscoverage['/cmd.js'].lineData[292] = 0;
  _$jscoverage['/cmd.js'].lineData[293] = 0;
  _$jscoverage['/cmd.js'].lineData[294] = 0;
  _$jscoverage['/cmd.js'].lineData[296] = 0;
  _$jscoverage['/cmd.js'].lineData[297] = 0;
  _$jscoverage['/cmd.js'].lineData[298] = 0;
  _$jscoverage['/cmd.js'].lineData[306] = 0;
  _$jscoverage['/cmd.js'].lineData[307] = 0;
  _$jscoverage['/cmd.js'].lineData[308] = 0;
  _$jscoverage['/cmd.js'].lineData[309] = 0;
  _$jscoverage['/cmd.js'].lineData[310] = 0;
  _$jscoverage['/cmd.js'].lineData[311] = 0;
  _$jscoverage['/cmd.js'].lineData[316] = 0;
  _$jscoverage['/cmd.js'].lineData[317] = 0;
  _$jscoverage['/cmd.js'].lineData[319] = 0;
  _$jscoverage['/cmd.js'].lineData[320] = 0;
  _$jscoverage['/cmd.js'].lineData[321] = 0;
  _$jscoverage['/cmd.js'].lineData[323] = 0;
  _$jscoverage['/cmd.js'].lineData[328] = 0;
  _$jscoverage['/cmd.js'].lineData[331] = 0;
  _$jscoverage['/cmd.js'].lineData[332] = 0;
  _$jscoverage['/cmd.js'].lineData[336] = 0;
  _$jscoverage['/cmd.js'].lineData[337] = 0;
  _$jscoverage['/cmd.js'].lineData[339] = 0;
  _$jscoverage['/cmd.js'].lineData[344] = 0;
  _$jscoverage['/cmd.js'].lineData[346] = 0;
  _$jscoverage['/cmd.js'].lineData[350] = 0;
  _$jscoverage['/cmd.js'].lineData[351] = 0;
  _$jscoverage['/cmd.js'].lineData[355] = 0;
  _$jscoverage['/cmd.js'].lineData[356] = 0;
  _$jscoverage['/cmd.js'].lineData[360] = 0;
  _$jscoverage['/cmd.js'].lineData[361] = 0;
  _$jscoverage['/cmd.js'].lineData[366] = 0;
  _$jscoverage['/cmd.js'].lineData[367] = 0;
  _$jscoverage['/cmd.js'].lineData[370] = 0;
  _$jscoverage['/cmd.js'].lineData[371] = 0;
  _$jscoverage['/cmd.js'].lineData[375] = 0;
  _$jscoverage['/cmd.js'].lineData[376] = 0;
  _$jscoverage['/cmd.js'].lineData[377] = 0;
  _$jscoverage['/cmd.js'].lineData[382] = 0;
  _$jscoverage['/cmd.js'].lineData[386] = 0;
}
if (! _$jscoverage['/cmd.js'].functionData) {
  _$jscoverage['/cmd.js'].functionData = [];
  _$jscoverage['/cmd.js'].functionData[0] = 0;
  _$jscoverage['/cmd.js'].functionData[1] = 0;
  _$jscoverage['/cmd.js'].functionData[2] = 0;
  _$jscoverage['/cmd.js'].functionData[3] = 0;
  _$jscoverage['/cmd.js'].functionData[4] = 0;
  _$jscoverage['/cmd.js'].functionData[5] = 0;
  _$jscoverage['/cmd.js'].functionData[6] = 0;
  _$jscoverage['/cmd.js'].functionData[7] = 0;
  _$jscoverage['/cmd.js'].functionData[8] = 0;
}
if (! _$jscoverage['/cmd.js'].branchData) {
  _$jscoverage['/cmd.js'].branchData = {};
  _$jscoverage['/cmd.js'].branchData['37'] = [];
  _$jscoverage['/cmd.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['40'] = [];
  _$jscoverage['/cmd.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['40'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['49'] = [];
  _$jscoverage['/cmd.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['55'] = [];
  _$jscoverage['/cmd.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['57'] = [];
  _$jscoverage['/cmd.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['72'] = [];
  _$jscoverage['/cmd.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['72'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['73'] = [];
  _$jscoverage['/cmd.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['75'] = [];
  _$jscoverage['/cmd.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['84'] = [];
  _$jscoverage['/cmd.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['91'] = [];
  _$jscoverage['/cmd.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['95'] = [];
  _$jscoverage['/cmd.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['103'] = [];
  _$jscoverage['/cmd.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['118'] = [];
  _$jscoverage['/cmd.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['128'] = [];
  _$jscoverage['/cmd.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['131'] = [];
  _$jscoverage['/cmd.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['145'] = [];
  _$jscoverage['/cmd.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['148'] = [];
  _$jscoverage['/cmd.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['156'] = [];
  _$jscoverage['/cmd.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['165'] = [];
  _$jscoverage['/cmd.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['168'] = [];
  _$jscoverage['/cmd.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['172'] = [];
  _$jscoverage['/cmd.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['173'] = [];
  _$jscoverage['/cmd.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['187'] = [];
  _$jscoverage['/cmd.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['188'] = [];
  _$jscoverage['/cmd.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['188'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['188'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['190'] = [];
  _$jscoverage['/cmd.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['192'] = [];
  _$jscoverage['/cmd.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['192'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['206'] = [];
  _$jscoverage['/cmd.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['209'] = [];
  _$jscoverage['/cmd.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['209'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['224'] = [];
  _$jscoverage['/cmd.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['231'] = [];
  _$jscoverage['/cmd.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['231'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['231'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['234'] = [];
  _$jscoverage['/cmd.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['234'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['234'][3] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['245'] = [];
  _$jscoverage['/cmd.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['262'] = [];
  _$jscoverage['/cmd.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['262'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['264'] = [];
  _$jscoverage['/cmd.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['275'] = [];
  _$jscoverage['/cmd.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['287'] = [];
  _$jscoverage['/cmd.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['292'] = [];
  _$jscoverage['/cmd.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['293'] = [];
  _$jscoverage['/cmd.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['307'] = [];
  _$jscoverage['/cmd.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['309'] = [];
  _$jscoverage['/cmd.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['310'] = [];
  _$jscoverage['/cmd.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['319'] = [];
  _$jscoverage['/cmd.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['320'] = [];
  _$jscoverage['/cmd.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['331'] = [];
  _$jscoverage['/cmd.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['339'] = [];
  _$jscoverage['/cmd.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['340'] = [];
  _$jscoverage['/cmd.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['341'] = [];
  _$jscoverage['/cmd.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['341'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['343'] = [];
  _$jscoverage['/cmd.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['366'] = [];
  _$jscoverage['/cmd.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['370'] = [];
  _$jscoverage['/cmd.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['371'] = [];
  _$jscoverage['/cmd.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['371'][2] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['372'] = [];
  _$jscoverage['/cmd.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['373'] = [];
  _$jscoverage['/cmd.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['375'] = [];
  _$jscoverage['/cmd.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['376'] = [];
  _$jscoverage['/cmd.js'].branchData['376'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['376'][1].init(26, 12, 'name == type');
function visit70_376_1(result) {
  _$jscoverage['/cmd.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['375'][1].init(22, 40, 'listNodeNames[name = element.nodeName()]');
function visit69_375_1(result) {
  _$jscoverage['/cmd.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['373'][1].init(45, 28, 'element[0] !== blockLimit[0]');
function visit68_373_1(result) {
  _$jscoverage['/cmd.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['372'][1].init(41, 74, '(element = elements[i]) && element[0] !== blockLimit[0]');
function visit67_372_1(result) {
  _$jscoverage['/cmd.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['371'][2].init(26, 19, 'i < elements.length');
function visit66_371_2(result) {
  _$jscoverage['/cmd.js'].branchData['371'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['371'][1].init(26, 116, 'i < elements.length && (element = elements[i]) && element[0] !== blockLimit[0]');
function visit65_371_1(result) {
  _$jscoverage['/cmd.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['370'][1].init(299, 8, 'elements');
function visit64_370_1(result) {
  _$jscoverage['/cmd.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['366'][1].init(167, 11, '!blockLimit');
function visit63_366_1(result) {
  _$jscoverage['/cmd.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['343'][1].init(125, 47, 'sibling.css(\'list-style-type\') == listStyleType');
function visit62_343_1(result) {
  _$jscoverage['/cmd.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['341'][2].init(228, 31, 'sibling.nodeName() == self.type');
function visit61_341_2(result) {
  _$jscoverage['/cmd.js'].branchData['341'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['341'][1].init(38, 173, 'sibling.nodeName() == self.type && sibling.css(\'list-style-type\') == listStyleType');
function visit60_341_1(result) {
  _$jscoverage['/cmd.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['340'][1].init(35, 212, 'sibling[0] && sibling.nodeName() == self.type && sibling.css(\'list-style-type\') == listStyleType');
function visit59_340_1(result) {
  _$jscoverage['/cmd.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['339'][1].init(150, 248, 'sibling && sibling[0] && sibling.nodeName() == self.type && sibling.css(\'list-style-type\') == listStyleType');
function visit58_339_1(result) {
  _$jscoverage['/cmd.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['331'][1].init(6053, 23, 'i < listsCreated.length');
function visit57_331_1(result) {
  _$jscoverage['/cmd.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['320'][1].init(26, 53, 'groupObj.root.css(\'list-style-type\') == listStyleType');
function visit56_320_1(result) {
  _$jscoverage['/cmd.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['319'][1].init(630, 41, 'listNodeNames[groupObj.root.nodeName()]');
function visit55_319_1(result) {
  _$jscoverage['/cmd.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['310'][1].init(26, 41, 'listNodeNames[groupObj.root.nodeName()]');
function visit54_310_1(result) {
  _$jscoverage['/cmd.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['309'][1].init(70, 6, '!state');
function visit53_309_1(result) {
  _$jscoverage['/cmd.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['307'][1].init(4904, 21, 'listGroups.length > 0');
function visit52_307_1(result) {
  _$jscoverage['/cmd.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['293'][1].init(2493, 30, 'root.data(\'list_group_object\')');
function visit51_293_1(result) {
  _$jscoverage['/cmd.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['292'][1].init(2442, 24, 'blockLimit || path.block');
function visit50_292_1(result) {
  _$jscoverage['/cmd.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['287'][1].init(2269, 13, 'processedFlag');
function visit49_287_1(result) {
  _$jscoverage['/cmd.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['275'][1].init(583, 8, 'groupObj');
function visit48_275_1(result) {
  _$jscoverage['/cmd.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['264'][1].init(30, 96, 'listNodeNames[element.nodeName()] && blockLimit.contains(element)');
function visit47_264_1(result) {
  _$jscoverage['/cmd.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['262'][2].init(854, 6, 'i >= 0');
function visit46_262_2(result) {
  _$jscoverage['/cmd.js'].branchData['262'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['262'][1].init(854, 66, 'i >= 0 && (element = pathElements[i])');
function visit45_262_1(result) {
  _$jscoverage['/cmd.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['245'][1].init(104, 24, 'block.data(\'list_block\')');
function visit44_245_1(result) {
  _$jscoverage['/cmd.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['234'][3].init(495, 26, 'endNode.nodeName() == \'td\'');
function visit43_234_3(result) {
  _$jscoverage['/cmd.js'].branchData['234'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['234'][2].init(443, 48, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit42_234_2(result) {
  _$jscoverage['/cmd.js'].branchData['234'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['234'][1].init(443, 78, 'endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && endNode.nodeName() == \'td\'');
function visit41_234_1(result) {
  _$jscoverage['/cmd.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['231'][3].init(300, 28, 'startNode.nodeName() == \'td\'');
function visit40_231_3(result) {
  _$jscoverage['/cmd.js'].branchData['231'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['231'][2].init(246, 50, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit39_231_2(result) {
  _$jscoverage['/cmd.js'].branchData['231'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['231'][1].init(246, 82, 'startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && startNode.nodeName() == \'td\'');
function visit38_231_1(result) {
  _$jscoverage['/cmd.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['224'][1].init(762, 17, 'ranges.length > 0');
function visit37_224_1(result) {
  _$jscoverage['/cmd.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['209'][2].init(206, 17, 'ranges.length < 1');
function visit36_209_2(result) {
  _$jscoverage['/cmd.js'].branchData['209'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['209'][1].init(195, 28, '!ranges || ranges.length < 1');
function visit35_209_1(result) {
  _$jscoverage['/cmd.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['206'][1].init(64, 34, 'selection && selection.getRanges()');
function visit34_206_1(result) {
  _$jscoverage['/cmd.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['192'][2].init(136, 53, 'boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit33_192_2(result) {
  _$jscoverage['/cmd.js'].branchData['192'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['192'][1].init(136, 131, 'boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && siblingNode._4e_isBlockBoundary({\n  br: 1}, undefined)');
function visit32_192_1(result) {
  _$jscoverage['/cmd.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['190'][1].init(163, 270, '(siblingNode = groupObj.root[isStart ? \'prev\' : \'next\'](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && siblingNode._4e_isBlockBoundary({\n  br: 1}, undefined))');
function visit31_190_1(result) {
  _$jscoverage['/cmd.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['188'][3].init(132, 53, 'boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit30_188_3(result) {
  _$jscoverage['/cmd.js'].branchData['188'][3].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['188'][2].init(132, 132, 'boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && boundaryNode._4e_isBlockBoundary(undefined, undefined)');
function visit29_188_2(result) {
  _$jscoverage['/cmd.js'].branchData['188'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['188'][1].init(102, 434, '!(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && boundaryNode._4e_isBlockBoundary(undefined, undefined)) && (siblingNode = groupObj.root[isStart ? \'prev\' : \'next\'](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && siblingNode._4e_isBlockBoundary({\n  br: 1}, undefined))');
function visit28_188_1(result) {
  _$jscoverage['/cmd.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['187'][1].init(24, 537, '(boundaryNode = new Node(docFragment[isStart ? \'firstChild\' : \'lastChild\'])) && !(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && boundaryNode._4e_isBlockBoundary(undefined, undefined)) && (siblingNode = groupObj.root[isStart ? \'prev\' : \'next\'](Walker.whitespaces(true), 1)) && !(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && siblingNode._4e_isBlockBoundary({\n  br: 1}, undefined))');
function visit27_187_1(result) {
  _$jscoverage['/cmd.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['173'][1].init(40, 32, 'listArray[i].indent >= oldIndent');
function visit26_173_1(result) {
  _$jscoverage['/cmd.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['172'][1].init(203, 73, 'listArray[i] && listArray[i].indent >= oldIndent');
function visit25_172_1(result) {
  _$jscoverage['/cmd.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['168'][1].init(138, 58, 'listArray[i].indent > Math.max(listArray[i - 1].indent, 0)');
function visit24_168_1(result) {
  _$jscoverage['/cmd.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['165'][1].init(1406, 20, 'i < listArray.length');
function visit23_165_1(result) {
  _$jscoverage['/cmd.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['156'][1].init(852, 28, 'i < selectedListItems.length');
function visit22_156_1(result) {
  _$jscoverage['/cmd.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['148'][1].init(139, 49, '!itemNode || itemNode.data(\'list_item_processed\')');
function visit21_148_1(result) {
  _$jscoverage['/cmd.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['145'][1].init(370, 28, 'i < groupObj.contents.length');
function visit20_145_1(result) {
  _$jscoverage['/cmd.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['131'][1].init(3082, 15, 'insertAnchor[0]');
function visit19_131_1(result) {
  _$jscoverage['/cmd.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['128'][1].init(761, 9, '!UA[\'ie\']');
function visit18_128_1(result) {
  _$jscoverage['/cmd.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['118'][1].init(234, 44, 'headerTagRegex.test(contentBlock.nodeName())');
function visit17_118_1(result) {
  _$jscoverage['/cmd.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['103'][1].init(1804, 23, 'listContents.length < 1');
function visit16_103_1(result) {
  _$jscoverage['/cmd.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['95'][1].init(26, 33, 'parentNode[0] === commonParent[0]');
function visit15_95_1(result) {
  _$jscoverage['/cmd.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['91'][1].init(1356, 19, 'i < contents.length');
function visit14_91_1(result) {
  _$jscoverage['/cmd.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['84'][1].init(988, 19, 'i < contents.length');
function visit13_84_1(result) {
  _$jscoverage['/cmd.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['75'][2].init(86, 49, 'contents[0][0].nodeType != Dom.NodeType.TEXT_NODE');
function visit12_75_2(result) {
  _$jscoverage['/cmd.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['75'][1].init(86, 130, 'contents[0][0].nodeType != Dom.NodeType.TEXT_NODE && contents[0]._4e_moveChildren(divBlock, undefined, undefined)');
function visit11_75_1(result) {
  _$jscoverage['/cmd.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['73'][1].init(40, 35, 'contents[0][0] === groupObj.root[0]');
function visit10_73_1(result) {
  _$jscoverage['/cmd.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['72'][2].init(409, 20, 'contents.length == 1');
function visit9_72_2(result) {
  _$jscoverage['/cmd.js'].branchData['72'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['72'][1].init(409, 76, 'contents.length == 1 && contents[0][0] === groupObj.root[0]');
function visit8_72_1(result) {
  _$jscoverage['/cmd.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['57'][1].init(22, 29, 'child.nodeName() == this.type');
function visit7_57_1(result) {
  _$jscoverage['/cmd.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['55'][2].init(1531, 10, 'i < length');
function visit6_55_2(result) {
  _$jscoverage['/cmd.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['55'][1].init(1531, 83, 'i < length && (child = new Node(newList.listNode.childNodes[i]))');
function visit5_55_1(result) {
  _$jscoverage['/cmd.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['49'][1].init(1165, 28, 'i < selectedListItems.length');
function visit4_49_1(result) {
  _$jscoverage['/cmd.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['40'][2].init(140, 25, '!itemNode || !itemNode[0]');
function visit3_40_2(result) {
  _$jscoverage['/cmd.js'].branchData['40'][2].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['40'][1].init(140, 87, '(!itemNode || !itemNode[0]) || itemNode.data(\'list_item_processed\')');
function visit2_40_1(result) {
  _$jscoverage['/cmd.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['37'][1].init(525, 28, 'i < groupObj.contents.length');
function visit1_37_1(result) {
  _$jscoverage['/cmd.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[6]++;
KISSY.add("editor/plugin/list-utils/cmd", function(S, Editor, ListUtils, undefined) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[8]++;
  var insertUnorderedList = "insertUnorderedList", insertOrderedList = "insertOrderedList", listNodeNames = {
  "ol": insertOrderedList, 
  "ul": insertUnorderedList}, KER = Editor.RangeType, ElementPath = Editor.ElementPath, Walker = Editor.Walker, UA = S.UA, Node = S.Node, Dom = S.DOM, headerTagRegex = /^h[1-6]$/;
  _$jscoverage['/cmd.js'].lineData[19]++;
  function ListCommand(type) {
    _$jscoverage['/cmd.js'].functionData[1]++;
    _$jscoverage['/cmd.js'].lineData[20]++;
    this.type = type;
  }
  _$jscoverage['/cmd.js'].lineData[23]++;
  ListCommand.prototype = {
  constructor: ListCommand, 
  changeListType: function(editor, groupObj, database, listsCreated, listStyleType) {
  _$jscoverage['/cmd.js'].functionData[2]++;
  _$jscoverage['/cmd.js'].lineData[33]++;
  var listArray = ListUtils.listToArray(groupObj.root, database, undefined, undefined, undefined), selectedListItems = [];
  _$jscoverage['/cmd.js'].lineData[37]++;
  for (var i = 0; visit1_37_1(i < groupObj.contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[38]++;
    var itemNode = groupObj.contents[i];
    _$jscoverage['/cmd.js'].lineData[39]++;
    itemNode = itemNode.closest('li', undefined);
    _$jscoverage['/cmd.js'].lineData[40]++;
    if (visit2_40_1((visit3_40_2(!itemNode || !itemNode[0])) || itemNode.data('list_item_processed'))) {
      _$jscoverage['/cmd.js'].lineData[42]++;
      continue;
    }
    _$jscoverage['/cmd.js'].lineData[43]++;
    selectedListItems.push(itemNode);
    _$jscoverage['/cmd.js'].lineData[44]++;
    itemNode._4e_setMarker(database, 'list_item_processed', true, undefined);
  }
  _$jscoverage['/cmd.js'].lineData[47]++;
  var fakeParent = new Node(groupObj.root[0].ownerDocument.createElement(this.type));
  _$jscoverage['/cmd.js'].lineData[48]++;
  fakeParent.css('list-style-type', listStyleType);
  _$jscoverage['/cmd.js'].lineData[49]++;
  for (i = 0; visit4_49_1(i < selectedListItems.length); i++) {
    _$jscoverage['/cmd.js'].lineData[50]++;
    var listIndex = selectedListItems[i].data('listarray_index');
    _$jscoverage['/cmd.js'].lineData[51]++;
    listArray[listIndex].parent = fakeParent;
  }
  _$jscoverage['/cmd.js'].lineData[53]++;
  var newList = ListUtils.arrayToList(listArray, database, null, "p");
  _$jscoverage['/cmd.js'].lineData[54]++;
  var child, length = newList.listNode.childNodes.length;
  _$jscoverage['/cmd.js'].lineData[55]++;
  for (i = 0; visit5_55_1(visit6_55_2(i < length) && (child = new Node(newList.listNode.childNodes[i]))); i++) {
    _$jscoverage['/cmd.js'].lineData[57]++;
    if (visit7_57_1(child.nodeName() == this.type)) {
      _$jscoverage['/cmd.js'].lineData[58]++;
      listsCreated.push(child);
    }
  }
  _$jscoverage['/cmd.js'].lineData[60]++;
  groupObj.root.before(newList.listNode);
  _$jscoverage['/cmd.js'].lineData[61]++;
  groupObj.root.remove();
}, 
  createList: function(editor, groupObj, listsCreated, listStyleType) {
  _$jscoverage['/cmd.js'].functionData[3]++;
  _$jscoverage['/cmd.js'].lineData[65]++;
  var contents = groupObj.contents, doc = groupObj.root[0].ownerDocument, listContents = [];
  _$jscoverage['/cmd.js'].lineData[72]++;
  if (visit8_72_1(visit9_72_2(contents.length == 1) && visit10_73_1(contents[0][0] === groupObj.root[0]))) {
    _$jscoverage['/cmd.js'].lineData[74]++;
    var divBlock = new Node(doc.createElement('div'));
    _$jscoverage['/cmd.js'].lineData[75]++;
    visit11_75_1(visit12_75_2(contents[0][0].nodeType != Dom.NodeType.TEXT_NODE) && contents[0]._4e_moveChildren(divBlock, undefined, undefined));
    _$jscoverage['/cmd.js'].lineData[77]++;
    contents[0][0].appendChild(divBlock[0]);
    _$jscoverage['/cmd.js'].lineData[78]++;
    contents[0] = divBlock;
  }
  _$jscoverage['/cmd.js'].lineData[82]++;
  var commonParent = groupObj.contents[0].parent();
  _$jscoverage['/cmd.js'].lineData[84]++;
  for (var i = 0; visit13_84_1(i < contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[85]++;
    commonParent = commonParent._4e_commonAncestor(contents[i].parent(), undefined);
  }
  _$jscoverage['/cmd.js'].lineData[91]++;
  for (i = 0; visit14_91_1(i < contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[92]++;
    var contentNode = contents[i], parentNode;
    _$jscoverage['/cmd.js'].lineData[94]++;
    while ((parentNode = contentNode.parent())) {
      _$jscoverage['/cmd.js'].lineData[95]++;
      if (visit15_95_1(parentNode[0] === commonParent[0])) {
        _$jscoverage['/cmd.js'].lineData[96]++;
        listContents.push(contentNode);
        _$jscoverage['/cmd.js'].lineData[97]++;
        break;
      }
      _$jscoverage['/cmd.js'].lineData[99]++;
      contentNode = parentNode;
    }
  }
  _$jscoverage['/cmd.js'].lineData[103]++;
  if (visit16_103_1(listContents.length < 1)) {
    _$jscoverage['/cmd.js'].lineData[104]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[107]++;
  var insertAnchor = new Node(listContents[listContents.length - 1][0].nextSibling), listNode = new Node(doc.createElement(this.type));
  _$jscoverage['/cmd.js'].lineData[110]++;
  listNode.css('list-style-type', listStyleType);
  _$jscoverage['/cmd.js'].lineData[112]++;
  listsCreated.push(listNode);
  _$jscoverage['/cmd.js'].lineData[113]++;
  while (listContents.length) {
    _$jscoverage['/cmd.js'].lineData[114]++;
    var contentBlock = listContents.shift(), listItem = new Node(doc.createElement('li'));
    _$jscoverage['/cmd.js'].lineData[118]++;
    if (visit17_118_1(headerTagRegex.test(contentBlock.nodeName()))) {
      _$jscoverage['/cmd.js'].lineData[119]++;
      listItem[0].appendChild(contentBlock[0]);
    } else {
      _$jscoverage['/cmd.js'].lineData[121]++;
      contentBlock._4e_copyAttributes(listItem, undefined, undefined);
      _$jscoverage['/cmd.js'].lineData[122]++;
      contentBlock._4e_moveChildren(listItem, undefined, undefined);
      _$jscoverage['/cmd.js'].lineData[123]++;
      contentBlock.remove();
    }
    _$jscoverage['/cmd.js'].lineData[125]++;
    listNode[0].appendChild(listItem[0]);
    _$jscoverage['/cmd.js'].lineData[128]++;
    if (visit18_128_1(!UA['ie'])) {
      _$jscoverage['/cmd.js'].lineData[129]++;
      listItem._4e_appendBogus(undefined);
    }
  }
  _$jscoverage['/cmd.js'].lineData[131]++;
  if (visit19_131_1(insertAnchor[0])) {
    _$jscoverage['/cmd.js'].lineData[132]++;
    listNode.insertBefore(insertAnchor, undefined);
  } else {
    _$jscoverage['/cmd.js'].lineData[134]++;
    commonParent.append(listNode);
  }
}, 
  removeList: function(editor, groupObj, database) {
  _$jscoverage['/cmd.js'].functionData[4]++;
  _$jscoverage['/cmd.js'].lineData[141]++;
  var listArray = ListUtils.listToArray(groupObj.root, database, undefined, undefined, undefined), selectedListItems = [];
  _$jscoverage['/cmd.js'].lineData[145]++;
  for (var i = 0; visit20_145_1(i < groupObj.contents.length); i++) {
    _$jscoverage['/cmd.js'].lineData[146]++;
    var itemNode = groupObj.contents[i];
    _$jscoverage['/cmd.js'].lineData[147]++;
    itemNode = itemNode.closest('li', undefined);
    _$jscoverage['/cmd.js'].lineData[148]++;
    if (visit21_148_1(!itemNode || itemNode.data('list_item_processed'))) {
      _$jscoverage['/cmd.js'].lineData[149]++;
      continue;
    }
    _$jscoverage['/cmd.js'].lineData[150]++;
    selectedListItems.push(itemNode);
    _$jscoverage['/cmd.js'].lineData[151]++;
    itemNode._4e_setMarker(database, 'list_item_processed', true, undefined);
  }
  _$jscoverage['/cmd.js'].lineData[154]++;
  var lastListIndex = null;
  _$jscoverage['/cmd.js'].lineData[156]++;
  for (i = 0; visit22_156_1(i < selectedListItems.length); i++) {
    _$jscoverage['/cmd.js'].lineData[157]++;
    var listIndex = selectedListItems[i].data('listarray_index');
    _$jscoverage['/cmd.js'].lineData[158]++;
    listArray[listIndex].indent = -1;
    _$jscoverage['/cmd.js'].lineData[159]++;
    lastListIndex = listIndex;
  }
  _$jscoverage['/cmd.js'].lineData[165]++;
  for (i = lastListIndex + 1; visit23_165_1(i < listArray.length); i++) {
    _$jscoverage['/cmd.js'].lineData[168]++;
    if (visit24_168_1(listArray[i].indent > Math.max(listArray[i - 1].indent, 0))) {
      _$jscoverage['/cmd.js'].lineData[169]++;
      var indentOffset = listArray[i - 1].indent + 1 - listArray[i].indent;
      _$jscoverage['/cmd.js'].lineData[171]++;
      var oldIndent = listArray[i].indent;
      _$jscoverage['/cmd.js'].lineData[172]++;
      while (visit25_172_1(listArray[i] && visit26_173_1(listArray[i].indent >= oldIndent))) {
        _$jscoverage['/cmd.js'].lineData[174]++;
        listArray[i].indent += indentOffset;
        _$jscoverage['/cmd.js'].lineData[175]++;
        i++;
      }
      _$jscoverage['/cmd.js'].lineData[177]++;
      i--;
    }
  }
  _$jscoverage['/cmd.js'].lineData[181]++;
  var newList = ListUtils.arrayToList(listArray, database, null, "p");
  _$jscoverage['/cmd.js'].lineData[184]++;
  var docFragment = newList.listNode, boundaryNode, siblingNode;
  _$jscoverage['/cmd.js'].lineData[186]++;
  function compensateBrs(isStart) {
    _$jscoverage['/cmd.js'].functionData[5]++;
    _$jscoverage['/cmd.js'].lineData[187]++;
    if (visit27_187_1((boundaryNode = new Node(docFragment[isStart ? 'firstChild' : 'lastChild'])) && visit28_188_1(!(visit29_188_2(visit30_188_3(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && boundaryNode._4e_isBlockBoundary(undefined, undefined))) && visit31_190_1((siblingNode = groupObj.root[isStart ? 'prev' : 'next'](Walker.whitespaces(true), 1)) && !(visit32_192_1(visit33_192_2(boundaryNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && siblingNode._4e_isBlockBoundary({
  br: 1}, undefined))))))) {
      _$jscoverage['/cmd.js'].lineData[194]++;
      boundaryNode[isStart ? 'before' : 'after'](editor.get("document")[0].createElement('br'));
    }
  }
  _$jscoverage['/cmd.js'].lineData[198]++;
  compensateBrs(true);
  _$jscoverage['/cmd.js'].lineData[199]++;
  compensateBrs(undefined);
  _$jscoverage['/cmd.js'].lineData[200]++;
  groupObj.root.before(docFragment);
  _$jscoverage['/cmd.js'].lineData[201]++;
  groupObj.root.remove();
}, 
  exec: function(editor, listStyleType) {
  _$jscoverage['/cmd.js'].functionData[6]++;
  _$jscoverage['/cmd.js'].lineData[205]++;
  var selection = editor.getSelection(), ranges = visit34_206_1(selection && selection.getRanges());
  _$jscoverage['/cmd.js'].lineData[209]++;
  if (visit35_209_1(!ranges || visit36_209_2(ranges.length < 1))) {
    _$jscoverage['/cmd.js'].lineData[210]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[213]++;
  var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
  _$jscoverage['/cmd.js'].lineData[216]++;
  var state = queryActive(this.type, currentPath);
  _$jscoverage['/cmd.js'].lineData[218]++;
  var bookmarks = selection.createBookmarks(true);
  _$jscoverage['/cmd.js'].lineData[222]++;
  var listGroups = [], database = {};
  _$jscoverage['/cmd.js'].lineData[224]++;
  while (visit37_224_1(ranges.length > 0)) {
    _$jscoverage['/cmd.js'].lineData[225]++;
    var range = ranges.shift();
    _$jscoverage['/cmd.js'].lineData[227]++;
    var boundaryNodes = range.getBoundaryNodes(), startNode = boundaryNodes.startNode, endNode = boundaryNodes.endNode;
    _$jscoverage['/cmd.js'].lineData[231]++;
    if (visit38_231_1(visit39_231_2(startNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit40_231_3(startNode.nodeName() == 'td'))) {
      _$jscoverage['/cmd.js'].lineData[232]++;
      range.setStartAt(boundaryNodes.startNode, KER.POSITION_AFTER_START);
    }
    _$jscoverage['/cmd.js'].lineData[234]++;
    if (visit41_234_1(visit42_234_2(endNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && visit43_234_3(endNode.nodeName() == 'td'))) {
      _$jscoverage['/cmd.js'].lineData[235]++;
      range.setEndAt(boundaryNodes.endNode, KER.POSITION_BEFORE_END);
    }
    _$jscoverage['/cmd.js'].lineData[237]++;
    var iterator = range.createIterator(), block;
    _$jscoverage['/cmd.js'].lineData[240]++;
    iterator.forceBrBreak = false;
    _$jscoverage['/cmd.js'].lineData[242]++;
    while ((block = iterator.getNextParagraph())) {
      _$jscoverage['/cmd.js'].lineData[245]++;
      if (visit44_245_1(block.data('list_block'))) {
        _$jscoverage['/cmd.js'].lineData[246]++;
        continue;
      } else {
        _$jscoverage['/cmd.js'].lineData[248]++;
        block._4e_setMarker(database, 'list_block', 1, undefined);
      }
      _$jscoverage['/cmd.js'].lineData[251]++;
      var path = new ElementPath(block), pathElements = path.elements, pathElementsCount = pathElements.length, listNode = null, processedFlag = false, blockLimit = path.blockLimit, element;
      _$jscoverage['/cmd.js'].lineData[262]++;
      for (var i = pathElementsCount - 1; visit45_262_1(visit46_262_2(i >= 0) && (element = pathElements[i])); i--) {
        _$jscoverage['/cmd.js'].lineData[264]++;
        if (visit47_264_1(listNodeNames[element.nodeName()] && blockLimit.contains(element))) {
          _$jscoverage['/cmd.js'].lineData[272]++;
          blockLimit.removeData('list_group_object');
          _$jscoverage['/cmd.js'].lineData[274]++;
          var groupObj = element.data('list_group_object');
          _$jscoverage['/cmd.js'].lineData[275]++;
          if (visit48_275_1(groupObj)) {
            _$jscoverage['/cmd.js'].lineData[276]++;
            groupObj.contents.push(block);
          } else {
            _$jscoverage['/cmd.js'].lineData[278]++;
            groupObj = {
  root: element, 
  contents: [block]};
            _$jscoverage['/cmd.js'].lineData[279]++;
            listGroups.push(groupObj);
            _$jscoverage['/cmd.js'].lineData[280]++;
            element._4e_setMarker(database, 'list_group_object', groupObj, undefined);
          }
          _$jscoverage['/cmd.js'].lineData[282]++;
          processedFlag = true;
          _$jscoverage['/cmd.js'].lineData[283]++;
          break;
        }
      }
      _$jscoverage['/cmd.js'].lineData[287]++;
      if (visit49_287_1(processedFlag)) {
        _$jscoverage['/cmd.js'].lineData[288]++;
        continue;
      }
      _$jscoverage['/cmd.js'].lineData[292]++;
      var root = visit50_292_1(blockLimit || path.block);
      _$jscoverage['/cmd.js'].lineData[293]++;
      if (visit51_293_1(root.data('list_group_object'))) {
        _$jscoverage['/cmd.js'].lineData[294]++;
        root.data('list_group_object').contents.push(block);
      } else {
        _$jscoverage['/cmd.js'].lineData[296]++;
        groupObj = {
  root: root, 
  contents: [block]};
        _$jscoverage['/cmd.js'].lineData[297]++;
        root._4e_setMarker(database, 'list_group_object', groupObj, undefined);
        _$jscoverage['/cmd.js'].lineData[298]++;
        listGroups.push(groupObj);
      }
    }
  }
  _$jscoverage['/cmd.js'].lineData[306]++;
  var listsCreated = [];
  _$jscoverage['/cmd.js'].lineData[307]++;
  while (visit52_307_1(listGroups.length > 0)) {
    _$jscoverage['/cmd.js'].lineData[308]++;
    groupObj = listGroups.shift();
    _$jscoverage['/cmd.js'].lineData[309]++;
    if (visit53_309_1(!state)) {
      _$jscoverage['/cmd.js'].lineData[310]++;
      if (visit54_310_1(listNodeNames[groupObj.root.nodeName()])) {
        _$jscoverage['/cmd.js'].lineData[311]++;
        this.changeListType(editor, groupObj, database, listsCreated, listStyleType);
      } else {
        _$jscoverage['/cmd.js'].lineData[316]++;
        Editor.Utils.clearAllMarkers(database);
        _$jscoverage['/cmd.js'].lineData[317]++;
        this.createList(editor, groupObj, listsCreated, listStyleType);
      }
    } else {
      _$jscoverage['/cmd.js'].lineData[319]++;
      if (visit55_319_1(listNodeNames[groupObj.root.nodeName()])) {
        _$jscoverage['/cmd.js'].lineData[320]++;
        if (visit56_320_1(groupObj.root.css('list-style-type') == listStyleType)) {
          _$jscoverage['/cmd.js'].lineData[321]++;
          this.removeList(editor, groupObj, database);
        } else {
          _$jscoverage['/cmd.js'].lineData[323]++;
          groupObj.root.css('list-style-type', listStyleType);
        }
      }
    }
  }
  _$jscoverage['/cmd.js'].lineData[328]++;
  var self = this;
  _$jscoverage['/cmd.js'].lineData[331]++;
  for (i = 0; visit57_331_1(i < listsCreated.length); i++) {
    _$jscoverage['/cmd.js'].lineData[332]++;
    listNode = listsCreated[i];
    _$jscoverage['/cmd.js'].lineData[336]++;
    function mergeSibling(rtl, listNode) {
      _$jscoverage['/cmd.js'].functionData[7]++;
      _$jscoverage['/cmd.js'].lineData[337]++;
      var sibling = listNode[rtl ? 'prev' : 'next'](Walker.whitespaces(true), 1);
      _$jscoverage['/cmd.js'].lineData[339]++;
      if (visit58_339_1(sibling && visit59_340_1(sibling[0] && visit60_341_1(visit61_341_2(sibling.nodeName() == self.type) && visit62_343_1(sibling.css('list-style-type') == listStyleType))))) {
        _$jscoverage['/cmd.js'].lineData[344]++;
        sibling.remove();
        _$jscoverage['/cmd.js'].lineData[346]++;
        sibling._4e_moveChildren(listNode, rtl ? true : false, undefined);
      }
    }    _$jscoverage['/cmd.js'].lineData[350]++;
    mergeSibling(undefined, listNode);
    _$jscoverage['/cmd.js'].lineData[351]++;
    mergeSibling(true, listNode);
  }
  _$jscoverage['/cmd.js'].lineData[355]++;
  Editor.Utils.clearAllMarkers(database);
  _$jscoverage['/cmd.js'].lineData[356]++;
  selection.selectBookmarks(bookmarks);
}};
  _$jscoverage['/cmd.js'].lineData[360]++;
  function queryActive(type, elementPath) {
    _$jscoverage['/cmd.js'].functionData[8]++;
    _$jscoverage['/cmd.js'].lineData[361]++;
    var element, name, i, blockLimit = elementPath.blockLimit, elements = elementPath.elements;
    _$jscoverage['/cmd.js'].lineData[366]++;
    if (visit63_366_1(!blockLimit)) {
      _$jscoverage['/cmd.js'].lineData[367]++;
      return false;
    }
    _$jscoverage['/cmd.js'].lineData[370]++;
    if (visit64_370_1(elements)) {
      _$jscoverage['/cmd.js'].lineData[371]++;
      for (i = 0; visit65_371_1(visit66_371_2(i < elements.length) && visit67_372_1((element = elements[i]) && visit68_373_1(element[0] !== blockLimit[0]))); i++) {
        _$jscoverage['/cmd.js'].lineData[375]++;
        if (visit69_375_1(listNodeNames[name = element.nodeName()])) {
          _$jscoverage['/cmd.js'].lineData[376]++;
          if (visit70_376_1(name == type)) {
            _$jscoverage['/cmd.js'].lineData[377]++;
            return element.css('list-style-type');
          }
        }
      }
    }
    _$jscoverage['/cmd.js'].lineData[382]++;
    return false;
  }
  _$jscoverage['/cmd.js'].lineData[386]++;
  return {
  ListCommand: ListCommand, 
  queryActive: queryActive};
}, {
  requires: ['editor', '../list-utils']});
