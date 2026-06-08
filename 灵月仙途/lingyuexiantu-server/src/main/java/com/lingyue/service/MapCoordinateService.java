package com.lingyue.service;

import com.lingyue.entity.MapNode;
import java.util.List;
import java.util.Map;

public interface MapCoordinateService {
    
    /**
     * 转换屏幕坐标到地图坐标（竖屏适配）
     */
    Map<String, Double> screenToMapCoordinates(double screenX, double screenY, int screenWidth, int screenHeight);
    
    /**
     * 转换地图坐标到屏幕坐标（竖屏适配）
     */
    Map<String, Double> mapToScreenCoordinates(double mapX, double mapY, int screenWidth, int screenHeight);
    
    /**
     * 检测碰撞
     */
    boolean checkCollision(double x1, double y1, double x2, double y2, double radius);
    
    /**
     * 获取AOI区域（纵向长条形）
     */
    List<Map<String, Double>> getAOI(double centerX, double centerY, double radius);
    
    /**
     * 计算寻路路径
     */
    List<Map<String, Double>> calculatePath(double startX, double startY, double endX, double endY, MapNode map);
    
    /**
     * 验证坐标是否在地图边界内
     */
    boolean isWithinBounds(double x, double y, MapNode map);
}
