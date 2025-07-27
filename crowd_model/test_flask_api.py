#!/usr/bin/env python3
"""
Test script for Flask Crowd Analysis API
"""
import requests
import time
import os

# Configuration
API_BASE_URL = "http://localhost:5000"  # Flask direct
# API_BASE_URL = "http://localhost"  # Through Nginx (if available)
TEST_VIDEO_PATH = "video/demo.mp4"

def test_flask_api():
    """Test the Flask API"""
    print("🧪 Testing Flask Crowd Analysis API...")
    print(f"Base URL: {API_BASE_URL}")
    
    # Test 1: Health Check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test 2: Root Endpoint
    print("\n2. Testing root endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code == 200:
            print("✅ Root endpoint accessible")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
    
    # Test 3: Video Analysis
    if not os.path.exists(TEST_VIDEO_PATH):
        print(f"\n❌ Test video not found: {TEST_VIDEO_PATH}")
        print("📝 Please ensure demo video exists for testing")
        return False
        
    print(f"\n3. Testing video analysis with {TEST_VIDEO_PATH}...")
    try:
        with open(TEST_VIDEO_PATH, 'rb') as video_file:
            files = {'video': video_file}
            data = {
                'social_distance': 'true',
                'abnormal_detection': 'true'
            }
            
            response = requests.post(
                f"{API_BASE_URL}/analyze",
                files=files,
                data=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                job_id = result.get('job_id')
                print(f"✅ Video analysis started")
                print(f"   Job ID: {job_id}")
                
                # Test 4: Monitor Progress
                print("\n4. Monitoring analysis progress...")
                for i in range(30):  # Wait up to 5 minutes
                    try:
                        status_response = requests.get(f"{API_BASE_URL}/status/{job_id}")
                        if status_response.status_code == 200:
                            status_data = status_response.json()
                            status = status_data.get('status')
                            progress = status_data.get('progress', 0)
                            
                            print(f"   Status: {status} - Progress: {progress}%")
                            
                            if status == 'completed':
                                print("✅ Video analysis completed!")
                                
                                # Test 5: List Files
                                print("\n5. Testing file listing...")
                                files_response = requests.get(f"{API_BASE_URL}/files/{job_id}")
                                if files_response.status_code == 200:
                                    files_data = files_response.json()
                                    print(f"✅ Available files: {files_data['total_files']}")
                                    
                                    # Test 6: Download a file
                                    print("\n6. Testing file download...")
                                    available = files_data['available_files']
                                    for file_type, info in available.items():
                                        if info.get('available'):
                                            download_url = f"{API_BASE_URL}/download/{job_id}/{file_type}"
                                            dl_response = requests.head(download_url)
                                            if dl_response.status_code == 200:
                                                print(f"   ✅ {file_type}: Ready for download")
                                            else:
                                                print(f"   ❌ {file_type}: Download failed")
                                            break
                                
                                return True
                                
                            elif status == 'failed':
                                print(f"❌ Analysis failed: {status_data.get('error', 'Unknown error')}")
                                return False
                                
                        time.sleep(10)
                        
                    except Exception as e:
                        print(f"❌ Status check error: {e}")
                        return False
                
                print("❌ Analysis timeout")
                return False
                
            else:
                print(f"❌ Video upload failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Video analysis error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Flask API Tests...")
    
    success = test_flask_api()
    
    if success:
        print("\n🎉 All tests passed!")
        print("✅ Flask Crowd Analysis API is working correctly")
    else:
        print("\n❌ Some tests failed!")
        print("🔧 Check Flask server logs for details")
        
    print("\n📋 Test Summary:")
    print("   - Health check")
    print("   - Video upload & analysis")
    print("   - Progress monitoring")
    print("   - File listing")
    print("   - File download verification") 