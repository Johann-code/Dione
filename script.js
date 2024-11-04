// Importar Firebase y las funciones necesarias
import './firebase.js';
import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { orderBy, collection,getDoc, arrayUnion, arrayRemove, addDoc, getDocs, query, where, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

let nombreUsuario = document.getElementById("displayName");
let idUsuario = null;
let publicacionesDiv = document.getElementById("publicaciones");//Contenedor de publicaciones
let botonPublicar = document.getElementById("publicar");//Botón para publicar
let nuevaPublicacion = document.getElementById("nueva_publicacion");//Área de texto para nueva publicación
let fotoPublicacion = document.getElementById("foto_publicacion");//Input de archivo para subir imagen
let videoPublicacion = document.getElementById("video_publicacion");//Input de archivo para subir video

// Variables para el modal edición
let modalEditar = new bootstrap.Modal(document.getElementById('editarModal'));
let nuevoTexto = document.getElementById("nuevoTexto");
let idActualEdicion = null;

// Variables de modal para editar perfil
let nuevoNombre = document.getElementById("nuevoNombre");
let nuevaFoto = document.getElementById("nuevaFoto");
let guardarPerfilBtn = document.getElementById("guardarPerfil");

// Escuchar los cambios de autenticación
onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        // Mostrar el nombre de usuario
        nombreUsuario.innerHTML = usuario.displayName || "Usuario";
        idUsuario = usuario.uid; // Almacenar el ID del usuario

        // Recuperar la foto de perfil
        const fotoPerfil = document.getElementById("fotoPerfil");
        fotoPerfil.src = usuario.photoURL || "perfil.jpeg"; // Foto por defecto
    } else {
        window.location.href = "login.html"; // Redirigir a la página de inicio de sesión
    }
});

// Publicar nuevas publicaciones 
//Publicar una nueva foto
botonPublicar.addEventListener("click", async () => {
    if (nuevaPublicacion.value.trim() !== "" || fotoPublicacion.files.length > 0) { //Verificar que
        try {
            let urlFoto = null;//Inicialmente sin foto
            let urlVideo = null;//Inicialmente sin video

            //Subir la foto si existe
            if (fotoPublicacion.files.length > 0) {
                const archivoFoto = fotoPublicacion.files[0];
                const fotoRef = ref(storage, 'fotos_publicaciones/' + archivoFoto.name);
                //Subir la foto de la publicación a Firebase Storage
                await uploadBytes(fotoRef, archivoFoto);
                urlFoto = await getDownloadURL(fotoRef);//Obtener URL de la foto subida
            }

            //Subir video si existe
            if (videoPublicacion.files.length > 0) {
                const archivoVideo = videoPublicacion.files[0];
                const videoRef = ref(storage, 'videos_publicaciones/' + archivoVideo.name);
                await uploadBytes(videoRef, archivoVideo);
                urlVideo = await getDownloadURL(videoRef);
            }

            //Guardar la publicación con o sin imagen/video en Firestore
            await addDoc(collection(db, "publicaciones"), {
                texto: nuevaPublicacion.value, //Texto de la publicación
                userId: idUsuario, //ID del usuario que publica
                userName: auth.currentUser.displayName, //Nombre del usuario que publica
                photoURL: auth.currentUser.photoURL, //Foto de perfil del usuario que publica
                imagenPublicacion: urlFoto, //URL de la imagen de la publicación (si existe)
                videoPublicacion: urlVideo, //URL del video de publicación (si existe)
                timestamp: new Date(), //Fecha y hora de la publicación
                likes: 0 // Inicializar contador de "Me gusta"
            })
            nuevaPublicacion.value = ""; //Limpiar el área de texto
            fotoPublicacion.value = ""; //Limpiar el input de imagen
            videoPublicacion.value = ""; //Limpiar el input de video
            cargarPublicaciones();
        } catch (error) {
            console.log("Error al publicar:", error);
        }
    } else {
        console.log("El campo de publicación está vacío.");
    }
});

