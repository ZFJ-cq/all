/**
 * 资产管理 API 调用
 * 用于替换 admin/index.html 中的模拟数据
 */

// 分页相关变量
let currentAssetTypePage = 1;
const assetTypePageSize = 10;
let currentRoleAssetPage = 1;
const roleAssetPageSize = 10;
let allRoleAssetsData = [];
let allAssetTypesData = [];
let allRolesData = [];

// 加载所有资产数据
function loadAssets() {
  loadAssetTypes();
  loadAllRoleAssets();
}

// 加载资产类型列表用于筛选
function loadAssetTypeFilters() {
  fetch(`${API_BASE_URL}/assets/type`)
    .then(response => handleResponse(response))
    .then(data => {
      allAssetTypesData = data;
      const typeSelect = document.getElementById('roleAssetTypeFilter');
      if (typeSelect) {
        // 保留第一个"全部"选项
        typeSelect.innerHTML = '<option value="">全部资产类型</option>';
        data.forEach(type => {
          const option = document.createElement('option');
          option.value = type.id;
          option.textContent = type.name;
          typeSelect.appendChild(option);
        });
      }
    })
    .catch(error => {
      console.error('加载资产类型筛选失败:', error);
    });
}

// 加载角色列表用于筛选
function loadRoleFilters() {
  fetch(`${API_BASE_URL}/role/all`)
    .then(response => handleResponse(response))
    .then(data => {
      allRolesData = data;
      const roleSelect = document.getElementById('roleAssetRoleFilter');
      if (roleSelect) {
        // 保留第一个"全部"选项
        roleSelect.innerHTML = '<option value="">全部角色</option>';
        data.forEach(role => {
          const option = document.createElement('option');
          option.value = role.id;
          option.textContent = role.roleName;
          roleSelect.appendChild(option);
        });
      }
    })
    .catch(error => {
      console.error('加载角色筛选失败:', error);
    });
}

