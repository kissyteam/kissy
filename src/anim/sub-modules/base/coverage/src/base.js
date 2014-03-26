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
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[126] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[151] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[205] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[240] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[257] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[269] = 0;
  _$jscoverage['/base.js'].lineData[270] = 0;
  _$jscoverage['/base.js'].lineData[271] = 0;
  _$jscoverage['/base.js'].lineData[272] = 0;
  _$jscoverage['/base.js'].lineData[273] = 0;
  _$jscoverage['/base.js'].lineData[275] = 0;
  _$jscoverage['/base.js'].lineData[278] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[306] = 0;
  _$jscoverage['/base.js'].lineData[307] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[311] = 0;
  _$jscoverage['/base.js'].lineData[312] = 0;
  _$jscoverage['/base.js'].lineData[315] = 0;
  _$jscoverage['/base.js'].lineData[330] = 0;
  _$jscoverage['/base.js'].lineData[334] = 0;
  _$jscoverage['/base.js'].lineData[335] = 0;
  _$jscoverage['/base.js'].lineData[338] = 0;
  _$jscoverage['/base.js'].lineData[339] = 0;
  _$jscoverage['/base.js'].lineData[340] = 0;
  _$jscoverage['/base.js'].lineData[344] = 0;
  _$jscoverage['/base.js'].lineData[353] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[359] = 0;
  _$jscoverage['/base.js'].lineData[362] = 0;
  _$jscoverage['/base.js'].lineData[363] = 0;
  _$jscoverage['/base.js'].lineData[364] = 0;
  _$jscoverage['/base.js'].lineData[367] = 0;
  _$jscoverage['/base.js'].lineData[368] = 0;
  _$jscoverage['/base.js'].lineData[370] = 0;
  _$jscoverage['/base.js'].lineData[372] = 0;
  _$jscoverage['/base.js'].lineData[375] = 0;
  _$jscoverage['/base.js'].lineData[376] = 0;
  _$jscoverage['/base.js'].lineData[377] = 0;
  _$jscoverage['/base.js'].lineData[379] = 0;
  _$jscoverage['/base.js'].lineData[380] = 0;
  _$jscoverage['/base.js'].lineData[381] = 0;
  _$jscoverage['/base.js'].lineData[382] = 0;
  _$jscoverage['/base.js'].lineData[384] = 0;
  _$jscoverage['/base.js'].lineData[387] = 0;
  _$jscoverage['/base.js'].lineData[389] = 0;
  _$jscoverage['/base.js'].lineData[390] = 0;
  _$jscoverage['/base.js'].lineData[391] = 0;
  _$jscoverage['/base.js'].lineData[394] = 0;
  _$jscoverage['/base.js'].lineData[398] = 0;
  _$jscoverage['/base.js'].lineData[405] = 0;
  _$jscoverage['/base.js'].lineData[406] = 0;
  _$jscoverage['/base.js'].lineData[407] = 0;
  _$jscoverage['/base.js'].lineData[415] = 0;
  _$jscoverage['/base.js'].lineData[417] = 0;
  _$jscoverage['/base.js'].lineData[421] = 0;
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
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['30'] = [];
  _$jscoverage['/base.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['33'] = [];
  _$jscoverage['/base.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['67'] = [];
  _$jscoverage['/base.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['71'] = [];
  _$jscoverage['/base.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['75'] = [];
  _$jscoverage['/base.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['78'] = [];
  _$jscoverage['/base.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['84'] = [];
  _$jscoverage['/base.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['90'] = [];
  _$jscoverage['/base.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'] = [];
  _$jscoverage['/base.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['115'] = [];
  _$jscoverage['/base.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'] = [];
  _$jscoverage['/base.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['155'] = [];
  _$jscoverage['/base.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['170'] = [];
  _$jscoverage['/base.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['173'] = [];
  _$jscoverage['/base.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['186'] = [];
  _$jscoverage['/base.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['186'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['187'] = [];
  _$jscoverage['/base.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['188'] = [];
  _$jscoverage['/base.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['197'] = [];
  _$jscoverage['/base.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['201'] = [];
  _$jscoverage['/base.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['202'] = [];
  _$jscoverage['/base.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['202'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['202'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['202'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['202'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['210'] = [];
  _$jscoverage['/base.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['213'] = [];
  _$jscoverage['/base.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['227'] = [];
  _$jscoverage['/base.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['233'] = [];
  _$jscoverage['/base.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['266'] = [];
  _$jscoverage['/base.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['272'] = [];
  _$jscoverage['/base.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['301'] = [];
  _$jscoverage['/base.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['306'] = [];
  _$jscoverage['/base.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['334'] = [];
  _$jscoverage['/base.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['339'] = [];
  _$jscoverage['/base.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['358'] = [];
  _$jscoverage['/base.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['362'] = [];
  _$jscoverage['/base.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['367'] = [];
  _$jscoverage['/base.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['368'] = [];
  _$jscoverage['/base.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['380'] = [];
  _$jscoverage['/base.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['387'] = [];
  _$jscoverage['/base.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['390'] = [];
  _$jscoverage['/base.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['409'] = [];
  _$jscoverage['/base.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['409'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['411'] = [];
  _$jscoverage['/base.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['411'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['413'] = [];
  _$jscoverage['/base.js'].branchData['413'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['413'][1].init(103, 15, 'queue === false');
function visit80_413_1(result) {
  _$jscoverage['/base.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['411'][2].init(155, 25, 'typeof queue === \'string\'');
function visit79_411_2(result) {
  _$jscoverage['/base.js'].branchData['411'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['411'][1].init(86, 119, 'typeof queue === \'string\' || queue === false');
function visit78_411_1(result) {
  _$jscoverage['/base.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['409'][2].init(67, 14, 'queue === null');
function visit77_409_2(result) {
  _$jscoverage['/base.js'].branchData['409'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['409'][1].init(51, 206, 'queue === null || typeof queue === \'string\' || queue === false');
function visit76_409_1(result) {
  _$jscoverage['/base.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['390'][1].init(129, 9, 'q && q[0]');
function visit75_390_1(result) {
  _$jscoverage['/base.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['387'][1].init(1011, 15, 'queue !== false');
function visit74_387_1(result) {
  _$jscoverage['/base.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['380'][1].init(829, 6, 'finish');
function visit73_380_1(result) {
  _$jscoverage['/base.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['368'][1].init(22, 15, 'queue !== false');
function visit72_368_1(result) {
  _$jscoverage['/base.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['367'][1].init(403, 37, '!self.isRunning() && !self.isPaused()');
function visit71_367_1(result) {
  _$jscoverage['/base.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['362'][1].init(255, 18, 'self.__waitTimeout');
function visit70_362_1(result) {
  _$jscoverage['/base.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['358'][1].init(149, 38, 'self.isResolved() || self.isRejected()');
function visit69_358_1(result) {
  _$jscoverage['/base.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['339'][1].init(107, 14, 'q.length === 1');
function visit68_339_1(result) {
  _$jscoverage['/base.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['334'][1].init(114, 15, 'queue === false');
function visit67_334_1(result) {
  _$jscoverage['/base.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['306'][1].init(234, 18, 'self.__waitTimeout');
function visit66_306_1(result) {
  _$jscoverage['/base.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['301'][1].init(48, 15, 'self.isPaused()');
function visit65_301_1(result) {
  _$jscoverage['/base.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['272'][1].init(263, 18, 'self.__waitTimeout');
function visit64_272_1(result) {
  _$jscoverage['/base.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['266'][1].init(48, 16, 'self.isRunning()');
function visit63_266_1(result) {
  _$jscoverage['/base.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['233'][1].init(3918, 27, 'S.isEmptyObject(_propsData)');
function visit62_233_1(result) {
  _$jscoverage['/base.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['227'][1].init(2699, 14, 'exit === false');
function visit61_227_1(result) {
  _$jscoverage['/base.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['213'][1].init(597, 14, 'val === \'hide\'');
function visit60_213_1(result) {
  _$jscoverage['/base.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['210'][1].init(460, 16, 'val === \'toggle\'');
function visit59_210_1(result) {
  _$jscoverage['/base.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['202'][5].init(58, 14, 'val === \'show\'');
function visit58_202_5(result) {
  _$jscoverage['/base.js'].branchData['202'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['202'][4].init(58, 25, 'val === \'show\' && !hidden');
function visit57_202_4(result) {
  _$jscoverage['/base.js'].branchData['202'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['202'][3].init(30, 14, 'val === \'hide\'');
function visit56_202_3(result) {
  _$jscoverage['/base.js'].branchData['202'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['202'][2].init(30, 24, 'val === \'hide\' && hidden');
function visit55_202_2(result) {
  _$jscoverage['/base.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['202'][1].init(30, 53, 'val === \'hide\' && hidden || val === \'show\' && !hidden');
function visit54_202_1(result) {
  _$jscoverage['/base.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['201'][1].init(99, 16, 'specialVals[val]');
function visit53_201_1(result) {
  _$jscoverage['/base.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['197'][1].init(1325, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit52_197_1(result) {
  _$jscoverage['/base.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['188'][1].init(30, 14, 'UA.ieMode < 10');
function visit51_188_1(result) {
  _$jscoverage['/base.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['187'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit50_187_1(result) {
  _$jscoverage['/base.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['186'][2].init(697, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit49_186_2(result) {
  _$jscoverage['/base.js'].branchData['186'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['186'][1].init(697, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit48_186_1(result) {
  _$jscoverage['/base.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['173'][1].init(177, 21, 'to.width || to.height');
function visit47_173_1(result) {
  _$jscoverage['/base.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['170'][1].init(1038, 39, 'node.nodeType === NodeType.ELEMENT_NODE');
function visit46_170_1(result) {
  _$jscoverage['/base.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['155'][1].init(22, 21, '!S.isPlainObject(val)');
function visit45_155_1(result) {
  _$jscoverage['/base.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][1].init(276, 17, 'config.delay || 0');
function visit44_147_1(result) {
  _$jscoverage['/base.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['115'][1].init(1510, 22, '!S.isPlainObject(node)');
function visit43_115_1(result) {
  _$jscoverage['/base.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][1].init(211, 6, 'easing');
function visit42_93_1(result) {
  _$jscoverage['/base.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['90'][1].init(110, 8, 'duration');
function visit41_90_1(result) {
  _$jscoverage['/base.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['84'][1].init(569, 25, 'S.isPlainObject(duration)');
function visit40_84_1(result) {
  _$jscoverage['/base.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['78'][2].init(204, 17, 'trimProp !== prop');
function visit39_78_2(result) {
  _$jscoverage['/base.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['78'][1].init(191, 30, '!trimProp || trimProp !== prop');
function visit38_78_1(result) {
  _$jscoverage['/base.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['75'][1].init(76, 8, 'trimProp');
function visit37_75_1(result) {
  _$jscoverage['/base.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['71'][1].init(60, 22, 'typeof to === \'string\'');
function visit36_71_1(result) {
  _$jscoverage['/base.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['67'][1].init(63, 9, 'node.node');
function visit35_67_1(result) {
  _$jscoverage['/base.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['33'][1].init(244, 8, 'complete');
function visit34_33_1(result) {
  _$jscoverage['/base.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['30'][1].init(119, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit33_30_1(result) {
  _$jscoverage['/base.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Dom = require('dom'), UA = require('ua'), Utils = require('./base/utils'), Q = require('./base/queue'), Promise = require('promise'), NodeType = Dom.NodeType, camelCase = S.camelCase, noop = S.noop, specialVals = {
  toggle: 1, 
  hide: 1, 
  show: 1};
  _$jscoverage['/base.js'].lineData[21]++;
  var defaultConfig = {
  duration: 1, 
  easing: 'linear'};
  _$jscoverage['/base.js'].lineData[27]++;
  function syncComplete(self) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[28]++;
    var _backupProps, complete = self.config.complete;
    _$jscoverage['/base.js'].lineData[30]++;
    if (visit33_30_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[31]++;
      Dom.css(self.node, _backupProps);
    }
    _$jscoverage['/base.js'].lineData[33]++;
    if (visit34_33_1(complete)) {
      _$jscoverage['/base.js'].lineData[34]++;
      complete.call(self);
    }
  }
  _$jscoverage['/base.js'].lineData[63]++;
  function AnimBase(node, to, duration, easing, complete) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[64]++;
    var self = this;
    _$jscoverage['/base.js'].lineData[65]++;
    var config;
    _$jscoverage['/base.js'].lineData[67]++;
    if (visit35_67_1(node.node)) {
      _$jscoverage['/base.js'].lineData[68]++;
      config = node;
    } else {
      _$jscoverage['/base.js'].lineData[71]++;
      if (visit36_71_1(typeof to === 'string')) {
        _$jscoverage['/base.js'].lineData[72]++;
        to = S.unparam(String(to), ';', ':');
        _$jscoverage['/base.js'].lineData[73]++;
        S.each(to, function(value, prop) {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[74]++;
  var trimProp = S.trim(prop);
  _$jscoverage['/base.js'].lineData[75]++;
  if (visit37_75_1(trimProp)) {
    _$jscoverage['/base.js'].lineData[76]++;
    to[trimProp] = S.trim(value);
  }
  _$jscoverage['/base.js'].lineData[78]++;
  if (visit38_78_1(!trimProp || visit39_78_2(trimProp !== prop))) {
    _$jscoverage['/base.js'].lineData[79]++;
    delete to[prop];
  }
});
      }
      _$jscoverage['/base.js'].lineData[84]++;
      if (visit40_84_1(S.isPlainObject(duration))) {
        _$jscoverage['/base.js'].lineData[85]++;
        config = S.clone(duration);
      } else {
        _$jscoverage['/base.js'].lineData[87]++;
        config = {
  complete: complete};
        _$jscoverage['/base.js'].lineData[90]++;
        if (visit41_90_1(duration)) {
          _$jscoverage['/base.js'].lineData[91]++;
          config.duration = duration;
        }
        _$jscoverage['/base.js'].lineData[93]++;
        if (visit42_93_1(easing)) {
          _$jscoverage['/base.js'].lineData[94]++;
          config.easing = easing;
        }
      }
      _$jscoverage['/base.js'].lineData[97]++;
      config.node = node;
      _$jscoverage['/base.js'].lineData[98]++;
      config.to = to;
    }
    _$jscoverage['/base.js'].lineData[101]++;
    config = S.merge(defaultConfig, config);
    _$jscoverage['/base.js'].lineData[104]++;
    AnimBase.superclass.constructor.call(self);
    _$jscoverage['/base.js'].lineData[105]++;
    Promise.Defer(self);
    _$jscoverage['/base.js'].lineData[111]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[113]++;
    node = config.node;
    _$jscoverage['/base.js'].lineData[115]++;
    if (visit43_115_1(!S.isPlainObject(node))) {
      _$jscoverage['/base.js'].lineData[116]++;
      node = Dom.get(config.node);
    }
    _$jscoverage['/base.js'].lineData[118]++;
    self.node = self.el = node;
    _$jscoverage['/base.js'].lineData[119]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[120]++;
    self._propsData = {};
    _$jscoverage['/base.js'].lineData[123]++;
    var newTo = {};
    _$jscoverage['/base.js'].lineData[124]++;
    to = config.to;
    _$jscoverage['/base.js'].lineData[125]++;
    for (var prop in to) {
      _$jscoverage['/base.js'].lineData[126]++;
      newTo[camelCase(prop)] = to[prop];
    }
    _$jscoverage['/base.js'].lineData[128]++;
    config.to = newTo;
  }
  _$jscoverage['/base.js'].lineData[131]++;
  S.extend(AnimBase, Promise, {
  prepareFx: noop, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[140]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit44_147_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[151]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[154]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[155]++;
  if (visit45_155_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[156]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[160]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[170]++;
  if (visit46_170_1(node.nodeType === NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[173]++;
    if (visit47_173_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[178]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[179]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[184]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[186]++;
      if (visit48_186_1(visit49_186_2(Dom.css(node, 'display') === 'inline') && visit50_187_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[188]++;
        if (visit51_188_1(UA.ieMode < 10)) {
          _$jscoverage['/base.js'].lineData[189]++;
          elStyle.zoom = 1;
        } else {
          _$jscoverage['/base.js'].lineData[191]++;
          elStyle.display = 'inline-block';
        }
      }
    }
    _$jscoverage['/base.js'].lineData[196]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[197]++;
    hidden = (visit52_197_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[198]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[199]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[201]++;
  if (visit53_201_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[202]++;
    if (visit54_202_1(visit55_202_2(visit56_202_3(val === 'hide') && hidden) || visit57_202_4(visit58_202_5(val === 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[204]++;
      self.stop(true);
      _$jscoverage['/base.js'].lineData[205]++;
      exit = false;
      _$jscoverage['/base.js'].lineData[206]++;
      return exit;
    }
    _$jscoverage['/base.js'].lineData[209]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[210]++;
    if (visit59_210_1(val === 'toggle')) {
      _$jscoverage['/base.js'].lineData[211]++;
      val = hidden ? 'show' : 'hide';
    }
    _$jscoverage['/base.js'].lineData[213]++;
    if (visit60_213_1(val === 'hide')) {
      _$jscoverage['/base.js'].lineData[214]++;
      _propData.value = 0;
      _$jscoverage['/base.js'].lineData[216]++;
      _backupProps.display = 'none';
    } else {
      _$jscoverage['/base.js'].lineData[218]++;
      _propData.value = Dom.css(node, prop);
      _$jscoverage['/base.js'].lineData[220]++;
      Dom.css(node, prop, 0);
      _$jscoverage['/base.js'].lineData[221]++;
      Dom.show(node);
    }
  }
  _$jscoverage['/base.js'].lineData[224]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[227]++;
    if (visit61_227_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[228]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[232]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[233]++;
  if (visit62_233_1(S.isEmptyObject(_propsData))) {
    _$jscoverage['/base.js'].lineData[234]++;
    self.__totalTime = defaultDuration * 1000;
    _$jscoverage['/base.js'].lineData[235]++;
    self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[236]++;
  self.stop(true);
}, self.__totalTime);
  } else {
    _$jscoverage['/base.js'].lineData[239]++;
    self.prepareFx();
    _$jscoverage['/base.js'].lineData[240]++;
    self.doStart();
  }
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[249]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[257]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[265]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[266]++;
  if (visit63_266_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[268]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[269]++;
    self.__totalTime -= self._runTime;
    _$jscoverage['/base.js'].lineData[270]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[271]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[272]++;
    if (visit64_272_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[273]++;
      clearTimeout(self.__waitTimeout);
    } else {
      _$jscoverage['/base.js'].lineData[275]++;
      self.doStop();
    }
  }
  _$jscoverage['/base.js'].lineData[278]++;
  return self;
}, 
  doStop: noop, 
  doStart: noop, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[300]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[301]++;
  if (visit65_301_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[303]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[304]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[305]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[306]++;
    if (visit66_306_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[307]++;
      self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[308]++;
  self.stop(true);
}, self.__totalTime);
    } else {
      _$jscoverage['/base.js'].lineData[311]++;
      self.beforeResume();
      _$jscoverage['/base.js'].lineData[312]++;
      self.doStart();
    }
  }
  _$jscoverage['/base.js'].lineData[315]++;
  return self;
}, 
  beforeResume: noop, 
  run: function() {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[330]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[334]++;
  if (visit67_334_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[335]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[338]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[339]++;
    if (visit68_339_1(q.length === 1)) {
      _$jscoverage['/base.js'].lineData[340]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[344]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[353]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[358]++;
  if (visit69_358_1(self.isResolved() || self.isRejected())) {
    _$jscoverage['/base.js'].lineData[359]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[362]++;
  if (visit70_362_1(self.__waitTimeout)) {
    _$jscoverage['/base.js'].lineData[363]++;
    clearTimeout(self.__waitTimeout);
    _$jscoverage['/base.js'].lineData[364]++;
    self.__waitTimeout = 0;
  }
  _$jscoverage['/base.js'].lineData[367]++;
  if (visit71_367_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[368]++;
    if (visit72_368_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[370]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[372]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[375]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[376]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[377]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[379]++;
  var defer = self.defer;
  _$jscoverage['/base.js'].lineData[380]++;
  if (visit73_380_1(finish)) {
    _$jscoverage['/base.js'].lineData[381]++;
    syncComplete(self);
    _$jscoverage['/base.js'].lineData[382]++;
    defer.resolve([self]);
  } else {
    _$jscoverage['/base.js'].lineData[384]++;
    defer.reject([self]);
  }
  _$jscoverage['/base.js'].lineData[387]++;
  if (visit74_387_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[389]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[390]++;
    if (visit75_390_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[391]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[394]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[398]++;
  var Statics = AnimBase.Statics = {
  isRunning: Utils.isElRunning, 
  isPaused: Utils.isElPaused, 
  stop: Utils.stopEl, 
  Q: Q};
  _$jscoverage['/base.js'].lineData[405]++;
  S.each(['pause', 'resume'], function(action) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[406]++;
  Statics[action] = function(node, queue) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[407]++;
  if (visit76_409_1(visit77_409_2(queue === null) || visit78_411_1(visit79_411_2(typeof queue === 'string') || visit80_413_1(queue === false)))) {
    _$jscoverage['/base.js'].lineData[415]++;
    return Utils.pauseOrResumeQueue(node, queue, action);
  }
  _$jscoverage['/base.js'].lineData[417]++;
  return Utils.pauseOrResumeQueue(node, undefined, action);
};
});
  _$jscoverage['/base.js'].lineData[421]++;
  return AnimBase;
});
