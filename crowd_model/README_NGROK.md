# 🌐 YOLOv4 Crowd Analysis - Ngrok Deployment

**Expose your local Flask crowd analysis API to the internet using ngrok tunneling.**

## 🎯 **What is Ngrok?**

Ngrok creates secure tunnels to localhost, allowing you to:
- **🌍 Share your local API** with anyone on the internet
- **📱 Test webhooks** and mobile app integration  
- **🔗 Get HTTPS URLs** without SSL certificate setup
- **🚀 Demo your project** without complex deployment

## 🚀 **Quick Start**

### **1. Install ngrok**
```bash
# Download from https://ngrok.com/download
# Extract and add to PATH, then authenticate:
ngrok authtoken YOUR_AUTH_TOKEN
```

### **2. Start Flask + ngrok**
```bash
python start_ngrok.py
```

### **3. Test All Endpoints**
```bash
python test_ngrok_api.py
```

---

## 🛠️ **Detailed Setup**

### **Step 1: Install Dependencies**
```bash
pip install -r requirements_flask.txt
```

### **Step 2: Setup ngrok**

#### **Download & Install**
1. Go to [ngrok.com](https://ngrok.com/download)
2. Download for your platform
3. Extract and add to PATH

#### **Get Auth Token**
1. Sign up at [ngrok.com](https://ngrok.com/)
2. Get your authtoken from dashboard
3. Configure: `ngrok authtoken YOUR_TOKEN`

#### **Test ngrok**
```bash
ngrok --version
```

### **Step 3: Run the Application**

#### **Option 1: Auto-Start (Recommended)**
```bash
python start_ngrok.py
```

This will:
- ✅ Start Flask server on localhost:5000
- ✅ Start ngrok tunnel 
- ✅ Get public HTTPS URL
- ✅ Test all endpoints
- ✅ Display usage examples

#### **Option 2: Manual Start**
```bash
# Terminal 1: Start Flask
python app.py

# Terminal 2: Start ngrok
ngrok http 5000

# Get public URL from ngrok dashboard: http://localhost:4040
```

---

## 🎯 **Using Your Public API**

Once running, you'll get a public URL like: `https://abc123.ngrok.io`

### **Upload Video for Analysis**
```bash
curl -X POST https://abc123.ngrok.io/analyze \
  -F "video=@your_video.mp4" \
  -F "social_distance=true" \
  -F "abnormal_detection=true"
```

**Response:**
```json
{
  "job_id": "job_20250724_120000_abc123",
  "status": "queued",
  "message": "Video analysis started..."
}
```

### **Monitor Progress**
```bash
curl https://abc123.ngrok.io/status/job_20250724_120000_abc123
```

### **Download Results**
```bash
# List available files
curl https://abc123.ngrok.io/files/job_20250724_120000_abc123

# Download processed video
curl -o processed.mp4 \
  https://abc123.ngrok.io/download/job_20250724_120000_abc123/processed_video

# Download analysis data
curl -o data.csv \
  https://abc123.ngrok.io/download/job_20250724_120000_abc123/crowd_data
```

---

## 📊 **Available Endpoints**

| **Endpoint** | **Method** | **Description** |
|--------------|------------|-----------------|
| `/` | GET | API information and endpoints |
| `/health` | GET | Health check and status |
| `/analyze` | POST | **Upload video for analysis** |
| `/status/<job_id>` | GET | Check analysis progress |
| `/files/<job_id>` | GET | List available output files |
| `/download/<job_id>/<type>` | GET | Download specific files |

## 📁 **Output File Types**

| **Type** | **Description** | **Format** |
|----------|-----------------|------------|
| `processed_video` | **Video with bounding boxes, tracking** | MP4 |
| `crowd_data` | Time-series crowd analysis | CSV |
| `movement_data` | Individual tracking data | CSV |
| `video_metadata` | Processing metadata | JSON |
| `heatmap` | Movement heatmap visualization | PNG |
| `optical_flow` | Movement patterns | PNG |
| `detection_plot` | Detection statistics | PNG |
| `social_distance_plot` | Violation tracking | PNG |

---

## 🧪 **Testing Your Deployment**

### **Automated Testing**
```bash
python test_ngrok_api.py
```

This comprehensive test will:
- ✅ Check all endpoints
- ✅ Upload a test video
- ✅ Monitor analysis progress
- ✅ Verify file downloads
- ✅ Test error handling
- ✅ Measure response times

### **Manual Testing**

#### **1. Health Check**
```bash
curl https://YOUR_NGROK_URL.ngrok.io/health
```

#### **2. API Info**
```bash
curl https://YOUR_NGROK_URL.ngrok.io/
```

#### **3. Upload Test Video**
```bash
# Create simple test video or use existing one
curl -X POST https://YOUR_NGROK_URL.ngrok.io/analyze \
  -F "video=@test_video.mp4" \
  -F "social_distance=true"
```

---

## 🌐 **Integration Examples**

### **Python Client**
```python
import requests

BASE_URL = "https://YOUR_NGROK_URL.ngrok.io"

# Upload video
with open("video.mp4", "rb") as f:
    response = requests.post(f"{BASE_URL}/analyze", 
                           files={"video": f},
                           data={"social_distance": "true"})
    job_id = response.json()["job_id"]

# Monitor progress
while True:
    status = requests.get(f"{BASE_URL}/status/{job_id}").json()
    if status["status"] == "completed":
        break
    time.sleep(10)

# Download results
files = requests.get(f"{BASE_URL}/files/{job_id}").json()
for file_type in files["available_files"]:
    if files["available_files"][file_type]["available"]:
        response = requests.get(f"{BASE_URL}/download/{job_id}/{file_type}")
        with open(f"{job_id}_{file_type}", "wb") as f:
            f.write(response.content)
```

### **JavaScript/Node.js**
```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'https://YOUR_NGROK_URL.ngrok.io';

async function analyzeVideo(videoPath) {
    // Upload video
    const formData = new FormData();
    formData.append('video', fs.createReadStream(videoPath));
    formData.append('social_distance', 'true');
    
    const uploadResponse = await axios.post(`${BASE_URL}/analyze`, formData, {
        headers: formData.getHeaders()
    });
    
    const jobId = uploadResponse.data.job_id;
    console.log(`Analysis started: ${jobId}`);
    
    // Monitor progress
    while (true) {
        const statusResponse = await axios.get(`${BASE_URL}/status/${jobId}`);
        const status = statusResponse.data;
        
        console.log(`Status: ${status.status} - Progress: ${status.progress}%`);
        
        if (status.status === 'completed') {
            break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    // List available files
    const filesResponse = await axios.get(`${BASE_URL}/files/${jobId}`);
    console.log('Available files:', Object.keys(filesResponse.data.available_files));
    
    return jobId;
}

analyzeVideo('test_video.mp4');
```

---

## 🔧 **Configuration & Optimization**

### **Ngrok Settings**
```bash
# Custom subdomain (requires paid plan)
ngrok http 5000 --subdomain=my-crowd-analysis

# Custom region
ngrok http 5000 --region=eu

# HTTP and HTTPS
ngrok http 5000 --bind-tls=both
```

### **Flask Settings for Ngrok**
The app automatically configures:
- ✅ **CORS enabled** for cross-origin requests
- ✅ **500MB max upload** for large videos
- ✅ **Threading enabled** for concurrent requests
- ✅ **Production-ready** settings

### **Performance Tips**
- 🚀 **Free ngrok**: 40 connections/minute limit
- 💰 **Paid ngrok**: Higher limits, custom domains
- 📊 **Large videos**: Consider compression before upload
- 🔄 **Multiple users**: Use Gunicorn for better performance

---

## 🔒 **Security Considerations**

### **Ngrok Security**
- ✅ **HTTPS by default** - encrypted tunnel
- ✅ **Unique URLs** - hard to guess
- ⚠️ **Public access** - anyone with URL can access
- 🔐 **Auth options** - Basic auth available (paid plans)

### **API Security**
```python
# Add basic authentication (optional)
from flask_httpauth import HTTPBasicAuth
auth = HTTPBasicAuth()

@auth.verify_password
def verify_password(username, password):
    return username == 'admin' and password == 'your_password'

@app.route('/analyze', methods=['POST'])
@auth.login_required
def analyze_video():
    # Your endpoint code
```

### **Production Recommendations**
- 🔐 Add authentication for sensitive deployments
- 📊 Monitor usage and set rate limits
- 🗄️ Clean up old analysis results periodically
- 📝 Log all requests for debugging

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **"ngrok not found"**
```bash
# Check if ngrok is in PATH
ngrok --version

# Windows: Add to PATH or use full path
C:\path\to\ngrok.exe http 5000
```

#### **"Failed to complete tunnel connection"**
```bash
# Check authentication
ngrok authtoken YOUR_TOKEN

# Try different region
ngrok http 5000 --region=us
```

#### **"Flask server failed to start"**
```bash
# Check if port 5000 is free
netstat -an | grep 5000

# Try different port
export FLASK_PORT=5001
```

#### **"Analysis timeout"**
- Check YOLOv4 model files exist
- Verify sufficient disk space
- Monitor Flask server logs

### **Debugging Commands**
```bash
# Check ngrok status
curl http://localhost:4040/api/tunnels

# Test Flask directly
curl http://localhost:5000/health

# Monitor Flask logs
python app.py  # Check terminal output

# Test with small video first
python test_ngrok_api.py
```

---

## 🎉 **Success!**

Your YOLOv4 Crowd Analysis API is now publicly accessible via ngrok!

**What you've achieved:**
- ✅ **Local development** with global access
- ✅ **HTTPS endpoint** for secure communication  
- ✅ **Easy sharing** with team members or clients
- ✅ **No complex deployment** required
- ✅ **Full API functionality** with file uploads/downloads

**Next Steps:**
- 📱 Integrate with mobile apps
- 🌐 Build web frontend
- 📊 Set up monitoring/analytics
- 🚀 Consider permanent deployment when ready

**Happy crowd analyzing! 🎯** 