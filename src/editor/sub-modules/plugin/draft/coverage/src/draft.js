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
            + ','src':' + jscoverage_quote(this.src)
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
if (! _$jscoverage['/draft.js']) {
  _$jscoverage['/draft.js'] = {};
  _$jscoverage['/draft.js'].lineData = [];
  _$jscoverage['/draft.js'].lineData[6] = 0;
  _$jscoverage['/draft.js'].lineData[7] = 0;
  _$jscoverage['/draft.js'].lineData[8] = 0;
  _$jscoverage['/draft.js'].lineData[9] = 0;
  _$jscoverage['/draft.js'].lineData[10] = 0;
  _$jscoverage['/draft.js'].lineData[11] = 0;
  _$jscoverage['/draft.js'].lineData[12] = 0;
  _$jscoverage['/draft.js'].lineData[15] = 0;
  _$jscoverage['/draft.js'].lineData[20] = 0;
  _$jscoverage['/draft.js'].lineData[21] = 0;
  _$jscoverage['/draft.js'].lineData[22] = 0;
  _$jscoverage['/draft.js'].lineData[23] = 0;
  _$jscoverage['/draft.js'].lineData[25] = 0;
  _$jscoverage['/draft.js'].lineData[28] = 0;
  _$jscoverage['/draft.js'].lineData[29] = 0;
  _$jscoverage['/draft.js'].lineData[30] = 0;
  _$jscoverage['/draft.js'].lineData[32] = 0;
  _$jscoverage['/draft.js'].lineData[33] = 0;
  _$jscoverage['/draft.js'].lineData[50] = 0;
  _$jscoverage['/draft.js'].lineData[53] = 0;
  _$jscoverage['/draft.js'].lineData[54] = 0;
  _$jscoverage['/draft.js'].lineData[55] = 0;
  _$jscoverage['/draft.js'].lineData[56] = 0;
  _$jscoverage['/draft.js'].lineData[59] = 0;
  _$jscoverage['/draft.js'].lineData[62] = 0;
  _$jscoverage['/draft.js'].lineData[64] = 0;
  _$jscoverage['/draft.js'].lineData[66] = 0;
  _$jscoverage['/draft.js'].lineData[72] = 0;
  _$jscoverage['/draft.js'].lineData[73] = 0;
  _$jscoverage['/draft.js'].lineData[74] = 0;
  _$jscoverage['/draft.js'].lineData[76] = 0;
  _$jscoverage['/draft.js'].lineData[78] = 0;
  _$jscoverage['/draft.js'].lineData[81] = 0;
  _$jscoverage['/draft.js'].lineData[83] = 0;
  _$jscoverage['/draft.js'].lineData[87] = 0;
  _$jscoverage['/draft.js'].lineData[92] = 0;
  _$jscoverage['/draft.js'].lineData[93] = 0;
  _$jscoverage['/draft.js'].lineData[95] = 0;
  _$jscoverage['/draft.js'].lineData[97] = 0;
  _$jscoverage['/draft.js'].lineData[105] = 0;
  _$jscoverage['/draft.js'].lineData[108] = 0;
  _$jscoverage['/draft.js'].lineData[137] = 0;
  _$jscoverage['/draft.js'].lineData[139] = 0;
  _$jscoverage['/draft.js'].lineData[140] = 0;
  _$jscoverage['/draft.js'].lineData[141] = 0;
  _$jscoverage['/draft.js'].lineData[142] = 0;
  _$jscoverage['/draft.js'].lineData[145] = 0;
  _$jscoverage['/draft.js'].lineData[146] = 0;
  _$jscoverage['/draft.js'].lineData[148] = 0;
  _$jscoverage['/draft.js'].lineData[151] = 0;
  _$jscoverage['/draft.js'].lineData[156] = 0;
  _$jscoverage['/draft.js'].lineData[157] = 0;
  _$jscoverage['/draft.js'].lineData[158] = 0;
  _$jscoverage['/draft.js'].lineData[161] = 0;
  _$jscoverage['/draft.js'].lineData[162] = 0;
  _$jscoverage['/draft.js'].lineData[165] = 0;
  _$jscoverage['/draft.js'].lineData[166] = 0;
  _$jscoverage['/draft.js'].lineData[167] = 0;
  _$jscoverage['/draft.js'].lineData[173] = 0;
  _$jscoverage['/draft.js'].lineData[174] = 0;
  _$jscoverage['/draft.js'].lineData[177] = 0;
  _$jscoverage['/draft.js'].lineData[178] = 0;
  _$jscoverage['/draft.js'].lineData[181] = 0;
  _$jscoverage['/draft.js'].lineData[182] = 0;
  _$jscoverage['/draft.js'].lineData[183] = 0;
  _$jscoverage['/draft.js'].lineData[184] = 0;
  _$jscoverage['/draft.js'].lineData[186] = 0;
  _$jscoverage['/draft.js'].lineData[195] = 0;
  _$jscoverage['/draft.js'].lineData[196] = 0;
  _$jscoverage['/draft.js'].lineData[197] = 0;
  _$jscoverage['/draft.js'].lineData[198] = 0;
  _$jscoverage['/draft.js'].lineData[200] = 0;
  _$jscoverage['/draft.js'].lineData[203] = 0;
  _$jscoverage['/draft.js'].lineData[204] = 0;
  _$jscoverage['/draft.js'].lineData[206] = 0;
  _$jscoverage['/draft.js'].lineData[207] = 0;
  _$jscoverage['/draft.js'].lineData[208] = 0;
  _$jscoverage['/draft.js'].lineData[210] = 0;
  _$jscoverage['/draft.js'].lineData[213] = 0;
  _$jscoverage['/draft.js'].lineData[219] = 0;
  _$jscoverage['/draft.js'].lineData[226] = 0;
  _$jscoverage['/draft.js'].lineData[238] = 0;
  _$jscoverage['/draft.js'].lineData[239] = 0;
  _$jscoverage['/draft.js'].lineData[243] = 0;
  _$jscoverage['/draft.js'].lineData[251] = 0;
  _$jscoverage['/draft.js'].lineData[252] = 0;
  _$jscoverage['/draft.js'].lineData[255] = 0;
  _$jscoverage['/draft.js'].lineData[258] = 0;
  _$jscoverage['/draft.js'].lineData[259] = 0;
  _$jscoverage['/draft.js'].lineData[260] = 0;
  _$jscoverage['/draft.js'].lineData[264] = 0;
  _$jscoverage['/draft.js'].lineData[270] = 0;
  _$jscoverage['/draft.js'].lineData[273] = 0;
  _$jscoverage['/draft.js'].lineData[276] = 0;
  _$jscoverage['/draft.js'].lineData[284] = 0;
  _$jscoverage['/draft.js'].lineData[285] = 0;
  _$jscoverage['/draft.js'].lineData[288] = 0;
  _$jscoverage['/draft.js'].lineData[290] = 0;
  _$jscoverage['/draft.js'].lineData[291] = 0;
  _$jscoverage['/draft.js'].lineData[292] = 0;
  _$jscoverage['/draft.js'].lineData[294] = 0;
  _$jscoverage['/draft.js'].lineData[300] = 0;
  _$jscoverage['/draft.js'].lineData[301] = 0;
  _$jscoverage['/draft.js'].lineData[308] = 0;
  _$jscoverage['/draft.js'].lineData[309] = 0;
  _$jscoverage['/draft.js'].lineData[316] = 0;
  _$jscoverage['/draft.js'].lineData[327] = 0;
  _$jscoverage['/draft.js'].lineData[328] = 0;
  _$jscoverage['/draft.js'].lineData[331] = 0;
  _$jscoverage['/draft.js'].lineData[333] = 0;
  _$jscoverage['/draft.js'].lineData[335] = 0;
  _$jscoverage['/draft.js'].lineData[340] = 0;
  _$jscoverage['/draft.js'].lineData[344] = 0;
  _$jscoverage['/draft.js'].lineData[348] = 0;
  _$jscoverage['/draft.js'].lineData[349] = 0;
  _$jscoverage['/draft.js'].lineData[350] = 0;
  _$jscoverage['/draft.js'].lineData[351] = 0;
  _$jscoverage['/draft.js'].lineData[353] = 0;
  _$jscoverage['/draft.js'].lineData[357] = 0;
  _$jscoverage['/draft.js'].lineData[361] = 0;
  _$jscoverage['/draft.js'].lineData[362] = 0;
  _$jscoverage['/draft.js'].lineData[363] = 0;
  _$jscoverage['/draft.js'].lineData[364] = 0;
  _$jscoverage['/draft.js'].lineData[368] = 0;
  _$jscoverage['/draft.js'].lineData[369] = 0;
  _$jscoverage['/draft.js'].lineData[372] = 0;
  _$jscoverage['/draft.js'].lineData[374] = 0;
  _$jscoverage['/draft.js'].lineData[375] = 0;
  _$jscoverage['/draft.js'].lineData[376] = 0;
  _$jscoverage['/draft.js'].lineData[377] = 0;
  _$jscoverage['/draft.js'].lineData[380] = 0;
  _$jscoverage['/draft.js'].lineData[385] = 0;
}
if (! _$jscoverage['/draft.js'].functionData) {
  _$jscoverage['/draft.js'].functionData = [];
  _$jscoverage['/draft.js'].functionData[0] = 0;
  _$jscoverage['/draft.js'].functionData[1] = 0;
  _$jscoverage['/draft.js'].functionData[2] = 0;
  _$jscoverage['/draft.js'].functionData[3] = 0;
  _$jscoverage['/draft.js'].functionData[4] = 0;
  _$jscoverage['/draft.js'].functionData[5] = 0;
  _$jscoverage['/draft.js'].functionData[6] = 0;
  _$jscoverage['/draft.js'].functionData[7] = 0;
  _$jscoverage['/draft.js'].functionData[8] = 0;
  _$jscoverage['/draft.js'].functionData[9] = 0;
  _$jscoverage['/draft.js'].functionData[10] = 0;
  _$jscoverage['/draft.js'].functionData[11] = 0;
  _$jscoverage['/draft.js'].functionData[12] = 0;
  _$jscoverage['/draft.js'].functionData[13] = 0;
  _$jscoverage['/draft.js'].functionData[14] = 0;
  _$jscoverage['/draft.js'].functionData[15] = 0;
  _$jscoverage['/draft.js'].functionData[16] = 0;
  _$jscoverage['/draft.js'].functionData[17] = 0;
  _$jscoverage['/draft.js'].functionData[18] = 0;
  _$jscoverage['/draft.js'].functionData[19] = 0;
  _$jscoverage['/draft.js'].functionData[20] = 0;
  _$jscoverage['/draft.js'].functionData[21] = 0;
  _$jscoverage['/draft.js'].functionData[22] = 0;
  _$jscoverage['/draft.js'].functionData[23] = 0;
  _$jscoverage['/draft.js'].functionData[24] = 0;
  _$jscoverage['/draft.js'].functionData[25] = 0;
  _$jscoverage['/draft.js'].functionData[26] = 0;
  _$jscoverage['/draft.js'].functionData[27] = 0;
  _$jscoverage['/draft.js'].functionData[28] = 0;
}
if (! _$jscoverage['/draft.js'].branchData) {
  _$jscoverage['/draft.js'].branchData = {};
  _$jscoverage['/draft.js'].branchData['22'] = [];
  _$jscoverage['/draft.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['29'] = [];
  _$jscoverage['/draft.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['32'] = [];
  _$jscoverage['/draft.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['66'] = [];
  _$jscoverage['/draft.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/draft.js'].branchData['73'] = [];
  _$jscoverage['/draft.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['76'] = [];
  _$jscoverage['/draft.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['78'] = [];
  _$jscoverage['/draft.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['92'] = [];
  _$jscoverage['/draft.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['94'] = [];
  _$jscoverage['/draft.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['96'] = [];
  _$jscoverage['/draft.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['140'] = [];
  _$jscoverage['/draft.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['156'] = [];
  _$jscoverage['/draft.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['184'] = [];
  _$jscoverage['/draft.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['197'] = [];
  _$jscoverage['/draft.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['204'] = [];
  _$jscoverage['/draft.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['218'] = [];
  _$jscoverage['/draft.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['284'] = [];
  _$jscoverage['/draft.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['290'] = [];
  _$jscoverage['/draft.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['300'] = [];
  _$jscoverage['/draft.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['310'] = [];
  _$jscoverage['/draft.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['327'] = [];
  _$jscoverage['/draft.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['331'] = [];
  _$jscoverage['/draft.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['332'] = [];
  _$jscoverage['/draft.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['348'] = [];
  _$jscoverage['/draft.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['369'] = [];
  _$jscoverage['/draft.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/draft.js'].branchData['375'] = [];
  _$jscoverage['/draft.js'].branchData['375'][1] = new BranchData();
}
_$jscoverage['/draft.js'].branchData['375'][1].init(55, 18, 'localStorage.ready');
function visit27_375_1(result) {
  _$jscoverage['/draft.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['369'][1].init(23, 12, 'config || {}');
function visit26_369_1(result) {
  _$jscoverage['/draft.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['348'][1].init(172, 51, 'confirm("\\u786e\\u8ba4\\u6062\\u590d " + date(drafts[v].date) + " \\u7684\\u7f16\\u8f91\\u5386\\u53f2\\uff1f")');
function visit25_348_1(result) {
  _$jscoverage['/draft.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['332'][1].init(44, 41, 'data == drafts[drafts.length - 1].content');
function visit24_332_1(result) {
  _$jscoverage['/draft.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['331'][1].init(404, 86, 'drafts[drafts.length - 1] && data == drafts[drafts.length - 1].content');
function visit23_331_1(result) {
  _$jscoverage['/draft.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['327'][1].init(340, 5, '!data');
function visit22_327_1(result) {
  _$jscoverage['/draft.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['310'][1].init(57, 35, 'localStorage == window.localStorage');
function visit21_310_1(result) {
  _$jscoverage['/draft.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['300'][1].init(748, 14, '!drafts.length');
function visit20_300_1(result) {
  _$jscoverage['/draft.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['290'][1].init(438, 17, 'i < drafts.length');
function visit19_290_1(result) {
  _$jscoverage['/draft.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['284'][1].init(266, 26, 'drafts.length > draftLimit');
function visit18_284_1(result) {
  _$jscoverage['/draft.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['218'][1].init(212, 26, 'draftCfg[\'helpHTML\'] || ""');
function visit17_218_1(result) {
  _$jscoverage['/draft.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['204'][1].init(21, 39, 'self.helpPopup && self.helpPopup.hide()');
function visit16_204_1(result) {
  _$jscoverage['/draft.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['197'][1].init(62, 47, 'self.helpPopup && self.helpPopup.get('visible')');
function visit15_197_1(result) {
  _$jscoverage['/draft.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['184'][1].init(3679, 21, 'cfg.draft[\'helpHTML\']');
function visit14_184_1(result) {
  _$jscoverage['/draft.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['156'][1].init(2798, 30, 'editor.get('textarea')[0].form');
function visit13_156_1(result) {
  _$jscoverage['/draft.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['140'][1].init(21, 11, '!e.newValue');
function visit12_140_1(result) {
  _$jscoverage['/draft.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['96'][1].init(33, 24, 'cfg.draft.limit || LIMIT');
function visit11_96_1(result) {
  _$jscoverage['/draft.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['94'][1].init(36, 30, 'cfg.draft.interval || INTERVAL');
function visit10_94_1(result) {
  _$jscoverage['/draft.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['92'][1].init(235, 15, 'cfg.draft || {}');
function visit9_92_1(result) {
  _$jscoverage['/draft.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['78'][1].init(76, 35, 'localStorage == window.localStorage');
function visit8_78_1(result) {
  _$jscoverage['/draft.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['76'][1].init(122, 3, 'str');
function visit7_76_1(result) {
  _$jscoverage['/draft.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['73'][1].init(46, 12, '!self.drafts');
function visit6_73_1(result) {
  _$jscoverage['/draft.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['66'][2].init(84, 33, 'cfg.draft && cfg.draft[\'saveKey\']');
function visit5_66_2(result) {
  _$jscoverage['/draft.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['66'][1].init(84, 47, 'cfg.draft && cfg.draft[\'saveKey\'] || DRAFT_SAVE');
function visit4_66_1(result) {
  _$jscoverage['/draft.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['32'][1].init(89, 17, 'd instanceof Date');
function visit3_32_1(result) {
  _$jscoverage['/draft.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['29'][1].init(13, 21, 'typeof d === \'number\'');
function visit2_29_1(result) {
  _$jscoverage['/draft.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].branchData['22'][1].init(33, 12, 'n.length < l');
function visit1_22_1(result) {
  _$jscoverage['/draft.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/draft.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/draft.js'].functionData[0]++;
  _$jscoverage['/draft.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/draft.js'].lineData[8]++;
  var Json = require('json');
  _$jscoverage['/draft.js'].lineData[9]++;
  var Event = require('event');
  _$jscoverage['/draft.js'].lineData[10]++;
  var localStorage = require('./local-storage');
  _$jscoverage['/draft.js'].lineData[11]++;
  var Overlay = require('overlay');
  _$jscoverage['/draft.js'].lineData[12]++;
  var MenuButton = require('./menubutton');
  _$jscoverage['/draft.js'].lineData[15]++;
  var Node = S.Node, LIMIT = 5, INTERVAL = 5, DRAFT_SAVE = "ks-editor-draft-save20110503";
  _$jscoverage['/draft.js'].lineData[20]++;
  function padding(n, l, p) {
    _$jscoverage['/draft.js'].functionData[1]++;
    _$jscoverage['/draft.js'].lineData[21]++;
    n += "";
    _$jscoverage['/draft.js'].lineData[22]++;
    while (visit1_22_1(n.length < l)) {
      _$jscoverage['/draft.js'].lineData[23]++;
      n = p + n;
    }
    _$jscoverage['/draft.js'].lineData[25]++;
    return n;
  }
  _$jscoverage['/draft.js'].lineData[28]++;
  function date(d) {
    _$jscoverage['/draft.js'].functionData[2]++;
    _$jscoverage['/draft.js'].lineData[29]++;
    if (visit2_29_1(typeof d === 'number')) {
      _$jscoverage['/draft.js'].lineData[30]++;
      d = new Date(d);
    }
    _$jscoverage['/draft.js'].lineData[32]++;
    if (visit3_32_1(d instanceof Date)) {
      _$jscoverage['/draft.js'].lineData[33]++;
      return [d.getFullYear(), "-", padding(d.getMonth() + 1, 2, "0"), "-", padding(d.getDate(), 2, "0"), " ", padding(d.getHours(), 2, "0"), ":", padding(d.getMinutes(), 2, "0"), ":", padding(d.getSeconds(), 2, "0")].join("");
    } else {
      _$jscoverage['/draft.js'].lineData[50]++;
      return d;
    }
  }
  _$jscoverage['/draft.js'].lineData[53]++;
  function Draft(editor, config) {
    _$jscoverage['/draft.js'].functionData[3]++;
    _$jscoverage['/draft.js'].lineData[54]++;
    this.editor = editor;
    _$jscoverage['/draft.js'].lineData[55]++;
    this.config = config;
    _$jscoverage['/draft.js'].lineData[56]++;
    this._init();
  }
  _$jscoverage['/draft.js'].lineData[59]++;
  var addRes = Editor.Utils.addRes, destroyRes = Editor.Utils.destroyRes;
  _$jscoverage['/draft.js'].lineData[62]++;
  S.augment(Draft, {
  _getSaveKey: function() {
  _$jscoverage['/draft.js'].functionData[4]++;
  _$jscoverage['/draft.js'].lineData[64]++;
  var self = this, cfg = self.config;
  _$jscoverage['/draft.js'].lineData[66]++;
  return visit4_66_1(visit5_66_2(cfg.draft && cfg.draft['saveKey']) || DRAFT_SAVE);
}, 
  _getDrafts: function() {
  _$jscoverage['/draft.js'].functionData[5]++;
  _$jscoverage['/draft.js'].lineData[72]++;
  var self = this;
  _$jscoverage['/draft.js'].lineData[73]++;
  if (visit6_73_1(!self.drafts)) {
    _$jscoverage['/draft.js'].lineData[74]++;
    var str = localStorage.getItem(self._getSaveKey()), drafts = [];
    _$jscoverage['/draft.js'].lineData[76]++;
    if (visit7_76_1(str)) {
      _$jscoverage['/draft.js'].lineData[78]++;
      drafts = (visit8_78_1(localStorage == window.localStorage)) ? Json.parse(S.urlDecode(str)) : str;
    }
    _$jscoverage['/draft.js'].lineData[81]++;
    self.drafts = drafts;
  }
  _$jscoverage['/draft.js'].lineData[83]++;
  return self.drafts;
}, 
  _init: function() {
  _$jscoverage['/draft.js'].functionData[6]++;
  _$jscoverage['/draft.js'].lineData[87]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), statusbar = editor.get('statusBarEl'), cfg = this.config;
  _$jscoverage['/draft.js'].lineData[92]++;
  cfg.draft = visit9_92_1(cfg.draft || {});
  _$jscoverage['/draft.js'].lineData[93]++;
  self.draftInterval = cfg.draft.interval = visit10_94_1(cfg.draft.interval || INTERVAL);
  _$jscoverage['/draft.js'].lineData[95]++;
  self.draftLimit = cfg.draft.limit = visit11_96_1(cfg.draft.limit || LIMIT);
  _$jscoverage['/draft.js'].lineData[97]++;
  var holder = new Node("<div class='" + prefixCls + "editor-draft'>" + "<span class='" + prefixCls + "editor-draft-title'>" + "\u5185\u5bb9\u6b63\u6587\u6bcf" + cfg.draft.interval + "\u5206\u949f\u81ea\u52a8\u4fdd\u5b58\u4e00\u6b21\u3002" + "</span>" + "</div>").appendTo(statusbar);
  _$jscoverage['/draft.js'].lineData[105]++;
  self.timeTip = new Node("<span class='" + prefixCls + "editor-draft-time'/>").appendTo(holder);
  _$jscoverage['/draft.js'].lineData[108]++;
  var save = new Node(S.substitute("<a href='#' " + "onclick='return false;' " + "class='{prefixCls}editor-button " + "{prefixCls}editor-draft-save-btn ks-inline-block' " + "style='" + "vertical-align:middle;" + "padding:1px 9px;" + "'>" + "<span class='{prefixCls}editor-draft-save'>" + "</span>" + "<span>\u7acb\u5373\u4fdd\u5b58</span>" + "</a>", {
  prefixCls: prefixCls})).unselectable(undefined).appendTo(holder), versions = new MenuButton({
  render: holder, 
  collapseOnClick: true, 
  width: "100px", 
  prefixCls: prefixCls + 'editor-',
  menu: {
  width: "225px", 
  align: {
  points: ['tr', 'br']}}, 
  matchElWidth: false, 
  content: "\u6062\u590d\u7f16\u8f91\u5386\u53f2"}).render();
  _$jscoverage['/draft.js'].lineData[137]++;
  self.versions = versions;
  _$jscoverage['/draft.js'].lineData[139]++;
  versions.on("beforeCollapsedChange", function(e) {
  _$jscoverage['/draft.js'].functionData[7]++;
  _$jscoverage['/draft.js'].lineData[140]++;
  if (visit12_140_1(!e.newValue)) {
    _$jscoverage['/draft.js'].lineData[141]++;
    versions.detach("beforeCollapsedChange", arguments.callee);
    _$jscoverage['/draft.js'].lineData[142]++;
    self.sync();
  }
});
  _$jscoverage['/draft.js'].lineData[145]++;
  save.on('click', function(ev) {
  _$jscoverage['/draft.js'].functionData[8]++;
  _$jscoverage['/draft.js'].lineData[146]++;
  self.save(false);
  _$jscoverage['/draft.js'].lineData[148]++;
  ev.halt();
});
  _$jscoverage['/draft.js'].lineData[151]++;
  addRes.call(self, save);
  _$jscoverage['/draft.js'].lineData[156]++;
  if (visit13_156_1(editor.get('textarea')[0].form)) {
    _$jscoverage['/draft.js'].lineData[157]++;
    (function() {
  _$jscoverage['/draft.js'].functionData[9]++;
  _$jscoverage['/draft.js'].lineData[158]++;
  var textarea = editor.get('textarea'), form = textarea[0].form;
  _$jscoverage['/draft.js'].lineData[161]++;
  function saveF() {
    _$jscoverage['/draft.js'].functionData[10]++;
    _$jscoverage['/draft.js'].lineData[162]++;
    self.save(true);
  }
  _$jscoverage['/draft.js'].lineData[165]++;
  Event.on(form, 'submit', saveF);
  _$jscoverage['/draft.js'].lineData[166]++;
  addRes.call(self, function() {
  _$jscoverage['/draft.js'].functionData[11]++;
  _$jscoverage['/draft.js'].lineData[167]++;
  Event.remove(form, 'submit', saveF);
});
})();
  }
  _$jscoverage['/draft.js'].lineData[173]++;
  var timer = setInterval(function() {
  _$jscoverage['/draft.js'].functionData[12]++;
  _$jscoverage['/draft.js'].lineData[174]++;
  self.save(true);
}, self.draftInterval * 60 * 1000);
  _$jscoverage['/draft.js'].lineData[177]++;
  addRes.call(self, function() {
  _$jscoverage['/draft.js'].functionData[13]++;
  _$jscoverage['/draft.js'].lineData[178]++;
  clearInterval(timer);
});
  _$jscoverage['/draft.js'].lineData[181]++;
  versions.on('click', self.recover, self);
  _$jscoverage['/draft.js'].lineData[182]++;
  addRes.call(self, versions);
  _$jscoverage['/draft.js'].lineData[183]++;
  self.holder = holder;
  _$jscoverage['/draft.js'].lineData[184]++;
  if (visit14_184_1(cfg.draft['helpHTML'])) {
    _$jscoverage['/draft.js'].lineData[186]++;
    var help = new Node('<a ' + 'tabindex="0" ' + 'hidefocus="hidefocus" ' + 'class="' + prefixCls + 'editor-draft-help" ' + 'title="\u70b9\u51fb\u67e5\u770b\u5e2e\u52a9" ' + 'href="javascript:void(\'\u70b9\u51fb\u67e5\u770b\u5e2e\u52a9 \')">\u70b9\u51fb\u67e5\u770b\u5e2e\u52a9</a>').unselectable(undefined).appendTo(holder);
    _$jscoverage['/draft.js'].lineData[195]++;
    help.on('click', function() {
  _$jscoverage['/draft.js'].functionData[14]++;
  _$jscoverage['/draft.js'].lineData[196]++;
  help[0].focus();
  _$jscoverage['/draft.js'].lineData[197]++;
  if (visit15_197_1(self.helpPopup && self.helpPopup.get('visible'))) {
    _$jscoverage['/draft.js'].lineData[198]++;
    self.helpPopup.hide();
  } else {
    _$jscoverage['/draft.js'].lineData[200]++;
    self._prepareHelp();
  }
});
    _$jscoverage['/draft.js'].lineData[203]++;
    help.on('blur', function() {
  _$jscoverage['/draft.js'].functionData[15]++;
  _$jscoverage['/draft.js'].lineData[204]++;
  visit16_204_1(self.helpPopup && self.helpPopup.hide());
});
    _$jscoverage['/draft.js'].lineData[206]++;
    self.helpBtn = help;
    _$jscoverage['/draft.js'].lineData[207]++;
    addRes.call(self, help);
    _$jscoverage['/draft.js'].lineData[208]++;
    Editor.Utils.lazyRun(self, "_prepareHelp", "_realHelp");
  }
  _$jscoverage['/draft.js'].lineData[210]++;
  addRes.call(self, holder);
}, 
  _prepareHelp: function() {
  _$jscoverage['/draft.js'].functionData[16]++;
  _$jscoverage['/draft.js'].lineData[213]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), cfg = self.config, draftCfg = cfg.draft, help = new Node(visit17_218_1(draftCfg['helpHTML'] || ""));
  _$jscoverage['/draft.js'].lineData[219]++;
  var arrowCss = "height:0;" + "position:absolute;" + "font-size:0;" + "width:0;" + "border:8px #000 solid;" + "border-color:#000 transparent transparent transparent;" + "border-style:solid dashed dashed dashed;";
  _$jscoverage['/draft.js'].lineData[226]++;
  var arrow = new Node("<div style='" + arrowCss + "border-top-color:#CED5E0;" + "'>" + "<div style='" + arrowCss + "left:-8px;" + "top:-10px;" + "border-top-color:white;" + "'>" + "</div>" + "</div>");
  _$jscoverage['/draft.js'].lineData[238]++;
  help.append(arrow);
  _$jscoverage['/draft.js'].lineData[239]++;
  help.css({
  border: "1px solid #ACB4BE", 
  'text-align': 'left'});
  _$jscoverage['/draft.js'].lineData[243]++;
  self.helpPopup = new Overlay({
  content: help, 
  prefixCls: prefixCls + 'editor-', 
  width: help.width() + 'px',
  zIndex: Editor.baseZIndex(Editor.ZIndexManager.OVERLAY), 
  mask: false}).render();
  _$jscoverage['/draft.js'].lineData[251]++;
  self.helpPopup.get('el').css("border", "none");
  _$jscoverage['/draft.js'].lineData[252]++;
  self.helpPopup.arrow = arrow;
}, 
  _realHelp: function() {
  _$jscoverage['/draft.js'].functionData[17]++;
  _$jscoverage['/draft.js'].lineData[255]++;
  var win = this.helpPopup, helpBtn = this.helpBtn, arrow = win.arrow;
  _$jscoverage['/draft.js'].lineData[258]++;
  win.show();
  _$jscoverage['/draft.js'].lineData[259]++;
  var off = helpBtn.offset();
  _$jscoverage['/draft.js'].lineData[260]++;
  win.get('el').offset({
  left: (off.left - win.get('el').width()) + 17,
  top: (off.top - win.get('el').height()) - 7});
  _$jscoverage['/draft.js'].lineData[264]++;
  arrow.offset({
  left: off.left - 2, 
  top: off.top - 8});
}, 
  disable: function() {
  _$jscoverage['/draft.js'].functionData[18]++;
  _$jscoverage['/draft.js'].lineData[270]++;
  this.holder.css("visibility", "hidden");
}, 
  enable: function() {
  _$jscoverage['/draft.js'].functionData[19]++;
  _$jscoverage['/draft.js'].lineData[273]++;
  this.holder.css("visibility", "");
}, 
  sync: function() {
  _$jscoverage['/draft.js'].functionData[20]++;
  _$jscoverage['/draft.js'].lineData[276]++;
  var self = this, i, draftLimit = self.draftLimit, timeTip = self.timeTip, versions = self.versions, drafts = self._getDrafts(), draft, tip;
  _$jscoverage['/draft.js'].lineData[284]++;
  if (visit18_284_1(drafts.length > draftLimit)) {
    _$jscoverage['/draft.js'].lineData[285]++;
    drafts.splice(0, drafts.length - draftLimit);
  }
  _$jscoverage['/draft.js'].lineData[288]++;
  versions.removeItems(true);
  _$jscoverage['/draft.js'].lineData[290]++;
  for (i = 0; visit19_290_1(i < drafts.length); i++) {
    _$jscoverage['/draft.js'].lineData[291]++;
    draft = drafts[i];
    _$jscoverage['/draft.js'].lineData[292]++;
    tip = (draft.auto ? "\u81ea\u52a8" : "\u624b\u52a8") + "\u4fdd\u5b58\u4e8e : " + date(draft.date);
    _$jscoverage['/draft.js'].lineData[294]++;
    versions.addItem({
  content: tip, 
  value: i});
  }
  _$jscoverage['/draft.js'].lineData[300]++;
  if (visit20_300_1(!drafts.length)) {
    _$jscoverage['/draft.js'].lineData[301]++;
    versions.addItem({
  disabled: true, 
  content: '\u5c1a\u65e0\u5386\u53f2', 
  value: ''});
  }
  _$jscoverage['/draft.js'].lineData[308]++;
  timeTip.html(tip);
  _$jscoverage['/draft.js'].lineData[309]++;
  localStorage.setItem(self._getSaveKey(), (visit21_310_1(localStorage == window.localStorage)) ? encodeURIComponent(Json.stringify(drafts)) : drafts);
}, 
  save: function(auto) {
  _$jscoverage['/draft.js'].functionData[21]++;
  _$jscoverage['/draft.js'].lineData[316]++;
  var self = this, drafts = self._getDrafts(), editor = self.editor, data = editor.getFormatData();
  _$jscoverage['/draft.js'].lineData[327]++;
  if (visit22_327_1(!data)) {
    _$jscoverage['/draft.js'].lineData[328]++;
    return;
  }
  _$jscoverage['/draft.js'].lineData[331]++;
  if (visit23_331_1(drafts[drafts.length - 1] && visit24_332_1(data == drafts[drafts.length - 1].content))) {
    _$jscoverage['/draft.js'].lineData[333]++;
    drafts.length -= 1;
  }
  _$jscoverage['/draft.js'].lineData[335]++;
  self.drafts = drafts.concat({
  content: data, 
  date: new Date().getTime(), 
  auto: auto});
  _$jscoverage['/draft.js'].lineData[340]++;
  self.sync();
}, 
  recover: function(ev) {
  _$jscoverage['/draft.js'].functionData[22]++;
  _$jscoverage['/draft.js'].lineData[344]++;
  var self = this, editor = self.editor, drafts = self._getDrafts(), v = ev.target.get('value');
  _$jscoverage['/draft.js'].lineData[348]++;
  if (visit25_348_1(confirm("\u786e\u8ba4\u6062\u590d " + date(drafts[v].date) + " \u7684\u7f16\u8f91\u5386\u53f2\uff1f"))) {
    _$jscoverage['/draft.js'].lineData[349]++;
    editor.execCommand('save');
    _$jscoverage['/draft.js'].lineData[350]++;
    editor.setData(drafts[v].content);
    _$jscoverage['/draft.js'].lineData[351]++;
    editor.execCommand('save');
  }
  _$jscoverage['/draft.js'].lineData[353]++;
  ev.halt();
}, 
  destroy: function() {
  _$jscoverage['/draft.js'].functionData[23]++;
  _$jscoverage['/draft.js'].lineData[357]++;
  destroyRes.call(this);
}});
  _$jscoverage['/draft.js'].lineData[361]++;
  function init(editor, config) {
    _$jscoverage['/draft.js'].functionData[24]++;
    _$jscoverage['/draft.js'].lineData[362]++;
    var d = new Draft(editor, config);
    _$jscoverage['/draft.js'].lineData[363]++;
    editor.on('destroy', function() {
  _$jscoverage['/draft.js'].functionData[25]++;
  _$jscoverage['/draft.js'].lineData[364]++;
  d.destroy();
});
  }
  _$jscoverage['/draft.js'].lineData[368]++;
  function DraftPlugin(config) {
    _$jscoverage['/draft.js'].functionData[26]++;
    _$jscoverage['/draft.js'].lineData[369]++;
    this.config = visit26_369_1(config || {});
  }
  _$jscoverage['/draft.js'].lineData[372]++;
  S.augment(DraftPlugin, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/draft.js'].functionData[27]++;
  _$jscoverage['/draft.js'].lineData[374]++;
  var config = this.config;
  _$jscoverage['/draft.js'].lineData[375]++;
  if (visit27_375_1(localStorage.ready)) {
    _$jscoverage['/draft.js'].lineData[376]++;
    localStorage.ready(function() {
  _$jscoverage['/draft.js'].functionData[28]++;
  _$jscoverage['/draft.js'].lineData[377]++;
  init(editor, config);
});
  } else {
    _$jscoverage['/draft.js'].lineData[380]++;
    init(editor, config);
  }
}});
  _$jscoverage['/draft.js'].lineData[385]++;
  return DraftPlugin;
});
