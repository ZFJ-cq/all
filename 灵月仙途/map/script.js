class InteractiveMap {
    constructor() {
        // 获取DOM元素
        this.mapContainer = document.getElementById('mapContainer');
        this.mapRegions = document.getElementById('mapRegions');
        this.infoPanel = document.getElementById('infoPanel');
        this.regionTitle = document.getElementById('regionTitle');
        this.regionDesc = document.getElementById('regionDesc');
        this.enterRegionBtn = document.getElementById('enterRegionBtn');
        this.detailBtn = document.getElementById('detailBtn');
        this.closePanelBtn = document.getElementById('closePanelBtn');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.closeWelcomeBtn = document.getElementById('closeWelcomeBtn');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // 获取地图图片元素
        this.mapImage = document.getElementById('mapImage');
        
        // 获取统计元素
        this.statLingqi = document.getElementById('statLingqi');
        this.statDanger = document.getElementById('statDanger');
        this.statResource = document.getElementById('statResource');
        
        // 当前选中区域
        this.currentRegion = null;
        this.currentMarker = null;
        
        // 触摸事件状态
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.isDragging = false;
        this.lastTouchTime = 0;
        
        // 区域数据（九大修仙区域）- 使用百分比位置
        this.regionData = {
            zhongtu: {
                title: '中土皇城',
                desc: '修仙界中心，灵气浓郁，宗门林立。此地汇聚天下英才，是修仙问道的圣地。',
                lingqi: '极高',
                danger: '低',
                resource: '灵脉、功法',
                enterText: '前往中土皇城',
                position: { top: 15, left: 50 } // 百分比位置
            },
            donghuang: {
                title: '东荒竹林',
                desc: '竹海连绵，剑意纵横。此地乃剑修圣地，无数剑仙在此悟道。',
                lingqi: '高',
                danger: '中',
                resource: '剑竹、剑谱',
                enterText: '探索东荒竹林',
                position: { top: 35, left: 25 }
            },
            xiji: {
                title: '西极佛寺',
                desc: '佛光普照，梵音缭绕。西域佛宗传承千年，注重心性修为。',
                lingqi: '中',
                danger: '低',
                resource: '佛经、舍利',
                enterText: '参拜西极佛寺',
                position: { top: 25, left: 75 }
            },
            nanman: {
                title: '南蛮森林',
                desc: '瘴气弥漫，毒虫横行。神秘巫族世代居住于此，掌握上古巫术。',
                lingqi: '中',
                danger: '高',
                resource: '毒草、蛊虫',
                enterText: '深入南蛮森林',
                position: { top: 55, left: 35 }
            },
            beishuo: {
                title: '北朔雪原',
                desc: '冰雪覆盖，寒冰刺骨。北境修士修炼寒冰道法，意志如钢。',
                lingqi: '中',
                danger: '中',
                resource: '冰晶、寒玉',
                enterText: '踏足北朔雪原',
                position: { top: 20, left: 85 }
            },
            donghai: {
                title: '蓬莱仙岛',
                desc: '海上仙山，云雾缭绕。传说中仙人居住之地，机缘无数。',
                lingqi: '极高',
                danger: '高',
                resource: '仙草、灵兽',
                enterText: '寻访蓬莱仙岛',
                position: { top: 45, left: 65 }
            },
            xihai: {
                title: '金沙群岛',
                desc: '沙海群岛，佛国遗迹。西域佛宗传承分支，保留上古佛法。',
                lingqi: '中',
                danger: '中',
                resource: '金沙、佛骨',
                enterText: '探秘金沙群岛',
                position: { top: 65, left: 15 }
            },
            nanhai: {
                title: '火山群岛',
                desc: '岩浆翻涌，火灵充沛。火系修士的修炼宝地，危机与机遇并存。',
                lingqi: '高',
                danger: '极高',
                resource: '火晶、炎髓',
                enterText: '挑战火山群岛',
                position: { top: 70, left: 55 }
            },
            beihai: {
                title: '冰川浮岛',
                desc: '寒冰漂浮，玄冥之气。上古冰修遗迹，藏有寒冰秘法。',
                lingqi: '中',
                danger: '高',
                resource: '玄冰、古符',
                enterText: '探索冰川浮岛',
                position: { top: 80, left: 80 }
            }
        };

        this.init();
    }

    init() {
        // 显示加载动画
        this.showLoading();
        
        // 等待图片加载完成
        this.waitForImageLoad(() => {
            this.hideLoading();
            this.bindEvents();
            this.showWelcomeMessage();
            this.initializeMarkers();
        });
    }

    // 等待图片加载完成
    waitForImageLoad(callback) {
        if (this.mapImage && this.mapImage.complete) {
            callback();
        } else if (this.mapImage) {
            this.mapImage.onload = callback;
            this.mapImage.onerror = callback; // 即使加载失败也继续
        } else {
            setTimeout(callback, 1000);
        }
    }

    showLoading() {
        this.loadingOverlay.style.display = 'flex';
        this.loadingOverlay.style.opacity = '1';
    }

    hideLoading() {
        this.loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            this.loadingOverlay.style.display = 'none';
        }, 300);
    }

    bindEvents() {
        // 欢迎消息关闭
        this.closeWelcomeBtn.addEventListener('click', () => {
            this.hideWelcomeMessage();
        });

        // 区域标记点击事件
        this.mapRegions.addEventListener('click', (e) => {
            const marker = e.target.closest('.region-marker');
            if (marker) {
                const regionId = marker.dataset.region;
                this.showInfoPanel(regionId);
                this.highlightMarker(marker);
            }
        });

        // 关闭面板按钮
        this.closePanelBtn.addEventListener('click', () => {
            this.hideInfoPanel();
            this.clearMarkerHighlight();
        });

        // 进入区域按钮
        this.enterRegionBtn.addEventListener('click', () => {
            if (this.currentRegion) {
                this.enterRegion(this.currentRegion);
            }
        });

        // 查看详情按钮
        this.detailBtn.addEventListener('click', () => {
            if (this.currentRegion) {
                this.showDetail(this.currentRegion);
            }
        });

        // 功能卡片点击事件
        document.querySelectorAll('.card-item').forEach(card => {
            card.addEventListener('click', () => {
                const cardType = card.dataset.card;
                this.useCardFunction(cardType);
            });
        });

        // 触摸事件 - 支持滑动
        this.mapContainer.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.isDragging = false;
            this.lastTouchTime = Date.now();
        });

        this.mapContainer.addEventListener('touchmove', (e) => {
            if (!this.isDragging) {
                const deltaX = Math.abs(e.touches[0].clientX - this.touchStartX);
                const deltaY = Math.abs(e.touches[0].clientY - this.touchStartY);
                
                // 检测是否为滑动操作（移动距离超过阈值）
                if (deltaX > 10 || deltaY > 10) {
                    this.isDragging = true;
                }
            }
            
            // 阻止默认行为以防止页面滚动
            if (this.isDragging) {
                e.preventDefault();
            }
        });

        this.mapContainer.addEventListener('touchend', (e) => {
            if (this.isDragging) {
                this.touchEndX = e.changedTouches[0].clientX;
                this.touchEndY = e.changedTouches[0].clientY;
                
                const deltaX = this.touchEndX - this.touchStartX;
                const deltaY = this.touchEndY - this.touchStartY;
                const touchDuration = Date.now() - this.lastTouchTime;
                
                // 判断滑动方向（主要考虑水平滑动）
                if (Math.abs(deltaX) > Math.abs(deltaY) && touchDuration < 500) {
                    // 水平滑动
                    if (deltaX > 50) {
                        // 向右滑动
                        this.handleSwipe('right');
                    } else if (deltaX < -50) {
                        // 向左滑动
                        this.handleSwipe('left');
                    }
                } else if (Math.abs(deltaY) > Math.abs(deltaX) && touchDuration < 500) {
                    // 垂直滑动
                    if (deltaY > 50) {
                        // 向下滑动
                        this.handleSwipe('down');
                    } else if (deltaY < -50) {
                        // 向上滑动
                        this.handleSwipe('up');
                    }
                }
            }
            
            this.isDragging = false;
        });

        // 窗口大小变化时重新计算标记位置
        window.addEventListener('resize', () => {
            this.adjustMarkerPositions();
        });
    }

    // 初始化区域标记
    initializeMarkers() {
        // 清空现有标记
        this.mapRegions.innerHTML = '';
        
        // 为每个区域创建标记
        Object.entries(this.regionData).forEach(([regionId, region]) => {
            if (region.position) {
                this.createMarker(regionId, region);
            }
        });
        
        // 调整标记位置以适应不同屏幕
        this.adjustMarkerPositions();
    }

    // 创建标记
    createMarker(regionId, region) {
        const marker = document.createElement('div');
        marker.className = 'region-marker';
        marker.dataset.region = regionId;
        
        // 使用百分比位置
        marker.style.top = `${region.position.top}%`;
        marker.style.left = `${region.position.left}%`;
        
        const icon = document.createElement('div');
        icon.className = 'marker-icon';
        
        // 根据区域设置不同图标
        const iconMap = {
            'zhongtu': '🏯',
            'donghuang': '🎋',
            'xiji': '🙏',
            'nanman': '🌿',
            'beishuo': '❄️',
            'donghai': '⛰️',
            'xihai': '🏜️',
            'nanhai': '🌋',
            'beihai': '🧊'
        };
        icon.textContent = iconMap[regionId] || '🏛️';
        
        const label = document.createElement('div');
        label.className = 'marker-label';
        label.textContent = region.title;
        
        marker.appendChild(icon);
        marker.appendChild(label);
        this.mapRegions.appendChild(marker);
    }

    // 调整标记位置 - 修复后的版本
    adjustMarkerPositions() {
        // 确保 mapImage 存在
        if (!this.mapImage) {
            console.warn('地图图片元素不存在，使用默认百分比位置');
            return;
        }
        
        Object.entries(this.regionData).forEach(([regionId, region]) => {
            const marker = this.mapRegions.querySelector(`[data-region="${regionId}"]`);
            if (marker && region.position) {
                // 如果图片已加载，使用图片尺寸
                if (this.mapImage.complete && this.mapImage.naturalWidth > 0) {
                    const containerRect = this.mapContainer.getBoundingClientRect();
                    const imgRect = this.mapImage.getBoundingClientRect();
                    
                    // 计算实际像素位置
                    const posX = (region.position.left / 100) * imgRect.width;
                    const posY = (region.position.top / 100) * imgRect.height;
                    
                    // 转换为相对于容器的位置
                    const relativeX = (posX / imgRect.width) * 100;
                    const relativeY = (posY / imgRect.height) * 100;
                    
                    marker.style.left = `${relativeX}%`;
                    marker.style.top = `${relativeY}%`;
                } else {
                    // 图片未加载，使用百分比位置
                    marker.style.left = `${region.position.left}%`;
                    marker.style.top = `${region.position.top}%`;
                }
            }
        });
    }

    // 显示信息面板
    showInfoPanel(regionId) {
        const region = this.regionData[regionId];
        if (!region) {
            console.warn(`区域 ${regionId} 不存在`);
            return;
        }
        
        this.currentRegion = regionId;
        
        // 更新面板内容
        this.regionTitle.textContent = region.title;
        this.regionDesc.textContent = region.desc;
        this.statLingqi.textContent = region.lingqi;
        this.statDanger.textContent = region.danger;
        this.statResource.textContent = region.resource;
        this.enterRegionBtn.textContent = region.enterText;
        
        // 根据危险等级设置颜色
        this.setDangerColor(region.danger);
        
        // 显示面板
        this.infoPanel.classList.add('active');
        
        // 记录当前标记
        this.currentMarker = this.mapRegions.querySelector(`[data-region="${regionId}"]`);
    }

    // 设置危险等级颜色
    setDangerColor(dangerLevel) {
        const colors = {
            '低': '#4CAF50',
            '中': '#FF9800',
            '高': '#F44336',
            '极高': '#9C27B0'
        };
        this.statDanger.style.color = colors[dangerLevel] || '#a67c52';
    }

    // 隐藏信息面板
    hideInfoPanel() {
        this.infoPanel.classList.remove('active');
        this.currentRegion = null;
    }

    // 高亮标记
    highlightMarker(marker) {
        // 清除所有标记的高亮
        document.querySelectorAll('.region-marker').forEach(m => {
            m.style.transform = 'translate(-50%, -50%)';
            m.style.zIndex = '10';
            m.style.boxShadow = 'none';
        });
        
        // 高亮当前标记
        marker.style.transform = 'translate(-50%, -50%) scale(1.3)';
        marker.style.zIndex = '20';
        marker.style.boxShadow = '0 0 15px rgba(139, 90, 43, 0.7)';
    }

    // 清除标记高亮
    clearMarkerHighlight() {
        if (this.currentMarker) {
            this.currentMarker.style.transform = 'translate(-50%, -50%)';
            this.currentMarker.style.zIndex = '10';
            this.currentMarker.style.boxShadow = 'none';
            this.currentMarker = null;
        }
    }

    // 进入区域
    enterRegion(regionId) {
        const region = this.regionData[regionId];
        if (!region) return;
        
        // 显示进入动画
        this.showLoading();
        
        setTimeout(() => {
            this.hideLoading();
            
            const message = `成功进入 ${region.title}！\n\n${region.desc}\n\n灵气浓度：${region.lingqi}\n危险等级：${region.danger}\n主要资源：${region.resource}`;
            
            showToast(`成功进入 ${region.title}！`);
            
            this.hideInfoPanel();
            this.clearMarkerHighlight();
        }, 1000);
    }

    // 查看详情
    showDetail(regionId) {
        const region = this.regionData[regionId];
        if (!region) return;
        
        const detailHtml = `
            <div style="max-width: 90vw; max-height: 80vh; overflow-y: auto; padding: 20px; background: white; border-radius: 10px; text-align: left;">
                <h3 style="color: #8b5a2b; margin-bottom: 15px; text-align: center;">${region.title} 详情</h3>
                <p style="color: #666; margin-bottom: 15px; line-height: 1.6;">${region.desc}</p>
                <div style="background: #f8f5f0; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h4 style="color: #8b5a2b; margin-bottom: 10px;">区域属性</h4>
                    <p style="margin: 5px 0;"><strong>灵气浓度：</strong>${region.lingqi}</p>
                    <p style="margin: 5px 0;"><strong>危险等级：</strong>${region.danger}</p>
                    <p style="margin: 5px 0;"><strong>主要资源：</strong>${region.resource}</p>
                </div>
                <div style="background: #f8f5f0; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h4 style="color: #8b5a2b; margin-bottom: 10px;">探索建议</h4>
                    <p style="margin: 5px 0;">建议筑基期以上修士进入</p>
                    <p style="margin: 5px 0;">探索时间：3-7天</p>
                    <p style="margin: 5px 0;">推荐队伍：3-5人</p>
                </div>
            </div>
        `;
        
        // 创建弹窗
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        modal.innerHTML = detailHtml;
        
        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        document.body.appendChild(modal);
    }

    // 使用功能卡片
    useCardFunction(cardType) {
        switch (cardType) {
            case 'world':
                showToast('世界地图：查看完整的修仙世界地图布局');
                break;
            case 'location':
                showToast('我的位置：显示当前所在位置，导航到附近地点');
                break;
            case 'settings':
                showToast('地图设置：调整地图显示选项');
                break;
            case 'legend':
                showToast('图例说明：查看地图上各种标记的含义');
                break;
        }
    }

    // 处理滑动事件
    handleSwipe(direction) {
        // 在竖屏模式下，滑动可以用于快速浏览
        if (direction === 'left' || direction === 'right') {
            // 查找下一个/上一个区域
            const regions = Object.keys(this.regionData);
            if (this.currentRegion) {
                const currentIndex = regions.indexOf(this.currentRegion);
                let nextIndex = currentIndex;
                
                if (direction === 'right') {
                    nextIndex = (currentIndex + 1) % regions.length;
                } else {
                    nextIndex = (currentIndex - 1 + regions.length) % regions.length;
                }
                
                const nextRegion = regions[nextIndex];
                const marker = this.mapRegions.querySelector(`[data-region="${nextRegion}"]`);
                if (marker) {
                    this.showInfoPanel(nextRegion);
                    this.highlightMarker(marker);
                }
            }
        }
    }

    // 显示欢迎消息
    showWelcomeMessage() {
        this.welcomeMessage.style.display = 'flex';
        setTimeout(() => {
            this.welcomeMessage.style.opacity = '1';
        }, 100);
        
        // 5秒后自动隐藏
        setTimeout(() => {
            this.hideWelcomeMessage();
        }, 5000);
    }

    // 隐藏欢迎消息
    hideWelcomeMessage() {
        this.welcomeMessage.style.opacity = '0';
        setTimeout(() => {
            this.welcomeMessage.style.display = 'none';
        }, 300);
    }
}

// 页面加载完成后初始化地图
document.addEventListener('DOMContentLoaded', () => {
    const map = new InteractiveMap();
    
    // 在全局暴露，便于调试
    window.mapInstance = map;
});