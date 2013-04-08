package com.taobao.f2e;

public class ArrayUtils {
	public static int indexOf(String[] arr, String item) {
		for (int i = 0; i < arr.length; i++) {
			if (arr[i].equals(item)) return i;
		}
		return -1;
	}

	public static String join(String[] attr, String sep) {
		StringBuilder sb = new StringBuilder();
		for (String a : attr) {
			sb.append(a);
			sb.append(sep);
		}
		String re = sb.toString();
		//remove last sep
		if (re.length() > 0) {
			return re.substring(0, re.length() - sep.length());
		} else {
			return re;
		}
	}
}
