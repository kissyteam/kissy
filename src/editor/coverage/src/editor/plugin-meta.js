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
if (! _$jscoverage['/editor/plugin-meta.js']) {
  _$jscoverage['/editor/plugin-meta.js'] = {};
  _$jscoverage['/editor/plugin-meta.js'].lineData = [];
  _$jscoverage['/editor/plugin-meta.js'].lineData[2] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[3] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[5] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[9] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[13] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[17] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[21] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[25] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[29] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[33] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[37] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[41] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[45] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[49] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[53] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[57] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[61] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[65] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[69] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[73] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[77] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[81] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[85] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[89] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[93] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[97] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[101] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[105] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[109] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[113] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[117] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[121] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[125] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[129] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[133] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[137] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[141] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[145] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[149] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[153] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[157] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[161] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[165] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[169] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[173] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[177] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[181] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[185] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[189] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[193] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[197] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[201] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[205] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[209] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[213] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[217] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[221] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[225] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[229] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[233] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[237] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[241] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[245] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[249] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[253] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[257] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[261] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[265] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[269] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[273] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[277] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[281] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[285] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[289] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[293] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[297] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[301] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[305] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[309] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[313] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[317] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[321] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[325] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[329] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[333] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[337] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[341] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[345] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[349] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[353] = 0;
  _$jscoverage['/editor/plugin-meta.js'].lineData[358] = 0;
}
if (! _$jscoverage['/editor/plugin-meta.js'].functionData) {
  _$jscoverage['/editor/plugin-meta.js'].functionData = [];
  _$jscoverage['/editor/plugin-meta.js'].functionData[0] = 0;
  _$jscoverage['/editor/plugin-meta.js'].functionData[1] = 0;
  _$jscoverage['/editor/plugin-meta.js'].functionData[2] = 0;
}
if (! _$jscoverage['/editor/plugin-meta.js'].branchData) {
  _$jscoverage['/editor/plugin-meta.js'].branchData = {};
}
_$jscoverage['/editor/plugin-meta.js'].lineData[2]++;
KISSY.add('editor/plugin-meta', function() {
  _$jscoverage['/editor/plugin-meta.js'].functionData[0]++;
  _$jscoverage['/editor/plugin-meta.js'].lineData[3]++;
  (function(config, Features, UA) {
  _$jscoverage['/editor/plugin-meta.js'].functionData[1]++;
  _$jscoverage['/editor/plugin-meta.js'].lineData[5]++;
  config({
  'editor/plugin/back-color': {
  requires: ['editor', 'editor/plugin/color/btn', 'editor/plugin/back-color/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[9]++;
  config({
  'editor/plugin/back-color/cmd': {
  requires: ['editor/plugin/color/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[13]++;
  config({
  'editor/plugin/bold': {
  requires: ['editor', 'editor/plugin/font/ui', 'editor/plugin/bold/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[17]++;
  config({
  'editor/plugin/bold/cmd': {
  requires: ['editor', 'editor/plugin/font/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[21]++;
  config({
  'editor/plugin/bubble': {
  requires: ['overlay', 'editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[25]++;
  config({
  'editor/plugin/button': {
  requires: ['editor', 'button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[29]++;
  config({
  'editor/plugin/checkbox-source-area': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[33]++;
  config({
  'editor/plugin/code': {
  requires: ['editor', 'editor/plugin/dialog-loader']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[37]++;
  config({
  'editor/plugin/code/dialog': {
  requires: ['editor', 'editor/plugin/dialog', 'menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[41]++;
  config({
  'editor/plugin/color/btn': {
  requires: ['editor', 'editor/plugin/button', 'editor/plugin/overlay', 'editor/plugin/dialog-loader']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[45]++;
  config({
  'editor/plugin/color/cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[49]++;
  config({
  'editor/plugin/color/dialog': {
  requires: ['editor', 'editor/plugin/dialog']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[53]++;
  config({
  'editor/plugin/contextmenu': {
  requires: ['editor', 'menu', 'editor/plugin/focus-fix']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[57]++;
  config({
  'editor/plugin/dent-cmd': {
  requires: ['editor', 'editor/plugin/list-utils']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[61]++;
  config({
  'editor/plugin/dialog-loader': {
  requires: ['overlay', 'editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[65]++;
  config({
  'editor/plugin/dialog': {
  requires: ['editor', 'overlay', 'editor/plugin/focus-fix', 'dd/plugin/constrain', 'component/plugin/drag']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[69]++;
  config({
  'editor/plugin/draft': {
  requires: ['json', 'editor', 'editor/plugin/local-storage', 'overlay', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[73]++;
  config({
  'editor/plugin/drag-upload': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[77]++;
  config({
  'editor/plugin/element-path': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[81]++;
  config({
  'editor/plugin/fake-objects': {
  requires: ['editor', 'html-parser']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[85]++;
  config({
  'editor/plugin/flash-bridge': {
  requires: ['swf', 'editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[89]++;
  config({
  'editor/plugin/flash-common/base-class': {
  requires: ['editor', 'base', 'editor/plugin/contextmenu', 'editor/plugin/bubble', 'editor/plugin/dialog-loader', 'editor/plugin/flash-common/utils']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[93]++;
  config({
  'editor/plugin/flash-common/utils': {
  requires: ['swf']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[97]++;
  config({
  'editor/plugin/flash': {
  requires: ['editor', 'editor/plugin/flash-common/base-class', 'editor/plugin/flash-common/utils', 'editor/plugin/fake-objects']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[101]++;
  config({
  'editor/plugin/flash/dialog': {
  requires: ['editor', 'editor/plugin/flash-common/utils', 'editor/plugin/dialog', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[105]++;
  config({
  'editor/plugin/focus-fix': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[109]++;
  config({
  'editor/plugin/font-family': {
  requires: ['editor', 'editor/plugin/font/ui', 'editor/plugin/font-family/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[113]++;
  config({
  'editor/plugin/font-family/cmd': {
  requires: ['editor', 'editor/plugin/font/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[117]++;
  config({
  'editor/plugin/font-size': {
  requires: ['editor', 'editor/plugin/font/ui', 'editor/plugin/font-size/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[121]++;
  config({
  'editor/plugin/font-size/cmd': {
  requires: ['editor', 'editor/plugin/font/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[125]++;
  config({
  'editor/plugin/font/cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[129]++;
  config({
  'editor/plugin/font/ui': {
  requires: ['editor', 'editor/plugin/button', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[133]++;
  config({
  'editor/plugin/fore-color': {
  requires: ['editor', 'editor/plugin/color/btn', 'editor/plugin/fore-color/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[137]++;
  config({
  'editor/plugin/fore-color/cmd': {
  requires: ['editor/plugin/color/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[141]++;
  config({
  'editor/plugin/heading': {
  requires: ['editor', 'editor/plugin/heading/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[145]++;
  config({
  'editor/plugin/heading/cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[149]++;
  config({
  'editor/plugin/image': {
  requires: ['editor', 'editor/plugin/button', 'editor/plugin/bubble', 'editor/plugin/contextmenu', 'editor/plugin/dialog-loader']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[153]++;
  config({
  'editor/plugin/image/dialog': {
  requires: ['io', 'editor', 'editor/plugin/dialog', 'tabs', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[157]++;
  config({
  'editor/plugin/indent': {
  requires: ['editor', 'editor/plugin/indent/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[161]++;
  config({
  'editor/plugin/indent/cmd': {
  requires: ['editor', 'editor/plugin/dent-cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[165]++;
  config({
  'editor/plugin/italic': {
  requires: ['editor', 'editor/plugin/font/ui', 'editor/plugin/italic/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[169]++;
  config({
  'editor/plugin/italic/cmd': {
  requires: ['editor', 'editor/plugin/font/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[173]++;
  config({
  'editor/plugin/justify-center': {
  requires: ['editor', 'editor/plugin/justify-center/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[177]++;
  config({
  'editor/plugin/justify-center/cmd': {
  requires: ['editor/plugin/justify-cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[181]++;
  config({
  'editor/plugin/justify-cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[185]++;
  config({
  'editor/plugin/justify-left': {
  requires: ['editor', 'editor/plugin/justify-left/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[189]++;
  config({
  'editor/plugin/justify-left/cmd': {
  requires: ['editor/plugin/justify-cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[193]++;
  config({
  'editor/plugin/justify-right': {
  requires: ['editor', 'editor/plugin/justify-right/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[197]++;
  config({
  'editor/plugin/justify-right/cmd': {
  requires: ['editor/plugin/justify-cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[201]++;
  config({
  'editor/plugin/link': {
  requires: ['editor', 'editor/plugin/bubble', 'editor/plugin/link/utils', 'editor/plugin/dialog-loader', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[205]++;
  config({
  'editor/plugin/link/dialog': {
  requires: ['editor', 'editor/plugin/dialog', 'editor/plugin/link/utils']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[209]++;
  config({
  'editor/plugin/link/utils': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[213]++;
  config({
  'editor/plugin/list-utils': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[217]++;
  config({
  'editor/plugin/list-utils/btn': {
  requires: ['editor', 'editor/plugin/button', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[221]++;
  config({
  'editor/plugin/list-utils/cmd': {
  requires: ['editor', 'editor/plugin/list-utils']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[225]++;
  config({
  'editor/plugin/local-storage': {
  requires: ['editor', 'overlay', 'editor/plugin/flash-bridge']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[229]++;
  config({
  'editor/plugin/maximize': {
  requires: ['editor', 'editor/plugin/maximize/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[233]++;
  config({
  'editor/plugin/maximize/cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[237]++;
  config({
  'editor/plugin/menubutton': {
  requires: ['editor', 'menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[241]++;
  config({
  'editor/plugin/ordered-list': {
  requires: ['editor', 'editor/plugin/list-utils/btn', 'editor/plugin/ordered-list/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[245]++;
  config({
  'editor/plugin/ordered-list/cmd': {
  requires: ['editor', 'editor/plugin/list-utils/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[249]++;
  config({
  'editor/plugin/outdent': {
  requires: ['editor', 'editor/plugin/outdent/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[253]++;
  config({
  'editor/plugin/outdent/cmd': {
  requires: ['editor', 'editor/plugin/dent-cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[257]++;
  config({
  'editor/plugin/overlay': {
  requires: ['editor', 'overlay', 'editor/plugin/focus-fix']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[261]++;
  config({
  'editor/plugin/page-break': {
  requires: ['editor', 'editor/plugin/fake-objects']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[265]++;
  config({
  'editor/plugin/progressbar': {
  requires: ['base']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[269]++;
  config({
  'editor/plugin/remove-format': {
  requires: ['editor', 'editor/plugin/remove-format/cmd', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[273]++;
  config({
  'editor/plugin/remove-format/cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[277]++;
  config({
  'editor/plugin/resize': {
  requires: ['editor', 'dd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[281]++;
  config({
  'editor/plugin/separator': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[285]++;
  config({
  'editor/plugin/smiley': {
  requires: ['editor', 'editor/plugin/overlay']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[289]++;
  config({
  'editor/plugin/source-area': {
  requires: ['editor', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[293]++;
  config({
  'editor/plugin/strike-through': {
  requires: ['editor', 'editor/plugin/font/ui', 'editor/plugin/strike-through/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[297]++;
  config({
  'editor/plugin/strike-through/cmd': {
  requires: ['editor', 'editor/plugin/font/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[301]++;
  config({
  'editor/plugin/table': {
  requires: ['editor', 'editor/plugin/dialog-loader', 'editor/plugin/contextmenu']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[305]++;
  config({
  'editor/plugin/table/dialog': {
  requires: ['editor', 'editor/plugin/dialog', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[309]++;
  config({
  'editor/plugin/underline': {
  requires: ['editor', 'editor/plugin/font/ui', 'editor/plugin/underline/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[313]++;
  config({
  'editor/plugin/underline/cmd': {
  requires: ['editor', 'editor/plugin/font/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[317]++;
  config({
  'editor/plugin/undo': {
  requires: ['editor', 'editor/plugin/undo/btn', 'editor/plugin/undo/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[321]++;
  config({
  'editor/plugin/undo/btn': {
  requires: ['editor', 'editor/plugin/button']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[325]++;
  config({
  'editor/plugin/undo/cmd': {
  requires: ['editor']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[329]++;
  config({
  'editor/plugin/unordered-list': {
  requires: ['editor', 'editor/plugin/list-utils/btn', 'editor/plugin/unordered-list/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[333]++;
  config({
  'editor/plugin/unordered-list/cmd': {
  requires: ['editor', 'editor/plugin/list-utils/cmd']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[337]++;
  config({
  'editor/plugin/video': {
  requires: ['editor', 'editor/plugin/flash-common/utils', 'editor/plugin/flash-common/base-class', 'editor/plugin/fake-objects']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[341]++;
  config({
  'editor/plugin/video/dialog': {
  requires: ['editor', 'editor/plugin/flash/dialog', 'editor/plugin/menubutton']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[345]++;
  config({
  'editor/plugin/word-filter': {
  requires: ['html-parser']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[349]++;
  config({
  'editor/plugin/xiami-music': {
  requires: ['editor', 'editor/plugin/flash-common/base-class', 'editor/plugin/flash-common/utils', 'editor/plugin/fake-objects']}});
  _$jscoverage['/editor/plugin-meta.js'].lineData[353]++;
  config({
  'editor/plugin/xiami-music/dialog': {
  requires: ['editor', 'editor/plugin/flash/dialog', 'editor/plugin/menubutton']}});
})(function(c) {
  _$jscoverage['/editor/plugin-meta.js'].functionData[2]++;
  _$jscoverage['/editor/plugin-meta.js'].lineData[358]++;
  KISSY.config('modules', c);
}, KISSY.Features, KISSY.UA);
});
