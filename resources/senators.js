// Initalising a global variable to hold the JSON data
var parsedObj;
var xmlhttp = new XMLHttpRequest();
var url = "senators.json";

// Parses the JSON data and invokes the function run()
xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        parsedObj = JSON.parse(xmlhttp.responseText);
        var detailedParseComplete = true;
        run(detailedParseComplete);
    }
};

xmlhttp.open("GET", url, true);
xmlhttp.send();

// Seperate out automatic functions for better readability
function run(dataParsed) {
    enableInput(dataParsed);
    uniqueLists();
    reps(uniqueLists());
    senatorInfo(uniqueLists());
}

// Function to check if JSON data was read successfully
function enableInput(dataParsed) {
    if (dataParsed) {
        document.getElementById('debug').innerHTML = "JSON data has been read successfully";
    } else {
        document.getElementById('debug').innerHTML = "There was an issue reading the JSON data!";
    }
}

// Adds to a set the unique party, rank and state information from each senator
function uniqueLists() {
    var senatorsArray = parsedObj.objects;
    var partyList = [];
    var rankList = [];
    var stateList = [];

    for (var i=0; i <senatorsArray.length; i++) {
        if (partyList.indexOf(senatorsArray[i].party) == -1) {
            partyList.push(senatorsArray[i].party);
        }

        if (rankList.indexOf(senatorsArray[i].senator_rank_label) == -1) {
            rankList.push(senatorsArray[i].senator_rank_label);
        }

        if (stateList.indexOf(senatorsArray[i].state) == -1) {
            stateList.push(senatorsArray[i].state);
        }

    }
    
    return [partyList, rankList, stateList];
}

/* Function that counts the instances of democrat, republican and independents and populates the list of senators in leadership positions */
function reps(listsInfo) {
    var senatorsArray = parsedObj.objects;
    var representTable = "<table class='representTable'>";
    var partyList = "<ul>";
    var partyObj = {};

    for(var i=0; i < listsInfo[0].length; i++) {
        for (var j=0; j <senatorsArray.length; j++) {

            if (senatorsArray[j].party == listsInfo[0][i] && partyObj.hasOwnProperty(listsInfo[0][i]) == false) {
                partyObj[listsInfo[0][i]] = 1;

            } else if (senatorsArray[j].party == listsInfo[0][i]) {
                partyObj[listsInfo[0][i]] += 1;
            }
        }
    }

    // Ref: https://www.programiz.com/javascript/examples/key-value-object
    representTable += "<tr><th colspan=" + Object.keys(partyObj).length + ">";

    representTable += "Number of Representatives</th></tr>";
    representTable += "<tr>";

    for(var k=0; k < Object.keys(partyObj).length; k++) {
        representTable += "<td>" + Object.keys(partyObj)[k] + "s</td>";
    }

    representTable += "</tr>";

    for(var m=0; m < Object.keys(partyObj).length; m++) {
        representTable += "<td>" + Object.values(partyObj)[m] + "</td>";
    }

    for (var n=0; n <senatorsArray.length; n++) {
        if (senatorsArray[n].leadership_title != null) {
            var senatorTitle = senatorsArray[n].leadership_title;
            var senatorFirstName = senatorsArray[n].person.firstname;
            var senatorLastName = senatorsArray[n].person.lastname;
            var senatorParty = senatorsArray[n].party;
            partyList += "<li class=" + senatorParty + ">" + senatorTitle + ": " + senatorFirstName + " " + senatorLastName + " (" + senatorParty + ")" + "</li>";
        }
    }

    representTable += "</tr></table>";

    partyList += "</ul>";

    document.getElementById("total_table").innerHTML = representTable;
    document.getElementById("partyList").innerHTML = partyList;

    // Calls the sort list funciton to sort the leadership list by party
    sortList();
}

