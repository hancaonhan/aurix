/*
 * Đường dẫn công cụ ngoài dùng khi dựng video (chỉ chạy trên máy làm nội dung,
 * không liên quan máy chủ website).
 *
 *   FFMPEG_DIR  thư mục chứa ffmpeg.exe và ffprobe.exe; bỏ trống thì lấy từ PATH
 *   EDGE_PATH   đường dẫn msedge.exe (mặc định vị trí cài sẵn trên Windows)
 */
import { join } from 'node:path';

const dir = process.env.FFMPEG_DIR;
export const FFMPEG = dir ? join(dir, 'ffmpeg.exe') : 'ffmpeg';
export const FFPROBE = dir ? join(dir, 'ffprobe.exe') : 'ffprobe';
export const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
