/**
 * 通用分页组件
 */

// 分页配置
const PaginationConfig = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50]
};

// 创建分页控件
function createPagination(containerId, currentPage, totalItems, pageSize, onPageChange, onPageSizeChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalPages = Math.ceil(totalItems / pageSize);
  
  let html = `
    <div class="pagination-container">
      <div class="pagination-info">
        共 ${totalItems} 条记录，每页 
        <select class="pagination-page-size" onchange="handlePageSizeChange('${containerId}', ${currentPage}, this.value, ${totalItems}, ${onPageChange}, ${onPageSizeChange})">
          ${PaginationConfig.pageSizeOptions.map(size => 
            `<option value="${size}" ${size === pageSize ? 'selected' : ''}>${size}</option>`
          ).join('')}
        </select> 条
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" onclick="handlePageChange('${containerId}', ${currentPage - 1}, ${totalPages}, ${pageSize}, ${totalItems}, ${onPageChange})" ${currentPage === 1 ? 'disabled' : ''}>首页</button>
        <button class="pagination-btn" onclick="handlePageChange('${containerId}', ${currentPage - 1}, ${totalPages}, ${pageSize}, ${totalItems}, ${onPageChange})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>
        <span class="pagination-info-text">第 ${currentPage} / ${totalPages} 页</span>
        <button class="pagination-btn" onclick="handlePageChange('${containerId}', ${currentPage + 1}, ${totalPages}, ${pageSize}, ${totalItems}, ${onPageChange})" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>下一页</button>
        <button class="pagination-btn" onclick="handlePageChange('${containerId}', ${totalPages}, ${totalPages}, ${pageSize}, ${totalItems}, ${onPageChange})" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>末页</button>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

// 处理页码变化
function handlePageChange(containerId, page, totalPages, pageSize, totalItems, callback) {
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  
  if (typeof callback === 'function') {
    callback(page, pageSize);
  }
}

// 处理每页条数变化
function handlePageSizeChange(containerId, currentPage, newPageSize, totalItems, pageCallback, sizeCallback) {
  const pageSize = parseInt(newPageSize);
  
  if (typeof sizeCallback === 'function') {
    sizeCallback(pageSize);
  }
  
  // 重新计算总页数并跳转到第一页
  if (typeof pageCallback === 'function') {
    pageCallback(1, pageSize);
  }
}

// 对数组进行分页
function paginateArray(array, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
}
