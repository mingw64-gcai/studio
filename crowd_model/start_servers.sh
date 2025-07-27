#!/bin/bash

# Crowd Analysis Flask + Nginx Startup Script

echo "🚀 Starting YOLOv4 Crowd Analysis Servers..."

# Function to kill processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
    pkill -f "python.*app.py" 2>/dev/null || true
    sudo nginx -s stop 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if Python dependencies are installed
echo "📦 Checking Python dependencies..."
if ! python -c "import flask" 2>/dev/null; then
    echo "⚠️  Installing Flask dependencies..."
    pip install -r requirements_flask.txt
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads results logs

# Update Nginx configuration with current path
CURRENT_DIR=$(pwd)
echo "📝 Updating Nginx configuration..."
sed "s|/path/to/your/project|$CURRENT_DIR|g" nginx.conf > nginx_local.conf

# Start Flask server
echo "🐍 Starting Flask server on port 5000..."
python app.py &
FLASK_PID=$!

# Wait a moment for Flask to start
sleep 3

# Check if Flask started successfully
if ! curl -s http://localhost:5000/health > /dev/null; then
    echo "❌ Flask server failed to start"
    kill $FLASK_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Flask server started successfully"

# Start Nginx (check if we have sudo access)
if command -v nginx >/dev/null 2>&1; then
    echo "🌐 Starting Nginx reverse proxy..."
    
    # Test Nginx configuration
    if sudo nginx -t -c "$CURRENT_DIR/nginx_local.conf"; then
        sudo nginx -c "$CURRENT_DIR/nginx_local.conf"
        echo "✅ Nginx started successfully"
        echo ""
        echo "🎯 Crowd Analysis API is now running!"
        echo "   🌐 Main URL: http://localhost"
        echo "   🐍 Flask Direct: http://localhost:5000"
        echo "   📊 Health Check: http://localhost/health"
        echo "   📚 Endpoints:"
        echo "      POST http://localhost/analyze - Upload video"
        echo "      GET  http://localhost/status/<job_id> - Check status"
        echo "      GET  http://localhost/files/<job_id> - List files"
        echo "      GET  http://localhost/download/<job_id>/<file_type> - Download"
        echo ""
        echo "Press Ctrl+C to stop servers"
    else
        echo "❌ Nginx configuration test failed"
        echo "📝 Running Flask-only mode on port 5000"
        echo "🎯 API available at: http://localhost:5000"
    fi
else
    echo "⚠️  Nginx not found. Running Flask-only mode"
    echo "💡 Install Nginx with: sudo apt-get install nginx (Linux) or brew install nginx (Mac)"
    echo "🎯 API available at: http://localhost:5000"
fi

# Keep script running
echo "🔄 Servers running... Press Ctrl+C to stop"
while true; do
    sleep 1
    # Check if Flask is still running
    if ! kill -0 $FLASK_PID 2>/dev/null; then
        echo "❌ Flask server stopped unexpectedly"
        cleanup
    fi
done 