import React from 'react';

/**
 * ImagePicker component
 * Props:
 *  - value: current Base64 image string (or null)
 *  - onChange: callback(base64String)
 *  - placeholder: emoji or text to show when no image
 *  - label: label text
 *  - shape: 'circle' | 'rect' (default: 'rect')
 */
export default function ImagePicker({ value, onChange, placeholder = '🖼️', label = 'อัปโหลดรูป', shape = 'rect' }) {
    const inputRef = React.useRef();
    const [sizeError, setSizeError] = React.useState('');

    const MAX_SIZE_MB = 5;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ตรวจสอบขนาดไฟล์
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > MAX_SIZE_MB) {
            setSizeError(`⚠️ รูปภาพใหญ่เกินไป (${sizeMB.toFixed(1)} MB) กรุณาใช้รูปที่ขนาดไม่เกิน ${MAX_SIZE_MB} MB`);
            e.target.value = ''; // reset input
            return;
        }

        setSizeError('');
        // แปลงเป็น Base64
        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const isCircle = shape === 'circle';

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Preview */}
            <div
                onClick={() => inputRef.current?.click()}
                className={`relative cursor-pointer overflow-hidden border-2 border-dashed border-gray-200 hover:border-yellow-400 transition bg-gray-50 flex items-center justify-center
                    ${isCircle ? 'w-24 h-24 rounded-full' : 'w-full h-36 rounded-2xl'}`}
            >
                {value ? (
                    <img src={value} alt="preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center">
                        <p className="text-3xl">{placeholder}</p>
                        <p className="text-xs text-gray-400 mt-1">{label}</p>
                    </div>
                )}
                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                    <p className="text-white text-xs font-bold">📷 เปลี่ยนรูป</p>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {sizeError && (
                <p className="text-xs text-red-500 font-bold text-center px-2">{sizeError}</p>
            )}

            {value && !sizeError && (
                <button
                    type="button"
                    onClick={() => { onChange(null); setSizeError(''); }}
                    className="text-xs text-red-400 hover:text-red-600 font-bold"
                >
                    ✕ ลบรูป
                </button>
            )}
        </div>
    );
}
