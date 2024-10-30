//IMPORTAR FIREBASE
import './firebase.js';
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

var iniciar_sesion = document.getElementById("chirimacha");
iniciar_sesion.addEventListener("submit", (e) => {
    e.preventDefault();
    chirimacha();
})

function chirimacha() {
    let usuario_existente = document.getElementById("carta_login").value;
    let contraseña_existente = document.getElementById("topSecret_login").value;
    if (usuario_existente === "") {
        console.log("ya me quiero ir");
    } else {
        if (contraseña_existente === "") {
            console.log("tengo sueño");
        } else {
            alert("Termine")
        }
    }

    //INICIAR SESIÓN CON CORREO Y PASSWORD

    signInWithEmailAndPassword(auth, usuario_existente, contraseña_existente)
        .then((userCredential) => {
            alert('Coffee');
            window.location.href = "index.html";
        })
        .catch((error) => {
            alert('error');
            console.log(error.message);
        })
}


let google = document.getElementById("google");
google.addEventListener("click", function(){
    console.log("Pequeño cardo.");
    
    const provier = new GoogleAuthProvider();

    signInWithPopup(auth, provier)
        .then((result) => {
            alert("Inicio con Google");
            const user = result.user;
            console.log(user);
            window.location = "index.html"
        })
        .catch((error) => {
            alert("Error");
            console.log(error.message);
        })
})