document.querySelector('.btn-ingresar').addEventListener('click', function(event){
event.preventDefault();
 
const email = document.getElementById('email').value.trim();
const password = document.getElementById('password').value.trim();
 
 
if(email === "" || password ===""){
 
    Swal.fire({
        icon:"warning",
        title: "Campos Vacios",
        text: "Por favor complete los campos",
        confirmButtonColor:'#800e13'
    }) ;
    return;
 
}
if (email === 'admin@system.com' && password == '12345') {
    Swal.fire({
        icon: 'success',
        title: 'Inicio Exitoso',
        text: 'Bienvenido Administrador',
        confirmButtonColor: '#800e13'
    }).then(() =>{
        window.location.href='../Administrador/administrador.html';

    })}
    else if(email === 'entrenador@system.com' && password == '123456'){
        Swal.fire({
        icon: 'success',
        title: 'Inicio Exitoso',
        text: 'Bienvenido entrenador',
        confirmButtonColor: '#800e13'
    }).then(() =>{
        window.location.href='../Entrenador/entrenador.html';

    })}
    else if(email === 'cliente@system.com' && password == '1234567'){
        Swal.fire({
        icon: 'success',
        title: 'Inicio Exitoso',
        text: 'Bienvenido entrenador',
        confirmButtonColor: '#800e13'
    }).then(() =>{
        window.location.href='../Cliente/cliente.html';
    
    })}
    else{
    Swal.fire({
        icon:"error",
        title: "Credenciales Incorrectas",
        text: "Correo o Contraseña Incorrecta",
        confirmButtonColor: '#800e13'
    })
}
 

})