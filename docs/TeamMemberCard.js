function TeamMemberCard({ member, onEdit, onDelete }) {
  try {
    const data = member.objectData || {};
    
    return (
      <div className="card hover:shadow-xl transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
              {(data.Username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{data.Username || 'Unnamed'}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{data.Email || ''}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">บทบาท</span>
            <span className="font-medium">{data.Role || '-'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">แผนก</span>
            <span className="font-medium">{data.Department || '-'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">อัตราต่อชั่วโมง</span>
            <span className="font-medium">฿{(data.HourlyRate || 0).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex space-x-2 pt-4 border-t border-[var(--border-color)]">
          <button onClick={onEdit} className="flex-1 btn-secondary text-sm py-2">
            <div className="icon-edit text-sm mr-1"></div>
            แก้ไข
          </button>
          <button onClick={onDelete} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm py-2 font-medium transition-colors">
            <div className="icon-trash-2 text-sm mr-1"></div>
            ลบ
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('TeamMemberCard error:', error);
    return null;
  }
}