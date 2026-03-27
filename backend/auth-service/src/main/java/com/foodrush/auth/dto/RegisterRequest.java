package com.foodrush.auth.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data
public class RegisterRequest {
    @NotBlank(message = "Name is required") @Size(min=2, max=100) private String name;
    @NotBlank(message = "Email is required") @Email private String email;
    @NotBlank(message = "Password is required") @Size(min=8) private String password;
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone") private String phone;
    private String role = "USER";
}