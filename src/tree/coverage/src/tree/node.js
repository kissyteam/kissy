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
if (! _$jscoverage['/tree/node.js']) {
  _$jscoverage['/tree/node.js'] = {};
  _$jscoverage['/tree/node.js'].lineData = [];
  _$jscoverage['/tree/node.js'].lineData[5] = 0;
  _$jscoverage['/tree/node.js'].lineData[6] = 0;
  _$jscoverage['/tree/node.js'].lineData[14] = 0;
  _$jscoverage['/tree/node.js'].lineData[16] = 0;
  _$jscoverage['/tree/node.js'].lineData[17] = 0;
  _$jscoverage['/tree/node.js'].lineData[18] = 0;
  _$jscoverage['/tree/node.js'].lineData[23] = 0;
  _$jscoverage['/tree/node.js'].lineData[24] = 0;
  _$jscoverage['/tree/node.js'].lineData[30] = 0;
  _$jscoverage['/tree/node.js'].lineData[40] = 0;
  _$jscoverage['/tree/node.js'].lineData[42] = 0;
  _$jscoverage['/tree/node.js'].lineData[43] = 0;
  _$jscoverage['/tree/node.js'].lineData[48] = 0;
  _$jscoverage['/tree/node.js'].lineData[49] = 0;
  _$jscoverage['/tree/node.js'].lineData[54] = 0;
  _$jscoverage['/tree/node.js'].lineData[55] = 0;
  _$jscoverage['/tree/node.js'].lineData[60] = 0;
  _$jscoverage['/tree/node.js'].lineData[61] = 0;
  _$jscoverage['/tree/node.js'].lineData[66] = 0;
  _$jscoverage['/tree/node.js'].lineData[67] = 0;
  _$jscoverage['/tree/node.js'].lineData[72] = 0;
  _$jscoverage['/tree/node.js'].lineData[73] = 0;
  _$jscoverage['/tree/node.js'].lineData[75] = 0;
  _$jscoverage['/tree/node.js'].lineData[77] = 0;
  _$jscoverage['/tree/node.js'].lineData[82] = 0;
  _$jscoverage['/tree/node.js'].lineData[83] = 0;
  _$jscoverage['/tree/node.js'].lineData[84] = 0;
  _$jscoverage['/tree/node.js'].lineData[86] = 0;
  _$jscoverage['/tree/node.js'].lineData[89] = 0;
  _$jscoverage['/tree/node.js'].lineData[92] = 0;
  _$jscoverage['/tree/node.js'].lineData[93] = 0;
  _$jscoverage['/tree/node.js'].lineData[96] = 0;
  _$jscoverage['/tree/node.js'].lineData[97] = 0;
  _$jscoverage['/tree/node.js'].lineData[100] = 0;
  _$jscoverage['/tree/node.js'].lineData[104] = 0;
  _$jscoverage['/tree/node.js'].lineData[108] = 0;
  _$jscoverage['/tree/node.js'].lineData[109] = 0;
  _$jscoverage['/tree/node.js'].lineData[111] = 0;
  _$jscoverage['/tree/node.js'].lineData[112] = 0;
  _$jscoverage['/tree/node.js'].lineData[113] = 0;
  _$jscoverage['/tree/node.js'].lineData[114] = 0;
  _$jscoverage['/tree/node.js'].lineData[116] = 0;
  _$jscoverage['/tree/node.js'].lineData[120] = 0;
  _$jscoverage['/tree/node.js'].lineData[124] = 0;
  _$jscoverage['/tree/node.js'].lineData[125] = 0;
  _$jscoverage['/tree/node.js'].lineData[127] = 0;
  _$jscoverage['/tree/node.js'].lineData[128] = 0;
  _$jscoverage['/tree/node.js'].lineData[129] = 0;
  _$jscoverage['/tree/node.js'].lineData[130] = 0;
  _$jscoverage['/tree/node.js'].lineData[132] = 0;
  _$jscoverage['/tree/node.js'].lineData[139] = 0;
  _$jscoverage['/tree/node.js'].lineData[143] = 0;
  _$jscoverage['/tree/node.js'].lineData[147] = 0;
  _$jscoverage['/tree/node.js'].lineData[148] = 0;
  _$jscoverage['/tree/node.js'].lineData[149] = 0;
  _$jscoverage['/tree/node.js'].lineData[151] = 0;
  _$jscoverage['/tree/node.js'].lineData[152] = 0;
  _$jscoverage['/tree/node.js'].lineData[154] = 0;
  _$jscoverage['/tree/node.js'].lineData[161] = 0;
  _$jscoverage['/tree/node.js'].lineData[162] = 0;
  _$jscoverage['/tree/node.js'].lineData[164] = 0;
  _$jscoverage['/tree/node.js'].lineData[165] = 0;
  _$jscoverage['/tree/node.js'].lineData[170] = 0;
  _$jscoverage['/tree/node.js'].lineData[171] = 0;
  _$jscoverage['/tree/node.js'].lineData[172] = 0;
  _$jscoverage['/tree/node.js'].lineData[176] = 0;
  _$jscoverage['/tree/node.js'].lineData[177] = 0;
  _$jscoverage['/tree/node.js'].lineData[179] = 0;
  _$jscoverage['/tree/node.js'].lineData[187] = 0;
  _$jscoverage['/tree/node.js'].lineData[188] = 0;
  _$jscoverage['/tree/node.js'].lineData[189] = 0;
  _$jscoverage['/tree/node.js'].lineData[190] = 0;
  _$jscoverage['/tree/node.js'].lineData[198] = 0;
  _$jscoverage['/tree/node.js'].lineData[199] = 0;
  _$jscoverage['/tree/node.js'].lineData[200] = 0;
  _$jscoverage['/tree/node.js'].lineData[201] = 0;
  _$jscoverage['/tree/node.js'].lineData[278] = 0;
  _$jscoverage['/tree/node.js'].lineData[279] = 0;
  _$jscoverage['/tree/node.js'].lineData[280] = 0;
  _$jscoverage['/tree/node.js'].lineData[282] = 0;
  _$jscoverage['/tree/node.js'].lineData[309] = 0;
  _$jscoverage['/tree/node.js'].lineData[310] = 0;
  _$jscoverage['/tree/node.js'].lineData[311] = 0;
  _$jscoverage['/tree/node.js'].lineData[312] = 0;
  _$jscoverage['/tree/node.js'].lineData[316] = 0;
  _$jscoverage['/tree/node.js'].lineData[317] = 0;
  _$jscoverage['/tree/node.js'].lineData[318] = 0;
  _$jscoverage['/tree/node.js'].lineData[319] = 0;
  _$jscoverage['/tree/node.js'].lineData[320] = 0;
  _$jscoverage['/tree/node.js'].lineData[324] = 0;
  _$jscoverage['/tree/node.js'].lineData[325] = 0;
  _$jscoverage['/tree/node.js'].lineData[326] = 0;
  _$jscoverage['/tree/node.js'].lineData[327] = 0;
  _$jscoverage['/tree/node.js'].lineData[332] = 0;
  _$jscoverage['/tree/node.js'].lineData[333] = 0;
  _$jscoverage['/tree/node.js'].lineData[339] = 0;
  _$jscoverage['/tree/node.js'].lineData[342] = 0;
  _$jscoverage['/tree/node.js'].lineData[343] = 0;
  _$jscoverage['/tree/node.js'].lineData[345] = 0;
  _$jscoverage['/tree/node.js'].lineData[348] = 0;
  _$jscoverage['/tree/node.js'].lineData[349] = 0;
  _$jscoverage['/tree/node.js'].lineData[351] = 0;
  _$jscoverage['/tree/node.js'].lineData[352] = 0;
  _$jscoverage['/tree/node.js'].lineData[355] = 0;
  _$jscoverage['/tree/node.js'].lineData[359] = 0;
  _$jscoverage['/tree/node.js'].lineData[360] = 0;
  _$jscoverage['/tree/node.js'].lineData[361] = 0;
  _$jscoverage['/tree/node.js'].lineData[362] = 0;
  _$jscoverage['/tree/node.js'].lineData[364] = 0;
  _$jscoverage['/tree/node.js'].lineData[366] = 0;
  _$jscoverage['/tree/node.js'].lineData[370] = 0;
  _$jscoverage['/tree/node.js'].lineData[371] = 0;
  _$jscoverage['/tree/node.js'].lineData[374] = 0;
  _$jscoverage['/tree/node.js'].lineData[375] = 0;
  _$jscoverage['/tree/node.js'].lineData[379] = 0;
  _$jscoverage['/tree/node.js'].lineData[380] = 0;
  _$jscoverage['/tree/node.js'].lineData[381] = 0;
  _$jscoverage['/tree/node.js'].lineData[382] = 0;
  _$jscoverage['/tree/node.js'].lineData[384] = 0;
  _$jscoverage['/tree/node.js'].lineData[391] = 0;
  _$jscoverage['/tree/node.js'].lineData[392] = 0;
  _$jscoverage['/tree/node.js'].lineData[393] = 0;
  _$jscoverage['/tree/node.js'].lineData[397] = 0;
  _$jscoverage['/tree/node.js'].lineData[398] = 0;
  _$jscoverage['/tree/node.js'].lineData[399] = 0;
  _$jscoverage['/tree/node.js'].lineData[400] = 0;
  _$jscoverage['/tree/node.js'].lineData[401] = 0;
  _$jscoverage['/tree/node.js'].lineData[405] = 0;
  _$jscoverage['/tree/node.js'].lineData[406] = 0;
  _$jscoverage['/tree/node.js'].lineData[407] = 0;
  _$jscoverage['/tree/node.js'].lineData[409] = 0;
  _$jscoverage['/tree/node.js'].lineData[410] = 0;
  _$jscoverage['/tree/node.js'].lineData[411] = 0;
  _$jscoverage['/tree/node.js'].lineData[413] = 0;
  _$jscoverage['/tree/node.js'].lineData[418] = 0;
  _$jscoverage['/tree/node.js'].lineData[419] = 0;
  _$jscoverage['/tree/node.js'].lineData[420] = 0;
  _$jscoverage['/tree/node.js'].lineData[421] = 0;
  _$jscoverage['/tree/node.js'].lineData[424] = 0;
  _$jscoverage['/tree/node.js'].lineData[425] = 0;
  _$jscoverage['/tree/node.js'].lineData[426] = 0;
  _$jscoverage['/tree/node.js'].lineData[427] = 0;
}
if (! _$jscoverage['/tree/node.js'].functionData) {
  _$jscoverage['/tree/node.js'].functionData = [];
  _$jscoverage['/tree/node.js'].functionData[0] = 0;
  _$jscoverage['/tree/node.js'].functionData[1] = 0;
  _$jscoverage['/tree/node.js'].functionData[2] = 0;
  _$jscoverage['/tree/node.js'].functionData[3] = 0;
  _$jscoverage['/tree/node.js'].functionData[4] = 0;
  _$jscoverage['/tree/node.js'].functionData[5] = 0;
  _$jscoverage['/tree/node.js'].functionData[6] = 0;
  _$jscoverage['/tree/node.js'].functionData[7] = 0;
  _$jscoverage['/tree/node.js'].functionData[8] = 0;
  _$jscoverage['/tree/node.js'].functionData[9] = 0;
  _$jscoverage['/tree/node.js'].functionData[10] = 0;
  _$jscoverage['/tree/node.js'].functionData[11] = 0;
  _$jscoverage['/tree/node.js'].functionData[12] = 0;
  _$jscoverage['/tree/node.js'].functionData[13] = 0;
  _$jscoverage['/tree/node.js'].functionData[14] = 0;
  _$jscoverage['/tree/node.js'].functionData[15] = 0;
  _$jscoverage['/tree/node.js'].functionData[16] = 0;
  _$jscoverage['/tree/node.js'].functionData[17] = 0;
  _$jscoverage['/tree/node.js'].functionData[18] = 0;
  _$jscoverage['/tree/node.js'].functionData[19] = 0;
  _$jscoverage['/tree/node.js'].functionData[20] = 0;
  _$jscoverage['/tree/node.js'].functionData[21] = 0;
  _$jscoverage['/tree/node.js'].functionData[22] = 0;
  _$jscoverage['/tree/node.js'].functionData[23] = 0;
  _$jscoverage['/tree/node.js'].functionData[24] = 0;
  _$jscoverage['/tree/node.js'].functionData[25] = 0;
  _$jscoverage['/tree/node.js'].functionData[26] = 0;
  _$jscoverage['/tree/node.js'].functionData[27] = 0;
  _$jscoverage['/tree/node.js'].functionData[28] = 0;
}
if (! _$jscoverage['/tree/node.js'].branchData) {
  _$jscoverage['/tree/node.js'].branchData = {};
  _$jscoverage['/tree/node.js'].branchData['72'] = [];
  _$jscoverage['/tree/node.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['72'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['72'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['82'] = [];
  _$jscoverage['/tree/node.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['83'] = [];
  _$jscoverage['/tree/node.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['96'] = [];
  _$jscoverage['/tree/node.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['108'] = [];
  _$jscoverage['/tree/node.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['113'] = [];
  _$jscoverage['/tree/node.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['124'] = [];
  _$jscoverage['/tree/node.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['129'] = [];
  _$jscoverage['/tree/node.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['148'] = [];
  _$jscoverage['/tree/node.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['164'] = [];
  _$jscoverage['/tree/node.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['177'] = [];
  _$jscoverage['/tree/node.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['279'] = [];
  _$jscoverage['/tree/node.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['311'] = [];
  _$jscoverage['/tree/node.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['318'] = [];
  _$jscoverage['/tree/node.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['326'] = [];
  _$jscoverage['/tree/node.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['334'] = [];
  _$jscoverage['/tree/node.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['335'] = [];
  _$jscoverage['/tree/node.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['339'] = [];
  _$jscoverage['/tree/node.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['339'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['345'] = [];
  _$jscoverage['/tree/node.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['345'][2] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['345'][3] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['345'][4] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['351'] = [];
  _$jscoverage['/tree/node.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['361'] = [];
  _$jscoverage['/tree/node.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['374'] = [];
  _$jscoverage['/tree/node.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['381'] = [];
  _$jscoverage['/tree/node.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['392'] = [];
  _$jscoverage['/tree/node.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['399'] = [];
  _$jscoverage['/tree/node.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['406'] = [];
  _$jscoverage['/tree/node.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['410'] = [];
  _$jscoverage['/tree/node.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/tree/node.js'].branchData['424'] = [];
  _$jscoverage['/tree/node.js'].branchData['424'][1] = new BranchData();
}
_$jscoverage['/tree/node.js'].branchData['424'][1].init(183, 11, 'index < len');
function visit60_424_1(result) {
  _$jscoverage['/tree/node.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['410'][1].init(18, 27, 'typeof setDepth == \'number\'');
function visit59_410_1(result) {
  _$jscoverage['/tree/node.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['406'][1].init(14, 22, 'setDepth !== undefined');
function visit58_406_1(result) {
  _$jscoverage['/tree/node.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['399'][1].init(52, 4, 'tree');
function visit57_399_1(result) {
  _$jscoverage['/tree/node.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['392'][1].init(14, 21, 'self.get && self.view');
function visit56_392_1(result) {
  _$jscoverage['/tree/node.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['381'][1].init(298, 37, '!n && (parent = parent.get(\'parent\'))');
function visit55_381_1(result) {
  _$jscoverage['/tree/node.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['374'][1].init(97, 39, 'self.get("expanded") && children.length');
function visit54_374_1(result) {
  _$jscoverage['/tree/node.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['361'][1].init(47, 5, '!prev');
function visit53_361_1(result) {
  _$jscoverage['/tree/node.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['351'][1].init(95, 41, '!self.get("expanded") || !children.length');
function visit52_351_1(result) {
  _$jscoverage['/tree/node.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['345'][4].init(122, 20, 'isLeaf === undefined');
function visit51_345_4(result) {
  _$jscoverage['/tree/node.js'].branchData['345'][4].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['345'][3].init(122, 51, 'isLeaf === undefined && self.get("children").length');
function visit50_345_3(result) {
  _$jscoverage['/tree/node.js'].branchData['345'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['345'][2].init(101, 16, 'isLeaf === false');
function visit49_345_2(result) {
  _$jscoverage['/tree/node.js'].branchData['345'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['345'][1].init(101, 73, 'isLeaf === false || (isLeaf === undefined && self.get("children").length)');
function visit48_345_1(result) {
  _$jscoverage['/tree/node.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['339'][2].init(253, 17, 'lastChild == self');
function visit47_339_2(result) {
  _$jscoverage['/tree/node.js'].branchData['339'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['339'][1].init(239, 31, '!lastChild || lastChild == self');
function visit46_339_1(result) {
  _$jscoverage['/tree/node.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['335'][1].init(115, 41, 'children && children[children.length - 1]');
function visit45_335_1(result) {
  _$jscoverage['/tree/node.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['334'][1].init(56, 32, 'parent && parent.get("children")');
function visit44_334_1(result) {
  _$jscoverage['/tree/node.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['326'][1].init(40, 17, 'e.target === self');
function visit43_326_1(result) {
  _$jscoverage['/tree/node.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['318'][1].init(40, 16, 'e.target == self');
function visit42_318_1(result) {
  _$jscoverage['/tree/node.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['311'][1].init(40, 16, 'e.target == self');
function visit41_311_1(result) {
  _$jscoverage['/tree/node.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['279'][1].init(67, 20, 'from && !from.isTree');
function visit40_279_1(result) {
  _$jscoverage['/tree/node.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['177'][1].init(60, 32, 'e && e.byPassSetTreeSelectedItem');
function visit39_177_1(result) {
  _$jscoverage['/tree/node.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['164'][1].init(158, 25, 'self === self.get(\'tree\')');
function visit38_164_1(result) {
  _$jscoverage['/tree/node.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['148'][1].init(206, 39, 'target.equals(self.get("expandIconEl"))');
function visit37_148_1(result) {
  _$jscoverage['/tree/node.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['129'][1].init(314, 11, 'index === 0');
function visit36_129_1(result) {
  _$jscoverage['/tree/node.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['124'][1].init(145, 7, '!parent');
function visit35_124_1(result) {
  _$jscoverage['/tree/node.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['113'][1].init(314, 28, 'index == siblings.length - 1');
function visit34_113_1(result) {
  _$jscoverage['/tree/node.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['108'][1].init(145, 7, '!parent');
function visit33_108_1(result) {
  _$jscoverage['/tree/node.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['96'][1].init(2193, 16, 'nodeToBeSelected');
function visit32_96_1(result) {
  _$jscoverage['/tree/node.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['83'][1].init(30, 9, '!expanded');
function visit31_83_1(result) {
  _$jscoverage['/tree/node.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['82'][2].init(63, 16, 'isLeaf === false');
function visit30_82_2(result) {
  _$jscoverage['/tree/node.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['82'][1].init(44, 35, 'children.length || isLeaf === false');
function visit29_82_1(result) {
  _$jscoverage['/tree/node.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['72'][3].init(75, 16, 'isLeaf === false');
function visit28_72_3(result) {
  _$jscoverage['/tree/node.js'].branchData['72'][3].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['72'][2].init(56, 35, 'children.length || isLeaf === false');
function visit27_72_2(result) {
  _$jscoverage['/tree/node.js'].branchData['72'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].branchData['72'][1].init(43, 49, 'expanded && (children.length || isLeaf === false)');
function visit26_72_1(result) {
  _$jscoverage['/tree/node.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/node.js'].lineData[5]++;
KISSY.add("tree/node", function(S, Node, Container, TreeNodeRender) {
  _$jscoverage['/tree/node.js'].functionData[0]++;
  _$jscoverage['/tree/node.js'].lineData[6]++;
  var $ = Node.all, KeyCode = Node.KeyCode;
  _$jscoverage['/tree/node.js'].lineData[14]++;
  return Container.extend({
  bindUI: function() {
  _$jscoverage['/tree/node.js'].functionData[1]++;
  _$jscoverage['/tree/node.js'].lineData[16]++;
  this.on('afterAddChild', onAddChild);
  _$jscoverage['/tree/node.js'].lineData[17]++;
  this.on('afterRemoveChild', onRemoveChild);
  _$jscoverage['/tree/node.js'].lineData[18]++;
  this.on('afterAddChild afterRemoveChild', syncAriaSetSize);
}, 
  syncUI: function() {
  _$jscoverage['/tree/node.js'].functionData[2]++;
  _$jscoverage['/tree/node.js'].lineData[23]++;
  refreshCss(this);
  _$jscoverage['/tree/node.js'].lineData[24]++;
  syncAriaSetSize.call(this, {
  target: this});
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[3]++;
  _$jscoverage['/tree/node.js'].lineData[30]++;
  var self = this, processed = true, tree = self.get("tree"), expanded = self.get("expanded"), nodeToBeSelected, isLeaf = self.get("isLeaf"), children = self.get("children"), keyCode = e.keyCode;
  _$jscoverage['/tree/node.js'].lineData[40]++;
  switch (keyCode) {
    case KeyCode.ENTER:
      _$jscoverage['/tree/node.js'].lineData[42]++;
      return self.handleClickInternal(e);
      _$jscoverage['/tree/node.js'].lineData[43]++;
      break;
    case KeyCode.HOME:
      _$jscoverage['/tree/node.js'].lineData[48]++;
      nodeToBeSelected = tree;
      _$jscoverage['/tree/node.js'].lineData[49]++;
      break;
    case KeyCode.END:
      _$jscoverage['/tree/node.js'].lineData[54]++;
      nodeToBeSelected = getLastVisibleDescendant(tree);
      _$jscoverage['/tree/node.js'].lineData[55]++;
      break;
    case KeyCode.UP:
      _$jscoverage['/tree/node.js'].lineData[60]++;
      nodeToBeSelected = getPreviousVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[61]++;
      break;
    case KeyCode.DOWN:
      _$jscoverage['/tree/node.js'].lineData[66]++;
      nodeToBeSelected = getNextVisibleNode(self);
      _$jscoverage['/tree/node.js'].lineData[67]++;
      break;
    case KeyCode.LEFT:
      _$jscoverage['/tree/node.js'].lineData[72]++;
      if (visit26_72_1(expanded && (visit27_72_2(children.length || visit28_72_3(isLeaf === false))))) {
        _$jscoverage['/tree/node.js'].lineData[73]++;
        self.set("expanded", false);
      } else {
        _$jscoverage['/tree/node.js'].lineData[75]++;
        nodeToBeSelected = self.get('parent');
      }
      _$jscoverage['/tree/node.js'].lineData[77]++;
      break;
    case KeyCode.RIGHT:
      _$jscoverage['/tree/node.js'].lineData[82]++;
      if (visit29_82_1(children.length || visit30_82_2(isLeaf === false))) {
        _$jscoverage['/tree/node.js'].lineData[83]++;
        if (visit31_83_1(!expanded)) {
          _$jscoverage['/tree/node.js'].lineData[84]++;
          self.set("expanded", true);
        } else {
          _$jscoverage['/tree/node.js'].lineData[86]++;
          nodeToBeSelected = children[0];
        }
      }
      _$jscoverage['/tree/node.js'].lineData[89]++;
      break;
    default:
      _$jscoverage['/tree/node.js'].lineData[92]++;
      processed = false;
      _$jscoverage['/tree/node.js'].lineData[93]++;
      break;
  }
  _$jscoverage['/tree/node.js'].lineData[96]++;
  if (visit32_96_1(nodeToBeSelected)) {
    _$jscoverage['/tree/node.js'].lineData[97]++;
    nodeToBeSelected.select();
  }
  _$jscoverage['/tree/node.js'].lineData[100]++;
  return processed;
}, 
  next: function() {
  _$jscoverage['/tree/node.js'].functionData[4]++;
  _$jscoverage['/tree/node.js'].lineData[104]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[108]++;
  if (visit33_108_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[109]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[111]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[112]++;
  index = S.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[113]++;
  if (visit34_113_1(index == siblings.length - 1)) {
    _$jscoverage['/tree/node.js'].lineData[114]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[116]++;
  return siblings[index + 1];
}, 
  prev: function() {
  _$jscoverage['/tree/node.js'].functionData[5]++;
  _$jscoverage['/tree/node.js'].lineData[120]++;
  var self = this, parent = self.get('parent'), siblings, index;
  _$jscoverage['/tree/node.js'].lineData[124]++;
  if (visit35_124_1(!parent)) {
    _$jscoverage['/tree/node.js'].lineData[125]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[127]++;
  siblings = parent.get('children');
  _$jscoverage['/tree/node.js'].lineData[128]++;
  index = S.indexOf(self, siblings);
  _$jscoverage['/tree/node.js'].lineData[129]++;
  if (visit36_129_1(index === 0)) {
    _$jscoverage['/tree/node.js'].lineData[130]++;
    return null;
  }
  _$jscoverage['/tree/node.js'].lineData[132]++;
  return siblings[index - 1];
}, 
  select: function() {
  _$jscoverage['/tree/node.js'].functionData[6]++;
  _$jscoverage['/tree/node.js'].lineData[139]++;
  this.set('selected', true);
}, 
  handleClickInternal: function(e) {
  _$jscoverage['/tree/node.js'].functionData[7]++;
  _$jscoverage['/tree/node.js'].lineData[143]++;
  var self = this, target = $(e.target), expanded = self.get("expanded"), tree = self.get("tree");
  _$jscoverage['/tree/node.js'].lineData[147]++;
  tree.focus();
  _$jscoverage['/tree/node.js'].lineData[148]++;
  if (visit37_148_1(target.equals(self.get("expandIconEl")))) {
    _$jscoverage['/tree/node.js'].lineData[149]++;
    self.set("expanded", !expanded);
  } else {
    _$jscoverage['/tree/node.js'].lineData[151]++;
    self.select();
    _$jscoverage['/tree/node.js'].lineData[152]++;
    self.fire("click");
  }
  _$jscoverage['/tree/node.js'].lineData[154]++;
  return true;
}, 
  createChildren: function() {
  _$jscoverage['/tree/node.js'].functionData[8]++;
  _$jscoverage['/tree/node.js'].lineData[161]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[162]++;
  self.renderChildren.apply(self, arguments);
  _$jscoverage['/tree/node.js'].lineData[164]++;
  if (visit38_164_1(self === self.get('tree'))) {
    _$jscoverage['/tree/node.js'].lineData[165]++;
    updateSubTreeStatus(self, self, -1, 0);
  }
}, 
  _onSetExpanded: function(v) {
  _$jscoverage['/tree/node.js'].functionData[9]++;
  _$jscoverage['/tree/node.js'].lineData[170]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[171]++;
  refreshCss(self);
  _$jscoverage['/tree/node.js'].lineData[172]++;
  self.fire(v ? "expand" : "collapse");
}, 
  _onSetSelected: function(v, e) {
  _$jscoverage['/tree/node.js'].functionData[10]++;
  _$jscoverage['/tree/node.js'].lineData[176]++;
  var tree = this.get("tree");
  _$jscoverage['/tree/node.js'].lineData[177]++;
  if (visit39_177_1(e && e.byPassSetTreeSelectedItem)) {
  } else {
    _$jscoverage['/tree/node.js'].lineData[179]++;
    tree.set('selectedItem', v ? this : null);
  }
}, 
  expandAll: function() {
  _$jscoverage['/tree/node.js'].functionData[11]++;
  _$jscoverage['/tree/node.js'].lineData[187]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[188]++;
  self.set("expanded", true);
  _$jscoverage['/tree/node.js'].lineData[189]++;
  S.each(self.get("children"), function(c) {
  _$jscoverage['/tree/node.js'].functionData[12]++;
  _$jscoverage['/tree/node.js'].lineData[190]++;
  c.expandAll();
});
}, 
  collapseAll: function() {
  _$jscoverage['/tree/node.js'].functionData[13]++;
  _$jscoverage['/tree/node.js'].lineData[198]++;
  var self = this;
  _$jscoverage['/tree/node.js'].lineData[199]++;
  self.set("expanded", false);
  _$jscoverage['/tree/node.js'].lineData[200]++;
  S.each(self.get("children"), function(c) {
  _$jscoverage['/tree/node.js'].functionData[14]++;
  _$jscoverage['/tree/node.js'].lineData[201]++;
  c.collapseAll();
});
}}, {
  ATTRS: {
  xrender: {
  value: TreeNodeRender}, 
  checkable: {
  value: false, 
  view: 1}, 
  handleMouseEvents: {
  value: false}, 
  isLeaf: {
  view: 1}, 
  expandIconEl: {}, 
  iconEl: {}, 
  selected: {
  view: 1}, 
  expanded: {
  sync: 0, 
  value: false, 
  view: 1}, 
  tooltip: {
  view: 1}, 
  tree: {
  getter: function() {
  _$jscoverage['/tree/node.js'].functionData[15]++;
  _$jscoverage['/tree/node.js'].lineData[278]++;
  var from = this;
  _$jscoverage['/tree/node.js'].lineData[279]++;
  while (visit40_279_1(from && !from.isTree)) {
    _$jscoverage['/tree/node.js'].lineData[280]++;
    from = from.get('parent');
  }
  _$jscoverage['/tree/node.js'].lineData[282]++;
  return from;
}}, 
  depth: {
  view: 1}, 
  focusable: {
  value: false}, 
  defaultChildCfg: {
  value: {
  xclass: 'tree-node'}}}, 
  xclass: 'tree-node'});
  _$jscoverage['/tree/node.js'].lineData[309]++;
  function onAddChild(e) {
    _$jscoverage['/tree/node.js'].functionData[16]++;
    _$jscoverage['/tree/node.js'].lineData[310]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[311]++;
    if (visit41_311_1(e.target == self)) {
      _$jscoverage['/tree/node.js'].lineData[312]++;
      updateSubTreeStatus(self, e.component, self.get('depth'), e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[316]++;
  function onRemoveChild(e) {
    _$jscoverage['/tree/node.js'].functionData[17]++;
    _$jscoverage['/tree/node.js'].lineData[317]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[318]++;
    if (visit42_318_1(e.target == self)) {
      _$jscoverage['/tree/node.js'].lineData[319]++;
      recursiveSetDepth(self.get('tree'), e.component);
      _$jscoverage['/tree/node.js'].lineData[320]++;
      refreshCssForSelfAndChildren(self, e.index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[324]++;
  function syncAriaSetSize(e) {
    _$jscoverage['/tree/node.js'].functionData[18]++;
    _$jscoverage['/tree/node.js'].lineData[325]++;
    var self = this;
    _$jscoverage['/tree/node.js'].lineData[326]++;
    if (visit43_326_1(e.target === self)) {
      _$jscoverage['/tree/node.js'].lineData[327]++;
      self.el.setAttribute('aria-setsize', self.get('children').length);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[332]++;
  function isNodeSingleOrLast(self) {
    _$jscoverage['/tree/node.js'].functionData[19]++;
    _$jscoverage['/tree/node.js'].lineData[333]++;
    var parent = self.get('parent'), children = visit44_334_1(parent && parent.get("children")), lastChild = visit45_335_1(children && children[children.length - 1]);
    _$jscoverage['/tree/node.js'].lineData[339]++;
    return visit46_339_1(!lastChild || visit47_339_2(lastChild == self));
  }
  _$jscoverage['/tree/node.js'].lineData[342]++;
  function isNodeLeaf(self) {
    _$jscoverage['/tree/node.js'].functionData[20]++;
    _$jscoverage['/tree/node.js'].lineData[343]++;
    var isLeaf = self.get("isLeaf");
    _$jscoverage['/tree/node.js'].lineData[345]++;
    return !(visit48_345_1(visit49_345_2(isLeaf === false) || (visit50_345_3(visit51_345_4(isLeaf === undefined) && self.get("children").length))));
  }
  _$jscoverage['/tree/node.js'].lineData[348]++;
  function getLastVisibleDescendant(self) {
    _$jscoverage['/tree/node.js'].functionData[21]++;
    _$jscoverage['/tree/node.js'].lineData[349]++;
    var children = self.get("children");
    _$jscoverage['/tree/node.js'].lineData[351]++;
    if (visit52_351_1(!self.get("expanded") || !children.length)) {
      _$jscoverage['/tree/node.js'].lineData[352]++;
      return self;
    }
    _$jscoverage['/tree/node.js'].lineData[355]++;
    return getLastVisibleDescendant(children[children.length - 1]);
  }
  _$jscoverage['/tree/node.js'].lineData[359]++;
  function getPreviousVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[22]++;
    _$jscoverage['/tree/node.js'].lineData[360]++;
    var prev = self.prev();
    _$jscoverage['/tree/node.js'].lineData[361]++;
    if (visit53_361_1(!prev)) {
      _$jscoverage['/tree/node.js'].lineData[362]++;
      prev = self.get('parent');
    } else {
      _$jscoverage['/tree/node.js'].lineData[364]++;
      prev = getLastVisibleDescendant(prev);
    }
    _$jscoverage['/tree/node.js'].lineData[366]++;
    return prev;
  }
  _$jscoverage['/tree/node.js'].lineData[370]++;
  function getNextVisibleNode(self) {
    _$jscoverage['/tree/node.js'].functionData[23]++;
    _$jscoverage['/tree/node.js'].lineData[371]++;
    var children = self.get("children"), n, parent;
    _$jscoverage['/tree/node.js'].lineData[374]++;
    if (visit54_374_1(self.get("expanded") && children.length)) {
      _$jscoverage['/tree/node.js'].lineData[375]++;
      return children[0];
    }
    _$jscoverage['/tree/node.js'].lineData[379]++;
    n = self.next();
    _$jscoverage['/tree/node.js'].lineData[380]++;
    parent = self;
    _$jscoverage['/tree/node.js'].lineData[381]++;
    while (visit55_381_1(!n && (parent = parent.get('parent')))) {
      _$jscoverage['/tree/node.js'].lineData[382]++;
      n = parent.next();
    }
    _$jscoverage['/tree/node.js'].lineData[384]++;
    return n;
  }
  _$jscoverage['/tree/node.js'].lineData[391]++;
  function refreshCss(self) {
    _$jscoverage['/tree/node.js'].functionData[24]++;
    _$jscoverage['/tree/node.js'].lineData[392]++;
    if (visit56_392_1(self.get && self.view)) {
      _$jscoverage['/tree/node.js'].lineData[393]++;
      self.view.refreshCss(isNodeSingleOrLast(self), isNodeLeaf(self));
    }
  }
  _$jscoverage['/tree/node.js'].lineData[397]++;
  function updateSubTreeStatus(self, c, depth, index) {
    _$jscoverage['/tree/node.js'].functionData[25]++;
    _$jscoverage['/tree/node.js'].lineData[398]++;
    var tree = self.get("tree");
    _$jscoverage['/tree/node.js'].lineData[399]++;
    if (visit57_399_1(tree)) {
      _$jscoverage['/tree/node.js'].lineData[400]++;
      recursiveSetDepth(tree, c, depth + 1);
      _$jscoverage['/tree/node.js'].lineData[401]++;
      refreshCssForSelfAndChildren(self, index);
    }
  }
  _$jscoverage['/tree/node.js'].lineData[405]++;
  function recursiveSetDepth(tree, c, setDepth) {
    _$jscoverage['/tree/node.js'].functionData[26]++;
    _$jscoverage['/tree/node.js'].lineData[406]++;
    if (visit58_406_1(setDepth !== undefined)) {
      _$jscoverage['/tree/node.js'].lineData[407]++;
      c.set("depth", setDepth);
    }
    _$jscoverage['/tree/node.js'].lineData[409]++;
    S.each(c.get("children"), function(child) {
  _$jscoverage['/tree/node.js'].functionData[27]++;
  _$jscoverage['/tree/node.js'].lineData[410]++;
  if (visit59_410_1(typeof setDepth == 'number')) {
    _$jscoverage['/tree/node.js'].lineData[411]++;
    recursiveSetDepth(tree, child, setDepth + 1);
  } else {
    _$jscoverage['/tree/node.js'].lineData[413]++;
    recursiveSetDepth(tree, child);
  }
});
  }
  _$jscoverage['/tree/node.js'].lineData[418]++;
  function refreshCssForSelfAndChildren(self, index) {
    _$jscoverage['/tree/node.js'].functionData[28]++;
    _$jscoverage['/tree/node.js'].lineData[419]++;
    refreshCss(self);
    _$jscoverage['/tree/node.js'].lineData[420]++;
    index = Math.max(0, index - 1);
    _$jscoverage['/tree/node.js'].lineData[421]++;
    var children = self.get('children'), c, len = children.length;
    _$jscoverage['/tree/node.js'].lineData[424]++;
    for (; visit60_424_1(index < len); index++) {
      _$jscoverage['/tree/node.js'].lineData[425]++;
      c = children[index];
      _$jscoverage['/tree/node.js'].lineData[426]++;
      refreshCss(c);
      _$jscoverage['/tree/node.js'].lineData[427]++;
      c.el.setAttribute("aria-posinset", index + 1);
    }
  }
}, {
  requires: ['node', 'component/container', './node-render']});
