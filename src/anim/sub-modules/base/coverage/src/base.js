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
  _$jscoverage['/base.js'].lineData[24] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[37] = 0;
  _$jscoverage['/base.js'].lineData[41] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[44] = 0;
  _$jscoverage['/base.js'].lineData[45] = 0;
  _$jscoverage['/base.js'].lineData[47] = 0;
  _$jscoverage['/base.js'].lineData[48] = 0;
  _$jscoverage['/base.js'].lineData[52] = 0;
  _$jscoverage['/base.js'].lineData[58] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[80] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[95] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[100] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[126] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[129] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[136] = 0;
  _$jscoverage['/base.js'].lineData[137] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[141] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[149] = 0;
  _$jscoverage['/base.js'].lineData[150] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[153] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[175] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[205] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[243] = 0;
  _$jscoverage['/base.js'].lineData[244] = 0;
  _$jscoverage['/base.js'].lineData[245] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[248] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[252] = 0;
  _$jscoverage['/base.js'].lineData[255] = 0;
  _$jscoverage['/base.js'].lineData[270] = 0;
  _$jscoverage['/base.js'].lineData[274] = 0;
  _$jscoverage['/base.js'].lineData[275] = 0;
  _$jscoverage['/base.js'].lineData[278] = 0;
  _$jscoverage['/base.js'].lineData[279] = 0;
  _$jscoverage['/base.js'].lineData[280] = 0;
  _$jscoverage['/base.js'].lineData[284] = 0;
  _$jscoverage['/base.js'].lineData[293] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[307] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[310] = 0;
  _$jscoverage['/base.js'].lineData[312] = 0;
  _$jscoverage['/base.js'].lineData[315] = 0;
  _$jscoverage['/base.js'].lineData[316] = 0;
  _$jscoverage['/base.js'].lineData[317] = 0;
  _$jscoverage['/base.js'].lineData[319] = 0;
  _$jscoverage['/base.js'].lineData[320] = 0;
  _$jscoverage['/base.js'].lineData[321] = 0;
  _$jscoverage['/base.js'].lineData[322] = 0;
  _$jscoverage['/base.js'].lineData[324] = 0;
  _$jscoverage['/base.js'].lineData[327] = 0;
  _$jscoverage['/base.js'].lineData[329] = 0;
  _$jscoverage['/base.js'].lineData[330] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
  _$jscoverage['/base.js'].lineData[334] = 0;
  _$jscoverage['/base.js'].lineData[338] = 0;
  _$jscoverage['/base.js'].lineData[339] = 0;
  _$jscoverage['/base.js'].lineData[341] = 0;
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
  _$jscoverage['/base.js'].branchData['32'] = [];
  _$jscoverage['/base.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['44'] = [];
  _$jscoverage['/base.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['47'] = [];
  _$jscoverage['/base.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['60'] = [];
  _$jscoverage['/base.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['62'] = [];
  _$jscoverage['/base.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['64'] = [];
  _$jscoverage['/base.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['87'] = [];
  _$jscoverage['/base.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['95'] = [];
  _$jscoverage['/base.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['110'] = [];
  _$jscoverage['/base.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['113'] = [];
  _$jscoverage['/base.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['126'] = [];
  _$jscoverage['/base.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['126'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['127'] = [];
  _$jscoverage['/base.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'] = [];
  _$jscoverage['/base.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['137'] = [];
  _$jscoverage['/base.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['141'] = [];
  _$jscoverage['/base.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['142'] = [];
  _$jscoverage['/base.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['142'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['142'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['142'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['142'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['149'] = [];
  _$jscoverage['/base.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['152'] = [];
  _$jscoverage['/base.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['166'] = [];
  _$jscoverage['/base.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['172'] = [];
  _$jscoverage['/base.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['206'] = [];
  _$jscoverage['/base.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['212'] = [];
  _$jscoverage['/base.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['241'] = [];
  _$jscoverage['/base.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['246'] = [];
  _$jscoverage['/base.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['274'] = [];
  _$jscoverage['/base.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['279'] = [];
  _$jscoverage['/base.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['298'] = [];
  _$jscoverage['/base.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['302'] = [];
  _$jscoverage['/base.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['307'] = [];
  _$jscoverage['/base.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['308'] = [];
  _$jscoverage['/base.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['320'] = [];
  _$jscoverage['/base.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['327'] = [];
  _$jscoverage['/base.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['330'] = [];
  _$jscoverage['/base.js'].branchData['330'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['330'][1].init(129, 9, 'q && q[0]');
function visit70_330_1(result) {
  _$jscoverage['/base.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['327'][1].init(1011, 15, 'queue !== false');
function visit69_327_1(result) {
  _$jscoverage['/base.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['320'][1].init(829, 6, 'finish');
function visit68_320_1(result) {
  _$jscoverage['/base.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['308'][1].init(22, 15, 'queue !== false');
function visit67_308_1(result) {
  _$jscoverage['/base.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['307'][1].init(403, 37, '!self.isRunning() && !self.isPaused()');
function visit66_307_1(result) {
  _$jscoverage['/base.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['302'][1].init(255, 18, 'self.__waitTimeout');
function visit65_302_1(result) {
  _$jscoverage['/base.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['298'][1].init(149, 38, 'self.isResolved() || self.isRejected()');
function visit64_298_1(result) {
  _$jscoverage['/base.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['279'][1].init(107, 13, 'q.length == 1');
function visit63_279_1(result) {
  _$jscoverage['/base.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['274'][1].init(114, 15, 'queue === false');
function visit62_274_1(result) {
  _$jscoverage['/base.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['246'][1].init(234, 18, 'self.__waitTimeout');
function visit61_246_1(result) {
  _$jscoverage['/base.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['241'][1].init(48, 15, 'self.isPaused()');
function visit60_241_1(result) {
  _$jscoverage['/base.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['212'][1].init(263, 18, 'self.__waitTimeout');
function visit59_212_1(result) {
  _$jscoverage['/base.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['206'][1].init(48, 16, 'self.isRunning()');
function visit58_206_1(result) {
  _$jscoverage['/base.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['172'][1].init(3879, 27, 'S.isEmptyObject(_propsData)');
function visit57_172_1(result) {
  _$jscoverage['/base.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['166'][1].init(2661, 14, 'exit === false');
function visit56_166_1(result) {
  _$jscoverage['/base.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['152'][1].init(565, 13, 'val == \'hide\'');
function visit55_152_1(result) {
  _$jscoverage['/base.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['149'][1].init(423, 15, 'val == \'toggle\'');
function visit54_149_1(result) {
  _$jscoverage['/base.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['142'][5].init(57, 13, 'val == \'show\'');
function visit53_142_5(result) {
  _$jscoverage['/base.js'].branchData['142'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['142'][4].init(57, 24, 'val == \'show\' && !hidden');
function visit52_142_4(result) {
  _$jscoverage['/base.js'].branchData['142'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['142'][3].init(30, 13, 'val == \'hide\'');
function visit51_142_3(result) {
  _$jscoverage['/base.js'].branchData['142'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['142'][2].init(30, 23, 'val == \'hide\' && hidden');
function visit50_142_2(result) {
  _$jscoverage['/base.js'].branchData['142'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['142'][1].init(30, 51, 'val == \'hide\' && hidden || val == \'show\' && !hidden');
function visit49_142_1(result) {
  _$jscoverage['/base.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['141'][1].init(99, 16, 'specialVals[val]');
function visit48_141_1(result) {
  _$jscoverage['/base.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['137'][1].init(1321, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit47_137_1(result) {
  _$jscoverage['/base.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][1].init(30, 10, 'S.UA[\'ie\']');
function visit46_128_1(result) {
  _$jscoverage['/base.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['127'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit45_127_1(result) {
  _$jscoverage['/base.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['126'][2].init(697, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit44_126_2(result) {
  _$jscoverage['/base.js'].branchData['126'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['126'][1].init(697, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit43_126_1(result) {
  _$jscoverage['/base.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['113'][1].init(177, 21, 'to.width || to.height');
function visit42_113_1(result) {
  _$jscoverage['/base.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['110'][1].init(1038, 38, 'node.nodeType == NodeType.ELEMENT_NODE');
function visit41_110_1(result) {
  _$jscoverage['/base.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['95'][1].init(22, 21, '!S.isPlainObject(val)');
function visit40_95_1(result) {
  _$jscoverage['/base.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['87'][1].init(276, 17, 'config.delay || 0');
function visit39_87_1(result) {
  _$jscoverage['/base.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['64'][1].init(268, 14, 'name == \'step\'');
function visit38_64_1(result) {
  _$jscoverage['/base.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['62'][1].init(195, 13, 'name == \'end\'');
function visit37_62_1(result) {
  _$jscoverage['/base.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['60'][1].init(116, 18, 'name == \'complete\'');
function visit36_60_1(result) {
  _$jscoverage['/base.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['47'][1].init(221, 31, 'complete = self.config.complete');
function visit35_47_1(result) {
  _$jscoverage['/base.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['44'][1].init(96, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit34_44_1(result) {
  _$jscoverage['/base.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['32'][1].init(291, 22, '!S.isPlainObject(node)');
function visit33_32_1(result) {
  _$jscoverage['/base.js'].branchData['32'][1].ranCondition(result);
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
    var self = this;
    _$jscoverage['/base.js'].lineData[24]++;
    AnimBase.superclass.constructor.call(self);
    _$jscoverage['/base.js'].lineData[25]++;
    Promise.Defer(self);
    _$jscoverage['/base.js'].lineData[30]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[31]++;
    var node = config.node;
    _$jscoverage['/base.js'].lineData[32]++;
    if (visit33_32_1(!S.isPlainObject(node))) {
      _$jscoverage['/base.js'].lineData[33]++;
      node = Dom.get(config.node);
    }
    _$jscoverage['/base.js'].lineData[35]++;
    self.node = self.el = node;
    _$jscoverage['/base.js'].lineData[36]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[37]++;
    self._propsData = {};
  }
  _$jscoverage['/base.js'].lineData[41]++;
  function syncComplete(self) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[42]++;
    var _backupProps, complete;
    _$jscoverage['/base.js'].lineData[44]++;
    if (visit34_44_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[45]++;
      Dom.css(self.node, _backupProps);
    }
    _$jscoverage['/base.js'].lineData[47]++;
    if (visit35_47_1(complete = self.config.complete)) {
      _$jscoverage['/base.js'].lineData[48]++;
      complete.call(self);
    }
  }
  _$jscoverage['/base.js'].lineData[52]++;
  S.extend(AnimBase, Promise, {
  on: function(name, fn) {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[58]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[59]++;
  logger.warn('please use promise api of anim instead');
  _$jscoverage['/base.js'].lineData[60]++;
  if (visit36_60_1(name == 'complete')) {
    _$jscoverage['/base.js'].lineData[61]++;
    self.then(fn);
  } else {
    _$jscoverage['/base.js'].lineData[62]++;
    if (visit37_62_1(name == 'end')) {
      _$jscoverage['/base.js'].lineData[63]++;
      self.fin(fn);
    } else {
      _$jscoverage['/base.js'].lineData[64]++;
      if (visit38_64_1(name == 'step')) {
        _$jscoverage['/base.js'].lineData[65]++;
        self.progress(fn);
      } else {
        _$jscoverage['/base.js'].lineData[67]++;
        logger.error('not supported event for anim: ' + name);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[69]++;
  return self;
}, 
  prepareFx: noop, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[80]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit39_87_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[91]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[94]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[95]++;
  if (visit40_95_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[96]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[100]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[110]++;
  if (visit41_110_1(node.nodeType == NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[113]++;
    if (visit42_113_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[118]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[119]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[124]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[126]++;
      if (visit43_126_1(visit44_126_2(Dom.css(node, 'display') === 'inline') && visit45_127_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[128]++;
        if (visit46_128_1(S.UA['ie'])) {
          _$jscoverage['/base.js'].lineData[129]++;
          elStyle.zoom = 1;
        } else {
          _$jscoverage['/base.js'].lineData[131]++;
          elStyle.display = 'inline-block';
        }
      }
    }
    _$jscoverage['/base.js'].lineData[136]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[137]++;
    hidden = (visit47_137_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[138]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[139]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[141]++;
  if (visit48_141_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[142]++;
    if (visit49_142_1(visit50_142_2(visit51_142_3(val == 'hide') && hidden) || visit52_142_4(visit53_142_5(val == 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[144]++;
      self.stop(true);
      _$jscoverage['/base.js'].lineData[145]++;
      return exit = false;
    }
    _$jscoverage['/base.js'].lineData[148]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[149]++;
    if (visit54_149_1(val == 'toggle')) {
      _$jscoverage['/base.js'].lineData[150]++;
      val = hidden ? 'show' : 'hide';
    } else {
      _$jscoverage['/base.js'].lineData[152]++;
      if (visit55_152_1(val == 'hide')) {
        _$jscoverage['/base.js'].lineData[153]++;
        _propData.value = 0;
        _$jscoverage['/base.js'].lineData[155]++;
        _backupProps.display = 'none';
      } else {
        _$jscoverage['/base.js'].lineData[157]++;
        _propData.value = Dom.css(node, prop);
        _$jscoverage['/base.js'].lineData[159]++;
        Dom.css(node, prop, 0);
        _$jscoverage['/base.js'].lineData[160]++;
        Dom.show(node);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[163]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[166]++;
    if (visit56_166_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[167]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[171]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[172]++;
  if (visit57_172_1(S.isEmptyObject(_propsData))) {
    _$jscoverage['/base.js'].lineData[173]++;
    self.__totalTime = defaultDuration * 1000;
    _$jscoverage['/base.js'].lineData[174]++;
    self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[175]++;
  self.stop(true);
}, self.__totalTime);
  } else {
    _$jscoverage['/base.js'].lineData[178]++;
    self.prepareFx();
    _$jscoverage['/base.js'].lineData[179]++;
    self.doStart();
  }
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[188]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[196]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[205]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[206]++;
  if (visit58_206_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[208]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[209]++;
    self.__totalTime -= self._runTime;
    _$jscoverage['/base.js'].lineData[210]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[211]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[212]++;
    if (visit59_212_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[213]++;
      clearTimeout(self.__waitTimeout);
    } else {
      _$jscoverage['/base.js'].lineData[215]++;
      self.doStop();
    }
  }
  _$jscoverage['/base.js'].lineData[218]++;
  return self;
}, 
  doStop: noop, 
  doStart: noop, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[240]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[241]++;
  if (visit60_241_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[243]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[244]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[245]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[246]++;
    if (visit61_246_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[247]++;
      self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[248]++;
  self.stop(true);
}, self.__totalTime);
    } else {
      _$jscoverage['/base.js'].lineData[251]++;
      self['beforeResume']();
      _$jscoverage['/base.js'].lineData[252]++;
      self.doStart();
    }
  }
  _$jscoverage['/base.js'].lineData[255]++;
  return self;
}, 
  'beforeResume': noop, 
  run: function() {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[270]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[274]++;
  if (visit62_274_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[275]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[278]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[279]++;
    if (visit63_279_1(q.length == 1)) {
      _$jscoverage['/base.js'].lineData[280]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[284]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[293]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[298]++;
  if (visit64_298_1(self.isResolved() || self.isRejected())) {
    _$jscoverage['/base.js'].lineData[299]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[302]++;
  if (visit65_302_1(self.__waitTimeout)) {
    _$jscoverage['/base.js'].lineData[303]++;
    clearTimeout(self.__waitTimeout);
    _$jscoverage['/base.js'].lineData[304]++;
    self.__waitTimeout = 0;
  }
  _$jscoverage['/base.js'].lineData[307]++;
  if (visit66_307_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[308]++;
    if (visit67_308_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[310]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[312]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[315]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[316]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[317]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[319]++;
  var defer = self.defer;
  _$jscoverage['/base.js'].lineData[320]++;
  if (visit68_320_1(finish)) {
    _$jscoverage['/base.js'].lineData[321]++;
    syncComplete(self);
    _$jscoverage['/base.js'].lineData[322]++;
    defer.resolve([self]);
  } else {
    _$jscoverage['/base.js'].lineData[324]++;
    defer.reject([self]);
  }
  _$jscoverage['/base.js'].lineData[327]++;
  if (visit69_327_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[329]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[330]++;
    if (visit70_330_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[331]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[334]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[338]++;
  AnimBase.Utils = Utils;
  _$jscoverage['/base.js'].lineData[339]++;
  AnimBase.Q = Q;
  _$jscoverage['/base.js'].lineData[341]++;
  return AnimBase;
}, {
  requires: ['dom', './base/utils', 'promise', './base/queue']});
