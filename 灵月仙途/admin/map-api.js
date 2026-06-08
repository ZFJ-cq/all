/**
 * 地图管理 API 调用
 */

// 分页相关变量
let currentMapPage = 1;
const mapPageSize = 10;
let allMapsData = [];

// 加载地图列表（带分页）
function loadMaps(page = 1, pageSize = mapPageSize) {
  const tbody = document.getElementById('mapTableBody');
  const paginationContainer = document.getElementById('mapPagination');
  
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="13" style="text-align:center; color:#999;">加载中...</td></tr>';
  
  fetch(`${API_BASE_URL}/map`)
    .then(response => handleApiResponse(response))
    .then(data => {
      allMapsData = data || [];
      const totalItems = data.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const currentPageData = data.slice(startIndex, endIndex);
      
      tbody.innerHTML = '';
      if(currentPageData && currentPageData.length > 0) {
        currentPageData.forEach(map => {
          const statusColors = {
            0: '#999',
            1: '#4CAF50',
            2: '#FF9800'
          };
          const statusTexts = {
            0: '关闭',
            1: '开启',
            2: '维护'
          };
          const typeNames = {
            1: '主城',
            2: '野外',
            3: '副本',
            4: '秘境',
            5: '宗门'
          };
          
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${map.id}</td>
            <td>${map.mapCode}</td>
            <td>${map.mapName}</td>
            <td>${typeNames[map.mapType] || '未知'}</td>
            <td>${map.layerLevel}</td>
            <td>${map.recommendLevel}</td>
            <td>${map.recommendCombat}</td>
            <td>${map.monsterDensity || '-'}</td>
            <td>${map.dropWeight || '-'}</td>
            <td>${map.onlineCount}</td>
            <td><span style="color:${statusColors[map.status]}">${statusTexts[map.status]}</span></td>
            <td>
              <button class="btn btn-primary" onclick="editMap('${map.id}')">编辑</button>
              <button class="btn btn-danger" onclick="deleteMap('${map.id}')">删除</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="13" style="text-align:center; color:#999;">暂无地图数据</td></tr>';
      }
      
      // 创建分页控件
      setTimeout(() => {
        if (paginationContainer) {
          createPagination(
            'mapPagination',
            page,
            totalItems,
            pageSize,
            (newPage, newPageSize) => loadMaps(newPage, newPageSize),
            (newPageSize) => {}
          );
        }
      }, 100);
      
      currentMapPage = page;
    })
    .catch(error => {
      console.error('获取地图失败:', error);
      tbody.innerHTML = '<tr><td colspan="13" style="text-align:center; color:#999;">加载失败，请刷新重试</td></tr>';
      if (paginationContainer) {
        paginationContainer.innerHTML = '';
      }
    });
}

// 打开新增地图模态框
function openAddMapModal() {
  document.getElementById('addMapModal').style.display = 'flex';
}

// 关闭新增地图模态框
function closeAddMapModal() {
  document.getElementById('addMapModal').style.display = 'none';
  document.getElementById('addMapForm').reset();
}

// 编辑地图
function editMap(id) {
  const map = allMapsData.find(m => m.id == id);
  if (!map) return;
  
  document.getElementById('editMapId').value = map.id;
  document.getElementById('editMapCode').value = map.mapCode;
  document.getElementById('editMapName').value = map.mapName;
  document.getElementById('editMapType').value = map.mapType;
  document.getElementById('editLayerLevel').value = map.layerLevel;
  document.getElementById('editRecommendLevel').value = map.recommendLevel;
  document.getElementById('editRecommendCombat').value = map.recommendCombat;
  document.getElementById('editEnvironmentDesc').value = map.environmentDesc || '';
  document.getElementById('editMonsterDensity').value = map.monsterDensity || '';
  document.getElementById('editDropWeight').value = map.dropWeight || '';
  document.getElementById('editBackgroundResource').value = map.backgroundResource || '';
  document.getElementById('editMainProducts').value = map.mainProducts || '';
  document.getElementById('editStatus').value = map.status;
  document.getElementById('editWeatherType').value = map.weatherType || '';
  document.getElementById('editSpecialEvent').value = map.specialEvent || '';
  document.getElementById('editOnlineCount').value = map.onlineCount || 0;
  
  document.getElementById('editMapModal').style.display = 'flex';
}

// 关闭编辑地图模态框
function closeEditMapModal() {
  document.getElementById('editMapModal').style.display = 'none';
}

// 删除地图
function deleteMap(id) {
  if (!confirm('确定要删除这个地图吗？')) return;
  
  fetch(`${API_BASE_URL}/map/${id}`, {
    method: 'DELETE'
  })
  .then(() => {
    showSuccessMessage('删除成功');
    loadMaps(currentMapPage);
  })
  .catch(error => {
    console.error('删除失败:', error);
    showErrorMessage('删除失败');
  });
}

// 提交新增地图表单
function submitAddMapForm() {
  const map = {
    mapCode: document.getElementById('addMapCode').value,
    mapName: document.getElementById('addMapName').value,
    mapType: parseInt(document.getElementById('addMapType').value),
    layerLevel: parseInt(document.getElementById('addLayerLevel').value),
    recommendLevel: parseInt(document.getElementById('addRecommendLevel').value),
    recommendCombat: parseInt(document.getElementById('addRecommendCombat').value),
    environmentDesc: document.getElementById('addEnvironmentDesc').value,
    monsterDensity: document.getElementById('addMonsterDensity').value,
    dropWeight: document.getElementById('addDropWeight').value,
    backgroundResource: document.getElementById('addBackgroundResource').value,
    mainProducts: document.getElementById('addMainProducts').value,
    status: parseInt(document.getElementById('addStatus').value),
    weatherType: document.getElementById('addWeatherType').value,
    specialEvent: document.getElementById('addSpecialEvent').value,
    onlineCount: parseInt(document.getElementById('addOnlineCount').value) || 0
  };
  
  if (!map.mapCode || !map.mapName) {
    showErrorMessage('地图编码和名称不能为空');
    return;
  }
  
  fetch(`${API_BASE_URL}/map`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(map)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('添加失败');
    }
    return response.json();
  })
  .then(() => {
    showSuccessMessage('添加成功');
    closeAddMapModal();
    loadMaps(currentMapPage);
  })
  .catch(error => {
    console.error('添加失败:', error);
    showErrorMessage('添加失败');
  });
}

