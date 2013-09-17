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
if (! _$jscoverage['/editor/styles.js']) {
  _$jscoverage['/editor/styles.js'] = {};
  _$jscoverage['/editor/styles.js'].lineData = [];
  _$jscoverage['/editor/styles.js'].lineData[10] = 0;
  _$jscoverage['/editor/styles.js'].lineData[11] = 0;
  _$jscoverage['/editor/styles.js'].lineData[64] = 0;
  _$jscoverage['/editor/styles.js'].lineData[79] = 0;
  _$jscoverage['/editor/styles.js'].lineData[82] = 0;
  _$jscoverage['/editor/styles.js'].lineData[85] = 0;
  _$jscoverage['/editor/styles.js'].lineData[86] = 0;
  _$jscoverage['/editor/styles.js'].lineData[87] = 0;
  _$jscoverage['/editor/styles.js'].lineData[88] = 0;
  _$jscoverage['/editor/styles.js'].lineData[89] = 0;
  _$jscoverage['/editor/styles.js'].lineData[92] = 0;
  _$jscoverage['/editor/styles.js'].lineData[103] = 0;
  _$jscoverage['/editor/styles.js'].lineData[104] = 0;
  _$jscoverage['/editor/styles.js'].lineData[105] = 0;
  _$jscoverage['/editor/styles.js'].lineData[106] = 0;
  _$jscoverage['/editor/styles.js'].lineData[109] = 0;
  _$jscoverage['/editor/styles.js'].lineData[111] = 0;
  _$jscoverage['/editor/styles.js'].lineData[116] = 0;
  _$jscoverage['/editor/styles.js'].lineData[121] = 0;
  _$jscoverage['/editor/styles.js'].lineData[123] = 0;
  _$jscoverage['/editor/styles.js'].lineData[127] = 0;
  _$jscoverage['/editor/styles.js'].lineData[129] = 0;
  _$jscoverage['/editor/styles.js'].lineData[131] = 0;
  _$jscoverage['/editor/styles.js'].lineData[132] = 0;
  _$jscoverage['/editor/styles.js'].lineData[134] = 0;
  _$jscoverage['/editor/styles.js'].lineData[136] = 0;
  _$jscoverage['/editor/styles.js'].lineData[139] = 0;
  _$jscoverage['/editor/styles.js'].lineData[143] = 0;
  _$jscoverage['/editor/styles.js'].lineData[147] = 0;
  _$jscoverage['/editor/styles.js'].lineData[151] = 0;
  _$jscoverage['/editor/styles.js'].lineData[152] = 0;
  _$jscoverage['/editor/styles.js'].lineData[165] = 0;
  _$jscoverage['/editor/styles.js'].lineData[166] = 0;
  _$jscoverage['/editor/styles.js'].lineData[175] = 0;
  _$jscoverage['/editor/styles.js'].lineData[176] = 0;
  _$jscoverage['/editor/styles.js'].lineData[178] = 0;
  _$jscoverage['/editor/styles.js'].lineData[182] = 0;
  _$jscoverage['/editor/styles.js'].lineData[184] = 0;
  _$jscoverage['/editor/styles.js'].lineData[185] = 0;
  _$jscoverage['/editor/styles.js'].lineData[187] = 0;
  _$jscoverage['/editor/styles.js'].lineData[189] = 0;
  _$jscoverage['/editor/styles.js'].lineData[190] = 0;
  _$jscoverage['/editor/styles.js'].lineData[192] = 0;
  _$jscoverage['/editor/styles.js'].lineData[193] = 0;
  _$jscoverage['/editor/styles.js'].lineData[195] = 0;
  _$jscoverage['/editor/styles.js'].lineData[196] = 0;
  _$jscoverage['/editor/styles.js'].lineData[200] = 0;
  _$jscoverage['/editor/styles.js'].lineData[201] = 0;
  _$jscoverage['/editor/styles.js'].lineData[203] = 0;
  _$jscoverage['/editor/styles.js'].lineData[204] = 0;
  _$jscoverage['/editor/styles.js'].lineData[207] = 0;
  _$jscoverage['/editor/styles.js'].lineData[208] = 0;
  _$jscoverage['/editor/styles.js'].lineData[211] = 0;
  _$jscoverage['/editor/styles.js'].lineData[215] = 0;
  _$jscoverage['/editor/styles.js'].lineData[218] = 0;
  _$jscoverage['/editor/styles.js'].lineData[220] = 0;
  _$jscoverage['/editor/styles.js'].lineData[223] = 0;
  _$jscoverage['/editor/styles.js'].lineData[224] = 0;
  _$jscoverage['/editor/styles.js'].lineData[225] = 0;
  _$jscoverage['/editor/styles.js'].lineData[226] = 0;
  _$jscoverage['/editor/styles.js'].lineData[227] = 0;
  _$jscoverage['/editor/styles.js'].lineData[228] = 0;
  _$jscoverage['/editor/styles.js'].lineData[229] = 0;
  _$jscoverage['/editor/styles.js'].lineData[236] = 0;
  _$jscoverage['/editor/styles.js'].lineData[240] = 0;
  _$jscoverage['/editor/styles.js'].lineData[244] = 0;
  _$jscoverage['/editor/styles.js'].lineData[245] = 0;
  _$jscoverage['/editor/styles.js'].lineData[246] = 0;
  _$jscoverage['/editor/styles.js'].lineData[247] = 0;
  _$jscoverage['/editor/styles.js'].lineData[248] = 0;
  _$jscoverage['/editor/styles.js'].lineData[249] = 0;
  _$jscoverage['/editor/styles.js'].lineData[250] = 0;
  _$jscoverage['/editor/styles.js'].lineData[256] = 0;
  _$jscoverage['/editor/styles.js'].lineData[261] = 0;
  _$jscoverage['/editor/styles.js'].lineData[269] = 0;
  _$jscoverage['/editor/styles.js'].lineData[271] = 0;
  _$jscoverage['/editor/styles.js'].lineData[277] = 0;
  _$jscoverage['/editor/styles.js'].lineData[279] = 0;
  _$jscoverage['/editor/styles.js'].lineData[280] = 0;
  _$jscoverage['/editor/styles.js'].lineData[282] = 0;
  _$jscoverage['/editor/styles.js'].lineData[285] = 0;
  _$jscoverage['/editor/styles.js'].lineData[287] = 0;
  _$jscoverage['/editor/styles.js'].lineData[289] = 0;
  _$jscoverage['/editor/styles.js'].lineData[291] = 0;
  _$jscoverage['/editor/styles.js'].lineData[292] = 0;
  _$jscoverage['/editor/styles.js'].lineData[295] = 0;
  _$jscoverage['/editor/styles.js'].lineData[300] = 0;
  _$jscoverage['/editor/styles.js'].lineData[302] = 0;
  _$jscoverage['/editor/styles.js'].lineData[303] = 0;
  _$jscoverage['/editor/styles.js'].lineData[304] = 0;
  _$jscoverage['/editor/styles.js'].lineData[306] = 0;
  _$jscoverage['/editor/styles.js'].lineData[309] = 0;
  _$jscoverage['/editor/styles.js'].lineData[313] = 0;
  _$jscoverage['/editor/styles.js'].lineData[314] = 0;
  _$jscoverage['/editor/styles.js'].lineData[316] = 0;
  _$jscoverage['/editor/styles.js'].lineData[318] = 0;
  _$jscoverage['/editor/styles.js'].lineData[322] = 0;
  _$jscoverage['/editor/styles.js'].lineData[323] = 0;
  _$jscoverage['/editor/styles.js'].lineData[325] = 0;
  _$jscoverage['/editor/styles.js'].lineData[331] = 0;
  _$jscoverage['/editor/styles.js'].lineData[332] = 0;
  _$jscoverage['/editor/styles.js'].lineData[334] = 0;
  _$jscoverage['/editor/styles.js'].lineData[337] = 0;
  _$jscoverage['/editor/styles.js'].lineData[340] = 0;
  _$jscoverage['/editor/styles.js'].lineData[341] = 0;
  _$jscoverage['/editor/styles.js'].lineData[346] = 0;
  _$jscoverage['/editor/styles.js'].lineData[347] = 0;
  _$jscoverage['/editor/styles.js'].lineData[350] = 0;
  _$jscoverage['/editor/styles.js'].lineData[353] = 0;
  _$jscoverage['/editor/styles.js'].lineData[354] = 0;
  _$jscoverage['/editor/styles.js'].lineData[356] = 0;
  _$jscoverage['/editor/styles.js'].lineData[359] = 0;
  _$jscoverage['/editor/styles.js'].lineData[360] = 0;
  _$jscoverage['/editor/styles.js'].lineData[365] = 0;
  _$jscoverage['/editor/styles.js'].lineData[366] = 0;
  _$jscoverage['/editor/styles.js'].lineData[367] = 0;
  _$jscoverage['/editor/styles.js'].lineData[373] = 0;
  _$jscoverage['/editor/styles.js'].lineData[374] = 0;
  _$jscoverage['/editor/styles.js'].lineData[376] = 0;
  _$jscoverage['/editor/styles.js'].lineData[379] = 0;
  _$jscoverage['/editor/styles.js'].lineData[382] = 0;
  _$jscoverage['/editor/styles.js'].lineData[384] = 0;
  _$jscoverage['/editor/styles.js'].lineData[388] = 0;
  _$jscoverage['/editor/styles.js'].lineData[390] = 0;
  _$jscoverage['/editor/styles.js'].lineData[392] = 0;
  _$jscoverage['/editor/styles.js'].lineData[393] = 0;
  _$jscoverage['/editor/styles.js'].lineData[394] = 0;
  _$jscoverage['/editor/styles.js'].lineData[396] = 0;
  _$jscoverage['/editor/styles.js'].lineData[400] = 0;
  _$jscoverage['/editor/styles.js'].lineData[401] = 0;
  _$jscoverage['/editor/styles.js'].lineData[404] = 0;
  _$jscoverage['/editor/styles.js'].lineData[406] = 0;
  _$jscoverage['/editor/styles.js'].lineData[407] = 0;
  _$jscoverage['/editor/styles.js'].lineData[408] = 0;
  _$jscoverage['/editor/styles.js'].lineData[410] = 0;
  _$jscoverage['/editor/styles.js'].lineData[416] = 0;
  _$jscoverage['/editor/styles.js'].lineData[418] = 0;
  _$jscoverage['/editor/styles.js'].lineData[421] = 0;
  _$jscoverage['/editor/styles.js'].lineData[424] = 0;
  _$jscoverage['/editor/styles.js'].lineData[428] = 0;
  _$jscoverage['/editor/styles.js'].lineData[431] = 0;
  _$jscoverage['/editor/styles.js'].lineData[434] = 0;
  _$jscoverage['/editor/styles.js'].lineData[435] = 0;
  _$jscoverage['/editor/styles.js'].lineData[436] = 0;
  _$jscoverage['/editor/styles.js'].lineData[437] = 0;
  _$jscoverage['/editor/styles.js'].lineData[438] = 0;
  _$jscoverage['/editor/styles.js'].lineData[439] = 0;
  _$jscoverage['/editor/styles.js'].lineData[442] = 0;
  _$jscoverage['/editor/styles.js'].lineData[444] = 0;
  _$jscoverage['/editor/styles.js'].lineData[449] = 0;
  _$jscoverage['/editor/styles.js'].lineData[452] = 0;
  _$jscoverage['/editor/styles.js'].lineData[457] = 0;
  _$jscoverage['/editor/styles.js'].lineData[460] = 0;
  _$jscoverage['/editor/styles.js'].lineData[461] = 0;
  _$jscoverage['/editor/styles.js'].lineData[463] = 0;
  _$jscoverage['/editor/styles.js'].lineData[465] = 0;
  _$jscoverage['/editor/styles.js'].lineData[471] = 0;
  _$jscoverage['/editor/styles.js'].lineData[472] = 0;
  _$jscoverage['/editor/styles.js'].lineData[477] = 0;
  _$jscoverage['/editor/styles.js'].lineData[478] = 0;
  _$jscoverage['/editor/styles.js'].lineData[479] = 0;
  _$jscoverage['/editor/styles.js'].lineData[481] = 0;
  _$jscoverage['/editor/styles.js'].lineData[483] = 0;
  _$jscoverage['/editor/styles.js'].lineData[485] = 0;
  _$jscoverage['/editor/styles.js'].lineData[486] = 0;
  _$jscoverage['/editor/styles.js'].lineData[488] = 0;
  _$jscoverage['/editor/styles.js'].lineData[493] = 0;
  _$jscoverage['/editor/styles.js'].lineData[494] = 0;
  _$jscoverage['/editor/styles.js'].lineData[495] = 0;
  _$jscoverage['/editor/styles.js'].lineData[497] = 0;
  _$jscoverage['/editor/styles.js'].lineData[506] = 0;
  _$jscoverage['/editor/styles.js'].lineData[510] = 0;
  _$jscoverage['/editor/styles.js'].lineData[511] = 0;
  _$jscoverage['/editor/styles.js'].lineData[513] = 0;
  _$jscoverage['/editor/styles.js'].lineData[515] = 0;
  _$jscoverage['/editor/styles.js'].lineData[520] = 0;
  _$jscoverage['/editor/styles.js'].lineData[521] = 0;
  _$jscoverage['/editor/styles.js'].lineData[522] = 0;
  _$jscoverage['/editor/styles.js'].lineData[523] = 0;
  _$jscoverage['/editor/styles.js'].lineData[527] = 0;
  _$jscoverage['/editor/styles.js'].lineData[528] = 0;
  _$jscoverage['/editor/styles.js'].lineData[529] = 0;
  _$jscoverage['/editor/styles.js'].lineData[531] = 0;
  _$jscoverage['/editor/styles.js'].lineData[532] = 0;
  _$jscoverage['/editor/styles.js'].lineData[533] = 0;
  _$jscoverage['/editor/styles.js'].lineData[534] = 0;
  _$jscoverage['/editor/styles.js'].lineData[535] = 0;
  _$jscoverage['/editor/styles.js'].lineData[537] = 0;
  _$jscoverage['/editor/styles.js'].lineData[542] = 0;
  _$jscoverage['/editor/styles.js'].lineData[543] = 0;
  _$jscoverage['/editor/styles.js'].lineData[545] = 0;
  _$jscoverage['/editor/styles.js'].lineData[548] = 0;
  _$jscoverage['/editor/styles.js'].lineData[549] = 0;
  _$jscoverage['/editor/styles.js'].lineData[550] = 0;
  _$jscoverage['/editor/styles.js'].lineData[552] = 0;
  _$jscoverage['/editor/styles.js'].lineData[555] = 0;
  _$jscoverage['/editor/styles.js'].lineData[556] = 0;
  _$jscoverage['/editor/styles.js'].lineData[559] = 0;
  _$jscoverage['/editor/styles.js'].lineData[561] = 0;
  _$jscoverage['/editor/styles.js'].lineData[563] = 0;
  _$jscoverage['/editor/styles.js'].lineData[565] = 0;
  _$jscoverage['/editor/styles.js'].lineData[566] = 0;
  _$jscoverage['/editor/styles.js'].lineData[568] = 0;
  _$jscoverage['/editor/styles.js'].lineData[573] = 0;
  _$jscoverage['/editor/styles.js'].lineData[574] = 0;
  _$jscoverage['/editor/styles.js'].lineData[575] = 0;
  _$jscoverage['/editor/styles.js'].lineData[579] = 0;
  _$jscoverage['/editor/styles.js'].lineData[582] = 0;
  _$jscoverage['/editor/styles.js'].lineData[583] = 0;
  _$jscoverage['/editor/styles.js'].lineData[587] = 0;
  _$jscoverage['/editor/styles.js'].lineData[593] = 0;
  _$jscoverage['/editor/styles.js'].lineData[594] = 0;
  _$jscoverage['/editor/styles.js'].lineData[596] = 0;
  _$jscoverage['/editor/styles.js'].lineData[597] = 0;
  _$jscoverage['/editor/styles.js'].lineData[598] = 0;
  _$jscoverage['/editor/styles.js'].lineData[601] = 0;
  _$jscoverage['/editor/styles.js'].lineData[605] = 0;
  _$jscoverage['/editor/styles.js'].lineData[606] = 0;
  _$jscoverage['/editor/styles.js'].lineData[607] = 0;
  _$jscoverage['/editor/styles.js'].lineData[611] = 0;
  _$jscoverage['/editor/styles.js'].lineData[622] = 0;
  _$jscoverage['/editor/styles.js'].lineData[633] = 0;
  _$jscoverage['/editor/styles.js'].lineData[636] = 0;
  _$jscoverage['/editor/styles.js'].lineData[637] = 0;
  _$jscoverage['/editor/styles.js'].lineData[638] = 0;
  _$jscoverage['/editor/styles.js'].lineData[639] = 0;
  _$jscoverage['/editor/styles.js'].lineData[644] = 0;
  _$jscoverage['/editor/styles.js'].lineData[653] = 0;
  _$jscoverage['/editor/styles.js'].lineData[665] = 0;
  _$jscoverage['/editor/styles.js'].lineData[666] = 0;
  _$jscoverage['/editor/styles.js'].lineData[671] = 0;
  _$jscoverage['/editor/styles.js'].lineData[673] = 0;
  _$jscoverage['/editor/styles.js'].lineData[686] = 0;
  _$jscoverage['/editor/styles.js'].lineData[698] = 0;
  _$jscoverage['/editor/styles.js'].lineData[701] = 0;
  _$jscoverage['/editor/styles.js'].lineData[706] = 0;
  _$jscoverage['/editor/styles.js'].lineData[709] = 0;
  _$jscoverage['/editor/styles.js'].lineData[712] = 0;
  _$jscoverage['/editor/styles.js'].lineData[716] = 0;
  _$jscoverage['/editor/styles.js'].lineData[718] = 0;
  _$jscoverage['/editor/styles.js'].lineData[724] = 0;
  _$jscoverage['/editor/styles.js'].lineData[733] = 0;
  _$jscoverage['/editor/styles.js'].lineData[737] = 0;
  _$jscoverage['/editor/styles.js'].lineData[738] = 0;
  _$jscoverage['/editor/styles.js'].lineData[739] = 0;
  _$jscoverage['/editor/styles.js'].lineData[741] = 0;
  _$jscoverage['/editor/styles.js'].lineData[743] = 0;
  _$jscoverage['/editor/styles.js'].lineData[745] = 0;
  _$jscoverage['/editor/styles.js'].lineData[747] = 0;
  _$jscoverage['/editor/styles.js'].lineData[749] = 0;
  _$jscoverage['/editor/styles.js'].lineData[756] = 0;
  _$jscoverage['/editor/styles.js'].lineData[758] = 0;
  _$jscoverage['/editor/styles.js'].lineData[760] = 0;
  _$jscoverage['/editor/styles.js'].lineData[762] = 0;
  _$jscoverage['/editor/styles.js'].lineData[764] = 0;
  _$jscoverage['/editor/styles.js'].lineData[766] = 0;
  _$jscoverage['/editor/styles.js'].lineData[770] = 0;
  _$jscoverage['/editor/styles.js'].lineData[771] = 0;
  _$jscoverage['/editor/styles.js'].lineData[772] = 0;
  _$jscoverage['/editor/styles.js'].lineData[776] = 0;
  _$jscoverage['/editor/styles.js'].lineData[779] = 0;
  _$jscoverage['/editor/styles.js'].lineData[781] = 0;
  _$jscoverage['/editor/styles.js'].lineData[785] = 0;
  _$jscoverage['/editor/styles.js'].lineData[789] = 0;
  _$jscoverage['/editor/styles.js'].lineData[792] = 0;
  _$jscoverage['/editor/styles.js'].lineData[800] = 0;
  _$jscoverage['/editor/styles.js'].lineData[801] = 0;
  _$jscoverage['/editor/styles.js'].lineData[814] = 0;
  _$jscoverage['/editor/styles.js'].lineData[815] = 0;
  _$jscoverage['/editor/styles.js'].lineData[816] = 0;
  _$jscoverage['/editor/styles.js'].lineData[817] = 0;
  _$jscoverage['/editor/styles.js'].lineData[818] = 0;
  _$jscoverage['/editor/styles.js'].lineData[823] = 0;
  _$jscoverage['/editor/styles.js'].lineData[827] = 0;
  _$jscoverage['/editor/styles.js'].lineData[828] = 0;
  _$jscoverage['/editor/styles.js'].lineData[829] = 0;
  _$jscoverage['/editor/styles.js'].lineData[831] = 0;
  _$jscoverage['/editor/styles.js'].lineData[835] = 0;
  _$jscoverage['/editor/styles.js'].lineData[840] = 0;
  _$jscoverage['/editor/styles.js'].lineData[842] = 0;
  _$jscoverage['/editor/styles.js'].lineData[845] = 0;
  _$jscoverage['/editor/styles.js'].lineData[847] = 0;
  _$jscoverage['/editor/styles.js'].lineData[852] = 0;
  _$jscoverage['/editor/styles.js'].lineData[861] = 0;
  _$jscoverage['/editor/styles.js'].lineData[863] = 0;
  _$jscoverage['/editor/styles.js'].lineData[865] = 0;
  _$jscoverage['/editor/styles.js'].lineData[866] = 0;
  _$jscoverage['/editor/styles.js'].lineData[869] = 0;
  _$jscoverage['/editor/styles.js'].lineData[870] = 0;
  _$jscoverage['/editor/styles.js'].lineData[871] = 0;
  _$jscoverage['/editor/styles.js'].lineData[879] = 0;
  _$jscoverage['/editor/styles.js'].lineData[883] = 0;
  _$jscoverage['/editor/styles.js'].lineData[884] = 0;
  _$jscoverage['/editor/styles.js'].lineData[885] = 0;
  _$jscoverage['/editor/styles.js'].lineData[888] = 0;
  _$jscoverage['/editor/styles.js'].lineData[898] = 0;
  _$jscoverage['/editor/styles.js'].lineData[899] = 0;
  _$jscoverage['/editor/styles.js'].lineData[900] = 0;
  _$jscoverage['/editor/styles.js'].lineData[901] = 0;
  _$jscoverage['/editor/styles.js'].lineData[902] = 0;
  _$jscoverage['/editor/styles.js'].lineData[903] = 0;
  _$jscoverage['/editor/styles.js'].lineData[905] = 0;
  _$jscoverage['/editor/styles.js'].lineData[906] = 0;
  _$jscoverage['/editor/styles.js'].lineData[908] = 0;
  _$jscoverage['/editor/styles.js'].lineData[909] = 0;
  _$jscoverage['/editor/styles.js'].lineData[910] = 0;
  _$jscoverage['/editor/styles.js'].lineData[916] = 0;
  _$jscoverage['/editor/styles.js'].lineData[919] = 0;
  _$jscoverage['/editor/styles.js'].lineData[920] = 0;
  _$jscoverage['/editor/styles.js'].lineData[923] = 0;
  _$jscoverage['/editor/styles.js'].lineData[926] = 0;
  _$jscoverage['/editor/styles.js'].lineData[927] = 0;
  _$jscoverage['/editor/styles.js'].lineData[935] = 0;
  _$jscoverage['/editor/styles.js'].lineData[942] = 0;
  _$jscoverage['/editor/styles.js'].lineData[943] = 0;
  _$jscoverage['/editor/styles.js'].lineData[947] = 0;
  _$jscoverage['/editor/styles.js'].lineData[948] = 0;
  _$jscoverage['/editor/styles.js'].lineData[950] = 0;
  _$jscoverage['/editor/styles.js'].lineData[952] = 0;
  _$jscoverage['/editor/styles.js'].lineData[954] = 0;
  _$jscoverage['/editor/styles.js'].lineData[955] = 0;
  _$jscoverage['/editor/styles.js'].lineData[957] = 0;
  _$jscoverage['/editor/styles.js'].lineData[958] = 0;
  _$jscoverage['/editor/styles.js'].lineData[960] = 0;
  _$jscoverage['/editor/styles.js'].lineData[962] = 0;
  _$jscoverage['/editor/styles.js'].lineData[964] = 0;
  _$jscoverage['/editor/styles.js'].lineData[965] = 0;
  _$jscoverage['/editor/styles.js'].lineData[968] = 0;
  _$jscoverage['/editor/styles.js'].lineData[969] = 0;
  _$jscoverage['/editor/styles.js'].lineData[970] = 0;
  _$jscoverage['/editor/styles.js'].lineData[971] = 0;
  _$jscoverage['/editor/styles.js'].lineData[974] = 0;
  _$jscoverage['/editor/styles.js'].lineData[977] = 0;
  _$jscoverage['/editor/styles.js'].lineData[978] = 0;
  _$jscoverage['/editor/styles.js'].lineData[983] = 0;
  _$jscoverage['/editor/styles.js'].lineData[984] = 0;
  _$jscoverage['/editor/styles.js'].lineData[988] = 0;
  _$jscoverage['/editor/styles.js'].lineData[989] = 0;
  _$jscoverage['/editor/styles.js'].lineData[991] = 0;
  _$jscoverage['/editor/styles.js'].lineData[992] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1003] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1005] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1006] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1009] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1012] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1016] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1017] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1018] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1020] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1022] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1024] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1027] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1028] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1029] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1030] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1034] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1038] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1042] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1045] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1046] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1047] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1050] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1051] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1053] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1056] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1060] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1070] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1072] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1073] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1074] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1076] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1078] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1082] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1083] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1085] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1086] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1092] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1093] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1094] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1095] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1096] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1101] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1104] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1113] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1114] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1115] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1117] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1120] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1123] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1124] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1127] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1128] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1129] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1130] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1131] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1134] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1135] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1138] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1141] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1142] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1148] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1151] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1155] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1157] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1161] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1166] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1170] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1172] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1176] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1182] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1186] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1187] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1198] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1201] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1204] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1205] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1206] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1210] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1213] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1216] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1218] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1220] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1226] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1229] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1230] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1231] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1232] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1236] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1237] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1243] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1244] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1249] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1251] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1252] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1253] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1254] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1255] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1268] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1269] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1271] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1272] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1273] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1275] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1276] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1284] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1287] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1292] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1294] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1295] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1296] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1298] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1299] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1300] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1304] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1309] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1313] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1316] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1319] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1322] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1324] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1326] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1329] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1331] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1336] = 0;
  _$jscoverage['/editor/styles.js'].lineData[1338] = 0;
}
if (! _$jscoverage['/editor/styles.js'].functionData) {
  _$jscoverage['/editor/styles.js'].functionData = [];
  _$jscoverage['/editor/styles.js'].functionData[0] = 0;
  _$jscoverage['/editor/styles.js'].functionData[1] = 0;
  _$jscoverage['/editor/styles.js'].functionData[2] = 0;
  _$jscoverage['/editor/styles.js'].functionData[3] = 0;
  _$jscoverage['/editor/styles.js'].functionData[4] = 0;
  _$jscoverage['/editor/styles.js'].functionData[5] = 0;
  _$jscoverage['/editor/styles.js'].functionData[6] = 0;
  _$jscoverage['/editor/styles.js'].functionData[7] = 0;
  _$jscoverage['/editor/styles.js'].functionData[8] = 0;
  _$jscoverage['/editor/styles.js'].functionData[9] = 0;
  _$jscoverage['/editor/styles.js'].functionData[10] = 0;
  _$jscoverage['/editor/styles.js'].functionData[11] = 0;
  _$jscoverage['/editor/styles.js'].functionData[12] = 0;
  _$jscoverage['/editor/styles.js'].functionData[13] = 0;
  _$jscoverage['/editor/styles.js'].functionData[14] = 0;
  _$jscoverage['/editor/styles.js'].functionData[15] = 0;
  _$jscoverage['/editor/styles.js'].functionData[16] = 0;
  _$jscoverage['/editor/styles.js'].functionData[17] = 0;
  _$jscoverage['/editor/styles.js'].functionData[18] = 0;
  _$jscoverage['/editor/styles.js'].functionData[19] = 0;
  _$jscoverage['/editor/styles.js'].functionData[20] = 0;
  _$jscoverage['/editor/styles.js'].functionData[21] = 0;
  _$jscoverage['/editor/styles.js'].functionData[22] = 0;
  _$jscoverage['/editor/styles.js'].functionData[23] = 0;
  _$jscoverage['/editor/styles.js'].functionData[24] = 0;
  _$jscoverage['/editor/styles.js'].functionData[25] = 0;
  _$jscoverage['/editor/styles.js'].functionData[26] = 0;
  _$jscoverage['/editor/styles.js'].functionData[27] = 0;
  _$jscoverage['/editor/styles.js'].functionData[28] = 0;
  _$jscoverage['/editor/styles.js'].functionData[29] = 0;
  _$jscoverage['/editor/styles.js'].functionData[30] = 0;
  _$jscoverage['/editor/styles.js'].functionData[31] = 0;
  _$jscoverage['/editor/styles.js'].functionData[32] = 0;
  _$jscoverage['/editor/styles.js'].functionData[33] = 0;
  _$jscoverage['/editor/styles.js'].functionData[34] = 0;
  _$jscoverage['/editor/styles.js'].functionData[35] = 0;
  _$jscoverage['/editor/styles.js'].functionData[36] = 0;
  _$jscoverage['/editor/styles.js'].functionData[37] = 0;
  _$jscoverage['/editor/styles.js'].functionData[38] = 0;
  _$jscoverage['/editor/styles.js'].functionData[39] = 0;
  _$jscoverage['/editor/styles.js'].functionData[40] = 0;
}
if (! _$jscoverage['/editor/styles.js'].branchData) {
  _$jscoverage['/editor/styles.js'].branchData = {};
  _$jscoverage['/editor/styles.js'].branchData['87'] = [];
  _$jscoverage['/editor/styles.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['104'] = [];
  _$jscoverage['/editor/styles.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['109'] = [];
  _$jscoverage['/editor/styles.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['111'] = [];
  _$jscoverage['/editor/styles.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['111'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['132'] = [];
  _$jscoverage['/editor/styles.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['153'] = [];
  _$jscoverage['/editor/styles.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['155'] = [];
  _$jscoverage['/editor/styles.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['157'] = [];
  _$jscoverage['/editor/styles.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['167'] = [];
  _$jscoverage['/editor/styles.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['175'] = [];
  _$jscoverage['/editor/styles.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['182'] = [];
  _$jscoverage['/editor/styles.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['184'] = [];
  _$jscoverage['/editor/styles.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['189'] = [];
  _$jscoverage['/editor/styles.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['192'] = [];
  _$jscoverage['/editor/styles.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['195'] = [];
  _$jscoverage['/editor/styles.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['196'] = [];
  _$jscoverage['/editor/styles.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['196'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['199'] = [];
  _$jscoverage['/editor/styles.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['200'] = [];
  _$jscoverage['/editor/styles.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['203'] = [];
  _$jscoverage['/editor/styles.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['207'] = [];
  _$jscoverage['/editor/styles.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['216'] = [];
  _$jscoverage['/editor/styles.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['218'] = [];
  _$jscoverage['/editor/styles.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['220'] = [];
  _$jscoverage['/editor/styles.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['224'] = [];
  _$jscoverage['/editor/styles.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['225'] = [];
  _$jscoverage['/editor/styles.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['228'] = [];
  _$jscoverage['/editor/styles.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['236'] = [];
  _$jscoverage['/editor/styles.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['236'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['237'] = [];
  _$jscoverage['/editor/styles.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['237'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['237'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['238'] = [];
  _$jscoverage['/editor/styles.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['239'] = [];
  _$jscoverage['/editor/styles.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['244'] = [];
  _$jscoverage['/editor/styles.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['245'] = [];
  _$jscoverage['/editor/styles.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['248'] = [];
  _$jscoverage['/editor/styles.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['250'] = [];
  _$jscoverage['/editor/styles.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['250'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['253'] = [];
  _$jscoverage['/editor/styles.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['253'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['253'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['254'] = [];
  _$jscoverage['/editor/styles.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['255'] = [];
  _$jscoverage['/editor/styles.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['271'] = [];
  _$jscoverage['/editor/styles.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['279'] = [];
  _$jscoverage['/editor/styles.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['282'] = [];
  _$jscoverage['/editor/styles.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['282'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['283'] = [];
  _$jscoverage['/editor/styles.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['287'] = [];
  _$jscoverage['/editor/styles.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['287'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['291'] = [];
  _$jscoverage['/editor/styles.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['303'] = [];
  _$jscoverage['/editor/styles.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['309'] = [];
  _$jscoverage['/editor/styles.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['309'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['313'] = [];
  _$jscoverage['/editor/styles.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['322'] = [];
  _$jscoverage['/editor/styles.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['331'] = [];
  _$jscoverage['/editor/styles.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['346'] = [];
  _$jscoverage['/editor/styles.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['353'] = [];
  _$jscoverage['/editor/styles.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['365'] = [];
  _$jscoverage['/editor/styles.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['373'] = [];
  _$jscoverage['/editor/styles.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['406'] = [];
  _$jscoverage['/editor/styles.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['407'] = [];
  _$jscoverage['/editor/styles.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['434'] = [];
  _$jscoverage['/editor/styles.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['472'] = [];
  _$jscoverage['/editor/styles.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['473'] = [];
  _$jscoverage['/editor/styles.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['474'] = [];
  _$jscoverage['/editor/styles.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['475'] = [];
  _$jscoverage['/editor/styles.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['477'] = [];
  _$jscoverage['/editor/styles.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['479'] = [];
  _$jscoverage['/editor/styles.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['486'] = [];
  _$jscoverage['/editor/styles.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['495'] = [];
  _$jscoverage['/editor/styles.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['495'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['496'] = [];
  _$jscoverage['/editor/styles.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['510'] = [];
  _$jscoverage['/editor/styles.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['522'] = [];
  _$jscoverage['/editor/styles.js'].branchData['522'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['532'] = [];
  _$jscoverage['/editor/styles.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['534'] = [];
  _$jscoverage['/editor/styles.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['559'] = [];
  _$jscoverage['/editor/styles.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['573'] = [];
  _$jscoverage['/editor/styles.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['593'] = [];
  _$jscoverage['/editor/styles.js'].branchData['593'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['596'] = [];
  _$jscoverage['/editor/styles.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['602'] = [];
  _$jscoverage['/editor/styles.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['605'] = [];
  _$jscoverage['/editor/styles.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['611'] = [];
  _$jscoverage['/editor/styles.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['612'] = [];
  _$jscoverage['/editor/styles.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['613'] = [];
  _$jscoverage['/editor/styles.js'].branchData['613'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['613'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['620'] = [];
  _$jscoverage['/editor/styles.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['633'] = [];
  _$jscoverage['/editor/styles.js'].branchData['633'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['634'] = [];
  _$jscoverage['/editor/styles.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['634'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['635'] = [];
  _$jscoverage['/editor/styles.js'].branchData['635'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['644'] = [];
  _$jscoverage['/editor/styles.js'].branchData['644'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['644'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['645'] = [];
  _$jscoverage['/editor/styles.js'].branchData['645'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['645'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['646'] = [];
  _$jscoverage['/editor/styles.js'].branchData['646'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['648'] = [];
  _$jscoverage['/editor/styles.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['653'] = [];
  _$jscoverage['/editor/styles.js'].branchData['653'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['654'] = [];
  _$jscoverage['/editor/styles.js'].branchData['654'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['655'] = [];
  _$jscoverage['/editor/styles.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['656'] = [];
  _$jscoverage['/editor/styles.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['671'] = [];
  _$jscoverage['/editor/styles.js'].branchData['671'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['671'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['672'] = [];
  _$jscoverage['/editor/styles.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['672'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['687'] = [];
  _$jscoverage['/editor/styles.js'].branchData['687'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['688'] = [];
  _$jscoverage['/editor/styles.js'].branchData['688'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['688'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['690'] = [];
  _$jscoverage['/editor/styles.js'].branchData['690'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['690'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['697'] = [];
  _$jscoverage['/editor/styles.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['716'] = [];
  _$jscoverage['/editor/styles.js'].branchData['716'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['716'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['737'] = [];
  _$jscoverage['/editor/styles.js'].branchData['737'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['737'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['737'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['738'] = [];
  _$jscoverage['/editor/styles.js'].branchData['738'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['741'] = [];
  _$jscoverage['/editor/styles.js'].branchData['741'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['745'] = [];
  _$jscoverage['/editor/styles.js'].branchData['745'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['758'] = [];
  _$jscoverage['/editor/styles.js'].branchData['758'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['762'] = [];
  _$jscoverage['/editor/styles.js'].branchData['762'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['770'] = [];
  _$jscoverage['/editor/styles.js'].branchData['770'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['779'] = [];
  _$jscoverage['/editor/styles.js'].branchData['779'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['800'] = [];
  _$jscoverage['/editor/styles.js'].branchData['800'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['845'] = [];
  _$jscoverage['/editor/styles.js'].branchData['845'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['852'] = [];
  _$jscoverage['/editor/styles.js'].branchData['852'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['852'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['861'] = [];
  _$jscoverage['/editor/styles.js'].branchData['861'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['861'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['862'] = [];
  _$jscoverage['/editor/styles.js'].branchData['862'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['865'] = [];
  _$jscoverage['/editor/styles.js'].branchData['865'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['867'] = [];
  _$jscoverage['/editor/styles.js'].branchData['867'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['869'] = [];
  _$jscoverage['/editor/styles.js'].branchData['869'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['883'] = [];
  _$jscoverage['/editor/styles.js'].branchData['883'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['886'] = [];
  _$jscoverage['/editor/styles.js'].branchData['886'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['898'] = [];
  _$jscoverage['/editor/styles.js'].branchData['898'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['902'] = [];
  _$jscoverage['/editor/styles.js'].branchData['902'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['905'] = [];
  _$jscoverage['/editor/styles.js'].branchData['905'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['915'] = [];
  _$jscoverage['/editor/styles.js'].branchData['915'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['920'] = [];
  _$jscoverage['/editor/styles.js'].branchData['920'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['922'] = [];
  _$jscoverage['/editor/styles.js'].branchData['922'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['926'] = [];
  _$jscoverage['/editor/styles.js'].branchData['926'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['947'] = [];
  _$jscoverage['/editor/styles.js'].branchData['947'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['950'] = [];
  _$jscoverage['/editor/styles.js'].branchData['950'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['950'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['951'] = [];
  _$jscoverage['/editor/styles.js'].branchData['951'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['954'] = [];
  _$jscoverage['/editor/styles.js'].branchData['954'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['957'] = [];
  _$jscoverage['/editor/styles.js'].branchData['957'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['960'] = [];
  _$jscoverage['/editor/styles.js'].branchData['960'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['960'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['961'] = [];
  _$jscoverage['/editor/styles.js'].branchData['961'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['964'] = [];
  _$jscoverage['/editor/styles.js'].branchData['964'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['968'] = [];
  _$jscoverage['/editor/styles.js'].branchData['968'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['970'] = [];
  _$jscoverage['/editor/styles.js'].branchData['970'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['978'] = [];
  _$jscoverage['/editor/styles.js'].branchData['978'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['984'] = [];
  _$jscoverage['/editor/styles.js'].branchData['984'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['985'] = [];
  _$jscoverage['/editor/styles.js'].branchData['985'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['985'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['988'] = [];
  _$jscoverage['/editor/styles.js'].branchData['988'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['993'] = [];
  _$jscoverage['/editor/styles.js'].branchData['993'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1003'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1003'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1003'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1028'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1028'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1028'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1029'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1029'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1029'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1034'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1034'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1034'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1035'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1035'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1035'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1036'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1036'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1036'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1037'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1037'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1047'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1047'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1053'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1053'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1073'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1073'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1082'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1082'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1093'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1093'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1094'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1094'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1114'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1114'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1120'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1120'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1123'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1123'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1127'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1127'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1134'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1134'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1148'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1148'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1151'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1151'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1156'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1156'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1166'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1166'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1171'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1171'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1190'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1190'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1190'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1192'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1192'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1192'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1194'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1194'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1201'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1201'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1201'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1201'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1202'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1202'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1205'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1205'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1213'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1213'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1214'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1214'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1218'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1218'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1243'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1243'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1251'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1251'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1253'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1253'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1269'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1269'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1271'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1271'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1272'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1272'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1284'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1284'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1284'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1285'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1285'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1285'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1286'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1286'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1286'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1286'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1292'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1292'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1294'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1294'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1295'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1295'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1300'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1300'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1300'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1302'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1302'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1302'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1303'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1303'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1303'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1303'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1316'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1316'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1324'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1324'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1326'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1326'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1326'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1329'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1329'][1] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1329'][2] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1329'][3] = new BranchData();
  _$jscoverage['/editor/styles.js'].branchData['1330'] = [];
  _$jscoverage['/editor/styles.js'].branchData['1330'][1] = new BranchData();
}
_$jscoverage['/editor/styles.js'].branchData['1330'][1].init(47, 47, 'lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1044_1330_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1330'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1329'][3].init(214, 23, 'firstChild != lastChild');
function visit1043_1329_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1329'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1329'][2].init(214, 95, 'firstChild != lastChild && lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1042_1329_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1329'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1329'][1].init(201, 108, 'lastChild && firstChild != lastChild && lastChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1041_1329_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1329'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1326'][2].init(74, 48, 'firstChild.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit1040_1326_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1326'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1326'][1].init(74, 102, 'firstChild.nodeType == Dom.NodeType.ELEMENT_NODE && Dom._4e_mergeSiblings(firstChild)');
function visit1039_1326_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1326'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1324'][1].init(318, 10, 'firstChild');
function visit1038_1324_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1324'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1316'][1].init(118, 28, '!element._4e_hasAttributes()');
function visit1037_1316_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1316'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1303'][3].init(116, 30, 'actualStyleValue == styleValue');
function visit1036_1303_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1303'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1303'][2].init(83, 29, 'typeof styleValue == \'string\'');
function visit1035_1303_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1303'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1303'][1].init(83, 63, 'typeof styleValue == \'string\' && actualStyleValue == styleValue');
function visit1034_1303_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1303'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1302'][2].init(185, 51, 'styleValue.test && styleValue.test(actualAttrValue)');
function visit1033_1302_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1302'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1302'][1].init(104, 149, '(styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue == \'string\' && actualStyleValue == styleValue)');
function visit1032_1302_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1302'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1300'][2].init(78, 19, 'styleValue === NULL');
function visit1031_1300_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1300'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1300'][1].init(78, 254, 'styleValue === NULL || (styleValue.test && styleValue.test(actualAttrValue)) || (typeof styleValue == \'string\' && actualStyleValue == styleValue)');
function visit1030_1300_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1300'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1295'][1].init(26, 17, 'i < styles.length');
function visit1029_1295_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1295'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1294'][1].init(1139, 6, 'styles');
function visit1028_1294_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1294'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1292'][1].init(1090, 32, 'overrides && overrides["styles"]');
function visit1027_1292_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1292'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1286'][3].init(110, 27, 'actualAttrValue == attValue');
function visit1026_1286_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1286'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1286'][2].init(79, 27, 'typeof attValue == \'string\'');
function visit1025_1286_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1286'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1286'][1].init(79, 58, 'typeof attValue == \'string\' && actualAttrValue == attValue');
function visit1024_1286_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1286'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1285'][2].init(532, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit1023_1285_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1285'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1285'][1].init(47, 140, '(attValue.test && attValue.test(actualAttrValue)) || (typeof attValue == \'string\' && actualAttrValue == attValue)');
function visit1022_1285_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1285'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1284'][2].init(482, 17, 'attValue === NULL');
function visit1021_1284_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1284'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1284'][1].init(482, 188, 'attValue === NULL || (attValue.test && attValue.test(actualAttrValue)) || (typeof attValue == \'string\' && actualAttrValue == attValue)');
function visit1020_1284_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1284'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1272'][1].init(26, 21, 'i < attributes.length');
function visit1019_1272_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1272'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1271'][1].init(83, 10, 'attributes');
function visit1018_1271_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1271'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1269'][1].init(30, 36, 'overrides && overrides["attributes"]');
function visit1017_1269_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1269'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1253'][1].init(116, 6, 'i >= 0');
function visit1016_1253_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1253'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1251'][1].init(20, 35, 'overrideElement != style["element"]');
function visit1015_1251_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1251'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1243'][1].init(263, 8, '--i >= 0');
function visit1014_1243_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1243'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1218'][1].init(307, 41, 'removeEmpty || !!element.style(styleName)');
function visit1013_1218_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1218'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1214'][1].init(51, 100, 'element.style(styleName) != normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1012_1214_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1213'][1].init(97, 152, 'style._.definition["fullMatch"] && element.style(styleName) != normalizeProperty(styleName, styles[styleName], TRUE)');
function visit1011_1213_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1213'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1205'][1].init(307, 41, 'removeEmpty || !!element.hasAttr(attName)');
function visit1010_1205_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1205'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1202'][1].init(75, 91, 'element.attr(attName) != normalizeProperty(attName, attributes[attName])');
function visit1009_1202_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1201'][3].init(84, 18, 'attName == \'class\'');
function visit1008_1201_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['1201'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1201'][2].init(84, 53, 'attName == \'class\' || style._.definition["fullMatch"]');
function visit1007_1201_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1201'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1201'][1].init(84, 167, '(attName == \'class\' || style._.definition["fullMatch"]) && element.attr(attName) != normalizeProperty(attName, attributes[attName])');
function visit1006_1201_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1194'][1].init(466, 71, 'S.isEmptyObject(attributes) && S.isEmptyObject(styles)');
function visit1005_1194_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1194'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1192'][2].init(74, 20, 'overrides["*"] || {}');
function visit1004_1192_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1192'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1192'][1].init(40, 54, 'overrides[element.nodeName()] || overrides["*"] || {}');
function visit1003_1192_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1192'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1190'][2].init(78, 20, 'overrides["*"] || {}');
function visit1002_1190_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1190'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1190'][1].init(44, 54, 'overrides[element.nodeName()] || overrides["*"] || {}');
function visit1001_1190_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1190'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1171'][1].init(47, 35, 'overrideEl["styles"] || new Array()');
function visit1000_1171_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1171'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1166'][1].init(1755, 6, 'styles');
function visit999_1166_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1166'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1156'][1].init(51, 39, 'overrideEl["attributes"] || new Array()');
function visit998_1156_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1156'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1151'][1].init(1005, 5, 'attrs');
function visit997_1151_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1151'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1148'][1].init(898, 82, 'overrides[elementName] || (overrides[elementName] = {})');
function visit996_1148_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1148'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1134'][1].init(236, 27, 'typeof override == \'string\'');
function visit995_1134_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1134'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1127'][1].init(329, 21, 'i < definition.length');
function visit994_1127_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1127'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1123'][1].init(173, 22, '!S.isArray(definition)');
function visit993_1123_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1120'][1].init(201, 10, 'definition');
function visit992_1120_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1120'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1114'][1].init(14, 17, 'style._.overrides');
function visit991_1114_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1094'][1].init(18, 19, '!attribs[\'style\']');
function visit990_1094_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1094'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1093'][1].init(653, 9, 'styleText');
function visit989_1093_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1093'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1082'][1].init(342, 12, 'styleAttribs');
function visit988_1082_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1082'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1073'][1].init(118, 7, 'attribs');
function visit987_1073_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1073'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1053'][1].init(326, 24, 'temp.style.cssText || \'\'');
function visit986_1053_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1053'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1047'][1].init(43, 25, 'nativeNormalize !== FALSE');
function visit985_1047_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1047'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1037'][1].init(51, 27, 'target[name] == \'inherit\'');
function visit984_1037_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1037'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1036'][2].init(95, 27, 'source[name] == \'inherit\'');
function visit983_1036_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1036'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1036'][1].init(56, 79, 'source[name] == \'inherit\' || target[name] == \'inherit\'');
function visit982_1036_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1036'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1035'][2].init(36, 32, 'target[name] == source[name]');
function visit981_1035_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1035'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1035'][1].init(36, 136, 'target[name] == source[name] || source[name] == \'inherit\' || target[name] == \'inherit\'');
function visit980_1035_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1035'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1034'][2].init(126, 175, 'name in target && (target[name] == source[name] || source[name] == \'inherit\' || target[name] == \'inherit\')');
function visit979_1034_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1034'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1034'][1].init(123, 180, '!(name in target && (target[name] == source[name] || source[name] == \'inherit\' || target[name] == \'inherit\'))');
function visit978_1034_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1034'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1029'][2].init(85, 25, 'typeof target == \'string\'');
function visit977_1029_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1029'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1029'][1].init(85, 64, 'typeof target == \'string\' && (target = parseStyleText(target))');
function visit976_1029_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1029'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1028'][2].init(10, 25, 'typeof source == \'string\'');
function visit975_1028_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1028'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1028'][1].init(10, 64, 'typeof source == \'string\' && (source = parseStyleText(source))');
function visit974_1028_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1028'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1003'][2].init(891, 49, 'nextNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit973_1003_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['1003'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['1003'][1].init(891, 106, 'nextNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && nextNode.contains(startNode)');
function visit972_1003_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['1003'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['993'][1].init(57, 53, 'overrides[currentNode.nodeName()] || overrides["*"]');
function visit971_993_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['993'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['988'][1].init(99, 41, 'currentNode.nodeName() == this["element"]');
function visit970_988_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['988'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['985'][2].init(313, 52, 'currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit969_985_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['985'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['985'][1].init(38, 116, 'currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit968_985_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['985'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['984'][1].init(272, 155, 'currentNode[0] && currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE && this.checkElementRemovable(currentNode)');
function visit967_984_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['984'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['978'][1].init(1806, 29, 'currentNode[0] !== endNode[0]');
function visit966_978_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['978'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['970'][1].init(1119, 10, 'breakStart');
function visit965_970_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['970'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['968'][1].init(1032, 8, 'breakEnd');
function visit964_968_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['968'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['964'][1].init(225, 33, 'me.checkElementRemovable(element)');
function visit963_964_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['964'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['961'][1].init(52, 29, 'element == endPath.blockLimit');
function visit962_961_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['961'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['960'][2].init(82, 24, 'element == endPath.block');
function visit961_960_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['960'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['960'][1].init(82, 82, 'element == endPath.block || element == endPath.blockLimit');
function visit960_960_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['960'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['957'][1].init(650, 27, 'i < endPath.elements.length');
function visit959_957_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['957'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['954'][1].init(235, 33, 'me.checkElementRemovable(element)');
function visit958_954_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['954'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['951'][1].init(54, 31, 'element == startPath.blockLimit');
function visit957_951_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['951'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['950'][2].init(88, 26, 'element == startPath.block');
function visit956_950_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['950'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['950'][1].init(88, 86, 'element == startPath.block || element == startPath.blockLimit');
function visit955_950_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['950'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['947'][1].init(248, 29, 'i < startPath.elements.length');
function visit954_947_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['947'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['926'][1].init(1284, 9, 'UA.webkit');
function visit953_926_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['926'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['922'][1].init(65, 15, 'tmp == \'\\u200b\'');
function visit952_922_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['922'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['920'][1].init(1028, 81, '!tmp || tmp == \'\\u200b\'');
function visit951_920_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['920'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['915'][1].init(14, 32, 'boundaryElement.match == \'start\'');
function visit950_915_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['915'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['905'][1].init(247, 16, 'newElement.match');
function visit949_905_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['905'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['902'][1].init(89, 34, 'newElement.equals(boundaryElement)');
function visit948_902_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['902'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['898'][1].init(2671, 15, 'boundaryElement');
function visit947_898_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['898'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['886'][1].init(57, 51, '_overrides[element.nodeName()] || _overrides["*"]');
function visit946_886_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['886'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['883'][1].init(660, 34, 'element.nodeName() != this.element');
function visit945_883_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['883'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['869'][1].init(252, 30, 'startOfElement || endOfElement');
function visit944_869_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['869'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['867'][1].init(108, 94, '!endOfElement && range.checkBoundaryOfElement(element, KER.START)');
function visit943_867_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['867'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['865'][1].init(576, 35, 'this.checkElementRemovable(element)');
function visit942_865_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['865'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['862'][1].init(50, 31, 'element == startPath.blockLimit');
function visit941_862_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['862'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['861'][2].init(422, 26, 'element == startPath.block');
function visit940_861_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['861'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['861'][1].init(422, 82, 'element == startPath.block || element == startPath.blockLimit');
function visit939_861_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['861'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['852'][2].init(227, 29, 'i < startPath.elements.length');
function visit938_852_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['852'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['852'][1].init(227, 85, 'i < startPath.elements.length && (element = startPath.elements[i])');
function visit937_852_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['852'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['845'][1].init(316, 15, 'range.collapsed');
function visit936_845_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['845'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['800'][1].init(1185, 9, '!UA[\'ie\']');
function visit935_800_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['800'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['779'][1].init(2643, 9, 'styleNode');
function visit934_779_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['779'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['770'][1].init(1471, 30, '!styleNode._4e_hasAttributes()');
function visit933_770_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['770'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['762'][1].init(226, 35, 'styleNode.style(styleName) == value');
function visit932_762_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['762'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['758'][1].init(36, 110, 'removeList.blockedStyles[styleName] || !(value = parent.style(styleName))');
function visit931_758_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['758'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['745'][1].init(222, 32, 'styleNode.attr(attName) == value');
function visit930_745_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['745'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['741'][1].init(36, 106, 'removeList.blockedAttrs[attName] || !(value = parent.attr(styleName))');
function visit929_741_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['741'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['738'][1].init(26, 32, 'parent.nodeName() == elementName');
function visit928_738_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['738'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['737'][3].init(825, 25, 'styleNode[0] && parent[0]');
function visit927_737_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['737'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['737'][2].init(815, 35, 'parent && styleNode[0] && parent[0]');
function visit926_737_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['737'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['737'][1].init(802, 48, 'styleNode && parent && styleNode[0] && parent[0]');
function visit925_737_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['737'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['716'][2].init(6543, 35, 'styleRange && !styleRange.collapsed');
function visit924_716_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['716'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['716'][1].init(6529, 49, 'applyStyle && styleRange && !styleRange.collapsed');
function visit923_716_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['716'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['697'][1].init(468, 49, '!def["childRule"] || def["childRule"](parentNode)');
function visit922_697_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['690'][2].init(1142, 426, '(parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit921_690_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['690'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['690'][1].init(148, 520, '(parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](parentNode))');
function visit920_690_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['690'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['688'][2].init(992, 104, '(parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]');
function visit919_688_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['688'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['688'][1].init(91, 669, '((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](parentNode))');
function visit918_688_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['688'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['687'][1].init(41, 761, '(applyStyle = !includedNode.next(notBookmark, 1)) && ((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()]) && (parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](parentNode))');
function visit917_687_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['687'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['672'][2].init(68, 37, 'nodeType == Dom.NodeType.ELEMENT_NODE');
function visit916_672_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['672'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['672'][1].init(68, 74, 'nodeType == Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length');
function visit915_672_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['671'][2].init(1311, 34, 'nodeType == Dom.NodeType.TEXT_NODE');
function visit914_671_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['671'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['671'][1].init(1311, 145, 'nodeType == Dom.NodeType.TEXT_NODE || (nodeType == Dom.NodeType.ELEMENT_NODE && !currentNode[0].childNodes.length)');
function visit913_671_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['671'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['656'][1].init(67, 447, '(currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit912_656_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['655'][1].init(45, 515, '!DTD.$removeEmpty[nodeName] || (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit911_655_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['654'][1].init(45, 561, '!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit910_654_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['654'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['653'][1].init(342, 642, '!styleRange && (!nodeName || !DTD.$removeEmpty[nodeName] || (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))');
function visit909_653_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['648'][1].init(163, 54, '!def["parentRule"] || def["parentRule"](currentParent)');
function visit908_648_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['645'][2].init(-1, 69, 'DTD[currentParent.nodeName()] || DTD["span"]');
function visit907_645_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['645'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['646'][1].init(-1, 131, '(DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement');
function visit906_646_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['646'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['645'][1].init(48, 220, '((DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement) && (!def["parentRule"] || def["parentRule"](currentParent))');
function visit905_645_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['645'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['644'][2].init(1285, 269, 'currentParent[0] && ((DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement) && (!def["parentRule"] || def["parentRule"](currentParent))');
function visit904_644_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['644'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['644'][1].init(1268, 286, 'currentParent && currentParent[0] && ((DTD[currentParent.nodeName()] || DTD["span"])[elementName] || isUnknownElement) && (!def["parentRule"] || def["parentRule"](currentParent))');
function visit903_644_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['644'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['635'][1].init(46, 39, 'currentParent.nodeName() == elementName');
function visit902_635_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['635'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['634'][2].init(663, 18, 'elementName == "a"');
function visit901_634_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['634'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['634'][1].init(41, 86, 'elementName == "a" && currentParent.nodeName() == elementName');
function visit900_634_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['633'][1].init(619, 128, 'currentParent && elementName == "a" && currentParent.nodeName() == elementName');
function visit899_633_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['633'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['620'][1].init(412, 50, '!def["childRule"] || def["childRule"](currentNode)');
function visit898_620_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['613'][2].init(83, 382, '(currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)');
function visit897_613_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['613'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['613'][1].init(45, 465, '(currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](currentNode))');
function visit896_613_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['613'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['612'][1].init(-1, 511, 'dtd[nodeName] && (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](currentNode))');
function visit895_612_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['611'][1].init(486, 570, '!nodeName || (dtd[nodeName] && (currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED) && (!def["childRule"] || def["childRule"](currentNode)))');
function visit894_611_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['605'][1].init(209, 44, 'nodeName && currentNode.attr(\'_ke_bookmark\')');
function visit893_605_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['602'][1].init(71, 37, 'nodeType == Dom.NodeType.ELEMENT_NODE');
function visit892_602_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['596'][1].init(57, 33, 'Dom.equals(currentNode, lastNode)');
function visit891_596_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['593'][1].init(1431, 29, 'currentNode && currentNode[0]');
function visit890_593_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['593'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['573'][1].init(782, 4, '!dtd');
function visit889_573_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['559'][1].init(82, 15, 'range.collapsed');
function visit888_559_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['534'][1].init(135, 7, '!offset');
function visit887_534_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['532'][1].init(22, 17, 'match.length == 1');
function visit886_532_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['522'][1].init(101, 19, 'i < preHTMLs.length');
function visit885_522_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['522'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['510'][1].init(812, 8, 'UA[\'ie\']');
function visit884_510_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['496'][1].init(98, 33, 'previousBlock.nodeName() == \'pre\'');
function visit883_496_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['495'][2].init(47, 132, '(previousBlock = preBlock._4e_previousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() == \'pre\'');
function visit882_495_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['495'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['495'][1].init(42, 139, '!((previousBlock = preBlock._4e_previousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && previousBlock.nodeName() == \'pre\')');
function visit881_495_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['486'][1].init(595, 13, 'newBlockIsPre');
function visit880_486_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['479'][1].init(312, 9, 'isFromPre');
function visit879_479_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['477'][1].init(236, 7, 'isToPre');
function visit878_477_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['475'][1].init(180, 28, '!newBlockIsPre && blockIsPre');
function visit877_475_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['474'][1].init(125, 28, 'newBlockIsPre && !blockIsPre');
function visit876_474_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['473'][1].init(75, 25, 'block.nodeName == (\'pre\')');
function visit875_473_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['472'][1].init(30, 28, 'newBlock.nodeName == (\'pre\')');
function visit874_472_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['434'][1].init(962, 8, 'UA[\'ie\']');
function visit873_434_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['407'][1].init(64, 27, 'm2 && (tailBookmark = m2)');
function visit872_407_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['406'][1].init(18, 27, 'm1 && (headBookmark = m1)');
function visit871_406_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['373'][1].init(384, 6, 'styles');
function visit870_373_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['365'][1].init(195, 10, 'attributes');
function visit869_365_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['353'][1].init(439, 7, 'element');
function visit868_353_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['346'][1].init(189, 18, 'elementName == \'*\'');
function visit867_346_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['331'][1].init(1091, 17, 'stylesText.length');
function visit866_331_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['322'][1].init(251, 21, 'styleVal == \'inherit\'');
function visit865_322_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['313'][1].init(428, 17, 'stylesText.length');
function visit864_313_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['309'][2].init(276, 90, 'styleDefinition["attributes"] && styleDefinition["attributes"][\'style\']');
function visit863_309_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['309'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['309'][1].init(276, 98, '(styleDefinition["attributes"] && styleDefinition["attributes"][\'style\']) || \'\'');
function visit862_309_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['303'][1].init(120, 9, 'stylesDef');
function visit861_303_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['291'][1].init(511, 41, 'this.checkElementRemovable(element, TRUE)');
function visit860_291_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['287'][2].init(335, 30, 'this.type == KEST.STYLE_OBJECT');
function visit859_287_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['287'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['287'][1].init(335, 104, 'this.type == KEST.STYLE_OBJECT && !(element.nodeName() in objectElements)');
function visit858_287_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['283'][1].init(64, 114, 'Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit)');
function visit857_283_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['282'][2].init(82, 30, 'this.type == KEST.STYLE_INLINE');
function visit856_282_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['282'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['282'][1].init(82, 181, 'this.type == KEST.STYLE_INLINE && (Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))');
function visit855_282_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['279'][1].init(132, 19, 'i < elements.length');
function visit854_279_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['271'][1].init(78, 68, 'elementPath.block || elementPath.blockLimit');
function visit853_271_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['255'][1].init(134, 52, 'styleValue.test && styleValue.test(actualStyleValue)');
function visit852_255_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['254'][1].init(65, 30, 'actualStyleValue == styleValue');
function visit851_254_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['253'][3].init(270, 29, 'typeof styleValue == \'string\'');
function visit850_253_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['253'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['253'][2].init(270, 96, 'typeof styleValue == \'string\' && actualStyleValue == styleValue');
function visit849_253_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['253'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['253'][1].init(173, 187, '(typeof styleValue == \'string\' && actualStyleValue == styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit848_253_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['250'][2].init(94, 19, 'styleValue === NULL');
function visit847_250_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['250'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['250'][1].init(94, 361, 'styleValue === NULL || (typeof styleValue == \'string\' && actualStyleValue == styleValue) || styleValue.test && styleValue.test(actualStyleValue)');
function visit846_250_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['248'][1].init(157, 16, 'actualStyleValue');
function visit845_248_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['245'][1].init(34, 17, 'i < styles.length');
function visit844_245_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['244'][1].init(1421, 6, 'styles');
function visit843_244_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['239'][1].init(133, 47, 'attValue.test && attValue.test(actualAttrValue)');
function visit842_239_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['238'][1].init(67, 27, 'actualAttrValue == attValue');
function visit841_238_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['237'][3].init(598, 27, 'typeof attValue == \'string\'');
function visit840_237_3(result) {
  _$jscoverage['/editor/styles.js'].branchData['237'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['237'][2].init(598, 95, 'typeof attValue == \'string\' && actualAttrValue == attValue');
function visit839_237_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['237'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['237'][1].init(55, 181, '(typeof attValue == \'string\' && actualAttrValue == attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit838_237_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['236'][2].init(540, 17, 'attValue === NULL');
function visit837_236_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['236'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['236'][1].init(540, 237, 'attValue === NULL || (typeof attValue == \'string\' && actualAttrValue == attValue) || attValue.test && attValue.test(actualAttrValue)');
function visit836_236_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['228'][1].init(150, 15, 'actualAttrValue');
function visit835_228_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['225'][1].init(38, 18, 'i < attribs.length');
function visit834_225_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['224'][1].init(264, 7, 'attribs');
function visit833_224_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['220'][1].init(98, 87, '!(attribs = override.attributes) && !(styles = override.styles)');
function visit832_220_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['218'][1].init(1610, 8, 'override');
function visit831_218_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['216'][1].init(63, 49, 'overrides[element.nodeName()] || overrides["*"]');
function visit830_216_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['207'][1].init(728, 9, 'fullMatch');
function visit829_207_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['203'][1].init(573, 9, 'fullMatch');
function visit828_203_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['200'][1].init(34, 10, '!fullMatch');
function visit827_200_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['199'][1].init(186, 33, 'attribs[attName] == elementAttr');
function visit826_199_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['196'][2].init(196, 18, 'attName == \'style\'');
function visit825_196_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['196'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['196'][1].init(196, 220, 'attName == \'style\' ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : attribs[attName] == elementAttr');
function visit824_196_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['195'][1].init(138, 27, 'element.attr(attName) || \'\'');
function visit823_195_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['192'][1].init(32, 20, 'attName == \'_length\'');
function visit822_192_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['189'][1].init(250, 18, 'attribs["_length"]');
function visit821_189_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['184'][1].init(87, 42, '!fullMatch && !element._4e_hasAttributes()');
function visit820_184_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['182'][1].init(223, 34, 'element.nodeName() == this.element');
function visit819_182_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['175'][1].init(18, 8, '!element');
function visit818_175_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['167'][1].init(39, 30, 'self.type == KEST.STYLE_INLINE');
function visit817_167_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['157'][1].init(91, 30, 'self.type == KEST.STYLE_OBJECT');
function visit816_157_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['155'][1].init(93, 29, 'self.type == KEST.STYLE_BLOCK');
function visit815_155_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['153'][1].init(36, 30, 'this.type == KEST.STYLE_INLINE');
function visit814_153_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['132'][1].init(458, 17, 'i < ranges.length');
function visit813_132_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['111'][2].init(317, 18, 'element == \'#text\'');
function visit812_111_2(result) {
  _$jscoverage['/editor/styles.js'].branchData['111'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['111'][1].init(317, 46, 'element == \'#text\' || blockElements[element]');
function visit811_111_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['109'][1].init(226, 33, 'styleDefinition["element"] || \'*\'');
function visit810_109_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['104'][1].init(14, 15, 'variablesValues');
function visit809_104_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].branchData['87'][1].init(18, 33, 'typeof (list[item]) == \'string\'');
function visit808_87_1(result) {
  _$jscoverage['/editor/styles.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/styles.js'].lineData[10]++;
KISSY.add("editor/styles", function(S, Editor) {
  _$jscoverage['/editor/styles.js'].functionData[0]++;
  _$jscoverage['/editor/styles.js'].lineData[11]++;
  var TRUE = true, FALSE = false, NULL = null, $ = S.all, Dom = S.DOM, KER = Editor.RangeType, KESelection = Editor.Selection, KEP = Editor.PositionType, KERange = Editor.Range, KEST, Node = S.Node, UA = S.UA, ElementPath = Editor.ElementPath, blockElements = {
  "address": 1, 
  "div": 1, 
  "h1": 1, 
  "h2": 1, 
  "h3": 1, 
  "h4": 1, 
  "h5": 1, 
  "h6": 1, 
  "p": 1, 
  "pre": 1}, DTD = Editor.XHTML_DTD, objectElements = {
  "embed": 1, 
  "hr": 1, 
  "img": 1, 
  "li": 1, 
  "object": 1, 
  "ol": 1, 
  "table": 1, 
  "td": 1, 
  "tr": 1, 
  "th": 1, 
  "ul": 1, 
  "dl": 1, 
  "dt": 1, 
  "dd": 1, 
  "form": 1}, semicolonFixRegex = /\s*(?:;\s*|$)/g, varRegex = /#\((.+?)\)/g;
  _$jscoverage['/editor/styles.js'].lineData[64]++;
  Editor.StyleType = KEST = {
  STYLE_BLOCK: 1, 
  STYLE_INLINE: 2, 
  STYLE_OBJECT: 3};
  _$jscoverage['/editor/styles.js'].lineData[79]++;
  function notBookmark(node) {
    _$jscoverage['/editor/styles.js'].functionData[1]++;
    _$jscoverage['/editor/styles.js'].lineData[82]++;
    return !Dom.attr(node, "_ke_bookmark");
  }
  _$jscoverage['/editor/styles.js'].lineData[85]++;
  function replaceVariables(list, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[2]++;
    _$jscoverage['/editor/styles.js'].lineData[86]++;
    for (var item in list) {
      _$jscoverage['/editor/styles.js'].lineData[87]++;
      if (visit808_87_1(typeof (list[item]) == 'string')) {
        _$jscoverage['/editor/styles.js'].lineData[88]++;
        list[item] = list[item].replace(varRegex, function(match, varName) {
  _$jscoverage['/editor/styles.js'].functionData[3]++;
  _$jscoverage['/editor/styles.js'].lineData[89]++;
  return variablesValues[varName];
});
      } else {
        _$jscoverage['/editor/styles.js'].lineData[92]++;
        replaceVariables(list[item], variablesValues);
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[103]++;
  function KEStyle(styleDefinition, variablesValues) {
    _$jscoverage['/editor/styles.js'].functionData[4]++;
    _$jscoverage['/editor/styles.js'].lineData[104]++;
    if (visit809_104_1(variablesValues)) {
      _$jscoverage['/editor/styles.js'].lineData[105]++;
      styleDefinition = S.clone(styleDefinition);
      _$jscoverage['/editor/styles.js'].lineData[106]++;
      replaceVariables(styleDefinition, variablesValues);
    }
    _$jscoverage['/editor/styles.js'].lineData[109]++;
    var element = this["element"] = this.element = (visit810_109_1(styleDefinition["element"] || '*')).toLowerCase();
    _$jscoverage['/editor/styles.js'].lineData[111]++;
    this["type"] = this.type = (visit811_111_1(visit812_111_2(element == '#text') || blockElements[element])) ? KEST.STYLE_BLOCK : objectElements[element] ? KEST.STYLE_OBJECT : KEST.STYLE_INLINE;
    _$jscoverage['/editor/styles.js'].lineData[116]++;
    this._ = {
  "definition": styleDefinition};
  }
  _$jscoverage['/editor/styles.js'].lineData[121]++;
  function applyStyle(document, remove) {
    _$jscoverage['/editor/styles.js'].functionData[5]++;
    _$jscoverage['/editor/styles.js'].lineData[123]++;
    var self = this, func = remove ? self.removeFromRange : self.applyToRange;
    _$jscoverage['/editor/styles.js'].lineData[127]++;
    document.body.focus();
    _$jscoverage['/editor/styles.js'].lineData[129]++;
    var selection = new KESelection(document);
    _$jscoverage['/editor/styles.js'].lineData[131]++;
    var ranges = selection.getRanges();
    _$jscoverage['/editor/styles.js'].lineData[132]++;
    for (var i = 0; visit813_132_1(i < ranges.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[134]++;
      func.call(self, ranges[i]);
    }
    _$jscoverage['/editor/styles.js'].lineData[136]++;
    selection.selectRanges(ranges);
  }
  _$jscoverage['/editor/styles.js'].lineData[139]++;
  KEStyle.prototype = {
  constructor: KEStyle, 
  apply: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[6]++;
  _$jscoverage['/editor/styles.js'].lineData[143]++;
  applyStyle.call(this, document, FALSE);
}, 
  remove: function(document) {
  _$jscoverage['/editor/styles.js'].functionData[7]++;
  _$jscoverage['/editor/styles.js'].lineData[147]++;
  applyStyle.call(this, document, TRUE);
}, 
  applyToRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[8]++;
  _$jscoverage['/editor/styles.js'].lineData[151]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[152]++;
  return (self.applyToRange = visit814_153_1(this.type == KEST.STYLE_INLINE) ? applyInlineStyle : visit815_155_1(self.type == KEST.STYLE_BLOCK) ? applyBlockStyle : visit816_157_1(self.type == KEST.STYLE_OBJECT) ? NULL : NULL).call(self, range);
}, 
  removeFromRange: function(range) {
  _$jscoverage['/editor/styles.js'].functionData[9]++;
  _$jscoverage['/editor/styles.js'].lineData[165]++;
  var self = this;
  _$jscoverage['/editor/styles.js'].lineData[166]++;
  return (self.removeFromRange = visit817_167_1(self.type == KEST.STYLE_INLINE) ? removeInlineStyle : NULL).call(self, range);
}, 
  checkElementRemovable: function(element, fullMatch) {
  _$jscoverage['/editor/styles.js'].functionData[10]++;
  _$jscoverage['/editor/styles.js'].lineData[175]++;
  if (visit818_175_1(!element)) {
    _$jscoverage['/editor/styles.js'].lineData[176]++;
    return FALSE;
  }
  _$jscoverage['/editor/styles.js'].lineData[178]++;
  var def = this._.definition, attribs, styles;
  _$jscoverage['/editor/styles.js'].lineData[182]++;
  if (visit819_182_1(element.nodeName() == this.element)) {
    _$jscoverage['/editor/styles.js'].lineData[184]++;
    if (visit820_184_1(!fullMatch && !element._4e_hasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[185]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[187]++;
    attribs = getAttributesForComparison(def);
    _$jscoverage['/editor/styles.js'].lineData[189]++;
    if (visit821_189_1(attribs["_length"])) {
      _$jscoverage['/editor/styles.js'].lineData[190]++;
      for (var attName in attribs) {
        _$jscoverage['/editor/styles.js'].lineData[192]++;
        if (visit822_192_1(attName == '_length')) {
          _$jscoverage['/editor/styles.js'].lineData[193]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[195]++;
        var elementAttr = visit823_195_1(element.attr(attName) || '');
        _$jscoverage['/editor/styles.js'].lineData[196]++;
        if (visit824_196_1(visit825_196_2(attName == 'style') ? compareCssText(attribs[attName], normalizeCssText(elementAttr, FALSE)) : visit826_199_1(attribs[attName] == elementAttr))) {
          _$jscoverage['/editor/styles.js'].lineData[200]++;
          if (visit827_200_1(!fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[201]++;
            return TRUE;
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[203]++;
          if (visit828_203_1(fullMatch)) {
            _$jscoverage['/editor/styles.js'].lineData[204]++;
            return FALSE;
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[207]++;
      if (visit829_207_1(fullMatch)) {
        _$jscoverage['/editor/styles.js'].lineData[208]++;
        return TRUE;
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[211]++;
      return TRUE;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[215]++;
  var overrides = getOverrides(this), override = visit830_216_1(overrides[element.nodeName()] || overrides["*"]);
  _$jscoverage['/editor/styles.js'].lineData[218]++;
  if (visit831_218_1(override)) {
    _$jscoverage['/editor/styles.js'].lineData[220]++;
    if (visit832_220_1(!(attribs = override.attributes) && !(styles = override.styles))) {
      _$jscoverage['/editor/styles.js'].lineData[223]++;
      return TRUE;
    }
    _$jscoverage['/editor/styles.js'].lineData[224]++;
    if (visit833_224_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[225]++;
      for (var i = 0; visit834_225_1(i < attribs.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[226]++;
        attName = attribs[i][0];
        _$jscoverage['/editor/styles.js'].lineData[227]++;
        var actualAttrValue = element.attr(attName);
        _$jscoverage['/editor/styles.js'].lineData[228]++;
        if (visit835_228_1(actualAttrValue)) {
          _$jscoverage['/editor/styles.js'].lineData[229]++;
          var attValue = attribs[i][1];
          _$jscoverage['/editor/styles.js'].lineData[236]++;
          if (visit836_236_1(visit837_236_2(attValue === NULL) || visit838_237_1((visit839_237_2(visit840_237_3(typeof attValue == 'string') && visit841_238_1(actualAttrValue == attValue))) || visit842_239_1(attValue.test && attValue.test(actualAttrValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[240]++;
            return TRUE;
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[244]++;
    if (visit843_244_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[245]++;
      for (i = 0; visit844_245_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[246]++;
        var styleName = styles[i][0];
        _$jscoverage['/editor/styles.js'].lineData[247]++;
        var actualStyleValue = element.css(styleName);
        _$jscoverage['/editor/styles.js'].lineData[248]++;
        if (visit845_248_1(actualStyleValue)) {
          _$jscoverage['/editor/styles.js'].lineData[249]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[250]++;
          if (visit846_250_1(visit847_250_2(styleValue === NULL) || visit848_253_1((visit849_253_2(visit850_253_3(typeof styleValue == 'string') && visit851_254_1(actualStyleValue == styleValue))) || visit852_255_1(styleValue.test && styleValue.test(actualStyleValue))))) {
            _$jscoverage['/editor/styles.js'].lineData[256]++;
            return TRUE;
          }
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[261]++;
  return FALSE;
}, 
  checkActive: function(elementPath) {
  _$jscoverage['/editor/styles.js'].functionData[11]++;
  _$jscoverage['/editor/styles.js'].lineData[269]++;
  switch (this.type) {
    case KEST.STYLE_BLOCK:
      _$jscoverage['/editor/styles.js'].lineData[271]++;
      return this.checkElementRemovable(visit853_271_1(elementPath.block || elementPath.blockLimit), TRUE);
    case KEST.STYLE_OBJECT:
    case KEST.STYLE_INLINE:
      _$jscoverage['/editor/styles.js'].lineData[277]++;
      var elements = elementPath.elements;
      _$jscoverage['/editor/styles.js'].lineData[279]++;
      for (var i = 0, element; visit854_279_1(i < elements.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[280]++;
        element = elements[i];
        _$jscoverage['/editor/styles.js'].lineData[282]++;
        if (visit855_282_1(visit856_282_2(this.type == KEST.STYLE_INLINE) && (visit857_283_1(Dom.equals(element, elementPath.block) || Dom.equals(element, elementPath.blockLimit))))) {
          _$jscoverage['/editor/styles.js'].lineData[285]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[287]++;
        if (visit858_287_1(visit859_287_2(this.type == KEST.STYLE_OBJECT) && !(element.nodeName() in objectElements))) {
          _$jscoverage['/editor/styles.js'].lineData[289]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[291]++;
        if (visit860_291_1(this.checkElementRemovable(element, TRUE))) {
          _$jscoverage['/editor/styles.js'].lineData[292]++;
          return TRUE;
        }
      }
  }
  _$jscoverage['/editor/styles.js'].lineData[295]++;
  return FALSE;
}};
  _$jscoverage['/editor/styles.js'].lineData[300]++;
  KEStyle.getStyleText = function(styleDefinition) {
  _$jscoverage['/editor/styles.js'].functionData[12]++;
  _$jscoverage['/editor/styles.js'].lineData[302]++;
  var stylesDef = styleDefinition._ST;
  _$jscoverage['/editor/styles.js'].lineData[303]++;
  if (visit861_303_1(stylesDef)) {
    _$jscoverage['/editor/styles.js'].lineData[304]++;
    return stylesDef;
  }
  _$jscoverage['/editor/styles.js'].lineData[306]++;
  stylesDef = styleDefinition["styles"];
  _$jscoverage['/editor/styles.js'].lineData[309]++;
  var stylesText = visit862_309_1((visit863_309_2(styleDefinition["attributes"] && styleDefinition["attributes"]['style'])) || ''), specialStylesText = '';
  _$jscoverage['/editor/styles.js'].lineData[313]++;
  if (visit864_313_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[314]++;
    stylesText = stylesText.replace(semicolonFixRegex, ';');
  }
  _$jscoverage['/editor/styles.js'].lineData[316]++;
  for (var style in stylesDef) {
    _$jscoverage['/editor/styles.js'].lineData[318]++;
    var styleVal = stylesDef[style], text = (style + ':' + styleVal).replace(semicolonFixRegex, ';');
    _$jscoverage['/editor/styles.js'].lineData[322]++;
    if (visit865_322_1(styleVal == 'inherit')) {
      _$jscoverage['/editor/styles.js'].lineData[323]++;
      specialStylesText += text;
    } else {
      _$jscoverage['/editor/styles.js'].lineData[325]++;
      stylesText += text;
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[331]++;
  if (visit866_331_1(stylesText.length)) {
    _$jscoverage['/editor/styles.js'].lineData[332]++;
    stylesText = normalizeCssText(stylesText);
  }
  _$jscoverage['/editor/styles.js'].lineData[334]++;
  stylesText += specialStylesText;
  _$jscoverage['/editor/styles.js'].lineData[337]++;
  return (styleDefinition._ST = stylesText);
};
  _$jscoverage['/editor/styles.js'].lineData[340]++;
  function getElement(style, targetDocument, element) {
    _$jscoverage['/editor/styles.js'].functionData[13]++;
    _$jscoverage['/editor/styles.js'].lineData[341]++;
    var el, elementName = style["element"];
    _$jscoverage['/editor/styles.js'].lineData[346]++;
    if (visit867_346_1(elementName == '*')) {
      _$jscoverage['/editor/styles.js'].lineData[347]++;
      elementName = 'span';
    }
    _$jscoverage['/editor/styles.js'].lineData[350]++;
    el = new Node(targetDocument.createElement(elementName));
    _$jscoverage['/editor/styles.js'].lineData[353]++;
    if (visit868_353_1(element)) {
      _$jscoverage['/editor/styles.js'].lineData[354]++;
      element._4e_copyAttributes(el);
    }
    _$jscoverage['/editor/styles.js'].lineData[356]++;
    return setupElement(el, style);
  }
  _$jscoverage['/editor/styles.js'].lineData[359]++;
  function setupElement(el, style) {
    _$jscoverage['/editor/styles.js'].functionData[14]++;
    _$jscoverage['/editor/styles.js'].lineData[360]++;
    var def = style._["definition"], attributes = def["attributes"], styles = KEStyle.getStyleText(def);
    _$jscoverage['/editor/styles.js'].lineData[365]++;
    if (visit869_365_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[366]++;
      for (var att in attributes) {
        _$jscoverage['/editor/styles.js'].lineData[367]++;
        el.attr(att, attributes[att]);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[373]++;
    if (visit870_373_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[374]++;
      el[0].style.cssText = styles;
    }
    _$jscoverage['/editor/styles.js'].lineData[376]++;
    return el;
  }
  _$jscoverage['/editor/styles.js'].lineData[379]++;
  function applyBlockStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[15]++;
    _$jscoverage['/editor/styles.js'].lineData[382]++;
    var bookmark = range.createBookmark(TRUE), iterator = range.createIterator();
    _$jscoverage['/editor/styles.js'].lineData[384]++;
    iterator.enforceRealBlocks = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[388]++;
    iterator.enlargeBr = TRUE;
    _$jscoverage['/editor/styles.js'].lineData[390]++;
    var block, doc = range.document;
    _$jscoverage['/editor/styles.js'].lineData[392]++;
    while ((block = iterator.getNextParagraph())) {
      _$jscoverage['/editor/styles.js'].lineData[393]++;
      var newBlock = getElement(this, doc, block);
      _$jscoverage['/editor/styles.js'].lineData[394]++;
      replaceBlock(block, newBlock);
    }
    _$jscoverage['/editor/styles.js'].lineData[396]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[400]++;
  function replace(str, regexp, replacement) {
    _$jscoverage['/editor/styles.js'].functionData[16]++;
    _$jscoverage['/editor/styles.js'].lineData[401]++;
    var headBookmark = '', tailBookmark = '';
    _$jscoverage['/editor/styles.js'].lineData[404]++;
    str = str.replace(/(^<span[^>]+_ke_bookmark.*?\/span>)|(<span[^>]+_ke_bookmark.*?\/span>$)/gi, function(str, m1, m2) {
  _$jscoverage['/editor/styles.js'].functionData[17]++;
  _$jscoverage['/editor/styles.js'].lineData[406]++;
  visit871_406_1(m1 && (headBookmark = m1));
  _$jscoverage['/editor/styles.js'].lineData[407]++;
  visit872_407_1(m2 && (tailBookmark = m2));
  _$jscoverage['/editor/styles.js'].lineData[408]++;
  return '';
});
    _$jscoverage['/editor/styles.js'].lineData[410]++;
    return headBookmark + str.replace(regexp, replacement) + tailBookmark;
  }
  _$jscoverage['/editor/styles.js'].lineData[416]++;
  function toPre(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[18]++;
    _$jscoverage['/editor/styles.js'].lineData[418]++;
    var preHTML = block.html();
    _$jscoverage['/editor/styles.js'].lineData[421]++;
    preHTML = replace(preHTML, /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
    _$jscoverage['/editor/styles.js'].lineData[424]++;
    preHTML = preHTML.replace(/[ \t\r\n]*(<br[^>]*>)[ \t\r\n]*/gi, '$1');
    _$jscoverage['/editor/styles.js'].lineData[428]++;
    preHTML = preHTML.replace(/([ \t\n\r]+|&nbsp;)/g, ' ');
    _$jscoverage['/editor/styles.js'].lineData[431]++;
    preHTML = preHTML.replace(/<br\b[^>]*>/gi, '\n');
    _$jscoverage['/editor/styles.js'].lineData[434]++;
    if (visit873_434_1(UA['ie'])) {
      _$jscoverage['/editor/styles.js'].lineData[435]++;
      var temp = block[0].ownerDocument.createElement('div');
      _$jscoverage['/editor/styles.js'].lineData[436]++;
      temp.appendChild(newBlock[0]);
      _$jscoverage['/editor/styles.js'].lineData[437]++;
      newBlock.outerHtml('<pre>' + preHTML + '</pre>');
      _$jscoverage['/editor/styles.js'].lineData[438]++;
      newBlock = new Node(temp.firstChild);
      _$jscoverage['/editor/styles.js'].lineData[439]++;
      newBlock._4e_remove();
    } else {
      _$jscoverage['/editor/styles.js'].lineData[442]++;
      newBlock.html(preHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[444]++;
    return newBlock;
  }
  _$jscoverage['/editor/styles.js'].lineData[449]++;
  function splitIntoPres(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[19]++;
    _$jscoverage['/editor/styles.js'].lineData[452]++;
    var duoBrRegex = /(\S\s*)\n(?:\s|(<span[^>]+_ck_bookmark.*?\/span>))*\n(?!$)/gi, splittedHTML = replace(preBlock.outerHtml(), duoBrRegex, function(match, charBefore, bookmark) {
  _$jscoverage['/editor/styles.js'].functionData[20]++;
  _$jscoverage['/editor/styles.js'].lineData[457]++;
  return charBefore + '</pre>' + bookmark + '<pre>';
});
    _$jscoverage['/editor/styles.js'].lineData[460]++;
    var pres = [];
    _$jscoverage['/editor/styles.js'].lineData[461]++;
    splittedHTML.replace(/<pre\b.*?>([\s\S]*?)<\/pre>/gi, function(match, preContent) {
  _$jscoverage['/editor/styles.js'].functionData[21]++;
  _$jscoverage['/editor/styles.js'].lineData[463]++;
  pres.push(preContent);
});
    _$jscoverage['/editor/styles.js'].lineData[465]++;
    return pres;
  }
  _$jscoverage['/editor/styles.js'].lineData[471]++;
  function replaceBlock(block, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[22]++;
    _$jscoverage['/editor/styles.js'].lineData[472]++;
    var newBlockIsPre = visit874_472_1(newBlock.nodeName == ('pre')), blockIsPre = visit875_473_1(block.nodeName == ('pre')), isToPre = visit876_474_1(newBlockIsPre && !blockIsPre), isFromPre = visit877_475_1(!newBlockIsPre && blockIsPre);
    _$jscoverage['/editor/styles.js'].lineData[477]++;
    if (visit878_477_1(isToPre)) {
      _$jscoverage['/editor/styles.js'].lineData[478]++;
      newBlock = toPre(block, newBlock);
    } else {
      _$jscoverage['/editor/styles.js'].lineData[479]++;
      if (visit879_479_1(isFromPre)) {
        _$jscoverage['/editor/styles.js'].lineData[481]++;
        newBlock = fromPres(splitIntoPres(block), newBlock);
      } else {
        _$jscoverage['/editor/styles.js'].lineData[483]++;
        block._4e_moveChildren(newBlock);
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[485]++;
    block[0].parentNode.replaceChild(newBlock[0], block[0]);
    _$jscoverage['/editor/styles.js'].lineData[486]++;
    if (visit880_486_1(newBlockIsPre)) {
      _$jscoverage['/editor/styles.js'].lineData[488]++;
      mergePre(newBlock);
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[493]++;
  function mergePre(preBlock) {
    _$jscoverage['/editor/styles.js'].functionData[23]++;
    _$jscoverage['/editor/styles.js'].lineData[494]++;
    var previousBlock;
    _$jscoverage['/editor/styles.js'].lineData[495]++;
    if (visit881_495_1(!(visit882_495_2((previousBlock = preBlock._4e_previousSourceNode(TRUE, Dom.NodeType.ELEMENT_NODE)) && visit883_496_1(previousBlock.nodeName() == 'pre'))))) {
      _$jscoverage['/editor/styles.js'].lineData[497]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[506]++;
    var mergedHTML = replace(previousBlock.html(), /\n$/, '') + '\n\n' + replace(preBlock.html(), /^\n/, '');
    _$jscoverage['/editor/styles.js'].lineData[510]++;
    if (visit884_510_1(UA['ie'])) {
      _$jscoverage['/editor/styles.js'].lineData[511]++;
      preBlock.outerHtml('<pre>' + mergedHTML + '</pre>');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[513]++;
      preBlock.html(mergedHTML);
    }
    _$jscoverage['/editor/styles.js'].lineData[515]++;
    previousBlock._4e_remove();
  }
  _$jscoverage['/editor/styles.js'].lineData[520]++;
  function fromPres(preHTMLs, newBlock) {
    _$jscoverage['/editor/styles.js'].functionData[24]++;
    _$jscoverage['/editor/styles.js'].lineData[521]++;
    var docFrag = newBlock[0].ownerDocument.createDocumentFragment();
    _$jscoverage['/editor/styles.js'].lineData[522]++;
    for (var i = 0; visit885_522_1(i < preHTMLs.length); i++) {
      _$jscoverage['/editor/styles.js'].lineData[523]++;
      var blockHTML = preHTMLs[i];
      _$jscoverage['/editor/styles.js'].lineData[527]++;
      blockHTML = blockHTML.replace(/(\r\n|\r)/g, '\n');
      _$jscoverage['/editor/styles.js'].lineData[528]++;
      blockHTML = replace(blockHTML, /^[ \t]*\n/, '');
      _$jscoverage['/editor/styles.js'].lineData[529]++;
      blockHTML = replace(blockHTML, /\n$/, '');
      _$jscoverage['/editor/styles.js'].lineData[531]++;
      blockHTML = replace(blockHTML, /^[ \t]+|[ \t]+$/g, function(match, offset) {
  _$jscoverage['/editor/styles.js'].functionData[25]++;
  _$jscoverage['/editor/styles.js'].lineData[532]++;
  if (visit886_532_1(match.length == 1)) {
    _$jscoverage['/editor/styles.js'].lineData[533]++;
    return '&nbsp;';
  } else {
    _$jscoverage['/editor/styles.js'].lineData[534]++;
    if (visit887_534_1(!offset)) {
      _$jscoverage['/editor/styles.js'].lineData[535]++;
      return new Array(match.length).join('&nbsp;') + ' ';
    } else {
      _$jscoverage['/editor/styles.js'].lineData[537]++;
      return ' ' + new Array(match.length).join('&nbsp;');
    }
  }
});
      _$jscoverage['/editor/styles.js'].lineData[542]++;
      blockHTML = blockHTML.replace(/\n/g, '<br>');
      _$jscoverage['/editor/styles.js'].lineData[543]++;
      blockHTML = blockHTML.replace(/[ \t]{2,}/g, function(match) {
  _$jscoverage['/editor/styles.js'].functionData[26]++;
  _$jscoverage['/editor/styles.js'].lineData[545]++;
  return new Array(match.length).join('&nbsp;') + ' ';
});
      _$jscoverage['/editor/styles.js'].lineData[548]++;
      var newBlockClone = newBlock.clone();
      _$jscoverage['/editor/styles.js'].lineData[549]++;
      newBlockClone.html(blockHTML);
      _$jscoverage['/editor/styles.js'].lineData[550]++;
      docFrag.appendChild(newBlockClone[0]);
    }
    _$jscoverage['/editor/styles.js'].lineData[552]++;
    return docFrag;
  }
  _$jscoverage['/editor/styles.js'].lineData[555]++;
  function applyInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[27]++;
    _$jscoverage['/editor/styles.js'].lineData[556]++;
    var self = this, document = range.document;
    _$jscoverage['/editor/styles.js'].lineData[559]++;
    if (visit888_559_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[561]++;
      var collapsedElement = getElement(this, document, undefined);
      _$jscoverage['/editor/styles.js'].lineData[563]++;
      range.insertNode(collapsedElement);
      _$jscoverage['/editor/styles.js'].lineData[565]++;
      range.moveToPosition(collapsedElement, KER.POSITION_BEFORE_END);
      _$jscoverage['/editor/styles.js'].lineData[566]++;
      return;
    }
    _$jscoverage['/editor/styles.js'].lineData[568]++;
    var elementName = this["element"], def = this._["definition"], isUnknownElement, dtd = DTD[elementName];
    _$jscoverage['/editor/styles.js'].lineData[573]++;
    if (visit889_573_1(!dtd)) {
      _$jscoverage['/editor/styles.js'].lineData[574]++;
      isUnknownElement = TRUE;
      _$jscoverage['/editor/styles.js'].lineData[575]++;
      dtd = DTD["span"];
    }
    _$jscoverage['/editor/styles.js'].lineData[579]++;
    var bookmark = range.createBookmark();
    _$jscoverage['/editor/styles.js'].lineData[582]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[583]++;
    range.trim();
    _$jscoverage['/editor/styles.js'].lineData[587]++;
    var boundaryNodes = range.createBookmark(), firstNode = boundaryNodes.startNode, lastNode = boundaryNodes.endNode, currentNode = firstNode, styleRange;
    _$jscoverage['/editor/styles.js'].lineData[593]++;
    while (visit890_593_1(currentNode && currentNode[0])) {
      _$jscoverage['/editor/styles.js'].lineData[594]++;
      var applyStyle = FALSE;
      _$jscoverage['/editor/styles.js'].lineData[596]++;
      if (visit891_596_1(Dom.equals(currentNode, lastNode))) {
        _$jscoverage['/editor/styles.js'].lineData[597]++;
        currentNode = NULL;
        _$jscoverage['/editor/styles.js'].lineData[598]++;
        applyStyle = TRUE;
      } else {
        _$jscoverage['/editor/styles.js'].lineData[601]++;
        var nodeType = currentNode[0].nodeType, nodeName = visit892_602_1(nodeType == Dom.NodeType.ELEMENT_NODE) ? currentNode.nodeName() : NULL;
        _$jscoverage['/editor/styles.js'].lineData[605]++;
        if (visit893_605_1(nodeName && currentNode.attr('_ke_bookmark'))) {
          _$jscoverage['/editor/styles.js'].lineData[606]++;
          currentNode = currentNode._4e_nextSourceNode(TRUE);
          _$jscoverage['/editor/styles.js'].lineData[607]++;
          continue;
        }
        _$jscoverage['/editor/styles.js'].lineData[611]++;
        if (visit894_611_1(!nodeName || (visit895_612_1(dtd[nodeName] && visit896_613_1(visit897_613_2((currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit898_620_1(!def["childRule"] || def["childRule"](currentNode)))))))) {
          _$jscoverage['/editor/styles.js'].lineData[622]++;
          var currentParent = currentNode.parent();
          _$jscoverage['/editor/styles.js'].lineData[633]++;
          if (visit899_633_1(currentParent && visit900_634_1(visit901_634_2(elementName == "a") && visit902_635_1(currentParent.nodeName() == elementName)))) {
            _$jscoverage['/editor/styles.js'].lineData[636]++;
            var tmpANode = getElement(self, document, undefined);
            _$jscoverage['/editor/styles.js'].lineData[637]++;
            currentParent._4e_moveChildren(tmpANode);
            _$jscoverage['/editor/styles.js'].lineData[638]++;
            currentParent[0].parentNode.replaceChild(tmpANode[0], currentParent[0]);
            _$jscoverage['/editor/styles.js'].lineData[639]++;
            tmpANode._4e_mergeSiblings();
          } else {
            _$jscoverage['/editor/styles.js'].lineData[644]++;
            if (visit903_644_1(currentParent && visit904_644_2(currentParent[0] && visit905_645_1((visit906_646_1((visit907_645_2(DTD[currentParent.nodeName()] || DTD["span"]))[elementName] || isUnknownElement)) && (visit908_648_1(!def["parentRule"] || def["parentRule"](currentParent))))))) {
              _$jscoverage['/editor/styles.js'].lineData[653]++;
              if (visit909_653_1(!styleRange && (visit910_654_1(!nodeName || visit911_655_1(!DTD.$removeEmpty[nodeName] || visit912_656_1((currentNode._4e_position(lastNode) | (KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED)) == (KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED))))))) {
                _$jscoverage['/editor/styles.js'].lineData[665]++;
                styleRange = new KERange(document);
                _$jscoverage['/editor/styles.js'].lineData[666]++;
                styleRange.setStartBefore(currentNode);
              }
              _$jscoverage['/editor/styles.js'].lineData[671]++;
              if (visit913_671_1(visit914_671_2(nodeType == Dom.NodeType.TEXT_NODE) || (visit915_672_1(visit916_672_2(nodeType == Dom.NodeType.ELEMENT_NODE) && !currentNode[0].childNodes.length)))) {
                _$jscoverage['/editor/styles.js'].lineData[673]++;
                var includedNode = currentNode, parentNode = null;
                _$jscoverage['/editor/styles.js'].lineData[686]++;
                while (visit917_687_1((applyStyle = !includedNode.next(notBookmark, 1)) && visit918_688_1((visit919_688_2((parentNode = includedNode.parent()) && dtd[parentNode.nodeName()])) && visit920_690_1(visit921_690_2((parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == (KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED)) && (visit922_697_1(!def["childRule"] || def["childRule"](parentNode))))))) {
                  _$jscoverage['/editor/styles.js'].lineData[698]++;
                  includedNode = parentNode;
                }
                _$jscoverage['/editor/styles.js'].lineData[701]++;
                styleRange.setEndAfter(includedNode);
              }
            } else {
              _$jscoverage['/editor/styles.js'].lineData[706]++;
              applyStyle = TRUE;
            }
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[709]++;
          applyStyle = TRUE;
        }
        _$jscoverage['/editor/styles.js'].lineData[712]++;
        currentNode = currentNode._4e_nextSourceNode();
      }
      _$jscoverage['/editor/styles.js'].lineData[716]++;
      if (visit923_716_1(applyStyle && visit924_716_2(styleRange && !styleRange.collapsed))) {
        _$jscoverage['/editor/styles.js'].lineData[718]++;
        var styleNode = getElement(self, document, undefined), parent = styleRange.getCommonAncestor();
        _$jscoverage['/editor/styles.js'].lineData[724]++;
        var removeList = {
  styles: {}, 
  attrs: {}, 
  blockedStyles: {}, 
  blockedAttrs: {}};
        _$jscoverage['/editor/styles.js'].lineData[733]++;
        var attName, styleName = null, value;
        _$jscoverage['/editor/styles.js'].lineData[737]++;
        while (visit925_737_1(styleNode && visit926_737_2(parent && visit927_737_3(styleNode[0] && parent[0])))) {
          _$jscoverage['/editor/styles.js'].lineData[738]++;
          if (visit928_738_1(parent.nodeName() == elementName)) {
            _$jscoverage['/editor/styles.js'].lineData[739]++;
            for (attName in def.attributes) {
              _$jscoverage['/editor/styles.js'].lineData[741]++;
              if (visit929_741_1(removeList.blockedAttrs[attName] || !(value = parent.attr(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[743]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[745]++;
              if (visit930_745_1(styleNode.attr(attName) == value)) {
                _$jscoverage['/editor/styles.js'].lineData[747]++;
                styleNode.removeAttr(attName);
              } else {
                _$jscoverage['/editor/styles.js'].lineData[749]++;
                removeList.blockedAttrs[attName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[756]++;
            for (styleName in def.styles) {
              _$jscoverage['/editor/styles.js'].lineData[758]++;
              if (visit931_758_1(removeList.blockedStyles[styleName] || !(value = parent.style(styleName)))) {
                _$jscoverage['/editor/styles.js'].lineData[760]++;
                continue;
              }
              _$jscoverage['/editor/styles.js'].lineData[762]++;
              if (visit932_762_1(styleNode.style(styleName) == value)) {
                _$jscoverage['/editor/styles.js'].lineData[764]++;
                styleNode.style(styleName, "");
              } else {
                _$jscoverage['/editor/styles.js'].lineData[766]++;
                removeList.blockedStyles[styleName] = 1;
              }
            }
            _$jscoverage['/editor/styles.js'].lineData[770]++;
            if (visit933_770_1(!styleNode._4e_hasAttributes())) {
              _$jscoverage['/editor/styles.js'].lineData[771]++;
              styleNode = NULL;
              _$jscoverage['/editor/styles.js'].lineData[772]++;
              break;
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[776]++;
          parent = parent.parent();
        }
        _$jscoverage['/editor/styles.js'].lineData[779]++;
        if (visit934_779_1(styleNode)) {
          _$jscoverage['/editor/styles.js'].lineData[781]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[785]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[789]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[792]++;
          styleNode._4e_mergeSiblings();
          _$jscoverage['/editor/styles.js'].lineData[800]++;
          if (visit935_800_1(!UA['ie'])) {
            _$jscoverage['/editor/styles.js'].lineData[801]++;
            styleNode[0].normalize();
          }
        } else {
          _$jscoverage['/editor/styles.js'].lineData[814]++;
          styleNode = new Node(document.createElement("span"));
          _$jscoverage['/editor/styles.js'].lineData[815]++;
          styleNode[0].appendChild(styleRange.extractContents());
          _$jscoverage['/editor/styles.js'].lineData[816]++;
          styleRange.insertNode(styleNode);
          _$jscoverage['/editor/styles.js'].lineData[817]++;
          removeFromInsideElement(self, styleNode);
          _$jscoverage['/editor/styles.js'].lineData[818]++;
          styleNode._4e_remove(true);
        }
        _$jscoverage['/editor/styles.js'].lineData[823]++;
        styleRange = NULL;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[827]++;
    firstNode._4e_remove();
    _$jscoverage['/editor/styles.js'].lineData[828]++;
    lastNode._4e_remove();
    _$jscoverage['/editor/styles.js'].lineData[829]++;
    range.moveToBookmark(bookmark);
    _$jscoverage['/editor/styles.js'].lineData[831]++;
    range.shrink(KER.SHRINK_TEXT);
  }
  _$jscoverage['/editor/styles.js'].lineData[835]++;
  function removeInlineStyle(range) {
    _$jscoverage['/editor/styles.js'].functionData[28]++;
    _$jscoverage['/editor/styles.js'].lineData[840]++;
    range.enlarge(KER.ENLARGE_ELEMENT);
    _$jscoverage['/editor/styles.js'].lineData[842]++;
    var bookmark = range.createBookmark(), startNode = bookmark.startNode;
    _$jscoverage['/editor/styles.js'].lineData[845]++;
    if (visit936_845_1(range.collapsed)) {
      _$jscoverage['/editor/styles.js'].lineData[847]++;
      var startPath = new ElementPath(startNode.parent()), boundaryElement;
      _$jscoverage['/editor/styles.js'].lineData[852]++;
      for (var i = 0, element; visit937_852_1(visit938_852_2(i < startPath.elements.length) && (element = startPath.elements[i])); i++) {
        _$jscoverage['/editor/styles.js'].lineData[861]++;
        if (visit939_861_1(visit940_861_2(element == startPath.block) || visit941_862_1(element == startPath.blockLimit))) {
          _$jscoverage['/editor/styles.js'].lineData[863]++;
          break;
        }
        _$jscoverage['/editor/styles.js'].lineData[865]++;
        if (visit942_865_1(this.checkElementRemovable(element))) {
          _$jscoverage['/editor/styles.js'].lineData[866]++;
          var endOfElement = range.checkBoundaryOfElement(element, KER.END), startOfElement = visit943_867_1(!endOfElement && range.checkBoundaryOfElement(element, KER.START));
          _$jscoverage['/editor/styles.js'].lineData[869]++;
          if (visit944_869_1(startOfElement || endOfElement)) {
            _$jscoverage['/editor/styles.js'].lineData[870]++;
            boundaryElement = element;
            _$jscoverage['/editor/styles.js'].lineData[871]++;
            boundaryElement.match = startOfElement ? 'start' : 'end';
          } else {
            _$jscoverage['/editor/styles.js'].lineData[879]++;
            element._4e_mergeSiblings();
            _$jscoverage['/editor/styles.js'].lineData[883]++;
            if (visit945_883_1(element.nodeName() != this.element)) {
              _$jscoverage['/editor/styles.js'].lineData[884]++;
              var _overrides = getOverrides(this);
              _$jscoverage['/editor/styles.js'].lineData[885]++;
              removeOverrides(element, visit946_886_1(_overrides[element.nodeName()] || _overrides["*"]));
            } else {
              _$jscoverage['/editor/styles.js'].lineData[888]++;
              removeFromElement(this, element);
            }
          }
        }
      }
      _$jscoverage['/editor/styles.js'].lineData[898]++;
      if (visit947_898_1(boundaryElement)) {
        _$jscoverage['/editor/styles.js'].lineData[899]++;
        var clonedElement = startNode;
        _$jscoverage['/editor/styles.js'].lineData[900]++;
        for (i = 0; ; i++) {
          _$jscoverage['/editor/styles.js'].lineData[901]++;
          var newElement = startPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[902]++;
          if (visit948_902_1(newElement.equals(boundaryElement))) {
            _$jscoverage['/editor/styles.js'].lineData[903]++;
            break;
          } else {
            _$jscoverage['/editor/styles.js'].lineData[905]++;
            if (visit949_905_1(newElement.match)) {
              _$jscoverage['/editor/styles.js'].lineData[906]++;
              continue;
            } else {
              _$jscoverage['/editor/styles.js'].lineData[908]++;
              newElement = newElement.clone();
            }
          }
          _$jscoverage['/editor/styles.js'].lineData[909]++;
          newElement[0].appendChild(clonedElement[0]);
          _$jscoverage['/editor/styles.js'].lineData[910]++;
          clonedElement = newElement;
        }
        _$jscoverage['/editor/styles.js'].lineData[916]++;
        clonedElement[visit950_915_1(boundaryElement.match == 'start') ? 'insertBefore' : 'insertAfter'](boundaryElement);
        _$jscoverage['/editor/styles.js'].lineData[919]++;
        var tmp = boundaryElement.html();
        _$jscoverage['/editor/styles.js'].lineData[920]++;
        if (visit951_920_1(!tmp || visit952_922_1(tmp == '\u200b'))) {
          _$jscoverage['/editor/styles.js'].lineData[923]++;
          boundaryElement.remove();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[926]++;
          if (visit953_926_1(UA.webkit)) {
            _$jscoverage['/editor/styles.js'].lineData[927]++;
            $(range.document.createTextNode('\u200b')).insertBefore(clonedElement);
          }
        }
      }
    } else {
      _$jscoverage['/editor/styles.js'].lineData[935]++;
      var endNode = bookmark.endNode, me = this;
      _$jscoverage['/editor/styles.js'].lineData[942]++;
      function breakNodes() {
        _$jscoverage['/editor/styles.js'].functionData[29]++;
        _$jscoverage['/editor/styles.js'].lineData[943]++;
        var startPath = new ElementPath(startNode.parent()), endPath = new ElementPath(endNode.parent()), breakStart = NULL, breakEnd = NULL;
        _$jscoverage['/editor/styles.js'].lineData[947]++;
        for (var i = 0; visit954_947_1(i < startPath.elements.length); i++) {
          _$jscoverage['/editor/styles.js'].lineData[948]++;
          var element = startPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[950]++;
          if (visit955_950_1(visit956_950_2(element == startPath.block) || visit957_951_1(element == startPath.blockLimit))) {
            _$jscoverage['/editor/styles.js'].lineData[952]++;
            break;
          }
          _$jscoverage['/editor/styles.js'].lineData[954]++;
          if (visit958_954_1(me.checkElementRemovable(element))) {
            _$jscoverage['/editor/styles.js'].lineData[955]++;
            breakStart = element;
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[957]++;
        for (i = 0; visit959_957_1(i < endPath.elements.length); i++) {
          _$jscoverage['/editor/styles.js'].lineData[958]++;
          element = endPath.elements[i];
          _$jscoverage['/editor/styles.js'].lineData[960]++;
          if (visit960_960_1(visit961_960_2(element == endPath.block) || visit962_961_1(element == endPath.blockLimit))) {
            _$jscoverage['/editor/styles.js'].lineData[962]++;
            break;
          }
          _$jscoverage['/editor/styles.js'].lineData[964]++;
          if (visit963_964_1(me.checkElementRemovable(element))) {
            _$jscoverage['/editor/styles.js'].lineData[965]++;
            breakEnd = element;
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[968]++;
        if (visit964_968_1(breakEnd)) {
          _$jscoverage['/editor/styles.js'].lineData[969]++;
          endNode._4e_breakParent(breakEnd);
        }
        _$jscoverage['/editor/styles.js'].lineData[970]++;
        if (visit965_970_1(breakStart)) {
          _$jscoverage['/editor/styles.js'].lineData[971]++;
          startNode._4e_breakParent(breakStart);
        }
      }      _$jscoverage['/editor/styles.js'].lineData[974]++;
      breakNodes();
      _$jscoverage['/editor/styles.js'].lineData[977]++;
      var currentNode = new Node(startNode[0].nextSibling);
      _$jscoverage['/editor/styles.js'].lineData[978]++;
      while (visit966_978_1(currentNode[0] !== endNode[0])) {
        _$jscoverage['/editor/styles.js'].lineData[983]++;
        var nextNode = currentNode._4e_nextSourceNode();
        _$jscoverage['/editor/styles.js'].lineData[984]++;
        if (visit967_984_1(currentNode[0] && visit968_985_1(visit969_985_2(currentNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && this.checkElementRemovable(currentNode)))) {
          _$jscoverage['/editor/styles.js'].lineData[988]++;
          if (visit970_988_1(currentNode.nodeName() == this["element"])) {
            _$jscoverage['/editor/styles.js'].lineData[989]++;
            removeFromElement(this, currentNode);
          } else {
            _$jscoverage['/editor/styles.js'].lineData[991]++;
            var overrides = getOverrides(this);
            _$jscoverage['/editor/styles.js'].lineData[992]++;
            removeOverrides(currentNode, visit971_993_1(overrides[currentNode.nodeName()] || overrides["*"]));
          }
          _$jscoverage['/editor/styles.js'].lineData[1003]++;
          if (visit972_1003_1(visit973_1003_2(nextNode[0].nodeType == Dom.NodeType.ELEMENT_NODE) && nextNode.contains(startNode))) {
            _$jscoverage['/editor/styles.js'].lineData[1005]++;
            breakNodes();
            _$jscoverage['/editor/styles.js'].lineData[1006]++;
            nextNode = new Node(startNode[0].nextSibling);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1009]++;
        currentNode = nextNode;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1012]++;
    range.moveToBookmark(bookmark);
  }
  _$jscoverage['/editor/styles.js'].lineData[1016]++;
  function parseStyleText(styleText) {
    _$jscoverage['/editor/styles.js'].functionData[30]++;
    _$jscoverage['/editor/styles.js'].lineData[1017]++;
    styleText = String(styleText);
    _$jscoverage['/editor/styles.js'].lineData[1018]++;
    var retval = {};
    _$jscoverage['/editor/styles.js'].lineData[1020]++;
    styleText.replace(/&quot;/g, '"').replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
  _$jscoverage['/editor/styles.js'].functionData[31]++;
  _$jscoverage['/editor/styles.js'].lineData[1022]++;
  retval[name] = value;
});
    _$jscoverage['/editor/styles.js'].lineData[1024]++;
    return retval;
  }
  _$jscoverage['/editor/styles.js'].lineData[1027]++;
  function compareCssText(source, target) {
    _$jscoverage['/editor/styles.js'].functionData[32]++;
    _$jscoverage['/editor/styles.js'].lineData[1028]++;
    visit974_1028_1(visit975_1028_2(typeof source == 'string') && (source = parseStyleText(source)));
    _$jscoverage['/editor/styles.js'].lineData[1029]++;
    visit976_1029_1(visit977_1029_2(typeof target == 'string') && (target = parseStyleText(target)));
    _$jscoverage['/editor/styles.js'].lineData[1030]++;
    for (var name in source) {
      _$jscoverage['/editor/styles.js'].lineData[1034]++;
      if (visit978_1034_1(!(visit979_1034_2(name in target && (visit980_1035_1(visit981_1035_2(target[name] == source[name]) || visit982_1036_1(visit983_1036_2(source[name] == 'inherit') || visit984_1037_1(target[name] == 'inherit')))))))) {
        _$jscoverage['/editor/styles.js'].lineData[1038]++;
        return FALSE;
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1042]++;
    return TRUE;
  }
  _$jscoverage['/editor/styles.js'].lineData[1045]++;
  function normalizeCssText(unparsedCssText, nativeNormalize) {
    _$jscoverage['/editor/styles.js'].functionData[33]++;
    _$jscoverage['/editor/styles.js'].lineData[1046]++;
    var styleText = "";
    _$jscoverage['/editor/styles.js'].lineData[1047]++;
    if (visit985_1047_1(nativeNormalize !== FALSE)) {
      _$jscoverage['/editor/styles.js'].lineData[1050]++;
      var temp = document.createElement('span');
      _$jscoverage['/editor/styles.js'].lineData[1051]++;
      temp.style.cssText = unparsedCssText;
      _$jscoverage['/editor/styles.js'].lineData[1053]++;
      styleText = visit986_1053_1(temp.style.cssText || '');
    } else {
      _$jscoverage['/editor/styles.js'].lineData[1056]++;
      styleText = unparsedCssText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1060]++;
    return styleText.replace(/\s*([;:])\s*/, '$1').replace(/([^\s;])$/, "$1;").replace(/,\s+/g, ',').toLowerCase();
  }
  _$jscoverage['/editor/styles.js'].lineData[1070]++;
  function getAttributesForComparison(styleDefinition) {
    _$jscoverage['/editor/styles.js'].functionData[34]++;
    _$jscoverage['/editor/styles.js'].lineData[1072]++;
    var attribs = styleDefinition._AC;
    _$jscoverage['/editor/styles.js'].lineData[1073]++;
    if (visit987_1073_1(attribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1074]++;
      return attribs;
    }
    _$jscoverage['/editor/styles.js'].lineData[1076]++;
    attribs = {};
    _$jscoverage['/editor/styles.js'].lineData[1078]++;
    var length = 0, styleAttribs = styleDefinition["attributes"];
    _$jscoverage['/editor/styles.js'].lineData[1082]++;
    if (visit988_1082_1(styleAttribs)) {
      _$jscoverage['/editor/styles.js'].lineData[1083]++;
      for (var styleAtt in styleAttribs) {
        _$jscoverage['/editor/styles.js'].lineData[1085]++;
        length++;
        _$jscoverage['/editor/styles.js'].lineData[1086]++;
        attribs[styleAtt] = styleAttribs[styleAtt];
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1092]++;
    var styleText = KEStyle.getStyleText(styleDefinition);
    _$jscoverage['/editor/styles.js'].lineData[1093]++;
    if (visit989_1093_1(styleText)) {
      _$jscoverage['/editor/styles.js'].lineData[1094]++;
      if (visit990_1094_1(!attribs['style'])) {
        _$jscoverage['/editor/styles.js'].lineData[1095]++;
        length++;
      }
      _$jscoverage['/editor/styles.js'].lineData[1096]++;
      attribs['style'] = styleText;
    }
    _$jscoverage['/editor/styles.js'].lineData[1101]++;
    attribs["_length"] = length;
    _$jscoverage['/editor/styles.js'].lineData[1104]++;
    return (styleDefinition._AC = attribs);
  }
  _$jscoverage['/editor/styles.js'].lineData[1113]++;
  function getOverrides(style) {
    _$jscoverage['/editor/styles.js'].functionData[35]++;
    _$jscoverage['/editor/styles.js'].lineData[1114]++;
    if (visit991_1114_1(style._.overrides)) {
      _$jscoverage['/editor/styles.js'].lineData[1115]++;
      return style._.overrides;
    }
    _$jscoverage['/editor/styles.js'].lineData[1117]++;
    var overrides = (style._.overrides = {}), definition = style._.definition["overrides"];
    _$jscoverage['/editor/styles.js'].lineData[1120]++;
    if (visit992_1120_1(definition)) {
      _$jscoverage['/editor/styles.js'].lineData[1123]++;
      if (visit993_1123_1(!S.isArray(definition))) {
        _$jscoverage['/editor/styles.js'].lineData[1124]++;
        definition = [definition];
      }
      _$jscoverage['/editor/styles.js'].lineData[1127]++;
      for (var i = 0; visit994_1127_1(i < definition.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1128]++;
        var override = definition[i];
        _$jscoverage['/editor/styles.js'].lineData[1129]++;
        var elementName;
        _$jscoverage['/editor/styles.js'].lineData[1130]++;
        var overrideEl;
        _$jscoverage['/editor/styles.js'].lineData[1131]++;
        var attrs, styles;
        _$jscoverage['/editor/styles.js'].lineData[1134]++;
        if (visit995_1134_1(typeof override == 'string')) {
          _$jscoverage['/editor/styles.js'].lineData[1135]++;
          elementName = override.toLowerCase();
        } else {
          _$jscoverage['/editor/styles.js'].lineData[1138]++;
          elementName = override["element"] ? override["element"].toLowerCase() : style.element;
          _$jscoverage['/editor/styles.js'].lineData[1141]++;
          attrs = override["attributes"];
          _$jscoverage['/editor/styles.js'].lineData[1142]++;
          styles = override["styles"];
        }
        _$jscoverage['/editor/styles.js'].lineData[1148]++;
        overrideEl = visit996_1148_1(overrides[elementName] || (overrides[elementName] = {}));
        _$jscoverage['/editor/styles.js'].lineData[1151]++;
        if (visit997_1151_1(attrs)) {
          _$jscoverage['/editor/styles.js'].lineData[1155]++;
          var overrideAttrs = (overrideEl["attributes"] = visit998_1156_1(overrideEl["attributes"] || new Array()));
          _$jscoverage['/editor/styles.js'].lineData[1157]++;
          for (var attName in attrs) {
            _$jscoverage['/editor/styles.js'].lineData[1161]++;
            overrideAttrs.push([attName.toLowerCase(), attrs[attName]]);
          }
        }
        _$jscoverage['/editor/styles.js'].lineData[1166]++;
        if (visit999_1166_1(styles)) {
          _$jscoverage['/editor/styles.js'].lineData[1170]++;
          var overrideStyles = (overrideEl["styles"] = visit1000_1171_1(overrideEl["styles"] || new Array()));
          _$jscoverage['/editor/styles.js'].lineData[1172]++;
          for (var styleName in styles) {
            _$jscoverage['/editor/styles.js'].lineData[1176]++;
            overrideStyles.push([styleName.toLowerCase(), styles[styleName]]);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1182]++;
    return overrides;
  }
  _$jscoverage['/editor/styles.js'].lineData[1186]++;
  function removeFromElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[36]++;
    _$jscoverage['/editor/styles.js'].lineData[1187]++;
    var def = style._.definition, overrides = getOverrides(style), attributes = S.merge(def["attributes"], (visit1001_1190_1(overrides[element.nodeName()] || visit1002_1190_2(overrides["*"] || {})))["attributes"]), styles = S.merge(def["styles"], (visit1003_1192_1(overrides[element.nodeName()] || visit1004_1192_2(overrides["*"] || {})))["styles"]), removeEmpty = visit1005_1194_1(S.isEmptyObject(attributes) && S.isEmptyObject(styles));
    _$jscoverage['/editor/styles.js'].lineData[1198]++;
    for (var attName in attributes) {
      _$jscoverage['/editor/styles.js'].lineData[1201]++;
      if (visit1006_1201_1((visit1007_1201_2(visit1008_1201_3(attName == 'class') || style._.definition["fullMatch"])) && visit1009_1202_1(element.attr(attName) != normalizeProperty(attName, attributes[attName])))) {
        _$jscoverage['/editor/styles.js'].lineData[1204]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1205]++;
      removeEmpty = visit1010_1205_1(removeEmpty || !!element.hasAttr(attName));
      _$jscoverage['/editor/styles.js'].lineData[1206]++;
      element.removeAttr(attName);
    }
    _$jscoverage['/editor/styles.js'].lineData[1210]++;
    for (var styleName in styles) {
      _$jscoverage['/editor/styles.js'].lineData[1213]++;
      if (visit1011_1213_1(style._.definition["fullMatch"] && visit1012_1214_1(element.style(styleName) != normalizeProperty(styleName, styles[styleName], TRUE)))) {
        _$jscoverage['/editor/styles.js'].lineData[1216]++;
        continue;
      }
      _$jscoverage['/editor/styles.js'].lineData[1218]++;
      removeEmpty = visit1013_1218_1(removeEmpty || !!element.style(styleName));
      _$jscoverage['/editor/styles.js'].lineData[1220]++;
      element.style(styleName, "");
    }
    _$jscoverage['/editor/styles.js'].lineData[1226]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1229]++;
  function normalizeProperty(name, value, isStyle) {
    _$jscoverage['/editor/styles.js'].functionData[37]++;
    _$jscoverage['/editor/styles.js'].lineData[1230]++;
    var temp = new Node('<span>');
    _$jscoverage['/editor/styles.js'].lineData[1231]++;
    temp[isStyle ? 'style' : 'attr'](name, value);
    _$jscoverage['/editor/styles.js'].lineData[1232]++;
    return temp[isStyle ? 'style' : 'attr'](name);
  }
  _$jscoverage['/editor/styles.js'].lineData[1236]++;
  function removeFromInsideElement(style, element) {
    _$jscoverage['/editor/styles.js'].functionData[38]++;
    _$jscoverage['/editor/styles.js'].lineData[1237]++;
    var overrides = getOverrides(style), innerElements = element.all(style["element"]);
    _$jscoverage['/editor/styles.js'].lineData[1243]++;
    for (var i = innerElements.length; visit1014_1243_1(--i >= 0); ) {
      _$jscoverage['/editor/styles.js'].lineData[1244]++;
      removeFromElement(style, new Node(innerElements[i]));
    }
    _$jscoverage['/editor/styles.js'].lineData[1249]++;
    for (var overrideElement in overrides) {
      _$jscoverage['/editor/styles.js'].lineData[1251]++;
      if (visit1015_1251_1(overrideElement != style["element"])) {
        _$jscoverage['/editor/styles.js'].lineData[1252]++;
        innerElements = element.all(overrideElement);
        _$jscoverage['/editor/styles.js'].lineData[1253]++;
        for (i = innerElements.length - 1; visit1016_1253_1(i >= 0); i--) {
          _$jscoverage['/editor/styles.js'].lineData[1254]++;
          var innerElement = new Node(innerElements[i]);
          _$jscoverage['/editor/styles.js'].lineData[1255]++;
          removeOverrides(innerElement, overrides[overrideElement]);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1268]++;
  function removeOverrides(element, overrides) {
    _$jscoverage['/editor/styles.js'].functionData[39]++;
    _$jscoverage['/editor/styles.js'].lineData[1269]++;
    var i, attributes = visit1017_1269_1(overrides && overrides["attributes"]);
    _$jscoverage['/editor/styles.js'].lineData[1271]++;
    if (visit1018_1271_1(attributes)) {
      _$jscoverage['/editor/styles.js'].lineData[1272]++;
      for (i = 0; visit1019_1272_1(i < attributes.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1273]++;
        var attName = attributes[i][0], actualAttrValue;
        _$jscoverage['/editor/styles.js'].lineData[1275]++;
        if ((actualAttrValue = element.attr(attName))) {
          _$jscoverage['/editor/styles.js'].lineData[1276]++;
          var attValue = attributes[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1284]++;
          if (visit1020_1284_1(visit1021_1284_2(attValue === NULL) || visit1022_1285_1((visit1023_1285_2(attValue.test && attValue.test(actualAttrValue))) || (visit1024_1286_1(visit1025_1286_2(typeof attValue == 'string') && visit1026_1286_3(actualAttrValue == attValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1287]++;
            element[0].removeAttribute(attName);
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1292]++;
    var styles = visit1027_1292_1(overrides && overrides["styles"]);
    _$jscoverage['/editor/styles.js'].lineData[1294]++;
    if (visit1028_1294_1(styles)) {
      _$jscoverage['/editor/styles.js'].lineData[1295]++;
      for (i = 0; visit1029_1295_1(i < styles.length); i++) {
        _$jscoverage['/editor/styles.js'].lineData[1296]++;
        var styleName = styles[i][0], actualStyleValue;
        _$jscoverage['/editor/styles.js'].lineData[1298]++;
        if ((actualStyleValue = element.css(styleName))) {
          _$jscoverage['/editor/styles.js'].lineData[1299]++;
          var styleValue = styles[i][1];
          _$jscoverage['/editor/styles.js'].lineData[1300]++;
          if (visit1030_1300_1(visit1031_1300_2(styleValue === NULL) || visit1032_1302_1((visit1033_1302_2(styleValue.test && styleValue.test(actualAttrValue))) || (visit1034_1303_1(visit1035_1303_2(typeof styleValue == 'string') && visit1036_1303_3(actualStyleValue == styleValue)))))) {
            _$jscoverage['/editor/styles.js'].lineData[1304]++;
            element.css(styleName, "");
          }
        }
      }
    }
    _$jscoverage['/editor/styles.js'].lineData[1309]++;
    removeNoAttribsElement(element);
  }
  _$jscoverage['/editor/styles.js'].lineData[1313]++;
  function removeNoAttribsElement(element) {
    _$jscoverage['/editor/styles.js'].functionData[40]++;
    _$jscoverage['/editor/styles.js'].lineData[1316]++;
    if (visit1037_1316_1(!element._4e_hasAttributes())) {
      _$jscoverage['/editor/styles.js'].lineData[1319]++;
      var firstChild = element[0].firstChild, lastChild = element[0].lastChild;
      _$jscoverage['/editor/styles.js'].lineData[1322]++;
      element._4e_remove(TRUE);
      _$jscoverage['/editor/styles.js'].lineData[1324]++;
      if (visit1038_1324_1(firstChild)) {
        _$jscoverage['/editor/styles.js'].lineData[1326]++;
        visit1039_1326_1(visit1040_1326_2(firstChild.nodeType == Dom.NodeType.ELEMENT_NODE) && Dom._4e_mergeSiblings(firstChild));
        _$jscoverage['/editor/styles.js'].lineData[1329]++;
        if (visit1041_1329_1(lastChild && visit1042_1329_2(visit1043_1329_3(firstChild != lastChild) && visit1044_1330_1(lastChild.nodeType == Dom.NodeType.ELEMENT_NODE)))) {
          _$jscoverage['/editor/styles.js'].lineData[1331]++;
          Dom._4e_mergeSiblings(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/styles.js'].lineData[1336]++;
  Editor.Style = KEStyle;
  _$jscoverage['/editor/styles.js'].lineData[1338]++;
  return KEStyle;
}, {
  requires: ['./base', './range', './selection', './domIterator', './elementPath', 'node']});
