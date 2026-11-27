<?php
header("Content-Type: application/json; charset=utf-8");

$host = "127.0.0.1";
$db   = "paises_7A";
$user = "root";
$pass = "franco1234"; // Poné acá la contraseña de root de tu MySQL

$mysqli = new mysqli($host, $user, $pass, $db);
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexion a MySQL: " . $mysqli->connect_error]);
    exit;
}
$mysqli->set_charset("utf8mb4");

$action = $_GET["action"] ?? "";

if ($action === "listar_paises") {
    $res = $mysqli->query("SELECT pais_id, pais_descripcion FROM paises ORDER BY pais_id");
    $rows = [];
    while ($r = $res->fetch_assoc()) {
        $rows[] = $r;
    }
    echo json_encode($rows);
    exit;
}

if ($action === "crear_pais") {
    $data = json_decode(file_get_contents("php://input"), true);
    $nombre = trim($data["pais_descripcion"] ?? "");
    if ($nombre === "") {
        http_response_code(400);
        echo json_encode(["error" => "El nombre del pais es obligatorio"]);
        exit;
    }
    $stmt = $mysqli->prepare("INSERT INTO paises (pais_descripcion) VALUES (?)");
    $stmt->bind_param("s", $nombre);
    $stmt->execute();
    echo json_encode(["ok" => true, "id" => $mysqli->insert_id]);
    exit;
}

if ($action === "actualizar_pais") {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data["pais_id"] ?? 0);
    $nombre = trim($data["pais_descripcion"] ?? "");
    if ($id <= 0 || $nombre === "") {
        http_response_code(400);
        echo json_encode(["error" => "ID y nombre son obligatorios"]);
        exit;
    }
    $stmt = $mysqli->prepare("UPDATE paises SET pais_descripcion = ? WHERE pais_id = ?");
    $stmt->bind_param("si", $nombre, $id);
    $stmt->execute();
    echo json_encode(["ok" => true]);
    exit;
}

if ($action === "eliminar_pais") {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data["pais_id"] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "ID invalido"]);
        exit;
    }
    $stmt = $mysqli->prepare("DELETE FROM paises WHERE pais_id = ?");
    $stmt->bind_param("i", $id);
    if (!$stmt->execute()) {
        http_response_code(409);
        echo json_encode(["error" => "No se puede eliminar: el pais puede tener provincias asociadas"]);
        exit;
    }
    echo json_encode(["ok" => true]);
    exit;
}

if ($action === "provincias_por_pais") {
    $paisId = intval($_GET["pais_id"] ?? 0);
    $stmt = $mysqli->prepare("SELECT pro_id, pais_id, pro_descripcion FROM provincias WHERE pais_id = ? ORDER BY pro_descripcion");
    $stmt->bind_param("i", $paisId);
    $stmt->execute();
    $res = $stmt->get_result();
    $rows = [];
    while ($r = $res->fetch_assoc()) {
        $rows[] = $r;
    }
    echo json_encode($rows);
    exit;
}

if ($action === "crear_provincia") {
    $data = json_decode(file_get_contents("php://input"), true);
    $paisId = intval($data["pais_id"] ?? 0);
    $nombre = trim($data["pro_descripcion"] ?? "");
    if ($paisId <= 0 || $nombre === "") {
        http_response_code(400);
        echo json_encode(["error" => "El pais y el nombre de la provincia son obligatorios"]);
        exit;
    }
    $stmt = $mysqli->prepare("INSERT INTO provincias (pais_id, pro_descripcion) VALUES (?, ?)");
    $stmt->bind_param("is", $paisId, $nombre);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["error" => "Error al guardar la provincia: " . $stmt->error]);
        exit;
    }
    echo json_encode(["ok" => true, "id" => $mysqli->insert_id]);
    exit;
}

http_response_code(400);
echo json_encode(["error" => "Accion no valida"]);