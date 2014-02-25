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
if (! _$jscoverage['/kison/lexer.js']) {
  _$jscoverage['/kison/lexer.js'] = {};
  _$jscoverage['/kison/lexer.js'].lineData = [];
  _$jscoverage['/kison/lexer.js'].lineData[6] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[7] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[9] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[16] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[32] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[34] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[41] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[44] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[50] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[54] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[70] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[73] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[74] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[75] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[76] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[78] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[79] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[80] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[81] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[83] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[85] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[89] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[96] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[97] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[98] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[101] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[102] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[105] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[107] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[109] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[111] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[113] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[114] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[118] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[119] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[121] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[126] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[127] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[128] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[131] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[132] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[134] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[136] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[139] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[141] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[144] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[145] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[146] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[150] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[154] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[157] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[158] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[159] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[160] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[161] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[162] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[164] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[165] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[168] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[172] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[176] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[180] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[184] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[189] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[190] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[193] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[195] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[199] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[201] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[202] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[205] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[209] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[213] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[214] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[215] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[216] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[219] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[220] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[222] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[227] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[229] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[230] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[232] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[236] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[248] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[250] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[251] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[254] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[255] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[256] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[259] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[260] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[261] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[262] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[264] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[272] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[274] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[277] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[279] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[281] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[282] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[283] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[284] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[286] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[288] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[289] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[291] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[292] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[295] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[300] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[301] = 0;
  _$jscoverage['/kison/lexer.js'].lineData[305] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].functionData) {
  _$jscoverage['/kison/lexer.js'].functionData = [];
  _$jscoverage['/kison/lexer.js'].functionData[0] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[1] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[2] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[3] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[4] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[5] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[6] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[7] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[8] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[9] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[10] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[11] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[12] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[13] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[14] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[15] = 0;
  _$jscoverage['/kison/lexer.js'].functionData[16] = 0;
}
if (! _$jscoverage['/kison/lexer.js'].branchData) {
  _$jscoverage['/kison/lexer.js'].branchData = {};
  _$jscoverage['/kison/lexer.js'].branchData['75'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['84'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['96'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['101'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['112'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['113'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['117'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['118'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['124'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['126'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['131'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['141'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['145'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['159'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['160'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['161'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['164'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['190'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['194'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['201'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['205'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['213'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['219'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['229'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['232'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['250'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['254'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['256'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['257'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['258'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['258'][2] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['261'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['282'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['283'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/kison/lexer.js'].branchData['291'] = [];
  _$jscoverage['/kison/lexer.js'].branchData['291'][1] = new BranchData();
}
_$jscoverage['/kison/lexer.js'].branchData['291'][1].init(1302, 3, 'ret');
function visit123_291_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['283'][1].init(1014, 17, 'ret === undefined');
function visit122_283_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['282'][1].init(960, 27, 'action && action.call(self)');
function visit121_282_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['261'][1].init(76, 5, 'lines');
function visit120_261_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['258'][2].init(133, 20, 'rule[2] || undefined');
function visit119_258_2(result) {
  _$jscoverage['/kison/lexer.js'].branchData['258'][2].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['258'][1].init(118, 35, 'rule.action || rule[2] || undefined');
function visit118_258_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['257'][1].init(65, 21, 'rule.token || rule[0]');
function visit117_257_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['256'][1].init(65, 22, 'rule.regexp || rule[1]');
function visit116_256_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['254'][1].init(555, 16, 'i < rules.length');
function visit115_254_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['250'][1].init(441, 6, '!input');
function visit114_250_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['232'][1].init(166, 55, 'stateMap[s] || (stateMap[s] = self.genShortId(\'state\'))');
function visit113_232_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['229'][1].init(91, 9, '!stateMap');
function visit112_229_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['219'][1].init(418, 16, 'reverseSymbolMap');
function visit111_219_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['213'][1].init(172, 30, '!reverseSymbolMap && symbolMap');
function visit110_213_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['205'][1].init(229, 58, 'symbolMap[t] || (symbolMap[t] = self.genShortId(\'symbol\'))');
function visit109_205_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['201'][1].init(93, 10, '!symbolMap');
function visit108_201_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['194'][1].init(54, 33, 'next.length > DEBUG_CONTEXT_LIMIT');
function visit107_194_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['190'][1].init(316, 36, 'matched.length > DEBUG_CONTEXT_LIMIT');
function visit106_190_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['164'][1].init(236, 30, 'S.inArray(currentState, state)');
function visit105_164_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['161'][1].init(26, 37, 'currentState === Lexer.STATIC.INITIAL');
function visit104_161_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['160'][1].init(68, 6, '!state');
function visit103_160_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['159'][1].init(30, 15, 'r.state || r[3]');
function visit102_159_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['145'][1].init(155, 13, 'compressState');
function visit101_145_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['141'][1].init(1961, 31, 'compressState || compressSymbol');
function visit100_141_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['131'][1].init(749, 5, 'state');
function visit99_131_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['126'][1].init(511, 22, 'compressState && state');
function visit98_126_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['124'][1].init(105, 11, 'action || 0');
function visit97_124_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['118'][1].init(209, 5, 'token');
function visit96_118_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['117'][1].init(139, 12, 'v.token || 0');
function visit95_117_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['113'][1].init(26, 13, 'v && v.regexp');
function visit94_113_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['112'][1].init(54, 31, 'compressState || compressSymbol');
function visit93_112_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['101'][1].init(423, 13, 'compressState');
function visit92_101_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['96'][1].init(284, 14, 'compressSymbol');
function visit91_96_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['84'][1].init(192, 10, 'index >= 0');
function visit90_84_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].branchData['75'][1].init(191, 16, '!(field in self)');
function visit89_75_1(result) {
  _$jscoverage['/kison/lexer.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/kison/lexer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/kison/lexer.js'].functionData[0]++;
  _$jscoverage['/kison/lexer.js'].lineData[7]++;
  var Utils = require('./utils');
  _$jscoverage['/kison/lexer.js'].lineData[9]++;
  var serializeObject = Utils.serializeObject, Lexer = function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[1]++;
  _$jscoverage['/kison/lexer.js'].lineData[16]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[32]++;
  self.rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[34]++;
  S.mix(self, cfg);
  _$jscoverage['/kison/lexer.js'].lineData[41]++;
  self.resetInput(self.input);
};
  _$jscoverage['/kison/lexer.js'].lineData[44]++;
  Lexer.STATIC = {
  INITIAL: 'I', 
  DEBUG_CONTEXT_LIMIT: 20, 
  END_TAG: '$EOF'};
  _$jscoverage['/kison/lexer.js'].lineData[50]++;
  Lexer.prototype = {
  constructor: Lexer, 
  resetInput: function(input, filename) {
  _$jscoverage['/kison/lexer.js'].functionData[2]++;
  _$jscoverage['/kison/lexer.js'].lineData[54]++;
  S.mix(this, {
  input: input, 
  filename: filename, 
  matched: '', 
  stateStack: [Lexer.STATIC.INITIAL], 
  match: '', 
  text: '', 
  firstLine: 1, 
  lineNumber: 1, 
  lastLine: 1, 
  firstColumn: 1, 
  lastColumn: 1});
}, 
  genShortId: function(field) {
  _$jscoverage['/kison/lexer.js'].functionData[3]++;
  _$jscoverage['/kison/lexer.js'].lineData[70]++;
  var base = 97, max = 122, interval = max - base + 1;
  _$jscoverage['/kison/lexer.js'].lineData[73]++;
  field += '__gen';
  _$jscoverage['/kison/lexer.js'].lineData[74]++;
  var self = this;
  _$jscoverage['/kison/lexer.js'].lineData[75]++;
  if (visit89_75_1(!(field in self))) {
    _$jscoverage['/kison/lexer.js'].lineData[76]++;
    self[field] = -1;
  }
  _$jscoverage['/kison/lexer.js'].lineData[78]++;
  var index = self[field] = self[field] + 1;
  _$jscoverage['/kison/lexer.js'].lineData[79]++;
  var ret = '';
  _$jscoverage['/kison/lexer.js'].lineData[80]++;
  do {
    _$jscoverage['/kison/lexer.js'].lineData[81]++;
    ret = String.fromCharCode(base + index % interval) + ret;
    _$jscoverage['/kison/lexer.js'].lineData[83]++;
    index = Math.floor(index / interval) - 1;
  } while (visit90_84_1(index >= 0));
  _$jscoverage['/kison/lexer.js'].lineData[85]++;
  return ret;
}, 
  genCode: function(cfg) {
  _$jscoverage['/kison/lexer.js'].functionData[4]++;
  _$jscoverage['/kison/lexer.js'].lineData[89]++;
  var STATIC = Lexer.STATIC, self = this, compressSymbol = cfg.compressSymbol, compressState = cfg.compressLexerState, code = ['/*jslint quotmark: false*/'], stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[96]++;
  if (visit91_96_1(compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[97]++;
    self.symbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[98]++;
    self.mapSymbol(STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[101]++;
  if (visit92_101_1(compressState)) {
    _$jscoverage['/kison/lexer.js'].lineData[102]++;
    stateMap = self.stateMap = {};
  }
  _$jscoverage['/kison/lexer.js'].lineData[105]++;
  code.push('var Lexer = ' + Lexer.toString() + ';');
  _$jscoverage['/kison/lexer.js'].lineData[107]++;
  code.push('Lexer.prototype= ' + serializeObject(Lexer.prototype, /genCode/) + ';');
  _$jscoverage['/kison/lexer.js'].lineData[109]++;
  code.push('Lexer.STATIC= ' + serializeObject(STATIC) + ';');
  _$jscoverage['/kison/lexer.js'].lineData[111]++;
  var newCfg = serializeObject({
  rules: self.rules}, (visit93_112_1(compressState || compressSymbol)) ? function(v) {
  _$jscoverage['/kison/lexer.js'].functionData[5]++;
  _$jscoverage['/kison/lexer.js'].lineData[113]++;
  if (visit94_113_1(v && v.regexp)) {
    _$jscoverage['/kison/lexer.js'].lineData[114]++;
    var state = v.state, ret, action = v.action, token = visit95_117_1(v.token || 0);
    _$jscoverage['/kison/lexer.js'].lineData[118]++;
    if (visit96_118_1(token)) {
      _$jscoverage['/kison/lexer.js'].lineData[119]++;
      token = self.mapSymbol(token);
    }
    _$jscoverage['/kison/lexer.js'].lineData[121]++;
    ret = [token, v.regexp, visit97_124_1(action || 0)];
    _$jscoverage['/kison/lexer.js'].lineData[126]++;
    if (visit98_126_1(compressState && state)) {
      _$jscoverage['/kison/lexer.js'].lineData[127]++;
      state = S.map(state, function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[6]++;
  _$jscoverage['/kison/lexer.js'].lineData[128]++;
  return self.mapState(s);
});
    }
    _$jscoverage['/kison/lexer.js'].lineData[131]++;
    if (visit99_131_1(state)) {
      _$jscoverage['/kison/lexer.js'].lineData[132]++;
      ret.push(state);
    }
    _$jscoverage['/kison/lexer.js'].lineData[134]++;
    return ret;
  }
  _$jscoverage['/kison/lexer.js'].lineData[136]++;
  return undefined;
} : 0);
  _$jscoverage['/kison/lexer.js'].lineData[139]++;
  code.push('var lexer = new Lexer(' + newCfg + ');');
  _$jscoverage['/kison/lexer.js'].lineData[141]++;
  if (visit100_141_1(compressState || compressSymbol)) {
    _$jscoverage['/kison/lexer.js'].lineData[144]++;
    self.rules = eval('(' + newCfg + ')').rules;
    _$jscoverage['/kison/lexer.js'].lineData[145]++;
    if (visit101_145_1(compressState)) {
      _$jscoverage['/kison/lexer.js'].lineData[146]++;
      code.push('lexer.stateMap = ' + serializeObject(stateMap) + ';');
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[150]++;
  return code.join('\n');
}, 
  getCurrentRules: function() {
  _$jscoverage['/kison/lexer.js'].functionData[7]++;
  _$jscoverage['/kison/lexer.js'].lineData[154]++;
  var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
  _$jscoverage['/kison/lexer.js'].lineData[157]++;
  currentState = self.mapState(currentState);
  _$jscoverage['/kison/lexer.js'].lineData[158]++;
  S.each(self.rules, function(r) {
  _$jscoverage['/kison/lexer.js'].functionData[8]++;
  _$jscoverage['/kison/lexer.js'].lineData[159]++;
  var state = visit102_159_1(r.state || r[3]);
  _$jscoverage['/kison/lexer.js'].lineData[160]++;
  if (visit103_160_1(!state)) {
    _$jscoverage['/kison/lexer.js'].lineData[161]++;
    if (visit104_161_1(currentState === Lexer.STATIC.INITIAL)) {
      _$jscoverage['/kison/lexer.js'].lineData[162]++;
      rules.push(r);
    }
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[164]++;
    if (visit105_164_1(S.inArray(currentState, state))) {
      _$jscoverage['/kison/lexer.js'].lineData[165]++;
      rules.push(r);
    }
  }
});
  _$jscoverage['/kison/lexer.js'].lineData[168]++;
  return rules;
}, 
  pushState: function(state) {
  _$jscoverage['/kison/lexer.js'].functionData[9]++;
  _$jscoverage['/kison/lexer.js'].lineData[172]++;
  this.stateStack.push(state);
}, 
  popState: function() {
  _$jscoverage['/kison/lexer.js'].functionData[10]++;
  _$jscoverage['/kison/lexer.js'].lineData[176]++;
  return this.stateStack.pop();
}, 
  getStateStack: function() {
  _$jscoverage['/kison/lexer.js'].functionData[11]++;
  _$jscoverage['/kison/lexer.js'].lineData[180]++;
  return this.stateStack;
}, 
  showDebugInfo: function() {
  _$jscoverage['/kison/lexer.js'].functionData[12]++;
  _$jscoverage['/kison/lexer.js'].lineData[184]++;
  var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
  _$jscoverage['/kison/lexer.js'].lineData[189]++;
  matched = matched.slice(0, matched.length - match.length);
  _$jscoverage['/kison/lexer.js'].lineData[190]++;
  var past = (visit106_190_1(matched.length > DEBUG_CONTEXT_LIMIT) ? '...' : '') + matched.slice(-DEBUG_CONTEXT_LIMIT).replace(/\n/, ' '), next = match + input;
  _$jscoverage['/kison/lexer.js'].lineData[193]++;
  next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (visit107_194_1(next.length > DEBUG_CONTEXT_LIMIT) ? '...' : '');
  _$jscoverage['/kison/lexer.js'].lineData[195]++;
  return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
}, 
  mapSymbol: function(t) {
  _$jscoverage['/kison/lexer.js'].functionData[13]++;
  _$jscoverage['/kison/lexer.js'].lineData[199]++;
  var self = this, symbolMap = self.symbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[201]++;
  if (visit108_201_1(!symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[202]++;
    return t;
  }
  _$jscoverage['/kison/lexer.js'].lineData[205]++;
  return visit109_205_1(symbolMap[t] || (symbolMap[t] = self.genShortId('symbol')));
}, 
  mapReverseSymbol: function(rs) {
  _$jscoverage['/kison/lexer.js'].functionData[14]++;
  _$jscoverage['/kison/lexer.js'].lineData[209]++;
  var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
  _$jscoverage['/kison/lexer.js'].lineData[213]++;
  if (visit110_213_1(!reverseSymbolMap && symbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[214]++;
    reverseSymbolMap = self.reverseSymbolMap = {};
    _$jscoverage['/kison/lexer.js'].lineData[215]++;
    for (i in symbolMap) {
      _$jscoverage['/kison/lexer.js'].lineData[216]++;
      reverseSymbolMap[symbolMap[i]] = i;
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[219]++;
  if (visit111_219_1(reverseSymbolMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[220]++;
    return reverseSymbolMap[rs];
  } else {
    _$jscoverage['/kison/lexer.js'].lineData[222]++;
    return rs;
  }
}, 
  mapState: function(s) {
  _$jscoverage['/kison/lexer.js'].functionData[15]++;
  _$jscoverage['/kison/lexer.js'].lineData[227]++;
  var self = this, stateMap = self.stateMap;
  _$jscoverage['/kison/lexer.js'].lineData[229]++;
  if (visit112_229_1(!stateMap)) {
    _$jscoverage['/kison/lexer.js'].lineData[230]++;
    return s;
  }
  _$jscoverage['/kison/lexer.js'].lineData[232]++;
  return visit113_232_1(stateMap[s] || (stateMap[s] = self.genShortId('state')));
}, 
  lex: function() {
  _$jscoverage['/kison/lexer.js'].functionData[16]++;
  _$jscoverage['/kison/lexer.js'].lineData[236]++;
  var self = this, input = self.input, i, rule, m, ret, lines, filename = self.filename, prefix = filename ? ('in file: ' + filename + ' ') : '', rules = self.getCurrentRules();
  _$jscoverage['/kison/lexer.js'].lineData[248]++;
  self.match = self.text = '';
  _$jscoverage['/kison/lexer.js'].lineData[250]++;
  if (visit114_250_1(!input)) {
    _$jscoverage['/kison/lexer.js'].lineData[251]++;
    return self.mapSymbol(Lexer.STATIC.END_TAG);
  }
  _$jscoverage['/kison/lexer.js'].lineData[254]++;
  for (i = 0; visit115_254_1(i < rules.length); i++) {
    _$jscoverage['/kison/lexer.js'].lineData[255]++;
    rule = rules[i];
    _$jscoverage['/kison/lexer.js'].lineData[256]++;
    var regexp = visit116_256_1(rule.regexp || rule[1]), token = visit117_257_1(rule.token || rule[0]), action = visit118_258_1(rule.action || visit119_258_2(rule[2] || undefined));
    _$jscoverage['/kison/lexer.js'].lineData[259]++;
    if ((m = input.match(regexp))) {
      _$jscoverage['/kison/lexer.js'].lineData[260]++;
      lines = m[0].match(/\n.*/g);
      _$jscoverage['/kison/lexer.js'].lineData[261]++;
      if (visit120_261_1(lines)) {
        _$jscoverage['/kison/lexer.js'].lineData[262]++;
        self.lineNumber += lines.length;
      }
      _$jscoverage['/kison/lexer.js'].lineData[264]++;
      S.mix(self, {
  firstLine: self.lastLine, 
  lastLine: self.lineNumber + 1, 
  firstColumn: self.lastColumn, 
  lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length});
      _$jscoverage['/kison/lexer.js'].lineData[272]++;
      var match;
      _$jscoverage['/kison/lexer.js'].lineData[274]++;
      match = self.match = m[0];
      _$jscoverage['/kison/lexer.js'].lineData[277]++;
      self.matches = m;
      _$jscoverage['/kison/lexer.js'].lineData[279]++;
      self.text = match;
      _$jscoverage['/kison/lexer.js'].lineData[281]++;
      self.matched += match;
      _$jscoverage['/kison/lexer.js'].lineData[282]++;
      ret = visit121_282_1(action && action.call(self));
      _$jscoverage['/kison/lexer.js'].lineData[283]++;
      if (visit122_283_1(ret === undefined)) {
        _$jscoverage['/kison/lexer.js'].lineData[284]++;
        ret = token;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[286]++;
        ret = self.mapSymbol(ret);
      }
      _$jscoverage['/kison/lexer.js'].lineData[288]++;
      input = input.slice(match.length);
      _$jscoverage['/kison/lexer.js'].lineData[289]++;
      self.input = input;
      _$jscoverage['/kison/lexer.js'].lineData[291]++;
      if (visit123_291_1(ret)) {
        _$jscoverage['/kison/lexer.js'].lineData[292]++;
        return ret;
      } else {
        _$jscoverage['/kison/lexer.js'].lineData[295]++;
        return self.lex();
      }
    }
  }
  _$jscoverage['/kison/lexer.js'].lineData[300]++;
  S.error(prefix + 'lex error at line ' + self.lineNumber + ':\n' + self.showDebugInfo());
  _$jscoverage['/kison/lexer.js'].lineData[301]++;
  return undefined;
}};
  _$jscoverage['/kison/lexer.js'].lineData[305]++;
  return Lexer;
});
