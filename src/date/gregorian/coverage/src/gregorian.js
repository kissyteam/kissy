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
if (! _$jscoverage['/gregorian.js']) {
  _$jscoverage['/gregorian.js'] = {};
  _$jscoverage['/gregorian.js'].lineData = [];
  _$jscoverage['/gregorian.js'].lineData[6] = 0;
  _$jscoverage['/gregorian.js'].lineData[7] = 0;
  _$jscoverage['/gregorian.js'].lineData[8] = 0;
  _$jscoverage['/gregorian.js'].lineData[9] = 0;
  _$jscoverage['/gregorian.js'].lineData[10] = 0;
  _$jscoverage['/gregorian.js'].lineData[11] = 0;
  _$jscoverage['/gregorian.js'].lineData[44] = 0;
  _$jscoverage['/gregorian.js'].lineData[46] = 0;
  _$jscoverage['/gregorian.js'].lineData[48] = 0;
  _$jscoverage['/gregorian.js'].lineData[49] = 0;
  _$jscoverage['/gregorian.js'].lineData[50] = 0;
  _$jscoverage['/gregorian.js'].lineData[51] = 0;
  _$jscoverage['/gregorian.js'].lineData[52] = 0;
  _$jscoverage['/gregorian.js'].lineData[55] = 0;
  _$jscoverage['/gregorian.js'].lineData[57] = 0;
  _$jscoverage['/gregorian.js'].lineData[59] = 0;
  _$jscoverage['/gregorian.js'].lineData[66] = 0;
  _$jscoverage['/gregorian.js'].lineData[72] = 0;
  _$jscoverage['/gregorian.js'].lineData[78] = 0;
  _$jscoverage['/gregorian.js'].lineData[86] = 0;
  _$jscoverage['/gregorian.js'].lineData[88] = 0;
  _$jscoverage['/gregorian.js'].lineData[90] = 0;
  _$jscoverage['/gregorian.js'].lineData[91] = 0;
  _$jscoverage['/gregorian.js'].lineData[95] = 0;
  _$jscoverage['/gregorian.js'].lineData[97] = 0;
  _$jscoverage['/gregorian.js'].lineData[186] = 0;
  _$jscoverage['/gregorian.js'].lineData[194] = 0;
  _$jscoverage['/gregorian.js'].lineData[195] = 0;
  _$jscoverage['/gregorian.js'].lineData[196] = 0;
  _$jscoverage['/gregorian.js'].lineData[197] = 0;
  _$jscoverage['/gregorian.js'].lineData[198] = 0;
  _$jscoverage['/gregorian.js'].lineData[199] = 0;
  _$jscoverage['/gregorian.js'].lineData[201] = 0;
  _$jscoverage['/gregorian.js'].lineData[202] = 0;
  _$jscoverage['/gregorian.js'].lineData[203] = 0;
  _$jscoverage['/gregorian.js'].lineData[204] = 0;
  _$jscoverage['/gregorian.js'].lineData[206] = 0;
  _$jscoverage['/gregorian.js'].lineData[207] = 0;
  _$jscoverage['/gregorian.js'].lineData[209] = 0;
  _$jscoverage['/gregorian.js'].lineData[210] = 0;
  _$jscoverage['/gregorian.js'].lineData[212] = 0;
  _$jscoverage['/gregorian.js'].lineData[213] = 0;
  _$jscoverage['/gregorian.js'].lineData[214] = 0;
  _$jscoverage['/gregorian.js'].lineData[215] = 0;
  _$jscoverage['/gregorian.js'].lineData[216] = 0;
  _$jscoverage['/gregorian.js'].lineData[218] = 0;
  _$jscoverage['/gregorian.js'].lineData[220] = 0;
  _$jscoverage['/gregorian.js'].lineData[225] = 0;
  _$jscoverage['/gregorian.js'].lineData[243] = 0;
  _$jscoverage['/gregorian.js'].lineData[259] = 0;
  _$jscoverage['/gregorian.js'].lineData[271] = 0;
  _$jscoverage['/gregorian.js'].lineData[279] = 0;
  _$jscoverage['/gregorian.js'].lineData[293] = 0;
  _$jscoverage['/gregorian.js'].lineData[294] = 0;
  _$jscoverage['/gregorian.js'].lineData[297] = 0;
  _$jscoverage['/gregorian.js'].lineData[298] = 0;
  _$jscoverage['/gregorian.js'].lineData[299] = 0;
  _$jscoverage['/gregorian.js'].lineData[300] = 0;
  _$jscoverage['/gregorian.js'].lineData[303] = 0;
  _$jscoverage['/gregorian.js'].lineData[316] = 0;
  _$jscoverage['/gregorian.js'].lineData[317] = 0;
  _$jscoverage['/gregorian.js'].lineData[319] = 0;
  _$jscoverage['/gregorian.js'].lineData[321] = 0;
  _$jscoverage['/gregorian.js'].lineData[323] = 0;
  _$jscoverage['/gregorian.js'].lineData[324] = 0;
  _$jscoverage['/gregorian.js'].lineData[327] = 0;
  _$jscoverage['/gregorian.js'].lineData[328] = 0;
  _$jscoverage['/gregorian.js'].lineData[329] = 0;
  _$jscoverage['/gregorian.js'].lineData[330] = 0;
  _$jscoverage['/gregorian.js'].lineData[332] = 0;
  _$jscoverage['/gregorian.js'].lineData[335] = 0;
  _$jscoverage['/gregorian.js'].lineData[336] = 0;
  _$jscoverage['/gregorian.js'].lineData[337] = 0;
  _$jscoverage['/gregorian.js'].lineData[340] = 0;
  _$jscoverage['/gregorian.js'].lineData[341] = 0;
  _$jscoverage['/gregorian.js'].lineData[344] = 0;
  _$jscoverage['/gregorian.js'].lineData[345] = 0;
  _$jscoverage['/gregorian.js'].lineData[347] = 0;
  _$jscoverage['/gregorian.js'].lineData[348] = 0;
  _$jscoverage['/gregorian.js'].lineData[350] = 0;
  _$jscoverage['/gregorian.js'].lineData[361] = 0;
  _$jscoverage['/gregorian.js'].lineData[370] = 0;
  _$jscoverage['/gregorian.js'].lineData[371] = 0;
  _$jscoverage['/gregorian.js'].lineData[372] = 0;
  _$jscoverage['/gregorian.js'].lineData[373] = 0;
  _$jscoverage['/gregorian.js'].lineData[374] = 0;
  _$jscoverage['/gregorian.js'].lineData[375] = 0;
  _$jscoverage['/gregorian.js'].lineData[376] = 0;
  _$jscoverage['/gregorian.js'].lineData[377] = 0;
  _$jscoverage['/gregorian.js'].lineData[378] = 0;
  _$jscoverage['/gregorian.js'].lineData[380] = 0;
  _$jscoverage['/gregorian.js'].lineData[381] = 0;
  _$jscoverage['/gregorian.js'].lineData[382] = 0;
  _$jscoverage['/gregorian.js'].lineData[386] = 0;
  _$jscoverage['/gregorian.js'].lineData[388] = 0;
  _$jscoverage['/gregorian.js'].lineData[390] = 0;
  _$jscoverage['/gregorian.js'].lineData[392] = 0;
  _$jscoverage['/gregorian.js'].lineData[393] = 0;
  _$jscoverage['/gregorian.js'].lineData[394] = 0;
  _$jscoverage['/gregorian.js'].lineData[395] = 0;
  _$jscoverage['/gregorian.js'].lineData[396] = 0;
  _$jscoverage['/gregorian.js'].lineData[398] = 0;
  _$jscoverage['/gregorian.js'].lineData[399] = 0;
  _$jscoverage['/gregorian.js'].lineData[400] = 0;
  _$jscoverage['/gregorian.js'].lineData[401] = 0;
  _$jscoverage['/gregorian.js'].lineData[402] = 0;
  _$jscoverage['/gregorian.js'].lineData[403] = 0;
  _$jscoverage['/gregorian.js'].lineData[404] = 0;
  _$jscoverage['/gregorian.js'].lineData[406] = 0;
  _$jscoverage['/gregorian.js'].lineData[413] = 0;
  _$jscoverage['/gregorian.js'].lineData[414] = 0;
  _$jscoverage['/gregorian.js'].lineData[415] = 0;
  _$jscoverage['/gregorian.js'].lineData[417] = 0;
  _$jscoverage['/gregorian.js'].lineData[418] = 0;
  _$jscoverage['/gregorian.js'].lineData[420] = 0;
  _$jscoverage['/gregorian.js'].lineData[423] = 0;
  _$jscoverage['/gregorian.js'].lineData[427] = 0;
  _$jscoverage['/gregorian.js'].lineData[428] = 0;
  _$jscoverage['/gregorian.js'].lineData[429] = 0;
  _$jscoverage['/gregorian.js'].lineData[432] = 0;
  _$jscoverage['/gregorian.js'].lineData[433] = 0;
  _$jscoverage['/gregorian.js'].lineData[434] = 0;
  _$jscoverage['/gregorian.js'].lineData[435] = 0;
  _$jscoverage['/gregorian.js'].lineData[437] = 0;
  _$jscoverage['/gregorian.js'].lineData[441] = 0;
  _$jscoverage['/gregorian.js'].lineData[445] = 0;
  _$jscoverage['/gregorian.js'].lineData[446] = 0;
  _$jscoverage['/gregorian.js'].lineData[448] = 0;
  _$jscoverage['/gregorian.js'].lineData[457] = 0;
  _$jscoverage['/gregorian.js'].lineData[458] = 0;
  _$jscoverage['/gregorian.js'].lineData[461] = 0;
  _$jscoverage['/gregorian.js'].lineData[463] = 0;
  _$jscoverage['/gregorian.js'].lineData[464] = 0;
  _$jscoverage['/gregorian.js'].lineData[465] = 0;
  _$jscoverage['/gregorian.js'].lineData[466] = 0;
  _$jscoverage['/gregorian.js'].lineData[468] = 0;
  _$jscoverage['/gregorian.js'].lineData[469] = 0;
  _$jscoverage['/gregorian.js'].lineData[470] = 0;
  _$jscoverage['/gregorian.js'].lineData[471] = 0;
  _$jscoverage['/gregorian.js'].lineData[472] = 0;
  _$jscoverage['/gregorian.js'].lineData[473] = 0;
  _$jscoverage['/gregorian.js'].lineData[475] = 0;
  _$jscoverage['/gregorian.js'].lineData[477] = 0;
  _$jscoverage['/gregorian.js'].lineData[479] = 0;
  _$jscoverage['/gregorian.js'].lineData[482] = 0;
  _$jscoverage['/gregorian.js'].lineData[484] = 0;
  _$jscoverage['/gregorian.js'].lineData[486] = 0;
  _$jscoverage['/gregorian.js'].lineData[488] = 0;
  _$jscoverage['/gregorian.js'].lineData[499] = 0;
  _$jscoverage['/gregorian.js'].lineData[500] = 0;
  _$jscoverage['/gregorian.js'].lineData[502] = 0;
  _$jscoverage['/gregorian.js'].lineData[503] = 0;
  _$jscoverage['/gregorian.js'].lineData[509] = 0;
  _$jscoverage['/gregorian.js'].lineData[511] = 0;
  _$jscoverage['/gregorian.js'].lineData[513] = 0;
  _$jscoverage['/gregorian.js'].lineData[515] = 0;
  _$jscoverage['/gregorian.js'].lineData[517] = 0;
  _$jscoverage['/gregorian.js'].lineData[519] = 0;
  _$jscoverage['/gregorian.js'].lineData[520] = 0;
  _$jscoverage['/gregorian.js'].lineData[521] = 0;
  _$jscoverage['/gregorian.js'].lineData[522] = 0;
  _$jscoverage['/gregorian.js'].lineData[523] = 0;
  _$jscoverage['/gregorian.js'].lineData[524] = 0;
  _$jscoverage['/gregorian.js'].lineData[525] = 0;
  _$jscoverage['/gregorian.js'].lineData[526] = 0;
  _$jscoverage['/gregorian.js'].lineData[532] = 0;
  _$jscoverage['/gregorian.js'].lineData[534] = 0;
  _$jscoverage['/gregorian.js'].lineData[536] = 0;
  _$jscoverage['/gregorian.js'].lineData[537] = 0;
  _$jscoverage['/gregorian.js'].lineData[540] = 0;
  _$jscoverage['/gregorian.js'].lineData[541] = 0;
  _$jscoverage['/gregorian.js'].lineData[542] = 0;
  _$jscoverage['/gregorian.js'].lineData[544] = 0;
  _$jscoverage['/gregorian.js'].lineData[545] = 0;
  _$jscoverage['/gregorian.js'].lineData[549] = 0;
  _$jscoverage['/gregorian.js'].lineData[550] = 0;
  _$jscoverage['/gregorian.js'].lineData[553] = 0;
  _$jscoverage['/gregorian.js'].lineData[554] = 0;
  _$jscoverage['/gregorian.js'].lineData[557] = 0;
  _$jscoverage['/gregorian.js'].lineData[559] = 0;
  _$jscoverage['/gregorian.js'].lineData[560] = 0;
  _$jscoverage['/gregorian.js'].lineData[561] = 0;
  _$jscoverage['/gregorian.js'].lineData[563] = 0;
  _$jscoverage['/gregorian.js'].lineData[565] = 0;
  _$jscoverage['/gregorian.js'].lineData[566] = 0;
  _$jscoverage['/gregorian.js'].lineData[567] = 0;
  _$jscoverage['/gregorian.js'].lineData[569] = 0;
  _$jscoverage['/gregorian.js'].lineData[574] = 0;
  _$jscoverage['/gregorian.js'].lineData[575] = 0;
  _$jscoverage['/gregorian.js'].lineData[577] = 0;
  _$jscoverage['/gregorian.js'].lineData[580] = 0;
  _$jscoverage['/gregorian.js'].lineData[581] = 0;
  _$jscoverage['/gregorian.js'].lineData[583] = 0;
  _$jscoverage['/gregorian.js'].lineData[584] = 0;
  _$jscoverage['/gregorian.js'].lineData[586] = 0;
  _$jscoverage['/gregorian.js'].lineData[590] = 0;
  _$jscoverage['/gregorian.js'].lineData[599] = 0;
  _$jscoverage['/gregorian.js'].lineData[600] = 0;
  _$jscoverage['/gregorian.js'].lineData[602] = 0;
  _$jscoverage['/gregorian.js'].lineData[610] = 0;
  _$jscoverage['/gregorian.js'].lineData[611] = 0;
  _$jscoverage['/gregorian.js'].lineData[612] = 0;
  _$jscoverage['/gregorian.js'].lineData[621] = 0;
  _$jscoverage['/gregorian.js'].lineData[622] = 0;
  _$jscoverage['/gregorian.js'].lineData[711] = 0;
  _$jscoverage['/gregorian.js'].lineData[712] = 0;
  _$jscoverage['/gregorian.js'].lineData[713] = 0;
  _$jscoverage['/gregorian.js'].lineData[714] = 0;
  _$jscoverage['/gregorian.js'].lineData[715] = 0;
  _$jscoverage['/gregorian.js'].lineData[716] = 0;
  _$jscoverage['/gregorian.js'].lineData[719] = 0;
  _$jscoverage['/gregorian.js'].lineData[721] = 0;
  _$jscoverage['/gregorian.js'].lineData[833] = 0;
  _$jscoverage['/gregorian.js'].lineData[834] = 0;
  _$jscoverage['/gregorian.js'].lineData[836] = 0;
  _$jscoverage['/gregorian.js'].lineData[837] = 0;
  _$jscoverage['/gregorian.js'].lineData[839] = 0;
  _$jscoverage['/gregorian.js'].lineData[840] = 0;
  _$jscoverage['/gregorian.js'].lineData[841] = 0;
  _$jscoverage['/gregorian.js'].lineData[842] = 0;
  _$jscoverage['/gregorian.js'].lineData[843] = 0;
  _$jscoverage['/gregorian.js'].lineData[844] = 0;
  _$jscoverage['/gregorian.js'].lineData[845] = 0;
  _$jscoverage['/gregorian.js'].lineData[846] = 0;
  _$jscoverage['/gregorian.js'].lineData[847] = 0;
  _$jscoverage['/gregorian.js'].lineData[848] = 0;
  _$jscoverage['/gregorian.js'].lineData[849] = 0;
  _$jscoverage['/gregorian.js'].lineData[851] = 0;
  _$jscoverage['/gregorian.js'].lineData[852] = 0;
  _$jscoverage['/gregorian.js'].lineData[854] = 0;
  _$jscoverage['/gregorian.js'].lineData[856] = 0;
  _$jscoverage['/gregorian.js'].lineData[857] = 0;
  _$jscoverage['/gregorian.js'].lineData[859] = 0;
  _$jscoverage['/gregorian.js'].lineData[860] = 0;
  _$jscoverage['/gregorian.js'].lineData[862] = 0;
  _$jscoverage['/gregorian.js'].lineData[863] = 0;
  _$jscoverage['/gregorian.js'].lineData[865] = 0;
  _$jscoverage['/gregorian.js'].lineData[869] = 0;
  _$jscoverage['/gregorian.js'].lineData[870] = 0;
  _$jscoverage['/gregorian.js'].lineData[874] = 0;
  _$jscoverage['/gregorian.js'].lineData[875] = 0;
  _$jscoverage['/gregorian.js'].lineData[877] = 0;
  _$jscoverage['/gregorian.js'].lineData[878] = 0;
  _$jscoverage['/gregorian.js'].lineData[880] = 0;
  _$jscoverage['/gregorian.js'].lineData[965] = 0;
  _$jscoverage['/gregorian.js'].lineData[966] = 0;
  _$jscoverage['/gregorian.js'].lineData[967] = 0;
  _$jscoverage['/gregorian.js'].lineData[968] = 0;
  _$jscoverage['/gregorian.js'].lineData[993] = 0;
  _$jscoverage['/gregorian.js'].lineData[994] = 0;
  _$jscoverage['/gregorian.js'].lineData[996] = 0;
  _$jscoverage['/gregorian.js'].lineData[998] = 0;
  _$jscoverage['/gregorian.js'].lineData[999] = 0;
  _$jscoverage['/gregorian.js'].lineData[1000] = 0;
  _$jscoverage['/gregorian.js'].lineData[1001] = 0;
  _$jscoverage['/gregorian.js'].lineData[1003] = 0;
  _$jscoverage['/gregorian.js'].lineData[1006] = 0;
  _$jscoverage['/gregorian.js'].lineData[1008] = 0;
  _$jscoverage['/gregorian.js'].lineData[1009] = 0;
  _$jscoverage['/gregorian.js'].lineData[1012] = 0;
  _$jscoverage['/gregorian.js'].lineData[1013] = 0;
  _$jscoverage['/gregorian.js'].lineData[1098] = 0;
  _$jscoverage['/gregorian.js'].lineData[1099] = 0;
  _$jscoverage['/gregorian.js'].lineData[1101] = 0;
  _$jscoverage['/gregorian.js'].lineData[1102] = 0;
  _$jscoverage['/gregorian.js'].lineData[1104] = 0;
  _$jscoverage['/gregorian.js'].lineData[1105] = 0;
  _$jscoverage['/gregorian.js'].lineData[1107] = 0;
  _$jscoverage['/gregorian.js'].lineData[1108] = 0;
  _$jscoverage['/gregorian.js'].lineData[1110] = 0;
  _$jscoverage['/gregorian.js'].lineData[1111] = 0;
  _$jscoverage['/gregorian.js'].lineData[1112] = 0;
  _$jscoverage['/gregorian.js'].lineData[1121] = 0;
  _$jscoverage['/gregorian.js'].lineData[1128] = 0;
  _$jscoverage['/gregorian.js'].lineData[1129] = 0;
  _$jscoverage['/gregorian.js'].lineData[1130] = 0;
  _$jscoverage['/gregorian.js'].lineData[1138] = 0;
  _$jscoverage['/gregorian.js'].lineData[1139] = 0;
  _$jscoverage['/gregorian.js'].lineData[1140] = 0;
  _$jscoverage['/gregorian.js'].lineData[1149] = 0;
  _$jscoverage['/gregorian.js'].lineData[1160] = 0;
  _$jscoverage['/gregorian.js'].lineData[1161] = 0;
  _$jscoverage['/gregorian.js'].lineData[1162] = 0;
  _$jscoverage['/gregorian.js'].lineData[1174] = 0;
  _$jscoverage['/gregorian.js'].lineData[1191] = 0;
  _$jscoverage['/gregorian.js'].lineData[1192] = 0;
  _$jscoverage['/gregorian.js'].lineData[1193] = 0;
  _$jscoverage['/gregorian.js'].lineData[1196] = 0;
  _$jscoverage['/gregorian.js'].lineData[1197] = 0;
  _$jscoverage['/gregorian.js'].lineData[1198] = 0;
  _$jscoverage['/gregorian.js'].lineData[1210] = 0;
  _$jscoverage['/gregorian.js'].lineData[1211] = 0;
  _$jscoverage['/gregorian.js'].lineData[1212] = 0;
  _$jscoverage['/gregorian.js'].lineData[1213] = 0;
  _$jscoverage['/gregorian.js'].lineData[1214] = 0;
  _$jscoverage['/gregorian.js'].lineData[1215] = 0;
  _$jscoverage['/gregorian.js'].lineData[1217] = 0;
  _$jscoverage['/gregorian.js'].lineData[1218] = 0;
  _$jscoverage['/gregorian.js'].lineData[1219] = 0;
  _$jscoverage['/gregorian.js'].lineData[1222] = 0;
  _$jscoverage['/gregorian.js'].lineData[1234] = 0;
  _$jscoverage['/gregorian.js'].lineData[1235] = 0;
  _$jscoverage['/gregorian.js'].lineData[1237] = 0;
  _$jscoverage['/gregorian.js'].lineData[1240] = 0;
  _$jscoverage['/gregorian.js'].lineData[1241] = 0;
  _$jscoverage['/gregorian.js'].lineData[1242] = 0;
  _$jscoverage['/gregorian.js'].lineData[1243] = 0;
  _$jscoverage['/gregorian.js'].lineData[1244] = 0;
  _$jscoverage['/gregorian.js'].lineData[1245] = 0;
  _$jscoverage['/gregorian.js'].lineData[1246] = 0;
  _$jscoverage['/gregorian.js'].lineData[1247] = 0;
  _$jscoverage['/gregorian.js'].lineData[1248] = 0;
  _$jscoverage['/gregorian.js'].lineData[1250] = 0;
  _$jscoverage['/gregorian.js'].lineData[1251] = 0;
  _$jscoverage['/gregorian.js'].lineData[1252] = 0;
  _$jscoverage['/gregorian.js'].lineData[1254] = 0;
  _$jscoverage['/gregorian.js'].lineData[1256] = 0;
  _$jscoverage['/gregorian.js'].lineData[1257] = 0;
  _$jscoverage['/gregorian.js'].lineData[1258] = 0;
  _$jscoverage['/gregorian.js'].lineData[1259] = 0;
  _$jscoverage['/gregorian.js'].lineData[1266] = 0;
  _$jscoverage['/gregorian.js'].lineData[1267] = 0;
  _$jscoverage['/gregorian.js'].lineData[1269] = 0;
  _$jscoverage['/gregorian.js'].lineData[1270] = 0;
  _$jscoverage['/gregorian.js'].lineData[1271] = 0;
  _$jscoverage['/gregorian.js'].lineData[1283] = 0;
  _$jscoverage['/gregorian.js'].lineData[1297] = 0;
  _$jscoverage['/gregorian.js'].lineData[1298] = 0;
  _$jscoverage['/gregorian.js'].lineData[1300] = 0;
  _$jscoverage['/gregorian.js'].lineData[1302] = 0;
  _$jscoverage['/gregorian.js'].lineData[1303] = 0;
  _$jscoverage['/gregorian.js'].lineData[1307] = 0;
  _$jscoverage['/gregorian.js'].lineData[1309] = 0;
  _$jscoverage['/gregorian.js'].lineData[1311] = 0;
  _$jscoverage['/gregorian.js'].lineData[1319] = 0;
  _$jscoverage['/gregorian.js'].lineData[1332] = 0;
  _$jscoverage['/gregorian.js'].lineData[1344] = 0;
  _$jscoverage['/gregorian.js'].lineData[1352] = 0;
  _$jscoverage['/gregorian.js'].lineData[1365] = 0;
  _$jscoverage['/gregorian.js'].lineData[1366] = 0;
  _$jscoverage['/gregorian.js'].lineData[1367] = 0;
  _$jscoverage['/gregorian.js'].lineData[1368] = 0;
  _$jscoverage['/gregorian.js'].lineData[1371] = 0;
  _$jscoverage['/gregorian.js'].lineData[1372] = 0;
  _$jscoverage['/gregorian.js'].lineData[1375] = 0;
  _$jscoverage['/gregorian.js'].lineData[1376] = 0;
  _$jscoverage['/gregorian.js'].lineData[1379] = 0;
  _$jscoverage['/gregorian.js'].lineData[1380] = 0;
  _$jscoverage['/gregorian.js'].lineData[1383] = 0;
  _$jscoverage['/gregorian.js'].lineData[1384] = 0;
  _$jscoverage['/gregorian.js'].lineData[1392] = 0;
  _$jscoverage['/gregorian.js'].lineData[1393] = 0;
  _$jscoverage['/gregorian.js'].lineData[1394] = 0;
  _$jscoverage['/gregorian.js'].lineData[1395] = 0;
  _$jscoverage['/gregorian.js'].lineData[1396] = 0;
  _$jscoverage['/gregorian.js'].lineData[1397] = 0;
  _$jscoverage['/gregorian.js'].lineData[1398] = 0;
  _$jscoverage['/gregorian.js'].lineData[1399] = 0;
  _$jscoverage['/gregorian.js'].lineData[1403] = 0;
  _$jscoverage['/gregorian.js'].lineData[1404] = 0;
  _$jscoverage['/gregorian.js'].lineData[1407] = 0;
  _$jscoverage['/gregorian.js'].lineData[1408] = 0;
  _$jscoverage['/gregorian.js'].lineData[1411] = 0;
  _$jscoverage['/gregorian.js'].lineData[1412] = 0;
  _$jscoverage['/gregorian.js'].lineData[1413] = 0;
  _$jscoverage['/gregorian.js'].lineData[1414] = 0;
  _$jscoverage['/gregorian.js'].lineData[1415] = 0;
  _$jscoverage['/gregorian.js'].lineData[1417] = 0;
  _$jscoverage['/gregorian.js'].lineData[1418] = 0;
  _$jscoverage['/gregorian.js'].lineData[1421] = 0;
  _$jscoverage['/gregorian.js'].lineData[1424] = 0;
  _$jscoverage['/gregorian.js'].lineData[1429] = 0;
}
if (! _$jscoverage['/gregorian.js'].functionData) {
  _$jscoverage['/gregorian.js'].functionData = [];
  _$jscoverage['/gregorian.js'].functionData[0] = 0;
  _$jscoverage['/gregorian.js'].functionData[1] = 0;
  _$jscoverage['/gregorian.js'].functionData[2] = 0;
  _$jscoverage['/gregorian.js'].functionData[3] = 0;
  _$jscoverage['/gregorian.js'].functionData[4] = 0;
  _$jscoverage['/gregorian.js'].functionData[5] = 0;
  _$jscoverage['/gregorian.js'].functionData[6] = 0;
  _$jscoverage['/gregorian.js'].functionData[7] = 0;
  _$jscoverage['/gregorian.js'].functionData[8] = 0;
  _$jscoverage['/gregorian.js'].functionData[9] = 0;
  _$jscoverage['/gregorian.js'].functionData[10] = 0;
  _$jscoverage['/gregorian.js'].functionData[11] = 0;
  _$jscoverage['/gregorian.js'].functionData[12] = 0;
  _$jscoverage['/gregorian.js'].functionData[13] = 0;
  _$jscoverage['/gregorian.js'].functionData[14] = 0;
  _$jscoverage['/gregorian.js'].functionData[15] = 0;
  _$jscoverage['/gregorian.js'].functionData[16] = 0;
  _$jscoverage['/gregorian.js'].functionData[17] = 0;
  _$jscoverage['/gregorian.js'].functionData[18] = 0;
  _$jscoverage['/gregorian.js'].functionData[19] = 0;
  _$jscoverage['/gregorian.js'].functionData[20] = 0;
  _$jscoverage['/gregorian.js'].functionData[21] = 0;
  _$jscoverage['/gregorian.js'].functionData[22] = 0;
  _$jscoverage['/gregorian.js'].functionData[23] = 0;
  _$jscoverage['/gregorian.js'].functionData[24] = 0;
  _$jscoverage['/gregorian.js'].functionData[25] = 0;
  _$jscoverage['/gregorian.js'].functionData[26] = 0;
  _$jscoverage['/gregorian.js'].functionData[27] = 0;
  _$jscoverage['/gregorian.js'].functionData[28] = 0;
  _$jscoverage['/gregorian.js'].functionData[29] = 0;
  _$jscoverage['/gregorian.js'].functionData[30] = 0;
  _$jscoverage['/gregorian.js'].functionData[31] = 0;
  _$jscoverage['/gregorian.js'].functionData[32] = 0;
  _$jscoverage['/gregorian.js'].functionData[33] = 0;
  _$jscoverage['/gregorian.js'].functionData[34] = 0;
  _$jscoverage['/gregorian.js'].functionData[35] = 0;
  _$jscoverage['/gregorian.js'].functionData[36] = 0;
  _$jscoverage['/gregorian.js'].functionData[37] = 0;
  _$jscoverage['/gregorian.js'].functionData[38] = 0;
  _$jscoverage['/gregorian.js'].functionData[39] = 0;
  _$jscoverage['/gregorian.js'].functionData[40] = 0;
  _$jscoverage['/gregorian.js'].functionData[41] = 0;
}
if (! _$jscoverage['/gregorian.js'].branchData) {
  _$jscoverage['/gregorian.js'].branchData = {};
  _$jscoverage['/gregorian.js'].branchData['48'] = [];
  _$jscoverage['/gregorian.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['51'] = [];
  _$jscoverage['/gregorian.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['55'] = [];
  _$jscoverage['/gregorian.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['72'] = [];
  _$jscoverage['/gregorian.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['90'] = [];
  _$jscoverage['/gregorian.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['293'] = [];
  _$jscoverage['/gregorian.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['298'] = [];
  _$jscoverage['/gregorian.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['316'] = [];
  _$jscoverage['/gregorian.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['329'] = [];
  _$jscoverage['/gregorian.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['347'] = [];
  _$jscoverage['/gregorian.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['361'] = [];
  _$jscoverage['/gregorian.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['376'] = [];
  _$jscoverage['/gregorian.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['380'] = [];
  _$jscoverage['/gregorian.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['398'] = [];
  _$jscoverage['/gregorian.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['423'] = [];
  _$jscoverage['/gregorian.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['432'] = [];
  _$jscoverage['/gregorian.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['437'] = [];
  _$jscoverage['/gregorian.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['437'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['439'] = [];
  _$jscoverage['/gregorian.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['457'] = [];
  _$jscoverage['/gregorian.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['465'] = [];
  _$jscoverage['/gregorian.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['469'] = [];
  _$jscoverage['/gregorian.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['471'] = [];
  _$jscoverage['/gregorian.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['473'] = [];
  _$jscoverage['/gregorian.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['499'] = [];
  _$jscoverage['/gregorian.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['502'] = [];
  _$jscoverage['/gregorian.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['519'] = [];
  _$jscoverage['/gregorian.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['521'] = [];
  _$jscoverage['/gregorian.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['524'] = [];
  _$jscoverage['/gregorian.js'].branchData['524'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['536'] = [];
  _$jscoverage['/gregorian.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['540'] = [];
  _$jscoverage['/gregorian.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['541'] = [];
  _$jscoverage['/gregorian.js'].branchData['541'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['544'] = [];
  _$jscoverage['/gregorian.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['549'] = [];
  _$jscoverage['/gregorian.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['553'] = [];
  _$jscoverage['/gregorian.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['560'] = [];
  _$jscoverage['/gregorian.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['566'] = [];
  _$jscoverage['/gregorian.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['574'] = [];
  _$jscoverage['/gregorian.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['580'] = [];
  _$jscoverage['/gregorian.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['583'] = [];
  _$jscoverage['/gregorian.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['599'] = [];
  _$jscoverage['/gregorian.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['712'] = [];
  _$jscoverage['/gregorian.js'].branchData['712'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['714'] = [];
  _$jscoverage['/gregorian.js'].branchData['714'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['715'] = [];
  _$jscoverage['/gregorian.js'].branchData['715'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['833'] = [];
  _$jscoverage['/gregorian.js'].branchData['833'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['840'] = [];
  _$jscoverage['/gregorian.js'].branchData['840'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['844'] = [];
  _$jscoverage['/gregorian.js'].branchData['844'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['848'] = [];
  _$jscoverage['/gregorian.js'].branchData['848'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['993'] = [];
  _$jscoverage['/gregorian.js'].branchData['993'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1128'] = [];
  _$jscoverage['/gregorian.js'].branchData['1128'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1138'] = [];
  _$jscoverage['/gregorian.js'].branchData['1138'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1160'] = [];
  _$jscoverage['/gregorian.js'].branchData['1160'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1192'] = [];
  _$jscoverage['/gregorian.js'].branchData['1192'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1213'] = [];
  _$jscoverage['/gregorian.js'].branchData['1213'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1214'] = [];
  _$jscoverage['/gregorian.js'].branchData['1214'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1217'] = [];
  _$jscoverage['/gregorian.js'].branchData['1217'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1218'] = [];
  _$jscoverage['/gregorian.js'].branchData['1218'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1234'] = [];
  _$jscoverage['/gregorian.js'].branchData['1234'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1234'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1234'][3] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1247'] = [];
  _$jscoverage['/gregorian.js'].branchData['1247'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1251'] = [];
  _$jscoverage['/gregorian.js'].branchData['1251'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1266'] = [];
  _$jscoverage['/gregorian.js'].branchData['1266'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1283'] = [];
  _$jscoverage['/gregorian.js'].branchData['1283'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1283'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1284'] = [];
  _$jscoverage['/gregorian.js'].branchData['1284'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1284'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1285'] = [];
  _$jscoverage['/gregorian.js'].branchData['1285'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1285'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1286'] = [];
  _$jscoverage['/gregorian.js'].branchData['1286'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1297'] = [];
  _$jscoverage['/gregorian.js'].branchData['1297'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1309'] = [];
  _$jscoverage['/gregorian.js'].branchData['1309'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1366'] = [];
  _$jscoverage['/gregorian.js'].branchData['1366'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1398'] = [];
  _$jscoverage['/gregorian.js'].branchData['1398'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1414'] = [];
  _$jscoverage['/gregorian.js'].branchData['1414'][1] = new BranchData();
}
_$jscoverage['/gregorian.js'].branchData['1414'][1].init(150, 36, 'nDays >= self.minimalDaysInFirstWeek');
function visit86_1414_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1414'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1398'][1].init(214, 21, 'dayOfMonth > monthLen');
function visit85_1398_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1398'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1366'][1].init(13, 1, 'f');
function visit84_1366_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1366'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1309'][1].init(44644, 9, '\'@DEBUG@\'');
function visit83_1309_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1309'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1297'][1].init(17, 19, 'field === undefined');
function visit82_1297_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1297'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1286'][1].init(60, 57, 'this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit81_1286_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1286'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1285'][2].init(135, 41, 'this.timezoneOffset == obj.timezoneOffset');
function visit80_1285_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1285'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1285'][1].init(60, 118, 'this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit79_1285_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1285'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1284'][2].init(73, 41, 'this.firstDayOfWeek == obj.firstDayOfWeek');
function visit78_1284_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1284'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1284'][1].init(50, 179, 'this.firstDayOfWeek == obj.firstDayOfWeek && this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit77_1284_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1284'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1283'][2].init(20, 31, 'this.getTime() == obj.getTime()');
function visit76_1283_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1283'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1283'][1].init(20, 230, 'this.getTime() == obj.getTime() && this.firstDayOfWeek == obj.firstDayOfWeek && this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit75_1283_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1283'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1266'][1].init(17, 23, 'this.time === undefined');
function visit74_1266_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1266'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1251'][1].init(764, 9, 'days != 0');
function visit73_1251_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1251'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1247'][1].init(653, 8, 'days < 0');
function visit72_1247_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1247'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1234'][3].init(57, 38, 'dayOfWeek > GregorianCalendar.SATURDAY');
function visit71_1234_3(result) {
  _$jscoverage['/gregorian.js'].branchData['1234'][3].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1234'][2].init(17, 36, 'dayOfWeek < GregorianCalendar.SUNDAY');
function visit70_1234_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1234'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1234'][1].init(17, 78, 'dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY');
function visit69_1234_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1234'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1218'][1].init(21, 15, 'weekOfYear == 1');
function visit68_1218_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1218'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1217'][1].init(322, 35, 'month == GregorianCalendar.DECEMBER');
function visit67_1217_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1217'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1214'][1].init(21, 16, 'weekOfYear >= 52');
function visit66_1214_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1214'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1213'][1].init(174, 34, 'month == GregorianCalendar.JANUARY');
function visit65_1213_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1213'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1192'][1].init(64, 26, 'weekYear == this.get(YEAR)');
function visit64_1192_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1192'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1160'][1].init(17, 53, 'this.minimalDaysInFirstWeek != minimalDaysInFirstWeek');
function visit63_1160_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1160'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1138'][1].init(17, 37, 'this.firstDayOfWeek != firstDayOfWeek');
function visit62_1138_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1138'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1128'][1].init(17, 37, 'this.timezoneOffset != timezoneOffset');
function visit61_1128_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1128'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['993'][1].init(17, 7, '!amount');
function visit60_993_1(result) {
  _$jscoverage['/gregorian.js'].branchData['993'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['848'][1].init(152, 10, 'yearAmount');
function visit59_848_1(result) {
  _$jscoverage['/gregorian.js'].branchData['848'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['844'][1].init(396, 15, 'field === MONTH');
function visit58_844_1(result) {
  _$jscoverage['/gregorian.js'].branchData['844'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['840'][1].init(242, 14, 'field === YEAR');
function visit57_840_1(result) {
  _$jscoverage['/gregorian.js'].branchData['840'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['833'][1].init(17, 7, '!amount');
function visit56_833_1(result) {
  _$jscoverage['/gregorian.js'].branchData['833'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['715'][1].init(33, 7, 'i < len');
function visit55_715_1(result) {
  _$jscoverage['/gregorian.js'].branchData['715'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['714'][1].init(133, 22, 'len < MILLISECONDS + 1');
function visit54_714_1(result) {
  _$jscoverage['/gregorian.js'].branchData['714'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['712'][1].init(57, 8, 'len == 2');
function visit53_712_1(result) {
  _$jscoverage['/gregorian.js'].branchData['712'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['599'][1].init(17, 23, 'this.time === undefined');
function visit52_599_1(result) {
  _$jscoverage['/gregorian.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['583'][1].init(398, 30, 'dayOfWeek != firstDayOfWeekCfg');
function visit51_583_1(result) {
  _$jscoverage['/gregorian.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['580'][1].init(245, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit50_580_1(result) {
  _$jscoverage['/gregorian.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['574'][1].init(77, 23, 'self.isSet(DAY_OF_YEAR)');
function visit49_574_1(result) {
  _$jscoverage['/gregorian.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['566'][1].init(344, 9, 'dowim < 0');
function visit48_566_1(result) {
  _$jscoverage['/gregorian.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['560'][1].init(64, 32, 'self.isSet(DAY_OF_WEEK_IN_MONTH)');
function visit47_560_1(result) {
  _$jscoverage['/gregorian.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['553'][1].init(432, 30, 'dayOfWeek != firstDayOfWeekCfg');
function visit46_553_1(result) {
  _$jscoverage['/gregorian.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['549'][1].init(266, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit45_549_1(result) {
  _$jscoverage['/gregorian.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['544'][1].init(25, 25, 'self.isSet(WEEK_OF_MONTH)');
function visit44_544_1(result) {
  _$jscoverage['/gregorian.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['541'][1].init(21, 24, 'self.isSet(DAY_OF_MONTH)');
function visit43_541_1(result) {
  _$jscoverage['/gregorian.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['540'][1].init(1006, 17, 'self.isSet(MONTH)');
function visit42_540_1(result) {
  _$jscoverage['/gregorian.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['536'][1].init(899, 23, 'self.isSet(DAY_OF_WEEK)');
function visit41_536_1(result) {
  _$jscoverage['/gregorian.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['524'][1].init(206, 33, 'month < GregorianCalendar.JANUARY');
function visit40_524_1(result) {
  _$jscoverage['/gregorian.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['521'][1].init(60, 34, 'month > GregorianCalendar.DECEMBER');
function visit39_521_1(result) {
  _$jscoverage['/gregorian.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['519'][1].init(235, 17, 'self.isSet(MONTH)');
function visit38_519_1(result) {
  _$jscoverage['/gregorian.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['502'][1].init(110, 20, '!this.fieldsComputed');
function visit37_502_1(result) {
  _$jscoverage['/gregorian.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['499'][1].init(17, 23, 'this.time === undefined');
function visit36_499_1(result) {
  _$jscoverage['/gregorian.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['473'][1].init(555, 25, 'fields[MILLISECONDS] || 0');
function visit35_473_1(result) {
  _$jscoverage['/gregorian.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['471'][1].init(477, 20, 'fields[SECONDS] || 0');
function visit34_471_1(result) {
  _$jscoverage['/gregorian.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['469'][1].init(402, 19, 'fields[MINUTE] || 0');
function visit33_469_1(result) {
  _$jscoverage['/gregorian.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['465'][1].init(257, 23, 'this.isSet(HOUR_OF_DAY)');
function visit32_465_1(result) {
  _$jscoverage['/gregorian.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['457'][1].init(17, 17, '!this.isSet(YEAR)');
function visit31_457_1(result) {
  _$jscoverage['/gregorian.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['439'][1].init(117, 29, 'fixedDate >= (nextJan1st - 7)');
function visit30_439_1(result) {
  _$jscoverage['/gregorian.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['437'][2].init(268, 36, 'nDays >= this.minimalDaysInFirstWeek');
function visit29_437_2(result) {
  _$jscoverage['/gregorian.js'].branchData['437'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['437'][1].init(268, 147, 'nDays >= this.minimalDaysInFirstWeek && fixedDate >= (nextJan1st - 7)');
function visit28_437_1(result) {
  _$jscoverage['/gregorian.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['432'][1].init(2422, 16, 'weekOfYear >= 52');
function visit27_432_1(result) {
  _$jscoverage['/gregorian.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['423'][1].init(1961, 15, 'weekOfYear == 0');
function visit26_423_1(result) {
  _$jscoverage['/gregorian.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['398'][1].init(959, 14, 'timeOfDay != 0');
function visit25_398_1(result) {
  _$jscoverage['/gregorian.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['380'][1].init(24, 13, 'timeOfDay < 0');
function visit24_380_1(result) {
  _$jscoverage['/gregorian.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['376'][1].init(322, 20, 'timeOfDay >= ONE_DAY');
function visit23_376_1(result) {
  _$jscoverage['/gregorian.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['361'][1].init(20, 32, 'this.fields[field] !== undefined');
function visit22_361_1(result) {
  _$jscoverage['/gregorian.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['347'][1].init(1225, 19, 'value === undefined');
function visit21_347_1(result) {
  _$jscoverage['/gregorian.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['329'][1].init(204, 10, 'value == 1');
function visit20_329_1(result) {
  _$jscoverage['/gregorian.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['316'][1].init(17, 31, 'MAX_VALUES[field] !== undefined');
function visit19_316_1(result) {
  _$jscoverage['/gregorian.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['298'][1].init(163, 23, 'field === WEEK_OF_MONTH');
function visit18_298_1(result) {
  _$jscoverage['/gregorian.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['293'][1].init(17, 31, 'MIN_VALUES[field] !== undefined');
function visit17_293_1(result) {
  _$jscoverage['/gregorian.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['90'][1].init(1208, 21, 'arguments.length >= 3');
function visit16_90_1(result) {
  _$jscoverage['/gregorian.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['72'][1].init(692, 39, 'timezoneOffset || locale.timezoneOffset');
function visit15_72_1(result) {
  _$jscoverage['/gregorian.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['55'][1].init(288, 23, 'locale || defaultLocale');
function visit14_55_1(result) {
  _$jscoverage['/gregorian.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['51'][1].init(197, 16, 'args.length >= 3');
function visit13_51_1(result) {
  _$jscoverage['/gregorian.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['48'][1].init(58, 26, 'S.isObject(timezoneOffset)');
function visit12_48_1(result) {
  _$jscoverage['/gregorian.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/gregorian.js'].functionData[0]++;
  _$jscoverage['/gregorian.js'].lineData[7]++;
  var toInt = parseInt;
  _$jscoverage['/gregorian.js'].lineData[8]++;
  var Utils = require('./gregorian/utils');
  _$jscoverage['/gregorian.js'].lineData[9]++;
  var defaultLocale = require('i18n!date');
  _$jscoverage['/gregorian.js'].lineData[10]++;
  var Const = require('./gregorian/const');
  _$jscoverage['/gregorian.js'].lineData[11]++;
  var undefined = undefined;
  _$jscoverage['/gregorian.js'].lineData[44]++;
  function GregorianCalendar(timezoneOffset, locale) {
    _$jscoverage['/gregorian.js'].functionData[1]++;
    _$jscoverage['/gregorian.js'].lineData[46]++;
    var args = S.makeArray(arguments);
    _$jscoverage['/gregorian.js'].lineData[48]++;
    if (visit12_48_1(S.isObject(timezoneOffset))) {
      _$jscoverage['/gregorian.js'].lineData[49]++;
      locale = timezoneOffset;
      _$jscoverage['/gregorian.js'].lineData[50]++;
      timezoneOffset = locale.timezoneOffset;
    } else {
      _$jscoverage['/gregorian.js'].lineData[51]++;
      if (visit13_51_1(args.length >= 3)) {
        _$jscoverage['/gregorian.js'].lineData[52]++;
        timezoneOffset = locale = null;
      }
    }
    _$jscoverage['/gregorian.js'].lineData[55]++;
    locale = visit14_55_1(locale || defaultLocale);
    _$jscoverage['/gregorian.js'].lineData[57]++;
    this.locale = locale;
    _$jscoverage['/gregorian.js'].lineData[59]++;
    this.fields = [];
    _$jscoverage['/gregorian.js'].lineData[66]++;
    this.time = undefined;
    _$jscoverage['/gregorian.js'].lineData[72]++;
    this.timezoneOffset = visit15_72_1(timezoneOffset || locale.timezoneOffset);
    _$jscoverage['/gregorian.js'].lineData[78]++;
    this.firstDayOfWeek = locale.firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[86]++;
    this.minimalDaysInFirstWeek = locale.minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[88]++;
    this.fieldsComputed = false;
    _$jscoverage['/gregorian.js'].lineData[90]++;
    if (visit16_90_1(arguments.length >= 3)) {
      _$jscoverage['/gregorian.js'].lineData[91]++;
      this.set.apply(this, args);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[95]++;
  S.mix(GregorianCalendar, Const);
  _$jscoverage['/gregorian.js'].lineData[97]++;
  S.mix(GregorianCalendar, {
  Utils: Utils, 
  isLeapYear: Utils.isLeapYear, 
  YEAR: 1, 
  MONTH: 2, 
  DAY_OF_MONTH: 3, 
  HOUR_OF_DAY: 4, 
  MINUTES: 5, 
  SECONDS: 6, 
  MILLISECONDS: 7, 
  WEEK_OF_YEAR: 8, 
  WEEK_OF_MONTH: 9, 
  DAY_OF_YEAR: 10, 
  DAY_OF_WEEK: 11, 
  DAY_OF_WEEK_IN_MONTH: 12, 
  AM: 0, 
  PM: 1});
  _$jscoverage['/gregorian.js'].lineData[186]++;
  var fields = ['', 'Year', 'Month', 'DayOfMonth', 'HourOfDay', 'Minutes', 'Seconds', 'Milliseconds', 'WeekOfYear', 'WeekOfMonth', 'DayOfYear', 'DayOfWeek', 'DayOfWeekInMonth'];
  _$jscoverage['/gregorian.js'].lineData[194]++;
  var YEAR = GregorianCalendar.YEAR;
  _$jscoverage['/gregorian.js'].lineData[195]++;
  var MONTH = GregorianCalendar.MONTH;
  _$jscoverage['/gregorian.js'].lineData[196]++;
  var DAY_OF_MONTH = GregorianCalendar.DAY_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[197]++;
  var HOUR_OF_DAY = GregorianCalendar.HOUR_OF_DAY;
  _$jscoverage['/gregorian.js'].lineData[198]++;
  var MINUTE = GregorianCalendar.MINUTES;
  _$jscoverage['/gregorian.js'].lineData[199]++;
  var SECONDS = GregorianCalendar.SECONDS;
  _$jscoverage['/gregorian.js'].lineData[201]++;
  var MILLISECONDS = GregorianCalendar.MILLISECONDS;
  _$jscoverage['/gregorian.js'].lineData[202]++;
  var DAY_OF_WEEK_IN_MONTH = GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
  _$jscoverage['/gregorian.js'].lineData[203]++;
  var DAY_OF_YEAR = GregorianCalendar.DAY_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[204]++;
  var DAY_OF_WEEK = GregorianCalendar.DAY_OF_WEEK;
  _$jscoverage['/gregorian.js'].lineData[206]++;
  var WEEK_OF_MONTH = GregorianCalendar.WEEK_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[207]++;
  var WEEK_OF_YEAR = GregorianCalendar.WEEK_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[209]++;
  var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[210]++;
  var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[212]++;
  var ONE_SECOND = 1000;
  _$jscoverage['/gregorian.js'].lineData[213]++;
  var ONE_MINUTE = 60 * ONE_SECOND;
  _$jscoverage['/gregorian.js'].lineData[214]++;
  var ONE_HOUR = 60 * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[215]++;
  var ONE_DAY = 24 * ONE_HOUR;
  _$jscoverage['/gregorian.js'].lineData[216]++;
  var ONE_WEEK = ONE_DAY * 7;
  _$jscoverage['/gregorian.js'].lineData[218]++;
  var EPOCH_OFFSET = 719163;
  _$jscoverage['/gregorian.js'].lineData[220]++;
  var mod = Utils.mod, isLeapYear = Utils.isLeapYear, floorDivide = Math.floor;
  _$jscoverage['/gregorian.js'].lineData[225]++;
  var MIN_VALUES = [undefined, 1, GregorianCalendar.JANUARY, 1, 0, 0, 0, 0, 1, undefined, 1, GregorianCalendar.SUNDAY, 1];
  _$jscoverage['/gregorian.js'].lineData[243]++;
  var MAX_VALUES = [undefined, 292278994, GregorianCalendar.DECEMBER, undefined, 23, 59, 59, 999, undefined, undefined, undefined, GregorianCalendar.SATURDAY, undefined];
  _$jscoverage['/gregorian.js'].lineData[259]++;
  GregorianCalendar.prototype = {
  constructor: GregorianCalendar, 
  isLeapYear: function() {
  _$jscoverage['/gregorian.js'].functionData[2]++;
  _$jscoverage['/gregorian.js'].lineData[271]++;
  return isLeapYear(this.getYear());
}, 
  getLocale: function() {
  _$jscoverage['/gregorian.js'].functionData[3]++;
  _$jscoverage['/gregorian.js'].lineData[279]++;
  return this.locale;
}, 
  getActualMinimum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[4]++;
  _$jscoverage['/gregorian.js'].lineData[293]++;
  if (visit17_293_1(MIN_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[294]++;
    return MIN_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[297]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[298]++;
  if (visit18_298_1(field === WEEK_OF_MONTH)) {
    _$jscoverage['/gregorian.js'].lineData[299]++;
    var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
    _$jscoverage['/gregorian.js'].lineData[300]++;
    return cal.get(WEEK_OF_MONTH);
  }
  _$jscoverage['/gregorian.js'].lineData[303]++;
  throw new Error('minimum value not defined!');
}, 
  getActualMaximum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[5]++;
  _$jscoverage['/gregorian.js'].lineData[316]++;
  if (visit19_316_1(MAX_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[317]++;
    return MAX_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[319]++;
  var value, fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[321]++;
  switch (field) {
    case DAY_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[323]++;
      value = getMonthLength(fields[YEAR], fields[MONTH]);
      _$jscoverage['/gregorian.js'].lineData[324]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[327]++;
      var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
      _$jscoverage['/gregorian.js'].lineData[328]++;
      value = endOfYear.get(WEEK_OF_YEAR);
      _$jscoverage['/gregorian.js'].lineData[329]++;
      if (visit20_329_1(value == 1)) {
        _$jscoverage['/gregorian.js'].lineData[330]++;
        value = 52;
      }
      _$jscoverage['/gregorian.js'].lineData[332]++;
      break;
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[335]++;
      var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
      _$jscoverage['/gregorian.js'].lineData[336]++;
      value = endOfMonth.get(WEEK_OF_MONTH);
      _$jscoverage['/gregorian.js'].lineData[337]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[340]++;
      value = getYearLength(fields[YEAR]);
      _$jscoverage['/gregorian.js'].lineData[341]++;
      break;
    case DAY_OF_WEEK_IN_MONTH:
      _$jscoverage['/gregorian.js'].lineData[344]++;
      value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
      _$jscoverage['/gregorian.js'].lineData[345]++;
      break;
  }
  _$jscoverage['/gregorian.js'].lineData[347]++;
  if (visit21_347_1(value === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[348]++;
    throw new Error('maximum value not defined!');
  }
  _$jscoverage['/gregorian.js'].lineData[350]++;
  return value;
}, 
  isSet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[6]++;
  _$jscoverage['/gregorian.js'].lineData[361]++;
  return visit22_361_1(this.fields[field] !== undefined);
}, 
  computeFields: function() {
  _$jscoverage['/gregorian.js'].functionData[7]++;
  _$jscoverage['/gregorian.js'].lineData[370]++;
  var time = this.time;
  _$jscoverage['/gregorian.js'].lineData[371]++;
  var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[372]++;
  var fixedDate = toInt(timezoneOffset / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[373]++;
  var timeOfDay = timezoneOffset % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[374]++;
  fixedDate += toInt(time / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[375]++;
  timeOfDay += time % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[376]++;
  if (visit23_376_1(timeOfDay >= ONE_DAY)) {
    _$jscoverage['/gregorian.js'].lineData[377]++;
    timeOfDay -= ONE_DAY;
    _$jscoverage['/gregorian.js'].lineData[378]++;
    fixedDate++;
  } else {
    _$jscoverage['/gregorian.js'].lineData[380]++;
    while (visit24_380_1(timeOfDay < 0)) {
      _$jscoverage['/gregorian.js'].lineData[381]++;
      timeOfDay += ONE_DAY;
      _$jscoverage['/gregorian.js'].lineData[382]++;
      fixedDate--;
    }
  }
  _$jscoverage['/gregorian.js'].lineData[386]++;
  fixedDate += EPOCH_OFFSET;
  _$jscoverage['/gregorian.js'].lineData[388]++;
  var date = Utils.getGregorianDateFromFixedDate(fixedDate);
  _$jscoverage['/gregorian.js'].lineData[390]++;
  var year = date.year;
  _$jscoverage['/gregorian.js'].lineData[392]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[393]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[394]++;
  fields[MONTH] = date.month;
  _$jscoverage['/gregorian.js'].lineData[395]++;
  fields[DAY_OF_MONTH] = date.dayOfMonth;
  _$jscoverage['/gregorian.js'].lineData[396]++;
  fields[DAY_OF_WEEK] = date.dayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[398]++;
  if (visit25_398_1(timeOfDay != 0)) {
    _$jscoverage['/gregorian.js'].lineData[399]++;
    fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
    _$jscoverage['/gregorian.js'].lineData[400]++;
    var r = timeOfDay % ONE_HOUR;
    _$jscoverage['/gregorian.js'].lineData[401]++;
    fields[MINUTE] = toInt(r / ONE_MINUTE);
    _$jscoverage['/gregorian.js'].lineData[402]++;
    r %= ONE_MINUTE;
    _$jscoverage['/gregorian.js'].lineData[403]++;
    fields[SECONDS] = toInt(r / ONE_SECOND);
    _$jscoverage['/gregorian.js'].lineData[404]++;
    fields[MILLISECONDS] = r % ONE_SECOND;
  } else {
    _$jscoverage['/gregorian.js'].lineData[406]++;
    fields[HOUR_OF_DAY] = fields[MINUTE] = fields[SECONDS] = fields[MILLISECONDS] = 0;
  }
  _$jscoverage['/gregorian.js'].lineData[413]++;
  var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
  _$jscoverage['/gregorian.js'].lineData[414]++;
  var dayOfYear = fixedDate - fixedDateJan1 + 1;
  _$jscoverage['/gregorian.js'].lineData[415]++;
  var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;
  _$jscoverage['/gregorian.js'].lineData[417]++;
  fields[DAY_OF_YEAR] = dayOfYear;
  _$jscoverage['/gregorian.js'].lineData[418]++;
  fields[DAY_OF_WEEK_IN_MONTH] = toInt((date.dayOfMonth - 1) / 7) + 1;
  _$jscoverage['/gregorian.js'].lineData[420]++;
  var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[423]++;
  if (visit26_423_1(weekOfYear == 0)) {
    _$jscoverage['/gregorian.js'].lineData[427]++;
    var fixedDec31 = fixedDateJan1 - 1;
    _$jscoverage['/gregorian.js'].lineData[428]++;
    var prevJan1 = fixedDateJan1 - getYearLength(year - 1);
    _$jscoverage['/gregorian.js'].lineData[429]++;
    weekOfYear = getWeekNumber(this, prevJan1, fixedDec31);
  } else {
    _$jscoverage['/gregorian.js'].lineData[432]++;
    if (visit27_432_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[433]++;
      var nextJan1 = fixedDateJan1 + getYearLength(year);
      _$jscoverage['/gregorian.js'].lineData[434]++;
      var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
      _$jscoverage['/gregorian.js'].lineData[435]++;
      var nDays = nextJan1st - nextJan1;
      _$jscoverage['/gregorian.js'].lineData[437]++;
      if (visit28_437_1(visit29_437_2(nDays >= this.minimalDaysInFirstWeek) && visit30_439_1(fixedDate >= (nextJan1st - 7)))) {
        _$jscoverage['/gregorian.js'].lineData[441]++;
        weekOfYear = 1;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[445]++;
  fields[WEEK_OF_YEAR] = weekOfYear;
  _$jscoverage['/gregorian.js'].lineData[446]++;
  fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[448]++;
  this.fieldsComputed = true;
}, 
  'computeTime': function() {
  _$jscoverage['/gregorian.js'].functionData[8]++;
  _$jscoverage['/gregorian.js'].lineData[457]++;
  if (visit31_457_1(!this.isSet(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[458]++;
    throw new Error('year must be set for KISSY GregorianCalendar');
  }
  _$jscoverage['/gregorian.js'].lineData[461]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[463]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[464]++;
  var timeOfDay = 0;
  _$jscoverage['/gregorian.js'].lineData[465]++;
  if (visit32_465_1(this.isSet(HOUR_OF_DAY))) {
    _$jscoverage['/gregorian.js'].lineData[466]++;
    timeOfDay += fields[HOUR_OF_DAY];
  }
  _$jscoverage['/gregorian.js'].lineData[468]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[469]++;
  timeOfDay += visit33_469_1(fields[MINUTE] || 0);
  _$jscoverage['/gregorian.js'].lineData[470]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[471]++;
  timeOfDay += visit34_471_1(fields[SECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[472]++;
  timeOfDay *= 1000;
  _$jscoverage['/gregorian.js'].lineData[473]++;
  timeOfDay += visit35_473_1(fields[MILLISECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[475]++;
  var fixedDate = 0;
  _$jscoverage['/gregorian.js'].lineData[477]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[479]++;
  fixedDate = fixedDate + this.getFixedDate();
  _$jscoverage['/gregorian.js'].lineData[482]++;
  var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;
  _$jscoverage['/gregorian.js'].lineData[484]++;
  millis -= this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[486]++;
  this.time = millis;
  _$jscoverage['/gregorian.js'].lineData[488]++;
  this.computeFields();
}, 
  complete: function() {
  _$jscoverage['/gregorian.js'].functionData[9]++;
  _$jscoverage['/gregorian.js'].lineData[499]++;
  if (visit36_499_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[500]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[502]++;
  if (visit37_502_1(!this.fieldsComputed)) {
    _$jscoverage['/gregorian.js'].lineData[503]++;
    this.computeFields();
  }
}, 
  getFixedDate: function() {
  _$jscoverage['/gregorian.js'].functionData[10]++;
  _$jscoverage['/gregorian.js'].lineData[509]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[511]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[513]++;
  var firstDayOfWeekCfg = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[515]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[517]++;
  var month = GregorianCalendar.JANUARY;
  _$jscoverage['/gregorian.js'].lineData[519]++;
  if (visit38_519_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[520]++;
    month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[521]++;
    if (visit39_521_1(month > GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[522]++;
      year += toInt(month / 12);
      _$jscoverage['/gregorian.js'].lineData[523]++;
      month %= 12;
    } else {
      _$jscoverage['/gregorian.js'].lineData[524]++;
      if (visit40_524_1(month < GregorianCalendar.JANUARY)) {
        _$jscoverage['/gregorian.js'].lineData[525]++;
        year += floorDivide(month / 12);
        _$jscoverage['/gregorian.js'].lineData[526]++;
        month = mod(month, 12);
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[532]++;
  var fixedDate = Utils.getFixedDate(year, month, 1);
  _$jscoverage['/gregorian.js'].lineData[534]++;
  var dayOfWeek = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[536]++;
  if (visit41_536_1(self.isSet(DAY_OF_WEEK))) {
    _$jscoverage['/gregorian.js'].lineData[537]++;
    dayOfWeek = fields[DAY_OF_WEEK];
  }
  _$jscoverage['/gregorian.js'].lineData[540]++;
  if (visit42_540_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[541]++;
    if (visit43_541_1(self.isSet(DAY_OF_MONTH))) {
      _$jscoverage['/gregorian.js'].lineData[542]++;
      fixedDate += fields[DAY_OF_MONTH] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[544]++;
      if (visit44_544_1(self.isSet(WEEK_OF_MONTH))) {
        _$jscoverage['/gregorian.js'].lineData[545]++;
        var firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
        _$jscoverage['/gregorian.js'].lineData[549]++;
        if (visit45_549_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
          _$jscoverage['/gregorian.js'].lineData[550]++;
          firstDayOfWeek -= 7;
        }
        _$jscoverage['/gregorian.js'].lineData[553]++;
        if (visit46_553_1(dayOfWeek != firstDayOfWeekCfg)) {
          _$jscoverage['/gregorian.js'].lineData[554]++;
          firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
        }
        _$jscoverage['/gregorian.js'].lineData[557]++;
        fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_MONTH] - 1);
      } else {
        _$jscoverage['/gregorian.js'].lineData[559]++;
        var dowim;
        _$jscoverage['/gregorian.js'].lineData[560]++;
        if (visit47_560_1(self.isSet(DAY_OF_WEEK_IN_MONTH))) {
          _$jscoverage['/gregorian.js'].lineData[561]++;
          dowim = fields[DAY_OF_WEEK_IN_MONTH];
        } else {
          _$jscoverage['/gregorian.js'].lineData[563]++;
          dowim = 1;
        }
        _$jscoverage['/gregorian.js'].lineData[565]++;
        var lastDate = (7 * dowim);
        _$jscoverage['/gregorian.js'].lineData[566]++;
        if (visit48_566_1(dowim < 0)) {
          _$jscoverage['/gregorian.js'].lineData[567]++;
          lastDate = getMonthLength(year, month) + (7 * (dowim + 1));
        }
        _$jscoverage['/gregorian.js'].lineData[569]++;
        fixedDate = getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1, dayOfWeek);
      }
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[574]++;
    if (visit49_574_1(self.isSet(DAY_OF_YEAR))) {
      _$jscoverage['/gregorian.js'].lineData[575]++;
      fixedDate += fields[DAY_OF_YEAR] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[577]++;
      firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
      _$jscoverage['/gregorian.js'].lineData[580]++;
      if (visit50_580_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
        _$jscoverage['/gregorian.js'].lineData[581]++;
        firstDayOfWeek -= 7;
      }
      _$jscoverage['/gregorian.js'].lineData[583]++;
      if (visit51_583_1(dayOfWeek != firstDayOfWeekCfg)) {
        _$jscoverage['/gregorian.js'].lineData[584]++;
        firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
      }
      _$jscoverage['/gregorian.js'].lineData[586]++;
      fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[590]++;
  return fixedDate;
}, 
  getTime: function() {
  _$jscoverage['/gregorian.js'].functionData[11]++;
  _$jscoverage['/gregorian.js'].lineData[599]++;
  if (visit52_599_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[600]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[602]++;
  return this.time;
}, 
  'setTime': function(time) {
  _$jscoverage['/gregorian.js'].functionData[12]++;
  _$jscoverage['/gregorian.js'].lineData[610]++;
  this.time = time;
  _$jscoverage['/gregorian.js'].lineData[611]++;
  this.fieldsComputed = false;
  _$jscoverage['/gregorian.js'].lineData[612]++;
  this.complete();
}, 
  get: function(field) {
  _$jscoverage['/gregorian.js'].functionData[13]++;
  _$jscoverage['/gregorian.js'].lineData[621]++;
  this.complete();
  _$jscoverage['/gregorian.js'].lineData[622]++;
  return this.fields[field];
}, 
  set: function(field, v) {
  _$jscoverage['/gregorian.js'].functionData[14]++;
  _$jscoverage['/gregorian.js'].lineData[711]++;
  var len = arguments.length;
  _$jscoverage['/gregorian.js'].lineData[712]++;
  if (visit53_712_1(len == 2)) {
    _$jscoverage['/gregorian.js'].lineData[713]++;
    this.fields[field] = v;
  } else {
    _$jscoverage['/gregorian.js'].lineData[714]++;
    if (visit54_714_1(len < MILLISECONDS + 1)) {
      _$jscoverage['/gregorian.js'].lineData[715]++;
      for (var i = 0; visit55_715_1(i < len); i++) {
        _$jscoverage['/gregorian.js'].lineData[716]++;
        this.fields[YEAR + i] = arguments[i];
      }
    } else {
      _$jscoverage['/gregorian.js'].lineData[719]++;
      throw new Error('illegal arguments for KISSY GregorianCalendar set');
    }
  }
  _$jscoverage['/gregorian.js'].lineData[721]++;
  this.time = undefined;
}, 
  add: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[15]++;
  _$jscoverage['/gregorian.js'].lineData[833]++;
  if (visit56_833_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[834]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[836]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[837]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[839]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[840]++;
  if (visit57_840_1(field === YEAR)) {
    _$jscoverage['/gregorian.js'].lineData[841]++;
    value += amount;
    _$jscoverage['/gregorian.js'].lineData[842]++;
    self.set(YEAR, value);
    _$jscoverage['/gregorian.js'].lineData[843]++;
    adjustDayOfMonth(self);
  } else {
    _$jscoverage['/gregorian.js'].lineData[844]++;
    if (visit58_844_1(field === MONTH)) {
      _$jscoverage['/gregorian.js'].lineData[845]++;
      value += amount;
      _$jscoverage['/gregorian.js'].lineData[846]++;
      var yearAmount = floorDivide(value / 12);
      _$jscoverage['/gregorian.js'].lineData[847]++;
      value = mod(value, 12);
      _$jscoverage['/gregorian.js'].lineData[848]++;
      if (visit59_848_1(yearAmount)) {
        _$jscoverage['/gregorian.js'].lineData[849]++;
        self.set(YEAR, fields[YEAR] + yearAmount);
      }
      _$jscoverage['/gregorian.js'].lineData[851]++;
      self.set(MONTH, value);
      _$jscoverage['/gregorian.js'].lineData[852]++;
      adjustDayOfMonth(self);
    } else {
      _$jscoverage['/gregorian.js'].lineData[854]++;
      switch (field) {
        case HOUR_OF_DAY:
          _$jscoverage['/gregorian.js'].lineData[856]++;
          amount *= ONE_HOUR;
          _$jscoverage['/gregorian.js'].lineData[857]++;
          break;
        case MINUTE:
          _$jscoverage['/gregorian.js'].lineData[859]++;
          amount *= ONE_MINUTE;
          _$jscoverage['/gregorian.js'].lineData[860]++;
          break;
        case SECONDS:
          _$jscoverage['/gregorian.js'].lineData[862]++;
          amount *= ONE_SECOND;
          _$jscoverage['/gregorian.js'].lineData[863]++;
          break;
        case MILLISECONDS:
          _$jscoverage['/gregorian.js'].lineData[865]++;
          break;
        case WEEK_OF_MONTH:
        case WEEK_OF_YEAR:
        case DAY_OF_WEEK_IN_MONTH:
          _$jscoverage['/gregorian.js'].lineData[869]++;
          amount *= ONE_WEEK;
          _$jscoverage['/gregorian.js'].lineData[870]++;
          break;
        case DAY_OF_WEEK:
        case DAY_OF_YEAR:
        case DAY_OF_MONTH:
          _$jscoverage['/gregorian.js'].lineData[874]++;
          amount *= ONE_DAY;
          _$jscoverage['/gregorian.js'].lineData[875]++;
          break;
        default:
          _$jscoverage['/gregorian.js'].lineData[877]++;
          throw new Error('illegal field for add');
          _$jscoverage['/gregorian.js'].lineData[878]++;
          break;
      }
      _$jscoverage['/gregorian.js'].lineData[880]++;
      self.setTime(self.time + amount);
    }
  }
}, 
  getRolledValue: function(value, amount, min, max) {
  _$jscoverage['/gregorian.js'].functionData[16]++;
  _$jscoverage['/gregorian.js'].lineData[965]++;
  var diff = value - min;
  _$jscoverage['/gregorian.js'].lineData[966]++;
  var range = max - min + 1;
  _$jscoverage['/gregorian.js'].lineData[967]++;
  amount %= range;
  _$jscoverage['/gregorian.js'].lineData[968]++;
  return min + (diff + amount + range) % range;
}, 
  roll: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[17]++;
  _$jscoverage['/gregorian.js'].lineData[993]++;
  if (visit60_993_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[994]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[996]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[998]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[999]++;
  var min = self.getActualMinimum(field);
  _$jscoverage['/gregorian.js'].lineData[1000]++;
  var max = self.getActualMaximum(field);
  _$jscoverage['/gregorian.js'].lineData[1001]++;
  value = self.getRolledValue(value, amount, min, max);
  _$jscoverage['/gregorian.js'].lineData[1003]++;
  self.set(field, value);
  _$jscoverage['/gregorian.js'].lineData[1006]++;
  switch (field) {
    case MONTH:
      _$jscoverage['/gregorian.js'].lineData[1008]++;
      adjustDayOfMonth(self);
      _$jscoverage['/gregorian.js'].lineData[1009]++;
      break;
    default:
      _$jscoverage['/gregorian.js'].lineData[1012]++;
      self.updateFieldsBySet(field);
      _$jscoverage['/gregorian.js'].lineData[1013]++;
      break;
  }
}, 
  updateFieldsBySet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[18]++;
  _$jscoverage['/gregorian.js'].lineData[1098]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1099]++;
  switch (field) {
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[1101]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1102]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1104]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1105]++;
      break;
    case DAY_OF_WEEK:
      _$jscoverage['/gregorian.js'].lineData[1107]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1108]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1110]++;
      fields[DAY_OF_YEAR] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1111]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1112]++;
      break;
  }
}, 
  getTimezoneOffset: function() {
  _$jscoverage['/gregorian.js'].functionData[19]++;
  _$jscoverage['/gregorian.js'].lineData[1121]++;
  return this.timezoneOffset;
}, 
  'setTimezoneOffset': function(timezoneOffset) {
  _$jscoverage['/gregorian.js'].functionData[20]++;
  _$jscoverage['/gregorian.js'].lineData[1128]++;
  if (visit61_1128_1(this.timezoneOffset != timezoneOffset)) {
    _$jscoverage['/gregorian.js'].lineData[1129]++;
    this.fieldsComputed = undefined;
    _$jscoverage['/gregorian.js'].lineData[1130]++;
    this.timezoneOffset = timezoneOffset;
  }
}, 
  'setFirstDayOfWeek': function(firstDayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[21]++;
  _$jscoverage['/gregorian.js'].lineData[1138]++;
  if (visit62_1138_1(this.firstDayOfWeek != firstDayOfWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1139]++;
    this.firstDayOfWeek = firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[1140]++;
    this.fieldsComputed = false;
  }
}, 
  'getFirstDayOfWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[22]++;
  _$jscoverage['/gregorian.js'].lineData[1149]++;
  return this.firstDayOfWeek;
}, 
  'setMinimalDaysInFirstWeek': function(minimalDaysInFirstWeek) {
  _$jscoverage['/gregorian.js'].functionData[23]++;
  _$jscoverage['/gregorian.js'].lineData[1160]++;
  if (visit63_1160_1(this.minimalDaysInFirstWeek != minimalDaysInFirstWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1161]++;
    this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[1162]++;
    this.fieldsComputed = false;
  }
}, 
  'getMinimalDaysInFirstWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[24]++;
  _$jscoverage['/gregorian.js'].lineData[1174]++;
  return this.minimalDaysInFirstWeek;
}, 
  'getWeeksInWeekYear': function() {
  _$jscoverage['/gregorian.js'].functionData[25]++;
  _$jscoverage['/gregorian.js'].lineData[1191]++;
  var weekYear = this.getWeekYear();
  _$jscoverage['/gregorian.js'].lineData[1192]++;
  if (visit64_1192_1(weekYear == this.get(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[1193]++;
    return this.getActualMaximum(WEEK_OF_YEAR);
  }
  _$jscoverage['/gregorian.js'].lineData[1196]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1197]++;
  gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
  _$jscoverage['/gregorian.js'].lineData[1198]++;
  return gc.getActualMaximum(WEEK_OF_YEAR);
}, 
  getWeekYear: function() {
  _$jscoverage['/gregorian.js'].functionData[26]++;
  _$jscoverage['/gregorian.js'].lineData[1210]++;
  var year = this.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1211]++;
  var weekOfYear = this.get(WEEK_OF_YEAR);
  _$jscoverage['/gregorian.js'].lineData[1212]++;
  var month = this.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1213]++;
  if (visit65_1213_1(month == GregorianCalendar.JANUARY)) {
    _$jscoverage['/gregorian.js'].lineData[1214]++;
    if (visit66_1214_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[1215]++;
      --year;
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[1217]++;
    if (visit67_1217_1(month == GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[1218]++;
      if (visit68_1218_1(weekOfYear == 1)) {
        _$jscoverage['/gregorian.js'].lineData[1219]++;
        ++year;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1222]++;
  return year;
}, 
  'setWeekDate': function(weekYear, weekOfYear, dayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[27]++;
  _$jscoverage['/gregorian.js'].lineData[1234]++;
  if (visit69_1234_1(visit70_1234_2(dayOfWeek < GregorianCalendar.SUNDAY) || visit71_1234_3(dayOfWeek > GregorianCalendar.SATURDAY))) {
    _$jscoverage['/gregorian.js'].lineData[1235]++;
    throw new Error("invalid dayOfWeek: " + dayOfWeek);
  }
  _$jscoverage['/gregorian.js'].lineData[1237]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1240]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1241]++;
  gc.clear();
  _$jscoverage['/gregorian.js'].lineData[1242]++;
  gc.setTimezoneOffset(0);
  _$jscoverage['/gregorian.js'].lineData[1243]++;
  gc.set(YEAR, weekYear);
  _$jscoverage['/gregorian.js'].lineData[1244]++;
  gc.set(WEEK_OF_YEAR, 1);
  _$jscoverage['/gregorian.js'].lineData[1245]++;
  gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
  _$jscoverage['/gregorian.js'].lineData[1246]++;
  var days = dayOfWeek - this.getFirstDayOfWeek();
  _$jscoverage['/gregorian.js'].lineData[1247]++;
  if (visit72_1247_1(days < 0)) {
    _$jscoverage['/gregorian.js'].lineData[1248]++;
    days += 7;
  }
  _$jscoverage['/gregorian.js'].lineData[1250]++;
  days += 7 * (weekOfYear - 1);
  _$jscoverage['/gregorian.js'].lineData[1251]++;
  if (visit73_1251_1(days != 0)) {
    _$jscoverage['/gregorian.js'].lineData[1252]++;
    gc.add(DAY_OF_YEAR, days);
  } else {
    _$jscoverage['/gregorian.js'].lineData[1254]++;
    gc.complete();
  }
  _$jscoverage['/gregorian.js'].lineData[1256]++;
  fields[YEAR] = gc.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1257]++;
  fields[MONTH] = gc.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1258]++;
  fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
  _$jscoverage['/gregorian.js'].lineData[1259]++;
  this.complete();
}, 
  clone: function() {
  _$jscoverage['/gregorian.js'].functionData[28]++;
  _$jscoverage['/gregorian.js'].lineData[1266]++;
  if (visit74_1266_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1267]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[1269]++;
  var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/gregorian.js'].lineData[1270]++;
  cal.setTime(this.time);
  _$jscoverage['/gregorian.js'].lineData[1271]++;
  return cal;
}, 
  equals: function(obj) {
  _$jscoverage['/gregorian.js'].functionData[29]++;
  _$jscoverage['/gregorian.js'].lineData[1283]++;
  return visit75_1283_1(visit76_1283_2(this.getTime() == obj.getTime()) && visit77_1284_1(visit78_1284_2(this.firstDayOfWeek == obj.firstDayOfWeek) && visit79_1285_1(visit80_1285_2(this.timezoneOffset == obj.timezoneOffset) && visit81_1286_1(this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek))));
}, 
  clear: function(field) {
  _$jscoverage['/gregorian.js'].functionData[30]++;
  _$jscoverage['/gregorian.js'].lineData[1297]++;
  if (visit82_1297_1(field === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1298]++;
    this.field = [];
  } else {
    _$jscoverage['/gregorian.js'].lineData[1300]++;
    this.fields[field] = undefined;
  }
  _$jscoverage['/gregorian.js'].lineData[1302]++;
  this.time = undefined;
  _$jscoverage['/gregorian.js'].lineData[1303]++;
  this.fieldsComputed = false;
}};
  _$jscoverage['/gregorian.js'].lineData[1307]++;
  var GregorianCalendarProto = GregorianCalendar.prototype;
  _$jscoverage['/gregorian.js'].lineData[1309]++;
  if (visit83_1309_1('@DEBUG@')) {
    _$jscoverage['/gregorian.js'].lineData[1311]++;
    GregorianCalendarProto.getDayOfMonth = GregorianCalendarProto.getHourOfDay = GregorianCalendarProto.getWeekOfYear = GregorianCalendarProto.getWeekOfMonth = GregorianCalendarProto.getDayOfYear = GregorianCalendarProto.getDayOfWeek = GregorianCalendarProto.getDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1319]++;
    GregorianCalendarProto.addDayOfMonth = GregorianCalendarProto.addMonth = GregorianCalendarProto.addYear = GregorianCalendarProto.addMinutes = GregorianCalendarProto.addSeconds = GregorianCalendarProto.addMilliSeconds = GregorianCalendarProto.addHourOfDay = GregorianCalendarProto.addWeekOfYear = GregorianCalendarProto.addWeekOfMonth = GregorianCalendarProto.addDayOfYear = GregorianCalendarProto.addDayOfWeek = GregorianCalendarProto.addDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1332]++;
    GregorianCalendarProto.isSetDayOfMonth = GregorianCalendarProto.isSetMonth = GregorianCalendarProto.isSetYear = GregorianCalendarProto.isSetMinutes = GregorianCalendarProto.isSetSeconds = GregorianCalendarProto.isSetMilliSeconds = GregorianCalendarProto.isSetHourOfDay = GregorianCalendarProto.isSetWeekOfYear = GregorianCalendarProto.isSetWeekOfMonth = GregorianCalendarProto.isSetDayOfYear = GregorianCalendarProto.isSetDayOfWeek = GregorianCalendarProto.isSetDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1344]++;
    GregorianCalendarProto.setDayOfMonth = GregorianCalendarProto.setHourOfDay = GregorianCalendarProto.setWeekOfYear = GregorianCalendarProto.setWeekOfMonth = GregorianCalendarProto.setDayOfYear = GregorianCalendarProto.setDayOfWeek = GregorianCalendarProto.setDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1352]++;
    GregorianCalendarProto.rollDayOfMonth = GregorianCalendarProto.rollMonth = GregorianCalendarProto.rollYear = GregorianCalendarProto.rollMinutes = GregorianCalendarProto.rollSeconds = GregorianCalendarProto.rollMilliSeconds = GregorianCalendarProto.rollHourOfDay = GregorianCalendarProto.rollWeekOfYear = GregorianCalendarProto.rollWeekOfMonth = GregorianCalendarProto.rollDayOfYear = GregorianCalendarProto.rollDayOfWeek = GregorianCalendarProto.rollDayOfWeekInMonth = S.noop;
  }
  _$jscoverage['/gregorian.js'].lineData[1365]++;
  S.each(fields, function(f, index) {
  _$jscoverage['/gregorian.js'].functionData[31]++;
  _$jscoverage['/gregorian.js'].lineData[1366]++;
  if (visit84_1366_1(f)) {
    _$jscoverage['/gregorian.js'].lineData[1367]++;
    GregorianCalendarProto['get' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[32]++;
  _$jscoverage['/gregorian.js'].lineData[1368]++;
  return this.get(index);
};
    _$jscoverage['/gregorian.js'].lineData[1371]++;
    GregorianCalendarProto['isSet' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[33]++;
  _$jscoverage['/gregorian.js'].lineData[1372]++;
  return this.isSet(index);
};
    _$jscoverage['/gregorian.js'].lineData[1375]++;
    GregorianCalendarProto['set' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[34]++;
  _$jscoverage['/gregorian.js'].lineData[1376]++;
  return this.set(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1379]++;
    GregorianCalendarProto['add' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[35]++;
  _$jscoverage['/gregorian.js'].lineData[1380]++;
  return this.add(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1383]++;
    GregorianCalendarProto['roll' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[36]++;
  _$jscoverage['/gregorian.js'].lineData[1384]++;
  return this.roll(index, v);
};
  }
});
  _$jscoverage['/gregorian.js'].lineData[1392]++;
  function adjustDayOfMonth(self) {
    _$jscoverage['/gregorian.js'].functionData[37]++;
    _$jscoverage['/gregorian.js'].lineData[1393]++;
    var fields = self.fields;
    _$jscoverage['/gregorian.js'].lineData[1394]++;
    var year = fields[YEAR];
    _$jscoverage['/gregorian.js'].lineData[1395]++;
    var month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[1396]++;
    var monthLen = getMonthLength(year, month);
    _$jscoverage['/gregorian.js'].lineData[1397]++;
    var dayOfMonth = fields[DAY_OF_MONTH];
    _$jscoverage['/gregorian.js'].lineData[1398]++;
    if (visit85_1398_1(dayOfMonth > monthLen)) {
      _$jscoverage['/gregorian.js'].lineData[1399]++;
      self.set(DAY_OF_MONTH, monthLen);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1403]++;
  function getMonthLength(year, month) {
    _$jscoverage['/gregorian.js'].functionData[38]++;
    _$jscoverage['/gregorian.js'].lineData[1404]++;
    return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
  }
  _$jscoverage['/gregorian.js'].lineData[1407]++;
  function getYearLength(year) {
    _$jscoverage['/gregorian.js'].functionData[39]++;
    _$jscoverage['/gregorian.js'].lineData[1408]++;
    return isLeapYear(year) ? 366 : 365;
  }
  _$jscoverage['/gregorian.js'].lineData[1411]++;
  function getWeekNumber(self, fixedDay1, fixedDate) {
    _$jscoverage['/gregorian.js'].functionData[40]++;
    _$jscoverage['/gregorian.js'].lineData[1412]++;
    var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
    _$jscoverage['/gregorian.js'].lineData[1413]++;
    var nDays = (fixedDay1st - fixedDay1);
    _$jscoverage['/gregorian.js'].lineData[1414]++;
    if (visit86_1414_1(nDays >= self.minimalDaysInFirstWeek)) {
      _$jscoverage['/gregorian.js'].lineData[1415]++;
      fixedDay1st -= 7;
    }
    _$jscoverage['/gregorian.js'].lineData[1417]++;
    var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
    _$jscoverage['/gregorian.js'].lineData[1418]++;
    return floorDivide(normalizedDayOfPeriod / 7) + 1;
  }
  _$jscoverage['/gregorian.js'].lineData[1421]++;
  function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
    _$jscoverage['/gregorian.js'].functionData[41]++;
    _$jscoverage['/gregorian.js'].lineData[1424]++;
    return fixedDate - mod(fixedDate - dayOfWeek, 7);
  }
  _$jscoverage['/gregorian.js'].lineData[1429]++;
  return GregorianCalendar;
});
