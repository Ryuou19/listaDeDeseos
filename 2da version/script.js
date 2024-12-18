// Lista predefinida de usuarios
/*const usuarios = [
    { rut: "21124889-0", nombre: "Bruno", regalos: ["Audifonos"] },
    { rut: "10051928-3", nombre: "María", regalos: ["Audifonos"] },
    { rut: "9664766-2", nombre: "Rafael", regalos: ["Audifonos"] },
    { rut: "15776960-k", nombre: "Angelo", regalos: ["Audifonos"] },
    { rut: "16067690-6", nombre: "Mariela", regalos: ["Audifonos"] },
    { rut: "24438219-3", nombre: "Josefa", regalos: ["Audifonos"] },
    { rut: "24438159-6", nombre: "Isabella", regalos: ["Audifonos"] },
    { rut: "18663255-9", nombre: "Ornella", regalos: ["Audifonos"] },
    { rut: "21661569-7", nombre: "Florencia", regalos: ["Audifonos"] },
];*/



if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error("Error al registrar el Service Worker:", error);
    });
}

// Interceptar señales de recarga automática (como livereload)
window.addEventListener("beforeunload", (event) => {
    event.preventDefault();
    event.returnValue = ""; // Detiene la recarga del navegador
});

let usuarioActual = null;

// Asignar evento al botón de agregar regalo
document.getElementById("btn-agregar-regalo").addEventListener("click", (event) => {
    event.preventDefault(); // Evita el comportamiento por defecto
    agregarRegalo(); // Llamar a la función para agregar el regalo
});




// Función para manejar el inicio de sesión
function iniciarSesion() {
    const rutIngresado = document.getElementById("rut").value.trim();
    const errorMensaje = document.getElementById("error");
//holaaa
    // Obtener usuarios desde el servidor o archivo JSON
    fetch("https://listadedeseos.onrender.com/usuarios")
        .then(response => response.json())
        .then(usuarios => {
            // Buscar el usuario por el RUT ingresado
            const user = usuarios.find(u => u.rut === rutIngresado);

            if (user) {
                // Establecer el usuario actual
                usuarioActual = user;
//hol
                // Ocultar el contenedor de inicio de sesión y mostrar la bienvenida
                document.getElementById("login-container").classList.add("hidden");
                document.getElementById("welcome-container").classList.remove("hidden");
                document.querySelector(".logout-btn").classList.remove("hidden");

                // Mostrar el nombre del usuario en el encabezado
                document.getElementById("nombre-usuario-header").textContent = user.nombre;
                document.querySelector(".usuario-header").classList.remove("hidden");

                // Agregar efecto de blur al body
                document.body.classList.add("blur-background");
            } else {
                errorMensaje.textContent = "RUT no encontrado. Intente nuevamente.";
            }
        })
        .catch(error => {
            console.error("Error al cargar los usuarios:", error);
            errorMensaje.textContent = "Error al conectar con el servidor. Intente nuevamente.";
        });
}


// Mostrar el apartado de edición de regalos
function mostrarEditarLista() {
    const listaRegalos = document.getElementById("lista-regalos");
    listaRegalos.innerHTML = ""; // Limpiar el contenedor antes de mostrar los datos

    // Verificar que el usuario actual está identificado
    if (usuarioActual && usuarioActual.rut) {
        // Obtener los datos desde JSON Server
        fetch(`https://listadedeseos.onrender.com/usuarios?rut=${usuarioActual.rut}`)
            .then(response => response.json())
            .then(usuarios => {
                if (usuarios.length > 0) {
                    const usuario = usuarios[0]; // Obtener el usuario correspondiente
                    const regalos = usuario.regalos || []; // Si no hay regalos, devolver array vacío

                    // Generar los elementos de la lista
                    regalos.forEach((regalo, index) => {
                        const li = document.createElement("li");
                        li.textContent = `${regalo} `;

                        // Crear botón de eliminar
                        const btnEliminar = document.createElement("button");
                        btnEliminar.textContent = "Eliminar";
                        btnEliminar.classList.add("delete-btn");
                        btnEliminar.onclick = () => eliminarRegalo(index);

                        li.appendChild(btnEliminar); // Agregar botón a la lista
                        listaRegalos.appendChild(li); // Agregar elemento li a la lista
                    });

                    console.log("Lista de regalos cargada correctamente.");
                } else {
                    console.error("Usuario no encontrado en los datos.");
                }
            })
            .catch(error => {
                console.error("Error al obtener los datos del usuario: ", error);
            });
    } else {
        console.error("No hay un usuario identificado actualmente.");
    }

    // Cambiar la vista para mostrar el contenedor
    cambiarVista("editar-lista-container");
}



