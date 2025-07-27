#!/usr/bin/env python3
"""
Simple Demo for testing YOLOv4 Crowd Analysis via ngrok public URL
Uses existing demo video and shows complete analysis workflow
"""
import requests
import time
import os

def get_public_url():
    """Get the ngrok public URL from user or auto-detect"""
    
    # Try to auto-detect ngrok URL first
    try:
        response = requests.get("http://localhost:4040/api/tunnels", timeout=3)
        if response.status_code == 200:
            tunnels = response.json()["tunnels"]
            for tunnel in tunnels:
                if tunnel["config"]["addr"] == "http://localhost:5000":
                    auto_url = tunnel["public_url"]
                    print(f"🔍 Auto-detected ngrok URL: {auto_url}")
                    use_auto = input("Use this URL? (y/n): ").lower().strip()
                    if use_auto in ['y', 'yes', '']:
                        return auto_url
    except:
        pass
    
    # Manual input
    print("\n🌐 Enter your ngrok public URL:")
    print("   (Example: https://abc123.ngrok-free.app)")
    url = input("URL: ").strip()
    
    # Clean up URL
    if not url.startswith('http'):
        url = 'https://' + url
    if url.endswith('/'):
        url = url[:-1]
        
    return url

def test_ngrok_api(base_url):
    """Test the ngrok-exposed API with demo video"""
    
    print(f"\n🎯 Testing YOLOv4 API at: {base_url}")
    print("=" * 50)
    
    # Test 1: API Status
    try:
        response = requests.get(f"{base_url}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ API Status: ONLINE")
            print(f"   Message: {data.get('message')}")
            print(f"   Version: {data.get('version')}")
        else:
            print(f"❌ API Status: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ API Status: FAILED ({e})")
        print("💡 Make sure ngrok is running and URL is correct")
        return False
    
    # Check demo video
    demo_video = "video/demo.mp4"
    if not os.path.exists(demo_video):
        print(f"❌ Demo video not found: {demo_video}")
        return False
    
    video_size = os.path.getsize(demo_video) / (1024*1024)  # MB
    print(f"📹 Demo video: {demo_video} ({video_size:.1f} MB)")
    
    # Upload video for analysis
    print(f"\n📤 Uploading to YOLOv4 analysis...")
    
    try:
        with open(demo_video, 'rb') as video_file:
            files = {'video': (demo_video, video_file, 'video/mp4')}
            data = {
                'social_distance': 'true',
                'abnormal_detection': 'true',
                'restricted_entry': 'false'
            }
            
            response = requests.post(
                f"{base_url}/analyze",
                files=files,
                data=data,
                timeout=60  # Longer timeout for upload
            )
            
            if response.status_code == 200:
                result = response.json()
                job_id = result.get('job_id')
                print("✅ Upload successful!")
                print(f"   Job ID: {job_id}")
                print(f"   Status: {result.get('status')}")
                
                # Monitor progress
                print(f"\n⏳ YOLOv4 Processing...")
                start_time = time.time()
                
                while True:
                    try:
                        status_response = requests.get(f"{base_url}/status/{job_id}", timeout=10)
                        if status_response.status_code == 200:
                            status_data = status_response.json()
                            status = status_data.get('status')
                            progress = status_data.get('progress', 0)
                            elapsed = time.time() - start_time
                            
                            print(f"   📊 {status.upper()}: {progress}% (elapsed: {elapsed:.0f}s)")
                            
                            if status == 'completed':
                                processing_fps = status_data.get('processing_fps', 'Unknown')
                                print(f"\n🎉 ANALYSIS COMPLETE!")
                                print(f"   Processing Speed: {processing_fps} FPS")
                                print(f"   Total Time: {elapsed:.1f} seconds")
                                
                                # Show results
                                files_response = requests.get(f"{base_url}/files/{job_id}", timeout=10)
                                if files_response.status_code == 200:
                                    files_data = files_response.json()
                                    available = files_data['available_files']
                                    
                                    print(f"\n📁 Generated Outputs ({files_data['total_files']} files):")
                                    print("-" * 50)
                                    
                                    for file_type, info in available.items():
                                        if info.get('available'):
                                            size_mb = info.get('size_mb', 0)
                                            download_url = f"{base_url}/download/{job_id}/{file_type}"
                                            
                                            if file_type == 'processed_video':
                                                print(f"📹 {file_type:20} {size_mb:6.2f} MB - MAIN OUTPUT")
                                                print(f"   YOLOv4 bounding boxes, tracking, violations")
                                            elif 'plot' in file_type or 'heatmap' in file_type or 'flow' in file_type:
                                                print(f"🖼️  {file_type:20} {size_mb:6.2f} MB - Visualization")
                                            elif 'data' in file_type:
                                                print(f"📊 {file_type:20} {size_mb:6.2f} MB - Analysis data")
                                            else:
                                                print(f"📄 {file_type:20} {size_mb:6.2f} MB")
                                            
                                            print(f"   🔗 {download_url}")
                                            print()
                                    
                                    print("=" * 50)
                                    print("🎯 SUCCESS! YOLOv4 crowd analysis complete via ngrok!")
                                    print(f"🌐 Public API working at: {base_url}")
                                    print(f"📁 Results: {files_data['total_files']} files generated")
                                    
                                    return True
                                else:
                                    print(f"❌ File listing failed: {files_response.status_code}")
                                    return False
                                
                            elif status == 'failed':
                                error_msg = status_data.get('error', 'Unknown error')
                                print(f"❌ Analysis failed: {error_msg}")
                                return False
                            elif status in ['processing', 'queued']:
                                time.sleep(5)  # Wait 5 seconds before next check
                            else:
                                print(f"⚠️  Unknown status: {status}")
                                time.sleep(5)
                                
                        else:
                            print(f"❌ Status check failed: {status_response.status_code}")
                            return False
                            
                    except Exception as e:
                        print(f"❌ Status check error: {e}")
                        return False
                
            else:
                print(f"❌ Upload failed: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('error', 'Unknown error')}")
                except:
                    print(f"   Response: {response.text[:200]}")
                return False
                
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return False

def main():
    """Main demo function"""
    print("🚀 YOLOv4 Crowd Analysis - Ngrok Demo")
    print("=" * 40)
    
    # Get public URL
    public_url = get_public_url()
    if not public_url:
        print("❌ No URL provided")
        return
    
    # Test the API
    success = test_ngrok_api(public_url)
    
    if success:
        print(f"\n🎉 Demo completed successfully!")
        print(f"🌐 Your API is working perfectly via ngrok!")
        print(f"📤 Share this URL: {public_url}")
        print(f"🎯 Anyone can now upload videos for YOLOv4 analysis!")
    else:
        print(f"\n❌ Demo failed")
        print(f"🔧 Check that:")
        print(f"   - Flask server is running (python app.py)")
        print(f"   - ngrok tunnel is active (python start_ngrok.py)")
        print(f"   - URL is correct: {public_url}")

if __name__ == "__main__":
    main() 