package com.davv.billing.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FacultyResponse {
    private String id;
    private String uid;
    private String name;
    private String email;
    private String phone;
    private Boolean isUgcNetQualified;
    private Boolean isVerified;
    private Boolean bankDetailsCompleted;
    private String designation;
    private String qualification;
    private String address;
    private String bankName;
    private String bankAccountNumber;
    private String ifscCode;
    private String panNumber;
    private String aadharNumber;
    private LocalDateTime createdAt;
}
