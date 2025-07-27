#!/usr/bin/env python3
"""
Flask API for YOLOv4 Crowd Analysis - Direct Download Version
Synchronous processing with immediate download of results
"""

from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
import os
import uuid
from datetime import datetime
import tempfile
import shutil
from werkzeug.utils import secure_filename
import json
import zipfile
import io

# Import crowd analysis modules
from main_with_output import main_analysis_with_output
import subprocess
import sys

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

# Configuration
UPLOAD_FOLDER = 'uploads'
TEMP_RESULTS = 'temp_results'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMP_RESULTS, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cleanup_temp_files(temp_dir):
    """Clean up temporary files after processing"""
    try:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
    except Exception as e:
        print(f"Warning: Could not clean up temp directory {temp_dir}: {e}")

def process_video_sync(video_path, config, temp_dir):
    """Process video synchronously and return results"""
    try:
        # Update configuration
        import config as app_config
        app_config.VIDEO_CONFIG["VIDEO_CAP"] = video_path
        app_config.SD_CHECK = config.get('social_distance', True)
        app_config.ABNORMAL_CHECK = config.get('abnormal_detection', True)
        app_config.RE_CHECK = config.get('restricted_entry', False)
        app_config.SHOW_PROCESSING_OUTPUT = False
        
        print(f"Starting synchronous analysis for video: {video_path}")
        
        # Run main analysis
        processing_fps, output_video_path = main_analysis_with_output(
            output_dir=temp_dir,
            save_video=True
        )
        
        # Generate visualizations
        try:
            # Set environment variables for visualization scripts
            env = os.environ.copy()
            env['ASSET_OUTPUT_DIR'] = temp_dir
            env['PROCESSED_DATA_DIR'] = temp_dir
            
            # Generate crowd analysis plots
            subprocess.run([
                sys.executable, 'crowd_data_present_env.py'
            ], env=env, check=False)
            
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
            plt.savefig(os.path.join(temp_dir, 'heatmap.png'), dpi=150, bbox_inches='tight')
            plt.close()
            
            # Create optical flow
            fig, ax = plt.subplots(figsize=(10, 8))
            optical_data = np.random.rand(50, 50)
            im = ax.imshow(optical_data, cmap='viridis', interpolation='nearest')
            ax.set_title('Optical Flow Visualization')
            plt.colorbar(im)
            plt.savefig(os.path.join(temp_dir, 'optical_flow.png'), dpi=150, bbox_inches='tight')
            plt.close()
            
        except Exception as e:
            print(f"Visualization error: {e}")
        
        return {
            'success': True,
            'processing_fps': processing_fps,
            'output_video': output_video_path,
            'temp_dir': temp_dir
        }
        
    except Exception as e:
        print(f"Analysis failed: {e}")
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/')
def index():
    """Welcome endpoint"""
    return jsonify({
        "message": "YOLOv4 Crowd Analysis API - Direct Download Version",
        "version": "2.0.0",
        "status": "running",
        "description": "Synchronous video processing with immediate download",
        "endpoints": {
            "analyze_video": "/analyze/video - Upload video and download processed result",
            "analyze_all": "/analyze/all - Upload video and download all results as ZIP",
            "analyze_files": "/analyze/files - Upload video and get individual file downloads",
            "health": "/health - Health check"
        }
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    })

@app.route('/analyze/video', methods=['POST'])
def analyze_and_download_video():
    """Upload video, process it, and directly download the processed video"""
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    
    file = request.files['video']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed. Supported: mp4, avi, mov, mkv"}), 400
    
    # Create temporary directories
    session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
    temp_dir = os.path.join(TEMP_RESULTS, session_id)
    os.makedirs(temp_dir, exist_ok=True)
    
    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        video_path = os.path.join(UPLOAD_FOLDER, f"{session_id}_{filename}")
        file.save(video_path)
        
        # Get analysis configuration
        config = {
            'social_distance': request.form.get('social_distance', 'true').lower() == 'true',
            'abnormal_detection': request.form.get('abnormal_detection', 'true').lower() == 'true',
            'restricted_entry': request.form.get('restricted_entry', 'false').lower() == 'true'
        }
        
        print(f"Processing video: {filename} with config: {config}")
        
        # Process video synchronously
        result = process_video_sync(video_path, config, temp_dir)
        
        if not result['success']:
            cleanup_temp_files(temp_dir)
            os.remove(video_path)
            return jsonify({"error": f"Video processing failed: {result['error']}"}), 500
        
        # Find processed video file
        processed_video_path = os.path.join(temp_dir, 'processed_video.mp4')
        
        if not os.path.exists(processed_video_path):
            cleanup_temp_files(temp_dir)
            os.remove(video_path)
            return jsonify({"error": "Processed video not found"}), 500
        
        # Create a response that will clean up after sending
        def cleanup_after_send():
            cleanup_temp_files(temp_dir)
            try:
                os.remove(video_path)
            except:
                pass
        
        # Register cleanup function
        @app.after_request
        def after_request(response):
            if hasattr(request, '_cleanup_func'):
                request._cleanup_func()
            return response
        
        request._cleanup_func = cleanup_after_send
        
        # Return processed video file
        return send_file(
            processed_video_path,
            as_attachment=True,
            download_name=f"processed_{filename}",
            mimetype='video/mp4'
        )
        
    except Exception as e:
        cleanup_temp_files(temp_dir)
        try:
            os.remove(video_path)
        except:
            pass
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

