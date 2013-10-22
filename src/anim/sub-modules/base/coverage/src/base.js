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
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[37] = 0;
  _$jscoverage['/base.js'].lineData[38] = 0;
  _$jscoverage['/base.js'].lineData[39] = 0;
  _$jscoverage['/base.js'].lineData[41] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[46] = 0;
  _$jscoverage['/base.js'].lineData[47] = 0;
  _$jscoverage['/base.js'].lineData[50] = 0;
  _$jscoverage['/base.js'].lineData[51] = 0;
  _$jscoverage['/base.js'].lineData[55] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[129] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[132] = 0;
  _$jscoverage['/base.js'].lineData[134] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[147] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[151] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[153] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[158] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[175] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[244] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[248] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[250] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[254] = 0;
  _$jscoverage['/base.js'].lineData[255] = 0;
  _$jscoverage['/base.js'].lineData[258] = 0;
  _$jscoverage['/base.js'].lineData[273] = 0;
  _$jscoverage['/base.js'].lineData[277] = 0;
  _$jscoverage['/base.js'].lineData[278] = 0;
  _$jscoverage['/base.js'].lineData[281] = 0;
  _$jscoverage['/base.js'].lineData[282] = 0;
  _$jscoverage['/base.js'].lineData[283] = 0;
  _$jscoverage['/base.js'].lineData[287] = 0;
  _$jscoverage['/base.js'].lineData[296] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[306] = 0;
  _$jscoverage['/base.js'].lineData[307] = 0;
  _$jscoverage['/base.js'].lineData[310] = 0;
  _$jscoverage['/base.js'].lineData[311] = 0;
  _$jscoverage['/base.js'].lineData[313] = 0;
  _$jscoverage['/base.js'].lineData[315] = 0;
  _$jscoverage['/base.js'].lineData[318] = 0;
  _$jscoverage['/base.js'].lineData[319] = 0;
  _$jscoverage['/base.js'].lineData[320] = 0;
  _$jscoverage['/base.js'].lineData[322] = 0;
  _$jscoverage['/base.js'].lineData[323] = 0;
  _$jscoverage['/base.js'].lineData[324] = 0;
  _$jscoverage['/base.js'].lineData[326] = 0;
  _$jscoverage['/base.js'].lineData[329] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
  _$jscoverage['/base.js'].lineData[332] = 0;
  _$jscoverage['/base.js'].lineData[333] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[340] = 0;
  _$jscoverage['/base.js'].lineData[341] = 0;
  _$jscoverage['/base.js'].lineData[343] = 0;
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
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['33'] = [];
  _$jscoverage['/base.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['41'] = [];
  _$jscoverage['/base.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['50'] = [];
  _$jscoverage['/base.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['63'] = [];
  _$jscoverage['/base.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['65'] = [];
  _$jscoverage['/base.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['67'] = [];
  _$jscoverage['/base.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['90'] = [];
  _$jscoverage['/base.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['98'] = [];
  _$jscoverage['/base.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['113'] = [];
  _$jscoverage['/base.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['116'] = [];
  _$jscoverage['/base.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['129'] = [];
  _$jscoverage['/base.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['130'] = [];
  _$jscoverage['/base.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'] = [];
  _$jscoverage['/base.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['140'] = [];
  _$jscoverage['/base.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['144'] = [];
  _$jscoverage['/base.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'] = [];
  _$jscoverage['/base.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['145'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['152'] = [];
  _$jscoverage['/base.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['155'] = [];
  _$jscoverage['/base.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['169'] = [];
  _$jscoverage['/base.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['175'] = [];
  _$jscoverage['/base.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['209'] = [];
  _$jscoverage['/base.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['215'] = [];
  _$jscoverage['/base.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['244'] = [];
  _$jscoverage['/base.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['249'] = [];
  _$jscoverage['/base.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['277'] = [];
  _$jscoverage['/base.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['282'] = [];
  _$jscoverage['/base.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['301'] = [];
  _$jscoverage['/base.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['305'] = [];
  _$jscoverage['/base.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['310'] = [];
  _$jscoverage['/base.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['311'] = [];
  _$jscoverage['/base.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['323'] = [];
  _$jscoverage['/base.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['329'] = [];
  _$jscoverage['/base.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['332'] = [];
  _$jscoverage['/base.js'].branchData['332'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['332'][1].init(129, 9, 'q && q[0]');
function visit70_332_1(result) {
  _$jscoverage['/base.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['329'][1].init(974, 15, 'queue !== false');
function visit69_329_1(result) {
  _$jscoverage['/base.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['323'][1].init(829, 6, 'finish');
function visit68_323_1(result) {
  _$jscoverage['/base.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['311'][1].init(22, 15, 'queue !== false');
function visit67_311_1(result) {
  _$jscoverage['/base.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['310'][1].init(403, 37, '!self.isRunning() && !self.isPaused()');
function visit66_310_1(result) {
  _$jscoverage['/base.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['305'][1].init(255, 18, 'self.__waitTimeout');
function visit65_305_1(result) {
  _$jscoverage['/base.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['301'][1].init(149, 38, 'self.isResolved() || self.isRejected()');
function visit64_301_1(result) {
  _$jscoverage['/base.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['282'][1].init(107, 13, 'q.length == 1');
function visit63_282_1(result) {
  _$jscoverage['/base.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['277'][1].init(114, 15, 'queue === false');
function visit62_277_1(result) {
  _$jscoverage['/base.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['249'][1].init(234, 18, 'self.__waitTimeout');
function visit61_249_1(result) {
  _$jscoverage['/base.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['244'][1].init(48, 15, 'self.isPaused()');
function visit60_244_1(result) {
  _$jscoverage['/base.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['215'][1].init(263, 18, 'self.__waitTimeout');
function visit59_215_1(result) {
  _$jscoverage['/base.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['209'][1].init(48, 16, 'self.isRunning()');
function visit58_209_1(result) {
  _$jscoverage['/base.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['175'][1].init(3879, 27, 'S.isEmptyObject(_propsData)');
function visit57_175_1(result) {
  _$jscoverage['/base.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['169'][1].init(2661, 14, 'exit === false');
function visit56_169_1(result) {
  _$jscoverage['/base.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['155'][1].init(565, 13, 'val == \'hide\'');
function visit55_155_1(result) {
  _$jscoverage['/base.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['152'][1].init(423, 15, 'val == \'toggle\'');
function visit54_152_1(result) {
  _$jscoverage['/base.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][5].init(57, 13, 'val == \'show\'');
function visit53_145_5(result) {
  _$jscoverage['/base.js'].branchData['145'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][4].init(57, 24, 'val == \'show\' && !hidden');
function visit52_145_4(result) {
  _$jscoverage['/base.js'].branchData['145'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][3].init(30, 13, 'val == \'hide\'');
function visit51_145_3(result) {
  _$jscoverage['/base.js'].branchData['145'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][2].init(30, 23, 'val == \'hide\' && hidden');
function visit50_145_2(result) {
  _$jscoverage['/base.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['145'][1].init(30, 51, 'val == \'hide\' && hidden || val == \'show\' && !hidden');
function visit49_145_1(result) {
  _$jscoverage['/base.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['144'][1].init(99, 16, 'specialVals[val]');
function visit48_144_1(result) {
  _$jscoverage['/base.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['140'][1].init(1321, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit47_140_1(result) {
  _$jscoverage['/base.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][1].init(30, 10, 'S.UA[\'ie\']');
function visit46_131_1(result) {
  _$jscoverage['/base.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['130'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit45_130_1(result) {
  _$jscoverage['/base.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['129'][2].init(697, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit44_129_2(result) {
  _$jscoverage['/base.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['129'][1].init(697, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit43_129_1(result) {
  _$jscoverage['/base.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['116'][1].init(177, 21, 'to.width || to.height');
function visit42_116_1(result) {
  _$jscoverage['/base.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['113'][1].init(1038, 38, 'node.nodeType == NodeType.ELEMENT_NODE');
function visit41_113_1(result) {
  _$jscoverage['/base.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['98'][1].init(22, 21, '!S.isPlainObject(val)');
function visit40_98_1(result) {
  _$jscoverage['/base.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['90'][1].init(276, 17, 'config.delay || 0');
function visit39_90_1(result) {
  _$jscoverage['/base.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['67'][1].init(268, 14, 'name == \'step\'');
function visit38_67_1(result) {
  _$jscoverage['/base.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['65'][1].init(195, 13, 'name == \'end\'');
function visit37_65_1(result) {
  _$jscoverage['/base.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['63'][1].init(116, 18, 'name == \'complete\'');
function visit36_63_1(result) {
  _$jscoverage['/base.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['50'][1].init(116, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit35_50_1(result) {
  _$jscoverage['/base.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['41'][1].init(541, 26, 'complete = config.complete');
function visit34_41_1(result) {
  _$jscoverage['/base.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['33'][1].init(314, 22, '!S.isPlainObject(node)');
function visit33_33_1(result) {
  _$jscoverage['/base.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add('anim/base', function(S, Dom, Utils, Promise, Q) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var NodeType = Dom.NodeType, noop = S.noop, logger = S.getLogger('s/anim'), specialVals = {
  toggle: 1, 
  hide: 1, 
  show: 1};
  _$jscoverage['/base.js'].lineData[22]++;
  function AnimBase(config) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[23]++;
    var self = this, complete;
    _$jscoverage['/base.js'].lineData[25]++;
    AnimBase.superclass.constructor.call(self);
    _$jscoverage['/base.js'].lineData[26]++;
    Promise.Defer(self);
    _$jscoverage['/base.js'].lineData[31]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[32]++;
    var node = config.node;
    _$jscoverage['/base.js'].lineData[33]++;
    if (visit33_33_1(!S.isPlainObject(node))) {
      _$jscoverage['/base.js'].lineData[34]++;
      node = Dom.get(config.node);
    }
    _$jscoverage['/base.js'].lineData[36]++;
    self.node = self.el = node;
    _$jscoverage['/base.js'].lineData[37]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[38]++;
    self._propsData = {};
    _$jscoverage['/base.js'].lineData[39]++;
    self.then(onComplete);
    _$jscoverage['/base.js'].lineData[41]++;
    if (visit34_41_1(complete = config.complete)) {
      _$jscoverage['/base.js'].lineData[42]++;
      self.then(complete);
    }
  }
  _$jscoverage['/base.js'].lineData[46]++;
  function onComplete(value) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[47]++;
    var _backupProps, self = value[0];
    _$jscoverage['/base.js'].lineData[50]++;
    if (visit35_50_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[51]++;
      Dom.css(self.node, _backupProps);
    }
  }
  _$jscoverage['/base.js'].lineData[55]++;
  S.extend(AnimBase, Promise, {
  on: function(name, fn) {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[61]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[62]++;
  logger.warn('please use promise api of anim instead');
  _$jscoverage['/base.js'].lineData[63]++;
  if (visit36_63_1(name == 'complete')) {
    _$jscoverage['/base.js'].lineData[64]++;
    self.then(fn);
  } else {
    _$jscoverage['/base.js'].lineData[65]++;
    if (visit37_65_1(name == 'end')) {
      _$jscoverage['/base.js'].lineData[66]++;
      self.fin(fn);
    } else {
      _$jscoverage['/base.js'].lineData[67]++;
      if (visit38_67_1(name == 'step')) {
        _$jscoverage['/base.js'].lineData[68]++;
        self.progress(fn);
      } else {
        _$jscoverage['/base.js'].lineData[70]++;
        logger.error('not supported event for anim: ' + name);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[72]++;
  return self;
}, 
  prepareFx: noop, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[83]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit39_90_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[94]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[97]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[98]++;
  if (visit40_98_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[99]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[103]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[113]++;
  if (visit41_113_1(node.nodeType == NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[116]++;
    if (visit42_116_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[121]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[122]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[127]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[129]++;
      if (visit43_129_1(visit44_129_2(Dom.css(node, 'display') === 'inline') && visit45_130_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[131]++;
        if (visit46_131_1(S.UA['ie'])) {
          _$jscoverage['/base.js'].lineData[132]++;
          elStyle.zoom = 1;
        } else {
          _$jscoverage['/base.js'].lineData[134]++;
          elStyle.display = 'inline-block';
        }
      }
    }
    _$jscoverage['/base.js'].lineData[139]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[140]++;
    hidden = (visit47_140_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[141]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[142]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[144]++;
  if (visit48_144_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[145]++;
    if (visit49_145_1(visit50_145_2(visit51_145_3(val == 'hide') && hidden) || visit52_145_4(visit53_145_5(val == 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[147]++;
      self.stop(true);
      _$jscoverage['/base.js'].lineData[148]++;
      return exit = false;
    }
    _$jscoverage['/base.js'].lineData[151]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[152]++;
    if (visit54_152_1(val == 'toggle')) {
      _$jscoverage['/base.js'].lineData[153]++;
      val = hidden ? 'show' : 'hide';
    } else {
      _$jscoverage['/base.js'].lineData[155]++;
      if (visit55_155_1(val == 'hide')) {
        _$jscoverage['/base.js'].lineData[156]++;
        _propData.value = 0;
        _$jscoverage['/base.js'].lineData[158]++;
        _backupProps.display = 'none';
      } else {
        _$jscoverage['/base.js'].lineData[160]++;
        _propData.value = Dom.css(node, prop);
        _$jscoverage['/base.js'].lineData[162]++;
        Dom.css(node, prop, 0);
        _$jscoverage['/base.js'].lineData[163]++;
        Dom.show(node);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[166]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[169]++;
    if (visit56_169_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[170]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[174]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[175]++;
  if (visit57_175_1(S.isEmptyObject(_propsData))) {
    _$jscoverage['/base.js'].lineData[176]++;
    self.__totalTime = defaultDuration * 1000;
    _$jscoverage['/base.js'].lineData[177]++;
    self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[178]++;
  self.stop(true);
}, self.__totalTime);
  } else {
    _$jscoverage['/base.js'].lineData[181]++;
    self.prepareFx();
    _$jscoverage['/base.js'].lineData[182]++;
    self.doStart();
  }
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[191]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[199]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[208]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[209]++;
  if (visit58_209_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[211]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[212]++;
    self.__totalTime -= self._runTime;
    _$jscoverage['/base.js'].lineData[213]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[214]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[215]++;
    if (visit59_215_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[216]++;
      clearTimeout(self.__waitTimeout);
    } else {
      _$jscoverage['/base.js'].lineData[218]++;
      self.doStop();
    }
  }
  _$jscoverage['/base.js'].lineData[221]++;
  return self;
}, 
  doStop: noop, 
  doStart: noop, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[243]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[244]++;
  if (visit60_244_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[246]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[247]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[248]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[249]++;
    if (visit61_249_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[250]++;
      self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[251]++;
  self.stop(true);
}, self.__totalTime);
    } else {
      _$jscoverage['/base.js'].lineData[254]++;
      self['beforeResume']();
      _$jscoverage['/base.js'].lineData[255]++;
      self.doStart();
    }
  }
  _$jscoverage['/base.js'].lineData[258]++;
  return self;
}, 
  'beforeResume': noop, 
  run: function() {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[273]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[277]++;
  if (visit62_277_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[278]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[281]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[282]++;
    if (visit63_282_1(q.length == 1)) {
      _$jscoverage['/base.js'].lineData[283]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[287]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[296]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[301]++;
  if (visit64_301_1(self.isResolved() || self.isRejected())) {
    _$jscoverage['/base.js'].lineData[302]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[305]++;
  if (visit65_305_1(self.__waitTimeout)) {
    _$jscoverage['/base.js'].lineData[306]++;
    clearTimeout(self.__waitTimeout);
    _$jscoverage['/base.js'].lineData[307]++;
    self.__waitTimeout = 0;
  }
  _$jscoverage['/base.js'].lineData[310]++;
  if (visit66_310_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[311]++;
    if (visit67_311_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[313]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[315]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[318]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[319]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[320]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[322]++;
  var defer = self.defer;
  _$jscoverage['/base.js'].lineData[323]++;
  if (visit68_323_1(finish)) {
    _$jscoverage['/base.js'].lineData[324]++;
    defer.resolve([self]);
  } else {
    _$jscoverage['/base.js'].lineData[326]++;
    defer.reject([self]);
  }
  _$jscoverage['/base.js'].lineData[329]++;
  if (visit69_329_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[331]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[332]++;
    if (visit70_332_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[333]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[336]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[340]++;
  AnimBase.Utils = Utils;
  _$jscoverage['/base.js'].lineData[341]++;
  AnimBase.Q = Q;
  _$jscoverage['/base.js'].lineData[343]++;
  return AnimBase;
}, {
  requires: ['dom', './base/utils', 'promise', './base/queue']});
