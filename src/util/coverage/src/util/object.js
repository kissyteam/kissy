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
  _$jscoverage['/util/object.js'].lineData[17] = 0;
  _$jscoverage['/util/object.js'].lineData[27] = 0;
  _$jscoverage['/util/object.js'].lineData[28] = 0;
  _$jscoverage['/util/object.js'].lineData[29] = 0;
  _$jscoverage['/util/object.js'].lineData[30] = 0;
  _$jscoverage['/util/object.js'].lineData[31] = 0;
  _$jscoverage['/util/object.js'].lineData[32] = 0;
  _$jscoverage['/util/object.js'].lineData[33] = 0;
  _$jscoverage['/util/object.js'].lineData[36] = 0;
  _$jscoverage['/util/object.js'].lineData[39] = 0;
  _$jscoverage['/util/object.js'].lineData[64] = 0;
  _$jscoverage['/util/object.js'].lineData[65] = 0;
  _$jscoverage['/util/object.js'].lineData[69] = 0;
  _$jscoverage['/util/object.js'].lineData[70] = 0;
  _$jscoverage['/util/object.js'].lineData[73] = 0;
  _$jscoverage['/util/object.js'].lineData[74] = 0;
  _$jscoverage['/util/object.js'].lineData[75] = 0;
  _$jscoverage['/util/object.js'].lineData[76] = 0;
  _$jscoverage['/util/object.js'].lineData[80] = 0;
  _$jscoverage['/util/object.js'].lineData[81] = 0;
  _$jscoverage['/util/object.js'].lineData[84] = 0;
  _$jscoverage['/util/object.js'].lineData[87] = 0;
  _$jscoverage['/util/object.js'].lineData[88] = 0;
  _$jscoverage['/util/object.js'].lineData[89] = 0;
  _$jscoverage['/util/object.js'].lineData[91] = 0;
  _$jscoverage['/util/object.js'].lineData[104] = 0;
  _$jscoverage['/util/object.js'].lineData[105] = 0;
  _$jscoverage['/util/object.js'].lineData[108] = 0;
  _$jscoverage['/util/object.js'].lineData[109] = 0;
  _$jscoverage['/util/object.js'].lineData[111] = 0;
  _$jscoverage['/util/object.js'].lineData[124] = 0;
  _$jscoverage['/util/object.js'].lineData[132] = 0;
  _$jscoverage['/util/object.js'].lineData[134] = 0;
  _$jscoverage['/util/object.js'].lineData[135] = 0;
  _$jscoverage['/util/object.js'].lineData[136] = 0;
  _$jscoverage['/util/object.js'].lineData[137] = 0;
  _$jscoverage['/util/object.js'].lineData[139] = 0;
  _$jscoverage['/util/object.js'].lineData[140] = 0;
  _$jscoverage['/util/object.js'].lineData[141] = 0;
  _$jscoverage['/util/object.js'].lineData[144] = 0;
  _$jscoverage['/util/object.js'].lineData[145] = 0;
  _$jscoverage['/util/object.js'].lineData[146] = 0;
  _$jscoverage['/util/object.js'].lineData[147] = 0;
  _$jscoverage['/util/object.js'].lineData[149] = 0;
  _$jscoverage['/util/object.js'].lineData[152] = 0;
  _$jscoverage['/util/object.js'].lineData[167] = 0;
  _$jscoverage['/util/object.js'].lineData[168] = 0;
  _$jscoverage['/util/object.js'].lineData[169] = 0;
  _$jscoverage['/util/object.js'].lineData[171] = 0;
  _$jscoverage['/util/object.js'].lineData[172] = 0;
  _$jscoverage['/util/object.js'].lineData[174] = 0;
  _$jscoverage['/util/object.js'].lineData[175] = 0;
  _$jscoverage['/util/object.js'].lineData[179] = 0;
  _$jscoverage['/util/object.js'].lineData[184] = 0;
  _$jscoverage['/util/object.js'].lineData[187] = 0;
  _$jscoverage['/util/object.js'].lineData[188] = 0;
  _$jscoverage['/util/object.js'].lineData[189] = 0;
  _$jscoverage['/util/object.js'].lineData[192] = 0;
  _$jscoverage['/util/object.js'].lineData[193] = 0;
  _$jscoverage['/util/object.js'].lineData[197] = 0;
  _$jscoverage['/util/object.js'].lineData[198] = 0;
  _$jscoverage['/util/object.js'].lineData[201] = 0;
  _$jscoverage['/util/object.js'].lineData[218] = 0;
  _$jscoverage['/util/object.js'].lineData[223] = 0;
  _$jscoverage['/util/object.js'].lineData[224] = 0;
  _$jscoverage['/util/object.js'].lineData[225] = 0;
  _$jscoverage['/util/object.js'].lineData[226] = 0;
  _$jscoverage['/util/object.js'].lineData[227] = 0;
  _$jscoverage['/util/object.js'].lineData[230] = 0;
  _$jscoverage['/util/object.js'].lineData[234] = 0;
  _$jscoverage['/util/object.js'].lineData[237] = 0;
  _$jscoverage['/util/object.js'].lineData[238] = 0;
  _$jscoverage['/util/object.js'].lineData[239] = 0;
  _$jscoverage['/util/object.js'].lineData[240] = 0;
  _$jscoverage['/util/object.js'].lineData[242] = 0;
  _$jscoverage['/util/object.js'].lineData[243] = 0;
  _$jscoverage['/util/object.js'].lineData[245] = 0;
  _$jscoverage['/util/object.js'].lineData[246] = 0;
  _$jscoverage['/util/object.js'].lineData[249] = 0;
  _$jscoverage['/util/object.js'].lineData[250] = 0;
  _$jscoverage['/util/object.js'].lineData[251] = 0;
  _$jscoverage['/util/object.js'].lineData[255] = 0;
  _$jscoverage['/util/object.js'].lineData[256] = 0;
  _$jscoverage['/util/object.js'].lineData[257] = 0;
  _$jscoverage['/util/object.js'].lineData[259] = 0;
  _$jscoverage['/util/object.js'].lineData[262] = 0;
  _$jscoverage['/util/object.js'].lineData[265] = 0;
  _$jscoverage['/util/object.js'].lineData[268] = 0;
  _$jscoverage['/util/object.js'].lineData[269] = 0;
  _$jscoverage['/util/object.js'].lineData[270] = 0;
  _$jscoverage['/util/object.js'].lineData[271] = 0;
  _$jscoverage['/util/object.js'].lineData[272] = 0;
  _$jscoverage['/util/object.js'].lineData[274] = 0;
  _$jscoverage['/util/object.js'].lineData[278] = 0;
  _$jscoverage['/util/object.js'].lineData[281] = 0;
  _$jscoverage['/util/object.js'].lineData[282] = 0;
  _$jscoverage['/util/object.js'].lineData[285] = 0;
  _$jscoverage['/util/object.js'].lineData[289] = 0;
  _$jscoverage['/util/object.js'].lineData[290] = 0;
  _$jscoverage['/util/object.js'].lineData[293] = 0;
  _$jscoverage['/util/object.js'].lineData[295] = 0;
  _$jscoverage['/util/object.js'].lineData[296] = 0;
  _$jscoverage['/util/object.js'].lineData[298] = 0;
  _$jscoverage['/util/object.js'].lineData[300] = 0;
  _$jscoverage['/util/object.js'].lineData[301] = 0;
  _$jscoverage['/util/object.js'].lineData[304] = 0;
  _$jscoverage['/util/object.js'].lineData[305] = 0;
  _$jscoverage['/util/object.js'].lineData[306] = 0;
  _$jscoverage['/util/object.js'].lineData[310] = 0;
  _$jscoverage['/util/object.js'].lineData[313] = 0;
  _$jscoverage['/util/object.js'].lineData[314] = 0;
  _$jscoverage['/util/object.js'].lineData[316] = 0;
  _$jscoverage['/util/object.js'].lineData[317] = 0;
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
  _$jscoverage['/util/object.js'].branchData['27'] = [];
  _$jscoverage['/util/object.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['29'] = [];
  _$jscoverage['/util/object.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['31'] = [];
  _$jscoverage['/util/object.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['64'] = [];
  _$jscoverage['/util/object.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['73'] = [];
  _$jscoverage['/util/object.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['73'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['80'] = [];
  _$jscoverage['/util/object.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['108'] = [];
  _$jscoverage['/util/object.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['134'] = [];
  _$jscoverage['/util/object.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['139'] = [];
  _$jscoverage['/util/object.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['144'] = [];
  _$jscoverage['/util/object.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['167'] = [];
  _$jscoverage['/util/object.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['168'] = [];
  _$jscoverage['/util/object.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['171'] = [];
  _$jscoverage['/util/object.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['174'] = [];
  _$jscoverage['/util/object.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['192'] = [];
  _$jscoverage['/util/object.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['197'] = [];
  _$jscoverage['/util/object.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['221'] = [];
  _$jscoverage['/util/object.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['221'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['223'] = [];
  _$jscoverage['/util/object.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['226'] = [];
  _$jscoverage['/util/object.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['226'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['227'] = [];
  _$jscoverage['/util/object.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['239'] = [];
  _$jscoverage['/util/object.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['256'] = [];
  _$jscoverage['/util/object.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['270'] = [];
  _$jscoverage['/util/object.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['272'] = [];
  _$jscoverage['/util/object.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['282'] = [];
  _$jscoverage['/util/object.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['289'] = [];
  _$jscoverage['/util/object.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['289'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['293'] = [];
  _$jscoverage['/util/object.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['295'] = [];
  _$jscoverage['/util/object.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['300'] = [];
  _$jscoverage['/util/object.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['304'] = [];
  _$jscoverage['/util/object.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['304'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['304'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['305'] = [];
  _$jscoverage['/util/object.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['310'] = [];
  _$jscoverage['/util/object.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['310'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['316'] = [];
  _$jscoverage['/util/object.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['316'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['316'][3] = new BranchData();
}
_$jscoverage['/util/object.js'].branchData['316'][3].init(1062, 15, 'ov || !(p in r)');
function visit118_316_3(result) {
  _$jscoverage['/util/object.js'].branchData['316'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['316'][2].init(1040, 17, 'src !== undefined');
function visit117_316_2(result) {
  _$jscoverage['/util/object.js'].branchData['316'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['316'][1].init(1040, 38, 'src !== undefined && (ov || !(p in r))');
function visit116_316_1(result) {
  _$jscoverage['/util/object.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['310'][2].init(136, 44, 'S.isArray(target) || S.isPlainObject(target)');
function visit115_310_2(result) {
  _$jscoverage['/util/object.js'].branchData['310'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['310'][1].init(125, 56, 'target && (S.isArray(target) || S.isPlainObject(target))');
function visit114_310_1(result) {
  _$jscoverage['/util/object.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['305'][1].init(21, 27, 'src[MIX_CIRCULAR_DETECTION]');
function visit113_305_1(result) {
  _$jscoverage['/util/object.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['304'][3].init(455, 38, 'S.isArray(src) || S.isPlainObject(src)');
function visit112_304_3(result) {
  _$jscoverage['/util/object.js'].branchData['304'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['304'][2].init(447, 47, 'src && (S.isArray(src) || S.isPlainObject(src))');
function visit111_304_2(result) {
  _$jscoverage['/util/object.js'].branchData['304'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['304'][1].init(439, 55, 'deep && src && (S.isArray(src) || S.isPlainObject(src))');
function visit110_304_1(result) {
  _$jscoverage['/util/object.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['300'][1].init(326, 2, 'wl');
function visit109_300_1(result) {
  _$jscoverage['/util/object.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['295'][1].init(64, 20, 'target === undefined');
function visit108_295_1(result) {
  _$jscoverage['/util/object.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['293'][1].init(114, 14, 'target === src');
function visit107_293_1(result) {
  _$jscoverage['/util/object.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['289'][2].init(73, 17, '!(p in r) || deep');
function visit106_289_2(result) {
  _$jscoverage['/util/object.js'].branchData['289'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['289'][1].init(67, 23, 'ov || !(p in r) || deep');
function visit105_289_1(result) {
  _$jscoverage['/util/object.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['282'][1].init(16, 19, 'k === \'constructor\'');
function visit104_282_1(result) {
  _$jscoverage['/util/object.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['272'][1].init(42, 28, 'p !== MIX_CIRCULAR_DETECTION');
function visit103_272_1(result) {
  _$jscoverage['/util/object.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['270'][1].init(297, 7, 'i < len');
function visit102_270_1(result) {
  _$jscoverage['/util/object.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['256'][1].init(13, 8, '!s || !r');
function visit101_256_1(result) {
  _$jscoverage['/util/object.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['239'][1].init(35, 12, 'objectCreate');
function visit100_239_1(result) {
  _$jscoverage['/util/object.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['227'][1].init(35, 13, 'o[p[j]] || {}');
function visit99_227_1(result) {
  _$jscoverage['/util/object.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['226'][2].init(146, 12, 'j < p.length');
function visit98_226_2(result) {
  _$jscoverage['/util/object.js'].branchData['226'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['226'][1].init(119, 16, 'host[p[0]] === o');
function visit97_226_1(result) {
  _$jscoverage['/util/object.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['223'][1].init(197, 5, 'i < l');
function visit96_223_1(result) {
  _$jscoverage['/util/object.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['221'][2].init(128, 20, 'args[l - 1] === TRUE');
function visit95_221_2(result) {
  _$jscoverage['/util/object.js'].branchData['221'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['221'][1].init(128, 27, 'args[l - 1] === TRUE && l--');
function visit94_221_1(result) {
  _$jscoverage['/util/object.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['197'][1].init(818, 2, 'sx');
function visit93_197_1(result) {
  _$jscoverage['/util/object.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['192'][1].init(714, 2, 'px');
function visit92_192_1(result) {
  _$jscoverage['/util/object.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['174'][1].init(217, 8, '!s || !r');
function visit91_174_1(result) {
  _$jscoverage['/util/object.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['171'][1].init(119, 2, '!s');
function visit90_171_1(result) {
  _$jscoverage['/util/object.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['168'][1].init(21, 2, '!r');
function visit89_168_1(result) {
  _$jscoverage['/util/object.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['167'][1].init(17, 9, '\'@DEBUG@\'');
function visit88_167_1(result) {
  _$jscoverage['/util/object.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['144'][1].init(515, 7, 'i < len');
function visit87_144_1(result) {
  _$jscoverage['/util/object.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['139'][1].init(399, 23, 'typeof ov !== \'boolean\'');
function visit86_139_1(result) {
  _$jscoverage['/util/object.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['134'][1].init(271, 14, '!S.isArray(wl)');
function visit85_134_1(result) {
  _$jscoverage['/util/object.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['108'][1].init(150, 5, 'i < l');
function visit84_108_1(result) {
  _$jscoverage['/util/object.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['80'][1].init(508, 16, 'ov === undefined');
function visit83_80_1(result) {
  _$jscoverage['/util/object.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['73'][2].init(274, 24, 'typeof wl !== \'function\'');
function visit82_73_2(result) {
  _$jscoverage['/util/object.js'].branchData['73'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['73'][1].init(267, 32, 'wl && (typeof wl !== \'function\')');
function visit81_73_1(result) {
  _$jscoverage['/util/object.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['64'][1].init(17, 22, 'typeof ov === \'object\'');
function visit80_64_1(result) {
  _$jscoverage['/util/object.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['31'][1].init(157, 9, '!readOnly');
function visit79_31_1(result) {
  _$jscoverage['/util/object.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['29'][1].init(96, 4, 'guid');
function visit78_29_1(result) {
  _$jscoverage['/util/object.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['27'][1].init(22, 22, 'marker || STAMP_MARKER');
function visit77_27_1(result) {
  _$jscoverage['/util/object.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].lineData[7]++;
KISSY.add(function(S, undefined) {
  _$jscoverage['/util/object.js'].functionData[0]++;
  _$jscoverage['/util/object.js'].lineData[8]++;
  var logger = S.getLogger('s/util');
  _$jscoverage['/util/object.js'].lineData[9]++;
  var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR', STAMP_MARKER = '__~ks_stamped', host = S.Env.host, TRUE = true, EMPTY = '', Obj = Object, objectCreate = Obj.create;
  _$jscoverage['/util/object.js'].lineData[17]++;
  mix(S, {
  stamp: function(o, readOnly, marker) {
  _$jscoverage['/util/object.js'].functionData[1]++;
  _$jscoverage['/util/object.js'].lineData[27]++;
  marker = visit77_27_1(marker || STAMP_MARKER);
  _$jscoverage['/util/object.js'].lineData[28]++;
  var guid = o[marker];
  _$jscoverage['/util/object.js'].lineData[29]++;
  if (visit78_29_1(guid)) {
    _$jscoverage['/util/object.js'].lineData[30]++;
    return guid;
  } else {
    _$jscoverage['/util/object.js'].lineData[31]++;
    if (visit79_31_1(!readOnly)) {
      _$jscoverage['/util/object.js'].lineData[32]++;
      try {
        _$jscoverage['/util/object.js'].lineData[33]++;
        guid = o[marker] = S.guid(marker);
      }      catch (e) {
  _$jscoverage['/util/object.js'].lineData[36]++;
  guid = undefined;
}
    }
  }
  _$jscoverage['/util/object.js'].lineData[39]++;
  return guid;
}, 
  mix: function(r, s, ov, wl, deep) {
  _$jscoverage['/util/object.js'].functionData[2]++;
  _$jscoverage['/util/object.js'].lineData[64]++;
  if (visit80_64_1(typeof ov === 'object')) {
    _$jscoverage['/util/object.js'].lineData[65]++;
    wl = ov.whitelist;
    _$jscoverage['/util/object.js'].lineData[69]++;
    deep = ov.deep;
    _$jscoverage['/util/object.js'].lineData[70]++;
    ov = ov.overwrite;
  }
  _$jscoverage['/util/object.js'].lineData[73]++;
  if (visit81_73_1(wl && (visit82_73_2(typeof wl !== 'function')))) {
    _$jscoverage['/util/object.js'].lineData[74]++;
    var originalWl = wl;
    _$jscoverage['/util/object.js'].lineData[75]++;
    wl = function(name, val) {
  _$jscoverage['/util/object.js'].functionData[3]++;
  _$jscoverage['/util/object.js'].lineData[76]++;
  return S.inArray(name, originalWl) ? val : undefined;
};
  }
  _$jscoverage['/util/object.js'].lineData[80]++;
  if (visit83_80_1(ov === undefined)) {
    _$jscoverage['/util/object.js'].lineData[81]++;
    ov = TRUE;
  }
  _$jscoverage['/util/object.js'].lineData[84]++;
  var cache = [], c, i = 0;
  _$jscoverage['/util/object.js'].lineData[87]++;
  mixInternal(r, s, ov, wl, deep, cache);
  _$jscoverage['/util/object.js'].lineData[88]++;
  while ((c = cache[i++])) {
    _$jscoverage['/util/object.js'].lineData[89]++;
    delete c[MIX_CIRCULAR_DETECTION];
  }
  _$jscoverage['/util/object.js'].lineData[91]++;
  return r;
}, 
  merge: function(varArgs) {
  _$jscoverage['/util/object.js'].functionData[4]++;
  _$jscoverage['/util/object.js'].lineData[104]++;
  varArgs = S.makeArray(arguments);
  _$jscoverage['/util/object.js'].lineData[105]++;
  var o = {}, i, l = varArgs.length;
  _$jscoverage['/util/object.js'].lineData[108]++;
  for (i = 0; visit84_108_1(i < l); i++) {
    _$jscoverage['/util/object.js'].lineData[109]++;
    S.mix(o, varArgs[i]);
  }
  _$jscoverage['/util/object.js'].lineData[111]++;
  return o;
}, 
  augment: function(r, varArgs) {
  _$jscoverage['/util/object.js'].functionData[5]++;
  _$jscoverage['/util/object.js'].lineData[124]++;
  var args = S.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
  _$jscoverage['/util/object.js'].lineData[132]++;
  args[1] = varArgs;
  _$jscoverage['/util/object.js'].lineData[134]++;
  if (visit85_134_1(!S.isArray(wl))) {
    _$jscoverage['/util/object.js'].lineData[135]++;
    ov = wl;
    _$jscoverage['/util/object.js'].lineData[136]++;
    wl = undefined;
    _$jscoverage['/util/object.js'].lineData[137]++;
    len++;
  }
  _$jscoverage['/util/object.js'].lineData[139]++;
  if (visit86_139_1(typeof ov !== 'boolean')) {
    _$jscoverage['/util/object.js'].lineData[140]++;
    ov = undefined;
    _$jscoverage['/util/object.js'].lineData[141]++;
    len++;
  }
  _$jscoverage['/util/object.js'].lineData[144]++;
  for (; visit87_144_1(i < len); i++) {
    _$jscoverage['/util/object.js'].lineData[145]++;
    arg = args[i];
    _$jscoverage['/util/object.js'].lineData[146]++;
    if ((proto = arg.prototype)) {
      _$jscoverage['/util/object.js'].lineData[147]++;
      arg = S.mix({}, proto, true, removeConstructor);
    }
    _$jscoverage['/util/object.js'].lineData[149]++;
    S.mix(r.prototype, arg, ov, wl);
  }
  _$jscoverage['/util/object.js'].lineData[152]++;
  return r;
}, 
  extend: function(r, s, px, sx) {
  _$jscoverage['/util/object.js'].functionData[6]++;
  _$jscoverage['/util/object.js'].lineData[167]++;
  if (visit88_167_1('@DEBUG@')) {
    _$jscoverage['/util/object.js'].lineData[168]++;
    if (visit89_168_1(!r)) {
      _$jscoverage['/util/object.js'].lineData[169]++;
      logger.error('extend r is null');
    }
    _$jscoverage['/util/object.js'].lineData[171]++;
    if (visit90_171_1(!s)) {
      _$jscoverage['/util/object.js'].lineData[172]++;
      logger.error('extend s is null');
    }
    _$jscoverage['/util/object.js'].lineData[174]++;
    if (visit91_174_1(!s || !r)) {
      _$jscoverage['/util/object.js'].lineData[175]++;
      return r;
    }
  }
  _$jscoverage['/util/object.js'].lineData[179]++;
  var sp = s.prototype, rp;
  _$jscoverage['/util/object.js'].lineData[184]++;
  sp.constructor = s;
  _$jscoverage['/util/object.js'].lineData[187]++;
  rp = createObject(sp, r);
  _$jscoverage['/util/object.js'].lineData[188]++;
  r.prototype = S.mix(rp, r.prototype);
  _$jscoverage['/util/object.js'].lineData[189]++;
  r.superclass = sp;
  _$jscoverage['/util/object.js'].lineData[192]++;
  if (visit92_192_1(px)) {
    _$jscoverage['/util/object.js'].lineData[193]++;
    S.mix(rp, px);
  }
  _$jscoverage['/util/object.js'].lineData[197]++;
  if (visit93_197_1(sx)) {
    _$jscoverage['/util/object.js'].lineData[198]++;
    S.mix(r, sx);
  }
  _$jscoverage['/util/object.js'].lineData[201]++;
  return r;
}, 
  namespace: function() {
  _$jscoverage['/util/object.js'].functionData[7]++;
  _$jscoverage['/util/object.js'].lineData[218]++;
  var args = S.makeArray(arguments), l = args.length, o = null, i, j, p, global = (visit94_221_1(visit95_221_2(args[l - 1] === TRUE) && l--));
  _$jscoverage['/util/object.js'].lineData[223]++;
  for (i = 0; visit96_223_1(i < l); i++) {
    _$jscoverage['/util/object.js'].lineData[224]++;
    p = (EMPTY + args[i]).split('.');
    _$jscoverage['/util/object.js'].lineData[225]++;
    o = global ? host : this;
    _$jscoverage['/util/object.js'].lineData[226]++;
    for (j = (visit97_226_1(host[p[0]] === o)) ? 1 : 0; visit98_226_2(j < p.length); ++j) {
      _$jscoverage['/util/object.js'].lineData[227]++;
      o = o[p[j]] = visit99_227_1(o[p[j]] || {});
    }
  }
  _$jscoverage['/util/object.js'].lineData[230]++;
  return o;
}});
  _$jscoverage['/util/object.js'].lineData[234]++;
  function Empty() {
    _$jscoverage['/util/object.js'].functionData[8]++;
  }
  _$jscoverage['/util/object.js'].lineData[237]++;
  function createObject(proto, constructor) {
    _$jscoverage['/util/object.js'].functionData[9]++;
    _$jscoverage['/util/object.js'].lineData[238]++;
    var newProto;
    _$jscoverage['/util/object.js'].lineData[239]++;
    if (visit100_239_1(objectCreate)) {
      _$jscoverage['/util/object.js'].lineData[240]++;
      newProto = objectCreate(proto);
    } else {
      _$jscoverage['/util/object.js'].lineData[242]++;
      Empty.prototype = proto;
      _$jscoverage['/util/object.js'].lineData[243]++;
      newProto = new Empty();
    }
    _$jscoverage['/util/object.js'].lineData[245]++;
    newProto.constructor = constructor;
    _$jscoverage['/util/object.js'].lineData[246]++;
    return newProto;
  }
  _$jscoverage['/util/object.js'].lineData[249]++;
  function mix(r, s) {
    _$jscoverage['/util/object.js'].functionData[10]++;
    _$jscoverage['/util/object.js'].lineData[250]++;
    for (var i in s) {
      _$jscoverage['/util/object.js'].lineData[251]++;
      r[i] = s[i];
    }
  }
  _$jscoverage['/util/object.js'].lineData[255]++;
  function mixInternal(r, s, ov, wl, deep, cache) {
    _$jscoverage['/util/object.js'].functionData[11]++;
    _$jscoverage['/util/object.js'].lineData[256]++;
    if (visit101_256_1(!s || !r)) {
      _$jscoverage['/util/object.js'].lineData[257]++;
      return r;
    }
    _$jscoverage['/util/object.js'].lineData[259]++;
    var i, p, keys, len;
    _$jscoverage['/util/object.js'].lineData[262]++;
    s[MIX_CIRCULAR_DETECTION] = r;
    _$jscoverage['/util/object.js'].lineData[265]++;
    cache.push(s);
    _$jscoverage['/util/object.js'].lineData[268]++;
    keys = S.keys(s);
    _$jscoverage['/util/object.js'].lineData[269]++;
    len = keys.length;
    _$jscoverage['/util/object.js'].lineData[270]++;
    for (i = 0; visit102_270_1(i < len); i++) {
      _$jscoverage['/util/object.js'].lineData[271]++;
      p = keys[i];
      _$jscoverage['/util/object.js'].lineData[272]++;
      if (visit103_272_1(p !== MIX_CIRCULAR_DETECTION)) {
        _$jscoverage['/util/object.js'].lineData[274]++;
        _mix(p, r, s, ov, wl, deep, cache);
      }
    }
    _$jscoverage['/util/object.js'].lineData[278]++;
    return r;
  }
  _$jscoverage['/util/object.js'].lineData[281]++;
  function removeConstructor(k, v) {
    _$jscoverage['/util/object.js'].functionData[12]++;
    _$jscoverage['/util/object.js'].lineData[282]++;
    return visit104_282_1(k === 'constructor') ? undefined : v;
  }
  _$jscoverage['/util/object.js'].lineData[285]++;
  function _mix(p, r, s, ov, wl, deep, cache) {
    _$jscoverage['/util/object.js'].functionData[13]++;
    _$jscoverage['/util/object.js'].lineData[289]++;
    if (visit105_289_1(ov || visit106_289_2(!(p in r) || deep))) {
      _$jscoverage['/util/object.js'].lineData[290]++;
      var target = r[p], src = s[p];
      _$jscoverage['/util/object.js'].lineData[293]++;
      if (visit107_293_1(target === src)) {
        _$jscoverage['/util/object.js'].lineData[295]++;
        if (visit108_295_1(target === undefined)) {
          _$jscoverage['/util/object.js'].lineData[296]++;
          r[p] = target;
        }
        _$jscoverage['/util/object.js'].lineData[298]++;
        return;
      }
      _$jscoverage['/util/object.js'].lineData[300]++;
      if (visit109_300_1(wl)) {
        _$jscoverage['/util/object.js'].lineData[301]++;
        src = wl.call(s, p, src);
      }
      _$jscoverage['/util/object.js'].lineData[304]++;
      if (visit110_304_1(deep && visit111_304_2(src && (visit112_304_3(S.isArray(src) || S.isPlainObject(src)))))) {
        _$jscoverage['/util/object.js'].lineData[305]++;
        if (visit113_305_1(src[MIX_CIRCULAR_DETECTION])) {
          _$jscoverage['/util/object.js'].lineData[306]++;
          r[p] = src[MIX_CIRCULAR_DETECTION];
        } else {
          _$jscoverage['/util/object.js'].lineData[310]++;
          var clone = visit114_310_1(target && (visit115_310_2(S.isArray(target) || S.isPlainObject(target)))) ? target : (S.isArray(src) ? [] : {});
          _$jscoverage['/util/object.js'].lineData[313]++;
          r[p] = clone;
          _$jscoverage['/util/object.js'].lineData[314]++;
          mixInternal(clone, src, ov, wl, TRUE, cache);
        }
      } else {
        _$jscoverage['/util/object.js'].lineData[316]++;
        if (visit116_316_1(visit117_316_2(src !== undefined) && (visit118_316_3(ov || !(p in r))))) {
          _$jscoverage['/util/object.js'].lineData[317]++;
          r[p] = src;
        }
      }
    }
  }
});
