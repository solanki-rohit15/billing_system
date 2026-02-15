package com.davv.billing.dto;

import lombok.Data;

// Faculty DTOs
@Data
public class FacultyRequest {
    private String uid;
    private String name;
    private String phone;
    private Boolean isUgcNetQualified;
}
