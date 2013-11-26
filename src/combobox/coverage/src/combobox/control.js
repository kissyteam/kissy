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
  _$jscoverage['/combobox/control.js'].lineData[23] = 0;
  _$jscoverage['/combobox/control.js'].lineData[29] = 0;
  _$jscoverage['/combobox/control.js'].lineData[45] = 0;
  _$jscoverage['/combobox/control.js'].lineData[47] = 0;
  _$jscoverage['/combobox/control.js'].lineData[48] = 0;
  _$jscoverage['/combobox/control.js'].lineData[49] = 0;
  _$jscoverage['/combobox/control.js'].lineData[50] = 0;
  _$jscoverage['/combobox/control.js'].lineData[53] = 0;
  _$jscoverage['/combobox/control.js'].lineData[55] = 0;
  _$jscoverage['/combobox/control.js'].lineData[56] = 0;
  _$jscoverage['/combobox/control.js'].lineData[57] = 0;
  _$jscoverage['/combobox/control.js'].lineData[63] = 0;
  _$jscoverage['/combobox/control.js'].lineData[65] = 0;
  _$jscoverage['/combobox/control.js'].lineData[69] = 0;
  _$jscoverage['/combobox/control.js'].lineData[72] = 0;
  _$jscoverage['/combobox/control.js'].lineData[82] = 0;
  _$jscoverage['/combobox/control.js'].lineData[84] = 0;
  _$jscoverage['/combobox/control.js'].lineData[85] = 0;
  _$jscoverage['/combobox/control.js'].lineData[90] = 0;
  _$jscoverage['/combobox/control.js'].lineData[98] = 0;
  _$jscoverage['/combobox/control.js'].lineData[108] = 0;
  _$jscoverage['/combobox/control.js'].lineData[113] = 0;
  _$jscoverage['/combobox/control.js'].lineData[116] = 0;
  _$jscoverage['/combobox/control.js'].lineData[117] = 0;
  _$jscoverage['/combobox/control.js'].lineData[119] = 0;
  _$jscoverage['/combobox/control.js'].lineData[120] = 0;
  _$jscoverage['/combobox/control.js'].lineData[121] = 0;
  _$jscoverage['/combobox/control.js'].lineData[123] = 0;
  _$jscoverage['/combobox/control.js'].lineData[124] = 0;
  _$jscoverage['/combobox/control.js'].lineData[126] = 0;
  _$jscoverage['/combobox/control.js'].lineData[131] = 0;
  _$jscoverage['/combobox/control.js'].lineData[133] = 0;
  _$jscoverage['/combobox/control.js'].lineData[134] = 0;
  _$jscoverage['/combobox/control.js'].lineData[136] = 0;
  _$jscoverage['/combobox/control.js'].lineData[137] = 0;
  _$jscoverage['/combobox/control.js'].lineData[142] = 0;
  _$jscoverage['/combobox/control.js'].lineData[144] = 0;
  _$jscoverage['/combobox/control.js'].lineData[145] = 0;
  _$jscoverage['/combobox/control.js'].lineData[146] = 0;
  _$jscoverage['/combobox/control.js'].lineData[147] = 0;
  _$jscoverage['/combobox/control.js'].lineData[148] = 0;
  _$jscoverage['/combobox/control.js'].lineData[149] = 0;
  _$jscoverage['/combobox/control.js'].lineData[150] = 0;
  _$jscoverage['/combobox/control.js'].lineData[153] = 0;
  _$jscoverage['/combobox/control.js'].lineData[157] = 0;
  _$jscoverage['/combobox/control.js'].lineData[158] = 0;
  _$jscoverage['/combobox/control.js'].lineData[163] = 0;
  _$jscoverage['/combobox/control.js'].lineData[166] = 0;
  _$jscoverage['/combobox/control.js'].lineData[167] = 0;
  _$jscoverage['/combobox/control.js'].lineData[168] = 0;
  _$jscoverage['/combobox/control.js'].lineData[169] = 0;
  _$jscoverage['/combobox/control.js'].lineData[170] = 0;
  _$jscoverage['/combobox/control.js'].lineData[172] = 0;
  _$jscoverage['/combobox/control.js'].lineData[173] = 0;
  _$jscoverage['/combobox/control.js'].lineData[176] = 0;
  _$jscoverage['/combobox/control.js'].lineData[178] = 0;
  _$jscoverage['/combobox/control.js'].lineData[183] = 0;
  _$jscoverage['/combobox/control.js'].lineData[191] = 0;
  _$jscoverage['/combobox/control.js'].lineData[192] = 0;
  _$jscoverage['/combobox/control.js'].lineData[194] = 0;
  _$jscoverage['/combobox/control.js'].lineData[196] = 0;
  _$jscoverage['/combobox/control.js'].lineData[200] = 0;
  _$jscoverage['/combobox/control.js'].lineData[201] = 0;
  _$jscoverage['/combobox/control.js'].lineData[202] = 0;
  _$jscoverage['/combobox/control.js'].lineData[208] = 0;
  _$jscoverage['/combobox/control.js'].lineData[209] = 0;
  _$jscoverage['/combobox/control.js'].lineData[210] = 0;
  _$jscoverage['/combobox/control.js'].lineData[214] = 0;
  _$jscoverage['/combobox/control.js'].lineData[216] = 0;
  _$jscoverage['/combobox/control.js'].lineData[219] = 0;
  _$jscoverage['/combobox/control.js'].lineData[220] = 0;
  _$jscoverage['/combobox/control.js'].lineData[221] = 0;
  _$jscoverage['/combobox/control.js'].lineData[225] = 0;
  _$jscoverage['/combobox/control.js'].lineData[227] = 0;
  _$jscoverage['/combobox/control.js'].lineData[230] = 0;
  _$jscoverage['/combobox/control.js'].lineData[233] = 0;
  _$jscoverage['/combobox/control.js'].lineData[238] = 0;
  _$jscoverage['/combobox/control.js'].lineData[240] = 0;
  _$jscoverage['/combobox/control.js'].lineData[242] = 0;
  _$jscoverage['/combobox/control.js'].lineData[243] = 0;
  _$jscoverage['/combobox/control.js'].lineData[247] = 0;
  _$jscoverage['/combobox/control.js'].lineData[248] = 0;
  _$jscoverage['/combobox/control.js'].lineData[250] = 0;
  _$jscoverage['/combobox/control.js'].lineData[251] = 0;
  _$jscoverage['/combobox/control.js'].lineData[252] = 0;
  _$jscoverage['/combobox/control.js'].lineData[253] = 0;
  _$jscoverage['/combobox/control.js'].lineData[256] = 0;
  _$jscoverage['/combobox/control.js'].lineData[260] = 0;
  _$jscoverage['/combobox/control.js'].lineData[264] = 0;
  _$jscoverage['/combobox/control.js'].lineData[265] = 0;
  _$jscoverage['/combobox/control.js'].lineData[266] = 0;
  _$jscoverage['/combobox/control.js'].lineData[269] = 0;
  _$jscoverage['/combobox/control.js'].lineData[278] = 0;
  _$jscoverage['/combobox/control.js'].lineData[280] = 0;
  _$jscoverage['/combobox/control.js'].lineData[284] = 0;
  _$jscoverage['/combobox/control.js'].lineData[287] = 0;
  _$jscoverage['/combobox/control.js'].lineData[288] = 0;
  _$jscoverage['/combobox/control.js'].lineData[291] = 0;
  _$jscoverage['/combobox/control.js'].lineData[292] = 0;
  _$jscoverage['/combobox/control.js'].lineData[293] = 0;
  _$jscoverage['/combobox/control.js'].lineData[294] = 0;
  _$jscoverage['/combobox/control.js'].lineData[295] = 0;
  _$jscoverage['/combobox/control.js'].lineData[296] = 0;
  _$jscoverage['/combobox/control.js'].lineData[299] = 0;
  _$jscoverage['/combobox/control.js'].lineData[301] = 0;
  _$jscoverage['/combobox/control.js'].lineData[410] = 0;
  _$jscoverage['/combobox/control.js'].lineData[411] = 0;
  _$jscoverage['/combobox/control.js'].lineData[412] = 0;
  _$jscoverage['/combobox/control.js'].lineData[413] = 0;
  _$jscoverage['/combobox/control.js'].lineData[415] = 0;
  _$jscoverage['/combobox/control.js'].lineData[418] = 0;
  _$jscoverage['/combobox/control.js'].lineData[419] = 0;
  _$jscoverage['/combobox/control.js'].lineData[420] = 0;
  _$jscoverage['/combobox/control.js'].lineData[428] = 0;
  _$jscoverage['/combobox/control.js'].lineData[536] = 0;
  _$jscoverage['/combobox/control.js'].lineData[537] = 0;
  _$jscoverage['/combobox/control.js'].lineData[538] = 0;
  _$jscoverage['/combobox/control.js'].lineData[539] = 0;
  _$jscoverage['/combobox/control.js'].lineData[542] = 0;
  _$jscoverage['/combobox/control.js'].lineData[545] = 0;
  _$jscoverage['/combobox/control.js'].lineData[546] = 0;
  _$jscoverage['/combobox/control.js'].lineData[547] = 0;
  _$jscoverage['/combobox/control.js'].lineData[550] = 0;
  _$jscoverage['/combobox/control.js'].lineData[551] = 0;
  _$jscoverage['/combobox/control.js'].lineData[555] = 0;
  _$jscoverage['/combobox/control.js'].lineData[556] = 0;
  _$jscoverage['/combobox/control.js'].lineData[560] = 0;
  _$jscoverage['/combobox/control.js'].lineData[561] = 0;
  _$jscoverage['/combobox/control.js'].lineData[563] = 0;
  _$jscoverage['/combobox/control.js'].lineData[565] = 0;
  _$jscoverage['/combobox/control.js'].lineData[568] = 0;
  _$jscoverage['/combobox/control.js'].lineData[569] = 0;
  _$jscoverage['/combobox/control.js'].lineData[573] = 0;
  _$jscoverage['/combobox/control.js'].lineData[578] = 0;
  _$jscoverage['/combobox/control.js'].lineData[579] = 0;
  _$jscoverage['/combobox/control.js'].lineData[580] = 0;
  _$jscoverage['/combobox/control.js'].lineData[581] = 0;
  _$jscoverage['/combobox/control.js'].lineData[582] = 0;
  _$jscoverage['/combobox/control.js'].lineData[583] = 0;
  _$jscoverage['/combobox/control.js'].lineData[585] = 0;
  _$jscoverage['/combobox/control.js'].lineData[586] = 0;
  _$jscoverage['/combobox/control.js'].lineData[587] = 0;
  _$jscoverage['/combobox/control.js'].lineData[590] = 0;
  _$jscoverage['/combobox/control.js'].lineData[593] = 0;
  _$jscoverage['/combobox/control.js'].lineData[594] = 0;
  _$jscoverage['/combobox/control.js'].lineData[597] = 0;
  _$jscoverage['/combobox/control.js'].lineData[598] = 0;
  _$jscoverage['/combobox/control.js'].lineData[599] = 0;
  _$jscoverage['/combobox/control.js'].lineData[600] = 0;
  _$jscoverage['/combobox/control.js'].lineData[601] = 0;
  _$jscoverage['/combobox/control.js'].lineData[605] = 0;
  _$jscoverage['/combobox/control.js'].lineData[606] = 0;
  _$jscoverage['/combobox/control.js'].lineData[609] = 0;
  _$jscoverage['/combobox/control.js'].lineData[610] = 0;
  _$jscoverage['/combobox/control.js'].lineData[611] = 0;
  _$jscoverage['/combobox/control.js'].lineData[612] = 0;
  _$jscoverage['/combobox/control.js'].lineData[614] = 0;
  _$jscoverage['/combobox/control.js'].lineData[615] = 0;
  _$jscoverage['/combobox/control.js'].lineData[619] = 0;
  _$jscoverage['/combobox/control.js'].lineData[620] = 0;
  _$jscoverage['/combobox/control.js'].lineData[621] = 0;
  _$jscoverage['/combobox/control.js'].lineData[623] = 0;
  _$jscoverage['/combobox/control.js'].lineData[625] = 0;
  _$jscoverage['/combobox/control.js'].lineData[626] = 0;
  _$jscoverage['/combobox/control.js'].lineData[633] = 0;
  _$jscoverage['/combobox/control.js'].lineData[634] = 0;
  _$jscoverage['/combobox/control.js'].lineData[635] = 0;
  _$jscoverage['/combobox/control.js'].lineData[636] = 0;
  _$jscoverage['/combobox/control.js'].lineData[637] = 0;
  _$jscoverage['/combobox/control.js'].lineData[641] = 0;
  _$jscoverage['/combobox/control.js'].lineData[642] = 0;
  _$jscoverage['/combobox/control.js'].lineData[649] = 0;
  _$jscoverage['/combobox/control.js'].lineData[650] = 0;
  _$jscoverage['/combobox/control.js'].lineData[659] = 0;
  _$jscoverage['/combobox/control.js'].lineData[661] = 0;
  _$jscoverage['/combobox/control.js'].lineData[663] = 0;
  _$jscoverage['/combobox/control.js'].lineData[664] = 0;
  _$jscoverage['/combobox/control.js'].lineData[667] = 0;
  _$jscoverage['/combobox/control.js'].lineData[668] = 0;
  _$jscoverage['/combobox/control.js'].lineData[669] = 0;
  _$jscoverage['/combobox/control.js'].lineData[670] = 0;
  _$jscoverage['/combobox/control.js'].lineData[673] = 0;
  _$jscoverage['/combobox/control.js'].lineData[676] = 0;
  _$jscoverage['/combobox/control.js'].lineData[678] = 0;
  _$jscoverage['/combobox/control.js'].lineData[679] = 0;
  _$jscoverage['/combobox/control.js'].lineData[680] = 0;
  _$jscoverage['/combobox/control.js'].lineData[681] = 0;
  _$jscoverage['/combobox/control.js'].lineData[682] = 0;
  _$jscoverage['/combobox/control.js'].lineData[683] = 0;
  _$jscoverage['/combobox/control.js'].lineData[689] = 0;
  _$jscoverage['/combobox/control.js'].lineData[690] = 0;
  _$jscoverage['/combobox/control.js'].lineData[691] = 0;
  _$jscoverage['/combobox/control.js'].lineData[692] = 0;
  _$jscoverage['/combobox/control.js'].lineData[693] = 0;
  _$jscoverage['/combobox/control.js'].lineData[697] = 0;
  _$jscoverage['/combobox/control.js'].lineData[699] = 0;
  _$jscoverage['/combobox/control.js'].lineData[701] = 0;
  _$jscoverage['/combobox/control.js'].lineData[707] = 0;
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
  _$jscoverage['/combobox/control.js'].branchData['47'] = [];
  _$jscoverage['/combobox/control.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['49'] = [];
  _$jscoverage['/combobox/control.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['55'] = [];
  _$jscoverage['/combobox/control.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['116'] = [];
  _$jscoverage['/combobox/control.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['119'] = [];
  _$jscoverage['/combobox/control.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['133'] = [];
  _$jscoverage['/combobox/control.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['136'] = [];
  _$jscoverage['/combobox/control.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['146'] = [];
  _$jscoverage['/combobox/control.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['148'] = [];
  _$jscoverage['/combobox/control.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['149'] = [];
  _$jscoverage['/combobox/control.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['157'] = [];
  _$jscoverage['/combobox/control.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['169'] = [];
  _$jscoverage['/combobox/control.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['169'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['169'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['170'] = [];
  _$jscoverage['/combobox/control.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['194'] = [];
  _$jscoverage['/combobox/control.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['200'] = [];
  _$jscoverage['/combobox/control.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['202'] = [];
  _$jscoverage['/combobox/control.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['202'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['202'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['203'] = [];
  _$jscoverage['/combobox/control.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['205'] = [];
  _$jscoverage['/combobox/control.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['205'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['206'] = [];
  _$jscoverage['/combobox/control.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['219'] = [];
  _$jscoverage['/combobox/control.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['221'] = [];
  _$jscoverage['/combobox/control.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['230'] = [];
  _$jscoverage['/combobox/control.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['238'] = [];
  _$jscoverage['/combobox/control.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['238'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['242'] = [];
  _$jscoverage['/combobox/control.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['248'] = [];
  _$jscoverage['/combobox/control.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['248'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['248'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['251'] = [];
  _$jscoverage['/combobox/control.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['264'] = [];
  _$jscoverage['/combobox/control.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['287'] = [];
  _$jscoverage['/combobox/control.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['292'] = [];
  _$jscoverage['/combobox/control.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['293'] = [];
  _$jscoverage['/combobox/control.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['297'] = [];
  _$jscoverage['/combobox/control.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['298'] = [];
  _$jscoverage['/combobox/control.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['410'] = [];
  _$jscoverage['/combobox/control.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['411'] = [];
  _$jscoverage['/combobox/control.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['418'] = [];
  _$jscoverage['/combobox/control.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['537'] = [];
  _$jscoverage['/combobox/control.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['538'] = [];
  _$jscoverage['/combobox/control.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['597'] = [];
  _$jscoverage['/combobox/control.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['609'] = [];
  _$jscoverage['/combobox/control.js'].branchData['609'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['620'] = [];
  _$jscoverage['/combobox/control.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['625'] = [];
  _$jscoverage['/combobox/control.js'].branchData['625'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['635'] = [];
  _$jscoverage['/combobox/control.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['663'] = [];
  _$jscoverage['/combobox/control.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['667'] = [];
  _$jscoverage['/combobox/control.js'].branchData['667'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['668'] = [];
  _$jscoverage['/combobox/control.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['678'] = [];
  _$jscoverage['/combobox/control.js'].branchData['678'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['679'] = [];
  _$jscoverage['/combobox/control.js'].branchData['679'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['680'] = [];
  _$jscoverage['/combobox/control.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['689'] = [];
  _$jscoverage['/combobox/control.js'].branchData['689'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['690'] = [];
  _$jscoverage['/combobox/control.js'].branchData['690'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['691'] = [];
  _$jscoverage['/combobox/control.js'].branchData['691'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['691'][1].init(25, 28, '!children[i].get("disabled")');
function visit62_691_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['691'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['690'][1].init(29, 19, 'i < children.length');
function visit61_690_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['690'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['689'][1].init(755, 43, '!matchVal && self.get("autoHighlightFirst")');
function visit60_689_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['689'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['680'][1].init(25, 37, 'children[i].get("textContent") == val');
function visit59_680_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['679'][1].init(29, 19, 'i < children.length');
function visit58_679_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['679'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['678'][1].init(317, 30, 'self.get(\'highlightMatchItem\')');
function visit57_678_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['678'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['668'][1].init(25, 15, 'i < data.length');
function visit56_668_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['667'][1].init(409, 19, 'data && data.length');
function visit55_667_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['667'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['663'][1].init(282, 45, 'highlightedItem = menu.get(\'highlightedItem\')');
function visit54_663_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['635'][1].init(28, 30, 't = self._focusoutDismissTimer');
function visit53_635_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['625'][1].init(48, 26, 'self._focusoutDismissTimer');
function visit52_625_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['625'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['620'][1].init(13, 26, 'self._focusoutDismissTimer');
function visit51_620_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['609'][1].init(146, 5, 'error');
function visit50_609_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['609'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['597'][1].init(92, 15, 'item.isMenuItem');
function visit49_597_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['538'][1].init(17, 28, '!children[i].get(\'disabled\')');
function visit48_538_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['537'][1].init(25, 19, 'i < children.length');
function visit47_537_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['418'][1].init(29, 11, 'm.isControl');
function visit46_418_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['411'][1].init(40, 23, 'v.xclass || \'popupmenu\'');
function visit45_411_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['410'][1].init(29, 12, '!v.isControl');
function visit44_410_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['298'][1].init(84, 45, 'parseInt(menuEl.css(\'borderRightWidth\')) || 0');
function visit43_298_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['297'][1].init(46, 44, 'parseInt(menuEl.css(\'borderLeftWidth\')) || 0');
function visit42_297_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['293'][1].init(29, 24, 'self.get("matchElWidth")');
function visit41_293_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['292'][1].init(116, 20, '!menu.get("visible")');
function visit40_292_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['287'][1].init(134, 1, 'v');
function visit39_287_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['264'][1].init(168, 9, 'validator');
function visit38_264_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['251'][1].init(142, 15, 'v !== undefined');
function visit37_251_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['248'][3].init(2959, 21, 'keyCode == KeyCode.UP');
function visit36_248_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['248'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['248'][2].init(2932, 23, 'keyCode == KeyCode.DOWN');
function visit35_248_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['248'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['248'][1].init(2932, 48, 'keyCode == KeyCode.DOWN || keyCode == KeyCode.UP');
function visit34_248_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['242'][1].init(212, 20, 'self.get("multiple")');
function visit33_242_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['238'][2].init(2074, 22, 'keyCode == KeyCode.TAB');
function visit32_238_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['238'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['238'][1].init(2074, 41, 'keyCode == KeyCode.TAB && highlightedItem');
function visit31_238_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['230'][1].init(1645, 93, 'updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit30_230_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['221'][1].init(82, 19, 'updateInputOnDownUp');
function visit29_221_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['219'][1].init(1131, 22, 'keyCode == KeyCode.ESC');
function visit28_219_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['206'][1].init(56, 52, 'highlightedItem == getFirstEnabledItem(menuChildren)');
function visit27_206_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['205'][2].init(282, 21, 'keyCode == KeyCode.UP');
function visit26_205_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['205'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['205'][1].init(185, 109, 'keyCode == KeyCode.UP && highlightedItem == getFirstEnabledItem(menuChildren)');
function visit25_205_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['203'][1].init(54, 71, 'highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse())');
function visit24_203_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['202'][3].init(94, 23, 'keyCode == KeyCode.DOWN');
function visit23_202_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['202'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['202'][2].init(94, 126, 'keyCode == KeyCode.DOWN && highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse())');
function visit22_202_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['202'][1].init(94, 295, 'keyCode == KeyCode.DOWN && highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode == KeyCode.UP && highlightedItem == getFirstEnabledItem(menuChildren)');
function visit21_202_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['200'][1].init(243, 38, 'updateInputOnDownUp && highlightedItem');
function visit20_200_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['194'][1].init(396, 19, 'menu.get("visible")');
function visit19_194_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['170'][1].init(25, 21, 'self.get(\'collapsed\')');
function visit18_170_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['169'][3].init(240, 20, 'trigger[0] == target');
function visit17_169_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['169'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['169'][2].init(240, 48, 'trigger[0] == target || trigger.contains(target)');
function visit16_169_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['169'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['169'][1].init(228, 61, 'trigger && (trigger[0] == target || trigger.contains(target))');
function visit15_169_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['157'][1].init(650, 35, 'placeholderEl && !self.get(\'value\')');
function visit14_157_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['149'][2].init(57, 24, 'val == self.get(\'value\')');
function visit13_149_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['149'][1].init(33, 48, '!self.get("focused") && val == self.get(\'value\')');
function visit12_149_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['148'][1].init(29, 5, 'error');
function visit11_148_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['146'][1].init(185, 21, 'self.get(\'invalidEl\')');
function visit10_146_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['136'][1].init(197, 41, 'placeholderEl = self.get("placeholderEl")');
function visit9_136_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['133'][1].init(89, 21, 'self.get(\'invalidEl\')');
function visit8_133_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['119'][1].init(147, 19, 'value === undefined');
function visit7_119_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['116'][1].init(142, 15, 'e.causedByTimer');
function visit6_116_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['55'][1].init(369, 15, 'i < data.length');
function visit5_55_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['49'][1].init(93, 18, 'self.get("format")');
function visit4_49_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['47'][1].init(93, 19, 'data && data.length');
function visit3_47_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['47'][1].ranCondition(result);
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
  var ComboBox, undefined = undefined, KeyCode = Node.KeyCode;
  _$jscoverage['/combobox/control.js'].lineData[23]++;
  ComboBox = Control.extend([], {
  initializer: function() {
  _$jscoverage['/combobox/control.js'].functionData[1]++;
  _$jscoverage['/combobox/control.js'].lineData[29]++;
  this.publish('afterRenderData', {
  bubbles: false});
}, 
  _savedValue: null, 
  'normalizeData': function(data) {
  _$jscoverage['/combobox/control.js'].functionData[2]++;
  _$jscoverage['/combobox/control.js'].lineData[45]++;
  var self = this, contents, v, i, c;
  _$jscoverage['/combobox/control.js'].lineData[47]++;
  if (visit3_47_1(data && data.length)) {
    _$jscoverage['/combobox/control.js'].lineData[48]++;
    data = data.slice(0, self.get("maxItemCount"));
    _$jscoverage['/combobox/control.js'].lineData[49]++;
    if (visit4_49_1(self.get("format"))) {
      _$jscoverage['/combobox/control.js'].lineData[50]++;
      contents = self.get("format").call(self, self.getValueForAutocomplete(), data);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[53]++;
      contents = [];
    }
    _$jscoverage['/combobox/control.js'].lineData[55]++;
    for (i = 0; visit5_55_1(i < data.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[56]++;
      v = data[i];
      _$jscoverage['/combobox/control.js'].lineData[57]++;
      c = contents[i] = S.mix({
  content: v, 
  textContent: v, 
  value: v}, contents[i]);
    }
    _$jscoverage['/combobox/control.js'].lineData[63]++;
    return contents;
  }
  _$jscoverage['/combobox/control.js'].lineData[65]++;
  return contents;
}, 
  bindUI: function() {
  _$jscoverage['/combobox/control.js'].functionData[3]++;
  _$jscoverage['/combobox/control.js'].lineData[69]++;
  var self = this, input = self.get("input");
  _$jscoverage['/combobox/control.js'].lineData[72]++;
  input.on("valuechange", onValueChange, self);
  _$jscoverage['/combobox/control.js'].lineData[82]++;
  self.on('click', onMenuItemClick, self);
  _$jscoverage['/combobox/control.js'].lineData[84]++;
  self.get('menu').onRendered(function(menu) {
  _$jscoverage['/combobox/control.js'].functionData[4]++;
  _$jscoverage['/combobox/control.js'].lineData[85]++;
  onMenuAfterRenderUI(self, menu);
});
}, 
  destructor: function() {
  _$jscoverage['/combobox/control.js'].functionData[5]++;
  _$jscoverage['/combobox/control.js'].lineData[90]++;
  this.get('menu').destroy();
}, 
  getValueForAutocomplete: function() {
  _$jscoverage['/combobox/control.js'].functionData[6]++;
  _$jscoverage['/combobox/control.js'].lineData[98]++;
  return this.get('value');
}, 
  setValueFromAutocomplete: function(value, setCfg) {
  _$jscoverage['/combobox/control.js'].functionData[7]++;
  _$jscoverage['/combobox/control.js'].lineData[108]++;
  this.set('value', value, setCfg);
}, 
  '_onSetValue': function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[8]++;
  _$jscoverage['/combobox/control.js'].lineData[113]++;
  var self = this, value;
  _$jscoverage['/combobox/control.js'].lineData[116]++;
  if (visit6_116_1(e.causedByTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[117]++;
    value = self['getValueForAutocomplete']();
    _$jscoverage['/combobox/control.js'].lineData[119]++;
    if (visit7_119_1(value === undefined)) {
      _$jscoverage['/combobox/control.js'].lineData[120]++;
      self.set("collapsed", true);
      _$jscoverage['/combobox/control.js'].lineData[121]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[123]++;
    self._savedValue = value;
    _$jscoverage['/combobox/control.js'].lineData[124]++;
    self.sendRequest(value);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[126]++;
    self.get('input').val(v);
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/combobox/control.js'].functionData[9]++;
  _$jscoverage['/combobox/control.js'].lineData[131]++;
  var self = this, placeholderEl;
  _$jscoverage['/combobox/control.js'].lineData[133]++;
  if (visit8_133_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[134]++;
    setInvalid(self, false);
  }
  _$jscoverage['/combobox/control.js'].lineData[136]++;
  if (visit9_136_1(placeholderEl = self.get("placeholderEl"))) {
    _$jscoverage['/combobox/control.js'].lineData[137]++;
    placeholderEl.hide();
  }
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[10]++;
  _$jscoverage['/combobox/control.js'].lineData[142]++;
  var self = this, placeholderEl = self.get("placeholderEl");
  _$jscoverage['/combobox/control.js'].lineData[144]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[145]++;
  delayHide(self);
  _$jscoverage['/combobox/control.js'].lineData[146]++;
  if (visit10_146_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[147]++;
    self.validate(function(error, val) {
  _$jscoverage['/combobox/control.js'].functionData[11]++;
  _$jscoverage['/combobox/control.js'].lineData[148]++;
  if (visit11_148_1(error)) {
    _$jscoverage['/combobox/control.js'].lineData[149]++;
    if (visit12_149_1(!self.get("focused") && visit13_149_2(val == self.get('value')))) {
      _$jscoverage['/combobox/control.js'].lineData[150]++;
      setInvalid(self, error);
    }
  } else {
    _$jscoverage['/combobox/control.js'].lineData[153]++;
    setInvalid(self, false);
  }
});
  }
  _$jscoverage['/combobox/control.js'].lineData[157]++;
  if (visit14_157_1(placeholderEl && !self.get('value'))) {
    _$jscoverage['/combobox/control.js'].lineData[158]++;
    placeholderEl.show();
  }
}, 
  handleMouseDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[12]++;
  _$jscoverage['/combobox/control.js'].lineData[163]++;
  var self = this, target, trigger;
  _$jscoverage['/combobox/control.js'].lineData[166]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[167]++;
  target = e.target;
  _$jscoverage['/combobox/control.js'].lineData[168]++;
  trigger = self.get("trigger");
  _$jscoverage['/combobox/control.js'].lineData[169]++;
  if (visit15_169_1(trigger && (visit16_169_2(visit17_169_3(trigger[0] == target) || trigger.contains(target))))) {
    _$jscoverage['/combobox/control.js'].lineData[170]++;
    if (visit18_170_1(self.get('collapsed'))) {
      _$jscoverage['/combobox/control.js'].lineData[172]++;
      self.focus();
      _$jscoverage['/combobox/control.js'].lineData[173]++;
      self.sendRequest('');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[176]++;
      self.set('collapsed', true);
    }
    _$jscoverage['/combobox/control.js'].lineData[178]++;
    e.preventDefault();
  }
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[13]++;
  _$jscoverage['/combobox/control.js'].lineData[183]++;
  var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get("menu");
  _$jscoverage['/combobox/control.js'].lineData[191]++;
  input = self.get("input");
  _$jscoverage['/combobox/control.js'].lineData[192]++;
  updateInputOnDownUp = self.get("updateInputOnDownUp");
  _$jscoverage['/combobox/control.js'].lineData[194]++;
  if (visit19_194_1(menu.get("visible"))) {
    _$jscoverage['/combobox/control.js'].lineData[196]++;
    highlightedItem = menu.get("highlightedItem");
    _$jscoverage['/combobox/control.js'].lineData[200]++;
    if (visit20_200_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[201]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[202]++;
      if (visit21_202_1(visit22_202_2(visit23_202_3(keyCode == KeyCode.DOWN) && visit24_203_1(highlightedItem == getFirstEnabledItem(menuChildren.concat().reverse()))) || visit25_205_1(visit26_205_2(keyCode == KeyCode.UP) && visit27_206_1(highlightedItem == getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[208]++;
        self.setValueFromAutocomplete(self._savedValue);
        _$jscoverage['/combobox/control.js'].lineData[209]++;
        highlightedItem.set('highlighted', false);
        _$jscoverage['/combobox/control.js'].lineData[210]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[214]++;
    handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/combobox/control.js'].lineData[216]++;
    highlightedItem = menu.get("highlightedItem");
    _$jscoverage['/combobox/control.js'].lineData[219]++;
    if (visit28_219_1(keyCode == KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[220]++;
      self.set("collapsed", true);
      _$jscoverage['/combobox/control.js'].lineData[221]++;
      if (visit29_221_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[225]++;
        self.setValueFromAutocomplete(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[227]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[230]++;
    if (visit30_230_1(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[233]++;
      self.setValueFromAutocomplete(highlightedItem.get("textContent"));
    }
    _$jscoverage['/combobox/control.js'].lineData[238]++;
    if (visit31_238_1(visit32_238_2(keyCode == KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[240]++;
      highlightedItem.handleClickInternal(e);
      _$jscoverage['/combobox/control.js'].lineData[242]++;
      if (visit33_242_1(self.get("multiple"))) {
        _$jscoverage['/combobox/control.js'].lineData[243]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[247]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[248]++;
    if (visit34_248_1(visit35_248_2(keyCode == KeyCode.DOWN) || visit36_248_3(keyCode == KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[250]++;
      var v = self.getValueForAutocomplete();
      _$jscoverage['/combobox/control.js'].lineData[251]++;
      if (visit37_251_1(v !== undefined)) {
        _$jscoverage['/combobox/control.js'].lineData[252]++;
        self.sendRequest(v);
        _$jscoverage['/combobox/control.js'].lineData[253]++;
        return true;
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[256]++;
  return undefined;
}, 
  validate: function(callback) {
  _$jscoverage['/combobox/control.js'].functionData[14]++;
  _$jscoverage['/combobox/control.js'].lineData[260]++;
  var self = this, validator = self.get('validator'), val = self.getValueForAutocomplete();
  _$jscoverage['/combobox/control.js'].lineData[264]++;
  if (visit38_264_1(validator)) {
    _$jscoverage['/combobox/control.js'].lineData[265]++;
    validator(val, function(error) {
  _$jscoverage['/combobox/control.js'].functionData[15]++;
  _$jscoverage['/combobox/control.js'].lineData[266]++;
  callback(error, val);
});
  } else {
    _$jscoverage['/combobox/control.js'].lineData[269]++;
    callback(false, val);
  }
}, 
  sendRequest: function(value) {
  _$jscoverage['/combobox/control.js'].functionData[16]++;
  _$jscoverage['/combobox/control.js'].lineData[278]++;
  var self = this, dataSource = self.get("dataSource");
  _$jscoverage['/combobox/control.js'].lineData[280]++;
  dataSource.fetchData(value, renderData, self);
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[17]++;
  _$jscoverage['/combobox/control.js'].lineData[284]++;
  var self = this, el = self.$el, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[287]++;
  if (visit39_287_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[288]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[291]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[292]++;
    if (visit40_292_1(!menu.get("visible"))) {
      _$jscoverage['/combobox/control.js'].lineData[293]++;
      if (visit41_293_1(self.get("matchElWidth"))) {
        _$jscoverage['/combobox/control.js'].lineData[294]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[295]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[296]++;
        var borderWidth = (visit42_297_1(parseInt(menuEl.css('borderLeftWidth')) || 0)) + (visit43_298_1(parseInt(menuEl.css('borderRightWidth')) || 0));
        _$jscoverage['/combobox/control.js'].lineData[299]++;
        menu.set("width", el[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/combobox/control.js'].lineData[301]++;
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
  _$jscoverage['/combobox/control.js'].lineData[410]++;
  if (visit44_410_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[411]++;
    v.xclass = visit45_411_1(v.xclass || 'popupmenu');
    _$jscoverage['/combobox/control.js'].lineData[412]++;
    v = this.createComponent(v);
    _$jscoverage['/combobox/control.js'].lineData[413]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/combobox/control.js'].lineData[415]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/combobox/control.js'].functionData[19]++;
  _$jscoverage['/combobox/control.js'].lineData[418]++;
  if (visit46_418_1(m.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[419]++;
    m.setInternal('parent', this);
    _$jscoverage['/combobox/control.js'].lineData[420]++;
    var align = {
  node: this.$el, 
  points: ["bl", "tl"], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/combobox/control.js'].lineData[428]++;
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
  _$jscoverage['/combobox/control.js'].lineData[536]++;
  function getFirstEnabledItem(children) {
    _$jscoverage['/combobox/control.js'].functionData[20]++;
    _$jscoverage['/combobox/control.js'].lineData[537]++;
    for (var i = 0; visit47_537_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[538]++;
      if (visit48_538_1(!children[i].get('disabled'))) {
        _$jscoverage['/combobox/control.js'].lineData[539]++;
        return children[i];
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[542]++;
    return null;
  }
  _$jscoverage['/combobox/control.js'].lineData[545]++;
  function onMenuFocusout() {
    _$jscoverage['/combobox/control.js'].functionData[21]++;
    _$jscoverage['/combobox/control.js'].lineData[546]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[547]++;
    delayHide(combobox);
  }
  _$jscoverage['/combobox/control.js'].lineData[550]++;
  function onMenuFocusin() {
    _$jscoverage['/combobox/control.js'].functionData[22]++;
    _$jscoverage['/combobox/control.js'].lineData[551]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[555]++;
    setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[23]++;
  _$jscoverage['/combobox/control.js'].lineData[556]++;
  clearDismissTimer(combobox);
}, 0);
  }
  _$jscoverage['/combobox/control.js'].lineData[560]++;
  function onMenuMouseOver() {
    _$jscoverage['/combobox/control.js'].functionData[24]++;
    _$jscoverage['/combobox/control.js'].lineData[561]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[563]++;
    combobox.focus();
    _$jscoverage['/combobox/control.js'].lineData[565]++;
    clearDismissTimer(combobox);
  }
  _$jscoverage['/combobox/control.js'].lineData[568]++;
  function onMenuMouseDown() {
    _$jscoverage['/combobox/control.js'].functionData[25]++;
    _$jscoverage['/combobox/control.js'].lineData[569]++;
    var combobox = this;
    _$jscoverage['/combobox/control.js'].lineData[573]++;
    combobox.setValueFromAutocomplete(combobox.getValueForAutocomplete(), {
  force: 1});
  }
  _$jscoverage['/combobox/control.js'].lineData[578]++;
  function onMenuAfterRenderUI(self, menu) {
    _$jscoverage['/combobox/control.js'].functionData[26]++;
    _$jscoverage['/combobox/control.js'].lineData[579]++;
    var contentEl;
    _$jscoverage['/combobox/control.js'].lineData[580]++;
    var input = self.get('input');
    _$jscoverage['/combobox/control.js'].lineData[581]++;
    var el = menu.get('el');
    _$jscoverage['/combobox/control.js'].lineData[582]++;
    contentEl = menu.get("contentEl");
    _$jscoverage['/combobox/control.js'].lineData[583]++;
    input.attr("aria-owns", el.attr('id'));
    _$jscoverage['/combobox/control.js'].lineData[585]++;
    el.on("focusout", onMenuFocusout, self);
    _$jscoverage['/combobox/control.js'].lineData[586]++;
    el.on("focusin", onMenuFocusin, self);
    _$jscoverage['/combobox/control.js'].lineData[587]++;
    contentEl.on("mouseover", onMenuMouseOver, self);
    _$jscoverage['/combobox/control.js'].lineData[590]++;
    contentEl.on('mousedown', onMenuMouseDown, self);
  }
  _$jscoverage['/combobox/control.js'].lineData[593]++;
  function onMenuItemClick(e) {
    _$jscoverage['/combobox/control.js'].functionData[27]++;
    _$jscoverage['/combobox/control.js'].lineData[594]++;
    var item = e.target, self = this, textContent;
    _$jscoverage['/combobox/control.js'].lineData[597]++;
    if (visit49_597_1(item.isMenuItem)) {
      _$jscoverage['/combobox/control.js'].lineData[598]++;
      textContent = item.get('textContent');
      _$jscoverage['/combobox/control.js'].lineData[599]++;
      self.setValueFromAutocomplete(textContent);
      _$jscoverage['/combobox/control.js'].lineData[600]++;
      self._savedValue = textContent;
      _$jscoverage['/combobox/control.js'].lineData[601]++;
      self.set("collapsed", true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[605]++;
  function setInvalid(self, error) {
    _$jscoverage['/combobox/control.js'].functionData[28]++;
    _$jscoverage['/combobox/control.js'].lineData[606]++;
    var $el = self.$el, cls = self.view.getBaseCssClasses('invalid'), invalidEl = self.get("invalidEl");
    _$jscoverage['/combobox/control.js'].lineData[609]++;
    if (visit50_609_1(error)) {
      _$jscoverage['/combobox/control.js'].lineData[610]++;
      $el.addClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[611]++;
      invalidEl.attr("title", error);
      _$jscoverage['/combobox/control.js'].lineData[612]++;
      invalidEl.show();
    } else {
      _$jscoverage['/combobox/control.js'].lineData[614]++;
      $el.removeClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[615]++;
      invalidEl.hide();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[619]++;
  function delayHide(self) {
    _$jscoverage['/combobox/control.js'].functionData[29]++;
    _$jscoverage['/combobox/control.js'].lineData[620]++;
    if (visit51_620_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[621]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[623]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[30]++;
  _$jscoverage['/combobox/control.js'].lineData[625]++;
  if (visit52_625_1(self._focusoutDismissTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[626]++;
    self.set("collapsed", true);
  }
}, 50);
  }
  _$jscoverage['/combobox/control.js'].lineData[633]++;
  function clearDismissTimer(self) {
    _$jscoverage['/combobox/control.js'].functionData[31]++;
    _$jscoverage['/combobox/control.js'].lineData[634]++;
    var t;
    _$jscoverage['/combobox/control.js'].lineData[635]++;
    if (visit53_635_1(t = self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[636]++;
      clearTimeout(t);
      _$jscoverage['/combobox/control.js'].lineData[637]++;
      self._focusoutDismissTimer = null;
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[641]++;
  function onValueChange(e) {
    _$jscoverage['/combobox/control.js'].functionData[32]++;
    _$jscoverage['/combobox/control.js'].lineData[642]++;
    this.set('value', e.newVal, {
  data: {
  causedByTimer: 1}});
  }
  _$jscoverage['/combobox/control.js'].lineData[649]++;
  function renderData(data) {
    _$jscoverage['/combobox/control.js'].functionData[33]++;
    _$jscoverage['/combobox/control.js'].lineData[650]++;
    var self = this, v, children = [], val, matchVal, highlightedItem, i, menu = self.get("menu");
    _$jscoverage['/combobox/control.js'].lineData[659]++;
    data = self['normalizeData'](data);
    _$jscoverage['/combobox/control.js'].lineData[661]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[663]++;
    if (visit54_663_1(highlightedItem = menu.get('highlightedItem'))) {
      _$jscoverage['/combobox/control.js'].lineData[664]++;
      highlightedItem.set('highlighted', false);
    }
    _$jscoverage['/combobox/control.js'].lineData[667]++;
    if (visit55_667_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[668]++;
      for (i = 0; visit56_668_1(i < data.length); i++) {
        _$jscoverage['/combobox/control.js'].lineData[669]++;
        v = data[i];
        _$jscoverage['/combobox/control.js'].lineData[670]++;
        menu.addChild(v);
      }
      _$jscoverage['/combobox/control.js'].lineData[673]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[676]++;
      val = self['getValueForAutocomplete']();
      _$jscoverage['/combobox/control.js'].lineData[678]++;
      if (visit57_678_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[679]++;
        for (i = 0; visit58_679_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[680]++;
          if (visit59_680_1(children[i].get("textContent") == val)) {
            _$jscoverage['/combobox/control.js'].lineData[681]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[682]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[683]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[689]++;
      if (visit60_689_1(!matchVal && self.get("autoHighlightFirst"))) {
        _$jscoverage['/combobox/control.js'].lineData[690]++;
        for (i = 0; visit61_690_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[691]++;
          if (visit62_691_1(!children[i].get("disabled"))) {
            _$jscoverage['/combobox/control.js'].lineData[692]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[693]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[697]++;
      self.set("collapsed", false);
      _$jscoverage['/combobox/control.js'].lineData[699]++;
      self.fire('afterRenderData');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[701]++;
      self.set("collapsed", true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[707]++;
  return ComboBox;
});
