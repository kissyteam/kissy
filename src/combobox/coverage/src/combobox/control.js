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
  _$jscoverage['/combobox/control.js'].lineData[39] = 0;
  _$jscoverage['/combobox/control.js'].lineData[42] = 0;
  _$jscoverage['/combobox/control.js'].lineData[52] = 0;
  _$jscoverage['/combobox/control.js'].lineData[54] = 0;
  _$jscoverage['/combobox/control.js'].lineData[56] = 0;
  _$jscoverage['/combobox/control.js'].lineData[57] = 0;
  _$jscoverage['/combobox/control.js'].lineData[59] = 0;
  _$jscoverage['/combobox/control.js'].lineData[64] = 0;
  _$jscoverage['/combobox/control.js'].lineData[65] = 0;
  _$jscoverage['/combobox/control.js'].lineData[66] = 0;
  _$jscoverage['/combobox/control.js'].lineData[75] = 0;
  _$jscoverage['/combobox/control.js'].lineData[77] = 0;
  _$jscoverage['/combobox/control.js'].lineData[78] = 0;
  _$jscoverage['/combobox/control.js'].lineData[79] = 0;
  _$jscoverage['/combobox/control.js'].lineData[80] = 0;
  _$jscoverage['/combobox/control.js'].lineData[83] = 0;
  _$jscoverage['/combobox/control.js'].lineData[85] = 0;
  _$jscoverage['/combobox/control.js'].lineData[86] = 0;
  _$jscoverage['/combobox/control.js'].lineData[87] = 0;
  _$jscoverage['/combobox/control.js'].lineData[93] = 0;
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
  _$jscoverage['/combobox/control.js'].lineData[171] = 0;
  _$jscoverage['/combobox/control.js'].lineData[172] = 0;
  _$jscoverage['/combobox/control.js'].lineData[173] = 0;
  _$jscoverage['/combobox/control.js'].lineData[174] = 0;
  _$jscoverage['/combobox/control.js'].lineData[175] = 0;
  _$jscoverage['/combobox/control.js'].lineData[176] = 0;
  _$jscoverage['/combobox/control.js'].lineData[178] = 0;
  _$jscoverage['/combobox/control.js'].lineData[179] = 0;
  _$jscoverage['/combobox/control.js'].lineData[182] = 0;
  _$jscoverage['/combobox/control.js'].lineData[184] = 0;
  _$jscoverage['/combobox/control.js'].lineData[185] = 0;
  _$jscoverage['/combobox/control.js'].lineData[186] = 0;
  _$jscoverage['/combobox/control.js'].lineData[188] = 0;
  _$jscoverage['/combobox/control.js'].lineData[197] = 0;
  _$jscoverage['/combobox/control.js'].lineData[205] = 0;
  _$jscoverage['/combobox/control.js'].lineData[206] = 0;
  _$jscoverage['/combobox/control.js'].lineData[208] = 0;
  _$jscoverage['/combobox/control.js'].lineData[210] = 0;
  _$jscoverage['/combobox/control.js'].lineData[214] = 0;
  _$jscoverage['/combobox/control.js'].lineData[215] = 0;
  _$jscoverage['/combobox/control.js'].lineData[216] = 0;
  _$jscoverage['/combobox/control.js'].lineData[221] = 0;
  _$jscoverage['/combobox/control.js'].lineData[222] = 0;
  _$jscoverage['/combobox/control.js'].lineData[223] = 0;
  _$jscoverage['/combobox/control.js'].lineData[227] = 0;
  _$jscoverage['/combobox/control.js'].lineData[229] = 0;
  _$jscoverage['/combobox/control.js'].lineData[232] = 0;
  _$jscoverage['/combobox/control.js'].lineData[233] = 0;
  _$jscoverage['/combobox/control.js'].lineData[234] = 0;
  _$jscoverage['/combobox/control.js'].lineData[238] = 0;
  _$jscoverage['/combobox/control.js'].lineData[240] = 0;
  _$jscoverage['/combobox/control.js'].lineData[243] = 0;
  _$jscoverage['/combobox/control.js'].lineData[246] = 0;
  _$jscoverage['/combobox/control.js'].lineData[251] = 0;
  _$jscoverage['/combobox/control.js'].lineData[253] = 0;
  _$jscoverage['/combobox/control.js'].lineData[255] = 0;
  _$jscoverage['/combobox/control.js'].lineData[256] = 0;
  _$jscoverage['/combobox/control.js'].lineData[260] = 0;
  _$jscoverage['/combobox/control.js'].lineData[261] = 0;
  _$jscoverage['/combobox/control.js'].lineData[263] = 0;
  _$jscoverage['/combobox/control.js'].lineData[264] = 0;
  _$jscoverage['/combobox/control.js'].lineData[265] = 0;
  _$jscoverage['/combobox/control.js'].lineData[266] = 0;
  _$jscoverage['/combobox/control.js'].lineData[269] = 0;
  _$jscoverage['/combobox/control.js'].lineData[273] = 0;
  _$jscoverage['/combobox/control.js'].lineData[277] = 0;
  _$jscoverage['/combobox/control.js'].lineData[278] = 0;
  _$jscoverage['/combobox/control.js'].lineData[279] = 0;
  _$jscoverage['/combobox/control.js'].lineData[282] = 0;
  _$jscoverage['/combobox/control.js'].lineData[291] = 0;
  _$jscoverage['/combobox/control.js'].lineData[293] = 0;
  _$jscoverage['/combobox/control.js'].lineData[297] = 0;
  _$jscoverage['/combobox/control.js'].lineData[301] = 0;
  _$jscoverage['/combobox/control.js'].lineData[304] = 0;
  _$jscoverage['/combobox/control.js'].lineData[305] = 0;
  _$jscoverage['/combobox/control.js'].lineData[308] = 0;
  _$jscoverage['/combobox/control.js'].lineData[309] = 0;
  _$jscoverage['/combobox/control.js'].lineData[310] = 0;
  _$jscoverage['/combobox/control.js'].lineData[311] = 0;
  _$jscoverage['/combobox/control.js'].lineData[312] = 0;
  _$jscoverage['/combobox/control.js'].lineData[313] = 0;
  _$jscoverage['/combobox/control.js'].lineData[316] = 0;
  _$jscoverage['/combobox/control.js'].lineData[318] = 0;
  _$jscoverage['/combobox/control.js'].lineData[321] = 0;
  _$jscoverage['/combobox/control.js'].lineData[325] = 0;
  _$jscoverage['/combobox/control.js'].lineData[326] = 0;
  _$jscoverage['/combobox/control.js'].lineData[344] = 0;
  _$jscoverage['/combobox/control.js'].lineData[360] = 0;
  _$jscoverage['/combobox/control.js'].lineData[370] = 0;
  _$jscoverage['/combobox/control.js'].lineData[385] = 0;
  _$jscoverage['/combobox/control.js'].lineData[386] = 0;
  _$jscoverage['/combobox/control.js'].lineData[396] = 0;
  _$jscoverage['/combobox/control.js'].lineData[402] = 0;
  _$jscoverage['/combobox/control.js'].lineData[423] = 0;
  _$jscoverage['/combobox/control.js'].lineData[461] = 0;
  _$jscoverage['/combobox/control.js'].lineData[462] = 0;
  _$jscoverage['/combobox/control.js'].lineData[463] = 0;
  _$jscoverage['/combobox/control.js'].lineData[464] = 0;
  _$jscoverage['/combobox/control.js'].lineData[466] = 0;
  _$jscoverage['/combobox/control.js'].lineData[469] = 0;
  _$jscoverage['/combobox/control.js'].lineData[470] = 0;
  _$jscoverage['/combobox/control.js'].lineData[471] = 0;
  _$jscoverage['/combobox/control.js'].lineData[479] = 0;
  _$jscoverage['/combobox/control.js'].lineData[583] = 0;
  _$jscoverage['/combobox/control.js'].lineData[584] = 0;
  _$jscoverage['/combobox/control.js'].lineData[585] = 0;
  _$jscoverage['/combobox/control.js'].lineData[586] = 0;
  _$jscoverage['/combobox/control.js'].lineData[589] = 0;
  _$jscoverage['/combobox/control.js'].lineData[592] = 0;
  _$jscoverage['/combobox/control.js'].lineData[593] = 0;
  _$jscoverage['/combobox/control.js'].lineData[596] = 0;
  _$jscoverage['/combobox/control.js'].lineData[597] = 0;
  _$jscoverage['/combobox/control.js'].lineData[601] = 0;
  _$jscoverage['/combobox/control.js'].lineData[602] = 0;
  _$jscoverage['/combobox/control.js'].lineData[606] = 0;
  _$jscoverage['/combobox/control.js'].lineData[607] = 0;
  _$jscoverage['/combobox/control.js'].lineData[609] = 0;
  _$jscoverage['/combobox/control.js'].lineData[611] = 0;
  _$jscoverage['/combobox/control.js'].lineData[614] = 0;
  _$jscoverage['/combobox/control.js'].lineData[615] = 0;
  _$jscoverage['/combobox/control.js'].lineData[619] = 0;
  _$jscoverage['/combobox/control.js'].lineData[624] = 0;
  _$jscoverage['/combobox/control.js'].lineData[625] = 0;
  _$jscoverage['/combobox/control.js'].lineData[627] = 0;
  _$jscoverage['/combobox/control.js'].lineData[628] = 0;
  _$jscoverage['/combobox/control.js'].lineData[629] = 0;
  _$jscoverage['/combobox/control.js'].lineData[630] = 0;
  _$jscoverage['/combobox/control.js'].lineData[631] = 0;
  _$jscoverage['/combobox/control.js'].lineData[632] = 0;
  _$jscoverage['/combobox/control.js'].lineData[634] = 0;
  _$jscoverage['/combobox/control.js'].lineData[635] = 0;
  _$jscoverage['/combobox/control.js'].lineData[636] = 0;
  _$jscoverage['/combobox/control.js'].lineData[639] = 0;
  _$jscoverage['/combobox/control.js'].lineData[640] = 0;
  _$jscoverage['/combobox/control.js'].lineData[641] = 0;
  _$jscoverage['/combobox/control.js'].lineData[646] = 0;
  _$jscoverage['/combobox/control.js'].lineData[647] = 0;
  _$jscoverage['/combobox/control.js'].lineData[648] = 0;
  _$jscoverage['/combobox/control.js'].lineData[649] = 0;
  _$jscoverage['/combobox/control.js'].lineData[650] = 0;
  _$jscoverage['/combobox/control.js'].lineData[651] = 0;
  _$jscoverage['/combobox/control.js'].lineData[652] = 0;
  _$jscoverage['/combobox/control.js'].lineData[654] = 0;
  _$jscoverage['/combobox/control.js'].lineData[658] = 0;
  _$jscoverage['/combobox/control.js'].lineData[659] = 0;
  _$jscoverage['/combobox/control.js'].lineData[662] = 0;
  _$jscoverage['/combobox/control.js'].lineData[663] = 0;
  _$jscoverage['/combobox/control.js'].lineData[664] = 0;
  _$jscoverage['/combobox/control.js'].lineData[665] = 0;
  _$jscoverage['/combobox/control.js'].lineData[666] = 0;
  _$jscoverage['/combobox/control.js'].lineData[670] = 0;
  _$jscoverage['/combobox/control.js'].lineData[671] = 0;
  _$jscoverage['/combobox/control.js'].lineData[674] = 0;
  _$jscoverage['/combobox/control.js'].lineData[675] = 0;
  _$jscoverage['/combobox/control.js'].lineData[676] = 0;
  _$jscoverage['/combobox/control.js'].lineData[677] = 0;
  _$jscoverage['/combobox/control.js'].lineData[679] = 0;
  _$jscoverage['/combobox/control.js'].lineData[680] = 0;
  _$jscoverage['/combobox/control.js'].lineData[684] = 0;
  _$jscoverage['/combobox/control.js'].lineData[685] = 0;
  _$jscoverage['/combobox/control.js'].lineData[686] = 0;
  _$jscoverage['/combobox/control.js'].lineData[688] = 0;
  _$jscoverage['/combobox/control.js'].lineData[690] = 0;
  _$jscoverage['/combobox/control.js'].lineData[691] = 0;
  _$jscoverage['/combobox/control.js'].lineData[698] = 0;
  _$jscoverage['/combobox/control.js'].lineData[699] = 0;
  _$jscoverage['/combobox/control.js'].lineData[700] = 0;
  _$jscoverage['/combobox/control.js'].lineData[701] = 0;
  _$jscoverage['/combobox/control.js'].lineData[702] = 0;
  _$jscoverage['/combobox/control.js'].lineData[706] = 0;
  _$jscoverage['/combobox/control.js'].lineData[707] = 0;
  _$jscoverage['/combobox/control.js'].lineData[714] = 0;
  _$jscoverage['/combobox/control.js'].lineData[715] = 0;
  _$jscoverage['/combobox/control.js'].lineData[724] = 0;
  _$jscoverage['/combobox/control.js'].lineData[726] = 0;
  _$jscoverage['/combobox/control.js'].lineData[728] = 0;
  _$jscoverage['/combobox/control.js'].lineData[729] = 0;
  _$jscoverage['/combobox/control.js'].lineData[732] = 0;
  _$jscoverage['/combobox/control.js'].lineData[733] = 0;
  _$jscoverage['/combobox/control.js'].lineData[734] = 0;
  _$jscoverage['/combobox/control.js'].lineData[735] = 0;
  _$jscoverage['/combobox/control.js'].lineData[738] = 0;
  _$jscoverage['/combobox/control.js'].lineData[741] = 0;
  _$jscoverage['/combobox/control.js'].lineData[743] = 0;
  _$jscoverage['/combobox/control.js'].lineData[744] = 0;
  _$jscoverage['/combobox/control.js'].lineData[745] = 0;
  _$jscoverage['/combobox/control.js'].lineData[746] = 0;
  _$jscoverage['/combobox/control.js'].lineData[747] = 0;
  _$jscoverage['/combobox/control.js'].lineData[748] = 0;
  _$jscoverage['/combobox/control.js'].lineData[754] = 0;
  _$jscoverage['/combobox/control.js'].lineData[755] = 0;
  _$jscoverage['/combobox/control.js'].lineData[756] = 0;
  _$jscoverage['/combobox/control.js'].lineData[757] = 0;
  _$jscoverage['/combobox/control.js'].lineData[758] = 0;
  _$jscoverage['/combobox/control.js'].lineData[762] = 0;
  _$jscoverage['/combobox/control.js'].lineData[764] = 0;
  _$jscoverage['/combobox/control.js'].lineData[766] = 0;
  _$jscoverage['/combobox/control.js'].lineData[772] = 0;
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
  _$jscoverage['/combobox/control.js'].functionData[34] = 0;
  _$jscoverage['/combobox/control.js'].functionData[35] = 0;
  _$jscoverage['/combobox/control.js'].functionData[36] = 0;
  _$jscoverage['/combobox/control.js'].functionData[37] = 0;
  _$jscoverage['/combobox/control.js'].functionData[38] = 0;
  _$jscoverage['/combobox/control.js'].functionData[39] = 0;
  _$jscoverage['/combobox/control.js'].functionData[40] = 0;
  _$jscoverage['/combobox/control.js'].functionData[41] = 0;
  _$jscoverage['/combobox/control.js'].functionData[42] = 0;
}
if (! _$jscoverage['/combobox/control.js'].branchData) {
  _$jscoverage['/combobox/control.js'].branchData = {};
  _$jscoverage['/combobox/control.js'].branchData['56'] = [];
  _$jscoverage['/combobox/control.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['77'] = [];
  _$jscoverage['/combobox/control.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['79'] = [];
  _$jscoverage['/combobox/control.js'].branchData['79'][1] = new BranchData();
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
  _$jscoverage['/combobox/control.js'].branchData['185'] = [];
  _$jscoverage['/combobox/control.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['185'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['185'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['208'] = [];
  _$jscoverage['/combobox/control.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['214'] = [];
  _$jscoverage['/combobox/control.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['216'] = [];
  _$jscoverage['/combobox/control.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['216'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['216'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['217'] = [];
  _$jscoverage['/combobox/control.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['218'] = [];
  _$jscoverage['/combobox/control.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['218'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['219'] = [];
  _$jscoverage['/combobox/control.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['232'] = [];
  _$jscoverage['/combobox/control.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['234'] = [];
  _$jscoverage['/combobox/control.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['243'] = [];
  _$jscoverage['/combobox/control.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['251'] = [];
  _$jscoverage['/combobox/control.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['251'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['255'] = [];
  _$jscoverage['/combobox/control.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['261'] = [];
  _$jscoverage['/combobox/control.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['261'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['261'][3] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['264'] = [];
  _$jscoverage['/combobox/control.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['277'] = [];
  _$jscoverage['/combobox/control.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['304'] = [];
  _$jscoverage['/combobox/control.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['309'] = [];
  _$jscoverage['/combobox/control.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['310'] = [];
  _$jscoverage['/combobox/control.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['314'] = [];
  _$jscoverage['/combobox/control.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['315'] = [];
  _$jscoverage['/combobox/control.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['386'] = [];
  _$jscoverage['/combobox/control.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['461'] = [];
  _$jscoverage['/combobox/control.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['462'] = [];
  _$jscoverage['/combobox/control.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['469'] = [];
  _$jscoverage['/combobox/control.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['584'] = [];
  _$jscoverage['/combobox/control.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['585'] = [];
  _$jscoverage['/combobox/control.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['628'] = [];
  _$jscoverage['/combobox/control.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['628'][2] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['640'] = [];
  _$jscoverage['/combobox/control.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['649'] = [];
  _$jscoverage['/combobox/control.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['652'] = [];
  _$jscoverage['/combobox/control.js'].branchData['652'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['653'] = [];
  _$jscoverage['/combobox/control.js'].branchData['653'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['662'] = [];
  _$jscoverage['/combobox/control.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['674'] = [];
  _$jscoverage['/combobox/control.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['685'] = [];
  _$jscoverage['/combobox/control.js'].branchData['685'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['690'] = [];
  _$jscoverage['/combobox/control.js'].branchData['690'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['700'] = [];
  _$jscoverage['/combobox/control.js'].branchData['700'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['732'] = [];
  _$jscoverage['/combobox/control.js'].branchData['732'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['733'] = [];
  _$jscoverage['/combobox/control.js'].branchData['733'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['743'] = [];
  _$jscoverage['/combobox/control.js'].branchData['743'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['744'] = [];
  _$jscoverage['/combobox/control.js'].branchData['744'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['745'] = [];
  _$jscoverage['/combobox/control.js'].branchData['745'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['754'] = [];
  _$jscoverage['/combobox/control.js'].branchData['754'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['755'] = [];
  _$jscoverage['/combobox/control.js'].branchData['755'][1] = new BranchData();
  _$jscoverage['/combobox/control.js'].branchData['756'] = [];
  _$jscoverage['/combobox/control.js'].branchData['756'][1] = new BranchData();
}
_$jscoverage['/combobox/control.js'].branchData['756'][1].init(26, 28, '!children[i].get(\'disabled\')');
function visit79_756_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['756'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['755'][1].init(30, 19, 'i < children.length');
function visit78_755_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['755'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['754'][1].init(767, 43, '!matchVal && self.get(\'autoHighlightFirst\')');
function visit77_754_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['754'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['745'][1].init(26, 38, 'children[i].get(\'textContent\') === val');
function visit76_745_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['745'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['744'][1].init(30, 19, 'i < children.length');
function visit75_744_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['744'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['743'][1].init(317, 30, 'self.get(\'highlightMatchItem\')');
function visit74_743_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['743'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['733'][1].init(26, 15, 'i < data.length');
function visit73_733_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['733'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['732'][1].init(426, 19, 'data && data.length');
function visit72_732_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['732'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['700'][1].init(59, 1, 't');
function visit71_700_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['700'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['690'][1].init(50, 26, 'self._focusoutDismissTimer');
function visit70_690_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['690'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['685'][1].init(14, 26, 'self._focusoutDismissTimer');
function visit69_685_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['685'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['674'][1].init(145, 5, 'error');
function visit68_674_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['662'][1].init(96, 15, 'item.isMenuItem');
function visit67_662_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['653'][1].init(69, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit66_653_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['652'][1].init(113, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit65_652_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['649'][1].init(78, 19, 'menu.get(\'visible\')');
function visit64_649_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['640'][1].init(571, 24, 'self.get(\'matchElWidth\')');
function visit63_640_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['628'][2].init(108, 17, 'menu === e.target');
function visit62_628_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['628'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['628'][1].init(102, 23, '!e || menu === e.target');
function visit61_628_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['585'][1].init(18, 28, '!children[i].get(\'disabled\')');
function visit60_585_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['584'][1].init(26, 19, 'i < children.length');
function visit59_584_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['469'][1].init(26, 11, 'm.isControl');
function visit58_469_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['462'][1].init(37, 23, 'v.xclass || \'popupmenu\'');
function visit57_462_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['461'][1].init(26, 12, '!v.isControl');
function visit56_461_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['386'][1].init(95, 33, 'placeHolder && placeHolder.html()');
function visit55_386_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['315'][1].init(81, 49, 'parseInt(menuEl.css(\'borderRightWidth\'), 10) || 0');
function visit54_315_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['314'][1].init(43, 48, 'parseInt(menuEl.css(\'borderLeftWidth\'), 10) || 0');
function visit53_314_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['310'][1].init(26, 24, 'self.get(\'matchElWidth\')');
function visit52_310_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['309'][1].init(107, 20, '!menu.get(\'visible\')');
function visit51_309_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['304'][1].init(122, 1, 'v');
function visit50_304_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['277'][1].init(149, 9, 'validator');
function visit49_277_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['264'][1].init(125, 15, 'v !== undefined');
function visit48_264_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['261'][3].init(2752, 22, 'keyCode === KeyCode.UP');
function visit47_261_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['261'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['261'][2].init(2724, 24, 'keyCode === KeyCode.DOWN');
function visit46_261_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['261'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['261'][1].init(2724, 50, 'keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit45_261_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['255'][1].init(200, 20, 'self.get(\'multiple\')');
function visit44_255_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['251'][2].init(1919, 23, 'keyCode === KeyCode.TAB');
function visit43_251_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['251'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['251'][1].init(1919, 42, 'keyCode === KeyCode.TAB && highlightedItem');
function visit42_251_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['243'][1].init(1519, 90, 'updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP])');
function visit41_243_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['234'][1].init(76, 19, 'updateInputOnDownUp');
function visit40_234_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['232'][1].init(1042, 23, 'keyCode === KeyCode.ESC');
function visit39_232_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['219'][1].init(50, 53, 'highlightedItem === getFirstEnabledItem(menuChildren)');
function visit38_219_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['218'][2].init(244, 22, 'keyCode === KeyCode.UP');
function visit37_218_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['218'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['218'][1].init(153, 104, 'keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit36_218_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['217'][1].init(52, 72, 'highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit35_217_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['216'][3].init(88, 24, 'keyCode === KeyCode.DOWN');
function visit34_216_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['216'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['216'][2].init(88, 125, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse())');
function visit33_216_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['216'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['216'][1].init(88, 258, 'keyCode === KeyCode.DOWN && highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()) || keyCode === KeyCode.UP && highlightedItem === getFirstEnabledItem(menuChildren)');
function visit32_216_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['214'][1].init(233, 38, 'updateInputOnDownUp && highlightedItem');
function visit31_214_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['208'][1].init(368, 19, 'menu.get(\'visible\')');
function visit30_208_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['185'][3].init(690, 21, 'clearEl[0] === target');
function visit29_185_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['185'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['185'][2].init(690, 49, 'clearEl[0] === target || clearEl.contains(target)');
function visit28_185_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['185'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['185'][1].init(678, 62, 'clearEl && (clearEl[0] === target || clearEl.contains(target))');
function visit27_185_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['176'][1].init(22, 21, 'self.get(\'collapsed\')');
function visit26_176_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['175'][3].init(255, 21, 'trigger[0] === target');
function visit25_175_3(result) {
  _$jscoverage['/combobox/control.js'].branchData['175'][3].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['175'][2].init(255, 49, 'trigger[0] === target || trigger.contains(target)');
function visit24_175_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['175'][1].init(243, 62, 'trigger && (trigger[0] === target || trigger.contains(target))');
function visit23_175_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['163'][1].init(605, 35, 'placeholderEl && !self.get(\'value\')');
function visit22_163_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['155'][2].init(55, 25, 'val === self.get(\'value\')');
function visit21_155_2(result) {
  _$jscoverage['/combobox/control.js'].branchData['155'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['155'][1].init(30, 51, '!self.get(\'focused\') && (val === self.get(\'value\'))');
function visit20_155_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['154'][1].init(26, 5, 'error');
function visit19_154_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['152'][1].init(170, 21, 'self.get(\'invalidEl\')');
function visit18_152_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['139'][1].init(118, 21, 'self.get(\'invalidEl\')');
function visit17_139_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['124'][1].init(127, 19, 'value === undefined');
function visit16_124_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['121'][1].init(130, 20, 'e.causedByInputEvent');
function visit15_121_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['85'][1].init(337, 15, 'i < data.length');
function visit14_85_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['79'][1].init(87, 18, 'self.get(\'format\')');
function visit13_79_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['77'][1].init(84, 19, 'data && data.length');
function visit12_77_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].branchData['56'][1].init(520, 20, 'menu.get(\'rendered\')');
function visit11_56_1(result) {
  _$jscoverage['/combobox/control.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/combobox/control.js'].functionData[0]++;
  _$jscoverage['/combobox/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/combobox/control.js'].lineData[8]++;
  var Control = require('component/control');
  _$jscoverage['/combobox/control.js'].lineData[9]++;
  var ComboboxTpl = require('./combobox-xtpl');
  _$jscoverage['/combobox/control.js'].lineData[11]++;
  require('menu');
  _$jscoverage['/combobox/control.js'].lineData[13]++;
  var ComboBox, KeyCode = Node.KeyCode;
  _$jscoverage['/combobox/control.js'].lineData[22]++;
  ComboBox = Control.extend({
  initializer: function() {
  _$jscoverage['/combobox/control.js'].functionData[1]++;
  _$jscoverage['/combobox/control.js'].lineData[28]++;
  this.publish('afterRenderData', {
  bubbles: false});
}, 
  _savedValue: null, 
  bindUI: function() {
  _$jscoverage['/combobox/control.js'].functionData[2]++;
  _$jscoverage['/combobox/control.js'].lineData[39]++;
  var self = this, input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[42]++;
  input.on('input', onValueChange, self);
  _$jscoverage['/combobox/control.js'].lineData[52]++;
  self.on('click', onMenuItemClick, self);
  _$jscoverage['/combobox/control.js'].lineData[54]++;
  var menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[56]++;
  if (visit11_56_1(menu.get('rendered'))) {
    _$jscoverage['/combobox/control.js'].lineData[57]++;
    onMenuAfterRenderUI.call(self);
  } else {
    _$jscoverage['/combobox/control.js'].lineData[59]++;
    menu.on('afterRenderUI', onMenuAfterRenderUI, self);
  }
}, 
  destructor: function() {
  _$jscoverage['/combobox/control.js'].functionData[3]++;
  _$jscoverage['/combobox/control.js'].lineData[64]++;
  var self = this;
  _$jscoverage['/combobox/control.js'].lineData[65]++;
  self.get('menu').destroy();
  _$jscoverage['/combobox/control.js'].lineData[66]++;
  self.$el.getWindow().detach('resize', onWindowResize, self);
}, 
  normalizeData: function(data) {
  _$jscoverage['/combobox/control.js'].functionData[4]++;
  _$jscoverage['/combobox/control.js'].lineData[75]++;
  var self = this, contents, v, i, c;
  _$jscoverage['/combobox/control.js'].lineData[77]++;
  if (visit12_77_1(data && data.length)) {
    _$jscoverage['/combobox/control.js'].lineData[78]++;
    data = data.slice(0, self.get('maxItemCount'));
    _$jscoverage['/combobox/control.js'].lineData[79]++;
    if (visit13_79_1(self.get('format'))) {
      _$jscoverage['/combobox/control.js'].lineData[80]++;
      contents = self.get('format').call(self, self.getCurrentValue(), data);
    } else {
      _$jscoverage['/combobox/control.js'].lineData[83]++;
      contents = [];
    }
    _$jscoverage['/combobox/control.js'].lineData[85]++;
    for (i = 0; visit14_85_1(i < data.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[86]++;
      v = data[i];
      _$jscoverage['/combobox/control.js'].lineData[87]++;
      c = contents[i] = S.mix({
  content: v, 
  textContent: v, 
  value: v}, contents[i]);
    }
    _$jscoverage['/combobox/control.js'].lineData[93]++;
    return contents;
  }
  _$jscoverage['/combobox/control.js'].lineData[95]++;
  return contents;
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
  var self = this, target, clearEl, trigger;
  _$jscoverage['/combobox/control.js'].lineData[171]++;
  self.callSuper(e);
  _$jscoverage['/combobox/control.js'].lineData[172]++;
  target = e.target;
  _$jscoverage['/combobox/control.js'].lineData[173]++;
  trigger = self.get('trigger');
  _$jscoverage['/combobox/control.js'].lineData[174]++;
  clearEl = self.get('clearEl');
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
  } else {
    _$jscoverage['/combobox/control.js'].lineData[185]++;
    if (visit27_185_1(clearEl && (visit28_185_2(visit29_185_3(clearEl[0] === target) || clearEl.contains(target))))) {
      _$jscoverage['/combobox/control.js'].lineData[186]++;
      self.get('input').val('');
      _$jscoverage['/combobox/control.js'].lineData[188]++;
      self.setCurrentValue('', {
  data: {
  causedByInputEvent: 1}});
    }
  }
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/combobox/control.js'].functionData[12]++;
  _$jscoverage['/combobox/control.js'].lineData[197]++;
  var self = this, updateInputOnDownUp, input, keyCode = e.keyCode, highlightedItem, handledByMenu, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[205]++;
  input = self.get('input');
  _$jscoverage['/combobox/control.js'].lineData[206]++;
  updateInputOnDownUp = self.get('updateInputOnDownUp');
  _$jscoverage['/combobox/control.js'].lineData[208]++;
  if (visit30_208_1(menu.get('visible'))) {
    _$jscoverage['/combobox/control.js'].lineData[210]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[214]++;
    if (visit31_214_1(updateInputOnDownUp && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[215]++;
      var menuChildren = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[216]++;
      if (visit32_216_1(visit33_216_2(visit34_216_3(keyCode === KeyCode.DOWN) && visit35_217_1(highlightedItem === getFirstEnabledItem(menuChildren.concat().reverse()))) || visit36_218_1(visit37_218_2(keyCode === KeyCode.UP) && visit38_219_1(highlightedItem === getFirstEnabledItem(menuChildren))))) {
        _$jscoverage['/combobox/control.js'].lineData[221]++;
        self.setCurrentValue(self._savedValue);
        _$jscoverage['/combobox/control.js'].lineData[222]++;
        highlightedItem.set('highlighted', false);
        _$jscoverage['/combobox/control.js'].lineData[223]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[227]++;
    handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/combobox/control.js'].lineData[229]++;
    highlightedItem = menu.get('highlightedItem');
    _$jscoverage['/combobox/control.js'].lineData[232]++;
    if (visit39_232_1(keyCode === KeyCode.ESC)) {
      _$jscoverage['/combobox/control.js'].lineData[233]++;
      self.set('collapsed', true);
      _$jscoverage['/combobox/control.js'].lineData[234]++;
      if (visit40_234_1(updateInputOnDownUp)) {
        _$jscoverage['/combobox/control.js'].lineData[238]++;
        self.setCurrentValue(self._savedValue);
      }
      _$jscoverage['/combobox/control.js'].lineData[240]++;
      return true;
    }
    _$jscoverage['/combobox/control.js'].lineData[243]++;
    if (visit41_243_1(updateInputOnDownUp && S.inArray(keyCode, [KeyCode.DOWN, KeyCode.UP]))) {
      _$jscoverage['/combobox/control.js'].lineData[246]++;
      self.setCurrentValue(highlightedItem.get('textContent'));
    }
    _$jscoverage['/combobox/control.js'].lineData[251]++;
    if (visit42_251_1(visit43_251_2(keyCode === KeyCode.TAB) && highlightedItem)) {
      _$jscoverage['/combobox/control.js'].lineData[253]++;
      highlightedItem.handleClickInternal(e);
      _$jscoverage['/combobox/control.js'].lineData[255]++;
      if (visit44_255_1(self.get('multiple'))) {
        _$jscoverage['/combobox/control.js'].lineData[256]++;
        return true;
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[260]++;
    return handledByMenu;
  } else {
    _$jscoverage['/combobox/control.js'].lineData[261]++;
    if (visit45_261_1(visit46_261_2(keyCode === KeyCode.DOWN) || visit47_261_3(keyCode === KeyCode.UP))) {
      _$jscoverage['/combobox/control.js'].lineData[263]++;
      var v = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[264]++;
      if (visit48_264_1(v !== undefined)) {
        _$jscoverage['/combobox/control.js'].lineData[265]++;
        self.sendRequest(v);
        _$jscoverage['/combobox/control.js'].lineData[266]++;
        return true;
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[269]++;
  return undefined;
}, 
  validate: function(callback) {
  _$jscoverage['/combobox/control.js'].functionData[13]++;
  _$jscoverage['/combobox/control.js'].lineData[273]++;
  var self = this, validator = self.get('validator'), val = self.getCurrentValue();
  _$jscoverage['/combobox/control.js'].lineData[277]++;
  if (visit49_277_1(validator)) {
    _$jscoverage['/combobox/control.js'].lineData[278]++;
    validator(val, function(error) {
  _$jscoverage['/combobox/control.js'].functionData[14]++;
  _$jscoverage['/combobox/control.js'].lineData[279]++;
  callback(error, val);
});
  } else {
    _$jscoverage['/combobox/control.js'].lineData[282]++;
    callback(false, val);
  }
}, 
  sendRequest: function(value) {
  _$jscoverage['/combobox/control.js'].functionData[15]++;
  _$jscoverage['/combobox/control.js'].lineData[291]++;
  var self = this, dataSource = self.get('dataSource');
  _$jscoverage['/combobox/control.js'].lineData[293]++;
  dataSource.fetchData(value, renderData, self);
}, 
  getKeyEventTarget: function() {
  _$jscoverage['/combobox/control.js'].functionData[16]++;
  _$jscoverage['/combobox/control.js'].lineData[297]++;
  return this.get('input');
}, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[17]++;
  _$jscoverage['/combobox/control.js'].lineData[301]++;
  var self = this, el = self.$el, menu = self.get('menu');
  _$jscoverage['/combobox/control.js'].lineData[304]++;
  if (visit50_304_1(v)) {
    _$jscoverage['/combobox/control.js'].lineData[305]++;
    menu.hide();
  } else {
    _$jscoverage['/combobox/control.js'].lineData[308]++;
    clearDismissTimer(self);
    _$jscoverage['/combobox/control.js'].lineData[309]++;
    if (visit51_309_1(!menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[310]++;
      if (visit52_310_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[311]++;
        menu.render();
        _$jscoverage['/combobox/control.js'].lineData[312]++;
        var menuEl = menu.get('el');
        _$jscoverage['/combobox/control.js'].lineData[313]++;
        var borderWidth = (visit53_314_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit54_315_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
        _$jscoverage['/combobox/control.js'].lineData[316]++;
        menu.set('width', el[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/combobox/control.js'].lineData[318]++;
      menu.show();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[321]++;
  this.get('input').attr('aria-expanded', !v);
}, 
  _onSetDisabled: function(v, e) {
  _$jscoverage['/combobox/control.js'].functionData[18]++;
  _$jscoverage['/combobox/control.js'].lineData[325]++;
  this.callSuper(v, e);
  _$jscoverage['/combobox/control.js'].lineData[326]++;
  this.get('input').attr('disabled', v);
}}, {
  ATTRS: {
  contentTpl: {
  value: ComboboxTpl}, 
  input: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[19]++;
  _$jscoverage['/combobox/control.js'].lineData[344]++;
  return ('.' + this.getBaseCssClass('input'));
}}, 
  value: {
  value: '', 
  sync: 0, 
  render: 1, 
  parse: function() {
  _$jscoverage['/combobox/control.js'].functionData[20]++;
  _$jscoverage['/combobox/control.js'].lineData[360]++;
  return this.get('input').val();
}}, 
  trigger: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[21]++;
  _$jscoverage['/combobox/control.js'].lineData[370]++;
  return '.' + this.getBaseCssClass('trigger');
}}, 
  placeholder: {
  render: 1, 
  sync: 0, 
  parse: function() {
  _$jscoverage['/combobox/control.js'].functionData[22]++;
  _$jscoverage['/combobox/control.js'].lineData[385]++;
  var placeHolder = this.get('placeholderEl');
  _$jscoverage['/combobox/control.js'].lineData[386]++;
  return visit55_386_1(placeHolder && placeHolder.html());
}}, 
  placeholderEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[23]++;
  _$jscoverage['/combobox/control.js'].lineData[396]++;
  return ('.' + this.getBaseCssClass('placeholder'));
}}, 
  clearEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[24]++;
  _$jscoverage['/combobox/control.js'].lineData[402]++;
  return ('.' + this.getBaseCssClass('clear'));
}}, 
  validator: {}, 
  invalidEl: {
  selector: function() {
  _$jscoverage['/combobox/control.js'].functionData[25]++;
  _$jscoverage['/combobox/control.js'].lineData[423]++;
  return '.' + this.getBaseCssClass('invalid-el');
}}, 
  allowTextSelection: {
  value: true}, 
  hasTrigger: {
  value: true, 
  sync: 0, 
  render: 1}, 
  menu: {
  value: {}, 
  getter: function(v) {
  _$jscoverage['/combobox/control.js'].functionData[26]++;
  _$jscoverage['/combobox/control.js'].lineData[461]++;
  if (visit56_461_1(!v.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[462]++;
    v.xclass = visit57_462_1(v.xclass || 'popupmenu');
    _$jscoverage['/combobox/control.js'].lineData[463]++;
    v = this.createComponent(v);
    _$jscoverage['/combobox/control.js'].lineData[464]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/combobox/control.js'].lineData[466]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/combobox/control.js'].functionData[27]++;
  _$jscoverage['/combobox/control.js'].lineData[469]++;
  if (visit58_469_1(m.isControl)) {
    _$jscoverage['/combobox/control.js'].lineData[470]++;
    m.setInternal('parent', this);
    _$jscoverage['/combobox/control.js'].lineData[471]++;
    var align = {
  node: this.$el, 
  points: ['bl', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/combobox/control.js'].lineData[479]++;
    S.mix(m.get('align'), align, false);
  }
}}, 
  collapsed: {
  render: 1, 
  sync: 0, 
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
  value: true}}, 
  xclass: 'combobox'});
  _$jscoverage['/combobox/control.js'].lineData[583]++;
  function getFirstEnabledItem(children) {
    _$jscoverage['/combobox/control.js'].functionData[28]++;
    _$jscoverage['/combobox/control.js'].lineData[584]++;
    for (var i = 0; visit59_584_1(i < children.length); i++) {
      _$jscoverage['/combobox/control.js'].lineData[585]++;
      if (visit60_585_1(!children[i].get('disabled'))) {
        _$jscoverage['/combobox/control.js'].lineData[586]++;
        return children[i];
      }
    }
    _$jscoverage['/combobox/control.js'].lineData[589]++;
    return null;
  }
  _$jscoverage['/combobox/control.js'].lineData[592]++;
  function onMenuFocusout() {
    _$jscoverage['/combobox/control.js'].functionData[29]++;
    _$jscoverage['/combobox/control.js'].lineData[593]++;
    delayHide(this);
  }
  _$jscoverage['/combobox/control.js'].lineData[596]++;
  function onMenuFocusin() {
    _$jscoverage['/combobox/control.js'].functionData[30]++;
    _$jscoverage['/combobox/control.js'].lineData[597]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[601]++;
    setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[31]++;
  _$jscoverage['/combobox/control.js'].lineData[602]++;
  clearDismissTimer(self);
}, 0);
  }
  _$jscoverage['/combobox/control.js'].lineData[606]++;
  function onMenuMouseOver() {
    _$jscoverage['/combobox/control.js'].functionData[32]++;
    _$jscoverage['/combobox/control.js'].lineData[607]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[609]++;
    self.focus();
    _$jscoverage['/combobox/control.js'].lineData[611]++;
    clearDismissTimer(self);
  }
  _$jscoverage['/combobox/control.js'].lineData[614]++;
  function onMenuMouseDown() {
    _$jscoverage['/combobox/control.js'].functionData[33]++;
    _$jscoverage['/combobox/control.js'].lineData[615]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[619]++;
    self.setCurrentValue(self.getCurrentValue(), {
  force: 1});
  }
  _$jscoverage['/combobox/control.js'].lineData[624]++;
  function onMenuAfterRenderUI(e) {
    _$jscoverage['/combobox/control.js'].functionData[34]++;
    _$jscoverage['/combobox/control.js'].lineData[625]++;
    var self = this, contentEl;
    _$jscoverage['/combobox/control.js'].lineData[627]++;
    var menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[628]++;
    if (visit61_628_1(!e || visit62_628_2(menu === e.target))) {
      _$jscoverage['/combobox/control.js'].lineData[629]++;
      var input = self.get('input');
      _$jscoverage['/combobox/control.js'].lineData[630]++;
      var el = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[631]++;
      contentEl = menu.get('contentEl');
      _$jscoverage['/combobox/control.js'].lineData[632]++;
      input.attr('aria-owns', el.attr('id'));
      _$jscoverage['/combobox/control.js'].lineData[634]++;
      el.on('focusout', onMenuFocusout, self);
      _$jscoverage['/combobox/control.js'].lineData[635]++;
      el.on('focusin', onMenuFocusin, self);
      _$jscoverage['/combobox/control.js'].lineData[636]++;
      contentEl.on('mouseover', onMenuMouseOver, self);
      _$jscoverage['/combobox/control.js'].lineData[639]++;
      contentEl.on('mousedown', onMenuMouseDown, self);
      _$jscoverage['/combobox/control.js'].lineData[640]++;
      if (visit63_640_1(self.get('matchElWidth'))) {
        _$jscoverage['/combobox/control.js'].lineData[641]++;
        el.getWindow().on('resize', onWindowResize, self);
      }
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[646]++;
  function onWindowResize() {
    _$jscoverage['/combobox/control.js'].functionData[35]++;
    _$jscoverage['/combobox/control.js'].lineData[647]++;
    var self = this;
    _$jscoverage['/combobox/control.js'].lineData[648]++;
    var menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[649]++;
    if (visit64_649_1(menu.get('visible'))) {
      _$jscoverage['/combobox/control.js'].lineData[650]++;
      var el = self.get('el');
      _$jscoverage['/combobox/control.js'].lineData[651]++;
      var menuEl = menu.get('el');
      _$jscoverage['/combobox/control.js'].lineData[652]++;
      var borderWidth = (visit65_652_1(parseInt(menuEl.css('borderLeftWidth'), 10) || 0)) + (visit66_653_1(parseInt(menuEl.css('borderRightWidth'), 10) || 0));
      _$jscoverage['/combobox/control.js'].lineData[654]++;
      menu.set('width', el[0].offsetWidth - borderWidth);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[658]++;
  function onMenuItemClick(e) {
    _$jscoverage['/combobox/control.js'].functionData[36]++;
    _$jscoverage['/combobox/control.js'].lineData[659]++;
    var item = e.target, self = this, textContent;
    _$jscoverage['/combobox/control.js'].lineData[662]++;
    if (visit67_662_1(item.isMenuItem)) {
      _$jscoverage['/combobox/control.js'].lineData[663]++;
      textContent = item.get('textContent');
      _$jscoverage['/combobox/control.js'].lineData[664]++;
      self.setCurrentValue(textContent);
      _$jscoverage['/combobox/control.js'].lineData[665]++;
      self._savedValue = textContent;
      _$jscoverage['/combobox/control.js'].lineData[666]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[670]++;
  function setInvalid(self, error) {
    _$jscoverage['/combobox/control.js'].functionData[37]++;
    _$jscoverage['/combobox/control.js'].lineData[671]++;
    var $el = self.$el, cls = self.getBaseCssClasses('invalid'), invalidEl = self.get('invalidEl');
    _$jscoverage['/combobox/control.js'].lineData[674]++;
    if (visit68_674_1(error)) {
      _$jscoverage['/combobox/control.js'].lineData[675]++;
      $el.addClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[676]++;
      invalidEl.attr('title', error);
      _$jscoverage['/combobox/control.js'].lineData[677]++;
      invalidEl.show();
    } else {
      _$jscoverage['/combobox/control.js'].lineData[679]++;
      $el.removeClass(cls);
      _$jscoverage['/combobox/control.js'].lineData[680]++;
      invalidEl.hide();
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[684]++;
  function delayHide(self) {
    _$jscoverage['/combobox/control.js'].functionData[38]++;
    _$jscoverage['/combobox/control.js'].lineData[685]++;
    if (visit69_685_1(self._focusoutDismissTimer)) {
      _$jscoverage['/combobox/control.js'].lineData[686]++;
      return;
    }
    _$jscoverage['/combobox/control.js'].lineData[688]++;
    self._focusoutDismissTimer = setTimeout(function() {
  _$jscoverage['/combobox/control.js'].functionData[39]++;
  _$jscoverage['/combobox/control.js'].lineData[690]++;
  if (visit70_690_1(self._focusoutDismissTimer)) {
    _$jscoverage['/combobox/control.js'].lineData[691]++;
    self.set('collapsed', true);
  }
}, 50);
  }
  _$jscoverage['/combobox/control.js'].lineData[698]++;
  function clearDismissTimer(self) {
    _$jscoverage['/combobox/control.js'].functionData[40]++;
    _$jscoverage['/combobox/control.js'].lineData[699]++;
    var t = self._focusoutDismissTimer;
    _$jscoverage['/combobox/control.js'].lineData[700]++;
    if (visit71_700_1(t)) {
      _$jscoverage['/combobox/control.js'].lineData[701]++;
      clearTimeout(t);
      _$jscoverage['/combobox/control.js'].lineData[702]++;
      self._focusoutDismissTimer = null;
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[706]++;
  function onValueChange(e) {
    _$jscoverage['/combobox/control.js'].functionData[41]++;
    _$jscoverage['/combobox/control.js'].lineData[707]++;
    this.setCurrentValue(e.target.value, {
  data: {
  causedByInputEvent: 1}});
  }
  _$jscoverage['/combobox/control.js'].lineData[714]++;
  function renderData(data) {
    _$jscoverage['/combobox/control.js'].functionData[42]++;
    _$jscoverage['/combobox/control.js'].lineData[715]++;
    var self = this, v, children = [], val, matchVal, highlightedItem, i, menu = self.get('menu');
    _$jscoverage['/combobox/control.js'].lineData[724]++;
    data = self.normalizeData(data);
    _$jscoverage['/combobox/control.js'].lineData[726]++;
    menu.removeChildren(true);
    _$jscoverage['/combobox/control.js'].lineData[728]++;
    if ((highlightedItem = menu.get('highlightedItem'))) {
      _$jscoverage['/combobox/control.js'].lineData[729]++;
      highlightedItem.set('highlighted', false);
    }
    _$jscoverage['/combobox/control.js'].lineData[732]++;
    if (visit72_732_1(data && data.length)) {
      _$jscoverage['/combobox/control.js'].lineData[733]++;
      for (i = 0; visit73_733_1(i < data.length); i++) {
        _$jscoverage['/combobox/control.js'].lineData[734]++;
        v = data[i];
        _$jscoverage['/combobox/control.js'].lineData[735]++;
        menu.addChild(v);
      }
      _$jscoverage['/combobox/control.js'].lineData[738]++;
      children = menu.get('children');
      _$jscoverage['/combobox/control.js'].lineData[741]++;
      val = self.getCurrentValue();
      _$jscoverage['/combobox/control.js'].lineData[743]++;
      if (visit74_743_1(self.get('highlightMatchItem'))) {
        _$jscoverage['/combobox/control.js'].lineData[744]++;
        for (i = 0; visit75_744_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[745]++;
          if (visit76_745_1(children[i].get('textContent') === val)) {
            _$jscoverage['/combobox/control.js'].lineData[746]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[747]++;
            matchVal = true;
            _$jscoverage['/combobox/control.js'].lineData[748]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[754]++;
      if (visit77_754_1(!matchVal && self.get('autoHighlightFirst'))) {
        _$jscoverage['/combobox/control.js'].lineData[755]++;
        for (i = 0; visit78_755_1(i < children.length); i++) {
          _$jscoverage['/combobox/control.js'].lineData[756]++;
          if (visit79_756_1(!children[i].get('disabled'))) {
            _$jscoverage['/combobox/control.js'].lineData[757]++;
            children[i].set('highlighted', true);
            _$jscoverage['/combobox/control.js'].lineData[758]++;
            break;
          }
        }
      }
      _$jscoverage['/combobox/control.js'].lineData[762]++;
      self.set('collapsed', false);
      _$jscoverage['/combobox/control.js'].lineData[764]++;
      self.fire('afterRenderData');
    } else {
      _$jscoverage['/combobox/control.js'].lineData[766]++;
      self.set('collapsed', true);
    }
  }
  _$jscoverage['/combobox/control.js'].lineData[772]++;
  return ComboBox;
});