// 提交编辑地图表单
function submitEditMapForm() {
  const id = document.getElementById('editMapId').value;
  const map = {
    mapCode: document.getElementById('editMapCode').value,
    mapName: document.getElementById('editMapName').value,
    mapType: parseInt(document.getElementById('editMapType').value),
    layerLevel: parseInt(document.getElementById('editLayerLevel').value),
    recommendLevel: parseInt(document.getElementById('editRecommendLevel').value),
    recommendCombat: parseInt(document.getElementById('editRecommendCombat').value),
    environmentDesc: document.getElementById('editEnvironmentDesc').value,
    monsterDensity: document.getElementById('editMonsterDensity').value,
    dropWeight: document.getElementById('editDropWeight').value,
    backgroundResource: document.getElementById('editBackgroundResource').value,
    mainProducts: document.getElementById('editMainProducts').value,
    status: parseInt(document.getElementById('editStatus').value),
    weatherType: document.getElementById('editWeatherType').value,
    specialEvent: document.getElementById('editSpecialEvent').value,
    onlineCount: parseInt(document.getElementById('editOnlineCount').value) || 0
  };
  
  if (!map.mapCode || !map.mapName) {
    showErrorMessage('地图编码和名称不能为空');
    return;
  }
  
  fetch(`${API_BASE_URL}/map/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(map)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('更新失败');
    }
    return response.json();
  })
  .then(() => {
    showSuccessMessage('更新成功');
    closeEditMapModal();
    loadMaps(currentMapPage);
  })
  .catch(error => {
    console.error('更新失败:', error);
    showErrorMessage('更新失败');
  });
}
