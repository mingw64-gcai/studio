# 🐍 YOLOv4 Crowd Analysis - Flask + Nginx Deployment

**Simple, efficient deployment of YOLOv4 crowd analysis with Flask backend and Nginx reverse proxy.**

## 🎯 **What This Does**

- **🎥 Video Analysis**: Upload videos and get AI-powered crowd analysis
- **👥 People Detection**: YOLOv4 neural network detects and tracks people
- **📏 Social Distance Monitoring**: Identifies violations of social distancing
- **⚠️ Abnormal Activity Detection**: Flags unusual crowd behavior  
- **📊 Rich Outputs**: Processed videos, CSV data, visualizations

## 🏗️ **Architecture**

```
📱 Client → 🌐 Nginx (Port 80) → 🐍 Flask (Port 5000)
                     ↓
                📁 Static Files (videos, images, data)
```

**Benefits:**
- **🚀 Fast**: Nginx serves large videos efficiently
- **🔧 Simple**: Easier to debug and maintain than cloud deployment
- **💰 Cost-effective**: Runs on any server/VPS
- **🛠️ Flexible**: Easy to customize and extend

## 🚀 **Quick Start**

### **Option 1: Auto-Start (Linux/Mac)**
```bash
chmod +x start_servers.sh
./start_servers.sh
```

### **Option 2: Auto-Start (Windows)**
```powershell
powershell -ExecutionPolicy Bypass -File start_servers.ps1
```

### **Option 3: Manual Start**
```bash
# Install dependencies
pip install -r requirements_flask.txt

# Start Flask server
python app.py

# In another terminal, start Nginx (if available)
sudo nginx -c $(pwd)/nginx_local.conf
```

## 📋 **Prerequisites**

### **Required**
- **Python 3.7+** with pip
- **OpenCV dependencies** (usually auto-installed)
- **YOLOv4 model files** (see setup below)

