# Simple Zero-Dependency Local Static HTTP Server for MORBUS
$port = 8080
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

try {
    $listener.Start()
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host " [MORBUS] Active Theory 3D Experience Server Running" -ForegroundColor Green
    Write-Host " URL: $prefix" -ForegroundColor Yellow
    Write-Host " Press Ctrl+C in this terminal to stop the server." -ForegroundColor Gray
    Write-Host "========================================================`n" -ForegroundColor Cyan

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $rawPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath).TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($rawPath)) {
                $rawPath = "index.html"
            }
            $safePath = $rawPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $filePath = Join-Path $root $safePath

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mime = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".htm"  { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".jpeg" { "image/jpeg" }
                    ".jpg"  { "image/jpeg" }
                    ".png"  { "image/png" }
                    ".svg"  { "image/svg+xml" }
                    ".ico"  { "image/x-icon" }
                    default { "application/octet-stream" }
                }

                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $mime
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawPath")
                $response.OutputStream.Write($msg, 0, $msg.Length)
            }
            $response.Close()
        } catch {
            Start-Sleep -Milliseconds 50
        }
    }
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
}
