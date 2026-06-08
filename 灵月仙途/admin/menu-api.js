/**
 * 菜单管理 API 调用
 * 用于替换 admin/index.html 中的模拟数据
 */

// 分页相关变量
let currentMenuPage = 1;
const menuPageSize = 10;

// 加载菜单列表（带分页）
function loadSysMenus(page = 1, pageSize = menuPageSize) {
  const tbody = document.getElementById('sysMenuTableBody');
  const paginationContainer = document.getElementById('sysMenuPagination');
  
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#999;">加载中...</td></tr>';
  
  fetch(`${API_BASE_URL}/sys/menu`)
    .then(response => handleResponse(response))
    .then(data => {
      // 计算当前页的数据
      const totalItems = data.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const currentPageData = data.slice(startIndex, endIndex);
      
      tbody.innerHTML = '';
      if(currentPageData && currentPageData.length > 0) {
        currentPageData.forEach(menu => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${menu.id}</td>
            <td>${menu.menuName}</td>
            <td>${menu.parentId || 0}</td>
            <td>${menu.menuType === 1 ? '目录' : menu.menuType === 2 ? '菜单' : '按钮'}</td>
            <td>${menu.path || '-'}</td>
            <td>${menu.perm || '-'}</td>
            <td>${menu.sort}</td>
            <td>
              <button class="btn btn-primary" onclick="editSysMenu('${menu.id}')">编辑</button>
              <button class="btn btn-danger" onclick="deleteSysMenu('${menu.id}')">删除</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#999;">暂无菜单数据</td></tr>';
      }
      
      // 创建分页控件
      if (paginationContainer) {
        createPagination(
          'sysMenuPagination',
          page,
          totalItems,
          pageSize,
          (newPage, newPageSize) => loadSysMenus(newPage, newPageSize),
          (newPageSize) => {
            // 页面大小改变时的回调
          }
        );
      }
      
      // 更新当前页码
      currentMenuPage = page;
    })
    .catch(error => {
      console.error('加载菜单失败:', error);
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">加载失败</td></tr>';
      if (paginationContainer) {
        paginationContainer.innerHTML = '';
      }
    });
}

// 搜索菜单
function searchSysMenus(keyword) {
  const tbody = document.getElementById('sysMenuTableBody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#999;">搜索中...</td></tr>';
  
  fetch(`${API_BASE_URL}/sys/menu/search?keyword=${encodeURIComponent(keyword)}`)
    .then(response => handleResponse(response))
    .then(data => {
      tbody.innerHTML = '';
      if(data && data.length > 0) {
        data.forEach(menu => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${menu.id}</td>
            <td>${menu.menuName}</td>
            <td>${menu.parentId || 0}</td>
            <td>${menu.menuType === 1 ? '目录' : menu.menuType === 2 ? '菜单' : '按钮'}</td>
            <td>${menu.path || '-'}</td>
            <td>${menu.perm || '-'}</td>
            <td>${menu.sort}</td>
            <td>
              <button class="btn btn-primary" onclick="editSysMenu('${menu.id}')">编辑</button>
              <button class="btn btn-danger" onclick="deleteSysMenu('${menu.id}')">删除</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#999;">未找到匹配菜单</td></tr>';
      }
    })
    .catch(error => {
      console.error('搜索菜单失败:', error);
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">搜索失败</td></tr>';
    });
}

// 编辑菜单
function editSysMenu(id) {
  fetch(`${API_BASE_URL}/sys/menu/${id}`)
    .then(response => handleResponse(response))
    .then(data => {
      if(data) {
        document.getElementById('editMenuId').value = data.id;
        document.getElementById('editMenuName').value = data.menuName;
        document.getElementById('editMenuParentId').value = data.parentId || 0;
        document.getElementById('editMenuType').value = data.menuType;
        document.getElementById('editMenuPath').value = data.path || '';
        document.getElementById('editMenuPerm').value = data.perm || '';
        document.getElementById('editMenuSort').value = data.sort;
        document.getElementById('editSysMenuModalTitle').textContent = '编辑菜单';
        document.getElementById('editSysMenuModal').style.display = 'flex';
      }
    })
    .catch(error => {
      console.error('获取菜单详情失败:', error);
      showMessage('sysMenuMessage', '获取菜单详情失败', 'error');
    });
}

// 删除菜单
function deleteSysMenu(id) {
  if(confirm('确定删除该菜单吗？此操作不可恢复！')) {
    fetch(`${API_BASE_URL}/sys/menu/${id}`, {
      method: 'DELETE'
    })
    .then(response => {
      if(response.ok) {
        showMessage('sysMenuMessage', '删除成功', 'success');
        logEvent('warning', `删除菜单 ID: ${id}`);
        loadSysMenus();
      } else {
        throw new Error('删除失败');
      }
    })
    .catch(error => {
      console.error('删除菜单失败:', error);
      showMessage('sysMenuMessage', '删除失败，请重试', 'error');
    });
  }
}

function initMenuForms() {
  const addForm = document.getElementById('addSysMenuForm');
  if (addForm) {
    addForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const menuData = {
        menuName: document.getElementById('addMenuName').value,
        parentId: parseInt(document.getElementById('addMenuParentId').value),
        menuType: parseInt(document.getElementById('addMenuType').value),
        path: document.getElementById('addMenuPath').value,
        perm: document.getElementById('addMenuPerm').value,
        sort: parseInt(document.getElementById('addMenuSort').value),
        status: 1
      };
      
      fetch(`${API_BASE_URL}/sys/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuData)
      })
      .then(response => handleResponse(response))
      .then(data => {
        logEvent('info', `新增菜单 ${data.menuName}`);
        closeModal();
        loadSysMenus();
        showMessage('sysMenuMessage', '创建成功', 'success');
      })
      .catch(error => {
        console.error('创建菜单失败:', error);
        showMessage('sysMenuMessage', '创建失败，请重试', 'error');
      });
    });
  }

  const editForm = document.getElementById('editSysMenuForm');
  if (editForm) {
    editForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const id = document.getElementById('editMenuId').value;
      const menuData = {
        menuName: document.getElementById('editMenuName').value,
        parentId: parseInt(document.getElementById('editMenuParentId').value),
        menuType: parseInt(document.getElementById('editMenuType').value),
        path: document.getElementById('editMenuPath').value,
        perm: document.getElementById('editMenuPerm').value,
        sort: parseInt(document.getElementById('editMenuSort').value),
        status: 1
      };
      
      fetch(`${API_BASE_URL}/sys/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuData)
      })
      .then(response => handleResponse(response))
      .then(data => {
        logEvent('info', `修改菜单 ${data.menuName}`);
        closeModal();
        loadSysMenus();
        showMessage('sysMenuMessage', '修改成功', 'success');
      })
      .catch(error => {
        console.error('修改菜单失败:', error);
        showMessage('sysMenuMessage', '修改失败，请重试', 'error');
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', initMenuForms);
