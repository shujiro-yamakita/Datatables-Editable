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

| Option | Accepted values | default | Description |
| --- | --- | --- | --- |
| `add` | *boolean* | `true` | Enable to add new line to table |
| delete | *boolean* | `true` | ENable to delete line from table |
| columns | *array[int, int, ...]* | `null` | Set column index which is editable. All columns are editable on default. |
| rows | *array[int, int, ...]* | `null` | Set row index which is editable. All rows are editable on default. |
| cell | *array[{rpw:int, col:int},{}, ...]* | `null` | Set perticular cell which is editable. All cells are editable on default. |
| inputType | | | |
| saveType | | | |
| ajax | | | |
| keyData | | | |
| validateDraw | | | |
| columnDefs | | | |
