package com.lingyue.controller;

import com.lingyuexiantu.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * 服务器管理控制器
 */
@RestController
@RequestMapping("/server")
public class ServerController {

    /**
     * 获取服务器列表
     */
    @GetMapping("/list")
    public Result<List<ServerInfo>> getServerList() {
        // 实际项目中，这些数据应该从数据库或配置文件中获取
        List<ServerInfo> servers = new ArrayList<>();
        servers.add(new ServerInfo(1, "万夫之勇", "online", "张福建", true, 1234));
        servers.add(new ServerInfo(2, "剑气纵横", "online", "李广东", false, 856));
        servers.add(new ServerInfo(3, "道法自然", "online", "王浙江", false, 642));
        servers.add(new ServerInfo(4, "仙风道骨", "maintenance", "赵北京", false, 0));
        
        return Result.success(servers);
    }

    /**
     * 服务器信息类
     */
    public static class ServerInfo {
        private int id;
        private String name;
        private String status;
        private String region;
        private boolean recommended;
        private int players;

        public ServerInfo(int id, String name, String status, String region, boolean recommended, int players) {
            this.id = id;
            this.name = name;
            this.status = status;
            this.region = region;
            this.recommended = recommended;
            this.players = players;
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getRegion() {
            return region;
        }

        public void setRegion(String region) {
            this.region = region;
        }

        public boolean isRecommended() {
            return recommended;
        }

        public void setRecommended(boolean recommended) {
            this.recommended = recommended;
        }

        public int getPlayers() {
            return players;
        }

        public void setPlayers(int players) {
            this.players = players;
        }
    }
}