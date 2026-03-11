import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import WorkScheduleService from '../../services/WorkScheduleService';
import { FaArrowLeft, FaClock, FaBullseye, FaStickyNote } from 'react-icons/fa';

export default function ClientScheduleDetail() {
    const { id } = useParams(); // Lấy ID từ URL
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Gọi API lấy chi tiết lịch (Bạn cần đảm bảo Service có hàm getById)
                const res = await WorkScheduleService.getById(id);
                setTask(res.data);
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Đang tải thông tin nhiệm vụ...</div>;
    if (!task) return <div className="p-10 text-center text-red-500">Không tìm thấy nhiệm vụ!</div>;

    // Tính trạng thái thời gian
    const now = new Date();
    const endTime = new Date(task.endTime);
    const isOverdue = now > endTime;

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {/* Header màu sắc tùy theo trạng thái */}
            <div className={`p-6 text-white ${isOverdue ? 'bg-red-600' : 'bg-emerald-600'}`}>
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition">
                    <FaArrowLeft /> Quay lại
                </button>
                <h1 className="text-3xl font-bold">{task.title}</h1>
                <div className="mt-2 opacity-90 text-sm flex gap-4">
                    <span>Mã việc: #{task.id}</span>
                    {isOverdue && <span className="bg-white text-red-600 px-2 py-0.5 rounded font-bold text-xs uppercase">Đã quá hạn</span>}
                </div>
            </div>

            <div className="p-8">
                {/* 1. Thông tin thời gian */}
                <div className="flex flex-col md:flex-row gap-6 mb-8 border-b pb-6">
                    <div className="flex-1">
                        <h3 className="text-gray-500 font-bold uppercase text-xs mb-2 flex items-center gap-2">
                            <FaClock /> Bắt đầu
                        </h3>
                        <p className="text-lg font-medium text-gray-800">
                            {new Date(task.startTime).toLocaleString('vi-VN', {weekday: 'long', hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'})}
                        </p>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-gray-500 font-bold uppercase text-xs mb-2 flex items-center gap-2">
                            <FaClock /> Hạn chót
                        </h3>
                        <p className="text-lg font-medium text-red-600">
                            {new Date(task.endTime).toLocaleString('vi-VN', {weekday: 'long', hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit'})}
                        </p>
                    </div>
                </div>

                {/* 2. Chỉ tiêu KPI */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 flex items-center gap-4">
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600 text-2xl">
                        <FaBullseye />
                    </div>
                    <div>
                        <p className="text-sm text-blue-500 font-bold uppercase">Chỉ tiêu được giao</p>
                        <p className="text-3xl font-bold text-blue-800">
                            {task.targetAmount} <span className="text-lg font-normal text-blue-600">{task.unit}</span>
                        </p>
                    </div>
                </div>

                {/* 3. Ghi chú / Yêu cầu */}
                <div className="mb-8">
                    <h3 className="text-gray-800 font-bold mb-3 flex items-center gap-2">
                        <FaStickyNote className="text-yellow-500" /> Yêu cầu chi tiết:
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border text-gray-700 italic leading-relaxed">
                        "{task.notes || "Không có ghi chú đặc biệt."}"
                    </div>
                </div>

                {/* 4. Footer Action */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                     {/* Nút này sẽ dẫn sang trang Tạo báo cáo và tự điền ID lịch vào */}
                    <Link 
                        to={`/client/work-report/create?scheduleId=${task.id}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                    >
                        🚀 Báo cáo kết quả ngay
                    </Link>
                </div>
            </div>
        </div>
    );
}