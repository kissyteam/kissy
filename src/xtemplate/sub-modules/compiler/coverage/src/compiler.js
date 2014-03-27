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
  _$jscoverage['/compiler.js'].lineData[15] = 0;
  _$jscoverage['/compiler.js'].lineData[17] = 0;
  _$jscoverage['/compiler.js'].lineData[18] = 0;
  _$jscoverage['/compiler.js'].lineData[21] = 0;
  _$jscoverage['/compiler.js'].lineData[22] = 0;
  _$jscoverage['/compiler.js'].lineData[27] = 0;
  _$jscoverage['/compiler.js'].lineData[29] = 0;
  _$jscoverage['/compiler.js'].lineData[35] = 0;
  _$jscoverage['/compiler.js'].lineData[36] = 0;
  _$jscoverage['/compiler.js'].lineData[39] = 0;
  _$jscoverage['/compiler.js'].lineData[40] = 0;
  _$jscoverage['/compiler.js'].lineData[42] = 0;
  _$jscoverage['/compiler.js'].lineData[43] = 0;
  _$jscoverage['/compiler.js'].lineData[45] = 0;
  _$jscoverage['/compiler.js'].lineData[49] = 0;
  _$jscoverage['/compiler.js'].lineData[50] = 0;
  _$jscoverage['/compiler.js'].lineData[51] = 0;
  _$jscoverage['/compiler.js'].lineData[54] = 0;
  _$jscoverage['/compiler.js'].lineData[57] = 0;
  _$jscoverage['/compiler.js'].lineData[60] = 0;
  _$jscoverage['/compiler.js'].lineData[63] = 0;
  _$jscoverage['/compiler.js'].lineData[64] = 0;
  _$jscoverage['/compiler.js'].lineData[67] = 0;
  _$jscoverage['/compiler.js'].lineData[68] = 0;
  _$jscoverage['/compiler.js'].lineData[76] = 0;
  _$jscoverage['/compiler.js'].lineData[77] = 0;
  _$jscoverage['/compiler.js'].lineData[78] = 0;
  _$jscoverage['/compiler.js'].lineData[79] = 0;
  _$jscoverage['/compiler.js'].lineData[80] = 0;
  _$jscoverage['/compiler.js'].lineData[81] = 0;
  _$jscoverage['/compiler.js'].lineData[82] = 0;
  _$jscoverage['/compiler.js'].lineData[83] = 0;
  _$jscoverage['/compiler.js'].lineData[84] = 0;
  _$jscoverage['/compiler.js'].lineData[85] = 0;
  _$jscoverage['/compiler.js'].lineData[86] = 0;
  _$jscoverage['/compiler.js'].lineData[87] = 0;
  _$jscoverage['/compiler.js'].lineData[89] = 0;
  _$jscoverage['/compiler.js'].lineData[90] = 0;
  _$jscoverage['/compiler.js'].lineData[92] = 0;
  _$jscoverage['/compiler.js'].lineData[99] = 0;
  _$jscoverage['/compiler.js'].lineData[100] = 0;
  _$jscoverage['/compiler.js'].lineData[101] = 0;
  _$jscoverage['/compiler.js'].lineData[103] = 0;
  _$jscoverage['/compiler.js'].lineData[106] = 0;
  _$jscoverage['/compiler.js'].lineData[107] = 0;
  _$jscoverage['/compiler.js'].lineData[108] = 0;
  _$jscoverage['/compiler.js'].lineData[109] = 0;
  _$jscoverage['/compiler.js'].lineData[112] = 0;
  _$jscoverage['/compiler.js'].lineData[113] = 0;
  _$jscoverage['/compiler.js'].lineData[114] = 0;
  _$jscoverage['/compiler.js'].lineData[115] = 0;
  _$jscoverage['/compiler.js'].lineData[116] = 0;
  _$jscoverage['/compiler.js'].lineData[117] = 0;
  _$jscoverage['/compiler.js'].lineData[118] = 0;
  _$jscoverage['/compiler.js'].lineData[119] = 0;
  _$jscoverage['/compiler.js'].lineData[120] = 0;
  _$jscoverage['/compiler.js'].lineData[123] = 0;
  _$jscoverage['/compiler.js'].lineData[126] = 0;
  _$jscoverage['/compiler.js'].lineData[128] = 0;
  _$jscoverage['/compiler.js'].lineData[132] = 0;
  _$jscoverage['/compiler.js'].lineData[133] = 0;
  _$jscoverage['/compiler.js'].lineData[134] = 0;
  _$jscoverage['/compiler.js'].lineData[135] = 0;
  _$jscoverage['/compiler.js'].lineData[136] = 0;
  _$jscoverage['/compiler.js'].lineData[137] = 0;
  _$jscoverage['/compiler.js'].lineData[140] = 0;
  _$jscoverage['/compiler.js'].lineData[141] = 0;
  _$jscoverage['/compiler.js'].lineData[144] = 0;
  _$jscoverage['/compiler.js'].lineData[145] = 0;
  _$jscoverage['/compiler.js'].lineData[146] = 0;
  _$jscoverage['/compiler.js'].lineData[152] = 0;
  _$jscoverage['/compiler.js'].lineData[156] = 0;
  _$jscoverage['/compiler.js'].lineData[159] = 0;
  _$jscoverage['/compiler.js'].lineData[160] = 0;
  _$jscoverage['/compiler.js'].lineData[161] = 0;
  _$jscoverage['/compiler.js'].lineData[162] = 0;
  _$jscoverage['/compiler.js'].lineData[165] = 0;
  _$jscoverage['/compiler.js'].lineData[166] = 0;
  _$jscoverage['/compiler.js'].lineData[172] = 0;
  _$jscoverage['/compiler.js'].lineData[173] = 0;
  _$jscoverage['/compiler.js'].lineData[178] = 0;
  _$jscoverage['/compiler.js'].lineData[179] = 0;
  _$jscoverage['/compiler.js'].lineData[181] = 0;
  _$jscoverage['/compiler.js'].lineData[182] = 0;
  _$jscoverage['/compiler.js'].lineData[184] = 0;
  _$jscoverage['/compiler.js'].lineData[185] = 0;
  _$jscoverage['/compiler.js'].lineData[186] = 0;
  _$jscoverage['/compiler.js'].lineData[187] = 0;
  _$jscoverage['/compiler.js'].lineData[188] = 0;
  _$jscoverage['/compiler.js'].lineData[189] = 0;
  _$jscoverage['/compiler.js'].lineData[190] = 0;
  _$jscoverage['/compiler.js'].lineData[192] = 0;
  _$jscoverage['/compiler.js'].lineData[195] = 0;
  _$jscoverage['/compiler.js'].lineData[196] = 0;
  _$jscoverage['/compiler.js'].lineData[197] = 0;
  _$jscoverage['/compiler.js'].lineData[198] = 0;
  _$jscoverage['/compiler.js'].lineData[199] = 0;
  _$jscoverage['/compiler.js'].lineData[200] = 0;
  _$jscoverage['/compiler.js'].lineData[201] = 0;
  _$jscoverage['/compiler.js'].lineData[203] = 0;
  _$jscoverage['/compiler.js'].lineData[206] = 0;
  _$jscoverage['/compiler.js'].lineData[212] = 0;
  _$jscoverage['/compiler.js'].lineData[213] = 0;
  _$jscoverage['/compiler.js'].lineData[221] = 0;
  _$jscoverage['/compiler.js'].lineData[222] = 0;
  _$jscoverage['/compiler.js'].lineData[223] = 0;
  _$jscoverage['/compiler.js'].lineData[225] = 0;
  _$jscoverage['/compiler.js'].lineData[226] = 0;
  _$jscoverage['/compiler.js'].lineData[227] = 0;
  _$jscoverage['/compiler.js'].lineData[228] = 0;
  _$jscoverage['/compiler.js'].lineData[229] = 0;
  _$jscoverage['/compiler.js'].lineData[230] = 0;
  _$jscoverage['/compiler.js'].lineData[235] = 0;
  _$jscoverage['/compiler.js'].lineData[237] = 0;
  _$jscoverage['/compiler.js'].lineData[242] = 0;
  _$jscoverage['/compiler.js'].lineData[243] = 0;
  _$jscoverage['/compiler.js'].lineData[246] = 0;
  _$jscoverage['/compiler.js'].lineData[247] = 0;
  _$jscoverage['/compiler.js'].lineData[248] = 0;
  _$jscoverage['/compiler.js'].lineData[250] = 0;
  _$jscoverage['/compiler.js'].lineData[252] = 0;
  _$jscoverage['/compiler.js'].lineData[253] = 0;
  _$jscoverage['/compiler.js'].lineData[256] = 0;
  _$jscoverage['/compiler.js'].lineData[260] = 0;
  _$jscoverage['/compiler.js'].lineData[261] = 0;
  _$jscoverage['/compiler.js'].lineData[267] = 0;
  _$jscoverage['/compiler.js'].lineData[273] = 0;
  _$jscoverage['/compiler.js'].lineData[287] = 0;
  _$jscoverage['/compiler.js'].lineData[288] = 0;
  _$jscoverage['/compiler.js'].lineData[297] = 0;
  _$jscoverage['/compiler.js'].lineData[304] = 0;
  _$jscoverage['/compiler.js'].lineData[311] = 0;
  _$jscoverage['/compiler.js'].lineData[316] = 0;
  _$jscoverage['/compiler.js'].lineData[317] = 0;
  _$jscoverage['/compiler.js'].lineData[319] = 0;
  _$jscoverage['/compiler.js'].lineData[320] = 0;
  _$jscoverage['/compiler.js'].lineData[322] = 0;
  _$jscoverage['/compiler.js'].lineData[324] = 0;
  _$jscoverage['/compiler.js'].lineData[333] = 0;
  _$jscoverage['/compiler.js'].lineData[337] = 0;
  _$jscoverage['/compiler.js'].lineData[344] = 0;
  _$jscoverage['/compiler.js'].lineData[346] = 0;
  _$jscoverage['/compiler.js'].lineData[347] = 0;
  _$jscoverage['/compiler.js'].lineData[349] = 0;
  _$jscoverage['/compiler.js'].lineData[350] = 0;
  _$jscoverage['/compiler.js'].lineData[353] = 0;
  _$jscoverage['/compiler.js'].lineData[361] = 0;
  _$jscoverage['/compiler.js'].lineData[368] = 0;
  _$jscoverage['/compiler.js'].lineData[369] = 0;
  _$jscoverage['/compiler.js'].lineData[375] = 0;
  _$jscoverage['/compiler.js'].lineData[382] = 0;
  _$jscoverage['/compiler.js'].lineData[390] = 0;
  _$jscoverage['/compiler.js'].lineData[399] = 0;
  _$jscoverage['/compiler.js'].lineData[400] = 0;
  _$jscoverage['/compiler.js'].lineData[411] = 0;
  _$jscoverage['/compiler.js'].lineData[412] = 0;
  _$jscoverage['/compiler.js'].lineData[413] = 0;
  _$jscoverage['/compiler.js'].lineData[422] = 0;
  _$jscoverage['/compiler.js'].lineData[423] = 0;
  _$jscoverage['/compiler.js'].lineData[424] = 0;
  _$jscoverage['/compiler.js'].lineData[426] = 0;
  _$jscoverage['/compiler.js'].lineData[436] = 0;
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
  _$jscoverage['/compiler.js'].branchData['22'] = [];
  _$jscoverage['/compiler.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['42'] = [];
  _$jscoverage['/compiler.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['50'] = [];
  _$jscoverage['/compiler.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['83'] = [];
  _$jscoverage['/compiler.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['83'][3] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['84'] = [];
  _$jscoverage['/compiler.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['100'] = [];
  _$jscoverage['/compiler.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['106'] = [];
  _$jscoverage['/compiler.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['107'] = [];
  _$jscoverage['/compiler.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['112'] = [];
  _$jscoverage['/compiler.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['114'] = [];
  _$jscoverage['/compiler.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['117'] = [];
  _$jscoverage['/compiler.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['135'] = [];
  _$jscoverage['/compiler.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['136'] = [];
  _$jscoverage['/compiler.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['160'] = [];
  _$jscoverage['/compiler.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['161'] = [];
  _$jscoverage['/compiler.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['184'] = [];
  _$jscoverage['/compiler.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['195'] = [];
  _$jscoverage['/compiler.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['225'] = [];
  _$jscoverage['/compiler.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['228'] = [];
  _$jscoverage['/compiler.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['235'] = [];
  _$jscoverage['/compiler.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['235'][3] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['242'] = [];
  _$jscoverage['/compiler.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['246'] = [];
  _$jscoverage['/compiler.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['247'] = [];
  _$jscoverage['/compiler.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['252'] = [];
  _$jscoverage['/compiler.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['260'] = [];
  _$jscoverage['/compiler.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['319'] = [];
  _$jscoverage['/compiler.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['349'] = [];
  _$jscoverage['/compiler.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['422'] = [];
  _$jscoverage['/compiler.js'].branchData['422'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['422'][1].init(20, 39, 'name || (\'xtemplate\' + (xtemplateId++))');
function visit79_422_1(result) {
  _$jscoverage['/compiler.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['349'][1].init(407, 20, 'expressionOrVariable');
function visit78_349_1(result) {
  _$jscoverage['/compiler.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['319'][1].init(370, 8, 'newParts');
function visit77_319_1(result) {
  _$jscoverage['/compiler.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['260'][1].init(1981, 6, 'idName');
function visit76_260_1(result) {
  _$jscoverage['/compiler.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['252'][1].init(1599, 5, 'block');
function visit75_252_1(result) {
  _$jscoverage['/compiler.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['247'][1].init(17, 5, 'block');
function visit74_247_1(result) {
  _$jscoverage['/compiler.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['246'][1].init(1185, 26, 'idString in nativeCommands');
function visit73_246_1(result) {
  _$jscoverage['/compiler.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['242'][1].init(1111, 6, '!block');
function visit72_242_1(result) {
  _$jscoverage['/compiler.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['235'][3].init(812, 21, 'idString === \'extend\'');
function visit71_235_3(result) {
  _$jscoverage['/compiler.js'].branchData['235'][3].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['235'][2].init(786, 22, 'idString === \'include\'');
function visit70_235_2(result) {
  _$jscoverage['/compiler.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['235'][1].init(786, 47, 'idString === \'include\' || idString === \'extend\'');
function visit69_235_1(result) {
  _$jscoverage['/compiler.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['228'][1].init(163, 19, 'programNode.inverse');
function visit68_228_1(result) {
  _$jscoverage['/compiler.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['225'][1].init(367, 5, 'block');
function visit67_225_1(result) {
  _$jscoverage['/compiler.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['195'][1].init(764, 4, 'hash');
function visit66_195_1(result) {
  _$jscoverage['/compiler.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['184'][1].init(289, 6, 'params');
function visit65_184_1(result) {
  _$jscoverage['/compiler.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['161'][1].init(54, 7, 'i < len');
function visit64_161_1(result) {
  _$jscoverage['/compiler.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['160'][1].init(671, 10, 'statements');
function visit63_160_1(result) {
  _$jscoverage['/compiler.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['136'][1].init(54, 7, 'i < len');
function visit62_136_1(result) {
  _$jscoverage['/compiler.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['135'][1].init(90, 10, 'statements');
function visit61_135_1(result) {
  _$jscoverage['/compiler.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['117'][1].init(100, 10, 'idPartType');
function visit60_117_1(result) {
  _$jscoverage['/compiler.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['114'][1].init(71, 5, 'i < l');
function visit59_114_1(result) {
  _$jscoverage['/compiler.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['112'][1].init(336, 5, 'check');
function visit58_112_1(result) {
  _$jscoverage['/compiler.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['107'][1].init(17, 15, 'idParts[i].type');
function visit57_107_1(result) {
  _$jscoverage['/compiler.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['106'][1].init(201, 5, 'i < l');
function visit56_106_1(result) {
  _$jscoverage['/compiler.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['100'][1].init(13, 20, 'idParts.length === 1');
function visit55_100_1(result) {
  _$jscoverage['/compiler.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['84'][1].init(34, 13, 'type === \'&&\'');
function visit54_84_1(result) {
  _$jscoverage['/compiler.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['83'][3].init(527, 13, 'type === \'||\'');
function visit53_83_3(result) {
  _$jscoverage['/compiler.js'].branchData['83'][3].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['83'][2].init(510, 13, 'type === \'&&\'');
function visit52_83_2(result) {
  _$jscoverage['/compiler.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['83'][1].init(510, 30, 'type === \'&&\' || type === \'||\'');
function visit51_83_1(result) {
  _$jscoverage['/compiler.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['50'][1].init(13, 6, 'isCode');
function visit50_50_1(result) {
  _$jscoverage['/compiler.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['42'][1].init(87, 12, 'm.length % 2');
function visit49_42_1(result) {
  _$jscoverage['/compiler.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['22'][1].init(28, 27, 'S.indexOf(t, keywords) > -1');
function visit48_22_1(result) {
  _$jscoverage['/compiler.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/compiler.js'].functionData[0]++;
  _$jscoverage['/compiler.js'].lineData[7]++;
  require('util');
  _$jscoverage['/compiler.js'].lineData[8]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/compiler.js'].lineData[9]++;
  var parser = require('./compiler/parser');
  _$jscoverage['/compiler.js'].lineData[10]++;
  parser.yy = require('./compiler/ast');
  _$jscoverage['/compiler.js'].lineData[11]++;
  var nativeCode = '';
  _$jscoverage['/compiler.js'].lineData[12]++;
  var t;
  _$jscoverage['/compiler.js'].lineData[13]++;
  var keywords = ['if', 'with', 'debugger'];
  _$jscoverage['/compiler.js'].lineData[14]++;
  var nativeCommands = XTemplateRuntime.nativeCommands;
  _$jscoverage['/compiler.js'].lineData[15]++;
  var nativeUtils = XTemplateRuntime.utils;
  _$jscoverage['/compiler.js'].lineData[17]++;
  for (t in nativeUtils) {
    _$jscoverage['/compiler.js'].lineData[18]++;
    nativeCode += t + 'Util = utils.' + t + ',';
  }
  _$jscoverage['/compiler.js'].lineData[21]++;
  for (t in nativeCommands) {
    _$jscoverage['/compiler.js'].lineData[22]++;
    nativeCode += t + (visit48_22_1(S.indexOf(t, keywords) > -1) ? ('Command = nativeCommands["' + t + '"]') : ('Command = nativeCommands.' + t)) + ',';
  }
  _$jscoverage['/compiler.js'].lineData[27]++;
  nativeCode = nativeCode.slice(0, -1);
  _$jscoverage['/compiler.js'].lineData[29]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
  _$jscoverage['/compiler.js'].lineData[35]++;
  function guid(str) {
    _$jscoverage['/compiler.js'].functionData[1]++;
    _$jscoverage['/compiler.js'].lineData[36]++;
    return str + (variableId++);
  }
  _$jscoverage['/compiler.js'].lineData[39]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/compiler.js'].functionData[2]++;
    _$jscoverage['/compiler.js'].lineData[40]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/compiler.js'].functionData[3]++;
  _$jscoverage['/compiler.js'].lineData[42]++;
  if (visit49_42_1(m.length % 2)) {
    _$jscoverage['/compiler.js'].lineData[43]++;
    m = '\\' + m;
  }
  _$jscoverage['/compiler.js'].lineData[45]++;
  return m;
});
  }
  _$jscoverage['/compiler.js'].lineData[49]++;
  function escapeString(str, isCode) {
    _$jscoverage['/compiler.js'].functionData[4]++;
    _$jscoverage['/compiler.js'].lineData[50]++;
    if (visit50_50_1(isCode)) {
      _$jscoverage['/compiler.js'].lineData[51]++;
      str = escapeSingleQuoteInCodeString(str, 0);
    } else {
      _$jscoverage['/compiler.js'].lineData[54]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/compiler.js'].lineData[57]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/compiler.js'].lineData[60]++;
    return str;
  }
  _$jscoverage['/compiler.js'].lineData[63]++;
  function pushToArray(to, from) {
    _$jscoverage['/compiler.js'].functionData[5]++;
    _$jscoverage['/compiler.js'].lineData[64]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/compiler.js'].lineData[67]++;
  function opExpression(e) {
    _$jscoverage['/compiler.js'].functionData[6]++;
    _$jscoverage['/compiler.js'].lineData[68]++;
    var source = [], type = e.opType, exp1, exp2, code1Source, code2Source, code1 = xtplAstToJs[e.op1.type](e.op1), code2 = xtplAstToJs[e.op2.type](e.op2);
    _$jscoverage['/compiler.js'].lineData[76]++;
    exp1 = code1.exp;
    _$jscoverage['/compiler.js'].lineData[77]++;
    exp2 = code2.exp;
    _$jscoverage['/compiler.js'].lineData[78]++;
    var exp = guid('exp');
    _$jscoverage['/compiler.js'].lineData[79]++;
    code1Source = code1.source;
    _$jscoverage['/compiler.js'].lineData[80]++;
    code2Source = code2.source;
    _$jscoverage['/compiler.js'].lineData[81]++;
    pushToArray(source, code1Source);
    _$jscoverage['/compiler.js'].lineData[82]++;
    source.push('var ' + exp + ' = ' + exp1 + ';');
    _$jscoverage['/compiler.js'].lineData[83]++;
    if (visit51_83_1(visit52_83_2(type === '&&') || visit53_83_3(type === '||'))) {
      _$jscoverage['/compiler.js'].lineData[84]++;
      source.push('if(' + (visit54_84_1(type === '&&') ? '' : '!') + '(' + exp1 + ')){');
      _$jscoverage['/compiler.js'].lineData[85]++;
      pushToArray(source, code2Source);
      _$jscoverage['/compiler.js'].lineData[86]++;
      source.push(exp + ' = ' + exp2 + ';');
      _$jscoverage['/compiler.js'].lineData[87]++;
      source.push('}');
    } else {
      _$jscoverage['/compiler.js'].lineData[89]++;
      pushToArray(source, code2Source);
      _$jscoverage['/compiler.js'].lineData[90]++;
      source.push(exp + ' = ' + '(' + exp1 + ')' + type + '(' + exp2 + ');');
    }
    _$jscoverage['/compiler.js'].lineData[92]++;
    return {
  exp: exp, 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[99]++;
  function getIdStringFromIdParts(source, idParts) {
    _$jscoverage['/compiler.js'].functionData[7]++;
    _$jscoverage['/compiler.js'].lineData[100]++;
    if (visit55_100_1(idParts.length === 1)) {
      _$jscoverage['/compiler.js'].lineData[101]++;
      return null;
    }
    _$jscoverage['/compiler.js'].lineData[103]++;
    var i, l, idPart, idPartType, check = 0, nextIdNameCode;
    _$jscoverage['/compiler.js'].lineData[106]++;
    for (i = 0 , l = idParts.length; visit56_106_1(i < l); i++) {
      _$jscoverage['/compiler.js'].lineData[107]++;
      if (visit57_107_1(idParts[i].type)) {
        _$jscoverage['/compiler.js'].lineData[108]++;
        check = 1;
        _$jscoverage['/compiler.js'].lineData[109]++;
        break;
      }
    }
    _$jscoverage['/compiler.js'].lineData[112]++;
    if (visit58_112_1(check)) {
      _$jscoverage['/compiler.js'].lineData[113]++;
      var ret = [];
      _$jscoverage['/compiler.js'].lineData[114]++;
      for (i = 0 , l = idParts.length; visit59_114_1(i < l); i++) {
        _$jscoverage['/compiler.js'].lineData[115]++;
        idPart = idParts[i];
        _$jscoverage['/compiler.js'].lineData[116]++;
        idPartType = idPart.type;
        _$jscoverage['/compiler.js'].lineData[117]++;
        if (visit60_117_1(idPartType)) {
          _$jscoverage['/compiler.js'].lineData[118]++;
          nextIdNameCode = xtplAstToJs[idPartType](idPart);
          _$jscoverage['/compiler.js'].lineData[119]++;
          pushToArray(source, nextIdNameCode.source);
          _$jscoverage['/compiler.js'].lineData[120]++;
          ret.push(nextIdNameCode.exp);
        } else {
          _$jscoverage['/compiler.js'].lineData[123]++;
          ret.push('"' + idPart + '"');
        }
      }
      _$jscoverage['/compiler.js'].lineData[126]++;
      return ret;
    } else {
      _$jscoverage['/compiler.js'].lineData[128]++;
      return null;
    }
  }
  _$jscoverage['/compiler.js'].lineData[132]++;
  function genFunction(statements) {
    _$jscoverage['/compiler.js'].functionData[8]++;
    _$jscoverage['/compiler.js'].lineData[133]++;
    var source = [];
    _$jscoverage['/compiler.js'].lineData[134]++;
    source.push('function(scope, buffer) {\n');
    _$jscoverage['/compiler.js'].lineData[135]++;
    if (visit61_135_1(statements)) {
      _$jscoverage['/compiler.js'].lineData[136]++;
      for (var i = 0, len = statements.length; visit62_136_1(i < len); i++) {
        _$jscoverage['/compiler.js'].lineData[137]++;
        pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
      }
    }
    _$jscoverage['/compiler.js'].lineData[140]++;
    source.push('\n return buffer; }');
    _$jscoverage['/compiler.js'].lineData[141]++;
    return source;
  }
  _$jscoverage['/compiler.js'].lineData[144]++;
  function genTopFunction(statements) {
    _$jscoverage['/compiler.js'].functionData[9]++;
    _$jscoverage['/compiler.js'].lineData[145]++;
    var source = [];
    _$jscoverage['/compiler.js'].lineData[146]++;
    source.push('var engine = this,' + 'moduleWrap,' + 'nativeCommands = engine.nativeCommands,' + 'utils = engine.utils;');
    _$jscoverage['/compiler.js'].lineData[152]++;
    source.push('if("' + S.version + '" !== S.version){' + 'throw new Error("current xtemplate file("+engine.name+")(v' + S.version + ') ' + 'need to be recompiled using current kissy(v"+ S.version+")!");' + '}');
    _$jscoverage['/compiler.js'].lineData[156]++;
    source.push('if (typeof module !== "undefined" && module.kissy) {' + 'moduleWrap = module;' + '}');
    _$jscoverage['/compiler.js'].lineData[159]++;
    source.push('var ' + nativeCode + ';');
    _$jscoverage['/compiler.js'].lineData[160]++;
    if (visit63_160_1(statements)) {
      _$jscoverage['/compiler.js'].lineData[161]++;
      for (var i = 0, len = statements.length; visit64_161_1(i < len); i++) {
        _$jscoverage['/compiler.js'].lineData[162]++;
        pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
      }
    }
    _$jscoverage['/compiler.js'].lineData[165]++;
    source.push('return buffer;');
    _$jscoverage['/compiler.js'].lineData[166]++;
    return {
  params: ['scope', 'S', 'buffer', 'payload', 'undefined'], 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[172]++;
  function genOptionFromCommand(command, escape) {
    _$jscoverage['/compiler.js'].functionData[10]++;
    _$jscoverage['/compiler.js'].lineData[173]++;
    var source = [], optionName, params, hash;
    _$jscoverage['/compiler.js'].lineData[178]++;
    params = command.params;
    _$jscoverage['/compiler.js'].lineData[179]++;
    hash = command.hash;
    _$jscoverage['/compiler.js'].lineData[181]++;
    optionName = guid('option');
    _$jscoverage['/compiler.js'].lineData[182]++;
    source.push('var ' + optionName + ' = {' + (escape ? 'escape:1' : '') + '};');
    _$jscoverage['/compiler.js'].lineData[184]++;
    if (visit65_184_1(params)) {
      _$jscoverage['/compiler.js'].lineData[185]++;
      var paramsName = guid('params');
      _$jscoverage['/compiler.js'].lineData[186]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/compiler.js'].lineData[187]++;
      S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[188]++;
  var nextIdNameCode = xtplAstToJs[param.type](param);
  _$jscoverage['/compiler.js'].lineData[189]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/compiler.js'].lineData[190]++;
  source.push(paramsName + '.push(' + nextIdNameCode.exp + ');');
});
      _$jscoverage['/compiler.js'].lineData[192]++;
      source.push(optionName + '.params=' + paramsName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[195]++;
    if (visit66_195_1(hash)) {
      _$jscoverage['/compiler.js'].lineData[196]++;
      var hashName = guid('hash');
      _$jscoverage['/compiler.js'].lineData[197]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/compiler.js'].lineData[198]++;
      S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[199]++;
  var nextIdNameCode = xtplAstToJs[v.type](v);
  _$jscoverage['/compiler.js'].lineData[200]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/compiler.js'].lineData[201]++;
  source.push(hashName + '["' + key + '"] = ' + nextIdNameCode.exp + ';');
});
      _$jscoverage['/compiler.js'].lineData[203]++;
      source.push(optionName + '.hash=' + hashName + ';');
    }
    _$jscoverage['/compiler.js'].lineData[206]++;
    return {
  exp: optionName, 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[212]++;
  function generateCommand(command, escape, block) {
    _$jscoverage['/compiler.js'].functionData[13]++;
    _$jscoverage['/compiler.js'].lineData[213]++;
    var source = [], commandConfigCode, optionName, id = command.id, idName, idString = id.string, inverseFn;
    _$jscoverage['/compiler.js'].lineData[221]++;
    commandConfigCode = genOptionFromCommand(command, escape);
    _$jscoverage['/compiler.js'].lineData[222]++;
    optionName = commandConfigCode.exp;
    _$jscoverage['/compiler.js'].lineData[223]++;
    pushToArray(source, commandConfigCode.source);
    _$jscoverage['/compiler.js'].lineData[225]++;
    if (visit67_225_1(block)) {
      _$jscoverage['/compiler.js'].lineData[226]++;
      var programNode = block.program;
      _$jscoverage['/compiler.js'].lineData[227]++;
      source.push(optionName + '.fn=' + genFunction(programNode.statements).join('\n') + ';');
      _$jscoverage['/compiler.js'].lineData[228]++;
      if (visit68_228_1(programNode.inverse)) {
        _$jscoverage['/compiler.js'].lineData[229]++;
        inverseFn = genFunction(programNode.inverse).join('\n');
        _$jscoverage['/compiler.js'].lineData[230]++;
        source.push(optionName + '.inverse=' + inverseFn + ';');
      }
    }
    _$jscoverage['/compiler.js'].lineData[235]++;
    if (visit69_235_1(visit70_235_2(idString === 'include') || visit71_235_3(idString === 'extend'))) {
      _$jscoverage['/compiler.js'].lineData[237]++;
      source.push('if(moduleWrap) {re' + 'quire("' + command.params[0].value + '");' + optionName + '.params[0] = moduleWrap.resolve(' + optionName + '.params[0]);' + '}');
    }
    _$jscoverage['/compiler.js'].lineData[242]++;
    if (visit72_242_1(!block)) {
      _$jscoverage['/compiler.js'].lineData[243]++;
      idName = guid('commandRet');
    }
    _$jscoverage['/compiler.js'].lineData[246]++;
    if (visit73_246_1(idString in nativeCommands)) {
      _$jscoverage['/compiler.js'].lineData[247]++;
      if (visit74_247_1(block)) {
        _$jscoverage['/compiler.js'].lineData[248]++;
        source.push('buffer = ' + idString + 'Command.call(engine, scope, ' + optionName + ', buffer, ' + id.lineNumber + ', payload);');
      } else {
        _$jscoverage['/compiler.js'].lineData[250]++;
        source.push('var ' + idName + ' = ' + idString + 'Command.call(engine, scope, ' + optionName + ', buffer, ' + id.lineNumber + ', payload);');
      }
    } else {
      _$jscoverage['/compiler.js'].lineData[252]++;
      if (visit75_252_1(block)) {
        _$jscoverage['/compiler.js'].lineData[253]++;
        source.push('buffer = callCommandUtil(engine, scope, ' + optionName + ', buffer, ' + '"' + idString + '", ' + id.lineNumber + ');');
      } else {
        _$jscoverage['/compiler.js'].lineData[256]++;
        source.push('var ' + idName + ' = callCommandUtil(engine, scope, ' + optionName + ', buffer, ' + '"' + idString + '", ' + id.lineNumber + ');');
      }
    }
    _$jscoverage['/compiler.js'].lineData[260]++;
    if (visit76_260_1(idName)) {
      _$jscoverage['/compiler.js'].lineData[261]++;
      source.push('if(' + idName + ' && ' + idName + '.isBuffer){' + 'buffer = ' + idName + ';' + idName + ' = undefined;' + '}');
    }
    _$jscoverage['/compiler.js'].lineData[267]++;
    return {
  exp: idName, 
  source: source};
  }
  _$jscoverage['/compiler.js'].lineData[273]++;
  var xtplAstToJs = {
  conditionalOrExpression: opExpression, 
  conditionalAndExpression: opExpression, 
  relationalExpression: opExpression, 
  equalityExpression: opExpression, 
  additiveExpression: opExpression, 
  multiplicativeExpression: opExpression, 
  unaryExpression: function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[287]++;
  var code = xtplAstToJs[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[288]++;
  return {
  exp: e.unaryType + '(' + code.exp + ')', 
  source: code.source};
}, 
  string: function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[297]++;
  return {
  exp: "'" + escapeString(e.value, true) + "'", 
  source: []};
}, 
  number: function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[304]++;
  return {
  exp: e.value, 
  source: []};
}, 
  id: function(idNode) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[311]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id');
  _$jscoverage['/compiler.js'].lineData[316]++;
  var newParts = getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[317]++;
  var depthParam = depth ? (',' + depth) : '';
  _$jscoverage['/compiler.js'].lineData[319]++;
  if (visit77_319_1(newParts)) {
    _$jscoverage['/compiler.js'].lineData[320]++;
    source.push('var ' + idName + ' = scope.resolve([' + newParts.join(',') + ']' + depthParam + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[322]++;
    source.push('var ' + idName + ' = scope.resolve(["' + idParts.join('","') + '"]' + depthParam + ');');
  }
  _$jscoverage['/compiler.js'].lineData[324]++;
  return {
  exp: idName, 
  source: source};
}, 
  command: generateCommand, 
  blockStatement: function(block) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[333]++;
  return generateCommand(block.command, block.escape, block);
}, 
  expressionStatement: function(expressionStatement) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[337]++;
  var source = [], escape = expressionStatement.escape, code, expression = expressionStatement.value, type = expression.type, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[344]++;
  code = xtplAstToJs[type](expression, escape);
  _$jscoverage['/compiler.js'].lineData[346]++;
  pushToArray(source, code.source);
  _$jscoverage['/compiler.js'].lineData[347]++;
  expressionOrVariable = code.exp;
  _$jscoverage['/compiler.js'].lineData[349]++;
  if (visit78_349_1(expressionOrVariable)) {
    _$jscoverage['/compiler.js'].lineData[350]++;
    source.push('buffer.write(' + expressionOrVariable + ',' + !!escape + ');');
  }
  _$jscoverage['/compiler.js'].lineData[353]++;
  return {
  exp: '', 
  source: source};
}, 
  contentStatement: function(contentStatement) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[361]++;
  return {
  exp: '', 
  source: ["buffer.write('" + escapeString(contentStatement.value, 0) + "');"]};
}};
  _$jscoverage['/compiler.js'].lineData[368]++;
  xtplAstToJs['boolean'] = function(e) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[369]++;
  return {
  exp: e.value, 
  source: []};
};
  _$jscoverage['/compiler.js'].lineData[375]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[382]++;
  compiler = {
  parse: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[390]++;
  return parser.parse(name, tpl);
}, 
  compileToStr: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[399]++;
  var func = compiler.compile(tpl, name);
  _$jscoverage['/compiler.js'].lineData[400]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[411]++;
  var root = compiler.parse(name, tpl);
  _$jscoverage['/compiler.js'].lineData[412]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[413]++;
  return genTopFunction(root.statements);
}, 
  compileToFn: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[422]++;
  name = visit79_422_1(name || ('xtemplate' + (xtemplateId++)));
  _$jscoverage['/compiler.js'].lineData[423]++;
  var code = compiler.compile(tpl, name);
  _$jscoverage['/compiler.js'].lineData[424]++;
  var sourceURL = 'sourceURL=' + name + '.js';
  _$jscoverage['/compiler.js'].lineData[426]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
  _$jscoverage['/compiler.js'].lineData[436]++;
  return compiler;
});
