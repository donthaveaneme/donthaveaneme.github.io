const input = document.getElementById("result");
const post = document.getElementById("post");

input.addEventListener("input", function () {
if (input.value.trim() !== "") {
    post.textContent = input.value;
} else {
    post.textContent = "Input kosong!";
}
});