// 加载资产类型（带分页）
function loadAssetTypes(page = 1, pageSize = assetTypePageSize) {
  const tbody = document.getElementById('assetTypeTableBody');
  if (!tbody) {
    console.error('assetTypeTableBody 元素不存在');
    return;
  }
  
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">加载中...</td></tr>';
  
  fetch(`${API_BASE_URL}/assets/type`)
    .then(response => handleResponse(response))
    .then(data => {
      const totalItems = data.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const currentPageData = data.slice(startIndex, endIndex);
      
      tbody.innerHTML = '';
      if(currentPageData && currentPageData.length > 0) {
        currentPageData.forEach(assetType => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${assetType.id}</td>
            <td>${assetType.name}</td>
            <td>${assetType.type}</td>
            <td>${assetType.description || '无'}</td>
            <td>
              <button class="btn btn-primary" onclick="editAssetType('${assetType.id}')">编辑</button>
              <button class="btn btn-danger" onclick="deleteAssetType('${assetType.id}')">删除</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">暂无资产类型数据</td></tr>';
      }
      
      // 延迟创建分页控件，确保 DOM 已经渲染
      setTimeout(() => {
        const paginationContainer = document.getElementById('assetTypePagination');
        if (paginationContainer) {
          createPagination(
            'assetTypePagination',
            page,
            totalItems,
            pageSize,
            (newPage, newPageSize) => loadAssetTypes(newPage, newPageSize),
            (newPageSize) => {}
          );
        }
      }, 100);
      
      currentAssetTypePage = page;
    })
    .catch(error => {
      console.error('获取资产类型失败:', error);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">加载失败，请刷新重试</td></tr>';
    });
}

// 加载所有角色的资产（带分页和筛选）
function loadAllRoleAssets(page = 1, pageSize = roleAssetPageSize) {
  const tbody = document.getElementById('roleAssetTableBody');
  if (!tbody) {
    console.error('roleAssetTableBody 元素不存在');
    return;
  }
  
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#999;">加载中...</td></tr>';
  
  // 获取所有角色资产
  fetch(`${API_BASE_URL}/assets/role?all=true`)
    .then(response => handleResponse(response))
    .then(data => {
      allRoleAssetsData = data;
      
      // 应用筛选
      const typeFilter = document.getElementById('roleAssetTypeFilter')?.value || '';
      const roleFilter = document.getElementById('roleAssetRoleFilter')?.value || '';
      const userFilter = document.getElementById('roleAssetUserFilter')?.value?.trim() || '';
      
      let filteredData = data;
      if (typeFilter) {
        filteredData = filteredData.filter(item => item.assetTypeId == typeFilter);
      }
      if (roleFilter) {
        filteredData = filteredData.filter(item => item.roleId == roleFilter);
      }
      if (userFilter) {
        filteredData = filteredData.filter(item => 
          (item.username && item.username.includes(userFilter)) ||
          (item.roleName && item.roleName.includes(userFilter))
        );
      }
      
      const totalItems = filteredData.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const currentPageData = filteredData.slice(startIndex, endIndex);
      
      tbody.innerHTML = '';
      if(currentPageData && currentPageData.length > 0) {
        currentPageData.forEach(roleAsset => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${roleAsset.id}</td>
            <td>${roleAsset.roleName || '未知角色'}</td>
            <td>${roleAsset.username || '未知用户'}</td>
            <td>${roleAsset.roleId}</td>
            <td>${roleAsset.assetTypeName || '未知'}</td>
            <td>${roleAsset.quantity}</td>
            <td>
              <button class="btn btn-primary" onclick="editRoleAsset('${roleAsset.id}')">编辑</button>
              <button class="btn btn-danger" onclick="deleteRoleAsset('${roleAsset.id}')">删除</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#999;">暂无角色资产数据</td></tr>';
      }
      
      // 延迟创建分页控件，确保 DOM 已经渲染
      setTimeout(() => {
        const paginationContainer = document.getElementById('roleAssetPagination');
        if (paginationContainer) {
          createPagination(
            'roleAssetPagination',
            page,
            totalItems,
            pageSize,
            (newPage, newPageSize) => loadAllRoleAssets(newPage, newPageSize),
            (newPageSize) => {}
          );
        }
      }, 100);
      
      currentRoleAssetPage = page;
    })
    .catch(error => {
      console.error('获取角色资产失败:', error);
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#999;">加载失败，请刷新重试</td></tr>';
    });
}

// 处理角色资产筛选
function handleRoleAssetSearch() {
  loadAllRoleAssets(1, roleAssetPageSize);
}

// 根据角色 ID 加载资产
function loadRoleAssetsByRoleId(roleId) {
  const tbody = document.getElementById('roleAssetTableBody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#999;">加载中...</td></tr>';
  
  fetch(`${API_BASE_URL}/assets/role/${roleId}`)
    .then(response => handleResponse(response))
    .then(data => {
      tbody.innerHTML = '';
      if(data && data.length > 0) {
        data.forEach(roleAsset => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${roleAsset.id}</td>
            <td>${roleAsset.roleName || '未知角色'}</td>
            <td>${roleAsset.username || '未知用户'}</td>
            <td>${roleAsset.roleId}</td>
            <td>${roleAsset.assetTypeName || '未知'}</td>
            <td>${roleAsset.quantity}</td>
            <td>
              <button class="btn btn-primary" onclick="editRoleAsset('${roleAsset.id}')">编辑</button>
              <button class="btn btn-danger" onclick="deleteRoleAsset('${roleAsset.id}')">删除</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#999;">暂无角色资产数据</td></tr>';
      }
    })
    .catch(error => {
      console.error('获取角色资产失败:', error);
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#999;">加载失败，请刷新重试</td></tr>';
    });
}

// 编辑资产类型
function editAssetType(id) {
  fetch(`${API_BASE_URL}/assets/type/${id}`)
    .then(response => handleResponse(response))
    .then(data => {
      if(data) {
        document.getElementById('editAssetTypeId').value = data.id;
        document.getElementById('editAssetTypeName').value = data.name;
        document.getElementById('editAssetTypeType').value = data.type;
        document.getElementById('editAssetTypeDesc').value = data.description || '';
        document.getElementById('editAssetTypeModal').style.display = 'flex';
      }
    })
    .catch(error => {
      console.error('获取资产类型详情失败:', error);
      showMessage('assetMessage', '获取资产类型详情失败', 'error');
    });
}

// 删除资产类型
function deleteAssetType(id) {
  if(confirm('确定删除该资产类型吗？此操作不可恢复！')) {
    fetch(`${API_BASE_URL}/assets/type/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if(response.ok) {
        showMessage('assetMessage', '删除成功', 'success');
        loadAssetTypes();
      } else {
        throw new Error('删除失败');
      }
    })
    .catch(error => {
      console.error('删除资产类型失败:', error);
      showMessage('assetMessage', '删除失败，请重试', 'error');
    });
  }
}

// 编辑角色资产
function editRoleAsset(id) {
  // 先获取资产类型列表
  fetch(`${API_BASE_URL}/assets/type`)
    .then(response => handleResponse(response))
    .then(assetTypes => {
      // 再获取角色资产详情
      return fetch(`${API_BASE_URL}/assets/role/${id}`)
        .then(response => handleResponse(response))
        .then(roleAsset => {
          if(roleAsset && assetTypes) {
            document.getElementById('editRoleAssetId').value = roleAsset.id;
            document.getElementById('editRoleAssetRoleId').value = roleAsset.roleId;
            
            // 填充资产类型选择框
            const typeSelect = document.getElementById('editRoleAssetTypeId');
            typeSelect.innerHTML = '<option value="">选择资产类型</option>';
            assetTypes.forEach(type => {
              const option = document.createElement('option');
              option.value = type.id;
              option.textContent = type.name;
              if(type.id === roleAsset.assetTypeId) {
                option.selected = true;
              }
              typeSelect.appendChild(option);
            });
            
            document.getElementById('editRoleAssetQuantity').value = roleAsset.quantity || 0;
            document.getElementById('editRoleAssetAmount').value = roleAsset.amount || 0;
            document.getElementById('editRoleAssetModal').style.display = 'flex';
          }
        });
    })
    .catch(error => {
      console.error('获取角色资产详情失败:', error);
      showMessage('assetMessage', '获取角色资产详情失败', 'error');
    });
}

// 删除角色资产
function deleteRoleAsset(id) {
  if(confirm('确定删除该角色资产吗？此操作不可恢复！')) {
    fetch(`${API_BASE_URL}/assets/role/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if(response.ok) {
        showMessage('assetMessage', '删除成功', 'success');
        loadAllRoleAssets();
      } else {
        throw new Error('删除失败');
      }
    })
    .catch(error => {
      console.error('删除角色资产失败:', error);
      showMessage('assetMessage', '删除失败，请重试', 'error');
    });
  }
}

// 新增资产类型表单提交
const addAssetTypeForm = document.getElementById('addAssetTypeForm');
if (addAssetTypeForm) {
  addAssetTypeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const assetTypeData = {
      name: document.getElementById('addAssetTypeName').value,
      type: document.getElementById('addAssetTypeType').value,
      description: document.getElementById('addAssetTypeDesc').value
    };
    
    fetch(`${API_BASE_URL}/assets/type`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetTypeData)
    })
    .then(response => handleResponse(response))
    .then(data => {
      showMessage('assetMessage', '创建成功', 'success');
      closeModal();
      loadAssetTypes();
    })
    .catch(error => {
      console.error('创建资产类型失败:', error);
      showMessage('assetMessage', '创建失败，请重试', 'error');
    });
  });
}

