$(document).ready(function() {

    myTable = $('#example').DataTable({
        "sPaginationType": "full_numbers",
        dom: 'Bfrtip',        // Needs button container
        responsive: true,
        editable:{
            columns:[1,2,3,4,5,6],
            columnDefs:[
                {
                    target:[3],
                    inputType:"select",
                    formula:[
                        "Edinburgh",
                        "Tokyo",
                        "San Francisco",
                        "New York",
                        "London",
                        "Sidney",
                        "Singapore"
                    ]
                },
                {
                    target:[4],
                    inputType:'number',
                },
                {
                    target:[5],
                    inputType:'date',
                    format:'Y/m/d',
                },
            ],
        },
        buttons: []
    });


});
