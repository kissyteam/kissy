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
  _$jscoverage['/compiler.js'].lineData[101] = 0;
  _$jscoverage['/compiler.js'].lineData[102] = 0;
  _$jscoverage['/compiler.js'].lineData[103] = 0;
  _$jscoverage['/compiler.js'].lineData[104] = 0;
  _$jscoverage['/compiler.js'].lineData[107] = 0;
  _$jscoverage['/compiler.js'].lineData[108] = 0;
  _$jscoverage['/compiler.js'].lineData[109] = 0;
  _$jscoverage['/compiler.js'].lineData[110] = 0;
  _$jscoverage['/compiler.js'].lineData[111] = 0;
  _$jscoverage['/compiler.js'].lineData[112] = 0;
  _$jscoverage['/compiler.js'].lineData[113] = 0;
  _$jscoverage['/compiler.js'].lineData[114] = 0;
  _$jscoverage['/compiler.js'].lineData[115] = 0;
  _$jscoverage['/compiler.js'].lineData[118] = 0;
  _$jscoverage['/compiler.js'].lineData[121] = 0;
  _$jscoverage['/compiler.js'].lineData[123] = 0;
  _$jscoverage['/compiler.js'].lineData[127] = 0;
  _$jscoverage['/compiler.js'].lineData[128] = 0;
  _$jscoverage['/compiler.js'].lineData[129] = 0;
  _$jscoverage['/compiler.js'].lineData[130] = 0;
  _$jscoverage['/compiler.js'].lineData[131] = 0;
  _$jscoverage['/compiler.js'].lineData[132] = 0;
  _$jscoverage['/compiler.js'].lineData[135] = 0;
  _$jscoverage['/compiler.js'].lineData[136] = 0;
  _$jscoverage['/compiler.js'].lineData[139] = 0;
  _$jscoverage['/compiler.js'].lineData[140] = 0;
  _$jscoverage['/compiler.js'].lineData[141] = 0;
  _$jscoverage['/compiler.js'].lineData[147] = 0;
  _$jscoverage['/compiler.js'].lineData[151] = 0;
  _$jscoverage['/compiler.js'].lineData[154] = 0;
  _$jscoverage['/compiler.js'].lineData[155] = 0;
  _$jscoverage['/compiler.js'].lineData[156] = 0;
  _$jscoverage['/compiler.js'].lineData[157] = 0;
  _$jscoverage['/compiler.js'].lineData[160] = 0;
  _$jscoverage['/compiler.js'].lineData[161] = 0;
  _$jscoverage['/compiler.js'].lineData[167] = 0;
  _$jscoverage['/compiler.js'].lineData[168] = 0;
  _$jscoverage['/compiler.js'].lineData[173] = 0;
  _$jscoverage['/compiler.js'].lineData[174] = 0;
  _$jscoverage['/compiler.js'].lineData[176] = 0;
  _$jscoverage['/compiler.js'].lineData[177] = 0;
  _$jscoverage['/compiler.js'].lineData[178] = 0;
  _$jscoverage['/compiler.js'].lineData[180] = 0;
  _$jscoverage['/compiler.js'].lineData[183] = 0;
  _$jscoverage['/compiler.js'].lineData[184] = 0;
  _$jscoverage['/compiler.js'].lineData[185] = 0;
  _$jscoverage['/compiler.js'].lineData[186] = 0;
  _$jscoverage['/compiler.js'].lineData[187] = 0;
  _$jscoverage['/compiler.js'].lineData[188] = 0;
  _$jscoverage['/compiler.js'].lineData[189] = 0;
  _$jscoverage['/compiler.js'].lineData[191] = 0;
  _$jscoverage['/compiler.js'].lineData[194] = 0;
  _$jscoverage['/compiler.js'].lineData[195] = 0;
  _$jscoverage['/compiler.js'].lineData[196] = 0;
  _$jscoverage['/compiler.js'].lineData[197] = 0;
  _$jscoverage['/compiler.js'].lineData[198] = 0;
  _$jscoverage['/compiler.js'].lineData[199] = 0;
  _$jscoverage['/compiler.js'].lineData[200] = 0;
  _$jscoverage['/compiler.js'].lineData[202] = 0;
  _$jscoverage['/compiler.js'].lineData[205] = 0;
  _$jscoverage['/compiler.js'].lineData[211] = 0;
  _$jscoverage['/compiler.js'].lineData[212] = 0;
  _$jscoverage['/compiler.js'].lineData[220] = 0;
  _$jscoverage['/compiler.js'].lineData[222] = 0;
  _$jscoverage['/compiler.js'].lineData[223] = 0;
  _$jscoverage['/compiler.js'].lineData[224] = 0;
  _$jscoverage['/compiler.js'].lineData[226] = 0;
  _$jscoverage['/compiler.js'].lineData[227] = 0;
  _$jscoverage['/compiler.js'].lineData[230] = 0;
  _$jscoverage['/compiler.js'].lineData[231] = 0;
  _$jscoverage['/compiler.js'].lineData[232] = 0;
  _$jscoverage['/compiler.js'].lineData[233] = 0;
  _$jscoverage['/compiler.js'].lineData[234] = 0;
  _$jscoverage['/compiler.js'].lineData[235] = 0;
  _$jscoverage['/compiler.js'].lineData[238] = 0;
  _$jscoverage['/compiler.js'].lineData[242] = 0;
  _$jscoverage['/compiler.js'].lineData[244] = 0;
  _$jscoverage['/compiler.js'].lineData[249] = 0;
  _$jscoverage['/compiler.js'].lineData[250] = 0;
  _$jscoverage['/compiler.js'].lineData[251] = 0;
  _$jscoverage['/compiler.js'].lineData[252] = 0;
  _$jscoverage['/compiler.js'].lineData[257] = 0;
  _$jscoverage['/compiler.js'].lineData[258] = 0;
  _$jscoverage['/compiler.js'].lineData[260] = 0;
  _$jscoverage['/compiler.js'].lineData[265] = 0;
  _$jscoverage['/compiler.js'].lineData[271] = 0;
  _$jscoverage['/compiler.js'].lineData[285] = 0;
  _$jscoverage['/compiler.js'].lineData[286] = 0;
  _$jscoverage['/compiler.js'].lineData[295] = 0;
  _$jscoverage['/compiler.js'].lineData[302] = 0;
  _$jscoverage['/compiler.js'].lineData[309] = 0;
  _$jscoverage['/compiler.js'].lineData[316] = 0;
  _$jscoverage['/compiler.js'].lineData[321] = 0;
  _$jscoverage['/compiler.js'].lineData[322] = 0;
  _$jscoverage['/compiler.js'].lineData[324] = 0;
  _$jscoverage['/compiler.js'].lineData[325] = 0;
  _$jscoverage['/compiler.js'].lineData[327] = 0;
  _$jscoverage['/compiler.js'].lineData[329] = 0;
  _$jscoverage['/compiler.js'].lineData[338] = 0;
  _$jscoverage['/compiler.js'].lineData[342] = 0;
  _$jscoverage['/compiler.js'].lineData[349] = 0;
  _$jscoverage['/compiler.js'].lineData[351] = 0;
  _$jscoverage['/compiler.js'].lineData[352] = 0;
  _$jscoverage['/compiler.js'].lineData[354] = 0;
  _$jscoverage['/compiler.js'].lineData[355] = 0;
  _$jscoverage['/compiler.js'].lineData[358] = 0;
  _$jscoverage['/compiler.js'].lineData[366] = 0;
  _$jscoverage['/compiler.js'].lineData[373] = 0;
  _$jscoverage['/compiler.js'].lineData[380] = 0;
  _$jscoverage['/compiler.js'].lineData[388] = 0;
  _$jscoverage['/compiler.js'].lineData[397] = 0;
  _$jscoverage['/compiler.js'].lineData[398] = 0;
  _$jscoverage['/compiler.js'].lineData[409] = 0;
  _$jscoverage['/compiler.js'].lineData[410] = 0;
  _$jscoverage['/compiler.js'].lineData[411] = 0;
  _$jscoverage['/compiler.js'].lineData[420] = 0;
  _$jscoverage['/compiler.js'].lineData[421] = 0;
  _$jscoverage['/compiler.js'].lineData[422] = 0;
  _$jscoverage['/compiler.js'].lineData[424] = 0;
  _$jscoverage['/compiler.js'].lineData[434] = 0;
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
  _$jscoverage['/compiler.js'].branchData['101'] = [];
  _$jscoverage['/compiler.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['102'] = [];
  _$jscoverage['/compiler.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['107'] = [];
  _$jscoverage['/compiler.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['109'] = [];
  _$jscoverage['/compiler.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['112'] = [];
  _$jscoverage['/compiler.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['130'] = [];
  _$jscoverage['/compiler.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['131'] = [];
  _$jscoverage['/compiler.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['155'] = [];
  _$jscoverage['/compiler.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['156'] = [];
  _$jscoverage['/compiler.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['176'] = [];
  _$jscoverage['/compiler.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['183'] = [];
  _$jscoverage['/compiler.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['194'] = [];
  _$jscoverage['/compiler.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['222'] = [];
  _$jscoverage['/compiler.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['230'] = [];
  _$jscoverage['/compiler.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['233'] = [];
  _$jscoverage['/compiler.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['242'] = [];
  _$jscoverage['/compiler.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['242'][2] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['242'][3] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['249'] = [];
  _$jscoverage['/compiler.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['251'] = [];
  _$jscoverage['/compiler.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['324'] = [];
  _$jscoverage['/compiler.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['354'] = [];
  _$jscoverage['/compiler.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['420'] = [];
  _$jscoverage['/compiler.js'].branchData['420'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['420'][1].init(20, 39, 'name || (\'xtemplate\' + (xtemplateId++))');
function visit77_420_1(result) {
  _$jscoverage['/compiler.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['354'][1].init(407, 20, 'expressionOrVariable');
function visit76_354_1(result) {
  _$jscoverage['/compiler.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['324'][1].init(370, 8, 'newParts');
function visit75_324_1(result) {
  _$jscoverage['/compiler.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['251'][1].init(1531, 5, 'block');
function visit74_251_1(result) {
  _$jscoverage['/compiler.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['249'][1].init(1362, 26, 'idString in nativeCommands');
function visit73_249_1(result) {
  _$jscoverage['/compiler.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['242'][3].init(1057, 21, 'idString === \'extend\'');
function visit72_242_3(result) {
  _$jscoverage['/compiler.js'].branchData['242'][3].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['242'][2].init(1031, 22, 'idString === \'include\'');
function visit71_242_2(result) {
  _$jscoverage['/compiler.js'].branchData['242'][2].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['242'][1].init(1031, 47, 'idString === \'include\' || idString === \'extend\'');
function visit70_242_1(result) {
  _$jscoverage['/compiler.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['233'][1].init(163, 19, 'programNode.inverse');
function visit69_233_1(result) {
  _$jscoverage['/compiler.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['230'][1].init(526, 5, 'block');
function visit68_230_1(result) {
  _$jscoverage['/compiler.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['222'][1].init(260, 17, 'commandConfigCode');
function visit67_222_1(result) {
  _$jscoverage['/compiler.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['194'][1].init(820, 4, 'hash');
function visit66_194_1(result) {
  _$jscoverage['/compiler.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['183'][1].init(345, 6, 'params');
function visit65_183_1(result) {
  _$jscoverage['/compiler.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['176'][1].init(164, 14, 'params || hash');
function visit64_176_1(result) {
  _$jscoverage['/compiler.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['156'][1].init(54, 7, 'i < len');
function visit63_156_1(result) {
  _$jscoverage['/compiler.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['155'][1].init(671, 10, 'statements');
function visit62_155_1(result) {
  _$jscoverage['/compiler.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['131'][1].init(54, 7, 'i < len');
function visit61_131_1(result) {
  _$jscoverage['/compiler.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['130'][1].init(90, 10, 'statements');
function visit60_130_1(result) {
  _$jscoverage['/compiler.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['112'][1].init(100, 10, 'idPartType');
function visit59_112_1(result) {
  _$jscoverage['/compiler.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['109'][1].init(71, 5, 'i < l');
function visit58_109_1(result) {
  _$jscoverage['/compiler.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['107'][1].init(336, 5, 'check');
function visit57_107_1(result) {
  _$jscoverage['/compiler.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['102'][1].init(17, 15, 'idParts[i].type');
function visit56_102_1(result) {
  _$jscoverage['/compiler.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['101'][1].init(201, 5, 'i < l');
function visit55_101_1(result) {
  _$jscoverage['/compiler.js'].branchData['101'][1].ranCondition(result);
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
    _$jscoverage['/compiler.js'].lineData[101]++;
    for (i = 0 , l = idParts.length; visit55_101_1(i < l); i++) {
      _$jscoverage['/compiler.js'].lineData[102]++;
      if (visit56_102_1(idParts[i].type)) {
        _$jscoverage['/compiler.js'].lineData[103]++;
        check = 1;
        _$jscoverage['/compiler.js'].lineData[104]++;
        break;
      }
    }
    _$jscoverage['/compiler.js'].lineData[107]++;
    if (visit57_107_1(check)) {
      _$jscoverage['/compiler.js'].lineData[108]++;
      var ret = [];
      _$jscoverage['/compiler.js'].lineData[109]++;
      for (i = 0 , l = idParts.length; visit58_109_1(i < l); i++) {
        _$jscoverage['/compiler.js'].lineData[110]++;
        idPart = idParts[i];
        _$jscoverage['/compiler.js'].lineData[111]++;
        idPartType = idPart.type;
        _$jscoverage['/compiler.js'].lineData[112]++;
        if (visit59_112_1(idPartType)) {
          _$jscoverage['/compiler.js'].lineData[113]++;
          nextIdNameCode = xtplAstToJs[idPartType](idPart);
          _$jscoverage['/compiler.js'].lineData[114]++;
          pushToArray(source, nextIdNameCode.source);
          _$jscoverage['/compiler.js'].lineData[115]++;
          ret.push(nextIdNameCode.exp);
        } else {
          _$jscoverage['/compiler.js'].lineData[118]++;
          ret.push('"' + idPart + '"');
        }
      }
      _$jscoverage['/compiler.js'].lineData[121]++;
      return ret;
    } else {
      _$jscoverage['/compiler.js'].lineData[123]++;
      return null;
    }
  }
  _$jscoverage['/compiler.js'].lineData[127]++;
  function genFunction(statements) {
    _$jscoverage['/compiler.js'].functionData[8]++;
    _$jscoverage['/compiler.js'].lineData[128]++;
    var source = [];
    _$jscoverage['/compiler.js'].lineData[129]++;
    source.push('function(scope, buffer) {\n');
    _$jscoverage['/compiler.js'].lineData[130]++;
    if (visit60_130_1(statements)) {
      _$jscoverage['/compiler.js'].lineData[131]++;
      for (var i = 0, len = statements.length; visit61_131_1(i < len); i++) {
        _$jscoverage['/compiler.js'].lineData[132]++;
        pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
      }
    }
    _$jscoverage['/compiler.js'].lineData[135]++;
    source.push('\n return buffer; }');
    _$jscoverage['/compiler.js'].lineData[136]++;
    return source;
  }
  _$jscoverage['/compiler.js'].lineData[139]++;
  function genTopFunction(statements) {
    _$jscoverage['/compiler.js'].functionData[9]++;
    _$jscoverage['/compiler.js'].lineData[140]++;
    var source = [];
    _$jscoverage['/compiler.js'].lineData[141]++;
    source.push('var engine = this,' + 'moduleWrap,' + 'nativeCommands = engine.nativeCommands,' + 'utils = engine.utils;');
    _$jscoverage['/compiler.js'].lineData[147]++;
    source.push('if("' + S.version + '" !== S.version){' + 'throw new Error("current xtemplate file("+engine.name+")(v' + S.version + ') ' + 'need to be recompiled using current kissy(v"+ S.version+")!");' + '}');
    _$jscoverage['/compiler.js'].lineData[151]++;
    source.push('if (typeof module !== "undefined" && module.kissy) {' + 'moduleWrap = module;' + '}');
    _$jscoverage['/compiler.js'].lineData[154]++;
    source.push('var ' + nativeCode + ';');
    _$jscoverage['/compiler.js'].lineData[155]++;
    if (visit62_155_1(statements)) {
      _$jscoverage['/compiler.js'].lineData[156]++;
      for (var i = 0, len = statements.length; visit63_156_1(i < len); i++) {
        _$jscoverage['/compiler.js'].lineData[157]++;
        pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
      }
    }
    _$jscoverage['/compiler.js'].lineData[160]++;
    source.push('return buffer;');
    _$jscoverage['/compiler.js'].lineData[161]++;
    return {
  params: ['scope', 'S', 'buffer', 'payload', 'undefined'], 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[167]++;
  function genOptionFromCommand(command) {
    _$jscoverage['/compiler.js'].functionData[10]++;
    _$jscoverage['/compiler.js'].lineData[168]++;
    var source = [], optionName, params, hash;
    _$jscoverage['/compiler.js'].lineData[173]++;
    params = command.params;
    _$jscoverage['/compiler.js'].lineData[174]++;
    hash = command.hash;
    _$jscoverage['/compiler.js'].lineData[176]++;
    if (visit64_176_1(params || hash)) {
      _$jscoverage['/compiler.js'].lineData[177]++;
      optionName = guid('option');
      _$jscoverage['/compiler.js'].lineData[178]++;
      source.push('var ' + optionName + ' = {};');
    } else {
      _$jscoverage['/compiler.js'].lineData[180]++;
      return null;
    }
    _$jscoverage['/compiler.js'].lineData[183]++;
    if (visit65_183_1(params)) {
      _$jscoverage['/compiler.js'].lineData[184]++;
      var paramsName = guid('params');
      _$jscoverage['/compiler.js'].lineData[185]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/compiler.js'].lineData[186]++;
      S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[187]++;
  var nextIdNameCode = xtplAstToJs[param.type](param);
  _$jscoverage['/compiler.js'].lineData[188]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/compiler.js'].lineData[189]++;
  source.push(paramsName + '.push(' + nextIdNameCode.exp + ');');
});
      _$jscoverage['/compiler.js'].lineData[191]++;
      source.push(optionName + '.params=' + paramsName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[194]++;
    if (visit66_194_1(hash)) {
      _$jscoverage['/compiler.js'].lineData[195]++;
      var hashName = guid('hash');
      _$jscoverage['/compiler.js'].lineData[196]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/compiler.js'].lineData[197]++;
      S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[198]++;
  var nextIdNameCode = xtplAstToJs[v.type](v);
  _$jscoverage['/compiler.js'].lineData[199]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/compiler.js'].lineData[200]++;
  source.push(hashName + '["' + key + '"] = ' + nextIdNameCode.exp + ';');
});
      _$jscoverage['/compiler.js'].lineData[202]++;
      source.push(optionName + '.hash=' + hashName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[205]++;
    return {
  exp: optionName, 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[211]++;
  function generateCommand(command, escape, block) {
    _$jscoverage['/compiler.js'].functionData[13]++;
    _$jscoverage['/compiler.js'].lineData[212]++;
    var source = [], commandConfigCode, optionName, id = command.id, idName, idString = id.string, inverseFn;
    _$jscoverage['/compiler.js'].lineData[220]++;
    commandConfigCode = genOptionFromCommand(command);
    _$jscoverage['/compiler.js'].lineData[222]++;
    if (visit67_222_1(commandConfigCode)) {
      _$jscoverage['/compiler.js'].lineData[223]++;
      optionName = commandConfigCode.exp;
      _$jscoverage['/compiler.js'].lineData[224]++;
      pushToArray(source, commandConfigCode.source);
    } else {
      _$jscoverage['/compiler.js'].lineData[226]++;
      optionName = guid('option');
      _$jscoverage['/compiler.js'].lineData[227]++;
      source.push('var ' + optionName + ' = {};');
    }
    _$jscoverage['/compiler.js'].lineData[230]++;
    if (visit68_230_1(block)) {
      _$jscoverage['/compiler.js'].lineData[231]++;
      var programNode = block.program;
      _$jscoverage['/compiler.js'].lineData[232]++;
      source.push(optionName + '.fn=' + genFunction(programNode.statements).join('\n') + ';');
      _$jscoverage['/compiler.js'].lineData[233]++;
      if (visit69_233_1(programNode.inverse)) {
        _$jscoverage['/compiler.js'].lineData[234]++;
        inverseFn = genFunction(programNode.inverse).join('\n');
        _$jscoverage['/compiler.js'].lineData[235]++;
        source.push(optionName + '.inverse=' + inverseFn + ';');
      }
    } else {
      _$jscoverage['/compiler.js'].lineData[238]++;
      source.push(optionName + '.escape = ' + !!escape + ';');
    }
    _$jscoverage['/compiler.js'].lineData[242]++;
    if (visit70_242_1(visit71_242_2(idString === 'include') || visit72_242_3(idString === 'extend'))) {
      _$jscoverage['/compiler.js'].lineData[244]++;
      source.push('if(moduleWrap) {re' + 'quire("' + command.params[0].value + '");' + optionName + '.params[0] = moduleWrap.resolveByName(' + optionName + '.params[0]);' + '}');
    }
    _$jscoverage['/compiler.js'].lineData[249]++;
    if (visit73_249_1(idString in nativeCommands)) {
      _$jscoverage['/compiler.js'].lineData[250]++;
      source.push('buffer = ' + idString + 'Command.call(engine, scope, ' + optionName + ', buffer, payload);');
    } else {
      _$jscoverage['/compiler.js'].lineData[251]++;
      if (visit74_251_1(block)) {
        _$jscoverage['/compiler.js'].lineData[252]++;
        source.push('buffer = callCommandUtil(engine, scope, ' + optionName + ', buffer, ' + '"' + idString + '", ' + idString.lineNumber + ');');
      } else {
        _$jscoverage['/compiler.js'].lineData[257]++;
        idName = guid('commandRet');
        _$jscoverage['/compiler.js'].lineData[258]++;
        source.push('var ' + idName + ' = callCommandUtil(engine, scope, ' + optionName + ', buffer, ' + '"' + idString + '", ' + idString.lineNumber + ');');
        _$jscoverage['/compiler.js'].lineData[260]++;
        source.push('if(' + idName + ' && ' + idName + '.isBuffer){' + 'buffer = ' + idName + ';' + idName + ' = undefined;' + '}');
      }
    }
    _$jscoverage['/compiler.js'].lineData[265]++;
    return {
  exp: idName, 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[271]++;
  var xtplAstToJs = {
  'conditionalOrExpression': opExpression, 
  'conditionalAndExpression': opExpression, 
  'relationalExpression': opExpression, 
  'equalityExpression': opExpression, 
  'additiveExpression': opExpression, 
  'multiplicativeExpression': opExpression, 
  'unaryExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[285]++;
  var code = xtplAstToJs[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[286]++;
  return {
  exp: e.unaryType + '(' + code.exp + ')', 
  source: code.source};
}, 
  'string': function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[295]++;
  return {
  exp: "'" + escapeString(e.value, true) + "'", 
  source: []};
}, 
  'number': function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[302]++;
  return {
  exp: e.value, 
  source: []};
}, 
  'boolean': function(e) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[309]++;
  return {
  exp: e.value, 
  source: []};
}, 
  'id': function(idNode) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[316]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id');
  _$jscoverage['/compiler.js'].lineData[321]++;
  var newParts = getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[322]++;
  var depthParam = depth ? (',' + depth) : '';
  _$jscoverage['/compiler.js'].lineData[324]++;
  if (visit75_324_1(newParts)) {
    _$jscoverage['/compiler.js'].lineData[325]++;
    source.push('var ' + idName + ' = scope.resolve([' + newParts.join(',') + ']' + depthParam + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[327]++;
    source.push('var ' + idName + ' = scope.resolve(["' + idParts.join('","') + '"]' + depthParam + ');');
  }
  _$jscoverage['/compiler.js'].lineData[329]++;
  return {
  exp: idName, 
  source: source};
}, 
  'command': generateCommand, 
  'blockStatement': function(block) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[338]++;
  return generateCommand(block.command, false, block);
}, 
  'expressionStatement': function(expressionStatement) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[342]++;
  var source = [], escape = expressionStatement.escape, code, expression = expressionStatement.value, type = expression.type, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[349]++;
  code = xtplAstToJs[type](expression, escape);
  _$jscoverage['/compiler.js'].lineData[351]++;
  pushToArray(source, code.source);
  _$jscoverage['/compiler.js'].lineData[352]++;
  expressionOrVariable = code.exp;
  _$jscoverage['/compiler.js'].lineData[354]++;
  if (visit76_354_1(expressionOrVariable)) {
    _$jscoverage['/compiler.js'].lineData[355]++;
    source.push('buffer.write(' + expressionOrVariable + ',' + !!escape + ');');
  }
  _$jscoverage['/compiler.js'].lineData[358]++;
  return {
  exp: '', 
  source: source};
}, 
  'contentStatement': function(contentStatement) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[366]++;
  return {
  exp: '', 
  source: ["buffer.write('" + escapeString(contentStatement.value, 0) + "');"]};
}};
  _$jscoverage['/compiler.js'].lineData[373]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[380]++;
  compiler = {
  parse: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[388]++;
  return parser.parse(name, tpl);
}, 
  compileToStr: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[397]++;
  var func = compiler.compile(tpl, name);
  _$jscoverage['/compiler.js'].lineData[398]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[409]++;
  var root = compiler.parse(name, tpl);
  _$jscoverage['/compiler.js'].lineData[410]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[411]++;
  return genTopFunction(root.statements);
}, 
  compileToFn: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[420]++;
  name = visit77_420_1(name || ('xtemplate' + (xtemplateId++)));
  _$jscoverage['/compiler.js'].lineData[421]++;
  var code = compiler.compile(tpl, name);
  _$jscoverage['/compiler.js'].lineData[422]++;
  var sourceURL = 'sourceURL=' + name + '.js';
  _$jscoverage['/compiler.js'].lineData[424]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
  _$jscoverage['/compiler.js'].lineData[434]++;
  return compiler;
});
