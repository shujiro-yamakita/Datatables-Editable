# DataTables-Editable
Simple table editor for jQuery.dataTables.

This pckage support add, delete and inline editing and send form to server via AJAX

## USAGE
Include following libraries in the project(Necessary)

1. jQuery(Greater than 1.10.8)
2. jquery.dataTables

Follwing libraries may helpful(Recommended);
1. dataTables.buttons

Define a DataTable as usual.

Pass to the DataTable constructor at least `editable:true`.

If you use buttons plug-in, you also need to pass `dom` and  `buttons` .

## OPTIONS
DataTable-Editable accept following options.

| Option | Type of accepted value | default | Description |
| --- | --- | --- | --- |
| [`add`](#add) | *boolean* | `true` | Enable to add new line to table |
| [`delete`](#delete) | *boolean* | `true` | Enable to delete line from table |
| [`columns`](#columns) | *null / array[int, int, ...] / false* | `null` | Set column index to be editable. All columns are editable on default. |
| [`rows`](#rows) | *null / array[int, int, ...] / false* | `null` | Set row index to be editable. All rows are editable on default. |
| [`cells`](#cells) | *null / array[int, int, ...]* | `null` | Set perticular cells to be editable. |
| [`inputType`](#inputType) | *string* | `text` | Set HTML input type for all editable cell. Following will be accepted `text` `number` `date` `select` `textarea` |
| [`saveType`](#saveType) | *string* | `auto` | Set when to run saving mthod. `auto` Save data on every cell edit done.`manual` Save data when the "save" button is pushed |
| [`ajax`](#ajax) | *object* | | Set ajax properties. |
| [`keyData`](#keyData) | | false | |
| [`validateDraw`](#validateDraw) | | false | |
| [`columnDefs`](#columnDefs) | *array[{...}, {...} ,...]* | [] | Set HTML input type and formulas for pericular column.|

#### add
#### delete


#### columns
#### rows
#### cells
#### inputType
#### saveType
#### ajax
#### keyData
#### validateDraw
#### columnDefs
