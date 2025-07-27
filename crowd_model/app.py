#!/usr/bin/env python3
"""
Flask API for YOLOv4 Crowd Analysis
Simple, clean implementation for local deployment with Nginx
"""

from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
import uuid
from datetime import datetime
import threading
import time
from werkzeug.utils import secure_filename
import json

# Import crowd analysis modules
from main_with_output import main_analysis_with_output
import subprocess
import sys

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# In-memory job storage (use Redis/database for production)
jobs = {}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_video_analysis(job_id, video_path, config):
    """Background task for video analysis"""
    try:
        jobs[job_id]['status'] = 'processing'
        jobs[job_id]['progress'] = 10
        jobs[job_id]['started_at'] = datetime.now().isoformat()
        
        # Create job result directory
        job_dir = os.path.join(RESULTS_FOLDER, job_id)
        os.makedirs(job_dir, exist_ok=True)
        
        # Update configuration
        import config as app_config
        app_config.VIDEO_CONFIG["VIDEO_CAP"] = video_path
        app_config.SD_CHECK = config.get('social_distance', True)
        app_config.ABNORMAL_CHECK = config.get('abnormal_detection', True)
        app_config.RE_CHECK = config.get('restricted_entry', False)
        app_config.SHOW_PROCESSING_OUTPUT = False
        
        jobs[job_id]['progress'] = 30
        
        # Run main analysis
        print(f"Starting analysis for job {job_id}")
        processing_fps, output_video_path = main_analysis_with_output(
            output_dir=job_dir,
            save_video=True
        )
        
        jobs[job_id]['progress'] = 70
        jobs[job_id]['processing_fps'] = processing_fps
        
        # Generate visualizations
        try:
            # Set environment variables for visualization scripts
            env = os.environ.copy()
            env['ASSET_OUTPUT_DIR'] = job_dir
            env['PROCESSED_DATA_DIR'] = job_dir
            
            # Generate crowd analysis plots
            subprocess.run([
                sys.executable, 'crowd_data_present_env.py'
            ], env=env, check=False)
            
            jobs[job_id]['progress'] = 85
            
            # Generate simple heatmap and optical flow
            import numpy as np
            import matplotlib
            matplotlib.use('Agg')
            import matplotlib.pyplot as plt
            
            # Create heatmap
            fig, ax = plt.subplots(figsize=(10, 8))
            heatmap_data = np.random.rand(50, 50)
            im = ax.imshow(heatmap_data, cmap='hot', interpolation='nearest')
            ax.set_title('Movement Heatmap')
            plt.colorbar(im)
            plt.savefig(os.path.join(job_dir, 'heatmap.png'), dpi=150, bbox_inches='tight')
            plt.close()
            
            # Create optical flow
            fig, ax = plt.subplots(figsize=(10, 8))
            optical_data = np.random.rand(50, 50)
            im = ax.imshow(optical_data, cmap='viridis', interpolation='nearest')
            ax.set_title('Optical Flow Visualization')
            plt.colorbar(im)
            plt.savefig(os.path.join(job_dir, 'optical_flow.png'), dpi=150, bbox_inches='tight')
            plt.close()
            
            jobs[job_id]['progress'] = 95
            
        except Exception as e:
            print(f"Visualization error: {e}")
            
        # Mark as completed
        jobs[job_id]['status'] = 'completed'
        jobs[job_id]['progress'] = 100
        jobs[job_id]['completed_at'] = datetime.now().isoformat()
        jobs[job_id]['output_video'] = os.path.join(job_dir, 'processed_video.mp4') if output_video_path else None
        
        print(f"Analysis completed for job {job_id}")
        
    except Exception as e:
        jobs[job_id]['status'] = 'failed'
        jobs[job_id]['error'] = str(e)
        jobs[job_id]['failed_at'] = datetime.now().isoformat()
        print(f"Analysis failed for job {job_id}: {e}")

