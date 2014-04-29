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
if (! _$jscoverage['/data-structure.js']) {
  _$jscoverage['/data-structure.js'] = {};
  _$jscoverage['/data-structure.js'].lineData = [];
  _$jscoverage['/data-structure.js'].lineData[6] = 0;
  _$jscoverage['/data-structure.js'].lineData[7] = 0;
  _$jscoverage['/data-structure.js'].lineData[12] = 0;
  _$jscoverage['/data-structure.js'].lineData[13] = 0;
  _$jscoverage['/data-structure.js'].lineData[23] = 0;
  _$jscoverage['/data-structure.js'].lineData[24] = 0;
  _$jscoverage['/data-structure.js'].lineData[25] = 0;
  _$jscoverage['/data-structure.js'].lineData[28] = 0;
  _$jscoverage['/data-structure.js'].lineData[32] = 0;
  _$jscoverage['/data-structure.js'].lineData[41] = 0;
  _$jscoverage['/data-structure.js'].lineData[49] = 0;
  _$jscoverage['/data-structure.js'].lineData[56] = 0;
  _$jscoverage['/data-structure.js'].lineData[64] = 0;
  _$jscoverage['/data-structure.js'].lineData[72] = 0;
  _$jscoverage['/data-structure.js'].lineData[80] = 0;
  _$jscoverage['/data-structure.js'].lineData[84] = 0;
  _$jscoverage['/data-structure.js'].lineData[91] = 0;
  _$jscoverage['/data-structure.js'].lineData[92] = 0;
  _$jscoverage['/data-structure.js'].lineData[96] = 0;
  _$jscoverage['/data-structure.js'].lineData[101] = 0;
  _$jscoverage['/data-structure.js'].lineData[106] = 0;
  _$jscoverage['/data-structure.js'].lineData[111] = 0;
  _$jscoverage['/data-structure.js'].lineData[114] = 0;
  _$jscoverage['/data-structure.js'].lineData[115] = 0;
  _$jscoverage['/data-structure.js'].lineData[116] = 0;
  _$jscoverage['/data-structure.js'].lineData[118] = 0;
  _$jscoverage['/data-structure.js'].lineData[119] = 0;
  _$jscoverage['/data-structure.js'].lineData[122] = 0;
  _$jscoverage['/data-structure.js'].lineData[123] = 0;
  _$jscoverage['/data-structure.js'].lineData[127] = 0;
  _$jscoverage['/data-structure.js'].lineData[133] = 0;
  _$jscoverage['/data-structure.js'].lineData[137] = 0;
  _$jscoverage['/data-structure.js'].lineData[141] = 0;
  _$jscoverage['/data-structure.js'].lineData[145] = 0;
  _$jscoverage['/data-structure.js'].lineData[149] = 0;
  _$jscoverage['/data-structure.js'].lineData[150] = 0;
  _$jscoverage['/data-structure.js'].lineData[152] = 0;
  _$jscoverage['/data-structure.js'].lineData[160] = 0;
  _$jscoverage['/data-structure.js'].lineData[162] = 0;
  _$jscoverage['/data-structure.js'].lineData[163] = 0;
  _$jscoverage['/data-structure.js'].lineData[164] = 0;
  _$jscoverage['/data-structure.js'].lineData[166] = 0;
  _$jscoverage['/data-structure.js'].lineData[168] = 0;
  _$jscoverage['/data-structure.js'].lineData[170] = 0;
  _$jscoverage['/data-structure.js'].lineData[174] = 0;
  _$jscoverage['/data-structure.js'].lineData[178] = 0;
  _$jscoverage['/data-structure.js'].lineData[179] = 0;
  _$jscoverage['/data-structure.js'].lineData[181] = 0;
  _$jscoverage['/data-structure.js'].lineData[182] = 0;
  _$jscoverage['/data-structure.js'].lineData[183] = 0;
  _$jscoverage['/data-structure.js'].lineData[185] = 0;
  _$jscoverage['/data-structure.js'].lineData[186] = 0;
  _$jscoverage['/data-structure.js'].lineData[190] = 0;
  _$jscoverage['/data-structure.js'].lineData[191] = 0;
  _$jscoverage['/data-structure.js'].lineData[192] = 0;
  _$jscoverage['/data-structure.js'].lineData[194] = 0;
  _$jscoverage['/data-structure.js'].lineData[195] = 0;
  _$jscoverage['/data-structure.js'].lineData[196] = 0;
  _$jscoverage['/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/data-structure.js'].lineData[200] = 0;
  _$jscoverage['/data-structure.js'].lineData[201] = 0;
  _$jscoverage['/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/data-structure.js'].lineData[203] = 0;
  _$jscoverage['/data-structure.js'].lineData[204] = 0;
  _$jscoverage['/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/data-structure.js'].lineData[210] = 0;
  _$jscoverage['/data-structure.js'].lineData[211] = 0;
  _$jscoverage['/data-structure.js'].lineData[213] = 0;
  _$jscoverage['/data-structure.js'].lineData[214] = 0;
  _$jscoverage['/data-structure.js'].lineData[222] = 0;
  _$jscoverage['/data-structure.js'].lineData[223] = 0;
  _$jscoverage['/data-structure.js'].lineData[224] = 0;
  _$jscoverage['/data-structure.js'].lineData[226] = 0;
  _$jscoverage['/data-structure.js'].lineData[234] = 0;
  _$jscoverage['/data-structure.js'].lineData[242] = 0;
  _$jscoverage['/data-structure.js'].lineData[243] = 0;
  _$jscoverage['/data-structure.js'].lineData[244] = 0;
  _$jscoverage['/data-structure.js'].lineData[248] = 0;
  _$jscoverage['/data-structure.js'].lineData[249] = 0;
  _$jscoverage['/data-structure.js'].lineData[250] = 0;
  _$jscoverage['/data-structure.js'].lineData[253] = 0;
  _$jscoverage['/data-structure.js'].lineData[255] = 0;
  _$jscoverage['/data-structure.js'].lineData[264] = 0;
  _$jscoverage['/data-structure.js'].lineData[265] = 0;
  _$jscoverage['/data-structure.js'].lineData[273] = 0;
  _$jscoverage['/data-structure.js'].lineData[274] = 0;
  _$jscoverage['/data-structure.js'].lineData[282] = 0;
  _$jscoverage['/data-structure.js'].lineData[285] = 0;
  _$jscoverage['/data-structure.js'].lineData[286] = 0;
  _$jscoverage['/data-structure.js'].lineData[287] = 0;
  _$jscoverage['/data-structure.js'].lineData[288] = 0;
  _$jscoverage['/data-structure.js'].lineData[291] = 0;
  _$jscoverage['/data-structure.js'].lineData[299] = 0;
  _$jscoverage['/data-structure.js'].lineData[307] = 0;
  _$jscoverage['/data-structure.js'].lineData[312] = 0;
  _$jscoverage['/data-structure.js'].lineData[313] = 0;
  _$jscoverage['/data-structure.js'].lineData[314] = 0;
  _$jscoverage['/data-structure.js'].lineData[317] = 0;
  _$jscoverage['/data-structure.js'].lineData[319] = 0;
  _$jscoverage['/data-structure.js'].lineData[320] = 0;
  _$jscoverage['/data-structure.js'].lineData[321] = 0;
  _$jscoverage['/data-structure.js'].lineData[326] = 0;
}
if (! _$jscoverage['/data-structure.js'].functionData) {
  _$jscoverage['/data-structure.js'].functionData = [];
  _$jscoverage['/data-structure.js'].functionData[0] = 0;
  _$jscoverage['/data-structure.js'].functionData[1] = 0;
  _$jscoverage['/data-structure.js'].functionData[2] = 0;
  _$jscoverage['/data-structure.js'].functionData[3] = 0;
  _$jscoverage['/data-structure.js'].functionData[4] = 0;
  _$jscoverage['/data-structure.js'].functionData[5] = 0;
  _$jscoverage['/data-structure.js'].functionData[6] = 0;
  _$jscoverage['/data-structure.js'].functionData[7] = 0;
  _$jscoverage['/data-structure.js'].functionData[8] = 0;
  _$jscoverage['/data-structure.js'].functionData[9] = 0;
  _$jscoverage['/data-structure.js'].functionData[10] = 0;
  _$jscoverage['/data-structure.js'].functionData[11] = 0;
  _$jscoverage['/data-structure.js'].functionData[12] = 0;
  _$jscoverage['/data-structure.js'].functionData[13] = 0;
  _$jscoverage['/data-structure.js'].functionData[14] = 0;
  _$jscoverage['/data-structure.js'].functionData[15] = 0;
  _$jscoverage['/data-structure.js'].functionData[16] = 0;
  _$jscoverage['/data-structure.js'].functionData[17] = 0;
  _$jscoverage['/data-structure.js'].functionData[18] = 0;
  _$jscoverage['/data-structure.js'].functionData[19] = 0;
  _$jscoverage['/data-structure.js'].functionData[20] = 0;
  _$jscoverage['/data-structure.js'].functionData[21] = 0;
  _$jscoverage['/data-structure.js'].functionData[22] = 0;
  _$jscoverage['/data-structure.js'].functionData[23] = 0;
  _$jscoverage['/data-structure.js'].functionData[24] = 0;
  _$jscoverage['/data-structure.js'].functionData[25] = 0;
  _$jscoverage['/data-structure.js'].functionData[26] = 0;
  _$jscoverage['/data-structure.js'].functionData[27] = 0;
  _$jscoverage['/data-structure.js'].functionData[28] = 0;
  _$jscoverage['/data-structure.js'].functionData[29] = 0;
}
if (! _$jscoverage['/data-structure.js'].branchData) {
  _$jscoverage['/data-structure.js'].branchData = {};
  _$jscoverage['/data-structure.js'].branchData['162'] = [];
  _$jscoverage['/data-structure.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['163'] = [];
  _$jscoverage['/data-structure.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['178'] = [];
  _$jscoverage['/data-structure.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['182'] = [];
  _$jscoverage['/data-structure.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['185'] = [];
  _$jscoverage['/data-structure.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['191'] = [];
  _$jscoverage['/data-structure.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['195'] = [];
  _$jscoverage['/data-structure.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['199'] = [];
  _$jscoverage['/data-structure.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['200'] = [];
  _$jscoverage['/data-structure.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['203'] = [];
  _$jscoverage['/data-structure.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['210'] = [];
  _$jscoverage['/data-structure.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['223'] = [];
  _$jscoverage['/data-structure.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['243'] = [];
  _$jscoverage['/data-structure.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['249'] = [];
  _$jscoverage['/data-structure.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['249'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['253'] = [];
  _$jscoverage['/data-structure.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['265'] = [];
  _$jscoverage['/data-structure.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['274'] = [];
  _$jscoverage['/data-structure.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['285'] = [];
  _$jscoverage['/data-structure.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['285'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['286'] = [];
  _$jscoverage['/data-structure.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['287'] = [];
  _$jscoverage['/data-structure.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['312'] = [];
  _$jscoverage['/data-structure.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['312'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['313'] = [];
  _$jscoverage['/data-structure.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['314'] = [];
  _$jscoverage['/data-structure.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['316'] = [];
  _$jscoverage['/data-structure.js'].branchData['316'][1] = new BranchData();
}
_$jscoverage['/data-structure.js'].branchData['316'][1].init(114, 35, 'normalizedRequiresStatus === status');
function visit142_316_1(result) {
  _$jscoverage['/data-structure.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['314'][1].init(346, 151, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus === status)');
function visit141_314_1(result) {
  _$jscoverage['/data-structure.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['313'][1].init(25, 14, 'requires || []');
function visit140_313_1(result) {
  _$jscoverage['/data-structure.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['312'][2].init(255, 21, 'requires.length === 0');
function visit139_312_2(result) {
  _$jscoverage['/data-structure.js'].branchData['312'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['312'][1].init(242, 34, '!requires || requires.length === 0');
function visit138_312_1(result) {
  _$jscoverage['/data-structure.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['287'][1].init(255, 18, '!requiresWithAlias');
function visit137_287_1(result) {
  _$jscoverage['/data-structure.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['286'][1].init(25, 14, 'requires || []');
function visit136_286_1(result) {
  _$jscoverage['/data-structure.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['285'][2].init(165, 21, 'requires.length === 0');
function visit135_285_2(result) {
  _$jscoverage['/data-structure.js'].branchData['285'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['285'][1].init(152, 34, '!requires || requires.length === 0');
function visit134_285_1(result) {
  _$jscoverage['/data-structure.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['274'][1].init(51, 46, 'self.charset || self.getPackage().getCharset()');
function visit133_274_1(result) {
  _$jscoverage['/data-structure.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['265'][1].init(51, 38, 'self.tag || self.getPackage().getTag()');
function visit132_265_1(result) {
  _$jscoverage['/data-structure.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['253'][1].init(408, 32, 'packages[pName] || packages.core');
function visit131_253_1(result) {
  _$jscoverage['/data-structure.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['249'][2].init(69, 23, 'p.length > pName.length');
function visit130_249_2(result) {
  _$jscoverage['/data-structure.js'].branchData['249'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['249'][1].init(26, 66, 'Utils.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit129_249_1(result) {
  _$jscoverage['/data-structure.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['243'][1].init(48, 17, '!self.packageInfo');
function visit128_243_1(result) {
  _$jscoverage['/data-structure.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['223'][1].init(48, 9, '!self.url');
function visit127_223_1(result) {
  _$jscoverage['/data-structure.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['210'][1].init(774, 11, '!ret.length');
function visit126_210_1(result) {
  _$jscoverage['/data-structure.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['203'][1].init(161, 11, 'normalAlias');
function visit125_203_1(result) {
  _$jscoverage['/data-structure.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['200'][1].init(22, 8, 'alias[i]');
function visit124_200_1(result) {
  _$jscoverage['/data-structure.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['199'][1].init(344, 5, 'i < l');
function visit123_199_1(result) {
  _$jscoverage['/data-structure.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['195'][1].init(192, 25, 'typeof alias === \'string\'');
function visit122_195_1(result) {
  _$jscoverage['/data-structure.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['191'][1].init(48, 20, 'self.normalizedAlias');
function visit121_191_1(result) {
  _$jscoverage['/data-structure.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['185'][1].init(388, 11, 'alias || []');
function visit120_185_1(result) {
  _$jscoverage['/data-structure.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['182'][1].init(268, 17, 'packageInfo.alias');
function visit119_182_1(result) {
  _$jscoverage['/data-structure.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['178'][1].init(150, 5, 'alias');
function visit118_178_1(result) {
  _$jscoverage['/data-structure.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['163'][1].init(22, 33, 'Utils.endsWith(self.name, \'.css\')');
function visit117_163_1(result) {
  _$jscoverage['/data-structure.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['162'][1].init(80, 2, '!v');
function visit116_162_1(result) {
  _$jscoverage['/data-structure.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/data-structure.js'].functionData[0]++;
  _$jscoverage['/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Config = S.Config, Utils = Loader.Utils, mix = Utils.mix;
  _$jscoverage['/data-structure.js'].lineData[12]++;
  function checkGlobalIfNotExist(self, property) {
    _$jscoverage['/data-structure.js'].functionData[1]++;
    _$jscoverage['/data-structure.js'].lineData[13]++;
    return property in self ? self[property] : Config[property];
  }
  _$jscoverage['/data-structure.js'].lineData[23]++;
  function Package(cfg) {
    _$jscoverage['/data-structure.js'].functionData[2]++;
    _$jscoverage['/data-structure.js'].lineData[24]++;
    this.filter = '';
    _$jscoverage['/data-structure.js'].lineData[25]++;
    mix(this, cfg);
  }
  _$jscoverage['/data-structure.js'].lineData[28]++;
  Package.prototype = {
  constructor: Package, 
  reset: function(cfg) {
  _$jscoverage['/data-structure.js'].functionData[3]++;
  _$jscoverage['/data-structure.js'].lineData[32]++;
  mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[4]++;
  _$jscoverage['/data-structure.js'].lineData[41]++;
  return checkGlobalIfNotExist(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[5]++;
  _$jscoverage['/data-structure.js'].lineData[49]++;
  return this.name;
}, 
  getBase: function() {
  _$jscoverage['/data-structure.js'].functionData[6]++;
  _$jscoverage['/data-structure.js'].lineData[56]++;
  return this.base;
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[7]++;
  _$jscoverage['/data-structure.js'].lineData[64]++;
  return checkGlobalIfNotExist(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/data-structure.js'].functionData[8]++;
  _$jscoverage['/data-structure.js'].lineData[72]++;
  return checkGlobalIfNotExist(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/data-structure.js'].functionData[9]++;
  _$jscoverage['/data-structure.js'].lineData[80]++;
  return checkGlobalIfNotExist(this, 'group');
}};
  _$jscoverage['/data-structure.js'].lineData[84]++;
  Loader.Package = Package;
  _$jscoverage['/data-structure.js'].lineData[91]++;
  function Module(cfg) {
    _$jscoverage['/data-structure.js'].functionData[10]++;
    _$jscoverage['/data-structure.js'].lineData[92]++;
    var self = this;
    _$jscoverage['/data-structure.js'].lineData[96]++;
    self.exports = {};
    _$jscoverage['/data-structure.js'].lineData[101]++;
    self.status = Loader.Status.INIT;
    _$jscoverage['/data-structure.js'].lineData[106]++;
    self.name = undefined;
    _$jscoverage['/data-structure.js'].lineData[111]++;
    self.factory = undefined;
    _$jscoverage['/data-structure.js'].lineData[114]++;
    self.cjs = 1;
    _$jscoverage['/data-structure.js'].lineData[115]++;
    mix(self, cfg);
    _$jscoverage['/data-structure.js'].lineData[116]++;
    self.waits = {};
    _$jscoverage['/data-structure.js'].lineData[118]++;
    self.require = function(moduleName) {
  _$jscoverage['/data-structure.js'].functionData[11]++;
  _$jscoverage['/data-structure.js'].lineData[119]++;
  return S.require(moduleName, self.name);
};
    _$jscoverage['/data-structure.js'].lineData[122]++;
    self.require.resolve = function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[12]++;
  _$jscoverage['/data-structure.js'].lineData[123]++;
  return self.resolve(relativeName);
};
  }
  _$jscoverage['/data-structure.js'].lineData[127]++;
  Module.prototype = {
  kissy: 1, 
  constructor: Module, 
  resolve: function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[13]++;
  _$jscoverage['/data-structure.js'].lineData[133]++;
  return Utils.normalizePath(this.name, relativeName);
}, 
  add: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[14]++;
  _$jscoverage['/data-structure.js'].lineData[137]++;
  this.waits[loader.id] = loader;
}, 
  remove: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[15]++;
  _$jscoverage['/data-structure.js'].lineData[141]++;
  delete this.waits[loader.id];
}, 
  contains: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[16]++;
  _$jscoverage['/data-structure.js'].lineData[145]++;
  return this.waits[loader.id];
}, 
  flush: function() {
  _$jscoverage['/data-structure.js'].functionData[17]++;
  _$jscoverage['/data-structure.js'].lineData[149]++;
  Utils.each(this.waits, function(loader) {
  _$jscoverage['/data-structure.js'].functionData[18]++;
  _$jscoverage['/data-structure.js'].lineData[150]++;
  loader.flush();
});
  _$jscoverage['/data-structure.js'].lineData[152]++;
  this.waits = {};
}, 
  getType: function() {
  _$jscoverage['/data-structure.js'].functionData[19]++;
  _$jscoverage['/data-structure.js'].lineData[160]++;
  var self = this, v = self.type;
  _$jscoverage['/data-structure.js'].lineData[162]++;
  if (visit116_162_1(!v)) {
    _$jscoverage['/data-structure.js'].lineData[163]++;
    if (visit117_163_1(Utils.endsWith(self.name, '.css'))) {
      _$jscoverage['/data-structure.js'].lineData[164]++;
      v = 'css';
    } else {
      _$jscoverage['/data-structure.js'].lineData[166]++;
      v = 'js';
    }
    _$jscoverage['/data-structure.js'].lineData[168]++;
    self.type = v;
  }
  _$jscoverage['/data-structure.js'].lineData[170]++;
  return v;
}, 
  getAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[20]++;
  _$jscoverage['/data-structure.js'].lineData[174]++;
  var self = this, name = self.name, packageInfo, alias = self.alias;
  _$jscoverage['/data-structure.js'].lineData[178]++;
  if (visit118_178_1(alias)) {
    _$jscoverage['/data-structure.js'].lineData[179]++;
    return alias;
  }
  _$jscoverage['/data-structure.js'].lineData[181]++;
  packageInfo = self.getPackage();
  _$jscoverage['/data-structure.js'].lineData[182]++;
  if (visit119_182_1(packageInfo.alias)) {
    _$jscoverage['/data-structure.js'].lineData[183]++;
    alias = packageInfo.alias(name);
  }
  _$jscoverage['/data-structure.js'].lineData[185]++;
  alias = self.alias = visit120_185_1(alias || []);
  _$jscoverage['/data-structure.js'].lineData[186]++;
  return alias;
}, 
  getNormalizedAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[21]++;
  _$jscoverage['/data-structure.js'].lineData[190]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[191]++;
  if (visit121_191_1(self.normalizedAlias)) {
    _$jscoverage['/data-structure.js'].lineData[192]++;
    return self.normalizedAlias;
  }
  _$jscoverage['/data-structure.js'].lineData[194]++;
  var alias = self.getAlias();
  _$jscoverage['/data-structure.js'].lineData[195]++;
  if (visit122_195_1(typeof alias === 'string')) {
    _$jscoverage['/data-structure.js'].lineData[196]++;
    alias = [alias];
  }
  _$jscoverage['/data-structure.js'].lineData[198]++;
  var ret = [];
  _$jscoverage['/data-structure.js'].lineData[199]++;
  for (var i = 0, l = alias.length; visit123_199_1(i < l); i++) {
    _$jscoverage['/data-structure.js'].lineData[200]++;
    if (visit124_200_1(alias[i])) {
      _$jscoverage['/data-structure.js'].lineData[201]++;
      var mod = Utils.getOrCreateModuleInfo(alias[i]);
      _$jscoverage['/data-structure.js'].lineData[202]++;
      var normalAlias = mod.getNormalizedAlias();
      _$jscoverage['/data-structure.js'].lineData[203]++;
      if (visit125_203_1(normalAlias)) {
        _$jscoverage['/data-structure.js'].lineData[204]++;
        ret.push.apply(ret, normalAlias);
      } else {
        _$jscoverage['/data-structure.js'].lineData[206]++;
        ret.push(alias[i]);
      }
    }
  }
  _$jscoverage['/data-structure.js'].lineData[210]++;
  if (visit126_210_1(!ret.length)) {
    _$jscoverage['/data-structure.js'].lineData[211]++;
    ret.push(self.name);
  }
  _$jscoverage['/data-structure.js'].lineData[213]++;
  self.normalizedAlias = ret;
  _$jscoverage['/data-structure.js'].lineData[214]++;
  return ret;
}, 
  getUrl: function() {
  _$jscoverage['/data-structure.js'].functionData[22]++;
  _$jscoverage['/data-structure.js'].lineData[222]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[223]++;
  if (visit127_223_1(!self.url)) {
    _$jscoverage['/data-structure.js'].lineData[224]++;
    self.url = S.Config.resolveModFn(self);
  }
  _$jscoverage['/data-structure.js'].lineData[226]++;
  return self.url;
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[23]++;
  _$jscoverage['/data-structure.js'].lineData[234]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/data-structure.js'].functionData[24]++;
  _$jscoverage['/data-structure.js'].lineData[242]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[243]++;
  if (visit128_243_1(!self.packageInfo)) {
    _$jscoverage['/data-structure.js'].lineData[244]++;
    var packages = Config.packages, modNameSlash = self.name + '/', pName = '', p;
    _$jscoverage['/data-structure.js'].lineData[248]++;
    for (p in packages) {
      _$jscoverage['/data-structure.js'].lineData[249]++;
      if (visit129_249_1(Utils.startsWith(modNameSlash, p + '/') && visit130_249_2(p.length > pName.length))) {
        _$jscoverage['/data-structure.js'].lineData[250]++;
        pName = p;
      }
    }
    _$jscoverage['/data-structure.js'].lineData[253]++;
    self.packageInfo = visit131_253_1(packages[pName] || packages.core);
  }
  _$jscoverage['/data-structure.js'].lineData[255]++;
  return self.packageInfo;
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[25]++;
  _$jscoverage['/data-structure.js'].lineData[264]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[265]++;
  return visit132_265_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[26]++;
  _$jscoverage['/data-structure.js'].lineData[273]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[274]++;
  return visit133_274_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[27]++;
  _$jscoverage['/data-structure.js'].lineData[282]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[285]++;
  if (visit134_285_1(!requires || visit135_285_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[286]++;
    return visit136_286_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[287]++;
    if (visit137_287_1(!requiresWithAlias)) {
      _$jscoverage['/data-structure.js'].lineData[288]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(requires, self.name);
    }
  }
  _$jscoverage['/data-structure.js'].lineData[291]++;
  return requiresWithAlias;
}, 
  getRequiredMods: function() {
  _$jscoverage['/data-structure.js'].functionData[28]++;
  _$jscoverage['/data-structure.js'].lineData[299]++;
  return Utils.getOrCreateModulesInfo(this.getNormalizedRequires());
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/data-structure.js'].functionData[29]++;
  _$jscoverage['/data-structure.js'].lineData[307]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[312]++;
  if (visit138_312_1(!requires || visit139_312_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[313]++;
    return visit140_313_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[314]++;
    if (visit141_314_1((normalizedRequires = self.normalizedRequires) && (visit142_316_1(normalizedRequiresStatus === status)))) {
      _$jscoverage['/data-structure.js'].lineData[317]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/data-structure.js'].lineData[319]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/data-structure.js'].lineData[320]++;
      self.normalizedRequires = Utils.normalizeModNames(requires, self.name);
      _$jscoverage['/data-structure.js'].lineData[321]++;
      return self.normalizedRequires;
    }
  }
}};
  _$jscoverage['/data-structure.js'].lineData[326]++;
  Loader.Module = Module;
})(KISSY);
