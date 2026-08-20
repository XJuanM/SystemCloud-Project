create database Prime;

USE Prime;

CREATE TABLE roles (
	tipo_rol VARCHAR(30) NOT NULL primary key
);

CREATE TABLE Usuarios (
	id_usuario INT NOT NULL auto_increment PRIMARY KEY,
    tipo_rol VARCHAR(30) NOT NULL,
    FOREIGN KEY (tipo_rol) REFERENCES roles(tipo_rol),
    nombre_apellido VARCHAR (50),
    telefono INT,
    direccion VARCHAR(50),
    correo VARCHAR(60)
);

CREATE TABLE Membresias(
	cod_membresia INT NOT NULL PRIMARY KEY auto_increment,
    id_usuario INT NOT NULL,
	FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    nombre_plan VARCHAR(50),
    duracion INT,
    precio DECIMAL(10,2),
    estado VARCHAR(30),
    beneficios VARCHAR(80)
);


CREATE TABLE Rutinas (
	cod_rutina INT NOT NULL PRIMARY KEY auto_increment,
    id_usuario INT,
	FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    nombre VARCHAR (30),
    objetivo VARCHAR (30)
);

CREATE TABLE ejercicios (
	id_ejercicio INT NOT NULL PRIMARY KEY auto_increment,
    nombre VARCHAR (50),
    musculo_enfoque VARCHAR(50)
);

CREATE TABLE detalle_rutina (
	cod_detalleR INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    cod_rutina INT,
    id_ejercicio INT,
    FOREIGN KEY (cod_rutina) REFERENCES Rutinas(cod_rutina),
    FOREIGN KEY (id_ejercicio) REFERENCES Ejercicios(id_ejercicio),
    repeticiones INT,
    series INT,
    descanso INT,
    peso INT
);

CREATE TABLE Alimentos (
	id_alimento INT NOT NULL PRIMARY KEY auto_increment,
    nombre VARCHAR(50),
    proteinas INT,
    calorias INT
);

CREATE TABLE Dietas(
	cod_dieta INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    nombre VARCHAR (50),
    objetivo VARCHAR (50)
);

CREATE TABLE detalle_dieta (
	cod_detalleD INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    cod_dieta INT,
    id_alimento INT,
    FOREIGN KEY (cod_dieta) REFERENCES Dietas(cod_dieta),
    FOREIGN KEY (id_alimento) REFERENCES Alimentos(id_alimento),
    cantidad INT,
    caloriasTotales INT,
    proteinasTotales INT
);

CREATE TABLE Clases (
	cod_clase INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50),
    salon VARCHAR (50),
    estado VARCHAR (50),
    entrenador_encargado VARCHAR(50)
);

CREATE TABLE detalle_clase (
	cod_detalleC INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    cod_clase INT,
    id_usuario INT,
	FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
	FOREIGN KEY (cod_clase) REFERENCES Clases(cod_clase),
    descripcion VARCHAR (90),
    fecha DATE,
    hora_inicio INT,
    hora_fin INT,
    cupo_maximo INT
);


CREATE TABLE Comprobante (
	cod_comprobante INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
	FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    valorTotal DECIMAL,
    fecha DATE
);

CREATE TABLE detalle_comprobante (
	cod_detalleDC INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    cod_comprobante INT,
    cod_membresia INT,
	FOREIGN KEY (cod_membresia) REFERENCES Membresias(cod_membresia),
	FOREIGN KEY (cod_comprobante) REFERENCES Comprobante(cod_comprobante),
    nombreCliente VARCHAR(50),
    subtotal DECIMAL,
    metodoPago VARCHAR(50),
    fecha_finalizacion DATE
);

CREATE TABLE Maquinas (
	id_maquina INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR (50),
    descripcion VARCHAR (90),
    musculo_enfoque VARCHAR (50)
);


CREATE TABLE Inventario_Maquinas (
	cod_inventario INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_maquina INT,
	FOREIGN KEY (id_maquina) REFERENCES Maquinas(id_maquina),
	nombre VARCHAR (50),
	estado VARCHAR (50),
    cantidad INT,
    fecha_mantenimiento DATE
);







