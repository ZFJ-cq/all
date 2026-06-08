/**
 * 技能管理 API 调用
 */

// 分页相关变量
let currentSkillPage = 1;
const skillPageSize = 10;
let allSkillsData = [];

// 加载技能列表（带分页）
function loadSkills(page = 1, pageSize = skillPageSize) {
  const tbody = document.getElementById('skillTableBody');
  const paginationContainer = document.getElementById('skillPagination');
  
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="11" style="text-align:center; color:#999;">加载中...</td></tr>';
  
  fetch(`${API_BASE_URL}/skill`)
    .then(response => handleResponse(response))
    .then(data => {
      allSkillsData = data;
      const totalItems = data.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const currentPageData = data.slice(startIndex, endIndex);
      
      tbody.innerHTML = '';
      if(currentPageData && currentPageData.length > 0) {
        currentPageData.forEach(skill => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${skill.id}</td>
            <td>${skill.skillName}</td>
            <td>${skill.skillType}</td>
            <td>${skill.skillLevel}/${skill.maxLevel}</td>
            <td>${skill.attackBonus || 0}</td>
            <td>${skill.defenseBonus || 0}</td>
            <td>${skill.xiuweiBonus || 0}</td>
            <td>${skill.spiritPowerBonus || 0}</td>
            <td>${skill.speedBonus || 0}</td>
            <td>${skill.criticalBonus || 0}</td>
            <td>${skill.status === 1 ? '<span style="color:green;">启用</span>' : '<span style="color:red;">禁用</span>'}</td>
            <td>
              <button class="btn btn-primary" onclick="editSkill('${skill.id}')">编辑</button>
              <button class="btn btn-danger" onclick="deleteSkill('${skill.id}')">删除</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center; color:#999;">暂无技能数据</td></tr>';
      }
      
      // 创建分页控件
      setTimeout(() => {
        if (paginationContainer) {
          createPagination(
            'skillPagination',
            page,
            totalItems,
            pageSize,
            (newPage, newPageSize) => loadSkills(newPage, newPageSize),
            (newPageSize) => {}
          );
        }
      }, 100);
      
      currentSkillPage = page;
    })
    .catch(error => {
      console.error('获取技能失败:', error);
      tbody.innerHTML = '<tr><td colspan="11" style="text-align:center; color:#999;">加载失败，请刷新重试</td></tr>';
      if (paginationContainer) {
        paginationContainer.innerHTML = '';
      }
    });
}

// 打开新增技能模态框
function openAddSkillModal() {
  document.getElementById('addSkillModal').style.display = 'flex';
}

// 关闭新增技能模态框
function closeAddSkillModal() {
  document.getElementById('addSkillModal').style.display = 'none';
  document.getElementById('addSkillForm').reset();
}

// 编辑技能
function editSkill(id) {
  const skill = allSkillsData.find(s => s.id == id);
  if (!skill) return;
  
  document.getElementById('editSkillId').value = skill.id;
  document.getElementById('editSkillName').value = skill.skillName;
  document.getElementById('editDescription').value = skill.description || '';
  document.getElementById('editSkillType').value = skill.skillType;
  document.getElementById('editSkillLevel').value = skill.skillLevel;
  document.getElementById('editMaxLevel').value = skill.maxLevel;
  document.getElementById('editAttackBonus').value = skill.attackBonus || 0;
  document.getElementById('editDefenseBonus').value = skill.defenseBonus || 0;
  document.getElementById('editXiuweiBonus').value = skill.xiuweiBonus || 0;
  document.getElementById('editSpiritPowerBonus').value = skill.spiritPowerBonus || 0;
  document.getElementById('editSpeedBonus').value = skill.speedBonus || 0;
  document.getElementById('editCriticalBonus').value = skill.criticalBonus || 0;
  document.getElementById('editDodgeBonus').value = skill.dodgeBonus || 0;
  document.getElementById('editStatus').value = skill.status;
  
  document.getElementById('editSkillModal').style.display = 'flex';
}

// 关闭编辑技能模态框
function closeEditSkillModal() {
  document.getElementById('editSkillModal').style.display = 'none';
}

// 删除技能
function deleteSkill(id) {
  if (!confirm('确定要删除这个技能吗？')) return;
  
  fetch(`${API_BASE_URL}/skill/${id}`, {
    method: 'DELETE'
  })
  .then(() => {
    showSuccessMessage('删除成功');
    loadSkills(currentSkillPage);
  })
  .catch(error => {
    console.error('删除失败:', error);
    showErrorMessage('删除失败');
  });
}

// 加载角色技能
function loadRoleSkills() {
  const tbody = document.getElementById('roleSkillTableBody');
  const paginationContainer = document.getElementById('roleSkillPagination');
  
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#999;">加载中...</td></tr>';
  
  fetch(`${API_BASE_URL}/role-skill`)
    .then(response => handleResponse(response))
    .then(data => {
      const totalItems = data.length;
      const startIndex = 0;
      const endIndex = 10;
      const currentPageData = data.slice(startIndex, endIndex);
      
      tbody.innerHTML = '';
      if(currentPageData && currentPageData.length > 0) {
        currentPageData.forEach(rs => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${rs.id}</td>
            <td>${rs.roleId}</td>
            <td>${rs.skillName || '未知技能'}</td>
            <td>${rs.skillType || '-'}</td>
            <td>${rs.skillLevel}</td>
            <td>${rs.experience || 0}</td>
            <td>${rs.equipped ? '<span style="color:green;">已装备</span>' : '<span style="color:#999;">未装备</span>'}</td>
            <td>
              ${!rs.equipped ? `<button class="btn btn-success" onclick="equipSkill('${rs.roleId}','${rs.skillId}')">装备</button>` : ''}
              ${rs.equipped ? `<button class="btn btn-warning" onclick="unequipSkill('${rs.roleId}','${rs.skillId}')">卸下</button>` : ''}
              <button class="btn btn-danger" onclick="deleteRoleSkill('${rs.id}')">删除</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#999;">暂无角色技能数据</td></tr>';
      }
      
      setTimeout(() => {
        if (paginationContainer) {
          createPagination(
            'roleSkillPagination',
            1,
            totalItems,
            10,
            () => loadRoleSkills(),
            () => {}
          );
        }
      }, 100);
    })
    .catch(error => {
      console.error('获取角色技能失败:', error);
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#999;">加载失败，请刷新重试</td></tr>';
      if (paginationContainer) {
        paginationContainer.innerHTML = '';
      }
    });
}

// 装备技能
function equipSkill(roleId, skillId) {
  fetch(`${API_BASE_URL}/role-skill/equip?roleId=${roleId}&skillId=${skillId}`, {
    method: 'POST'
  })
  .then(() => {
    showSuccessMessage('装备成功');
    loadRoleSkills();
  })
  .catch(error => {
    console.error('装备失败:', error);
    showErrorMessage('装备失败');
  });
}

// 卸下技能
function unequipSkill(roleId, skillId) {
  fetch(`${API_BASE_URL}/role-skill/unequip?roleId=${roleId}&skillId=${skillId}`, {
    method: 'POST'
  })
  .then(() => {
    showSuccessMessage('卸下成功');
    loadRoleSkills();
  })
  .catch(error => {
    console.error('卸下失败:', error);
    showErrorMessage('卸下失败');
  });
}

// 删除角色技能
function deleteRoleSkill(id) {
  if (!confirm('确定要删除这个角色技能吗？')) return;
  
  fetch(`${API_BASE_URL}/role-skill/${id}`, {
    method: 'DELETE'
  })
  .then(() => {
    showSuccessMessage('删除成功');
    loadRoleSkills();
  })
  .catch(error => {
    console.error('删除失败:', error);
    showErrorMessage('删除失败');
  });
}

// 提交新增技能表单
function submitAddSkillForm() {
  const skill = {
    skillName: document.getElementById('addSkillName').value,
    description: document.getElementById('addDescription').value,
    skillType: document.getElementById('addSkillType').value,
    skillLevel: parseInt(document.getElementById('addSkillLevel').value),
    maxLevel: parseInt(document.getElementById('addMaxLevel').value),
    attackBonus: parseInt(document.getElementById('addAttackBonus').value),
    defenseBonus: parseInt(document.getElementById('addDefenseBonus').value),
    xiuweiBonus: parseInt(document.getElementById('addXiuweiBonus').value),
    spiritPowerBonus: parseInt(document.getElementById('addSpiritPowerBonus').value),
    speedBonus: parseInt(document.getElementById('addSpeedBonus').value),
    criticalBonus: parseInt(document.getElementById('addCriticalBonus').value),
    dodgeBonus: parseInt(document.getElementById('addDodgeBonus').value),
    status: parseInt(document.getElementById('addStatus').value)
  };
  
  if (!skill.skillName) {
    showErrorMessage('技能名称不能为空');
    return;
  }
  
  fetch(`${API_BASE_URL}/skill`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(skill)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('添加失败');
    }
    return response.json();
  })
  .then(() => {
    showSuccessMessage('添加成功');
    closeAddSkillModal();
    loadSkills(currentSkillPage);
  })
  .catch(error => {
    console.error('添加失败:', error);
    showErrorMessage('添加失败');
  });
}