async function cargarPublicaciones() {
    try {
        publicacionesDiv.innerHTML = "";
        const publicacionesQuery = query(collection(db, "publicaciones"), orderBy("timestamp", "desc"));
        const consulta = await getDocs(publicacionesQuery);

        consulta.forEach((doc) => {
            const publicacion = doc.data();
            const publicacionDiv = document.createElement("div");
            publicacionDiv.classList.add("publicacion");

            // Convertir Timestamp a una fecha legible
            const fechaPublicacion = publicacion.timestamp.toDate();
            const horaPublicacion = fechaPublicacion.toLocaleTimeString();
            const fechaFormateada = fechaPublicacion.toLocaleDateString();

            // Asignar la foto de perfil
            let fotoPerfil = publicacion.photoURL || "perfil.jpg";

            // Contenido de la publicación
            let contenido = `
              <!-- Contenedor de cada publicación -->
<div class="TQMchatGPT">
    <section class="diosmioyamateme">
        <img src="${fotoPerfil}" class="fotoPerfil_publi">
        <div>
            <h4 style="margin: 0">${publicacion.userName}</h4>
            <p><sup>${fechaFormateada} a las ${horaPublicacion}</sup></p>
        </div>
    </section>
    ${publicacion.userId === idUsuario ? `
        <section>
            <button onclick="abrirModal('${doc.id}', '${publicacion.texto}')" class="btn_user">
                <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="eliminarPublicacion('${doc.id}')" class="btn_user">
                <i class="fa-solid fa-trash"></i>
            </button>
        </section>
    ` : ''}
</div>

<!-- Contenido de la publicación -->
<p>${publicacion.texto}</p>

${publicacion.imagenPublicacion ? `
    <img src="${publicacion.imagenPublicacion}" alt="Imagen de la publicación">` : ''}
    ${publicacion.videoPublicacion ? `
    <video src="${publicacion.videoPublicacion}" controls></video>` : ''}

<!-- Agregar el botón "Me gusta" y contador -->
<div class="like-section">
    <button onclick="darMeGusta('${doc.id}')" class="btn_like icono"><i class="fa-regular fa-heart" id="kokoro"></i></button>
    <span id="likeCount-${doc.id}" class="me_encorazona">${publicacion.likes || 0}</span>
</div>

            `;
            // if (publicacion.imagenPublicacion) {
            //     contenido += `<img src="${publicacion.imagenPublicacion}">`;
            // };  

            // if (publicacion.videoPublicacion) {
            //     contenido += `<video src="${publicacion.videoPublicacion}" controls type="video/mp4"></video>`;
            // }

            //"${publicacion.likes ? `
            //fa-solid fa-heart` : `fa-regular fa-heart`}"

            contenido += `
            <div class="comentarios" id="comentarios-${doc.id}"></div>
            <textarea id="comentario-${doc.id}" placeholder="Escribe un comentario..."></textarea>
            <button onclick="agregarComentario('${doc.id}')">Comentar</button>
            `;
        
            publicacionDiv.innerHTML = contenido; // Asignar contenido al div
            publicacionesDiv.appendChild(publicacionDiv); // Agregar la publicación al contenedor

            //Cargar los comentarios de esta publicación
            cargarComentarios(doc.id);
        });
    } catch (error) {
        console.error("Error al cargar publicaciones:", error);
    }
}

// Cargar publicaciones al cargar la página
cargarPublicaciones();

// Función para abrir el modal de edición 
window.abrirModal = function (id, texto) {
    idActualEdicion = id;
    nuevoTexto.value = texto;
    modalEditar.show();
};

// Guardar cambios a la publicación editada
document.getElementById("guardarCambios").addEventListener("click", async () => {
    if (nuevoTexto.value.trim() !== "") {
        try {
            await updateDoc(doc(db, "publicaciones", idActualEdicion), {
                texto: nuevoTexto.value
            });
            modalEditar.hide();
            cargarPublicaciones();
        } catch (error) {
            console.log("Error al editar publicación:", error);
        }
    }
});

// Función para eliminar publicación 
window.eliminarPublicacion = async function (id) {
    try {
        await deleteDoc(doc(db, "publicaciones", id));
        cargarPublicaciones();
    } catch (error) {
        console.log("Error al eliminar publicación:", error);
    }
};

// Actualizar perfil (nombre y foto)
guardarPerfilBtn.addEventListener("click", async () => {
    let user = auth.currentUser; // Usuario autenticado
    let updates = {};
    let nuevoNombreValue = null;
    let nuevaFotoURL = null;

    // Si el nombre ha sido actualizado
    if (nuevoNombre.value.trim() !== "") {
        updates.displayName = nuevoNombre.value;
        nuevoNombreValue = nuevoNombre.value;
    }

    // Si se seleccionó una nueva foto 
    if (nuevaFoto.files.length > 0) {
        const archivoFoto = nuevaFoto.files[0];
        const fotoRef = ref(storage, 'foto_perfil/' + user.uid);
        await uploadBytes(fotoRef, archivoFoto);
        const urlFoto = await getDownloadURL(fotoRef);
        updates.photoURL = urlFoto;
        nuevaFotoURL = urlFoto;
    }

    // Aplicar las actualizaciones al perfil del usuario
    await updateProfile(user, updates);

    // Actualizar la interfaz con los nuevos datos
    if (updates.displayName) {
        nombreUsuario.textContent = updates.displayName;
    }
    // Solo actualizar la foto si se ha proporcionado una nueva
    if (updates.photoURL) {
        document.getElementById("fotoPerfil").src = updates.photoURL;
    }

    // Actualizar las publicaciones anteriores con el nuevo nombre y foto
    await actualizarPublicacionesUsuario(nuevoNombreValue, nuevaFotoURL);

    // Limpiar los campos del formulario
    nuevoNombre.value = "";
    nuevaFoto.value = "";

    // Cerrar modal
    let actualizarModal = bootstrap.Modal.getInstance(document.getElementById('actualizarModal'));
    actualizarModal.hide();
});

