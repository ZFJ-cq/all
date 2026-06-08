/**
 * 权限管理 API
 */

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getAllPermissions() {
  return fetch(`${API_BASE_URL}/sys/permission`, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('请求失败');
      return response.json();
    });
}

function getPermissionsByCategory(category) {
  return fetch(`${API_BASE_URL}/sys/permission/category/${category}`, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('请求失败');
      return response.json();
    });
}

function getPermissionsByRoleId(roleId) {
  return fetch(`${API_BASE_URL}/sys/permission/role/${roleId}`, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('请求失败');
      return response.json();
    });
}

function getPermissionsByUserId(userId) {
  return fetch(`${API_BASE_URL}/sys/permission/user/${userId}`, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('请求失败');
      return response.json();
    });
}

function checkPermission(userId, permissionCode) {
  return fetch(`${API_BASE_URL}/sys/permission/check?userId=${userId}&permissionCode=${permissionCode}`, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('请求失败');
      return response.json();
    });
}

function assignPermissionsToRole(roleId, permissionIds) {
  return fetch(`${API_BASE_URL}/sys/permission/role/${roleId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(permissionIds)
  })
  .then(response => {
    if (!response.ok) throw new Error('请求失败');
    return response.json();
  });
}

function savePermission(permission) {
  return fetch(`${API_BASE_URL}/sys/permission`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(permission)
  })
  .then(response => {
    if (!response.ok) throw new Error('请求失败');
    return response.json();
  });
}

function updatePermission(id, permission) {
  return fetch(`${API_BASE_URL}/sys/permission/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(permission)
  })
  .then(response => {
    if (!response.ok) throw new Error('请求失败');
    return response.json();
  });
}

function deletePermission(id) {
  return fetch(`${API_BASE_URL}/sys/permission/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) throw new Error('请求失败');
    return response.json();
  });
}

function getOperationLogs(page = 1, size = 20) {
  return fetch(`${API_BASE_URL}/system/log/operation?page=${page}&size=${size}`, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('请求失败');
      return response.json();
    });
}

function searchOperationLogs(params, page = 1, size = 20) {
  const queryString = new URLSearchParams(params).toString();
  return fetch(`${API_BASE_URL}/system/log/operation/search?${queryString}&page=${page}&size=${size}`, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('请求失败');
      return response.json();
    });
}

function getSensitiveLogs() {
  return fetch(`${API_BASE_URL}/system/log/operation/sensitive`, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('请求失败');
      return response.json();
    });
}

function getLoginLogs(page = 1, size = 20) {
  return fetch(`${API_BASE_URL}/system/log/login?page=${page}&size=${size}`, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('请求失败');
      return response.json();
    });
}

function getOperationStatistics() {
  return fetch(`${API_BASE_URL}/system/log/operation/statistics`, {
    headers: getAuthHeaders()
  })
    .then(response => {
      if (!response.ok) throw new Error('请求失败');
      return response.json();
    });
}
