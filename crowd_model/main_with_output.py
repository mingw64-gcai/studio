from config import YOLO_CONFIG, VIDEO_CONFIG, SHOW_PROCESSING_OUTPUT, DATA_RECORD_RATE, FRAME_SIZE, TRACK_MAX_AGE

if FRAME_SIZE > 1920:
	print("Frame size is too large!")
	quit()
elif FRAME_SIZE < 480:
	print("Frame size is too small! You won't see anything")
	quit()

import datetime
import time
import numpy as np
import imutils
import cv2
import os
import csv
import json
from video_process_with_output import video_process_with_output
from deep_sort import nn_matching
from deep_sort.detection import Detection
from deep_sort.tracker import Tracker
from deep_sort import generate_detections as gdet

def main_analysis_with_output(output_dir="processed_data", save_video=True):
	"""
	Main analysis function that saves processed video with overlays
	"""
	# Read from video
	IS_CAM = VIDEO_CONFIG["IS_CAM"]
	cap = cv2.VideoCapture(VIDEO_CONFIG["VIDEO_CAP"])

	# Set up tracking
	max_cosine_distance = 0.5
	nn_budget = None
	nms_max_overlap = 0.8

	model_filename = 'model_data/mars-small128.pb'
	encoder = gdet.create_box_encoder(model_filename, batch_size=1)
	metric = nn_matching.NearestNeighborDistanceMetric("cosine", max_cosine_distance, nn_budget)
	tracker = Tracker(metric, max_age=TRACK_MAX_AGE)

	# Load YOLO
	print("Loading YOLO...")
	net = cv2.dnn.readNet(YOLO_CONFIG["WEIGHTS_PATH"], YOLO_CONFIG["CONFIG_PATH"])
	ln = net.getLayerNames()
	ln = [ln[i - 1] for i in net.getUnconnectedOutLayers()]
	print("YOLO loaded successfully")

	# Create output directory
	os.makedirs(output_dir, exist_ok=True)

	# Set up CSV writers
	movement_data_file = open(f'{output_dir}/movement_data.csv', 'w', newline='')
	movement_data_writer = csv.writer(movement_data_file, delimiter=',')
	crowd_data_file = open(f'{output_dir}/crowd_data.csv', 'w', newline='')
	crowd_data_writer = csv.writer(crowd_data_file, delimiter=',')

	# CSV headers
	movement_data_writer.writerow(['track_id', 'entry_time', 'exit_time'] + [f'x{i}' for i in range(1, 11)] + [f'y{i}' for i in range(1, 11)])
	crowd_data_writer.writerow(['time', 'human_count', 'violation_count', 'restricted_entry', 'abnormal_activity'])

	# Set output video path
	output_video_path = None
	if save_video:
		output_video_path = f'{output_dir}/processed_video.mp4'

	# Record start time
	START_TIME = datetime.datetime.now()
	print(f"Starting analysis at: {START_TIME}")

	# Process video with output
	print("Processing video...")
	processing_FPS = video_process_with_output(
		cap, FRAME_SIZE, net, ln, encoder, tracker, 
		movement_data_writer, crowd_data_writer, 
		output_video_path, START_TIME
	)

	# Cleanup
	cv2.destroyAllWindows()
	movement_data_file.close()
	crowd_data_file.close()

	END_TIME = time.time()
	START_TIME_EPOCH = time.mktime(START_TIME.timetuple())
	PROCESS_TIME = END_TIME - START_TIME_EPOCH
	print("Time elapsed: ", PROCESS_TIME)

	if IS_CAM:
		print("Processed FPS: ", processing_FPS)
		VID_FPS = processing_FPS
		DATA_RECORD_FRAME = 1
	else:
		print("Processed FPS: ", round(cap.get(cv2.CAP_PROP_FRAME_COUNT) / PROCESS_TIME, 2))
		VID_FPS = cap.get(cv2.CAP_PROP_FPS)
		DATA_RECORD_FRAME = int(VID_FPS / DATA_RECORD_RATE)
		time_elapsed = round(cap.get(cv2.CAP_PROP_FRAME_COUNT) / VID_FPS)
		END_TIME = START_TIME + datetime.timedelta(seconds=time_elapsed)

	cap.release()

	# Save video metadata
	video_data = {
		"IS_CAM": IS_CAM,
		"DATA_RECORD_FRAME": DATA_RECORD_FRAME,
		"VID_FPS": VID_FPS,
		"PROCESSED_FRAME_SIZE": FRAME_SIZE,
		"TRACK_MAX_AGE": TRACK_MAX_AGE,
		"START_TIME": START_TIME.strftime("%d/%m/%Y, %H:%M:%S"),
		"END_TIME": END_TIME.strftime("%d/%m/%Y, %H:%M:%S") if isinstance(END_TIME, datetime.datetime) else str(END_TIME),
		"PROCESSED_VIDEO_PATH": output_video_path if save_video else None,
		"OUTPUT_DIRECTORY": output_dir
	}

	with open(f'{output_dir}/video_data.json', 'w') as video_data_file:
		json.dump(video_data, video_data_file)

	print(f"Analysis complete. Results saved to: {output_dir}")
	if save_video and output_video_path:
		print(f"Processed video saved to: {output_video_path}")

	return processing_FPS, output_video_path

if __name__ == "__main__":
	main_analysis_with_output() 