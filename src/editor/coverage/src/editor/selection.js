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
if (! _$jscoverage['/editor/selection.js']) {
  _$jscoverage['/editor/selection.js'] = {};
  _$jscoverage['/editor/selection.js'].lineData = [];
  _$jscoverage['/editor/selection.js'].lineData[10] = 0;
  _$jscoverage['/editor/selection.js'].lineData[11] = 0;
  _$jscoverage['/editor/selection.js'].lineData[12] = 0;
  _$jscoverage['/editor/selection.js'].lineData[13] = 0;
  _$jscoverage['/editor/selection.js'].lineData[14] = 0;
  _$jscoverage['/editor/selection.js'].lineData[19] = 0;
  _$jscoverage['/editor/selection.js'].lineData[24] = 0;
  _$jscoverage['/editor/selection.js'].lineData[40] = 0;
  _$jscoverage['/editor/selection.js'].lineData[41] = 0;
  _$jscoverage['/editor/selection.js'].lineData[42] = 0;
  _$jscoverage['/editor/selection.js'].lineData[43] = 0;
  _$jscoverage['/editor/selection.js'].lineData[51] = 0;
  _$jscoverage['/editor/selection.js'].lineData[52] = 0;
  _$jscoverage['/editor/selection.js'].lineData[53] = 0;
  _$jscoverage['/editor/selection.js'].lineData[54] = 0;
  _$jscoverage['/editor/selection.js'].lineData[56] = 0;
  _$jscoverage['/editor/selection.js'].lineData[62] = 0;
  _$jscoverage['/editor/selection.js'].lineData[67] = 0;
  _$jscoverage['/editor/selection.js'].lineData[90] = 0;
  _$jscoverage['/editor/selection.js'].lineData[100] = 0;
  _$jscoverage['/editor/selection.js'].lineData[102] = 0;
  _$jscoverage['/editor/selection.js'].lineData[106] = 0;
  _$jscoverage['/editor/selection.js'].lineData[107] = 0;
  _$jscoverage['/editor/selection.js'].lineData[130] = 0;
  _$jscoverage['/editor/selection.js'].lineData[131] = 0;
  _$jscoverage['/editor/selection.js'].lineData[132] = 0;
  _$jscoverage['/editor/selection.js'].lineData[135] = 0;
  _$jscoverage['/editor/selection.js'].lineData[138] = 0;
  _$jscoverage['/editor/selection.js'].lineData[139] = 0;
  _$jscoverage['/editor/selection.js'].lineData[141] = 0;
  _$jscoverage['/editor/selection.js'].lineData[145] = 0;
  _$jscoverage['/editor/selection.js'].lineData[148] = 0;
  _$jscoverage['/editor/selection.js'].lineData[152] = 0;
  _$jscoverage['/editor/selection.js'].lineData[156] = 0;
  _$jscoverage['/editor/selection.js'].lineData[157] = 0;
  _$jscoverage['/editor/selection.js'].lineData[160] = 0;
  _$jscoverage['/editor/selection.js'].lineData[161] = 0;
  _$jscoverage['/editor/selection.js'].lineData[162] = 0;
  _$jscoverage['/editor/selection.js'].lineData[165] = 0;
  _$jscoverage['/editor/selection.js'].lineData[167] = 0;
  _$jscoverage['/editor/selection.js'].lineData[168] = 0;
  _$jscoverage['/editor/selection.js'].lineData[171] = 0;
  _$jscoverage['/editor/selection.js'].lineData[172] = 0;
  _$jscoverage['/editor/selection.js'].lineData[175] = 0;
  _$jscoverage['/editor/selection.js'].lineData[176] = 0;
  _$jscoverage['/editor/selection.js'].lineData[184] = 0;
  _$jscoverage['/editor/selection.js'].lineData[185] = 0;
  _$jscoverage['/editor/selection.js'].lineData[191] = 0;
  _$jscoverage['/editor/selection.js'].lineData[192] = 0;
  _$jscoverage['/editor/selection.js'].lineData[199] = 0;
  _$jscoverage['/editor/selection.js'].lineData[201] = 0;
  _$jscoverage['/editor/selection.js'].lineData[202] = 0;
  _$jscoverage['/editor/selection.js'].lineData[205] = 0;
  _$jscoverage['/editor/selection.js'].lineData[208] = 0;
  _$jscoverage['/editor/selection.js'].lineData[209] = 0;
  _$jscoverage['/editor/selection.js'].lineData[211] = 0;
  _$jscoverage['/editor/selection.js'].lineData[212] = 0;
  _$jscoverage['/editor/selection.js'].lineData[214] = 0;
  _$jscoverage['/editor/selection.js'].lineData[216] = 0;
  _$jscoverage['/editor/selection.js'].lineData[219] = 0;
  _$jscoverage['/editor/selection.js'].lineData[221] = 0;
  _$jscoverage['/editor/selection.js'].lineData[222] = 0;
  _$jscoverage['/editor/selection.js'].lineData[226] = 0;
  _$jscoverage['/editor/selection.js'].lineData[227] = 0;
  _$jscoverage['/editor/selection.js'].lineData[229] = 0;
  _$jscoverage['/editor/selection.js'].lineData[230] = 0;
  _$jscoverage['/editor/selection.js'].lineData[233] = 0;
  _$jscoverage['/editor/selection.js'].lineData[237] = 0;
  _$jscoverage['/editor/selection.js'].lineData[238] = 0;
  _$jscoverage['/editor/selection.js'].lineData[239] = 0;
  _$jscoverage['/editor/selection.js'].lineData[240] = 0;
  _$jscoverage['/editor/selection.js'].lineData[243] = 0;
  _$jscoverage['/editor/selection.js'].lineData[247] = 0;
  _$jscoverage['/editor/selection.js'].lineData[250] = 0;
  _$jscoverage['/editor/selection.js'].lineData[251] = 0;
  _$jscoverage['/editor/selection.js'].lineData[256] = 0;
  _$jscoverage['/editor/selection.js'].lineData[261] = 0;
  _$jscoverage['/editor/selection.js'].lineData[265] = 0;
  _$jscoverage['/editor/selection.js'].lineData[266] = 0;
  _$jscoverage['/editor/selection.js'].lineData[272] = 0;
  _$jscoverage['/editor/selection.js'].lineData[279] = 0;
  _$jscoverage['/editor/selection.js'].lineData[280] = 0;
  _$jscoverage['/editor/selection.js'].lineData[281] = 0;
  _$jscoverage['/editor/selection.js'].lineData[282] = 0;
  _$jscoverage['/editor/selection.js'].lineData[289] = 0;
  _$jscoverage['/editor/selection.js'].lineData[294] = 0;
  _$jscoverage['/editor/selection.js'].lineData[295] = 0;
  _$jscoverage['/editor/selection.js'].lineData[298] = 0;
  _$jscoverage['/editor/selection.js'].lineData[299] = 0;
  _$jscoverage['/editor/selection.js'].lineData[300] = 0;
  _$jscoverage['/editor/selection.js'].lineData[301] = 0;
  _$jscoverage['/editor/selection.js'].lineData[302] = 0;
  _$jscoverage['/editor/selection.js'].lineData[303] = 0;
  _$jscoverage['/editor/selection.js'].lineData[304] = 0;
  _$jscoverage['/editor/selection.js'].lineData[305] = 0;
  _$jscoverage['/editor/selection.js'].lineData[306] = 0;
  _$jscoverage['/editor/selection.js'].lineData[307] = 0;
  _$jscoverage['/editor/selection.js'].lineData[309] = 0;
  _$jscoverage['/editor/selection.js'].lineData[310] = 0;
  _$jscoverage['/editor/selection.js'].lineData[314] = 0;
  _$jscoverage['/editor/selection.js'].lineData[317] = 0;
  _$jscoverage['/editor/selection.js'].lineData[320] = 0;
  _$jscoverage['/editor/selection.js'].lineData[321] = 0;
  _$jscoverage['/editor/selection.js'].lineData[322] = 0;
  _$jscoverage['/editor/selection.js'].lineData[325] = 0;
  _$jscoverage['/editor/selection.js'].lineData[328] = 0;
  _$jscoverage['/editor/selection.js'].lineData[329] = 0;
  _$jscoverage['/editor/selection.js'].lineData[334] = 0;
  _$jscoverage['/editor/selection.js'].lineData[335] = 0;
  _$jscoverage['/editor/selection.js'].lineData[336] = 0;
  _$jscoverage['/editor/selection.js'].lineData[343] = 0;
  _$jscoverage['/editor/selection.js'].lineData[345] = 0;
  _$jscoverage['/editor/selection.js'].lineData[346] = 0;
  _$jscoverage['/editor/selection.js'].lineData[349] = 0;
  _$jscoverage['/editor/selection.js'].lineData[350] = 0;
  _$jscoverage['/editor/selection.js'].lineData[352] = 0;
  _$jscoverage['/editor/selection.js'].lineData[353] = 0;
  _$jscoverage['/editor/selection.js'].lineData[354] = 0;
  _$jscoverage['/editor/selection.js'].lineData[357] = 0;
  _$jscoverage['/editor/selection.js'].lineData[358] = 0;
  _$jscoverage['/editor/selection.js'].lineData[371] = 0;
  _$jscoverage['/editor/selection.js'].lineData[372] = 0;
  _$jscoverage['/editor/selection.js'].lineData[373] = 0;
  _$jscoverage['/editor/selection.js'].lineData[376] = 0;
  _$jscoverage['/editor/selection.js'].lineData[379] = 0;
  _$jscoverage['/editor/selection.js'].lineData[381] = 0;
  _$jscoverage['/editor/selection.js'].lineData[385] = 0;
  _$jscoverage['/editor/selection.js'].lineData[387] = 0;
  _$jscoverage['/editor/selection.js'].lineData[388] = 0;
  _$jscoverage['/editor/selection.js'].lineData[389] = 0;
  _$jscoverage['/editor/selection.js'].lineData[394] = 0;
  _$jscoverage['/editor/selection.js'].lineData[395] = 0;
  _$jscoverage['/editor/selection.js'].lineData[398] = 0;
  _$jscoverage['/editor/selection.js'].lineData[400] = 0;
  _$jscoverage['/editor/selection.js'].lineData[402] = 0;
  _$jscoverage['/editor/selection.js'].lineData[406] = 0;
  _$jscoverage['/editor/selection.js'].lineData[408] = 0;
  _$jscoverage['/editor/selection.js'].lineData[409] = 0;
  _$jscoverage['/editor/selection.js'].lineData[412] = 0;
  _$jscoverage['/editor/selection.js'].lineData[414] = 0;
  _$jscoverage['/editor/selection.js'].lineData[415] = 0;
  _$jscoverage['/editor/selection.js'].lineData[418] = 0;
  _$jscoverage['/editor/selection.js'].lineData[419] = 0;
  _$jscoverage['/editor/selection.js'].lineData[420] = 0;
  _$jscoverage['/editor/selection.js'].lineData[421] = 0;
  _$jscoverage['/editor/selection.js'].lineData[423] = 0;
  _$jscoverage['/editor/selection.js'].lineData[427] = 0;
  _$jscoverage['/editor/selection.js'].lineData[428] = 0;
  _$jscoverage['/editor/selection.js'].lineData[429] = 0;
  _$jscoverage['/editor/selection.js'].lineData[430] = 0;
  _$jscoverage['/editor/selection.js'].lineData[433] = 0;
  _$jscoverage['/editor/selection.js'].lineData[434] = 0;
  _$jscoverage['/editor/selection.js'].lineData[435] = 0;
  _$jscoverage['/editor/selection.js'].lineData[437] = 0;
  _$jscoverage['/editor/selection.js'].lineData[438] = 0;
  _$jscoverage['/editor/selection.js'].lineData[443] = 0;
  _$jscoverage['/editor/selection.js'].lineData[444] = 0;
  _$jscoverage['/editor/selection.js'].lineData[458] = 0;
  _$jscoverage['/editor/selection.js'].lineData[462] = 0;
  _$jscoverage['/editor/selection.js'].lineData[463] = 0;
  _$jscoverage['/editor/selection.js'].lineData[467] = 0;
  _$jscoverage['/editor/selection.js'].lineData[468] = 0;
  _$jscoverage['/editor/selection.js'].lineData[469] = 0;
  _$jscoverage['/editor/selection.js'].lineData[475] = 0;
  _$jscoverage['/editor/selection.js'].lineData[476] = 0;
  _$jscoverage['/editor/selection.js'].lineData[477] = 0;
  _$jscoverage['/editor/selection.js'].lineData[485] = 0;
  _$jscoverage['/editor/selection.js'].lineData[497] = 0;
  _$jscoverage['/editor/selection.js'].lineData[500] = 0;
  _$jscoverage['/editor/selection.js'].lineData[503] = 0;
  _$jscoverage['/editor/selection.js'].lineData[506] = 0;
  _$jscoverage['/editor/selection.js'].lineData[507] = 0;
  _$jscoverage['/editor/selection.js'].lineData[512] = 0;
  _$jscoverage['/editor/selection.js'].lineData[516] = 0;
  _$jscoverage['/editor/selection.js'].lineData[519] = 0;
  _$jscoverage['/editor/selection.js'].lineData[523] = 0;
  _$jscoverage['/editor/selection.js'].lineData[525] = 0;
  _$jscoverage['/editor/selection.js'].lineData[526] = 0;
  _$jscoverage['/editor/selection.js'].lineData[527] = 0;
  _$jscoverage['/editor/selection.js'].lineData[530] = 0;
  _$jscoverage['/editor/selection.js'].lineData[531] = 0;
  _$jscoverage['/editor/selection.js'].lineData[532] = 0;
  _$jscoverage['/editor/selection.js'].lineData[536] = 0;
  _$jscoverage['/editor/selection.js'].lineData[539] = 0;
  _$jscoverage['/editor/selection.js'].lineData[540] = 0;
  _$jscoverage['/editor/selection.js'].lineData[542] = 0;
  _$jscoverage['/editor/selection.js'].lineData[543] = 0;
  _$jscoverage['/editor/selection.js'].lineData[544] = 0;
  _$jscoverage['/editor/selection.js'].lineData[545] = 0;
  _$jscoverage['/editor/selection.js'].lineData[550] = 0;
  _$jscoverage['/editor/selection.js'].lineData[551] = 0;
  _$jscoverage['/editor/selection.js'].lineData[552] = 0;
  _$jscoverage['/editor/selection.js'].lineData[554] = 0;
  _$jscoverage['/editor/selection.js'].lineData[555] = 0;
  _$jscoverage['/editor/selection.js'].lineData[556] = 0;
  _$jscoverage['/editor/selection.js'].lineData[561] = 0;
  _$jscoverage['/editor/selection.js'].lineData[562] = 0;
  _$jscoverage['/editor/selection.js'].lineData[565] = 0;
  _$jscoverage['/editor/selection.js'].lineData[568] = 0;
  _$jscoverage['/editor/selection.js'].lineData[569] = 0;
  _$jscoverage['/editor/selection.js'].lineData[570] = 0;
  _$jscoverage['/editor/selection.js'].lineData[572] = 0;
  _$jscoverage['/editor/selection.js'].lineData[573] = 0;
  _$jscoverage['/editor/selection.js'].lineData[574] = 0;
  _$jscoverage['/editor/selection.js'].lineData[582] = 0;
  _$jscoverage['/editor/selection.js'].lineData[586] = 0;
  _$jscoverage['/editor/selection.js'].lineData[589] = 0;
  _$jscoverage['/editor/selection.js'].lineData[590] = 0;
  _$jscoverage['/editor/selection.js'].lineData[593] = 0;
  _$jscoverage['/editor/selection.js'].lineData[594] = 0;
  _$jscoverage['/editor/selection.js'].lineData[596] = 0;
  _$jscoverage['/editor/selection.js'].lineData[598] = 0;
  _$jscoverage['/editor/selection.js'].lineData[602] = 0;
  _$jscoverage['/editor/selection.js'].lineData[605] = 0;
  _$jscoverage['/editor/selection.js'].lineData[606] = 0;
  _$jscoverage['/editor/selection.js'].lineData[609] = 0;
  _$jscoverage['/editor/selection.js'].lineData[612] = 0;
  _$jscoverage['/editor/selection.js'].lineData[616] = 0;
  _$jscoverage['/editor/selection.js'].lineData[617] = 0;
  _$jscoverage['/editor/selection.js'].lineData[618] = 0;
  _$jscoverage['/editor/selection.js'].lineData[619] = 0;
  _$jscoverage['/editor/selection.js'].lineData[620] = 0;
  _$jscoverage['/editor/selection.js'].lineData[622] = 0;
  _$jscoverage['/editor/selection.js'].lineData[626] = 0;
  _$jscoverage['/editor/selection.js'].lineData[627] = 0;
  _$jscoverage['/editor/selection.js'].lineData[631] = 0;
  _$jscoverage['/editor/selection.js'].lineData[632] = 0;
  _$jscoverage['/editor/selection.js'].lineData[634] = 0;
  _$jscoverage['/editor/selection.js'].lineData[635] = 0;
  _$jscoverage['/editor/selection.js'].lineData[637] = 0;
  _$jscoverage['/editor/selection.js'].lineData[638] = 0;
  _$jscoverage['/editor/selection.js'].lineData[640] = 0;
  _$jscoverage['/editor/selection.js'].lineData[641] = 0;
  _$jscoverage['/editor/selection.js'].lineData[646] = 0;
  _$jscoverage['/editor/selection.js'].lineData[650] = 0;
  _$jscoverage['/editor/selection.js'].lineData[651] = 0;
  _$jscoverage['/editor/selection.js'].lineData[652] = 0;
  _$jscoverage['/editor/selection.js'].lineData[653] = 0;
  _$jscoverage['/editor/selection.js'].lineData[654] = 0;
  _$jscoverage['/editor/selection.js'].lineData[656] = 0;
  _$jscoverage['/editor/selection.js'].lineData[657] = 0;
  _$jscoverage['/editor/selection.js'].lineData[661] = 0;
  _$jscoverage['/editor/selection.js'].lineData[664] = 0;
  _$jscoverage['/editor/selection.js'].lineData[671] = 0;
  _$jscoverage['/editor/selection.js'].lineData[672] = 0;
  _$jscoverage['/editor/selection.js'].lineData[673] = 0;
  _$jscoverage['/editor/selection.js'].lineData[681] = 0;
  _$jscoverage['/editor/selection.js'].lineData[682] = 0;
  _$jscoverage['/editor/selection.js'].lineData[683] = 0;
  _$jscoverage['/editor/selection.js'].lineData[684] = 0;
  _$jscoverage['/editor/selection.js'].lineData[687] = 0;
  _$jscoverage['/editor/selection.js'].lineData[688] = 0;
  _$jscoverage['/editor/selection.js'].lineData[695] = 0;
  _$jscoverage['/editor/selection.js'].lineData[697] = 0;
  _$jscoverage['/editor/selection.js'].lineData[699] = 0;
  _$jscoverage['/editor/selection.js'].lineData[703] = 0;
  _$jscoverage['/editor/selection.js'].lineData[705] = 0;
  _$jscoverage['/editor/selection.js'].lineData[709] = 0;
  _$jscoverage['/editor/selection.js'].lineData[710] = 0;
  _$jscoverage['/editor/selection.js'].lineData[714] = 0;
  _$jscoverage['/editor/selection.js'].lineData[715] = 0;
  _$jscoverage['/editor/selection.js'].lineData[717] = 0;
  _$jscoverage['/editor/selection.js'].lineData[718] = 0;
  _$jscoverage['/editor/selection.js'].lineData[723] = 0;
  _$jscoverage['/editor/selection.js'].lineData[724] = 0;
  _$jscoverage['/editor/selection.js'].lineData[725] = 0;
  _$jscoverage['/editor/selection.js'].lineData[728] = 0;
  _$jscoverage['/editor/selection.js'].lineData[732] = 0;
  _$jscoverage['/editor/selection.js'].lineData[733] = 0;
  _$jscoverage['/editor/selection.js'].lineData[734] = 0;
  _$jscoverage['/editor/selection.js'].lineData[738] = 0;
  _$jscoverage['/editor/selection.js'].lineData[744] = 0;
  _$jscoverage['/editor/selection.js'].lineData[748] = 0;
  _$jscoverage['/editor/selection.js'].lineData[749] = 0;
  _$jscoverage['/editor/selection.js'].lineData[750] = 0;
  _$jscoverage['/editor/selection.js'].lineData[751] = 0;
  _$jscoverage['/editor/selection.js'].lineData[756] = 0;
  _$jscoverage['/editor/selection.js'].lineData[760] = 0;
  _$jscoverage['/editor/selection.js'].lineData[763] = 0;
  _$jscoverage['/editor/selection.js'].lineData[767] = 0;
  _$jscoverage['/editor/selection.js'].lineData[768] = 0;
  _$jscoverage['/editor/selection.js'].lineData[772] = 0;
  _$jscoverage['/editor/selection.js'].lineData[775] = 0;
  _$jscoverage['/editor/selection.js'].lineData[777] = 0;
  _$jscoverage['/editor/selection.js'].lineData[779] = 0;
  _$jscoverage['/editor/selection.js'].lineData[781] = 0;
  _$jscoverage['/editor/selection.js'].lineData[783] = 0;
  _$jscoverage['/editor/selection.js'].lineData[785] = 0;
  _$jscoverage['/editor/selection.js'].lineData[786] = 0;
  _$jscoverage['/editor/selection.js'].lineData[793] = 0;
  _$jscoverage['/editor/selection.js'].lineData[794] = 0;
  _$jscoverage['/editor/selection.js'].lineData[795] = 0;
  _$jscoverage['/editor/selection.js'].lineData[797] = 0;
  _$jscoverage['/editor/selection.js'].lineData[813] = 0;
  _$jscoverage['/editor/selection.js'].lineData[814] = 0;
  _$jscoverage['/editor/selection.js'].lineData[815] = 0;
  _$jscoverage['/editor/selection.js'].lineData[816] = 0;
  _$jscoverage['/editor/selection.js'].lineData[821] = 0;
  _$jscoverage['/editor/selection.js'].lineData[826] = 0;
  _$jscoverage['/editor/selection.js'].lineData[827] = 0;
  _$jscoverage['/editor/selection.js'].lineData[829] = 0;
  _$jscoverage['/editor/selection.js'].lineData[830] = 0;
  _$jscoverage['/editor/selection.js'].lineData[832] = 0;
  _$jscoverage['/editor/selection.js'].lineData[833] = 0;
  _$jscoverage['/editor/selection.js'].lineData[835] = 0;
  _$jscoverage['/editor/selection.js'].lineData[837] = 0;
  _$jscoverage['/editor/selection.js'].lineData[839] = 0;
  _$jscoverage['/editor/selection.js'].lineData[840] = 0;
  _$jscoverage['/editor/selection.js'].lineData[841] = 0;
  _$jscoverage['/editor/selection.js'].lineData[844] = 0;
  _$jscoverage['/editor/selection.js'].lineData[845] = 0;
  _$jscoverage['/editor/selection.js'].lineData[846] = 0;
  _$jscoverage['/editor/selection.js'].lineData[851] = 0;
  _$jscoverage['/editor/selection.js'].lineData[852] = 0;
  _$jscoverage['/editor/selection.js'].lineData[853] = 0;
  _$jscoverage['/editor/selection.js'].lineData[856] = 0;
  _$jscoverage['/editor/selection.js'].lineData[858] = 0;
  _$jscoverage['/editor/selection.js'].lineData[860] = 0;
}
if (! _$jscoverage['/editor/selection.js'].functionData) {
  _$jscoverage['/editor/selection.js'].functionData = [];
  _$jscoverage['/editor/selection.js'].functionData[0] = 0;
  _$jscoverage['/editor/selection.js'].functionData[1] = 0;
  _$jscoverage['/editor/selection.js'].functionData[2] = 0;
  _$jscoverage['/editor/selection.js'].functionData[3] = 0;
  _$jscoverage['/editor/selection.js'].functionData[4] = 0;
  _$jscoverage['/editor/selection.js'].functionData[5] = 0;
  _$jscoverage['/editor/selection.js'].functionData[6] = 0;
  _$jscoverage['/editor/selection.js'].functionData[7] = 0;
  _$jscoverage['/editor/selection.js'].functionData[8] = 0;
  _$jscoverage['/editor/selection.js'].functionData[9] = 0;
  _$jscoverage['/editor/selection.js'].functionData[10] = 0;
  _$jscoverage['/editor/selection.js'].functionData[11] = 0;
  _$jscoverage['/editor/selection.js'].functionData[12] = 0;
  _$jscoverage['/editor/selection.js'].functionData[13] = 0;
  _$jscoverage['/editor/selection.js'].functionData[14] = 0;
  _$jscoverage['/editor/selection.js'].functionData[15] = 0;
  _$jscoverage['/editor/selection.js'].functionData[16] = 0;
  _$jscoverage['/editor/selection.js'].functionData[17] = 0;
  _$jscoverage['/editor/selection.js'].functionData[18] = 0;
  _$jscoverage['/editor/selection.js'].functionData[19] = 0;
  _$jscoverage['/editor/selection.js'].functionData[20] = 0;
  _$jscoverage['/editor/selection.js'].functionData[21] = 0;
  _$jscoverage['/editor/selection.js'].functionData[22] = 0;
  _$jscoverage['/editor/selection.js'].functionData[23] = 0;
  _$jscoverage['/editor/selection.js'].functionData[24] = 0;
}
if (! _$jscoverage['/editor/selection.js'].branchData) {
  _$jscoverage['/editor/selection.js'].branchData = {};
  _$jscoverage['/editor/selection.js'].branchData['51'] = [];
  _$jscoverage['/editor/selection.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['54'] = [];
  _$jscoverage['/editor/selection.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['54'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['54'][4] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['55'] = [];
  _$jscoverage['/editor/selection.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['102'] = [];
  _$jscoverage['/editor/selection.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['107'] = [];
  _$jscoverage['/editor/selection.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['131'] = [];
  _$jscoverage['/editor/selection.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['138'] = [];
  _$jscoverage['/editor/selection.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['141'] = [];
  _$jscoverage['/editor/selection.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['148'] = [];
  _$jscoverage['/editor/selection.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['149'] = [];
  _$jscoverage['/editor/selection.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['150'] = [];
  _$jscoverage['/editor/selection.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['150'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['161'] = [];
  _$jscoverage['/editor/selection.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['171'] = [];
  _$jscoverage['/editor/selection.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['175'] = [];
  _$jscoverage['/editor/selection.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['184'] = [];
  _$jscoverage['/editor/selection.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['208'] = [];
  _$jscoverage['/editor/selection.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['211'] = [];
  _$jscoverage['/editor/selection.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['221'] = [];
  _$jscoverage['/editor/selection.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['226'] = [];
  _$jscoverage['/editor/selection.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['226'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['226'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['226'][4] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['229'] = [];
  _$jscoverage['/editor/selection.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['237'] = [];
  _$jscoverage['/editor/selection.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['251'] = [];
  _$jscoverage['/editor/selection.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['265'] = [];
  _$jscoverage['/editor/selection.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['281'] = [];
  _$jscoverage['/editor/selection.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['290'] = [];
  _$jscoverage['/editor/selection.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['294'] = [];
  _$jscoverage['/editor/selection.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['298'] = [];
  _$jscoverage['/editor/selection.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['306'] = [];
  _$jscoverage['/editor/selection.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['309'] = [];
  _$jscoverage['/editor/selection.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['317'] = [];
  _$jscoverage['/editor/selection.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['317'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['317'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['335'] = [];
  _$jscoverage['/editor/selection.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['345'] = [];
  _$jscoverage['/editor/selection.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['349'] = [];
  _$jscoverage['/editor/selection.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['372'] = [];
  _$jscoverage['/editor/selection.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['387'] = [];
  _$jscoverage['/editor/selection.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['388'] = [];
  _$jscoverage['/editor/selection.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['398'] = [];
  _$jscoverage['/editor/selection.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['398'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['398'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['408'] = [];
  _$jscoverage['/editor/selection.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['414'] = [];
  _$jscoverage['/editor/selection.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['414'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['419'] = [];
  _$jscoverage['/editor/selection.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['419'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['427'] = [];
  _$jscoverage['/editor/selection.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['434'] = [];
  _$jscoverage['/editor/selection.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['434'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['437'] = [];
  _$jscoverage['/editor/selection.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['462'] = [];
  _$jscoverage['/editor/selection.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['467'] = [];
  _$jscoverage['/editor/selection.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['469'] = [];
  _$jscoverage['/editor/selection.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['475'] = [];
  _$jscoverage['/editor/selection.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['486'] = [];
  _$jscoverage['/editor/selection.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['486'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['487'] = [];
  _$jscoverage['/editor/selection.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['487'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['489'] = [];
  _$jscoverage['/editor/selection.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['519'] = [];
  _$jscoverage['/editor/selection.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['551'] = [];
  _$jscoverage['/editor/selection.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['552'] = [];
  _$jscoverage['/editor/selection.js'].branchData['552'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['561'] = [];
  _$jscoverage['/editor/selection.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['569'] = [];
  _$jscoverage['/editor/selection.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['573'] = [];
  _$jscoverage['/editor/selection.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['582'] = [];
  _$jscoverage['/editor/selection.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['583'] = [];
  _$jscoverage['/editor/selection.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['583'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['583'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['583'][4] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['583'][5] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['584'] = [];
  _$jscoverage['/editor/selection.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['584'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['605'] = [];
  _$jscoverage['/editor/selection.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['616'] = [];
  _$jscoverage['/editor/selection.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['618'] = [];
  _$jscoverage['/editor/selection.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['626'] = [];
  _$jscoverage['/editor/selection.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['631'] = [];
  _$jscoverage['/editor/selection.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['634'] = [];
  _$jscoverage['/editor/selection.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['637'] = [];
  _$jscoverage['/editor/selection.js'].branchData['637'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['640'] = [];
  _$jscoverage['/editor/selection.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['651'] = [];
  _$jscoverage['/editor/selection.js'].branchData['651'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['672'] = [];
  _$jscoverage['/editor/selection.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['682'] = [];
  _$jscoverage['/editor/selection.js'].branchData['682'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['683'] = [];
  _$jscoverage['/editor/selection.js'].branchData['683'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['687'] = [];
  _$jscoverage['/editor/selection.js'].branchData['687'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['703'] = [];
  _$jscoverage['/editor/selection.js'].branchData['703'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['704'] = [];
  _$jscoverage['/editor/selection.js'].branchData['704'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['704'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['723'] = [];
  _$jscoverage['/editor/selection.js'].branchData['723'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['747'] = [];
  _$jscoverage['/editor/selection.js'].branchData['747'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['747'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['747'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['749'] = [];
  _$jscoverage['/editor/selection.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['756'] = [];
  _$jscoverage['/editor/selection.js'].branchData['756'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['756'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['756'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['758'] = [];
  _$jscoverage['/editor/selection.js'].branchData['758'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['758'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['767'] = [];
  _$jscoverage['/editor/selection.js'].branchData['767'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['779'] = [];
  _$jscoverage['/editor/selection.js'].branchData['779'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['794'] = [];
  _$jscoverage['/editor/selection.js'].branchData['794'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['798'] = [];
  _$jscoverage['/editor/selection.js'].branchData['798'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['798'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['798'][3] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['800'] = [];
  _$jscoverage['/editor/selection.js'].branchData['800'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['800'][2] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['802'] = [];
  _$jscoverage['/editor/selection.js'].branchData['802'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['803'] = [];
  _$jscoverage['/editor/selection.js'].branchData['803'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['816'] = [];
  _$jscoverage['/editor/selection.js'].branchData['816'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['821'] = [];
  _$jscoverage['/editor/selection.js'].branchData['821'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['829'] = [];
  _$jscoverage['/editor/selection.js'].branchData['829'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['830'] = [];
  _$jscoverage['/editor/selection.js'].branchData['830'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['839'] = [];
  _$jscoverage['/editor/selection.js'].branchData['839'][1] = new BranchData();
  _$jscoverage['/editor/selection.js'].branchData['853'] = [];
  _$jscoverage['/editor/selection.js'].branchData['853'][1] = new BranchData();
}
_$jscoverage['/editor/selection.js'].branchData['853'][1].init(58, 21, '!sel || sel.isInvalid');
function visit763_853_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['853'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['839'][1].init(463, 9, 'dummySpan');
function visit762_839_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['839'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['830'][1].init(25, 18, 'isStartMarkerAlone');
function visit761_830_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['830'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['829'][1].init(4952, 9, 'collapsed');
function visit760_829_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['829'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['821'][1].init(376, 25, 'startNode[0] || startNode');
function visit759_821_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['821'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['816'][1].init(1750, 18, 'isStartMarkerAlone');
function visit758_816_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['816'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['803'][1].init(71, 51, 'Dom.nodeName(startNode[0].previousSibling) === \'br\'');
function visit757_803_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['803'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['802'][1].init(-1, 123, 'startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) === \'br\'');
function visit756_802_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['802'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['800'][2].init(171, 264, '!startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) === \'br\')');
function visit755_800_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['800'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['800'][1].init(156, 279, 'forceExpand || !startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) === \'br\')');
function visit754_800_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['800'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['798'][3].init(58, 55, 'next.nodeValue && next.nodeValue.match(fillerTextRegex)');
function visit753_798_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['798'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['798'][2].init(50, 63, 'next && next.nodeValue && next.nodeValue.match(fillerTextRegex)');
function visit752_798_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['798'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['798'][1].init(-1, 470, '!(next && next.nodeValue && next.nodeValue.match(fillerTextRegex)) && (forceExpand || !startNode[0].previousSibling || (startNode[0].previousSibling && Dom.nodeName(startNode[0].previousSibling) === \'br\'))');
function visit751_798_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['798'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['794'][1].init(427, 29, 'next && !notWhitespaces(next)');
function visit750_794_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['794'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['779'][1].init(2018, 7, 'endNode');
function visit749_779_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['779'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['767'][1].init(1564, 10, '!collapsed');
function visit748_767_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['767'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['758'][2].init(1130, 59, 'self.endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit747_758_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['758'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['758'][1].init(150, 127, 'self.endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.endContainer.nodeName() in nonCells');
function visit746_758_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['758'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['756'][3].init(977, 61, 'self.startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit745_756_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['756'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['756'][2].init(977, 127, 'self.startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.startContainer.nodeName() in nonCells');
function visit744_756_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['756'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['756'][1].init(977, 278, 'self.startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.startContainer.nodeName() in nonCells || self.endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && self.endContainer.nodeName() in nonCells');
function visit743_756_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['756'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['749'][1].init(110, 44, 'selEl.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit742_749_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['747'][3].init(50, 39, 'self.endOffset - self.startOffset === 1');
function visit741_747_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['747'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['747'][2].init(339, 47, 'self.startContainer[0] === self.endContainer[0]');
function visit740_747_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['747'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['747'][1].init(88, 90, 'self.startContainer[0] === self.endContainer[0] && self.endOffset - self.startOffset === 1');
function visit739_747_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['747'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['723'][1].init(276, 51, 'e.toString().indexOf(\'NS_ERROR_ILLEGAL_VALUE\') >= 0');
function visit738_723_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['723'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['704'][2].init(276, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit737_704_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['704'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['704'][1].init(33, 96, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit736_704_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['704'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['703'][1].init(240, 130, 'self.collapsed && startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit735_703_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['703'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['687'][1].init(21, 3, 'sel');
function visit734_687_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['687'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['683'][1].init(21, 3, 'sel');
function visit733_683_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['683'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['682'][1].init(57, 7, '!OLD_IE');
function visit732_682_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['672'][1].init(196, 5, 'start');
function visit731_672_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['651'][1].init(71, 20, 'i < bookmarks.length');
function visit730_651_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['651'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['640'][1].init(632, 42, 'Dom.equals(rangeEnd, bookmarkEnd.parent())');
function visit729_640_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['637'][1].init(490, 44, 'Dom.equals(rangeEnd, bookmarkStart.parent())');
function visit728_637_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['637'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['634'][1].init(346, 44, 'Dom.equals(rangeStart, bookmarkEnd.parent())');
function visit727_634_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['631'][1].init(200, 46, 'Dom.equals(rangeStart, bookmarkStart.parent())');
function visit726_631_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['626'][1].init(492, 10, 'j < length');
function visit725_626_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['618'][1].init(239, 10, 'i < length');
function visit724_618_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['616'][1].init(143, 26, 'ranges || self.getRanges()');
function visit723_616_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['605'][1].init(105, 17, 'i < ranges.length');
function visit722_605_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['584'][2].init(590, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit721_584_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['584'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['584'][1].init(84, 96, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit720_584_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['583'][5].init(539, 21, 'UA.opera || UA.webkit');
function visit719_583_5(result) {
  _$jscoverage['/editor/selection.js'].branchData['583'][5].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['583'][4].init(516, 17, 'UA.gecko < 1.0900');
function visit718_583_4(result) {
  _$jscoverage['/editor/selection.js'].branchData['583'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['583'][3].init(504, 29, 'UA.gecko && UA.gecko < 1.0900');
function visit717_583_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['583'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['583'][2].init(504, 56, '(UA.gecko && UA.gecko < 1.0900) || UA.opera || UA.webkit');
function visit716_583_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['583'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['583'][1].init(45, 181, '((UA.gecko && UA.gecko < 1.0900) || UA.opera || UA.webkit) && startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit715_583_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['582'][1].init(456, 227, 'range.collapsed && ((UA.gecko && UA.gecko < 1.0900) || UA.opera || UA.webkit) && startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE && !startContainer[0].childNodes.length');
function visit714_582_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['573'][1].init(190, 17, 'i < ranges.length');
function visit713_573_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['569'][1].init(65, 4, '!sel');
function visit712_569_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['561'][1].init(464, 11, 'ranges[0]');
function visit711_561_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['552'][1].init(21, 17, 'ranges.length > 1');
function visit710_552_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['552'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['551'][1].init(46, 6, 'OLD_IE');
function visit709_551_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['519'][1].init(106, 6, 'OLD_IE');
function visit708_519_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['489'][1].init(129, 98, 'styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit707_489_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['487'][2].init(76, 50, 'enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit706_487_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['487'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['487'][1].init(70, 228, '(enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit705_487_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['486'][2].init(359, 299, '(enclosed = range.getEnclosedNode()) && (enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed)');
function visit704_486_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['486'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['486'][1].init(40, 309, 'i && !((enclosed = range.getEnclosedNode()) && (enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE) && styleObjectElements[enclosed.nodeName()] && (selected = enclosed))');
function visit703_486_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['475'][1].init(566, 5, '!node');
function visit702_475_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['469'][1].init(84, 27, 'range.item && range.item(0)');
function visit701_469_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['467'][1].init(278, 6, 'OLD_IE');
function visit700_467_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['462'][1].init(107, 35, 'cache.selectedElement !== undefined');
function visit699_462_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['437'][1].init(237, 4, 'node');
function visit698_437_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['434'][2].init(84, 43, 'node.nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit697_434_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['434'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['434'][1].init(76, 51, 'node && node.nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit696_434_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['427'][1].init(2086, 6, 'OLD_IE');
function visit695_427_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['419'][2].init(1620, 44, 'child.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit694_419_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['419'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['419'][1].init(1611, 53, 'child && child.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit693_419_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['414'][2].init(1374, 46, 'node[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit692_414_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['414'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['414'][1].init(1362, 58, '!node[0] || node[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit691_414_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['408'][1].init(1110, 46, 'node[0].nodeType !== Dom.NodeType.ELEMENT_NODE');
function visit690_408_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['398'][3].init(283, 56, 'startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit689_398_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['398'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['398'][2].init(265, 187, 'startOffset === (startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length)');
function visit688_398_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['398'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['398'][1].init(265, 227, 'startOffset === (startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length) && !startContainer._4eIsBlockBoundary()');
function visit687_398_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['388'][1].init(29, 16, '!range.collapsed');
function visit686_388_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['387'][1].init(104, 5, 'range');
function visit685_387_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['372'][1].init(68, 32, 'cache.startElement !== undefined');
function visit684_372_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['349'][1].init(485, 18, 'i < sel.rangeCount');
function visit683_349_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['345'][1].init(395, 4, '!sel');
function visit682_345_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['335'][1].init(76, 22, 'cache.ranges && !force');
function visit681_335_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['317'][3].init(364, 39, 'parentElement.childNodes[j] !== element');
function visit680_317_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['317'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['317'][2].init(325, 35, 'j < parentElement.childNodes.length');
function visit679_317_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['317'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['317'][1].init(325, 78, 'j < parentElement.childNodes.length && parentElement.childNodes[j] !== element');
function visit678_317_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['309'][1].init(98, 22, 'i < nativeRange.length');
function visit677_309_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['306'][1].init(1238, 30, 'type === KES.SELECTION_ELEMENT');
function visit676_306_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['298'][1].init(675, 27, 'type === KES.SELECTION_TEXT');
function visit675_298_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['294'][1].init(585, 4, '!sel');
function visit674_294_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['290'][1].init(65, 24, 'sel && sel.createRange()');
function visit673_290_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['281'][1].init(84, 22, 'cache.ranges && !force');
function visit672_281_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['265'][1].init(3000, 14, 'distance === 0');
function visit671_265_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['251'][1].init(32, 12, 'distance > 0');
function visit670_251_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['237'][1].init(1773, 10, '!testRange');
function visit669_237_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['229'][1].init(975, 14, '!comparisonEnd');
function visit668_229_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['226'][4].init(808, 22, 'comparisonStart === -1');
function visit667_226_4(result) {
  _$jscoverage['/editor/selection.js'].branchData['226'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['226'][3].init(785, 19, 'comparisonEnd === 1');
function visit666_226_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['226'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['226'][2].init(785, 45, 'comparisonEnd === 1 && comparisonStart === -1');
function visit665_226_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['226'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['226'][1].init(765, 65, '!comparisonStart || comparisonEnd === 1 && comparisonStart === -1');
function visit664_226_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['221'][1].init(445, 19, 'comparisonStart > 0');
function visit663_221_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['211'][1].init(81, 44, 'child.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit662_211_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['208'][1].init(400, 19, 'i < siblings.length');
function visit661_208_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['184'][1].init(701, 31, 'sel.createRange().parentElement');
function visit660_184_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['175'][1].init(236, 20, 'ieType === \'Control\'');
function visit659_175_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['171'][1].init(117, 17, 'ieType === \'Text\'');
function visit658_171_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['161'][1].init(76, 10, 'cache.type');
function visit657_161_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['150'][2].init(405, 49, 'Number(range.endOffset - range.startOffset) === 1');
function visit656_150_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['150'][1].init(80, 169, 'Number(range.endOffset - range.startOffset) === 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit655_150_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['149'][2].init(323, 53, 'startContainer.nodeType === Dom.NodeType.ELEMENT_NODE');
function visit654_149_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['149'][1].init(64, 250, 'startContainer.nodeType === Dom.NodeType.ELEMENT_NODE && Number(range.endOffset - range.startOffset) === 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit653_149_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['148'][2].init(256, 37, 'startContainer === range.endContainer');
function visit652_148_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['148'][1].init(256, 315, 'startContainer === range.endContainer && startContainer.nodeType === Dom.NodeType.ELEMENT_NODE && Number(range.endOffset - range.startOffset) === 1 && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()]');
function visit651_148_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['141'][1].init(359, 20, 'sel.rangeCount === 1');
function visit650_141_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['138'][1].init(260, 4, '!sel');
function visit649_138_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['131'][1].init(76, 10, 'cache.type');
function visit648_131_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['107'][1].init(79, 64, 'cache.nativeSel || (cache.nativeSel = self.document.selection)');
function visit647_107_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['102'][1].init(99, 84, 'cache.nativeSel || (cache.nativeSel = Dom.getWindow(self.document).getSelection())');
function visit646_102_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['55'][2].init(104, 48, 'range.parentElement().ownerDocument !== document');
function visit645_55_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['55'][1].init(81, 71, 'range.parentElement && range.parentElement().ownerDocument !== document');
function visit644_55_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['54'][4].init(107, 40, 'range.item(0).ownerDocument !== document');
function visit643_54_4(result) {
  _$jscoverage['/editor/selection.js'].branchData['54'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['54'][3].init(93, 54, 'range.item && range.item(0).ownerDocument !== document');
function visit642_54_3(result) {
  _$jscoverage['/editor/selection.js'].branchData['54'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['54'][2].init(93, 155, '(range.item && range.item(0).ownerDocument !== document) || (range.parentElement && range.parentElement().ownerDocument !== document)');
function visit641_54_2(result) {
  _$jscoverage['/editor/selection.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['54'][1].init(81, 167, '!range || (range.item && range.item(0).ownerDocument !== document) || (range.parentElement && range.parentElement().ownerDocument !== document)');
function visit640_54_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].branchData['51'][1].init(285, 6, 'OLD_IE');
function visit639_51_1(result) {
  _$jscoverage['/editor/selection.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selection.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/selection.js'].functionData[0]++;
  _$jscoverage['/editor/selection.js'].lineData[11]++;
  var Node = require('node');
  _$jscoverage['/editor/selection.js'].lineData[12]++;
  var Walker = require('./walker');
  _$jscoverage['/editor/selection.js'].lineData[13]++;
  var KERange = require('./range');
  _$jscoverage['/editor/selection.js'].lineData[14]++;
  var Editor = require('./base');
  _$jscoverage['/editor/selection.js'].lineData[19]++;
  Editor.SelectionType = {
  SELECTION_NONE: 1, 
  SELECTION_TEXT: 2, 
  SELECTION_ELEMENT: 3};
  _$jscoverage['/editor/selection.js'].lineData[24]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Dom = S.DOM, KES = Editor.SelectionType, KER = Editor.RangeType, OLD_IE = document.selection;
  _$jscoverage['/editor/selection.js'].lineData[40]++;
  function KESelection(document) {
    _$jscoverage['/editor/selection.js'].functionData[1]++;
    _$jscoverage['/editor/selection.js'].lineData[41]++;
    var self = this;
    _$jscoverage['/editor/selection.js'].lineData[42]++;
    self.document = document;
    _$jscoverage['/editor/selection.js'].lineData[43]++;
    self._ = {
  cache: {}};
    _$jscoverage['/editor/selection.js'].lineData[51]++;
    if (visit639_51_1(OLD_IE)) {
      _$jscoverage['/editor/selection.js'].lineData[52]++;
      try {
        _$jscoverage['/editor/selection.js'].lineData[53]++;
        var range = self.getNative().createRange();
        _$jscoverage['/editor/selection.js'].lineData[54]++;
        if (visit640_54_1(!range || visit641_54_2((visit642_54_3(range.item && visit643_54_4(range.item(0).ownerDocument !== document))) || (visit644_55_1(range.parentElement && visit645_55_2(range.parentElement().ownerDocument !== document)))))) {
          _$jscoverage['/editor/selection.js'].lineData[56]++;
          self.isInvalid = TRUE;
        }
      }      catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[62]++;
  self.isInvalid = TRUE;
}
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[67]++;
  var styleObjectElements = {
  'img': 1, 
  'hr': 1, 
  'li': 1, 
  'table': 1, 
  'tr': 1, 
  'td': 1, 
  'th': 1, 
  'embed': 1, 
  'object': 1, 
  'ol': 1, 
  'ul': 1, 
  'a': 1, 
  'input': 1, 
  'form': 1, 
  'select': 1, 
  'textarea': 1, 
  'button': 1, 
  'fieldset': 1, 
  'thead': 1, 
  'tfoot': 1};
  _$jscoverage['/editor/selection.js'].lineData[90]++;
  S.augment(KESelection, {
  getNative: !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[2]++;
  _$jscoverage['/editor/selection.js'].lineData[100]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[102]++;
  return visit646_102_1(cache.nativeSel || (cache.nativeSel = Dom.getWindow(self.document).getSelection()));
} : function() {
  _$jscoverage['/editor/selection.js'].functionData[3]++;
  _$jscoverage['/editor/selection.js'].lineData[106]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[107]++;
  return visit647_107_1(cache.nativeSel || (cache.nativeSel = self.document.selection));
}, 
  getType: !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[4]++;
  _$jscoverage['/editor/selection.js'].lineData[130]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[131]++;
  if (visit648_131_1(cache.type)) {
    _$jscoverage['/editor/selection.js'].lineData[132]++;
    return cache.type;
  }
  _$jscoverage['/editor/selection.js'].lineData[135]++;
  var type = KES.SELECTION_TEXT, sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[138]++;
  if (visit649_138_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[139]++;
    type = KES.SELECTION_NONE;
  } else {
    _$jscoverage['/editor/selection.js'].lineData[141]++;
    if (visit650_141_1(sel.rangeCount === 1)) {
      _$jscoverage['/editor/selection.js'].lineData[145]++;
      var range = sel.getRangeAt(0), startContainer = range.startContainer;
      _$jscoverage['/editor/selection.js'].lineData[148]++;
      if (visit651_148_1(visit652_148_2(startContainer === range.endContainer) && visit653_149_1(visit654_149_2(startContainer.nodeType === Dom.NodeType.ELEMENT_NODE) && visit655_150_1(visit656_150_2(Number(range.endOffset - range.startOffset) === 1) && styleObjectElements[startContainer.childNodes[range.startOffset].nodeName.toLowerCase()])))) {
        _$jscoverage['/editor/selection.js'].lineData[152]++;
        type = KES.SELECTION_ELEMENT;
      }
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[156]++;
  cache.type = type;
  _$jscoverage['/editor/selection.js'].lineData[157]++;
  return type;
} : function() {
  _$jscoverage['/editor/selection.js'].functionData[5]++;
  _$jscoverage['/editor/selection.js'].lineData[160]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[161]++;
  if (visit657_161_1(cache.type)) {
    _$jscoverage['/editor/selection.js'].lineData[162]++;
    return cache.type;
  }
  _$jscoverage['/editor/selection.js'].lineData[165]++;
  var type = KES.SELECTION_NONE;
  _$jscoverage['/editor/selection.js'].lineData[167]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[168]++;
    var sel = self.getNative(), ieType = sel.type;
    _$jscoverage['/editor/selection.js'].lineData[171]++;
    if (visit658_171_1(ieType === 'Text')) {
      _$jscoverage['/editor/selection.js'].lineData[172]++;
      type = KES.SELECTION_TEXT;
    }
    _$jscoverage['/editor/selection.js'].lineData[175]++;
    if (visit659_175_1(ieType === 'Control')) {
      _$jscoverage['/editor/selection.js'].lineData[176]++;
      type = KES.SELECTION_ELEMENT;
    }
    _$jscoverage['/editor/selection.js'].lineData[184]++;
    if (visit660_184_1(sel.createRange().parentElement)) {
      _$jscoverage['/editor/selection.js'].lineData[185]++;
      type = KES.SELECTION_TEXT;
    }
  }  catch (e) {
}
  _$jscoverage['/editor/selection.js'].lineData[191]++;
  cache.type = type;
  _$jscoverage['/editor/selection.js'].lineData[192]++;
  return type;
}, 
  getRanges: OLD_IE ? (function() {
  _$jscoverage['/editor/selection.js'].functionData[6]++;
  _$jscoverage['/editor/selection.js'].lineData[199]++;
  var getBoundaryInformation = function(range, start) {
  _$jscoverage['/editor/selection.js'].functionData[7]++;
  _$jscoverage['/editor/selection.js'].lineData[201]++;
  range = range.duplicate();
  _$jscoverage['/editor/selection.js'].lineData[202]++;
  range.collapse(start);
  _$jscoverage['/editor/selection.js'].lineData[205]++;
  var parent = range.parentElement(), siblings = parent.childNodes, testRange;
  _$jscoverage['/editor/selection.js'].lineData[208]++;
  for (var i = 0; visit661_208_1(i < siblings.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[209]++;
    var child = siblings[i];
    _$jscoverage['/editor/selection.js'].lineData[211]++;
    if (visit662_211_1(child.nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/selection.js'].lineData[212]++;
      testRange = range.duplicate();
      _$jscoverage['/editor/selection.js'].lineData[214]++;
      testRange.moveToElementText(child);
      _$jscoverage['/editor/selection.js'].lineData[216]++;
      var comparisonStart = testRange.compareEndPoints('StartToStart', range), comparisonEnd = testRange.compareEndPoints('EndToStart', range);
      _$jscoverage['/editor/selection.js'].lineData[219]++;
      testRange.collapse();
      _$jscoverage['/editor/selection.js'].lineData[221]++;
      if (visit663_221_1(comparisonStart > 0)) {
        _$jscoverage['/editor/selection.js'].lineData[222]++;
        break;
      } else {
        _$jscoverage['/editor/selection.js'].lineData[226]++;
        if (visit664_226_1(!comparisonStart || visit665_226_2(visit666_226_3(comparisonEnd === 1) && visit667_226_4(comparisonStart === -1)))) {
          _$jscoverage['/editor/selection.js'].lineData[227]++;
          return {
  container: parent, 
  offset: i};
        } else {
          _$jscoverage['/editor/selection.js'].lineData[229]++;
          if (visit668_229_1(!comparisonEnd)) {
            _$jscoverage['/editor/selection.js'].lineData[230]++;
            return {
  container: parent, 
  offset: i + 1};
          }
        }
      }
      _$jscoverage['/editor/selection.js'].lineData[233]++;
      testRange = NULL;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[237]++;
  if (visit669_237_1(!testRange)) {
    _$jscoverage['/editor/selection.js'].lineData[238]++;
    testRange = range.duplicate();
    _$jscoverage['/editor/selection.js'].lineData[239]++;
    testRange.moveToElementText(parent);
    _$jscoverage['/editor/selection.js'].lineData[240]++;
    testRange.collapse(FALSE);
  }
  _$jscoverage['/editor/selection.js'].lineData[243]++;
  testRange.setEndPoint('StartToStart', range);
  _$jscoverage['/editor/selection.js'].lineData[247]++;
  var distance = String(testRange.text).replace(/\r\n|\r/g, '\n').length;
  _$jscoverage['/editor/selection.js'].lineData[250]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[251]++;
    while (visit670_251_1(distance > 0)) {
      _$jscoverage['/editor/selection.js'].lineData[256]++;
      distance -= siblings[--i].nodeValue.length;
    }
  }  catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[261]++;
  distance = 0;
}
  _$jscoverage['/editor/selection.js'].lineData[265]++;
  if (visit671_265_1(distance === 0)) {
    _$jscoverage['/editor/selection.js'].lineData[266]++;
    return {
  container: parent, 
  offset: i};
  } else {
    _$jscoverage['/editor/selection.js'].lineData[272]++;
    return {
  container: siblings[i], 
  offset: -distance};
  }
};
  _$jscoverage['/editor/selection.js'].lineData[279]++;
  return function(force) {
  _$jscoverage['/editor/selection.js'].functionData[8]++;
  _$jscoverage['/editor/selection.js'].lineData[280]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[281]++;
  if (visit672_281_1(cache.ranges && !force)) {
    _$jscoverage['/editor/selection.js'].lineData[282]++;
    return cache.ranges;
  }
  _$jscoverage['/editor/selection.js'].lineData[289]++;
  var sel = self.getNative(), nativeRange = visit673_290_1(sel && sel.createRange()), type = self.getType(), range;
  _$jscoverage['/editor/selection.js'].lineData[294]++;
  if (visit674_294_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[295]++;
    return [];
  }
  _$jscoverage['/editor/selection.js'].lineData[298]++;
  if (visit675_298_1(type === KES.SELECTION_TEXT)) {
    _$jscoverage['/editor/selection.js'].lineData[299]++;
    range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[300]++;
    var boundaryInfo = getBoundaryInformation(nativeRange, TRUE);
    _$jscoverage['/editor/selection.js'].lineData[301]++;
    range.setStart(new Node(boundaryInfo.container), boundaryInfo.offset);
    _$jscoverage['/editor/selection.js'].lineData[302]++;
    boundaryInfo = getBoundaryInformation(nativeRange);
    _$jscoverage['/editor/selection.js'].lineData[303]++;
    range.setEnd(new Node(boundaryInfo.container), boundaryInfo.offset);
    _$jscoverage['/editor/selection.js'].lineData[304]++;
    cache.ranges = [range];
    _$jscoverage['/editor/selection.js'].lineData[305]++;
    return [range];
  } else {
    _$jscoverage['/editor/selection.js'].lineData[306]++;
    if (visit676_306_1(type === KES.SELECTION_ELEMENT)) {
      _$jscoverage['/editor/selection.js'].lineData[307]++;
      var retval = cache.ranges = [];
      _$jscoverage['/editor/selection.js'].lineData[309]++;
      for (var i = 0; visit677_309_1(i < nativeRange.length); i++) {
        _$jscoverage['/editor/selection.js'].lineData[310]++;
        var element = nativeRange.item(i), parentElement = element.parentNode, j = 0;
        _$jscoverage['/editor/selection.js'].lineData[314]++;
        range = new KERange(self.document);
        _$jscoverage['/editor/selection.js'].lineData[317]++;
        for (; visit678_317_1(visit679_317_2(j < parentElement.childNodes.length) && visit680_317_3(parentElement.childNodes[j] !== element)); j++) {
        }
        _$jscoverage['/editor/selection.js'].lineData[320]++;
        range.setStart(new Node(parentElement), j);
        _$jscoverage['/editor/selection.js'].lineData[321]++;
        range.setEnd(new Node(parentElement), j + 1);
        _$jscoverage['/editor/selection.js'].lineData[322]++;
        retval.push(range);
      }
      _$jscoverage['/editor/selection.js'].lineData[325]++;
      return retval;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[328]++;
  cache.ranges = [];
  _$jscoverage['/editor/selection.js'].lineData[329]++;
  return [];
};
})() : function(force) {
  _$jscoverage['/editor/selection.js'].functionData[9]++;
  _$jscoverage['/editor/selection.js'].lineData[334]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[335]++;
  if (visit681_335_1(cache.ranges && !force)) {
    _$jscoverage['/editor/selection.js'].lineData[336]++;
    return cache.ranges;
  }
  _$jscoverage['/editor/selection.js'].lineData[343]++;
  var ranges = [], sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[345]++;
  if (visit682_345_1(!sel)) {
    _$jscoverage['/editor/selection.js'].lineData[346]++;
    return [];
  }
  _$jscoverage['/editor/selection.js'].lineData[349]++;
  for (var i = 0; visit683_349_1(i < sel.rangeCount); i++) {
    _$jscoverage['/editor/selection.js'].lineData[350]++;
    var nativeRange = sel.getRangeAt(i), range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[352]++;
    range.setStart(new Node(nativeRange.startContainer), nativeRange.startOffset);
    _$jscoverage['/editor/selection.js'].lineData[353]++;
    range.setEnd(new Node(nativeRange.endContainer), nativeRange.endOffset);
    _$jscoverage['/editor/selection.js'].lineData[354]++;
    ranges.push(range);
  }
  _$jscoverage['/editor/selection.js'].lineData[357]++;
  cache.ranges = ranges;
  _$jscoverage['/editor/selection.js'].lineData[358]++;
  return ranges;
}, 
  getStartElement: function() {
  _$jscoverage['/editor/selection.js'].functionData[10]++;
  _$jscoverage['/editor/selection.js'].lineData[371]++;
  var self = this, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[372]++;
  if (visit684_372_1(cache.startElement !== undefined)) {
    _$jscoverage['/editor/selection.js'].lineData[373]++;
    return cache.startElement;
  }
  _$jscoverage['/editor/selection.js'].lineData[376]++;
  var node, sel = self.getNative();
  _$jscoverage['/editor/selection.js'].lineData[379]++;
  switch (self.getType()) {
    case KES.SELECTION_ELEMENT:
      _$jscoverage['/editor/selection.js'].lineData[381]++;
      return this.getSelectedElement();
    case KES.SELECTION_TEXT:
      _$jscoverage['/editor/selection.js'].lineData[385]++;
      var range = self.getRanges()[0];
      _$jscoverage['/editor/selection.js'].lineData[387]++;
      if (visit685_387_1(range)) {
        _$jscoverage['/editor/selection.js'].lineData[388]++;
        if (visit686_388_1(!range.collapsed)) {
          _$jscoverage['/editor/selection.js'].lineData[389]++;
          range.optimize();
          _$jscoverage['/editor/selection.js'].lineData[394]++;
          while (TRUE) {
            _$jscoverage['/editor/selection.js'].lineData[395]++;
            var startContainer = range.startContainer, startOffset = range.startOffset;
            _$jscoverage['/editor/selection.js'].lineData[398]++;
            if (visit687_398_1(visit688_398_2(startOffset === (visit689_398_3(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) ? startContainer[0].childNodes.length : startContainer[0].nodeValue.length)) && !startContainer._4eIsBlockBoundary())) {
              _$jscoverage['/editor/selection.js'].lineData[400]++;
              range.setStartAfter(startContainer);
            } else {
              _$jscoverage['/editor/selection.js'].lineData[402]++;
              break;
            }
          }
          _$jscoverage['/editor/selection.js'].lineData[406]++;
          node = range.startContainer;
          _$jscoverage['/editor/selection.js'].lineData[408]++;
          if (visit690_408_1(node[0].nodeType !== Dom.NodeType.ELEMENT_NODE)) {
            _$jscoverage['/editor/selection.js'].lineData[409]++;
            return node.parent();
          }
          _$jscoverage['/editor/selection.js'].lineData[412]++;
          node = new Node(node[0].childNodes[range.startOffset]);
          _$jscoverage['/editor/selection.js'].lineData[414]++;
          if (visit691_414_1(!node[0] || visit692_414_2(node[0].nodeType !== Dom.NodeType.ELEMENT_NODE))) {
            _$jscoverage['/editor/selection.js'].lineData[415]++;
            return range.startContainer;
          }
          _$jscoverage['/editor/selection.js'].lineData[418]++;
          var child = node[0].firstChild;
          _$jscoverage['/editor/selection.js'].lineData[419]++;
          while (visit693_419_1(child && visit694_419_2(child.nodeType === Dom.NodeType.ELEMENT_NODE))) {
            _$jscoverage['/editor/selection.js'].lineData[420]++;
            node = new Node(child);
            _$jscoverage['/editor/selection.js'].lineData[421]++;
            child = child.firstChild;
          }
          _$jscoverage['/editor/selection.js'].lineData[423]++;
          return node;
        }
      }
      _$jscoverage['/editor/selection.js'].lineData[427]++;
      if (visit695_427_1(OLD_IE)) {
        _$jscoverage['/editor/selection.js'].lineData[428]++;
        range = sel.createRange();
        _$jscoverage['/editor/selection.js'].lineData[429]++;
        range.collapse(TRUE);
        _$jscoverage['/editor/selection.js'].lineData[430]++;
        node = new Node(range.parentElement());
      } else {
        _$jscoverage['/editor/selection.js'].lineData[433]++;
        node = sel.anchorNode;
        _$jscoverage['/editor/selection.js'].lineData[434]++;
        if (visit696_434_1(node && visit697_434_2(node.nodeType !== Dom.NodeType.ELEMENT_NODE))) {
          _$jscoverage['/editor/selection.js'].lineData[435]++;
          node = node.parentNode;
        }
        _$jscoverage['/editor/selection.js'].lineData[437]++;
        if (visit698_437_1(node)) {
          _$jscoverage['/editor/selection.js'].lineData[438]++;
          node = new Node(node);
        }
      }
  }
  _$jscoverage['/editor/selection.js'].lineData[443]++;
  cache.startElement = node;
  _$jscoverage['/editor/selection.js'].lineData[444]++;
  return node;
}, 
  getSelectedElement: function() {
  _$jscoverage['/editor/selection.js'].functionData[11]++;
  _$jscoverage['/editor/selection.js'].lineData[458]++;
  var self = this, node, cache = self._.cache;
  _$jscoverage['/editor/selection.js'].lineData[462]++;
  if (visit699_462_1(cache.selectedElement !== undefined)) {
    _$jscoverage['/editor/selection.js'].lineData[463]++;
    return cache.selectedElement;
  }
  _$jscoverage['/editor/selection.js'].lineData[467]++;
  if (visit700_467_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[468]++;
    var range = self.getNative().createRange();
    _$jscoverage['/editor/selection.js'].lineData[469]++;
    node = visit701_469_1(range.item && range.item(0));
  }
  _$jscoverage['/editor/selection.js'].lineData[475]++;
  if (visit702_475_1(!node)) {
    _$jscoverage['/editor/selection.js'].lineData[476]++;
    node = (function() {
  _$jscoverage['/editor/selection.js'].functionData[12]++;
  _$jscoverage['/editor/selection.js'].lineData[477]++;
  var range = self.getRanges()[0], enclosed, selected;
  _$jscoverage['/editor/selection.js'].lineData[485]++;
  for (var i = 2; visit703_486_1(i && !(visit704_486_2((enclosed = range.getEnclosedNode()) && visit705_487_1((visit706_487_2(enclosed[0].nodeType === Dom.NodeType.ELEMENT_NODE)) && visit707_489_1(styleObjectElements[enclosed.nodeName()] && (selected = enclosed)))))); i--) {
    _$jscoverage['/editor/selection.js'].lineData[497]++;
    range.shrink(KER.SHRINK_ELEMENT);
  }
  _$jscoverage['/editor/selection.js'].lineData[500]++;
  return selected;
})();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[503]++;
    node = new Node(node);
  }
  _$jscoverage['/editor/selection.js'].lineData[506]++;
  cache.selectedElement = node;
  _$jscoverage['/editor/selection.js'].lineData[507]++;
  return node;
}, 
  reset: function() {
  _$jscoverage['/editor/selection.js'].functionData[13]++;
  _$jscoverage['/editor/selection.js'].lineData[512]++;
  this._.cache = {};
}, 
  selectElement: function(element) {
  _$jscoverage['/editor/selection.js'].functionData[14]++;
  _$jscoverage['/editor/selection.js'].lineData[516]++;
  var range, self = this, doc = self.document;
  _$jscoverage['/editor/selection.js'].lineData[519]++;
  if (visit708_519_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[523]++;
    try {
      _$jscoverage['/editor/selection.js'].lineData[525]++;
      range = doc.body.createControlRange();
      _$jscoverage['/editor/selection.js'].lineData[526]++;
      range.addElement(element[0]);
      _$jscoverage['/editor/selection.js'].lineData[527]++;
      range.select();
    }    catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[530]++;
  range = doc.body.createTextRange();
  _$jscoverage['/editor/selection.js'].lineData[531]++;
  range.moveToElementText(element[0]);
  _$jscoverage['/editor/selection.js'].lineData[532]++;
  range.select();
}
 finally     {
    }
    _$jscoverage['/editor/selection.js'].lineData[536]++;
    self.reset();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[539]++;
    range = doc.createRange();
    _$jscoverage['/editor/selection.js'].lineData[540]++;
    range.selectNode(element[0]);
    _$jscoverage['/editor/selection.js'].lineData[542]++;
    var sel = self.getNative();
    _$jscoverage['/editor/selection.js'].lineData[543]++;
    sel.removeAllRanges();
    _$jscoverage['/editor/selection.js'].lineData[544]++;
    sel.addRange(range);
    _$jscoverage['/editor/selection.js'].lineData[545]++;
    self.reset();
  }
}, 
  selectRanges: function(ranges) {
  _$jscoverage['/editor/selection.js'].functionData[15]++;
  _$jscoverage['/editor/selection.js'].lineData[550]++;
  var self = this;
  _$jscoverage['/editor/selection.js'].lineData[551]++;
  if (visit709_551_1(OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[552]++;
    if (visit710_552_1(ranges.length > 1)) {
      _$jscoverage['/editor/selection.js'].lineData[554]++;
      var last = ranges[ranges.length - 1];
      _$jscoverage['/editor/selection.js'].lineData[555]++;
      ranges[0].setEnd(last.endContainer, last.endOffset);
      _$jscoverage['/editor/selection.js'].lineData[556]++;
      ranges.length = 1;
    }
    _$jscoverage['/editor/selection.js'].lineData[561]++;
    if (visit711_561_1(ranges[0])) {
      _$jscoverage['/editor/selection.js'].lineData[562]++;
      ranges[0].select();
    }
    _$jscoverage['/editor/selection.js'].lineData[565]++;
    self.reset();
  } else {
    _$jscoverage['/editor/selection.js'].lineData[568]++;
    var sel = self.getNative();
    _$jscoverage['/editor/selection.js'].lineData[569]++;
    if (visit712_569_1(!sel)) {
      _$jscoverage['/editor/selection.js'].lineData[570]++;
      return;
    }
    _$jscoverage['/editor/selection.js'].lineData[572]++;
    sel.removeAllRanges();
    _$jscoverage['/editor/selection.js'].lineData[573]++;
    for (var i = 0; visit713_573_1(i < ranges.length); i++) {
      _$jscoverage['/editor/selection.js'].lineData[574]++;
      var range = ranges[i], nativeRange = self.document.createRange(), startContainer = range.startContainer;
      _$jscoverage['/editor/selection.js'].lineData[582]++;
      if (visit714_582_1(range.collapsed && visit715_583_1((visit716_583_2((visit717_583_3(UA.gecko && visit718_583_4(UA.gecko < 1.0900))) || visit719_583_5(UA.opera || UA.webkit))) && visit720_584_1(visit721_584_2(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && !startContainer[0].childNodes.length)))) {
        _$jscoverage['/editor/selection.js'].lineData[586]++;
        startContainer[0].appendChild(self.document.createTextNode(UA.webkit ? '\u200b' : ''));
        _$jscoverage['/editor/selection.js'].lineData[589]++;
        range.startOffset++;
        _$jscoverage['/editor/selection.js'].lineData[590]++;
        range.endOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[593]++;
      nativeRange.setStart(startContainer[0], range.startOffset);
      _$jscoverage['/editor/selection.js'].lineData[594]++;
      nativeRange.setEnd(range.endContainer[0], range.endOffset);
      _$jscoverage['/editor/selection.js'].lineData[596]++;
      sel.addRange(nativeRange);
    }
    _$jscoverage['/editor/selection.js'].lineData[598]++;
    self.reset();
  }
}, 
  createBookmarks2: function(normalized) {
  _$jscoverage['/editor/selection.js'].functionData[16]++;
  _$jscoverage['/editor/selection.js'].lineData[602]++;
  var bookmarks = [], ranges = this.getRanges();
  _$jscoverage['/editor/selection.js'].lineData[605]++;
  for (var i = 0; visit722_605_1(i < ranges.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[606]++;
    bookmarks.push(ranges[i].createBookmark2(normalized));
  }
  _$jscoverage['/editor/selection.js'].lineData[609]++;
  return bookmarks;
}, 
  createBookmarks: function(serializable, ranges) {
  _$jscoverage['/editor/selection.js'].functionData[17]++;
  _$jscoverage['/editor/selection.js'].lineData[612]++;
  var self = this, retval = [], doc = self.document, bookmark;
  _$jscoverage['/editor/selection.js'].lineData[616]++;
  ranges = visit723_616_1(ranges || self.getRanges());
  _$jscoverage['/editor/selection.js'].lineData[617]++;
  var length = ranges.length;
  _$jscoverage['/editor/selection.js'].lineData[618]++;
  for (var i = 0; visit724_618_1(i < length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[619]++;
    retval.push(bookmark = ranges[i].createBookmark(serializable, TRUE));
    _$jscoverage['/editor/selection.js'].lineData[620]++;
    serializable = bookmark.serializable;
    _$jscoverage['/editor/selection.js'].lineData[622]++;
    var bookmarkStart = serializable ? S.one('#' + bookmark.startNode, doc) : bookmark.startNode, bookmarkEnd = serializable ? S.one('#' + bookmark.endNode, doc) : bookmark.endNode;
    _$jscoverage['/editor/selection.js'].lineData[626]++;
    for (var j = i + 1; visit725_626_1(j < length); j++) {
      _$jscoverage['/editor/selection.js'].lineData[627]++;
      var dirtyRange = ranges[j], rangeStart = dirtyRange.startContainer, rangeEnd = dirtyRange.endContainer;
      _$jscoverage['/editor/selection.js'].lineData[631]++;
      if (visit726_631_1(Dom.equals(rangeStart, bookmarkStart.parent()))) {
        _$jscoverage['/editor/selection.js'].lineData[632]++;
        dirtyRange.startOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[634]++;
      if (visit727_634_1(Dom.equals(rangeStart, bookmarkEnd.parent()))) {
        _$jscoverage['/editor/selection.js'].lineData[635]++;
        dirtyRange.startOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[637]++;
      if (visit728_637_1(Dom.equals(rangeEnd, bookmarkStart.parent()))) {
        _$jscoverage['/editor/selection.js'].lineData[638]++;
        dirtyRange.endOffset++;
      }
      _$jscoverage['/editor/selection.js'].lineData[640]++;
      if (visit729_640_1(Dom.equals(rangeEnd, bookmarkEnd.parent()))) {
        _$jscoverage['/editor/selection.js'].lineData[641]++;
        dirtyRange.endOffset++;
      }
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[646]++;
  return retval;
}, 
  selectBookmarks: function(bookmarks) {
  _$jscoverage['/editor/selection.js'].functionData[18]++;
  _$jscoverage['/editor/selection.js'].lineData[650]++;
  var self = this, ranges = [];
  _$jscoverage['/editor/selection.js'].lineData[651]++;
  for (var i = 0; visit730_651_1(i < bookmarks.length); i++) {
    _$jscoverage['/editor/selection.js'].lineData[652]++;
    var range = new KERange(self.document);
    _$jscoverage['/editor/selection.js'].lineData[653]++;
    range.moveToBookmark(bookmarks[i]);
    _$jscoverage['/editor/selection.js'].lineData[654]++;
    ranges.push(range);
  }
  _$jscoverage['/editor/selection.js'].lineData[656]++;
  self.selectRanges(ranges);
  _$jscoverage['/editor/selection.js'].lineData[657]++;
  return self;
}, 
  getCommonAncestor: function() {
  _$jscoverage['/editor/selection.js'].functionData[19]++;
  _$jscoverage['/editor/selection.js'].lineData[661]++;
  var ranges = this.getRanges(), startNode = ranges[0].startContainer, endNode = ranges[ranges.length - 1].endContainer;
  _$jscoverage['/editor/selection.js'].lineData[664]++;
  return startNode._4eCommonAncestor(endNode);
}, 
  scrollIntoView: function() {
  _$jscoverage['/editor/selection.js'].functionData[20]++;
  _$jscoverage['/editor/selection.js'].lineData[671]++;
  var start = this.getStartElement();
  _$jscoverage['/editor/selection.js'].lineData[672]++;
  if (visit731_672_1(start)) {
    _$jscoverage['/editor/selection.js'].lineData[673]++;
    start.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
}, 
  removeAllRanges: function() {
  _$jscoverage['/editor/selection.js'].functionData[21]++;
  _$jscoverage['/editor/selection.js'].lineData[681]++;
  var sel = this.getNative();
  _$jscoverage['/editor/selection.js'].lineData[682]++;
  if (visit732_682_1(!OLD_IE)) {
    _$jscoverage['/editor/selection.js'].lineData[683]++;
    if (visit733_683_1(sel)) {
      _$jscoverage['/editor/selection.js'].lineData[684]++;
      sel.removeAllRanges();
    }
  } else {
    _$jscoverage['/editor/selection.js'].lineData[687]++;
    if (visit734_687_1(sel)) {
      _$jscoverage['/editor/selection.js'].lineData[688]++;
      sel.clear();
    }
  }
}});
  _$jscoverage['/editor/selection.js'].lineData[695]++;
  var nonCells = {
  'table': 1, 
  'tbody': 1, 
  'tr': 1}, notWhitespaces = Walker.whitespaces(TRUE), fillerTextRegex = /\ufeff|\u00a0/;
  _$jscoverage['/editor/selection.js'].lineData[697]++;
  KERange.prototype.select = !OLD_IE ? function() {
  _$jscoverage['/editor/selection.js'].functionData[22]++;
  _$jscoverage['/editor/selection.js'].lineData[699]++;
  var self = this, startContainer = self.startContainer;
  _$jscoverage['/editor/selection.js'].lineData[703]++;
  if (visit735_703_1(self.collapsed && visit736_704_1(visit737_704_2(startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && !startContainer[0].childNodes.length))) {
    _$jscoverage['/editor/selection.js'].lineData[705]++;
    startContainer[0].appendChild(self.document.createTextNode(UA.webkit ? '\u200b' : ''));
    _$jscoverage['/editor/selection.js'].lineData[709]++;
    self.startOffset++;
    _$jscoverage['/editor/selection.js'].lineData[710]++;
    self.endOffset++;
  }
  _$jscoverage['/editor/selection.js'].lineData[714]++;
  var nativeRange = self.document.createRange();
  _$jscoverage['/editor/selection.js'].lineData[715]++;
  nativeRange.setStart(startContainer[0], self.startOffset);
  _$jscoverage['/editor/selection.js'].lineData[717]++;
  try {
    _$jscoverage['/editor/selection.js'].lineData[718]++;
    nativeRange.setEnd(self.endContainer[0], self.endOffset);
  }  catch (e) {
  _$jscoverage['/editor/selection.js'].lineData[723]++;
  if (visit738_723_1(e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0)) {
    _$jscoverage['/editor/selection.js'].lineData[724]++;
    self.collapse(TRUE);
    _$jscoverage['/editor/selection.js'].lineData[725]++;
    nativeRange.setEnd(self.endContainer[0], self.endOffset);
  } else {
    _$jscoverage['/editor/selection.js'].lineData[728]++;
    throw (e);
  }
}
  _$jscoverage['/editor/selection.js'].lineData[732]++;
  var selection = getSelection(self.document).getNative();
  _$jscoverage['/editor/selection.js'].lineData[733]++;
  selection.removeAllRanges();
  _$jscoverage['/editor/selection.js'].lineData[734]++;
  selection.addRange(nativeRange);
} : function(forceExpand) {
  _$jscoverage['/editor/selection.js'].functionData[23]++;
  _$jscoverage['/editor/selection.js'].lineData[738]++;
  var self = this, collapsed = self.collapsed, isStartMarkerAlone, dummySpan;
  _$jscoverage['/editor/selection.js'].lineData[744]++;
  if (visit739_747_1(visit740_747_2(self.startContainer[0] === self.endContainer[0]) && visit741_747_3(self.endOffset - self.startOffset === 1))) {
    _$jscoverage['/editor/selection.js'].lineData[748]++;
    var selEl = self.startContainer[0].childNodes[self.startOffset];
    _$jscoverage['/editor/selection.js'].lineData[749]++;
    if (visit742_749_1(selEl.nodeType === Dom.NodeType.ELEMENT_NODE)) {
      _$jscoverage['/editor/selection.js'].lineData[750]++;
      new KESelection(self.document).selectElement(new Node(selEl));
      _$jscoverage['/editor/selection.js'].lineData[751]++;
      return;
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[756]++;
  if (visit743_756_1(visit744_756_2(visit745_756_3(self.startContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && self.startContainer.nodeName() in nonCells) || visit746_758_1(visit747_758_2(self.endContainer[0].nodeType === Dom.NodeType.ELEMENT_NODE) && self.endContainer.nodeName() in nonCells))) {
    _$jscoverage['/editor/selection.js'].lineData[760]++;
    self.shrink(KER.SHRINK_ELEMENT, TRUE);
  }
  _$jscoverage['/editor/selection.js'].lineData[763]++;
  var bookmark = self.createBookmark(), startNode = bookmark.startNode, endNode;
  _$jscoverage['/editor/selection.js'].lineData[767]++;
  if (visit748_767_1(!collapsed)) {
    _$jscoverage['/editor/selection.js'].lineData[768]++;
    endNode = bookmark.endNode;
  }
  _$jscoverage['/editor/selection.js'].lineData[772]++;
  var ieRange = self.document.body.createTextRange();
  _$jscoverage['/editor/selection.js'].lineData[775]++;
  ieRange.moveToElementText(startNode[0]);
  _$jscoverage['/editor/selection.js'].lineData[777]++;
  ieRange.moveStart('character', 1);
  _$jscoverage['/editor/selection.js'].lineData[779]++;
  if (visit749_779_1(endNode)) {
    _$jscoverage['/editor/selection.js'].lineData[781]++;
    var ieRangeEnd = self.document.body.createTextRange();
    _$jscoverage['/editor/selection.js'].lineData[783]++;
    ieRangeEnd.moveToElementText(endNode[0]);
    _$jscoverage['/editor/selection.js'].lineData[785]++;
    ieRange.setEndPoint('EndToEnd', ieRangeEnd);
    _$jscoverage['/editor/selection.js'].lineData[786]++;
    ieRange.moveEnd('character', -1);
  } else {
    _$jscoverage['/editor/selection.js'].lineData[793]++;
    var next = startNode[0].nextSibling;
    _$jscoverage['/editor/selection.js'].lineData[794]++;
    while (visit750_794_1(next && !notWhitespaces(next))) {
      _$jscoverage['/editor/selection.js'].lineData[795]++;
      next = next.nextSibling;
    }
    _$jscoverage['/editor/selection.js'].lineData[797]++;
    isStartMarkerAlone = (visit751_798_1(!(visit752_798_2(next && visit753_798_3(next.nodeValue && next.nodeValue.match(fillerTextRegex)))) && (visit754_800_1(forceExpand || visit755_800_2(!startNode[0].previousSibling || (visit756_802_1(startNode[0].previousSibling && visit757_803_1(Dom.nodeName(startNode[0].previousSibling) === 'br'))))))));
    _$jscoverage['/editor/selection.js'].lineData[813]++;
    dummySpan = new Node(self.document.createElement('span'));
    _$jscoverage['/editor/selection.js'].lineData[814]++;
    dummySpan.html('&#65279;');
    _$jscoverage['/editor/selection.js'].lineData[815]++;
    dummySpan.insertBefore(startNode);
    _$jscoverage['/editor/selection.js'].lineData[816]++;
    if (visit758_816_1(isStartMarkerAlone)) {
      _$jscoverage['/editor/selection.js'].lineData[821]++;
      Dom.insertBefore(self.document.createTextNode('\ufeff'), visit759_821_1(startNode[0] || startNode));
    }
  }
  _$jscoverage['/editor/selection.js'].lineData[826]++;
  self.setStartBefore(startNode);
  _$jscoverage['/editor/selection.js'].lineData[827]++;
  startNode._4eRemove();
  _$jscoverage['/editor/selection.js'].lineData[829]++;
  if (visit760_829_1(collapsed)) {
    _$jscoverage['/editor/selection.js'].lineData[830]++;
    if (visit761_830_1(isStartMarkerAlone)) {
      _$jscoverage['/editor/selection.js'].lineData[832]++;
      ieRange.moveStart('character', -1);
      _$jscoverage['/editor/selection.js'].lineData[833]++;
      ieRange.select();
      _$jscoverage['/editor/selection.js'].lineData[835]++;
      self.document.selection.clear();
    } else {
      _$jscoverage['/editor/selection.js'].lineData[837]++;
      ieRange.select();
    }
    _$jscoverage['/editor/selection.js'].lineData[839]++;
    if (visit762_839_1(dummySpan)) {
      _$jscoverage['/editor/selection.js'].lineData[840]++;
      self.moveToPosition(dummySpan, KER.POSITION_BEFORE_START);
      _$jscoverage['/editor/selection.js'].lineData[841]++;
      dummySpan._4eRemove();
    }
  } else {
    _$jscoverage['/editor/selection.js'].lineData[844]++;
    self.setEndBefore(endNode);
    _$jscoverage['/editor/selection.js'].lineData[845]++;
    endNode._4eRemove();
    _$jscoverage['/editor/selection.js'].lineData[846]++;
    ieRange.select();
  }
};
  _$jscoverage['/editor/selection.js'].lineData[851]++;
  function getSelection(doc) {
    _$jscoverage['/editor/selection.js'].functionData[24]++;
    _$jscoverage['/editor/selection.js'].lineData[852]++;
    var sel = new KESelection(doc);
    _$jscoverage['/editor/selection.js'].lineData[853]++;
    return (visit763_853_1(!sel || sel.isInvalid)) ? NULL : sel;
  }
  _$jscoverage['/editor/selection.js'].lineData[856]++;
  KESelection.getSelection = getSelection;
  _$jscoverage['/editor/selection.js'].lineData[858]++;
  Editor.Selection = KESelection;
  _$jscoverage['/editor/selection.js'].lineData[860]++;
  return KESelection;
});
