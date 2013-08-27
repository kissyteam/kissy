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
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[37] = 0;
  _$jscoverage['/base.js'].lineData[38] = 0;
  _$jscoverage['/base.js'].lineData[41] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[46] = 0;
  _$jscoverage['/base.js'].lineData[55] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[95] = 0;
  _$jscoverage['/base.js'].lineData[100] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[126] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[130] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[132] = 0;
  _$jscoverage['/base.js'].lineData[134] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[137] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[149] = 0;
  _$jscoverage['/base.js'].lineData[153] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[185] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[237] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[242] = 0;
  _$jscoverage['/base.js'].lineData[245] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[260] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[270] = 0;
  _$jscoverage['/base.js'].lineData[273] = 0;
  _$jscoverage['/base.js'].lineData[274] = 0;
  _$jscoverage['/base.js'].lineData[275] = 0;
  _$jscoverage['/base.js'].lineData[276] = 0;
  _$jscoverage['/base.js'].lineData[277] = 0;
  _$jscoverage['/base.js'].lineData[278] = 0;
  _$jscoverage['/base.js'].lineData[280] = 0;
  _$jscoverage['/base.js'].lineData[282] = 0;
  _$jscoverage['/base.js'].lineData[283] = 0;
  _$jscoverage['/base.js'].lineData[284] = 0;
  _$jscoverage['/base.js'].lineData[287] = 0;
  _$jscoverage['/base.js'].lineData[288] = 0;
  _$jscoverage['/base.js'].lineData[292] = 0;
  _$jscoverage['/base.js'].lineData[293] = 0;
  _$jscoverage['/base.js'].lineData[295] = 0;
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
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['32'] = [];
  _$jscoverage['/base.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['41'] = [];
  _$jscoverage['/base.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['62'] = [];
  _$jscoverage['/base.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['68'] = [];
  _$jscoverage['/base.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['76'] = [];
  _$jscoverage['/base.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['91'] = [];
  _$jscoverage['/base.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['95'] = [];
  _$jscoverage['/base.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['108'] = [];
  _$jscoverage['/base.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['109'] = [];
  _$jscoverage['/base.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['110'] = [];
  _$jscoverage['/base.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'] = [];
  _$jscoverage['/base.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['123'] = [];
  _$jscoverage['/base.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['124'] = [];
  _$jscoverage['/base.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['124'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['124'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['124'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['124'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'] = [];
  _$jscoverage['/base.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['134'] = [];
  _$jscoverage['/base.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['148'] = [];
  _$jscoverage['/base.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['183'] = [];
  _$jscoverage['/base.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['213'] = [];
  _$jscoverage['/base.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['241'] = [];
  _$jscoverage['/base.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['246'] = [];
  _$jscoverage['/base.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['265'] = [];
  _$jscoverage['/base.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['266'] = [];
  _$jscoverage['/base.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['276'] = [];
  _$jscoverage['/base.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['280'] = [];
  _$jscoverage['/base.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['283'] = [];
  _$jscoverage['/base.js'].branchData['283'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['283'][1].init(129, 9, 'q && q[0]');
function visit62_283_1(result) {
  _$jscoverage['/base.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['280'][1].init(653, 15, 'queue !== false');
function visit61_280_1(result) {
  _$jscoverage['/base.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['276'][1].init(536, 6, 'finish');
function visit60_276_1(result) {
  _$jscoverage['/base.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['266'][1].init(22, 15, 'queue !== false');
function visit59_266_1(result) {
  _$jscoverage['/base.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['265'][1].init(149, 37, '!self.isRunning() && !self.isPaused()');
function visit58_265_1(result) {
  _$jscoverage['/base.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['246'][1].init(107, 13, 'q.length == 1');
function visit57_246_1(result) {
  _$jscoverage['/base.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['241'][1].init(114, 15, 'queue === false');
function visit56_241_1(result) {
  _$jscoverage['/base.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['213'][1].init(48, 15, 'self.isPaused()');
function visit55_213_1(result) {
  _$jscoverage['/base.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['183'][1].init(48, 16, 'self.isRunning()');
function visit54_183_1(result) {
  _$jscoverage['/base.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['148'][1].init(2660, 14, 'exit === false');
function visit53_148_1(result) {
  _$jscoverage['/base.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['134'][1].init(562, 13, 'val == \'hide\'');
function visit52_134_1(result) {
  _$jscoverage['/base.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][1].init(420, 15, 'val == \'toggle\'');
function visit51_131_1(result) {
  _$jscoverage['/base.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['124'][5].init(57, 13, 'val == \'show\'');
function visit50_124_5(result) {
  _$jscoverage['/base.js'].branchData['124'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['124'][4].init(57, 24, 'val == \'show\' && !hidden');
function visit49_124_4(result) {
  _$jscoverage['/base.js'].branchData['124'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['124'][3].init(30, 13, 'val == \'hide\'');
function visit48_124_3(result) {
  _$jscoverage['/base.js'].branchData['124'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['124'][2].init(30, 23, 'val == \'hide\' && hidden');
function visit47_124_2(result) {
  _$jscoverage['/base.js'].branchData['124'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['124'][1].init(30, 51, 'val == \'hide\' && hidden || val == \'show\' && !hidden');
function visit46_124_1(result) {
  _$jscoverage['/base.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['123'][1].init(99, 16, 'specialVals[val]');
function visit45_123_1(result) {
  _$jscoverage['/base.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][1].init(1323, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit44_119_1(result) {
  _$jscoverage['/base.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['110'][1].init(30, 10, 'S.UA[\'ie\']');
function visit43_110_1(result) {
  _$jscoverage['/base.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['109'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit42_109_1(result) {
  _$jscoverage['/base.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['108'][2].init(697, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit41_108_2(result) {
  _$jscoverage['/base.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['108'][1].init(697, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit40_108_1(result) {
  _$jscoverage['/base.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['95'][1].init(179, 21, 'to.width || to.height');
function visit39_95_1(result) {
  _$jscoverage['/base.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['91'][1].init(1213, 38, 'node.nodeType == NodeType.ELEMENT_NODE');
function visit38_91_1(result) {
  _$jscoverage['/base.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['76'][1].init(22, 21, '!S.isPlainObject(val)');
function visit37_76_1(result) {
  _$jscoverage['/base.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['68'][1].init(467, 34, 'self.fire(\'beforeStart\') === false');
function visit36_68_1(result) {
  _$jscoverage['/base.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['62'][1].init(276, 17, 'config.delay || 0');
function visit35_62_1(result) {
  _$jscoverage['/base.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['41'][1].init(88, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit34_41_1(result) {
  _$jscoverage['/base.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['32'][1].init(334, 26, 'complete = config.complete');
function visit33_32_1(result) {
  _$jscoverage['/base.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add('anim/base', function(S, Dom, Utils, CustomEvent, Q) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[8]++;
  var NodeType = Dom.NodeType;
  _$jscoverage['/base.js'].lineData[9]++;
  var specialVals = {
  toggle: 1, 
  hide: 1, 
  show: 1};
  _$jscoverage['/base.js'].lineData[19]++;
  function AnimBase(config) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[20]++;
    var self = this, complete;
    _$jscoverage['/base.js'].lineData[26]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[27]++;
    self.node = self.el = Dom.get(config.node);
    _$jscoverage['/base.js'].lineData[29]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[30]++;
    self._propsData = {};
    _$jscoverage['/base.js'].lineData[32]++;
    if (visit33_32_1(complete = config.complete)) {
      _$jscoverage['/base.js'].lineData[33]++;
      self.on('complete', complete);
    }
  }
  _$jscoverage['/base.js'].lineData[37]++;
  function onComplete(self) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[38]++;
    var _backupProps;
    _$jscoverage['/base.js'].lineData[41]++;
    if (visit34_41_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[42]++;
      Dom.css(self.node, _backupProps);
    }
  }
  _$jscoverage['/base.js'].lineData[46]++;
  S.augment(AnimBase, CustomEvent.Target, {
  prepareFx: function() {
  _$jscoverage['/base.js'].functionData[3]++;
}, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[55]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit35_62_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[66]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[68]++;
  if (visit36_68_1(self.fire('beforeStart') === false)) {
    _$jscoverage['/base.js'].lineData[70]++;
    self.stop(0);
    _$jscoverage['/base.js'].lineData[71]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[75]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[76]++;
  if (visit37_76_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[77]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[81]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[91]++;
  if (visit38_91_1(node.nodeType == NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[95]++;
    if (visit39_95_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[100]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[101]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[106]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[108]++;
      if (visit40_108_1(visit41_108_2(Dom.css(node, 'display') === 'inline') && visit42_109_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[110]++;
        if (visit43_110_1(S.UA['ie'])) {
          _$jscoverage['/base.js'].lineData[111]++;
          elStyle.zoom = 1;
        } else {
          _$jscoverage['/base.js'].lineData[113]++;
          elStyle.display = 'inline-block';
        }
      }
    }
    _$jscoverage['/base.js'].lineData[118]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[119]++;
    hidden = (visit44_119_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[120]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[121]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[123]++;
  if (visit45_123_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[124]++;
    if (visit46_124_1(visit47_124_2(visit48_124_3(val == 'hide') && hidden) || visit49_124_4(visit50_124_5(val == 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[126]++;
      self.stop(1);
      _$jscoverage['/base.js'].lineData[127]++;
      return exit = false;
    }
    _$jscoverage['/base.js'].lineData[130]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[131]++;
    if (visit51_131_1(val == 'toggle')) {
      _$jscoverage['/base.js'].lineData[132]++;
      val = hidden ? 'show' : 'hide';
    } else {
      _$jscoverage['/base.js'].lineData[134]++;
      if (visit52_134_1(val == 'hide')) {
        _$jscoverage['/base.js'].lineData[135]++;
        _propData.value = 0;
        _$jscoverage['/base.js'].lineData[137]++;
        _backupProps.display = 'none';
      } else {
        _$jscoverage['/base.js'].lineData[139]++;
        _propData.value = Dom.css(node, prop);
        _$jscoverage['/base.js'].lineData[141]++;
        Dom.css(node, prop, 0);
        _$jscoverage['/base.js'].lineData[142]++;
        Dom.show(node);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[145]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[148]++;
    if (visit53_148_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[149]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[153]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[155]++;
  self.prepareFx();
  _$jscoverage['/base.js'].lineData[157]++;
  self.doStart();
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[165]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[173]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[182]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[183]++;
  if (visit54_183_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[185]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[186]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[187]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[188]++;
    self.doStop();
  }
  _$jscoverage['/base.js'].lineData[190]++;
  return self;
}, 
  doStop: function() {
  _$jscoverage['/base.js'].functionData[10]++;
}, 
  doStart: function() {
  _$jscoverage['/base.js'].functionData[11]++;
}, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[212]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[213]++;
  if (visit55_213_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[215]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[216]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[217]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[218]++;
    self['beforeResume']();
    _$jscoverage['/base.js'].lineData[219]++;
    self.doStart();
  }
  _$jscoverage['/base.js'].lineData[221]++;
  return self;
}, 
  'beforeResume': function() {
  _$jscoverage['/base.js'].functionData[13]++;
}, 
  run: function() {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[237]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[241]++;
  if (visit56_241_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[242]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[245]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[246]++;
    if (visit57_246_1(q.length == 1)) {
      _$jscoverage['/base.js'].lineData[247]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[251]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[260]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[265]++;
  if (visit58_265_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[266]++;
    if (visit59_266_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[268]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[270]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[273]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[274]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[275]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[276]++;
  if (visit60_276_1(finish)) {
    _$jscoverage['/base.js'].lineData[277]++;
    onComplete(self);
    _$jscoverage['/base.js'].lineData[278]++;
    self.fire('complete');
  }
  _$jscoverage['/base.js'].lineData[280]++;
  if (visit61_280_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[282]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[283]++;
    if (visit62_283_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[284]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[287]++;
  self.fire('end');
  _$jscoverage['/base.js'].lineData[288]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[292]++;
  AnimBase.Utils = Utils;
  _$jscoverage['/base.js'].lineData[293]++;
  AnimBase.Q = Q;
  _$jscoverage['/base.js'].lineData[295]++;
  return AnimBase;
}, {
  requires: ['dom', './base/utils', 'event/custom', './base/queue']});
