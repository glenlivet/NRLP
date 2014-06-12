package org.kwan.nrlp;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;

public class Protocol {
	
	public static final String PROTOCOL_NAME = "NRLP";
	public static final int PROTOCOL_VERSION = 1;
	
	public static final int PROTOCOL_BROADCAST_REQUEST = 1;
	public static final int PROTOCOL_PROPOSAL_PROVISION = 2;
	public static final int PROTOCOL_OFFICIAL_REQUEST = 3;
	public static final int PROTOCOL_OFFICIAL_RESPONSE = 4;
	public static final int PROTOCOL_TRANSMISSION_REQUEST = 5;
	public static final int PROTOCOL_FINAL_RESPONSE = 6;
	
	public static final int PROTOCOL_ERROR_INCOMPLETE = 0;
	public static final int PROTOCOL_ERROR_INCOMPATIBLE_VERSION = -1;
	public static final int PROTOCOL_ERROR_UNKNOWN_PROTOCOL_NAME = -2;
	public static final int PROTOCOL_ERROR_UNKNOWN_MESSAGE_TYPE = -3;
	
	public static final int PROTOCOL_RESTYPE_STATIC = 0;
	public static final int PROTOCOL_RESTYPE_FILE	= 1;
	public static final int PROTOCOL_RESTYPE_DYNAMIC = 30000;
	
	public static final int PROTOCOL_TRANSTYPE_ONESHOT = 0;
	public static final int PROTOCOL_TRANSTYPE_RETRYABLE = 1;
	public static final int PROTOCOL_TRANSTYPE_CUTANDPASTE = 2;
	
	public static byte[] getProtocolNameBuffer() throws IOException{
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		DataOutputStream dos = new DataOutputStream(baos);
		dos.writeUTF(PROTOCOL_NAME);
		return baos.toByteArray();
		
	}
	
	public static byte[] getProtocolVersionBuffer(){
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		baos.write(PROTOCOL_VERSION);
		return baos.toByteArray();
	}
	
	public static byte[] getProtocolHead(int type) throws IOException{
		//write the name of protocol
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		DataOutputStream dos = new DataOutputStream(baos);
		dos.writeUTF(PROTOCOL_NAME);
		//write version
		dos.writeByte(PROTOCOL_VERSION);
		//write type
		dos.writeByte(type);
		
		return baos.toByteArray();
	}
	
	public static void main(String[] args) throws IOException {
		byte[] bs = getProtocolHead(PROTOCOL_OFFICIAL_RESPONSE);
		for(int i=0;i<bs.length; i++){
			System.out.println(bs[i]);
		}
	}
	
	
	
}
