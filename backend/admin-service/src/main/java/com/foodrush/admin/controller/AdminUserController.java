package com.foodrush.admin.controller;

import com.foodrush.admin.dto.*;
import com.foodrush.admin.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    // GET all users with optional search & pagination
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<UserDTO>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success("Users fetched",
                adminUserService.getAllUsers(page, size, search)));
    }

    // GET users by role
    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<PagedResponse<UserDTO>>> getUsersByRole(
            @PathVariable String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Users fetched",
                adminUserService.getUsersByRole(role, page, size)));
    }

//    // GET banned users
//    @GetMapping("/banned")
//    public ResponseEntity<ApiResponse<PagedResponse<UserDTO>>> getBannedUsers(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "20") int size) {
//        return ResponseEntity.ok(ApiResponse.success("Banned users fetched",
//                adminUserService.getBannedUsers(page, size)));
//    }

    // GET user by id
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User fetched",
                adminUserService.getUserById(id)));
    }

    // PUT assign single role (replaces existing roles)
    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserDTO>> assignRole(
            @PathVariable Long id,
            @Valid @RequestBody AssignRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Role assigned",
                adminUserService.assignRole(id, request)));
    }

    // POST add role without removing existing ones
    @PostMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserDTO>> addRole(
            @PathVariable Long id,
            @Valid @RequestBody AssignRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Role added",
                adminUserService.addRole(id, request)));
    }

    // DELETE remove specific role from user
    @DeleteMapping("/{id}/role/{roleName}")
    public ResponseEntity<ApiResponse<UserDTO>> removeRole(
            @PathVariable Long id,
            @PathVariable String roleName) {
        return ResponseEntity.ok(ApiResponse.success("Role removed",
                adminUserService.removeRole(id, roleName)));
    }

    // PUT update user status (ACTIVE, INACTIVE, BLOCKED, PENDING_VERIFICATION)
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserDTO>> updateStatus(
            @PathVariable Long id,
            @RequestBody BanUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                adminUserService.updateUserStatus(id, request)));
    }

    // DELETE user permanently
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }
}
