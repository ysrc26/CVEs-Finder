var BASE_URL = "https://nvd.nist.gov/NVD/Services/CpeSearchServices.ashx";
var URL_CVES = "https://nvd.nist.gov/vuln/search/results";

function getCVEs(vendor, product, cpeversion) {
    $.get(URL_CVES, {
        cpe_vendor: vendor,
        cpe_product: product,
        cpe_version: cpeversion
    }, function (data, status) {
        if (status === 'success') {
            var resultsobj = document.createElement('div');
            resultsobj.innerHTML = data;
            var CVEsList = resultsobj.getElementsByTagName('table')[0];
            if (CVEsList) {
                document.getElementById('results').appendChild(CVEsList);
            }
            else {
                document.getElementById('results').innerText = "error to get CVEs";
                // // console.log($('resultsobj')("div:contains(There are \\0 matching records)"));
                // // var $i = $(data);
                // // console.log($(data)("div:contains(There are \\0 matching records)"));
                // var $jQueryObject = $($.parseHTML(data));
                // console.log(typeof $jQueryObject);
                // // console.log($jQueryObject.find("#frameBusterDiv").html());
                // console.log($($jQueryObject)("div:contains(There are \\0 matching records)"));
            }
        }
        else {
            document.getElementById('results').innerText = "error to get CVEs";
        }
    });
}

function getVendorsList(product) {
    $.get(BASE_URL, {serviceType: "vendors", product: product}, function (data) {
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
    //Clear last results
    $('#versionsList').editableSelect('clear');

    $.get(BASE_URL, {serviceType: "versions", product: product, vendor: vendor}, function (data) {

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
    //Clear last results
    $('#versionsList').editableSelect('clear');

    $.get(BASE_URL, {
        serviceType: "versionList",
        product: product,
        vendor: vendor,
        startsWith: versionStartsWith
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
    $('#versionsList').editableSelect('show');
}

document.addEventListener('DOMContentLoaded', function () {
    // Start Here
    var button = document.getElementById('getVulnList');
    var product = document.getElementById('productText');
    var vendorsList = document.getElementById('vendorsList');
    var versionsList = document.getElementById('versionsList');

    // Add listener for product to get vendors list
    product.addEventListener("input", function () {
        getVendorsList(product.value);
    });

    // Add listener for vendor to get versions list
    vendorsList.addEventListener("input", function () {
        let vendor = vendorsList.options[vendorsList.selectedIndex].value;
        getVersionsList(product.value, vendor);
    });

    // // Add listener for versions list to update versions lists when user changed the version text field
    $('#versionsList').editableSelect().on('changed.editable-select', function (e, input) {
        if (input[0].value === "") {
            getVersionsList(product.value, vendorsList.options[vendorsList.selectedIndex].value);
        }
        else {
            updateVersionsList(product.value,
                vendorsList.options[vendorsList.selectedIndex].value,
                input[0].value);
        }
    });

    button.addEventListener('click', function () {
        //Clear previous results
        document.getElementById('results').innerHTML = "";

        getCVEs(vendorsList.options[vendorsList.selectedIndex].value,
            product.value,
            versionsList.options[versionsList.selectedIndex].value);
    });
});