$(document).ready(function() {

    var dataSet = [
        {id:1, name:"Tiger Nixon", position:"System Architect", office:"Edinburgh", extension:"5421", startDate:"2011/04/25", salary:"Tiger Nixon", remark:"Scheduled to move to Tokyo \n in August 2021"},
        {id:2, name:"Garrett Winters", position:"Accountant", office:"Tokyo", extension:"8422", startDate:"2011/07/25", salary:"Garrett Winters", remark:"Under salary negotiations"},
        {id:3, name:"Ashton Cox", position:"Junior Technical Author", office:"San Francisco", extension:"1562", startDate:"2009/01/12", salary:"Ashton Cox", remark:""},
        {id:4, name:"Cedric Kelly", position:"Senior Javascript Developer", office:"Edinburgh", extension:"6224", startDate:"2012/03/29", salary:"Cedric Kelly",remark:""},
        {id:5, name:"Airi Satou", position:"Accountant", office:"Tokyo", extension:"5407", startDate:"2008/11/28", salary:"Airi Satou",remark:""},
        {id:6, name:"Brielle Williamson", position:"Integration Specialist", office:"New York", extension:"4804", startDate:"2012/12/02", salary:"Brielle Williamson",remark:""},
        {id:7, name:"Herrod Chandler", position:"Sales Assistant", office:"San Francisco", extension:"9608", startDate:"2012/08/06", salary:"Herrod Chandler",remark:""},
        {id:8, name:"Rhona Davidson", position:"Integration Specialist", office:"Tokyo", extension:"6200", startDate:"2010/10/14", salary:"Rhona Davidson",remark:""},
        {id:9, name:"Colleen Hurst", position:"Javascript Developer", office:"San Francisco", extension:"2360", startDate:"2009/09/15", salary:"Colleen Hurst",remark:""},
        {id:10, name:"Sonya Frost", position:"Software Engineer", office:"Edinburgh", extension:"1667", startDate:"2008/12/13", salary:"Sonya Frost",remark:""},
        {id:11, name:"Jena Gaines", position:"Office Manager", office:"London", extension:"3814", startDate:"2008/12/19", salary:"Jena Gaines",remark:""},
        {id:12, name:"Quinn Flynn", position:"Support Lead", office:"Edinburgh", extension:"9497", startDate:"2013/03/03", salary:"Quinn Flynn",remark:""},
        {id:13, name:"Charde Marshall", position:"Regional Director", office:"San Francisco", extension:"6741", startDate:"2008/10/16", salary:"Charde Marshall",remark:""},
        {id:14, name:"Haley Kennedy", position:"Senior Marketing Designer", office:"London", extension:"3597", startDate:"2012/12/18", salary:"Haley Kennedy",remark:""},
        {id:15, name:"Tatyana Fitzpatrick", position:"Regional Director", office:"London", extension:"1965", startDate:"2010/03/17", salary:"Tatyana Fitzpatrick",remark:""},
        {id:16, name:"Michael Silva", position:"Marketing Designer", office:"London", extension:"1581", startDate:"2012/11/27", salary:"Michael Silva",remark:""},
        {id:17, name:"Paul Byrd", position:"Chief Financial Officer (CFO)", office:"New York", extension:"3059", startDate:"2010/06/09", salary:"Paul Byrd",remark:""},
        {id:18, name:"Gloria Little", position:"Systems Administrator", office:"New York", extension:"1721", startDate:"2009/04/10", salary:"Gloria Little",remark:""},
        {id:19, name:"Bradley Greer", position:"Software Engineer", office:"London", extension:"2558", startDate:"2012/10/13", salary:"Bradley Greer",remark:""},
        {id:20, name:"Dai Rios", position:"Personnel Lead", office:"Edinburgh", extension:"2290", startDate:"2012/09/26", salary:"Dai Rios",remark:""},
        {id:21, name:"Jenette Caldwell", position:"Development Lead", office:"New York", extension:"1937", startDate:"2011/09/03", salary:"Jenette Caldwell",remark:""},
        {id:22, name:"Yuri Berry", position:"Chief Marketing Officer (CMO)", office:"New York", extension:"6154", startDate:"2009/06/25", salary:"Yuri Berry",remark:""},
        {id:23, name:"Caesar Vance", position:"Pre-Sales Support", office:"New York", extension:"8330", startDate:"2011/12/12", salary:"Caesar Vance",remark:""},
        {id:24, name:"Doris Wilder", position:"Sales Assistant", office:"Sidney", extension:"3023", startDate:"2010/09/20", salary:"Doris Wilder",remark:""},
        {id:25, name:"Angelica Ramos", position:"Chief Executive Officer (CEO)", office:"London", extension:"5797", startDate:"2009/10/09", salary:"Angelica Ramos",remark:""},
        {id:26, name:"Gavin Joyce", position:"Developer", office:"Edinburgh", extension:"8822", startDate:"2010/12/22", salary:"Gavin Joyce",remark:""},
        {id:27, name:"Jennifer Chang", position:"Regional Director", office:"Singapore", extension:"9239", startDate:"2010/11/14", salary:"Jennifer Chang",remark:""},
        {id:28, name:"Brenden Wagner", position:"Software Engineer", office:"San Francisco", extension:"1314", startDate:"2011/06/07", salary:"Brenden Wagner",remark:""},
        {id:29, name:"Fiona Green", position:"Chief Operating Officer (COO)", office:"San Francisco", extension:"2947", startDate:"2010/03/11", salary:"Fiona Green",remark:""},
        {id:30, name:"Shou Itou", position:"Regional Marketing", office:"Tokyo", extension:"8899", startDate:"2011/08/14", salary:"Shou Itou",remark:""},
        {id:30, name:"Michelle House", position:"Integration Specialist", office:"Sidney", extension:"2769", startDate:"2011/06/02", salary:"Michelle House",remark:""},
        {id:32, name:"Suki Burks", position:"Developer", office:"London", extension:"6832", startDate:"2009/10/22", salary:"Suki Burks",remark:""},
        {id:33, name:"Prescott Bartlett", position:"Technical Author", office:"London", extension:"3606", startDate:"2011/05/07", salary:"Prescott Bartlett",remark:""},
        {id:34, name:"Gavin Cortez", position:"Team Leader", office:"San Francisco", extension:"2860", startDate:"2008/10/26", salary:"Gavin Cortez",remark:""},
        {id:35, name:"Martena Mccray", position:"Post-Sales support", office:"Edinburgh", extension:"8240", startDate:"2011/03/09", salary:"Martena Mccray",remark:""},
        {id:36, name:"Unity Butler", position:"Marketing Designer", office:"San Francisco", extension:"5384", startDate:"2009/12/09", salary:"Unity Butler",remark:""},
    ];

    var columns = [{
        title: "Id",
        data: "id"
    }, {
        title: "Name",
        data: "name"
    }, {
        title: "Position",
        data:"position"
    }, {
        title: "Office",
        data:"office"
    }, {
        title: "Extn.",
        data:"extension"
    }, {
        title: "Start date",
        data:"startDate"
    }, {
        title: "Salary",
        data:"salary"
    },{
        title: "Remark",
        data:"remark"
    }];


    myTable = $('#example').DataTable({
        "sPaginationType": "full_numbers",
        data: dataSet,
        columns: columns,
        dom: 'Bfrtip',        // Needs button container
        responsive: true,
        editable:{
            columns:[1,2,3,4,5,6,7],
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
                    //You can separate the text and value of option tag. Write as follows
                    // formula:[
                    //      {
                    //          val:1,
                    //          text:"Edinburgh"
                    //      },
                    //      {
                    //          val:2,
                    //          text:"Tokyo"
                    //      }, .....
                    // ]
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
                {
                    target:[7],
                    inputType:'textarea',
                }
            ],
        },
        buttons: []
    });


});
