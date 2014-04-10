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
if (! _$jscoverage['/navigation-view.js']) {
  _$jscoverage['/navigation-view.js'] = {};
  _$jscoverage['/navigation-view.js'].lineData = [];
  _$jscoverage['/navigation-view.js'].lineData[5] = 0;
  _$jscoverage['/navigation-view.js'].lineData[6] = 0;
  _$jscoverage['/navigation-view.js'].lineData[7] = 0;
  _$jscoverage['/navigation-view.js'].lineData[8] = 0;
  _$jscoverage['/navigation-view.js'].lineData[13] = 0;
  _$jscoverage['/navigation-view.js'].lineData[14] = 0;
  _$jscoverage['/navigation-view.js'].lineData[15] = 0;
  _$jscoverage['/navigation-view.js'].lineData[16] = 0;
  _$jscoverage['/navigation-view.js'].lineData[18] = 0;
  _$jscoverage['/navigation-view.js'].lineData[19] = 0;
  _$jscoverage['/navigation-view.js'].lineData[24] = 0;
  _$jscoverage['/navigation-view.js'].lineData[25] = 0;
  _$jscoverage['/navigation-view.js'].lineData[26] = 0;
  _$jscoverage['/navigation-view.js'].lineData[27] = 0;
  _$jscoverage['/navigation-view.js'].lineData[29] = 0;
  _$jscoverage['/navigation-view.js'].lineData[30] = 0;
  _$jscoverage['/navigation-view.js'].lineData[31] = 0;
  _$jscoverage['/navigation-view.js'].lineData[33] = 0;
  _$jscoverage['/navigation-view.js'].lineData[35] = 0;
  _$jscoverage['/navigation-view.js'].lineData[38] = 0;
  _$jscoverage['/navigation-view.js'].lineData[39] = 0;
  _$jscoverage['/navigation-view.js'].lineData[40] = 0;
  _$jscoverage['/navigation-view.js'].lineData[41] = 0;
  _$jscoverage['/navigation-view.js'].lineData[42] = 0;
  _$jscoverage['/navigation-view.js'].lineData[43] = 0;
  _$jscoverage['/navigation-view.js'].lineData[45] = 0;
  _$jscoverage['/navigation-view.js'].lineData[47] = 0;
  _$jscoverage['/navigation-view.js'].lineData[49] = 0;
  _$jscoverage['/navigation-view.js'].lineData[50] = 0;
  _$jscoverage['/navigation-view.js'].lineData[53] = 0;
  _$jscoverage['/navigation-view.js'].lineData[54] = 0;
  _$jscoverage['/navigation-view.js'].lineData[55] = 0;
  _$jscoverage['/navigation-view.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view.js'].lineData[57] = 0;
  _$jscoverage['/navigation-view.js'].lineData[58] = 0;
  _$jscoverage['/navigation-view.js'].lineData[60] = 0;
  _$jscoverage['/navigation-view.js'].lineData[62] = 0;
  _$jscoverage['/navigation-view.js'].lineData[64] = 0;
  _$jscoverage['/navigation-view.js'].lineData[65] = 0;
  _$jscoverage['/navigation-view.js'].lineData[68] = 0;
  _$jscoverage['/navigation-view.js'].lineData[69] = 0;
  _$jscoverage['/navigation-view.js'].lineData[70] = 0;
  _$jscoverage['/navigation-view.js'].lineData[71] = 0;
  _$jscoverage['/navigation-view.js'].lineData[75] = 0;
  _$jscoverage['/navigation-view.js'].lineData[77] = 0;
  _$jscoverage['/navigation-view.js'].lineData[78] = 0;
  _$jscoverage['/navigation-view.js'].lineData[79] = 0;
  _$jscoverage['/navigation-view.js'].lineData[80] = 0;
  _$jscoverage['/navigation-view.js'].lineData[81] = 0;
  _$jscoverage['/navigation-view.js'].lineData[87] = 0;
  _$jscoverage['/navigation-view.js'].lineData[88] = 0;
  _$jscoverage['/navigation-view.js'].lineData[89] = 0;
  _$jscoverage['/navigation-view.js'].lineData[104] = 0;
  _$jscoverage['/navigation-view.js'].lineData[105] = 0;
  _$jscoverage['/navigation-view.js'].lineData[106] = 0;
  _$jscoverage['/navigation-view.js'].lineData[107] = 0;
  _$jscoverage['/navigation-view.js'].lineData[108] = 0;
  _$jscoverage['/navigation-view.js'].lineData[109] = 0;
  _$jscoverage['/navigation-view.js'].lineData[110] = 0;
  _$jscoverage['/navigation-view.js'].lineData[111] = 0;
  _$jscoverage['/navigation-view.js'].lineData[114] = 0;
  _$jscoverage['/navigation-view.js'].lineData[118] = 0;
  _$jscoverage['/navigation-view.js'].lineData[121] = 0;
  _$jscoverage['/navigation-view.js'].lineData[122] = 0;
  _$jscoverage['/navigation-view.js'].lineData[123] = 0;
  _$jscoverage['/navigation-view.js'].lineData[124] = 0;
  _$jscoverage['/navigation-view.js'].lineData[126] = 0;
  _$jscoverage['/navigation-view.js'].lineData[128] = 0;
  _$jscoverage['/navigation-view.js'].lineData[134] = 0;
  _$jscoverage['/navigation-view.js'].lineData[135] = 0;
  _$jscoverage['/navigation-view.js'].lineData[138] = 0;
  _$jscoverage['/navigation-view.js'].lineData[140] = 0;
  _$jscoverage['/navigation-view.js'].lineData[141] = 0;
  _$jscoverage['/navigation-view.js'].lineData[146] = 0;
  _$jscoverage['/navigation-view.js'].lineData[147] = 0;
  _$jscoverage['/navigation-view.js'].lineData[148] = 0;
  _$jscoverage['/navigation-view.js'].lineData[149] = 0;
  _$jscoverage['/navigation-view.js'].lineData[150] = 0;
  _$jscoverage['/navigation-view.js'].lineData[152] = 0;
  _$jscoverage['/navigation-view.js'].lineData[154] = 0;
  _$jscoverage['/navigation-view.js'].lineData[155] = 0;
  _$jscoverage['/navigation-view.js'].lineData[156] = 0;
  _$jscoverage['/navigation-view.js'].lineData[157] = 0;
  _$jscoverage['/navigation-view.js'].lineData[158] = 0;
  _$jscoverage['/navigation-view.js'].lineData[167] = 0;
  _$jscoverage['/navigation-view.js'].lineData[168] = 0;
  _$jscoverage['/navigation-view.js'].lineData[169] = 0;
  _$jscoverage['/navigation-view.js'].lineData[170] = 0;
  _$jscoverage['/navigation-view.js'].lineData[171] = 0;
  _$jscoverage['/navigation-view.js'].lineData[172] = 0;
  _$jscoverage['/navigation-view.js'].lineData[174] = 0;
  _$jscoverage['/navigation-view.js'].lineData[176] = 0;
  _$jscoverage['/navigation-view.js'].lineData[182] = 0;
  _$jscoverage['/navigation-view.js'].lineData[185] = 0;
  _$jscoverage['/navigation-view.js'].lineData[186] = 0;
  _$jscoverage['/navigation-view.js'].lineData[187] = 0;
  _$jscoverage['/navigation-view.js'].lineData[188] = 0;
  _$jscoverage['/navigation-view.js'].lineData[189] = 0;
  _$jscoverage['/navigation-view.js'].lineData[191] = 0;
  _$jscoverage['/navigation-view.js'].lineData[192] = 0;
  _$jscoverage['/navigation-view.js'].lineData[193] = 0;
  _$jscoverage['/navigation-view.js'].lineData[195] = 0;
  _$jscoverage['/navigation-view.js'].lineData[196] = 0;
  _$jscoverage['/navigation-view.js'].lineData[200] = 0;
  _$jscoverage['/navigation-view.js'].lineData[201] = 0;
  _$jscoverage['/navigation-view.js'].lineData[202] = 0;
  _$jscoverage['/navigation-view.js'].lineData[203] = 0;
  _$jscoverage['/navigation-view.js'].lineData[204] = 0;
  _$jscoverage['/navigation-view.js'].lineData[206] = 0;
  _$jscoverage['/navigation-view.js'].lineData[210] = 0;
  _$jscoverage['/navigation-view.js'].lineData[211] = 0;
  _$jscoverage['/navigation-view.js'].lineData[212] = 0;
  _$jscoverage['/navigation-view.js'].lineData[213] = 0;
  _$jscoverage['/navigation-view.js'].lineData[214] = 0;
  _$jscoverage['/navigation-view.js'].lineData[216] = 0;
  _$jscoverage['/navigation-view.js'].lineData[217] = 0;
  _$jscoverage['/navigation-view.js'].lineData[219] = 0;
  _$jscoverage['/navigation-view.js'].lineData[220] = 0;
  _$jscoverage['/navigation-view.js'].lineData[226] = 0;
  _$jscoverage['/navigation-view.js'].lineData[228] = 0;
  _$jscoverage['/navigation-view.js'].lineData[232] = 0;
  _$jscoverage['/navigation-view.js'].lineData[233] = 0;
  _$jscoverage['/navigation-view.js'].lineData[234] = 0;
  _$jscoverage['/navigation-view.js'].lineData[235] = 0;
  _$jscoverage['/navigation-view.js'].lineData[239] = 0;
  _$jscoverage['/navigation-view.js'].lineData[244] = 0;
  _$jscoverage['/navigation-view.js'].lineData[245] = 0;
  _$jscoverage['/navigation-view.js'].lineData[250] = 0;
  _$jscoverage['/navigation-view.js'].lineData[252] = 0;
  _$jscoverage['/navigation-view.js'].lineData[253] = 0;
  _$jscoverage['/navigation-view.js'].lineData[254] = 0;
  _$jscoverage['/navigation-view.js'].lineData[255] = 0;
  _$jscoverage['/navigation-view.js'].lineData[259] = 0;
  _$jscoverage['/navigation-view.js'].lineData[261] = 0;
  _$jscoverage['/navigation-view.js'].lineData[262] = 0;
  _$jscoverage['/navigation-view.js'].lineData[266] = 0;
  _$jscoverage['/navigation-view.js'].lineData[268] = 0;
  _$jscoverage['/navigation-view.js'].lineData[269] = 0;
  _$jscoverage['/navigation-view.js'].lineData[270] = 0;
  _$jscoverage['/navigation-view.js'].lineData[271] = 0;
}
if (! _$jscoverage['/navigation-view.js'].functionData) {
  _$jscoverage['/navigation-view.js'].functionData = [];
  _$jscoverage['/navigation-view.js'].functionData[0] = 0;
  _$jscoverage['/navigation-view.js'].functionData[1] = 0;
  _$jscoverage['/navigation-view.js'].functionData[2] = 0;
  _$jscoverage['/navigation-view.js'].functionData[3] = 0;
  _$jscoverage['/navigation-view.js'].functionData[4] = 0;
  _$jscoverage['/navigation-view.js'].functionData[5] = 0;
  _$jscoverage['/navigation-view.js'].functionData[6] = 0;
  _$jscoverage['/navigation-view.js'].functionData[7] = 0;
  _$jscoverage['/navigation-view.js'].functionData[8] = 0;
  _$jscoverage['/navigation-view.js'].functionData[9] = 0;
  _$jscoverage['/navigation-view.js'].functionData[10] = 0;
  _$jscoverage['/navigation-view.js'].functionData[11] = 0;
  _$jscoverage['/navigation-view.js'].functionData[12] = 0;
  _$jscoverage['/navigation-view.js'].functionData[13] = 0;
  _$jscoverage['/navigation-view.js'].functionData[14] = 0;
  _$jscoverage['/navigation-view.js'].functionData[15] = 0;
  _$jscoverage['/navigation-view.js'].functionData[16] = 0;
  _$jscoverage['/navigation-view.js'].functionData[17] = 0;
  _$jscoverage['/navigation-view.js'].functionData[18] = 0;
  _$jscoverage['/navigation-view.js'].functionData[19] = 0;
  _$jscoverage['/navigation-view.js'].functionData[20] = 0;
  _$jscoverage['/navigation-view.js'].functionData[21] = 0;
}
if (! _$jscoverage['/navigation-view.js'].branchData) {
  _$jscoverage['/navigation-view.js'].branchData = {};
  _$jscoverage['/navigation-view.js'].branchData['7'] = [];
  _$jscoverage['/navigation-view.js'].branchData['7'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['26'] = [];
  _$jscoverage['/navigation-view.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['30'] = [];
  _$jscoverage['/navigation-view.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['41'] = [];
  _$jscoverage['/navigation-view.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['42'] = [];
  _$jscoverage['/navigation-view.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['56'] = [];
  _$jscoverage['/navigation-view.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['57'] = [];
  _$jscoverage['/navigation-view.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['69'] = [];
  _$jscoverage['/navigation-view.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['80'] = [];
  _$jscoverage['/navigation-view.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['107'] = [];
  _$jscoverage['/navigation-view.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['108'] = [];
  _$jscoverage['/navigation-view.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['109'] = [];
  _$jscoverage['/navigation-view.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['110'] = [];
  _$jscoverage['/navigation-view.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['134'] = [];
  _$jscoverage['/navigation-view.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['140'] = [];
  _$jscoverage['/navigation-view.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['147'] = [];
  _$jscoverage['/navigation-view.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['148'] = [];
  _$jscoverage['/navigation-view.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['155'] = [];
  _$jscoverage['/navigation-view.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['167'] = [];
  _$jscoverage['/navigation-view.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['170'] = [];
  _$jscoverage['/navigation-view.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['188'] = [];
  _$jscoverage['/navigation-view.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['195'] = [];
  _$jscoverage['/navigation-view.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['203'] = [];
  _$jscoverage['/navigation-view.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['213'] = [];
  _$jscoverage['/navigation-view.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['234'] = [];
  _$jscoverage['/navigation-view.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['244'] = [];
  _$jscoverage['/navigation-view.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['252'] = [];
  _$jscoverage['/navigation-view.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['268'] = [];
  _$jscoverage['/navigation-view.js'].branchData['268'][1] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['268'][1].init(93, 20, 'viewStack.length > 1');
function visit28_268_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['252'][1].init(108, 41, 'config.animation || self.get(\'animation\')');
function visit27_252_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['244'][1].init(18, 16, 'this.loadingView');
function visit26_244_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['234'][1].init(104, 21, 'loadingHtml !== false');
function visit25_234_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['213'][1].init(98, 4, 'view');
function visit24_213_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['203'][1].init(69, 53, 'self.get(\'navigationView\').get(\'activeView\') === self');
function visit23_203_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['195'][1].init(397, 15, 'i < removedSize');
function visit22_195_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['188'][1].init(145, 32, 'children.length <= viewCacheSize');
function visit21_188_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['170'][1].init(228, 7, 'oldView');
function visit20_170_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['167'][1].init(64, 26, 'loadingView.get(\'visible\')');
function visit19_167_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['155'][1].init(22, 41, 'navigationView.get(\'activeView\') === view');
function visit18_155_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['148'][1].init(18, 7, 'oldView');
function visit17_148_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['147'][1].init(669, 7, 'promise');
function visit16_147_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['140'][1].init(511, 10, 'view.enter');
function visit15_140_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['134'][1].init(376, 24, 'oldView && oldView.leave');
function visit14_134_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['110'][1].init(26, 36, 'children[i].get(\'viewId\') === viewId');
function visit13_110_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['109'][1].init(22, 6, 'viewId');
function visit12_109_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['108'][1].init(18, 48, 'children[i].constructor.xclass === config.xclass');
function visit11_108_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['107'][1].init(119, 19, 'i < children.length');
function visit10_107_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['80'][1].init(59, 12, '!self.active');
function visit9_80_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['69'][1].init(14, 17, 'self._viewAnimCss');
function visit8_69_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['57'][1].init(18, 5, 'enter');
function visit7_57_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['56'][1].init(125, 25, 'animationValue === \'none\'');
function visit6_56_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['42'][1].init(18, 5, 'enter');
function visit5_42_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['41'][1].init(118, 25, 'animationValue === \'none\'');
function visit4_41_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['30'][1].init(179, 8, 'backward');
function visit3_30_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['26'][1].init(62, 29, 'typeof animation === \'string\'');
function visit2_26_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['7'][1].init(88, 43, 'vendorInfo && vendorInfo.propertyNamePrefix');
function visit1_7_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['7'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view.js'].functionData[0]++;
  _$jscoverage['/navigation-view.js'].lineData[6]++;
  var vendorInfo = S.Feature.getCssVendorInfo('animation');
  _$jscoverage['/navigation-view.js'].lineData[7]++;
  var vendorPrefix = visit1_7_1(vendorInfo && vendorInfo.propertyNamePrefix);
  _$jscoverage['/navigation-view.js'].lineData[8]++;
  var ANIMATION_END_EVENT = vendorPrefix ? (vendorPrefix.toLowerCase() + 'AnimationEnd') : 'animationend webkitAnimationEnd';
  _$jscoverage['/navigation-view.js'].lineData[13]++;
  var Container = require('component/container');
  _$jscoverage['/navigation-view.js'].lineData[14]++;
  var Control = require('component/control');
  _$jscoverage['/navigation-view.js'].lineData[15]++;
  var ContentTpl = require('component/extension/content-xtpl');
  _$jscoverage['/navigation-view.js'].lineData[16]++;
  var ContentBox = require('component/extension/content-box');
  _$jscoverage['/navigation-view.js'].lineData[18]++;
  function getAnimCss(prefixCls, animation, enter) {
    _$jscoverage['/navigation-view.js'].functionData[1]++;
    _$jscoverage['/navigation-view.js'].lineData[19]++;
    return prefixCls + 'navigation-view-' + ('anim-' + animation + '-' + (enter ? 'enter' : 'leave')) + ' ' + prefixCls + 'navigation-view-anim-ing';
  }
  _$jscoverage['/navigation-view.js'].lineData[24]++;
  function getAnimValueFromView(view, enter, backward) {
    _$jscoverage['/navigation-view.js'].functionData[2]++;
    _$jscoverage['/navigation-view.js'].lineData[25]++;
    var animation = view.get('animation');
    _$jscoverage['/navigation-view.js'].lineData[26]++;
    if (visit2_26_1(typeof animation === 'string')) {
      _$jscoverage['/navigation-view.js'].lineData[27]++;
      return animation;
    }
    _$jscoverage['/navigation-view.js'].lineData[29]++;
    var animationValue;
    _$jscoverage['/navigation-view.js'].lineData[30]++;
    if (visit3_30_1(backward)) {
      _$jscoverage['/navigation-view.js'].lineData[31]++;
      animationValue = enter ? animation[1] : animation[0];
    } else {
      _$jscoverage['/navigation-view.js'].lineData[33]++;
      animationValue = enter ? animation[0] : animation[1];
    }
    _$jscoverage['/navigation-view.js'].lineData[35]++;
    return animationValue;
  }
  _$jscoverage['/navigation-view.js'].lineData[38]++;
  function transition(view, enter, backward) {
    _$jscoverage['/navigation-view.js'].functionData[3]++;
    _$jscoverage['/navigation-view.js'].lineData[39]++;
    clearAnimCss(view);
    _$jscoverage['/navigation-view.js'].lineData[40]++;
    var animationValue = getAnimValueFromView(view, enter, backward);
    _$jscoverage['/navigation-view.js'].lineData[41]++;
    if (visit4_41_1(animationValue === 'none')) {
      _$jscoverage['/navigation-view.js'].lineData[42]++;
      if (visit5_42_1(enter)) {
        _$jscoverage['/navigation-view.js'].lineData[43]++;
        view.show();
      } else {
        _$jscoverage['/navigation-view.js'].lineData[45]++;
        view.hide();
      }
      _$jscoverage['/navigation-view.js'].lineData[47]++;
      return;
    }
    _$jscoverage['/navigation-view.js'].lineData[49]++;
    view.show();
    _$jscoverage['/navigation-view.js'].lineData[50]++;
    view.$el.addClass(view._viewAnimCss = getAnimCss(view.get('prefixCls'), animationValue, enter));
  }
  _$jscoverage['/navigation-view.js'].lineData[53]++;
  function loadingTransition(loadingView, view, enter, backward) {
    _$jscoverage['/navigation-view.js'].functionData[4]++;
    _$jscoverage['/navigation-view.js'].lineData[54]++;
    clearAnimCss(loadingView);
    _$jscoverage['/navigation-view.js'].lineData[55]++;
    var animationValue = getAnimValueFromView(view, enter, backward);
    _$jscoverage['/navigation-view.js'].lineData[56]++;
    if (visit6_56_1(animationValue === 'none')) {
      _$jscoverage['/navigation-view.js'].lineData[57]++;
      if (visit7_57_1(enter)) {
        _$jscoverage['/navigation-view.js'].lineData[58]++;
        loadingView.show();
      } else {
        _$jscoverage['/navigation-view.js'].lineData[60]++;
        loadingView.hide();
      }
      _$jscoverage['/navigation-view.js'].lineData[62]++;
      return;
    }
    _$jscoverage['/navigation-view.js'].lineData[64]++;
    loadingView.show();
    _$jscoverage['/navigation-view.js'].lineData[65]++;
    loadingView.$el.addClass(loadingView._viewAnimCss = getAnimCss(view.get('prefixCls'), animationValue, enter));
  }
  _$jscoverage['/navigation-view.js'].lineData[68]++;
  function clearAnimCss(self) {
    _$jscoverage['/navigation-view.js'].functionData[5]++;
    _$jscoverage['/navigation-view.js'].lineData[69]++;
    if (visit8_69_1(self._viewAnimCss)) {
      _$jscoverage['/navigation-view.js'].lineData[70]++;
      self.$el.removeClass(self._viewAnimCss);
      _$jscoverage['/navigation-view.js'].lineData[71]++;
      self._viewAnimCss = null;
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[75]++;
  var LoadingView = Control.extend({
  bindUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[6]++;
  _$jscoverage['/navigation-view.js'].lineData[77]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[78]++;
  self.$el.on(ANIMATION_END_EVENT, function() {
  _$jscoverage['/navigation-view.js'].functionData[7]++;
  _$jscoverage['/navigation-view.js'].lineData[79]++;
  clearAnimCss(self);
  _$jscoverage['/navigation-view.js'].lineData[80]++;
  if (visit9_80_1(!self.active)) {
    _$jscoverage['/navigation-view.js'].lineData[81]++;
    self.hide();
  }
});
}, 
  transition: function(enter, backward) {
  _$jscoverage['/navigation-view.js'].functionData[8]++;
  _$jscoverage['/navigation-view.js'].lineData[87]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[88]++;
  self.active = enter;
  _$jscoverage['/navigation-view.js'].lineData[89]++;
  loadingTransition(self, self.navigationView.get('activeView'), enter, backward);
}}, {
  xclass: 'navigation-view-loading', 
  ATTRS: {
  handleGestureEvents: {
  value: false}, 
  visible: {
  value: false}}});
  _$jscoverage['/navigation-view.js'].lineData[104]++;
  function getViewInstance(navigationView, config) {
    _$jscoverage['/navigation-view.js'].functionData[9]++;
    _$jscoverage['/navigation-view.js'].lineData[105]++;
    var children = navigationView.get('children');
    _$jscoverage['/navigation-view.js'].lineData[106]++;
    var viewId = config.viewId;
    _$jscoverage['/navigation-view.js'].lineData[107]++;
    for (var i = 0; visit10_107_1(i < children.length); i++) {
      _$jscoverage['/navigation-view.js'].lineData[108]++;
      if (visit11_108_1(children[i].constructor.xclass === config.xclass)) {
        _$jscoverage['/navigation-view.js'].lineData[109]++;
        if (visit12_109_1(viewId)) {
          _$jscoverage['/navigation-view.js'].lineData[110]++;
          if (visit13_110_1(children[i].get('viewId') === viewId)) {
            _$jscoverage['/navigation-view.js'].lineData[111]++;
            return children[i];
          }
        } else {
          _$jscoverage['/navigation-view.js'].lineData[114]++;
          return children[i];
        }
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[118]++;
    return null;
  }
  _$jscoverage['/navigation-view.js'].lineData[121]++;
  function switchTo(navigationView, viewConfig, backward) {
    _$jscoverage['/navigation-view.js'].functionData[10]++;
    _$jscoverage['/navigation-view.js'].lineData[122]++;
    var loadingView = navigationView.loadingView;
    _$jscoverage['/navigation-view.js'].lineData[123]++;
    var view = viewConfig.view;
    _$jscoverage['/navigation-view.js'].lineData[124]++;
    var fromCache = viewConfig.fromCache;
    _$jscoverage['/navigation-view.js'].lineData[126]++;
    var oldView = navigationView.get('activeView');
    _$jscoverage['/navigation-view.js'].lineData[128]++;
    navigationView.fire('beforeInnerViewChange', {
  oldView: oldView, 
  newView: view, 
  backward: backward});
    _$jscoverage['/navigation-view.js'].lineData[134]++;
    if (visit14_134_1(oldView && oldView.leave)) {
      _$jscoverage['/navigation-view.js'].lineData[135]++;
      oldView.leave();
    }
    _$jscoverage['/navigation-view.js'].lineData[138]++;
    navigationView.set('activeView', view);
    _$jscoverage['/navigation-view.js'].lineData[140]++;
    if (visit15_140_1(view.enter)) {
      _$jscoverage['/navigation-view.js'].lineData[141]++;
      view.enter({
  fromCache: fromCache});
    }
    _$jscoverage['/navigation-view.js'].lineData[146]++;
    var promise = view.promise;
    _$jscoverage['/navigation-view.js'].lineData[147]++;
    if (visit16_147_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[148]++;
      if (visit17_148_1(oldView)) {
        _$jscoverage['/navigation-view.js'].lineData[149]++;
        transition(oldView, false, backward);
        _$jscoverage['/navigation-view.js'].lineData[150]++;
        loadingView.transition(true, backward);
      } else {
        _$jscoverage['/navigation-view.js'].lineData[152]++;
        loadingView.show();
      }
      _$jscoverage['/navigation-view.js'].lineData[154]++;
      promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[11]++;
  _$jscoverage['/navigation-view.js'].lineData[155]++;
  if (visit18_155_1(navigationView.get('activeView') === view)) {
    _$jscoverage['/navigation-view.js'].lineData[156]++;
    loadingView.hide();
    _$jscoverage['/navigation-view.js'].lineData[157]++;
    view.show();
    _$jscoverage['/navigation-view.js'].lineData[158]++;
    navigationView.fire('afterInnerViewChange', {
  newView: view, 
  oldView: oldView, 
  backward: backward});
  }
});
    } else {
      _$jscoverage['/navigation-view.js'].lineData[167]++;
      if (visit19_167_1(loadingView.get('visible'))) {
        _$jscoverage['/navigation-view.js'].lineData[168]++;
        loadingView.transition(false, backward);
        _$jscoverage['/navigation-view.js'].lineData[169]++;
        transition(view, true, backward);
      } else {
        _$jscoverage['/navigation-view.js'].lineData[170]++;
        if (visit20_170_1(oldView)) {
          _$jscoverage['/navigation-view.js'].lineData[171]++;
          transition(oldView, false, backward);
          _$jscoverage['/navigation-view.js'].lineData[172]++;
          transition(view, true, backward);
        } else {
          _$jscoverage['/navigation-view.js'].lineData[174]++;
          view.show();
        }
      }
      _$jscoverage['/navigation-view.js'].lineData[176]++;
      navigationView.fire('afterInnerViewChange', {
  newView: view, 
  oldView: oldView, 
  backward: backward});
    }
    _$jscoverage['/navigation-view.js'].lineData[182]++;
    gc(navigationView);
  }
  _$jscoverage['/navigation-view.js'].lineData[185]++;
  function gc(navigationView) {
    _$jscoverage['/navigation-view.js'].functionData[12]++;
    _$jscoverage['/navigation-view.js'].lineData[186]++;
    var children = navigationView.get('children').concat();
    _$jscoverage['/navigation-view.js'].lineData[187]++;
    var viewCacheSize = navigationView.get('viewCacheSize');
    _$jscoverage['/navigation-view.js'].lineData[188]++;
    if (visit21_188_1(children.length <= viewCacheSize)) {
      _$jscoverage['/navigation-view.js'].lineData[189]++;
      return;
    }
    _$jscoverage['/navigation-view.js'].lineData[191]++;
    var removedSize = Math.floor(viewCacheSize / 3);
    _$jscoverage['/navigation-view.js'].lineData[192]++;
    children.sort(function(a, b) {
  _$jscoverage['/navigation-view.js'].functionData[13]++;
  _$jscoverage['/navigation-view.js'].lineData[193]++;
  return a.timeStamp - b.timeStamp;
});
    _$jscoverage['/navigation-view.js'].lineData[195]++;
    for (var i = 0; visit22_195_1(i < removedSize); i++) {
      _$jscoverage['/navigation-view.js'].lineData[196]++;
      navigationView.removeChild(children[i]);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[200]++;
  function onViewAnimEnd() {
    _$jscoverage['/navigation-view.js'].functionData[14]++;
    _$jscoverage['/navigation-view.js'].lineData[201]++;
    var self = this;
    _$jscoverage['/navigation-view.js'].lineData[202]++;
    clearAnimCss(self);
    _$jscoverage['/navigation-view.js'].lineData[203]++;
    if (visit23_203_1(self.get('navigationView').get('activeView') === self)) {
      _$jscoverage['/navigation-view.js'].lineData[204]++;
      self.show();
    } else {
      _$jscoverage['/navigation-view.js'].lineData[206]++;
      self.hide();
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[210]++;
  function createView(self, config) {
    _$jscoverage['/navigation-view.js'].functionData[15]++;
    _$jscoverage['/navigation-view.js'].lineData[211]++;
    var view = getViewInstance(self, config);
    _$jscoverage['/navigation-view.js'].lineData[212]++;
    var fromCache = !!view;
    _$jscoverage['/navigation-view.js'].lineData[213]++;
    if (visit24_213_1(view)) {
      _$jscoverage['/navigation-view.js'].lineData[214]++;
      view.set(config);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[216]++;
      view = self.addChild(config);
      _$jscoverage['/navigation-view.js'].lineData[217]++;
      view.$el.on(ANIMATION_END_EVENT, onViewAnimEnd, view);
    }
    _$jscoverage['/navigation-view.js'].lineData[219]++;
    view.timeStamp = S.now();
    _$jscoverage['/navigation-view.js'].lineData[220]++;
    return {
  view: view, 
  fromCache: fromCache};
  }
  _$jscoverage['/navigation-view.js'].lineData[226]++;
  return Container.extend([ContentBox], {
  initializer: function() {
  _$jscoverage['/navigation-view.js'].functionData[16]++;
  _$jscoverage['/navigation-view.js'].lineData[228]++;
  this.viewStack = [];
}, 
  createDom: function() {
  _$jscoverage['/navigation-view.js'].functionData[17]++;
  _$jscoverage['/navigation-view.js'].lineData[232]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[233]++;
  var loadingHtml = self.get('loadingHtml');
  _$jscoverage['/navigation-view.js'].lineData[234]++;
  if (visit25_234_1(loadingHtml !== false)) {
    _$jscoverage['/navigation-view.js'].lineData[235]++;
    self.loadingView = new LoadingView({
  content: loadingHtml, 
  render: self.contentEl}).render();
    _$jscoverage['/navigation-view.js'].lineData[239]++;
    self.loadingView.navigationView = self;
  }
}, 
  _onSetLoadingHtml: function(v) {
  _$jscoverage['/navigation-view.js'].functionData[18]++;
  _$jscoverage['/navigation-view.js'].lineData[244]++;
  if (visit26_244_1(this.loadingView)) {
    _$jscoverage['/navigation-view.js'].lineData[245]++;
    this.loadingView.set('content', v);
  }
}, 
  push: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[19]++;
  _$jscoverage['/navigation-view.js'].lineData[250]++;
  var self = this, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[252]++;
  config.animation = visit27_252_1(config.animation || self.get('animation'));
  _$jscoverage['/navigation-view.js'].lineData[253]++;
  config.navigationView = self;
  _$jscoverage['/navigation-view.js'].lineData[254]++;
  viewStack.push(config);
  _$jscoverage['/navigation-view.js'].lineData[255]++;
  switchTo(self, createView(self, config));
}, 
  replace: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[20]++;
  _$jscoverage['/navigation-view.js'].lineData[259]++;
  var self = this, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[261]++;
  S.mix(viewStack[viewStack.length - 1], config);
  _$jscoverage['/navigation-view.js'].lineData[262]++;
  self.get('activeView').set(config);
}, 
  pop: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[21]++;
  _$jscoverage['/navigation-view.js'].lineData[266]++;
  var self = this, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[268]++;
  if (visit28_268_1(viewStack.length > 1)) {
    _$jscoverage['/navigation-view.js'].lineData[269]++;
    viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[270]++;
    config = viewStack[viewStack.length - 1];
    _$jscoverage['/navigation-view.js'].lineData[271]++;
    switchTo(self, createView(self, config), true);
  }
}}, {
  xclass: 'navigation-view', 
  ATTRS: {
  animation: {
  value: ['slide-right', 'slide-left']}, 
  loadingHtml: {
  sync: 0}, 
  handleGestureEvents: {
  value: false}, 
  viewCacheSize: {
  value: 10}, 
  focusable: {
  value: false}, 
  allowTextSelection: {
  value: true}, 
  contentTpl: {
  value: ContentTpl}, 
  defaultChildCfg: {
  value: {
  handleGestureEvents: false, 
  visible: false, 
  allowTextSelection: true}}}});
});
