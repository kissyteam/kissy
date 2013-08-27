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
  _$jscoverage['/gregorian.js'].lineData[5] = 0;
  _$jscoverage['/gregorian.js'].lineData[7] = 0;
  _$jscoverage['/gregorian.js'].lineData[35] = 0;
  _$jscoverage['/gregorian.js'].lineData[37] = 0;
  _$jscoverage['/gregorian.js'].lineData[39] = 0;
  _$jscoverage['/gregorian.js'].lineData[40] = 0;
  _$jscoverage['/gregorian.js'].lineData[41] = 0;
  _$jscoverage['/gregorian.js'].lineData[42] = 0;
  _$jscoverage['/gregorian.js'].lineData[43] = 0;
  _$jscoverage['/gregorian.js'].lineData[46] = 0;
  _$jscoverage['/gregorian.js'].lineData[48] = 0;
  _$jscoverage['/gregorian.js'].lineData[50] = 0;
  _$jscoverage['/gregorian.js'].lineData[57] = 0;
  _$jscoverage['/gregorian.js'].lineData[63] = 0;
  _$jscoverage['/gregorian.js'].lineData[69] = 0;
  _$jscoverage['/gregorian.js'].lineData[77] = 0;
  _$jscoverage['/gregorian.js'].lineData[79] = 0;
  _$jscoverage['/gregorian.js'].lineData[81] = 0;
  _$jscoverage['/gregorian.js'].lineData[82] = 0;
  _$jscoverage['/gregorian.js'].lineData[86] = 0;
  _$jscoverage['/gregorian.js'].lineData[88] = 0;
  _$jscoverage['/gregorian.js'].lineData[175] = 0;
  _$jscoverage['/gregorian.js'].lineData[183] = 0;
  _$jscoverage['/gregorian.js'].lineData[184] = 0;
  _$jscoverage['/gregorian.js'].lineData[185] = 0;
  _$jscoverage['/gregorian.js'].lineData[186] = 0;
  _$jscoverage['/gregorian.js'].lineData[187] = 0;
  _$jscoverage['/gregorian.js'].lineData[188] = 0;
  _$jscoverage['/gregorian.js'].lineData[190] = 0;
  _$jscoverage['/gregorian.js'].lineData[191] = 0;
  _$jscoverage['/gregorian.js'].lineData[192] = 0;
  _$jscoverage['/gregorian.js'].lineData[193] = 0;
  _$jscoverage['/gregorian.js'].lineData[195] = 0;
  _$jscoverage['/gregorian.js'].lineData[196] = 0;
  _$jscoverage['/gregorian.js'].lineData[198] = 0;
  _$jscoverage['/gregorian.js'].lineData[199] = 0;
  _$jscoverage['/gregorian.js'].lineData[201] = 0;
  _$jscoverage['/gregorian.js'].lineData[202] = 0;
  _$jscoverage['/gregorian.js'].lineData[203] = 0;
  _$jscoverage['/gregorian.js'].lineData[204] = 0;
  _$jscoverage['/gregorian.js'].lineData[205] = 0;
  _$jscoverage['/gregorian.js'].lineData[207] = 0;
  _$jscoverage['/gregorian.js'].lineData[209] = 0;
  _$jscoverage['/gregorian.js'].lineData[214] = 0;
  _$jscoverage['/gregorian.js'].lineData[232] = 0;
  _$jscoverage['/gregorian.js'].lineData[248] = 0;
  _$jscoverage['/gregorian.js'].lineData[260] = 0;
  _$jscoverage['/gregorian.js'].lineData[268] = 0;
  _$jscoverage['/gregorian.js'].lineData[282] = 0;
  _$jscoverage['/gregorian.js'].lineData[283] = 0;
  _$jscoverage['/gregorian.js'].lineData[286] = 0;
  _$jscoverage['/gregorian.js'].lineData[287] = 0;
  _$jscoverage['/gregorian.js'].lineData[288] = 0;
  _$jscoverage['/gregorian.js'].lineData[289] = 0;
  _$jscoverage['/gregorian.js'].lineData[292] = 0;
  _$jscoverage['/gregorian.js'].lineData[305] = 0;
  _$jscoverage['/gregorian.js'].lineData[306] = 0;
  _$jscoverage['/gregorian.js'].lineData[308] = 0;
  _$jscoverage['/gregorian.js'].lineData[310] = 0;
  _$jscoverage['/gregorian.js'].lineData[312] = 0;
  _$jscoverage['/gregorian.js'].lineData[313] = 0;
  _$jscoverage['/gregorian.js'].lineData[316] = 0;
  _$jscoverage['/gregorian.js'].lineData[317] = 0;
  _$jscoverage['/gregorian.js'].lineData[318] = 0;
  _$jscoverage['/gregorian.js'].lineData[319] = 0;
  _$jscoverage['/gregorian.js'].lineData[321] = 0;
  _$jscoverage['/gregorian.js'].lineData[324] = 0;
  _$jscoverage['/gregorian.js'].lineData[325] = 0;
  _$jscoverage['/gregorian.js'].lineData[326] = 0;
  _$jscoverage['/gregorian.js'].lineData[329] = 0;
  _$jscoverage['/gregorian.js'].lineData[330] = 0;
  _$jscoverage['/gregorian.js'].lineData[333] = 0;
  _$jscoverage['/gregorian.js'].lineData[334] = 0;
  _$jscoverage['/gregorian.js'].lineData[336] = 0;
  _$jscoverage['/gregorian.js'].lineData[337] = 0;
  _$jscoverage['/gregorian.js'].lineData[339] = 0;
  _$jscoverage['/gregorian.js'].lineData[350] = 0;
  _$jscoverage['/gregorian.js'].lineData[359] = 0;
  _$jscoverage['/gregorian.js'].lineData[360] = 0;
  _$jscoverage['/gregorian.js'].lineData[361] = 0;
  _$jscoverage['/gregorian.js'].lineData[362] = 0;
  _$jscoverage['/gregorian.js'].lineData[363] = 0;
  _$jscoverage['/gregorian.js'].lineData[364] = 0;
  _$jscoverage['/gregorian.js'].lineData[365] = 0;
  _$jscoverage['/gregorian.js'].lineData[366] = 0;
  _$jscoverage['/gregorian.js'].lineData[367] = 0;
  _$jscoverage['/gregorian.js'].lineData[369] = 0;
  _$jscoverage['/gregorian.js'].lineData[370] = 0;
  _$jscoverage['/gregorian.js'].lineData[371] = 0;
  _$jscoverage['/gregorian.js'].lineData[375] = 0;
  _$jscoverage['/gregorian.js'].lineData[377] = 0;
  _$jscoverage['/gregorian.js'].lineData[379] = 0;
  _$jscoverage['/gregorian.js'].lineData[381] = 0;
  _$jscoverage['/gregorian.js'].lineData[382] = 0;
  _$jscoverage['/gregorian.js'].lineData[383] = 0;
  _$jscoverage['/gregorian.js'].lineData[384] = 0;
  _$jscoverage['/gregorian.js'].lineData[385] = 0;
  _$jscoverage['/gregorian.js'].lineData[387] = 0;
  _$jscoverage['/gregorian.js'].lineData[388] = 0;
  _$jscoverage['/gregorian.js'].lineData[389] = 0;
  _$jscoverage['/gregorian.js'].lineData[390] = 0;
  _$jscoverage['/gregorian.js'].lineData[391] = 0;
  _$jscoverage['/gregorian.js'].lineData[392] = 0;
  _$jscoverage['/gregorian.js'].lineData[393] = 0;
  _$jscoverage['/gregorian.js'].lineData[395] = 0;
  _$jscoverage['/gregorian.js'].lineData[402] = 0;
  _$jscoverage['/gregorian.js'].lineData[403] = 0;
  _$jscoverage['/gregorian.js'].lineData[404] = 0;
  _$jscoverage['/gregorian.js'].lineData[406] = 0;
  _$jscoverage['/gregorian.js'].lineData[407] = 0;
  _$jscoverage['/gregorian.js'].lineData[409] = 0;
  _$jscoverage['/gregorian.js'].lineData[412] = 0;
  _$jscoverage['/gregorian.js'].lineData[416] = 0;
  _$jscoverage['/gregorian.js'].lineData[417] = 0;
  _$jscoverage['/gregorian.js'].lineData[418] = 0;
  _$jscoverage['/gregorian.js'].lineData[421] = 0;
  _$jscoverage['/gregorian.js'].lineData[422] = 0;
  _$jscoverage['/gregorian.js'].lineData[423] = 0;
  _$jscoverage['/gregorian.js'].lineData[424] = 0;
  _$jscoverage['/gregorian.js'].lineData[426] = 0;
  _$jscoverage['/gregorian.js'].lineData[430] = 0;
  _$jscoverage['/gregorian.js'].lineData[434] = 0;
  _$jscoverage['/gregorian.js'].lineData[435] = 0;
  _$jscoverage['/gregorian.js'].lineData[437] = 0;
  _$jscoverage['/gregorian.js'].lineData[446] = 0;
  _$jscoverage['/gregorian.js'].lineData[447] = 0;
  _$jscoverage['/gregorian.js'].lineData[450] = 0;
  _$jscoverage['/gregorian.js'].lineData[452] = 0;
  _$jscoverage['/gregorian.js'].lineData[453] = 0;
  _$jscoverage['/gregorian.js'].lineData[454] = 0;
  _$jscoverage['/gregorian.js'].lineData[455] = 0;
  _$jscoverage['/gregorian.js'].lineData[457] = 0;
  _$jscoverage['/gregorian.js'].lineData[458] = 0;
  _$jscoverage['/gregorian.js'].lineData[459] = 0;
  _$jscoverage['/gregorian.js'].lineData[460] = 0;
  _$jscoverage['/gregorian.js'].lineData[461] = 0;
  _$jscoverage['/gregorian.js'].lineData[462] = 0;
  _$jscoverage['/gregorian.js'].lineData[464] = 0;
  _$jscoverage['/gregorian.js'].lineData[466] = 0;
  _$jscoverage['/gregorian.js'].lineData[468] = 0;
  _$jscoverage['/gregorian.js'].lineData[471] = 0;
  _$jscoverage['/gregorian.js'].lineData[473] = 0;
  _$jscoverage['/gregorian.js'].lineData[475] = 0;
  _$jscoverage['/gregorian.js'].lineData[477] = 0;
  _$jscoverage['/gregorian.js'].lineData[488] = 0;
  _$jscoverage['/gregorian.js'].lineData[489] = 0;
  _$jscoverage['/gregorian.js'].lineData[491] = 0;
  _$jscoverage['/gregorian.js'].lineData[492] = 0;
  _$jscoverage['/gregorian.js'].lineData[498] = 0;
  _$jscoverage['/gregorian.js'].lineData[500] = 0;
  _$jscoverage['/gregorian.js'].lineData[502] = 0;
  _$jscoverage['/gregorian.js'].lineData[504] = 0;
  _$jscoverage['/gregorian.js'].lineData[506] = 0;
  _$jscoverage['/gregorian.js'].lineData[508] = 0;
  _$jscoverage['/gregorian.js'].lineData[509] = 0;
  _$jscoverage['/gregorian.js'].lineData[510] = 0;
  _$jscoverage['/gregorian.js'].lineData[511] = 0;
  _$jscoverage['/gregorian.js'].lineData[512] = 0;
  _$jscoverage['/gregorian.js'].lineData[513] = 0;
  _$jscoverage['/gregorian.js'].lineData[514] = 0;
  _$jscoverage['/gregorian.js'].lineData[515] = 0;
  _$jscoverage['/gregorian.js'].lineData[521] = 0;
  _$jscoverage['/gregorian.js'].lineData[523] = 0;
  _$jscoverage['/gregorian.js'].lineData[525] = 0;
  _$jscoverage['/gregorian.js'].lineData[526] = 0;
  _$jscoverage['/gregorian.js'].lineData[529] = 0;
  _$jscoverage['/gregorian.js'].lineData[530] = 0;
  _$jscoverage['/gregorian.js'].lineData[531] = 0;
  _$jscoverage['/gregorian.js'].lineData[533] = 0;
  _$jscoverage['/gregorian.js'].lineData[534] = 0;
  _$jscoverage['/gregorian.js'].lineData[538] = 0;
  _$jscoverage['/gregorian.js'].lineData[539] = 0;
  _$jscoverage['/gregorian.js'].lineData[542] = 0;
  _$jscoverage['/gregorian.js'].lineData[543] = 0;
  _$jscoverage['/gregorian.js'].lineData[546] = 0;
  _$jscoverage['/gregorian.js'].lineData[548] = 0;
  _$jscoverage['/gregorian.js'].lineData[549] = 0;
  _$jscoverage['/gregorian.js'].lineData[550] = 0;
  _$jscoverage['/gregorian.js'].lineData[552] = 0;
  _$jscoverage['/gregorian.js'].lineData[554] = 0;
  _$jscoverage['/gregorian.js'].lineData[555] = 0;
  _$jscoverage['/gregorian.js'].lineData[556] = 0;
  _$jscoverage['/gregorian.js'].lineData[558] = 0;
  _$jscoverage['/gregorian.js'].lineData[563] = 0;
  _$jscoverage['/gregorian.js'].lineData[564] = 0;
  _$jscoverage['/gregorian.js'].lineData[566] = 0;
  _$jscoverage['/gregorian.js'].lineData[569] = 0;
  _$jscoverage['/gregorian.js'].lineData[570] = 0;
  _$jscoverage['/gregorian.js'].lineData[572] = 0;
  _$jscoverage['/gregorian.js'].lineData[573] = 0;
  _$jscoverage['/gregorian.js'].lineData[575] = 0;
  _$jscoverage['/gregorian.js'].lineData[579] = 0;
  _$jscoverage['/gregorian.js'].lineData[588] = 0;
  _$jscoverage['/gregorian.js'].lineData[589] = 0;
  _$jscoverage['/gregorian.js'].lineData[591] = 0;
  _$jscoverage['/gregorian.js'].lineData[599] = 0;
  _$jscoverage['/gregorian.js'].lineData[600] = 0;
  _$jscoverage['/gregorian.js'].lineData[601] = 0;
  _$jscoverage['/gregorian.js'].lineData[610] = 0;
  _$jscoverage['/gregorian.js'].lineData[611] = 0;
  _$jscoverage['/gregorian.js'].lineData[698] = 0;
  _$jscoverage['/gregorian.js'].lineData[699] = 0;
  _$jscoverage['/gregorian.js'].lineData[700] = 0;
  _$jscoverage['/gregorian.js'].lineData[701] = 0;
  _$jscoverage['/gregorian.js'].lineData[702] = 0;
  _$jscoverage['/gregorian.js'].lineData[703] = 0;
  _$jscoverage['/gregorian.js'].lineData[706] = 0;
  _$jscoverage['/gregorian.js'].lineData[708] = 0;
  _$jscoverage['/gregorian.js'].lineData[818] = 0;
  _$jscoverage['/gregorian.js'].lineData[819] = 0;
  _$jscoverage['/gregorian.js'].lineData[821] = 0;
  _$jscoverage['/gregorian.js'].lineData[822] = 0;
  _$jscoverage['/gregorian.js'].lineData[824] = 0;
  _$jscoverage['/gregorian.js'].lineData[825] = 0;
  _$jscoverage['/gregorian.js'].lineData[826] = 0;
  _$jscoverage['/gregorian.js'].lineData[827] = 0;
  _$jscoverage['/gregorian.js'].lineData[828] = 0;
  _$jscoverage['/gregorian.js'].lineData[829] = 0;
  _$jscoverage['/gregorian.js'].lineData[830] = 0;
  _$jscoverage['/gregorian.js'].lineData[831] = 0;
  _$jscoverage['/gregorian.js'].lineData[832] = 0;
  _$jscoverage['/gregorian.js'].lineData[833] = 0;
  _$jscoverage['/gregorian.js'].lineData[834] = 0;
  _$jscoverage['/gregorian.js'].lineData[836] = 0;
  _$jscoverage['/gregorian.js'].lineData[837] = 0;
  _$jscoverage['/gregorian.js'].lineData[839] = 0;
  _$jscoverage['/gregorian.js'].lineData[841] = 0;
  _$jscoverage['/gregorian.js'].lineData[842] = 0;
  _$jscoverage['/gregorian.js'].lineData[844] = 0;
  _$jscoverage['/gregorian.js'].lineData[845] = 0;
  _$jscoverage['/gregorian.js'].lineData[847] = 0;
  _$jscoverage['/gregorian.js'].lineData[848] = 0;
  _$jscoverage['/gregorian.js'].lineData[850] = 0;
  _$jscoverage['/gregorian.js'].lineData[854] = 0;
  _$jscoverage['/gregorian.js'].lineData[855] = 0;
  _$jscoverage['/gregorian.js'].lineData[859] = 0;
  _$jscoverage['/gregorian.js'].lineData[860] = 0;
  _$jscoverage['/gregorian.js'].lineData[862] = 0;
  _$jscoverage['/gregorian.js'].lineData[863] = 0;
  _$jscoverage['/gregorian.js'].lineData[865] = 0;
  _$jscoverage['/gregorian.js'].lineData[950] = 0;
  _$jscoverage['/gregorian.js'].lineData[951] = 0;
  _$jscoverage['/gregorian.js'].lineData[952] = 0;
  _$jscoverage['/gregorian.js'].lineData[953] = 0;
  _$jscoverage['/gregorian.js'].lineData[979] = 0;
  _$jscoverage['/gregorian.js'].lineData[980] = 0;
  _$jscoverage['/gregorian.js'].lineData[982] = 0;
  _$jscoverage['/gregorian.js'].lineData[984] = 0;
  _$jscoverage['/gregorian.js'].lineData[985] = 0;
  _$jscoverage['/gregorian.js'].lineData[986] = 0;
  _$jscoverage['/gregorian.js'].lineData[987] = 0;
  _$jscoverage['/gregorian.js'].lineData[989] = 0;
  _$jscoverage['/gregorian.js'].lineData[992] = 0;
  _$jscoverage['/gregorian.js'].lineData[994] = 0;
  _$jscoverage['/gregorian.js'].lineData[995] = 0;
  _$jscoverage['/gregorian.js'].lineData[998] = 0;
  _$jscoverage['/gregorian.js'].lineData[999] = 0;
  _$jscoverage['/gregorian.js'].lineData[1084] = 0;
  _$jscoverage['/gregorian.js'].lineData[1085] = 0;
  _$jscoverage['/gregorian.js'].lineData[1087] = 0;
  _$jscoverage['/gregorian.js'].lineData[1088] = 0;
  _$jscoverage['/gregorian.js'].lineData[1090] = 0;
  _$jscoverage['/gregorian.js'].lineData[1091] = 0;
  _$jscoverage['/gregorian.js'].lineData[1093] = 0;
  _$jscoverage['/gregorian.js'].lineData[1094] = 0;
  _$jscoverage['/gregorian.js'].lineData[1096] = 0;
  _$jscoverage['/gregorian.js'].lineData[1097] = 0;
  _$jscoverage['/gregorian.js'].lineData[1098] = 0;
  _$jscoverage['/gregorian.js'].lineData[1107] = 0;
  _$jscoverage['/gregorian.js'].lineData[1114] = 0;
  _$jscoverage['/gregorian.js'].lineData[1115] = 0;
  _$jscoverage['/gregorian.js'].lineData[1116] = 0;
  _$jscoverage['/gregorian.js'].lineData[1124] = 0;
  _$jscoverage['/gregorian.js'].lineData[1125] = 0;
  _$jscoverage['/gregorian.js'].lineData[1126] = 0;
  _$jscoverage['/gregorian.js'].lineData[1135] = 0;
  _$jscoverage['/gregorian.js'].lineData[1146] = 0;
  _$jscoverage['/gregorian.js'].lineData[1147] = 0;
  _$jscoverage['/gregorian.js'].lineData[1148] = 0;
  _$jscoverage['/gregorian.js'].lineData[1160] = 0;
  _$jscoverage['/gregorian.js'].lineData[1177] = 0;
  _$jscoverage['/gregorian.js'].lineData[1178] = 0;
  _$jscoverage['/gregorian.js'].lineData[1179] = 0;
  _$jscoverage['/gregorian.js'].lineData[1182] = 0;
  _$jscoverage['/gregorian.js'].lineData[1183] = 0;
  _$jscoverage['/gregorian.js'].lineData[1184] = 0;
  _$jscoverage['/gregorian.js'].lineData[1196] = 0;
  _$jscoverage['/gregorian.js'].lineData[1197] = 0;
  _$jscoverage['/gregorian.js'].lineData[1198] = 0;
  _$jscoverage['/gregorian.js'].lineData[1199] = 0;
  _$jscoverage['/gregorian.js'].lineData[1200] = 0;
  _$jscoverage['/gregorian.js'].lineData[1201] = 0;
  _$jscoverage['/gregorian.js'].lineData[1203] = 0;
  _$jscoverage['/gregorian.js'].lineData[1204] = 0;
  _$jscoverage['/gregorian.js'].lineData[1205] = 0;
  _$jscoverage['/gregorian.js'].lineData[1208] = 0;
  _$jscoverage['/gregorian.js'].lineData[1221] = 0;
  _$jscoverage['/gregorian.js'].lineData[1222] = 0;
  _$jscoverage['/gregorian.js'].lineData[1224] = 0;
  _$jscoverage['/gregorian.js'].lineData[1227] = 0;
  _$jscoverage['/gregorian.js'].lineData[1228] = 0;
  _$jscoverage['/gregorian.js'].lineData[1229] = 0;
  _$jscoverage['/gregorian.js'].lineData[1230] = 0;
  _$jscoverage['/gregorian.js'].lineData[1231] = 0;
  _$jscoverage['/gregorian.js'].lineData[1232] = 0;
  _$jscoverage['/gregorian.js'].lineData[1233] = 0;
  _$jscoverage['/gregorian.js'].lineData[1234] = 0;
  _$jscoverage['/gregorian.js'].lineData[1235] = 0;
  _$jscoverage['/gregorian.js'].lineData[1237] = 0;
  _$jscoverage['/gregorian.js'].lineData[1238] = 0;
  _$jscoverage['/gregorian.js'].lineData[1239] = 0;
  _$jscoverage['/gregorian.js'].lineData[1241] = 0;
  _$jscoverage['/gregorian.js'].lineData[1243] = 0;
  _$jscoverage['/gregorian.js'].lineData[1244] = 0;
  _$jscoverage['/gregorian.js'].lineData[1245] = 0;
  _$jscoverage['/gregorian.js'].lineData[1246] = 0;
  _$jscoverage['/gregorian.js'].lineData[1253] = 0;
  _$jscoverage['/gregorian.js'].lineData[1254] = 0;
  _$jscoverage['/gregorian.js'].lineData[1256] = 0;
  _$jscoverage['/gregorian.js'].lineData[1257] = 0;
  _$jscoverage['/gregorian.js'].lineData[1258] = 0;
  _$jscoverage['/gregorian.js'].lineData[1270] = 0;
  _$jscoverage['/gregorian.js'].lineData[1284] = 0;
  _$jscoverage['/gregorian.js'].lineData[1285] = 0;
  _$jscoverage['/gregorian.js'].lineData[1287] = 0;
  _$jscoverage['/gregorian.js'].lineData[1289] = 0;
  _$jscoverage['/gregorian.js'].lineData[1290] = 0;
  _$jscoverage['/gregorian.js'].lineData[1294] = 0;
  _$jscoverage['/gregorian.js'].lineData[1296] = 0;
  _$jscoverage['/gregorian.js'].lineData[1298] = 0;
  _$jscoverage['/gregorian.js'].lineData[1306] = 0;
  _$jscoverage['/gregorian.js'].lineData[1319] = 0;
  _$jscoverage['/gregorian.js'].lineData[1331] = 0;
  _$jscoverage['/gregorian.js'].lineData[1339] = 0;
  _$jscoverage['/gregorian.js'].lineData[1352] = 0;
  _$jscoverage['/gregorian.js'].lineData[1353] = 0;
  _$jscoverage['/gregorian.js'].lineData[1354] = 0;
  _$jscoverage['/gregorian.js'].lineData[1355] = 0;
  _$jscoverage['/gregorian.js'].lineData[1358] = 0;
  _$jscoverage['/gregorian.js'].lineData[1359] = 0;
  _$jscoverage['/gregorian.js'].lineData[1362] = 0;
  _$jscoverage['/gregorian.js'].lineData[1363] = 0;
  _$jscoverage['/gregorian.js'].lineData[1366] = 0;
  _$jscoverage['/gregorian.js'].lineData[1367] = 0;
  _$jscoverage['/gregorian.js'].lineData[1370] = 0;
  _$jscoverage['/gregorian.js'].lineData[1371] = 0;
  _$jscoverage['/gregorian.js'].lineData[1379] = 0;
  _$jscoverage['/gregorian.js'].lineData[1380] = 0;
  _$jscoverage['/gregorian.js'].lineData[1381] = 0;
  _$jscoverage['/gregorian.js'].lineData[1382] = 0;
  _$jscoverage['/gregorian.js'].lineData[1383] = 0;
  _$jscoverage['/gregorian.js'].lineData[1384] = 0;
  _$jscoverage['/gregorian.js'].lineData[1385] = 0;
  _$jscoverage['/gregorian.js'].lineData[1386] = 0;
  _$jscoverage['/gregorian.js'].lineData[1390] = 0;
  _$jscoverage['/gregorian.js'].lineData[1391] = 0;
  _$jscoverage['/gregorian.js'].lineData[1394] = 0;
  _$jscoverage['/gregorian.js'].lineData[1395] = 0;
  _$jscoverage['/gregorian.js'].lineData[1398] = 0;
  _$jscoverage['/gregorian.js'].lineData[1399] = 0;
  _$jscoverage['/gregorian.js'].lineData[1400] = 0;
  _$jscoverage['/gregorian.js'].lineData[1401] = 0;
  _$jscoverage['/gregorian.js'].lineData[1402] = 0;
  _$jscoverage['/gregorian.js'].lineData[1404] = 0;
  _$jscoverage['/gregorian.js'].lineData[1405] = 0;
  _$jscoverage['/gregorian.js'].lineData[1408] = 0;
  _$jscoverage['/gregorian.js'].lineData[1411] = 0;
  _$jscoverage['/gregorian.js'].lineData[1416] = 0;
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
  _$jscoverage['/gregorian.js'].branchData['39'] = [];
  _$jscoverage['/gregorian.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['42'] = [];
  _$jscoverage['/gregorian.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['46'] = [];
  _$jscoverage['/gregorian.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['63'] = [];
  _$jscoverage['/gregorian.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['81'] = [];
  _$jscoverage['/gregorian.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['282'] = [];
  _$jscoverage['/gregorian.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['287'] = [];
  _$jscoverage['/gregorian.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['305'] = [];
  _$jscoverage['/gregorian.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['318'] = [];
  _$jscoverage['/gregorian.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['336'] = [];
  _$jscoverage['/gregorian.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['350'] = [];
  _$jscoverage['/gregorian.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['365'] = [];
  _$jscoverage['/gregorian.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['369'] = [];
  _$jscoverage['/gregorian.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['387'] = [];
  _$jscoverage['/gregorian.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['412'] = [];
  _$jscoverage['/gregorian.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['421'] = [];
  _$jscoverage['/gregorian.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['426'] = [];
  _$jscoverage['/gregorian.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['426'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['428'] = [];
  _$jscoverage['/gregorian.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['446'] = [];
  _$jscoverage['/gregorian.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['454'] = [];
  _$jscoverage['/gregorian.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['458'] = [];
  _$jscoverage['/gregorian.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['460'] = [];
  _$jscoverage['/gregorian.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['462'] = [];
  _$jscoverage['/gregorian.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['488'] = [];
  _$jscoverage['/gregorian.js'].branchData['488'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['491'] = [];
  _$jscoverage['/gregorian.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['508'] = [];
  _$jscoverage['/gregorian.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['510'] = [];
  _$jscoverage['/gregorian.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['513'] = [];
  _$jscoverage['/gregorian.js'].branchData['513'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['525'] = [];
  _$jscoverage['/gregorian.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['529'] = [];
  _$jscoverage['/gregorian.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['530'] = [];
  _$jscoverage['/gregorian.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['533'] = [];
  _$jscoverage['/gregorian.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['538'] = [];
  _$jscoverage['/gregorian.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['542'] = [];
  _$jscoverage['/gregorian.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['549'] = [];
  _$jscoverage['/gregorian.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['555'] = [];
  _$jscoverage['/gregorian.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['563'] = [];
  _$jscoverage['/gregorian.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['569'] = [];
  _$jscoverage['/gregorian.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['572'] = [];
  _$jscoverage['/gregorian.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['588'] = [];
  _$jscoverage['/gregorian.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['699'] = [];
  _$jscoverage['/gregorian.js'].branchData['699'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['701'] = [];
  _$jscoverage['/gregorian.js'].branchData['701'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['702'] = [];
  _$jscoverage['/gregorian.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['818'] = [];
  _$jscoverage['/gregorian.js'].branchData['818'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['825'] = [];
  _$jscoverage['/gregorian.js'].branchData['825'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['829'] = [];
  _$jscoverage['/gregorian.js'].branchData['829'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['833'] = [];
  _$jscoverage['/gregorian.js'].branchData['833'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['979'] = [];
  _$jscoverage['/gregorian.js'].branchData['979'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1114'] = [];
  _$jscoverage['/gregorian.js'].branchData['1114'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1124'] = [];
  _$jscoverage['/gregorian.js'].branchData['1124'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1146'] = [];
  _$jscoverage['/gregorian.js'].branchData['1146'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1178'] = [];
  _$jscoverage['/gregorian.js'].branchData['1178'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1199'] = [];
  _$jscoverage['/gregorian.js'].branchData['1199'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1200'] = [];
  _$jscoverage['/gregorian.js'].branchData['1200'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1203'] = [];
  _$jscoverage['/gregorian.js'].branchData['1203'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1204'] = [];
  _$jscoverage['/gregorian.js'].branchData['1204'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1221'] = [];
  _$jscoverage['/gregorian.js'].branchData['1221'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1221'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1221'][3] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1234'] = [];
  _$jscoverage['/gregorian.js'].branchData['1234'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1238'] = [];
  _$jscoverage['/gregorian.js'].branchData['1238'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1253'] = [];
  _$jscoverage['/gregorian.js'].branchData['1253'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1270'] = [];
  _$jscoverage['/gregorian.js'].branchData['1270'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1270'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1271'] = [];
  _$jscoverage['/gregorian.js'].branchData['1271'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1271'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1272'] = [];
  _$jscoverage['/gregorian.js'].branchData['1272'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1272'][2] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1273'] = [];
  _$jscoverage['/gregorian.js'].branchData['1273'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1284'] = [];
  _$jscoverage['/gregorian.js'].branchData['1284'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1296'] = [];
  _$jscoverage['/gregorian.js'].branchData['1296'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1353'] = [];
  _$jscoverage['/gregorian.js'].branchData['1353'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1385'] = [];
  _$jscoverage['/gregorian.js'].branchData['1385'][1] = new BranchData();
  _$jscoverage['/gregorian.js'].branchData['1401'] = [];
  _$jscoverage['/gregorian.js'].branchData['1401'][1] = new BranchData();
}
_$jscoverage['/gregorian.js'].branchData['1401'][1].init(153, 36, 'nDays >= self.minimalDaysInFirstWeek');
function visit86_1401_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1401'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1385'][1].init(220, 21, 'dayOfMonth > monthLen');
function visit85_1385_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1385'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1353'][1].init(14, 1, 'f');
function visit84_1353_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1353'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1296'][1].init(45467, 9, '\'@DEBUG@\'');
function visit83_1296_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1296'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1284'][1].init(18, 19, 'field === undefined');
function visit82_1284_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1284'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1273'][1].init(61, 57, 'this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit81_1273_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1273'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1272'][2].init(138, 41, 'this.timezoneOffset == obj.timezoneOffset');
function visit80_1272_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1272'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1272'][1].init(61, 119, 'this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit79_1272_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1272'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1271'][2].init(75, 41, 'this.firstDayOfWeek == obj.firstDayOfWeek');
function visit78_1271_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1271'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1271'][1].init(51, 181, 'this.firstDayOfWeek == obj.firstDayOfWeek && this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit77_1271_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1271'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1270'][2].init(21, 31, 'this.getTime() == obj.getTime()');
function visit76_1270_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1270'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1270'][1].init(21, 233, 'this.getTime() == obj.getTime() && this.firstDayOfWeek == obj.firstDayOfWeek && this.timezoneOffset == obj.timezoneOffset && this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek');
function visit75_1270_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1270'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1253'][1].init(18, 23, 'this.time === undefined');
function visit74_1253_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1253'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1238'][1].init(782, 9, 'days != 0');
function visit73_1238_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1238'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1234'][1].init(667, 8, 'days < 0');
function visit72_1234_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1234'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1221'][3].init(58, 38, 'dayOfWeek > GregorianCalendar.SATURDAY');
function visit71_1221_3(result) {
  _$jscoverage['/gregorian.js'].branchData['1221'][3].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1221'][2].init(18, 36, 'dayOfWeek < GregorianCalendar.SUNDAY');
function visit70_1221_2(result) {
  _$jscoverage['/gregorian.js'].branchData['1221'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1221'][1].init(18, 78, 'dayOfWeek < GregorianCalendar.SUNDAY || dayOfWeek > GregorianCalendar.SATURDAY');
function visit69_1221_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1221'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1204'][1].init(22, 15, 'weekOfYear == 1');
function visit68_1204_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1204'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1203'][1].init(330, 35, 'month == GregorianCalendar.DECEMBER');
function visit67_1203_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1203'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1200'][1].init(22, 16, 'weekOfYear >= 52');
function visit66_1200_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1200'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1199'][1].init(178, 34, 'month == GregorianCalendar.JANUARY');
function visit65_1199_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1199'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1178'][1].init(66, 26, 'weekYear == this.get(YEAR)');
function visit64_1178_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1178'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1146'][1].init(18, 53, 'this.minimalDaysInFirstWeek != minimalDaysInFirstWeek');
function visit63_1146_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1146'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1124'][1].init(18, 37, 'this.firstDayOfWeek != firstDayOfWeek');
function visit62_1124_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1124'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['1114'][1].init(18, 37, 'this.timezoneOffset != timezoneOffset');
function visit61_1114_1(result) {
  _$jscoverage['/gregorian.js'].branchData['1114'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['979'][1].init(18, 7, '!amount');
function visit60_979_1(result) {
  _$jscoverage['/gregorian.js'].branchData['979'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['833'][1].init(156, 10, 'yearAmount');
function visit59_833_1(result) {
  _$jscoverage['/gregorian.js'].branchData['833'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['829'][1].init(408, 15, 'field === MONTH');
function visit58_829_1(result) {
  _$jscoverage['/gregorian.js'].branchData['829'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['825'][1].init(250, 14, 'field === YEAR');
function visit57_825_1(result) {
  _$jscoverage['/gregorian.js'].branchData['825'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['818'][1].init(18, 7, '!amount');
function visit56_818_1(result) {
  _$jscoverage['/gregorian.js'].branchData['818'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['702'][1].init(34, 7, 'i < len');
function visit55_702_1(result) {
  _$jscoverage['/gregorian.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['701'][1].init(137, 22, 'len < MILLISECONDS + 1');
function visit54_701_1(result) {
  _$jscoverage['/gregorian.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['699'][1].init(59, 8, 'len == 2');
function visit53_699_1(result) {
  _$jscoverage['/gregorian.js'].branchData['699'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['588'][1].init(18, 23, 'this.time === undefined');
function visit52_588_1(result) {
  _$jscoverage['/gregorian.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['572'][1].init(405, 30, 'dayOfWeek != firstDayOfWeekCfg');
function visit51_572_1(result) {
  _$jscoverage['/gregorian.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['569'][1].init(249, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit50_569_1(result) {
  _$jscoverage['/gregorian.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['563'][1].init(79, 23, 'self.isSet(DAY_OF_YEAR)');
function visit49_563_1(result) {
  _$jscoverage['/gregorian.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['555'][1].init(352, 9, 'dowim < 0');
function visit48_555_1(result) {
  _$jscoverage['/gregorian.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['549'][1].init(66, 32, 'self.isSet(DAY_OF_WEEK_IN_MONTH)');
function visit47_549_1(result) {
  _$jscoverage['/gregorian.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['542'][1].init(441, 30, 'dayOfWeek != firstDayOfWeekCfg');
function visit46_542_1(result) {
  _$jscoverage['/gregorian.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['538'][1].init(271, 58, '(firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek');
function visit45_538_1(result) {
  _$jscoverage['/gregorian.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['533'][1].init(26, 25, 'self.isSet(WEEK_OF_MONTH)');
function visit44_533_1(result) {
  _$jscoverage['/gregorian.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['530'][1].init(22, 24, 'self.isSet(DAY_OF_MONTH)');
function visit43_530_1(result) {
  _$jscoverage['/gregorian.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['529'][1].init(1039, 17, 'self.isSet(MONTH)');
function visit42_529_1(result) {
  _$jscoverage['/gregorian.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['525'][1].init(928, 23, 'self.isSet(DAY_OF_WEEK)');
function visit41_525_1(result) {
  _$jscoverage['/gregorian.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['513'][1].init(211, 33, 'month < GregorianCalendar.JANUARY');
function visit40_513_1(result) {
  _$jscoverage['/gregorian.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['510'][1].init(62, 34, 'month > GregorianCalendar.DECEMBER');
function visit39_510_1(result) {
  _$jscoverage['/gregorian.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['508'][1].init(247, 17, 'self.isSet(MONTH)');
function visit38_508_1(result) {
  _$jscoverage['/gregorian.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['491'][1].init(114, 20, '!this.fieldsComputed');
function visit37_491_1(result) {
  _$jscoverage['/gregorian.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['488'][1].init(18, 23, 'this.time === undefined');
function visit36_488_1(result) {
  _$jscoverage['/gregorian.js'].branchData['488'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['462'][1].init(572, 25, 'fields[MILLISECONDS] || 0');
function visit35_462_1(result) {
  _$jscoverage['/gregorian.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['460'][1].init(492, 20, 'fields[SECONDS] || 0');
function visit34_460_1(result) {
  _$jscoverage['/gregorian.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['458'][1].init(415, 19, 'fields[MINUTE] || 0');
function visit33_458_1(result) {
  _$jscoverage['/gregorian.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['454'][1].init(266, 23, 'this.isSet(HOUR_OF_DAY)');
function visit32_454_1(result) {
  _$jscoverage['/gregorian.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['446'][1].init(18, 17, '!this.isSet(YEAR)');
function visit31_446_1(result) {
  _$jscoverage['/gregorian.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['428'][1].init(119, 29, 'fixedDate >= (nextJan1st - 7)');
function visit30_428_1(result) {
  _$jscoverage['/gregorian.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['426'][2].init(273, 36, 'nDays >= this.minimalDaysInFirstWeek');
function visit29_426_2(result) {
  _$jscoverage['/gregorian.js'].branchData['426'][2].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['426'][1].init(273, 149, 'nDays >= this.minimalDaysInFirstWeek && fixedDate >= (nextJan1st - 7)');
function visit28_426_1(result) {
  _$jscoverage['/gregorian.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['421'][1].init(2485, 16, 'weekOfYear >= 52');
function visit27_421_1(result) {
  _$jscoverage['/gregorian.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['412'][1].init(2015, 15, 'weekOfYear == 0');
function visit26_412_1(result) {
  _$jscoverage['/gregorian.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['387'][1].init(988, 14, 'timeOfDay != 0');
function visit25_387_1(result) {
  _$jscoverage['/gregorian.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['369'][1].init(25, 13, 'timeOfDay < 0');
function visit24_369_1(result) {
  _$jscoverage['/gregorian.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['365'][1].init(329, 20, 'timeOfDay >= ONE_DAY');
function visit23_365_1(result) {
  _$jscoverage['/gregorian.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['350'][1].init(21, 32, 'this.fields[field] !== undefined');
function visit22_350_1(result) {
  _$jscoverage['/gregorian.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['336'][1].init(1257, 19, 'value === undefined');
function visit21_336_1(result) {
  _$jscoverage['/gregorian.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['318'][1].init(207, 10, 'value == 1');
function visit20_318_1(result) {
  _$jscoverage['/gregorian.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['305'][1].init(18, 31, 'MAX_VALUES[field] !== undefined');
function visit19_305_1(result) {
  _$jscoverage['/gregorian.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['287'][1].init(169, 23, 'field === WEEK_OF_MONTH');
function visit18_287_1(result) {
  _$jscoverage['/gregorian.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['282'][1].init(18, 31, 'MIN_VALUES[field] !== undefined');
function visit17_282_1(result) {
  _$jscoverage['/gregorian.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['81'][1].init(1254, 21, 'arguments.length >= 3');
function visit16_81_1(result) {
  _$jscoverage['/gregorian.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['63'][1].init(720, 39, 'timezoneOffset || locale.timezoneOffset');
function visit15_63_1(result) {
  _$jscoverage['/gregorian.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['46'][1].init(299, 23, 'locale || defaultLocale');
function visit14_46_1(result) {
  _$jscoverage['/gregorian.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['42'][1].init(204, 16, 'args.length >= 3');
function visit13_42_1(result) {
  _$jscoverage['/gregorian.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].branchData['39'][1].init(62, 26, 'S.isObject(timezoneOffset)');
function visit12_39_1(result) {
  _$jscoverage['/gregorian.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/gregorian.js'].lineData[5]++;
KISSY.add('date/gregorian', function(S, defaultLocale, Utils, Const, undefined) {
  _$jscoverage['/gregorian.js'].functionData[0]++;
  _$jscoverage['/gregorian.js'].lineData[7]++;
  var toInt = parseInt;
  _$jscoverage['/gregorian.js'].lineData[35]++;
  function GregorianCalendar(timezoneOffset, locale) {
    _$jscoverage['/gregorian.js'].functionData[1]++;
    _$jscoverage['/gregorian.js'].lineData[37]++;
    var args = S.makeArray(arguments);
    _$jscoverage['/gregorian.js'].lineData[39]++;
    if (visit12_39_1(S.isObject(timezoneOffset))) {
      _$jscoverage['/gregorian.js'].lineData[40]++;
      locale = timezoneOffset;
      _$jscoverage['/gregorian.js'].lineData[41]++;
      timezoneOffset = locale.timezoneOffset;
    } else {
      _$jscoverage['/gregorian.js'].lineData[42]++;
      if (visit13_42_1(args.length >= 3)) {
        _$jscoverage['/gregorian.js'].lineData[43]++;
        timezoneOffset = locale = null;
      }
    }
    _$jscoverage['/gregorian.js'].lineData[46]++;
    locale = visit14_46_1(locale || defaultLocale);
    _$jscoverage['/gregorian.js'].lineData[48]++;
    this.locale = locale;
    _$jscoverage['/gregorian.js'].lineData[50]++;
    this.fields = [];
    _$jscoverage['/gregorian.js'].lineData[57]++;
    this.time = undefined;
    _$jscoverage['/gregorian.js'].lineData[63]++;
    this.timezoneOffset = visit15_63_1(timezoneOffset || locale.timezoneOffset);
    _$jscoverage['/gregorian.js'].lineData[69]++;
    this.firstDayOfWeek = locale.firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[77]++;
    this.minimalDaysInFirstWeek = locale.minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[79]++;
    this.fieldsComputed = false;
    _$jscoverage['/gregorian.js'].lineData[81]++;
    if (visit16_81_1(arguments.length >= 3)) {
      _$jscoverage['/gregorian.js'].lineData[82]++;
      this.set.apply(this, args);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[86]++;
  S.mix(GregorianCalendar, Const);
  _$jscoverage['/gregorian.js'].lineData[88]++;
  S.mix(GregorianCalendar, {
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
  _$jscoverage['/gregorian.js'].lineData[175]++;
  var fields = ['', 'Year', 'Month', 'DayOfMonth', 'HourOfDay', 'Minutes', 'Seconds', 'Milliseconds', 'WeekOfYear', 'WeekOfMonth', 'DayOfYear', 'DayOfWeek', 'DayOfWeekInMonth'];
  _$jscoverage['/gregorian.js'].lineData[183]++;
  var YEAR = GregorianCalendar.YEAR;
  _$jscoverage['/gregorian.js'].lineData[184]++;
  var MONTH = GregorianCalendar.MONTH;
  _$jscoverage['/gregorian.js'].lineData[185]++;
  var DAY_OF_MONTH = GregorianCalendar.DAY_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[186]++;
  var HOUR_OF_DAY = GregorianCalendar.HOUR_OF_DAY;
  _$jscoverage['/gregorian.js'].lineData[187]++;
  var MINUTE = GregorianCalendar.MINUTES;
  _$jscoverage['/gregorian.js'].lineData[188]++;
  var SECONDS = GregorianCalendar.SECONDS;
  _$jscoverage['/gregorian.js'].lineData[190]++;
  var MILLISECONDS = GregorianCalendar.MILLISECONDS;
  _$jscoverage['/gregorian.js'].lineData[191]++;
  var DAY_OF_WEEK_IN_MONTH = GregorianCalendar.DAY_OF_WEEK_IN_MONTH;
  _$jscoverage['/gregorian.js'].lineData[192]++;
  var DAY_OF_YEAR = GregorianCalendar.DAY_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[193]++;
  var DAY_OF_WEEK = GregorianCalendar.DAY_OF_WEEK;
  _$jscoverage['/gregorian.js'].lineData[195]++;
  var WEEK_OF_MONTH = GregorianCalendar.WEEK_OF_MONTH;
  _$jscoverage['/gregorian.js'].lineData[196]++;
  var WEEK_OF_YEAR = GregorianCalendar.WEEK_OF_YEAR;
  _$jscoverage['/gregorian.js'].lineData[198]++;
  var MONTH_LENGTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[199]++;
  var LEAP_MONTH_LENGTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  _$jscoverage['/gregorian.js'].lineData[201]++;
  var ONE_SECOND = 1000;
  _$jscoverage['/gregorian.js'].lineData[202]++;
  var ONE_MINUTE = 60 * ONE_SECOND;
  _$jscoverage['/gregorian.js'].lineData[203]++;
  var ONE_HOUR = 60 * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[204]++;
  var ONE_DAY = 24 * ONE_HOUR;
  _$jscoverage['/gregorian.js'].lineData[205]++;
  var ONE_WEEK = ONE_DAY * 7;
  _$jscoverage['/gregorian.js'].lineData[207]++;
  var EPOCH_OFFSET = 719163;
  _$jscoverage['/gregorian.js'].lineData[209]++;
  var mod = Utils.mod, isLeapYear = Utils.isLeapYear, floorDivide = Math.floor;
  _$jscoverage['/gregorian.js'].lineData[214]++;
  var MIN_VALUES = [undefined, 1, GregorianCalendar.JANUARY, 1, 0, 0, 0, 0, 1, undefined, 1, GregorianCalendar.SUNDAY, 1];
  _$jscoverage['/gregorian.js'].lineData[232]++;
  var MAX_VALUES = [undefined, 292278994, GregorianCalendar.DECEMBER, undefined, 23, 59, 59, 999, undefined, undefined, undefined, GregorianCalendar.SATURDAY, undefined];
  _$jscoverage['/gregorian.js'].lineData[248]++;
  GregorianCalendar.prototype = {
  constructor: GregorianCalendar, 
  isLeapYear: function() {
  _$jscoverage['/gregorian.js'].functionData[2]++;
  _$jscoverage['/gregorian.js'].lineData[260]++;
  return isLeapYear(this.getYear());
}, 
  getLocale: function() {
  _$jscoverage['/gregorian.js'].functionData[3]++;
  _$jscoverage['/gregorian.js'].lineData[268]++;
  return this.locale;
}, 
  getActualMinimum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[4]++;
  _$jscoverage['/gregorian.js'].lineData[282]++;
  if (visit17_282_1(MIN_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[283]++;
    return MIN_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[286]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[287]++;
  if (visit18_287_1(field === WEEK_OF_MONTH)) {
    _$jscoverage['/gregorian.js'].lineData[288]++;
    var cal = new GregorianCalendar(fields[YEAR], fields[MONTH], 1);
    _$jscoverage['/gregorian.js'].lineData[289]++;
    return cal.get(WEEK_OF_MONTH);
  }
  _$jscoverage['/gregorian.js'].lineData[292]++;
  throw new Error('minimum value not defined!');
}, 
  getActualMaximum: function(field) {
  _$jscoverage['/gregorian.js'].functionData[5]++;
  _$jscoverage['/gregorian.js'].lineData[305]++;
  if (visit19_305_1(MAX_VALUES[field] !== undefined)) {
    _$jscoverage['/gregorian.js'].lineData[306]++;
    return MAX_VALUES[field];
  }
  _$jscoverage['/gregorian.js'].lineData[308]++;
  var value, fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[310]++;
  switch (field) {
    case DAY_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[312]++;
      value = getMonthLength(fields[YEAR], fields[MONTH]);
      _$jscoverage['/gregorian.js'].lineData[313]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[316]++;
      var endOfYear = new GregorianCalendar(fields[YEAR], GregorianCalendar.DECEMBER, 31);
      _$jscoverage['/gregorian.js'].lineData[317]++;
      value = endOfYear.get(WEEK_OF_YEAR);
      _$jscoverage['/gregorian.js'].lineData[318]++;
      if (visit20_318_1(value == 1)) {
        _$jscoverage['/gregorian.js'].lineData[319]++;
        value = 52;
      }
      _$jscoverage['/gregorian.js'].lineData[321]++;
      break;
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[324]++;
      var endOfMonth = new GregorianCalendar(fields[YEAR], fields[MONTH], getMonthLength(fields[YEAR], fields[MONTH]));
      _$jscoverage['/gregorian.js'].lineData[325]++;
      value = endOfMonth.get(WEEK_OF_MONTH);
      _$jscoverage['/gregorian.js'].lineData[326]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[329]++;
      value = getYearLength(fields[YEAR]);
      _$jscoverage['/gregorian.js'].lineData[330]++;
      break;
    case DAY_OF_WEEK_IN_MONTH:
      _$jscoverage['/gregorian.js'].lineData[333]++;
      value = toInt((getMonthLength(fields[YEAR], fields[MONTH]) - 1) / 7) + 1;
      _$jscoverage['/gregorian.js'].lineData[334]++;
      break;
  }
  _$jscoverage['/gregorian.js'].lineData[336]++;
  if (visit21_336_1(value === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[337]++;
    throw new Error('maximum value not defined!');
  }
  _$jscoverage['/gregorian.js'].lineData[339]++;
  return value;
}, 
  isSet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[6]++;
  _$jscoverage['/gregorian.js'].lineData[350]++;
  return visit22_350_1(this.fields[field] !== undefined);
}, 
  computeFields: function() {
  _$jscoverage['/gregorian.js'].functionData[7]++;
  _$jscoverage['/gregorian.js'].lineData[359]++;
  var time = this.time;
  _$jscoverage['/gregorian.js'].lineData[360]++;
  var timezoneOffset = this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[361]++;
  var fixedDate = toInt(timezoneOffset / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[362]++;
  var timeOfDay = timezoneOffset % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[363]++;
  fixedDate += toInt(time / ONE_DAY);
  _$jscoverage['/gregorian.js'].lineData[364]++;
  timeOfDay += time % ONE_DAY;
  _$jscoverage['/gregorian.js'].lineData[365]++;
  if (visit23_365_1(timeOfDay >= ONE_DAY)) {
    _$jscoverage['/gregorian.js'].lineData[366]++;
    timeOfDay -= ONE_DAY;
    _$jscoverage['/gregorian.js'].lineData[367]++;
    fixedDate++;
  } else {
    _$jscoverage['/gregorian.js'].lineData[369]++;
    while (visit24_369_1(timeOfDay < 0)) {
      _$jscoverage['/gregorian.js'].lineData[370]++;
      timeOfDay += ONE_DAY;
      _$jscoverage['/gregorian.js'].lineData[371]++;
      fixedDate--;
    }
  }
  _$jscoverage['/gregorian.js'].lineData[375]++;
  fixedDate += EPOCH_OFFSET;
  _$jscoverage['/gregorian.js'].lineData[377]++;
  var date = Utils.getGregorianDateFromFixedDate(fixedDate);
  _$jscoverage['/gregorian.js'].lineData[379]++;
  var year = date.year;
  _$jscoverage['/gregorian.js'].lineData[381]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[382]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[383]++;
  fields[MONTH] = date.month;
  _$jscoverage['/gregorian.js'].lineData[384]++;
  fields[DAY_OF_MONTH] = date.dayOfMonth;
  _$jscoverage['/gregorian.js'].lineData[385]++;
  fields[DAY_OF_WEEK] = date.dayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[387]++;
  if (visit25_387_1(timeOfDay != 0)) {
    _$jscoverage['/gregorian.js'].lineData[388]++;
    fields[HOUR_OF_DAY] = toInt(timeOfDay / ONE_HOUR);
    _$jscoverage['/gregorian.js'].lineData[389]++;
    var r = timeOfDay % ONE_HOUR;
    _$jscoverage['/gregorian.js'].lineData[390]++;
    fields[MINUTE] = toInt(r / ONE_MINUTE);
    _$jscoverage['/gregorian.js'].lineData[391]++;
    r %= ONE_MINUTE;
    _$jscoverage['/gregorian.js'].lineData[392]++;
    fields[SECONDS] = toInt(r / ONE_SECOND);
    _$jscoverage['/gregorian.js'].lineData[393]++;
    fields[MILLISECONDS] = r % ONE_SECOND;
  } else {
    _$jscoverage['/gregorian.js'].lineData[395]++;
    fields[HOUR_OF_DAY] = fields[MINUTE] = fields[SECONDS] = fields[MILLISECONDS] = 0;
  }
  _$jscoverage['/gregorian.js'].lineData[402]++;
  var fixedDateJan1 = Utils.getFixedDate(year, GregorianCalendar.JANUARY, 1);
  _$jscoverage['/gregorian.js'].lineData[403]++;
  var dayOfYear = fixedDate - fixedDateJan1 + 1;
  _$jscoverage['/gregorian.js'].lineData[404]++;
  var fixDateMonth1 = fixedDate - date.dayOfMonth + 1;
  _$jscoverage['/gregorian.js'].lineData[406]++;
  fields[DAY_OF_YEAR] = dayOfYear;
  _$jscoverage['/gregorian.js'].lineData[407]++;
  fields[DAY_OF_WEEK_IN_MONTH] = toInt((date.dayOfMonth - 1) / 7) + 1;
  _$jscoverage['/gregorian.js'].lineData[409]++;
  var weekOfYear = getWeekNumber(this, fixedDateJan1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[412]++;
  if (visit26_412_1(weekOfYear == 0)) {
    _$jscoverage['/gregorian.js'].lineData[416]++;
    var fixedDec31 = fixedDateJan1 - 1;
    _$jscoverage['/gregorian.js'].lineData[417]++;
    var prevJan1 = fixedDateJan1 - getYearLength(year - 1);
    _$jscoverage['/gregorian.js'].lineData[418]++;
    weekOfYear = getWeekNumber(this, prevJan1, fixedDec31);
  } else {
    _$jscoverage['/gregorian.js'].lineData[421]++;
    if (visit27_421_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[422]++;
      var nextJan1 = fixedDateJan1 + getYearLength(year);
      _$jscoverage['/gregorian.js'].lineData[423]++;
      var nextJan1st = getDayOfWeekDateOnOrBefore(nextJan1 + 6, this.firstDayOfWeek);
      _$jscoverage['/gregorian.js'].lineData[424]++;
      var nDays = nextJan1st - nextJan1;
      _$jscoverage['/gregorian.js'].lineData[426]++;
      if (visit28_426_1(visit29_426_2(nDays >= this.minimalDaysInFirstWeek) && visit30_428_1(fixedDate >= (nextJan1st - 7)))) {
        _$jscoverage['/gregorian.js'].lineData[430]++;
        weekOfYear = 1;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[434]++;
  fields[WEEK_OF_YEAR] = weekOfYear;
  _$jscoverage['/gregorian.js'].lineData[435]++;
  fields[WEEK_OF_MONTH] = getWeekNumber(this, fixDateMonth1, fixedDate);
  _$jscoverage['/gregorian.js'].lineData[437]++;
  this.fieldsComputed = true;
}, 
  'computeTime': function() {
  _$jscoverage['/gregorian.js'].functionData[8]++;
  _$jscoverage['/gregorian.js'].lineData[446]++;
  if (visit31_446_1(!this.isSet(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[447]++;
    throw new Error('year must be set for KISSY GregorianCalendar');
  }
  _$jscoverage['/gregorian.js'].lineData[450]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[452]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[453]++;
  var timeOfDay = 0;
  _$jscoverage['/gregorian.js'].lineData[454]++;
  if (visit32_454_1(this.isSet(HOUR_OF_DAY))) {
    _$jscoverage['/gregorian.js'].lineData[455]++;
    timeOfDay += fields[HOUR_OF_DAY];
  }
  _$jscoverage['/gregorian.js'].lineData[457]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[458]++;
  timeOfDay += visit33_458_1(fields[MINUTE] || 0);
  _$jscoverage['/gregorian.js'].lineData[459]++;
  timeOfDay *= 60;
  _$jscoverage['/gregorian.js'].lineData[460]++;
  timeOfDay += visit34_460_1(fields[SECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[461]++;
  timeOfDay *= 1000;
  _$jscoverage['/gregorian.js'].lineData[462]++;
  timeOfDay += visit35_462_1(fields[MILLISECONDS] || 0);
  _$jscoverage['/gregorian.js'].lineData[464]++;
  var fixedDate = 0;
  _$jscoverage['/gregorian.js'].lineData[466]++;
  fields[YEAR] = year;
  _$jscoverage['/gregorian.js'].lineData[468]++;
  fixedDate = fixedDate + this.getFixedDate();
  _$jscoverage['/gregorian.js'].lineData[471]++;
  var millis = (fixedDate - EPOCH_OFFSET) * ONE_DAY + timeOfDay;
  _$jscoverage['/gregorian.js'].lineData[473]++;
  millis -= this.timezoneOffset * ONE_MINUTE;
  _$jscoverage['/gregorian.js'].lineData[475]++;
  this.time = millis;
  _$jscoverage['/gregorian.js'].lineData[477]++;
  this.computeFields();
}, 
  complete: function() {
  _$jscoverage['/gregorian.js'].functionData[9]++;
  _$jscoverage['/gregorian.js'].lineData[488]++;
  if (visit36_488_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[489]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[491]++;
  if (visit37_491_1(!this.fieldsComputed)) {
    _$jscoverage['/gregorian.js'].lineData[492]++;
    this.computeFields();
  }
}, 
  getFixedDate: function() {
  _$jscoverage['/gregorian.js'].functionData[10]++;
  _$jscoverage['/gregorian.js'].lineData[498]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[500]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[502]++;
  var firstDayOfWeekCfg = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[504]++;
  var year = fields[YEAR];
  _$jscoverage['/gregorian.js'].lineData[506]++;
  var month = GregorianCalendar.JANUARY;
  _$jscoverage['/gregorian.js'].lineData[508]++;
  if (visit38_508_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[509]++;
    month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[510]++;
    if (visit39_510_1(month > GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[511]++;
      year += toInt(month / 12);
      _$jscoverage['/gregorian.js'].lineData[512]++;
      month %= 12;
    } else {
      _$jscoverage['/gregorian.js'].lineData[513]++;
      if (visit40_513_1(month < GregorianCalendar.JANUARY)) {
        _$jscoverage['/gregorian.js'].lineData[514]++;
        year += floorDivide(month / 12);
        _$jscoverage['/gregorian.js'].lineData[515]++;
        month = mod(month, 12);
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[521]++;
  var fixedDate = Utils.getFixedDate(year, month, 1);
  _$jscoverage['/gregorian.js'].lineData[523]++;
  var dayOfWeek = self.firstDayOfWeek;
  _$jscoverage['/gregorian.js'].lineData[525]++;
  if (visit41_525_1(self.isSet(DAY_OF_WEEK))) {
    _$jscoverage['/gregorian.js'].lineData[526]++;
    dayOfWeek = fields[DAY_OF_WEEK];
  }
  _$jscoverage['/gregorian.js'].lineData[529]++;
  if (visit42_529_1(self.isSet(MONTH))) {
    _$jscoverage['/gregorian.js'].lineData[530]++;
    if (visit43_530_1(self.isSet(DAY_OF_MONTH))) {
      _$jscoverage['/gregorian.js'].lineData[531]++;
      fixedDate += fields[DAY_OF_MONTH] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[533]++;
      if (visit44_533_1(self.isSet(WEEK_OF_MONTH))) {
        _$jscoverage['/gregorian.js'].lineData[534]++;
        var firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
        _$jscoverage['/gregorian.js'].lineData[538]++;
        if (visit45_538_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
          _$jscoverage['/gregorian.js'].lineData[539]++;
          firstDayOfWeek -= 7;
        }
        _$jscoverage['/gregorian.js'].lineData[542]++;
        if (visit46_542_1(dayOfWeek != firstDayOfWeekCfg)) {
          _$jscoverage['/gregorian.js'].lineData[543]++;
          firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
        }
        _$jscoverage['/gregorian.js'].lineData[546]++;
        fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_MONTH] - 1);
      } else {
        _$jscoverage['/gregorian.js'].lineData[548]++;
        var dowim;
        _$jscoverage['/gregorian.js'].lineData[549]++;
        if (visit47_549_1(self.isSet(DAY_OF_WEEK_IN_MONTH))) {
          _$jscoverage['/gregorian.js'].lineData[550]++;
          dowim = fields[DAY_OF_WEEK_IN_MONTH];
        } else {
          _$jscoverage['/gregorian.js'].lineData[552]++;
          dowim = 1;
        }
        _$jscoverage['/gregorian.js'].lineData[554]++;
        var lastDate = (7 * dowim);
        _$jscoverage['/gregorian.js'].lineData[555]++;
        if (visit48_555_1(dowim < 0)) {
          _$jscoverage['/gregorian.js'].lineData[556]++;
          lastDate = getMonthLength(year, month) + (7 * (dowim + 1));
        }
        _$jscoverage['/gregorian.js'].lineData[558]++;
        fixedDate = getDayOfWeekDateOnOrBefore(fixedDate + lastDate - 1, dayOfWeek);
      }
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[563]++;
    if (visit49_563_1(self.isSet(DAY_OF_YEAR))) {
      _$jscoverage['/gregorian.js'].lineData[564]++;
      fixedDate += fields[DAY_OF_YEAR] - 1;
    } else {
      _$jscoverage['/gregorian.js'].lineData[566]++;
      firstDayOfWeek = getDayOfWeekDateOnOrBefore(fixedDate + 6, firstDayOfWeekCfg);
      _$jscoverage['/gregorian.js'].lineData[569]++;
      if (visit50_569_1((firstDayOfWeek - fixedDate) >= self.minimalDaysInFirstWeek)) {
        _$jscoverage['/gregorian.js'].lineData[570]++;
        firstDayOfWeek -= 7;
      }
      _$jscoverage['/gregorian.js'].lineData[572]++;
      if (visit51_572_1(dayOfWeek != firstDayOfWeekCfg)) {
        _$jscoverage['/gregorian.js'].lineData[573]++;
        firstDayOfWeek = getDayOfWeekDateOnOrBefore(firstDayOfWeek + 6, dayOfWeek);
      }
      _$jscoverage['/gregorian.js'].lineData[575]++;
      fixedDate = firstDayOfWeek + 7 * (fields[WEEK_OF_YEAR] - 1);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[579]++;
  return fixedDate;
}, 
  getTime: function() {
  _$jscoverage['/gregorian.js'].functionData[11]++;
  _$jscoverage['/gregorian.js'].lineData[588]++;
  if (visit52_588_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[589]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[591]++;
  return this.time;
}, 
  'setTime': function(time) {
  _$jscoverage['/gregorian.js'].functionData[12]++;
  _$jscoverage['/gregorian.js'].lineData[599]++;
  this.time = time;
  _$jscoverage['/gregorian.js'].lineData[600]++;
  this.fieldsComputed = false;
  _$jscoverage['/gregorian.js'].lineData[601]++;
  this.complete();
}, 
  get: function(field) {
  _$jscoverage['/gregorian.js'].functionData[13]++;
  _$jscoverage['/gregorian.js'].lineData[610]++;
  this.complete();
  _$jscoverage['/gregorian.js'].lineData[611]++;
  return this.fields[field];
}, 
  set: function(field, v) {
  _$jscoverage['/gregorian.js'].functionData[14]++;
  _$jscoverage['/gregorian.js'].lineData[698]++;
  var len = arguments.length;
  _$jscoverage['/gregorian.js'].lineData[699]++;
  if (visit53_699_1(len == 2)) {
    _$jscoverage['/gregorian.js'].lineData[700]++;
    this.fields[field] = v;
  } else {
    _$jscoverage['/gregorian.js'].lineData[701]++;
    if (visit54_701_1(len < MILLISECONDS + 1)) {
      _$jscoverage['/gregorian.js'].lineData[702]++;
      for (var i = 0; visit55_702_1(i < len); i++) {
        _$jscoverage['/gregorian.js'].lineData[703]++;
        this.fields[YEAR + i] = arguments[i];
      }
    } else {
      _$jscoverage['/gregorian.js'].lineData[706]++;
      throw new Error('illegal arguments for KISSY GregorianCalendar set');
    }
  }
  _$jscoverage['/gregorian.js'].lineData[708]++;
  this.time = undefined;
}, 
  add: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[15]++;
  _$jscoverage['/gregorian.js'].lineData[818]++;
  if (visit56_818_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[819]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[821]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[822]++;
  var fields = self.fields;
  _$jscoverage['/gregorian.js'].lineData[824]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[825]++;
  if (visit57_825_1(field === YEAR)) {
    _$jscoverage['/gregorian.js'].lineData[826]++;
    value += amount;
    _$jscoverage['/gregorian.js'].lineData[827]++;
    self.set(YEAR, value);
    _$jscoverage['/gregorian.js'].lineData[828]++;
    adjustDayOfMonth(self);
  } else {
    _$jscoverage['/gregorian.js'].lineData[829]++;
    if (visit58_829_1(field === MONTH)) {
      _$jscoverage['/gregorian.js'].lineData[830]++;
      value += amount;
      _$jscoverage['/gregorian.js'].lineData[831]++;
      var yearAmount = floorDivide(value / 12);
      _$jscoverage['/gregorian.js'].lineData[832]++;
      value = mod(value, 12);
      _$jscoverage['/gregorian.js'].lineData[833]++;
      if (visit59_833_1(yearAmount)) {
        _$jscoverage['/gregorian.js'].lineData[834]++;
        self.set(YEAR, fields[YEAR] + yearAmount);
      }
      _$jscoverage['/gregorian.js'].lineData[836]++;
      self.set(MONTH, value);
      _$jscoverage['/gregorian.js'].lineData[837]++;
      adjustDayOfMonth(self);
    } else {
      _$jscoverage['/gregorian.js'].lineData[839]++;
      switch (field) {
        case HOUR_OF_DAY:
          _$jscoverage['/gregorian.js'].lineData[841]++;
          amount *= ONE_HOUR;
          _$jscoverage['/gregorian.js'].lineData[842]++;
          break;
        case MINUTE:
          _$jscoverage['/gregorian.js'].lineData[844]++;
          amount *= ONE_MINUTE;
          _$jscoverage['/gregorian.js'].lineData[845]++;
          break;
        case SECONDS:
          _$jscoverage['/gregorian.js'].lineData[847]++;
          amount *= ONE_SECOND;
          _$jscoverage['/gregorian.js'].lineData[848]++;
          break;
        case MILLISECONDS:
          _$jscoverage['/gregorian.js'].lineData[850]++;
          break;
        case WEEK_OF_MONTH:
        case WEEK_OF_YEAR:
        case DAY_OF_WEEK_IN_MONTH:
          _$jscoverage['/gregorian.js'].lineData[854]++;
          amount *= ONE_WEEK;
          _$jscoverage['/gregorian.js'].lineData[855]++;
          break;
        case DAY_OF_WEEK:
        case DAY_OF_YEAR:
        case DAY_OF_MONTH:
          _$jscoverage['/gregorian.js'].lineData[859]++;
          amount *= ONE_DAY;
          _$jscoverage['/gregorian.js'].lineData[860]++;
          break;
        default:
          _$jscoverage['/gregorian.js'].lineData[862]++;
          throw new Error('illegal field for add');
          _$jscoverage['/gregorian.js'].lineData[863]++;
          break;
      }
      _$jscoverage['/gregorian.js'].lineData[865]++;
      self.setTime(self.time + amount);
    }
  }
}, 
  getRolledValue: function(value, amount, min, max) {
  _$jscoverage['/gregorian.js'].functionData[16]++;
  _$jscoverage['/gregorian.js'].lineData[950]++;
  var diff = value - min;
  _$jscoverage['/gregorian.js'].lineData[951]++;
  var range = max - min + 1;
  _$jscoverage['/gregorian.js'].lineData[952]++;
  amount %= range;
  _$jscoverage['/gregorian.js'].lineData[953]++;
  return min + (diff + amount + range) % range;
}, 
  roll: function(field, amount) {
  _$jscoverage['/gregorian.js'].functionData[17]++;
  _$jscoverage['/gregorian.js'].lineData[979]++;
  if (visit60_979_1(!amount)) {
    _$jscoverage['/gregorian.js'].lineData[980]++;
    return;
  }
  _$jscoverage['/gregorian.js'].lineData[982]++;
  var self = this;
  _$jscoverage['/gregorian.js'].lineData[984]++;
  var value = self.get(field);
  _$jscoverage['/gregorian.js'].lineData[985]++;
  var min = self.getActualMinimum(field);
  _$jscoverage['/gregorian.js'].lineData[986]++;
  var max = self.getActualMaximum(field);
  _$jscoverage['/gregorian.js'].lineData[987]++;
  value = self.getRolledValue(value, amount, min, max);
  _$jscoverage['/gregorian.js'].lineData[989]++;
  self.set(field, value);
  _$jscoverage['/gregorian.js'].lineData[992]++;
  switch (field) {
    case MONTH:
      _$jscoverage['/gregorian.js'].lineData[994]++;
      adjustDayOfMonth(self);
      _$jscoverage['/gregorian.js'].lineData[995]++;
      break;
    default:
      _$jscoverage['/gregorian.js'].lineData[998]++;
      self.updateFieldsBySet(field);
      _$jscoverage['/gregorian.js'].lineData[999]++;
      break;
  }
}, 
  updateFieldsBySet: function(field) {
  _$jscoverage['/gregorian.js'].functionData[18]++;
  _$jscoverage['/gregorian.js'].lineData[1084]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1085]++;
  switch (field) {
    case WEEK_OF_MONTH:
      _$jscoverage['/gregorian.js'].lineData[1087]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1088]++;
      break;
    case DAY_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1090]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1091]++;
      break;
    case DAY_OF_WEEK:
      _$jscoverage['/gregorian.js'].lineData[1093]++;
      fields[DAY_OF_MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1094]++;
      break;
    case WEEK_OF_YEAR:
      _$jscoverage['/gregorian.js'].lineData[1096]++;
      fields[DAY_OF_YEAR] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1097]++;
      fields[MONTH] = undefined;
      _$jscoverage['/gregorian.js'].lineData[1098]++;
      break;
  }
}, 
  getTimezoneOffset: function() {
  _$jscoverage['/gregorian.js'].functionData[19]++;
  _$jscoverage['/gregorian.js'].lineData[1107]++;
  return this.timezoneOffset;
}, 
  'setTimezoneOffset': function(timezoneOffset) {
  _$jscoverage['/gregorian.js'].functionData[20]++;
  _$jscoverage['/gregorian.js'].lineData[1114]++;
  if (visit61_1114_1(this.timezoneOffset != timezoneOffset)) {
    _$jscoverage['/gregorian.js'].lineData[1115]++;
    this.fieldsComputed = undefined;
    _$jscoverage['/gregorian.js'].lineData[1116]++;
    this.timezoneOffset = timezoneOffset;
  }
}, 
  'setFirstDayOfWeek': function(firstDayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[21]++;
  _$jscoverage['/gregorian.js'].lineData[1124]++;
  if (visit62_1124_1(this.firstDayOfWeek != firstDayOfWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1125]++;
    this.firstDayOfWeek = firstDayOfWeek;
    _$jscoverage['/gregorian.js'].lineData[1126]++;
    this.fieldsComputed = false;
  }
}, 
  'getFirstDayOfWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[22]++;
  _$jscoverage['/gregorian.js'].lineData[1135]++;
  return this.firstDayOfWeek;
}, 
  'setMinimalDaysInFirstWeek': function(minimalDaysInFirstWeek) {
  _$jscoverage['/gregorian.js'].functionData[23]++;
  _$jscoverage['/gregorian.js'].lineData[1146]++;
  if (visit63_1146_1(this.minimalDaysInFirstWeek != minimalDaysInFirstWeek)) {
    _$jscoverage['/gregorian.js'].lineData[1147]++;
    this.minimalDaysInFirstWeek = minimalDaysInFirstWeek;
    _$jscoverage['/gregorian.js'].lineData[1148]++;
    this.fieldsComputed = false;
  }
}, 
  'getMinimalDaysInFirstWeek': function() {
  _$jscoverage['/gregorian.js'].functionData[24]++;
  _$jscoverage['/gregorian.js'].lineData[1160]++;
  return this.minimalDaysInFirstWeek;
}, 
  'getWeeksInWeekYear': function() {
  _$jscoverage['/gregorian.js'].functionData[25]++;
  _$jscoverage['/gregorian.js'].lineData[1177]++;
  var weekYear = this.getWeekYear();
  _$jscoverage['/gregorian.js'].lineData[1178]++;
  if (visit64_1178_1(weekYear == this.get(YEAR))) {
    _$jscoverage['/gregorian.js'].lineData[1179]++;
    return this.getActualMaximum(WEEK_OF_YEAR);
  }
  _$jscoverage['/gregorian.js'].lineData[1182]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1183]++;
  gc.setWeekDate(weekYear, 2, this.get(DAY_OF_WEEK));
  _$jscoverage['/gregorian.js'].lineData[1184]++;
  return gc.getActualMaximum(WEEK_OF_YEAR);
}, 
  getWeekYear: function() {
  _$jscoverage['/gregorian.js'].functionData[26]++;
  _$jscoverage['/gregorian.js'].lineData[1196]++;
  var year = this.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1197]++;
  var weekOfYear = this.get(WEEK_OF_YEAR);
  _$jscoverage['/gregorian.js'].lineData[1198]++;
  var month = this.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1199]++;
  if (visit65_1199_1(month == GregorianCalendar.JANUARY)) {
    _$jscoverage['/gregorian.js'].lineData[1200]++;
    if (visit66_1200_1(weekOfYear >= 52)) {
      _$jscoverage['/gregorian.js'].lineData[1201]++;
      --year;
    }
  } else {
    _$jscoverage['/gregorian.js'].lineData[1203]++;
    if (visit67_1203_1(month == GregorianCalendar.DECEMBER)) {
      _$jscoverage['/gregorian.js'].lineData[1204]++;
      if (visit68_1204_1(weekOfYear == 1)) {
        _$jscoverage['/gregorian.js'].lineData[1205]++;
        ++year;
      }
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1208]++;
  return year;
}, 
  'setWeekDate': function(weekYear, weekOfYear, dayOfWeek) {
  _$jscoverage['/gregorian.js'].functionData[27]++;
  _$jscoverage['/gregorian.js'].lineData[1221]++;
  if (visit69_1221_1(visit70_1221_2(dayOfWeek < GregorianCalendar.SUNDAY) || visit71_1221_3(dayOfWeek > GregorianCalendar.SATURDAY))) {
    _$jscoverage['/gregorian.js'].lineData[1222]++;
    throw new Error("invalid dayOfWeek: " + dayOfWeek);
  }
  _$jscoverage['/gregorian.js'].lineData[1224]++;
  var fields = this.fields;
  _$jscoverage['/gregorian.js'].lineData[1227]++;
  var gc = this.clone();
  _$jscoverage['/gregorian.js'].lineData[1228]++;
  gc.clear();
  _$jscoverage['/gregorian.js'].lineData[1229]++;
  gc.setTimezoneOffset(0);
  _$jscoverage['/gregorian.js'].lineData[1230]++;
  gc.set(YEAR, weekYear);
  _$jscoverage['/gregorian.js'].lineData[1231]++;
  gc.set(WEEK_OF_YEAR, 1);
  _$jscoverage['/gregorian.js'].lineData[1232]++;
  gc.set(DAY_OF_WEEK, this.getFirstDayOfWeek());
  _$jscoverage['/gregorian.js'].lineData[1233]++;
  var days = dayOfWeek - this.getFirstDayOfWeek();
  _$jscoverage['/gregorian.js'].lineData[1234]++;
  if (visit72_1234_1(days < 0)) {
    _$jscoverage['/gregorian.js'].lineData[1235]++;
    days += 7;
  }
  _$jscoverage['/gregorian.js'].lineData[1237]++;
  days += 7 * (weekOfYear - 1);
  _$jscoverage['/gregorian.js'].lineData[1238]++;
  if (visit73_1238_1(days != 0)) {
    _$jscoverage['/gregorian.js'].lineData[1239]++;
    gc.add(DAY_OF_YEAR, days);
  } else {
    _$jscoverage['/gregorian.js'].lineData[1241]++;
    gc.complete();
  }
  _$jscoverage['/gregorian.js'].lineData[1243]++;
  fields[YEAR] = gc.get(YEAR);
  _$jscoverage['/gregorian.js'].lineData[1244]++;
  fields[MONTH] = gc.get(MONTH);
  _$jscoverage['/gregorian.js'].lineData[1245]++;
  fields[DAY_OF_MONTH] = gc.get(DAY_OF_MONTH);
  _$jscoverage['/gregorian.js'].lineData[1246]++;
  this.complete();
}, 
  clone: function() {
  _$jscoverage['/gregorian.js'].functionData[28]++;
  _$jscoverage['/gregorian.js'].lineData[1253]++;
  if (visit74_1253_1(this.time === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1254]++;
    this.computeTime();
  }
  _$jscoverage['/gregorian.js'].lineData[1256]++;
  var cal = new GregorianCalendar(this.timezoneOffset, this.locale);
  _$jscoverage['/gregorian.js'].lineData[1257]++;
  cal.setTime(this.time);
  _$jscoverage['/gregorian.js'].lineData[1258]++;
  return cal;
}, 
  equals: function(obj) {
  _$jscoverage['/gregorian.js'].functionData[29]++;
  _$jscoverage['/gregorian.js'].lineData[1270]++;
  return visit75_1270_1(visit76_1270_2(this.getTime() == obj.getTime()) && visit77_1271_1(visit78_1271_2(this.firstDayOfWeek == obj.firstDayOfWeek) && visit79_1272_1(visit80_1272_2(this.timezoneOffset == obj.timezoneOffset) && visit81_1273_1(this.minimalDaysInFirstWeek == obj.minimalDaysInFirstWeek))));
}, 
  clear: function(field) {
  _$jscoverage['/gregorian.js'].functionData[30]++;
  _$jscoverage['/gregorian.js'].lineData[1284]++;
  if (visit82_1284_1(field === undefined)) {
    _$jscoverage['/gregorian.js'].lineData[1285]++;
    this.field = [];
  } else {
    _$jscoverage['/gregorian.js'].lineData[1287]++;
    this.fields[field] = undefined;
  }
  _$jscoverage['/gregorian.js'].lineData[1289]++;
  this.time = undefined;
  _$jscoverage['/gregorian.js'].lineData[1290]++;
  this.fieldsComputed = false;
}};
  _$jscoverage['/gregorian.js'].lineData[1294]++;
  var GregorianCalendarProto = GregorianCalendar.prototype;
  _$jscoverage['/gregorian.js'].lineData[1296]++;
  if (visit83_1296_1('@DEBUG@')) {
    _$jscoverage['/gregorian.js'].lineData[1298]++;
    GregorianCalendarProto.getDayOfMonth = GregorianCalendarProto.getHourOfDay = GregorianCalendarProto.getWeekOfYear = GregorianCalendarProto.getWeekOfMonth = GregorianCalendarProto.getDayOfYear = GregorianCalendarProto.getDayOfWeek = GregorianCalendarProto.getDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1306]++;
    GregorianCalendarProto.addDayOfMonth = GregorianCalendarProto.addMonth = GregorianCalendarProto.addYear = GregorianCalendarProto.addMinutes = GregorianCalendarProto.addSeconds = GregorianCalendarProto.addMilliSeconds = GregorianCalendarProto.addHourOfDay = GregorianCalendarProto.addWeekOfYear = GregorianCalendarProto.addWeekOfMonth = GregorianCalendarProto.addDayOfYear = GregorianCalendarProto.addDayOfWeek = GregorianCalendarProto.addDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1319]++;
    GregorianCalendarProto.isSetDayOfMonth = GregorianCalendarProto.isSetMonth = GregorianCalendarProto.isSetYear = GregorianCalendarProto.isSetMinutes = GregorianCalendarProto.isSetSeconds = GregorianCalendarProto.isSetMilliSeconds = GregorianCalendarProto.isSetHourOfDay = GregorianCalendarProto.isSetWeekOfYear = GregorianCalendarProto.isSetWeekOfMonth = GregorianCalendarProto.isSetDayOfYear = GregorianCalendarProto.isSetDayOfWeek = GregorianCalendarProto.isSetDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1331]++;
    GregorianCalendarProto.setDayOfMonth = GregorianCalendarProto.setHourOfDay = GregorianCalendarProto.setWeekOfYear = GregorianCalendarProto.setWeekOfMonth = GregorianCalendarProto.setDayOfYear = GregorianCalendarProto.setDayOfWeek = GregorianCalendarProto.setDayOfWeekInMonth = S.noop;
    _$jscoverage['/gregorian.js'].lineData[1339]++;
    GregorianCalendarProto.rollDayOfMonth = GregorianCalendarProto.rollMonth = GregorianCalendarProto.rollYear = GregorianCalendarProto.rollMinutes = GregorianCalendarProto.rollSeconds = GregorianCalendarProto.rollMilliSeconds = GregorianCalendarProto.rollHourOfDay = GregorianCalendarProto.rollWeekOfYear = GregorianCalendarProto.rollWeekOfMonth = GregorianCalendarProto.rollDayOfYear = GregorianCalendarProto.rollDayOfWeek = GregorianCalendarProto.rollDayOfWeekInMonth = S.noop;
  }
  _$jscoverage['/gregorian.js'].lineData[1352]++;
  S.each(fields, function(f, index) {
  _$jscoverage['/gregorian.js'].functionData[31]++;
  _$jscoverage['/gregorian.js'].lineData[1353]++;
  if (visit84_1353_1(f)) {
    _$jscoverage['/gregorian.js'].lineData[1354]++;
    GregorianCalendarProto['get' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[32]++;
  _$jscoverage['/gregorian.js'].lineData[1355]++;
  return this.get(index);
};
    _$jscoverage['/gregorian.js'].lineData[1358]++;
    GregorianCalendarProto['isSet' + f] = function() {
  _$jscoverage['/gregorian.js'].functionData[33]++;
  _$jscoverage['/gregorian.js'].lineData[1359]++;
  return this.isSet(index);
};
    _$jscoverage['/gregorian.js'].lineData[1362]++;
    GregorianCalendarProto['set' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[34]++;
  _$jscoverage['/gregorian.js'].lineData[1363]++;
  return this.set(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1366]++;
    GregorianCalendarProto['add' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[35]++;
  _$jscoverage['/gregorian.js'].lineData[1367]++;
  return this.add(index, v);
};
    _$jscoverage['/gregorian.js'].lineData[1370]++;
    GregorianCalendarProto['roll' + f] = function(v) {
  _$jscoverage['/gregorian.js'].functionData[36]++;
  _$jscoverage['/gregorian.js'].lineData[1371]++;
  return this.roll(index, v);
};
  }
});
  _$jscoverage['/gregorian.js'].lineData[1379]++;
  function adjustDayOfMonth(self) {
    _$jscoverage['/gregorian.js'].functionData[37]++;
    _$jscoverage['/gregorian.js'].lineData[1380]++;
    var fields = self.fields;
    _$jscoverage['/gregorian.js'].lineData[1381]++;
    var year = fields[YEAR];
    _$jscoverage['/gregorian.js'].lineData[1382]++;
    var month = fields[MONTH];
    _$jscoverage['/gregorian.js'].lineData[1383]++;
    var monthLen = getMonthLength(year, month);
    _$jscoverage['/gregorian.js'].lineData[1384]++;
    var dayOfMonth = fields[DAY_OF_MONTH];
    _$jscoverage['/gregorian.js'].lineData[1385]++;
    if (visit85_1385_1(dayOfMonth > monthLen)) {
      _$jscoverage['/gregorian.js'].lineData[1386]++;
      self.set(DAY_OF_MONTH, monthLen);
    }
  }
  _$jscoverage['/gregorian.js'].lineData[1390]++;
  function getMonthLength(year, month) {
    _$jscoverage['/gregorian.js'].functionData[38]++;
    _$jscoverage['/gregorian.js'].lineData[1391]++;
    return isLeapYear(year) ? LEAP_MONTH_LENGTH[month] : MONTH_LENGTH[month];
  }
  _$jscoverage['/gregorian.js'].lineData[1394]++;
  function getYearLength(year) {
    _$jscoverage['/gregorian.js'].functionData[39]++;
    _$jscoverage['/gregorian.js'].lineData[1395]++;
    return isLeapYear(year) ? 366 : 365;
  }
  _$jscoverage['/gregorian.js'].lineData[1398]++;
  function getWeekNumber(self, fixedDay1, fixedDate) {
    _$jscoverage['/gregorian.js'].functionData[40]++;
    _$jscoverage['/gregorian.js'].lineData[1399]++;
    var fixedDay1st = getDayOfWeekDateOnOrBefore(fixedDay1 + 6, self.firstDayOfWeek);
    _$jscoverage['/gregorian.js'].lineData[1400]++;
    var nDays = (fixedDay1st - fixedDay1);
    _$jscoverage['/gregorian.js'].lineData[1401]++;
    if (visit86_1401_1(nDays >= self.minimalDaysInFirstWeek)) {
      _$jscoverage['/gregorian.js'].lineData[1402]++;
      fixedDay1st -= 7;
    }
    _$jscoverage['/gregorian.js'].lineData[1404]++;
    var normalizedDayOfPeriod = (fixedDate - fixedDay1st);
    _$jscoverage['/gregorian.js'].lineData[1405]++;
    return floorDivide(normalizedDayOfPeriod / 7) + 1;
  }
  _$jscoverage['/gregorian.js'].lineData[1408]++;
  function getDayOfWeekDateOnOrBefore(fixedDate, dayOfWeek) {
    _$jscoverage['/gregorian.js'].functionData[41]++;
    _$jscoverage['/gregorian.js'].lineData[1411]++;
    return fixedDate - mod(fixedDate - dayOfWeek, 7);
  }
  _$jscoverage['/gregorian.js'].lineData[1416]++;
  return GregorianCalendar;
}, {
  requires: ['i18n!date', './gregorian/utils', './gregorian/const']});