function agregarRegalo(event) {
    // Prevenir que el formulario recargue la página
    if (event) event.preventDefault();

    const nuevoRegalo = document.getElementById("nuevo-regalo").value.trim();

    if (nuevoRegalo && usuarioActual) {
        // Buscar al usuario por RUT para obtener su ID
        fetch(`https://listadedeseos.onrender.com/usuarios?rut=${usuarioActual.rut}`)
            .then(response => response.json())
            .then(usuarios => {
                if (usuarios.length > 0) {
                    const usuario = usuarios[0]; // Usuario encontrado por RUT
                    const usuarioId = usuario.id; // Obtener el ID del usuario

                    // Agregar el nuevo regalo a la lista
                    usuario.regalos.push(nuevoRegalo);

                    // Actualizar los datos en JSON Server
                    fetch(`https://listadedeseos.onrender.com/usuarios/${usuarioId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(usuario)
                    })
                    .then(() => {
                        console.log("Regalo agregado exitosamente.");
                        document.getElementById("nuevo-regalo").value = ""; // 
                        mostrarEditarLista(); // Refrescar la lista de regalos
                    })
                    .catch(error => {
                        console.error("Error al actualizar los datos del usuario:", error);
                    });
                } else {
                    console.error("Usuario no encontrado.");
                }
            })
            .catch(error => {
                console.error("Error al buscar el usuario por RUT:", error);
            });
    } else {
        alert("No se puede agregar un regalo. Usuario no identificado o el campo está vacío.");
    }
}





function eliminarRegalo(index) {
    if (usuarioActual && usuarioActual.rut) {
        // Buscar al usuario en JSON Server utilizando el rut
        fetch(`https://listadedeseos.onrender.com/usuarios?rut=${usuarioActual.rut}`)
            .then(response => response.json())
            .then(usuarios => {
                if (usuarios.length > 0) {
                    const usuario = usuarios[0]; // Obtener el primer usuario que coincida
                    const regalos = usuario.regalos || [];

                    if (index >= 0 && index < regalos.length) {
                        // Eliminar el regalo del array usando splice
                        regalos.splice(index, 1);

                        // Actualizar los datos del usuario utilizando el id del usuario
                        fetch(`https://listadedeseos.onrender.com/usuarios/${usuario.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...usuario, regalos }) // Actualizar el campo "regalos"
                        })
                            .then(() => {
                                console.log("Regalo eliminado exitosamente.");
                                mostrarEditarLista(); // Refrescar la lista de regalos
                            })
                            .catch(error => {
                                console.error("Error al actualizar el usuario:", error);
                            });
                    } else {
                        console.error("Índice fuera de rango.");
                    }
                } else {
                    console.error("Usuario no encontrado.");
                }
            })
            .catch(error => {
                console.error("Error al obtener los datos del usuario:", error);
            });
    } else {
        console.error("No hay un usuario identificado.");
    }
}


  

function mostrarVerOtros() {
    const contenedorUsuarios = document.getElementById("ver-listas");
    
    contenedorUsuarios.innerHTML = ""; // Limpiar el contenedor
   

    // Obtener usuarios desde JSON Server
    fetch("https://listadedeseos.onrender.com/usuarios")
        .then(response => response.json())
        .then(datosUsuarios => {
            if (datosUsuarios.length > 0) {
                datosUsuarios.forEach(usuario => {
                    const card = document.createElement("div");
                    card.className = "usuario-card";
                    card.onclick = () => mostrarRegalos(usuario.nombre);

                    card.innerHTML = `
                        <h3>${usuario.nombre}</h3>
                    `;
                    contenedorUsuarios.appendChild(card);
                });
            } else {
                contenedorUsuarios.innerHTML = "<p>No hay usuarios disponibles</p>";
            }
        })
        .catch(error => {
            console.error("Error al obtener los usuarios:", error);
            contenedorUsuarios.innerHTML = "<p>Error al cargar los usuarios</p>";
        });

    cambiarVista("ver-listas");
    

}









// Volver al menú principal
function volverAlMenu() {
    
    cambiarVista("welcome-container");
    document.getElementById("usuario-header").classList.remove("hidden");
    
}

function cerrarSesion() {
    usuarioActual = null;
    document.getElementById("rut").value = "";
    document.getElementById("error").textContent = "";
    document.querySelector(".logout-btn").classList.add("hidden"); // Ocultar botón cerrar sesión
    document.getElementById("usuario-header").classList.add("hidden");
    document.body.classList.remove("blur-background");
    cambiarVista("login-container");
}

// Cambiar entre vistas
function cambiarVista(vistaId) {
    document.querySelectorAll(".container, .card-container, .usuario-header", ".usuario-card").forEach(c => c.classList.add("hidden"));
    document.getElementById(vistaId).classList.remove("hidden");
}

function mostrarRegalos(nombre) {
    // Realizar una solicitud a JSON Server para obtener todos los usuarios
    fetch("https://listadedeseos.onrender.com/usuarios")
        .then(response => response.json()) // Convertir la respuesta en formato JSON
        .then(usuarios => {
            // Buscar el usuario por nombre en la lista de usuarios obtenida
            const usuario = usuarios.find(u => u.nombre === nombre);

            if (usuario) {
                // Actualizar el título de la modal con el nombre del usuario
                document.getElementById('modal-title').innerText = `Regalos de ${usuario.nombre}`;

                // Limpiar y agregar la lista de regalos
                const listaRegalos = document.getElementById('modal-list');
                listaRegalos.innerHTML = ""; // Limpiar lista anterior

                // Recorrer la lista de regalos y agregarlos al modal
                usuario.regalos.forEach(regalo => {
                    const li = document.createElement('li');
                    li.textContent = regalo; // Agregar el regalo
                    listaRegalos.appendChild(li);
                });

                // Mostrar la ventana modal y el fondo oscuro
                document.getElementById('modal').style.display = 'block';
                document.getElementById('modal-overlay').style.display = 'block';
            } else {
                console.error("Usuario no encontrado en los datos.");
                alert("No se encontraron regalos para este usuario.");
            }
        })
        .catch(error => {
            console.error("Error al obtener los datos del servidor JSON:", error);
            alert("Error al cargar los regalos.");
        });
}


function cerrarModal() {
    // Ocultar modal y fondo oscuro
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
}

//----------------BASE DE DATOS-----------------------


