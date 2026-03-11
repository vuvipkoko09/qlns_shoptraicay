import React, { useState, useEffect } from 'react';
import axios from 'axios';

// CẤU HÌNH USER ĐỂ TEST (Trong thực tế lấy từ Login)
const USER_ID_TEST = 2; 
const API_URL = "http://localhost:8080/api";

export default function EmployeeDashboard() {
    const [activeTab, setActiveTab] = useState('attendance');

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                    <h1 className="text-xl font-bold">Cổng Thông Tin Nhân Viên</h1>
                    <span className="text-sm bg-blue-500 px-3 py-1 rounded">Xin chào, User {USER_ID_TEST}</span>
                </div>

                {/* TABS */}
                <div className="flex border-b">
                    <button onClick={() => setActiveTab('attendance')} className={`flex-1 py-3 font-medium ${activeTab === 'attendance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        ⏱️ Chấm Công
                    </button>
                    <button onClick={() => setActiveTab('salary')} className={`flex-1 py-3 font-medium ${activeTab === 'salary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        💰 Lương & Thưởng
                    </button>
                    <button onClick={() => setActiveTab('leave')} className={`flex-1 py-3 font-medium ${activeTab === 'leave' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        📝 Nghỉ Phép
                    </button>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                    {activeTab === 'attendance' && <AttendancePanel />}
                    {activeTab === 'salary' && <SalaryPanel />}
                    {activeTab === 'leave' && <LeaveRequestPanel />}
                </div>
            </div>
        </div>
    );
}

// --- 1. COMPONENT CHẤM CÔNG ---
function AttendancePanel() {
    const [todayAtt, setTodayAtt] = useState(null);
    const [history, setHistory] = useState([]);
    const [note, setNote] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Load trạng thái hôm nay
        try {
            const resToday = await axios.get(`${API_URL}/attendance/today?userId=${USER_ID_TEST}`);
            setTodayAtt(resToday.data); // data có thể là null hoặc object
        } catch (e) { console.error(e); }

        // Load lịch sử tháng này
        try {
            const resHist = await axios.get(`${API_URL}/attendance/history?userId=${USER_ID_TEST}&month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`);
            setHistory(resHist.data);
        } catch (e) { console.error(e); }
    };

    const handleCheckIn = async () => {
        try {
            await axios.post(`${API_URL}/attendance/check-in?userId=${USER_ID_TEST}`, {
                latitude: 0, longitude: 0, note: note
            });
            alert("Check-in thành công!");
            loadData();
        } catch (e) { alert(e.response?.data || "Lỗi"); }
    };

    const handleCheckOut = async () => {
        try {
            await axios.post(`${API_URL}/attendance/check-out?userId=${USER_ID_TEST}`);
            alert("Check-out thành công!");
            loadData();
        } catch (e) { alert(e.response?.data || "Lỗi"); }
    };

    return (
        <div>
            {/* Box Checkin/Checkout */}
            <div className="bg-blue-50 p-6 rounded-lg text-center mb-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Hôm nay: {new Date().toLocaleDateString()}</h3>
                
                {!todayAtt ? (
                    <div>
                        <input type="text" placeholder="Ghi chú (nếu có)..." className="border p-2 rounded mb-2 w-64 block mx-auto" 
                            value={note} onChange={e => setNote(e.target.value)} />
                        <button onClick={handleCheckIn} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 shadow">
                            BẮT ĐẦU CA (CHECK-IN)
                        </button>
                    </div>
                ) : !todayAtt.checkOutTime ? (
                    <div>
                        <p className="text-green-600 font-semibold mb-2">✅ Đã Check-in lúc: {new Date(todayAtt.checkInTime).toLocaleTimeString()}</p>
                        <button onClick={handleCheckOut} className="bg-red-500 text-white px-6 py-2 rounded font-bold hover:bg-red-600 shadow">
                            KẾT THÚC CA (CHECK-OUT)
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-600 font-bold">🎉 Bạn đã hoàn thành ca làm hôm nay!</p>
                        <p className="text-sm">Vào: {new Date(todayAtt.checkInTime).toLocaleTimeString()} - Ra: {new Date(todayAtt.checkOutTime).toLocaleTimeString()}</p>
                    </div>
                )}
            </div>

            <h3 className="font-bold mb-2 text-gray-700">Lịch sử chấm công tháng này</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border">
                    <thead className="bg-gray-100 uppercase">
                        <tr>
                            <th className="px-4 py-2 border">Ngày</th>
                            <th className="px-4 py-2 border">Vào</th>
                            <th className="px-4 py-2 border">Ra</th>
                            <th className="px-4 py-2 border">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(att => (
                            <tr key={att.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2">{att.date}</td>
                                <td className="px-4 py-2">{att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString() : '-'}</td>
                                <td className="px-4 py-2">{att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString() : '-'}</td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-1 rounded text-xs text-white ${att.status === 'LATE' ? 'bg-red-500' : 'bg-green-500'}`}>
                                        {att.status}
                                    </span>
                                    {att.lateMinutes > 0 && <span className="text-red-500 ml-1 text-xs">({att.lateMinutes}p)</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- 2. COMPONENT LƯƠNG ---
function SalaryPanel() {
    const [slips, setSlips] = useState([]);

    useEffect(() => {
        axios.get(`${API_URL}/salary/history?userId=${USER_ID_TEST}`)
            .then(res => setSlips(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h3 className="font-bold mb-4 text-gray-700">Lịch sử lương</h3>
            {slips.length === 0 ? <p>Chưa có dữ liệu lương.</p> : (
                <div className="grid gap-4">
                    {slips.map(slip => (
                        <div key={slip.id} className="border rounded p-4 flex justify-between items-center shadow-sm hover:shadow-md transition">
                            <div>
                                <p className="font-bold text-lg text-blue-800">Tháng {slip.month}/{slip.year}</p>
                                <p className="text-gray-500 text-sm">Ngày công: {slip.totalWorkDays} - Giờ làm: {slip.totalWorkHours}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-green-600">{slip.finalSalary?.toLocaleString()} VNĐ</p>
                                <span className={`text-xs px-2 py-1 rounded ${slip.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {slip.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- 3. COMPONENT NGHỈ PHÉP ---
function LeaveRequestPanel() {
    const [leaves, setLeaves] = useState([]);
    const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });

    useEffect(() => { loadLeaves(); }, []);

    const loadLeaves = () => {
        axios.get(`${API_URL}/leave/my-history?userId=${USER_ID_TEST}`)
            .then(res => setLeaves(res.data));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/leave/create?userId=${USER_ID_TEST}`, form);
            alert("Đã gửi đơn!");
            setForm({ startDate: "", endDate: "", reason: "" });
            loadLeaves();
        } catch (e) { alert("Lỗi gửi đơn"); }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-bold mb-2">Gửi đơn xin nghỉ</h3>
                <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 p-4 rounded border">
                    <input type="date" required className="w-full p-2 border rounded" 
                        value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                    <input type="date" required className="w-full p-2 border rounded" 
                        value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                    <textarea placeholder="Lý do nghỉ..." required className="w-full p-2 border rounded" 
                        value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
                    <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Gửi Đơn</button>
                </form>
            </div>
            <div>
                <h3 className="font-bold mb-2">Lịch sử đơn từ</h3>
                <ul className="space-y-2">
                    {leaves.map(l => (
                        <li key={l.id} className="border p-3 rounded bg-white text-sm">
                            <div className="flex justify-between">
                                <span className="font-bold">{l.startDate} đến {l.endDate}</span>
                                <span className={`font-bold ${l.status === 'APPROVED' ? 'text-green-600' : l.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {l.status}
                                </span>
                            </div>
                            <p className="text-gray-600 italic">"{l.reason}"</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}