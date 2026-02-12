function CustomerList({ customers, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ชื่อบริษัท</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ผู้ติดต่อ</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">เบอร์โทร</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">อีเมล</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">ยังไม่มีข้อมูลลูกค้า</td></tr>
            ) : (
              customers.map(customer => (
                <tr key={customer.objectId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.objectData.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.objectData.contactPerson || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.objectData.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.objectData.email || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onEdit(customer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <div className="icon-edit text-base"></div>
                      </button>
                      <button onClick={() => onDelete(customer.objectId)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <div className="icon-trash-2 text-base"></div>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}