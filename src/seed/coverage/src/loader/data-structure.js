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
if (! _$jscoverage['/loader/data-structure.js']) {
  _$jscoverage['/loader/data-structure.js'] = {};
  _$jscoverage['/loader/data-structure.js'].lineData = [];
  _$jscoverage['/loader/data-structure.js'].lineData[6] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[7] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[12] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[23] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[27] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[29] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[38] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[46] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[54] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[58] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[60] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[72] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[73] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[74] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[76] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[84] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[92] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[100] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[108] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[116] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[124] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[128] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[135] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[136] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[137] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[138] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[141] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[143] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[147] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[148] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[150] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[151] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[152] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[153] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[155] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[156] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[160] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[168] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[176] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[178] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[179] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[180] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[182] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[184] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[186] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[194] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[201] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[203] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[205] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[209] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[212] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[214] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[215] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[216] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[217] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[220] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[222] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[230] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[232] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[233] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[234] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[236] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[244] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[245] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[254] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[262] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[270] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[271] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[281] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[282] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[290] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[291] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[299] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[301] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[302] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[307] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[310] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[311] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[312] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[313] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[316] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[324] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[329] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[330] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[331] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[334] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[336] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[337] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[343] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[345] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[346] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[350] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[352] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[353] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[356] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[359] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[364] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[365] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[369] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[370] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[371] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[374] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].functionData) {
  _$jscoverage['/loader/data-structure.js'].functionData = [];
  _$jscoverage['/loader/data-structure.js'].functionData[0] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[1] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[2] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[3] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[4] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[5] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[6] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[7] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[8] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[9] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[10] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[11] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[12] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[14] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[15] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[16] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[17] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[18] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[19] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[20] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[21] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[22] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[23] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[25] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[26] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[27] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[28] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[29] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[30] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[31] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[32] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[33] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[34] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].branchData) {
  _$jscoverage['/loader/data-structure.js'].branchData = {};
  _$jscoverage['/loader/data-structure.js'].branchData['61'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['73'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['150'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['178'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['179'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['201'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['202'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['209'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['215'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['232'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['245'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['271'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['282'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['291'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['310'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['310'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['311'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['312'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['329'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['329'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['330'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['331'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['333'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['352'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['370'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['370'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['374'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['374'][1] = new BranchData();
}
_$jscoverage['/loader/data-structure.js'].branchData['374'][1].init(318, 32, 'packages[pName] || systemPackage');
function visit405_374_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['370'][2].init(57, 23, 'p.length > pName.length');
function visit404_370_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['370'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['370'][1].init(18, 62, 'S.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit403_370_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['352'][1].init(192, 24, 'm.getPackage().isDebug()');
function visit402_352_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['333'][1].init(114, 34, 'normalizedRequiresStatus == status');
function visit401_333_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['331'][1].init(345, 150, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus == status)');
function visit400_331_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['330'][1].init(25, 14, 'requires || []');
function visit399_330_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['329'][2].init(255, 20, 'requires.length == 0');
function visit398_329_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['329'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['329'][1].init(242, 33, '!requires || requires.length == 0');
function visit397_329_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['312'][1].init(254, 18, '!requiresWithAlias');
function visit396_312_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['311'][1].init(25, 14, 'requires || []');
function visit395_311_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['310'][2].init(165, 20, 'requires.length == 0');
function visit394_310_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['310'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['310'][1].init(152, 33, '!requires || requires.length == 0');
function visit393_310_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['291'][1].init(51, 46, 'self.charset || self.getPackage().getCharset()');
function visit392_291_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['282'][1].init(51, 38, 'self.tag || self.getPackage().getTag()');
function visit391_282_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['271'][1].init(51, 93, 'self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name))');
function visit390_271_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['245'][1].init(51, 72, 'self.path || (self.path = defaultComponentJsName(self))');
function visit389_245_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['232'][1].init(78, 14, '!self.fullpath');
function visit388_232_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['215'][1].init(578, 17, 't = self.getTag()');
function visit387_215_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['209'][1].init(217, 178, 'packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.getName())');
function visit386_209_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['202'][1].init(22, 13, 'self.fullpath');
function visit385_202_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['201'][1].init(214, 17, '!self.fullPathUri');
function visit384_201_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['179'][1].init(22, 47, 'Path.extname(self.name).toLowerCase() == \'.css\'');
function visit383_179_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['178'][1].init(80, 2, '!v');
function visit382_178_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['150'][1].init(124, 7, 'i < len');
function visit381_150_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['73'][1].init(48, 15, 'self.packageUri');
function visit380_73_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['61'][1].init(-1, 47, 'packageName && !self.isIgnorePackageNameInUri()');
function visit379_61_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/data-structure.js'].functionData[0]++;
  _$jscoverage['/loader/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, IGNORE_PACKAGE_NAME_IN_URI = 'ignorePackageNameInUri', Utils = Loader.Utils;
  _$jscoverage['/loader/data-structure.js'].lineData[12]++;
  function forwardSystemPackage(self, property) {
    _$jscoverage['/loader/data-structure.js'].functionData[1]++;
    _$jscoverage['/loader/data-structure.js'].lineData[13]++;
    return property in self ? self[property] : self.runtime.Config[property];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[23]++;
  function Package(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[2]++;
    _$jscoverage['/loader/data-structure.js'].lineData[24]++;
    S.mix(this, cfg);
  }
  _$jscoverage['/loader/data-structure.js'].lineData[27]++;
  S.augment(Package, {
  reset: function(cfg) {
  _$jscoverage['/loader/data-structure.js'].functionData[3]++;
  _$jscoverage['/loader/data-structure.js'].lineData[29]++;
  S.mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[4]++;
  _$jscoverage['/loader/data-structure.js'].lineData[38]++;
  return forwardSystemPackage(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[5]++;
  _$jscoverage['/loader/data-structure.js'].lineData[46]++;
  return this.name;
}, 
  'getBase': function() {
  _$jscoverage['/loader/data-structure.js'].functionData[6]++;
  _$jscoverage['/loader/data-structure.js'].lineData[54]++;
  return forwardSystemPackage(this, 'base');
}, 
  getPrefixUriForCombo: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[7]++;
  _$jscoverage['/loader/data-structure.js'].lineData[58]++;
  var self = this, packageName = self.getName();
  _$jscoverage['/loader/data-structure.js'].lineData[60]++;
  return self.getBase() + (visit379_61_1(packageName && !self.isIgnorePackageNameInUri()) ? (packageName + '/') : '');
}, 
  getPackageUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[8]++;
  _$jscoverage['/loader/data-structure.js'].lineData[72]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[73]++;
  if (visit380_73_1(self.packageUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[74]++;
    return self.packageUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[76]++;
  return self.packageUri = new S.Uri(this.getPrefixUriForCombo());
}, 
  getBaseUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[9]++;
  _$jscoverage['/loader/data-structure.js'].lineData[84]++;
  return forwardSystemPackage(this, 'baseUri');
}, 
  isDebug: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[10]++;
  _$jscoverage['/loader/data-structure.js'].lineData[92]++;
  return forwardSystemPackage(this, 'debug');
}, 
  isIgnorePackageNameInUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[11]++;
  _$jscoverage['/loader/data-structure.js'].lineData[100]++;
  return forwardSystemPackage(this, IGNORE_PACKAGE_NAME_IN_URI);
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[12]++;
  _$jscoverage['/loader/data-structure.js'].lineData[108]++;
  return forwardSystemPackage(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[13]++;
  _$jscoverage['/loader/data-structure.js'].lineData[116]++;
  return forwardSystemPackage(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[14]++;
  _$jscoverage['/loader/data-structure.js'].lineData[124]++;
  return forwardSystemPackage(this, 'group');
}});
  _$jscoverage['/loader/data-structure.js'].lineData[128]++;
  Loader.Package = Package;
  _$jscoverage['/loader/data-structure.js'].lineData[135]++;
  function Module(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[15]++;
    _$jscoverage['/loader/data-structure.js'].lineData[136]++;
    this.status = Loader.Status.INIT;
    _$jscoverage['/loader/data-structure.js'].lineData[137]++;
    S.mix(this, cfg);
    _$jscoverage['/loader/data-structure.js'].lineData[138]++;
    this.waitedCallbacks = [];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[141]++;
  S.augment(Module, {
  wait: function(callback) {
  _$jscoverage['/loader/data-structure.js'].functionData[16]++;
  _$jscoverage['/loader/data-structure.js'].lineData[143]++;
  this.waitedCallbacks.push(callback);
}, 
  notifyAll: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[17]++;
  _$jscoverage['/loader/data-structure.js'].lineData[147]++;
  var callback;
  _$jscoverage['/loader/data-structure.js'].lineData[148]++;
  var len = this.waitedCallbacks.length, i = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[150]++;
  for (; visit381_150_1(i < len); i++) {
    _$jscoverage['/loader/data-structure.js'].lineData[151]++;
    callback = this.waitedCallbacks[i];
    _$jscoverage['/loader/data-structure.js'].lineData[152]++;
    try {
      _$jscoverage['/loader/data-structure.js'].lineData[153]++;
      callback(this);
    }    catch (e) {
  _$jscoverage['/loader/data-structure.js'].lineData[155]++;
  setTimeout(function() {
  _$jscoverage['/loader/data-structure.js'].functionData[18]++;
  _$jscoverage['/loader/data-structure.js'].lineData[156]++;
  throw e;
}, 0);
}
  }
  _$jscoverage['/loader/data-structure.js'].lineData[160]++;
  this.waitedCallbacks = [];
}, 
  setValue: function(v) {
  _$jscoverage['/loader/data-structure.js'].functionData[19]++;
  _$jscoverage['/loader/data-structure.js'].lineData[168]++;
  this.value = v;
}, 
  getType: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[20]++;
  _$jscoverage['/loader/data-structure.js'].lineData[176]++;
  var self = this, v = self.type;
  _$jscoverage['/loader/data-structure.js'].lineData[178]++;
  if (visit382_178_1(!v)) {
    _$jscoverage['/loader/data-structure.js'].lineData[179]++;
    if (visit383_179_1(Path.extname(self.name).toLowerCase() == '.css')) {
      _$jscoverage['/loader/data-structure.js'].lineData[180]++;
      v = 'css';
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[182]++;
      v = 'js';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[184]++;
    self.type = v;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[186]++;
  return v;
}, 
  getFullPathUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[21]++;
  _$jscoverage['/loader/data-structure.js'].lineData[194]++;
  var self = this, t, fullPathUri, packageBaseUri, packageInfo, packageName, path;
  _$jscoverage['/loader/data-structure.js'].lineData[201]++;
  if (visit384_201_1(!self.fullPathUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[202]++;
    if (visit385_202_1(self.fullpath)) {
      _$jscoverage['/loader/data-structure.js'].lineData[203]++;
      fullPathUri = new S.Uri(self.fullpath);
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[205]++;
      packageInfo = self.getPackage();
      _$jscoverage['/loader/data-structure.js'].lineData[206]++;
      packageBaseUri = packageInfo.getBaseUri();
      _$jscoverage['/loader/data-structure.js'].lineData[207]++;
      path = self.getPath();
      _$jscoverage['/loader/data-structure.js'].lineData[209]++;
      if (visit386_209_1(packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.getName()))) {
        _$jscoverage['/loader/data-structure.js'].lineData[212]++;
        path = Path.relative(packageName, path);
      }
      _$jscoverage['/loader/data-structure.js'].lineData[214]++;
      fullPathUri = packageBaseUri.resolve(path);
      _$jscoverage['/loader/data-structure.js'].lineData[215]++;
      if (visit387_215_1(t = self.getTag())) {
        _$jscoverage['/loader/data-structure.js'].lineData[216]++;
        t += '.' + self.getType();
        _$jscoverage['/loader/data-structure.js'].lineData[217]++;
        fullPathUri.query.set('t', t);
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[220]++;
    self.fullPathUri = fullPathUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[222]++;
  return self.fullPathUri;
}, 
  getFullPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[22]++;
  _$jscoverage['/loader/data-structure.js'].lineData[230]++;
  var self = this, fullPathUri;
  _$jscoverage['/loader/data-structure.js'].lineData[232]++;
  if (visit388_232_1(!self.fullpath)) {
    _$jscoverage['/loader/data-structure.js'].lineData[233]++;
    fullPathUri = self.getFullPathUri();
    _$jscoverage['/loader/data-structure.js'].lineData[234]++;
    self.fullpath = Utils.getMappedPath(self.runtime, fullPathUri.toString());
  }
  _$jscoverage['/loader/data-structure.js'].lineData[236]++;
  return self.fullpath;
}, 
  getPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[23]++;
  _$jscoverage['/loader/data-structure.js'].lineData[244]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[245]++;
  return visit389_245_1(self.path || (self.path = defaultComponentJsName(self)));
}, 
  getValue: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[24]++;
  _$jscoverage['/loader/data-structure.js'].lineData[254]++;
  return this.value;
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[25]++;
  _$jscoverage['/loader/data-structure.js'].lineData[262]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[26]++;
  _$jscoverage['/loader/data-structure.js'].lineData[270]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[271]++;
  return visit390_271_1(self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name)));
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[27]++;
  _$jscoverage['/loader/data-structure.js'].lineData[281]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[282]++;
  return visit391_282_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[28]++;
  _$jscoverage['/loader/data-structure.js'].lineData[290]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[291]++;
  return visit392_291_1(self.charset || self.getPackage().getCharset());
}, 
  'getRequiredMods': function() {
  _$jscoverage['/loader/data-structure.js'].functionData[29]++;
  _$jscoverage['/loader/data-structure.js'].lineData[299]++;
  var self = this, runtime = self.runtime;
  _$jscoverage['/loader/data-structure.js'].lineData[301]++;
  return S.map(self.getNormalizedRequires(), function(r) {
  _$jscoverage['/loader/data-structure.js'].functionData[30]++;
  _$jscoverage['/loader/data-structure.js'].lineData[302]++;
  return Utils.createModuleInfo(runtime, r);
});
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[31]++;
  _$jscoverage['/loader/data-structure.js'].lineData[307]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[310]++;
  if (visit393_310_1(!requires || visit394_310_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[311]++;
    return visit395_311_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[312]++;
    if (visit396_312_1(!requiresWithAlias)) {
      _$jscoverage['/loader/data-structure.js'].lineData[313]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[316]++;
  return requiresWithAlias;
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[32]++;
  _$jscoverage['/loader/data-structure.js'].lineData[324]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[329]++;
  if (visit397_329_1(!requires || visit398_329_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[330]++;
    return visit399_330_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[331]++;
    if (visit400_331_1((normalizedRequires = self.normalizedRequires) && (visit401_333_1(normalizedRequiresStatus == status)))) {
      _$jscoverage['/loader/data-structure.js'].lineData[334]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[336]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/loader/data-structure.js'].lineData[337]++;
      return self.normalizedRequires = Utils.normalizeModNames(self.runtime, requires, self.name);
    }
  }
}});
  _$jscoverage['/loader/data-structure.js'].lineData[343]++;
  Loader.Module = Module;
  _$jscoverage['/loader/data-structure.js'].lineData[345]++;
  function defaultComponentJsName(m) {
    _$jscoverage['/loader/data-structure.js'].functionData[33]++;
    _$jscoverage['/loader/data-structure.js'].lineData[346]++;
    var name = m.name, extname = '.' + m.getType(), min = '-min';
    _$jscoverage['/loader/data-structure.js'].lineData[350]++;
    name = Path.join(Path.dirname(name), Path.basename(name, extname));
    _$jscoverage['/loader/data-structure.js'].lineData[352]++;
    if (visit402_352_1(m.getPackage().isDebug())) {
      _$jscoverage['/loader/data-structure.js'].lineData[353]++;
      min = '';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[356]++;
    return name + min + extname;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[359]++;
  var systemPackage = new Package({
  name: '', 
  runtime: S});
  _$jscoverage['/loader/data-structure.js'].lineData[364]++;
  function getPackage(self, modName) {
    _$jscoverage['/loader/data-structure.js'].functionData[34]++;
    _$jscoverage['/loader/data-structure.js'].lineData[365]++;
    var packages = self.config('packages'), modNameSlash = modName + '/', pName = '', p;
    _$jscoverage['/loader/data-structure.js'].lineData[369]++;
    for (p in packages) {
      _$jscoverage['/loader/data-structure.js'].lineData[370]++;
      if (visit403_370_1(S.startsWith(modNameSlash, p + '/') && visit404_370_2(p.length > pName.length))) {
        _$jscoverage['/loader/data-structure.js'].lineData[371]++;
        pName = p;
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[374]++;
    return visit405_374_1(packages[pName] || systemPackage);
  }
})(KISSY);
