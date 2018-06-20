function loadInfo(search = 'normal') {
    var items = getItems(search);

    // Load genetic info
    var maxWeight = getValue("maxWeight");
    var genSize = getValue("npop");
    var numGen = getValue("numgen");
    var sel = getValue("numsel");

    geneticSearch(items, maxWeight, numGen, genSize, sel, search);
}

function getItems(search) {
    var rows = window.document.getElementById("knapsack").childNodes[3].children;

    // Load items in the box
    var items = {};
    var item;
    // HTML values
    var child;
    var info;

    if (search != "normal") {
        if (search == "existence") {
            // console.log("HOLAAAAAA");
            console.log("Getting existences");
            var exist = getExistences();
        }
        // Seartch with types.
        else {

        }
    }

    for (var r = 0; r < rows.length; ++r) {
        child = rows[r].children;

        item = parseInt(child[0].textContent);
        info = {
            weight: parseInt(child[1].children[0].value),
            value: parseInt(child[2].children[0].value),
        };

        if (search != "normal") {
            if (search === "existence") {
                info.existence = exist[r + 1];
            }
        }

        items[item - 1] = info;
    }
    // console.log("HOLAAAAAA");

    items.length = rows.length;
    // console.log(items,items.length,"HOLAAAAAA");

    return items;
}

function getValue(id) {
    var el = window.document.getElementById(id);

    return parseInt(el.value);
}

function getExistences() {
    var rows = r = window.document.getElementById("existence-table").childNodes[3].children;
    var select;

    var selections = [];
    for (r of rows) {
        select = r.children[0].children[0];
        // console.log(r.children[0].children[0],"HOLAAAAAA");
        selections.push(select.value);
    }

    return selections;
}
