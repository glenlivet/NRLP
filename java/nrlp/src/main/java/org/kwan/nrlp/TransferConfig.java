package org.kwan.nrlp;

public class TransferConfig {
	
	
	
	/**
	 * 传输类型
	 */
	public int type;
	
	/**
	 * 传输速度
	 */
	public int speed;
	
	public TransferConfig(int type, int speed){
		this.type = type;
		this.speed = speed;
	}

	public int getType() {
		return type;
	}

	public int getSpeed() {
		return speed;
	}
	
}
