package com.lingyue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateRoleRequest {
    
    @NotBlank(message = "Role name is required")
    @Size(min = 2, max = 20, message = "Role name must be between 2 and 20 characters")
    private String name;
    
    @Size(max = 500, message = "Avatar URL must not exceed 500 characters")
    private String avatar;
    
    private String gender;
    
    private String background;
    
    private String spiritRoot;
    
    private String origin;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBackground() {
        return background;
    }

    public void setBackground(String background) {
        this.background = background;
    }

    public String getSpiritRoot() {
        return spiritRoot;
    }

    public void setSpiritRoot(String spiritRoot) {
        this.spiritRoot = spiritRoot;
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }
}