// Función para actualizar las publicaciones anteriores del usuario
async function actualizarPublicacionesUsuario(nuevoNombre, nuevaFotoURL) {
    try {
        // Consulta para obtener solo las publicaciones del usuario actual
        const publicacionesQuery = query(collection(db, "publicaciones"), where("userId", "==", idUsuario));
        const publicacionesSnapshot = await getDocs(publicacionesQuery);

        publicacionesSnapshot.forEach(async (documento) => {
            let actualizaciones = {};
            if (nuevoNombre) {
                actualizaciones.userName = nuevoNombre;
            }
            if (nuevaFotoURL) {
                actualizaciones.photoURL = nuevaFotoURL;
            }

            // Actualizar la publicación en la base de datos
            if (Object.keys(actualizaciones).length > 0) {
                await updateDoc(doc(db, "publicaciones", documento.id), actualizaciones);
            }
        });
        console.log("Publicaciones actualizadas correctamente.");
        cargarPublicaciones(); // Recargar las publicaciones para reflejar los cambios
    } catch (error) {
        console.error("Error al actualizar publicaciones del usuario:", error);
    }
}

//Botón de cierre de sesión
document.getElementById("logoutButton").addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            //Cerrar sesión
            window.location.href = "login.html";
        })
        .catch((error) => {
            console.log("Error al cerrar sesión: ", error); //Manejar errores en el cierre de sesión 
        })
})

// Función para dar "Me gusta" y actualizar el contador en Firestore
window.darMeGusta = async function (postId) {
    try {
        // Referencia al documento de la publicación
        const postRef = doc(db, "publicaciones", postId);

        // Obtener la publicación actual para leer los "Me gusta" actuales y los IDs de los usuarios que dieron "me gusta"
        const postSnapshot = await getDoc(postRef);
        const postData = postSnapshot.data();
        const currentLikes = postData.likes || 0;
        const likedByUsers = postData.likedBy || []; // Lista de usuarios que dieron "me gusta"

        // Verificar si el usuario ya ha dado "me gusta"
        if (likedByUsers.includes(idUsuario)) {
            // Si ya dio "me gusta", eliminar su "me gusta"
            await updateDoc(postRef, {
                likes: currentLikes - 1,
                likedBy: arrayRemove(idUsuario) // Remover el ID del usuario del array "likedBy"
            });

            // Actualizar el contador de "me gusta" en la interfaz
            document.getElementById(`likeCount-${postId}`).textContent = currentLikes - 1;
            // document.getElementById("kokoro").classList.remove('fa-solid');
            // document.getElementById("kokoro").classList.add('fa-regular'); 

        } else {
            // Si no ha dado "me gusta", añadir el "me gusta"
            await updateDoc(postRef, {
                likes: currentLikes + 1,
                likedBy: arrayUnion(idUsuario) // Agregar el ID del usuario al array "likedBy"
            });

            // Actualizar el contador de "me gusta" en la interfaz
            document.getElementById(`likeCount-${postId}`).textContent = currentLikes + 1;
            // document.getElementById("kokoro").classList.remove('fa-regular');
            // document.getElementById("kokoro").classList.add('fa-solid');

        }
    } catch (error) {
        console.error("Error al actualizar 'Me gusta':", error);
    }
};

//Función para cargar comentarios de una publicación
async function cargarComentarios(publicacionId) {
    const comentariosDiv = document.getElementById(`comentarios-${publicacionId}`);
    comentariosDiv.innerHTML = ""; //Limpiar comentarios previos

    const comentariosQuery = query(collection(db, "publicaciones", publicacionId, "comentarios"), orderBy("timestamp", "asc"));
    const comentariosSnapshot = await getDocs(comentariosQuery);

    comentariosSnapshot.forEach((doc) => {
        const comentario = doc.data();
        const comentarioDiv = document.createElement("div");
        comentarioDiv.classList.add("comentario");
        comentarioDiv.innerHTML = `<strong>${comentario.userName}:</strong> ${comentario.texto}`;
        comentariosDiv.appendChild(comentarioDiv);
    })
}

// Función para agregar un comentario a una publicación
async function agregarComentario(publicacionId) {
    const comentarioInput = document.getElementById(`comentario-${publicacionId}`);
    const textoComentario = comentarioInput.value.trim();

    if (textoComentario !== "") {
        try {
            await addDoc(collection(db, "publicaciones", publicacionId, "comentarios"), {
                texto: textoComentario,
                userId: idUsuario,
                userName: auth.currentUser.displayName,
                timestamp: new Date()
            });

            comentarioInput.value = ""; // Limpiar el campo de comentario
            cargarComentarios(publicacionId); // Recargar los comentarios
        } catch (error) {
            console.log("Error al agregar comentario: ", error);
        }
    }
}

window.agregarComentario = agregarComentario;