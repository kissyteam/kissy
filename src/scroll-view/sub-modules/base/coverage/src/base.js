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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[11] = 0;
  _$jscoverage['/base.js'].lineData[12] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[37] = 0;
  _$jscoverage['/base.js'].lineData[41] = 0;
  _$jscoverage['/base.js'].lineData[46] = 0;
  _$jscoverage['/base.js'].lineData[51] = 0;
  _$jscoverage['/base.js'].lineData[55] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[88] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[95] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[107] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[109] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[129] = 0;
  _$jscoverage['/base.js'].lineData[130] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[132] = 0;
  _$jscoverage['/base.js'].lineData[134] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[158] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[175] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
  _$jscoverage['/base.js'].lineData[237] = 0;
  _$jscoverage['/base.js'].lineData[238] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[244] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['16'] = [];
  _$jscoverage['/base.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['19'] = [];
  _$jscoverage['/base.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['55'] = [];
  _$jscoverage['/base.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['56'] = [];
  _$jscoverage['/base.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['57'] = [];
  _$jscoverage['/base.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['57'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['67'] = [];
  _$jscoverage['/base.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['71'] = [];
  _$jscoverage['/base.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['76'] = [];
  _$jscoverage['/base.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['79'] = [];
  _$jscoverage['/base.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['82'] = [];
  _$jscoverage['/base.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['87'] = [];
  _$jscoverage['/base.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['90'] = [];
  _$jscoverage['/base.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'] = [];
  _$jscoverage['/base.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['103'] = [];
  _$jscoverage['/base.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['116'] = [];
  _$jscoverage['/base.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'] = [];
  _$jscoverage['/base.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['132'] = [];
  _$jscoverage['/base.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['132'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['132'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['132'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['132'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['132'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['132'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['139'] = [];
  _$jscoverage['/base.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['143'] = [];
  _$jscoverage['/base.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['143'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['143'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['143'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['143'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['143'][6] = new BranchData();
  _$jscoverage['/base.js'].branchData['143'][7] = new BranchData();
  _$jscoverage['/base.js'].branchData['152'] = [];
  _$jscoverage['/base.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['157'] = [];
  _$jscoverage['/base.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['180'] = [];
  _$jscoverage['/base.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['181'] = [];
  _$jscoverage['/base.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['183'] = [];
  _$jscoverage['/base.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['188'] = [];
  _$jscoverage['/base.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['190'] = [];
  _$jscoverage['/base.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['201'] = [];
  _$jscoverage['/base.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['211'] = [];
  _$jscoverage['/base.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['214'] = [];
  _$jscoverage['/base.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['224'] = [];
  _$jscoverage['/base.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['227'] = [];
  _$jscoverage['/base.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['231'] = [];
  _$jscoverage['/base.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['243'] = [];
  _$jscoverage['/base.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['246'] = [];
  _$jscoverage['/base.js'].branchData['246'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['246'][1].init(135, 17, 'top !== undefined');
function visit58_246_1(result) {
  _$jscoverage['/base.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['243'][1].init(22, 18, 'left !== undefined');
function visit57_243_1(result) {
  _$jscoverage['/base.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['231'][1].init(252, 17, 'top !== undefined');
function visit56_231_1(result) {
  _$jscoverage['/base.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['227'][1].init(84, 18, 'left !== undefined');
function visit55_227_1(result) {
  _$jscoverage['/base.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['224'][1].init(114, 7, 'animCfg');
function visit54_224_1(result) {
  _$jscoverage['/base.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['214'][1].init(272, 7, 'cfg.top');
function visit53_214_1(result) {
  _$jscoverage['/base.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['211'][1].init(138, 8, 'cfg.left');
function visit52_211_1(result) {
  _$jscoverage['/base.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['201'][1].init(78, 51, '(pageOffset = self.pagesOffset) && pageOffset[index]');
function visit51_201_1(result) {
  _$jscoverage['/base.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['190'][1].init(72, 15, 'offset[p2] <= v');
function visit50_190_1(result) {
  _$jscoverage['/base.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['188'][1].init(51, 6, 'i >= 0');
function visit49_188_1(result) {
  _$jscoverage['/base.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['183'][1].init(72, 15, 'offset[p2] >= v');
function visit48_183_1(result) {
  _$jscoverage['/base.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['181'][1].init(30, 22, 'i < pagesOffset.length');
function visit47_181_1(result) {
  _$jscoverage['/base.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['180'][1].init(261, 13, 'direction > 0');
function visit46_180_1(result) {
  _$jscoverage['/base.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['157'][1].init(48, 23, 'self.scrollAnims.length');
function visit45_157_1(result) {
  _$jscoverage['/base.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['152'][1].init(38, 11, 'axis == \'x\'');
function visit44_152_1(result) {
  _$jscoverage['/base.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['143'][7].init(214, 10, 'deltaX < 0');
function visit43_143_7(result) {
  _$jscoverage['/base.js'].branchData['143'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['143'][6].init(193, 17, 'scrollLeft >= max');
function visit42_143_6(result) {
  _$jscoverage['/base.js'].branchData['143'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['143'][5].init(193, 31, 'scrollLeft >= max && deltaX < 0');
function visit41_143_5(result) {
  _$jscoverage['/base.js'].branchData['143'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['143'][4].init(179, 10, 'deltaX > 0');
function visit40_143_4(result) {
  _$jscoverage['/base.js'].branchData['143'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['143'][3].init(158, 17, 'scrollLeft <= min');
function visit39_143_3(result) {
  _$jscoverage['/base.js'].branchData['143'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['143'][2].init(158, 31, 'scrollLeft <= min && deltaX > 0');
function visit38_143_2(result) {
  _$jscoverage['/base.js'].branchData['143'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['143'][1].init(158, 66, 'scrollLeft <= min && deltaX > 0 || scrollLeft >= max && deltaX < 0');
function visit37_143_1(result) {
  _$jscoverage['/base.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['139'][1].init(854, 46, '(deltaX = e.deltaX) && self.allowScroll[\'left\']');
function visit36_139_1(result) {
  _$jscoverage['/base.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['132'][7].init(208, 10, 'deltaY < 0');
function visit35_132_7(result) {
  _$jscoverage['/base.js'].branchData['132'][7].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['132'][6].init(188, 16, 'scrollTop >= max');
function visit34_132_6(result) {
  _$jscoverage['/base.js'].branchData['132'][6].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['132'][5].init(188, 30, 'scrollTop >= max && deltaY < 0');
function visit33_132_5(result) {
  _$jscoverage['/base.js'].branchData['132'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['132'][4].init(174, 10, 'deltaY > 0');
function visit32_132_4(result) {
  _$jscoverage['/base.js'].branchData['132'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['132'][3].init(154, 16, 'scrollTop <= min');
function visit31_132_3(result) {
  _$jscoverage['/base.js'].branchData['132'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['132'][2].init(154, 30, 'scrollTop <= min && deltaY > 0');
function visit30_132_2(result) {
  _$jscoverage['/base.js'].branchData['132'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['132'][1].init(154, 64, 'scrollTop <= min && deltaY > 0 || scrollTop >= max && deltaY < 0');
function visit29_132_1(result) {
  _$jscoverage['/base.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][1].init(368, 45, '(deltaY = e.deltaY) && self.allowScroll[\'top\']');
function visit28_128_1(result) {
  _$jscoverage['/base.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['116'][1].init(18, 20, 'this.get(\'disabled\')');
function visit27_116_1(result) {
  _$jscoverage['/base.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['103'][1].init(51, 18, 'control.scrollStep');
function visit26_103_1(result) {
  _$jscoverage['/base.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][1].init(301, 23, 'keyCode == KeyCode.LEFT');
function visit25_93_1(result) {
  _$jscoverage['/base.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['90'][1].init(132, 24, 'keyCode == KeyCode.RIGHT');
function visit24_90_1(result) {
  _$jscoverage['/base.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['87'][1].init(1667, 6, 'allowX');
function visit23_87_1(result) {
  _$jscoverage['/base.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['82'][1].init(734, 26, 'keyCode == KeyCode.PAGE_UP');
function visit22_82_1(result) {
  _$jscoverage['/base.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['79'][1].init(562, 28, 'keyCode == KeyCode.PAGE_DOWN');
function visit21_79_1(result) {
  _$jscoverage['/base.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['76'][1].init(398, 21, 'keyCode == KeyCode.UP');
function visit20_76_1(result) {
  _$jscoverage['/base.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['71'][1].init(184, 23, 'keyCode == KeyCode.DOWN');
function visit19_71_1(result) {
  _$jscoverage['/base.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['67'][1].init(735, 6, 'allowY');
function visit18_67_1(result) {
  _$jscoverage['/base.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['57'][2].init(336, 20, 'nodeName == \'select\'');
function visit17_57_2(result) {
  _$jscoverage['/base.js'].branchData['57'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['57'][1].init(42, 75, 'nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit16_57_1(result) {
  _$jscoverage['/base.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['56'][2].init(292, 22, 'nodeName == \'textarea\'');
function visit15_56_2(result) {
  _$jscoverage['/base.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['56'][1].init(39, 118, 'nodeName == \'textarea\' || nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit14_56_1(result) {
  _$jscoverage['/base.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['55'][2].init(250, 19, 'nodeName == \'input\'');
function visit13_55_2(result) {
  _$jscoverage['/base.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['55'][1].init(250, 158, 'nodeName == \'input\' || nodeName == \'textarea\' || nodeName == \'select\' || $target.hasAttr(\'contenteditable\')');
function visit12_55_1(result) {
  _$jscoverage['/base.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['19'][1].init(255, 10, 'scrollLeft');
function visit11_19_1(result) {
  _$jscoverage['/base.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['16'][1].init(147, 9, 'scrollTop');
function visit10_16_1(result) {
  _$jscoverage['/base.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add('scroll-view/base', function(S, Node, Anim, Container, Render, undefined) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var $ = S.all, isTouchEventSupported = S.Features.isTouchEventSupported(), KeyCode = Node.KeyCode;
  _$jscoverage['/base.js'].lineData[11]++;
  function onElScroll() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[12]++;
    var self = this, el = self.el, scrollTop = el.scrollTop, scrollLeft = el.scrollLeft;
    _$jscoverage['/base.js'].lineData[16]++;
    if (visit10_16_1(scrollTop)) {
      _$jscoverage['/base.js'].lineData[17]++;
      self.set('scrollTop', scrollTop + self.get('scrollTop'));
    }
    _$jscoverage['/base.js'].lineData[19]++;
    if (visit11_19_1(scrollLeft)) {
      _$jscoverage['/base.js'].lineData[20]++;
      self.set('scrollLeft', scrollLeft + self.get('scrollLeft'));
    }
    _$jscoverage['/base.js'].lineData[22]++;
    el.scrollTop = el.scrollLeft = 0;
  }
  _$jscoverage['/base.js'].lineData[25]++;
  function frame(anim, fx) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[26]++;
    anim.scrollView.set(fx.prop, fx.val);
  }
  _$jscoverage['/base.js'].lineData[35]++;
  return Container.extend({
  initializer: function() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[37]++;
  this.scrollAnims = [];
}, 
  bindUI: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[41]++;
  var self = this, $el = self.$el;
  _$jscoverage['/base.js'].lineData[46]++;
  $el.on('mousewheel', self.handleMouseWheel, self).on('scroll', onElScroll, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[51]++;
  var target = e.target, $target = $(target), nodeName = $target.nodeName();
  _$jscoverage['/base.js'].lineData[55]++;
  if (visit12_55_1(visit13_55_2(nodeName == 'input') || visit14_56_1(visit15_56_2(nodeName == 'textarea') || visit16_57_1(visit17_57_2(nodeName == 'select') || $target.hasAttr('contenteditable'))))) {
    _$jscoverage['/base.js'].lineData[59]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[61]++;
  var self = this, keyCode = e.keyCode, scrollStep = self.getScrollStep(), ok = undefined;
  _$jscoverage['/base.js'].lineData[65]++;
  var allowX = self.allowScroll['left'];
  _$jscoverage['/base.js'].lineData[66]++;
  var allowY = self.allowScroll['top'];
  _$jscoverage['/base.js'].lineData[67]++;
  if (visit18_67_1(allowY)) {
    _$jscoverage['/base.js'].lineData[68]++;
    var scrollStepY = scrollStep.top, clientHeight = self.clientHeight, scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[71]++;
    if (visit19_71_1(keyCode == KeyCode.DOWN)) {
      _$jscoverage['/base.js'].lineData[72]++;
      self.scrollToWithBounds({
  top: scrollTop + scrollStepY});
      _$jscoverage['/base.js'].lineData[75]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[76]++;
      if (visit20_76_1(keyCode == KeyCode.UP)) {
        _$jscoverage['/base.js'].lineData[77]++;
        self.scrollToWithBounds({
  top: scrollTop - scrollStepY});
        _$jscoverage['/base.js'].lineData[78]++;
        ok = true;
      } else {
        _$jscoverage['/base.js'].lineData[79]++;
        if (visit21_79_1(keyCode == KeyCode.PAGE_DOWN)) {
          _$jscoverage['/base.js'].lineData[80]++;
          self.scrollToWithBounds({
  top: scrollTop + clientHeight});
          _$jscoverage['/base.js'].lineData[81]++;
          ok = true;
        } else {
          _$jscoverage['/base.js'].lineData[82]++;
          if (visit22_82_1(keyCode == KeyCode.PAGE_UP)) {
            _$jscoverage['/base.js'].lineData[83]++;
            self.scrollToWithBounds({
  top: scrollTop - clientHeight});
            _$jscoverage['/base.js'].lineData[84]++;
            ok = true;
          }
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[87]++;
  if (visit23_87_1(allowX)) {
    _$jscoverage['/base.js'].lineData[88]++;
    var scrollStepX = scrollStep.left;
    _$jscoverage['/base.js'].lineData[89]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[90]++;
    if (visit24_90_1(keyCode == KeyCode.RIGHT)) {
      _$jscoverage['/base.js'].lineData[91]++;
      self.scrollToWithBounds({
  left: scrollLeft + scrollStepX});
      _$jscoverage['/base.js'].lineData[92]++;
      ok = true;
    } else {
      _$jscoverage['/base.js'].lineData[93]++;
      if (visit25_93_1(keyCode == KeyCode.LEFT)) {
        _$jscoverage['/base.js'].lineData[94]++;
        self.scrollToWithBounds({
  left: scrollLeft - scrollStepX});
        _$jscoverage['/base.js'].lineData[95]++;
        ok = true;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[98]++;
  return ok;
}, 
  getScrollStep: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[102]++;
  var control = this;
  _$jscoverage['/base.js'].lineData[103]++;
  if (visit26_103_1(control.scrollStep)) {
    _$jscoverage['/base.js'].lineData[104]++;
    return control.scrollStep;
  }
  _$jscoverage['/base.js'].lineData[106]++;
  var elDoc = $(this.get('el')[0].ownerDocument);
  _$jscoverage['/base.js'].lineData[107]++;
  var clientHeight = control.clientHeight;
  _$jscoverage['/base.js'].lineData[108]++;
  var clientWidth = control.clientWidth;
  _$jscoverage['/base.js'].lineData[109]++;
  return control.scrollStep = {
  top: Math.max(clientHeight * clientHeight * 0.7 / elDoc.height(), 20), 
  left: Math.max(clientWidth * clientWidth * 0.7 / elDoc.width(), 20)};
}, 
  handleMouseWheel: function(e) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[116]++;
  if (visit27_116_1(this.get('disabled'))) {
    _$jscoverage['/base.js'].lineData[117]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[119]++;
  var max, min, self = this, scrollStep = self.getScrollStep(), deltaY, deltaX, maxScroll = self.maxScroll, minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[128]++;
  if (visit28_128_1((deltaY = e.deltaY) && self.allowScroll['top'])) {
    _$jscoverage['/base.js'].lineData[129]++;
    var scrollTop = self.get('scrollTop');
    _$jscoverage['/base.js'].lineData[130]++;
    max = maxScroll.top;
    _$jscoverage['/base.js'].lineData[131]++;
    min = minScroll.top;
    _$jscoverage['/base.js'].lineData[132]++;
    if (visit29_132_1(visit30_132_2(visit31_132_3(scrollTop <= min) && visit32_132_4(deltaY > 0)) || visit33_132_5(visit34_132_6(scrollTop >= max) && visit35_132_7(deltaY < 0)))) {
    } else {
      _$jscoverage['/base.js'].lineData[134]++;
      self.scrollToWithBounds({
  top: scrollTop - e.deltaY * scrollStep['top']});
      _$jscoverage['/base.js'].lineData[135]++;
      e.preventDefault();
    }
  }
  _$jscoverage['/base.js'].lineData[139]++;
  if (visit36_139_1((deltaX = e.deltaX) && self.allowScroll['left'])) {
    _$jscoverage['/base.js'].lineData[140]++;
    var scrollLeft = self.get('scrollLeft');
    _$jscoverage['/base.js'].lineData[141]++;
    max = maxScroll.left;
    _$jscoverage['/base.js'].lineData[142]++;
    min = minScroll.left;
    _$jscoverage['/base.js'].lineData[143]++;
    if (visit37_143_1(visit38_143_2(visit39_143_3(scrollLeft <= min) && visit40_143_4(deltaX > 0)) || visit41_143_5(visit42_143_6(scrollLeft >= max) && visit43_143_7(deltaX < 0)))) {
    } else {
      _$jscoverage['/base.js'].lineData[145]++;
      self.scrollToWithBounds({
  left: scrollLeft - e.deltaX * scrollStep['left']});
      _$jscoverage['/base.js'].lineData[146]++;
      e.preventDefault();
    }
  }
}, 
  'isAxisEnabled': function(axis) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[152]++;
  return this.allowScroll[visit44_152_1(axis == 'x') ? 'left' : 'top'];
}, 
  stopAnimation: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[156]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[157]++;
  if (visit45_157_1(self.scrollAnims.length)) {
    _$jscoverage['/base.js'].lineData[158]++;
    S.each(self.scrollAnims, function(scrollAnim) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[159]++;
  scrollAnim.stop();
});
    _$jscoverage['/base.js'].lineData[161]++;
    self.scrollAnims = [];
  }
  _$jscoverage['/base.js'].lineData[163]++;
  self.scrollToWithBounds({
  left: self.get('scrollLeft'), 
  top: self.get('scrollTop')});
}, 
  '_uiSetPageIndex': function(v) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[170]++;
  this.scrollToPage(v);
}, 
  _getPageIndexFromXY: function(v, allowX, direction) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[174]++;
  var pagesOffset = this.pagesOffset.concat([]);
  _$jscoverage['/base.js'].lineData[175]++;
  var p2 = allowX ? 'left' : 'top';
  _$jscoverage['/base.js'].lineData[176]++;
  var i, offset;
  _$jscoverage['/base.js'].lineData[177]++;
  pagesOffset.sort(function(e1, e2) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[178]++;
  return e1[p2] - e2[p2];
});
  _$jscoverage['/base.js'].lineData[180]++;
  if (visit46_180_1(direction > 0)) {
    _$jscoverage['/base.js'].lineData[181]++;
    for (i = 0; visit47_181_1(i < pagesOffset.length); i++) {
      _$jscoverage['/base.js'].lineData[182]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[183]++;
      if (visit48_183_1(offset[p2] >= v)) {
        _$jscoverage['/base.js'].lineData[184]++;
        return offset.index;
      }
    }
  } else {
    _$jscoverage['/base.js'].lineData[188]++;
    for (i = pagesOffset.length - 1; visit49_188_1(i >= 0); i--) {
      _$jscoverage['/base.js'].lineData[189]++;
      offset = pagesOffset[i];
      _$jscoverage['/base.js'].lineData[190]++;
      if (visit50_190_1(offset[p2] <= v)) {
        _$jscoverage['/base.js'].lineData[191]++;
        return offset.index;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[195]++;
  return undefined;
}, 
  scrollToPage: function(index, animCfg) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[199]++;
  var self = this, pageOffset;
  _$jscoverage['/base.js'].lineData[201]++;
  if (visit51_201_1((pageOffset = self.pagesOffset) && pageOffset[index])) {
    _$jscoverage['/base.js'].lineData[202]++;
    self.set('pageIndex', index);
    _$jscoverage['/base.js'].lineData[203]++;
    self.scrollTo(pageOffset[index], animCfg);
  }
}, 
  scrollToWithBounds: function(cfg, anim) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[208]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[209]++;
  var maxScroll = self.maxScroll;
  _$jscoverage['/base.js'].lineData[210]++;
  var minScroll = self.minScroll;
  _$jscoverage['/base.js'].lineData[211]++;
  if (visit52_211_1(cfg.left)) {
    _$jscoverage['/base.js'].lineData[212]++;
    cfg.left = Math.min(Math.max(cfg.left, minScroll.left), maxScroll.left);
  }
  _$jscoverage['/base.js'].lineData[214]++;
  if (visit53_214_1(cfg.top)) {
    _$jscoverage['/base.js'].lineData[215]++;
    cfg.top = Math.min(Math.max(cfg.top, minScroll.top), maxScroll.top);
  }
  _$jscoverage['/base.js'].lineData[217]++;
  self.scrollTo(cfg, anim);
}, 
  scrollTo: function(cfg, animCfg) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[221]++;
  var self = this, left = cfg.left, top = cfg.top;
  _$jscoverage['/base.js'].lineData[224]++;
  if (visit54_224_1(animCfg)) {
    _$jscoverage['/base.js'].lineData[225]++;
    var node = {}, to = {};
    _$jscoverage['/base.js'].lineData[227]++;
    if (visit55_227_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[228]++;
      to.scrollLeft = left;
      _$jscoverage['/base.js'].lineData[229]++;
      node.scrollLeft = self.get('scrollLeft');
    }
    _$jscoverage['/base.js'].lineData[231]++;
    if (visit56_231_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[232]++;
      to.scrollTop = top;
      _$jscoverage['/base.js'].lineData[233]++;
      node.scrollTop = self.get('scrollTop');
    }
    _$jscoverage['/base.js'].lineData[235]++;
    animCfg.frame = frame;
    _$jscoverage['/base.js'].lineData[236]++;
    animCfg.node = node;
    _$jscoverage['/base.js'].lineData[237]++;
    animCfg.to = to;
    _$jscoverage['/base.js'].lineData[238]++;
    var anim;
    _$jscoverage['/base.js'].lineData[239]++;
    self.scrollAnims.push(anim = new Anim(animCfg));
    _$jscoverage['/base.js'].lineData[240]++;
    anim.scrollView = self;
    _$jscoverage['/base.js'].lineData[241]++;
    anim.run();
  } else {
    _$jscoverage['/base.js'].lineData[243]++;
    if (visit57_243_1(left !== undefined)) {
      _$jscoverage['/base.js'].lineData[244]++;
      self.set('scrollLeft', left);
    }
    _$jscoverage['/base.js'].lineData[246]++;
    if (visit58_246_1(top !== undefined)) {
      _$jscoverage['/base.js'].lineData[247]++;
      self.set('scrollTop', top);
    }
  }
}}, {
  ATTRS: {
  contentEl: {}, 
  scrollLeft: {
  view: 1, 
  value: 0}, 
  scrollTop: {
  view: 1, 
  value: 0}, 
  focusable: {
  value: !isTouchEventSupported}, 
  allowTextSelection: {
  value: true}, 
  handleMouseEvents: {
  value: false}, 
  snap: {
  value: false}, 
  pageIndex: {
  value: 0}, 
  xrender: {
  value: Render}}, 
  xclass: 'scroll-view'});
}, {
  requires: ['node', 'anim', 'component/container', './base/render']});
