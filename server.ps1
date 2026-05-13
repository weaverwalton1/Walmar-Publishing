param(
  [int]$Port = 8000,
  [string]$Root = (Split-Path -Parent $MyInvocation.MyCommand.Path)
)

$ErrorActionPreference = "Stop"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".txt"  = "text/plain; charset=utf-8"
}

$listener = [System.Net.HttpListener]::new()
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Host "Serving $Root on $prefix"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    $relative = [Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($relative)) { $relative = "index.html" }
    $full = Join-Path $Root $relative

    if (!(Test-Path -LiteralPath $full -PathType Leaf)) {
      $res.StatusCode = 404
      $res.ContentType = "text/plain; charset=utf-8"
      $bytes = [Text.Encoding]::UTF8.GetBytes("Not Found")
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      $res.Close()
      continue
    }

    $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
    $ct = $mime[$ext]
    if (-not $ct) { $ct = "application/octet-stream" }
    $res.ContentType = $ct

    $fs = [IO.File]::OpenRead($full)
    try {
      $res.ContentLength64 = $fs.Length
      $fs.CopyTo($res.OutputStream)
    } finally {
      $fs.Dispose()
      $res.OutputStream.Close()
      $res.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