### **Optional (Recommended)**
- **Nginx** for better performance
  - **Linux**: `sudo apt-get install nginx`
  - **Mac**: `brew install nginx`  
  - **Windows**: Download from [nginx.org](https://nginx.org/en/download.html)

## 🛠️ **Setup**

### **1. Install Python Dependencies**
```bash
pip install -r requirements_flask.txt
```

### **2. Setup YOLOv4 Model**
The project requires YOLOv4-tiny model files:
```bash
# Create directory
mkdir -p YOLOv4-tiny

# Download weights (if not already present)
wget -O YOLOv4-tiny/yolov4-tiny.weights \
  https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights

# Download config
wget -O YOLOv4-tiny/yolov4-tiny.cfg \
  https://raw.githubusercontent.com/AlexeyAB/darknet/master/cfg/yolov4-tiny.cfg
```

### **3. Test Setup**
```bash
python test_flask_api.py
```

## 🎯 **API Endpoints**

| **Endpoint** | **Method** | **Purpose** |
|--------------|------------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/analyze` | POST | **Upload video for analysis** |
| `/status/<job_id>` | GET | Check analysis progress |
| `/files/<job_id>` | GET | List available output files |
| `/download/<job_id>/<file_type>` | GET | Download specific files |

## 📤 **Upload Video for Analysis**

### **Using cURL**
```bash
curl -X POST http://localhost:5000/analyze \
  -F "video=@your_video.mp4" \
  -F "social_distance=true" \
  -F "abnormal_detection=true"
```

**Response:**
```json
{
  "job_id": "job_20250724_120000_abc123",
  "status": "queued",
  "message": "Video analysis started. Check status at /status/job_20250724_120000_abc123"
}
```

### **Using Python**
```python
import requests

url = "http://localhost:5000/analyze"
files = {'video': open('demo.mp4', 'rb')}
data = {
    'social_distance': 'true',
    'abnormal_detection': 'true'
}

response = requests.post(url, files=files, data=data)
job_id = response.json()['job_id']
print(f"Analysis started: {job_id}")
```

## 📊 **Monitor Progress**

```bash
curl http://localhost:5000/status/JOB_ID
```

**Response:**
```json
{
  "status": "completed",
  "progress": 100,
  "processing_fps": 20.5,
  "started_at": "2025-07-24T12:00:00",
  "completed_at": "2025-07-24T12:02:30"
}
```

## 📁 **Available Outputs**

### **List All Files**
```bash
curl http://localhost:5000/files/JOB_ID
```

### **Output Types**
| **File Type** | **Description** | **Download URL** |
|---------------|-----------------|------------------|
| `processed_video` | **Video with bounding boxes, tracking, violations** | `/download/JOB_ID/processed_video` |
| `crowd_data` | Time-series crowd analysis (CSV) | `/download/JOB_ID/crowd_data` |
| `movement_data` | Individual tracking data (CSV) | `/download/JOB_ID/movement_data` |
| `heatmap` | Movement heatmap (PNG) | `/download/JOB_ID/heatmap` |
| `optical_flow` | Optical flow visualization (PNG) | `/download/JOB_ID/optical_flow` |
| `detection_plot` | Detection statistics over time (PNG) | `/download/JOB_ID/detection_plot` |
| `social_distance_plot` | Social distance violations (PNG) | `/download/JOB_ID/social_distance_plot` |

### **Download Files**
```bash
# Download processed video with all overlays
curl -o processed_video.mp4 \
  http://localhost:5000/download/JOB_ID/processed_video

# Download crowd analysis data
curl -o crowd_data.csv \
  http://localhost:5000/download/JOB_ID/crowd_data

# Download heatmap visualization  
curl -o heatmap.png \
  http://localhost:5000/download/JOB_ID/heatmap
```

## 🔧 **Configuration**

### **Analysis Options**
- **`social_distance`**: Enable social distance violation detection
- **`abnormal_detection`**: Enable abnormal activity detection  
- **`restricted_entry`**: Enable restricted area monitoring

### **File Locations**
- **Uploads**: `uploads/` directory
- **Results**: `results/JOB_ID/` directories
- **Logs**: `logs/` directory (if logging enabled)

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Flask Won't Start**
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill existing process
pkill -f "python.*app.py"

# Try different port
export FLASK_PORT=5001
python app.py
```

#### **Video Analysis Fails**
- Check video format (MP4, AVI, MOV supported)
- Ensure YOLOv4 model files exist
- Check Python dependencies are installed
- Review Flask server logs

#### **Nginx Issues**
```bash
# Test Nginx configuration
sudo nginx -t -c $(pwd)/nginx_local.conf

# Check Nginx status
sudo systemctl status nginx

# Run Flask-only mode if Nginx fails
python app.py
```

#### **File Download Issues**
- Check if analysis completed successfully
- Verify file exists in `results/JOB_ID/` directory
- Try Flask direct URL: `http://localhost:5000/download/...`

### **Logs and Debugging**
```bash
# Flask server logs (in terminal where app.py runs)
python app.py

# Nginx logs (if using Nginx)
tail -f /var/log/nginx/crowd_analysis_access.log
tail -f /var/log/nginx/crowd_analysis_error.log

# Check analysis results
ls -la results/JOB_ID/
```

## 🎯 **Performance Tips**

### **For Large Videos**
- Use Nginx for better file serving performance
- Consider video compression before upload
- Monitor disk space in `results/` directory

### **For Multiple Users**
- Use a process manager like Gunicorn instead of Flask dev server
- Set up proper logging and monitoring
- Consider using Redis for job storage instead of in-memory

### **Production Deployment**
```bash
# Use Gunicorn for production
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Configure Nginx for production
# Update nginx.conf with proper paths and security settings
```

## 📈 **Scaling Up**

For production use, consider:
- **🔄 Process Manager**: Gunicorn/uWSGI
- **📊 Monitoring**: Prometheus + Grafana
- **💾 Database**: PostgreSQL/MySQL for job storage
- **🚀 Queue System**: Celery + Redis for background processing
- **🔒 Security**: SSL certificates, authentication

## 🆘 **Support**

- **Issues**: Check troubleshooting section above
- **Logs**: Review Flask and Nginx logs
- **Testing**: Run `python test_flask_api.py`
- **Configuration**: Check `app.py` and `nginx.conf`

---

## 🎉 **Success!**

Your YOLOv4 Crowd Analysis API is now running locally with Flask + Nginx!

**Access your API at:**
- **🌐 Main**: http://localhost (through Nginx)
- **🐍 Direct**: http://localhost:5000 (Flask only)
- **📊 Health**: http://localhost/health 