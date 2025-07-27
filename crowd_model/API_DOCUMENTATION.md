# YOLOv4 Crowd Analysis API Documentation

## Overview
The YOLOv4 Crowd Analysis API provides video analysis capabilities for crowd detection, movement tracking, social distancing monitoring, and abnormal behavior detection. This RESTful API is designed for easy frontend integration.

## Base URL
```
Local Development: http://localhost:5000
Production: https://your-domain.com
```

## Authentication
Currently, no authentication is required. CORS is enabled for all origins.

## Content Types
- Request: `multipart/form-data` (for file uploads), `application/json`
- Response: `application/json`

## Rate Limiting
No rate limiting is currently implemented.

---

## Endpoints

### 1. Welcome/Info
Get API information and available endpoints.

**Endpoint:** `GET /`

**Response:**
```json
{
  "message": "YOLOv4 Crowd Analysis API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "upload": "/analyze",
    "status": "/status/<job_id>",
    "download": "/download/<job_id>/<file_type>",
    "files": "/files/<job_id>"
  }
}
```

### 2. Health Check
Check if the API service is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Start Video Analysis
Upload a video file and start crowd analysis processing.

**Endpoint:** `POST /analyze`

**Request:**
- Content-Type: `multipart/form-data`
- Max file size: 500MB

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `video` | File | Yes | Video file (mp4, avi, mov, mkv) |
| `social_distance` | String | No | Enable social distancing analysis ("true"/"false", default: "true") |
| `abnormal_detection` | String | No | Enable abnormal behavior detection ("true"/"false", default: "true") |
| `restricted_entry` | String | No | Enable restricted entry monitoring ("true"/"false", default: "false") |

**Example Request (JavaScript):**
```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('social_distance', 'true');
formData.append('abnormal_detection', 'true');
formData.append('restricted_entry', 'false');

const response = await fetch('/analyze', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "job_id": "job_20240115_103000_a1b2c3d4",
  "status": "queued",
  "message": "Video analysis started. Check status at /status/job_20240115_103000_a1b2c3d4"
}
```

**Error Responses:**
- `400`: No video file provided, invalid file type, or no file selected
- `413`: File too large (>500MB)

### 4. Check Analysis Status
Get the current status and progress of a video analysis job.

**Endpoint:** `GET /status/{job_id}`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | String | Yes | Job ID returned from `/analyze` |

**Response (Processing):**
```json
{
  "status": "processing",
  "progress": 45,
  "created_at": "2024-01-15T10:30:00.000Z",
  "started_at": "2024-01-15T10:30:05.000Z",
  "video_filename": "crowd_video.mp4",
  "config": {
    "social_distance": true,
    "abnormal_detection": true,
    "restricted_entry": false
  }
}
```

**Response (Completed):**
```json
{
  "status": "completed",
  "progress": 100,
  "created_at": "2024-01-15T10:30:00.000Z",
  "started_at": "2024-01-15T10:30:05.000Z",
  "completed_at": "2024-01-15T10:35:20.000Z",
  "video_filename": "crowd_video.mp4",
  "config": {
    "social_distance": true,
    "abnormal_detection": true,
    "restricted_entry": false
  },
  "processing_fps": 25.4,
  "output_video": "results/job_20240115_103000_a1b2c3d4/processed_video.mp4"
}
```

**Response (Failed):**
```json
{
  "status": "failed",
  "progress": 30,
  "created_at": "2024-01-15T10:30:00.000Z",
  "started_at": "2024-01-15T10:30:05.000Z",
  "failed_at": "2024-01-15T10:32:10.000Z",
  "video_filename": "crowd_video.mp4",
  "config": {
    "social_distance": true,
    "abnormal_detection": true,
    "restricted_entry": false
  },
  "error": "Error message describing what went wrong"
}
```

**Status Values:**
- `queued`: Job is waiting to be processed
- `processing`: Job is currently being analyzed
- `completed`: Job finished successfully
- `failed`: Job encountered an error

**Error Responses:**
- `404`: Job not found

### 5. List Available Files
Get a list of all generated files for a completed analysis job.

**Endpoint:** `GET /files/{job_id}`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | String | Yes | Job ID from completed analysis |

**Response:**
```json
{
  "job_id": "job_20240115_103000_a1b2c3d4",
  "status": "completed",
  "available_files": {
    "processed_video": {
      "available": true,
      "filename": "processed_video.mp4",
      "size_bytes": 15728640,
      "size_mb": 15.0,
      "download_url": "/download/job_20240115_103000_a1b2c3d4/processed_video"
    },
    "crowd_data": {
      "available": true,
      "filename": "crowd_data.csv",
      "size_bytes": 8192,
      "size_mb": 0.01,
      "download_url": "/download/job_20240115_103000_a1b2c3d4/crowd_data"
    },
    "heatmap": {
      "available": true,
      "filename": "heatmap.png",
      "size_bytes": 204800,
      "size_mb": 0.2,
      "download_url": "/download/job_20240115_103000_a1b2c3d4/heatmap"
    },
    "optical_flow": {
      "available": false
    }
  },
  "total_files": 8
}
```

**Available File Types:**
| File Type | Description | Format |
|-----------|-------------|---------|
| `processed_video` | Video with analysis overlays | MP4 |
| `crowd_data` | Crowd density and count data | CSV |
| `movement_data` | Movement tracking data | CSV |
| `video_metadata` | Video analysis metadata | JSON |
| `heatmap` | Movement heatmap visualization | PNG |
| `optical_flow` | Optical flow visualization | PNG |
| `detection_plot` | Object detection plot | PNG |
| `social_distance_plot` | Social distancing analysis | PNG |
| `crowd_data_plot` | Crowd data visualization | PNG |
| `energy_graph` | Energy/activity graph | PNG |

