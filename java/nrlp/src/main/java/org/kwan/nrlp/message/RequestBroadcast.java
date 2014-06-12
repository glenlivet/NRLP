package org.kwan.nrlp.message;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;

import org.kwan.nrlp.Protocol;


public class RequestBroadcast {
	
	private String requesterId;
	
	private int requestCode;
	
	private String resourceName;
	
	private int resourceType;
	
	private int transmissionType;

	public String getRequesterId() {
		return requesterId;
	}

	public void setRequesterId(String requesterId) {
		this.requesterId = requesterId;
	}

	public int getRequestCode() {
		return requestCode;
	}

	public void setRequestCode(int requestCode) {
		this.requestCode = requestCode;
	}

	public String getResourceName() {
		return resourceName;
	}

	public void setResourceName(String resourceName) {
		this.resourceName = resourceName;
	}

	public int getResourceType() {
		return resourceType;
	}

	public void setResourceType(int resourceType) {
		this.resourceType = resourceType;
	}

	public int getTransmissionType() {
		return transmissionType;
	}

	public void setTransmissionType(int transmissionType) {
		this.transmissionType = transmissionType;
	}
	
	public byte[] toBuffer() throws IOException{
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		DataOutputStream dos = new DataOutputStream(baos);
		//
		dos.writeUTF(this.requesterId);
		//
		dos.writeShort(this.requestCode);
		//
		dos.writeUTF(this.resourceName);
		// 
		dos.writeShort(this.resourceType);
		//
		dos.writeByte(this.transmissionType);
		
		byte[] head = Protocol.getProtocolHead(Protocol.PROTOCOL_BROADCAST_REQUEST);
		ByteBuffer buf = ByteBuffer.allocate(head.length + baos.toByteArray().length);
		buf.put(head);
		buf.put(baos.toByteArray());
		System.out.println(buf.array().length);
		return buf.array();
	}
	
	public static RequestBroadcast build(byte[] buffer) throws IOException{
		RequestBroadcast rb = new RequestBroadcast();
		
		ByteBuffer buf = ByteBuffer.wrap(buffer);
		//remove head
		int remLength = buffer.length - 8;
		ByteBuffer rest = ByteBuffer.allocate(remLength);
		rest.put(buffer, 8, remLength);
		ByteArrayInputStream s = new ByteArrayInputStream(rest.array());
		DataInputStream dis = new DataInputStream(s);
		rb.setRequesterId(dis.readUTF());
		System.out.println(rb.getRequesterId());
		rb.setRequestCode(dis.readUnsignedShort());
		rb.setResourceName(dis.readUTF());
		rb.setResourceType(dis.readUnsignedShort());
		rb.setTransmissionType(dis.readUnsignedByte());
		return rb;
	} 
	
	public static void main(String[] args) throws IOException {
		RequestBroadcast rb = new RequestBroadcast();
		rb.setRequestCode(123);
		rb.setRequesterId("fage");
		rb.setResourceName("fffffffff");
		rb.setResourceType(1);
		rb.setTransmissionType(2);
		RequestBroadcast.build(rb.toBuffer());
	}
	
	
	
}
