import socket
import cv2
import pickle
import struct

# Initialize server socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind(('0.0.0.0', 9999))
server_socket.listen(5)
print("Listening for connections...")

client_socket, addr = server_socket.accept()
print(f"Connected to: {addr}")

# Open Webcam (0 is default built-in camera)
cap = cv2.VideoCapture(0)

try:
    frame_id = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_id += 1
        # Custom string data to bundle with the video frame
        metadata_string = f"Camera_01 | Frame: {frame_id} | Status: Active"
        
        # Package string and frame together into a tuple object
        payload = (metadata_string, frame)
        
        # Serialize the combined data into a byte stream
        serialized_data = pickle.dumps(payload)
        
        # Pack payload size into an 8-byte big-endian unsigned long long ('!Q')
        message_header = struct.pack("!Q", len(serialized_data))
        
        # Send header followed immediately by the serialized data
        client_socket.sendall(message_header + serialized_data)
        
        # Show local preview
        cv2.imshow("Sender Preview", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
finally:
    cap.release()
    client_socket.close()
    server_socket.close()
    cv2.destroyAllWindows()



# ######################## unpack at client#######################################

import socket
import cv2
import pickle
import struct

# Connect to the server
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect(('127.0.0.1', 9999)) # Change to server IP if remote

data_buffer = b""
header_size = struct.calcsize("!Q") # 8 bytes

try:
    while True:
        # Step 1: Retrieve the message header to find payload size
        while len(data_buffer) < header_size:
            packet = client_socket.recv(4096)
            if not packet: 
                break
            data_buffer += packet
            
        if not data_buffer:
            break
            
        # Split header out and unpack the exact message length
        packed_msg_size = data_buffer[:header_size]
        data_buffer = data_buffer[header_size:]
        msg_size = struct.unpack("!Q", packed_msg_size)[0]
        
        # Step 2: Retrieve the entire serialized payload based on extracted size
        while len(data_buffer) < msg_size:
            packet = client_socket.recv(4096)
            if not packet:
                break
            data_buffer += packet
            
        # Extract the complete serialized chunk
        msg_payload = data_buffer[:msg_size]
        data_buffer = data_buffer[msg_size:]
        
        # Step 3: Unpickle the data back into the text string and frame
        metadata_string, frame = pickle.loads(msg_payload)
        
        # Print the received text stream to the console
        print(f"Received Text: {metadata_string}")
        
        # Display the video frame
        cv2.imshow("Receiver Stream", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
finally:
    client_socket.close()
    cv2.destroyAllWindows()
