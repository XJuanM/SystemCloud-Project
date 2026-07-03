
const formulario = document.getElementById("formUsuario");
const tablaUsuarios = document.getElementById("tablaUsuarios");
const buscarUsuario = document.getElementById("buscarUsuario");

const nombre = document.getElementById("nombre");
const apellido = document.getElementById("apellido");
const correo = document.getElementById("correo");
const telefono = document.getElementById("telefono");
const rol = document.getElementById("rol");
const estado = document.getElementById("estado");
const password = document.getElementById("password");

const btnGuardar = document.getElementById("btnGuardar");

let usuarios = [];
let editando = false;
let idEditar = null;

document.addEventListener("DOMContentLoaded", () => {

    cargarUsuarios();

    mostrarUsuarios(usuarios);

});

function cargarUsuarios() {

    const datos = localStorage.getItem("usuarios");

    if (datos) {

        usuarios = JSON.parse(datos);

    } else {

        usuarios = [

            {
                id: 1,
                nombre: "Julian",
                apellido: "Pinto",
                correo: "julian@gmail.com",
                telefono: "3001234567",
                rol: "Cliente",
                estado: "Activo",
                password: "123456"
            },

            {
                id: 2,
                nombre: "Dilan",
                apellido: "Bohorquez",
                correo: "dilan@gmail.com",
                telefono: "3115558899",
                rol: "Cliente",

                rol: "Entrenador",
                estado: "Activo",
                password: "123456"
            },

            {
                id: 3,
                nombre: "Juan",
                apellido: "Martínez",
                correo: "juan@gmail.com",
                telefono: "3207774455",
                rol: "Cliente",
                rol: "Administrador",
                estado: "Inactivo",
                password: "123456"
            }

        ];

        guardarUsuarios();

    }

}

function guardarUsuarios() {

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

}

function mostrarUsuarios(lista) {

    tablaUsuarios.innerHTML = "";

    lista.forEach(usuario => {

        const colorEstado =
            usuario.estado === "Activo"
                ? "success"
                : "danger";

        tablaUsuarios.innerHTML += `

            <tr>

                <td>${usuario.id}</td>

                <td>${usuario.nombre} ${usuario.apellido}</td>

                <td>${usuario.correo}</td>

                <td>${usuario.telefono}</td>

                <td>${usuario.rol}</td>

                <td>

                    <span class="badge bg-${colorEstado}">
                        ${usuario.estado}
                    </span>

                </td>

                <td>

                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editarUsuario(${usuario.id})">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="eliminarUsuario(${usuario.id})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });

}

formulario.addEventListener("submit", function (e) {

    e.preventDefault();

    if (
        nombre.value.trim() === "" ||
        apellido.value.trim() === "" ||
        correo.value.trim() === "" ||
        telefono.value.trim() === "" ||
        password.value.trim() === ""
    ) {

        alert("Complete todos los campos.");
        return;

    }

    if (editando) {

        actualizarUsuario();

    } else {

        agregarUsuario();

    }

});

function agregarUsuario() {

    const nuevoUsuario = {

        id: usuarios.length > 0
            ? usuarios[usuarios.length - 1].id + 1
            : 1,

        nombre: nombre.value.trim(),
        apellido: apellido.value.trim(),
        correo: correo.value.trim(),
        telefono: telefono.value.trim(),
        rol: rol.value,
        estado: estado.value,
        password: password.value

    };

    usuarios.push(nuevoUsuario);

    guardarUsuarios();

    mostrarUsuarios(usuarios);

    limpiarFormulario();

    bootstrap.Modal.getInstance(
        document.getElementById("modalUsuario")
    ).hide();

    alert("Usuario registrado correctamente.");

}

function editarUsuario(id) {

    const usuario = usuarios.find(u => u.id === id);

    if (!usuario) return;

    editando = true;
    idEditar = id;

    nombre.value = usuario.nombre;
    apellido.value = usuario.apellido;
    correo.value = usuario.correo;
    telefono.value = usuario.telefono;
    rol.value = usuario.rol;
    estado.value = usuario.estado;
    password.value = usuario.password;

    btnGuardar.textContent = "Actualizar Usuario";

    const modal = new bootstrap.Modal(
        document.getElementById("modalUsuario")
    );

    modal.show();

}

function actualizarUsuario() {

    const indice = usuarios.findIndex(
        usuario => usuario.id === idEditar
    );

    if (indice === -1) return;

    usuarios[indice].nombre = nombre.value.trim();
    usuarios[indice].apellido = apellido.value.trim();
    usuarios[indice].correo = correo.value.trim();
    usuarios[indice].telefono = telefono.value.trim();
    usuarios[indice].rol = rol.value;
    usuarios[indice].estado = estado.value;
    usuarios[indice].password = password.value;

    guardarUsuarios();

    mostrarUsuarios(usuarios);

    limpiarFormulario();

    editando = false;
    idEditar = null;

    btnGuardar.textContent = "Guardar Usuario";

    bootstrap.Modal.getInstance(
        document.getElementById("modalUsuario")
    ).hide();

    alert("Usuario actualizado correctamente.");

}

function eliminarUsuario(id) {

    const confirmar = confirm(
        "¿Desea eliminar este usuario?"
    );

    if (!confirmar) return;

    usuarios = usuarios.filter(
        usuario => usuario.id !== id
    );

    guardarUsuarios();

    mostrarUsuarios(usuarios);

    alert("Usuario eliminado correctamente.");

}

function limpiarFormulario() {

    formulario.reset();

    editando = false;

    idEditar = null;

    btnGuardar.textContent = "Guardar Usuario";

}