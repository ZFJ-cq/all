/**
 * 境界突破记录 API 调用
 * 用于替换 admin/index.html 中的模拟数据
 */

// 分页相关变量
let currentRealmBreakPage = 1;
const realmBreakPageSize = 10;

// 加载突破记录列表（带分页）
function loadRealmBreakRecords(page = 1, pageSize = realmBreakPageSize) {
  const tbody = document.getElementById('realmBreakTableBody');
  const paginationContainer = document.getElementById('realmBreakPagination');
  
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#999;">加载中...</td></tr>';
  
  fetch(`${API_BASE_URL}/realm/break`)
    .then(response => handleResponse(response))
    .then(data => {
      const totalItems = data.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const currentPageData = data.slice(startIndex, endIndex);
      
      tbody.innerHTML = '';
      if(currentPageData && currentPageData.length > 0) {
        currentPageData.forEach(record => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${record.id}</td>
            <td>${record.roleId}</td>
            <td>${record.roleName || '-'}</td>
            <td>${record.oldRealm}</td>
            <td>${record.newRealm}</td>
            <td>${record.success === 1 ? '<span style="color:green;">成功</span>' : '<span style="color:red;">失败</span>'}</td>
            <td>${record.costXiuwei || 0}</td>
            <td>${formatDateTime(record.breakthroughTime)}</td>
            <td>
              <button class="btn btn-primary" onclick="editRealmBreak('${record.id}')">编辑</button>
              <button class="btn btn-danger" onclick="deleteRealmBreak('${record.id}')">删除</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#999;">暂无突破记录</td></tr>';
      }
      
      // 创建分页控件
      if (paginationContainer) {
        createPagination(
          'realmBreakPagination',
          page,
          totalItems,
          pageSize,
          (newPage, newPageSize) => loadRealmBreakRecords(newPage, newPageSize),
          (newPageSize) => {}
        );
      }
      
      currentRealmBreakPage = page;
    })
    .catch(error => {
      console.error('加载突破记录失败:', error);
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red;">加载失败</td></tr>';
      if (paginationContainer) {
        paginationContainer.innerHTML = '';
      }
    });
}

// 搜索突破记录
function searchRealmBreak(keyword) {
  const tbody = document.getElementById('realmBreakTableBody');
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#999;">搜索中...</td></tr>';
  
  fetch(`${API_BASE_URL}/realm/break/search?keyword=${encodeURIComponent(keyword)}`)
    .then(response => handleResponse(response))
    .then(data => {
      tbody.innerHTML = '';
      if(data && data.length > 0) {
        data.forEach(record => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${record.id}</td>
            <td>${record.roleId}</td>
            <td>${record.roleName || '-'}</td>
            <td>${record.oldRealm}</td>
            <td>${record.newRealm}</td>
            <td>${record.success === 1 ? '<span style="color:green;">成功</span>' : '<span style="color:red;">失败</span>'}</td>
            <td>${record.costXiuwei || 0}</td>
            <td>${formatDateTime(record.breakthroughTime)}</td>
            <td>
              <button class="btn btn-primary" onclick="editRealmBreak('${record.id}')">编辑</button>
              <button class="btn btn-danger" onclick="deleteRealmBreak('${record.id}')">删除</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#999;">未找到匹配记录</td></tr>';
      }
    })
    .catch(error => {
      console.error('搜索突破记录失败:', error);
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red;">搜索失败</td></tr>';
    });
}

// 编辑突破记录
function editRealmBreak(id) {
  fetch(`${API_BASE_URL}/realm/break/${id}`)
    .then(response => handleResponse(response))
    .then(data => {
      if(data) {
        document.getElementById('editBreakId').value = data.id;
        document.getElementById('editBreakRoleId').value = data.roleId;
        document.getElementById('editBreakRoleName').value = data.roleName || '';
        document.getElementById('editBreakOldRealm').value = data.oldRealm;
        document.getElementById('editBreakNewRealm').value = data.newRealm;
        document.getElementById('editBreakSuccess').value = data.success;
        document.getElementById('editBreakCostXiuwei').value = data.costXiuwei || 0;
        document.getElementById('editRealmBreakModal').style.display = 'flex';
      }
    })
    .catch(error => {
      console.error('获取突破记录详情失败:', error);
      showMessage('realmBreakMessage', '获取突破记录详情失败', 'error');
    });
}

// 删除突破记录
function deleteRealmBreak(id) {
  if(confirm('确定删除该突破记录吗？此操作不可恢复！')) {
    fetch(`${API_BASE_URL}/realm/break/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if(response.ok) {
        showMessage('realmBreakMessage', '删除成功', 'success');
        loadRealmBreakRecords();
      } else {
        throw new Error('删除失败');
      }
    })
    .catch(error => {
      console.error('删除突破记录失败:', error);
      showMessage('realmBreakMessage', '删除失败，请重试', 'error');
    });
  }
}

// 新增突破记录表单提交
const addRealmBreakForm = document.getElementById('addRealmBreakForm');
if (addRealmBreakForm) {
  addRealmBreakForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const breakData = {
      roleId: parseInt(document.getElementById('addBreakRoleId').value),
      roleName: document.getElementById('addBreakRoleName').value,
      oldRealm: document.getElementById('addBreakOldRealm').value,
      newRealm: document.getElementById('addBreakNewRealm').value,
      success: parseInt(document.getElementById('addBreakSuccess').value),
      costXiuwei: parseInt(document.getElementById('addBreakCostXiuwei').value)
    };
    
    fetch(`${API_BASE_URL}/realm/break`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(breakData)
    })
    .then(response => handleResponse(response))
    .then(data => {
      showMessage('realmBreakMessage', '创建成功', 'success');
      closeModal();
      loadRealmBreakRecords();
    })
    .catch(error => {
      console.error('创建突破记录失败:', error);
      showMessage('realmBreakMessage', '创建失败，请重试', 'error');
    });
  });
}

// 编辑突破记录表单提交
const editRealmBreakForm = document.getElementById('editRealmBreakForm');
if (editRealmBreakForm) {
  editRealmBreakForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('editBreakId').value;
    const breakData = {
      roleId: parseInt(document.getElementById('editBreakRoleId').value),
      roleName: document.getElementById('editBreakRoleName').value,
      oldRealm: document.getElementById('editBreakOldRealm').value,
      newRealm: document.getElementById('editBreakNewRealm').value,
      success: parseInt(document.getElementById('editBreakSuccess').value),
      costXiuwei: parseInt(document.getElementById('editBreakCostXiuwei').value)
    };
    
    fetch(`${API_BASE_URL}/realm/break/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(breakData)
    })
    .then(response => handleResponse(response))
    .then(data => {
      showMessage('realmBreakMessage', '修改成功', 'success');
      closeModal();
      loadRealmBreakRecords();
    })
    .catch(error => {
      console.error('修改突破记录失败:', error);
      showMessage('realmBreakMessage', '修改失败，请重试', 'error');
    });
  });
}
