/**
 * @fileOverview There are some plugins in this class
 * @author dxq613@gmail.com
 */
KISSY.add('grid/plugins',function(S){

	var CLS_CHECKBOX = 'ks-grid-checkBox',
		CLS_RADIO = 'ks-grid-radio';
	/**
	* @name Grid.Plugins.CheckSelection
    * @constructor
	*/
	function checkSelection(config){
		checkSelection.superclass.constructor.call(this, config);
	}

	S.extend(checkSelection,S.Base);

	checkSelection.ATTRS = 
	/**
	 * @lends Grid.Plugins.CheckSelection.prototype
	 */	
	{
		/**
		* column's width which contains the checkbox
		*/
		width : {
			value : 40
		},
		/**
		* @private
		*/
		column : {
			
		},
		/**
		* @private
		*/
		cellInner : {
			value : '<span class="ks-grid-checkBox-container"><input  class="' + CLS_CHECKBOX + '" type="checkbox"></span>'
		}
	}
	S.augment(checkSelection, 
	/**
	 * @lends Grid.Plugins.CheckSelection.prototype
	 */	
	{   
		initializer : function(grid){
			var _self = this;
			var cfg = {
						title : '',
						width : _self.get('width'),
						resizeable:false,
						sortable : false,
						template : '<div class="ks-grid-hd-inner">' + _self.get('cellInner') + '</div>',
						cellTemplate : _self.get('cellInner')
				},
				checkColumn = grid.addColumn(cfg,0);
			grid.set('multiSelect',true);
			_self.set('column',checkColumn);
		},
		/**
		* @private
		*/
		bindUI : function(grid){
			var _self = this,
				col = _self.get('column'),
				checkBox = col.get('el').one('.' + CLS_CHECKBOX);
			checkBox.on('click',function(e){
				//e.preventDefault();
				var checked = checkBox.attr('checked');
				checkBox.attr('checked',checked);
				if(checked){
					grid.setAllSelection();
				}else{
					grid.clearSelection();
				}
			});

			grid.on('rowselected',function(e){
				_self._setRowChecked(e.row,true);
			});

			grid.on('rowunselected',function(e){
				_self._setRowChecked(e.row,false);
				checkBox.attr('checked',false);
			});
		},
		_setRowChecked : function(row,checked){
			var _self = this,
				rowEl = S.one(row),
				checkBox = rowEl.one('.' + CLS_CHECKBOX);
			checkBox.attr('checked',checked);
		}
	});
	
	var radioSelection = function(config){
		radioSelection.superclass.constructor.call(this, config);
	}
	S.extend(radioSelection,S.Base);

	radioSelection.ATTRS = 
	/**
	 * @lends Grid.Plugins.CheckSelection.prototype
	 */	
	{
		/**
		* column's width which contains the checkbox
		*/
		width : {
			value : 40
		},
		/**
		* @private
		*/
		column : {
			
		},
		/**
		* @private
		*/
		cellInner : {
			value : '<span class="ks-grid-radio-container"><input  class="' + CLS_RADIO + '" type="radio"></span>'
		}
	};
	S.augment(radioSelection, {
		initializer : function(grid){
			var _self = this;
			var cfg = {
						title : '',
						width : _self.get('width'),
						resizeable:false,
						sortable : false,
						cellTemplate : _self.get('cellInner')
				},
				column = grid.addColumn(cfg,0);
			grid.set('multiSelect',false);
			_self.set('column',column);
		},
		/**
		* @private
		*/
		bindUI : function(grid){
			var _self = this;

			grid.on('rowselected',function(e){
				_self._setRowChecked(e.row,true);
			});

			grid.on('rowunselected',function(e){
				_self._setRowChecked(e.row,false);
			});
		},
		_setRowChecked : function(row,checked){
			var _self = this,
				rowEl = S.one(row),
				radio = rowEl.one('.' + CLS_RADIO);
			radio.attr('checked',checked);
		}
	});
	/**
	* @name Grid.Plugins
	*/
	var plugins  = {
		CheckSelection : checkSelection,
		RadioSelection : radioSelection
	};

	
	
	return plugins;
});