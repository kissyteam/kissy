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
if (! _$jscoverage['/utils.js']) {
  _$jscoverage['/utils.js'] = {};
  _$jscoverage['/utils.js'].lineData = [];
  _$jscoverage['/utils.js'].lineData[6] = 0;
  _$jscoverage['/utils.js'].lineData[7] = 0;
  _$jscoverage['/utils.js'].lineData[32] = 0;
  _$jscoverage['/utils.js'].lineData[33] = 0;
  _$jscoverage['/utils.js'].lineData[34] = 0;
  _$jscoverage['/utils.js'].lineData[36] = 0;
  _$jscoverage['/utils.js'].lineData[39] = 0;
  _$jscoverage['/utils.js'].lineData[40] = 0;
  _$jscoverage['/utils.js'].lineData[42] = 0;
  _$jscoverage['/utils.js'].lineData[46] = 0;
  _$jscoverage['/utils.js'].lineData[48] = 0;
  _$jscoverage['/utils.js'].lineData[49] = 0;
  _$jscoverage['/utils.js'].lineData[51] = 0;
  _$jscoverage['/utils.js'].lineData[52] = 0;
  _$jscoverage['/utils.js'].lineData[54] = 0;
  _$jscoverage['/utils.js'].lineData[57] = 0;
  _$jscoverage['/utils.js'].lineData[58] = 0;
  _$jscoverage['/utils.js'].lineData[59] = 0;
  _$jscoverage['/utils.js'].lineData[60] = 0;
  _$jscoverage['/utils.js'].lineData[61] = 0;
  _$jscoverage['/utils.js'].lineData[62] = 0;
  _$jscoverage['/utils.js'].lineData[65] = 0;
  _$jscoverage['/utils.js'].lineData[67] = 0;
  _$jscoverage['/utils.js'].lineData[72] = 0;
  _$jscoverage['/utils.js'].lineData[75] = 0;
  _$jscoverage['/utils.js'].lineData[76] = 0;
  _$jscoverage['/utils.js'].lineData[78] = 0;
  _$jscoverage['/utils.js'].lineData[79] = 0;
  _$jscoverage['/utils.js'].lineData[83] = 0;
  _$jscoverage['/utils.js'].lineData[84] = 0;
  _$jscoverage['/utils.js'].lineData[85] = 0;
  _$jscoverage['/utils.js'].lineData[87] = 0;
  _$jscoverage['/utils.js'].lineData[89] = 0;
  _$jscoverage['/utils.js'].lineData[92] = 0;
  _$jscoverage['/utils.js'].lineData[93] = 0;
  _$jscoverage['/utils.js'].lineData[94] = 0;
  _$jscoverage['/utils.js'].lineData[98] = 0;
  _$jscoverage['/utils.js'].lineData[102] = 0;
  _$jscoverage['/utils.js'].lineData[103] = 0;
  _$jscoverage['/utils.js'].lineData[106] = 0;
  _$jscoverage['/utils.js'].lineData[115] = 0;
  _$jscoverage['/utils.js'].lineData[125] = 0;
  _$jscoverage['/utils.js'].lineData[127] = 0;
  _$jscoverage['/utils.js'].lineData[128] = 0;
  _$jscoverage['/utils.js'].lineData[131] = 0;
  _$jscoverage['/utils.js'].lineData[132] = 0;
  _$jscoverage['/utils.js'].lineData[134] = 0;
  _$jscoverage['/utils.js'].lineData[137] = 0;
  _$jscoverage['/utils.js'].lineData[140] = 0;
  _$jscoverage['/utils.js'].lineData[141] = 0;
  _$jscoverage['/utils.js'].lineData[143] = 0;
  _$jscoverage['/utils.js'].lineData[151] = 0;
  _$jscoverage['/utils.js'].lineData[152] = 0;
  _$jscoverage['/utils.js'].lineData[163] = 0;
  _$jscoverage['/utils.js'].lineData[165] = 0;
  _$jscoverage['/utils.js'].lineData[168] = 0;
  _$jscoverage['/utils.js'].lineData[169] = 0;
  _$jscoverage['/utils.js'].lineData[173] = 0;
  _$jscoverage['/utils.js'].lineData[177] = 0;
  _$jscoverage['/utils.js'].lineData[186] = 0;
  _$jscoverage['/utils.js'].lineData[192] = 0;
  _$jscoverage['/utils.js'].lineData[193] = 0;
  _$jscoverage['/utils.js'].lineData[194] = 0;
  _$jscoverage['/utils.js'].lineData[195] = 0;
  _$jscoverage['/utils.js'].lineData[196] = 0;
  _$jscoverage['/utils.js'].lineData[197] = 0;
  _$jscoverage['/utils.js'].lineData[198] = 0;
  _$jscoverage['/utils.js'].lineData[200] = 0;
  _$jscoverage['/utils.js'].lineData[202] = 0;
  _$jscoverage['/utils.js'].lineData[203] = 0;
  _$jscoverage['/utils.js'].lineData[205] = 0;
  _$jscoverage['/utils.js'].lineData[208] = 0;
  _$jscoverage['/utils.js'].lineData[212] = 0;
  _$jscoverage['/utils.js'].lineData[220] = 0;
  _$jscoverage['/utils.js'].lineData[222] = 0;
  _$jscoverage['/utils.js'].lineData[223] = 0;
  _$jscoverage['/utils.js'].lineData[229] = 0;
  _$jscoverage['/utils.js'].lineData[231] = 0;
  _$jscoverage['/utils.js'].lineData[232] = 0;
  _$jscoverage['/utils.js'].lineData[236] = 0;
  _$jscoverage['/utils.js'].lineData[237] = 0;
  _$jscoverage['/utils.js'].lineData[238] = 0;
  _$jscoverage['/utils.js'].lineData[240] = 0;
  _$jscoverage['/utils.js'].lineData[241] = 0;
  _$jscoverage['/utils.js'].lineData[243] = 0;
  _$jscoverage['/utils.js'].lineData[247] = 0;
  _$jscoverage['/utils.js'].lineData[250] = 0;
  _$jscoverage['/utils.js'].lineData[251] = 0;
  _$jscoverage['/utils.js'].lineData[253] = 0;
  _$jscoverage['/utils.js'].lineData[254] = 0;
  _$jscoverage['/utils.js'].lineData[255] = 0;
  _$jscoverage['/utils.js'].lineData[257] = 0;
  _$jscoverage['/utils.js'].lineData[258] = 0;
  _$jscoverage['/utils.js'].lineData[259] = 0;
  _$jscoverage['/utils.js'].lineData[260] = 0;
  _$jscoverage['/utils.js'].lineData[261] = 0;
  _$jscoverage['/utils.js'].lineData[263] = 0;
  _$jscoverage['/utils.js'].lineData[264] = 0;
  _$jscoverage['/utils.js'].lineData[265] = 0;
  _$jscoverage['/utils.js'].lineData[267] = 0;
  _$jscoverage['/utils.js'].lineData[268] = 0;
  _$jscoverage['/utils.js'].lineData[269] = 0;
  _$jscoverage['/utils.js'].lineData[271] = 0;
  _$jscoverage['/utils.js'].lineData[272] = 0;
  _$jscoverage['/utils.js'].lineData[273] = 0;
  _$jscoverage['/utils.js'].lineData[275] = 0;
  _$jscoverage['/utils.js'].lineData[278] = 0;
  _$jscoverage['/utils.js'].lineData[279] = 0;
  _$jscoverage['/utils.js'].lineData[280] = 0;
  _$jscoverage['/utils.js'].lineData[283] = 0;
  _$jscoverage['/utils.js'].lineData[286] = 0;
  _$jscoverage['/utils.js'].lineData[287] = 0;
  _$jscoverage['/utils.js'].lineData[288] = 0;
  _$jscoverage['/utils.js'].lineData[289] = 0;
  _$jscoverage['/utils.js'].lineData[292] = 0;
  _$jscoverage['/utils.js'].lineData[293] = 0;
  _$jscoverage['/utils.js'].lineData[301] = 0;
  _$jscoverage['/utils.js'].lineData[304] = 0;
  _$jscoverage['/utils.js'].lineData[306] = 0;
  _$jscoverage['/utils.js'].lineData[307] = 0;
  _$jscoverage['/utils.js'].lineData[309] = 0;
  _$jscoverage['/utils.js'].lineData[310] = 0;
  _$jscoverage['/utils.js'].lineData[312] = 0;
  _$jscoverage['/utils.js'].lineData[314] = 0;
  _$jscoverage['/utils.js'].lineData[315] = 0;
  _$jscoverage['/utils.js'].lineData[324] = 0;
  _$jscoverage['/utils.js'].lineData[327] = 0;
  _$jscoverage['/utils.js'].lineData[330] = 0;
  _$jscoverage['/utils.js'].lineData[331] = 0;
  _$jscoverage['/utils.js'].lineData[332] = 0;
  _$jscoverage['/utils.js'].lineData[337] = 0;
  _$jscoverage['/utils.js'].lineData[341] = 0;
  _$jscoverage['/utils.js'].lineData[343] = 0;
  _$jscoverage['/utils.js'].lineData[347] = 0;
  _$jscoverage['/utils.js'].lineData[350] = 0;
  _$jscoverage['/utils.js'].lineData[359] = 0;
  _$jscoverage['/utils.js'].lineData[360] = 0;
  _$jscoverage['/utils.js'].lineData[362] = 0;
  _$jscoverage['/utils.js'].lineData[376] = 0;
  _$jscoverage['/utils.js'].lineData[385] = 0;
  _$jscoverage['/utils.js'].lineData[391] = 0;
  _$jscoverage['/utils.js'].lineData[392] = 0;
  _$jscoverage['/utils.js'].lineData[393] = 0;
  _$jscoverage['/utils.js'].lineData[394] = 0;
  _$jscoverage['/utils.js'].lineData[395] = 0;
  _$jscoverage['/utils.js'].lineData[396] = 0;
  _$jscoverage['/utils.js'].lineData[397] = 0;
  _$jscoverage['/utils.js'].lineData[399] = 0;
  _$jscoverage['/utils.js'].lineData[400] = 0;
  _$jscoverage['/utils.js'].lineData[401] = 0;
  _$jscoverage['/utils.js'].lineData[404] = 0;
  _$jscoverage['/utils.js'].lineData[408] = 0;
  _$jscoverage['/utils.js'].lineData[418] = 0;
  _$jscoverage['/utils.js'].lineData[419] = 0;
  _$jscoverage['/utils.js'].lineData[421] = 0;
  _$jscoverage['/utils.js'].lineData[424] = 0;
  _$jscoverage['/utils.js'].lineData[425] = 0;
  _$jscoverage['/utils.js'].lineData[430] = 0;
  _$jscoverage['/utils.js'].lineData[431] = 0;
  _$jscoverage['/utils.js'].lineData[433] = 0;
  _$jscoverage['/utils.js'].lineData[443] = 0;
  _$jscoverage['/utils.js'].lineData[445] = 0;
  _$jscoverage['/utils.js'].lineData[448] = 0;
  _$jscoverage['/utils.js'].lineData[449] = 0;
  _$jscoverage['/utils.js'].lineData[450] = 0;
  _$jscoverage['/utils.js'].lineData[454] = 0;
  _$jscoverage['/utils.js'].lineData[456] = 0;
  _$jscoverage['/utils.js'].lineData[460] = 0;
  _$jscoverage['/utils.js'].lineData[466] = 0;
  _$jscoverage['/utils.js'].lineData[475] = 0;
  _$jscoverage['/utils.js'].lineData[477] = 0;
  _$jscoverage['/utils.js'].lineData[478] = 0;
  _$jscoverage['/utils.js'].lineData[481] = 0;
  _$jscoverage['/utils.js'].lineData[485] = 0;
  _$jscoverage['/utils.js'].lineData[491] = 0;
  _$jscoverage['/utils.js'].lineData[492] = 0;
  _$jscoverage['/utils.js'].lineData[494] = 0;
  _$jscoverage['/utils.js'].lineData[498] = 0;
  _$jscoverage['/utils.js'].lineData[501] = 0;
  _$jscoverage['/utils.js'].lineData[502] = 0;
  _$jscoverage['/utils.js'].lineData[504] = 0;
  _$jscoverage['/utils.js'].lineData[505] = 0;
  _$jscoverage['/utils.js'].lineData[507] = 0;
}
if (! _$jscoverage['/utils.js'].functionData) {
  _$jscoverage['/utils.js'].functionData = [];
  _$jscoverage['/utils.js'].functionData[0] = 0;
  _$jscoverage['/utils.js'].functionData[1] = 0;
  _$jscoverage['/utils.js'].functionData[2] = 0;
  _$jscoverage['/utils.js'].functionData[3] = 0;
  _$jscoverage['/utils.js'].functionData[4] = 0;
  _$jscoverage['/utils.js'].functionData[5] = 0;
  _$jscoverage['/utils.js'].functionData[6] = 0;
  _$jscoverage['/utils.js'].functionData[7] = 0;
  _$jscoverage['/utils.js'].functionData[8] = 0;
  _$jscoverage['/utils.js'].functionData[9] = 0;
  _$jscoverage['/utils.js'].functionData[10] = 0;
  _$jscoverage['/utils.js'].functionData[11] = 0;
  _$jscoverage['/utils.js'].functionData[12] = 0;
  _$jscoverage['/utils.js'].functionData[13] = 0;
  _$jscoverage['/utils.js'].functionData[14] = 0;
  _$jscoverage['/utils.js'].functionData[15] = 0;
  _$jscoverage['/utils.js'].functionData[16] = 0;
  _$jscoverage['/utils.js'].functionData[17] = 0;
  _$jscoverage['/utils.js'].functionData[18] = 0;
  _$jscoverage['/utils.js'].functionData[19] = 0;
  _$jscoverage['/utils.js'].functionData[20] = 0;
  _$jscoverage['/utils.js'].functionData[21] = 0;
  _$jscoverage['/utils.js'].functionData[22] = 0;
  _$jscoverage['/utils.js'].functionData[23] = 0;
  _$jscoverage['/utils.js'].functionData[24] = 0;
  _$jscoverage['/utils.js'].functionData[25] = 0;
  _$jscoverage['/utils.js'].functionData[26] = 0;
  _$jscoverage['/utils.js'].functionData[27] = 0;
  _$jscoverage['/utils.js'].functionData[28] = 0;
  _$jscoverage['/utils.js'].functionData[29] = 0;
  _$jscoverage['/utils.js'].functionData[30] = 0;
}
if (! _$jscoverage['/utils.js'].branchData) {
  _$jscoverage['/utils.js'].branchData = {};
  _$jscoverage['/utils.js'].branchData['33'] = [];
  _$jscoverage['/utils.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['39'] = [];
  _$jscoverage['/utils.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['48'] = [];
  _$jscoverage['/utils.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['51'] = [];
  _$jscoverage['/utils.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['59'] = [];
  _$jscoverage['/utils.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['65'] = [];
  _$jscoverage['/utils.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['79'] = [];
  _$jscoverage['/utils.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['85'] = [];
  _$jscoverage['/utils.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['86'] = [];
  _$jscoverage['/utils.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['99'] = [];
  _$jscoverage['/utils.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['102'] = [];
  _$jscoverage['/utils.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['115'] = [];
  _$jscoverage['/utils.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['127'] = [];
  _$jscoverage['/utils.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['131'] = [];
  _$jscoverage['/utils.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['132'] = [];
  _$jscoverage['/utils.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['140'] = [];
  _$jscoverage['/utils.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['168'] = [];
  _$jscoverage['/utils.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['194'] = [];
  _$jscoverage['/utils.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['197'] = [];
  _$jscoverage['/utils.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['197'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['200'] = [];
  _$jscoverage['/utils.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['200'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['202'] = [];
  _$jscoverage['/utils.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['222'] = [];
  _$jscoverage['/utils.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['229'] = [];
  _$jscoverage['/utils.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['231'] = [];
  _$jscoverage['/utils.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['236'] = [];
  _$jscoverage['/utils.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['237'] = [];
  _$jscoverage['/utils.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['250'] = [];
  _$jscoverage['/utils.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['253'] = [];
  _$jscoverage['/utils.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['258'] = [];
  _$jscoverage['/utils.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['263'] = [];
  _$jscoverage['/utils.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['267'] = [];
  _$jscoverage['/utils.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['271'] = [];
  _$jscoverage['/utils.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['272'] = [];
  _$jscoverage['/utils.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['278'] = [];
  _$jscoverage['/utils.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['286'] = [];
  _$jscoverage['/utils.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['306'] = [];
  _$jscoverage['/utils.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['310'] = [];
  _$jscoverage['/utils.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['327'] = [];
  _$jscoverage['/utils.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['331'] = [];
  _$jscoverage['/utils.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['331'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['341'] = [];
  _$jscoverage['/utils.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['359'] = [];
  _$jscoverage['/utils.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['393'] = [];
  _$jscoverage['/utils.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['394'] = [];
  _$jscoverage['/utils.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['394'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['396'] = [];
  _$jscoverage['/utils.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['399'] = [];
  _$jscoverage['/utils.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['400'] = [];
  _$jscoverage['/utils.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['419'] = [];
  _$jscoverage['/utils.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['421'] = [];
  _$jscoverage['/utils.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['424'] = [];
  _$jscoverage['/utils.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['430'] = [];
  _$jscoverage['/utils.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['448'] = [];
  _$jscoverage['/utils.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['448'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['477'] = [];
  _$jscoverage['/utils.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['504'] = [];
  _$jscoverage['/utils.js'].branchData['504'][1] = new BranchData();
}
_$jscoverage['/utils.js'].branchData['504'][1].init(56, 46, '!(m = str.match(/^\\s*["\']([^\'"\\s]+)["\']\\s*$/))');
function visit319_504_1(result) {
  _$jscoverage['/utils.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['477'][1].init(85, 8, '--i > -1');
function visit318_477_1(result) {
  _$jscoverage['/utils.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['448'][2].init(162, 28, 'module.factory !== undefined');
function visit317_448_2(result) {
  _$jscoverage['/utils.js'].branchData['448'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['448'][1].init(152, 38, 'module && module.factory !== undefined');
function visit316_448_1(result) {
  _$jscoverage['/utils.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['430'][1].init(527, 10, 'refModName');
function visit315_430_1(result) {
  _$jscoverage['/utils.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['424'][1].init(143, 11, 'modNames[i]');
function visit314_424_1(result) {
  _$jscoverage['/utils.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['421'][1].init(84, 5, 'i < l');
function visit313_421_1(result) {
  _$jscoverage['/utils.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['419'][1].init(51, 8, 'modNames');
function visit312_419_1(result) {
  _$jscoverage['/utils.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['400'][1].init(34, 9, '!alias[j]');
function visit311_400_1(result) {
  _$jscoverage['/utils.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['399'][1].init(217, 6, 'j >= 0');
function visit310_399_1(result) {
  _$jscoverage['/utils.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['396'][1].init(63, 25, 'typeof alias === \'string\'');
function visit309_396_1(result) {
  _$jscoverage['/utils.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['394'][2].init(68, 35, '(alias = m.getAlias()) !== undefined');
function visit308_394_2(result) {
  _$jscoverage['/utils.js'].branchData['394'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['394'][1].init(27, 77, '(m = Utils.createModuleInfo(ret[i])) && ((alias = m.getAlias()) !== undefined)');
function visit307_394_1(result) {
  _$jscoverage['/utils.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['393'][1].init(68, 6, 'i >= 0');
function visit306_393_1(result) {
  _$jscoverage['/utils.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['359'][1].init(18, 28, 'typeof modNames === \'string\'');
function visit305_359_1(result) {
  _$jscoverage['/utils.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['341'][1].init(720, 21, 'exports !== undefined');
function visit304_341_1(result) {
  _$jscoverage['/utils.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['331'][2].init(172, 36, 'module.requires.length && module.cjs');
function visit303_331_2(result) {
  _$jscoverage['/utils.js'].branchData['331'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['331'][1].init(153, 55, 'module.requires && module.requires.length && module.cjs');
function visit302_331_1(result) {
  _$jscoverage['/utils.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['327'][1].init(89, 29, 'typeof factory === \'function\'');
function visit301_327_1(result) {
  _$jscoverage['/utils.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['310'][1].init(308, 5, 'm.cjs');
function visit300_310_1(result) {
  _$jscoverage['/utils.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['306'][1].init(193, 19, 'status >= ATTACHING');
function visit299_306_1(result) {
  _$jscoverage['/utils.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['286'][1].init(1241, 82, 'Utils.checkModsLoadRecursively(m.getNormalizedRequires(), stack, errorList, cache)');
function visit298_286_1(result) {
  _$jscoverage['/utils.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['278'][1].init(1019, 14, 'stack[modName]');
function visit297_278_1(result) {
  _$jscoverage['/utils.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['272'][1].init(22, 14, 'stack[modName]');
function visit296_272_1(result) {
  _$jscoverage['/utils.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['271'][1].init(763, 9, '\'@DEBUG@\'');
function visit295_271_1(result) {
  _$jscoverage['/utils.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['267'][1].init(638, 17, 'status !== LOADED');
function visit294_267_1(result) {
  _$jscoverage['/utils.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['263'][1].init(507, 25, 'status >= READY_TO_ATTACH');
function visit293_263_1(result) {
  _$jscoverage['/utils.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['258'][1].init(347, 16, 'status === ERROR');
function visit292_258_1(result) {
  _$jscoverage['/utils.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['253'][1].init(205, 2, '!m');
function visit291_253_1(result) {
  _$jscoverage['/utils.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['250'][1].init(113, 16, 'modName in cache');
function visit290_250_1(result) {
  _$jscoverage['/utils.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['237'][1].init(22, 2, '!s');
function visit289_237_1(result) {
  _$jscoverage['/utils.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['236'][1].init(340, 5, 'i < l');
function visit288_236_1(result) {
  _$jscoverage['/utils.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['231'][1].init(176, 11, 'cache || {}');
function visit287_231_1(result) {
  _$jscoverage['/utils.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['229'][1].init(77, 11, 'stack || []');
function visit286_229_1(result) {
  _$jscoverage['/utils.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['222'][1].init(84, 5, 'i < l');
function visit285_222_1(result) {
  _$jscoverage['/utils.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['202'][1].init(398, 5, 'allOk');
function visit284_202_1(result) {
  _$jscoverage['/utils.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['200'][2].init(164, 21, 'm.status >= ATTACHING');
function visit283_200_2(result) {
  _$jscoverage['/utils.js'].branchData['200'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['200'][1].init(159, 26, 'm && m.status >= ATTACHING');
function visit282_200_1(result) {
  _$jscoverage['/utils.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['197'][2].init(137, 18, 'i < unalias.length');
function visit281_197_2(result) {
  _$jscoverage['/utils.js'].branchData['197'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['197'][1].init(128, 27, 'allOk && i < unalias.length');
function visit280_197_1(result) {
  _$jscoverage['/utils.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['194'][2].init(81, 26, 'module.getType() !== \'css\'');
function visit279_194_2(result) {
  _$jscoverage['/utils.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['194'][1].init(70, 37, '!module || module.getType() !== \'css\'');
function visit278_194_1(result) {
  _$jscoverage['/utils.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['168'][1].init(161, 6, 'module');
function visit277_168_1(result) {
  _$jscoverage['/utils.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['140'][1].init(477, 5, 'i < l');
function visit276_140_1(result) {
  _$jscoverage['/utils.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['132'][1].init(22, 55, 'startsWith(depName, \'../\') || startsWith(depName, \'./\')');
function visit275_132_1(result) {
  _$jscoverage['/utils.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['131'][1].init(126, 27, 'typeof depName === \'string\'');
function visit274_131_1(result) {
  _$jscoverage['/utils.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['127'][1].init(47, 8, '!depName');
function visit273_127_1(result) {
  _$jscoverage['/utils.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['115'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit272_115_1(result) {
  _$jscoverage['/utils.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['102'][2].init(2736, 76, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))');
function visit271_102_2(result) {
  _$jscoverage['/utils.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['102'][1].init(2736, 85, '((m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))) && m[1]');
function visit270_102_1(result) {
  _$jscoverage['/utils.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['99'][2].init(21, 20, 'host.navigator || {}');
function visit269_99_2(result) {
  _$jscoverage['/utils.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['99'][1].init(21, 37, '(host.navigator || {}).userAgent || \'\'');
function visit268_99_1(result) {
  _$jscoverage['/utils.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['86'][1].init(83, 12, 'm[1] || m[2]');
function visit267_86_1(result) {
  _$jscoverage['/utils.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['85'][1].init(34, 98, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit266_85_1(result) {
  _$jscoverage['/utils.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['79'][1].init(22, 9, 'c++ === 0');
function visit265_79_1(result) {
  _$jscoverage['/utils.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['65'][1].init(26, 12, 'Plugin.alias');
function visit264_65_1(result) {
  _$jscoverage['/utils.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['59'][1].init(54, 12, 'index !== -1');
function visit263_59_1(result) {
  _$jscoverage['/utils.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['51'][1].init(134, 23, 'S.endsWith(name, \'.js\')');
function visit262_51_1(result) {
  _$jscoverage['/utils.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['48'][1].init(40, 36, 'name.charAt(name.length - 1) === \'/\'');
function visit261_48_1(result) {
  _$jscoverage['/utils.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['39'][1].init(103, 5, 'i < l');
function visit260_39_1(result) {
  _$jscoverage['/utils.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['33'][1].init(14, 21, 'typeof s === \'string\'');
function visit259_33_1(result) {
  _$jscoverage['/utils.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/utils.js'].functionData[0]++;
  _$jscoverage['/utils.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, Env = S.Env, host = Env.host, TRUE = !0, FALSE = !1, mix = S.mix, startsWith = S.startsWith, data = Loader.Status, ATTACHED = data.ATTACHED, READY_TO_ATTACH = data.READY_TO_ATTACH, LOADED = data.LOADED, ATTACHING = data.ATTACHING, ERROR = data.ERROR, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/utils.js'].lineData[32]++;
  function addIndexAndRemoveJsExt(s) {
    _$jscoverage['/utils.js'].functionData[1]++;
    _$jscoverage['/utils.js'].lineData[33]++;
    if (visit259_33_1(typeof s === 'string')) {
      _$jscoverage['/utils.js'].lineData[34]++;
      return addIndexAndRemoveJsExtFromName(s);
    } else {
      _$jscoverage['/utils.js'].lineData[36]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/utils.js'].lineData[39]++;
      for (; visit260_39_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[40]++;
        ret[i] = addIndexAndRemoveJsExtFromName(s[i]);
      }
      _$jscoverage['/utils.js'].lineData[42]++;
      return ret;
    }
  }
  _$jscoverage['/utils.js'].lineData[46]++;
  function addIndexAndRemoveJsExtFromName(name) {
    _$jscoverage['/utils.js'].functionData[2]++;
    _$jscoverage['/utils.js'].lineData[48]++;
    if (visit261_48_1(name.charAt(name.length - 1) === '/')) {
      _$jscoverage['/utils.js'].lineData[49]++;
      name += 'index';
    }
    _$jscoverage['/utils.js'].lineData[51]++;
    if (visit262_51_1(S.endsWith(name, '.js'))) {
      _$jscoverage['/utils.js'].lineData[52]++;
      name = name.slice(0, -3);
    }
    _$jscoverage['/utils.js'].lineData[54]++;
    return name;
  }
  _$jscoverage['/utils.js'].lineData[57]++;
  function pluginAlias(name) {
    _$jscoverage['/utils.js'].functionData[3]++;
    _$jscoverage['/utils.js'].lineData[58]++;
    var index = name.indexOf('!');
    _$jscoverage['/utils.js'].lineData[59]++;
    if (visit263_59_1(index !== -1)) {
      _$jscoverage['/utils.js'].lineData[60]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/utils.js'].lineData[61]++;
      name = name.substring(index + 1);
      _$jscoverage['/utils.js'].lineData[62]++;
      S.use(pluginName, {
  sync: true, 
  success: function(S, Plugin) {
  _$jscoverage['/utils.js'].functionData[4]++;
  _$jscoverage['/utils.js'].lineData[65]++;
  if (visit264_65_1(Plugin.alias)) {
    _$jscoverage['/utils.js'].lineData[67]++;
    name = Plugin.alias(S, name, pluginName);
  }
}});
    }
    _$jscoverage['/utils.js'].lineData[72]++;
    return name;
  }
  _$jscoverage['/utils.js'].lineData[75]++;
  function numberify(s) {
    _$jscoverage['/utils.js'].functionData[5]++;
    _$jscoverage['/utils.js'].lineData[76]++;
    var c = 0;
    _$jscoverage['/utils.js'].lineData[78]++;
    return parseFloat(s.replace(/\./g, function() {
  _$jscoverage['/utils.js'].functionData[6]++;
  _$jscoverage['/utils.js'].lineData[79]++;
  return (visit265_79_1(c++ === 0)) ? '.' : '';
}));
  }
  _$jscoverage['/utils.js'].lineData[83]++;
  function getIEVersion() {
    _$jscoverage['/utils.js'].functionData[7]++;
    _$jscoverage['/utils.js'].lineData[84]++;
    var m, v;
    _$jscoverage['/utils.js'].lineData[85]++;
    if (visit266_85_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit267_86_1(m[1] || m[2]))))) {
      _$jscoverage['/utils.js'].lineData[87]++;
      return numberify(v);
    }
    _$jscoverage['/utils.js'].lineData[89]++;
    return undefined;
  }
  _$jscoverage['/utils.js'].lineData[92]++;
  function bind(fn, context) {
    _$jscoverage['/utils.js'].functionData[8]++;
    _$jscoverage['/utils.js'].lineData[93]++;
    return function() {
  _$jscoverage['/utils.js'].functionData[9]++;
  _$jscoverage['/utils.js'].lineData[94]++;
  return fn.apply(context, arguments);
};
  }
  _$jscoverage['/utils.js'].lineData[98]++;
  var m, ua = visit268_99_1((visit269_99_2(host.navigator || {})).userAgent || '');
  _$jscoverage['/utils.js'].lineData[102]++;
  if (visit270_102_1((visit271_102_2((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/)))) && m[1])) {
    _$jscoverage['/utils.js'].lineData[103]++;
    Utils.webkit = numberify(m[1]);
  }
  _$jscoverage['/utils.js'].lineData[106]++;
  mix(Utils, {
  ie: getIEVersion(), 
  docHead: function() {
  _$jscoverage['/utils.js'].functionData[10]++;
  _$jscoverage['/utils.js'].lineData[115]++;
  return visit272_115_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/utils.js'].functionData[11]++;
  _$jscoverage['/utils.js'].lineData[125]++;
  var i = 0, l;
  _$jscoverage['/utils.js'].lineData[127]++;
  if (visit273_127_1(!depName)) {
    _$jscoverage['/utils.js'].lineData[128]++;
    return depName;
  }
  _$jscoverage['/utils.js'].lineData[131]++;
  if (visit274_131_1(typeof depName === 'string')) {
    _$jscoverage['/utils.js'].lineData[132]++;
    if (visit275_132_1(startsWith(depName, '../') || startsWith(depName, './'))) {
      _$jscoverage['/utils.js'].lineData[134]++;
      return Path.resolve(Path.dirname(moduleName), depName);
    }
    _$jscoverage['/utils.js'].lineData[137]++;
    return Path.normalize(depName);
  }
  _$jscoverage['/utils.js'].lineData[140]++;
  for (l = depName.length; visit276_140_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[141]++;
    depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
  }
  _$jscoverage['/utils.js'].lineData[143]++;
  return depName;
}, 
  createModulesInfo: function(modNames) {
  _$jscoverage['/utils.js'].functionData[12]++;
  _$jscoverage['/utils.js'].lineData[151]++;
  S.each(modNames, function(m) {
  _$jscoverage['/utils.js'].functionData[13]++;
  _$jscoverage['/utils.js'].lineData[152]++;
  Utils.createModuleInfo(m);
});
}, 
  createModuleInfo: function(modName, cfg) {
  _$jscoverage['/utils.js'].functionData[14]++;
  _$jscoverage['/utils.js'].lineData[163]++;
  modName = addIndexAndRemoveJsExtFromName(modName);
  _$jscoverage['/utils.js'].lineData[165]++;
  var mods = Env.mods, module = mods[modName];
  _$jscoverage['/utils.js'].lineData[168]++;
  if (visit277_168_1(module)) {
    _$jscoverage['/utils.js'].lineData[169]++;
    return module;
  }
  _$jscoverage['/utils.js'].lineData[173]++;
  mods[modName] = module = new Loader.Module(mix({
  name: modName}, cfg));
  _$jscoverage['/utils.js'].lineData[177]++;
  return module;
}, 
  getModules: function(modNames) {
  _$jscoverage['/utils.js'].functionData[15]++;
  _$jscoverage['/utils.js'].lineData[186]++;
  var mods = [S], module, unalias, allOk, m, runtimeMods = Env.mods;
  _$jscoverage['/utils.js'].lineData[192]++;
  S.each(modNames, function(modName) {
  _$jscoverage['/utils.js'].functionData[16]++;
  _$jscoverage['/utils.js'].lineData[193]++;
  module = runtimeMods[modName];
  _$jscoverage['/utils.js'].lineData[194]++;
  if (visit278_194_1(!module || visit279_194_2(module.getType() !== 'css'))) {
    _$jscoverage['/utils.js'].lineData[195]++;
    unalias = Utils.unalias(modName);
    _$jscoverage['/utils.js'].lineData[196]++;
    allOk = true;
    _$jscoverage['/utils.js'].lineData[197]++;
    for (var i = 0; visit280_197_1(allOk && visit281_197_2(i < unalias.length)); i++) {
      _$jscoverage['/utils.js'].lineData[198]++;
      m = runtimeMods[unalias[i]];
      _$jscoverage['/utils.js'].lineData[200]++;
      allOk = visit282_200_1(m && visit283_200_2(m.status >= ATTACHING));
    }
    _$jscoverage['/utils.js'].lineData[202]++;
    if (visit284_202_1(allOk)) {
      _$jscoverage['/utils.js'].lineData[203]++;
      mods.push(runtimeMods[unalias[0]].exports);
    } else {
      _$jscoverage['/utils.js'].lineData[205]++;
      mods.push(null);
    }
  } else {
    _$jscoverage['/utils.js'].lineData[208]++;
    mods.push(undefined);
  }
});
  _$jscoverage['/utils.js'].lineData[212]++;
  return mods;
}, 
  attachModsRecursively: function(modNames) {
  _$jscoverage['/utils.js'].functionData[17]++;
  _$jscoverage['/utils.js'].lineData[220]++;
  var i, l = modNames.length;
  _$jscoverage['/utils.js'].lineData[222]++;
  for (i = 0; visit285_222_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[223]++;
    Utils.attachModRecursively(modNames[i]);
  }
}, 
  checkModsLoadRecursively: function(modNames, stack, errorList, cache) {
  _$jscoverage['/utils.js'].functionData[18]++;
  _$jscoverage['/utils.js'].lineData[229]++;
  stack = visit286_229_1(stack || []);
  _$jscoverage['/utils.js'].lineData[231]++;
  cache = visit287_231_1(cache || {});
  _$jscoverage['/utils.js'].lineData[232]++;
  var i, s = 1, l = modNames.length, stackDepth = stack.length;
  _$jscoverage['/utils.js'].lineData[236]++;
  for (i = 0; visit288_236_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[237]++;
    if (visit289_237_1(!s)) {
      _$jscoverage['/utils.js'].lineData[238]++;
      return !!s;
    }
    _$jscoverage['/utils.js'].lineData[240]++;
    s = Utils.checkModLoadRecursively(modNames[i], stack, errorList, cache);
    _$jscoverage['/utils.js'].lineData[241]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/utils.js'].lineData[243]++;
  return !!s;
}, 
  checkModLoadRecursively: function(modName, stack, errorList, cache) {
  _$jscoverage['/utils.js'].functionData[19]++;
  _$jscoverage['/utils.js'].lineData[247]++;
  var mods = Env.mods, status, m = mods[modName];
  _$jscoverage['/utils.js'].lineData[250]++;
  if (visit290_250_1(modName in cache)) {
    _$jscoverage['/utils.js'].lineData[251]++;
    return cache[modName];
  }
  _$jscoverage['/utils.js'].lineData[253]++;
  if (visit291_253_1(!m)) {
    _$jscoverage['/utils.js'].lineData[254]++;
    cache[modName] = FALSE;
    _$jscoverage['/utils.js'].lineData[255]++;
    return FALSE;
  }
  _$jscoverage['/utils.js'].lineData[257]++;
  status = m.status;
  _$jscoverage['/utils.js'].lineData[258]++;
  if (visit292_258_1(status === ERROR)) {
    _$jscoverage['/utils.js'].lineData[259]++;
    errorList.push(m);
    _$jscoverage['/utils.js'].lineData[260]++;
    cache[modName] = FALSE;
    _$jscoverage['/utils.js'].lineData[261]++;
    return FALSE;
  }
  _$jscoverage['/utils.js'].lineData[263]++;
  if (visit293_263_1(status >= READY_TO_ATTACH)) {
    _$jscoverage['/utils.js'].lineData[264]++;
    cache[modName] = TRUE;
    _$jscoverage['/utils.js'].lineData[265]++;
    return TRUE;
  }
  _$jscoverage['/utils.js'].lineData[267]++;
  if (visit294_267_1(status !== LOADED)) {
    _$jscoverage['/utils.js'].lineData[268]++;
    cache[modName] = FALSE;
    _$jscoverage['/utils.js'].lineData[269]++;
    return FALSE;
  }
  _$jscoverage['/utils.js'].lineData[271]++;
  if (visit295_271_1('@DEBUG@')) {
    _$jscoverage['/utils.js'].lineData[272]++;
    if (visit296_272_1(stack[modName])) {
      _$jscoverage['/utils.js'].lineData[273]++;
      S.log('find cyclic dependency between mods: ' + stack, 'warn');
    } else {
      _$jscoverage['/utils.js'].lineData[275]++;
      stack.push(modName);
    }
  }
  _$jscoverage['/utils.js'].lineData[278]++;
  if (visit297_278_1(stack[modName])) {
    _$jscoverage['/utils.js'].lineData[279]++;
    cache[modName] = TRUE;
    _$jscoverage['/utils.js'].lineData[280]++;
    return TRUE;
  } else {
    _$jscoverage['/utils.js'].lineData[283]++;
    stack[modName] = 1;
  }
  _$jscoverage['/utils.js'].lineData[286]++;
  if (visit298_286_1(Utils.checkModsLoadRecursively(m.getNormalizedRequires(), stack, errorList, cache))) {
    _$jscoverage['/utils.js'].lineData[287]++;
    m.status = READY_TO_ATTACH;
    _$jscoverage['/utils.js'].lineData[288]++;
    cache[modName] = TRUE;
    _$jscoverage['/utils.js'].lineData[289]++;
    return TRUE;
  }
  _$jscoverage['/utils.js'].lineData[292]++;
  cache[modName] = FALSE;
  _$jscoverage['/utils.js'].lineData[293]++;
  return FALSE;
}, 
  attachModRecursively: function(modName) {
  _$jscoverage['/utils.js'].functionData[20]++;
  _$jscoverage['/utils.js'].lineData[301]++;
  var mods = Env.mods, status, m = mods[modName];
  _$jscoverage['/utils.js'].lineData[304]++;
  status = m.status;
  _$jscoverage['/utils.js'].lineData[306]++;
  if (visit299_306_1(status >= ATTACHING)) {
    _$jscoverage['/utils.js'].lineData[307]++;
    return;
  }
  _$jscoverage['/utils.js'].lineData[309]++;
  m.status = ATTACHING;
  _$jscoverage['/utils.js'].lineData[310]++;
  if (visit300_310_1(m.cjs)) {
    _$jscoverage['/utils.js'].lineData[312]++;
    Utils.attachMod(m);
  } else {
    _$jscoverage['/utils.js'].lineData[314]++;
    Utils.attachModsRecursively(m.getNormalizedRequires());
    _$jscoverage['/utils.js'].lineData[315]++;
    Utils.attachMod(m);
  }
}, 
  attachMod: function(module) {
  _$jscoverage['/utils.js'].functionData[21]++;
  _$jscoverage['/utils.js'].lineData[324]++;
  var factory = module.factory, exports;
  _$jscoverage['/utils.js'].lineData[327]++;
  if (visit301_327_1(typeof factory === 'function')) {
    _$jscoverage['/utils.js'].lineData[330]++;
    var require;
    _$jscoverage['/utils.js'].lineData[331]++;
    if (visit302_331_1(module.requires && visit303_331_2(module.requires.length && module.cjs))) {
      _$jscoverage['/utils.js'].lineData[332]++;
      require = bind(module.require, module);
    }
    _$jscoverage['/utils.js'].lineData[337]++;
    exports = factory.apply(module, (module.cjs ? [S, require, module.exports, module] : Utils.getModules(module.getRequiresWithAlias())));
    _$jscoverage['/utils.js'].lineData[341]++;
    if (visit304_341_1(exports !== undefined)) {
      _$jscoverage['/utils.js'].lineData[343]++;
      module.exports = exports;
    }
  } else {
    _$jscoverage['/utils.js'].lineData[347]++;
    module.exports = factory;
  }
  _$jscoverage['/utils.js'].lineData[350]++;
  module.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/utils.js'].functionData[22]++;
  _$jscoverage['/utils.js'].lineData[359]++;
  if (visit305_359_1(typeof modNames === 'string')) {
    _$jscoverage['/utils.js'].lineData[360]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/utils.js'].lineData[362]++;
  return modNames;
}, 
  normalizeModNames: function(modNames, refModName) {
  _$jscoverage['/utils.js'].functionData[23]++;
  _$jscoverage['/utils.js'].lineData[376]++;
  return Utils.unalias(Utils.normalizeModNamesWithAlias(modNames, refModName));
}, 
  unalias: function(names) {
  _$jscoverage['/utils.js'].functionData[24]++;
  _$jscoverage['/utils.js'].lineData[385]++;
  var ret = [].concat(names), i, m, alias, ok = 0, j;
  _$jscoverage['/utils.js'].lineData[391]++;
  while (!ok) {
    _$jscoverage['/utils.js'].lineData[392]++;
    ok = 1;
    _$jscoverage['/utils.js'].lineData[393]++;
    for (i = ret.length - 1; visit306_393_1(i >= 0); i--) {
      _$jscoverage['/utils.js'].lineData[394]++;
      if (visit307_394_1((m = Utils.createModuleInfo(ret[i])) && (visit308_394_2((alias = m.getAlias()) !== undefined)))) {
        _$jscoverage['/utils.js'].lineData[395]++;
        ok = 0;
        _$jscoverage['/utils.js'].lineData[396]++;
        if (visit309_396_1(typeof alias === 'string')) {
          _$jscoverage['/utils.js'].lineData[397]++;
          alias = [alias];
        }
        _$jscoverage['/utils.js'].lineData[399]++;
        for (j = alias.length - 1; visit310_399_1(j >= 0); j--) {
          _$jscoverage['/utils.js'].lineData[400]++;
          if (visit311_400_1(!alias[j])) {
            _$jscoverage['/utils.js'].lineData[401]++;
            alias.splice(j, 1);
          }
        }
        _$jscoverage['/utils.js'].lineData[404]++;
        ret.splice.apply(ret, [i, 1].concat(addIndexAndRemoveJsExt(alias)));
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[408]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(modNames, refModName) {
  _$jscoverage['/utils.js'].functionData[25]++;
  _$jscoverage['/utils.js'].lineData[418]++;
  var ret = [], i, l;
  _$jscoverage['/utils.js'].lineData[419]++;
  if (visit312_419_1(modNames)) {
    _$jscoverage['/utils.js'].lineData[421]++;
    for (i = 0 , l = modNames.length; visit313_421_1(i < l); i++) {
      _$jscoverage['/utils.js'].lineData[424]++;
      if (visit314_424_1(modNames[i])) {
        _$jscoverage['/utils.js'].lineData[425]++;
        ret.push(pluginAlias(addIndexAndRemoveJsExt(modNames[i])));
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[430]++;
  if (visit315_430_1(refModName)) {
    _$jscoverage['/utils.js'].lineData[431]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/utils.js'].lineData[433]++;
  return ret;
}, 
  registerModule: function(name, factory, config) {
  _$jscoverage['/utils.js'].functionData[26]++;
  _$jscoverage['/utils.js'].lineData[443]++;
  name = addIndexAndRemoveJsExtFromName(name);
  _$jscoverage['/utils.js'].lineData[445]++;
  var mods = Env.mods, module = mods[name];
  _$jscoverage['/utils.js'].lineData[448]++;
  if (visit316_448_1(module && visit317_448_2(module.factory !== undefined))) {
    _$jscoverage['/utils.js'].lineData[449]++;
    S.log(name + ' is defined more than once', 'warn');
    _$jscoverage['/utils.js'].lineData[450]++;
    return;
  }
  _$jscoverage['/utils.js'].lineData[454]++;
  Utils.createModuleInfo(name);
  _$jscoverage['/utils.js'].lineData[456]++;
  module = mods[name];
  _$jscoverage['/utils.js'].lineData[460]++;
  mix(module, {
  name: name, 
  status: LOADED, 
  factory: factory});
  _$jscoverage['/utils.js'].lineData[466]++;
  mix(module, config);
}, 
  getHash: function(str) {
  _$jscoverage['/utils.js'].functionData[27]++;
  _$jscoverage['/utils.js'].lineData[475]++;
  var hash = 5381, i;
  _$jscoverage['/utils.js'].lineData[477]++;
  for (i = str.length; visit318_477_1(--i > -1); ) {
    _$jscoverage['/utils.js'].lineData[478]++;
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  _$jscoverage['/utils.js'].lineData[481]++;
  return hash + '';
}, 
  getRequiresFromFn: function(fn) {
  _$jscoverage['/utils.js'].functionData[28]++;
  _$jscoverage['/utils.js'].lineData[485]++;
  var requires = [];
  _$jscoverage['/utils.js'].lineData[491]++;
  fn.toString().replace(commentRegExp, '').replace(requireRegExp, function(match, dep) {
  _$jscoverage['/utils.js'].functionData[29]++;
  _$jscoverage['/utils.js'].lineData[492]++;
  requires.push(getRequireVal(dep));
});
  _$jscoverage['/utils.js'].lineData[494]++;
  return requires;
}});
  _$jscoverage['/utils.js'].lineData[498]++;
  var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, requireRegExp = /[^.'"]\s*require\s*\(([^)]+)\)/g;
  _$jscoverage['/utils.js'].lineData[501]++;
  function getRequireVal(str) {
    _$jscoverage['/utils.js'].functionData[30]++;
    _$jscoverage['/utils.js'].lineData[502]++;
    var m;
    _$jscoverage['/utils.js'].lineData[504]++;
    if (visit319_504_1(!(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/)))) {
      _$jscoverage['/utils.js'].lineData[505]++;
      S.error('can not find required mod in require call: ' + str);
    }
    _$jscoverage['/utils.js'].lineData[507]++;
    return m[1];
  }
})(KISSY);