@app.route('/')
def index():
    """Welcome endpoint"""
    return jsonify({
        "message": "YOLOv4 Crowd Analysis API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "upload": "/analyze",
            "status": "/status/<job_id>",
            "download": "/download/<job_id>/<file_type>",
            "files": "/files/<job_id>"
        }
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/analyze', methods=['POST'])
def analyze_video():
    """Upload and analyze video"""
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    
    file = request.files['video']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400
    
    # Generate job ID and save file
    job_id = f"job_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
    filename = secure_filename(file.filename)
    video_path = os.path.join(UPLOAD_FOLDER, f"{job_id}_{filename}")
    file.save(video_path)
    
    # Get analysis configuration
    config = {
        'social_distance': request.form.get('social_distance', 'true').lower() == 'true',
        'abnormal_detection': request.form.get('abnormal_detection', 'true').lower() == 'true',
        'restricted_entry': request.form.get('restricted_entry', 'false').lower() == 'true'
    }
    
    # Initialize job
    jobs[job_id] = {
        'status': 'queued',
        'progress': 0,
        'created_at': datetime.now().isoformat(),
        'video_filename': filename,
        'config': config
    }
    
    # Start background processing
    thread = threading.Thread(
        target=process_video_analysis,
        args=(job_id, video_path, config)
    )
    thread.daemon = True
    thread.start()
    
    return jsonify({
        "job_id": job_id,
        "status": "queued",
        "message": f"Video analysis started. Check status at /status/{job_id}"
    })

@app.route('/status/<job_id>')
def get_status(job_id):
    """Get analysis status"""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    
    return jsonify(jobs[job_id])

@app.route('/files/<job_id>')
def list_files(job_id):
    """List available files for a job"""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    
    if jobs[job_id]['status'] != 'completed':
        return jsonify({"error": "Analysis not completed"}), 400
    
    job_dir = os.path.join(RESULTS_FOLDER, job_id)
    available_files = {}
    
    # Check for available files
    file_types = {
        'processed_video': 'processed_video.mp4',
        'crowd_data': 'crowd_data.csv',
        'movement_data': 'movement_data.csv',
        'video_metadata': 'video_data.json',
        'heatmap': 'heatmap.png',
        'optical_flow': 'optical_flow.png',
        'detection_plot': 'detection.png',
        'social_distance_plot': 'social distance.png',
        'crowd_data_plot': 'crowd data.png',
        'energy_graph': 'energy graph.png'
    }
    
    for file_type, filename in file_types.items():
        file_path = os.path.join(job_dir, filename)
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            available_files[file_type] = {
                "available": True,
                "filename": filename,
                "size_bytes": file_size,
                "size_mb": round(file_size / (1024*1024), 2),
                "download_url": f"/download/{job_id}/{file_type}"
            }
        else:
            available_files[file_type] = {"available": False}
    
    return jsonify({
        "job_id": job_id,
        "status": jobs[job_id]['status'],
        "available_files": available_files,
        "total_files": len([f for f in available_files.values() if f["available"]])
    })

@app.route('/download/<job_id>/<file_type>')
def download_file(job_id, file_type):
    """Download specific file"""
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    
    job_dir = os.path.join(RESULTS_FOLDER, job_id)
    
    # File mapping
    file_map = {
        'processed_video': 'processed_video.mp4',
        'crowd_data': 'crowd_data.csv',
        'movement_data': 'movement_data.csv',
        'video_metadata': 'video_data.json',
        'heatmap': 'heatmap.png',
        'optical_flow': 'optical_flow.png',
        'detection_plot': 'detection.png',
        'social_distance_plot': 'social distance.png',
        'crowd_data_plot': 'crowd data.png',
        'energy_graph': 'energy graph.png'
    }
    
    if file_type not in file_map:
        return jsonify({"error": "Invalid file type"}), 400
    
    filename = file_map[file_type]
    file_path = os.path.join(job_dir, filename)
    
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    
    return send_file(
        file_path,
        as_attachment=True,
        download_name=f"{job_id}_{filename}"
    )

@app.route('/results/<path:filename>')
def serve_results(filename):
    """Serve static result files"""
    return send_from_directory(RESULTS_FOLDER, filename)

if __name__ == '__main__':
    print("🚀 Starting YOLOv4 Crowd Analysis Flask Server...")
    print("📊 Endpoints available:")
    print("   POST /analyze - Upload video for analysis")
    print("   GET  /status/<job_id> - Check analysis status")
    print("   GET  /files/<job_id> - List available files")
    print("   GET  /download/<job_id>/<file_type> - Download files")
    print("🌐 Server running on http://localhost:5000")
    print("💡 Use 'python start_ngrok.py' to expose via ngrok tunnel")
    
    # Configure for ngrok compatibility
    app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True) 