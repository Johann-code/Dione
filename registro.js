//IMPORTAR FIREBASE
import './firebase.js';
import { auth } from './firebase.js';
import { updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

var formulario = document.getElementById("grillito");
formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    grillito();
})

function grillito() {
    let usuario = document.getElementById("usuary").value;
    let fecha_nacimiento = document.getElementById("born").value;
    let email = document.getElementById("carta").value;
    let contraseña = document.getElementById("topSecret").value;
    let comprobante = document.getElementById("clonSecret").value;
    if (usuario === "") {
        console.log("primera etapa");
    } else {
        if (fecha_nacimiento === "") {
            console.log("segunda etapa");
        } else {
            if (email === "") {
                console.log("tercera etapa");
            } else {
                if (contraseña === "") {
                    console.log("cuarta etapa");
                } else {
                    if (comprobante === "") {
                        console.log("quinta etapa");
                    } else {
                        if (contraseña === comprobante) {
                            alert("¡LO HICIMOS! ¡LO HICIMOS! ¡SIIIII!")
                        } else {
                            console.log("final");
                        }
                    }
                }
            }
        }
    }

    //CREAR CORREO Y PASSWORD 
    createUserWithEmailAndPassword(auth, email, contraseña)
        .then((userCredential) => {
            let user = userCredential.user;

            //Actualizar el nombre de usuario 
            updateProfile(user, {
                displayName: usuario
            }).then(() => {
                console.log("Se ha actualizado el nombre a" + user.displayName);
            })
            // alert('Cuenta creada.');
            // window.location.href = "index.html";
        })
        .catch((error) => {
            alert('error');
            console.log(error.message);
        })
};

