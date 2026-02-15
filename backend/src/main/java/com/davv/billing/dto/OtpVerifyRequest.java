package com.davv.billing.dto;

import lombok.Data;

@Data
public class OtpVerifyRequest {
    private String uid;
    private String otp;
}
