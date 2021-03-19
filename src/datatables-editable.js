(function( factory ){
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( ['jquery', 'datatables.net'], function ( $ ) {
            return factory( $, window, document );
        } );
    }
    else if ( typeof exports === 'object' ) {
        // CommonJS
        module.exports = function (root, $) {
            if ( ! root ) {
                root = window;
            }

            if ( ! $ || ! $.fn.dataTable ) {
                $ = require('datatables.net')(root, $).$;
            }

            return factory( $, root, root.document );
        };
    }
    else {
        // Browser
        factory( jQuery, window, document );
    }
}(function( $, window, document, undefined ) {
    'use strict';
    var DataTable = $.fn.dataTable;


    var _instance = 0;

    var Editable = function( dt, opts )
    {
        if ( ! DataTable.versionCheck || ! DataTable.versionCheck( '1.10.8' ) ) {
            throw( "Warning: TableForm requires DataTables 1.10.8 or greater");
        }

        // User and defaults configuration object
        this.c = $.extend( true, {},
            DataTable.defaults.editable,
            Editable.defaults,
            opts
        );

        /**
        * @namespace Settings object which contains customisable information for TableForm instance
        */
        this.s = {
            /** @type {DataTable.Api} DataTables' API instance */
            dt: new DataTable.Api( dt ),

            VDSwitch: 1,

            /** @type {String} Unique namespace for events attached to the document */
            namespace: 'editable-table_'+(_instance++),

            fd: new FormData(),

            /**
            * Enabled setting
            * @type {Boolean}
            */
            enabled: false
        };

        this.className = {
            'WRAPPER' : 'editable-wrapper',
            'FOCUS' : 'editable-focus',
        }

        this.queryName = {
            'WRAPPER' : `.${this.className.WRAPPER}`,
            'FOCUS' : `.${this.className.FOCUS}`,
        }

        //キーステータスの登録
        this.functionKeysForFocus = {
            9:{ //tab
                func:'_moveAndRemember',
                arguments:'right',
            },
            13:{ //Enter
                func:'_lineFeed',
                arguments:'down',
            },
            16:{ //shift
                func:'_statePress',
                arguments:16,
            },
            17:{ //ctrl
                func:'_statePress',
                arguments:17,
            },
            33:{ //pageup
                func:'_go',
                arguments:'end',
            },
            34:{ //pagedown
                func:'_go',
                arguments:'end',
            },
            35:{ //end
                func:'_go',
                arguments:'end',
            },
            36:{ //home
                func:'_go',
                arguments:'home',
            },
            37:{ //左矢印
                func:'_move',
                arguments:'left',
            },
            38:{ //上矢印
                func:'_move',
                arguments:'up',
            },
            39:{ //右矢印
                func:'_move',
                arguments:'right',
            },
            40:{ //下矢印
                func:'_move',
                arguments:'down',
            },
            113:{ //F2
                func:'_focusOn',
                araguments:null,
            }
        }

        this.functionKeysForWrapper = {
            9:{ //tab
                func:'_moveAndRememberAndFocus',
                arguments:'right',
            },
            13:{ //Enter
                func:'_lineFeedAndFocus',
                arguments:'down',
            },
            16:{ //shift
                func:'_statePress',
                arguments:16,
            },
            17:{ //ctrl
                func:'_statePress',
                arguments:17,
            },
            27:{ //esc
                func:'_revertChange',
                arguments:null,
            },
        }

        this.functionKeysForUp = [
            16, //shift
            17, //ctrl
        ];

        this.functionKeysWithStatePressForFocus = {
            16:{ //shift
                9:{ //tab
                    func:'_move',
                    arguments:'left',
                },
                13:{ //Enter
                    func:'_move',
                    arguments:'up',
                },
            },
            17:{ //ctrl
                37:{ //ctrl + left arrow
                    func:'_go',
                    arguments:'leftEnd',
                },
                38:{ // ctrl + up arrow
                    func:'_go',
                    arguments:'top',
                },
                39:{ // ctrl + right arrow
                    func:'_go',
                    arguments:'rightEnd',
                },
                40:{ // ctrl + down arrow
                    func:'_go',
                    arguments:'bottom',
                }
            }
        }

        this.functionKeysWithStatePressForWrapper = {
            16:{ //shift
                9:{ //tab
                    func:'_moveAndFocus',
                    arguments:'left',
                },
                13:{ //Enter
                    func:'_moveAndFocus',
                    arguments:'up',
                },
            },
            17:{
                13:{ //Enter
                    func:'_checkInputData',
                    arguments:null,
                },
            }
        }

        /* Constructor logic */
        this._constructor();
    }


    $.extend( Editable.prototype, {
        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Public methods (exposed via the DataTables API below)
        */
        enabled: function ()
        {
            return this.s.enabled;
        },


        enable: function ( flag )
        {

            if ( flag === false ) {
                return this.disable();
            }

            this.s.enabled = true;

            this._focusListener();

            return this;
        },

        disable: function ()
        {
            this.s.enabled = false;

            this._removeClasses();
            this._focusListenerRemove();
            this._buttonsInactivate();

            return this;
        },

        setEditableColumns : function (array)
        {
            this.c.columns = array;

            this._constructTargetCheckColumns();
            this._constructTargetMaps();

            return this;
        },

        setEditableRows : function (array)
        {
            this.c.rows = array;

            this._constructTargetCheckRows();
            this._constructTargetMaps();

            return this;
        },

        setEditableCells : function (array)
        {
            this.c.cells = array;

            this._constructTargetCheckCells();
            this._constructTargetMaps();

            return this;
        },

        reConstructFormData: function(key, data = null)
        {
            this.c.ajax.data = {};
            this.s.fd = new FormData();
            if(typeof(key) === "object"){
                for(let i in key){
                    this.c.ajax.data[i] = key[i];
                }
            } else {
                this.c.ajax.data[key] = data
            }

            this._constructFormData();
        },

        toggleValidateDraw: function()
        {
            if(this.s.VDSwitch === 0){
                this.s.VDSwitch = 1;
            } else {
                this.s.VDSwitch = 0;
            }

            return this.s.dt;
        },

        addToFormData: function(key, data = null)
        {
            const _this = this;
            if(typeof(key) === "object"){
                for(let i in key){
                    this.s.fd.append(i, key[i])
                }
            } else {
                this.s.fd.append(key,data)
            }
            if(this.c.saveType === "auto"){
                this._save().then(()=>{
                    _this.s.dt.ajax.reload(() =>{
                        _this._screenLock('stop')
                    });
                })
            }
        },

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Constructor
        */
        _constructor: function ()
        {
            const _this = this;
            var dt = this.s.dt;

            // Make the instance accessible to the API
            dt.settings()[0]._oEditable = this;

            // オプションの設定の確認

            // 編集可能カラムの設定
            this._constructMap();

            // ajax設定の確認
            if( this.c.ajax === undefined ){
                console.warn("Warning! Anything you edit on the table not to be saved anywhere becouse the 'ajax' options are not set." )
            } else {
                if (this.c.ajax.url === undefined){
                    console.warn("Warning! Please set url for saving methods otherwise nothing will be saved")
                } else if (this.c.ajax.type === "undefined") {
                    this.c.ajax.type === "post"
                }
            }

            // FormDataの初期化
            this._constructFormData();

            // セーブタイプの確認 マニュアル時には確定ボタンを追加
            if(this.c.saveType === "manual"){
                this._constructSaveButtonArea()
            }

            // _focusListenerの起動
            if ( this.c.enabled !== false ) {
                this.enable();
            } else {
                return;
            }


            // 対象テーブルにクラス名を追加
            $(dt.table().node()).addClass('dataTable_editable')
            $(dt.table().node()).addClass(this.s.namespace)
            // 対象テーブルをターゲット可能にする
            $(dt.table().node()).attr('tabindex', -1)


            dt
            .on( 'destroy.editable', function () {

                _this._focusListenerRemove();
                _this._removeClasses();
            })
        },

        _constructMap: function(){
            if(!(this._constructTargetCheckCells() ?
                this._constructTargetCheckColumns() ?
                this._constructTargetCheckRows()?
                this._constructTargetMaps() : false : false :false
            )){
                console.error('DataTables-Editable is not actevated')
                return false;
            }
        },

        /**
         * c.cellsの値を基に編集可能セル .c._oCellsを作成
         *
         * @return boolean
         */
        _constructTargetCheckCells: function()
        {
            const cl = this.c.cells;

            if(!cl){
                this.c._oCells = [];
                return true;
            }

            if(!Array.isArray(cl)){
                console.error("Error! 'cells' option must be set in array of objects which contains 'row' and 'col'");
                return false;
            }

            for(let i = cl.length - 1; i >= 0; i--){
                if(!"row" in cl[i] || !"col" in cl[i]){
                    console.error("Error! elements of cell option does not includes 'row' or 'col' ");
                    return false;
                }
            }
            this.c.cells.sort(function(a, b){
                if(a.row - b.row < 0){
                    return -1
                }
                if(a.row - b.row > 0){
                    return 1
                }
                if(a.row === b.row){
                    if(a.col < b.col){
                        return -1
                    }
                    if(a.col > b.col){
                        return 1
                    }
                    return 0
                }
            });

            this.c._oCells = this.c.cells.slice();
            return true;
        },

        /**
         * c.columnsの値を基に編集可能カラム c._oColumnsを作成
         * @return object c._oColumns
         */
        _constructTargetCheckColumns: function()
        {
            const dt = this.s.dt;
            this.c._oColumns = [];

            if( this.c.columns === "all"){
                for(let i = 0; i < dt.columns()[0].length; i++){
                    if(dt.columns(i).visible()[0] === true){
                        this.c._oColumns.push(i);
                    }
                }
            } else if (Array.isArray(this.c.columns)) {
                if(this.c.columns.length > dt.columns()[0].length){
                    console.error("Error! Too many elements are set on 'columns' option. If you want to set all columns editable, do not set 'columns' option.")
                    return false;
                }
                for(let i = 0; i < this.c.columns.length; i++){
                    if(isNaN(this.c.columns[i])){
                        console.error("Error! The 'columns' option you set includes elements which is not a Number.")
                        return false;
                    }
                    if(this.c.columns[i] >= dt.columns()[0].length){
                        console.error("Error! The 'columns' option includes index which does not exists on table.");
                        return false;
                    }
                    if(dt.columns(this.c.columns[i]).visible()[0] === false){
                        continue;
                    }
                    this.c._oColumns.push(this.c.columns[i])
                }
                this.c._oColumns.sort((first, second) => first - second);
            } else {
                console.error("Error! 'columns' option must be set by Array. If you want to set all columns editable, do not set 'columns' option.")
                return false;
            }

            return true;
        },

        _constructTargetCheckRows: function()
        {
            const dt = this.s.dt;
            this.c._oRows = [];

            if(this.c.rows !== false){
                if(Array.isArray(this.c.rows)){
                    for(let i = 0; i < this.c.rows.length; i++){
                        if(isNaN(this.c.rows[i])){
                            console.error("Error! The 'rows' option you set includes elements which is not a Number.")
                            return false;
                        }
                        this.c._oRows.push(this.c.rows[i])
                    }
                    this.c._oRows.sort((first, second) => first - second);
                } else {
                    console.error("Error! 'rows' option must be set by Array. If you want to set all rows editable, do not set 'rows' option.")
                    return false;
                }
            } else {
                for(let i = 0; i < dt.rows()[0].length; i++){
                    if(dt.rows()[0].includes(i) === true){
                        this.c._oRows.push(i);
                    }
                }
            }
            return true;
        },

        /**
         * c._oCells c._oColumns c._oRowsの値を元に編集可能セルのマップを作成
         * @return object c.map
         */
        _constructTargetMaps : function()
        {
            const columns = this.c._oColumns;
            const rows = this.c._oRows;
            const cells = this.c._oCells;
            this.c.map = {};

            for(let i = 0; i < rows.length; i++){
                this.c.map[rows[i]] = columns.slice();
            }
            for(let i = 0; i < cells.length; i++){
                if(cells[i].row in this.c.map){
                    this.c.map[cells[i].row].push(cells[i].col)
                } else {
                    this.c.map[cells[i].row] = [cells[i].col];
                }
            }
            for(let i = 0; i < rows.length; i++){
                this.c.map[rows[i]].sort((a, b) => a - b);
            }

            return true;
        },

        _constructFormData:function()
        {
            this.s.fd = new FormData()
            if( this.c.ajax.data ){
                const d = this.c.ajax.data;
                for( let key in d){
                    this.s.fd.append(key, d[key])
                }
            }
        },

        _constructSaveButtonArea:function()
        {
            const dt = this.s.dt;
            const _this = this;

            const VDMSG = {
                0:{
                    message: type => 'Stopped redrawing',
                    current:'OFF',
                    oposit:'ON'
                },
                1:{
                    message: type => `${type} will be redrawn on every cell edit`,
                    current:'ON',
                    oposit:'OFF'
                }
            }

            if('_buttons' in dt.context[0]){
                dt.button().add(0, {
                    action : function (e, dt, button , config) {
                        if(confirm('Saving all changes')){
                            _this._save().then(()=>{
                                dt.ajax.reload(()=>{
                                    console.log('redrawn');
                                    _this._screenLock('stop');
                                }, false);
                            })
                        }
                    },
                    text:"変更を確定する",
                })
                dt.button().add(1, {
                    action : function (e, dt, button, config) {
                        if(confirm('Clear all changes not saved?')){
                            dt.ajax.reload();
                        }
                    },
                    text:"変更をキャンセルする",
                })
                if(this.c.validateDraw){
                    dt.button().add(2, {
                        action : function(e, dt, button, config) {
                            _this.toggleValidateDraw();
                            alert(VDMSG[_this.s.VDSwitch].message(_this.c.validateDraw));
                            button.text(`自動再計算${VDMSG[_this.s.VDSwitch].oposit}`)
                            if(_this.s.VDSwitch){
                                dt.rows().invalidate().draw();
                            }
                        },
                        text:"自動再計算OFF",
                    })
                }
            } else {
                const dtWrapper = dt.settings()[0].nTableWrapper;
                const dtId = dt.settings()[0].sTableId;
                const saveButtonArea =$('<div></div>')
                        .addClass('dataTables_editable_btns')
                        .attr({'id':`${dtId}_editable_btns`});
                const saveButton = $('<button></button>')
                        .addClass('editable_button')
                        .attr('id',`${dtId}_editable_submit`)
                        .text('変更を確定する');
                const cancelButton = $('<button></button>')
                        .addClass('editable_button')
                        .attr('id',`${dtId}_editable_cancel`)
                        .text('変更をキャンセルする');

                $(saveButtonArea).append(saveButton,cancelButton);
                $(dtWrapper).append(saveButtonArea);
            }
        },


        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        * Private methods
        */

       _activateCell:function(target)
       {
           const dt = this.s.dt;

           const col = dt.column(target).index();
           const row = dt.rows({order:'applied'})[0].indexOf(dt.row(target).index());

           const defs = this.c.columnDefs || [];

           if(!row in this.c.map){
               return false;
           } else if(!this.c.map[row].includes(col)) {
               return false;
           }

           let box;
           const toUp = str => str.charAt(0).toUpperCase() + str.slice(1);
           for(let def of defs){
               if(def.target.includes(col)){
                   box = this[
                       "_input" + toUp(def.inputType)
                   ](target, def)
               }
           }
           if(!box){
               box = this.c.inputType ?
                     this['_input' + toUp(this.c.inputType)](target, this.c) :
                     this._inputText(target, [])
           }

           $(box).outerWidth( $(target).outerWidth() );
           $(box).outerHeight( $(target).outerHeight() );
           $(box).addClass(this.className.WRAPPER);

           $(dt.cell(target).nodes()).append(box);
           $(this.queryName.WRAPPER).focus();
           $(this.queryName.WRAPPER).select();

           return true;

       },

       /**
        * ターゲットの現在位置を更新
        * @param  {dom} target ターゲットの<td>タグ
        * @return {[type]}        [description]
        */
       _refreshCurrentTableStructData: function(target)
       {
           var dt = this.s.dt;

           var row = dt.row(target).index();
           var col = dt.column(target).index();

           this.current_target = {'row':row,'col':col};
       },

       /**
        * セルに入力用ラッパーを被せる
        * @param  {dom} target ターゲットのセル
        * @return {[type]}        [description]
        */

       _inputText: function(target, def){
           return $('<input></input>')
               .attr('type', 'text')
               .val(this.s.dt.cell(target).data())
       },

       _inputNumber: function(target, def){
           return $('<input></input>')
               .attr('type', 'number')
               .val(this.s.dt.cell(target).data())
       },

       _inputDate: function(target, def){
           const date = new Date(this.s.dt.cell(target).data());
           const format = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
           return $('<input></input>')
                .attr('type', 'date')
                .val(format)
       },

       _inputSelect:function(target, def){
           const data = this.s.dt.cell(target).data();
           const ret = $('<select></select>');
           for(let i of def.formula){
               if(typeof i === "object"){
                   $(ret).append($('<option></option>')
                     .val(i.val).text(i.text)
                     .attr(data == i.val ? {'selected':'on'} : {})
                   )
               } else {
                   $(ret).append($('<option></option>')
                    .text(i)
                    )
               }
           }
           return ret
       },

       _inputTextarea:function(target, def){
           const data = this.s.dt.cell(target).data();
           const ret = $('<textarea></textarea>').text(data);
           for(let i in def.formula){
               $(ret).attr(i, def.formula[i])
           }
           return ret
       },

       _statePress:function(keyCode){
           this.keyOnPress = keyCode;
       },

       _focusOn:function(){
           const target = $(this.queryName.FOCUS)[0];
           this._activateCell(target);
       },

       _getRow:function(current, way, status){
           const w = way;
           if(way === 0){
               return current.row;
           }
           const map = this.c.map;
           let i = current.row;
           const keys = Object.keys(map);
           const posible = [];

           while( i >= Number(keys[0]) && i <= Number(keys[keys.length - 1])){
               if(keys.includes(String(i+w))){
                   if(map[i + w].includes(current.column)){
                       if(status === "nearest"){
                           return i + w;
                       } else {
                           posible.push(i + w)
                       }
                   }
               }
               i += w;
           }
           posible.sort((a, b) => a- b);
           if(status === "min" && posible.length > 0){
               return posible[0]
           }
           if(status === "max" && posible.length > 0){
               return posible[posible.length - 1]
           }

           return current.row;
       },

       _getColumn:function(current, way, status){
           const w = way;
           if(way === 0){
               return current.column;
           }
           const mapRow = this.c.map[current.row];
           let i = current.column;
           const posible = [];

           while( i >= mapRow[0] && i <= mapRow[mapRow.length - 1]){
               if(mapRow.includes(i + w)){
                   if(status === "nearest"){
                       return i + w
                   } else {
                       posible.push(i + w)
                   }
               }
               i += w
           }

           posible.sort((a, b) => a- b);
           if(status === "min" && posible.length > 0){
               return posible[0]
           }
           if(status === "max" && posible.length > 0){
               return posible[posible.length - 1]
           }

           return current.column
       },

       _move:function(way, rememberFlag = false){
           const dt = this.s.dt;
           const qn = this.queryName;
           const map = this.c.map;

           const ways = {
               up: {row:-1, column:0},
               down:{row:1, column:0},
               right:{row:0, column:1},
               left:{row:0, column:-1},
               stay:{row:0,column:0},
           }

           const current = {};
           current.column = dt.cell(qn.FOCUS).index().column;
           current.row = dt.rows({order:'applied'})[0].indexOf(dt.row($(qn.FOCUS)).index())

           if(rememberFlag && !this.tempBase){
               this.tempBase={
                   row:current.row,
                   column:current.column,
               }
           }

           const cell = {
               column:this._getColumn(current, ways[way].column, "nearest"),
               row:this._getRow(current, ways[way].row, "nearest")
           }

           if(rememberFlag && cell.column === current.column){
               this._lineFeed();
           } else {
               this._focusCell(cell, rememberFlag);
           }

       },

       _andFocus:function(callback){
           const dt = this.s.dt;
           const namespace = '.'+this.s.namespace;
           const q = this.queryName;
           dt.off('blur'+namespace, q.WRAPPER)
           this._checkInputData().then(()=>{
               callback()
           }).then(() => {
               this._focusOn();
           }).then(() => {
               const _this = this;
               dt.on('blur'+namespace, q.WRAPPER, function(){
                   _this._checkInputData()
               })
           })
       },

       _moveAndRemember:function(way){
           this._move(way, true);
       },

       _moveAndRememberAndFocus:function(way){
           this._andFocus(() => {
               this._move(way, true);
           })
       },

       _moveAndFocus:function(way){
           this._andFocus(() => {
               this._move(way, false);
           })
       },

       _lineFeed:function(){
           if(!this.tempBase){
               this._move('down');
               return
           }
           const cell = {
               // row:this.c.rows[this.c.rows.indexOf(this.tempBase.row) + 1] || this.c.rows[0],
               row:this._getRow(this.tempBase, 1, "nearest"),
               column:this.tempBase.column
           }

           this._focusCell(cell, false);
       },

       _lineFeedAndFocus:function(){
           this._andFocus(() => {
               this._lineFeed();
           })
       },

       _go:function(where){
           const dt = this.s.dt;
           const qn = this.queryName;
           const map = this.c.map;
           const rows = Object.keys(map);
           const current = {};
           current.column = dt.cell(qn.FOCUS).index().column;
           current.row = dt.rows({order:'applied'})[0].indexOf(dt.row($(qn.FOCUS)).index())


           const wheres = {
               home: {row:Number(rows[0]), column:map[rows[0]][0]},
               end:{row:rows[rows.length - 1], column:map[rows[rows.length - 1]][map[rows[rows.length - 1]].length - 1]},
               top: {row:this._getRow(current, -1, "min"), column:current.column},
               bottom: {row:this._getRow(current, 1, "max"), column:current.column},
               leftEnd:{ row:current.row, column:this._getColumn(current, -1, 'min')},
               rightEnd:{ row:current.row, column:this._getColumn(current, 1, 'max')},
               stay: { row:current.row, column:current.column},
           }

           this._focusCell(wheres[where]);
       },

       _focusCell:function(cell, rememberFlag = false){
           const dt = this.s.dt;
           const cn = this.className;
           const qn = this.queryName;

           const target = {
               row:dt.rows({order:'applied'})[0][cell.row],
               column:cell.column,
           }

           $(dt.table().container()).find(qn.FOCUS).removeClass(cn.FOCUS);
           $(dt.cell(target.row, target.column).node()).addClass(cn.FOCUS)
           if(this._checkFixedColumns()){
               $(dt.cell(target.row ,target.column).fixedNode()).addClass(cn.FOCUS);
           }

           this._jumpPage(cell.row)
           this._scrollToCell(target);

           if(!rememberFlag){
               this.tempBase = null;
           }
       },

       _jumpPage:function(rowIndex){
           const dt = this.s.dt;
           if(rowIndex >= dt.page.info().start && rowIndex < dt.page.info().end){
               return;
           };

           for(let i = 0; i < dt.page.info().pages; i++){
               dt.page(i);
               if(rowIndex >= dt.page.info().start && rowIndex < dt.page.info().end){
                   dt.draw('page');
                   return;
               }
           }
       },

       _scrollToCell:function(target){
           const dt = this.s.dt;
           // const sbody = $(dt.tables().nodes()).parents('.dataTables_scrollBody')
           const sbody = this._checkFixedColumns()
                        ? $($(dt.cell(target).fixedNode()).parents('div')[0])
                        :  $($(dt.cell(target).node()).parents('div')[0])
           const dtwrap = $(dt.tables().nodes()).parents('.dataTables_wrapper')
           const tcell = dt.cell(target.row, target.column).nodes();
           const pos = $(tcell).position();

           const leftWrapper = dtwrap.find('.DTFC_LeftBodyWrapper').outerWidth() || 0;

           if(pos.top < 0){
               sbody.scrollTop(sbody.scrollTop() + pos.top);
           }
           if(pos.top + $(tcell).outerHeight() > sbody.height()){
               sbody.scrollTop(sbody.scrollTop() + pos.top - sbody.height() + $(tcell).outerHeight())
           }
           if(pos.left < 0 + leftWrapper){
               sbody.scrollLeft(sbody.scrollLeft() + pos.left - leftWrapper)
           }
           if(pos.left + $(tcell).outerWidth() > sbody.outerWidth()){
               sbody.scrollLeft(sbody.scrollLeft() + pos.left - sbody.width() + $(tcell).outerWidth())
           }
       },

       _checkInputData:function(){

           const dt = this.s.dt;
           const _this = this;

           const target = $(`.${this.s.namespace} ${this.queryName.FOCUS}`);

           const wrap = $(target).find(this.queryName.WRAPPER)
           const org_val = dt.cell(target).data();
           const formed_val = $(wrap).val();

           if(org_val == formed_val){
               const promise = new Promise((resolve, reject)=>{
                   resolve(wrap.remove());
               });
               return promise;
           }else{
               dt.cell( target ).data(formed_val);

               this._controllDrawing(target);

               this._addToFormData(target, formed_val);

               if(this.c.saveType === 'auto'){
                   return _this._save().then(() => {
                       wrap.remove();
                   })
                   .fail((xhr, status, errorThrown) => {
                       const promise = new Promise((resolve, reject)=>{
                           wrap.remove();
                           dt.cell( target ).data(org_val);
                       });
                       return promise;
                   })
                   .always(()=>{
                       _this._screenLock('stop');
                       $(`.${_this.s.namespace}`).focus()
                   })
               } else {
                   const promise = new Promise((resolve, reject)=>{
                       resolve(wrap.remove());
                   });
                   return promise;
               }
           }
       },

       _addToFormData:function(target, val){
           const dt = this.s.dt;

           const key = this.c.keyData ? dt.row(target).data()[this.c.keyData] : dt.row(target).index();
           const tcol = dt.columns()[0].indexOf(dt.column(target).index());
           const name = dt.context[0].aoColumns[tcol].name
                        || $(dt.column(tcol).header()).data('name');
           this.s.fd.append(`datas[${key}][${name}]`, val);
       },

       /**
        * オプション設定に基づき変更した値でのテーブルの描画タイミングを制御
        * @param  object target [description]
        * @return bool        [description]
        */
       _controllDrawing:function(target){

           const dt = this.s.dt;
           const v = this.c.validateDraw;
           const on = this.s.VDSwitch;
           const sbody = $($(dt.cell(target).node()).parents('div')[0]);
           const cs = {top:sbody.scrollTop(), left:sbody.scrollLeft()};

           if( v === "cell" && on){
               dt.cell( target ).invalidate().draw();
               sbody.scrollTop(cs.top).scrollLeft(cs.left);
           } else if( v === "row" && on){
               dt.row( target ).invalidate().draw();
               sbody.scrollTop(cs.top).scrollLeft(cs.left);
           } else if( v === "table" && on){
               dt.rows().invalidate().draw();
               sbody.scrollTop(cs.top).scrollLeft(cs.left);
           }


       },

       _formValues:function(org, val){
           let ret;
           if($(target).hasClass(this.className.TEXT_DATE_CLASS)){
               ret = this.dateFormatChecker(val);
           } else {
               ret = val === "" ? null : val;
           }
           return ret;
       },

       _revertChange:function(){
           const dt = this.s.dt;
           const namespace = '.'+this.s.namespace;
           const q = this.queryName;
           const target = $(namespace +" " + q.FOCUS);
           const wrap = $(target).find(q.WRAPPER)
           const _this = this;


           dt.off('blur'+namespace, q.WRAPPER)
           const promise = new Promise((resolve, reject) => {
               resolve(wrap.remove())
           }).then(() => {
               dt.on('blur'+namespace, q.WRAPPER, function(){
                   _this._checkInputData()
               })
               $(namespace).focus();
           })
           return promise
       },

       _removeClasses:function(){
           const dt = this.s.dt;
           const c = this.className;
           const q = this.queryName;

           $(dt.table().node()).removeClass(this.s.namespace);
           $(dt.table().node()).find(q.WRAPPER).remove();
           $(dt.table().node()).find(q.FOCUS).removeClass(c.FOCUS);

       },

       _save:function(){
           const c = this.c;
           const _this = this;
           this._screenLock('start')
           return $.ajax({
               url:c.ajax.url,
               type:c.ajax.type,
               data:this.s.fd,
               processData:false,
               contentType:false,
           })
           .done((ret) => {

           }).fail((ret)=>{
               alert('saving data failed');
               // console.log(ret);
           }).always((ret) => {
               console.log(ret);
               _this._constructFormData();
               // _this._screenLock('stop');
           })
       },

       _screenLock:function(state){
           const overScreen = $('<div></div>')
            .attr('id','dataTable_editable_screenLock')
            .css({
                height:'100vh',
                width:'100vw',
                position:'fixed',
                left:'0px',
                top:'0px',
                'z-index':9999,
                'background-color':'rgba(128,128,128,0.4)',
                'text-align':'center',
            })
            .append($('<span></span>')
                .attr('id','des_text')
                .text('Saving')
                .css({
                    width:"100px",
                    'line-height':'100vh',
                    'font-size':'xxx-large',
                    'color':'black'
                })
            );

            const addPeriod = ()=> {
                const bef = $('#des_text').text();
                $('#des_text').text(`${bef}.`)
            }

            const _this = this;

            if(state === "start"){
                $('body').append(overScreen);
                setTimeout( function callee(){
                    addPeriod();
                    if(_this._timeout_id === null) return;
                    _this._timeout_id = setTimeout(callee, 1000)
                }, 1000)
            } else if(state === "stop"){
                _this._timeout_id = null;
                $('#dataTable_editable_screenLock').remove();
            }
       },


       /**
        * Check if FixedColumns Expansion is applied to the table
        * @return {boolean} [description]
        */
       _checkFixedColumns : function()
       {
           const dt = this.s.dt;

           if('_oFixedColumns' in dt.context[0]){
               return true;
           } else {
               return false;
           }
       },


        /**
        * Attach suitable listeners (based on the configuration) that will attach
        * and detach the TableForm handle in the document.
        *
        * @private
        */
        _focusListener: function ()
        {
            const __this = this;
            const dt = this.s.dt;
            const namespace = "."+this.s.namespace;
            const c = this.className;
            const q = this.queryName;

            const wrapper = () => {return $(q.WRAPPER).length > 0};
            const focus = () => {return $(q.FOCUS).length > 0};

            $(document)
            .on('keydown', namespace, function(e){
                if(wrapper()){
                    let f = __this.functionKeysForWrapper[e.keyCode];
                    if(__this.keyOnPress){
                        f = __this.functionKeysWithStatePressForWrapper[__this.keyOnPress][e.keyCode];
                    }
                    if(f !== undefined){
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        __this[f.func](f.arguments);
                    }
                } else if(focus()){
                    let f = __this.functionKeysForFocus[e.keyCode];
                    if(__this.keyOnPress){
                        f = __this.functionKeysWithStatePressForFocus[__this.keyOnPress][e.keyCode];
                    }
                    if(f !== undefined){
                        e.preventDefault();
                        __this[f.func](f.arguments);
                    }
                }

            })
            .on('keyup', namespace, function(e){
                if(__this.functionKeysForUp.indexOf(e.keyCode) >= 0){
                    __this.keyOnPress = false;
                }
            });

            dt
            .on('click'+namespace, `td${q.FOCUS}:not(:has(${q.WRAPPER}))`, function(){
                __this._activateCell(this);
            })
            .on('click'+namespace, 'td', function(){
                const col = dt.column(this).index();
                const row = dt.rows({order:'applied'})[0].indexOf(dt.row(this).index())
                if( row in __this.c.map && __this.c.map[row].includes(col)){
                    __this.tempBase = null;
                    __this._focusCell({row:row,column:col});
                }
            })
            .on('blur'+namespace, q.WRAPPER, function(){
                __this._checkInputData()
            })

            // ajax読み込み後に編集可能カラムを再設定する
            .on('xhr', function (e, settings, json, xhr) {
                xhr.then(()=>{
                    __this._constructTargetCheckCells();
                    __this._constructTargetCheckColumns();
                    __this._constructTargetCheckRows();
                    __this._constructTargetMaps();
                })
            })

            const dtId = dt.settings()[0].sTableId

            $(`#${dtId}_editable_btns`)
            .on('click', `#${dtId}_editable_submit`, function(){
                alert('Saving all changes')
                __this._save().then(()=>{
                    dt.ajax.reload(()=>{
                        __this._screenLock('stop');
                    }, false);
                })
            })
            .on('click', `#${dtId}_editable_cancel`, function(){
                alert('Clear all changes not saved?');
                dt.ajax.reload();
            })

        },


        _focusListenerRemove: function ()
        {
            const dt = this.s.dt;
            const namespace = "."+this.s.namespace

            $(document).off(namespace)
            dt.off(namespace );
            $(dt.table().body()).off( namespace );
            $(document.body).off( namespace );
        },

        _buttonsInactivate: function ()
        {
            const dt = this.s.dt;
            $(dt.button(0).node()).prop('disabled', true);
            $(dt.button(1).node()).prop('disabled', true);
            $(dt.button(2).node()).prop('disabled', true);
        }

    });

    /**
    * Editable version
    *
    * @static
    * @type      String
    */
    Editable.version = '1.0.0';


    /**
    * Editable defaults
    *
    * @namespace
    */
    Editable.defaults = {

        /** @type {Boolean} Enable Editable on load */
        enabled: true,

        /** @type {string} default target columns */
        columns:"all",

        /** @type {string} default target rows */
        rows:false,

        /** @type {string} default target cells */
        cells:false,

        /** @type {String} default data name for key to make form data*/
        keyData:false,

        /** @type {string} default wrap input type */
        inpuType: "text",

        /** @type {Boolean} default draw type*/
        validateDraw: false,

        /** @type {String} default save type */
        saveType:"auto",

        /** @type {Array} */
        columnDefs:[],

    };


    /*
    * API
    */
    const Api = $.fn.dataTable.Api;


    // Doesn't do anything - Not documented
    Api.register( 'editable()', function () {
        return this;
    } );

    Api.register( 'editable().enabled()', function () {
        var ctx = this.context[0];

        return ctx._oEditable ?
        ctx._oEditable.enabled() :
        false;
    } );

    Api.register( 'editable().enable()', function ( flag ) {
        return this.iterator( 'table', function ( ctx ) {
            if ( ctx._oEditable ) {
                ctx._oEditable.enable( flag );
            }
        });
    });

    Api.register( 'editable().addToFormData()', function (key, data) {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             ctx._oEditable.addToFormData(key, data)
        }
    });

    Api.register( 'editable().reConstructFormData()', function (key, data) {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             ctx._oEditable.reConstructFormData(key, data)
        }
    });

    Api.register( 'editable().setEditableColumns()', function (array) {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             ctx._oEditable.setEditableColumns(array)
        }
    });

    Api.register( 'editable().setEditableRows()', function (array) {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             ctx._oEditable.setEditableRows(array)
        }
    });

    Api.register( 'editable().setEditableCells()', function (array) {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             ctx._oEditable.setEditableCells(array)
        }
    });

    Api.register( 'editable().toggleValidateDraw()', function () {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             return ctx._oEditable.toggleValidateDraw()
        }
    });

    Api.register( 'editable().save()', function () {
        var ctx = this.context[0];

        if( ctx._oEditable ){
             ctx._oEditable.save()
        }
    });

    Api.register( 'editable().disable()', function () {
        return this.iterator( 'table', function ( ctx ) {
            if ( ctx._oEditable ) {
                ctx._oEditable.disable();
            }
        });
    });

    $(document).on( 'preInit.dt.editable', function (e, settings, json) {
        if ( e.namespace !== 'dt' ) {
            return;
        }

        var init = settings.oInit.editable;
        var defaults = DataTable.defaults.editable;

        if ( init || defaults ) {
            var opts = $.extend( {}, init, defaults );

            if ( init.enabled !== false ) {
                new Editable( settings, opts );
            }
        }
    });


    // Alias for access
    DataTable.Editable = Editable;
    DataTable.editable = Editable;


    return Editable;
}));