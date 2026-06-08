package com.example.lingyuexiantuserver.handler;

import com.example.lingyuexiantuserver.entity.SysUser;
import com.example.lingyuexiantuserver.exception.GlobalExceptionHandler;
import com.example.lingyuexiantuserver.repository.SysUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final SysUserRepository userRepository;

    // constructor injection since Lombok is unreliable
    public UserDetailsServiceImpl(SysUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SysUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalExceptionHandler.BusinessException(404, "用户不存在"));

        return User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole() == 1 ? "ADMIN" : "USER")
                .build();
    }
}
