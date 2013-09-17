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
if (! _$jscoverage['/kison/grammar.js']) {
  _$jscoverage['/kison/grammar.js'] = {};
  _$jscoverage['/kison/grammar.js'].lineData = [];
  _$jscoverage['/kison/grammar.js'].lineData[6] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[7] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[21] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[22] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[23] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[24] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[26] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[29] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[30] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[31] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[32] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[35] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[38] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[39] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[41] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[42] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[44] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[45] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[47] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[48] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[50] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[51] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[52] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[54] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[56] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[57] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[58] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[60] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[68] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[70] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[74] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[79] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[80] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[81] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[82] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[83] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[85] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[88] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[89] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[90] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[91] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[92] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[93] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[94] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[98] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[102] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[103] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[104] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[105] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[106] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[112] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[117] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[118] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[121] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[122] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[127] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[129] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[130] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[131] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[140] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[152] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[153] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[158] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[159] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[160] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[161] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[162] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[163] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[166] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[167] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[173] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[175] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[176] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[177] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[178] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[179] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[180] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[190] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[193] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[194] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[195] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[196] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[199] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[201] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[202] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[205] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[210] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[216] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[217] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[218] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[219] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[221] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[223] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[224] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[226] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[228] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[229] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[232] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[237] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[245] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[246] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[254] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[255] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[256] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[257] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[258] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[262] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[264] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[265] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[266] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[267] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[269] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[270] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[271] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[279] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[284] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[285] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[286] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[288] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[295] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[296] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[297] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[298] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[301] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[302] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[304] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[318] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[319] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[320] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[322] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[323] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[324] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[333] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[337] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[339] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[340] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[343] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[344] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[350] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[351] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[352] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[354] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[355] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[359] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[363] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[364] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[365] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[366] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[369] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[375] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[381] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[383] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[393] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[395] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[398] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[400] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[401] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[402] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[403] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[404] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[406] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[407] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[411] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[412] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[415] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[417] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[419] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[420] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[423] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[425] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[426] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[428] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[429] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[432] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[433] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[441] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[444] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[445] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[446] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[447] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[448] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[450] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[452] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[456] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[458] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[459] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[460] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[463] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[464] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[465] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[466] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[470] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[477] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[491] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[492] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[493] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[495] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[497] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[499] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[500] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[501] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[502] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[503] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[504] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[505] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[506] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[507] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[508] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[509] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[510] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[511] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[513] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[514] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[515] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[516] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[517] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[518] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[520] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[523] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[528] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[529] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[530] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[531] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[532] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[533] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[534] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[535] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[537] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[538] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[539] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[540] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[541] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[542] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[544] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[551] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[552] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[553] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[554] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[555] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[556] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[557] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[558] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[559] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[560] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[561] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[563] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[564] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[565] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[566] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[567] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[568] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[569] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[570] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[571] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[572] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[574] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[576] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[577] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[578] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[579] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[580] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[581] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[583] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[584] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[585] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[586] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[587] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[588] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[589] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[590] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[591] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[592] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[594] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[602] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[609] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[610] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[611] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[612] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[615] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[617] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[619] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[620] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[621] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[622] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[623] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[624] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[625] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[626] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[628] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[629] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[631] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[635] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[637] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[638] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[639] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[643] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[647] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[649] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[654] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[656] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[658] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[659] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[661] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[662] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[664] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[667] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[669] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[671] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[676] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[678] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[680] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[681] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[684] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[685] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[686] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[687] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[688] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[707] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[708] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[710] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[711] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[722] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[723] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[735] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[737] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[739] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[741] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[742] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[745] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[746] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[747] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[751] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[753] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[754] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[755] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[756] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[757] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[760] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[763] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[764] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[767] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[769] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[771] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[774] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[777] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[779] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[782] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[791] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[793] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[794] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[797] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[798] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[801] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[802] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[804] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[807] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[808] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[809] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[812] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[814] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[816] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[818] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[820] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[823] = 0;
  _$jscoverage['/kison/grammar.js'].lineData[828] = 0;
}
if (! _$jscoverage['/kison/grammar.js'].functionData) {
  _$jscoverage['/kison/grammar.js'].functionData = [];
  _$jscoverage['/kison/grammar.js'].functionData[0] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[1] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[2] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[3] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[4] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[5] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[6] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[7] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[8] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[9] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[10] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[11] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[12] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[13] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[14] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[15] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[16] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[17] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[18] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[19] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[20] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[21] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[22] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[23] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[24] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[25] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[26] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[27] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[28] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[29] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[30] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[31] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[32] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[33] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[34] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[35] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[36] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[37] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[38] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[39] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[40] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[41] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[42] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[43] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[44] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[45] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[46] = 0;
  _$jscoverage['/kison/grammar.js'].functionData[47] = 0;
}
if (! _$jscoverage['/kison/grammar.js'].branchData) {
  _$jscoverage['/kison/grammar.js'].branchData = {};
  _$jscoverage['/kison/grammar.js'].branchData['30'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['31'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['51'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['57'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['100'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['104'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['105'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['121'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['130'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['159'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['162'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['166'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['175'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['178'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['193'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['195'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['201'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['216'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['218'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['223'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['228'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['256'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['269'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['302'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['318'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['320'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['343'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['350'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['364'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['365'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['406'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['411'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['419'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['425'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['444'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['446'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['448'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['450'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['495'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['502'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['503'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['504'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['505'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['509'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['509'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['523'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['533'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['533'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['553'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['554'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['559'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['559'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['576'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['579'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['579'][2] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['622'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['624'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['624'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['628'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['647'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['647'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['661'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['680'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['707'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['707'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['741'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['741'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['745'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['745'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['751'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['751'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['753'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['753'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['755'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['755'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['783'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['783'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['784'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['784'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['785'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['785'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['793'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['793'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['797'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['797'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['801'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['801'][1] = new BranchData();
  _$jscoverage['/kison/grammar.js'].branchData['807'] = [];
  _$jscoverage['/kison/grammar.js'].branchData['807'][1] = new BranchData();
}
_$jscoverage['/kison/grammar.js'].branchData['807'][1].init(1078, 3, 'len');
function visit74_807_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['807'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['801'][1].init(903, 17, 'ret !== undefined');
function visit73_801_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['801'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['797'][1].init(779, 13, 'reducedAction');
function visit72_797_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['797'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['793'][1].init(625, 7, 'i < len');
function visit71_793_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['793'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['785'][1].init(260, 31, 'production.rhs || production[1]');
function visit70_785_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['785'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['784'][1].init(186, 34, 'production.action || production[2]');
function visit69_784_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['784'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['783'][1].init(109, 34, 'production.symbol || production[0]');
function visit68_783_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['783'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['755'][1].init(65, 18, 'tableAction[state]');
function visit67_755_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['755'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['753'][1].init(488, 7, '!action');
function visit66_753_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['753'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['751'][1].init(419, 48, 'tableAction[state] && tableAction[state][symbol]');
function visit65_751_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['751'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['745'][1].init(206, 7, '!symbol');
function visit64_745_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['745'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['741'][1].init(122, 7, '!symbol');
function visit63_741_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['741'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['707'][1].init(26, 22, '!(v instanceof Lexer)');
function visit62_707_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['680'][1].init(953, 18, 'cfg.compressSymbol');
function visit61_680_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['661'][1].init(129, 6, 'action');
function visit60_661_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['647'][1].init(20, 9, 'cfg || {}');
function visit59_647_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['647'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['628'][1].init(489, 31, 'type == GrammarConst.SHIFT_TYPE');
function visit58_628_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['624'][1].init(197, 32, 'type == GrammarConst.REDUCE_TYPE');
function visit57_624_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['624'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['622'][1].init(91, 32, 'type == GrammarConst.ACCEPT_TYPE');
function visit56_622_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['579'][2].init(200, 8, 'val != t');
function visit55_579_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['579'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['579'][1].init(195, 13, 't && val != t');
function visit54_579_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['576'][1].init(37, 14, 'gotos[i] || {}');
function visit53_576_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['559'][2].init(342, 30, 't.toString() != val.toString()');
function visit52_559_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['559'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['559'][1].init(337, 35, 't && t.toString() != val.toString()');
function visit51_559_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['554'][1].init(38, 15, 'action[i] || {}');
function visit50_554_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['553'][1].init(56, 21, '!nonTerminals[symbol]');
function visit49_553_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['533'][2].init(333, 30, 't.toString() != val.toString()');
function visit48_533_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['533'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['533'][1].init(328, 35, 't && t.toString() != val.toString()');
function visit47_533_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['523'][1].init(42, 15, 'action[i] || {}');
function visit46_523_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['509'][2].init(300, 30, 't.toString() != val.toString()');
function visit45_509_2(result) {
  _$jscoverage['/kison/grammar.js'].branchData['509'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['509'][1].init(295, 35, 't && t.toString() != val.toString()');
function visit44_509_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['505'][1].init(46, 15, 'action[i] || {}');
function visit43_505_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['504'][1].init(34, 35, 'item.get("lookAhead")[mappedEndTag]');
function visit42_504_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['503'][1].init(30, 42, 'production.get("symbol") == mappedStartTag');
function visit41_503_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['502'][1].init(118, 55, 'item.get("dotPosition") == production.get("rhs").length');
function visit40_502_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['495'][1].init(647, 19, 'i < itemSets.length');
function visit39_495_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['450'][1].init(44, 27, 'k < one.get("items").length');
function visit38_450_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['448'][1].init(66, 21, 'one.equals(two, true)');
function visit37_448_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['446'][1].init(70, 19, 'j < itemSets.length');
function visit36_446_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['444'][1].init(111, 19, 'i < itemSets.length');
function visit35_444_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['425'][1].init(678, 10, 'index > -1');
function visit34_425_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['419'][1].init(483, 22, 'itemSetNew.size() == 0');
function visit33_419_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['411'][1].init(232, 23, 'itemSet.__cache[symbol]');
function visit32_411_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['406'][1].init(32, 16, '!itemSet.__cache');
function visit31_406_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['365'][1].init(22, 27, 'itemSets[i].equals(itemSet)');
function visit30_365_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['364'][1].init(79, 19, 'i < itemSets.length');
function visit29_364_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['350'][1].init(293, 15, 'itemIndex != -1');
function visit28_350_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['343'][1].init(210, 15, 'markSymbol == x');
function visit27_343_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['320'][1].init(115, 46, 'cont || (!!findItem.addLookAhead(finalFirsts))');
function visit26_320_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['318'][1].init(629, 15, 'itemIndex != -1');
function visit25_318_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['302'][1].init(30, 29, 'p2.get("symbol") == dotSymbol');
function visit24_302_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['269'][1].init(292, 54, 'setSize(firsts) !== setSize(nonTerminal.get("firsts"))');
function visit23_269_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['256'][1].init(99, 53, 'setSize(firsts) !== setSize(production.get("firsts"))');
function visit22_256_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['228'][1].init(664, 21, '!nonTerminals[symbol]');
function visit21_228_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['223'][1].init(233, 19, '!self.isNullable(t)');
function visit20_223_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['218'][1].init(26, 16, '!nonTerminals[t]');
function visit19_218_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['216'][1].init(196, 23, 'symbol instanceof Array');
function visit18_216_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['201'][1].init(424, 21, '!nonTerminals[symbol]');
function visit17_201_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['195'][1].init(26, 19, '!self.isNullable(t)');
function visit16_195_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['193'][1].init(126, 23, 'symbol instanceof Array');
function visit15_193_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['178'][1].init(34, 26, 'production.get("nullable")');
function visit14_178_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['175'][1].init(28, 37, '!nonTerminals[symbol].get("nullable")');
function visit13_175_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['166'][1].init(298, 7, 'n === i');
function visit12_166_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['162'][1].init(34, 18, 'self.isNullable(t)');
function visit11_162_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['159'][1].init(26, 27, '!production.get("nullable")');
function visit10_159_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['130'][1].init(26, 43, '!terminals[handle] && !nonTerminals[handle]');
function visit9_130_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['121'][1].init(137, 12, '!nonTerminal');
function visit8_121_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['105'][1].init(74, 5, 'token');
function visit7_105_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['104'][1].init(30, 21, 'rule.token || rule[0]');
function visit6_104_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['100'][1].init(85, 20, 'lexer && lexer.rules');
function visit5_100_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['57'][1].init(703, 42, 'action[GrammarConst.TO_INDEX] != undefined');
function visit4_57_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['51'][1].init(445, 50, 'action[GrammarConst.PRODUCTION_INDEX] != undefined');
function visit3_51_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['31'][1].init(18, 20, 'obj.equals(array[i])');
function visit2_31_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].branchData['30'][1].init(26, 16, 'i < array.length');
function visit1_30_1(result) {
  _$jscoverage['/kison/grammar.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/grammar.js'].lineData[6]++;
KISSY.add("kison/grammar", function(S, Base, Utils, Item, ItemSet, NonTerminal, Lexer, Production) {
  _$jscoverage['/kison/grammar.js'].functionData[0]++;
  _$jscoverage['/kison/grammar.js'].lineData[7]++;
  var GrammarConst = {
  SHIFT_TYPE: 1, 
  REDUCE_TYPE: 2, 
  ACCEPT_TYPE: 0, 
  TYPE_INDEX: 0, 
  PRODUCTION_INDEX: 1, 
  TO_INDEX: 2}, logger = S.getLogger('s/kison'), serializeObject = Utils.serializeObject, mix = S.mix, END_TAG = Lexer.STATIC.END_TAG, START_TAG = '$START';
  _$jscoverage['/kison/grammar.js'].lineData[21]++;
  function setSize(set3) {
    _$jscoverage['/kison/grammar.js'].functionData[1]++;
    _$jscoverage['/kison/grammar.js'].lineData[22]++;
    var count = 0, i;
    _$jscoverage['/kison/grammar.js'].lineData[23]++;
    for (i in set3) {
      _$jscoverage['/kison/grammar.js'].lineData[24]++;
      count++;
    }
    _$jscoverage['/kison/grammar.js'].lineData[26]++;
    return count;
  }
  _$jscoverage['/kison/grammar.js'].lineData[29]++;
  function indexOf(obj, array) {
    _$jscoverage['/kison/grammar.js'].functionData[2]++;
    _$jscoverage['/kison/grammar.js'].lineData[30]++;
    for (var i = 0; visit1_30_1(i < array.length); i++) {
      _$jscoverage['/kison/grammar.js'].lineData[31]++;
      if (visit2_31_1(obj.equals(array[i]))) {
        _$jscoverage['/kison/grammar.js'].lineData[32]++;
        return i;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[35]++;
    return -1;
  }
  _$jscoverage['/kison/grammar.js'].lineData[38]++;
  function visualizeAction(action, productions, itemSets) {
    _$jscoverage['/kison/grammar.js'].functionData[3]++;
    _$jscoverage['/kison/grammar.js'].lineData[39]++;
    switch (action[GrammarConst.TYPE_INDEX]) {
      case GrammarConst.SHIFT_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[41]++;
        logger.debug('shift');
        _$jscoverage['/kison/grammar.js'].lineData[42]++;
        break;
      case GrammarConst.REDUCE_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[44]++;
        logger.debug('reduce');
        _$jscoverage['/kison/grammar.js'].lineData[45]++;
        break;
      case GrammarConst.ACCEPT_TYPE:
        _$jscoverage['/kison/grammar.js'].lineData[47]++;
        logger.debug('accept');
        _$jscoverage['/kison/grammar.js'].lineData[48]++;
        break;
    }
    _$jscoverage['/kison/grammar.js'].lineData[50]++;
    logger.debug('from production:');
    _$jscoverage['/kison/grammar.js'].lineData[51]++;
    if (visit3_51_1(action[GrammarConst.PRODUCTION_INDEX] != undefined)) {
      _$jscoverage['/kison/grammar.js'].lineData[52]++;
      logger.debug(productions[action[GrammarConst.PRODUCTION_INDEX]] + '');
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[54]++;
      logger.debug('undefined');
    }
    _$jscoverage['/kison/grammar.js'].lineData[56]++;
    logger.debug('to itemSet:');
    _$jscoverage['/kison/grammar.js'].lineData[57]++;
    if (visit4_57_1(action[GrammarConst.TO_INDEX] != undefined)) {
      _$jscoverage['/kison/grammar.js'].lineData[58]++;
      logger.debug(itemSets[action[GrammarConst.TO_INDEX]].toString(1));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[60]++;
      logger.debug('undefined');
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[68]++;
  return Base.extend({
  build: function() {
  _$jscoverage['/kison/grammar.js'].functionData[4]++;
  _$jscoverage['/kison/grammar.js'].lineData[70]++;
  var self = this, lexer = self.lexer, vs = self.get('productions');
  _$jscoverage['/kison/grammar.js'].lineData[74]++;
  vs.unshift({
  symbol: START_TAG, 
  rhs: [vs[0].symbol]});
  _$jscoverage['/kison/grammar.js'].lineData[79]++;
  S.each(vs, function(v, index) {
  _$jscoverage['/kison/grammar.js'].functionData[5]++;
  _$jscoverage['/kison/grammar.js'].lineData[80]++;
  v.symbol = lexer.mapSymbol(v.symbol);
  _$jscoverage['/kison/grammar.js'].lineData[81]++;
  var rhs = v.rhs;
  _$jscoverage['/kison/grammar.js'].lineData[82]++;
  S.each(rhs, function(r, index) {
  _$jscoverage['/kison/grammar.js'].functionData[6]++;
  _$jscoverage['/kison/grammar.js'].lineData[83]++;
  rhs[index] = lexer.mapSymbol(r);
});
  _$jscoverage['/kison/grammar.js'].lineData[85]++;
  vs[index] = new Production(v);
});
  _$jscoverage['/kison/grammar.js'].lineData[88]++;
  self.buildTerminals();
  _$jscoverage['/kison/grammar.js'].lineData[89]++;
  self.buildNonTerminals();
  _$jscoverage['/kison/grammar.js'].lineData[90]++;
  self.buildNullable();
  _$jscoverage['/kison/grammar.js'].lineData[91]++;
  self.buildFirsts();
  _$jscoverage['/kison/grammar.js'].lineData[92]++;
  self.buildItemSet();
  _$jscoverage['/kison/grammar.js'].lineData[93]++;
  self.buildLalrItemSets();
  _$jscoverage['/kison/grammar.js'].lineData[94]++;
  self.buildTable();
}, 
  buildTerminals: function() {
  _$jscoverage['/kison/grammar.js'].functionData[7]++;
  _$jscoverage['/kison/grammar.js'].lineData[98]++;
  var self = this, lexer = self.get("lexer"), rules = visit5_100_1(lexer && lexer.rules), terminals = self.get("terminals");
  _$jscoverage['/kison/grammar.js'].lineData[102]++;
  terminals[lexer.mapSymbol(END_TAG)] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[103]++;
  S.each(rules, function(rule) {
  _$jscoverage['/kison/grammar.js'].functionData[8]++;
  _$jscoverage['/kison/grammar.js'].lineData[104]++;
  var token = visit6_104_1(rule.token || rule[0]);
  _$jscoverage['/kison/grammar.js'].lineData[105]++;
  if (visit7_105_1(token)) {
    _$jscoverage['/kison/grammar.js'].lineData[106]++;
    terminals[token] = 1;
  }
});
}, 
  buildNonTerminals: function() {
  _$jscoverage['/kison/grammar.js'].functionData[9]++;
  _$jscoverage['/kison/grammar.js'].lineData[112]++;
  var self = this, terminals = self.get("terminals"), nonTerminals = self.get("nonTerminals"), productions = self.get("productions");
  _$jscoverage['/kison/grammar.js'].lineData[117]++;
  S.each(productions, function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[10]++;
  _$jscoverage['/kison/grammar.js'].lineData[118]++;
  var symbol = production.get("symbol"), nonTerminal = nonTerminals[symbol];
  _$jscoverage['/kison/grammar.js'].lineData[121]++;
  if (visit8_121_1(!nonTerminal)) {
    _$jscoverage['/kison/grammar.js'].lineData[122]++;
    nonTerminal = nonTerminals[symbol] = new NonTerminal({
  symbol: symbol});
  }
  _$jscoverage['/kison/grammar.js'].lineData[127]++;
  nonTerminal.get("productions").push(production);
  _$jscoverage['/kison/grammar.js'].lineData[129]++;
  S.each(production.get("handles"), function(handle) {
  _$jscoverage['/kison/grammar.js'].functionData[11]++;
  _$jscoverage['/kison/grammar.js'].lineData[130]++;
  if (visit9_130_1(!terminals[handle] && !nonTerminals[handle])) {
    _$jscoverage['/kison/grammar.js'].lineData[131]++;
    nonTerminals[handle] = new NonTerminal({
  symbol: handle});
  }
});
});
}, 
  buildNullable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[12]++;
  _$jscoverage['/kison/grammar.js'].lineData[140]++;
  var self = this, i, rhs, n, symbol, t, production, productions, nonTerminals = self.get("nonTerminals"), cont = true;
  _$jscoverage['/kison/grammar.js'].lineData[152]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[153]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[158]++;
    S.each(self.get("productions"), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[13]++;
  _$jscoverage['/kison/grammar.js'].lineData[159]++;
  if (visit10_159_1(!production.get("nullable"))) {
    _$jscoverage['/kison/grammar.js'].lineData[160]++;
    rhs = production.get("rhs");
    _$jscoverage['/kison/grammar.js'].lineData[161]++;
    for (i = 0 , n = 0; t = rhs[i]; ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[162]++;
      if (visit11_162_1(self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[163]++;
        n++;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[166]++;
    if (visit12_166_1(n === i)) {
      _$jscoverage['/kison/grammar.js'].lineData[167]++;
      production.set("nullable", cont = true);
    }
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[173]++;
    for (symbol in nonTerminals) {
      _$jscoverage['/kison/grammar.js'].lineData[175]++;
      if (visit13_175_1(!nonTerminals[symbol].get("nullable"))) {
        _$jscoverage['/kison/grammar.js'].lineData[176]++;
        productions = nonTerminals[symbol].get("productions");
        _$jscoverage['/kison/grammar.js'].lineData[177]++;
        for (i = 0; production = productions[i]; i++) {
          _$jscoverage['/kison/grammar.js'].lineData[178]++;
          if (visit14_178_1(production.get("nullable"))) {
            _$jscoverage['/kison/grammar.js'].lineData[179]++;
            nonTerminals[symbol].set("nullable", cont = true);
            _$jscoverage['/kison/grammar.js'].lineData[180]++;
            break;
          }
        }
      }
    }
  }
}, 
  isNullable: function(symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[14]++;
  _$jscoverage['/kison/grammar.js'].lineData[190]++;
  var self = this, nonTerminals = self.get("nonTerminals");
  _$jscoverage['/kison/grammar.js'].lineData[193]++;
  if (visit15_193_1(symbol instanceof Array)) {
    _$jscoverage['/kison/grammar.js'].lineData[194]++;
    for (var i = 0, t; t = symbol[i]; ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[195]++;
      if (visit16_195_1(!self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[196]++;
        return false;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[199]++;
    return true;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[201]++;
    if (visit17_201_1(!nonTerminals[symbol])) {
      _$jscoverage['/kison/grammar.js'].lineData[202]++;
      return false;
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[205]++;
      return nonTerminals[symbol].get("nullable");
    }
  }
}, 
  findFirst: function(symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[15]++;
  _$jscoverage['/kison/grammar.js'].lineData[210]++;
  var self = this, firsts = {}, t, i, nonTerminals = self.get("nonTerminals");
  _$jscoverage['/kison/grammar.js'].lineData[216]++;
  if (visit18_216_1(symbol instanceof Array)) {
    _$jscoverage['/kison/grammar.js'].lineData[217]++;
    for (i = 0; t = symbol[i]; ++i) {
      _$jscoverage['/kison/grammar.js'].lineData[218]++;
      if (visit19_218_1(!nonTerminals[t])) {
        _$jscoverage['/kison/grammar.js'].lineData[219]++;
        firsts[t] = 1;
      } else {
        _$jscoverage['/kison/grammar.js'].lineData[221]++;
        mix(firsts, nonTerminals[t].get("firsts"));
      }
      _$jscoverage['/kison/grammar.js'].lineData[223]++;
      if (visit20_223_1(!self.isNullable(t))) {
        _$jscoverage['/kison/grammar.js'].lineData[224]++;
        break;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[226]++;
    return firsts;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[228]++;
    if (visit21_228_1(!nonTerminals[symbol])) {
      _$jscoverage['/kison/grammar.js'].lineData[229]++;
      return [symbol];
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[232]++;
      return nonTerminals[symbol].get("firsts");
    }
  }
}, 
  buildFirsts: function() {
  _$jscoverage['/kison/grammar.js'].functionData[16]++;
  _$jscoverage['/kison/grammar.js'].lineData[237]++;
  var self = this, nonTerminal, productions = self.get("productions"), nonTerminals = self.get("nonTerminals"), cont = true, symbol, firsts;
  _$jscoverage['/kison/grammar.js'].lineData[245]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[246]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[254]++;
    S.each(self.get("productions"), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[17]++;
  _$jscoverage['/kison/grammar.js'].lineData[255]++;
  var firsts = self.findFirst(production.get("rhs"));
  _$jscoverage['/kison/grammar.js'].lineData[256]++;
  if (visit22_256_1(setSize(firsts) !== setSize(production.get("firsts")))) {
    _$jscoverage['/kison/grammar.js'].lineData[257]++;
    production.set("firsts", firsts);
    _$jscoverage['/kison/grammar.js'].lineData[258]++;
    cont = true;
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[262]++;
    for (symbol in nonTerminals) {
      _$jscoverage['/kison/grammar.js'].lineData[264]++;
      nonTerminal = nonTerminals[symbol];
      _$jscoverage['/kison/grammar.js'].lineData[265]++;
      firsts = {};
      _$jscoverage['/kison/grammar.js'].lineData[266]++;
      S.each(nonTerminal.get("productions"), function(production) {
  _$jscoverage['/kison/grammar.js'].functionData[18]++;
  _$jscoverage['/kison/grammar.js'].lineData[267]++;
  mix(firsts, production.get("firsts"));
});
      _$jscoverage['/kison/grammar.js'].lineData[269]++;
      if (visit23_269_1(setSize(firsts) !== setSize(nonTerminal.get("firsts")))) {
        _$jscoverage['/kison/grammar.js'].lineData[270]++;
        nonTerminal.set("firsts", firsts);
        _$jscoverage['/kison/grammar.js'].lineData[271]++;
        cont = true;
      }
    }
  }
}, 
  closure: function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[19]++;
  _$jscoverage['/kison/grammar.js'].lineData[279]++;
  var self = this, items = itemSet.get("items"), productions = self.get("productions"), cont = 1;
  _$jscoverage['/kison/grammar.js'].lineData[284]++;
  while (cont) {
    _$jscoverage['/kison/grammar.js'].lineData[285]++;
    cont = false;
    _$jscoverage['/kison/grammar.js'].lineData[286]++;
    S.each(items, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[20]++;
  _$jscoverage['/kison/grammar.js'].lineData[288]++;
  var dotPosition = item.get("dotPosition"), production = item.get("production"), rhs = production.get("rhs"), dotSymbol = rhs[dotPosition], lookAhead = item.get("lookAhead"), finalFirsts = {};
  _$jscoverage['/kison/grammar.js'].lineData[295]++;
  S.each(lookAhead, function(_, ahead) {
  _$jscoverage['/kison/grammar.js'].functionData[21]++;
  _$jscoverage['/kison/grammar.js'].lineData[296]++;
  var rightRhs = rhs.slice(dotPosition + 1);
  _$jscoverage['/kison/grammar.js'].lineData[297]++;
  rightRhs.push(ahead);
  _$jscoverage['/kison/grammar.js'].lineData[298]++;
  S.mix(finalFirsts, self.findFirst(rightRhs));
});
  _$jscoverage['/kison/grammar.js'].lineData[301]++;
  S.each(productions, function(p2) {
  _$jscoverage['/kison/grammar.js'].functionData[22]++;
  _$jscoverage['/kison/grammar.js'].lineData[302]++;
  if (visit24_302_1(p2.get("symbol") == dotSymbol)) {
    _$jscoverage['/kison/grammar.js'].lineData[304]++;
    var newItem = new Item({
  production: p2}), itemIndex = itemSet.findItemIndex(newItem, true), findItem;
    _$jscoverage['/kison/grammar.js'].lineData[318]++;
    if (visit25_318_1(itemIndex != -1)) {
      _$jscoverage['/kison/grammar.js'].lineData[319]++;
      findItem = itemSet.getItemAt(itemIndex);
      _$jscoverage['/kison/grammar.js'].lineData[320]++;
      cont = visit26_320_1(cont || (!!findItem.addLookAhead(finalFirsts)));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[322]++;
      newItem.addLookAhead(finalFirsts);
      _$jscoverage['/kison/grammar.js'].lineData[323]++;
      itemSet.addItem(newItem);
      _$jscoverage['/kison/grammar.js'].lineData[324]++;
      cont = true;
    }
  }
});
});
  }
  _$jscoverage['/kison/grammar.js'].lineData[333]++;
  return itemSet;
}, 
  gotos: function(i, x) {
  _$jscoverage['/kison/grammar.js'].functionData[23]++;
  _$jscoverage['/kison/grammar.js'].lineData[337]++;
  var j = new ItemSet(), iItems = i.get("items");
  _$jscoverage['/kison/grammar.js'].lineData[339]++;
  S.each(iItems, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[24]++;
  _$jscoverage['/kison/grammar.js'].lineData[340]++;
  var production = item.get("production"), dotPosition = item.get("dotPosition"), markSymbol = production.get("rhs")[dotPosition];
  _$jscoverage['/kison/grammar.js'].lineData[343]++;
  if (visit27_343_1(markSymbol == x)) {
    _$jscoverage['/kison/grammar.js'].lineData[344]++;
    var newItem = new Item({
  production: production, 
  dotPosition: dotPosition + 1}), itemIndex = j.findItemIndex(newItem, true), findItem;
    _$jscoverage['/kison/grammar.js'].lineData[350]++;
    if (visit28_350_1(itemIndex != -1)) {
      _$jscoverage['/kison/grammar.js'].lineData[351]++;
      findItem = j.getItemAt(itemIndex);
      _$jscoverage['/kison/grammar.js'].lineData[352]++;
      findItem.addLookAhead(item.get("lookAhead"));
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[354]++;
      newItem.addLookAhead(item.get("lookAhead"));
      _$jscoverage['/kison/grammar.js'].lineData[355]++;
      j.addItem(newItem);
    }
  }
});
  _$jscoverage['/kison/grammar.js'].lineData[359]++;
  return this.closure(j);
}, 
  findItemSetIndex: function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[25]++;
  _$jscoverage['/kison/grammar.js'].lineData[363]++;
  var itemSets = this.get("itemSets"), i;
  _$jscoverage['/kison/grammar.js'].lineData[364]++;
  for (i = 0; visit29_364_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[365]++;
    if (visit30_365_1(itemSets[i].equals(itemSet))) {
      _$jscoverage['/kison/grammar.js'].lineData[366]++;
      return i;
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[369]++;
  return -1;
}, 
  buildItemSet: function() {
  _$jscoverage['/kison/grammar.js'].functionData[26]++;
  _$jscoverage['/kison/grammar.js'].lineData[375]++;
  var self = this, lexer = self.lexer, itemSets = self.get("itemSets"), lookAheadTmp = {}, productions = self.get("productions");
  _$jscoverage['/kison/grammar.js'].lineData[381]++;
  lookAheadTmp[lexer.mapSymbol(END_TAG)] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[383]++;
  var initItemSet = self.closure(new ItemSet({
  items: [new Item({
  production: productions[0], 
  lookAhead: lookAheadTmp})]}));
  _$jscoverage['/kison/grammar.js'].lineData[393]++;
  itemSets.push(initItemSet);
  _$jscoverage['/kison/grammar.js'].lineData[395]++;
  var condition = true, symbols = S.merge(self.get("terminals"), self.get("nonTerminals"));
  _$jscoverage['/kison/grammar.js'].lineData[398]++;
  delete symbols[lexer.mapSymbol(END_TAG)];
  _$jscoverage['/kison/grammar.js'].lineData[400]++;
  while (condition) {
    _$jscoverage['/kison/grammar.js'].lineData[401]++;
    condition = false;
    _$jscoverage['/kison/grammar.js'].lineData[402]++;
    var itemSets2 = itemSets.concat();
    _$jscoverage['/kison/grammar.js'].lineData[403]++;
    S.each(itemSets2, function(itemSet) {
  _$jscoverage['/kison/grammar.js'].functionData[27]++;
  _$jscoverage['/kison/grammar.js'].lineData[404]++;
  S.each(symbols, function(v, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[28]++;
  _$jscoverage['/kison/grammar.js'].lineData[406]++;
  if (visit31_406_1(!itemSet.__cache)) {
    _$jscoverage['/kison/grammar.js'].lineData[407]++;
    itemSet.__cache = {};
  }
  _$jscoverage['/kison/grammar.js'].lineData[411]++;
  if (visit32_411_1(itemSet.__cache[symbol])) {
    _$jscoverage['/kison/grammar.js'].lineData[412]++;
    return;
  }
  _$jscoverage['/kison/grammar.js'].lineData[415]++;
  var itemSetNew = self.gotos(itemSet, symbol);
  _$jscoverage['/kison/grammar.js'].lineData[417]++;
  itemSet.__cache[symbol] = 1;
  _$jscoverage['/kison/grammar.js'].lineData[419]++;
  if (visit33_419_1(itemSetNew.size() == 0)) {
    _$jscoverage['/kison/grammar.js'].lineData[420]++;
    return;
  }
  _$jscoverage['/kison/grammar.js'].lineData[423]++;
  var index = self.findItemSetIndex(itemSetNew);
  _$jscoverage['/kison/grammar.js'].lineData[425]++;
  if (visit34_425_1(index > -1)) {
    _$jscoverage['/kison/grammar.js'].lineData[426]++;
    itemSetNew = itemSets[index];
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[428]++;
    itemSets.push(itemSetNew);
    _$jscoverage['/kison/grammar.js'].lineData[429]++;
    condition = true;
  }
  _$jscoverage['/kison/grammar.js'].lineData[432]++;
  itemSet.get("gotos")[symbol] = itemSetNew;
  _$jscoverage['/kison/grammar.js'].lineData[433]++;
  itemSetNew.addReverseGoto(symbol, itemSet);
});
});
  }
}, 
  buildLalrItemSets: function() {
  _$jscoverage['/kison/grammar.js'].functionData[29]++;
  _$jscoverage['/kison/grammar.js'].lineData[441]++;
  var itemSets = this.get("itemSets"), i, j, one, two;
  _$jscoverage['/kison/grammar.js'].lineData[444]++;
  for (i = 0; visit35_444_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[445]++;
    one = itemSets[i];
    _$jscoverage['/kison/grammar.js'].lineData[446]++;
    for (j = i + 1; visit36_446_1(j < itemSets.length); j++) {
      _$jscoverage['/kison/grammar.js'].lineData[447]++;
      two = itemSets[j];
      _$jscoverage['/kison/grammar.js'].lineData[448]++;
      if (visit37_448_1(one.equals(two, true))) {
        _$jscoverage['/kison/grammar.js'].lineData[450]++;
        for (var k = 0; visit38_450_1(k < one.get("items").length); k++) {
          _$jscoverage['/kison/grammar.js'].lineData[452]++;
          one.get("items")[k].addLookAhead(two.get("items")[k].get("lookAhead"));
        }
        _$jscoverage['/kison/grammar.js'].lineData[456]++;
        var oneGotos = one.get("gotos");
        _$jscoverage['/kison/grammar.js'].lineData[458]++;
        S.each(two.get("gotos"), function(item, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[30]++;
  _$jscoverage['/kison/grammar.js'].lineData[459]++;
  oneGotos[symbol] = item;
  _$jscoverage['/kison/grammar.js'].lineData[460]++;
  item.addReverseGoto(symbol, one);
});
        _$jscoverage['/kison/grammar.js'].lineData[463]++;
        S.each(two.get("reverseGotos"), function(items, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[31]++;
  _$jscoverage['/kison/grammar.js'].lineData[464]++;
  S.each(items, function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[32]++;
  _$jscoverage['/kison/grammar.js'].lineData[465]++;
  item.get("gotos")[symbol] = one;
  _$jscoverage['/kison/grammar.js'].lineData[466]++;
  one.addReverseGoto(symbol, item);
});
});
        _$jscoverage['/kison/grammar.js'].lineData[470]++;
        itemSets.splice(j--, 1);
      }
    }
  }
}, 
  buildTable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[33]++;
  _$jscoverage['/kison/grammar.js'].lineData[477]++;
  var self = this, lexer = self.lexer, table = self.get("table"), itemSets = self.get("itemSets"), productions = self.get("productions"), mappedStartTag = lexer.mapSymbol(START_TAG), mappedEndTag = lexer.mapSymbol(END_TAG), gotos = {}, action = {}, nonTerminals, i, itemSet, t;
  _$jscoverage['/kison/grammar.js'].lineData[491]++;
  table.gotos = gotos;
  _$jscoverage['/kison/grammar.js'].lineData[492]++;
  table.action = action;
  _$jscoverage['/kison/grammar.js'].lineData[493]++;
  nonTerminals = self.get("nonTerminals");
  _$jscoverage['/kison/grammar.js'].lineData[495]++;
  for (i = 0; visit39_495_1(i < itemSets.length); i++) {
    _$jscoverage['/kison/grammar.js'].lineData[497]++;
    itemSet = itemSets[i];
    _$jscoverage['/kison/grammar.js'].lineData[499]++;
    S.each(itemSet.get("items"), function(item) {
  _$jscoverage['/kison/grammar.js'].functionData[34]++;
  _$jscoverage['/kison/grammar.js'].lineData[500]++;
  var production = item.get("production");
  _$jscoverage['/kison/grammar.js'].lineData[501]++;
  var val;
  _$jscoverage['/kison/grammar.js'].lineData[502]++;
  if (visit40_502_1(item.get("dotPosition") == production.get("rhs").length)) {
    _$jscoverage['/kison/grammar.js'].lineData[503]++;
    if (visit41_503_1(production.get("symbol") == mappedStartTag)) {
      _$jscoverage['/kison/grammar.js'].lineData[504]++;
      if (visit42_504_1(item.get("lookAhead")[mappedEndTag])) {
        _$jscoverage['/kison/grammar.js'].lineData[505]++;
        action[i] = visit43_505_1(action[i] || {});
        _$jscoverage['/kison/grammar.js'].lineData[506]++;
        t = action[i][mappedEndTag];
        _$jscoverage['/kison/grammar.js'].lineData[507]++;
        val = [];
        _$jscoverage['/kison/grammar.js'].lineData[508]++;
        val[GrammarConst.TYPE_INDEX] = GrammarConst.ACCEPT_TYPE;
        _$jscoverage['/kison/grammar.js'].lineData[509]++;
        if (visit44_509_1(t && visit45_509_2(t.toString() != val.toString()))) {
          _$jscoverage['/kison/grammar.js'].lineData[510]++;
          logger.debug(new Array(29).join('*'));
          _$jscoverage['/kison/grammar.js'].lineData[511]++;
          logger.debug('***** conflict in reduce: action already defined ->', 'warn');
          _$jscoverage['/kison/grammar.js'].lineData[513]++;
          logger.debug('***** current item:', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[514]++;
          logger.debug(item.toString());
          _$jscoverage['/kison/grammar.js'].lineData[515]++;
          logger.debug('***** current action:', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[516]++;
          visualizeAction(t, productions, itemSets);
          _$jscoverage['/kison/grammar.js'].lineData[517]++;
          logger.debug('***** will be overwritten ->', 'info');
          _$jscoverage['/kison/grammar.js'].lineData[518]++;
          visualizeAction(val, productions, itemSets);
        }
        _$jscoverage['/kison/grammar.js'].lineData[520]++;
        action[i][mappedEndTag] = val;
      }
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[523]++;
      action[i] = visit46_523_1(action[i] || {});
      _$jscoverage['/kison/grammar.js'].lineData[528]++;
      S.each(item.get("lookAhead"), function(_, l) {
  _$jscoverage['/kison/grammar.js'].functionData[35]++;
  _$jscoverage['/kison/grammar.js'].lineData[529]++;
  t = action[i][l];
  _$jscoverage['/kison/grammar.js'].lineData[530]++;
  val = [];
  _$jscoverage['/kison/grammar.js'].lineData[531]++;
  val[GrammarConst.TYPE_INDEX] = GrammarConst.REDUCE_TYPE;
  _$jscoverage['/kison/grammar.js'].lineData[532]++;
  val[GrammarConst.PRODUCTION_INDEX] = S.indexOf(production, productions);
  _$jscoverage['/kison/grammar.js'].lineData[533]++;
  if (visit47_533_1(t && visit48_533_2(t.toString() != val.toString()))) {
    _$jscoverage['/kison/grammar.js'].lineData[534]++;
    logger.debug(new Array(29).join('*'));
    _$jscoverage['/kison/grammar.js'].lineData[535]++;
    logger.debug('conflict in reduce: action already defined ->', 'warn');
    _$jscoverage['/kison/grammar.js'].lineData[537]++;
    logger.debug('***** current item:', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[538]++;
    logger.debug(item.toString());
    _$jscoverage['/kison/grammar.js'].lineData[539]++;
    logger.debug('***** current action:', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[540]++;
    visualizeAction(t, productions, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[541]++;
    logger.debug('***** will be overwritten ->', 'info');
    _$jscoverage['/kison/grammar.js'].lineData[542]++;
    visualizeAction(val, productions, itemSets);
  }
  _$jscoverage['/kison/grammar.js'].lineData[544]++;
  action[i][l] = val;
});
    }
  }
});
    _$jscoverage['/kison/grammar.js'].lineData[551]++;
    S.each(itemSet.get("gotos"), function(anotherItemSet, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[36]++;
  _$jscoverage['/kison/grammar.js'].lineData[552]++;
  var val;
  _$jscoverage['/kison/grammar.js'].lineData[553]++;
  if (visit49_553_1(!nonTerminals[symbol])) {
    _$jscoverage['/kison/grammar.js'].lineData[554]++;
    action[i] = visit50_554_1(action[i] || {});
    _$jscoverage['/kison/grammar.js'].lineData[555]++;
    val = [];
    _$jscoverage['/kison/grammar.js'].lineData[556]++;
    val[GrammarConst.TYPE_INDEX] = GrammarConst.SHIFT_TYPE;
    _$jscoverage['/kison/grammar.js'].lineData[557]++;
    val[GrammarConst.TO_INDEX] = indexOf(anotherItemSet, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[558]++;
    t = action[i][symbol];
    _$jscoverage['/kison/grammar.js'].lineData[559]++;
    if (visit51_559_1(t && visit52_559_2(t.toString() != val.toString()))) {
      _$jscoverage['/kison/grammar.js'].lineData[560]++;
      logger.debug(new Array(29).join('*'));
      _$jscoverage['/kison/grammar.js'].lineData[561]++;
      logger.debug('conflict in shift: action already defined ->', 'warn');
      _$jscoverage['/kison/grammar.js'].lineData[563]++;
      logger.debug('***** current itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[564]++;
      logger.debug(itemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[565]++;
      logger.debug('***** current symbol:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[566]++;
      logger.debug(symbol);
      _$jscoverage['/kison/grammar.js'].lineData[567]++;
      logger.debug('***** goto itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[568]++;
      logger.debug(anotherItemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[569]++;
      logger.debug('***** current action:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[570]++;
      visualizeAction(t, productions, itemSets);
      _$jscoverage['/kison/grammar.js'].lineData[571]++;
      logger.debug('***** will be overwritten ->', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[572]++;
      visualizeAction(val, productions, itemSets);
    }
    _$jscoverage['/kison/grammar.js'].lineData[574]++;
    action[i][symbol] = val;
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[576]++;
    gotos[i] = visit53_576_1(gotos[i] || {});
    _$jscoverage['/kison/grammar.js'].lineData[577]++;
    t = gotos[i][symbol];
    _$jscoverage['/kison/grammar.js'].lineData[578]++;
    val = indexOf(anotherItemSet, itemSets);
    _$jscoverage['/kison/grammar.js'].lineData[579]++;
    if (visit54_579_1(t && visit55_579_2(val != t))) {
      _$jscoverage['/kison/grammar.js'].lineData[580]++;
      logger.debug(new Array(29).join('*'));
      _$jscoverage['/kison/grammar.js'].lineData[581]++;
      logger.debug('conflict in shift: goto already defined ->', 'warn');
      _$jscoverage['/kison/grammar.js'].lineData[583]++;
      logger.debug('***** current itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[584]++;
      logger.debug(itemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[585]++;
      logger.debug('***** current symbol:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[586]++;
      logger.debug(symbol);
      _$jscoverage['/kison/grammar.js'].lineData[587]++;
      logger.debug('***** goto itemSet:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[588]++;
      logger.debug(anotherItemSet.toString(1));
      _$jscoverage['/kison/grammar.js'].lineData[589]++;
      logger.debug('***** current goto state:', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[590]++;
      logger.debug(t);
      _$jscoverage['/kison/grammar.js'].lineData[591]++;
      logger.debug('***** will be overwritten ->', 'info');
      _$jscoverage['/kison/grammar.js'].lineData[592]++;
      logger.debug(val);
    }
    _$jscoverage['/kison/grammar.js'].lineData[594]++;
    gotos[i][symbol] = val;
  }
});
  }
}, 
  visualizeTable: function() {
  _$jscoverage['/kison/grammar.js'].functionData[37]++;
  _$jscoverage['/kison/grammar.js'].lineData[602]++;
  var self = this, table = self.get("table"), gotos = table.gotos, action = table.action, productions = self.get("productions"), ret = [];
  _$jscoverage['/kison/grammar.js'].lineData[609]++;
  S.each(self.get("itemSets"), function(itemSet, i) {
  _$jscoverage['/kison/grammar.js'].functionData[38]++;
  _$jscoverage['/kison/grammar.js'].lineData[610]++;
  ret.push(new Array(70).join("*") + " itemSet : " + i);
  _$jscoverage['/kison/grammar.js'].lineData[611]++;
  ret.push(itemSet.toString());
  _$jscoverage['/kison/grammar.js'].lineData[612]++;
  ret.push("");
});
  _$jscoverage['/kison/grammar.js'].lineData[615]++;
  ret.push("");
  _$jscoverage['/kison/grammar.js'].lineData[617]++;
  ret.push(new Array(70).join("*") + " table : ");
  _$jscoverage['/kison/grammar.js'].lineData[619]++;
  S.each(action, function(av, index) {
  _$jscoverage['/kison/grammar.js'].functionData[39]++;
  _$jscoverage['/kison/grammar.js'].lineData[620]++;
  S.each(av, function(v, s) {
  _$jscoverage['/kison/grammar.js'].functionData[40]++;
  _$jscoverage['/kison/grammar.js'].lineData[621]++;
  var str, type = v[GrammarConst.TYPE_INDEX];
  _$jscoverage['/kison/grammar.js'].lineData[622]++;
  if (visit56_622_1(type == GrammarConst.ACCEPT_TYPE)) {
    _$jscoverage['/kison/grammar.js'].lineData[623]++;
    str = "acc";
  } else {
    _$jscoverage['/kison/grammar.js'].lineData[624]++;
    if (visit57_624_1(type == GrammarConst.REDUCE_TYPE)) {
      _$jscoverage['/kison/grammar.js'].lineData[625]++;
      var production = productions[v[GrammarConst.PRODUCTION_INDEX]];
      _$jscoverage['/kison/grammar.js'].lineData[626]++;
      str = "r, " + production.get("symbol") + "=" + production.get("rhs").join(" ");
    } else {
      _$jscoverage['/kison/grammar.js'].lineData[628]++;
      if (visit58_628_1(type == GrammarConst.SHIFT_TYPE)) {
        _$jscoverage['/kison/grammar.js'].lineData[629]++;
        str = "s, " + v[GrammarConst.TO_INDEX];
      }
    }
  }
  _$jscoverage['/kison/grammar.js'].lineData[631]++;
  ret.push("action[" + index + "]" + "[" + s + "] = " + str);
});
});
  _$jscoverage['/kison/grammar.js'].lineData[635]++;
  ret.push("");
  _$jscoverage['/kison/grammar.js'].lineData[637]++;
  S.each(gotos, function(sv, index) {
  _$jscoverage['/kison/grammar.js'].functionData[41]++;
  _$jscoverage['/kison/grammar.js'].lineData[638]++;
  S.each(sv, function(v, s) {
  _$jscoverage['/kison/grammar.js'].functionData[42]++;
  _$jscoverage['/kison/grammar.js'].lineData[639]++;
  ret.push("goto[" + index + "]" + "[" + s + "] = " + v);
});
});
  _$jscoverage['/kison/grammar.js'].lineData[643]++;
  return ret;
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/grammar.js'].functionData[43]++;
  _$jscoverage['/kison/grammar.js'].lineData[647]++;
  cfg = visit59_647_1(cfg || {});
  _$jscoverage['/kison/grammar.js'].lineData[649]++;
  var self = this, table = self.get("table"), lexer = self.get("lexer"), lexerCode = lexer.genCode(cfg);
  _$jscoverage['/kison/grammar.js'].lineData[654]++;
  self.build();
  _$jscoverage['/kison/grammar.js'].lineData[656]++;
  var productions = [];
  _$jscoverage['/kison/grammar.js'].lineData[658]++;
  S.each(self.get("productions"), function(p) {
  _$jscoverage['/kison/grammar.js'].functionData[44]++;
  _$jscoverage['/kison/grammar.js'].lineData[659]++;
  var action = p.get("action"), ret = [p.get('symbol'), p.get('rhs')];
  _$jscoverage['/kison/grammar.js'].lineData[661]++;
  if (visit60_661_1(action)) {
    _$jscoverage['/kison/grammar.js'].lineData[662]++;
    ret.push(action);
  }
  _$jscoverage['/kison/grammar.js'].lineData[664]++;
  productions.push(ret);
});
  _$jscoverage['/kison/grammar.js'].lineData[667]++;
  var code = [];
  _$jscoverage['/kison/grammar.js'].lineData[669]++;
  code.push("/* Generated by kison from KISSY */");
  _$jscoverage['/kison/grammar.js'].lineData[671]++;
  code.push("var parser = {}," + "S = KISSY," + "GrammarConst = " + serializeObject(GrammarConst) + ";");
  _$jscoverage['/kison/grammar.js'].lineData[676]++;
  code.push(lexerCode);
  _$jscoverage['/kison/grammar.js'].lineData[678]++;
  code.push("parser.lexer = lexer;");
  _$jscoverage['/kison/grammar.js'].lineData[680]++;
  if (visit61_680_1(cfg.compressSymbol)) {
    _$jscoverage['/kison/grammar.js'].lineData[681]++;
    code.push("lexer.symbolMap = " + serializeObject(lexer.symbolMap) + ";");
  }
  _$jscoverage['/kison/grammar.js'].lineData[684]++;
  code.push('parser.productions = ' + serializeObject(productions) + ";");
  _$jscoverage['/kison/grammar.js'].lineData[685]++;
  code.push("parser.table = " + serializeObject(table) + ";");
  _$jscoverage['/kison/grammar.js'].lineData[686]++;
  code.push("parser.parse = " + parse.toString() + ";");
  _$jscoverage['/kison/grammar.js'].lineData[687]++;
  code.push("return parser;");
  _$jscoverage['/kison/grammar.js'].lineData[688]++;
  return code.join("\n");
}}, {
  ATTRS: {
  table: {
  value: {}}, 
  itemSets: {
  value: []}, 
  productions: {
  value: []}, 
  nonTerminals: {
  value: {}}, 
  lexer: {
  setter: function(v) {
  _$jscoverage['/kison/grammar.js'].functionData[45]++;
  _$jscoverage['/kison/grammar.js'].lineData[707]++;
  if (visit62_707_1(!(v instanceof Lexer))) {
    _$jscoverage['/kison/grammar.js'].lineData[708]++;
    v = new Lexer(v);
  }
  _$jscoverage['/kison/grammar.js'].lineData[710]++;
  this.lexer = v;
  _$jscoverage['/kison/grammar.js'].lineData[711]++;
  return v;
}}, 
  terminals: {
  value: {}}}});
  _$jscoverage['/kison/grammar.js'].lineData[722]++;
  function parse(input) {
    _$jscoverage['/kison/grammar.js'].functionData[46]++;
    _$jscoverage['/kison/grammar.js'].lineData[723]++;
    var self = this, lexer = self.lexer, state, symbol, action, table = self.table, gotos = table.gotos, tableAction = table.action, productions = self.productions, valueStack = [null], stack = [0];
    _$jscoverage['/kison/grammar.js'].lineData[735]++;
    lexer.resetInput(input);
    _$jscoverage['/kison/grammar.js'].lineData[737]++;
    while (1) {
      _$jscoverage['/kison/grammar.js'].lineData[739]++;
      state = stack[stack.length - 1];
      _$jscoverage['/kison/grammar.js'].lineData[741]++;
      if (visit63_741_1(!symbol)) {
        _$jscoverage['/kison/grammar.js'].lineData[742]++;
        symbol = lexer.lex();
      }
      _$jscoverage['/kison/grammar.js'].lineData[745]++;
      if (visit64_745_1(!symbol)) {
        _$jscoverage['/kison/grammar.js'].lineData[746]++;
        S.log("it is not a valid input: " + input, 'error');
        _$jscoverage['/kison/grammar.js'].lineData[747]++;
        return false;
      }
      _$jscoverage['/kison/grammar.js'].lineData[751]++;
      action = visit65_751_1(tableAction[state] && tableAction[state][symbol]);
      _$jscoverage['/kison/grammar.js'].lineData[753]++;
      if (visit66_753_1(!action)) {
        _$jscoverage['/kison/grammar.js'].lineData[754]++;
        var expected = [], error;
        _$jscoverage['/kison/grammar.js'].lineData[755]++;
        if (visit67_755_1(tableAction[state])) {
          _$jscoverage['/kison/grammar.js'].lineData[756]++;
          S.each(tableAction[state], function(_, symbol) {
  _$jscoverage['/kison/grammar.js'].functionData[47]++;
  _$jscoverage['/kison/grammar.js'].lineData[757]++;
  expected.push(self.lexer.mapReverseSymbol(symbol));
});
        }
        _$jscoverage['/kison/grammar.js'].lineData[760]++;
        error = "Syntax error at line " + lexer.lineNumber + ":\n" + lexer.showDebugInfo() + "\n" + "expect " + expected.join(", ");
        _$jscoverage['/kison/grammar.js'].lineData[763]++;
        S.error(error);
        _$jscoverage['/kison/grammar.js'].lineData[764]++;
        return false;
      }
      _$jscoverage['/kison/grammar.js'].lineData[767]++;
      switch (action[GrammarConst.TYPE_INDEX]) {
        case GrammarConst.SHIFT_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[769]++;
          stack.push(symbol);
          _$jscoverage['/kison/grammar.js'].lineData[771]++;
          valueStack.push(lexer.text);
          _$jscoverage['/kison/grammar.js'].lineData[774]++;
          stack.push(action[GrammarConst.TO_INDEX]);
          _$jscoverage['/kison/grammar.js'].lineData[777]++;
          symbol = null;
          _$jscoverage['/kison/grammar.js'].lineData[779]++;
          break;
        case GrammarConst.REDUCE_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[782]++;
          var production = productions[action[GrammarConst.PRODUCTION_INDEX]], reducedSymbol = visit68_783_1(production.symbol || production[0]), reducedAction = visit69_784_1(production.action || production[2]), reducedRhs = visit70_785_1(production.rhs || production[1]), len = reducedRhs.length, i = 0, ret = undefined, $$ = valueStack[valueStack.length - len];
          _$jscoverage['/kison/grammar.js'].lineData[791]++;
          self.$$ = $$;
          _$jscoverage['/kison/grammar.js'].lineData[793]++;
          for (; visit71_793_1(i < len); i++) {
            _$jscoverage['/kison/grammar.js'].lineData[794]++;
            self["$" + (len - i)] = valueStack[valueStack.length - 1 - i];
          }
          _$jscoverage['/kison/grammar.js'].lineData[797]++;
          if (visit72_797_1(reducedAction)) {
            _$jscoverage['/kison/grammar.js'].lineData[798]++;
            ret = reducedAction.call(self);
          }
          _$jscoverage['/kison/grammar.js'].lineData[801]++;
          if (visit73_801_1(ret !== undefined)) {
            _$jscoverage['/kison/grammar.js'].lineData[802]++;
            $$ = ret;
          } else {
            _$jscoverage['/kison/grammar.js'].lineData[804]++;
            $$ = self.$$;
          }
          _$jscoverage['/kison/grammar.js'].lineData[807]++;
          if (visit74_807_1(len)) {
            _$jscoverage['/kison/grammar.js'].lineData[808]++;
            stack = stack.slice(0, -1 * len * 2);
            _$jscoverage['/kison/grammar.js'].lineData[809]++;
            valueStack = valueStack.slice(0, -1 * len);
          }
          _$jscoverage['/kison/grammar.js'].lineData[812]++;
          stack.push(reducedSymbol);
          _$jscoverage['/kison/grammar.js'].lineData[814]++;
          valueStack.push($$);
          _$jscoverage['/kison/grammar.js'].lineData[816]++;
          var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];
          _$jscoverage['/kison/grammar.js'].lineData[818]++;
          stack.push(newState);
          _$jscoverage['/kison/grammar.js'].lineData[820]++;
          break;
        case GrammarConst.ACCEPT_TYPE:
          _$jscoverage['/kison/grammar.js'].lineData[823]++;
          return $$;
      }
    }
    _$jscoverage['/kison/grammar.js'].lineData[828]++;
    return undefined;
  }
}, {
  requires: ['base', './utils', './item', './item-set', './non-terminal', './lexer', './production']});