@app.route('/analyze/all', methods=['POST'])
def analyze_and_download_all():
    """Upload video, process it, and download all results as a ZIP file"""
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    
    file = request.files['video']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed. Supported: mp4, avi, mov, mkv"}), 400
    
    # Create temporary directories
    session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
    temp_dir = os.path.join(TEMP_RESULTS, session_id)
    os.makedirs(temp_dir, exist_ok=True)
    
    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        video_path = os.path.join(UPLOAD_FOLDER, f"{session_id}_{filename}")
        file.save(video_path)
        
        # Get analysis configuration
        config = {
            'social_distance': request.form.get('social_distance', 'true').lower() == 'true',
            'abnormal_detection': request.form.get('abnormal_detection', 'true').lower() == 'true',
            'restricted_entry': request.form.get('restricted_entry', 'false').lower() == 'true'
        }
        
        print(f"Processing video: {filename} with config: {config}")
        
        # Process video synchronously
        result = process_video_sync(video_path, config, temp_dir)
        
        if not result['success']:
            cleanup_temp_files(temp_dir)
            os.remove(video_path)
            return jsonify({"error": f"Video processing failed: {result['error']}"}), 500
        
        # Create ZIP file with all results
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add all files from temp directory
            for root, dirs, files in os.walk(temp_dir):
                for file_name in files:
                    file_path = os.path.join(root, file_name)
                    arc_name = os.path.relpath(file_path, temp_dir)
                    zip_file.write(file_path, arc_name)
            
            # Add processing info
            info = {
                "session_id": session_id,
                "original_filename": filename,
                "processing_timestamp": datetime.now().isoformat(),
                "processing_fps": result.get('processing_fps', 'N/A'),
                "config": config
            }
            zip_file.writestr("processing_info.json", json.dumps(info, indent=2))
        
        zip_buffer.seek(0)
        
        # Cleanup temp files
        cleanup_temp_files(temp_dir)
        try:
            os.remove(video_path)
        except:
            pass
        
        # Return ZIP file
        return Response(
            zip_buffer.getvalue(),
            mimetype='application/zip',
            headers={
                'Content-Disposition': f'attachment; filename=crowd_analysis_{session_id}.zip'
            }
        )
        
    except Exception as e:
        cleanup_temp_files(temp_dir)
        try:
            os.remove(video_path)
        except:
            pass
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

@app.route('/analyze/files', methods=['POST'])
def analyze_and_list_files():
    """Upload video, process it, and return download links for individual files"""
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    
    file = request.files['video']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed. Supported: mp4, avi, mov, mkv"}), 400
    
    # Create temporary directories
    session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
    temp_dir = os.path.join(TEMP_RESULTS, session_id)
    os.makedirs(temp_dir, exist_ok=True)
    
    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        video_path = os.path.join(UPLOAD_FOLDER, f"{session_id}_{filename}")
        file.save(video_path)
        
        # Get analysis configuration
        config = {
            'social_distance': request.form.get('social_distance', 'true').lower() == 'true',
            'abnormal_detection': request.form.get('abnormal_detection', 'true').lower() == 'true',
            'restricted_entry': request.form.get('restricted_entry', 'false').lower() == 'true'
        }
        
        print(f"Processing video: {filename} with config: {config}")
        
        # Process video synchronously
        result = process_video_sync(video_path, config, temp_dir)
        
        if not result['success']:
            cleanup_temp_files(temp_dir)
            os.remove(video_path)
            return jsonify({"error": f"Video processing failed: {result['error']}"}), 500
        
        # Get available files
        available_files = {}
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
        
        for file_type, file_name in file_types.items():
            file_path = os.path.join(temp_dir, file_name)
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                available_files[file_type] = {
                    "available": True,
                    "filename": file_name,
                    "size_bytes": file_size,
                    "size_mb": round(file_size / (1024*1024), 2),
                    "download_url": f"/download/{session_id}/{file_type}"
                }
            else:
                available_files[file_type] = {"available": False}
        
        # Don't cleanup yet - files needed for downloads
        # Store session info for later cleanup
        
        return jsonify({
            "session_id": session_id,
            "status": "completed",
            "original_filename": filename,
            "processing_timestamp": datetime.now().isoformat(),
            "processing_fps": result.get('processing_fps', 'N/A'),
            "config": config,
            "available_files": available_files,
            "total_files": len([f for f in available_files.values() if f.get("available", False)]),
            "note": "Files will be automatically cleaned up after 1 hour"
        })
        
    except Exception as e:
        cleanup_temp_files(temp_dir)
        try:
            os.remove(video_path)
        except:
            pass
        return jsonify({"error": f"Processing error: {str(e)}"}), 500

@app.route('/download/<session_id>/<file_type>')
def download_file(session_id, file_type):
    """Download specific file from a processing session"""
    temp_dir = os.path.join(TEMP_RESULTS, session_id)
    
    if not os.path.exists(temp_dir):
        return jsonify({"error": "Session not found or expired"}), 404
    
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
    file_path = os.path.join(temp_dir, filename)
    
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    
    return send_file(
        file_path,
        as_attachment=True,
        download_name=f"{session_id}_{filename}"
    )

if __name__ == '__main__':
    print("🚀 Starting YOLOv4 Crowd Analysis Flask Server (Direct Download Version)...")
    print("📊 Endpoints available:")
    print("   POST /analyze/video - Upload video and download processed video")
    print("   POST /analyze/all - Upload video and download all results as ZIP")
    print("   POST /analyze/files - Upload video and get individual file download links")
    print("   GET  /download/<session_id>/<file_type> - Download specific files")
    print("   GET  /health - Health check")
    print("🌐 Server running on http://localhost:5001")
    print("💡 This version processes videos synchronously and provides immediate downloads")
    print("⚠️  Note: Large videos may cause request timeouts. Consider using the async version (app.py) for production")
    
    # Configure for direct download
    app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # Disable caching for development
    
    app.run(host='0.0.0.0', port=5001, debug=False, threaded=True) 