var URL_VERSIONS = "https://nvd.nist.gov/NVD/Services/CpeSearchServices.ashx?serviceType=versions";
var URL_VERSION_BY_PARAM = "https://nvd.nist.gov/NVD/Services/CpeSearchServices.ashx?serviceType=versionList";
var URL_VENDOR = "https://nvd.nist.gov/NVD/Services/CpeSearchServices.ashx?serviceType=vendors";
var URL_CVES = "https://nvd.nist.gov/vuln/search/results?adv_search=true&form_type=advanced&results_type=overview";

function getCVEs(callback, vendor, product, cpeversion) {
    $.get(URL_CVES, {
        cpe_vendor: vendor,
        cpe_product: product,
        cpe_version: cpeversion
    }, function (data, status) {
        if (status === 'success') {
            var resultsobj = document.createElement('div');
            resultsobj.innerHTML = data;
            var CVEsList = resultsobj.getElementsByTagName('table')[0];
            document.getElementById('results').appendChild(CVEsList);
        }
        else {
            document.getElementById('results').innerText = "error";
        }
    });
}

function getVendorsList(product) {
    $.get(URL_VENDOR, {product: product}, function (data) {
        var vendorsListElement = document.getElementById("vendorsList");

        // Clear previous results
        vendorsListElement.options.length = 0;

        // Add vendors to vendors list
        var vendors = data.split("|");
        vendors.forEach(function (entry) {
            if (!entry.includes("cpe")) {
                vendorsListElement.options[vendorsListElement.options.length] = new Option(entry, entry);
            }
        });
        getVersionsList(product, vendorsListElement.options[vendorsListElement.selectedIndex].value)
    });
}

function getVersionsList(product, vendor) {
    $.get(URL_VERSIONS, {product: product, vendor: vendor}, function (data) {

        //TODO Clear last results

        var versions = data.split("|");
        versions.forEach(function (entry) {
            let versionNumber = entry.split(":");
            $('#versionsList').editableSelect('add',
                versionNumber[versionNumber.length - 1],
                0,
                {0: {"name": "value", "value": entry}});
        });
    });
}

function updateVersionsList(product, vendor, versionStartsWith) {
    $.get(URL_VERSION_BY_PARAM, {
        product: product,
        vendor: vendor,
        versionStartsWith: versionStartsWith
    }, function (data) {
        var versions = data.split("|");
        versions.forEach(function (entry) {
            let versionNumber = entry.split(":");
            $('#versionsList').editableSelect('add',
                versionNumber[versionNumber.length - 1],
                0,
                {0: {"name": "value", "value": entry}});
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Start Here
    var button = document.getElementById('getVulnList');
    var product = document.getElementById('productText');
    var vendorsList = document.getElementById('vendorsList');
    var versionsList = document.getElementById('versionsList');
    var vendor;
    var version;

    // Add listener for product to get vendors list
    product.addEventListener("input", function () {
        getVendorsList(product.value);
    });

    // Add listener for vendor to get versions list
    vendorsList.addEventListener("input", function () {
        vendor = vendorsList.options[vendorsList.selectedIndex].value;
        getVersionsList(product.value, vendor);
    });

    // TODO: update versions lists when user changed the version text field
    // updateVersionsList(product.value,vendor,versiontext)


    // Add listener for versions list to get the selected version
    $('#versionsList').editableSelect().on('select.editable-select', function (e, selectedVersion) {
        version = selectedVersion.attr("value");
    });

    button.addEventListener('click', function () {
        //Clear previous results
        document.getElementById('results').innerHTML = "";

        getCVEs("", vendor, product.value, version);
    });
});