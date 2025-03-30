document.addEventListener("DOMContentLoaded", function () {
    let searchInput = document.getElementById("result");

    searchInput.addEventListener("input", function () {
        let keyword = searchInput.value.trim();

        if (keyword !== "") {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", "https://cors-anywhere.herokuapp.com/http://inababykids.my.id/logic/search.php?search=" + encodeURIComponent(keyword), true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let data = JSON.parse(xhr.responseText);
                    let resultDiv = document.getElementById("post");
                    if (data.length > 0) {
                        let tableHTML = "<table border='1'><tr><th>Item Code</th><th>Item Name</th><th>Division</th></tr>";
                        data.forEach(item => {
                            tableHTML += `<tr><td>${item.item_code}</td><td>${item.item_name}</td><td>${item.division_name}</td></tr>`;
                        });
                        tableHTML += "</table>";
                        resultDiv.innerHTML = tableHTML;
                    } else {
                        resultDiv.innerHTML = "<p>Barang tidak ditemukan</p>";
                    }
                }
            };

            xhr.send();
        } else {
            document.getElementById("post").innerHTML = "";
        }
    });
});
