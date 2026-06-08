package com.lingyue.service.impl;

import com.lingyue.entity.MapNode;
import com.lingyue.service.MapCoordinateService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MapCoordinateServiceImpl implements MapCoordinateService {

    private static final double SCALE_FACTOR = 0.01; // 屏幕到地图的缩放因子
    private static final double VERTICAL_RATIO = 1.5; // 竖屏纵向比例
    private static final double MAP_WIDTH = 1000.0; // 地图宽度
    private static final double MAP_HEIGHT = 2000.0; // 地图高度（竖屏更长）

    @Override
    public Map<String, Double> screenToMapCoordinates(double screenX, double screenY, int screenWidth, int screenHeight) {
        // 屏幕中心偏下作为原点
        double centerX = screenWidth / 2.0;
        double centerY = screenHeight * 0.7;
        
        // 转换为地图坐标
        double mapX = (screenX - centerX) * SCALE_FACTOR;
        double mapY = (screenY - centerY) * SCALE_FACTOR * VERTICAL_RATIO;
        
        Map<String, Double> result = new HashMap<>();
        result.put("x", mapX);
        result.put("y", mapY);
        return result;
    }

    @Override
    public Map<String, Double> mapToScreenCoordinates(double mapX, double mapY, int screenWidth, int screenHeight) {
        // 屏幕中心偏下作为原点
        double centerX = screenWidth / 2.0;
        double centerY = screenHeight * 0.7;
        
        // 转换为屏幕坐标
        double screenX = mapX / SCALE_FACTOR + centerX;
        double screenY = mapY / (SCALE_FACTOR * VERTICAL_RATIO) + centerY;
        
        Map<String, Double> result = new HashMap<>();
        result.put("x", screenX);
        result.put("y", screenY);
        return result;
    }

    @Override
    public boolean checkCollision(double x1, double y1, double x2, double y2, double radius) {
        double distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return distance < radius * 2;
    }

    @Override
    public List<Map<String, Double>> getAOI(double centerX, double centerY, double radius) {
        List<Map<String, Double>> aoi = new ArrayList<>();
        
        // 纵向长条形AOI区域
        double verticalRadius = radius * VERTICAL_RATIO;
        double horizontalRadius = radius / VERTICAL_RATIO;
        
        // 生成AOI边界
        Map<String, Double> topLeft = new HashMap<>();
        topLeft.put("x", centerX - horizontalRadius);
        topLeft.put("y", centerY - verticalRadius);
        aoi.add(topLeft);
        
        Map<String, Double> topRight = new HashMap<>();
        topRight.put("x", centerX + horizontalRadius);
        topRight.put("y", centerY - verticalRadius);
        aoi.add(topRight);
        
        Map<String, Double> bottomLeft = new HashMap<>();
        bottomLeft.put("x", centerX - horizontalRadius);
        bottomLeft.put("y", centerY + verticalRadius);
        aoi.add(bottomLeft);
        
        Map<String, Double> bottomRight = new HashMap<>();
        bottomRight.put("x", centerX + horizontalRadius);
        bottomRight.put("y", centerY + verticalRadius);
        aoi.add(bottomRight);
        
        return aoi;
    }

    @Override
    public List<Map<String, Double>> calculatePath(double startX, double startY, double endX, double endY, MapNode map) {
        List<Map<String, Double>> path = new ArrayList<>();
        
        // 简化的A*寻路算法
        // 实际项目中应该使用更复杂的寻路算法
        
        // 添加起点
        Map<String, Double> startPoint = new HashMap<>();
        startPoint.put("x", startX);
        startPoint.put("y", startY);
        path.add(startPoint);
        
        // 添加中间点（简化处理）
        Map<String, Double> midPoint = new HashMap<>();
        midPoint.put("x", (startX + endX) / 2);
        midPoint.put("y", (startY + endY) / 2);
        path.add(midPoint);
        
        // 添加终点
        Map<String, Double> endPoint = new HashMap<>();
        endPoint.put("x", endX);
        endPoint.put("y", endY);
        path.add(endPoint);
        
        return path;
    }

    @Override
    public boolean isWithinBounds(double x, double y, MapNode map) {
        // 检查坐标是否在地图边界内
        return x >= -MAP_WIDTH / 2 && x <= MAP_WIDTH / 2 && y >= -MAP_HEIGHT / 2 && y <= MAP_HEIGHT / 2;
    }
}
