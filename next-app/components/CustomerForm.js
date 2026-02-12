function CustomerForm({ customer, onClose, onSave }) {
  const [formData, setFormData] = React.useState(customer?.objectData || {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxId: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (customer) {
        await trickleUpdateObject('customer', customer.objectId, formData);
      } else {
        await trickleCreateObject('customer', formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {customer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <div className="icon-x text-2xl"></div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อบริษัท/ลูกค้า *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ผู้ติดต่อ</label>
              <input type="text" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทร</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
            <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">เลขประจำตัวผู้เสียภาษี</label>
            <input type="text" value={formData.taxId} onChange={(e) => setFormData({...formData, taxId: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">บันทึก</button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">ยกเลิก</button>
          </div>
        </form>
      </div>
    </div>
  );
}