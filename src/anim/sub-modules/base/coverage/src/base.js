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
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[39] = 0;
  _$jscoverage['/base.js'].lineData[40] = 0;
  _$jscoverage['/base.js'].lineData[43] = 0;
  _$jscoverage['/base.js'].lineData[44] = 0;
  _$jscoverage['/base.js'].lineData[48] = 0;
  _$jscoverage['/base.js'].lineData[57] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[107] = 0;
  _$jscoverage['/base.js'].lineData[109] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[132] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[149] = 0;
  _$jscoverage['/base.js'].lineData[150] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[158] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[238] = 0;
  _$jscoverage['/base.js'].lineData[242] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[248] = 0;
  _$jscoverage['/base.js'].lineData[252] = 0;
  _$jscoverage['/base.js'].lineData[261] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[270] = 0;
  _$jscoverage['/base.js'].lineData[271] = 0;
  _$jscoverage['/base.js'].lineData[273] = 0;
  _$jscoverage['/base.js'].lineData[275] = 0;
  _$jscoverage['/base.js'].lineData[278] = 0;
  _$jscoverage['/base.js'].lineData[279] = 0;
  _$jscoverage['/base.js'].lineData[280] = 0;
  _$jscoverage['/base.js'].lineData[281] = 0;
  _$jscoverage['/base.js'].lineData[283] = 0;
  _$jscoverage['/base.js'].lineData[284] = 0;
  _$jscoverage['/base.js'].lineData[285] = 0;
  _$jscoverage['/base.js'].lineData[288] = 0;
  _$jscoverage['/base.js'].lineData[290] = 0;
  _$jscoverage['/base.js'].lineData[291] = 0;
  _$jscoverage['/base.js'].lineData[292] = 0;
  _$jscoverage['/base.js'].lineData[295] = 0;
  _$jscoverage['/base.js'].lineData[296] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
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
  _$jscoverage['/base.js'].branchData['27'] = [];
  _$jscoverage['/base.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['34'] = [];
  _$jscoverage['/base.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['43'] = [];
  _$jscoverage['/base.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['64'] = [];
  _$jscoverage['/base.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['70'] = [];
  _$jscoverage['/base.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['78'] = [];
  _$jscoverage['/base.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'] = [];
  _$jscoverage['/base.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['96'] = [];
  _$jscoverage['/base.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['109'] = [];
  _$jscoverage['/base.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['110'] = [];
  _$jscoverage['/base.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['111'] = [];
  _$jscoverage['/base.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['120'] = [];
  _$jscoverage['/base.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['124'] = [];
  _$jscoverage['/base.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'] = [];
  _$jscoverage['/base.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['132'] = [];
  _$jscoverage['/base.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['135'] = [];
  _$jscoverage['/base.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['149'] = [];
  _$jscoverage['/base.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['184'] = [];
  _$jscoverage['/base.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['214'] = [];
  _$jscoverage['/base.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['242'] = [];
  _$jscoverage['/base.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['247'] = [];
  _$jscoverage['/base.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['266'] = [];
  _$jscoverage['/base.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['270'] = [];
  _$jscoverage['/base.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['271'] = [];
  _$jscoverage['/base.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['283'] = [];
  _$jscoverage['/base.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['288'] = [];
  _$jscoverage['/base.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['291'] = [];
  _$jscoverage['/base.js'].branchData['291'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['291'][1].init(129, 9, 'q && q[0]');
function visit64_291_1(result) {
  _$jscoverage['/base.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['288'][1].init(772, 15, 'queue !== false');
function visit63_288_1(result) {
  _$jscoverage['/base.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['283'][1].init(653, 6, 'finish');
function visit62_283_1(result) {
  _$jscoverage['/base.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['271'][1].init(22, 15, 'queue !== false');
function visit61_271_1(result) {
  _$jscoverage['/base.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['270'][1].init(231, 37, '!self.isRunning() && !self.isPaused()');
function visit60_270_1(result) {
  _$jscoverage['/base.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['266'][1].init(149, 14, 'self.__stopped');
function visit59_266_1(result) {
  _$jscoverage['/base.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['247'][1].init(107, 13, 'q.length == 1');
function visit58_247_1(result) {
  _$jscoverage['/base.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['242'][1].init(114, 15, 'queue === false');
function visit57_242_1(result) {
  _$jscoverage['/base.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['214'][1].init(48, 15, 'self.isPaused()');
function visit56_214_1(result) {
  _$jscoverage['/base.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['184'][1].init(48, 16, 'self.isRunning()');
function visit55_184_1(result) {
  _$jscoverage['/base.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['149'][1].init(2658, 14, 'exit === false');
function visit54_149_1(result) {
  _$jscoverage['/base.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['135'][1].init(562, 13, 'val == \'hide\'');
function visit53_135_1(result) {
  _$jscoverage['/base.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['132'][1].init(420, 15, 'val == \'toggle\'');
function visit52_132_1(result) {
  _$jscoverage['/base.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][5].init(57, 13, 'val == \'show\'');
function visit51_125_5(result) {
  _$jscoverage['/base.js'].branchData['125'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][4].init(57, 24, 'val == \'show\' && !hidden');
function visit50_125_4(result) {
  _$jscoverage['/base.js'].branchData['125'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][3].init(30, 13, 'val == \'hide\'');
function visit49_125_3(result) {
  _$jscoverage['/base.js'].branchData['125'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][2].init(30, 23, 'val == \'hide\' && hidden');
function visit48_125_2(result) {
  _$jscoverage['/base.js'].branchData['125'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][1].init(30, 51, 'val == \'hide\' && hidden || val == \'show\' && !hidden');
function visit47_125_1(result) {
  _$jscoverage['/base.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['124'][1].init(99, 16, 'specialVals[val]');
function visit46_124_1(result) {
  _$jscoverage['/base.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['120'][1].init(1321, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit45_120_1(result) {
  _$jscoverage['/base.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['111'][1].init(30, 10, 'S.UA[\'ie\']');
function visit44_111_1(result) {
  _$jscoverage['/base.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['110'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit43_110_1(result) {
  _$jscoverage['/base.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['109'][2].init(697, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit42_109_2(result) {
  _$jscoverage['/base.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['109'][1].init(697, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit41_109_1(result) {
  _$jscoverage['/base.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['96'][1].init(177, 21, 'to.width || to.height');
function visit40_96_1(result) {
  _$jscoverage['/base.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][1].init(1213, 38, 'node.nodeType == NodeType.ELEMENT_NODE');
function visit39_93_1(result) {
  _$jscoverage['/base.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['78'][1].init(22, 21, '!S.isPlainObject(val)');
function visit38_78_1(result) {
  _$jscoverage['/base.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['70'][1].init(467, 34, 'self.fire(\'beforeStart\') === false');
function visit37_70_1(result) {
  _$jscoverage['/base.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['64'][1].init(276, 17, 'config.delay || 0');
function visit36_64_1(result) {
  _$jscoverage['/base.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['43'][1].init(88, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit35_43_1(result) {
  _$jscoverage['/base.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['34'][1].init(426, 26, 'complete = config.complete');
function visit34_34_1(result) {
  _$jscoverage['/base.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['27'][1].init(231, 22, '!S.isPlainObject(node)');
function visit33_27_1(result) {
  _$jscoverage['/base.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add('anim/base', function(S, Dom, Utils, CustomEvent, Q) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var NodeType = Dom.NodeType, specialVals = {
  toggle: 1, 
  hide: 1, 
  show: 1};
  _$jscoverage['/base.js'].lineData[18]++;
  function AnimBase(config) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[19]++;
    var self = this, complete;
    _$jscoverage['/base.js'].lineData[25]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[26]++;
    var node = config.node;
    _$jscoverage['/base.js'].lineData[27]++;
    if (visit33_27_1(!S.isPlainObject(node))) {
      _$jscoverage['/base.js'].lineData[28]++;
      node = Dom.get(config.node);
    }
    _$jscoverage['/base.js'].lineData[30]++;
    self.node = self.el = node;
    _$jscoverage['/base.js'].lineData[31]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[32]++;
    self._propsData = {};
    _$jscoverage['/base.js'].lineData[34]++;
    if (visit34_34_1(complete = config.complete)) {
      _$jscoverage['/base.js'].lineData[35]++;
      self.on('complete', complete);
    }
  }
  _$jscoverage['/base.js'].lineData[39]++;
  function onComplete(self) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[40]++;
    var _backupProps;
    _$jscoverage['/base.js'].lineData[43]++;
    if (visit35_43_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[44]++;
      Dom.css(self.node, _backupProps);
    }
  }
  _$jscoverage['/base.js'].lineData[48]++;
  S.augment(AnimBase, CustomEvent.Target, {
  prepareFx: function() {
  _$jscoverage['/base.js'].functionData[3]++;
}, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[57]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit36_64_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[68]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[70]++;
  if (visit37_70_1(self.fire('beforeStart') === false)) {
    _$jscoverage['/base.js'].lineData[72]++;
    self.stop(0);
    _$jscoverage['/base.js'].lineData[73]++;
    return;
  }
  _$jscoverage['/base.js'].lineData[77]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[78]++;
  if (visit38_78_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[79]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[83]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[93]++;
  if (visit39_93_1(node.nodeType == NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[96]++;
    if (visit40_96_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[101]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[102]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[107]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[109]++;
      if (visit41_109_1(visit42_109_2(Dom.css(node, 'display') === 'inline') && visit43_110_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[111]++;
        if (visit44_111_1(S.UA['ie'])) {
          _$jscoverage['/base.js'].lineData[112]++;
          elStyle.zoom = 1;
        } else {
          _$jscoverage['/base.js'].lineData[114]++;
          elStyle.display = 'inline-block';
        }
      }
    }
    _$jscoverage['/base.js'].lineData[119]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[120]++;
    hidden = (visit45_120_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[121]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[122]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[124]++;
  if (visit46_124_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[125]++;
    if (visit47_125_1(visit48_125_2(visit49_125_3(val == 'hide') && hidden) || visit50_125_4(visit51_125_5(val == 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[127]++;
      self.stop(1);
      _$jscoverage['/base.js'].lineData[128]++;
      return exit = false;
    }
    _$jscoverage['/base.js'].lineData[131]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[132]++;
    if (visit52_132_1(val == 'toggle')) {
      _$jscoverage['/base.js'].lineData[133]++;
      val = hidden ? 'show' : 'hide';
    } else {
      _$jscoverage['/base.js'].lineData[135]++;
      if (visit53_135_1(val == 'hide')) {
        _$jscoverage['/base.js'].lineData[136]++;
        _propData.value = 0;
        _$jscoverage['/base.js'].lineData[138]++;
        _backupProps.display = 'none';
      } else {
        _$jscoverage['/base.js'].lineData[140]++;
        _propData.value = Dom.css(node, prop);
        _$jscoverage['/base.js'].lineData[142]++;
        Dom.css(node, prop, 0);
        _$jscoverage['/base.js'].lineData[143]++;
        Dom.show(node);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[146]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[149]++;
    if (visit54_149_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[150]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[154]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[156]++;
  self.prepareFx();
  _$jscoverage['/base.js'].lineData[158]++;
  self.doStart();
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[166]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[174]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[183]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[184]++;
  if (visit55_184_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[186]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[187]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[188]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[189]++;
    self.doStop();
  }
  _$jscoverage['/base.js'].lineData[191]++;
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
  _$jscoverage['/base.js'].lineData[213]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[214]++;
  if (visit56_214_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[216]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[217]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[218]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[219]++;
    self['beforeResume']();
    _$jscoverage['/base.js'].lineData[220]++;
    self.doStart();
  }
  _$jscoverage['/base.js'].lineData[222]++;
  return self;
}, 
  'beforeResume': function() {
  _$jscoverage['/base.js'].functionData[13]++;
}, 
  run: function() {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[238]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[242]++;
  if (visit57_242_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[243]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[246]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[247]++;
    if (visit58_247_1(q.length == 1)) {
      _$jscoverage['/base.js'].lineData[248]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[252]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[261]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[266]++;
  if (visit59_266_1(self.__stopped)) {
    _$jscoverage['/base.js'].lineData[267]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[270]++;
  if (visit60_270_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[271]++;
    if (visit61_271_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[273]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[275]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[278]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[279]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[280]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[281]++;
  self.__stopped = 1;
  _$jscoverage['/base.js'].lineData[283]++;
  if (visit62_283_1(finish)) {
    _$jscoverage['/base.js'].lineData[284]++;
    onComplete(self);
    _$jscoverage['/base.js'].lineData[285]++;
    self.fire('complete');
  }
  _$jscoverage['/base.js'].lineData[288]++;
  if (visit63_288_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[290]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[291]++;
    if (visit64_291_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[292]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[295]++;
  self.fire('end');
  _$jscoverage['/base.js'].lineData[296]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[300]++;
  AnimBase.Utils = Utils;
  _$jscoverage['/base.js'].lineData[301]++;
  AnimBase.Q = Q;
  _$jscoverage['/base.js'].lineData[303]++;
  return AnimBase;
}, {
  requires: ['dom', './base/utils', 'event/custom', './base/queue']});
