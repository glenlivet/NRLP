package org.kwan.nrlp.message;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;

import org.kwan.nrlp.Protocol;

public class ProposalProvision {

	private int requestCode; // 2 bytes
	private String resourceName; // UTF8
	private int resourceType; // 2 bytes
	private long resourceSize; // multiByteInteger
	private String providerId; // UTF-8
	private int transmissionType; // 1byte
	private int transmissionSpeed; // 2bytes

	public int getRequestCode() {
		return requestCode;
	}

	public void setRequestCode(int requestCode) {
		this.requestCode = requestCode;
	}

	public long getResourceSize() {
		return resourceSize;
	}

	public void setResourceSize(long resourceSize) {
		this.resourceSize = resourceSize;
	}

	public String getProviderId() {
		return providerId;
	}

	public void setProviderId(String providerId) {
		this.providerId = providerId;
	}

	public int getTransmissionType() {
		return transmissionType;
	}

	public void setTransmissionType(int transmissionType) {
		this.transmissionType = transmissionType;
	}

	public int getTransmissionSpeed() {
		return transmissionSpeed;
	}

	public void setTransmissionSpeed(int transmissionSpeed) {
		this.transmissionSpeed = transmissionSpeed;
	}

	public byte[] toBuffer() throws IOException {

		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		DataOutputStream dos = new DataOutputStream(baos);
		// 请求号
		dos.writeShort(this.requestCode);
		// 资源名称
		dos.writeUTF(this.resourceName);
		// 资源类型
		dos.writeShort(this.resourceType);

		// 资源大小
		dos.write(Protocol.encodeMBI(this.resourceSize));
		// 资源提供者的唯一ID
		dos.writeUTF(this.providerId);
		// 传输方式
		dos.writeByte(this.transmissionType);
		// 传输速度
		dos.writeShort(this.transmissionSpeed);
		
		byte[] head = Protocol.getProtocolHead(Protocol.PROTOCOL_BROADCAST_REQUEST);
		ByteBuffer buf = ByteBuffer.allocate(head.length + baos.toByteArray().length);
		buf.put(head);
		buf.put(baos.toByteArray());
		System.out.println(buf.array().length);

		return buf.array();
	}

	public static ProposalProvision build(byte[] buffer) throws IOException {
		ProposalProvision proposal = new ProposalProvision();

		ByteBuffer buf = ByteBuffer.wrap(buffer);
		// remove head
		int remLength = buffer.length - 8;
		ByteBuffer rest = ByteBuffer.allocate(remLength);
		rest.put(buffer, 8, remLength);
		ByteArrayInputStream s = new ByteArrayInputStream(rest.array());
		DataInputStream dis = new DataInputStream(s);
		// request code
		proposal.requestCode = dis.readUnsignedShort();
		proposal.resourceName = dis.readUTF();
		proposal.resourceType = dis.readUnsignedShort();
		// read the size if is static
		if (proposal.resourceType < Protocol.PROTOCOL_RESTYPE_DYNAMIC) {
			proposal.resourceSize = Protocol.readMBI(dis).getValue();
		}
		// read the provider id
		proposal.providerId = dis.readUTF();
		// read the transmission type
		proposal.transmissionType = dis.readByte();
		// read the transmisionSpeed
		if (proposal.transmissionType == Protocol.PROTOCOL_TRANSTYPE_RETRYABLE) {
			proposal.transmissionSpeed = dis.readUnsignedShort();
		}
		return proposal;

	}
	
	public static void main(String[] args) throws IOException {
		ProposalProvision proposal = new ProposalProvision();
		proposal.providerId = "aa";
		proposal.requestCode = 2;
		proposal.resourceName = "bb";
		proposal.resourceSize = 123l;
		proposal.resourceType = Protocol.PROTOCOL_RESTYPE_FILE;
		proposal.transmissionSpeed = 11;
		proposal.transmissionType = Protocol.PROTOCOL_TRANSTYPE_ONESHOT;
		
		//
		byte[] buffer = proposal.toBuffer();
		
		ProposalProvision.build(buffer);
	}

}
