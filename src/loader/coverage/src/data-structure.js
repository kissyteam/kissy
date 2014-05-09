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
  _$jscoverage['/data-structure.js'].lineData[130] = 0;
  _$jscoverage['/data-structure.js'].lineData[136] = 0;
  _$jscoverage['/data-structure.js'].lineData[137] = 0;
  _$jscoverage['/data-structure.js'].lineData[139] = 0;
  _$jscoverage['/data-structure.js'].lineData[140] = 0;
  _$jscoverage['/data-structure.js'].lineData[141] = 0;
  _$jscoverage['/data-structure.js'].lineData[143] = 0;
  _$jscoverage['/data-structure.js'].lineData[144] = 0;
  _$jscoverage['/data-structure.js'].lineData[148] = 0;
  _$jscoverage['/data-structure.js'].lineData[152] = 0;
  _$jscoverage['/data-structure.js'].lineData[156] = 0;
  _$jscoverage['/data-structure.js'].lineData[160] = 0;
  _$jscoverage['/data-structure.js'].lineData[161] = 0;
  _$jscoverage['/data-structure.js'].lineData[163] = 0;
  _$jscoverage['/data-structure.js'].lineData[171] = 0;
  _$jscoverage['/data-structure.js'].lineData[173] = 0;
  _$jscoverage['/data-structure.js'].lineData[174] = 0;
  _$jscoverage['/data-structure.js'].lineData[175] = 0;
  _$jscoverage['/data-structure.js'].lineData[177] = 0;
  _$jscoverage['/data-structure.js'].lineData[179] = 0;
  _$jscoverage['/data-structure.js'].lineData[181] = 0;
  _$jscoverage['/data-structure.js'].lineData[185] = 0;
  _$jscoverage['/data-structure.js'].lineData[189] = 0;
  _$jscoverage['/data-structure.js'].lineData[190] = 0;
  _$jscoverage['/data-structure.js'].lineData[192] = 0;
  _$jscoverage['/data-structure.js'].lineData[193] = 0;
  _$jscoverage['/data-structure.js'].lineData[194] = 0;
  _$jscoverage['/data-structure.js'].lineData[196] = 0;
  _$jscoverage['/data-structure.js'].lineData[197] = 0;
  _$jscoverage['/data-structure.js'].lineData[201] = 0;
  _$jscoverage['/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/data-structure.js'].lineData[203] = 0;
  _$jscoverage['/data-structure.js'].lineData[205] = 0;
  _$jscoverage['/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/data-structure.js'].lineData[209] = 0;
  _$jscoverage['/data-structure.js'].lineData[210] = 0;
  _$jscoverage['/data-structure.js'].lineData[211] = 0;
  _$jscoverage['/data-structure.js'].lineData[212] = 0;
  _$jscoverage['/data-structure.js'].lineData[213] = 0;
  _$jscoverage['/data-structure.js'].lineData[214] = 0;
  _$jscoverage['/data-structure.js'].lineData[215] = 0;
  _$jscoverage['/data-structure.js'].lineData[217] = 0;
  _$jscoverage['/data-structure.js'].lineData[221] = 0;
  _$jscoverage['/data-structure.js'].lineData[222] = 0;
  _$jscoverage['/data-structure.js'].lineData[224] = 0;
  _$jscoverage['/data-structure.js'].lineData[225] = 0;
  _$jscoverage['/data-structure.js'].lineData[233] = 0;
  _$jscoverage['/data-structure.js'].lineData[234] = 0;
  _$jscoverage['/data-structure.js'].lineData[235] = 0;
  _$jscoverage['/data-structure.js'].lineData[237] = 0;
  _$jscoverage['/data-structure.js'].lineData[245] = 0;
  _$jscoverage['/data-structure.js'].lineData[253] = 0;
  _$jscoverage['/data-structure.js'].lineData[254] = 0;
  _$jscoverage['/data-structure.js'].lineData[255] = 0;
  _$jscoverage['/data-structure.js'].lineData[259] = 0;
  _$jscoverage['/data-structure.js'].lineData[260] = 0;
  _$jscoverage['/data-structure.js'].lineData[261] = 0;
  _$jscoverage['/data-structure.js'].lineData[264] = 0;
  _$jscoverage['/data-structure.js'].lineData[266] = 0;
  _$jscoverage['/data-structure.js'].lineData[275] = 0;
  _$jscoverage['/data-structure.js'].lineData[276] = 0;
  _$jscoverage['/data-structure.js'].lineData[284] = 0;
  _$jscoverage['/data-structure.js'].lineData[285] = 0;
  _$jscoverage['/data-structure.js'].lineData[293] = 0;
  _$jscoverage['/data-structure.js'].lineData[296] = 0;
  _$jscoverage['/data-structure.js'].lineData[297] = 0;
  _$jscoverage['/data-structure.js'].lineData[298] = 0;
  _$jscoverage['/data-structure.js'].lineData[299] = 0;
  _$jscoverage['/data-structure.js'].lineData[302] = 0;
  _$jscoverage['/data-structure.js'].lineData[310] = 0;
  _$jscoverage['/data-structure.js'].lineData[318] = 0;
  _$jscoverage['/data-structure.js'].lineData[323] = 0;
  _$jscoverage['/data-structure.js'].lineData[324] = 0;
  _$jscoverage['/data-structure.js'].lineData[325] = 0;
  _$jscoverage['/data-structure.js'].lineData[328] = 0;
  _$jscoverage['/data-structure.js'].lineData[330] = 0;
  _$jscoverage['/data-structure.js'].lineData[331] = 0;
  _$jscoverage['/data-structure.js'].lineData[332] = 0;
  _$jscoverage['/data-structure.js'].lineData[337] = 0;
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
  _$jscoverage['/data-structure.js'].branchData['136'] = [];
  _$jscoverage['/data-structure.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['140'] = [];
  _$jscoverage['/data-structure.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['173'] = [];
  _$jscoverage['/data-structure.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['174'] = [];
  _$jscoverage['/data-structure.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['189'] = [];
  _$jscoverage['/data-structure.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['193'] = [];
  _$jscoverage['/data-structure.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['196'] = [];
  _$jscoverage['/data-structure.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['202'] = [];
  _$jscoverage['/data-structure.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['206'] = [];
  _$jscoverage['/data-structure.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['210'] = [];
  _$jscoverage['/data-structure.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['211'] = [];
  _$jscoverage['/data-structure.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['214'] = [];
  _$jscoverage['/data-structure.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['221'] = [];
  _$jscoverage['/data-structure.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['234'] = [];
  _$jscoverage['/data-structure.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['254'] = [];
  _$jscoverage['/data-structure.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['260'] = [];
  _$jscoverage['/data-structure.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['260'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['264'] = [];
  _$jscoverage['/data-structure.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['276'] = [];
  _$jscoverage['/data-structure.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['285'] = [];
  _$jscoverage['/data-structure.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['296'] = [];
  _$jscoverage['/data-structure.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['296'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['297'] = [];
  _$jscoverage['/data-structure.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['298'] = [];
  _$jscoverage['/data-structure.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['323'] = [];
  _$jscoverage['/data-structure.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['323'][2] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['324'] = [];
  _$jscoverage['/data-structure.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['325'] = [];
  _$jscoverage['/data-structure.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/data-structure.js'].branchData['327'] = [];
  _$jscoverage['/data-structure.js'].branchData['327'][1] = new BranchData();
}
_$jscoverage['/data-structure.js'].branchData['327'][1].init(114, 35, 'normalizedRequiresStatus === status');
function visit144_327_1(result) {
  _$jscoverage['/data-structure.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['325'][1].init(346, 151, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus === status)');
function visit143_325_1(result) {
  _$jscoverage['/data-structure.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['324'][1].init(25, 14, 'requires || []');
function visit142_324_1(result) {
  _$jscoverage['/data-structure.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['323'][2].init(255, 21, 'requires.length === 0');
function visit141_323_2(result) {
  _$jscoverage['/data-structure.js'].branchData['323'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['323'][1].init(242, 34, '!requires || requires.length === 0');
function visit140_323_1(result) {
  _$jscoverage['/data-structure.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['298'][1].init(255, 18, '!requiresWithAlias');
function visit139_298_1(result) {
  _$jscoverage['/data-structure.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['297'][1].init(25, 14, 'requires || []');
function visit138_297_1(result) {
  _$jscoverage['/data-structure.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['296'][2].init(165, 21, 'requires.length === 0');
function visit137_296_2(result) {
  _$jscoverage['/data-structure.js'].branchData['296'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['296'][1].init(152, 34, '!requires || requires.length === 0');
function visit136_296_1(result) {
  _$jscoverage['/data-structure.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['285'][1].init(51, 46, 'self.charset || self.getPackage().getCharset()');
function visit135_285_1(result) {
  _$jscoverage['/data-structure.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['276'][1].init(51, 38, 'self.tag || self.getPackage().getTag()');
function visit134_276_1(result) {
  _$jscoverage['/data-structure.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['264'][1].init(408, 32, 'packages[pName] || packages.core');
function visit133_264_1(result) {
  _$jscoverage['/data-structure.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['260'][2].init(69, 23, 'p.length > pName.length');
function visit132_260_2(result) {
  _$jscoverage['/data-structure.js'].branchData['260'][2].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['260'][1].init(26, 66, 'Utils.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit131_260_1(result) {
  _$jscoverage['/data-structure.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['254'][1].init(48, 17, '!self.packageInfo');
function visit130_254_1(result) {
  _$jscoverage['/data-structure.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['234'][1].init(48, 9, '!self.url');
function visit129_234_1(result) {
  _$jscoverage['/data-structure.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['221'][1].init(774, 11, '!ret.length');
function visit128_221_1(result) {
  _$jscoverage['/data-structure.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['214'][1].init(161, 11, 'normalAlias');
function visit127_214_1(result) {
  _$jscoverage['/data-structure.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['211'][1].init(22, 8, 'alias[i]');
function visit126_211_1(result) {
  _$jscoverage['/data-structure.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['210'][1].init(344, 5, 'i < l');
function visit125_210_1(result) {
  _$jscoverage['/data-structure.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['206'][1].init(192, 25, 'typeof alias === \'string\'');
function visit124_206_1(result) {
  _$jscoverage['/data-structure.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['202'][1].init(48, 20, 'self.normalizedAlias');
function visit123_202_1(result) {
  _$jscoverage['/data-structure.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['196'][1].init(388, 11, 'alias || []');
function visit122_196_1(result) {
  _$jscoverage['/data-structure.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['193'][1].init(268, 17, 'packageInfo.alias');
function visit121_193_1(result) {
  _$jscoverage['/data-structure.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['189'][1].init(150, 5, 'alias');
function visit120_189_1(result) {
  _$jscoverage['/data-structure.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['174'][1].init(22, 33, 'Utils.endsWith(self.name, \'.css\')');
function visit119_174_1(result) {
  _$jscoverage['/data-structure.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['173'][1].init(80, 2, '!v');
function visit118_173_1(result) {
  _$jscoverage['/data-structure.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['140'][1].init(173, 26, 'resolveCache[relativeName]');
function visit117_140_1(result) {
  _$jscoverage['/data-structure.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/data-structure.js'].branchData['136'][1].init(18, 30, 'relativeName.charAt(0) !== \'.\'');
function visit116_136_1(result) {
  _$jscoverage['/data-structure.js'].branchData['136'][1].ranCondition(result);
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
  return S.require(self.resolve(moduleName));
};
    _$jscoverage['/data-structure.js'].lineData[122]++;
    self.require.resolve = function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[12]++;
  _$jscoverage['/data-structure.js'].lineData[123]++;
  return self.resolve(relativeName);
};
    _$jscoverage['/data-structure.js'].lineData[127]++;
    self.resolveCache = {};
  }
  _$jscoverage['/data-structure.js'].lineData[130]++;
  Module.prototype = {
  kissy: 1, 
  constructor: Module, 
  resolve: function(relativeName) {
  _$jscoverage['/data-structure.js'].functionData[13]++;
  _$jscoverage['/data-structure.js'].lineData[136]++;
  if (visit116_136_1(relativeName.charAt(0) !== '.')) {
    _$jscoverage['/data-structure.js'].lineData[137]++;
    return relativeName;
  }
  _$jscoverage['/data-structure.js'].lineData[139]++;
  var resolveCache = this.resolveCache;
  _$jscoverage['/data-structure.js'].lineData[140]++;
  if (visit117_140_1(resolveCache[relativeName])) {
    _$jscoverage['/data-structure.js'].lineData[141]++;
    return resolveCache[relativeName];
  }
  _$jscoverage['/data-structure.js'].lineData[143]++;
  resolveCache[relativeName] = Utils.normalizePath(this.name, relativeName);
  _$jscoverage['/data-structure.js'].lineData[144]++;
  return resolveCache[relativeName];
}, 
  add: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[14]++;
  _$jscoverage['/data-structure.js'].lineData[148]++;
  this.waits[loader.id] = loader;
}, 
  remove: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[15]++;
  _$jscoverage['/data-structure.js'].lineData[152]++;
  delete this.waits[loader.id];
}, 
  contains: function(loader) {
  _$jscoverage['/data-structure.js'].functionData[16]++;
  _$jscoverage['/data-structure.js'].lineData[156]++;
  return this.waits[loader.id];
}, 
  flush: function() {
  _$jscoverage['/data-structure.js'].functionData[17]++;
  _$jscoverage['/data-structure.js'].lineData[160]++;
  Utils.each(this.waits, function(loader) {
  _$jscoverage['/data-structure.js'].functionData[18]++;
  _$jscoverage['/data-structure.js'].lineData[161]++;
  loader.flush();
});
  _$jscoverage['/data-structure.js'].lineData[163]++;
  this.waits = {};
}, 
  getType: function() {
  _$jscoverage['/data-structure.js'].functionData[19]++;
  _$jscoverage['/data-structure.js'].lineData[171]++;
  var self = this, v = self.type;
  _$jscoverage['/data-structure.js'].lineData[173]++;
  if (visit118_173_1(!v)) {
    _$jscoverage['/data-structure.js'].lineData[174]++;
    if (visit119_174_1(Utils.endsWith(self.name, '.css'))) {
      _$jscoverage['/data-structure.js'].lineData[175]++;
      v = 'css';
    } else {
      _$jscoverage['/data-structure.js'].lineData[177]++;
      v = 'js';
    }
    _$jscoverage['/data-structure.js'].lineData[179]++;
    self.type = v;
  }
  _$jscoverage['/data-structure.js'].lineData[181]++;
  return v;
}, 
  getAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[20]++;
  _$jscoverage['/data-structure.js'].lineData[185]++;
  var self = this, name = self.name, packageInfo, alias = self.alias;
  _$jscoverage['/data-structure.js'].lineData[189]++;
  if (visit120_189_1(alias)) {
    _$jscoverage['/data-structure.js'].lineData[190]++;
    return alias;
  }
  _$jscoverage['/data-structure.js'].lineData[192]++;
  packageInfo = self.getPackage();
  _$jscoverage['/data-structure.js'].lineData[193]++;
  if (visit121_193_1(packageInfo.alias)) {
    _$jscoverage['/data-structure.js'].lineData[194]++;
    alias = packageInfo.alias(name);
  }
  _$jscoverage['/data-structure.js'].lineData[196]++;
  alias = self.alias = visit122_196_1(alias || []);
  _$jscoverage['/data-structure.js'].lineData[197]++;
  return alias;
}, 
  getNormalizedAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[21]++;
  _$jscoverage['/data-structure.js'].lineData[201]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[202]++;
  if (visit123_202_1(self.normalizedAlias)) {
    _$jscoverage['/data-structure.js'].lineData[203]++;
    return self.normalizedAlias;
  }
  _$jscoverage['/data-structure.js'].lineData[205]++;
  var alias = self.getAlias();
  _$jscoverage['/data-structure.js'].lineData[206]++;
  if (visit124_206_1(typeof alias === 'string')) {
    _$jscoverage['/data-structure.js'].lineData[207]++;
    alias = [alias];
  }
  _$jscoverage['/data-structure.js'].lineData[209]++;
  var ret = [];
  _$jscoverage['/data-structure.js'].lineData[210]++;
  for (var i = 0, l = alias.length; visit125_210_1(i < l); i++) {
    _$jscoverage['/data-structure.js'].lineData[211]++;
    if (visit126_211_1(alias[i])) {
      _$jscoverage['/data-structure.js'].lineData[212]++;
      var mod = Utils.getOrCreateModuleInfo(alias[i]);
      _$jscoverage['/data-structure.js'].lineData[213]++;
      var normalAlias = mod.getNormalizedAlias();
      _$jscoverage['/data-structure.js'].lineData[214]++;
      if (visit127_214_1(normalAlias)) {
        _$jscoverage['/data-structure.js'].lineData[215]++;
        ret.push.apply(ret, normalAlias);
      } else {
        _$jscoverage['/data-structure.js'].lineData[217]++;
        ret.push(alias[i]);
      }
    }
  }
  _$jscoverage['/data-structure.js'].lineData[221]++;
  if (visit128_221_1(!ret.length)) {
    _$jscoverage['/data-structure.js'].lineData[222]++;
    ret.push(self.name);
  }
  _$jscoverage['/data-structure.js'].lineData[224]++;
  self.normalizedAlias = ret;
  _$jscoverage['/data-structure.js'].lineData[225]++;
  return ret;
}, 
  getUrl: function() {
  _$jscoverage['/data-structure.js'].functionData[22]++;
  _$jscoverage['/data-structure.js'].lineData[233]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[234]++;
  if (visit129_234_1(!self.url)) {
    _$jscoverage['/data-structure.js'].lineData[235]++;
    self.url = S.Config.resolveModFn(self);
  }
  _$jscoverage['/data-structure.js'].lineData[237]++;
  return self.url;
}, 
  getName: function() {
  _$jscoverage['/data-structure.js'].functionData[23]++;
  _$jscoverage['/data-structure.js'].lineData[245]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/data-structure.js'].functionData[24]++;
  _$jscoverage['/data-structure.js'].lineData[253]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[254]++;
  if (visit130_254_1(!self.packageInfo)) {
    _$jscoverage['/data-structure.js'].lineData[255]++;
    var packages = Config.packages, modNameSlash = self.name + '/', pName = '', p;
    _$jscoverage['/data-structure.js'].lineData[259]++;
    for (p in packages) {
      _$jscoverage['/data-structure.js'].lineData[260]++;
      if (visit131_260_1(Utils.startsWith(modNameSlash, p + '/') && visit132_260_2(p.length > pName.length))) {
        _$jscoverage['/data-structure.js'].lineData[261]++;
        pName = p;
      }
    }
    _$jscoverage['/data-structure.js'].lineData[264]++;
    self.packageInfo = visit133_264_1(packages[pName] || packages.core);
  }
  _$jscoverage['/data-structure.js'].lineData[266]++;
  return self.packageInfo;
}, 
  getTag: function() {
  _$jscoverage['/data-structure.js'].functionData[25]++;
  _$jscoverage['/data-structure.js'].lineData[275]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[276]++;
  return visit134_276_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/data-structure.js'].functionData[26]++;
  _$jscoverage['/data-structure.js'].lineData[284]++;
  var self = this;
  _$jscoverage['/data-structure.js'].lineData[285]++;
  return visit135_285_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/data-structure.js'].functionData[27]++;
  _$jscoverage['/data-structure.js'].lineData[293]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[296]++;
  if (visit136_296_1(!requires || visit137_296_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[297]++;
    return visit138_297_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[298]++;
    if (visit139_298_1(!requiresWithAlias)) {
      _$jscoverage['/data-structure.js'].lineData[299]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(requires, self.name);
    }
  }
  _$jscoverage['/data-structure.js'].lineData[302]++;
  return requiresWithAlias;
}, 
  getRequiredMods: function() {
  _$jscoverage['/data-structure.js'].functionData[28]++;
  _$jscoverage['/data-structure.js'].lineData[310]++;
  return Utils.getOrCreateModulesInfo(this.getNormalizedRequires());
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/data-structure.js'].functionData[29]++;
  _$jscoverage['/data-structure.js'].lineData[318]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/data-structure.js'].lineData[323]++;
  if (visit140_323_1(!requires || visit141_323_2(requires.length === 0))) {
    _$jscoverage['/data-structure.js'].lineData[324]++;
    return visit142_324_1(requires || []);
  } else {
    _$jscoverage['/data-structure.js'].lineData[325]++;
    if (visit143_325_1((normalizedRequires = self.normalizedRequires) && (visit144_327_1(normalizedRequiresStatus === status)))) {
      _$jscoverage['/data-structure.js'].lineData[328]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/data-structure.js'].lineData[330]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/data-structure.js'].lineData[331]++;
      self.normalizedRequires = Utils.normalizeModNames(requires, self.name);
      _$jscoverage['/data-structure.js'].lineData[332]++;
      return self.normalizedRequires;
    }
  }
}};
  _$jscoverage['/data-structure.js'].lineData[337]++;
  Loader.Module = Module;
})(KISSY);
