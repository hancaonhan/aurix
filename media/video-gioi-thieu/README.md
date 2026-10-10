# Video giới thiệu Aurix (9:16, ~60 giây)

Công cụ dựng video, chạy trên máy làm nội dung (Windows). Không liên quan máy
chủ website và không thêm phụ thuộc nào vào `package.json`.

Cần: Node 22+, Microsoft Edge (có sẵn trên Windows), ffmpeg
(<https://github.com/BtbN/FFmpeg-Builds/releases>, giải nén rồi trỏ `FFMPEG_DIR`
vào thư mục `bin`).

## Dựng lại

```bash
cd media/video-gioi-thieu
export FFMPEG_DIR="/đường/dẫn/ffmpeg/bin"
node tts.mjs          # đọc kịch bản → voice/*.mp3 (+ mốc thời gian từng từ)
node timeline.mjs     # thời lượng thật từng câu → timeline.json
node render.mjs stills 3 11 19 37 47 53 58   # xem thử vài khung (PNG trong stills/)
node render.mjs video # dựng 30 hình/giây → video-only.mp4 (~3 phút)
node audio.mjs        # giọng + nhạc + hiệu ứng → mix.wav (~ −15 LUFS)
node finalize.mjs     # ghép, xuất bản mạng xã hội + bản website + ảnh bìa + phụ đề
```

## Sửa gì thì vào đâu

| Việc | Tệp |
| --- | --- |
| Lời thoại, giọng đọc, tốc độ | `script.mjs` — sửa câu nào thì xoá `voice/<id>.mp3` của câu đó rồi chạy lại `tts.mjs` |
| Bố cục, chữ trên hình, chuyển động | `render.html` (hàm `render(t)`) |
| Nhạc nền, hiệu ứng, mức âm | `audio.mjs` |
| Khoảng nghỉ giữa câu, giữa cảnh | `timeline.mjs` |

Mọi chuyển động là hàm thuần của thời điểm `t`, nên khung nào dựng lại cũng ra
đúng hình đó. Sửa lời thì thời lượng cảnh tự co giãn theo giọng đọc mới.

Đổi video trên website: tăng số phiên bản trong tên tệp ở `finalize.mjs` và
`site/data/video.js` (thư mục `/assets/` được trình duyệt giữ một năm).

Giọng đọc và giấy phép: xem mục Video trong `BRAND.md`.
