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
if (! _$jscoverage['/control.js']) {
  _$jscoverage['/control.js'] = {};
  _$jscoverage['/control.js'].lineData = [];
  _$jscoverage['/control.js'].lineData[6] = 0;
  _$jscoverage['/control.js'].lineData[7] = 0;
  _$jscoverage['/control.js'].lineData[8] = 0;
  _$jscoverage['/control.js'].lineData[9] = 0;
  _$jscoverage['/control.js'].lineData[10] = 0;
  _$jscoverage['/control.js'].lineData[11] = 0;
  _$jscoverage['/control.js'].lineData[23] = 0;
  _$jscoverage['/control.js'].lineData[43] = 0;
  _$jscoverage['/control.js'].lineData[50] = 0;
  _$jscoverage['/control.js'].lineData[51] = 0;
  _$jscoverage['/control.js'].lineData[53] = 0;
  _$jscoverage['/control.js'].lineData[57] = 0;
  _$jscoverage['/control.js'].lineData[58] = 0;
  _$jscoverage['/control.js'].lineData[59] = 0;
  _$jscoverage['/control.js'].lineData[60] = 0;
  _$jscoverage['/control.js'].lineData[63] = 0;
  _$jscoverage['/control.js'].lineData[72] = 0;
  _$jscoverage['/control.js'].lineData[76] = 0;
  _$jscoverage['/control.js'].lineData[79] = 0;
  _$jscoverage['/control.js'].lineData[84] = 0;
  _$jscoverage['/control.js'].lineData[87] = 0;
  _$jscoverage['/control.js'].lineData[88] = 0;
  _$jscoverage['/control.js'].lineData[90] = 0;
  _$jscoverage['/control.js'].lineData[93] = 0;
  _$jscoverage['/control.js'].lineData[99] = 0;
  _$jscoverage['/control.js'].lineData[100] = 0;
  _$jscoverage['/control.js'].lineData[101] = 0;
  _$jscoverage['/control.js'].lineData[106] = 0;
  _$jscoverage['/control.js'].lineData[107] = 0;
  _$jscoverage['/control.js'].lineData[113] = 0;
  _$jscoverage['/control.js'].lineData[114] = 0;
  _$jscoverage['/control.js'].lineData[115] = 0;
  _$jscoverage['/control.js'].lineData[116] = 0;
  _$jscoverage['/control.js'].lineData[117] = 0;
  _$jscoverage['/control.js'].lineData[118] = 0;
  _$jscoverage['/control.js'].lineData[122] = 0;
  _$jscoverage['/control.js'].lineData[126] = 0;
  _$jscoverage['/control.js'].lineData[127] = 0;
  _$jscoverage['/control.js'].lineData[128] = 0;
  _$jscoverage['/control.js'].lineData[132] = 0;
  _$jscoverage['/control.js'].lineData[133] = 0;
  _$jscoverage['/control.js'].lineData[139] = 0;
  _$jscoverage['/control.js'].lineData[145] = 0;
  _$jscoverage['/control.js'].lineData[152] = 0;
  _$jscoverage['/control.js'].lineData[160] = 0;
  _$jscoverage['/control.js'].lineData[161] = 0;
  _$jscoverage['/control.js'].lineData[162] = 0;
  _$jscoverage['/control.js'].lineData[163] = 0;
  _$jscoverage['/control.js'].lineData[171] = 0;
  _$jscoverage['/control.js'].lineData[172] = 0;
  _$jscoverage['/control.js'].lineData[173] = 0;
  _$jscoverage['/control.js'].lineData[177] = 0;
  _$jscoverage['/control.js'].lineData[178] = 0;
  _$jscoverage['/control.js'].lineData[183] = 0;
  _$jscoverage['/control.js'].lineData[184] = 0;
  _$jscoverage['/control.js'].lineData[189] = 0;
  _$jscoverage['/control.js'].lineData[196] = 0;
  _$jscoverage['/control.js'].lineData[197] = 0;
  _$jscoverage['/control.js'].lineData[209] = 0;
  _$jscoverage['/control.js'].lineData[213] = 0;
  _$jscoverage['/control.js'].lineData[214] = 0;
  _$jscoverage['/control.js'].lineData[224] = 0;
  _$jscoverage['/control.js'].lineData[228] = 0;
  _$jscoverage['/control.js'].lineData[229] = 0;
  _$jscoverage['/control.js'].lineData[239] = 0;
  _$jscoverage['/control.js'].lineData[240] = 0;
  _$jscoverage['/control.js'].lineData[241] = 0;
  _$jscoverage['/control.js'].lineData[245] = 0;
  _$jscoverage['/control.js'].lineData[246] = 0;
  _$jscoverage['/control.js'].lineData[259] = 0;
  _$jscoverage['/control.js'].lineData[262] = 0;
  _$jscoverage['/control.js'].lineData[263] = 0;
  _$jscoverage['/control.js'].lineData[264] = 0;
  _$jscoverage['/control.js'].lineData[266] = 0;
  _$jscoverage['/control.js'].lineData[267] = 0;
  _$jscoverage['/control.js'].lineData[269] = 0;
  _$jscoverage['/control.js'].lineData[272] = 0;
  _$jscoverage['/control.js'].lineData[273] = 0;
  _$jscoverage['/control.js'].lineData[275] = 0;
  _$jscoverage['/control.js'].lineData[276] = 0;
  _$jscoverage['/control.js'].lineData[283] = 0;
  _$jscoverage['/control.js'].lineData[284] = 0;
  _$jscoverage['/control.js'].lineData[296] = 0;
  _$jscoverage['/control.js'].lineData[298] = 0;
  _$jscoverage['/control.js'].lineData[299] = 0;
  _$jscoverage['/control.js'].lineData[304] = 0;
  _$jscoverage['/control.js'].lineData[305] = 0;
  _$jscoverage['/control.js'].lineData[318] = 0;
  _$jscoverage['/control.js'].lineData[319] = 0;
  _$jscoverage['/control.js'].lineData[328] = 0;
  _$jscoverage['/control.js'].lineData[329] = 0;
  _$jscoverage['/control.js'].lineData[333] = 0;
  _$jscoverage['/control.js'].lineData[334] = 0;
  _$jscoverage['/control.js'].lineData[343] = 0;
  _$jscoverage['/control.js'].lineData[344] = 0;
  _$jscoverage['/control.js'].lineData[348] = 0;
  _$jscoverage['/control.js'].lineData[349] = 0;
  _$jscoverage['/control.js'].lineData[350] = 0;
  _$jscoverage['/control.js'].lineData[351] = 0;
  _$jscoverage['/control.js'].lineData[353] = 0;
  _$jscoverage['/control.js'].lineData[362] = 0;
  _$jscoverage['/control.js'].lineData[363] = 0;
  _$jscoverage['/control.js'].lineData[365] = 0;
  _$jscoverage['/control.js'].lineData[369] = 0;
  _$jscoverage['/control.js'].lineData[370] = 0;
  _$jscoverage['/control.js'].lineData[381] = 0;
  _$jscoverage['/control.js'].lineData[382] = 0;
  _$jscoverage['/control.js'].lineData[383] = 0;
  _$jscoverage['/control.js'].lineData[392] = 0;
  _$jscoverage['/control.js'].lineData[393] = 0;
  _$jscoverage['/control.js'].lineData[394] = 0;
  _$jscoverage['/control.js'].lineData[405] = 0;
  _$jscoverage['/control.js'].lineData[469] = 0;
  _$jscoverage['/control.js'].lineData[470] = 0;
  _$jscoverage['/control.js'].lineData[472] = 0;
  _$jscoverage['/control.js'].lineData[522] = 0;
  _$jscoverage['/control.js'].lineData[523] = 0;
  _$jscoverage['/control.js'].lineData[568] = 0;
  _$jscoverage['/control.js'].lineData[570] = 0;
  _$jscoverage['/control.js'].lineData[571] = 0;
  _$jscoverage['/control.js'].lineData[572] = 0;
  _$jscoverage['/control.js'].lineData[574] = 0;
  _$jscoverage['/control.js'].lineData[577] = 0;
  _$jscoverage['/control.js'].lineData[644] = 0;
  _$jscoverage['/control.js'].lineData[793] = 0;
  _$jscoverage['/control.js'].lineData[794] = 0;
  _$jscoverage['/control.js'].lineData[796] = 0;
  _$jscoverage['/control.js'].lineData[797] = 0;
  _$jscoverage['/control.js'].lineData[833] = 0;
  _$jscoverage['/control.js'].lineData[839] = 0;
  _$jscoverage['/control.js'].lineData[840] = 0;
  _$jscoverage['/control.js'].lineData[842] = 0;
  _$jscoverage['/control.js'].lineData[843] = 0;
  _$jscoverage['/control.js'].lineData[844] = 0;
  _$jscoverage['/control.js'].lineData[846] = 0;
  _$jscoverage['/control.js'].lineData[849] = 0;
  _$jscoverage['/control.js'].lineData[870] = 0;
  _$jscoverage['/control.js'].lineData[871] = 0;
  _$jscoverage['/control.js'].lineData[878] = 0;
  _$jscoverage['/control.js'].lineData[879] = 0;
  _$jscoverage['/control.js'].lineData[882] = 0;
  _$jscoverage['/control.js'].lineData[884] = 0;
  _$jscoverage['/control.js'].lineData[885] = 0;
  _$jscoverage['/control.js'].lineData[888] = 0;
  _$jscoverage['/control.js'].lineData[889] = 0;
  _$jscoverage['/control.js'].lineData[891] = 0;
  _$jscoverage['/control.js'].lineData[894] = 0;
}
if (! _$jscoverage['/control.js'].functionData) {
  _$jscoverage['/control.js'].functionData = [];
  _$jscoverage['/control.js'].functionData[0] = 0;
  _$jscoverage['/control.js'].functionData[1] = 0;
  _$jscoverage['/control.js'].functionData[2] = 0;
  _$jscoverage['/control.js'].functionData[3] = 0;
  _$jscoverage['/control.js'].functionData[4] = 0;
  _$jscoverage['/control.js'].functionData[5] = 0;
  _$jscoverage['/control.js'].functionData[6] = 0;
  _$jscoverage['/control.js'].functionData[7] = 0;
  _$jscoverage['/control.js'].functionData[8] = 0;
  _$jscoverage['/control.js'].functionData[9] = 0;
  _$jscoverage['/control.js'].functionData[10] = 0;
  _$jscoverage['/control.js'].functionData[11] = 0;
  _$jscoverage['/control.js'].functionData[12] = 0;
  _$jscoverage['/control.js'].functionData[13] = 0;
  _$jscoverage['/control.js'].functionData[14] = 0;
  _$jscoverage['/control.js'].functionData[15] = 0;
  _$jscoverage['/control.js'].functionData[16] = 0;
  _$jscoverage['/control.js'].functionData[17] = 0;
  _$jscoverage['/control.js'].functionData[18] = 0;
  _$jscoverage['/control.js'].functionData[19] = 0;
  _$jscoverage['/control.js'].functionData[20] = 0;
  _$jscoverage['/control.js'].functionData[21] = 0;
  _$jscoverage['/control.js'].functionData[22] = 0;
  _$jscoverage['/control.js'].functionData[23] = 0;
  _$jscoverage['/control.js'].functionData[24] = 0;
  _$jscoverage['/control.js'].functionData[25] = 0;
  _$jscoverage['/control.js'].functionData[26] = 0;
  _$jscoverage['/control.js'].functionData[27] = 0;
  _$jscoverage['/control.js'].functionData[28] = 0;
  _$jscoverage['/control.js'].functionData[29] = 0;
  _$jscoverage['/control.js'].functionData[30] = 0;
  _$jscoverage['/control.js'].functionData[31] = 0;
  _$jscoverage['/control.js'].functionData[32] = 0;
  _$jscoverage['/control.js'].functionData[33] = 0;
  _$jscoverage['/control.js'].functionData[34] = 0;
  _$jscoverage['/control.js'].functionData[35] = 0;
  _$jscoverage['/control.js'].functionData[36] = 0;
  _$jscoverage['/control.js'].functionData[37] = 0;
  _$jscoverage['/control.js'].functionData[38] = 0;
  _$jscoverage['/control.js'].functionData[39] = 0;
  _$jscoverage['/control.js'].functionData[40] = 0;
  _$jscoverage['/control.js'].functionData[41] = 0;
  _$jscoverage['/control.js'].functionData[42] = 0;
  _$jscoverage['/control.js'].functionData[43] = 0;
  _$jscoverage['/control.js'].functionData[44] = 0;
  _$jscoverage['/control.js'].functionData[45] = 0;
}
if (! _$jscoverage['/control.js'].branchData) {
  _$jscoverage['/control.js'].branchData = {};
  _$jscoverage['/control.js'].branchData['50'] = [];
  _$jscoverage['/control.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['59'] = [];
  _$jscoverage['/control.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['79'] = [];
  _$jscoverage['/control.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['87'] = [];
  _$jscoverage['/control.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['90'] = [];
  _$jscoverage['/control.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['100'] = [];
  _$jscoverage['/control.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['106'] = [];
  _$jscoverage['/control.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['122'] = [];
  _$jscoverage['/control.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['127'] = [];
  _$jscoverage['/control.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['132'] = [];
  _$jscoverage['/control.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['177'] = [];
  _$jscoverage['/control.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['183'] = [];
  _$jscoverage['/control.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['196'] = [];
  _$jscoverage['/control.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['213'] = [];
  _$jscoverage['/control.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['228'] = [];
  _$jscoverage['/control.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['245'] = [];
  _$jscoverage['/control.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['261'] = [];
  _$jscoverage['/control.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['262'] = [];
  _$jscoverage['/control.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['263'] = [];
  _$jscoverage['/control.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['266'] = [];
  _$jscoverage['/control.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['269'] = [];
  _$jscoverage['/control.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['273'] = [];
  _$jscoverage['/control.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['275'] = [];
  _$jscoverage['/control.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['275'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['275'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['283'] = [];
  _$jscoverage['/control.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['298'] = [];
  _$jscoverage['/control.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['298'][2] = new BranchData();
  _$jscoverage['/control.js'].branchData['298'][3] = new BranchData();
  _$jscoverage['/control.js'].branchData['304'] = [];
  _$jscoverage['/control.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['318'] = [];
  _$jscoverage['/control.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['333'] = [];
  _$jscoverage['/control.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['349'] = [];
  _$jscoverage['/control.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['362'] = [];
  _$jscoverage['/control.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['369'] = [];
  _$jscoverage['/control.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['382'] = [];
  _$jscoverage['/control.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['393'] = [];
  _$jscoverage['/control.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['469'] = [];
  _$jscoverage['/control.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['472'] = [];
  _$jscoverage['/control.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['570'] = [];
  _$jscoverage['/control.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['571'] = [];
  _$jscoverage['/control.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['572'] = [];
  _$jscoverage['/control.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['765'] = [];
  _$jscoverage['/control.js'].branchData['765'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['793'] = [];
  _$jscoverage['/control.js'].branchData['793'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['796'] = [];
  _$jscoverage['/control.js'].branchData['796'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['845'] = [];
  _$jscoverage['/control.js'].branchData['845'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['878'] = [];
  _$jscoverage['/control.js'].branchData['878'][1] = new BranchData();
  _$jscoverage['/control.js'].branchData['884'] = [];
  _$jscoverage['/control.js'].branchData['884'][1] = new BranchData();
}
_$jscoverage['/control.js'].branchData['884'][1].init(349, 6, 'xclass');
function visit103_884_1(result) {
  _$jscoverage['/control.js'].branchData['884'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['878'][1].init(202, 20, 'xclass = last.xclass');
function visit102_878_1(result) {
  _$jscoverage['/control.js'].branchData['878'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['845'][1].init(110, 24, '!attrs || !attrs.xrender');
function visit101_845_1(result) {
  _$jscoverage['/control.js'].branchData['845'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['796'][1].init(165, 1, 'p');
function visit100_796_1(result) {
  _$jscoverage['/control.js'].branchData['796'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['793'][1].init(29, 25, 'prev = this.get(\'parent\')');
function visit99_793_1(result) {
  _$jscoverage['/control.js'].branchData['793'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['765'][1].init(57, 40, 'S.config(\'component/prefixCls\') || \'ks-\'');
function visit98_765_1(result) {
  _$jscoverage['/control.js'].branchData['765'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['572'][1].init(88, 29, 'xy[1] && self.set("y", xy[1])');
function visit97_572_1(result) {
  _$jscoverage['/control.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['571'][1].init(29, 29, 'xy[0] && self.set("x", xy[0])');
function visit96_571_1(result) {
  _$jscoverage['/control.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['570'][1].init(119, 9, 'xy.length');
function visit95_570_1(result) {
  _$jscoverage['/control.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['472'][1].init(158, 7, 'v || []');
function visit94_472_1(result) {
  _$jscoverage['/control.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['469'][1].init(29, 20, 'typeof v == \'string\'');
function visit93_469_1(result) {
  _$jscoverage['/control.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['393'][1].init(126, 9, 'this.view');
function visit92_393_1(result) {
  _$jscoverage['/control.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['382'][1].init(99, 21, 'self.get(\'focusable\')');
function visit91_382_1(result) {
  _$jscoverage['/control.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['369'][1].init(21, 21, '!this.get(\'disabled\')');
function visit90_369_1(result) {
  _$jscoverage['/control.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['362'][1].init(21, 35, 'ev[\'keyCode\'] == Node.KeyCode.ENTER');
function visit89_362_1(result) {
  _$jscoverage['/control.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['349'][1].init(54, 55, '!this.get(\'disabled\') && self.handleKeyDownInternal(ev)');
function visit88_349_1(result) {
  _$jscoverage['/control.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['333'][1].init(21, 21, '!this.get(\'disabled\')');
function visit87_333_1(result) {
  _$jscoverage['/control.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['318'][1].init(21, 21, '!this.get(\'disabled\')');
function visit86_318_1(result) {
  _$jscoverage['/control.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['304'][1].init(21, 21, '!this.get(\'disabled\')');
function visit85_304_1(result) {
  _$jscoverage['/control.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['298'][3].init(99, 16, 'ev[\'which\'] == 1');
function visit84_298_3(result) {
  _$jscoverage['/control.js'].branchData['298'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['298'][2].init(99, 43, 'ev[\'which\'] == 1 || isTouchGestureSupported');
function visit83_298_2(result) {
  _$jscoverage['/control.js'].branchData['298'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['298'][1].init(76, 67, 'self.get("active") && (ev[\'which\'] == 1 || isTouchGestureSupported)');
function visit82_298_1(result) {
  _$jscoverage['/control.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['283'][1].init(21, 21, '!this.get(\'disabled\')');
function visit81_283_1(result) {
  _$jscoverage['/control.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['275'][3].init(333, 15, 'n != "textarea"');
function visit80_275_3(result) {
  _$jscoverage['/control.js'].branchData['275'][3].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['275'][2].init(317, 12, 'n != "input"');
function visit79_275_2(result) {
  _$jscoverage['/control.js'].branchData['275'][2].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['275'][1].init(317, 31, 'n != "input" && n != "textarea"');
function visit78_275_1(result) {
  _$jscoverage['/control.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['273'][1].init(188, 20, 'n && n.toLowerCase()');
function visit77_273_1(result) {
  _$jscoverage['/control.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['269'][1].init(256, 31, '!self.get("allowTextSelection")');
function visit76_269_1(result) {
  _$jscoverage['/control.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['266'][1].init(147, 21, 'self.get("focusable")');
function visit75_266_1(result) {
  _$jscoverage['/control.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['263'][1].init(25, 22, 'self.get("activeable")');
function visit74_263_1(result) {
  _$jscoverage['/control.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['262'][1].init(137, 46, 'isMouseActionButton || isTouchGestureSupported');
function visit73_262_1(result) {
  _$jscoverage['/control.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['261'][1].init(81, 16, 'ev[\'which\'] == 1');
function visit72_261_1(result) {
  _$jscoverage['/control.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['245'][1].init(21, 21, '!this.get(\'disabled\')');
function visit71_245_1(result) {
  _$jscoverage['/control.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['228'][1].init(21, 21, '!this.get(\'disabled\')');
function visit70_228_1(result) {
  _$jscoverage['/control.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['213'][1].init(21, 21, '!this.get(\'disabled\')');
function visit69_213_1(result) {
  _$jscoverage['/control.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['196'][1].init(21, 21, '!this.get(\'disabled\')');
function visit68_196_1(result) {
  _$jscoverage['/control.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['183'][1].init(21, 21, 'this.get(\'focusable\')');
function visit67_183_1(result) {
  _$jscoverage['/control.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['177'][1].init(21, 21, 'this.get(\'focusable\')');
function visit66_177_1(result) {
  _$jscoverage['/control.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['132'][1].init(183, 44, 'target.ownerDocument.activeElement == target');
function visit65_132_1(result) {
  _$jscoverage['/control.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['127'][1].init(84, 1, 'v');
function visit64_127_1(result) {
  _$jscoverage['/control.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['122'][1].init(53, 14, 'parent || this');
function visit63_122_1(result) {
  _$jscoverage['/control.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['106'][1].init(881, 6, 'ie < 9');
function visit62_106_1(result) {
  _$jscoverage['/control.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['100'][1].init(615, 14, 'Gesture.cancel');
function visit61_100_1(result) {
  _$jscoverage['/control.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['90'][1].init(61, 22, '!isTouchEventSupported');
function visit60_90_1(result) {
  _$jscoverage['/control.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['87'][1].init(480, 29, 'self.get(\'handleMouseEvents\')');
function visit59_87_1(result) {
  _$jscoverage['/control.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['79'][1].init(111, 21, 'self.get(\'focusable\')');
function visit58_79_1(result) {
  _$jscoverage['/control.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['59'][1].init(623, 31, '!self.get("allowTextSelection")');
function visit57_59_1(result) {
  _$jscoverage['/control.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].branchData['50'][1].init(295, 4, 'view');
function visit56_50_1(result) {
  _$jscoverage['/control.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control.js'].functionData[0]++;
  _$jscoverage['/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/control.js'].lineData[8]++;
  var ComponentProcess = require('./control/process');
  _$jscoverage['/control.js'].lineData[9]++;
  var Manager = require('component/manager');
  _$jscoverage['/control.js'].lineData[10]++;
  var Render = require('./control/render');
  _$jscoverage['/control.js'].lineData[11]++;
  var ie = S.UA.ieMode, undefined = undefined, Features = S.Features, Gesture = Node.Gesture, isTouchGestureSupported = Features.isTouchGestureSupported(), isTouchEventSupported = Features.isTouchEventSupported();
  _$jscoverage['/control.js'].lineData[23]++;
  var Control = ComponentProcess.extend({
  isControl: true, 
  createDom: function() {
  _$jscoverage['/control.js'].functionData[1]++;
  _$jscoverage['/control.js'].lineData[43]++;
  var self = this, Render = self.get('xrender'), view = self.get('view'), id = self.get("id"), el;
  _$jscoverage['/control.js'].lineData[50]++;
  if (visit56_50_1(view)) {
    _$jscoverage['/control.js'].lineData[51]++;
    view.set('control', self);
  } else {
    _$jscoverage['/control.js'].lineData[53]++;
    self.set('view', this.view = view = new Render({
  control: self}));
  }
  _$jscoverage['/control.js'].lineData[57]++;
  view.create();
  _$jscoverage['/control.js'].lineData[58]++;
  el = view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[59]++;
  if (visit57_59_1(!self.get("allowTextSelection"))) {
    _$jscoverage['/control.js'].lineData[60]++;
    el.unselectable();
  }
  _$jscoverage['/control.js'].lineData[63]++;
  Manager.addComponent(id, self);
}, 
  renderUI: function() {
  _$jscoverage['/control.js'].functionData[2]++;
  _$jscoverage['/control.js'].lineData[72]++;
  this.view.render();
}, 
  bindUI: function() {
  _$jscoverage['/control.js'].functionData[3]++;
  _$jscoverage['/control.js'].lineData[76]++;
  var self = this, el = self.view.getKeyEventTarget();
  _$jscoverage['/control.js'].lineData[79]++;
  if (visit58_79_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[84]++;
    el.on("focus", self.handleFocus, self).on("blur", self.handleBlur, self).on("keydown", self.handleKeydown, self);
  }
  _$jscoverage['/control.js'].lineData[87]++;
  if (visit59_87_1(self.get('handleMouseEvents'))) {
    _$jscoverage['/control.js'].lineData[88]++;
    el = self.$el;
    _$jscoverage['/control.js'].lineData[90]++;
    if (visit60_90_1(!isTouchEventSupported)) {
      _$jscoverage['/control.js'].lineData[93]++;
      el.on("mouseenter", self.handleMouseEnter, self).on("mouseleave", self.handleMouseLeave, self).on("contextmenu", self.handleContextMenu, self);
    }
    _$jscoverage['/control.js'].lineData[99]++;
    el.on(Gesture.start, self.handleMouseDown, self).on(Gesture.end, self.handleMouseUp, self).on(Gesture.tap, self.handleClick, self);
    _$jscoverage['/control.js'].lineData[100]++;
    if (visit61_100_1(Gesture.cancel)) {
      _$jscoverage['/control.js'].lineData[101]++;
      el.on(Gesture.cancel, self.handleMouseUp, self);
    }
    _$jscoverage['/control.js'].lineData[106]++;
    if (visit62_106_1(ie < 9)) {
      _$jscoverage['/control.js'].lineData[107]++;
      el.on("dblclick", self.handleDblClick, self);
    }
  }
}, 
  sync: function() {
  _$jscoverage['/control.js'].functionData[4]++;
  _$jscoverage['/control.js'].lineData[113]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[114]++;
  self.fire('beforeSyncUI');
  _$jscoverage['/control.js'].lineData[115]++;
  self.syncUI();
  _$jscoverage['/control.js'].lineData[116]++;
  self.view.sync();
  _$jscoverage['/control.js'].lineData[117]++;
  self.__callPluginsMethod("pluginSyncUI");
  _$jscoverage['/control.js'].lineData[118]++;
  self.fire('afterSyncUI');
}, 
  createComponent: function(cfg, parent) {
  _$jscoverage['/control.js'].functionData[5]++;
  _$jscoverage['/control.js'].lineData[122]++;
  return Manager.createComponent(cfg, visit63_122_1(parent || this));
}, 
  '_onSetFocused': function(v) {
  _$jscoverage['/control.js'].functionData[6]++;
  _$jscoverage['/control.js'].lineData[126]++;
  var target = this.view.getKeyEventTarget()[0];
  _$jscoverage['/control.js'].lineData[127]++;
  if (visit64_127_1(v)) {
    _$jscoverage['/control.js'].lineData[128]++;
    target.focus();
  } else {
    _$jscoverage['/control.js'].lineData[132]++;
    if (visit65_132_1(target.ownerDocument.activeElement == target)) {
      _$jscoverage['/control.js'].lineData[133]++;
      target.ownerDocument.body.focus();
    }
  }
}, 
  '_onSetX': function(x) {
  _$jscoverage['/control.js'].functionData[7]++;
  _$jscoverage['/control.js'].lineData[139]++;
  this.$el.offset({
  left: x});
}, 
  '_onSetY': function(y) {
  _$jscoverage['/control.js'].functionData[8]++;
  _$jscoverage['/control.js'].lineData[145]++;
  this.$el.offset({
  top: y});
}, 
  _onSetVisible: function(v) {
  _$jscoverage['/control.js'].functionData[9]++;
  _$jscoverage['/control.js'].lineData[152]++;
  this.fire(v ? "show" : "hide");
}, 
  show: function() {
  _$jscoverage['/control.js'].functionData[10]++;
  _$jscoverage['/control.js'].lineData[160]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[161]++;
  self.render();
  _$jscoverage['/control.js'].lineData[162]++;
  self.set("visible", true);
  _$jscoverage['/control.js'].lineData[163]++;
  return self;
}, 
  hide: function() {
  _$jscoverage['/control.js'].functionData[11]++;
  _$jscoverage['/control.js'].lineData[171]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[172]++;
  self.set("visible", false);
  _$jscoverage['/control.js'].lineData[173]++;
  return self;
}, 
  focus: function() {
  _$jscoverage['/control.js'].functionData[12]++;
  _$jscoverage['/control.js'].lineData[177]++;
  if (visit66_177_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[178]++;
    this.set('focused', true);
  }
}, 
  blur: function() {
  _$jscoverage['/control.js'].functionData[13]++;
  _$jscoverage['/control.js'].lineData[183]++;
  if (visit67_183_1(this.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[184]++;
    this.set('focused', false);
  }
}, 
  move: function(x, y) {
  _$jscoverage['/control.js'].functionData[14]++;
  _$jscoverage['/control.js'].lineData[189]++;
  this.set({
  x: x, 
  y: y});
}, 
  handleDblClick: function(ev) {
  _$jscoverage['/control.js'].functionData[15]++;
  _$jscoverage['/control.js'].lineData[196]++;
  if (visit68_196_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[197]++;
    this.handleDblClickInternal(ev);
  }
}, 
  handleDblClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[16]++;
  _$jscoverage['/control.js'].lineData[209]++;
  this.handleClickInternal(ev);
}, 
  handleMouseEnter: function(ev) {
  _$jscoverage['/control.js'].functionData[17]++;
  _$jscoverage['/control.js'].lineData[213]++;
  if (visit69_213_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[214]++;
    this.handleMouseEnterInternal(ev);
  }
}, 
  handleMouseEnterInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[18]++;
  _$jscoverage['/control.js'].lineData[224]++;
  this.set("highlighted", !!ev);
}, 
  handleMouseLeave: function(ev) {
  _$jscoverage['/control.js'].functionData[19]++;
  _$jscoverage['/control.js'].lineData[228]++;
  if (visit70_228_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[229]++;
    this.handleMouseLeaveInternal(ev);
  }
}, 
  handleMouseLeaveInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[20]++;
  _$jscoverage['/control.js'].lineData[239]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[240]++;
  self.set("active", false);
  _$jscoverage['/control.js'].lineData[241]++;
  self.set("highlighted", !ev);
}, 
  handleMouseDown: function(ev) {
  _$jscoverage['/control.js'].functionData[21]++;
  _$jscoverage['/control.js'].lineData[245]++;
  if (visit71_245_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[246]++;
    this.handleMouseDownInternal(ev);
  }
}, 
  handleMouseDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[22]++;
  _$jscoverage['/control.js'].lineData[259]++;
  var self = this, n, isMouseActionButton = visit72_261_1(ev['which'] == 1);
  _$jscoverage['/control.js'].lineData[262]++;
  if (visit73_262_1(isMouseActionButton || isTouchGestureSupported)) {
    _$jscoverage['/control.js'].lineData[263]++;
    if (visit74_263_1(self.get("activeable"))) {
      _$jscoverage['/control.js'].lineData[264]++;
      self.set("active", true);
    }
    _$jscoverage['/control.js'].lineData[266]++;
    if (visit75_266_1(self.get("focusable"))) {
      _$jscoverage['/control.js'].lineData[267]++;
      self.focus();
    }
    _$jscoverage['/control.js'].lineData[269]++;
    if (visit76_269_1(!self.get("allowTextSelection"))) {
      _$jscoverage['/control.js'].lineData[272]++;
      n = ev.target.nodeName;
      _$jscoverage['/control.js'].lineData[273]++;
      n = visit77_273_1(n && n.toLowerCase());
      _$jscoverage['/control.js'].lineData[275]++;
      if (visit78_275_1(visit79_275_2(n != "input") && visit80_275_3(n != "textarea"))) {
        _$jscoverage['/control.js'].lineData[276]++;
        ev['preventDefault']();
      }
    }
  }
}, 
  handleMouseUp: function(ev) {
  _$jscoverage['/control.js'].functionData[23]++;
  _$jscoverage['/control.js'].lineData[283]++;
  if (visit81_283_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[284]++;
    this.handleMouseUpInternal(ev);
  }
}, 
  handleMouseUpInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[24]++;
  _$jscoverage['/control.js'].lineData[296]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[298]++;
  if (visit82_298_1(self.get("active") && (visit83_298_2(visit84_298_3(ev['which'] == 1) || isTouchGestureSupported)))) {
    _$jscoverage['/control.js'].lineData[299]++;
    self.set("active", false);
  }
}, 
  handleContextMenu: function(ev) {
  _$jscoverage['/control.js'].functionData[25]++;
  _$jscoverage['/control.js'].lineData[304]++;
  if (visit85_304_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[305]++;
    this.handleContextMenuInternal(ev);
  }
}, 
  handleContextMenuInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[26]++;
}, 
  handleFocus: function() {
  _$jscoverage['/control.js'].functionData[27]++;
  _$jscoverage['/control.js'].lineData[318]++;
  if (visit86_318_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[319]++;
    this.handleFocusInternal();
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/control.js'].functionData[28]++;
  _$jscoverage['/control.js'].lineData[328]++;
  this.focus();
  _$jscoverage['/control.js'].lineData[329]++;
  this.fire("focus");
}, 
  handleBlur: function() {
  _$jscoverage['/control.js'].functionData[29]++;
  _$jscoverage['/control.js'].lineData[333]++;
  if (visit87_333_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[334]++;
    this.handleBlurInternal();
  }
}, 
  handleBlurInternal: function() {
  _$jscoverage['/control.js'].functionData[30]++;
  _$jscoverage['/control.js'].lineData[343]++;
  this.blur();
  _$jscoverage['/control.js'].lineData[344]++;
  this.fire("blur");
}, 
  handleKeydown: function(ev) {
  _$jscoverage['/control.js'].functionData[31]++;
  _$jscoverage['/control.js'].lineData[348]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[349]++;
  if (visit88_349_1(!this.get('disabled') && self.handleKeyDownInternal(ev))) {
    _$jscoverage['/control.js'].lineData[350]++;
    ev['halt']();
    _$jscoverage['/control.js'].lineData[351]++;
    return true;
  }
  _$jscoverage['/control.js'].lineData[353]++;
  return undefined;
}, 
  handleKeyDownInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[32]++;
  _$jscoverage['/control.js'].lineData[362]++;
  if (visit89_362_1(ev['keyCode'] == Node.KeyCode.ENTER)) {
    _$jscoverage['/control.js'].lineData[363]++;
    return this.handleClickInternal(ev);
  }
  _$jscoverage['/control.js'].lineData[365]++;
  return undefined;
}, 
  handleClick: function(ev) {
  _$jscoverage['/control.js'].functionData[33]++;
  _$jscoverage['/control.js'].lineData[369]++;
  if (visit90_369_1(!this.get('disabled'))) {
    _$jscoverage['/control.js'].lineData[370]++;
    this.handleClickInternal(ev);
  }
}, 
  handleClickInternal: function(ev) {
  _$jscoverage['/control.js'].functionData[34]++;
  _$jscoverage['/control.js'].lineData[381]++;
  var self = this;
  _$jscoverage['/control.js'].lineData[382]++;
  if (visit91_382_1(self.get('focusable'))) {
    _$jscoverage['/control.js'].lineData[383]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/control.js'].functionData[35]++;
  _$jscoverage['/control.js'].lineData[392]++;
  Manager.removeComponent(this.get('id'));
  _$jscoverage['/control.js'].lineData[393]++;
  if (visit92_393_1(this.view)) {
    _$jscoverage['/control.js'].lineData[394]++;
    this.view.destroy();
  }
}}, {
  name: 'control', 
  ATTRS: {
  id: {
  view: 1, 
  valueFn: function() {
  _$jscoverage['/control.js'].functionData[36]++;
  _$jscoverage['/control.js'].lineData[405]++;
  return S.guid('ks-component');
}}, 
  content: {
  view: 1, 
  value: ''}, 
  width: {
  view: 1}, 
  height: {
  view: 1}, 
  elCls: {
  view: 1, 
  value: [], 
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[37]++;
  _$jscoverage['/control.js'].lineData[469]++;
  if (visit93_469_1(typeof v == 'string')) {
    _$jscoverage['/control.js'].lineData[470]++;
    v = v.split(/\s+/);
  }
  _$jscoverage['/control.js'].lineData[472]++;
  return visit94_472_1(v || []);
}}, 
  elStyle: {
  view: 1, 
  value: {}}, 
  elAttrs: {
  view: 1, 
  value: {}}, 
  elBefore: {}, 
  el: {
  setter: function(el) {
  _$jscoverage['/control.js'].functionData[38]++;
  _$jscoverage['/control.js'].lineData[522]++;
  this.$el = el;
  _$jscoverage['/control.js'].lineData[523]++;
  this.el = el[0];
}}, 
  x: {}, 
  y: {}, 
  xy: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[39]++;
  _$jscoverage['/control.js'].lineData[568]++;
  var self = this, xy = S.makeArray(v);
  _$jscoverage['/control.js'].lineData[570]++;
  if (visit95_570_1(xy.length)) {
    _$jscoverage['/control.js'].lineData[571]++;
    visit96_571_1(xy[0] && self.set("x", xy[0]));
    _$jscoverage['/control.js'].lineData[572]++;
    visit97_572_1(xy[1] && self.set("y", xy[1]));
  }
  _$jscoverage['/control.js'].lineData[574]++;
  return v;
}, 
  getter: function() {
  _$jscoverage['/control.js'].functionData[40]++;
  _$jscoverage['/control.js'].lineData[577]++;
  return [this.get("x"), this.get("y")];
}}, 
  zIndex: {
  view: 1}, 
  render: {}, 
  visible: {
  sync: 0, 
  value: true, 
  view: 1}, 
  srcNode: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[41]++;
  _$jscoverage['/control.js'].lineData[644]++;
  return Node.all(v);
}}, 
  handleMouseEvents: {
  value: true}, 
  focusable: {
  value: true, 
  view: 1}, 
  allowTextSelection: {
  value: false}, 
  activeable: {
  value: true}, 
  focused: {
  view: 1}, 
  active: {
  view: 1, 
  value: false}, 
  highlighted: {
  view: 1, 
  value: false}, 
  prefixCls: {
  view: 1, 
  value: visit98_765_1(S.config('component/prefixCls') || 'ks-')}, 
  prefixXClass: {}, 
  parent: {
  setter: function(p, prev) {
  _$jscoverage['/control.js'].functionData[42]++;
  _$jscoverage['/control.js'].lineData[793]++;
  if (visit99_793_1(prev = this.get('parent'))) {
    _$jscoverage['/control.js'].lineData[794]++;
    this.removeTarget(prev);
  }
  _$jscoverage['/control.js'].lineData[796]++;
  if (visit100_796_1(p)) {
    _$jscoverage['/control.js'].lineData[797]++;
    this.addTarget(p);
  }
}}, 
  disabled: {
  view: 1, 
  value: false}, 
  xrender: {
  value: Render}, 
  view: {
  setter: function(v) {
  _$jscoverage['/control.js'].functionData[43]++;
  _$jscoverage['/control.js'].lineData[833]++;
  this.view = v;
}}}});
  _$jscoverage['/control.js'].lineData[839]++;
  function getDefaultRender() {
    _$jscoverage['/control.js'].functionData[44]++;
    _$jscoverage['/control.js'].lineData[840]++;
    var attrs, constructor = this;
    _$jscoverage['/control.js'].lineData[842]++;
    do {
      _$jscoverage['/control.js'].lineData[843]++;
      attrs = constructor.ATTRS;
      _$jscoverage['/control.js'].lineData[844]++;
      constructor = constructor.superclass;
    } while (visit101_845_1(!attrs || !attrs.xrender));
    _$jscoverage['/control.js'].lineData[846]++;
    return attrs.xrender.value;
  }
  _$jscoverage['/control.js'].lineData[849]++;
  Control.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[870]++;
  Control.extend = function extend(extensions, px, sx) {
  _$jscoverage['/control.js'].functionData[45]++;
  _$jscoverage['/control.js'].lineData[871]++;
  var args = S.makeArray(arguments), baseClass = this, xclass, newClass, argsLen = args.length, last = args[argsLen - 1];
  _$jscoverage['/control.js'].lineData[878]++;
  if (visit102_878_1(xclass = last.xclass)) {
    _$jscoverage['/control.js'].lineData[879]++;
    last.name = xclass;
  }
  _$jscoverage['/control.js'].lineData[882]++;
  newClass = ComponentProcess.extend.apply(baseClass, args);
  _$jscoverage['/control.js'].lineData[884]++;
  if (visit103_884_1(xclass)) {
    _$jscoverage['/control.js'].lineData[885]++;
    Manager.setConstructorByXClass(xclass, newClass);
  }
  _$jscoverage['/control.js'].lineData[888]++;
  newClass.extend = extend;
  _$jscoverage['/control.js'].lineData[889]++;
  newClass.getDefaultRender = getDefaultRender;
  _$jscoverage['/control.js'].lineData[891]++;
  return newClass;
};
  _$jscoverage['/control.js'].lineData[894]++;
  return Control;
});
