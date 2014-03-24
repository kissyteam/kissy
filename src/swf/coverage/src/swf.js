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
if (! _$jscoverage['/swf.js']) {
  _$jscoverage['/swf.js'] = {};
  _$jscoverage['/swf.js'].lineData = [];
  _$jscoverage['/swf.js'].lineData[6] = 0;
  _$jscoverage['/swf.js'].lineData[7] = 0;
  _$jscoverage['/swf.js'].lineData[8] = 0;
  _$jscoverage['/swf.js'].lineData[9] = 0;
  _$jscoverage['/swf.js'].lineData[10] = 0;
  _$jscoverage['/swf.js'].lineData[12] = 0;
  _$jscoverage['/swf.js'].lineData[51] = 0;
  _$jscoverage['/swf.js'].lineData[57] = 0;
  _$jscoverage['/swf.js'].lineData[59] = 0;
  _$jscoverage['/swf.js'].lineData[60] = 0;
  _$jscoverage['/swf.js'].lineData[61] = 0;
  _$jscoverage['/swf.js'].lineData[77] = 0;
  _$jscoverage['/swf.js'].lineData[79] = 0;
  _$jscoverage['/swf.js'].lineData[80] = 0;
  _$jscoverage['/swf.js'].lineData[84] = 0;
  _$jscoverage['/swf.js'].lineData[85] = 0;
  _$jscoverage['/swf.js'].lineData[86] = 0;
  _$jscoverage['/swf.js'].lineData[90] = 0;
  _$jscoverage['/swf.js'].lineData[91] = 0;
  _$jscoverage['/swf.js'].lineData[94] = 0;
  _$jscoverage['/swf.js'].lineData[95] = 0;
  _$jscoverage['/swf.js'].lineData[98] = 0;
  _$jscoverage['/swf.js'].lineData[100] = 0;
  _$jscoverage['/swf.js'].lineData[103] = 0;
  _$jscoverage['/swf.js'].lineData[105] = 0;
  _$jscoverage['/swf.js'].lineData[108] = 0;
  _$jscoverage['/swf.js'].lineData[110] = 0;
  _$jscoverage['/swf.js'].lineData[118] = 0;
  _$jscoverage['/swf.js'].lineData[119] = 0;
  _$jscoverage['/swf.js'].lineData[121] = 0;
  _$jscoverage['/swf.js'].lineData[125] = 0;
  _$jscoverage['/swf.js'].lineData[127] = 0;
  _$jscoverage['/swf.js'].lineData[128] = 0;
  _$jscoverage['/swf.js'].lineData[130] = 0;
  _$jscoverage['/swf.js'].lineData[133] = 0;
  _$jscoverage['/swf.js'].lineData[134] = 0;
  _$jscoverage['/swf.js'].lineData[136] = 0;
  _$jscoverage['/swf.js'].lineData[139] = 0;
  _$jscoverage['/swf.js'].lineData[141] = 0;
  _$jscoverage['/swf.js'].lineData[142] = 0;
  _$jscoverage['/swf.js'].lineData[143] = 0;
  _$jscoverage['/swf.js'].lineData[145] = 0;
  _$jscoverage['/swf.js'].lineData[148] = 0;
  _$jscoverage['/swf.js'].lineData[151] = 0;
  _$jscoverage['/swf.js'].lineData[152] = 0;
  _$jscoverage['/swf.js'].lineData[157] = 0;
  _$jscoverage['/swf.js'].lineData[159] = 0;
  _$jscoverage['/swf.js'].lineData[160] = 0;
  _$jscoverage['/swf.js'].lineData[169] = 0;
  _$jscoverage['/swf.js'].lineData[172] = 0;
  _$jscoverage['/swf.js'].lineData[173] = 0;
  _$jscoverage['/swf.js'].lineData[174] = 0;
  _$jscoverage['/swf.js'].lineData[175] = 0;
  _$jscoverage['/swf.js'].lineData[179] = 0;
  _$jscoverage['/swf.js'].lineData[180] = 0;
  _$jscoverage['/swf.js'].lineData[181] = 0;
  _$jscoverage['/swf.js'].lineData[185] = 0;
  _$jscoverage['/swf.js'].lineData[187] = 0;
  _$jscoverage['/swf.js'].lineData[193] = 0;
  _$jscoverage['/swf.js'].lineData[194] = 0;
  _$jscoverage['/swf.js'].lineData[198] = 0;
  _$jscoverage['/swf.js'].lineData[199] = 0;
  _$jscoverage['/swf.js'].lineData[201] = 0;
  _$jscoverage['/swf.js'].lineData[202] = 0;
  _$jscoverage['/swf.js'].lineData[203] = 0;
  _$jscoverage['/swf.js'].lineData[206] = 0;
  _$jscoverage['/swf.js'].lineData[210] = 0;
  _$jscoverage['/swf.js'].lineData[283] = 0;
  _$jscoverage['/swf.js'].lineData[284] = 0;
  _$jscoverage['/swf.js'].lineData[286] = 0;
  _$jscoverage['/swf.js'].lineData[289] = 0;
  _$jscoverage['/swf.js'].lineData[301] = 0;
  _$jscoverage['/swf.js'].lineData[302] = 0;
  _$jscoverage['/swf.js'].lineData[304] = 0;
  _$jscoverage['/swf.js'].lineData[384] = 0;
  _$jscoverage['/swf.js'].lineData[385] = 0;
  _$jscoverage['/swf.js'].lineData[387] = 0;
  _$jscoverage['/swf.js'].lineData[388] = 0;
  _$jscoverage['/swf.js'].lineData[389] = 0;
  _$jscoverage['/swf.js'].lineData[390] = 0;
  _$jscoverage['/swf.js'].lineData[391] = 0;
  _$jscoverage['/swf.js'].lineData[392] = 0;
  _$jscoverage['/swf.js'].lineData[394] = 0;
  _$jscoverage['/swf.js'].lineData[438] = 0;
  _$jscoverage['/swf.js'].lineData[439] = 0;
  _$jscoverage['/swf.js'].lineData[440] = 0;
  _$jscoverage['/swf.js'].lineData[441] = 0;
  _$jscoverage['/swf.js'].lineData[444] = 0;
  _$jscoverage['/swf.js'].lineData[447] = 0;
  _$jscoverage['/swf.js'].lineData[448] = 0;
  _$jscoverage['/swf.js'].lineData[452] = 0;
  _$jscoverage['/swf.js'].lineData[453] = 0;
  _$jscoverage['/swf.js'].lineData[454] = 0;
  _$jscoverage['/swf.js'].lineData[455] = 0;
  _$jscoverage['/swf.js'].lineData[457] = 0;
  _$jscoverage['/swf.js'].lineData[458] = 0;
  _$jscoverage['/swf.js'].lineData[459] = 0;
  _$jscoverage['/swf.js'].lineData[460] = 0;
  _$jscoverage['/swf.js'].lineData[461] = 0;
  _$jscoverage['/swf.js'].lineData[462] = 0;
  _$jscoverage['/swf.js'].lineData[463] = 0;
  _$jscoverage['/swf.js'].lineData[464] = 0;
  _$jscoverage['/swf.js'].lineData[465] = 0;
  _$jscoverage['/swf.js'].lineData[466] = 0;
  _$jscoverage['/swf.js'].lineData[470] = 0;
  _$jscoverage['/swf.js'].lineData[471] = 0;
  _$jscoverage['/swf.js'].lineData[473] = 0;
  _$jscoverage['/swf.js'].lineData[477] = 0;
  _$jscoverage['/swf.js'].lineData[478] = 0;
  _$jscoverage['/swf.js'].lineData[479] = 0;
  _$jscoverage['/swf.js'].lineData[480] = 0;
  _$jscoverage['/swf.js'].lineData[481] = 0;
  _$jscoverage['/swf.js'].lineData[482] = 0;
  _$jscoverage['/swf.js'].lineData[485] = 0;
  _$jscoverage['/swf.js'].lineData[486] = 0;
  _$jscoverage['/swf.js'].lineData[489] = 0;
  _$jscoverage['/swf.js'].lineData[492] = 0;
  _$jscoverage['/swf.js'].lineData[493] = 0;
  _$jscoverage['/swf.js'].lineData[496] = 0;
  _$jscoverage['/swf.js'].lineData[497] = 0;
  _$jscoverage['/swf.js'].lineData[502] = 0;
  _$jscoverage['/swf.js'].lineData[503] = 0;
  _$jscoverage['/swf.js'].lineData[506] = 0;
  _$jscoverage['/swf.js'].lineData[507] = 0;
  _$jscoverage['/swf.js'].lineData[508] = 0;
  _$jscoverage['/swf.js'].lineData[511] = 0;
  _$jscoverage['/swf.js'].lineData[513] = 0;
  _$jscoverage['/swf.js'].lineData[516] = 0;
  _$jscoverage['/swf.js'].lineData[518] = 0;
  _$jscoverage['/swf.js'].lineData[520] = 0;
  _$jscoverage['/swf.js'].lineData[524] = 0;
  _$jscoverage['/swf.js'].lineData[525] = 0;
  _$jscoverage['/swf.js'].lineData[526] = 0;
  _$jscoverage['/swf.js'].lineData[527] = 0;
  _$jscoverage['/swf.js'].lineData[528] = 0;
  _$jscoverage['/swf.js'].lineData[529] = 0;
  _$jscoverage['/swf.js'].lineData[530] = 0;
  _$jscoverage['/swf.js'].lineData[532] = 0;
  _$jscoverage['/swf.js'].lineData[533] = 0;
  _$jscoverage['/swf.js'].lineData[534] = 0;
  _$jscoverage['/swf.js'].lineData[535] = 0;
  _$jscoverage['/swf.js'].lineData[537] = 0;
  _$jscoverage['/swf.js'].lineData[544] = 0;
  _$jscoverage['/swf.js'].lineData[545] = 0;
  _$jscoverage['/swf.js'].lineData[547] = 0;
  _$jscoverage['/swf.js'].lineData[548] = 0;
  _$jscoverage['/swf.js'].lineData[549] = 0;
  _$jscoverage['/swf.js'].lineData[551] = 0;
  _$jscoverage['/swf.js'].lineData[552] = 0;
  _$jscoverage['/swf.js'].lineData[555] = 0;
  _$jscoverage['/swf.js'].lineData[556] = 0;
  _$jscoverage['/swf.js'].lineData[559] = 0;
  _$jscoverage['/swf.js'].lineData[560] = 0;
  _$jscoverage['/swf.js'].lineData[563] = 0;
  _$jscoverage['/swf.js'].lineData[564] = 0;
  _$jscoverage['/swf.js'].lineData[567] = 0;
}
if (! _$jscoverage['/swf.js'].functionData) {
  _$jscoverage['/swf.js'].functionData = [];
  _$jscoverage['/swf.js'].functionData[0] = 0;
  _$jscoverage['/swf.js'].functionData[1] = 0;
  _$jscoverage['/swf.js'].functionData[2] = 0;
  _$jscoverage['/swf.js'].functionData[3] = 0;
  _$jscoverage['/swf.js'].functionData[4] = 0;
  _$jscoverage['/swf.js'].functionData[5] = 0;
  _$jscoverage['/swf.js'].functionData[6] = 0;
  _$jscoverage['/swf.js'].functionData[7] = 0;
  _$jscoverage['/swf.js'].functionData[8] = 0;
  _$jscoverage['/swf.js'].functionData[9] = 0;
  _$jscoverage['/swf.js'].functionData[10] = 0;
  _$jscoverage['/swf.js'].functionData[11] = 0;
  _$jscoverage['/swf.js'].functionData[12] = 0;
  _$jscoverage['/swf.js'].functionData[13] = 0;
  _$jscoverage['/swf.js'].functionData[14] = 0;
  _$jscoverage['/swf.js'].functionData[15] = 0;
  _$jscoverage['/swf.js'].functionData[16] = 0;
  _$jscoverage['/swf.js'].functionData[17] = 0;
  _$jscoverage['/swf.js'].functionData[18] = 0;
  _$jscoverage['/swf.js'].functionData[19] = 0;
  _$jscoverage['/swf.js'].functionData[20] = 0;
}
if (! _$jscoverage['/swf.js'].branchData) {
  _$jscoverage['/swf.js'].branchData = {};
  _$jscoverage['/swf.js'].branchData['77'] = [];
  _$jscoverage['/swf.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['79'] = [];
  _$jscoverage['/swf.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['84'] = [];
  _$jscoverage['/swf.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['90'] = [];
  _$jscoverage['/swf.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['94'] = [];
  _$jscoverage['/swf.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['98'] = [];
  _$jscoverage['/swf.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['99'] = [];
  _$jscoverage['/swf.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/swf.js'].branchData['103'] = [];
  _$jscoverage['/swf.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['104'] = [];
  _$jscoverage['/swf.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['104'][2] = new BranchData();
  _$jscoverage['/swf.js'].branchData['108'] = [];
  _$jscoverage['/swf.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['118'] = [];
  _$jscoverage['/swf.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['127'] = [];
  _$jscoverage['/swf.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['133'] = [];
  _$jscoverage['/swf.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['141'] = [];
  _$jscoverage['/swf.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['142'] = [];
  _$jscoverage['/swf.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['151'] = [];
  _$jscoverage['/swf.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['159'] = [];
  _$jscoverage['/swf.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['172'] = [];
  _$jscoverage['/swf.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['174'] = [];
  _$jscoverage['/swf.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['180'] = [];
  _$jscoverage['/swf.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['198'] = [];
  _$jscoverage['/swf.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['202'] = [];
  _$jscoverage['/swf.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['283'] = [];
  _$jscoverage['/swf.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['301'] = [];
  _$jscoverage['/swf.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['386'] = [];
  _$jscoverage['/swf.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['387'] = [];
  _$jscoverage['/swf.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['389'] = [];
  _$jscoverage['/swf.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['391'] = [];
  _$jscoverage['/swf.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['440'] = [];
  _$jscoverage['/swf.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['452'] = [];
  _$jscoverage['/swf.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['454'] = [];
  _$jscoverage['/swf.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['458'] = [];
  _$jscoverage['/swf.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['460'] = [];
  _$jscoverage['/swf.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['461'] = [];
  _$jscoverage['/swf.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['461'][2] = new BranchData();
  _$jscoverage['/swf.js'].branchData['463'] = [];
  _$jscoverage['/swf.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['465'] = [];
  _$jscoverage['/swf.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['470'] = [];
  _$jscoverage['/swf.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['481'] = [];
  _$jscoverage['/swf.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['485'] = [];
  _$jscoverage['/swf.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['506'] = [];
  _$jscoverage['/swf.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['526'] = [];
  _$jscoverage['/swf.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['548'] = [];
  _$jscoverage['/swf.js'].branchData['548'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['551'] = [];
  _$jscoverage['/swf.js'].branchData['551'][1] = new BranchData();
}
_$jscoverage['/swf.js'].branchData['551'][1].init(120, 4, 'data');
function visit56_551_1(result) {
  _$jscoverage['/swf.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['548'][1].init(17, 24, 'typeof data !== \'string\'');
function visit55_548_1(result) {
  _$jscoverage['/swf.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['526'][1].init(42, 6, 'OLD_IE');
function visit54_526_1(result) {
  _$jscoverage['/swf.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['506'][1].init(189, 2, 'ie');
function visit53_506_1(result) {
  _$jscoverage['/swf.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['485'][1].init(163, 15, 'k === FLASHVARS');
function visit52_485_1(result) {
  _$jscoverage['/swf.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['481'][1].init(50, 11, 'k in PARAMS');
function visit51_481_1(result) {
  _$jscoverage['/swf.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['470'][1].init(873, 20, 'nodeName === \'embed\'');
function visit50_470_1(result) {
  _$jscoverage['/swf.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['465'][1].init(277, 36, 'Dom.nodeName(params[i]) === \'object\'');
function visit49_465_1(result) {
  _$jscoverage['/swf.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['463'][1].init(164, 31, 'Dom.nodeName(param) === \'embed\'');
function visit48_463_1(result) {
  _$jscoverage['/swf.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['461'][2].init(26, 29, 'Dom.attr(param, \'name\') || \'\'');
function visit47_461_2(result) {
  _$jscoverage['/swf.js'].branchData['461'][2].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['461'][1].init(26, 56, '(Dom.attr(param, \'name\') || \'\').toLowerCase() === \'movie\'');
function visit46_461_1(result) {
  _$jscoverage['/swf.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['460'][1].init(56, 20, 'param.nodeType === 1');
function visit45_460_1(result) {
  _$jscoverage['/swf.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['458'][1].init(176, 17, 'i < params.length');
function visit44_458_1(result) {
  _$jscoverage['/swf.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['454'][1].init(58, 3, 'url');
function visit43_454_1(result) {
  _$jscoverage['/swf.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['452'][1].init(134, 21, 'nodeName === \'object\'');
function visit42_452_1(result) {
  _$jscoverage['/swf.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['440'][1].init(17, 28, 'typeof obj[i] === \'function\'');
function visit41_440_1(result) {
  _$jscoverage['/swf.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['391'][1].init(371, 20, 'nodeName === \'param\'');
function visit40_391_1(result) {
  _$jscoverage['/swf.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['389'][1].init(269, 21, 'nodeName === \'object\'');
function visit39_389_1(result) {
  _$jscoverage['/swf.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['387'][1].init(169, 20, 'nodeName === \'embed\'');
function visit38_387_1(result) {
  _$jscoverage['/swf.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['386'][1].init(67, 38, 'srcElement && Dom.nodeName(srcElement)');
function visit37_386_1(result) {
  _$jscoverage['/swf.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['301'][1].init(25, 21, 'typeof v === \'string\'');
function visit36_301_1(result) {
  _$jscoverage['/swf.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['283'][1].init(25, 21, 'typeof v === \'string\'');
function visit35_283_1(result) {
  _$jscoverage['/swf.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['202'][1].init(25, 26, 'swfObject.readyState === 4');
function visit34_202_1(result) {
  _$jscoverage['/swf.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['198'][1].init(246, 6, 'OLD_IE');
function visit33_198_1(result) {
  _$jscoverage['/swf.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['180'][1].init(154, 17, 'args.length !== 0');
function visit32_180_1(result) {
  _$jscoverage['/swf.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['174'][1].init(21, 9, 'swf[func]');
function visit31_174_1(result) {
  _$jscoverage['/swf.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['172'][1].init(103, 10, 'args || []');
function visit30_172_1(result) {
  _$jscoverage['/swf.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['159'][1].init(3528, 19, '!self.get(\'status\')');
function visit29_159_1(result) {
  _$jscoverage['/swf.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['151'][1].init(3308, 7, 'hasNoId');
function visit28_151_1(result) {
  _$jscoverage['/swf.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['142'][1].init(21, 6, 'OLD_IE');
function visit27_142_1(result) {
  _$jscoverage['/swf.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['141'][1].init(3009, 19, 'htmlMode === \'full\'');
function visit26_141_1(result) {
  _$jscoverage['/swf.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['133'][1].init(2754, 26, '\'outerHTML\' in placeHolder');
function visit25_133_1(result) {
  _$jscoverage['/swf.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['127'][1].init(2572, 8, 'elBefore');
function visit24_127_1(result) {
  _$jscoverage['/swf.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['118'][1].init(2229, 19, 'htmlMode === \'full\'');
function visit23_118_1(result) {
  _$jscoverage['/swf.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['108'][1].init(552, 22, 'params.flashVars || {}');
function visit22_108_1(result) {
  _$jscoverage['/swf.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['104'][2].init(76, 32, 'parseInt(attrs.height, 10) < 137');
function visit21_104_2(result) {
  _$jscoverage['/swf.js'].branchData['104'][2].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['104'][1].init(48, 60, '!/%$/.test(attrs.height) && parseInt(attrs.height, 10) < 137');
function visit20_104_1(result) {
  _$jscoverage['/swf.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['103'][1].init(318, 110, '!(\'height\' in attrs) || (!/%$/.test(attrs.height) && parseInt(attrs.height, 10) < 137)');
function visit19_103_1(result) {
  _$jscoverage['/swf.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['99'][2].init(74, 31, 'parseInt(attrs.width, 10) < 310');
function visit18_99_2(result) {
  _$jscoverage['/swf.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['99'][1].init(47, 58, '!/%$/.test(attrs.width) && parseInt(attrs.width, 10) < 310');
function visit17_99_1(result) {
  _$jscoverage['/swf.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['98'][1].init(115, 107, '!(\'width\' in attrs) || (!/%$/.test(attrs.width) && parseInt(attrs.width, 10) < 310)');
function visit16_98_1(result) {
  _$jscoverage['/swf.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['94'][1].init(130, 14, 'expressInstall');
function visit15_94_1(result) {
  _$jscoverage['/swf.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['90'][1].init(1096, 27, 'version && !fpvGTE(version)');
function visit14_90_1(result) {
  _$jscoverage['/swf.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['84'][1].init(931, 6, '!fpv()');
function visit13_84_1(result) {
  _$jscoverage['/swf.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['79'][1].init(757, 7, 'hasNoId');
function visit12_79_1(result) {
  _$jscoverage['/swf.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['77'][1].init(709, 29, 'attrs.id || S.guid(\'ks-swf-\')');
function visit11_77_1(result) {
  _$jscoverage['/swf.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/swf.js'].functionData[0]++;
  _$jscoverage['/swf.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/swf.js'].lineData[8]++;
  var Json = require('json');
  _$jscoverage['/swf.js'].lineData[9]++;
  var Attribute = require('attribute');
  _$jscoverage['/swf.js'].lineData[10]++;
  var FlashUA = require('swf/ua');
  _$jscoverage['/swf.js'].lineData[12]++;
  var OLD_IE = !!S.Env.host.ActiveXObject, TYPE = 'application/x-shockwave-flash', CID = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000', FLASHVARS = 'flashvars', EMPTY = '', LT = '<', GT = '>', doc = S.Env.host.document, fpv = FlashUA.fpv, fpvGEQ = FlashUA.fpvGEQ, fpvGTE = FlashUA.fpvGTE, OBJECT_TAG = 'object', encode = encodeURIComponent, PARAMS = {
  wmode: EMPTY, 
  allowscriptaccess: EMPTY, 
  allownetworking: EMPTY, 
  allowfullscreen: EMPTY, 
  play: 'false', 
  loop: EMPTY, 
  menu: EMPTY, 
  quality: EMPTY, 
  scale: EMPTY, 
  salign: EMPTY, 
  bgcolor: EMPTY, 
  devicefont: EMPTY, 
  hasPriority: EMPTY, 
  base: EMPTY, 
  swliveconnect: EMPTY, 
  seamlesstabbing: EMPTY};
  _$jscoverage['/swf.js'].lineData[51]++;
  var SWF;
  _$jscoverage['/swf.js'].lineData[57]++;
  SWF = Attribute.extend({
  constructor: function(config) {
  _$jscoverage['/swf.js'].functionData[1]++;
  _$jscoverage['/swf.js'].lineData[59]++;
  var self = this;
  _$jscoverage['/swf.js'].lineData[60]++;
  self.callSuper(config);
  _$jscoverage['/swf.js'].lineData[61]++;
  var expressInstall = self.get('expressInstall'), swf, html, id, htmlMode = self.get('htmlMode'), flashVars, params = self.get('params'), attrs = self.get('attrs'), doc = self.get('document'), placeHolder = Dom.create('<span>', undefined, doc), elBefore = self.get('elBefore'), installedSrc = self.get('src'), hasNoId = !('id' in attrs), idRegExp, version = self.get('version');
  _$jscoverage['/swf.js'].lineData[77]++;
  id = attrs.id = visit11_77_1(attrs.id || S.guid('ks-swf-'));
  _$jscoverage['/swf.js'].lineData[79]++;
  if (visit12_79_1(hasNoId)) {
    _$jscoverage['/swf.js'].lineData[80]++;
    idRegExp = new RegExp('\\s+id\\s*=\\s*[\'"]?' + S.escapeRegExp(id) + '[\'"]?', 'i');
  }
  _$jscoverage['/swf.js'].lineData[84]++;
  if (visit13_84_1(!fpv())) {
    _$jscoverage['/swf.js'].lineData[85]++;
    self.set('status', SWF.Status.NOT_INSTALLED);
    _$jscoverage['/swf.js'].lineData[86]++;
    return;
  }
  _$jscoverage['/swf.js'].lineData[90]++;
  if (visit14_90_1(version && !fpvGTE(version))) {
    _$jscoverage['/swf.js'].lineData[91]++;
    self.set('status', SWF.Status.TOO_LOW);
    _$jscoverage['/swf.js'].lineData[94]++;
    if (visit15_94_1(expressInstall)) {
      _$jscoverage['/swf.js'].lineData[95]++;
      installedSrc = expressInstall;
      _$jscoverage['/swf.js'].lineData[98]++;
      if (visit16_98_1(!('width' in attrs) || (visit17_99_1(!/%$/.test(attrs.width) && visit18_99_2(parseInt(attrs.width, 10) < 310))))) {
        _$jscoverage['/swf.js'].lineData[100]++;
        attrs.width = '310';
      }
      _$jscoverage['/swf.js'].lineData[103]++;
      if (visit19_103_1(!('height' in attrs) || (visit20_104_1(!/%$/.test(attrs.height) && visit21_104_2(parseInt(attrs.height, 10) < 137))))) {
        _$jscoverage['/swf.js'].lineData[105]++;
        attrs.height = '137';
      }
      _$jscoverage['/swf.js'].lineData[108]++;
      flashVars = params.flashVars = visit22_108_1(params.flashVars || {});
      _$jscoverage['/swf.js'].lineData[110]++;
      S.mix(flashVars, {
  MMredirectURL: location.href, 
  MMplayerType: OLD_IE ? 'ActiveX' : 'PlugIn', 
  MMdoctitle: doc.title.slice(0, 47) + ' - Flash Player Installation'});
    }
  }
  _$jscoverage['/swf.js'].lineData[118]++;
  if (visit23_118_1(htmlMode === 'full')) {
    _$jscoverage['/swf.js'].lineData[119]++;
    html = _stringSWFFull(installedSrc, attrs, params);
  } else {
    _$jscoverage['/swf.js'].lineData[121]++;
    html = _stringSWFDefault(installedSrc, attrs, params);
  }
  _$jscoverage['/swf.js'].lineData[125]++;
  self.set('html', idRegExp ? html.replace(idRegExp, '') : html);
  _$jscoverage['/swf.js'].lineData[127]++;
  if (visit24_127_1(elBefore)) {
    _$jscoverage['/swf.js'].lineData[128]++;
    Dom.insertBefore(placeHolder, elBefore);
  } else {
    _$jscoverage['/swf.js'].lineData[130]++;
    Dom.append(placeHolder, self.get('render'));
  }
  _$jscoverage['/swf.js'].lineData[133]++;
  if (visit25_133_1('outerHTML' in placeHolder)) {
    _$jscoverage['/swf.js'].lineData[134]++;
    placeHolder.outerHTML = html;
  } else {
    _$jscoverage['/swf.js'].lineData[136]++;
    placeHolder.parentNode.replaceChild(Dom.create(html), placeHolder);
  }
  _$jscoverage['/swf.js'].lineData[139]++;
  swf = Dom.get('#' + id, doc);
  _$jscoverage['/swf.js'].lineData[141]++;
  if (visit26_141_1(htmlMode === 'full')) {
    _$jscoverage['/swf.js'].lineData[142]++;
    if (visit27_142_1(OLD_IE)) {
      _$jscoverage['/swf.js'].lineData[143]++;
      self.set('swfObject', swf);
    } else {
      _$jscoverage['/swf.js'].lineData[145]++;
      self.set('swfObject', swf.parentNode);
    }
  } else {
    _$jscoverage['/swf.js'].lineData[148]++;
    self.set('swfObject', swf);
  }
  _$jscoverage['/swf.js'].lineData[151]++;
  if (visit28_151_1(hasNoId)) {
    _$jscoverage['/swf.js'].lineData[152]++;
    Dom.removeAttr(swf, 'id');
  }
  _$jscoverage['/swf.js'].lineData[157]++;
  self.set('el', swf);
  _$jscoverage['/swf.js'].lineData[159]++;
  if (visit29_159_1(!self.get('status'))) {
    _$jscoverage['/swf.js'].lineData[160]++;
    self.set('status', SWF.Status.SUCCESS);
  }
}, 
  'callSWF': function(func, args) {
  _$jscoverage['/swf.js'].functionData[2]++;
  _$jscoverage['/swf.js'].lineData[169]++;
  var swf = this.get('el'), ret, params;
  _$jscoverage['/swf.js'].lineData[172]++;
  args = visit30_172_1(args || []);
  _$jscoverage['/swf.js'].lineData[173]++;
  try {
    _$jscoverage['/swf.js'].lineData[174]++;
    if (visit31_174_1(swf[func])) {
      _$jscoverage['/swf.js'].lineData[175]++;
      ret = swf[func].apply(swf, args);
    }
  }  catch (e) {
  _$jscoverage['/swf.js'].lineData[179]++;
  params = '';
  _$jscoverage['/swf.js'].lineData[180]++;
  if (visit32_180_1(args.length !== 0)) {
    _$jscoverage['/swf.js'].lineData[181]++;
    params = '"' + args.join('", "') + '"';
  }
  _$jscoverage['/swf.js'].lineData[185]++;
  ret = (new Function('swf', 'return swf.' + func + '(' + params + ');'))(swf);
}
  _$jscoverage['/swf.js'].lineData[187]++;
  return ret;
}, 
  destroy: function() {
  _$jscoverage['/swf.js'].functionData[3]++;
  _$jscoverage['/swf.js'].lineData[193]++;
  var self = this;
  _$jscoverage['/swf.js'].lineData[194]++;
  var swfObject = self.get('swfObject');
  _$jscoverage['/swf.js'].lineData[198]++;
  if (visit33_198_1(OLD_IE)) {
    _$jscoverage['/swf.js'].lineData[199]++;
    swfObject.style.display = 'none';
    _$jscoverage['/swf.js'].lineData[201]++;
    (function remove() {
  _$jscoverage['/swf.js'].functionData[4]++;
  _$jscoverage['/swf.js'].lineData[202]++;
  if (visit34_202_1(swfObject.readyState === 4)) {
    _$jscoverage['/swf.js'].lineData[203]++;
    removeObjectInIE(swfObject);
  } else {
    _$jscoverage['/swf.js'].lineData[206]++;
    setTimeout(remove, 10);
  }
})();
  } else {
    _$jscoverage['/swf.js'].lineData[210]++;
    swfObject.parentNode.removeChild(swfObject);
  }
}}, {
  ATTRS: {
  expressInstall: {
  value: S.config('base') + 'swf/assets/expressInstall.swf'}, 
  src: {}, 
  version: {
  value: '9'}, 
  params: {
  value: {}}, 
  attrs: {
  value: {}}, 
  render: {
  setter: function(v) {
  _$jscoverage['/swf.js'].functionData[5]++;
  _$jscoverage['/swf.js'].lineData[283]++;
  if (visit35_283_1(typeof v === 'string')) {
    _$jscoverage['/swf.js'].lineData[284]++;
    v = Dom.get(v, this.get('document'));
  }
  _$jscoverage['/swf.js'].lineData[286]++;
  return v;
}, 
  valueFn: function() {
  _$jscoverage['/swf.js'].functionData[6]++;
  _$jscoverage['/swf.js'].lineData[289]++;
  return document.body;
}}, 
  elBefore: {
  setter: function(v) {
  _$jscoverage['/swf.js'].functionData[7]++;
  _$jscoverage['/swf.js'].lineData[301]++;
  if (visit36_301_1(typeof v === 'string')) {
    _$jscoverage['/swf.js'].lineData[302]++;
    v = Dom.get(v, this.get('document'));
  }
  _$jscoverage['/swf.js'].lineData[304]++;
  return v;
}}, 
  document: {
  value: doc}, 
  status: {}, 
  el: {}, 
  swfObject: {}, 
  html: {}, 
  htmlMode: {
  value: 'default'}}, 
  getSrc: function(swf) {
  _$jscoverage['/swf.js'].functionData[8]++;
  _$jscoverage['/swf.js'].lineData[384]++;
  swf = Dom.get(swf);
  _$jscoverage['/swf.js'].lineData[385]++;
  var srcElement = getSrcElements(swf)[0], nodeName = visit37_386_1(srcElement && Dom.nodeName(srcElement));
  _$jscoverage['/swf.js'].lineData[387]++;
  if (visit38_387_1(nodeName === 'embed')) {
    _$jscoverage['/swf.js'].lineData[388]++;
    return Dom.attr(srcElement, 'src');
  } else {
    _$jscoverage['/swf.js'].lineData[389]++;
    if (visit39_389_1(nodeName === 'object')) {
      _$jscoverage['/swf.js'].lineData[390]++;
      return Dom.attr(srcElement, 'data');
    } else {
      _$jscoverage['/swf.js'].lineData[391]++;
      if (visit40_391_1(nodeName === 'param')) {
        _$jscoverage['/swf.js'].lineData[392]++;
        return Dom.attr(srcElement, 'value');
      }
    }
  }
  _$jscoverage['/swf.js'].lineData[394]++;
  return null;
}, 
  Status: {
  TOO_LOW: 'flash version is too low', 
  NOT_INSTALLED: 'flash is not installed', 
  SUCCESS: 'success'}, 
  HtmlMode: {
  DEFAULT: 'default', 
  FULL: 'full'}, 
  fpv: fpv, 
  fpvGEQ: fpvGEQ, 
  fpvGTE: fpvGTE});
  _$jscoverage['/swf.js'].lineData[438]++;
  function removeObjectInIE(obj) {
    _$jscoverage['/swf.js'].functionData[9]++;
    _$jscoverage['/swf.js'].lineData[439]++;
    for (var i in obj) {
      _$jscoverage['/swf.js'].lineData[440]++;
      if (visit41_440_1(typeof obj[i] === 'function')) {
        _$jscoverage['/swf.js'].lineData[441]++;
        obj[i] = null;
      }
    }
    _$jscoverage['/swf.js'].lineData[444]++;
    obj.parentNode.removeChild(obj);
  }
  _$jscoverage['/swf.js'].lineData[447]++;
  function getSrcElements(swf) {
    _$jscoverage['/swf.js'].functionData[10]++;
    _$jscoverage['/swf.js'].lineData[448]++;
    var url = '', params, i, param, elements = [], nodeName = Dom.nodeName(swf);
    _$jscoverage['/swf.js'].lineData[452]++;
    if (visit42_452_1(nodeName === 'object')) {
      _$jscoverage['/swf.js'].lineData[453]++;
      url = Dom.attr(swf, 'data');
      _$jscoverage['/swf.js'].lineData[454]++;
      if (visit43_454_1(url)) {
        _$jscoverage['/swf.js'].lineData[455]++;
        elements.push(swf);
      }
      _$jscoverage['/swf.js'].lineData[457]++;
      params = swf.childNodes;
      _$jscoverage['/swf.js'].lineData[458]++;
      for (i = 0; visit44_458_1(i < params.length); i++) {
        _$jscoverage['/swf.js'].lineData[459]++;
        param = params[i];
        _$jscoverage['/swf.js'].lineData[460]++;
        if (visit45_460_1(param.nodeType === 1)) {
          _$jscoverage['/swf.js'].lineData[461]++;
          if (visit46_461_1((visit47_461_2(Dom.attr(param, 'name') || '')).toLowerCase() === 'movie')) {
            _$jscoverage['/swf.js'].lineData[462]++;
            elements.push(param);
          } else {
            _$jscoverage['/swf.js'].lineData[463]++;
            if (visit48_463_1(Dom.nodeName(param) === 'embed')) {
              _$jscoverage['/swf.js'].lineData[464]++;
              elements.push(param);
            } else {
              _$jscoverage['/swf.js'].lineData[465]++;
              if (visit49_465_1(Dom.nodeName(params[i]) === 'object')) {
                _$jscoverage['/swf.js'].lineData[466]++;
                elements.push(param);
              }
            }
          }
        }
      }
    } else {
      _$jscoverage['/swf.js'].lineData[470]++;
      if (visit50_470_1(nodeName === 'embed')) {
        _$jscoverage['/swf.js'].lineData[471]++;
        elements.push(swf);
      }
    }
    _$jscoverage['/swf.js'].lineData[473]++;
    return elements;
  }
  _$jscoverage['/swf.js'].lineData[477]++;
  function collectionParams(params) {
    _$jscoverage['/swf.js'].functionData[11]++;
    _$jscoverage['/swf.js'].lineData[478]++;
    var par = EMPTY;
    _$jscoverage['/swf.js'].lineData[479]++;
    S.each(params, function(v, k) {
  _$jscoverage['/swf.js'].functionData[12]++;
  _$jscoverage['/swf.js'].lineData[480]++;
  k = k.toLowerCase();
  _$jscoverage['/swf.js'].lineData[481]++;
  if (visit51_481_1(k in PARAMS)) {
    _$jscoverage['/swf.js'].lineData[482]++;
    par += stringParam(k, v);
  } else {
    _$jscoverage['/swf.js'].lineData[485]++;
    if (visit52_485_1(k === FLASHVARS)) {
      _$jscoverage['/swf.js'].lineData[486]++;
      par += stringParam(k, toFlashVars(v));
    }
  }
});
    _$jscoverage['/swf.js'].lineData[489]++;
    return par;
  }
  _$jscoverage['/swf.js'].lineData[492]++;
  function _stringSWFDefault(src, attrs, params) {
    _$jscoverage['/swf.js'].functionData[13]++;
    _$jscoverage['/swf.js'].lineData[493]++;
    return _stringSWF(src, attrs, params, OLD_IE) + LT + '/' + OBJECT_TAG + GT;
  }
  _$jscoverage['/swf.js'].lineData[496]++;
  function _stringSWF(src, attrs, params, ie) {
    _$jscoverage['/swf.js'].functionData[14]++;
    _$jscoverage['/swf.js'].lineData[497]++;
    var res, attr = EMPTY, par = EMPTY;
    _$jscoverage['/swf.js'].lineData[502]++;
    S.each(attrs, function(v, k) {
  _$jscoverage['/swf.js'].functionData[15]++;
  _$jscoverage['/swf.js'].lineData[503]++;
  attr += stringAttr(k, v);
});
    _$jscoverage['/swf.js'].lineData[506]++;
    if (visit53_506_1(ie)) {
      _$jscoverage['/swf.js'].lineData[507]++;
      attr += stringAttr('classid', CID);
      _$jscoverage['/swf.js'].lineData[508]++;
      par += stringParam('movie', src);
    } else {
      _$jscoverage['/swf.js'].lineData[511]++;
      attr += stringAttr('data', src);
      _$jscoverage['/swf.js'].lineData[513]++;
      attr += stringAttr('type', TYPE);
    }
    _$jscoverage['/swf.js'].lineData[516]++;
    par += collectionParams(params);
    _$jscoverage['/swf.js'].lineData[518]++;
    res = LT + OBJECT_TAG + attr + GT + par;
    _$jscoverage['/swf.js'].lineData[520]++;
    return res;
  }
  _$jscoverage['/swf.js'].lineData[524]++;
  function _stringSWFFull(src, attrs, params) {
    _$jscoverage['/swf.js'].functionData[16]++;
    _$jscoverage['/swf.js'].lineData[525]++;
    var outside, inside;
    _$jscoverage['/swf.js'].lineData[526]++;
    if (visit54_526_1(OLD_IE)) {
      _$jscoverage['/swf.js'].lineData[527]++;
      outside = _stringSWF(src, attrs, params, 1);
      _$jscoverage['/swf.js'].lineData[528]++;
      delete attrs.id;
      _$jscoverage['/swf.js'].lineData[529]++;
      delete attrs.style;
      _$jscoverage['/swf.js'].lineData[530]++;
      inside = _stringSWF(src, attrs, params, 0);
    } else {
      _$jscoverage['/swf.js'].lineData[532]++;
      inside = _stringSWF(src, attrs, params, 0);
      _$jscoverage['/swf.js'].lineData[533]++;
      delete attrs.id;
      _$jscoverage['/swf.js'].lineData[534]++;
      delete attrs.style;
      _$jscoverage['/swf.js'].lineData[535]++;
      outside = _stringSWF(src, attrs, params, 1);
    }
    _$jscoverage['/swf.js'].lineData[537]++;
    return outside + inside + LT + '/' + OBJECT_TAG + GT + LT + '/' + OBJECT_TAG + GT;
  }
  _$jscoverage['/swf.js'].lineData[544]++;
  function toFlashVars(obj) {
    _$jscoverage['/swf.js'].functionData[17]++;
    _$jscoverage['/swf.js'].lineData[545]++;
    var arr = [], ret;
    _$jscoverage['/swf.js'].lineData[547]++;
    S.each(obj, function(data, prop) {
  _$jscoverage['/swf.js'].functionData[18]++;
  _$jscoverage['/swf.js'].lineData[548]++;
  if (visit55_548_1(typeof data !== 'string')) {
    _$jscoverage['/swf.js'].lineData[549]++;
    data = Json.stringify(data);
  }
  _$jscoverage['/swf.js'].lineData[551]++;
  if (visit56_551_1(data)) {
    _$jscoverage['/swf.js'].lineData[552]++;
    arr.push(prop + '=' + encode(data));
  }
});
    _$jscoverage['/swf.js'].lineData[555]++;
    ret = arr.join('&');
    _$jscoverage['/swf.js'].lineData[556]++;
    return ret;
  }
  _$jscoverage['/swf.js'].lineData[559]++;
  function stringParam(key, value) {
    _$jscoverage['/swf.js'].functionData[19]++;
    _$jscoverage['/swf.js'].lineData[560]++;
    return '<param name="' + key + '" value="' + value + '"></param>';
  }
  _$jscoverage['/swf.js'].lineData[563]++;
  function stringAttr(key, value) {
    _$jscoverage['/swf.js'].functionData[20]++;
    _$jscoverage['/swf.js'].lineData[564]++;
    return ' ' + key + '=' + '"' + value + '"';
  }
  _$jscoverage['/swf.js'].lineData[567]++;
  return SWF;
});
