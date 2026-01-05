function ProjectForm({ onSave, project = null }) {
  try {
    const [formData, setFormData] = React.useState({
      code: project?.code || '',
      name: project?.name || '',
      description: project?.description || '',
      manager: project?.manager || '',
      startDate: project?.startDate || new Date().toISOString().split('T')[0],
      endDate: project?.endDate || '',
      budget: project?.budget || '',
      objective: project?.objective || '',
      scope: project?.scope || '',
      stakeholders: project?.stakeholders || '',
      status: project?.status || 'planning'
    });

    const [teamMembers, setTeamMembers] = React.useState(project?.team || []);
    const [newMember, setNewMember] = React.useState('');

    const handleAddMember = () => {
      if (newMember.trim() && !teamMembers.includes(newMember.trim())) {
        setTeamMembers([...teamMembers, newMember.trim()]);
        setNewMember('');
      }
    };

    const handleRemoveMember = (member) => {
      setTeamMembers(teamMembers.filter(m => m !== member));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      const errors = ValidationHelper.validateProject(formData);
      if (ValidationHelper.showErrors(errors)) return;

      try {
        if (typeof trickleCreateObject !== 'function' || typeof trickleUpdateObject !== 'function') {
          console.log('Database not available');
          alert('ไม่สามารถบันทึกข้อมูลได้ในขณะนี้');
          return;
        }
        const projectData = {
          Code: formData.code,
          Name: formData.name,
          Description: formData.description,
          Manager: formData.manager,
          StartDate: formData.startDate,
          DueDate: formData.endDate,
          Budget: parseFloat(formData.budget) || 0,
          Objective: formData.objective,
          Scope: formData.scope,
          Stakeholders: formData.stakeholders,
          Status: formData.status,
          Progress: project?.progress || 0,
          TeamSize: teamMembers.length,
          Team: teamMembers.join(','),
          Color: project?.color || 'blue'
        };

        if (project) {
          await trickleUpdateObject('project', project.id, projectData).catch(err => {
            console.log('Update failed:', err.message);
            throw err;
          });
        } else {
          await trickleCreateObject('project', projectData).catch(err => {
            console.log('Create failed:', err.message);
            throw err;
          });
        }
        onSave();
      } catch (error) {
        console.log('Error saving project:', error.message);
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + (error.message || 'Unknown error'));
      }
    };

    return (
      <div className="max-w-3xl mx-auto" data-name="project-form" data-file="components/ProjectForm.js">
        <form onSubmit={handleSubmit} className="bg-background-base rounded-lg border border-neutral-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">ข้อมูลพื้นฐาน</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">รหัสโครงการ *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900 placeholder-neutral-500"
                    placeholder="PRJ-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">ผู้จัดการโครงการ *</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({...formData, manager: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900 placeholder-neutral-500"
                    placeholder="ชื่อผู้จัดการ"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">ชื่อโครงการ *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">คำอธิบาย</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900 placeholder-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">วันที่เริ่ม *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">วันที่สิ้นสุด *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">งบประมาณ (บาท) *</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">ทีมงาน</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900 placeholder-neutral-500"
                  placeholder="ชื่อสมาชิก"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <div className="icon-plus text-sm mr-2 inline-block"></div>
                  เพิ่ม
                </button>
              </div>
              
              {teamMembers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center space-x-2 px-3 py-1 bg-accent-50 text-accent-700 rounded-lg border border-accent-200">
                      <span className="text-sm">{member}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member)}
                        className="hover:text-error-600 transition-colors"
                      >
                        <div className="icon-x text-sm"></div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Project Charter</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">วัตถุประสงค์</label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => setFormData({...formData, objective: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900 placeholder-neutral-500"
                  placeholder="ระบุวัตถุประสงค์ของโครงการ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">ขอบเขตงาน (Scope)</label>
                <textarea
                  value={formData.scope}
                  onChange={(e) => setFormData({...formData, scope: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900 placeholder-neutral-500"
                  placeholder="ระบุขอบเขตการทำงานของโครงการ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">ผู้มีส่วนได้ส่วนเสีย (Stakeholders)</label>
                <textarea
                  value={formData.stakeholders}
                  onChange={(e) => setFormData({...formData, stakeholders: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-neutral-900 placeholder-neutral-500"
                  placeholder="ระบุผู้มีส่วนได้ส่วนเสียในโครงการ..."
                />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <div className="icon-save text-sm mr-2 inline-block"></div>
            {project ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างโครงการ'}
          </button>
        </form>
      </div>
    );
  } catch (error) {
    console.error('ProjectForm component error:', error);
    return null;
  }
}