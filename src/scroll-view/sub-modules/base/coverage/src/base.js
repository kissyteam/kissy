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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[10] = 0;
  _$jscoverage['/base.js'].lineData[11] = 0;
  _$jscoverage['/base.js'].lineData[14] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[38] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[51] = 0;
  _$jscoverage['/base.js'].lineData[54] = 0;
  _$jscoverage['/base.js'].lineData[57] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[95] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[100] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[107] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[109] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[126] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[147] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[149] = 0;
  _$jscoverage['/base.js'].lineData[150] = 0;
  _$jscoverage['/base.js'].lineData[151] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[153] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[158] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[237] = 0;
  _$jscoverage['/base.js'].lineData[238] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[242] = 0;
  _$jscoverage['/base.js'].lineData[244] = 0;
  _$jscoverage['/base.js'].lineData[245] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[248] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[252] = 0;
  _$jscoverage['/base.js'].lineData[253] = 0;
  _$jscoverage['/base.js'].lineData[254] = 0;
  _$jscoverage['/base.js'].lineData[256] = 0;
  _$jscoverage['/base.js'].lineData[257] = 0;
  _$jscoverage['/base.js'].lineData[259] = 0;
  _$jscoverage['/base.js'].lineData[260] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[270] = 0;
  _$jscoverage['/base.js'].lineData[274] = 0;
  _$jscoverage['/base.js'].lineData[275] = 0;
  _$jscoverage['/base.js'].lineData[277] = 0;
  _$jscoverage['/base.js'].lineData[278] = 0;
  _$jscoverage['/base.js'].lineData[283] = 0;
  _$jscoverage['/base.js'].lineData[284] = 0;
  _$jscoverage['/base.js'].lineData[290] = 0;
  _$jscoverage['/base.js'].lineData[291] = 0;
  _$jscoverage['/base.js'].lineData[295] = 0;
  _$jscoverage['/base.js'].lineData[296] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[309] = 0;
  _$jscoverage['/base.js'].lineData[317] = 0;
  _$jscoverage['/base.js'].lineData[320] = 0;
  _$jscoverage['/base.js'].lineData[324] = 0;
  _$jscoverage['/base.js'].lineData[326] = 0;
  _$jscoverage['/base.js'].lineData[330] = 0;
  _$jscoverage['/base.js'].lineData[333] = 0;
  _$jscoverage['/base.js'].lineData[334] = 0;
  _$jscoverage['/base.js'].lineData[335] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[338] = 0;
  _$jscoverage['/base.js'].lineData[340] = 0;
  _$jscoverage['/base.js'].lineData[341] = 0;
  _$jscoverage['/base.js'].lineData[343] = 0;
  _$jscoverage['/base.js'].lineData[344] = 0;
  _$jscoverage['/base.js'].lineData[347] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[355] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[362] = 0;
  _$jscoverage['/base.js'].lineData[366] = 0;
  _$jscoverage['/base.js'].lineData[367] = 0;
  _$jscoverage['/base.js'].lineData[368] = 0;
  _$jscoverage['/base.js'].lineData[373] = 0;
  _$jscoverage['/base.js'].lineData[374] = 0;
  _$jscoverage['/base.js'].lineData[377] = 0;
  _$jscoverage['/base.js'].lineData[378] = 0;
  _$jscoverage['/base.js'].lineData[385] = 0;
  _$jscoverage['/base.js'].lineData[386] = 0;
  _$jscoverage['/base.js'].lineData[387] = 0;
  _$jscoverage['/base.js'].lineData[392] = 0;
  _$jscoverage['/base.js'].lineData[397] = 0;
  _$jscoverage['/base.js'].lineData[406] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
  _$jscoverage['/base.js'].functionData[18] = 0;
  _$jscoverage['/base.js'].functionData[19] = 0;
  _$jscoverage['/base.js'].functionData[20] = 0;
  _$jscoverage['/base.js'].functionData[21] = 0;
  _$jscoverage['/base.js'].functionData[22] = 0;
  _$jscoverage['/base.js'].functionData[23] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['73'] = [];
  _$jscoverage['/base.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['73'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['74'] = [];
  _$jscoverage['/base.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['75'] = [];
  _$jscoverage['/base.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['85'] = [];
  _$jscoverage['/base.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['89'] = [];
  _$jscoverage['/base.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['94'] = [];
  _$jscoverage['/base.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['97'] = [];
  _$jscoverage['/base.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['100'] = [];
  _$jscoverage['/base.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['105'] = [];
  _$jscoverage['/base.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['108'] = [];
  _$jscoverage['/base.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['111'] = [];
  _$jscoverage['/base.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['121'] = [];
  _$jscoverage['/base.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['135'] = [];
  _$jscoverage['/base.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'] = [];
  _$jscoverage['/base.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['151'] = [];
  _$jscoverage['/base.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['151'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['151'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['151'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['151'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['151'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['151'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['151'][8] = new BranchData();
  _$jscoverage['/base.js'].branchData['157'] = [];
  _$jscoverage['/base.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['161'] = [];
  _$jscoverage['/base.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['161'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['161'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['161'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['161'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['161'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['161'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['161'][8] = new BranchData();
  _$jscoverage['/base.js'].branchData['170'] = [];
  _$jscoverage['/base.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['193'] = [];
  _$jscoverage['/base.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['194'] = [];
  _$jscoverage['/base.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['196'] = [];
  _$jscoverage['/base.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['201'] = [];
  _$jscoverage['/base.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['203'] = [];
  _$jscoverage['/base.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['214'] = [];
  _$jscoverage['/base.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['224'] = [];
  _$jscoverage['/base.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['227'] = [];
  _$jscoverage['/base.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['237'] = [];
  _$jscoverage['/base.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['240'] = [];
  _$jscoverage['/base.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['244'] = [];
  _$jscoverage['/base.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['256'] = [];
  _$jscoverage['/base.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['259'] = [];
  _$jscoverage['/base.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['274'] = [];
  _$jscoverage['/base.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['295'] = [];
  _$jscoverage['/base.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['298'] = [];
  _$jscoverage['/base.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['324'] = [];
  _$jscoverage['/base.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['324'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['326'] = [];
  _$jscoverage['/base.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['326'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['327'] = [];
  _$jscoverage['/base.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['327'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['328'] = [];
  _$jscoverage['/base.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['328'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['329'] = [];
  _$jscoverage['/base.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['340'] = [];
  _$jscoverage['/base.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['343'] = [];
  _$jscoverage['/base.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['366'] = [];
  _$jscoverage['/base.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['368'] = [];
  _$jscoverage['/base.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['377'] = [];
  _$jscoverage['/base.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['377'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['377'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['385'] = [];
  _$jscoverage['/base.js'].branchData['385'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['385'][1].init(796, 9, 'pageIndex');
function visit68_385_1(result) {
  _$jscoverage['/base.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['377'][3].init(200, 19, 'top <= maxScrollTop');
function visit67_377_3(result) {
  _$jscoverage['/base.js'].branchData['377'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['377'][2].init(175, 21, 'left <= maxScrollLeft');
function visit66_377_2(result) {
  _$jscoverage['/base.js'].branchData['377'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['377'][1].init(175, 44, 'left <= maxScrollLeft && top <= maxScrollTop');
function visit65_377_1(result) {
  _$jscoverage['/base.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['368'][1].init(88, 24, 'typeof snap === \'string\'');
function visit64_368_1(result) {
  _$jscoverage['/base.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['366'][1].init(1727, 4, 'snap');
function visit63_366_1(result) {
  _$jscoverage['/base.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['343'][1].init(1158, 25, 'scrollWidth > clientWidth');
function visit62_343_1(result) {
  _$jscoverage['/base.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['340'][1].init(1069, 27, 'scrollHeight > clientHeight');
function visit61_340_1(result) {
  _$jscoverage['/base.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['329'][1].init(53, 35, 'clientWidth === prevVal.clientWidth');
function visit60_329_1(result) {
  _$jscoverage['/base.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['328'][2].init(714, 37, 'clientHeight === prevVal.clientHeight');
function visit59_328_2(result) {
  _$jscoverage['/base.js'].branchData['328'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['328'][1].init(51, 89, 'clientHeight === prevVal.clientHeight && clientWidth === prevVal.clientWidth');
function visit58_328_1(result) {
  _$jscoverage['/base.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['327'][2].init(661, 35, 'prevVal.scrollWidth === scrollWidth');
function visit57_327_2(result) {
  _$jscoverage['/base.js'].branchData['327'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['327'][1].init(53, 141, 'prevVal.scrollWidth === scrollWidth && clientHeight === prevVal.clientHeight && clientWidth === prevVal.clientWidth');
function visit56_327_1(result) {
  _$jscoverage['/base.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['326'][2].init(605, 37, 'prevVal.scrollHeight === scrollHeight');
function visit55_326_2(result) {
  _$jscoverage['/base.js'].branchData['326'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['326'][1].init(605, 195, 'prevVal.scrollHeight === scrollHeight && prevVal.scrollWidth === scrollWidth && clientHeight === prevVal.clientHeight && clientWidth === prevVal.clientWidth');
function visit54_326_1(result) {
  _$jscoverage['/base.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['324'][2].init(568, 14, 'e && e.prevVal');
function visit53_324_2(result) {
  _$jscoverage['/base.js'].branchData['324'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['324'][1].init(568, 20, 'e && e.prevVal || {}');
function visit52_324_1(result) {
  _$jscoverage['/base.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['298'][1].init(255, 10, 'scrollLeft');
function visit51_298_1(result) {
  _$jscoverage['/base.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['295'][1].init(147, 9, 'scrollTop');
function visit50_295_1(result) {
  _$jscoverage['/base.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['274'][1].init(9977, 11, 'supportCss3');
function visit49_274_1(result) {
  _$jscoverage['/base.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['259'][1].init(135, 17, 'top !== undefined');
function visit48_259_1(result) {
  _$jscoverage['/base.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['256'][1].init(22, 18, 'left !== undefined');
function visit47_256_1(result) {
  _$jscoverage['/base.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['244'][1].init(252, 17, 'top !== undefined');
function visit46_244_1(result) {
  _$jscoverage['/base.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['240'][1].init(84, 18, 'left !== undefined');
function visit45_240_1(result) {
  _$jscoverage['/base.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['237'][1].init(114, 7, 'animCfg');
function visit44_237_1(result) {
  _$jscoverage['/base.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['227'][1].init(272, 7, 'cfg.top');
function visit43_227_1(result) {
  _$jscoverage['/base.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['224'][1].init(138, 8, 'cfg.left');
function visit42_224_1(result) {
  _$jscoverage['/base.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['214'][1].init(78, 51, '(pageOffset = self.pagesOffset) && pageOffset[index]');
function visit41_214_1(result) {
  _$jscoverage['/base.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['203'][1].init(72, 15, 'offset[p2] <= v');
function visit40_203_1(result) {
  _$jscoverage['/base.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['201'][1].init(51, 6, 'i >= 0');
function visit39_201_1(result) {
  _$jscoverage['/base.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['196'][1].init(72, 15, 'offset[p2] >= v');
function visit38_196_1(result) {
  _$jscoverage['/base.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['194'][1].init(30, 22, 'i < pagesOffset.length');
function visit37_194_1(result) {
  _$jscoverage['/base.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['193'][1].init(261, 13, 'direction > 0');
function visit36_193_1(result) {
  _$jscoverage['/base.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['170'][1].init(48, 23, 'self.scrollAnims.length');
function visit35_170_1(result) {
  _$jscoverage['/base.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['161'][8].init(216, 10, 'deltaX < 0');
function visit34_161_8(result) {
  _$jscoverage['/base.js'].branchData['161'][8].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['161'][7].init(195, 17, 'scrollLeft >= max');
function visit33_161_7(result) {
  _$jscoverage['/base.js'].branchData['161'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['161'][6].init(195, 31, 'scrollLeft >= max && deltaX < 0');
function visit32_161_6(result) {
  _$jscoverage['/base.js'].branchData['161'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['161'][5].init(181, 10, 'deltaX > 0');
function visit31_161_5(result) {
  _$jscoverage['/base.js'].branchData['161'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['161'][4].init(160, 17, 'scrollLeft <= min');
function visit30_161_4(result) {
  _$jscoverage['/base.js'].branchData['161'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['161'][3].init(160, 31, 'scrollLeft <= min && deltaX > 0');
function visit29_161_3(result) {
  _$jscoverage['/base.js'].branchData['161'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['161'][2].init(160, 66, 'scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0');
function visit28_161_2(result) {
  _$jscoverage['/base.js'].branchData['161'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['161'][1].init(158, 69, '!(scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0)');
function visit27_161_1(result) {
  _$jscoverage['/base.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['157'][1].init(825, 43, '(deltaX = e.deltaX) && self.allowScroll.left');
function visit26_157_1(result) {
  _$jscoverage['/base.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['151'][8].init(210, 10, 'deltaY < 0');
function visit25_151_8(result) {
  _$jscoverage['/base.js'].branchData['151'][8].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['151'][7].init(190, 16, 'scrollTop >= max');
function visit24_151_7(result) {
  _$jscoverage['/base.js'].branchData['151'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['151'][6].init(190, 30, 'scrollTop >= max && deltaY < 0');
function visit23_151_6(result) {
  _$jscoverage['/base.js'].branchData['151'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['151'][5].init(176, 10, 'deltaY > 0');
function visit22_151_5(result) {
  _$jscoverage['/base.js'].branchData['151'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['151'][4].init(156, 16, 'scrollTop <= min');
function visit21_151_4(result) {
  _$jscoverage['/base.js'].branchData['151'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['151'][3].init(156, 30, 'scrollTop <= min && deltaY > 0');
function visit20_151_3(result) {
  _$jscoverage['/base.js'].branchData['151'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['151'][2].init(156, 64, 'scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0');
function visit19_151_2(result) {
  _$jscoverage['/base.js'].branchData['151'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['151'][1].init(154, 67, '!(scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0)');
function visit18_151_1(result) {
  _$jscoverage['/base.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][1].init(368, 42, '(deltaY = e.deltaY) && self.allowScroll.top');
function visit17_147_1(result) {
  _$jscoverage['/base.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['135'][1].init(18, 20, 'this.get(\'disabled\')');
function visit16_135_1(result) {
  _$jscoverage['/base.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['121'][1].init(48, 15, 'self.scrollStep');
function visit15_121_1(result) {
  _$jscoverage['/base.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['111'][1].init(302, 24, 'keyCode === KeyCode.LEFT');
function visit14_111_1(result) {
  _$jscoverage['/base.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['108'][1].init(132, 25, 'keyCode === KeyCode.RIGHT');
function visit13_108_1(result) {
  _$jscoverage['/base.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['105'][1].init(1656, 6, 'allowX');
function visit12_105_1(result) {
  _$jscoverage['/base.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['100'][1].init(737, 27, 'keyCode === KeyCode.PAGE_UP');
function visit11_100_1(result) {
  _$jscoverage['/base.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['97'][1].init(564, 29, 'keyCode === KeyCode.PAGE_DOWN');
function visit10_97_1(result) {
  _$jscoverage['/base.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['94'][1].init(399, 22, 'keyCode === KeyCode.UP');
function visit9_94_1(result) {
  _$jscoverage['/base.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['89'][1].init(184, 24, 'keyCode === KeyCode.DOWN');
function visit8_89_1(result) {
  _$jscoverage['/base.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['85'][1].init(720, 6, 'allowY');
function visit7_85_1(result) {
  _$jscoverage['/base.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['75'][2].init(338, 21, 'nodeName === \'select\'');
function visit6_75_2(result) {
  _$jscoverage['/base.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['75'][1].init(43, 76, 'nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit5_75_1(result) {
  _$jscoverage['/base.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['74'][2].init(293, 23, 'nodeName === \'textarea\'');
function visit4_74_2(result) {
  _$jscoverage['/base.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['74'][1].init(40, 120, 'nodeName === \'textarea\' || nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit3_74_1(result) {
  _$jscoverage['/base.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['73'][2].init(250, 20, 'nodeName === \'input\'');
function visit2_73_2(result) {
  _$jscoverage['/base.js'].branchData['73'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['73'][1].init(250, 161, 'nodeName === \'input\' || nodeName === \'textarea\' || nodeName === \'select\' || $target.hasAttr(\'contenteditable\')');
function visit1_73_1(result) {
  _$jscoverage['/base.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/base.js'].lineData[8]++;
  var TimerAnim = require('anim/timer');
  _$jscoverage['/base.js'].lineData[9]++;
  var Container = require('component/container');
  _$jscoverage['/base.js'].lineData[10]++;
  var ContentBox = require('component/extension/content-box');
  _$jscoverage['/base.js'].lineData[11]++;
  var $ = Node.all, KeyCode = Node.KeyCode;
  _$jscoverage['/base.js'].lineData[14]++;
  var Feature = S.Feature, transformVendorInfo = Feature.getCssVendorInfo('transform'), floor = Math.floor, transformProperty;
  _$jscoverage['/base.js'].lineData[19]++;
  var isTransform3dSupported = S.Feature.isTransform3dSupported();
  _$jscoverage['/base.js'].lineData[21]++;
  var supportCss3 = !!transformVendorInfo;
  _$jscoverage['/base.js'].lineData[23]++;
  var methods = {
  initializer: function() {
  _$jscoverage['/base.js'].functionData[1]++;
  _$jscoverage['/base.js'].lineData[25]++;
  this.scrollAnims = [];
}, 
  bindUI: function() {
  _$jscoverage['/base.js'].functionData[2]++;
  _$jscoverage['/base.js'].lineData[29]++;
  var self = this, $el = self.$el;
  _$jscoverage['/base.js'].lineData[34]++;
  $el.on('mousewheel', self.handleMouseWheel, self).on('scroll', onElScroll, self);
}, 
  syncUI: function() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[38]++;
  this.sync();
}, 
  sync: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[42]++;
  var self = this, el = self.el, contentEl = self.contentEl;
  _$jscoverage['/base.js'].lineData[51]++;
  var scrollHeight = Math.max(contentEl.offsetHeight, contentEl.scrollHeight), scrollWidth = Math.max(contentEl.offsetWidth, contentEl.scrollWidth);
  _$jscoverage['/base.js'].lineData[54]++;
  var clientHeight = el.clientHeight, clientWidth = el.clientWidth;
  _$jscoverage['/base.js'].lineData[57]++;
  self.set('dimension', {
  scrollHeight: scrollHeight, 
  scrollWidth: scrollWidth, 
  clientWidth: clientWidth, 
  clientHeight: clientHeight});
}, 
  _onSetDimension: reflow, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[69]++;
  var target = e.target, $target = $(target), nodeName = $target.nodeName();
  _$jscoverage['/base.js'].lineData[73]++;
  if (visit1_73_1(visit2_73_2(nodeName === 'input') || visit3_74_1(visit4_74_2(nodeName === 'textarea') || visit5_75_1(visit6_75_2(nodeName === 'select') || $target.hasAttr('contenteditable'))))) {
    _$jscoverage['/base.js'].lineData[77]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[79]++;
  var self = this, keyCode = e.keyCode, scrollStep = self.getScrollStep(), ok;
  _$jscoverage['/base.js'].lineData[83]++;
  var allowX = self.allowScroll.left;
  _$jscoverage['/base.js'].lineData[84]++;
  var allowY = self.allowScroll.top;
  _$jscoverage['/base.js'].lineData[85]++;
  if (visit7_85_1(allowY)) {
    _$jscoverage['/base.js'].lineData[86]++;
    var scrollStepY = scrollStep.top, clientHeight = self.clientHeight, scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[89]++;
    if (visit8_89_1(keyCode === KeyCode.DOWN)) {
      _$jscoverage['/base.js'].lineData[90]++;
      self.scrollToWithBounds({
  top: scrollTop + scrollStepY});
      _$jscoverage['/base.js'].lineData[93]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[94]++;
      if (visit9_94_1(keyCode === KeyCode.UP)) {
        _$jscoverage['/base.js'].lineData[95]++;
        self.scrollToWithBounds({
  top: scrollTop - scrollStepY});
        _$jscoverage['/base.js'].lineData[96]++;
        ok = true;
      } else {
        _$jscoverage['/base.js'].lineData[97]++;
        if (visit10_97_1(keyCode === KeyCode.PAGE_DOWN)) {
          _$jscoverage['/base.js'].lineData[98]++;
          self.scrollToWithBounds({
  top: scrollTop + clientHeight});
          _$jscoverage['/base.js'].lineData[99]++;
          ok = true;
        } else {
          _$jscoverage['/base.js'].lineData[100]++;
          if (visit11_100_1(keyCode === KeyCode.PAGE_UP)) {
            _$jscoverage['/base.js'].lineData[101]++;
            self.scrollToWithBounds({
  top: scrollTop - clientHeight});
            _$jscoverage['/base.js'].lineData[102]++;
            ok = true;
          }
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[105]++;
  if (visit12_105_1(allowX)) {
    _$jscoverage['/base.js'].lineData[106]++;
    var scrollStepX = scrollStep.left;
    _$jscoverage['/base.js'].lineData[107]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[108]++;
    if (visit13_108_1(keyCode === KeyCode.RIGHT)) {
      _$jscoverage['/base.js'].lineData[109]++;
      self.scrollToWithBounds({
  left: scrollLeft + scrollStepX});
      _$jscoverage['/base.js'].lineData[110]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[111]++;
      if (visit14_111_1(keyCode === KeyCode.LEFT)) {
        _$jscoverage['/base.js'].lineData[112]++;
        self.scrollToWithBounds({
  left: scrollLeft - scrollStepX});
        _$jscoverage['/base.js'].lineData[113]++;
        ok = true;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[116]++;
  return ok;
}, 
  getScrollStep: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[120]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[121]++;
  if (visit15_121_1(self.scrollStep)) {
    _$jscoverage['/base.js'].lineData[122]++;
    return self.scrollStep;
  }
  _$jscoverage['/base.js'].lineData[124]++;
  var elDoc = $(this.get('el')[0].ownerDocument);
  _$jscoverage['/base.js'].lineData[125]++;
  var clientHeight = self.clientHeight;
  _$jscoverage['/base.js'].lineData[126]++;
  var clientWidth = self.clientWidth;
  _$jscoverage['/base.js'].lineData[127]++;
  self.scrollStep = {
  top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20), 
  left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)};
  _$jscoverage['/base.js'].lineData[131]++;
  return self.scrollStep;
}, 
  handleMouseWheel: function(e) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[135]++;
  if (visit16_135_1(this.get('disabled'))) {
    _$jscoverage['/base.js'].lineData[136]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[138]++;
  var max, min, self = this, scrollStep = self.getScrollStep(), deltaY, deltaX, maxScroll = self.maxScroll, minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[147]++;
  if (visit17_147_1((deltaY = e.deltaY) && self.allowScroll.top)) {
    _$jscoverage['/base.js'].lineData[148]++;
    var scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[149]++;
    max = maxScroll.top;
    _$jscoverage['/base.js'].lineData[150]++;
    min = minScroll.top;
    _$jscoverage['/base.js'].lineData[151]++;
    if (visit18_151_1(!(visit19_151_2(visit20_151_3(visit21_151_4(scrollTop <= min) && visit22_151_5(deltaY > 0)) || visit23_151_6(visit24_151_7(scrollTop >= max) && visit25_151_8(deltaY < 0)))))) {
      _$jscoverage['/base.js'].lineData[152]++;
      self.scrollToWithBounds({
  top: scrollTop - e.deltaY * scrollStep.top});
      _$jscoverage['/base.js'].lineData[153]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/base.js'].lineData[157]++;
  if (visit26_157_1((deltaX = e.deltaX) && self.allowScroll.left)) {
    _$jscoverage['/base.js'].lineData[158]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[159]++;
    max = maxScroll.left;
    _$jscoverage['/base.js'].lineData[160]++;
    min = minScroll.left;
    _$jscoverage['/base.js'].lineData[161]++;
    if (visit27_161_1(!(visit28_161_2(visit29_161_3(visit30_161_4(scrollLeft <= min) && visit31_161_5(deltaX > 0)) || visit32_161_6(visit33_161_7(scrollLeft >= max) && visit34_161_8(deltaX < 0)))))) {
      _$jscoverage['/base.js'].lineData[162]++;
      self.scrollToWithBounds({
  left: scrollLeft - e.deltaX * scrollStep.left});
      _$jscoverage['/base.js'].lineData[163]++;
      e.preventDefault();
    }
  }
}, 
  stopAnimation: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[169]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[170]++;
  if (visit35_170_1(self.scrollAnims.length)) {
    _$jscoverage['/base.js'].lineData[171]++;
    S.each(self.scrollAnims, function(scrollAnim) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[172]++;
  scrollAnim.stop();
});
    _$jscoverage['/base.js'].lineData[174]++;
    self.scrollAnims = [];
  }
  _$jscoverage['/base.js'].lineData[176]++;
  self.scrollToWithBounds({
  left: self.get('scrollLeft'), 
  top: self.get('scrollTop')});
}, 
  _uiSetPageIndex: function(v) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[183]++;
  this.scrollToPage(v);
}, 
  getPageIndexFromXY: function(v, allowX, direction) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[187]++;
  var pagesOffset = this.pagesOffset.concat([]);
  _$jscoverage['/base.js'].lineData[188]++;
  var p2 = allowX ? 'left' : 'top';
  _$jscoverage['/base.js'].lineData[189]++;
  var i, offset;
  _$jscoverage['/base.js'].lineData[190]++;
  pagesOffset.sort(function(e1, e2) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[191]++;
  return e1[p2] - e2[p2];
});
  _$jscoverage['/base.js'].lineData[193]++;
  if (visit36_193_1(direction > 0)) {
    _$jscoverage['/base.js'].lineData[194]++;
    for (i = 0; visit37_194_1(i < pagesOffset.length); i++) {
      _$jscoverage['/base.js'].lineData[195]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[196]++;
      if (visit38_196_1(offset[p2] >= v)) {
        _$jscoverage['/base.js'].lineData[197]++;
        return offset.index;
      }
    }
  } else {
    _$jscoverage['/base.js'].lineData[201]++;
    for (i = pagesOffset.length - 1; visit39_201_1(i >= 0); i--) {
      _$jscoverage['/base.js'].lineData[202]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[203]++;
      if (visit40_203_1(offset[p2] <= v)) {
        _$jscoverage['/base.js'].lineData[204]++;
        return offset.index;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[208]++;
  return undefined;
}, 
  scrollToPage: function(index, animCfg) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[212]++;
  var self = this, pageOffset;
  _$jscoverage['/base.js'].lineData[214]++;
  if (visit41_214_1((pageOffset = self.pagesOffset) && pageOffset[index])) {
    _$jscoverage['/base.js'].lineData[215]++;
    self.set('pageIndex', index);
    _$jscoverage['/base.js'].lineData[216]++;
    self.scrollTo(pageOffset[index], animCfg);
  }
}, 
  scrollToWithBounds: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[221]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[222]++;
  var maxScroll = self.maxScroll;
  _$jscoverage['/base.js'].lineData[223]++;
  var minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[224]++;
  if (visit42_224_1(cfg.left)) {
    _$jscoverage['/base.js'].lineData[225]++;
    cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left);
  }
  _$jscoverage['/base.js'].lineData[227]++;
  if (visit43_227_1(cfg.top)) {
    _$jscoverage['/base.js'].lineData[228]++;
    cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top);
  }
  _$jscoverage['/base.js'].lineData[230]++;
  self.scrollTo(cfg, anim);
}, 
  scrollTo: function(cfg, animCfg) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[234]++;
  var self = this, left = cfg.left, top = cfg.top;
  _$jscoverage['/base.js'].lineData[237]++;
  if (visit44_237_1(animCfg)) {
    _$jscoverage['/base.js'].lineData[238]++;
    var node = {}, to = {};
    _$jscoverage['/base.js'].lineData[240]++;
    if (visit45_240_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[241]++;
      to.scrollLeft = left;
      _$jscoverage['/base.js'].lineData[242]++;
      node.scrollLeft = self.get('scrollLeft');
    }
    _$jscoverage['/base.js'].lineData[244]++;
    if (visit46_244_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[245]++;
      to.scrollTop = top;
      _$jscoverage['/base.js'].lineData[246]++;
      node.scrollTop = self.get('scrollTop');
    }
    _$jscoverage['/base.js'].lineData[248]++;
    animCfg.frame = frame;
    _$jscoverage['/base.js'].lineData[249]++;
    animCfg.node = node;
    _$jscoverage['/base.js'].lineData[250]++;
    animCfg.to = to;
    _$jscoverage['/base.js'].lineData[251]++;
    var anim;
    _$jscoverage['/base.js'].lineData[252]++;
    self.scrollAnims.push(anim = new TimerAnim(animCfg));
    _$jscoverage['/base.js'].lineData[253]++;
    anim.scrollView = self;
    _$jscoverage['/base.js'].lineData[254]++;
    anim.run();
  } else {
    _$jscoverage['/base.js'].lineData[256]++;
    if (visit47_256_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[257]++;
      self.set('scrollLeft', left);
    }
    _$jscoverage['/base.js'].lineData[259]++;
    if (visit48_259_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[260]++;
      self.set('scrollTop', top);
    }
  }
}, 
  _onSetScrollLeft: function(v) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[266]++;
  this.contentEl.style.left = -v + 'px';
}, 
  _onSetScrollTop: function(v) {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[270]++;
  this.contentEl.style.top = -v + 'px';
}};
  _$jscoverage['/base.js'].lineData[274]++;
  if (visit49_274_1(supportCss3)) {
    _$jscoverage['/base.js'].lineData[275]++;
    transformProperty = transformVendorInfo.propertyName;
    _$jscoverage['/base.js'].lineData[277]++;
    methods._onSetScrollLeft = function(v) {
  _$jscoverage['/base.js'].functionData[18]++;
  _$jscoverage['/base.js'].lineData[278]++;
  this.contentEl.style[transformProperty] = 'translateX(' + floor(0 - v) + 'px)' + ' translateY(' + floor(0 - this.get('scrollTop')) + 'px)' + (isTransform3dSupported ? ' translateZ(0)' : '');
};
    _$jscoverage['/base.js'].lineData[283]++;
    methods._onSetScrollTop = function(v) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[284]++;
  this.contentEl.style[transformProperty] = 'translateX(' + floor(0 - this.get('scrollLeft')) + 'px)' + ' translateY(' + floor(0 - v) + 'px)' + (isTransform3dSupported ? ' translateZ(0)' : '');
};
  }
  _$jscoverage['/base.js'].lineData[290]++;
  function onElScroll() {
    _$jscoverage['/base.js'].functionData[20]++;
    _$jscoverage['/base.js'].lineData[291]++;
    var self = this, el = self.el, scrollTop = el.scrollTop, scrollLeft = el.scrollLeft;
    _$jscoverage['/base.js'].lineData[295]++;
    if (visit50_295_1(scrollTop)) {
      _$jscoverage['/base.js'].lineData[296]++;
      self.set('scrollTop', scrollTop + self.get('scrollTop'));
    }
    _$jscoverage['/base.js'].lineData[298]++;
    if (visit51_298_1(scrollLeft)) {
      _$jscoverage['/base.js'].lineData[299]++;
      self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
    }
    _$jscoverage['/base.js'].lineData[301]++;
    el.scrollTop = el.scrollLeft = 0;
  }
  _$jscoverage['/base.js'].lineData[304]++;
  function frame(anim, fx) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[305]++;
    anim.scrollView.set(fx.prop, fx.val);
  }
  _$jscoverage['/base.js'].lineData[308]++;
  function reflow(v, e) {
    _$jscoverage['/base.js'].functionData[22]++;
    _$jscoverage['/base.js'].lineData[309]++;
    var self = this, $contentEl = self.$contentEl;
    _$jscoverage['/base.js'].lineData[317]++;
    var scrollHeight = v.scrollHeight, scrollWidth = v.scrollWidth;
    _$jscoverage['/base.js'].lineData[320]++;
    var clientHeight = v.clientHeight, allowScroll, clientWidth = v.clientWidth;
    _$jscoverage['/base.js'].lineData[324]++;
    var prevVal = visit52_324_1(visit53_324_2(e && e.prevVal) || {});
    _$jscoverage['/base.js'].lineData[326]++;
    if (visit54_326_1(visit55_326_2(prevVal.scrollHeight === scrollHeight) && visit56_327_1(visit57_327_2(prevVal.scrollWidth === scrollWidth) && visit58_328_1(visit59_328_2(clientHeight === prevVal.clientHeight) && visit60_329_1(clientWidth === prevVal.clientWidth))))) {
      _$jscoverage['/base.js'].lineData[330]++;
      return;
    }
    _$jscoverage['/base.js'].lineData[333]++;
    self.scrollHeight = scrollHeight;
    _$jscoverage['/base.js'].lineData[334]++;
    self.scrollWidth = scrollWidth;
    _$jscoverage['/base.js'].lineData[335]++;
    self.clientHeight = clientHeight;
    _$jscoverage['/base.js'].lineData[336]++;
    self.clientWidth = clientWidth;
    _$jscoverage['/base.js'].lineData[338]++;
    allowScroll = self.allowScroll = {};
    _$jscoverage['/base.js'].lineData[340]++;
    if (visit61_340_1(scrollHeight > clientHeight)) {
      _$jscoverage['/base.js'].lineData[341]++;
      allowScroll.top = 1;
    }
    _$jscoverage['/base.js'].lineData[343]++;
    if (visit62_343_1(scrollWidth > clientWidth)) {
      _$jscoverage['/base.js'].lineData[344]++;
      allowScroll.left = 1;
    }
    _$jscoverage['/base.js'].lineData[347]++;
    self.minScroll = {
  left: 0, 
  top: 0};
    _$jscoverage['/base.js'].lineData[352]++;
    var maxScrollLeft, maxScrollTop;
    _$jscoverage['/base.js'].lineData[355]++;
    self.maxScroll = {
  left: maxScrollLeft = scrollWidth - clientWidth, 
  top: maxScrollTop = scrollHeight - clientHeight};
    _$jscoverage['/base.js'].lineData[360]++;
    delete self.scrollStep;
    _$jscoverage['/base.js'].lineData[362]++;
    var snap = self.get('snap'), scrollLeft = self.get('scrollLeft'), scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[366]++;
    if (visit63_366_1(snap)) {
      _$jscoverage['/base.js'].lineData[367]++;
      var elOffset = $contentEl.offset();
      _$jscoverage['/base.js'].lineData[368]++;
      var pages = self.pages = visit64_368_1(typeof snap === 'string') ? $contentEl.all(snap) : $contentEl.children(), pageIndex = self.get('pageIndex'), pagesOffset = self.pagesOffset = [];
      _$jscoverage['/base.js'].lineData[373]++;
      pages.each(function(p, i) {
  _$jscoverage['/base.js'].functionData[23]++;
  _$jscoverage['/base.js'].lineData[374]++;
  var offset = p.offset(), left = offset.left - elOffset.left, top = offset.top - elOffset.top;
  _$jscoverage['/base.js'].lineData[377]++;
  if (visit65_377_1(visit66_377_2(left <= maxScrollLeft) && visit67_377_3(top <= maxScrollTop))) {
    _$jscoverage['/base.js'].lineData[378]++;
    pagesOffset[i] = {
  left: left, 
  top: top, 
  index: i};
  }
});
      _$jscoverage['/base.js'].lineData[385]++;
      if (visit68_385_1(pageIndex)) {
        _$jscoverage['/base.js'].lineData[386]++;
        self.scrollToPage(pageIndex);
        _$jscoverage['/base.js'].lineData[387]++;
        return;
      }
    }
    _$jscoverage['/base.js'].lineData[392]++;
    self.scrollToWithBounds({
  left: scrollLeft, 
  top: scrollTop});
    _$jscoverage['/base.js'].lineData[397]++;
    self.fire('reflow', v);
  }
  _$jscoverage['/base.js'].lineData[406]++;
  return Container.extend([ContentBox], methods, {
  ATTRS: {
  scrollLeft: {
  render: 1, 
  value: 0}, 
  scrollTop: {
  render: 1, 
  value: 0}, 
  dimension: {}, 
  focusable: {
  value: true}, 
  allowTextSelection: {
  value: true}, 
  handleGestureEvents: {
  value: false}, 
  snap: {
  value: false}, 
  pageIndex: {
  value: 0}}, 
  xclass: 'scroll-view'});
});
