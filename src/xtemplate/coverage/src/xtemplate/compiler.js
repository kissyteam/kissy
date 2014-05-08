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
if (! _$jscoverage['/xtemplate/compiler.js']) {
  _$jscoverage['/xtemplate/compiler.js'] = {};
  _$jscoverage['/xtemplate/compiler.js'].lineData = [];
  _$jscoverage['/xtemplate/compiler.js'].lineData[6] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[7] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[10] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[12] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[14] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[16] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[18] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[20] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[25] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[30] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[34] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[39] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[41] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[43] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[46] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[47] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[48] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[49] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[50] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[51] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[52] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[54] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[56] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[57] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[62] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[63] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[68] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[70] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[75] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[76] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[79] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[80] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[83] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[84] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[87] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[88] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[91] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[92] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[94] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[95] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[97] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[101] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[102] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[103] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[106] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[109] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[112] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[115] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[116] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[119] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[120] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[128] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[129] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[130] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[131] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[132] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[133] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[134] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[135] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[136] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[137] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[138] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[139] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[141] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[142] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[144] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[151] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[152] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[153] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[155] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[158] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[159] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[160] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[161] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[164] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[165] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[166] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[167] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[168] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[169] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[170] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[171] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[172] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[175] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[178] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[180] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[184] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[185] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[186] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[187] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[189] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[190] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[193] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[194] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[200] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[201] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[205] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[206] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[208] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[209] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[215] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[216] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[218] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[222] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[223] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[224] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[225] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[226] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[227] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[228] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[230] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[233] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[234] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[235] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[236] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[237] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[238] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[239] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[241] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[244] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[250] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[251] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[260] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[261] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[262] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[264] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[265] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[266] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[267] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[268] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[272] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[274] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[276] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[282] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[283] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[284] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[287] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[288] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[294] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[295] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[303] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[304] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[313] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[314] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[319] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[325] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[339] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[340] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[349] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[356] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[363] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[368] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[370] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[375] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[382] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[386] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[390] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[397] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[399] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[400] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[402] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[407] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[415] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[428] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[429] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[435] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[442] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[450] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[460] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[461] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[474] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[475] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[476] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[477] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[486] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[488] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[495] = 0;
}
if (! _$jscoverage['/xtemplate/compiler.js'].functionData) {
  _$jscoverage['/xtemplate/compiler.js'].functionData = [];
  _$jscoverage['/xtemplate/compiler.js'].functionData[0] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[1] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[2] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[3] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[4] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[5] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[6] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[7] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[8] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[9] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[10] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[11] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[12] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[13] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[14] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[15] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[16] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[17] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[18] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[19] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[20] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[21] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[22] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[23] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[24] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[25] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[26] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[27] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[28] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[29] = 0;
}
if (! _$jscoverage['/xtemplate/compiler.js'].branchData) {
  _$jscoverage['/xtemplate/compiler.js'].branchData = {};
  _$jscoverage['/xtemplate/compiler.js'].branchData['94'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['102'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['135'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['135'][3] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['136'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['152'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['158'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['159'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['164'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['166'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['169'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['186'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['200'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['205'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['222'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['233'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['264'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['267'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['272'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['274'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['274'][2] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['274'][3] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['282'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['287'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['294'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['313'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['486'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['486'][1] = new BranchData();
}
_$jscoverage['/xtemplate/compiler.js'].branchData['486'][1].init(54, 25, 'name || guid(\'xtemplate\')');
function visit74_486_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['313'][1].init(2231, 6, 'idName');
function visit73_313_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['294'][1].init(1537, 5, 'block');
function visit72_294_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['287'][1].init(1250, 26, 'idString in nativeCommands');
function visit71_287_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['282'][1].init(1132, 6, '!block');
function visit70_282_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['274'][3].init(91, 21, 'idString === \'extend\'');
function visit69_274_3(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['274'][3].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['274'][2].init(65, 22, 'idString === \'include\'');
function visit68_274_2(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['274'][2].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['274'][1].init(65, 47, 'idString === \'include\' || idString === \'extend\'');
function visit67_274_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['272'][1].init(779, 20, 'xtplAstToJs.isModule');
function visit66_272_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['267'][1].init(168, 19, 'programNode.inverse');
function visit65_267_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['264'][1].init(429, 5, 'block');
function visit64_264_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['233'][1].init(705, 4, 'hash');
function visit63_233_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['222'][1].init(217, 6, 'params');
function visit62_222_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['205'][1].init(395, 7, 'i < len');
function visit61_205_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['200'][1].init(203, 20, 'xtplAstToJs.isModule');
function visit60_200_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['186'][1].init(104, 7, 'i < len');
function visit59_186_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['169'][1].init(103, 10, 'idPartType');
function visit58_169_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['166'][1].init(73, 5, 'i < l');
function visit57_166_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['164'][1].init(349, 5, 'check');
function visit56_164_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['159'][1].init(18, 15, 'idParts[i].type');
function visit55_159_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['158'][1].init(208, 5, 'i < l');
function visit54_158_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['152'][1].init(14, 20, 'idParts.length === 1');
function visit53_152_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['136'][1].init(35, 13, 'type === \'&&\'');
function visit52_136_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['135'][3].init(543, 13, 'type === \'||\'');
function visit51_135_3(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['135'][3].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['135'][2].init(526, 13, 'type === \'&&\'');
function visit50_135_2(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['135'][1].init(526, 30, 'type === \'&&\' || type === \'||\'');
function visit49_135_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['102'][1].init(14, 6, 'isCode');
function visit48_102_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['94'][1].init(89, 12, 'm.length % 2');
function visit47_94_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[0]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[7]++;
  require('util');
  _$jscoverage['/xtemplate/compiler.js'].lineData[10]++;
  var CALL_NATIVE_COMMAND = '{lhs} = {name}Command.call(engine, scope, {option}, buffer, {lineNumber}, session);';
  _$jscoverage['/xtemplate/compiler.js'].lineData[12]++;
  var CALL_CUSTOM_COMMAND = 'buffer = callCommandUtil(engine, scope, {option}, buffer, [{idParts}], {lineNumber});';
  _$jscoverage['/xtemplate/compiler.js'].lineData[14]++;
  var CALL_FUNCTION = '{lhs} = callFnUtil(engine, scope, {option}, buffer, [{idParts}], {depth},{lineNumber});';
  _$jscoverage['/xtemplate/compiler.js'].lineData[16]++;
  var SCOPE_RESOLVE = 'var {lhs} = scope.resolve([{idParts}],{depth});';
  _$jscoverage['/xtemplate/compiler.js'].lineData[18]++;
  var REQUIRE_MODULE = 're' + 'quire("{name}");';
  _$jscoverage['/xtemplate/compiler.js'].lineData[20]++;
  var CHECK_BUFFER = ['if({name} && {name}.isBuffer){', 'buffer = {name};', '{name} = undefined;', '}'].join('\n');
  _$jscoverage['/xtemplate/compiler.js'].lineData[25]++;
  var CHECK_VERSION = ['if("{version}" !== S.version){', 'throw new Error("current xtemplate file(" + engine.name + ")(v{version}) ' + 'need to be recompiled using current kissy(v"+ S.version+")!");', '}'].join('\n');
  _$jscoverage['/xtemplate/compiler.js'].lineData[30]++;
  var FUNC = ['function({params}){', '{body}', '}'].join('\n');
  _$jscoverage['/xtemplate/compiler.js'].lineData[34]++;
  var SOURCE_URL = ['', '//# sourceURL = {name}.js'].join('\n');
  _$jscoverage['/xtemplate/compiler.js'].lineData[39]++;
  var DECLARE_NATIVE_COMMANDS = '{name}Command = nativeCommands["{name}"]';
  _$jscoverage['/xtemplate/compiler.js'].lineData[41]++;
  var DECLARE_UTILS = '{name}Util = utils["{name}"]';
  _$jscoverage['/xtemplate/compiler.js'].lineData[43]++;
  var BUFFER_WRITE = 'buffer.write({value},{escape});';
  _$jscoverage['/xtemplate/compiler.js'].lineData[46]++;
  var XTemplateRuntime = require('./runtime');
  _$jscoverage['/xtemplate/compiler.js'].lineData[47]++;
  var parser = require('./compiler/parser');
  _$jscoverage['/xtemplate/compiler.js'].lineData[48]++;
  parser.yy = require('./compiler/ast');
  _$jscoverage['/xtemplate/compiler.js'].lineData[49]++;
  var nativeCode = [];
  _$jscoverage['/xtemplate/compiler.js'].lineData[50]++;
  var substitute = S.substitute;
  _$jscoverage['/xtemplate/compiler.js'].lineData[51]++;
  var nativeCommands = XTemplateRuntime.nativeCommands;
  _$jscoverage['/xtemplate/compiler.js'].lineData[52]++;
  var nativeUtils = XTemplateRuntime.utils;
  _$jscoverage['/xtemplate/compiler.js'].lineData[54]++;
  var t;
  _$jscoverage['/xtemplate/compiler.js'].lineData[56]++;
  for (t in nativeUtils) {
    _$jscoverage['/xtemplate/compiler.js'].lineData[57]++;
    nativeCode.push(substitute(DECLARE_UTILS, {
  name: t}));
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[62]++;
  for (t in nativeCommands) {
    _$jscoverage['/xtemplate/compiler.js'].lineData[63]++;
    nativeCode.push(substitute(DECLARE_NATIVE_COMMANDS, {
  name: t}));
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[68]++;
  nativeCode = 'var ' + nativeCode.join(',\n') + ';';
  _$jscoverage['/xtemplate/compiler.js'].lineData[70]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, uuid = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[75]++;
  function guid(str) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[1]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[76]++;
    return str + (uuid++);
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[79]++;
  function wrapByDoubleQuote(str) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[2]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[80]++;
    return '"' + str + '"';
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[83]++;
  function wrapBySingleQuote(str) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[3]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[84]++;
    return '\'' + str + '\'';
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[87]++;
  function joinArrayOfString(arr) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[4]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[88]++;
    return wrapByDoubleQuote(arr.join('","'));
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[91]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[5]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[92]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[6]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[94]++;
  if (visit47_94_1(m.length % 2)) {
    _$jscoverage['/xtemplate/compiler.js'].lineData[95]++;
    m = '\\' + m;
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[97]++;
  return m;
});
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[101]++;
  function escapeString(str, isCode) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[7]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[102]++;
    if (visit48_102_1(isCode)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[103]++;
      str = escapeSingleQuoteInCodeString(str, 0);
    } else {
      _$jscoverage['/xtemplate/compiler.js'].lineData[106]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[109]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/xtemplate/compiler.js'].lineData[112]++;
    return str;
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[115]++;
  function pushToArray(to, from) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[8]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[116]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[119]++;
  function opExpression(e) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[9]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[120]++;
    var source = [], type = e.opType, exp1, exp2, code1Source, code2Source, code1 = xtplAstToJs[e.op1.type](e.op1), code2 = xtplAstToJs[e.op2.type](e.op2);
    _$jscoverage['/xtemplate/compiler.js'].lineData[128]++;
    exp1 = code1.exp;
    _$jscoverage['/xtemplate/compiler.js'].lineData[129]++;
    exp2 = code2.exp;
    _$jscoverage['/xtemplate/compiler.js'].lineData[130]++;
    var exp = guid('exp');
    _$jscoverage['/xtemplate/compiler.js'].lineData[131]++;
    code1Source = code1.source;
    _$jscoverage['/xtemplate/compiler.js'].lineData[132]++;
    code2Source = code2.source;
    _$jscoverage['/xtemplate/compiler.js'].lineData[133]++;
    pushToArray(source, code1Source);
    _$jscoverage['/xtemplate/compiler.js'].lineData[134]++;
    source.push('var ' + exp + ' = ' + exp1 + ';');
    _$jscoverage['/xtemplate/compiler.js'].lineData[135]++;
    if (visit49_135_1(visit50_135_2(type === '&&') || visit51_135_3(type === '||'))) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[136]++;
      source.push('if(' + (visit52_136_1(type === '&&') ? '' : '!') + '(' + exp1 + ')){');
      _$jscoverage['/xtemplate/compiler.js'].lineData[137]++;
      pushToArray(source, code2Source);
      _$jscoverage['/xtemplate/compiler.js'].lineData[138]++;
      source.push(exp + ' = ' + exp2 + ';');
      _$jscoverage['/xtemplate/compiler.js'].lineData[139]++;
      source.push('}');
    } else {
      _$jscoverage['/xtemplate/compiler.js'].lineData[141]++;
      pushToArray(source, code2Source);
      _$jscoverage['/xtemplate/compiler.js'].lineData[142]++;
      source.push(exp + ' = ' + '(' + exp1 + ')' + type + '(' + exp2 + ');');
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[144]++;
    return {
  exp: exp, 
  source: source};
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[151]++;
  function getIdStringFromIdParts(source, idParts) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[10]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[152]++;
    if (visit53_152_1(idParts.length === 1)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[153]++;
      return null;
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[155]++;
    var i, l, idPart, idPartType, check = 0, nextIdNameCode;
    _$jscoverage['/xtemplate/compiler.js'].lineData[158]++;
    for (i = 0 , l = idParts.length; visit54_158_1(i < l); i++) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[159]++;
      if (visit55_159_1(idParts[i].type)) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[160]++;
        check = 1;
        _$jscoverage['/xtemplate/compiler.js'].lineData[161]++;
        break;
      }
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[164]++;
    if (visit56_164_1(check)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[165]++;
      var ret = [];
      _$jscoverage['/xtemplate/compiler.js'].lineData[166]++;
      for (i = 0 , l = idParts.length; visit57_166_1(i < l); i++) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[167]++;
        idPart = idParts[i];
        _$jscoverage['/xtemplate/compiler.js'].lineData[168]++;
        idPartType = idPart.type;
        _$jscoverage['/xtemplate/compiler.js'].lineData[169]++;
        if (visit58_169_1(idPartType)) {
          _$jscoverage['/xtemplate/compiler.js'].lineData[170]++;
          nextIdNameCode = xtplAstToJs[idPartType](idPart);
          _$jscoverage['/xtemplate/compiler.js'].lineData[171]++;
          pushToArray(source, nextIdNameCode.source);
          _$jscoverage['/xtemplate/compiler.js'].lineData[172]++;
          ret.push(nextIdNameCode.exp);
        } else {
          _$jscoverage['/xtemplate/compiler.js'].lineData[175]++;
          ret.push(wrapByDoubleQuote(idPart));
        }
      }
      _$jscoverage['/xtemplate/compiler.js'].lineData[178]++;
      return ret;
    } else {
      _$jscoverage['/xtemplate/compiler.js'].lineData[180]++;
      return null;
    }
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[184]++;
  function genFunction(statements) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[11]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[185]++;
    var source = ['function(scope, buffer) {'];
    _$jscoverage['/xtemplate/compiler.js'].lineData[186]++;
    for (var i = 0, len = statements.length; visit59_186_1(i < len); i++) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[187]++;
      pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[189]++;
    source.push('return buffer; }');
    _$jscoverage['/xtemplate/compiler.js'].lineData[190]++;
    return source;
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[193]++;
  function genTopFunction(xtplAstToJs, statements) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[12]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[194]++;
    var source = ['var engine = this,', 'nativeCommands = engine.nativeCommands,', 'utils = engine.utils;', nativeCode];
    _$jscoverage['/xtemplate/compiler.js'].lineData[200]++;
    if (visit60_200_1(xtplAstToJs.isModule)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[201]++;
      source.push(substitute(CHECK_VERSION, {
  version: S.version}));
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[205]++;
    for (var i = 0, len = statements.length; visit61_205_1(i < len); i++) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[206]++;
      pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[208]++;
    source.push('return buffer;');
    _$jscoverage['/xtemplate/compiler.js'].lineData[209]++;
    return {
  params: ['scope', 'buffer', 'session', 'undefined'], 
  source: source.join('\n')};
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[215]++;
  function genOptionFromFunction(func, escape) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[13]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[216]++;
    var optionName = guid('option');
    _$jscoverage['/xtemplate/compiler.js'].lineData[218]++;
    var source = ['var ' + optionName + ' = {' + (escape ? 'escape: 1' : '') + '};'], params = func.params, hash = func.hash;
    _$jscoverage['/xtemplate/compiler.js'].lineData[222]++;
    if (visit62_222_1(params)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[223]++;
      var paramsName = guid('params');
      _$jscoverage['/xtemplate/compiler.js'].lineData[224]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/xtemplate/compiler.js'].lineData[225]++;
      S.each(params, function(param) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[14]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[226]++;
  var nextIdNameCode = xtplAstToJs[param.type](param);
  _$jscoverage['/xtemplate/compiler.js'].lineData[227]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/xtemplate/compiler.js'].lineData[228]++;
  source.push(paramsName + '.push(' + nextIdNameCode.exp + ');');
});
      _$jscoverage['/xtemplate/compiler.js'].lineData[230]++;
      source.push(optionName + '.params = ' + paramsName + ';');
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[233]++;
    if (visit63_233_1(hash)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[234]++;
      var hashName = guid('hash');
      _$jscoverage['/xtemplate/compiler.js'].lineData[235]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/xtemplate/compiler.js'].lineData[236]++;
      S.each(hash.value, function(v, key) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[15]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[237]++;
  var nextIdNameCode = xtplAstToJs[v.type](v);
  _$jscoverage['/xtemplate/compiler.js'].lineData[238]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/xtemplate/compiler.js'].lineData[239]++;
  source.push(hashName + '[' + wrapByDoubleQuote(key) + '] = ' + nextIdNameCode.exp + ';');
});
      _$jscoverage['/xtemplate/compiler.js'].lineData[241]++;
      source.push(optionName + '.hash = ' + hashName + ';');
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[244]++;
    return {
  exp: optionName, 
  source: source};
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[250]++;
  function generateFunction(xtplAstToJs, func, escape, block) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[16]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[251]++;
    var source = [], functionConfigCode, optionName, id = func.id, idName, idString = id.string, idParts = id.parts, lineNumber = id.lineNumber;
    _$jscoverage['/xtemplate/compiler.js'].lineData[260]++;
    functionConfigCode = genOptionFromFunction(func, escape);
    _$jscoverage['/xtemplate/compiler.js'].lineData[261]++;
    optionName = functionConfigCode.exp;
    _$jscoverage['/xtemplate/compiler.js'].lineData[262]++;
    pushToArray(source, functionConfigCode.source);
    _$jscoverage['/xtemplate/compiler.js'].lineData[264]++;
    if (visit64_264_1(block)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[265]++;
      var programNode = block.program;
      _$jscoverage['/xtemplate/compiler.js'].lineData[266]++;
      source.push(optionName + '.fn = ' + genFunction(programNode.statements).join('\n') + ';');
      _$jscoverage['/xtemplate/compiler.js'].lineData[267]++;
      if (visit65_267_1(programNode.inverse)) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[268]++;
        source.push(optionName + '.inverse = ' + genFunction(programNode.inverse).join('\n') + ';');
      }
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[272]++;
    if (visit66_272_1(xtplAstToJs.isModule)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[274]++;
      if (visit67_274_1(visit68_274_2(idString === 'include') || visit69_274_3(idString === 'extend'))) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[276]++;
        source.push(substitute(REQUIRE_MODULE, {
  name: func.params[0].value}));
      }
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[282]++;
    if (visit70_282_1(!block)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[283]++;
      idName = guid('callRet');
      _$jscoverage['/xtemplate/compiler.js'].lineData[284]++;
      source.push('var ' + idName);
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[287]++;
    if (visit71_287_1(idString in nativeCommands)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[288]++;
      source.push(substitute(CALL_NATIVE_COMMAND, {
  lhs: block ? 'buffer' : idName, 
  name: idString, 
  option: optionName, 
  lineNumber: lineNumber}));
    } else {
      _$jscoverage['/xtemplate/compiler.js'].lineData[294]++;
      if (visit72_294_1(block)) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[295]++;
        source.push(substitute(CALL_CUSTOM_COMMAND, {
  option: optionName, 
  idParts: joinArrayOfString(idParts), 
  lineNumber: lineNumber}));
      } else {
        _$jscoverage['/xtemplate/compiler.js'].lineData[303]++;
        var newParts = getIdStringFromIdParts(source, idParts);
        _$jscoverage['/xtemplate/compiler.js'].lineData[304]++;
        source.push(substitute(CALL_FUNCTION, {
  lhs: idName, 
  option: optionName, 
  idParts: (newParts ? newParts.join(',') : joinArrayOfString(idParts)), 
  depth: id.depth, 
  lineNumber: lineNumber}));
      }
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[313]++;
    if (visit73_313_1(idName)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[314]++;
      source.push(substitute(CHECK_BUFFER, {
  name: idName}));
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[319]++;
    return {
  exp: idName, 
  source: source};
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[325]++;
  var xtplAstToJs = {
  conditionalOrExpression: opExpression, 
  conditionalAndExpression: opExpression, 
  relationalExpression: opExpression, 
  equalityExpression: opExpression, 
  additiveExpression: opExpression, 
  multiplicativeExpression: opExpression, 
  unaryExpression: function(e) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[17]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[339]++;
  var code = xtplAstToJs[e.value.type](e.value);
  _$jscoverage['/xtemplate/compiler.js'].lineData[340]++;
  return {
  exp: e.unaryType + '(' + code.exp + ')', 
  source: code.source};
}, 
  string: function(e) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[18]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[349]++;
  return {
  exp: wrapBySingleQuote(escapeString(e.value, 1)), 
  source: []};
}, 
  number: function(e) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[19]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[356]++;
  return {
  exp: e.value, 
  source: []};
}, 
  id: function(idNode) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[20]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[363]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id');
  _$jscoverage['/xtemplate/compiler.js'].lineData[368]++;
  var newParts = getIdStringFromIdParts(source, idParts);
  _$jscoverage['/xtemplate/compiler.js'].lineData[370]++;
  source.push(substitute(SCOPE_RESOLVE, {
  lhs: idName, 
  idParts: newParts ? newParts.join(',') : joinArrayOfString(idParts), 
  depth: depth}));
  _$jscoverage['/xtemplate/compiler.js'].lineData[375]++;
  return {
  exp: idName, 
  source: source};
}, 
  'function': function(func, escape) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[21]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[382]++;
  return generateFunction(this, func, escape);
}, 
  blockStatement: function(block) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[22]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[386]++;
  return generateFunction(this, block.func, block.escape, block);
}, 
  expressionStatement: function(expressionStatement) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[23]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[390]++;
  var source = [], escape = expressionStatement.escape, code, expression = expressionStatement.value, type = expression.type, expressionOrVariable;
  _$jscoverage['/xtemplate/compiler.js'].lineData[397]++;
  code = xtplAstToJs[type](expression, escape);
  _$jscoverage['/xtemplate/compiler.js'].lineData[399]++;
  pushToArray(source, code.source);
  _$jscoverage['/xtemplate/compiler.js'].lineData[400]++;
  expressionOrVariable = code.exp;
  _$jscoverage['/xtemplate/compiler.js'].lineData[402]++;
  source.push(substitute(BUFFER_WRITE, {
  value: expressionOrVariable, 
  escape: !!escape}));
  _$jscoverage['/xtemplate/compiler.js'].lineData[407]++;
  return {
  exp: '', 
  source: source};
}, 
  contentStatement: function(contentStatement) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[24]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[415]++;
  return {
  exp: '', 
  source: [substitute(BUFFER_WRITE, {
  value: wrapBySingleQuote(escapeString(contentStatement.value, 0)), 
  escape: 0})]};
}};
  _$jscoverage['/xtemplate/compiler.js'].lineData[428]++;
  xtplAstToJs['boolean'] = function(e) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[25]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[429]++;
  return {
  exp: e.value, 
  source: []};
};
  _$jscoverage['/xtemplate/compiler.js'].lineData[435]++;
  var compiler;
  _$jscoverage['/xtemplate/compiler.js'].lineData[442]++;
  compiler = {
  parse: function(tplContent, name) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[26]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[450]++;
  return parser.parse(tplContent, name);
}, 
  compileToStr: function(tplContent, name, isModule) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[27]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[460]++;
  var func = compiler.compile(tplContent, name, isModule);
  _$jscoverage['/xtemplate/compiler.js'].lineData[461]++;
  return substitute(FUNC, {
  params: func.params.join(','), 
  body: func.source});
}, 
  compile: function(tplContent, name, isModule) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[28]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[474]++;
  var root = compiler.parse(tplContent, name);
  _$jscoverage['/xtemplate/compiler.js'].lineData[475]++;
  uuid = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[476]++;
  xtplAstToJs.isModule = isModule;
  _$jscoverage['/xtemplate/compiler.js'].lineData[477]++;
  return genTopFunction(xtplAstToJs, root.statements);
}, 
  compileToFn: function(tplContent, name) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[29]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[486]++;
  var code = compiler.compile(tplContent, visit74_486_1(name || guid('xtemplate')));
  _$jscoverage['/xtemplate/compiler.js'].lineData[488]++;
  return Function.apply(null, code.params.concat(code.source + substitute(SOURCE_URL, {
  name: name})));
}};
  _$jscoverage['/xtemplate/compiler.js'].lineData[495]++;
  return compiler;
});