/* The below function sorts the list by the party in the text after the bracket thereby grouping them */
/* Ref: https://www.w3schools.com/howto/howto_js_sort_list.asp */
function sortList() {
    var list, i, switching, b, shouldSwitch;
    list = document.getElementById("partyList");
    switching = true;
    while (switching) {
        switching = false;
        b = list.getElementsByTagName("li");
        for (i = 0; i < (b.length-1); i++) {
            shouldSwitch = false;
            if (b[i].innerHTML.split("(")[1].toLowerCase() > b[i + 1].innerHTML.split("(")[1].toLowerCase()) {
                shouldSwitch = true;
                break;
            }
        }

        if (shouldSwitch) {
            b[i].parentNode.insertBefore(b[i + 1], b[i]);
            switching = true;
        }
    }
}

/* Function that loops through the JSON file and creates the the div for each senator by invoking the function updateSenatrSection, completed by successive for loops to group the senators by party. */
function senatorInfo(listsInfo) {
    var senatorsArray = parsedObj.objects;

    var senatorsSection = "";
    var partyFilter = "";
    var rankFilter = "";
    var stateFilter = "";

    for(var i=0; i < Object.keys(listsInfo[0]).length; i++) {
        partyFilter += "<input type='checkbox' value='" + listsInfo[0][i] + "' id='filter"+ listsInfo[0][i] +"' onclick='filter()'><label for='filter" + listsInfo[0][i] + "'>"+ listsInfo[0][i] + "</label><br>";

        for (var j=0; j <senatorsArray.length; j++) {
            if(senatorsArray[j].party == listsInfo[0][i]) {
                senatorsSection += updateSenatorsSection(senatorsArray, j);
            }
        }
    }

    for(var k=0; k < Object.keys(listsInfo[1]).length; k++) {
        rankFilter += "<input type='checkbox' value='" + listsInfo[1][k] + "' id='filter"+ listsInfo[1][k] +"' onclick='filter()'><label for='filter" + listsInfo[1][k] + "'>"+ listsInfo[1][k] + "</label><br>";
    }

    for(var m=0; m < Object.keys(listsInfo[2]).length; m++) {
        stateFilter += "<li><input type='checkbox' value='" + listsInfo[2][m] + "' id='filter"+ listsInfo[2][i] +"' onclick='filter()'><label for='filter" + listsInfo[2][m] + "'>"+ listsInfo[2][m] + "</label></li>";
    }

    document.getElementById("partyFilter").innerHTML = partyFilter;
    document.getElementById("rankFilter").innerHTML = rankFilter;
    document.getElementById("drop_content").innerHTML = stateFilter;
    document.getElementById("senatorsSection").innerHTML = senatorsSection;

    // Invokes a sort list funciton to sort the states alphabetically
    sortStates();
}

/* The below function sorts the states alphabetically in the dropdown */
/* Ref: https://www.w3schools.com/howto/howto_js_sort_list.asp */
function sortStates() {
    var list, i, switching, b, shouldSwitch;
    list = document.getElementById("drop_content");
    switching = true;
    while (switching) {
        switching = false;
        b = list.getElementsByTagName("li");
        for (i = 0; i < (b.length-1); i++) {
            shouldSwitch = false;
            if (b[i].innerHTML.toLowerCase() > b[i + 1].innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
            }
        }

        if (shouldSwitch) {
            b[i].parentNode.insertBefore(b[i + 1], b[i]);
            switching = true;
        }
    }
}

/* Function that creates each senator div and returns a string back */
function updateSenatorsSection(array, item) {

    var senatorFirstName = array[item].person.firstname;
    var senatorLastName = array[item].person.lastname;
    var senatorParty = array[item].party;
    var senatorState = array[item].state;
    var senatorGender = array[item].person.gender_label;
    var senatorRank = array[item].senator_rank_label;
    var eachSenatorBox = "<div class='eachSenator show "+ item + " " + senatorParty + " " + senatorRank + " " + senatorState + "'><p>" + senatorFirstName + " " + senatorLastName + "</p><p>" + senatorParty + "</p><p>" + senatorState + "</p><p>" + senatorGender +"</p><p>" + senatorRank + "</p><p><button class='detailsButton' type='button' onclick='senDetailsBtnClicked("+item+", event);'>Details</button></p></div>";

    return eachSenatorBox;
}

