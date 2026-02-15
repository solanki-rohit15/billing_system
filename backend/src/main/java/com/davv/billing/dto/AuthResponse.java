package com.davv.billing.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private boolean success;
    private String message;
    private FacultyResponse faculty;
}
