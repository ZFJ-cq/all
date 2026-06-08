package com.lingyue.service;

import com.lingyue.entity.Task;
import java.util.List;

public interface TaskService {
    List<Task> getAllTasks();
    Task getTaskById(Long id);
    Task createTask(Task task);
    Task updateTask(Long id, Task task);
    void deleteTask(Long id);
    List<Task> getTasksByType(Integer type);
    List<Task> getTasksByStatus(Integer status);
}
