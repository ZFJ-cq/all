package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.SystemLog;
import com.lingyue.service.SystemLogService;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/logs")
public class SystemLogController {
    
    private final SystemLogService logService;
    
    public SystemLogController(SystemLogService logService) {
        this.logService = logService;
    }

    // 获取所有日志
    @GetMapping
    public List<SystemLog> getAllLogs() {
        return logService.getAllLogs();
    }

    // 根据时间范围获取日志
    @GetMapping("/time-range")
    public List<SystemLog> getLogsByTimeRange(
            @RequestParam("start") String start,
            @RequestParam("end") String end) {
        LocalDateTime startTime = LocalDateTime.parse(start);
        LocalDateTime endTime = LocalDateTime.parse(end);
        return logService.getLogsByTimeRange(startTime, endTime);
    }

    // 根据级别获取日志
    @GetMapping("/level/{level}")
    public List<SystemLog> getLogsByLevel(@PathVariable String level) {
        return logService.getLogsByLevel(level);
    }

    // 根据来源获取日志
    @GetMapping("/source/{source}")
    public List<SystemLog> getLogsBySource(@PathVariable String source) {
        return logService.getLogsBySource(source);
    }

    // 清空日志
    @DeleteMapping("/clear")
    public void clearLogs() {
        logService.clearLogs();
    }

    // 删除指定时间之前的日志
    @DeleteMapping("/before/{date}")
    public void deleteLogsBefore(@PathVariable String date) {
        LocalDateTime beforeDate = LocalDateTime.parse(date);
        logService.deleteLogsBefore(beforeDate);
    }

    // 记录日志
    @PostMapping
    public void log(@RequestBody SystemLog log) {
        logService.log(log.getLevel(), log.getMessage(), log.getSource());
    }
}
