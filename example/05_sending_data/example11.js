$(document).ready(function() {


    myTable = $('#example').DataTable({
        "sPaginationType": "full_numbers",
        dom: 'Bfrtip',        // Needs button container
        responsive: true,
        editable:{
            ajax:{
                url:"example.php",
            },
            onSave:(xhr, status, errorThrows) => {
                console.log(xhr)
            },
            keyData:'0',
            columns:[1,2,3,4,5,6],
            format:'Y/m/d',
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
                },
            ],
        },
        buttons: []
    });


});
