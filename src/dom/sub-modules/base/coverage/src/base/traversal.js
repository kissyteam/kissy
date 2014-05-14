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
if (! _$jscoverage['/base/traversal.js']) {
  _$jscoverage['/base/traversal.js'] = {};
  _$jscoverage['/base/traversal.js'].lineData = [];
  _$jscoverage['/base/traversal.js'].lineData[6] = 0;
  _$jscoverage['/base/traversal.js'].lineData[7] = 0;
  _$jscoverage['/base/traversal.js'].lineData[8] = 0;
  _$jscoverage['/base/traversal.js'].lineData[9] = 0;
  _$jscoverage['/base/traversal.js'].lineData[12] = 0;
  _$jscoverage['/base/traversal.js'].lineData[21] = 0;
  _$jscoverage['/base/traversal.js'].lineData[35] = 0;
  _$jscoverage['/base/traversal.js'].lineData[36] = 0;
  _$jscoverage['/base/traversal.js'].lineData[50] = 0;
  _$jscoverage['/base/traversal.js'].lineData[51] = 0;
  _$jscoverage['/base/traversal.js'].lineData[63] = 0;
  _$jscoverage['/base/traversal.js'].lineData[64] = 0;
  _$jscoverage['/base/traversal.js'].lineData[76] = 0;
  _$jscoverage['/base/traversal.js'].lineData[77] = 0;
  _$jscoverage['/base/traversal.js'].lineData[89] = 0;
  _$jscoverage['/base/traversal.js'].lineData[101] = 0;
  _$jscoverage['/base/traversal.js'].lineData[112] = 0;
  _$jscoverage['/base/traversal.js'].lineData[122] = 0;
  _$jscoverage['/base/traversal.js'].lineData[133] = 0;
  _$jscoverage['/base/traversal.js'].lineData[143] = 0;
  _$jscoverage['/base/traversal.js'].lineData[144] = 0;
  _$jscoverage['/base/traversal.js'].lineData[145] = 0;
  _$jscoverage['/base/traversal.js'].lineData[146] = 0;
  _$jscoverage['/base/traversal.js'].lineData[148] = 0;
  _$jscoverage['/base/traversal.js'].lineData[156] = 0;
  _$jscoverage['/base/traversal.js'].lineData[163] = 0;
  _$jscoverage['/base/traversal.js'].lineData[164] = 0;
  _$jscoverage['/base/traversal.js'].lineData[165] = 0;
  _$jscoverage['/base/traversal.js'].lineData[166] = 0;
  _$jscoverage['/base/traversal.js'].lineData[168] = 0;
  _$jscoverage['/base/traversal.js'].lineData[169] = 0;
  _$jscoverage['/base/traversal.js'].lineData[170] = 0;
  _$jscoverage['/base/traversal.js'].lineData[171] = 0;
  _$jscoverage['/base/traversal.js'].lineData[174] = 0;
  _$jscoverage['/base/traversal.js'].lineData[177] = 0;
  _$jscoverage['/base/traversal.js'].lineData[179] = 0;
  _$jscoverage['/base/traversal.js'].lineData[180] = 0;
  _$jscoverage['/base/traversal.js'].lineData[183] = 0;
  _$jscoverage['/base/traversal.js'].lineData[194] = 0;
  _$jscoverage['/base/traversal.js'].lineData[195] = 0;
  _$jscoverage['/base/traversal.js'].lineData[196] = 0;
  _$jscoverage['/base/traversal.js'].lineData[197] = 0;
  _$jscoverage['/base/traversal.js'].lineData[199] = 0;
  _$jscoverage['/base/traversal.js'].lineData[200] = 0;
  _$jscoverage['/base/traversal.js'].lineData[201] = 0;
  _$jscoverage['/base/traversal.js'].lineData[204] = 0;
  _$jscoverage['/base/traversal.js'].lineData[212] = 0;
  _$jscoverage['/base/traversal.js'].lineData[213] = 0;
  _$jscoverage['/base/traversal.js'].lineData[214] = 0;
  _$jscoverage['/base/traversal.js'].lineData[216] = 0;
  _$jscoverage['/base/traversal.js'].lineData[217] = 0;
  _$jscoverage['/base/traversal.js'].lineData[219] = 0;
  _$jscoverage['/base/traversal.js'].lineData[220] = 0;
  _$jscoverage['/base/traversal.js'].lineData[222] = 0;
  _$jscoverage['/base/traversal.js'].lineData[223] = 0;
  _$jscoverage['/base/traversal.js'].lineData[225] = 0;
  _$jscoverage['/base/traversal.js'].lineData[227] = 0;
  _$jscoverage['/base/traversal.js'].lineData[229] = 0;
  _$jscoverage['/base/traversal.js'].lineData[231] = 0;
  _$jscoverage['/base/traversal.js'].lineData[236] = 0;
  _$jscoverage['/base/traversal.js'].lineData[237] = 0;
  _$jscoverage['/base/traversal.js'].lineData[238] = 0;
  _$jscoverage['/base/traversal.js'].lineData[239] = 0;
  _$jscoverage['/base/traversal.js'].lineData[240] = 0;
  _$jscoverage['/base/traversal.js'].lineData[245] = 0;
  _$jscoverage['/base/traversal.js'].lineData[246] = 0;
  _$jscoverage['/base/traversal.js'].lineData[252] = 0;
  _$jscoverage['/base/traversal.js'].lineData[253] = 0;
  _$jscoverage['/base/traversal.js'].lineData[254] = 0;
  _$jscoverage['/base/traversal.js'].lineData[257] = 0;
  _$jscoverage['/base/traversal.js'].lineData[260] = 0;
  _$jscoverage['/base/traversal.js'].lineData[263] = 0;
  _$jscoverage['/base/traversal.js'].lineData[264] = 0;
  _$jscoverage['/base/traversal.js'].lineData[265] = 0;
  _$jscoverage['/base/traversal.js'].lineData[267] = 0;
  _$jscoverage['/base/traversal.js'].lineData[268] = 0;
  _$jscoverage['/base/traversal.js'].lineData[269] = 0;
  _$jscoverage['/base/traversal.js'].lineData[270] = 0;
  _$jscoverage['/base/traversal.js'].lineData[272] = 0;
  _$jscoverage['/base/traversal.js'].lineData[273] = 0;
  _$jscoverage['/base/traversal.js'].lineData[274] = 0;
  _$jscoverage['/base/traversal.js'].lineData[277] = 0;
  _$jscoverage['/base/traversal.js'].lineData[278] = 0;
  _$jscoverage['/base/traversal.js'].lineData[280] = 0;
  _$jscoverage['/base/traversal.js'].lineData[284] = 0;
  _$jscoverage['/base/traversal.js'].lineData[285] = 0;
  _$jscoverage['/base/traversal.js'].lineData[292] = 0;
  _$jscoverage['/base/traversal.js'].lineData[293] = 0;
  _$jscoverage['/base/traversal.js'].lineData[296] = 0;
  _$jscoverage['/base/traversal.js'].lineData[297] = 0;
  _$jscoverage['/base/traversal.js'].lineData[298] = 0;
  _$jscoverage['/base/traversal.js'].lineData[299] = 0;
  _$jscoverage['/base/traversal.js'].lineData[300] = 0;
  _$jscoverage['/base/traversal.js'].lineData[301] = 0;
  _$jscoverage['/base/traversal.js'].lineData[303] = 0;
  _$jscoverage['/base/traversal.js'].lineData[304] = 0;
  _$jscoverage['/base/traversal.js'].lineData[306] = 0;
  _$jscoverage['/base/traversal.js'].lineData[308] = 0;
  _$jscoverage['/base/traversal.js'].lineData[309] = 0;
  _$jscoverage['/base/traversal.js'].lineData[313] = 0;
  _$jscoverage['/base/traversal.js'].lineData[316] = 0;
}
if (! _$jscoverage['/base/traversal.js'].functionData) {
  _$jscoverage['/base/traversal.js'].functionData = [];
  _$jscoverage['/base/traversal.js'].functionData[0] = 0;
  _$jscoverage['/base/traversal.js'].functionData[1] = 0;
  _$jscoverage['/base/traversal.js'].functionData[2] = 0;
  _$jscoverage['/base/traversal.js'].functionData[3] = 0;
  _$jscoverage['/base/traversal.js'].functionData[4] = 0;
  _$jscoverage['/base/traversal.js'].functionData[5] = 0;
  _$jscoverage['/base/traversal.js'].functionData[6] = 0;
  _$jscoverage['/base/traversal.js'].functionData[7] = 0;
  _$jscoverage['/base/traversal.js'].functionData[8] = 0;
  _$jscoverage['/base/traversal.js'].functionData[9] = 0;
  _$jscoverage['/base/traversal.js'].functionData[10] = 0;
  _$jscoverage['/base/traversal.js'].functionData[11] = 0;
  _$jscoverage['/base/traversal.js'].functionData[12] = 0;
  _$jscoverage['/base/traversal.js'].functionData[13] = 0;
  _$jscoverage['/base/traversal.js'].functionData[14] = 0;
  _$jscoverage['/base/traversal.js'].functionData[15] = 0;
  _$jscoverage['/base/traversal.js'].functionData[16] = 0;
  _$jscoverage['/base/traversal.js'].functionData[17] = 0;
  _$jscoverage['/base/traversal.js'].functionData[18] = 0;
  _$jscoverage['/base/traversal.js'].functionData[19] = 0;
}
if (! _$jscoverage['/base/traversal.js'].branchData) {
  _$jscoverage['/base/traversal.js'].branchData = {};
  _$jscoverage['/base/traversal.js'].branchData['36'] = [];
  _$jscoverage['/base/traversal.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['51'] = [];
  _$jscoverage['/base/traversal.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['64'] = [];
  _$jscoverage['/base/traversal.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['77'] = [];
  _$jscoverage['/base/traversal.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['145'] = [];
  _$jscoverage['/base/traversal.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['163'] = [];
  _$jscoverage['/base/traversal.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['164'] = [];
  _$jscoverage['/base/traversal.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['165'] = [];
  _$jscoverage['/base/traversal.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['170'] = [];
  _$jscoverage['/base/traversal.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['179'] = [];
  _$jscoverage['/base/traversal.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['196'] = [];
  _$jscoverage['/base/traversal.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['199'] = [];
  _$jscoverage['/base/traversal.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['200'] = [];
  _$jscoverage['/base/traversal.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['213'] = [];
  _$jscoverage['/base/traversal.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['216'] = [];
  _$jscoverage['/base/traversal.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['219'] = [];
  _$jscoverage['/base/traversal.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['222'] = [];
  _$jscoverage['/base/traversal.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['225'] = [];
  _$jscoverage['/base/traversal.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['225'][2] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['227'] = [];
  _$jscoverage['/base/traversal.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['236'] = [];
  _$jscoverage['/base/traversal.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['240'] = [];
  _$jscoverage['/base/traversal.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['245'] = [];
  _$jscoverage['/base/traversal.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['245'][2] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['246'] = [];
  _$jscoverage['/base/traversal.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['247'] = [];
  _$jscoverage['/base/traversal.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['247'][2] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['248'] = [];
  _$jscoverage['/base/traversal.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['248'][2] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['250'] = [];
  _$jscoverage['/base/traversal.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['251'] = [];
  _$jscoverage['/base/traversal.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['253'] = [];
  _$jscoverage['/base/traversal.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['260'] = [];
  _$jscoverage['/base/traversal.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['264'] = [];
  _$jscoverage['/base/traversal.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['267'] = [];
  _$jscoverage['/base/traversal.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['269'] = [];
  _$jscoverage['/base/traversal.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['272'] = [];
  _$jscoverage['/base/traversal.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['273'] = [];
  _$jscoverage['/base/traversal.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['277'] = [];
  _$jscoverage['/base/traversal.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['292'] = [];
  _$jscoverage['/base/traversal.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['296'] = [];
  _$jscoverage['/base/traversal.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['298'] = [];
  _$jscoverage['/base/traversal.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['300'] = [];
  _$jscoverage['/base/traversal.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['300'][2] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['303'] = [];
  _$jscoverage['/base/traversal.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/base/traversal.js'].branchData['308'] = [];
  _$jscoverage['/base/traversal.js'].branchData['308'][1] = new BranchData();
}
_$jscoverage['/base/traversal.js'].branchData['308'][1].init(412, 6, 'filter');
function visit566_308_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['303'][1].init(178, 11, 'el === elem');
function visit565_303_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['300'][2].init(66, 37, 'el.nodeType !== NodeType.ELEMENT_NODE');
function visit564_300_2(result) {
  _$jscoverage['/base/traversal.js'].branchData['300'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['300'][1].init(52, 51, '!allowText && el.nodeType !== NodeType.ELEMENT_NODE');
function visit563_300_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['298'][1].init(84, 14, 'i < tmp.length');
function visit562_298_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['296'][1].init(248, 10, 'parentNode');
function visit561_296_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['292'][1].init(161, 14, 'elem && parent');
function visit560_292_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['277'][1].init(384, 22, 'Dom.test(elem, filter)');
function visit559_277_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['273'][1].init(22, 25, 'Dom.test(elem, filter[i])');
function visit558_273_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['272'][1].init(133, 5, 'i < l');
function visit557_272_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['269'][1].init(57, 2, '!l');
function visit556_269_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['267'][1].init(75, 20, 'util.isArray(filter)');
function visit555_267_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['264'][1].init(14, 7, '!filter');
function visit554_264_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['260'][1].init(1336, 14, 'ret[0] || null');
function visit553_260_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['253'][1].init(55, 8, '!isArray');
function visit552_253_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['251'][1].init(45, 33, '!extraFilter || extraFilter(elem)');
function visit551_251_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['250'][1].init(156, 80, 'testFilter(elem, filter) && (!extraFilter || extraFilter(elem))');
function visit550_250_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['248'][2].init(65, 36, 'elem.nodeType === NodeType.TEXT_NODE');
function visit549_248_2(result) {
  _$jscoverage['/base/traversal.js'].branchData['248'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['248'][1].init(63, 53, 'elem.nodeType === NodeType.TEXT_NODE && allowTextNode');
function visit548_248_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['247'][2].init(0, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit547_247_2(result) {
  _$jscoverage['/base/traversal.js'].branchData['247'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['247'][1].init(-1, 117, 'elem.nodeType === NodeType.ELEMENT_NODE || elem.nodeType === NodeType.TEXT_NODE && allowTextNode');
function visit546_247_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['246'][1].init(37, 237, '(elem.nodeType === NodeType.ELEMENT_NODE || elem.nodeType === NodeType.TEXT_NODE && allowTextNode) && testFilter(elem, filter) && (!extraFilter || extraFilter(elem))');
function visit545_246_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['245'][2].init(829, 16, 'elem !== context');
function visit544_245_2(result) {
  _$jscoverage['/base/traversal.js'].branchData['245'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['245'][1].init(821, 24, 'elem && elem !== context');
function visit543_245_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['240'][1].init(25, 21, '++fi === filterLength');
function visit542_240_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['236'][1].init(561, 26, 'typeof filter === \'number\'');
function visit541_236_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['227'][1].init(352, 20, 'filter === undefined');
function visit540_227_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['225'][2].init(299, 27, 'context && Dom.get(context)');
function visit539_225_2(result) {
  _$jscoverage['/base/traversal.js'].branchData['225'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['225'][1].init(299, 36, '(context && Dom.get(context)) || null');
function visit538_225_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['222'][1].init(233, 5, '!elem');
function visit537_222_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['219'][1].init(157, 11, '!includeSef');
function visit536_219_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['216'][1].init(91, 12, 'filter === 0');
function visit535_216_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['213'][1].init(14, 23, '!(elem = Dom.get(elem))');
function visit534_213_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['200'][1].init(26, 15, 'n1[i] !== n2[i]');
function visit533_200_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['199'][1].init(218, 6, 'i >= 0');
function visit532_199_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['196'][1].init(96, 23, 'n1.length !== n2.length');
function visit531_196_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['179'][1].init(703, 22, 'typeof s2 === \'string\'');
function visit530_179_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['170'][1].init(30, 36, 'c.nodeType === NodeType.ELEMENT_NODE');
function visit529_170_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['165'][1].init(72, 2, '!p');
function visit528_165_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['164'][1].init(26, 19, 'el && el.parentNode');
function visit527_164_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['163'][1].init(209, 3, '!s2');
function visit526_163_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['145'][1].init(120, 22, 'container && contained');
function visit525_145_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['77'][1].init(76, 22, 'elem && elem.lastChild');
function visit524_77_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['64'][1].init(76, 23, 'elem && elem.firstChild');
function visit523_64_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['51'][1].init(29, 49, 'elem.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE');
function visit522_51_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].branchData['36'][1].init(29, 49, 'elem.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE');
function visit521_36_1(result) {
  _$jscoverage['/base/traversal.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/traversal.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/traversal.js'].functionData[0]++;
  _$jscoverage['/base/traversal.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/base/traversal.js'].lineData[8]++;
  var Dom = require('./api');
  _$jscoverage['/base/traversal.js'].lineData[9]++;
  var NodeType = Dom.NodeType, CONTAIN_MASK = 16;
  _$jscoverage['/base/traversal.js'].lineData[12]++;
  util.mix(Dom, {
  _contains: function(a, b) {
  _$jscoverage['/base/traversal.js'].functionData[1]++;
  _$jscoverage['/base/traversal.js'].lineData[21]++;
  return !!(a.compareDocumentPosition(b) & CONTAIN_MASK);
}, 
  closest: function(selector, filter, context, allowTextNode) {
  _$jscoverage['/base/traversal.js'].functionData[2]++;
  _$jscoverage['/base/traversal.js'].lineData[35]++;
  return nth(selector, filter, 'parentNode', function(elem) {
  _$jscoverage['/base/traversal.js'].functionData[3]++;
  _$jscoverage['/base/traversal.js'].lineData[36]++;
  return visit521_36_1(elem.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE);
}, context, true, allowTextNode);
}, 
  parent: function(selector, filter, context) {
  _$jscoverage['/base/traversal.js'].functionData[4]++;
  _$jscoverage['/base/traversal.js'].lineData[50]++;
  return nth(selector, filter, 'parentNode', function(elem) {
  _$jscoverage['/base/traversal.js'].functionData[5]++;
  _$jscoverage['/base/traversal.js'].lineData[51]++;
  return visit522_51_1(elem.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE);
}, context, undefined);
}, 
  first: function(selector, filter, allowTextNode) {
  _$jscoverage['/base/traversal.js'].functionData[6]++;
  _$jscoverage['/base/traversal.js'].lineData[63]++;
  var elem = Dom.get(selector);
  _$jscoverage['/base/traversal.js'].lineData[64]++;
  return nth(visit523_64_1(elem && elem.firstChild), filter, 'nextSibling', undefined, undefined, true, allowTextNode);
}, 
  last: function(selector, filter, allowTextNode) {
  _$jscoverage['/base/traversal.js'].functionData[7]++;
  _$jscoverage['/base/traversal.js'].lineData[76]++;
  var elem = Dom.get(selector);
  _$jscoverage['/base/traversal.js'].lineData[77]++;
  return nth(visit524_77_1(elem && elem.lastChild), filter, 'previousSibling', undefined, undefined, true, allowTextNode);
}, 
  next: function(selector, filter, allowTextNode) {
  _$jscoverage['/base/traversal.js'].functionData[8]++;
  _$jscoverage['/base/traversal.js'].lineData[89]++;
  return nth(selector, filter, 'nextSibling', undefined, undefined, undefined, allowTextNode);
}, 
  prev: function(selector, filter, allowTextNode) {
  _$jscoverage['/base/traversal.js'].functionData[9]++;
  _$jscoverage['/base/traversal.js'].lineData[101]++;
  return nth(selector, filter, 'previousSibling', undefined, undefined, undefined, allowTextNode);
}, 
  siblings: function(selector, filter, allowTextNode) {
  _$jscoverage['/base/traversal.js'].functionData[10]++;
  _$jscoverage['/base/traversal.js'].lineData[112]++;
  return getSiblings(selector, filter, true, allowTextNode);
}, 
  children: function(selector, filter) {
  _$jscoverage['/base/traversal.js'].functionData[11]++;
  _$jscoverage['/base/traversal.js'].lineData[122]++;
  return getSiblings(selector, filter, undefined);
}, 
  contents: function(selector, filter) {
  _$jscoverage['/base/traversal.js'].functionData[12]++;
  _$jscoverage['/base/traversal.js'].lineData[133]++;
  return getSiblings(selector, filter, undefined, 1);
}, 
  contains: function(container, contained) {
  _$jscoverage['/base/traversal.js'].functionData[13]++;
  _$jscoverage['/base/traversal.js'].lineData[143]++;
  container = Dom.get(container);
  _$jscoverage['/base/traversal.js'].lineData[144]++;
  contained = Dom.get(contained);
  _$jscoverage['/base/traversal.js'].lineData[145]++;
  if (visit525_145_1(container && contained)) {
    _$jscoverage['/base/traversal.js'].lineData[146]++;
    return Dom._contains(container, contained);
  }
  _$jscoverage['/base/traversal.js'].lineData[148]++;
  return false;
}, 
  index: function(selector, s2) {
  _$jscoverage['/base/traversal.js'].functionData[14]++;
  _$jscoverage['/base/traversal.js'].lineData[156]++;
  var els = Dom.query(selector), c, n = 0, p, els2, el = els[0];
  _$jscoverage['/base/traversal.js'].lineData[163]++;
  if (visit526_163_1(!s2)) {
    _$jscoverage['/base/traversal.js'].lineData[164]++;
    p = visit527_164_1(el && el.parentNode);
    _$jscoverage['/base/traversal.js'].lineData[165]++;
    if (visit528_165_1(!p)) {
      _$jscoverage['/base/traversal.js'].lineData[166]++;
      return -1;
    }
    _$jscoverage['/base/traversal.js'].lineData[168]++;
    c = el;
    _$jscoverage['/base/traversal.js'].lineData[169]++;
    while ((c = c.previousSibling)) {
      _$jscoverage['/base/traversal.js'].lineData[170]++;
      if (visit529_170_1(c.nodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/traversal.js'].lineData[171]++;
        n++;
      }
    }
    _$jscoverage['/base/traversal.js'].lineData[174]++;
    return n;
  }
  _$jscoverage['/base/traversal.js'].lineData[177]++;
  els2 = Dom.query(s2);
  _$jscoverage['/base/traversal.js'].lineData[179]++;
  if (visit530_179_1(typeof s2 === 'string')) {
    _$jscoverage['/base/traversal.js'].lineData[180]++;
    return util.indexOf(el, els2);
  }
  _$jscoverage['/base/traversal.js'].lineData[183]++;
  return util.indexOf(els2[0], els);
}, 
  equals: function(n1, n2) {
  _$jscoverage['/base/traversal.js'].functionData[15]++;
  _$jscoverage['/base/traversal.js'].lineData[194]++;
  n1 = Dom.query(n1);
  _$jscoverage['/base/traversal.js'].lineData[195]++;
  n2 = Dom.query(n2);
  _$jscoverage['/base/traversal.js'].lineData[196]++;
  if (visit531_196_1(n1.length !== n2.length)) {
    _$jscoverage['/base/traversal.js'].lineData[197]++;
    return false;
  }
  _$jscoverage['/base/traversal.js'].lineData[199]++;
  for (var i = n1.length; visit532_199_1(i >= 0); i--) {
    _$jscoverage['/base/traversal.js'].lineData[200]++;
    if (visit533_200_1(n1[i] !== n2[i])) {
      _$jscoverage['/base/traversal.js'].lineData[201]++;
      return false;
    }
  }
  _$jscoverage['/base/traversal.js'].lineData[204]++;
  return true;
}});
  _$jscoverage['/base/traversal.js'].lineData[212]++;
  function nth(elem, filter, direction, extraFilter, context, includeSef, allowTextNode) {
    _$jscoverage['/base/traversal.js'].functionData[16]++;
    _$jscoverage['/base/traversal.js'].lineData[213]++;
    if (visit534_213_1(!(elem = Dom.get(elem)))) {
      _$jscoverage['/base/traversal.js'].lineData[214]++;
      return null;
    }
    _$jscoverage['/base/traversal.js'].lineData[216]++;
    if (visit535_216_1(filter === 0)) {
      _$jscoverage['/base/traversal.js'].lineData[217]++;
      return elem;
    }
    _$jscoverage['/base/traversal.js'].lineData[219]++;
    if (visit536_219_1(!includeSef)) {
      _$jscoverage['/base/traversal.js'].lineData[220]++;
      elem = elem[direction];
    }
    _$jscoverage['/base/traversal.js'].lineData[222]++;
    if (visit537_222_1(!elem)) {
      _$jscoverage['/base/traversal.js'].lineData[223]++;
      return null;
    }
    _$jscoverage['/base/traversal.js'].lineData[225]++;
    context = visit538_225_1((visit539_225_2(context && Dom.get(context))) || null);
    _$jscoverage['/base/traversal.js'].lineData[227]++;
    if (visit540_227_1(filter === undefined)) {
      _$jscoverage['/base/traversal.js'].lineData[229]++;
      filter = 1;
    }
    _$jscoverage['/base/traversal.js'].lineData[231]++;
    var ret = [], isArray = util.isArray(filter), fi, filterLength;
    _$jscoverage['/base/traversal.js'].lineData[236]++;
    if (visit541_236_1(typeof filter === 'number')) {
      _$jscoverage['/base/traversal.js'].lineData[237]++;
      fi = 0;
      _$jscoverage['/base/traversal.js'].lineData[238]++;
      filterLength = filter;
      _$jscoverage['/base/traversal.js'].lineData[239]++;
      filter = function() {
  _$jscoverage['/base/traversal.js'].functionData[17]++;
  _$jscoverage['/base/traversal.js'].lineData[240]++;
  return visit542_240_1(++fi === filterLength);
};
    }
    _$jscoverage['/base/traversal.js'].lineData[245]++;
    while (visit543_245_1(elem && visit544_245_2(elem !== context))) {
      _$jscoverage['/base/traversal.js'].lineData[246]++;
      if (visit545_246_1((visit546_247_1(visit547_247_2(elem.nodeType === NodeType.ELEMENT_NODE) || visit548_248_1(visit549_248_2(elem.nodeType === NodeType.TEXT_NODE) && allowTextNode))) && visit550_250_1(testFilter(elem, filter) && (visit551_251_1(!extraFilter || extraFilter(elem)))))) {
        _$jscoverage['/base/traversal.js'].lineData[252]++;
        ret.push(elem);
        _$jscoverage['/base/traversal.js'].lineData[253]++;
        if (visit552_253_1(!isArray)) {
          _$jscoverage['/base/traversal.js'].lineData[254]++;
          break;
        }
      }
      _$jscoverage['/base/traversal.js'].lineData[257]++;
      elem = elem[direction];
    }
    _$jscoverage['/base/traversal.js'].lineData[260]++;
    return isArray ? ret : visit553_260_1(ret[0] || null);
  }
  _$jscoverage['/base/traversal.js'].lineData[263]++;
  function testFilter(elem, filter) {
    _$jscoverage['/base/traversal.js'].functionData[18]++;
    _$jscoverage['/base/traversal.js'].lineData[264]++;
    if (visit554_264_1(!filter)) {
      _$jscoverage['/base/traversal.js'].lineData[265]++;
      return true;
    }
    _$jscoverage['/base/traversal.js'].lineData[267]++;
    if (visit555_267_1(util.isArray(filter))) {
      _$jscoverage['/base/traversal.js'].lineData[268]++;
      var i, l = filter.length;
      _$jscoverage['/base/traversal.js'].lineData[269]++;
      if (visit556_269_1(!l)) {
        _$jscoverage['/base/traversal.js'].lineData[270]++;
        return true;
      }
      _$jscoverage['/base/traversal.js'].lineData[272]++;
      for (i = 0; visit557_272_1(i < l); i++) {
        _$jscoverage['/base/traversal.js'].lineData[273]++;
        if (visit558_273_1(Dom.test(elem, filter[i]))) {
          _$jscoverage['/base/traversal.js'].lineData[274]++;
          return true;
        }
      }
    } else {
      _$jscoverage['/base/traversal.js'].lineData[277]++;
      if (visit559_277_1(Dom.test(elem, filter))) {
        _$jscoverage['/base/traversal.js'].lineData[278]++;
        return true;
      }
    }
    _$jscoverage['/base/traversal.js'].lineData[280]++;
    return false;
  }
  _$jscoverage['/base/traversal.js'].lineData[284]++;
  function getSiblings(selector, filter, parent, allowText) {
    _$jscoverage['/base/traversal.js'].functionData[19]++;
    _$jscoverage['/base/traversal.js'].lineData[285]++;
    var ret = [], tmp, i, el, elem = Dom.get(selector), parentNode = elem;
    _$jscoverage['/base/traversal.js'].lineData[292]++;
    if (visit560_292_1(elem && parent)) {
      _$jscoverage['/base/traversal.js'].lineData[293]++;
      parentNode = elem.parentNode;
    }
    _$jscoverage['/base/traversal.js'].lineData[296]++;
    if (visit561_296_1(parentNode)) {
      _$jscoverage['/base/traversal.js'].lineData[297]++;
      tmp = util.makeArray(parentNode.childNodes);
      _$jscoverage['/base/traversal.js'].lineData[298]++;
      for (i = 0; visit562_298_1(i < tmp.length); i++) {
        _$jscoverage['/base/traversal.js'].lineData[299]++;
        el = tmp[i];
        _$jscoverage['/base/traversal.js'].lineData[300]++;
        if (visit563_300_1(!allowText && visit564_300_2(el.nodeType !== NodeType.ELEMENT_NODE))) {
          _$jscoverage['/base/traversal.js'].lineData[301]++;
          continue;
        }
        _$jscoverage['/base/traversal.js'].lineData[303]++;
        if (visit565_303_1(el === elem)) {
          _$jscoverage['/base/traversal.js'].lineData[304]++;
          continue;
        }
        _$jscoverage['/base/traversal.js'].lineData[306]++;
        ret.push(el);
      }
      _$jscoverage['/base/traversal.js'].lineData[308]++;
      if (visit566_308_1(filter)) {
        _$jscoverage['/base/traversal.js'].lineData[309]++;
        ret = Dom.filter(ret, filter);
      }
    }
    _$jscoverage['/base/traversal.js'].lineData[313]++;
    return ret;
  }
  _$jscoverage['/base/traversal.js'].lineData[316]++;
  return Dom;
});
