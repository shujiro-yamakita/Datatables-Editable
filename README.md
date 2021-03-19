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
| --- | --- | --- | --- | --- |
| add | | | |
| delete | | | |
| columns | | | |
| rows | | | |
| cell | | | |
| inputType | | | |
| saveType | | | |
| ajax | | | |
| keyData | | | |
| validateDraw | | | |
| columnDefs | | | |
