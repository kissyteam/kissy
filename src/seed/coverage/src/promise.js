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
  _$jscoverage['/promise.js'].lineData[8] = 0;
  _$jscoverage['/promise.js'].lineData[16] = 0;
  _$jscoverage['/promise.js'].lineData[18] = 0;
  _$jscoverage['/promise.js'].lineData[20] = 0;
  _$jscoverage['/promise.js'].lineData[21] = 0;
  _$jscoverage['/promise.js'].lineData[23] = 0;
  _$jscoverage['/promise.js'].lineData[26] = 0;
  _$jscoverage['/promise.js'].lineData[31] = 0;
  _$jscoverage['/promise.js'].lineData[32] = 0;
  _$jscoverage['/promise.js'].lineData[35] = 0;
  _$jscoverage['/promise.js'].lineData[36] = 0;
  _$jscoverage['/promise.js'].lineData[42] = 0;
  _$jscoverage['/promise.js'].lineData[44] = 0;
  _$jscoverage['/promise.js'].lineData[51] = 0;
  _$jscoverage['/promise.js'].lineData[52] = 0;
  _$jscoverage['/promise.js'].lineData[53] = 0;
  _$jscoverage['/promise.js'].lineData[54] = 0;
  _$jscoverage['/promise.js'].lineData[62] = 0;
  _$jscoverage['/promise.js'].lineData[65] = 0;
  _$jscoverage['/promise.js'].lineData[74] = 0;
  _$jscoverage['/promise.js'].lineData[76] = 0;
  _$jscoverage['/promise.js'].lineData[77] = 0;
  _$jscoverage['/promise.js'].lineData[81] = 0;
  _$jscoverage['/promise.js'].lineData[82] = 0;
  _$jscoverage['/promise.js'].lineData[83] = 0;
  _$jscoverage['/promise.js'].lineData[84] = 0;
  _$jscoverage['/promise.js'].lineData[85] = 0;
  _$jscoverage['/promise.js'].lineData[87] = 0;
  _$jscoverage['/promise.js'].lineData[95] = 0;
  _$jscoverage['/promise.js'].lineData[99] = 0;
  _$jscoverage['/promise.js'].lineData[100] = 0;
  _$jscoverage['/promise.js'].lineData[110] = 0;
  _$jscoverage['/promise.js'].lineData[111] = 0;
  _$jscoverage['/promise.js'].lineData[113] = 0;
  _$jscoverage['/promise.js'].lineData[114] = 0;
  _$jscoverage['/promise.js'].lineData[116] = 0;
  _$jscoverage['/promise.js'].lineData[120] = 0;
  _$jscoverage['/promise.js'].lineData[131] = 0;
  _$jscoverage['/promise.js'].lineData[139] = 0;
  _$jscoverage['/promise.js'].lineData[148] = 0;
  _$jscoverage['/promise.js'].lineData[149] = 0;
  _$jscoverage['/promise.js'].lineData[151] = 0;
  _$jscoverage['/promise.js'].lineData[167] = 0;
  _$jscoverage['/promise.js'].lineData[169] = 0;
  _$jscoverage['/promise.js'].lineData[170] = 0;
  _$jscoverage['/promise.js'].lineData[176] = 0;
  _$jscoverage['/promise.js'].lineData[186] = 0;
  _$jscoverage['/promise.js'].lineData[192] = 0;
  _$jscoverage['/promise.js'].lineData[196] = 0;
  _$jscoverage['/promise.js'].lineData[197] = 0;
  _$jscoverage['/promise.js'].lineData[198] = 0;
  _$jscoverage['/promise.js'].lineData[200] = 0;
  _$jscoverage['/promise.js'].lineData[201] = 0;
  _$jscoverage['/promise.js'].lineData[202] = 0;
  _$jscoverage['/promise.js'].lineData[203] = 0;
  _$jscoverage['/promise.js'].lineData[205] = 0;
  _$jscoverage['/promise.js'].lineData[208] = 0;
  _$jscoverage['/promise.js'].lineData[217] = 0;
  _$jscoverage['/promise.js'].lineData[218] = 0;
  _$jscoverage['/promise.js'].lineData[222] = 0;
  _$jscoverage['/promise.js'].lineData[223] = 0;
  _$jscoverage['/promise.js'].lineData[224] = 0;
  _$jscoverage['/promise.js'].lineData[229] = 0;
  _$jscoverage['/promise.js'].lineData[230] = 0;
  _$jscoverage['/promise.js'].lineData[234] = 0;
  _$jscoverage['/promise.js'].lineData[235] = 0;
  _$jscoverage['/promise.js'].lineData[236] = 0;
  _$jscoverage['/promise.js'].lineData[243] = 0;
  _$jscoverage['/promise.js'].lineData[244] = 0;
  _$jscoverage['/promise.js'].lineData[248] = 0;
  _$jscoverage['/promise.js'].lineData[249] = 0;
  _$jscoverage['/promise.js'].lineData[250] = 0;
  _$jscoverage['/promise.js'].lineData[251] = 0;
  _$jscoverage['/promise.js'].lineData[253] = 0;
  _$jscoverage['/promise.js'].lineData[254] = 0;
  _$jscoverage['/promise.js'].lineData[256] = 0;
  _$jscoverage['/promise.js'].lineData[257] = 0;
  _$jscoverage['/promise.js'].lineData[260] = 0;
  _$jscoverage['/promise.js'].lineData[261] = 0;
  _$jscoverage['/promise.js'].lineData[262] = 0;
  _$jscoverage['/promise.js'].lineData[263] = 0;
  _$jscoverage['/promise.js'].lineData[264] = 0;
  _$jscoverage['/promise.js'].lineData[266] = 0;
  _$jscoverage['/promise.js'].lineData[268] = 0;
  _$jscoverage['/promise.js'].lineData[271] = 0;
  _$jscoverage['/promise.js'].lineData[276] = 0;
  _$jscoverage['/promise.js'].lineData[279] = 0;
  _$jscoverage['/promise.js'].lineData[281] = 0;
  _$jscoverage['/promise.js'].lineData[295] = 0;
  _$jscoverage['/promise.js'].lineData[296] = 0;
  _$jscoverage['/promise.js'].lineData[301] = 0;
  _$jscoverage['/promise.js'].lineData[302] = 0;
  _$jscoverage['/promise.js'].lineData[303] = 0;
  _$jscoverage['/promise.js'].lineData[305] = 0;
  _$jscoverage['/promise.js'].lineData[373] = 0;
  _$jscoverage['/promise.js'].lineData[374] = 0;
  _$jscoverage['/promise.js'].lineData[375] = 0;
  _$jscoverage['/promise.js'].lineData[377] = 0;
  _$jscoverage['/promise.js'].lineData[378] = 0;
  _$jscoverage['/promise.js'].lineData[379] = 0;
  _$jscoverage['/promise.js'].lineData[380] = 0;
  _$jscoverage['/promise.js'].lineData[381] = 0;
  _$jscoverage['/promise.js'].lineData[382] = 0;
  _$jscoverage['/promise.js'].lineData[385] = 0;
  _$jscoverage['/promise.js'].lineData[390] = 0;
  _$jscoverage['/promise.js'].lineData[394] = 0;
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
}
if (! _$jscoverage['/promise.js'].branchData) {
  _$jscoverage['/promise.js'].branchData = {};
  _$jscoverage['/promise.js'].branchData['18'] = [];
  _$jscoverage['/promise.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['20'] = [];
  _$jscoverage['/promise.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['31'] = [];
  _$jscoverage['/promise.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['35'] = [];
  _$jscoverage['/promise.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['42'] = [];
  _$jscoverage['/promise.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['53'] = [];
  _$jscoverage['/promise.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['62'] = [];
  _$jscoverage['/promise.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['76'] = [];
  _$jscoverage['/promise.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['100'] = [];
  _$jscoverage['/promise.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['114'] = [];
  _$jscoverage['/promise.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['173'] = [];
  _$jscoverage['/promise.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['197'] = [];
  _$jscoverage['/promise.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['202'] = [];
  _$jscoverage['/promise.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['229'] = [];
  _$jscoverage['/promise.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['243'] = [];
  _$jscoverage['/promise.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['249'] = [];
  _$jscoverage['/promise.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['253'] = [];
  _$jscoverage['/promise.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['260'] = [];
  _$jscoverage['/promise.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['262'] = [];
  _$jscoverage['/promise.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['281'] = [];
  _$jscoverage['/promise.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['282'] = [];
  _$jscoverage['/promise.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['284'] = [];
  _$jscoverage['/promise.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['284'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['288'] = [];
  _$jscoverage['/promise.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['296'] = [];
  _$jscoverage['/promise.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['297'] = [];
  _$jscoverage['/promise.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['297'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['374'] = [];
  _$jscoverage['/promise.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['378'] = [];
  _$jscoverage['/promise.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['382'] = [];
  _$jscoverage['/promise.js'].branchData['382'][1] = new BranchData();
}
_$jscoverage['/promise.js'].branchData['382'][1].init(84, 13, '--count === 0');
function visit555_382_1(result) {
  _$jscoverage['/promise.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['378'][1].init(202, 19, 'i < promises.length');
function visit554_378_1(result) {
  _$jscoverage['/promise.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['374'][1].init(68, 6, '!count');
function visit553_374_1(result) {
  _$jscoverage['/promise.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['297'][2].init(51, 35, 'obj[PROMISE_PENDINGS] === undefined');
function visit552_297_2(result) {
  _$jscoverage['/promise.js'].branchData['297'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['297'][1].init(31, 91, '(obj[PROMISE_PENDINGS] === undefined) && (obj[PROMISE_VALUE] instanceof Reject)');
function visit551_297_1(result) {
  _$jscoverage['/promise.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['296'][1].init(17, 123, 'isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (obj[PROMISE_VALUE] instanceof Reject)');
function visit550_296_1(result) {
  _$jscoverage['/promise.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['288'][1].init(-1, 206, '!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE])');
function visit549_288_1(result) {
  _$jscoverage['/promise.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['284'][2].init(154, 35, 'obj[PROMISE_PENDINGS] === undefined');
function visit548_284_2(result) {
  _$jscoverage['/promise.js'].branchData['284'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['284'][1].init(64, 405, '(obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit547_284_1(result) {
  _$jscoverage['/promise.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['282'][1].init(32, 470, 'isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit546_282_1(result) {
  _$jscoverage['/promise.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['281'][1].init(53, 503, '!isRejected(obj) && isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit545_281_1(result) {
  _$jscoverage['/promise.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['262'][1].init(22, 4, 'done');
function visit544_262_1(result) {
  _$jscoverage['/promise.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['260'][1].init(1315, 25, 'value instanceof Promise');
function visit543_260_1(result) {
  _$jscoverage['/promise.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['253'][1].init(138, 24, 'value instanceof Promise');
function visit542_253_1(result) {
  _$jscoverage['/promise.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['249'][1].init(18, 4, 'done');
function visit541_249_1(result) {
  _$jscoverage['/promise.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['243'][1].init(80, 12, 'e.stack || e');
function visit540_243_1(result) {
  _$jscoverage['/promise.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['229'][1].init(80, 12, 'e.stack || e');
function visit539_229_1(result) {
  _$jscoverage['/promise.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['202'][1].init(161, 38, 'self[PROMISE_VALUE] instanceof Promise');
function visit538_202_1(result) {
  _$jscoverage['/promise.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['197'][1].init(14, 24, 'reason instanceof Reject');
function visit537_197_1(result) {
  _$jscoverage['/promise.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['173'][1].init(238, 21, 'fulfilled || rejected');
function visit536_173_1(result) {
  _$jscoverage['/promise.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['114'][1].init(125, 15, 'v === undefined');
function visit535_114_1(result) {
  _$jscoverage['/promise.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['100'][1].init(18, 29, 'obj && obj instanceof Promise');
function visit534_100_1(result) {
  _$jscoverage['/promise.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['76'][1].init(86, 39, '!(pendings = promise[PROMISE_PENDINGS])');
function visit533_76_1(result) {
  _$jscoverage['/promise.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['62'][1].init(344, 24, 'promise || new Promise()');
function visit532_62_1(result) {
  _$jscoverage['/promise.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['53'][1].init(40, 24, '!(self instanceof Defer)');
function visit531_53_1(result) {
  _$jscoverage['/promise.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['42'][1].init(191, 25, 'fulfilled && fulfilled(v)');
function visit530_42_1(result) {
  _$jscoverage['/promise.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['35'][1].init(607, 12, 'isPromise(v)');
function visit529_35_1(result) {
  _$jscoverage['/promise.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['31'][1].init(475, 8, 'pendings');
function visit528_31_1(result) {
  _$jscoverage['/promise.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['20'][1].init(89, 9, '!rejected');
function visit527_20_1(result) {
  _$jscoverage['/promise.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['18'][1].init(47, 25, 'promise instanceof Reject');
function visit526_18_1(result) {
  _$jscoverage['/promise.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/promise.js'].functionData[0]++;
  _$jscoverage['/promise.js'].lineData[8]++;
  var PROMISE_VALUE = '__promise_value', PROMISE_PENDINGS = '__promise_pendings';
  _$jscoverage['/promise.js'].lineData[16]++;
  function promiseWhen(promise, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[1]++;
    _$jscoverage['/promise.js'].lineData[18]++;
    if (visit526_18_1(promise instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[20]++;
      if (visit527_20_1(!rejected)) {
        _$jscoverage['/promise.js'].lineData[21]++;
        S.error('no rejected callback!');
      }
      _$jscoverage['/promise.js'].lineData[23]++;
      return rejected(promise[PROMISE_VALUE]);
    }
    _$jscoverage['/promise.js'].lineData[26]++;
    var v = promise[PROMISE_VALUE], pendings = promise[PROMISE_PENDINGS];
    _$jscoverage['/promise.js'].lineData[31]++;
    if (visit528_31_1(pendings)) {
      _$jscoverage['/promise.js'].lineData[32]++;
      pendings.push([fulfilled, rejected]);
    } else {
      _$jscoverage['/promise.js'].lineData[35]++;
      if (visit529_35_1(isPromise(v))) {
        _$jscoverage['/promise.js'].lineData[36]++;
        promiseWhen(v, fulfilled, rejected);
      } else {
        _$jscoverage['/promise.js'].lineData[42]++;
        return visit530_42_1(fulfilled && fulfilled(v));
      }
    }
    _$jscoverage['/promise.js'].lineData[44]++;
    return undefined;
  }
  _$jscoverage['/promise.js'].lineData[51]++;
  function Defer(promise) {
    _$jscoverage['/promise.js'].functionData[2]++;
    _$jscoverage['/promise.js'].lineData[52]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[53]++;
    if (visit531_53_1(!(self instanceof Defer))) {
      _$jscoverage['/promise.js'].lineData[54]++;
      return new Defer(promise);
    }
    _$jscoverage['/promise.js'].lineData[62]++;
    self.promise = visit532_62_1(promise || new Promise());
  }
  _$jscoverage['/promise.js'].lineData[65]++;
  Defer.prototype = {
  constructor: Defer, 
  resolve: function(value) {
  _$jscoverage['/promise.js'].functionData[3]++;
  _$jscoverage['/promise.js'].lineData[74]++;
  var promise = this.promise, pendings;
  _$jscoverage['/promise.js'].lineData[76]++;
  if (visit533_76_1(!(pendings = promise[PROMISE_PENDINGS]))) {
    _$jscoverage['/promise.js'].lineData[77]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[81]++;
  promise[PROMISE_VALUE] = value;
  _$jscoverage['/promise.js'].lineData[82]++;
  pendings = [].concat(pendings);
  _$jscoverage['/promise.js'].lineData[83]++;
  promise[PROMISE_PENDINGS] = undefined;
  _$jscoverage['/promise.js'].lineData[84]++;
  S.each(pendings, function(p) {
  _$jscoverage['/promise.js'].functionData[4]++;
  _$jscoverage['/promise.js'].lineData[85]++;
  promiseWhen(promise, p[0], p[1]);
});
  _$jscoverage['/promise.js'].lineData[87]++;
  return value;
}, 
  reject: function(reason) {
  _$jscoverage['/promise.js'].functionData[5]++;
  _$jscoverage['/promise.js'].lineData[95]++;
  return this.resolve(new Reject(reason));
}};
  _$jscoverage['/promise.js'].lineData[99]++;
  function isPromise(obj) {
    _$jscoverage['/promise.js'].functionData[6]++;
    _$jscoverage['/promise.js'].lineData[100]++;
    return visit534_100_1(obj && obj instanceof Promise);
  }
  _$jscoverage['/promise.js'].lineData[110]++;
  function Promise(v) {
    _$jscoverage['/promise.js'].functionData[7]++;
    _$jscoverage['/promise.js'].lineData[111]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[113]++;
    self[PROMISE_VALUE] = v;
    _$jscoverage['/promise.js'].lineData[114]++;
    if (visit535_114_1(v === undefined)) {
      _$jscoverage['/promise.js'].lineData[116]++;
      self[PROMISE_PENDINGS] = [];
    }
  }
  _$jscoverage['/promise.js'].lineData[120]++;
  Promise.prototype = {
  constructor: Promise, 
  then: function(fulfilled, rejected) {
  _$jscoverage['/promise.js'].functionData[8]++;
  _$jscoverage['/promise.js'].lineData[131]++;
  return when(this, fulfilled, rejected);
}, 
  fail: function(rejected) {
  _$jscoverage['/promise.js'].functionData[9]++;
  _$jscoverage['/promise.js'].lineData[139]++;
  return when(this, 0, rejected);
}, 
  fin: function(callback) {
  _$jscoverage['/promise.js'].functionData[10]++;
  _$jscoverage['/promise.js'].lineData[148]++;
  return when(this, function(value) {
  _$jscoverage['/promise.js'].functionData[11]++;
  _$jscoverage['/promise.js'].lineData[149]++;
  return callback(value, true);
}, function(reason) {
  _$jscoverage['/promise.js'].functionData[12]++;
  _$jscoverage['/promise.js'].lineData[151]++;
  return callback(reason, false);
});
}, 
  done: function(fulfilled, rejected) {
  _$jscoverage['/promise.js'].functionData[13]++;
  _$jscoverage['/promise.js'].lineData[167]++;
  var self = this, onUnhandledError = function(error) {
  _$jscoverage['/promise.js'].functionData[14]++;
  _$jscoverage['/promise.js'].lineData[169]++;
  setTimeout(function() {
  _$jscoverage['/promise.js'].functionData[15]++;
  _$jscoverage['/promise.js'].lineData[170]++;
  throw error;
}, 0);
}, promiseToHandle = visit536_173_1(fulfilled || rejected) ? self.then(fulfilled, rejected) : self;
  _$jscoverage['/promise.js'].lineData[176]++;
  promiseToHandle.fail(onUnhandledError);
}, 
  isResolved: function() {
  _$jscoverage['/promise.js'].functionData[16]++;
  _$jscoverage['/promise.js'].lineData[186]++;
  return isResolved(this);
}, 
  isRejected: function() {
  _$jscoverage['/promise.js'].functionData[17]++;
  _$jscoverage['/promise.js'].lineData[192]++;
  return isRejected(this);
}};
  _$jscoverage['/promise.js'].lineData[196]++;
  function Reject(reason) {
    _$jscoverage['/promise.js'].functionData[18]++;
    _$jscoverage['/promise.js'].lineData[197]++;
    if (visit537_197_1(reason instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[198]++;
      return reason;
    }
    _$jscoverage['/promise.js'].lineData[200]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[201]++;
    Promise.apply(self, arguments);
    _$jscoverage['/promise.js'].lineData[202]++;
    if (visit538_202_1(self[PROMISE_VALUE] instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[203]++;
      S.error('assert.not(this.__promise_value instanceof promise) in Reject constructor');
    }
    _$jscoverage['/promise.js'].lineData[205]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[208]++;
  S.extend(Reject, Promise);
  _$jscoverage['/promise.js'].lineData[217]++;
  function when(value, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[19]++;
    _$jscoverage['/promise.js'].lineData[218]++;
    var defer = new Defer(), done = 0;
    _$jscoverage['/promise.js'].lineData[222]++;
    function _fulfilled(value) {
      _$jscoverage['/promise.js'].functionData[20]++;
      _$jscoverage['/promise.js'].lineData[223]++;
      try {
        _$jscoverage['/promise.js'].lineData[224]++;
        return fulfilled ? fulfilled(value) : value;
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[229]++;
  S.log(visit539_229_1(e.stack || e), 'error');
  _$jscoverage['/promise.js'].lineData[230]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[234]++;
    function _rejected(reason) {
      _$jscoverage['/promise.js'].functionData[21]++;
      _$jscoverage['/promise.js'].lineData[235]++;
      try {
        _$jscoverage['/promise.js'].lineData[236]++;
        return rejected ? rejected(reason) : new Reject(reason);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[243]++;
  S.log(visit540_243_1(e.stack || e), 'error');
  _$jscoverage['/promise.js'].lineData[244]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[248]++;
    function finalFulfill(value) {
      _$jscoverage['/promise.js'].functionData[22]++;
      _$jscoverage['/promise.js'].lineData[249]++;
      if (visit541_249_1(done)) {
        _$jscoverage['/promise.js'].lineData[250]++;
        S.error('already done at fulfilled');
        _$jscoverage['/promise.js'].lineData[251]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[253]++;
      if (visit542_253_1(value instanceof Promise)) {
        _$jscoverage['/promise.js'].lineData[254]++;
        S.error('assert.not(value instanceof Promise) in when');
      }
      _$jscoverage['/promise.js'].lineData[256]++;
      done = 1;
      _$jscoverage['/promise.js'].lineData[257]++;
      defer.resolve(_fulfilled(value));
    }
    _$jscoverage['/promise.js'].lineData[260]++;
    if (visit543_260_1(value instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[261]++;
      promiseWhen(value, finalFulfill, function(reason) {
  _$jscoverage['/promise.js'].functionData[23]++;
  _$jscoverage['/promise.js'].lineData[262]++;
  if (visit544_262_1(done)) {
    _$jscoverage['/promise.js'].lineData[263]++;
    S.error('already done at rejected');
    _$jscoverage['/promise.js'].lineData[264]++;
    return;
  }
  _$jscoverage['/promise.js'].lineData[266]++;
  done = 1;
  _$jscoverage['/promise.js'].lineData[268]++;
  defer.resolve(_rejected(reason));
});
    } else {
      _$jscoverage['/promise.js'].lineData[271]++;
      finalFulfill(value);
    }
    _$jscoverage['/promise.js'].lineData[276]++;
    return defer.promise;
  }
  _$jscoverage['/promise.js'].lineData[279]++;
  function isResolved(obj) {
    _$jscoverage['/promise.js'].functionData[24]++;
    _$jscoverage['/promise.js'].lineData[281]++;
    return visit545_281_1(!isRejected(obj) && visit546_282_1(isPromise(obj) && visit547_284_1((visit548_284_2(obj[PROMISE_PENDINGS] === undefined)) && (visit549_288_1(!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))))));
  }
  _$jscoverage['/promise.js'].lineData[295]++;
  function isRejected(obj) {
    _$jscoverage['/promise.js'].functionData[25]++;
    _$jscoverage['/promise.js'].lineData[296]++;
    return visit550_296_1(isPromise(obj) && visit551_297_1((visit552_297_2(obj[PROMISE_PENDINGS] === undefined)) && (obj[PROMISE_VALUE] instanceof Reject)));
  }
  _$jscoverage['/promise.js'].lineData[301]++;
  KISSY.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[302]++;
  KISSY.Promise = Promise;
  _$jscoverage['/promise.js'].lineData[303]++;
  Promise.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[305]++;
  S.mix(Promise, {
  when: when, 
  isPromise: isPromise, 
  isResolved: isResolved, 
  isRejected: isRejected, 
  all: function(promises) {
  _$jscoverage['/promise.js'].functionData[26]++;
  _$jscoverage['/promise.js'].lineData[373]++;
  var count = promises.length;
  _$jscoverage['/promise.js'].lineData[374]++;
  if (visit553_374_1(!count)) {
    _$jscoverage['/promise.js'].lineData[375]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[377]++;
  var defer = Defer();
  _$jscoverage['/promise.js'].lineData[378]++;
  for (var i = 0; visit554_378_1(i < promises.length); i++) {
    _$jscoverage['/promise.js'].lineData[379]++;
    (function(promise, i) {
  _$jscoverage['/promise.js'].functionData[27]++;
  _$jscoverage['/promise.js'].lineData[380]++;
  when(promise, function(value) {
  _$jscoverage['/promise.js'].functionData[28]++;
  _$jscoverage['/promise.js'].lineData[381]++;
  promises[i] = value;
  _$jscoverage['/promise.js'].lineData[382]++;
  if (visit555_382_1(--count === 0)) {
    _$jscoverage['/promise.js'].lineData[385]++;
    defer.resolve(promises);
  }
}, function(r) {
  _$jscoverage['/promise.js'].functionData[29]++;
  _$jscoverage['/promise.js'].lineData[390]++;
  defer.reject(r);
});
})(promises[i], i);
  }
  _$jscoverage['/promise.js'].lineData[394]++;
  return defer.promise;
}});
})(KISSY);
