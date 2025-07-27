#!/usr/bin/env python3
"""
Simple Demo for YOLOv4 Crowd Analysis API
Uses existing demo video and shows ngrok usage
"""
import requests
import time
import webbrowser
import os

def demo_api():
    """Simple demo using existing demo video"""
    
    # Check if Flask is running
    try:
        response = requests.get("http://localhost:5000/health", timeout=3)
        if response.status_code != 200:
            print("❌ Flask server not running!")
            print("💡 Start Flask: python app.py")
            return
    except:
        print("❌ Flask server not running!")
        print("💡 Start Flask: python app.py")
        return
        
    print("🎯 YOLOv4 Crowd Analysis - Simple Demo")
    print("=" * 40)
    
    # Check for demo video
    demo_video = "video/demo.mp4"
    if not os.path.exists(demo_video):
        print(f"❌ Demo video not found: {demo_video}")
        return
        
    print(f"📹 Using demo video: {demo_video}")
    
    # Upload video for analysis
    print("📤 Uploading video for YOLOv4 analysis...")
    
    with open(demo_video, 'rb') as video_file:
        files = {'video': video_file}
        data = {
            'social_distance': 'true',
            'abnormal_detection': 'true'
        }
        
        response = requests.post(
            "http://localhost:5000/analyze",
            files=files,
            data=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            job_id = result['job_id']
            print(f"✅ Analysis started!")
            print(f"   Job ID: {job_id}")
            
            # Monitor progress
            print("\n⏳ Processing with YOLOv4...")
            while True:
                status_response = requests.get(f"http://localhost:5000/status/{job_id}")
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    status = status_data.get('status')
                    progress = status_data.get('progress', 0)
                    
                    print(f"   📊 {status.upper()}: {progress}%")
                    
                    if status == 'completed':
                        processing_fps = status_data.get('processing_fps', 'Unknown')
                        print(f"✅ ANALYSIS COMPLETE!")
                        print(f"   Processing Speed: {processing_fps} FPS")
                        
                        # Show available outputs
                        files_response = requests.get(f"http://localhost:5000/files/{job_id}")
                        if files_response.status_code == 200:
                            files_data = files_response.json()
                            available = files_data['available_files']
                            
                            print(f"\n📁 Generated Outputs ({files_data['total_files']} files):")
                            
                            for file_type, info in available.items():
                                if info.get('available'):
                                    size_mb = info.get('size_mb', 0)
                                    download_url = f"http://localhost:5000/download/{job_id}/{file_type}"
                                    
                                    if file_type == 'processed_video':
                                        print(f"   📹 {file_type}: {size_mb} MB - MAIN OUTPUT")
                                        print(f"      (YOLOv4 bounding boxes, tracking, violations)")
                                    elif 'plot' in file_type or 'heatmap' in file_type or 'flow' in file_type:
                                        print(f"   🖼️  {file_type}: {size_mb} MB - Visualization")
                                    elif 'data' in file_type:
                                        print(f"   📊 {file_type}: {size_mb} MB - Analysis data")
                                    else:
                                        print(f"   📄 {file_type}: {size_mb} MB")
                                    
                                    print(f"      🔗 Download: {download_url}")
                            
                            # Show directory location
                            print(f"\n📂 Results saved to: results/{job_id}/")
                            print(f"💡 Open folder: start results/{job_id}/")
                            
                            # Ngrok info
                            print(f"\n🌐 For Public Access:")
                            print(f"   1. Install ngrok: https://ngrok.com/download")
                            print(f"   2. Run: python start_ngrok.py")
                            print(f"   3. Share public URL with anyone!")
                            
                            return job_id
                            
                    elif status == 'failed':
                        print(f"❌ Analysis failed: {status_data.get('error', 'Unknown error')}")
                        return None
                    
                    time.sleep(2)
                else:
                    print(f"❌ Status check failed")
                    return None
        else:
            print(f"❌ Upload failed: {response.status_code}")
            return None

def show_ngrok_setup():
    """Show ngrok setup instructions"""
    print("\n🌐 NGROK SETUP (for public access):")
    print("=" * 40)
    print("1️⃣ Download ngrok: https://ngrok.com/download")
    print("2️⃣ Extract and add to PATH")
    print("3️⃣ Get auth token: https://dashboard.ngrok.com/auth")
    print("4️⃣ Configure: ngrok authtoken YOUR_TOKEN")
    print("5️⃣ Run: python start_ngrok.py")
    print("")
    print("🎯 Then your API will be publicly accessible!")
    print("   Anyone can upload videos and get YOLOv4 analysis!")

if __name__ == "__main__":
    print("🚀 Starting Simple YOLOv4 Demo...")
    
    # Run demo
    job_id = demo_api()
    
    if job_id:
        print(f"\n🎉 SUCCESS! YOLOv4 analysis complete!")
        print(f"📹 Check your processed video: results/{job_id}/processed_video.mp4")
        
        # Ask about ngrok
        print(f"\n❓ Want to make this API publicly accessible?")
        show_ngrok_setup()
    else:
        print(f"\n❌ Demo failed. Check Flask server is running: python app.py") 