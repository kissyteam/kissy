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
  _$jscoverage['/navigation-view.js'].lineData[12] = 0;
  _$jscoverage['/navigation-view.js'].lineData[13] = 0;
  _$jscoverage['/navigation-view.js'].lineData[14] = 0;
  _$jscoverage['/navigation-view.js'].lineData[15] = 0;
  _$jscoverage['/navigation-view.js'].lineData[17] = 0;
  _$jscoverage['/navigation-view.js'].lineData[18] = 0;
  _$jscoverage['/navigation-view.js'].lineData[23] = 0;
  _$jscoverage['/navigation-view.js'].lineData[24] = 0;
  _$jscoverage['/navigation-view.js'].lineData[25] = 0;
  _$jscoverage['/navigation-view.js'].lineData[26] = 0;
  _$jscoverage['/navigation-view.js'].lineData[28] = 0;
  _$jscoverage['/navigation-view.js'].lineData[29] = 0;
  _$jscoverage['/navigation-view.js'].lineData[30] = 0;
  _$jscoverage['/navigation-view.js'].lineData[32] = 0;
  _$jscoverage['/navigation-view.js'].lineData[34] = 0;
  _$jscoverage['/navigation-view.js'].lineData[37] = 0;
  _$jscoverage['/navigation-view.js'].lineData[38] = 0;
  _$jscoverage['/navigation-view.js'].lineData[39] = 0;
  _$jscoverage['/navigation-view.js'].lineData[40] = 0;
  _$jscoverage['/navigation-view.js'].lineData[41] = 0;
  _$jscoverage['/navigation-view.js'].lineData[42] = 0;
  _$jscoverage['/navigation-view.js'].lineData[44] = 0;
  _$jscoverage['/navigation-view.js'].lineData[46] = 0;
  _$jscoverage['/navigation-view.js'].lineData[48] = 0;
  _$jscoverage['/navigation-view.js'].lineData[49] = 0;
  _$jscoverage['/navigation-view.js'].lineData[52] = 0;
  _$jscoverage['/navigation-view.js'].lineData[53] = 0;
  _$jscoverage['/navigation-view.js'].lineData[54] = 0;
  _$jscoverage['/navigation-view.js'].lineData[55] = 0;
  _$jscoverage['/navigation-view.js'].lineData[56] = 0;
  _$jscoverage['/navigation-view.js'].lineData[57] = 0;
  _$jscoverage['/navigation-view.js'].lineData[59] = 0;
  _$jscoverage['/navigation-view.js'].lineData[61] = 0;
  _$jscoverage['/navigation-view.js'].lineData[63] = 0;
  _$jscoverage['/navigation-view.js'].lineData[64] = 0;
  _$jscoverage['/navigation-view.js'].lineData[67] = 0;
  _$jscoverage['/navigation-view.js'].lineData[68] = 0;
  _$jscoverage['/navigation-view.js'].lineData[69] = 0;
  _$jscoverage['/navigation-view.js'].lineData[70] = 0;
  _$jscoverage['/navigation-view.js'].lineData[74] = 0;
  _$jscoverage['/navigation-view.js'].lineData[76] = 0;
  _$jscoverage['/navigation-view.js'].lineData[77] = 0;
  _$jscoverage['/navigation-view.js'].lineData[78] = 0;
  _$jscoverage['/navigation-view.js'].lineData[79] = 0;
  _$jscoverage['/navigation-view.js'].lineData[80] = 0;
  _$jscoverage['/navigation-view.js'].lineData[86] = 0;
  _$jscoverage['/navigation-view.js'].lineData[87] = 0;
  _$jscoverage['/navigation-view.js'].lineData[88] = 0;
  _$jscoverage['/navigation-view.js'].lineData[103] = 0;
  _$jscoverage['/navigation-view.js'].lineData[104] = 0;
  _$jscoverage['/navigation-view.js'].lineData[105] = 0;
  _$jscoverage['/navigation-view.js'].lineData[106] = 0;
  _$jscoverage['/navigation-view.js'].lineData[107] = 0;
  _$jscoverage['/navigation-view.js'].lineData[108] = 0;
  _$jscoverage['/navigation-view.js'].lineData[109] = 0;
  _$jscoverage['/navigation-view.js'].lineData[110] = 0;
  _$jscoverage['/navigation-view.js'].lineData[113] = 0;
  _$jscoverage['/navigation-view.js'].lineData[117] = 0;
  _$jscoverage['/navigation-view.js'].lineData[120] = 0;
  _$jscoverage['/navigation-view.js'].lineData[121] = 0;
  _$jscoverage['/navigation-view.js'].lineData[123] = 0;
  _$jscoverage['/navigation-view.js'].lineData[125] = 0;
  _$jscoverage['/navigation-view.js'].lineData[131] = 0;
  _$jscoverage['/navigation-view.js'].lineData[132] = 0;
  _$jscoverage['/navigation-view.js'].lineData[135] = 0;
  _$jscoverage['/navigation-view.js'].lineData[137] = 0;
  _$jscoverage['/navigation-view.js'].lineData[138] = 0;
  _$jscoverage['/navigation-view.js'].lineData[140] = 0;
  _$jscoverage['/navigation-view.js'].lineData[141] = 0;
  _$jscoverage['/navigation-view.js'].lineData[142] = 0;
  _$jscoverage['/navigation-view.js'].lineData[143] = 0;
  _$jscoverage['/navigation-view.js'].lineData[144] = 0;
  _$jscoverage['/navigation-view.js'].lineData[146] = 0;
  _$jscoverage['/navigation-view.js'].lineData[148] = 0;
  _$jscoverage['/navigation-view.js'].lineData[149] = 0;
  _$jscoverage['/navigation-view.js'].lineData[150] = 0;
  _$jscoverage['/navigation-view.js'].lineData[151] = 0;
  _$jscoverage['/navigation-view.js'].lineData[152] = 0;
  _$jscoverage['/navigation-view.js'].lineData[161] = 0;
  _$jscoverage['/navigation-view.js'].lineData[162] = 0;
  _$jscoverage['/navigation-view.js'].lineData[163] = 0;
  _$jscoverage['/navigation-view.js'].lineData[165] = 0;
  _$jscoverage['/navigation-view.js'].lineData[166] = 0;
  _$jscoverage['/navigation-view.js'].lineData[167] = 0;
  _$jscoverage['/navigation-view.js'].lineData[169] = 0;
  _$jscoverage['/navigation-view.js'].lineData[171] = 0;
  _$jscoverage['/navigation-view.js'].lineData[177] = 0;
  _$jscoverage['/navigation-view.js'].lineData[180] = 0;
  _$jscoverage['/navigation-view.js'].lineData[181] = 0;
  _$jscoverage['/navigation-view.js'].lineData[182] = 0;
  _$jscoverage['/navigation-view.js'].lineData[183] = 0;
  _$jscoverage['/navigation-view.js'].lineData[184] = 0;
  _$jscoverage['/navigation-view.js'].lineData[186] = 0;
  _$jscoverage['/navigation-view.js'].lineData[187] = 0;
  _$jscoverage['/navigation-view.js'].lineData[188] = 0;
  _$jscoverage['/navigation-view.js'].lineData[190] = 0;
  _$jscoverage['/navigation-view.js'].lineData[191] = 0;
  _$jscoverage['/navigation-view.js'].lineData[195] = 0;
  _$jscoverage['/navigation-view.js'].lineData[196] = 0;
  _$jscoverage['/navigation-view.js'].lineData[197] = 0;
  _$jscoverage['/navigation-view.js'].lineData[198] = 0;
  _$jscoverage['/navigation-view.js'].lineData[199] = 0;
  _$jscoverage['/navigation-view.js'].lineData[201] = 0;
  _$jscoverage['/navigation-view.js'].lineData[205] = 0;
  _$jscoverage['/navigation-view.js'].lineData[206] = 0;
  _$jscoverage['/navigation-view.js'].lineData[207] = 0;
  _$jscoverage['/navigation-view.js'].lineData[208] = 0;
  _$jscoverage['/navigation-view.js'].lineData[209] = 0;
  _$jscoverage['/navigation-view.js'].lineData[211] = 0;
  _$jscoverage['/navigation-view.js'].lineData[213] = 0;
  _$jscoverage['/navigation-view.js'].lineData[214] = 0;
  _$jscoverage['/navigation-view.js'].lineData[217] = 0;
  _$jscoverage['/navigation-view.js'].lineData[219] = 0;
  _$jscoverage['/navigation-view.js'].lineData[221] = 0;
  _$jscoverage['/navigation-view.js'].lineData[222] = 0;
  _$jscoverage['/navigation-view.js'].lineData[226] = 0;
  _$jscoverage['/navigation-view.js'].lineData[227] = 0;
  _$jscoverage['/navigation-view.js'].lineData[231] = 0;
  _$jscoverage['/navigation-view.js'].lineData[235] = 0;
  _$jscoverage['/navigation-view.js'].lineData[238] = 0;
  _$jscoverage['/navigation-view.js'].lineData[239] = 0;
  _$jscoverage['/navigation-view.js'].lineData[240] = 0;
  _$jscoverage['/navigation-view.js'].lineData[241] = 0;
  _$jscoverage['/navigation-view.js'].lineData[242] = 0;
  _$jscoverage['/navigation-view.js'].lineData[246] = 0;
  _$jscoverage['/navigation-view.js'].lineData[248] = 0;
  _$jscoverage['/navigation-view.js'].lineData[249] = 0;
  _$jscoverage['/navigation-view.js'].lineData[253] = 0;
  _$jscoverage['/navigation-view.js'].lineData[256] = 0;
  _$jscoverage['/navigation-view.js'].lineData[257] = 0;
  _$jscoverage['/navigation-view.js'].lineData[258] = 0;
  _$jscoverage['/navigation-view.js'].lineData[259] = 0;
  _$jscoverage['/navigation-view.js'].lineData[260] = 0;
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
}
if (! _$jscoverage['/navigation-view.js'].branchData) {
  _$jscoverage['/navigation-view.js'].branchData = {};
  _$jscoverage['/navigation-view.js'].branchData['25'] = [];
  _$jscoverage['/navigation-view.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['29'] = [];
  _$jscoverage['/navigation-view.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['40'] = [];
  _$jscoverage['/navigation-view.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['41'] = [];
  _$jscoverage['/navigation-view.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['55'] = [];
  _$jscoverage['/navigation-view.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['56'] = [];
  _$jscoverage['/navigation-view.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['68'] = [];
  _$jscoverage['/navigation-view.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['79'] = [];
  _$jscoverage['/navigation-view.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['106'] = [];
  _$jscoverage['/navigation-view.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['107'] = [];
  _$jscoverage['/navigation-view.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['108'] = [];
  _$jscoverage['/navigation-view.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['109'] = [];
  _$jscoverage['/navigation-view.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['131'] = [];
  _$jscoverage['/navigation-view.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['137'] = [];
  _$jscoverage['/navigation-view.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['141'] = [];
  _$jscoverage['/navigation-view.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['142'] = [];
  _$jscoverage['/navigation-view.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['149'] = [];
  _$jscoverage['/navigation-view.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['161'] = [];
  _$jscoverage['/navigation-view.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['165'] = [];
  _$jscoverage['/navigation-view.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['183'] = [];
  _$jscoverage['/navigation-view.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['190'] = [];
  _$jscoverage['/navigation-view.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['198'] = [];
  _$jscoverage['/navigation-view.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['207'] = [];
  _$jscoverage['/navigation-view.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['238'] = [];
  _$jscoverage['/navigation-view.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/navigation-view.js'].branchData['256'] = [];
  _$jscoverage['/navigation-view.js'].branchData['256'][1] = new BranchData();
}
_$jscoverage['/navigation-view.js'].branchData['256'][1].init(120, 20, 'viewStack.length > 1');
function visit25_256_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['238'][1].init(135, 41, 'config.animation || self.get(\'animation\')');
function visit24_238_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['207'][1].init(65, 5, '!view');
function visit23_207_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['198'][1].init(69, 53, 'view.get(\'navigationView\').get(\'activeView\') === view');
function visit22_198_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['190'][1].init(397, 15, 'i < removedSize');
function visit21_190_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['183'][1].init(145, 32, 'children.length <= viewCacheSize');
function visit20_183_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['165'][1].init(241, 7, 'oldView');
function visit19_165_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['161'][1].init(64, 26, 'loadingView.get(\'visible\')');
function visit18_161_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['149'][1].init(22, 41, 'navigationView.get(\'activeView\') === view');
function visit17_149_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['142'][1].init(18, 7, 'oldView');
function visit16_142_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['141'][1].init(529, 7, 'promise');
function visit15_141_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['137'][1].init(427, 10, 'view.enter');
function visit14_137_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['131'][1].init(292, 24, 'oldView && oldView.leave');
function visit13_131_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['109'][1].init(26, 36, 'children[i].get(\'viewId\') === viewId');
function visit12_109_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['108'][1].init(22, 6, 'viewId');
function visit11_108_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['107'][1].init(18, 48, 'children[i].constructor.xclass === config.xclass');
function visit10_107_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['106'][1].init(119, 19, 'i < children.length');
function visit9_106_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['79'][1].init(59, 12, '!self.active');
function visit8_79_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['68'][1].init(14, 17, 'self._viewAnimCss');
function visit7_68_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['56'][1].init(18, 5, 'enter');
function visit6_56_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['55'][1].init(125, 25, 'animationValue === \'none\'');
function visit5_55_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['41'][1].init(18, 5, 'enter');
function visit4_41_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['40'][1].init(118, 25, 'animationValue === \'none\'');
function visit3_40_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['29'][1].init(179, 8, 'backward');
function visit2_29_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].branchData['25'][1].init(62, 29, 'typeof animation === \'string\'');
function visit1_25_1(result) {
  _$jscoverage['/navigation-view.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/navigation-view.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/navigation-view.js'].functionData[0]++;
  _$jscoverage['/navigation-view.js'].lineData[6]++;
  var vendorPrefix = S.Feature.getVendorCssPropPrefix('animation');
  _$jscoverage['/navigation-view.js'].lineData[7]++;
  var ANIMATION_END_EVENT = vendorPrefix ? (vendorPrefix.toLowerCase() + 'AnimationEnd') : 'animationend webkitAnimationEnd';
  _$jscoverage['/navigation-view.js'].lineData[12]++;
  var Container = require('component/container');
  _$jscoverage['/navigation-view.js'].lineData[13]++;
  var Control = require('component/control');
  _$jscoverage['/navigation-view.js'].lineData[14]++;
  var ContentTpl = require('component/extension/content-xtpl');
  _$jscoverage['/navigation-view.js'].lineData[15]++;
  var ContentRender = require('component/extension/content-render');
  _$jscoverage['/navigation-view.js'].lineData[17]++;
  function getAnimCss(prefixCls, animation, enter) {
    _$jscoverage['/navigation-view.js'].functionData[1]++;
    _$jscoverage['/navigation-view.js'].lineData[18]++;
    return prefixCls + 'navigation-view-' + ('anim-' + animation + '-' + (enter ? 'enter' : 'leave')) + ' ' + prefixCls + 'navigation-view-anim-ing';
  }
  _$jscoverage['/navigation-view.js'].lineData[23]++;
  function getAnimValueFromView(view, enter, backward) {
    _$jscoverage['/navigation-view.js'].functionData[2]++;
    _$jscoverage['/navigation-view.js'].lineData[24]++;
    var animation = view.get('animation');
    _$jscoverage['/navigation-view.js'].lineData[25]++;
    if (visit1_25_1(typeof animation === 'string')) {
      _$jscoverage['/navigation-view.js'].lineData[26]++;
      return animation;
    }
    _$jscoverage['/navigation-view.js'].lineData[28]++;
    var animationValue;
    _$jscoverage['/navigation-view.js'].lineData[29]++;
    if (visit2_29_1(backward)) {
      _$jscoverage['/navigation-view.js'].lineData[30]++;
      animationValue = enter ? animation[1] : animation[0];
    } else {
      _$jscoverage['/navigation-view.js'].lineData[32]++;
      animationValue = enter ? animation[0] : animation[1];
    }
    _$jscoverage['/navigation-view.js'].lineData[34]++;
    return animationValue;
  }
  _$jscoverage['/navigation-view.js'].lineData[37]++;
  function transition(view, enter, backward) {
    _$jscoverage['/navigation-view.js'].functionData[3]++;
    _$jscoverage['/navigation-view.js'].lineData[38]++;
    clearAnimCss(view);
    _$jscoverage['/navigation-view.js'].lineData[39]++;
    var animationValue = getAnimValueFromView(view, enter, backward);
    _$jscoverage['/navigation-view.js'].lineData[40]++;
    if (visit3_40_1(animationValue === 'none')) {
      _$jscoverage['/navigation-view.js'].lineData[41]++;
      if (visit4_41_1(enter)) {
        _$jscoverage['/navigation-view.js'].lineData[42]++;
        view.show();
      } else {
        _$jscoverage['/navigation-view.js'].lineData[44]++;
        view.hide();
      }
      _$jscoverage['/navigation-view.js'].lineData[46]++;
      return;
    }
    _$jscoverage['/navigation-view.js'].lineData[48]++;
    view.show();
    _$jscoverage['/navigation-view.js'].lineData[49]++;
    view.$el.addClass(view._viewAnimCss = getAnimCss(view.get('prefixCls'), animationValue, enter));
  }
  _$jscoverage['/navigation-view.js'].lineData[52]++;
  function loadingTransition(loadingView, view, enter, backward) {
    _$jscoverage['/navigation-view.js'].functionData[4]++;
    _$jscoverage['/navigation-view.js'].lineData[53]++;
    clearAnimCss(loadingView);
    _$jscoverage['/navigation-view.js'].lineData[54]++;
    var animationValue = getAnimValueFromView(view, enter, backward);
    _$jscoverage['/navigation-view.js'].lineData[55]++;
    if (visit5_55_1(animationValue === 'none')) {
      _$jscoverage['/navigation-view.js'].lineData[56]++;
      if (visit6_56_1(enter)) {
        _$jscoverage['/navigation-view.js'].lineData[57]++;
        loadingView.show();
      } else {
        _$jscoverage['/navigation-view.js'].lineData[59]++;
        loadingView.hide();
      }
      _$jscoverage['/navigation-view.js'].lineData[61]++;
      return;
    }
    _$jscoverage['/navigation-view.js'].lineData[63]++;
    loadingView.show();
    _$jscoverage['/navigation-view.js'].lineData[64]++;
    loadingView.$el.addClass(loadingView._viewAnimCss = getAnimCss(view.get('prefixCls'), animationValue, enter));
  }
  _$jscoverage['/navigation-view.js'].lineData[67]++;
  function clearAnimCss(self) {
    _$jscoverage['/navigation-view.js'].functionData[5]++;
    _$jscoverage['/navigation-view.js'].lineData[68]++;
    if (visit7_68_1(self._viewAnimCss)) {
      _$jscoverage['/navigation-view.js'].lineData[69]++;
      self.$el.removeClass(self._viewAnimCss);
      _$jscoverage['/navigation-view.js'].lineData[70]++;
      self._viewAnimCss = null;
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[74]++;
  var LoadingView = Control.extend({
  bindUI: function() {
  _$jscoverage['/navigation-view.js'].functionData[6]++;
  _$jscoverage['/navigation-view.js'].lineData[76]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[77]++;
  self.$el.on(ANIMATION_END_EVENT, function() {
  _$jscoverage['/navigation-view.js'].functionData[7]++;
  _$jscoverage['/navigation-view.js'].lineData[78]++;
  clearAnimCss(self);
  _$jscoverage['/navigation-view.js'].lineData[79]++;
  if (visit8_79_1(!self.active)) {
    _$jscoverage['/navigation-view.js'].lineData[80]++;
    self.hide();
  }
});
}, 
  transition: function(enter, backward) {
  _$jscoverage['/navigation-view.js'].functionData[8]++;
  _$jscoverage['/navigation-view.js'].lineData[86]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[87]++;
  self.active = enter;
  _$jscoverage['/navigation-view.js'].lineData[88]++;
  loadingTransition(self, self.navigationView.get('activeView'), enter, backward);
}}, {
  xclass: 'navigation-view-loading', 
  ATTRS: {
  handleGestureEvents: {
  value: false}, 
  visible: {
  value: false}}});
  _$jscoverage['/navigation-view.js'].lineData[103]++;
  function getViewInstance(navigationView, config) {
    _$jscoverage['/navigation-view.js'].functionData[9]++;
    _$jscoverage['/navigation-view.js'].lineData[104]++;
    var children = navigationView.get('children');
    _$jscoverage['/navigation-view.js'].lineData[105]++;
    var viewId = config.viewId;
    _$jscoverage['/navigation-view.js'].lineData[106]++;
    for (var i = 0; visit9_106_1(i < children.length); i++) {
      _$jscoverage['/navigation-view.js'].lineData[107]++;
      if (visit10_107_1(children[i].constructor.xclass === config.xclass)) {
        _$jscoverage['/navigation-view.js'].lineData[108]++;
        if (visit11_108_1(viewId)) {
          _$jscoverage['/navigation-view.js'].lineData[109]++;
          if (visit12_109_1(children[i].get('viewId') === viewId)) {
            _$jscoverage['/navigation-view.js'].lineData[110]++;
            return children[i];
          }
        } else {
          _$jscoverage['/navigation-view.js'].lineData[113]++;
          return children[i];
        }
      }
    }
    _$jscoverage['/navigation-view.js'].lineData[117]++;
    return null;
  }
  _$jscoverage['/navigation-view.js'].lineData[120]++;
  function switchTo(navigationView, view, backward) {
    _$jscoverage['/navigation-view.js'].functionData[10]++;
    _$jscoverage['/navigation-view.js'].lineData[121]++;
    var loadingView = navigationView.loadingView;
    _$jscoverage['/navigation-view.js'].lineData[123]++;
    var oldView = navigationView.get('activeView');
    _$jscoverage['/navigation-view.js'].lineData[125]++;
    navigationView.fire('beforeInnerViewChange', {
  oldView: oldView, 
  newView: view, 
  backward: backward});
    _$jscoverage['/navigation-view.js'].lineData[131]++;
    if (visit13_131_1(oldView && oldView.leave)) {
      _$jscoverage['/navigation-view.js'].lineData[132]++;
      oldView.leave();
    }
    _$jscoverage['/navigation-view.js'].lineData[135]++;
    navigationView.set('activeView', view);
    _$jscoverage['/navigation-view.js'].lineData[137]++;
    if (visit14_137_1(view.enter)) {
      _$jscoverage['/navigation-view.js'].lineData[138]++;
      view.enter();
    }
    _$jscoverage['/navigation-view.js'].lineData[140]++;
    var promise = view.promise;
    _$jscoverage['/navigation-view.js'].lineData[141]++;
    if (visit15_141_1(promise)) {
      _$jscoverage['/navigation-view.js'].lineData[142]++;
      if (visit16_142_1(oldView)) {
        _$jscoverage['/navigation-view.js'].lineData[143]++;
        transition(oldView, false, backward);
        _$jscoverage['/navigation-view.js'].lineData[144]++;
        loadingView.transition(true, backward);
      } else {
        _$jscoverage['/navigation-view.js'].lineData[146]++;
        loadingView.show();
      }
      _$jscoverage['/navigation-view.js'].lineData[148]++;
      promise.then(function() {
  _$jscoverage['/navigation-view.js'].functionData[11]++;
  _$jscoverage['/navigation-view.js'].lineData[149]++;
  if (visit17_149_1(navigationView.get('activeView') === view)) {
    _$jscoverage['/navigation-view.js'].lineData[150]++;
    loadingView.hide();
    _$jscoverage['/navigation-view.js'].lineData[151]++;
    view.show();
    _$jscoverage['/navigation-view.js'].lineData[152]++;
    navigationView.fire('afterInnerViewChange', {
  newView: view, 
  oldView: oldView, 
  backward: backward});
  }
});
    } else {
      _$jscoverage['/navigation-view.js'].lineData[161]++;
      if (visit18_161_1(loadingView.get('visible'))) {
        _$jscoverage['/navigation-view.js'].lineData[162]++;
        loadingView.transition(false, backward);
        _$jscoverage['/navigation-view.js'].lineData[163]++;
        transition(view, true, backward);
      } else {
        _$jscoverage['/navigation-view.js'].lineData[165]++;
        if (visit19_165_1(oldView)) {
          _$jscoverage['/navigation-view.js'].lineData[166]++;
          transition(oldView, false, backward);
          _$jscoverage['/navigation-view.js'].lineData[167]++;
          transition(view, true, backward);
        } else {
          _$jscoverage['/navigation-view.js'].lineData[169]++;
          view.show();
        }
      }
      _$jscoverage['/navigation-view.js'].lineData[171]++;
      navigationView.fire('afterInnerViewChange', {
  newView: view, 
  oldView: oldView, 
  backward: backward});
    }
    _$jscoverage['/navigation-view.js'].lineData[177]++;
    gc(navigationView);
  }
  _$jscoverage['/navigation-view.js'].lineData[180]++;
  function gc(navigationView) {
    _$jscoverage['/navigation-view.js'].functionData[12]++;
    _$jscoverage['/navigation-view.js'].lineData[181]++;
    var children = navigationView.get('children').concat();
    _$jscoverage['/navigation-view.js'].lineData[182]++;
    var viewCacheSize = navigationView.get('viewCacheSize');
    _$jscoverage['/navigation-view.js'].lineData[183]++;
    if (visit20_183_1(children.length <= viewCacheSize)) {
      _$jscoverage['/navigation-view.js'].lineData[184]++;
      return;
    }
    _$jscoverage['/navigation-view.js'].lineData[186]++;
    var removedSize = Math.floor(viewCacheSize / 3);
    _$jscoverage['/navigation-view.js'].lineData[187]++;
    children.sort(function(a, b) {
  _$jscoverage['/navigation-view.js'].functionData[13]++;
  _$jscoverage['/navigation-view.js'].lineData[188]++;
  return a.timeStamp - b.timeStamp;
});
    _$jscoverage['/navigation-view.js'].lineData[190]++;
    for (var i = 0; visit21_190_1(i < removedSize); i++) {
      _$jscoverage['/navigation-view.js'].lineData[191]++;
      navigationView.removeChild(children[i]);
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[195]++;
  function onViewAnimEnd() {
    _$jscoverage['/navigation-view.js'].functionData[14]++;
    _$jscoverage['/navigation-view.js'].lineData[196]++;
    var view = this;
    _$jscoverage['/navigation-view.js'].lineData[197]++;
    clearAnimCss(view);
    _$jscoverage['/navigation-view.js'].lineData[198]++;
    if (visit22_198_1(view.get('navigationView').get('activeView') === view)) {
      _$jscoverage['/navigation-view.js'].lineData[199]++;
      view.show();
    } else {
      _$jscoverage['/navigation-view.js'].lineData[201]++;
      view.hide();
    }
  }
  _$jscoverage['/navigation-view.js'].lineData[205]++;
  function createView(self, config) {
    _$jscoverage['/navigation-view.js'].functionData[15]++;
    _$jscoverage['/navigation-view.js'].lineData[206]++;
    var view = getViewInstance(self, config);
    _$jscoverage['/navigation-view.js'].lineData[207]++;
    if (visit23_207_1(!view)) {
      _$jscoverage['/navigation-view.js'].lineData[208]++;
      view = self.addChild(config);
      _$jscoverage['/navigation-view.js'].lineData[209]++;
      view.$el.on(ANIMATION_END_EVENT, onViewAnimEnd, view);
    } else {
      _$jscoverage['/navigation-view.js'].lineData[211]++;
      view.set(config);
    }
    _$jscoverage['/navigation-view.js'].lineData[213]++;
    view.timeStamp = S.now();
    _$jscoverage['/navigation-view.js'].lineData[214]++;
    return view;
  }
  _$jscoverage['/navigation-view.js'].lineData[217]++;
  var NavigationViewRender = Container.getDefaultRender().extend([ContentRender]);
  _$jscoverage['/navigation-view.js'].lineData[219]++;
  return Container.extend({
  createDom: function() {
  _$jscoverage['/navigation-view.js'].functionData[16]++;
  _$jscoverage['/navigation-view.js'].lineData[221]++;
  var self = this;
  _$jscoverage['/navigation-view.js'].lineData[222]++;
  self.loadingView = new LoadingView({
  content: self.get('loadingHtml'), 
  render: self.contentEl}).render();
  _$jscoverage['/navigation-view.js'].lineData[226]++;
  self.loadingView.navigationView = self;
  _$jscoverage['/navigation-view.js'].lineData[227]++;
  self.viewStack = [];
}, 
  '_onSetLoadingHtml': function(v) {
  _$jscoverage['/navigation-view.js'].functionData[17]++;
  _$jscoverage['/navigation-view.js'].lineData[231]++;
  this.loadingView.set('content', v);
}, 
  push: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[18]++;
  _$jscoverage['/navigation-view.js'].lineData[235]++;
  var self = this, nextView, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[238]++;
  config.animation = visit24_238_1(config.animation || self.get('animation'));
  _$jscoverage['/navigation-view.js'].lineData[239]++;
  config.navigationView = self;
  _$jscoverage['/navigation-view.js'].lineData[240]++;
  nextView = createView(self, config);
  _$jscoverage['/navigation-view.js'].lineData[241]++;
  viewStack.push(config);
  _$jscoverage['/navigation-view.js'].lineData[242]++;
  switchTo(self, nextView);
}, 
  replace: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[19]++;
  _$jscoverage['/navigation-view.js'].lineData[246]++;
  var self = this, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[248]++;
  S.mix(viewStack[viewStack.length - 1], config);
  _$jscoverage['/navigation-view.js'].lineData[249]++;
  self.get('activeView').set(config);
}, 
  pop: function(config) {
  _$jscoverage['/navigation-view.js'].functionData[20]++;
  _$jscoverage['/navigation-view.js'].lineData[253]++;
  var self = this, nextView, viewStack = self.viewStack;
  _$jscoverage['/navigation-view.js'].lineData[256]++;
  if (visit25_256_1(viewStack.length > 1)) {
    _$jscoverage['/navigation-view.js'].lineData[257]++;
    viewStack.pop();
    _$jscoverage['/navigation-view.js'].lineData[258]++;
    config = viewStack[viewStack.length - 1];
    _$jscoverage['/navigation-view.js'].lineData[259]++;
    nextView = createView(self, config);
    _$jscoverage['/navigation-view.js'].lineData[260]++;
    switchTo(self, nextView, true);
  }
}}, {
  xclass: 'navigation-view', 
  ATTRS: {
  animation: {
  value: ['slide-right', 'slide-left']}, 
  loadingHtml: {}, 
  handleGestureEvents: {
  value: false}, 
  viewCacheSize: {
  value: 10}, 
  focusable: {
  value: false}, 
  allowTextSelection: {
  value: true}, 
  xrender: {
  value: NavigationViewRender}, 
  contentTpl: {
  value: ContentTpl}, 
  defaultChildCfg: {
  value: {
  handleGestureEvents: false, 
  visible: false, 
  allowTextSelection: true}}}});
});
