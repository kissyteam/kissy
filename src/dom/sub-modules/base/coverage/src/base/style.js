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
if (! _$jscoverage['/base/style.js']) {
  _$jscoverage['/base/style.js'] = {};
  _$jscoverage['/base/style.js'].lineData = [];
  _$jscoverage['/base/style.js'].lineData[6] = 0;
  _$jscoverage['/base/style.js'].lineData[7] = 0;
  _$jscoverage['/base/style.js'].lineData[8] = 0;
  _$jscoverage['/base/style.js'].lineData[9] = 0;
  _$jscoverage['/base/style.js'].lineData[45] = 0;
  _$jscoverage['/base/style.js'].lineData[47] = 0;
  _$jscoverage['/base/style.js'].lineData[48] = 0;
  _$jscoverage['/base/style.js'].lineData[49] = 0;
  _$jscoverage['/base/style.js'].lineData[51] = 0;
  _$jscoverage['/base/style.js'].lineData[52] = 0;
  _$jscoverage['/base/style.js'].lineData[55] = 0;
  _$jscoverage['/base/style.js'].lineData[56] = 0;
  _$jscoverage['/base/style.js'].lineData[59] = 0;
  _$jscoverage['/base/style.js'].lineData[60] = 0;
  _$jscoverage['/base/style.js'].lineData[61] = 0;
  _$jscoverage['/base/style.js'].lineData[63] = 0;
  _$jscoverage['/base/style.js'].lineData[64] = 0;
  _$jscoverage['/base/style.js'].lineData[65] = 0;
  _$jscoverage['/base/style.js'].lineData[67] = 0;
  _$jscoverage['/base/style.js'].lineData[69] = 0;
  _$jscoverage['/base/style.js'].lineData[72] = 0;
  _$jscoverage['/base/style.js'].lineData[84] = 0;
  _$jscoverage['/base/style.js'].lineData[91] = 0;
  _$jscoverage['/base/style.js'].lineData[94] = 0;
  _$jscoverage['/base/style.js'].lineData[95] = 0;
  _$jscoverage['/base/style.js'].lineData[99] = 0;
  _$jscoverage['/base/style.js'].lineData[100] = 0;
  _$jscoverage['/base/style.js'].lineData[104] = 0;
  _$jscoverage['/base/style.js'].lineData[105] = 0;
  _$jscoverage['/base/style.js'].lineData[106] = 0;
  _$jscoverage['/base/style.js'].lineData[107] = 0;
  _$jscoverage['/base/style.js'].lineData[108] = 0;
  _$jscoverage['/base/style.js'].lineData[110] = 0;
  _$jscoverage['/base/style.js'].lineData[111] = 0;
  _$jscoverage['/base/style.js'].lineData[113] = 0;
  _$jscoverage['/base/style.js'].lineData[114] = 0;
  _$jscoverage['/base/style.js'].lineData[115] = 0;
  _$jscoverage['/base/style.js'].lineData[118] = 0;
  _$jscoverage['/base/style.js'].lineData[131] = 0;
  _$jscoverage['/base/style.js'].lineData[136] = 0;
  _$jscoverage['/base/style.js'].lineData[137] = 0;
  _$jscoverage['/base/style.js'].lineData[138] = 0;
  _$jscoverage['/base/style.js'].lineData[139] = 0;
  _$jscoverage['/base/style.js'].lineData[142] = 0;
  _$jscoverage['/base/style.js'].lineData[144] = 0;
  _$jscoverage['/base/style.js'].lineData[145] = 0;
  _$jscoverage['/base/style.js'].lineData[146] = 0;
  _$jscoverage['/base/style.js'].lineData[147] = 0;
  _$jscoverage['/base/style.js'].lineData[149] = 0;
  _$jscoverage['/base/style.js'].lineData[151] = 0;
  _$jscoverage['/base/style.js'].lineData[152] = 0;
  _$jscoverage['/base/style.js'].lineData[155] = 0;
  _$jscoverage['/base/style.js'].lineData[168] = 0;
  _$jscoverage['/base/style.js'].lineData[175] = 0;
  _$jscoverage['/base/style.js'].lineData[176] = 0;
  _$jscoverage['/base/style.js'].lineData[177] = 0;
  _$jscoverage['/base/style.js'].lineData[178] = 0;
  _$jscoverage['/base/style.js'].lineData[181] = 0;
  _$jscoverage['/base/style.js'].lineData[184] = 0;
  _$jscoverage['/base/style.js'].lineData[185] = 0;
  _$jscoverage['/base/style.js'].lineData[187] = 0;
  _$jscoverage['/base/style.js'].lineData[189] = 0;
  _$jscoverage['/base/style.js'].lineData[190] = 0;
  _$jscoverage['/base/style.js'].lineData[192] = 0;
  _$jscoverage['/base/style.js'].lineData[195] = 0;
  _$jscoverage['/base/style.js'].lineData[198] = 0;
  _$jscoverage['/base/style.js'].lineData[200] = 0;
  _$jscoverage['/base/style.js'].lineData[201] = 0;
  _$jscoverage['/base/style.js'].lineData[204] = 0;
  _$jscoverage['/base/style.js'].lineData[212] = 0;
  _$jscoverage['/base/style.js'].lineData[216] = 0;
  _$jscoverage['/base/style.js'].lineData[217] = 0;
  _$jscoverage['/base/style.js'].lineData[218] = 0;
  _$jscoverage['/base/style.js'].lineData[220] = 0;
  _$jscoverage['/base/style.js'].lineData[221] = 0;
  _$jscoverage['/base/style.js'].lineData[222] = 0;
  _$jscoverage['/base/style.js'].lineData[223] = 0;
  _$jscoverage['/base/style.js'].lineData[224] = 0;
  _$jscoverage['/base/style.js'].lineData[234] = 0;
  _$jscoverage['/base/style.js'].lineData[236] = 0;
  _$jscoverage['/base/style.js'].lineData[237] = 0;
  _$jscoverage['/base/style.js'].lineData[238] = 0;
  _$jscoverage['/base/style.js'].lineData[240] = 0;
  _$jscoverage['/base/style.js'].lineData[241] = 0;
  _$jscoverage['/base/style.js'].lineData[242] = 0;
  _$jscoverage['/base/style.js'].lineData[244] = 0;
  _$jscoverage['/base/style.js'].lineData[254] = 0;
  _$jscoverage['/base/style.js'].lineData[256] = 0;
  _$jscoverage['/base/style.js'].lineData[257] = 0;
  _$jscoverage['/base/style.js'].lineData[258] = 0;
  _$jscoverage['/base/style.js'].lineData[259] = 0;
  _$jscoverage['/base/style.js'].lineData[261] = 0;
  _$jscoverage['/base/style.js'].lineData[275] = 0;
  _$jscoverage['/base/style.js'].lineData[276] = 0;
  _$jscoverage['/base/style.js'].lineData[277] = 0;
  _$jscoverage['/base/style.js'].lineData[279] = 0;
  _$jscoverage['/base/style.js'].lineData[282] = 0;
  _$jscoverage['/base/style.js'].lineData[285] = 0;
  _$jscoverage['/base/style.js'].lineData[286] = 0;
  _$jscoverage['/base/style.js'].lineData[290] = 0;
  _$jscoverage['/base/style.js'].lineData[291] = 0;
  _$jscoverage['/base/style.js'].lineData[294] = 0;
  _$jscoverage['/base/style.js'].lineData[297] = 0;
  _$jscoverage['/base/style.js'].lineData[299] = 0;
  _$jscoverage['/base/style.js'].lineData[300] = 0;
  _$jscoverage['/base/style.js'].lineData[302] = 0;
  _$jscoverage['/base/style.js'].lineData[311] = 0;
  _$jscoverage['/base/style.js'].lineData[319] = 0;
  _$jscoverage['/base/style.js'].lineData[320] = 0;
  _$jscoverage['/base/style.js'].lineData[321] = 0;
  _$jscoverage['/base/style.js'].lineData[322] = 0;
  _$jscoverage['/base/style.js'].lineData[323] = 0;
  _$jscoverage['/base/style.js'].lineData[324] = 0;
  _$jscoverage['/base/style.js'].lineData[325] = 0;
  _$jscoverage['/base/style.js'].lineData[326] = 0;
  _$jscoverage['/base/style.js'].lineData[327] = 0;
  _$jscoverage['/base/style.js'].lineData[332] = 0;
  _$jscoverage['/base/style.js'].lineData[333] = 0;
  _$jscoverage['/base/style.js'].lineData[334] = 0;
  _$jscoverage['/base/style.js'].lineData[392] = 0;
  _$jscoverage['/base/style.js'].lineData[393] = 0;
  _$jscoverage['/base/style.js'].lineData[394] = 0;
  _$jscoverage['/base/style.js'].lineData[395] = 0;
  _$jscoverage['/base/style.js'].lineData[398] = 0;
  _$jscoverage['/base/style.js'].lineData[399] = 0;
  _$jscoverage['/base/style.js'].lineData[400] = 0;
  _$jscoverage['/base/style.js'].lineData[402] = 0;
  _$jscoverage['/base/style.js'].lineData[404] = 0;
  _$jscoverage['/base/style.js'].lineData[405] = 0;
  _$jscoverage['/base/style.js'].lineData[406] = 0;
  _$jscoverage['/base/style.js'].lineData[407] = 0;
  _$jscoverage['/base/style.js'].lineData[408] = 0;
  _$jscoverage['/base/style.js'].lineData[409] = 0;
  _$jscoverage['/base/style.js'].lineData[410] = 0;
  _$jscoverage['/base/style.js'].lineData[411] = 0;
  _$jscoverage['/base/style.js'].lineData[413] = 0;
  _$jscoverage['/base/style.js'].lineData[415] = 0;
  _$jscoverage['/base/style.js'].lineData[417] = 0;
  _$jscoverage['/base/style.js'].lineData[423] = 0;
  _$jscoverage['/base/style.js'].lineData[428] = 0;
  _$jscoverage['/base/style.js'].lineData[429] = 0;
  _$jscoverage['/base/style.js'].lineData[430] = 0;
  _$jscoverage['/base/style.js'].lineData[432] = 0;
  _$jscoverage['/base/style.js'].lineData[437] = 0;
  _$jscoverage['/base/style.js'].lineData[439] = 0;
  _$jscoverage['/base/style.js'].lineData[440] = 0;
  _$jscoverage['/base/style.js'].lineData[442] = 0;
  _$jscoverage['/base/style.js'].lineData[445] = 0;
  _$jscoverage['/base/style.js'].lineData[446] = 0;
  _$jscoverage['/base/style.js'].lineData[447] = 0;
  _$jscoverage['/base/style.js'].lineData[448] = 0;
  _$jscoverage['/base/style.js'].lineData[450] = 0;
  _$jscoverage['/base/style.js'].lineData[451] = 0;
  _$jscoverage['/base/style.js'].lineData[452] = 0;
  _$jscoverage['/base/style.js'].lineData[453] = 0;
  _$jscoverage['/base/style.js'].lineData[456] = 0;
  _$jscoverage['/base/style.js'].lineData[457] = 0;
  _$jscoverage['/base/style.js'].lineData[460] = 0;
  _$jscoverage['/base/style.js'].lineData[465] = 0;
  _$jscoverage['/base/style.js'].lineData[466] = 0;
  _$jscoverage['/base/style.js'].lineData[471] = 0;
  _$jscoverage['/base/style.js'].lineData[472] = 0;
  _$jscoverage['/base/style.js'].lineData[473] = 0;
  _$jscoverage['/base/style.js'].lineData[476] = 0;
  _$jscoverage['/base/style.js'].lineData[479] = 0;
  _$jscoverage['/base/style.js'].lineData[480] = 0;
  _$jscoverage['/base/style.js'].lineData[484] = 0;
  _$jscoverage['/base/style.js'].lineData[485] = 0;
  _$jscoverage['/base/style.js'].lineData[488] = 0;
  _$jscoverage['/base/style.js'].lineData[490] = 0;
  _$jscoverage['/base/style.js'].lineData[492] = 0;
  _$jscoverage['/base/style.js'].lineData[493] = 0;
  _$jscoverage['/base/style.js'].lineData[494] = 0;
  _$jscoverage['/base/style.js'].lineData[496] = 0;
  _$jscoverage['/base/style.js'].lineData[498] = 0;
  _$jscoverage['/base/style.js'].lineData[499] = 0;
  _$jscoverage['/base/style.js'].lineData[500] = 0;
  _$jscoverage['/base/style.js'].lineData[502] = 0;
  _$jscoverage['/base/style.js'].lineData[504] = 0;
  _$jscoverage['/base/style.js'].lineData[505] = 0;
  _$jscoverage['/base/style.js'].lineData[507] = 0;
  _$jscoverage['/base/style.js'].lineData[509] = 0;
  _$jscoverage['/base/style.js'].lineData[511] = 0;
  _$jscoverage['/base/style.js'].lineData[513] = 0;
  _$jscoverage['/base/style.js'].lineData[516] = 0;
  _$jscoverage['/base/style.js'].lineData[517] = 0;
  _$jscoverage['/base/style.js'].lineData[520] = 0;
  _$jscoverage['/base/style.js'].lineData[523] = 0;
  _$jscoverage['/base/style.js'].lineData[524] = 0;
  _$jscoverage['/base/style.js'].lineData[526] = 0;
  _$jscoverage['/base/style.js'].lineData[528] = 0;
  _$jscoverage['/base/style.js'].lineData[531] = 0;
  _$jscoverage['/base/style.js'].lineData[534] = 0;
  _$jscoverage['/base/style.js'].lineData[536] = 0;
  _$jscoverage['/base/style.js'].lineData[541] = 0;
  _$jscoverage['/base/style.js'].lineData[542] = 0;
  _$jscoverage['/base/style.js'].lineData[545] = 0;
  _$jscoverage['/base/style.js'].lineData[546] = 0;
  _$jscoverage['/base/style.js'].lineData[548] = 0;
  _$jscoverage['/base/style.js'].lineData[549] = 0;
  _$jscoverage['/base/style.js'].lineData[552] = 0;
  _$jscoverage['/base/style.js'].lineData[555] = 0;
  _$jscoverage['/base/style.js'].lineData[556] = 0;
  _$jscoverage['/base/style.js'].lineData[557] = 0;
  _$jscoverage['/base/style.js'].lineData[558] = 0;
  _$jscoverage['/base/style.js'].lineData[559] = 0;
  _$jscoverage['/base/style.js'].lineData[560] = 0;
  _$jscoverage['/base/style.js'].lineData[561] = 0;
  _$jscoverage['/base/style.js'].lineData[562] = 0;
  _$jscoverage['/base/style.js'].lineData[563] = 0;
  _$jscoverage['/base/style.js'].lineData[565] = 0;
  _$jscoverage['/base/style.js'].lineData[567] = 0;
  _$jscoverage['/base/style.js'].lineData[571] = 0;
  _$jscoverage['/base/style.js'].lineData[574] = 0;
  _$jscoverage['/base/style.js'].lineData[575] = 0;
  _$jscoverage['/base/style.js'].lineData[578] = 0;
  _$jscoverage['/base/style.js'].lineData[579] = 0;
  _$jscoverage['/base/style.js'].lineData[581] = 0;
  _$jscoverage['/base/style.js'].lineData[583] = 0;
  _$jscoverage['/base/style.js'].lineData[585] = 0;
  _$jscoverage['/base/style.js'].lineData[596] = 0;
  _$jscoverage['/base/style.js'].lineData[597] = 0;
  _$jscoverage['/base/style.js'].lineData[598] = 0;
  _$jscoverage['/base/style.js'].lineData[599] = 0;
  _$jscoverage['/base/style.js'].lineData[600] = 0;
  _$jscoverage['/base/style.js'].lineData[602] = 0;
  _$jscoverage['/base/style.js'].lineData[604] = 0;
  _$jscoverage['/base/style.js'].lineData[605] = 0;
  _$jscoverage['/base/style.js'].lineData[606] = 0;
  _$jscoverage['/base/style.js'].lineData[607] = 0;
  _$jscoverage['/base/style.js'].lineData[608] = 0;
  _$jscoverage['/base/style.js'].lineData[610] = 0;
  _$jscoverage['/base/style.js'].lineData[611] = 0;
  _$jscoverage['/base/style.js'].lineData[612] = 0;
  _$jscoverage['/base/style.js'].lineData[615] = 0;
  _$jscoverage['/base/style.js'].lineData[617] = 0;
  _$jscoverage['/base/style.js'].lineData[618] = 0;
  _$jscoverage['/base/style.js'].lineData[620] = 0;
  _$jscoverage['/base/style.js'].lineData[621] = 0;
  _$jscoverage['/base/style.js'].lineData[622] = 0;
  _$jscoverage['/base/style.js'].lineData[623] = 0;
  _$jscoverage['/base/style.js'].lineData[624] = 0;
  _$jscoverage['/base/style.js'].lineData[627] = 0;
  _$jscoverage['/base/style.js'].lineData[629] = 0;
  _$jscoverage['/base/style.js'].lineData[630] = 0;
  _$jscoverage['/base/style.js'].lineData[635] = 0;
  _$jscoverage['/base/style.js'].lineData[640] = 0;
  _$jscoverage['/base/style.js'].lineData[642] = 0;
  _$jscoverage['/base/style.js'].lineData[643] = 0;
  _$jscoverage['/base/style.js'].lineData[647] = 0;
  _$jscoverage['/base/style.js'].lineData[648] = 0;
  _$jscoverage['/base/style.js'].lineData[653] = 0;
  _$jscoverage['/base/style.js'].lineData[654] = 0;
  _$jscoverage['/base/style.js'].lineData[655] = 0;
  _$jscoverage['/base/style.js'].lineData[656] = 0;
  _$jscoverage['/base/style.js'].lineData[657] = 0;
  _$jscoverage['/base/style.js'].lineData[660] = 0;
  _$jscoverage['/base/style.js'].lineData[661] = 0;
  _$jscoverage['/base/style.js'].lineData[665] = 0;
  _$jscoverage['/base/style.js'].lineData[671] = 0;
  _$jscoverage['/base/style.js'].lineData[672] = 0;
  _$jscoverage['/base/style.js'].lineData[673] = 0;
  _$jscoverage['/base/style.js'].lineData[675] = 0;
  _$jscoverage['/base/style.js'].lineData[677] = 0;
  _$jscoverage['/base/style.js'].lineData[680] = 0;
}
if (! _$jscoverage['/base/style.js'].functionData) {
  _$jscoverage['/base/style.js'].functionData = [];
  _$jscoverage['/base/style.js'].functionData[0] = 0;
  _$jscoverage['/base/style.js'].functionData[1] = 0;
  _$jscoverage['/base/style.js'].functionData[2] = 0;
  _$jscoverage['/base/style.js'].functionData[3] = 0;
  _$jscoverage['/base/style.js'].functionData[4] = 0;
  _$jscoverage['/base/style.js'].functionData[5] = 0;
  _$jscoverage['/base/style.js'].functionData[6] = 0;
  _$jscoverage['/base/style.js'].functionData[7] = 0;
  _$jscoverage['/base/style.js'].functionData[8] = 0;
  _$jscoverage['/base/style.js'].functionData[9] = 0;
  _$jscoverage['/base/style.js'].functionData[10] = 0;
  _$jscoverage['/base/style.js'].functionData[11] = 0;
  _$jscoverage['/base/style.js'].functionData[12] = 0;
  _$jscoverage['/base/style.js'].functionData[13] = 0;
  _$jscoverage['/base/style.js'].functionData[14] = 0;
  _$jscoverage['/base/style.js'].functionData[15] = 0;
  _$jscoverage['/base/style.js'].functionData[16] = 0;
  _$jscoverage['/base/style.js'].functionData[17] = 0;
  _$jscoverage['/base/style.js'].functionData[18] = 0;
  _$jscoverage['/base/style.js'].functionData[19] = 0;
  _$jscoverage['/base/style.js'].functionData[20] = 0;
  _$jscoverage['/base/style.js'].functionData[21] = 0;
  _$jscoverage['/base/style.js'].functionData[22] = 0;
  _$jscoverage['/base/style.js'].functionData[23] = 0;
  _$jscoverage['/base/style.js'].functionData[24] = 0;
  _$jscoverage['/base/style.js'].functionData[25] = 0;
  _$jscoverage['/base/style.js'].functionData[26] = 0;
  _$jscoverage['/base/style.js'].functionData[27] = 0;
  _$jscoverage['/base/style.js'].functionData[28] = 0;
}
if (! _$jscoverage['/base/style.js'].branchData) {
  _$jscoverage['/base/style.js'].branchData = {};
  _$jscoverage['/base/style.js'].branchData['18'] = [];
  _$jscoverage['/base/style.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['42'] = [];
  _$jscoverage['/base/style.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['48'] = [];
  _$jscoverage['/base/style.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['52'] = [];
  _$jscoverage['/base/style.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['59'] = [];
  _$jscoverage['/base/style.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['60'] = [];
  _$jscoverage['/base/style.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['94'] = [];
  _$jscoverage['/base/style.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['95'] = [];
  _$jscoverage['/base/style.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['99'] = [];
  _$jscoverage['/base/style.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['104'] = [];
  _$jscoverage['/base/style.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['136'] = [];
  _$jscoverage['/base/style.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['138'] = [];
  _$jscoverage['/base/style.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['144'] = [];
  _$jscoverage['/base/style.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['146'] = [];
  _$jscoverage['/base/style.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['151'] = [];
  _$jscoverage['/base/style.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['175'] = [];
  _$jscoverage['/base/style.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['177'] = [];
  _$jscoverage['/base/style.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['187'] = [];
  _$jscoverage['/base/style.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['190'] = [];
  _$jscoverage['/base/style.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['192'] = [];
  _$jscoverage['/base/style.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['192'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['192'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['193'] = [];
  _$jscoverage['/base/style.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['198'] = [];
  _$jscoverage['/base/style.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['200'] = [];
  _$jscoverage['/base/style.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['216'] = [];
  _$jscoverage['/base/style.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['218'] = [];
  _$jscoverage['/base/style.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['220'] = [];
  _$jscoverage['/base/style.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['236'] = [];
  _$jscoverage['/base/style.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['240'] = [];
  _$jscoverage['/base/style.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['241'] = [];
  _$jscoverage['/base/style.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['256'] = [];
  _$jscoverage['/base/style.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['258'] = [];
  _$jscoverage['/base/style.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['275'] = [];
  _$jscoverage['/base/style.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['285'] = [];
  _$jscoverage['/base/style.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['290'] = [];
  _$jscoverage['/base/style.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['299'] = [];
  _$jscoverage['/base/style.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['319'] = [];
  _$jscoverage['/base/style.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['326'] = [];
  _$jscoverage['/base/style.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['333'] = [];
  _$jscoverage['/base/style.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['395'] = [];
  _$jscoverage['/base/style.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['400'] = [];
  _$jscoverage['/base/style.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['402'] = [];
  _$jscoverage['/base/style.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['406'] = [];
  _$jscoverage['/base/style.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['407'] = [];
  _$jscoverage['/base/style.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['410'] = [];
  _$jscoverage['/base/style.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['417'] = [];
  _$jscoverage['/base/style.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['429'] = [];
  _$jscoverage['/base/style.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['445'] = [];
  _$jscoverage['/base/style.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['447'] = [];
  _$jscoverage['/base/style.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['451'] = [];
  _$jscoverage['/base/style.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['452'] = [];
  _$jscoverage['/base/style.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['452'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['456'] = [];
  _$jscoverage['/base/style.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['488'] = [];
  _$jscoverage['/base/style.js'].branchData['488'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['488'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['489'] = [];
  _$jscoverage['/base/style.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['489'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['496'] = [];
  _$jscoverage['/base/style.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['498'] = [];
  _$jscoverage['/base/style.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['498'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['498'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['500'] = [];
  _$jscoverage['/base/style.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['504'] = [];
  _$jscoverage['/base/style.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['507'] = [];
  _$jscoverage['/base/style.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['516'] = [];
  _$jscoverage['/base/style.js'].branchData['516'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['516'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['520'] = [];
  _$jscoverage['/base/style.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['523'] = [];
  _$jscoverage['/base/style.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['531'] = [];
  _$jscoverage['/base/style.js'].branchData['531'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['531'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['531'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['532'] = [];
  _$jscoverage['/base/style.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['536'] = [];
  _$jscoverage['/base/style.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['545'] = [];
  _$jscoverage['/base/style.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['557'] = [];
  _$jscoverage['/base/style.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['559'] = [];
  _$jscoverage['/base/style.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['560'] = [];
  _$jscoverage['/base/style.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['562'] = [];
  _$jscoverage['/base/style.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['567'] = [];
  _$jscoverage['/base/style.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['575'] = [];
  _$jscoverage['/base/style.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['581'] = [];
  _$jscoverage['/base/style.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['597'] = [];
  _$jscoverage['/base/style.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['598'] = [];
  _$jscoverage['/base/style.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['599'] = [];
  _$jscoverage['/base/style.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['600'] = [];
  _$jscoverage['/base/style.js'].branchData['600'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['602'] = [];
  _$jscoverage['/base/style.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['603'] = [];
  _$jscoverage['/base/style.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['607'] = [];
  _$jscoverage['/base/style.js'].branchData['607'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['607'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['607'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['611'] = [];
  _$jscoverage['/base/style.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['611'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['611'][3] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['612'] = [];
  _$jscoverage['/base/style.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['615'] = [];
  _$jscoverage['/base/style.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['617'] = [];
  _$jscoverage['/base/style.js'].branchData['617'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['620'] = [];
  _$jscoverage['/base/style.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['620'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['621'] = [];
  _$jscoverage['/base/style.js'].branchData['621'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['622'] = [];
  _$jscoverage['/base/style.js'].branchData['622'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['623'] = [];
  _$jscoverage['/base/style.js'].branchData['623'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['629'] = [];
  _$jscoverage['/base/style.js'].branchData['629'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['630'] = [];
  _$jscoverage['/base/style.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['631'] = [];
  _$jscoverage['/base/style.js'].branchData['631'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['647'] = [];
  _$jscoverage['/base/style.js'].branchData['647'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['656'] = [];
  _$jscoverage['/base/style.js'].branchData['656'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['657'] = [];
  _$jscoverage['/base/style.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['660'] = [];
  _$jscoverage['/base/style.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['661'] = [];
  _$jscoverage['/base/style.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['672'] = [];
  _$jscoverage['/base/style.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['672'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['673'] = [];
  _$jscoverage['/base/style.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['673'][2] = new BranchData();
  _$jscoverage['/base/style.js'].branchData['674'] = [];
  _$jscoverage['/base/style.js'].branchData['674'][1] = new BranchData();
}
_$jscoverage['/base/style.js'].branchData['674'][1].init(53, 46, 'Dom.css(offsetParent, \'position\') === \'static\'');
function visit520_674_1(result) {
  _$jscoverage['/base/style.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['673'][2].init(112, 100, '!ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit519_673_2(result) {
  _$jscoverage['/base/style.js'].branchData['673'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['673'][1].init(96, 116, 'offsetParent && !ROOT_REG.test(offsetParent.nodeName) && Dom.css(offsetParent, \'position\') === \'static\'');
function visit518_673_1(result) {
  _$jscoverage['/base/style.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['672'][2].init(49, 23, 'el.ownerDocument || doc');
function visit517_672_2(result) {
  _$jscoverage['/base/style.js'].branchData['672'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['672'][1].init(29, 49, 'el.offsetParent || (el.ownerDocument || doc).body');
function visit516_672_1(result) {
  _$jscoverage['/base/style.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['661'][1].init(825, 42, 'parseFloat(Dom.css(el, \'marginLeft\')) || 0');
function visit515_661_1(result) {
  _$jscoverage['/base/style.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['660'][1].init(758, 41, 'parseFloat(Dom.css(el, \'marginTop\')) || 0');
function visit514_660_1(result) {
  _$jscoverage['/base/style.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['657'][1].init(446, 57, 'parseFloat(Dom.css(offsetParent, \'borderLeftWidth\')) || 0');
function visit513_657_1(result) {
  _$jscoverage['/base/style.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['656'][1].init(354, 56, 'parseFloat(Dom.css(offsetParent, \'borderTopWidth\')) || 0');
function visit512_656_1(result) {
  _$jscoverage['/base/style.js'].branchData['656'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['647'][1].init(111, 35, 'Dom.css(el, \'position\') === \'fixed\'');
function visit511_647_1(result) {
  _$jscoverage['/base/style.js'].branchData['647'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['631'][1].init(46, 23, 'extra === PADDING_INDEX');
function visit510_631_1(result) {
  _$jscoverage['/base/style.js'].branchData['631'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['630'][1].init(28, 22, 'extra === BORDER_INDEX');
function visit509_630_1(result) {
  _$jscoverage['/base/style.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['629'][1].init(1630, 27, 'borderBoxValueOrIsBorderBox');
function visit508_629_1(result) {
  _$jscoverage['/base/style.js'].branchData['629'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['623'][1].init(18, 27, 'borderBoxValueOrIsBorderBox');
function visit507_623_1(result) {
  _$jscoverage['/base/style.js'].branchData['623'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['622'][1].init(1345, 23, 'extra === CONTENT_INDEX');
function visit506_622_1(result) {
  _$jscoverage['/base/style.js'].branchData['622'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['621'][1].init(1301, 29, 'borderBoxValue || cssBoxValue');
function visit505_621_1(result) {
  _$jscoverage['/base/style.js'].branchData['621'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['620'][2].init(1237, 28, 'borderBoxValue !== undefined');
function visit504_620_2(result) {
  _$jscoverage['/base/style.js'].branchData['620'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['620'][1].init(1237, 43, 'borderBoxValue !== undefined || isBorderBox');
function visit503_620_1(result) {
  _$jscoverage['/base/style.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['617'][1].init(1095, 19, 'extra === undefined');
function visit502_617_1(result) {
  _$jscoverage['/base/style.js'].branchData['617'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['615'][1].init(416, 28, 'parseFloat(cssBoxValue) || 0');
function visit501_615_1(result) {
  _$jscoverage['/base/style.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['612'][1].init(32, 23, 'elem.style[name] || 0');
function visit500_612_1(result) {
  _$jscoverage['/base/style.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['611'][3].init(232, 24, '(Number(cssBoxValue)) < 0');
function visit499_611_3(result) {
  _$jscoverage['/base/style.js'].branchData['611'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['611'][2].init(208, 19, 'cssBoxValue == null');
function visit498_611_2(result) {
  _$jscoverage['/base/style.js'].branchData['611'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['611'][1].init(208, 48, 'cssBoxValue == null || (Number(cssBoxValue)) < 0');
function visit497_611_1(result) {
  _$jscoverage['/base/style.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['607'][3].init(603, 19, 'borderBoxValue <= 0');
function visit496_607_3(result) {
  _$jscoverage['/base/style.js'].branchData['607'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['607'][2].init(577, 22, 'borderBoxValue == null');
function visit495_607_2(result) {
  _$jscoverage['/base/style.js'].branchData['607'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['607'][1].init(577, 45, 'borderBoxValue == null || borderBoxValue <= 0');
function visit494_607_1(result) {
  _$jscoverage['/base/style.js'].branchData['607'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['603'][1].init(97, 14, 'name === WIDTH');
function visit493_603_1(result) {
  _$jscoverage['/base/style.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['602'][1].init(277, 14, 'name === WIDTH');
function visit492_602_1(result) {
  _$jscoverage['/base/style.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['600'][1].init(21, 14, 'name === WIDTH');
function visit491_600_1(result) {
  _$jscoverage['/base/style.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['599'][1].init(144, 19, 'elem.nodeType === 9');
function visit490_599_1(result) {
  _$jscoverage['/base/style.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['598'][1].init(21, 14, 'name === WIDTH');
function visit489_598_1(result) {
  _$jscoverage['/base/style.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['597'][1].init(14, 16, 'S.isWindow(elem)');
function visit488_597_1(result) {
  _$jscoverage['/base/style.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['581'][1].init(81, 15, 'doc.defaultView');
function visit487_581_1(result) {
  _$jscoverage['/base/style.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['575'][1].init(17, 72, 'Dom._getComputedStyle(elem, \'boxSizing\', computedStyle) === \'border-box\'');
function visit486_575_1(result) {
  _$jscoverage['/base/style.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['567'][1].init(278, 68, 'parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0');
function visit485_567_1(result) {
  _$jscoverage['/base/style.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['562'][1].init(60, 17, 'prop === \'border\'');
function visit484_562_1(result) {
  _$jscoverage['/base/style.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['560'][1].init(30, 16, 'i < which.length');
function visit483_560_1(result) {
  _$jscoverage['/base/style.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['559'][1].init(48, 4, 'prop');
function visit482_559_1(result) {
  _$jscoverage['/base/style.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['557'][1].init(58, 16, 'j < props.length');
function visit481_557_1(result) {
  _$jscoverage['/base/style.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['545'][1].init(128, 22, 'elem.offsetWidth !== 0');
function visit480_545_1(result) {
  _$jscoverage['/base/style.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['536'][1].init(333, 17, 'ret === undefined');
function visit479_536_1(result) {
  _$jscoverage['/base/style.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['532'][1].init(34, 42, '(ret = hook.get(elem, false)) !== undefined');
function visit478_532_1(result) {
  _$jscoverage['/base/style.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['531'][3].init(105, 77, '\'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit477_531_3(result) {
  _$jscoverage['/base/style.js'].branchData['531'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['531'][2].init(97, 85, 'hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined');
function visit476_531_2(result) {
  _$jscoverage['/base/style.js'].branchData['531'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['531'][1].init(95, 88, '!(hook && \'get\' in hook && (ret = hook.get(elem, false)) !== undefined)');
function visit475_531_1(result) {
  _$jscoverage['/base/style.js'].branchData['531'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['523'][1].init(140, 9, 'UA.webkit');
function visit474_523_1(result) {
  _$jscoverage['/base/style.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['520'][1].init(873, 16, '!elStyle.cssText');
function visit473_520_1(result) {
  _$jscoverage['/base/style.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['516'][2].init(310, 13, 'val === EMPTY');
function visit472_516_2(result) {
  _$jscoverage['/base/style.js'].branchData['516'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['516'][1].init(310, 40, 'val === EMPTY && elStyle.removeAttribute');
function visit471_516_1(result) {
  _$jscoverage['/base/style.js'].branchData['516'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['507'][1].init(396, 17, 'val !== undefined');
function visit470_507_1(result) {
  _$jscoverage['/base/style.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['504'][1].init(300, 16, 'hook && hook.set');
function visit469_504_1(result) {
  _$jscoverage['/base/style.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['500'][1].init(138, 39, '!isNaN(Number(val)) && !cssNumber[name]');
function visit468_500_1(result) {
  _$jscoverage['/base/style.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['498'][3].init(66, 13, 'val === EMPTY');
function visit467_498_3(result) {
  _$jscoverage['/base/style.js'].branchData['498'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['498'][2].init(50, 12, 'val === null');
function visit466_498_2(result) {
  _$jscoverage['/base/style.js'].branchData['498'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['498'][1].init(50, 29, 'val === null || val === EMPTY');
function visit465_498_1(result) {
  _$jscoverage['/base/style.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['496'][1].init(342, 17, 'val !== undefined');
function visit464_496_1(result) {
  _$jscoverage['/base/style.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['489'][2].init(111, 19, 'elem.nodeType === 8');
function visit463_489_2(result) {
  _$jscoverage['/base/style.js'].branchData['489'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['489'][1].init(35, 46, 'elem.nodeType === 8 || !(elStyle = elem.style)');
function visit462_489_1(result) {
  _$jscoverage['/base/style.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['488'][2].init(73, 19, 'elem.nodeType === 3');
function visit461_488_2(result) {
  _$jscoverage['/base/style.js'].branchData['488'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['488'][1].init(73, 82, 'elem.nodeType === 3 || elem.nodeType === 8 || !(elStyle = elem.style)');
function visit460_488_1(result) {
  _$jscoverage['/base/style.js'].branchData['488'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['456'][1].init(512, 37, 'isAutoPosition || NO_PX_REG.test(val)');
function visit459_456_1(result) {
  _$jscoverage['/base/style.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['452'][2].init(328, 23, 'position === \'relative\'');
function visit458_452_2(result) {
  _$jscoverage['/base/style.js'].branchData['452'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['452'][1].init(310, 41, 'isAutoPosition && position === \'relative\'');
function visit457_452_1(result) {
  _$jscoverage['/base/style.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['451'][1].init(269, 14, 'val === \'auto\'');
function visit456_451_1(result) {
  _$jscoverage['/base/style.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['447'][1].init(83, 21, 'position === \'static\'');
function visit455_447_1(result) {
  _$jscoverage['/base/style.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['445'][1].init(116, 8, 'computed');
function visit454_445_1(result) {
  _$jscoverage['/base/style.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['429'][1].init(48, 8, 'computed');
function visit453_429_1(result) {
  _$jscoverage['/base/style.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['417'][1].init(553, 53, 'elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX)');
function visit452_417_1(result) {
  _$jscoverage['/base/style.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['410'][1].init(166, 11, 'isBorderBox');
function visit451_410_1(result) {
  _$jscoverage['/base/style.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['407'][1].init(22, 4, 'elem');
function visit450_407_1(result) {
  _$jscoverage['/base/style.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['406'][1].init(61, 17, 'val !== undefined');
function visit449_406_1(result) {
  _$jscoverage['/base/style.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['402'][1].init(445, 14, 'name === WIDTH');
function visit448_402_1(result) {
  _$jscoverage['/base/style.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['400'][1].init(62, 79, 'el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX)');
function visit447_400_1(result) {
  _$jscoverage['/base/style.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['395'][1].init(62, 49, 'el && getWHIgnoreDisplay(el, name, PADDING_INDEX)');
function visit446_395_1(result) {
  _$jscoverage['/base/style.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['333'][1].init(95, 6, 'j >= 0');
function visit445_333_1(result) {
  _$jscoverage['/base/style.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['326'][1].init(30, 36, '!S.inArray(getNodeName(e), excludes)');
function visit444_326_1(result) {
  _$jscoverage['/base/style.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['319'][1].init(281, 6, 'j >= 0');
function visit443_319_1(result) {
  _$jscoverage['/base/style.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['299'][1].init(769, 15, 'elem.styleSheet');
function visit442_299_1(result) {
  _$jscoverage['/base/style.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['290'][1].init(505, 4, 'elem');
function visit441_290_1(result) {
  _$jscoverage['/base/style.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['285'][1].init(340, 35, 'id && (id = id.replace(\'#\', EMPTY))');
function visit440_285_1(result) {
  _$jscoverage['/base/style.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['275'][1].init(22, 26, 'typeof refWin === \'string\'');
function visit439_275_1(result) {
  _$jscoverage['/base/style.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['258'][1].init(62, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit438_258_1(result) {
  _$jscoverage['/base/style.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['256'][1].init(121, 6, 'i >= 0');
function visit437_256_1(result) {
  _$jscoverage['/base/style.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['241'][1].init(30, 3, 'old');
function visit436_241_1(result) {
  _$jscoverage['/base/style.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['240'][1].init(154, 12, 'old !== NONE');
function visit435_240_1(result) {
  _$jscoverage['/base/style.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['236'][1].init(121, 6, 'i >= 0');
function visit434_236_1(result) {
  _$jscoverage['/base/style.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['220'][1].init(205, 31, 'Dom.css(elem, DISPLAY) === NONE');
function visit433_220_1(result) {
  _$jscoverage['/base/style.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['218'][1].init(80, 36, 'Dom.data(elem, OLD_DISPLAY) || EMPTY');
function visit432_218_1(result) {
  _$jscoverage['/base/style.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['216'][1].init(177, 6, 'i >= 0');
function visit431_216_1(result) {
  _$jscoverage['/base/style.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['200'][1].init(47, 6, 'i >= 0');
function visit430_200_1(result) {
  _$jscoverage['/base/style.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['198'][1].init(493, 26, 'typeof ret === \'undefined\'');
function visit429_198_1(result) {
  _$jscoverage['/base/style.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['193'][1].init(46, 41, '(ret = hook.get(elem, true)) !== undefined');
function visit428_193_1(result) {
  _$jscoverage['/base/style.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['192'][3].init(125, 88, '\'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit427_192_3(result) {
  _$jscoverage['/base/style.js'].branchData['192'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['192'][2].init(117, 96, 'hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined');
function visit426_192_2(result) {
  _$jscoverage['/base/style.js'].branchData['192'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['192'][1].init(115, 99, '!(hook && \'get\' in hook && (ret = hook.get(elem, true)) !== undefined)');
function visit425_192_1(result) {
  _$jscoverage['/base/style.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['190'][1].init(117, 4, 'elem');
function visit424_190_1(result) {
  _$jscoverage['/base/style.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['187'][1].init(665, 17, 'val === undefined');
function visit423_187_1(result) {
  _$jscoverage['/base/style.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['177'][1].init(51, 6, 'i >= 0');
function visit422_177_1(result) {
  _$jscoverage['/base/style.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['175'][1].init(241, 21, 'S.isPlainObject(name)');
function visit421_175_1(result) {
  _$jscoverage['/base/style.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['151'][1].init(47, 6, 'i >= 0');
function visit420_151_1(result) {
  _$jscoverage['/base/style.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['146'][1].init(57, 4, 'elem');
function visit419_146_1(result) {
  _$jscoverage['/base/style.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['144'][1].init(507, 17, 'val === undefined');
function visit418_144_1(result) {
  _$jscoverage['/base/style.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['138'][1].init(51, 6, 'i >= 0');
function visit417_138_1(result) {
  _$jscoverage['/base/style.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['136'][1].init(193, 21, 'S.isPlainObject(name)');
function visit416_136_1(result) {
  _$jscoverage['/base/style.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['104'][1].init(779, 51, 'Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)');
function visit415_104_1(result) {
  _$jscoverage['/base/style.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['99'][2].init(591, 10, 'val === \'\'');
function visit414_99_2(result) {
  _$jscoverage['/base/style.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['99'][1].init(591, 36, 'val === \'\' && !Dom.contains(d, elem)');
function visit413_99_1(result) {
  _$jscoverage['/base/style.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['95'][1].init(28, 59, 'computedStyle.getPropertyValue(name) || computedStyle[name]');
function visit412_95_1(result) {
  _$jscoverage['/base/style.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['94'][1].init(355, 59, 'computedStyle || d.defaultView.getComputedStyle(elem, null)');
function visit411_94_1(result) {
  _$jscoverage['/base/style.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['60'][1].init(21, 31, 'doc.body || doc.documentElement');
function visit410_60_1(result) {
  _$jscoverage['/base/style.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['59'][1].init(105, 26, '!defaultDisplay[tagName]');
function visit409_59_1(result) {
  _$jscoverage['/base/style.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['52'][2].init(141, 29, 'vendor && vendor.propertyName');
function visit408_52_2(result) {
  _$jscoverage['/base/style.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['52'][1].init(141, 37, 'vendor && vendor.propertyName || name');
function visit407_52_1(result) {
  _$jscoverage['/base/style.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['48'][1].init(14, 14, 'cssProps[name]');
function visit406_48_1(result) {
  _$jscoverage['/base/style.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['42'][1].init(1048, 57, 'userSelectVendorInfo && userSelectVendorInfo.propertyName');
function visit405_42_1(result) {
  _$jscoverage['/base/style.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].branchData['18'][1].init(333, 27, 'globalWindow.document || {}');
function visit404_18_1(result) {
  _$jscoverage['/base/style.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/style.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/style.js'].functionData[0]++;
  _$jscoverage['/base/style.js'].lineData[7]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/style.js'].lineData[8]++;
  var Dom = require('./api');
  _$jscoverage['/base/style.js'].lineData[9]++;
  var globalWindow = S.Env.host, getCssVendorInfo = S.Feature.getCssVendorInfo, UA = require('ua'), BOX_MODELS = ['margin', 'border', 'padding'], CONTENT_INDEX = -1, PADDING_INDEX = 2, BORDER_INDEX = 1, MARGIN_INDEX = 0, getNodeName = Dom.nodeName, doc = visit404_18_1(globalWindow.document || {}), RE_MARGIN = /^margin/, WIDTH = 'width', HEIGHT = 'height', DISPLAY = 'display', OLD_DISPLAY = DISPLAY + S.now(), NONE = 'none', cssNumber = {
  fillOpacity: 1, 
  fontWeight: 1, 
  lineHeight: 1, 
  opacity: 1, 
  orphans: 1, 
  widows: 1, 
  zIndex: 1, 
  zoom: 1}, EMPTY = '', DEFAULT_UNIT = 'px', NO_PX_REG = /\d(?!px)[a-z%]+$/i, cssHooks = {}, cssProps = {}, defaultDisplay = {}, userSelectVendorInfo = getCssVendorInfo('userSelect'), userSelectProperty = visit405_42_1(userSelectVendorInfo && userSelectVendorInfo.propertyName), camelCase = S.camelCase;
  _$jscoverage['/base/style.js'].lineData[45]++;
  cssProps['float'] = 'cssFloat';
  _$jscoverage['/base/style.js'].lineData[47]++;
  function normalizeCssPropName(name) {
    _$jscoverage['/base/style.js'].functionData[1]++;
    _$jscoverage['/base/style.js'].lineData[48]++;
    if (visit406_48_1(cssProps[name])) {
      _$jscoverage['/base/style.js'].lineData[49]++;
      return cssProps[name];
    }
    _$jscoverage['/base/style.js'].lineData[51]++;
    var vendor = getCssVendorInfo(name);
    _$jscoverage['/base/style.js'].lineData[52]++;
    return visit407_52_1(visit408_52_2(vendor && vendor.propertyName) || name);
  }
  _$jscoverage['/base/style.js'].lineData[55]++;
  function getDefaultDisplay(tagName) {
    _$jscoverage['/base/style.js'].functionData[2]++;
    _$jscoverage['/base/style.js'].lineData[56]++;
    var body, oldDisplay = defaultDisplay[tagName], elem;
    _$jscoverage['/base/style.js'].lineData[59]++;
    if (visit409_59_1(!defaultDisplay[tagName])) {
      _$jscoverage['/base/style.js'].lineData[60]++;
      body = visit410_60_1(doc.body || doc.documentElement);
      _$jscoverage['/base/style.js'].lineData[61]++;
      elem = doc.createElement(tagName);
      _$jscoverage['/base/style.js'].lineData[63]++;
      Dom.prepend(elem, body);
      _$jscoverage['/base/style.js'].lineData[64]++;
      oldDisplay = Dom.css(elem, 'display');
      _$jscoverage['/base/style.js'].lineData[65]++;
      body.removeChild(elem);
      _$jscoverage['/base/style.js'].lineData[67]++;
      defaultDisplay[tagName] = oldDisplay;
    }
    _$jscoverage['/base/style.js'].lineData[69]++;
    return oldDisplay;
  }
  _$jscoverage['/base/style.js'].lineData[72]++;
  S.mix(Dom, {
  _cssHooks: cssHooks, 
  _cssProps: cssProps, 
  _getComputedStyle: function(elem, name, computedStyle) {
  _$jscoverage['/base/style.js'].functionData[3]++;
  _$jscoverage['/base/style.js'].lineData[84]++;
  var val = '', width, minWidth, maxWidth, style, d = elem.ownerDocument;
  _$jscoverage['/base/style.js'].lineData[91]++;
  name = normalizeCssPropName(name);
  _$jscoverage['/base/style.js'].lineData[94]++;
  if ((computedStyle = (visit411_94_1(computedStyle || d.defaultView.getComputedStyle(elem, null))))) {
    _$jscoverage['/base/style.js'].lineData[95]++;
    val = visit412_95_1(computedStyle.getPropertyValue(name) || computedStyle[name]);
  }
  _$jscoverage['/base/style.js'].lineData[99]++;
  if (visit413_99_1(visit414_99_2(val === '') && !Dom.contains(d, elem))) {
    _$jscoverage['/base/style.js'].lineData[100]++;
    val = elem.style[name];
  }
  _$jscoverage['/base/style.js'].lineData[104]++;
  if (visit415_104_1(Dom._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name))) {
    _$jscoverage['/base/style.js'].lineData[105]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[106]++;
    width = style.width;
    _$jscoverage['/base/style.js'].lineData[107]++;
    minWidth = style.minWidth;
    _$jscoverage['/base/style.js'].lineData[108]++;
    maxWidth = style.maxWidth;
    _$jscoverage['/base/style.js'].lineData[110]++;
    style.minWidth = style.maxWidth = style.width = val;
    _$jscoverage['/base/style.js'].lineData[111]++;
    val = computedStyle.width;
    _$jscoverage['/base/style.js'].lineData[113]++;
    style.width = width;
    _$jscoverage['/base/style.js'].lineData[114]++;
    style.minWidth = minWidth;
    _$jscoverage['/base/style.js'].lineData[115]++;
    style.maxWidth = maxWidth;
  }
  _$jscoverage['/base/style.js'].lineData[118]++;
  return val;
}, 
  style: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[4]++;
  _$jscoverage['/base/style.js'].lineData[131]++;
  var els = Dom.query(selector), k, ret, elem = els[0], i;
  _$jscoverage['/base/style.js'].lineData[136]++;
  if (visit416_136_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[137]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[138]++;
      for (i = els.length - 1; visit417_138_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[139]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[142]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[144]++;
  if (visit418_144_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[145]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[146]++;
    if (visit419_146_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[147]++;
      ret = style(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[149]++;
    return ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[151]++;
    for (i = els.length - 1; visit420_151_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[152]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[155]++;
  return undefined;
}, 
  css: function(selector, name, val) {
  _$jscoverage['/base/style.js'].functionData[5]++;
  _$jscoverage['/base/style.js'].lineData[168]++;
  var els = Dom.query(selector), elem = els[0], k, hook, ret, i;
  _$jscoverage['/base/style.js'].lineData[175]++;
  if (visit421_175_1(S.isPlainObject(name))) {
    _$jscoverage['/base/style.js'].lineData[176]++;
    for (k in name) {
      _$jscoverage['/base/style.js'].lineData[177]++;
      for (i = els.length - 1; visit422_177_1(i >= 0); i--) {
        _$jscoverage['/base/style.js'].lineData[178]++;
        style(els[i], k, name[k]);
      }
    }
    _$jscoverage['/base/style.js'].lineData[181]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[184]++;
  name = camelCase(name);
  _$jscoverage['/base/style.js'].lineData[185]++;
  hook = cssHooks[name];
  _$jscoverage['/base/style.js'].lineData[187]++;
  if (visit423_187_1(val === undefined)) {
    _$jscoverage['/base/style.js'].lineData[189]++;
    ret = '';
    _$jscoverage['/base/style.js'].lineData[190]++;
    if (visit424_190_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[192]++;
      if (visit425_192_1(!(visit426_192_2(hook && visit427_192_3('get' in hook && visit428_193_1((ret = hook.get(elem, true)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[195]++;
        ret = Dom._getComputedStyle(elem, name);
      }
    }
    _$jscoverage['/base/style.js'].lineData[198]++;
    return (visit429_198_1(typeof ret === 'undefined')) ? '' : ret;
  } else {
    _$jscoverage['/base/style.js'].lineData[200]++;
    for (i = els.length - 1; visit430_200_1(i >= 0); i--) {
      _$jscoverage['/base/style.js'].lineData[201]++;
      style(els[i], name, val);
    }
  }
  _$jscoverage['/base/style.js'].lineData[204]++;
  return undefined;
}, 
  show: function(selector) {
  _$jscoverage['/base/style.js'].functionData[6]++;
  _$jscoverage['/base/style.js'].lineData[212]++;
  var els = Dom.query(selector), tagName, old, elem, i;
  _$jscoverage['/base/style.js'].lineData[216]++;
  for (i = els.length - 1; visit431_216_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[217]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[218]++;
    elem.style[DISPLAY] = visit432_218_1(Dom.data(elem, OLD_DISPLAY) || EMPTY);
    _$jscoverage['/base/style.js'].lineData[220]++;
    if (visit433_220_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[221]++;
      tagName = elem.tagName.toLowerCase();
      _$jscoverage['/base/style.js'].lineData[222]++;
      old = getDefaultDisplay(tagName);
      _$jscoverage['/base/style.js'].lineData[223]++;
      Dom.data(elem, OLD_DISPLAY, old);
      _$jscoverage['/base/style.js'].lineData[224]++;
      elem.style[DISPLAY] = old;
    }
  }
}, 
  hide: function(selector) {
  _$jscoverage['/base/style.js'].functionData[7]++;
  _$jscoverage['/base/style.js'].lineData[234]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[236]++;
  for (i = els.length - 1; visit434_236_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[237]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[238]++;
    var style = elem.style, old = style[DISPLAY];
    _$jscoverage['/base/style.js'].lineData[240]++;
    if (visit435_240_1(old !== NONE)) {
      _$jscoverage['/base/style.js'].lineData[241]++;
      if (visit436_241_1(old)) {
        _$jscoverage['/base/style.js'].lineData[242]++;
        Dom.data(elem, OLD_DISPLAY, old);
      }
      _$jscoverage['/base/style.js'].lineData[244]++;
      style[DISPLAY] = NONE;
    }
  }
}, 
  toggle: function(selector) {
  _$jscoverage['/base/style.js'].functionData[8]++;
  _$jscoverage['/base/style.js'].lineData[254]++;
  var els = Dom.query(selector), elem, i;
  _$jscoverage['/base/style.js'].lineData[256]++;
  for (i = els.length - 1; visit437_256_1(i >= 0); i--) {
    _$jscoverage['/base/style.js'].lineData[257]++;
    elem = els[i];
    _$jscoverage['/base/style.js'].lineData[258]++;
    if (visit438_258_1(Dom.css(elem, DISPLAY) === NONE)) {
      _$jscoverage['/base/style.js'].lineData[259]++;
      Dom.show(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[261]++;
      Dom.hide(elem);
    }
  }
}, 
  addStyleSheet: function(refWin, cssText, id) {
  _$jscoverage['/base/style.js'].functionData[9]++;
  _$jscoverage['/base/style.js'].lineData[275]++;
  if (visit439_275_1(typeof refWin === 'string')) {
    _$jscoverage['/base/style.js'].lineData[276]++;
    id = cssText;
    _$jscoverage['/base/style.js'].lineData[277]++;
    cssText = refWin;
    _$jscoverage['/base/style.js'].lineData[279]++;
    refWin = globalWindow;
  }
  _$jscoverage['/base/style.js'].lineData[282]++;
  var doc = Dom.getDocument(refWin), elem;
  _$jscoverage['/base/style.js'].lineData[285]++;
  if (visit440_285_1(id && (id = id.replace('#', EMPTY)))) {
    _$jscoverage['/base/style.js'].lineData[286]++;
    elem = Dom.get('#' + id, doc);
  }
  _$jscoverage['/base/style.js'].lineData[290]++;
  if (visit441_290_1(elem)) {
    _$jscoverage['/base/style.js'].lineData[291]++;
    return;
  }
  _$jscoverage['/base/style.js'].lineData[294]++;
  elem = Dom.create('<style>', {
  id: id}, doc);
  _$jscoverage['/base/style.js'].lineData[297]++;
  Dom.get('head', doc).appendChild(elem);
  _$jscoverage['/base/style.js'].lineData[299]++;
  if (visit442_299_1(elem.styleSheet)) {
    _$jscoverage['/base/style.js'].lineData[300]++;
    elem.styleSheet.cssText = cssText;
  } else {
    _$jscoverage['/base/style.js'].lineData[302]++;
    elem.appendChild(doc.createTextNode(cssText));
  }
}, 
  unselectable: userSelectProperty ? function(selector) {
  _$jscoverage['/base/style.js'].functionData[10]++;
  _$jscoverage['/base/style.js'].lineData[311]++;
  var _els = Dom.query(selector), elem, j, e, i = 0, excludes, style, els;
  _$jscoverage['/base/style.js'].lineData[319]++;
  for (j = _els.length - 1; visit443_319_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[320]++;
    elem = _els[j];
    _$jscoverage['/base/style.js'].lineData[321]++;
    style = elem.style;
    _$jscoverage['/base/style.js'].lineData[322]++;
    els = elem.getElementsByTagName('*');
    _$jscoverage['/base/style.js'].lineData[323]++;
    elem.setAttribute('unselectable', 'on');
    _$jscoverage['/base/style.js'].lineData[324]++;
    excludes = ['iframe', 'textarea', 'input', 'select'];
    _$jscoverage['/base/style.js'].lineData[325]++;
    while ((e = els[i++])) {
      _$jscoverage['/base/style.js'].lineData[326]++;
      if (visit444_326_1(!S.inArray(getNodeName(e), excludes))) {
        _$jscoverage['/base/style.js'].lineData[327]++;
        e.setAttribute('unselectable', 'on');
      }
    }
  }
} : function(selector) {
  _$jscoverage['/base/style.js'].functionData[11]++;
  _$jscoverage['/base/style.js'].lineData[332]++;
  var els = Dom.query(selector);
  _$jscoverage['/base/style.js'].lineData[333]++;
  for (var j = els.length - 1; visit445_333_1(j >= 0); j--) {
    _$jscoverage['/base/style.js'].lineData[334]++;
    els[j].style[userSelectProperty] = 'none';
  }
}, 
  innerWidth: 0, 
  innerHeight: 0, 
  outerWidth: 0, 
  outerHeight: 0, 
  width: 0, 
  height: 0});
  _$jscoverage['/base/style.js'].lineData[392]++;
  S.each([WIDTH, HEIGHT], function(name) {
  _$jscoverage['/base/style.js'].functionData[12]++;
  _$jscoverage['/base/style.js'].lineData[393]++;
  Dom['inner' + S.ucfirst(name)] = function(selector) {
  _$jscoverage['/base/style.js'].functionData[13]++;
  _$jscoverage['/base/style.js'].lineData[394]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[395]++;
  return visit446_395_1(el && getWHIgnoreDisplay(el, name, PADDING_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[398]++;
  Dom['outer' + S.ucfirst(name)] = function(selector, includeMargin) {
  _$jscoverage['/base/style.js'].functionData[14]++;
  _$jscoverage['/base/style.js'].lineData[399]++;
  var el = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[400]++;
  return visit447_400_1(el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[402]++;
  var which = visit448_402_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'];
  _$jscoverage['/base/style.js'].lineData[404]++;
  Dom[name] = function(selector, val) {
  _$jscoverage['/base/style.js'].functionData[15]++;
  _$jscoverage['/base/style.js'].lineData[405]++;
  var elem = Dom.get(selector);
  _$jscoverage['/base/style.js'].lineData[406]++;
  if (visit449_406_1(val !== undefined)) {
    _$jscoverage['/base/style.js'].lineData[407]++;
    if (visit450_407_1(elem)) {
      _$jscoverage['/base/style.js'].lineData[408]++;
      var computedStyle = getComputedStyle(elem);
      _$jscoverage['/base/style.js'].lineData[409]++;
      var isBorderBox = isBorderBoxFn(elem, computedStyle);
      _$jscoverage['/base/style.js'].lineData[410]++;
      if (visit451_410_1(isBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[411]++;
        val += getPBMWidth(elem, ['padding', 'border'], which, computedStyle);
      }
      _$jscoverage['/base/style.js'].lineData[413]++;
      return Dom.css(elem, name, val);
    }
    _$jscoverage['/base/style.js'].lineData[415]++;
    return undefined;
  }
  _$jscoverage['/base/style.js'].lineData[417]++;
  return visit452_417_1(elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX));
};
  _$jscoverage['/base/style.js'].lineData[423]++;
  cssHooks[name] = {
  get: function(elem, computed) {
  _$jscoverage['/base/style.js'].functionData[16]++;
  _$jscoverage['/base/style.js'].lineData[428]++;
  var val;
  _$jscoverage['/base/style.js'].lineData[429]++;
  if (visit453_429_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[430]++;
    val = getWHIgnoreDisplay(elem, name) + 'px';
  }
  _$jscoverage['/base/style.js'].lineData[432]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[437]++;
  var cssShow = {
  position: 'absolute', 
  visibility: 'hidden', 
  display: 'block'};
  _$jscoverage['/base/style.js'].lineData[439]++;
  S.each(['left', 'top'], function(name) {
  _$jscoverage['/base/style.js'].functionData[17]++;
  _$jscoverage['/base/style.js'].lineData[440]++;
  cssHooks[name] = {
  get: function(el, computed) {
  _$jscoverage['/base/style.js'].functionData[18]++;
  _$jscoverage['/base/style.js'].lineData[442]++;
  var val, isAutoPosition, position;
  _$jscoverage['/base/style.js'].lineData[445]++;
  if (visit454_445_1(computed)) {
    _$jscoverage['/base/style.js'].lineData[446]++;
    position = Dom.css(el, 'position');
    _$jscoverage['/base/style.js'].lineData[447]++;
    if (visit455_447_1(position === 'static')) {
      _$jscoverage['/base/style.js'].lineData[448]++;
      return 'auto';
    }
    _$jscoverage['/base/style.js'].lineData[450]++;
    val = Dom._getComputedStyle(el, name);
    _$jscoverage['/base/style.js'].lineData[451]++;
    isAutoPosition = visit456_451_1(val === 'auto');
    _$jscoverage['/base/style.js'].lineData[452]++;
    if (visit457_452_1(isAutoPosition && visit458_452_2(position === 'relative'))) {
      _$jscoverage['/base/style.js'].lineData[453]++;
      return '0px';
    }
    _$jscoverage['/base/style.js'].lineData[456]++;
    if (visit459_456_1(isAutoPosition || NO_PX_REG.test(val))) {
      _$jscoverage['/base/style.js'].lineData[457]++;
      val = getPosition(el)[name] + 'px';
    }
  }
  _$jscoverage['/base/style.js'].lineData[460]++;
  return val;
}};
});
  _$jscoverage['/base/style.js'].lineData[465]++;
  function swap(elem, options, callback) {
    _$jscoverage['/base/style.js'].functionData[19]++;
    _$jscoverage['/base/style.js'].lineData[466]++;
    var old = {}, style = elem.style, name;
    _$jscoverage['/base/style.js'].lineData[471]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[472]++;
      old[name] = style[name];
      _$jscoverage['/base/style.js'].lineData[473]++;
      style[name] = options[name];
    }
    _$jscoverage['/base/style.js'].lineData[476]++;
    callback.call(elem);
    _$jscoverage['/base/style.js'].lineData[479]++;
    for (name in options) {
      _$jscoverage['/base/style.js'].lineData[480]++;
      style[name] = old[name];
    }
  }
  _$jscoverage['/base/style.js'].lineData[484]++;
  function style(elem, name, val) {
    _$jscoverage['/base/style.js'].functionData[20]++;
    _$jscoverage['/base/style.js'].lineData[485]++;
    var elStyle, ret, hook;
    _$jscoverage['/base/style.js'].lineData[488]++;
    if (visit460_488_1(visit461_488_2(elem.nodeType === 3) || visit462_489_1(visit463_489_2(elem.nodeType === 8) || !(elStyle = elem.style)))) {
      _$jscoverage['/base/style.js'].lineData[490]++;
      return undefined;
    }
    _$jscoverage['/base/style.js'].lineData[492]++;
    name = camelCase(name);
    _$jscoverage['/base/style.js'].lineData[493]++;
    hook = cssHooks[name];
    _$jscoverage['/base/style.js'].lineData[494]++;
    name = normalizeCssPropName(name);
    _$jscoverage['/base/style.js'].lineData[496]++;
    if (visit464_496_1(val !== undefined)) {
      _$jscoverage['/base/style.js'].lineData[498]++;
      if (visit465_498_1(visit466_498_2(val === null) || visit467_498_3(val === EMPTY))) {
        _$jscoverage['/base/style.js'].lineData[499]++;
        val = EMPTY;
      } else {
        _$jscoverage['/base/style.js'].lineData[500]++;
        if (visit468_500_1(!isNaN(Number(val)) && !cssNumber[name])) {
          _$jscoverage['/base/style.js'].lineData[502]++;
          val += DEFAULT_UNIT;
        }
      }
      _$jscoverage['/base/style.js'].lineData[504]++;
      if (visit469_504_1(hook && hook.set)) {
        _$jscoverage['/base/style.js'].lineData[505]++;
        val = hook.set(elem, val);
      }
      _$jscoverage['/base/style.js'].lineData[507]++;
      if (visit470_507_1(val !== undefined)) {
        _$jscoverage['/base/style.js'].lineData[509]++;
        try {
          _$jscoverage['/base/style.js'].lineData[511]++;
          elStyle[name] = val;
        }        catch (e) {
  _$jscoverage['/base/style.js'].lineData[513]++;
  logger.warn('css set error:' + e);
}
        _$jscoverage['/base/style.js'].lineData[516]++;
        if (visit471_516_1(visit472_516_2(val === EMPTY) && elStyle.removeAttribute)) {
          _$jscoverage['/base/style.js'].lineData[517]++;
          elStyle.removeAttribute(name);
        }
      }
      _$jscoverage['/base/style.js'].lineData[520]++;
      if (visit473_520_1(!elStyle.cssText)) {
        _$jscoverage['/base/style.js'].lineData[523]++;
        if (visit474_523_1(UA.webkit)) {
          _$jscoverage['/base/style.js'].lineData[524]++;
          elStyle = elem.outerHTML;
        }
        _$jscoverage['/base/style.js'].lineData[526]++;
        elem.removeAttribute('style');
      }
      _$jscoverage['/base/style.js'].lineData[528]++;
      return undefined;
    } else {
      _$jscoverage['/base/style.js'].lineData[531]++;
      if (visit475_531_1(!(visit476_531_2(hook && visit477_531_3('get' in hook && visit478_532_1((ret = hook.get(elem, false)) !== undefined)))))) {
        _$jscoverage['/base/style.js'].lineData[534]++;
        ret = elStyle[name];
      }
      _$jscoverage['/base/style.js'].lineData[536]++;
      return visit479_536_1(ret === undefined) ? '' : ret;
    }
  }
  _$jscoverage['/base/style.js'].lineData[541]++;
  function getWHIgnoreDisplay(elem) {
    _$jscoverage['/base/style.js'].functionData[21]++;
    _$jscoverage['/base/style.js'].lineData[542]++;
    var val, args = arguments;
    _$jscoverage['/base/style.js'].lineData[545]++;
    if (visit480_545_1(elem.offsetWidth !== 0)) {
      _$jscoverage['/base/style.js'].lineData[546]++;
      val = getWH.apply(undefined, args);
    } else {
      _$jscoverage['/base/style.js'].lineData[548]++;
      swap(elem, cssShow, function() {
  _$jscoverage['/base/style.js'].functionData[22]++;
  _$jscoverage['/base/style.js'].lineData[549]++;
  val = getWH.apply(undefined, args);
});
    }
    _$jscoverage['/base/style.js'].lineData[552]++;
    return val;
  }
  _$jscoverage['/base/style.js'].lineData[555]++;
  function getPBMWidth(elem, props, which, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[23]++;
    _$jscoverage['/base/style.js'].lineData[556]++;
    var value = 0, prop, j, i;
    _$jscoverage['/base/style.js'].lineData[557]++;
    for (j = 0; visit481_557_1(j < props.length); j++) {
      _$jscoverage['/base/style.js'].lineData[558]++;
      prop = props[j];
      _$jscoverage['/base/style.js'].lineData[559]++;
      if (visit482_559_1(prop)) {
        _$jscoverage['/base/style.js'].lineData[560]++;
        for (i = 0; visit483_560_1(i < which.length); i++) {
          _$jscoverage['/base/style.js'].lineData[561]++;
          var cssProp;
          _$jscoverage['/base/style.js'].lineData[562]++;
          if (visit484_562_1(prop === 'border')) {
            _$jscoverage['/base/style.js'].lineData[563]++;
            cssProp = prop + which[i] + 'Width';
          } else {
            _$jscoverage['/base/style.js'].lineData[565]++;
            cssProp = prop + which[i];
          }
          _$jscoverage['/base/style.js'].lineData[567]++;
          value += visit485_567_1(parseFloat(Dom._getComputedStyle(elem, cssProp, computedStyle)) || 0);
        }
      }
    }
    _$jscoverage['/base/style.js'].lineData[571]++;
    return value;
  }
  _$jscoverage['/base/style.js'].lineData[574]++;
  function isBorderBoxFn(elem, computedStyle) {
    _$jscoverage['/base/style.js'].functionData[24]++;
    _$jscoverage['/base/style.js'].lineData[575]++;
    return visit486_575_1(Dom._getComputedStyle(elem, 'boxSizing', computedStyle) === 'border-box');
  }
  _$jscoverage['/base/style.js'].lineData[578]++;
  function getComputedStyle(elem) {
    _$jscoverage['/base/style.js'].functionData[25]++;
    _$jscoverage['/base/style.js'].lineData[579]++;
    var doc = elem.ownerDocument, computedStyle;
    _$jscoverage['/base/style.js'].lineData[581]++;
    if (visit487_581_1(doc.defaultView)) {
      _$jscoverage['/base/style.js'].lineData[583]++;
      computedStyle = doc.defaultView.getComputedStyle(elem, null);
    }
    _$jscoverage['/base/style.js'].lineData[585]++;
    return computedStyle;
  }
  _$jscoverage['/base/style.js'].lineData[596]++;
  function getWH(elem, name, extra) {
    _$jscoverage['/base/style.js'].functionData[26]++;
    _$jscoverage['/base/style.js'].lineData[597]++;
    if (visit488_597_1(S.isWindow(elem))) {
      _$jscoverage['/base/style.js'].lineData[598]++;
      return visit489_598_1(name === WIDTH) ? Dom.viewportWidth(elem) : Dom.viewportHeight(elem);
    } else {
      _$jscoverage['/base/style.js'].lineData[599]++;
      if (visit490_599_1(elem.nodeType === 9)) {
        _$jscoverage['/base/style.js'].lineData[600]++;
        return visit491_600_1(name === WIDTH) ? Dom.docWidth(elem) : Dom.docHeight(elem);
      }
    }
    _$jscoverage['/base/style.js'].lineData[602]++;
    var which = visit492_602_1(name === WIDTH) ? ['Left', 'Right'] : ['Top', 'Bottom'], borderBoxValue = visit493_603_1(name === WIDTH) ? elem.offsetWidth : elem.offsetHeight;
    _$jscoverage['/base/style.js'].lineData[604]++;
    var computedStyle = getComputedStyle(elem);
    _$jscoverage['/base/style.js'].lineData[605]++;
    var isBorderBox = isBorderBoxFn(elem, computedStyle);
    _$jscoverage['/base/style.js'].lineData[606]++;
    var cssBoxValue = 0;
    _$jscoverage['/base/style.js'].lineData[607]++;
    if (visit494_607_1(visit495_607_2(borderBoxValue == null) || visit496_607_3(borderBoxValue <= 0))) {
      _$jscoverage['/base/style.js'].lineData[608]++;
      borderBoxValue = undefined;
      _$jscoverage['/base/style.js'].lineData[610]++;
      cssBoxValue = Dom._getComputedStyle(elem, name, computedStyle);
      _$jscoverage['/base/style.js'].lineData[611]++;
      if (visit497_611_1(visit498_611_2(cssBoxValue == null) || visit499_611_3((Number(cssBoxValue)) < 0))) {
        _$jscoverage['/base/style.js'].lineData[612]++;
        cssBoxValue = visit500_612_1(elem.style[name] || 0);
      }
      _$jscoverage['/base/style.js'].lineData[615]++;
      cssBoxValue = visit501_615_1(parseFloat(cssBoxValue) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[617]++;
    if (visit502_617_1(extra === undefined)) {
      _$jscoverage['/base/style.js'].lineData[618]++;
      extra = isBorderBox ? BORDER_INDEX : CONTENT_INDEX;
    }
    _$jscoverage['/base/style.js'].lineData[620]++;
    var borderBoxValueOrIsBorderBox = visit503_620_1(visit504_620_2(borderBoxValue !== undefined) || isBorderBox);
    _$jscoverage['/base/style.js'].lineData[621]++;
    var val = visit505_621_1(borderBoxValue || cssBoxValue);
    _$jscoverage['/base/style.js'].lineData[622]++;
    if (visit506_622_1(extra === CONTENT_INDEX)) {
      _$jscoverage['/base/style.js'].lineData[623]++;
      if (visit507_623_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[624]++;
        return val - getPBMWidth(elem, ['border', 'padding'], which, computedStyle);
      } else {
        _$jscoverage['/base/style.js'].lineData[627]++;
        return cssBoxValue;
      }
    } else {
      _$jscoverage['/base/style.js'].lineData[629]++;
      if (visit508_629_1(borderBoxValueOrIsBorderBox)) {
        _$jscoverage['/base/style.js'].lineData[630]++;
        return val + (visit509_630_1(extra === BORDER_INDEX) ? 0 : (visit510_631_1(extra === PADDING_INDEX) ? -getPBMWidth(elem, ['border'], which, computedStyle) : getPBMWidth(elem, ['margin'], which, computedStyle)));
      } else {
        _$jscoverage['/base/style.js'].lineData[635]++;
        return cssBoxValue + getPBMWidth(elem, BOX_MODELS.slice(extra), which, computedStyle);
      }
    }
  }
  _$jscoverage['/base/style.js'].lineData[640]++;
  var ROOT_REG = /^(?:body|html)$/i;
  _$jscoverage['/base/style.js'].lineData[642]++;
  function getPosition(el) {
    _$jscoverage['/base/style.js'].functionData[27]++;
    _$jscoverage['/base/style.js'].lineData[643]++;
    var offsetParent, offset, parentOffset = {
  top: 0, 
  left: 0};
    _$jscoverage['/base/style.js'].lineData[647]++;
    if (visit511_647_1(Dom.css(el, 'position') === 'fixed')) {
      _$jscoverage['/base/style.js'].lineData[648]++;
      offset = el.getBoundingClientRect();
    } else {
      _$jscoverage['/base/style.js'].lineData[653]++;
      offsetParent = getOffsetParent(el);
      _$jscoverage['/base/style.js'].lineData[654]++;
      offset = Dom.offset(el);
      _$jscoverage['/base/style.js'].lineData[655]++;
      parentOffset = Dom.offset(offsetParent);
      _$jscoverage['/base/style.js'].lineData[656]++;
      parentOffset.top += visit512_656_1(parseFloat(Dom.css(offsetParent, 'borderTopWidth')) || 0);
      _$jscoverage['/base/style.js'].lineData[657]++;
      parentOffset.left += visit513_657_1(parseFloat(Dom.css(offsetParent, 'borderLeftWidth')) || 0);
    }
    _$jscoverage['/base/style.js'].lineData[660]++;
    offset.top -= visit514_660_1(parseFloat(Dom.css(el, 'marginTop')) || 0);
    _$jscoverage['/base/style.js'].lineData[661]++;
    offset.left -= visit515_661_1(parseFloat(Dom.css(el, 'marginLeft')) || 0);
    _$jscoverage['/base/style.js'].lineData[665]++;
    return {
  top: offset.top - parentOffset.top, 
  left: offset.left - parentOffset.left};
  }
  _$jscoverage['/base/style.js'].lineData[671]++;
  function getOffsetParent(el) {
    _$jscoverage['/base/style.js'].functionData[28]++;
    _$jscoverage['/base/style.js'].lineData[672]++;
    var offsetParent = visit516_672_1(el.offsetParent || (visit517_672_2(el.ownerDocument || doc)).body);
    _$jscoverage['/base/style.js'].lineData[673]++;
    while (visit518_673_1(offsetParent && visit519_673_2(!ROOT_REG.test(offsetParent.nodeName) && visit520_674_1(Dom.css(offsetParent, 'position') === 'static')))) {
      _$jscoverage['/base/style.js'].lineData[675]++;
      offsetParent = offsetParent.offsetParent;
    }
    _$jscoverage['/base/style.js'].lineData[677]++;
    return offsetParent;
  }
  _$jscoverage['/base/style.js'].lineData[680]++;
  return Dom;
});
