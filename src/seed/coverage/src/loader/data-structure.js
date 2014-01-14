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
  _$jscoverage['/loader/data-structure.js'].lineData[11] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[12] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[22] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[23] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[26] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[30] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[39] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[47] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[51] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[58] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[66] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[74] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[82] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[90] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[94] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[101] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[102] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[106] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[111] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[116] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[121] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[124] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[125] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[126] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[129] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[141] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[142] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[151] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[156] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[165] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[169] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[173] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[174] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[176] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[177] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[178] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[179] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[181] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[183] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[184] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[188] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[196] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[200] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[204] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[210] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[215] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[216] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[217] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[218] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[220] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[221] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[224] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[232] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[233] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[235] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[236] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[238] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[240] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[242] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[250] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[251] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[259] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[267] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[268] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[278] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[279] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[287] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[288] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[296] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[299] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[300] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[301] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[302] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[305] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[313] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[315] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[316] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[325] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[330] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[331] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[332] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[335] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[337] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[338] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[339] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[344] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[346] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[351] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[352] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[355] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[356] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[360] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[361] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[362] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[365] = 0;
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
}
if (! _$jscoverage['/loader/data-structure.js'].branchData) {
  _$jscoverage['/loader/data-structure.js'].branchData = {};
  _$jscoverage['/loader/data-structure.js'].branchData['51'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['176'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['181'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['198'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['199'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['215'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['217'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['220'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['233'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['235'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['251'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['268'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['279'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['288'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['299'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['299'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['300'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['301'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['330'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['330'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['331'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['332'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['334'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['356'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['361'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['361'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['365'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['365'][1] = new BranchData();
}
_$jscoverage['/loader/data-structure.js'].branchData['365'][1].init(311, 32, 'packages[pName] || systemPackage');
function visit432_365_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['361'][2].init(56, 23, 'p.length > pName.length');
function visit431_361_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['361'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['361'][1].init(17, 62, 'S.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit430_361_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['356'][1].init(24, 26, 'self.Config.packages || {}');
function visit429_356_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['334'][1].init(112, 35, 'normalizedRequiresStatus === status');
function visit428_334_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['332'][1].init(338, 149, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus === status)');
function visit427_332_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['331'][1].init(24, 14, 'requires || []');
function visit426_331_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['330'][2].init(249, 21, 'requires.length === 0');
function visit425_330_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['330'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['330'][1].init(236, 34, '!requires || requires.length === 0');
function visit424_330_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['301'][1].init(249, 18, '!requiresWithAlias');
function visit423_301_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['300'][1].init(24, 14, 'requires || []');
function visit422_300_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['299'][2].init(161, 21, 'requires.length === 0');
function visit421_299_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['299'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['299'][1].init(148, 34, '!requires || requires.length === 0');
function visit420_299_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['288'][1].init(49, 46, 'self.charset || self.getPackage().getCharset()');
function visit419_288_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['279'][1].init(49, 38, 'self.tag || self.getPackage().getTag()');
function visit418_279_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['268'][1].init(49, 92, 'self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name))');
function visit417_268_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['251'][1].init(49, 51, 'self.path || (self.path = self.getUri().toString())');
function visit416_251_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['235'][1].init(62, 9, 'self.path');
function visit415_235_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['233'][1].init(51, 9, '!self.uri');
function visit414_233_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['220'][1].init(182, 47, '!alias && (aliasFn = self.runtime.Config.alias)');
function visit413_220_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['217'][1].init(70, 17, 'packageInfo.alias');
function visit412_217_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['215'][1].init(170, 18, '!(\'alias\' in self)');
function visit411_215_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['199'][1].init(21, 48, 'Path.extname(self.name).toLowerCase() === \'.css\'');
function visit410_199_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['198'][1].init(77, 2, '!v');
function visit409_198_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['181'][1].init(27, 12, 'e.stack || e');
function visit408_181_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['176'][1].init(120, 7, 'i < len');
function visit407_176_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['51'][1].init(20, 51, 'this.path || (this.path = this.getUri().toString())');
function visit406_51_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/data-structure.js'].functionData[0]++;
  _$jscoverage['/loader/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, Utils = Loader.Utils;
  _$jscoverage['/loader/data-structure.js'].lineData[11]++;
  function forwardSystemPackage(self, property) {
    _$jscoverage['/loader/data-structure.js'].functionData[1]++;
    _$jscoverage['/loader/data-structure.js'].lineData[12]++;
    return property in self ? self[property] : self.runtime.Config[property];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[22]++;
  function Package(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[2]++;
    _$jscoverage['/loader/data-structure.js'].lineData[23]++;
    S.mix(this, cfg);
  }
  _$jscoverage['/loader/data-structure.js'].lineData[26]++;
  Package.prototype = {
  constructor: Package, 
  reset: function(cfg) {
  _$jscoverage['/loader/data-structure.js'].functionData[3]++;
  _$jscoverage['/loader/data-structure.js'].lineData[30]++;
  S.mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[4]++;
  _$jscoverage['/loader/data-structure.js'].lineData[39]++;
  return forwardSystemPackage(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[5]++;
  _$jscoverage['/loader/data-structure.js'].lineData[47]++;
  return this.name;
}, 
  getPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[6]++;
  _$jscoverage['/loader/data-structure.js'].lineData[51]++;
  return visit406_51_1(this.path || (this.path = this.getUri().toString()));
}, 
  getUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[7]++;
  _$jscoverage['/loader/data-structure.js'].lineData[58]++;
  return this.uri;
}, 
  isDebug: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[8]++;
  _$jscoverage['/loader/data-structure.js'].lineData[66]++;
  return forwardSystemPackage(this, 'debug');
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[9]++;
  _$jscoverage['/loader/data-structure.js'].lineData[74]++;
  return forwardSystemPackage(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[10]++;
  _$jscoverage['/loader/data-structure.js'].lineData[82]++;
  return forwardSystemPackage(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[11]++;
  _$jscoverage['/loader/data-structure.js'].lineData[90]++;
  return forwardSystemPackage(this, 'group');
}};
  _$jscoverage['/loader/data-structure.js'].lineData[94]++;
  Loader.Package = Package;
  _$jscoverage['/loader/data-structure.js'].lineData[101]++;
  function Module(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[12]++;
    _$jscoverage['/loader/data-structure.js'].lineData[102]++;
    var self = this;
    _$jscoverage['/loader/data-structure.js'].lineData[106]++;
    self.exports = {};
    _$jscoverage['/loader/data-structure.js'].lineData[111]++;
    self.status = Loader.Status.INIT;
    _$jscoverage['/loader/data-structure.js'].lineData[116]++;
    self.name = undefined;
    _$jscoverage['/loader/data-structure.js'].lineData[121]++;
    self.factory = undefined;
    _$jscoverage['/loader/data-structure.js'].lineData[124]++;
    self.cjs = 1;
    _$jscoverage['/loader/data-structure.js'].lineData[125]++;
    S.mix(self, cfg);
    _$jscoverage['/loader/data-structure.js'].lineData[126]++;
    self.waitedCallbacks = [];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[129]++;
  Module.prototype = {
  kissy: 1, 
  constructor: Module, 
  use: function(relativeName, fn) {
  _$jscoverage['/loader/data-structure.js'].functionData[13]++;
  _$jscoverage['/loader/data-structure.js'].lineData[141]++;
  relativeName = Utils.getModNamesAsArray(relativeName);
  _$jscoverage['/loader/data-structure.js'].lineData[142]++;
  return KISSY.use(Utils.normalDepModuleName(this.name, relativeName), fn);
}, 
  resolve: function(relativePath) {
  _$jscoverage['/loader/data-structure.js'].functionData[14]++;
  _$jscoverage['/loader/data-structure.js'].lineData[151]++;
  return this.getUri().resolve(relativePath);
}, 
  resolveByName: function(relativeName) {
  _$jscoverage['/loader/data-structure.js'].functionData[15]++;
  _$jscoverage['/loader/data-structure.js'].lineData[156]++;
  return Utils.normalDepModuleName(this.name, relativeName);
}, 
  require: function(moduleName) {
  _$jscoverage['/loader/data-structure.js'].functionData[16]++;
  _$jscoverage['/loader/data-structure.js'].lineData[165]++;
  return S.require(moduleName, this.name);
}, 
  wait: function(callback) {
  _$jscoverage['/loader/data-structure.js'].functionData[17]++;
  _$jscoverage['/loader/data-structure.js'].lineData[169]++;
  this.waitedCallbacks.push(callback);
}, 
  notifyAll: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[18]++;
  _$jscoverage['/loader/data-structure.js'].lineData[173]++;
  var callback;
  _$jscoverage['/loader/data-structure.js'].lineData[174]++;
  var len = this.waitedCallbacks.length, i = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[176]++;
  for (; visit407_176_1(i < len); i++) {
    _$jscoverage['/loader/data-structure.js'].lineData[177]++;
    callback = this.waitedCallbacks[i];
    _$jscoverage['/loader/data-structure.js'].lineData[178]++;
    try {
      _$jscoverage['/loader/data-structure.js'].lineData[179]++;
      callback(this);
    }    catch (e) {
  _$jscoverage['/loader/data-structure.js'].lineData[181]++;
  S.log(visit408_181_1(e.stack || e), 'error');
  _$jscoverage['/loader/data-structure.js'].lineData[183]++;
  setTimeout(function() {
  _$jscoverage['/loader/data-structure.js'].functionData[19]++;
  _$jscoverage['/loader/data-structure.js'].lineData[184]++;
  throw e;
}, 0);
}
  }
  _$jscoverage['/loader/data-structure.js'].lineData[188]++;
  this.waitedCallbacks = [];
}, 
  getType: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[20]++;
  _$jscoverage['/loader/data-structure.js'].lineData[196]++;
  var self = this, v = self.type;
  _$jscoverage['/loader/data-structure.js'].lineData[198]++;
  if (visit409_198_1(!v)) {
    _$jscoverage['/loader/data-structure.js'].lineData[199]++;
    if (visit410_199_1(Path.extname(self.name).toLowerCase() === '.css')) {
      _$jscoverage['/loader/data-structure.js'].lineData[200]++;
      v = 'css';
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[202]++;
      v = 'js';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[204]++;
    self.type = v;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[206]++;
  return v;
}, 
  getAlias: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[21]++;
  _$jscoverage['/loader/data-structure.js'].lineData[210]++;
  var self = this, name = self.name, aliasFn, packageInfo, alias = self.alias;
  _$jscoverage['/loader/data-structure.js'].lineData[215]++;
  if (visit411_215_1(!('alias' in self))) {
    _$jscoverage['/loader/data-structure.js'].lineData[216]++;
    packageInfo = self.getPackage();
    _$jscoverage['/loader/data-structure.js'].lineData[217]++;
    if (visit412_217_1(packageInfo.alias)) {
      _$jscoverage['/loader/data-structure.js'].lineData[218]++;
      alias = packageInfo.alias(name);
    }
    _$jscoverage['/loader/data-structure.js'].lineData[220]++;
    if (visit413_220_1(!alias && (aliasFn = self.runtime.Config.alias))) {
      _$jscoverage['/loader/data-structure.js'].lineData[221]++;
      alias = aliasFn(name);
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[224]++;
  return alias;
}, 
  getUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[22]++;
  _$jscoverage['/loader/data-structure.js'].lineData[232]++;
  var self = this, uri;
  _$jscoverage['/loader/data-structure.js'].lineData[233]++;
  if (visit414_233_1(!self.uri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[235]++;
    if (visit415_235_1(self.path)) {
      _$jscoverage['/loader/data-structure.js'].lineData[236]++;
      uri = new S.Uri(self.path);
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[238]++;
      uri = S.Config.resolveModFn(self);
    }
    _$jscoverage['/loader/data-structure.js'].lineData[240]++;
    self.uri = uri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[242]++;
  return self.uri;
}, 
  getPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[23]++;
  _$jscoverage['/loader/data-structure.js'].lineData[250]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[251]++;
  return visit416_251_1(self.path || (self.path = self.getUri().toString()));
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[24]++;
  _$jscoverage['/loader/data-structure.js'].lineData[259]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[25]++;
  _$jscoverage['/loader/data-structure.js'].lineData[267]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[268]++;
  return visit417_268_1(self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name)));
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[26]++;
  _$jscoverage['/loader/data-structure.js'].lineData[278]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[279]++;
  return visit418_279_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[27]++;
  _$jscoverage['/loader/data-structure.js'].lineData[287]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[288]++;
  return visit419_288_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[28]++;
  _$jscoverage['/loader/data-structure.js'].lineData[296]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[299]++;
  if (visit420_299_1(!requires || visit421_299_2(requires.length === 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[300]++;
    return visit422_300_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[301]++;
    if (visit423_301_1(!requiresWithAlias)) {
      _$jscoverage['/loader/data-structure.js'].lineData[302]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[305]++;
  return requiresWithAlias;
}, 
  getRequiredMods: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[29]++;
  _$jscoverage['/loader/data-structure.js'].lineData[313]++;
  var self = this, runtime = self.runtime;
  _$jscoverage['/loader/data-structure.js'].lineData[315]++;
  return S.map(self.getNormalizedRequires(), function(r) {
  _$jscoverage['/loader/data-structure.js'].functionData[30]++;
  _$jscoverage['/loader/data-structure.js'].lineData[316]++;
  return Utils.createModuleInfo(runtime, r);
});
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[31]++;
  _$jscoverage['/loader/data-structure.js'].lineData[325]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[330]++;
  if (visit424_330_1(!requires || visit425_330_2(requires.length === 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[331]++;
    return visit426_331_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[332]++;
    if (visit427_332_1((normalizedRequires = self.normalizedRequires) && (visit428_334_1(normalizedRequiresStatus === status)))) {
      _$jscoverage['/loader/data-structure.js'].lineData[335]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[337]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/loader/data-structure.js'].lineData[338]++;
      self.normalizedRequires = Utils.normalizeModNames(self.runtime, requires, self.name);
      _$jscoverage['/loader/data-structure.js'].lineData[339]++;
      return self.normalizedRequires;
    }
  }
}};
  _$jscoverage['/loader/data-structure.js'].lineData[344]++;
  Loader.Module = Module;
  _$jscoverage['/loader/data-structure.js'].lineData[346]++;
  var systemPackage = new Package({
  name: '', 
  runtime: S});
  _$jscoverage['/loader/data-structure.js'].lineData[351]++;
  systemPackage.getUri = function() {
  _$jscoverage['/loader/data-structure.js'].functionData[32]++;
  _$jscoverage['/loader/data-structure.js'].lineData[352]++;
  return this.runtime.Config.baseUri;
};
  _$jscoverage['/loader/data-structure.js'].lineData[355]++;
  function getPackage(self, modName) {
    _$jscoverage['/loader/data-structure.js'].functionData[33]++;
    _$jscoverage['/loader/data-structure.js'].lineData[356]++;
    var packages = visit429_356_1(self.Config.packages || {}), modNameSlash = modName + '/', pName = '', p;
    _$jscoverage['/loader/data-structure.js'].lineData[360]++;
    for (p in packages) {
      _$jscoverage['/loader/data-structure.js'].lineData[361]++;
      if (visit430_361_1(S.startsWith(modNameSlash, p + '/') && visit431_361_2(p.length > pName.length))) {
        _$jscoverage['/loader/data-structure.js'].lineData[362]++;
        pName = p;
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[365]++;
    return visit432_365_1(packages[pName] || systemPackage);
  }
})(KISSY);