// 编辑资产类型表单提交
const editAssetTypeForm = document.getElementById('editAssetTypeForm');
if (editAssetTypeForm) {
  editAssetTypeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('editAssetTypeId').value;
    const assetTypeData = {
      name: document.getElementById('editAssetTypeName').value,
      type: document.getElementById('editAssetTypeType').value,
      description: document.getElementById('editAssetTypeDesc').value
    };
    
    fetch(`${API_BASE_URL}/assets/type/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetTypeData)
    })
    .then(response => handleResponse(response))
    .then(data => {
      showMessage('assetMessage', '修改成功', 'success');
      closeModal();
      loadAssetTypes();
    })
    .catch(error => {
      console.error('修改资产类型失败:', error);
      showMessage('assetMessage', '修改失败，请重试', 'error');
    });
  });
}

// 新增角色资产表单提交
const addRoleAssetForm = document.getElementById('addRoleAssetForm');
if (addRoleAssetForm) {
  addRoleAssetForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const roleAssetData = {
      roleId: parseInt(document.getElementById('addRoleAssetRoleId').value),
      assetTypeId: parseInt(document.getElementById('addRoleAssetTypeId').value),
      quantity: parseInt(document.getElementById('addRoleAssetQuantity').value) || 0,
      amount: parseFloat(document.getElementById('addRoleAssetAmount').value) || 0
    };
    
    fetch(`${API_BASE_URL}/assets/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleAssetData)
    })
    .then(response => handleResponse(response))
    .then(data => {
      showMessage('assetMessage', '创建成功', 'success');
      closeModal();
      loadAllRoleAssets();
    })
    .catch(error => {
      console.error('创建角色资产失败:', error);
      showMessage('assetMessage', '创建失败，请重试', 'error');
    });
  });
}

// 编辑角色资产表单提交
const editRoleAssetForm = document.getElementById('editRoleAssetForm');
if (editRoleAssetForm) {
  editRoleAssetForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('editRoleAssetId').value;
    const roleAssetData = {
      roleId: parseInt(document.getElementById('editRoleAssetRoleId').value),
      assetTypeId: parseInt(document.getElementById('editRoleAssetTypeId').value),
      quantity: parseInt(document.getElementById('editRoleAssetQuantity').value) || 0,
      amount: parseFloat(document.getElementById('editRoleAssetAmount').value) || 0
    };
    
    fetch(`${API_BASE_URL}/assets/role/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleAssetData)
    })
    .then(response => handleResponse(response))
    .then(data => {
      showMessage('assetMessage', '修改成功', 'success');
      closeModal();
      loadAllRoleAssets();
    })
    .catch(error => {
      console.error('修改角色资产失败:', error);
      showMessage('assetMessage', '修改失败，请重试', 'error');
    });
  });
}
