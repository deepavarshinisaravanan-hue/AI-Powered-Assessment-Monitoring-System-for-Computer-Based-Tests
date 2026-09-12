document.getElementById("loginForm").addEventListener("submit", function (e) {

    e.preventDefault();

    const student = document.getElementById("student").value;
    const password = document.getElementById("password").value;

    if (student === "" || password === "") {
        alert("Please fill all fields.");
        return;
    }

    alert("Login Successful!");

    window.location.href = "exam.html";

});