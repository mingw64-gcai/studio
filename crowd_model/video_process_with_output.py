import time
import datetime
import numpy as np
import imutils
import cv2
import time
import os
from math import ceil
from scipy.spatial.distance import euclidean
from tracking import detect_human
from util import rect_distance, progress, kinetic_energy
from colors import RGB_COLORS
from config import SHOW_DETECT, DATA_RECORD, RE_CHECK, RE_START_TIME, RE_END_TIME, SD_CHECK, SHOW_VIOLATION_COUNT, SHOW_TRACKING_ID, SOCIAL_DISTANCE,\
	SHOW_PROCESSING_OUTPUT, YOLO_CONFIG, VIDEO_CONFIG, DATA_RECORD_RATE, ABNORMAL_CHECK, ABNORMAL_ENERGY, ABNORMAL_THRESH, ABNORMAL_MIN_PEOPLE
from deep_sort import nn_matching
from deep_sort.detection import Detection
from deep_sort.tracker import Tracker
from deep_sort import generate_detections as gdet
IS_CAM = VIDEO_CONFIG["IS_CAM"]
HIGH_CAM = VIDEO_CONFIG["HIGH_CAM"]

def _record_movement_data(movement_data_writer, movement):
	track_id = movement.track_id 
	entry_time = movement.entry 
	exit_time = movement.exit			
	positions = movement.positions
	positions = np.array(positions).flatten()
	positions = list(positions)
	data = [track_id] + [entry_time] + [exit_time] + positions
	movement_data_writer.writerow(data)

def _record_crowd_data(time, human_count, violate_count, restricted_entry, abnormal_activity, crowd_data_writer):
	data = [time, human_count, violate_count, int(restricted_entry), int(abnormal_activity)]
	crowd_data_writer.writerow(data)

def _end_video(tracker, frame_count, movement_data_writer):
	for t in tracker.tracks:
		if t.is_confirmed():
			t.exit = frame_count
			_record_movement_data(movement_data_writer, t)

