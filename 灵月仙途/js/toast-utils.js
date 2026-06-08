/**
 * 通用提示工具
 * 替代浏览器默认的 alert() 和 confirm()
 */

// 显示提示消息
function showToast(message, type = 'info', duration = 3000) {
  const colors = {
    info: '#2196F3',
    success: '#4CAF50',
    error: '#f44336',
    warning: '#FF9800'
  };
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${colors[type]};
    color: #fff;
    padding: 12px 30px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideDown 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration - 300);
}

// 显示确认对话框
function showConfirm(title, message, onConfirm, onCancel) {
  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(3px);
  `;
  
  // 创建对话框
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: rgba(20, 25, 45, 0.95);
    border: 2px solid #e6c749;
    border-radius: 12px;
    padding: 20px;
    width: 85%;
    max-width: 400px;
    box-shadow: 0 0 30px rgba(230, 199, 73, 0.4);
  `;
  
  // 标题
  const dialogTitle = document.createElement('div');
  dialogTitle.style.cssText = `
    font-size: 1.2rem;
    color: #e6c749;
    text-align: center;
    margin-bottom: 15px;
    font-weight: bold;
  `;
  dialogTitle.textContent = title;
  
  // 内容
  const dialogBody = document.createElement('div');
  dialogBody.style.cssText = `
    color: #d4c5a9;
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: 20px;
    text-align: center;
  `;
  dialogBody.textContent = message;
  
  // 按钮容器
  const dialogFooter = document.createElement('div');
  dialogFooter.style.cssText = `
    display: flex;
    gap: 10px;
  `;
  
  // 取消按钮
  const cancelBtn = document.createElement('button');
  cancelBtn.style.cssText = `
    flex: 1;
    padding: 10px;
    background: rgba(255,255,255,0.1);
    border: 1px solid #e6c749;
    color: #e6c749;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
  `;
  cancelBtn.textContent = '取消';
  cancelBtn.onclick = function() {
    if (onCancel) onCancel();
    document.body.removeChild(overlay);
  };
  
  // 确认按钮
  const confirmBtn = document.createElement('button');
  confirmBtn.style.cssText = `
    flex: 1;
    padding: 10px;
    background: linear-gradient(90deg, transparent, rgba(230,199,73,0.2), transparent);
    border: 1px solid #e6c749;
    color: #e6c749;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
  `;
  confirmBtn.textContent = '确认';
  confirmBtn.onclick = function() {
    if (onConfirm) onConfirm();
    document.body.removeChild(overlay);
  };
  
  // 组装
  dialogFooter.appendChild(cancelBtn);
  dialogFooter.appendChild(confirmBtn);
  dialog.appendChild(dialogTitle);
  dialog.appendChild(dialogBody);
  dialog.appendChild(dialogFooter);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

// 动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// 全局挂载
window.showToast = showToast;
window.showConfirm = showConfirm;