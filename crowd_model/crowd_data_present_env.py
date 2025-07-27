import os
import sys
from datetime import datetime
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for cloud deployment
import matplotlib.pyplot as plt
import pandas as pd
import csv
import json
from matplotlib import colors
import cv2

# Get output directories from environment variables
ASSET_OUTPUT_DIR = os.environ.get('ASSET_OUTPUT_DIR', 'assets')
PROCESSED_DATA_DIR = os.environ.get('PROCESSED_DATA_DIR', 'processed_data')

# Ensure output directory exists
os.makedirs(ASSET_OUTPUT_DIR, exist_ok=True)

# Read crowd data
human_count = []
violate_count = []
restricted_entry = []
abnormal_activity = []

crowd_data_file = os.path.join(PROCESSED_DATA_DIR, 'crowd_data.csv')
if os.path.exists(crowd_data_file):
    with open(crowd_data_file, 'r') as file:
        reader = csv.reader(file, delimiter=',')
        next(reader)  # Skip header
        for row in reader:
            if len(row) >= 5:  # Skip empty rows
                human_count.append(int(row[1]))
                violate_count.append(int(row[2]))
                restricted_entry.append(bool(int(row[3])))
                abnormal_activity.append(bool(int(row[4])))

# Read video data
video_data_file = os.path.join(PROCESSED_DATA_DIR, 'video_data.json')
if os.path.exists(video_data_file):
    with open(video_data_file, 'r') as file:
        video_data = json.load(file)
else:
    video_data = {"VID_FPS": 20, "DATA_RECORD_FRAME": 1}

VID_FPS = video_data.get("VID_FPS", 20)
DATA_RECORD_FRAME = video_data.get("DATA_RECORD_FRAME", 1)

if len(human_count) > 0:
    # Create plots
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('Crowd Analysis Results', fontsize=16)
    
    # Time array
    time_array = np.arange(len(human_count)) * DATA_RECORD_FRAME / VID_FPS
    
    # Plot 1: Crowd Count
    ax1.plot(time_array, human_count, 'b-', linewidth=2)
    ax1.set_title('Crowd Count Over Time')
    ax1.set_xlabel('Time (seconds)')
    ax1.set_ylabel('Number of People')
    ax1.grid(True, alpha=0.3)
    
    # Plot 2: Social Distance Violations
    ax2.plot(time_array, violate_count, 'r-', linewidth=2)
    ax2.set_title('Social Distance Violations')
    ax2.set_xlabel('Time (seconds)')
    ax2.set_ylabel('Violation Count')
    ax2.grid(True, alpha=0.3)
    
    # Plot 3: Restricted Entry Events
    restricted_times = [t for t, r in zip(time_array, restricted_entry) if r]
    ax3.scatter(restricted_times, [1]*len(restricted_times), c='orange', s=50, alpha=0.7)
    ax3.set_title('Restricted Entry Violations')
    ax3.set_xlabel('Time (seconds)')
    ax3.set_ylabel('Event Occurrence')
    ax3.set_ylim(0, 2)
    ax3.grid(True, alpha=0.3)
    
    # Plot 4: Abnormal Activity
    abnormal_times = [t for t, a in zip(time_array, abnormal_activity) if a]
    ax4.scatter(abnormal_times, [1]*len(abnormal_times), c='purple', s=50, alpha=0.7)
    ax4.set_title('Abnormal Activity Detection')
    ax4.set_xlabel('Time (seconds)')
    ax4.set_ylabel('Event Occurrence')
    ax4.set_ylim(0, 2)
    ax4.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # Save crowd data plot
    crowd_plot_path = os.path.join(ASSET_OUTPUT_DIR, 'crowd data.png')
    plt.savefig(crowd_plot_path, dpi=150, bbox_inches='tight')
    print(f"Crowd data plot saved: {crowd_plot_path}")
    
    # Save individual plots for API endpoints
    
    # Social Distance Plot
    plt.figure(figsize=(10, 6))
    plt.plot(time_array, violate_count, 'r-', linewidth=2)
    plt.title('Social Distance Violations Over Time')
    plt.xlabel('Time (seconds)')
    plt.ylabel('Violation Count')
    plt.grid(True, alpha=0.3)
    social_plot_path = os.path.join(ASSET_OUTPUT_DIR, 'social distance.png')
    plt.savefig(social_plot_path, dpi=150, bbox_inches='tight')
    print(f"Social distance plot saved: {social_plot_path}")
    
    # Detection Plot (Crowd Count)
    plt.figure(figsize=(10, 6))
    plt.plot(time_array, human_count, 'b-', linewidth=2)
    plt.title('People Detection Over Time')
    plt.xlabel('Time (seconds)')
    plt.ylabel('Number of People Detected')
    plt.grid(True, alpha=0.3)
    detection_plot_path = os.path.join(ASSET_OUTPUT_DIR, 'detection.png')
    plt.savefig(detection_plot_path, dpi=150, bbox_inches='tight')
    print(f"Detection plot saved: {detection_plot_path}")
    
    plt.close('all')
    print("Crowd data visualization completed!")
else:
    print("No crowd data found to visualize") 