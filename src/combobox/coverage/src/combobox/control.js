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
if (! _$jscoverage['/combobox/control.js']) {
  _$jscoverage['/combobox/control.js'] = {};
  _$jscoverage['/combobox/control.js'].lineData = [];
  _$jscoverage['/combobox/control.js'].lineData[6] = 0;
  _$jscoverage['/combobox/control.js'].lineData[7] = 0;
  _$jscoverage['/combobox/control.js'].lineData[8] = 0;
  _$jscoverage['/combobox/control.js'].lineData[9] = 0;
  _$jscoverage['/combobox/control.js'].lineData[11] = 0;
  _$jscoverage['/combobox/control.js'].lineData[13] = 0;
  _$jscoverage['/combobox/control.js'].lineData[22] = 0;
  _$jscoverage['/combobox/control.js'].lineData[28] = 0;
  _$jscoverage['/combobox/control.js'].lineData[44] = 0;
  _$jscoverage['/combobox/control.js'].lineData[46] = 0;
  _$jscoverage['/combobox/control.js'].lineData[47] = 0;
  _$jscoverage['/combobox/control.js'].lineData[48] = 0;
  _$jscoverage['/combobox/control.js'].lineData[49] = 0;
  _$jscoverage['/combobox/control.js'].lineData[52] = 0;
  _$jscoverage['/combobox/control.js'].lineData[54] = 0;
  _$jscoverage['/combobox/control.js'].lineData[55] = 0;
  _$jscoverage['/combobox/control.js'].lineData[56] = 0;
  _$jscoverage['/combobox/control.js'].lineData[62] = 0;
  _$jscoverage['/combobox/control.js'].lineData[64] = 0;
  _$jscoverage['/combobox/control.js'].lineData[68] = 0;
  _$jscoverage['/combobox/control.js'].lineData[71] = 0;
  _$jscoverage['/combobox/control.js'].lineData[81] = 0;
  _$jscoverage['/combobox/control.js'].lineData[83] = 0;
  _$jscoverage['/combobox/control.js'].lineData[84] = 0;
  _$jscoverage['/combobox/control.js'].lineData[89] = 0;
  _$jscoverage['/combobox/control.js'].lineData[97] = 0;
  _$jscoverage['/combobox/control.js'].lineData[107] = 0;
  _$jscoverage['/combobox/control.js'].lineData[112] = 0;
  _$jscoverage['/combobox/control.js'].lineData[115] = 0;
  _$jscoverage['/combobox/control.js'].lineData[116] = 0;
  _$jscoverage['/combobox/control.js'].lineData[118] = 0;
  _$jscoverage['/combobox/control.js'].lineData[119] = 0;
  _$jscoverage['/combobox/control.js'].lineData[120] = 0;
  _$jscoverage['/combobox/control.js'].lineData[122] = 0;
  _$jscoverage['/combobox/control.js'].lineData[123] = 0;
  _$jscoverage['/combobox/control.js'].lineData[125] = 0;
  _$jscoverage['/combobox/control.js'].lineData[130] = 0;
  _$jscoverage['/combobox/control.js'].lineData[132] = 0;
  _$jscoverage['/combobox/control.js'].lineData[133] = 0;
  _$jscoverage['/combobox/control.js'].lineData[135] = 0;
  _$jscoverage['/combobox/control.js'].lineData[136] = 0;
  _$jscoverage['/combobox/control.js'].lineData[141] = 0;
  _$jscoverage['/combobox/control.js'].lineData[143] = 0;
  _$jscoverage['/combobox/control.js'].lineData[144] = 0;
  _$jscoverage['/combobox/control.js'].lineData[145] = 0;
  _$jscoverage['/combobox/control.js'].lineData[146] = 0;
  _$jscoverage['/combobox/control.js'].lineData[147] = 0;
  _$jscoverage['/combobox/control.js'].lineData[148] = 0;
  _$jscoverage['/combobox/control.js'].lineData[149] = 0;
  _$jscoverage['/combobox/control.js'].lineData[152] = 0;
  _$jscoverage['/combobox/control.js'].lineData[156] = 0;
  _$jscoverage['/combobox/control.js'].lineData[157] = 0;
  _$jscoverage['/combobox/control.js'].lineData[162] = 0;
  _$jscoverage['/combobox/control.js'].lineData[165] = 0;
  _$jscoverage['/combobox/control.js'].lineData[166] = 0;
  _$jscoverage['/combobox/control.js'].lineData[167] = 0;
  _$jscoverage['/combobox/control.js'].lineData[168] = 0;
  _$jscoverage['/combobox/control.js'].lineData[169] = 0;
  _$jscoverage['/combobox/control.js'].lineData[171] = 0;
  _$jscoverage['/combobox/control.js'].lineData[172] = 0;
  _$jscoverage['/combobox/control.js'].lineData[175] = 0;
  _$jscoverage['/combobox/control.js'].lineData[177] = 0;
  _$jscoverage['/combobox/control.js'].lineData[182] = 0;
  _$jscoverage['/combobox/control.js'].lineData[190] = 0;
  _$jscoverage['/combobox/control.js'].lineData[191] = 0;
  _$jscoverage['/combobox/control.js'].lineData[193] = 0;
  _$jscoverage['/combobox/control.js'].lineData[195] = 0;
  _$jscoverage['/combobox/control.js'].lineData[199] = 0;
  _$jscoverage['/combobox/control.js'].lineData[200] = 0;
  _$jscoverage['/combobox/control.js'].lineData[201] = 0;
  _$jscoverage['/combobox/control.js'].lineData[206] = 0;
  _$jscoverage['/combobox/control.js'].lineData[207] = 0;
  _$jscoverage['/combobox/control.js'].lineData[208] = 0;
  _$jscoverage['/combobox/control.js'].lineData[212] = 0;
  _$jscoverage['/combobox/control.js'].lineData[214] = 0;
  _$jscoverage['/combobox/control.js'].lineData[217] = 0;
  _$jscoverage['/combobox/control.js'].lineData[218] = 0;
  _$jscoverage['/combobox/control.js'].lineData[219] = 0;
  _$jscoverage['/combobox/control.js'].lineData[223] = 0;
  _$jscoverage['/combobox/control.js'].lineData[225] = 0;
  _$jscoverage['/combobox/control.js'].lineData[228] = 0;
  _$jscoverage['/combobox/control.js'].lineData[231] = 0;
  _$jscoverage['/combobox/control.js'].lineData[236] = 0;
  _$jscoverage['/combobox/control.js'].lineData[238] = 0;
  _$jscoverage['/combobox/control.js'].lineData[240] = 0;
  _$jscoverage['/combobox/control.js'].lineData[241] = 0;
  _$jscoverage['/combobox/control.js'].lineData[245] = 0;
  _$jscoverage['/combobox/control.js'].lineData[246] = 0;
  _$jscoverage['/combobox/control.js'].lineData[248] = 0;
  _$jscoverage['/combobox/control.js'].lineData[249] = 0;
  _$jscoverage['/combobox/control.js'].lineData[250] = 0;
  _$jscoverage['/combobox/control.js'].lineData[251] = 0;
  _$jscoverage['/combobox/control.js'].lineData[254] = 0;
  _$jscoverage['/combobox/control.js'].lineData[258] = 0;
  _$jscoverage['/combobox/control.js'].lineData[262] = 0;
  _$jscoverage['/combobox/control.js'].lineData[263] = 0;
  _$jscoverage['/combobox/control.js'].lineData[264] = 0;
  _$jscoverage['/combobox/control.js'].lineData[267] = 0;
  _$jscoverage['/combobox/control.js'].lineData[276] = 0;
  _$jscoverage['/combobox/control.js'].lineData[278] = 0;
  _$jscoverage['/combobox/control.js'].lineData[282] = 0;
  _$jscoverage['/combobox/control.js'].lineData[285] = 0;
  _$jscoverage['/combobox/control.js'].lineData[286] = 0;
  _$jscoverage['/combobox/control.js'].lineData[289] = 0;
  _$jscoverage['/combobox/control.js'].lineData[290] = 0;
  _$jscoverage['/combobox/control.js'].lineData[291] = 0;
  _$jscoverage['/combobox/control.js'].lineData[292] = 0;
  _$jscoverage['/combobox/control.js'].lineData[293] = 0;
  _$jscoverage['/combobox/control.js'].lineData[294] = 0;
  _$jscoverage['/combobox/control.js'].lineData[297] = 0;
  _$jscoverage['/combobox/control.js'].lineData[299] = 0;
  _$jscoverage['/combobox/control.js'].lineData[408] = 0;
  _$jscoverage['/combobox/control.js'].lineData[409] = 0;
  _$jscoverage['/combobox/control.js'].lineData[410] = 0;
  _$jscoverage['/combobox/control.js'].lineData[411] = 0;
  _$jscoverage['/combobox/control.js'].lineData[413] = 0;
  _$jscoverage['/combobox/control.js'].lineData[416] = 0;
  _$jscoverage['/combobox/control.js'].lineData[417] = 0;
  _$jscoverage['/combobox/control.js'].lineData[418] = 0;
  _$jscoverage['/combobox/control.js'].lineData[426] = 0;
  _$jscoverage['/combobox/control.js'].lineData[534] = 0;
  _$jscoverage['/combobox/control.js'].lineData[535] = 0;
  _$jscoverage['/combobox/control.js'].lineData[536] = 0;
  _$jscoverage['/combobox/control.js'].lineData[537] = 0;
  _$jscoverage['/combobox/control.js'].lineData[540] = 0;
  _$jscoverage['/combobox/control.js'].lineData[543] = 0;
  _$jscoverage['/combobox/control.js'].lineData[544] = 0;
  _$jscoverage['/combobox/control.js'].lineData[545] = 0;
  _$jscoverage['/combobox/control.js'].lineData[548] = 0;
  _$jscoverage['/combobox/control.js'].lineData[549] = 0;
  _$jscoverage['/combobox/control.js'].lineData[553] = 0;
  _$jscoverage['/combobox/control.js'].lineData[554] = 0;
  _$jscoverage['/combobox/control.js'].lineData[558] = 0;
  _$jscoverage['/combobox/control.js'].lineData[559] = 0;
  _$jscoverage['/combobox/control.js'].lineData[561] = 0;
  _$jscoverage['/combobox/control.js'].lineData[563] = 0;
  _$jscoverage['/combobox/control.js'].lineData[566] = 0;
  _$jscoverage['/combobox/control.js'].lineData[567] = 0;
  _$jscoverage['/combobox/control.js'].lineData[571] = 0;
  _$jscoverage['/combobox/control.js'].lineData[576] = 0;
  _$jscoverage['/combobox/control.js'].lineData[577] = 0;
  _$jscoverage['/combobox/control.js'].lineData[578] = 0;
  _$jscoverage['/combobox/control.js'].lineData[579] = 0;
  _$jscoverage['/combobox/control.js'].lineData[580] = 0;
  _$jscoverage['/combobox/control.js'].lineData[581] = 0;
  _$jscoverage['/combobox/control.js'].lineData[583] = 0;
  _$jscoverage['/combobox/control.js'].lineData[584] = 0;
  _$jscoverage['/combobox/control.js'].lineData[585] = 0;
  _$jscoverage['/combobox/control.js'].lineData[588] = 0;
  _$jscoverage['/combobox/control.js'].lineData[591] = 0;
  _$jscoverage['/combobox/control.js'].lineData[592] = 0;
  _$jscoverage['/combobox/control.js'].lineData[595] = 0;
  _$jscoverage['/combobox/control.js'].lineData[596] = 0;
  _$jscoverage['/combobox/control.js'].lineData[597] = 0;
  _$jscoverage['/combobox/control.js'].lineData[598] = 0;
  _$jscoverage['/combobox/control.js'].lineData[599] = 0;
  _$jscoverage['/combobox/control.js'].lineData[603] = 0;
  _$jscoverage['/combobox/control.js'].lineData[604] = 0;
  _$jscoverage['/combobox/control.js'].lineData[607] = 0;
  _$jscoverage['/combobox/control.js'].lineData[608] = 0;
  _$jscoverage['/combobox/control.js'].lineData[609] = 0;
  _$jscoverage['/combobox/control.js'].lineData[610] = 0;
  _$jscoverage['/combobox/control.js'].lineData[612] = 0;
  _$jscoverage['/combobox/control.js'].lineData[613] = 0;
  _$jscoverage['/combobox/control.js'].lineData[617] = 0;
  _$jscoverage['/combobox/control.js'].lineData[618] = 0;
  _$jscoverage['/combobox/control.js'].lineData[619] = 0;
  _$jscoverage['/combobox/control.js'].lineData[621] = 0;
  _$jscoverage['/combobox/control.js'].lineData[623] = 0;
  _$jscoverage['/combobox/control.js'].lineData[624] = 0;
  _$jscoverage['/combobox/control.js'].lineData[631] = 0;
  _$jscoverage['/combobox/control.js'].lineData[632] = 0;
  _$jscoverage['/combobox/control.js'].lineData[633] = 0;
  _$jscoverage['/combobox/control.js'].lineData[634] = 0;
  _$jscoverage['/combobox/control.js'].lineData[635] = 0;
  _$jscoverage['/combobox/control.js'].lineData[639] = 0;
  _$jscoverage['/combobox/control.js'].lineData[640] = 0;
  _$jscoverage['/combobox/control.js'].lineData[647] = 0;
  _$jscoverage['/combobox/control.js'].lineData[648] = 0;
  _$jscoverage['/combobox/control.js'].lineData[657] = 0;
  _$jscoverage['/combobox/control.js'].lineData[659] = 0;
  _$jscoverage['/combobox/control.js'].lineData[661] = 0;
  _$jscoverage['/combobox/control.js'].lineData[662] = 0;
  _$jscoverage['/combobox/control.js'].lineData[665] = 0;
  _$jscoverage['/combobox/control.js'].lineData[666] = 0;
  _$jscoverage['/combobox/control.js'].lineData[667] = 0;
  _$jscoverage['/combobox/control.js'].lineData[668] = 0;
  _$jscoverage['/combobox/control.js'].lineData[671] = 0;
  _$jscoverage['/combobox/control.js'].lineData[674] = 0;
  _$jscoverage['/combobox/control.js'].lineData[676] = 0;
  _$jscoverage['/combobox/control.js'].lineData[677] = 0;
  _$jscoverage['/combobox/control.js'].lineData[678] = 0;
  _$jscoverage['/combobox/control.js'].lineData[679] = 0;
  _$jscoverage['/combobox/control.js'].lineData[680] = 0;
  _$jscoverage['/combobox/control.js'].lineData[681] = 0;
  _$jscoverage['/combobox/control.js'].lineData[687] = 0;
  _$jscoverage['/combobox/control.js'].lineData[688] = 0;
  _$jscoverage['/combobox/control.js'].lineData[689] = 0;
  _$jscoverage['/combobox/control.js'].lineData[690] = 0;
  _$jscoverage['/combobox/control.js'].lineData[691] = 0;
  _$jscoverage['/combobox/control.js'].lineData[695] = 0;
  _$jscoverage['/combobox/control.js'].lineData[697] = 0;
  _$jscoverage['/combobox/control.js'].lineData[699] = 0;
  _$jscoverage['/combobox/control.js'].lineData[705] = 0;
}
if (! _$jscoverage['/combobox/control.js'].functionData) {
  _$jscoverage['/combobox/control.js'].functionData = [];
  _$jscoverage['/combobox/control.js'].functionData[0] = 0;
  _$jscoverage['/combobox/control.js'].functionData[1] = 0;
  _$jscoverage['/combobox/control.js'].functionData[2] = 0;
  _$jscoverage['/combobox/control.js'].functionData[3] = 0;
  _$jscoverage['/combobox/control.js'].functionData[4] = 0;
  _$jscoverage['/combobox/control.js'].functionData[5] = 0;
  _$jscoverage['/combobox/control.js'].functionData[6] = 0;
  _$jscoverage['/combobox/control.js'].functionData[7] = 0;
  _$jscoverage['/combobox/control.js'].functionData[8] = 0;
  _$jscoverage['/combobox/control.js'].functionData[9] = 0;
  _$jscoverage['/combobox/control.js'].functionData[10] = 0;
  _$jscoverage['/combobox/control.js'].functionData[11] = 0;
  _$jscoverage['/combobox/control.js'].functionData[12] = 0;
  _$jscoverage['/combobox/control.js'].functionData[13] = 0;
  _$jscoverage['/combobox/control.js'].functionData[14] = 0;
  _$jscoverage['/combobox/control.js'].functionData[15] = 0;
  _$jscoverage['/combobox/control.js'].functionData[16] = 0;
  _$jscoverage['/combobox/control.js'].functionData[17] = 0;
  _$jscoverage['/combobox/control.js'].functionData[18] = 0;
  _$jscoverage['/combobox/control.js'].functionData[19] = 0;
  _$jscoverage['/combobox/control.js'].functionData[20] = 0;
  _$jscoverage['/combobox/control.js'].functionData[21] = 0;
  _$jscoverage['/combobox/control.js'].functionData[22] = 0;
  _$jscoverage['/combobox/control.js'].functionData[23] = 0;
  _$jscoverage['/combobox/control.js'].functionData[24] = 0;
  _$jscoverage['/combobox/control.js'].functionData[25] = 0;
  _$jscoverage['/combobox/control.js'].functionData[26] = 0;
  _$jscoverage['/combobox/control.js'].functionData[27] = 0;
  _$jscoverage['/combobox/control.js'].functionData[28] = 0;
  _$jscoverage['/combobox/control.js'].functionData[29] = 0;
  _$jscoverage['/combobox/control.js'].functionData[30] = 0;
  _$jscoverage['/combobox/control.js'].functionData[31] = 0;
  _$jscoverage['/combobox/control.js'].functionData[32] = 0;
  _$jscoverage['/combobox/control.js'].functionData[33] = 0;
}
if (! _$jscoverage['/combobox/control.js'].branchData) {
  _$jscoverage['/combobox/control.js'].branchData = {};
  _$jscoverage['/combobox/control.js'].branchData['46'] = [];
  _$jscoverage['/combobox/control.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['48'] = [];
  _$jscoverage['/combobox/control.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['54'] = [];
  _$jscoverage['/combobox/control.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['115'] = [];
  _$jscoverage['/combobox/control.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['118'] = [];
  _$jscoverage['/combobox/control.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['132'] = [];
  _$jscoverage['/combobox/control.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['145'] = [];
  _$jscoverage['/combobox/control.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['147'] = [];
  _$jscoverage['/combobox/control.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['148'] = [];
  _$jscoverage['/combobox/control.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['156'] = [];
  _$jscoverage['/combobox/control.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['168'] = [];
  _$jscoverage['/combobox/control.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['168'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['168'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['169'] = [];
  _$jscoverage['/combobox/control.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['193'] = [];
  _$jscoverage['/combobox/control.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['199'] = [];
  _$jscoverage['/combobox/control.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['201'] = [];
  _$jscoverage['/combobox/control.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['201'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['201'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['202'] = [];
  _$jscoverage['/combobox/control.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['203'] = [];
  _$jscoverage['/combobox/control.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['203'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['204'] = [];
  _$jscoverage['/combobox/control.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['217'] = [];
  _$jscoverage['/combobox/control.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['219'] = [];
  _$jscoverage['/combobox/control.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['228'] = [];
  _$jscoverage['/combobox/control.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['236'] = [];
  _$jscoverage['/combobox/control.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['236'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['240'] = [];
  _$jscoverage['/combobox/control.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['246'] = [];
  _$jscoverage['/combobox/control.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['246'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['246'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['249'] = [];
  _$jscoverage['/combobox/control.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['262'] = [];
  _$jscoverage['/combobox/control.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['285'] = [];
  _$jscoverage['/combobox/control.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['290'] = [];
  _$jscoverage['/combobox/control.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['291'] = [];
  _$jscoverage['/combobox/control.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['295'] = [];
  _$jscoverage['/combobox/control.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['296'] = [];
  _$jscoverage['/combobox/control.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['408'] = [];
  _$jscoverage['/combobox/control.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['409'] = [];
  _$jscoverage['/combobox/control.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['416'] = [];
  _$jscoverage['/combobox/control.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['535'] = [];
  _$jscoverage['/combobox/control.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['536'] = [];
  _$jscoverage['/combobox/control.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['595'] = [];
  _$jscoverage['/combobox/control.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['607'] = [];
  _$jscoverage['/combobox/control.js'].branchData['607'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['618'] = [];
  _$jscoverage['/combobox/control.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['623'] = [];
  _$jscoverage['/combobox/control.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['633'] = [];
  _$jscoverage['/combobox/control.js'].branchData['633'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['665'] = [];
  _$jscoverage['/combobox/control.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['666'] = [];
  _$jscoverage['/combobox/control.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['676'] = [];
  _$jscoverage['/combobox/control.js'].branchData['676'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['677'] = [];
  _$jscoverage['/combobox/control.js'].branchData['677'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['678'] = [];
  _$jscoverage['/combobox/control.js'].branchData['678'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['687'] = [];
  _$jscoverage['/combobox/control.js'].branchData['687'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['688'] = [];
  _$jscoverage['/combobox/control.js'].branchData['688'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['689'] = [];
  _$jscoverage['/combobox/control.js'].branchData['689'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['689'][1].init(25, 28, '!children[i].get(\'disabled\')');
function visit60_689_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['689'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['688'][1].init(29, 19, 'i < children.length');
function visit59_688_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['688'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['687'][1].init(753, 46, '!matchVal && (self.get(\'autoHighlightFirst\'))');
function visit58_687_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['687'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['678'][1].init(25, 38, 'children[i].get(\'textContent\') === val');
function visit57_678_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['678'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['677'][1].init(29, 19, 'i < children.length');
function visit56_677_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['676'][1].init(314, 30, 'self.get(\'highlightMatchItem\')');
function visit55_676_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['666'][1].init(25, 15, 'i < data.length');
function visit54_666_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['665'][1].init(408, 19, 'data && data.length');
function visit53_665_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['633'][1].init(57, 1, 't');
function visit52_633_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['633'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['623'][1].init(48, 26, 'self._focusoutDismissTimer');
function visit51_623_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['618'][1].init(13, 26, 'self._focusoutDismissTimer');
function visit50_618_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['607'][1].init(146, 5, 'error');
function visit49_607_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['595'][1].init(92, 15, 'item.isMenuItem');
function visit48_595_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['536'][1].init(17, 28, '!children[i].get(\'disabled\')');
function visit47_536_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['535'][1].init(25, 19, 'i < children.length');
function visit46_535_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['416'][1].init(29, 11, 'm.isControl');
function visit45_416_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['409'][1].init(40, 23, 'v.xclass || \'popupmenu\'');
function visit44_409_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['408'][1].init(29, 12, '!v.isControl');
function visit43_408_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['296'][1].init(88, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit42_296_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['295'][1].init(46, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit41_295_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['291'][1].init(29, 24, 'self.get(\'matchElWidth\')');
function visit40_291_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['290'][1].init(116, 20, '!menu.get(\'visible\')');
function visit39_290_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['285'][1].init(134, 1, 'v');
function visit38_285_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['262'][1].init(168, 9, 'validator');
function visit37_262_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['249'][1].init(142, 15, 'v !== undefined');
function visit36_249_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['246'][3].init(2938, 22, 'keyCode === KeyCode.UP');
function visit35_246_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['246'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['246'][2].init(2910, 24, 'keyCode === KeyCode.DOWN');
function visit34_246_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['246'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['246'][1].init(2910, 50, 'keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit33_246_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['240'][1].init(212, 20, 'self.get(\'multiple\')');
function visit32_240_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['236'][2].init(2051, 23, 'keyCode === KeyCode.TAB');
function visit31_236_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['236'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['236'][1].init(2051, 42, 'keyCode === KeyCode.TAB && highlightedItem');
function visit30_236_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['228'][1].init(1622, 93, 'updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit29_228_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['219'][1].init(82, 19, 'updateInputOnDownUp');
function visit28_219_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['217'][1].init(1107, 23, 'keyCode === KeyCode.ESC');
function visit27_217_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['204'][1].init(57, 53, 'highlightedItem === getFirstEnabledItem(menuChildren)');
function visit26_204_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['203'][2].init(256, 22, 'keyCode === KeyCode.UP');
function visit25_203_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['203'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['203'][1].init(159, 111, 'keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit24_203_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['202'][1].init(55, 72, 'highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit23_202_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['201'][3].init(94, 24, 'keyCode === KeyCode.DOWN');
function visit22_201_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['201'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['201'][2].init(94, 128, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit21_201_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['201'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['201'][1].init(94, 271, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit20_201_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['199'][1].init(243, 38, 'updateInputOnDownUp && highlightedItem');
function visit19_199_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['193'][1].init(396, 19, 'menu.get(\'visible\')');
function visit18_193_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['169'][1].init(25, 21, 'self.get(\'collapsed\')');
function visit17_169_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['168'][3].init(240, 21, 'trigger[0] === target');
function visit16_168_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['168'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['168'][2].init(240, 49, 'trigger[0] === target || trigger.contains(target)');
function visit15_168_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['168'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['168'][1].init(228, 62, 'trigger && (trigger[0] === target || trigger.contains(target))');
function visit14_168_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['156'][1].init(653, 35, 'placeholderEl && !self.get(\'value\')');
function visit13_156_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['148'][2].init(58, 25, 'val === self.get(\'value\')');
function visit12_148_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['148'][1].init(33, 51, '!self.get(\'focused\') && (val === self.get(\'value\'))');
function visit11_148_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['147'][1].init(29, 5, 'error');
function visit10_147_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['145'][1].init(185, 21, 'self.get(\'invalidEl\')');
function visit9_145_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['132'][1].init(89, 21, 'self.get(\'invalidEl\')');
function visit8_132_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['118'][1].init(144, 19, 'value === undefined');
function visit7_118_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['115'][1].init(142, 20, 'e.causedByInputEvent');
function visit6_115_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['54'][1].init(369, 15, 'i < data.length');
function visit5_54_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['48'][1].init(93, 18, 'self.get(\'format\')');
function visit4_48_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['46'][1].init(93, 19, 'data && data.length');
function visit3_46_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/combobox/control.js'].functionData[0]++;
  _$jscoverage['/combobox/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/combobox/control.js'].lineData[8]++;
  var Control = require('component/control');
  _$jscoverage['/combobox/control.js'].lineData[9]++;
  var ComboBoxRender = require('./render');
  _$jscoverage['/combobox/control.js'].lineData[11]++;
  require('menu');
  _$jscoverage['/combobox/control.js'].lineData[13]++;
  var ComboBox, KeyCode = Node.KeyCode;
  _$jscoverage['/combobox/control.js'].lineData[22]++;
  ComboBox = Control.extend([], {
  initializer: function() {
  _$jscoverage['/combobox/control.js'].functionData[1]++;
  _$jscoverage['/combobox/control.js'].lineData[28]++;
  this.publish('afterRenderData', {
  bubbles: false});
}, 
  _savedValue: null, 
  'normalizeData': function(data) {
  _$jscoverage['/combobox/control.js'].functionData[2]++;
  _$jscoverage['/combobox/control.js'].lineData[44]++;
  var self = this, contents, v, i, c;
  _$jscoverage['/combobox/control.js'].lineData[46]++;
  if (visit3_46_1(data && data.length)) {
    _$jscoverage['/combobox/control.js'].lineData[47]++;
    data = data.slice(0, self.get('maxItemCount'));
    _$jscoverage['/combobox/control.js'].lineData[48]++;
    if (visit4_48_1(self.get('format'))) {
      _$jscoverage['/combobox/control.js'].lineData[49]++;
      contents = self.get('format').call(self, self.getValueForAutocomplete(), data);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[52]++;
      contents = [];
    }
    _$jscoverage['/combobox/control.js'].lineData[54]++;
    for (i = 0; visit5_54_1(i < data.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[55]++;
      v = data[i];
      _$jscoverage['/combobox/control.js'].lineData[56]++;
      c = contents[i] = S.mix({
  content: v, 
  textContent: v, 
  value: v}, contents[i]);
    }
    _$jscoverage['/combobox/control.js'].lineData[62]++;
    return contents;
  }
  _$jscoverage['/combobox/control.js'].lineData[64]++;
  return contents;
}, 
  bindUI: function() {
  _$jscoverage['/combobox/control.js'].functionData[3]++;
  _$jscoverage['/combobox/control.js'].lineData[68]++;
  var self = this, input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[71]++;
  input.on('input', onValueChange, self);
  _$jscoverage['/combobox/control.js'].lineData[81]++;
  self.on('click', onMenuItemClick, self);
  _$jscoverage['/combobox/control.js'].lineData[83]++;
  self.get('menu').onRendered(function(menu) {
  _$jscoverage['/combobox/control.js'].functionData[4]++;
  _$jscoverage['/combobox/control.js'].lineData[84]++;
  onMenuAfterRenderUI(self, menu);
});
}, 
  destructor: function() {
  _$jscoverage['/combobox/control.js'].functionData[5]++;
  _$jscoverage['/combobox/control.js'].lineData[89]++;
  this.get('menu').destroy();
}, 
  getValueForAutocomplete: function() {
  _$jscoverage['/combobox/control.js'].functionData[6]++;
  _$jscoverage['/combobox/control.js'].lineData[97]++;
  return this.get('value');
}, 
  setValueFromAutocomplete: function(value, setCfg) {
  _$jscoverage['/combobox/control.js'].functionData[7]++;
  _$jscoverage['/combobox/control.js'].lineData[107]++;
  this.set('value', value, setCfg);
}, 
  '_onSetValue': function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[8]++;
  _$jscoverage['/combobox/control.js'].lineData[112]++;
  var self = this, value;
  _$jscoverage['/combobox/control.js'].lineData[115]++;
  if (visit6_115_1(e.causedByInputEvent)) {
    _$jscoverage['/combobox/control.js'].lineData[116]++;
    value = self.getValueForAutocomplete();
    _$jscoverage['/combobox/control.js'].lineData[118]++;
    if (visit7_118_1(value === undefined)) {
      _$jscoverage['/combobox/control.js'].lineData[119]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[120]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[122]++;
    self._savedValue = value;
    _$jscoverage['/combobox/control.js'].lineData[123]++;
    self.sendRequest(value);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[125]++;
    self.get('input').val(v);
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/combobox/control.js'].functionData[9]++;
  _$jscoverage['/combobox/control.js'].lineData[130]++;
  var self = this, placeholderEl;
  _$jscoverage['/combobox/control.js'].lineData[132]++;
  if (visit8_132_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[133]++;
    setInvalid(self, false);
  }
  _$jscoverage['/combobox/control.js'].lineData[135]++;
  if ((placeholderEl = self.get('placeholderEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[136]++;
    placeholderEl.hide();
  }
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[10]++;
  _$jscoverage['/combobox/control.js'].lineData[141]++;
  var self = this, placeholderEl = self.get('placeholderEl');
  _$jscoverage['/combobox/control.js'].lineData[143]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[144]++;
  delayHide(self);
  _$jscoverage['/combobox/control.js'].lineData[145]++;
  if (visit9_145_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[146]++;
    self.validate(function(error, val) {
  _$jscoverage['/combobox/control.js'].functionData[11]++;
  _$jscoverage['/combobox/control.js'].lineData[147]++;
  if (visit10_147_1(error)) {
    _$jscoverage['/combobox/control.js'].lineData[148]++;
    if (visit11_148_1(!self.get('focused') && (visit12_148_2(val === self.get('value'))))) {
      _$jscoverage['/combobox/control.js'].lineData[149]++;
      setInvalid(self, error);
    }
  } else {
    _$jscoverage['/combobox/control.js'].lineData[152]++;
    setInvalid(self, false);
  }
});
  }
  _$jscoverage['/combobox/control.js'].lineData[156]++;
  if (visit13_156_1(placeholderEl && !self.get('value'))) {
    _$jscoverage['/combobox/control.js'].lineData[157]++;
    placeholderEl.show();
  }
}, 
  handleMouseDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[12]++;
  _$jscoverage['/combobox/control.js'].lineData[162]++;
  var self = this, target, trigger;
  _$jscoverage['/combobox/control.js'].lineData[165]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[166]++;
  target = e.target;
  _$jscoverage['/combobox/control.js'].lineData[167]++;
  trigger = self.get('trigger');
  _$jscoverage['/combobox/control.js'].lineData[168]++;
  if (visit14_168_1(trigger && (visit15_168_2(visit16_168_3(trigger[0] === target) || trigger.contains(target))))) {
    _$jscoverage['/combobox/control.js'].lineData[169]++;
    if (visit17_169_1(self.get('collapsed'))) {
      _$jscoverage['/combobox/control.js'].lineData[171]++;
      self.focus();
      _$jscoverage['/combobox/control.js'].lineData[172]++;
      self.sendRequest('');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[175]++;
      self.set('collapsed', true);
    }
    _$jscoverage['/combobox/control.js'].lineData[177]++;
    e.preventDefault();
  }
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[13]++;
  _$jscoverage['/combobox/control.js'].lineData[182]++;
  var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[190]++;
  input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[191]++;
  updateInputOnDownUp = self.get('updateInputOnDownUp');
  _$jscoverage['/combobox/control.js'].lineData[193]++;
  if (visit18_193_1(menu.get('visible'))) {
    _$jscoverage['/combobox/control.js'].lineData[195]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[199]++;
    if (visit19_199_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[200]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[201]++;
      if (visit20_201_1(visit21_201_2(visit22_201_3(keyCode === KeyCode.DOWN) && visit23_202_1(highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()))) || visit24_203_1(visit25_203_2(keyCode === KeyCode.UP) && visit26_204_1(highlightedItem === getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[206]++;
        self.setValueFromAutocomplete(self._savedValue);
        _$jscoverage['/combobox/control.js'].lineData[207]++;
        highlightedItem.set('highlighted', false);
        _$jscoverage['/combobox/control.js'].lineData[208]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[212]++;
    handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/combobox/control.js'].lineData[214]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[217]++;
    if (visit27_217_1(keyCode === KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[218]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[219]++;
      if (visit28_219_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[223]++;
        self.setValueFromAutocomplete(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[225]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[228]++;
    if (visit29_228_1(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[231]++;
      self.setValueFromAutocomplete(highlightedItem.get('textContent'));
    }
    _$jscoverage['/combobox/control.js'].lineData[236]++;
    if (visit30_236_1(visit31_236_2(keyCode === KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[238]++;
      highlightedItem.handleClickInternal(e);
      _$jscoverage['/combobox/control.js'].lineData[240]++;
      if (visit32_240_1(self.get('multiple'))) {
        _$jscoverage['/combobox/control.js'].lineData[241]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[245]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[246]++;
    if (visit33_246_1(visit34_246_2(keyCode === KeyCode.DOWN) || visit35_246_3(keyCode === KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[248]++;
      var v = self.getValueForAutocomplete();
      _$jscoverage['/combobox/control.js'].lineData[249]++;
      if (visit36_249_1(v !== undefined)) {
        _$jscoverage['/combobox/control.js'].lineData[250]++;
        self.sendRequest(v);
        _$jscoverage['/combobox/control.js'].lineData[251]++;
        return true;
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[254]++;
  return undefined;
}, 
  validate: function(callback) {
  _$jscoverage['/combobox/control.js'].functionData[14]++;
  _$jscoverage['/combobox/control.js'].lineData[258]++;
  var self = this, validator = self.get('validator'), val = self.getValueForAutocomplete();
  _$jscoverage['/combobox/control.js'].lineData[262]++;
  if (visit37_262_1(validator)) {
    _$jscoverage['/combobox/control.js'].lineData[263]++;
    validator(val, function(error) {
  _$jscoverage['/combobox/control.js'].functionData[15]++;
  _$jscoverage['/combobox/control.js'].lineData[264]++;
  callback(error, val);
});
  } else {
    _$jscoverage['/combobox/control.js'].lineData[267]++;
    callback(false, val);
  }
}, 
  sendRequest: function(value) {
  _$jscoverage['/combobox/control.js'].functionData[16]++;
  _$jscoverage['/combobox/control.js'].lineData[276]++;
  var self = this, dataSource = self.get('dataSource');
  _$jscoverage['/combobox/control.js'].lineData[278]++;
  dataSource.fetchData(value, renderData, self);
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[17]++;
  _$jscoverage['/combobox/control.js'].lineData[282]++;
  var self = this, el = self.$el, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[285]++;
  if (visit38_285_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[286]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[289]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[290]++;
    if (visit39_290_1(!menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[291]++;
      if (visit40_291_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[292]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[293]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[294]++;
        var borderWidth = (visit41_295_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit42_296_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
        _$jscoverage['/combobox/control.js'].lineData[297]++;
        menu.set('width', el[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/combobox/control.js'].lineData[299]++;
      menu.show();
    }
  }
}}, {
  ATTRS: {
  input: {}, 
  value: {
  value: '', 
  sync: 0, 
  view: 1}, 
  trigger: {}, 
  placeholder: {
  view: 1}, 
  placeholderEl: {}, 
  validator: {}, 
  invalidEl: {}, 
  allowTextSelection: {
  value: true}, 
  hasTrigger: {
  value: true, 
  view: 1}, 
  menu: {
  value: {}, 
  getter: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[18]++;
  _$jscoverage['/combobox/control.js'].lineData[408]++;
  if (visit43_408_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[409]++;
    v.xclass = visit44_409_1(v.xclass || 'popupmenu');
    _$jscoverage['/combobox/control.js'].lineData[410]++;
    v = this.createComponent(v);
    _$jscoverage['/combobox/control.js'].lineData[411]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/combobox/control.js'].lineData[413]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/combobox/control.js'].functionData[19]++;
  _$jscoverage['/combobox/control.js'].lineData[416]++;
  if (visit45_416_1(m.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[417]++;
    m.setInternal('parent', this);
    _$jscoverage['/combobox/control.js'].lineData[418]++;
    var align = {
  node: this.$el, 
  points: ['bl', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/combobox/control.js'].lineData[426]++;
    S.mix(m.get('align'), align, false);
  }
}}, 
  collapsed: {
  view: 1, 
  value: true}, 
  dataSource: {}, 
  maxItemCount: {
  value: 99999}, 
  matchElWidth: {
  value: true}, 
  format: {}, 
  updateInputOnDownUp: {
  value: true}, 
  autoHighlightFirst: {}, 
  highlightMatchItem: {
  value: true}, 
  xrender: {
  value: ComboBoxRender}}, 
  xclass: 'combobox'});
  _$jscoverage['/combobox/control.js'].lineData[534]++;
  function getFirstEnabledItem(children) {
    _$jscoverage['/combobox/control.js'].functionData[20]++;
    _$jscoverage['/combobox/control.js'].lineData[535]++;
    for (var i = 0; visit46_535_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[536]++;
      if (visit47_536_1(!children[i].get('disabled'))) {
        _$jscoverage['/combobox/control.js'].lineData[537]++;
        return children[i];
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[540]++;
    return null;
  }
  _$jscoverage['/combobox/control.js'].lineData[543]++;
  function onMenuFocusout() {
    _$jscoverage['/combobox/control.js'].functionData[21]++;
    _$jscoverage['/combobox/control.js'].lineData[544]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[545]++;
    delayHide(combobox);
  }
  _$jscoverage['/combobox/control.js'].lineData[548]++;
  function onMenuFocusin() {
    _$jscoverage['/combobox/control.js'].functionData[22]++;
    _$jscoverage['/combobox/control.js'].lineData[549]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[553]++;
    setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[23]++;
  _$jscoverage['/combobox/control.js'].lineData[554]++;
  clearDismissTimer(combobox);
}, 0);
  }
  _$jscoverage['/combobox/control.js'].lineData[558]++;
  function onMenuMouseOver() {
    _$jscoverage['/combobox/control.js'].functionData[24]++;
    _$jscoverage['/combobox/control.js'].lineData[559]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[561]++;
    combobox.focus();
    _$jscoverage['/combobox/control.js'].lineData[563]++;
    clearDismissTimer(combobox);
  }
  _$jscoverage['/combobox/control.js'].lineData[566]++;
  function onMenuMouseDown() {
    _$jscoverage['/combobox/control.js'].functionData[25]++;
    _$jscoverage['/combobox/control.js'].lineData[567]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[571]++;
    combobox.setValueFromAutocomplete(combobox.getValueForAutocomplete(), {
  force: 1});
  }
  _$jscoverage['/combobox/control.js'].lineData[576]++;
  function onMenuAfterRenderUI(self, menu) {
    _$jscoverage['/combobox/control.js'].functionData[26]++;
    _$jscoverage['/combobox/control.js'].lineData[577]++;
    var contentEl;
    _$jscoverage['/combobox/control.js'].lineData[578]++;
    var input = self.get('input');
    _$jscoverage['/combobox/control.js'].lineData[579]++;
    var el = menu.get('el');
    _$jscoverage['/combobox/control.js'].lineData[580]++;
    contentEl = menu.get('contentEl');
    _$jscoverage['/combobox/control.js'].lineData[581]++;
    input.attr('aria-owns', el.attr('id'));
    _$jscoverage['/combobox/control.js'].lineData[583]++;
    el.on('focusout', onMenuFocusout, self);
    _$jscoverage['/combobox/control.js'].lineData[584]++;
    el.on('focusin', onMenuFocusin, self);
    _$jscoverage['/combobox/control.js'].lineData[585]++;
    contentEl.on('mouseover', onMenuMouseOver, self);
    _$jscoverage['/combobox/control.js'].lineData[588]++;
    contentEl.on('mousedown', onMenuMouseDown, self);
  }
  _$jscoverage['/combobox/control.js'].lineData[591]++;
  function onMenuItemClick(e) {
    _$jscoverage['/combobox/control.js'].functionData[27]++;
    _$jscoverage['/combobox/control.js'].lineData[592]++;
    var item = e.target, self = this, textContent;
    _$jscoverage['/combobox/control.js'].lineData[595]++;
    if (visit48_595_1(item.isMenuItem)) {
      _$jscoverage['/combobox/control.js'].lineData[596]++;
      textContent = item.get('textContent');
      _$jscoverage['/combobox/control.js'].lineData[597]++;
      self.setValueFromAutocomplete(textContent);
      _$jscoverage['/combobox/control.js'].lineData[598]++;
      self._savedValue = textContent;
      _$jscoverage['/combobox/control.js'].lineData[599]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[603]++;
  function setInvalid(self, error) {
    _$jscoverage['/combobox/control.js'].functionData[28]++;
    _$jscoverage['/combobox/control.js'].lineData[604]++;
    var $el = self.$el, cls = self.view.getBaseCssClasses('invalid'), invalidEl = self.get('invalidEl');
    _$jscoverage['/combobox/control.js'].lineData[607]++;
    if (visit49_607_1(error)) {
      _$jscoverage['/combobox/control.js'].lineData[608]++;
      $el.addClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[609]++;
      invalidEl.attr('title', error);
      _$jscoverage['/combobox/control.js'].lineData[610]++;
      invalidEl.show();
    } else {
      _$jscoverage['/combobox/control.js'].lineData[612]++;
      $el.removeClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[613]++;
      invalidEl.hide();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[617]++;
  function delayHide(self) {
    _$jscoverage['/combobox/control.js'].functionData[29]++;
    _$jscoverage['/combobox/control.js'].lineData[618]++;
    if (visit50_618_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[619]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[621]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[30]++;
  _$jscoverage['/combobox/control.js'].lineData[623]++;
  if (visit51_623_1(self._focusoutDismissTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[624]++;
    self.set('collapsed', true);
  }
}, 50);
  }
  _$jscoverage['/combobox/control.js'].lineData[631]++;
  function clearDismissTimer(self) {
    _$jscoverage['/combobox/control.js'].functionData[31]++;
    _$jscoverage['/combobox/control.js'].lineData[632]++;
    var t = self._focusoutDismissTimer;
    _$jscoverage['/combobox/control.js'].lineData[633]++;
    if (visit52_633_1(t)) {
      _$jscoverage['/combobox/control.js'].lineData[634]++;
      clearTimeout(t);
      _$jscoverage['/combobox/control.js'].lineData[635]++;
      self._focusoutDismissTimer = null;
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[639]++;
  function onValueChange(e) {
    _$jscoverage['/combobox/control.js'].functionData[32]++;
    _$jscoverage['/combobox/control.js'].lineData[640]++;
    this.set('value', e.target.value, {
  data: {
  causedByInputEvent: 1}});
  }
  _$jscoverage['/combobox/control.js'].lineData[647]++;
  function renderData(data) {
    _$jscoverage['/combobox/control.js'].functionData[33]++;
    _$jscoverage['/combobox/control.js'].lineData[648]++;
    var self = this, v, children = [], val, matchVal, highlightedItem, i, menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[657]++;
    data = self.normalizeData(data);
    _$jscoverage['/combobox/control.js'].lineData[659]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[661]++;
    if ((highlightedItem = menu.get('highlightedItem'))) {
      _$jscoverage['/combobox/control.js'].lineData[662]++;
      highlightedItem.set('highlighted', false);
    }
    _$jscoverage['/combobox/control.js'].lineData[665]++;
    if (visit53_665_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[666]++;
      for (i = 0; visit54_666_1(i < data.length); i++) {
        _$jscoverage['/combobox/control.js'].lineData[667]++;
        v = data[i];
        _$jscoverage['/combobox/control.js'].lineData[668]++;
        menu.addChild(v);
      }
      _$jscoverage['/combobox/control.js'].lineData[671]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[674]++;
      val = self.getValueForAutocomplete();
      _$jscoverage['/combobox/control.js'].lineData[676]++;
      if (visit55_676_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[677]++;
        for (i = 0; visit56_677_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[678]++;
          if (visit57_678_1(children[i].get('textContent') === val)) {
            _$jscoverage['/combobox/control.js'].lineData[679]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[680]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[681]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[687]++;
      if (visit58_687_1(!matchVal && (self.get('autoHighlightFirst')))) {
        _$jscoverage['/combobox/control.js'].lineData[688]++;
        for (i = 0; visit59_688_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[689]++;
          if (visit60_689_1(!children[i].get('disabled'))) {
            _$jscoverage['/combobox/control.js'].lineData[690]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[691]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[695]++;
      self.set('collapsed', false);
      _$jscoverage['/combobox/control.js'].lineData[697]++;
      self.fire('afterRenderData');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[699]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[705]++;
  return ComboBox;
});
