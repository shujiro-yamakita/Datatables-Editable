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

Pass to the DataTable constructor at least: `editable:true`

If you use buttons plug-in, you need to pass `dom`, `buttons` too.

## OPTIONS
DataTable-Editable accept following options.

| Option | Type of accepted value | default | Description |
| --- | --- | --- | --- |
| [`add`](https://github.com/shujiro-yamakita/datatables-editable/blob/main/README.md#add) | *boolean* | `true` | Enable to add new line to table |
| [`delete`](https://github.com/shujiro-yamakita/datatables-editable/blob/main/README.md#delete) | *boolean* | `true` | Enable to delete line from table |
| `columns` | *array[int, int, ...]* | `null` | Set column index which is editable. All columns are editable on default. |
| `rows` | *array[int, int, ...]* | `null` | Set row index which is editable. All rows are editable on default. |
| `cells` | *array[{rpw:int, col:int},{}, ...]* | `null` | Set perticular cell which is editable. All cells are editable on default. |
| `inputType` | *string* | `text` | Set HTML input type for all editable cell. Following will be accepted `text` `number` `date` `select` `textarea` |
| saveType | *string* | `auto` | Set when to run saving mthod. `auto` Save data on every cell edit done.`manual` Save data when the "save" button is pushed |
| ajax | *object* | | Set ajax properties. |
| keyData | | false | |
| validateDraw | | false | |
| columnDefs | *array[{...}, {...} ,...]* | [] | Set HTML input type and formulas for pericular column.|

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
