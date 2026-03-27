package com.foodrush.auth.security;
import com.foodrush.auth.model.User;
import com.foodrush.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    @Override @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        var authorities = user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority(role.getName().name())).collect(Collectors.toList());
        return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
            .password(user.getPassword()).authorities(authorities)
            .accountLocked(user.getStatus() == User.UserStatus.BLOCKED)
            .disabled(user.getStatus() == User.UserStatus.INACTIVE).build();
    }
}