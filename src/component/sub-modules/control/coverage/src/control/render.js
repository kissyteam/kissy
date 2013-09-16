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
  _$jscoverage['/control/render.js'].lineData[17] = 0;
  _$jscoverage['/control/render.js'].lineData[18] = 0;
  _$jscoverage['/control/render.js'].lineData[19] = 0;
  _$jscoverage['/control/render.js'].lineData[21] = 0;
  _$jscoverage['/control/render.js'].lineData[24] = 0;
  _$jscoverage['/control/render.js'].lineData[25] = 0;
  _$jscoverage['/control/render.js'].lineData[30] = 0;
  _$jscoverage['/control/render.js'].lineData[31] = 0;
  _$jscoverage['/control/render.js'].lineData[33] = 0;
  _$jscoverage['/control/render.js'].lineData[35] = 0;
  _$jscoverage['/control/render.js'].lineData[36] = 0;
  _$jscoverage['/control/render.js'].lineData[37] = 0;
  _$jscoverage['/control/render.js'].lineData[41] = 0;
  _$jscoverage['/control/render.js'].lineData[42] = 0;
  _$jscoverage['/control/render.js'].lineData[45] = 0;
  _$jscoverage['/control/render.js'].lineData[46] = 0;
  _$jscoverage['/control/render.js'].lineData[51] = 0;
  _$jscoverage['/control/render.js'].lineData[52] = 0;
  _$jscoverage['/control/render.js'].lineData[53] = 0;
  _$jscoverage['/control/render.js'].lineData[55] = 0;
  _$jscoverage['/control/render.js'].lineData[56] = 0;
  _$jscoverage['/control/render.js'].lineData[58] = 0;
  _$jscoverage['/control/render.js'].lineData[61] = 0;
  _$jscoverage['/control/render.js'].lineData[62] = 0;
  _$jscoverage['/control/render.js'].lineData[67] = 0;
  _$jscoverage['/control/render.js'].lineData[68] = 0;
  _$jscoverage['/control/render.js'].lineData[69] = 0;
  _$jscoverage['/control/render.js'].lineData[70] = 0;
  _$jscoverage['/control/render.js'].lineData[72] = 0;
  _$jscoverage['/control/render.js'].lineData[75] = 0;
  _$jscoverage['/control/render.js'].lineData[76] = 0;
  _$jscoverage['/control/render.js'].lineData[79] = 0;
  _$jscoverage['/control/render.js'].lineData[80] = 0;
  _$jscoverage['/control/render.js'].lineData[81] = 0;
  _$jscoverage['/control/render.js'].lineData[86] = 0;
  _$jscoverage['/control/render.js'].lineData[87] = 0;
  _$jscoverage['/control/render.js'].lineData[90] = 0;
  _$jscoverage['/control/render.js'].lineData[91] = 0;
  _$jscoverage['/control/render.js'].lineData[99] = 0;
  _$jscoverage['/control/render.js'].lineData[103] = 0;
  _$jscoverage['/control/render.js'].lineData[106] = 0;
  _$jscoverage['/control/render.js'].lineData[108] = 0;
  _$jscoverage['/control/render.js'].lineData[110] = 0;
  _$jscoverage['/control/render.js'].lineData[115] = 0;
  _$jscoverage['/control/render.js'].lineData[130] = 0;
  _$jscoverage['/control/render.js'].lineData[131] = 0;
  _$jscoverage['/control/render.js'].lineData[132] = 0;
  _$jscoverage['/control/render.js'].lineData[133] = 0;
  _$jscoverage['/control/render.js'].lineData[137] = 0;
  _$jscoverage['/control/render.js'].lineData[138] = 0;
  _$jscoverage['/control/render.js'].lineData[139] = 0;
  _$jscoverage['/control/render.js'].lineData[140] = 0;
  _$jscoverage['/control/render.js'].lineData[142] = 0;
  _$jscoverage['/control/render.js'].lineData[143] = 0;
  _$jscoverage['/control/render.js'].lineData[145] = 0;
  _$jscoverage['/control/render.js'].lineData[146] = 0;
  _$jscoverage['/control/render.js'].lineData[148] = 0;
  _$jscoverage['/control/render.js'].lineData[149] = 0;
  _$jscoverage['/control/render.js'].lineData[152] = 0;
  _$jscoverage['/control/render.js'].lineData[153] = 0;
  _$jscoverage['/control/render.js'].lineData[156] = 0;
  _$jscoverage['/control/render.js'].lineData[157] = 0;
  _$jscoverage['/control/render.js'].lineData[158] = 0;
  _$jscoverage['/control/render.js'].lineData[160] = 0;
  _$jscoverage['/control/render.js'].lineData[161] = 0;
  _$jscoverage['/control/render.js'].lineData[163] = 0;
  _$jscoverage['/control/render.js'].lineData[164] = 0;
  _$jscoverage['/control/render.js'].lineData[165] = 0;
  _$jscoverage['/control/render.js'].lineData[167] = 0;
  _$jscoverage['/control/render.js'].lineData[172] = 0;
  _$jscoverage['/control/render.js'].lineData[173] = 0;
  _$jscoverage['/control/render.js'].lineData[182] = 0;
  _$jscoverage['/control/render.js'].lineData[184] = 0;
  _$jscoverage['/control/render.js'].lineData[185] = 0;
  _$jscoverage['/control/render.js'].lineData[186] = 0;
  _$jscoverage['/control/render.js'].lineData[187] = 0;
  _$jscoverage['/control/render.js'].lineData[191] = 0;
  _$jscoverage['/control/render.js'].lineData[193] = 0;
  _$jscoverage['/control/render.js'].lineData[194] = 0;
  _$jscoverage['/control/render.js'].lineData[196] = 0;
  _$jscoverage['/control/render.js'].lineData[197] = 0;
  _$jscoverage['/control/render.js'].lineData[198] = 0;
  _$jscoverage['/control/render.js'].lineData[202] = 0;
  _$jscoverage['/control/render.js'].lineData[207] = 0;
  _$jscoverage['/control/render.js'].lineData[208] = 0;
  _$jscoverage['/control/render.js'].lineData[210] = 0;
  _$jscoverage['/control/render.js'].lineData[211] = 0;
  _$jscoverage['/control/render.js'].lineData[212] = 0;
  _$jscoverage['/control/render.js'].lineData[213] = 0;
  _$jscoverage['/control/render.js'].lineData[215] = 0;
  _$jscoverage['/control/render.js'].lineData[221] = 0;
  _$jscoverage['/control/render.js'].lineData[222] = 0;
  _$jscoverage['/control/render.js'].lineData[223] = 0;
  _$jscoverage['/control/render.js'].lineData[224] = 0;
  _$jscoverage['/control/render.js'].lineData[225] = 0;
  _$jscoverage['/control/render.js'].lineData[226] = 0;
  _$jscoverage['/control/render.js'].lineData[227] = 0;
  _$jscoverage['/control/render.js'].lineData[228] = 0;
  _$jscoverage['/control/render.js'].lineData[229] = 0;
  _$jscoverage['/control/render.js'].lineData[231] = 0;
  _$jscoverage['/control/render.js'].lineData[237] = 0;
  _$jscoverage['/control/render.js'].lineData[238] = 0;
  _$jscoverage['/control/render.js'].lineData[243] = 0;
  _$jscoverage['/control/render.js'].lineData[247] = 0;
  _$jscoverage['/control/render.js'].lineData[253] = 0;
  _$jscoverage['/control/render.js'].lineData[255] = 0;
  _$jscoverage['/control/render.js'].lineData[256] = 0;
  _$jscoverage['/control/render.js'].lineData[257] = 0;
  _$jscoverage['/control/render.js'].lineData[258] = 0;
  _$jscoverage['/control/render.js'].lineData[260] = 0;
  _$jscoverage['/control/render.js'].lineData[263] = 0;
  _$jscoverage['/control/render.js'].lineData[268] = 0;
  _$jscoverage['/control/render.js'].lineData[269] = 0;
  _$jscoverage['/control/render.js'].lineData[270] = 0;
  _$jscoverage['/control/render.js'].lineData[271] = 0;
  _$jscoverage['/control/render.js'].lineData[272] = 0;
  _$jscoverage['/control/render.js'].lineData[285] = 0;
  _$jscoverage['/control/render.js'].lineData[287] = 0;
  _$jscoverage['/control/render.js'].lineData[288] = 0;
  _$jscoverage['/control/render.js'].lineData[289] = 0;
  _$jscoverage['/control/render.js'].lineData[291] = 0;
  _$jscoverage['/control/render.js'].lineData[295] = 0;
  _$jscoverage['/control/render.js'].lineData[296] = 0;
  _$jscoverage['/control/render.js'].lineData[297] = 0;
  _$jscoverage['/control/render.js'].lineData[299] = 0;
  _$jscoverage['/control/render.js'].lineData[303] = 0;
  _$jscoverage['/control/render.js'].lineData[304] = 0;
  _$jscoverage['/control/render.js'].lineData[305] = 0;
  _$jscoverage['/control/render.js'].lineData[306] = 0;
  _$jscoverage['/control/render.js'].lineData[308] = 0;
  _$jscoverage['/control/render.js'].lineData[311] = 0;
  _$jscoverage['/control/render.js'].lineData[320] = 0;
  _$jscoverage['/control/render.js'].lineData[321] = 0;
  _$jscoverage['/control/render.js'].lineData[327] = 0;
  _$jscoverage['/control/render.js'].lineData[328] = 0;
  _$jscoverage['/control/render.js'].lineData[330] = 0;
  _$jscoverage['/control/render.js'].lineData[340] = 0;
  _$jscoverage['/control/render.js'].lineData[353] = 0;
  _$jscoverage['/control/render.js'].lineData[357] = 0;
  _$jscoverage['/control/render.js'].lineData[361] = 0;
  _$jscoverage['/control/render.js'].lineData[365] = 0;
  _$jscoverage['/control/render.js'].lineData[366] = 0;
  _$jscoverage['/control/render.js'].lineData[368] = 0;
  _$jscoverage['/control/render.js'].lineData[369] = 0;
  _$jscoverage['/control/render.js'].lineData[374] = 0;
  _$jscoverage['/control/render.js'].lineData[377] = 0;
  _$jscoverage['/control/render.js'].lineData[378] = 0;
  _$jscoverage['/control/render.js'].lineData[380] = 0;
  _$jscoverage['/control/render.js'].lineData[388] = 0;
  _$jscoverage['/control/render.js'].lineData[391] = 0;
  _$jscoverage['/control/render.js'].lineData[398] = 0;
  _$jscoverage['/control/render.js'].lineData[403] = 0;
  _$jscoverage['/control/render.js'].lineData[404] = 0;
  _$jscoverage['/control/render.js'].lineData[406] = 0;
  _$jscoverage['/control/render.js'].lineData[413] = 0;
  _$jscoverage['/control/render.js'].lineData[416] = 0;
  _$jscoverage['/control/render.js'].lineData[422] = 0;
  _$jscoverage['/control/render.js'].lineData[425] = 0;
  _$jscoverage['/control/render.js'].lineData[429] = 0;
  _$jscoverage['/control/render.js'].lineData[446] = 0;
  _$jscoverage['/control/render.js'].lineData[449] = 0;
  _$jscoverage['/control/render.js'].lineData[450] = 0;
  _$jscoverage['/control/render.js'].lineData[451] = 0;
  _$jscoverage['/control/render.js'].lineData[454] = 0;
  _$jscoverage['/control/render.js'].lineData[455] = 0;
  _$jscoverage['/control/render.js'].lineData[457] = 0;
  _$jscoverage['/control/render.js'].lineData[458] = 0;
  _$jscoverage['/control/render.js'].lineData[462] = 0;
  _$jscoverage['/control/render.js'].lineData[464] = 0;
  _$jscoverage['/control/render.js'].lineData[465] = 0;
  _$jscoverage['/control/render.js'].lineData[466] = 0;
  _$jscoverage['/control/render.js'].lineData[473] = 0;
  _$jscoverage['/control/render.js'].lineData[481] = 0;
  _$jscoverage['/control/render.js'].lineData[488] = 0;
  _$jscoverage['/control/render.js'].lineData[489] = 0;
  _$jscoverage['/control/render.js'].lineData[492] = 0;
  _$jscoverage['/control/render.js'].lineData[495] = 0;
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
  _$jscoverage['/control/render.js'].branchData['18'] = [];
  _$jscoverage['/control/render.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['33'] = [];
  _$jscoverage['/control/render.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['36'] = [];
  _$jscoverage['/control/render.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['41'] = [];
  _$jscoverage['/control/render.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['45'] = [];
  _$jscoverage['/control/render.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['52'] = [];
  _$jscoverage['/control/render.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['55'] = [];
  _$jscoverage['/control/render.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['67'] = [];
  _$jscoverage['/control/render.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['79'] = [];
  _$jscoverage['/control/render.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['106'] = [];
  _$jscoverage['/control/render.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['132'] = [];
  _$jscoverage['/control/render.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['142'] = [];
  _$jscoverage['/control/render.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['145'] = [];
  _$jscoverage['/control/render.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['148'] = [];
  _$jscoverage['/control/render.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['152'] = [];
  _$jscoverage['/control/render.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['156'] = [];
  _$jscoverage['/control/render.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['160'] = [];
  _$jscoverage['/control/render.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['163'] = [];
  _$jscoverage['/control/render.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['164'] = [];
  _$jscoverage['/control/render.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['193'] = [];
  _$jscoverage['/control/render.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['207'] = [];
  _$jscoverage['/control/render.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['210'] = [];
  _$jscoverage['/control/render.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['212'] = [];
  _$jscoverage['/control/render.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['229'] = [];
  _$jscoverage['/control/render.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['237'] = [];
  _$jscoverage['/control/render.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['253'] = [];
  _$jscoverage['/control/render.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['257'] = [];
  _$jscoverage['/control/render.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['269'] = [];
  _$jscoverage['/control/render.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['270'] = [];
  _$jscoverage['/control/render.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['287'] = [];
  _$jscoverage['/control/render.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['296'] = [];
  _$jscoverage['/control/render.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['303'] = [];
  _$jscoverage['/control/render.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['305'] = [];
  _$jscoverage['/control/render.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['308'] = [];
  _$jscoverage['/control/render.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['327'] = [];
  _$jscoverage['/control/render.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['368'] = [];
  _$jscoverage['/control/render.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['368'][2] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['377'] = [];
  _$jscoverage['/control/render.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['404'] = [];
  _$jscoverage['/control/render.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['450'] = [];
  _$jscoverage['/control/render.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['451'] = [];
  _$jscoverage['/control/render.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['455'] = [];
  _$jscoverage['/control/render.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['481'] = [];
  _$jscoverage['/control/render.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/control/render.js'].branchData['481'][2] = new BranchData();
}
_$jscoverage['/control/render.js'].branchData['481'][2].init(29, 43, 'scopes && scopes[scopes.length - 1].content');
function visit54_481_2(result) {
  _$jscoverage['/control/render.js'].branchData['481'][2].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['481'][1].init(29, 49, 'scopes && scopes[scopes.length - 1].content || \'\'');
function visit53_481_1(result) {
  _$jscoverage['/control/render.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['455'][1].init(26, 3, 'ext');
function visit52_455_1(result) {
  _$jscoverage['/control/render.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['451'][1].init(256, 21, 'S.isArray(extensions)');
function visit51_451_1(result) {
  _$jscoverage['/control/render.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['450'][1].init(210, 27, 'NewClass[HTML_PARSER] || {}');
function visit50_450_1(result) {
  _$jscoverage['/control/render.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['404'][1].init(295, 24, 'control.get("focusable")');
function visit49_404_1(result) {
  _$jscoverage['/control/render.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['377'][1].init(143, 7, 'visible');
function visit48_377_1(result) {
  _$jscoverage['/control/render.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['368'][2].init(142, 9, 'UA.ie < 9');
function visit47_368_2(result) {
  _$jscoverage['/control/render.js'].branchData['368'][2].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['368'][1].init(142, 44, 'UA.ie < 9 && !this.get(\'allowTextSelection\')');
function visit46_368_1(result) {
  _$jscoverage['/control/render.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['327'][1].init(338, 5, 'i < l');
function visit45_327_1(result) {
  _$jscoverage['/control/render.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['308'][1].init(166, 81, 'constructor.superclass && constructor.superclass.constructor');
function visit44_308_1(result) {
  _$jscoverage['/control/render.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['305'][1].init(68, 6, 'xclass');
function visit43_305_1(result) {
  _$jscoverage['/control/render.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['303'][1].init(305, 65, 'constructor && !constructor.prototype.hasOwnProperty(\'isControl\')');
function visit42_303_1(result) {
  _$jscoverage['/control/render.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['296'][1].init(48, 24, 'self.componentCssClasses');
function visit41_296_1(result) {
  _$jscoverage['/control/render.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['287'][1].init(89, 3, 'cls');
function visit40_287_1(result) {
  _$jscoverage['/control/render.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['270'][1].init(118, 37, 'renderCommands || self.renderCommands');
function visit39_270_1(result) {
  _$jscoverage['/control/render.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['269'][1].init(57, 29, 'renderData || self.renderData');
function visit38_269_1(result) {
  _$jscoverage['/control/render.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['257'][1].init(82, 30, 'typeof selector === "function"');
function visit37_257_1(result) {
  _$jscoverage['/control/render.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['253'][1].init(196, 47, 'childrenElSelectors || self.childrenElSelectors');
function visit36_253_1(result) {
  _$jscoverage['/control/render.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['237'][1].init(18, 8, 'this.$el');
function visit35_237_1(result) {
  _$jscoverage['/control/render.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['229'][1].init(176, 28, 'attrCfg.view && attrChangeFn');
function visit34_229_1(result) {
  _$jscoverage['/control/render.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['212'][1].init(247, 6, 'render');
function visit33_212_1(result) {
  _$jscoverage['/control/render.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['210'][1].init(136, 12, 'renderBefore');
function visit32_210_1(result) {
  _$jscoverage['/control/render.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['207'][1].init(176, 23, '!control.get(\'srcNode\')');
function visit31_207_1(result) {
  _$jscoverage['/control/render.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['193'][1].init(89, 19, '!srcNode.attr(\'id\')');
function visit30_193_1(result) {
  _$jscoverage['/control/render.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['164'][1].init(22, 5, 'UA.ie');
function visit29_164_1(result) {
  _$jscoverage['/control/render.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['163'][1].init(1549, 24, 'control.get(\'focusable\')');
function visit28_163_1(result) {
  _$jscoverage['/control/render.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['160'][1].init(1427, 26, 'control.get(\'highlighted\')');
function visit27_160_1(result) {
  _$jscoverage['/control/render.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['156'][1].init(1242, 34, 'disabled = control.get(\'disabled\')');
function visit26_156_1(result) {
  _$jscoverage['/control/render.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['152'][1].init(1133, 8, '!visible');
function visit25_152_1(result) {
  _$jscoverage['/control/render.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['148'][1].init(1043, 6, 'zIndex');
function visit24_148_1(result) {
  _$jscoverage['/control/render.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['145'][1].init(949, 6, 'height');
function visit23_145_1(result) {
  _$jscoverage['/control/render.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['142'][1].init(858, 5, 'width');
function visit22_142_1(result) {
  _$jscoverage['/control/render.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['132'][1].init(56, 9, 'attr.view');
function visit21_132_1(result) {
  _$jscoverage['/control/render.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['106'][1].init(106, 7, 'srcNode');
function visit20_106_1(result) {
  _$jscoverage['/control/render.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['79'][1].init(89, 24, 'e.target == self.control');
function visit19_79_1(result) {
  _$jscoverage['/control/render.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['67'][1].init(156, 5, 'i < l');
function visit18_67_1(result) {
  _$jscoverage['/control/render.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['55'][1].init(77, 25, 'typeof extras == "string"');
function visit17_55_1(result) {
  _$jscoverage['/control/render.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['52'][1].init(14, 7, '!extras');
function visit16_52_1(result) {
  _$jscoverage['/control/render.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['45'][1].init(485, 20, 'S.isArray(v) && v[0]');
function visit15_45_1(result) {
  _$jscoverage['/control/render.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['41'][1].init(344, 20, 'typeof v == \'string\'');
function visit14_41_1(result) {
  _$jscoverage['/control/render.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['36'][1].init(103, 17, 'ret !== undefined');
function visit13_36_1(result) {
  _$jscoverage['/control/render.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['33'][1].init(65, 23, 'typeof v === \'function\'');
function visit12_33_1(result) {
  _$jscoverage['/control/render.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].branchData['18'][1].init(14, 20, 'typeof v == \'number\'');
function visit11_18_1(result) {
  _$jscoverage['/control/render.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/render.js'].lineData[7]++;
KISSY.add("component/control/render", function(S, Node, XTemplateRuntime, ComponentProcess, RenderTpl, Manager) {
  _$jscoverage['/control/render.js'].functionData[0]++;
  _$jscoverage['/control/render.js'].lineData[8]++;
  var ON_SET = '_onSet', trim = S.trim, $ = Node.all, UA = S.UA, startTpl = RenderTpl, endTpl = '</div>', doc = S.Env.host.document, HTML_PARSER = 'HTML_PARSER';
  _$jscoverage['/control/render.js'].lineData[17]++;
  function pxSetter(v) {
    _$jscoverage['/control/render.js'].functionData[1]++;
    _$jscoverage['/control/render.js'].lineData[18]++;
    if (visit11_18_1(typeof v == 'number')) {
      _$jscoverage['/control/render.js'].lineData[19]++;
      v += 'px';
    }
    _$jscoverage['/control/render.js'].lineData[21]++;
    return v;
  }
  _$jscoverage['/control/render.js'].lineData[24]++;
  function applyParser(srcNode, parser, control) {
    _$jscoverage['/control/render.js'].functionData[2]++;
    _$jscoverage['/control/render.js'].lineData[25]++;
    var view = this, p, v, ret;
    _$jscoverage['/control/render.js'].lineData[30]++;
    for (p in parser) {
      _$jscoverage['/control/render.js'].lineData[31]++;
      v = parser[p];
      _$jscoverage['/control/render.js'].lineData[33]++;
      if (visit12_33_1(typeof v === 'function')) {
        _$jscoverage['/control/render.js'].lineData[35]++;
        ret = v.call(view, srcNode);
        _$jscoverage['/control/render.js'].lineData[36]++;
        if (visit13_36_1(ret !== undefined)) {
          _$jscoverage['/control/render.js'].lineData[37]++;
          control.setInternal(p, ret);
        }
      } else {
        _$jscoverage['/control/render.js'].lineData[41]++;
        if (visit14_41_1(typeof v == 'string')) {
          _$jscoverage['/control/render.js'].lineData[42]++;
          control.setInternal(p, srcNode.one(v));
        } else {
          _$jscoverage['/control/render.js'].lineData[45]++;
          if (visit15_45_1(S.isArray(v) && v[0])) {
            _$jscoverage['/control/render.js'].lineData[46]++;
            control.setInternal(p, srcNode.all(v[0]));
          }
        }
      }
    }
  }
  _$jscoverage['/control/render.js'].lineData[51]++;
  function normalExtras(extras) {
    _$jscoverage['/control/render.js'].functionData[3]++;
    _$jscoverage['/control/render.js'].lineData[52]++;
    if (visit16_52_1(!extras)) {
      _$jscoverage['/control/render.js'].lineData[53]++;
      extras = [''];
    }
    _$jscoverage['/control/render.js'].lineData[55]++;
    if (visit17_55_1(typeof extras == "string")) {
      _$jscoverage['/control/render.js'].lineData[56]++;
      extras = extras.split(/\s+/);
    }
    _$jscoverage['/control/render.js'].lineData[58]++;
    return extras;
  }
  _$jscoverage['/control/render.js'].lineData[61]++;
  function prefixExtra(prefixCls, componentCls, extras) {
    _$jscoverage['/control/render.js'].functionData[4]++;
    _$jscoverage['/control/render.js'].lineData[62]++;
    var cls = '', i = 0, l = extras.length, e, prefix = prefixCls + componentCls;
    _$jscoverage['/control/render.js'].lineData[67]++;
    for (; visit18_67_1(i < l); i++) {
      _$jscoverage['/control/render.js'].lineData[68]++;
      e = extras[i];
      _$jscoverage['/control/render.js'].lineData[69]++;
      e = e ? ('-' + e) : e;
      _$jscoverage['/control/render.js'].lineData[70]++;
      cls += ' ' + prefix + e;
    }
    _$jscoverage['/control/render.js'].lineData[72]++;
    return cls;
  }
  _$jscoverage['/control/render.js'].lineData[75]++;
  function onSetAttrChange(e) {
    _$jscoverage['/control/render.js'].functionData[5]++;
    _$jscoverage['/control/render.js'].lineData[76]++;
    var self = this, method;
    _$jscoverage['/control/render.js'].lineData[79]++;
    if (visit19_79_1(e.target == self.control)) {
      _$jscoverage['/control/render.js'].lineData[80]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/control/render.js'].lineData[81]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/control/render.js'].lineData[86]++;
  function getBaseCssClassesCmd() {
    _$jscoverage['/control/render.js'].functionData[6]++;
    _$jscoverage['/control/render.js'].lineData[87]++;
    return this.config.view.getBaseCssClasses(arguments[1].params[0]);
  }
  _$jscoverage['/control/render.js'].lineData[90]++;
  function getBaseCssClassCmd() {
    _$jscoverage['/control/render.js'].functionData[7]++;
    _$jscoverage['/control/render.js'].lineData[91]++;
    return this.config.view.getBaseCssClass(arguments[1].params[0]);
  }
  _$jscoverage['/control/render.js'].lineData[99]++;
  return ComponentProcess.extend({
  isRender: true, 
  createInternal: function() {
  _$jscoverage['/control/render.js'].functionData[8]++;
  _$jscoverage['/control/render.js'].lineData[103]++;
  var self = this, srcNode = self.control.get('srcNode');
  _$jscoverage['/control/render.js'].lineData[106]++;
  if (visit20_106_1(srcNode)) {
    _$jscoverage['/control/render.js'].lineData[108]++;
    self.decorateDom(srcNode);
  } else {
    _$jscoverage['/control/render.js'].lineData[110]++;
    self.callSuper();
  }
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/control/render.js'].functionData[9]++;
  _$jscoverage['/control/render.js'].lineData[115]++;
  var self = this, control = self.control, width, height, visible, elAttrs = control.get('elAttrs'), cls = control.get('elCls'), disabled, attrs = control['getAttrs'](), a, attr, elStyle = control.get('elStyle'), zIndex, elCls = control.get('elCls');
  _$jscoverage['/control/render.js'].lineData[130]++;
  for (a in attrs) {
    _$jscoverage['/control/render.js'].lineData[131]++;
    attr = attrs[a];
    _$jscoverage['/control/render.js'].lineData[132]++;
    if (visit21_132_1(attr.view)) {
      _$jscoverage['/control/render.js'].lineData[133]++;
      renderData[a] = control.get(a);
    }
  }
  _$jscoverage['/control/render.js'].lineData[137]++;
  width = renderData.width;
  _$jscoverage['/control/render.js'].lineData[138]++;
  height = renderData.height;
  _$jscoverage['/control/render.js'].lineData[139]++;
  visible = renderData.visible;
  _$jscoverage['/control/render.js'].lineData[140]++;
  zIndex = renderData.zIndex;
  _$jscoverage['/control/render.js'].lineData[142]++;
  if (visit22_142_1(width)) {
    _$jscoverage['/control/render.js'].lineData[143]++;
    elStyle.width = pxSetter(width);
  }
  _$jscoverage['/control/render.js'].lineData[145]++;
  if (visit23_145_1(height)) {
    _$jscoverage['/control/render.js'].lineData[146]++;
    elStyle.height = pxSetter(height);
  }
  _$jscoverage['/control/render.js'].lineData[148]++;
  if (visit24_148_1(zIndex)) {
    _$jscoverage['/control/render.js'].lineData[149]++;
    elStyle['z-index'] = zIndex;
  }
  _$jscoverage['/control/render.js'].lineData[152]++;
  if (visit25_152_1(!visible)) {
    _$jscoverage['/control/render.js'].lineData[153]++;
    elCls.push(self.getBaseCssClasses('hidden'));
  }
  _$jscoverage['/control/render.js'].lineData[156]++;
  if (visit26_156_1(disabled = control.get('disabled'))) {
    _$jscoverage['/control/render.js'].lineData[157]++;
    cls.push(self.getBaseCssClasses('disabled'));
    _$jscoverage['/control/render.js'].lineData[158]++;
    elAttrs['aria-disabled'] = 'true';
  }
  _$jscoverage['/control/render.js'].lineData[160]++;
  if (visit27_160_1(control.get('highlighted'))) {
    _$jscoverage['/control/render.js'].lineData[161]++;
    cls.push(self.getBaseCssClasses('hover'));
  }
  _$jscoverage['/control/render.js'].lineData[163]++;
  if (visit28_163_1(control.get('focusable'))) {
    _$jscoverage['/control/render.js'].lineData[164]++;
    if (visit29_164_1(UA.ie)) {
      _$jscoverage['/control/render.js'].lineData[165]++;
      elAttrs['hideFocus'] = 'true';
    }
    _$jscoverage['/control/render.js'].lineData[167]++;
    elAttrs['tabindex'] = disabled ? '-1' : '0';
  }
}, 
  createDom: function() {
  _$jscoverage['/control/render.js'].functionData[10]++;
  _$jscoverage['/control/render.js'].lineData[172]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[173]++;
  self['beforeCreateDom'](self.renderData = {}, self.childrenElSelectors = {}, self.renderCommands = {
  getBaseCssClasses: getBaseCssClassesCmd, 
  getBaseCssClass: getBaseCssClassCmd});
  _$jscoverage['/control/render.js'].lineData[182]++;
  var control = self.control, html;
  _$jscoverage['/control/render.js'].lineData[184]++;
  html = self.renderTpl(startTpl) + self.renderTpl(self.get('contentTpl')) + endTpl;
  _$jscoverage['/control/render.js'].lineData[185]++;
  control.setInternal("el", self.$el = $(html));
  _$jscoverage['/control/render.js'].lineData[186]++;
  self.el = self.$el[0];
  _$jscoverage['/control/render.js'].lineData[187]++;
  self.fillChildrenElsBySelectors();
}, 
  decorateDom: function(srcNode) {
  _$jscoverage['/control/render.js'].functionData[11]++;
  _$jscoverage['/control/render.js'].lineData[191]++;
  var self = this, control = self.control;
  _$jscoverage['/control/render.js'].lineData[193]++;
  if (visit30_193_1(!srcNode.attr('id'))) {
    _$jscoverage['/control/render.js'].lineData[194]++;
    srcNode.attr('id', control.get('id'));
  }
  _$jscoverage['/control/render.js'].lineData[196]++;
  applyParser.call(self, srcNode, self.constructor.HTML_PARSER, control);
  _$jscoverage['/control/render.js'].lineData[197]++;
  control.setInternal("el", self.$el = srcNode);
  _$jscoverage['/control/render.js'].lineData[198]++;
  self.el = srcNode[0];
}, 
  renderUI: function() {
  _$jscoverage['/control/render.js'].functionData[12]++;
  _$jscoverage['/control/render.js'].lineData[202]++;
  var self = this, control = self.control, el = self.$el;
  _$jscoverage['/control/render.js'].lineData[207]++;
  if (visit31_207_1(!control.get('srcNode'))) {
    _$jscoverage['/control/render.js'].lineData[208]++;
    var render = control.get('render'), renderBefore = control.get('elBefore');
    _$jscoverage['/control/render.js'].lineData[210]++;
    if (visit32_210_1(renderBefore)) {
      _$jscoverage['/control/render.js'].lineData[211]++;
      el['insertBefore'](renderBefore, undefined);
    } else {
      _$jscoverage['/control/render.js'].lineData[212]++;
      if (visit33_212_1(render)) {
        _$jscoverage['/control/render.js'].lineData[213]++;
        el.appendTo(render, undefined);
      } else {
        _$jscoverage['/control/render.js'].lineData[215]++;
        el.appendTo(doc.body, undefined);
      }
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/control/render.js'].functionData[13]++;
  _$jscoverage['/control/render.js'].lineData[221]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[222]++;
  var control = self.control;
  _$jscoverage['/control/render.js'].lineData[223]++;
  var attrs = control['getAttrs']();
  _$jscoverage['/control/render.js'].lineData[224]++;
  var attrName, attrCfg;
  _$jscoverage['/control/render.js'].lineData[225]++;
  for (attrName in attrs) {
    _$jscoverage['/control/render.js'].lineData[226]++;
    attrCfg = attrs[attrName];
    _$jscoverage['/control/render.js'].lineData[227]++;
    var ucName = S.ucfirst(attrName);
    _$jscoverage['/control/render.js'].lineData[228]++;
    var attrChangeFn = self[ON_SET + ucName];
    _$jscoverage['/control/render.js'].lineData[229]++;
    if (visit34_229_1(attrCfg.view && attrChangeFn)) {
      _$jscoverage['/control/render.js'].lineData[231]++;
      control.on("after" + ucName + "Change", onSetAttrChange, self);
    }
  }
}, 
  destructor: function() {
  _$jscoverage['/control/render.js'].functionData[14]++;
  _$jscoverage['/control/render.js'].lineData[237]++;
  if (visit35_237_1(this.$el)) {
    _$jscoverage['/control/render.js'].lineData[238]++;
    this.$el.remove();
  }
}, 
  $: function(selector) {
  _$jscoverage['/control/render.js'].functionData[15]++;
  _$jscoverage['/control/render.js'].lineData[243]++;
  return this.$el.all(selector);
}, 
  fillChildrenElsBySelectors: function(childrenElSelectors) {
  _$jscoverage['/control/render.js'].functionData[16]++;
  _$jscoverage['/control/render.js'].lineData[247]++;
  var self = this, el = self.$el, control = self.control, childName, selector;
  _$jscoverage['/control/render.js'].lineData[253]++;
  childrenElSelectors = visit36_253_1(childrenElSelectors || self.childrenElSelectors);
  _$jscoverage['/control/render.js'].lineData[255]++;
  for (childName in childrenElSelectors) {
    _$jscoverage['/control/render.js'].lineData[256]++;
    selector = childrenElSelectors[childName];
    _$jscoverage['/control/render.js'].lineData[257]++;
    if (visit37_257_1(typeof selector === "function")) {
      _$jscoverage['/control/render.js'].lineData[258]++;
      control.setInternal(childName, selector(el));
    } else {
      _$jscoverage['/control/render.js'].lineData[260]++;
      control.setInternal(childName, self.$(S.substitute(selector, self.renderData)));
    }
    _$jscoverage['/control/render.js'].lineData[263]++;
    delete childrenElSelectors[childName];
  }
}, 
  renderTpl: function(tpl, renderData, renderCommands) {
  _$jscoverage['/control/render.js'].functionData[17]++;
  _$jscoverage['/control/render.js'].lineData[268]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[269]++;
  renderData = visit38_269_1(renderData || self.renderData);
  _$jscoverage['/control/render.js'].lineData[270]++;
  renderCommands = visit39_270_1(renderCommands || self.renderCommands);
  _$jscoverage['/control/render.js'].lineData[271]++;
  var XTemplate = self.get('xtemplate');
  _$jscoverage['/control/render.js'].lineData[272]++;
  return new XTemplate(tpl, {
  control: self.control, 
  view: self, 
  commands: renderCommands}).render(renderData);
}, 
  getComponentConstructorByNode: function(prefixCls, childNode) {
  _$jscoverage['/control/render.js'].functionData[18]++;
  _$jscoverage['/control/render.js'].lineData[285]++;
  var cls = childNode[0].className;
  _$jscoverage['/control/render.js'].lineData[287]++;
  if (visit40_287_1(cls)) {
    _$jscoverage['/control/render.js'].lineData[288]++;
    cls = cls.replace(new RegExp("\\b" + prefixCls, "ig"), "");
    _$jscoverage['/control/render.js'].lineData[289]++;
    return Manager.getConstructorByXClass(cls);
  }
  _$jscoverage['/control/render.js'].lineData[291]++;
  return null;
}, 
  getComponentCssClasses: function() {
  _$jscoverage['/control/render.js'].functionData[19]++;
  _$jscoverage['/control/render.js'].lineData[295]++;
  var self = this;
  _$jscoverage['/control/render.js'].lineData[296]++;
  if (visit41_296_1(self.componentCssClasses)) {
    _$jscoverage['/control/render.js'].lineData[297]++;
    return self.componentCssClasses;
  }
  _$jscoverage['/control/render.js'].lineData[299]++;
  var control = self.control, constructor = control.constructor, xclass, re = [];
  _$jscoverage['/control/render.js'].lineData[303]++;
  while (visit42_303_1(constructor && !constructor.prototype.hasOwnProperty('isControl'))) {
    _$jscoverage['/control/render.js'].lineData[304]++;
    xclass = constructor.xclass;
    _$jscoverage['/control/render.js'].lineData[305]++;
    if (visit43_305_1(xclass)) {
      _$jscoverage['/control/render.js'].lineData[306]++;
      re.push(xclass);
    }
    _$jscoverage['/control/render.js'].lineData[308]++;
    constructor = visit44_308_1(constructor.superclass && constructor.superclass.constructor);
  }
  _$jscoverage['/control/render.js'].lineData[311]++;
  return self.componentCssClasses = re;
}, 
  getBaseCssClasses: function(extras) {
  _$jscoverage['/control/render.js'].functionData[20]++;
  _$jscoverage['/control/render.js'].lineData[320]++;
  extras = normalExtras(extras);
  _$jscoverage['/control/render.js'].lineData[321]++;
  var componentCssClasses = this.getComponentCssClasses(), i = 0, control = this.get('control'), cls = '', l = componentCssClasses.length, prefixCls = control.get('prefixCls');
  _$jscoverage['/control/render.js'].lineData[327]++;
  for (; visit45_327_1(i < l); i++) {
    _$jscoverage['/control/render.js'].lineData[328]++;
    cls += prefixExtra(prefixCls, componentCssClasses[i], extras);
  }
  _$jscoverage['/control/render.js'].lineData[330]++;
  return trim(cls);
}, 
  getBaseCssClass: function(extras) {
  _$jscoverage['/control/render.js'].functionData[21]++;
  _$jscoverage['/control/render.js'].lineData[340]++;
  return trim(prefixExtra(this.control.get('prefixCls'), this.getComponentCssClasses()[0], normalExtras(extras)));
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/control/render.js'].functionData[22]++;
  _$jscoverage['/control/render.js'].lineData[353]++;
  return this.$el;
}, 
  '_onSetWidth': function(w) {
  _$jscoverage['/control/render.js'].functionData[23]++;
  _$jscoverage['/control/render.js'].lineData[357]++;
  this.$el.width(w);
}, 
  _onSetHeight: function(h) {
  _$jscoverage['/control/render.js'].functionData[24]++;
  _$jscoverage['/control/render.js'].lineData[361]++;
  this.$el.height(h);
}, 
  '_onSetContent': function(c) {
  _$jscoverage['/control/render.js'].functionData[25]++;
  _$jscoverage['/control/render.js'].lineData[365]++;
  var el = this.$el;
  _$jscoverage['/control/render.js'].lineData[366]++;
  el.html(c);
  _$jscoverage['/control/render.js'].lineData[368]++;
  if (visit46_368_1(visit47_368_2(UA.ie < 9) && !this.get('allowTextSelection'))) {
    _$jscoverage['/control/render.js'].lineData[369]++;
    el['unselectable']();
  }
}, 
  _onSetVisible: function(visible) {
  _$jscoverage['/control/render.js'].functionData[26]++;
  _$jscoverage['/control/render.js'].lineData[374]++;
  var self = this, el = self.$el, hiddenCls = self.getBaseCssClasses('hidden');
  _$jscoverage['/control/render.js'].lineData[377]++;
  if (visit48_377_1(visible)) {
    _$jscoverage['/control/render.js'].lineData[378]++;
    el.removeClass(hiddenCls);
  } else {
    _$jscoverage['/control/render.js'].lineData[380]++;
    el.addClass(hiddenCls);
  }
}, 
  _onSetHighlighted: function(v) {
  _$jscoverage['/control/render.js'].functionData[27]++;
  _$jscoverage['/control/render.js'].lineData[388]++;
  var self = this, componentCls = self.getBaseCssClasses("hover"), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[391]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/control/render.js'].functionData[28]++;
  _$jscoverage['/control/render.js'].lineData[398]++;
  var self = this, control = self.control, componentCls = self.getBaseCssClasses("disabled"), el = self.$el;
  _$jscoverage['/control/render.js'].lineData[403]++;
  el[v ? 'addClass' : 'removeClass'](componentCls).attr("aria-disabled", v);
  _$jscoverage['/control/render.js'].lineData[404]++;
  if (visit49_404_1(control.get("focusable"))) {
    _$jscoverage['/control/render.js'].lineData[406]++;
    self.getKeyEventTarget().attr("tabindex", v ? -1 : 0);
  }
}, 
  '_onSetActive': function(v) {
  _$jscoverage['/control/render.js'].functionData[29]++;
  _$jscoverage['/control/render.js'].lineData[413]++;
  var self = this, componentCls = self.getBaseCssClasses("active");
  _$jscoverage['/control/render.js'].lineData[416]++;
  self.$el[v ? 'addClass' : 'removeClass'](componentCls).attr("aria-pressed", !!v);
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/control/render.js'].functionData[30]++;
  _$jscoverage['/control/render.js'].lineData[422]++;
  var self = this, el = self.$el, componentCls = self.getBaseCssClasses("focused");
  _$jscoverage['/control/render.js'].lineData[425]++;
  el[v ? 'addClass' : 'removeClass'](componentCls);
}, 
  '_onSetZIndex': function(x) {
  _$jscoverage['/control/render.js'].functionData[31]++;
  _$jscoverage['/control/render.js'].lineData[429]++;
  this.$el.css("z-index", x);
}}, {
  __hooks__: {
  decorateDom: ComponentProcess.prototype.__getHook('__decorateDom'), 
  beforeCreateDom: ComponentProcess.prototype.__getHook('__beforeCreateDom')}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/control/render.js'].functionData[32]++;
  _$jscoverage['/control/render.js'].lineData[446]++;
  var SuperClass = this, NewClass, parsers = {};
  _$jscoverage['/control/render.js'].lineData[449]++;
  NewClass = ComponentProcess.extend.apply(SuperClass, arguments);
  _$jscoverage['/control/render.js'].lineData[450]++;
  NewClass[HTML_PARSER] = visit50_450_1(NewClass[HTML_PARSER] || {});
  _$jscoverage['/control/render.js'].lineData[451]++;
  if (visit51_451_1(S.isArray(extensions))) {
    _$jscoverage['/control/render.js'].lineData[454]++;
    S.each(extensions['concat'](NewClass), function(ext) {
  _$jscoverage['/control/render.js'].functionData[33]++;
  _$jscoverage['/control/render.js'].lineData[455]++;
  if (visit52_455_1(ext)) {
    _$jscoverage['/control/render.js'].lineData[457]++;
    S.each(ext.HTML_PARSER, function(v, name) {
  _$jscoverage['/control/render.js'].functionData[34]++;
  _$jscoverage['/control/render.js'].lineData[458]++;
  parsers[name] = v;
});
  }
});
    _$jscoverage['/control/render.js'].lineData[462]++;
    NewClass[HTML_PARSER] = parsers;
  }
  _$jscoverage['/control/render.js'].lineData[464]++;
  S.mix(NewClass[HTML_PARSER], SuperClass[HTML_PARSER], false);
  _$jscoverage['/control/render.js'].lineData[465]++;
  NewClass.extend = extend;
  _$jscoverage['/control/render.js'].lineData[466]++;
  return NewClass;
}, 
  ATTRS: {
  control: {
  setter: function(v) {
  _$jscoverage['/control/render.js'].functionData[35]++;
  _$jscoverage['/control/render.js'].lineData[473]++;
  this.control = v;
}}, 
  xtemplate: {
  value: XTemplateRuntime}, 
  contentTpl: {
  value: function(scopes) {
  _$jscoverage['/control/render.js'].functionData[36]++;
  _$jscoverage['/control/render.js'].lineData[481]++;
  return visit53_481_1(visit54_481_2(scopes && scopes[scopes.length - 1].content) || '');
}}}, 
  HTML_PARSER: {
  id: function(el) {
  _$jscoverage['/control/render.js'].functionData[37]++;
  _$jscoverage['/control/render.js'].lineData[488]++;
  var id = el[0].id;
  _$jscoverage['/control/render.js'].lineData[489]++;
  return id ? id : undefined;
}, 
  content: function(el) {
  _$jscoverage['/control/render.js'].functionData[38]++;
  _$jscoverage['/control/render.js'].lineData[492]++;
  return el.html();
}, 
  disabled: function(el) {
  _$jscoverage['/control/render.js'].functionData[39]++;
  _$jscoverage['/control/render.js'].lineData[495]++;
  return el.hasClass(this.getBaseCssClass("disabled"));
}}, 
  name: 'render'});
}, {
  requires: ['node', 'xtemplate/runtime', './process', './render-xtpl', 'component/manager']});
