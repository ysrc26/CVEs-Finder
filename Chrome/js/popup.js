var BASE_URL = "https://nvd.nist.gov/rest/public/cpe/";
var URL_CVES = "https://nvd.nist.gov/vuln/search/results?form_type=Advanced&results_type=overview&search_type=all&isCpeNameSearch=true";

function getCVEs(vendor, product, cpeversion) {
    $.get(URL_CVES, {
        cpe_vendor: "cpe:/:" + vendor,
        cpe_product: "cpe:/::" + product,
        cpe_version: "cpe:/:" + vendor + ":" + product + ":" + cpeversion
    }, function (data, status) {
        if (status === 'success') {
            var resultsobj = document.createElement('div');
            resultsobj.innerHTML = data;
            var CVEsList = resultsobj.getElementsByTagName('table')[0];
            if (CVEsList) {
                document.getElementById('results').appendChild(CVEsList);
                $('#results a').each(function () {
                    let $this = $(this),
                        href = $this.attr('href');
                    $this.attr('href', "https://nvd.nist.gov" + href);
                })
            }
            else {
                document.getElementById('results').innerText = "error to get CVEs";
            }
        }
        else {
            document.getElementById('results').innerText = "error to get CVEs";
        }
    });
}

function getProductList(productName) {

    fetch(BASE_URL + "products?serviceType=productList&startsWith=" + productName)
        .then(function (response) {
            return response.json();
        })
        .then(function (productList) {
            //Clear last results
            $('#productsList').editableSelect('clear');

            if (productList.hasOwnProperty('components')) {
                productList.components.forEach(function (key) {
                    $('#productsList').editableSelect('add', key.componentName);
                });
            }
            else {
                console.log('Error: No products were found.');
            }
        })
        .catch(function (error) {
            console.log('Request failed', error);
        });
}

function getVendorsList(productName) {
    fetch(BASE_URL + "vendors?serviceType=vendors&product=" + productName)
        .then(function (response) {
            return response.json();
        })
        .then(function (vendorsList) {

            //Clear last results
            $('#vendorsList').editableSelect('clear');

            if (vendorsList.hasOwnProperty('components')) {
                vendorsList.components.forEach(function (key) {
                    $('#vendorsList').editableSelect('add', key.componentName);
                });
            }
            else {
                console.log('Error: No vendors were found.');
            }
        })
        .catch(function (error) {
            console.log('Request failed', error);
        });
}

function getVersionsList(product, vendor) {

    fetch(BASE_URL + "versions?serviceType=versions&product=" + product + "&vendor=" + vendor)
        .then(function (response) {
            return response.json();
        })
        .then(function (versionsList) {
            //Clear last results
            $('#versionsList').editableSelect('clear');

            if (versionsList.hasOwnProperty('components')) {
                versionsList.components.forEach(function (key) {
                    let versionElement = key.cpeUri.split(":");
                    $('#versionsList').editableSelect('add', versionElement[versionElement.length - 1]);
                });
            }
            else {
                console.log('Error: No vulnerable versions were found.');
            }
        })
        .then(function () {
            $('#versionsList').on('select.editable-select', function () {
                document.getElementById("getVulnList").disabled = false;
            });
        })
        .catch(function (error) {
            console.log('Request failed', error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    // Start Here
    var getVulnListButton = document.getElementById('getVulnList');
    var product, vendor, version;
    var productElement = $('#productsList').editableSelect();
    var vendorElement = $('#vendorsList').editableSelect();
    var versionElement = $('#versionsList').editableSelect();

    productElement.on('changed.editable-select', function (e, input) {
        getProductList(input[0].value);
    });

    //region on Select event
    productElement.on('select.editable-select', function (e, li) {
        product = li.text();
        getVendorsList(product);
    });

    vendorElement.on('select.editable-select', function (e, li) {
        vendor = li.text();
        getVersionsList(product, vendor);
    });

    versionElement.on('select.editable-select', function (e, li) {
        version = li.text();
    });
    //endregion

    getVulnListButton.addEventListener('click', function () {
        //Clear previous results
        document.getElementById('results').innerHTML = "";
        getCVEs(vendor, product, version);
    });
});