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
if (! _$jscoverage['/html-parser/nodes/tag.js']) {
  _$jscoverage['/html-parser/nodes/tag.js'] = {};
  _$jscoverage['/html-parser/nodes/tag.js'].lineData = [];
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[28] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[30] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[31] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[32] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[34] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[41] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[60] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[64] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[66] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[75] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[78] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[80] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[81] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[82] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[84] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[88] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[91] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[93] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[95] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[97] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[101] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[124] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[126] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[142] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[160] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[161] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[173] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[174] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[186] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[188] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[196] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[197] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[201] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[203] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[204] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[208] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[209] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[214] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[215] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[217] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[222] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[223] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[225] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[233] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[234] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[235] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[236] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[237] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[239] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[240] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[241] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[243] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[253] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[259] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[260] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[261] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[264] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[265] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[268] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[270] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[271] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[274] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[276] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[278] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[279] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[283] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[284] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[288] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[289] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[290] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[294] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[295] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[296] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[300] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[303] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[304] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[305] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[306] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[307] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[309] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[310] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[312] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[314] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[315] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[318] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[322] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[324] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[325] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[327] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[337] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[340] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[341] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[347] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[348] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[349] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[350] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[351] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[355] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[358] = 0;
}
if (! _$jscoverage['/html-parser/nodes/tag.js'].functionData) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData = [];
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[9] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[10] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[11] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[12] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[13] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[14] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[15] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[16] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[17] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[18] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[19] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[20] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[21] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[22] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[23] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[24] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[25] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[26] = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[27] = 0;
}
if (! _$jscoverage['/html-parser/nodes/tag.js'].branchData) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData = {};
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['33'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['36'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['44'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['53'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['55'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['60'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['74'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['78'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['79'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['94'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['125'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['134'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['137'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['140'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['141'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['188'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['209'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['214'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['223'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['234'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['259'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['268'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['270'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['278'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['283'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['288'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['294'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['304'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['307'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['309'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['314'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['324'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['348'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['349'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['350'] = [];
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['350'][1] = new BranchData();
}
_$jscoverage['/html-parser/nodes/tag.js'].branchData['350'][1].init(21, 27, 'attributes[i].name === name');
function visit233_350_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['349'][1].init(29, 21, 'i < attributes.length');
function visit232_349_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['348'][1].init(13, 31, 'attributes && attributes.length');
function visit231_348_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['324'][1].init(2094, 16, '!el.isSelfClosed');
function visit230_324_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['314'][1].init(300, 38, 'filter.onAttribute(attr, el) === false');
function visit229_314_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['309'][1].init(74, 50, '!(attrName = filter.onAttributeName(attrName, el))');
function visit228_309_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['307'][1].init(101, 6, 'filter');
function visit227_307_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['304'][1].init(1392, 21, 'i < attributes.length');
function visit226_304_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['294'][1].init(698, 11, '!el.tagName');
function visit225_294_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['288'][1].init(505, 17, 'el.nodeType !== 1');
function visit224_288_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['283'][1].init(379, 3, 'tmp');
function visit223_283_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['278'][1].init(267, 13, 'tmp === false');
function visit222_278_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['270'][1].init(78, 38, '!(tagName = filter.onTagName(tagName))');
function visit221_270_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['268'][1].init(415, 6, 'filter');
function visit220_268_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['259'][1].init(171, 22, 'tagName === \'!doctype\'');
function visit219_259_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['234'][1].init(46, 24, '!self.isChildrenFiltered');
function visit218_234_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['223'][1].init(84, 4, 'attr');
function visit217_223_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['214'][1].init(84, 4, 'attr');
function visit216_214_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['209'][1].init(87, 18, 'attr && attr.value');
function visit215_209_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['188'][1].init(119, 28, 'index === silbing.length - 1');
function visit214_188_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['141'][1].init(21, 45, '!this.attributes[i].equals(tag.attributes[i])');
function visit213_141_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['140'][1].init(325, 26, 'i < this.attributes.length');
function visit212_140_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['137'][1].init(205, 48, 'this.attributes.length !== tag.attributes.length');
function visit211_137_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['134'][1].init(115, 30, 'this.nodeType !== tag.nodeType');
function visit210_134_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][2].init(25, 30, 'this.nodeName !== tag.nodeName');
function visit209_131_2(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][1].init(17, 38, '!tag || this.nodeName !== tag.nodeName');
function visit208_131_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['125'][1].init(92, 1, 'v');
function visit207_125_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['94'][1].init(177, 18, '!self.isSelfClosed');
function visit206_94_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['79'][1].init(29, 16, 'i < c.length - 1');
function visit205_79_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['78'][1].init(251, 12, 'c.length > 1');
function visit204_78_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['74'][1].init(120, 13, 'c.length >= 1');
function visit203_74_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['60'][1].init(816, 30, 'self.isSelfClosed || lastSlash');
function visit202_60_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['55'][1].init(664, 9, 'lastSlash');
function visit201_55_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['53'][1].init(80, 37, 'lastAttr && /\\/$/.test(lastAttr.name)');
function visit200_53_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['44'][1].init(176, 13, 'attributes[0]');
function visit199_44_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['36'][1].init(204, 24, 'typeof page === \'string\'');
function visit198_36_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].branchData['33'][1].init(146, 16, 'attributes || []');
function visit197_33_1(result) {
  _$jscoverage['/html-parser/nodes/tag.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/nodes/tag.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[0]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[7]++;
  var Node = require('./node');
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[8]++;
  var Attribute = require('./attribute');
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[9]++;
  var Dtd = require('../dtd');
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[11]++;
  function createTag(self, tagName, attrs) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[1]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[12]++;
    self.nodeName = self.tagName = tagName.toLowerCase();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[13]++;
    self._updateSelfClosed();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[14]++;
    S.each(attrs, function(v, n) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[2]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[15]++;
  self.setAttribute(n, v);
});
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[27]++;
  function Tag(page, startPosition, endPosition, attributes) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[3]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[28]++;
    var self = this;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[30]++;
    self.childNodes = [];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[31]++;
    self.firstChild = null;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[32]++;
    self.lastChild = null;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[33]++;
    self.attributes = visit197_33_1(attributes || []);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[34]++;
    self.nodeType = 1;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[36]++;
    if (visit198_36_1(typeof page === 'string')) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[37]++;
      createTag.apply(null, [self].concat(S.makeArray(arguments)));
    } else {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[39]++;
      Tag.superclass.constructor.apply(self, arguments);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[41]++;
      attributes = self.attributes;
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[44]++;
      if (visit199_44_1(attributes[0])) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[45]++;
        self.nodeName = attributes[0].name.toLowerCase();
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[47]++;
        self.tagName = self.nodeName.replace(/\//, '');
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[48]++;
        self._updateSelfClosed();
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[49]++;
        attributes.splice(0, 1);
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[52]++;
      var lastAttr = attributes[attributes.length - 1], lastSlash = !!(visit200_53_1(lastAttr && /\/$/.test(lastAttr.name)));
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[55]++;
      if (visit201_55_1(lastSlash)) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[56]++;
        attributes.length = attributes.length - 1;
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[60]++;
      self.isSelfClosed = visit202_60_1(self.isSelfClosed || lastSlash);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[64]++;
      self.closed = self.isSelfClosed;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[66]++;
    self.closedStartPosition = -1;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[67]++;
    self.closedEndPosition = -1;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[70]++;
  function refreshChildNodes(self) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[4]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[71]++;
    var c = self.childNodes;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[72]++;
    self.firstChild = c[0];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[73]++;
    self.lastChild = c[c.length - 1];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[74]++;
    if (visit203_74_1(c.length >= 1)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[75]++;
      c[0].nextSibling = c[0].nextSibling = null;
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[76]++;
      c[0].parentNode = self;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[78]++;
    if (visit204_78_1(c.length > 1)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[79]++;
      for (var i = 0; visit205_79_1(i < c.length - 1); i++) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[80]++;
        c[i].nextSibling = c[i + 1];
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[81]++;
        c[i + 1].previousSibling = c[i];
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[82]++;
        c[i + 1].parentNode = self;
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[84]++;
      c[c.length - 1].nextSibling = null;
    }
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[88]++;
  S.extend(Tag, Node, {
  _updateSelfClosed: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[5]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[91]++;
  var self = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[93]++;
  self.isSelfClosed = !!(Dtd.$empty[self.nodeName]);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[94]++;
  if (visit206_94_1(!self.isSelfClosed)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[95]++;
    self.isSelfClosed = /\/$/.test(self.nodeName);
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[97]++;
  self.closed = self.isSelfClosed;
}, 
  clone: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[6]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[101]++;
  var ret = new Tag(), attrs = [];
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[103]++;
  S.each(this.attributes, function(a) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[7]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[104]++;
  attrs.push(a.clone());
});
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[106]++;
  S.mix(ret, {
  childNodes: [], 
  firstChild: null, 
  lastChild: null, 
  attributes: attrs, 
  nodeType: this.nodeType, 
  nodeName: this.nodeName, 
  tagName: this.tagName, 
  isSelfClosed: this.isSelfClosed, 
  closed: this.closed, 
  closedStartPosition: this.closedStartPosition, 
  closedEndPosition: this.closedEndPosition});
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[119]++;
  return ret;
}, 
  setTagName: function(v) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[8]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[123]++;
  var self = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[124]++;
  self.nodeName = self.tagName = v;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[125]++;
  if (visit207_125_1(v)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[126]++;
    self._updateSelfClosed();
  }
}, 
  equals: function(tag) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[9]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[131]++;
  if (visit208_131_1(!tag || visit209_131_2(this.nodeName !== tag.nodeName))) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[132]++;
    return 0;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[134]++;
  if (visit210_134_1(this.nodeType !== tag.nodeType)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[135]++;
    return 0;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[137]++;
  if (visit211_137_1(this.attributes.length !== tag.attributes.length)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[138]++;
    return 0;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[140]++;
  for (var i = 0; visit212_140_1(i < this.attributes.length); i++) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[141]++;
    if (visit213_141_1(!this.attributes[i].equals(tag.attributes[i]))) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[142]++;
      return 0;
    }
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[145]++;
  return 1;
}, 
  isEndTag: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[10]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[149]++;
  return (/^\//).test(this.nodeName);
}, 
  appendChild: function(node) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[11]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[153]++;
  this.childNodes.push(node);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[154]++;
  refreshChildNodes(this);
}, 
  replace: function(ref) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[12]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[158]++;
  var silbing = ref.parentNode.childNodes, index = S.indexOf(ref, silbing);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[160]++;
  silbing[index] = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[161]++;
  refreshChildNodes(ref.parentNode);
}, 
  replaceChild: function(newC, refC) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[13]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[165]++;
  var self = this, childNodes = self.childNodes;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[167]++;
  var index = S.indexOf(refC, childNodes);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[168]++;
  childNodes[index] = newC;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[169]++;
  refreshChildNodes(self);
}, 
  prepend: function(node) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[14]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[173]++;
  this.childNodes.unshift(node);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[174]++;
  refreshChildNodes(this);
}, 
  insertBefore: function(ref) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[15]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[178]++;
  var silbing = ref.parentNode.childNodes, index = S.indexOf(ref, silbing);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[180]++;
  silbing.splice(index, 0, this);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[181]++;
  refreshChildNodes(ref.parentNode);
}, 
  insertAfter: function(ref) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[16]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[186]++;
  var silbing = ref.parentNode.childNodes, index = S.indexOf(ref, silbing);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[188]++;
  if (visit214_188_1(index === silbing.length - 1)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[189]++;
    ref.parentNode.appendChild(this);
  } else {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[191]++;
    this.insertBefore(ref.parentNode.childNodes[[index + 1]]);
  }
}, 
  empty: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[17]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[196]++;
  this.childNodes = [];
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[197]++;
  refreshChildNodes(this);
}, 
  removeChild: function(node) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[18]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[201]++;
  var silbing = node.parentNode.childNodes, index = S.indexOf(node, silbing);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[203]++;
  silbing.splice(index, 1);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[204]++;
  refreshChildNodes(node.parentNode);
}, 
  getAttribute: function(name) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[19]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[208]++;
  var attr = findAttributeByName(this.attributes, name);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[209]++;
  return visit215_209_1(attr && attr.value);
}, 
  setAttribute: function(name, value) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[20]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[213]++;
  var attr = findAttributeByName(this.attributes, name);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[214]++;
  if (visit216_214_1(attr)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[215]++;
    attr.value = value;
  } else {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[217]++;
    this.attributes.push(new Attribute(name, '=', value, '"'));
  }
}, 
  removeAttribute: function(name) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[21]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[222]++;
  var attr = findAttributeByName(this.attributes, name);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[223]++;
  if (visit217_223_1(attr)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[224]++;
    var index = S.indexOf(attr, this.attributes);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[225]++;
    this.attributes.splice(index, 1);
  }
}, 
  filterChildren: function() {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[22]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[233]++;
  var self = this;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[234]++;
  if (visit218_234_1(!self.isChildrenFiltered)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[235]++;
    var writer = new (S.require('html-parser/writer/basic'))();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[236]++;
    self._writeChildrenHTML(writer);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[237]++;
    var parser = new (S.require('html-parser/parser'))(writer.getHtml()), children = parser.parse().childNodes;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[239]++;
    self.empty();
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[240]++;
    S.each(children, function(c) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[23]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[241]++;
  self.appendChild(c);
});
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[243]++;
    self.isChildrenFiltered = 1;
  }
}, 
  writeHtml: function(writer, filter) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[24]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[253]++;
  var el = this, tmp, attrName, tagName = el.tagName;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[259]++;
  if (visit219_259_1(tagName === '!doctype')) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[260]++;
    writer.append(this.toHtml() + '\n');
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[261]++;
    return;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[264]++;
  el.__filter = filter;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[265]++;
  el.isChildrenFiltered = 0;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[268]++;
  if (visit220_268_1(filter)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[270]++;
    if (visit221_270_1(!(tagName = filter.onTagName(tagName)))) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[271]++;
      return;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[274]++;
    el.tagName = tagName;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[276]++;
    tmp = filter.onTag(el);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[278]++;
    if (visit222_278_1(tmp === false)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[279]++;
      return;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[283]++;
    if (visit223_283_1(tmp)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[284]++;
      el = tmp;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[288]++;
    if (visit224_288_1(el.nodeType !== 1)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[289]++;
      el.writeHtml(writer, filter);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[290]++;
      return;
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[294]++;
    if (visit225_294_1(!el.tagName)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[295]++;
      el._writeChildrenHTML(writer);
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[296]++;
      return;
    }
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[300]++;
  writer.openTag(el);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[303]++;
  var attributes = el.attributes;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[304]++;
  for (var i = 0; visit226_304_1(i < attributes.length); i++) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[305]++;
    var attr = attributes[i];
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[306]++;
    attrName = attr.name;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[307]++;
    if (visit227_307_1(filter)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[309]++;
      if (visit228_309_1(!(attrName = filter.onAttributeName(attrName, el)))) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[310]++;
        continue;
      }
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[312]++;
      attr.name = attrName;
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[314]++;
      if (visit229_314_1(filter.onAttribute(attr, el) === false)) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[315]++;
        continue;
      }
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[318]++;
    writer.attribute(attr, el);
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[322]++;
  writer.openTagClose(el);
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[324]++;
  if (visit230_324_1(!el.isSelfClosed)) {
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[325]++;
    el._writeChildrenHTML(writer);
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[327]++;
    writer.closeTag(el);
  }
}, 
  _writeChildrenHTML: function(writer) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[25]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[337]++;
  var self = this, filter = self.isChildrenFiltered ? 0 : self.__filter;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[340]++;
  S.each(self.childNodes, function(child) {
  _$jscoverage['/html-parser/nodes/tag.js'].functionData[26]++;
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[341]++;
  child.writeHtml(writer, filter);
});
}});
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[347]++;
  function findAttributeByName(attributes, name) {
    _$jscoverage['/html-parser/nodes/tag.js'].functionData[27]++;
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[348]++;
    if (visit231_348_1(attributes && attributes.length)) {
      _$jscoverage['/html-parser/nodes/tag.js'].lineData[349]++;
      for (var i = 0; visit232_349_1(i < attributes.length); i++) {
        _$jscoverage['/html-parser/nodes/tag.js'].lineData[350]++;
        if (visit233_350_1(attributes[i].name === name)) {
          _$jscoverage['/html-parser/nodes/tag.js'].lineData[351]++;
          return attributes[i];
        }
      }
    }
    _$jscoverage['/html-parser/nodes/tag.js'].lineData[355]++;
    return null;
  }
  _$jscoverage['/html-parser/nodes/tag.js'].lineData[358]++;
  return Tag;
});