// 提交编辑技能表单
function submitEditSkillForm() {
  const id = document.getElementById('editSkillId').value;
  const skill = {
    skillName: document.getElementById('editSkillName').value,
    description: document.getElementById('editDescription').value,
    skillType: document.getElementById('editSkillType').value,
    skillLevel: parseInt(document.getElementById('editSkillLevel').value),
    maxLevel: parseInt(document.getElementById('editMaxLevel').value),
    attackBonus: parseInt(document.getElementById('editAttackBonus').value),
    defenseBonus: parseInt(document.getElementById('editDefenseBonus').value),
    xiuweiBonus: parseInt(document.getElementById('editXiuweiBonus').value),
    spiritPowerBonus: parseInt(document.getElementById('editSpiritPowerBonus').value),
    speedBonus: parseInt(document.getElementById('editSpeedBonus').value),
    criticalBonus: parseInt(document.getElementById('editCriticalBonus').value),
    dodgeBonus: parseInt(document.getElementById('editDodgeBonus').value),
    status: parseInt(document.getElementById('editStatus').value)
  };
  
  if (!skill.skillName) {
    showErrorMessage('技能名称不能为空');
    return;
  }
  
  fetch(`${API_BASE_URL}/skill/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(skill)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('更新失败');
    }
    return response.json();
  })
  .then(() => {
    showSuccessMessage('更新成功');
    closeEditSkillModal();
    loadSkills(currentSkillPage);
  })
  .catch(error => {
    console.error('更新失败:', error);
    showErrorMessage('更新失败');
  });
}
