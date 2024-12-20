//IMPORTAR FIREBASE
import './firebase.js';
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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


    //Comprobación de datos
    if (usuario === "") {
        alert("Los datos deben estar completos.");
    } else {
    if (email === "") {
        alert("Los datos deben estar completos.");
    } else {
        if (fecha_nacimiento === "") {
            alert("Los datos deben estar completos.");
        } else {
            if (contraseña === "") {
                alert("Los datos deben estar completos.");
            } else {
                if (comprobante === "") {
                    alert("Los datos deben estar completos.");
                } else {
                    if (contraseña === comprobante) {
                        //CREAR CORREO Y PASSWORD 
                        createUserWithEmailAndPassword(auth, email, contraseña)
                            .then((userCredential) => {
                                let user = userCredential.user;

                                //Actualizar el nombre de usuario
                                updateProfile(user, {
                                    displayName: usuario
                                }).then(() => {
                                    console.log("Se actualizó el nombre a " + user.displayName);
                                    //Redirigir a la página de inicio
                                    window.location.href = "index.html";
                                }).catch((error) => {
                                    console.log("Error al actualizar el nombre del usuario:", error);
                                })
                            })
                            .catch((error) => {
                                alert('error');
                                console.log(error.message);
                            })
                    } else {
                        alert("Has escrito mal la confirmación de contraseña")
                    }
                }
            }
        }
    }
}
};