**Error Responses:**
- `404`: Job not found
- `400`: Analysis not completed

### 6. Download File
Download a specific file from a completed analysis.

**Endpoint:** `GET /download/{job_id}/{file_type}`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `job_id` | String | Yes | Job ID from completed analysis |
| `file_type` | String | Yes | Type of file to download (see available types above) |

**Response:**
- Success: File download with appropriate MIME type
- The file will be downloaded with name format: `{job_id}_{filename}`

**Example Request:**
```javascript
// Download processed video
const response = await fetch('/download/job_20240115_103000_a1b2c3d4/processed_video');
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'processed_video.mp4';
a.click();
```

**Error Responses:**
- `404`: Job not found or file not found
- `400`: Invalid file type

### 7. Serve Static Results
Direct access to result files (alternative to download endpoint).

**Endpoint:** `GET /results/{path}`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | String | Yes | File path within results directory |

**Example:**
```
GET /results/job_20240115_103000_a1b2c3d4/heatmap.png
```

---

## Frontend Integration Examples

### React Integration Example

```jsx
import React, { useState, useEffect } from 'react';

const CrowdAnalysisUpload = () => {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('social_distance', 'true');
    formData.append('abnormal_detection', 'true');

    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      setJobId(result.job_id);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const checkStatus = async () => {
    if (!jobId) return;
    
    try {
      const response = await fetch(`/status/${jobId}`);
      const statusData = await response.json();
      setStatus(statusData.status);
      setProgress(statusData.progress);
      
      if (statusData.status === 'completed') {
        // Fetch available files
        const filesResponse = await fetch(`/files/${jobId}`);
        const filesData = await filesResponse.json();
        console.log('Available files:', filesData.available_files);
      }
    } catch (error) {
      console.error('Status check failed:', error);
    }
  };

  useEffect(() => {
    if (jobId && status !== 'completed' && status !== 'failed') {
      const interval = setInterval(checkStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [jobId, status]);

  return (
    <div>
      <input 
        type="file" 
        accept=".mp4,.avi,.mov,.mkv"
        onChange={(e) => setFile(e.target.files[0])} 
      />
      <button onClick={handleUpload} disabled={!file}>
        Upload & Analyze
      </button>
      
      {status && (
        <div>
          <p>Status: {status}</p>
          <p>Progress: {progress}%</p>
        </div>
      )}
    </div>
  );
};
```

### JavaScript/Vanilla Example

```javascript
class CrowdAnalysisAPI {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
  }

  async uploadVideo(file, config = {}) {
    const formData = new FormData();
    formData.append('video', file);
    
    // Add configuration options
    Object.entries(config).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    const response = await fetch(`${this.baseURL}/analyze`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getStatus(jobId) {
    const response = await fetch(`${this.baseURL}/status/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getFiles(jobId) {
    const response = await fetch(`${this.baseURL}/files/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`File list failed: ${response.statusText}`);
    }

    return response.json();
  }

  async downloadFile(jobId, fileType) {
    const response = await fetch(`${this.baseURL}/download/${jobId}/${fileType}`);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Utility method for polling status
  async pollStatus(jobId, onProgress, interval = 2000) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getStatus(jobId);
          onProgress(status);

          if (status.status === 'completed') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error(status.error || 'Analysis failed'));
          } else {
            setTimeout(poll, interval);
          }
        } catch (error) {
          reject(error);
        }
      };
      poll();
    });
  }
}

// Usage example
const api = new CrowdAnalysisAPI();

document.getElementById('upload-btn').addEventListener('click', async () => {
  const fileInput = document.getElementById('video-file');
  const file = fileInput.files[0];
  
  if (!file) return;

  try {
    // Upload video
    const result = await api.uploadVideo(file, {
      social_distance: true,
      abnormal_detection: true,
      restricted_entry: false
    });

    console.log('Upload started:', result.job_id);

    // Poll for completion
    await api.pollStatus(result.job_id, (status) => {
      console.log(`Progress: ${status.progress}% - ${status.status}`);
      // Update UI with progress
    });

    // Get available files
    const files = await api.getFiles(result.job_id);
    console.log('Analysis complete! Available files:', files.available_files);

  } catch (error) {
    console.error('Analysis failed:', error);
  }
});
```

---

## Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid parameters, file type not allowed, etc.)
- `404`: Not Found (job or file not found)
- `413`: Payload Too Large (file size exceeds 500MB)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "error": "Descriptive error message"
}
```

---

## Best Practices

1. **File Size**: Keep video files under 500MB for optimal performance
2. **Polling**: Poll status every 2-5 seconds to avoid overwhelming the server
3. **Error Handling**: Always implement proper error handling for network failures
4. **Progress Updates**: Use the progress field to show upload/processing progress to users
5. **File Management**: Download and store important results locally as server storage may be temporary
6. **Timeouts**: Implement reasonable timeouts for long-running analysis jobs

---

## WebSocket Alternative (Future Enhancement)
For real-time progress updates, consider implementing WebSocket endpoints:
- `ws://localhost:5000/status/{job_id}` - Real-time status updates
- Eliminates need for polling
- Provides instant progress notifications 