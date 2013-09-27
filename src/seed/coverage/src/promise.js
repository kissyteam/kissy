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
if (! _$jscoverage['/promise.js']) {
  _$jscoverage['/promise.js'] = {};
  _$jscoverage['/promise.js'].lineData = [];
  _$jscoverage['/promise.js'].lineData[6] = 0;
  _$jscoverage['/promise.js'].lineData[7] = 0;
  _$jscoverage['/promise.js'].lineData[12] = 0;
  _$jscoverage['/promise.js'].lineData[13] = 0;
  _$jscoverage['/promise.js'].lineData[14] = 0;
  _$jscoverage['/promise.js'].lineData[23] = 0;
  _$jscoverage['/promise.js'].lineData[25] = 0;
  _$jscoverage['/promise.js'].lineData[27] = 0;
  _$jscoverage['/promise.js'].lineData[28] = 0;
  _$jscoverage['/promise.js'].lineData[30] = 0;
  _$jscoverage['/promise.js'].lineData[31] = 0;
  _$jscoverage['/promise.js'].lineData[34] = 0;
  _$jscoverage['/promise.js'].lineData[39] = 0;
  _$jscoverage['/promise.js'].lineData[40] = 0;
  _$jscoverage['/promise.js'].lineData[43] = 0;
  _$jscoverage['/promise.js'].lineData[44] = 0;
  _$jscoverage['/promise.js'].lineData[50] = 0;
  _$jscoverage['/promise.js'].lineData[51] = 0;
  _$jscoverage['/promise.js'].lineData[52] = 0;
  _$jscoverage['/promise.js'].lineData[63] = 0;
  _$jscoverage['/promise.js'].lineData[64] = 0;
  _$jscoverage['/promise.js'].lineData[65] = 0;
  _$jscoverage['/promise.js'].lineData[66] = 0;
  _$jscoverage['/promise.js'].lineData[74] = 0;
  _$jscoverage['/promise.js'].lineData[77] = 0;
  _$jscoverage['/promise.js'].lineData[86] = 0;
  _$jscoverage['/promise.js'].lineData[88] = 0;
  _$jscoverage['/promise.js'].lineData[89] = 0;
  _$jscoverage['/promise.js'].lineData[93] = 0;
  _$jscoverage['/promise.js'].lineData[94] = 0;
  _$jscoverage['/promise.js'].lineData[95] = 0;
  _$jscoverage['/promise.js'].lineData[96] = 0;
  _$jscoverage['/promise.js'].lineData[97] = 0;
  _$jscoverage['/promise.js'].lineData[99] = 0;
  _$jscoverage['/promise.js'].lineData[107] = 0;
  _$jscoverage['/promise.js'].lineData[111] = 0;
  _$jscoverage['/promise.js'].lineData[112] = 0;
  _$jscoverage['/promise.js'].lineData[122] = 0;
  _$jscoverage['/promise.js'].lineData[123] = 0;
  _$jscoverage['/promise.js'].lineData[125] = 0;
  _$jscoverage['/promise.js'].lineData[126] = 0;
  _$jscoverage['/promise.js'].lineData[128] = 0;
  _$jscoverage['/promise.js'].lineData[132] = 0;
  _$jscoverage['/promise.js'].lineData[144] = 0;
  _$jscoverage['/promise.js'].lineData[152] = 0;
  _$jscoverage['/promise.js'].lineData[161] = 0;
  _$jscoverage['/promise.js'].lineData[162] = 0;
  _$jscoverage['/promise.js'].lineData[164] = 0;
  _$jscoverage['/promise.js'].lineData[180] = 0;
  _$jscoverage['/promise.js'].lineData[182] = 0;
  _$jscoverage['/promise.js'].lineData[183] = 0;
  _$jscoverage['/promise.js'].lineData[189] = 0;
  _$jscoverage['/promise.js'].lineData[199] = 0;
  _$jscoverage['/promise.js'].lineData[205] = 0;
  _$jscoverage['/promise.js'].lineData[216] = 0;
  _$jscoverage['/promise.js'].lineData[217] = 0;
  _$jscoverage['/promise.js'].lineData[218] = 0;
  _$jscoverage['/promise.js'].lineData[220] = 0;
  _$jscoverage['/promise.js'].lineData[221] = 0;
  _$jscoverage['/promise.js'].lineData[222] = 0;
  _$jscoverage['/promise.js'].lineData[223] = 0;
  _$jscoverage['/promise.js'].lineData[225] = 0;
  _$jscoverage['/promise.js'].lineData[228] = 0;
  _$jscoverage['/promise.js'].lineData[232] = 0;
  _$jscoverage['/promise.js'].lineData[233] = 0;
  _$jscoverage['/promise.js'].lineData[237] = 0;
  _$jscoverage['/promise.js'].lineData[238] = 0;
  _$jscoverage['/promise.js'].lineData[239] = 0;
  _$jscoverage['/promise.js'].lineData[246] = 0;
  _$jscoverage['/promise.js'].lineData[247] = 0;
  _$jscoverage['/promise.js'].lineData[251] = 0;
  _$jscoverage['/promise.js'].lineData[252] = 0;
  _$jscoverage['/promise.js'].lineData[253] = 0;
  _$jscoverage['/promise.js'].lineData[260] = 0;
  _$jscoverage['/promise.js'].lineData[261] = 0;
  _$jscoverage['/promise.js'].lineData[265] = 0;
  _$jscoverage['/promise.js'].lineData[266] = 0;
  _$jscoverage['/promise.js'].lineData[267] = 0;
  _$jscoverage['/promise.js'].lineData[268] = 0;
  _$jscoverage['/promise.js'].lineData[270] = 0;
  _$jscoverage['/promise.js'].lineData[271] = 0;
  _$jscoverage['/promise.js'].lineData[272] = 0;
  _$jscoverage['/promise.js'].lineData[274] = 0;
  _$jscoverage['/promise.js'].lineData[275] = 0;
  _$jscoverage['/promise.js'].lineData[278] = 0;
  _$jscoverage['/promise.js'].lineData[279] = 0;
  _$jscoverage['/promise.js'].lineData[280] = 0;
  _$jscoverage['/promise.js'].lineData[281] = 0;
  _$jscoverage['/promise.js'].lineData[282] = 0;
  _$jscoverage['/promise.js'].lineData[284] = 0;
  _$jscoverage['/promise.js'].lineData[286] = 0;
  _$jscoverage['/promise.js'].lineData[289] = 0;
  _$jscoverage['/promise.js'].lineData[294] = 0;
  _$jscoverage['/promise.js'].lineData[297] = 0;
  _$jscoverage['/promise.js'].lineData[299] = 0;
  _$jscoverage['/promise.js'].lineData[313] = 0;
  _$jscoverage['/promise.js'].lineData[314] = 0;
  _$jscoverage['/promise.js'].lineData[319] = 0;
  _$jscoverage['/promise.js'].lineData[320] = 0;
  _$jscoverage['/promise.js'].lineData[321] = 0;
  _$jscoverage['/promise.js'].lineData[323] = 0;
  _$jscoverage['/promise.js'].lineData[391] = 0;
  _$jscoverage['/promise.js'].lineData[392] = 0;
  _$jscoverage['/promise.js'].lineData[393] = 0;
  _$jscoverage['/promise.js'].lineData[395] = 0;
  _$jscoverage['/promise.js'].lineData[396] = 0;
  _$jscoverage['/promise.js'].lineData[397] = 0;
  _$jscoverage['/promise.js'].lineData[398] = 0;
  _$jscoverage['/promise.js'].lineData[399] = 0;
  _$jscoverage['/promise.js'].lineData[400] = 0;
  _$jscoverage['/promise.js'].lineData[403] = 0;
  _$jscoverage['/promise.js'].lineData[408] = 0;
  _$jscoverage['/promise.js'].lineData[412] = 0;
}
if (! _$jscoverage['/promise.js'].functionData) {
  _$jscoverage['/promise.js'].functionData = [];
  _$jscoverage['/promise.js'].functionData[0] = 0;
  _$jscoverage['/promise.js'].functionData[1] = 0;
  _$jscoverage['/promise.js'].functionData[2] = 0;
  _$jscoverage['/promise.js'].functionData[3] = 0;
  _$jscoverage['/promise.js'].functionData[4] = 0;
  _$jscoverage['/promise.js'].functionData[5] = 0;
  _$jscoverage['/promise.js'].functionData[6] = 0;
  _$jscoverage['/promise.js'].functionData[7] = 0;
  _$jscoverage['/promise.js'].functionData[8] = 0;
  _$jscoverage['/promise.js'].functionData[9] = 0;
  _$jscoverage['/promise.js'].functionData[10] = 0;
  _$jscoverage['/promise.js'].functionData[11] = 0;
  _$jscoverage['/promise.js'].functionData[12] = 0;
  _$jscoverage['/promise.js'].functionData[13] = 0;
  _$jscoverage['/promise.js'].functionData[14] = 0;
  _$jscoverage['/promise.js'].functionData[15] = 0;
  _$jscoverage['/promise.js'].functionData[16] = 0;
  _$jscoverage['/promise.js'].functionData[17] = 0;
  _$jscoverage['/promise.js'].functionData[18] = 0;
  _$jscoverage['/promise.js'].functionData[19] = 0;
  _$jscoverage['/promise.js'].functionData[20] = 0;
  _$jscoverage['/promise.js'].functionData[21] = 0;
  _$jscoverage['/promise.js'].functionData[22] = 0;
  _$jscoverage['/promise.js'].functionData[23] = 0;
  _$jscoverage['/promise.js'].functionData[24] = 0;
  _$jscoverage['/promise.js'].functionData[25] = 0;
  _$jscoverage['/promise.js'].functionData[26] = 0;
  _$jscoverage['/promise.js'].functionData[27] = 0;
  _$jscoverage['/promise.js'].functionData[28] = 0;
  _$jscoverage['/promise.js'].functionData[29] = 0;
  _$jscoverage['/promise.js'].functionData[30] = 0;
  _$jscoverage['/promise.js'].functionData[31] = 0;
  _$jscoverage['/promise.js'].functionData[32] = 0;
}
if (! _$jscoverage['/promise.js'].branchData) {
  _$jscoverage['/promise.js'].branchData = {};
  _$jscoverage['/promise.js'].branchData['13'] = [];
  _$jscoverage['/promise.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['13'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['25'] = [];
  _$jscoverage['/promise.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['27'] = [];
  _$jscoverage['/promise.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['39'] = [];
  _$jscoverage['/promise.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['43'] = [];
  _$jscoverage['/promise.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['50'] = [];
  _$jscoverage['/promise.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['65'] = [];
  _$jscoverage['/promise.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['74'] = [];
  _$jscoverage['/promise.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['88'] = [];
  _$jscoverage['/promise.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['112'] = [];
  _$jscoverage['/promise.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['126'] = [];
  _$jscoverage['/promise.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['186'] = [];
  _$jscoverage['/promise.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['217'] = [];
  _$jscoverage['/promise.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['222'] = [];
  _$jscoverage['/promise.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['246'] = [];
  _$jscoverage['/promise.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['260'] = [];
  _$jscoverage['/promise.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['266'] = [];
  _$jscoverage['/promise.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['270'] = [];
  _$jscoverage['/promise.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['278'] = [];
  _$jscoverage['/promise.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['280'] = [];
  _$jscoverage['/promise.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['299'] = [];
  _$jscoverage['/promise.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['300'] = [];
  _$jscoverage['/promise.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['302'] = [];
  _$jscoverage['/promise.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['306'] = [];
  _$jscoverage['/promise.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['314'] = [];
  _$jscoverage['/promise.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['315'] = [];
  _$jscoverage['/promise.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['315'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['392'] = [];
  _$jscoverage['/promise.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['396'] = [];
  _$jscoverage['/promise.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['400'] = [];
  _$jscoverage['/promise.js'].branchData['400'][1] = new BranchData();
}
_$jscoverage['/promise.js'].branchData['400'][1].init(76, 13, '--count === 0');
function visit569_400_1(result) {
  _$jscoverage['/promise.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['396'][1].init(178, 19, 'i < promises.length');
function visit568_396_1(result) {
  _$jscoverage['/promise.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['392'][1].init(60, 6, '!count');
function visit567_392_1(result) {
  _$jscoverage['/promise.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['315'][2].init(51, 35, 'obj[PROMISE_PENDINGS] === undefined');
function visit566_315_2(result) {
  _$jscoverage['/promise.js'].branchData['315'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['315'][1].init(31, 91, '(obj[PROMISE_PENDINGS] === undefined) && (obj[PROMISE_VALUE] instanceof Reject)');
function visit565_315_1(result) {
  _$jscoverage['/promise.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['314'][1].init(17, 123, 'isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (obj[PROMISE_VALUE] instanceof Reject)');
function visit564_314_1(result) {
  _$jscoverage['/promise.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['306'][1].init(-1, 206, '!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE])');
function visit563_306_1(result) {
  _$jscoverage['/promise.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['302'][2].init(154, 35, 'obj[PROMISE_PENDINGS] === undefined');
function visit562_302_2(result) {
  _$jscoverage['/promise.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['302'][1].init(64, 405, '(obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit561_302_1(result) {
  _$jscoverage['/promise.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['300'][1].init(32, 470, 'isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit560_300_1(result) {
  _$jscoverage['/promise.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['299'][1].init(53, 503, '!isRejected(obj) && isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit559_299_1(result) {
  _$jscoverage['/promise.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['280'][1].init(22, 4, 'done');
function visit558_280_1(result) {
  _$jscoverage['/promise.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['278'][1].init(1424, 25, 'value instanceof Promise');
function visit557_278_1(result) {
  _$jscoverage['/promise.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['270'][1].init(143, 24, 'value instanceof Promise');
function visit556_270_1(result) {
  _$jscoverage['/promise.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['266'][1].init(18, 4, 'done');
function visit555_266_1(result) {
  _$jscoverage['/promise.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['260'][1].init(83, 12, 'e.stack || e');
function visit554_260_1(result) {
  _$jscoverage['/promise.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['246'][1].init(168, 12, 'e.stack || e');
function visit553_246_1(result) {
  _$jscoverage['/promise.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['222'][1].init(161, 38, 'self[PROMISE_VALUE] instanceof Promise');
function visit552_222_1(result) {
  _$jscoverage['/promise.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['217'][1].init(14, 24, 'reason instanceof Reject');
function visit551_217_1(result) {
  _$jscoverage['/promise.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['186'][1].init(230, 21, 'fulfilled || rejected');
function visit550_186_1(result) {
  _$jscoverage['/promise.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['126'][1].init(125, 15, 'v === undefined');
function visit549_126_1(result) {
  _$jscoverage['/promise.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['112'][1].init(18, 29, 'obj && obj instanceof Promise');
function visit548_112_1(result) {
  _$jscoverage['/promise.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['88'][1].init(86, 39, '!(pendings = promise[PROMISE_PENDINGS])');
function visit547_88_1(result) {
  _$jscoverage['/promise.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['74'][1].init(344, 24, 'promise || new Promise()');
function visit546_74_1(result) {
  _$jscoverage['/promise.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['65'][1].init(40, 24, '!(self instanceof Defer)');
function visit545_65_1(result) {
  _$jscoverage['/promise.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['50'][1].init(208, 9, 'fulfilled');
function visit544_50_1(result) {
  _$jscoverage['/promise.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['43'][1].init(334, 12, 'isPromise(v)');
function visit543_43_1(result) {
  _$jscoverage['/promise.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['39'][1].init(186, 8, 'pendings');
function visit542_39_1(result) {
  _$jscoverage['/promise.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['27'][1].init(89, 9, '!rejected');
function visit541_27_1(result) {
  _$jscoverage['/promise.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['25'][1].init(47, 25, 'promise instanceof Reject');
function visit540_25_1(result) {
  _$jscoverage['/promise.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['13'][2].init(14, 30, 'typeof console !== \'undefined\'');
function visit539_13_2(result) {
  _$jscoverage['/promise.js'].branchData['13'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['13'][1].init(14, 47, 'typeof console !== \'undefined\' && console.error');
function visit538_13_1(result) {
  _$jscoverage['/promise.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/promise.js'].functionData[0]++;
  _$jscoverage['/promise.js'].lineData[7]++;
  var PROMISE_VALUE = '__promise_value', processImmediate = S.setImmediate, logger = S.getLogger('s/promise'), PROMISE_PENDINGS = '__promise_pendings';
  _$jscoverage['/promise.js'].lineData[12]++;
  function logError(str) {
    _$jscoverage['/promise.js'].functionData[1]++;
    _$jscoverage['/promise.js'].lineData[13]++;
    if (visit538_13_1(visit539_13_2(typeof console !== 'undefined') && console.error)) {
      _$jscoverage['/promise.js'].lineData[14]++;
      console.error(str);
    }
  }
  _$jscoverage['/promise.js'].lineData[23]++;
  function promiseWhen(promise, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[2]++;
    _$jscoverage['/promise.js'].lineData[25]++;
    if (visit540_25_1(promise instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[27]++;
      if (visit541_27_1(!rejected)) {
        _$jscoverage['/promise.js'].lineData[28]++;
        logger.error('no rejected callback!');
      }
      _$jscoverage['/promise.js'].lineData[30]++;
      processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[3]++;
  _$jscoverage['/promise.js'].lineData[31]++;
  rejected(promise[PROMISE_VALUE]);
});
    } else {
      _$jscoverage['/promise.js'].lineData[34]++;
      var v = promise[PROMISE_VALUE], pendings = promise[PROMISE_PENDINGS];
      _$jscoverage['/promise.js'].lineData[39]++;
      if (visit542_39_1(pendings)) {
        _$jscoverage['/promise.js'].lineData[40]++;
        pendings.push([fulfilled, rejected]);
      } else {
        _$jscoverage['/promise.js'].lineData[43]++;
        if (visit543_43_1(isPromise(v))) {
          _$jscoverage['/promise.js'].lineData[44]++;
          promiseWhen(v, fulfilled, rejected);
        } else {
          _$jscoverage['/promise.js'].lineData[50]++;
          if (visit544_50_1(fulfilled)) {
            _$jscoverage['/promise.js'].lineData[51]++;
            processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[4]++;
  _$jscoverage['/promise.js'].lineData[52]++;
  fulfilled(v);
});
          }
        }
      }
    }
  }
  _$jscoverage['/promise.js'].lineData[63]++;
  function Defer(promise) {
    _$jscoverage['/promise.js'].functionData[5]++;
    _$jscoverage['/promise.js'].lineData[64]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[65]++;
    if (visit545_65_1(!(self instanceof Defer))) {
      _$jscoverage['/promise.js'].lineData[66]++;
      return new Defer(promise);
    }
    _$jscoverage['/promise.js'].lineData[74]++;
    self.promise = visit546_74_1(promise || new Promise());
  }
  _$jscoverage['/promise.js'].lineData[77]++;
  Defer.prototype = {
  constructor: Defer, 
  resolve: function(value) {
  _$jscoverage['/promise.js'].functionData[6]++;
  _$jscoverage['/promise.js'].lineData[86]++;
  var promise = this.promise, pendings;
  _$jscoverage['/promise.js'].lineData[88]++;
  if (visit547_88_1(!(pendings = promise[PROMISE_PENDINGS]))) {
    _$jscoverage['/promise.js'].lineData[89]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[93]++;
  promise[PROMISE_VALUE] = value;
  _$jscoverage['/promise.js'].lineData[94]++;
  pendings = [].concat(pendings);
  _$jscoverage['/promise.js'].lineData[95]++;
  promise[PROMISE_PENDINGS] = undefined;
  _$jscoverage['/promise.js'].lineData[96]++;
  S.each(pendings, function(p) {
  _$jscoverage['/promise.js'].functionData[7]++;
  _$jscoverage['/promise.js'].lineData[97]++;
  promiseWhen(promise, p[0], p[1]);
});
  _$jscoverage['/promise.js'].lineData[99]++;
  return value;
}, 
  reject: function(reason) {
  _$jscoverage['/promise.js'].functionData[8]++;
  _$jscoverage['/promise.js'].lineData[107]++;
  return this.resolve(new Reject(reason));
}};
  _$jscoverage['/promise.js'].lineData[111]++;
  function isPromise(obj) {
    _$jscoverage['/promise.js'].functionData[9]++;
    _$jscoverage['/promise.js'].lineData[112]++;
    return visit548_112_1(obj && obj instanceof Promise);
  }
  _$jscoverage['/promise.js'].lineData[122]++;
  function Promise(v) {
    _$jscoverage['/promise.js'].functionData[10]++;
    _$jscoverage['/promise.js'].lineData[123]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[125]++;
    self[PROMISE_VALUE] = v;
    _$jscoverage['/promise.js'].lineData[126]++;
    if (visit549_126_1(v === undefined)) {
      _$jscoverage['/promise.js'].lineData[128]++;
      self[PROMISE_PENDINGS] = [];
    }
  }
  _$jscoverage['/promise.js'].lineData[132]++;
  Promise.prototype = {
  constructor: Promise, 
  then: function(fulfilled, rejected) {
  _$jscoverage['/promise.js'].functionData[11]++;
  _$jscoverage['/promise.js'].lineData[144]++;
  return when(this, fulfilled, rejected);
}, 
  fail: function(rejected) {
  _$jscoverage['/promise.js'].functionData[12]++;
  _$jscoverage['/promise.js'].lineData[152]++;
  return when(this, 0, rejected);
}, 
  fin: function(callback) {
  _$jscoverage['/promise.js'].functionData[13]++;
  _$jscoverage['/promise.js'].lineData[161]++;
  return when(this, function(value) {
  _$jscoverage['/promise.js'].functionData[14]++;
  _$jscoverage['/promise.js'].lineData[162]++;
  return callback(value, true);
}, function(reason) {
  _$jscoverage['/promise.js'].functionData[15]++;
  _$jscoverage['/promise.js'].lineData[164]++;
  return callback(reason, false);
});
}, 
  done: function(fulfilled, rejected) {
  _$jscoverage['/promise.js'].functionData[16]++;
  _$jscoverage['/promise.js'].lineData[180]++;
  var self = this, onUnhandledError = function(e) {
  _$jscoverage['/promise.js'].functionData[17]++;
  _$jscoverage['/promise.js'].lineData[182]++;
  setTimeout(function() {
  _$jscoverage['/promise.js'].functionData[18]++;
  _$jscoverage['/promise.js'].lineData[183]++;
  throw e;
}, 0);
}, promiseToHandle = visit550_186_1(fulfilled || rejected) ? self.then(fulfilled, rejected) : self;
  _$jscoverage['/promise.js'].lineData[189]++;
  promiseToHandle.fail(onUnhandledError);
}, 
  isResolved: function() {
  _$jscoverage['/promise.js'].functionData[19]++;
  _$jscoverage['/promise.js'].lineData[199]++;
  return isResolved(this);
}, 
  isRejected: function() {
  _$jscoverage['/promise.js'].functionData[20]++;
  _$jscoverage['/promise.js'].lineData[205]++;
  return isRejected(this);
}};
  _$jscoverage['/promise.js'].lineData[216]++;
  function Reject(reason) {
    _$jscoverage['/promise.js'].functionData[21]++;
    _$jscoverage['/promise.js'].lineData[217]++;
    if (visit551_217_1(reason instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[218]++;
      return reason;
    }
    _$jscoverage['/promise.js'].lineData[220]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[221]++;
    Promise.apply(self, arguments);
    _$jscoverage['/promise.js'].lineData[222]++;
    if (visit552_222_1(self[PROMISE_VALUE] instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[223]++;
      logger.error('assert.not(this.__promise_value instanceof promise) in Reject constructor');
    }
    _$jscoverage['/promise.js'].lineData[225]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[228]++;
  S.extend(Reject, Promise);
  _$jscoverage['/promise.js'].lineData[232]++;
  function when(value, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[22]++;
    _$jscoverage['/promise.js'].lineData[233]++;
    var defer = new Defer(), done = 0;
    _$jscoverage['/promise.js'].lineData[237]++;
    function _fulfilled(value) {
      _$jscoverage['/promise.js'].functionData[23]++;
      _$jscoverage['/promise.js'].lineData[238]++;
      try {
        _$jscoverage['/promise.js'].lineData[239]++;
        return fulfilled ? fulfilled(value) : value;
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[246]++;
  logError(visit553_246_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[247]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[251]++;
    function _rejected(reason) {
      _$jscoverage['/promise.js'].functionData[24]++;
      _$jscoverage['/promise.js'].lineData[252]++;
      try {
        _$jscoverage['/promise.js'].lineData[253]++;
        return rejected ? rejected(reason) : new Reject(reason);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[260]++;
  logError(visit554_260_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[261]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[265]++;
    function finalFulfill(value) {
      _$jscoverage['/promise.js'].functionData[25]++;
      _$jscoverage['/promise.js'].lineData[266]++;
      if (visit555_266_1(done)) {
        _$jscoverage['/promise.js'].lineData[267]++;
        logger.error('already done at fulfilled');
        _$jscoverage['/promise.js'].lineData[268]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[270]++;
      if (visit556_270_1(value instanceof Promise)) {
        _$jscoverage['/promise.js'].lineData[271]++;
        logger.error('assert.not(value instanceof Promise) in when');
        _$jscoverage['/promise.js'].lineData[272]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[274]++;
      done = 1;
      _$jscoverage['/promise.js'].lineData[275]++;
      defer.resolve(_fulfilled(value));
    }
    _$jscoverage['/promise.js'].lineData[278]++;
    if (visit557_278_1(value instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[279]++;
      promiseWhen(value, finalFulfill, function(reason) {
  _$jscoverage['/promise.js'].functionData[26]++;
  _$jscoverage['/promise.js'].lineData[280]++;
  if (visit558_280_1(done)) {
    _$jscoverage['/promise.js'].lineData[281]++;
    logger.error('already done at rejected');
    _$jscoverage['/promise.js'].lineData[282]++;
    return;
  }
  _$jscoverage['/promise.js'].lineData[284]++;
  done = 1;
  _$jscoverage['/promise.js'].lineData[286]++;
  defer.resolve(_rejected(reason));
});
    } else {
      _$jscoverage['/promise.js'].lineData[289]++;
      finalFulfill(value);
    }
    _$jscoverage['/promise.js'].lineData[294]++;
    return defer.promise;
  }
  _$jscoverage['/promise.js'].lineData[297]++;
  function isResolved(obj) {
    _$jscoverage['/promise.js'].functionData[27]++;
    _$jscoverage['/promise.js'].lineData[299]++;
    return visit559_299_1(!isRejected(obj) && visit560_300_1(isPromise(obj) && visit561_302_1((visit562_302_2(obj[PROMISE_PENDINGS] === undefined)) && (visit563_306_1(!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))))));
  }
  _$jscoverage['/promise.js'].lineData[313]++;
  function isRejected(obj) {
    _$jscoverage['/promise.js'].functionData[28]++;
    _$jscoverage['/promise.js'].lineData[314]++;
    return visit564_314_1(isPromise(obj) && visit565_315_1((visit566_315_2(obj[PROMISE_PENDINGS] === undefined)) && (obj[PROMISE_VALUE] instanceof Reject)));
  }
  _$jscoverage['/promise.js'].lineData[319]++;
  KISSY.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[320]++;
  KISSY.Promise = Promise;
  _$jscoverage['/promise.js'].lineData[321]++;
  Promise.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[323]++;
  S.mix(Promise, {
  when: when, 
  isPromise: isPromise, 
  isResolved: isResolved, 
  isRejected: isRejected, 
  all: function(promises) {
  _$jscoverage['/promise.js'].functionData[29]++;
  _$jscoverage['/promise.js'].lineData[391]++;
  var count = promises.length;
  _$jscoverage['/promise.js'].lineData[392]++;
  if (visit567_392_1(!count)) {
    _$jscoverage['/promise.js'].lineData[393]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[395]++;
  var defer = Defer();
  _$jscoverage['/promise.js'].lineData[396]++;
  for (var i = 0; visit568_396_1(i < promises.length); i++) {
    _$jscoverage['/promise.js'].lineData[397]++;
    (function(promise, i) {
  _$jscoverage['/promise.js'].functionData[30]++;
  _$jscoverage['/promise.js'].lineData[398]++;
  when(promise, function(value) {
  _$jscoverage['/promise.js'].functionData[31]++;
  _$jscoverage['/promise.js'].lineData[399]++;
  promises[i] = value;
  _$jscoverage['/promise.js'].lineData[400]++;
  if (visit569_400_1(--count === 0)) {
    _$jscoverage['/promise.js'].lineData[403]++;
    defer.resolve(promises);
  }
}, function(r) {
  _$jscoverage['/promise.js'].functionData[32]++;
  _$jscoverage['/promise.js'].lineData[408]++;
  defer.reject(r);
});
})(promises[i], i);
  }
  _$jscoverage['/promise.js'].lineData[412]++;
  return defer.promise;
}});
})(KISSY);