def video_process_with_output(cap, frame_size, net, ln, encoder, tracker, movement_data_writer, crowd_data_writer, output_video_path=None, start_time=None):
	"""
	Enhanced video processing that saves processed video with overlays
	"""
	def _calculate_FPS():
		t1 = time.time() - t0
		VID_FPS = frame_count / t1

	if IS_CAM:
		VID_FPS = None
		DATA_RECORD_FRAME = 1
		TIME_STEP = 1
	else:
		VID_FPS = cap.get(cv2.CAP_PROP_FPS)
		DATA_RECORD_FRAME = int(VID_FPS / DATA_RECORD_RATE)
		TIME_STEP = 1 / VID_FPS

	frame_count = 0
	sd_warning_timeout = 0
	re_warning_timeout = 0
	ab_warning_timeout = 0
	t0 = time.time()

	# Initialize video writer for output - will be created after first frame processing
	video_writer = None
	output_width = frame_size  # Use processed frame size
	output_height = None  # Will be calculated based on aspect ratio

	# Set start time
	if start_time is None:
		start_time = datetime.datetime.now()

	# Main processing loop
	while True:
		ret, frame = cap.read()
		if not ret:
			break

		display_frame_count = frame_count + 1
		frame_count += 1

		# Resize to speed up detection
		frame = imutils.resize(frame, width=frame_size)
		
		# Initialize video writer with correct dimensions after first frame resize
		if output_video_path and video_writer is None:
			output_height, output_width = frame.shape[:2]
			fourcc = cv2.VideoWriter_fourcc(*'mp4v')
			video_writer = cv2.VideoWriter(
				output_video_path, 
				fourcc, 
				VID_FPS if VID_FPS else 20.0, 
				(output_width, output_height)
			)
			print(f"Video writer initialized: {output_width}x{output_height}")

		# Record current time for data recording
		if not IS_CAM:
			record_time = start_time + datetime.timedelta(seconds=frame_count / VID_FPS)
		else:
			record_time = datetime.datetime.now()

		# Detect humans
		[humans_detected, expired] = detect_human(net, ln, frame, encoder, tracker, record_time)

		# Violation count
		violate_set = set()

		# Initialize abnormal activity tracking
		ABNORMAL = False
		abnormal_individual = []

		# Restricted entry check
		RE = False
		if RE_CHECK:
			current_time = record_time.time()
			if RE_START_TIME <= current_time <= RE_END_TIME:
				RE = True

		if humans_detected:
			# Initialize violation count array
			violate_count = np.zeros(len(humans_detected))

			for i, track in enumerate(humans_detected):
				# Get bounding box
				[x, y, w, h] = list(map(int, track.to_tlbr().tolist()))
				[cx, cy] = list(map(int, track.positions[-1]))
				idx = track.track_id

				# Social distance check
				if SD_CHECK and len(humans_detected) >= 2:
					for j, track_2 in enumerate(humans_detected[i+1:], start=i+1):
						if HIGH_CAM:
							[cx_2, cy_2] = list(map(int, track_2.positions[-1]))
							distance = euclidean((cx, cy), (cx_2, cy_2))
						else:
							[x_2, y_2, w_2, h_2] = list(map(int, track_2.to_tlbr().tolist()))
							distance = rect_distance((x, y, w, h), (x_2, y_2, w_2, h_2))
						if distance < SOCIAL_DISTANCE:
							violate_set.add(i)
							violate_count[i] += 1
							violate_set.add(j)
							violate_count[j] += 1

				# Abnormal activity check
				if ABNORMAL_CHECK and len(track.positions) >= 2:
					ke = kinetic_energy(track.positions[-1], track.positions[-2], TIME_STEP)
					if ke > ABNORMAL_ENERGY:
						abnormal_individual.append(track.track_id)

				# Draw bounding boxes with different colors
				if RE:
					cv2.rectangle(frame, (x + 5, y + 5), (w - 5, h - 5), RGB_COLORS["red"], 5)
				elif i in violate_set:
					cv2.rectangle(frame, (x, y), (w, h), RGB_COLORS["yellow"], 2)
					if SHOW_VIOLATION_COUNT:
						cv2.putText(frame, str(int(violate_count[i])), (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, RGB_COLORS["yellow"], 2)
				elif SHOW_DETECT:
					cv2.rectangle(frame, (x, y), (w, h), RGB_COLORS["green"], 2)
					if SHOW_VIOLATION_COUNT:
						cv2.putText(frame, str(int(violate_count[i])), (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, RGB_COLORS["green"], 2)

				# Show tracking ID
				if SHOW_TRACKING_ID:
					cv2.putText(frame, str(int(idx)), (x, y - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, RGB_COLORS["white"], 2)

			# Check overall abnormal activity
			if len(humans_detected) > ABNORMAL_MIN_PEOPLE:
				if len(abnormal_individual) / len(humans_detected) > ABNORMAL_THRESH:
					ABNORMAL = True

		# Add warning text overlays
		if SD_CHECK:
			if len(violate_set) > 0:
				sd_warning_timeout = 10
			else:
				sd_warning_timeout -= 1
			if sd_warning_timeout > 0:
				text = "Violation count: {}".format(len(violate_set))
				cv2.putText(frame, text, (200, frame.shape[0] - 30),
					cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)

		if RE_CHECK:
			if RE:
				re_warning_timeout = 10
			else:
				re_warning_timeout -= 1
			if re_warning_timeout > 0:
				if display_frame_count % 3 != 0:
					cv2.putText(frame, "RESTRICTED ENTRY", (200, 100),
						cv2.FONT_HERSHEY_SIMPLEX, 1, RGB_COLORS["red"], 3)

		if ABNORMAL_CHECK:
			if ABNORMAL:
				ab_warning_timeout = 10
				for track in humans_detected:
					if track.track_id in abnormal_individual:
						[x, y, w, h] = list(map(int, track.to_tlbr().tolist()))
						cv2.rectangle(frame, (x, y), (w, h), RGB_COLORS["blue"], 5)
			else:
				ab_warning_timeout -= 1
			if ab_warning_timeout > 0:
				if display_frame_count % 3 != 0:
					cv2.putText(frame, "ABNORMAL ACTIVITY", (130, 250),
						cv2.FONT_HERSHEY_SIMPLEX, 1.5, RGB_COLORS["blue"], 5)

		# Add crowd count
		if SHOW_DETECT:
			text = "Crowd count: {}".format(len(humans_detected))
			cv2.putText(frame, text, (10, 30),
				cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 3)

		# Record data
		if DATA_RECORD:
			_record_crowd_data(record_time, len(humans_detected), len(violate_set), RE, ABNORMAL, crowd_data_writer)

		# Write frame to output video
		if video_writer:
			video_writer.write(frame)

		# Optional display (for local debugging)
		if SHOW_PROCESSING_OUTPUT:
			cv2.imshow("Processed Output", frame)
			if cv2.waitKey(1) & 0xFF == ord('q'):
				break
		else:
			progress(display_frame_count)

	# Cleanup
	if video_writer:
		video_writer.release()
	cv2.destroyAllWindows()
	
	# End tracking
	_end_video(tracker, frame_count, movement_data_writer)
	
	if not VID_FPS and IS_CAM:
		_calculate_FPS()
	
	return VID_FPS 