/* Function that executes when the user clicks for more details about a particular senator */
function senDetailsBtnClicked(item, event) {

    disableFilters(uniqueLists());

    var senators = parsedObj.objects;
    var senDetailedInfo = "";
    var senatorFirstName = senators[item].person.firstname;
    var senatorLastName = senators[item].person.lastname;
    var senatorParty = senators[item].party;
    var senatorState = senators[item].state;
    var senatorGender = senators[item].person.gender_label;
    var senatorRank = senators[item].senator_rank_label;
    var senatorOffice = senators[item].extra.office;
    var senatorDOB = senators[item].person.birthday;
    var senatorStartDate = senators[item].startdate;
    var senatorYoutube = senators[item].person.youtubeid;
    var senatorTwitter = senators[item].person.twitterid;
    var senatorWebsite = senators[item].website;

    var yCordDetails = event.pageY;

    senDetailedInfo += "<div class='popup "+ item + " " + senatorParty + " " + senatorRank + "'><p>" +"Name :" + senatorFirstName + " " + senatorLastName + "</p><p>" +"Party: " +senatorParty + "</p><p>" + "State: " + senatorState + "</p><p>" + "Gender: " + senatorGender +"</p><p>" + "Rank: " +senatorRank + "</p><p>" + "Office : " + senatorOffice + "</p><p>" + "DOB: " + senatorDOB + "</p><p>" +"Start Date: " +senatorStartDate +"</p><p>" + "YoutubeID: " + senatorYoutube + "</p><p>" + "TwitterID: " + senatorTwitter + "</p><p>" +"Website: <a href='" + senatorWebsite + "'target = '_blank'>" + senatorWebsite +"</a>" +"</p><p> <button type='button' onclick='removePopUp(uniqueLists(), " + yCordDetails + ")'>Close</button></p></div>";
    document.getElementById("detailedInfo").innerHTML = senDetailedInfo;
    document.getElementById("detailedInfo").style.display = "block";

    pageScroll();
}

// Scrolls to the top of the popup box
function pageScroll() {
    window.scroll({
        top: 1200,
        behavior: 'smooth'
    });
}

/* This disables the filters and details buttons when the detailed info on each senator popup is open*/
function disableFilters(listsInfo) {
    for(var i=0; i < listsInfo[0].length; i++) {
        document.getElementById("filter"+listsInfo[0][i]).disabled = true;
    }

    for(var j=0; j < listsInfo[1].length; j++) {
        document.getElementById("filter"+listsInfo[1][j]).disabled = true;
    }
    
    var buttons = document.getElementsByClassName("detailsButton");

    for(var n=0; n < buttons.length; n++) {
        buttons[n].disabled = true;
    } 

    document.getElementById("dropdown").classList.add("hide");
    document.getElementById("resetButton").disabled = true;
}

/* When the close button of the popup is clicked, this function executes that re-enables the filtering, the details buttons, removes the popup and scrolls back to the original y coordinate of where the button was pressed  */
function removePopUp(listsInfo, yCordDetails) {
    document.getElementById("detailedInfo").style.display = "none";
    document.getElementById("resetButton").disabled = false;
    document.getElementById("dropdown").classList.remove("hide");


    var buttons = document.getElementsByClassName("detailsButton");

    for(var i=0; i < buttons.length; i++) {
        buttons[i].disabled = false;
    }

    for(var j=0; j < listsInfo[0].length; j++) {
        document.getElementById("filter"+listsInfo[0][j]).disabled = false;
    }

    for(var m=0; m < listsInfo[1].length; m++) {
        document.getElementById("filter"+listsInfo[1][m]).disabled = false;
    }
    
    var value = yCordDetails - 200;
    window.scroll({
    top: value,
    behavior: 'smooth'
    });
}

