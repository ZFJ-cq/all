package com.lingyue.controller;

import com.lingyue.entity.Friend;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.GameUser;
import com.lingyue.repository.FriendRepository;
import com.lingyue.repository.GameRoleRepository;
import com.lingyue.repository.GameUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/friend")
@CrossOrigin(originPatterns = "*")
public class FriendController {
    
    private final FriendRepository friendRepository;
    private final GameUserRepository userRepository;
    private final GameRoleRepository roleRepository;
    
    public FriendController(FriendRepository friendRepository, GameUserRepository userRepository,
                          GameRoleRepository roleRepository) {
        this.friendRepository = friendRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    
    @GetMapping("/list/{userId}")
    public ResponseEntity<Map<String, Object>> getFriends(@PathVariable Long userId) {
        try {
            List<Friend> friends = friendRepository.findByUserIdAndStatus(userId, "accepted");
            List<Map<String, Object>> friendList = new ArrayList<>();
            
            for (Friend friend : friends) {
                GameUser friendUser = userRepository.findById(friend.getFriendId()).orElse(null);
                if (friendUser != null) {
                    Map<String, Object> friendInfo = new HashMap<>();
                    friendInfo.put("id", friend.getId());
                    friendInfo.put("friendId", friendUser.getId());
                    friendInfo.put("username", friendUser.getUsername());
                    friendInfo.put("nickname", friendUser.getNickname() != null ? friendUser.getNickname() : friendUser.getUsername());
                    friendInfo.put("remark", friend.getRemark());
                    friendInfo.put("status", "online");
                    friendInfo.put("lastTime", friend.getUpdateTime());
                    
                    List<GameRole> mainRoles = roleRepository.findByUserIdAndStatus(friendUser.getId(), 1);
                    GameRole mainRole = mainRoles != null && !mainRoles.isEmpty() ? mainRoles.get(0) : null;
                    if (mainRole != null) {
                        friendInfo.put("roleName", mainRole.getRoleName());
                        friendInfo.put("realm", mainRole.getRealm() != null ? mainRole.getRealm() : "未入门");
                        friendInfo.put("level", mainRole.getLevel() != null ? mainRole.getLevel() : 1);
                    }
                    
                    friendList.add(friendInfo);
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("friends", friendList);
            result.put("total", friendList.size());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/requests/{userId}")
    public ResponseEntity<Map<String, Object>> getFriendRequests(@PathVariable Long userId) {
        try {
            int pendingCount = friendRepository.countPendingRequests(userId);
            List<Friend> requests = friendRepository.findByUserIdAndStatus(userId, "pending");
            List<Map<String, Object>> requestList = new ArrayList<>();
            
            for (Friend request : requests) {
                GameUser requestUser = userRepository.findById(request.getUserId()).orElse(null);
                if (requestUser != null) {
                    Map<String, Object> requestInfo = new HashMap<>();
                    requestInfo.put("id", request.getId());
                    requestInfo.put("userId", requestUser.getId());
                    requestInfo.put("username", requestUser.getUsername());
                    requestInfo.put("nickname", requestUser.getNickname() != null ? requestUser.getNickname() : requestUser.getUsername());
                    requestInfo.put("createTime", request.getCreateTime());
                    
                    List<GameRole> mainRoles = roleRepository.findByUserIdAndStatus(requestUser.getId(), 1);
                    GameRole mainRole = mainRoles != null && !mainRoles.isEmpty() ? mainRoles.get(0) : null;
                    if (mainRole != null) {
                        requestInfo.put("roleName", mainRole.getRoleName());
                        requestInfo.put("realm", mainRole.getRealm() != null ? mainRole.getRealm() : "未入门");
                        requestInfo.put("level", mainRole.getLevel() != null ? mainRole.getLevel() : 1);
                    }
                    
                    requestList.add(requestInfo);
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("requests", requestList);
            result.put("count", pendingCount);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addFriend(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            Long friendId = Long.parseLong(request.get("friendId").toString());
            
            if (userId.equals(friendId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "不能添加自己为好友"));
            }
            
            if (friendRepository.existsByUserIdAndFriendIdAndStatus(userId, friendId, "accepted")) {
                return ResponseEntity.badRequest().body(Map.of("message", "对方已经是您的好友"));
            }
            
            if (friendRepository.existsByUserIdAndFriendIdAndStatus(friendId, userId, "accepted")) {
                return ResponseEntity.badRequest().body(Map.of("message", "对方已经是您的好友"));
            }
            
            Friend friend = new Friend();
            friend.setUserId(userId);
            friend.setFriendId(friendId);
            friend.setStatus("pending");
            friendRepository.save(friend);
            
            return ResponseEntity.ok(Map.of("message", "好友申请已发送", "success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "操作失败: " + e.getMessage()));
        }
    }
    
    @PostMapping("/accept")
    public ResponseEntity<Map<String, Object>> acceptFriend(@RequestBody Map<String, Object> request) {
        try {
            Long requestId = Long.parseLong(request.get("requestId").toString());
            Long userId = Long.parseLong(request.get("userId").toString());
            
            Friend friendRequest = friendRepository.findById(requestId).orElse(null);
            if (friendRequest == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "请求不存在"));
            }
            
            friendRequest.setStatus("accepted");
            friendRepository.save(friendRequest);
            
            Friend reverseFriend = new Friend();
            reverseFriend.setUserId(userId);
            reverseFriend.setFriendId(friendRequest.getUserId());
            reverseFriend.setStatus("accepted");
            friendRepository.save(reverseFriend);
            
            return ResponseEntity.ok(Map.of("message", "已成为好友", "success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "操作失败: " + e.getMessage()));
        }
    }
    
    @PostMapping("/reject")
    public ResponseEntity<Map<String, Object>> rejectFriend(@RequestBody Map<String, Object> request) {
        try {
            Long requestId = Long.parseLong(request.get("requestId").toString());
            
            friendRepository.deleteById(requestId);
            
            return ResponseEntity.ok(Map.of("message", "已拒绝", "success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "操作失败: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{friendId}")
    public ResponseEntity<Map<String, Object>> deleteFriend(@PathVariable Long friendId,
                                                            @RequestParam Long userId) {
        try {
            Friend friend = friendRepository.findByUserIdAndFriendId(userId, friendId);
            if (friend != null) {
                friendRepository.delete(friend);
            }
            
            Friend reverseFriend = friendRepository.findByUserIdAndFriendId(friendId, userId);
            if (reverseFriend != null) {
                friendRepository.delete(reverseFriend);
            }
            
            return ResponseEntity.ok(Map.of("message", "已删除好友", "success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "操作失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchUsers(@RequestParam String keyword,
                                                          @RequestParam Long userId) {
        try {
            List<GameUser> users = userRepository.findAll();
            List<Map<String, Object>> searchResults = new ArrayList<>();
            
            for (GameUser user : users) {
                if (user.getId().equals(userId)) continue;
                
                String username = user.getUsername() != null ? user.getUsername() : "";
                String nickname = user.getNickname() != null ? user.getNickname() : "";
                
                if (username.contains(keyword) || nickname.contains(keyword)) {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("userId", user.getId());
                    userInfo.put("username", user.getUsername());
                    userInfo.put("nickname", user.getNickname() != null ? user.getNickname() : user.getUsername());
                    
                    List<GameRole> mainRoles = roleRepository.findByUserIdAndStatus(user.getId(), 1);
                    GameRole mainRole = mainRoles != null && !mainRoles.isEmpty() ? mainRoles.get(0) : null;
                    if (mainRole != null) {
                        userInfo.put("roleName", mainRole.getRoleName());
                        userInfo.put("realm", mainRole.getRealm() != null ? mainRole.getRealm() : "未入门");
                        userInfo.put("level", mainRole.getLevel() != null ? mainRole.getLevel() : 1);
                    }
                    
                    boolean isFriend = friendRepository.existsByUserIdAndFriendIdAndStatus(userId, user.getId(), "accepted");
                    userInfo.put("isFriend", isFriend);
                    
                    searchResults.add(userInfo);
                }
            }
            
            return ResponseEntity.ok(Map.of("results", searchResults, "total", searchResults.size()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
