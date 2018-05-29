/* 
 * File loading script. Uses FileReader API (might not work on some browsers).
 * Loads a file from an input tag of type file with id "fileInput"
 * 
 *  <input type="file" id="fileInput">
 */

var lector = new FileReader();

function loadFile() {
    fObj = document.getElementById('fileInput').files[0];

    // Redefinition of onload method
    lector.onload = function (fn) {
        geneticSearch(fn.target.result);
    };

    // Lectura del archivo
    lector.readAsText(fObj);
}

function loadTable() {
    
}