/* On click of the filters, the below function will execute. It checks for all instances of checked checkboxes and appends them to a list.  */
function filter() {
    var party = document.querySelectorAll(".party input");
    var partyFilter = [];
    var rank = document.querySelectorAll(".rank input");
    var rankFilter = [];
    var state = document.querySelectorAll(".state input");
    var stateFilter = [];
    var p;
    var r;
    var s;
    for(var i = 0; i < party.length; i++) {
        if(party[i].checked) {
            p = party[i].value;
            partyFilter.push(p);
        }
    }

    for(var j = 0; j < rank.length; j++) {
        if(rank[j].checked) {
            r = rank[j].value;
            rankFilter.push(r);
        }
    }

    for(var m = 0; m < state.length; m++) {
        if(state[m].checked) {
            s = state[m].value;
            stateFilter.push(s);
        }
    }

    /* For each senator, if the filter is in the class name of the senator it will add the CSS show rule to display the particular senator. For party, rank and state, it will return the union of the filters. Combining filters e.g. party and rank will return the intersection of parties and ranks */
    /* Ref: https://www.w3schools.com/howto/howto_js_filter_elements.asp; https://w3schools.invisionzone.com/topic/61299-appling-multiple-filters-to-div-elements/ */
    var items = document.querySelectorAll(".eachSenator");
    var item, show;
    var counter = 0;
    for(var n = 0; n < items.length; n++) {
        item = items[n];
        if(partyFilter.length == 0 && rankFilter.length == 0 && stateFilter.length == 0) {
            show = true;
        } else if (partyFilter.length != 0 && rankFilter.length == 0 && stateFilter.length == 0) {
        show = false;
        for(var u = 0; u < partyFilter.length; u++) {
            if(item.classList.contains(partyFilter[u])) {
                show = true;
                break;
            }
        }   
        } else if (partyFilter.length == 0 && rankFilter.length != 0  && stateFilter.length == 0) {
        show = false;
        for(var q = 0; q < rankFilter.length; q++) {
            if(item.classList.contains(rankFilter[q])) {
                show = true;
                break;
            }
        }
        } else if (partyFilter.length == 0 && rankFilter.length == 0  && stateFilter.length != 0) {
        show = false;
        for(var x = 0; x < stateFilter.length; x++) {
            if(item.classList.contains(stateFilter[x])) {
                show = true;
                break;
            }
        }
        } else if (partyFilter.length != 0 && rankFilter.length != 0 && stateFilter.length == 0) {
        show = false;
        for(var y = 0; y < partyFilter.length; y++) {
            if(item.classList.contains(partyFilter[y])) {
                for(var z = 0; z < rankFilter.length; z++) {
                    if(item.classList.contains(rankFilter[z])) { 
                        show = true;
                        break;
                    }
                }
            }
        }   
        } else if (partyFilter.length != 0 && rankFilter.length == 0 && stateFilter.length != 0) {
        show = false;
        for(var a = 0; a < partyFilter.length; a++) {
            if(item.classList.contains(partyFilter[a])) {
                for(var b = 0; b < stateFilter.length; b++) {
                    if(item.classList.contains(stateFilter[b])) { 
                        show = true;
                        break;
                    }
                }
            }
        }   
        } else if (partyFilter.length == 0 && rankFilter.length != 0 && stateFilter.length != 0) {
        show = false;
        for(var c = 0; c < rankFilter.length; c++) {
            if(item.classList.contains(rankFilter[c])) {
                for(var d = 0; d < stateFilter.length; d++) {
                    if(item.classList.contains(stateFilter[d])) { 
                        show = true;
                        break;
                    }
                }
            }
        }   
        } else if (partyFilter.length != 0 && rankFilter.length != 0 && stateFilter.length != 0) {
        show = false;
        for(var g = 0; g < partyFilter.length; g++) {
            if(item.classList.contains(partyFilter[g])) {
                for(var h = 0; h < rankFilter.length; h++) {
                    if(item.classList.contains(rankFilter[h])) {
                        for(var t = 0; t < stateFilter.length; t++) {
                            if(item.classList.contains(stateFilter[t])) { 
                                show = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
        }

        /* Counts the number of instances of the 'show' and 'not show' CSS rule being applied. When the rule has not been applied 100 times, across all 100 individual senators there are no senators matching that combination */
        if(show) {
            item.classList.add("show");
            counter -= 1;
            if (counter < 100) {
                document.getElementById("noData").innerHTML = null;
            }
        } else {
            item.classList.remove("show");
            counter += 1;
            if (counter == 100) {
                var noData = "<p>There are no senators matching that combination of filters</p>";
                document.getElementById("noData").innerHTML = noData;
            }
        }
    }
}