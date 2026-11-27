USE paises_7A;

-- ==========================================
-- 12. CRUD DE PAISES
-- ==========================================

-- READ: Listar todos los paises
SELECT pais_id, pais_descripcion
FROM paises
ORDER BY pais_id;

-- CREATE: Insertar un pais nuevo
INSERT INTO paises (pais_descripcion)
VALUES ('Pais de Prueba');

-- Verificar alta
SELECT pais_id, pais_descripcion
FROM paises
WHERE pais_descripcion = 'Pais de Prueba';

-- UPDATE: Modificar la descripcion de un pais
UPDATE paises
SET pais_descripcion = 'Pais Modificado'
WHERE pais_descripcion = 'Pais de Prueba';

-- Verificar modificacion
SELECT pais_id, pais_descripcion
FROM paises
WHERE pais_descripcion = 'Pais Modificado';

-- DELETE: Eliminar el registro de prueba
DELETE FROM paises
WHERE pais_descripcion = 'Pais Modificado';

-- Verificar listado final
SELECT pais_id, pais_descripcion
FROM paises
ORDER BY pais_id;

-- ==========================================
-- 14. MASTER-DETAIL CON PROVINCIAS
-- ==========================================

-- MASTER: Pais seleccionado (Argentina -> pais_id = 1)
SELECT pais_id, pais_descripcion
FROM paises
WHERE pais_id = 1;

-- DETAIL: Provincias del pais seleccionado
SELECT pro_id, pais_id, pro_descripcion
FROM provincias
WHERE pais_id = 1
ORDER BY pro_descripcion;