/**
 * 灵月仙途 - 后台管理 - 确认弹窗组件
 * 功能：
 * 1. 二次确认弹窗
 * 2. 数据校验
 * 3. 操作安全保障
 */

window.ConfirmDialog = (function() {
  // 确认弹窗模板
  const confirmTemplate = `
    <div class="confirm-modal">
      <div class="confirm-content">
        <h3 class="confirm-title"></h3>
        <div class="confirm-message"></div>
        <div class="confirm-actions">
          <button class="confirm-btn">确认</button>
          <button class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  `;

  // 样式
  const style = `
    .confirm-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    .confirm-content {
      background: white;
      border-radius: 8px;
      padding: 20px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .confirm-title {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 18px;
    }
    .confirm-message {
      margin-bottom: 20px;
      color: #666;
      line-height: 1.5;
    }
    .confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .confirm-btn, .cancel-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .confirm-btn {
      background: #409eff;
      color: white;
    }
    .confirm-btn:hover {
      background: #66b1ff;
    }
    .cancel-btn {
      background: #909399;
      color: white;
    }
    .cancel-btn:hover {
      background: #a6a9ad;
    }
  `;

  // 数据校验规则
  const validationRules = {
    required: (value) => !!value && value.trim() !== '',
    number: (value) => !isNaN(parseFloat(value)) && isFinite(value),
    positive: (value) => parseFloat(value) > 0,
    nonNegative: (value) => parseFloat(value) >= 0,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    maxLength: (max) => (value) => value.length <= max,
    minLength: (min) => (value) => value.length >= min
  };

  // 初始化样式
  function initStyle() {
    if (!document.getElementById('confirm-dialog-style')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'confirm-dialog-style';
      styleElement.textContent = style;
      document.head.appendChild(styleElement);
    }
  }

  // 显示确认弹窗
  function showConfirm(title, message, onConfirm, onCancel) {
    initStyle();
    
    const modal = document.createElement('div');
    modal.innerHTML = confirmTemplate;
    modal.querySelector('.confirm-title').textContent = title;
    modal.querySelector('.confirm-message').textContent = message;
    
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
      if (onConfirm) onConfirm();
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
      if (onCancel) onCancel();
      document.body.removeChild(modal);
    });
    
    // 点击外部关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        if (onCancel) onCancel();
        document.body.removeChild(modal);
      }
    });
    
    document.body.appendChild(modal);
  }

  // 数据校验
  function validate(data, rules) {
    const errors = [];
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field];
      
      for (const [rule, options] of Object.entries(fieldRules)) {
        let isValid = true;
        let message = '';
        
        switch (rule) {
          case 'required':
            isValid = validationRules.required(value);
            message = options.message || `${field}不能为空`;
            break;
          case 'number':
            isValid = validationRules.number(value);
            message = options.message || `${field}必须是数字`;
            break;
          case 'positive':
            isValid = validationRules.positive(value);
            message = options.message || `${field}必须大于0`;
            break;
          case 'nonNegative':
            isValid = validationRules.nonNegative(value);
            message = options.message || `${field}不能为负数`;
            break;
          case 'email':
            isValid = validationRules.email(value);
            message = options.message || `${field}格式不正确`;
            break;
          case 'maxLength':
            isValid = validationRules.maxLength(options.value)(value);
            message = options.message || `${field}长度不能超过${options.value}个字符`;
            break;
          case 'minLength':
            isValid = validationRules.minLength(options.value)(value);
            message = options.message || `${field}长度不能少于${options.value}个字符`;
            break;
        }
        
        if (!isValid) {
          errors.push(message);
          break;
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 带确认的操作
  function confirmAction(title, message, action, data, rules) {
    return new Promise((resolve, reject) => {
      // 数据校验
      if (rules) {
        const validation = validate(data, rules);
        if (!validation.isValid) {
          reject(new Error(validation.errors.join('\n')));
          return;
        }
      }
      
      showConfirm(title, message, async () => {
        try {
          const result = await action();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, () => {
        reject(new Error('操作已取消'));
      });
    });
  }

  return {
    showConfirm,
    validate,
    confirmAction,
    validationRules
  };
})();

console.log('ConfirmDialog 已初始化');
