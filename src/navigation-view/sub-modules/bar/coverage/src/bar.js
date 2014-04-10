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
if (! _$jscoverage['/bar.js']) {
  _$jscoverage['/bar.js'] = {};
  _$jscoverage['/bar.js'].lineData = [];
  _$jscoverage['/bar.js'].lineData[5] = 0;
  _$jscoverage['/bar.js'].lineData[6] = 0;
  _$jscoverage['/bar.js'].lineData[7] = 0;
  _$jscoverage['/bar.js'].lineData[8] = 0;
  _$jscoverage['/bar.js'].lineData[10] = 0;
  _$jscoverage['/bar.js'].lineData[11] = 0;
  _$jscoverage['/bar.js'].lineData[13] = 0;
  _$jscoverage['/bar.js'].lineData[14] = 0;
  _$jscoverage['/bar.js'].lineData[16] = 0;
  _$jscoverage['/bar.js'].lineData[18] = 0;
  _$jscoverage['/bar.js'].lineData[20] = 0;
  _$jscoverage['/bar.js'].lineData[21] = 0;
  _$jscoverage['/bar.js'].lineData[22] = 0;
  _$jscoverage['/bar.js'].lineData[27] = 0;
  _$jscoverage['/bar.js'].lineData[30] = 0;
  _$jscoverage['/bar.js'].lineData[31] = 0;
  _$jscoverage['/bar.js'].lineData[38] = 0;
  _$jscoverage['/bar.js'].lineData[39] = 0;
  _$jscoverage['/bar.js'].lineData[49] = 0;
  _$jscoverage['/bar.js'].lineData[50] = 0;
  _$jscoverage['/bar.js'].lineData[51] = 0;
  _$jscoverage['/bar.js'].lineData[53] = 0;
  _$jscoverage['/bar.js'].lineData[54] = 0;
  _$jscoverage['/bar.js'].lineData[57] = 0;
  _$jscoverage['/bar.js'].lineData[75] = 0;
  _$jscoverage['/bar.js'].lineData[76] = 0;
  _$jscoverage['/bar.js'].lineData[77] = 0;
  _$jscoverage['/bar.js'].lineData[80] = 0;
  _$jscoverage['/bar.js'].lineData[81] = 0;
  _$jscoverage['/bar.js'].lineData[83] = 0;
  _$jscoverage['/bar.js'].lineData[84] = 0;
  _$jscoverage['/bar.js'].lineData[86] = 0;
  _$jscoverage['/bar.js'].lineData[89] = 0;
  _$jscoverage['/bar.js'].lineData[91] = 0;
  _$jscoverage['/bar.js'].lineData[92] = 0;
  _$jscoverage['/bar.js'].lineData[94] = 0;
  _$jscoverage['/bar.js'].lineData[97] = 0;
  _$jscoverage['/bar.js'].lineData[99] = 0;
  _$jscoverage['/bar.js'].lineData[117] = 0;
  _$jscoverage['/bar.js'].lineData[123] = 0;
  _$jscoverage['/bar.js'].lineData[124] = 0;
  _$jscoverage['/bar.js'].lineData[127] = 0;
  _$jscoverage['/bar.js'].lineData[128] = 0;
  _$jscoverage['/bar.js'].lineData[131] = 0;
  _$jscoverage['/bar.js'].lineData[132] = 0;
  _$jscoverage['/bar.js'].lineData[135] = 0;
  _$jscoverage['/bar.js'].lineData[136] = 0;
  _$jscoverage['/bar.js'].lineData[137] = 0;
  _$jscoverage['/bar.js'].lineData[138] = 0;
  _$jscoverage['/bar.js'].lineData[139] = 0;
  _$jscoverage['/bar.js'].lineData[140] = 0;
  _$jscoverage['/bar.js'].lineData[141] = 0;
  _$jscoverage['/bar.js'].lineData[145] = 0;
  _$jscoverage['/bar.js'].lineData[147] = 0;
  _$jscoverage['/bar.js'].lineData[148] = 0;
  _$jscoverage['/bar.js'].lineData[149] = 0;
  _$jscoverage['/bar.js'].lineData[156] = 0;
  _$jscoverage['/bar.js'].lineData[158] = 0;
  _$jscoverage['/bar.js'].lineData[159] = 0;
  _$jscoverage['/bar.js'].lineData[160] = 0;
  _$jscoverage['/bar.js'].lineData[171] = 0;
  _$jscoverage['/bar.js'].lineData[172] = 0;
  _$jscoverage['/bar.js'].lineData[174] = 0;
  _$jscoverage['/bar.js'].lineData[175] = 0;
  _$jscoverage['/bar.js'].lineData[176] = 0;
  _$jscoverage['/bar.js'].lineData[180] = 0;
  _$jscoverage['/bar.js'].lineData[182] = 0;
  _$jscoverage['/bar.js'].lineData[183] = 0;
  _$jscoverage['/bar.js'].lineData[184] = 0;
  _$jscoverage['/bar.js'].lineData[185] = 0;
  _$jscoverage['/bar.js'].lineData[186] = 0;
  _$jscoverage['/bar.js'].lineData[187] = 0;
  _$jscoverage['/bar.js'].lineData[188] = 0;
  _$jscoverage['/bar.js'].lineData[190] = 0;
  _$jscoverage['/bar.js'].lineData[192] = 0;
  _$jscoverage['/bar.js'].lineData[193] = 0;
  _$jscoverage['/bar.js'].lineData[197] = 0;
  _$jscoverage['/bar.js'].lineData[198] = 0;
  _$jscoverage['/bar.js'].lineData[202] = 0;
  _$jscoverage['/bar.js'].lineData[203] = 0;
  _$jscoverage['/bar.js'].lineData[207] = 0;
  _$jscoverage['/bar.js'].lineData[211] = 0;
  _$jscoverage['/bar.js'].lineData[212] = 0;
  _$jscoverage['/bar.js'].lineData[216] = 0;
  _$jscoverage['/bar.js'].lineData[217] = 0;
  _$jscoverage['/bar.js'].lineData[219] = 0;
  _$jscoverage['/bar.js'].lineData[220] = 0;
  _$jscoverage['/bar.js'].lineData[221] = 0;
  _$jscoverage['/bar.js'].lineData[223] = 0;
  _$jscoverage['/bar.js'].lineData[224] = 0;
  _$jscoverage['/bar.js'].lineData[226] = 0;
  _$jscoverage['/bar.js'].lineData[229] = 0;
  _$jscoverage['/bar.js'].lineData[230] = 0;
  _$jscoverage['/bar.js'].lineData[231] = 0;
  _$jscoverage['/bar.js'].lineData[232] = 0;
  _$jscoverage['/bar.js'].lineData[234] = 0;
  _$jscoverage['/bar.js'].lineData[237] = 0;
  _$jscoverage['/bar.js'].lineData[238] = 0;
  _$jscoverage['/bar.js'].lineData[239] = 0;
  _$jscoverage['/bar.js'].lineData[240] = 0;
  _$jscoverage['/bar.js'].lineData[241] = 0;
  _$jscoverage['/bar.js'].lineData[242] = 0;
  _$jscoverage['/bar.js'].lineData[244] = 0;
  _$jscoverage['/bar.js'].lineData[245] = 0;
  _$jscoverage['/bar.js'].lineData[246] = 0;
  _$jscoverage['/bar.js'].lineData[247] = 0;
  _$jscoverage['/bar.js'].lineData[249] = 0;
  _$jscoverage['/bar.js'].lineData[250] = 0;
  _$jscoverage['/bar.js'].lineData[251] = 0;
  _$jscoverage['/bar.js'].lineData[252] = 0;
  _$jscoverage['/bar.js'].lineData[255] = 0;
  _$jscoverage['/bar.js'].lineData[256] = 0;
  _$jscoverage['/bar.js'].lineData[259] = 0;
  _$jscoverage['/bar.js'].lineData[260] = 0;
  _$jscoverage['/bar.js'].lineData[261] = 0;
  _$jscoverage['/bar.js'].lineData[262] = 0;
  _$jscoverage['/bar.js'].lineData[263] = 0;
  _$jscoverage['/bar.js'].lineData[264] = 0;
  _$jscoverage['/bar.js'].lineData[265] = 0;
  _$jscoverage['/bar.js'].lineData[266] = 0;
  _$jscoverage['/bar.js'].lineData[267] = 0;
  _$jscoverage['/bar.js'].lineData[268] = 0;
  _$jscoverage['/bar.js'].lineData[269] = 0;
  _$jscoverage['/bar.js'].lineData[274] = 0;
  _$jscoverage['/bar.js'].lineData[275] = 0;
  _$jscoverage['/bar.js'].lineData[276] = 0;
  _$jscoverage['/bar.js'].lineData[281] = 0;
  _$jscoverage['/bar.js'].lineData[282] = 0;
  _$jscoverage['/bar.js'].lineData[283] = 0;
  _$jscoverage['/bar.js'].lineData[288] = 0;
  _$jscoverage['/bar.js'].lineData[289] = 0;
  _$jscoverage['/bar.js'].lineData[307] = 0;
  _$jscoverage['/bar.js'].lineData[312] = 0;
  _$jscoverage['/bar.js'].lineData[317] = 0;
}
if (! _$jscoverage['/bar.js'].functionData) {
  _$jscoverage['/bar.js'].functionData = [];
  _$jscoverage['/bar.js'].functionData[0] = 0;
  _$jscoverage['/bar.js'].functionData[1] = 0;
  _$jscoverage['/bar.js'].functionData[2] = 0;
  _$jscoverage['/bar.js'].functionData[3] = 0;
  _$jscoverage['/bar.js'].functionData[4] = 0;
  _$jscoverage['/bar.js'].functionData[5] = 0;
  _$jscoverage['/bar.js'].functionData[6] = 0;
  _$jscoverage['/bar.js'].functionData[7] = 0;
  _$jscoverage['/bar.js'].functionData[8] = 0;
  _$jscoverage['/bar.js'].functionData[9] = 0;
  _$jscoverage['/bar.js'].functionData[10] = 0;
  _$jscoverage['/bar.js'].functionData[11] = 0;
  _$jscoverage['/bar.js'].functionData[12] = 0;
  _$jscoverage['/bar.js'].functionData[13] = 0;
  _$jscoverage['/bar.js'].functionData[14] = 0;
  _$jscoverage['/bar.js'].functionData[15] = 0;
  _$jscoverage['/bar.js'].functionData[16] = 0;
  _$jscoverage['/bar.js'].functionData[17] = 0;
  _$jscoverage['/bar.js'].functionData[18] = 0;
  _$jscoverage['/bar.js'].functionData[19] = 0;
  _$jscoverage['/bar.js'].functionData[20] = 0;
  _$jscoverage['/bar.js'].functionData[21] = 0;
  _$jscoverage['/bar.js'].functionData[22] = 0;
  _$jscoverage['/bar.js'].functionData[23] = 0;
  _$jscoverage['/bar.js'].functionData[24] = 0;
}
if (! _$jscoverage['/bar.js'].branchData) {
  _$jscoverage['/bar.js'].branchData = {};
  _$jscoverage['/bar.js'].branchData['49'] = [];
  _$jscoverage['/bar.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['76'] = [];
  _$jscoverage['/bar.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['80'] = [];
  _$jscoverage['/bar.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['83'] = [];
  _$jscoverage['/bar.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['91'] = [];
  _$jscoverage['/bar.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['132'] = [];
  _$jscoverage['/bar.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['140'] = [];
  _$jscoverage['/bar.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['141'] = [];
  _$jscoverage['/bar.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['159'] = [];
  _$jscoverage['/bar.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['171'] = [];
  _$jscoverage['/bar.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['183'] = [];
  _$jscoverage['/bar.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['184'] = [];
  _$jscoverage['/bar.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['185'] = [];
  _$jscoverage['/bar.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['187'] = [];
  _$jscoverage['/bar.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['219'] = [];
  _$jscoverage['/bar.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['219'][2] = new BranchData();
  _$jscoverage['/bar.js'].branchData['220'] = [];
  _$jscoverage['/bar.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['223'] = [];
  _$jscoverage['/bar.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['231'] = [];
  _$jscoverage['/bar.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['241'] = [];
  _$jscoverage['/bar.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['246'] = [];
  _$jscoverage['/bar.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['249'] = [];
  _$jscoverage['/bar.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['274'] = [];
  _$jscoverage['/bar.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['282'] = [];
  _$jscoverage['/bar.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/bar.js'].branchData['288'] = [];
  _$jscoverage['/bar.js'].branchData['288'][1] = new BranchData();
}
_$jscoverage['/bar.js'].branchData['288'][1].init(18, 13, 'this._backBtn');
function visit30_288_1(result) {
  _$jscoverage['/bar.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['282'][1].init(66, 7, 'titleEl');
function visit29_282_1(result) {
  _$jscoverage['/bar.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['274'][1].init(18, 18, 'this._stack.length');
function visit28_274_1(result) {
  _$jscoverage['/bar.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['249'][1].init(1207, 37, 'ghostBackEl.css(\'display\') !== \'none\'');
function visit27_249_1(result) {
  _$jscoverage['/bar.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['246'][1].init(1095, 22, 'backBtn.get(\'visible\')');
function visit26_246_1(result) {
  _$jscoverage['/bar.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['241'][1].init(872, 16, 'self.ghostBackEl');
function visit25_241_1(result) {
  _$jscoverage['/bar.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['231'][1].init(488, 16, 'self.ghostBackEl');
function visit24_231_1(result) {
  _$jscoverage['/bar.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['223'][1].init(135, 7, 'backBtn');
function visit23_223_1(result) {
  _$jscoverage['/bar.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['220'][1].init(22, 15, 'self._withTitle');
function visit22_220_1(result) {
  _$jscoverage['/bar.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['219'][2].init(94, 26, 'backBtn && self._withTitle');
function visit21_219_2(result) {
  _$jscoverage['/bar.js'].branchData['219'][2].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['219'][1].init(92, 29, '!(backBtn && self._withTitle)');
function visit20_219_1(result) {
  _$jscoverage['/bar.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['187'][1].init(200, 17, 'align === \'right\'');
function visit19_187_1(result) {
  _$jscoverage['/bar.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['185'][1].init(90, 16, 'align === \'left\'');
function visit18_185_1(result) {
  _$jscoverage['/bar.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['184'][1].init(45, 22, 'config.align || \'left\'');
function visit17_184_1(result) {
  _$jscoverage['/bar.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['183'][1].init(163, 34, '!config.elBefore && !config.render');
function visit16_183_1(result) {
  _$jscoverage['/bar.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['171'][1].init(18, 13, 'this._backBtn');
function visit15_171_1(result) {
  _$jscoverage['/bar.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['159'][1].init(133, 26, 'self.get(\'withBackButton\')');
function visit14_159_1(result) {
  _$jscoverage['/bar.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['141'][1].init(54, 26, 'newView.get(\'title\') || \'\'');
function visit13_141_1(result) {
  _$jscoverage['/bar.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['140'][1].init(144, 7, 'oldView');
function visit12_140_1(result) {
  _$jscoverage['/bar.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['132'][1].init(28, 28, 'e.newView.get(\'title\') || \'\'');
function visit11_132_1(result) {
  _$jscoverage['/bar.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['91'][1].init(77, 19, 'omega !== undefined');
function visit10_91_1(result) {
  _$jscoverage['/bar.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['83'][1].init(77, 19, 'omega !== undefined');
function visit9_83_1(result) {
  _$jscoverage['/bar.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['80'][1].init(1457, 7, 'reverse');
function visit8_80_1(result) {
  _$jscoverage['/bar.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['76'][1].init(1365, 19, 'titleWidth > titleX');
function visit7_76_1(result) {
  _$jscoverage['/bar.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].branchData['49'][1].init(533, 7, 'reverse');
function visit6_49_1(result) {
  _$jscoverage['/bar.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/bar.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/bar.js'].functionData[0]++;
  _$jscoverage['/bar.js'].lineData[6]++;
  var Control = require('component/control');
  _$jscoverage['/bar.js'].lineData[7]++;
  var Button = require('button');
  _$jscoverage['/bar.js'].lineData[8]++;
  var tpl = require('./bar/bar-xtpl');
  _$jscoverage['/bar.js'].lineData[10]++;
  function createGhost(elem) {
    _$jscoverage['/bar.js'].functionData[1]++;
    _$jscoverage['/bar.js'].lineData[11]++;
    var ghost, width;
    _$jscoverage['/bar.js'].lineData[13]++;
    ghost = elem.clone(true);
    _$jscoverage['/bar.js'].lineData[14]++;
    ghost[0].id = elem[0].id + '-proxy';
    _$jscoverage['/bar.js'].lineData[16]++;
    elem.parent().append(ghost);
    _$jscoverage['/bar.js'].lineData[18]++;
    var offset = elem.offset();
    _$jscoverage['/bar.js'].lineData[20]++;
    ghost.css('position', 'absolute');
    _$jscoverage['/bar.js'].lineData[21]++;
    ghost.offset(offset);
    _$jscoverage['/bar.js'].lineData[22]++;
    ghost.css({
  width: width = elem.css('width'), 
  height: elem.css('height')});
    _$jscoverage['/bar.js'].lineData[27]++;
    return ghost;
  }
  _$jscoverage['/bar.js'].lineData[30]++;
  function anim(el, props, complete) {
    _$jscoverage['/bar.js'].functionData[2]++;
    _$jscoverage['/bar.js'].lineData[31]++;
    el.animate(props, {
  duration: 0.25, 
  easing: 'ease-in-out', 
  complete: complete});
  }
  _$jscoverage['/bar.js'].lineData[38]++;
  function getAnimProps(self, backEl, backElProps, reverse) {
    _$jscoverage['/bar.js'].functionData[3]++;
    _$jscoverage['/bar.js'].lineData[39]++;
    var barElement = self.get('el'), titleElement = self.get('titleEl'), minOffset = Math.min(barElement[0].offsetWidth / 3, 200), newLeftWidth = backEl[0].offsetWidth, barWidth = barElement[0].offsetWidth, titleX = titleElement.offset().left - barElement.offset().left, titleWidth = titleElement[0].offsetWidth, oldBackWidth = backElProps.width, newOffset, oldOffset, backElAnims, titleAnims, omega, theta;
    _$jscoverage['/bar.js'].lineData[49]++;
    if (visit6_49_1(reverse)) {
      _$jscoverage['/bar.js'].lineData[50]++;
      newOffset = -oldBackWidth;
      _$jscoverage['/bar.js'].lineData[51]++;
      oldOffset = Math.min(titleX - oldBackWidth, minOffset);
    } else {
      _$jscoverage['/bar.js'].lineData[53]++;
      oldOffset = -oldBackWidth;
      _$jscoverage['/bar.js'].lineData[54]++;
      newOffset = Math.min(titleX, minOffset);
    }
    _$jscoverage['/bar.js'].lineData[57]++;
    backElAnims = {
  element: {
  from: {
  transform: 'translateX(' + newOffset + 'px) translateZ(0)'}, 
  to: {
  transform: 'translateX(0) translateZ(0)', 
  opacity: 1}}, 
  ghost: {
  to: {
  transform: 'translateX(' + oldOffset + 'px) translateZ(0)', 
  opacity: 0}}};
    _$jscoverage['/bar.js'].lineData[75]++;
    theta = -titleX + newLeftWidth;
    _$jscoverage['/bar.js'].lineData[76]++;
    if (visit7_76_1(titleWidth > titleX)) {
      _$jscoverage['/bar.js'].lineData[77]++;
      omega = -titleX - titleWidth;
    }
    _$jscoverage['/bar.js'].lineData[80]++;
    if (visit8_80_1(reverse)) {
      _$jscoverage['/bar.js'].lineData[81]++;
      oldOffset = barWidth - titleX - titleWidth;
      _$jscoverage['/bar.js'].lineData[83]++;
      if (visit9_83_1(omega !== undefined)) {
        _$jscoverage['/bar.js'].lineData[84]++;
        newOffset = omega;
      } else {
        _$jscoverage['/bar.js'].lineData[86]++;
        newOffset = theta;
      }
    } else {
      _$jscoverage['/bar.js'].lineData[89]++;
      newOffset = barWidth - titleX - titleWidth;
      _$jscoverage['/bar.js'].lineData[91]++;
      if (visit10_91_1(omega !== undefined)) {
        _$jscoverage['/bar.js'].lineData[92]++;
        oldOffset = omega;
      } else {
        _$jscoverage['/bar.js'].lineData[94]++;
        oldOffset = theta;
      }
      _$jscoverage['/bar.js'].lineData[97]++;
      newOffset = Math.max(0, newOffset);
    }
    _$jscoverage['/bar.js'].lineData[99]++;
    titleAnims = {
  element: {
  from: {
  transform: 'translateX(' + newOffset + 'px) translateZ(0)'}, 
  to: {
  transform: 'translateX(0) translateZ(0)', 
  opacity: 1}}, 
  ghost: {
  to: {
  transform: 'translateX(' + oldOffset + 'px) translateZ(0)', 
  opacity: 0}}};
    _$jscoverage['/bar.js'].lineData[117]++;
    return {
  back: backElAnims, 
  title: titleAnims};
  }
  _$jscoverage['/bar.js'].lineData[123]++;
  function onBackButtonClick() {
    _$jscoverage['/bar.js'].functionData[4]++;
    _$jscoverage['/bar.js'].lineData[124]++;
    this.fire('backward');
  }
  _$jscoverage['/bar.js'].lineData[127]++;
  function onBack() {
    _$jscoverage['/bar.js'].functionData[5]++;
    _$jscoverage['/bar.js'].lineData[128]++;
    this.get('navigationView').pop();
  }
  _$jscoverage['/bar.js'].lineData[131]++;
  function afterInnerViewChange(e) {
    _$jscoverage['/bar.js'].functionData[6]++;
    _$jscoverage['/bar.js'].lineData[132]++;
    this.set('title', visit11_132_1(e.newView.get('title') || ''));
  }
  _$jscoverage['/bar.js'].lineData[135]++;
  function beforeInnerViewChange(e) {
    _$jscoverage['/bar.js'].functionData[7]++;
    _$jscoverage['/bar.js'].lineData[136]++;
    var self = this;
    _$jscoverage['/bar.js'].lineData[137]++;
    var oldView = e.oldView;
    _$jscoverage['/bar.js'].lineData[138]++;
    var newView = e.newView;
    _$jscoverage['/bar.js'].lineData[139]++;
    var backward = e.backward;
    _$jscoverage['/bar.js'].lineData[140]++;
    if (visit12_140_1(oldView)) {
      _$jscoverage['/bar.js'].lineData[141]++;
      self[backward ? 'backward' : 'forward'](visit13_141_1(newView.get('title') || ''));
    }
  }
  _$jscoverage['/bar.js'].lineData[145]++;
  return Control.extend({
  initializer: function() {
  _$jscoverage['/bar.js'].functionData[8]++;
  _$jscoverage['/bar.js'].lineData[147]++;
  this._withTitle = this.get('withTitle');
  _$jscoverage['/bar.js'].lineData[148]++;
  this._stack = [];
  _$jscoverage['/bar.js'].lineData[149]++;
  this.publish('backward', {
  defaultFn: onBack, 
  defaultTargetOnly: true});
}, 
  renderUI: function() {
  _$jscoverage['/bar.js'].functionData[9]++;
  _$jscoverage['/bar.js'].lineData[156]++;
  var self = this, prefixCls = self.get('prefixCls');
  _$jscoverage['/bar.js'].lineData[158]++;
  self._buttons = {};
  _$jscoverage['/bar.js'].lineData[159]++;
  if (visit14_159_1(self.get('withBackButton'))) {
    _$jscoverage['/bar.js'].lineData[160]++;
    self._backBtn = new Button({
  prefixCls: prefixCls + 'navigation-bar-', 
  elCls: prefixCls + 'navigation-bar-backward', 
  elBefore: self.get('contentEl')[0].firstChild, 
  visible: false, 
  content: self.get('backText')}).render();
  }
}, 
  bindUI: function() {
  _$jscoverage['/bar.js'].functionData[10]++;
  _$jscoverage['/bar.js'].lineData[171]++;
  if (visit15_171_1(this._backBtn)) {
    _$jscoverage['/bar.js'].lineData[172]++;
    this._backBtn.on('click', onBackButtonClick, this);
  }
  _$jscoverage['/bar.js'].lineData[174]++;
  var navigationView = this.get('navigationView');
  _$jscoverage['/bar.js'].lineData[175]++;
  navigationView.on('afterInnerViewChange', afterInnerViewChange, this);
  _$jscoverage['/bar.js'].lineData[176]++;
  navigationView.on('beforeInnerViewChange', beforeInnerViewChange, this);
}, 
  addButton: function(name, config) {
  _$jscoverage['/bar.js'].functionData[11]++;
  _$jscoverage['/bar.js'].lineData[180]++;
  var self = this, prefixCls = self.get('prefixCls');
  _$jscoverage['/bar.js'].lineData[182]++;
  config.prefixCls = prefixCls + 'navigation-bar-';
  _$jscoverage['/bar.js'].lineData[183]++;
  if (visit16_183_1(!config.elBefore && !config.render)) {
    _$jscoverage['/bar.js'].lineData[184]++;
    var align = config.align = visit17_184_1(config.align || 'left');
    _$jscoverage['/bar.js'].lineData[185]++;
    if (visit18_185_1(align === 'left')) {
      _$jscoverage['/bar.js'].lineData[186]++;
      config.elBefore = self.get('centerEl');
    } else {
      _$jscoverage['/bar.js'].lineData[187]++;
      if (visit19_187_1(align === 'right')) {
        _$jscoverage['/bar.js'].lineData[188]++;
        config.render = self.get('contentEl');
      }
    }
    _$jscoverage['/bar.js'].lineData[190]++;
    delete config.align;
  }
  _$jscoverage['/bar.js'].lineData[192]++;
  self._buttons[name] = new Button(config).render();
  _$jscoverage['/bar.js'].lineData[193]++;
  return self._buttons[name];
}, 
  insertButtonBefore: function(name, config, button) {
  _$jscoverage['/bar.js'].functionData[12]++;
  _$jscoverage['/bar.js'].lineData[197]++;
  config.elBefore = button.get('el');
  _$jscoverage['/bar.js'].lineData[198]++;
  return this.addButton(name, config);
}, 
  removeButton: function(name) {
  _$jscoverage['/bar.js'].functionData[13]++;
  _$jscoverage['/bar.js'].lineData[202]++;
  this._buttons[name].destroy();
  _$jscoverage['/bar.js'].lineData[203]++;
  delete this._buttons[name];
}, 
  getButton: function(name) {
  _$jscoverage['/bar.js'].functionData[14]++;
  _$jscoverage['/bar.js'].lineData[207]++;
  return this._buttons[name];
}, 
  forward: function(title) {
  _$jscoverage['/bar.js'].functionData[15]++;
  _$jscoverage['/bar.js'].lineData[211]++;
  this._stack.push(title);
  _$jscoverage['/bar.js'].lineData[212]++;
  this.go(title, true);
}, 
  go: function(title, hasPrevious, reverse) {
  _$jscoverage['/bar.js'].functionData[16]++;
  _$jscoverage['/bar.js'].lineData[216]++;
  var self = this;
  _$jscoverage['/bar.js'].lineData[217]++;
  var backBtn = self._backBtn;
  _$jscoverage['/bar.js'].lineData[219]++;
  if (visit20_219_1(!(visit21_219_2(backBtn && self._withTitle)))) {
    _$jscoverage['/bar.js'].lineData[220]++;
    if (visit22_220_1(self._withTitle)) {
      _$jscoverage['/bar.js'].lineData[221]++;
      self.get('titleEl').html(title);
    }
    _$jscoverage['/bar.js'].lineData[223]++;
    if (visit23_223_1(backBtn)) {
      _$jscoverage['/bar.js'].lineData[224]++;
      backBtn[hasPrevious ? 'show' : 'hide']();
    }
    _$jscoverage['/bar.js'].lineData[226]++;
    return;
  }
  _$jscoverage['/bar.js'].lineData[229]++;
  var backEl = backBtn.get('el');
  _$jscoverage['/bar.js'].lineData[230]++;
  backEl.stop(true);
  _$jscoverage['/bar.js'].lineData[231]++;
  if (visit24_231_1(self.ghostBackEl)) {
    _$jscoverage['/bar.js'].lineData[232]++;
    self.ghostBackEl.stop(true);
  }
  _$jscoverage['/bar.js'].lineData[234]++;
  var backElProps = {
  width: backEl[0].offsetWidth};
  _$jscoverage['/bar.js'].lineData[237]++;
  var ghostBackEl = createGhost(backEl);
  _$jscoverage['/bar.js'].lineData[238]++;
  self.ghostBackEl = ghostBackEl;
  _$jscoverage['/bar.js'].lineData[239]++;
  backEl.css('opacity', 0);
  _$jscoverage['/bar.js'].lineData[240]++;
  backBtn[hasPrevious ? 'show' : 'hide']();
  _$jscoverage['/bar.js'].lineData[241]++;
  if (visit25_241_1(self.ghostBackEl)) {
    _$jscoverage['/bar.js'].lineData[242]++;
    self.ghostBackEl.stop(true);
  }
  _$jscoverage['/bar.js'].lineData[244]++;
  var anims = getAnimProps(self, backEl, backElProps, reverse);
  _$jscoverage['/bar.js'].lineData[245]++;
  backEl.css(anims.back.element.from);
  _$jscoverage['/bar.js'].lineData[246]++;
  if (visit26_246_1(backBtn.get('visible'))) {
    _$jscoverage['/bar.js'].lineData[247]++;
    anim(backEl, anims.back.element.to);
  }
  _$jscoverage['/bar.js'].lineData[249]++;
  if (visit27_249_1(ghostBackEl.css('display') !== 'none')) {
    _$jscoverage['/bar.js'].lineData[250]++;
    anim(ghostBackEl, anims.back.ghost.to, function() {
  _$jscoverage['/bar.js'].functionData[17]++;
  _$jscoverage['/bar.js'].lineData[251]++;
  ghostBackEl.remove();
  _$jscoverage['/bar.js'].lineData[252]++;
  self.ghostBackEl = null;
});
  } else {
    _$jscoverage['/bar.js'].lineData[255]++;
    ghostBackEl.remove();
    _$jscoverage['/bar.js'].lineData[256]++;
    self.ghostBackEl = null;
  }
  _$jscoverage['/bar.js'].lineData[259]++;
  var titleEl = self.get('titleEl');
  _$jscoverage['/bar.js'].lineData[260]++;
  titleEl.stop(true);
  _$jscoverage['/bar.js'].lineData[261]++;
  var ghostTitleEl = createGhost(titleEl.parent());
  _$jscoverage['/bar.js'].lineData[262]++;
  self.ghostTitleEl = ghostTitleEl;
  _$jscoverage['/bar.js'].lineData[263]++;
  titleEl.css('opacity', 0);
  _$jscoverage['/bar.js'].lineData[264]++;
  self.set('title', title);
  _$jscoverage['/bar.js'].lineData[265]++;
  titleEl.css(anims.title.element.from);
  _$jscoverage['/bar.js'].lineData[266]++;
  anim(titleEl, anims.title.element.to);
  _$jscoverage['/bar.js'].lineData[267]++;
  anim(ghostTitleEl, anims.title.ghost.to, function() {
  _$jscoverage['/bar.js'].functionData[18]++;
  _$jscoverage['/bar.js'].lineData[268]++;
  ghostTitleEl.remove();
  _$jscoverage['/bar.js'].lineData[269]++;
  self.ghostTitleEl = null;
});
}, 
  backward: function(title) {
  _$jscoverage['/bar.js'].functionData[19]++;
  _$jscoverage['/bar.js'].lineData[274]++;
  if (visit28_274_1(this._stack.length)) {
    _$jscoverage['/bar.js'].lineData[275]++;
    this._stack.pop();
    _$jscoverage['/bar.js'].lineData[276]++;
    this.go(title, this._stack.length, true);
  }
}, 
  _onSetTitle: function(v) {
  _$jscoverage['/bar.js'].functionData[20]++;
  _$jscoverage['/bar.js'].lineData[281]++;
  var titleEl = this.get('titleEl');
  _$jscoverage['/bar.js'].lineData[282]++;
  if (visit29_282_1(titleEl)) {
    _$jscoverage['/bar.js'].lineData[283]++;
    titleEl.html(v);
  }
}, 
  _onSetBackText: function(v) {
  _$jscoverage['/bar.js'].functionData[21]++;
  _$jscoverage['/bar.js'].lineData[288]++;
  if (visit30_288_1(this._backBtn)) {
    _$jscoverage['/bar.js'].lineData[289]++;
    this._backBtn.set('content', v);
  }
}}, {
  xclass: 'navigation-bar', 
  ATTRS: {
  contentTpl: {
  value: tpl}, 
  handleGestureEvents: {
  value: false}, 
  focusable: {
  value: false}, 
  centerEl: {
  selector: function() {
  _$jscoverage['/bar.js'].functionData[22]++;
  _$jscoverage['/bar.js'].lineData[307]++;
  return '.' + this.getBaseCssClass('center');
}}, 
  contentEl: {
  selector: function() {
  _$jscoverage['/bar.js'].functionData[23]++;
  _$jscoverage['/bar.js'].lineData[312]++;
  return '.' + this.getBaseCssClass('content');
}}, 
  titleEl: {
  selector: function() {
  _$jscoverage['/bar.js'].functionData[24]++;
  _$jscoverage['/bar.js'].lineData[317]++;
  return '.' + this.getBaseCssClass('title');
}}, 
  title: {
  value: '', 
  render: 1, 
  sync: 0}, 
  withBackButton: {
  value: 1}, 
  withTitle: {
  value: 1, 
  render: 1, 
  sync: 0}, 
  backText: {
  value: 'Back', 
  render: 1, 
  sync: 0}}});
});
