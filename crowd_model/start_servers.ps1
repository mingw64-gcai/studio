# Crowd Analysis Flask + Nginx Startup Script (Windows PowerShell)

Write-Host "🚀 Starting YOLOv4 Crowd Analysis Servers..." -ForegroundColor Green

# Function to cleanup on exit
function Cleanup {
    Write-Host "🛑 Stopping servers..." -ForegroundColor Yellow
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*app.py*"} | Stop-Process -Force
    Stop-Process -Name "nginx" -ErrorAction SilentlyContinue -Force
    Write-Host "✅ Servers stopped" -ForegroundColor Green
}

# Register cleanup on Ctrl+C
Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

try {
    # Check Python dependencies
    Write-Host "📦 Checking Python dependencies..." -ForegroundColor Cyan
    try {
        python -c "import flask" 2>$null
    } catch {
        Write-Host "⚠️  Installing Flask dependencies..." -ForegroundColor Yellow
        pip install -r requirements_flask.txt
    }

    # Create necessary directories
    Write-Host "📁 Creating directories..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path "uploads", "results", "logs" | Out-Null

    # Update Nginx configuration
    Write-Host "📝 Updating Nginx configuration..." -ForegroundColor Cyan
    $currentDir = (Get-Location).Path
    (Get-Content "nginx.conf") -replace "/path/to/your/project", $currentDir.Replace('\', '/') | Set-Content "nginx_local.conf"

    # Start Flask server
    Write-Host "🐍 Starting Flask server on port 5000..." -ForegroundColor Cyan
    $flaskProcess = Start-Process python -ArgumentList "app.py" -PassThru -WindowStyle Hidden

    # Wait for Flask to start
    Start-Sleep -Seconds 3

    # Check if Flask started
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 5 -UseBasicParsing
        Write-Host "✅ Flask server started successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Flask server failed to start" -ForegroundColor Red
        $flaskProcess | Stop-Process -Force
        exit 1
    }

    # Check for Nginx
    $nginxExists = Get-Command nginx -ErrorAction SilentlyContinue
    if ($nginxExists) {
        Write-Host "🌐 Starting Nginx reverse proxy..." -ForegroundColor Cyan
        try {
            # Test Nginx configuration
            nginx -t -c "$currentDir\nginx_local.conf"
            nginx -c "$currentDir\nginx_local.conf"
            
            Write-Host "✅ Nginx started successfully" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎯 Crowd Analysis API is now running!" -ForegroundColor Green
            Write-Host "   🌐 Main URL: http://localhost" -ForegroundColor White
            Write-Host "   🐍 Flask Direct: http://localhost:5000" -ForegroundColor White
            Write-Host "   📊 Health Check: http://localhost/health" -ForegroundColor White
            Write-Host "   📚 Endpoints:" -ForegroundColor White
            Write-Host "      POST http://localhost/analyze - Upload video" -ForegroundColor Gray
            Write-Host "      GET  http://localhost/status/<job_id> - Check status" -ForegroundColor Gray
            Write-Host "      GET  http://localhost/files/<job_id> - List files" -ForegroundColor Gray
            Write-Host "      GET  http://localhost/download/<job_id>/<file_type> - Download" -ForegroundColor Gray
        } catch {
            Write-Host "❌ Nginx configuration failed. Running Flask-only mode" -ForegroundColor Yellow
            Write-Host "🎯 API available at: http://localhost:5000" -ForegroundColor White
        }
    } else {
        Write-Host "⚠️  Nginx not found. Running Flask-only mode" -ForegroundColor Yellow
        Write-Host "💡 Install Nginx for Windows from: https://nginx.org/en/download.html" -ForegroundColor Cyan
        Write-Host "🎯 API available at: http://localhost:5000" -ForegroundColor White
    }

    Write-Host ""
    Write-Host "🔄 Servers running... Press Ctrl+C to stop" -ForegroundColor Green

    # Keep script running
    while ($true) {
        Start-Sleep -Seconds 1
        if ($flaskProcess.HasExited) {
            Write-Host "❌ Flask server stopped unexpectedly" -ForegroundColor Red
            break
        }
    }

} catch {
    Write-Host "❌ Error starting servers: $_" -ForegroundColor Red
} finally {
    Cleanup
} 