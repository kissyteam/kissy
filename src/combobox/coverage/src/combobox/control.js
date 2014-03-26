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
  _$jscoverage['/combobox/control.js'].lineData[85] = 0;
  _$jscoverage['/combobox/control.js'].lineData[86] = 0;
  _$jscoverage['/combobox/control.js'].lineData[88] = 0;
  _$jscoverage['/combobox/control.js'].lineData[93] = 0;
  _$jscoverage['/combobox/control.js'].lineData[94] = 0;
  _$jscoverage['/combobox/control.js'].lineData[95] = 0;
  _$jscoverage['/combobox/control.js'].lineData[103] = 0;
  _$jscoverage['/combobox/control.js'].lineData[113] = 0;
  _$jscoverage['/combobox/control.js'].lineData[118] = 0;
  _$jscoverage['/combobox/control.js'].lineData[121] = 0;
  _$jscoverage['/combobox/control.js'].lineData[122] = 0;
  _$jscoverage['/combobox/control.js'].lineData[124] = 0;
  _$jscoverage['/combobox/control.js'].lineData[125] = 0;
  _$jscoverage['/combobox/control.js'].lineData[126] = 0;
  _$jscoverage['/combobox/control.js'].lineData[128] = 0;
  _$jscoverage['/combobox/control.js'].lineData[129] = 0;
  _$jscoverage['/combobox/control.js'].lineData[131] = 0;
  _$jscoverage['/combobox/control.js'].lineData[136] = 0;
  _$jscoverage['/combobox/control.js'].lineData[138] = 0;
  _$jscoverage['/combobox/control.js'].lineData[139] = 0;
  _$jscoverage['/combobox/control.js'].lineData[140] = 0;
  _$jscoverage['/combobox/control.js'].lineData[142] = 0;
  _$jscoverage['/combobox/control.js'].lineData[143] = 0;
  _$jscoverage['/combobox/control.js'].lineData[148] = 0;
  _$jscoverage['/combobox/control.js'].lineData[150] = 0;
  _$jscoverage['/combobox/control.js'].lineData[151] = 0;
  _$jscoverage['/combobox/control.js'].lineData[152] = 0;
  _$jscoverage['/combobox/control.js'].lineData[153] = 0;
  _$jscoverage['/combobox/control.js'].lineData[154] = 0;
  _$jscoverage['/combobox/control.js'].lineData[155] = 0;
  _$jscoverage['/combobox/control.js'].lineData[156] = 0;
  _$jscoverage['/combobox/control.js'].lineData[159] = 0;
  _$jscoverage['/combobox/control.js'].lineData[163] = 0;
  _$jscoverage['/combobox/control.js'].lineData[164] = 0;
  _$jscoverage['/combobox/control.js'].lineData[169] = 0;
  _$jscoverage['/combobox/control.js'].lineData[172] = 0;
  _$jscoverage['/combobox/control.js'].lineData[173] = 0;
  _$jscoverage['/combobox/control.js'].lineData[174] = 0;
  _$jscoverage['/combobox/control.js'].lineData[175] = 0;
  _$jscoverage['/combobox/control.js'].lineData[176] = 0;
  _$jscoverage['/combobox/control.js'].lineData[178] = 0;
  _$jscoverage['/combobox/control.js'].lineData[179] = 0;
  _$jscoverage['/combobox/control.js'].lineData[182] = 0;
  _$jscoverage['/combobox/control.js'].lineData[184] = 0;
  _$jscoverage['/combobox/control.js'].lineData[189] = 0;
  _$jscoverage['/combobox/control.js'].lineData[197] = 0;
  _$jscoverage['/combobox/control.js'].lineData[198] = 0;
  _$jscoverage['/combobox/control.js'].lineData[200] = 0;
  _$jscoverage['/combobox/control.js'].lineData[202] = 0;
  _$jscoverage['/combobox/control.js'].lineData[206] = 0;
  _$jscoverage['/combobox/control.js'].lineData[207] = 0;
  _$jscoverage['/combobox/control.js'].lineData[208] = 0;
  _$jscoverage['/combobox/control.js'].lineData[213] = 0;
  _$jscoverage['/combobox/control.js'].lineData[214] = 0;
  _$jscoverage['/combobox/control.js'].lineData[215] = 0;
  _$jscoverage['/combobox/control.js'].lineData[219] = 0;
  _$jscoverage['/combobox/control.js'].lineData[221] = 0;
  _$jscoverage['/combobox/control.js'].lineData[224] = 0;
  _$jscoverage['/combobox/control.js'].lineData[225] = 0;
  _$jscoverage['/combobox/control.js'].lineData[226] = 0;
  _$jscoverage['/combobox/control.js'].lineData[230] = 0;
  _$jscoverage['/combobox/control.js'].lineData[232] = 0;
  _$jscoverage['/combobox/control.js'].lineData[235] = 0;
  _$jscoverage['/combobox/control.js'].lineData[238] = 0;
  _$jscoverage['/combobox/control.js'].lineData[243] = 0;
  _$jscoverage['/combobox/control.js'].lineData[245] = 0;
  _$jscoverage['/combobox/control.js'].lineData[247] = 0;
  _$jscoverage['/combobox/control.js'].lineData[248] = 0;
  _$jscoverage['/combobox/control.js'].lineData[252] = 0;
  _$jscoverage['/combobox/control.js'].lineData[253] = 0;
  _$jscoverage['/combobox/control.js'].lineData[255] = 0;
  _$jscoverage['/combobox/control.js'].lineData[256] = 0;
  _$jscoverage['/combobox/control.js'].lineData[257] = 0;
  _$jscoverage['/combobox/control.js'].lineData[258] = 0;
  _$jscoverage['/combobox/control.js'].lineData[261] = 0;
  _$jscoverage['/combobox/control.js'].lineData[265] = 0;
  _$jscoverage['/combobox/control.js'].lineData[269] = 0;
  _$jscoverage['/combobox/control.js'].lineData[270] = 0;
  _$jscoverage['/combobox/control.js'].lineData[271] = 0;
  _$jscoverage['/combobox/control.js'].lineData[274] = 0;
  _$jscoverage['/combobox/control.js'].lineData[283] = 0;
  _$jscoverage['/combobox/control.js'].lineData[285] = 0;
  _$jscoverage['/combobox/control.js'].lineData[289] = 0;
  _$jscoverage['/combobox/control.js'].lineData[292] = 0;
  _$jscoverage['/combobox/control.js'].lineData[293] = 0;
  _$jscoverage['/combobox/control.js'].lineData[296] = 0;
  _$jscoverage['/combobox/control.js'].lineData[297] = 0;
  _$jscoverage['/combobox/control.js'].lineData[298] = 0;
  _$jscoverage['/combobox/control.js'].lineData[299] = 0;
  _$jscoverage['/combobox/control.js'].lineData[300] = 0;
  _$jscoverage['/combobox/control.js'].lineData[301] = 0;
  _$jscoverage['/combobox/control.js'].lineData[304] = 0;
  _$jscoverage['/combobox/control.js'].lineData[306] = 0;
  _$jscoverage['/combobox/control.js'].lineData[414] = 0;
  _$jscoverage['/combobox/control.js'].lineData[415] = 0;
  _$jscoverage['/combobox/control.js'].lineData[416] = 0;
  _$jscoverage['/combobox/control.js'].lineData[417] = 0;
  _$jscoverage['/combobox/control.js'].lineData[419] = 0;
  _$jscoverage['/combobox/control.js'].lineData[422] = 0;
  _$jscoverage['/combobox/control.js'].lineData[423] = 0;
  _$jscoverage['/combobox/control.js'].lineData[424] = 0;
  _$jscoverage['/combobox/control.js'].lineData[432] = 0;
  _$jscoverage['/combobox/control.js'].lineData[539] = 0;
  _$jscoverage['/combobox/control.js'].lineData[540] = 0;
  _$jscoverage['/combobox/control.js'].lineData[541] = 0;
  _$jscoverage['/combobox/control.js'].lineData[542] = 0;
  _$jscoverage['/combobox/control.js'].lineData[545] = 0;
  _$jscoverage['/combobox/control.js'].lineData[548] = 0;
  _$jscoverage['/combobox/control.js'].lineData[549] = 0;
  _$jscoverage['/combobox/control.js'].lineData[552] = 0;
  _$jscoverage['/combobox/control.js'].lineData[553] = 0;
  _$jscoverage['/combobox/control.js'].lineData[557] = 0;
  _$jscoverage['/combobox/control.js'].lineData[558] = 0;
  _$jscoverage['/combobox/control.js'].lineData[562] = 0;
  _$jscoverage['/combobox/control.js'].lineData[563] = 0;
  _$jscoverage['/combobox/control.js'].lineData[565] = 0;
  _$jscoverage['/combobox/control.js'].lineData[567] = 0;
  _$jscoverage['/combobox/control.js'].lineData[570] = 0;
  _$jscoverage['/combobox/control.js'].lineData[571] = 0;
  _$jscoverage['/combobox/control.js'].lineData[575] = 0;
  _$jscoverage['/combobox/control.js'].lineData[580] = 0;
  _$jscoverage['/combobox/control.js'].lineData[581] = 0;
  _$jscoverage['/combobox/control.js'].lineData[583] = 0;
  _$jscoverage['/combobox/control.js'].lineData[584] = 0;
  _$jscoverage['/combobox/control.js'].lineData[585] = 0;
  _$jscoverage['/combobox/control.js'].lineData[586] = 0;
  _$jscoverage['/combobox/control.js'].lineData[587] = 0;
  _$jscoverage['/combobox/control.js'].lineData[588] = 0;
  _$jscoverage['/combobox/control.js'].lineData[590] = 0;
  _$jscoverage['/combobox/control.js'].lineData[591] = 0;
  _$jscoverage['/combobox/control.js'].lineData[592] = 0;
  _$jscoverage['/combobox/control.js'].lineData[595] = 0;
  _$jscoverage['/combobox/control.js'].lineData[596] = 0;
  _$jscoverage['/combobox/control.js'].lineData[597] = 0;
  _$jscoverage['/combobox/control.js'].lineData[602] = 0;
  _$jscoverage['/combobox/control.js'].lineData[603] = 0;
  _$jscoverage['/combobox/control.js'].lineData[604] = 0;
  _$jscoverage['/combobox/control.js'].lineData[605] = 0;
  _$jscoverage['/combobox/control.js'].lineData[606] = 0;
  _$jscoverage['/combobox/control.js'].lineData[607] = 0;
  _$jscoverage['/combobox/control.js'].lineData[608] = 0;
  _$jscoverage['/combobox/control.js'].lineData[610] = 0;
  _$jscoverage['/combobox/control.js'].lineData[614] = 0;
  _$jscoverage['/combobox/control.js'].lineData[615] = 0;
  _$jscoverage['/combobox/control.js'].lineData[618] = 0;
  _$jscoverage['/combobox/control.js'].lineData[619] = 0;
  _$jscoverage['/combobox/control.js'].lineData[620] = 0;
  _$jscoverage['/combobox/control.js'].lineData[621] = 0;
  _$jscoverage['/combobox/control.js'].lineData[622] = 0;
  _$jscoverage['/combobox/control.js'].lineData[626] = 0;
  _$jscoverage['/combobox/control.js'].lineData[627] = 0;
  _$jscoverage['/combobox/control.js'].lineData[630] = 0;
  _$jscoverage['/combobox/control.js'].lineData[631] = 0;
  _$jscoverage['/combobox/control.js'].lineData[632] = 0;
  _$jscoverage['/combobox/control.js'].lineData[633] = 0;
  _$jscoverage['/combobox/control.js'].lineData[635] = 0;
  _$jscoverage['/combobox/control.js'].lineData[636] = 0;
  _$jscoverage['/combobox/control.js'].lineData[640] = 0;
  _$jscoverage['/combobox/control.js'].lineData[641] = 0;
  _$jscoverage['/combobox/control.js'].lineData[642] = 0;
  _$jscoverage['/combobox/control.js'].lineData[644] = 0;
  _$jscoverage['/combobox/control.js'].lineData[646] = 0;
  _$jscoverage['/combobox/control.js'].lineData[647] = 0;
  _$jscoverage['/combobox/control.js'].lineData[654] = 0;
  _$jscoverage['/combobox/control.js'].lineData[655] = 0;
  _$jscoverage['/combobox/control.js'].lineData[656] = 0;
  _$jscoverage['/combobox/control.js'].lineData[657] = 0;
  _$jscoverage['/combobox/control.js'].lineData[658] = 0;
  _$jscoverage['/combobox/control.js'].lineData[662] = 0;
  _$jscoverage['/combobox/control.js'].lineData[663] = 0;
  _$jscoverage['/combobox/control.js'].lineData[670] = 0;
  _$jscoverage['/combobox/control.js'].lineData[671] = 0;
  _$jscoverage['/combobox/control.js'].lineData[680] = 0;
  _$jscoverage['/combobox/control.js'].lineData[682] = 0;
  _$jscoverage['/combobox/control.js'].lineData[684] = 0;
  _$jscoverage['/combobox/control.js'].lineData[685] = 0;
  _$jscoverage['/combobox/control.js'].lineData[688] = 0;
  _$jscoverage['/combobox/control.js'].lineData[689] = 0;
  _$jscoverage['/combobox/control.js'].lineData[690] = 0;
  _$jscoverage['/combobox/control.js'].lineData[691] = 0;
  _$jscoverage['/combobox/control.js'].lineData[694] = 0;
  _$jscoverage['/combobox/control.js'].lineData[697] = 0;
  _$jscoverage['/combobox/control.js'].lineData[699] = 0;
  _$jscoverage['/combobox/control.js'].lineData[700] = 0;
  _$jscoverage['/combobox/control.js'].lineData[701] = 0;
  _$jscoverage['/combobox/control.js'].lineData[702] = 0;
  _$jscoverage['/combobox/control.js'].lineData[703] = 0;
  _$jscoverage['/combobox/control.js'].lineData[704] = 0;
  _$jscoverage['/combobox/control.js'].lineData[710] = 0;
  _$jscoverage['/combobox/control.js'].lineData[711] = 0;
  _$jscoverage['/combobox/control.js'].lineData[712] = 0;
  _$jscoverage['/combobox/control.js'].lineData[713] = 0;
  _$jscoverage['/combobox/control.js'].lineData[714] = 0;
  _$jscoverage['/combobox/control.js'].lineData[718] = 0;
  _$jscoverage['/combobox/control.js'].lineData[720] = 0;
  _$jscoverage['/combobox/control.js'].lineData[722] = 0;
  _$jscoverage['/combobox/control.js'].lineData[728] = 0;
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
  _$jscoverage['/combobox/control.js'].branchData['85'] = [];
  _$jscoverage['/combobox/control.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['121'] = [];
  _$jscoverage['/combobox/control.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['124'] = [];
  _$jscoverage['/combobox/control.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['139'] = [];
  _$jscoverage['/combobox/control.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['152'] = [];
  _$jscoverage['/combobox/control.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['154'] = [];
  _$jscoverage['/combobox/control.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['155'] = [];
  _$jscoverage['/combobox/control.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['155'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['163'] = [];
  _$jscoverage['/combobox/control.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['175'] = [];
  _$jscoverage['/combobox/control.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['175'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['175'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['176'] = [];
  _$jscoverage['/combobox/control.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['200'] = [];
  _$jscoverage['/combobox/control.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['206'] = [];
  _$jscoverage['/combobox/control.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['208'] = [];
  _$jscoverage['/combobox/control.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['208'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['208'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['209'] = [];
  _$jscoverage['/combobox/control.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['210'] = [];
  _$jscoverage['/combobox/control.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['210'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['211'] = [];
  _$jscoverage['/combobox/control.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['224'] = [];
  _$jscoverage['/combobox/control.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['226'] = [];
  _$jscoverage['/combobox/control.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['235'] = [];
  _$jscoverage['/combobox/control.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['243'] = [];
  _$jscoverage['/combobox/control.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['243'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['247'] = [];
  _$jscoverage['/combobox/control.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['253'] = [];
  _$jscoverage['/combobox/control.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['253'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['253'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['256'] = [];
  _$jscoverage['/combobox/control.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['269'] = [];
  _$jscoverage['/combobox/control.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['292'] = [];
  _$jscoverage['/combobox/control.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['297'] = [];
  _$jscoverage['/combobox/control.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['298'] = [];
  _$jscoverage['/combobox/control.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['302'] = [];
  _$jscoverage['/combobox/control.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['303'] = [];
  _$jscoverage['/combobox/control.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['414'] = [];
  _$jscoverage['/combobox/control.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['415'] = [];
  _$jscoverage['/combobox/control.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['422'] = [];
  _$jscoverage['/combobox/control.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['540'] = [];
  _$jscoverage['/combobox/control.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['541'] = [];
  _$jscoverage['/combobox/control.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['584'] = [];
  _$jscoverage['/combobox/control.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['584'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['596'] = [];
  _$jscoverage['/combobox/control.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['605'] = [];
  _$jscoverage['/combobox/control.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['608'] = [];
  _$jscoverage['/combobox/control.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['609'] = [];
  _$jscoverage['/combobox/control.js'].branchData['609'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['618'] = [];
  _$jscoverage['/combobox/control.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['630'] = [];
  _$jscoverage['/combobox/control.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['641'] = [];
  _$jscoverage['/combobox/control.js'].branchData['641'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['646'] = [];
  _$jscoverage['/combobox/control.js'].branchData['646'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['656'] = [];
  _$jscoverage['/combobox/control.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['688'] = [];
  _$jscoverage['/combobox/control.js'].branchData['688'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['689'] = [];
  _$jscoverage['/combobox/control.js'].branchData['689'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['699'] = [];
  _$jscoverage['/combobox/control.js'].branchData['699'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['700'] = [];
  _$jscoverage['/combobox/control.js'].branchData['700'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['701'] = [];
  _$jscoverage['/combobox/control.js'].branchData['701'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['710'] = [];
  _$jscoverage['/combobox/control.js'].branchData['710'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['711'] = [];
  _$jscoverage['/combobox/control.js'].branchData['711'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['712'] = [];
  _$jscoverage['/combobox/control.js'].branchData['712'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['712'][1].init(25, 28, '!children[i].get(\'disabled\')');
function visit75_712_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['712'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['711'][1].init(29, 19, 'i < children.length');
function visit74_711_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['711'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['710'][1].init(745, 43, '!matchVal && self.get(\'autoHighlightFirst\')');
function visit73_710_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['710'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['701'][1].init(25, 38, 'children[i].get(\'textContent\') === val');
function visit72_701_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['700'][1].init(29, 19, 'i < children.length');
function visit71_700_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['700'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['699'][1].init(306, 30, 'self.get(\'highlightMatchItem\')');
function visit70_699_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['699'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['689'][1].init(25, 15, 'i < data.length');
function visit69_689_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['689'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['688'][1].init(408, 19, 'data && data.length');
function visit68_688_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['688'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['656'][1].init(57, 1, 't');
function visit67_656_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['646'][1].init(48, 26, 'self._focusoutDismissTimer');
function visit66_646_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['646'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['641'][1].init(13, 26, 'self._focusoutDismissTimer');
function visit65_641_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['641'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['630'][1].init(146, 5, 'error');
function visit64_630_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['618'][1].init(92, 15, 'item.isMenuItem');
function visit63_618_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['609'][1].init(68, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit62_609_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['609'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['608'][1].init(110, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit61_608_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['605'][1].init(75, 19, 'menu.get(\'visible\')');
function visit60_605_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['596'][1].init(559, 24, 'self.get(\'matchElWidth\')');
function visit59_596_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['584'][2].init(104, 17, 'menu === e.target');
function visit58_584_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['584'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['584'][1].init(98, 23, '!e || menu === e.target');
function visit57_584_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['541'][1].init(17, 28, '!children[i].get(\'disabled\')');
function visit56_541_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['540'][1].init(25, 19, 'i < children.length');
function visit55_540_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['422'][1].init(29, 11, 'm.isControl');
function visit54_422_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['415'][1].init(40, 23, 'v.xclass || \'popupmenu\'');
function visit53_415_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['414'][1].init(29, 12, '!v.isControl');
function visit52_414_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['303'][1].init(88, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit51_303_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['302'][1].init(46, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit50_302_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['298'][1].init(29, 24, 'self.get(\'matchElWidth\')');
function visit49_298_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['297'][1].init(116, 20, '!menu.get(\'visible\')');
function visit48_297_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['292'][1].init(134, 1, 'v');
function visit47_292_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['269'][1].init(160, 9, 'validator');
function visit46_269_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['256'][1].init(134, 15, 'v !== undefined');
function visit45_256_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['253'][3].init(2911, 22, 'keyCode === KeyCode.UP');
function visit44_253_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['253'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['253'][2].init(2883, 24, 'keyCode === KeyCode.DOWN');
function visit43_253_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['253'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['253'][1].init(2883, 50, 'keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit42_253_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['247'][1].init(212, 20, 'self.get(\'multiple\')');
function visit41_247_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['243'][2].init(2024, 23, 'keyCode === KeyCode.TAB');
function visit40_243_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['243'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['243'][1].init(2024, 42, 'keyCode === KeyCode.TAB && highlightedItem');
function visit39_243_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['235'][1].init(1604, 93, 'updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit38_235_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['226'][1].init(82, 19, 'updateInputOnDownUp');
function visit37_226_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['224'][1].init(1098, 23, 'keyCode === KeyCode.ESC');
function visit36_224_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['211'][1].init(57, 53, 'highlightedItem === getFirstEnabledItem(menuChildren)');
function visit35_211_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['210'][2].init(256, 22, 'keyCode === KeyCode.UP');
function visit34_210_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['210'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['210'][1].init(159, 111, 'keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit33_210_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['209'][1].init(55, 72, 'highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit32_209_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['208'][3].init(94, 24, 'keyCode === KeyCode.DOWN');
function visit31_208_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['208'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['208'][2].init(94, 128, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit30_208_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['208'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['208'][1].init(94, 271, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit29_208_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['206'][1].init(243, 38, 'updateInputOnDownUp && highlightedItem');
function visit28_206_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['200'][1].init(396, 19, 'menu.get(\'visible\')');
function visit27_200_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['176'][1].init(25, 21, 'self.get(\'collapsed\')');
function visit26_176_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['175'][3].init(240, 21, 'trigger[0] === target');
function visit25_175_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['175'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['175'][2].init(240, 49, 'trigger[0] === target || trigger.contains(target)');
function visit24_175_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['175'][1].init(228, 62, 'trigger && (trigger[0] === target || trigger.contains(target))');
function visit23_175_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['163'][1].init(653, 35, 'placeholderEl && !self.get(\'value\')');
function visit22_163_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['155'][2].init(58, 25, 'val === self.get(\'value\')');
function visit21_155_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['155'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['155'][1].init(33, 51, '!self.get(\'focused\') && (val === self.get(\'value\'))');
function visit20_155_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['154'][1].init(29, 5, 'error');
function visit19_154_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['152'][1].init(185, 21, 'self.get(\'invalidEl\')');
function visit18_152_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['139'][1].init(130, 21, 'self.get(\'invalidEl\')');
function visit17_139_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['124'][1].init(136, 19, 'value === undefined');
function visit16_124_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['121'][1].init(142, 20, 'e.causedByInputEvent');
function visit15_121_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['85'][1].init(554, 20, 'menu.get(\'rendered\')');
function visit14_85_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['54'][1].init(361, 15, 'i < data.length');
function visit13_54_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['48'][1].init(93, 18, 'self.get(\'format\')');
function visit12_48_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['46'][1].init(93, 19, 'data && data.length');
function visit11_46_1(result) {
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
  normalizeData: function(data) {
  _$jscoverage['/combobox/control.js'].functionData[2]++;
  _$jscoverage['/combobox/control.js'].lineData[44]++;
  var self = this, contents, v, i, c;
  _$jscoverage['/combobox/control.js'].lineData[46]++;
  if (visit11_46_1(data && data.length)) {
    _$jscoverage['/combobox/control.js'].lineData[47]++;
    data = data.slice(0, self.get('maxItemCount'));
    _$jscoverage['/combobox/control.js'].lineData[48]++;
    if (visit12_48_1(self.get('format'))) {
      _$jscoverage['/combobox/control.js'].lineData[49]++;
      contents = self.get('format').call(self, self.getCurrentValue(), data);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[52]++;
      contents = [];
    }
    _$jscoverage['/combobox/control.js'].lineData[54]++;
    for (i = 0; visit13_54_1(i < data.length); i++) {
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
  var menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[85]++;
  if (visit14_85_1(menu.get('rendered'))) {
    _$jscoverage['/combobox/control.js'].lineData[86]++;
    onMenuAfterRenderUI.call(self);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[88]++;
    menu.on('afterRenderUI', onMenuAfterRenderUI, self);
  }
}, 
  destructor: function() {
  _$jscoverage['/combobox/control.js'].functionData[4]++;
  _$jscoverage['/combobox/control.js'].lineData[93]++;
  var self = this;
  _$jscoverage['/combobox/control.js'].lineData[94]++;
  self.get('menu').destroy();
  _$jscoverage['/combobox/control.js'].lineData[95]++;
  self.$el.getWindow().detach('resize', onWindowResize, self);
}, 
  getCurrentValue: function() {
  _$jscoverage['/combobox/control.js'].functionData[5]++;
  _$jscoverage['/combobox/control.js'].lineData[103]++;
  return this.get('value');
}, 
  setCurrentValue: function(value, setCfg) {
  _$jscoverage['/combobox/control.js'].functionData[6]++;
  _$jscoverage['/combobox/control.js'].lineData[113]++;
  this.set('value', value, setCfg);
}, 
  _onSetValue: function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[7]++;
  _$jscoverage['/combobox/control.js'].lineData[118]++;
  var self = this, value;
  _$jscoverage['/combobox/control.js'].lineData[121]++;
  if (visit15_121_1(e.causedByInputEvent)) {
    _$jscoverage['/combobox/control.js'].lineData[122]++;
    value = self.getCurrentValue();
    _$jscoverage['/combobox/control.js'].lineData[124]++;
    if (visit16_124_1(value === undefined)) {
      _$jscoverage['/combobox/control.js'].lineData[125]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[126]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[128]++;
    self._savedValue = value;
    _$jscoverage['/combobox/control.js'].lineData[129]++;
    self.sendRequest(value);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[131]++;
    self.get('input').val(v);
  }
}, 
  handleFocusInternal: function() {
  _$jscoverage['/combobox/control.js'].functionData[8]++;
  _$jscoverage['/combobox/control.js'].lineData[136]++;
  var self = this, placeholderEl;
  _$jscoverage['/combobox/control.js'].lineData[138]++;
  clearDismissTimer(self);
  _$jscoverage['/combobox/control.js'].lineData[139]++;
  if (visit17_139_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[140]++;
    setInvalid(self, false);
  }
  _$jscoverage['/combobox/control.js'].lineData[142]++;
  if ((placeholderEl = self.get('placeholderEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[143]++;
    placeholderEl.hide();
  }
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[9]++;
  _$jscoverage['/combobox/control.js'].lineData[148]++;
  var self = this, placeholderEl = self.get('placeholderEl');
  _$jscoverage['/combobox/control.js'].lineData[150]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[151]++;
  delayHide(self);
  _$jscoverage['/combobox/control.js'].lineData[152]++;
  if (visit18_152_1(self.get('invalidEl'))) {
    _$jscoverage['/combobox/control.js'].lineData[153]++;
    self.validate(function(error, val) {
  _$jscoverage['/combobox/control.js'].functionData[10]++;
  _$jscoverage['/combobox/control.js'].lineData[154]++;
  if (visit19_154_1(error)) {
    _$jscoverage['/combobox/control.js'].lineData[155]++;
    if (visit20_155_1(!self.get('focused') && (visit21_155_2(val === self.get('value'))))) {
      _$jscoverage['/combobox/control.js'].lineData[156]++;
      setInvalid(self, error);
    }
  } else {
    _$jscoverage['/combobox/control.js'].lineData[159]++;
    setInvalid(self, false);
  }
});
  }
  _$jscoverage['/combobox/control.js'].lineData[163]++;
  if (visit22_163_1(placeholderEl && !self.get('value'))) {
    _$jscoverage['/combobox/control.js'].lineData[164]++;
    placeholderEl.show();
  }
}, 
  handleMouseDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[11]++;
  _$jscoverage['/combobox/control.js'].lineData[169]++;
  var self = this, target, trigger;
  _$jscoverage['/combobox/control.js'].lineData[172]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[173]++;
  target = e.target;
  _$jscoverage['/combobox/control.js'].lineData[174]++;
  trigger = self.get('trigger');
  _$jscoverage['/combobox/control.js'].lineData[175]++;
  if (visit23_175_1(trigger && (visit24_175_2(visit25_175_3(trigger[0] === target) || trigger.contains(target))))) {
    _$jscoverage['/combobox/control.js'].lineData[176]++;
    if (visit26_176_1(self.get('collapsed'))) {
      _$jscoverage['/combobox/control.js'].lineData[178]++;
      self.focus();
      _$jscoverage['/combobox/control.js'].lineData[179]++;
      self.sendRequest('');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[182]++;
      self.set('collapsed', true);
    }
    _$jscoverage['/combobox/control.js'].lineData[184]++;
    e.preventDefault();
  }
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[12]++;
  _$jscoverage['/combobox/control.js'].lineData[189]++;
  var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[197]++;
  input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[198]++;
  updateInputOnDownUp = self.get('updateInputOnDownUp');
  _$jscoverage['/combobox/control.js'].lineData[200]++;
  if (visit27_200_1(menu.get('visible'))) {
    _$jscoverage['/combobox/control.js'].lineData[202]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[206]++;
    if (visit28_206_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[207]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[208]++;
      if (visit29_208_1(visit30_208_2(visit31_208_3(keyCode === KeyCode.DOWN) && visit32_209_1(highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()))) || visit33_210_1(visit34_210_2(keyCode === KeyCode.UP) && visit35_211_1(highlightedItem === getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[213]++;
        self.setCurrentValue(self._savedValue);
        _$jscoverage['/combobox/control.js'].lineData[214]++;
        highlightedItem.set('highlighted', false);
        _$jscoverage['/combobox/control.js'].lineData[215]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[219]++;
    handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/combobox/control.js'].lineData[221]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[224]++;
    if (visit36_224_1(keyCode === KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[225]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[226]++;
      if (visit37_226_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[230]++;
        self.setCurrentValue(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[232]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[235]++;
    if (visit38_235_1(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[238]++;
      self.setCurrentValue(highlightedItem.get('textContent'));
    }
    _$jscoverage['/combobox/control.js'].lineData[243]++;
    if (visit39_243_1(visit40_243_2(keyCode === KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[245]++;
      highlightedItem.handleClickInternal(e);
      _$jscoverage['/combobox/control.js'].lineData[247]++;
      if (visit41_247_1(self.get('multiple'))) {
        _$jscoverage['/combobox/control.js'].lineData[248]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[252]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[253]++;
    if (visit42_253_1(visit43_253_2(keyCode === KeyCode.DOWN) || visit44_253_3(keyCode === KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[255]++;
      var v = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[256]++;
      if (visit45_256_1(v !== undefined)) {
        _$jscoverage['/combobox/control.js'].lineData[257]++;
        self.sendRequest(v);
        _$jscoverage['/combobox/control.js'].lineData[258]++;
        return true;
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[261]++;
  return undefined;
}, 
  validate: function(callback) {
  _$jscoverage['/combobox/control.js'].functionData[13]++;
  _$jscoverage['/combobox/control.js'].lineData[265]++;
  var self = this, validator = self.get('validator'), val = self.getCurrentValue();
  _$jscoverage['/combobox/control.js'].lineData[269]++;
  if (visit46_269_1(validator)) {
    _$jscoverage['/combobox/control.js'].lineData[270]++;
    validator(val, function(error) {
  _$jscoverage['/combobox/control.js'].functionData[14]++;
  _$jscoverage['/combobox/control.js'].lineData[271]++;
  callback(error, val);
});
  } else {
    _$jscoverage['/combobox/control.js'].lineData[274]++;
    callback(false, val);
  }
}, 
  sendRequest: function(value) {
  _$jscoverage['/combobox/control.js'].functionData[15]++;
  _$jscoverage['/combobox/control.js'].lineData[283]++;
  var self = this, dataSource = self.get('dataSource');
  _$jscoverage['/combobox/control.js'].lineData[285]++;
  dataSource.fetchData(value, renderData, self);
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[16]++;
  _$jscoverage['/combobox/control.js'].lineData[289]++;
  var self = this, el = self.$el, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[292]++;
  if (visit47_292_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[293]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[296]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[297]++;
    if (visit48_297_1(!menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[298]++;
      if (visit49_298_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[299]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[300]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[301]++;
        var borderWidth = (visit50_302_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit51_303_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
        _$jscoverage['/combobox/control.js'].lineData[304]++;
        menu.set('width', el[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/combobox/control.js'].lineData[306]++;
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
  _$jscoverage['/combobox/control.js'].functionData[17]++;
  _$jscoverage['/combobox/control.js'].lineData[414]++;
  if (visit52_414_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[415]++;
    v.xclass = visit53_415_1(v.xclass || 'popupmenu');
    _$jscoverage['/combobox/control.js'].lineData[416]++;
    v = this.createComponent(v);
    _$jscoverage['/combobox/control.js'].lineData[417]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/combobox/control.js'].lineData[419]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/combobox/control.js'].functionData[18]++;
  _$jscoverage['/combobox/control.js'].lineData[422]++;
  if (visit54_422_1(m.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[423]++;
    m.setInternal('parent', this);
    _$jscoverage['/combobox/control.js'].lineData[424]++;
    var align = {
  node: this.$el, 
  points: ['bl', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/combobox/control.js'].lineData[432]++;
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
  _$jscoverage['/combobox/control.js'].lineData[539]++;
  function getFirstEnabledItem(children) {
    _$jscoverage['/combobox/control.js'].functionData[19]++;
    _$jscoverage['/combobox/control.js'].lineData[540]++;
    for (var i = 0; visit55_540_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[541]++;
      if (visit56_541_1(!children[i].get('disabled'))) {
        _$jscoverage['/combobox/control.js'].lineData[542]++;
        return children[i];
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[545]++;
    return null;
  }
  _$jscoverage['/combobox/control.js'].lineData[548]++;
  function onMenuFocusout() {
    _$jscoverage['/combobox/control.js'].functionData[20]++;
    _$jscoverage['/combobox/control.js'].lineData[549]++;
    delayHide(this);
  }
  _$jscoverage['/combobox/control.js'].lineData[552]++;
  function onMenuFocusin() {
    _$jscoverage['/combobox/control.js'].functionData[21]++;
    _$jscoverage['/combobox/control.js'].lineData[553]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[557]++;
    setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[22]++;
  _$jscoverage['/combobox/control.js'].lineData[558]++;
  clearDismissTimer(self);
}, 0);
  }
  _$jscoverage['/combobox/control.js'].lineData[562]++;
  function onMenuMouseOver() {
    _$jscoverage['/combobox/control.js'].functionData[23]++;
    _$jscoverage['/combobox/control.js'].lineData[563]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[565]++;
    self.focus();
    _$jscoverage['/combobox/control.js'].lineData[567]++;
    clearDismissTimer(self);
  }
  _$jscoverage['/combobox/control.js'].lineData[570]++;
  function onMenuMouseDown() {
    _$jscoverage['/combobox/control.js'].functionData[24]++;
    _$jscoverage['/combobox/control.js'].lineData[571]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[575]++;
    self.setCurrentValue(self.getCurrentValue(), {
  force: 1});
  }
  _$jscoverage['/combobox/control.js'].lineData[580]++;
  function onMenuAfterRenderUI(e) {
    _$jscoverage['/combobox/control.js'].functionData[25]++;
    _$jscoverage['/combobox/control.js'].lineData[581]++;
    var self = this, contentEl;
    _$jscoverage['/combobox/control.js'].lineData[583]++;
    var menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[584]++;
    if (visit57_584_1(!e || visit58_584_2(menu === e.target))) {
      _$jscoverage['/combobox/control.js'].lineData[585]++;
      var input = self.get('input');
      _$jscoverage['/combobox/control.js'].lineData[586]++;
      var el = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[587]++;
      contentEl = menu.get('contentEl');
      _$jscoverage['/combobox/control.js'].lineData[588]++;
      input.attr('aria-owns', el.attr('id'));
      _$jscoverage['/combobox/control.js'].lineData[590]++;
      el.on('focusout', onMenuFocusout, self);
      _$jscoverage['/combobox/control.js'].lineData[591]++;
      el.on('focusin', onMenuFocusin, self);
      _$jscoverage['/combobox/control.js'].lineData[592]++;
      contentEl.on('mouseover', onMenuMouseOver, self);
      _$jscoverage['/combobox/control.js'].lineData[595]++;
      contentEl.on('mousedown', onMenuMouseDown, self);
      _$jscoverage['/combobox/control.js'].lineData[596]++;
      if (visit59_596_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[597]++;
        el.getWindow().on('resize', onWindowResize, self);
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[602]++;
  function onWindowResize() {
    _$jscoverage['/combobox/control.js'].functionData[26]++;
    _$jscoverage['/combobox/control.js'].lineData[603]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[604]++;
    var menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[605]++;
    if (visit60_605_1(menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[606]++;
      var el = self.get('el');
      _$jscoverage['/combobox/control.js'].lineData[607]++;
      var menuEl = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[608]++;
      var borderWidth = (visit61_608_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit62_609_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
      _$jscoverage['/combobox/control.js'].lineData[610]++;
      menu.set('width', el[0].offsetWidth - borderWidth);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[614]++;
  function onMenuItemClick(e) {
    _$jscoverage['/combobox/control.js'].functionData[27]++;
    _$jscoverage['/combobox/control.js'].lineData[615]++;
    var item = e.target, self = this, textContent;
    _$jscoverage['/combobox/control.js'].lineData[618]++;
    if (visit63_618_1(item.isMenuItem)) {
      _$jscoverage['/combobox/control.js'].lineData[619]++;
      textContent = item.get('textContent');
      _$jscoverage['/combobox/control.js'].lineData[620]++;
      self.setCurrentValue(textContent);
      _$jscoverage['/combobox/control.js'].lineData[621]++;
      self._savedValue = textContent;
      _$jscoverage['/combobox/control.js'].lineData[622]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[626]++;
  function setInvalid(self, error) {
    _$jscoverage['/combobox/control.js'].functionData[28]++;
    _$jscoverage['/combobox/control.js'].lineData[627]++;
    var $el = self.$el, cls = self.view.getBaseCssClasses('invalid'), invalidEl = self.get('invalidEl');
    _$jscoverage['/combobox/control.js'].lineData[630]++;
    if (visit64_630_1(error)) {
      _$jscoverage['/combobox/control.js'].lineData[631]++;
      $el.addClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[632]++;
      invalidEl.attr('title', error);
      _$jscoverage['/combobox/control.js'].lineData[633]++;
      invalidEl.show();
    } else {
      _$jscoverage['/combobox/control.js'].lineData[635]++;
      $el.removeClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[636]++;
      invalidEl.hide();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[640]++;
  function delayHide(self) {
    _$jscoverage['/combobox/control.js'].functionData[29]++;
    _$jscoverage['/combobox/control.js'].lineData[641]++;
    if (visit65_641_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[642]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[644]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[30]++;
  _$jscoverage['/combobox/control.js'].lineData[646]++;
  if (visit66_646_1(self._focusoutDismissTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[647]++;
    self.set('collapsed', true);
  }
}, 50);
  }
  _$jscoverage['/combobox/control.js'].lineData[654]++;
  function clearDismissTimer(self) {
    _$jscoverage['/combobox/control.js'].functionData[31]++;
    _$jscoverage['/combobox/control.js'].lineData[655]++;
    var t = self._focusoutDismissTimer;
    _$jscoverage['/combobox/control.js'].lineData[656]++;
    if (visit67_656_1(t)) {
      _$jscoverage['/combobox/control.js'].lineData[657]++;
      clearTimeout(t);
      _$jscoverage['/combobox/control.js'].lineData[658]++;
      self._focusoutDismissTimer = null;
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[662]++;
  function onValueChange(e) {
    _$jscoverage['/combobox/control.js'].functionData[32]++;
    _$jscoverage['/combobox/control.js'].lineData[663]++;
    this.set('value', e.target.value, {
  data: {
  causedByInputEvent: 1}});
  }
  _$jscoverage['/combobox/control.js'].lineData[670]++;
  function renderData(data) {
    _$jscoverage['/combobox/control.js'].functionData[33]++;
    _$jscoverage['/combobox/control.js'].lineData[671]++;
    var self = this, v, children = [], val, matchVal, highlightedItem, i, menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[680]++;
    data = self.normalizeData(data);
    _$jscoverage['/combobox/control.js'].lineData[682]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[684]++;
    if ((highlightedItem = menu.get('highlightedItem'))) {
      _$jscoverage['/combobox/control.js'].lineData[685]++;
      highlightedItem.set('highlighted', false);
    }
    _$jscoverage['/combobox/control.js'].lineData[688]++;
    if (visit68_688_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[689]++;
      for (i = 0; visit69_689_1(i < data.length); i++) {
        _$jscoverage['/combobox/control.js'].lineData[690]++;
        v = data[i];
        _$jscoverage['/combobox/control.js'].lineData[691]++;
        menu.addChild(v);
      }
      _$jscoverage['/combobox/control.js'].lineData[694]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[697]++;
      val = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[699]++;
      if (visit70_699_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[700]++;
        for (i = 0; visit71_700_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[701]++;
          if (visit72_701_1(children[i].get('textContent') === val)) {
            _$jscoverage['/combobox/control.js'].lineData[702]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[703]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[704]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[710]++;
      if (visit73_710_1(!matchVal && self.get('autoHighlightFirst'))) {
        _$jscoverage['/combobox/control.js'].lineData[711]++;
        for (i = 0; visit74_711_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[712]++;
          if (visit75_712_1(!children[i].get('disabled'))) {
            _$jscoverage['/combobox/control.js'].lineData[713]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[714]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[718]++;
      self.set('collapsed', false);
      _$jscoverage['/combobox/control.js'].lineData[720]++;
      self.fire('afterRenderData');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[722]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[728]++;
  return ComboBox;
});
