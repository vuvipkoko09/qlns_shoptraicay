import React, { useState, useEffect } from 'react';
import SalaryService from '../../services/SalaryService';
import { useAuth } from "../../context/AuthContext";
export default function ClientSalary() {
    const { user } = useAuth();
    const [slips, setSlips] = useState([]);

    useEffect(() => {
        if (user && user.id) {
            SalaryService.getMyHistory(user.id).then(res => setSlips(res.data));
        }
    }, [user]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-green-800">Thông Tin Lương & Thưởng</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {slips.map(slip => (
                    <div key={slip.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow hover:shadow-lg transition relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl">
                            {slip.status}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Tháng {slip.month}/{slip.year}</h3>
                        
                        <div className="text-sm text-gray-600 space-y-1 mb-4">
                            <p className="flex justify-between"><span>Ngày công:</span> <span className="font-medium">{slip.totalWorkDays}</span></p>
                            <p className="flex justify-between"><span>Giờ làm:</span> <span className="font-medium">{slip.totalWorkHours}</span></p>
                        </div>

                        <div className="border-t pt-3 mt-2">
                            <p className="text-xs text-gray-500 uppercase">Thực lĩnh</p>
                            <p className="text-2xl font-bold text-green-600">{slip.finalSalary?.toLocaleString()} ₫</p>
                        </div>
                    </div>
                ))}
            </div>
            {slips.length === 0 && <p className="text-center text-gray-500 mt-10">Chưa có dữ liệu lương.</p>}
        </div>
    );
}