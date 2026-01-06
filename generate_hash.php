<?php

// WARNING: This script is for development/debugging purposes only.
// It exposes password hashing functionality to the web.
// DELETE THIS FILE from your production server.

$passwordToHash = '';
$hashedPassword = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['password'])) {
    $passwordToHash = $_POST['password'];
    $hashedPassword = password_hash($passwordToHash, PASSWORD_DEFAULT);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Hash Generator</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 2em; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; }
        input[type="text"] { padding: 0.5em; width: 100%; box-sizing: border-box; margin-bottom: 1em; }
        button { padding: 0.7em 1.5em; border: none; background-color: #007bff; color: white; cursor: pointer; border-radius: 5px; }
        .result { margin-top: 1.5em; padding: 1em; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; word-wrap: break-word; }
        .warning { color: #dc3545; font-weight: bold; border: 1px solid #dc3545; padding: 1em; border-radius: 5px; background-color: #f8d7da; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Password Hash Generator</h1>
        <p class="warning">
            <strong>Security Warning:</strong> This tool is for development and debugging only.
            Please delete this file from your server before going into production.
        </p>
        
        <form method="POST" action="">
            <label for="password"><strong>Enter Password to Hash:</strong></label><br>
            <input type="text" id="password" name="password" required autofocus>
            <button type="submit">Generate Hash</button>
        </form>
        
        <?php if ($hashedPassword): ?>
        <div class="result">
            <p><strong>Original Password:</strong> <?php echo htmlspecialchars($passwordToHash); ?></p>
            <p><strong>Generated Hash:</strong><br><?php echo htmlspecialchars($hashedPassword); ?></p>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>
