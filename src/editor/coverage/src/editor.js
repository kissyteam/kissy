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
if (! _$jscoverage['/editor.js']) {
  _$jscoverage['/editor.js'] = {};
  _$jscoverage['/editor.js'].lineData = [];
  _$jscoverage['/editor.js'].lineData[6] = 0;
  _$jscoverage['/editor.js'].lineData[7] = 0;
  _$jscoverage['/editor.js'].lineData[8] = 0;
  _$jscoverage['/editor.js'].lineData[9] = 0;
  _$jscoverage['/editor.js'].lineData[10] = 0;
  _$jscoverage['/editor.js'].lineData[11] = 0;
  _$jscoverage['/editor.js'].lineData[12] = 0;
  _$jscoverage['/editor.js'].lineData[13] = 0;
  _$jscoverage['/editor.js'].lineData[14] = 0;
  _$jscoverage['/editor.js'].lineData[15] = 0;
  _$jscoverage['/editor.js'].lineData[16] = 0;
  _$jscoverage['/editor.js'].lineData[17] = 0;
  _$jscoverage['/editor.js'].lineData[18] = 0;
  _$jscoverage['/editor.js'].lineData[19] = 0;
  _$jscoverage['/editor.js'].lineData[20] = 0;
  _$jscoverage['/editor.js'].lineData[21] = 0;
  _$jscoverage['/editor.js'].lineData[22] = 0;
  _$jscoverage['/editor.js'].lineData[45] = 0;
  _$jscoverage['/editor.js'].lineData[50] = 0;
  _$jscoverage['/editor.js'].lineData[52] = 0;
  _$jscoverage['/editor.js'].lineData[53] = 0;
  _$jscoverage['/editor.js'].lineData[56] = 0;
  _$jscoverage['/editor.js'].lineData[58] = 0;
  _$jscoverage['/editor.js'].lineData[60] = 0;
  _$jscoverage['/editor.js'].lineData[61] = 0;
  _$jscoverage['/editor.js'].lineData[64] = 0;
  _$jscoverage['/editor.js'].lineData[66] = 0;
  _$jscoverage['/editor.js'].lineData[67] = 0;
  _$jscoverage['/editor.js'].lineData[68] = 0;
  _$jscoverage['/editor.js'].lineData[70] = 0;
  _$jscoverage['/editor.js'].lineData[75] = 0;
  _$jscoverage['/editor.js'].lineData[76] = 0;
  _$jscoverage['/editor.js'].lineData[77] = 0;
  _$jscoverage['/editor.js'].lineData[78] = 0;
  _$jscoverage['/editor.js'].lineData[79] = 0;
  _$jscoverage['/editor.js'].lineData[83] = 0;
  _$jscoverage['/editor.js'].lineData[88] = 0;
  _$jscoverage['/editor.js'].lineData[91] = 0;
  _$jscoverage['/editor.js'].lineData[94] = 0;
  _$jscoverage['/editor.js'].lineData[95] = 0;
  _$jscoverage['/editor.js'].lineData[97] = 0;
  _$jscoverage['/editor.js'].lineData[98] = 0;
  _$jscoverage['/editor.js'].lineData[101] = 0;
  _$jscoverage['/editor.js'].lineData[102] = 0;
  _$jscoverage['/editor.js'].lineData[103] = 0;
  _$jscoverage['/editor.js'].lineData[108] = 0;
  _$jscoverage['/editor.js'].lineData[110] = 0;
  _$jscoverage['/editor.js'].lineData[111] = 0;
  _$jscoverage['/editor.js'].lineData[114] = 0;
  _$jscoverage['/editor.js'].lineData[115] = 0;
  _$jscoverage['/editor.js'].lineData[120] = 0;
  _$jscoverage['/editor.js'].lineData[127] = 0;
  _$jscoverage['/editor.js'].lineData[128] = 0;
  _$jscoverage['/editor.js'].lineData[136] = 0;
  _$jscoverage['/editor.js'].lineData[144] = 0;
  _$jscoverage['/editor.js'].lineData[153] = 0;
  _$jscoverage['/editor.js'].lineData[163] = 0;
  _$jscoverage['/editor.js'].lineData[164] = 0;
  _$jscoverage['/editor.js'].lineData[166] = 0;
  _$jscoverage['/editor.js'].lineData[167] = 0;
  _$jscoverage['/editor.js'].lineData[181] = 0;
  _$jscoverage['/editor.js'].lineData[190] = 0;
  _$jscoverage['/editor.js'].lineData[200] = 0;
  _$jscoverage['/editor.js'].lineData[203] = 0;
  _$jscoverage['/editor.js'].lineData[204] = 0;
  _$jscoverage['/editor.js'].lineData[205] = 0;
  _$jscoverage['/editor.js'].lineData[206] = 0;
  _$jscoverage['/editor.js'].lineData[208] = 0;
  _$jscoverage['/editor.js'].lineData[209] = 0;
  _$jscoverage['/editor.js'].lineData[219] = 0;
  _$jscoverage['/editor.js'].lineData[223] = 0;
  _$jscoverage['/editor.js'].lineData[226] = 0;
  _$jscoverage['/editor.js'].lineData[228] = 0;
  _$jscoverage['/editor.js'].lineData[229] = 0;
  _$jscoverage['/editor.js'].lineData[231] = 0;
  _$jscoverage['/editor.js'].lineData[232] = 0;
  _$jscoverage['/editor.js'].lineData[235] = 0;
  _$jscoverage['/editor.js'].lineData[236] = 0;
  _$jscoverage['/editor.js'].lineData[247] = 0;
  _$jscoverage['/editor.js'].lineData[250] = 0;
  _$jscoverage['/editor.js'].lineData[251] = 0;
  _$jscoverage['/editor.js'].lineData[253] = 0;
  _$jscoverage['/editor.js'].lineData[254] = 0;
  _$jscoverage['/editor.js'].lineData[256] = 0;
  _$jscoverage['/editor.js'].lineData[259] = 0;
  _$jscoverage['/editor.js'].lineData[260] = 0;
  _$jscoverage['/editor.js'].lineData[262] = 0;
  _$jscoverage['/editor.js'].lineData[264] = 0;
  _$jscoverage['/editor.js'].lineData[268] = 0;
  _$jscoverage['/editor.js'].lineData[269] = 0;
  _$jscoverage['/editor.js'].lineData[271] = 0;
  _$jscoverage['/editor.js'].lineData[281] = 0;
  _$jscoverage['/editor.js'].lineData[289] = 0;
  _$jscoverage['/editor.js'].lineData[290] = 0;
  _$jscoverage['/editor.js'].lineData[299] = 0;
  _$jscoverage['/editor.js'].lineData[308] = 0;
  _$jscoverage['/editor.js'].lineData[312] = 0;
  _$jscoverage['/editor.js'].lineData[313] = 0;
  _$jscoverage['/editor.js'].lineData[314] = 0;
  _$jscoverage['/editor.js'].lineData[315] = 0;
  _$jscoverage['/editor.js'].lineData[316] = 0;
  _$jscoverage['/editor.js'].lineData[318] = 0;
  _$jscoverage['/editor.js'].lineData[326] = 0;
  _$jscoverage['/editor.js'].lineData[329] = 0;
  _$jscoverage['/editor.js'].lineData[330] = 0;
  _$jscoverage['/editor.js'].lineData[332] = 0;
  _$jscoverage['/editor.js'].lineData[333] = 0;
  _$jscoverage['/editor.js'].lineData[335] = 0;
  _$jscoverage['/editor.js'].lineData[338] = 0;
  _$jscoverage['/editor.js'].lineData[339] = 0;
  _$jscoverage['/editor.js'].lineData[344] = 0;
  _$jscoverage['/editor.js'].lineData[345] = 0;
  _$jscoverage['/editor.js'].lineData[348] = 0;
  _$jscoverage['/editor.js'].lineData[349] = 0;
  _$jscoverage['/editor.js'].lineData[353] = 0;
  _$jscoverage['/editor.js'].lineData[361] = 0;
  _$jscoverage['/editor.js'].lineData[363] = 0;
  _$jscoverage['/editor.js'].lineData[364] = 0;
  _$jscoverage['/editor.js'].lineData[374] = 0;
  _$jscoverage['/editor.js'].lineData[377] = 0;
  _$jscoverage['/editor.js'].lineData[378] = 0;
  _$jscoverage['/editor.js'].lineData[379] = 0;
  _$jscoverage['/editor.js'].lineData[380] = 0;
  _$jscoverage['/editor.js'].lineData[390] = 0;
  _$jscoverage['/editor.js'].lineData[399] = 0;
  _$jscoverage['/editor.js'].lineData[402] = 0;
  _$jscoverage['/editor.js'].lineData[403] = 0;
  _$jscoverage['/editor.js'].lineData[404] = 0;
  _$jscoverage['/editor.js'].lineData[405] = 0;
  _$jscoverage['/editor.js'].lineData[406] = 0;
  _$jscoverage['/editor.js'].lineData[407] = 0;
  _$jscoverage['/editor.js'].lineData[416] = 0;
  _$jscoverage['/editor.js'].lineData[419] = 0;
  _$jscoverage['/editor.js'].lineData[420] = 0;
  _$jscoverage['/editor.js'].lineData[421] = 0;
  _$jscoverage['/editor.js'].lineData[424] = 0;
  _$jscoverage['/editor.js'].lineData[426] = 0;
  _$jscoverage['/editor.js'].lineData[427] = 0;
  _$jscoverage['/editor.js'].lineData[438] = 0;
  _$jscoverage['/editor.js'].lineData[439] = 0;
  _$jscoverage['/editor.js'].lineData[440] = 0;
  _$jscoverage['/editor.js'].lineData[441] = 0;
  _$jscoverage['/editor.js'].lineData[451] = 0;
  _$jscoverage['/editor.js'].lineData[460] = 0;
  _$jscoverage['/editor.js'].lineData[461] = 0;
  _$jscoverage['/editor.js'].lineData[462] = 0;
  _$jscoverage['/editor.js'].lineData[465] = 0;
  _$jscoverage['/editor.js'].lineData[466] = 0;
  _$jscoverage['/editor.js'].lineData[467] = 0;
  _$jscoverage['/editor.js'].lineData[468] = 0;
  _$jscoverage['/editor.js'].lineData[470] = 0;
  _$jscoverage['/editor.js'].lineData[471] = 0;
  _$jscoverage['/editor.js'].lineData[472] = 0;
  _$jscoverage['/editor.js'].lineData[488] = 0;
  _$jscoverage['/editor.js'].lineData[489] = 0;
  _$jscoverage['/editor.js'].lineData[490] = 0;
  _$jscoverage['/editor.js'].lineData[499] = 0;
  _$jscoverage['/editor.js'].lineData[501] = 0;
  _$jscoverage['/editor.js'].lineData[502] = 0;
  _$jscoverage['/editor.js'].lineData[505] = 0;
  _$jscoverage['/editor.js'].lineData[507] = 0;
  _$jscoverage['/editor.js'].lineData[521] = 0;
  _$jscoverage['/editor.js'].lineData[522] = 0;
  _$jscoverage['/editor.js'].lineData[525] = 0;
  _$jscoverage['/editor.js'].lineData[527] = 0;
  _$jscoverage['/editor.js'].lineData[528] = 0;
  _$jscoverage['/editor.js'].lineData[531] = 0;
  _$jscoverage['/editor.js'].lineData[532] = 0;
  _$jscoverage['/editor.js'].lineData[535] = 0;
  _$jscoverage['/editor.js'].lineData[536] = 0;
  _$jscoverage['/editor.js'].lineData[540] = 0;
  _$jscoverage['/editor.js'].lineData[541] = 0;
  _$jscoverage['/editor.js'].lineData[544] = 0;
  _$jscoverage['/editor.js'].lineData[547] = 0;
  _$jscoverage['/editor.js'].lineData[548] = 0;
  _$jscoverage['/editor.js'].lineData[549] = 0;
  _$jscoverage['/editor.js'].lineData[550] = 0;
  _$jscoverage['/editor.js'].lineData[553] = 0;
  _$jscoverage['/editor.js'].lineData[556] = 0;
  _$jscoverage['/editor.js'].lineData[559] = 0;
  _$jscoverage['/editor.js'].lineData[560] = 0;
  _$jscoverage['/editor.js'].lineData[563] = 0;
  _$jscoverage['/editor.js'].lineData[564] = 0;
  _$jscoverage['/editor.js'].lineData[570] = 0;
  _$jscoverage['/editor.js'].lineData[571] = 0;
  _$jscoverage['/editor.js'].lineData[581] = 0;
  _$jscoverage['/editor.js'].lineData[585] = 0;
  _$jscoverage['/editor.js'].lineData[586] = 0;
  _$jscoverage['/editor.js'].lineData[589] = 0;
  _$jscoverage['/editor.js'].lineData[590] = 0;
  _$jscoverage['/editor.js'].lineData[593] = 0;
  _$jscoverage['/editor.js'].lineData[594] = 0;
  _$jscoverage['/editor.js'].lineData[598] = 0;
  _$jscoverage['/editor.js'].lineData[599] = 0;
  _$jscoverage['/editor.js'].lineData[600] = 0;
  _$jscoverage['/editor.js'].lineData[601] = 0;
  _$jscoverage['/editor.js'].lineData[603] = 0;
  _$jscoverage['/editor.js'].lineData[604] = 0;
  _$jscoverage['/editor.js'].lineData[606] = 0;
  _$jscoverage['/editor.js'].lineData[613] = 0;
  _$jscoverage['/editor.js'].lineData[616] = 0;
  _$jscoverage['/editor.js'].lineData[621] = 0;
  _$jscoverage['/editor.js'].lineData[622] = 0;
  _$jscoverage['/editor.js'].lineData[623] = 0;
  _$jscoverage['/editor.js'].lineData[624] = 0;
  _$jscoverage['/editor.js'].lineData[625] = 0;
  _$jscoverage['/editor.js'].lineData[627] = 0;
  _$jscoverage['/editor.js'].lineData[630] = 0;
  _$jscoverage['/editor.js'].lineData[631] = 0;
  _$jscoverage['/editor.js'].lineData[632] = 0;
  _$jscoverage['/editor.js'].lineData[633] = 0;
  _$jscoverage['/editor.js'].lineData[634] = 0;
  _$jscoverage['/editor.js'].lineData[635] = 0;
  _$jscoverage['/editor.js'].lineData[640] = 0;
  _$jscoverage['/editor.js'].lineData[641] = 0;
  _$jscoverage['/editor.js'].lineData[643] = 0;
  _$jscoverage['/editor.js'].lineData[648] = 0;
  _$jscoverage['/editor.js'].lineData[652] = 0;
  _$jscoverage['/editor.js'].lineData[655] = 0;
  _$jscoverage['/editor.js'].lineData[656] = 0;
  _$jscoverage['/editor.js'].lineData[657] = 0;
  _$jscoverage['/editor.js'].lineData[658] = 0;
  _$jscoverage['/editor.js'].lineData[661] = 0;
  _$jscoverage['/editor.js'].lineData[662] = 0;
  _$jscoverage['/editor.js'].lineData[663] = 0;
  _$jscoverage['/editor.js'].lineData[665] = 0;
  _$jscoverage['/editor.js'].lineData[666] = 0;
  _$jscoverage['/editor.js'].lineData[672] = 0;
  _$jscoverage['/editor.js'].lineData[674] = 0;
  _$jscoverage['/editor.js'].lineData[675] = 0;
  _$jscoverage['/editor.js'].lineData[680] = 0;
  _$jscoverage['/editor.js'].lineData[685] = 0;
  _$jscoverage['/editor.js'].lineData[688] = 0;
  _$jscoverage['/editor.js'].lineData[691] = 0;
  _$jscoverage['/editor.js'].lineData[692] = 0;
  _$jscoverage['/editor.js'].lineData[696] = 0;
  _$jscoverage['/editor.js'].lineData[698] = 0;
  _$jscoverage['/editor.js'].lineData[700] = 0;
  _$jscoverage['/editor.js'].lineData[702] = 0;
  _$jscoverage['/editor.js'].lineData[704] = 0;
  _$jscoverage['/editor.js'].lineData[707] = 0;
  _$jscoverage['/editor.js'].lineData[708] = 0;
  _$jscoverage['/editor.js'].lineData[709] = 0;
  _$jscoverage['/editor.js'].lineData[713] = 0;
  _$jscoverage['/editor.js'].lineData[714] = 0;
  _$jscoverage['/editor.js'].lineData[726] = 0;
  _$jscoverage['/editor.js'].lineData[727] = 0;
  _$jscoverage['/editor.js'].lineData[728] = 0;
  _$jscoverage['/editor.js'].lineData[729] = 0;
  _$jscoverage['/editor.js'].lineData[730] = 0;
  _$jscoverage['/editor.js'].lineData[731] = 0;
  _$jscoverage['/editor.js'].lineData[732] = 0;
  _$jscoverage['/editor.js'].lineData[733] = 0;
  _$jscoverage['/editor.js'].lineData[734] = 0;
  _$jscoverage['/editor.js'].lineData[736] = 0;
  _$jscoverage['/editor.js'].lineData[737] = 0;
  _$jscoverage['/editor.js'].lineData[739] = 0;
  _$jscoverage['/editor.js'].lineData[740] = 0;
  _$jscoverage['/editor.js'].lineData[742] = 0;
  _$jscoverage['/editor.js'].lineData[743] = 0;
  _$jscoverage['/editor.js'].lineData[744] = 0;
  _$jscoverage['/editor.js'].lineData[745] = 0;
  _$jscoverage['/editor.js'].lineData[746] = 0;
  _$jscoverage['/editor.js'].lineData[753] = 0;
  _$jscoverage['/editor.js'].lineData[754] = 0;
  _$jscoverage['/editor.js'].lineData[760] = 0;
  _$jscoverage['/editor.js'].lineData[762] = 0;
  _$jscoverage['/editor.js'].lineData[764] = 0;
  _$jscoverage['/editor.js'].lineData[766] = 0;
  _$jscoverage['/editor.js'].lineData[788] = 0;
  _$jscoverage['/editor.js'].lineData[790] = 0;
  _$jscoverage['/editor.js'].lineData[793] = 0;
  _$jscoverage['/editor.js'].lineData[794] = 0;
  _$jscoverage['/editor.js'].lineData[795] = 0;
  _$jscoverage['/editor.js'].lineData[799] = 0;
  _$jscoverage['/editor.js'].lineData[801] = 0;
  _$jscoverage['/editor.js'].lineData[802] = 0;
  _$jscoverage['/editor.js'].lineData[803] = 0;
  _$jscoverage['/editor.js'].lineData[804] = 0;
  _$jscoverage['/editor.js'].lineData[806] = 0;
  _$jscoverage['/editor.js'].lineData[814] = 0;
  _$jscoverage['/editor.js'].lineData[825] = 0;
  _$jscoverage['/editor.js'].lineData[826] = 0;
  _$jscoverage['/editor.js'].lineData[833] = 0;
  _$jscoverage['/editor.js'].lineData[834] = 0;
  _$jscoverage['/editor.js'].lineData[835] = 0;
  _$jscoverage['/editor.js'].lineData[836] = 0;
  _$jscoverage['/editor.js'].lineData[843] = 0;
  _$jscoverage['/editor.js'].lineData[849] = 0;
  _$jscoverage['/editor.js'].lineData[858] = 0;
  _$jscoverage['/editor.js'].lineData[859] = 0;
  _$jscoverage['/editor.js'].lineData[860] = 0;
  _$jscoverage['/editor.js'].lineData[861] = 0;
  _$jscoverage['/editor.js'].lineData[862] = 0;
  _$jscoverage['/editor.js'].lineData[868] = 0;
  _$jscoverage['/editor.js'].lineData[869] = 0;
  _$jscoverage['/editor.js'].lineData[870] = 0;
  _$jscoverage['/editor.js'].lineData[874] = 0;
  _$jscoverage['/editor.js'].lineData[876] = 0;
  _$jscoverage['/editor.js'].lineData[878] = 0;
  _$jscoverage['/editor.js'].lineData[879] = 0;
  _$jscoverage['/editor.js'].lineData[880] = 0;
  _$jscoverage['/editor.js'].lineData[885] = 0;
  _$jscoverage['/editor.js'].lineData[886] = 0;
  _$jscoverage['/editor.js'].lineData[887] = 0;
  _$jscoverage['/editor.js'].lineData[890] = 0;
  _$jscoverage['/editor.js'].lineData[900] = 0;
  _$jscoverage['/editor.js'].lineData[901] = 0;
  _$jscoverage['/editor.js'].lineData[902] = 0;
  _$jscoverage['/editor.js'].lineData[904] = 0;
  _$jscoverage['/editor.js'].lineData[906] = 0;
  _$jscoverage['/editor.js'].lineData[907] = 0;
  _$jscoverage['/editor.js'].lineData[908] = 0;
  _$jscoverage['/editor.js'].lineData[910] = 0;
  _$jscoverage['/editor.js'].lineData[911] = 0;
  _$jscoverage['/editor.js'].lineData[917] = 0;
  _$jscoverage['/editor.js'].lineData[918] = 0;
  _$jscoverage['/editor.js'].lineData[919] = 0;
  _$jscoverage['/editor.js'].lineData[921] = 0;
  _$jscoverage['/editor.js'].lineData[922] = 0;
  _$jscoverage['/editor.js'].lineData[928] = 0;
  _$jscoverage['/editor.js'].lineData[929] = 0;
  _$jscoverage['/editor.js'].lineData[938] = 0;
  _$jscoverage['/editor.js'].lineData[939] = 0;
  _$jscoverage['/editor.js'].lineData[940] = 0;
  _$jscoverage['/editor.js'].lineData[941] = 0;
  _$jscoverage['/editor.js'].lineData[942] = 0;
  _$jscoverage['/editor.js'].lineData[946] = 0;
  _$jscoverage['/editor.js'].lineData[947] = 0;
  _$jscoverage['/editor.js'].lineData[948] = 0;
  _$jscoverage['/editor.js'].lineData[949] = 0;
  _$jscoverage['/editor.js'].lineData[955] = 0;
  _$jscoverage['/editor.js'].lineData[956] = 0;
  _$jscoverage['/editor.js'].lineData[957] = 0;
  _$jscoverage['/editor.js'].lineData[964] = 0;
  _$jscoverage['/editor.js'].lineData[965] = 0;
  _$jscoverage['/editor.js'].lineData[967] = 0;
  _$jscoverage['/editor.js'].lineData[968] = 0;
  _$jscoverage['/editor.js'].lineData[969] = 0;
  _$jscoverage['/editor.js'].lineData[972] = 0;
  _$jscoverage['/editor.js'].lineData[973] = 0;
  _$jscoverage['/editor.js'].lineData[974] = 0;
  _$jscoverage['/editor.js'].lineData[978] = 0;
  _$jscoverage['/editor.js'].lineData[984] = 0;
  _$jscoverage['/editor.js'].lineData[985] = 0;
  _$jscoverage['/editor.js'].lineData[986] = 0;
  _$jscoverage['/editor.js'].lineData[987] = 0;
  _$jscoverage['/editor.js'].lineData[990] = 0;
  _$jscoverage['/editor.js'].lineData[993] = 0;
  _$jscoverage['/editor.js'].lineData[997] = 0;
  _$jscoverage['/editor.js'].lineData[998] = 0;
  _$jscoverage['/editor.js'].lineData[999] = 0;
  _$jscoverage['/editor.js'].lineData[1004] = 0;
  _$jscoverage['/editor.js'].lineData[1010] = 0;
  _$jscoverage['/editor.js'].lineData[1011] = 0;
  _$jscoverage['/editor.js'].lineData[1013] = 0;
  _$jscoverage['/editor.js'].lineData[1014] = 0;
  _$jscoverage['/editor.js'].lineData[1016] = 0;
  _$jscoverage['/editor.js'].lineData[1018] = 0;
  _$jscoverage['/editor.js'].lineData[1021] = 0;
  _$jscoverage['/editor.js'].lineData[1023] = 0;
  _$jscoverage['/editor.js'].lineData[1024] = 0;
  _$jscoverage['/editor.js'].lineData[1025] = 0;
  _$jscoverage['/editor.js'].lineData[1026] = 0;
  _$jscoverage['/editor.js'].lineData[1034] = 0;
  _$jscoverage['/editor.js'].lineData[1035] = 0;
  _$jscoverage['/editor.js'].lineData[1036] = 0;
  _$jscoverage['/editor.js'].lineData[1037] = 0;
  _$jscoverage['/editor.js'].lineData[1038] = 0;
  _$jscoverage['/editor.js'].lineData[1039] = 0;
  _$jscoverage['/editor.js'].lineData[1047] = 0;
  _$jscoverage['/editor.js'].lineData[1048] = 0;
  _$jscoverage['/editor.js'].lineData[1049] = 0;
  _$jscoverage['/editor.js'].lineData[1050] = 0;
  _$jscoverage['/editor.js'].lineData[1051] = 0;
  _$jscoverage['/editor.js'].lineData[1056] = 0;
  _$jscoverage['/editor.js'].lineData[1057] = 0;
  _$jscoverage['/editor.js'].lineData[1058] = 0;
  _$jscoverage['/editor.js'].lineData[1059] = 0;
  _$jscoverage['/editor.js'].lineData[1061] = 0;
  _$jscoverage['/editor.js'].lineData[1067] = 0;
  _$jscoverage['/editor.js'].lineData[1070] = 0;
  _$jscoverage['/editor.js'].lineData[1071] = 0;
  _$jscoverage['/editor.js'].lineData[1073] = 0;
  _$jscoverage['/editor.js'].lineData[1074] = 0;
  _$jscoverage['/editor.js'].lineData[1075] = 0;
  _$jscoverage['/editor.js'].lineData[1076] = 0;
  _$jscoverage['/editor.js'].lineData[1077] = 0;
  _$jscoverage['/editor.js'].lineData[1081] = 0;
  _$jscoverage['/editor.js'].lineData[1108] = 0;
  _$jscoverage['/editor.js'].lineData[1109] = 0;
  _$jscoverage['/editor.js'].lineData[1112] = 0;
  _$jscoverage['/editor.js'].lineData[1113] = 0;
  _$jscoverage['/editor.js'].lineData[1120] = 0;
  _$jscoverage['/editor.js'].lineData[1121] = 0;
  _$jscoverage['/editor.js'].lineData[1129] = 0;
  _$jscoverage['/editor.js'].lineData[1134] = 0;
  _$jscoverage['/editor.js'].lineData[1137] = 0;
  _$jscoverage['/editor.js'].lineData[1138] = 0;
  _$jscoverage['/editor.js'].lineData[1139] = 0;
  _$jscoverage['/editor.js'].lineData[1142] = 0;
  _$jscoverage['/editor.js'].lineData[1143] = 0;
  _$jscoverage['/editor.js'].lineData[1144] = 0;
  _$jscoverage['/editor.js'].lineData[1145] = 0;
  _$jscoverage['/editor.js'].lineData[1146] = 0;
  _$jscoverage['/editor.js'].lineData[1147] = 0;
  _$jscoverage['/editor.js'].lineData[1149] = 0;
  _$jscoverage['/editor.js'].lineData[1150] = 0;
  _$jscoverage['/editor.js'].lineData[1151] = 0;
  _$jscoverage['/editor.js'].lineData[1155] = 0;
  _$jscoverage['/editor.js'].lineData[1159] = 0;
  _$jscoverage['/editor.js'].lineData[1160] = 0;
  _$jscoverage['/editor.js'].lineData[1161] = 0;
  _$jscoverage['/editor.js'].lineData[1163] = 0;
  _$jscoverage['/editor.js'].lineData[1168] = 0;
  _$jscoverage['/editor.js'].lineData[1169] = 0;
  _$jscoverage['/editor.js'].lineData[1171] = 0;
  _$jscoverage['/editor.js'].lineData[1172] = 0;
  _$jscoverage['/editor.js'].lineData[1173] = 0;
  _$jscoverage['/editor.js'].lineData[1175] = 0;
  _$jscoverage['/editor.js'].lineData[1176] = 0;
  _$jscoverage['/editor.js'].lineData[1177] = 0;
  _$jscoverage['/editor.js'].lineData[1181] = 0;
  _$jscoverage['/editor.js'].lineData[1185] = 0;
  _$jscoverage['/editor.js'].lineData[1186] = 0;
  _$jscoverage['/editor.js'].lineData[1187] = 0;
  _$jscoverage['/editor.js'].lineData[1189] = 0;
  _$jscoverage['/editor.js'].lineData[1195] = 0;
  _$jscoverage['/editor.js'].lineData[1196] = 0;
  _$jscoverage['/editor.js'].lineData[1198] = 0;
}
if (! _$jscoverage['/editor.js'].functionData) {
  _$jscoverage['/editor.js'].functionData = [];
  _$jscoverage['/editor.js'].functionData[0] = 0;
  _$jscoverage['/editor.js'].functionData[1] = 0;
  _$jscoverage['/editor.js'].functionData[2] = 0;
  _$jscoverage['/editor.js'].functionData[3] = 0;
  _$jscoverage['/editor.js'].functionData[4] = 0;
  _$jscoverage['/editor.js'].functionData[5] = 0;
  _$jscoverage['/editor.js'].functionData[6] = 0;
  _$jscoverage['/editor.js'].functionData[7] = 0;
  _$jscoverage['/editor.js'].functionData[8] = 0;
  _$jscoverage['/editor.js'].functionData[9] = 0;
  _$jscoverage['/editor.js'].functionData[10] = 0;
  _$jscoverage['/editor.js'].functionData[11] = 0;
  _$jscoverage['/editor.js'].functionData[12] = 0;
  _$jscoverage['/editor.js'].functionData[13] = 0;
  _$jscoverage['/editor.js'].functionData[14] = 0;
  _$jscoverage['/editor.js'].functionData[15] = 0;
  _$jscoverage['/editor.js'].functionData[16] = 0;
  _$jscoverage['/editor.js'].functionData[17] = 0;
  _$jscoverage['/editor.js'].functionData[18] = 0;
  _$jscoverage['/editor.js'].functionData[19] = 0;
  _$jscoverage['/editor.js'].functionData[20] = 0;
  _$jscoverage['/editor.js'].functionData[21] = 0;
  _$jscoverage['/editor.js'].functionData[22] = 0;
  _$jscoverage['/editor.js'].functionData[23] = 0;
  _$jscoverage['/editor.js'].functionData[24] = 0;
  _$jscoverage['/editor.js'].functionData[25] = 0;
  _$jscoverage['/editor.js'].functionData[26] = 0;
  _$jscoverage['/editor.js'].functionData[27] = 0;
  _$jscoverage['/editor.js'].functionData[28] = 0;
  _$jscoverage['/editor.js'].functionData[29] = 0;
  _$jscoverage['/editor.js'].functionData[30] = 0;
  _$jscoverage['/editor.js'].functionData[31] = 0;
  _$jscoverage['/editor.js'].functionData[32] = 0;
  _$jscoverage['/editor.js'].functionData[33] = 0;
  _$jscoverage['/editor.js'].functionData[34] = 0;
  _$jscoverage['/editor.js'].functionData[35] = 0;
  _$jscoverage['/editor.js'].functionData[36] = 0;
  _$jscoverage['/editor.js'].functionData[37] = 0;
  _$jscoverage['/editor.js'].functionData[38] = 0;
  _$jscoverage['/editor.js'].functionData[39] = 0;
  _$jscoverage['/editor.js'].functionData[40] = 0;
  _$jscoverage['/editor.js'].functionData[41] = 0;
  _$jscoverage['/editor.js'].functionData[42] = 0;
  _$jscoverage['/editor.js'].functionData[43] = 0;
  _$jscoverage['/editor.js'].functionData[44] = 0;
  _$jscoverage['/editor.js'].functionData[45] = 0;
  _$jscoverage['/editor.js'].functionData[46] = 0;
  _$jscoverage['/editor.js'].functionData[47] = 0;
  _$jscoverage['/editor.js'].functionData[48] = 0;
  _$jscoverage['/editor.js'].functionData[49] = 0;
  _$jscoverage['/editor.js'].functionData[50] = 0;
  _$jscoverage['/editor.js'].functionData[51] = 0;
  _$jscoverage['/editor.js'].functionData[52] = 0;
  _$jscoverage['/editor.js'].functionData[53] = 0;
  _$jscoverage['/editor.js'].functionData[54] = 0;
  _$jscoverage['/editor.js'].functionData[55] = 0;
  _$jscoverage['/editor.js'].functionData[56] = 0;
  _$jscoverage['/editor.js'].functionData[57] = 0;
  _$jscoverage['/editor.js'].functionData[58] = 0;
  _$jscoverage['/editor.js'].functionData[59] = 0;
  _$jscoverage['/editor.js'].functionData[60] = 0;
  _$jscoverage['/editor.js'].functionData[61] = 0;
  _$jscoverage['/editor.js'].functionData[62] = 0;
  _$jscoverage['/editor.js'].functionData[63] = 0;
  _$jscoverage['/editor.js'].functionData[64] = 0;
  _$jscoverage['/editor.js'].functionData[65] = 0;
  _$jscoverage['/editor.js'].functionData[66] = 0;
  _$jscoverage['/editor.js'].functionData[67] = 0;
  _$jscoverage['/editor.js'].functionData[68] = 0;
  _$jscoverage['/editor.js'].functionData[69] = 0;
  _$jscoverage['/editor.js'].functionData[70] = 0;
  _$jscoverage['/editor.js'].functionData[71] = 0;
  _$jscoverage['/editor.js'].functionData[72] = 0;
  _$jscoverage['/editor.js'].functionData[73] = 0;
  _$jscoverage['/editor.js'].functionData[74] = 0;
  _$jscoverage['/editor.js'].functionData[75] = 0;
  _$jscoverage['/editor.js'].functionData[76] = 0;
}
if (! _$jscoverage['/editor.js'].branchData) {
  _$jscoverage['/editor.js'].branchData = {};
  _$jscoverage['/editor.js'].branchData['29'] = [];
  _$jscoverage['/editor.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['58'] = [];
  _$jscoverage['/editor.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['58'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['59'] = [];
  _$jscoverage['/editor.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['59'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['88'] = [];
  _$jscoverage['/editor.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['89'] = [];
  _$jscoverage['/editor.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['97'] = [];
  _$jscoverage['/editor.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['102'] = [];
  _$jscoverage['/editor.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['205'] = [];
  _$jscoverage['/editor.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['226'] = [];
  _$jscoverage['/editor.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['250'] = [];
  _$jscoverage['/editor.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['253'] = [];
  _$jscoverage['/editor.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['253'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['259'] = [];
  _$jscoverage['/editor.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['268'] = [];
  _$jscoverage['/editor.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['312'] = [];
  _$jscoverage['/editor.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['329'] = [];
  _$jscoverage['/editor.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['335'] = [];
  _$jscoverage['/editor.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['338'] = [];
  _$jscoverage['/editor.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['344'] = [];
  _$jscoverage['/editor.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['376'] = [];
  _$jscoverage['/editor.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['379'] = [];
  _$jscoverage['/editor.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['420'] = [];
  _$jscoverage['/editor.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['426'] = [];
  _$jscoverage['/editor.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['440'] = [];
  _$jscoverage['/editor.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['461'] = [];
  _$jscoverage['/editor.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['467'] = [];
  _$jscoverage['/editor.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['470'] = [];
  _$jscoverage['/editor.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['501'] = [];
  _$jscoverage['/editor.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['513'] = [];
  _$jscoverage['/editor.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['521'] = [];
  _$jscoverage['/editor.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['521'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['527'] = [];
  _$jscoverage['/editor.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['531'] = [];
  _$jscoverage['/editor.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['531'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['535'] = [];
  _$jscoverage['/editor.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['540'] = [];
  _$jscoverage['/editor.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['547'] = [];
  _$jscoverage['/editor.js'].branchData['547'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['550'] = [];
  _$jscoverage['/editor.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['550'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['550'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['553'] = [];
  _$jscoverage['/editor.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['554'] = [];
  _$jscoverage['/editor.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['563'] = [];
  _$jscoverage['/editor.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['563'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['585'] = [];
  _$jscoverage['/editor.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['599'] = [];
  _$jscoverage['/editor.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['600'] = [];
  _$jscoverage['/editor.js'].branchData['600'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['630'] = [];
  _$jscoverage['/editor.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['655'] = [];
  _$jscoverage['/editor.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['661'] = [];
  _$jscoverage['/editor.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['674'] = [];
  _$jscoverage['/editor.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['685'] = [];
  _$jscoverage['/editor.js'].branchData['685'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['686'] = [];
  _$jscoverage['/editor.js'].branchData['686'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['691'] = [];
  _$jscoverage['/editor.js'].branchData['691'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['708'] = [];
  _$jscoverage['/editor.js'].branchData['708'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['727'] = [];
  _$jscoverage['/editor.js'].branchData['727'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['729'] = [];
  _$jscoverage['/editor.js'].branchData['729'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['733'] = [];
  _$jscoverage['/editor.js'].branchData['733'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['734'] = [];
  _$jscoverage['/editor.js'].branchData['734'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['736'] = [];
  _$jscoverage['/editor.js'].branchData['736'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['737'] = [];
  _$jscoverage['/editor.js'].branchData['737'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['739'] = [];
  _$jscoverage['/editor.js'].branchData['739'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['742'] = [];
  _$jscoverage['/editor.js'].branchData['742'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['788'] = [];
  _$jscoverage['/editor.js'].branchData['788'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['801'] = [];
  _$jscoverage['/editor.js'].branchData['801'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['803'] = [];
  _$jscoverage['/editor.js'].branchData['803'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['823'] = [];
  _$jscoverage['/editor.js'].branchData['823'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['834'] = [];
  _$jscoverage['/editor.js'].branchData['834'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['835'] = [];
  _$jscoverage['/editor.js'].branchData['835'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['858'] = [];
  _$jscoverage['/editor.js'].branchData['858'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['860'] = [];
  _$jscoverage['/editor.js'].branchData['860'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['876'] = [];
  _$jscoverage['/editor.js'].branchData['876'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['887'] = [];
  _$jscoverage['/editor.js'].branchData['887'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['888'] = [];
  _$jscoverage['/editor.js'].branchData['888'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['888'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['910'] = [];
  _$jscoverage['/editor.js'].branchData['910'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['921'] = [];
  _$jscoverage['/editor.js'].branchData['921'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['938'] = [];
  _$jscoverage['/editor.js'].branchData['938'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['941'] = [];
  _$jscoverage['/editor.js'].branchData['941'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['948'] = [];
  _$jscoverage['/editor.js'].branchData['948'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['955'] = [];
  _$jscoverage['/editor.js'].branchData['955'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['955'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['968'] = [];
  _$jscoverage['/editor.js'].branchData['968'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['984'] = [];
  _$jscoverage['/editor.js'].branchData['984'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['986'] = [];
  _$jscoverage['/editor.js'].branchData['986'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['993'] = [];
  _$jscoverage['/editor.js'].branchData['993'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['998'] = [];
  _$jscoverage['/editor.js'].branchData['998'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1004'] = [];
  _$jscoverage['/editor.js'].branchData['1004'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1013'] = [];
  _$jscoverage['/editor.js'].branchData['1013'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1016'] = [];
  _$jscoverage['/editor.js'].branchData['1016'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1034'] = [];
  _$jscoverage['/editor.js'].branchData['1034'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1037'] = [];
  _$jscoverage['/editor.js'].branchData['1037'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1047'] = [];
  _$jscoverage['/editor.js'].branchData['1047'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1050'] = [];
  _$jscoverage['/editor.js'].branchData['1050'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1056'] = [];
  _$jscoverage['/editor.js'].branchData['1056'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1059'] = [];
  _$jscoverage['/editor.js'].branchData['1059'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1059'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1076'] = [];
  _$jscoverage['/editor.js'].branchData['1076'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1085'] = [];
  _$jscoverage['/editor.js'].branchData['1085'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1092'] = [];
  _$jscoverage['/editor.js'].branchData['1092'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1137'] = [];
  _$jscoverage['/editor.js'].branchData['1137'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1159'] = [];
  _$jscoverage['/editor.js'].branchData['1159'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1160'] = [];
  _$jscoverage['/editor.js'].branchData['1160'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1168'] = [];
  _$jscoverage['/editor.js'].branchData['1168'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1175'] = [];
  _$jscoverage['/editor.js'].branchData['1175'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1186'] = [];
  _$jscoverage['/editor.js'].branchData['1186'][1] = new BranchData();
}
_$jscoverage['/editor.js'].branchData['1186'][1].init(13, 19, '!self.get(\'iframe\')');
function visit1246_1186_1(result) {
  _$jscoverage['/editor.js'].branchData['1186'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1175'][1].init(877, 28, 'UA.gecko && !iframe.__loaded');
function visit1245_1175_1(result) {
  _$jscoverage['/editor.js'].branchData['1175'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1168'][1].init(555, 28, 'textarea.hasAttr(\'tabindex\')');
function visit1244_1168_1(result) {
  _$jscoverage['/editor.js'].branchData['1168'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1160'][1].init(261, 9, 'iframeSrc');
function visit1243_1160_1(result) {
  _$jscoverage['/editor.js'].branchData['1160'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1159'][1].init(212, 35, '$(window).getEmptyIframeSrc() || \'\'');
function visit1242_1159_1(result) {
  _$jscoverage['/editor.js'].branchData['1159'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1137'][1].init(371, 9, 'IS_IE < 7');
function visit1241_1137_1(result) {
  _$jscoverage['/editor.js'].branchData['1137'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1092'][1].init(518, 10, 'data || \'\'');
function visit1240_1092_1(result) {
  _$jscoverage['/editor.js'].branchData['1092'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1085'][1].init(232, 17, 'S.UA.ieMode === 8');
function visit1239_1085_1(result) {
  _$jscoverage['/editor.js'].branchData['1085'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1076'][1].init(216, 21, 'i < customLink.length');
function visit1238_1076_1(result) {
  _$jscoverage['/editor.js'].branchData['1076'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1059'][2].init(72, 28, 'control.nodeName() === \'img\'');
function visit1237_1059_2(result) {
  _$jscoverage['/editor.js'].branchData['1059'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1059'][1].init(72, 64, 'control.nodeName() === \'img\' && /ke_/.test(control[0].className)');
function visit1236_1059_1(result) {
  _$jscoverage['/editor.js'].branchData['1059'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1056'][1].init(4776, 8, 'UA.gecko');
function visit1235_1056_1(result) {
  _$jscoverage['/editor.js'].branchData['1056'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1050'][1].init(72, 75, 'S.inArray(control.nodeName(), [\'img\', \'hr\', \'input\', \'textarea\', \'select\'])');
function visit1234_1050_1(result) {
  _$jscoverage['/editor.js'].branchData['1050'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1047'][1].init(4443, 9, 'UA.webkit');
function visit1233_1047_1(result) {
  _$jscoverage['/editor.js'].branchData['1047'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1037'][1].init(25, 29, 'evt.keyCode in pageUpDownKeys');
function visit1232_1037_1(result) {
  _$jscoverage['/editor.js'].branchData['1037'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1034'][1].init(1331, 31, 'doc.compatMode === \'CSS1Compat\'');
function visit1231_1034_1(result) {
  _$jscoverage['/editor.js'].branchData['1034'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1016'][1].init(136, 7, 'control');
function visit1230_1016_1(result) {
  _$jscoverage['/editor.js'].branchData['1016'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1013'][1].init(104, 24, 'keyCode in {\n  8: 1, \n  46: 1}');
function visit1229_1013_1(result) {
  _$jscoverage['/editor.js'].branchData['1013'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1004'][1].init(2597, 5, 'IS_IE');
function visit1228_1004_1(result) {
  _$jscoverage['/editor.js'].branchData['1004'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['998'][1].init(21, 19, '!self.__iframeFocus');
function visit1227_998_1(result) {
  _$jscoverage['/editor.js'].branchData['998'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['993'][1].init(2315, 8, 'UA.gecko');
function visit1226_993_1(result) {
  _$jscoverage['/editor.js'].branchData['993'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['986'][1].init(225, 8, 'UA.opera');
function visit1225_986_1(result) {
  _$jscoverage['/editor.js'].branchData['986'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['984'][1].init(148, 8, 'UA.gecko');
function visit1224_984_1(result) {
  _$jscoverage['/editor.js'].branchData['984'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['968'][1].init(22, 31, '(UA.gecko) && self.__iframeFocus');
function visit1223_968_1(result) {
  _$jscoverage['/editor.js'].branchData['968'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['955'][2].init(1045, 17, 'UA.ie || UA.opera');
function visit1222_955_2(result) {
  _$jscoverage['/editor.js'].branchData['955'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['955'][1].init(1033, 29, 'UA.gecko || UA.ie || UA.opera');
function visit1221_955_1(result) {
  _$jscoverage['/editor.js'].branchData['955'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['948'][1].init(72, 52, 'S.inArray(control.nodeName(), [\'input\', \'textarea\'])');
function visit1220_948_1(result) {
  _$jscoverage['/editor.js'].branchData['948'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['941'][1].init(72, 50, 'S.inArray(control.nodeName(), [\'input\', \'select\'])');
function visit1219_941_1(result) {
  _$jscoverage['/editor.js'].branchData['941'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['938'][1].init(387, 9, 'UA.webkit');
function visit1218_938_1(result) {
  _$jscoverage['/editor.js'].branchData['938'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['921'][1].init(221, 6, '!retry');
function visit1217_921_1(result) {
  _$jscoverage['/editor.js'].branchData['921'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['910'][1].init(146, 9, '!go.retry');
function visit1216_910_1(result) {
  _$jscoverage['/editor.js'].branchData['910'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['888'][2].init(53, 24, 't.nodeName() === \'table\'');
function visit1215_888_2(result) {
  _$jscoverage['/editor.js'].branchData['888'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['888'][1].init(53, 85, 't.nodeName() === \'table\' && disableInlineTableEditing');
function visit1214_888_1(result) {
  _$jscoverage['/editor.js'].branchData['888'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['887'][1].init(83, 140, 'disableObjectResizing || (t.nodeName() === \'table\' && disableInlineTableEditing)');
function visit1213_887_1(result) {
  _$jscoverage['/editor.js'].branchData['887'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['876'][1].init(318, 50, 'disableObjectResizing || disableInlineTableEditing');
function visit1212_876_1(result) {
  _$jscoverage['/editor.js'].branchData['876'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['860'][1].init(25, 3, 'doc');
function visit1211_860_1(result) {
  _$jscoverage['/editor.js'].branchData['860'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['858'][1].init(372, 5, 'IS_IE');
function visit1210_858_1(result) {
  _$jscoverage['/editor.js'].branchData['858'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['835'][1].init(25, 8, 'UA.gecko');
function visit1209_835_1(result) {
  _$jscoverage['/editor.js'].branchData['835'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['834'][1].init(319, 17, 't === htmlElement');
function visit1208_834_1(result) {
  _$jscoverage['/editor.js'].branchData['834'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['823'][1].init(364, 20, 'UA.gecko || UA.opera');
function visit1207_823_1(result) {
  _$jscoverage['/editor.js'].branchData['823'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['803'][1].init(199, 9, 'UA.webkit');
function visit1206_803_1(result) {
  _$jscoverage['/editor.js'].branchData['803'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['801'][1].init(98, 20, 'UA.gecko || UA.opera');
function visit1205_801_1(result) {
  _$jscoverage['/editor.js'].branchData['801'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['788'][1].init(1281, 5, 'IS_IE');
function visit1204_788_1(result) {
  _$jscoverage['/editor.js'].branchData['788'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['742'][1].init(507, 26, 'cfg.data || textarea.val()');
function visit1203_742_1(result) {
  _$jscoverage['/editor.js'].branchData['742'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['739'][1].init(431, 4, 'name');
function visit1202_739_1(result) {
  _$jscoverage['/editor.js'].branchData['739'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['737'][1].init(26, 20, 'cfg.height || height');
function visit1201_737_1(result) {
  _$jscoverage['/editor.js'].branchData['737'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['736'][1].init(352, 6, 'height');
function visit1200_736_1(result) {
  _$jscoverage['/editor.js'].branchData['736'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['734'][1].init(25, 18, 'cfg.width || width');
function visit1199_734_1(result) {
  _$jscoverage['/editor.js'].branchData['734'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['733'][1].init(277, 5, 'width');
function visit1198_733_1(result) {
  _$jscoverage['/editor.js'].branchData['733'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['729'][1].init(106, 23, 'cfg.textareaAttrs || {}');
function visit1197_729_1(result) {
  _$jscoverage['/editor.js'].branchData['729'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['727'][1].init(15, 9, 'cfg || {}');
function visit1196_727_1(result) {
  _$jscoverage['/editor.js'].branchData['727'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['708'][1].init(21, 15, 'control.destroy');
function visit1195_708_1(result) {
  _$jscoverage['/editor.js'].branchData['708'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['691'][1].init(356, 3, 'doc');
function visit1194_691_1(result) {
  _$jscoverage['/editor.js'].branchData['691'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['686'][1].init(42, 60, '(form = textarea[0].form) && (form = $(form))');
function visit1193_686_1(result) {
  _$jscoverage['/editor.js'].branchData['686'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['685'][1].init(162, 103, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1192_685_1(result) {
  _$jscoverage['/editor.js'].branchData['685'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['674'][1].init(76, 20, 'v && self.__docReady');
function visit1191_674_1(result) {
  _$jscoverage['/editor.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['661'][1].init(65, 6, 'iframe');
function visit1190_661_1(result) {
  _$jscoverage['/editor.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['655'][1].init(140, 18, 'v === WYSIWYG_MODE');
function visit1189_655_1(result) {
  _$jscoverage['/editor.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['630'][1].init(1080, 8, 'lastNode');
function visit1188_630_1(result) {
  _$jscoverage['/editor.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['600'][1].init(21, 23, '$sel.type === \'Control\'');
function visit1187_600_1(result) {
  _$jscoverage['/editor.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['599'][1].init(569, 4, '$sel');
function visit1186_599_1(result) {
  _$jscoverage['/editor.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['585'][1].init(135, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1185_585_1(result) {
  _$jscoverage['/editor.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['563'][2].init(2336, 23, 'clone[0].nodeType === 1');
function visit1184_563_2(result) {
  _$jscoverage['/editor.js'].branchData['563'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['563'][1].init(2327, 32, 'clone && clone[0].nodeType === 1');
function visit1183_563_1(result) {
  _$jscoverage['/editor.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['554'][1].init(31, 76, 'xhtmlDtd.$block[nextName] && xhtmlDtd[nextName][\'#text\']');
function visit1182_554_1(result) {
  _$jscoverage['/editor.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['553'][1].init(339, 108, 'nextName && xhtmlDtd.$block[nextName] && xhtmlDtd[nextName][\'#text\']');
function visit1181_553_1(result) {
  _$jscoverage['/editor.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['550'][3].init(168, 42, 'next[0].nodeType === NodeType.ELEMENT_NODE');
function visit1180_550_3(result) {
  _$jscoverage['/editor.js'].branchData['550'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['550'][2].init(168, 81, 'next[0].nodeType === NodeType.ELEMENT_NODE && next.nodeName()');
function visit1179_550_2(result) {
  _$jscoverage['/editor.js'].branchData['550'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['550'][1].init(160, 89, 'next && next[0].nodeType === NodeType.ELEMENT_NODE && next.nodeName()');
function visit1178_550_1(result) {
  _$jscoverage['/editor.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['547'][1].init(1566, 7, 'isBlock');
function visit1177_547_1(result) {
  _$jscoverage['/editor.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['540'][1].init(1257, 12, '!lastElement');
function visit1176_540_1(result) {
  _$jscoverage['/editor.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['535'][1].init(320, 12, '!lastElement');
function visit1175_535_1(result) {
  _$jscoverage['/editor.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['531'][2].init(110, 13, '!i && element');
function visit1174_531_2(result) {
  _$jscoverage['/editor.js'].branchData['531'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['531'][1].init(110, 36, '!i && element || element.clone(TRUE)');
function visit1173_531_1(result) {
  _$jscoverage['/editor.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['527'][1].init(817, 6, 'i >= 0');
function visit1172_527_1(result) {
  _$jscoverage['/editor.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['521'][2].init(666, 19, 'ranges.length === 0');
function visit1171_521_2(result) {
  _$jscoverage['/editor.js'].branchData['521'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['521'][1].init(655, 30, '!ranges || ranges.length === 0');
function visit1170_521_1(result) {
  _$jscoverage['/editor.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['513'][1].init(275, 34, 'selection && selection.getRanges()');
function visit1169_513_1(result) {
  _$jscoverage['/editor.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['501'][1].init(47, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1168_501_1(result) {
  _$jscoverage['/editor.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['470'][1].init(169, 65, '!self.__previousPath || !self.__previousPath.compare(currentPath)');
function visit1167_470_1(result) {
  _$jscoverage['/editor.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['467'][1].init(74, 33, 'selection && !selection.isInvalid');
function visit1166_467_1(result) {
  _$jscoverage['/editor.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['461'][1].init(46, 29, 'self.__checkSelectionChangeId');
function visit1165_461_1(result) {
  _$jscoverage['/editor.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['440'][1].init(85, 15, 'self.__docReady');
function visit1164_440_1(result) {
  _$jscoverage['/editor.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['426'][1].init(372, 10, 'ind !== -1');
function visit1163_426_1(result) {
  _$jscoverage['/editor.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['420'][1].init(21, 23, 'l.attr(\'href\') === link');
function visit1162_420_1(result) {
  _$jscoverage['/editor.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['379'][1].init(242, 3, 'win');
function visit1161_379_1(result) {
  _$jscoverage['/editor.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['376'][1].init(88, 29, 'self.get(\'customStyle\') || \'\'');
function visit1160_376_1(result) {
  _$jscoverage['/editor.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['344'][1].init(640, 3, 'win');
function visit1159_344_1(result) {
  _$jscoverage['/editor.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['338'][1].init(137, 17, 'win && win.parent');
function visit1158_338_1(result) {
  _$jscoverage['/editor.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['335'][1].init(297, 6, '!UA.ie');
function visit1157_335_1(result) {
  _$jscoverage['/editor.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['329'][1].init(128, 4, '!win');
function visit1156_329_1(result) {
  _$jscoverage['/editor.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['312'][1].init(159, 5, 'range');
function visit1155_312_1(result) {
  _$jscoverage['/editor.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['268'][1].init(774, 28, 'EMPTY_CONTENT_REG.test(html)');
function visit1154_268_1(result) {
  _$jscoverage['/editor.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['259'][1].init(499, 6, 'format');
function visit1153_259_1(result) {
  _$jscoverage['/editor.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['253'][2].init(221, 21, 'mode === WYSIWYG_MODE');
function visit1152_253_2(result) {
  _$jscoverage['/editor.js'].branchData['253'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['253'][1].init(221, 42, 'mode === WYSIWYG_MODE && self.isDocReady()');
function visit1151_253_1(result) {
  _$jscoverage['/editor.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['250'][1].init(128, 18, 'mode === undefined');
function visit1150_250_1(result) {
  _$jscoverage['/editor.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['226'][1].init(115, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1149_226_1(result) {
  _$jscoverage['/editor.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['205'][1].init(196, 3, 'cmd');
function visit1148_205_1(result) {
  _$jscoverage['/editor.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['102'][1].init(107, 3, 'sel');
function visit1147_102_1(result) {
  _$jscoverage['/editor.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['97'][1].init(101, 19, 'self.get(\'focused\')');
function visit1146_97_1(result) {
  _$jscoverage['/editor.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['89'][1].init(42, 60, '(form = textarea[0].form) && (form = $(form))');
function visit1145_89_1(result) {
  _$jscoverage['/editor.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['88'][1].init(169, 103, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1144_88_1(result) {
  _$jscoverage['/editor.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['59'][2].init(57, 40, 'statusBarEl && statusBarEl.outerHeight()');
function visit1143_59_2(result) {
  _$jscoverage['/editor.js'].branchData['59'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['59'][1].init(57, 45, 'statusBarEl && statusBarEl.outerHeight() || 0');
function visit1142_59_1(result) {
  _$jscoverage['/editor.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['58'][2].init(228, 36, 'toolBarEl && toolBarEl.outerHeight()');
function visit1141_58_2(result) {
  _$jscoverage['/editor.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['58'][1].init(228, 41, 'toolBarEl && toolBarEl.outerHeight() || 0');
function visit1140_58_1(result) {
  _$jscoverage['/editor.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['29'][1].init(161, 14, 'UA.ieMode < 11');
function visit1139_29_1(result) {
  _$jscoverage['/editor.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/editor.js'].functionData[0]++;
  _$jscoverage['/editor.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/editor.js'].lineData[8]++;
  var iframeContentTpl = require('editor/iframe-content-tpl');
  _$jscoverage['/editor.js'].lineData[9]++;
  var Editor = require('editor/base');
  _$jscoverage['/editor.js'].lineData[10]++;
  var Utils = require('editor/utils');
  _$jscoverage['/editor.js'].lineData[11]++;
  var focusManager = require('editor/focusManager');
  _$jscoverage['/editor.js'].lineData[12]++;
  var clipboard = require('editor/clipboard');
  _$jscoverage['/editor.js'].lineData[13]++;
  var enterKey = require('editor/enterKey');
  _$jscoverage['/editor.js'].lineData[14]++;
  var htmlDataProcessor = require('editor/htmlDataProcessor');
  _$jscoverage['/editor.js'].lineData[15]++;
  var selectionFix = require('editor/selectionFix');
  _$jscoverage['/editor.js'].lineData[16]++;
  require('editor/modules');
  _$jscoverage['/editor.js'].lineData[17]++;
  require('editor/styles');
  _$jscoverage['/editor.js'].lineData[18]++;
  require('editor/domIterator');
  _$jscoverage['/editor.js'].lineData[19]++;
  require('editor/z-index-manager');
  _$jscoverage['/editor.js'].lineData[20]++;
  module.exports = Editor;
  _$jscoverage['/editor.js'].lineData[21]++;
  var logger = S.getLogger('s/editor');
  _$jscoverage['/editor.js'].lineData[22]++;
  var TRUE = true, FALSE = false, NULL = null, window = S.Env.host, document = window.document, UA = S.UA, IS_IE = visit1139_29_1(UA.ieMode < 11), NodeType = Node.NodeType, $ = Node.all, HEIGHT = 'height', tryThese = Utils.tryThese, IFRAME_TPL = '<iframe' + ' class="{prefixCls}editor-iframe"' + ' frameborder="0" ' + ' title="kissy-editor" ' + ' allowTransparency="true" ' + ' {iframeSrc} ' + '>' + '</iframe>', EMPTY_CONTENT_REG = /^(?:<(p)>)?(?:(?:&nbsp;)|\s|<br[^>]*>)*(?:<\/\1>)?$/i;
  _$jscoverage['/editor.js'].lineData[45]++;
  Editor.Mode = {
  SOURCE_MODE: 0, 
  WYSIWYG_MODE: 1};
  _$jscoverage['/editor.js'].lineData[50]++;
  var WYSIWYG_MODE = 1;
  _$jscoverage['/editor.js'].lineData[52]++;
  function adjustHeight(self, height) {
    _$jscoverage['/editor.js'].functionData[1]++;
    _$jscoverage['/editor.js'].lineData[53]++;
    var textareaEl = self.get('textarea'), toolBarEl = self.get('toolBarEl'), statusBarEl = self.get('statusBarEl');
    _$jscoverage['/editor.js'].lineData[56]++;
    height = parseInt(height, 10);
    _$jscoverage['/editor.js'].lineData[58]++;
    height -= (visit1140_58_1(visit1141_58_2(toolBarEl && toolBarEl.outerHeight()) || 0)) + (visit1142_59_1(visit1143_59_2(statusBarEl && statusBarEl.outerHeight()) || 0));
    _$jscoverage['/editor.js'].lineData[60]++;
    textareaEl.parent().css(HEIGHT, height);
    _$jscoverage['/editor.js'].lineData[61]++;
    textareaEl.css(HEIGHT, height);
  }
  _$jscoverage['/editor.js'].lineData[64]++;
  Editor.addMembers({
  initializer: function() {
  _$jscoverage['/editor.js'].functionData[2]++;
  _$jscoverage['/editor.js'].lineData[66]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[67]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[68]++;
  self.__controls = {};
  _$jscoverage['/editor.js'].lineData[70]++;
  focusManager.register(self);
}, 
  renderUI: function() {
  _$jscoverage['/editor.js'].functionData[3]++;
  _$jscoverage['/editor.js'].lineData[75]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[76]++;
  clipboard.init(self);
  _$jscoverage['/editor.js'].lineData[77]++;
  enterKey.init(self);
  _$jscoverage['/editor.js'].lineData[78]++;
  htmlDataProcessor.init(self);
  _$jscoverage['/editor.js'].lineData[79]++;
  selectionFix.init(self);
}, 
  bindUI: function() {
  _$jscoverage['/editor.js'].functionData[4]++;
  _$jscoverage['/editor.js'].lineData[83]++;
  var self = this, form, prefixCls = self.get('prefixCls'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[88]++;
  if (visit1144_88_1(self.get('attachForm') && visit1145_89_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[91]++;
    form.on('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[94]++;
  function docReady() {
    _$jscoverage['/editor.js'].functionData[5]++;
    _$jscoverage['/editor.js'].lineData[95]++;
    self.detach('docReady', docReady);
    _$jscoverage['/editor.js'].lineData[97]++;
    if (visit1146_97_1(self.get('focused'))) {
      _$jscoverage['/editor.js'].lineData[98]++;
      self.focus();
    } else {
      _$jscoverage['/editor.js'].lineData[101]++;
      var sel = self.getSelection();
      _$jscoverage['/editor.js'].lineData[102]++;
      if (visit1147_102_1(sel)) {
        _$jscoverage['/editor.js'].lineData[103]++;
        sel.removeAllRanges();
      }
    }
  }
  _$jscoverage['/editor.js'].lineData[108]++;
  self.on('docReady', docReady);
  _$jscoverage['/editor.js'].lineData[110]++;
  self.on('blur', function() {
  _$jscoverage['/editor.js'].functionData[6]++;
  _$jscoverage['/editor.js'].lineData[111]++;
  self.$el.removeClass(prefixCls + 'editor-focused');
});
  _$jscoverage['/editor.js'].lineData[114]++;
  self.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[7]++;
  _$jscoverage['/editor.js'].lineData[115]++;
  self.$el.addClass(prefixCls + 'editor-focused');
});
}, 
  syncUI: function() {
  _$jscoverage['/editor.js'].functionData[8]++;
  _$jscoverage['/editor.js'].lineData[120]++;
  adjustHeight(this, this.get('height'));
}, 
  sync: function() {
  _$jscoverage['/editor.js'].functionData[9]++;
  _$jscoverage['/editor.js'].lineData[127]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[128]++;
  self.get('textarea').val(self.getData());
}, 
  getControl: function(id) {
  _$jscoverage['/editor.js'].functionData[10]++;
  _$jscoverage['/editor.js'].lineData[136]++;
  return this.__controls[id];
}, 
  getControls: function() {
  _$jscoverage['/editor.js'].functionData[11]++;
  _$jscoverage['/editor.js'].lineData[144]++;
  return this.__controls;
}, 
  addControl: function(id, control) {
  _$jscoverage['/editor.js'].functionData[12]++;
  _$jscoverage['/editor.js'].lineData[153]++;
  this.__controls[id] = control;
}, 
  showDialog: function(name, args) {
  _$jscoverage['/editor.js'].functionData[13]++;
  _$jscoverage['/editor.js'].lineData[163]++;
  name += '/dialog';
  _$jscoverage['/editor.js'].lineData[164]++;
  var self = this, d = self.__controls[name];
  _$jscoverage['/editor.js'].lineData[166]++;
  d.show(args);
  _$jscoverage['/editor.js'].lineData[167]++;
  self.fire('dialogShow', {
  dialog: d.dialog, 
  pluginDialog: d, 
  dialogName: name});
}, 
  addCommand: function(name, obj) {
  _$jscoverage['/editor.js'].functionData[14]++;
  _$jscoverage['/editor.js'].lineData[181]++;
  this.__commands[name] = obj;
}, 
  hasCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[15]++;
  _$jscoverage['/editor.js'].lineData[190]++;
  return this.__commands[name];
}, 
  execCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[16]++;
  _$jscoverage['/editor.js'].lineData[200]++;
  var self = this, cmd = self.__commands[name], args = S.makeArray(arguments);
  _$jscoverage['/editor.js'].lineData[203]++;
  args.shift();
  _$jscoverage['/editor.js'].lineData[204]++;
  args.unshift(self);
  _$jscoverage['/editor.js'].lineData[205]++;
  if (visit1148_205_1(cmd)) {
    _$jscoverage['/editor.js'].lineData[206]++;
    return cmd.exec.apply(cmd, args);
  } else {
    _$jscoverage['/editor.js'].lineData[208]++;
    logger.error(name + ': command not found');
    _$jscoverage['/editor.js'].lineData[209]++;
    return undefined;
  }
}, 
  queryCommandValue: function(name) {
  _$jscoverage['/editor.js'].functionData[17]++;
  _$jscoverage['/editor.js'].lineData[219]++;
  return this.execCommand(Utils.getQueryCmd(name));
}, 
  setData: function(data) {
  _$jscoverage['/editor.js'].functionData[18]++;
  _$jscoverage['/editor.js'].lineData[223]++;
  var self = this, htmlDataProcessor, afterData = data;
  _$jscoverage['/editor.js'].lineData[226]++;
  if (visit1149_226_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[228]++;
    self.get('textarea').val(data);
    _$jscoverage['/editor.js'].lineData[229]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[231]++;
  if ((htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[232]++;
    afterData = htmlDataProcessor.toDataFormat(data);
  }
  _$jscoverage['/editor.js'].lineData[235]++;
  clearIframeDocContent(self);
  _$jscoverage['/editor.js'].lineData[236]++;
  createIframe(self, afterData);
}, 
  getData: function(format, mode) {
  _$jscoverage['/editor.js'].functionData[19]++;
  _$jscoverage['/editor.js'].lineData[247]++;
  var self = this, htmlDataProcessor = self.htmlDataProcessor, html;
  _$jscoverage['/editor.js'].lineData[250]++;
  if (visit1150_250_1(mode === undefined)) {
    _$jscoverage['/editor.js'].lineData[251]++;
    mode = self.get('mode');
  }
  _$jscoverage['/editor.js'].lineData[253]++;
  if (visit1151_253_1(visit1152_253_2(mode === WYSIWYG_MODE) && self.isDocReady())) {
    _$jscoverage['/editor.js'].lineData[254]++;
    html = self.get('document')[0].body.innerHTML;
  } else {
    _$jscoverage['/editor.js'].lineData[256]++;
    html = htmlDataProcessor.toDataFormat(self.get('textarea').val());
  }
  _$jscoverage['/editor.js'].lineData[259]++;
  if (visit1153_259_1(format)) {
    _$jscoverage['/editor.js'].lineData[260]++;
    html = htmlDataProcessor.toHtml(html);
  } else {
    _$jscoverage['/editor.js'].lineData[262]++;
    html = htmlDataProcessor.toServer(html);
  }
  _$jscoverage['/editor.js'].lineData[264]++;
  html = S.trim(html);
  _$jscoverage['/editor.js'].lineData[268]++;
  if (visit1154_268_1(EMPTY_CONTENT_REG.test(html))) {
    _$jscoverage['/editor.js'].lineData[269]++;
    html = '';
  }
  _$jscoverage['/editor.js'].lineData[271]++;
  return html;
}, 
  getFormatData: function(mode) {
  _$jscoverage['/editor.js'].functionData[20]++;
  _$jscoverage['/editor.js'].lineData[281]++;
  return this.getData(1, mode);
}, 
  getDocHtml: function() {
  _$jscoverage['/editor.js'].functionData[21]++;
  _$jscoverage['/editor.js'].lineData[289]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[290]++;
  return prepareIFrameHTML(0, self.get('customStyle'), self.get('customLink'), self.getFormatData());
}, 
  getSelection: function() {
  _$jscoverage['/editor.js'].functionData[22]++;
  _$jscoverage['/editor.js'].lineData[299]++;
  return Editor.Selection.getSelection(this.get('document')[0]);
}, 
  getSelectedHtml: function() {
  _$jscoverage['/editor.js'].functionData[23]++;
  _$jscoverage['/editor.js'].lineData[308]++;
  var self = this, range = self.getSelection().getRanges()[0], contents, html = '';
  _$jscoverage['/editor.js'].lineData[312]++;
  if (visit1155_312_1(range)) {
    _$jscoverage['/editor.js'].lineData[313]++;
    contents = range.cloneContents();
    _$jscoverage['/editor.js'].lineData[314]++;
    html = self.get('document')[0].createElement('div');
    _$jscoverage['/editor.js'].lineData[315]++;
    html.appendChild(contents);
    _$jscoverage['/editor.js'].lineData[316]++;
    html = html.innerHTML;
  }
  _$jscoverage['/editor.js'].lineData[318]++;
  return html;
}, 
  focus: function() {
  _$jscoverage['/editor.js'].functionData[24]++;
  _$jscoverage['/editor.js'].lineData[326]++;
  var self = this, win = self.get('window');
  _$jscoverage['/editor.js'].lineData[329]++;
  if (visit1156_329_1(!win)) {
    _$jscoverage['/editor.js'].lineData[330]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[332]++;
  var doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[333]++;
  win = win[0];
  _$jscoverage['/editor.js'].lineData[335]++;
  if (visit1157_335_1(!UA.ie)) {
    _$jscoverage['/editor.js'].lineData[338]++;
    if (visit1158_338_1(win && win.parent)) {
      _$jscoverage['/editor.js'].lineData[339]++;
      win.parent.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[344]++;
  if (visit1159_344_1(win)) {
    _$jscoverage['/editor.js'].lineData[345]++;
    win.focus();
  }
  _$jscoverage['/editor.js'].lineData[348]++;
  try {
    _$jscoverage['/editor.js'].lineData[349]++;
    doc.body.focus();
  }  catch (e) {
}
  _$jscoverage['/editor.js'].lineData[353]++;
  self.notifySelectionChange();
}, 
  blur: function() {
  _$jscoverage['/editor.js'].functionData[25]++;
  _$jscoverage['/editor.js'].lineData[361]++;
  var self = this, win = self.get('window')[0];
  _$jscoverage['/editor.js'].lineData[363]++;
  win.blur();
  _$jscoverage['/editor.js'].lineData[364]++;
  self.get('document')[0].body.blur();
}, 
  addCustomStyle: function(cssText, id) {
  _$jscoverage['/editor.js'].functionData[26]++;
  _$jscoverage['/editor.js'].lineData[374]++;
  var self = this, win = self.get('window'), customStyle = visit1160_376_1(self.get('customStyle') || '');
  _$jscoverage['/editor.js'].lineData[377]++;
  customStyle += '\n' + cssText;
  _$jscoverage['/editor.js'].lineData[378]++;
  self.set('customStyle', customStyle);
  _$jscoverage['/editor.js'].lineData[379]++;
  if (visit1161_379_1(win)) {
    _$jscoverage['/editor.js'].lineData[380]++;
    win.addStyleSheet(cssText, id);
  }
}, 
  removeCustomStyle: function(id) {
  _$jscoverage['/editor.js'].functionData[27]++;
  _$jscoverage['/editor.js'].lineData[390]++;
  this.get('document').on('#' + id).remove();
}, 
  addCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[28]++;
  _$jscoverage['/editor.js'].lineData[399]++;
  var self = this, customLink = self.get('customLink'), doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[402]++;
  customLink.push(link);
  _$jscoverage['/editor.js'].lineData[403]++;
  self.set('customLink', customLink);
  _$jscoverage['/editor.js'].lineData[404]++;
  var elem = doc.createElement('link');
  _$jscoverage['/editor.js'].lineData[405]++;
  elem.rel = 'stylesheet';
  _$jscoverage['/editor.js'].lineData[406]++;
  doc.getElementsByTagName('head')[0].appendChild(elem);
  _$jscoverage['/editor.js'].lineData[407]++;
  elem.href = link;
}, 
  removeCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[29]++;
  _$jscoverage['/editor.js'].lineData[416]++;
  var self = this, doc = self.get('document'), links = doc.all('link');
  _$jscoverage['/editor.js'].lineData[419]++;
  links.each(function(l) {
  _$jscoverage['/editor.js'].functionData[30]++;
  _$jscoverage['/editor.js'].lineData[420]++;
  if (visit1162_420_1(l.attr('href') === link)) {
    _$jscoverage['/editor.js'].lineData[421]++;
    l.remove();
  }
});
  _$jscoverage['/editor.js'].lineData[424]++;
  var cls = self.get('customLink'), ind = S.indexOf(link, cls);
  _$jscoverage['/editor.js'].lineData[426]++;
  if (visit1163_426_1(ind !== -1)) {
    _$jscoverage['/editor.js'].lineData[427]++;
    cls.splice(ind, 1);
  }
}, 
  docReady: function(func) {
  _$jscoverage['/editor.js'].functionData[31]++;
  _$jscoverage['/editor.js'].lineData[438]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[439]++;
  self.on('docReady', func);
  _$jscoverage['/editor.js'].lineData[440]++;
  if (visit1164_440_1(self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[441]++;
    func.call(self);
  }
}, 
  isDocReady: function() {
  _$jscoverage['/editor.js'].functionData[32]++;
  _$jscoverage['/editor.js'].lineData[451]++;
  return this.__docReady;
}, 
  checkSelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[33]++;
  _$jscoverage['/editor.js'].lineData[460]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[461]++;
  if (visit1165_461_1(self.__checkSelectionChangeId)) {
    _$jscoverage['/editor.js'].lineData[462]++;
    clearTimeout(self.__checkSelectionChangeId);
  }
  _$jscoverage['/editor.js'].lineData[465]++;
  self.__checkSelectionChangeId = setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[34]++;
  _$jscoverage['/editor.js'].lineData[466]++;
  var selection = self.getSelection();
  _$jscoverage['/editor.js'].lineData[467]++;
  if (visit1166_467_1(selection && !selection.isInvalid)) {
    _$jscoverage['/editor.js'].lineData[468]++;
    var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/editor.js'].lineData[470]++;
    if (visit1167_470_1(!self.__previousPath || !self.__previousPath.compare(currentPath))) {
      _$jscoverage['/editor.js'].lineData[471]++;
      self.__previousPath = currentPath;
      _$jscoverage['/editor.js'].lineData[472]++;
      self.fire('selectionChange', {
  selection: selection, 
  path: currentPath, 
  element: startElement});
    }
  }
}, 100);
}, 
  notifySelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[35]++;
  _$jscoverage['/editor.js'].lineData[488]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[489]++;
  self.__previousPath = NULL;
  _$jscoverage['/editor.js'].lineData[490]++;
  self.checkSelectionChange();
}, 
  insertElement: function(element) {
  _$jscoverage['/editor.js'].functionData[36]++;
  _$jscoverage['/editor.js'].lineData[499]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[501]++;
  if (visit1168_501_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[502]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[505]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[507]++;
  var clone, elementName = element.nodeName(), xhtmlDtd = Editor.XHTML_DTD, isBlock = xhtmlDtd.$block[elementName], KER = Editor.RangeType, selection = self.getSelection(), ranges = visit1169_513_1(selection && selection.getRanges()), range, notWhitespaceEval, i, next, nextName, lastElement;
  _$jscoverage['/editor.js'].lineData[521]++;
  if (visit1170_521_1(!ranges || visit1171_521_2(ranges.length === 0))) {
    _$jscoverage['/editor.js'].lineData[522]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[525]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[527]++;
  for (i = ranges.length - 1; visit1172_527_1(i >= 0); i--) {
    _$jscoverage['/editor.js'].lineData[528]++;
    range = ranges[i];
    _$jscoverage['/editor.js'].lineData[531]++;
    clone = visit1173_531_1(visit1174_531_2(!i && element) || element.clone(TRUE));
    _$jscoverage['/editor.js'].lineData[532]++;
    range.insertNodeByDtd(clone);
    _$jscoverage['/editor.js'].lineData[535]++;
    if (visit1175_535_1(!lastElement)) {
      _$jscoverage['/editor.js'].lineData[536]++;
      lastElement = clone;
    }
  }
  _$jscoverage['/editor.js'].lineData[540]++;
  if (visit1176_540_1(!lastElement)) {
    _$jscoverage['/editor.js'].lineData[541]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[544]++;
  range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
  _$jscoverage['/editor.js'].lineData[547]++;
  if (visit1177_547_1(isBlock)) {
    _$jscoverage['/editor.js'].lineData[548]++;
    notWhitespaceEval = Editor.Walker.whitespaces(true);
    _$jscoverage['/editor.js'].lineData[549]++;
    next = lastElement.next(notWhitespaceEval, 1);
    _$jscoverage['/editor.js'].lineData[550]++;
    nextName = visit1178_550_1(next && visit1179_550_2(visit1180_550_3(next[0].nodeType === NodeType.ELEMENT_NODE) && next.nodeName()));
    _$jscoverage['/editor.js'].lineData[553]++;
    if (visit1181_553_1(nextName && visit1182_554_1(xhtmlDtd.$block[nextName] && xhtmlDtd[nextName]['#text']))) {
      _$jscoverage['/editor.js'].lineData[556]++;
      range.moveToElementEditablePosition(next);
    }
  }
  _$jscoverage['/editor.js'].lineData[559]++;
  selection.selectRanges([range]);
  _$jscoverage['/editor.js'].lineData[560]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[563]++;
  if (visit1183_563_1(clone && visit1184_563_2(clone[0].nodeType === 1))) {
    _$jscoverage['/editor.js'].lineData[564]++;
    clone.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
  _$jscoverage['/editor.js'].lineData[570]++;
  saveLater.call(self);
  _$jscoverage['/editor.js'].lineData[571]++;
  return clone;
}, 
  insertHtml: function(data, dataFilter) {
  _$jscoverage['/editor.js'].functionData[37]++;
  _$jscoverage['/editor.js'].lineData[581]++;
  var self = this, htmlDataProcessor, editorDoc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[585]++;
  if (visit1185_585_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[586]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[589]++;
  if ((htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[590]++;
    data = htmlDataProcessor.toDataFormat(data, dataFilter);
  }
  _$jscoverage['/editor.js'].lineData[593]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[594]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[598]++;
  var $sel = editorDoc.selection;
  _$jscoverage['/editor.js'].lineData[599]++;
  if (visit1186_599_1($sel)) {
    _$jscoverage['/editor.js'].lineData[600]++;
    if (visit1187_600_1($sel.type === 'Control')) {
      _$jscoverage['/editor.js'].lineData[601]++;
      $sel.clear();
    }
    _$jscoverage['/editor.js'].lineData[603]++;
    try {
      _$jscoverage['/editor.js'].lineData[604]++;
      $sel.createRange().pasteHTML(data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[606]++;
  logger.error('insertHtml error in ie');
}
  } else {
    _$jscoverage['/editor.js'].lineData[613]++;
    var sel = self.get('iframe')[0].contentWindow.getSelection(), range = sel.getRangeAt(0);
    _$jscoverage['/editor.js'].lineData[616]++;
    range.deleteContents();
    _$jscoverage['/editor.js'].lineData[621]++;
    var el = editorDoc.createElement('div');
    _$jscoverage['/editor.js'].lineData[622]++;
    el.innerHTML = data;
    _$jscoverage['/editor.js'].lineData[623]++;
    var frag = editorDoc.createDocumentFragment(), node, lastNode;
    _$jscoverage['/editor.js'].lineData[624]++;
    while ((node = el.firstChild)) {
      _$jscoverage['/editor.js'].lineData[625]++;
      lastNode = frag.appendChild(node);
    }
    _$jscoverage['/editor.js'].lineData[627]++;
    range.insertNode(frag);
    _$jscoverage['/editor.js'].lineData[630]++;
    if (visit1188_630_1(lastNode)) {
      _$jscoverage['/editor.js'].lineData[631]++;
      range = range.cloneRange();
      _$jscoverage['/editor.js'].lineData[632]++;
      range.setStartAfter(lastNode);
      _$jscoverage['/editor.js'].lineData[633]++;
      range.collapse(true);
      _$jscoverage['/editor.js'].lineData[634]++;
      sel.removeAllRanges();
      _$jscoverage['/editor.js'].lineData[635]++;
      sel.addRange(range);
    }
  }
  _$jscoverage['/editor.js'].lineData[640]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[38]++;
  _$jscoverage['/editor.js'].lineData[641]++;
  self.getSelection().scrollIntoView();
}, 50);
  _$jscoverage['/editor.js'].lineData[643]++;
  saveLater.call(self);
}, 
  _onSetHeight: function(v) {
  _$jscoverage['/editor.js'].functionData[39]++;
  _$jscoverage['/editor.js'].lineData[648]++;
  adjustHeight(this, v);
}, 
  _onSetMode: function(v) {
  _$jscoverage['/editor.js'].functionData[40]++;
  _$jscoverage['/editor.js'].lineData[652]++;
  var self = this, iframe = self.get('iframe'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[655]++;
  if (visit1189_655_1(v === WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[656]++;
    self.setData(textarea.val());
    _$jscoverage['/editor.js'].lineData[657]++;
    textarea.hide();
    _$jscoverage['/editor.js'].lineData[658]++;
    self.fire('wysiwygMode');
  } else {
    _$jscoverage['/editor.js'].lineData[661]++;
    if (visit1190_661_1(iframe)) {
      _$jscoverage['/editor.js'].lineData[662]++;
      textarea.val(self.getFormatData(WYSIWYG_MODE));
      _$jscoverage['/editor.js'].lineData[663]++;
      iframe.hide();
    }
    _$jscoverage['/editor.js'].lineData[665]++;
    textarea.show();
    _$jscoverage['/editor.js'].lineData[666]++;
    self.fire('sourceMode');
  }
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/editor.js'].functionData[41]++;
  _$jscoverage['/editor.js'].lineData[672]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[674]++;
  if (visit1191_674_1(v && self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[675]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/editor.js'].functionData[42]++;
  _$jscoverage['/editor.js'].lineData[680]++;
  var self = this, form, textarea = self.get('textarea'), doc = self.get('document');
  _$jscoverage['/editor.js'].lineData[685]++;
  if (visit1192_685_1(self.get('attachForm') && visit1193_686_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[688]++;
    form.detach('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[691]++;
  if (visit1194_691_1(doc)) {
    _$jscoverage['/editor.js'].lineData[692]++;
    var body = $(doc[0].body), documentElement = $(doc[0].documentElement), win = self.get('window');
    _$jscoverage['/editor.js'].lineData[696]++;
    focusManager.remove(self);
    _$jscoverage['/editor.js'].lineData[698]++;
    doc.detach();
    _$jscoverage['/editor.js'].lineData[700]++;
    documentElement.detach();
    _$jscoverage['/editor.js'].lineData[702]++;
    body.detach();
    _$jscoverage['/editor.js'].lineData[704]++;
    win.detach();
  }
  _$jscoverage['/editor.js'].lineData[707]++;
  S.each(self.__controls, function(control) {
  _$jscoverage['/editor.js'].functionData[43]++;
  _$jscoverage['/editor.js'].lineData[708]++;
  if (visit1195_708_1(control.destroy)) {
    _$jscoverage['/editor.js'].lineData[709]++;
    control.destroy();
  }
});
  _$jscoverage['/editor.js'].lineData[713]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[714]++;
  self.__controls = {};
}});
  _$jscoverage['/editor.js'].lineData[726]++;
  Editor.decorate = function(textarea, cfg) {
  _$jscoverage['/editor.js'].functionData[44]++;
  _$jscoverage['/editor.js'].lineData[727]++;
  cfg = visit1196_727_1(cfg || {});
  _$jscoverage['/editor.js'].lineData[728]++;
  textarea = $(textarea);
  _$jscoverage['/editor.js'].lineData[729]++;
  var textareaAttrs = cfg.textareaAttrs = visit1197_729_1(cfg.textareaAttrs || {});
  _$jscoverage['/editor.js'].lineData[730]++;
  var width = textarea.style('width');
  _$jscoverage['/editor.js'].lineData[731]++;
  var height = textarea.style('height');
  _$jscoverage['/editor.js'].lineData[732]++;
  var name = textarea.attr('name');
  _$jscoverage['/editor.js'].lineData[733]++;
  if (visit1198_733_1(width)) {
    _$jscoverage['/editor.js'].lineData[734]++;
    cfg.width = visit1199_734_1(cfg.width || width);
  }
  _$jscoverage['/editor.js'].lineData[736]++;
  if (visit1200_736_1(height)) {
    _$jscoverage['/editor.js'].lineData[737]++;
    cfg.height = visit1201_737_1(cfg.height || height);
  }
  _$jscoverage['/editor.js'].lineData[739]++;
  if (visit1202_739_1(name)) {
    _$jscoverage['/editor.js'].lineData[740]++;
    textareaAttrs.name = name;
  }
  _$jscoverage['/editor.js'].lineData[742]++;
  cfg.data = visit1203_742_1(cfg.data || textarea.val());
  _$jscoverage['/editor.js'].lineData[743]++;
  cfg.elBefore = textarea;
  _$jscoverage['/editor.js'].lineData[744]++;
  var editor = new Editor(cfg).render();
  _$jscoverage['/editor.js'].lineData[745]++;
  textarea.remove();
  _$jscoverage['/editor.js'].lineData[746]++;
  return editor;
};
  _$jscoverage['/editor.js'].lineData[753]++;
  Editor._initIframe = function(id) {
  _$jscoverage['/editor.js'].functionData[45]++;
  _$jscoverage['/editor.js'].lineData[754]++;
  var self = focusManager.getInstance(id), $doc = self.get('document'), doc = $doc[0], script = $doc.one('#ke_active_script');
  _$jscoverage['/editor.js'].lineData[760]++;
  script.remove();
  _$jscoverage['/editor.js'].lineData[762]++;
  fixByBindIframeDoc(self);
  _$jscoverage['/editor.js'].lineData[764]++;
  var body = doc.body;
  _$jscoverage['/editor.js'].lineData[766]++;
  var $body = $(body);
  _$jscoverage['/editor.js'].lineData[788]++;
  if (visit1204_788_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[790]++;
    body.hideFocus = TRUE;
    _$jscoverage['/editor.js'].lineData[793]++;
    body.disabled = TRUE;
    _$jscoverage['/editor.js'].lineData[794]++;
    body.contentEditable = TRUE;
    _$jscoverage['/editor.js'].lineData[795]++;
    body.removeAttribute('disabled');
  } else {
    _$jscoverage['/editor.js'].lineData[799]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[46]++;
  _$jscoverage['/editor.js'].lineData[801]++;
  if (visit1205_801_1(UA.gecko || UA.opera)) {
    _$jscoverage['/editor.js'].lineData[802]++;
    body.contentEditable = TRUE;
  } else {
    _$jscoverage['/editor.js'].lineData[803]++;
    if (visit1206_803_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[804]++;
      body.parentNode.contentEditable = TRUE;
    } else {
      _$jscoverage['/editor.js'].lineData[806]++;
      doc.designMode = 'on';
    }
  }
}, 0);
  }
  _$jscoverage['/editor.js'].lineData[814]++;
  if (visit1207_823_1(UA.gecko || UA.opera)) {
    _$jscoverage['/editor.js'].lineData[825]++;
    var htmlElement = doc.documentElement;
    _$jscoverage['/editor.js'].lineData[826]++;
    $(htmlElement).on('mousedown', function(evt) {
  _$jscoverage['/editor.js'].functionData[47]++;
  _$jscoverage['/editor.js'].lineData[833]++;
  var t = evt.target;
  _$jscoverage['/editor.js'].lineData[834]++;
  if (visit1208_834_1(t === htmlElement)) {
    _$jscoverage['/editor.js'].lineData[835]++;
    if (visit1209_835_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[836]++;
      blinkCursor(doc, FALSE);
    }
    _$jscoverage['/editor.js'].lineData[843]++;
    self.activateGecko();
  }
});
  }
  _$jscoverage['/editor.js'].lineData[849]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[48]++;
  _$jscoverage['/editor.js'].lineData[858]++;
  if (visit1210_858_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[859]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[49]++;
  _$jscoverage['/editor.js'].lineData[860]++;
  if (visit1211_860_1(doc)) {
    _$jscoverage['/editor.js'].lineData[861]++;
    body.runtimeStyle.marginBottom = '0px';
    _$jscoverage['/editor.js'].lineData[862]++;
    body.runtimeStyle.marginBottom = '';
  }
}, 1000);
  }
}, 0);
  _$jscoverage['/editor.js'].lineData[868]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[50]++;
  _$jscoverage['/editor.js'].lineData[869]++;
  self.__docReady = 1;
  _$jscoverage['/editor.js'].lineData[870]++;
  self.fire('docReady');
  _$jscoverage['/editor.js'].lineData[874]++;
  var disableObjectResizing = self.get('disableObjectResizing'), disableInlineTableEditing = self.get('disableInlineTableEditing');
  _$jscoverage['/editor.js'].lineData[876]++;
  if (visit1212_876_1(disableObjectResizing || disableInlineTableEditing)) {
    _$jscoverage['/editor.js'].lineData[878]++;
    try {
      _$jscoverage['/editor.js'].lineData[879]++;
      doc.execCommand('enableObjectResizing', FALSE, !disableObjectResizing);
      _$jscoverage['/editor.js'].lineData[880]++;
      doc.execCommand('enableInlineTableEditing', FALSE, !disableInlineTableEditing);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[885]++;
  $body.on(IS_IE ? 'resizestart' : 'resize', function(evt) {
  _$jscoverage['/editor.js'].functionData[51]++;
  _$jscoverage['/editor.js'].lineData[886]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor.js'].lineData[887]++;
  if (visit1213_887_1(disableObjectResizing || (visit1214_888_1(visit1215_888_2(t.nodeName() === 'table') && disableInlineTableEditing)))) {
    _$jscoverage['/editor.js'].lineData[890]++;
    evt.preventDefault();
  }
});
}
  }
}, 10);
};
  _$jscoverage['/editor.js'].lineData[900]++;
  function blinkCursor(doc, retry) {
    _$jscoverage['/editor.js'].functionData[52]++;
    _$jscoverage['/editor.js'].lineData[901]++;
    var body = doc.body;
    _$jscoverage['/editor.js'].lineData[902]++;
    tryThese(function() {
  _$jscoverage['/editor.js'].functionData[53]++;
  _$jscoverage['/editor.js'].lineData[904]++;
  doc.designMode = 'on';
  _$jscoverage['/editor.js'].lineData[906]++;
  setTimeout(function go() {
  _$jscoverage['/editor.js'].functionData[54]++;
  _$jscoverage['/editor.js'].lineData[907]++;
  doc.designMode = 'off';
  _$jscoverage['/editor.js'].lineData[908]++;
  body.focus();
  _$jscoverage['/editor.js'].lineData[910]++;
  if (visit1216_910_1(!go.retry)) {
    _$jscoverage['/editor.js'].lineData[911]++;
    go.retry = TRUE;
  }
}, 50);
}, function() {
  _$jscoverage['/editor.js'].functionData[55]++;
  _$jscoverage['/editor.js'].lineData[917]++;
  doc.designMode = 'off';
  _$jscoverage['/editor.js'].lineData[918]++;
  body.setAttribute('contentEditable', false);
  _$jscoverage['/editor.js'].lineData[919]++;
  body.setAttribute('contentEditable', true);
  _$jscoverage['/editor.js'].lineData[921]++;
  if (visit1217_921_1(!retry)) {
    _$jscoverage['/editor.js'].lineData[922]++;
    blinkCursor(doc, 1);
  }
});
  }
  _$jscoverage['/editor.js'].lineData[928]++;
  function fixByBindIframeDoc(self) {
    _$jscoverage['/editor.js'].functionData[56]++;
    _$jscoverage['/editor.js'].lineData[929]++;
    var textarea = self.get('textarea')[0], $win = self.get('window'), $doc = self.get('document'), doc = $doc[0];
    _$jscoverage['/editor.js'].lineData[938]++;
    if (visit1218_938_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[939]++;
      $doc.on('click', function(ev) {
  _$jscoverage['/editor.js'].functionData[57]++;
  _$jscoverage['/editor.js'].lineData[940]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[941]++;
  if (visit1219_941_1(S.inArray(control.nodeName(), ['input', 'select']))) {
    _$jscoverage['/editor.js'].lineData[942]++;
    ev.preventDefault();
  }
});
      _$jscoverage['/editor.js'].lineData[946]++;
      $doc.on('mouseup', function(ev) {
  _$jscoverage['/editor.js'].functionData[58]++;
  _$jscoverage['/editor.js'].lineData[947]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[948]++;
  if (visit1220_948_1(S.inArray(control.nodeName(), ['input', 'textarea']))) {
    _$jscoverage['/editor.js'].lineData[949]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[955]++;
    if (visit1221_955_1(UA.gecko || visit1222_955_2(UA.ie || UA.opera))) {
      _$jscoverage['/editor.js'].lineData[956]++;
      var focusGrabber;
      _$jscoverage['/editor.js'].lineData[957]++;
      focusGrabber = new Node('<span ' + 'tabindex="-1" ' + 'style="position:absolute; left:-10000"' + ' role="presentation"' + '></span>').insertAfter(textarea);
      _$jscoverage['/editor.js'].lineData[964]++;
      focusGrabber.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[59]++;
  _$jscoverage['/editor.js'].lineData[965]++;
  self.focus();
});
      _$jscoverage['/editor.js'].lineData[967]++;
      self.activateGecko = function() {
  _$jscoverage['/editor.js'].functionData[60]++;
  _$jscoverage['/editor.js'].lineData[968]++;
  if (visit1223_968_1((UA.gecko) && self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[969]++;
    focusGrabber[0].focus();
  }
};
      _$jscoverage['/editor.js'].lineData[972]++;
      self.on('destroy', function() {
  _$jscoverage['/editor.js'].functionData[61]++;
  _$jscoverage['/editor.js'].lineData[973]++;
  focusGrabber.detach();
  _$jscoverage['/editor.js'].lineData[974]++;
  focusGrabber.remove();
});
    }
    _$jscoverage['/editor.js'].lineData[978]++;
    $win.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[62]++;
  _$jscoverage['/editor.js'].lineData[984]++;
  if (visit1224_984_1(UA.gecko)) {
    _$jscoverage['/editor.js'].lineData[985]++;
    blinkCursor(doc, FALSE);
  } else {
    _$jscoverage['/editor.js'].lineData[986]++;
    if (visit1225_986_1(UA.opera)) {
      _$jscoverage['/editor.js'].lineData[987]++;
      doc.body.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[990]++;
  self.notifySelectionChange();
});
    _$jscoverage['/editor.js'].lineData[993]++;
    if (visit1226_993_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[997]++;
      $doc.on('mousedown', function() {
  _$jscoverage['/editor.js'].functionData[63]++;
  _$jscoverage['/editor.js'].lineData[998]++;
  if (visit1227_998_1(!self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[999]++;
    blinkCursor(doc, FALSE);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1004]++;
    if (visit1228_1004_1(IS_IE)) {
      _$jscoverage['/editor.js'].lineData[1010]++;
      $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[64]++;
  _$jscoverage['/editor.js'].lineData[1011]++;
  var keyCode = evt.keyCode;
  _$jscoverage['/editor.js'].lineData[1013]++;
  if (visit1229_1013_1(keyCode in {
  8: 1, 
  46: 1})) {
    _$jscoverage['/editor.js'].lineData[1014]++;
    var sel = self.getSelection(), control = sel.getSelectedElement();
    _$jscoverage['/editor.js'].lineData[1016]++;
    if (visit1230_1016_1(control)) {
      _$jscoverage['/editor.js'].lineData[1018]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[1021]++;
      var bookmark = sel.getRanges()[0].createBookmark();
      _$jscoverage['/editor.js'].lineData[1023]++;
      control.remove();
      _$jscoverage['/editor.js'].lineData[1024]++;
      sel.selectBookmarks([bookmark]);
      _$jscoverage['/editor.js'].lineData[1025]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[1026]++;
      evt.preventDefault();
    }
  }
});
      _$jscoverage['/editor.js'].lineData[1034]++;
      if (visit1231_1034_1(doc.compatMode === 'CSS1Compat')) {
        _$jscoverage['/editor.js'].lineData[1035]++;
        var pageUpDownKeys = {
  33: 1, 
  34: 1};
        _$jscoverage['/editor.js'].lineData[1036]++;
        $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[65]++;
  _$jscoverage['/editor.js'].lineData[1037]++;
  if (visit1232_1037_1(evt.keyCode in pageUpDownKeys)) {
    _$jscoverage['/editor.js'].lineData[1038]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[66]++;
  _$jscoverage['/editor.js'].lineData[1039]++;
  self.getSelection().scrollIntoView();
}, 0);
  }
});
      }
    }
    _$jscoverage['/editor.js'].lineData[1047]++;
    if (visit1233_1047_1(UA.webkit)) {
      _$jscoverage['/editor.js'].lineData[1048]++;
      $doc.on('mousedown', function(ev) {
  _$jscoverage['/editor.js'].functionData[67]++;
  _$jscoverage['/editor.js'].lineData[1049]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1050]++;
  if (visit1234_1050_1(S.inArray(control.nodeName(), ['img', 'hr', 'input', 'textarea', 'select']))) {
    _$jscoverage['/editor.js'].lineData[1051]++;
    self.getSelection().selectElement(control);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1056]++;
    if (visit1235_1056_1(UA.gecko)) {
      _$jscoverage['/editor.js'].lineData[1057]++;
      $doc.on('dragstart', function(ev) {
  _$jscoverage['/editor.js'].functionData[68]++;
  _$jscoverage['/editor.js'].lineData[1058]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1059]++;
  if (visit1236_1059_1(visit1237_1059_2(control.nodeName() === 'img') && /ke_/.test(control[0].className))) {
    _$jscoverage['/editor.js'].lineData[1061]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1067]++;
    focusManager.add(self);
  }
  _$jscoverage['/editor.js'].lineData[1070]++;
  function prepareIFrameHTML(id, customStyle, customLink, data) {
    _$jscoverage['/editor.js'].functionData[69]++;
    _$jscoverage['/editor.js'].lineData[1071]++;
    var links = '', i;
    _$jscoverage['/editor.js'].lineData[1073]++;
    var innerCssFile = Utils.debugUrl('theme/editor-iframe.css');
    _$jscoverage['/editor.js'].lineData[1074]++;
    customLink = customLink.concat([]);
    _$jscoverage['/editor.js'].lineData[1075]++;
    customLink.unshift(innerCssFile);
    _$jscoverage['/editor.js'].lineData[1076]++;
    for (i = 0; visit1238_1076_1(i < customLink.length); i++) {
      _$jscoverage['/editor.js'].lineData[1077]++;
      links += S.substitute('<link href="' + '{href}" rel="stylesheet" />', {
  href: customLink[i]});
    }
    _$jscoverage['/editor.js'].lineData[1081]++;
    return S.substitute(iframeContentTpl, {
  doctype: visit1239_1085_1(S.UA.ieMode === 8) ? '<meta http-equiv="X-UA-Compatible" content="IE=7" />' : '', 
  title: '{title}', 
  links: links, 
  style: '<style>' + customStyle + '</style>', 
  data: visit1240_1092_1(data || ''), 
  script: id ? ('<script id="ke_active_script">' + ($(window).isCustomDomain() ? ('document.domain="' + document.domain + '";') : '') + 'parent.KISSY.require(\'editor\')._initIframe("' + id + '");' + '</script>') : ''});
  }
  _$jscoverage['/editor.js'].lineData[1108]++;
  var saveLater = S.buffer(function() {
  _$jscoverage['/editor.js'].functionData[70]++;
  _$jscoverage['/editor.js'].lineData[1109]++;
  this.execCommand('save');
}, 50);
  _$jscoverage['/editor.js'].lineData[1112]++;
  function setUpIFrame(self, data) {
    _$jscoverage['/editor.js'].functionData[71]++;
    _$jscoverage['/editor.js'].lineData[1113]++;
    var iframe = self.get('iframe'), html = prepareIFrameHTML(self.get('id'), self.get('customStyle'), self.get('customLink'), data), iframeDom = iframe[0], win = iframeDom.contentWindow, doc;
    _$jscoverage['/editor.js'].lineData[1120]++;
    iframe.__loaded = 1;
    _$jscoverage['/editor.js'].lineData[1121]++;
    try {
      _$jscoverage['/editor.js'].lineData[1129]++;
      doc = win.document;
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[1134]++;
  iframeDom.src = iframeDom.src;
  _$jscoverage['/editor.js'].lineData[1137]++;
  if (visit1241_1137_1(IS_IE < 7)) {
    _$jscoverage['/editor.js'].lineData[1138]++;
    setTimeout(run, 10);
    _$jscoverage['/editor.js'].lineData[1139]++;
    return;
  }
}
    _$jscoverage['/editor.js'].lineData[1142]++;
    run();
    _$jscoverage['/editor.js'].lineData[1143]++;
    function run() {
      _$jscoverage['/editor.js'].functionData[72]++;
      _$jscoverage['/editor.js'].lineData[1144]++;
      doc = win.document;
      _$jscoverage['/editor.js'].lineData[1145]++;
      self.setInternal('document', new Node(doc));
      _$jscoverage['/editor.js'].lineData[1146]++;
      self.setInternal('window', new Node(win));
      _$jscoverage['/editor.js'].lineData[1147]++;
      iframe.detach();
      _$jscoverage['/editor.js'].lineData[1149]++;
      doc.open('text/html', 'replace');
      _$jscoverage['/editor.js'].lineData[1150]++;
      doc.write(html);
      _$jscoverage['/editor.js'].lineData[1151]++;
      doc.close();
    }
  }
  _$jscoverage['/editor.js'].lineData[1155]++;
  function createIframe(self, afterData) {
    _$jscoverage['/editor.js'].functionData[73]++;
    _$jscoverage['/editor.js'].lineData[1159]++;
    var iframeSrc = visit1242_1159_1($(window).getEmptyIframeSrc() || '');
    _$jscoverage['/editor.js'].lineData[1160]++;
    if (visit1243_1160_1(iframeSrc)) {
      _$jscoverage['/editor.js'].lineData[1161]++;
      iframeSrc = ' src="' + iframeSrc + '" ';
    }
    _$jscoverage['/editor.js'].lineData[1163]++;
    var iframe = new Node(S.substitute(IFRAME_TPL, {
  iframeSrc: iframeSrc, 
  prefixCls: self.get('prefixCls')})), textarea = self.get('textarea');
    _$jscoverage['/editor.js'].lineData[1168]++;
    if (visit1244_1168_1(textarea.hasAttr('tabindex'))) {
      _$jscoverage['/editor.js'].lineData[1169]++;
      iframe.attr('tabindex', UA.webkit ? -1 : textarea.attr('tabindex'));
    }
    _$jscoverage['/editor.js'].lineData[1171]++;
    textarea.parent().prepend(iframe);
    _$jscoverage['/editor.js'].lineData[1172]++;
    self.set('iframe', iframe);
    _$jscoverage['/editor.js'].lineData[1173]++;
    self.__docReady = 0;
    _$jscoverage['/editor.js'].lineData[1175]++;
    if (visit1245_1175_1(UA.gecko && !iframe.__loaded)) {
      _$jscoverage['/editor.js'].lineData[1176]++;
      iframe.on('load', function() {
  _$jscoverage['/editor.js'].functionData[74]++;
  _$jscoverage['/editor.js'].lineData[1177]++;
  setUpIFrame(self, afterData);
}, self);
    } else {
      _$jscoverage['/editor.js'].lineData[1181]++;
      setUpIFrame(self, afterData);
    }
  }
  _$jscoverage['/editor.js'].lineData[1185]++;
  function clearIframeDocContent(self) {
    _$jscoverage['/editor.js'].functionData[75]++;
    _$jscoverage['/editor.js'].lineData[1186]++;
    if (visit1246_1186_1(!self.get('iframe'))) {
      _$jscoverage['/editor.js'].lineData[1187]++;
      return;
    }
    _$jscoverage['/editor.js'].lineData[1189]++;
    var iframe = self.get('iframe'), win = self.get('window'), doc = self.get('document'), domDoc = doc[0], documentElement = $(domDoc.documentElement), body = $(domDoc.body);
    _$jscoverage['/editor.js'].lineData[1195]++;
    S.each([doc, documentElement, body, win], function(el) {
  _$jscoverage['/editor.js'].functionData[76]++;
  _$jscoverage['/editor.js'].lineData[1196]++;
  el.detach();
});
    _$jscoverage['/editor.js'].lineData[1198]++;
    iframe.remove();
  }
});
