//IMPORTAR FIREBASE
import './firebase.js';
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

var formulario = document.getElementById("grillito");
formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    grillito();
})

function grillito() {
    // let usuario = document.getElementById("usuary").value;
    let fecha_nacimiento = document.getElementById("born").value;
    let email = document.getElementById("carta").value;
    let contraseña = document.getElementById("topSecret").value;
    let comprobante = document.getElementById("clonSecret").value;
    // if (usuario === "") {
    //     alert("Los datos deben estar completos.");
    // } else {
    
    //Comprobación de datos
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
            alert('Cuenta creada con éxito. A continuación pon un nombr de usuario y sube una foto de perfil.');
            window.location.href = "index.html";
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
// };

