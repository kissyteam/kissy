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
if (! _$jscoverage['/util/object.js']) {
  _$jscoverage['/util/object.js'] = {};
  _$jscoverage['/util/object.js'].lineData = [];
  _$jscoverage['/util/object.js'].lineData[7] = 0;
  _$jscoverage['/util/object.js'].lineData[8] = 0;
  _$jscoverage['/util/object.js'].lineData[9] = 0;
  _$jscoverage['/util/object.js'].lineData[18] = 0;
  _$jscoverage['/util/object.js'].lineData[28] = 0;
  _$jscoverage['/util/object.js'].lineData[29] = 0;
  _$jscoverage['/util/object.js'].lineData[30] = 0;
  _$jscoverage['/util/object.js'].lineData[31] = 0;
  _$jscoverage['/util/object.js'].lineData[32] = 0;
  _$jscoverage['/util/object.js'].lineData[33] = 0;
  _$jscoverage['/util/object.js'].lineData[34] = 0;
  _$jscoverage['/util/object.js'].lineData[37] = 0;
  _$jscoverage['/util/object.js'].lineData[40] = 0;
  _$jscoverage['/util/object.js'].lineData[65] = 0;
  _$jscoverage['/util/object.js'].lineData[66] = 0;
  _$jscoverage['/util/object.js'].lineData[70] = 0;
  _$jscoverage['/util/object.js'].lineData[71] = 0;
  _$jscoverage['/util/object.js'].lineData[74] = 0;
  _$jscoverage['/util/object.js'].lineData[75] = 0;
  _$jscoverage['/util/object.js'].lineData[76] = 0;
  _$jscoverage['/util/object.js'].lineData[77] = 0;
  _$jscoverage['/util/object.js'].lineData[81] = 0;
  _$jscoverage['/util/object.js'].lineData[82] = 0;
  _$jscoverage['/util/object.js'].lineData[85] = 0;
  _$jscoverage['/util/object.js'].lineData[88] = 0;
  _$jscoverage['/util/object.js'].lineData[89] = 0;
  _$jscoverage['/util/object.js'].lineData[90] = 0;
  _$jscoverage['/util/object.js'].lineData[92] = 0;
  _$jscoverage['/util/object.js'].lineData[105] = 0;
  _$jscoverage['/util/object.js'].lineData[106] = 0;
  _$jscoverage['/util/object.js'].lineData[109] = 0;
  _$jscoverage['/util/object.js'].lineData[110] = 0;
  _$jscoverage['/util/object.js'].lineData[112] = 0;
  _$jscoverage['/util/object.js'].lineData[125] = 0;
  _$jscoverage['/util/object.js'].lineData[133] = 0;
  _$jscoverage['/util/object.js'].lineData[135] = 0;
  _$jscoverage['/util/object.js'].lineData[136] = 0;
  _$jscoverage['/util/object.js'].lineData[137] = 0;
  _$jscoverage['/util/object.js'].lineData[138] = 0;
  _$jscoverage['/util/object.js'].lineData[140] = 0;
  _$jscoverage['/util/object.js'].lineData[141] = 0;
  _$jscoverage['/util/object.js'].lineData[142] = 0;
  _$jscoverage['/util/object.js'].lineData[145] = 0;
  _$jscoverage['/util/object.js'].lineData[146] = 0;
  _$jscoverage['/util/object.js'].lineData[147] = 0;
  _$jscoverage['/util/object.js'].lineData[148] = 0;
  _$jscoverage['/util/object.js'].lineData[150] = 0;
  _$jscoverage['/util/object.js'].lineData[153] = 0;
  _$jscoverage['/util/object.js'].lineData[168] = 0;
  _$jscoverage['/util/object.js'].lineData[169] = 0;
  _$jscoverage['/util/object.js'].lineData[170] = 0;
  _$jscoverage['/util/object.js'].lineData[172] = 0;
  _$jscoverage['/util/object.js'].lineData[173] = 0;
  _$jscoverage['/util/object.js'].lineData[175] = 0;
  _$jscoverage['/util/object.js'].lineData[176] = 0;
  _$jscoverage['/util/object.js'].lineData[180] = 0;
  _$jscoverage['/util/object.js'].lineData[185] = 0;
  _$jscoverage['/util/object.js'].lineData[188] = 0;
  _$jscoverage['/util/object.js'].lineData[189] = 0;
  _$jscoverage['/util/object.js'].lineData[190] = 0;
  _$jscoverage['/util/object.js'].lineData[193] = 0;
  _$jscoverage['/util/object.js'].lineData[194] = 0;
  _$jscoverage['/util/object.js'].lineData[198] = 0;
  _$jscoverage['/util/object.js'].lineData[199] = 0;
  _$jscoverage['/util/object.js'].lineData[202] = 0;
  _$jscoverage['/util/object.js'].lineData[219] = 0;
  _$jscoverage['/util/object.js'].lineData[224] = 0;
  _$jscoverage['/util/object.js'].lineData[225] = 0;
  _$jscoverage['/util/object.js'].lineData[226] = 0;
  _$jscoverage['/util/object.js'].lineData[227] = 0;
  _$jscoverage['/util/object.js'].lineData[228] = 0;
  _$jscoverage['/util/object.js'].lineData[231] = 0;
  _$jscoverage['/util/object.js'].lineData[235] = 0;
  _$jscoverage['/util/object.js'].lineData[238] = 0;
  _$jscoverage['/util/object.js'].lineData[239] = 0;
  _$jscoverage['/util/object.js'].lineData[240] = 0;
  _$jscoverage['/util/object.js'].lineData[241] = 0;
  _$jscoverage['/util/object.js'].lineData[243] = 0;
  _$jscoverage['/util/object.js'].lineData[244] = 0;
  _$jscoverage['/util/object.js'].lineData[246] = 0;
  _$jscoverage['/util/object.js'].lineData[247] = 0;
  _$jscoverage['/util/object.js'].lineData[250] = 0;
  _$jscoverage['/util/object.js'].lineData[251] = 0;
  _$jscoverage['/util/object.js'].lineData[252] = 0;
  _$jscoverage['/util/object.js'].lineData[256] = 0;
  _$jscoverage['/util/object.js'].lineData[257] = 0;
  _$jscoverage['/util/object.js'].lineData[258] = 0;
  _$jscoverage['/util/object.js'].lineData[260] = 0;
  _$jscoverage['/util/object.js'].lineData[263] = 0;
  _$jscoverage['/util/object.js'].lineData[266] = 0;
  _$jscoverage['/util/object.js'].lineData[269] = 0;
  _$jscoverage['/util/object.js'].lineData[270] = 0;
  _$jscoverage['/util/object.js'].lineData[271] = 0;
  _$jscoverage['/util/object.js'].lineData[272] = 0;
  _$jscoverage['/util/object.js'].lineData[273] = 0;
  _$jscoverage['/util/object.js'].lineData[275] = 0;
  _$jscoverage['/util/object.js'].lineData[279] = 0;
  _$jscoverage['/util/object.js'].lineData[282] = 0;
  _$jscoverage['/util/object.js'].lineData[283] = 0;
  _$jscoverage['/util/object.js'].lineData[286] = 0;
  _$jscoverage['/util/object.js'].lineData[290] = 0;
  _$jscoverage['/util/object.js'].lineData[291] = 0;
  _$jscoverage['/util/object.js'].lineData[294] = 0;
  _$jscoverage['/util/object.js'].lineData[296] = 0;
  _$jscoverage['/util/object.js'].lineData[297] = 0;
  _$jscoverage['/util/object.js'].lineData[299] = 0;
  _$jscoverage['/util/object.js'].lineData[301] = 0;
  _$jscoverage['/util/object.js'].lineData[302] = 0;
  _$jscoverage['/util/object.js'].lineData[305] = 0;
  _$jscoverage['/util/object.js'].lineData[306] = 0;
  _$jscoverage['/util/object.js'].lineData[307] = 0;
  _$jscoverage['/util/object.js'].lineData[311] = 0;
  _$jscoverage['/util/object.js'].lineData[314] = 0;
  _$jscoverage['/util/object.js'].lineData[315] = 0;
  _$jscoverage['/util/object.js'].lineData[317] = 0;
  _$jscoverage['/util/object.js'].lineData[318] = 0;
}
if (! _$jscoverage['/util/object.js'].functionData) {
  _$jscoverage['/util/object.js'].functionData = [];
  _$jscoverage['/util/object.js'].functionData[0] = 0;
  _$jscoverage['/util/object.js'].functionData[1] = 0;
  _$jscoverage['/util/object.js'].functionData[2] = 0;
  _$jscoverage['/util/object.js'].functionData[3] = 0;
  _$jscoverage['/util/object.js'].functionData[4] = 0;
  _$jscoverage['/util/object.js'].functionData[5] = 0;
  _$jscoverage['/util/object.js'].functionData[6] = 0;
  _$jscoverage['/util/object.js'].functionData[7] = 0;
  _$jscoverage['/util/object.js'].functionData[8] = 0;
  _$jscoverage['/util/object.js'].functionData[9] = 0;
  _$jscoverage['/util/object.js'].functionData[10] = 0;
  _$jscoverage['/util/object.js'].functionData[11] = 0;
  _$jscoverage['/util/object.js'].functionData[12] = 0;
  _$jscoverage['/util/object.js'].functionData[13] = 0;
}
if (! _$jscoverage['/util/object.js'].branchData) {
  _$jscoverage['/util/object.js'].branchData = {};
  _$jscoverage['/util/object.js'].branchData['28'] = [];
  _$jscoverage['/util/object.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['30'] = [];
  _$jscoverage['/util/object.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['32'] = [];
  _$jscoverage['/util/object.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['65'] = [];
  _$jscoverage['/util/object.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['74'] = [];
  _$jscoverage['/util/object.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['81'] = [];
  _$jscoverage['/util/object.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['109'] = [];
  _$jscoverage['/util/object.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['135'] = [];
  _$jscoverage['/util/object.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['140'] = [];
  _$jscoverage['/util/object.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['145'] = [];
  _$jscoverage['/util/object.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['168'] = [];
  _$jscoverage['/util/object.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['169'] = [];
  _$jscoverage['/util/object.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['172'] = [];
  _$jscoverage['/util/object.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['175'] = [];
  _$jscoverage['/util/object.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['193'] = [];
  _$jscoverage['/util/object.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['198'] = [];
  _$jscoverage['/util/object.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['222'] = [];
  _$jscoverage['/util/object.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['222'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['224'] = [];
  _$jscoverage['/util/object.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['227'] = [];
  _$jscoverage['/util/object.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['227'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['228'] = [];
  _$jscoverage['/util/object.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['240'] = [];
  _$jscoverage['/util/object.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['257'] = [];
  _$jscoverage['/util/object.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['271'] = [];
  _$jscoverage['/util/object.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['273'] = [];
  _$jscoverage['/util/object.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['283'] = [];
  _$jscoverage['/util/object.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['290'] = [];
  _$jscoverage['/util/object.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['290'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['294'] = [];
  _$jscoverage['/util/object.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['296'] = [];
  _$jscoverage['/util/object.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['301'] = [];
  _$jscoverage['/util/object.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['305'] = [];
  _$jscoverage['/util/object.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['305'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['305'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['306'] = [];
  _$jscoverage['/util/object.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['311'] = [];
  _$jscoverage['/util/object.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['311'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['317'] = [];
  _$jscoverage['/util/object.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['317'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['317'][3] = new BranchData();
}
_$jscoverage['/util/object.js'].branchData['317'][3].init(1062, 15, 'ov || !(p in r)');
function visit113_317_3(result) {
  _$jscoverage['/util/object.js'].branchData['317'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['317'][2].init(1040, 17, 'src !== undefined');
function visit112_317_2(result) {
  _$jscoverage['/util/object.js'].branchData['317'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['317'][1].init(1040, 38, 'src !== undefined && (ov || !(p in r))');
function visit111_317_1(result) {
  _$jscoverage['/util/object.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['311'][2].init(136, 44, 'S.isArray(target) || S.isPlainObject(target)');
function visit110_311_2(result) {
  _$jscoverage['/util/object.js'].branchData['311'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['311'][1].init(125, 56, 'target && (S.isArray(target) || S.isPlainObject(target))');
function visit109_311_1(result) {
  _$jscoverage['/util/object.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['306'][1].init(21, 27, 'src[MIX_CIRCULAR_DETECTION]');
function visit108_306_1(result) {
  _$jscoverage['/util/object.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['305'][3].init(455, 38, 'S.isArray(src) || S.isPlainObject(src)');
function visit107_305_3(result) {
  _$jscoverage['/util/object.js'].branchData['305'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['305'][2].init(447, 47, 'src && (S.isArray(src) || S.isPlainObject(src))');
function visit106_305_2(result) {
  _$jscoverage['/util/object.js'].branchData['305'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['305'][1].init(439, 55, 'deep && src && (S.isArray(src) || S.isPlainObject(src))');
function visit105_305_1(result) {
  _$jscoverage['/util/object.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['301'][1].init(326, 2, 'wl');
function visit104_301_1(result) {
  _$jscoverage['/util/object.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['296'][1].init(64, 20, 'target === undefined');
function visit103_296_1(result) {
  _$jscoverage['/util/object.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['294'][1].init(114, 14, 'target === src');
function visit102_294_1(result) {
  _$jscoverage['/util/object.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['290'][2].init(73, 17, '!(p in r) || deep');
function visit101_290_2(result) {
  _$jscoverage['/util/object.js'].branchData['290'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['290'][1].init(67, 23, 'ov || !(p in r) || deep');
function visit100_290_1(result) {
  _$jscoverage['/util/object.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['283'][1].init(16, 19, 'k === \'constructor\'');
function visit99_283_1(result) {
  _$jscoverage['/util/object.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['273'][1].init(42, 28, 'p !== MIX_CIRCULAR_DETECTION');
function visit98_273_1(result) {
  _$jscoverage['/util/object.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['271'][1].init(297, 7, 'i < len');
function visit97_271_1(result) {
  _$jscoverage['/util/object.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['257'][1].init(13, 8, '!s || !r');
function visit96_257_1(result) {
  _$jscoverage['/util/object.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['240'][1].init(35, 12, 'objectCreate');
function visit95_240_1(result) {
  _$jscoverage['/util/object.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['228'][1].init(35, 13, 'o[p[j]] || {}');
function visit94_228_1(result) {
  _$jscoverage['/util/object.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['227'][2].init(146, 12, 'j < p.length');
function visit93_227_2(result) {
  _$jscoverage['/util/object.js'].branchData['227'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['227'][1].init(119, 16, 'host[p[0]] === o');
function visit92_227_1(result) {
  _$jscoverage['/util/object.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['224'][1].init(197, 5, 'i < l');
function visit91_224_1(result) {
  _$jscoverage['/util/object.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['222'][2].init(128, 20, 'args[l - 1] === TRUE');
function visit90_222_2(result) {
  _$jscoverage['/util/object.js'].branchData['222'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['222'][1].init(128, 27, 'args[l - 1] === TRUE && l--');
function visit89_222_1(result) {
  _$jscoverage['/util/object.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['198'][1].init(818, 2, 'sx');
function visit88_198_1(result) {
  _$jscoverage['/util/object.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['193'][1].init(714, 2, 'px');
function visit87_193_1(result) {
  _$jscoverage['/util/object.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['175'][1].init(217, 8, '!s || !r');
function visit86_175_1(result) {
  _$jscoverage['/util/object.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['172'][1].init(119, 2, '!s');
function visit85_172_1(result) {
  _$jscoverage['/util/object.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['169'][1].init(21, 2, '!r');
function visit84_169_1(result) {
  _$jscoverage['/util/object.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['168'][1].init(17, 9, '\'@DEBUG@\'');
function visit83_168_1(result) {
  _$jscoverage['/util/object.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['145'][1].init(515, 7, 'i < len');
function visit82_145_1(result) {
  _$jscoverage['/util/object.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['140'][1].init(399, 23, 'typeof ov !== \'boolean\'');
function visit81_140_1(result) {
  _$jscoverage['/util/object.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['135'][1].init(271, 14, '!S.isArray(wl)');
function visit80_135_1(result) {
  _$jscoverage['/util/object.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['109'][1].init(150, 5, 'i < l');
function visit79_109_1(result) {
  _$jscoverage['/util/object.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['81'][1].init(508, 16, 'ov === undefined');
function visit78_81_1(result) {
  _$jscoverage['/util/object.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['74'][2].init(274, 24, 'typeof wl !== \'function\'');
function visit77_74_2(result) {
  _$jscoverage['/util/object.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['74'][1].init(267, 32, 'wl && (typeof wl !== \'function\')');
function visit76_74_1(result) {
  _$jscoverage['/util/object.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['65'][1].init(17, 22, 'typeof ov === \'object\'');
function visit75_65_1(result) {
  _$jscoverage['/util/object.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['32'][1].init(157, 9, '!readOnly');
function visit74_32_1(result) {
  _$jscoverage['/util/object.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['30'][1].init(96, 4, 'guid');
function visit73_30_1(result) {
  _$jscoverage['/util/object.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['28'][1].init(22, 22, 'marker || STAMP_MARKER');
function visit72_28_1(result) {
  _$jscoverage['/util/object.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].lineData[7]++;
KISSY.add(function(S, undefined) {
  _$jscoverage['/util/object.js'].functionData[0]++;
  _$jscoverage['/util/object.js'].lineData[8]++;
  var logger = S.getLogger('s/util');
  _$jscoverage['/util/object.js'].lineData[9]++;
  var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR', STAMP_MARKER = '__~ks_stamped', host = S.Env.host, TRUE = true, EMPTY = '', Obj = Object, objectCreate = Obj.create;
  _$jscoverage['/util/object.js'].lineData[18]++;
  mix(S, {
  stamp: function(o, readOnly, marker) {
  _$jscoverage['/util/object.js'].functionData[1]++;
  _$jscoverage['/util/object.js'].lineData[28]++;
  marker = visit72_28_1(marker || STAMP_MARKER);
  _$jscoverage['/util/object.js'].lineData[29]++;
  var guid = o[marker];
  _$jscoverage['/util/object.js'].lineData[30]++;
  if (visit73_30_1(guid)) {
    _$jscoverage['/util/object.js'].lineData[31]++;
    return guid;
  } else {
    _$jscoverage['/util/object.js'].lineData[32]++;
    if (visit74_32_1(!readOnly)) {
      _$jscoverage['/util/object.js'].lineData[33]++;
      try {
        _$jscoverage['/util/object.js'].lineData[34]++;
        guid = o[marker] = S.guid(marker);
      }      catch (e) {
  _$jscoverage['/util/object.js'].lineData[37]++;
  guid = undefined;
}
    }
  }
  _$jscoverage['/util/object.js'].lineData[40]++;
  return guid;
}, 
  mix: function(r, s, ov, wl, deep) {
  _$jscoverage['/util/object.js'].functionData[2]++;
  _$jscoverage['/util/object.js'].lineData[65]++;
  if (visit75_65_1(typeof ov === 'object')) {
    _$jscoverage['/util/object.js'].lineData[66]++;
    wl = ov.whitelist;
    _$jscoverage['/util/object.js'].lineData[70]++;
    deep = ov.deep;
    _$jscoverage['/util/object.js'].lineData[71]++;
    ov = ov.overwrite;
  }
  _$jscoverage['/util/object.js'].lineData[74]++;
  if (visit76_74_1(wl && (visit77_74_2(typeof wl !== 'function')))) {
    _$jscoverage['/util/object.js'].lineData[75]++;
    var originalWl = wl;
    _$jscoverage['/util/object.js'].lineData[76]++;
    wl = function(name, val) {
  _$jscoverage['/util/object.js'].functionData[3]++;
  _$jscoverage['/util/object.js'].lineData[77]++;
  return S.inArray(name, originalWl) ? val : undefined;
};
  }
  _$jscoverage['/util/object.js'].lineData[81]++;
  if (visit78_81_1(ov === undefined)) {
    _$jscoverage['/util/object.js'].lineData[82]++;
    ov = TRUE;
  }
  _$jscoverage['/util/object.js'].lineData[85]++;
  var cache = [], c, i = 0;
  _$jscoverage['/util/object.js'].lineData[88]++;
  mixInternal(r, s, ov, wl, deep, cache);
  _$jscoverage['/util/object.js'].lineData[89]++;
  while ((c = cache[i++])) {
    _$jscoverage['/util/object.js'].lineData[90]++;
    delete c[MIX_CIRCULAR_DETECTION];
  }
  _$jscoverage['/util/object.js'].lineData[92]++;
  return r;
}, 
  merge: function(varArgs) {
  _$jscoverage['/util/object.js'].functionData[4]++;
  _$jscoverage['/util/object.js'].lineData[105]++;
  varArgs = S.makeArray(arguments);
  _$jscoverage['/util/object.js'].lineData[106]++;
  var o = {}, i, l = varArgs.length;
  _$jscoverage['/util/object.js'].lineData[109]++;
  for (i = 0; visit79_109_1(i < l); i++) {
    _$jscoverage['/util/object.js'].lineData[110]++;
    S.mix(o, varArgs[i]);
  }
  _$jscoverage['/util/object.js'].lineData[112]++;
  return o;
}, 
  augment: function(r, varArgs) {
  _$jscoverage['/util/object.js'].functionData[5]++;
  _$jscoverage['/util/object.js'].lineData[125]++;
  var args = S.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
  _$jscoverage['/util/object.js'].lineData[133]++;
  args[1] = varArgs;
  _$jscoverage['/util/object.js'].lineData[135]++;
  if (visit80_135_1(!S.isArray(wl))) {
    _$jscoverage['/util/object.js'].lineData[136]++;
    ov = wl;
    _$jscoverage['/util/object.js'].lineData[137]++;
    wl = undefined;
    _$jscoverage['/util/object.js'].lineData[138]++;
    len++;
  }
  _$jscoverage['/util/object.js'].lineData[140]++;
  if (visit81_140_1(typeof ov !== 'boolean')) {
    _$jscoverage['/util/object.js'].lineData[141]++;
    ov = undefined;
    _$jscoverage['/util/object.js'].lineData[142]++;
    len++;
  }
  _$jscoverage['/util/object.js'].lineData[145]++;
  for (; visit82_145_1(i < len); i++) {
    _$jscoverage['/util/object.js'].lineData[146]++;
    arg = args[i];
    _$jscoverage['/util/object.js'].lineData[147]++;
    if ((proto = arg.prototype)) {
      _$jscoverage['/util/object.js'].lineData[148]++;
      arg = S.mix({}, proto, true, removeConstructor);
    }
    _$jscoverage['/util/object.js'].lineData[150]++;
    S.mix(r.prototype, arg, ov, wl);
  }
  _$jscoverage['/util/object.js'].lineData[153]++;
  return r;
}, 
  extend: function(r, s, px, sx) {
  _$jscoverage['/util/object.js'].functionData[6]++;
  _$jscoverage['/util/object.js'].lineData[168]++;
  if (visit83_168_1('@DEBUG@')) {
    _$jscoverage['/util/object.js'].lineData[169]++;
    if (visit84_169_1(!r)) {
      _$jscoverage['/util/object.js'].lineData[170]++;
      logger.error('extend r is null');
    }
    _$jscoverage['/util/object.js'].lineData[172]++;
    if (visit85_172_1(!s)) {
      _$jscoverage['/util/object.js'].lineData[173]++;
      logger.error('extend s is null');
    }
    _$jscoverage['/util/object.js'].lineData[175]++;
    if (visit86_175_1(!s || !r)) {
      _$jscoverage['/util/object.js'].lineData[176]++;
      return r;
    }
  }
  _$jscoverage['/util/object.js'].lineData[180]++;
  var sp = s.prototype, rp;
  _$jscoverage['/util/object.js'].lineData[185]++;
  sp.constructor = s;
  _$jscoverage['/util/object.js'].lineData[188]++;
  rp = createObject(sp, r);
  _$jscoverage['/util/object.js'].lineData[189]++;
  r.prototype = S.mix(rp, r.prototype);
  _$jscoverage['/util/object.js'].lineData[190]++;
  r.superclass = sp;
  _$jscoverage['/util/object.js'].lineData[193]++;
  if (visit87_193_1(px)) {
    _$jscoverage['/util/object.js'].lineData[194]++;
    S.mix(rp, px);
  }
  _$jscoverage['/util/object.js'].lineData[198]++;
  if (visit88_198_1(sx)) {
    _$jscoverage['/util/object.js'].lineData[199]++;
    S.mix(r, sx);
  }
  _$jscoverage['/util/object.js'].lineData[202]++;
  return r;
}, 
  namespace: function() {
  _$jscoverage['/util/object.js'].functionData[7]++;
  _$jscoverage['/util/object.js'].lineData[219]++;
  var args = S.makeArray(arguments), l = args.length, o = null, i, j, p, global = (visit89_222_1(visit90_222_2(args[l - 1] === TRUE) && l--));
  _$jscoverage['/util/object.js'].lineData[224]++;
  for (i = 0; visit91_224_1(i < l); i++) {
    _$jscoverage['/util/object.js'].lineData[225]++;
    p = (EMPTY + args[i]).split('.');
    _$jscoverage['/util/object.js'].lineData[226]++;
    o = global ? host : this;
    _$jscoverage['/util/object.js'].lineData[227]++;
    for (j = (visit92_227_1(host[p[0]] === o)) ? 1 : 0; visit93_227_2(j < p.length); ++j) {
      _$jscoverage['/util/object.js'].lineData[228]++;
      o = o[p[j]] = visit94_228_1(o[p[j]] || {});
    }
  }
  _$jscoverage['/util/object.js'].lineData[231]++;
  return o;
}});
  _$jscoverage['/util/object.js'].lineData[235]++;
  function Empty() {
    _$jscoverage['/util/object.js'].functionData[8]++;
  }
  _$jscoverage['/util/object.js'].lineData[238]++;
  function createObject(proto, constructor) {
    _$jscoverage['/util/object.js'].functionData[9]++;
    _$jscoverage['/util/object.js'].lineData[239]++;
    var newProto;
    _$jscoverage['/util/object.js'].lineData[240]++;
    if (visit95_240_1(objectCreate)) {
      _$jscoverage['/util/object.js'].lineData[241]++;
      newProto = objectCreate(proto);
    } else {
      _$jscoverage['/util/object.js'].lineData[243]++;
      Empty.prototype = proto;
      _$jscoverage['/util/object.js'].lineData[244]++;
      newProto = new Empty();
    }
    _$jscoverage['/util/object.js'].lineData[246]++;
    newProto.constructor = constructor;
    _$jscoverage['/util/object.js'].lineData[247]++;
    return newProto;
  }
  _$jscoverage['/util/object.js'].lineData[250]++;
  function mix(r, s) {
    _$jscoverage['/util/object.js'].functionData[10]++;
    _$jscoverage['/util/object.js'].lineData[251]++;
    for (var i in s) {
      _$jscoverage['/util/object.js'].lineData[252]++;
      r[i] = s[i];
    }
  }
  _$jscoverage['/util/object.js'].lineData[256]++;
  function mixInternal(r, s, ov, wl, deep, cache) {
    _$jscoverage['/util/object.js'].functionData[11]++;
    _$jscoverage['/util/object.js'].lineData[257]++;
    if (visit96_257_1(!s || !r)) {
      _$jscoverage['/util/object.js'].lineData[258]++;
      return r;
    }
    _$jscoverage['/util/object.js'].lineData[260]++;
    var i, p, keys, len;
    _$jscoverage['/util/object.js'].lineData[263]++;
    s[MIX_CIRCULAR_DETECTION] = r;
    _$jscoverage['/util/object.js'].lineData[266]++;
    cache.push(s);
    _$jscoverage['/util/object.js'].lineData[269]++;
    keys = S.keys(s);
    _$jscoverage['/util/object.js'].lineData[270]++;
    len = keys.length;
    _$jscoverage['/util/object.js'].lineData[271]++;
    for (i = 0; visit97_271_1(i < len); i++) {
      _$jscoverage['/util/object.js'].lineData[272]++;
      p = keys[i];
      _$jscoverage['/util/object.js'].lineData[273]++;
      if (visit98_273_1(p !== MIX_CIRCULAR_DETECTION)) {
        _$jscoverage['/util/object.js'].lineData[275]++;
        _mix(p, r, s, ov, wl, deep, cache);
      }
    }
    _$jscoverage['/util/object.js'].lineData[279]++;
    return r;
  }
  _$jscoverage['/util/object.js'].lineData[282]++;
  function removeConstructor(k, v) {
    _$jscoverage['/util/object.js'].functionData[12]++;
    _$jscoverage['/util/object.js'].lineData[283]++;
    return visit99_283_1(k === 'constructor') ? undefined : v;
  }
  _$jscoverage['/util/object.js'].lineData[286]++;
  function _mix(p, r, s, ov, wl, deep, cache) {
    _$jscoverage['/util/object.js'].functionData[13]++;
    _$jscoverage['/util/object.js'].lineData[290]++;
    if (visit100_290_1(ov || visit101_290_2(!(p in r) || deep))) {
      _$jscoverage['/util/object.js'].lineData[291]++;
      var target = r[p], src = s[p];
      _$jscoverage['/util/object.js'].lineData[294]++;
      if (visit102_294_1(target === src)) {
        _$jscoverage['/util/object.js'].lineData[296]++;
        if (visit103_296_1(target === undefined)) {
          _$jscoverage['/util/object.js'].lineData[297]++;
          r[p] = target;
        }
        _$jscoverage['/util/object.js'].lineData[299]++;
        return;
      }
      _$jscoverage['/util/object.js'].lineData[301]++;
      if (visit104_301_1(wl)) {
        _$jscoverage['/util/object.js'].lineData[302]++;
        src = wl.call(s, p, src);
      }
      _$jscoverage['/util/object.js'].lineData[305]++;
      if (visit105_305_1(deep && visit106_305_2(src && (visit107_305_3(S.isArray(src) || S.isPlainObject(src)))))) {
        _$jscoverage['/util/object.js'].lineData[306]++;
        if (visit108_306_1(src[MIX_CIRCULAR_DETECTION])) {
          _$jscoverage['/util/object.js'].lineData[307]++;
          r[p] = src[MIX_CIRCULAR_DETECTION];
        } else {
          _$jscoverage['/util/object.js'].lineData[311]++;
          var clone = visit109_311_1(target && (visit110_311_2(S.isArray(target) || S.isPlainObject(target)))) ? target : (S.isArray(src) ? [] : {});
          _$jscoverage['/util/object.js'].lineData[314]++;
          r[p] = clone;
          _$jscoverage['/util/object.js'].lineData[315]++;
          mixInternal(clone, src, ov, wl, TRUE, cache);
        }
      } else {
        _$jscoverage['/util/object.js'].lineData[317]++;
        if (visit111_317_1(visit112_317_2(src !== undefined) && (visit113_317_3(ov || !(p in r))))) {
          _$jscoverage['/util/object.js'].lineData[318]++;
          r[p] = src;
        }
      }
    }
  }
});
