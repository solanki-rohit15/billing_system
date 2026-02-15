package com.davv.billing.controller;

import com.davv.billing.dto.*;
import com.davv.billing.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/send-otp")
    public ResponseEntity<AuthResponse> sendOtp(@RequestBody OtpRequest request) {
        try {
            AuthResponse response = authService.sendOtp(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse();
            response.setSuccess(false);
            response.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        try {
            AuthResponse response = authService.verifyOtp(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            AuthResponse response = new AuthResponse();
            response.setSuccess(false);
            response.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
