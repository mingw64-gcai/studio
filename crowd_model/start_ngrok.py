#!/usr/bin/env python3
"""
Start Flask server and ngrok tunnel for Crowd Analysis API
"""
import subprocess
import time
import requests
import json
import threading
import os
import signal
import sys

def start_flask():
    """Start Flask server in background"""
    print("🐍 Starting Flask server...")
    return subprocess.Popen([sys.executable, "app.py"], 
                          stdout=subprocess.DEVNULL, 
                          stderr=subprocess.DEVNULL)

def start_ngrok():
    """Start ngrok tunnel"""
    print("🌐 Starting ngrok tunnel...")
    return subprocess.Popen(["ngrok", "http", "5000", "--log=stdout"], 
                          stdout=subprocess.DEVNULL, 
                          stderr=subprocess.DEVNULL)

def get_ngrok_url():
    """Get the public ngrok URL"""
    for attempt in range(10):
        try:
            time.sleep(2)
            response = requests.get("http://localhost:4040/api/tunnels")
            if response.status_code == 200:
                tunnels = response.json()["tunnels"]
                for tunnel in tunnels:
                    if tunnel["config"]["addr"] == "http://localhost:5000":
                        public_url = tunnel["public_url"]
                        if public_url.startswith("https://"):
                            return public_url
                        # Prefer HTTPS, but fallback to HTTP
                        return public_url
            print(f"⏳ Waiting for ngrok tunnel... (attempt {attempt + 1}/10)")
        except Exception as e:
            print(f"⏳ Waiting for ngrok... ({e})")
            
    return None

def test_endpoints(base_url):
    """Test API status"""
    print(f"\n🧪 Testing API at: {base_url}")
    
    # Test root endpoint only
    try:
        response = requests.get(f"{base_url}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ API Status: ONLINE")
            print(f"   Message: {data.get('message')}")
            print(f"   Version: {data.get('version')}")
            return True
        else:
            print(f"❌ API Status: OFFLINE ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ API Status: OFFLINE ({e})")
        return False

def cleanup_processes(flask_process, ngrok_process):
    """Clean up processes"""
    print("\n🛑 Cleaning up processes...")
    
    if flask_process:
        flask_process.terminate()
        try:
            flask_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            flask_process.kill()
    
    if ngrok_process:
        ngrok_process.terminate()
        try:
            ngrok_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            ngrok_process.kill()
    
    print("✅ Cleanup complete")

def main():
    """Main function"""
    flask_process = None
    ngrok_process = None
    
    def signal_handler(sig, frame):
        cleanup_processes(flask_process, ngrok_process)
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        print("🚀 Starting Crowd Analysis API with ngrok...")
        
        # Check if ngrok is installed
        try:
            subprocess.run(["ngrok", "--version"], 
                         stdout=subprocess.DEVNULL, 
                         stderr=subprocess.DEVNULL, 
                         check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ ngrok not found!")
            print("📥 Install ngrok:")
            print("   1. Download from: https://ngrok.com/download")
            print("   2. Extract and add to PATH")
            print("   3. Sign up and get auth token: ngrok authtoken YOUR_TOKEN")
            return
        
        # Start Flask server
        flask_process = start_flask()
        time.sleep(3)
        
        # Check if Flask started
        try:
            response = requests.get("http://localhost:5000/health", timeout=5)
            if response.status_code != 200:
                raise Exception("Flask health check failed")
            print("✅ Flask server started successfully")
        except Exception as e:
            print(f"❌ Flask server failed to start: {e}")
            cleanup_processes(flask_process, None)
            return
        
        # Start ngrok
        ngrok_process = start_ngrok()
        
        # Get public URL
        public_url = get_ngrok_url()
        if not public_url:
            print("❌ Failed to get ngrok public URL")
            cleanup_processes(flask_process, ngrok_process)
            return
        
        print(f"\n🎉 SUCCESS! Crowd Analysis API is publicly accessible!")
        print(f"📡 Public URL: {public_url}")
        print(f"🏠 Local URL: http://localhost:5000")
        print(f"🔗 ngrok Dashboard: http://localhost:4040")
        
        # Test endpoints
        if test_endpoints(public_url):
            print(f"\n📊 YOLOv4 Crowd Analysis API - Endpoint Usage")
            print("=" * 60)
            print(f"{'Endpoint':<25} {'Method':<8} {'Description'}")
            print("-" * 60)
            print(f"{'/':<25} {'GET':<8} API information")
            print(f"{'/health':<25} {'GET':<8} Health check")
            print(f"{'/analyze':<25} {'POST':<8} Upload video for analysis")
            print(f"{'/status/<job_id>':<25} {'GET':<8} Check analysis progress")
            print(f"{'/files/<job_id>':<25} {'GET':<8} List available files")
            print(f"{'/download/<job_id>/<type>':<25} {'GET':<8} Download results")
            print("=" * 60)
            
            print(f"\n🌐 Your Public API: {public_url}")
            print(f"🧪 Test with demo: python simple_demo_ngrok.py")
            print(f"📋 Quick Upload:")
            print(f"   curl -X POST {public_url}/analyze \\")
            print(f"     -F 'video=@video/demo.mp4' \\")
            print(f"     -F 'social_distance=true'")
        
        print(f"\n🔄 Server running... Press Ctrl+C to stop")
        
        # Keep running
        while True:
            time.sleep(1)
            
            # Check if processes are still running
            if flask_process.poll() is not None:
                print("❌ Flask server stopped unexpectedly")
                break
                
            if ngrok_process.poll() is not None:
                print("❌ ngrok tunnel stopped unexpectedly")
                break
                
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        cleanup_processes(flask_process, ngrok_process)

if __name__ == "__main__":
    main() 