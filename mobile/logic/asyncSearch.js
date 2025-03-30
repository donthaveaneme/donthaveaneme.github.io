document.addEventListener("DOMContentLoaded", function () {
    let searchInput = document.getElementById("result");

    searchInput.addEventListener("input", function () {
        let keyword = searchInput.value.trim();

        if (keyword !== "") {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", "logic/search.php?search=" + encodeURIComponent(keyword), true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let data = JSON.parse(xhr.responseText);
                    let resultDiv = document.getElementById("post");

                    if (data.length > 0) {
                        resultDiv.innerHTML = "<ul>";
                        data.forEach(item => {
                            resultDiv.innerHTML += `<li>${item.item_code} (${item.item_name})</li>`;
                        });
                        resultDiv.innerHTML += "</ul>";
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
