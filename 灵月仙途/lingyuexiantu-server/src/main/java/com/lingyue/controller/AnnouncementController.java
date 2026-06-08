package com.lingyue.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/announcement")
public class AnnouncementController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnnouncements() {
        try {
            String sql = "SELECT id, title, content, type, status, created_at, updated_at " +
                        "FROM announcement " +
                        "WHERE status = 'active' " +
                        "ORDER BY created_at DESC";
            
            List<Map<String, Object>> announcements = jdbcTemplate.queryForList(sql);
            
            List<Map<String, Object>> resultList = new ArrayList<>();
            for (Map<String, Object> ann : announcements) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", ann.get("id"));
                item.put("title", ann.get("title"));
                item.put("content", ann.get("content"));
                item.put("type", ann.get("type"));
                item.put("status", ann.get("status"));
                item.put("createdAt", ann.get("created_at"));
                item.put("updatedAt", ann.get("updated_at"));
                resultList.add(item);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("announcements", resultList);
            result.put("total", resultList.size());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "获取公告失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getAnnouncementById(@PathVariable Long id) {
        try {
            String sql = "SELECT id, title, content, type, status, created_at, updated_at " +
                        "FROM announcement WHERE id = ?";
            
            List<Map<String, Object>> announcements = jdbcTemplate.queryForList(sql, id);
            
            if (announcements.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "公告不存在"));
            }
            
            Map<String, Object> ann = announcements.get(0);
            Map<String, Object> item = new HashMap<>();
            item.put("id", ann.get("id"));
            item.put("title", ann.get("title"));
            item.put("content", ann.get("content"));
            item.put("type", ann.get("type"));
            item.put("status", ann.get("status"));
            item.put("createdAt", ann.get("created_at"));
            item.put("updatedAt", ann.get("updated_at"));
            
            Map<String, Object> result = new HashMap<>();
            result.put("announcement", item);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "获取公告失败: " + e.getMessage()));
        }
    }
}
